import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Zap, Crown, Sparkles, Clock, ArrowUpRight, ShieldAlert, ChevronRight, BookOpen } from 'lucide-react';
import { LoreEntry } from './novel_types.ts';

interface PowerIndexChartProps {
  realmEntries: LoreEntry[];
  selectedRealmId: string | null;
  onSelectRealm: (realmId: string, openInspector?: boolean) => void;
}

// Helper to parse lifespan text to numerical years
function parseLifespanToYears(text?: string): number {
  if (!text) return 100;
  const numMatch = text.match(/\d+/);
  if (!numMatch) return 100;
  const num = parseInt(numMatch[0]);
  if (text.includes('万年')) return num * 10000;
  if (text.includes('千年') || text.includes('千')) return num * 1000;
  if (text.includes('同寿') || text.includes('无尽') || text.includes('永恒')) return 100000;
  return num;
}

// Helper to calculate exponential/log power index based on realm rank
function calculatePowerIndex(rank: number, powerScale?: string): number {
  const base = Math.pow(2.8, rank) * 10;
  if (powerScale?.includes('歼星') || powerScale?.includes('星辰')) return base * 3;
  if (powerScale?.includes('崩山') || powerScale?.includes('断海')) return base * 1.5;
  return Math.round(base);
}

export const PowerIndexChart: React.FC<PowerIndexChartProps> = ({
  realmEntries,
  selectedRealmId,
  onSelectRealm
}) => {
  // Sort and build chart data
  const chartData = useMemo(() => {
    const sorted = [...realmEntries].sort((a, b) => (a.specs.realmRank || 1) - (b.specs.realmRank || 1));
    
    return sorted.map((entry, index) => {
      const rank = entry.specs.realmRank || (index + 1);
      const lifespan = parseLifespanToYears(entry.specs.lifespanLimit);
      const powerIndex = calculatePowerIndex(rank, entry.specs.powerScale);
      
      const shortName = entry.name.replace(/（.*?）|\(.*?\)/g, '').split('·')[1]?.trim() || 
                        entry.name.split('·')[0]?.trim() || 
                        `Rank ${rank}`;

      return {
        id: entry.id,
        rank,
        name: entry.name,
        shortName: `R${rank} ${shortName}`,
        powerIndex,
        lifespan,
        powerScaleText: entry.specs.powerScale || '常规破坏力',
        lifespanText: entry.specs.lifespanLimit || `${lifespan}年`,
        inviolableLaw: entry.specs.inviolableLaw || '跨阶战斗无绝对免伤',
        isSelected: entry.id === selectedRealmId
      };
    });
  }, [realmEntries, selectedRealmId]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="p-5 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--apple-separator)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
              <span>战力与寿元演进图表 (Power & Lifespan Evolution Matrix)</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                双轴交互演进
              </span>
            </h3>
            <p className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">
              直观呈现各境界破坏力尺度与寿元上限的指数级跃迁，点击数据节点可直达该境界详情与防线法则。
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/80" />
            <span>破坏力指数 (Power Index)</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/40" />
            <span>寿元演进上限 (年)</span>
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload[0]) {
                const item = state.activePayload[0].payload;
                if (item && item.id) {
                  onSelectRealm(item.id, true);
                }
              }
            }}
          >
            <defs>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.5} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.07)" 
              vertical={false} 
            />

            {/* X-Axis */}
            <XAxis 
              dataKey="shortName" 
              stroke="#71717A" 
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />

            {/* Left Y-Axis: Power Index */}
            <YAxis 
              yAxisId="left"
              stroke="#60A5FA" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
            />

            {/* Right Y-Axis: Lifespan Years */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#FBBF24" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => val >= 10000 ? `${(val / 10000).toFixed(0)}万年` : `${val}年`}
            />

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-3.5 rounded-xl bg-[#18181D]/95 border border-white/20 shadow-2xl backdrop-blur-xl text-xs space-y-2 min-w-[230px]">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>{data.name}</span>
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                          Rank {data.rank}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between text-blue-300">
                          <span>破坏力尺度:</span>
                          <span className="font-bold text-white">{data.powerScaleText}</span>
                        </div>
                        <div className="flex justify-between text-amber-300">
                          <span>寿元演进上限:</span>
                          <span className="font-bold text-white">{data.lifespanText}</span>
                        </div>
                        <div className="flex justify-between text-purple-300">
                          <span>战力综合指数:</span>
                          <span className="font-bold text-white">{data.powerIndex.toLocaleString()} Pt</span>
                        </div>
                      </div>

                      {data.inviolableLaw && (
                        <div className="pt-1.5 border-t border-white/10 text-[10px] text-rose-300 leading-tight">
                          <div className="flex items-center gap-1 font-bold text-rose-400 mb-0.5">
                            <ShieldAlert className="w-3 h-3" />
                            <span>不可逾越硬防线:</span>
                          </div>
                          <span>{data.inviolableLaw}</span>
                        </div>
                      )}

                      <div className="pt-1 text-[10px] text-amber-400 font-semibold text-center flex items-center justify-center gap-1 bg-amber-500/10 py-1 rounded-lg border border-amber-500/20">
                        <span>点击直接导航至该境界详情卡片</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Power Area Shadow */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="powerIndex"
              fill="url(#powerGradient)"
              stroke="none"
            />

            {/* Power Bars */}
            <Bar
              yAxisId="left"
              dataKey="powerIndex"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={38}
              cursor="pointer"
            />

            {/* Lifespan Curve Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="lifespan"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ fill: '#F59E0B', r: 4, strokeWidth: 2, stroke: '#18181D' }}
              activeDot={{ r: 7, fill: '#EF4444', stroke: '#FFF', strokeWidth: 2 }}
              cursor="pointer"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Navigation Quick Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-[var(--apple-separator)] text-[10px] font-mono">
        <span className="text-zinc-500 shrink-0 flex items-center gap-1">
          <BookOpen className="w-3 h-3 text-amber-500" />
          <span>境界直达导航:</span>
        </span>
        {chartData.map(d => (
          <button
            key={d.id}
            onClick={() => onSelectRealm(d.id, true)}
            className={`px-2 py-0.5 rounded-lg border transition shrink-0 cursor-pointer flex items-center gap-1 ${
              d.isSelected 
                ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-xs' 
                : 'bg-[var(--apple-subtle)] text-zinc-400 hover:text-white hover:bg-[var(--apple-border)] border-[var(--apple-border)]'
            }`}
          >
            <span>Rank {d.rank}</span>
            <span className="opacity-80">·</span>
            <span>{d.name.split('·')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
