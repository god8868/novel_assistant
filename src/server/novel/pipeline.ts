import { db } from '../db.ts';
import { LLMGateway } from '../llm/gateway.ts';
import { estimateTokens } from '../llm/contextEngine.ts';
import { z } from 'zod';

export interface InjectionItem {
  id: string;
  type: 'style' | 'always_on' | 'cast' | 'keyword' | 'fact_promise' | 'prev_summary';
  name: string;
  category: string;
  priority: number;
  tokens: number;
  preview: string;
  selected: boolean;
}

export interface InjectionPlanResult {
  injectedPrompt: string;
  items: InjectionItem[];
  totalTokens: number;
  budgetTokens: number;
}

// Zod schemas for structured responses
const ReviewItemSchema = z.object({
  severity: z.enum(['high', 'medium', 'low']),
  category: z.string(),
  quote: z.string(),
  issue: z.string(),
  suggestion: z.string(),
  rewrite: z.string().optional()
});

const ReviewResultSchema = z.object({
  items: z.array(ReviewItemSchema)
});

const FactItemSchema = z.object({
  kind: z.enum(['event', 'state', 'relation', 'item', 'timeline', 'promise']),
  subject: z.string(),
  content: z.string(),
  story_time: z.string().optional(),
  resolved: z.number().default(0)
});

const FactResultSchema = z.object({
  facts: z.array(FactItemSchema)
});

export class NovelPipeline {
  /**
   * 7.4 Context Injection Engine (设定库注入策略)
   */
  static buildInjectionPlan(novelId: string, chapterId: string, budgetTokens = 6000): InjectionPlanResult {
    const novel: any = db.prepare('SELECT * FROM novels WHERE id = ?').get(novelId);
    if (!novel) throw new Error('小说不存在');

    const chapter: any = db.prepare('SELECT * FROM chapters WHERE id = ?').get(chapterId);
    const outline: any = chapter?.outline_id
      ? db.prepare('SELECT * FROM outlines WHERE id = ?').get(chapter.outline_id)
      : null;

    let outlineData: any = {};
    if (outline?.body) {
      try {
        outlineData = JSON.parse(outline.body);
      } catch {
        outlineData = { goal: outline.body };
      }
    }

    // Previous chapter text and summary
    const prevChapter: any = db.prepare(
      'SELECT * FROM chapters WHERE novel_id = ? AND seq < ? ORDER BY seq DESC LIMIT 1'
    ).get(novelId, chapter?.seq || 9999);

    let prevEnding = '';
    if (prevChapter?.current_version_id) {
      const prevVer: any = db.prepare('SELECT content FROM chapter_versions WHERE id = ?').get(prevChapter.current_version_id);
      if (prevVer?.content) {
        prevEnding = prevVer.content.slice(-500);
      }
    }

    const triggerText = `${outlineData.goal || ''} ${outlineData.conflict || ''} ${(outlineData.beats || []).join(' ')} ${prevEnding}`;

    const items: InjectionItem[] = [];

    // 1. Style Guide (Always On)
    if (novel.style_guide) {
      const tok = estimateTokens(novel.style_guide);
      items.push({
        id: 'style_guide',
        type: 'style',
        name: '全书文风准则',
        category: '文风',
        priority: 10,
        tokens: tok,
        preview: novel.style_guide.slice(0, 80) + '...',
        selected: true
      });
    }

    // 2. Always-on Lore Entries (era, rules)
    const alwaysOnLores: any[] = db.prepare(
      'SELECT * FROM lore_entries WHERE novel_id = ? AND always_on = 1 ORDER BY priority DESC'
    ).all(novelId);

    for (const lore of alwaysOnLores) {
      const tok = estimateTokens(lore.content);
      items.push({
        id: lore.id,
        type: 'always_on',
        name: `${lore.name} (${lore.type})`,
        category: '常驻核心设定',
        priority: lore.priority || 9,
        tokens: tok,
        preview: lore.content.slice(0, 80) + '...',
        selected: true
      });
    }

    // 3. Cast (Characters in outline)
    const castNames: string[] = outlineData.cast || [];
    const allCharacters: any[] = db.prepare('SELECT * FROM characters WHERE novel_id = ?').all(novelId);

    for (const char of allCharacters) {
      const isCast = castNames.some(c => char.name.includes(c) || c.includes(char.name));
      if (isCast) {
        let charProfileText = '';
        try {
          const prof = JSON.parse(char.profile);
          charProfileText = `性格:${(prof.personality || []).join('、')} | 动机:${prof.motivation || ''} | 说话风格:${char.voice || prof.speech_style || ''}`;
        } catch {
          charProfileText = char.profile;
        }

        const tok = estimateTokens(charProfileText);
        items.push({
          id: char.id,
          type: 'cast',
          name: `${char.name} [出场人物卡]`,
          category: '出场人物',
          priority: 9,
          tokens: tok,
          preview: charProfileText.slice(0, 80) + '...',
          selected: true
        });
      }
    }

    // 4. Keyword / Triggered Lore Entries
    const otherLores: any[] = db.prepare(
      'SELECT * FROM lore_entries WHERE novel_id = ? AND always_on = 0 ORDER BY priority DESC'
    ).all(novelId);

    for (const lore of otherLores) {
      let triggered = false;
      if (triggerText.includes(lore.name)) triggered = true;

      if (!triggered && lore.keywords) {
        try {
          const kws: string[] = JSON.parse(lore.keywords);
          if (kws.some(k => triggerText.includes(k))) triggered = true;
        } catch {}
      }

      if (triggered) {
        const tok = estimateTokens(lore.content);
        items.push({
          id: lore.id,
          type: 'keyword',
          name: `${lore.name} (命中关键词)`,
          category: '动态触发设定',
          priority: lore.priority || 5,
          tokens: tok,
          preview: lore.content.slice(0, 80) + '...',
          selected: true
        });
      }
    }

    // 5. Unresolved Foreshadowing Promises
    const unresolvedPromises: any[] = db.prepare(
      `SELECT * FROM facts WHERE novel_id = ? AND kind = 'promise' AND resolved = 0 LIMIT 5`
    ).all(novelId);

    for (const promise of unresolvedPromises) {
      const tok = estimateTokens(promise.content);
      items.push({
        id: promise.id,
        type: 'fact_promise',
        name: `伏笔待回收: ${promise.subject}`,
        category: '未回收伏笔',
        priority: 7,
        tokens: tok,
        preview: promise.content.slice(0, 80) + '...',
        selected: true
      });
    }

    // 6. Previous Chapter Summary
    if (prevChapter?.summary) {
      const tok = estimateTokens(prevChapter.summary);
      items.push({
        id: `prev-sum-${prevChapter.id}`,
        type: 'prev_summary',
        name: `上一章剧情提要 (第${prevChapter.seq}章)`,
        category: '剧情回顾',
        priority: 8,
        tokens: tok,
        preview: prevChapter.summary.slice(0, 80) + '...',
        selected: true
      });
    }

    // Budget check & pruning lower priority items if budget exceeded
    let currentTokens = 0;
    for (const item of items) {
      currentTokens += item.tokens;
    }

    if (currentTokens > budgetTokens) {
      // Sort candidates by priority ascending to prune lowest first
      const prunable = [...items].filter(i => i.type !== 'style' && i.type !== 'cast');
      prunable.sort((a, b) => a.priority - b.priority);

      for (const p of prunable) {
        if (currentTokens <= budgetTokens) break;
        p.selected = false;
        currentTokens -= p.tokens;
      }
    }

    // Build assembled prompt
    const promptParts: string[] = [];

    const selectedStyle = items.find(i => i.type === 'style' && i.selected);
    if (selectedStyle && novel.style_guide) {
      promptParts.push(`【全书文风准则】\n${novel.style_guide}`);
    }

    const selectedAlwaysOn = items.filter(i => i.type === 'always_on' && i.selected);
    if (selectedAlwaysOn.length > 0) {
      promptParts.push(
        `【核心世界观与规则】\n` +
          selectedAlwaysOn.map(i => {
            const raw: any = db.prepare('SELECT content FROM lore_entries WHERE id = ?').get(i.id);
            return `• ${i.name}: ${raw?.content || i.preview}`;
          }).join('\n')
      );
    }

    const selectedCast = items.filter(i => i.type === 'cast' && i.selected);
    if (selectedCast.length > 0) {
      promptParts.push(
        `【出场人物档案】\n` +
          selectedCast.map(i => {
            const raw: any = db.prepare('SELECT * FROM characters WHERE id = ?').get(i.id);
            return `• ${raw?.name || i.name}:\n  ${raw?.profile || i.preview}\n  台词语气示例: ${raw?.voice || '沉稳'}`;
          }).join('\n\n')
      );
    }

    const selectedKeywords = items.filter(i => i.type === 'keyword' && i.selected);
    if (selectedKeywords.length > 0) {
      promptParts.push(
        `【本章关联设定】\n` +
          selectedKeywords.map(i => {
            const raw: any = db.prepare('SELECT content FROM lore_entries WHERE id = ?').get(i.id);
            return `• ${i.name}: ${raw?.content || i.preview}`;
          }).join('\n')
      );
    }

    const selectedPromises = items.filter(i => i.type === 'fact_promise' && i.selected);
    if (selectedPromises.length > 0) {
      promptParts.push(
        `【待注意回收或照应的伏笔】\n` +
          selectedPromises.map(i => `• [伏笔] ${i.name}: ${i.preview}`).join('\n')
      );
    }

    const selectedPrevSum = items.find(i => i.type === 'prev_summary' && i.selected);
    if (selectedPrevSum && prevChapter?.summary) {
      promptParts.push(`【前情回顾】\n${prevChapter.summary}`);
    }

    return {
      injectedPrompt: promptParts.join('\n\n'),
      items,
      totalTokens: currentTokens,
      budgetTokens
    };
  }

  /**
   * 7.7 AI Review System (consistency, logic, pacing, style)
   */
  static async runReview(
    novelId: string,
    chapterId: string,
    versionId: string,
    kind: 'consistency' | 'logic' | 'pacing' | 'style',
    modelId?: string
  ) {
    const version: any = db.prepare('SELECT * FROM chapter_versions WHERE id = ?').get(versionId);
    if (!version) throw new Error('章节版本不存在');

    const chapter: any = db.prepare('SELECT * FROM chapters WHERE id = ?').get(chapterId);
    const novel: any = db.prepare('SELECT * FROM novels WHERE id = ?').get(novelId);
    const outline: any = chapter?.outline_id
      ? db.prepare('SELECT * FROM outlines WHERE id = ?').get(chapter.outline_id)
      : null;

    // Load injection context
    const plan = this.buildInjectionPlan(novelId, chapterId, 4000);

    let specificReviewPrompt = '';
    switch (kind) {
      case 'consistency':
        specificReviewPrompt = `你是一名严苛的设定一致性总监。请审查章节正文是否违背了出场人物性格、能力边界、称呼习惯、世界观规则或已确认事实。`;
        break;
      case 'logic':
        specificReviewPrompt = `你是一名剧情逻辑总监。请审查情节因果关系、行动动机是否充分、章纲情节点是否落实、是否存在生硬转折或伏笔漏洞。`;
        break;
      case 'pacing':
        specificReviewPrompt = `你是一名网文节奏主编。请审查本章起承转合、信息堆砌与情绪张弛、结尾钩子强度是否足够吸引读者翻页。`;
        break;
      case 'style':
        specificReviewPrompt = `你是一名文学润色专家。请审查是否有现代词汇出戏、重复套话、过度解释心理、流水账描写或“AI腔总结”。`;
        break;
    }

    const systemPrompt = `${specificReviewPrompt}
严格输出 JSON 对象格式：
{
  "items": [
    {
      "severity": "high" | "medium" | "low",
      "category": "分类说明",
      "quote": "必须是正文中能够完整匹配的连续原句子，绝对不能改动任何一个字",
      "issue": "指出具体问题",
      "suggestion": "具体修改建议",
      "rewrite": "建议替换的改写正文片段"
    }
  ]
}
注意：若本章质量极高无明显缺陷，items 数组可返回 1~2 条优化建议或返回空数组。严禁输出任何 JSON 之外的 markdown 代码块包裹标记。`;

    const userPrompt = `【设定与背景】\n${plan.injectedPrompt}\n\n【本章章纲】\n${outline?.body || '无特别纲要'}\n\n【待审查章节正文】\n${version.content}`;

    const effectiveModel = modelId || ((db.prepare("SELECT model_id FROM model_roles WHERE role = 'novel_review'").get() as any)?.model_id as string) || 'mock-smart';

    const resp = await LLMGateway.complete({
      model: effectiveModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      json: true,
      temperature: 0.3
    });

    let parsedResult: any = { items: [] };
    try {
      let cleanText = resp.text.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
      if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
      parsedResult = JSON.parse(cleanText);
    } catch {
      // Auto-repair JSON fallback
      try {
        const repairPrompt = `请修复以下损坏的 JSON 并原样输出合法的 JSON 对象，不要添加任何额外解释：\n${resp.text}`;
        const repairResp = await LLMGateway.complete({
          model: effectiveModel,
          messages: [{ role: 'user', content: repairPrompt }],
          json: true
        });
        parsedResult = JSON.parse(repairResp.text);
      } catch {
        parsedResult = { items: [] };
      }
    }

    // Save review record
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    db.prepare(`
      INSERT INTO reviews (id, novel_id, chapter_id, version_id, kind, model_id, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'done', ?)
    `).run(reviewId, novelId, chapterId, versionId, kind, effectiveModel, Date.now());

    const items = parsedResult.items || [];
    const savedItems: any[] = [];

    for (const item of items) {
      const quote = item.quote || '';
      let startOffset: number | null = null;
      let endOffset: number | null = null;

      // 7.7 Exact quote locator in chapter text
      if (quote && version.content.includes(quote)) {
        startOffset = version.content.indexOf(quote);
        endOffset = startOffset + quote.length;
      }

      const itemId = `revi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      db.prepare(`
        INSERT INTO review_items (id, review_id, severity, category, quote, start_offset, end_offset, issue, suggestion, rewrite, state)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
      `).run(
        itemId,
        reviewId,
        item.severity || 'medium',
        item.category || kind,
        quote,
        startOffset,
        endOffset,
        item.issue || '',
        item.suggestion || '',
        item.rewrite || '',
      );

      savedItems.push({
        id: itemId,
        reviewId,
        severity: item.severity,
        category: item.category,
        quote,
        startOffset,
        endOffset,
        issue: item.issue,
        suggestion: item.suggestion,
        rewrite: item.rewrite,
        state: 'open'
      });
    }

    return {
      reviewId,
      items: savedItems
    };
  }

  /**
   * One-click accept and apply review item rewrite
   */
  static applyReviewRewrite(chapterId: string, itemId: string): { newVersionId: string; success: boolean } {
    const item: any = db.prepare('SELECT * FROM review_items WHERE id = ?').get(itemId);
    if (!item || !item.quote || !item.rewrite) {
      throw new Error('审查条目无有效改写片段');
    }

    const chapter: any = db.prepare('SELECT * FROM chapters WHERE id = ?').get(chapterId);
    if (!chapter?.current_version_id) throw new Error('当前章节无正文');

    const currentVer: any = db.prepare('SELECT * FROM chapter_versions WHERE id = ?').get(chapter.current_version_id);
    const content = currentVer.content;

    if (!content.includes(item.quote)) {
      throw new Error('正文中未找到原句（可能已被手动编辑），无法自动替换');
    }

    const newContent = content.replace(item.quote, item.rewrite);
    const newVersionId = `ver-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO chapter_versions (id, chapter_id, content, source, note, created_at)
      VALUES (?, ?, ?, 'review_fix', ?, ?)
    `).run(newVersionId, chapterId, newContent, `采纳审查修改：${item.category}`, now);

    db.prepare(`UPDATE chapters SET current_version_id = ?, word_count = ? WHERE id = ?`).run(
      newVersionId,
      newContent.length,
      chapterId
    );

    db.prepare(`UPDATE review_items SET state = 'accepted' WHERE id = ?`).run(itemId);

    return { newVersionId, success: true };
  }

  /**
   * 7.6 Extract Fact Ledger candidates from finalized text
   */
  static async extractFacts(novelId: string, chapterId: string, versionId: string) {
    const version: any = db.prepare('SELECT * FROM chapter_versions WHERE id = ?').get(versionId);
    if (!version) throw new Error('章节版本不存在');

    const systemPrompt = `你是一名小说事实档案员。请从提供的章节正文中提取关键的事实账本条目。
重点提取：
1. event: 重大剧情事件
2. state: 人物状态变化（如受伤、获得秘籍、晋升）
3. relation: 人物关系转变（如同盟、决裂、结仇）
4. item: 关键法宝/道具转移或损毁
5. timeline: 明确的故事推进时间点
6. promise: 新埋下的伏笔，或对未来的预言/约定

严格输出 JSON 格式：
{
  "facts": [
    {
      "kind": "event" | "state" | "relation" | "item" | "timeline" | "promise",
      "subject": "相关主体（如角色名、物品名）",
      "content": "事实描述（客观凝练，30字以内）",
      "story_time": "故事时间（若有）",
      "resolved": 0
    }
  ]
}`;

    const modelId = ((db.prepare("SELECT model_id FROM model_roles WHERE role = 'summarize'").get() as any)?.model_id as string) || 'mock-fast';

    const resp = await LLMGateway.complete({
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: version.content }
      ],
      json: true
    });

    let result: any = { facts: [] };
    try {
      result = JSON.parse(resp.text);
    } catch {
      result = { facts: [] };
    }

    const inserted: any[] = [];
    const now = Date.now();

    for (const f of result.facts || []) {
      const factId = `fact-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      db.prepare(`
        INSERT INTO facts (id, novel_id, chapter_id, kind, subject, content, story_time, resolved, confirmed, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `).run(factId, novelId, chapterId, f.kind || 'event', f.subject || '剧情', f.content || '', f.story_time || '', f.resolved || 0, now);

      inserted.push({
        id: factId,
        novelId,
        chapterId,
        kind: f.kind,
        subject: f.subject,
        content: f.content,
        story_time: f.story_time,
        confirmed: 0
      });
    }

    return inserted;
  }
}
