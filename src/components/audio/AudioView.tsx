import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Download, 
  Sparkles, 
  Volume2, 
  Volume1, 
  Mic2, 
  Radio, 
  User, 
  Sliders, 
  Check, 
  Plus, 
  Trash2, 
  Copy, 
  SlidersHorizontal, 
  Music, 
  Waves, 
  FileText, 
  CheckCircle2, 
  Disc, 
  RadioTower, 
  Sparkle, 
  Mic, 
  Settings2,
  Share2
} from 'lucide-react';

export type AudioSubMode = 'arranger' | 'voice_clone' | 'sfx' | 'mastering';

export interface VoiceProfile {
  id: string;
  name: string;
  role: string;
  similarity: string;
  desc: string;
  color: string;
}

export interface AudioTrack {
  id: string;
  name: string;
  type: string;
  color: string;
  solo: boolean;
  mute: boolean;
  pan: string;
  volumeDb: string;
  clipTitle: string;
  clipStyle: string;
  widthPx: number;
  offsetPx: number;
}

const INITIAL_VOICES: VoiceProfile[] = [
  { id: 'v-1', name: '洛奇 (主角原声)', role: '主角 · 隐忍青年', similarity: '98%', desc: '冷峻青年音色 · 略带气流感与压抑感', color: 'border-emerald-500 bg-emerald-500/10' },
  { id: 'v-2', name: '执政官巡弋队长', role: '阶段反派 · 机械铠甲', similarity: '95%', desc: '机械混响滤镜 · 电子重金属质感', color: 'border-amber-500 bg-amber-500/10' },
  { id: 'v-3', name: '全景旁白叙述者', role: '纪录片叙事 · 磁性低音', similarity: '99%', desc: '深沉磁性低音 · 宽广动态范围与宏大声场', color: 'border-purple-500 bg-purple-500/10' },
  { id: 'v-4', name: '苏薇 (网文主编)', role: '双播主持人 · 敏锐直率', similarity: '97%', desc: '清澈高频女声 · 吐字清晰、顿挫明快', color: 'border-pink-500 bg-pink-500/10' }
];

const INITIAL_TRACKS: AudioTrack[] = [
  {
    id: 't-1',
    name: 'Track 1: 苍凉箫音',
    type: '民乐独奏',
    color: 'emerald',
    solo: false,
    mute: false,
    pan: 'C',
    volumeDb: '-1.2 dB',
    clipTitle: '主旋律五声音阶 (空灵气流滑音)',
    clipStyle: 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
    widthPx: 320,
    offsetPx: 20
  },
  {
    id: 't-2',
    name: 'Track 2: 东方古筝',
    type: '弹拨配乐',
    color: 'purple',
    solo: false,
    mute: false,
    pan: '15% L',
    volumeDb: '-3.5 dB',
    clipTitle: '摇指泛音点缀 (暗物质侵蚀张力)',
    clipStyle: 'bg-purple-500/20 border-purple-500 text-purple-300',
    widthPx: 380,
    offsetPx: 80
  },
  {
    id: 't-3',
    name: 'Track 3: 重低音脉冲',
    type: '808 合成',
    color: 'cyan',
    solo: false,
    mute: false,
    pan: 'C',
    volumeDb: '-4.2 dB',
    clipTitle: '808 模拟超重低音 (重力过载共鸣)',
    clipStyle: 'bg-cyan-500/20 border-cyan-500 text-cyan-300',
    widthPx: 480,
    offsetPx: 10
  },
  {
    id: 't-4',
    name: 'Track 4: 角色旁白配音',
    type: '人声台词',
    color: 'amber',
    solo: false,
    mute: false,
    pan: '5% R',
    volumeDb: '0.0 dB',
    clipTitle: '洛奇台词：“九渊之下，三息尚存！”',
    clipStyle: 'bg-amber-500/20 border-amber-500 text-amber-300',
    widthPx: 350,
    offsetPx: 120
  }
];

export const AudioView: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  const [subMode, setSubMode] = useState<AudioSubMode>('arranger');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(74.28); // 00:01:14:08
  const [voices, setVoices] = useState<VoiceProfile[]>(INITIAL_VOICES);
  const [activeVoiceId, setActiveVoiceId] = useState('v-1');
  const [tracks, setTracks] = useState<AudioTrack[]>(INITIAL_TRACKS);
  const [dialectTuning, setDialectTuning] = useState('标准中州古韵 / 河南方言转调');
  const [reverbValue, setReverbValue] = useState(42);
  const [compressionValue, setCompressionValue] = useState(65);

  // Dynamic VU Meters Level simulation
  const [vuLeft, setVuLeft] = useState(65);
  const [vuRight, setVuRight] = useState(62);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Playback timer & VU Meter interval
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTimeSec(prev => (prev >= 180 ? 0 : prev + 0.1));
        setVuLeft(Math.floor(Math.random() * 40 + 50));
        setVuRight(Math.floor(Math.random() * 40 + 50));
      }, 100);
    } else {
      setVuLeft(10);
      setVuRight(10);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Format timecode (00:01:14:08)
  const formattedTimecode = () => {
    const m = Math.floor(currentTimeSec / 60);
    const s = Math.floor(currentTimeSec % 60);
    const f = Math.floor((currentTimeSec % 1) * 30);
    return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  };

  // Master Lossless Export
  const handleExportMaster = () => {
    const title = "《星渊行者》无损母带 · 折跃回廊";
    const body = `音频母带配置:\n- 格式: 48kHz 24-bit 无损 WAV\n- 速度/调式: 120.00 BPM · D 小调 (羽调式)\n- 混响 & 空间: 杜比全景声 3D Reverb (42%)\n- 方言/腔调校准: ${dialectTuning}\n- 轨道包含: 4 轨无损干音与 AI 动态音效`;
    
    showToast('✦ 已触发本地音频引擎：48kHz 24-bit 无损 WAV 母带已导出并保存至素材库！');
    if (onSaveToMaterial) {
      onSaveToMaterial(title, body);
    }
  };

  // Toggle Track Mute/Solo
  const handleToggleTrackMute = (id: string) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, mute: !t.mute } : t));
    showToast('已更新轨道静音状态');
  };

  const handleToggleTrackSolo = (id: string) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, solo: !t.solo } : t));
    showToast('已更新轨道独奏状态');
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#0a0a0d] text-slate-100 font-sans select-none relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#18181b]/95 border border-white/20 text-white text-xs font-semibold shadow-2xl flex items-center space-x-2 backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. TOP macOS/LOGIC PRO UNIFIED TOOLBAR */}
      {/* ============================================================ */}
      <header className="h-12 px-4 z-30 flex items-center justify-between bg-[#18181c]/90 backdrop-blur-2xl border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-purple-600 p-0.5 flex items-center justify-center shadow-md">
            <Headphones className="w-4 h-4 text-black" />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-white tracking-tight font-mono">《星渊行者》配乐工程</span>
            <span className="text-white/30">›</span>
            <span className="text-white/80 font-medium">折跃回廊·国风电子管弦混音</span>
          </div>
        </div>

        {/* Center: Apple Segmented View Switcher */}
        <div className="flex items-center bg-black/50 p-0.5 rounded-xl border border-white/10 shadow-inner text-xs font-medium">
          {[
            { id: 'arranger', label: '多轨编曲 (Arranger)' },
            { id: 'voice_clone', label: '声音克隆 (Voice Clone)' },
            { id: 'sfx', label: 'AI 动态音效 (SFX)' },
            { id: 'mastering', label: '母带处理 (Mastering)' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setSubMode(item.id as any)}
              className={`px-3 py-1 rounded-lg transition-all ${
                subMode === item.id ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-white/50 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right: Master Lossless Export Button */}
        <div className="flex items-center space-x-3">
          <span className="font-mono text-[11px] text-emerald-400 font-bold hidden sm:inline">
            48kHz · 24-bit 无损
          </span>

          <button
            onClick={handleExportMaster}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md transition active:scale-95 flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>✦ 导出母带</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. LOGIC PRO WORKSTATION LAYOUT */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Voice Library & Character Profiles */}
        <aside className="w-64 bg-[#121216] border-r border-white/10 flex flex-col shrink-0 select-none">
          <div className="p-3 border-b border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center justify-between">
            <span>角色音色与模型库 (Voice Lib)</span>
            <span className="text-emerald-400 font-mono">AI Neural</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {voices.map(v => (
              <div
                key={v.id}
                onClick={() => { setActiveVoiceId(v.id); showToast(`已选中音色模型《${v.name}》`); }}
                className={`p-3 rounded-xl border transition cursor-pointer space-y-1 ${
                  activeVoiceId === v.id ? `${v.color} shadow-md` : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{v.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">{v.similarity}</span>
                </div>
                <div className="text-[10px] text-white/50">{v.role}</div>
                <p className="text-[10px] text-white/70 leading-relaxed pt-1">{v.desc}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER PANEL: Multitrack Workstation & Transport Bar */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0d] overflow-hidden">
          {/* Transport Bar */}
          <div className="h-12 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between shrink-0 select-none">
            {/* Transport Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentTimeSec(0)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                title="重置播放位置"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                  isPlaying ? 'bg-emerald-500 text-black font-bold shadow-md' : 'bg-white text-black hover:scale-105'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              </button>

              <button
                onClick={() => { setIsPlaying(false); setCurrentTimeSec(0); }}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
              </button>

              <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                {formattedTimecode()}
              </span>
            </div>

            {/* Tempo & Key Badge */}
            <div className="hidden md:flex items-center space-x-4 font-mono text-xs text-white/60">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">120.00 BPM</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">4/4 拍</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-purple-300">D 小调 (羽调式)</span>
            </div>

            {/* Live Stereo VU Meter */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-white/40">VU Meter</span>
              <div className="w-20 space-y-1">
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-75" style={{ width: `${vuLeft}%` }} />
                </div>
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-75" style={{ width: `${vuRight}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Multitrack Lanes Viewport */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
            {tracks.map(t => (
              <div key={t.id} className="h-16 rounded-xl bg-[#121216] border border-white/10 flex overflow-hidden shadow-xs relative">
                {/* Track Header Cell */}
                <div className="w-36 bg-black/40 border-r border-white/10 p-2.5 flex flex-col justify-between shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{t.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleToggleTrackSolo(t.id)}
                        className={`px-1 rounded ${t.solo ? 'bg-amber-400 text-black font-bold' : 'bg-white/10 text-white/50'}`}
                      >
                        S
                      </button>
                      <button
                        onClick={() => handleToggleTrackMute(t.id)}
                        className={`px-1 rounded ${t.mute ? 'bg-rose-500 text-white font-bold' : 'bg-white/10 text-white/50'}`}
                      >
                        M
                      </button>
                    </div>
                    <span className="text-white/40">{t.volumeDb}</span>
                  </div>
                </div>

                {/* Track Waveform Region Body */}
                <div className="flex-1 bg-black/20 relative flex items-center px-2">
                  <div
                    className={`absolute h-11 rounded-lg border px-3 flex items-center justify-between text-xs font-bold cursor-pointer shadow-sm ${t.clipStyle}`}
                    style={{ left: `${t.offsetPx}px`, width: `${t.widthPx}px` }}
                    onClick={() => showToast(`已选择剪辑片段《${t.clipTitle}》`)}
                  >
                    <span className="truncate">{t.clipTitle}</span>
                    <Waves className="w-4 h-4 shrink-0 opacity-70 ml-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT PANEL: Channel Strip Inspector */}
        <aside className="w-64 bg-[#121216] border-l border-white/10 p-4 flex flex-col justify-between shrink-0 text-xs space-y-4 select-none">
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center justify-between">
              <span>通道属性 (Inspector)</span>
              <Settings2 className="w-3.5 h-3.5 text-purple-400" />
            </div>

            {/* Reverb Slider */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-white/60">动态空间混响 (Reverb):</span>
                <span className="text-emerald-400 font-bold">{reverbValue}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={reverbValue}
                onChange={e => setReverbValue(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-white/10 rounded cursor-pointer"
              />
            </div>

            {/* Dialect Tuning Selector */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="block text-[11px] text-white/60 font-bold">方言与戏剧腔调校准</span>
              <select
                value={dialectTuning}
                onChange={e => { setDialectTuning(e.target.value); showToast(`已切换腔调校准为：${e.target.value}`); }}
                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-white font-medium focus:outline-none cursor-pointer mt-1"
              >
                <option value="标准中州古韵 / 河南方言转调">标准中州古韵 / 河南方言转调</option>
                <option value="闽南古韵吟唱调">闽南古韵吟唱调</option>
                <option value="正统影视戏剧腔">正统影视戏剧腔</option>
              </select>
            </div>

            {/* Equalizer Compression */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-white/60">人声压限防剪切 (Compression):</span>
                <span className="text-purple-300 font-bold">{compressionValue}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={compressionValue}
                onChange={e => setCompressionValue(Number(e.target.value))}
                className="w-full accent-purple-400 h-1 bg-white/10 rounded cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (onSaveToMaterial) {
                onSaveToMaterial("Logic Pro 音频工程结论", `包含 ${tracks.length} 轨混音与 ${dialectTuning} 腔调校准规则`);
              }
              showToast('已将当前音频工程配置收录至素材库');
            }}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center justify-center space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>收录工程配置至素材库</span>
          </button>
        </aside>
      </div>
    </div>
  );
};
