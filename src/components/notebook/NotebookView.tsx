import React, { useState, useRef, useEffect } from 'react';
import { 
  StickyNote, 
  Plus, 
  Search, 
  Sparkles, 
  FileDown, 
  Trash2, 
  Copy, 
  Check, 
  SlidersHorizontal,
  Folder,
  Lightbulb,
  BookOpen,
  User,
  Layers,
  Pin,
  CheckSquare,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Tag,
  Share2,
  FolderGit2,
  Calendar,
  Clock,
  ChevronRight,
  X,
  Wand2,
  Sparkle,
  Bookmark,
  FileText
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';
import { QuickLookPopover, QuickLookData } from '../common/QuickLookPopover.tsx';

export type NoteCategory = 'all' | 'sparks' | 'outlines' | 'characters' | 'lore' | 'pinned';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'sparks' | 'outlines' | 'characters' | 'lore';
  tags: string[];
  isPinned: boolean;
  updatedAt: string;
}

const CATEGORY_MAP: Record<string, { label: string; icon: any; color: string; desc: string }> = {
  all: { label: '全部笔记', icon: Folder, color: '#0a84ff', desc: '查看工作台所有构思备忘' },
  sparks: { label: '灵感速记', icon: Lightbulb, color: '#ffd60a', desc: '偶发灵感、剧情脑洞与对话金句' },
  outlines: { label: '章节章纲', icon: BookOpen, color: '#30d158', desc: '长篇细纲、节奏波峰与转折卡点' },
  characters: { label: '人物小传', icon: User, color: '#ff9f0a', desc: '主角配角档案、性格缺陷与微动作' },
  lore: { label: '世界观法则', icon: Layers, color: '#bf5af2', desc: '功法设定、地理风物与宗门契约' },
  pinned: { label: '已置顶笔记', icon: Pin, color: '#ff375f', desc: '高频查阅与核心待办事项' }
};

export const NotebookView: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 'note-1',
      title: '仙侠打斗“气机虚实”与破妄瞳动作分解',
      category: 'lore',
      content: `【核心要义】\n写东方古典仙侠打斗，最忌“你一招我一式”的报菜名。高手过招，重在“势与气”。\n\n一、气机的压迫与先兆：\n秋雨未至，寒风已刺骨。剑未出鞘时，剑气激荡在衣袂之间的细微颤鸣，比直接拔刀更有压迫感。\n\n二、破妄瞳的实战应用：\n破妄瞳并非肉眼凡胎，而是照彻“气机缝隙”。敌方出招愈是猛烈，灵力运转至关节穴位时的迟滞愈大。\n• 案例：赵莽挥刀前，左肘曲池穴有半息虚浮。主角弹指飞铜钱，截断赤阳玉裂纹，以四两破千钧。\n\n三、生理反噬与代价感：\n严禁无限开挂。双目灼烧如烈铁刺针，咽下喉头血腥，这种强忍剧痛的隐忍，方能立住主角孤勇性格。`,
      tags: ['小说打斗', '动作设计', '设定参考'],
      isPinned: true,
      updatedAt: '10-01 15:45'
    },
    {
      id: 'note-2',
      title: '九渊大裂纪宗门资源垄断与商会暗线思考',
      category: 'lore',
      content: `【势力格局与矛盾动因】\n宗门高高在上，占据悬空浮岛与纯净清气灵脉。散修与凡人只能困居黑水深泽。\n\n• 万宝仙盟的立场：中立商贾表面唯利是图，实则是庶民与散修赖以交易活命的唯一枢纽。\n• 柳清霜的动机：借沈玄烛的神瞳窥测生路，换取打通大渊航道的独家商权，以此夺得总舵长老令。`,
      tags: ['世界观', '权谋暗线'],
      isPinned: false,
      updatedAt: '10-01 14:20'
    },
    {
      id: 'note-3',
      title: '柳清霜角色言语风格与伪装特征',
      category: 'characters',
      content: `【人物口癖与微习惯】\n• 伪装状态：言语温软，自称“小掌柜”，习惯用纤白手指把玩腰间算盘玉珠，看似贪财世故。\n• 真实面目：神色清冷如霜，算计极度精准。面对杀戮时睫毛不颤，指缝间常扣三枚破灵透骨针。\n• 与主角的契约：互不探究过往血仇，只论灵石与护送分润。`,
      tags: ['女主小传', '台词人设'],
      isPinned: false,
      updatedAt: '10-01 11:15'
    },
    {
      id: 'note-4',
      title: '第三卷核心大潮：黑水渊底古祭坛开启大纲',
      category: 'outlines',
      content: `【章节起承转合】\n1. 起：飞舟因禁空大阵坠毁，众人散落入黑水沼泽。\n2. 承：各方势力为了避开凶兽夜潮，被迫汇聚于古祭坛石门前。\n3. 转：赵莽残党试图血祭散修强行推门，主角当众以破妄瞳点出祭坛杀生阵弱点。\n4. 合：古门洞开，显露当年灭门惨案残卷，全卷高潮悬念收束。`,
      tags: ['卷大纲', '剧情起伏'],
      isPinned: true,
      updatedAt: '10-01 09:30'
    },
    {
      id: 'note-5',
      title: '灵感碎片：飞舟货舱暗道中“寒玉髓”的香气描写',
      category: 'sparks',
      content: `寒玉髓破碎时，并非散发药草苦涩，而是一种雪山初融般凛冽的冷梅香。正是这种异香被渊骨凶兽察觉，引发后文的意外围攻冲突。`,
      tags: ['感官描写', '伏笔线索'],
      isPinned: false,
      updatedAt: '09-30 21:05'
    }
  ]);

  const [activeNoteId, setActiveNoteId] = useState<string>('note-1');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiActionType, setAiActionType] = useState<'insights' | 'todos' | 'polish' | 'tags'>('insights');
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [materialSaved, setMaterialSaved] = useState(false);

  // macOS Quick Look Hover Preview State
  const [quickLookTarget, setQuickLookTarget] = useState<{ data: QuickLookData; position: { top: number; left: number } } | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCardMouseEnter = (e: React.MouseEvent, note: Note) => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const catCfg = CATEGORY_MAP[note.category] || CATEGORY_MAP.sparks;

    hoverTimerRef.current = setTimeout(() => {
      setQuickLookTarget({
        data: {
          title: note.title,
          categoryLabel: catCfg.label,
          categoryColor: catCfg.color,
          content: note.content,
          tags: note.tags,
          updatedAt: note.updatedAt,
          charCount: note.content.length
        },
        position: {
          top: rect.top,
          left: rect.right
        }
      });
    }, 280);
  };

  const handleCardMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    leaveTimerRef.current = setTimeout(() => {
      setQuickLookTarget(null);
    }, 150);
  };

  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  // Filtering Notes by Category and Search
  const filteredNotes = notes.filter(n => {
    const matchesCategory = 
      selectedCategory === 'all' ? true :
      selectedCategory === 'pinned' ? n.isPinned :
      n.category === selectedCategory;

    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  // Handle Note Creation with Active Category
  const handleCreateNote = () => {
    const categoryToUse = (selectedCategory === 'all' || selectedCategory === 'pinned') ? 'sparks' : selectedCategory;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '新构思笔记',
      category: categoryToUse,
      content: '在此记录你的长篇创作细节、人物设定或剧情火花...',
      tags: ['随记'],
      isPinned: false,
      updatedAt: '刚刚'
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  // Toggle Note Pin
  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotes(notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  // Delete Note
  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const remain = notes.filter(n => n.id !== id);
    setNotes(remain);
    if (activeNoteId === id && remain.length > 0) {
      setActiveNoteId(remain[0].id);
    }
  };

  // Text Formatting Insertions
  const handleInsertFormat = (prefix: string, suffix: string = '') => {
    if (!editorTextareaRef.current || !activeNote) return;
    const textarea = editorTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeNote.content;
    const selectedText = text.substring(start, end);
    const replacement = `${prefix}${selectedText || '文本'}${suffix}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setNotes(notes.map(n => n.id === activeNote.id ? { ...n, content: newContent } : n));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText ? selectedText.length : 2));
    }, 10);
  };

  // AI Assistant Functions
  const handleRunAiTool = (type: 'insights' | 'todos' | 'polish' | 'tags') => {
    if (!activeNote) return;
    setIsAiProcessing(true);
    setAiActionType(type);

    setTimeout(() => {
      if (type === 'insights') {
        setAiInsight(`💡 【AI 笔记洞察与结构提炼】\n\n1. **戏剧核心动力**：${activeNote.title} 中体现了极为强烈的因果自洽原则，建议继续深化付出与回报的代价比。\n2. **可扩充伏笔点**：在第二章节可埋下一处道具细节与本条笔记呼应，增强世界观纵深。\n3. **叙事张力建议**：避免直陈设定，将规则通过角色的口角争执或险死还生的瞬间带出。`);
      } else if (type === 'todos') {
        setAiInsight(`📋 【从笔记提取的创作行动清单】\n\n- [ ] 将本笔记中的动作规则融入主角首场生死实战\n- [ ] 为该设定增加一条不可逾越的“反噬禁忌”\n- [ ] 检查前三章是否有与本条笔记冲突的表述`);
      } else if (type === 'polish') {
        setAiInsight(`✍️ 【文学润色与去 AI 腔重述】\n\n${activeNote.content.slice(0, 160)}...\n\n*改写建议*：删去抽象评价副词，增强五感细节与冷冽笔调。`);
      } else if (type === 'tags') {
        const generated = ['伏笔闭环', '高燃节点', '世界观硬约束'];
        setNotes(notes.map(n => n.id === activeNote.id ? { ...n, tags: Array.from(new Set([...n.tags, ...generated])) } : n));
        setAiInsight(`🏷️ 已为当前笔记智能生成并注入新标签：#${generated.join(' #')}`);
      }
      setIsAiProcessing(false);
    }, 600);
  };

  // Save to Materials Knowledge Base
  const handleSaveToMaterials = async () => {
    if (!activeNote) return;
    try {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeNote.title,
          body: activeNote.content,
          tags: [...activeNote.tags, 'NoteBook归档']
        })
      });
      setMaterialSaved(true);
      setTimeout(() => setMaterialSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Export Note as Markdown
  const handleExportMarkdown = () => {
    if (!activeNote) return;
    const blob = new Blob([`# ${activeNote.title}\n\n分类：${CATEGORY_MAP[activeNote.category]?.label || '笔记'}\n标签：${activeNote.tags.join(', ')}\n更新时间：${activeNote.updatedAt}\n\n---\n\n${activeNote.content}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Word count & read time stats
  const charCount = activeNote ? activeNote.content.length : 0;
  const readMinutes = Math.max(1, Math.ceil(charCount / 350));

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--apple-bg)] select-none">
      {/* ============================================================ */}
      {/* 1. TOP macOS TOOLBAR FOR NOTEBOOK (备忘录专属顶栏) */}
      {/* ============================================================ */}
      <header className="h-[52px] border-b border-[var(--apple-border)] bg-[var(--apple-glass)] backdrop-blur-xl px-4 flex items-center justify-between shrink-0 select-none z-30">
        {/* Left Zone: Title & Global Note Count */}
        <div className="flex items-center gap-2.5 min-w-0">
          <StickyNote className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-xs font-bold text-[var(--apple-text-primary)]">NoteBook · 灵感速记与设定备忘</span>
          <div className="flex items-center gap-1.5 text-xs text-[var(--apple-text-secondary)] font-mono tabular-nums">
            <span>·</span>
            <span>共 {notes.length} 篇</span>
            <span>·</span>
            <span>{CATEGORY_MAP[selectedCategory]?.label} ({filteredNotes.length})</span>
          </div>
        </div>

        {/* Center Zone: Quick AI Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleRunAiTool('insights')}
            disabled={isAiProcessing}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-500 hover:bg-amber-500/25 transition-all shadow-xs"
            title="提炼笔记核心洞察"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI 核心洞察</span>
          </button>

          <button
            onClick={() => handleRunAiTool('todos')}
            disabled={isAiProcessing}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-all"
            title="提取创作行动项与待补伏笔"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>提取行动项</span>
          </button>

          <button
            onClick={() => handleRunAiTool('tags')}
            disabled={isAiProcessing}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-all"
            title="AI 智能自动打标"
          >
            <Tag className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
            <span>智能打标</span>
          </button>
        </div>

        {/* Right Zone: Actions (Pin, Archive, Export, New) */}
        <div className="flex items-center gap-1.5">
          {/* Pin Toggle */}
          {activeNote && (
            <button
              onClick={() => handleTogglePin(activeNote.id)}
              className={`p-1.5 rounded-lg border transition-all ${
                activeNote.isPinned
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-500 shadow-xs'
                  : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
              }`}
              title={activeNote.isPinned ? '取消置顶' : '置顶此笔记'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Save to Material */}
          <button
            onClick={handleSaveToMaterials}
            className={`p-1.5 rounded-lg border transition-all ${
              materialSaved
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
            }`}
            title="归档至素材管理资产库"
          >
            {materialSaved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FolderGit2 className="w-3.5 h-3.5" />}
          </button>

          {/* Export Markdown */}
          <button
            onClick={handleExportMarkdown}
            className="p-1.5 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-colors"
            title="导出当前笔记为 Markdown"
          >
            <FileDown className="w-3.5 h-3.5" />
          </button>

          {/* Copy Text */}
          <button
            onClick={() => {
              if (!activeNote) return;
              navigator.clipboard.writeText(activeNote.content);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="p-1.5 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-colors"
            title="复制正文"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <div className="h-4 w-px bg-[var(--apple-border)] mx-1" />

          {/* New Note */}
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-[var(--apple-accent)] text-white hover:bg-[var(--apple-accent-hover)] transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建备忘</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. BODY TRIPLE-COLUMN VIEW (macOS Notes Architecture) */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========================================================== */}
        {/* COLUMN 1: FUNCTIONAL CATEGORIES (分类导航栏) */}
        {/* ========================================================== */}
        <aside className="w-52 border-r border-[var(--apple-border)] bg-[var(--apple-sidebar)] flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-[var(--apple-separator)]">
            <span className="text-[11px] font-bold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
              备忘分类体系
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs">
            {(Object.keys(CATEGORY_MAP) as NoteCategory[]).map(catKey => {
              const cfg = CATEGORY_MAP[catKey];
              const Icon = cfg.icon;
              const count = catKey === 'all' 
                ? notes.length 
                : catKey === 'pinned'
                  ? notes.filter(n => n.isPinned).length
                  : notes.filter(n => n.category === catKey).length;
              const isSelected = selectedCategory === catKey;

              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[var(--apple-accent)] text-white font-semibold shadow-xs'
                      : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon 
                      className="w-3.5 h-3.5 shrink-0" 
                      style={{ color: isSelected ? 'white' : cfg.color }} 
                    />
                    <span className="truncate">{cfg.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono tabular-nums ${isSelected ? 'text-white/80' : 'text-[var(--apple-text-tertiary)]'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category Description Footer Card */}
          <div className="p-3 border-t border-[var(--apple-separator)] bg-[var(--apple-subtle)]/20 text-[11px] text-[var(--apple-text-tertiary)]">
            <div className="font-semibold text-[var(--apple-text-secondary)] mb-0.5">
              {CATEGORY_MAP[selectedCategory]?.label}
            </div>
            <div className="text-[10px] leading-tight">
              {CATEGORY_MAP[selectedCategory]?.desc}
            </div>
          </div>
        </aside>

        {/* ========================================================== */}
        {/* COLUMN 2: NOTES LIST (备忘卡片列表) */}
        {/* ========================================================== */}
        <div className="w-72 border-r border-[var(--apple-border)] bg-[var(--apple-surface)]/70 flex flex-col shrink-0">
          {/* Search Header */}
          <div className="p-2.5 border-b border-[var(--apple-separator)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--apple-text-tertiary)]" />
              <input
                type="text"
                placeholder="搜索标题、正文或 #标签..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-lg text-xs text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] focus:outline-none focus:border-[var(--apple-accent)] transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notes Cards List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredNotes.length === 0 ? (
              <div className="py-16 text-center text-xs text-[var(--apple-text-tertiary)] space-y-1">
                <StickyNote className="w-8 h-8 mx-auto opacity-30 text-amber-500" />
                <p>当前分类下暂无备忘</p>
                <button
                  onClick={handleCreateNote}
                  className="text-xs text-[var(--apple-accent)] hover:underline mt-1 font-medium inline-block"
                >
                  创建第一篇笔记
                </button>
              </div>
            ) : (
              filteredNotes.map(n => {
                const isActive = n.id === activeNoteId;
                const catCfg = CATEGORY_MAP[n.category] || CATEGORY_MAP.sparks;

                return (
                  <div
                    key={n.id}
                    onClick={() => setActiveNoteId(n.id)}
                    onMouseEnter={e => handleCardMouseEnter(e, n)}
                    onMouseLeave={handleCardMouseLeave}
                    className={`p-3 rounded-2xl cursor-pointer transition-all duration-150 border select-text relative group ${
                      isActive
                        ? 'bg-[var(--apple-accent)] text-white border-transparent shadow-[0_4px_14px_rgba(10,132,255,0.25)]'
                        : 'bg-[var(--apple-surface)] border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:border-[var(--apple-border-strong)] hover:shadow-sm'
                    }`}
                  >
                    {/* Header: Title & Pin Indicator */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {n.isPinned && (
                          <Pin className={`w-3 h-3 shrink-0 ${isActive ? 'text-amber-300' : 'text-amber-500'}`} />
                        )}
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-[var(--apple-text-primary)]'}`}>
                          {n.title}
                        </span>
                      </div>

                      {/* Delete Quick Button on Hover */}
                      <button
                        onClick={e => handleDeleteNote(n.id, e)}
                        className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity ${
                          isActive ? 'text-white/80 hover:text-white' : 'text-[var(--apple-text-tertiary)] hover:text-rose-500'
                        }`}
                        title="删除笔记"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Content Snippet */}
                    <p className={`text-[11px] line-clamp-2 leading-relaxed mb-2 ${isActive ? 'text-white/85' : 'text-[var(--apple-text-tertiary)]'}`}>
                      {n.content}
                    </p>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-1.5 h-1.5 rounded-full" 
                          style={{ backgroundColor: isActive ? 'white' : catCfg.color }} 
                        />
                        <span className={isActive ? 'text-white/80' : 'text-[var(--apple-text-tertiary)]'}>
                          {catCfg.label}
                        </span>
                      </div>

                      <div className={`flex items-center gap-1.5 ${isActive ? 'text-white/70' : 'text-[var(--apple-text-tertiary)]'}`}>
                        <span>{n.updatedAt}</span>
                        <span>·</span>
                        <span>{n.content.length} 字</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================== */}
        {/* COLUMN 3: NOTE EDITOR & RICH FORMAT BAR (沉浸写作主视窗) */}
        {/* ========================================================== */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--apple-bg)]">
          {activeNote ? (
            <>
              {/* Apple Notes Format Ribbon (极简排版微控条) */}
              <div className="h-10 border-b border-[var(--apple-separator)] bg-[var(--apple-surface)]/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none">
                {/* Text Styles */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleInsertFormat('**', '**')}
                    className="p-1.5 rounded-md text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-colors"
                    title="粗体 (⌘B)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertFormat('*', '*')}
                    className="p-1.5 rounded-md text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-colors"
                    title="斜体 (⌘I)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-3.5 w-px bg-[var(--apple-border)] mx-1" />

                  <button
                    onClick={() => handleInsertFormat('\n• ')}
                    className="p-1.5 rounded-md text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-colors"
                    title="无序列表"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertFormat('\n1. ')}
                    className="p-1.5 rounded-md text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-colors"
                    title="有序编号列表"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertFormat('\n- [ ] ')}
                    className="p-1.5 rounded-md text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-colors"
                    title="待办清单复选框"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-3.5 w-px bg-[var(--apple-border)] mx-1" />

                  <button
                    onClick={() => handleInsertFormat('\n> ')}
                    className="p-1.5 rounded-md text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-colors"
                    title="引用块"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleInsertFormat('`', '`')}
                    className="p-1.5 rounded-md text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-colors"
                    title="行内代码"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right Info: Word Count & Category Tag */}
                <div className="flex items-center gap-3 text-xs text-[var(--apple-text-secondary)] font-mono">
                  <span>{charCount} 字符</span>
                  <span>·</span>
                  <span>预计阅读 {readMinutes} 分钟</span>
                  <span>·</span>
                  {/* Category Switcher Pill */}
                  <select
                    value={activeNote.category}
                    onChange={e => {
                      const newCat = e.target.value as any;
                      setNotes(notes.map(n => n.id === activeNote.id ? { ...n, category: newCat } : n));
                    }}
                    className="bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-md px-2 py-0.5 text-[11px] text-[var(--apple-text-primary)] focus:outline-none"
                  >
                    <option value="sparks">💡 灵感速记</option>
                    <option value="outlines">📖 章节章纲</option>
                    <option value="characters">👤 人物小传</option>
                    <option value="lore">🔮 世界观法则</option>
                  </select>
                </div>
              </div>

              {/* Note Content Writing Canvas */}
              <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                <div className="w-full max-w-2xl flex flex-col space-y-4">
                  {/* Note Title Input */}
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={e => {
                      const newT = e.target.value;
                      setNotes(notes.map(n => n.id === activeNote.id ? { ...n, title: newT } : n));
                    }}
                    placeholder="输入笔记标题..."
                    className="text-2xl font-bold bg-transparent text-[var(--apple-text-primary)] border-b border-transparent hover:border-[var(--apple-border)] focus:border-[var(--apple-accent)] focus:outline-none pb-1.5 transition-all tracking-tight"
                  />

                  {/* Tags Bar */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeNote.tags.map(t => (
                      <span 
                        key={t} 
                        className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-secondary)] flex items-center gap-1 group"
                      >
                        <span>#{t}</span>
                        <button
                          onClick={() => {
                            setNotes(notes.map(n => n.id === activeNote.id ? { ...n, tags: n.tags.filter(tag => tag !== t) } : n));
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity"
                        >
                          ✕
                        </button>
                      </span>
                    ))}

                    {showTagInput ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={newTagText}
                          onChange={e => setNewTagText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && newTagText.trim()) {
                              setNotes(notes.map(n => n.id === activeNote.id ? { ...n, tags: Array.from(new Set([...n.tags, newTagText.trim()])) } : n));
                              setNewTagText('');
                              setShowTagInput(false);
                            } else if (e.key === 'Escape') {
                              setShowTagInput(false);
                            }
                          }}
                          placeholder="新标签名 (回车)..."
                          className="px-2 py-0.5 rounded-md bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[11px] text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)]"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowTagInput(true)}
                        className="text-[11px] font-mono text-[var(--apple-text-tertiary)] hover:text-[var(--apple-accent)] transition-colors flex items-center gap-0.5 px-1.5 py-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>添加标签</span>
                      </button>
                    )}
                  </div>

                  {/* Body Textarea */}
                  <textarea
                    ref={editorTextareaRef}
                    value={activeNote.content}
                    onChange={e => {
                      const newC = e.target.value;
                      setNotes(notes.map(n => n.id === activeNote.id ? { ...n, content: newC } : n));
                    }}
                    placeholder="在此记录你的创作思路、灵感火花或剧情伏笔..."
                    className="w-full flex-1 min-h-[460px] bg-transparent text-sm leading-relaxed text-[var(--apple-text-primary)] resize-none focus:outline-none font-sans"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--apple-text-tertiary)] space-y-2">
              <StickyNote className="w-12 h-12 opacity-30 text-amber-500" />
              <p className="text-sm">请选择或新建一篇备忘笔记</p>
            </div>
          )}
        </div>

        {/* ========================================================== */}
        {/* COLUMN 4: AI INSIGHTS DRAWER (AI 笔记提炼抽屉) */}
        {/* ========================================================== */}
        {aiInsight && (
          <aside className="w-80 border-l border-[var(--apple-border)] bg-[var(--apple-surface)] flex flex-col shrink-0 select-none animate-in slide-in-from-right duration-200 z-20">
            {/* Header */}
            <div className="h-12 px-4 border-b border-[var(--apple-separator)] flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI 备忘智能提炼</span>
              </span>
              <button 
                onClick={() => setAiInsight(null)} 
                className="text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] shadow-xs select-text">
                <AppleMarkdown content={aiInsight} />
              </div>
            </div>

            {/* Footer Insertion */}
            <div className="p-4 border-t border-[var(--apple-separator)] space-y-2 shrink-0">
              <button
                onClick={() => {
                  if (!activeNote) return;
                  setNotes(notes.map(n => n.id === activeNote.id ? { ...n, content: n.content + '\n\n' + aiInsight } : n));
                  setAiInsight(null);
                }}
                className="w-full py-2 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold shadow-xs hover:bg-[var(--apple-accent-hover)] transition-all"
              >
                追加插入至正文末尾
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* macOS Quick Look Hover Popover */}
      {quickLookTarget && (
        <QuickLookPopover
          data={quickLookTarget.data}
          position={quickLookTarget.position}
          onMouseEnter={() => {
            if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
          }}
          onMouseLeave={() => setQuickLookTarget(null)}
        />
      )}
    </div>
  );
};
