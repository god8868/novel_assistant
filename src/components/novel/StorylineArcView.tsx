import React, { useState, useMemo } from 'react';
import { 
  GitBranch, 
  Clock, 
  Layers, 
  Plus, 
  Sparkles, 
  Check, 
  Calendar, 
  ArrowRight, 
  Compass, 
  AlertTriangle, 
  Activity, 
  Tag, 
  Search, 
  Users, 
  Eye, 
  CheckCircle2, 
  ExternalLink,
  Kanban,
  Link2,
  Trash2,
  Edit3,
  X,
  Sliders,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Bookmark,
  CheckSquare,
  Square,
  HelpCircle,
  FileText,
  AlertCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { 
  NovelProject, 
  StorylineTrack, 
  NovelChapter, 
  NovelFact, 
  StructuredChapterOutline,
  ChapterStatus 
} from './novel_types.ts';

interface StorylineArcViewProps {
  project: NovelProject;
  onSelectChapter: (chapterId: string) => void;
  onUpdateProject: (updated: Partial<NovelProject>) => void;
}

// Foreshadowing / Promise item structure with linked chapters
export interface ForeshadowingLink {
  id: string;
  title: string;
  subject: string;
  plantChapterSeq: number;
  payoffChapterSeq: number;
  status: 'pending' | 'resolved' | 'broken';
  clues: string;
  importance: 'critical' | 'major' | 'minor';
  trackId?: string;
  notes?: string;
}

export const StorylineArcView: React.FC<StorylineArcViewProps> = ({
  project,
  onSelectChapter,
  onUpdateProject
}) => {
  // Sub-tabs: Gantt, Kanban, Foreshadowing Matrix, Chronology & Relations
  const [activeTab, setActiveTab] = useState<'gantt' | 'kanban' | 'foreshadow' | 'chronology' | 'relations'>('gantt');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [filterVolume, setFilterVolume] = useState<number | 'all'>('all');

  // Modal States
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedTrackForEvent, setSelectedTrackForEvent] = useState<string | null>(null);
  const [isAddTrackModalOpen, setIsAddTrackModalOpen] = useState(false);
  const [isForeshadowModalOpen, setIsForeshadowModalOpen] = useState(false);
  const [editingForeshadow, setEditingForeshadow] = useState<ForeshadowingLink | null>(null);
  const [isEditOutlineModalOpen, setIsEditOutlineModalOpen] = useState(false);
  const [activeEditingChapter, setActiveEditingChapter] = useState<NovelChapter | null>(null);

  // Foreshadowings derived from Facts (kind === 'promise') and chapters outline
  const [customForeshadows, setCustomForeshadows] = useState<ForeshadowingLink[]>(() => {
    // Initial synthetic seeds from facts
    return [
      {
        id: 'fs_watch_reverse',
        title: '逆熵怀表内部十二重神性齿轮倒转',
        subject: '逆熵怀表',
        plantChapterSeq: 38,
        payoffChapterSeq: 52,
        status: 'pending',
        clues: '第38章林巡在船坞击碎破甲符弹时触发齿轮反转，提示第52章大清洗真相',
        importance: 'critical',
        trackId: 'track_mystery'
      },
      {
        id: 'fs_master_betrayal',
        title: '师尊逆修魔纲反噬与黑星港执事堂密令',
        subject: '师尊苍玄',
        plantChapterSeq: 12,
        payoffChapterSeq: 45,
        status: 'pending',
        clues: '留下的残卷缺失三页，暗藏执事堂绝杀烙印',
        importance: 'major',
        trackId: 'track_mystery'
      },
      {
        id: 'fs_abyss_key',
        title: '深渊废墟第三区隐藏星图钥匙',
        subject: '深渊废墟',
        plantChapterSeq: 24,
        payoffChapterSeq: 38,
        status: 'resolved',
        clues: '在泊位接头暗哨中已确认坐标并交付林巡',
        importance: 'minor',
        trackId: 'track_main'
      },
      {
        id: 'fs_senate_purge',
        title: '执事堂内部长生教派血祭清洗暗线',
        subject: '执事堂',
        plantChapterSeq: 30,
        payoffChapterSeq: 60,
        status: 'pending',
        clues: '第九执事暗中在全港散布灵子禁制',
        importance: 'critical',
        trackId: 'track_faction'
      }
    ];
  });

  // Form states for modals
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventSummary, setNewEventSummary] = useState('');
  const [newEventChapterSeq, setNewEventChapterSeq] = useState(38);
  const [newEventType, setNewEventType] = useState<'plant' | 'climax' | 'payoff' | 'turning_point'>('plant');

  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackType, setNewTrackType] = useState<'main' | 'mystery' | 'faction' | 'romance'>('mystery');
  const [newTrackColor, setNewTrackColor] = useState('#8B5CF6');
  const [newTrackDesc, setNewTrackDesc] = useState('');

  // Foreshadow form state
  const [fsTitle, setFsTitle] = useState('');
  const [fsSubject, setFsSubject] = useState('');
  const [fsPlantChapter, setFsPlantChapter] = useState(38);
  const [fsPayoffChapter, setFsPayoffChapter] = useState(50);
  const [fsClues, setFsClues] = useState('');
  const [fsImportance, setFsImportance] = useState<'critical' | 'major' | 'minor'>('major');
  const [fsTrackId, setFsTrackId] = useState('track_mystery');

  // Outline form state
  const [outlineGoal, setOutlineGoal] = useState('');
  const [outlineConflict, setOutlineConflict] = useState('');
  const [outlineCast, setOutlineCast] = useState('');
  const [outlineLocation, setOutlineLocation] = useState('');
  const [outlineStoryTime, setOutlineStoryTime] = useState('');
  const [outlineEndingHook, setOutlineEndingHook] = useState('');

  // Volume grouped chapters
  const volumes = useMemo(() => {
    const map = new Map<number, NovelChapter[]>();
    project.chapters.forEach(c => {
      const volNum = c.vol || 1;
      if (!map.has(volNum)) map.set(volNum, []);
      map.get(volNum)!.push(c);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [project.chapters]);

  // Filtered chapters for Kanban
  const filteredChapters = useMemo(() => {
    return project.chapters.filter(c => {
      if (filterVolume !== 'all' && c.vol !== filterVolume) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.outline.goal.toLowerCase().includes(q) ||
          c.outline.conflict.toLowerCase().includes(q) ||
          c.outline.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [project.chapters, filterVolume, searchQuery]);

  // Foreshadowing Stats
  const totalForeshadows = customForeshadows.length;
  const resolvedForeshadows = customForeshadows.filter(f => f.status === 'resolved').length;
  const pendingForeshadows = totalForeshadows - resolvedForeshadows;
  const payoffRate = totalForeshadows > 0 ? Math.round((resolvedForeshadows / totalForeshadows) * 100) : 0;

  // Track actions
  const handleAddEvent = () => {
    if (!selectedTrackForEvent || !newEventTitle.trim()) return;
    const newEv = {
      id: `ev_${Date.now()}`,
      chapterSeq: newEventChapterSeq,
      title: newEventTitle.trim(),
      summary: newEventSummary.trim() || '情节点推演记录',
      type: newEventType
    };

    const updatedTracks = project.storylineTracks.map(t => {
      if (t.id === selectedTrackForEvent) {
        return {
          ...t,
          events: [...t.events, newEv].sort((a, b) => a.chapterSeq - b.chapterSeq)
        };
      }
      return t;
    });

    onUpdateProject({ storylineTracks: updatedTracks });
    setIsAddEventModalOpen(false);
    setNewEventTitle('');
    setNewEventSummary('');
  };

  const handleDeleteEvent = (trackId: string, eventId: string) => {
    const updatedTracks = project.storylineTracks.map(t => {
      if (t.id === trackId) {
        return { ...t, events: t.events.filter(e => e.id !== eventId) };
      }
      return t;
    });
    onUpdateProject({ storylineTracks: updatedTracks });
  };

  const handleCreateTrack = () => {
    if (!newTrackName.trim()) return;
    const newTrack: StorylineTrack = {
      id: `track_${Date.now()}`,
      name: newTrackName.trim(),
      type: newTrackType,
      color: newTrackColor,
      description: newTrackDesc.trim() || '多线叙事推进轨',
      events: []
    };
    onUpdateProject({ storylineTracks: [...project.storylineTracks, newTrack] });
    setIsAddTrackModalOpen(false);
    setNewTrackName('');
    setNewTrackDesc('');
  };

  // Foreshadow actions
  const handleOpenNewForeshadow = () => {
    setEditingForeshadow(null);
    setFsTitle('');
    setFsSubject('');
    setFsPlantChapter(38);
    setFsPayoffChapter(50);
    setFsClues('');
    setFsImportance('major');
    setFsTrackId(project.storylineTracks[0]?.id || 'track_mystery');
    setIsForeshadowModalOpen(true);
  };

  const handleEditForeshadow = (fs: ForeshadowingLink) => {
    setEditingForeshadow(fs);
    setFsTitle(fs.title);
    setFsSubject(fs.subject);
    setFsPlantChapter(fs.plantChapterSeq);
    setFsPayoffChapter(fs.payoffChapterSeq);
    setFsClues(fs.clues);
    setFsImportance(fs.importance);
    setFsTrackId(fs.trackId || 'track_mystery');
    setIsForeshadowModalOpen(true);
  };

  const handleSaveForeshadow = () => {
    if (!fsTitle.trim()) return;
    if (editingForeshadow) {
      setCustomForeshadows(prev => prev.map(f => f.id === editingForeshadow.id ? {
        ...f,
        title: fsTitle.trim(),
        subject: fsSubject.trim() || '伏笔主体',
        plantChapterSeq: fsPlantChapter,
        payoffChapterSeq: fsPayoffChapter,
        clues: fsClues.trim(),
        importance: fsImportance,
        trackId: fsTrackId
      } : f));
    } else {
      const newFs: ForeshadowingLink = {
        id: `fs_${Date.now()}`,
        title: fsTitle.trim(),
        subject: fsSubject.trim() || '伏笔主体',
        plantChapterSeq: fsPlantChapter,
        payoffChapterSeq: fsPayoffChapter,
        status: 'pending',
        clues: fsClues.trim(),
        importance: fsImportance,
        trackId: fsTrackId
      };
      setCustomForeshadows(prev => [newFs, ...prev]);
    }
    setIsForeshadowModalOpen(false);
  };

  const handleToggleForeshadowStatus = (id: string) => {
    setCustomForeshadows(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, status: f.status === 'resolved' ? 'pending' : 'resolved' };
      }
      return f;
    }));
  };

  const handleDeleteForeshadow = (id: string) => {
    setCustomForeshadows(prev => prev.filter(f => f.id !== id));
  };

  // Outline Edit
  const handleOpenEditOutline = (chap: NovelChapter) => {
    setActiveEditingChapter(chap);
    setOutlineGoal(chap.outline.goal);
    setOutlineConflict(chap.outline.conflict);
    setOutlineCast(chap.outline.cast.join(', '));
    setOutlineLocation(chap.outline.location);
    setOutlineStoryTime(chap.outline.storyTime);
    setOutlineEndingHook(chap.outline.endingHook);
    setIsEditOutlineModalOpen(true);
  };

  const handleSaveOutline = () => {
    if (!activeEditingChapter) return;
    const updatedChapters = project.chapters.map(c => {
      if (c.id === activeEditingChapter.id) {
        return {
          ...c,
          outline: {
            ...c.outline,
            goal: outlineGoal.trim(),
            conflict: outlineConflict.trim(),
            cast: outlineCast.split(',').map(s => s.trim()).filter(Boolean),
            location: outlineLocation.trim(),
            storyTime: outlineStoryTime.trim(),
            endingHook: outlineEndingHook.trim()
          }
        };
      }
      return c;
    });
    onUpdateProject({ chapters: updatedChapters });
    setIsEditOutlineModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--apple-bg)] select-none font-sans">
      
      {/* ------------------------------------------------------------ */}
      {/* 1. TOP MACos SEQUOIA SUB-NAVIGATION RIBBON                   */}
      {/* ------------------------------------------------------------ */}
      <header className="h-13 px-6 border-b border-[var(--apple-separator)] bg-[var(--apple-surface)]/80 backdrop-blur-2xl flex items-center justify-between shrink-0 z-20">
        
        {/* Left: Section Header & Stats */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GitBranch className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-[var(--apple-text-primary)]">
              宏观叙事台 (Storyline Arc & Narrative Matrix)
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-[10px] font-mono text-[var(--apple-text-tertiary)] border-l border-[var(--apple-separator)] pl-3">
            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
              {project.storylineTracks.length} 故事多轨
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
              伏笔闭环率 {payoffRate}% ({resolvedForeshadows}/{totalForeshadows})
            </span>
          </div>
        </div>

        {/* Center: macOS Style Sub-Tabs Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-black/40 dark:bg-black/50 border border-white/10 text-xs font-medium shadow-inner backdrop-blur-2xl">
          <button
            onClick={() => setActiveTab('gantt')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'gantt' 
                ? 'bg-white/20 text-white font-bold shadow-xs border border-white/20' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            <span>多轨甘特图</span>
          </button>

          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'kanban' 
                ? 'bg-white/20 text-white font-bold shadow-xs border border-white/20' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5 text-emerald-400" />
            <span>分卷章纲看板</span>
          </button>

          <button
            onClick={() => setActiveTab('foreshadow')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'foreshadow' 
                ? 'bg-white/20 text-white font-bold shadow-xs border border-white/20' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-amber-400" />
            <span>伏笔因果矩阵</span>
            <span className="text-[9px] font-mono px-1 rounded bg-amber-500/30 text-amber-300 font-bold">
              {pendingForeshadows}待收
            </span>
          </button>

          <button
            onClick={() => setActiveTab('chronology')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chronology' 
                ? 'bg-white/20 text-white font-bold shadow-xs border border-white/20' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>故事编年史</span>
          </button>

          <button
            onClick={() => setActiveTab('relations')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'relations' 
                ? 'bg-white/20 text-white font-bold shadow-xs border border-white/20' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>人物拓扑</span>
          </button>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          {activeTab === 'gantt' && (
            <button
              onClick={() => setIsAddTrackModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建故事轨</span>
            </button>
          )}

          {activeTab === 'foreshadow' && (
            <button
              onClick={handleOpenNewForeshadow}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>埋设新伏笔</span>
            </button>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------ */}
      {/* 2. MAIN WORKSPACE VIEWPORT                                    */}
      {/* ------------------------------------------------------------ */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

        {/* ========================================================== */}
        {/* VIEW 1: MULTI-TRACK STORYLINE GANTT MATRIX                 */}
        {/* ========================================================== */}
        {activeTab === 'gantt' && (
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Top Insight Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-transparent border border-blue-500/20 text-xs text-blue-200 flex items-start justify-between shadow-xs">
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>多轨叙事时间轴与情节点流转 (Multi-Track Timeline Matrix)</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed max-w-3xl">
                  主线推进、暗线伏笔与势力演进并行推进。每个情节点严格对应正文章节。若暗线超过 10 章无事件推进，系统将触发断更预警。
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsAddTrackModalOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>添加轨道</span>
                </button>
              </div>
            </div>

            {/* Tracks Gantt Table */}
            <div className="space-y-4">
              {project.storylineTracks.map(track => {
                // Check if track is stalled (no event for recent chapters)
                const lastEventSeq = track.events.length > 0 ? Math.max(...track.events.map(e => e.chapterSeq)) : 0;
                const isStalled = track.type === 'mystery' && lastEventSeq > 0 && (38 - lastEventSeq > 10);

                return (
                  <div 
                    key={track.id} 
                    className="p-5 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-4 shadow-xs relative overflow-hidden group hover:border-[var(--apple-border-strong)] transition"
                  >
                    {/* Track Color Left Accent Bar */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1.5" 
                      style={{ backgroundColor: track.color }} 
                    />

                    {/* Track Header */}
                    <div className="flex items-center justify-between pl-2 border-b border-[var(--apple-separator)] pb-3">
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-3 h-3 rounded-full ring-2 ring-white/20" 
                          style={{ backgroundColor: track.color }} 
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[var(--apple-text-primary)]">
                              {track.name}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] border border-[var(--apple-border)]">
                              {track.type.toUpperCase()}
                            </span>
                            {isStalled && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>超过10章未推进</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">
                            {track.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)]">
                          {track.events.length} 个情节点
                        </span>
                        <button
                          onClick={() => {
                            setSelectedTrackForEvent(track.id);
                            setIsAddEventModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-[var(--apple-subtle)] hover:bg-[var(--apple-border)] text-[var(--apple-text-primary)] text-[11px] font-semibold flex items-center gap-1 border border-[var(--apple-border)] transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-[var(--apple-accent)]" />
                          <span>插点</span>
                        </button>
                      </div>
                    </div>

                    {/* Flow Nodes Horizontal Track */}
                    <div className="flex items-center gap-3 overflow-x-auto py-2 pl-2">
                      {track.events.length === 0 ? (
                        <div className="py-6 text-center w-full text-xs text-[var(--apple-text-tertiary)] italic">
                          暂无情节点，点击右上角「插点」添加情节点序列
                        </div>
                      ) : (
                        track.events.map((ev, idx) => {
                          const isClimax = ev.type === 'climax';
                          const isPayoff = ev.type === 'payoff';
                          const isPlant = ev.type === 'plant';

                          return (
                            <React.Fragment key={ev.id}>
                              <div 
                                className={`min-w-[210px] max-w-[240px] p-3.5 rounded-xl border transition cursor-pointer space-y-2 relative group/card ${
                                  isClimax 
                                    ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500' 
                                    : isPayoff
                                    ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500'
                                    : isPlant
                                    ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500'
                                    : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] hover:border-[var(--apple-accent)]'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span 
                                    onClick={() => {
                                      const chap = project.chapters.find(c => c.seq === ev.chapterSeq);
                                      if (chap) onSelectChapter(chap.id);
                                    }}
                                    className="text-[var(--apple-accent)] font-bold hover:underline"
                                  >
                                    第 {ev.chapterSeq} 章 ➔
                                  </span>

                                  <div className="flex items-center gap-1">
                                    <span className={`px-1.5 py-0.2 rounded uppercase text-[9px] font-bold ${
                                      isClimax ? 'bg-rose-500 text-white' :
                                      isPayoff ? 'bg-emerald-500 text-white' :
                                      isPlant ? 'bg-amber-500 text-black' :
                                      'bg-black/40 text-zinc-300'
                                    }`}>
                                      {ev.type}
                                    </span>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteEvent(track.id, ev.id);
                                      }}
                                      className="opacity-0 group-hover/card:opacity-100 text-zinc-400 hover:text-rose-400 transition p-0.5"
                                      title="删除情节点"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <div className="text-xs font-bold text-[var(--apple-text-primary)] line-clamp-1">
                                  {ev.title}
                                </div>

                                <p className="text-[11px] text-[var(--apple-text-secondary)] line-clamp-2 leading-relaxed">
                                  {ev.summary}
                                </p>
                              </div>

                              {idx < track.events.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-[var(--apple-text-tertiary)] shrink-0 opacity-50" />
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 2: VOLUME & CHAPTER OUTLINE KANBAN BOARD              */}
        {/* ========================================================== */}
        {activeTab === 'kanban' && (
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                  <Kanban className="w-4 h-4 text-emerald-400" />
                  <span>分卷章纲泳道看板</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setFilterVolume('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      filterVolume === 'all' 
                        ? 'bg-[var(--apple-accent)] text-white' 
                        : 'bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
                    }`}
                  >
                    全部分卷
                  </button>
                  {volumes.map(([volNum]) => (
                    <button
                      key={volNum}
                      onClick={() => setFilterVolume(volNum)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        filterVolume === volNum 
                          ? 'bg-[var(--apple-accent)] text-white' 
                          : 'bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
                      }`}
                    >
                      第{volNum}卷
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--apple-text-tertiary)]" />
                <input
                  type="text"
                  placeholder="搜索章纲目标、冲突或场景..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-56 text-xs pl-8 pr-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>
            </div>

            {/* Kanban Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredChapters.map(chap => {
                const outline = chap.outline;
                return (
                  <div 
                    key={chap.id}
                    className="p-5 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-3.5 shadow-xs hover:border-[var(--apple-border-strong)] transition flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between border-b border-[var(--apple-separator)] pb-2.5">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-[var(--apple-accent)]">
                              第{chap.seq}章
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)]">
                              第{chap.vol}卷
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[var(--apple-text-primary)] mt-0.5">
                            {chap.title}
                          </h4>
                        </div>

                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md uppercase font-bold ${
                          chap.status === 'final' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          chap.status === 'reviewing' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          chap.status === 'drafted' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          chap.status === 'drafting' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                        }`}>
                          {chap.status}
                        </span>
                      </div>

                      {/* Goal & Conflict */}
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-1">
                          <span className="text-[10px] font-bold text-blue-400 block">主线推进目标</span>
                          <p className="text-[11px] text-[var(--apple-text-secondary)] leading-relaxed">
                            {outline.goal || '暂无目标规划'}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15 space-y-1">
                          <span className="text-[10px] font-bold text-rose-400 block">核心矛盾冲突</span>
                          <p className="text-[11px] text-[var(--apple-text-secondary)] leading-relaxed">
                            {outline.conflict || '暂无冲突规划'}
                          </p>
                        </div>
                      </div>

                      {/* Cast & Location Tags */}
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-[var(--apple-text-tertiary)] pt-1">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--apple-subtle)] text-zinc-300">
                          📍 {outline.location || '待定场景'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[var(--apple-subtle)] text-zinc-300">
                          ⏱️ {outline.storyTime || '故事时间'}
                        </span>
                        {outline.cast.map(c => (
                          <span key={c} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            👤 {c}
                          </span>
                        ))}
                      </div>

                      {/* Foreshadowing Tags */}
                      {outline.foreshadowPlant.length > 0 && (
                        <div className="text-[10px] text-amber-400 space-y-0.5 pt-1 border-t border-[var(--apple-separator)]">
                          <span className="font-bold">埋设伏笔:</span>
                          <ul className="list-disc list-inside text-[10px] text-zinc-400">
                            {outline.foreshadowPlant.map(p => <li key={p}>{p}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-2 border-t border-[var(--apple-separator)] flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleOpenEditOutline(chap)}
                        className="text-[11px] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>编辑章纲</span>
                      </button>

                      <button
                        onClick={() => onSelectChapter(chap.id)}
                        className="px-2.5 py-1 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <span>进入写作</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 3: FORESHADOWING & CAUSAL LINK MATRIX                */}
        {/* ========================================================== */}
        {activeTab === 'foreshadow' && (
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Header Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start justify-between">
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-amber-400" />
                  <span>剧情伏笔埋设与逻辑闭环追踪矩阵 (Foreshadowing & Causal Matrix)</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed max-w-2xl">
                  可视化追踪每一个伏笔承诺（Promise）从埋设章节到预定回收章节的因果链路，防止百万字长篇因果断链。
                </p>
              </div>

              <button
                onClick={handleOpenNewForeshadow}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>埋设新伏笔</span>
              </button>
            </div>

            {/* Foreshadow Cards List */}
            <div className="space-y-3.5">
              {customForeshadows.map(fs => {
                const isResolved = fs.status === 'resolved';
                return (
                  <div 
                    key={fs.id}
                    className={`p-4 rounded-2xl border transition shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isResolved 
                        ? 'bg-[var(--apple-surface)]/60 border-[var(--apple-border)] opacity-80' 
                        : 'bg-[var(--apple-surface)] border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => handleToggleForeshadowStatus(fs.id)}
                        className={`mt-0.5 p-1 rounded-lg border transition cursor-pointer ${
                          isResolved ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-black/30 border-white/20 text-transparent hover:text-white/40'
                        }`}
                        title={isResolved ? '标记为未回收' : '标记为已回收'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xs font-bold ${isResolved ? 'line-through text-[var(--apple-text-tertiary)]' : 'text-[var(--apple-text-primary)]'}`}>
                            {fs.title}
                          </h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                            主体: {fs.subject}
                          </span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-bold ${
                            fs.importance === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            fs.importance === 'major' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                          }`}>
                            {fs.importance}
                          </span>
                        </div>

                        <p className="text-[11px] text-[var(--apple-text-secondary)] leading-relaxed">
                          {fs.clues}
                        </p>
                      </div>
                    </div>

                    {/* Right Timeline Arc Node */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[10px] font-mono">
                        <span className="text-amber-400 font-bold">第 {fs.plantChapterSeq} 章 埋设</span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className={`${isResolved ? 'text-emerald-400' : 'text-blue-400'} font-bold`}>
                          第 {fs.payoffChapterSeq} 章 {isResolved ? '已回收' : '回收预设'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditForeshadow(fs)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition"
                          title="编辑伏笔"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteForeshadow(fs.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="删除伏笔"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 4: IN-STORY CHRONOLOGY & TIME LOGIC                   */}
        {/* ========================================================== */}
        {activeTab === 'chronology' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start justify-between">
              <div>
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>故事内绝对时间线 (In-Story Chronology)</span>
                </h4>
                <p className="text-[11px] text-indigo-200/80 mt-1 leading-relaxed">
                  按故事内部绝对时空节点严格校验，防止发生时间因果打脸逻辑漏洞。
                </p>
              </div>

              <span className="text-[10px] font-mono px-2.5 py-1 rounded-xl bg-black/40 text-indigo-300 border border-indigo-500/30">
                当前故事节点: {project.storyTimeCurrent}
              </span>
            </div>

            {/* Chapters Chronological Timeline List */}
            <div className="relative border-l-2 border-[var(--apple-separator)] ml-4 pl-6 space-y-6">
              {project.chapters.map(chap => (
                <div key={chap.id} className="relative group">
                  <span className="w-3 h-3 rounded-full bg-[var(--apple-accent)] border-2 border-[var(--apple-bg)] absolute -left-[31px] top-1.5 ring-2 ring-blue-500/30" />

                  <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] hover:border-[var(--apple-border-strong)] transition space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--apple-text-primary)]">
                          第 {chap.seq} 章 · {chap.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                          {chap.outline.storyTime}
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectChapter(chap.id)}
                        className="text-xs text-[var(--apple-accent)] hover:underline font-semibold cursor-pointer"
                      >
                        进入章节撰写 ➔
                      </button>
                    </div>

                    <p className="text-xs text-[var(--apple-text-secondary)] leading-relaxed">
                      {chap.summary || '暂无定稿摘要'}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-[var(--apple-text-tertiary)] pt-1 border-t border-[var(--apple-separator)]">
                      <span>地点: {chap.outline.location}</span>
                      <span>·</span>
                      <span>出场: {chap.outline.cast.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW 5: CHARACTER NETWORK & RELATIONS                     */}
        {/* ========================================================== */}
        {activeTab === 'relations' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {project.characters.map(char => (
                <div key={char.id} className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${char.avatarColor} text-white flex items-center justify-center text-sm font-bold shadow-sm`}>
                      {char.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-[var(--apple-text-primary)]">{char.name}</h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--apple-subtle)] text-[var(--apple-accent)] font-semibold">
                          {char.role}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-amber-500">{char.realm}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--apple-text-secondary)] leading-relaxed">
                    <p><b className="text-[var(--apple-text-primary)]">性格防线:</b> {char.temperament}</p>
                    <p><b className="text-[var(--apple-text-primary)]">主修功法:</b> {char.mainTechnique}</p>
                    <p className="text-purple-400"><b className="text-[var(--apple-text-primary)]">隐藏底牌:</b> {char.secrets}</p>
                  </div>

                  <div className="pt-2 border-t border-[var(--apple-separator)] text-[10px] text-[var(--apple-text-tertiary)]">
                    当前状态: {char.state}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ============================================================ */}
      {/* MODAL 1: ADD EVENT TO TRACK                                 */}
      {/* ============================================================ */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--apple-surface)] border border-[var(--apple-border-strong)] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--apple-separator)] pb-3">
              <h3 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--apple-accent)]" />
                <span>插入新情节点 (Plot Point)</span>
              </h3>
              <button 
                onClick={() => setIsAddEventModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">情节点标题</label>
                <input
                  type="text"
                  placeholder="如：泊位接头暗杀危机"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">发生章节序号</label>
                  <input
                    type="number"
                    min="1"
                    value={newEventChapterSeq}
                    onChange={e => setNewEventChapterSeq(parseInt(e.target.value) || 1)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">情节点性质</label>
                  <select
                    value={newEventType}
                    onChange={e => setNewEventType(e.target.value as any)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  >
                    <option value="plant">伏笔埋设 (Plant)</option>
                    <option value="turning_point">剧情转折 (Turning Point)</option>
                    <option value="climax">高潮爆发 (Climax)</option>
                    <option value="payoff">伏笔回收 (Payoff)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">情节简述与因果推演</label>
                <textarea
                  rows={3}
                  placeholder="简要记录本情节点对主线或暗线的推动作用..."
                  value={newEventSummary}
                  onChange={e => setNewEventSummary(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] p-3 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--apple-separator)]">
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-1.5 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-xs font-semibold"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: ADD NEW TRACK                                       */}
      {/* ============================================================ */}
      {isAddTrackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--apple-surface)] border border-[var(--apple-border-strong)] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--apple-separator)] pb-3">
              <h3 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                <span>新建故事线轨道 (Add Storyline Track)</span>
              </h3>
              <button 
                onClick={() => setIsAddTrackModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">轨道名称</label>
                <input
                  type="text"
                  placeholder="如：暗线 · 序列怀表与太古神明因果"
                  value={newTrackName}
                  onChange={e => setNewTrackName(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">轨道类型</label>
                  <select
                    value={newTrackType}
                    onChange={e => setNewTrackType(e.target.value as any)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  >
                    <option value="main">主线轨 (Main Arc)</option>
                    <option value="mystery">暗线/悬疑轨 (Mystery Track)</option>
                    <option value="faction">势力/世界大事件轨 (Faction Track)</option>
                    <option value="romance">情感/人际羁绊轨 (Romance Track)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">轨道主题色</label>
                  <input
                    type="color"
                    value={newTrackColor}
                    onChange={e => setNewTrackColor(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">轨道叙事宗旨与定位</label>
                <textarea
                  rows={2}
                  placeholder="说明该故事线的最终推进目标与悬念设定..."
                  value={newTrackDesc}
                  onChange={e => setNewTrackDesc(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] p-3 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--apple-separator)]">
              <button
                onClick={() => setIsAddTrackModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleCreateTrack}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
              >
                创建轨道
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: ADD/EDIT FORESHADOWING LINK                         */}
      {/* ============================================================ */}
      {isForeshadowModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--apple-surface)] border border-[var(--apple-border-strong)] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--apple-separator)] pb-3">
              <h3 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                <Link2 className="w-4 h-4 text-amber-400" />
                <span>{editingForeshadow ? '编辑伏笔因果承诺' : '埋设新剧情伏笔 (Foreshadow Promise)'}</span>
              </h3>
              <button 
                onClick={() => setIsForeshadowModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">伏笔因果名称</label>
                <input
                  type="text"
                  placeholder="如：逆熵怀表内部十二重神性齿轮倒转"
                  value={fsTitle}
                  onChange={e => setFsTitle(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">主体 / 关键物</label>
                  <input
                    type="text"
                    placeholder="如：逆熵怀表"
                    value={fsSubject}
                    onChange={e => setFsSubject(e.target.value)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">埋设章节序号</label>
                  <input
                    type="number"
                    min="1"
                    value={fsPlantChapter}
                    onChange={e => setFsPlantChapter(parseInt(e.target.value) || 1)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">预定回收章节</label>
                  <input
                    type="number"
                    min="1"
                    value={fsPayoffChapter}
                    onChange={e => setFsPayoffChapter(parseInt(e.target.value) || 1)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">重要级别</label>
                  <select
                    value={fsImportance}
                    onChange={e => setFsImportance(e.target.value as any)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  >
                    <option value="critical">全书核心伏笔 (Critical)</option>
                    <option value="major">主线分卷伏笔 (Major)</option>
                    <option value="minor">细微情调支线 (Minor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">归属故事线</label>
                  <select
                    value={fsTrackId}
                    onChange={e => setFsTrackId(e.target.value)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  >
                    {project.storylineTracks.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">伏笔线索细节与逻辑闭环说明</label>
                <textarea
                  rows={3}
                  placeholder="详细记录正文如何埋下暗示，以及后续如何回收与揭露真相..."
                  value={fsClues}
                  onChange={e => setFsClues(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] p-3 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--apple-separator)]">
              <button
                onClick={() => setIsForeshadowModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleSaveForeshadow}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs"
              >
                保存伏笔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: EDIT STRUCTURED CHAPTER OUTLINE                     */}
      {/* ============================================================ */}
      {isEditOutlineModalOpen && activeEditingChapter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--apple-surface)] border border-[var(--apple-border-strong)] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--apple-separator)] pb-3">
              <h3 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>编辑结构化章纲 · 第{activeEditingChapter.seq}章 《{activeEditingChapter.title}》</span>
              </h3>
              <button 
                onClick={() => setIsEditOutlineModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-blue-400 mb-1">主线推进目标 (Goal)</label>
                <input
                  type="text"
                  value={outlineGoal}
                  onChange={e => setOutlineGoal(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-rose-400 mb-1">核心矛盾冲突 (Conflict)</label>
                <input
                  type="text"
                  value={outlineConflict}
                  onChange={e => setOutlineConflict(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">发生场景地点</label>
                  <input
                    type="text"
                    value={outlineLocation}
                    onChange={e => setOutlineLocation(e.target.value)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">故事内时间节点</label>
                  <input
                    type="text"
                    value={outlineStoryTime}
                    onChange={e => setOutlineStoryTime(e.target.value)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">出场人物 (逗号分隔)</label>
                <input
                  type="text"
                  value={outlineCast}
                  onChange={e => setOutlineCast(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-400 mb-1">结尾断章黄金钩子 (Ending Hook)</label>
                <input
                  type="text"
                  value={outlineEndingHook}
                  onChange={e => setOutlineEndingHook(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--apple-separator)]">
              <button
                onClick={() => setIsEditOutlineModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleSaveOutline}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                保存章纲
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
