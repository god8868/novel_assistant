import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MessageSquare, 
  Bot, 
  Compass, 
  BookOpen, 
  StickyNote, 
  Layout, 
  Image, 
  Presentation, 
  Palette, 
  Video, 
  Mic2, 
  BarChart3, 
  TrendingUp, 
  FolderGit2, 
  Sliders,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
  X
} from 'lucide-react';
import { MainTab } from './AppSidebar.tsx';

export interface SpotlightItem {
  id: MainTab;
  name: string;
  pinyin?: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  keywords: string[];
}

export const SPOTLIGHT_ITEMS: SpotlightItem[] = [
  {
    id: 'chat',
    name: '智能对话',
    category: '核心思考与创作',
    description: '多模型对话增强 · 联网检索 · Token 预算分析 · 思维链',
    icon: MessageSquare,
    shortcut: '⌘1',
    keywords: ['chat', '对话', '问答', 'llm', 'gpt', 'gemini', '联网']
  },
  {
    id: 'agents',
    name: 'AI智能体',
    category: '核心思考与创作',
    description: '自主认知循环 · dsh 智能体网关 · MCP 本地工具调度',
    icon: Bot,
    shortcut: '⌘2',
    keywords: ['agent', '智能体', 'dsh', 'mcp', '自动化', '工具']
  },
  {
    id: 'research',
    name: '深度研究',
    category: '核心思考与创作',
    description: '子课题规划拆解 · 证据链提炼 · 权威文献溯源与网络沙盒',
    icon: Compass,
    shortcut: '⌘3',
    keywords: ['research', '研究', '研报', '学术', '检索', '报告']
  },
  {
    id: 'novel',
    name: '小说工坊',
    category: '核心思考与创作',
    description: '长篇创作流水线 · 设定注入 · 章节起草 · AI 审查与原子事实账本',
    icon: BookOpen,
    shortcut: '⌘4',
    keywords: ['novel', '小说', '写作', '故事', '大纲', '设定', '审查']
  },
  {
    id: 'notebook',
    name: 'NoteBook',
    category: '核心思考与创作',
    description: '灵感速记 · AI 核心要点自动提炼 · 写作备忘知识整理',
    icon: StickyNote,
    shortcut: '⌘5',
    keywords: ['notebook', '笔记', '备忘', '速记', '灵感', '总结']
  },
  {
    id: 'canvas',
    name: '无限画布',
    category: '核心思考与创作',
    description: '剧情脉络脑图 · 节点连线 · AI 次级冲突发散推演',
    icon: Layout,
    shortcut: '⌘6',
    keywords: ['canvas', '画布', '脑图', '白板', '节点', '思维导图']
  },
  {
    id: 'image',
    name: 'AI图片',
    category: '多模态媒体工作室',
    description: '多模态图像工坊 · 画幅比例控制 · 国风/写实/原画艺术风格',
    icon: Image,
    shortcut: '⌘7',
    keywords: ['image', '图片', '绘画', '插画', '壁纸', '比例']
  },
  {
    id: 'slides',
    name: 'AI幻灯片',
    category: '多模态媒体工作室',
    description: 'Keynote 演示文稿 · 故事大纲提炼 · 演说放映模式',
    icon: Presentation,
    shortcut: '⌘8',
    keywords: ['slides', '幻灯片', 'ppt', 'keynote', '演讲', '演示']
  },
  {
    id: 'design',
    name: 'AI设计',
    category: '多模态媒体工作室',
    description: '原生 UI 界面设计 · Apple HIG 原生规范 · 视觉原型画板',
    icon: Palette,
    shortcut: '⌘9',
    keywords: ['design', '设计', 'ui', '原型', '苹果', 'hig', '界面']
  },
  {
    id: 'video',
    name: 'AI视频',
    category: '多模态媒体工作室',
    description: '导演分镜脚本 · 镜头景别与运镜 · 时码时间轴与视频预览',
    icon: Video,
    keywords: ['video', '视频', '分镜', '影视', '剪辑', '导演']
  },
  {
    id: 'audio',
    name: 'AI音频',
    category: '多模态媒体工作室',
    description: '双人深度对谈播客 · 48kHz 广播级母带 · 语音合成与试听',
    icon: Mic2,
    keywords: ['audio', '音频', '播客', '语音', 'tts', '录音', '对谈']
  },
  {
    id: 'charts',
    name: 'AI图表',
    category: '多模态媒体工作室',
    description: 'SVG 矢量数据图表 · 对比柱图/折线图 · 自然语言生成度量',
    icon: BarChart3,
    keywords: ['chart', '图表', '数据', '可视化', '分析', '统计']
  },
  {
    id: 'trending',
    name: '热点榜单',
    category: '知识资产与系统',
    description: '网文爆款趋势 · AI 技术前沿 · 实时热度雷达算法加权',
    icon: TrendingUp,
    keywords: ['trending', '热点', '榜单', '风向', '爆款', '趋势']
  },
  {
    id: 'materials',
    name: '素材管理',
    category: '知识资产与系统',
    description: '中文分词检索 · 知识资产库 · 标签与哈希查重 · 收藏夹',
    icon: FolderGit2,
    keywords: ['material', '素材', '知识库', '检索', '资料', '文档']
  },
  {
    id: 'settings',
    name: '设置中心',
    category: '知识资产与系统',
    description: '模型供应商管理 · 任务模型角色分派 · SQLite 本地备份恢复',
    icon: Sliders,
    keywords: ['setting', '设置', '模型', 'api', '配置', '备份', '密钥']
  }
];

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: MainTab) => void;
}

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onClose,
  onSelectTab
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items based on query
  const filteredItems = SPOTLIGHT_ITEMS.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.some(k => k.toLowerCase().includes(q))
    );
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems.length, selectedIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelectTab(filteredItems[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose, onSelectTab]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-start justify-center pt-[14vh] px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Spotlight Window */}
      <div 
        className="w-full max-w-[600px] rounded-2xl bg-[var(--apple-surface)]/95 backdrop-blur-3xl border border-[var(--apple-border-strong)] shadow-2xl overflow-hidden flex flex-col select-none transform transition-all duration-150 scale-100"
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
            placeholder="搜索工作台子页面、功能或输入关键词..."
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
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[var(--apple-text-tertiary)] bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded">
              esc
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 space-y-1"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--apple-text-tertiary)]">
              未找到与“{query}”相关的工作台子页面
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
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
                          : 'bg-[var(--apple-subtle)] text-[var(--apple-accent)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex flex-col min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold tracking-tight ${isSelected ? 'text-white' : 'text-[var(--apple-text-primary)]'}`}>
                          {item.name}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[var(--apple-text-tertiary)]'}`}>
                          · {item.category}
                        </span>
                      </div>
                      <span className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/85' : 'text-[var(--apple-text-secondary)]'}`}>
                        {item.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.shortcut && (
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-white/75' : 'text-[var(--apple-text-tertiary)]'}`}>
                        {item.shortcut}
                      </span>
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

        {/* Spotlight Footer Controls */}
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
              <span>快速跳转</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span>Spotlight 快捷直达</span>
          </div>
        </div>
      </div>
    </div>
  );
};
