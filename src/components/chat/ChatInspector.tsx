import React, { useState } from 'react';
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
  SlidersHorizontal
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
  tokenBreakdown: TokenBreakdown | null;
  availableMaterials: any[];
  topicMaterials: string[];
  onToggleMaterial: (materialId: string, checked: boolean) => void;
  onUpdateSystemPrompt: (prompt: string) => void;
  onClose: () => void;
}

export const ChatInspector: React.FC<ChatInspectorProps> = ({
  topic,
  tokenBreakdown,
  availableMaterials,
  topicMaterials,
  onToggleMaterial,
  onUpdateSystemPrompt,
  onClose
}) => {
  const [systemPrompt, setSystemPrompt] = useState(topic?.system_prompt || '');
  const [materialSearch, setMaterialSearch] = useState('');
  const [isSaved, setIsSaved] = useState(false);

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

  return (
    <aside className="w-72 border-l border-[var(--apple-border)] bg-[var(--apple-sidebar)]/80 backdrop-blur-xl flex flex-col h-full overflow-hidden shrink-0 select-none animate-in slide-in-from-right-2 duration-150 z-20">
      {/* Inspector Header */}
      <div className="h-[52px] px-3.5 border-b border-[var(--apple-separator)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--apple-accent)]" />
          <span className="text-xs font-semibold text-[var(--apple-text-primary)]">
            检查器与上下文配置
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-border)] transition-colors"
          title="关闭检查器"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inspector Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
        {/* 1. Context Token Meter */}
        {tokenBreakdown && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Token 上下文容量</span>
              </span>
              <span className="font-mono text-[11px] text-[var(--apple-accent)] font-semibold">
                {Math.round((tokenBreakdown.totalTokens / tokenBreakdown.maxBudget) * 100)}%
              </span>
            </div>

            {/* Apple Multi-color Segmented Progress Bar */}
            <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden flex shadow-inner">
              <div style={{ width: `${(tokenBreakdown.systemTokens / tokenBreakdown.maxBudget) * 100}%` }} className="bg-blue-500" title="系统提示词" />
              <div style={{ width: `${(tokenBreakdown.pinnedTokens / tokenBreakdown.maxBudget) * 100}%` }} className="bg-purple-500" title="钉住消息" />
              <div style={{ width: `${(tokenBreakdown.materialsTokens / tokenBreakdown.maxBudget) * 100}%` }} className="bg-emerald-500" title="挂载素材" />
              <div style={{ width: `${(tokenBreakdown.summaryTokens / tokenBreakdown.maxBudget) * 100}%` }} className="bg-amber-500" title="滚动纪要" />
              <div style={{ width: `${(tokenBreakdown.historyTokens / tokenBreakdown.maxBudget) * 100}%` }} className="bg-sky-400" title="历史上下文" />
            </div>

            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex items-center justify-between text-[var(--apple-text-secondary)]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />系统提示词</span>
                <span className="font-mono">{tokenBreakdown.systemTokens} t</span>
              </div>
              <div className="flex items-center justify-between text-[var(--apple-text-secondary)]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" />常驻钉住消息</span>
                <span className="font-mono">{tokenBreakdown.pinnedTokens} t</span>
              </div>
              <div className="flex items-center justify-between text-[var(--apple-text-secondary)]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />素材库注入</span>
                <span className="font-mono">{tokenBreakdown.materialsTokens} t</span>
              </div>
              <div className="flex items-center justify-between text-[var(--apple-text-secondary)]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />滚动阶段纪要</span>
                <span className="font-mono">{tokenBreakdown.summaryTokens} t</span>
              </div>
              <div className="flex items-center justify-between text-[var(--apple-text-secondary)]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-400" />对话历史流水</span>
                <span className="font-mono">{tokenBreakdown.historyTokens} t</span>
              </div>
            </div>
          </div>
        )}

        <div className="h-px bg-[var(--apple-separator)]" />

        {/* 2. System Prompt Customization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--apple-text-primary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>专有系统指令 (System)</span>
            </label>
            <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)]">
              {systemPrompt.length} 字
            </span>
          </div>

          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            rows={4}
            placeholder="为当前对话定制专属角色定位、格式规范或约束准则..."
            className="w-full bg-[var(--apple-surface)] border border-[var(--apple-border)] rounded-xl p-2.5 text-xs text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] focus:outline-none focus:border-[var(--apple-accent)] transition-all resize-none leading-relaxed"
          />

          <button
            onClick={handleSavePrompt}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[var(--apple-subtle)] hover:bg-[var(--apple-border)] border border-[var(--apple-border)] text-xs font-medium text-[var(--apple-text-primary)] transition-all"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">已应用到当前话题</span>
              </>
            ) : (
              <span>应用系统指令</span>
            )}
          </button>
        </div>

        <div className="h-px bg-[var(--apple-separator)]" />

        {/* 3. Materials Attachment */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--apple-text-primary)] flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
              <span>挂载素材知识库</span>
            </label>
            <span className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">
              {topicMaterials.length} 项已挂载
            </span>
          </div>

          {/* Quick Filter */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2 text-[var(--apple-text-tertiary)]" />
            <input
              type="text"
              value={materialSearch}
              onChange={e => setMaterialSearch(e.target.value)}
              placeholder="快速检索素材条目..."
              className="w-full pl-7 pr-2 py-1 bg-[var(--apple-surface)] border border-[var(--apple-border)] rounded-md text-[11px] text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] focus:outline-none focus:border-[var(--apple-accent)]"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 border border-[var(--apple-border)] rounded-xl p-1.5 bg-[var(--apple-surface)]/60">
            {filteredMaterials.length === 0 ? (
              <div className="py-4 text-center text-[11px] text-[var(--apple-text-tertiary)]">
                暂无相关素材数据
              </div>
            ) : (
              filteredMaterials.map(m => {
                const isChecked = topicMaterials.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => onToggleMaterial(m.id, !isChecked)}
                    className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked 
                        ? 'bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)]' 
                        : 'hover:bg-[var(--apple-subtle)] text-[var(--apple-text-primary)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent onClick
                      className="mt-0.5 rounded text-[var(--apple-accent)] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{m.title}</div>
                      <div className="text-[10px] text-[var(--apple-text-tertiary)] truncate mt-0.5">
                        {m.body?.slice(0, 40)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
