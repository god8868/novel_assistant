import React, { useState, useEffect, useRef } from 'react';
import { 
  Clapperboard, 
  Columns2, 
  ScrollText, 
  Film, 
  Share, 
  Sparkles, 
  Wand2, 
  ArrowDownToDot, 
  Plus, 
  Play, 
  Pause, 
  SkipBack, 
  StepForward, 
  Sliders, 
  Mic, 
  Sparkle, 
  RefreshCw, 
  MousePointer, 
  Scissors, 
  Zap, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  ArrowUpCircle, 
  Download, 
  X, 
  CheckCircle2, 
  Layers, 
  Video, 
  Volume1, 
  Volume2, 
  Music2, 
  Type, 
  Scan, 
  Sun, 
  Moon, 
  LayoutGrid, 
  BookmarkPlus,
  Copy,
  ChevronRight,
  Maximize2
} from 'lucide-react';

export type WorkspaceMode = 'hybrid' | 'script' | 'editor';
export type AspectRatio = '9:16' | '16:9';
export type TimelineTool = 'pointer' | 'blade';

export interface ShotItem {
  id: string;
  shotNum: string;
  type: string;
  angle: string;
  time: string;
  durationSec: number;
  bgImage: string;
  hookTag: string;
  character: string;
  dialogue: string;
  prompt: string;
}

export interface CharacterCard {
  id: string;
  name: string;
  roleBadge: string;
  color: string;
}

const DRAMA_PRESETS = {
  urban_revenge: {
    title: "《天降神豪之归来》Ep.01",
    subtitle: "9:16 短剧标品 · 战神逆袭归来",
    shots: [
      {
        id: 'shot-1',
        shotNum: '01',
        type: '特写 (Close-Up)',
        angle: '低机位微仰 · 压迫感',
        time: '00:00 - 00:04',
        durationSec: 4.0,
        bgImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        hookTag: '黄金3秒爆点',
        character: '赵烈风',
        dialogue: '“就凭你一个送外卖的，也配踏入苏氏庄园？！”',
        prompt: '暴雨夜，豪门反派少爷居高临下蔑视特写，雨水顺发梢流下，雨雾水汽弥漫，冷色霓虹微光，4K电影质感。'
      },
      {
        id: 'shot-2',
        shotNum: '02',
        type: '全景 (Wide Shot)',
        angle: '俯瞰横摇 · 阵仗宏大',
        time: '00:04 - 00:10',
        durationSec: 6.0,
        bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        hookTag: '反差揭示',
        character: '叶天明',
        dialogue: '（默然冷笑，掏出一枚布满龙纹的漆黑玄铁令）',
        prompt: '庄园大门前，数十辆黑色迈巴赫齐刷刷亮起远光灯。男人只身一人在雨中挺立，神情冷峻泰然，身后是漫天雷暴。'
      },
      {
        id: 'shot-3',
        shotNum: '03',
        type: '中景 (Medium Shot)',
        angle: '急速推镜 · 情绪高潮',
        time: '00:10 - 00:16',
        durationSec: 6.0,
        bgImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        hookTag: '爽点爆发',
        character: '苏云汐',
        dialogue: '“住手！谁敢对叶先生不敬，就是与我整个苏氏财团为敌！”',
        prompt: '豪宅大门轰然开启，财阀千金一身高定晚礼服奔出，满脸焦急震撼，众保镖纷纷下跪行礼。'
      },
      {
        id: 'shot-4',
        shotNum: '04',
        type: '特写 (Macro Hook)',
        angle: '旋转升镜 · 悬念留白',
        time: '00:16 - 00:22',
        durationSec: 6.0,
        bgImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
        hookTag: '下集大钩子',
        character: '叶天明',
        dialogue: '“三年之期已到，当年的账，今天该连本带利清算。”',
        prompt: '黑金戒指在雷光下泛起刺目光晕，主角眼神睥睨全场，黑色风衣随狂风翻涌，转入悬念黑屏。'
      }
    ],
    characters: [
      { id: 'c1', name: '叶天明', roleBadge: '隐世龙皇', color: 'bg-blue-500' },
      { id: 'c2', name: '苏云汐', roleBadge: '首富千金', color: 'bg-pink-500' },
      { id: 'c3', name: '赵烈风', roleBadge: '反派霸少', color: 'bg-amber-500' }
    ]
  },
  scifi_rebirth: {
    title: "《重生之千亿智械纪元》Ep.01",
    subtitle: "16:9 赛博科幻 · 智械崛起",
    shots: [
      {
        id: 's-scifi-1',
        shotNum: '01',
        type: '全景 (Wide Shot)',
        angle: '赛博全景 · 全息霓虹',
        time: '00:00 - 00:05',
        durationSec: 5.0,
        bgImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        hookTag: '科幻视觉冲击',
        character: '李岚中校',
        dialogue: '“第九百次核对时间轴...智能核心已产生奇点漂移。”',
        prompt: '新东京 2099 年深空底层都市，雨夜全息广告投射在云层中，飞空艇低空穿梭，冷蓝霓虹调色。'
      }
    ],
    characters: [
      { id: 'c-scifi-1', name: '李岚', roleBadge: '深空指挥官', color: 'bg-purple-500' },
      { id: 'c-scifi-2', name: '零号AI', roleBadge: '奇点母体', color: 'bg-emerald-500' }
    ]
  },
  xianxia: {
    title: "《九渊破妄录》Ep.01",
    subtitle: "9:16 仙侠短剧 · 鉴魂破局",
    shots: [
      {
        id: 's-xianxia-1',
        shotNum: '01',
        type: '特写 (Close-Up)',
        angle: '瞳术微距 · 符文亮起',
        time: '00:00 - 00:05',
        durationSec: 5.0,
        bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        hookTag: '破妄真瞳',
        character: '沈玄烛',
        dialogue: '“三息...可窥得这大阵破绽在右肋三寸。”',
        prompt: '少年剑客斗笠下双眸泛起暗金符纹，冰裂纹理从指尖蔓延，雨滴悬停在半空，极高动态范围。'
      }
    ],
    characters: [
      { id: 'c-xianxia-1', name: '沈玄烛', roleBadge: '破妄剑客', color: 'bg-indigo-500' },
      { id: 'c-xianxia-2', name: '柳清霜', roleBadge: '万宝掌柜', color: 'bg-teal-500' }
    ]
  }
};

export const VideoView: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  const [mode, setMode] = useState<WorkspaceMode>('hybrid');
  const [aspect, setAspect] = useState<AspectRatio>('9:16');
  const [selectedDramaKey, setSelectedDramaKey] = useState<'urban_revenge' | 'scifi_rebirth' | 'xianxia'>('urban_revenge');

  const [shots, setShots] = useState<ShotItem[]>(DRAMA_PRESETS.urban_revenge.shots);
  const [characters, setCharacters] = useState<CharacterCard[]>(DRAMA_PRESETS.urban_revenge.characters);
  const [activeShotIndex, setActiveShotIndex] = useState(0);

  // Playback & Inspector State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(3.14);
  const [safeZoneVisible, setSafeZoneVisible] = useState(false);
  const [activeCameraMotion, setActiveCameraMotion] = useState('推镜 (Dolly In)');
  const [motionIntensity, setMotionIntensity] = useState('7.2');
  const [activeTool, setActiveTool] = useState<TimelineTool>('pointer');
  const [timelineZoom, setTimelineZoom] = useState(1.0);

  // Export Modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activeShot = shots[activeShotIndex] || shots[0];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Switch Preset Drama
  const handleSelectPreset = (key: 'urban_revenge' | 'scifi_rebirth' | 'xianxia') => {
    setSelectedDramaKey(key);
    const data = DRAMA_PRESETS[key];
    setShots(data.shots);
    setCharacters(data.characters);
    setActiveShotIndex(0);
    showToast(`已载入《${data.title}》爆款镜头与人设骨架`);
  };

  // Select Shot
  const handleSelectShot = (idx: number) => {
    setActiveShotIndex(idx);
    const targetShot = shots[idx];
    if (targetShot) {
      // Calculate accumulated start time
      let startSec = 0;
      for (let i = 0; i < idx; i++) startSec += shots[i].durationSec;
      setCurrentTime(startSec);
    }
  };

  // AI Expand Next Shot
  const handleAiExpandShot = () => {
    const newNum = String(shots.length + 1).padStart(2, '0');
    const newShot: ShotItem = {
      id: `shot-${Date.now()}`,
      shotNum: newNum,
      type: '中特写 (MCU)',
      angle: '水平对视 · 情绪反转',
      time: `00:${(shots.length * 6).toString().padStart(2, '0')} - 00:${((shots.length + 1) * 6).toString().padStart(2, '0')}`,
      durationSec: 6.0,
      bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      hookTag: '反差绝杀',
      character: '叶天明',
      dialogue: '“让你们苏家老爷子，亲自跪着来见我。”',
      prompt: '黑色迈巴赫车门开启，男人侧脸冷峻冰凝，黑金龙令反光，周遭保镖惊恐退散。'
    };
    const updated = [...shots, newShot];
    setShots(updated);
    setActiveShotIndex(updated.length - 1);
    showToast(`AI 已自动扩展生成第 #${newNum} 爽点分镜！`);
  };

  // Add Character Pill
  const handleAddCharacter = () => {
    const newChar: CharacterCard = {
      id: `char-${Date.now()}`,
      name: '苏远山',
      roleBadge: '豪门老太爷',
      color: 'bg-purple-500'
    };
    setCharacters([...characters, newChar]);
    showToast('已增加新关键人设卡《苏远山》');
  };

  // Export Simulation
  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(10);

    let p = 10;
    const interval = setInterval(() => {
      p += 22;
      if (p >= 100) {
        clearInterval(interval);
        setExportProgress(100);
        setTimeout(() => {
          setIsExporting(false);
          setShowExportModal(false);
          showToast('🎉 导出成功！4K ProRes 60fps 母带已存入本地下载');
          if (onSaveToMaterial) {
            onSaveToMaterial(`短剧母带: ${DRAMA_PRESETS[selectedDramaKey].title}`, `工程导出格式: 9:16 短剧标品 (H.265/ProRes) · 包含 ${shots.length} 个镜头高光分镜`);
          }
        }, 500);
      } else {
        setExportProgress(p);
      }
    }, 250);
  };

  const formattedTimecode = () => {
    const m = Math.floor(currentTime / 60);
    const s = Math.floor(currentTime % 60);
    const f = Math.floor((currentTime % 1) * 30);
    return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#0c0e14] text-slate-100 font-sans select-none relative">
      {/* Dynamic Toast */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#18181b]/95 border border-white/20 text-white text-xs font-semibold shadow-2xl flex items-center space-x-2 backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. TOP MASTER TOOLBAR (CinePro Studio 3.0) */}
      {/* ============================================================ */}
      <header className="h-12 px-4 z-30 flex items-center justify-between bg-[#151821]/90 backdrop-blur-2xl border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 p-0.5 flex items-center justify-center shadow-md">
            <Clapperboard className="w-4 h-4 text-white" />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-white tracking-tight font-mono">CinePro 3.0</span>
            <span className="text-[10px] text-white/30">/</span>
            <span className="text-xs font-semibold text-white/90 truncate max-w-[200px]">
              {DRAMA_PRESETS[selectedDramaKey].title}
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
              {DRAMA_PRESETS[selectedDramaKey].subtitle}
            </span>
          </div>
        </div>

        {/* Center: Segmented Workspace Switcher */}
        <div className="flex items-center bg-black/50 p-0.5 rounded-xl border border-white/10 shadow-inner">
          <button
            onClick={() => setMode('hybrid')}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              mode === 'hybrid' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5 text-blue-400" />
            <span>全景工作台</span>
          </button>
          <button
            onClick={() => setMode('script')}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              mode === 'script' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5 text-purple-400" />
            <span>AI 短剧剧本工坊</span>
          </button>
          <button
            onClick={() => setMode('editor')}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              mode === 'editor' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-orange-400" />
            <span>AI 专业时间线剪辑</span>
          </button>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-white/70">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Neural Render v4 (Sora/Gen-3)</span>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
          >
            <Share className="w-3.5 h-3.5" />
            <span>一键渲染导出</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN WORKSPACE AREA */}
      {/* ============================================================ */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL: AI 短剧剧本工坊 */}
        {(mode === 'hybrid' || mode === 'script') && (
          <aside
            className={`${
              mode === 'script' ? 'w-full' : 'w-[420px] lg:w-[460px]'
            } shrink-0 border-r border-white/10 flex flex-col bg-[#151821]/95 backdrop-blur-2xl transition-all duration-300 select-none`}
          >
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white">AI 爽剧剧本与分镜工坊</h2>
                  <div className="text-[10px] text-white/40">冲突曲线强化 · 黄金3秒钩子定位</div>
                </div>
              </div>

              {/* Preset Drama Selector */}
              <select
                value={selectedDramaKey}
                onChange={e => handleSelectPreset(e.target.value as any)}
                className="text-xs bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-white focus:outline-none cursor-pointer"
              >
                <option value="urban_revenge">战神逆袭归来 (都市爆款)</option>
                <option value="scifi_rebirth">重生之千亿智械 (科幻悬疑)</option>
                <option value="xianxia">九渊破妄录 (仙侠博弈)</option>
              </select>
            </div>

            {/* Action Bar */}
            <div className="px-3 py-2 bg-black/30 border-b border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleAiExpandShot}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 border border-purple-500/40 font-bold transition flex items-center space-x-1"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>AI 生成后续镜头</span>
                </button>
                <button
                  onClick={() => showToast('已成功批量排入剪辑时间线')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 font-bold transition flex items-center space-x-1"
                >
                  <ArrowDownToDot className="w-3 h-3 text-emerald-400" />
                  <span>批量排入轨道</span>
                </button>
              </div>
              <span className="text-[10px] font-mono text-white/40">已编排 {shots.length} 个分镜镜头</span>
            </div>

            {/* Character Bible & Tension Rhythm Dashboard */}
            <div className="p-3 border-b border-white/10 bg-black/40 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-white/60">
                <span>核心人设卡 (Character Bible)</span>
                <button onClick={handleAddCharacter} className="text-[10px] text-blue-400 hover:underline flex items-center space-x-0.5">
                  <Plus className="w-3 h-3" />
                  <span>增添人物</span>
                </button>
              </div>

              <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                {characters.map(c => (
                  <div key={c.id} className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 shrink-0 text-xs">
                    <span className={`w-2 h-2 rounded-full ${c.color}`} />
                    <span className="font-bold text-white">{c.name}</span>
                    <span className="text-[9px] text-white/40">({c.roleBadge})</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[10px] text-white/50">
                  <span>短剧节奏律动:</span>
                  <span className="text-amber-300 font-mono font-bold">前3s反差霸凌 ➔ 20s打脸 ➔ 尾部钩子</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">爽度 94%</span>
              </div>
            </div>

            {/* Storyboard Shot Cards Stream */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {shots.map((shot, idx) => {
                const isSelected = idx === activeShotIndex;
                return (
                  <div
                    key={shot.id}
                    onClick={() => handleSelectShot(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 group relative ${
                      isSelected
                        ? 'bg-[#1c202b] border-blue-500/50 shadow-lg ring-1 ring-blue-500/40'
                        : 'bg-[#151821]/80 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 relative bg-black/60 border border-white/10">
                        <img src={shot.bgImage} alt={shot.shotNum} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <span className="absolute bottom-1 left-1 px-1 rounded bg-black/70 text-[9px] font-mono text-white/80">
                          #{shot.shotNum}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between h-28">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                              <span className="text-blue-400">{shot.type}</span>
                              <span className="text-[10px] text-white/40 font-normal">| {shot.angle}</span>
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                              {shot.hookTag}
                            </span>
                          </div>

                          <p className="text-[11px] text-white/90 line-clamp-2 leading-relaxed font-medium">
                            <span className="text-blue-400 font-bold">{shot.character}：</span>{shot.dialogue}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-mono">
                          <span>{shot.time} ({shot.durationSec}s)</span>
                          <span className="text-emerald-400 font-bold">已同步轨道</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* RIGHT/CENTER: PLAYER MONITOR & MULTI-TRACK NLE TIMELINE */}
        {(mode === 'hybrid' || mode === 'editor') && (
          <section className="flex-1 flex flex-col min-w-0 bg-[#0c0e14] overflow-hidden">
            {/* TOP STAGE: Player Monitor Viewport */}
            <div className="h-[52%] border-b border-white/10 flex flex-col md:flex-row min-h-0 bg-black/60 relative">
              {/* Video Monitor */}
              <div className="flex-1 flex flex-col min-h-0 relative items-center justify-center p-3">
                <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
                  <div className="p-1 bg-[#151821]/90 rounded-xl border border-white/10 flex items-center space-x-1 text-xs">
                    <button
                      onClick={() => setAspect('9:16')}
                      className={`px-2 py-0.5 rounded font-mono font-bold transition ${
                        aspect === '9:16' ? 'bg-blue-600 text-white shadow-xs' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      9:16 竖屏短剧
                    </button>
                    <button
                      onClick={() => setAspect('16:9')}
                      className={`px-2 py-0.5 rounded font-mono font-bold transition ${
                        aspect === '16:9' ? 'bg-blue-600 text-white shadow-xs' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      16:9 宽屏电影
                    </button>
                  </div>

                  <button
                    onClick={() => setSafeZoneVisible(prev => !prev)}
                    className={`p-2 rounded-xl border transition ${
                      safeZoneVisible ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                    title="显示抖音/快手短视频 80% 安全边框"
                  >
                    <Scan className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Monitor Box */}
                <div
                  className={`relative transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black flex items-center justify-center ${
                    aspect === '9:16' ? 'aspect-[9/16] h-[92%]' : 'aspect-[16/9] w-[90%]'
                  }`}
                >
                  <div
                    className="w-full h-full relative overflow-hidden bg-cover bg-center flex items-center justify-center"
                    style={{ backgroundImage: `url('${activeShot.bgImage}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Safe Area Guide */}
                    {safeZoneVisible && (
                      <div className="absolute inset-4 border border-dashed border-amber-400/40 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                        <span className="text-[9px] font-mono text-amber-400 bg-black/60 px-1 py-0.5 rounded w-max">Title Safe Margin (80%)</span>
                        <span className="text-[9px] font-mono text-amber-400 bg-black/60 px-1 py-0.5 rounded w-max self-end">Action UI Zone</span>
                      </div>
                    )}

                    {/* Subtitle Overlay */}
                    <div className="absolute bottom-10 inset-x-4 text-center">
                      <span className="px-2.5 py-1 text-xs md:text-sm font-black text-amber-300 bg-black/80 rounded-md backdrop-blur-sm border border-amber-300/30 shadow-lg inline-block">
                        {activeShot.dialogue}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-white/80 border border-white/10">
                      SHOT: <span className="text-blue-400 font-bold">#{activeShot.shotNum} {activeShot.type}</span>
                    </div>
                  </div>

                  {/* Player Transport Bar */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#151821]/90 backdrop-blur-2xl px-3 py-1.5 rounded-full flex items-center space-x-3 border border-white/10 shadow-2xl z-20">
                    <button onClick={() => setCurrentTime(0)} className="text-white/60 hover:text-white">
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(p => !p)}
                      className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
                    </button>
                    <button onClick={() => setCurrentTime(c => c + 0.1)} className="text-white/60 hover:text-white">
                      <StepForward className="w-3.5 h-3.5" />
                    </button>
                    <div className="h-3.5 w-px bg-white/20" />
                    <span className="text-xs font-mono font-bold text-white tracking-wider">{formattedTimecode()}</span>
                  </div>
                </div>
              </div>

              {/* Right: Camera Motion & Generation Inspector */}
              <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-white/10 flex flex-col bg-black/40 overflow-y-auto p-4 shrink-0 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <span>AI 运镜与生成参数控制</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    Gen-3 Engine
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-white/50 mb-1">当前分镜 AI 提示词 (Prompt)</label>
                    <textarea
                      value={activeShot.prompt}
                      onChange={e => {
                        const updated = [...shots];
                        updated[activeShotIndex].prompt = e.target.value;
                        setShots(updated);
                      }}
                      rows={3}
                      className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 font-sans leading-relaxed resize-none"
                    />
                  </div>

                  {/* Camera Movement Buttons */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex justify-between text-[11px] font-bold text-white/70">
                      <span>运镜模式 (Camera Movement)</span>
                      <span className="text-blue-400 font-mono">{activeCameraMotion}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-[10px]">
                      {['推镜 (Dolly In)', '横摇 (Pan Right)', '仰摇 (Tilt Up)', '环绕 (Orbit 360)'].map(m => (
                        <button
                          key={m}
                          onClick={() => setActiveCameraMotion(m)}
                          className={`p-1.5 rounded font-bold transition text-center ${
                            activeCameraMotion === m ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {m.split(' ')[0]}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] text-white/50 mb-1 font-mono">
                        <span>动态幅度 (Motion Brush):</span>
                        <span className="text-white font-bold">{motionIntensity}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.1"
                        value={motionIntensity}
                        onChange={e => setMotionIntensity(e.target.value)}
                        className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Tools */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => showToast('正在执行 4K 超分锐化增强...')}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left flex items-center space-x-2"
                    >
                      <Sparkle className="w-4 h-4 text-teal-400" />
                      <div>
                        <div className="font-bold text-white text-[11px]">4K 超分辨率</div>
                        <div className="text-[9px] text-white/40">超分锐化</div>
                      </div>
                    </button>

                    <button
                      onClick={() => showToast('正在调取 Neural Lip-Sync 对齐音轨...')}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left flex items-center space-x-2"
                    >
                      <Mic className="w-4 h-4 text-pink-400" />
                      <div>
                        <div className="font-bold text-white text-[11px]">智能唇形同步</div>
                        <div className="text-[9px] text-white/40">Lip-Sync 驱动</div>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => showToast('已向集群提交该片段的高清重新生成任务')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>重新生成该片段高质视频</span>
                  </button>
                </div>
              </div>
            </div>

            {/* BOTTOM STAGE: Final Cut Pro Style Multi-Track Timeline */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#0c0e14] relative">
              {/* Timeline Toolstrip */}
              <div className="h-9 px-4 border-b border-white/10 flex items-center justify-between bg-black/40 shrink-0 select-none">
                <div className="flex items-center space-x-1.5 text-xs">
                  <button
                    onClick={() => setActiveTool('pointer')}
                    className={`p-1.5 rounded transition ${activeTool === 'pointer' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    <MousePointer className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTool('blade')}
                    className={`p-1.5 rounded transition ${activeTool === 'blade' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}
                  >
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => showToast('已按 BGM 鼓点瞬间完成全轨道智能卡点')}
                    className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center space-x-1"
                  >
                    <Zap className="w-3 h-3" />
                    <span>AI 爆款卡点 (Beat Sync)</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="text-white/40">TC:</span>
                  <span className="font-bold text-blue-400">{formattedTimecode()}</span>
                  <span className="text-white/30">/</span>
                  <span className="text-white/60">00:00:45:00</span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <ZoomOut className="w-3.5 h-3.5 text-white/40" />
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={timelineZoom}
                    onChange={e => setTimelineZoom(parseFloat(e.target.value))}
                    className="w-16 accent-blue-500 h-1 bg-white/10 rounded cursor-pointer"
                  />
                  <ZoomIn className="w-3.5 h-3.5 text-white/40" />
                </div>
              </div>

              {/* Scrollable Tracks */}
              <div className="flex-1 overflow-x-auto overflow-y-auto relative select-none p-3 space-y-2">
                {/* V2 Track */}
                <div className="h-9 rounded-xl bg-white/5 border border-white/5 flex items-center px-3 relative">
                  <span className="w-20 shrink-0 text-[10px] font-mono text-purple-400 font-bold flex items-center space-x-1">
                    <Layers className="w-3 h-3" />
                    <span>V2 特效</span>
                  </span>
                  <div className="flex-1 h-6 relative">
                    <div className="absolute left-40 w-44 h-full rounded bg-purple-500/20 border border-purple-500/40 text-[9px] px-2 flex items-center text-purple-200">
                      ⚡ 雷霆电闪与气浪粒子
                    </div>
                  </div>
                </div>

                {/* V1 Master Track */}
                <div className="h-16 rounded-xl bg-white/5 border border-white/10 flex items-center px-3 relative">
                  <span className="w-20 shrink-0 text-[10px] font-mono text-blue-400 font-bold flex items-center space-x-1">
                    <Video className="w-3 h-3" />
                    <span>V1 主视频</span>
                  </span>

                  <div className="flex-1 h-12 relative flex items-center">
                    {shots.map((shot, idx) => (
                      <div
                        key={shot.id}
                        onClick={() => handleSelectShot(idx)}
                        className={`h-full rounded-lg border px-2 flex items-center justify-between text-xs cursor-pointer transition ${
                          idx === activeShotIndex
                            ? 'bg-blue-600/30 border-blue-500 ring-1 ring-blue-500'
                            : 'bg-white/10 border-white/10 hover:border-white/30'
                        }`}
                        style={{ width: `${shot.durationSec * 35 * timelineZoom}px`, marginRight: '4px' }}
                      >
                        <span className="font-bold font-mono text-[10px]">#{shot.shotNum}</span>
                        <span className="text-[9px] font-mono text-white/50">{shot.durationSec}s</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* A1 Voiceover Track */}
                <div className="h-10 rounded-xl bg-white/5 border border-white/5 flex items-center px-3 relative">
                  <span className="w-20 shrink-0 text-[10px] font-mono text-emerald-400 font-bold flex items-center space-x-1">
                    <Volume1 className="w-3 h-3" />
                    <span>A1 人声</span>
                  </span>
                  <div className="flex-1 h-7 relative flex items-center">
                    {shots.map((shot, idx) => (
                      <div
                        key={shot.id}
                        className="h-full rounded bg-emerald-500/20 border border-emerald-500/40 px-2 flex items-center text-[9px] text-emerald-300 truncate"
                        style={{ width: `${shot.durationSec * 35 * timelineZoom}px`, marginRight: '4px' }}
                      >
                        {shot.character}: {shot.dialogue.slice(0, 10)}...
                      </div>
                    ))}
                  </div>
                </div>

                {/* A2 BGM Track */}
                <div className="h-10 rounded-xl bg-white/5 border border-white/5 flex items-center px-3 relative">
                  <span className="w-20 shrink-0 text-[10px] font-mono text-amber-400 font-bold flex items-center space-x-1">
                    <Music2 className="w-3 h-3" />
                    <span>A2 BGM</span>
                  </span>
                  <div className="flex-1 h-7 relative">
                    <div className="w-full h-full rounded bg-amber-500/20 border border-amber-500/40 px-2 flex items-center justify-between text-[9px] text-amber-200">
                      <span>激昂战鼓与紧张提琴 (AI 情绪自适应变奏)</span>
                      <span className="font-mono text-[8px]">WAVE: 100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ============================================================ */}
      {/* EXPORT MODAL */}
      {/* ============================================================ */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#151821]/98 border border-white/10 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <ArrowUpCircle className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">渲染导出 AI 短剧母带</h3>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/50 mb-1">导出格式预设</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-blue-500/50 font-bold">
                    <div>抖音/快手短剧 (H.265/MP4)</div>
                    <div className="text-[9px] text-white/40">1080x1920 · 60fps</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60">
                    <div>Apple ProRes 422 HQ</div>
                    <div className="text-[9px] text-white/40">4K 母带级全彩</div>
                  </div>
                </div>
              </div>

              {isExporting && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-blue-300">硬件加速逐帧合成中...</span>
                    <span className="font-bold text-blue-400">{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
              <button onClick={() => setShowExportModal(false)} className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs">取消</button>
              <button
                onClick={handleStartExport}
                disabled={isExporting}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md disabled:opacity-40"
              >
                {isExporting ? '正在渲染中...' : '开始高保真渲染'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
