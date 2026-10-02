import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Copy, 
  Check, 
  AlertTriangle, 
  Play, 
  RotateCcw, 
  Wand2, 
  BookOpen, 
  Clock, 
  Tag, 
  Sliders, 
  Flame, 
  CornerDownLeft, 
  ExternalLink, 
  Eye, 
  ArrowRight,
  Database,
  Activity,
  Zap,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Scissors,
  BarChart2
} from 'lucide-react';
import { 
  NovelProject, 
  NovelChapter, 
  NovelReviewItem, 
  NovelFact, 
  ReviewCategory, 
  LoreEntry 
} from './novel_types.ts';
import { ConflictResolutionModal } from './ConflictResolutionModal.tsx';

interface NovelInspectorProps {
  project: NovelProject;
  activeChapter: NovelChapter;
  onClose: () => void;
  onAcceptReview: (review: NovelReviewItem, customRewrite?: string) => void;
  onIgnoreReview: (reviewId: string) => void;
  onConfirmFact: (factId: string) => void;
  onConfirmAllFacts: () => void;
  onOverrideFact?: (factContent: string, review: NovelReviewItem) => void;
  onApplyCopilotPrompt: (prompt: string) => void;
  onReplaceSelectedText?: (text: string) => void;
  onAppendTextToChapter?: (text: string) => void;
}

export const NovelInspector: React.FC<NovelInspectorProps> = ({
  project,
  activeChapter,
  onClose,
  onAcceptReview,
  onIgnoreReview,
  onConfirmFact,
  onConfirmAllFacts,
  onOverrideFact,
  onApplyCopilotPrompt,
  onReplaceSelectedText,
  onAppendTextToChapter
}) => {
  const [activeTab, setActiveTab] = useState<'rhythm' | 'review' | 'facts' | 'scope' | 'copilot'>('review');
  const [selectedReviewCategory, setSelectedReviewCategory] = useState<ReviewCategory | 'all'>('all');
  const [copilotMode, setCopilotMode] = useState<'continue' | 'polish' | 'ooc' | 'hook'>('continue');
  const [copilotStrategy, setCopilotStrategy] = useState<'conflict' | 'clue' | 'sensory' | 'cliffhanger'>('conflict');
  const [copilotGeneratedText, setCopilotGeneratedText] = useState('');
  const [isCopilotGenerating, setIsCopilotGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRhythmDiagnosing, setIsRhythmDiagnosing] = useState(false);

  // Conflict Resolution Diff Wizard Modal state
  const [isConflictWizardOpen, setIsConflictWizardOpen] = useState(false);
  const [conflictWizardIndex, setConflictWizardIndex] = useState(0);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return project.reviews.filter(r => {
      if (selectedReviewCategory === 'all') return true;
      return r.category === selectedReviewCategory;
    });
  }, [project.reviews, selectedReviewCategory]);

  const openReviewsCount = project.reviews.filter(r => r.state === 'open').length;

  // Injection Scope Calculations
  const scopeItems = useMemo(() => {
    const alwaysOnLores = project.loreEntries.filter(l => l.alwaysOn);
    const matchedLores = project.loreEntries.filter(l => {
      if (l.alwaysOn) return false;
      const text = activeChapter.content || '';
      return l.keywords.some(k => text.includes(k)) || l.aliases.some(a => text.includes(a));
    });
    const activeCast = project.characters.filter(c => activeChapter.outline.cast.includes(c.name));
    const unresolvedPromises = project.facts.filter(f => f.kind === 'promise' && !f.resolved);

    return {
      alwaysOnLores,
      matchedLores,
      activeCast,
      unresolvedPromises,
      estimatedTokens: 2480 + (activeCast.length * 420) + (matchedLores.length * 350)
    };
  }, [project, activeChapter]);

  // -----------------------------------------------------------------------
  // RHYTHM & BEATS DIAGNOSTIC ENGINE
  // -----------------------------------------------------------------------
  const rhythmDiagnostics = useMemo(() => {
    const text = activeChapter.content || '';
    const totalWords = text.trim().length;
    const targetWords = activeChapter.outline.targetWords || 3500;
    const beats = activeChapter.outline.beats || [];

    // Analyze paragraphs and buildup/exposition length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const firstThreeParagraphsLength = paragraphs.slice(0, 3).reduce((acc, p) => acc + p.length, 0);
    const expositionRatio = totalWords > 0 ? Math.round((firstThreeParagraphsLength / totalWords) * 100) : 0;
    
    // Warning trigger condition: exposition ratio is over 35% or first 1200 words has no dialogue/conflict
    const isExpositionOverloaded = expositionRatio > 35 || firstThreeParagraphsLength > 1200;

    // Simulated paragraph beat mapping
    const beatDistribution = beats.map((b, idx) => {
      const expectedWords = b.targetWords || Math.round(targetWords / beats.length);
      const actualEstWords = Math.round(totalWords * (expectedWords / targetWords));
      const isSlow = idx === 0 && actualEstWords > expectedWords * 1.3;
      return {
        ...b,
        expectedWords,
        actualEstWords,
        isSlow
      };
    });

    return {
      totalWords,
      targetWords,
      progressPercent: Math.min(100, Math.round((totalWords / targetWords) * 100)),
      expositionRatio,
      isExpositionOverloaded,
      firstThreeParagraphsLength,
      beatDistribution,
      tensionCurve: [
        { label: '起·环境切入', tension: 25, words: '0~600字' },
        { label: '承·暗线接触', tension: 50, words: '600~1500字' },
        { label: '转·真罡冲突', tension: 88, words: '1500~2800字' },
        { label: '合·断章金钩', tension: 92, words: '2800~3500字' }
      ],
      warnings: isExpositionOverloaded ? [
        {
          id: 'warn_pacing_1',
          level: 'high' as const,
          location: '第 1~3 自然段 (正文前 1,280 字)',
          title: '铺垫与环境描写占比过高 (42%)',
          issue: '开篇冷凝船坞与旧神机油异味描写篇幅过长，核心人物动作碰撞推迟至 1,300 字之后，读者前三分钟弃读风险较高。',
          suggestion: '建议压缩第 2 段管道描写 500 字，在第 300 字提前触发转轮猎铳齿轮蜂鸣声，以动态声响打断静态铺陈。',
          compactRewrite: `暴雨倾盆。冷凝船坞的第三号排污管道发出令人牙酸的金属呻吟。\n\n林巡指节微动，转轮猎铳的切削感透过湿手套传来。还没等他看清前方的泊位暗哨，三点钟方向的防爆闸门突然爆发出一声剧烈刺耳的过载蜂鸣——杀手已经锁定了逆熵怀表的辐射波长！`
        }
      ] : []
    };
  }, [activeChapter]);

  // Copilot Generator Simulator
  const handleGenerateCopilot = () => {
    setIsCopilotGenerating(true);
    setCopilotGeneratedText('');

    setTimeout(() => {
      setIsCopilotGenerating(false);
      let res = '';
      if (copilotMode === 'continue') {
        res = `机械钟摆倒转的声音像是一根极细的钢针扎进耳膜。林巡没有迟疑，左脚尖在满是油污的地面猛地一拧，整个人在毫秒之间向左侧平移了半尺。\n\n几乎是同一瞬间，一道幽蓝色的真罡剑气擦着他的肩胛骨掠过，将后方的防爆钢壁直接切开一道光滑如镜的裂口。空气中弥漫开浓烈的臭氧与冷机油燃烧的恶臭。`;
      } else if (copilotMode === 'polish') {
        res = `冷雨撕裂了高压通风管的静谧。林巡指节下压，转轮猎铳的冰冷切削感透过湿透的手套传来。他没有多余的呼吸，三步之外，杀手的重装外骨骼齿轮正发出微弱的过载悲鸣。`;
      } else if (copilotMode === 'ooc') {
        res = `【战力与人物防线诊断报告】\n✓ 境界审查：四阶巡游者 vs 二阶铁骨帮死士，力量量级与神经反射完全合规，无跨阶逻辑矛盾。\n✓ 法则校验：太古逆熵道骨启动伴随局部 10 米绝对零度白霜，已严格遵守《灵子跃迁逆熵定律》。\n! 提示：转轮猎铳膛线已出现微热应力磨损，后续若再施展过载破甲弹将面临炸膛风险。`;
      } else if (copilotMode === 'hook') {
        res = `【黄金留存率断章评分：94分】\n★ 钩子类型：四阶高位神识跨空锁定 + 逆火怀表仅剩 1.5 秒时光回溯\n★ 读者痛点期待度：极高（生死悬殊与师门背叛真相交汇）\n★ 优化建议：将本章最后一句话断在“怀表齿轮卡在逆转半格的最后一寸”，制造读者强烈追读欲望。`;
      }
      setCopilotGeneratedText(res);
    }, 700);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-80 md:w-96 border-l border-[var(--apple-border)] bg-[var(--apple-surface)]/80 backdrop-blur-2xl flex flex-col shrink-0 select-none z-20">
      
      {/* ------------------------------------------------------------ */}
      {/* 1. TOP HEADER & TABS SWITCHER                                */}
      {/* ------------------------------------------------------------ */}
      <div className="p-3.5 border-b border-[var(--apple-separator)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-[var(--apple-text-primary)]">专业写作审查检查器</span>
        </div>
        
        <button 
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[var(--apple-subtle)] transition"
          title="关闭检查器"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Segmented Inspector Sub-Tabs */}
      <div className="p-2 border-b border-[var(--apple-separator)] bg-[var(--apple-subtle)]/40">
        <div className="grid grid-cols-5 p-0.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-medium text-center">
          
          {/* TAB 1: 节奏拍线 */}
          <button
            onClick={() => setActiveTab('rhythm')}
            className={`py-1.5 rounded-lg transition flex flex-col items-center gap-0.5 ${
              activeTab === 'rhythm' ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px]">节奏拍线</span>
          </button>

          {/* TAB 2: AI 审查 */}
          <button
            onClick={() => setActiveTab('review')}
            className={`py-1.5 rounded-lg transition flex flex-col items-center gap-0.5 relative ${
              activeTab === 'review' ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px]">AI审查</span>
            {openReviewsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-2" />
            )}
          </button>

          {/* TAB 3: 事实账本 */}
          <button
            onClick={() => setActiveTab('facts')}
            className={`py-1.5 rounded-lg transition flex flex-col items-center gap-0.5 ${
              activeTab === 'facts' ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px]">事实账本</span>
          </button>

          {/* TAB 4: 注入清单 */}
          <button
            onClick={() => setActiveTab('scope')}
            className={`py-1.5 rounded-lg transition flex flex-col items-center gap-0.5 ${
              activeTab === 'scope' ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px]">注入清单</span>
          </button>

          {/* TAB 5: AI 协同 */}
          <button
            onClick={() => setActiveTab('copilot')}
            className={`py-1.5 rounded-lg transition flex flex-col items-center gap-0.5 ${
              activeTab === 'copilot' ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-[10px]">AI协同</span>
          </button>

        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* 2. TAB CONTENT VIEWPORT                                       */}
      {/* ------------------------------------------------------------ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* ========================================================== */}
        {/* SUBTAB 1: RHYTHM & BEATS DIAGNOSTIC                       */}
        {/* ========================================================== */}
        {activeTab === 'rhythm' && (
          <div className="space-y-4">
            
            {/* Rhythm Dashboard Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">本章节奏拍线与张力诊断</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  rhythmDiagnostics.isExpositionOverloaded 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {rhythmDiagnostics.isExpositionOverloaded ? '⚠️ 铺垫拖沓预警' : '✓ 节奏分布紧凑'}
                </span>
              </div>

              {/* Progress and Exposition Metrics */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] font-mono mb-1 text-zinc-300">
                    <span>字数推进完成度</span>
                    <span className="font-bold text-white">{rhythmDiagnostics.totalWords} / {rhythmDiagnostics.targetWords} 字 ({rhythmDiagnostics.progressPercent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full transition-all duration-500" 
                      style={{ width: `${rhythmDiagnostics.progressPercent}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                  <div className="p-2 rounded-xl bg-black/30 border border-white/10 space-y-0.5">
                    <span className="text-zinc-400">前置铺垫占比</span>
                    <div className={`text-xs font-bold ${rhythmDiagnostics.isExpositionOverloaded ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {rhythmDiagnostics.expositionRatio}% (前{rhythmDiagnostics.firstThreeParagraphsLength}字)
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/30 border border-white/10 space-y-0.5">
                    <span className="text-zinc-400">核心冲突引爆点</span>
                    <div className="text-xs font-bold text-amber-300">
                      第 {rhythmDiagnostics.firstThreeParagraphsLength > 0 ? Math.round(rhythmDiagnostics.firstThreeParagraphsLength * 1.1) : 800} 字
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exposition Warning Box (If Overloaded) */}
            {rhythmDiagnostics.warnings.map(warn => (
              <div key={warn.id} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-white">{warn.title}</h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200">
                        {warn.location}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-200/80 leading-relaxed">
                      {warn.issue}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-zinc-300 space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Scissors className="w-3 h-3" />
                    <span>AI 节奏精简重构方案:</span>
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{warn.suggestion}</p>
                </div>

                {/* Compact rewrite suggestion */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>建议紧凑版改写片段:</span>
                    <button
                      onClick={() => {
                        if (onReplaceSelectedText) onReplaceSelectedText(warn.compactRewrite);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                    >
                      一键采纳替换铺垫 ➔
                    </button>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {warn.compactRewrite}
                  </div>
                </div>
              </div>
            ))}

            {/* Beats Sequence Progress */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center justify-between">
                <span>拍线序列推进进度 (Beats Pool)</span>
                <span className="text-[10px] font-mono text-zinc-400">{rhythmDiagnostics.beatDistribution.length} 拍</span>
              </div>

              <div className="space-y-2">
                {rhythmDiagnostics.beatDistribution.map((b, idx) => (
                  <div key={b.id || idx} className="p-3 rounded-xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--apple-text-primary)]">
                        Beat {b.seq}: {b.label}
                      </span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        b.tensionLevel === 'climax' ? 'bg-rose-500/20 text-rose-400' :
                        b.tensionLevel === 'rising' ? 'bg-amber-500/20 text-amber-400' :
                        b.tensionLevel === 'twist' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {b.tensionLevel.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--apple-text-secondary)] leading-relaxed">
                      {b.summary}
                    </p>

                    <div className="flex justify-between text-[10px] font-mono text-[var(--apple-text-tertiary)] pt-1 border-t border-[var(--apple-separator)]">
                      <span>预设字数: {b.expectedWords} 字</span>
                      <span className={b.isSlow ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {b.isSlow ? '⚠️ 铺陈过长' : '✓ 节拍适中'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotional Tension Curve */}
            <div className="p-3.5 rounded-2xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-2 text-xs">
              <span className="font-bold text-[var(--apple-text-primary)] block">情绪张力电波图</span>
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px]">
                {rhythmDiagnostics.tensionCurve.map((node, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-1">
                    <div className="font-bold text-amber-400">{node.tension} Pt</div>
                    <div className="text-[8px] text-zinc-400">{node.label}</div>
                    <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${node.tension}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* SUBTAB 2: AI REVIEW & AUDITING SYSTEM                     */}
        {/* ========================================================== */}
        {activeTab === 'review' && (
          <div className="space-y-4">
            
            {/* Launch Conflict Resolution Diff Wizard Banner */}
            {openReviewsCount > 0 && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-purple-500/15 to-transparent border border-rose-500/30 flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">检测到 {openReviewsCount} 处设定/因果冲突</h4>
                    <p className="text-[10px] text-zinc-300 mt-0.5">开启向导式交互 Diff 对比与决策</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setConflictWizardIndex(0);
                    setIsConflictWizardOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold shadow-md shadow-rose-500/20 transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>向导解决</span>
                </button>
              </div>
            )}

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
              {[
                { id: 'all' as const, label: '全部' },
                { id: 'consistency' as const, label: '设定防线' },
                { id: 'logic' as const, label: '因果伏笔' },
                { id: 'pacing' as const, label: '节奏' },
                { id: 'style' as const, label: '文风' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedReviewCategory(c.id)}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                    selectedReviewCategory === c.id
                      ? 'bg-[var(--apple-accent)] text-white font-bold'
                      : 'bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Review Cards List */}
            <div className="space-y-3">
              {filteredReviews.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                  <p>当前章节无未解决的逻辑与设定冲突</p>
                </div>
              ) : (
                filteredReviews.map((rev, idx) => (
                  <div 
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                        rev.severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                        rev.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {rev.severity} · {rev.category}
                      </span>

                      <span className="text-[10px] font-mono text-zinc-400">
                        {rev.state.toUpperCase()}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-black/30 border border-white/10 text-[11px] text-zinc-300 font-mono">
                      "{rev.quote}"
                    </div>

                    <p className="text-xs text-[var(--apple-text-secondary)] leading-relaxed">
                      {rev.issue}
                    </p>

                    {rev.rewrite && (
                      <div className="p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[11px] text-zinc-200">
                        <span className="text-[10px] font-bold text-emerald-400 block mb-1">建议改写:</span>
                        {rev.rewrite}
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          setConflictWizardIndex(idx);
                          setIsConflictWizardOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[var(--apple-subtle)] hover:bg-[var(--apple-border)] text-zinc-300 text-xs font-semibold flex items-center gap-1 border border-[var(--apple-border)]"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Diff向导</span>
                      </button>
                      <button
                        onClick={() => onIgnoreReview(rev.id)}
                        className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white text-xs"
                      >
                        忽略
                      </button>
                      <button
                        onClick={() => onAcceptReview(rev)}
                        className="px-3 py-1 rounded-lg bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-xs font-semibold"
                      >
                        采纳改写
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* SUBTAB 3: FACT LEDGER                                      */}
        {/* ========================================================== */}
        {activeTab === 'facts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--apple-text-primary)]">本章抽取原子事实账本</span>
              <button
                onClick={onConfirmAllFacts}
                className="text-xs text-blue-400 hover:underline font-semibold"
              >
                一键全部确认入库
              </button>
            </div>

            <div className="space-y-2.5">
              {project.facts.map(fact => (
                <div key={fact.id} className="p-3 rounded-xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-blue-400" />
                      <span>{fact.subject}</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)] uppercase">
                      {fact.kind}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--apple-text-secondary)] leading-relaxed">
                    {fact.content}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                    <span className={fact.confirmed ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {fact.confirmed ? '✓ 已确认入账本' : '○ 待作者确认'}
                    </span>
                    {!fact.confirmed && (
                      <button
                        onClick={() => onConfirmFact(fact.id)}
                        className="text-blue-400 hover:underline font-semibold"
                      >
                        确认入库
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUBTAB 4: INJECTION SCOPE MATRIX                          */}
        {/* ========================================================== */}
        {activeTab === 'scope' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-between">
              <span>动态提示词上下文估算</span>
              <b className="font-mono">{scopeItems.estimatedTokens.toLocaleString()} Tokens</b>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[var(--apple-text-primary)] block">必注底层法则 ({scopeItems.alwaysOnLores.length})</span>
              <div className="space-y-1.5">
                {scopeItems.alwaysOnLores.map(l => (
                  <div key={l.id} className="p-2 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] flex justify-between items-center">
                    <span className="font-bold text-zinc-200">{l.name}</span>
                    <span className="text-[9px] font-mono text-emerald-400">强制前排注入</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[var(--apple-text-primary)] block">正文扫描匹配条目 ({scopeItems.matchedLores.length})</span>
              <div className="space-y-1.5">
                {scopeItems.matchedLores.map(l => (
                  <div key={l.id} className="p-2 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] flex justify-between items-center">
                    <span className="text-zinc-300">{l.name}</span>
                    <span className="text-[9px] font-mono text-blue-400">关键词命中</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SUBTAB 5: AI COPILOT CREATION ASSISTANT                   */}
        {/* ========================================================== */}
        {activeTab === 'copilot' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'continue' as const, label: '依据章纲续写', desc: '推进下一个 Beat' },
                { id: 'polish' as const, label: '文风精密润色', desc: '提升画面感' },
                { id: 'ooc' as const, label: '战力越界自检', desc: '战力与法则审查' },
                { id: 'hook' as const, label: '断章黄金钩子', desc: '提升读者留存' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setCopilotMode(m.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    copilotMode === m.id
                      ? 'bg-[var(--apple-accent)] text-white border-transparent'
                      : 'bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] border-[var(--apple-border)] hover:text-white'
                  }`}
                >
                  <div className="font-bold">{m.label}</div>
                  <div className="text-[10px] opacity-75">{m.desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateCopilot}
              disabled={isCopilotGenerating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isCopilotGenerating ? 'AI 正在推演战力与因果...' : '启动 AI 协同创作'}</span>
            </button>

            {copilotGeneratedText && (
              <div className="p-3.5 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-2.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>AI 推演生成产物:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyText(copilotGeneratedText)}
                      className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? '已复制' : '复制'}</span>
                    </button>
                    {onAppendTextToChapter && (
                      <button
                        onClick={() => onAppendTextToChapter(copilotGeneratedText)}
                        className="text-emerald-400 hover:underline font-mono text-[11px]"
                      >
                        追加至章节末尾 ➔
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--apple-subtle)] text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {copilotGeneratedText}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* MODAL: CONFLICT RESOLUTION DIFF COMPARATOR WIZARD           */}
      {/* ============================================================ */}
      {isConflictWizardOpen && (
        <ConflictResolutionModal
          reviews={project.reviews}
          facts={project.facts}
          initialReviewIndex={conflictWizardIndex}
          onClose={() => setIsConflictWizardOpen(false)}
          onAcceptReview={(rev, customRewrite) => {
            onAcceptReview(rev, customRewrite);
          }}
          onIgnoreReview={(revId) => {
            onIgnoreReview(revId);
          }}
          onOverrideFact={onOverrideFact}
        />
      )}

    </aside>
  );
};
