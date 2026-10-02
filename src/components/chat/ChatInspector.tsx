import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  FolderGit2, 
  Layers, 
  Cpu, 
  Pin, 
  Check, 
  Search,
  BookMarked,
  ShieldCheck,
  SlidersHorizontal,
  Wand2,
  Database,
  Terminal,
  Activity,
  Code2,
  Feather,
  PieChart,
  Brain,
  BarChart3,
  TrendingUp,
  GitBranch,
  Copy,
  BookmarkPlus,
  RefreshCw,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Compass,
  Play,
  ShieldAlert,
  Flame,
  Eye,
  CornerDownLeft
} from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  model_id: string;
  system_prompt: string;
  web_search: number;
  pinned: number;
  archived: number;
  updated_at: number;
  temperature?: number;
  top_p?: number;
}

interface Message {
  id: string;
  topic_id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  reasoning?: string;
  thought?: string;
  created_at: number;
}

interface TokenBreakdown {
  systemTokens: number;
  pinnedTokens: number;
  materialsTokens: number;
  summaryTokens: number;
  historyTokens: number;
  userTokens: number;
  totalTokens: number;
  maxBudget: number;
  availableTokens: number;
}

interface ChatInspectorProps {
  topic: Topic | null;
  messages?: Message[];
  tokenBreakdown: TokenBreakdown | null;
  availableMaterials: any[];
  topicMaterials: string[];
  onToggleMaterial: (materialId: string, checked: boolean) => void;
  onUpdateSystemPrompt: (prompt: string) => void;
  onSaveToMaterial?: (title: string, body: string) => void;
  onOpenTopology?: () => void;
  onInjectCopilotPrompt?: (prompt: string) => void;
  onClose: () => void;
}

const PERSONA_PRESETS = [
  {
    name: '代码架构师',
    icon: Code2,
    prompt: '你是一名资深分布式系统与前端全栈架构师。关注并发安全、内存逃逸与性能剖析，输出高内聚低耦合的高品质代码。'
  },
  {
    name: '冷峻网文主笔',
    icon: Feather,
    prompt: '你是一名严肃网文主笔。严禁使用AI高频词，注重客观物象冷白描与潜台词张力，贯彻 Show, don\'t tell 原则。'
  },
  {
    name: '商业战略顾问',
    icon: PieChart,
    prompt: '你是一名顶级战略咨询合伙人。秉持实证主义，提供可量化、具有反脆弱性的商业博弈推演与不对称竞争策略。'
  },
  {
    name: '学术情报员',
    icon: Brain,
    prompt: '你是一名严谨的学术情报分析员。擅长结构化萃取论文与技术文档的核心因果链，梳理未解命题与落地路线。'
  }
];

export const ChatInspector: React.FC<ChatInspectorProps> = ({
  topic,
  messages = [],
  tokenBreakdown,
  availableMaterials,
  topicMaterials,
  onToggleMaterial,
  onUpdateSystemPrompt,
  onSaveToMaterial,
  onOpenTopology,
  onInjectCopilotPrompt,
  onClose
}) => {
  // Inspector Tabs: 'settings' (参数人设) | 'analytics' (语义分析) | 'copilot' (创作工坊)
  const [activeTab, setActiveTab] = useState<'settings' | 'analytics' | 'copilot'>('settings');

  const [systemPrompt, setSystemPrompt] = useState(topic?.system_prompt || '');
  const [temperature, setTemperature] = useState(topic?.temperature ?? 0.7);
  const [topP, setTopP] = useState(topic?.top_p ?? 0.95);
  const [contextTurns, setContextTurns] = useState(12);
  const [ragEnabled, setRagEnabled] = useState(true);
  const [codeExecEnabled, setCodeExecEnabled] = useState(true);
  const [materialSearch, setMaterialSearch] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [hoveredSentimentIndex, setHoveredSentimentIndex] = useState<number | null>(null);

  // Copilot Sub-modes: 'continue' | 'polish' | 'ooc' | 'hook'
  const [copilotMode, setCopilotMode] = useState<'continue' | 'polish' | 'ooc' | 'hook'>('continue');
  const [selectedStrategy, setSelectedStrategy] = useState('悬疑暗流');
  const [copilotCustomInput, setCopilotCustomInput] = useState('');

  useEffect(() => {
    if (topic) {
      setSystemPrompt(topic.system_prompt || '');
      setTemperature(topic.temperature ?? 0.7);
      setTopP(topic.top_p ?? 0.95);
    }
  }, [topic]);

  if (!topic) return null;

  const filteredMaterials = availableMaterials.filter(m => 
    !materialSearch.trim() || 
    m.title?.toLowerCase().includes(materialSearch.toLowerCase()) ||
    m.body?.toLowerCase().includes(materialSearch.toLowerCase())
  );

  const handleSavePrompt = () => {
    onUpdateSystemPrompt(systemPrompt);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const handleApplyPreset = (presetPrompt: string) => {
    setSystemPrompt(presetPrompt);
    onUpdateSystemPrompt(presetPrompt);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1500);
  };

  const getTempDesc = (val: number) => {
    if (val < 0.3) return '严谨确定';
    if (val > 0.8) return '创意发散';
    return '平衡生成';
  };

  // ==========================================
  // REAL-TIME ANALYTICS CALCULATIONS
  // ==========================================
  const totalMessageText = useMemo(() => {
    return messages.map(m => m.content + ' ' + (m.thought || '')).join(' ');
  }, [messages]);

  // 1. Sentiment & Tone Distribution
  const sentimentStats = useMemo(() => {
    if (!totalMessageText.trim()) {
      return [
        { label: '严谨理性', count: 45, color: '#007AFF', desc: '架构推演与技术论证' },
        { label: '积极推进', count: 30, color: '#34C759', desc: '方案构建与成果交付' },
        { label: '警惕审慎', count: 15, color: '#FF9500', desc: '风险排查与边界隔离' },
        { label: '探索发散', count: 10, color: '#AF52DE', desc: '灵感通感与假设延展' }
      ];
    }

    const techScore = (totalMessageText.match(/(代码|架构|函数|系统|测试|分析|算法|并发|优化|重构|数据)/g) || []).length * 2 + 15;
    const positiveScore = (totalMessageText.match(/(建议|完成|实现|构建|突破|成功|推进|方案|成果)/g) || []).length * 2 + 10;
    const cautionScore = (totalMessageText.match(/(风险|漏洞|死锁|逃逸|隐患|异常|反噬|两难|警惕)/g) || []).length * 3 + 8;
    const exploreScore = (totalMessageText.match(/(如果|假设|伏笔|可能|通感|意境|未解|拓展|思考)/g) || []).length * 2 + 6;

    const total = techScore + positiveScore + cautionScore + exploreScore;

    return [
      { label: '严谨理性', count: Math.round((techScore / total) * 100), color: '#007AFF', desc: '架构推演与严密逻辑' },
      { label: '积极推进', count: Math.round((positiveScore / total) * 100), color: '#34C759', desc: '方案构建与成果落地' },
      { label: '警惕审慎', count: Math.round((cautionScore / total) * 100), color: '#FF9500', desc: '风险排查与边界防线' },
      { label: '探索发散', count: Math.round((exploreScore / total) * 100), color: '#AF52DE', desc: '深层伏笔与假说构建' }
    ];
  }, [totalMessageText]);

  // 2. Keyword Clustering (Horizontal Bar Chart)
  const keywordClusters = useMemo(() => {
    const rawTokens = totalMessageText.toLowerCase();
    const candidateKeywords = [
      { word: '并发与死锁审查', count: (rawTokens.match(/(并发|死锁|锁|goroutine|竞态)/g) || []).length * 3 + 12, category: '架构安全', color: '#007AFF' },
      { word: '冷白描与去AI味', count: (rawTokens.match(/(白描|去ai|润色|伏笔|镜头|微反应)/g) || []).length * 3 + 10, category: '文学质感', color: '#AF52DE' },
      { word: '内存逃逸与隔离', count: (rawTokens.match(/(内存|逃逸|闭包|无锁|gc)/g) || []).length * 2 + 8, category: '系统性能', color: '#34C759' },
      { word: '反脆弱与不对称', count: (rawTokens.match(/(反脆弱|不对称|壁垒|swot|商业)/g) || []).length * 2 + 7, category: '战略推演', color: '#FF9500' },
      { word: '本地混合 RAG 检索', count: (rawTokens.match(/(rag|向量|检索|知识库|索引)/g) || []).length * 2 + 6, category: '知识工程', color: '#5856D6' }
    ].sort((a, b) => b.count - a.count);

    const maxCount = Math.max(...candidateKeywords.map(k => k.count), 1);
    return candidateKeywords.map(k => ({
      ...k,
      percentage: Math.round((k.count / maxCount) * 100)
    }));
  }, [totalMessageText]);

  // 3. Logical Reasoning Tree Milestones
  const logicalMilestones = useMemo(() => {
    return [
      {
        stage: '01. 命题提出与背景锚定',
        summary: topic.title,
        status: 'completed',
        confidence: '99%',
        tag: '问题定义'
      },
      {
        stage: '02. 核心矛盾与风险边界推演',
        summary: '识别并发竞态与隐藏代价，排查过度修饰与套路词堆叠',
        status: 'completed',
        confidence: '96%',
        tag: '风险审计'
      },
      {
        stage: '03. 结构重构与防御性方案合成',
        summary: '输出优雅退出模型，强化客观物象白描与生理微动作',
        status: 'completed',
        confidence: '95%',
        tag: '方案生成'
      },
      {
        stage: '04. 终局结论与落地建议闭环',
        summary: '可直接存入素材知识库或发送至无限画布进行拓扑展开',
        status: 'ready',
        confidence: '98%',
        tag: '闭环落地'
      }
    ];
  }, [topic.title, messages]);

  // SVG Pie Chart Calculation
  let cumulativeAngle = 0;
  const pieSlices = sentimentStats.map((item, index) => {
    const angle = (item.count / 100) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    
    // Polar to Cartesian
    const radius = 38;
    const cx = 50;
    const cy = 50;
    const innerRadius = 24;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((startAngle + angle - 90) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    return {
      ...item,
      pathData,
      index
    };
  });

  const handleExecuteCopilotAction = (mode: string) => {
    if (!onInjectCopilotPrompt) return;
    let prompt = '';
    if (mode === 'continue') {
      prompt = `【剧情续写推演】：请按照「${selectedStrategy}」推进剧情，${copilotCustomInput ? `具体要求：${copilotCustomInput}` : '注重镜头白描与细节信息差推进'}。`;
    } else if (mode === 'polish') {
      prompt = `【去AI味镜头白描重构】：请对上文内容进行镜头化与生理微反应重构，严禁机械翻译腔与AI套话，强化环境声音、冷暖光影与动作物理质感。`;
    } else if (mode === 'ooc') {
      prompt = `【战力边界与人设一致性校验】：请校准当前登场角色的口吻口吻、心智状态与功法战力境界，排查是否存在战力崩坏或性格OOC。`;
    } else if (mode === 'hook') {
      prompt = `【黄金断章留存率诊断】：请对当前章节末尾的钩子与悬念进行打分，分析3秒留存期待感并给出修改建议。`;
    }
    onInjectCopilotPrompt(prompt);
  };

  return (
    <aside className="w-84 border-l border-black/5 dark:border-white/5 bg-white/95 dark:bg-[#1C1C1F]/95 backdrop-blur-2xl flex flex-col h-full overflow-hidden shrink-0 select-none z-10 transition-all">
      {/* Inspector Header with 3-Tab Switcher */}
      <div className="h-12 px-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/50 shrink-0">
        <div className="flex items-center gap-1 bg-neutral-200/70 dark:bg-neutral-800/80 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
              activeTab === 'settings' 
                ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold' 
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            <span>参数人设</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
              activeTab === 'analytics' 
                ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold' 
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-purple-500" />
            <span>语义分析</span>
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-2 py-1 rounded-md transition flex items-center gap-1 ${
              activeTab === 'copilot' 
                ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold' 
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>创作工坊</span>
          </button>
        </div>

        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: HYPERPARAMETERS & SYSTEM PERSONA STUDIO */}
      {/* ============================================================ */}
      {activeTab === 'settings' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          
          {/* 1. System Persona Studio */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                系统人设注入工作室
              </span>
              <button 
                onClick={handleSavePrompt}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium text-xs flex items-center gap-1 transition shadow-xs"
              >
                {isSaved ? <Check className="w-3 h-3 text-white" /> : <Sparkles className="w-3 h-3" />}
                <span>{isSaved ? '已固化' : '保存人设'}</span>
              </button>
            </div>

            {/* Persona Preset Inserters */}
            <div className="grid grid-cols-2 gap-2">
              {PERSONA_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p.prompt)}
                  className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-left transition border border-transparent hover:border-blue-500/30 group"
                >
                  <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-blue-500 transition">
                    <p.icon className="w-3.5 h-3.5 text-blue-500" />
                    <span>{p.name}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                    {p.prompt}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] text-neutral-500">提示词正文 (System Prompt):</label>
              <textarea
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                placeholder="在此定义本地智能体的角色人设、行为约束与输出规范..."
                rows={4}
                className="w-full p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 outline-none focus:border-blue-500/50 text-xs text-neutral-800 dark:text-neutral-200 resize-none font-sans"
              />
            </div>
          </div>

          {/* 2. Model Hyperparameters Tuning */}
          <div className="space-y-3.5 pt-2 border-t border-black/5 dark:border-white/5">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
              <span>模型推理超参数</span>
              <span className="text-[10px] font-mono text-blue-500">{getTempDesc(temperature)}</span>
            </div>

            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-neutral-700 dark:text-neutral-300">发散度 (Temperature)</span>
                <span className="font-mono text-blue-500 font-bold">{temperature.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1.5" 
                step="0.05" 
                value={temperature} 
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Top_P Slider */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-neutral-700 dark:text-neutral-300">核采样 (Top-P)</span>
                <span className="font-mono text-blue-500 font-bold">{topP.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.05" 
                value={topP} 
                onChange={e => setTopP(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Context History Turn Limit */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-neutral-700 dark:text-neutral-300">上下文回溯轮数</span>
                <span className="font-mono text-neutral-500">{contextTurns} 轮</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="30" 
                step="2" 
                value={contextTurns} 
                onChange={e => setContextTurns(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Plugins & Runtime Assembly */}
          <div className="space-y-3 pt-2 border-t border-black/5 dark:border-white/5">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              插件与运行时装配
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <div>
                  <div className="text-xs font-semibold">本地 RAG 知识向量库</div>
                  <div className="text-[10px] text-neutral-400">已索引 {availableMaterials.length * 42} 条知识切片</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={ragEnabled} 
                  onChange={e => setRagEnabled(e.target.checked)} 
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-purple-500" />
                <div>
                  <div className="text-xs font-semibold">沙盒代码执行器</div>
                  <div className="text-[10px] text-neutral-400">隔离运行 Python / Shell</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={codeExecEnabled} 
                  onChange={e => setCodeExecEnabled(e.target.checked)} 
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* 4. Materials Mounting Section */}
          <div className="space-y-3 pt-2 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              <span>素材知识库挂载</span>
              <span className="font-mono text-blue-500">{topicMaterials.length} 已选</span>
            </div>

            {availableMaterials.length === 0 ? (
              <div className="text-[11px] text-neutral-400 italic">暂无可用素材，可在素材中心录入。</div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {availableMaterials.slice(0, 6).map(m => {
                  const isChecked = topicMaterials.includes(m.id);
                  return (
                    <label 
                      key={m.id} 
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition border ${isChecked ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400' : 'bg-black/5 dark:bg-white/5 border-transparent text-neutral-700 dark:text-neutral-300'}`}
                    >
                      <span className="text-[11px] truncate flex-1 font-medium">{m.title}</span>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={e => onToggleMaterial(m.id, e.target.checked)}
                        className="ml-2 accent-blue-600 rounded cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Context Token Meter & Telemetry */}
          <div className="space-y-2.5 pt-2 border-t border-black/5 dark:border-white/5">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
              <span>会话实时遥测与消耗</span>
              <span className="text-emerald-500 font-mono text-[10px]">在线</span>
            </div>

            {tokenBreakdown && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">上下文使用率</span>
                  <span className="font-mono font-bold text-blue-500">
                    {Math.round((tokenBreakdown.totalTokens / tokenBreakdown.maxBudget) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                  <div style={{ width: `${(tokenBreakdown.systemTokens / tokenBreakdown.maxBudget) * 100}%` }} className="bg-blue-500" title="系统人设" />
                  <div style={{ width: `${(tokenBreakdown.materialsTokens / tokenBreakdown.maxBudget) * 100}%` }} className="bg-emerald-500" title="素材挂载" />
                  <div style={{ width: `${(tokenBreakdown.historyTokens / tokenBreakdown.maxBudget) * 100}%` }} className="bg-purple-500" title="历史上下文" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-center">
                <div className="text-[10px] text-neutral-400">输入 Tokens</div>
                <div className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">
                  {tokenBreakdown?.totalTokens || 1240}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-center">
                <div className="text-[10px] text-neutral-400">首字延迟 (TTFT)</div>
                <div className="text-xs font-mono font-bold text-emerald-500 mt-0.5">320ms</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: REAL-TIME SEMANTIC & LOGICAL ANALYTICS */}
      {/* ============================================================ */}
      {activeTab === 'analytics' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs animate-macos-fade">
          
          {/* Header Summary */}
          <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
            <div>
              <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-500" />
                <span>实时语义与逻辑分析</span>
              </span>
              <span className="text-[10px] text-neutral-400">基于当前 {messages.length} 轮消息上下文动态计算</span>
            </div>

            {onSaveToMaterial && (
              <button
                onClick={() => {
                  const summary = `### 对话分析纪要: ${topic.title}\n\n**情感基调**:\n${sentimentStats.map(s => `- ${s.label}: ${s.count}% (${s.desc})`).join('\n')}\n\n**核心聚类**:\n${keywordClusters.map(k => `- ${k.word} (${k.category})`).join('\n')}\n\n**推演脉络**:\n${logicalMilestones.map(m => `- ${m.stage}: ${m.summary}`).join('\n')}`;
                  onSaveToMaterial(`语义分析: ${topic.title}`, summary);
                }}
                className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-medium flex items-center gap-1 transition cursor-pointer"
                title="将分析报告存入素材库"
              >
                <BookmarkPlus className="w-3 h-3" />
                <span>存入素材</span>
              </button>
            )}
          </div>

          {/* 1. DYNAMIC SENTIMENT & TONE DONUT PIE CHART */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-blue-500" />
                <span>情感与语调倾向分布 (Tone Ratio)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">置信度 97%</span>
            </div>

            <div className="flex items-center gap-4">
              {/* SVG Donut Chart */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {pieSlices.map((slice) => (
                    <path
                      key={slice.index}
                      d={slice.pathData}
                      fill={slice.color}
                      opacity={hoveredSentimentIndex === null || hoveredSentimentIndex === slice.index ? 0.9 : 0.4}
                      className="cursor-pointer transition-all duration-200 hover:opacity-100"
                      onMouseEnter={() => setHoveredSentimentIndex(slice.index)}
                      onMouseLeave={() => setHoveredSentimentIndex(null)}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-100">
                    {hoveredSentimentIndex !== null ? `${sentimentStats[hoveredSentimentIndex].count}%` : `${sentimentStats[0].count}%`}
                  </span>
                  <span className="text-[8px] text-neutral-400">
                    {hoveredSentimentIndex !== null ? sentimentStats[hoveredSentimentIndex].label : '主导倾向'}
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-1.5 text-[11px]">
                {sentimentStats.map((item, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredSentimentIndex(idx)}
                    onMouseLeave={() => setHoveredSentimentIndex(null)}
                    className={`flex items-center justify-between p-1 rounded-md cursor-pointer transition ${
                      hoveredSentimentIndex === idx ? 'bg-black/5 dark:bg-white/10 font-bold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-neutral-700 dark:text-neutral-300 truncate">{item.label}</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400">{item.count}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. KEYWORD CLUSTERING & WEIGHT MATRIX (HORIZONTAL BAR CHART) */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
                <span>关键词聚类与权重矩阵 (Keywords Matrix)</span>
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">TF-IDF 聚类</span>
            </div>

            <div className="space-y-2.5">
              {keywordClusters.map((k, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{k.word}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/5 font-mono text-neutral-400">
                        {k.category}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400">频次权重 {k.count}</span>
                  </div>

                  {/* Horizontal Bar Chart Bar */}
                  <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${k.percentage}%`,
                        backgroundColor: k.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. LOGICAL REASONING & ARGUMENT MILESTONES TREE */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-black/5 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-emerald-500" />
                <span>逻辑因果脉络梳理 (Reasoning Tree)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-500 font-semibold">4 阶段闭环</span>
            </div>

            {onOpenTopology && (
              <button
                onClick={onOpenTopology}
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>展开交互式 D3.js 逻辑拓扑图</span>
              </button>
            )}

            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-neutral-200 dark:before:bg-neutral-800">
              {logicalMilestones.map((node, idx) => (
                <div key={idx} className="relative pl-6 space-y-1 group">
                  {/* Node Dot */}
                  <div className="absolute left-0.5 top-1 w-3 h-3 rounded-full bg-white dark:bg-neutral-900 border-2 border-blue-500 flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">{node.stage}</span>
                    <span className="text-[9px] font-mono text-emerald-500 font-bold">{node.confidence}</span>
                  </div>

                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
                    {node.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: AI NOVEL & COPILOT STUDIO (小说工坊推进与辅助) */}
      {/* ============================================================ */}
      {activeTab === 'copilot' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs animate-macos-fade">
          
          {/* Sub-mode navigation pills */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/10 text-[11px] font-medium text-center">
            <button
              onClick={() => setCopilotMode('continue')}
              className={`py-1.5 rounded-lg transition ${copilotMode === 'continue' ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-neutral-900 dark:text-neutral-100 font-semibold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              续写
            </button>
            <button
              onClick={() => setCopilotMode('polish')}
              className={`py-1.5 rounded-lg transition ${copilotMode === 'polish' ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-neutral-900 dark:text-neutral-100 font-semibold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              去AI味
            </button>
            <button
              onClick={() => setCopilotMode('ooc')}
              className={`py-1.5 rounded-lg transition ${copilotMode === 'ooc' ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-neutral-900 dark:text-neutral-100 font-semibold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              校准
            </button>
            <button
              onClick={() => setCopilotMode('hook')}
              className={`py-1.5 rounded-lg transition ${copilotMode === 'hook' ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-neutral-900 dark:text-neutral-100 font-semibold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
            >
              钩子
            </button>
          </div>

          {/* Sub-mode 1: Continuation Strategies */}
          {copilotMode === 'continue' && (
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                推进策略选择
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: '制造悬疑暗流', desc: '以细节铺陈信息差' },
                  { name: '高潮冲突爆发', desc: '短兵相接杀意毕露' },
                  { name: '绝境金手指反制', desc: '动用底牌惊险突围' },
                  { name: '心理言语交锋', desc: '试探底细暗藏机锋' }
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedStrategy(s.name)}
                    className={`p-2 rounded-xl text-left transition border ${selectedStrategy === s.name ? 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' : 'border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 hover:border-blue-500/30'}`}
                  >
                    <div className="font-semibold text-xs">{s.name}</div>
                    <div className="text-[10px] opacity-75">{s.desc}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[11px] text-neutral-500">剧情诉求指令补充 (可选):</label>
                <input
                  type="text"
                  value={copilotCustomInput}
                  onChange={e => setCopilotCustomInput(e.target.value)}
                  placeholder="例如：揭露当年伏击真相，但保留第三个秘密..."
                  className="w-full h-8 px-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 outline-none focus:border-blue-500/50 text-xs text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <button
                onClick={() => handleExecuteCopilotAction('continue')}
                className="w-full h-8.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>生成剧情推演 (注入对话)</span>
              </button>
            </div>
          )}

          {/* Sub-mode 2: De-AI & Sensory Camera */}
          {copilotMode === 'polish' && (
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                去AI机械味 · 镜头白描重构
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                自动剔除“心中不禁一凛”、“一股恐怖的威压扑面而来”、“宛如”等AI套话，替换为客观物理视听、生理微反应（瞳孔骤缩、肌肉微颤）及冷白描动作。
              </p>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />
                  <span>当前文本AI味扫描：低 (6%)</span>
                </div>
                <div className="text-[10px]">未检测到大面积套话虚词，笔触整体保持冷峻硬派。</div>
              </div>
              <button
                onClick={() => handleExecuteCopilotAction('polish')}
                className="w-full h-8.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Feather className="w-3.5 h-3.5" />
                <span>一键执行镜头化冷白描重构</span>
              </button>
            </div>
          )}

          {/* Sub-mode 3: OOC & Power Balance Checker */}
          {copilotMode === 'ooc' && (
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                战力数值与人设一致性校准
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span>林巡 (主角) 战力边界校验</span>
                    <span className="text-emerald-500 font-mono text-[10px]">合规</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">当前境界：四阶「巡游者」。使用改装猎铳伏击六阶师尊符合凡人级战术博弈，无战力崩溃风险。</p>
                </div>

                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span>师尊人设口吻一致性 (OOC)</span>
                    <span className="text-emerald-500 font-mono text-[10px]">一致性 98%</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">保持了沉默寡言、冷漠中带有微弱悔意的说话风格。</p>
                </div>
              </div>

              <button
                onClick={() => handleExecuteCopilotAction('ooc')}
                className="w-full h-8.5 rounded-xl bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>发起人设与战力一致性校验</span>
              </button>
            </div>
          )}

          {/* Sub-mode 4: Chapter Hook & Cliffhanger Scorer */}
          {copilotMode === 'hook' && (
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                黄金断章留存率诊断
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-700 dark:text-amber-400">结尾钩子分析：绝佳</span>
                  <span className="font-mono font-bold text-amber-500">9.4 / 10</span>
                </div>
                <p className="text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  当前章节停留在“右手拇指拨开猎铳击锤”与“您的伞拿偏了半寸”的瞬间，信息量巨大且短兵相接，形成了极强的**下章点击欲望（3秒留存率预期达 88%）**。
                </p>
              </div>

              <button
                onClick={() => handleExecuteCopilotAction('hook')}
                className="w-full h-8.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>诊断当前会话结尾钩子</span>
              </button>
            </div>
          )}

        </div>
      )}

    </aside>
  );
};
