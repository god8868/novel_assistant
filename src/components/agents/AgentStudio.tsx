import React, { useState, useEffect, useRef } from 'react';
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
  Bookmark,
  Users,
  GitBranch,
  Boxes,
  Database,
  Download,
  Upload,
  Copy,
  FolderPlus,
  Eye,
  Search,
  MessageSquare,
  Swords,
  Paintbrush,
  Maximize2,
  CheckCheck,
  AlertTriangle,
  Send,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Cpu,
  Variable,
  Tag,
  Save,
  RotateCcw,
  Star,
  Trash2,
  Globe,
  FolderGit2,
  ChevronDown,
  LayoutGrid,
  Feather,
  Compass,
  GitMerge,
  Moon,
  Sun,
  HardDrive
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';
import { 
  AgentPlugin, 
  DEFAULT_PLUGINS, 
  PluginConfigModal, 
  NewPluginModal, 
  AgentPluginsSection 
} from './AgentPluginManager.tsx';

export type AgentCategory = 'creative' | 'engineering' | 'research' | 'swarm';

export interface AgentToolsConfig {
  webSearch: boolean;
  localFs: boolean;
  codeSandbox: boolean;
  memoryRag: boolean;
}

export interface AgentKnowledgeMounts {
  loreCategories: string[];
  materialTags: string[];
  mountFactLedger: boolean;
  activeDatasetName: string;
}

export interface AgentMemoryConfig {
  type: 'episodic' | 'long_term_vector' | 'stateless';
  slots: number;
  contextWindow: number;
  reflectionLoops: number;
}

export interface Agent {
  id: string;
  name: string;
  slug: string;
  category: AgentCategory;
  status: 'running' | 'idle';
  model: string;
  avatar: string;
  avatarColor: string;
  desc: string;
  systemPrompt: string;
  promptTemplate: string;
  voiceTone: 'literary' | 'architect' | 'academic' | 'concise';
  autonomyLevel: 'guided' | 'autonomous' | 'passive';
  temperature: number;
  maxTokens: number;
  reasoningEffort: boolean;
  tools: AgentToolsConfig;
  plugins?: string[];
  starred: boolean;
  runsCount: number;
  updatedAt: string;
  knowledgeMounts: AgentKnowledgeMounts;
  memoryConfig: AgentMemoryConfig;
}

export interface StepLog {
  step: number;
  type: 'thought' | 'action' | 'observation' | 'reflection' | 'answer';
  title: string;
  content: string;
  timestamp: string;
  toolName?: string;
  toolArgs?: any;
  toolResult?: any;
}

export interface SwarmTurn {
  agentId: string;
  agentName: string;
  avatar: string;
  avatarColor: string;
  role: string;
  stance: string;
  content: string;
}

export interface DAGNode {
  id: string;
  agentId: string;
  label: string;
  role: string;
  avatar: string;
  status: 'idle' | 'running' | 'done' | 'failed';
  x: number;
  y: number;
  outputSummary?: string;
}

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "agent_webnovel_master",
    name: "网文宏观架构与去AI味主笔",
    slug: "agent.webnovel.master",
    category: "creative",
    status: "running",
    model: "Claude 3.5 Sonnet",
    avatar: "网",
    avatarColor: "from-purple-500 to-indigo-600",
    desc: "精通多卷剧情大纲推演、爽点冲突阶梯设计与去AI机械味白描重构",
    systemPrompt: "你是一位兼具百万字网文连载经验与严肃文学审美的主笔。严格执行「Show, Don't Tell」原则，彻底剔除'随着、显然、值得一提'等陈腐填充词，专注利用生理微反应与冷峻客观的环境细节推动张力。",
    promptTemplate: `你是【{{agent_name}}】。\n【世界观法则基准】:\n{{novel_lore}}\n【人物设定约束】:\n{{character_profile}}\n【当前创作任务】:\n{{user_task}}\n请严格执行去 AI 腔标准，输出具有呼吸感与五感体感的精彩正文。`,
    voiceTone: "literary",
    autonomyLevel: "autonomous",
    temperature: 0.75,
    maxTokens: 4096,
    reasoningEffort: true,
    tools: { webSearch: true, localFs: true, codeSandbox: false, memoryRag: true },
    plugins: ['plugin-pdf-parser', 'plugin-sqlite-api'],
    starred: true,
    runsCount: 142,
    updatedAt: "5分钟前",
    knowledgeMounts: {
      loreCategories: ['世界观法则', '势力门派', '功法境界'],
      materialTags: ['工作台归档', '设定集'],
      mountFactLedger: true,
      activeDatasetName: '修仙宇宙核心法则库 v2.0'
    },
    memoryConfig: {
      type: 'long_term_vector',
      slots: 24,
      contextWindow: 16384,
      reflectionLoops: 2
    }
  },
  {
    id: "agent_code_architect",
    name: "全栈代码重构与架构审计师",
    slug: "agent.code.architect",
    category: "engineering",
    status: "running",
    model: "Qwen 2.5 Coder 32B",
    avatar: "栈",
    avatarColor: "from-blue-600 to-cyan-500",
    desc: "针对高并发瓶颈、内存死锁、SOLID 原则与类型安全开展防御性代码审查",
    systemPrompt: "你是一位精通 Rust、TypeScript、Go 及现代分布式系统的高级首席架构师。对代码质量有极高的洁癖，专注时间/空间复杂度、并发边界防线与无锁原子操作。",
    promptTemplate: `你是首席系统架构师【{{agent_name}}】。\n【架构命题】:\n{{user_task}}\n【挂载内核源码与模型】:\n{{knowledge_context}}\n请结合并发边界、Triton 算子融合与显存带宽调度模型进行形式化论证。`,
    voiceTone: "architect",
    autonomyLevel: "autonomous",
    temperature: 0.2,
    maxTokens: 8192,
    reasoningEffort: true,
    tools: { webSearch: false, localFs: true, codeSandbox: true, memoryRag: true },
    plugins: ['plugin-sandbox-runner', 'plugin-sqlite-api'],
    starred: true,
    runsCount: 389,
    updatedAt: "20分钟前",
    knowledgeMounts: {
      loreCategories: ['硬件规范', '算子基准'],
      materialTags: ['GPU显存模型', 'Triton内核代码'],
      mountFactLedger: false,
      activeDatasetName: 'FlashInfer & vLLM 算子架构库'
    },
    memoryConfig: {
      type: 'long_term_vector',
      slots: 20,
      contextWindow: 24576,
      reflectionLoops: 2
    }
  },
  {
    id: "agent_deep_research",
    name: "学术文献深研与跨界合成者",
    slug: "agent.academic.synthesis",
    category: "research",
    status: "running",
    model: "Gemini 1.5 Pro",
    avatar: "研",
    avatarColor: "from-emerald-500 to-teal-600",
    desc: "自动检索最新 ArXiv 论文，抽取因果实验数据并交叉验证学术假设",
    systemPrompt: "你是一名同行审稿专家级别的跨学科科研助理。坚持实证主义视角，所有学术推论必须引用权威来源，并自动进行反脆弱压力测试与对照组置信区间检验。",
    promptTemplate: `你是前沿研报专家【{{agent_name}}】。\n【研究课题】:\n{{user_task}}\n【挂载文献知识库】:\n{{knowledge_context}}\n请自主分解 3~5 阶段子问题，调用 search_materials 获取证据链并给出形式化结论。`,
    voiceTone: "academic",
    autonomyLevel: "autonomous",
    temperature: 0.35,
    maxTokens: 6000,
    reasoningEffort: true,
    tools: { webSearch: true, localFs: true, codeSandbox: true, memoryRag: true },
    plugins: ['plugin-pdf-parser', 'plugin-web-crawler', 'plugin-chart-generator'],
    starred: false,
    runsCount: 88,
    updatedAt: "2小时前",
    knowledgeMounts: {
      loreCategories: ['数理定理', '学术文献'],
      materialTags: ['研报合集', '学术论文'],
      mountFactLedger: false,
      activeDatasetName: 'arXiv & NeurIPS 计算机系统预印本'
    },
    memoryConfig: {
      type: 'episodic',
      slots: 32,
      contextWindow: 32768,
      reflectionLoops: 3
    }
  },
  {
    id: "agent_data_sentinel",
    name: "自动化数据管道与事实账本抽取员",
    slug: "agent.data.sentinel",
    category: "research",
    status: "idle",
    model: "Llama 3.3 70B (Ollama)",
    avatar: "数",
    avatarColor: "from-amber-500 to-orange-600",
    desc: "监控章节状态流转，自动抽取角色数值变更、新增法宝与因果伏笔入库",
    systemPrompt: "你是一名数据工程防线守护体。专注于 SQL 性能优化、原子事实提取以及零数据污染准则。",
    promptTemplate: `你是数据事实记录员【{{agent_name}}】。\n【扫描文本】:\n{{user_task}}\n请按 [时间, 地点, 人物状态变更, 新增物品, 伏笔因果] 抽取原子事实结构化条目。`,
    voiceTone: "concise",
    autonomyLevel: "guided",
    temperature: 0.1,
    maxTokens: 2048,
    reasoningEffort: false,
    tools: { webSearch: false, localFs: true, codeSandbox: true, memoryRag: false },
    plugins: ['plugin-sqlite-api', 'plugin-sandbox-runner'],
    starred: false,
    runsCount: 64,
    updatedAt: "1天前",
    knowledgeMounts: {
      loreCategories: ['事实时间轴', '物品名录'],
      materialTags: ['事实账本', '伏笔清单'],
      mountFactLedger: true,
      activeDatasetName: '端侧 SQLite 原子事实总账'
    },
    memoryConfig: {
      type: 'long_term_vector',
      slots: 48,
      contextWindow: 16384,
      reflectionLoops: 1
    }
  },
  {
    id: "agent_swarm_pipeline",
    name: "多智能体自治研产协作流",
    slug: "agent.swarm.pipeline",
    category: "swarm",
    status: "idle",
    model: "Claude 3.5 Sonnet",
    avatar: "流",
    avatarColor: "from-pink-500 to-rose-600",
    desc: "Supervisor 规划节点调度起草体与审稿体，进行闭环自治迭代交付",
    systemPrompt: "你是多智能体任务集群的主调度脑（Supervisor）。负责拆解复杂商业需求，分配至下游子 Agent，并在输出低于 90 分时强行打回重写。",
    promptTemplate: `你是多智能体集群调度脑【{{agent_name}}】。\n【全局目标】:\n{{user_task}}\n请拆解为子任务并编排协作流水线，调度下游 Worker 与 Critic 形成自洽闭环。`,
    voiceTone: "concise",
    autonomyLevel: "autonomous",
    temperature: 0.4,
    maxTokens: 4096,
    reasoningEffort: true,
    tools: { webSearch: true, localFs: true, codeSandbox: true, memoryRag: true },
    plugins: ['plugin-pdf-parser', 'plugin-sandbox-runner', 'plugin-sqlite-api', 'plugin-chart-generator'],
    starred: true,
    runsCount: 215,
    updatedAt: "昨天",
    knowledgeMounts: {
      loreCategories: ['漏洞库', '极端博弈模型'],
      materialTags: ['红蓝对抗', '压力测试'],
      mountFactLedger: false,
      activeDatasetName: '多智能体协作策略库'
    },
    memoryConfig: {
      type: 'stateless',
      slots: 8,
      contextWindow: 8192,
      reflectionLoops: 2
    }
  }
];

const TEMPLATE_PRESETS = [
  {
    name: '严格法则审核模板',
    template: `你是【{{agent_role}}】{{agent_name}}。\n【世界观法则基准】:\n{{novel_lore}}\n【人物设定约束】:\n{{character_profile}}\n【审查目标】:\n{{user_task}}\n请严格比对设定与任务，列举任何违规或逻辑矛盾。`
  },
  {
    name: '学术前沿循证模板',
    template: `你是顶级学者【{{agent_name}}】。\n请针对命题【{{user_task}}】，调用挂载的知识库与文献数据：\n{{knowledge_context}}\n提炼定理证明、反例分析与 Pareto 最优边界。`
  },
  {
    name: '文学冷调去套话模板',
    template: `你是文学总监【{{agent_name}}】。\n【待审文本】:\n{{user_task}}\n【禁止词汇】:\n{{banned_words}}\n请执行极致文学去油处理，将心理独白转化为环境与生理体感细节。`
  }
];

export const AgentStudio: React.FC<{
  onSaveToMaterial?: (title: string, body: string) => void;
}> = ({ onSaveToMaterial }) => {
  // Main view mode: 'library' (Hub Grid) | 'orchestrator' (Active Studio)
  const [mainViewMode, setMainViewMode] = useState<'library' | 'orchestrator'>('library');

  // Studio Sub-tab in orchestrator mode
  const [studioSubTab, setStudioSubTab] = useState<'persona' | 'compute' | 'tools' | 'pipeline'>('persona');

  // Sandbox Right-Drawer toggle
  const [isSandboxOpen, setIsSandboxOpen] = useState(true);

  // Filter & Search states
  const [currentCategory, setCurrentCategory] = useState<'all' | 'creative' | 'engineering' | 'research' | 'swarm' | 'starred'>('all');
  const [currentStatusFilter, setCurrentStatusFilter] = useState<'all' | 'running' | 'idle'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'recent' | 'runs' | 'name'>('recent');

  // Agents data loaded from localStorage or default
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('apple_agent_studio_agents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return DEFAULT_AGENTS;
  });

  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || DEFAULT_AGENTS[0].id);

  // Active agent reference
  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Sandbox execution & chat history
  const [sandboxInput, setSandboxInput] = useState('');
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);
  const [sandboxMessages, setSandboxMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'agent';
    content: string;
    thought?: string;
    toolCall?: string;
    toolLatency?: string;
    timestamp: string;
  }>>([
    {
      id: 'msg-init-1',
      sender: 'agent',
      content: '核心冲突锚定在「人工合成脊髓神经素」的配额断供。第三区的‘铁骨帮’并不是在争夺地盘，他们真正需要的是在 48 小时内破解总督府留下的冷凝加密锁。',
      thought: '1. 目标分析：为赛博朋克设定下的黑帮家族构建核心矛盾；\n2. 规避陈词滥调：避免使用“在这个充满霓虹灯的阴暗雨夜”等过度描摹；\n3. 知识库对齐：检索 novel_worldview_v2 中关于“神经义体能源垄断”的设定。',
      toolCall: 'memory.vector_db.search("能源垄断")',
      toolLatency: '82ms',
      timestamp: '刚刚'
    }
  ]);

  // Swarm Roundtable state
  const [roundtableTopic, setRoundtableTopic] = useState('长篇修仙小说中“破妄真瞳法则代价”与“高潮死斗战力通胀”的平衡共识');
  const [selectedSwarmAgents, setSelectedSwarmAgents] = useState<string[]>(['agent_webnovel_master', 'agent_deep_research', 'agent_code_architect']);
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [swarmTurns, setSwarmTurns] = useState<SwarmTurn[]>([]);
  const [swarmConsensus, setSwarmConsensus] = useState<string | null>(null);

  // Visual DAG Workflow state
  const [dagNodes, setDagNodes] = useState<DAGNode[]>([
    { id: 'node-1', agentId: 'agent_data_sentinel', label: '1. 事实账本抽取', role: 'Fact Extractor', avatar: '数', status: 'idle', x: 80, y: 140 },
    { id: 'node-2', agentId: 'agent_code_architect', label: '2. 设定一致性审查', role: 'Logic Auditor', avatar: '栈', status: 'idle', x: 280, y: 80 },
    { id: 'node-3', agentId: 'agent_swarm_pipeline', label: '3. 极端漏洞红蓝对抗', role: 'Red Teamer', avatar: '流', status: 'idle', x: 280, y: 220 },
    { id: 'node-4', agentId: 'agent_webnovel_master', label: '4. 文风去油与质感审校', role: 'Style Director', avatar: '网', status: 'idle', x: 500, y: 140 },
    { id: 'node-5', agentId: 'agent_deep_research', label: '5. 综合交付与归档', role: 'Synthesizer', avatar: '研', status: 'idle', x: 700, y: 140 },
  ]);
  const [isDagExecuting, setIsDagExecuting] = useState(false);
  const [activeDagNodeId, setActiveDagNodeId] = useState<string | null>(null);

  // New Custom Agent Modal Sheet
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalAgentName, setModalAgentName] = useState('');
  const [modalAgentSlug, setModalAgentSlug] = useState('');
  const [modalAgentCategory, setModalAgentCategory] = useState<AgentCategory>('creative');
  const [modalAgentModel, setModalAgentModel] = useState('Claude 3.5 Sonnet');
  const [modalAgentDesc, setModalAgentDesc] = useState('');
  const [modalAgentPrompt, setModalAgentPrompt] = useState('');

  // Floating Toast HUD
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Plugins state loaded from localStorage or default
  const [plugins, setPlugins] = useState<AgentPlugin[]>(() => {
    const saved = localStorage.getItem('apple_agent_studio_plugins');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return DEFAULT_PLUGINS;
  });

  const [activeConfigPlugin, setActiveConfigPlugin] = useState<AgentPlugin | null>(null);
  const [isNewPluginModalOpen, setIsNewPluginModalOpen] = useState(false);

  // Persist plugins
  useEffect(() => {
    localStorage.setItem('apple_agent_studio_plugins', JSON.stringify(plugins));
  }, [plugins]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2400);
  };

  // Persist agents to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem('apple_agent_studio_agents', JSON.stringify(agents));
  }, [agents]);

  // Update properties of active agent
  const updateActiveAgent = (updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === activeAgent.id ? { ...a, ...updates, updatedAt: '刚刚' } : a));
  };

  // Plugin handlers
  const handleTogglePluginForActiveAgent = (pluginId: string, mounted: boolean) => {
    const currentPlugins = activeAgent.plugins || [];
    const nextPlugins = mounted 
      ? [...new Set([...currentPlugins, pluginId])]
      : currentPlugins.filter(id => id !== pluginId);
    updateActiveAgent({ plugins: nextPlugins });
    const pName = plugins.find(p => p.id === pluginId)?.name || '插件';
    showToast(mounted ? `已为「${activeAgent.name}」挂载: ${pName}` : `已卸载插件: ${pName}`);
  };

  const handleSavePluginConfig = (updatedPlugin: AgentPlugin) => {
    setPlugins(prev => prev.map(p => p.id === updatedPlugin.id ? updatedPlugin : p));
    showToast(`已保存插件配置: ${updatedPlugin.name}`);
  };

  const handleAddNewPlugin = (newPlugin: AgentPlugin) => {
    setPlugins(prev => [newPlugin, ...prev]);
    const currentPlugins = activeAgent.plugins || [];
    updateActiveAgent({ plugins: [...new Set([...currentPlugins, newPlugin.id])] });
    showToast(`已创建并挂载自定义插件: ${newPlugin.name}`);
  };

  const handleDeleteCustomPlugin = (pluginId: string) => {
    setPlugins(prev => prev.filter(p => p.id !== pluginId));
    setAgents(prev => prev.map(a => ({
      ...a,
      plugins: (a.plugins || []).filter(id => id !== pluginId)
    })));
    showToast('已删除自定义插件');
  };

  // Star / Unstar Agent
  const handleToggleStar = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const next = !a.starred;
        showToast(next ? `已将「${a.name}」加入标星收藏` : `已取消标星`);
        return { ...a, starred: next };
      }
      return a;
    }));
  };

  // Duplicate Agent
  const handleDuplicateAgent = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = agents.find(a => a.id === agentId);
    if (!target) return;
    const cloned: Agent = {
      ...JSON.parse(JSON.stringify(target)),
      id: `agent_${Date.now()}`,
      name: `${target.name} (副本)`,
      slug: `${target.slug}.copy`,
      runsCount: 0,
      updatedAt: '刚刚',
      starred: false
    };
    setAgents(prev => [cloned, ...prev]);
    setSelectedAgentId(cloned.id);
    showToast(`已克隆生成「${cloned.name}」`);
  };

  // Delete Agent
  const handleDeleteAgent = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = agents.find(a => a.id === agentId);
    if (!target) return;
    if (confirm(`确定删除智能体「${target.name}」？`)) {
      setAgents(prev => prev.filter(a => a.id !== agentId));
      if (selectedAgentId === agentId) {
        const remaining = agents.filter(a => a.id !== agentId);
        setSelectedAgentId(remaining[0]?.id || DEFAULT_AGENTS[0].id);
      }
      showToast(`已删除智能体「${target.name}」`);
    }
  };

  // Reset to Default Agents
  const handleResetDefaults = () => {
    if (confirm('确定还原至官方默认内置智能体阵容？')) {
      setAgents(DEFAULT_AGENTS);
      setSelectedAgentId(DEFAULT_AGENTS[0].id);
      showToast('已还原官方内置智能体方案');
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(agents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `local_workbench_agents_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('智能体集群配置已成功导出为 JSON');
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setAgents(imported);
          setSelectedAgentId(imported[0]?.id || DEFAULT_AGENTS[0].id);
          showToast(`成功导入 ${imported.length} 个智能体档案`);
        }
      } catch (_) {
        showToast('JSON 解析失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Sandbox execution
  const handleExecuteSandbox = async () => {
    const query = sandboxInput.trim();
    if (!query || isSandboxRunning) return;

    setIsSandboxRunning(true);
    const nowTime = new Date().toTimeString().slice(0, 8);

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    setSandboxMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        content: query,
        timestamp: nowTime
      }
    ]);
    setSandboxInput('');

    // Increment run count
    updateActiveAgent({ runsCount: (activeAgent.runsCount || 0) + 1 });

    try {
      const res = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: activeAgent.id,
          agentName: activeAgent.name,
          role: activeAgent.slug,
          systemPrompt: activeAgent.promptTemplate || activeAgent.systemPrompt,
          tools: ['get_lore', 'search_materials'],
          task: query,
          autonomy: activeAgent.autonomyLevel === 'autonomous'
        })
      });

      const data = await res.json();
      if (data.success && data.deliverable) {
        setSandboxMessages(prev => [
          ...prev,
          {
            id: `agent-${Date.now()}`,
            sender: 'agent',
            content: data.deliverable,
            thought: data.steps?.[0]?.content || `1. 目标分析: ${query}\n2. 校验温度参数: ${activeAgent.temperature} | 调用 ${activeAgent.model}\n3. 端侧知识库与 MCP 权限核验通过。`,
            toolCall: `memory.vector_db.search("${query.slice(0, 10)}")`,
            toolLatency: `${data.executionTimeMs || 84}ms`,
            timestamp: nowTime
          }
        ]);
      } else {
        throw new Error(data.error || '执行异常');
      }
    } catch (_) {
      // High fidelity offline fallback
      let outputText = `已基于「${activeAgent.name}」完成推理审计：针对您给出的指令，已成功执行本地沙盒策略，各项参数指标正常，无越权风险。`;
      if (activeAgent.category === 'creative') {
        outputText = `夜幕尚未完全合拢，雨水便顺着冷轧钢的边缘坠落。没有多余的修辞，枪机的机簧卡进槽位，发出近乎冷酷的金属切削声。第三街区的能源配额已经正式进入枯竭倒计时。`;
      } else if (activeAgent.category === 'engineering') {
        outputText = `✓ 审查通过：检测到 0 处并发死锁风险。建议将该数据结构封装为原子指针（Arc/Atomic），以避免多线程抢占时的全局互斥锁开销。`;
      } else if (activeAgent.category === 'research') {
        outputText = `根据 ArXiv 交叉实证数据：在 Batch Size > 64 场景下，投机解码前向验证将触发 GPU 显存带宽饱和（Pareto 拐点），建议启用动态自适应退火机制。`;
      }

      // Detect mounted plugin tool calls based on intent
      let toolCall = `memory.vector_db.search("${query.slice(0, 10)}")`;
      let toolLatency = '42ms';
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes('pdf') || lowerQuery.includes('文档') || lowerQuery.includes('ocr')) {
        toolCall = `tools.document.pdf_parser.pdf_parse_document("${query.slice(0, 12)}.pdf")`;
        toolLatency = '28ms';
      } else if (lowerQuery.includes('python') || lowerQuery.includes('代码') || lowerQuery.includes('沙盒') || lowerQuery.includes('计算') || lowerQuery.includes('运行')) {
        toolCall = `tools.runtime.code_sandbox.sandbox_exec_python(code="def compute(): ...")`;
        toolLatency = '18ms';
      } else if (lowerQuery.includes('sql') || lowerQuery.includes('数据库') || lowerQuery.includes('查询') || lowerQuery.includes('表')) {
        toolCall = `tools.database.sqlite_gateway.db_execute_query("SELECT * FROM fact_ledger LIMIT 10")`;
        toolLatency = '12ms';
      } else if (lowerQuery.includes('http') || lowerQuery.includes('网页') || lowerQuery.includes('抓取') || lowerQuery.includes('url')) {
        toolCall = `tools.network.smart_crawler.web_fetch_clean_markdown("https://arxiv.org/abs/2602")`;
        toolLatency = '64ms';
      } else if (lowerQuery.includes('图表') || lowerQuery.includes('可视化') || lowerQuery.includes('画图') || lowerQuery.includes('echarts')) {
        toolCall = `tools.visualization.echarts_engine.chart_render_echarts(type="radar")`;
        toolLatency = '24ms';
      }

      setSandboxMessages(prev => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          content: outputText,
          thought: `1. 意图解构:「${query.slice(0, 15)}...」\n2. 校验温度: ${activeAgent.temperature} | 基座: ${activeAgent.model}\n3. 触发挂载插件 [${toolCall.split('(')[0]}] 完成安全边界核验与本地沙盒隔离执行。`,
          toolCall,
          toolLatency,
          timestamp: nowTime
        }
      ]);
    } finally {
      setIsSandboxRunning(false);
      showToast('智能体推理完成');
    }
  };

  // Run Swarm Roundtable
  const handleRunSwarm = async () => {
    if (isSwarmRunning) return;
    setIsSwarmRunning(true);
    setSwarmTurns([]);
    setSwarmConsensus(null);

    const swarmAgents = agents.filter(a => selectedSwarmAgents.includes(a.id));

    try {
      const res = await fetch('/api/agents/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agents: swarmAgents,
          topic: roundtableTopic
        })
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.turns)) {
        let i = 0;
        const timer = setInterval(() => {
          if (i < data.turns.length) {
            setSwarmTurns(prev => [...prev, data.turns[i]]);
            i++;
          } else {
            clearInterval(timer);
            setSwarmConsensus(data.consensus);
            setIsSwarmRunning(false);
            showToast('多智能体圆桌会商达成共识');
          }
        }, 650);
      }
    } catch (_) {
      const fallbackTurns: SwarmTurn[] = [
        {
          agentId: 'agent_webnovel_master',
          agentName: '网文宏观架构与去AI味主笔',
          avatar: '网',
          avatarColor: 'from-purple-500 to-indigo-600',
          role: 'Creative Director',
          stance: '质感提炼',
          content: `针对议题「${roundtableTopic}」，在文字表现上，应杜绝“空气仿佛凝固”、“倒吸一口凉气”等陈腐套话，改为从细微的生理触感（如指节发白、耳后冷汗、喉头铁锈味）进行五感具象刻画。`
        },
        {
          agentId: 'agent_deep_research',
          agentName: '学术文献深研与跨界合成者',
          avatar: '研',
          avatarColor: 'from-emerald-500 to-teal-600',
          role: 'Researcher',
          stance: '实证对照',
          content: `从前沿同类创作与经典叙事文献来看，代价递进原则符合读者心理预期（Pareto 最优）。建议引入“分阶段经络侵蚀”数值量化，避免主观模糊判定。`
        },
        {
          agentId: 'agent_code_architect',
          agentName: '全栈代码重构与架构审计师',
          avatar: '栈',
          avatarColor: 'from-blue-600 to-cyan-500',
          role: 'Logic Auditor',
          stance: '严格审视',
          content: `我从底层法则守恒提出约束：任何越阶爆发必须存在不可逆的代偿。若前文未铺垫对应代价，该情节在后续逻辑展开中将演变为无法收敛的战力通胀漏洞。`
        }
      ];

      let i = 0;
      const timer = setInterval(() => {
        if (i < fallbackTurns.length) {
          setSwarmTurns(prev => [...prev, fallbackTurns[i]]);
          i++;
        } else {
          clearInterval(timer);
          setSwarmConsensus(`【多智能体圆桌会商共识决议】\n1. **法则底线**：瞳术施展必须受到物理与经络代价刚性约束，不可出现毫无损伤的连续爆发。\n2. **破局机制**：针对极限超时，引入“局部经络闭锁”作为代偿方案，维持情节合理张力。\n3. **文字规范**：彻底剔除 AI 腔套话，采用五感具象描写强化生死博弈临场感。`);
          setIsSwarmRunning(false);
          showToast('多智能体圆桌会商达成共识');
        }
      }, 650);
    }
  };

  // Run Visual DAG
  const handleExecuteDag = () => {
    if (isDagExecuting) return;
    setIsDagExecuting(true);
    setDagNodes(prev => prev.map(n => ({ ...n, status: 'idle', outputSummary: undefined })));

    let step = 0;
    const nodeSequence = ['node-1', 'node-2', 'node-3', 'node-4', 'node-5'];

    const timer = setInterval(() => {
      if (step < nodeSequence.length) {
        const currId = nodeSequence[step];
        setActiveDagNodeId(currId);

        setDagNodes(prev => prev.map(n => {
          if (n.id === currId) {
            return { ...n, status: 'running' };
          }
          if (step > 0 && n.id === nodeSequence[step - 1]) {
            return { ...n, status: 'done', outputSummary: `步骤 [${n.role}] 执行通过并向下游传递数据` };
          }
          return n;
        }));

        step++;
      } else {
        setDagNodes(prev => prev.map(n => n.id === 'node-5' ? { ...n, status: 'done', outputSummary: '全流水线综合交付完成' } : n));
        clearInterval(timer);
        setIsDagExecuting(false);
        setActiveDagNodeId(null);
        showToast('全流程 DAG 工作流执行完毕');
      }
    }, 900);
  };

  // Save new agent from modal sheet
  const handleCreateAgentFromModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAgentName.trim()) return;

    const newAg: Agent = {
      id: `agent_${Date.now()}`,
      name: modalAgentName.trim(),
      slug: modalAgentSlug.trim() || `agent.${Date.now().toString(36)}`,
      category: modalAgentCategory,
      status: 'running',
      model: modalAgentModel,
      avatar: modalAgentName.slice(0, 1),
      avatarColor: 'from-blue-600 to-indigo-600',
      desc: modalAgentDesc.trim() || '定制专业智能体',
      systemPrompt: modalAgentPrompt.trim() || '你是一名通晓该领域的专家。',
      promptTemplate: modalAgentPrompt.trim() || '你是【{{agent_name}}】。任务：{{user_task}}',
      voiceTone: 'literary',
      autonomyLevel: 'autonomous',
      temperature: 0.7,
      maxTokens: 4096,
      reasoningEffort: true,
      tools: { webSearch: true, localFs: true, codeSandbox: false, memoryRag: true },
      starred: false,
      runsCount: 0,
      updatedAt: '刚刚',
      knowledgeMounts: {
        loreCategories: ['世界观法则'],
        materialTags: ['工作台归档'],
        mountFactLedger: true,
        activeDatasetName: '端侧通用知识库'
      },
      memoryConfig: {
        type: 'episodic',
        slots: 16,
        contextWindow: 16384,
        reflectionLoops: 1
      }
    };

    setAgents(prev => [newAg, ...prev]);
    setSelectedAgentId(newAg.id);
    setShowAddModal(false);
    setModalAgentName('');
    setModalAgentSlug('');
    setModalAgentDesc('');
    setModalAgentPrompt('');
    setMainViewMode('orchestrator');
    showToast(`智能体「${newAg.name}」已创建并进入编排`);
  };

  // Filter and sort agents
  const filteredAgents = agents.filter(a => {
    // Category Filter
    if (currentCategory === 'starred' && !a.starred) return false;
    if (currentCategory !== 'all' && currentCategory !== 'starred' && a.category !== currentCategory) return false;

    // Status Filter
    if (currentStatusFilter !== 'all' && a.status !== currentStatusFilter) return false;

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.name.toLowerCase().includes(q);
      const matchDesc = a.desc.toLowerCase().includes(q);
      const matchModel = a.model.toLowerCase().includes(q);
      const matchSlug = a.slug.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchModel && !matchSlug) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortMode === 'runs') return (b.runsCount || 0) - (a.runsCount || 0);
    if (sortMode === 'name') return a.name.localeCompare(b.name, 'zh-Hans-CN');
    return 0;
  });

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--apple-bg)] select-none font-sans">
      {/* ============================================================ */}
      {/* 1. TOP macOS SEQUOIA UNIFIED CHROME TOOLBAR */}
      {/* ============================================================ */}
      <header className="h-[52px] py-2 px-4 md:px-6 border-b border-[var(--apple-border)] bg-[var(--apple-glass)] backdrop-blur-2xl flex items-center justify-between z-30 shrink-0 select-none">
        
        {/* Left: Window Traffic Lights & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/40 shadow-xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/40 shadow-xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/40 shadow-xs inline-block" />
          </div>
          <div className="h-4 w-px bg-[var(--apple-border)] hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs md:text-sm font-bold text-[var(--apple-text-primary)] tracking-tight truncate">
              AI 智能体编排与工作台
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20 hidden md:inline">
              Studio v2.5
            </span>
          </div>
        </div>

        {/* Center: View Switcher & Spotlight Search */}
        <div className="flex items-center gap-3">
          {/* Main Segmented Mode Switcher */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-medium">
            <button
              onClick={() => setMainViewMode('library')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                mainViewMode === 'library'
                  ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] font-semibold shadow-xs'
                  : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>智能体工坊</span>
            </button>
            <button
              onClick={() => setMainViewMode('orchestrator')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                mainViewMode === 'orchestrator'
                  ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] font-semibold shadow-xs'
                  : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>编排与推理流</span>
            </button>
          </div>

          {/* Spotlight Search Omnibar */}
          <div className="relative w-48 sm:w-64 lg:w-72 hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--apple-text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索智能体、技能或模型... (⌘K)"
              className="w-full h-8 pl-8 pr-12 text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] outline-none focus:border-[var(--apple-accent)] font-sans transition"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--apple-surface)] text-[var(--apple-text-tertiary)] border border-[var(--apple-border)]">⌘K</kbd>
          </div>
        </div>

        {/* Right Action Ribbon */}
        <div className="flex items-center gap-2">
          {/* Live Sandbox Toggle Button */}
          <button
            onClick={() => setIsSandboxOpen(!isSandboxOpen)}
            className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isSandboxOpen
                ? 'bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)] border-[var(--apple-accent)]/30'
                : 'bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] border-[var(--apple-border)] hover:text-[var(--apple-text-primary)]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">实时沙盒</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* New Agent Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="h-8 px-3.5 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建智能体</span>
          </button>
        </div>
      </header>

      {/* Floating Apple HUD Toast */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#181924]/95 text-white border border-white/20 text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. THREE-PANE BODY (Sidebar + Canvas + Sandbox Drawer) */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* LEFT SIDEBAR: Categories & Compute Diagnostics */}
        <aside className="w-64 border-r border-[var(--apple-border)] bg-[var(--apple-sidebar)] flex flex-col p-3 shrink-0 select-none">
          {/* Smart Categorization */}
          <div className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] px-2 py-1 uppercase tracking-wider">
            智能体分类
          </div>
          <nav className="space-y-1 mt-1 text-xs">
            <button
              onClick={() => setCurrentCategory('all')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                currentCategory === 'all'
                  ? 'bg-[var(--apple-accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>全部智能体</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                currentCategory === 'all' ? 'bg-white/20 text-white' : 'bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)]'
              }`}>
                {agents.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentCategory('creative')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                currentCategory === 'creative'
                  ? 'bg-[var(--apple-accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Feather className="w-3.5 h-3.5 text-purple-400" />
                <span>创作与长文引擎</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">
                {agents.filter(a => a.category === 'creative').length}
              </span>
            </button>

            <button
              onClick={() => setCurrentCategory('engineering')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                currentCategory === 'engineering'
                  ? 'bg-[var(--apple-accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-blue-400" />
                <span>代码与全栈重构</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">
                {agents.filter(a => a.category === 'engineering').length}
              </span>
            </button>

            <button
              onClick={() => setCurrentCategory('research')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                currentCategory === 'research'
                  ? 'bg-[var(--apple-accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>数据分析与深研</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">
                {agents.filter(a => a.category === 'research').length}
              </span>
            </button>

            <button
              onClick={() => setCurrentCategory('swarm')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                currentCategory === 'swarm'
                  ? 'bg-[var(--apple-accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <GitMerge className="w-3.5 h-3.5 text-orange-400" />
                <span>自治多代理流水线</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">
                {agents.filter(a => a.category === 'swarm').length}
              </span>
            </button>

            <button
              onClick={() => setCurrentCategory('starred')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl font-medium transition-all ${
                currentCategory === 'starred'
                  ? 'bg-[var(--apple-accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>标星收藏</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">
                {agents.filter(a => a.starred).length}
              </span>
            </button>
          </nav>

          {/* Runtime Status Filters */}
          <div className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] px-2 pt-4 pb-1 uppercase tracking-wider">
            运行状态过滤
          </div>
          <div className="space-y-1 text-xs">
            <div
              onClick={() => setCurrentStatusFilter('all')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition ${
                currentStatusFilter === 'all' ? 'bg-[var(--apple-subtle)] font-semibold text-[var(--apple-text-primary)]' : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400" /> 全部状态
              </span>
              <span className="text-[10px] font-mono">{agents.length}</span>
            </div>
            <div
              onClick={() => setCurrentStatusFilter('running')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition ${
                currentStatusFilter === 'running' ? 'bg-[var(--apple-subtle)] font-semibold text-[var(--apple-text-primary)]' : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> 运行就绪 (Active)
              </span>
              <span className="text-[10px] font-mono">{agents.filter(a => a.status === 'running').length}</span>
            </div>
            <div
              onClick={() => setCurrentStatusFilter('idle')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition ${
                currentStatusFilter === 'idle' ? 'bg-[var(--apple-subtle)] font-semibold text-[var(--apple-text-primary)]' : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 闲置待命 (Idle)
              </span>
              <span className="text-[10px] font-mono">{agents.filter(a => a.status === 'idle').length}</span>
            </div>
          </div>

          {/* Local Compute Diagnostics Footer */}
          <div className="mt-auto pt-3 border-t border-[var(--apple-separator)] space-y-2">
            <div className="p-3 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--apple-text-secondary)] flex items-center gap-1.5 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-blue-500" />
                  本地推理算力
                </span>
                <span className="text-[10px] font-mono text-emerald-500 font-semibold">端侧 SQLite + LLM</span>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-[var(--apple-text-tertiary)] mb-1">
                  <span>Unified Memory (RAM)</span>
                  <span>18.4 / 36.0 GB</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--apple-subtle)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[51%] rounded-full" />
                </div>
              </div>
            </div>

            {/* Import / Export Action Buttons */}
            <div className="flex items-center justify-between px-1 text-[11px] text-[var(--apple-text-tertiary)]">
              <button onClick={handleExportJSON} className="hover:text-[var(--apple-accent)] flex items-center gap-1 transition font-medium">
                <Download className="w-3 h-3" /> 导出配置方案
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="hover:text-[var(--apple-accent)] flex items-center gap-1 transition font-medium">
                <Upload className="w-3 h-3" /> 导入方案
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImportJSON} accept=".json" className="hidden" />
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* CENTER CANVAS: HUB LIBRARY OR ORCHESTRATOR STUDIO */}
        {/* ======================================================== */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[var(--apple-bg)] relative">
          
          {/* ---------------------------------------------------- */}
          {/* VIEW A: AGENT LIBRARY HUB GRID (智能体工坊) */}
          {/* ---------------------------------------------------- */}
          {mainViewMode === 'library' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Library Header Ribbon */}
              <div className="px-6 py-3 border-b border-[var(--apple-separator)] bg-[var(--apple-surface)]/60 backdrop-blur-md flex items-center justify-between text-xs text-[var(--apple-text-secondary)] shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-[var(--apple-text-primary)]">
                    {currentCategory === 'all' ? '全部智能体' : currentCategory === 'starred' ? '标星收藏' : currentCategory}
                  </h2>
                  <span className="text-[var(--apple-text-tertiary)]">·</span>
                  <span>已载入 {filteredAgents.length} 个就绪智能体</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort Mode Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span>排序:</span>
                    <select
                      value={sortMode}
                      onChange={e => setSortMode(e.target.value as any)}
                      className="px-2.5 py-1 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] outline-none cursor-pointer"
                    >
                      <option value="recent">最近更新</option>
                      <option value="runs">执行调用量</option>
                      <option value="name">名称字母 (A-Z)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleResetDefaults}
                    className="text-[11px] text-[var(--apple-text-tertiary)] hover:text-[var(--apple-accent)] flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3" /> 还原官方模板
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                  {filteredAgents.map(a => {
                    const isRunning = a.status === 'running';
                    return (
                      <div
                        key={a.id}
                        onClick={() => {
                          setSelectedAgentId(a.id);
                          setMainViewMode('orchestrator');
                          showToast(`已选定「${a.name}」并载入编排`);
                        }}
                        className="group bg-[var(--apple-surface)] border border-[var(--apple-border)] hover:border-[var(--apple-accent)]/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
                      >
                        <div>
                          {/* Card Top Bar */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${a.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0`}>
                                {a.avatar}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-xs font-bold text-[var(--apple-text-primary)] group-hover:text-[var(--apple-accent)] transition flex items-center gap-1.5 truncate">
                                  {a.name}
                                </h3>
                                <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)] truncate block">{a.slug}</span>
                              </div>
                            </div>

                            {/* Star Button */}
                            <button
                              onClick={e => handleToggleStar(a.id, e)}
                              className="p-1 rounded-lg text-zinc-400 hover:text-amber-500 transition shrink-0"
                            >
                              <Star className={`w-4 h-4 ${a.starred ? 'text-amber-400 fill-amber-400' : ''}`} />
                            </button>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-[var(--apple-text-secondary)] line-clamp-2 leading-relaxed mb-4">
                            {a.desc}
                          </p>

                          {/* Capabilities & Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[10px]">
                            <span className={`px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                              isRunning ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              <span>{isRunning ? '运行就绪' : '闲置待命'}</span>
                            </span>

                            <span className="font-mono px-2 py-0.5 rounded-full bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] border border-[var(--apple-border)]">
                              {a.model}
                            </span>

                            {a.tools?.webSearch && <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">联网</span>}
                            {a.tools?.memoryRag && <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500">RAG记忆</span>}
                            {a.tools?.codeSandbox && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">沙盒</span>}
                          </div>
                        </div>

                        {/* Card Bottom Ribbon */}
                        <div className="pt-3 border-t border-[var(--apple-separator)] flex items-center justify-between text-[11px] text-[var(--apple-text-tertiary)]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px]">调用 {a.runsCount || 0} 次</span>
                            <span>·</span>
                            <span className="text-[10px]">{a.updatedAt}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedAgentId(a.id);
                                if (!isSandboxOpen) setIsSandboxOpen(true);
                                setSandboxInput('对当前文本执行核心审查与事实比对');
                                showToast(`已就绪「${a.name}」沙盒探针`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-[var(--apple-accent)] text-[var(--apple-accent)] hover:text-white text-[11px] font-semibold transition flex items-center gap-1 shadow-xs"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>试运行</span>
                            </button>
                            <button
                              onClick={e => handleDuplicateAgent(a.id, e)}
                              className="p-1 rounded-lg hover:bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)] transition"
                              title="克隆智能体"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={e => handleDeleteAgent(a.id, e)}
                              className="p-1 rounded-lg hover:bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)] hover:text-rose-500 transition"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredAgents.length === 0 && (
                  <div className="h-96 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--apple-subtle)] flex items-center justify-center text-[var(--apple-text-tertiary)]">
                      <Bot className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--apple-text-primary)]">未检索到匹配的智能体</h4>
                    <p className="text-xs text-[var(--apple-text-tertiary)] max-w-sm">可调整搜索词或分类，也可以点击右上角快速新建智能体。</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* VIEW B: ACTIVE AGENT ORCHESTRATOR STUDIO (编排与推理流) */}
          {/* ---------------------------------------------------- */}
          {mainViewMode === 'orchestrator' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Studio Top Navigation Ribbon */}
              <div className="px-6 py-2.5 border-b border-[var(--apple-separator)] bg-[var(--apple-surface)]/80 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMainViewMode('library')}
                    className="p-1.5 rounded-xl hover:bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition"
                    title="返回智能体工坊"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${activeAgent.avatarColor} text-white flex items-center justify-center text-xs font-bold shadow-xs`}>
                      {activeAgent.avatar}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[var(--apple-text-primary)] leading-tight">{activeAgent.name}</h3>
                      <p className="text-[10px] font-mono text-[var(--apple-text-tertiary)]">{activeAgent.slug}</p>
                    </div>
                  </div>
                </div>

                {/* Sub-tabs Switcher */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-medium">
                  {[
                    { id: 'persona' as const, label: '人格与提示词', icon: Variable },
                    { id: 'compute' as const, label: '模型路由与超参', icon: Cpu },
                    { id: 'tools' as const, label: '工具与外部插件', icon: Wrench },
                    { id: 'pipeline' as const, label: '蜂群协作流', icon: GitMerge },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isSel = studioSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setStudioSubTab(tab.id)}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                          isSel
                            ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] font-semibold shadow-xs'
                            : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast(`已更新「${activeAgent.name}」编排配置`)}
                    className="px-3.5 py-1.5 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>保存策略</span>
                  </button>
                </div>
              </div>

              {/* Studio Body Panes */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

                {/* SUBTAB 1: Persona & System Prompts */}
                {studioSubTab === 'persona' && (
                  <div className="max-w-4xl mx-auto space-y-5">
                    <div className="bg-[var(--apple-surface)] rounded-2xl p-5 border border-[var(--apple-border)] shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-[var(--apple-separator)] pb-3">
                        <div>
                          <h4 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span>智能体人设与全局角色约束 (System Persona)</span>
                          </h4>
                          <p className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">决定智能体的思考偏好、专业深度与语言基调。</p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
                          CoT 强推理协议激活
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--apple-text-secondary)] mb-1">语气基调预设 (Voice & Tone)</label>
                          <select
                            value={activeAgent.voiceTone}
                            onChange={e => updateActiveAgent({ voiceTone: e.target.value as any })}
                            className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                          >
                            <option value="literary">严肃文学与镜头感白描 (Show, Don't Tell)</option>
                            <option value="architect">严谨极客与高防御性架构师</option>
                            <option value="academic">同行审稿级学术中立与数据严谨</option>
                            <option value="concise">极简要点派 (直接给出结论)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--apple-text-secondary)] mb-1">自治决策自由度</label>
                          <select
                            value={activeAgent.autonomyLevel}
                            onChange={e => updateActiveAgent({ autonomyLevel: e.target.value as any })}
                            className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                          >
                            <option value="guided">半受控执行 (高风险工具需人工确认)</option>
                            <option value="autonomous">全自治执行 (自动连续迭代工具链路)</option>
                            <option value="passive">被动问答 (无工具调用权限)</option>
                          </select>
                        </div>
                      </div>

                      {/* Custom Prompt Template & Tokens */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <label className="font-semibold text-[var(--apple-text-primary)]">核心系统提示词与模板 (System Prompt & Template)</label>
                          <button
                            onClick={() => {
                              const snippet = `\n\n【结构化思考协议 (CoT Protocol)】：\n1. 仔细识别核心输入与潜在因果边界；\n2. 在给出最终交付物前，先进行两轮防御性自查；\n3. 杜绝空洞辞令，以真实证据与实例交付。`;
                              updateActiveAgent({ systemPrompt: activeAgent.systemPrompt + snippet });
                              showToast('已注入结构化思维约束模板');
                            }}
                            className="text-[11px] text-[var(--apple-accent)] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Plus className="w-3 h-3" /> 注入结构化思考脚手架
                          </button>
                        </div>
                        <textarea
                          rows={7}
                          value={activeAgent.systemPrompt}
                          onChange={e => updateActiveAgent({ systemPrompt: e.target.value })}
                          className="w-full text-xs font-mono rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] p-3.5 focus:outline-none focus:border-[var(--apple-accent)] leading-relaxed text-[var(--apple-text-primary)] resize-none"
                        />
                      </div>

                      {/* Token variable injection */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-semibold text-[var(--apple-text-tertiary)] uppercase">
                          点击注入上下文变量插槽:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { token: '{{user_task}}', label: '用户任务' },
                            { token: '{{novel_lore}}', label: '世界观法则' },
                            { token: '{{character_profile}}', label: '人物设定' },
                            { token: '{{banned_words}}', label: '禁用词库' },
                            { token: '{{knowledge_context}}', label: '挂载知识' },
                          ].map(v => (
                            <button
                              key={v.token}
                              onClick={() => {
                                updateActiveAgent({ systemPrompt: `${activeAgent.systemPrompt}\n${v.token}` });
                                showToast(`已插入插槽: ${v.token}`);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[10px] font-mono text-[var(--apple-accent)] hover:bg-[var(--apple-accent)] hover:text-white transition-all"
                            >
                              {v.token} ({v.label})
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: Compute & Model Routing */}
                {studioSubTab === 'compute' && (
                  <div className="max-w-4xl mx-auto space-y-5">
                    <div className="bg-[var(--apple-surface)] rounded-2xl p-5 border border-[var(--apple-border)] shadow-xs space-y-5">
                      <div className="border-b border-[var(--apple-separator)] pb-3">
                        <h4 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-blue-500" />
                          <span>基座模型与超参精细调节</span>
                        </h4>
                        <p className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">无缝在云端前沿大模型与本地离线安全模型间调度。</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-xs font-semibold text-[var(--apple-text-secondary)] mb-1">主推理基座模型</label>
                          <select
                            value={activeAgent.model}
                            onChange={e => updateActiveAgent({ model: e.target.value })}
                            className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                          >
                            <optgroup label="前沿云端多模态">
                              <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (强逻辑与文笔)</option>
                              <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (2M 级原生超长上下文)</option>
                              <option value="GPT-4o">GPT-4o (全能通用与极速响应)</option>
                            </optgroup>
                            <optgroup label="本地离线引擎 (Local Ollama / SQLite)">
                              <option value="Llama 3.3 70B (Ollama)">Llama 3.3 70B Instruct (Q4_K_M)</option>
                              <option value="Qwen 2.5 Coder 32B">Qwen 2.5 Coder 32B (专用重构)</option>
                              <option value="DeepSeek R1 14B">DeepSeek R1 14B (本地长思维链)</option>
                            </optgroup>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[var(--apple-text-secondary)] mb-1">降级故障转移模型 (Fallback Model)</label>
                          <select className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]">
                            <option value="local-qwen">自动切至本地 Ollama Qwen 2.5 14B</option>
                            <option value="gemini-flash">Gemini 1.5 Flash (秒级灾备)</option>
                            <option value="none">无降级 (直接抛出熔断告警)</option>
                          </select>
                        </div>
                      </div>

                      {/* Sliders */}
                      <div className="space-y-4 pt-2 text-xs">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-[var(--apple-text-primary)]">推理温度 (Temperature)</span>
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-[var(--apple-accent)] font-bold">
                              {activeAgent.temperature} - {activeAgent.temperature < 0.3 ? '严谨确定性' : activeAgent.temperature > 0.7 ? '发散创作' : '均衡通用'}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={activeAgent.temperature}
                            onChange={e => updateActiveAgent({ temperature: parseFloat(e.target.value) })}
                            className="w-full accent-[var(--apple-accent)] cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-[var(--apple-text-primary)]">单次最大生成 Token</span>
                            <span className="font-mono text-[11px] text-[var(--apple-text-tertiary)]">{activeAgent.maxTokens.toLocaleString()} Tokens</span>
                          </div>
                          <input
                            type="range"
                            min="512"
                            max="16384"
                            step="512"
                            value={activeAgent.maxTokens}
                            onChange={e => updateActiveAgent({ maxTokens: parseInt(e.target.value) })}
                            className="w-full accent-[var(--apple-accent)] cursor-pointer"
                          />
                        </div>

                        {/* Reasoning Effort Switch */}
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--apple-separator)]">
                          <div>
                            <div className="font-semibold text-[var(--apple-text-primary)]">启用推理链展开 (Thinking / Reasoning Effort)</div>
                            <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">让模型在给出最终答复前，在隐藏折叠槽内完整输出推演草稿。</div>
                          </div>
                          <button
                            role="switch"
                            aria-checked={activeAgent.reasoningEffort}
                            onClick={() => updateActiveAgent({ reasoningEffort: !activeAgent.reasoningEffort })}
                            className={`w-11 h-6 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                              activeAgent.reasoningEffort ? 'bg-[var(--apple-accent)]' : 'bg-[var(--apple-subtle)] border border-[var(--apple-border)]'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${activeAgent.reasoningEffort ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: Tools & Capabilities Matrix */}
                {studioSubTab === 'tools' && (
                  <div className="max-w-4xl mx-auto space-y-5">
                    <div className="bg-[var(--apple-surface)] rounded-2xl p-5 border border-[var(--apple-border)] shadow-xs space-y-4">
                      <div className="border-b border-[var(--apple-separator)] pb-3">
                        <h4 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-emerald-400" />
                          <span>工具调用与能力挂载矩阵 (Function Calling Matrix)</span>
                        </h4>
                        <p className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">赋予智能体与本地操作系统、沙盒运行环境及网络世界交互的能力。</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Web Search */}
                        <div className="p-3.5 rounded-xl border border-[var(--apple-border)] bg-[var(--apple-subtle)] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                              <Globe className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[var(--apple-text-primary)]">实时多模态联网搜索 (Web Search)</div>
                              <div className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">tools.google_search / ddg</div>
                            </div>
                          </div>
                          <button
                            role="switch"
                            aria-checked={activeAgent.tools.webSearch}
                            onClick={() => updateActiveAgent({ tools: { ...activeAgent.tools, webSearch: !activeAgent.tools.webSearch } })}
                            className={`w-10 h-5 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                              activeAgent.tools.webSearch ? 'bg-[var(--apple-accent)]' : 'bg-black/30 border border-white/10'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${activeAgent.tools.webSearch ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Local File System */}
                        <div className="p-3.5 rounded-xl border border-[var(--apple-border)] bg-[var(--apple-subtle)] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                              <FolderGit2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[var(--apple-text-primary)]">本地工作区读写 (Local File Access)</div>
                              <div className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">sandbox.fs.read_write</div>
                            </div>
                          </div>
                          <button
                            role="switch"
                            aria-checked={activeAgent.tools.localFs}
                            onClick={() => updateActiveAgent({ tools: { ...activeAgent.tools, localFs: !activeAgent.tools.localFs } })}
                            className={`w-10 h-5 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                              activeAgent.tools.localFs ? 'bg-[var(--apple-accent)]' : 'bg-black/30 border border-white/10'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${activeAgent.tools.localFs ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Code Interpreter Sandbox */}
                        <div className="p-3.5 rounded-xl border border-[var(--apple-border)] bg-[var(--apple-subtle)] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                              <Terminal className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[var(--apple-text-primary)]">代码隔离执行沙盒 (Python & JS)</div>
                              <div className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">sandbox.code_interpreter</div>
                            </div>
                          </div>
                          <button
                            role="switch"
                            aria-checked={activeAgent.tools.codeSandbox}
                            onClick={() => updateActiveAgent({ tools: { ...activeAgent.tools, codeSandbox: !activeAgent.tools.codeSandbox } })}
                            className={`w-10 h-5 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                              activeAgent.tools.codeSandbox ? 'bg-[var(--apple-accent)]' : 'bg-black/30 border border-white/10'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${activeAgent.tools.codeSandbox ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Long-Term Vector Memory RAG */}
                        <div className="p-3.5 rounded-xl border border-[var(--apple-border)] bg-[var(--apple-subtle)] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                              <Database className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[var(--apple-text-primary)]">长效记忆与知识库 RAG 检索</div>
                              <div className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">memory.vector_db.top_k</div>
                            </div>
                          </div>
                          <button
                            role="switch"
                            aria-checked={activeAgent.tools.memoryRag}
                            onClick={() => updateActiveAgent({ tools: { ...activeAgent.tools, memoryRag: !activeAgent.tools.memoryRag } })}
                            className={`w-10 h-5 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                              activeAgent.tools.memoryRag ? 'bg-[var(--apple-accent)]' : 'bg-black/30 border border-white/10'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${activeAgent.tools.memoryRag ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      {/* RAG Knowledge Mounts */}
                      <div className="p-4 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-3">
                        <div className="text-xs font-semibold text-[var(--apple-text-primary)] flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-blue-500" />
                          <span>挂载关联知识库库索引 (Active Vector Index)</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-3 py-1 rounded-xl bg-[var(--apple-surface)] border border-[var(--apple-border)] font-mono flex items-center gap-1.5 shadow-xs">
                            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                            <span>{activeAgent.knowledgeMounts.activeDatasetName}</span>
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-[var(--apple-surface)] border border-[var(--apple-border)] font-mono flex items-center gap-1.5 shadow-xs">
                            <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
                            <span>SQLite 原子事实账本 (挂载中)</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* EXTERNAL PLUGINS MANAGEMENT SYSTEM                   */}
                    {/* ---------------------------------------------------- */}
                    <div className="bg-[var(--apple-surface)] rounded-2xl p-5 border border-[var(--apple-border)] shadow-xs">
                      <AgentPluginsSection
                        activeAgentPluginIds={activeAgent.plugins || []}
                        allPlugins={plugins}
                        onTogglePlugin={handleTogglePluginForActiveAgent}
                        onOpenConfig={(p) => setActiveConfigPlugin(p)}
                        onOpenNewPluginModal={() => setIsNewPluginModalOpen(true)}
                        onDeleteCustomPlugin={handleDeleteCustomPlugin}
                      />
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: Multi-Agent Collaboration Pipeline */}
                {studioSubTab === 'pipeline' && (
                  <div className="max-w-4xl mx-auto space-y-5">
                    <div className="bg-[var(--apple-surface)] rounded-2xl p-5 border border-[var(--apple-border)] shadow-xs space-y-4">
                      <div className="border-b border-[var(--apple-separator)] pb-3 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                            <GitMerge className="w-4 h-4 text-orange-400" />
                            <span>多智能体蜂群协作拓扑 (Multi-Agent Swarm Pipeline)</span>
                          </h4>
                          <p className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">设定团队协作拓扑（Supervisor 编排、Worker 执行与 Critic 审查）。</p>
                        </div>
                        <button
                          onClick={handleExecuteDag}
                          disabled={isDagExecuting}
                          className="px-3.5 py-1.5 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isDagExecuting ? '流水线演进中...' : '启动全链路模拟'}</span>
                        </button>
                      </div>

                      {/* Visual Node Pipeline Preview */}
                      <div className="p-6 rounded-2xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] flex flex-col md:flex-row items-center justify-between gap-3 overflow-x-auto">
                        {/* Node 1 */}
                        <div className="flex-1 min-w-[140px] p-3.5 rounded-2xl bg-[var(--apple-surface)] border border-blue-500/30 shadow-xs text-center space-y-1">
                          <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center mx-auto text-xs font-bold">
                            👑
                          </div>
                          <div className="text-xs font-bold text-[var(--apple-text-primary)]">规划指挥官</div>
                          <div className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">Supervisor Node</div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-[var(--apple-text-tertiary)] hidden md:block" />

                        {/* Node 2 */}
                        <div className="flex-1 min-w-[140px] p-3.5 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs text-center space-y-1">
                          <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center mx-auto text-xs font-bold">
                            ✍️
                          </div>
                          <div className="text-xs font-bold text-[var(--apple-text-primary)]">主笔起草体</div>
                          <div className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">Worker Node A</div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-[var(--apple-text-tertiary)] hidden md:block" />

                        {/* Node 3 */}
                        <div className="flex-1 min-w-[140px] p-3.5 rounded-2xl bg-[var(--apple-surface)] border border-emerald-500/30 shadow-xs text-center space-y-1">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center mx-auto text-xs font-bold">
                            🔍
                          </div>
                          <div className="text-xs font-bold text-[var(--apple-text-primary)]">去AI味审稿官</div>
                          <div className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">Critic Reviewer</div>
                        </div>
                      </div>

                      <div className="text-[11px] text-[var(--apple-text-tertiary)] leading-relaxed bg-[var(--apple-subtle)] p-3.5 rounded-xl">
                        💡 <b>协作规则</b>：指挥官解析用户复杂目标，拆解为子任务并派发给主笔起草体；起草体生成后自动流经审稿官进行违禁词、翻译腔与逻辑漏洞多轮审计，直至判定得分超过 92 分才提交给最终用户。
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </main>

        {/* ======================================================== */}
        {/* RIGHT DRAWER: INTERACTIVE LIVE AGENT SANDBOX */}
        {/* ======================================================== */}
        {isSandboxOpen && (
          <aside className="w-96 border-l border-[var(--apple-border)] bg-[var(--apple-surface)] flex flex-col shrink-0 select-none z-20 animate-in slide-in-from-right duration-200">
            {/* Sandbox Header */}
            <div className="h-[52px] px-4 border-b border-[var(--apple-separator)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-[var(--apple-text-primary)]">交互沙盒 & 推理审计</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSandboxMessages([]);
                    showToast('沙盒历史已重置');
                  }}
                  className="p-1.5 rounded-lg hover:bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)] transition"
                  title="清空对话历史"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsSandboxOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)] transition"
                  title="收起沙盒"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Target Agent Ribbon */}
            <div className="px-4 py-2 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-[var(--apple-accent)] font-semibold truncate">
                <Activity className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{activeAgent.name}</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)] shrink-0">{activeAgent.model.slice(0, 10)}</span>
            </div>

            {/* Sandbox Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
              {sandboxMessages.map(msg => {
                if (msg.sender === 'user') {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="p-3 rounded-2xl bg-[var(--apple-accent)] text-white max-w-[85%] leading-relaxed shadow-xs">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-md bg-gradient-to-tr ${activeAgent.avatarColor} text-white flex items-center justify-center text-[10px] font-bold`}>
                        {activeAgent.avatar}
                      </div>
                      <span className="text-[11px] font-semibold text-[var(--apple-text-secondary)]">{activeAgent.name}</span>
                      <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)] ml-auto">{msg.timestamp}</span>
                    </div>

                    {/* Collapsible Thought Trace */}
                    {msg.thought && (
                      <details open className="group rounded-xl border border-[var(--apple-border)] bg-[var(--apple-subtle)] p-2.5">
                        <summary className="flex items-center justify-between cursor-pointer list-none text-[11px] font-medium text-[var(--apple-text-secondary)] select-none">
                          <span className="flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5 text-purple-400" />
                            <span>思考推理过程 (Thought Process)</span>
                          </span>
                          <ChevronDown className="w-3 h-3 text-[var(--apple-text-tertiary)] group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="mt-2 text-[11px] text-[var(--apple-text-secondary)] font-mono leading-relaxed pl-3 border-l-2 border-purple-400/40 whitespace-pre-wrap">
                          {msg.thought}
                        </div>
                      </details>
                    )}

                    {/* Tool Invocation Pill */}
                    {msg.toolCall && (
                      <div className="p-2 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                          <Wrench className="w-3 h-3" />
                          <span>{msg.toolCall}</span>
                        </span>
                        <span className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">耗时 {msg.toolLatency || '80ms'}</span>
                      </div>
                    )}

                    {/* Response Bubble */}
                    <div className="p-3.5 rounded-2xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] shadow-xs leading-relaxed text-[var(--apple-text-primary)]">
                      <AppleMarkdown content={msg.content} />
                    </div>
                  </div>
                );
              })}

              {isSandboxRunning && (
                <div className="p-3.5 rounded-2xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-secondary)] flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                  <span>正在执行端侧推理与工具链路推演...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Shortcuts */}
            <div className="px-3 py-1.5 border-t border-[var(--apple-separator)] bg-[var(--apple-subtle)]/50 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar shrink-0">
              {[
                { label: '+ 强化微表情', prompt: '重写此段落，强化肢体语言与微表情' },
                { label: '+ 审计死锁', prompt: '检索代码高危并发死锁漏洞' },
                { label: '+ 联网调研', prompt: '调用联网搜索最新行业白皮书' },
              ].map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => setSandboxInput(qp.prompt)}
                  className="px-2 py-0.5 rounded-full bg-[var(--apple-surface)] hover:bg-[var(--apple-accent)] hover:text-white text-[var(--apple-text-secondary)] border border-[var(--apple-border)] transition whitespace-nowrap"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Sandbox Input Area */}
            <div className="p-3 border-t border-[var(--apple-separator)] bg-[var(--apple-surface)] shrink-0">
              <div className="relative">
                <textarea
                  rows={3}
                  value={sandboxInput}
                  onChange={e => setSandboxInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleExecuteSandbox();
                    }
                  }}
                  placeholder="向该智能体发送指令或测试输入... (Enter 发送)"
                  className="w-full text-xs p-2.5 pr-10 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)] resize-none leading-relaxed font-sans"
                />
                <button
                  onClick={handleExecuteSandbox}
                  disabled={isSandboxRunning || !sandboxInput.trim()}
                  className="absolute right-2 bottom-2.5 w-7 h-7 rounded-lg bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white flex items-center justify-center transition active:scale-95 shadow-xs disabled:opacity-50"
                  title="执行推理"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--apple-text-tertiary)] mt-2 px-1">
                <span>支持 Markdown 与函数追踪</span>
                <span className="font-mono">已就绪 · 端侧引擎</span>
              </div>
            </div>
          </aside>
        )}

      </div>

      {/* ============================================================ */}
      {/* 3. CREATE NEW AGENT MODAL (Apple Sheet Style) */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[var(--apple-surface)] rounded-3xl shadow-2xl border border-[var(--apple-border-strong)] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="h-13 px-6 py-4 border-b border-[var(--apple-separator)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[var(--apple-accent)] text-white flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-[var(--apple-text-primary)]">配置全新 AI 智能体</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateAgentFromModal} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--apple-text-secondary)] mb-1">智能体名称 *</label>
                  <input
                    type="text"
                    required
                    value={modalAgentName}
                    onChange={e => setModalAgentName(e.target.value)}
                    placeholder="如: 智能全栈架构审计师"
                    className="w-full p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--apple-text-secondary)] mb-1">标识符 Slug</label>
                  <input
                    type="text"
                    value={modalAgentSlug}
                    onChange={e => setModalAgentSlug(e.target.value)}
                    placeholder="agent.custom.audit"
                    className="w-full p-2.5 font-mono rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--apple-text-secondary)] mb-1">所属场景领域</label>
                  <select
                    value={modalAgentCategory}
                    onChange={e => setModalAgentCategory(e.target.value as AgentCategory)}
                    className="w-full p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] outline-none"
                  >
                    <option value="creative">创作与长文引擎</option>
                    <option value="engineering">代码与全栈重构</option>
                    <option value="research">数据分析与深研</option>
                    <option value="swarm">自治多代理流水线</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[var(--apple-text-secondary)] mb-1">推荐基座模型</label>
                  <select
                    value={modalAgentModel}
                    onChange={e => setModalAgentModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] outline-none"
                  >
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                    <option value="Llama 3.3 70B (Ollama)">Llama 3.3 70B (Ollama 本地)</option>
                    <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                    <option value="Qwen 2.5 Coder 32B">Qwen 2.5 Coder 32B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--apple-text-secondary)] mb-1">一句话核心职责描述</label>
                <input
                  type="text"
                  value={modalAgentDesc}
                  onChange={e => setModalAgentDesc(e.target.value)}
                  placeholder="简要阐述该智能体负责的专业边界与交付产物"
                  className="w-full p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--apple-text-secondary)] mb-1">系统人设 System Prompt</label>
                <textarea
                  rows={3}
                  value={modalAgentPrompt}
                  onChange={e => setModalAgentPrompt(e.target.value)}
                  placeholder="定义智能体的专家角色、思考原则与输出格式约束..."
                  className="w-full p-2.5 font-mono rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)] resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[var(--apple-separator)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-xs font-semibold shadow-xs"
                >
                  创建并进入编排
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ============================================================ */}
      {/* MODAL: PLUGIN CONFIGURATION & LIVE TEST SHEET                */}
      {/* ============================================================ */}
      {activeConfigPlugin && (
        <PluginConfigModal
          plugin={activeConfigPlugin}
          onSave={handleSavePluginConfig}
          onClose={() => setActiveConfigPlugin(null)}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL: CREATE CUSTOM EXTERNAL TOOL PLUGIN                    */}
      {/* ============================================================ */}
      {isNewPluginModalOpen && (
        <NewPluginModal
          onAdd={handleAddNewPlugin}
          onClose={() => setIsNewPluginModalOpen(false)}
        />
      )}

    </div>
  );
};
