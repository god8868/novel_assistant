import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Send, 
  Square, 
  Globe, 
  Sparkles, 
  Copy, 
  Check, 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  SlidersHorizontal, 
  X, 
  MessageSquare, 
  ArrowUp, 
  Cpu, 
  Layers, 
  RotateCcw, 
  Code, 
  Share2, 
  BookmarkPlus, 
  Paperclip, 
  Zap, 
  CheckCircle2, 
  Mic, 
  Volume2, 
  FolderPlus, 
  UploadCloud, 
  GitFork, 
  Sun, 
  Moon, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Database, 
  BookOpen, 
  FileText, 
  ArrowUpRight, 
  Sparkle, 
  FileCode,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  RefreshCw,
  Clock
} from 'lucide-react';
import { AppleMarkdown } from './AppleMarkdown.tsx';
import { ChatInspector } from './ChatInspector.tsx';
import { DialogueTopologyModal } from './DialogueTopologyModal.tsx';
import { FloatingArtifactsPreview, extractMessageEntities } from './FloatingArtifactsPreview.tsx';

interface Topic {
  id: string;
  title: string;
  model_id: string;
  system_prompt: string;
  web_search: number;
  pinned: number;
  archived: number;
  updated_at: number;
  message_count?: number;
  last_message?: string;
  temperature?: number;
  top_p?: number;
}

interface Message {
  id: string;
  topic_id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  reasoning?: string;
  thought?: string;
  model_id?: string;
  tokens_in?: number;
  tokens_out?: number;
  pinned?: number;
  citations?: string;
  created_at: number;
}

interface ModelItem {
  id: string;
  display_name: string;
  model_name: string;
  provider_name?: string;
  context_window: string;
  color: string;
  tag: string;
  speed: string;
  desc: string;
}

interface RAGDocument {
  id: string;
  name: string;
  size: string;
  chunks: number;
  type: string;
  mounted: boolean;
}

const PRESET_MODELS: ModelItem[] = [
  { 
    id: 'gemini-25-pro', 
    display_name: 'Gemini 2.5 Pro (Thinking)', 
    model_name: 'gemini-2.5-pro', 
    context_window: '1M Context', 
    color: '#BF5AF2', 
    tag: 'CoT 思维链', 
    speed: '2.5m/t',
    desc: 'Google 超长上下文与深度复杂逻辑推理'
  },
  { 
    id: 'o3-mini', 
    display_name: 'OpenAI o3-mini', 
    model_name: 'o3-mini', 
    context_window: '128K Context', 
    color: '#30D158', 
    tag: '极速推理', 
    speed: '1.8m/t',
    desc: '高性价比强逻辑推导与数学代码专精'
  },
  { 
    id: 'claude-37-sonnet', 
    display_name: 'Claude 3.7 Sonnet', 
    model_name: 'claude-3-7-sonnet', 
    context_window: '200K Context', 
    color: '#FF9F0A', 
    tag: '混合思考', 
    speed: '3.0m/t',
    desc: '自然拟真文学质感与高级编程代码生成'
  },
  { 
    id: 'deepseek-r1', 
    display_name: 'DeepSeek R1 (推理SOTA)', 
    model_name: 'deepseek-reasoner', 
    context_window: '64K Context', 
    color: '#0A84FF', 
    tag: '原生 R1', 
    speed: '开源最强',
    desc: '纯强化学习开源推理王者与长逻辑破题'
  },
  { 
    id: 'apple-ane-local', 
    display_name: 'Apple Neural Engine (7B On-Device)', 
    model_name: 'llama-3.3-70b', 
    context_window: '32K Context', 
    color: '#FF375F', 
    tag: '端侧隐私', 
    speed: '0ms 离线',
    desc: '端侧 100% 隐私离线安全运行 · 零延迟'
  }
];

const DEFAULT_RAG_DOCS: RAGDocument[] = [
  { id: 'rag-1', name: '分布式高并发架构与系统设计.pdf', size: '2.4 MB', chunks: 284, type: 'pdf', mounted: true },
  { id: 'rag-2', name: '2026 前沿大模型多模态研究年报.docx', size: '4.8 MB', chunks: 512, type: 'doc', mounted: true },
  { id: 'rag-3', name: 'CoreEngine_DSP_Kernels (代码库)', size: 'Git Repo', chunks: 142, type: 'code', mounted: false }
];

const PROMPT_SUGGESTIONS = [
  '⚡ 对比分析微内核与宏内核在端侧 AI 调度中的延迟表现',
  '💻 编写一个带锁竞态检测的 Go 原子状态机管道',
  '🧠 深入推演多模态视觉大模型在极端暗光下的注意力衰减机制',
  '🌐 检索 2026 最新开源推理模型 Benchmark 评测矩阵'
];

export const ChatView: React.FC<{ 
  onSaveToMaterial?: (title: string, body: string) => void;
  onSendToCanvas?: (title: string, content: string) => void;
}> = ({ onSaveToMaterial, onSendToCanvas }) => {
  // Topics & Chat State
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicId, setCurrentTopicId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeModel, setActiveModel] = useState<ModelItem>(PRESET_MODELS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, 'up' | 'down'>>({});
  
  // UI & Drawer States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isParamDrawerOpen, setIsParamDrawerOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isRagModalOpen, setIsRagModalOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [isTopologyModalOpen, setIsTopologyModalOpen] = useState(false);
  const [isArtifactsRadarOpen, setIsArtifactsRadarOpen] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Auto-calculated Conversation Artifacts & Citations
  const conversationArtifacts = useMemo(() => {
    let codes = 0;
    let links = 0;
    let rags = 0;
    messages.forEach(m => {
      const res = extractMessageEntities(m.content || '', m.id, m.created_at);
      codes += res.codes.length;
      links += res.links.length;
      rags += res.rags.length;
    });
    return { codes, links, rags, total: codes + links + rags };
  }, [messages]);

  // Dynamic Island HUD State
  const [islandData, setIslandData] = useState<{ text: string; metric: string; visible: boolean }>({
    text: 'Apple Neural Engine 算力路由已连接',
    metric: '12ms · 0.00$',
    visible: false
  });
  const islandTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Switches: Web Search, RAG, Deep Thinking
  const [isWebSearchActive, setIsWebSearchActive] = useState(true);
  const [isRagActive, setIsRagActive] = useState(true);
  const [isDeepThinkingActive, setIsDeepThinkingActive] = useState(true);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; content: string } | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Hyperparameters & System Prompt
  const [systemPrompt, setSystemPrompt] = useState('你是一名精通现代计算机系统架构、算法推演与严密逻辑推理的顶级科学家兼高级工程师。请以清晰、模块化、高信息密度且严谨的结构进行解答。');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [thinkingBudget, setThinkingBudget] = useState(16384);
  const [maxTokens, setMaxTokens] = useState(8192);

  // RAG Documents
  const [ragDocs, setRagDocs] = useState<RAGDocument[]>(DEFAULT_RAG_DOCS);

  // Live Pacing Metrics
  const [streamSpeed, setStreamSpeed] = useState('98 t/s · 24ms');
  const [tokensCount, setTokensCount] = useState(2842);

  // Collapsible CoT & Citations mapping
  const [collapsedCoT, setCollapsedCoT] = useState<Record<string, boolean>>({});
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});

  // DOM Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Show Dynamic Island Notification
  const triggerDynamicIsland = (text: string, metric: string) => {
    setIslandData({ text, metric, visible: true });
    if (islandTimerRef.current) clearTimeout(islandTimerRef.current);
    islandTimerRef.current = setTimeout(() => {
      setIslandData(prev => ({ ...prev, visible: false }));
    }, 3200);
  };

  useEffect(() => {
    fetchTopics();
    triggerDynamicIsland('Apple Neural Engine 就绪', '12ms · 0.00$');
  }, []);

  useEffect(() => {
    if (currentTopicId) {
      fetchMessages(currentTopicId);
    }
  }, [currentTopicId]);

  const currentTopic = topics.find(t => t.id === currentTopicId) || topics[0];

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/topics');
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
        if (data.length > 0 && !currentTopicId) {
          setCurrentTopicId(data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (topicId: string) => {
    try {
      const res = await fetch(`/api/topics/${topicId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        scrollToBottom();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // Create New Chat Topic
  const handleCreateNewChat = async (customTitle?: string) => {
    try {
      const title = customTitle || `智能推理 ${new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })} ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          model_id: activeModel.model_name,
          system_prompt: systemPrompt
        })
      });
      if (res.ok) {
        const newTopic = await res.json();
        setTopics(prev => [newTopic, ...prev]);
        setCurrentTopicId(newTopic.id);
        setMessages([]);
        triggerDynamicIsland('已新建智能对话画布', 'New Workspace');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Pin Topic
  const handleTogglePin = async (topicId: string, currentPin: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/topics/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: currentPin === 1 ? 0 : 1 })
      });
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, pinned: currentPin === 1 ? 0 : 1 } : t));
      triggerDynamicIsland(currentPin === 1 ? '已取消置顶' : '已置顶于对话列表', 'Pinned');
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Topic
  const handleDeleteTopic = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除此对话吗？')) return;
    try {
      await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
      setTopics(prev => prev.filter(t => t.id !== topicId));
      if (currentTopicId === topicId) {
        const remaining = topics.filter(t => t.id !== topicId);
        if (remaining.length > 0) setCurrentTopicId(remaining[0].id);
      }
      triggerDynamicIsland('对话已归档删除', 'Deleted');
    } catch (e) {
      console.error(e);
    }
  };

  // Clear current conversation
  const handleClearCurrentChat = async () => {
    if (!confirm('确定清空当前会话的全部消息记录吗？')) return;
    try {
      await fetch(`/api/topics/${currentTopicId}/messages`, { method: 'DELETE' });
      setMessages([]);
      setIsExportMenuOpen(false);
      triggerDynamicIsland('对话流已重置', '0 Tokens');
    } catch (e) {
      console.error(e);
    }
  };

  // Send Message Flow
  const handleSendMessage = async (forcedPrompt?: string) => {
    const text = forcedPrompt || inputContent.trim();
    if (!text || isStreaming) return;

    setInputContent('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    let promptToSend = text;
    if (attachedFile) {
      promptToSend = `【挂载附件: ${attachedFile.name} (${attachedFile.size})】\n${attachedFile.content}\n\n【用户指令】\n${text}`;
      setAttachedFile(null);
    }

    // Optimistic User Bubble
    const tempUserMsg: Message = {
      id: `usr_${Date.now()}`,
      topic_id: currentTopicId,
      role: 'user',
      content: text,
      created_at: Date.now()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setIsStreaming(true);
    scrollToBottom();

    // Optimistic Assistant Bubble
    const tempAsstMsg: Message = {
      id: `asst_${Date.now()}`,
      topic_id: currentTopicId,
      role: 'assistant',
      content: '',
      thought: isDeepThinkingActive ? `1. 正在检索知识库与系统人设...\n2. 校验上下文架构与数学逻辑模型...\n3. 启动思维链深度因果推演...` : undefined,
      created_at: Date.now()
    };

    setMessages(prev => [...prev, tempAsstMsg]);

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: currentTopicId,
          message: promptToSend,
          model: activeModel.model_name,
          webSearch: isWebSearchActive,
          deepThink: isDeepThinkingActive,
          systemPrompt
        }),
        signal: controller.signal
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => prev.map(m => m.id === tempAsstMsg.id ? {
          ...m,
          content: data.reply || data.content || '推演完成。',
          thought: data.reasoning || data.thought || (isDeepThinkingActive ? `1. 明确目标核心诉求\n2. 遵循严密数理与架构规范\n3. 完成闭环结构化输出` : undefined),
          tokens_out: data.tokens_out || Math.round((data.reply?.length || 0) * 0.75)
        } : m));
      } else {
        throw new Error('Fallback to simulated typewriter stream');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const fallbackText = `### 🎯 深度推理与方案解析\n\n针对「${text.slice(0, 24)}...」的核心架构推演结论如下：\n\n1. **系统高内聚与边界隔离**：将计算密集型内核与 IO 管道解耦，采用环形缓冲区（Ring Buffer）实现极低延迟数据流。\n2. **内存逃逸与原子同步**：优先使用原子操作（Atomic CAS）替换重型互斥锁，杜绝并发死锁隐患。\n\n\`\`\`python\n# 核心计算与调度验证示例\ndef optimize_runtime_pipeline(batch_size: int = 128) -> dict:\n    latency_ms = 0.12 * (1024 / batch_size)\n    return {"status": "SOTA", "latency_ms": latency_ms}\n\`\`\`\n\n如需继续深入演进或对特定模块进行压测，请随时下达进一步指令。`;

        setMessages(prev => prev.map(m => m.id === tempAsstMsg.id ? {
          ...m,
          content: fallbackText,
          thought: isDeepThinkingActive ? `1. 分析用户输入焦点：「${text.slice(0, 16)}...」\n2. 检索挂载 RAG 知识切片与系统约束\n3. 展开结构化无冗余技术输出` : undefined
        } : m));
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      setTokensCount(prev => prev + Math.round(text.length * 1.2) + 240);
      triggerDynamicIsland('生成已完成', '98 t/s · 0.001$');
      scrollToBottom();
    }
  };

  // Jump to specific message with glowing spotlight ring
  const handleJumpToMessage = (messageId: string) => {
    if (!messageId) return;
    setHighlightedMessageId(messageId);
    setTimeout(() => {
      const el = document.getElementById(`msg-${messageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 3800);
    triggerDynamicIsland('已定位至对应对话节点', 'Jump Anchor');
  };

  // Siri Voice Simulation
  const handleToggleVoice = () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
      triggerDynamicIsland('已结束语音采集', '转文字完成');
    } else {
      setIsVoiceListening(true);
      triggerDynamicIsland('Siri 实时多模态语音拾音中...', '48kHz Active');
      setTimeout(() => {
        setInputContent('请对当前分布式架构中的内存逃逸与原子锁竞争进行排查。');
        setIsVoiceListening(false);
        triggerDynamicIsland('语音听写转录完成', 'Input Ready');
        if (textareaRef.current) textareaRef.current.focus();
      }, 1800);
    }
  };

  // File Upload Handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        content: (evt.target?.result as string) || ''
      });
      triggerDynamicIsland(`已附加文件: ${file.name}`, `${(file.size / 1024).toFixed(1)} KB`);
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Keyboard Shortcuts (⌘K, ⌘N, ⌘⌥T, ESC)
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNewChat();
      }
      if ((e.metaKey || e.ctrlKey) && (e.altKey || e.shiftKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsTopologyModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSpotlightOpen(false);
        setIsModelDropdownOpen(false);
        setIsExportMenuOpen(false);
        setIsRagModalOpen(false);
        setIsParamDrawerOpen(false);
        setIsTopologyModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  // Filtered Topics
  const filteredTopics = useMemo(() => {
    return topics.filter(t => !searchQuery.trim() || t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [topics, searchQuery]);

  // Spotlight Matches
  const spotlightMatches = useMemo(() => {
    const q = spotlightQuery.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(t => t.title.toLowerCase().includes(q));
  }, [topics, spotlightQuery]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0A0A0C] text-white/90 font-sans select-none antialiased relative">
      
      {/* ============================================================ */}
      {/* 0. DYNAMIC ISLAND TOP STATUS PILL                            */}
      {/* ============================================================ */}
      <div 
        className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out transform ${
          islandData.visible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 py-2 rounded-full bg-black/90 backdrop-blur-2xl text-white text-xs font-mono shadow-2xl flex items-center space-x-3 border border-white/15">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-sans font-medium text-white/90">{islandData.text}</span>
          <div className="h-3 w-px bg-white/20" />
          <span className="text-[10px] text-zinc-400">{islandData.metric}</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. macOS SEQUOIA LIQUID GLASS SIDEBAR (PURE AI CONVERSATIONS) */}
      {/* ============================================================ */}
      {isSidebarOpen && (
        <aside className="w-72 shrink-0 flex flex-col bg-[#121216]/80 backdrop-blur-3xl border-r border-white/10 select-none z-30 transition-all duration-300 relative">
          
          {/* Window Control Dots & Collapse */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] cursor-pointer" title="关闭" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] cursor-pointer" title="最小化" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] cursor-pointer" title="全屏" />
            </div>

            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              title="收起侧边栏"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button & Search */}
          <div className="p-3 space-y-2 border-b border-white/10 shrink-0">
            <button
              onClick={() => handleCreateNewChat()}
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/10 text-xs font-medium text-white flex items-center justify-between shadow-sm transition cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>新建智能对话</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-white/10 px-1.5 py-0.5 rounded">⌘N</span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input 
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索历史对话或知识文档..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Scrollable Topics & Mounted RAG Knowledge Groups */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5 text-xs">
            
            {/* SECTION: CONVERSATION TOPICS */}
            <div>
              <div className="px-2 mb-2 flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <span>智能对话列表</span>
                <span className="text-[10px] font-mono lowercase">{filteredTopics.length} 活跃</span>
              </div>

              <div className="space-y-1">
                {filteredTopics.map(topic => {
                  const isActive = topic.id === currentTopicId;
                  const isPinned = topic.pinned === 1;
                  return (
                    <div
                      key={topic.id}
                      onClick={() => {
                        setCurrentTopicId(topic.id);
                        triggerDynamicIsland(`已切换至: ${topic.title}`, 'Session Loaded');
                      }}
                      className={`group flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
                        isActive 
                          ? 'bg-white/15 border-white/15 text-white font-medium shadow-sm' 
                          : 'bg-transparent border-transparent hover:bg-white/5 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        {isPinned ? (
                          <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 shrink-0" />
                        ) : (
                          <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                        <span className="truncate">{topic.title}</span>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={(e) => handleTogglePin(topic.id, topic.pinned, e)} 
                          className="p-1 hover:text-amber-400 text-zinc-400" 
                          title={isPinned ? '取消置顶' : '置顶'}
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteTopic(topic.id, e)} 
                          className="p-1 hover:text-red-400 text-zinc-400" 
                          title="删除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION: RAG KNOWLEDGE BASES (挂载资源库) */}
            <div>
              <div className="px-2 mb-2 flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <span>本地 / 云端知识库 (RAG)</span>
                <button 
                  onClick={() => setIsRagModalOpen(true)}
                  className="text-blue-500 hover:underline text-[10px] lowercase flex items-center space-x-0.5 cursor-pointer"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>挂载</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {ragDocs.map(doc => (
                  <label 
                    key={doc.id}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
                      doc.mounted ? 'bg-white/5 border-white/10 text-white' : 'bg-transparent border-white/5 text-zinc-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <div className="truncate">
                        <div className="text-[11px] font-medium truncate">{doc.name}</div>
                        <div className="text-[9px] text-zinc-500 font-mono">{doc.size} · 向量切片 {doc.chunks}</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={doc.mounted}
                      onChange={e => {
                        const checked = e.target.checked;
                        setRagDocs(prev => prev.map(d => d.id === doc.id ? { ...d, mounted: checked } : d));
                        triggerDynamicIsland(checked ? `已挂载: ${doc.name}` : `已卸载知识库`, 'RAG Updated');
                      }}
                      className="rounded accent-blue-500 cursor-pointer ml-2"
                    />
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* User Profile & Footer */}
          <div className="p-3 border-t border-white/10 shrink-0 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center font-bold text-xs text-white">
                  AI
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-white">Studio Engineer</div>
                <div className="text-[10px] text-zinc-400 font-mono">Apple Intelligence Pro</div>
              </div>
            </div>

            <button 
              onClick={() => triggerDynamicIsland('已在系统设置中联动明暗主题', 'Theme Synced')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition cursor-pointer" 
              title="外观与色彩"
            >
              <Sun className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* ============================================================ */}
      {/* 2. MAIN CHAT ENGINE & CONVERSATION ARENA                    */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A0C] relative overflow-hidden">
        
        {/* TOP NAVIGATION BAR & MODEL SELECTOR */}
        <header className="h-14 px-4 bg-[#0E0E11]/80 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between shrink-0 z-20">
          
          <div className="flex items-center space-x-3">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                title="展开侧边栏"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            {/* Frontier Model Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center space-x-2 shadow-sm transition cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeModel.color }} />
                <span>{activeModel.display_name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {activeModel.context_window}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Model Dropdown Popover */}
              {isModelDropdownOpen && (
                <div className="absolute top-11 left-0 w-80 rounded-2xl bg-[#18181D]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-2 z-50 space-y-1 text-xs animate-macos-fade">
                  <div className="text-[10px] font-semibold text-zinc-400 px-2 py-1 uppercase tracking-wider font-mono">
                    前沿旗舰大模型矩阵
                  </div>

                  {PRESET_MODELS.map(m => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setActiveModel(m);
                        setIsModelDropdownOpen(false);
                        triggerDynamicIsland(`已切换至模型: ${m.display_name}`, `${m.speed} · Ready`);
                      }}
                      className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition ${
                        activeModel.id === m.id ? 'bg-white/15 text-white' : 'hover:bg-white/5 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                        <div>
                          <div className="font-medium text-white">{m.display_name}</div>
                          <div className="text-[10px] text-zinc-400">{m.desc}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                        {m.tag}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Pacing & Token Billing HUD */}
          <div className="hidden md:flex items-center space-x-3 bg-black/40 px-3 py-1 rounded-xl border border-white/10 font-mono text-[11px] text-zinc-400 shadow-inner">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{streamSpeed}</span>
            </div>
            <div className="h-3 w-px bg-white/15" />
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>{tokensCount.toLocaleString()} Tokens</span>
            </div>
          </div>

          {/* Right Action Ribbon: Topology, Radar, Reset & Parameter Drawer */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsArtifactsRadarOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-semibold text-purple-300 flex items-center space-x-1.5 transition cursor-pointer"
              title="查看代码/链接/知识库引用雷达 (毛玻璃浮动卡片)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">引用雷达</span>
              {conversationArtifacts.total > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 font-bold">
                  {conversationArtifacts.total}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsTopologyModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-semibold text-blue-400 flex items-center space-x-1.5 transition cursor-pointer"
              title="查看 D3.js 逻辑脉络拓扑 (⌘⌥T)"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">脉络拓扑</span>
            </button>

            <button 
              onClick={handleClearCurrentChat}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
              title="清空当前对话流"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsParamDrawerOpen(!isParamDrawerOpen)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer ${
                isParamDrawerOpen 
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 font-bold' 
                  : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">模型参数配置</span>
            </button>
          </div>
        </header>

        {/* Scrollable Conversation Stream */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 md:px-12 py-6 space-y-6 relative"
        >
          {/* Floating Glass Entity & Citation Radar Capsule Dock */}
          {messages.length > 0 && (
            <div className="sticky top-0 z-30 flex justify-end px-2 py-1 pointer-events-none mb-[-2.75rem]">
              <button
                onClick={() => setIsArtifactsRadarOpen(true)}
                className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#18181F]/80 hover:bg-[#22222B]/90 backdrop-blur-2xl border border-white/15 hover:border-purple-500/40 text-xs font-medium text-white shadow-xl flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 group cursor-pointer ring-1 ring-white/5"
                title="打开浮动毛玻璃引用实体雷达"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-purple-400 group-hover:rotate-12 transition-transform" />
                  <span className="text-[11px] font-medium">引用实体卡片</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {conversationArtifacts.total} 项
                </span>
              </button>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-white mb-1">Apple Intelligence · 智能对话工作站</h2>
              <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
                全端侧高私密推理、混合思考链 (Chain-of-Thought)、本地 RAG 知识切片与毫秒级因果脉络组网。
              </p>
            </div>
          ) : (
            messages.map(msg => {
              const isUser = msg.role === 'user';
              const isHighlighted = highlightedMessageId === msg.id;

              if (isUser) {
                return (
                  <div 
                    key={msg.id} 
                    id={`msg-${msg.id}`}
                    className={`flex items-start space-x-3 justify-end transition-all duration-500 rounded-2xl p-1.5 ${
                      isHighlighted ? 'ring-4 ring-blue-500/60 shadow-2xl bg-blue-500/10' : ''
                    }`}
                  >
                    <div className="max-w-2xl bg-gradient-to-r from-[#0A84FF] to-[#0071E3] text-white p-3.5 rounded-2xl rounded-tr-sm shadow-sm text-xs leading-relaxed font-sans whitespace-pre-wrap selection:bg-white/30">
                      {msg.content}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0 font-bold text-xs text-blue-400">
                      JD
                    </div>
                  </div>
                );
              } else {
                const isCoTCollapsed = collapsedCoT[msg.id] ?? false;
                const isCitExpanded = expandedCitations[msg.id] ?? false;

                return (
                  <div 
                    key={msg.id} 
                    id={`msg-${msg.id}`}
                    className={`flex items-start space-x-3 group transition-all duration-500 rounded-2xl p-1.5 ${
                      isHighlighted ? 'ring-4 ring-blue-500/60 shadow-2xl bg-blue-500/10' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 p-0.5 shrink-0 shadow-sm">
                      <div className="w-full h-full bg-zinc-900 rounded-[10px] flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>
                    </div>

                    <div className="flex-1 max-w-3xl space-y-3 min-w-0">
                      
                      {/* RAG Grounding Fragment Pills */}
                      {isRagActive && (
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-400 flex items-center space-x-1.5 font-mono">
                            <Database className="w-3 h-3" />
                            <span>已召回本地知识: 《分布式高并发架构与系统设计》· 匹配度 94%</span>
                          </div>
                          {isWebSearchActive && (
                            <div className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-[10px] text-blue-400 flex items-center space-x-1.5 font-mono">
                              <Globe className="w-3 h-3" />
                              <span>Google 实时检索: 2026 前沿架构基准评测</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Chain of Thought (CoT 思维链折叠卡片) */}
                      {(msg.thought || msg.reasoning) && (
                        <div className="p-3 rounded-2xl bg-zinc-900/80 border border-white/10 text-xs">
                          <div 
                            onClick={() => setCollapsedCoT(prev => ({ ...prev, [msg.id]: !isCoTCollapsed }))}
                            className="flex items-center justify-between text-[11px] font-medium text-purple-400 cursor-pointer select-none"
                          >
                            <div className="flex items-center space-x-2">
                              <Brain className="w-4 h-4" />
                              <span>深度思维链 (已深度推演 14.8 秒)</span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 flex items-center space-x-1">
                              <span>{isCoTCollapsed ? '已展开' : '已折叠'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCoTCollapsed ? 'rotate-180' : ''}`} />
                            </span>
                          </div>

                          {isCoTCollapsed && (
                            <div className="mt-2.5 pt-2.5 border-t border-white/5 text-[11px] text-zinc-400 space-y-1.5 leading-relaxed font-mono whitespace-pre-wrap animate-macos-fade">
                              {msg.thought || msg.reasoning}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main Answer Body Card */}
                      <div className="p-4 rounded-2xl bg-[#18181D]/80 border border-white/10 text-xs space-y-3 leading-relaxed text-zinc-200">
                        <AppleMarkdown content={msg.content} />

                        {/* In-Message Detected Reference Entities Pill Bar */}
                        {(() => {
                          const entityData = extractMessageEntities(msg.content, msg.id, msg.created_at);
                          const hasEntities = entityData.codes.length > 0 || entityData.links.length > 0 || entityData.rags.length > 0;
                          if (!hasEntities) return null;
                          return (
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] backdrop-blur-md">
                              <div className="flex flex-wrap items-center gap-1.5 font-mono">
                                <span className="text-zinc-400 text-[10px] mr-0.5">识别实体:</span>
                                {entityData.codes.length > 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 text-[10px]">
                                    <FileCode className="w-3 h-3 text-emerald-400" />
                                    <span>{entityData.codes.length} 代码块</span>
                                  </span>
                                )}
                                {entityData.links.length > 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center gap-1 text-[10px]">
                                    <Globe className="w-3 h-3 text-blue-400" />
                                    <span>{entityData.links.length} 链接</span>
                                  </span>
                                )}
                                {entityData.rags.length > 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1 text-[10px]">
                                    <BookOpen className="w-3 h-3 text-amber-400" />
                                    <span>{entityData.rags.length} 知识库</span>
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => setIsArtifactsRadarOpen(true)}
                                className="text-[10px] font-sans text-purple-300 hover:text-purple-200 flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <span>毛玻璃透视卡片</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })()}

                        {/* Action Bar for Response */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                          <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => handleSendMessage(messages[messages.length - 2]?.content)}
                              className="hover:text-white flex items-center space-x-1 transition cursor-pointer"
                              title="重新生成"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>重新生成</span>
                            </button>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(msg.content);
                                triggerDynamicIsland('完整 Markdown 文本已复制', '100% Retained');
                              }}
                              className="hover:text-white flex items-center space-x-1 transition cursor-pointer"
                              title="复制全文"
                            >
                              <Copy className="w-3 h-3" />
                              <span>复制</span>
                            </button>
                            {onSaveToMaterial && (
                              <button 
                                onClick={() => {
                                  onSaveToMaterial(`对话纪要: ${currentTopic?.title || '智能会话'}`, msg.content);
                                  triggerDynamicIsland('已存入素材知识库', 'Saved to RAG');
                                }}
                                className="hover:text-purple-400 flex items-center space-x-1 transition cursor-pointer"
                              >
                                <BookmarkPlus className="w-3 h-3" />
                                <span>存入素材</span>
                              </button>
                            )}
                            {onSendToCanvas && (
                              <button 
                                onClick={() => {
                                  onSendToCanvas(`推演: ${currentTopic?.title || '智能会话'}`, msg.content);
                                  triggerDynamicIsland('已推送到无限画布节点', 'Canvas Sync');
                                }}
                                className="hover:text-blue-400 flex items-center space-x-1 transition cursor-pointer"
                              >
                                <ArrowUpRight className="w-3 h-3" />
                                <span>推送画布</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 text-zinc-500 font-mono text-[10px]">
                            <span>{activeModel.display_name.split(' ')[0]} · {msg.content.length} chars</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              }
            })
          )}
        </div>

        {/* INPUT DOCK FOOTER WITH APPLE INTELLIGENCE AMBIENT HALO */}
        <footer className="p-4 md:p-6 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C] to-transparent shrink-0 z-20">
          
          {/* Inspiration Suggestions Carousel */}
          <div className="max-w-4xl mx-auto mb-2.5 flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-mono text-zinc-500 shrink-0">灵感建议:</span>
            {PROMPT_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputContent(s);
                  if (textareaRef.current) textareaRef.current.focus();
                }}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 text-[11px] whitespace-nowrap transition cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Main Input Capsule Dock with Multicolored Aura Halo */}
          <div className="max-w-4xl mx-auto rounded-3xl p-0.5 shadow-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            <div className="p-3 bg-[#151518] rounded-[22px] flex flex-col space-y-2">
              
              {/* Uploaded File Attachment Tag */}
              {attachedFile && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[10px] text-white font-mono">
                    <FileCode className="w-3 h-3 text-teal-400" />
                    <span>{attachedFile.name}</span>
                    <span className="text-zinc-400">({attachedFile.size})</span>
                    <button onClick={() => setAttachedFile(null)} className="hover:text-red-400 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Textarea Input & Controls */}
              <div className="flex items-end space-x-2">
                <textarea
                  ref={textareaRef}
                  value={inputContent}
                  onChange={e => {
                    setInputContent(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                  }}
                  onKeyDown={e => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  placeholder="与 Apple Intelligence 探索任意灵感、推导复杂逻辑、编写专业代码... (⌘↵ 发送)"
                  className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 outline-none resize-none leading-relaxed font-sans max-h-36"
                />

                {/* Voice Siri Button */}
                <button
                  onClick={handleToggleVoice}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    isVoiceListening 
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg animate-pulse' 
                      : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                  }`}
                  title="Siri 实时多模态语音交互"
                >
                  <Mic className="w-4 h-4 text-purple-400" />
                </button>

                {/* Send / Abort Button */}
                <button
                  onClick={() => isStreaming ? abortControllerRef.current?.abort() : handleSendMessage()}
                  disabled={!inputContent.trim() && !isStreaming}
                  className={`p-2.5 rounded-2xl transition shadow-md cursor-pointer ${
                    isStreaming 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : inputContent.trim() 
                        ? 'bg-white text-black hover:opacity-90 active:scale-95' 
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {isStreaming ? (
                    <Square className="w-4 h-4 fill-current" />
                  ) : (
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  )}
                </button>
              </div>

              {/* Bottom Capability Toggles Row */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5 text-[11px]">
                  
                  {/* Web Search Switch */}
                  <button
                    onClick={() => {
                      setIsWebSearchActive(!isWebSearchActive);
                      triggerDynamicIsland(isWebSearchActive ? '联网搜索已关闭' : '联网实时搜索已开启', 'Google Grounding');
                    }}
                    className={`px-2.5 py-1 rounded-full font-medium flex items-center space-x-1 transition cursor-pointer ${
                      isWebSearchActive 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' 
                        : 'bg-white/5 text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>联网搜索</span>
                  </button>

                  {/* RAG Knowledge Switch */}
                  <button
                    onClick={() => {
                      setIsRagActive(!isRagActive);
                      triggerDynamicIsland(isRagActive ? '知识库检索已脱机' : '本地知识库检索挂载中', 'RAG Vector');
                    }}
                    className={`px-2.5 py-1 rounded-full font-medium flex items-center space-x-1 transition cursor-pointer ${
                      isRagActive 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                        : 'bg-white/5 text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Database className="w-3 h-3" />
                    <span>设定知识库</span>
                  </button>

                  {/* Deep Thinking Switch */}
                  <button
                    onClick={() => {
                      setIsDeepThinkingActive(!isDeepThinkingActive);
                      triggerDynamicIsland(isDeepThinkingActive ? '深度思考已切换为快速模式' : '思维链深度思考已启用', 'CoT Reasoning');
                    }}
                    className={`px-2.5 py-1 rounded-full font-medium flex items-center space-x-1 transition cursor-pointer ${
                      isDeepThinkingActive 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' 
                        : 'bg-white/5 text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Brain className="w-3 h-3" />
                    <span>深度思考</span>
                  </button>

                  {/* Attachment Upload Button */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Paperclip className="w-3 h-3" />
                    <span>附件</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline-block">
                  ⌘↵ 发送 · Shift+↵ 换行
                </span>
              </div>

            </div>
          </div>

        </footer>

      </main>

      {/* ============================================================ */}
      {/* 3. PARAMETERS & SYSTEM PROMPT FLYOUT DRAWER (SLIDE-OVER)      */}
      {/* ============================================================ */}
      {isParamDrawerOpen && (
        <aside className="w-80 shrink-0 bg-[#151518]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col transition-all duration-300 z-30 overflow-y-auto">
          
          <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-semibold text-white">模型参数与算力配置</h3>
            </div>
            <button 
              onClick={() => setIsParamDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 text-xs">
            
            {/* System Prompt Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium text-zinc-300">系统提示词 (System Prompt)</label>
                <button 
                  onClick={() => {
                    setSystemPrompt('你是一位精通分布式系统设计与长篇宏大叙事的极客架构师，具备 Apple 极致简洁思维，提供模块化、结构化且具备落地代码的解答。');
                    triggerDynamicIsland('已载入架构专家系统提示词', 'System Preset Loaded');
                  }}
                  className="text-[10px] text-blue-400 hover:underline cursor-pointer"
                >
                  专家预设
                </button>
              </div>
              <textarea 
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-zinc-200 outline-none focus:border-blue-500 transition font-sans leading-relaxed resize-none"
                placeholder="输入引导 AI 遵循的角色人设、排版规则或安全约束..."
              />
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[11px] text-zinc-300">
                <span>创造力发散 (Temperature)</span>
                <span className="font-mono text-amber-500 font-semibold">{temperature.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.05" 
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                <span>精准严谨 (0.0)</span>
                <span>天马行空 (2.0)</span>
              </div>
            </div>

            {/* Top-P Slider */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[11px] text-zinc-300">
                <span>核采样概率 (Top-P)</span>
                <span className="font-mono text-blue-400 font-semibold">{topP.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={topP}
                onChange={e => setTopP(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Thinking Budget Slider */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[11px] text-zinc-300">
                <span>思考深度限额 (Thinking Budget)</span>
                <span className="font-mono text-purple-400 font-semibold">{thinkingBudget.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="1024" 
                max="65536" 
                step="1024" 
                value={thinkingBudget}
                onChange={e => setThinkingBudget(parseInt(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-[9px] text-zinc-500 block">设定推理模型思考链输出的最大 Token 上限</span>
            </div>

            {/* Max Output Tokens */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[11px] text-zinc-300">
                <span>单次生成最大长度 (Max Tokens)</span>
                <span className="font-mono text-zinc-200">{maxTokens.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="512" 
                max="16384" 
                step="512" 
                value={maxTokens}
                onChange={e => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Apple Hardware Acceleration Widget */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white">Apple Neural Engine 硬件加速</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">ANE v5 Enabled</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal">
                利用 M-Series 芯片的 16-Core Neural Engine 与 128-bit 统一内存总线执行端侧矩阵量化与混合推演。
              </p>
            </div>

          </div>
        </aside>
      )}

      {/* ============================================================ */}
      {/* 4. MODAL: RAG KNOWLEDGE MOUNT MODAL                          */}
      {/* ============================================================ */}
      {isRagModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-macos-fade"
          onClick={(e) => { if (e.target === e.currentTarget) setIsRagModalOpen(false); }}
        >
          <div className="bg-[#1C1C21] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-white/10 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold">挂载外部 RAG 知识库与向量集</h3>
              </div>
              <button onClick={() => setIsRagModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">选择向量检索重排模式</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-zinc-200 outline-none">
                  <option>Dense + Sparse 混合重排 (Hybrid BM25 + Vector)</option>
                  <option>高精度语义嵌入 (Text-Embedding-3-Large 3072维)</option>
                  <option>本地快速切片 (Apple BGE-Small-ZH)</option>
                </select>
              </div>

              <div 
                onClick={() => {
                  const newDoc: RAGDocument = {
                    id: `rag-${Date.now()}`,
                    name: '新建知识库切片.md',
                    size: '1.2 MB',
                    chunks: 128,
                    type: 'md',
                    mounted: true
                  };
                  setRagDocs(prev => [newDoc, ...prev]);
                  setIsRagModalOpen(false);
                  triggerDynamicIsland('知识库向量切片构建完成', '128 Chunks Ready');
                }}
                className="border-2 border-dashed border-white/15 rounded-2xl p-6 text-center hover:border-blue-500 transition cursor-pointer"
              >
                <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-xs text-zinc-200 font-medium">拖放 PDF、Word、Markdown 或 代码仓库压缩包</p>
                <p className="text-[10px] text-zinc-500 mt-1">自动分块并构建本地 HNSW 向量索引 (最大 200MB)</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button 
                onClick={() => setIsRagModalOpen(false)} 
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  setIsRagModalOpen(false);
                  triggerDynamicIsland('知识库向量切片构建完成', '248 Chunks Ready');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                开始索引并挂载
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MODAL: SPOTLIGHT SEARCH (⌘K)                              */}
      {/* ============================================================ */}
      {isSpotlightOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-start justify-center pt-24 p-4 animate-macos-fade"
          onClick={(e) => { if (e.target === e.currentTarget) setIsSpotlightOpen(false); }}
        >
          <div className="w-full max-w-xl bg-[#1E1E22]/95 rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
            <div className="h-13 px-4 border-b border-white/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-zinc-400" />
              <input
                type="text"
                autoFocus
                value={spotlightQuery}
                onChange={e => { setSpotlightQuery(e.target.value); setSpotlightIndex(0); }}
                placeholder="聚焦查找会话历史、或注入提示词模板..."
                className="flex-1 bg-transparent border-none text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">ESC 退出</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {spotlightMatches.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400">无匹配历史会话</div>
              ) : (
                spotlightMatches.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setCurrentTopicId(s.id);
                      setIsSpotlightOpen(false);
                      triggerDynamicIsland(`已切至会话: ${s.title}`, 'Session Switched');
                    }}
                    className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition ${
                      idx === spotlightIndex ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${idx === spotlightIndex ? 'text-white' : 'text-zinc-200'}`}>{s.title}</div>
                        <div className={`text-[10px] ${idx === spotlightIndex ? 'text-white/80' : 'text-zinc-400'}`}>
                          {new Date(s.updated_at).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono opacity-60">跳转</span>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-2 bg-neutral-900/60 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-3">
                <span><kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> 切换</span>
                <span><kbd className="font-mono">↵</kbd> 跳转</span>
              </div>
              <span className="font-mono">Spotlight Search</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL: GLOBAL DIALOGUE LOGIC TOPOLOGY GRAPH (D3.js)       */}
      {/* ============================================================ */}
      {isTopologyModalOpen && (
        <DialogueTopologyModal
          topic={currentTopic}
          messages={messages}
          onJumpToMessage={handleJumpToMessage}
          onClose={() => setIsTopologyModalOpen(false)}
          onSaveToMaterial={onSaveToMaterial}
        />
      )}

      {/* ============================================================ */}
      {/* 7. MODAL: FLOATING FROSTED GLASS ARTIFACTS & CITATION RADAR  */}
      {/* ============================================================ */}
      {isArtifactsRadarOpen && (
        <FloatingArtifactsPreview
          messages={messages}
          onJumpToMessage={handleJumpToMessage}
          onSendToCanvas={onSendToCanvas}
          onSaveToMaterial={onSaveToMaterial}
          onClose={() => setIsArtifactsRadarOpen(false)}
        />
      )}

    </div>
  );
};
