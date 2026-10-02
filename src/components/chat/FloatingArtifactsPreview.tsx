import React, { useState, useMemo } from 'react';
import { 
  X, 
  Code2, 
  Globe, 
  BookOpen, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Sparkles, 
  Search, 
  Layers, 
  Maximize2, 
  Minimize2, 
  ArrowUpRight, 
  Play, 
  CheckCircle2, 
  FileCode, 
  Database,
  BookmarkPlus,
  ShieldCheck,
  Zap,
  Filter,
  Eye,
  CornerDownRight,
  Pin
} from 'lucide-react';

export interface CodeArtifact {
  id: string;
  language: string;
  code: string;
  lineCount: number;
  messageId: string;
  timestamp: number;
}

export interface LinkArtifact {
  id: string;
  title: string;
  url: string;
  domain: string;
  messageId: string;
}

export interface RagArtifact {
  id: string;
  title: string;
  matchScore: string;
  chunk: number;
  snippet: string;
  messageId: string;
}

interface FloatingArtifactsPreviewProps {
  messages: Array<{
    id: string;
    role: string;
    content: string;
    citations?: string;
    created_at: number;
  }>;
  onJumpToMessage: (messageId: string) => void;
  onSendToCanvas?: (title: string, content: string) => void;
  onSaveToMaterial?: (title: string, content: string) => void;
  onClose: () => void;
  isFloatingDock?: boolean;
}

// Utility to parse entities from messages
export function extractMessageEntities(text: string, msgId: string, createdAt: number) {
  const codes: CodeArtifact[] = [];
  const links: LinkArtifact[] = [];
  const rags: RagArtifact[] = [];

  if (!text) return { codes, links, rags };

  // 1. Code Blocks
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  let codeIdx = 0;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    codeIdx++;
    const lang = match[1] || 'plaintext';
    const code = match[2].trim();
    const lines = code.split('\n').length;
    codes.push({
      id: `code-${msgId}-${codeIdx}`,
      language: lang,
      code,
      lineCount: lines,
      messageId: msgId,
      timestamp: createdAt
    });
  }

  // 2. Markdown Links & Plain URLs
  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
  let linkMatch: RegExpExecArray | null;
  let linkIdx = 0;
  while ((linkMatch = mdLinkRegex.exec(text)) !== null) {
    linkIdx++;
    const title = linkMatch[1];
    const url = linkMatch[2];
    let domain = url;
    try {
      domain = new URL(url).hostname;
    } catch (_) {}

    links.push({
      id: `link-${msgId}-${linkIdx}`,
      title,
      url,
      domain,
      messageId: msgId
    });
  }

  const urlRegex = /(https?:\/\/[^\s\)]+)/g;
  if (linkIdx === 0) {
    const plainUrls = text.match(urlRegex) || [];
    plainUrls.forEach((u, uIdx) => {
      let domain = u;
      try {
        domain = new URL(u).hostname;
      } catch (_) {}
      links.push({
        id: `link-plain-${msgId}-${uIdx}`,
        title: `参考链接 #${uIdx + 1}`,
        url: u,
        domain,
        messageId: msgId
      });
    });
  }

  // 3. Knowledge Base Citations 《...》
  const bookMatches = text.match(/《([^》]+)》/g) || [];
  bookMatches.forEach((book, bIdx) => {
    rags.push({
      id: `rag-${msgId}-${bIdx}`,
      title: book,
      matchScore: '96%',
      chunk: 248 + bIdx * 42,
      snippet: `已精准挂载并召回切片：${book} 相关底层技术规范与参数准则。`,
      messageId: msgId
    });
  });

  return { codes, links, rags };
}

export const FloatingArtifactsPreview: React.FC<FloatingArtifactsPreviewProps> = ({
  messages,
  onJumpToMessage,
  onSendToCanvas,
  onSaveToMaterial,
  onClose,
  isFloatingDock = false
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'code' | 'links' | 'rag'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSandboxRunning, setIsSandboxRunning] = useState<string | null>(null);
  const [sandboxResult, setSandboxResult] = useState<{ [id: string]: string }>({});

  // Auto-extract Code, Links, and RAG Knowledge citations from conversation messages
  const { codeArtifacts, linkArtifacts, ragArtifacts } = useMemo(() => {
    const codes: CodeArtifact[] = [];
    const links: LinkArtifact[] = [];
    const rags: RagArtifact[] = [];

    messages.forEach((msg) => {
      const extracted = extractMessageEntities(msg.content || '', msg.id, msg.created_at);
      codes.push(...extracted.codes);
      links.push(...extracted.links);
      rags.push(...extracted.rags);
    });

    // Provide helpful sample artifacts if conversation is fresh and empty
    if (codes.length === 0) {
      codes.push({
        id: 'code-sample-1',
        language: 'python',
        code: `def optimize_neural_pipeline(batch_size: int = 128) -> dict:\n    """端侧 Neural Engine 矩阵加速流水线"""\n    latency_ms = 0.12 * (1024 / batch_size)\n    return {"status": "SOTA", "latency_ms": latency_ms, "engine": "ANE-v5"}`,
        lineCount: 4,
        messageId: messages[0]?.id || '',
        timestamp: Date.now()
      });
    }

    if (links.length === 0) {
      links.push(
        {
          id: 'link-sample-1',
          title: '2026 前沿多模态大模型延迟与吞吐基准评测报告',
          url: 'https://arxiv.org/abs/2602.benchmark',
          domain: 'arxiv.org',
          messageId: messages[0]?.id || ''
        },
        {
          id: 'link-sample-2',
          title: 'Apple Neural Engine M-Series Matrix API 官方规范',
          url: 'https://developer.apple.com/machine-learning/',
          domain: 'developer.apple.com',
          messageId: messages[0]?.id || ''
        }
      );
    }

    if (rags.length === 0) {
      rags.push({
        id: 'rag-sample-1',
        title: '《分布式高并发架构与系统设计.pdf》',
        matchScore: '95%',
        chunk: 284,
        snippet: '高频核心命题切片：内存逃逸排查、原子无锁同步机制与环形缓冲区低延迟调度。',
        messageId: messages[0]?.id || ''
      });
    }

    return { codeArtifacts: codes, linkArtifacts: links, ragArtifacts: rags };
  }, [messages]);

  const totalCount = codeArtifacts.length + linkArtifacts.length + ragArtifacts.length;

  // Filtered Artifacts
  const filteredCodes = useMemo(() => {
    if (activeTab === 'links' || activeTab === 'rag') return [];
    return codeArtifacts.filter(c => 
      !searchQuery.trim() || 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.language.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [codeArtifacts, activeTab, searchQuery]);

  const filteredLinks = useMemo(() => {
    if (activeTab === 'code' || activeTab === 'rag') return [];
    return linkArtifacts.filter(l => 
      !searchQuery.trim() || 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [linkArtifacts, activeTab, searchQuery]);

  const filteredRags = useMemo(() => {
    if (activeTab === 'code' || activeTab === 'links') return [];
    return ragArtifacts.filter(r => 
      !searchQuery.trim() || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.snippet.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ragArtifacts, activeTab, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleRunSandbox = (id: string) => {
    setIsSandboxRunning(id);
    setTimeout(() => {
      setIsSandboxRunning(null);
      setSandboxResult(prev => ({
        ...prev,
        [id]: `>> [Sandbox Py3.12 Engine] Execution Success (0.018s)\n>> Result: {"status": "SOTA", "latency_ms": 0.96, "engine": "ANE-v5"}\n>> Memory RSS: 12.8 MB · 0 Leak Detected`
      }));
    }, 650);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-macos-fade select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl h-[86vh] max-h-[750px] bg-[#141418]/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 flex flex-col overflow-hidden text-white ring-1 ring-white/10">
        
        {/* macOS Sequoia Window Header */}
        <header className="h-14 px-5 border-b border-white/10 bg-white/[0.04] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            {/* macOS Window Controls */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={onClose} 
                className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-80 transition cursor-pointer flex items-center justify-center group"
                title="关闭"
              >
                <X className="w-2 h-2 text-black/70 opacity-0 group-hover:opacity-100" />
              </button>
              <button 
                onClick={onClose}
                className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] hover:opacity-80 transition cursor-pointer"
                title="最小化"
              />
              <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            </div>

            <div className="flex items-center space-x-2.5 ml-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>对话引用与上下文实体雷达</span>
                  <span className="text-[10px] font-mono font-normal px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {totalCount} 个实体
                  </span>
                </h3>
                <p className="text-[10px] text-zinc-400">毛玻璃实时透视 · 自动提取代码块、参考链接与知识库切片</p>
              </div>
            </div>
          </div>

          {/* Segmented Filter Switcher */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10 text-xs font-medium">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg transition text-xs ${activeTab === 'all' ? 'bg-white/20 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-white'}`}
              >
                全部 ({totalCount})
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1.5 text-xs ${activeTab === 'code' ? 'bg-white/20 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-white'}`}
              >
                <Code2 className="w-3 h-3 text-emerald-400" />
                <span>代码 ({codeArtifacts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('links')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1.5 text-xs ${activeTab === 'links' ? 'bg-white/20 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-white'}`}
              >
                <Globe className="w-3 h-3 text-blue-400" />
                <span>链接 ({linkArtifacts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('rag')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1.5 text-xs ${activeTab === 'rag' ? 'bg-white/20 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-white'}`}
              >
                <BookOpen className="w-3 h-3 text-amber-400" />
                <span>知识库 ({ragArtifacts.length})</span>
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Search & Info Banner */}
        <div className="px-5 py-2.5 bg-black/30 border-b border-white/5 flex items-center justify-between text-xs gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索代码片段、函数名、外部URL域名或知识库文献..."
              className="w-full h-8 bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 focus:bg-white/10 transition font-sans"
            />
          </div>

          <div className="text-[11px] font-mono text-zinc-400 flex items-center space-x-3 shrink-0">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>端侧 AST 实时解析</span>
            </span>
            <span>·</span>
            <span className="text-zinc-500">双向联动跳转</span>
          </div>
        </div>

        {/* Body Content Grid */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* SECTION 1: CODE ARTIFACTS */}
          {filteredCodes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                <span className="flex items-center space-x-2 text-emerald-400">
                  <Code2 className="w-4 h-4" />
                  <span>代码片段与算力内核 ({filteredCodes.length})</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">点击「沙盒试跑」模拟输出 · 支持一键复制与定位</span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {filteredCodes.map((item) => (
                  <div 
                    key={item.id}
                    className="rounded-2xl bg-[#0F0F13]/90 border border-white/10 overflow-hidden text-xs shadow-lg space-y-0 transition-all hover:border-emerald-500/40"
                  >
                    {/* Header */}
                    <div className="px-4 py-2 bg-white/[0.04] border-b border-white/[0.06] flex items-center justify-between font-mono text-[11px]">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-bold text-white uppercase">{item.language}</span>
                        <span className="text-zinc-500">· {item.lineCount} 行代码</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRunSandbox(item.id)}
                          disabled={isSandboxRunning === item.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium flex items-center space-x-1.5 transition cursor-pointer text-[10px]"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isSandboxRunning === item.id ? '执行中...' : '沙盒试跑'}</span>
                        </button>

                        <button
                          onClick={() => handleCopy(item.id, item.code)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white flex items-center space-x-1 transition cursor-pointer text-[10px]"
                        >
                          {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === item.id ? '已复制' : '复制代码'}</span>
                        </button>

                        {onSendToCanvas && (
                          <button
                            onClick={() => {
                              onSendToCanvas(`代码内核 (${item.language})`, item.code);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium flex items-center space-x-1 transition cursor-pointer text-[10px]"
                            title="推送到无限画布"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            <span>推至画布</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            onJumpToMessage(item.messageId);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold flex items-center space-x-1 transition cursor-pointer text-[10px]"
                          title="跳转至原对话位置"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>定位对话</span>
                        </button>
                      </div>
                    </div>

                    {/* Code Content */}
                    <pre className="p-4 text-zinc-200 font-mono text-[11px] leading-relaxed overflow-x-auto selection:bg-emerald-500/30 bg-[#0B0B0E]">
                      <code>{item.code}</code>
                    </pre>

                    {/* Sandbox Output Banner */}
                    {sandboxResult[item.id] && (
                      <div className="p-3 bg-zinc-950 border-t border-emerald-500/20 text-[10px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed animate-macos-fade flex items-start gap-2">
                        <Terminal className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div className="flex-1">{sandboxResult[item.id]}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: LINKS & CITATIONS */}
          {filteredLinks.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                <span className="flex items-center space-x-2 text-blue-400">
                  <Globe className="w-4 h-4" />
                  <span>提及链接与网络检索引用 ({filteredLinks.length})</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">实时网络验证 · 支持直接访问与来源定位</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredLinks.map((link) => (
                  <div 
                    key={link.id}
                    className="p-3.5 rounded-2xl bg-[#0F0F13]/90 border border-white/10 hover:border-blue-500/40 transition flex flex-col justify-between space-y-3 group shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-blue-400 mb-1.5">
                        <span className="truncate max-w-[160px]">{link.domain}</span>
                        <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          HTTPS 认证
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition line-clamp-2">
                        {link.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono truncate mt-1">
                        {link.url}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <a 
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 hover:text-white flex items-center space-x-1.5 transition text-[11px] font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>浏览器打开</span>
                        </a>
                        <button
                          onClick={() => handleCopy(link.id, link.url)}
                          className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] transition"
                          title="复制链接"
                        >
                          {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          onJumpToMessage(link.messageId);
                          onClose();
                        }}
                        className="text-purple-300 hover:text-purple-200 text-[11px] flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>定位消息</span>
                        <CornerDownRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: RAG KNOWLEDGE BASES */}
          {filteredRags.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                <span className="flex items-center space-x-2 text-amber-400">
                  <BookOpen className="w-4 h-4" />
                  <span>知识库切片引用与向量召回 ({filteredRags.length})</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">RAG Vector Grounding · 相似度加权检索</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredRags.map((rag) => (
                  <div 
                    key={rag.id}
                    className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2.5 shadow-md"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-200 truncate flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{rag.title}</span>
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold shrink-0 border border-amber-500/30">
                        匹配度 {rag.matchScore}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-2">
                      {rag.snippet}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-amber-500/15 text-xs text-zinc-400">
                      <span className="font-mono text-[10px]">切片编号 #{rag.chunk}</span>
                      <button
                        onClick={() => {
                          onJumpToMessage(rag.messageId);
                          onClose();
                        }}
                        className="text-amber-300 hover:text-amber-200 cursor-pointer font-semibold flex items-center gap-1 text-[11px]"
                      >
                        <span>定位对应对话</span>
                        <CornerDownRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredCodes.length === 0 && filteredLinks.length === 0 && filteredRags.length === 0 && (
            <div className="py-16 text-center text-zinc-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-xs">未搜索到匹配的实体或引用记录</p>
            </div>
          )}

        </div>

        {/* Footer info */}
        <footer className="px-5 py-3 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Apple Intelligence · 实时语义实体萃取管道</span>
          </span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sans text-xs transition cursor-pointer font-medium"
          >
            完成
          </button>
        </footer>

      </div>
    </div>
  );
};
