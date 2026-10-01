import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[var(--apple-border-strong)] bg-[#18181b] dark:bg-[#121214] shadow-sm select-text text-left">
      {/* macOS Code Window Header */}
      <div className="h-8 px-3 bg-[#202024] dark:bg-[#18181b] border-b border-white/[0.06] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          {/* Mini Window Controls */}
          <div className="flex items-center gap-1.5 opacity-70">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider ml-1.5">
            {language || 'code'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded transition-colors"
          title="复制代码"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-[10px]">已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">复制</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-3.5 overflow-x-auto text-[11px] font-mono leading-relaxed text-zinc-200">
        <pre className="m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

// Formatter for inline styling: bold, inline code, italics
const formatInline = (text: string): React.ReactNode => {
  // Regex to split on `code` and **bold**
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code 
          key={i} 
          className="px-1.5 py-0.5 mx-0.5 text-[11px] font-mono rounded bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-accent)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold text-[var(--apple-text-primary)]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export const AppleMarkdown: React.FC<{ content: string; className?: string }> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split on code fences ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)(?:```|$)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      elements.push(renderTextBlocks(textBefore, `tb-${lastIndex}`));
    }
    const language = match[1] || 'text';
    const code = match[2];
    elements.push(
      <CodeBlock key={`code-${match.index}`} language={language} code={code} />
    );
    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    elements.push(renderTextBlocks(remainingText, `tb-${lastIndex}`));
  }

  return <div className={`space-y-2 select-text ${className}`}>{elements}</div>;
};

// Parse lines into headers, blockquotes, lists, paragraphs
function renderTextBlocks(raw: string, keyPrefix: string): React.ReactNode {
  const lines = raw.split('\n');
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];
  let isNumberedList = false;

  const flushList = (idx: number) => {
    if (listItems.length > 0) {
      if (isNumberedList) {
        nodes.push(
          <ol key={`ol-${keyPrefix}-${idx}`} className="list-decimal list-inside space-y-1 my-1.5 pl-1 text-left">
            {listItems.map((item, liIdx) => (
              <li key={liIdx} className="leading-relaxed">
                {formatInline(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        nodes.push(
          <ul key={`ul-${keyPrefix}-${idx}`} className="space-y-1 my-1.5 pl-1 text-left">
            {listItems.map((item, liIdx) => (
              <li key={liIdx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--apple-accent)] shrink-0 mt-1.5" />
                <span className="flex-1">{formatInline(item)}</span>
              </li>
            ))}
          </ul>
        );
      }
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check for bullet lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      isNumberedList = false;
      listItems.push(trimmed.slice(2));
      return;
    }

    // Check for numbered lists e.g. "1. "
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      isNumberedList = true;
      listItems.push(numMatch[2]);
      return;
    }

    flushList(idx);

    if (!trimmed) {
      return; // Skip empty lines for cleaner typography
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      nodes.push(
        <h4 key={`h3-${idx}`} className="text-xs font-bold text-[var(--apple-text-primary)] mt-3 mb-1 text-left">
          {formatInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      nodes.push(
        <h3 key={`h2-${idx}`} className="text-sm font-bold text-[var(--apple-text-primary)] mt-3.5 mb-1.5 text-left border-b border-[var(--apple-separator)] pb-1">
          {formatInline(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      nodes.push(
        <h2 key={`h1-${idx}`} className="text-base font-bold text-[var(--apple-text-primary)] mt-4 mb-2 text-left">
          {formatInline(trimmed.slice(2))}
        </h2>
      );
    } else if (trimmed.startsWith('> ')) {
      // Blockquote
      nodes.push(
        <div key={`quote-${idx}`} className="border-l-2 border-[var(--apple-accent)] pl-3 py-1 my-1.5 bg-[var(--apple-subtle)]/50 rounded-r-lg text-[var(--apple-text-secondary)] text-left italic">
          {formatInline(trimmed.slice(2))}
        </div>
      );
    } else {
      // Paragraph
      nodes.push(
        <p key={`p-${idx}`} className="leading-relaxed text-left">
          {formatInline(trimmed)}
        </p>
      );
    }
  });

  flushList(lines.length);

  return <div key={keyPrefix} className="space-y-1.5">{nodes}</div>;
}
