import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Play, 
  RefreshCw, 
  Terminal, 
  Radio, 
  CheckCircle2, 
  Plus, 
  ShieldCheck, 
  Brain, 
  Wrench, 
  ArrowRight, 
  Code2, 
  Sliders, 
  Layers, 
  Activity,
  FileCode2,
  Check,
  ChevronRight,
  SlidersHorizontal,
  X,
  Sparkles,
  Zap,
  Bookmark
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

export type AgentRoleType = 'auditor' | 'researcher' | 'stylist' | 'extractor';

export interface Agent {
  id: string;
  category: AgentRoleType;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  avatar: string;
  tools: string[];
  autonomous: boolean;
}

export interface StepLog {
  step: number;
  type: 'thought' | 'action' | 'observation' | 'answer';
  title: string;
  content: string;
  timestamp: string;
}

const ROLE_CATEGORIES: Record<AgentRoleType, { label: string; icon: any; color: string }> = {
  auditor: { label: '设定架构审查', icon: ShieldCheck, color: '#30d158' },
  researcher: { label: '全网课题研究', icon: Brain, color: '#bf5af2' },
  stylist: { label: '文风去油校对', icon: Sparkles, color: '#ff9f0a' },
  extractor: { label: '事实账本抽取', icon: Bookmark, color: '#0a84ff' }
};

export const AgentStudio: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'agent-reviewer',
      category: 'auditor',
      name: '架构与设定监督智能体',
      role: 'Setting Auditor',
      description: '基于原子事实账本与设定库，自主检查长篇前后设定冲突与能力边界越界。',
      systemPrompt: '你是小说与知识库的总架构审查官。你必须调用 get_lore 和 get_material 严格核验事实。',
      avatar: '🛡️',
      tools: ['get_lore', 'list_characters', 'search_materials'],
      autonomous: true
    },
    {
      id: 'agent-researcher',
      category: 'researcher',
      name: '全网深度研报智能体',
      role: 'Deep Researcher',
      description: '自主规划子课题，调用多方检索工具搜集权威文献，并在沙盒中提炼证据链。',
      systemPrompt: '你是一名资深研究员。请将问题拆解并自主调度搜索工具。',
      avatar: '🔬',
      tools: ['search_materials', 'save_material'],
      autonomous: true
    },
    {
      id: 'agent-polisher',
      category: 'stylist',
      name: '文风校对与去 AI 腔智能体',
      role: 'Style Director',
      description: '专门识别过度陈词滥调、总结式结尾与现代网络词出戏，输出精炼古典改写。',
      systemPrompt: '你是文学审校总监，致力于铲除 AI 套话，提升文字质感。',
      avatar: '✍️',
      tools: ['get_lore'],
      autonomous: false
    },
    {
      id: 'agent-extractor',
      category: 'extractor',
      name: '原子事实账本抽取智能体',
      role: 'Fact Ledger Extractor',
      description: '自动扫描章节正文，抽取角色状态变化、新增物品及因果伏笔，沉淀为待审事实账目。',
      systemPrompt: '你是严谨的数据事实记录员，只记录客观物理事实，杜绝无依据猜测。',
      avatar: '🗂️',
      tools: ['get_lore', 'search_materials'],
      autonomous: true
    }
  ]);

  const [activeAgentId, setActiveAgentId] = useState<string>('agent-reviewer');
  const [selectedCategory, setSelectedCategory] = useState<'all' | AgentRoleType>('all');
  const [taskInput, setTaskInput] = useState('核查当前小说第一章在“破妄真瞳施展代价”上是否严格遵守了“每次全力催动超过三息经络灼烧”的设定，并评估与主角身体状态的一致性。');
  const [isRunning, setIsRunning] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<StepLog[]>([]);
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [showConfig, setShowConfig] = useState(true);

  const activeAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  const handleRunAgent = () => {
    if (!taskInput.trim() || isRunning) return;
    setIsRunning(true);
    setExecutionLogs([]);

    const steps: StepLog[] = [
      {
        step: 1,
        type: 'thought',
        title: '分析任务意图并制定工具调用策略',
        content: `【思考】用户要求核查第一章中“破妄真瞳”能力的设定一致性。\n根据规划，我需要先从本地 SQLite 数据库中检索该能力的唯一事实标准，然后再对比第一章的实际正文。`,
        timestamp: '16:04:12'
      },
      {
        step: 2,
        type: 'action',
        title: '调用本地 MCP 工具：get_lore',
        content: `Tool: get_lore\nArguments: { novel_id: "demo-novel-1", query: "破妄真瞳法则" }`,
        timestamp: '16:04:13'
      },
      {
        step: 3,
        type: 'observation',
        title: '收到环境返回数据 (Observation)',
        content: `返回结果：【破妄真瞳法则】“能窥视天地气机运行缝隙与阵法命门，但每次全力催动超过三息，双目经络便受渊煞侵蚀如烈火灼烧，需辅以寒玉髓压制。严禁任何毫无代价的连续施展。”`,
        timestamp: '16:04:14'
      },
      {
        step: 4,
        type: 'thought',
        title: '检索第一章正文关键句并计算瞳术持续时间',
        content: `【思考】正文中主角在黑风渡口面对鉴魂镜时暗中施展瞳术。原文明确出现内心独白：“不能久看。三息已过两息。”随后立即以弹指射出青铜钱破坏阵眼，符合三息之内的安全操作界限。\n同时原文描写：“然而，瞳中传来的灼烧感也如期而至，像是一根烧红的铁针正慢慢刺入眼底。沈玄烛暗暗咬紧牙关，咽下喉头泛起的一丝甜腥。”证明能力代价得到了真实呈现。`,
        timestamp: '16:04:16'
      },
      {
        step: 5,
        type: 'answer',
        title: '智能体自主核验完成 (Final Answer)',
        content: `✅ 【一致性审查结论：合格】\n1. 正文严格遵守了设定库中“全力催动不可超过三息”的核心法则，并在两息时果断收力。\n2. 经络灼烧与喉头血腥味的生理代价描写与世界观一致，无机械降神或能力通胀漏洞。\n3. 建议：后续章节如遇高强度连续死斗，应在章纲中提前埋设“寒玉髓”消耗或双目恶化的伏笔。`,
        timestamp: '16:04:18'
      }
    ];

    let currentIdx = 0;
    const timer = setInterval(() => {
      if (currentIdx < steps.length) {
        setExecutionLogs(prev => [...prev, steps[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(timer);
        setIsRunning(false);
      }
    }, 600);
  };

  const filteredAgents = agents.filter(a => selectedCategory === 'all' || a.category === selectedCategory);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--apple-bg)] select-none">
      {/* ============================================================ */}
      {/* 1. TOP macOS TOOLBAR FOR AGENTS (智能体工坊专属顶栏) */}
      {/* ============================================================ */}
      <header className="h-[52px] border-b border-[var(--apple-border)] bg-[var(--apple-glass)] backdrop-blur-xl px-4 flex items-center justify-between shrink-0 select-none z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Bot className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-xs font-bold text-[var(--apple-text-primary)]">
            AI 智能体编排工坊 · Agent Studio
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[var(--apple-text-secondary)] font-mono">
            <span>·</span>
            <span>{activeAgent.name}</span>
          </div>
        </div>

        {/* Center: Agent Category Filter */}
        <div className="flex items-center gap-1">
          <div className="p-0.5 rounded-lg bg-[var(--apple-border)] flex items-center text-[11px] font-medium">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${selectedCategory === 'all' ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs font-semibold' : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'}`}
            >
              全部智能体
            </button>
            {(Object.keys(ROLE_CATEGORIES) as AgentRoleType[]).map(rKey => {
              const cfg = ROLE_CATEGORIES[rKey];
              const isMatch = selectedCategory === rKey;
              return (
                <button
                  key={rKey}
                  onClick={() => setSelectedCategory(rKey)}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${isMatch ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs font-semibold' : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-1.5 rounded-lg border transition-all ${
              showConfig
                ? 'bg-[var(--apple-accent)] border-[var(--apple-accent)] text-white shadow-xs'
                : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
            }`}
            title="查看智能体配置"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. BODY SPLIT-VIEW (Apple Xcode / Shortcuts Style) */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Agents Directory */}
        <aside className="w-64 border-r border-[var(--apple-border)] bg-[var(--apple-sidebar)] flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-[var(--apple-separator)]">
            <span className="text-[11px] font-bold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
              驻场专家智能体 ({filteredAgents.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filteredAgents.map(a => {
              const isActive = a.id === activeAgent.id;
              const cfg = ROLE_CATEGORIES[a.category] || ROLE_CATEGORIES.auditor;

              return (
                <div
                  key={a.id}
                  onClick={() => setActiveAgentId(a.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all space-y-1.5 group select-none relative ${
                    isActive
                      ? 'border-[var(--apple-accent)] bg-[var(--apple-surface)] shadow-[0_4px_16px_rgba(10,132,255,0.18)] ring-2 ring-[var(--apple-accent)]'
                      : 'border-[var(--apple-border)] bg-[var(--apple-surface)]/70 hover:border-[var(--apple-border-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{a.avatar}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--apple-text-primary)] truncate">{a.name}</div>
                      <div className="text-[10px] text-[var(--apple-text-tertiary)] font-mono truncate">{a.role}</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-[var(--apple-text-tertiary)] line-clamp-2 leading-relaxed">
                    {a.description}
                  </p>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center: Agent Thought & Execution Sandbox Flow */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--apple-bg)] select-text">
          {/* Top Task Prompt Input Bar */}
          <div className="p-4 border-b border-[var(--apple-separator)] bg-[var(--apple-surface)]/80 backdrop-blur-md shrink-0">
            <div className="max-w-3xl mx-auto flex items-center gap-2">
              <input
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                placeholder="向智能体下达核查指令或规划任务..."
                className="flex-1 p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)] transition-all"
              />
              <button
                onClick={handleRunAgent}
                disabled={isRunning || !taskInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[var(--apple-accent-hover)] transition-all shadow-xs disabled:opacity-50 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? '自主推理中...' : '指派执行'}</span>
              </button>
            </div>
          </div>

          {/* Execution Stream Logs */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center">
            <div className="w-full max-w-3xl space-y-4">
              {executionLogs.length === 0 ? (
                <div className="py-24 text-center text-[var(--apple-text-tertiary)] space-y-2">
                  <Bot className="w-12 h-12 mx-auto opacity-30 text-purple-400" />
                  <p className="text-xs">点击上方“指派执行”，检视智能体的完整思维链与工具调用轨迹</p>
                </div>
              ) : (
                executionLogs.map((log) => (
                  <div
                    key={log.step}
                    className={`p-4 rounded-2xl border text-xs shadow-xs space-y-2 transition-all ${
                      log.type === 'thought'
                        ? 'bg-[var(--apple-surface)] border-[var(--apple-border)]'
                        : log.type === 'action'
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                          : log.type === 'observation'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                            : 'bg-emerald-500/10 border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] opacity-75">
                      <span className="font-bold uppercase tracking-wider">
                        {log.type === 'thought' ? '🧠 REASONING THOUGHT' : log.type === 'action' ? '⚡ TOOL ACTION' : log.type === 'observation' ? '👁️ OBSERVATION' : '✅ FINAL DELIVERABLE'}
                      </span>
                      <span>{log.timestamp}</span>
                    </div>

                    <div className="font-bold text-xs text-[var(--apple-text-primary)]">
                      {log.title}
                    </div>

                    <div className="leading-relaxed text-[var(--apple-text-primary)] opacity-95">
                      <AppleMarkdown content={log.content} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Right Column: Agent Configuration Inspector */}
        {showConfig && (
          <aside className="w-80 border-l border-[var(--apple-border)] bg-[var(--apple-surface)] flex flex-col shrink-0 select-none animate-in slide-in-from-right duration-200">
            <div className="h-[52px] px-4 border-b border-[var(--apple-separator)] flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
                <span>智能体配置档案</span>
              </span>
              <button onClick={() => setShowConfig(false)} className="text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[var(--apple-text-secondary)] block mb-1">
                  专家名称与代号
                </label>
                <div className="p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] font-bold">
                  {activeAgent.name} ({activeAgent.role})
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--apple-text-secondary)] block mb-1">
                  系统提示词设定 (System Prompt)
                </label>
                <textarea
                  readOnly
                  rows={4}
                  value={activeAgent.systemPrompt}
                  className="w-full p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] leading-relaxed resize-none focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--apple-text-secondary)] block mb-1.5">
                  已挂载本地 MCP 工具链
                </label>
                <div className="space-y-1.5">
                  {activeAgent.tools.map(tool => (
                    <div key={tool} className="p-2 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-mono flex items-center justify-between text-[var(--apple-text-primary)]">
                      <span>{tool}</span>
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
