import React, { useState } from 'react';
import { Eye, Copy, Check, ExternalLink, Calendar, Tag, FileText, Sparkles } from 'lucide-react';

export interface QuickLookData {
  title: string;
  categoryLabel?: string;
  categoryColor?: string;
  content: string;
  tags?: string[];
  updatedAt?: string;
  charCount?: number;
  sourceUrl?: string;
}

interface QuickLookPopoverProps {
  data: QuickLookData;
  position: { top: number; left: number };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const QuickLookPopover: React.FC<QuickLookPopoverProps> = ({
  data,
  position,
  onMouseEnter,
  onMouseLeave
}) => {
  const [copied, setCopied] = useState(false);

  // Clamping top so popover stays inside screen
  const popoverHeight = 360;
  const clampedTop = Math.max(70, Math.min(position.top - 20, window.innerHeight - popoverHeight - 20));
  const clampedLeft = Math.min(position.left + 10, window.innerWidth - 420);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(data.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: `${clampedTop}px`,
        left: `${clampedLeft}px`,
        width: '390px',
        zIndex: 9999
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="rounded-2xl border border-[var(--apple-border-strong)]/80 bg-[var(--apple-surface)]/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl shadow-[0_24px_50px_rgba(0,0,0,0.22),0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-text"
    >
      {/* macOS Quick Look Header */}
      <div className="h-9 px-3.5 border-b border-[var(--apple-separator)] bg-[var(--apple-subtle)]/40 flex items-center justify-between shrink-0 select-none">
        {/* macOS Window Controls Dots */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>

          <div className="flex items-center gap-1.5 pl-2 text-[11px] font-semibold text-[var(--apple-text-primary)] truncate max-w-[200px]">
            <Eye className="w-3 h-3 text-[var(--apple-accent)] shrink-0" />
            <span className="truncate">{data.title}</span>
          </div>
        </div>

        {/* Quick Look Keyboard Shortcut Badge */}
        <div className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[9px] font-mono text-[var(--apple-text-tertiary)] shadow-2xs">
            空格键 · Quick Look
          </kbd>
        </div>
      </div>

      {/* Meta Strip */}
      <div className="px-4 py-2 border-b border-[var(--apple-separator)] bg-[var(--apple-subtle)]/15 flex items-center justify-between text-[10px] font-mono text-[var(--apple-text-secondary)] select-none">
        <div className="flex items-center gap-2">
          {data.categoryLabel && (
            <span className="flex items-center gap-1 font-semibold">
              <span 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: data.categoryColor || 'var(--apple-accent)' }} 
              />
              <span>{data.categoryLabel}</span>
            </span>
          )}
          {data.updatedAt && (
            <>
              <span className="text-[var(--apple-text-tertiary)]">·</span>
              <span>{data.updatedAt}</span>
            </>
          )}
        </div>

        <div>
          <span>{data.charCount !== undefined ? `${data.charCount} 字` : `${data.content.length} 字`}</span>
        </div>
      </div>

      {/* Excerpt Body with Fade Bottom */}
      <div className="p-4 overflow-y-auto max-h-[220px] relative text-xs leading-relaxed text-[var(--apple-text-primary)] font-sans">
        <p className="whitespace-pre-wrap select-text opacity-95">
          {data.content}
        </p>
      </div>

      {/* Quick Look Footer */}
      <div className="p-2.5 px-3.5 border-t border-[var(--apple-separator)] bg-[var(--apple-subtle)]/30 flex items-center justify-between text-[10px] select-none">
        <div className="flex items-center gap-1.5 flex-wrap max-w-[240px] truncate">
          {data.tags && data.tags.length > 0 ? (
            data.tags.slice(0, 3).map(t => (
              <span key={t} className="px-1.5 py-0.5 rounded bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-secondary)] font-mono">
                #{t}
              </span>
            ))
          ) : (
            <span className="text-[var(--apple-text-tertiary)] font-mono">点击卡片在右侧编辑</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-colors flex items-center gap-1 text-[10px]"
            title="快速复制全文"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? '已复制' : '复制'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
