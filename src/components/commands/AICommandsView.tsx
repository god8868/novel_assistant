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
  FileSpreadsheet,
  Trash2,
  HelpCircle,
  Eye,
  Sliders,
  CheckSquare,
  GitFork,
  Bot,
  Activity,
  Maximize2
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

export type CommandCategory = 'all' | 'shortcuts' | 'novel' | 'research' | 'inspiration' | 'utility' | 'custom';

export interface AICommandItem {
  id: string;
  category: 'shortcuts' | 'novel' | 'research' | 'inspiration' | 'utility' | 'custom';
  name: string;
  description: string;
  icon: string;
  color: string;
  promptTemplate: string;
  defaultInput?: string;
  tags: string[];
  usageCount: number;
  isPinnedToCommandK?: boolean;
  authorType?: 'system' | 'custom' | 'ai' | 'imported';
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

const STORAGE_CUSTOM_COMMANDS_KEY = 'apple_ai_custom_commands';

const INITIAL_COMMANDS: AICommandItem[] = [
  {
    id: 'cmd-expand',
    category: 'shortcuts',
    name: '扩写与感官细节丰富 (Expand & Enrich Text)',
    description: '在保持原剧情与人设的前提下，补充环境五感、微表情与动作连贯性',
    icon: '✍️',
    color: '#30d158',
    tags: ['扩写文本', '快捷指令', '场景丰富'],
    promptTemplate: `请对用户提供的简要提纲或短句进行高水准细节扩写（扩写约 3~5 倍字数）：\n1. 丰富环境渲染与五感描写（光影、气温、声响、气味）；\n2. 补充角色的微表情、心理博弈与动作连贯性；\n3. 严禁无意义套话与空洞形容词堆砌，保持文风冷冽自然。`,
    defaultInput: `沈玄烛在雨夜推开残破客栈的木门，店内三名带刀散修瞬间停下交谈，目光齐齐扫来。`,
    usageCount: 3120,
    isPinnedToCommandK: true,
    authorType: 'system'
  },
  {
    id: 'cmd-refactor',
    category: 'shortcuts',
    name: '代码重构与严谨类型补全 (Code Refactoring)',
    description: '按现代 TypeScript / React / Tailwind 规范重构代码，补齐严格类型定义并消除冗余',
    icon: '💻',
    color: '#0a84ff',
    tags: ['代码重构', 'TypeScript', '快捷指令'],
    promptTemplate: `你是一个资深架构师。请重构以下代码：\n1. 补齐完备严格的 TypeScript 接口与类型定义；\n2. 遵循 Apple macOS HIG 与原子化 Tailwind CSS 设计；\n3. 优化计算复杂度、解耦状态并消除冗余逻辑。`,
    defaultInput: `function parseData(d: any) {\n  let res = [];\n  for(let i=0; i<d.length; i++) {\n    if (d[i].status == 1) res.push(d[i].title);\n  }\n  return res;\n}`,
    usageCount: 2890,
    isPinnedToCommandK: true,
    authorType: 'system'
  },
  {
    id: 'cmd-novel-conflict',
    category: 'novel',
    name: '反套路两难冲突与代价推演',
    description: '打破传统无脑开挂，为角色行动推演不可调和的戏剧代价与两难抉择',
    icon: '⚔️',
    color: '#ff9f0a',
    tags: ['剧情冲突', '高潮反转', '长篇结构'],
    promptTemplate: `请基于用户提供的剧情背景与角色行动，设计一个严密的“反套路两难危机”：\n1. 动机对立：主角面临的选择没有任何完美解法，选择 A 必将牺牲 B；\n2. 代价量化：明确必须支付的生理、灵力或情感代价；\n3. 破局微光：在绝境中埋下一记符合前期世界观因果的破局伏笔。`,
    defaultInput: `主角沈玄烛在黑水渊底遭遇赵莽残党围攻，需使用破妄真瞳窥测古祭坛杀生大阵弱点，但自身寒玉髓已尽，且同行商女柳清霜被阵法煞气所困。`,
    usageCount: 1420,
    isPinnedToCommandK: true,
    authorType: 'system'
  },
  {
    id: 'cmd-novel-combat',
    category: 'novel',
    name: '东方古典仙侠打斗“气机虚实”动作拆解',
    description: '拒绝报技能名堆特效，注重出招前气机先兆、身法借力与受力反馈',
    icon: '🥋',
    color: '#0a84ff',
    tags: ['打斗描写', '动作设计', '去AI味'],
    promptTemplate: `请将以下对决场景扩写为一段 400~600 字的高水准东方仙侠打斗：\n- 严禁堆砌“毁天灭地”、“天地变色”等空洞词汇；\n- 重点刻画出招前的气机压迫（风声、衣袂、微动作）；\n- 动作必须有清晰的物理受力反馈与经络剧痛反噬。`,
    defaultInput: `沈玄烛在秋雨泥泞中面对挥舞赤阳大刀的赵莽，弹指飞出一枚沾满黑水铜钱，精准截断对方关节灵力流转。`,
    usageCount: 2180,
    isPinnedToCommandK: false,
    authorType: 'system'
  },
  {
    id: 'cmd-research-abstract',
    category: 'research',
    name: '长文核心事实结构化大纲提炼',
    description: '从杂乱文献中一键抽取核心论点、论据因果链与关键数据',
    icon: '📑',
    color: '#bf5af2',
    tags: ['深度研读', '事实提取', '文献综述'],
    promptTemplate: `请对以下输入材料进行深度事实解构，输出以下结构：\n1. 核心论点 (Core Claim)\n2. 关键因果链 (Causal Links)\n3. 潜在矛盾与未解难题 (Open Questions)\n4. 创作与研究落地建议。`,
    defaultInput: `【文献摘录】关于古代宗门阶层固化研究：仙门九宗占据九重清气天界，对下界散修实施灵石与药草重税。`,
    usageCount: 840,
    isPinnedToCommandK: false,
    authorType: 'system'
  },
  {
    id: 'cmd-inspire-sensory',
    category: 'inspiration',
    name: '感官（声光气味触感）高保真细节渲染',
    description: '丰富场景氛围，补充多维度感官体验，提升代入感与现场沉浸度',
    icon: '🌌',
    color: '#64d2ff',
    tags: ['氛围渲染', '五感描写', '画面感'],
    promptTemplate: `请为以下场景补充 4 组极具画面冲击力的高保真感官描写：\n1. 【光影与色彩】；2. 【声响与空寂】；3. 【气味与温湿度】；4. 【心理通感】。`,
    defaultInput: `深渊底部的古修遗迹废墟，沈玄烛踩碎了布满青苔的瓦片。`,
    usageCount: 1650,
    isPinnedToCommandK: false,
    authorType: 'system'
  }
];

// --- D3 FLOW GRAPH DATASETS ---
const FLOW_GRAPH_NODES: CommandFlowNode[] = [
  // Command Nodes
  { id: 'fn-expand', name: '扩写与感官细节丰富', type: 'command', category: '常用快捷', color: '#30d158', icon: '✍️', temperature: 0.75, topP: 0.9, contextWindow: '128k', usageCount: 3120, promptSnippet: '补充环境五感描写、微表情与心理博弈...' },
  { id: 'fn-refactor', name: '代码重构与类型补全', type: 'command', category: '快捷重构', color: '#0a84ff', icon: '💻', temperature: 0.2, topP: 0.95, contextWindow: '128k', usageCount: 2890, promptSnippet: '补齐 TypeScript 类型接口，消除冗余状态...' },
  { id: 'fn-conflict', name: '反套路两难冲突推演', type: 'command', category: '小说结构', color: '#ff9f0a', icon: '⚔️', temperature: 0.8, topP: 0.85, contextWindow: '128k', usageCount: 1420, promptSnippet: '推演不可调和的戏剧代价与两难抉择...' },
  { id: 'fn-combat', name: '东方仙侠打斗动作拆解', type: 'command', category: '小说动作', color: '#0a84ff', icon: '🥋', temperature: 0.7, topP: 0.9, contextWindow: '128k', usageCount: 2180, promptSnippet: '注重出招前气机先兆、身法借力与受力反馈...' },
  { id: 'fn-abstract', name: '核心事实结构大纲提炼', type: 'command', category: '深度研读', color: '#bf5af2', icon: '📑', temperature: 0.3, topP: 0.95, contextWindow: '128k', usageCount: 840, promptSnippet: '从杂乱文献中一键抽取论点与因果链...' },

  // AI Agent Nodes
  { id: 'fn-agent-writer', name: '✍️ 文本文学 Agent', type: 'agent', category: 'AI 智能体', color: '#30d158', icon: '🤖', temperature: 0.75, topP: 0.9, contextWindow: '128k', usageCount: 4770, agentRole: '资深文学主编 / 场景感官烘焙专家' },
  { id: 'fn-agent-coder', name: '💻 代码架构 Agent', type: 'agent', category: 'AI 智能体', color: '#0a84ff', icon: '🤖', temperature: 0.2, topP: 0.95, contextWindow: '128k', usageCount: 2890, agentRole: '严格 TypeScript/React 前端架构师' },
  { id: 'fn-agent-drama', name: '⚔️ 剧情冲突 Agent', type: 'agent', category: 'AI 智能体', color: '#ff9f0a', icon: '🤖', temperature: 0.8, topP: 0.85, contextWindow: '128k', usageCount: 3600, agentRole: '网文爆款爽点与两难冲突算法推演官' },
  { id: 'fn-agent-research', name: '📑 深度研读 Agent', type: 'agent', category: 'AI 智能体', color: '#bf5af2', icon: '🤖', temperature: 0.3, topP: 0.95, contextWindow: '128k', usageCount: 840, agentRole: '结构化文献事实与原子账本提炼师' },

  // AI Model Engine Nodes
  { id: 'fn-model-gemini', name: '🧠 旗舰模型 (Gemini Pro)', type: 'model', category: '底层引擎', color: '#64d2ff', icon: '', temperature: 0.7, topP: 0.9, contextWindow: '1000k Tokens', usageCount: 12100, modelEngine: 'Google Gemini Pro 1.5/3.6 Neural' },
  { id: 'fn-model-flash', name: '⚡ 边缘模型 (Flash Latency)', type: 'model', category: '底层引擎', color: '#ff375f', icon: '⚡', temperature: 0.3, topP: 0.95, contextWindow: '128k Tokens', usageCount: 3800, modelEngine: 'Flash Low Latency Edge Proxy' }
];

const FLOW_GRAPH_LINKS: CommandFlowLink[] = [
  { source: 'fn-expand', target: 'fn-agent-writer', relation: '调用指令路由' },
  { source: 'fn-refactor', target: 'fn-agent-coder', relation: '调用指令路由' },
  { source: 'fn-conflict', target: 'fn-agent-drama', relation: '调用指令路由' },
  { source: 'fn-combat', target: 'fn-agent-drama', relation: '调用指令路由' },
  { source: 'fn-abstract', target: 'fn-agent-research', relation: '调用指令路由' },

  { source: 'fn-agent-writer', target: 'fn-model-gemini', relation: '推流生成' },
  { source: 'fn-agent-coder', target: 'fn-model-gemini', relation: '推流生成' },
  { source: 'fn-agent-drama', target: 'fn-model-gemini', relation: '推流生成' },
  { source: 'fn-agent-research', target: 'fn-model-flash', relation: '极速归论' }
];

// ==========================================
// D3 DIRECTED COMMAND FLOW GRAPH COMPONENT
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
    const height = 460;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const g = svg.append('g').attr('class', 'graph-group');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2.2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    const nodesCopy: CommandFlowNode[] = nodes.map((d) => ({ ...d }));
    const linksCopy: CommandFlowLink[] = links.map((d) => ({ ...d }));

    // Define Arrow Marker
    svg.append('defs').append('marker')
      .attr('id', 'arrow-head')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(255,255,255,0.4)');

    const simulation = d3
      .forceSimulation<CommandFlowNode>(nodesCopy)
      .force('link', d3.forceLink<CommandFlowNode, CommandFlowLink>(linksCopy).id((d) => d.id).distance(130))
      .force('charge', d3.forceManyBody().strength(-340))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(42));

    // Links
    const link = g
      .append('g')
      .selectAll('line')
      .data(linksCopy)
      .join('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.25)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 2')
      .attr('marker-end', 'url(#arrow-head)');

    const linkText = g
      .append('g')
      .selectAll('text')
      .data(linksCopy)
      .join('text')
      .text((d: any) => d.relation || '')
      .attr('font-size', '9px')
      .attr('fill', 'rgba(255, 255, 255, 0.4)')
      .attr('text-anchor', 'middle')
      .attr('font-family', 'sans-serif');

    // Drag
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

    // Nodes
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
        onSelectNode(d);
      });

    // Outer Halo
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'model' ? 24 : d.type === 'agent' ? 20 : 16))
      .attr('fill', (d) => d.color)
      .attr('opacity', (d) => (d.id === selectedNodeId ? 0.45 : 0.18))
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 3.5 : 1));

    // Inner Circle
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'model' ? 16 : d.type === 'agent' ? 14 : 12))
      .attr('fill', '#12151e')
      .attr('stroke', (d) => (d.id === selectedNodeId ? '#ffffff' : d.color))
      .attr('stroke-width', 2);

    // Emoji Icon Text
    node
      .append('text')
      .text((d) => d.icon)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '10px');

    // Label Underneath
    const labelGroup = node.append('g').attr('transform', 'translate(0, 24)');

    labelGroup
      .append('rect')
      .attr('x', (d) => -((d.name.length * 11) / 2 + 5))
      .attr('y', -9)
      .attr('width', (d) => d.name.length * 11 + 10)
      .attr('height', 15)
      .attr('rx', 5)
      .attr('fill', (d) => (d.id === selectedNodeId ? d.color : 'rgba(0,0,0,0.8)'))
      .attr('stroke', 'rgba(255, 255, 255, 0.15)')
      .attr('stroke-width', 1);

    labelGroup
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.2em')
      .attr('fill', (d) => (d.id === selectedNodeId ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'))
      .attr('font-size', '9.5px')
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
    <div ref={containerRef} className="w-full h-[460px] bg-[#0b0d14]/95 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col select-none">
      <div className="absolute top-3 left-4 z-10 flex items-center space-x-2 text-xs">
        <GitFork className="w-4 h-4 text-emerald-400" />
        <span className="font-bold text-white">D3.js 指令与 AI 智能体调用流向图</span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
          支持鼠标悬停节点查阅参数
        </span>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ⭐ HOVER INSPECTION GLASS TOOLTIP */}
      {hoveredNode && (
        <div
          className="absolute z-30 p-3.5 rounded-2xl bg-[#181824]/95 border border-white/20 shadow-2xl backdrop-blur-2xl text-xs space-y-2 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3 max-w-xs"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-white">
              <span>{hoveredNode.icon}</span>
              <span>{hoveredNode.name}</span>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-white/10 font-mono text-[9px] text-emerald-300">
              {hoveredNode.category}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-white/70">
            <div><span className="text-white/40">Temp:</span> {hoveredNode.temperature ?? 0.7}</div>
            <div><span className="text-white/40">Top-P:</span> {hoveredNode.topP ?? 0.9}</div>
            <div><span className="text-white/40">上下文:</span> {hoveredNode.contextWindow || '128k'}</div>
            <div><span className="text-white/40">调用频次:</span> {hoveredNode.usageCount}次</div>
          </div>

          {hoveredNode.agentRole && (
            <div className="text-[10px] text-amber-300 bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
              <strong>智能体人设:</strong> {hoveredNode.agentRole}
            </div>
          )}

          {hoveredNode.promptSnippet && (
            <div className="text-[10px] text-blue-300 bg-blue-500/10 p-1.5 rounded border border-blue-500/20">
              <strong>规约模版:</strong> {hoveredNode.promptSnippet}
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-3 right-4 z-10 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-white/60">
        <span>悬停节点显示 Prompt 参数 · 拖拽平移</span>
      </div>
    </div>
  );
};

// ==========================================
// MAIN AI COMMANDS VIEW COMPONENT
// ==========================================

export const AICommandsView: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  const [commands, setCommands] = useState<AICommandItem[]>(() => {
    const localCustom = localStorage.getItem(STORAGE_CUSTOM_COMMANDS_KEY);
    if (localCustom) {
      try {
        const parsed = JSON.parse(localCustom);
        return [...parsed, ...INITIAL_COMMANDS];
      } catch (e) {
        return INITIAL_COMMANDS;
      }
    }
    return INITIAL_COMMANDS;
  });

  const [activeCategory, setActiveCategory] = useState<CommandCategory>('all');
  const [selectedCommandId, setSelectedCommandId] = useState<string>('cmd-expand');
  const [searchQuery, setSearchQuery] = useState('');

  // Sub View Switcher: 'workbench' vs 'flow_graph'
  const [subView, setSubView] = useState<'workbench' | 'flow_graph'>('workbench');

  // Execution State
  const [liveInput, setLiveInput] = useState('');
  const [executionOutput, setExecutionOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected D3 Node
  const [selectedFlowNode, setSelectedFlowNode] = useState<CommandFlowNode>(FLOW_GRAPH_NODES[0]);

  const selectedCommand = commands.find(c => c.id === selectedCommandId) || commands[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    if (selectedCommand) {
      setLiveInput(selectedCommand.defaultInput || '');
      setExecutionOutput('');
    }
  }, [selectedCommandId]);

  const handleExecuteCommand = () => {
    if (!selectedCommand || isExecuting) return;
    setIsExecuting(true);
    setExecutionOutput('');

    setTimeout(() => {
      let result = '';
      if (selectedCommand.id === 'cmd-expand') {
        result = `### ✍️ 扩写与感官细节扩充成果：\n\n深秋长夜，连绵的寒雨将整座官道浸得泥泞不堪。沈玄烛抬手压低斗笠，右掌按在腰间青铜剑鞘之上，微一沉力，推开了那扇已然被雨水腐蚀发黑的客栈木门。\n\n「吱呀——」腐朽木轴发出令人牙酸的摩擦声。门内原本喧闹的炉火微爆声戛然而止。\n\n油灯摇曳昏黄的光晕下，坐在墙角方桌旁的三名带刀散修瞬间停下了低语。为首之人脸颊处横贯一道狰狞刀疤，正端起酒碗的粗糙手掌在半空中微不可察地顿了半息。空气中混杂着劣质烧酒的辛辣、湿透兽皮的腥臭与一丝若有若无的清冷气机。\n\n三道审视而警惕的目光，宛如尖针般齐齐扎在他被黑水溅湿的下摆处。`;
      } else {
        result = `### ✦ 指令推演已完成：\n\n基于输入：“${liveInput}”，已遵循【${selectedCommand.name}】规约完成结构化输出。\n\n- **逻辑因果**：严密剔除陈词滥调；\n- **建议**：可直接将本段成果存入素材知识库。`;
      }

      setExecutionOutput(result);
      setIsExecuting(false);
      showToast('指令执行完毕！');
    }, 600);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#0c0e14] text-slate-100 font-sans select-none relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#181824]/95 border border-white/20 text-white text-xs font-semibold shadow-2xl flex items-center space-x-2 backdrop-blur-2xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="h-12 px-6 border-b border-white/10 bg-[#151821]/90 backdrop-blur-2xl flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 p-0.5 flex items-center justify-center shadow-md">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-white tracking-tight font-mono">AI 指令工坊与调用流向</span>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Prompt Studio v3.2
            </span>
          </div>
        </div>

        {/* View Switcher: Workbench vs D3 Flow Graph */}
        <div className="flex items-center bg-black/50 p-0.5 rounded-xl border border-white/10 text-xs font-medium">
          <button
            onClick={() => setSubView('workbench')}
            className={`px-3.5 py-1 rounded-lg transition-all flex items-center space-x-1.5 ${
              subView === 'workbench' ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-white/50 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>指令工坊与调试</span>
          </button>
          <button
            onClick={() => setSubView('flow_graph')}
            className={`px-3.5 py-1 rounded-lg transition-all flex items-center space-x-1.5 ${
              subView === 'flow_graph' ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-white/50 hover:text-white'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 text-purple-400" />
            <span>D3.js 调用流向拓扑</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>D3 悬停检查器已激活</span>
        </div>
      </header>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* ⭐ D3.JS COMMAND FLOW GRAPH VIEW */}
        {subView === 'flow_graph' && (
          <div className="space-y-4 animate-in fade-in">
            <D3CommandFlowGraph
              nodes={FLOW_GRAPH_NODES}
              links={FLOW_GRAPH_LINKS}
              selectedNodeId={selectedFlowNode?.id}
              onSelectNode={(node) => setSelectedFlowNode(node)}
            />

            {/* Selected Node Details Card */}
            {selectedFlowNode && (
              <div className="p-5 rounded-2xl bg-[#151821] border border-emerald-500/30 shadow-xl space-y-3 animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{selectedFlowNode.icon}</span>
                    <h3 className="text-xs font-bold text-white">
                      逻辑节点 AI 参数详情：{selectedFlowNode.name}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {selectedFlowNode.category}
                    </span>
                    <span className="text-white/50">调用次数: {selectedFlowNode.usageCount}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-white/40 block mb-0.5">模型温度 (Temperature)</span>
                    <span className="text-amber-400 font-bold">{selectedFlowNode.temperature ?? 0.7}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-white/40 block mb-0.5">核采样 (Top-P)</span>
                    <span className="text-purple-300 font-bold">{selectedFlowNode.topP ?? 0.9}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-white/40 block mb-0.5">上下文窗口 (Context Window)</span>
                    <span className="text-blue-400 font-bold">{selectedFlowNode.contextWindow || '128k'}</span>
                  </div>
                </div>

                {selectedFlowNode.agentRole && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                    <strong>智能体角色履历:</strong> {selectedFlowNode.agentRole}
                  </div>
                )}

                {selectedFlowNode.promptSnippet && (
                  <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-emerald-300">
                    <strong>规约模版预览:</strong> {selectedFlowNode.promptSnippet}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* WORKBENCH & TESTER VIEW */}
        {subView === 'workbench' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Left: Commands List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-3 rounded-2xl bg-[#151821] border border-white/10 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="搜索指令、角色、变量参数..."
                    className="w-full pl-9 pr-3 py-2 bg-black/40 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {commands.map(cmd => (
                  <div
                    key={cmd.id}
                    onClick={() => setSelectedCommandId(cmd.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2 ${
                      cmd.id === selectedCommandId
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-[#151821] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center space-x-1.5">
                        <span>{cmd.icon}</span>
                        <span>{cmd.name}</span>
                      </span>
                      <span className="text-[10px] font-mono text-white/40">🔥 {cmd.usageCount}</span>
                    </div>
                    <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">{cmd.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Command Tester */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#151821] border border-white/10 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{selectedCommand.icon}</span>
                    <h2 className="text-sm font-bold text-white">{selectedCommand.name}</h2>
                  </div>
                  <button
                    onClick={handleExecuteCommand}
                    disabled={isExecuting}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center space-x-1.5 shadow-md transition disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>{isExecuting ? '正在推演...' : '测试运行'}</span>
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <label className="block text-white/50 mb-1">测试输入内容</label>
                    <textarea
                      value={liveInput}
                      onChange={e => setLiveInput(e.target.value)}
                      rows={4}
                      className="w-full p-3 bg-black/40 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-mono resize-none"
                    />
                  </div>

                  {executionOutput && (
                    <div>
                      <label className="block text-emerald-400 font-bold mb-1">推演输出成果</label>
                      <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/30 text-xs leading-relaxed text-white/90 max-h-60 overflow-y-auto">
                        <AppleMarkdown content={executionOutput} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {executionOutput && (
                <div className="pt-2 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => {
                      if (onSaveToMaterial) {
                        onSaveToMaterial(`指令测试: ${selectedCommand.name}`, executionOutput);
                      }
                      showToast('已存入素材知识库！');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                  >
                    存入素材知识库
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
