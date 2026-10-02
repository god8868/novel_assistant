import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  ListTree, 
  Sparkles, 
  GitBranch, 
  Search, 
  Share, 
  Maximize2, 
  Minimize2, 
  Plus, 
  FolderOpen, 
  Folder, 
  HardDrive, 
  AlignLeft, 
  Type, 
  Undo2, 
  Redo2, 
  Wand2, 
  SlidersHorizontal, 
  ShieldCheck, 
  Flame, 
  Brain, 
  Clock, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  Copy, 
  Send, 
  Activity, 
  Feather, 
  Zap, 
  Trash2, 
  RotateCcw, 
  Layers, 
  Cpu, 
  X, 
  Tag, 
  Pin, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Upload, 
  Bookmark, 
  ChevronUp, 
  Moon, 
  Sun,
  LayoutGrid,
  FileCode,
  FileText,
  Compass,
  CornerDownLeft,
  Sliders,
  Database
} from 'lucide-react';

import { 
  NovelProject, 
  NovelChapter, 
  NovelLoreEntry, 
  NovelCharacter, 
  NovelFact, 
  NovelReviewItem, 
  ChapterStatus 
} from './novel_types.ts';
import { DEFAULT_NOVEL_PROJECT } from './novel_data_presets.ts';
import { WorldMatrixView } from './WorldMatrixView.tsx';
import { StorylineArcView } from './StorylineArcView.tsx';
import { NovelInspector } from './NovelInspector.tsx';

export const NovelStudio: React.FC<{
  onSaveToMaterial?: (title: string, body: string) => void;
}> = ({ onSaveToMaterial }) => {
  // -----------------------------------------------------------------------
  // 1. TOP-LEVEL WORKSPACE ARCHITECTURE: 3-PANE PERSPECTIVES
  // -----------------------------------------------------------------------
  const [activeWorkspace, setActiveWorkspace] = useState<'studio' | 'world' | 'arc'>('studio');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  // -----------------------------------------------------------------------
  // 2. PROJECT & CHAPTER DATA STATE
  // -----------------------------------------------------------------------
  const [project, setProject] = useState<NovelProject>(() => {
    const saved = localStorage.getItem('apple_novel_studio_project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.chapters && parsed.chapters.length > 0) return parsed;
      } catch (_) {}
    }
    return DEFAULT_NOVEL_PROJECT;
  });

  const [activeChapterId, setActiveChapterId] = useState<string>(
    project.chapters[1]?.id || project.chapters[0]?.id || 'chap_038'
  );

  const activeChapter = useMemo(() => {
    return project.chapters.find(c => c.id === activeChapterId) || project.chapters[0];
  }, [project.chapters, activeChapterId]);

  // Editor content local state
  const [editorText, setEditorText] = useState(activeChapter?.content || '');
  const [isOutlineStripOpen, setIsOutlineStripOpen] = useState(true);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [fontSize, setFontSize] = useState<number>(15);
  const [lineHeight, setLineHeight] = useState<number>(1.85);

  // Floating Selection Context Pill
  const [selectionRange, setSelectionRange] = useState<{ text: string; x: number; y: number } | null>(null);

  // Toast HUD notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2400);
  };

  // Sync editor content when changing active chapter
  useEffect(() => {
    if (activeChapter) {
      setEditorText(activeChapter.content || '');
      setSelectionRange(null);
    }
  }, [activeChapterId]);

  // Keyboard shortcuts for seamless workspace switching (⌘1, ⌘2, ⌘3, ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setActiveWorkspace('world');
        showToast('已切至：寰宇世界观 (World Matrix)');
      } else if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setActiveWorkspace('arc');
        showToast('已切至：宏观叙事台 (Storyline Arc)');
      } else if ((e.metaKey || e.ctrlKey) && e.key === '3') {
        e.preventDefault();
        setActiveWorkspace('studio');
        showToast('已切至：章节工坊 (Chapter Studio)');
      } else if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  // Persist project changes to localStorage
  useEffect(() => {
    localStorage.setItem('apple_novel_studio_project', JSON.stringify(project));
  }, [project]);

  // Update active chapter content
  const handleContentChange = (newText: string) => {
    setEditorText(newText);
    const wordsCount = newText.trim().length;
    setProject(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => 
        c.id === activeChapter.id ? { ...c, content: newText, words: wordsCount } : c
      )
    }));
  };

  // Chapter LifeCycle status switch
  const handleStatusChange = (status: ChapterStatus) => {
    setProject(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => 
        c.id === activeChapter.id ? { ...c, status } : c
      )
    }));
    showToast(`章节状态已切至: ${status.toUpperCase()}`);
  };

  // Review item actions
  const handleAcceptReview = (rev: NovelReviewItem, customRewrite?: string) => {
    const replacement = customRewrite || rev.rewrite || rev.suggestion;
    if (replacement && activeChapter.content.includes(rev.quote)) {
      const updated = activeChapter.content.replace(rev.quote, replacement);
      handleContentChange(updated);
    }
    setProject(prev => ({
      ...prev,
      reviews: prev.reviews.map(r => r.id === rev.id ? { ...r, state: 'accepted' } : r)
    }));
    showToast('已采纳审查改写方案并更新正文');
  };

  const handleIgnoreReview = (revId: string) => {
    setProject(prev => ({
      ...prev,
      reviews: prev.reviews.map(r => r.id === revId ? { ...r, state: 'ignored' } : r)
    }));
    showToast('已保留原稿并忽略该条审查');
  };

  const handleOverrideFact = (newFactContent: string, review: NovelReviewItem) => {
    setProject(prev => {
      let updatedFacts = prev.facts.map(f => {
        if (f.id === review.ruleRefId || review.issue.includes(f.subject)) {
          return { ...f, content: newFactContent, confirmed: true };
        }
        return f;
      });
      return {
        ...prev,
        facts: updatedFacts,
        reviews: prev.reviews.map(r => r.id === review.id ? { ...r, state: 'accepted' } : r)
      };
    });
    showToast('已保留原稿并同步覆写底层事实账本');
  };

  // Fact actions
  const handleConfirmFact = (factId: string) => {
    setProject(prev => ({
      ...prev,
      facts: prev.facts.map(f => f.id === factId ? { ...f, confirmed: true } : f)
    }));
    showToast('事实已确认并载入底层账本');
  };

  const handleConfirmAllFacts = () => {
    setProject(prev => ({
      ...prev,
      facts: prev.facts.map(f => ({ ...f, confirmed: true }))
    }));
    showToast('所有提取事实已批量确认入库');
  };

  // Lore Matrix actions
  const handleUpdateLore = (updated: NovelLoreEntry) => {
    setProject(prev => ({
      ...prev,
      loreEntries: prev.loreEntries.map(l => l.id === updated.id ? updated : l)
    }));
    showToast(`已更新法则条目: ${updated.name}`);
  };

  const handleAddLore = (newEntry: NovelLoreEntry) => {
    setProject(prev => ({
      ...prev,
      loreEntries: [newEntry, ...prev.loreEntries]
    }));
    showToast(`已创建世界观条目: ${newEntry.name}`);
  };

  const handleDeleteLore = (id: string) => {
    setProject(prev => ({
      ...prev,
      loreEntries: prev.loreEntries.filter(l => l.id !== id)
    }));
    showToast('已删除世界观设定条目');
  };

  // Text selection listener for Floating Context Pill
  const handleTextSelection = () => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end && end - start > 2) {
      const selected = textarea.value.substring(start, end);
      setSelectionRange({ text: selected, x: 300, y: 180 });
    } else {
      setSelectionRange(null);
    }
  };

  // Replace selected text in editor
  const handleReplaceSelected = (newSnippet: string) => {
    if (!selectionRange) {
      handleContentChange(`${editorText}\n\n${newSnippet}`);
    } else {
      const updated = editorText.replace(selectionRange.text, newSnippet);
      handleContentChange(updated);
    }
    setSelectionRange(null);
    showToast('已应用 AI 创作成果至正文');
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden bg-[var(--apple-bg)] text-[var(--apple-text-primary)] select-none font-sans ${isZenMode ? 'fixed inset-0 z-50' : ''}`}>
      
      {/* ------------------------------------------------------------ */}
      {/* 1. TOP MACos SEQUOIA TOOLBAR WITH 3D SEGMENTED WORKSPACE     */}
      {/* ------------------------------------------------------------ */}
      <header className="h-13 px-4 border-b border-[var(--apple-separator)] bg-[var(--apple-surface)]/80 backdrop-blur-2xl flex items-center justify-between shrink-0 z-30">
        
        {/* Left: Window Traffic Lights & Project Pill */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
            <span 
              onClick={() => setIsZenMode(!isZenMode)}
              className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] cursor-pointer hover:opacity-80 transition"
              title="全屏沉浸禅模式 (Zen Mode)"
            />
          </div>

          <div className="flex items-center space-x-2 border-l border-[var(--apple-separator)] pl-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              星
            </div>
            <h1 className="text-xs font-bold text-[var(--apple-text-primary)] truncate max-w-[200px]">
              {project.title}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)] hidden sm:inline">
              {project.genre}
            </span>
          </div>
        </div>

        {/* Center: macOS SEQUOIA 3D SEGMENTED WORKSPACE CONTROLLER */}
        <div className="flex items-center p-1 rounded-2xl bg-black/40 dark:bg-black/50 border border-white/10 text-xs font-medium shadow-inner backdrop-blur-2xl relative">
          {/* Segment 1: 寰宇世界观 */}
          <button
            onClick={() => {
              setActiveWorkspace('world');
              showToast('已切至：寰宇世界观 (World Matrix)');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer relative z-10 ${
              activeWorkspace === 'world'
                ? 'bg-white/20 dark:bg-white/20 text-white font-bold shadow-md shadow-black/20 border border-white/20 ring-1 ring-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="快捷键: ⌘1"
          >
            <Layers className={`w-3.5 h-3.5 ${activeWorkspace === 'world' ? 'text-blue-400' : 'text-zinc-400'}`} />
            <span>寰宇世界观</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
              activeWorkspace === 'world' ? 'bg-blue-500/30 text-blue-300 font-bold' : 'bg-white/5 text-zinc-500'
            }`}>
              {project.loreEntries.length}
            </span>
          </button>

          {/* Segment 2: 宏观叙事台 */}
          <button
            onClick={() => {
              setActiveWorkspace('arc');
              showToast('已切至：宏观叙事台 (Storyline Arc)');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer relative z-10 ${
              activeWorkspace === 'arc'
                ? 'bg-white/20 dark:bg-white/20 text-white font-bold shadow-md shadow-black/20 border border-white/20 ring-1 ring-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="快捷键: ⌘2"
          >
            <GitBranch className={`w-3.5 h-3.5 ${activeWorkspace === 'arc' ? 'text-purple-400' : 'text-zinc-400'}`} />
            <span>宏观叙事台</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
              activeWorkspace === 'arc' ? 'bg-purple-500/30 text-purple-300 font-bold' : 'bg-white/5 text-zinc-500'
            }`}>
              {project.storylineTracks.length}轨
            </span>
          </button>

          {/* Segment 3: 章节工坊 */}
          <button
            onClick={() => {
              setActiveWorkspace('studio');
              showToast('已切至：章节工坊 (Chapter Studio)');
            }}
            className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer relative z-10 ${
              activeWorkspace === 'studio'
                ? 'bg-white/20 dark:bg-white/20 text-white font-bold shadow-md shadow-black/20 border border-white/20 ring-1 ring-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="快捷键: ⌘3"
          >
            <BookOpen className={`w-3.5 h-3.5 ${activeWorkspace === 'studio' ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span>章节工坊</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
              activeWorkspace === 'studio' ? 'bg-amber-500/30 text-amber-300 font-bold' : 'bg-white/5 text-zinc-500'
            }`}>
              第{activeChapter.seq}章
            </span>
          </button>
        </div>

        {/* Right: Actions, Zen & Inspector Toggle */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              isZenMode 
                ? 'bg-[var(--apple-accent)] text-white font-bold border-transparent' 
                : 'bg-[var(--apple-surface)] hover:bg-[var(--apple-border)] border-[var(--apple-border)] text-[var(--apple-text-primary)]'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isZenMode ? '退出禅模式' : '禅模式'}</span>
          </button>

          {activeWorkspace === 'studio' && (
            <button
              onClick={() => setIsInspectorOpen(!isInspectorOpen)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isInspectorOpen 
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 font-bold' 
                  : 'bg-[var(--apple-surface)] hover:bg-[var(--apple-border)] border-[var(--apple-border)] text-[var(--apple-text-primary)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">专业检查器</span>
            </button>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------ */}
      {/* 2. DYNAMIC WORKSPACE SWITCHING RENDER                        */}
      {/* ------------------------------------------------------------ */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* WORKSPACE 1: 寰宇世界观矩阵 */}
        {activeWorkspace === 'world' && (
          <WorldMatrixView
            loreEntries={project.loreEntries}
            onUpdateLore={handleUpdateLore}
            onAddLore={handleAddLore}
            onDeleteLore={handleDeleteLore}
          />
        )}

        {/* WORKSPACE 2: 宏观叙事台 */}
        {activeWorkspace === 'arc' && (
          <StorylineArcView
            project={project}
            onSelectChapter={(chapId) => {
              setActiveChapterId(chapId);
              setActiveWorkspace('studio');
            }}
            onUpdateProject={(up) => setProject(prev => ({ ...prev, ...up }))}
          />
        )}

        {/* WORKSPACE 3: 章节工坊 (CHAPTER STUDIO) */}
        {activeWorkspace === 'studio' && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* -------------------------------------------------------- */}
            {/* 3.1 LEFT CHAPTERS LIFECYCLE SIDEBAR                      */}
            {/* -------------------------------------------------------- */}
            {!isZenMode && isLeftSidebarOpen && (
              <aside className="w-72 border-r border-[var(--apple-border)] bg-[var(--apple-surface)]/70 backdrop-blur-xl flex flex-col shrink-0">
                
                {/* Chapters Header */}
                <div className="p-3.5 border-b border-[var(--apple-separator)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListTree className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-[var(--apple-text-primary)]">分卷与章节目录</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)]">
                    {project.chapters.length} 章节
                  </span>
                </div>

                {/* Chapter List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {project.chapters.map(chap => {
                    const isSelected = chap.id === activeChapter.id;
                    const statusColorMap = {
                      planned: 'bg-zinc-500/20 text-zinc-400',
                      drafting: 'bg-blue-500/20 text-blue-400',
                      drafted: 'bg-purple-500/20 text-purple-400',
                      reviewing: 'bg-amber-500/20 text-amber-400',
                      final: 'bg-emerald-500/20 text-emerald-400'
                    };

                    return (
                      <div
                        key={chap.id}
                        onClick={() => setActiveChapterId(chap.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                          isSelected
                            ? 'bg-[var(--apple-surface)] border-[var(--apple-accent)] shadow-sm ring-1 ring-[var(--apple-accent)]/20'
                            : 'bg-[var(--apple-surface)]/50 border-[var(--apple-border)] hover:border-[var(--apple-border-strong)]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[var(--apple-text-primary)] truncate">
                            第 {chap.seq} 章 · {chap.title.split('：')[1] || chap.title}
                          </span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${statusColorMap[chap.status]}`}>
                            {chap.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--apple-text-tertiary)]">
                          <span>{chap.words.toLocaleString()} 字</span>
                          <span className="truncate max-w-[120px] text-amber-500">{chap.outline.storyTime.split(' ')[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Left Sidebar Footer */}
                <div className="p-3 border-t border-[var(--apple-separator)] flex items-center justify-between text-xs text-[var(--apple-text-tertiary)]">
                  <span>总字数: {project.totalWords.toLocaleString()} 字</span>
                  <span className="text-emerald-500 font-semibold font-mono">SQLite 同步</span>
                </div>
              </aside>
            )}

            {/* -------------------------------------------------------- */}
            {/* 3.2 CENTER EDITING CANVAS & STRUCTURED OUTLINE STRIP     */}
            {/* -------------------------------------------------------- */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[var(--apple-bg)] relative">
              
              {/* Top Chapter Metadata Ribbon */}
              <div className="px-6 py-2 border-b border-[var(--apple-separator)] bg-[var(--apple-surface)]/60 backdrop-blur-md flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base text-[var(--apple-text-primary)]">
                    第 {activeChapter.seq} 章：{activeChapter.title.split('：')[1] || activeChapter.title}
                  </span>

                  {/* Absolute Story Time Capsule */}
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[11px] font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>{activeChapter.outline.storyTime}</span>
                  </div>

                  {/* Lifecycle State Select */}
                  <select
                    value={activeChapter.status}
                    onChange={e => handleStatusChange(e.target.value as ChapterStatus)}
                    className="px-2 py-0.5 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-mono font-semibold text-[var(--apple-text-primary)] outline-none cursor-pointer"
                  >
                    <option value="planned">规划中 (PLANNED)</option>
                    <option value="drafting">草稿撰写中 (DRAFTING)</option>
                    <option value="drafted">初稿已完成 (DRAFTED)</option>
                    <option value="reviewing">AI 审查中 (REVIEWING)</option>
                    <option value="final">已定稿入库 (FINAL)</option>
                  </select>
                </div>

                {/* Outline Strip Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[var(--apple-text-tertiary)]">
                    字数: {activeChapter.words} / {activeChapter.outline.targetWords} 字
                  </span>

                  <button
                    onClick={() => setIsOutlineStripOpen(!isOutlineStripOpen)}
                    className="px-2.5 py-1 rounded-xl bg-[var(--apple-subtle)] hover:bg-[var(--apple-border)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] font-semibold flex items-center gap-1 transition"
                  >
                    <span>章纲板</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOutlineStripOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* STRUCTURED CHAPTER OUTLINE STICKY BEAT STRIP */}
              {isOutlineStripOpen && (
                <div className="px-6 py-3.5 border-b border-[var(--apple-separator)] bg-[var(--apple-surface)]/80 backdrop-blur-2xl text-xs space-y-3 shrink-0 animate-macos-fade">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Goal & Conflict */}
                    <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-1">
                      <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">核心目标 (Goal):</span>
                      <p className="text-xs text-[var(--apple-text-primary)] font-medium leading-relaxed">
                        {activeChapter.outline.goal}
                      </p>
                      <span className="text-[10px] font-mono text-red-400 font-bold uppercase block mt-1">核心冲突 (Conflict):</span>
                      <p className="text-[11px] text-[var(--apple-text-secondary)]">
                        {activeChapter.outline.conflict}
                      </p>
                    </div>

                    {/* Cast & Location */}
                    <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-1.5">
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">本章出场人物 (Cast):</span>
                      <div className="flex flex-wrap gap-1">
                        {activeChapter.outline.cast.map(c => (
                          <span key={c} className="px-2 py-0.5 rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] text-[11px] font-semibold text-[var(--apple-text-primary)] shadow-xs">
                            👤 {c}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 block pt-1">
                        发生场景: <b>{activeChapter.outline.location}</b>
                      </span>
                    </div>

                    {/* Foreshadow Promises */}
                    <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-1 text-[11px]">
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">待埋新伏笔 (Promise):</span>
                      <div className="text-zinc-300">
                        {activeChapter.outline.foreshadowPlant.join(', ') || '无'}
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block pt-1">本章回收伏笔 (Payoff):</span>
                      <div className="text-zinc-300">
                        {activeChapter.outline.foreshadowPayoff.join(', ') || '无'}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* MAIN TEXT EDITING PANE WITH BEATS GUTTER */}
              <div className="flex-1 flex overflow-hidden">
                
                {/* Left Beats Gutter Anchors */}
                <div className="w-32 border-r border-[var(--apple-border)] bg-[var(--apple-surface)]/30 p-3 space-y-3 hidden lg:block shrink-0">
                  <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)] uppercase font-semibold">
                    情节点拍线 (Beats)
                  </span>
                  {activeChapter.outline.beats.map(beat => (
                    <div key={beat.id} className="p-2 rounded-xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-1 shadow-xs">
                      <div className="text-[10px] font-bold text-[var(--apple-accent)] truncate">
                        {beat.label}
                      </div>
                      <p className="text-[9px] text-[var(--apple-text-secondary)] line-clamp-2">
                        {beat.summary}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Core Textarea */}
                <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto max-w-4xl mx-auto w-full relative">
                  
                  {/* Floating Context Pill */}
                  {selectionRange && (
                    <div 
                      className="absolute top-8 right-12 z-40 p-1 rounded-2xl bg-[#1c1c22]/95 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center gap-1 text-xs text-white animate-macos-fade"
                    >
                      <button
                        onClick={() => handleReplaceSelected(`[重构] ${selectionRange.text}`)}
                        className="px-2.5 py-1 rounded-xl hover:bg-white/10 text-purple-300 font-semibold flex items-center gap-1 transition"
                      >
                        <Flame className="w-3 h-3 text-purple-400" />
                        <span>去AI味重构</span>
                      </button>
                      <button
                        onClick={() => handleReplaceSelected(`[镜头特写] ${selectionRange.text}`)}
                        className="px-2.5 py-1 rounded-xl hover:bg-white/10 text-blue-300 font-semibold flex items-center gap-1 transition"
                      >
                        <Eye className="w-3 h-3 text-blue-400" />
                        <span>镜头白描</span>
                      </button>
                      <button
                        onClick={() => setSelectionRange(null)}
                        className="p-1 rounded-lg hover:bg-white/10 text-zinc-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <textarea
                    ref={editorRef}
                    value={editorText}
                    onChange={e => handleContentChange(e.target.value)}
                    onSelect={handleTextSelection}
                    placeholder="在此开启小说创作，自动对齐世界观法则与事实账本... (支持 ⌘K 唤醒灵感)"
                    className={`w-full flex-1 bg-transparent border-none outline-none resize-none leading-relaxed text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] ${
                      fontFamily === 'serif' ? 'font-serif' : 'font-sans'
                    }`}
                    style={{ fontSize: `${fontSize}px`, lineHeight }}
                  />
                </div>

              </div>

            </main>

            {/* -------------------------------------------------------- */}
            {/* 3.3 RIGHT 4-TAB PROFESSIONAL INSPECTOR                   */}
            {/* -------------------------------------------------------- */}
            {!isZenMode && isInspectorOpen && (
              <NovelInspector
                project={project}
                activeChapter={activeChapter}
                onClose={() => setIsInspectorOpen(false)}
                onAcceptReview={handleAcceptReview}
                onIgnoreReview={handleIgnoreReview}
                onConfirmFact={handleConfirmFact}
                onConfirmAllFacts={handleConfirmAllFacts}
                onOverrideFact={handleOverrideFact}
                onApplyCopilotPrompt={(p) => showToast('已将提示词注入生成管道')}
                onReplaceSelectedText={handleReplaceSelected}
                onAppendTextToChapter={(t) => handleContentChange(`${editorText}\n\n${t}`)}
              />
            )}

          </div>
        )}

      </div>

      {/* Floating Toast Notification HUD */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-neutral-900/90 text-white backdrop-blur-2xl border border-white/15 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-macos-fade">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
};
