import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Globe, 
  Sparkles, 
  Database, 
  ExternalLink, 
  ArrowRight, 
  Check, 
  Copy, 
  BookmarkPlus, 
  FolderGit2, 
  RefreshCw, 
  SlidersHorizontal, 
  Layers, 
  ChevronRight, 
  ShieldCheck, 
  FileText, 
  Flame, 
  Clock, 
  Filter,
  CheckCircle2,
  Share2,
  Lock,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  RotateCcw,
  Plus,
  X,
  Compass,
  BookOpen,
  Code2,
  Newspaper,
  Image as ImageIcon,
  BarChart2,
  Bot,
  PenTool,
  Languages,
  FolderPlus,
  Send,
  Sliders,
  ChevronDown,
  ThumbsUp,
  Bookmark,
  SplitSquareVertical,
  HelpCircle,
  Hash,
  Activity
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

export type SearchScope = 'all' | 'news' | 'academic' | 'code' | 'reports' | 'kb';
export type SearchEngineMode = 'fast' | 'deep' | 'factcheck';
export type EdgeSidebarTool = 'chat' | 'compose' | 'insights' | 'translate' | 'collections';

export interface SearchCitation {
  id: number;
  title: string;
  source: string;
  url: string;
  snippet: string;
  score: number;
  time?: string;
  domain?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  scope: SearchScope;
  timestamp: string;
}

export interface CollectionItem {
  id: string;
  title: string;
  type: string;
  content: string;
  url?: string;
  savedAt: string;
}

const PRESET_TOPICS = [
  '大语言模型长上下文检索与 KV Cache 压缩工程前沿',
  '先秦两汉志怪文献中肉体神异与天人五衰考据',
  '端侧 AI 蒸馏量化与 70B 脱网运行性能优化',
  '古典仙侠打斗“气机虚实”与反套路动作设计',
  '全球算力芯片能效比与液冷数据中心架构趋势'
];

export const AISearchView: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  // Edge Browser Window State
  const [activeBrowserTab, setActiveBrowserTab] = useState<'search' | 'copilot_tab' | 'doc_tab'>('search');
  const [omniboxUrl, setOmniboxUrl] = useState('edge://ai-search/discover?q=九渊大裂纪+前沿检索');

  // Search Query & Controls
  const [query, setQuery] = useState('大语言模型长上下文检索与 KV Cache 压缩工程前沿');
  const [scope, setScope] = useState<SearchScope>('all');
  const [engineMode, setEngineMode] = useState<SearchEngineMode>('deep');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);

  // Search Results
  const [overview, setOverview] = useState(`### 🌐 Microsoft Edge AI 深度聚合综述：关于“大语言模型长上下文检索与 KV Cache 压缩前沿”\n\n综合检索权威学术会议（NeurIPS/ICLR/ACL）、开源工程社区（vLLM/FlashAttention）与大厂技术白皮书，为您提炼以下 **4 大核心技术演进路径**：\n\n1. **KV Cache 显存瓶颈与量化压缩**：\n   - 在 128k 超长上下文推理中，KV Cache 显存占用已远超模型权重本身。当前工业界主流方案采用 **FP8 / INT4 动态量化** 与 **SnapKV / H2O 关键注意力头稀疏淘汰策略**，可在保持 98% 语义召回的同时降低 70% 显存消耗。\n2. **混合检索与 Chunking 策略重构**：\n   - 放弃传统单一稠密向量（Dense Vector）检索，全面转向 **ColBERT 晚期交互（Late Interaction）+ BM25 全文稀疏分词 + 交叉编码重排序（Cross-Encoder Reranker）** 三阶漏斗架构。\n3. **端侧推理加速工程突破**：\n   - 结合硬件指令级加速（如 Apple Silicon NEON / CUDA Tensor Core），引入 **PagedAttention 虚拟内存分页管理**，彻底解决超长文本生成中的内存碎片化问题。`);
  const [citations, setCitations] = useState<SearchCitation[]>([
    { id: 1, title: 'vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention', source: 'UC Berkeley SOSP', url: 'https://arxiv.org/abs/2309.06180', snippet: 'PagedAttention 借鉴操作系统虚拟内存分页技术，将 KV Cache 内存浪费率从 60%~80% 降至 4% 以下。', score: 0.99, domain: 'arxiv.org', time: '2026-09' },
    { id: 2, title: 'SnapKV: LLM Knows What You are Looking for Before Generation', source: 'ICLR 2024 Spotlight', url: 'https://arxiv.org/abs/2404.14469', snippet: '在提示词处理阶段自动识别并保留每个注意力头的关键观测聚类，实现超长文本 3.6x 生成吞吐提升。', score: 0.96, domain: 'iclr.cc', time: '2026-08' },
    { id: 3, title: '端侧 70B 模型量化压缩与内存拓扑工程实践', source: 'Google DeepMind & AI Studio 研报', url: 'https://deepmind.google/research/edge-llm', snippet: '探讨在 32GB 统一内存设备上实现 128k 上下文无损推理的算子融合与权重分流方案。', score: 0.93, domain: 'deepmind.google', time: '2026-09' }
  ]);
  const [followUps, setFollowUps] = useState<string[]>([
    '对比 SnapKV 与 StreamingLLM 在长对话中的遗忘机制差异',
    '如何在本地知识库检索中部署 ColBERT 多向量重排序模型？',
    '将当前检索报告一键保存至素材知识库'
  ]);

  // Edge Right-hand Professional Tool Sidebar State
  const [isEdgeSidebarOpen, setIsEdgeSidebarOpen] = useState(true);
  const [activeEdgeTool, setActiveEdgeTool] = useState<EdgeSidebarTool>('compose');

  // Edge Tool 1: Compose (创作工坊)
  const [composeFormat, setComposeFormat] = useState<'article' | 'email' | 'summary' | 'outline'>('article');
  const [composeTone, setComposeTone] = useState<'professional' | 'casual' | 'enthusiastic' | 'concise'>('professional');
  const [composeLength, setComposeLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [composedDraft, setComposedDraft] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  // Edge Tool 2: Copilot Chat (伴随对话)
  const [sideChatInput, setSideChatInput] = useState('');
  const [sideChatMessages, setSideChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: '你好！我是 Edge 伴随智能副驾。你可以随时向我提问当前检索内容，或让我帮你基于搜索结果撰写总结与大纲。' }
  ]);
  const [isSideChatThinking, setIsSideChatThinking] = useState(false);

  // Edge Tool 3: Insights (网页与实体洞察)
  const [insightsKeywordCloud, setInsightsKeywordCloud] = useState([
    { text: 'KV Cache', weight: 95 },
    { text: 'PagedAttention', weight: 88 },
    { text: 'ColBERT 重排序', weight: 82 },
    { text: '端侧量化', weight: 78 },
    { text: '稀疏注意力', weight: 70 }
  ]);

  // Edge Tool 4: Translator (智能对照翻译)
  const [translateTargetLang, setTranslateTargetLang] = useState('English');
  const [translatedSnippet, setTranslatedSnippet] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Edge Tool 5: Collections (集锦收纳)
  const [collections, setCollections] = useState<CollectionItem[]>([
    { id: 'c1', title: 'KV Cache 显存优化架构文献', type: '学术文献', content: 'vLLM PagedAttention 与 SnapKV 关键注意力头稀疏算法', url: 'https://arxiv.org/abs/2309.06180', savedAt: '10-01 12:15' },
    { id: 'c2', title: '大渊夜变 · 核心宗门反噬设定', type: '世界观事实', content: '八百年天道崩裂后，清气浮空仙岛为九大正统宗门垄断', savedAt: '10-01 11:30' }
  ]);

  // Toast & Action states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Execute Search
  const handleExecuteSearch = (searchQuery?: string, searchScope?: SearchScope) => {
    const q = searchQuery || query;
    const s = searchScope || scope;
    if (!q.trim() || isSearching) return;

    setIsSearching(true);
    setHasSearched(true);
    setOmniboxUrl(`edge://ai-search/discover?q=${encodeURIComponent(q)}&scope=${s}`);

    setTimeout(() => {
      let aiOverview = '';
      let mockCitations: SearchCitation[] = [];
      let nextQuestions: string[] = [];

      if (s === 'academic') {
        aiOverview = `### 📚 Edge 学术文献深度研读：关于“${q}”\n\n通过对 arXiv、ACM Digital Library 及 IEEE Xplore 的最新学术文献进行语义交叉验证，提炼出以下 **3 个学术前沿结论**：\n\n1. **多层注意力稀疏化理论**：最新研究证明，在自注意力层中，仅有约 15% 的 Token 承载了 90% 以上的语义信息量；\n2. **KV Cache 渐进式压缩**：在解码阶段通过动态淘汰低注意力权重的历史 Token，可以实现接近恒定的显存占用复杂度；\n3. **多模态长上下文挑战**：针对高分辨率图像帧与连续音频流，混合量化压缩已成为端侧多模态模型运行的刚需。`;
        mockCitations = [
          { id: 1, title: 'Sparse Attention and Memory-Efficient Inference in LLMs', source: 'arXiv Computer Science', url: 'https://arxiv.org/abs/2405.01920', snippet: '论述稀疏注意力在超长上下文大模型推理中的显存利用率与准确率平衡。', score: 0.98, domain: 'arxiv.org', time: '2026-08' },
          { id: 2, title: 'Quantization Strategies for Next-Gen Multi-Modal Models', source: 'IEEE Transactions on AI', url: 'https://ieee.org/ai-quant', snippet: '跨硬件架构的模型权重量化与 KV Cache 优化工程综述。', score: 0.94, domain: 'ieee.org', time: '2026-07' }
        ];
        nextQuestions = [
          '对比稀疏注意力与线性注意力的时间复杂度优劣',
          '提取文献中的公式与实验数据用于技术文档',
          '将本学术综述存入 Edge 集锦与素材库'
        ];
      } else {
        aiOverview = `### 🌐 Microsoft Edge AI 全网深度检索报告：关于“${q}”\n\n综合检索权威技术智库、行业白皮书与知识图谱，为您梳理出以下核心事实支撑：\n\n1. **技术架构共识**：当前长上下文推理已进入“算法+系统+硬件”协同优化时代，单靠扩大显存已无法应对百万 Token 的算力成本；\n2. **工业落地现状**：各大头部云厂商与本地推理框架均已全面支持 PagedAttention 与动态 FP8 KV Cache，推理吞吐平均提升 2.5~4 倍；\n3. **未来趋势**：端侧 70B 模型凭借统一内存架构（UMA）与高带宽内存，正在成为专业创作者本地知识检索的黄金标准。`;
        mockCitations = [
          { id: 1, title: 'vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention', source: 'UC Berkeley SOSP', url: 'https://arxiv.org/abs/2309.06180', snippet: 'PagedAttention 极大降低了长上下文模型推理中的显存碎片与浪费。', score: 0.99, domain: 'arxiv.org', time: '2026-09' },
          { id: 2, title: 'SnapKV: LLM Knows What You are Looking for Before Generation', source: 'ICLR Spotlight', url: 'https://arxiv.org/abs/2404.14469', snippet: '自动提取并保留注意力特征簇，提升长文本生成效率。', score: 0.96, domain: 'iclr.cc', time: '2026-08' },
          { id: 3, title: '端侧 70B 模型量化压缩与内存拓扑工程实践', source: 'AI Studio 研报', url: 'https://deepmind.google/research/edge-llm', snippet: '探讨在本地脱网环境下实现长程记忆检索与高吞吐写作。', score: 0.93, domain: 'deepmind.google', time: '2026-09' }
        ];
        nextQuestions = [
          '如何使用 Compose 工具基于当前搜索结果快速生成一份技术简报？',
          '利用 Insights 分析当前网页的核心关键词权重',
          '一键将检索文献添加至 Edge 集锦'
        ];
      }

      setOverview(aiOverview);
      setCitations(mockCitations);
      setFollowUps(nextQuestions);
      setIsSearching(false);
    }, 600);
  };

  // Edge Tool: Compose Execution
  const handleExecuteCompose = () => {
    setIsComposing(true);
    setTimeout(() => {
      const draft = `【Edge Compose 自动生成技术概要 · ${composeFormat.toUpperCase()}】\n\n基于对“${query}”的全网权威检索，本文深入探讨了超长上下文大模型推理的核心挑战与优化路径。\n\n在传统注意力机制下，KV Cache 显存消耗随序列长度呈线性暴增。通过引入 PagedAttention 虚拟分页内存管理以及 SnapKV 稀疏注意力淘汰机制，工业界成功将显存浪费率压降至 4% 以下。\n\n未来，随着端侧统一内存拓扑与指令级量化加速的普及，个人桌面端脱网运行 70B 模型处理百万 Token 任务将成为常态。`;
      setComposedDraft(draft);
      setIsComposing(false);
    }, 700);
  };

  // Edge Tool: Translate Execution
  const handleExecuteTranslate = () => {
    setIsTranslating(true);
    setTimeout(() => {
      setTranslatedSnippet(`[Edge Intelligent Translation into ${translateTargetLang}]\n\n"Comprehensive research on Long-Context LLMs and KV Cache compression demonstrates that PagedAttention and selective sparse eviction reduce memory waste below 4%, enabling high-throughput local 70B inference."`);
      setIsTranslating(false);
    }, 600);
  };

  // Edge Tool: Copilot Chat Send
  const handleSendSideChat = () => {
    if (!sideChatInput.trim()) return;
    const userText = sideChatInput.trim();
    setSideChatInput('');
    setIsSideChatThinking(true);

    setSideChatMessages(prev => [...prev, { role: 'user', text: userText }]);

    setTimeout(() => {
      const reply = `已结合当前搜索结果为你解答：“${userText}”。在 128k 超长序列中，关键在于平衡量化精度与注意力损失，推荐优先结合 SnapKV 算法进行显存压缩。`;
      setSideChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsSideChatThinking(false);
    }, 600);
  };

  // Save to material knowledge base
  const handleSaveToKnowledgeBase = async (title?: string, content?: string) => {
    const targetTitle = title || `AI搜索报告: ${query.slice(0, 20)}`;
    const targetContent = content || overview;

    try {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetTitle,
          body: targetContent,
          kind: 'search_report',
          tags: ['AI搜索', 'EdgeDiscover', scope]
        })
      });

      // Also add to Edge collections
      const newColItem: CollectionItem = {
        id: `col-${Date.now()}`,
        title: targetTitle,
        type: '检索报告',
        content: targetContent.slice(0, 80) + '...',
        savedAt: '刚刚'
      };
      setCollections([newColItem, ...collections]);

      setToastMessage('✅ 已成功保存至素材知识库与 Edge 集锦！');
      if (onSaveToMaterial) onSaveToMaterial(targetTitle, targetContent);
      setTimeout(() => setToastMessage(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--apple-bg)] select-none text-[var(--apple-text-primary)]">
      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-[var(--apple-surface)]/95 border border-emerald-500/40 shadow-2xl backdrop-blur-2xl text-xs font-semibold text-emerald-400 flex items-center gap-2 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. TOP MICROSOFT EDGE BROWSER TAB BAR & OMNIBOX */}
      {/* ============================================================ */}
      <header className="bg-[#1b1e24] dark:bg-[#121418] border-b border-[var(--apple-border)] flex flex-col shrink-0 z-30 select-none">
        {/* Row 1: Edge Horizontal Browser Tabs */}
        <div className="h-10 px-3 flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0">
            {/* Active Tab */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-xl bg-[var(--apple-surface)] border-t border-x border-[var(--apple-border)] text-xs font-semibold text-[var(--apple-text-primary)] shadow-xs max-w-xs">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-[8px] font-bold">
                e
              </div>
              <span className="truncate">AI 搜索与发现 · Edge Discover</span>
              <button className="text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]">
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Secondary Tab */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-xl hover:bg-white/5 text-xs text-[var(--apple-text-secondary)] transition-all max-w-xs cursor-pointer">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate">知识库事实图谱</span>
            </div>

            {/* New Tab Button */}
            <button
              onClick={() => {
                setQuery('');
                setHasSearched(false);
              }}
              className="p-1 rounded-lg text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)] hover:bg-white/10"
              title="新建搜索标签页"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Window Control Buttons & Hub */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--apple-text-secondary)]">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold border border-blue-500/20">
              Edge AI v2.5 Engine
            </span>
          </div>
        </div>

        {/* Row 2: Edge Omnibox Address & Action Bar */}
        <div className="h-11 px-4 bg-[var(--apple-surface)] border-t border-[var(--apple-separator)] flex items-center justify-between gap-3">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1 text-[var(--apple-text-secondary)]">
            <button className="p-1.5 rounded-lg hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]" title="后退">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]" title="前进">
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleExecuteSearch()}
              className={`p-1.5 rounded-lg hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)] ${isSearching ? 'animate-spin' : ''}`}
              title="刷新搜索"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center: Edge Smart Address / Search Omnibox */}
          <div className="flex-1 max-w-3xl flex items-center gap-2 px-3 py-1.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-2xl shadow-2xs group focus-within:border-[var(--apple-accent)] focus-within:bg-[var(--apple-surface)] transition-all">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <Search className="w-3.5 h-3.5 text-[var(--apple-text-tertiary)] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleExecuteSearch()}
              placeholder="在全网或知识库中搜索，或输入网址..."
              className="w-full bg-transparent text-xs text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] focus:outline-none font-sans"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]">
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => handleExecuteSearch()}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[10px] font-bold shadow-xs hover:opacity-95 shrink-0"
            >
              探索
            </button>
          </div>

          {/* Right Edge Action Icons: Split Screen, Collections, Copilot Sidebar Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSaveToKnowledgeBase()}
              className="p-1.5 rounded-xl text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-all"
              title="保存网页至素材库"
            >
              <BookmarkPlus className="w-4 h-4" />
            </button>

            {/* Edge Copilot Sidebar Switcher Button */}
            <button
              onClick={() => setIsEdgeSidebarOpen(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs ${
                isEdgeSidebarOpen
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
              }`}
              title="切换 Edge Copilot 侧边栏工具箱"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Edge 侧边工具箱</span>
            </button>
          </div>
        </div>

        {/* Row 3: Edge Search Scope & Mode Filter Bar */}
        <div className="px-6 py-2 bg-[var(--apple-surface)]/90 border-t border-[var(--apple-separator)] flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          {/* Scope Pills */}
          <div className="flex items-center gap-1 text-xs">
            {[
              { id: 'all' as SearchScope, label: '🌐 全部 (All)', icon: Globe },
              { id: 'academic' as SearchScope, label: '📚 学术文献', icon: BookOpen },
              { id: 'news' as SearchScope, label: '📰 新闻动态', icon: Newspaper },
              { id: 'code' as SearchScope, label: '💻 开源与代码', icon: Code2 },
              { id: 'reports' as SearchScope, label: '📊 行业研报', icon: BarChart2 },
              { id: 'kb' as SearchScope, label: '🗄️ 本地知识库', icon: Database }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setScope(item.id);
                  handleExecuteSearch(query, item.id);
                }}
                className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1 ${
                  scope === item.id
                    ? 'bg-[var(--apple-accent)] text-white font-bold shadow-xs'
                    : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)]'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Engine Modes */}
          <div className="flex items-center gap-1 bg-[var(--apple-subtle)] p-0.5 rounded-xl border border-[var(--apple-border)] text-[10px] font-semibold">
            {[
              { id: 'fast' as SearchEngineMode, label: '⚡ 极速直达' },
              { id: 'deep' as SearchEngineMode, label: '🧠 深度研读' },
              { id: 'factcheck' as SearchEngineMode, label: '🛡️ 事实核查' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setEngineMode(m.id);
                  handleExecuteSearch(query, scope);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  engineMode === m.id
                    ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-2xs font-bold'
                    : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN BODY: SEARCH RESULTS WORKSPACE + EDGE COPILOT TOOLS */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Center: Search Results Viewport */}
        <main className="flex-1 overflow-y-auto p-8 flex justify-center bg-[var(--apple-bg)] select-text">
          <div className="w-full max-w-3xl space-y-6">
            {/* AI Deep Answer Card */}
            {hasSearched && (
              <div className="p-6 rounded-3xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-md space-y-4 relative overflow-hidden">
                {/* Top Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--apple-separator)]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                      ✨
                    </div>
                    <span className="text-xs font-bold text-[var(--apple-text-primary)]">
                      Edge AI 深度综合回答 (Synthesized Response)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/20">
                      置信度 99.4%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(overview);
                        setCopiedSuccess(true);
                        setTimeout(() => setCopiedSuccess(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[10px] font-semibold text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-all flex items-center gap-1"
                    >
                      {copiedSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSuccess ? '已复制' : '复制全文'}</span>
                    </button>

                    <button
                      onClick={() => handleSaveToKnowledgeBase()}
                      className="px-2.5 py-1 rounded-xl bg-[var(--apple-accent)] text-white text-[10px] font-semibold shadow-xs hover:bg-[var(--apple-accent-hover)] transition-all flex items-center gap-1"
                    >
                      <BookmarkPlus className="w-3 h-3" />
                      <span>收录至素材库</span>
                    </button>
                  </div>
                </div>

                {/* Markdown Content */}
                <div className="text-xs text-[var(--apple-text-primary)] leading-relaxed">
                  <AppleMarkdown content={overview} />
                </div>
              </div>
            )}

            {/* Citations & Web Sources Grid */}
            {citations.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--apple-text-primary)]">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>权威事实来源与文献引用 ({citations.length})</span>
                  </span>
                  <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)]">
                    多源交叉核验已就绪
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {citations.map(cit => (
                    <div
                      key={cit.id}
                      className="p-3.5 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] hover:border-[var(--apple-border-strong)] transition-all shadow-2xs space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--apple-subtle)] text-[9px] font-mono text-[var(--apple-text-tertiary)] truncate max-w-[140px]">
                          {cit.domain || 'web source'}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-emerald-400">
                          契合度 {Math.round(cit.score * 100)}%
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[var(--apple-text-primary)] group-hover:text-[var(--apple-accent)] transition-colors line-clamp-1">
                        {cit.title}
                      </h4>

                      <p className="text-[11px] text-[var(--apple-text-secondary)] leading-relaxed line-clamp-2">
                        {cit.snippet}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[var(--apple-text-tertiary)] border-t border-[var(--apple-separator)]">
                        <span>{cit.source}</span>
                        <a
                          href={cit.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--apple-accent)] hover:underline flex items-center gap-0.5"
                        >
                          <span>查看源网页</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Questions Exploration */}
            {followUps.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  <span>探索相关维度与追问</span>
                </span>

                <div className="space-y-1.5">
                  {followUps.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuery(q);
                        handleExecuteSearch(q);
                      }}
                      className="w-full p-2.5 rounded-2xl bg-[var(--apple-subtle)]/70 hover:bg-[var(--apple-surface)] border border-[var(--apple-border)] text-xs text-left text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <span className="truncate">{q}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--apple-text-tertiary)] group-hover:text-[var(--apple-accent)] transition-colors shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ========================================================== */}
        {/* 3. ⭐ MICROSOFT EDGE COPILOT SIDEBAR & PROFESSIONAL TOOLS */}
        {/* ========================================================== */}
        {isEdgeSidebarOpen && (
          <aside className="w-92 border-l border-[var(--apple-border)] bg-[var(--apple-surface)]/95 backdrop-blur-3xl flex flex-col shrink-0 select-none z-30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-right-3 duration-200">
            {/* Sidebar Top: Edge Tool Tabs Strip */}
            <div className="h-12 px-3 border-b border-[var(--apple-separator)] flex items-center justify-between bg-[var(--apple-subtle)]/50">
              <div className="flex items-center gap-1">
                {[
                  { id: 'compose' as EdgeSidebarTool, label: '写作', icon: PenTool, color: '#0a84ff' },
                  { id: 'chat' as EdgeSidebarTool, label: '对话', icon: Bot, color: '#bf5af2' },
                  { id: 'insights' as EdgeSidebarTool, label: '洞察', icon: Activity, color: '#30d158' },
                  { id: 'translate' as EdgeSidebarTool, label: '翻译', icon: Languages, color: '#ff9f0a' },
                  { id: 'collections' as EdgeSidebarTool, label: '集锦', icon: FolderPlus, color: '#64d2ff' }
                ].map(tool => {
                  const IconComp = tool.icon;
                  const isActive = activeEdgeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveEdgeTool(tool.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs font-bold'
                          : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span className="text-[11px]">{tool.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setIsEdgeSidebarOpen(false)}
                className="p-1 rounded-lg text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]"
                title="关闭侧边栏"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sidebar Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ==================================================== */}
              {/* TOOL 1: COMPOSE (写作与改写工坊) */}
              {/* ==================================================== */}
              {activeEdgeTool === 'compose' && (
                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                      创作格式 (Format)
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { id: 'article', label: '📄 文章' },
                        { id: 'email', label: '✉️ 邮件' },
                        { id: 'summary', label: '📋 摘要' },
                        { id: 'outline', label: '📑 大纲' }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setComposeFormat(f.id as any)}
                          className={`py-1.5 rounded-xl border text-center transition-all ${
                            composeFormat === f.id
                              ? 'bg-[var(--apple-accent)] text-white font-bold border-[var(--apple-accent)] shadow-xs'
                              : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)]'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                      行文语气 (Tone)
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'professional', label: '💼 专业严谨' },
                        { id: 'casual', label: '☕ 轻松随和' },
                        { id: 'enthusiastic', label: '🚀 热情生动' },
                        { id: 'concise', label: '⚡ 极简要领' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setComposeTone(t.id as any)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            composeTone === t.id
                              ? 'bg-[var(--apple-accent-subtle)] border-[var(--apple-accent)] text-[var(--apple-accent)] font-bold'
                              : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)]'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleExecuteCompose}
                    disabled={isComposing}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <PenTool className={`w-3.5 h-3.5 ${isComposing ? 'animate-spin' : ''}`} />
                    <span>{isComposing ? '正在智能撰写草稿...' : '基于搜索结果生成草稿'}</span>
                  </button>

                  {/* Composed Draft Card */}
                  {composedDraft && (
                    <div className="p-3.5 rounded-2xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-2 select-text">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--apple-accent)] text-[10px]">生成草稿成果</span>
                        <button
                          onClick={() => handleSaveToKnowledgeBase('Edge Compose 生成草稿', composedDraft)}
                          className="px-2 py-0.5 rounded-lg bg-[var(--apple-accent)] text-white text-[10px] font-bold"
                        >
                          收录
                        </button>
                      </div>
                      <p className="text-[11px] leading-relaxed text-[var(--apple-text-primary)] whitespace-pre-wrap">
                        {composedDraft}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* TOOL 2: CHAT & COPILOT (伴随对话) */}
              {/* ==================================================== */}
              {activeEdgeTool === 'chat' && (
                <div className="flex-1 flex flex-col h-[65vh] justify-between space-y-3 text-xs">
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 select-text">
                    {sideChatMessages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-2xl leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-[var(--apple-accent)] text-white ml-auto max-w-[85%]'
                            : 'bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] mr-auto max-w-[95%]'
                        }`}
                      >
                        <p>{m.text}</p>
                      </div>
                    ))}
                    {isSideChatThinking && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--apple-text-tertiary)] animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                        <span>正在综合研判...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--apple-separator)]">
                    <input
                      type="text"
                      value={sideChatInput}
                      onChange={e => setSideChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendSideChat()}
                      placeholder="针对当前搜索结果提问..."
                      className="flex-1 px-3 py-2 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-xs text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)]"
                    />
                    <button
                      onClick={handleSendSideChat}
                      disabled={!sideChatInput.trim()}
                      className="p-2 rounded-xl bg-[var(--apple-accent)] text-white shadow-xs disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TOOL 3: INSIGHTS (网页与实体深度洞察) */}
              {/* ==================================================== */}
              {activeEdgeTool === 'insights' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-1">
                    <p className="font-bold">权威度与安全评级：高 (High Trust)</p>
                    <p className="text-[10px] text-[var(--apple-text-secondary)]">数据源均来自顶会论文与官方架构研报。</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                      核心关键词词频与热力权重
                    </span>
                    <div className="space-y-1.5">
                      {insightsKeywordCloud.map((kw, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between font-mono text-[11px]">
                            <span className="font-bold text-[var(--apple-text-primary)]">{kw.text}</span>
                            <span className="text-[var(--apple-accent)] font-bold">{kw.weight}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[var(--apple-subtle)] overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" style={{ width: `${kw.weight}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TOOL 4: TRANSLATOR (智能对照翻译) */}
              {/* ==================================================== */}
              {activeEdgeTool === 'translate' && (
                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                      目标语言
                    </span>
                    <select
                      value={translateTargetLang}
                      onChange={e => setTranslateTargetLang(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-xs text-[var(--apple-text-primary)] focus:outline-none"
                    >
                      <option value="English">English (英语)</option>
                      <option value="Japanese">日本語 (日语)</option>
                      <option value="French">Français (法语)</option>
                      <option value="German">Deutsch (德语)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleExecuteTranslate}
                    disabled={isTranslating}
                    className="w-full py-2.5 rounded-2xl bg-[var(--apple-accent)] text-white font-bold shadow-md hover:bg-[var(--apple-accent-hover)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <Languages className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
                    <span>{isTranslating ? '正在翻译中...' : '全文智能对照翻译'}</span>
                  </button>

                  {translatedSnippet && (
                    <div className="p-3.5 rounded-2xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-1 select-text">
                      <span className="text-[10px] font-bold text-amber-400 font-mono">译文预览</span>
                      <p className="text-[11px] leading-relaxed text-[var(--apple-text-primary)] font-serif">
                        {translatedSnippet}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* TOOL 5: COLLECTIONS (Edge 集锦与知识库灵感收纳) */}
              {/* ==================================================== */}
              {activeEdgeTool === 'collections' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                      Edge 集锦列表 ({collections.length})
                    </span>
                    <button
                      onClick={() => handleSaveToKnowledgeBase('当前检索结果全集锦', overview)}
                      className="text-[10px] font-bold text-[var(--apple-accent)] hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>收录当前页</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {collections.map(item => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--apple-text-primary)] truncate">{item.title}</span>
                          <span className="px-1.5 py-0.2 rounded bg-[var(--apple-surface)] text-[9px] font-mono text-[var(--apple-accent)]">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--apple-text-secondary)] line-clamp-2">
                          {item.content}
                        </p>
                        <p className="text-[9px] font-mono text-[var(--apple-text-tertiary)] pt-1 border-t border-[var(--apple-separator)]">
                          收录于 {item.savedAt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
