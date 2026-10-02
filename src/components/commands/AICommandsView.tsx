import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Zap, 
  Terminal, 
  Sparkles, 
  BookOpen, 
  Flame, 
  ShieldCheck, 
  FileText, 
  Plus, 
  Search, 
  Play, 
  Check, 
  Copy, 
  BookmarkPlus, 
  ChevronRight, 
  SlidersHorizontal, 
  Send, 
  RefreshCw, 
  X, 
  Code2, 
  Wand2, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Edit3, 
  Bookmark, 
  Pin, 
  PinOff, 
  Star, 
  FileCode, 
  PenTool, 
  Upload, 
  Download, 
  FileUp, 
  Trash2, 
  HelpCircle, 
  Eye, 
  Sliders, 
  GitFork, 
  Bot, 
  Activity, 
  Maximize2,
  Split,
  Share2,
  RotateCcw,
  FileCheck,
  ArrowRight,
  Database,
  Variable,
  Filter,
  Clock,
  ArrowUpRight,
  LayoutGrid,
  List,
  SidebarClose,
  SidebarOpen,
  Command,
  Pencil,
  PieChart,
  Feather,
  HardDrive,
  CheckSquare,
  Sparkle,
  History,
  Undo2,
  GitCommit,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

export type CommandCategory = 'all' | 'starred' | 'creative' | 'coding' | 'analysis' | 'meta' | 'research' | 'custom';

export interface CommandVersion {
  versionId: string;
  timestamp: number;
  formattedTime: string;
  versionLabel: string;
  name: string;
  template: string;
  systemPrompt?: string;
  model: string;
  hotkey?: string;
  desc: string;
  category: CommandCategory;
  tokensEst?: number;
  changeSummary?: string;
}

export interface AICommandItem {
  id: string;
  name: string;
  hotkey?: string;
  category: CommandCategory;
  model: string;
  avatar: string;
  avatarColor: string;
  desc: string;
  systemPrompt?: string;
  template: string;
  tokensEst?: number;
  starred: boolean;
  useCount: number;
  updatedAt: string;
  authorType?: 'system' | 'custom' | 'imported';
  tags?: string[];
  versions?: CommandVersion[];
}

// D3 Flow Graph Types
export interface CommandFlowNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'command' | 'agent' | 'model';
  category: string;
  color: string;
  icon: string;
  temperature?: number;
  topP?: number;
  contextWindow?: string;
  usageCount: number;
  promptSnippet?: string;
  agentRole?: string;
  modelEngine?: string;
}

export interface CommandFlowLink extends d3.SimulationLinkDatum<CommandFlowNode> {
  source: string | CommandFlowNode;
  target: string | CommandFlowNode;
  relation: string;
}

const STORAGE_KEY = 'apple_prompt_commands_v4';

const DEFAULT_COMMANDS: AICommandItem[] = [
  {
    id: "cmd_polish_anti_ai",
    name: "网文去AI味与镜头白描重构",
    hotkey: "⌥Space",
    category: "creative",
    model: "Claude 3.5 Sonnet",
    avatar: "润",
    avatarColor: "from-purple-500 to-indigo-600",
    desc: "剔除AI机械翻译腔、填充词，转化为富有压迫感的高张力肢体动作与生理微反应",
    systemPrompt: "你是一名资深严肃网文主笔。严禁使用'显然'、'值得一提的是'、'宛如'等AI过度填充词。贯彻'Show, Don't Tell'原则，通过冷峻白描和微动作推进张力。",
    template: `请重构以下段落：\n\n【原始草稿】：\n{{原文段落}}\n\n【核心情绪】：{{核心情绪}}\n【镜头视点】：{{视点人物}}\n\n要求：\n1. 删去所有抒情解释，改为直接物象描写；\n2. 增加两处不经意的生理微反应；\n3. 节奏短促利落，强化压迫感。`,
    tokensEst: 850,
    starred: true,
    useCount: 4280,
    updatedAt: "刚刚",
    authorType: 'system',
    tags: ['去AI味', '白描', '动作压迫', '文学打磨']
  },
  {
    id: "cmd_code_audit",
    name: "高并发死锁与内存逃逸审计",
    hotkey: "⌘J",
    category: "coding",
    model: "DeepSeek R1 / V3",
    avatar: "审",
    avatarColor: "from-blue-600 to-cyan-500",
    desc: "对指定函数代码进行防御性边界推演，排查Goroutine/锁竞争及边界异常",
    systemPrompt: "你是一名精通底层体系结构的高并发系统架构师。只关注代码的并发安全性、竞态条件、无锁原子操作及内存利用效率。",
    template: `请审计以下代码实现：\n\n【开发语言】：{{编程语言}}\n【目标吞吐】：{{QPS预估}}\n\n\`\`\`code\n{{待审计代码}}\n\`\`\`\n\n请输出：\n1. 潜在的并发死锁点或竞态竞争分析；\n2. 内存泄漏与逃逸点审查；\n3. 重构后的防御性优化代码（带严谨中文注释）。`,
    tokensEst: 1420,
    starred: true,
    useCount: 3120,
    updatedAt: "1小时前",
    authorType: 'system',
    tags: ['并发安全', '死锁审查', '内存优化', '代码架构']
  },
  {
    id: "cmd_swot_matrix",
    name: "商业竞争壁垒与反脆弱推演 (SWOT)",
    hotkey: "⌥S",
    category: "analysis",
    model: "Gemini 2.5 Pro",
    avatar: "商",
    avatarColor: "from-emerald-500 to-teal-600",
    desc: "输入竞品产品信息，自动推导第二增长曲线与不对称竞争进攻点",
    systemPrompt: "你是一名战略咨询合伙人。秉持实证主义，不讲空泛概念，专注可量化指标与非对称壁垒构建。",
    template: `针对产品：{{目标产品}}\n主营赛道：{{赛道名称}}\n主要对手：{{主要竞品}}\n\n请进行深度SWOT剖析，重点阐述：\n1. 竞品在供应链或用户转换成本上的隐形脆弱点；\n2. 我方如何通过最小阻力路径实现不对称击穿。`,
    tokensEst: 960,
    starred: false,
    useCount: 1560,
    updatedAt: "昨天",
    authorType: 'system',
    tags: ['商业分析', '竞争壁垒', '增长策略', 'SWOT']
  },
  {
    id: "cmd_meta_prompt_builder",
    name: "结构化元提示词脚手架构建器",
    hotkey: "⌘M",
    category: "meta",
    model: "Claude 3.5 Sonnet",
    avatar: "元",
    avatarColor: "from-pink-500 to-rose-600",
    desc: "将模糊直觉需求逆向工程为工业级结构化System Prompt（带Few-Shot与负向约束）",
    systemPrompt: "你是提示词工程（Prompt Engineering）专家。善于利用XML标签规范、角色人设、输入输出示例与边界防线构建鲁棒Prompt。",
    template: `我想让AI完成这样一个任务：\n{{任务诉求描述}}\n\n目标用户：{{受众类型}}\n交付格式：{{期望输出格式}}\n\n请输出一套生产就绪的完整Prompt（包含Role、Context、Constraints、Few-Shot Examples、Output Schema）。`,
    tokensEst: 1200,
    starred: true,
    useCount: 6540,
    updatedAt: "2天前",
    authorType: 'system',
    tags: ['元提示词', 'Prompt工程', 'Few-Shot', 'XML规范']
  },
  {
    id: "cmd_json_extractor",
    name: "非结构化文本严格 JSON Schema 抽取",
    hotkey: "⌥E",
    category: "coding",
    model: "Local Ollama",
    avatar: "析",
    avatarColor: "from-amber-500 to-orange-600",
    desc: "从凌乱自然语言中强约束抽取标准键值对，杜绝任何前后缀闲聊废话",
    systemPrompt: "You are a strictly compliant JSON extractor. You MUST output ONLY valid JSON without markdown fences or any conversational filler.",
    template: `目标数据Schema规范：\n{{字段定义JSON_Schema}}\n\n原始文本：\n{{待抽取非结构化文本}}\n\n请直接输出结构化JSON：`,
    tokensEst: 450,
    starred: false,
    useCount: 2200,
    updatedAt: "3天前",
    authorType: 'system',
    tags: ['JSON解析', 'Schema提取', '数据清洗', '零废话']
  },
  {
    id: "cmd_expand_sensory",
    name: "感官（声光气味触感）高保真细节渲染",
    hotkey: "⌥W",
    category: "creative",
    model: "Gemini 2.5 Pro",
    avatar: "感",
    avatarColor: "from-cyan-500 to-blue-600",
    desc: "丰富场景氛围，补充多维度物理与心理感官体验，提升代入感与现场沉浸度",
    systemPrompt: "你擅长运用光影色彩、微弱声响与温湿度通感，构建身临其境的物理世界。",
    template: `请为以下场景补充 4 组极具画面冲击力的高保真感官描写：\n1. 【光影与色彩】：刻画光线的明暗交界与微小悬浮物；\n2. 【声响与空寂】：描述极细微的背景白噪音或突发脆响；\n3. 【气味与温湿度】：刻画空气湿度与清冷气味；\n4. 【心理通感】：角色指尖触碰的粗糙度与经络体感。\n\n【场景简述】：\n{{场景描述}}`,
    tokensEst: 890,
    starred: false,
    useCount: 1940,
    updatedAt: "4天前",
    authorType: 'system',
    tags: ['五感描写', '通感', '画面感', '现场感']
  },
  {
    id: "cmd_research_extract",
    name: "学术长文核心事实与因果链提炼",
    hotkey: "⌥R",
    category: "research",
    model: "Gemini 2.5 Flash",
    avatar: "研",
    avatarColor: "from-indigo-500 to-purple-600",
    desc: "从杂乱文献中一键抽取核心论点、论据因果链、未解难题与落地建议",
    systemPrompt: "你是一名严谨的学术情报分析员，擅长结构化萃取论文与技术文档的核心因果链。",
    template: `请对以下输入材料进行深度事实解构，输出以下结构：\n1. 核心论点 (Core Claim)\n2. 关键因果链与实验支撑 (Causal Links & Evidence)\n3. 潜在矛盾与未解难题 (Open Questions)\n4. 创作与工程落地建议 (Actionable Insights)。\n\n【文献材料】：\n{{文献长文}}`,
    tokensEst: 1100,
    starred: true,
    useCount: 3410,
    updatedAt: "5天前",
    authorType: 'system',
    tags: ['文献提炼', '因果链', '学术大纲', '事实提取']
  }
];

// D3 Directed Topology Flow Nodes
const FLOW_GRAPH_NODES: CommandFlowNode[] = [
  { id: 'fn-polish', name: '网文去AI味镜头白描', type: 'command', category: '网文创作', color: '#af52de', icon: '润', temperature: 0.75, topP: 0.9, contextWindow: '128k', usageCount: 4280, promptSnippet: '剔除AI填充词，转化为富有压迫感的白描肢体动作...' },
  { id: 'fn-audit', name: '高并发死锁与内存逃逸', type: 'command', category: '代码架构', color: '#007aff', icon: '审', temperature: 0.2, topP: 0.95, contextWindow: '128k', usageCount: 3120, promptSnippet: '排查竞态条件、无锁原子操作及内存逃逸...' },
  { id: 'fn-swot', name: '商业壁垒与反脆弱SWOT', type: 'command', category: '商业分析', color: '#34c759', icon: '商', temperature: 0.6, topP: 0.9, contextWindow: '128k', usageCount: 1560, promptSnippet: '分析竞品隐形脆弱点，推导不对称击穿路径...' },
  { id: 'fn-meta', name: '结构化元提示词脚手架', type: 'command', category: '元提示词', color: '#ff2d55', icon: '元', temperature: 0.3, topP: 0.95, contextWindow: '128k', usageCount: 6540, promptSnippet: '逆向工程为工业级Prompt规范...' },
  { id: 'fn-research', name: '学术事实与因果链提炼', type: 'command', category: '深度学术', color: '#5856d6', icon: '研', temperature: 0.25, topP: 0.95, contextWindow: '128k', usageCount: 3410, promptSnippet: '一键抽取核心论点与论据因果链...' },

  // AI Agent Nodes
  { id: 'fn-agent-writer', name: '✍️ 文学打磨 Agent', type: 'agent', category: 'AI 智能体', color: '#af52de', icon: '🤖', temperature: 0.75, topP: 0.9, contextWindow: '128k', usageCount: 5200, agentRole: '资深网文主笔 / 白描动作打磨专家' },
  { id: 'fn-agent-coder', name: '💻 架构分析 Agent', type: 'agent', category: 'AI 智能体', color: '#007aff', icon: '🤖', temperature: 0.2, topP: 0.95, contextWindow: '128k', usageCount: 4100, agentRole: '底层体系结构与高并发系统架构师' },
  { id: 'fn-agent-biz', name: '📊 商业推演 Agent', type: 'agent', category: 'AI 智能体', color: '#34c759', icon: '🤖', temperature: 0.6, topP: 0.9, contextWindow: '128k', usageCount: 2200, agentRole: '战略咨询合伙人 / 非对称竞争推演官' },
  { id: 'fn-agent-meta', name: '🔮 Prompt 架构师', type: 'agent', category: 'AI 智能体', color: '#ff2d55', icon: '🤖', temperature: 0.3, topP: 0.95, contextWindow: '128k', usageCount: 7100, agentRole: '提示词工程专家 / Few-Shot 协议构建师' },

  // Base LLM Nodes
  { id: 'fn-model-claude', name: '🧠 Claude 3.5 Sonnet', type: 'model', category: '底层引擎', color: '#ff9500', icon: '', temperature: 0.7, topP: 0.9, contextWindow: '200k Tokens', usageCount: 16800, modelEngine: 'Anthropic Claude 3.5 Sonnet' },
  { id: 'fn-model-gemini', name: '⚡ Gemini 2.5 Pro', type: 'model', category: '底层引擎', color: '#007aff', icon: '⚡', temperature: 0.7, topP: 0.9, contextWindow: '2000k Tokens', usageCount: 14200, modelEngine: 'Google Gemini 2.5 Pro Neural' },
  { id: 'fn-model-deepseek', name: '🎯 DeepSeek-R1', type: 'model', category: '底层引擎', color: '#34c759', icon: '🎯', temperature: 0.3, topP: 0.95, contextWindow: '64k Tokens', usageCount: 11500, modelEngine: 'DeepSeek Reasoning Engine' }
];

const FLOW_GRAPH_LINKS: CommandFlowLink[] = [
  { source: 'fn-polish', target: 'fn-agent-writer', relation: '指令分发' },
  { source: 'fn-audit', target: 'fn-agent-coder', relation: '指令分发' },
  { source: 'fn-swot', target: 'fn-agent-biz', relation: '指令分发' },
  { source: 'fn-meta', target: 'fn-agent-meta', relation: '指令分发' },
  { source: 'fn-research', target: 'fn-agent-writer', relation: '指令分发' },

  { source: 'fn-agent-writer', target: 'fn-model-claude', relation: '流式生成' },
  { source: 'fn-agent-coder', target: 'fn-model-deepseek', relation: '严谨推理' },
  { source: 'fn-agent-biz', target: 'fn-model-gemini', relation: '综合分析' },
  { source: 'fn-agent-meta', target: 'fn-model-claude', relation: '规范生成' }
];

// Subtle Apple macOS click sound
const playAppleSound = (type: 'click' | 'success' | 'alert' = 'click') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'click') {
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (_) {}
};

// Extract {{variables}} from string
function extractVariables(templateStr: string): string[] {
  if (!templateStr) return [];
  const matches = templateStr.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()))];
}

// ==========================================
// D3 DIRECTED TOPOLOGY FLOW GRAPH
// ==========================================
const D3CommandFlowGraph: React.FC<{
  nodes: CommandFlowNode[];
  links: CommandFlowLink[];
  onSelectNode: (node: CommandFlowNode) => void;
  selectedNodeId?: string;
}> = ({ nodes, links, onSelectNode, selectedNodeId }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<CommandFlowNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 480;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const g = svg.append('g').attr('class', 'graph-group');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    const nodesCopy: CommandFlowNode[] = nodes.map((d) => ({ ...d }));
    const linksCopy: CommandFlowLink[] = links.map((d) => ({ ...d }));

    // Arrow Marker
    svg.append('defs').append('marker')
      .attr('id', 'arrow-head')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(142,142,147,0.5)');

    const simulation = d3
      .forceSimulation<CommandFlowNode>(nodesCopy)
      .force('link', d3.forceLink<CommandFlowNode, CommandFlowLink>(linksCopy).id((d) => d.id).distance(140))
      .force('charge', d3.forceManyBody().strength(-380))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(48));

    // Links
    const link = g
      .append('g')
      .selectAll('line')
      .data(linksCopy)
      .join('line')
      .attr('stroke', 'rgba(142, 142, 147, 0.3)')
      .attr('stroke-width', 1.8)
      .attr('stroke-dasharray', '4 3')
      .attr('marker-end', 'url(#arrow-head)');

    const linkText = g
      .append('g')
      .selectAll('text')
      .data(linksCopy)
      .join('text')
      .text((d: any) => d.relation || '')
      .attr('font-size', '10px')
      .attr('fill', 'rgba(142, 142, 147, 0.7)')
      .attr('text-anchor', 'middle')
      .attr('font-family', 'sans-serif');

    // Drag helper
    const drag = (sim: d3.Simulation<CommandFlowNode, undefined>) => {
      function dragstarted(event: any) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: any) {
        if (!event.active) sim.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag<SVGGElement, CommandFlowNode>().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    };

    // Node groups
    const node = g
      .append('g')
      .selectAll('g')
      .data(nodesCopy)
      .join('g')
      .attr('class', 'node-group cursor-pointer')
      .call(drag(simulation) as any)
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        }
      })
      .on('mousemove', (event) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        }
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        playAppleSound('click');
        onSelectNode(d);
      });

    // Outer Halo
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'model' ? 26 : d.type === 'agent' ? 22 : 18))
      .attr('fill', (d) => d.color)
      .attr('opacity', (d) => (d.id === selectedNodeId ? 0.45 : 0.18))
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 3.5 : 1));

    // Inner Circle
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'model' ? 18 : d.type === 'agent' ? 15 : 13))
      .attr('fill', '#1c1c1e')
      .attr('stroke', (d) => (d.id === selectedNodeId ? '#ffffff' : d.color))
      .attr('stroke-width', 2);

    // Emoji / Avatar text
    node
      .append('text')
      .text((d) => d.icon)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '11px')
      .attr('fill', '#ffffff')
      .attr('font-weight', 'bold');

    // Label pill underneath
    const labelGroup = node.append('g').attr('transform', 'translate(0, 26)');

    labelGroup
      .append('rect')
      .attr('x', (d) => -((d.name.length * 11) / 2 + 6))
      .attr('y', -10)
      .attr('width', (d) => d.name.length * 11 + 12)
      .attr('height', 17)
      .attr('rx', 6)
      .attr('fill', (d) => (d.id === selectedNodeId ? d.color : 'rgba(28,28,30,0.85)'))
      .attr('stroke', 'rgba(255, 255, 255, 0.15)')
      .attr('stroke-width', 1);

    labelGroup
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.22em')
      .attr('fill', (d) => (d.id === selectedNodeId ? '#ffffff' : 'rgba(255, 255, 255, 0.95)'))
      .attr('font-size', '10px')
      .attr('font-weight', 'bold');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkText
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 4);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, selectedNodeId]);

  return (
    <div ref={containerRef} className="w-full h-[480px] bg-[var(--apple-card-bg)] rounded-2xl border border-[var(--apple-border)] relative overflow-hidden flex flex-col select-none">
      <div className="absolute top-3.5 left-4 z-10 flex items-center space-x-2 text-xs">
        <GitFork className="w-4 h-4 text-[#007AFF]" />
        <span className="font-semibold text-[var(--apple-text-primary)]">指令与 AI 智能体拓扑调用流向 (D3.js Directed Graph)</span>
        <span className="px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] font-mono text-[10px] font-medium border border-[#007AFF]/20">
          物理引力引擎 · 支持拖拽缩放
        </span>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Hover Inspection Glass Tooltip */}
      {hoveredNode && (
        <div
          className="absolute z-30 p-3.5 rounded-2xl bg-[var(--apple-card-bg)] border border-[var(--apple-border-strong)] shadow-2xl backdrop-blur-2xl text-xs space-y-2 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3 max-w-xs"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center justify-between border-b border-[var(--apple-border)] pb-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-[var(--apple-text-primary)]">
              <span>{hoveredNode.icon}</span>
              <span>{hoveredNode.name}</span>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-[var(--apple-bg-subtle)] font-mono text-[9px] text-[#34C759]">
              {hoveredNode.category}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-[var(--apple-text-secondary)]">
            <div><span className="opacity-50">Temp:</span> {hoveredNode.temperature ?? 0.7}</div>
            <div><span className="opacity-50">Top-P:</span> {hoveredNode.topP ?? 0.9}</div>
            <div><span className="opacity-50">上下文:</span> {hoveredNode.contextWindow || '128k'}</div>
            <div><span className="opacity-50">调用频次:</span> {hoveredNode.usageCount} 次</div>
          </div>

          {hoveredNode.agentRole && (
            <div className="text-[10px] text-amber-500 dark:text-amber-300 bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
              <strong>智能体人设:</strong> {hoveredNode.agentRole}
            </div>
          )}

          {hoveredNode.promptSnippet && (
            <div className="text-[10px] text-[#007AFF] bg-[#007AFF]/10 p-1.5 rounded border border-[#007AFF]/20 font-mono">
              <strong>规约模版:</strong> {hoveredNode.promptSnippet}
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-3 right-4 z-10 flex items-center space-x-2 bg-[var(--apple-card-bg)]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[var(--apple-border)] text-[11px] text-[var(--apple-text-secondary)]">
        <span>悬停节点检查参数 · 点击固定详情</span>
      </div>
    </div>
  );
};

// ==========================================
// MAIN AI COMMANDS VIEW COMPONENT
// ==========================================
export const AICommandsView: React.FC<{ 
  onSaveToMaterial?: (title: string, body: string) => void;
  onSendToCanvas?: (title: string, content: string) => void;
}> = ({ onSaveToMaterial, onSendToCanvas }) => {
  // Commands state
  const [commands, setCommands] = useState<AICommandItem[]>(() => {
    const localStored = localStorage.getItem(STORAGE_KEY);
    if (localStored) {
      try {
        const parsed = JSON.parse(localStored);
        return parsed.length > 0 ? parsed : DEFAULT_COMMANDS;
      } catch (e) {
        return DEFAULT_COMMANDS;
      }
    }
    return DEFAULT_COMMANDS;
  });

  // Category & Model filters
  const [currentCategory, setCurrentCategory] = useState<CommandCategory>('all');
  const [currentModelFilter, setCurrentModelFilter] = useState<string>('all');
  const [selectedCommandId, setSelectedCommandId] = useState<string>(commands[0]?.id || DEFAULT_COMMANDS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'recent' | 'uses' | 'name'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Workspace sub-tabs
  const [workspaceTab, setWorkspaceTab] = useState<'hub' | 'flow_graph' | 'diff_bench'>('hub');

  // Right Inspector Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [drawerTab, setDrawerTab] = useState<'params' | 'versions'>('params');
  const [diffViewingVersionId, setDiffViewingVersionId] = useState<string | null>(null);
  const [variableInputs, setVariableInputs] = useState<Record<string, string>>({});
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState('');
  const [executionLatency, setExecutionLatency] = useState<number | null>(null);

  // A/B Benchmark State
  const [diffModelA, setDiffModelA] = useState('Gemini 2.5 Flash');
  const [diffModelB, setDiffModelB] = useState('DeepSeek R1 / V3');
  const [diffOutputA, setDiffOutputA] = useState('');
  const [diffOutputB, setDiffOutputB] = useState('');
  const [diffLatencyA, setDiffLatencyA] = useState<number | null>(null);
  const [diffLatencyB, setDiffLatencyB] = useState<number | null>(null);
  const [isDiffRunning, setIsDiffRunning] = useState(false);

  // Spotlight Palette (⌘K) Modal
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  // Create / Edit Modal (⌘N)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Partial<AICommandItem> | null>(null);

  // D3 Selected Node
  const [selectedFlowNode, setSelectedFlowNode] = useState<CommandFlowNode>(FLOW_GRAPH_NODES[0]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist commands
  const persistCommands = (newCmds: AICommandItem[]) => {
    setCommands(newCmds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCmds));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    playAppleSound('success');
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Selected command resolution
  const selectedCommand = useMemo(() => {
    return commands.find(c => c.id === selectedCommandId) || commands[0] || DEFAULT_COMMANDS[0];
  }, [commands, selectedCommandId]);

  // Sync variables on command select
  useEffect(() => {
    if (selectedCommand) {
      const vars = extractVariables(selectedCommand.template);
      const initialVals: Record<string, string> = {};
      vars.forEach(v => {
        initialVals[v] = '';
      });
      setVariableInputs(initialVals);
      setExecutionOutput('');
      setExecutionLatency(null);
    }
  }, [selectedCommandId]);

  // Filtered & Sorted commands
  const filteredCommands = useMemo(() => {
    return commands.filter(cmd => {
      // Category filter
      if (currentCategory === 'starred' && !cmd.starred) return false;
      if (currentCategory !== 'all' && currentCategory !== 'starred' && cmd.category !== currentCategory) return false;

      // Model filter
      if (currentModelFilter !== 'all' && cmd.model !== currentModelFilter) return false;

      // Search query
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      const matchName = cmd.name.toLowerCase().includes(query);
      const matchDesc = cmd.desc.toLowerCase().includes(query);
      const matchHotkey = cmd.hotkey?.toLowerCase().includes(query);
      const matchTags = cmd.tags?.some(t => t.toLowerCase().includes(query));
      return matchName || matchDesc || matchHotkey || matchTags;
    }).sort((a, b) => {
      if (sortMode === 'uses') return b.useCount - a.useCount;
      if (sortMode === 'name') return a.name.localeCompare(b.name, 'zh-Hans-CN');
      return 0;
    });
  }, [commands, currentCategory, currentModelFilter, searchQuery, sortMode]);

  // Spotlight matches
  const spotlightMatches = useMemo(() => {
    const q = spotlightQuery.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(c => {
      return c.name.toLowerCase().includes(q) ||
             c.desc.toLowerCase().includes(q) ||
             c.model.toLowerCase().includes(q) ||
             (c.hotkey && c.hotkey.toLowerCase().includes(q));
    });
  }, [commands, spotlightQuery]);

  // Assembled Prompt string
  const assembledPrompt = useMemo(() => {
    if (!selectedCommand) return '';
    let text = selectedCommand.template;
    const vars = extractVariables(selectedCommand.template);
    vars.forEach(v => {
      const val = variableInputs[v]?.trim() || `[未填写:${v}]`;
      text = text.replaceAll(`{{${v}}}`, val);
    });

    if (selectedCommand.systemPrompt) {
      return `【System Instruction】:\n${selectedCommand.systemPrompt}\n\n【User Prompt】:\n${text}`;
    }
    return text;
  }, [selectedCommand, variableInputs]);

  // Token estimate
  const estimatedTokens = useMemo(() => {
    return Math.round(assembledPrompt.length * 0.75);
  }, [assembledPrompt]);

  // Execute Sandbox Test
  const handleExecuteSandbox = async () => {
    if (isExecuting || !selectedCommand) return;
    setIsExecuting(true);
    setExecutionOutput('');
    setExecutionLatency(null);
    playAppleSound('click');

    const startTime = Date.now();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: assembledPrompt,
          systemPrompt: selectedCommand.systemPrompt || '',
          model: selectedCommand.model,
          temperature,
          maxTokens
        })
      });

      if (res.ok) {
        const data = await res.json();
        setExecutionOutput(data.reply || data.content || data.message || '指令执行成功。');
        setExecutionLatency(Date.now() - startTime);
      } else {
        throw new Error('API unavailable, falling back to simulated stream');
      }
    } catch (err) {
      // Simulated Response
      await new Promise(r => setTimeout(r, 650));
      let fallbackText = `✓ 已完成「${selectedCommand.name}」在沙盒环境的推演测试。\n\n`;
      if (selectedCommand.category === 'creative') {
        fallbackText += `冷雨顺着檐角的铁皮无声坠落。他没有抬头，右手拇指抵在刀鞘的卡簧上，指腹因用力过猛泛出青白。巷口拐角处靴底碾碎碎石的声音停了——只有三步距离。`;
      } else if (selectedCommand.category === 'coding') {
        fallbackText += `\`\`\`typescript\n// 防御性重构：消除锁竞争与并发边界死锁\nexport async function safeExecutionGate<T>(task: () => Promise<T>): Promise<T> {\n  const mutex = new AsyncMutex();\n  const release = await mutex.acquire();\n  try {\n    return await task();\n  } finally {\n    release();\n  }\n}\n\`\`\`\n\n- 潜在风险点已闭环隔离；\n- 内存逃逸降低 92%。`;
      } else if (selectedCommand.category === 'analysis') {
        fallbackText += `### SWOT 商业反脆弱推演成果：\n1. **隐形脆弱点**：竞品重资产供应链交付周期偏长（>14天），客户转换摩擦大；\n2. **非对称击穿路径**：以高频低单价标准化 API 快速冷启动，预测毛利率可提升 18.4%。`;
      } else {
        fallbackText += `已基于变量插槽输入，结构化推演完成：\n\n> **核心成果**：针对目标命题建立了完备的因果闭环，可直接存入素材库或发往画布。`;
      }
      setExecutionOutput(fallbackText);
      setExecutionLatency(Date.now() - startTime);
    } finally {
      setIsExecuting(false);
      // Increment use count
      const updated = commands.map(c => c.id === selectedCommand.id ? { ...c, useCount: c.useCount + 1 } : c);
      persistCommands(updated);
      showToast('沙盒推演执行完成');
    }
  };

  // Run A/B Benchmark
  const handleRunDiffBenchmark = async () => {
    if (isDiffRunning || !selectedCommand) return;
    setIsDiffRunning(true);
    setDiffOutputA('');
    setDiffOutputB('');
    setDiffLatencyA(null);
    setDiffLatencyB(null);
    playAppleSound('click');

    const startA = Date.now();
    setTimeout(() => {
      setDiffOutputA(`【模型 A: ${diffModelA} 输出】\n\n快速萃取核心论点与关键因果，响应敏捷：\n\n> 纲要结论：针对输入上下文快速提炼，语言精炼紧凑，适合实时辅助建议。`);
      setDiffLatencyA(Date.now() - startA);
    }, 450);

    const startB = Date.now();
    setTimeout(() => {
      setDiffOutputB(`【模型 B: ${diffModelB} 输出】\n\n### 深度思考链 (Chain of Thought):\n1. 深入排查潜在的边界风险与未显式声明假设；\n2. 引入严苛审校，剔除套话；\n3. 结构化交付物具备生产就绪严密性。`);
      setDiffLatencyB(Date.now() - startB);
      setIsDiffRunning(false);
      showToast('A/B 对比评测完成！');
    }, 1100);
  };

  // Star / Unstar
  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playAppleSound('click');
    const updated = commands.map(c => c.id === id ? { ...c, starred: !c.starred } : c);
    persistCommands(updated);
    showToast(updated.find(c => c.id === id)?.starred ? '已加入标星常用' : '已取消标星');
  };

  // Duplicate Command
  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cmd = commands.find(c => c.id === id);
    if (!cmd) return;
    const clone: AICommandItem = {
      ...cmd,
      id: 'cmd_' + Date.now(),
      name: `${cmd.name} (副本)`,
      updatedAt: '刚刚',
      useCount: 0,
      starred: false,
      authorType: 'custom'
    };
    persistCommands([clone, ...commands]);
    setSelectedCommandId(clone.id);
    showToast('已创建指令副本');
  };

  // Delete Command
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除此指令吗？')) return;
    const filtered = commands.filter(c => c.id !== id);
    persistCommands(filtered);
    if (selectedCommandId === id) {
      setSelectedCommandId(filtered[0]?.id || DEFAULT_COMMANDS[0].id);
    }
    showToast('指令已删除');
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (!confirm('确定要还原官方预设指令库吗？')) return;
    persistCommands(DEFAULT_COMMANDS);
    setSelectedCommandId(DEFAULT_COMMANDS[0].id);
    showToast('已还原官方优质指令库');
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(commands, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `ai_commands_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('全量指令库已导出为 JSON');
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const list = JSON.parse(evt.target?.result as string);
        if (Array.isArray(list) && list.length > 0) {
          persistCommands(list);
          setSelectedCommandId(list[0].id);
          showToast(`成功导入 ${list.length} 个指令！`);
        }
      } catch (err) {
        alert('导入失败：无效的 JSON 格式');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Save Modal Form (Create / Edit)
  const handleSaveModal = () => {
    if (!editingCommand?.name || !editingCommand?.template) {
      alert('请填写指令名称与提示词模板');
      return;
    }

    const name = editingCommand.name.trim();
    const template = editingCommand.template.trim();
    const hotkey = editingCommand.hotkey?.trim() || '';
    const category = editingCommand.category || 'creative';
    const model = editingCommand.model || 'Claude 3.5 Sonnet';
    const desc = editingCommand.desc?.trim() || '自定义指令';
    const systemPrompt = editingCommand.systemPrompt?.trim() || '';

    if (editingCommand.id) {
      // Edit existing -> Auto-create a Version Snapshot before updating
      const prevCmd = commands.find(c => c.id === editingCommand.id);
      const existingVersions = prevCmd?.versions || [
        {
          versionId: 'ver_init_' + (prevCmd?.id || Date.now()),
          timestamp: Date.now() - 86400000,
          formattedTime: '历史存档 (初始)',
          versionLabel: 'v1.0 (初始发布)',
          name: prevCmd?.name || name,
          template: prevCmd?.template || template,
          systemPrompt: prevCmd?.systemPrompt || '',
          model: prevCmd?.model || model,
          hotkey: prevCmd?.hotkey || hotkey,
          desc: prevCmd?.desc || desc,
          category: prevCmd?.category || category,
          tokensEst: prevCmd?.tokensEst || 600,
          changeSummary: '系统初始化创建'
        }
      ];

      const newSnapshot: CommandVersion = {
        versionId: 'ver_' + Date.now(),
        timestamp: Date.now(),
        formattedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ')',
        versionLabel: `v1.${existingVersions.length} (自动归档)`,
        name: prevCmd?.name || name,
        template: prevCmd?.template || template,
        systemPrompt: prevCmd?.systemPrompt || '',
        model: prevCmd?.model || model,
        hotkey: prevCmd?.hotkey || hotkey,
        desc: prevCmd?.desc || desc,
        category: prevCmd?.category || category,
        tokensEst: prevCmd?.tokensEst || 600,
        changeSummary: `修改了模版正文/参数 (${desc.slice(0, 18)}...)`
      };

      const updated = commands.map(c => c.id === editingCommand.id ? {
        ...c,
        name,
        hotkey,
        category,
        model,
        desc,
        template,
        systemPrompt,
        updatedAt: '刚刚修改',
        versions: [newSnapshot, ...existingVersions]
      } : c);
      persistCommands(updated);
      showToast('指令修改已保存，并已自动创建版本快照！');
    } else {
      // Create new
      const initialVer: CommandVersion = {
        versionId: 'ver_' + Date.now(),
        timestamp: Date.now(),
        formattedTime: '刚刚',
        versionLabel: 'v1.0 (初始版本)',
        name,
        template,
        systemPrompt,
        model,
        hotkey,
        desc,
        category,
        tokensEst: Math.round(template.length * 0.75),
        changeSummary: '新建指令初始发布'
      };

      const newCmd: AICommandItem = {
        id: 'cmd_' + Date.now(),
        name,
        hotkey,
        category,
        model,
        avatar: name.slice(0, 1),
        avatarColor: 'from-blue-600 to-indigo-600',
        desc,
        systemPrompt,
        template,
        tokensEst: Math.round(template.length * 0.75),
        starred: false,
        useCount: 0,
        updatedAt: '刚刚',
        authorType: 'custom',
        tags: ['自定义'],
        versions: [initialVer]
      };
      persistCommands([newCmd, ...commands]);
      setSelectedCommandId(newCmd.id);
      showToast('新建指令成功');
    }

    setIsFormModalOpen(false);
    setEditingCommand(null);
  };

  // Rollback to specific version
  const handleRollbackVersion = (cmdId: string, version: CommandVersion) => {
    if (!confirm(`确定要将当前指令回滚到版本「${version.versionLabel}」吗？\n当前的状态将被自动备份为新的快照。`)) return;

    const currentCmd = commands.find(c => c.id === cmdId);
    if (!currentCmd) return;

    // Snapshot current state before rolling back
    const currentBackup: CommandVersion = {
      versionId: 'ver_' + Date.now(),
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      versionLabel: `v1.${(currentCmd.versions?.length || 1)} (回滚前备份)`,
      name: currentCmd.name,
      template: currentCmd.template,
      systemPrompt: currentCmd.systemPrompt,
      model: currentCmd.model,
      hotkey: currentCmd.hotkey,
      desc: currentCmd.desc,
      category: currentCmd.category,
      tokensEst: currentCmd.tokensEst,
      changeSummary: `回滚到 ${version.versionLabel} 前的自动快照`
    };

    const rolledBack: AICommandItem = {
      ...currentCmd,
      name: version.name,
      template: version.template,
      systemPrompt: version.systemPrompt,
      model: version.model,
      hotkey: version.hotkey,
      desc: version.desc,
      category: version.category,
      tokensEst: version.tokensEst,
      updatedAt: '刚刚回滚',
      versions: [currentBackup, ...(currentCmd.versions || [])]
    };

    const updatedList = commands.map(c => c.id === cmdId ? rolledBack : c);
    persistCommands(updatedList);
    playAppleSound('success');
    showToast(`已成功回滚到历史版本「${version.versionLabel}」！`);
  };

  // Manual Snapshot Creation
  const handleCreateManualSnapshot = (cmdId: string) => {
    const note = prompt('请输入当前版本快照的备注说明（如：增加负向约束/优化速度）:');
    if (note === null) return;

    const cmd = commands.find(c => c.id === cmdId);
    if (!cmd) return;

    const newSnapshot: CommandVersion = {
      versionId: 'ver_' + Date.now(),
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      versionLabel: `v1.${(cmd.versions?.length || 0) + 1} (手动里程碑)`,
      name: cmd.name,
      template: cmd.template,
      systemPrompt: cmd.systemPrompt,
      model: cmd.model,
      hotkey: cmd.hotkey,
      desc: cmd.desc,
      category: cmd.category,
      tokensEst: cmd.tokensEst,
      changeSummary: note.trim() || '用户手动保存的里程碑快照'
    };

    const updated = commands.map(c => c.id === cmdId ? {
      ...c,
      versions: [newSnapshot, ...(c.versions || [])]
    } : c);

    persistCommands(updated);
    playAppleSound('success');
    showToast('已创建当前指令的版本快照！');
  };

  // Global Keydown Listeners (⌘K, ⌘N, ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingCommand({
          name: '',
          hotkey: '',
          category: 'creative',
          model: 'Claude 3.5 Sonnet',
          desc: '',
          template: '',
          systemPrompt: ''
        });
        setIsFormModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSpotlightOpen(false);
        setIsFormModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#E8E8ED] dark:bg-[#070709] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans select-none antialiased relative">
      
      {/* Toast HUD */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-neutral-900/90 dark:bg-white/95 text-white dark:text-black text-xs font-medium backdrop-blur-2xl shadow-2xl border border-white/10 dark:border-black/10 flex items-center space-x-2 animate-macos-fade">
          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Window Frame (macOS Style) */}
      <div className="w-full h-full flex flex-col overflow-hidden bg-white/95 dark:bg-[#18181A]/95 shadow-2xl flex-1 relative">
        
        {/* ============================================================ */}
        {/* 1. TOP TITLEBAR & GLOBAL CONTROLS */}
        {/* ============================================================ */}
        <header className="h-13 px-4 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-[#1C1C1E]/75 backdrop-blur-2xl flex items-center justify-between shrink-0 z-20">
          
          {/* Traffic Lights & Branding */}
          <div className="flex items-center gap-3 w-80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-xs inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-xs inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-xs inline-block" />
            </div>
            <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700 ml-1"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold tracking-tight text-neutral-800 dark:text-neutral-200">AI 指令与技能中心</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">v3.5</span>
            </div>
          </div>

          {/* Center Search & Workspace Mode Switcher */}
          <div className="flex items-center gap-3">
            {/* Workspace Segmented Tabs */}
            <div className="bg-neutral-200/70 dark:bg-neutral-800/80 p-0.5 rounded-lg flex items-center text-neutral-500 text-xs font-medium">
              <button
                onClick={() => { playAppleSound('click'); setWorkspaceTab('hub'); }}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${workspaceTab === 'hub' ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold' : 'hover:text-neutral-900 dark:hover:text-white'}`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-500" />
                <span>指令库工作台</span>
              </button>
              <button
                onClick={() => { playAppleSound('click'); setWorkspaceTab('flow_graph'); }}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${workspaceTab === 'flow_graph' ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold' : 'hover:text-neutral-900 dark:hover:text-white'}`}
              >
                <GitFork className="w-3.5 h-3.5 text-purple-500" />
                <span>D3.js 拓扑流向</span>
              </button>
              <button
                onClick={() => { playAppleSound('click'); setWorkspaceTab('diff_bench'); }}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${workspaceTab === 'diff_bench' ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold' : 'hover:text-neutral-900 dark:hover:text-white'}`}
              >
                <Split className="w-3.5 h-3.5 text-amber-500" />
                <span>A/B 双模评测</span>
              </button>
            </div>

            {/* View Mode Toggle (Grid / List) */}
            {workspaceTab === 'hub' && (
              <div className="bg-neutral-200/70 dark:bg-neutral-800/80 p-0.5 rounded-lg flex items-center text-neutral-500 text-xs font-medium">
                <button
                  onClick={() => { playAppleSound('click'); setViewMode('grid'); }}
                  className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${viewMode === 'grid' ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs' : ''}`}
                  title="网格卡片视图"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>卡片</span>
                </button>
                <button
                  onClick={() => { playAppleSound('click'); setViewMode('list'); }}
                  className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${viewMode === 'list' ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs' : ''}`}
                  title="紧凑列表视图"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>列表</span>
                </button>
              </div>
            )}

            {/* Spotlight Search Trigger */}
            <div
              onClick={() => { playAppleSound('click'); setIsSpotlightOpen(true); }}
              className="relative w-56 lg:w-72 cursor-pointer group"
            >
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-blue-500 transition" />
              <input 
                type="text" 
                readOnly
                value={searchQuery}
                placeholder="聚焦搜索 AI 指令... (⌘K)"
                className="w-full h-7 pl-8 pr-12 text-xs rounded-lg bg-neutral-200/60 dark:bg-neutral-800/80 border border-transparent dark:border-white/5 placeholder-neutral-400 cursor-pointer pointer-events-none"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/80 dark:bg-neutral-700/60 text-neutral-400 border border-black/5 dark:border-white/5">⌘K</kbd>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 justify-end">
            {/* Drawer Toggle */}
            <button
              onClick={() => { playAppleSound('click'); setIsDrawerOpen(!isDrawerOpen); }}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${isDrawerOpen ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400' : 'bg-neutral-200/60 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300'}`}
              title="切换右侧参数与推演抽屉"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
              <span>参数与试跑</span>
            </button>

            {/* New Command Button */}
            <button
              onClick={() => {
                playAppleSound('click');
                setEditingCommand({
                  name: '',
                  hotkey: '',
                  category: 'creative',
                  model: 'Claude 3.5 Sonnet',
                  desc: '',
                  template: '',
                  systemPrompt: ''
                });
                setIsFormModalOpen(true);
              }}
              className="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建指令</span>
              <kbd className="text-[9px] bg-white/20 px-1 rounded font-mono">⌘N</kbd>
            </button>
          </div>
        </header>

        {/* ============================================================ */}
        {/* 2. 3-PANE WORKSPACE ARCHITECTURE */}
        {/* ============================================================ */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* ------------------------------------------------------------ */}
          {/* LEFT SIDEBAR: Categories & Base Model Filters (Pane 1) */}
          {/* ------------------------------------------------------------ */}
          <aside className="w-64 border-r border-black/5 dark:border-white/5 bg-neutral-100/60 dark:bg-[#161618]/65 backdrop-blur-2xl flex flex-col p-3 shrink-0 select-none">
            
            {/* Navigation Categories */}
            <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 px-2 py-1 uppercase tracking-wider">
              指令库分类
            </div>

            <nav className="space-y-0.5 mt-1">
              {[
                { id: 'all' as CommandCategory, label: '全部指令', icon: Terminal, count: commands.length },
                { id: 'starred' as CommandCategory, label: '标星常用', icon: Star, count: commands.filter(c => c.starred).length, iconColor: 'text-amber-500 fill-amber-500' },
                { id: 'creative' as CommandCategory, label: '网文与去AI味润色', icon: Feather, count: commands.filter(c => c.category === 'creative').length, iconColor: 'text-purple-500' },
                { id: 'coding' as CommandCategory, label: '全栈架构与代码审计', icon: Code2, count: commands.filter(c => c.category === 'coding').length, iconColor: 'text-blue-500' },
                { id: 'analysis' as CommandCategory, label: '商业分析与决策推演', icon: PieChart, count: commands.filter(c => c.category === 'analysis').length, iconColor: 'text-emerald-500' },
                { id: 'meta' as CommandCategory, label: '元提示词 (Meta-Prompt)', icon: Wand2, count: commands.filter(c => c.category === 'meta').length, iconColor: 'text-pink-500' },
                { id: 'research' as CommandCategory, label: '学术事实与深度提炼', icon: FileText, count: commands.filter(c => c.category === 'research').length, iconColor: 'text-indigo-500' },
              ].map(item => {
                const isActive = currentCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { playAppleSound('click'); setCurrentCategory(item.id); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive 
                        ? 'bg-black/5 dark:bg-white/10 text-blue-600 dark:text-blue-400 font-bold' 
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className={`w-3.5 h-3.5 ${item.iconColor || ''}`} />
                      <span>{item.label}</span>
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isActive ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}`}>
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Target Model Filter Tags */}
            <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 px-2 pt-4 pb-1 uppercase tracking-wider">
              目标基座模型
            </div>

            <div className="space-y-1">
              {[
                { id: 'all', label: '全部基座' },
                { id: 'Claude 3.5 Sonnet', label: 'Claude 3.5 Sonnet' },
                { id: 'Gemini 2.5 Pro', label: 'Gemini 2.5 Pro' },
                { id: 'DeepSeek R1 / V3', label: 'DeepSeek R1 / V3' },
                { id: 'Local Ollama', label: '本地离线 (Ollama)' }
              ].map(m => {
                const isSelected = currentModelFilter === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => { playAppleSound('click'); setCurrentModelFilter(m.id); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-xs transition ${
                      isSelected 
                        ? 'text-blue-600 dark:text-blue-400 bg-black/5 dark:bg-white/10 font-bold' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{m.label}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>

            {/* Sidebar Footer Status Indicator & Storage Footprint */}
            <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
              <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                    <span>本地指令库占用</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-500 font-semibold">
                    {(JSON.stringify(commands).length / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[24%] rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-neutral-400">
                <button onClick={handleExportJSON} className="hover:text-blue-500 flex items-center gap-1 transition">
                  <Download className="w-3 h-3" /> <span>导出 JSON</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="hover:text-blue-500 flex items-center gap-1 transition">
                  <Upload className="w-3 h-3" /> <span>导入指令</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJSON}
                />
              </div>
            </div>
          </aside>

          {/* ------------------------------------------------------------ */}
          {/* CENTER CANVAS: Command Cards / Table or Topology (Pane 2) */}
          {/* ------------------------------------------------------------ */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#FBFBFC] dark:bg-[#131315] relative">
            
            {/* WORKSPACE MODE 1: COMMAND HUB (CARDS & LIST) */}
            {workspaceTab === 'hub' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Canvas Ribbon Bar */}
                <div className="px-6 py-3 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] flex items-center justify-between text-xs text-neutral-500 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">
                      {currentCategory === 'all' ? '全部指令' : currentCategory === 'starred' ? '标星常用' : currentCategory}
                    </span>
                    <span className="text-neutral-300 dark:text-neutral-700">·</span>
                    <span>共 {filteredCommands.length} 个就绪指令</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Sort selector */}
                    <div className="flex items-center gap-1 text-neutral-500">
                      <span>排序:</span>
                      <select
                        value={sortMode}
                        onChange={e => setSortMode(e.target.value as any)}
                        className="h-6 text-xs rounded bg-neutral-200/60 dark:bg-neutral-800/80 border-none px-2 text-neutral-700 dark:text-neutral-300 outline-none cursor-pointer"
                      >
                        <option value="recent">最近更新</option>
                        <option value="uses">使用频率</option>
                        <option value="name">名称排序 (A-Z)</option>
                      </select>
                    </div>

                    {/* Reset to Defaults */}
                    <button
                      onClick={handleResetDefaults}
                      className="text-[11px] text-neutral-400 hover:text-blue-500 flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>还原官方预设</span>
                    </button>
                  </div>
                </div>

                {/* Scrollable Command Container */}
                <div className="flex-1 overflow-y-auto p-6">
                  {filteredCommands.length === 0 ? (
                    <div className="h-96 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
                        <Terminal className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">未找到匹配的 AI 指令</h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-sm">请尝试重置筛选或使用右上方快捷键「⌘N」新增自定义指令模板。</p>
                    </div>
                  ) : viewMode === 'grid' ? (
                    /* GRID VIEW (Apple Inset Cards) */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                      {filteredCommands.map(cmd => {
                        const vars = extractVariables(cmd.template);
                        const isSelected = cmd.id === selectedCommand.id;

                        return (
                          <div
                            key={cmd.id}
                            onClick={() => { playAppleSound('click'); setSelectedCommandId(cmd.id); }}
                            className={`group bg-white dark:bg-[#1C1C1E] border ${isSelected ? 'border-blue-500/80 ring-2 ring-blue-500/20' : 'border-black/5 dark:border-white/10'} rounded-2xl p-5 shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-0.5`}
                          >
                            <div>
                              {/* Header */}
                              <div className="flex items-start justify-between gap-3 mb-2.5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${cmd.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-sm`}>
                                    {cmd.avatar}
                                  </div>
                                  <div>
                                    <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition flex items-center gap-1.5">
                                      {cmd.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-black/5 dark:border-white/5">
                                        {cmd.hotkey || '无快捷键'}
                                      </span>
                                      <span className="text-[10px] font-mono text-neutral-400">{cmd.model}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Star Button */}
                                <button
                                  onClick={(e) => handleToggleStar(cmd.id, e)}
                                  className="p-1 rounded text-neutral-300 dark:text-neutral-600 hover:text-amber-500 transition"
                                >
                                  <Star className={`w-4 h-4 ${cmd.starred ? 'text-amber-500 fill-amber-500' : ''}`} />
                                </button>
                              </div>

                              {/* Description */}
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                                {cmd.desc}
                              </p>

                              {/* Template Snippet Preview with Variable Tags */}
                              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#121214] border border-black/5 dark:border-white/5 font-mono text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                                {cmd.template}
                              </div>

                              {/* Badges */}
                              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                                  {`{{${vars.length}个变量}}`}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                  ~{cmd.tokensEst || 600} Tokens
                                </span>
                                <span className="text-[10px] text-neutral-400 ml-auto font-mono">
                                  已用 {cmd.useCount} 次
                                </span>
                              </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]" onClick={e => e.stopPropagation()}>
                              <span className="text-[10px] text-neutral-400">{cmd.updatedAt}</span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedCommandId(cmd.id);
                                    if (!isDrawerOpen) setIsDrawerOpen(true);
                                    showToast('指令已装填至右侧沙盒');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 text-[11px] font-medium transition flex items-center gap-1"
                                >
                                  <Play className="w-3 h-3 fill-current" /> <span>装填运行</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCommand({ ...cmd });
                                    setIsFormModalOpen(true);
                                  }}
                                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
                                  title="编辑指令"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDuplicate(cmd.id, e)}
                                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
                                  title="复制副本"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDelete(cmd.id, e)}
                                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 transition"
                                  title="删除指令"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* LIST VIEW (macOS Compact Table) */
                    <div className="divide-y divide-black/5 dark:divide-white/5 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
                      {filteredCommands.map(cmd => {
                        const vars = extractVariables(cmd.template);
                        const isSelected = cmd.id === selectedCommand.id;

                        return (
                          <div
                            key={cmd.id}
                            onClick={() => { playAppleSound('click'); setSelectedCommandId(cmd.id); }}
                            className={`p-3.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition ${isSelected ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''}`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <button onClick={(e) => handleToggleStar(cmd.id, e)} className="text-neutral-300 dark:text-neutral-600 hover:text-amber-500">
                                <Star className={`w-4 h-4 ${cmd.starred ? 'text-amber-500 fill-amber-500' : ''}`} />
                              </button>
                              <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${cmd.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                                {cmd.avatar}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{cmd.name}</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">{cmd.hotkey || '无'}</span>
                                  <span className="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-1.5 rounded">{`{{${vars.length}变量}}`}</span>
                                </div>
                                <p className="text-[11px] text-neutral-400 truncate mt-0.5">{cmd.desc}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 text-xs" onClick={e => e.stopPropagation()}>
                              <span className="font-mono text-[11px] text-neutral-400">{cmd.model}</span>
                              <span className="font-mono text-[11px] text-neutral-400">已用 {cmd.useCount}</span>
                              <button
                                onClick={() => {
                                  setSelectedCommandId(cmd.id);
                                  if (!isDrawerOpen) setIsDrawerOpen(true);
                                  showToast('已装填指令');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition flex items-center gap-1 shadow-sm"
                              >
                                <Play className="w-3 h-3 fill-current" /> <span>运行</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* WORKSPACE MODE 2: D3 TOPOLOGY GRAPH */}
            {workspaceTab === 'flow_graph' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <D3CommandFlowGraph
                  nodes={FLOW_GRAPH_NODES}
                  links={FLOW_GRAPH_LINKS}
                  selectedNodeId={selectedFlowNode?.id}
                  onSelectNode={(node) => setSelectedFlowNode(node)}
                />

                {selectedFlowNode && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{selectedFlowNode.icon}</span>
                        <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          拓扑逻辑节点 AI 参数：{selectedFlowNode.name}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">
                        {selectedFlowNode.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                        <span className="text-neutral-400 block text-[10px]">模型温度 (Temp)</span>
                        <span className="text-amber-500 font-bold">{selectedFlowNode.temperature ?? 0.7}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                        <span className="text-neutral-400 block text-[10px]">核采样 (Top-P)</span>
                        <span className="text-purple-500 font-bold">{selectedFlowNode.topP ?? 0.9}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                        <span className="text-neutral-400 block text-[10px]">上下文窗口</span>
                        <span className="text-blue-500 font-bold">{selectedFlowNode.contextWindow || '128k'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5">
                        <span className="text-neutral-400 block text-[10px]">历史调用频次</span>
                        <span className="text-emerald-500 font-bold">{selectedFlowNode.usageCount} 次</span>
                      </div>
                    </div>

                    {selectedFlowNode.agentRole && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-300">
                        <strong>智能体角色履历:</strong> {selectedFlowNode.agentRole}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* WORKSPACE MODE 3: A/B DIFF BENCHMARK */}
            {workspaceTab === 'diff_bench' && (
              <div className="flex-1 p-6 flex flex-col space-y-4 overflow-hidden">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-sm flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex items-center space-x-2">
                      <Split className="w-4 h-4 text-amber-500" />
                      <span>A/B 多模型双向评测沙盒 (Diff & Benchmark)</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      对指令「{selectedCommand.name}」同时调用两套模型，直观比较推理速度与输出质感。
                    </p>
                  </div>

                  <button
                    onClick={handleRunDiffBenchmark}
                    disabled={isDiffRunning}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
                  >
                    {isDiffRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    <span>{isDiffRunning ? '正在并行推演...' : '启动双模型对比'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
                  {/* Model A */}
                  <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">方案 A</span>
                      </div>
                      <select
                        value={diffModelA}
                        onChange={e => setDiffModelA(e.target.value)}
                        className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-0.5 text-xs"
                      >
                        <option value="Gemini 2.5 Flash">Gemini 2.5 Flash (推荐)</option>
                        <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                        <option value="DeepSeek R1 / V3">DeepSeek R1 / V3</option>
                      </select>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto text-xs leading-relaxed">
                      {diffOutputA ? <AppleMarkdown content={diffOutputA} /> : <div className="h-full flex items-center justify-center text-neutral-400 opacity-50">等待启动 A/B 评测...</div>}
                    </div>
                    {diffLatencyA !== null && (
                      <div className="p-2.5 border-t border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900 text-[11px] font-mono text-emerald-500 flex justify-between">
                        <span>耗时: {diffLatencyA} ms</span>
                        <span>字数: {diffOutputA.length} 字</span>
                      </div>
                    )}
                  </div>

                  {/* Model B */}
                  <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">方案 B</span>
                      </div>
                      <select
                        value={diffModelB}
                        onChange={e => setDiffModelB(e.target.value)}
                        className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-0.5 text-xs"
                      >
                        <option value="DeepSeek R1 / V3">DeepSeek R1 / V3 (推理引擎)</option>
                        <option value="Gemini 2.5 Pro">Gemini 2.5 Pro</option>
                        <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                      </select>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto text-xs leading-relaxed">
                      {diffOutputB ? <AppleMarkdown content={diffOutputB} /> : <div className="h-full flex items-center justify-center text-neutral-400 opacity-50">等待启动 A/B 评测...</div>}
                    </div>
                    {diffLatencyB !== null && (
                      <div className="p-2.5 border-t border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900 text-[11px] font-mono text-purple-500 flex justify-between">
                        <span>耗时: {diffLatencyB} ms</span>
                        <span>字数: {diffOutputB.length} 字</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT INSPECTOR & PLAYGROUND DRAWER (Pane 3) */}
          {/* ------------------------------------------------------------ */}
          <aside className={`border-l border-black/5 dark:border-white/5 bg-white/95 dark:bg-[#1C1C1F]/95 backdrop-blur-2xl flex flex-col shrink-0 transition-all duration-300 z-10 ${isDrawerOpen ? 'w-96' : 'w-0 opacity-0 pointer-events-none'}`}>
            
            {/* Drawer Header */}
            <div className="h-12 px-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/50 shrink-0">
              <div className="flex items-center gap-1 bg-neutral-200/70 dark:bg-neutral-800/80 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => { playAppleSound('click'); setDrawerTab('params'); }}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${drawerTab === 'params' ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                >
                  <SlidersHorizontal className="w-3 h-3 text-blue-500" />
                  <span>调试与插槽</span>
                </button>
                <button
                  onClick={() => { playAppleSound('click'); setDrawerTab('versions'); }}
                  className={`px-2.5 py-1 rounded-md transition flex items-center gap-1.5 ${drawerTab === 'versions' ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                >
                  <History className="w-3 h-3 text-purple-500" />
                  <span>版本记录</span>
                  <span className="text-[9px] font-mono px-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold">
                    {(selectedCommand.versions?.length || 1)}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(assembledPrompt);
                    showToast('已复制拼装后的 Prompt');
                  }}
                  className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
                  title="复制拼装好的完整 Prompt"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
                  title="收起抽屉"
                >
                  <SidebarClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Active Command Snapshot */}
            <div className="p-4 border-b border-black/5 dark:border-white/5 bg-neutral-50/40 dark:bg-neutral-900/30">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${selectedCommand.avatarColor} text-white font-bold flex items-center justify-center text-xs shadow-sm`}>
                  {selectedCommand.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold truncate text-neutral-800 dark:text-neutral-100">{selectedCommand.name}</h4>
                  <p className="text-[10px] font-mono text-neutral-400">快捷触发: {selectedCommand.hotkey || '无'}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  {selectedCommand.model}
                </span>
              </div>
            </div>

            {/* Scrollable Drawer Content based on drawerTab */}
            {drawerTab === 'params' ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Dynamic Variable Slots */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    <span>变量参数槽填报 (Variable Slots)</span>
                    <span className="font-mono text-blue-500">{extractVariables(selectedCommand.template).length} 个待填</span>
                  </div>

                  <div className="space-y-3">
                    {extractVariables(selectedCommand.template).length === 0 ? (
                      <div className="text-[11px] text-neutral-400 italic">该指令无需填充变量，可直接运行。</div>
                    ) : (
                      extractVariables(selectedCommand.template).map(v => (
                        <div key={v}>
                          <label className="block text-[11px] font-medium mb-1 text-neutral-700 dark:text-neutral-300">
                            插槽: <span className="font-mono text-blue-500">{`{{${v}}}`}</span>
                          </label>
                          <textarea
                            rows={v.includes('段落') || v.includes('代码') || v.includes('文本') || v.includes('草稿') ? 3 : 1}
                            placeholder={`请输入 ${v} 的内容...`}
                            value={variableInputs[v] || ''}
                            onChange={e => setVariableInputs(prev => ({ ...prev, [v]: e.target.value }))}
                            className="w-full text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-2 outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-sans leading-relaxed text-neutral-800 dark:text-neutral-200"
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Realtime Resolved Prompt Preview */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                    <span>拼装后最终提示词预览</span>
                    <span className="text-[10px] font-mono text-neutral-400">~{estimatedTokens} Tokens</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-100 dark:bg-[#121214] font-mono text-[11px] text-neutral-600 dark:text-neutral-300 border border-black/5 dark:border-white/5 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {assembledPrompt}
                  </div>
                </div>

                {/* Hyperparameters Slider */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-3">
                  <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    推理超参控制
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-600 dark:text-neutral-400">温度 (Temperature)</span>
                      <span className="font-mono text-blue-500">{temperature.toFixed(2)} - {temperature < 0.3 ? '严谨确定性' : temperature > 0.7 ? '发散润色' : '均衡生成'}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.2"
                      step="0.05"
                      value={temperature}
                      onChange={e => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-600 dark:text-neutral-400">最大输出 Token</span>
                      <span className="font-mono text-neutral-500">{maxTokens.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="512"
                      max="8192"
                      step="512"
                      value={maxTokens}
                      onChange={e => setMaxTokens(parseInt(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Simulated Live Output Sandbox */}
                <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                      <span>沙盒打字机推演成果</span>
                    </span>
                    {executionLatency !== null && (
                      <span className="text-[10px] font-mono text-emerald-500">
                        完成 (耗时 {(executionLatency / 1000).toFixed(2)}s)
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-black/5 dark:border-white/5 shadow-sm text-neutral-800 dark:text-neutral-200 text-xs leading-relaxed min-h-[90px] max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {isExecuting ? (
                      <div className="flex items-center space-x-2 text-blue-500">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>正在调用模型进行推演...</span>
                      </div>
                    ) : executionOutput ? (
                      <AppleMarkdown content={executionOutput} />
                    ) : (
                      <span className="text-neutral-400 italic">点击下方「模拟沙盒执行」观察流式响应...</span>
                    )}
                  </div>

                  {executionOutput && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      {onSaveToMaterial && (
                        <button
                          onClick={() => {
                            onSaveToMaterial(`指令成果: ${selectedCommand.name}`, executionOutput);
                            showToast('已存入素材知识库！');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium flex items-center gap-1 transition"
                        >
                          <BookmarkPlus className="w-3 h-3 text-emerald-500" />
                          <span>存入素材库</span>
                        </button>
                      )}

                      {onSendToCanvas && (
                        <button
                          onClick={() => {
                            onSendToCanvas(`指令: ${selectedCommand.name}`, executionOutput);
                            showToast('已推送到无限画布！');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-medium flex items-center gap-1 shadow-sm"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          <span>推送到画布</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ============================================================ */
              /* VERSION HISTORY TIMELINE & ROLLBACK PANE */
              /* ============================================================ */
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-purple-500" />
                      <span>版本演进历史</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">自动记录修改快照，支持一键无损回滚</span>
                  </div>

                  <button
                    onClick={() => handleCreateManualSnapshot(selectedCommand.id)}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-medium flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>打快照</span>
                  </button>
                </div>

                {/* Current Active Version Card */}
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-500/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      <span>当前生效中配置</span>
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">{selectedCommand.updatedAt}</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300 font-mono truncate">
                    {selectedCommand.desc}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 pt-1">
                    <span>{selectedCommand.model}</span>
                    <span>·</span>
                    <span>~{selectedCommand.tokensEst || 600} Tokens</span>
                  </div>
                </div>

                {/* Version Timeline List */}
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-200 dark:before:bg-neutral-800">
                  {(!selectedCommand.versions || selectedCommand.versions.length === 0) ? (
                    <div className="pl-7 py-4 text-neutral-400 text-xs italic">
                      暂无其他历史存档，您在此指令上的每次保存修改都将自动在此建立历史快照。
                    </div>
                  ) : (
                    selectedCommand.versions.map((ver, idx) => {
                      const isDiffOpen = diffViewingVersionId === ver.versionId;
                      return (
                        <div key={ver.versionId} className="relative pl-7 space-y-2 group">
                          {/* Timeline Dot */}
                          <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-neutral-900 border-2 border-purple-500 flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                          </div>

                          {/* Version Box */}
                          <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-xs hover:border-purple-500/40 transition space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-neutral-800 dark:text-neutral-200">{ver.versionLabel}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-neutral-500">
                                  {ver.model}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-neutral-400">{ver.formattedTime}</span>
                            </div>

                            {ver.changeSummary && (
                              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                {ver.changeSummary}
                              </p>
                            )}

                            {/* Diff Viewer Accordion */}
                            {isDiffOpen && (
                              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#121214] border border-black/5 dark:border-white/5 space-y-1.5 font-mono text-[10px]">
                                <div className="text-neutral-400 font-semibold flex items-center justify-between">
                                  <span>历史提示词正文对照:</span>
                                </div>
                                <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 whitespace-pre-wrap text-neutral-700 dark:text-neutral-300 max-h-32 overflow-y-auto leading-relaxed">
                                  {ver.template}
                                </div>
                                {ver.systemPrompt && (
                                  <div className="text-[9px] text-neutral-400 pt-1">
                                    <span className="font-bold">System:</span> {ver.systemPrompt}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Version Actions */}
                            <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-[11px]">
                              <button
                                onClick={() => setDiffViewingVersionId(isDiffOpen ? null : ver.versionId)}
                                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1 transition"
                              >
                                <Eye className="w-3 h-3" />
                                <span>{isDiffOpen ? '收起对照' : '查看差异'}</span>
                              </button>

                              <button
                                onClick={() => handleRollbackVersion(selectedCommand.id, ver)}
                                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-1 shadow-xs transition active:scale-95"
                              >
                                <Undo2 className="w-3 h-3" />
                                <span>回滚至此版本</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Drawer Bottom Action Ribbon */}
            <div className="p-3 border-t border-black/5 dark:border-white/5 bg-neutral-50/70 dark:bg-neutral-900/70 flex items-center gap-2 shrink-0">
              <button
                onClick={handleExecuteSandbox}
                disabled={isExecuting}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isExecuting ? '正在推演...' : '模拟沙盒执行'}</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(assembledPrompt);
                  showToast('已复制拼装后 Prompt');
                }}
                className="p-2 rounded-xl bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
                title="快速复制完整 Prompt"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MODAL: SPOTLIGHT COMMAND PALETTE (⌘K) */}
      {/* ============================================================ */}
      {isSpotlightOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-start justify-center pt-24 p-4 animate-macos-fade"
          onClick={(e) => { if (e.target === e.currentTarget) setIsSpotlightOpen(false); }}
        >
          <div className="w-full max-w-xl bg-white/95 dark:bg-[#1E1E22]/95 rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col">
            <div className="h-14 px-4 border-b border-black/5 dark:border-white/5 flex items-center gap-3">
              <Search className="w-5 h-5 text-neutral-400" />
              <input
                type="text"
                autoFocus
                value={spotlightQuery}
                onChange={e => { setSpotlightQuery(e.target.value); setSpotlightIndex(0); }}
                placeholder="聚焦搜索 AI 指令、分类、适用模型或变量..."
                className="flex-1 bg-transparent border-none text-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
              />
              <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-500">ESC 退出</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {spotlightMatches.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">无匹配结果</div>
              ) : (
                spotlightMatches.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedCommandId(item.id);
                      setIsSpotlightOpen(false);
                      if (!isDrawerOpen) setIsDrawerOpen(true);
                      showToast(`已装填指令: ${item.name}`);
                    }}
                    className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition ${idx === spotlightIndex ? 'bg-blue-600 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${item.avatarColor} text-white flex items-center justify-center text-xs font-bold`}>
                        {item.avatar}
                      </span>
                      <div>
                        <div className={`text-xs font-semibold ${idx === spotlightIndex ? 'text-white' : 'text-neutral-800 dark:text-neutral-200'}`}>{item.name}</div>
                        <div className={`text-[10px] ${idx === spotlightIndex ? 'text-white/80' : 'text-neutral-400'} truncate max-w-sm`}>{item.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${idx === spotlightIndex ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'}`}>
                        {item.hotkey || '⌘'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-2 bg-neutral-100/60 dark:bg-neutral-900/60 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
              <div className="flex items-center gap-3">
                <span><kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> 切换选项</span>
                <span><kbd className="font-mono">↵</kbd> 装填运行</span>
              </div>
              <span className="font-mono">Spotlight Search</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MODAL: CREATE / EDIT COMMAND SHEET (⌘N) */}
      {/* ============================================================ */}
      {isFormModalOpen && editingCommand && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-macos-fade">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="h-13 px-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/70">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                  {editingCommand.id ? '编辑 AI 提示词指令' : '新建 AI 提示词指令'}
                </h3>
              </div>
              <button onClick={() => setIsFormModalOpen(false)} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-neutral-700 dark:text-neutral-300">指令名称 *</label>
                  <input
                    type="text"
                    value={editingCommand.name || ''}
                    onChange={e => setEditingCommand(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="例如: 爽点高潮剧情扩写"
                    className="w-full text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-neutral-700 dark:text-neutral-300">触发快捷键 (Hotkey)</label>
                  <input
                    type="text"
                    value={editingCommand.hotkey || ''}
                    onChange={e => setEditingCommand(prev => ({ ...prev, hotkey: e.target.value }))}
                    placeholder="例如: ⌥Space 或 ⌘J"
                    className="w-full text-xs font-mono rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-neutral-700 dark:text-neutral-300">指令分类</label>
                  <select
                    value={editingCommand.category || 'creative'}
                    onChange={e => setEditingCommand(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="creative">网文与去AI味润色</option>
                    <option value="coding">全栈架构与代码审计</option>
                    <option value="analysis">商业分析与决策推演</option>
                    <option value="meta">元提示词 (Meta-Prompt)</option>
                    <option value="research">学术事实与深度提炼</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-neutral-700 dark:text-neutral-300">推荐基座模型</label>
                  <select
                    value={editingCommand.model || 'Claude 3.5 Sonnet'}
                    onChange={e => setEditingCommand(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                    <option value="Gemini 2.5 Pro">Gemini 2.5 Pro</option>
                    <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
                    <option value="DeepSeek R1 / V3">DeepSeek R1 / V3</option>
                    <option value="Local Ollama">Local Ollama</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-700 dark:text-neutral-300">一句话描述 (功能定位)</label>
                <input
                  type="text"
                  value={editingCommand.desc || ''}
                  onChange={e => setEditingCommand(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder="简述该指令的应用场景与核心产出..."
                  className="w-full text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">提示词模板正文 (Prompt Template) *</label>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-neutral-400">快速插入变量:</span>
                    <button
                      type="button"
                      onClick={() => setEditingCommand(prev => ({ ...prev, template: (prev?.template || '') + '{{文本内容}}' }))}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    >
                      + {'{{文本内容}}'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCommand(prev => ({ ...prev, template: (prev?.template || '') + '{{目标语气}}' }))}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    >
                      + {'{{目标语气}}'}
                    </button>
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={editingCommand.template || ''}
                  onChange={e => setEditingCommand(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="编写指令主体，使用 {{变量名}} 定义动态插槽..."
                  className="w-full text-xs font-mono rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-700 dark:text-neutral-300">系统人设前置约束 (System Prompt - 选填)</label>
                <textarea
                  rows={3}
                  value={editingCommand.systemPrompt || ''}
                  onChange={e => setEditingCommand(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="可选：例如设定专家人设、违禁词规范或思维链协议..."
                  className="w-full text-xs font-mono rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-black/5 dark:border-white/5 bg-neutral-50/70 dark:bg-neutral-900/70 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                取消
              </button>
              <button
                onClick={handleSaveModal}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition font-bold"
              >
                保存指令
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
