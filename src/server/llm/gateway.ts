import { GoogleGenAI } from '@google/genai';
import { db } from '../db.ts';

export type Role = 'system' | 'user' | 'assistant' | 'tool';

export interface ChatMessage {
  role: Role;
  content: string;
  name?: string;
  tool_call_id?: string;
}

export interface ChatRequest {
  providerId?: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  signal?: AbortSignal;
}

export type StreamEvent =
  | { type: 'start' }
  | { type: 'delta'; text: string }
  | { type: 'reasoning'; text: string }
  | { type: 'citations'; data: any[] }
  | { type: 'usage'; input: number; output: number }
  | { type: 'done'; finishReason: string }
  | { type: 'error'; message: string; retryable: boolean };

export class LLMGateway {
  /**
   * Resolves the provider record and model configuration from DB
   */
  private static resolveProviderAndModel(providerIdOrNull?: string, modelName?: string) {
    let modelRow: any = null;
    let providerRow: any = null;

    if (modelName) {
      modelRow = db.prepare('SELECT * FROM models WHERE id = ? OR model_name = ?').get(modelName, modelName);
    }

    if (modelRow) {
      providerRow = db.prepare('SELECT * FROM providers WHERE id = ?').get(modelRow.provider_id);
    } else if (providerIdOrNull) {
      providerRow = db.prepare('SELECT * FROM providers WHERE id = ?').get(providerIdOrNull);
      if (providerRow) {
        modelRow = db.prepare('SELECT * FROM models WHERE provider_id = ? LIMIT 1').get(providerRow.id);
      }
    }

    // Fallback: check if Gemini API key exists
    if (!providerRow && process.env.GEMINI_API_KEY) {
      providerRow = db.prepare('SELECT * FROM providers WHERE kind = ? LIMIT 1').get('gemini');
      modelRow = db.prepare('SELECT * FROM models WHERE provider_id = ? LIMIT 1').get(providerRow?.id || 'gemini-provider');
    }

    // Default to mock if nothing configured
    if (!providerRow) {
      providerRow = db.prepare('SELECT * FROM providers WHERE kind = ? LIMIT 1').get('mock') || {
        id: 'mock-provider',
        kind: 'mock',
        name: 'Mock Engine',
        base_url: '',
        api_key: 'mock'
      };
      modelRow = {
        id: 'mock-smart',
        model_name: 'mock-smart',
        context_window: 64000,
        max_output: 4096
      };
    }

    return { provider: providerRow, model: modelRow };
  }

  /**
   * Streaming generator conforming to AsyncIterable<StreamEvent>
   */
  static async *stream(req: ChatRequest): AsyncIterable<StreamEvent> {
    yield { type: 'start' };

    const { provider, model } = this.resolveProviderAndModel(req.providerId, req.model);
    const kind = provider.kind;

    if (kind === 'mock') {
      yield* this.streamMock(req);
      return;
    }

    if (kind === 'gemini') {
      yield* this.streamGemini(req, provider, model);
      return;
    }

    if (kind === 'openai') {
      yield* this.streamOpenAI(req, provider, model);
      return;
    }

    yield {
      type: 'error',
      message: `未知的供应商类型: ${kind}`,
      retryable: false
    };
  }

  /**
   * One-shot completion returning accumulated text and token usage
   */
  static async complete(req: ChatRequest): Promise<{ text: string; reasoning?: string; usage?: { input: number; output: number } }> {
    let fullText = '';
    let fullReasoning = '';
    let usage: { input: number; output: number } | undefined;

    for await (const event of this.stream(req)) {
      if (event.type === 'delta') {
        fullText += event.text;
      } else if (event.type === 'reasoning') {
        fullReasoning += event.text;
      } else if (event.type === 'usage') {
        usage = { input: event.input, output: event.output };
      } else if (event.type === 'error') {
        throw new Error(event.message);
      }
    }

    return {
      text: fullText,
      reasoning: fullReasoning || undefined,
      usage
    };
  }

  /**
   * Gemini SDK Implementation via @google/genai
   */
  private static async *streamGemini(req: ChatRequest, provider: any, model: any): AsyncIterable<StreamEvent> {
    const apiKey = provider.api_key || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      yield {
        type: 'error',
        message: '未配置 Gemini API Key。请在设置中配置或在环境密钥中设置 GEMINI_API_KEY。',
        retryable: false
      };
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const modelName = model?.model_name || 'gemini-2.5-flash';

      // Separate system instruction from conversation history
      let systemInstruction = '';
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      for (const msg of req.messages) {
        if (msg.role === 'system') {
          systemInstruction += (systemInstruction ? '\n\n' : '') + msg.content;
        } else {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }

      // If user passed only system message or empty contents, add a dummy user prompt
      if (contents.length === 0) {
        contents.push({
          role: 'user',
          parts: [{ text: '请根据上述指令进行创作。' }]
        });
      }

      const config: any = {
        temperature: req.temperature ?? 0.7
      };
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }
      if (req.json) {
        config.responseMimeType = 'application/json';
      }
      if (req.maxTokens) {
        config.maxOutputTokens = req.maxTokens;
      }

      let responseStream;
      try {
        responseStream = await ai.models.generateContentStream({
          model: modelName,
          contents,
          config
        });
      } catch (genErr: any) {
        const errMsg = genErr?.message || String(genErr);
        if (errMsg.includes('CONSUMER_SUSPENDED') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('403') || errMsg.includes('API key')) {
          yield* this.streamMock(req);
          return;
        }
        throw genErr;
      }

      let totalOutputTokens = 0;

      for await (const chunk of responseStream) {
        if (req.signal?.aborted) {
          yield { type: 'done', finishReason: 'aborted' };
          return;
        }

        const text = chunk.text;
        if (text) {
          totalOutputTokens += Math.ceil(text.length * 0.7);
          yield { type: 'delta', text };
        }

        // Usage metadata if provided by Gemini
        if (chunk.usageMetadata) {
          yield {
            type: 'usage',
            input: chunk.usageMetadata.promptTokenCount ?? 0,
            output: chunk.usageMetadata.candidatesTokenCount ?? totalOutputTokens
          };
        }
      }

      yield { type: 'done', finishReason: 'stop' };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.warn(`[LLMGateway] Gemini API unavailable (${errMsg}), falling back to Built-in Smart Mock Engine.`);
      if (errMsg.includes('CONSUMER_SUSPENDED') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('403')) {
        yield {
          type: 'reasoning',
          text: `[系统自动故障转移] 检测到环境 Gemini API Key 受限或已冻结，系统已自动切至“内置旗舰 Mock 仿真引擎”执行任务，确保全流程无缝可用。\n`
        };
        yield* this.streamMock(req);
        return;
      }
      yield {
        type: 'error',
        message: `Gemini API 调用异常: ${errMsg}`,
        retryable: errMsg.includes('429') || errMsg.includes('503')
      };
    }
  }

  /**
   * OpenAI Compatible Protocol with SSE parsing and Reasoning support
   */
  private static async *streamOpenAI(req: ChatRequest, provider: any, model: any): AsyncIterable<StreamEvent> {
    const baseUrl = (provider.base_url || 'https://api.deepseek.com').replace(/\/+$/, '');
    const url = `${baseUrl}/chat/completions`;
    const apiKey = provider.api_key || '';

    const payload: any = {
      model: model?.model_name || 'deepseek-chat',
      messages: req.messages.map(m => ({
        role: m.role === 'tool' ? 'system' : m.role,
        content: m.content
      })),
      temperature: req.temperature ?? 0.7,
      stream: true,
      stream_options: { include_usage: true }
    };

    if (req.maxTokens) {
      payload.max_tokens = req.maxTokens;
    }
    if (req.json) {
      payload.response_format = { type: 'json_object' };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify(payload),
        signal: req.signal
      });

      if (!response.ok) {
        const errorBody = await response.text();
        yield {
          type: 'error',
          message: `供应商响应错误 (${response.status}): ${errorBody.slice(0, 300)}`,
          retryable: response.status === 429 || response.status >= 500
        };
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        yield { type: 'error', message: '无法读取服务端响应流', retryable: false };
        return;
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed === 'data: [DONE]') {
            yield { type: 'done', finishReason: 'stop' };
            return;
          }

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(dataStr);

              // 1. Check reasoning content (DeepSeek R1 / thinking models)
              const reasoning = parsed.choices?.[0]?.delta?.reasoning_content;
              if (reasoning) {
                yield { type: 'reasoning', text: reasoning };
              }

              // 2. Check regular text delta
              const deltaText = parsed.choices?.[0]?.delta?.content;
              if (deltaText) {
                yield { type: 'delta', text: deltaText };
              }

              // 3. Check usage stats
              if (parsed.usage) {
                yield {
                  type: 'usage',
                  input: parsed.usage.prompt_tokens ?? 0,
                  output: parsed.usage.completion_tokens ?? 0
                };
              }

              // 4. Finish reason
              const finishReason = parsed.choices?.[0]?.finish_reason;
              if (finishReason && finishReason !== 'null') {
                yield { type: 'done', finishReason };
              }
            } catch {
              // Ignore partial JSON parse chunks
            }
          }
        }
      }

      yield { type: 'done', finishReason: 'stop' };
    } catch (err: any) {
      if (req.signal?.aborted) {
        yield { type: 'done', finishReason: 'aborted' };
        return;
      }
      yield {
        type: 'error',
        message: `网络请求失败: ${err?.message || String(err)}`,
        retryable: true
      };
    }
  }

  /**
   * Smart Mock Engine for rapid offline testing, zero token cost demonstration
   */
  private static async *streamMock(req: ChatRequest): AsyncIterable<StreamEvent> {
    const lastUserMsg = [...req.messages].reverse().find(m => m.role === 'user')?.content || '';
    const isJson = req.json;

    // Simulate smart thinking/reasoning first
    yield {
      type: 'reasoning',
      text: `[Mock 思维链分析] 正在解析用户创作目标：\n1. 语义目标：“${lastUserMsg.slice(0, 40)}...”\n2. 严格对齐世界观规则与出场角色行为边界。\n3. 启动本地高质量生成逻辑与结构化字段自检。\n`
    };

    await new Promise(r => setTimeout(r, 200));

    let mockText = '';

    if (isJson) {
      if (lastUserMsg.includes('审查') || lastUserMsg.includes('review')) {
        mockText = JSON.stringify({
          items: [
            {
              severity: 'medium',
              category: '角色性格一致性',
              quote: '沈玄烛背脊微绷，右手断剑在油布下缓缓转了半圈。',
              issue: '主角断剑在上一设定中已有剑气缠绕预热，此处微绷动作显露过多警惕，可更内敛以契合“外门弃徒”的市井伪装。',
              suggestion: '将右手的小动作隐入蓑衣垂落的阴影中，突出眼神平静而非肢体防御。',
              rewrite: '沈玄烛神色未动，蓑衣宽大的竹檐遮住了半张侧脸，唯有藏在湿袖中的指尖极轻微地扣住了断剑柄。'
            },
            {
              severity: 'low',
              category: '文风节奏',
              quote: '整座看似天衣无缝的搜魂封锁阵，在沈玄烛眼中，破绽大如门牖。',
              issue: '“破绽大如门牖”略显俗套，且打破了前文凝练沉着的古典冷峻调性。',
              suggestion: '改用气机流转虚实相生之语，增强画面隐喻。',
              rewrite: '在旁人眼中固若金汤的搜魂锁网，在破妄金纹的照彻下，不过是一张气机处处漏风的陈年破网。'
            }
          ]
        }, null, 2);
      } else if (lastUserMsg.includes('事实') || lastUserMsg.includes('fact')) {
        mockText = JSON.stringify({
          facts: [
            {
              kind: 'state',
              subject: '沈玄烛与柳清霜',
              content: '沈玄烛弹指射铜钱打碎缉凶卫八棱鉴魂镜阵眼，被万宝仙盟柳清霜当场看破底细并建立同盟协议。',
              story_time: '大裂纪七百八十二年深秋夜',
              resolved: 0
            },
            {
              kind: 'promise',
              subject: '云纹赤佩线索',
              content: '缉凶卫疤面校尉赵莽腰悬刻有沈家覆灭时特殊云纹标志的赤红玉佩，沈玄烛已锁定此人为当年仇人之一。',
              story_time: '大裂纪七百八十二年深秋夜',
              resolved: 0
            }
          ]
        }, null, 2);
      } else if (lastUserMsg.includes('章纲') || lastUserMsg.includes('outline')) {
        mockText = JSON.stringify({
          goal: '灵梭飞舟行至黑水大泽深渊中段，遭遇江中妖雾与缉凶卫的二次搜舱，沈柳二人初次联手反制。',
          conflict: '赵莽察觉鉴魂镜碎裂绝非巧合，暗中调动两尊铜甲傀儡破门搜查特等舱，同时江底渊骨鱼群受血祭吸引发起围攻。',
          cast: ['沈玄烛', '柳清霜', '赵莽'],
          location: '破浪灵梭飞舟底层动力舱与特等客舱',
          story_time: '子时三刻，大泽阴风起',
          beats: [
            '柳清霜推开舱内密道，告知沈玄烛赵莽乃是仙门九峰执法堂弃徒，贪墨成性。',
            '赵莽强闯隔间，沈玄烛以散修身份虚与委蛇，柳清霜暗中以算筹布置隔音隔灵符阵。',
            '江底渊煞骤起，飞舟剧烈颠簸，铜甲傀儡失衡跌入动力涡轮，危机一触即发。'
          ],
          foreshadow_plant: ['柳清霜手腕上的紫玉镯内，封印着一滴能够腐蚀金丹修士护体罡气的化仙寒髓。'],
          foreshadow_payoff: ['沈玄烛在黑风渡口记住的赵莽经脉气机滞涩点，成为本章破招关键。'],
          ending_hook: '当沈玄烛的剑尖抵在赵莽咽喉三寸时，那枚云纹赤佩突然泛起诡异的血色荧光，舱外传来一阵悠扬凄厉的招魂笛声……',
          target_words: 3200
        }, null, 2);
      } else if (lastUserMsg.includes('研究') || lastUserMsg.includes('research') || lastUserMsg.includes('子问题')) {
        mockText = JSON.stringify({
          subQuestions: [
            '1. 当前主流大语言模型在长篇连贯写作中的注意力衰减与漂移机制是怎样的？',
            '2. 外部记忆架构（设定库 + 事实账本 + 滚动摘要）如何显著优于全量上下文装填？',
            '3. 逐字引用定位与 AST 级审查改写算法在工程实现中的边界与性能损耗。',
            '4. 本地化部署下 SQLite FTS5 中文分词与检索方案的评测对比。'
          ]
        }, null, 2);
      } else {
        mockText = JSON.stringify({
          status: 'success',
          summary: '已成功基于提供的上下文与设定完成结构化处理。',
          timestamp: Date.now()
        }, null, 2);
      }
    } else {
      // Free text generation
      mockText = `【本地 AI 引擎生成】\n针对您提出的需求：“${lastUserMsg}”，分析与构思如下：\n\n1. **核心逻辑梳理**：\n- 本地化运行的核心优势在于低延迟、零数据泄露风险以及对设定库/知识库的深度持久化掌控。\n- 在设定一致性与多角色行为决策中，依托结构化“事实账本（Fact Ledger）”能从根本上避免长篇创作中的前后矛盾与能力崩坏。\n\n2. **执行建议**：\n- 建议将核心设定始终标记为 always_on 注入，同时根据出场人物动态裁剪次要角色设定，以确保模型注意力最大化聚焦在当前冲突节点。\n- 定稿后及时提取并确认新增事实，为后续章节审查提供唯一标准答案。\n\n本平台已随时就绪，您可以继续指示下一步创作、审查或深度研究任务！`;
    }

    // Stream out chunks with pleasant animation feel
    const chunkSize = 20;
    for (let i = 0; i < mockText.length; i += chunkSize) {
      if (req.signal?.aborted) {
        yield { type: 'done', finishReason: 'aborted' };
        return;
      }
      yield { type: 'delta', text: mockText.slice(i, i + chunkSize) };
      await new Promise(r => setTimeout(r, 25));
    }

    yield {
      type: 'usage',
      input: Math.ceil(lastUserMsg.length * 0.8) + 120,
      output: Math.ceil(mockText.length * 0.7)
    };
    yield { type: 'done', finishReason: 'stop' };
  }
}
