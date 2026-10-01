import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Layers, 
  User, 
  FileText, 
  Scale, 
  Sparkles, 
  Check, 
  Save, 
  Trash2, 
  X, 
  Zap, 
  Plus, 
  History, 
  Eye, 
  AlertTriangle, 
  Bookmark,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Minimize2,
  Type,
  AlignLeft,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Replace,
  Highlighter,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Indent,
  Wand2,
  Swords,
  Compass,
  Lightbulb,
  Tag,
  Dna,
  Bot,
  Copy,
  Send,
  FolderOpen,
  Settings,
  ChevronDown,
  GitBranch,
  Split,
  CornerUpLeft,
  FileCheck,
  CheckCircle,
  GitCommit,
  GitCompare,
  ArrowLeftRight,
  Activity,
  Feather,
  BookMarked,
  ListTree,
  Folder,
  Download,
  AlertCircle
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

interface Novel {
  id: string;
  title: string;
  genre: string;
  pov: string;
  target_words: number;
  style_guide: string;
  logline: string;
  chapter_count?: number;
  current_words?: number;
}

interface Chapter {
  id: string;
  seq: number;
  title: string;
  status: 'planned' | 'drafting' | 'drafted' | 'reviewing' | 'final';
  outline_id?: string;
  current_version_id?: string;
  summary?: string;
  word_count: number;
  current_content?: string;
  outline_body?: string;
  hookTag?: string;
}

export interface ChapterVersion {
  id: string;
  versionNumber: number;
  label: string;
  createdAt: string;
  wordCount: number;
  authorType: 'human' | 'ai';
  summary: string;
  content: string;
}

interface LoreEntry {
  id: string;
  type: string;
  name: string;
  aliases: string;
  keywords: string;
  content: string;
  always_on: number;
  priority: number;
}

interface Character {
  id: string;
  name: string;
  aliases: string;
  role: string;
  profile: string;
  voice: string;
}

export const NovelStudio: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  // Main Novels State
  const [novels, setNovels] = useState<Novel[]>([]);
  const [currentNovel, setCurrentNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: 'ch-35', seq: 35, title: '第35章：寒潭炼骨三千淬', status: 'final', word_count: 3200, hookTag: '起跳点' },
    { id: 'ch-36', seq: 36, title: '第36章：逆斩执事夺剑令', status: 'drafted', word_count: 3500, hookTag: '情绪突破' },
    { id: 'ch-37', seq: 37, title: '第37章：天渊碎裂，炉鼎吞日', status: 'drafting', word_count: 3420, hookTag: '大高潮爆点' },
    { id: 'ch-38', seq: 38, title: '第38章：宗门长生碑染血', status: 'planned', word_count: 0, hookTag: '伏笔留钩' }
  ]);
  const [activeChapterId, setActiveChapterId] = useState<string>('ch-37');

  // Sidebar Sub Tab
  const [sidebarTab, setSidebarTab] = useState<'outline' | 'bible'>('outline');
  const [showInspector, setShowInspector] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Editor Typography State
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [fontSize, setFontSize] = useState(17);
  const [editorContent, setEditorContent] = useState(`天渊底部的黑曜寒风如万柄冰刃刮过骨髓。沈妄半跪在枯败的龙骸之下，五指深陷于冻土，掌心渗出的鲜血尚未滴落，便被森冷的罡风冻结成暗红的冰晶。

苍穹上方，悬浮着天圣宗的三百巡天战船。三位身着日月道袍的执法长老居高临下，俯瞰着这只穷途末路的蝼蚁。首座长老抚须冷笑：“沈妄，你不过一介凡骨，也妄图盗窃我宗万载气运？”

沈妄没有说话，只是缓缓抬起头。他的双瞳已经蜕变为幽邃的青铜色，体内那座沉寂了三千个日夜的残破九域烘炉，正在骨骼摩擦的刺耳声中缓缓转动。仿佛有万千星辰在血肉深处崩塌重组。

“老狗，”沈妄的声音极其沙哑，却像九幽冰渊下敲响的丧钟，“你可知这天渊三万丈，埋的根本不是什么古龙，而是你们历代老祖用来续命的……人皮烘炉？”

话音未落，整座天渊绝壁轰然开裂！千万道青铜古纹自沈妄脊骨爆裂而出，倒卷苍穹，将天幕上那轮高悬的灵日硬生生拽入深渊！`);

  // AI Companion Prompt
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Cliché Diagnostic Modal
  const [showClicheModal, setShowClicheModal] = useState(false);

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[2];

  // API Initialization
  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const res = await fetch('/api/novels');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setNovels(data);
        setCurrentNovel(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // AI Continue Writing Flow
  const handleAiContinueWriting = () => {
    if (isAiGenerating) return;
    setIsAiGenerating(true);
    showToast('✦ 正在结合先验设定集推演续写，消解套句中...');

    setTimeout(() => {
      const addition = `\n\n战船上的护道金钟在这一刻寸寸炸裂。首座长老脸色由狂妄转为灰败，瞳孔剧烈收缩成针芒：“九域烘炉……这尊凶器当年明明已经被道祖斩断七魄，怎么可能在你这凡人体内借体重生？！”`;
      setEditorContent(prev => prev + addition);
      setIsAiGenerating(false);
      showToast('续写完成！新增 84 字 · 人类纯度 95%');
    }, 900);
  };

  // Quick Action
  const handleQuickAction = (actionType: string) => {
    if (actionType === 'remove_cliches') {
      showToast('已完成全文陈词滥调清洗，人类纯度提升至 99%');
    } else if (actionType === 'expand_sensory') {
      showToast('正在渲染感官细节（环境五感与微表情）...');
    } else if (actionType === 'plant_hook') {
      showToast('已在章末埋下核心伏笔悬念（长生祖碑秘密）');
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#090a0e] text-slate-100 font-sans select-none relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#181920]/95 border border-white/20 text-white text-xs font-semibold shadow-2xl flex items-center space-x-2 backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DYNAMIC ISLAND TOP STATUS PILL */}
      <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
        <div className="px-4 py-1.5 rounded-full bg-black/90 backdrop-blur-2xl text-white text-xs font-mono shadow-2xl flex items-center space-x-3.5 border border-white/15">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500" />
          </span>
          <div className="flex items-center space-x-1.5 font-sans">
            <span className="font-bold text-white/90">{activeChapter.title}</span>
            <span className="text-[10px] text-zinc-400">· 叙事张力 88% (高潮爆点)</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono">
            <span>{editorContent.length.toLocaleString()} 字</span>
            <span>·</span>
            <span className="text-emerald-400 font-bold">人类纯度 94%</span>
          </div>
        </div>
      </div>

      {/* MAIN STUDIO WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 1. LEFT SIDEBAR: OUTLINE & WORLD BIBLE */}
        {!isZenMode && (
          <aside className="w-72 shrink-0 flex flex-col bg-[#121318]/90 border-r border-white/10 backdrop-blur-2xl z-30 select-none">
            {/* Header & Window controls */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <span className="text-xs font-bold text-white font-mono">Pages Pro Studio</span>
            </div>

            {/* Sidebar Switcher */}
            <div className="p-3 border-b border-white/10 shrink-0 space-y-2">
              <div className="grid grid-cols-2 p-1 bg-black/40 rounded-xl border border-white/10 text-xs font-bold">
                <button
                  onClick={() => setSidebarTab('outline')}
                  className={`py-1 rounded-lg flex items-center justify-center space-x-1 transition ${
                    sidebarTab === 'outline' ? 'bg-white/20 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ListTree className="w-3.5 h-3.5" />
                  <span>分卷大纲</span>
                </button>
                <button
                  onClick={() => setSidebarTab('bible')}
                  className={`py-1 rounded-lg flex items-center justify-center space-x-1 transition ${
                    sidebarTab === 'bible' ? 'bg-white/20 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>设定与 RAG</span>
                </button>
              </div>
            </div>

            {/* Outline Tab */}
            {sidebarTab === 'outline' && (
              <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-purple-400">
                    <span>东方玄幻 · 逆袭主干</span>
                    <span>12.8 万字</span>
                  </div>
                  <h2 className="text-sm font-bold text-white">{currentNovel ? currentNovel.title : '《太上渊虚录》'}</h2>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">宗门被构陷破灭，主角携残破九域烘炉跌落禁地天渊...</p>
                </div>

                <div className="space-y-1">
                  <div className="px-2 py-1 flex justify-between font-bold text-zinc-400">
                    <span className="flex items-center space-x-1">
                      <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                      <span>第一卷：困龙入渊与凡骨涅槃</span>
                    </span>
                  </div>

                  <div className="space-y-1 pl-2 border-l border-white/10 ml-2">
                    {chapters.map(ch => (
                      <div
                        key={ch.id}
                        onClick={() => {
                          setActiveChapterId(ch.id);
                          showToast(`已加载【${ch.title}】`);
                        }}
                        className={`p-2 rounded-xl cursor-pointer flex items-center justify-between transition ${
                          ch.id === activeChapterId
                            ? 'bg-white/15 border border-white/10 text-white font-bold shadow-xs'
                            : 'hover:bg-white/5 text-zinc-400'
                        }`}
                      >
                        <span className="truncate text-[11.5px]">{ch.title}</span>
                        {ch.hookTag && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                            {ch.hookTag}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bible Tab */}
            {sidebarTab === 'bible' && (
              <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
                <div className="px-2 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">核心角色卡 (Character Bible)</div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>沈妄 (主角)</span>
                      <span className="text-[9px] font-mono text-purple-400">沉鸷 / 狠绝</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">天生凡骨无法聚气，背负满门血海，执掌九域烘炉。</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>姜晚秋 (剑宗圣女)</span>
                      <span className="text-[9px] font-mono text-blue-400">表面敌对 / 暗线</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">无情剑道传承人，体内封印七魄残缺神性。</p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* 2. CENTER: PRO PAGES CANVAS EDITOR */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#090a0e] relative overflow-hidden select-none">
          {/* Editor Header Toolbar */}
          <header className="h-14 px-4 bg-[#121318]/80 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Feather className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xs font-bold text-white">{activeChapter.title}</h1>
                  <p className="text-[10px] text-zinc-400 font-mono">正文 {editorContent.length.toLocaleString()} 字 · 预估阅读 7.5 分钟</p>
                </div>
              </div>
            </div>

            {/* Typography Controls */}
            <div className="hidden md:flex items-center bg-black/40 p-1 rounded-2xl border border-white/10 text-xs font-medium space-x-1">
              <button
                onClick={() => setFontFamily('serif')}
                className={`px-2.5 py-1 rounded-xl transition ${fontFamily === 'serif' ? 'bg-white/20 text-white font-serif' : 'text-zinc-400 hover:text-white'}`}
              >
                宋体 / New York
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                className={`px-2.5 py-1 rounded-xl transition ${fontFamily === 'sans' ? 'bg-white/20 text-white font-sans' : 'text-zinc-400 hover:text-white'}`}
              >
                黑体 / SF Pro
              </button>
              <div className="h-3 w-px bg-white/20 mx-1" />
              <button onClick={() => setFontSize(s => Math.max(14, s - 1))} className="p-1 text-zinc-400 hover:text-white">-</button>
              <span className="font-mono text-[11px] text-zinc-300 px-1">{fontSize}px</span>
              <button onClick={() => setFontSize(s => Math.min(24, s + 1))} className="p-1 text-zinc-400 hover:text-white">+</button>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => setIsZenMode(z => !z)}
                className={`px-3 py-1.5 rounded-xl border transition ${
                  isZenMode ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold' : 'bg-white/5 border-white/10 text-white'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{isZenMode ? '退出专注' : '专注禅模式'}</span>
              </button>

              <button
                onClick={() => setShowInspector(prev => !prev)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold flex items-center space-x-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                <span>爽点与去AI味</span>
              </button>
            </div>
          </header>

          {/* Paper Canvas */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-[#090a0e]">
            <article
              className={`max-w-3xl w-full min-h-[820px] bg-[#13141a] border border-white/10 rounded-3xl p-8 md:p-14 shadow-2xl space-y-6 ${
                fontFamily === 'serif' ? 'font-serif' : 'font-sans'
              }`}
            >
              <div className="border-b border-white/10 pb-4 space-y-2 font-sans">
                <div className="flex items-center space-x-2 text-[11px] font-mono text-purple-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ACT I · CLIMAX · 天渊大决裂</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">{activeChapter.title}</h1>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">🔥 爽点类型：压抑反噬/全场震怖</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">🗡 登场角色：沈妄、姜晚秋</span>
                </div>
              </div>

              {/* Text Area */}
              <textarea
                value={editorContent}
                onChange={e => setEditorContent(e.target.value)}
                style={{ fontSize: `${fontSize}px` }}
                className="w-full h-[600px] bg-transparent text-zinc-200 outline-none leading-relaxed resize-none border-none focus:ring-0 font-inherit"
              />
            </article>
          </div>

          {/* Bottom Floating AI Intelligence Companion Dock */}
          <div className="px-4 pb-4 w-full flex justify-center z-20">
            <div className="p-0.5 rounded-3xl bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 shadow-2xl max-w-3xl w-full">
              <div className="p-3 bg-[#121318] rounded-[22px] flex flex-col space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-zinc-400">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="font-bold text-white">Apple Intelligence 灵感伴写</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">去AI味纯度 94%</span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <input
                    type="text"
                    value={aiPromptInput}
                    onChange={e => setAiPromptInput(e.target.value)}
                    placeholder="下达续写或推演指令..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none font-sans"
                  />
                  <button
                    onClick={handleAiContinueWriting}
                    disabled={isAiGenerating}
                    className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition shadow-md shrink-0"
                  >
                    <span>{isAiGenerating ? '推演中...' : '智能续写'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <button onClick={() => handleQuickAction('expand_sensory')} className="px-2 py-0.5 rounded bg-white/5 text-zinc-300">通感五感渲染</button>
                  <button onClick={() => handleQuickAction('remove_cliches')} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">消灭行文套话</button>
                  <button onClick={() => handleQuickAction('plant_hook')} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">章末留钩断章</button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 3. RIGHT INSPECTOR PANEL */}
        {showInspector && !isZenMode && (
          <aside className="w-80 shrink-0 bg-[#121318]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col p-4 space-y-5 text-xs overflow-y-auto z-30 select-none">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 font-bold text-white">
                <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                <span>爽点与文风引擎控制台</span>
              </div>
              <button onClick={() => setShowInspector(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tension Score */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-white flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  <span>剧情张力指数</span>
                </span>
                <span className="text-rose-400 font-mono">88% (高潮爆点)</span>
              </div>
              <p className="text-[10px] text-zinc-400">目前处于第 37 章高潮爆发区，多巴胺兑现度强劲。</p>
            </div>

            {/* Human Touch / De-AI Score */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3 font-mono text-[10px]">
              <div className="flex justify-between text-white font-bold text-xs font-sans">
                <span>人类质感 / 去 AI 味</span>
                <span className="text-emerald-400 font-mono">94 分</span>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>长短句交错比率 (Burstiness)</span>
                  <span className="text-white font-bold">89%</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '89%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>感官通感维度 (视/听/嗅/触)</span>
                  <span className="text-white font-bold">92%</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onSaveToMaterial) {
                  onSaveToMaterial(`小说手稿: ${activeChapter.title}`, editorContent);
                }
                showToast('已存入素材知识库！');
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center justify-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>收录稿件至素材库</span>
            </button>
          </aside>
        )}
      </div>
    </div>
  );
};
