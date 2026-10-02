import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  Bot, 
  Send, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  BookmarkPlus, 
  Copy, 
  Check, 
  Search, 
  Plus, 
  MessageSquare, 
  Settings, 
  Sliders, 
  Layers, 
  Trash2, 
  Volume2, 
  Share2, 
  CheckCircle2,
  ChevronRight,
  UserCheck,
  Shield,
  Zap,
  Globe,
  Radio,
  FileText,
  Activity,
  Cpu,
  GitCommit,
  Network,
  Maximize2,
  Minimize2,
  X,
  PieChart,
  BarChart3,
  TrendingUp,
  ArrowDown,
  Edit3,
  CheckSquare,
  GitFork,
  Download,
  ShieldAlert,
  UserPlus,
  UserMinus,
  Quote,
  Reply,
  Image as ImageIcon,
  PlugZap,
  Clipboard,
  ChevronDown,
  AtSign,
  Shuffle,
  MessagesSquare,
  Sun,
  Moon,
  Paperclip,
  Brain,
  Gauge,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  Terminal,
  TerminalSquare
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

export type BadgeColor = 'rose' | 'blue' | 'emerald' | 'purple' | 'amber';

export interface GroupMember {
  id: string;
  name: string;
  role: string;
  avatarText: string;
  avatarBg: string;
  color: BadgeColor;
  systemPrompt: string;
  stance: string;
  model: string;
  temp: number;
  topP: number;
  ragDepth: number;
  tools: string[]; // 'search' | 'vision' | 'mcp-db' | 'mcp-kb' | 'sandbox'
}

export interface ToolCall {
  type: 'search' | 'mcp' | 'vision' | 'sandbox';
  title: string;
  summary: string;
  details: string[];
}

export interface GroupMessage {
  id: string;
  senderType: 'user' | 'ai';
  senderId?: string;
  senderName: string;
  role?: string;
  avatarText: string;
  avatarBg: string;
  time: string;
  content: string;
  cotReasoning?: string[]; // 深度思考链 CoT
  latency?: string;
  tokenSpeed?: string;
  toolCalls?: ToolCall[];
  replyTo?: { author: string; snippet: string } | null;
}

export interface GroupSession {
  id: string;
  title: string;
  active: boolean;
  unread: number;
  date: string;
}

const DEFAULT_MEMBERS: GroupMember[] = [
  {
    id: 'nova',
    name: 'Architect Nova',
    role: '主架构师',
    model: 'Claude 3.5 Sonnet',
    stance: '系统结构优选',
    color: 'blue',
    avatarText: 'AN',
    avatarBg: 'bg-gradient-to-tr from-cyan-500 to-blue-600',
    temp: 0.45,
    topP: 0.85,
    ragDepth: 8,
    systemPrompt: '你具有世界一流的计算系统体系结构设计认知，专精于能耗建模、NoC 通信及 RISC-V 协处理器集成。在发言时优先使用形式化参数与逻辑论据。',
    tools: ['search', 'mcp-kb']
  },
  {
    id: 'atlas',
    name: 'Critic Atlas',
    role: '对立诘问者',
    model: 'DeepSeek R1 Pro',
    stance: '物理逻辑质疑',
    color: 'amber',
    avatarText: 'CA',
    avatarBg: 'bg-gradient-to-tr from-amber-500 to-rose-600',
    temp: 0.70,
    topP: 0.90,
    ragDepth: 12,
    systemPrompt: '你专职挑剔方案中的逻辑破绽、硬件时延瓶颈与潜在死锁，保持理性而犀利的批判态度。',
    tools: ['mcp-db', 'sandbox']
  },
  {
    id: 'veritas',
    name: 'Fact Veritas',
    role: '数学与硬件基准',
    model: 'GPT-4o (Omni)',
    stance: '基准数据对齐',
    color: 'emerald',
    avatarText: 'FV',
    avatarBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
    temp: 0.10,
    topP: 0.50,
    ragDepth: 15,
    systemPrompt: '你负责严密验证物理定律、带宽极限与统计学基准，以仿真数据与对照表格说话。',
    tools: ['mcp-db', 'sandbox', 'vision']
  },
  {
    id: 'echo',
    name: 'Synth Echo',
    role: '共识仲裁者',
    model: 'Gemini 1.5 Pro',
    stance: '共识白皮书收敛',
    color: 'purple',
    avatarText: 'SE',
    avatarBg: 'bg-gradient-to-tr from-purple-500 to-pink-600',
    temp: 0.35,
    topP: 0.80,
    ragDepth: 10,
    systemPrompt: '你负责在架构师与质询者的争端中总结共识，剔除不成立的论点，输出结构化工程决策。',
    tools: ['vision', 'search']
  }
];

const INITIAL_MESSAGES: GroupMessage[] = [
  {
    id: 'm-1',
    senderType: 'ai',
    senderId: 'nova',
    senderName: 'Architect Nova',
    avatarText: 'AN',
    avatarBg: 'bg-gradient-to-tr from-cyan-500 to-blue-600',
    time: '10:42:08',
    latency: '410ms',
    tokenSpeed: '146 tok/s',
    cotReasoning: [
      '1. 分析 15W TDP 下传统的固定流处理器矩阵无法避免静态漏电与寄存器堆拥塞。',
      '2. 考虑异构分簇：引入 4 个超轻量脉动阵列核 + 2 个乱序向量单元。',
      '3. 采用细粒度动态电压频率调整 (DVFS) 配合异步网络芯片互联 (NoC)。',
      '4. 预测 FLOPS/W 可从当前工业平均 4.2 提升至 8.1。'
    ],
    content: '针对我们设定的 **15W 功耗墙指标**，我提议放弃传统的粗粒度全局共享缓存方案，采用全新的 **Asynchronous Wavefront Systolic Array (AWSA)** 拓扑结构。近存计算瓦片可大幅削减长距离总线搬运能耗。请 @Critic_Atlas 评估其在极端动态图编译时的管道气泡开销 (Pipeline Bubble)。',
    toolCalls: [],
    replyTo: null
  },
  {
    id: 'm-2',
    senderType: 'ai',
    senderId: 'atlas',
    senderName: 'Critic Atlas',
    avatarText: 'CA',
    avatarBg: 'bg-gradient-to-tr from-amber-500 to-rose-600',
    time: '10:42:35',
    latency: '512ms',
    tokenSpeed: '210 tok/s',
    content: '异议切入：@Architect_Nova 的方案忽略了一个物理现实——在运行多模态 MoE 稀疏路由时，不同专家的激活密度差异高达 73%。当遇到高聚集性张量时，局部 SRAM 将在 3 个周期内溢出，引发全局 Head-of-Line Blocking，预估会导致高达 **31.4% 的时钟气泡停滞**！建议引入 Credit-based Token Ring 借贷机制。',
    toolCalls: [
      {
        type: 'search',
        title: '🔍 联网检索: "Credit-based Token Ring NoC congestion mitigation 2026"',
        summary: '已检索 3 个高权重 IEEE/ACM 论文来源',
        details: [
          '来源 1: Token Ring 网状借贷可将局部头阻塞概率降低 84%',
          '来源 2: 硬件开销仅增加 1.8% 逻辑门面积'
        ]
      }
    ],
    replyTo: null
  },
  {
    id: 'm-3',
    senderType: 'ai',
    senderId: 'veritas',
    senderName: 'Fact Veritas',
    avatarText: 'FV',
    avatarBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
    time: '10:43:10',
    latency: '290ms',
    tokenSpeed: '180 tok/s',
    cotReasoning: [
      '1. 运行 100,000 次蒙特卡洛稀疏矩阵仿真。',
      '2. 比对基线(全局缓存)、AWSA 纯方案与 Atlas 权杖借贷修正方案。'
    ],
    content: '已调用内置硬件仿真容器完成蒙特卡洛测试，结果比对：\n- **基线方案**: 14.8 W / 82 TFLOPS (能耗溢出风险)\n- **Nova AWSA 纯方案**: 9.2 W / 104 TFLOPS (气泡率 28.2%)\n- **Atlas 权杖借贷修正**: 11.4 W / 128 TFLOPS (气泡率降至 4.7%，达成 15W 限额内 120 TFLOPS 目标)。',
    toolCalls: [
      {
        type: 'sandbox',
        title: '💻 Python 验算沙箱: run_concurrency_monte_carlo()',
        summary: '100,000 次冲击模拟收敛，能耗与 TFLOPS 比对达标',
        details: ['def simulate(): p99_latency = 12.8ms; power_draw = 11.4W']
      }
    ],
    replyTo: null
  }
];

export const AIGroupChatView: React.FC<{
  onSaveToMaterial?: (title: string, body: string) => void;
}> = ({ onSaveToMaterial }) => {
  // Title & Topology Mode State
  const [groupTitle, setGroupTitle] = useState('Alpha-X 异构芯片架构研讨');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(groupTitle);

  const topologyModes = ['辩论对抗模式 (Debate)', '流水线瀑布模式 (Pipeline)', '自由脑暴模式 (Round-Robin)'];
  const [topologyModeIndex, setTopologyModeIndex] = useState(0);

  // Members & Messages State
  const [members, setMembers] = useState<GroupMember[]>(DEFAULT_MEMBERS);
  const [messages, setMessages] = useState<GroupMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [targetAgentKey, setTargetAgentKey] = useState<string>('all');

  // Inspector & Inspector Sub-tabs
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<'agent' | 'topology' | 'telemetry'>('agent');
  const [inspectedAgentId, setInspectedAgentId] = useState<string>('nova');

  // CoT & RAG Toggles
  const [forceCoT, setForceCoT] = useState(true);
  const [enableRAG, setEnableRAG] = useState(true);
  const [isWebSearch, setIsWebSearch] = useState(false);

  // Expanded CoT tracking
  const [expandedCoTIds, setExpandedCoTIds] = useState<Set<string>>(new Set(['m-1']));

  // Sessions State
  const [sessions, setSessions] = useState<GroupSession[]>([
    { id: 'sess-1', title: 'Alpha-X 异构芯片架构研讨', active: true, unread: 0, date: '刚刚' },
    { id: 'sess-2', title: '微内核安全审计小组', active: false, unread: 2, date: '昨天' },
    { id: 'sess-3', title: '量子算法模拟研讨', active: false, unread: 0, date: '3天前' }
  ]);

  // Modals & Batch Mode
  const [activeModal, setActiveModal] = useState<'add_agent' | 'export' | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState<Set<string>>(new Set());

  // Add Agent Modal State
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');
  const [newAgentEngine, setNewAgentEngine] = useState('Claude 3.5 Sonnet');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const currentInspectedAgent = members.find(m => m.id === inspectedAgentId) || members[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toggle CoT Collapse
  const toggleCoT = (msgId: string) => {
    setExpandedCoTIds(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  // User Send Message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: GroupMessage = {
      id: `m-${Date.now()}`,
      senderType: 'user',
      senderName: '首席工程督导 (You)',
      avatarText: 'ME',
      avatarBg: 'bg-neutral-700',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      content: inputText,
      toolCalls: [],
      replyTo: null
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      triggerAgentResponseFlow(inputText, targetAgentKey);
    }, 700);
  };

  // Agent Chain Reply Generator
  const triggerAgentResponseFlow = (query: string, targetKey: string) => {
    let agent = members.find(m => m.id === targetKey) || members[Math.floor(Math.random() * members.length)];

    const aiMsg: GroupMessage = {
      id: `m-${Date.now()}`,
      senderType: 'ai',
      senderId: agent.id,
      senderName: agent.name,
      avatarText: agent.avatarText,
      avatarBg: agent.avatarBg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      latency: `${Math.floor(Math.random() * 200 + 300)}ms`,
      tokenSpeed: `${Math.floor(Math.random() * 50 + 140)} tok/s`,
      cotReasoning: forceCoT ? [
        `1. 解析督导指令「${query.slice(0, 20)}...」`,
        `2. 对齐 ${agent.role} 的人设偏好与设定，检查 15W TDP 下的物理越界。`,
        `3. 生成形式化推演与工程妥协案。`
      ] : undefined,
      content: `收到督导指示。针对当前问题，我们设计了全新的驱动层零拷贝通道：通过将指令发射端与数据借贷权杖统一编码，减少了 2 次主板总线握手，进一步锁定了 15W TDP 下的功耗红线。`,
      toolCalls: [
        {
          type: 'mcp',
          title: '🔌 MCP: mcp://infra-agent/get_gateway_threshold',
          summary: '当前集群最大承受吞吐量: 15,200 RPS',
          details: ['建议配置: 启用 Token Bucket 限流，超额自动降级至静态缓存。']
        }
      ]
    };

    setMessages(prev => [...prev, aiMsg]);
    showToast(`[${agent.name}] 已完成自律推理并回复`);
  };

  // Add Agent Modal Action
  const handleConfirmAddAgent = () => {
    if (!newAgentName.trim()) return;

    const newAgent: GroupMember = {
      id: `agent-${Date.now()}`,
      name: newAgentName,
      role: newAgentRole || '领域评估专家',
      model: newAgentEngine,
      stance: '专业合规审视',
      color: 'purple',
      avatarText: newAgentName.slice(0, 2).toUpperCase(),
      avatarBg: 'bg-gradient-to-tr from-indigo-500 to-purple-600',
      temp: 0.5,
      topP: 0.85,
      ragDepth: 10,
      systemPrompt: '专注于领域安全与逻辑完整性评估。',
      tools: ['search', 'mcp-db']
    };

    setMembers(prev => [...prev, newAgent]);
    setActiveModal(null);
    showToast(`已成功部署新智能体：${newAgentName}`);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#09090b] text-[#f5f5f7] font-sans select-none relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#16161a]/95 border border-white/20 text-xs text-white shadow-2xl flex items-center space-x-2 backdrop-blur-2xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP SYSTEM MENU BAR (macOS Sequoia Inspiration) */}
      <header className="h-10 px-4 flex items-center justify-between text-xs z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl shrink-0 select-none">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 mr-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 cursor-pointer" />
          </div>

          <div className="flex items-center space-x-2 font-semibold text-white/90">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>Synapse Studio</span>
            <span className="text-white/30 text-[11px] font-mono">v3.4-Pro</span>
          </div>

          <nav className="hidden md:flex items-center space-x-3 text-white/60 text-[11px]">
            <span onClick={() => showToast('协作拓扑已对齐')} className="hover:text-white cursor-pointer transition">协作拓扑</span>
            <span onClick={() => showToast('知识库挂载点正常')} className="hover:text-white cursor-pointer transition">知识库挂载</span>
            <span onClick={() => showToast('推理遥测实时采样中')} className="hover:text-white cursor-pointer transition">推理遥测</span>
            <span onClick={() => showToast('审计日志已打包')} className="hover:text-white cursor-pointer transition">审计日志</span>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{members.length} 节点自洽网络在线</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1 text-white/40 text-[11px] font-mono">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>142.8 tok/s</span>
          </div>

          <button
            onClick={() => setIsInspectorOpen(p => !p)}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="智能体超参数与架构面板"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR: ROSTER & CHANNELS */}
        <aside className="w-80 border-r border-white/10 bg-[#16161c]/80 backdrop-blur-2xl flex flex-col shrink-0 select-none z-30">
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md font-bold text-xs">
                AX
              </div>
              <div className="truncate">
                <h2 className="text-xs font-bold text-white/90 truncate">{groupTitle}</h2>
                <p className="text-[10px] text-white/40">分布式计算与拓扑验证组</p>
              </div>
            </div>
            <button onClick={() => { setIsEditingTitle(p => !p); setTitleInput(groupTitle); }} className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Member Roster List */}
          <div className="px-4 pt-3 pb-1 flex items-center justify-between text-xs text-white/50 font-semibold">
            <span>在线协同智能体 ({members.length})</span>
            <button onClick={() => setActiveModal('add_agent')} className="text-blue-400 hover:underline text-[11px] flex items-center space-x-0.5">
              <UserPlus className="w-3 h-3" />
              <span>+ 注入专家</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-2">
            {members.map(m => {
              const isInspected = m.id === inspectedAgentId;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setInspectedAgentId(m.id);
                    setIsInspectorOpen(true);
                  }}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    isInspected ? 'bg-blue-600/20 border-blue-500 shadow-md' : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-xl ${m.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-md`}>
                        {m.avatarText}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5 font-bold text-xs text-white">
                          <span>{m.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-mono">{m.model.split(' ')[0]}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400">{m.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-white/10 bg-black/20 text-[11px] flex items-center justify-between text-white/50 font-mono">
            <span>策略: {topologyModes[topologyModeIndex].split(' ')[0]}</span>
            <button
              onClick={() => {
                const nextIdx = (topologyModeIndex + 1) % topologyModes.length;
                setTopologyModeIndex(nextIdx);
                showToast(`协同拓扑已切换为: ${topologyModes[nextIdx]}`);
              }}
              className="text-blue-400 hover:underline text-[10px]"
            >
              变更
            </button>
          </div>
        </aside>

        {/* CENTER MAIN CHAT TIMELINE */}
        <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-black/10">
          {/* Header HUD */}
          <div className="h-14 px-6 border-b border-white/10 flex items-center justify-between bg-[#121216]/80 backdrop-blur-xl z-20">
            <div className="flex items-center space-x-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-sm font-bold text-white/95">{groupTitle}</h1>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center space-x-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span>{topologyModes[topologyModeIndex]}</span>
                  </span>
                </div>
                <p className="text-[11px] text-white/40 mt-0.5">目标：在 15W TDP 限制下实现 120 TFLOPS 稀疏矩阵加速</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={() => triggerAgentResponseFlow('激发一轮对抗论证', 'all')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>激发一轮对抗论证</span>
              </button>

              <button
                onClick={() => {
                  const title = `群聊共识白皮书: ${groupTitle}`;
                  const body = messages.map(m => `[${m.time}] ${m.senderName}: ${m.content}`).join('\n\n');
                  if (onSaveToMaterial) onSaveToMaterial(title, body);
                  showToast('共识白皮书已打包存入素材库');
                }}
                className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition"
                title="生成共识白皮书"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.map(m => {
              const isUser = m.senderType === 'user';
              const isCoTExpanded = expandedCoTIds.has(m.id);

              return (
                <div key={m.id} className={`flex items-start space-x-3.5 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-2xl ${m.avatarBg} flex items-center justify-center font-bold text-white shadow-md text-xs shrink-0 mt-0.5`}>
                    {m.avatarText}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className={`flex items-center space-x-2 ${isUser ? 'justify-end' : ''}`}>
                      <span className="text-xs font-bold text-white/90">{m.senderName}</span>
                      {m.latency && <span className="text-[10px] text-white/40 font-mono">{m.latency} • {m.tokenSpeed}</span>}
                    </div>

                    {/* CoT Collapsible Thought Process */}
                    {m.cotReasoning && (
                      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden text-xs">
                        <button
                          onClick={() => toggleCoT(m.id)}
                          className="w-full px-3 py-1.5 flex items-center justify-between text-left text-white/50 hover:bg-white/10 transition"
                        >
                          <span className="flex items-center space-x-1.5 text-[11px] font-bold text-purple-300">
                            <Brain className="w-3.5 h-3.5 text-purple-400" />
                            <span>深度思考链 (CoT: 推演步骤)</span>
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCoTExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        {isCoTExpanded && (
                          <div className="px-3.5 py-2.5 bg-black/30 text-[11px] font-mono text-zinc-300 space-y-1 border-t border-white/5">
                            {m.cotReasoning.map((step, idx) => (
                              <div key={idx}>{step}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Box */}
                    <div className="p-4 rounded-2xl bg-[#16161c] border border-white/10 text-xs sm:text-[13px] leading-relaxed text-white/90 shadow-sm">
                      <AppleMarkdown content={m.content} />
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center space-x-3 text-[11px] text-white/40 pt-1">
                      <button onClick={() => setInputText(`“回复 @${m.senderName}: ${m.content.slice(0, 20)}...” `)} className="hover:text-white">引用讨论</button>
                      <button onClick={() => showToast('已采纳该节点为全员共识')} className="hover:text-emerald-400">采纳为结论</button>
                      <button onClick={() => { navigator.clipboard.writeText(m.content); showToast('文本已复制'); }} className="hover:text-white">复制文本</button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Input Capsule */}
          <div className="p-4 md:p-6 pb-6 pt-2 z-20">
            <div className="max-w-4xl mx-auto space-y-2">
              {/* Quick Action Chips */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-white/40 text-[11px] font-bold whitespace-nowrap">智能体动作:</span>
                <button onClick={() => setInputText('请 Critic Atlas 针对 28nm 工艺制程进行物理面积与散热成本质疑')} className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition whitespace-nowrap">
                  ⚡️ 诘问 28nm 散热成本
                </button>
                <button onClick={() => setInputText('让 Synth Echo 生成最终共识并固化为 Architecture Spec v1.0 文档')} className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition whitespace-nowrap">
                  📑 固化架构共识文档
                </button>
              </div>

              {/* Glass Input Capsule */}
              <div className="p-2.5 rounded-3xl bg-[#16161c]/90 border border-white/15 shadow-2xl backdrop-blur-2xl space-y-2">
                <div className="flex items-center justify-between px-2 text-xs border-b border-white/5 pb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-white/40 font-bold">目标接收域:</span>
                    <select value={targetAgentKey} onChange={e => setTargetAgentKey(e.target.value)} className="bg-white/10 text-white text-[11px] rounded-lg px-2 py-0.5 outline-none border border-white/10">
                      <option value="all" className="bg-neutral-900 text-white">全员广播 (Broadcasting to All)</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id} className="bg-neutral-900 text-white">@{m.name} ({m.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-white/50">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input type="checkbox" checked={forceCoT} onChange={e => setForceCoT(e.target.checked)} className="rounded text-blue-500" />
                      <span>强制 CoT 推理</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-end space-x-2 px-2">
                  <textarea
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={2}
                    placeholder="指令全组或输入 @ 指定特定智能体介入辩论..."
                    className="flex-1 bg-transparent text-xs md:text-sm text-white placeholder-white/30 outline-none resize-none p-1"
                  />
                  <button onClick={handleSendMessage} className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT INSPECTOR (PRECISION TUNING) */}
        {isInspectorOpen && (
          <aside className="w-84 bg-[#121216]/95 border-l border-white/10 flex flex-col shrink-0 select-none z-30">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>智能体超参数与群协作调优</span>
              </span>
              <button onClick={() => setIsInspectorOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex border-b border-white/5 text-xs px-2 pt-1 font-bold">
              <button onClick={() => setInspectorTab('agent')} className={`flex-1 py-1.5 text-center transition ${inspectorTab === 'agent' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-400'}`}>专家参数</button>
              <button onClick={() => setInspectorTab('topology')} className={`flex-1 py-1.5 text-center transition ${inspectorTab === 'topology' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-400'}`}>拓扑编排</button>
              <button onClick={() => setInspectorTab('telemetry')} className={`flex-1 py-1.5 text-center transition ${inspectorTab === 'telemetry' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-400'}`}>硬件遥测</button>
            </div>

            {inspectorTab === 'agent' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded-xl ${currentInspectedAgent.avatarBg} flex items-center justify-center font-bold text-white text-xs`}>
                      {currentInspectedAgent.avatarText}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{currentInspectedAgent.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">{currentInspectedAgent.model}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-zinc-300">采样发散度 (Temperature)</span>
                    <span className="font-mono text-blue-400">{currentInspectedAgent.temp}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.5"
                    step="0.05"
                    value={currentInspectedAgent.temp}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setMembers(prev => prev.map(m => m.id === currentInspectedAgent.id ? { ...m, temp: val } : m));
                    }}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-bold block">角色核心公理 (System Prompt)</label>
                  <textarea
                    value={currentInspectedAgent.systemPrompt}
                    onChange={e => {
                      const text = e.target.value;
                      setMembers(prev => prev.map(m => m.id === currentInspectedAgent.id ? { ...m, systemPrompt: text } : m));
                    }}
                    rows={4}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-[11px] outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ADD AGENT MODAL */}
      {activeModal === 'add_agent' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 text-xs select-none animate-in fade-in">
          <div className="bg-[#181820] border border-white/20 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3 font-bold text-white text-sm">
              <span>注入新专家智能体</span>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">专家代号 / 命名</label>
                <input type="text" value={newAgentName} onChange={e => setNewAgentName(e.target.value)} placeholder="如: Security Cipher" className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-zinc-400 font-bold block mb-1">协同职能 (Role Persona)</label>
                <input type="text" value={newAgentRole} onChange={e => setNewAgentRole(e.target.value)} placeholder="如: 零信任算法审查员" className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
              <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 rounded-xl bg-white/10 text-white font-bold">取消</button>
              <button onClick={handleConfirmAddAgent} className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold">确认部署</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
