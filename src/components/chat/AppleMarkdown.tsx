import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Globe, BookOpen, Terminal, Sparkles, Code2 } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const lines = code.trim().split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-white/10 dark:border-white/10 bg-[#121215]/95 shadow-xl select-text text-left transition-all hover:border-white/20">
      {/* macOS Sequoia Code Window Header */}
      <div className="h-8 px-3.5 bg-[#18181D] border-b border-white/[0.08] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          {/* Mini Window Controls */}
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex items-center gap-1.5 ml-1.5">
            <Code2 className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-mono text-zinc-300 font-semibold uppercase tracking-wider">
              {language || 'code'}
            </span>
            <span className="text-[9px] font-mono text-zinc-500">
              ({lines.length} 行)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors"
            title="复制代码"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-[10px] font-medium">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="text-[10px]">复制代码</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="p-3.5 overflow-x-auto text-[11px] font-mono leading-relaxed text-zinc-200 bg-[#0E0E11]/90">
        <pre className="m-0 font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

// Rich Interactive Link with Frosted Glass Hover Preview Card
const RichLinkPreview: React.FC<{ url: string; label?: string }> = ({ url, label }) => {
  const [showPreview, setShowPreview] = useState(false);
  let domain = url;
  try {
    domain = new URL(url).hostname;
  } catch (_) {}

  return (
    <span className="relative inline-block" onMouseEnter={() => setShowPreview(true)} onMouseLeave={() => setShowPreview(false)}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-500/40 hover:decoration-blue-400 transition font-medium"
      >
        <Globe className="w-3 h-3 text-blue-400 shrink-0" />
        <span>{label || domain}</span>
        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
      </a>

      {showPreview && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-64 p-3 rounded-2xl bg-[#1c1c22]/95 backdrop-blur-2xl border border-white/20 shadow-2xl text-left text-xs space-y-2 pointer-events-auto animate-macos-fade">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-blue-400 truncate max-w-[150px]">{domain}</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              HTTPS 安全
            </span>
          </div>
          <div className="font-semibold text-white text-[11px] line-clamp-2">
            {label || domain}
          </div>
          <div className="text-[10px] text-zinc-400 font-mono truncate">
            {url}
          </div>
          <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
            <span className="text-zinc-500">点击新标签页打开</span>
            <span className="text-blue-400 flex items-center gap-0.5">访问链接 ↗</span>
          </div>
        </div>
      )}
    </span>
  );
};

// Rich Knowledge Citation Tag
const RichKnowledgeCitation: React.FC<{ title: string }> = ({ title }) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <span className="relative inline-block" onMouseEnter={() => setShowPreview(true)} onMouseLeave={() => setShowPreview(false)}>
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-medium cursor-help transition hover:bg-amber-500/25">
        <BookOpen className="w-3 h-3 text-amber-400 shrink-0" />
        <span>《{title}》</span>
      </span>

      {showPreview && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-72 p-3 rounded-2xl bg-[#1c1c22]/95 backdrop-blur-2xl border border-amber-500/30 shadow-2xl text-left text-xs space-y-2 pointer-events-none animate-macos-fade">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              本地 RAG 知识库切片
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
              相关度 96%
            </span>
          </div>
          <div className="font-bold text-white text-xs">
            《{title}》
          </div>
          <p className="text-[10px] text-zinc-300 leading-relaxed font-sans">
            该文献已挂载至当前工程的向量语义索引中，对话将严格以其权威条款与规范为第一准则。
          </p>
        </div>
      )}
    </span>
  );
};

// Formatter for inline styling: bold, inline code, links, italics, and knowledge references
const formatInline = (text: string): React.ReactNode => {
  // Regex to match markdown links: [text](url)
  // Inline code: `code`
  // Bold: **bold**
  // Book citation: 《title》
  // Plain URL: https://...
  const tokens = text.split(/(\[[^\]]+\]\(https?:\/\/[^\s\)]+\)|https?:\/\/[^\s\)]+|`[^`]+`|\*\*[^*]+\*\*|《[^》]+》)/g);

  return tokens.map((part, i) => {
    if (!part) return null;

    // Markdown Link [label](url)
    const mdLinkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)$/);
    if (mdLinkMatch) {
      return <RichLinkPreview key={i} label={mdLinkMatch[1]} url={mdLinkMatch[2]} />;
    }

    // Plain URL
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return <RichLinkPreview key={i} url={part} />;
    }

    // Knowledge book citation 《...》
    const bookMatch = part.match(/^《([^》]+)》$/);
    if (bookMatch) {
      return <RichKnowledgeCitation key={i} title={bookMatch[1]} />;
    }

    // Inline code
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code 
          key={i} 
          className="px-1.5 py-0.5 mx-0.5 text-[11px] font-mono rounded bg-white/10 dark:bg-white/10 border border-white/10 text-emerald-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold text
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
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
    const language = match[1] || 'plaintext';
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
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
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
        <h4 key={`h3-${idx}`} className="text-xs font-bold text-white mt-3 mb-1 text-left">
          {formatInline(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      nodes.push(
        <h3 key={`h2-${idx}`} className="text-sm font-bold text-white mt-3.5 mb-1.5 text-left border-b border-white/10 pb-1">
          {formatInline(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      nodes.push(
        <h2 key={`h1-${idx}`} className="text-base font-bold text-white mt-4 mb-2 text-left">
          {formatInline(trimmed.slice(2))}
        </h2>
      );
    } else if (trimmed.startsWith('> ')) {
      // Blockquote
      nodes.push(
        <div key={`quote-${idx}`} className="border-l-2 border-blue-500 pl-3 py-1 my-1.5 bg-blue-500/10 rounded-r-lg text-zinc-300 text-left italic">
          {formatInline(trimmed.slice(2))}
        </div>
      );
    } else {
      // Paragraph
      nodes.push(
        <p key={`p-${idx}`} className="leading-relaxed text-left text-zinc-200">
          {formatInline(trimmed)}
        </p>
      );
    }
  });

  flushList(lines.length);

  return <div key={keyPrefix} className="space-y-1.5">{nodes}</div>;
}
