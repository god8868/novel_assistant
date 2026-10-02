import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Swords, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Brain, 
  Scale, 
  Trophy, 
  Activity, 
  BookmarkPlus, 
  Copy, 
  CheckCircle2, 
  ChevronRight, 
  Eye, 
  TrendingUp, 
  Layers, 
  Sliders, 
  Zap, 
  Lock, 
  Unlock, 
  HelpCircle,
  FileText,
  Radio,
  GitBranch,
  History,
  CornerUpLeft,
  MousePointer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Users,
  Settings2,
  Check,
  Flame,
  ShieldCheck,
  Target,
  Flag,
  Crosshair,
  AlertTriangle,
  Handshake,
  Download,
  ChevronDown,
  X,
  UserPlus
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

export type GameMode = 'matrix' | 'debate' | 'red_blue' | 'coalition';
export type ScenarioPresetKey = 'agi_align' | 'silicon_supply' | 'hft_squeeze' | 'carbon_quota' | 'trolley_ethics';

export interface GameScenario {
  key: ScenarioPresetKey;
  mode: GameMode;
  topic: string;
  leftTitle: string;
  rightTitle: string;
  payoffCC: [number, number];
  payoffCD: [number, number];
  payoffDC: [number, number];
  payoffDD: [number, number];
  insights: string;
}

const CURATED_SCENARIOS: Record<ScenarioPresetKey, GameScenario> = {
  agi_align: {
    key: 'agi_align',
    mode: 'debate',
    topic: 'AGI 超级对齐与安全围栏：递归自我改良下的人类最终否决权',
    leftTitle: '正方：开源协同与多方自愈抗体',
    rightTitle: '反方：封闭沙盒与强力硬件熔断',
    payoffCC: [4.5, 4.5],
    payoffCD: [1.2, 5.5],
    payoffDC: [5.5, 1.2],
    payoffDD: [2.0, 2.0],
    insights: '完全对齐策略在长期重复博弈中构成超演化稳定态（ESS）。利用多模态对齐监督可降低背离概率。'
  },
  silicon_supply: {
    key: 'silicon_supply',
    mode: 'coalition',
    topic: '全球半导体先进制程供应链同盟：Shapley 价值再分配与核心稳定性',
    leftTitle: '核心研发联盟 (Fabless)',
    rightTitle: '代工制造同盟 (Foundry)',
    payoffCC: [5.0, 5.0],
    payoffCD: [0.8, 6.5],
    payoffDC: [6.5, 0.8],
    payoffDD: [1.5, 1.5],
    insights: '研发与制造两方同盟的沙普利分配指数分别为 0.38 与 0.32。高贴现因子促使同盟处于最优分配核。'
  },
  hft_squeeze: {
    key: 'hft_squeeze',
    mode: 'matrix',
    topic: '高频量化金融流动性围剿：做市挂单深度 vs 零和滑点狙击',
    leftTitle: '做市流动性提供方 (MM)',
    rightTitle: '算法狙击套利方 (HFT)',
    payoffCC: [3.5, 3.5],
    payoffCD: [0.2, 5.8],
    payoffDC: [5.8, 0.2],
    payoffDD: [1.0, 1.0],
    insights: '做市方通过宽报价维持生存空间，狙击方利用滑点优势单边掠夺。长期博弈倾向于混和策略纳什均衡。'
  },
  carbon_quota: {
    key: 'carbon_quota',
    mode: 'matrix',
    topic: '碳排放权跨期配额博弈：清洁能源投资贴现 vs 购买罚单搭便车',
    leftTitle: '绿色减排先发方',
    rightTitle: '传统高碳渐进方',
    payoffCC: [4.0, 4.0],
    payoffCD: [0.5, 6.0],
    payoffDC: [6.0, 0.5],
    payoffDD: [1.8, 1.8],
    insights: '如果环保罚单处罚额度低于清洁投资折现率，传统高碳渐进方会具有搭便车占优动机。'
  },
  trolley_ethics: {
    key: 'trolley_ethics',
    mode: 'debate',
    topic: '自动驾驶极限电车难题道德委员会：边际功利主义 vs 严格义务论',
    leftTitle: '功利派：总体伤亡最小化',
    rightTitle: '道义派：不可剥夺优先权',
    payoffCC: [4.2, 4.2],
    payoffCD: [1.0, 5.2],
    payoffDC: [5.2, 1.0],
    payoffDD: [1.5, 1.5],
    insights: '边际功利与义务法学说处于长期认知博弈状态。安全合规审查需基于多目标决策边界完成折衷。'
  }
};

export interface AgentRosterItem {
  id: string;
  name: string;
  camp: 'left' | 'right' | 'neutral';
  model: string;
  points: number;
  strategy: string;
  avatarText?: string;
}

export const AIGameTheoryView: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  // Scenario, Mode, Topic States
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<ScenarioPresetKey>('agi_align');
  const [gameMode, setGameMode] = useState<GameMode>('matrix');
  const [topicText, setTopicText] = useState(CURATED_SCENARIOS.agi_align.topic);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  // Playback Control States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds] = useState(16);
  const [momentum, setMomentum] = useState(50); // 0 to 100

  // Fallacies Counters
  const [fallacies, setFallacies] = useState({ strawman: 1, slippery: 0, dilemma: 2 });

  // Custom Studio States
  const [customTopic, setCustomTopic] = useState('高维跨国主权数字货币清算体系：去中心化算法信任 vs 传统多边央行储备联盟');
  const [customLeftCamp, setCustomLeftCamp] = useState('自主清算技术共识派');
  const [customRightCamp, setCustomRightCamp] = useState('主权法定受控监管派');

  // Multi-Agent Seats
  const [agents, setAgents] = useState<AgentRosterItem[]>([
    { id: 'alpha', name: 'Agent Alpha (立论先锋)', camp: 'left', model: 'Claude 3.7 Sonnet', points: 120, strategy: 'Tit-for-Tat' },
    { id: 'beta', name: 'Agent Beta (逻辑破壁者)', camp: 'right', model: 'DeepSeek-R1', points: 115, strategy: 'Socratic Inquisitor' },
    { id: 'gamma', name: 'Agent Gamma (实证博弈家)', camp: 'left', model: 'GPT-5 Ultra', points: 105, strategy: 'Bayesian Prober' },
    { id: 'delta', name: 'Agent Delta (红队渗透者)', camp: 'right', model: 'Gemini 2.5 Pro', points: 110, strategy: 'Exploit Minimizer' }
  ]);

  // Telemetry Metrics
  const [telemetry, setTelemetry] = useState({
    bayes: 0.824,
    regret: 0.038,
    entropy: 1.42
  });

  // Hyperparameters
  const [kLevel, setKLevel] = useState(3);
  const [discountDelta, setDiscountDelta] = useState(0.92);
  const [noiseEpsilon, setNoiseEpsilon] = useState(0.04);
  const [logitLambda, setLogitLambda] = useState(4.50);
  const [bluffPercentage, setBluffPercentage] = useState(25);

  const [activeModal, setActiveModal] = useState<'add_agent' | 'studio' | null>(null);

  // New Agent Form
  const [newAgentName, setNewAgentName] = useState('Agent Epsilon');
  const [newAgentCamp, setNewAgentCamp] = useState<'left' | 'right' | 'neutral'>('left');
  const [newAgentModel, setNewAgentModel] = useState('Claude 3.7 Sonnet (Anthropic)');
  const [newAgentPersona, setNewAgentPersona] = useState('Tit-for-Tat');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const activeScenario = CURATED_SCENARIOS[selectedScenarioKey] || CURATED_SCENARIOS.agi_align;

  // Real-time calculation path for Bezier curves
  const phasePortraitPath = useMemo(() => {
    const startX = 10;
    const startY = 40;
    const endX = 20 + (currentRound / maxRounds) * 120;
    const endY = 40 - (momentum / 100) * 30;
    return `M ${startX} ${startY} Q 40 25, 70 30 T ${endX} ${endY}`;
  }, [currentRound, momentum, maxRounds]);

  const activePayoff = useMemo(() => {
    return {
      CC: activeScenario.payoffCC,
      CD: activeScenario.payoffCD,
      DC: activeScenario.payoffDC,
      DD: activeScenario.payoffDD
    };
  }, [activeScenario]);

  // Feed / History items
  const [feedLogs, setFeedGrid] = useState<Array<{ id: string; type: 'system' | 'agent' | 'gavel' | 'shock'; title?: string; text: string; agent?: AgentRosterItem; round?: number }>>([
    {
      id: 'welcome',
      type: 'system',
      text: '欢迎进入 Synapse AI 博弈与认知对抗实验室 Pro。系统已挂载经典纳什矩阵、议会辩论、红蓝对抗与多人联盟合作引擎。各智能体已完成递归认知展开。点击上方“开始演算”或“单步步进”启动认知交锋。'
    }
  ]);

  // Playback timers
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      const speed = isTurbo ? 400 : 2000;
      timer = setInterval(() => {
        handleStepTurn();
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isTurbo, currentRound, momentum]);

  // Trigger Exogenous Shock
  const handleInjectShock = () => {
    const shocks = [
      '【外生黑天鹅】突发国际监管条例更新：所有背叛行为的贴现惩罚翻倍，背叛收益强制扣减 40%！',
      '【极端流动性抽离】外部环境发生系统性扰动，双方信息信道延迟增加 300ms，失手噪声 ε 激增至 0.18！',
      '【零日漏洞穿透】第三方底层依赖库暴露高危反序列化缺陷，所有私有保留价格被公开发布至公共信道！'
    ];
    const text = shocks[Math.floor(Math.random() * shocks.length)];

    setFeedGrid(prev => [...prev, {
      id: `shock-${Date.now()}`,
      type: 'shock',
      text
    }]);

    setMomentum(prev => Math.min(85, Math.max(15, prev + (Math.random() * 20 - 10))));
    showToast('已成功注入外生黑天鹅冲击！');
  };

  // Step Turn Logic
  const handleStepTurn = () => {
    if (currentRound >= maxRounds) {
      setIsPlaying(false);
      triggerFinalVerdict();
      return;
    }

    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);

    const activeAgent = agents[(nextRound - 1) % agents.length];

    // Compute payoff momentum
    const drift = Math.random() * 12 - 6;
    let nextMom = momentum;
    if (activeAgent.camp === 'left') {
      nextMom = Math.min(90, Math.max(10, momentum + drift + 2.5));
    } else {
      nextMom = Math.min(90, Math.max(10, momentum + drift - 2.5));
    }
    setMomentum(nextMom);

    // Modify agents scoring
    setAgents(prev => prev.map(a => a.id === activeAgent.id ? { ...a, points: a.points + 5 } : a));

    // Dynamic random fallacies
    if (Math.random() > 0.7) {
      setFallacies(prev => ({
        ...prev,
        strawman: prev.strawman + 1
      }));
    }

    // Append feed turn card
    const turnArguments = [
      '依据复杂演化博弈公理：当贴现因子 δ > 0.85 时，利他合作策略在长序列博弈中构成严格演化稳定策略（ESS）。',
      '对手的归谬论证犯了经典“假两难选择”；未考虑到我们能够通过形式化智能合约引入去中心化仲裁保证金。',
      '我方重申：闭源集中监管必然导致不可逆的单点故障风险。开源抗体机制才能在黑天鹅事件中保障整个生态的反脆弱性。',
      '反方的实证数据存在样本选择偏差，完全忽略了零日漏洞在黑市信息不对称状态下的快速传染扩散效率。'
    ];
    const pickedArg = turnArguments[Math.floor(Math.random() * turnArguments.length)];

    setFeedGrid(prev => [...prev, {
      id: `turn-${nextRound}-${Date.now()}`,
      type: 'agent',
      round: nextRound,
      agent: activeAgent,
      text: pickedArg
    }]);

    // Update telemetry metrics randomly
    setTelemetry({
      bayes: parseFloat((0.75 + Math.random() * 0.20).toFixed(3)),
      regret: parseFloat((0.01 + Math.random() * 0.05).toFixed(3)),
      entropy: parseFloat((1.20 + Math.random() * 0.35).toFixed(2))
    });
  };

  // Human God-Mode Intervene
  const handleInjectIntervention = (val: string) => {
    if (!val.trim()) return;

    setFeedGrid(prev => [...prev, {
      id: `gavel-${Date.now()}`,
      type: 'gavel',
      text: val
    }]);

    showToast('人类法官席指令已分发至博弈总线！');
  };

  // Final Verdict Trigger
  const triggerFinalVerdict = () => {
    const winner = momentum >= 50 ? '正方 / 蓝方 / 合作阵营' : '反方 / 红方 / 竞争阵营';
    showToast('已达到最大博弈轮次，主审陪审团出具裁定白皮书');

    setFeedGrid(prev => [...prev, {
      id: `verdict-${Date.now()}`,
      type: 'gavel',
      text: `【终局裁定】历经 ${maxRounds} 轮高阶心智博弈，${winner} 在抵御外部黑天鹅扰动及维持跨期帕累托效率上建立了优势支配策略。`
    }]);
  };

  // Reset Arena
  const handleResetArena = () => {
    setIsPlaying(false);
    setCurrentRound(0);
    setMomentum(50);
    setFeedGrid([
      {
        id: 'reset',
        type: 'system',
        text: `推演环境已重置。议题：${topicText}。点击“开始演算”或“单步步进”开始新一轮认知对决。`
      }
    ]);
    setAgents(DEFAULT_MEMBERS.map((m, idx) => ({
      id: m.id,
      name: m.name,
      camp: m.color === 'rose' ? 'right' : 'left',
      model: m.model,
      points: 120 - idx * 5,
      strategy: m.stance
    })));
    showToast('博弈沙盒已复位！');
  };

  // Custom Studio
  const handleApplyCustomScenario = () => {
    setTopicText(customTopic);
    setActiveModal(null);
    handleResetArena();
    showToast('自定义博弈议题与目标函数已成功装配！');
  };

  // Add Agent Seat
  const handleConfirmAddAgent = () => {
    const newAg: AgentRosterItem = {
      id: `agent-${Date.now()}`,
      name: newAgentName,
      camp: newAgentCamp,
      model: newAgentModel,
      points: 100,
      strategy: newAgentPersona
    };
    setAgents(prev => [...prev, newAg]);
    setActiveModal(null);
    showToast(`已成功注入新席位 [${newAgentName}]`);
  };

  // Export Report
  const handleExportReport = () => {
    const title = `博弈推演研报: ${activeScenario.topic.slice(0, 15)}...`;
    const body = `纳什均衡及攻防演化报告:\n- 议题: ${topicText}\n- 正方立场: ${activeScenario.leftTitle}\n- 反方立场: ${activeScenario.rightTitle}\n- K-Level: Level ${kLevel}\n- 贴现率 δ: ${discountDelta}`;
    
    showToast('已导出纳什均衡推演研报，并保存至素材库！');
    if (onSaveToMaterial) {
      onSaveToMaterial(title, body);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#0a0c10] text-[#f5f5f7] font-apple select-none relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#1c1d22]/95 border border-white/20 text-xs font-semibold shadow-2xl flex items-center space-x-2 backdrop-blur-2xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DYNAMIC ISLAND TOP TELEMETRY PILL */}
      <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
        <div className="px-4 py-1.5 rounded-full bg-black/90 backdrop-blur-2xl text-white text-xs font-mono shadow-2xl flex items-center space-x-3.5 border border-white/15">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
          </span>
          <div className="flex items-center space-x-1.5 font-sans">
            <span className="font-bold text-white/90">纳什逼近: 99.2%</span>
            <span className="text-[10px] text-zinc-400">· 动态均衡已收敛</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono">
            <span>K-Level {kLevel}</span>
            <span>·</span>
            <span className="text-purple-400 font-bold">Recursive Decision</span>
          </div>
        </div>
      </div>

      {/* TOP SYSTEM MENU BAR */}
      <header className="h-11 px-4 flex items-center justify-between text-xs border-b border-white/10 bg-black/40 backdrop-blur-xl shrink-0">
        <div className="flex items-center space-x-3.5">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>

          <div className="flex items-center space-x-2 font-medium">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
              <Swords className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-[13px]">Synapse Arena Pro</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 opacity-70">v7.2 Quantum</span>
          </div>
        </div>

        {/* Center: Four Segmented Tactical Mode Pills */}
        <div className="flex items-center p-0.5 rounded-full bg-white/[0.08] border border-white/10 shadow-inner text-xs font-medium">
          {[
            { id: 'matrix', label: '博弈矩阵与均衡', color: 'bg-cyan-500' },
            { id: 'debate', label: '议会制辩论模式', color: 'bg-purple-500' },
            { id: 'red_blue', label: '红蓝攻防对抗', color: 'bg-rose-500' },
            { id: 'coalition', label: '多人联盟演化', color: 'bg-emerald-500' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => {
                setGameMode(m.id as GameMode);
                showToast(`已切换至【${m.label}】`);
              }}
              className={`px-3.5 py-1 rounded-full transition flex items-center space-x-1.5 ${
                gameMode === m.id ? 'bg-white/20 text-white shadow-sm font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${m.color}`} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsInspectorOpen(p => !p)}
            className="p-1.5 opacity-60 hover:opacity-100 hover:bg-white/10 rounded-xl transition"
          >
            <Sliders className="w-4 h-4 text-purple-400" />
          </button>
        </div>
      </header>

      {/* SCENARIO & PLAYBACK CONTROL STRIP */}
      <div className="px-6 py-2.5 border-b border-white/10 bg-black/30 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 z-20">
        <div className="flex items-center space-x-3 flex-1 min-w-[340px]">
          <span className="text-zinc-400 font-bold uppercase tracking-wider text-[11px] shrink-0">博弈议题:</span>
          <div className="relative flex-1 max-w-xl">
            <input 
              type="text" 
              value={topicText}
              onChange={e => setTopicText(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-black/20 border border-white/10 hover:border-white/20 font-medium text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <select
            value={selectedScenarioKey}
            onChange={e => {
              const k = e.target.value as ScenarioPresetKey;
              setSelectedScenarioKey(k);
              setTopicText(CURATED_SCENARIOS[k].topic);
              showToast(`已成功载入预设：${CURATED_SCENARIOS[k].topic.slice(0, 15)}...`);
            }}
            className="bg-[#1c1c24] border border-white/10 rounded-xl px-2 py-1 text-white text-xs cursor-pointer"
          >
            <option value="agi_align">1. AGI 超级对齐与安全围栏</option>
            <option value="silicon_supply">2. 全球半导体先进制程供应链同盟</option>
            <option value="hft_squeeze">3. 高频量化金融流动性围剿</option>
            <option value="carbon_quota">4. 碳排放权跨期配额博弈</option>
            <option value="trolley_ethics">5. 自动驾驶极限电车难题</option>
          </select>

          <button
            onClick={() => setActiveModal('studio')}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/15 rounded-xl transition flex items-center space-x-1"
          >
            <Settings2 className="w-3.5 h-3.5 text-blue-400" />
            <span>定制工作室</span>
          </button>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center p-1 rounded-2xl bg-black/25 border border-white/10">
            <button
              onClick={() => setIsPlaying(p => !p)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center space-x-1.5 transition active:scale-95 shadow-md"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? '暂停演算' : '开始演算'}</span>
            </button>

            <button
              onClick={handleStepTurn}
              className="px-3 py-1.5 rounded-xl hover:bg-white/10 font-medium flex items-center space-x-1 transition active:scale-95"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>单步步进</span>
            </button>

            <button
              onClick={() => setIsTurbo(t => !t)}
              className={`px-2.5 py-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-white/10 font-mono transition text-[11px] ${isTurbo ? 'text-blue-400 font-bold' : ''}`}
            >
              {isTurbo ? '10x 极速' : '1x 拟真'}
            </button>
          </div>

          <button
            onClick={handleInjectShock}
            className="px-3.5 py-1.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold transition flex items-center space-x-1.5 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>注入黑天鹅冲击</span>
          </button>

          <button onClick={handleResetArena} className="p-2 opacity-60 hover:opacity-100 hover:bg-white/10 rounded-2xl transition border border-white/5">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE TRI-SPLIT */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT COLUMN: AGENT ROSTER & STATUS */}
        <aside className="w-80 border-r border-white/10 bg-[#121216]/90 backdrop-blur-2xl flex flex-col shrink-0 select-none z-20">
          <div className="p-4 border-b border-white/10 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <span>阵营动量天平</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10">轮次: {currentRound} / {maxRounds}</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-cyan-400">{activeScenario.leftTitle.split('：')[0] || '正方/蓝队'}</span>
                <span className="text-rose-400">{activeScenario.rightTitle.split('：')[0] || '反方/红队'}</span>
              </div>

              {/* Progress dynamic bars */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex relative">
                <div style={{ width: `${momentum}%` }} className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500" />
                <div style={{ width: `${100 - momentum}%` }} className="h-full bg-gradient-to-l from-rose-600 to-amber-500 rounded-full transition-all duration-500" />
              </div>

              <div className="flex justify-between text-[11px] font-mono opacity-70">
                <span>影响力: {momentum.toFixed(1)}%</span>
                <span>影响力: {(100 - momentum).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Online seats */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 font-bold uppercase">参弈智能体席位</span>
              <button onClick={() => setActiveModal('add_agent')} className="text-blue-400 hover:underline text-[11px] flex items-center space-x-1">
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ 注入新智能体</span>
              </button>
            </div>

            <div className="space-y-2">
              {agents.map(ag => (
                <div key={ag.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                        {ag.avatarText}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{ag.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{ag.model}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-white">{ag.points}</span>
                      <span className="text-[9px] text-zinc-500 block">pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER MAIN BATTLEGROUND */}
        <main className="flex-1 flex flex-col relative h-full overflow-hidden">
          {/* Top Visual HUD Area */}
          <div className="p-4 border-b border-white/10 bg-[#121216]/80 backdrop-blur-xl shrink-0 z-20">
            {/* 1. MATRIX GRID */}
            {gameMode === 'matrix' && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>广义纳什均衡矩阵 (Payoff Tensor)</span>
                  </span>
                  <p className="text-[11px] text-zinc-400">标定值：(左阵营收益, 右阵营收益)。青色高亮为当期落入解空间。</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-2xl bg-[#1c1c24] border border-cyan-500/30 w-36 text-center">
                    <div className="text-[10px] text-zinc-500">α: 合作 | β: 合作</div>
                    <div className="text-sm font-bold text-emerald-400">({activePayoff.CC[0]}, {activePayoff.CC[1]})</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#1c1c24] border border-white/5 w-36 text-center">
                    <div className="text-[10px] text-zinc-500">α: 合作 | β: 背叛</div>
                    <div className="text-sm font-bold text-rose-400">({activePayoff.CD[0]}, {activePayoff.CD[1]})</div>
                  </div>
                </div>

                {/* SVG Phase Portrait */}
                <div className="w-48 h-24 rounded-2xl bg-black/40 border border-white/10 p-2 relative flex flex-col justify-between">
                  <span className="text-[9px] text-zinc-500 font-mono">收益相空间轨迹 (Phase Portrait)</span>
                  <svg className="w-full h-16" viewBox="0 0 160 50">
                    <path d={phasePortraitPath} fill="none" stroke="#2997ff" strokeWidth="2" />
                    <circle cx="130" cy="18" r="3.5" fill="#30d158" className="animate-pulse" />
                  </svg>
                </div>
              </div>
            )}

            {/* 2. DEBATE VIEW */}
            {gameMode === 'debate' && (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                    ⚖️
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">议会制辩论环节: <span className="text-purple-400 font-mono">环节三: 自由质询与归谬对攻</span></div>
                    <div className="text-[11px] text-zinc-400">仲裁法庭实时扫描：论证逻辑链破绽与形式化谬误。</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">稻草人谬误: {fallacies.strawman}</span>
                  <span className="px-2.5 py-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400">假两难困境: {fallacies.dilemma}</span>
                </div>
              </div>
            )}

            {/* 3. RED VS BLUE VIEW */}
            {gameMode === 'red_blue' && (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
                    🛡️
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">红蓝对抗攻防曲面: <span className="text-rose-400 font-mono">越狱注入 vs 深度沙盒记忆隔离</span></div>
                    <div className="text-[11px] text-zinc-400">攻击向量渗透度: 18.2% | 防御自愈收敛比: 81.8%</div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. COALITION GRAPH */}
            {gameMode === 'coalition' && (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    🌐
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">大联盟互信网络拓扑 (Grand Coalition Graph)</div>
                    <div className="text-[11px] text-zinc-400">动态边粗细代表协同亲密度；节点直径与 Shapley 权重成正比。</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Battle Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {feedLogs.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-3xl bg-[#16161c] border space-y-2.5 ${
                  item.type === 'shock' ? 'border-amber-500/40 bg-amber-500/[0.05]' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{item.agent?.name || '系统'}</span>
                    {item.round && <span className="text-[10px] text-zinc-400 font-mono">[#轮次 {item.round}]</span>}
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-zinc-300">“{item.text}”</p>
              </div>
            ))}
          </div>

          {/* Human Intervention Input Bar */}
          <div className="p-3.5 border-t border-white/10 bg-black/40 flex items-center space-x-3 shrink-0">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
              法
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="作为【人类主审裁决官 / God Mode】输入指令并按 Enter 派发干预决策..."
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleInjectIntervention(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full px-4 py-2 rounded-2xl bg-black/20 border border-white/10 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </main>

        {/* RIGHT INSPECTOR PANEL: HYPERPARAMETERS */}
        {isInspectorOpen && (
          <aside className="w-84 bg-[#121216]/95 border-l border-white/10 flex flex-col shrink-0 select-none z-20">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>博弈论与决策超参数</span>
              </span>
              <button onClick={() => setIsInspectorOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center font-bold">
                  <span>心智预判深度 (K-Level)</span>
                  <span className="font-mono text-cyan-400">Level {kLevel}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={kLevel}
                  onChange={e => setKLevel(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex justify-between items-center font-bold">
                  <span>跨期贴现因子 (Discount δ)</span>
                  <span className="font-mono text-purple-300">{discountDelta}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={discountDelta}
                  onChange={e => setDiscountDelta(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex justify-between items-center font-bold">
                  <span>颤抖之手扰动 (Noise ε)</span>
                  <span className="font-mono text-orange-400">{noiseEpsilon}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.20"
                  step="0.01"
                  value={noiseEpsilon}
                  onChange={e => setNoiseEpsilon(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex justify-between items-center font-bold">
                  <span>有限理性系数 (Logit λ)</span>
                  <span className="font-mono text-emerald-400">{logitLambda.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.25"
                  value={logitLambda}
                  onChange={e => setLogitLambda(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Cognitive Telemetry Box */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">认知遥测与反事实后悔 (CFR)</span>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span>贝叶斯后验 P(Coop|Hist):</span>
                    <span className="text-emerald-400">{telemetry.bayes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>累计后悔值 R+:</span>
                    <span className="text-amber-400">{telemetry.regret}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>策略香农熵 H(Strategy):</span>
                    <span className="text-cyan-400">{telemetry.entropy} bit</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 border-t border-white/10 bg-black/20">
              <button
                onClick={handleExportReport}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-md"
              >
                应用并导出博弈研报
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* STUDIO MODAL */}
      {activeModal === 'studio' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 text-xs animate-in fade-in">
          <div className="bg-[#181820] border border-white/20 w-full max-w-lg rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3 font-bold text-white text-sm">
              <span>高级博弈场景与自定义议题工作室</span>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">博弈论题背景与争议核心</label>
                <textarea value={customTopic} onChange={e => setCustomTopic(e.target.value)} rows={2} className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 resize-none font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">左翼 / 正方立场标签</label>
                  <input type="text" value={customLeftCamp} onChange={e => setCustomLeftCamp(e.target.value)} className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">右翼 / 反方立场标签</label>
                  <input type="text" value={customRightCamp} onChange={e => setCustomRightCamp(e.target.value)} className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
              <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 rounded-xl bg-white/10 text-white font-bold">取消</button>
              <button onClick={handleApplyCustomScenario} className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold">应用新场景</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD AGENT MODAL */}
      {activeModal === 'add_agent' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 text-xs animate-in fade-in">
          <div className="bg-[#181820] border border-white/20 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3 font-bold text-white text-sm">
              <span>注入新智能体博弈席位</span>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">席位代号与称谓</label>
                <input type="text" value={newAgentName} onChange={e => setNewAgentName(e.target.value)} className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">归属阵营</label>
                  <select value={newAgentCamp} onChange={e => setNewAgentCamp(e.target.value as any)} className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none">
                    <option value="left">左翼 / 正方立场</option>
                    <option value="right">右翼 / 反方立场</option>
                    <option value="neutral">中立仲裁员席位</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 font-bold block mb-1">博弈心理风格</label>
                  <select value={newAgentPersona} onChange={e => setNewAgentPersona(e.target.value)} className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none">
                    <option value="Tit-for-Tat">以牙还牙且宽容 (Tit-for-Tat)</option>
                    <option value="Grim Trigger">冷酷严厉触发 (Grim Trigger)</option>
                    <option value="Socratic Inquisitor">苏格拉底诘问者</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
              <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 rounded-xl bg-white/10 text-white font-bold">取消</button>
              <button onClick={handleConfirmAddAgent} className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold">确认就席</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DEFAULT_MEMBERS = [
  { id: 'alpha', name: 'Agent Alpha', model: 'Claude 3.7 Sonnet', stance: 'Tit-for-Tat', color: 'blue' },
  { id: 'beta', name: 'Agent Beta', model: 'DeepSeek-R1', stance: 'Socratic Inquisitor', color: 'rose' },
  { id: 'gamma', name: 'Agent Gamma', model: 'GPT-5 Ultra', stance: 'Bayesian Prober', color: 'emerald' },
  { id: 'delta', name: 'Agent Delta', model: 'Gemini 2.5 Pro', stance: 'Exploit Minimizer', color: 'purple' }
];
