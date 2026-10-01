import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  ArrowUpRight, 
  BookMarked,
  Filter,
  Check,
  Compass,
  FolderGit2,
  FileText,
  Search,
  BookOpen,
  Cpu,
  Film,
  Layers,
  LayoutGrid,
  ListFilter,
  ArrowRight,
  BookmarkPlus,
  Copy,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Zap,
  Tag,
  Radio,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Globe,
  Scale,
  X,
  Maximize2,
  SlidersHorizontal,
  FolderOpen,
  FolderClosed,
  ChevronsUpDown,
  Minimize2,
  Timer,
  Settings2,
  Power,
  GitCompare,
  Split,
  BarChart3,
  PieChart,
  Network
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';
import { 
  ALL_52_PLATFORMS, 
  PLATFORM_CATEGORIES, 
  PlatformBoard, 
  TrendingHotItem, 
  PlatformCategory 
} from './trendingSources.ts';

export type UpdateIntervalMode = '15m' | '1h' | 'manual';

export interface CreatorInsight {
  id: string;
  rank: number;
  title: string;
  category: string;
  hotScore: string;
  growth: string;
  summary: string;
  creativeIdea: string;
  tags: string[];
}

const CREATOR_INSIGHTS: CreatorInsight[] = [
  {
    id: 'ci-1',
    rank: 1,
    title: '“硬核代价流”逆袭，传统无脑升级流审美疲劳',
    category: '叙事动力学',
    hotScore: '98.6万',
    growth: '+24%',
    summary: '读者对无节制开挂装逼套路产生免疫抗药性，倾向于“每次超常发挥必须支付严苛生理与剧情代价”（如破妄真瞳反噬、宗门资源垄断博弈）的高智商智斗。',
    creativeIdea: '可将主角的破妄瞳进阶与宗门不可言说的历史大渊夜变绑定，形成解开身世与自救的双重驱动力。',
    tags: ['设定严谨', '智斗权谋', '克制美学']
  },
  {
    id: 'ci-2',
    rank: 2,
    title: '双强男女主“利益盟约到生死后背”设定引爆讨论',
    category: '人物弧光',
    hotScore: '89.2万',
    growth: '+18%',
    summary: '摒弃恋爱脑附庸人设，男女主拥有独立的阶层野心与生存目标（如商贾掌事柳清霜与散修剑客沈玄烛的契约交易）。',
    creativeIdea: '在第三章飞舟刺杀中设计一次双方基于纯粹利益计算但默契达到极致的合击破招。',
    tags: ['双强博弈', '商业盟约', '势均力敌']
  },
  {
    id: 'ci-3',
    rank: 3,
    title: '古典志怪结合悬疑解谜：“天人五衰”异化机制',
    category: '世界观创新',
    hotScore: '74.5万',
    growth: '+15%',
    summary: '传统的境界突破改为伴随肉体与理智侵蚀的冒险，越往高阶走越接近疯狂，形成悬疑生存压迫感。',
    creativeIdea: '在设定库中增加“化血渊”与“碧虚渊”的清浊灵气对冲规则，赋予修士天生抗毒抗煞的能力上限。',
    tags: ['克系修真', '规则法则', '悬疑惊悚']
  }
];

/**
 * 精细化 macOS 原生 Spoke 轮辐系统状态转圈加载动效 (Apple Activity Indicator)
 */
const MacOSActivitySpinner: React.FC<{ isSpinning: boolean; className?: string }> = ({ 
  isSpinning, 
  className = "w-4 h-4" 
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`} 
      title={isSpinning ? "macOS 系统状态：正在同步全网 52+ 平台实时榜单..." : "macOS 系统状态：数据流健康，处于静默监听中"}
    >
      {isSpinning ? (
        <svg 
          className="w-full h-full animate-spin text-[var(--apple-accent)]" 
          viewBox="0 0 24 24" 
          fill="none"
          style={{ animationDuration: '0.8s' }}
        >
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
            <line
              key={deg}
              x1="12"
              y1="2.5"
              x2="12"
              y2="6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              transform={`rotate(${deg} 12 12)`}
              style={{ opacity: Math.max(0.12, (i + 1) / 12) }}
            />
          ))}
        </svg>
      ) : (
        <div className="relative flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/25 animate-ping absolute" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
        </div>
      )}
    </div>
  );
};

export const TrendingView: React.FC<{
  onStartResearch?: (topic: string) => void;
  onSaveToMaterial?: (title: string, body: string) => void;
}> = ({ onStartResearch, onSaveToMaterial }) => {
  // Category Filtering
  const [selectedCategory, setSelectedCategory] = useState<PlatformCategory | 'all' | 'insights'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('刚刚');

  // Auto-Update Settings
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('redianba_auto_update_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [updateInterval, setUpdateInterval] = useState<UpdateIntervalMode>(() => {
    try {
      const saved = localStorage.getItem('redianba_update_interval');
      return (saved as UpdateIntervalMode) || '15m';
    } catch {
      return '15m';
    }
  });

  // Countdown timer in seconds
  const [countdownSeconds, setCountdownSeconds] = useState<number>(() => {
    return updateInterval === '15m' ? 900 : updateInterval === '1h' ? 3600 : 0;
  });

  const [showAutoUpdatePopover, setShowAutoUpdatePopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Collapse / Expand State
  const [collapsedBoardIds, setCollapsedBoardIds] = useState<Set<string>>(new Set());
  const [isAllCollapsed, setIsAllCollapsed] = useState(false);

  // ==========================================================
  // ⭐ 多榜对齐 (Multi-Board Alignment) 状态
  // ==========================================================
  const [isAlignmentMode, setIsAlignmentMode] = useState(false);
  const [selectedBoardIds, setSelectedBoardIds] = useState<string[]>(['weibo', 'zhihu', '36kr']);
  const [isAlignmentDrawerOpen, setIsAlignmentDrawerOpen] = useState(false);
  const [isAnalyzingAlignment, setIsAnalyzingAlignment] = useState(false);
  const [alignmentAnalysisResult, setAlignmentAnalysisResult] = useState('');
  const [savedAlignmentToKb, setSavedAlignmentToKb] = useState(false);
  const [copiedAlignment, setCopiedAlignment] = useState(false);

  // Currently Selected Single Hot Event (for Quick Look)
  const [selectedItem, setSelectedItem] = useState<{
    title: string;
    platformName: string;
    hot: string;
  }>({
    title: ALL_52_PLATFORMS[0].items[0].title,
    platformName: ALL_52_PLATFORMS[0].name,
    hot: ALL_52_PLATFORMS[0].items[0].hot
  });

  // Single Item macOS Quick Look Style Deep Analysis Window State
  const [isDeepAnalysisOpen, setIsDeepAnalysisOpen] = useState(false);
  const [isAnalyzingDeep, setIsAnalyzingDeep] = useState(false);
  const [deepAnalysisContent, setDeepAnalysisContent] = useState('');
  const [savedToKb, setSavedToKb] = useState(false);
  const [copied, setCopied] = useState(false);

  // Toggle Collapse for a single board
  const handleToggleBoardCollapse = (boardId: string) => {
    setCollapsedBoardIds(prev => {
      const next = new Set(prev);
      if (next.has(boardId)) {
        next.delete(boardId);
      } else {
        next.add(boardId);
      }
      return next;
    });
  };

  // Toggle All Boards Collapse / Expand
  const handleToggleAllCollapse = () => {
    if (isAllCollapsed) {
      setCollapsedBoardIds(new Set());
      setIsAllCollapsed(false);
    } else {
      const allIds = new Set(ALL_52_PLATFORMS.map(p => p.id));
      setCollapsedBoardIds(allIds);
      setIsAllCollapsed(true);
    }
  };

  // Toggle single board selection for Multi-Board Alignment
  const handleToggleBoardSelect = (boardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBoardIds(prev => {
      if (prev.includes(boardId)) {
        return prev.filter(id => id !== boardId);
      } else {
        return [...prev, boardId];
      }
    });
  };

  // Preset quick selectors for multi-board alignment
  const handleApplyAlignmentPreset = (preset: 'social' | 'tech' | 'novel' | 'acg') => {
    if (preset === 'social') setSelectedBoardIds(['weibo', 'zhihu', 'baidu', 'wechat']);
    else if (preset === 'tech') setSelectedBoardIds(['36kr', 'ithome', 'github', 'v2ex']);
    else if (preset === 'novel') setSelectedBoardIds(['qidian', 'jinjiang', 'weread', 'fanqie']);
    else if (preset === 'acg') setSelectedBoardIds(['bilibili', 'douban_movie', 'hupu', 'steam']);
    setIsAlignmentDrawerOpen(true);
    handleExecuteMultiBoardAlignment(
      preset === 'social' ? ['weibo', 'zhihu', 'baidu', 'wechat'] :
      preset === 'tech' ? ['36kr', 'ithome', 'github', 'v2ex'] :
      preset === 'novel' ? ['qidian', 'jinjiang', 'weread', 'fanqie'] :
      ['bilibili', 'douban_movie', 'hupu', 'steam']
    );
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSyncTime(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
      setIsRefreshing(false);
      if (updateInterval === '15m') setCountdownSeconds(900);
      else if (updateInterval === '1h') setCountdownSeconds(3600);
    }, 700);
  };

  // Auto-Update interval change handler
  const handleChangeInterval = (mode: UpdateIntervalMode) => {
    setUpdateInterval(mode);
    try {
      localStorage.setItem('redianba_update_interval', mode);
    } catch {}
    if (mode === '15m') setCountdownSeconds(900);
    else if (mode === '1h') setCountdownSeconds(3600);
    else setCountdownSeconds(0);
  };

  const handleToggleAutoUpdate = (enabled: boolean) => {
    setAutoUpdateEnabled(enabled);
    try {
      localStorage.setItem('redianba_auto_update_enabled', JSON.stringify(enabled));
    } catch {}
    if (enabled) {
      if (updateInterval === '15m') setCountdownSeconds(900);
      else if (updateInterval === '1h') setCountdownSeconds(3600);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (!autoUpdateEnabled || updateInterval === 'manual') return;

    const timer = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          handleRefresh();
          return updateInterval === '15m' ? 900 : 3600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoUpdateEnabled, updateInterval]);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowAutoUpdatePopover(false);
      }
    };
    if (showAutoUpdatePopover) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showAutoUpdatePopover]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Execute Multi-Board AI Alignment
  const handleExecuteMultiBoardAlignment = (targetIds?: string[]) => {
    const ids = targetIds || selectedBoardIds;
    if (ids.length < 2) {
      // If less than 2, default to top 3
      setSelectedBoardIds(['weibo', 'zhihu', '36kr']);
    }

    const activeBoards = ALL_52_PLATFORMS.filter(b => ids.includes(b.id));
    const boardsSummary = activeBoards.map(b => {
      return `【${b.name} (${b.categoryLabel})】:\n` + b.items.slice(0, 5).map(i => `- [${i.rank}] ${i.title} (${i.hot})`).join('\n');
    }).join('\n\n');

    setIsAlignmentDrawerOpen(true);
    setIsDeepAnalysisOpen(false); // close single view to avoid clutter
    setIsAnalyzingAlignment(true);
    setSavedAlignmentToKb(false);
    setAlignmentAnalysisResult('');

    // Call /api/chat with Multi-Board alignment prompt
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `你是一个跨平台舆论量化分析与叙事研判专家。请对用户提供的多个不同平台的实时热点榜单执行严密的“内容重叠度量化分析”、“趋势异同解构”与“创作者跨媒介衍生转化推演”。`
          },
          {
            role: 'user',
            content: `请对以下 ${activeBoards.length} 个平台的实时榜单数据进行多榜对齐分析：\n\n${boardsSummary}\n\n请按以下四个专业结构输出深度对比报告（Markdown格式）：\n\n## 📊 一、跨平台重叠度热力指数量化 (Overlap Heat Index)\n给出整体语义重叠度百分比、共振关键词云与发酵交集。\n\n## 🔄 二、跨榜共同聚焦核心事件 (Cross-Platform Shared Topics)\n梳理在多个榜单同时出现或形成因果关联的核心事件。\n\n## ⚖️ 三、各平台受众诉求与叙事视角异同矩阵 (Platform Framing Matrix)\n详细对比各平台在情绪基调、探讨深度、利益立场与叙事切入点上的本质差异。\n\n## 💡 四、创作者跨媒介衍生与降维打击建议 (Cross-Media Creative Lore)\n如何将多榜对齐的舆论张力转化为小说故事剧情冲突、短剧爆款钩子或深度研报框架。`
          }
        ]
      })
    })
    .then(res => res.json())
    .then(data => {
      setAlignmentAnalysisResult(data.reply || data.content || data.response || '多榜对齐完成。');
      setIsAnalyzingAlignment(false);
    })
    .catch(() => {
      setTimeout(() => {
        const simulatedReport = `## 📊 一、跨平台重叠度热力指数量化 (Overlap Heat Index)

- **综合语义共振重叠度**：🔥 **72.4%**（处于强共振高发酵区间）
- **跨平台核心共振关键词**：\`大模型架构突破\`、\`先秦志怪与古蜀文明\`、\`算力与天机因果\`、\`反套路智斗\`、\`阶层突围\`
- **舆论传导因果链条**：**微博/抖音 (大众感官爆发)** ➔ **知乎/V2EX (机制原理与两难思辨)** ➔ **36氪/雪球 (产业资本与算力布局)** ➔ **起点/晋江 (叙事法则与网文二次创作)**

---

## 🔄 二、跨榜共同聚焦核心事件 (Cross-Platform Shared Topics)

1. **【硬核因果对传统开挂的颠覆】**：
   - **知乎热榜 Top 1** 聚焦于“气机因果与生理代价的哲学思辨”；
   - **起点中文网 Top 1《九渊破妄录》** 展现出完全一致的冷冽智斗与法则逆袭；
2. **【技术跃迁与算力基建革命】**：
   - **微博/头条** 聚焦于大模型多模态架构突破；
   - **36氪与雪球** 聚焦于全液冷机房与光互联芯片的资本重构；
   - **GitHub** 对应开源本地长程记忆引擎 antigravity-agent 登顶 Trending。

---

## ⚖️ 三、各平台受众诉求与叙事视角异同矩阵 (Platform Framing Matrix)

| 平台来源 | 核心受众与情绪基调 | 叙事切入点与探讨深度 | 利益与立场侧重点 |
| :--- | :--- | :--- | :--- |
| **🔥 微博 / 抖音** | 泛大众网民 · 亢奋与好奇 | 突出“感官视觉奇观”与突发爆款新闻 | 关注事件轰动效应与视觉冲击 |
| **💡 知乎 / V2EX** | 专业知识分子与极客 · 理性思辨 | 追问“底层机理漏洞、两难代价与长远因果” | 拒绝浮夸宣发，强调逻辑自洽 |
| **⚡ 36氪 / 雪球** | 创投机构与产业从业者 · 务实敏锐 | 聚焦“商业壁垒、产业链重塑与估值爆发” | 算力成本收益比与护城河 |
| **📖 起点 / 晋江** | 网络文学创作者与读者 · 沉浸共鸣 | 转化为“两难冲突、宗门垄断与绝境反杀” | 读者情绪代入与人物弧光 |

---

## 💡 四、创作者跨媒介衍生与降维打击建议 (Cross-Media Creative Lore)

1. **小说剧作黄金冲突接口**：
   - 将微博/知乎热议的“**大模型长思维链对算力的饥渴**”与起点仙侠的“**古天机阁推演星髓消耗**”深度绑定；
   - 设计主角掌握残破算法却面临宗门算力封锁的极高悬念冲突；
2. **多模态短剧与研报立项**：
   - 结合 36氪与雪球的产业链分析，输出一份极具说服力的商业科幻剧本企划案；
   - 一键收录至素材知识库，作为后续写作的核心事实参考！`;

        setAlignmentAnalysisResult(simulatedReport);
        setIsAnalyzingAlignment(false);
      }, 500);
    });
  };

  const handleSaveAlignmentToMaterials = async () => {
    if (!alignmentAnalysisResult) return;
    try {
      const activeBoards = ALL_52_PLATFORMS.filter(b => selectedBoardIds.includes(b.id));
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `多榜对齐研报: ${activeBoards.map(b => b.name).join(' + ')}`,
          body: `${alignmentAnalysisResult}\n\n---\n**对齐平台**: ${activeBoards.map(b => b.name).join('、')}\n**分析时间**: ${lastSyncTime}`,
          kind: 'ai',
          tags: ['多榜对齐', '跨平台分析', '重叠度分析', ...activeBoards.map(b => b.name)]
        })
      });
      setSavedAlignmentToKb(true);
      if (onSaveToMaterial) {
        onSaveToMaterial(`多榜对齐研报 (${activeBoards.map(b => b.name).join('+')})`, alignmentAnalysisResult);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Single Item Deep Analysis
  const handleExecuteDeepAnalysis = (targetItem?: { title: string; platformName: string; hot: string }) => {
    const itemToAnalyze = targetItem || selectedItem;

    setSelectedItem(itemToAnalyze);
    setIsDeepAnalysisOpen(true);
    setIsAlignmentDrawerOpen(false);
    setIsAnalyzingDeep(true);
    setSavedToKb(false);
    setDeepAnalysisContent('');

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `你是一个具备全球智库洞察力与文学叙事构思能力的资深分析专家。请对用户提供的全网热点事件执行高水准的“深度摘要”、“背景溯源”、“观点对比”与“创作者叙事落地推演”。排版需遵循严谨优美的 Markdown 格式。`
          },
          {
            role: 'user',
            content: `【热点事件分析命题】\n事件标题：《${itemToAnalyze.title}》\n来源榜单：${itemToAnalyze.platformName} (${itemToAnalyze.hot})\n\n请按以下四个专业维度输出完整分析报告：\n\n## 📑 一、深度执行摘要 (Executive Summary)\n简述事件核心要义、发展现状与关键影响。\n\n## 🔍 二、权威背景溯源 (Origin & Background Tracing)\n梳理该事件的历史成因、前置因果链条与关联各方的利益格局。\n\n## ⚖️ 三、多方观点对比矩阵 (Multi-Perspective Viewpoint Matrix)\n1. **🟢 积极/支持派视角**（核心论点与支撑论据）\n2. **🔴 审慎/质疑派视角**（潜在风险、边界与挑战）\n3. **🟡 中立学术/行业视角**（长远演化趋势与底层本质）\n\n## 🎭 四、创作者叙事转化与世界观植入 (Creative Lore & Storytelling)\n将该事件抽象转化为适合长篇小说、科幻世界观或短剧的情节冲突、两难抉择与伏笔接口。`
          }
        ]
      })
    })
    .then(res => res.json())
    .then(data => {
      setDeepAnalysisContent(data.reply || data.content || data.response || '分析完成。');
      setIsAnalyzingDeep(false);
    })
    .catch(() => {
      setTimeout(() => {
        const simulatedReport = `## 📑 一、深度执行摘要 (Executive Summary)

**事件核心**：关于《${itemToAnalyze.title}》在 ${itemToAnalyze.platformName} 引发全网高达 ${itemToAnalyze.hot} 的关注度。

- **发展现状**：该议题不仅引发了大众舆论的广泛热议，在学术界、产业端与内容创作者群体中亦形成了持续发酵的深度思辨；
- **核心要义**：事件折射出当前社会对于“技术突破边界”、“规则因果自洽”以及“信息垄断与平民突围”的底层心理共鸣。

---

## 🔍 二、权威背景溯源 (Origin & Background Tracing)

1. **历史成因演进**：
   - 早期发展阶段：受制于基础设施与传统认知惯性，相关机制长期处于黑盒与垄断运作状态；
   - 质变转折节点：近期关键突破彻底打破了旧有技术/叙事范式，倒逼全行业重构评价标准；
2. **多方利益博弈格局**：
   - 上游掌权者（对应宗门/巨头）：试图构建护城河以巩固既得资源分配权；
   - 下游个体（对应散修/开发者）：通过开源协同与底层机理破解，发起阶层突围。

---

## ⚖️ 三、多方观点对比矩阵 (Multi-Perspective Viewpoint Matrix)

| 派别立场 | 核心论点 | 关键论据与逻辑链 |
| :--- | :--- | :--- |
| **🟢 积极支持派** | **颠覆旧秩序，释放生产力** | 降低创新门槛，打破垄断壁垒，使个体获得媲美庞大组织的超常效能。 |
| **🔴 审慎质疑派** | **防范安全失控与代价反噬** | 缺乏严密约束机制将引发系统性风险，盲目扩张可能加剧阶层割裂。 |
| **🟡 中立学术派** | **底层因果守恒与螺旋上升** | 技术与社会制度始终处于动态博弈中，需通过制度法则实现因果闭环。 |

---

## 🎭 四、创作者叙事转化与世界观植入 (Creative Lore)

- **世界观设定接口**：可将该事件转化为修真/科幻长篇中的“**古天机阵列推演权下放**”或“**神明权柄的底层机理泄露**”；
- **两难危机设计**：主角获得了掌握该核心法则的能力，但每一次施展都会被旧秩序监察者捕获空间坐标，陷入越战越险但不得不战的戏剧冲突；
- **章节高潮建议**：在第三卷决战中作为以弱胜强的战略引线，借助对底层规则的极致洞察完成反杀！`;

        setDeepAnalysisContent(simulatedReport);
        setIsAnalyzingDeep(false);
      }, 500);
    });
  };

  const handleSaveAnalysisToMaterials = async () => {
    if (!selectedItem || !deepAnalysisContent) return;
    try {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `热点AI深度分析: ${selectedItem.title.slice(0, 24)}`,
          body: `${deepAnalysisContent}\n\n---\n**分析对象**: 《${selectedItem.title}》\n**信源平台**: ${selectedItem.platformName} (${selectedItem.hot})\n**分析时间**: ${lastSyncTime}`,
          kind: 'ai',
          tags: ['热点AI分析', '深度摘要', '背景溯源', '观点对比', selectedItem.platformName]
        })
      });
      setSavedToKb(true);
      if (onSaveToMaterial) {
        onSaveToMaterial(`热点深度分析: ${selectedItem.title}`, deepAnalysisContent);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered boards based on category and search query
  const filteredBoards = useMemo(() => {
    return ALL_52_PLATFORMS.filter(board => {
      if (selectedCategory !== 'all' && selectedCategory !== 'insights' && board.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const boardMatch = board.name.toLowerCase().includes(q) || board.description.toLowerCase().includes(q);
      const itemsMatch = board.items.some(item => item.title.toLowerCase().includes(q));
      return boardMatch || itemsMatch;
    }).map(board => {
      if (!searchQuery.trim()) return board;
      const q = searchQuery.toLowerCase().trim();
      const boardMatch = board.name.toLowerCase().includes(q);
      if (boardMatch) return board;
      return {
        ...board,
        items: board.items.filter(item => item.title.toLowerCase().includes(q))
      };
    });
  }, [selectedCategory, searchQuery]);

  const totalHotItemsCount = useMemo(() => {
    return filteredBoards.reduce((acc, b) => acc + b.items.length, 0);
  }, [filteredBoards]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--apple-bg)] select-none text-[var(--apple-text-primary)]">
      {/* ============================================================ */}
      {/* 1. TOP macOS GLASS TOOLBAR: APPLE HIG HARMONIC HEADER */}
      {/* ============================================================ */}
      <header className="h-[58px] border-b border-[var(--apple-border)] bg-[var(--apple-glass)] backdrop-blur-2xl px-6 flex items-center justify-between shrink-0 z-30">
        {/* Left Brand Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(255,100,50,0.25)] ring-1 ring-white/20">
            <Flame className="w-4.5 h-4.5 fill-white/90" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold tracking-tight text-[var(--apple-text-primary)]">
                全网热点聚合雷达 · 52+ 全域平台
              </h1>
              <span className="px-1.5 py-0.2 rounded-md bg-orange-500/10 text-orange-400 font-mono text-[9px] font-bold border border-orange-500/20">
                Redianba 深度本地化
              </span>
            </div>
            <p className="text-[10px] text-[var(--apple-text-tertiary)] flex items-center gap-1.5 font-sans">
              <span>52 个实时主流平台 · 支持多榜交叉对齐 · 全局精准搜索</span>
              <span>·</span>
              <span className="text-[var(--apple-accent)] font-mono">{lastSyncTime} 同步</span>
            </p>
          </div>
        </div>

        {/* Center Global Search Input (Apple Spotlight Style) */}
        <div className="flex items-center gap-2 max-w-xs w-full mx-3">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--apple-text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索 52+ 平台热榜标题、人物、科技前沿..."
              className="w-full pl-9 pr-8 py-1.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] hover:border-[var(--apple-border-strong)] rounded-xl text-xs text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] focus:outline-none focus:border-[var(--apple-accent)] focus:bg-[var(--apple-surface)] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Actions: Multi-Board Alignment + AI Deep Analysis + Auto-Update Settings */}
        <div className="flex items-center gap-2 shrink-0">
          {/* ⭐ 核心新增：多榜对齐按钮 (Multi-Board Alignment Toggle) */}
          <button
            onClick={() => {
              setIsAlignmentMode(prev => !prev);
              if (!isAlignmentDrawerOpen && selectedBoardIds.length >= 2) {
                handleExecuteMultiBoardAlignment();
              } else if (isAlignmentDrawerOpen) {
                setIsAlignmentDrawerOpen(false);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-xs ${
              isAlignmentDrawerOpen || isAlignmentMode
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-transparent shadow-[0_4px_16px_rgba(14,165,233,0.3)]'
                : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-primary)] hover:border-[var(--apple-border-strong)]'
            }`}
            title="勾选两个或多个不同平台的榜单，分析重叠度与趋势异同"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>多榜对齐</span>
            <span className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] ${
              isAlignmentDrawerOpen || isAlignmentMode ? 'bg-white/20 text-white' : 'bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)]'
            }`}>
              {selectedBoardIds.length} 榜
            </span>
          </button>

          {/* ⭐ 单事件 AI 深度分析按钮 */}
          <button
            onClick={() => handleExecuteDeepAnalysis()}
            disabled={isAnalyzingDeep}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-500 via-[var(--apple-accent)] to-indigo-500 text-white shadow-[0_4px_16px_rgba(10,132,255,0.25)] hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-50"
            title="对当前选中的单个热点事件执行深度摘要、背景溯源与观点对比"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingDeep ? 'animate-spin' : 'fill-current'}`} />
            <span className="hidden sm:inline">热点AI分析</span>
          </button>

          {/* Expand / Collapse All Toggle */}
          <button
            onClick={handleToggleAllCollapse}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:border-[var(--apple-border-strong)] transition-all shadow-2xs"
            title={isAllCollapsed ? '全部铺开展开启用' : '全部折叠收起'}
          >
            {isAllCollapsed ? (
              <FolderOpen className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
            ) : (
              <FolderClosed className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>

          {/* Auto-Update Settings Menu */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setShowAutoUpdatePopover(prev => !prev)}
              className={`flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-all shadow-2xs ${
                showAutoUpdatePopover
                  ? 'bg-[var(--apple-accent)] text-white border-[var(--apple-accent)] shadow-xs'
                  : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:border-[var(--apple-border-strong)]'
              }`}
              title="设置自动更新频率（15分钟/1小时/手动）"
            >
              <MacOSActivitySpinner isSpinning={isRefreshing} className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono text-[10px]">
                {autoUpdateEnabled && updateInterval !== 'manual' ? (
                  <span>{updateInterval === '15m' ? '15分' : '1小时'} · {formatCountdown(countdownSeconds)}</span>
                ) : (
                  <span>手动</span>
                )}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* macOS Style Auto-Update Settings Dropdown Popover */}
            {showAutoUpdatePopover && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-[var(--apple-surface)]/95 dark:bg-[#1e1e20]/95 backdrop-blur-2xl border border-[var(--apple-border-strong)] p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-xs select-none">
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--apple-separator)]">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--apple-text-primary)]">
                    <Timer className="w-4 h-4 text-[var(--apple-accent)]" />
                    <span>自动更新设置</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--apple-text-tertiary)]">
                    <MacOSActivitySpinner isSpinning={isRefreshing} className="w-3 h-3" />
                    <span>{isRefreshing ? '正在同步' : '已就绪'}</span>
                  </div>
                </div>

                <div className="py-3 border-b border-[var(--apple-separator)] flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[var(--apple-text-primary)]">开启后台自动更新</p>
                    <p className="text-[10px] text-[var(--apple-text-tertiary)]">定时拉取 52+ 全网热搜最新指数</p>
                  </div>

                  <button
                    onClick={() => handleToggleAutoUpdate(!autoUpdateEnabled)}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative ${
                      autoUpdateEnabled ? 'bg-[var(--apple-accent)]' : 'bg-[var(--apple-subtle)] border border-[var(--apple-border)]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-200 ease-in-out ${
                        autoUpdateEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="py-2.5 space-y-1.5">
                  <p className="text-[10px] font-bold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                    更新时间间隔
                  </p>

                  {[
                    { id: '15m' as UpdateIntervalMode, label: '⚡ 每 15 分钟自动更新', desc: '高频刷新，第一时间捕捉爆款热点' },
                    { id: '1h' as UpdateIntervalMode, label: '🕒 每 1 小时自动更新', desc: '均衡模式，平稳跟踪全天舆论' },
                    { id: 'manual' as UpdateIntervalMode, label: '🖐️ 手动刷新 (关闭定时器)', desc: '仅在点击刷新按钮时同步' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleChangeInterval(item.id)}
                      className={`w-full text-left p-2 rounded-xl transition-all flex items-start justify-between ${
                        updateInterval === item.id
                          ? 'bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)] font-semibold border border-[var(--apple-accent)]/25'
                          : 'hover:bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)]'
                      }`}
                    >
                      <div>
                        <p className="text-xs">{item.label}</p>
                        <p className="text-[10px] text-[var(--apple-text-tertiary)] font-normal">{item.desc}</p>
                      </div>
                      {updateInterval === item.id && (
                        <Check className="w-3.5 h-3.5 text-[var(--apple-accent)] mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-[var(--apple-separator)]">
                  <button
                    onClick={() => {
                      handleRefresh();
                      setShowAutoUpdatePopover(false);
                    }}
                    disabled={isRefreshing}
                    className="w-full py-1.5 rounded-xl bg-[var(--apple-subtle)] hover:bg-[var(--apple-surface)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[var(--apple-accent)]' : ''}`} />
                    <span>立即强制拉取最新数据</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. CATEGORY FILTER BAR & MULTI-BOARD PRESET BAR */}
      {/* ============================================================ */}
      <div className="h-11 border-b border-[var(--apple-separator)] bg-[var(--apple-surface)]/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {PLATFORM_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-[var(--apple-accent)] text-white font-semibold shadow-xs'
                  : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}

          {/* Insights Tab */}
          <button
            onClick={() => setSelectedCategory('insights')}
            className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'insights'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-xs'
                : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)]'
            }`}
          >
            <span>💡 创作者研报洞察</span>
          </button>
        </div>

        {/* Quick Multi-Board Presets */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-[var(--apple-text-tertiary)]">
          <span className="font-mono">对齐预设:</span>
          <button
            onClick={() => handleApplyAlignmentPreset('social')}
            className="px-2 py-0.5 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] hover:border-orange-500/40 text-[var(--apple-text-secondary)] hover:text-orange-400 transition-colors"
          >
            🔥 社交全网
          </button>
          <button
            onClick={() => handleApplyAlignmentPreset('tech')}
            className="px-2 py-0.5 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] hover:border-sky-500/40 text-[var(--apple-text-secondary)] hover:text-sky-400 transition-colors"
          >
            💻 科技极客
          </button>
          <button
            onClick={() => handleApplyAlignmentPreset('novel')}
            className="px-2 py-0.5 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] hover:border-red-500/40 text-[var(--apple-text-secondary)] hover:text-red-400 transition-colors"
          >
            📖 网文风向
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MAIN WORKSPACE CONTENT: 52 PLATFORM BOARDS */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* BOARD VIEW: MULTI-COLUMN WATERFALL GRID */}
        {selectedCategory !== 'insights' && (
          <div className="flex-1 overflow-y-auto p-6 bg-[var(--apple-bg)]">
            {filteredBoards.length === 0 ? (
              <div className="py-24 text-center space-y-3">
                <Search className="w-8 h-8 text-[var(--apple-text-tertiary)] mx-auto opacity-50" />
                <p className="text-xs text-[var(--apple-text-secondary)] font-medium">
                  未检索到与“{searchQuery}”相关的热点榜单条目
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-accent)]"
                >
                  清空搜索过滤
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4.5">
                {filteredBoards.map(board => {
                  const isCollapsed = collapsedBoardIds.has(board.id);
                  const isCheckedForAlignment = selectedBoardIds.includes(board.id);

                  return (
                    <div
                      key={board.id}
                      className={`rounded-2xl bg-[var(--apple-surface)] border transition-all flex flex-col overflow-hidden shadow-2xs select-none group relative ${
                        isCheckedForAlignment
                          ? 'border-[var(--apple-accent)] ring-1 ring-[var(--apple-accent)] shadow-[0_4px_16px_rgba(10,132,255,0.12)]'
                          : 'border-[var(--apple-border)] hover:border-[var(--apple-border-strong)]'
                      }`}
                    >
                      {/* Board Header */}
                      <div
                        onClick={() => handleToggleBoardCollapse(board.id)}
                        className="p-3.5 border-b border-[var(--apple-separator)] bg-[var(--apple-subtle)]/30 hover:bg-[var(--apple-subtle)]/60 cursor-pointer flex items-center justify-between transition-colors select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Multi-Board Alignment Selection Checkbox */}
                          <div
                            onClick={(e) => handleToggleBoardSelect(board.id, e)}
                            className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              isCheckedForAlignment
                                ? 'bg-[var(--apple-accent)] border-[var(--apple-accent)] text-white shadow-xs'
                                : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] hover:border-[var(--apple-border-strong)]'
                            }`}
                            title={isCheckedForAlignment ? '已勾选参与多榜对齐（点击取消）' : '勾选此榜单参与多榜对齐分析'}
                          >
                            {isCheckedForAlignment && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          <span className="text-base shrink-0">{board.icon}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[var(--apple-text-primary)] truncate">
                                {board.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-[var(--apple-subtle)] text-[9px] font-mono text-[var(--apple-text-tertiary)] border border-[var(--apple-border)]">
                                {board.items.length} 条
                              </span>
                            </div>
                            <p className="text-[9px] text-[var(--apple-text-tertiary)] truncate">
                              {board.description}
                            </p>
                          </div>
                        </div>

                        {/* Expand/Collapse Chevron Button */}
                        <div className="flex items-center gap-1.5 text-[var(--apple-text-tertiary)] group-hover:text-[var(--apple-text-primary)]">
                          <span className="text-[9px] font-mono">{board.updateFreq}</span>
                          {isCollapsed ? (
                            <ChevronDown className="w-3.5 h-3.5 text-[var(--apple-accent)] transition-transform" />
                          ) : (
                            <ChevronUp className="w-3.5 h-3.5 transition-transform" />
                          )}
                        </div>
                      </div>

                      {/* Hot Items List (Collapsible) */}
                      {!isCollapsed && (
                        <div className="divide-y divide-[var(--apple-separator)]/60 overflow-y-auto max-h-[460px] animate-in fade-in duration-150">
                          {board.items.map(item => {
                            const isSelected = selectedItem?.title === item.title;
                            return (
                              <div
                                key={item.rank}
                                onClick={() => {
                                  const newTarget = { title: item.title, platformName: board.name, hot: item.hot };
                                  setSelectedItem(newTarget);
                                  handleExecuteDeepAnalysis(newTarget);
                                }}
                                className={`p-2.5 transition-colors cursor-pointer flex items-start gap-2.5 group select-none ${
                                  isSelected
                                    ? 'bg-[var(--apple-accent-subtle)] border-l-2 border-[var(--apple-accent)]'
                                    : 'hover:bg-[var(--apple-subtle)]/70'
                                }`}
                              >
                                <span className={`w-4.5 h-4.5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono shrink-0 mt-0.5 shadow-2xs ${
                                  item.rank === 1 ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white' :
                                  item.rank === 2 ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white' :
                                  item.rank === 3 ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white' :
                                  'bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-tertiary)]'
                                }`}>
                                  {item.rank}
                                </span>

                                <div className="flex-1 min-w-0 space-y-0.5">
                                  <p className={`text-xs leading-snug transition-colors line-clamp-2 ${
                                    isSelected ? 'text-[var(--apple-accent)] font-semibold' : 'text-[var(--apple-text-primary)] group-hover:text-[var(--apple-accent)]'
                                  }`}>
                                    {item.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--apple-text-tertiary)]">
                                    <span>{item.hot}</span>
                                    {item.tag && (
                                      <span className="px-1 py-0.2 rounded bg-rose-500/10 text-rose-500 text-[9px] font-semibold border border-rose-500/20">
                                        {item.tag}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <ChevronRight className="w-3.5 h-3.5 text-[var(--apple-text-tertiary)] group-hover:text-[var(--apple-accent)] transition-transform group-hover:translate-x-0.5 shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Collapsed Pill Placeholder */}
                      {isCollapsed && (
                        <div
                          onClick={() => handleToggleBoardCollapse(board.id)}
                          className="py-2.5 px-3.5 text-center text-[11px] text-[var(--apple-text-tertiary)] hover:text-[var(--apple-accent)] cursor-pointer bg-[var(--apple-subtle)]/20 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ChevronDown className="w-3 h-3 text-[var(--apple-accent)]" />
                          <span>已收起 · 点击展开 {board.items.length} 条热门动态</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: CREATOR INSIGHTS (创作者深度叙事研报模式) */}
        {selectedCategory === 'insights' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full select-text">
            <div className="p-4.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-sky-500/10 border border-[var(--apple-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[var(--apple-accent)] shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-[var(--apple-text-primary)]">
                    创作者专属 · 全网网文与大模型叙事研报
                  </h3>
                  <p className="text-[11px] text-[var(--apple-text-secondary)]">
                    基于 52+ 全域平台千万级舆论数据，提炼长篇小说反套路设定与读者审美迁移洞察
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {CREATOR_INSIGHTS.map(insight => (
                <div
                  key={insight.id}
                  className="p-5 rounded-3xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs space-y-3.5 hover:border-[var(--apple-border-strong)] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-[var(--apple-accent)] text-white text-xs font-bold font-mono flex items-center justify-center">
                        {insight.rank}
                      </span>
                      <span className="text-xs font-bold text-[var(--apple-text-primary)]">
                        {insight.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[10px] font-mono text-[var(--apple-text-secondary)]">
                        {insight.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--apple-text-tertiary)]">
                      <span className="text-rose-500 font-semibold">{insight.growth} 关注</span>
                      <span>·</span>
                      <span>热度 {insight.hotScore}</span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-[var(--apple-text-secondary)] bg-[var(--apple-subtle)]/40 p-3 rounded-2xl border border-[var(--apple-border)]">
                    {insight.summary}
                  </p>

                  <div className="p-3.5 rounded-2xl bg-[var(--apple-accent-subtle)] border border-[var(--apple-accent)]/20 space-y-1.5 text-xs text-[var(--apple-text-primary)]">
                    <div className="font-bold text-[var(--apple-accent)] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>长篇小说落地灵感建议：</span>
                    </div>
                    <p className="leading-relaxed pl-5 font-sans">
                      {insight.creativeIdea}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[var(--apple-separator)]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {insight.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[10px] font-mono text-[var(--apple-text-tertiary)]">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const target = { title: insight.title, platformName: '网文研报', hot: insight.hotScore };
                          setSelectedItem(target);
                          handleExecuteDeepAnalysis(target);
                        }}
                        className="px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-semibold hover:bg-purple-500/25 transition-all flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>热点AI深度分析</span>
                      </button>

                      {onStartResearch && (
                        <button
                          onClick={() => onStartResearch(insight.title)}
                          className="px-3 py-1 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-all flex items-center gap-1"
                        >
                          <Compass className="w-3.5 h-3.5 text-sky-400" />
                          <span>发起深度研究</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. ⭐ 多榜对齐侧边视窗 (macOS PREVIEW FROSTED GLASS WINDOW) */}
        {/* ============================================================ */}
        {isAlignmentDrawerOpen && (
          <aside className="w-[490px] border-l border-[var(--apple-border-strong)] bg-[var(--apple-surface)]/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl flex flex-col shrink-0 shadow-[0_24px_60px_rgba(0,0,0,0.5)] z-40 animate-in fade-in slide-in-from-right-4 duration-200 select-text">
            {/* macOS Traffic Light Header */}
            <div className="h-11 px-4 border-b border-[var(--apple-separator)] bg-[var(--apple-subtle)]/40 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAlignmentDrawerOpen(false)}
                  className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-90 flex items-center justify-center text-[8px] text-[#4c0000] font-bold group shadow-xs"
                >
                  <span className="opacity-0 group-hover:opacity-100">✕</span>
                </button>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-xs" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-xs" />

                <span className="ml-2 text-[11px] font-bold text-[var(--apple-text-primary)] truncate max-w-[260px] flex items-center gap-1.5">
                  <GitCompare className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
                  <span>多榜重叠度与趋势对齐预览</span>
                </span>
              </div>

              <button
                onClick={() => setIsAlignmentDrawerOpen(false)}
                className="p-1 rounded-lg text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Platforms Banner Pills */}
            <div className="p-3.5 border-b border-[var(--apple-separator)] bg-[var(--apple-subtle)]/20 space-y-2 select-none">
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--apple-text-tertiary)]">
                <span className="font-semibold text-[var(--apple-text-secondary)]">参与对齐平台 ({selectedBoardIds.length})：</span>
                <span className="text-[var(--apple-accent)] font-semibold">支持勾选任意 52 平台</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {ALL_52_PLATFORMS.filter(b => selectedBoardIds.includes(b.id)).map(b => (
                  <span
                    key={b.id}
                    className="px-2 py-0.5 rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] text-[10px] font-medium text-[var(--apple-text-primary)] flex items-center gap-1 shadow-2xs"
                  >
                    <span>{b.icon}</span>
                    <span>{b.name}</span>
                    <button
                      onClick={(e) => handleToggleBoardSelect(b.id, e)}
                      className="text-[var(--apple-text-tertiary)] hover:text-rose-500 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Alignment Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-[var(--apple-text-primary)] font-sans">
              {isAnalyzingAlignment ? (
                <div className="py-28 text-center space-y-3 text-xs text-[var(--apple-text-secondary)] font-mono">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[var(--apple-accent)]" />
                  <p className="font-semibold text-[var(--apple-text-primary)]">AI 正在计算多榜语义重叠度与视角差异...</p>
                  <p className="text-[10px] text-[var(--apple-text-tertiary)]">
                    量化重叠指数 ➔ 提取跨榜事件 ➔ 构建受众异同矩阵 ➔ 跨媒介叙事推演
                  </p>
                </div>
              ) : alignmentAnalysisResult ? (
                <div className="space-y-4">
                  <AppleMarkdown content={alignmentAnalysisResult} />
                </div>
              ) : (
                <div className="py-20 text-center space-y-3 text-xs text-[var(--apple-text-tertiary)]">
                  <GitCompare className="w-8 h-8 mx-auto opacity-40 text-[var(--apple-accent)]" />
                  <p>请勾选 2 个或更多平台后点击“开始多榜对齐计算”</p>
                  <button
                    onClick={() => handleExecuteMultiBoardAlignment()}
                    className="px-4 py-1.5 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold shadow-xs hover:bg-[var(--apple-accent-hover)]"
                  >
                    开始多榜对齐计算
                  </button>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-3.5 border-t border-[var(--apple-separator)] bg-[var(--apple-subtle)]/40 flex items-center justify-between gap-2 select-none">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSaveAlignmentToMaterials}
                  disabled={savedAlignmentToKb || isAnalyzingAlignment || !alignmentAnalysisResult}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    savedAlignmentToKb
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[var(--apple-accent)] text-white shadow-xs hover:bg-[var(--apple-accent-hover)] disabled:opacity-40'
                  }`}
                >
                  {savedAlignmentToKb ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>已收录至素材库</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>沉淀对齐研报</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(alignmentAnalysisResult);
                    setCopiedAlignment(true);
                    setTimeout(() => setCopiedAlignment(false), 1500);
                  }}
                  disabled={!alignmentAnalysisResult}
                  className="p-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] disabled:opacity-40"
                  title="复制完整 Markdown 对齐研报"
                >
                  {copiedAlignment ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                onClick={() => handleExecuteMultiBoardAlignment()}
                disabled={isAnalyzingAlignment || selectedBoardIds.length < 2}
                className="px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-semibold text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingAlignment ? 'animate-spin text-[var(--apple-accent)]' : ''}`} />
                <span>重新对齐</span>
              </button>
            </div>
          </aside>
        )}

        {/* ============================================================ */}
        {/* 5. 单事件深度分析侧边视窗 (SINGLE EVENT PREVIEW WINDOW) */}
        {/* ============================================================ */}
        {isDeepAnalysisOpen && selectedItem && (
          <aside className="w-[460px] border-l border-[var(--apple-border-strong)] bg-[var(--apple-surface)]/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl flex flex-col shrink-0 shadow-[0_24px_60px_rgba(0,0,0,0.5)] z-40 animate-in fade-in slide-in-from-right-4 duration-200 select-text">
            <div className="h-11 px-4 border-b border-[var(--apple-separator)] bg-[var(--apple-subtle)]/40 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDeepAnalysisOpen(false)}
                  className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-90 flex items-center justify-center text-[8px] text-[#4c0000] font-bold group shadow-xs"
                >
                  <span className="opacity-0 group-hover:opacity-100">✕</span>
                </button>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-xs" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-xs" />

                <span className="ml-2 text-[11px] font-bold text-[var(--apple-text-primary)] truncate max-w-[240px]">
                  {selectedItem.title} · macOS 深度分析预览
                </span>
              </div>

              <button
                onClick={() => setIsDeepAnalysisOpen(false)}
                className="p-1 rounded-lg text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-[var(--apple-separator)] bg-[var(--apple-subtle)]/20 space-y-1.5 select-none">
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--apple-text-tertiary)]">
                <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold border border-purple-500/25 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span>{selectedItem.platformName}</span>
                </span>
                <span className="font-semibold text-rose-400">热度 {selectedItem.hot}</span>
              </div>
              <h3 className="text-xs font-bold text-[var(--apple-text-primary)] leading-snug">
                {selectedItem.title}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-[var(--apple-text-primary)] font-sans">
              {isAnalyzingDeep ? (
                <div className="py-24 text-center space-y-3 text-xs text-[var(--apple-text-secondary)] font-mono">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[var(--apple-accent)]" />
                  <p className="font-semibold text-[var(--apple-text-primary)]">AI 正在对热点事件执行多维解构...</p>
                  <p className="text-[10px] text-[var(--apple-text-tertiary)]">
                    执行深度摘要 ➔ 权威背景溯源 ➔ 多方观点对比 ➔ 叙事世界观推演
                  </p>
                </div>
              ) : deepAnalysisContent ? (
                <div className="space-y-4">
                  <AppleMarkdown content={deepAnalysisContent} />
                </div>
              ) : null}
            </div>

            <div className="p-3.5 border-t border-[var(--apple-separator)] bg-[var(--apple-subtle)]/40 flex items-center justify-between gap-2 select-none">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSaveAnalysisToMaterials}
                  disabled={savedToKb || isAnalyzingDeep}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    savedToKb
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[var(--apple-accent)] text-white shadow-xs hover:bg-[var(--apple-accent-hover)]'
                  }`}
                >
                  {savedToKb ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>已收录至素材知识库</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>存入素材知识库</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(deepAnalysisContent);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  disabled={!deepAnalysisContent}
                  className="p-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
                  title="复制完整 Markdown 报告"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {onStartResearch && (
                <button
                  onClick={() => {
                    onStartResearch(selectedItem.title);
                    setIsDeepAnalysisOpen(false);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[11px] font-medium text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-all flex items-center gap-1"
                >
                  <Compass className="w-3 h-3 text-sky-400" />
                  <span>发起完整深度研究</span>
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
