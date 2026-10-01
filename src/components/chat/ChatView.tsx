import React, { useState, useEffect, useRef } from 'react';
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
  BookMarked, 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  SlidersHorizontal, 
  X, 
  MessageSquare, 
  ArrowUp, 
  Cpu, 
  Layers, 
  RotateCcw, 
  Compass, 
  BookOpen, 
  Code2, 
  ChevronRight, 
  ArrowDown,
  ThumbsUp,
  ThumbsDown,
  Share2,
  BookmarkPlus,
  Paperclip,
  Wand2,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { AppleMarkdown } from './AppleMarkdown.tsx';
import { ChatInspector } from './ChatInspector.tsx';

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
}

interface Message {
  id: string;
  topic_id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  reasoning?: string;
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
  context_window: number;
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

const STARTER_PROMPTS = [
  {
    icon: BookOpen,
    title: '长篇小说架构与伏笔铺垫',
    desc: '规划开篇三章的戏剧冲突升级脉络与关键人物秘密动机',
    prompt: '请为一部长篇仙侠/科幻小说规划开篇前三章的剧情推进脉络，要求明确主角的内在缺陷、突发危机与生死抉择，埋下首尾呼应的暗线伏笔。',
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-400'
  },
  {
    icon: Sparkles,
    title: '文风校对与去 AI 腔润色',
    desc: '铲除总结式说教与现代出戏词汇，强化现场感与动词张力',
    prompt: '请对以下文本进行文学级审校润色，铲除总结式陈词滥调与过度使用的AI套话，增强文字的动词精准度与现场感：',
    color: 'from-purple-500/20 to-pink-500/20 text-purple-400'
  },
  {
    icon: Compass,
    title: '前沿技术全网检索与事实溯源',
    desc: '结合权威学术文献与行业事实进行严谨求证',
    prompt: '请综合权威行业报告与技术文献，深入拆解端侧 AI 模型蒸馏与量化推理加速的核心工程落地路线。',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400'
  },
  {
    icon: Code2,
    title: '百万级知识引擎架构推演',
    desc: '设计本地向量检索与全文搜索混合存储的高性能方案',
    prompt: '针对个人桌面端海量知识条目与大文本检索，设计一套保证极低延迟、低内存占用的混合检索与持久化存储架构。',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400'
  }
];

export const ChatView: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicId, setCurrentTopicId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeReasoning, setActiveReasoning] = useState<Record<string, boolean>>({});
  const [tokenBreakdown, setTokenBreakdown] = useState<TokenBreakdown | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // Deep Thinking toggle state
  const [isDeepThinkActive, setIsDeepThinkActive] = useState(true);

  // Inspector & Sidebars
  const [showInspector, setShowInspector] = useState(false);
  const [availableMaterials, setAvailableMaterials] = useState<any[]>([]);
  const [topicMaterials, setTopicMaterials] = useState<string[]>([]);
  const [showTokenDetail, setShowTokenDetail] = useState(false);

  // Scroll to bottom tracking
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchTopics();
    fetchModels();
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (currentTopicId) {
      fetchMessages(currentTopicId);
      fetchContextBreakdown(currentTopicId);
      fetchTopicMaterials(currentTopicId);
    }
  }, [currentTopicId]);

  const currentTopic = topics.find(t => t.id === currentTopicId);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/topics');
      const data = await res.json();
      setTopics(data);
      if (data.length > 0 && !currentTopicId) {
        setCurrentTopicId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setModels(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      setAvailableMaterials(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTopicMaterials = async (topicId: string) => {
    try {
      const res = await fetch(`/api/topics/${topicId}/materials`);
      const data = await res.json();
      setTopicMaterials(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (topicId: string) => {
    try {
      const res = await fetch(`/api/topics/${topicId}/messages`);
      const data = await res.json();
      setMessages(data);
      scrollToBottom();
    } catch (e) {
      console.error(e);
    }
  };

  const fetchContextBreakdown = async (topicId: string) => {
    try {
      const res = await fetch(`/api/topics/${topicId}/context`);
      const data = await res.json();
      setTokenBreakdown(data.breakdown);
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!atBottom);
  };

  const handleCreateTopic = async () => {
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '新探索对话' })
      });
      const data = await res.json();
      await fetchTopics();
      setCurrentTopicId(data.id);
      setTimeout(() => textareaRef.current?.focus(), 100);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTopic = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除该话题吗？历史记录将永久清除。')) return;
    try {
      await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      const nextTopics = topics.filter(t => t.id !== id);
      setTopics(nextTopics);
      if (currentTopicId === id && nextTopics.length > 0) {
        setCurrentTopicId(nextTopics[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePinTopic = async (topic: Topic, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPinned = topic.pinned ? 0 : 1;
    await fetch(`/api/topics/${topic.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: newPinned })
    });
    fetchTopics();
  };

  const handleToggleWebSearch = async () => {
    if (!currentTopic) return;
    const newSearch = currentTopic.web_search ? 0 : 1;
    await fetch(`/api/topics/${currentTopic.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ web_search: newSearch })
    });
    setTopics(topics.map(t => t.id === currentTopic.id ? { ...t, web_search: newSearch } : t));
  };

  const handleChangeModel = async (modelId: string) => {
    if (!currentTopic) return;
    await fetch(`/api/topics/${currentTopic.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_id: modelId })
    });
    setTopics(topics.map(t => t.id === currentTopic.id ? { ...t, model_id: modelId } : t));
    fetchContextBreakdown(currentTopic.id);
  };

  const handleToggleMaterialLink = async (matId: string, shouldLink: boolean) => {
    if (!currentTopicId) return;
    try {
      if (shouldLink) {
        await fetch('/api/materials/link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ materialId: matId, targetType: 'topic', targetId: currentTopicId })
        });
        setTopicMaterials(prev => [...prev, matId]);
      } else {
        await fetch('/api/materials/unlink', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ materialId: matId, targetType: 'topic', targetId: currentTopicId })
        });
        setTopicMaterials(prev => prev.filter(id => id !== matId));
      }
      fetchContextBreakdown(currentTopicId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSystemPrompt = async (prompt: string) => {
    if (!currentTopicId) return;
    try {
      await fetch(`/api/topics/${currentTopicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_prompt: prompt })
      });
      setTopics(topics.map(t => t.id === currentTopicId ? { ...t, system_prompt: prompt } : t));
      fetchContextBreakdown(currentTopicId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputContent.trim();
    if (!textToSend || isStreaming || !currentTopicId) return;

    // Dispatch global event for live sync in D3 graph
    window.dispatchEvent(new CustomEvent('app:chat-message-generated', { 
      detail: { text: textToSend } 
    }));

    if (!customPrompt) setInputContent('');

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      topic_id: currentTopicId,
      role: 'user',
      content: textToSend,
      created_at: Date.now()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    scrollToBottom();

    const tempAssistantId = `temp-asst-${Date.now()}`;
    const tempAssistantMsg: Message = {
      id: tempAssistantId,
      topic_id: currentTopicId,
      role: 'assistant',
      content: '',
      reasoning: '',
      created_at: Date.now()
    };
    setMessages(prev => [...prev, tempAssistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`/api/topics/${currentTopicId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textToSend,
          modelId: currentTopic?.model_id
        }),
        signal: controller.signal
      });

      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const matchEvent = block.match(/^event:\s*(\w+)/m);
          const matchData = block.match(/^data:\s*(.*)/m);
          if (matchData) {
            try {
              const eventType = matchEvent ? matchEvent[1] : 'message';
              const payload = JSON.parse(matchData[1]);

              if (eventType === 'delta') {
                setMessages(prev => prev.map(m => 
                  m.id === tempAssistantId ? { ...m, content: m.content + payload.text } : m
                ));
                scrollToBottom();
              } else if (eventType === 'reasoning') {
                setMessages(prev => prev.map(m => 
                  m.id === tempAssistantId ? { ...m, reasoning: (m.reasoning || '') + payload.text } : m
                ));
              } else if (eventType === 'citations') {
                setMessages(prev => prev.map(m => 
                  m.id === tempAssistantId ? { ...m, citations: JSON.stringify(payload) } : m
                ));
              } else if (eventType === 'message_end') {
                setMessages(prev => prev.map(m => 
                  m.id === tempAssistantId ? { ...m, id: payload.id, content: payload.content } : m
                ));
              }
            } catch (err) {
              console.error('SSE parse error:', err);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Chat stream error:', err);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
      fetchContextBreakdown(currentTopicId);
      fetchTopics();
    }
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTopics = topics.filter(t => 
    !searchQuery.trim() || t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--apple-bg)] select-none text-[var(--apple-text-primary)]">
      {/* ============================================================ */}
      {/* 1. LEFT TOPIC DRAWER (Gemini Clean Sidebar) */}
      {/* ============================================================ */}
      <aside className="w-68 border-r border-[var(--apple-border)] bg-[var(--apple-surface)]/60 backdrop-blur-2xl flex flex-col shrink-0 select-none">
        {/* New Chat Button */}
        <div className="p-3 border-b border-[var(--apple-separator)]">
          <button
            onClick={handleCreateTopic}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-[var(--apple-subtle)] hover:bg-[var(--apple-surface)] border border-[var(--apple-border)] text-xs font-semibold text-[var(--apple-text-primary)] transition-all flex items-center justify-between shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] flex items-center justify-center text-white text-[10px] font-bold shadow-2xs">
                ✨
              </div>
              <span>开启新探索会话</span>
            </div>
            <Plus className="w-3.5 h-3.5 text-[var(--apple-text-tertiary)] group-hover:text-[var(--apple-text-primary)]" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-[var(--apple-separator)]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--apple-text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索历史会话..."
              className="w-full pl-8 pr-3 py-1.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-xs text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] focus:outline-none focus:border-[var(--apple-accent)] shadow-2xs"
            />
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredTopics.map(topic => {
            const isActive = currentTopicId === topic.id;
            return (
              <div
                key={topic.id}
                onClick={() => setCurrentTopicId(topic.id)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isActive
                    ? 'bg-[var(--apple-surface)] border-[var(--apple-border-strong)] shadow-xs font-semibold text-[var(--apple-text-primary)]'
                    : 'border-transparent text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)]/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#4285f4]' : 'text-[var(--apple-text-tertiary)]'}`} />
                  <span className="text-xs truncate">{topic.title}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleTogglePinTopic(topic, e)}
                    className="p-1 text-[var(--apple-text-tertiary)] hover:text-amber-400 rounded"
                    title={topic.pinned ? '取消置顶' : '置顶'}
                  >
                    <Pin className={`w-3 h-3 ${topic.pinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteTopic(topic.id, e)}
                    className="p-1 text-[var(--apple-text-tertiary)] hover:text-rose-400 rounded"
                    title="删除会话"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CHAT WORKSPACE (Gemini Aesthetic Experience) */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Minimal Bar */}
        <header className="h-14 border-b border-[var(--apple-border)] bg-[var(--apple-glass)] backdrop-blur-2xl px-6 flex items-center justify-between shrink-0 z-20 select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Gemini Multi-Color Gradient Icon */}
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] flex items-center justify-center text-white shadow-xs font-bold text-xs shrink-0">
              ✦
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-[var(--apple-text-primary)] truncate max-w-sm">
                {currentTopic?.title || '新探索会话'}
              </h2>
              <p className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">
                Gemini 2.5 Flash Dual-Engine · 端侧知识图谱协同
              </p>
            </div>
          </div>

          {/* Model Selector & Inspector Pill */}
          <div className="flex items-center gap-2">
            <select
              value={currentTopic?.model_id || 'gemini-2.5-flash'}
              onChange={e => handleChangeModel(e.target.value)}
              className="bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-xs px-3 py-1.5 font-bold text-[var(--apple-text-primary)] focus:outline-none shadow-2xs"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (极速响应)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (深度推理)</option>
              <option value="deepseek-r1">DeepSeek-R1 (纯本地脱网 70B)</option>
            </select>

            <button
              onClick={() => setShowInspector(prev => !prev)}
              className={`p-2 rounded-xl border transition-all text-xs ${
                showInspector
                  ? 'bg-[var(--apple-accent)] text-white border-[var(--apple-accent)] shadow-xs'
                  : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
              }`}
              title="查看知识库关联与上下文调试"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Message Stream Viewport */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-8 space-y-6 select-text flex justify-center"
        >
          <div className="w-full max-w-3xl space-y-6">
            {/* Empty State: Gemini Iconic Welcoming Screen */}
            {messages.length === 0 && (
              <div className="py-12 text-center space-y-8 select-none animate-in fade-in duration-300">
                {/* Large Gemini Glow Sparkle */}
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] flex items-center justify-center text-white text-2xl shadow-2xl mx-auto shadow-purple-500/20">
                  ✦
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    你好，有什么我可以帮你的吗？
                  </h1>
                  <p className="text-xs text-[var(--apple-text-secondary)] max-w-md mx-auto leading-relaxed">
                    基于 Gemini 深度推理引擎与本地知识图谱，随时为你创作大纲、推演剧情或解析技术文献。
                  </p>
                </div>

                {/* Gemini Bento Quick Starter Cards */}
                <div className="grid grid-cols-2 gap-3 text-left max-w-2xl mx-auto pt-2">
                  {STARTER_PROMPTS.map((starter, idx) => {
                    const IconComp = starter.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSendMessage(starter.prompt)}
                        className="p-4 rounded-3xl bg-[var(--apple-surface)] border border-[var(--apple-border)] hover:border-[var(--apple-border-strong)] transition-all cursor-pointer shadow-xs space-y-2 group hover:scale-[1.01]"
                      >
                        <div className={`w-8 h-8 rounded-2xl bg-gradient-to-br ${starter.color} flex items-center justify-center`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[var(--apple-text-primary)] group-hover:text-[var(--apple-accent)] transition-colors">
                            {starter.title}
                          </h4>
                          <p className="text-[11px] text-[var(--apple-text-tertiary)] line-clamp-2 leading-relaxed">
                            {starter.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Render Messages */}
            {messages.map((msg, index) => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end animate-in fade-in">
                    <div className="max-w-2xl px-5 py-3 rounded-3xl bg-[var(--apple-surface)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] leading-relaxed shadow-xs">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              }

              if (msg.role === 'assistant') {
                return (
                  <div key={msg.id} className="flex items-start gap-3 animate-in fade-in group">
                    {/* Gemini Star Avatar */}
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0 mt-1">
                      ✦
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                      {/* Collapsible Gemini Thinking Process (CoT) */}
                      {msg.reasoning && (
                        <div className="p-3 rounded-2xl bg-[var(--apple-subtle)]/70 border border-[var(--apple-border)] space-y-1.5 text-xs">
                          <button
                            onClick={() => setActiveReasoning(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                            className="flex items-center gap-1.5 text-xs font-bold text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
                          >
                            <Brain className="w-3.5 h-3.5 text-purple-400" />
                            <span>深度思考过程</span>
                            {activeReasoning[msg.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {activeReasoning[msg.id] && (
                            <div className="text-[11px] font-mono text-[var(--apple-text-tertiary)] leading-relaxed pt-1 border-t border-[var(--apple-separator)] whitespace-pre-wrap">
                              {msg.reasoning}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main Assistant Content Markdown */}
                      <div className="text-xs text-[var(--apple-text-primary)] leading-relaxed">
                        <AppleMarkdown content={msg.content} />
                      </div>

                      {/* Bottom Action Pill Toolbar (Gemini Clean Actions) */}
                      <div className="flex items-center gap-2 pt-1 text-[var(--apple-text-tertiary)] select-none">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1.5 rounded-lg hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-all flex items-center gap-1 text-[10px]"
                          title="复制回答"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === msg.id ? '已复制' : '复制'}</span>
                        </button>

                        <button
                          onClick={() => setLikedMap(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                          className={`p-1.5 rounded-lg hover:bg-[var(--apple-subtle)] transition-all ${
                            likedMap[msg.id] ? 'text-[#4285f4]' : 'hover:text-[var(--apple-text-primary)]'
                          }`}
                          title="好评"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (onSaveToMaterial) onSaveToMaterial(`对话摘录: ${msg.content.slice(0, 20)}`, msg.content);
                          }}
                          className="p-1.5 rounded-lg hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-all flex items-center gap-1 text-[10px]"
                          title="存入素材知识库"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>收录</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. GEMINI FLOATING PROMPT CAPSULE INPUT BOX */}
        {/* ============================================================ */}
        <div className="p-4 flex justify-center shrink-0 z-20">
          <div className="w-full max-w-3xl rounded-3xl bg-[var(--apple-surface)]/95 border border-[var(--apple-border-strong)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl p-3 space-y-2">
            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              value={inputContent}
              onChange={e => setInputContent(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={2}
              placeholder="向 Gemini 提问，输入任何问题、小说灵感或技术需求..."
              className="w-full px-3 py-1 bg-transparent text-xs text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] focus:outline-none resize-none leading-relaxed"
            />

            {/* Bottom Capsule Control Row */}
            <div className="flex items-center justify-between pt-1 border-t border-[var(--apple-separator)]">
              {/* Left Action Chips: Deep Think / Web Search */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsDeepThinkActive(prev => !prev)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1 border ${
                    isDeepThinkActive
                      ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                      : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)]'
                  }`}
                >
                  <Brain className="w-3 h-3 text-purple-400" />
                  <span>深度思考</span>
                </button>

                <button
                  onClick={handleToggleWebSearch}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all flex items-center gap-1 border ${
                    currentTopic?.web_search
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)]'
                  }`}
                >
                  <Globe className="w-3 h-3 text-blue-400" />
                  <span>全网检索</span>
                </button>
              </div>

              {/* Right Send / Stop Button */}
              <div>
                {isStreaming ? (
                  <button
                    onClick={handleStopStream}
                    className="p-2 rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition-all"
                    title="停止生成"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputContent.trim()}
                    className="p-2 rounded-full bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] text-white shadow-md hover:opacity-90 transition-all disabled:opacity-30"
                    title="发送指令"
                  >
                    <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Inspector Flyout */}
        {showInspector && (
          <div className="absolute right-0 top-14 bottom-0 w-80 bg-[var(--apple-surface)]/98 backdrop-blur-3xl border-l border-[var(--apple-border-strong)] p-5 z-40 animate-in fade-in slide-in-from-right-2 duration-150">
            <ChatInspector
              topic={currentTopic || null}
              tokenBreakdown={tokenBreakdown}
              availableMaterials={availableMaterials}
              topicMaterials={topicMaterials}
              onToggleMaterial={handleToggleMaterialLink}
              onUpdateSystemPrompt={handleUpdateSystemPrompt}
              onClose={() => setShowInspector(false)}
            />
          </div>
        )}
      </main>
    </div>
  );
};
