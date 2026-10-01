import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MessageSquare, 
  Bot, 
  Compass, 
  BookOpen, 
  StickyNote, 
  Layout, 
  Image as ImageIcon, 
  Presentation, 
  Palette, 
  Video, 
  Mic2, 
  BarChart3, 
  TrendingUp, 
  FolderGit2, 
  Sliders, 
  Plus, 
  FileDown, 
  Sparkles, 
  Moon, 
  Sun, 
  PanelLeft, 
  CornerDownLeft, 
  X,
  Zap,
  CheckCircle2,
  Scale,
  Brain,
  SlidersHorizontal,
  Bookmark,
  Pin
} from 'lucide-react';
import { MainTab } from './AppSidebar.tsx';

export interface CommandItem {
  id: string;
  type: 'action' | 'navigation';
  title: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  keywords: string[];
  run: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onNewChat: () => void;
  onAnalyzeMaterials: () => void;
  onExportContent: () => void;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  theme: 'dark' | 'light' | 'sepia';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onNewChat,
  onAnalyzeMaterials,
  onExportContent,
  onToggleTheme,
  onToggleSidebar,
  theme
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'action' | 'navigation'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [pinnedCommandIds, setPinnedCommandIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pinned_ai_commands');
      return saved ? JSON.parse(saved) : ['cmd-expand', 'cmd-refactor', 'cmd-1'];
    } catch {
      return ['cmd-expand', 'cmd-refactor', 'cmd-1'];
    }
  });

  // Listen for storage events (when pinned status updates in AICommandsView)
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('pinned_ai_commands');
        if (saved) setPinnedCommandIds(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Built-in AI Shortcut dictionary
  const aiShortcutRegistry: Record<string, { title: string; desc: string; keywords: string[] }> = {
    'cmd-expand': {
      title: '⚡ 扩写文本 (Expand & Enrich Text)',
      desc: '沉浸式细节扩写 · 丰富场景感官描写 · 微动作与心理博弈补充',
      keywords: ['扩写', '丰富', 'expand', '润色', '细节', '描写']
    },
    'cmd-refactor': {
      title: '⚡ 代码重构与类型补全 (Code Refactoring)',
      desc: '遵循 TypeScript / React 规范 · 严格类型补齐 · 消除冗余与提升健壮度',
      keywords: ['代码', '重构', 'typescript', 'refactor', '编程', '优化']
    },
    'cmd-1': {
      title: '⚡ 反套路两难冲突与代价推演',
      desc: '打破单一开挂 · 严格量化生理与因果代价 · 设计两难冲突',
      keywords: ['两难', '冲突', '反转', '代价', '反套路', '高潮']
    },
    'cmd-2': {
      title: '⚡ 东方仙侠打斗“气机虚实”拆解',
      desc: '气机先兆 · 身法借力打力 · 拒绝报技能名堆特效',
      keywords: ['打斗', '动作', '仙侠', '气机', '招式']
    },
    'cmd-3': {
      title: '⚡ 角色言语去AI味与口癖打磨',
      desc: '消除机械AI腔 · 注入阶层性格特质 · 潜台词与微表情',
      keywords: ['对白', '去ai味', '口癖', '台词', '人物']
    }
  };

  // Build Pinned AI Commands Items
  const pinnedShortcutsList: CommandItem[] = pinnedCommandIds.map(cmdId => {
    const info = aiShortcutRegistry[cmdId] || {
      title: `⚡ 自定义 AI 指令 (${cmdId})`,
      desc: '创作者私有工作流指令模板',
      keywords: ['自定义', '指令', 'template']
    };
    return {
      id: `pinned-ai-${cmdId}`,
      type: 'action',
      title: info.title,
      category: '📌 快捷置顶 AI 指令 (Pinned Shortcuts)',
      description: info.desc,
      icon: Pin,
      shortcut: 'AI',
      keywords: ['ai', '指令', '快捷', ...info.keywords],
      run: () => {
        onSelectTab('ai_commands');
        onClose();
      }
    };
  });

  // Command Palette Items
  const allCommands: CommandItem[] = [
    // --- 📌 快捷置顶推荐位 (Pinned AI Shortcuts) ---
    ...pinnedShortcutsList,

    // --- ⚡ 跨页面快捷指令 (Quick Cross-Page Actions) ---
    {
      id: 'act-new-chat',
      type: 'action',
      title: '新建对话 (New Chat)',
      category: '跨页面指令',
      description: '立即创建新的思考对话话题并聚焦输入框',
      icon: MessageSquare,
      shortcut: '⌘N',
      keywords: ['new', 'chat', '新建', '对话', '新话题', '提问', '发起'],
      run: () => {
        onNewChat();
        onClose();
      }
    },
    {
      id: 'act-analyze-materials',
      type: 'action',
      title: '分析素材知识库 (Analyze Materials)',
      category: '跨页面指令',
      description: '跳转至素材资产库，执行中文分词全文检索与事实对齐',
      icon: FolderGit2,
      shortcut: '⌘F',
      keywords: ['material', 'analyze', '素材', '分析', '检索', '查重', '知识库'],
      run: () => {
        onAnalyzeMaterials();
        onClose();
      }
    },
    {
      id: 'act-export-content',
      type: 'action',
      title: '导出当前内容 (Export Current Content)',
      category: '跨页面指令',
      description: '无损导出当前对话 Markdown、小说章节手稿或全量数据库快照',
      icon: FileDown,
      shortcut: '⌘E',
      keywords: ['export', 'download', '导出', '下载', 'markdown', '备份', '保存'],
      run: () => {
        onExportContent();
        onClose();
      }
    },
    {
      id: 'act-start-draft',
      type: 'action',
      title: '启动小说长篇起草 (Start Drafting)',
      category: '跨页面指令',
      description: '跳转至小说工坊并唤出长篇起草流水线配置',
      icon: Zap,
      shortcut: '⌘D',
      keywords: ['draft', 'novel', '起草', '小说', '续写', '生成', '写小说'],
      run: () => {
        onSelectTab('novel');
        onClose();
      }
    },
    {
      id: 'act-run-review',
      type: 'action',
      title: '启动去 AI 腔深度审查 (Run AI Review)',
      category: '跨页面指令',
      description: '针对当前小说章节执行文风校对、设定一致性与逻辑审查',
      icon: Sparkles,
      keywords: ['review', '审查', '去ai腔', '校对', '润色', '改写', '一致性'],
      run: () => {
        onSelectTab('novel');
        onClose();
      }
    },
    {
      id: 'act-extract-facts',
      type: 'action',
      title: '提取原子事实账本 (Extract Fact Ledger)',
      category: '跨页面指令',
      description: '从当前正文中提取世界观原子事实并归入账本',
      icon: Scale,
      keywords: ['fact', 'ledger', '事实', '账本', '伏笔', '提取', '核验'],
      run: () => {
        onSelectTab('novel');
        onClose();
      }
    },
    {
      id: 'act-start-research',
      type: 'action',
      title: '发起前沿深度研究 (Start Deep Research)',
      category: '跨页面指令',
      description: '新建深度学术/技术研究课题，拆解子课题推进链',
      icon: Compass,
      keywords: ['research', '研究', '研报', '学术', '课题', '调研'],
      run: () => {
        onSelectTab('research');
        onClose();
      }
    },
    {
      id: 'act-toggle-theme',
      type: 'action',
      title: `切换外观主题 (${theme === 'dark' ? '浅色' : theme === 'light' ? '暖色护眼' : '深色'})`,
      category: '系统指令',
      description: '在深色模式、日光浅色与暖色仿古羊皮纸主题间循环切换',
      icon: theme === 'dark' ? Sun : Moon,
      shortcut: '⌘T',
      keywords: ['theme', 'mode', '主题', '外观', '深色', '浅色', '护眼', '颜色'],
      run: () => {
        onToggleTheme();
        onClose();
      }
    },
    {
      id: 'act-toggle-sidebar',
      type: 'action',
      title: '折叠 / 展开导航侧边栏 (Toggle Sidebar)',
      category: '系统指令',
      description: '收起左侧主导航栏以获得更大工作台可视空间',
      icon: PanelLeft,
      shortcut: '⌘B',
      keywords: ['sidebar', 'toggle', '侧边栏', '折叠', '展开', '全屏'],
      run: () => {
        onToggleSidebar();
        onClose();
      }
    },

    // --- 🧭 页面导航 (Navigation across Subpages) ---
    {
      id: 'nav-chat',
      type: 'navigation',
      title: '智能对话 (Chat)',
      category: '核心思考与创作',
      description: '多模型对话 · Token 构成分析 · 常驻钉住消息 · 思考链',
      icon: MessageSquare,
      shortcut: '⌘1',
      keywords: ['chat', '对话', '问答', 'llm', 'gemini', 'deepseek', '联网'],
      run: () => { onSelectTab('chat'); onClose(); }
    },
    {
      id: 'nav-ai-search',
      type: 'navigation',
      title: 'AI搜索 (AI Search)',
      category: '核心思考与创作',
      description: '全网权威溯源 · 本地知识库多路召回 · 深度思维链推理',
      icon: Search,
      keywords: ['search', 'ai搜索', '检索', '溯源', 'google', '联网', '资料'],
      run: () => { onSelectTab('ai_search'); onClose(); }
    },
    {
      id: 'nav-ai-commands',
      type: 'navigation',
      title: 'AI指令 (AI Commands)',
      category: '核心思考与创作',
      description: 'Prompt 实验室 · 反套路冲突推演 · 打斗拆解 · 去AI腔润色',
      icon: Zap,
      keywords: ['command', 'prompt', '指令', '提示词', '润色', '反套路', '打斗'],
      run: () => { onSelectTab('ai_commands'); onClose(); }
    },
    {
      id: 'nav-agents',
      type: 'navigation',
      title: 'AI智能体 (Agents)',
      category: '核心思考与创作',
      description: '自主认知循环 · dsh 智能体网关 · MCP 本地工具调度',
      icon: Bot,
      shortcut: '⌘2',
      keywords: ['agent', '智能体', 'dsh', 'mcp', '自动化', '工具'],
      run: () => { onSelectTab('agents'); onClose(); }
    },
    {
      id: 'nav-research',
      type: 'navigation',
      title: '深度研究 (Research)',
      category: '核心思考与创作',
      description: '子课题规划拆解 · 证据链提炼 · 权威文献溯源与网络沙盒',
      icon: Compass,
      shortcut: '⌘3',
      keywords: ['research', '研究', '研报', '学术', '检索', '报告'],
      run: () => { onSelectTab('research'); onClose(); }
    },
    {
      id: 'nav-novel',
      type: 'navigation',
      title: '小说工坊 (Novel Studio)',
      category: '核心思考与创作',
      description: '长篇创作流水线 · 设定注入 · 沉浸手稿稿纸 · AI 审查与账本',
      icon: BookOpen,
      shortcut: '⌘4',
      keywords: ['novel', '小说', '写作', '故事', '大纲', '设定', '审查'],
      run: () => { onSelectTab('novel'); onClose(); }
    },
    {
      id: 'nav-notebook',
      type: 'navigation',
      title: 'NoteBook (灵感速记)',
      category: '核心思考与创作',
      description: '灵感速记 · AI 核心要点自动提炼 · 写作备忘知识整理',
      icon: StickyNote,
      shortcut: '⌘5',
      keywords: ['notebook', '笔记', '备忘', '速记', '灵感', '总结'],
      run: () => { onSelectTab('notebook'); onClose(); }
    },
    {
      id: 'nav-canvas',
      type: 'navigation',
      title: '无限画布 (Canvas)',
      category: '核心思考与创作',
      description: '剧情脉络脑图 · 节点连线 · AI 次级冲突发散推演',
      icon: Layout,
      shortcut: '⌘6',
      keywords: ['canvas', '画布', '脑图', '白板', '节点', '思维导图'],
      run: () => { onSelectTab('canvas'); onClose(); }
    },
    {
      id: 'nav-image',
      type: 'navigation',
      title: 'AI图片 (Image Studio)',
      category: '多模态媒体工作室',
      description: '多模态图像工坊 · 画幅比例控制 · 国风/写实/原画艺术风格',
      icon: ImageIcon,
      shortcut: '⌘7',
      keywords: ['image', '图片', '绘画', '插画', '壁纸', '比例'],
      run: () => { onSelectTab('image'); onClose(); }
    },
    {
      id: 'nav-slides',
      type: 'navigation',
      title: 'AI幻灯片 (Slides)',
      category: '多模态媒体工作室',
      description: 'Keynote 演示文稿 · 故事大纲提炼 · 演说放映模式',
      icon: Presentation,
      shortcut: '⌘8',
      keywords: ['slides', '幻灯片', 'ppt', 'keynote', '演讲', '演示'],
      run: () => { onSelectTab('slides'); onClose(); }
    },
    {
      id: 'nav-design',
      type: 'navigation',
      title: 'AI设计 (Design Prototype)',
      category: '多模态媒体工作室',
      description: '原生 UI 界面设计 · Apple HIG 原生规范 · 视觉原型画板',
      icon: Palette,
      shortcut: '⌘9',
      keywords: ['design', '设计', 'ui', '原型', '苹果', 'hig', '界面'],
      run: () => { onSelectTab('design'); onClose(); }
    },
    {
      id: 'nav-video',
      type: 'navigation',
      title: 'AI视频 (Video Storyboard)',
      category: '多模态媒体工作室',
      description: '导演分镜脚本 · 镜头景别与运镜 · 时码时间轴与视频预览',
      icon: Video,
      keywords: ['video', '视频', '分镜', '影视', '剪辑', '导演'],
      run: () => { onSelectTab('video'); onClose(); }
    },
    {
      id: 'nav-audio',
      type: 'navigation',
      title: 'AI音频 (Audio & Podcast)',
      category: '多模态媒体工作室',
      description: '双人深度对谈播客 · 48kHz 广播级母带 · 语音合成与试听',
      icon: Mic2,
      keywords: ['audio', '音频', '播客', '语音', 'tts', '录音', '对谈'],
      run: () => { onSelectTab('audio'); onClose(); }
    },
    {
      id: 'nav-charts',
      type: 'navigation',
      title: 'AI图表 (Charts & Metrics)',
      category: '多模态媒体工作室',
      description: 'SVG 矢量数据图表 · 对比柱图/折线图 · 自然语言生成度量',
      icon: BarChart3,
      keywords: ['chart', '图表', '数据', '可视化', '分析', '统计'],
      run: () => { onSelectTab('charts'); onClose(); }
    },
    {
      id: 'nav-trending',
      type: 'navigation',
      title: '热点榜单 (Trending Radar)',
      category: '知识资产与系统',
      description: '网文爆款趋势 · AI 技术前沿 · 实时热度雷达算法加权',
      icon: TrendingUp,
      keywords: ['trending', '热点', '榜单', '风向', '爆款', '趋势'],
      run: () => { onSelectTab('trending'); onClose(); }
    },
    {
      id: 'nav-materials',
      type: 'navigation',
      title: '素材管理 (Materials Library)',
      category: '知识资产与系统',
      description: '中文分词检索 · 知识资产库 · 标签与哈希查重 · 收藏夹',
      icon: FolderGit2,
      keywords: ['material', '素材', '知识库', '检索', '资料', '文档'],
      run: () => { onSelectTab('materials'); onClose(); }
    },
    {
      id: 'nav-settings',
      type: 'navigation',
      title: '设置中心 (Settings)',
      category: '知识资产与系统',
      description: '模型供应商管理 · 任务模型角色分派 · SQLite 本地备份恢复',
      icon: Sliders,
      keywords: ['setting', '设置', '模型', 'api', '配置', '备份', '密钥'],
      run: () => { onSelectTab('settings'); onClose(); }
    }
  ];

  // Filtering based on search query and category filter
  const filteredCommands = allCommands.filter(cmd => {
    if (filterType !== 'all' && cmd.type !== filterType) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords.some(k => k.toLowerCase().includes(q))
    );
  });

  // Focus input and reset when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setFilterType('all');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keep index within range
  useEffect(() => {
    if (selectedIndex >= filteredCommands.length) {
      setSelectedIndex(Math.max(0, filteredCommands.length - 1));
    }
  }, [filteredCommands.length, selectedIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].run();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 dark:bg-black/65 backdrop-blur-xl flex items-start justify-center pt-[12vh] px-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      {/* Spotlight Window */}
      <div 
        className="w-full max-w-[620px] rounded-2xl bg-[var(--apple-surface)]/95 dark:bg-[var(--apple-surface)]/90 backdrop-blur-3xl border border-[var(--apple-border-strong)] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-150 scale-100 ring-1 ring-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Spotlight Search Header */}
        <div className="h-14 px-4.5 flex items-center gap-3 border-b border-[var(--apple-separator)] bg-transparent shrink-0">
          <Search className="w-5 h-5 text-[var(--apple-accent)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="输入指令、搜索页面或执行跨页操作... (⌘K)"
            className="w-full bg-transparent text-sm md:text-base text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] focus:outline-none font-medium tracking-tight"
          />

          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[var(--apple-text-tertiary)] bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded shadow-xs">
              esc
            </kbd>
          )}
        </div>

        {/* Filter Tabs Bar (macOS Segmented Pills) */}
        <div className="px-4 py-2 border-b border-[var(--apple-separator)] bg-[var(--apple-subtle)]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setFilterType('all'); setSelectedIndex(0); }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs font-semibold'
                  : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              全部 ({allCommands.length})
            </button>
            <button
              onClick={() => { setFilterType('action'); setSelectedIndex(0); }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                filterType === 'action'
                  ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs font-semibold'
                  : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              ⚡ 快捷指令 ({allCommands.filter(c => c.type === 'action').length})
            </button>
            <button
              onClick={() => { setFilterType('navigation'); setSelectedIndex(0); }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                filterType === 'navigation'
                  ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs font-semibold'
                  : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              🧭 页面导航 ({allCommands.filter(c => c.type === 'navigation').length})
            </button>
          </div>

          <span className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">
            {filteredCommands.length} 条指令匹配
          </span>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 space-y-1"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--apple-text-tertiary)] space-y-1">
              <div>未找到匹配“{query}”的操作指令</div>
              <div className="text-[11px] opacity-70">支持输入中文或拼音，如“新建”、“导出”、“小说”、“主题”</div>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              const isAction = cmd.type === 'action';

              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.run()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[var(--apple-accent)] text-white shadow-xs'
                      : 'hover:bg-[var(--apple-subtle)] text-[var(--apple-text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : isAction 
                            ? 'bg-amber-500/15 text-amber-500' 
                            : 'bg-[var(--apple-subtle)] text-[var(--apple-accent)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex flex-col min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold tracking-tight ${isSelected ? 'text-white' : 'text-[var(--apple-text-primary)]'}`}>
                          {cmd.title}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[var(--apple-text-tertiary)]'}`}>
                          · {cmd.category}
                        </span>
                      </div>
                      <span className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/85' : 'text-[var(--apple-text-secondary)]'}`}>
                        {cmd.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {cmd.shortcut && (
                      <kbd className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        isSelected 
                          ? 'border-white/30 text-white/90 bg-white/10' 
                          : 'border-[var(--apple-border)] text-[var(--apple-text-tertiary)] bg-[var(--apple-subtle)]'
                      }`}>
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-white/90" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Command Palette Footer Controls */}
        <div className="h-9 px-4 border-t border-[var(--apple-separator)] bg-[var(--apple-subtle)]/40 flex items-center justify-between text-[11px] text-[var(--apple-text-tertiary)] shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-[var(--apple-surface)] border border-[var(--apple-border)] rounded text-[10px] font-mono">↑</kbd>
              <kbd className="px-1 py-0.2 bg-[var(--apple-surface)] border border-[var(--apple-border)] rounded text-[10px] font-mono">↓</kbd>
              <span>选择</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 bg-[var(--apple-surface)] border border-[var(--apple-border)] rounded text-[10px] font-mono">↵</kbd>
              <span>执行指令</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 bg-[var(--apple-surface)] border border-[var(--apple-border)] rounded text-[10px] font-mono">esc</kbd>
              <span>关闭</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span>macOS Command Center (⌘K)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
