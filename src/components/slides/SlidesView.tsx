import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Presentation, 
  Plus, 
  Play, 
  Download, 
  Sparkles, 
  Layers, 
  Palette, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Layout, 
  Mic, 
  Check, 
  X, 
  Wand2, 
  Sliders, 
  Compass, 
  Scale, 
  Columns, 
  ListOrdered, 
  Share2, 
  MonitorPlay, 
  RotateCcw, 
  Upload, 
  Send, 
  MessageSquare, 
  Edit3, 
  CheckCircle2, 
  BookmarkPlus, 
  SlidersHorizontal, 
  FolderOpen, 
  Split, 
  Eye, 
  Type, 
  FileCode, 
  FileUp, 
  Maximize, 
  Minimize2, 
  FileCheck2, 
  Bot, 
  Lightbulb, 
  ListPlus, 
  Zap, 
  CornerDownRight, 
  Home,
  Save,
  Printer,
  ShieldCheck,
  Undo2,
  Redo2,
  FileDown,
  FilePlus,
  Image as ImageIcon,
  Table as TableIcon,
  Film,
  Music,
  Move,
  Clock,
  SpellCheck,
  Grid,
  Search,
  Settings2,
  SlidersVertical,
  Maximize as FullscreenIcon,
  HelpCircle,
  Scan,
  Scissors,
  Clipboard,
  PaintRoller,
  LayoutGrid,
  Hash,
  LineChart as LineChartIcon,
  GitFork,
  Link2,
  Droplets,
  Pointer,
  Sparkle,
  Gauge,
  Boxes,
  Activity,
  Layers3,
  Pipette,
  Sun,
  Moon,
  Brush,
  History,
  Lock,
  ShieldAlert,
  Globe,
  PlusSquare,
  CopyPlus,
  FolderPlus,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  CheckSquare,
  SearchCheck,
  BarChart2,
  PieChart,
  Radar,
  UploadCloud,
  Shapes,
  Wand,
  PlayCircle,
  Radio,
  Video,
  Contrast,
  FileDigit,
  Grid2x2,
  ListTree,
  Wrench,
  Languages,
  Expand,
  Minus,
  ArrowRight,
  Code,
  Menu,
  Cloud
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

export type RibbonTab = 
  | 'file' 
  | 'home' 
  | 'insert' 
  | 'design' 
  | 'transitions' 
  | 'animations' 
  | 'slideshow' 
  | 'review' 
  | 'view' 
  | 'tools' 
  | 'ai_hub'
  | 'contextual';

export type SlideLayout = 'title' | 'agenda' | 'points' | 'split' | 'quote' | 'conclusion';
export type SlideTheme = 'obsidian' | 'titanium' | 'aurora' | 'ivory';
export type TransitionEffect = 'magic_move' | 'cube' | 'blur_depth' | 'fade';
export type AnimationEffect = 'spring_in' | 'blur_in' | 'float_up';

export interface BentoCard {
  tag: string;
  title: string;
  desc: string;
  grad: string;
}

export interface MetricItem {
  val: string;
  lbl: string;
}

export interface ElementData {
  id: string;
  type: 'heading' | 'paragraph' | 'tag' | 'metric-row' | 'bento-grid' | 'quote-split' | 'metric-highlight';
  content?: string;
  classes?: string;
  items?: MetricItem[];
  cards?: BentoCard[];
  bigNum?: string;
  bigLabel?: string;
  metrics?: { t: string; v: string; g: string }[];
  quote?: string;
  author?: string;
  bullets?: string[];
}

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  theme: SlideTheme;
  notes: string;
  badge?: string;
  layout: SlideLayout;
  transition?: TransitionEffect;
  animation?: AnimationEffect;
  elements: ElementData[];
}

export interface SmartPalette {
  id: SlideTheme;
  name: string;
  bgClass: string;
  accentColor: string;
  secondaryColor: string;
  gradPair: string;
  contextDesc: string;
}

const SMART_PALETTES: Record<SlideTheme, SmartPalette> = {
  obsidian: {
    id: 'obsidian',
    name: 'Apple 极简黑曜 (Obsidian)',
    bgClass: 'bg-[#0c0c0f] text-white border-white/10 shadow-2xl',
    accentColor: '#0071e3',
    secondaryColor: '#2997ff',
    gradPair: 'from-blue-600/20 to-purple-600/10',
    contextDesc: '硬核科技 • 发布会 Keynote • 空间计算'
  },
  titanium: {
    id: 'titanium',
    name: '原色钛金属 (Titanium)',
    bgClass: 'bg-gradient-to-br from-[#1c1c20] via-[#26262d] to-[#121215] text-white border-white/15 shadow-2xl',
    accentColor: '#ff9f0a',
    secondaryColor: '#ffd60a',
    gradPair: 'from-amber-600/20 to-orange-600/10',
    contextDesc: '精密硬件 • 工业设计 • 奢华质感'
  },
  aurora: {
    id: 'aurora',
    name: '极光流体 (Aurora)',
    bgClass: 'bg-gradient-to-br from-[#0c1424] via-[#1a0f28] to-[#08080d] text-white border-purple-500/20 shadow-2xl',
    accentColor: '#af52de',
    secondaryColor: '#63e6e2',
    gradPair: 'from-purple-600/20 to-pink-600/10',
    contextDesc: '艺术叙事 • AI 前沿 • 品牌宣发'
  },
  ivory: {
    id: 'ivory',
    name: '润白陶瓷 (Ivory Pro)',
    bgClass: 'bg-gradient-to-br from-[#f5f5f7] via-[#e5e5ea] to-[#dcdce0] text-zinc-900 border-zinc-300 shadow-xl',
    accentColor: '#0071e3',
    secondaryColor: '#005bb5',
    gradPair: 'from-blue-500/10 to-indigo-500/10',
    contextDesc: '学术路演 • 商业财报 • 清爽通透'
  }
};

const INITIAL_SLIDES: Slide[] = [
  {
    id: 'slide-1',
    title: '2026 Apple 空间计算与硬件生态战略',
    subtitle: '无界视野 • 端侧神经模型 • 纯粹物理质感',
    theme: 'obsidian',
    layout: 'title',
    notes: '【开场演说】语调沉稳自然，停顿 2 秒后开场：“今天，我们将一同见证个人计算的下一场跃迁。”',
    badge: 'KEYNOTE 2026',
    transition: 'magic_move',
    animation: 'spring_in',
    elements: [
      {
        id: 'elem-1-tag',
        type: 'tag',
        content: 'SPECIAL EVENT KEYNOTE • CUPERTINO 2026',
        classes: 'text-xs font-semibold tracking-widest text-blue-400 uppercase mb-2 inline-block'
      },
      {
        id: 'elem-1-h1',
        type: 'heading',
        content: '空间计算，<br><span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500 font-black">步入无界时代。</span>',
        classes: 'text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-4'
      },
      {
        id: 'elem-1-desc',
        type: 'paragraph',
        content: '搭载全新 M5 神经矩阵芯片与超轻量微透镜光机，为全球专业创作者重塑三维人机协同体验。',
        classes: 'text-xs md:text-sm text-zinc-400 max-w-xl leading-relaxed mb-6'
      },
      {
        id: 'elem-1-stats',
        type: 'metric-row',
        items: [
          { val: '4.8x', lbl: '端侧张量算力' },
          { val: '< 2.2ms', lbl: '毫秒级运动到光子延迟' },
          { val: '100%', lbl: '100% 航天级再生钛金属' }
        ]
      }
    ]
  },
  {
    id: 'slide-2',
    title: 'Bento Grid 便当盒模块化矩阵',
    subtitle: '高集成度与直觉交互的交融',
    theme: 'obsidian',
    layout: 'points',
    notes: '【便当盒卡片拆解】依次展开 Vision Pro SE 的轻量级普及、神经指环与 M5 算力底座。',
    badge: '硬件规格',
    transition: 'blur_depth',
    animation: 'blur_in',
    elements: [
      {
        id: 'elem-2-h',
        type: 'heading',
        content: '全新个人计算硬件矩阵',
        classes: 'text-2xl font-bold text-white mb-2'
      },
      {
        id: 'elem-2-bento',
        type: 'bento-grid',
        cards: [
          { tag: '旗舰空间视界', title: 'Apple Vision Pro SE', desc: '整机减重 44%，双目 8K Micro-OLED，售价下探至主流消费级市场。', grad: 'from-blue-600/20 to-purple-600/10' },
          { tag: '隐形神经手势', title: 'Apple Neural Ring', desc: '原色钛金属拉丝，微肌电生物电极，实现无感知空中微捏合操控。', grad: 'from-amber-600/20 to-orange-600/10' },
          { tag: '算力核心', title: 'Apple M5 Max', desc: '台积电 2nm 先进制程，集成双神经引擎与统一内存架构，支持本地运行万亿 MoE。', grad: 'from-emerald-600/20 to-teal-600/10' },
          { tag: '声学空间追踪', title: 'AirPods Spatial Vision', desc: '声波雷达与动态头部定位，实现电影级空间音频与实时同声传译。', grad: 'from-pink-600/20 to-rose-600/10' }
        ]
      }
    ]
  },
  {
    id: 'slide-3',
    title: '核心爆发性指标与增长曲线',
    subtitle: '高净值生态飞轮与量化渗透',
    theme: 'obsidian',
    layout: 'split',
    notes: '【面向投资人】强调服务的粘性与硬件的高续费率。',
    badge: '量化增长',
    transition: 'fade',
    animation: 'float_up',
    elements: [
      {
        id: 'elem-3-h',
        type: 'heading',
        content: '生态变现飞轮与确定性增长',
        classes: 'text-2xl font-bold text-white mb-2'
      },
      {
        id: 'elem-3-metric-block',
        type: 'metric-highlight',
        bigNum: '91.8%',
        bigLabel: '空间操作系统生态年留存率 (行业首位)',
        metrics: [
          { t: '空间硬件预计年出货量', v: '1,420 万台', g: '+188% 同比增长' },
          { t: '高毛利服务业务营收', v: '$38.4 B', g: '+32% 同比增长' },
          { t: '全球活跃开发者矩阵', v: '420 万人', g: '创历史新高' }
        ]
      }
    ]
  },
  {
    id: 'slide-4',
    title: '设计哲学：Think Different 经典回响',
    subtitle: '工业设计与人道主义精神',
    theme: 'obsidian',
    layout: 'quote',
    notes: '【总结页】语调放缓，致敬经典。',
    badge: '思考回响',
    elements: [
      {
        id: 'elem-4-quote',
        type: 'quote-split',
        quote: '“致那些疯狂的人，他们特立独行，他们桀骜不驯，他们格格不入……他们推动了人类的向前。”',
        author: '— Steve Jobs (1997)',
        bullets: [
          '极简是复杂的终极形式。',
          '将最尖端的人工智能隐藏在理所当然的日常交互之下。',
          '不仅制造硬件，更赋予思考与创造的自由。'
        ]
      }
    ]
  }
];

export const SlidesView: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  // Navigation & UI States
  const [activeRibbonTab, setActiveRibbonTab] = useState<RibbonTab>('home');
  const [activeSidebarMode, setActiveSidebarMode] = useState<'inspector' | 'smart_layout' | 'copilot'>('smart_layout');
  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Undo/Redo Stacks
  const [history, setHistory] = useState<Slide[][]>([INITIAL_SLIDES]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Selection & Inspector
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '16:10' | '4:3'>('16:9');
  const [showGridLines, setShowGridLines] = useState(false);

  // Smart Theme Palette Popover Engine
  const [showPalettePopover, setShowPalettePopover] = useState(false);
  const [isFileDrawerOpen, setIsFileDrawerOpen] = useState(false);

  // Marquee Selection Box Engine
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const [isMarqueeDragging, setIsMarqueeDragging] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState({ x: 0, y: 0 });
  const [marqueeRect, setMarqueeRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Presenter Fullscreen & Laser
  const [isPresenterActive, setIsPresenterActive] = useState(false);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Modals
  const [activeModal, setActiveModal] = useState<'topic' | 'link' | 'import' | 'print' | null>(null);

  // Copilot Chat Messages
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: '您好，我是 **Keynote AI Copilot**。您可以通过自然语言指挥我重构排版、转换主题或提炼量化数字。' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const activeSlide = slides[activeSlideIndex] || slides[0];
  const currentPalette = SMART_PALETTES[activeSlide.theme || 'obsidian'];

  // Smart Layout Assistant Density Analytics
  const contentDensityMetric = useMemo(() => {
    let charCount = activeSlide.title.length + activeSlide.subtitle.length;
    let itemsCount = activeSlide.elements.length;

    activeSlide.elements.forEach(e => {
      if (e.content) charCount += e.content.length;
      if (e.items) itemsCount += e.items.length;
      if (e.cards) itemsCount += e.cards.length * 2;
      if (e.bullets) itemsCount += e.bullets.length;
    });

    const score = Math.min(100, Math.round((charCount * 0.4) + (itemsCount * 8)));
    let statusText = '适中平衡 · 适合标准演说';

    if (score < 40) {
      statusText = '极简高透 · 留白气场强';
    } else if (score > 70) {
      statusText = '信息偏稠密 · 建议卡片化';
    }

    return { score, statusText, charCount, itemsCount };
  }, [activeSlide]);

  // Record History
  const pushHistory = (newSlides: Slide[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newSlides);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setSlides(newSlides);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSlides(history[historyIndex - 1]);
      showToast('已撤销 (⌘Z)');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSlides(history[historyIndex + 1]);
      showToast('已重做 (⌘Y)');
    }
  };

  // SMART THEME PALETTE ENGINE
  const applySmartPaletteToDeck = (themeKey: SlideTheme) => {
    const pal = SMART_PALETTES[themeKey];
    showToast(`✦ 正在将全案色板重置为【${pal.name}】...`);

    const nextSlides = slides.map(s => {
      const nextElements = s.elements.map(e => {
        if (e.type === 'bento-grid' && e.cards) {
          const nextCards = e.cards.map(c => ({
            ...c,
            grad: pal.gradPair
          }));
          return { ...e, cards: nextCards };
        }
        return e;
      });
      return {
        ...s,
        theme: themeKey,
        elements: nextElements
      };
    });

    pushHistory(nextSlides);
    setShowPalettePopover(false);
    showToast(`已成功装配【${pal.name}】调性！`);
  };

  // Presenter Timer
  useEffect(() => {
    let timer: any = null;
    if (isPresenterActive) {
      timer = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isPresenterActive]);

  // Laser Pointer Coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isLaserActive) {
        setLaserPos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isLaserActive]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPresenterActive) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          setActiveSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          setActiveSlideIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Escape') {
          setIsPresenterActive(false);
        } else if (e.key.toLowerCase() === 'l') {
          setIsLaserActive(l => !l);
          showToast(isLaserActive ? '已关闭激光笔' : '已开启模拟激光笔');
        }
      } else {
        if (e.key === 'Escape') {
          setSelectedElementId(null);
          setMarqueeRect(null);
          setIsFileDrawerOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenterActive, slides.length, isLaserActive]);

  // Marquee Selection Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMarqueeActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsMarqueeDragging(true);
    setMarqueeStart({ x, y });
    setMarqueeRect({ x, y, w: 0, h: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMarqueeDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const curX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const curY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const x = Math.min(marqueeStart.x, curX);
    const y = Math.min(marqueeStart.y, curY);
    const w = Math.abs(curX - marqueeStart.x);
    const h = Math.abs(curY - marqueeStart.y);

    setMarqueeRect({ x, y, w, h });
  };

  const handlePointerUp = () => {
    if (!isMarqueeDragging) return;
    setIsMarqueeDragging(false);
    if (!marqueeRect || marqueeRect.w < 30 || marqueeRect.h < 30) {
      setMarqueeRect(null);
    }
  };

  const applyMarqueeAI = (type: 'bento' | 'metric' | 'contrast') => {
    showToast(`正在重塑框选区域为 ${type === 'bento' ? 'Bento便当盒' : type === 'metric' ? '核心数据指标' : '双栏对比'}...`);
    setMarqueeRect(null);

    setTimeout(() => {
      const nextSlides = [...slides];
      if (type === 'bento') {
        nextSlides[activeSlideIndex].elements[1] = {
          id: `elem-bento-${Date.now()}`,
          type: 'bento-grid',
          cards: [
            { tag: '区域特性 A', title: '空间神经直觉操控', desc: '利用区域重构提取的核心论点。', grad: 'from-blue-600/20 to-indigo-600/10' },
            { tag: '区域特性 B', title: '钛金属超轻机身', desc: '保持 Apple 工业设计极致手感。', grad: 'from-zinc-600/20 to-stone-600/10' }
          ]
        };
      } else {
        nextSlides[activeSlideIndex].elements[1] = {
          id: `elem-metric-${Date.now()}`,
          type: 'metric-row',
          items: [
            { val: '99.4%', lbl: '准确率指标' },
            { val: '3.4x', lbl: '效率提升倍数' },
            { val: '< 10ms', lbl: '响应速度' }
          ]
        };
      }
      pushHistory(nextSlides);
      showToast('区域 AI 视觉重构完成！');
    }, 600);
  };

  // Copilot Command Dispatch
  const handleSendChatPrompt = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      if (userText.includes('三列') || userText.includes('卡片')) {
        const nextSlides = [...slides];
        nextSlides[activeSlideIndex].elements[1] = {
          id: `bento-gen-${Date.now()}`,
          type: 'bento-grid',
          cards: [
            { tag: '维度 01', title: '空间交互重构', desc: '手势与眼动微米级捕捉。', grad: 'from-blue-600/20 to-purple-600/10' },
            { tag: '维度 02', title: '双神经引擎', desc: '端侧 320 亿多模态模型常驻。', grad: 'from-emerald-600/20 to-teal-600/10' }
          ]
        };
        pushHistory(nextSlides);
        setChatMessages(prev => [...prev, { role: 'assistant', text: '已为您将当前页内容转化为符合 Apple 规范的 Bento 便当盒卡片排版。' }]);
      } else if (userText.includes('量化') || userText.includes('指标') || userText.includes('数字')) {
        const nextSlides = [...slides];
        nextSlides[activeSlideIndex].elements[1] = {
          id: `metric-gen-${Date.now()}`,
          type: 'metric-row',
          items: [
            { val: '3.8x', lbl: '吞吐峰值提升' },
            { val: '99.9%', lbl: '端侧指令命中率' },
            { val: '$45 B', lbl: '新增生态市场空间' }
          ]
        };
        pushHistory(nextSlides);
        setChatMessages(prev => [...prev, { role: 'assistant', text: '已为您提取出 3 个量化大数字指标，并在视觉上做了放大对比排版。' }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', text: `已解析并应用指令: ${userText}` }]);
      }
    }, 600);
  };

  // Add Slide
  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: '全新未命名幻灯片',
      subtitle: '点击在此编辑副标题',
      theme: 'obsidian',
      notes: '',
      layout: 'points',
      badge: 'NEW',
      elements: [
        { id: `el-h-${Date.now()}`, type: 'heading', content: '在此键入核心大标题', classes: 'text-3xl font-bold text-white mb-2' },
        { id: `el-p-${Date.now()}`, type: 'paragraph', content: '双击文本进行自由输入，或呼唤右侧 AI 助手一键重构...', classes: 'text-xs text-zinc-400 max-w-lg mb-4' }
      ]
    };
    const nextSlides = [...slides];
    nextSlides.splice(activeSlideIndex + 1, 0, newSlide);
    pushHistory(nextSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
    showToast('已添加新幻灯片');
  };

  // Duplicate Slide
  const handleDuplicateSlide = (idx?: number) => {
    const targetIdx = idx !== undefined ? idx : activeSlideIndex;
    const copy = JSON.parse(JSON.stringify(slides[targetIdx]));
    copy.id = `slide-${Date.now()}`;
    const nextSlides = [...slides];
    nextSlides.splice(targetIdx + 1, 0, copy);
    pushHistory(nextSlides);
    setActiveSlideIndex(targetIdx + 1);
    showToast('页面已重制');
  };

  // Delete Slide
  const handleDeleteSlide = (idx?: number) => {
    if (slides.length <= 1) {
      showToast('请至少保留一张幻灯片');
      return;
    }
    const targetIdx = idx !== undefined ? idx : activeSlideIndex;
    const nextSlides = slides.filter((_, i) => i !== targetIdx);
    pushHistory(nextSlides);
    setActiveSlideIndex(Math.min(activeSlideIndex, nextSlides.length - 1));
    showToast('幻灯片已删除');
  };

  // Save to Material
  const handleSaveToMaterialVault = () => {
    const title = `Keynote演示案: ${activeSlide.title}`;
    const body = `全套演示文稿（共 ${slides.length} 页）:\n- 当前页: ${activeSlide.title}\n- 色板风格: ${currentPalette.name}\n- 讲者选段: ${activeSlide.notes}`;
    
    showToast('已存入素材知识库！');
    if (onSaveToMaterial) {
      onSaveToMaterial(title, body);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#09090d] text-slate-100 font-sans select-none relative">
      {/* Apple Dynamic Toast Pill */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#181820]/95 border border-white/20 text-white text-xs font-semibold shadow-2xl flex items-center space-x-2 backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DYNAMIC ISLAND TOP TELEMETRY PILL */}
      <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
        <div className="px-4 py-1.5 rounded-full bg-black/90 backdrop-blur-2xl text-white text-xs font-mono shadow-2xl flex items-center space-x-3.5 border border-white/15">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
          </span>
          <div className="flex items-center space-x-1.5 font-sans">
            <span className="font-bold text-white/90">第 {activeSlideIndex + 1} / {slides.length} 页</span>
            <span className="text-[10px] text-zinc-400">· {currentPalette.name}</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono">
            <span className="text-purple-400 font-bold">{aspectRatio} UHD</span>
            <span>·</span>
            <span className="text-teal-300 font-bold">Keynote AI ULTRA</span>
          </div>
        </div>
      </div>

      {/* 1. TOP TITANIUM QUICK ACCESS BAR */}
      <header className="h-11 bg-[#111115] border-b border-white/10 px-3.5 flex items-center justify-between shrink-0 z-40 select-none">
        <div className="flex items-center space-x-3">
          {/* Traffic Lights */}
          <div className="flex items-center space-x-1.5 mr-1">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>

          {/* Brand Badge */}
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 via-purple-600 to-rose-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-white hidden sm:inline">Keynote AI</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">ULTRA</span>
          </div>

          {/* WPS Classic QAT */}
          <div className="flex items-center space-x-0.5 bg-white/5 px-1.5 py-0.5 rounded-lg border border-white/5 text-zinc-300">
            <button onClick={() => showToast('已成功同步保存至 iCloud Drive')} className="p-1 hover:text-white hover:bg-white/10 rounded transition" title="保存 (⌘S)">
              <Save className="w-3.5 h-3.5 text-blue-400" />
            </button>
            <button onClick={() => showToast('正在输出超清 PDF')} className="p-1 hover:text-rose-300 text-rose-400 hover:bg-white/10 rounded transition" title="输出 PDF">
              <FileDown className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setActiveModal('print')} className="p-1 hover:text-white hover:bg-white/10 rounded transition" title="打印 (⌘P)">
              <Printer className="w-3.5 h-3.5" />
            </button>
            <div className="h-3 w-px bg-white/10 mx-0.5" />
            <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-1 hover:text-white hover:bg-white/10 rounded transition disabled:opacity-30" title="撤销 (⌘Z)">
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-1 hover:text-white hover:bg-white/10 rounded transition disabled:opacity-30" title="恢复 (⌘Y)">
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Document Title & iCloud Indicator */}
          <div className="flex items-center space-x-1.5 pl-1">
            <input 
              type="text" 
              defaultValue="2026 Apple 空间神经生态发布会.key"
              className="bg-transparent hover:bg-white/5 focus:bg-white/10 text-xs font-semibold text-white px-2 py-0.5 rounded-md border border-transparent focus:border-blue-500/60 focus:outline-none transition w-44 md:w-56 truncate"
            />
            <div className="hidden lg:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>iCloud 已同步</span>
            </div>
          </div>
        </div>

        {/* Right Presentation Mode Trigger & Share */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>AI评分: 98</span>
          </div>

          <button onClick={() => showToast('已生成协作链接')} className="px-2.5 py-1 bg-[#1b1b23] hover:bg-white/10 text-white border border-white/10 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition">
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">协作</span>
          </button>

          <div className="inline-flex rounded-lg shadow-sm border border-blue-500/50 overflow-hidden">
            <button onClick={() => setIsPresenterActive(true)} className="px-3.5 py-1 bg-gradient-to-r from-blue-600 to-[#0071e3] hover:brightness-110 text-white text-xs font-semibold flex items-center space-x-1.5 transition">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>放映</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. FULL 12 RIBBON TABS BAR */}
      <section className="bg-[#181820] border-b border-white/10 shrink-0 select-none shadow-sm relative z-30">
        <div className="flex items-center justify-between px-3 pt-1 border-b border-white/5 text-xs">
          <div className="flex items-center space-x-0.5 overflow-x-auto no-scrollbar">
            <button onClick={() => setIsFileDrawerOpen(p => !p)} className="px-3 py-1 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-t-md transition flex items-center space-x-1 shadow-sm mr-1">
              <Menu className="w-3.5 h-3.5" />
              <span>文件</span>
            </button>

            {[
              { id: 'home', label: '开始', icon: Home },
              { id: 'insert', label: '插入', icon: Plus },
              { id: 'design', label: '设计与色板', icon: Palette },
              { id: 'transitions', label: '切换', icon: Move },
              { id: 'animations', label: '动画', icon: Zap },
              { id: 'slideshow', label: '放映', icon: Play },
              { id: 'review', label: '审阅', icon: SpellCheck },
              { id: 'view', label: '视图', icon: Eye },
              { id: 'tools', label: '工具', icon: Wrench },
              { id: 'ai_hub', label: 'AI 智汇', icon: Sparkles }
            ].map(tab => {
              const IconC = tab.icon;
              const isAi = tab.id === 'ai_hub' || tab.id === 'design';
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveRibbonTab(tab.id as RibbonTab);
                    showToast(`Ribbon 工具栏: 【${tab.label}】`);
                  }}
                  className={`px-3 py-1 font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap border-b-2 ${
                    activeRibbonTab === tab.id
                      ? isAi ? 'text-purple-400 border-purple-500' : 'text-blue-400 border-blue-500'
                      : 'text-zinc-400 hover:text-white border-transparent'
                  }`}
                >
                  <IconC className={`w-3.5 h-3.5 ${isAi ? 'text-purple-300' : 'text-blue-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* EXPANDED SUB-TOOLBAR CONTENT */}
        <div className="h-20 px-3 py-1 flex items-center overflow-x-auto relative text-xs min-w-max">
          {/* HOME TAB */}
          {activeRibbonTab === 'home' && (
            <div className="flex items-center space-x-2">
              <button onClick={handleAddSlide} className="px-3 py-1.5 rounded-lg bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40 flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5" />
                <span>新建页</span>
              </button>
              <button onClick={() => handleDuplicateSlide()} className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white font-bold">重制副本</button>
              <button onClick={() => handleDeleteSlide()} className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold">删除页</button>

              <div className="h-10 w-px bg-white/10 mx-1" />

              <button onClick={() => setShowPalettePopover(p => !p)} className="px-3 py-1.5 rounded-lg bg-purple-600/30 text-purple-300 font-bold border border-purple-500/40 flex items-center space-x-1">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>智能色板</span>
              </button>

              <button
                onClick={() => {
                  setIsMarqueeActive(p => !p);
                  showToast(isMarqueeActive ? '已退出区域框选模式' : '已开启区域框选模式：在画布上按住拖拽即可重构');
                }}
                className={`px-3 py-1.5 rounded-lg border font-bold flex items-center space-x-1.5 transition ${
                  isMarqueeActive ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 border-white/10 text-zinc-300'
                }`}
              >
                <Scan className="w-3.5 h-3.5" />
                <span>{isMarqueeActive ? '框选中...' : '区域框选 AI'}</span>
              </button>
            </div>
          )}

          {/* DESIGN TAB */}
          {activeRibbonTab === 'design' && (
            <div className="flex items-center space-x-2">
              <span className="text-zinc-400">全局主题:</span>
              {Object.keys(SMART_PALETTES).map(t => (
                <button
                  key={t}
                  onClick={() => applySmartPaletteToDeck(t as SlideTheme)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    activeSlide.theme === t ? 'bg-purple-600 text-white shadow-xs' : 'bg-white/5 text-zinc-400'
                  }`}
                >
                  {SMART_PALETTES[t as SlideTheme].name.split(' ')[0]}
                </button>
              ))}

              <div className="h-10 w-px bg-white/10 mx-1" />

              <button onClick={() => setAspectRatio('16:9')} className={`px-2.5 py-1 rounded font-bold ${aspectRatio === '16:9' ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400'}`}>16:9 UHD</button>
              <button onClick={() => setAspectRatio('16:10')} className={`px-2.5 py-1 rounded font-bold ${aspectRatio === '16:10' ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400'}`}>16:10 Pro</button>
              <button onClick={() => setAspectRatio('4:3')} className={`px-2.5 py-1 rounded font-bold ${aspectRatio === '4:3' ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400'}`}>4:3 标屏</button>
            </div>
          )}

          {/* AI HUB TAB */}
          {activeRibbonTab === 'ai_hub' && (
            <div className="flex items-center space-x-2">
              <button onClick={() => setActiveModal('topic')} className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-rose-500 text-white font-bold flex items-center space-x-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>主题全案智造 (Topic to Deck)</span>
              </button>
              <button onClick={() => setActiveModal('link')} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5" />
                <span>长文/链接转 PPT</span>
              </button>
              <button onClick={() => setActiveModal('import')} className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center space-x-1">
                <FileUp className="w-3.5 h-3.5" />
                <span>导入 PPTX 升级</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FILE BACKSTAGE DRAWER */}
      {isFileDrawerOpen && (
        <div className="absolute top-[88px] left-3 w-80 bg-[#1b1b23] border border-white/20 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in space-y-1 text-xs select-none">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between font-bold text-white">
            <span>文稿操作中心</span>
            <span className="text-[10px] font-mono text-zinc-400">Keynote 2026</span>
          </div>
          <button onClick={() => { setActiveModal('topic'); setIsFileDrawerOpen(false); }} className="w-full px-3 py-2 rounded-lg hover:bg-blue-600 text-left text-white flex justify-between items-center">
            <span className="flex items-center space-x-2"><FilePlus className="w-4 h-4 text-blue-400" /><span>新建空白/全案文稿</span></span>
            <span className="font-mono text-[10px] opacity-60">⌘N</span>
          </button>
          <button onClick={() => { setActiveModal('import'); setIsFileDrawerOpen(false); }} className="w-full px-3 py-2 rounded-lg hover:bg-blue-600 text-left text-white flex justify-between items-center">
            <span className="flex items-center space-x-2"><FolderOpen className="w-4 h-4 text-amber-400" /><span>导入本地 PPTX / Keynote</span></span>
            <span className="font-mono text-[10px] opacity-60">⌘O</span>
          </button>
          <button onClick={() => { showToast('已同步保存'); setIsFileDrawerOpen(false); }} className="w-full px-3 py-2 rounded-lg hover:bg-blue-600 text-left text-white flex justify-between items-center">
            <span className="flex items-center space-x-2"><Cloud className="w-4 h-4 text-emerald-400" /><span>保存到 iCloud Drive</span></span>
            <span className="font-mono text-[10px] opacity-60">⌘S</span>
          </button>
          <button onClick={() => { setActiveModal('print'); setIsFileDrawerOpen(false); }} className="w-full px-3 py-2 rounded-lg hover:bg-blue-600 text-left text-white flex justify-between items-center">
            <span className="flex items-center space-x-2"><Printer className="w-4 h-4 text-cyan-400" /><span>打印与装订预审</span></span>
            <span className="font-mono text-[10px] opacity-60">⌘P</span>
          </button>
        </div>
      )}

      {/* SMART PALETTE POPOVER */}
      {showPalettePopover && (
        <div className="absolute top-[88px] left-64 w-80 bg-[#1a1a22] border border-white/20 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in space-y-3 text-xs select-none">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <Brush className="w-4 h-4 text-purple-400" />
              <span>Apple 语境智能色板套件</span>
            </span>
            <button onClick={() => setShowPalettePopover(false)} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 pt-1">
            {Object.keys(SMART_PALETTES).map(key => {
              const pal = SMART_PALETTES[key as SlideTheme];
              const isSelected = activeSlide.theme === key;
              return (
                <div
                  key={key}
                  onClick={() => applySmartPaletteToDeck(key as SlideTheme)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition space-y-1 ${
                    isSelected ? 'bg-purple-600/20 border-purple-500 text-white font-bold' : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: pal.accentColor }} />
                      <span>{pal.name}</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono">{pal.contextDesc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SLIDE SORTER */}
        <aside className="w-56 bg-[#151518] border-r border-white/10 flex flex-col shrink-0 select-none z-20">
          <div className="p-2.5 border-b border-white/10 flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-400 uppercase tracking-wider text-[10px]">幻灯片导航 ({slides.length})</span>
            <button onClick={handleAddSlide} className="p-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 transition">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {slides.map((s, idx) => {
              const isActive = idx === activeSlideIndex;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSlideIndex(idx);
                    setSelectedElementId(null);
                  }}
                  className={`p-2 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    isActive ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg' : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-400'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="font-bold text-purple-400">0{idx + 1}</span>
                    <span className="px-1 py-0.5 rounded bg-white/10 text-zinc-300">{s.badge || 'Slide'}</span>
                  </div>
                  <div className="w-full aspect-[16/9] rounded-lg bg-[#08080a] border border-white/10 p-2 flex flex-col justify-between overflow-hidden">
                    <div className="text-[10px] font-bold text-white truncate">{s.title}</div>
                    <div className="text-[8px] text-zinc-400 truncate">{s.subtitle}</div>
                    <div className="h-1 w-6 rounded-full" style={{ backgroundColor: currentPalette.accentColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* CENTER CANNING MASTER STAGE */}
        <section
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex-1 bg-[#0b0b0e] relative overflow-hidden flex flex-col items-center justify-center p-6 select-none"
        >
          {/* Stage Status HUD */}
          <div className="absolute top-3 left-6 flex items-center space-x-2 bg-[#18181d]/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs shadow-md">
            <span className="text-white font-bold">第 {activeSlideIndex + 1} / {slides.length} 页</span>
            <span className="text-white/20">|</span>
            <span className="text-purple-300 font-bold">{currentPalette.name}</span>
          </div>

          {/* Master Keynote Stage */}
          <div
            style={{ transform: `scale(${zoomLevel})` }}
            className={`relative w-full max-w-[980px] ${aspectRatio === '4:3' ? 'aspect-[4/3]' : aspectRatio === '16:10' ? 'aspect-[16/10]' : 'aspect-[16/9]'} ${currentPalette.bgClass} rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col p-10 justify-between border border-white/10`}
          >
            {/* Elements */}
            <div className="w-full h-full relative flex flex-col justify-between">
              {activeSlide.elements.map(elem => {
                const isSelected = elem.id === selectedElementId;
                return (
                  <div
                    key={elem.id}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedElementId(elem.id);
                    }}
                    className={`relative cursor-pointer transition rounded-lg p-1 ${
                      isSelected ? 'outline outline-2 outline-purple-500 bg-purple-500/10' : 'hover:outline hover:outline-1 hover:outline-white/20'
                    }`}
                  >
                    {elem.type === 'tag' && (
                      <span className={elem.classes} style={{ color: currentPalette.accentColor }}>{elem.content}</span>
                    )}

                    {elem.type === 'heading' && (
                      <h1 className={elem.classes} dangerouslySetInnerHTML={{ __html: elem.content || '' }} />
                    )}

                    {elem.type === 'paragraph' && (
                      <p className={elem.classes}>{elem.content}</p>
                    )}

                    {elem.type === 'metric-row' && elem.items && (
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
                        {elem.items.map((it, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl">
                            <div className="text-xl font-bold font-mono text-white mb-0.5" style={{ color: currentPalette.secondaryColor }}>{it.val}</div>
                            <div className="text-[10px] text-zinc-400">{it.lbl}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {elem.type === 'bento-grid' && elem.cards && (
                      <div className="grid grid-cols-2 gap-3">
                        {elem.cards.map((c, i) => (
                          <div key={i} className={`p-3.5 rounded-xl bg-gradient-to-br ${c.grad || currentPalette.gradPair} border border-white/10`}>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-white mb-1.5">{c.tag}</span>
                            <h3 className="text-xs font-bold text-white mb-1">{c.title}</h3>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{c.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {elem.type === 'metric-highlight' && (
                      <div className="grid grid-cols-12 gap-6 items-center my-auto">
                        <div className="col-span-5 p-6 rounded-2xl bg-white/[0.04] border border-white/10">
                          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400 mb-1">{elem.bigNum}</div>
                          <div className="text-xs text-zinc-400">{elem.bigLabel}</div>
                        </div>
                        <div className="col-span-7 space-y-2.5">
                          {elem.metrics?.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                              <span className="text-xs text-zinc-400">{m.t}</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs font-semibold text-white">{m.v}</span>
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{m.g}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {elem.type === 'quote-split' && (
                      <div className="grid grid-cols-2 gap-6 items-center">
                        <div className="space-y-2 border-r border-white/10 pr-4">
                          <p className="text-base font-serif italic text-white">{elem.quote}</p>
                          <p className="text-xs font-mono" style={{ color: currentPalette.accentColor }}>{elem.author}</p>
                        </div>
                        <div className="space-y-1.5 text-xs text-zinc-300">
                          {elem.bullets?.map((b, i) => (
                            <div key={i}>• {b}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Marquee Drag Box */}
            {marqueeRect && (
              <div
                style={{
                  left: `${marqueeRect.x}px`,
                  top: `${marqueeRect.y}px`,
                  width: `${marqueeRect.w}px`,
                  height: `${marqueeRect.h}px`
                }}
                className="absolute border-2 border-dashed border-blue-500 bg-blue-500/15 pointer-events-none rounded-lg z-30"
              />
            )}
          </div>

          {/* Marquee AI Action Pill */}
          {marqueeRect && marqueeRect.w > 30 && (
            <div className="mt-3 bg-[#1e1e24] px-4 py-2 rounded-2xl border border-white/20 shadow-2xl flex items-center space-x-3 text-xs z-40">
              <span className="text-purple-400 font-bold flex items-center space-x-1">
                <Wand2 className="w-3.5 h-3.5" />
                <span>区域 AI 重构:</span>
              </span>
              <button onClick={() => applyMarqueeAI('bento')} className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold">转 Bento 卡片</button>
              <button onClick={() => applyMarqueeAI('metric')} className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold">提炼量化指标</button>
              <button onClick={() => applyMarqueeAI('contrast')} className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold">双栏对比</button>
            </div>
          )}
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="w-80 bg-[#151518] border-l border-white/10 flex flex-col shrink-0 z-20 select-none">
          <div className="grid grid-cols-3 border-b border-white/10 text-[11px] text-center p-1 bg-[#1d1d22]">
            <button
              onClick={() => setActiveSidebarMode('smart_layout')}
              className={`py-1.5 font-bold transition ${activeSidebarMode === 'smart_layout' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-zinc-400'}`}
            >
              🤖 智排助手
            </button>
            <button
              onClick={() => setActiveSidebarMode('inspector')}
              className={`py-1.5 font-bold transition ${activeSidebarMode === 'inspector' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-400'}`}
            >
              🎨 检查器
            </button>
            <button
              onClick={() => setActiveSidebarMode('copilot')}
              className={`py-1.5 font-bold transition ${activeSidebarMode === 'copilot' ? 'text-teal-300 border-b-2 border-teal-500' : 'text-zinc-400'}`}
            >
              💬 协作者
            </button>
          </div>

          {/* SMART LAYOUT ASSISTANT TAB */}
          {activeSidebarMode === 'smart_layout' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex justify-between font-bold text-white">
                  <span>内容密度: {contentDensityMetric.score}%</span>
                  <span className="text-purple-400">{contentDensityMetric.statusText}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">AI 最佳适配版式推荐</span>
                <button
                  onClick={() => {
                    const nextSlides = [...slides];
                    nextSlides[activeSlideIndex].elements[1] = {
                      id: `bento-opt-${Date.now()}`,
                      type: 'bento-grid',
                      cards: [
                        { tag: '智能重构 A', title: activeSlide.title, desc: activeSlide.subtitle, grad: 'from-blue-600/20 to-purple-600/10' },
                        { tag: '智能重构 B', title: '极简人机交互', desc: '将高密度文本提炼为纯粹模块。', grad: 'from-emerald-600/20 to-teal-600/10' }
                      ]
                    };
                    pushHistory(nextSlides);
                    showToast('已重置为 Bento 便当盒布局');
                  }}
                  className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-left text-white font-bold transition"
                >
                  🍱 Bento 便当盒多卡片流
                </button>
              </div>
            </div>
          )}

          {/* INSPECTOR TAB */}
          {activeSidebarMode === 'inspector' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="font-bold text-white">属性与讲者备注</span>
                <span className="text-[10px] font-mono text-purple-300">{currentPalette.name}</span>
              </div>

              <div className="space-y-2">
                <label className="text-zinc-400 font-bold text-[10px] uppercase">演说提词与备注</label>
                <textarea
                  value={activeSlide.notes}
                  onChange={e => {
                    const nextSlides = slides.map((s, idx) => idx === activeSlideIndex ? { ...s, notes: e.target.value } : s);
                    pushHistory(nextSlides);
                  }}
                  rows={6}
                  className="w-full bg-[#24242c] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed resize-none font-mono"
                  placeholder="在此时输入讲者提词..."
                />
              </div>
            </div>
          )}

          {/* COPILOT TAB */}
          {activeSidebarMode === 'copilot' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
                {chatMessages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#24242c] border border-white/10 text-zinc-200'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-white/10 bg-[#1d1d22] space-y-2">
                <textarea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChatPrompt();
                    }
                  }}
                  rows={2}
                  placeholder="给 AI 协作者下达指令..."
                  className="w-full bg-[#24242c] border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
                <button
                  onClick={handleSendChatPrompt}
                  className="w-full py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500 transition"
                >
                  发送指令
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* FOOTER STATUS & UTILITY BAR */}
      <footer className="h-9 bg-[#111116] border-t border-white/10 px-3.5 flex items-center justify-between shrink-0 z-40 text-[11px] text-zinc-400 select-none">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-white">第 {activeSlideIndex + 1} / {slides.length} 页</span>
          <span className="text-white/20">|</span>
          <span>第一节：愿景揭幕</span>
          <span className="text-white/20">|</span>
          <span className="text-emerald-400 font-bold">规范检测无冲突</span>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))} className="hover:text-white">-</button>
          <span className="font-mono text-white">{Math.round(zoomLevel * 100)}%</span>
          <button onClick={() => setZoomLevel(z => Math.min(2.0, z + 0.1))} className="hover:text-white">+</button>
        </div>
      </footer>

      {/* PRINT PREVIEW MODAL */}
      {activeModal === 'print' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-6 select-none animate-in fade-in">
          <div className="bg-[#16161c] border border-white/20 w-full max-w-4xl rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="font-bold text-white text-sm">专业打印预览与装订基准 (Print Preview)</span>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              色彩配置文件: Apple Display P3 • 300 DPI 无损压印。已成功将 {slides.length} 页演示文档调入 AirPrint 打印队列。
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs">取消</button>
              <button onClick={() => { window.print(); setActiveModal(null); }} className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs">开始打印 (⌘P)</button>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC MODAL */}
      {activeModal === 'topic' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-6 select-none animate-in fade-in">
          <div className="bg-[#16161c] border border-white/20 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="font-bold text-white text-sm">主题全案智造 (Topic to Deck)</span>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <textarea defaultValue="2026 Apple 空间计算与个人神经硬件生态战略..." rows={3} className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white" />
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs">取消</button>
              <button onClick={() => { showToast('全案已自动智造生成！'); setActiveModal(null); }} className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs">一键生成</button>
            </div>
          </div>
        </div>
      )}

      {/* LINK MODAL */}
      {activeModal === 'link' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-6 select-none animate-in fade-in">
          <div className="bg-[#16161c] border border-white/20 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="font-bold text-white text-sm">网页/公众号/研报转 PPT</span>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <input type="url" defaultValue="https://techcrunch.com/2026/09/apple-spatial-report" className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white" />
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setActiveModal(null)} className="px-4 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs">取消</button>
              <button onClick={() => { showToast('研报解析重构成功！'); setActiveModal(null); }} className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">解析转化为 PPT</button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {activeModal === 'import' && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-lg z-50 flex items-center justify-center p-6 select-none animate-in fade-in">
          <div className="bg-[#16161c] border border-white/20 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="font-bold text-white text-sm">导入本地 PPTX 并升级 Apple 工业审美</span>
              <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div onClick={() => { showToast('本地文件加载成功！'); setActiveModal(null); }} className="border-2 border-dashed border-white/20 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer">
              <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">点击上传 .pptx / .key 本地文件</p>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN KEYNOTE PRESENTATION OVERLAY WITH LASER & TIMERS */}
      {isPresenterActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-12 text-white animate-in fade-in select-none">
          <div className="flex justify-between items-center text-xs font-mono opacity-60">
            <span>Apple Keynote Presentation • {currentPalette.name}</span>
            <span>{Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s</span>
            <button onClick={() => setIsPresenterActive(false)} className="p-2 hover:bg-white/10 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-4xl mx-auto w-full my-auto space-y-6 text-center">
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {activeSlide.badge || 'Keynote'}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">{activeSlide.title}</h1>
            <p className="text-lg opacity-70 leading-relaxed max-w-2xl mx-auto">{activeSlide.subtitle}</p>
          </div>

          {/* Laser Pointer Dot */}
          {isLaserActive && (
            <div
              style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
              className="fixed w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_16px_4px_#ff3b30] pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
            />
          )}

          <div className="flex justify-between items-center font-mono text-xs opacity-60">
            <span>按 ← / → 翻页 · 按 L 开关激光笔 · 按 ESC 退出</span>
            <div className="flex space-x-4">
              <button onClick={() => setActiveSlideIndex(prev => Math.max(0, prev - 1))} className="hover:text-white">上一页</button>
              <button onClick={() => setActiveSlideIndex(prev => Math.min(slides.length - 1, prev + 1))} className="hover:text-white">下一页</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
