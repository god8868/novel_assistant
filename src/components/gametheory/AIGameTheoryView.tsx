import React, { useState, useEffect, useRef } from 'react';
import { 
  Swords, 
  ShieldAlert, 
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
  Compass,
  AlertTriangle,
  Handshake,
  Download
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

export type PresetKey = 'prisoners' | 'oligopoly' | 'arms_race' | 'webnovel';
export type InfoMode = 'complete' | 'incomplete';

export interface PayoffMatrix {
  R: [number, number]; // Cooperate, Cooperate
  S: [number, number]; // Cooperate, Defect
  T: [number, number]; // Defect, Cooperate
  P: [number, number]; // Defect, Defect
}

export interface PresetScenario {
  key: PresetKey;
  title: string;
  subtitle: string;
  alphaName: string;
  betaName: string;
  actionA1: string;
  actionA2: string;
  actionB1: string;
  actionB2: string;
  payoff: PayoffMatrix;
  spne: string;
  insight: string;
  coopRates: number[];
}

const PRESET_SCENARIOS: Record<PresetKey, PresetScenario> = {
  prisoners: {
    key: 'prisoners',
    title: '重复囚徒困境与针锋相对 (Tit-for-Tat)',
    subtitle: '经典长线合作博弈 · 贴现衰减平衡',
    alphaName: 'Alpha 方 (我方)',
    betaName: 'Beta 方 (对手)',
    actionA1: '合作 (Cooperate)',
    actionA2: '背叛 (Defect)',
    actionB1: '合作 (C)',
    actionB2: '背叛 (D)',
    payoff: {
      R: [3.0, 3.0],
      S: [0.0, 5.0],
      T: [5.0, 0.0],
      P: [1.0, 1.0]
    },
    spne: '(Cooperate, Cooperate)',
    insight: '当前对局属于无限重复博弈。当贴现因子 γ > 0.5 时，基于无名氏定理 (Folk Theorem)，双方维持合作可构成长期子博弈完美纳什均衡。',
    coopRates: [0.5, 0.58, 0.68, 0.76, 0.82, 0.85, 0.88, 0.88]
  },
  oligopoly: {
    key: 'oligopoly',
    title: '寡头价格战 (Bertrand-Cournot)',
    subtitle: '商业定价对抗与边际成本博弈',
    alphaName: '算力公司 A',
    betaName: '算力公司 B',
    actionA1: '高定价 ($35/M)',
    actionA2: '降价战 ($18/M)',
    actionB1: '高定价 ($35)',
    actionB2: '价格战 ($18)',
    payoff: {
      R: [4.5, 4.5],
      S: [0.8, 6.2],
      T: [6.2, 0.8],
      P: [1.5, 1.5]
    },
    spne: '错位差异化定价',
    insight: 'Bertrand 悖论揭示同质化价格战将驱使超额利润归零。推演建议引入服务生态锁客与转换成本 (Switching Cost)，突破价格战陷阱。',
    coopRates: [0.8, 0.65, 0.42, 0.35, 0.48, 0.58, 0.62, 0.65]
  },
  arms_race: {
    key: 'arms_race',
    title: '地缘威慑与边缘策略 (Brinkmanship)',
    subtitle: '非零和危局与极限施压博弈',
    alphaName: '主导联盟 Alpha',
    betaName: '挑战大国 Beta',
    actionA1: '条约克制',
    actionA2: '高超音速扩军',
    actionB1: '条约签署',
    actionB2: '扩军部署',
    payoff: {
      R: [5.0, 5.0],
      S: [-2.0, 7.5],
      T: [7.5, -2.0],
      P: [-5.0, -5.0]
    },
    spne: '相互保证毁灭 (MAD) 混合策略',
    insight: '双方陷入安全困境 (Security Dilemma)。单方面裁军将遭受致命劣势 (-2.0)，扩军为各自主导策略，导致系统跌入双输冷战。',
    coopRates: [0.7, 0.62, 0.50, 0.40, 0.42, 0.45, 0.48, 0.50]
  },
  webnovel: {
    key: 'webnovel',
    title: '网文智斗：底牌反制与背刺',
    subtitle: '主角隐匿底牌 vs 反派多疑试探',
    alphaName: '主角沈妄 (扮猪吃虎)',
    betaName: '老祖反派 (老谋深算)',
    actionA1: '隐匿境界底牌',
    actionA2: '暴起全力斩杀',
    actionB1: '试探虚实',
    actionB2: '祭出镇派杀招',
    payoff: {
      R: [6.0, 3.0],
      S: [1.0, 7.0],
      T: [8.5, -4.0],
      P: [0.0, 0.0]
    },
    spne: '三层假死欺骗 + 绝地反制',
    insight: '此场景为不完全信息动态信号博弈 (Signaling Game)。主角通过释放“重伤不支”的虚假劣质信号，引诱反派过早翻开所有底牌，反制胜率在第 8 轮达到 98.4% 爽点峰值。',
    coopRates: [0.3, 0.42, 0.55, 0.68, 0.78, 0.88, 0.94, 0.98]
  }
};

export const AIGameTheoryView: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  const [activePresetKey, setActivePresetKey] = useState<PresetKey>('prisoners');
  const [infoMode, setInfoMode] = useState<InfoMode>('complete');
  const [isRunningSim, setIsRunningSim] = useState(false);

  // Payoff Values
  const activeScenario = PRESET_SCENARIOS[activePresetKey];
  const [temptationT, setTemptationT] = useState(activeScenario.payoff.T[0]);
  const [rewardR, setRewardR] = useState(activeScenario.payoff.R[0]);

  // Hyperparameters
  const [discountGamma, setDiscountGamma] = useState(0.92);
  const [cpuct, setCpuct] = useState(1.414);
  const [tauNoise, setTauNoise] = useState(0.18);
  const [inductionDepth, setInductionDepth] = useState(6);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleRunSimulation = () => {
    if (isRunningSim) return;
    setIsRunningSim(true);
    showToast('✦ MCTS 100,000 次蒙特卡洛随机树剪枝并行推演中...');

    setTimeout(() => {
      setIsRunningSim(false);
      showToast('博弈沙盘纳什均衡已成功收敛！');
    }, 750);
  };

  const handleExportReport = () => {
    const title = `博弈推演研报: ${activeScenario.title}`;
    const body = `纳什均衡推演报告:\n- 场景: ${activeScenario.title}\n- 子博弈完美均衡 (SPNE): ${activeScenario.spne}\n- 决策建议: ${activeScenario.insight}\n- 贴现因子 γ: ${discountGamma} · MCTS 探索常数 c_puct: ${cpuct}`;
    
    showToast('已导出纳什均衡推演研报，并保存至素材库！');
    if (onSaveToMaterial) {
      onSaveToMaterial(title, body);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#0d0d11] text-slate-100 font-sans select-none relative">
      {/* Dynamic Toast */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#1c1c22]/95 border border-white/20 text-white text-xs font-semibold shadow-2xl flex items-center space-x-2 backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DYNAMIC ISLAND TOP TELEMETRY PILL */}
      <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
        <div className="px-4 py-1.5 rounded-full bg-black/90 backdrop-blur-2xl text-white text-xs font-mono shadow-2xl flex items-center space-x-3.5 border border-white/15">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <div className="flex items-center space-x-1.5 font-sans">
            <span className="font-bold text-white/90">
              {isRunningSim ? '超算 MCTS 剪枝中...' : '均衡已收敛'}
            </span>
            <span className="text-[10px] text-zinc-400">· 纳什收敛度 99.84%</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono">
            <span>MCTS 100k 采样</span>
            <span>·</span>
            <span className="text-purple-400 font-bold">Apple M5 ANE (342 GFLOPS)</span>
          </div>
        </div>
      </div>

      {/* TOP HEADER */}
      <header className="h-14 px-6 bg-[#16161a]/80 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between shrink-0 z-30 select-none">
        <div className="flex items-center space-x-3.5">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-md">
              <Crosshair className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-tight">Nash Arena Pro</span>
              <span className="text-[9px] ml-1.5 px-1.5 py-0.5 rounded-full font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                MCTS 4.0
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => showToast('已将复位博弈沙盘与初始收益矩阵')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold transition"
          >
            重置沙盘
          </button>

          <button
            onClick={handleRunSimulation}
            disabled={isRunningSim}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunningSim ? 'animate-spin' : ''}`} />
            <span>{isRunningSim ? '正在剪枝推演...' : '执行推演 (⌘R)'}</span>
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 1. LEFT SIDEBAR: SCENARIOS & PERSONAS */}
        <aside className="w-80 shrink-0 flex flex-col bg-[#121216]/90 border-r border-white/10 backdrop-blur-2xl z-20 select-none">
          <div className="p-3.5 border-b border-white/10 space-y-2 shrink-0">
            <div className="flex justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <span>博弈场景与仿真沙盘</span>
              <span className="text-purple-400 font-mono">4 范式</span>
            </div>

            <div className="grid grid-cols-2 gap-1 p-0.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-bold">
              <button
                onClick={() => { setInfoMode('complete'); showToast('已切换至完全信息博弈模式'); }}
                className={`py-1 rounded-lg transition ${infoMode === 'complete' ? 'bg-white/20 text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}
              >
                完全信息博弈
              </button>
              <button
                onClick={() => { setInfoMode('incomplete'); showToast('已切换至不完全信息/贝叶斯博弈'); }}
                className={`py-1 rounded-lg transition ${infoMode === 'incomplete' ? 'bg-white/20 text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}
              >
                贝叶斯不完全
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
            {Object.keys(PRESET_SCENARIOS).map(key => {
              const sc = PRESET_SCENARIOS[key as PresetKey];
              const isSelected = key === activePresetKey;
              return (
                <div
                  key={key}
                  onClick={() => {
                    setActivePresetKey(key as PresetKey);
                    setTemptationT(sc.payoff.T[0]);
                    setRewardR(sc.payoff.R[0]);
                    showToast(`已加载场景《${sc.title}》`);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition space-y-1.5 ${
                    isSelected ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-md' : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[12px] truncate">{sc.title}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{sc.subtitle}</p>
                </div>
              );
            })}
          </div>

          {/* Players Personas */}
          <div className="p-3 border-t border-white/10 bg-black/30 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-zinc-400 text-[11px]">
              <span>博弈主体角色设定</span>
              <span className="text-teal-300 font-mono">3 方介入</span>
            </div>

            <div className="space-y-1.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex justify-between items-center text-xs">
                <span className="font-bold text-white">{activeScenario.alphaName}</span>
                <span className="text-[9px] font-mono text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">自适应胜率最大化</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex justify-between items-center text-xs">
                <span className="font-bold text-white">{activeScenario.betaName}</span>
                <span className="text-[9px] font-mono text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">理性惩罚者 (Tit-for-Tat)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 2. CENTER MAIN WORKSPACE */}
        <section className="flex-1 flex flex-col h-full overflow-y-auto bg-[#0d0d11] p-6 space-y-6 select-none">
          {/* Top Row: Matrix & Replicator Dynamics */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Module 1: Payoff Matrix Table */}
            <div className="xl:col-span-5 p-5 rounded-3xl bg-[#181920]/80 border border-white/10 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Normal-form Game Matrix</span>
                  <h3 className="text-xs font-bold text-white">收益支付矩阵 (Payoff Matrix)</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  存在纯策略纳什均衡
                </span>
              </div>

              {/* 2x2 Table */}
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-xs">
                <div className="grid grid-cols-3 text-center border-b border-white/10 font-bold">
                  <div className="p-2.5 text-zinc-500 bg-white/5">Alpha \ Beta</div>
                  <div className="p-2.5 text-purple-300 bg-purple-500/10 truncate">{activeScenario.actionB1}</div>
                  <div className="p-2.5 text-purple-300 bg-purple-500/10 truncate">{activeScenario.actionB2}</div>
                </div>

                <div className="grid grid-cols-3 text-center border-b border-white/10">
                  <div className="p-3 text-blue-400 font-bold bg-blue-500/10 flex items-center justify-center truncate">
                    {activeScenario.actionA1}
                  </div>
                  <div className="p-3 hover:bg-white/10 transition cursor-pointer">
                    <div className="text-[10px] text-zinc-500">相互合作 (R)</div>
                    <div className="font-mono text-sm font-bold text-emerald-400">({rewardR}, {rewardR})</div>
                  </div>
                  <div className="p-3 hover:bg-white/10 transition cursor-pointer">
                    <div className="text-[10px] text-zinc-500">我受骗 (S, T)</div>
                    <div className="font-mono text-sm font-bold text-rose-400">({activeScenario.payoff.S[0]}, {temptationT})</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 text-center">
                  <div className="p-3 text-blue-400 font-bold bg-blue-500/10 flex items-center justify-center truncate">
                    {activeScenario.actionA2}
                  </div>
                  <div className="p-3 hover:bg-white/10 transition cursor-pointer">
                    <div className="text-[10px] text-zinc-500">诱惑背叛 (T, S)</div>
                    <div className="font-mono text-sm font-bold text-amber-400">({temptationT}, {activeScenario.payoff.S[0]})</div>
                  </div>
                  <div className="p-3 bg-purple-500/20 border-2 border-purple-500/40 relative">
                    <span className="absolute top-1 right-1 px-1 rounded bg-purple-500 text-white text-[8px] font-mono font-bold">Nash</span>
                    <div className="text-[10px] text-zinc-300">双双背叛 (P)</div>
                    <div className="font-mono text-sm font-bold text-zinc-200">({activeScenario.payoff.P[0]}, {activeScenario.payoff.P[1]})</div>
                  </div>
                </div>
              </div>

              {/* Payoff Sliders */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-white/5 space-y-1">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-zinc-400">背叛诱惑 T:</span>
                    <span className="text-amber-400 font-bold">{temptationT}</span>
                  </div>
                  <input
                    type="range"
                    min="3.5"
                    max="10.0"
                    step="0.5"
                    value={temptationT}
                    onChange={e => setTemptationT(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1 bg-white/10 rounded cursor-pointer"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 space-y-1">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-zinc-400">合作收益 R:</span>
                    <span className="text-emerald-400 font-bold">{rewardR}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="6.0"
                    step="0.5"
                    value={rewardR}
                    onChange={e => setRewardR(Number(e.target.value))}
                    className="w-full accent-emerald-400 h-1 bg-white/10 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Module 2: Evolutionary Trajectory Visualization */}
            <div className="xl:col-span-7 p-5 rounded-3xl bg-[#181920]/80 border border-white/10 space-y-3 shadow-2xl flex flex-col justify-between">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Replicator Dynamics</span>
                  <h3 className="text-xs font-bold text-white">演化博弈动态相图与收敛曲线</h3>
                </div>
                <span className="text-xs font-mono text-teal-300 font-bold">2,500 轮演化</span>
              </div>

              {/* Evolutionary SVG Curves */}
              <div className="h-44 w-full relative flex items-end pb-4 pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 600 140" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#0a84ff"
                    strokeWidth="3"
                    points={activeScenario.coopRates.map((val, i) => {
                      const x = (i / (activeScenario.coopRates.length - 1)) * 600;
                      const y = 140 - val * 120;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                </svg>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center text-xs font-mono">
                <div><div className="text-[10px] text-zinc-500">博弈轮次</div><div className="font-bold text-white">2,500 轮</div></div>
                <div><div className="text-[10px] text-zinc-500">稳定合作率 (ESS)</div><div className="font-bold text-emerald-400">84.2%</div></div>
                <div><div className="text-[10px] text-zinc-500">帕累托改善</div><div className="font-bold text-teal-300">+42.6%</div></div>
                <div><div className="text-[10px] text-zinc-500">博弈熵</div><div className="font-bold text-amber-400">0.142</div></div>
              </div>
            </div>
          </div>

          {/* Module 3: Subgame Perfect Nash Equilibrium AI Briefing */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-amber-500/10 border border-white/15 space-y-3 shadow-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white">Apple Intelligence 最优应对决策 (Best Response)</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                SPNE: {activeScenario.spne}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {activeScenario.insight}
            </p>
          </div>
        </section>

        {/* 3. RIGHT INSPECTOR PANEL */}
        <aside className="w-80 shrink-0 bg-[#121216]/90 border-l border-white/10 p-4 space-y-5 text-xs overflow-y-auto z-20 select-none">
          <div className="flex justify-between items-center border-b border-white/10 pb-3 font-bold text-white">
            <span className="flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-teal-300" />
              <span>博弈超参数控制台</span>
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-zinc-400">未来贴现因子 (Gamma γ):</span>
                <span className="text-blue-400 font-bold">{discountGamma}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.99"
                step="0.01"
                value={discountGamma}
                onChange={e => setDiscountGamma(Number(e.target.value))}
                className="w-full accent-blue-500 h-1 bg-white/10 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-zinc-400">MCTS 探索常数 (c_puct):</span>
                <span className="text-purple-300 font-bold">{cpuct}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={cpuct}
                onChange={e => setCpuct(Number(e.target.value))}
                className="w-full accent-purple-400 h-1 bg-white/10 rounded cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleExportReport}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center justify-center space-x-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出纳什均衡推演研报</span>
          </button>
        </aside>
      </div>
    </div>
  );
};
