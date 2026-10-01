import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  Trash2, 
  RefreshCw, 
  Maximize2, 
  Sliders, 
  Palette,
  Check,
  FolderGit2,
  Plus,
  Layers,
  Ratio,
  Compass,
  User,
  Flame,
  Bookmark,
  BookmarkPlus,
  Scissors,
  Wand2,
  Upload,
  SlidersHorizontal,
  Eye,
  CheckCircle2,
  Copy,
  Split,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize2,
  Crop,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

export type ImageStudioMode = 'generation' | 'matting';
export type ImageCategory = 'all' | 'characters' | 'scenes' | 'combat' | 'artifacts';
export type MattingSubjectType = 'auto' | 'portrait' | 'product' | 'animal' | 'graphic';
export type MattingBgType = 'transparent' | 'color' | 'scene';

export interface GeneratedImage {
  id: string;
  category: 'characters' | 'scenes' | 'combat' | 'artifacts';
  prompt: string;
  negativePrompt?: string;
  style: string;
  ratio: '16:9' | '1:1' | '4:3' | '9:16' | '21:9';
  model: string;
  steps: number;
  cfgScale: number;
  seed: number;
  svgGradient: string;
  createdAt: string;
}

export interface MattingSample {
  id: string;
  title: string;
  subjectType: MattingSubjectType;
  originalBg: string;
  fgGradient: string;
  previewName: string;
}

const MATTING_SAMPLES: MattingSample[] = [
  {
    id: 'mat-1',
    title: '剑客肖像（发丝级人像抠图）',
    subjectType: 'portrait',
    originalBg: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    fgGradient: 'radial-gradient(circle at center, #f59e0b 0%, #b45309 60%, transparent 80%)',
    previewName: '少年剑客 · 沈玄烛'
  },
  {
    id: 'mat-2',
    title: '万宝仙盟灵石算筹（电商静物）',
    subjectType: 'product',
    originalBg: 'linear-gradient(135deg, #0f172a 0%, #1e1e24 100%)',
    fgGradient: 'radial-gradient(circle at center, #06b6d4 0%, #0e7490 60%, transparent 80%)',
    previewName: '九阶玄晶算筹'
  },
  {
    id: 'mat-3',
    title: '上古灵兽三足金乌（精细毛发）',
    subjectType: 'animal',
    originalBg: 'linear-gradient(135deg, #2b0b0e 0%, #450a0a 100%)',
    fgGradient: 'radial-gradient(circle at center, #f43f5e 0%, #e11d48 60%, transparent 80%)',
    previewName: '三足赤阳神乌'
  }
];

export const ImageView: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  // Mode Switcher: 'generation' (AI生图) | 'matting' (AI抠图)
  const [studioMode, setStudioMode] = useState<ImageStudioMode>('generation');

  // ============================================================
  // 1. AI 生图状态参数 (AI GENERATION PARAMETERS)
  // ============================================================
  const [genCategory, setGenCategory] = useState<ImageCategory>('all');
  const [prompt, setPrompt] = useState('深秋黑风渡口，暴风雨夜，孤舟蓑衣剑客拔剑立于船头，右瞳泛起暗金色流光，远景黑水泽深渊巨浪');
  const [negativePrompt, setNegativePrompt] = useState('低画质，肢体畸形，多余手指，模糊，低分辨率，噪点，文字水印');
  const [style, setStyle] = useState('东方玄幻国风');
  const [ratio, setRatio] = useState<'16:9' | '1:1' | '4:3' | '9:16' | '21:9'>('16:9');
  const [modelEngine, setModelEngine] = useState('Flux.1 Pro High-Res');
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7.5);
  const [seed, setSeed] = useState(-1); // -1 for random
  const [hiResFix, setHiResFix] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedToMaterial, setSavedToMaterial] = useState(false);

  const [images, setImages] = useState<GeneratedImage[]>([
    {
      id: 'img-1',
      category: 'combat',
      prompt: '深秋黑水泽渡口寒雨，少年剑客微步踏碎鉴魂镜符光，暗金瞳纹流转，青铜钱破空拉出白练气浪',
      negativePrompt: '低画质，肢体畸形，模糊',
      style: '东方玄幻国风',
      ratio: '16:9',
      model: 'Flux.1 Pro High-Res',
      steps: 32,
      cfgScale: 7.5,
      seed: 849204,
      svgGradient: 'linear-gradient(135deg, #091326 0%, #1e1338 50%, #442111 100%)',
      createdAt: '10-01 15:20'
    },
    {
      id: 'img-2',
      category: 'characters',
      prompt: '万宝仙盟柳清霜人物立绘，天水碧绫罗长裙，指尖拨弄银纹算筹，清冷远山眉，神色从容敏锐',
      negativePrompt: '低画质，模糊',
      style: '写实影视渲染',
      ratio: '4:3',
      model: 'Midjourney v6 Photoreal',
      steps: 28,
      cfgScale: 7.0,
      seed: 391204,
      svgGradient: 'linear-gradient(135deg, #0d282e 0%, #1b3a4b 50%, #065a60 100%)',
      createdAt: '10-01 14:10'
    },
    {
      id: 'img-3',
      category: 'scenes',
      prompt: '九渊大裂纪浮空仙门，清气缭绕九重仙岛与黑水渊海天堑割裂构图，压迫感极强的冷冽天地画卷',
      negativePrompt: '低画质，低分辨率',
      style: '概念场景原画',
      ratio: '16:9',
      model: 'Imagen 3 Ultra',
      steps: 35,
      cfgScale: 8.0,
      seed: 991240,
      svgGradient: 'linear-gradient(135deg, #10002b 0%, #240046 50%, #3c096c 100%)',
      createdAt: '10-01 12:05'
    }
  ]);

  const [activeImageId, setActiveImageId] = useState<string>('img-1');
  const activeImage = images.find(i => i.id === activeImageId) || images[0];

  // ============================================================
  // 2. AI 抠图状态参数 (AI MATTING PARAMETERS)
  // ============================================================
  const [selectedMattingSample, setSelectedMattingSample] = useState<MattingSample>(MATTING_SAMPLES[0]);
  const [mattingSubjectType, setMattingSubjectType] = useState<MattingSubjectType>('portrait');
  const [mattingBgType, setMattingBgType] = useState<MattingBgType>('transparent');
  const [mattingCustomColor, setMattingCustomColor] = useState('#ffffff');
  const [mattingSceneBg, setMattingSceneBg] = useState('studio'); // 'studio' | 'nature' | 'cyberpunk' | 'xianxia'
  const [featherRadius, setFeatherRadius] = useState(2); // 0~10px
  const [edgeShift, setEdgeShift] = useState(0); // -5 ~ +5px
  const [decontaminateColor, setDecontaminateColor] = useState(true);
  const [hairMattingRefine, setHairMattingRefine] = useState(true);
  const [isProcessingMatting, setIsProcessingMatting] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50); // 0~100 split view
  const [mattingProcessed, setMattingProcessed] = useState(true);

  // Handle AI Image Generation
  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const newImg: GeneratedImage = {
        id: `img-${Date.now()}`,
        category: genCategory === 'all' ? 'combat' : genCategory,
        prompt: prompt.trim(),
        negativePrompt,
        style,
        ratio,
        model: modelEngine,
        steps,
        cfgScale,
        seed: seed === -1 ? Math.floor(Math.random() * 900000) + 100000 : seed,
        svgGradient: 'linear-gradient(135deg, #0b1a30 0%, #1e1338 50%, #2e4057 100%)',
        createdAt: '刚刚'
      };
      setImages([newImg, ...images]);
      setActiveImageId(newImg.id);
      setIsGenerating(false);
    }, 900);
  };

  // Handle AI Matting Execute
  const handleExecuteMatting = () => {
    setIsProcessingMatting(true);
    setTimeout(() => {
      setMattingProcessed(true);
      setIsProcessingMatting(false);
    }, 700);
  };

  const handleSaveCurrentToMaterial = async () => {
    if (studioMode === 'generation' && activeImage) {
      try {
        await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `AI原画: ${activeImage.prompt.slice(0, 20)}...`,
            body: `【视觉风格】${activeImage.style} | 画幅：${activeImage.ratio} | 引擎：${activeImage.model}\n\n【正向提示词】\n${activeImage.prompt}\n\n【反向提示词】\n${activeImage.negativePrompt || '无'}\n\n【参数】采样步数: ${activeImage.steps} | CFG: ${activeImage.cfgScale} | Seed: ${activeImage.seed}`,
            tags: ['AI生图', activeImage.style, activeImage.category]
          })
        });
        setSavedToMaterial(true);
        if (onSaveToMaterial) onSaveToMaterial(`AI原画: ${activeImage.prompt.slice(0, 20)}`, activeImage.prompt);
        setTimeout(() => setSavedToMaterial(false), 2000);
      } catch (e) {
        console.error(e);
      }
    } else if (studioMode === 'matting' && selectedMattingSample) {
      try {
        await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `AI抠图资产: ${selectedMattingSample.title}`,
            body: `【抠图对象】${selectedMattingSample.previewName} (${selectedMattingSample.subjectType})\n【输出背景】${mattingBgType}\n【羽化参数】${featherRadius}px | 边缘内缩: ${edgeShift}px | 发丝级精细化: ${hairMattingRefine ? '开启' : '关闭'}`,
            tags: ['AI抠图', '透明通道', selectedMattingSample.subjectType]
          })
        });
        setSavedToMaterial(true);
        setTimeout(() => setSavedToMaterial(false), 2000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredImages = images.filter(i => genCategory === 'all' || i.category === genCategory);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--apple-bg)] select-none text-[var(--apple-text-primary)]">
      {/* ============================================================ */}
      {/* 1. TOP macOS PRO STUDIO HEADER: MODE SWITCHER */}
      {/* ============================================================ */}
      <header className="h-14 border-b border-[var(--apple-border)] bg-[var(--apple-glass)] backdrop-blur-2xl px-6 flex items-center justify-between shrink-0 z-30 select-none">
        {/* Left Brand Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold tracking-tight text-[var(--apple-text-primary)]">
                AI 视觉工作台 · Apple Pro Studio
              </h1>
              <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 font-mono text-[9px] font-bold border border-purple-500/20">
                Alpha & Diffusion
              </span>
            </div>
            <p className="text-[10px] text-[var(--apple-text-tertiary)]">
              {studioMode === 'generation' ? '高精度扩散模型原画生成与提示词工程' : '智能发丝级高精度 Alpha 通道透明抠图与背景合成'}
            </p>
          </div>
        </div>

        {/* Center: Apple Segmented Mode Switcher */}
        <div className="flex items-center bg-[var(--apple-subtle)] border border-[var(--apple-border)] p-1 rounded-2xl shadow-2xs">
          <button
            onClick={() => setStudioMode('generation')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              studioMode === 'generation'
                ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs scale-[1.02]'
                : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>🎨 AI 生图 (Generation)</span>
          </button>

          <button
            onClick={() => setStudioMode('matting')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              studioMode === 'matting'
                ? 'bg-[var(--apple-surface)] text-pink-500 shadow-xs scale-[1.02]'
                : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>✂️ AI 抠图 (Matting)</span>
          </button>
        </div>

        {/* Right Actions: Save to Material + Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveCurrentToMaterial}
            disabled={savedToMaterial}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              savedToMaterial
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
            }`}
          >
            {savedToMaterial ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            <span>{savedToMaterial ? '已收录素材库' : '存入素材库'}</span>
          </button>

          <button
            className="px-3.5 py-1.5 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold shadow-xs hover:bg-[var(--apple-accent-hover)] transition-all flex items-center gap-1.5"
            title="导出当前高清图片 / PNG 透明图层"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出图像</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN WORKSPACE CONTAINER */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========================================================== */}
        {/* MODE 1: 🎨 AI 生图工作台 (IMAGE GENERATION STUDIO) */}
        {/* ========================================================== */}
        {studioMode === 'generation' && (
          <>
            {/* Left Parameters Inspector */}
            <aside className="w-88 border-r border-[var(--apple-border)] bg-[var(--apple-surface)]/80 backdrop-blur-2xl p-5 flex flex-col shrink-0 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--apple-separator)]">
                <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
                  <span>生成参数控制台</span>
                </span>
                <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)]">Diffusion Engine</span>
              </div>

              {/* 提示词输入 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--apple-text-primary)]">正向提示词 (Prompt)</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="描述你想要生成的画面细节、光影与构图..."
                  className="w-full p-3 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-2xl text-xs text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)] resize-none shadow-xs"
                />
              </div>

              {/* 反向提示词 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--apple-text-primary)]">反向提示词 (Negative Prompt)</label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={e => setNegativePrompt(e.target.value)}
                  placeholder="低画质，肢体畸形，文字..."
                  className="w-full px-3 py-2 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-xs text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)] shadow-xs"
                />
              </div>

              {/* 视觉风格选择 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--apple-text-primary)]">视觉风格 (Visual Style)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    '东方玄幻国风', '写实影视渲染', '概念场景原画', '赛博朋克科幻', '动漫二次元', '复古胶片颗粒'
                  ].map(s => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`p-2 rounded-xl text-xs text-left border transition-all truncate ${
                        style === s
                          ? 'bg-[var(--apple-accent-subtle)] border-[var(--apple-accent)] text-[var(--apple-accent)] font-semibold'
                          : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* 画幅比例 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--apple-text-primary)]">画幅比例 (Aspect Ratio)</label>
                <div className="grid grid-cols-5 gap-1 text-[11px] font-mono">
                  {(['16:9', '1:1', '4:3', '9:16', '21:9'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setRatio(r)}
                      className={`py-1.5 rounded-xl border text-center transition-all ${
                        ratio === r
                          ? 'bg-[var(--apple-accent)] text-white font-bold border-[var(--apple-accent)] shadow-xs'
                          : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* 引擎模型 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--apple-text-primary)]">生成模型 (Engine Model)</label>
                <select
                  value={modelEngine}
                  onChange={e => setModelEngine(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-xs text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)]"
                >
                  <option value="Flux.1 Pro High-Res">Flux.1 Pro High-Res (极清写实与细节)</option>
                  <option value="Midjourney v6 Photoreal">Midjourney v6 Photoreal (大师级光影构图)</option>
                  <option value="Imagen 3 Ultra">Imagen 3 Ultra (高保真中文理解)</option>
                  <option value="SDXL Turbo Lightning">SDXL Turbo Lightning (毫秒级实时生成)</option>
                </select>
              </div>

              {/* 采样步数 & 引导系数 */}
              <div className="space-y-3 pt-1 border-t border-[var(--apple-separator)]">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[var(--apple-text-secondary)]">采样步数 (Steps)</span>
                    <span className="font-mono font-bold text-[var(--apple-accent)]">{steps} 步</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={50}
                    value={steps}
                    onChange={e => setSteps(Number(e.target.value))}
                    className="w-full accent-[var(--apple-accent)]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[var(--apple-text-secondary)]">提示词引导强度 (CFG Scale)</span>
                    <span className="font-mono font-bold text-[var(--apple-accent)]">{cfgScale}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={0.5}
                    value={cfgScale}
                    onChange={e => setCfgScale(Number(e.target.value))}
                    className="w-full accent-[var(--apple-accent)]"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--apple-accent)] via-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? '正在渲染超清画卷...' : '立即生成高清原画'}</span>
                </button>
              </div>
            </aside>

            {/* Center Canvas & Gallery */}
            <main className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
              {/* Active Image Large Viewport */}
              <div className="flex-1 rounded-3xl border border-[var(--apple-border)] bg-[var(--apple-surface)] shadow-md overflow-hidden relative flex items-center justify-center p-6">
                {/* Visual Canvas Card */}
                <div
                  className="w-full h-full rounded-2xl shadow-2xl relative overflow-hidden flex flex-col justify-end p-6 transition-all duration-300"
                  style={{ background: activeImage.svgGradient }}
                >
                  {/* Subtle Grain & Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono border border-white/20">
                      {activeImage.style}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono border border-white/20">
                      画幅 {activeImage.ratio}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[var(--apple-accent)] text-[10px] font-mono border border-white/20">
                      {activeImage.model}
                    </span>
                  </div>

                  {/* Bottom Prompt Metadata */}
                  <div className="relative z-10 space-y-1.5 max-w-2xl">
                    <p className="text-sm font-semibold text-white leading-relaxed drop-shadow-md">
                      {activeImage.prompt}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-white/70">
                      <span>步数: {activeImage.steps}</span>
                      <span>·</span>
                      <span>CFG: {activeImage.cfgScale}</span>
                      <span>·</span>
                      <span>Seed: {activeImage.seed}</span>
                      <span>·</span>
                      <span>{activeImage.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* History Gallery Strip */}
              <div className="h-28 border-t border-[var(--apple-separator)] pt-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
                {images.map(img => (
                  <div
                    key={img.id}
                    onClick={() => setActiveImageId(img.id)}
                    className={`h-22 w-36 rounded-2xl border transition-all cursor-pointer shrink-0 overflow-hidden relative p-2 flex flex-col justify-end shadow-2xs ${
                      activeImageId === img.id
                        ? 'border-[var(--apple-accent)] ring-2 ring-[var(--apple-accent)]/40 scale-[1.02]'
                        : 'border-[var(--apple-border)] hover:border-[var(--apple-border-strong)] opacity-70 hover:opacity-100'
                    }`}
                    style={{ background: img.svgGradient }}
                  >
                    <div className="absolute inset-0 bg-black/40" />
                    <p className="relative z-10 text-[9px] text-white font-medium line-clamp-2">
                      {img.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </main>
          </>
        )}

        {/* ========================================================== */}
        {/* MODE 2: ✂️ AI 抠图工作台 (AI MATTING & ALPHA CUTOUT) */}
        {/* ========================================================== */}
        {studioMode === 'matting' && (
          <>
            {/* Left Matting Parameters Inspector */}
            <aside className="w-88 border-r border-[var(--apple-border)] bg-[var(--apple-surface)]/80 backdrop-blur-2xl p-5 flex flex-col shrink-0 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--apple-separator)]">
                <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-pink-500" />
                  <span>AI 抠图参数控制台</span>
                </span>
                <span className="text-[10px] font-mono text-pink-400">Alpha Mask Pro</span>
              </div>

              {/* 1. 抠图主体类型 */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--apple-text-primary)]">抠图主体类型 (Subject Type)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'portrait' as MattingSubjectType, label: '👤 人物肖像发丝' },
                    { id: 'product' as MattingSubjectType, label: '📦 电商商品静物' },
                    { id: 'animal' as MattingSubjectType, label: '🦊 动物毛发羽翼' },
                    { id: 'auto' as MattingSubjectType, label: '✨ 通用智能主体' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setMattingSubjectType(item.id)}
                      className={`p-2 rounded-xl text-xs text-left border transition-all ${
                        mattingSubjectType === item.id
                          ? 'bg-pink-500/15 border-pink-500/40 text-pink-500 font-semibold shadow-xs'
                          : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. 背景替换设置 */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[var(--apple-text-primary)]">背景替换模式 (Background Mode)</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    onClick={() => setMattingBgType('transparent')}
                    className={`py-1.5 rounded-xl border text-center transition-all ${
                      mattingBgType === 'transparent'
                        ? 'bg-[var(--apple-accent)] text-white font-bold border-[var(--apple-accent)]'
                        : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)]'
                    }`}
                  >
                    🏁 透明通道
                  </button>
                  <button
                    onClick={() => setMattingBgType('color')}
                    className={`py-1.5 rounded-xl border text-center transition-all ${
                      mattingBgType === 'color'
                        ? 'bg-[var(--apple-accent)] text-white font-bold border-[var(--apple-accent)]'
                        : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)]'
                    }`}
                  >
                    🎨 纯色背景
                  </button>
                  <button
                    onClick={() => setMattingBgType('scene')}
                    className={`py-1.5 rounded-xl border text-center transition-all ${
                      mattingBgType === 'scene'
                        ? 'bg-[var(--apple-accent)] text-white font-bold border-[var(--apple-accent)]'
                        : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)]'
                    }`}
                  >
                    🌄 场景合成
                  </button>
                </div>

                {mattingBgType === 'color' && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                    <span className="text-[11px] text-[var(--apple-text-secondary)]">调色板:</span>
                    <input
                      type="color"
                      value={mattingCustomColor}
                      onChange={e => setMattingCustomColor(e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                    />
                    <span className="font-mono text-xs">{mattingCustomColor}</span>
                  </div>
                )}
              </div>

              {/* 3. 边缘羽化与修边参数 */}
              <div className="space-y-3 pt-2 border-t border-[var(--apple-separator)]">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[var(--apple-text-secondary)]">边缘羽化度 (Feathering)</span>
                    <span className="font-mono font-bold text-pink-500">{featherRadius} px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={featherRadius}
                    onChange={e => setFeatherRadius(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[var(--apple-text-secondary)]">边缘内缩/外扩 (Edge Shift)</span>
                    <span className="font-mono font-bold text-pink-500">{edgeShift} px</span>
                  </div>
                  <input
                    type="range"
                    min={-5}
                    max={5}
                    value={edgeShift}
                    onChange={e => setEdgeShift(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center justify-between p-2 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] cursor-pointer">
                    <span className="text-[11px] font-semibold">发丝级高精 Alpha 蒙版</span>
                    <input
                      type="checkbox"
                      checked={hairMattingRefine}
                      onChange={e => setHairMattingRefine(e.target.checked)}
                      className="accent-pink-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] cursor-pointer">
                    <span className="text-[11px] font-semibold">去除边缘杂色色溢 (Decontaminate)</span>
                    <input
                      type="checkbox"
                      checked={decontaminateColor}
                      onChange={e => setDecontaminateColor(e.target.checked)}
                      className="accent-pink-500 rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Execute Matting Button */}
              <div className="pt-2">
                <button
                  onClick={handleExecuteMatting}
                  disabled={isProcessingMatting}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Wand2 className={`w-4 h-4 ${isProcessingMatting ? 'animate-spin' : ''}`} />
                  <span>{isProcessingMatting ? '正在极速精细抠图中...' : '立即执行 AI 智能抠图'}</span>
                </button>
              </div>
            </aside>

            {/* Center Interactive Split Viewport */}
            <main className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
              {/* Split Comparison Canvas */}
              <div className="flex-1 rounded-3xl border border-[var(--apple-border)] bg-[var(--apple-surface)] shadow-md overflow-hidden relative flex items-center justify-center p-6">
                <div className="w-full h-full rounded-2xl shadow-2xl relative overflow-hidden flex items-center justify-center">
                  {/* Checkerboard Pattern for Alpha */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: mattingBgType === 'color' ? mattingCustomColor : mattingBgType === 'scene' ? '#0f172a' : '#1e1e24',
                      backgroundImage: mattingBgType === 'transparent'
                        ? 'linear-gradient(45deg, #2a2a2e 25%, transparent 25%), linear-gradient(-45deg, #2a2a2e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2e 75%), linear-gradient(-45deg, transparent 75%, #2a2a2e 75%)'
                        : 'none',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}
                  />

                  {/* Foreground Subject */}
                  <div
                    className="relative z-10 w-96 h-96 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300"
                    style={{
                      background: selectedMattingSample.fgGradient,
                      filter: `blur(${featherRadius * 0.3}px)`
                    }}
                  >
                    <div className="text-center space-y-2 p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/20">
                      <Scissors className="w-8 h-8 text-pink-400 mx-auto animate-pulse" />
                      <h3 className="text-sm font-bold text-white">
                        {selectedMattingSample.previewName}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                        Alpha 蒙版提取成功 (100% 无损)
                      </span>
                    </div>
                  </div>

                  {/* Top Floating Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-mono border border-white/20 flex items-center gap-1.5">
                      <Scissors className="w-3 h-3 text-pink-400" />
                      <span>{selectedMattingSample.title}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 text-[10px] font-mono border border-white/20">
                      羽化: {featherRadius}px | 内缩: {edgeShift}px
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Selectors Strip */}
              <div className="h-28 border-t border-[var(--apple-separator)] pt-3 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                  {MATTING_SAMPLES.map(sample => (
                    <div
                      key={sample.id}
                      onClick={() => setSelectedMattingSample(sample)}
                      className={`h-22 w-44 rounded-2xl border transition-all cursor-pointer shrink-0 p-3 flex flex-col justify-between shadow-2xs ${
                        selectedMattingSample.id === sample.id
                          ? 'border-pink-500 ring-2 ring-pink-500/40 bg-pink-500/10'
                          : 'border-[var(--apple-border)] bg-[var(--apple-surface)] hover:border-[var(--apple-border-strong)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{sample.previewName}</span>
                        <Scissors className="w-3.5 h-3.5 text-pink-400" />
                      </div>
                      <p className="text-[10px] text-[var(--apple-text-tertiary)] truncate">
                        {sample.title}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Upload Button */}
                <button
                  className="px-4 py-3 rounded-2xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] hover:border-pink-500/50 text-xs font-semibold text-[var(--apple-text-primary)] transition-all flex items-center gap-2 shrink-0 shadow-2xs ml-3"
                  title="上传本地图片进行智能抠图"
                >
                  <Upload className="w-4 h-4 text-pink-500" />
                  <span>上传自定义图片</span>
                </button>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};
