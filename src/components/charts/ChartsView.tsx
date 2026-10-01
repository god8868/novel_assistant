import React, { useState, useMemo, useRef } from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Sparkles, 
  Download, 
  Plus, 
  Activity, 
  TrendingUp,
  Table,
  Check,
  RotateCcw,
  SlidersHorizontal,
  BookmarkPlus,
  CheckCircle2,
  Copy,
  Send,
  FileText,
  Upload,
  Edit3,
  Trash2,
  Layers,
  Palette,
  Eye,
  Radio,
  Share2,
  ZoomIn,
  ZoomOut,
  Target,
  BarChart2,
  AreaChart,
  Bot,
  FileSpreadsheet,
  FileCode,
  CornerDownRight,
  Zap,
  CheckCircle,
  FileCheck,
  Split,
  ArrowRight,
  CornerUpLeft,
  X,
  Maximize2,
  Filter,
  ShieldCheck,
  Wand2,
  Sliders,
  Presentation,
  Database,
  Image as ImageIcon,
  Code
} from 'lucide-react';

export type StudioMode = 'storytelling' | 'forecasting' | 'pivot' | 'dashboard';
export type ChartType = 'area' | 'bar' | 'radar' | 'donut';
export type ColorTheme = 'cupertino' | 'sunset' | 'matrix' | 'titanium';

export interface DataItem {
  id: string;
  label: string;
  value: number;
  valueSecondary?: number;
  color?: string;
}

export interface ChartDataset {
  id: string;
  title: string;
  subtitle: string;
  unit: string;
  unitSecondary?: string;
  data: DataItem[];
  ciUpper?: number[];
  ciLower?: number[];
  monteCarlo?: number[];
}

const DATASETS: Record<string, ChartDataset> = {
  compute_spend: {
    id: 'compute_spend',
    title: '2026 全球智能算力支出与 ARR 净收入转化曲线',
    subtitle: '单位：十亿美元 ($B) · 滞后相关系数 r = 0.884 (高显著相关)',
    unit: '十亿美元 ($B)',
    unitSecondary: 'ARR 软件收入',
    data: [
      { id: '1', label: '2025 Q1', value: 110, valueSecondary: 45, color: '#0a84ff' },
      { id: '2', label: '2025 Q2', value: 145, valueSecondary: 62, color: '#0a84ff' },
      { id: '3', label: '2025 Q3', value: 195, valueSecondary: 94, color: '#0a84ff' },
      { id: '4', label: '2025 Q4', value: 260, valueSecondary: 150, color: '#0a84ff' },
      { id: '5', label: '2026 Q1', value: 320, valueSecondary: 240, color: '#0a84ff' },
      { id: '6', label: '2026 Q2', value: 395, valueSecondary: 360, color: '#0a84ff' },
      { id: '7', label: '2026 Q3 (E)', value: 460, valueSecondary: 485, color: '#0a84ff' },
      { id: '8', label: '2026 Q4 (E)', value: 520, valueSecondary: 610, color: '#0a84ff' }
    ],
    ciUpper: [115, 152, 208, 280, 350, 435, 515, 595],
    ciLower: [105, 138, 182, 240, 290, 355, 410, 455],
    monteCarlo: [460, 480, 510, 545, 580, 620, 665, 710]
  },
  novel_retention: {
    id: 'novel_retention',
    title: '长篇小说读者留存生命周期与付费转化漏斗',
    subtitle: '基于百万字玄幻网文章节留存 (N=142,000 读者)',
    unit: '% 留存率',
    unitSecondary: '客单价 (¥)',
    data: [
      { id: '1', label: '第1章(入坑)', value: 100, valueSecondary: 0, color: '#bf5af2' },
      { id: '2', label: '第5章(冲突)', value: 88, valueSecondary: 2.5, color: '#bf5af2' },
      { id: '3', label: '第15章(逆袭)', value: 76, valueSecondary: 6.8, color: '#bf5af2' },
      { id: '4', label: '第30章(大比)', value: 69, valueSecondary: 14.2, color: '#bf5af2' },
      { id: '5', label: '第50章(付费)', value: 54, valueSecondary: 48.5, color: '#bf5af2' },
      { id: '6', label: '第100章(高潮)', value: 48, valueSecondary: 89.0, color: '#bf5af2' }
    ],
    ciUpper: [100, 92, 82, 75, 60, 53],
    ciLower: [100, 84, 70, 64, 48, 42],
    monteCarlo: [100, 86, 74, 66, 52, 45]
  },
  hardware_power: {
    id: 'hardware_power',
    title: '端侧芯片 TOPS/Watt 能效比与 TTFT 首字延时对比',
    subtitle: '多维极坐标对比测试：Apple M5 vs. 工业加速卡',
    unit: '指数',
    data: [
      { id: '1', label: '8-bit 能效比', value: 96, valueSecondary: 78, color: '#30d158' },
      { id: '2', label: 'TTFT 首字延迟', value: 92, valueSecondary: 85, color: '#30d158' },
      { id: '3', label: '长上下文稳定性', value: 98, valueSecondary: 76, color: '#30d158' },
      { id: '4', label: '内存带宽 (TB/s)', value: 94, valueSecondary: 82, color: '#30d158' },
      { id: '5', label: 'PUE 散热系数', value: 95, valueSecondary: 68, color: '#30d158' },
      { id: '6', label: '成本收益率', value: 88, valueSecondary: 74, color: '#30d158' }
    ]
  }
};

const THEME_PALETTES: Record<ColorTheme, { primary: string; secondary: string; accent: string; label: string }> = {
  cupertino: { primary: '#0a84ff', secondary: '#63e6e2', accent: '#bf5af2', label: 'Cupertino Classic' },
  sunset: { primary: '#ff9f0a', secondary: '#ff375f', accent: '#bf5af2', label: 'Neon Sunset' },
  matrix: { primary: '#30d158', secondary: '#63e6e2', accent: '#0a84ff', label: 'Bionic Mint' },
  titanium: { primary: '#e3e3e8', secondary: '#8e8e93', accent: '#0a84ff', label: 'Titanium Grey' }
};

export const ChartsView: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  const [studioMode, setStudioMode] = useState<StudioMode>('storytelling');
  const [activeDatasetKey, setActiveDatasetKey] = useState<string>('compute_spend');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [themePalette, setThemePalette] = useState<ColorTheme>('cupertino');

  // Overlays
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);
  const [showConfidenceBand, setShowConfidenceBand] = useState(true);
  const [isLogScale, setIsLogScale] = useState(false);

  // Inspector Sliders
  const [montePaths, setMontePaths] = useState(5000);
  const [maWindow, setMaWindow] = useState(7);
  const [showInspector, setShowInspector] = useState(true);

  // AI Prompt
  const [aiPrompt, setAiPrompt] = useState('分析算力支出与营收滞后相关性，绘制双轴平滑面积图，并开启 95% 置信区间预测');
  const [isGenerating, setIsGenerating] = useState(false);

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const activeDataset = DATASETS[activeDatasetKey] || DATASETS.compute_spend;
  const activePalette = THEME_PALETTES[themePalette];

  const maxValue = useMemo(() => {
    return Math.max(...activeDataset.data.map(d => Math.max(d.value, d.valueSecondary || 0))) * 1.15;
  }, [activeDataset]);

  const handleGenerateFromPrompt = () => {
    if (!aiPrompt.trim() || isGenerating) return;
    setIsGenerating(true);
    showToast('✦ Apple Neural Engine 正在拟合高维回归并重构图表...');

    setTimeout(() => {
      if (aiPrompt.includes('雷达')) setChartType('radar');
      else if (aiPrompt.includes('柱状')) setChartType('bar');
      else if (aiPrompt.includes('环')) setChartType('donut');
      else setChartType('area');

      setIsGenerating(false);
      showToast('图表重构完毕！已融合统计学洞察与平滑预测带');
    }, 700);
  };

  const handleExportChart = (format: string) => {
    const title = activeDataset.title;
    const body = `图表可视化分析:\n- 课题: ${title}\n- 类型: ${chartType.toUpperCase()}\n- 指标数: ${activeDataset.data.length} 组序列\n- 建议结论: CAPEX 算力投资增长呈现显著滞后效应，二次曲线拟合优度 R² 达 0.931`;
    
    showToast(`已导出 ${format.toUpperCase()} 高清图表文件，并保存至素材库！`);
    if (onSaveToMaterial) {
      onSaveToMaterial(title, body);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#0d0e12] text-slate-100 font-sans select-none relative">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#181924]/95 border border-white/20 text-white text-xs font-semibold shadow-2xl flex items-center space-x-2 backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DYNAMIC ISLAND TOP STATUS PILL */}
      <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
        <div className="px-4 py-1.5 rounded-full bg-black/90 backdrop-blur-2xl text-white text-xs font-mono shadow-2xl flex items-center space-x-3 border border-white/15">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400" />
          </span>
          <div className="flex items-center space-x-1.5 font-sans">
            <span className="font-bold text-white/90">{activeDataset.title.slice(0, 18)}...</span>
            <span className="text-[10px] text-zinc-400">· 置信度 99.4%</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono">
            <span className="text-blue-400 font-bold">1,248 行 × 16 列</span>
            <span>·</span>
            <span className="text-emerald-400 font-bold">GPU 加速</span>
          </div>
        </div>
      </div>

      {/* TOP HEADER */}
      <header className="h-14 px-4 bg-[#16171e]/80 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between shrink-0 z-30 select-none">
        <div className="flex items-center space-x-3.5">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-teal-500/20 text-teal-300">
              <LineChart className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-tight">Numbers Intelligence Pro</span>
              <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">AI Data & Visualization Studio</span>
            </div>
          </div>
        </div>

        {/* VisionOS Segmented Mode Switcher */}
        <div className="hidden lg:flex items-center p-1 bg-black/40 rounded-2xl border border-white/10 text-xs font-medium">
          {[
            { id: 'storytelling', label: 'AI 智能图表透视', icon: Sparkles, color: 'text-teal-300' },
            { id: 'forecasting', label: '时序预测与蒙特卡洛', icon: TrendingUp, color: 'text-blue-400' },
            { id: 'pivot', label: '多维交叉与数据清洗', icon: Table, color: 'text-purple-400' },
            { id: 'dashboard', label: '仪表盘大屏', icon: Activity, color: 'text-amber-400' }
          ].map(m => {
            const IconC = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => { setStudioMode(m.id as any); showToast(`已切换至【${m.label}】模式`); }}
                className={`px-3 py-1 rounded-xl flex items-center space-x-1.5 transition ${
                  studioMode === m.id ? 'bg-white/20 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <IconC className={`w-3.5 h-3.5 ${m.color}`} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => showToast('已执行 3σ 异常极值清洗与缺失值插补')}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-bold flex items-center space-x-1.5 transition"
          >
            <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">智能清洗</span>
          </button>

          <button
            onClick={() => setShowInspector(prev => !prev)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
            title="图表调优"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleExportChart('png')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-95 text-xs font-bold text-white flex items-center space-x-1.5 shadow-md transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>导出高清图表</span>
          </button>
        </div>
      </header>

      {/* MAIN STUDIO WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR: DATASETS CATALOG */}
        <aside className="w-72 bg-[#121318]/90 border-r border-white/10 backdrop-blur-2xl flex flex-col p-3.5 space-y-4 shrink-0 overflow-y-auto select-none z-20">
          <div
            onClick={() => showToast('已唤起本地文件窗口，支持上传 CSV/JSON/Excel')}
            className="border-2 border-dashed border-white/15 hover:border-teal-400/60 rounded-2xl p-3 text-center cursor-pointer transition group"
          >
            <div className="w-8 h-8 rounded-full bg-teal-500/15 text-teal-300 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-white">上传数据集文件</p>
            <p className="text-[10px] text-zinc-400 font-mono">CSV / JSON / Excel (Max 50MB)</p>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between px-1 text-[11px] font-bold text-zinc-400">
              <span>活跃商业与科研数据集</span>
              <span className="text-teal-300 font-mono">3 可用</span>
            </div>

            {Object.keys(DATASETS).map(key => {
              const ds = DATASETS[key];
              const isSelected = key === activeDatasetKey;
              return (
                <div
                  key={key}
                  onClick={() => { setActiveDatasetKey(key); showToast(`已加载数据集《${ds.title}》`); }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition space-y-1 ${
                    isSelected ? 'bg-white/15 border-teal-500/50 shadow-md font-bold text-white' : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-400'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="truncate">{ds.title}</span>
                    {isSelected && <span className="text-[9px] font-mono text-teal-300 font-bold">ACTIVE</span>}
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-1">{ds.subtitle}</p>
                </div>
              );
            })}
          </div>

          {/* AI Hygiene Operations */}
          <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
            <span className="text-[11px] font-bold text-zinc-400">数据治理与清洗管道</span>
            <div className="space-y-1.5 text-xs">
              <button onClick={() => showToast('已清理 14 组离群异常值点')} className="w-full p-2 rounded-xl bg-white/5 hover:bg-white/10 text-left text-zinc-300 flex justify-between">
                <span>3σ 异常点剔除</span>
                <span className="text-[9px] text-zinc-500 font-mono">14 点</span>
              </button>
              <button onClick={() => showToast('已按 Spline 样条插补完成缺失补全')} className="w-full p-2 rounded-xl bg-white/5 hover:bg-white/10 text-left text-zinc-300 flex justify-between">
                <span>缺失值智能样条插补</span>
                <span className="text-[9px] text-zinc-500 font-mono">Spline</span>
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER MAIN CANVAS */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative p-4 space-y-3 select-none">
          {/* Chart Type Pills */}
          <div className="flex items-center justify-between shrink-0 bg-[#16171e]/90 backdrop-blur-2xl rounded-2xl px-3.5 py-2 border border-white/10">
            <div className="flex items-center space-x-1 text-xs">
              {[
                { id: 'area', label: '平滑折线面积图', icon: AreaChart, color: 'text-teal-300' },
                { id: 'bar', label: '堆叠对比柱状图', icon: BarChart2, color: 'text-blue-400' },
                { id: 'radar', label: '双轴极坐标雷达', icon: Target, color: 'text-purple-400' },
                { id: 'donut', label: '环形结构分布', icon: PieChart, color: 'text-amber-400' }
              ].map(t => {
                const IconC = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setChartType(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition ${
                      chartType === t.id ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <IconC className={`w-3.5 h-3.5 ${t.color}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => { setShowMonteCarlo(p => !p); showToast(showMonteCarlo ? '已关闭蒙特卡洛预测带' : '已激活 5,000 次蒙特卡洛随机预测带'); }}
                className={`px-2.5 py-1 rounded-xl border transition ${
                  showMonteCarlo ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold' : 'bg-white/5 border-white/10 text-zinc-300'
                }`}
              >
                蒙特卡洛预测带
              </button>
              <button
                onClick={() => setShowConfidenceBand(p => !p)}
                className={`px-2.5 py-1 rounded-xl border transition ${
                  showConfidenceBand ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' : 'bg-white/5 border-white/10 text-zinc-300'
                }`}
              >
                95% 置信区间
              </button>
            </div>
          </div>

          {/* Interactive Visual Chart Box */}
          <div className="flex-1 bg-[#181920]/80 border border-white/10 rounded-3xl p-5 flex flex-col relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">{activeDataset.title}</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">{activeDataset.subtitle}</p>
              </div>
              <div className="flex items-center space-x-3 text-right font-mono text-[11px]">
                <div>
                  <span className="text-zinc-500 text-[10px] block">峰值增长 (Peak YoY)</span>
                  <span className="text-emerald-400 font-bold">+142.8%</span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <span className="text-zinc-500 text-[10px] block">边际回报 (ROIC)</span>
                  <span className="text-teal-300 font-bold">3.42x</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Chart Rendering */}
            <div className="flex-1 w-full h-full relative flex items-end pb-6 pt-4 px-4 overflow-hidden">
              {chartType === 'bar' ? (
                <div className="w-full h-full flex items-end justify-between gap-3">
                  {activeDataset.data.map((item, idx) => {
                    const pctA = (item.value / maxValue) * 100;
                    const pctB = item.valueSecondary ? (item.valueSecondary / maxValue) * 100 : 0;
                    return (
                      <div key={item.id} className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer">
                        <div className="w-full max-w-[40px] flex items-end space-x-1 h-full justify-center">
                          <div
                            className="w-1/2 rounded-t-lg transition-all duration-300"
                            style={{ height: `${pctA}%`, backgroundColor: activePalette.primary }}
                          />
                          {item.valueSecondary && (
                            <div
                              className="w-1/2 rounded-t-lg transition-all duration-300"
                              style={{ height: `${pctB}%`, backgroundColor: activePalette.secondary }}
                            />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 mt-2 truncate max-w-[60px]">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full h-full relative flex flex-col justify-end">
                  {/* Smooth Area Curve Visualization */}
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 800 240" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={activePalette.primary} stopOpacity="0.45" />
                        <stop offset="100%" stopColor={activePalette.primary} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Confidence Band Polygon */}
                    {showConfidenceBand && activeDataset.ciUpper && activeDataset.ciLower && (
                      <polygon
                        points={activeDataset.data.map((_, i) => {
                          const x = (i / (activeDataset.data.length - 1)) * 800;
                          const y = 220 - (activeDataset.ciUpper![i] / maxValue) * 200;
                          return `${x},${y}`;
                        }).concat(activeDataset.data.map((_, i) => {
                          const revIdx = activeDataset.data.length - 1 - i;
                          const x = (revIdx / (activeDataset.data.length - 1)) * 800;
                          const y = 220 - (activeDataset.ciLower![revIdx] / maxValue) * 200;
                          return `${x},${y}`;
                        })).join(' ')}
                        fill={activePalette.primary}
                        fillOpacity="0.12"
                      />
                    )}

                    {/* Area Polygon */}
                    <polygon
                      points={`0,220 ` + activeDataset.data.map((d, i) => {
                        const x = (i / (activeDataset.data.length - 1)) * 800;
                        const y = 220 - (d.value / maxValue) * 200;
                        return `${x},${y}`;
                      }).join(' ') + ` 800,220`}
                      fill="url(#chartGrad)"
                    />

                    {/* Main Line */}
                    <polyline
                      fill="none"
                      stroke={activePalette.primary}
                      strokeWidth="3"
                      points={activeDataset.data.map((d, i) => {
                        const x = (i / (activeDataset.data.length - 1)) * 800;
                        const y = 220 - (d.value / maxValue) * 200;
                        return `${x},${y}`;
                      }).join(' ')}
                    />

                    {/* Secondary Line */}
                    {activeDataset.data[0].valueSecondary && (
                      <polyline
                        fill="none"
                        stroke={activePalette.secondary}
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        points={activeDataset.data.map((d, i) => {
                          const x = (i / (activeDataset.data.length - 1)) * 800;
                          const y = 220 - ((d.valueSecondary || 0) / maxValue) * 200;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                    )}
                  </svg>

                  {/* X Axis Labels */}
                  <div className="w-full flex justify-between text-[10px] font-mono text-zinc-400 pt-2 border-t border-white/10">
                    {activeDataset.data.map(d => (
                      <span key={d.id}>{d.label}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Executive Brief Insights */}
            <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center space-x-1.5 mb-1 text-teal-300 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Apple Intelligence 图表故事化洞察 (Executive Brief)</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                数据显示，企业 CAPEX 算力采购在 Q3 突破 $320B 节点后，次季度 ARR 净软件收益呈现 2.8 个月的脉冲式激增，滞后相关系数达 0.884。
              </p>
            </div>
          </div>

          {/* AI Prompt Rainbow Capsule */}
          <div className="p-0.5 rounded-2xl bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 shadow-xl">
            <div className="px-3.5 py-2.5 bg-[#16171e] rounded-[14px] flex items-center justify-between text-xs space-x-3">
              <div className="flex items-center space-x-2 flex-1">
                <Bot className="w-4 h-4 text-teal-300 shrink-0" />
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="对图表输入自然语言指令..."
                  className="w-full bg-transparent text-white placeholder-zinc-500 outline-none text-xs"
                />
              </div>

              <button
                onClick={handleGenerateFromPrompt}
                disabled={isGenerating}
                className="px-3.5 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition shadow-sm shrink-0"
              >
                <span>{isGenerating ? '神经网络分析中...' : '生成图表'}</span>
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT PRO INSPECTOR PANEL */}
        {showInspector && (
          <aside className="w-80 bg-[#121318]/90 border-l border-white/10 p-4 space-y-4 text-xs overflow-y-auto z-20 select-none shrink-0">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-teal-300" />
                <span>图表专业参数与数学模型</span>
              </span>
              <button onClick={() => setShowInspector(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Theme System Selector */}
            <div className="space-y-1.5">
              <span className="text-zinc-400 text-[11px] font-bold">Apple 配色主题 (Color System)</span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                {Object.keys(THEME_PALETTES).map(key => {
                  const pal = THEME_PALETTES[key as ColorTheme];
                  const isSelected = themePalette === key;
                  return (
                    <button
                      key={key}
                      onClick={() => { setThemePalette(key as any); showToast(`已设定主题: ${pal.label}`); }}
                      className={`p-2 rounded-xl text-left font-bold transition ${
                        isSelected ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      {pal.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Math Controls */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-zinc-400">蒙特卡洛推演路径:</span>
                  <span className="text-teal-300 font-bold">{montePaths.toLocaleString()} Paths</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="500"
                  value={montePaths}
                  onChange={e => setMontePaths(Number(e.target.value))}
                  className="w-full accent-teal-400 h-1 bg-white/10 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-zinc-400">滑动均线窗口:</span>
                  <span className="text-purple-300 font-bold">MA-{maWindow}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={maWindow}
                  onChange={e => setMaWindow(Number(e.target.value))}
                  className="w-full accent-purple-400 h-1 bg-white/10 rounded cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (onSaveToMaterial) {
                  onSaveToMaterial(`AI图表分析: ${activeDataset.title}`, `指标分析结论: ${activeDataset.subtitle}\n分类: ${chartType.toUpperCase()} · 配色: ${activePalette.label}`);
                }
                showToast('已存入素材知识库！');
              }}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center justify-center space-x-1.5 text-xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>收录图表工程至素材库</span>
            </button>
          </aside>
        )}
      </div>
    </div>
  );
};
