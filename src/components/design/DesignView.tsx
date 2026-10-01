import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Image as ImageIcon, 
  Sparkles, 
  Box, 
  Film, 
  Share, 
  Sun, 
  Moon, 
  Sidebar as SidebarIcon, 
  FileCode, 
  PenTool, 
  PlayCircle, 
  Wand2, 
  Layers as LayersIcon, 
  Grid, 
  Wand, 
  Sliders, 
  Award, 
  Check, 
  Copy, 
  Download, 
  Maximize2, 
  RotateCcw, 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  Loader2, 
  Plus, 
  Minus, 
  Music, 
  Heart, 
  Shuffle, 
  SkipBack, 
  Play, 
  SkipForward, 
  Repeat, 
  Compass, 
  Search, 
  User, 
  Wifi, 
  Battery, 
  Bookmark, 
  ChevronDown,
  FileText
} from 'lucide-react';

export type DesignCategory = 'ui' | 'poster' | 'redbook' | '3d' | 'gif';
export type SidebarTab = 'templates' | 'layers' | 'brand';

export interface DesignTemplate {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export const DesignView: React.FC<{
  onSaveToMaterial?: (title: string, body: string) => void;
}> = ({ onSaveToMaterial }) => {
  const [category, setCategory] = useState<DesignCategory>('ui');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('templates');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showInspector, setShowInspector] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('为 Apple Vision Pro 设计一款带通透毛玻璃层叠的音乐空间流媒体卡片，带有悬浮播放按键与频谱波形');
  const [isGenerating, setIsGenerating] = useState(false);

  // Pro Inspector Parameters
  const [blurAmount, setBlurAmount] = useState(28);
  const [cornerRadius, setCornerRadius] = useState(32);
  const [spotlightAngle, setSpotlightAngle] = useState(65);
  const [ctrIntensity, setCtrIntensity] = useState(5);
  const [refractionIor, setRefractionIor] = useState(152);
  const [animationFps, setAnimationFps] = useState(24);
  const [selectedLora, setSelectedLoRA] = useState('apple-glass');

  // Dynamic Island HUD State
  const [islandTitle, setIslandTitle] = useState('智能画板就绪');
  const [islandRes, setIslandRes] = useState('iPhone 16 Pro (1179×2556)');
  const [islandFps, setIslandFps] = useState('60 FPS');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Switch Category
  const handleSwitchCategory = (cat: DesignCategory) => {
    setCategory(cat);
    const hudMap = {
      ui: { title: 'UI 界面设计工程', res: '393×852 pt (iPhone)', fps: '60 FPS' },
      poster: { title: '商业艺术海报模式', res: 'A3 300DPI (Print Ready)', fps: 'P3 Gamut' },
      redbook: { title: '小红书爆款图文视觉', res: '1242×1660 (3:4 High-CTR)', fps: 'Retina' },
      '3d': { title: '3D 空间拟物材质工作台', res: 'Ray Tracing / Octane', fps: 'PBR Material' },
      gif: { title: '动态帧与微交互动效', res: '512×512 (Alpha Loop)', fps: '24 FPS Loop' }
    };
    setIslandTitle(hudMap[cat].title);
    setIslandRes(hudMap[cat].res);
    setIslandFps(hudMap[cat].fps);
    showToast(`已切换至《${hudMap[cat].title}》画板`);
  };

  // Generate Design Action
  const handleGenerateDesign = () => {
    if (!aiPrompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setIslandTitle('Apple Diffusion Engine · 神经合成中...');
    setIslandFps('Step 18/28');

    setTimeout(() => {
      setIsGenerating(false);
      setIslandTitle('画板渲染完成');
      setIslandFps('98.5 分');
      showToast('✦ 画板渲染完成！Display P3 广色域已自动对齐');
    }, 1200);
  };

  // Export Action
  const handleTriggerExport = (formatName: string) => {
    setShowExportMenu(false);
    showToast(`正在打包 ${formatName} 资产并保存至本地与素材库...`);
    if (onSaveToMaterial) {
      onSaveToMaterial(`AI设计资产: ${category.toUpperCase()} 画板`, `导出格式: ${formatName} · 提示词: ${aiPrompt}\n包含 Display P3 色彩空间与 HIG 规范图层树`);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#0b0c10] text-slate-100 font-sans select-none relative">
      {/* Dynamic Toast */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#14151b]/95 border border-white/20 text-white text-xs font-semibold shadow-2xl flex items-center space-x-2 backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DYNAMIC ISLAND (TOP CENTER HUD) */}
      <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
        <div className="px-4 py-1.5 rounded-full bg-black/90 backdrop-blur-2xl text-white text-xs font-mono shadow-2xl flex items-center space-x-3 border border-white/15">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <div className="flex items-center space-x-1.5 font-sans">
            <span className="font-bold text-white/90">{islandTitle}</span>
            <span className="text-[10px] text-zinc-400">· Display P3 广色域</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono">
            <span>{islandRes}</span>
            <span>·</span>
            <span className="text-teal-300 font-bold">{islandFps}</span>
          </div>
        </div>
      </div>

      {/* TOP HEADER */}
      <header className="h-14 px-4 bg-[#14151b]/80 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between shrink-0 z-30 select-none">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="h-4 w-px bg-white/10 mx-1" />

          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
              
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white tracking-wide">Studio Craft Pro</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                  AI DESIGN
                </span>
              </div>
              <p className="text-[9px] text-zinc-400 font-mono">Apple Design System 2026</p>
            </div>
          </div>
        </div>

        {/* VisionOS Style Segmented Category Switcher */}
        <div className="hidden md:flex items-center bg-black/40 p-1 rounded-2xl border border-white/10 backdrop-blur-md text-xs font-medium">
          {[
            { id: 'ui', label: 'UI / 界面设计', icon: Layout, color: 'text-blue-400' },
            { id: 'poster', label: '商业海报', icon: ImageIcon, color: 'text-purple-400' },
            { id: 'redbook', label: '小红书 / 社媒', icon: Sparkles, color: 'text-rose-500' },
            { id: '3d', label: '3D 拟物素材', icon: Box, color: 'text-amber-400' },
            { id: 'gif', label: '动态 GIF / 表情', icon: Film, color: 'text-emerald-400' }
          ].map(cat => {
            const IconC = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => handleSwitchCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition ${
                  category === cat.id
                    ? 'bg-white/20 text-white font-bold shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <IconC className={`w-3.5 h-3.5 ${cat.color}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Actions & Export Dropdown */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowInspector(prev => !prev)}
            className={`p-2 rounded-xl border transition ${
              showInspector ? 'bg-white/20 border-white/20 text-white' : 'bg-white/5 border-white/10 text-zinc-400'
            }`}
            title="属性面板切换"
          >
            <SidebarIcon className="w-4 h-4" />
          </button>

          {/* Export Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(prev => !prev)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-xs font-bold text-white flex items-center space-x-1.5 shadow-md transition"
            >
              <Share className="w-3.5 h-3.5" />
              <span>导出工坊</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-11 w-56 rounded-2xl bg-[#181924]/95 border border-white/15 shadow-2xl p-2 z-50 text-xs space-y-1 backdrop-blur-2xl animate-in fade-in">
                <div className="px-2.5 py-1 text-[10px] text-zinc-400 font-mono uppercase tracking-wider">矢量与工程文件</div>
                <button onClick={() => handleTriggerExport('Figma JSON')} className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 flex items-center justify-between text-zinc-200">
                  <span>Figma 组件包 (.fig/json)</span>
                  <FileCode className="w-3.5 h-3.5 text-purple-400" />
                </button>
                <button onClick={() => handleTriggerExport('SVG Vector')} className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 flex items-center justify-between text-zinc-200">
                  <span>无损矢量 SVG (.svg)</span>
                  <PenTool className="w-3.5 h-3.5 text-amber-400" />
                </button>
                <div className="h-px bg-white/10 my-1" />
                <div className="px-2.5 py-1 text-[10px] text-zinc-400 font-mono uppercase tracking-wider">高保真位图与 3D</div>
                <button onClick={() => handleTriggerExport('16-Bit PNG')} className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 flex items-center justify-between text-zinc-200">
                  <span>Display P3 16-Bit PNG</span>
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                </button>
                <button onClick={() => handleTriggerExport('Alpha GIF')} className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 flex items-center justify-between text-zinc-200">
                  <span>透明通道动态 GIF / APNG</span>
                  <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                </button>
                <button onClick={() => handleTriggerExport('Apple USDZ 3D')} className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 flex items-center justify-between text-zinc-200">
                  <span>Apple 3D 资产 (.usdz / .gltf)</span>
                  <Box className="w-3.5 h-3.5 text-teal-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR */}
        <aside className="w-72 shrink-0 flex flex-col bg-[#121319]/90 border-r border-white/10 backdrop-blur-2xl z-20 select-none">
          <div className="p-2 border-b border-white/10 shrink-0">
            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl text-[11px] font-bold text-center">
              <button
                onClick={() => setSidebarTab('templates')}
                className={`py-1 rounded-lg transition ${sidebarTab === 'templates' ? 'bg-white/20 text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}
              >
                模板库
              </button>
              <button
                onClick={() => setSidebarTab('layers')}
                className={`py-1 rounded-lg transition ${sidebarTab === 'layers' ? 'bg-white/20 text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}
              >
                图层树
              </button>
              <button
                onClick={() => setSidebarTab('brand')}
                className={`py-1 rounded-lg transition ${sidebarTab === 'brand' ? 'bg-white/20 text-white shadow-xs' : 'text-zinc-400 hover:text-white'}`}
              >
                品牌资产
              </button>
            </div>
          </div>

          {sidebarTab === 'templates' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <span>{category.toUpperCase()} 设计规范与预设</span>
                  <span className="text-blue-400 font-mono">Apple Design Kit</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: 't1', title: 'visionOS 沉浸式流媒体卡片', desc: '通透层叠、高精度毛玻璃与悬浮控制' },
                    { id: 't2', title: 'iOS 18 灵动健康体征仪表', desc: '环形图、神经拟态与深色模式' },
                    { id: 't3', title: 'macOS Sequoia 悬浮控制中心', desc: '原生分段滑块与高质感图标' }
                  ].map(t => (
                    <div
                      key={t.id}
                      onClick={() => showToast(`已载入设计模板《${t.title}》`)}
                      className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/40 text-left transition cursor-pointer space-y-1"
                    >
                      <div className="font-bold text-white text-[11.5px]">{t.title}</div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* LoRA Model */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-white">
                  <span className="flex items-center space-x-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>视觉风格模型 (LoRA)</span>
                  </span>
                  <span className="text-[9px] font-mono text-teal-300">v2.4</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {[
                    { id: 'apple-glass', label: 'Apple 极简拟物' },
                    { id: 'neo-brutalist', label: '新野兽派排版' },
                    { id: 'cyber-3d', label: '3D 液态金属' },
                    { id: 'c4d-clay', label: 'C4D 柔和粘土' }
                  ].map(l => (
                    <button
                      key={l.id}
                      onClick={() => { setSelectedLoRA(l.id); showToast(`已设定风格 LoRA：${l.label}`); }}
                      className={`p-2 rounded-xl text-left font-bold transition ${
                        selectedLora === l.id ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {sidebarTab === 'layers' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">画板图层节点 (Layers)</div>
              {[
                { name: 'iOS 顶部状态栏 (Status Bar)', type: 'Status' },
                { name: '流媒体毛玻璃主体卡片 (Glass Card)', type: 'Container', active: true },
                { name: '专辑封面渐变层 (Album Cover)', type: 'Image' },
                { name: '音频波形频谱 (Spectrum)', type: 'Visualizer' },
                { name: '底部系统导航栏 (Tab Bar)', type: 'Navigation' }
              ].map((l, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                    l.active ? 'bg-blue-600/20 text-white border-blue-500/30 font-bold' : 'bg-white/5 border-white/5 text-zinc-400'
                  }`}
                >
                  <span className="text-[11px] truncate">{l.name}</span>
                  <span className="text-[9px] font-mono text-zinc-500">{l.type}</span>
                </div>
              ))}
            </div>
          )}

          {sidebarTab === 'brand' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Apple 系统标准色板 (P3)</div>
              <div className="grid grid-cols-4 gap-2">
                {['#0A84FF', '#BF5AF2', '#FF375F', '#30D158', '#FF9F0A', '#63E6E2', '#FF2442', '#000000'].map(c => (
                  <div
                    key={c}
                    onClick={() => showToast(`已全局复制 Display P3 色彩值：${c}`)}
                    className="h-8 rounded-xl border border-white/10 cursor-pointer hover:scale-105 transition shadow-xs"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* CENTRAL CANVAS AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0b0c10] relative overflow-hidden select-none">
          {/* Float Canvas Bar */}
          <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
            <div className="px-2 py-1 rounded-2xl bg-[#171820]/90 border border-white/10 shadow-xl flex items-center space-x-1 text-xs backdrop-blur-2xl">
              <button onClick={() => setZoomLevel(z => Math.max(40, z - 10))} className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-300">
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] font-bold text-white px-1">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(z => Math.min(200, z + 10))} className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-300">
                <Plus className="w-3.5 h-3.5" />
              </button>
              <div className="h-3 w-px bg-white/10 mx-1" />
              <button onClick={() => setZoomLevel(100)} className="px-2 py-1 rounded-xl hover:bg-white/10 text-zinc-300 text-[10px] font-mono">
                自适应 (1:1)
              </button>
            </div>

            <button
              onClick={() => setShowGrid(g => !g)}
              className={`px-3 py-1.5 rounded-2xl border text-xs flex items-center space-x-1.5 transition backdrop-blur-2xl ${
                showGrid ? 'bg-blue-600/30 text-white border-blue-500/40 font-bold' : 'bg-[#171820]/90 border-white/10 text-zinc-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-blue-400" />
              <span>构图辅助线</span>
            </button>
          </div>

          {/* AI Intelligence Glow Prompt Capsule Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-2xl">
            <div className="p-0.5 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl">
              <div className="p-2.5 rounded-[22px] bg-[#14151b] flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>

                <input
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="输入设计提示词..."
                  className="flex-1 bg-transparent text-xs md:text-sm text-white placeholder-zinc-500 outline-none font-sans"
                />

                <button
                  onClick={() => setAiPrompt('Apple Vision Pro 空间规范：超透双层毛玻璃、细微镜面反射、Display P3 霓虹光谱、极简排版')}
                  className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-purple-400 transition"
                  title="智能扩写 Prompt"
                >
                  <Wand className="w-4 h-4" />
                </button>

                <button
                  onClick={handleGenerateDesign}
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-xs font-bold text-white flex items-center space-x-1.5 shadow-md shrink-0 transition"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 fill-current" />}
                  <span>{isGenerating ? '神经合成中...' : '生成画板'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="flex-1 w-full h-full overflow-auto flex items-center justify-center p-12 transition-all">
            <div
              className="relative transition-all duration-300 select-none transform"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              {/* Golden Ratio Guide */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-30 border border-blue-500/40 grid grid-cols-3 grid-rows-3">
                  <div className="border-r border-b border-blue-500/20" />
                  <div className="border-r border-b border-blue-500/20" />
                  <div className="border-b border-blue-500/20" />
                  <div className="border-r border-b border-blue-500/20" />
                  <div className="border-r border-b border-blue-500/20" />
                  <div className="border-b border-blue-500/20" />
                </div>
              )}

              {/* ARTBOARD CONTENT BASED ON CATEGORY */}
              {category === 'ui' && (
                <div className="w-[380px] h-[680px] rounded-[36px] overflow-hidden shadow-2xl relative bg-[#0e0f14] border border-white/15 p-5 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>9:41</span>
                    <div className="w-20 h-4 rounded-full bg-black/80 border border-white/10 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <Wifi className="w-3 h-3" />
                      <Battery className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Player Card */}
                  <div className="my-auto p-5 rounded-[28px] bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-2xl space-y-4">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                      <div className="text-center space-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center border border-white/30">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-[11px] font-mono text-white/80">Spatial Audio · P3</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm tracking-wide text-white">Neural Symphony in G Minor</h4>
                        <p className="text-[11px] text-zinc-400">Apple Design Soundscape Orchestra</p>
                      </div>
                      <button className="p-2 rounded-full bg-white/10 text-pink-400">
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Shuffle className="w-4 h-4 text-zinc-400" />
                      <div className="flex items-center space-x-4">
                        <SkipBack className="w-5 h-5 fill-current" />
                        <button className="p-3.5 rounded-full bg-white text-black font-bold shadow-md">
                          <Play className="w-5 h-5 fill-current" />
                        </button>
                        <SkipForward className="w-5 h-5 fill-current" />
                      </div>
                      <Repeat className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>

                  <div className="h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-around px-4">
                    <Compass className="w-4 h-4 text-blue-400" />
                    <LayersIcon className="w-4 h-4 text-zinc-400" />
                    <Search className="w-4 h-4 text-zinc-400" />
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>
              )}

              {category === 'poster' && (
                <div className="w-[420px] h-[620px] rounded-[28px] overflow-hidden shadow-2xl relative bg-black border border-white/15 p-8 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between border-b border-white/20 pb-4 text-xs font-mono text-zinc-400">
                    <span>APPLE SPECIAL EVENT</span>
                    <span className="text-white font-bold">OCTOBER 2026</span>
                    <span>CUPERTINO, CA</span>
                  </div>

                  <div className="my-auto space-y-4 text-center z-10">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-white via-zinc-400 to-zinc-800 p-0.5 shadow-2xl mx-auto flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <span className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">M5</span>
                      </div>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                      Beyond<br /><span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">Boundaries.</span>
                    </h1>
                  </div>

                  <div className="border-t border-white/20 pt-4 grid grid-cols-3 gap-2 text-[10px] font-mono text-zinc-400">
                    <div><div className="text-white font-bold">128-CORE</div><div>Neural Pro</div></div>
                    <div><div className="text-white font-bold">4.8 TB/s</div><div>Bandwidth</div></div>
                    <div className="text-right text-blue-400 font-bold"> Apple Inc.</div>
                  </div>
                </div>
              )}

              {category === 'redbook' && (
                <div className="w-[390px] h-[520px] rounded-[28px] overflow-hidden shadow-2xl relative bg-gradient-to-b from-[#1E1F28] via-[#121319] to-[#0A0B0E] p-6 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#FF2442] text-white text-xs font-black shadow-lg flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>年度封神神器！建议收藏</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">01/05</span>
                  </div>

                  <div className="my-auto space-y-3">
                    <div className="inline-block px-2 py-0.5 rounded-md bg-amber-400 text-black text-[11px] font-bold">
                      设计师必看 · 效能提升 400%
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
                      苹果最新 AI 工具箱<br />
                      <span className="text-amber-300">彻底淘汰传统作图流程？</span>
                    </h2>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF2442] to-amber-500 flex items-center justify-center font-bold text-xs text-white">
                        Design
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">@极简设计研习社</div>
                        <div className="text-[9px] text-zinc-400">10w+ 点赞爆款模板制作人</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {category === '3d' && (
                <div className="w-[420px] h-[420px] rounded-[32px] overflow-hidden shadow-2xl bg-gradient-to-tr from-[#121319] via-[#1C1D26] to-[#0A0B0E] flex flex-col items-center justify-center relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-b from-white/30 via-white/10 to-transparent border border-white/40 shadow-2xl backdrop-blur-md relative flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 shadow-inner animate-pulse" />
                  </div>
                </div>
              )}

              {category === 'gif' && (
                <div className="w-[400px] h-[400px] rounded-[32px] overflow-hidden shadow-2xl bg-[#0c0d12] flex flex-col items-center justify-center relative">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/50 animate-ping" />
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-10 h-10 text-white animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-mono text-zinc-400 flex items-center space-x-1.5 whitespace-nowrap">
                <span>Display P3 广色域</span>
                <span>·</span>
                <span>{zoomLevel}% 放大率</span>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT PRO INSPECTOR PANEL */}
        {showInspector && (
          <aside className="w-80 shrink-0 flex flex-col bg-[#121319]/90 border-l border-white/10 p-4 space-y-4 text-xs overflow-y-auto z-20 select-none">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center space-x-2 font-bold text-white">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>专业设计参数调节台</span>
              </div>
              <span className="text-[9px] font-mono text-teal-300 px-1.5 py-0.5 rounded bg-teal-500/15 border border-teal-500/30">
                PRO ENGINE
              </span>
            </div>

            {/* Sliders based on category */}
            <div className="space-y-3">
              <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-zinc-300">毛玻璃虚化模糊 (Backdrop Blur):</span>
                  <span className="text-blue-400 font-bold">{blurAmount}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="64"
                  value={blurAmount}
                  onChange={e => setBlurAmount(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1 bg-white/10 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-zinc-300">连续曲率圆角 (Corner Radius):</span>
                  <span className="text-purple-300 font-bold">{cornerRadius}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="48"
                  value={cornerRadius}
                  onChange={e => setCornerRadius(Number(e.target.value))}
                  className="w-full accent-purple-400 h-1 bg-white/10 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* AI Composition Radar Score */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>视觉层级与审美评分</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">98.5 / 100</span>
              </div>

              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between text-zinc-400">
                  <span>黄金分割率贴合度</span>
                  <span className="text-white">99%</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '99%' }} />
                </div>

                <div className="flex justify-between text-zinc-400 pt-1">
                  <span>Apple HIG 间距合规性</span>
                  <span className="text-white">97%</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '97%' }} />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onSaveToMaterial) {
                  onSaveToMaterial(`AI设计模版: ${category.toUpperCase()}`, `设计提示词: ${aiPrompt}\n模糊参数: ${blurAmount}px · 圆角: ${cornerRadius}px`);
                }
                showToast('已存入素材知识库！');
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center justify-center space-x-1.5 text-xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>收录设计工程至素材库</span>
            </button>
          </aside>
        )}
      </div>
    </div>
  );
};
