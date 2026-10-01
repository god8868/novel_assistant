import React, { useState, useEffect } from 'react';
import { 
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
  PanelLeftClose,
  PanelLeft,
  Radio,
  Moon,
  Sun,
  Coffee,
  Search,
  X,
  Globe,
  Zap,
  Users,
  Swords,
  Cpu
} from 'lucide-react';
import { CommandPalette } from './CommandPalette.tsx';

export type MainTab = 
  | 'chat'        // 智能对话
  | 'group_chat'  // AI群聊
  | 'game_theory' // AI博弈
  | 'ai_search'   // AI搜索
  | 'ai_commands' // AI指令
  | 'ai_analysis' // AI分析功能
  | 'agents'      // AI智能体
  | 'research'    // 深度研究
  | 'novel'       // 小说工坊
  | 'notebook'    // NoteBook
  | 'canvas'      // 无限画布
  | 'image'       // AI图片
  | 'slides'      // AI幻灯片
  | 'design'      // AI设计
  | 'video'       // AI视频
  | 'audio'       // AI音频
  | 'charts'      // AI图表
  | 'trending'    // 热点榜单
  | 'materials'   // 素材管理
  | 'settings';   // 设置中心

interface AppSidebarProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  theme: 'dark' | 'light' | 'sepia';
  setTheme: (t: 'dark' | 'light' | 'sepia') => void;
  activeModelName?: string;
  isStreaming?: boolean;
  onNewChat?: () => void;
  onAnalyzeMaterials?: () => void;
  onExportContent?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  theme,
  setTheme,
  activeModelName = 'Mock 智能旗舰模型',
  isStreaming = false,
  onNewChat = () => {},
  onAnalyzeMaterials = () => {},
  onExportContent = () => {}
}) => {
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Global ⌘K keyboard shortcut for Spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 导航栏分类结构
  const navSections = [
    {
      group: '核心思考与创作',
      items: [
        { id: 'chat' as MainTab, label: '智能对话', icon: MessageSquare },
        { id: 'group_chat' as MainTab, label: 'AI群聊', icon: Users, badge: 'New' },
        { id: 'game_theory' as MainTab, label: 'AI博弈', icon: Swords, badge: 'Hot' },
        { id: 'ai_search' as MainTab, label: 'AI搜索', icon: Globe, badge: 'Pro' },
        { id: 'ai_commands' as MainTab, label: 'AI指令', icon: Zap },
        { id: 'ai_analysis' as MainTab, label: 'AI分析引擎', icon: Cpu, badge: 'Pro' },
        { id: 'agents' as MainTab, label: 'AI智能体', icon: Bot, badge: 'dsh' },
        { id: 'research' as MainTab, label: '深度研究', icon: Compass },
        { id: 'novel' as MainTab, label: '小说工坊', icon: BookOpen },
        { id: 'notebook' as MainTab, label: 'NoteBook', icon: StickyNote },
        { id: 'canvas' as MainTab, label: '无限画布', icon: Layout },
      ]
    },
    {
      group: '多模态媒体工作室',
      items: [
        { id: 'image' as MainTab, label: 'AI图片', icon: Image },
        { id: 'slides' as MainTab, label: 'AI幻灯片', icon: Presentation },
        { id: 'design' as MainTab, label: 'AI设计', icon: Palette },
        { id: 'video' as MainTab, label: 'AI视频', icon: Video },
        { id: 'audio' as MainTab, label: 'AI音频', icon: Mic2 },
        { id: 'charts' as MainTab, label: 'AI图表', icon: BarChart3 },
      ]
    },
    {
      group: '知识资产与系统',
      items: [
        { id: 'trending' as MainTab, label: '热点榜单', icon: TrendingUp },
        { id: 'materials' as MainTab, label: '素材管理', icon: FolderGit2 },
        { id: 'settings' as MainTab, label: '设置中心', icon: Sliders },
      ]
    }
  ];

  // Optional live-filtering when user types in sidebar search
  const filteredNavSections = navSections.map(sec => ({
    ...sec,
    items: sec.items.filter(item => {
      if (!sidebarSearch.trim()) return true;
      const q = sidebarSearch.toLowerCase();
      return item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
    })
  })).filter(sec => sec.items.length > 0);

  return (
    <>
      <aside 
        className={`h-screen border-r border-[var(--apple-border)] bg-[var(--apple-sidebar-glass)] backdrop-blur-2xl flex flex-col justify-between shrink-0 transition-all duration-200 select-none z-40 ${
          collapsed ? 'w-[68px]' : 'w-[230px]'
        }`}
      >
        {/* Top: macOS Window Controls & Spotlight Search */}
        <div className="flex flex-col overflow-hidden shrink-0">
          {/* macOS Traffic Lights Header */}
          <div className="h-[52px] px-4 flex items-center justify-between border-b border-[var(--apple-separator)] shrink-0">
            <div className="flex items-center gap-2">
              {/* Traffic Lights */}
              <div className="flex items-center gap-1.5 group">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-xs flex items-center justify-center opacity-90 group-hover:opacity-100" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-xs flex items-center justify-center opacity-90 group-hover:opacity-100" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-xs flex items-center justify-center opacity-90 group-hover:opacity-100" />
              </div>

              {!collapsed && (
                <span className="text-xs font-semibold text-[var(--apple-text-primary)] tracking-tight ml-2 truncate">
                  本地 AI 工具平台
                </span>
              )}
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "展开导航栏 (⌘B)" : "折叠导航栏 (⌘B)"}
              className="p-1 rounded-md text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-border)] transition-colors"
            >
              {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* ============================================================ */}
          {/* macOS Spotlight Search Bar (侧边栏顶部透明搜索栏) */}
          {/* ============================================================ */}
          <div className="px-2.5 pt-2.5 pb-1.5 shrink-0">
            {!collapsed ? (
              <div 
                onClick={() => setIsSpotlightOpen(true)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.04] dark:bg-white/[0.05] hover:bg-white/[0.08] dark:hover:bg-white/[0.09] border border-[var(--apple-border)] text-xs text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-all cursor-pointer shadow-xs group"
                title="按 ⌘K 打开 Spotlight 快捷跳转"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                  <Search className="w-3.5 h-3.5 text-[var(--apple-text-tertiary)] group-hover:text-[var(--apple-accent)] transition-colors shrink-0" />
                  <input
                    type="text"
                    value={sidebarSearch}
                    onChange={e => setSidebarSearch(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        if (filteredNavSections[0]?.items[0]) {
                          setActiveTab(filteredNavSections[0].items[0].id);
                          setSidebarSearch('');
                        } else {
                          setIsSpotlightOpen(true);
                        }
                      }
                    }}
                    placeholder="聚焦搜索 (⌘K)..."
                    className="w-full bg-transparent text-[11px] text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] focus:outline-none cursor-text truncate font-normal"
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {sidebarSearch ? (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSidebarSearch('');
                      }}
                      className="p-0.5 rounded text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  ) : (
                    <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-[var(--apple-text-tertiary)] group-hover:text-[var(--apple-text-secondary)] bg-[var(--apple-subtle)]/60 rounded border border-[var(--apple-border)] transition-colors">
                      ⌘K
                    </kbd>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => setIsSpotlightOpen(true)}
                  title="Spotlight 快速跳转 (⌘K)"
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-accent)] hover:border-[var(--apple-accent)]/40 transition-all shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Nav Items list */}
        <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-3">
          {filteredNavSections.length === 0 ? (
            <div className="px-3 py-6 text-center text-[11px] text-[var(--apple-text-tertiary)]">
              未找到匹配项
              <button 
                onClick={() => setSidebarSearch('')} 
                className="block mx-auto mt-2 text-[var(--apple-accent)] hover:underline"
              >
                清除搜索
              </button>
            </div>
          ) : (
            filteredNavSections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-0.5">
                {!collapsed && (
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-[var(--apple-text-tertiary)] tracking-wider uppercase">
                    {sec.group}
                  </div>
                )}

                {sec.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[var(--apple-accent)] text-white shadow-xs font-semibold'
                        : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-border)]/50'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[var(--apple-text-secondary)]'}`} />
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between text-left truncate">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[9px] font-mono tracking-tight ${isActive ? 'text-white/80' : 'text-purple-400'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )))}
        </div>

      {/* Bottom Status & Appearance Switcher */}
      <div className="p-3 border-t border-[var(--apple-separator)] space-y-2.5 shrink-0 bg-[var(--apple-sidebar)]/40 backdrop-blur-md">
        {!collapsed && (
          <div className="flex items-center justify-between px-1 text-[11px] text-[var(--apple-text-secondary)]">
            <span className="flex items-center gap-1.5 truncate">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isStreaming ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
              <span className="truncate max-w-[120px] font-medium" title={activeModelName}>{activeModelName}</span>
            </span>
            <span className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">本地运行</span>
          </div>
        )}

        {/* macOS Segmented Appearance Switcher */}
        <div className={`p-0.5 rounded-lg bg-[var(--apple-border)] flex items-center ${collapsed ? 'flex-col gap-1' : 'justify-between'}`}>
          <button
            onClick={() => setTheme('dark')}
            title="深色外观"
            className={`p-1 rounded-md text-xs transition-all flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs'
                : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
            } ${collapsed ? 'w-full' : 'flex-1'}`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('light')}
            title="浅色外观"
            className={`p-1 rounded-md text-xs transition-all flex items-center justify-center ${
              theme === 'light'
                ? 'bg-[var(--apple-surface)] text-amber-500 shadow-xs'
                : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
            } ${collapsed ? 'w-full' : 'flex-1'}`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('sepia')}
            title="暖调护眼"
            className={`p-1 rounded-md text-xs transition-all flex items-center justify-center ${
              theme === 'sepia'
                ? 'bg-[var(--apple-surface)] text-amber-700 shadow-xs'
                : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
            } ${collapsed ? 'w-full' : 'flex-1'}`}
          >
            <Coffee className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>

    {/* macOS Command+K Command Palette Overlay */}
    <CommandPalette
      isOpen={isSpotlightOpen}
      onClose={() => setIsSpotlightOpen(false)}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onNewChat={onNewChat}
      onAnalyzeMaterials={onAnalyzeMaterials}
      onExportContent={onExportContent}
      onToggleTheme={() => {
        const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'sepia' : 'dark';
        setTheme(nextTheme);
      }}
      onToggleSidebar={() => setCollapsed(!collapsed)}
      theme={theme}
    />
  </>
  );
};
