import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  RotateCcw, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Database, 
  Layers, 
  Edit3, 
  AlertCircle, 
  CheckCircle2, 
  Copy,
  SplitSquareVertical,
  Columns
} from 'lucide-react';
import { NovelReviewItem, NovelFact, NovelLoreEntry } from './novel_types.ts';

interface ConflictResolutionModalProps {
  reviews: NovelReviewItem[];
  facts: NovelFact[];
  initialReviewIndex?: number;
  onClose: () => void;
  onAcceptReview: (review: NovelReviewItem, customRewrite?: string) => void;
  onIgnoreReview: (reviewId: string) => void;
  onOverrideFact?: (factContent: string, review: NovelReviewItem) => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  reviews,
  facts,
  initialReviewIndex = 0,
  onClose,
  onAcceptReview,
  onIgnoreReview,
  onOverrideFact
}) => {
  // Filter active reviews with suggestions
  const activeReviews = reviews.filter(r => r.state === 'open' || r.rewrite);
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(initialReviewIndex, Math.max(0, activeReviews.length - 1))
  );
  const [diffViewMode, setDiffViewMode] = useState<'split' | 'unified'>('split');
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customText, setCustomText] = useState('');

  const currentReview = activeReviews[currentIndex];

  // Matched fact from facts ledger
  const matchedFact = currentReview?.ruleRefId
    ? facts.find(f => f.id === currentReview.ruleRefId)
    : facts.find(f => currentReview?.issue.includes(f.subject) || currentReview?.quote.includes(f.subject));

  const handleNext = () => {
    if (currentIndex < activeReviews.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsEditingCustom(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsEditingCustom(false);
    }
  };

  const handleApplyResolution = (type: 'accept' | 'override' | 'ignore') => {
    if (!currentReview) return;

    if (type === 'accept') {
      const textToApply = isEditingCustom && customText.trim() ? customText.trim() : (currentReview.rewrite || currentReview.suggestion);
      onAcceptReview(currentReview, textToApply);
    } else if (type === 'override') {
      if (onOverrideFact) {
        onOverrideFact(currentReview.quote, currentReview);
      }
      onIgnoreReview(currentReview.id);
    } else if (type === 'ignore') {
      onIgnoreReview(currentReview.id);
    }

    if (activeReviews.length <= 1) {
      onClose();
    } else {
      if (currentIndex >= activeReviews.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    }
  };

  if (!currentReview) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--apple-surface)] border border-[var(--apple-border-strong)] rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">所有冲突均已解决完毕</h3>
          <p className="text-xs text-zinc-400">当前章节正文与事实账本、世界观硬法则已达成 100% 因果闭环。</p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold"
          >
            完成并返回编辑器
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-4xl bg-[#18181D]/95 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Header Ribbon */}
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">因果与事实冲突解决向导 (Conflict Resolution Wizard)</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  currentReview.severity === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  currentReview.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {currentReview.severity} 级别冲突
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                实时对比正文与已入库事实账本，选择采纳 AI 修复方案、保留原稿或同步覆写事实。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-black/40 border border-white/10 text-xs">
              <button
                onClick={() => setDiffViewMode('split')}
                className={`p-1.5 rounded-lg transition ${diffViewMode === 'split' ? 'bg-white/20 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
                title="分栏左右对比 (Split Diff)"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDiffViewMode('unified')}
                className={`p-1.5 rounded-lg transition ${diffViewMode === 'unified' ? 'bg-white/20 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
                title="行内上下对比 (Unified Diff)"
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center gap-1 font-mono text-xs text-zinc-400 border-l border-white/10 pl-3">
              <span>冲突 {currentIndex + 1} / {activeReviews.length}</span>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= activeReviews.length - 1}
                className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Fact Ledger Conflict Violation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 via-purple-500/10 to-transparent border border-rose-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>冲突违背原因诊断: {currentReview.category.toUpperCase()}</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                锚点偏移量: {currentReview.startOffset} ~ {currentReview.endOffset}
              </span>
            </div>

            <p className="text-zinc-200 leading-relaxed text-xs">
              {currentReview.issue}
            </p>

            {matchedFact && (
              <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2 text-[11px] font-mono">
                <Database className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-blue-300 font-bold">对应底层事实账本记录: </span>
                  <span className="text-zinc-300">【{matchedFact.subject}】{matchedFact.content}</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Diff View */}
          {diffViewMode === 'split' ? (
            /* ======================================================== */
            /* SPLIT SIDE-BY-SIDE DIFF                                  */
            /* ======================================================== */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Left: Original Draft with Red Highlight */}
              <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
                    <span className="font-bold text-rose-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span>正文原稿片段 (Current Draft)</span>
                    </span>
                    <span className="text-[10px] font-mono text-rose-400/80">包含逻辑冲突</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-rose-500/30 text-rose-200 leading-relaxed font-sans whitespace-pre-wrap">
                    <span className="bg-rose-500/20 text-rose-200 px-1 py-0.5 rounded border border-rose-500/40 line-through">
                      {currentReview.quote}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-zinc-400">
                  若保留原稿，正文保持不变，系统将允许您一键同步修改事实账本。
                </div>
              </div>

              {/* Right: AI Proposed Rewrite with Emerald Highlight */}
              <div className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>AI 修复方案 (AI Proposed Revision)</span>
                    </span>
                    <button
                      onClick={() => {
                        setCustomText(currentReview.rewrite || currentReview.suggestion);
                        setIsEditingCustom(!isEditingCustom);
                      }}
                      className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEditingCustom ? '取消微调' : '微调改写'}</span>
                    </button>
                  </div>

                  {isEditingCustom ? (
                    <textarea
                      rows={4}
                      value={customText}
                      onChange={e => setCustomText(e.target.value)}
                      className="w-full p-3 bg-black/60 border border-emerald-500/40 rounded-xl text-xs text-white leading-relaxed font-sans outline-none focus:border-emerald-400"
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/30 text-emerald-200 leading-relaxed font-sans whitespace-pre-wrap">
                      <span className="bg-emerald-500/20 text-emerald-100 px-1 py-0.5 rounded border border-emerald-500/40 font-semibold">
                        {currentReview.rewrite || currentReview.suggestion}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 text-[10px] text-zinc-400">
                  采纳后将自动将正文替换为修复版本，并在事实总账中标记闭环。
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* UNIFIED INLINE DIFF                                      */
            /* ======================================================== */
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-white">行内对齐比对 (Unified Inline Diff)</span>
                <span className="text-[10px] text-zinc-400">红减绿增</span>
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-black/50 border border-white/10 leading-relaxed">
                <div className="p-2 rounded bg-rose-500/15 border-l-2 border-rose-500 text-rose-300">
                  <span className="text-rose-400 select-none">- </span>
                  <span className="line-through">{currentReview.quote}</span>
                </div>
                <div className="p-2 rounded bg-emerald-500/15 border-l-2 border-emerald-500 text-emerald-200 font-sans">
                  <span className="text-emerald-400 font-mono select-none">+ </span>
                  <span>{isEditingCustom ? customText : (currentReview.rewrite || currentReview.suggestion)}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Footer Ribbon */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/5 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => handleApplyResolution('ignore')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 font-semibold transition cursor-pointer"
            >
              保留原稿并忽略警告
            </button>

            <button
              onClick={() => handleApplyResolution('override')}
              className="px-3.5 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 font-semibold transition cursor-pointer flex items-center gap-1.5"
              title="保留原稿文本，并将事实账本中的冲突记录更新为原稿描述"
            >
              <Database className="w-3.5 h-3.5" />
              <span>保留原稿并覆写事实账本</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApplyResolution('accept')}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>采纳 AI 修复方案 (替换正文)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
