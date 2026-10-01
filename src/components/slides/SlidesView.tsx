import React, { useState, useEffect, useRef } from 'react';
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
  Minimize2
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

export type SlidesStudioMode = 'ai_generate' | 'local_editor';
export type SlideLayout = 'title' | 'agenda' | 'points' | 'split' | 'quote' | 'conclusion';
export type SlideTheme = 'obsidian' | 'chalk' | 'aurora' | 'parchment';

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
  layout: SlideLayout;
  notes: string;
  badge?: string;
}

const LAYOUT_CONFIG: Record<SlideLayout, { label: string; icon: any; desc: string }> = {
  title: { label: '封面主旨', icon: Compass, desc: '大号震撼主标题与企划作者信息' },
  agenda: { label: '大纲目录', icon: ListOrdered, desc: '结构化流程梳理与要点导航' },
  points: { label: '核心要点', icon: Layers, desc: '条列式深入剖析与因果论证' },
  split: { label: '双向对比', icon: Columns, desc: '双雄博弈、阵营反差与优缺点' },
  quote: { label: '金句洞察', icon: Sparkles, desc: '大字号观点强调与关键启示' },
  conclusion: { label: '收束结语', icon: Scale, desc: '高潮总结、后续规划与问答' }
};

const THEME_CONFIG: Record<SlideTheme, { label: string; bgClass: string; textClass: string; accentColor: string; desc: string }> = {
  obsidian: {
    label: '深空黑曜',
    bgClass: 'bg-[#121214] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]',
    textClass: 'text-[#f5f5f7]',
    accentColor: '#0a84ff',
    desc: '极客深黑，经典沉浸感'
  },
  chalk: {
    label: '极简霜白',
    bgClass: 'bg-[#ffffff] border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.08)]',
    textClass: 'text-[#1d1d1f]',
    accentColor: '#0071e3',
    desc: '通透白净，明快专注'
  },
  aurora: {
    label: '暗夜极光',
    bgClass: 'bg-gradient-to-br from-[#0c102b] via-[#151c3d] to-[#1a1138] border-indigo-500/20 shadow-[0_20px_50px_rgba(20,10,50,0.5)]',
    textClass: 'text-white',
    accentColor: '#bf5af2',
    desc: '深邃渐变，高端发布会质感'
  },
  parchment: {
    label: '仿古羊皮纸',
    bgClass: 'bg-[#f4ebd9] dark:bg-[#282420] border-[#dcd1be] dark:border-[#3d3731] shadow-[0_20px_50px_rgba(50,30,10,0.15)]',
    textClass: 'text-[#3d3228] dark:text-[#ede4d8]',
    accentColor: '#c97826',
    desc: '古典典籍质感，长篇叙事'
  }
};

const INITIAL_SLIDES: Slide[] = [
  {
    id: 'slide-1',
    title: '《九渊破妄录》IP 架构与世界观总括',
    subtitle: '天道崩裂八百年 · 九渊沉沦与凡骨抗争的东方奇幻史诗',
    bullets: [
      '核心命题：在仙门伪神与渊海异化的千年死局中，刺破宿命欺瞒',
      '世界分层：上三渊（清气仙宗）、中三渊（散修渡口）、下三渊（远古封印）',
      '主角内核：克制隐忍，外门弃徒，以身为刃破局'
    ],
    layout: 'title',
    notes: '向评委与投资人着重强调本作与传统升级流修仙的差异——重在悬疑权谋与设定严密性。',
    badge: '企划概要'
  },
  {
    id: 'slide-2',
    title: '破妄真瞳：力量法则与戏剧危机闭环',
    subtitle: '严苛的能力代价构筑极致的代入感与戏剧张力',
    bullets: [
      '【照彻机理】：窥视天地气机流转缝隙与阵法命门（以弱胜强合理化）',
      '【反噬规则】：全力施展不可超过三息，超时双目如烈铁灼烧经络',
      '【解毒关键】：必须依赖稀缺的“寒玉髓”压制，推动资源冒险支线'
    ],
    layout: 'points',
    notes: '阐述商业写作生命线：没有代价的开挂会让读者快速审美疲劳，严密的规则是长篇连载的核心保障。',
    badge: '核心法则'
  },
  {
    id: 'slide-3',
    title: '双雄契约：冷静刺客 × 算天掌事',
    subtitle: '沈玄烛与柳清霜的双向博弈与利益结盟',
    bullets: [
      '沈玄烛：被动求生到主动掀翻伪神棋局，背负灭门血仇',
      '柳清霜：巨贾庶女，以算筹谋夺仙盟总舵，借双眼寻生路',
      '契约机制：互不探究过往血仇，只论灵石分润与航道生死互托'
    ],
    layout: 'split',
    notes: '分析受众画像：男女主角兼具高智商与行动力，契合年轻读者对“智斗双强”的审美需求。',
    badge: '角色博弈'
  },
  {
    id: 'slide-4',
    title: '“天地以万物为刍狗，我以凡骨为斩神刀”',
    subtitle: '全剧灵魂台词与精神支柱 · 第三卷黑水古祭坛揭秘时刻',
    bullets: [
      '绝境反扑：主角在双目暂时失明状态下，凭借心算盲刺击穿仙阵阵眼',
      '读者共鸣：击碎“灵根天定”的阶级锁链，唤醒凡人主角自主抗争意志'
    ],
    layout: 'quote',
    notes: '此页为全案的情绪最高点，配合激昂的背景音乐呈现核心金句。',
    badge: '高潮金句'
  },
  {
    id: 'slide-5',
    title: '多模态衍生与商业化落地蓝图',
    subtitle: '出版、有声剧、影视短剧与端模互动多轴并行',
    bullets: [
      '文本矩阵：起点中文网独家连载，首订目标 30,000+，全本预计 240 万字',
      '视觉资产：由 AI 工作台构建完备的角色立绘、宗门法器与概念场景原画库',
      '交互衍生：同步开发沉浸式文字冒险与解谜分支端游企划'
    ],
    layout: 'conclusion',
    notes: '展示IP的长尾变现价值，让整个企划案不仅具备艺术深度，更具备扎实的商业可行性。',
    badge: '商业愿景'
  }
];

export const SlidesView: React.FC = () => {
  // Mode switcher: 'ai_generate' | 'local_editor'
  const [studioMode, setStudioMode] = useState<SlidesStudioMode>('ai_generate');

  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [theme, setTheme] = useState<SlideTheme>('obsidian');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // ============================================================
  // 1. AI 模式参数 (AI GENERATION & CONVERSATIONAL MODIFICATION)
  // ============================================================
  const [aiTopicInput, setAiTopicInput] = useState('企业数据安全与端侧大模型本地部署商业企划案');
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);
  const [chatInstruction, setChatInstruction] = useState('');
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  // Element Selection for AI Modification
  const [selectedElement, setSelectedElement] = useState<{
    type: 'title' | 'subtitle' | 'bullet' | 'notes';
    index?: number;
    text: string;
  } | null>(null);
  const [isAiModifyingElement, setIsAiModifyingElement] = useState(false);

  // ============================================================
  // 2. 本地编辑工作台状态 (LOCAL EDITOR)
  // ============================================================
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);

  const activeSlide = slides[activeSlideIndex] || slides[0];
  const currentThemeConfig = THEME_CONFIG[theme];

  // Global Keydown for Presentation Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullScreen) {
        if (e.key === 'ArrowRight' || e.key === 'Space') {
          e.preventDefault();
          setActiveSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setActiveSlideIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Escape') {
          setIsFullScreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, slides.length]);

  // AI Generate Deck based on Topic
  const handleAiGenerateDeck = async () => {
    if (!aiTopicInput.trim()) return;
    setIsGeneratingDeck(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: '你是一个顶级 Apple Keynote 幻灯片策划专家。请根据用户主题，生成包含 4~5 页幻灯片的完整 JSON 数组。每个元素包含 id, title, subtitle, bullets (数组3条), layout (可选 title, agenda, points, split, quote, conclusion), notes, badge。只输出合法的 JSON 数组，不带任何 Markdown 包裹。'
            },
            {
              role: 'user',
              content: `主题：${aiTopicInput}`
            }
          ]
        })
      });

      const data = await response.json();
      const rawText = data.reply || data.content || data.response || '';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setSlides(parsed);
        setActiveSlideIndex(0);
      }
    } catch (e) {
      // Fallback simulated deck
      const newDeck: Slide[] = [
        {
          id: 'gen-1',
          title: aiTopicInput,
          subtitle: '基于第一性原理与多模态协同架构的完整商业与技术蓝图',
          bullets: [
            '核心价值：打通端侧算力、长程记忆与隐私安全的闭环',
            '技术壁垒：全本地脱网运行，毫秒级响应',
            '商业模型：按需授权与私有化节点部署'
          ],
          layout: 'title',
          notes: '开篇点题，突出核心差异化壁垒。',
          badge: '立项发布'
        },
        {
          id: 'gen-2',
          title: '架构演进与技术实施路径',
          subtitle: '从单点突破到全域生态协同',
          bullets: [
            '第一阶段：完成端侧核心向量数据库与模型轻量化量化',
            '第二阶段：多智能体协作总线接入与知识库联通',
            '第三阶段：商业化落地与规模化交付'
          ],
          layout: 'points',
          notes: '分阶段阐述落地可行性。',
          badge: '技术架构'
        },
        {
          id: 'gen-3',
          title: '“将超级智能的权柄，真正还给每一个个体”',
          subtitle: '核心使命宣言与愿景',
          bullets: [
            '数据主权不容侵犯，本地优先是时代必然',
            '以极致 Apple 审美重构专业生产力'
          ],
          layout: 'quote',
          notes: '全场情感高潮。',
          badge: '愿景结语'
        }
      ];
      setSlides(newDeck);
      setActiveSlideIndex(0);
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  // Conversational Modification on entire deck
  const handleExecuteChatInstruction = async () => {
    if (!chatInstruction.trim()) return;
    setIsProcessingChat(true);

    try {
      const prompt = `当前幻灯片列表：\n${JSON.stringify(slides)}\n\n用户修改要求：${chatInstruction}\n\n请修改幻灯片内容，输出修改后的完整 JSON 数组。`;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: '你是一个 Keynote 幻灯片编辑助手。严格只输出修改后的 JSON 数组。' },
            { role: 'user', content: prompt }
          ]
        })
      });

      const data = await response.json();
      const rawText = data.reply || data.content || data.response || '';
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSlides(parsed);
      }
    } catch {
      // Fallback: update active slide title
      setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? { ...s, subtitle: `${s.subtitle} · (${chatInstruction.slice(0, 12)})` } : s));
    } finally {
      setIsProcessingChat(false);
      setChatInstruction('');
    }
  };

  // Element-level AI modification (Rephrase / Expand / Polish)
  const handleAiPolishElement = async (action: 'polish' | 'expand' | 'catchphrase') => {
    if (!selectedElement) return;
    setIsAiModifyingElement(true);

    let instruction = '请润色并提升文学与极客质感：';
    if (action === 'expand') instruction = '请充实论据并展开细节阐述：';
    if (action === 'catchphrase') instruction = '请提炼为震撼的金句形式（20字以内）：';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: '你是一个文案大师。直接输出修改后的单段文字，不加任何解释。' },
            { role: 'user', content: `${instruction}\n原内容：${selectedElement.text}` }
          ]
        })
      });
      const data = await response.json();
      const newText = (data.reply || data.content || data.response || '').trim();

      if (newText) {
        setSlides(prev => prev.map((s, idx) => {
          if (idx !== activeSlideIndex) return s;
          if (selectedElement.type === 'title') return { ...s, title: newText };
          if (selectedElement.type === 'subtitle') return { ...s, subtitle: newText };
          if (selectedElement.type === 'notes') return { ...s, notes: newText };
          if (selectedElement.type === 'bullet' && selectedElement.index !== undefined) {
            const nextBullets = [...s.bullets];
            nextBullets[selectedElement.index] = newText;
            return { ...s, bullets: nextBullets };
          }
          return s;
        }));
        setSelectedElement(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiModifyingElement(false);
    }
  };

  // Local PPT / Outline File Import Handler
  const handleImportLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        // Try parsing JSON slides
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSlides(parsed);
          setActiveSlideIndex(0);
          return;
        }
      } catch {}

      // Parse Markdown Outline or Text
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      const newDeck: Slide[] = [];
      let tempSlide: { title: string; subtitle: string; bullets: string[] } | null = null;

      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        if (line.startsWith('# ') || idx === 0) {
          if (tempSlide && tempSlide.title) {
            newDeck.push({
              id: `imported-${newDeck.length + 1}`,
              title: tempSlide.title,
              subtitle: tempSlide.subtitle,
              bullets: tempSlide.bullets.length > 0 ? tempSlide.bullets : ['要点 1', '要点 2'],
              layout: 'points',
              notes: '从本地文档导入生成',
              badge: '本地导入'
            });
          }
          tempSlide = {
            title: line.replace(/^#+\s*/, ''),
            subtitle: '本地解析大纲',
            bullets: []
          };
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          if (tempSlide) {
            tempSlide.bullets.push(line.replace(/^[-*]\s*/, ''));
          }
        }
      }

      if (tempSlide && tempSlide.title) {
        newDeck.push({
          id: `imported-${newDeck.length + 1}`,
          title: tempSlide.title,
          subtitle: tempSlide.subtitle,
          bullets: tempSlide.bullets.length > 0 ? tempSlide.bullets : ['要点 1'],
          layout: 'points',
          notes: '从本地文档导入生成',
          badge: '本地导入'
        });
      }

      if (newDeck.length > 0) {
        setSlides(newDeck);
        setActiveSlideIndex(0);
      }
    };

    reader.readAsText(file);
  };

  // Add Slide
  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: '新幻灯片标题',
      subtitle: '副标题描述内容与核心要义',
      bullets: [
        '关键论点与事实支撑一',
        '关键论点与事实支撑二',
        '关键论点与事实支撑三'
      ],
      layout: 'points',
      notes: '讲者备忘录与演练要点。',
      badge: '新页'
    };
    const nextSlides = [...slides];
    nextSlides.splice(activeSlideIndex + 1, 0, newSlide);
    setSlides(nextSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
  };

  // Delete Slide
  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const nextSlides = slides.filter((_, idx) => idx !== index);
    setSlides(nextSlides);
    setActiveSlideIndex(Math.min(activeSlideIndex, nextSlides.length - 1));
  };

  // Duplicate Slide
  const handleDuplicateSlide = (index: number) => {
    const target = slides[index];
    const newSlide: Slide = { ...target, id: `slide-${Date.now()}`, title: `${target.title} (副本)` };
    const nextSlides = [...slides];
    nextSlides.splice(index + 1, 0, newSlide);
    setSlides(nextSlides);
    setActiveSlideIndex(index + 1);
  };

  // Reorder
  const handleMoveSlide = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= slides.length) return;
    const nextSlides = [...slides];
    const [moved] = nextSlides.splice(fromIndex, 1);
    nextSlides.splice(toIndex, 0, moved);
    setSlides(nextSlides);
    setActiveSlideIndex(toIndex);
  };

  // Save to Material Knowledge Base
  const handleSaveToMaterials = async () => {
    const transcript = slides.map((s, idx) => `### P${idx + 1}: ${s.title}\n**副标题**: ${s.subtitle}\n**要点**:\n${s.bullets.map(b => `- ${b}`).join('\n')}\n**演练备注**: ${s.notes}`).join('\n\n---\n\n');
    try {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Keynote幻灯片: ${slides[0]?.title || '未命名企划'}`,
          body: transcript,
          kind: 'slides',
          tags: ['AI幻灯片', 'Keynote', theme, studioMode]
        })
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--apple-bg)] select-none text-[var(--apple-text-primary)]">
      {/* Hidden File Input for Local PPT Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pptx,.json,.md,.txt"
        onChange={handleImportLocalFile}
        className="hidden"
      />

      {/* ============================================================ */}
      {/* 1. TOP macOS PRO TOOLBAR: MODE SWITCHER & KEYNOTE CONTROLS */}
      {/* ============================================================ */}
      <header className="h-14 border-b border-[var(--apple-border)] bg-[var(--apple-glass)] backdrop-blur-2xl px-6 flex items-center justify-between shrink-0 z-30 select-none">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-xs">
            <Presentation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold tracking-tight text-[var(--apple-text-primary)]">
                AI 幻灯片 · Apple Keynote Pro
              </h1>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-mono text-[9px] font-bold border border-amber-500/20">
                Deck Studio
              </span>
            </div>
            <p className="text-[10px] text-[var(--apple-text-tertiary)]">
              {studioMode === 'ai_generate' ? '主题智能生成 · 元素点击 AI 润色 · 对话改稿' : '本地全功能编辑工作台 · 导入 PPT / 大纲编辑'}
            </p>
          </div>
        </div>

        {/* Center: Apple Segmented Mode Switcher */}
        <div className="flex items-center bg-[var(--apple-subtle)] border border-[var(--apple-border)] p-1 rounded-2xl shadow-2xs">
          <button
            onClick={() => setStudioMode('ai_generate')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              studioMode === 'ai_generate'
                ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs scale-[1.02]'
                : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI 生成与改稿 (AI Mode)</span>
          </button>

          <button
            onClick={() => setStudioMode('local_editor')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              studioMode === 'local_editor'
                ? 'bg-[var(--apple-surface)] text-amber-500 shadow-xs scale-[1.02]'
                : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>🛠️ 本地编辑工作台 (Local Editor)</span>
          </button>
        </div>

        {/* Right Actions: Play / Save / Export */}
        <div className="flex items-center gap-2">
          {/* Play Full Screen Presentation */}
          <button
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-semibold text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-all shadow-2xs"
            title="启动 macOS 全屏幻灯片放映 (ESC 退出)"
          >
            <MonitorPlay className="w-3.5 h-3.5 text-emerald-400" />
            <span>全屏放映</span>
          </button>

          {/* Save to Material */}
          <button
            onClick={handleSaveToMaterials}
            disabled={savedSuccess}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              savedSuccess
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
            }`}
          >
            {savedSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? '已收录素材库' : '存入素材库'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold shadow-xs hover:bg-[var(--apple-accent-hover)] transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出 PDF/PPT</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN WORKSPACE CONTAINER */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========================================================== */}
        {/* LEFT SLIDES THUMBNAIL NAVIGATOR (Apple Keynote Sidebar) */}
        {/* ========================================================== */}
        <aside className="w-64 border-r border-[var(--apple-border)] bg-[var(--apple-surface)]/80 backdrop-blur-2xl flex flex-col shrink-0">
          <div className="h-11 px-4 border-b border-[var(--apple-separator)] flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
              <span>幻灯片大纲 ({slides.length} 页)</span>
            </span>

            <button
              onClick={handleAddSlide}
              className="p-1 rounded-lg bg-[var(--apple-subtle)] hover:bg-[var(--apple-accent)] hover:text-white transition-all text-xs"
              title="添加新幻灯片页"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Thumbnails Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setActiveSlideIndex(idx)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer space-y-1 relative group ${
                  activeSlideIndex === idx
                    ? 'border-[var(--apple-accent)] bg-[var(--apple-accent-subtle)] ring-2 ring-[var(--apple-accent)]/30 shadow-xs'
                    : 'border-[var(--apple-border)] bg-[var(--apple-subtle)]/40 hover:border-[var(--apple-border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[var(--apple-accent)]">
                    P{idx + 1}
                  </span>
                  <span className="text-[9px] font-mono text-[var(--apple-text-tertiary)]">
                    {LAYOUT_CONFIG[s.layout]?.label || '页面'}
                  </span>
                </div>

                <p className="text-xs font-semibold text-[var(--apple-text-primary)] truncate">
                  {s.title}
                </p>

                {/* Hover Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pt-1 justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, 'up'); }}
                    disabled={idx === 0}
                    className="p-1 hover:text-[var(--apple-accent)] disabled:opacity-20"
                    title="上移"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, 'down'); }}
                    disabled={idx === slides.length - 1}
                    className="p-1 hover:text-[var(--apple-accent)] disabled:opacity-20"
                    title="下移"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(idx); }}
                    className="p-1 hover:text-[var(--apple-accent)]"
                    title="复制"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteSlide(idx); }}
                    disabled={slides.length <= 1}
                    className="p-1 hover:text-rose-500 disabled:opacity-20"
                    title="删除"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Theme Selector Strip */}
          <div className="p-3 border-t border-[var(--apple-separator)] bg-[var(--apple-subtle)]/30 space-y-1.5">
            <span className="text-[10px] font-bold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
              全套视觉主题
            </span>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {(['obsidian', 'chalk', 'aurora', 'parchment'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`p-1.5 rounded-xl border text-center transition-all ${
                    theme === t
                      ? 'bg-[var(--apple-accent-subtle)] border-[var(--apple-accent)] text-[var(--apple-accent)] font-bold'
                      : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)]'
                  }`}
                >
                  {THEME_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ========================================================== */}
        {/* CENTER KEYNOTE CANVAS VIEWPORT */}
        {/* ========================================================== */}
        <main className="flex-1 flex flex-col overflow-hidden p-6 relative">
          {/* Main Slide Card Viewport */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div
              className={`w-full max-w-4xl aspect-[16/9] rounded-3xl p-10 flex flex-col justify-between transition-all duration-300 relative border ${currentThemeConfig.bgClass} ${currentThemeConfig.textClass}`}
            >
              {/* Slide Top Header */}
              <div className="flex items-center justify-between">
                <span
                  onClick={() => setSelectedElement({ type: 'title', text: activeSlide.badge || '企划概要' })}
                  className="px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide cursor-pointer hover:ring-2 hover:ring-[var(--apple-accent)]"
                  style={{ backgroundColor: `${currentThemeConfig.accentColor}25`, color: currentThemeConfig.accentColor }}
                >
                  {activeSlide.badge || '企划概要'}
                </span>

                <span className="text-xs font-mono opacity-50">
                  {activeSlideIndex + 1} / {slides.length}
                </span>
              </div>

              {/* Center Content based on Layout */}
              <div className="space-y-4 my-auto">
                {/* Title */}
                <h2
                  onClick={() => setSelectedElement({ type: 'title', text: activeSlide.title })}
                  className="text-2xl md:text-3xl font-bold tracking-tight leading-tight cursor-pointer hover:outline hover:outline-dashed hover:outline-2 hover:outline-[var(--apple-accent)] rounded-lg p-1 transition-all"
                  title="点击选择该标题进行 AI 润色或编辑"
                >
                  {activeSlide.title}
                </h2>

                {/* Subtitle */}
                <p
                  onClick={() => setSelectedElement({ type: 'subtitle', text: activeSlide.subtitle })}
                  className="text-sm opacity-80 cursor-pointer hover:outline hover:outline-dashed hover:outline-2 hover:outline-[var(--apple-accent)] rounded-lg p-1 transition-all"
                  title="点击选择副标题进行 AI 润色或编辑"
                >
                  {activeSlide.subtitle}
                </p>

                {/* Bullets List */}
                {activeSlide.bullets && activeSlide.bullets.length > 0 && (
                  <div className="pt-2 space-y-2">
                    {activeSlide.bullets.map((bullet, bIdx) => (
                      <div
                        key={bIdx}
                        onClick={() => setSelectedElement({ type: 'bullet', index: bIdx, text: bullet })}
                        className="flex items-start gap-2.5 text-xs md:text-sm leading-relaxed cursor-pointer hover:outline hover:outline-dashed hover:outline-1 hover:outline-[var(--apple-accent)] rounded-lg p-1 transition-all"
                        title="点击选择该论据进行 AI 扩写或修改"
                      >
                        <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: currentThemeConfig.accentColor }} />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Slide Bottom Footer */}
              <div className="pt-4 border-t border-current/10 flex items-center justify-between text-[11px] opacity-60">
                <span>Apple Keynote 架构企划案</span>
                <span>P{activeSlideIndex + 1} · {LAYOUT_CONFIG[activeSlide.layout]?.label}</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* FLOATING AI ELEMENT INSPECTOR POPUP (选择元素后AI修改) */}
          {/* ======================================================== */}
          {selectedElement && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-[520px] rounded-3xl bg-[var(--apple-surface)]/95 dark:bg-[#1e1e20]/95 backdrop-blur-3xl border border-[var(--apple-border-strong)] p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 select-none">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--apple-separator)]">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-[var(--apple-accent)]" />
                  <span className="text-xs font-bold text-[var(--apple-text-primary)]">
                    已选中元素 · AI 智能修改视窗
                  </span>
                </div>
                <button
                  onClick={() => setSelectedElement(null)}
                  className="p-1 rounded-lg hover:bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--apple-subtle)]/60 text-xs text-[var(--apple-text-secondary)] italic line-clamp-2">
                “{selectedElement.text}”
              </div>

              {/* AI Quick Polish Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAiPolishElement('polish')}
                  disabled={isAiModifyingElement}
                  className="flex-1 py-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-semibold hover:border-[var(--apple-accent)] text-[var(--apple-text-primary)] transition-all flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>✨ 润色文采</span>
                </button>

                <button
                  onClick={() => handleAiPolishElement('expand')}
                  disabled={isAiModifyingElement}
                  className="flex-1 py-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-semibold hover:border-[var(--apple-accent)] text-[var(--apple-text-primary)] transition-all flex items-center justify-center gap-1"
                >
                  <Type className="w-3.5 h-3.5 text-sky-400" />
                  <span>📈 充实论据</span>
                </button>

                <button
                  onClick={() => handleAiPolishElement('catchphrase')}
                  disabled={isAiModifyingElement}
                  className="flex-1 py-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-semibold hover:border-[var(--apple-accent)] text-[var(--apple-text-primary)] transition-all flex items-center justify-center gap-1"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-500" />
                  <span>⚡ 提炼金句</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ========================================================== */}
        {/* RIGHT SIDEBAR: MODE-SPECIFIC PRO INSPECTOR PANEL */}
        {/* ========================================================== */}
        <aside className="w-84 border-l border-[var(--apple-border)] bg-[var(--apple-surface)]/90 backdrop-blur-2xl p-5 flex flex-col shrink-0 overflow-y-auto space-y-4">
          {/* MODE 1: ✨ AI 生成与对话改稿面板 */}
          {studioMode === 'ai_generate' && (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-[var(--apple-separator)]">
                <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
                  <span>AI 主题全套生成</span>
                </span>
                <span className="text-[10px] font-mono text-[var(--apple-accent)]">Keynote Engine</span>
              </div>

              {/* Topic Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--apple-text-primary)]">企划主题命题</label>
                <textarea
                  value={aiTopicInput}
                  onChange={e => setAiTopicInput(e.target.value)}
                  rows={3}
                  placeholder="输入你想要生成的演示文稿主题..."
                  className="w-full p-3 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-2xl text-xs text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)] resize-none shadow-xs"
                />
                <button
                  onClick={handleAiGenerateDeck}
                  disabled={isGeneratingDeck || !aiTopicInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--apple-accent)] to-indigo-600 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isGeneratingDeck ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingDeck ? 'AI 正在排版生成全套 PPT...' : '一键生成可交互 PPT'}</span>
                </button>
              </div>

              {/* Conversational Modification Box */}
              <div className="pt-3 border-t border-[var(--apple-separator)] space-y-2">
                <label className="text-[11px] font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  <span>全套 PPT 对话修改</span>
                </label>
                <p className="text-[10px] text-[var(--apple-text-tertiary)]">
                  用自然语言给 AI 下达指令（如：“将全套幻灯片增加商业变现测算”、“精炼第 2 页要点”）
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInstruction}
                    onChange={e => setChatInstruction(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleExecuteChatInstruction()}
                    placeholder="输入对话修改指令..."
                    className="flex-1 px-3 py-2 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-xs text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)]"
                  />
                  <button
                    onClick={handleExecuteChatInstruction}
                    disabled={isProcessingChat || !chatInstruction.trim()}
                    className="p-2 rounded-xl bg-[var(--apple-accent)] text-white hover:bg-[var(--apple-accent-hover)] disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Speaker Notes */}
              <div className="pt-3 border-t border-[var(--apple-separator)] space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span>当前页讲者演练备忘录 (Notes)</span>
                </label>
                <p className="text-xs leading-relaxed text-[var(--apple-text-secondary)] bg-[var(--apple-subtle)]/40 p-3 rounded-2xl border border-[var(--apple-border)] font-sans">
                  {activeSlide.notes}
                </p>
              </div>
            </>
          )}

          {/* MODE 2: 🛠️ 本地编辑工作台面板 */}
          {studioMode === 'local_editor' && (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-[var(--apple-separator)]">
                <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                  <span>本地编辑工作台</span>
                </span>
                <span className="text-[10px] font-mono text-amber-500">Local Pro</span>
              </div>

              {/* 导入本地 PPT / 大纲按钮 */}
              <div className="p-3.5 rounded-2xl bg-[var(--apple-subtle)]/70 border border-[var(--apple-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--apple-text-primary)]">导入本地 PPT / 大纲</span>
                  <Upload className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-[10px] text-[var(--apple-text-tertiary)]">
                  支持导入 .pptx / .json / .md 大纲文档并自动解析为幻灯片
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 rounded-xl bg-[var(--apple-surface)] border border-[var(--apple-border)] hover:border-amber-500 text-xs font-semibold text-[var(--apple-text-primary)] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <FileUp className="w-3.5 h-3.5 text-amber-500" />
                  <span>{importedFileName ? `已导入: ${importedFileName}` : '选择本地文件导入'}</span>
                </button>
              </div>

              {/* 版式类型切换 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--apple-text-primary)]">页面版式切换</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(LAYOUT_CONFIG) as SlideLayout[]).map(l => (
                    <button
                      key={l}
                      onClick={() => setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? { ...s, layout: l } : s))}
                      className={`p-2 rounded-xl text-xs text-left border transition-all truncate ${
                        activeSlide.layout === l
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 font-semibold'
                          : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)]'
                      }`}
                    >
                      {LAYOUT_CONFIG[l].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 手动文本属性编辑 */}
              <div className="space-y-2.5 pt-2 border-t border-[var(--apple-separator)]">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--apple-text-tertiary)] uppercase">页面徽标</label>
                  <input
                    type="text"
                    value={activeSlide.badge || ''}
                    onChange={e => setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? { ...s, badge: e.target.value } : s))}
                    className="w-full px-3 py-1.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-xs text-[var(--apple-text-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--apple-text-tertiary)] uppercase">主标题</label>
                  <input
                    type="text"
                    value={activeSlide.title}
                    onChange={e => setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? { ...s, title: e.target.value } : s))}
                    className="w-full px-3 py-1.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-xs text-[var(--apple-text-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--apple-text-tertiary)] uppercase">副标题</label>
                  <input
                    type="text"
                    value={activeSlide.subtitle}
                    onChange={e => setSlides(prev => prev.map((s, idx) => idx === activeSlideIndex ? { ...s, subtitle: e.target.value } : s))}
                    className="w-full px-3 py-1.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-xs text-[var(--apple-text-primary)]"
                  />
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* ============================================================ */}
      {/* 3. FULL-SCREEN PRESENTATION OVERLAY (Apple Keynote Mode) */}
      {/* ============================================================ */}
      {isFullScreen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-12 select-none ${currentThemeConfig.bgClass}`}>
          <div className="w-full max-w-6xl aspect-[16/9] flex flex-col justify-between p-16 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span
                className="px-4 py-1.5 rounded-full text-sm font-bold font-mono tracking-wide"
                style={{ backgroundColor: `${currentThemeConfig.accentColor}25`, color: currentThemeConfig.accentColor }}
              >
                {activeSlide.badge || '企划概要'}
              </span>

              <span className="text-sm font-mono opacity-50">
                {activeSlideIndex + 1} / {slides.length}
              </span>
            </div>

            <div className="space-y-6 my-auto">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                {activeSlide.title}
              </h1>
              <p className="text-xl opacity-80">
                {activeSlide.subtitle}
              </p>
              {activeSlide.bullets && activeSlide.bullets.length > 0 && (
                <div className="pt-4 space-y-3">
                  {activeSlide.bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-3 text-lg">
                      <span className="w-2.5 h-2.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: currentThemeConfig.accentColor }} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-current/10 text-xs opacity-60">
              <span>按空格键 / 方向键翻页 · 按 ESC 退出全屏放映</span>
              <span>P{activeSlideIndex + 1} · {LAYOUT_CONFIG[activeSlide.layout]?.label}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
