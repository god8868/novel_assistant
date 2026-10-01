import React, { useState, useRef, useEffect } from 'react';
import { 
  Layout, 
  Plus, 
  Move, 
  Sparkles, 
  Maximize2, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Trash2, 
  MousePointer, 
  Hand, 
  Link2, 
  StickyNote, 
  Share2, 
  Tag, 
  X, 
  Check, 
  Sliders, 
  ChevronRight, 
  ArrowRight, 
  Grid, 
  Compass, 
  BookOpen, 
  Scale, 
  Layers, 
  User, 
  Bookmark, 
  RefreshCw,
  Eye,
  Minimize2
} from 'lucide-react';

export type NodeCategory = 'plot' | 'lore' | 'character' | 'promise' | 'sticky';

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  width: number;
  title: string;
  category: NodeCategory;
  content: string;
  color: string;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

const CATEGORY_CONFIG: Record<NodeCategory, { label: string; color: string; icon: any; desc: string }> = {
  plot: {
    label: '剧情主线',
    color: '#0a84ff',
    icon: Compass,
    desc: '核心事件、冲突转折与重大高潮'
  },
  lore: {
    label: '设定法则',
    color: '#bf5af2',
    icon: Layers,
    desc: '世界观规则、功法体系与反噬约束'
  },
  character: {
    label: '角色人物',
    color: '#30d158',
    icon: User,
    desc: '主角弧光、盟友交易与敌对势力'
  },
  promise: {
    label: '伏笔暗线',
    color: '#ff9f0a',
    icon: Bookmark,
    desc: '悬念钩子、关键物证与因果闭环'
  },
  sticky: {
    label: '灵感便签',
    color: '#ffd60a',
    icon: StickyNote,
    desc: '随手灵感碎片、待办备忘与即时批注'
  }
};

const APPLE_PALETTE = [
  '#0a84ff', // Apple Blue
  '#bf5af2', // Apple Purple
  '#30d158', // Apple Green
  '#ff9f0a', // Apple Orange
  '#ffd60a', // Apple Yellow
  '#ff375f', // Apple Pink/Red
  '#64d2ff', // Apple Teal
  '#8e8e93'  // Apple Gray
];

export const CanvasView: React.FC = () => {
  // Canvas Nodes & Links
  const [nodes, setNodes] = useState<CanvasNode[]>([
    {
      id: 'node-1',
      x: 80,
      y: 120,
      width: 250,
      title: '主线起点：黑风渡避祸',
      category: 'plot',
      content: '沈玄烛弹指破去鉴魂镜阵眼，与乔装商贾的柳清霜登上同一艘黑色灵梭飞舟。',
      color: '#0a84ff'
    },
    {
      id: 'node-2',
      x: 420,
      y: 70,
      width: 260,
      title: '核心法则：破妄真瞳',
      category: 'lore',
      content: '照彻天地气机死穴。严苛代价：每次全力施展不可超三息，否则双目如灼铁刺痛。',
      color: '#bf5af2'
    },
    {
      id: 'node-3',
      x: 420,
      y: 290,
      width: 260,
      title: '核心伏笔：云纹赤佩',
      category: 'promise',
      content: '校尉赵莽暗中佩戴刻有沈家灭门云纹徽记的古佩，牵扯十年前大裂纪血案。',
      color: '#ff9f0a'
    },
    {
      id: 'node-4',
      x: 780,
      y: 180,
      width: 260,
      title: '冲突爆发：大泽阴风遇袭',
      category: 'plot',
      content: '飞舟遭遇江中渊骨凶兽群围攻，赵莽借搜查隔间发难，沈玄烛与柳清霜被迫联手反杀。',
      color: '#30d158'
    },
    {
      id: 'node-5',
      x: 780,
      y: 400,
      width: 240,
      title: '随手灵感：飞舟货舱暗道',
      category: 'sticky',
      content: '在第四章结尾可安排柳清霜私运的“寒玉髓”在战斗中震碎微隙，恰好被主角吸纳止痛。',
      color: '#ffd60a'
    }
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { id: 'c-1', from: 'node-1', to: 'node-2', label: '破局手段' },
    { id: 'c-2', from: 'node-1', to: 'node-3', label: '目击线索' },
    { id: 'c-3', from: 'node-2', to: 'node-4', label: '能力代价' },
    { id: 'c-4', from: 'node-3', to: 'node-4', label: '杀机诱因' },
    { id: 'c-5', from: 'node-4', to: 'node-5', label: '危机巧合' }
  ]);

  // Canvas Viewport & Tool States
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [toolMode, setToolMode] = useState<'select' | 'pan' | 'connect'>('select');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-1');
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  // Dragging states
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Creation Dropdown Sheet
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | NodeCategory>('all');
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  // Two-Finger Trackpad Pinch-to-Zoom & Two-Finger Pan Gestures
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent browser native swipe back / page zoom
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Trackpad pinch-to-zoom (browser reports e.ctrlKey: true on pinch)
        const zoomDelta = -e.deltaY * 0.008;
        setScale(prevScale => {
          const newScale = Math.min(2.5, Math.max(0.35, prevScale * (1 + zoomDelta)));
          const rect = canvasEl.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          setPanOffset(prevPan => ({
            x: mouseX - (mouseX - prevPan.x) * (newScale / prevScale),
            y: mouseY - (mouseY - prevPan.y) * (newScale / prevScale)
          }));

          return newScale;
        });
      } else {
        // Trackpad two-finger swipe panning (or standard mouse wheel scroll)
        setPanOffset(prev => ({
          x: prev.x - e.deltaX * 1.05,
          y: prev.y - e.deltaY * 1.05
        }));
      }
    };

    // Multi-touch gestures (iPad / mobile touchscreens)
    let initialTouchDist = 0;
    let initialTouchScale = 1;
    let lastMidpoint = { x: 0, y: 0 };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialTouchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        initialTouchScale = scale;
        lastMidpoint = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialTouchDist > 0) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const currentMid = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };

        // Pinch zoom
        const factor = currentDist / initialTouchDist;
        const newScale = Math.min(2.5, Math.max(0.35, initialTouchScale * factor));
        setScale(newScale);

        // Two-finger pan
        const dx = currentMid.x - lastMidpoint.x;
        const dy = currentMid.y - lastMidpoint.y;
        setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMidpoint = currentMid;
      }
    };

    const handleTouchEnd = () => {
      initialTouchDist = 0;
    };

    canvasEl.addEventListener('wheel', handleWheel, { passive: false });
    canvasEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvasEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvasEl.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvasEl.removeEventListener('wheel', handleWheel);
      canvasEl.removeEventListener('touchstart', handleTouchStart);
      canvasEl.removeEventListener('touchmove', handleTouchMove);
      canvasEl.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scale]);

  // Mouse Interaction Handlers
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (toolMode === 'pan' || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    } else {
      setSelectedNodeId(null);
      setConnectingFromId(null);
    }
  };

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (toolMode === 'connect') {
      if (!connectingFromId) {
        setConnectingFromId(id);
      } else if (connectingFromId !== id) {
        // Create new connection
        const newConn: Connection = {
          id: `c-${Date.now()}`,
          from: connectingFromId,
          to: id,
          label: '关联推演'
        };
        setConnections(prev => [...prev, newConn]);
        setConnectingFromId(null);
        setToolMode('select');
      }
      return;
    }

    setSelectedNodeId(id);
    setDraggedNodeId(id);
    const node = nodes.find(n => n.id === id);
    if (node) {
      setDragOffset({
        x: (e.clientX / scale) - node.x,
        y: (e.clientY / scale) - node.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggedNodeId) {
      setNodes(prev => prev.map(n => {
        if (n.id === draggedNodeId) {
          return {
            ...n,
            x: Math.round((e.clientX / scale) - dragOffset.x),
            y: Math.round((e.clientY / scale) - dragOffset.y)
          };
        }
        return n;
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Add Classified Node
  const handleCreateNode = (category: NodeCategory) => {
    const cfg = CATEGORY_CONFIG[category];
    const newId = `node-${Date.now()}`;
    const newNode: CanvasNode = {
      id: newId,
      x: Math.round(200 - panOffset.x + (Math.random() * 80)),
      y: Math.round(180 - panOffset.y + (Math.random() * 80)),
      width: category === 'sticky' ? 220 : 260,
      title: `新${cfg.label}`,
      category,
      content: `在此输入${cfg.label}的详细推演与关键线索...`,
      color: cfg.color
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newId);
    setShowAddMenu(false);
  };

  // AI Brainstorming & Conflict Expansion
  const handleAiBrainstorm = () => {
    if (!selectedNode) {
      alert('请先在画布中点击选中一个起始节点');
      return;
    }
    const newId = `node-ai-${Date.now()}`;
    const newNode: CanvasNode = {
      id: newId,
      x: selectedNode.x + 320,
      y: selectedNode.y + 40,
      width: 260,
      title: `AI 推演：${selectedNode.title} 逆转分支`,
      category: 'plot',
      content: `基于“${selectedNode.title}”，暗藏的第三方中立势力（万宝仙盟暗舵）提前引爆阵法，主角被迫临时以眼疾为筹码谈判。`,
      color: '#bf5af2'
    };
    setNodes(prev => [...prev, newNode]);
    setConnections(prev => [...prev, { id: `c-${Date.now()}`, from: selectedNode.id, to: newId, label: '戏剧逆转' }]);
    setSelectedNodeId(newId);
    setAiNotice(`已成功基于【${selectedNode.title}】发散生成次级剧情冲突！`);
    setTimeout(() => setAiNotice(null), 3500);
  };

  // AI Foreshadowing / Promise Audit
  const handleAiCheckPromises = () => {
    const promises = nodes.filter(n => n.category === 'promise');
    const plots = nodes.filter(n => n.category === 'plot');
    setAiNotice(`✅ 伏笔闭环体检：当前画布已检测到 ${promises.length} 处埋设伏笔与 ${plots.length} 个核心情节节点，因果链接健全！`);
    setTimeout(() => setAiNotice(null), 4500);
  };

  // Auto Layout / Tidy Up
  const handleAutoLayout = () => {
    // Organize nodes sequentially
    setNodes(prev => {
      let curX = 80;
      let curY = 120;
      return prev.map((n, i) => {
        const updated = { ...n, x: curX, y: curY + (i % 2 === 0 ? 0 : 160) };
        if (i % 2 === 1) curX += 340;
        return updated;
      });
    });
    setPanOffset({ x: 0, y: 0 });
    setScale(1);
    setAiNotice('已为您自动对齐并智能整理画布网格节点！');
    setTimeout(() => setAiNotice(null), 2500);
  };

  // Filter nodes for display if filter is active
  const displayedNodes = nodes.filter(n => filterCategory === 'all' || n.category === filterCategory);

  return (
    <div 
      className="flex flex-col h-full w-full overflow-hidden bg-[var(--apple-bg)] select-none relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* ============================================================ */}
      {/* 1. TOP macOS TOOLBAR FOR FREEFORM CANVAS (无线画布专属顶栏) */}
      {/* ============================================================ */}
      <header className="h-[52px] border-b border-[var(--apple-border)] bg-[var(--apple-glass)] backdrop-blur-xl px-4 flex items-center justify-between shrink-0 select-none z-30">
        {/* Left Zone: Title, Scale & Node Count */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <Layout className="w-4 h-4 text-[var(--apple-accent)] shrink-0" />
            <span className="text-xs font-bold text-[var(--apple-text-primary)] truncate">
              无限画布 · 剧情脑图与法则脉络
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[var(--apple-text-secondary)] font-mono tabular-nums">
            <span>·</span>
            <span>{Math.round(scale * 100)}%</span>
            <span>·</span>
            <span>{nodes.length} 个节点 ({connections.length} 条因果连线)</span>
          </div>
        </div>

        {/* Center Zone: Functional Categorized Filter */}
        <div className="flex items-center gap-2">
          {/* Category Filter Segmented Control */}
          <div className="p-0.5 rounded-lg bg-[var(--apple-border)] flex items-center text-[11px] font-medium">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${filterCategory === 'all' ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs font-semibold' : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'}`}
            >
              全部节点 ({nodes.length})
            </button>
            {(Object.keys(CATEGORY_CONFIG) as NodeCategory[]).map(cat => {
              const cfg = CATEGORY_CONFIG[cat];
              const count = nodes.filter(n => n.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${filterCategory === cat ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs font-semibold' : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <span>{cfg.label} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Zone: AI Brainstorming & Inspector Toggle */}
        <div className="flex items-center gap-1.5">
          {/* AI Conflict Branching */}
          <button
            onClick={handleAiBrainstorm}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all shadow-xs"
            title="基于当前选中节点发散生成次级冲突分支"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI 次级冲突推演</span>
          </button>

          {/* AI Foreshadowing Check */}
          <button
            onClick={handleAiCheckPromises}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] transition-all"
            title="体检伏笔与主线因果闭环"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>伏笔闭环核验</span>
          </button>

          {/* Inspector Drawer Toggle */}
          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`p-1.5 rounded-lg border transition-all ${
              isInspectorOpen
                ? 'bg-[var(--apple-accent)] border-[var(--apple-accent)] text-white shadow-xs'
                : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
            }`}
            title="打开/关闭节点属性检查器"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. BODY INFINITE FREEFORM CANVAS & FLOATING CONTROLS */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Canvas Viewport */}
        <div 
          ref={canvasRef}
          onMouseDown={handleMouseDownCanvas}
          className={`flex-1 relative overflow-hidden bg-[radial-gradient(var(--apple-border)_1px,transparent_1px)] [background-size:24px_24px] ${
            toolMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : toolMode === 'connect' ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          {/* Canvas Transform Stage */}
          <div 
            style={{ 
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`, 
              transformOrigin: '0 0',
              width: '100%',
              height: '100%'
            }}
            className="relative"
          >
            {/* SVG Bezier Relationship Connectors */}
            <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none z-10 overflow-visible">
              <defs>
                <marker
                  id="apple-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--apple-accent)" opacity="0.8" />
                </marker>
              </defs>

              {connections.map((c) => {
                const fromNode = nodes.find(n => n.id === c.from);
                const toNode = nodes.find(n => n.id === c.to);
                if (!fromNode || !toNode) return null;

                const startX = fromNode.x + fromNode.width;
                const startY = fromNode.y + 42;
                const endX = toNode.x;
                const endY = toNode.y + 42;
                const deltaX = Math.max(40, Math.abs(endX - startX) * 0.5);

                const pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                return (
                  <g key={c.id}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="var(--apple-accent)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      markerEnd="url(#apple-arrow)"
                      className="opacity-70"
                    />
                    {c.label && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x="-32"
                          y="-10"
                          width="64"
                          height="20"
                          rx="6"
                          fill="var(--apple-surface)"
                          stroke="var(--apple-border)"
                          className="opacity-95 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all cursor-default"
                        />
                        <text
                          textAnchor="middle"
                          dy="3.5"
                          className="text-[9px] font-mono fill-[var(--apple-text-secondary)] select-none pointer-events-none"
                        >
                          {c.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Canvas Nodes (Categorized Cards) */}
            {displayedNodes.map(node => {
              const isSelected = node.id === selectedNodeId;
              const cfg = CATEGORY_CONFIG[node.category] || CATEGORY_CONFIG.plot;
              const CategoryIcon = cfg.icon;

              return (
                <div
                  key={node.id}
                  onMouseDown={e => handleMouseDownNode(e, node.id)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`
                  }}
                  className={`absolute rounded-2xl p-4.5 bg-[var(--apple-surface)]/95 backdrop-blur-xl border transition-all duration-200 ease-out z-20 select-text ${
                    isSelected
                      ? 'border-[var(--apple-accent)] shadow-[0_18px_42px_rgba(10,132,255,0.18),0_4px_12px_rgba(0,0,0,0.08)] ring-2 ring-[var(--apple-accent)] -translate-y-1 scale-[1.01]'
                      : 'border-[var(--apple-border)] shadow-[0_3px_12px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_18px_rgba(0,0,0,0.35)] hover:shadow-[0_14px_34px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.55)] hover:-translate-y-1 hover:border-[var(--apple-border-strong)]'
                  } ${toolMode === 'select' ? 'cursor-grab active:cursor-grabbing active:scale-[1.015] active:shadow-[0_22px_46px_rgba(0,0,0,0.2)]' : ''}`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: node.color }} 
                      />
                      <span className="text-[10px] font-mono uppercase font-semibold text-[var(--apple-text-tertiary)] flex items-center gap-1">
                        <CategoryIcon className="w-2.5 h-2.5" />
                        <span>{cfg.label}</span>
                      </span>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setNodes(prev => prev.filter(n => n.id !== node.id));
                        setConnections(prev => prev.filter(c => c.from !== node.id && c.to !== node.id));
                        if (selectedNodeId === node.id) setSelectedNodeId(null);
                      }}
                      className="text-[var(--apple-text-tertiary)] hover:text-rose-500 p-0.5 rounded transition-colors"
                      title="删除此卡片"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Title */}
                  <input
                    value={node.title}
                    onChange={e => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, title: val } : n));
                    }}
                    placeholder="卡片标题..."
                    className="w-full text-xs font-bold text-[var(--apple-text-primary)] bg-transparent border-b border-transparent hover:border-[var(--apple-border)] focus:border-[var(--apple-accent)] focus:outline-none mb-1.5 transition-colors"
                  />

                  {/* Content */}
                  <textarea
                    value={node.content}
                    onChange={e => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, content: val } : n));
                    }}
                    rows={3}
                    placeholder="输入详细推演内容..."
                    className="w-full text-[11px] leading-relaxed text-[var(--apple-text-secondary)] bg-transparent resize-none focus:outline-none"
                  />
                </div>
              );
            })}
          </div>

          {/* Floating AI Notification Toast */}
          {aiNotice && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-[var(--apple-surface)]/95 backdrop-blur-xl border border-[var(--apple-border)] px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs text-[var(--apple-text-primary)] animate-in fade-in slide-in-from-top-2 duration-150">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{aiNotice}</span>
            </div>
          )}

          {/* Floating macOS Freeform Island Toolbar (底部拟态控制胶囊岛) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[var(--apple-glass)] backdrop-blur-2xl border border-[var(--apple-border)] px-3 py-1.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)] hover:shadow-[0_16px_50px_rgba(0,0,0,0.22)] transition-shadow ring-1 ring-white/10">
            {/* Tool Mode Segmented Control */}
            <div className="flex items-center gap-0.5 bg-[var(--apple-border)] p-0.5 rounded-xl">
              <button
                onClick={() => { setToolMode('select'); setConnectingFromId(null); }}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  toolMode === 'select'
                    ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs'
                    : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
                }`}
                title="指针选择与拖动卡片 (V)"
              >
                <MousePointer className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setToolMode('pan'); setConnectingFromId(null); }}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  toolMode === 'pan'
                    ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs'
                    : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
                }`}
                title="抓手平移画布 (H)"
              >
                <Hand className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setToolMode('connect')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  toolMode === 'connect'
                    ? 'bg-[var(--apple-surface)] text-[var(--apple-accent)] shadow-xs'
                    : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
                }`}
                title="连线模式：依次点击两个节点建立因果链接 (L)"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-[var(--apple-border)]" />

            {/* Quick Add Categorized Node Button */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl bg-[var(--apple-accent)] text-white hover:bg-[var(--apple-accent-hover)] transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加卡片</span>
              </button>

              {/* Add Menu Popover */}
              {showAddMenu && (
                <div className="absolute bottom-11 left-0 w-52 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-2xl p-1.5 space-y-0.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] font-semibold text-[var(--apple-text-tertiary)] uppercase">
                    分门别类新建卡片
                  </div>
                  {(Object.keys(CATEGORY_CONFIG) as NodeCategory[]).map(cat => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCreateNode(cat)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-[var(--apple-subtle)] text-xs text-[var(--apple-text-primary)] text-left transition-colors"
                      >
                        <span className="p-1 rounded-md" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <div className="font-semibold text-xs">{cfg.label}</div>
                          <div className="text-[10px] text-[var(--apple-text-tertiary)] truncate">{cfg.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-[var(--apple-border)]" />

            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setScale(prev => Math.min(2.0, prev + 0.1))}
                className="p-1.5 rounded-lg text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-colors"
                title="放大 (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setScale(prev => Math.max(0.4, prev - 0.1))}
                className="p-1.5 rounded-lg text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-colors"
                title="缩小 (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setScale(1); setPanOffset({ x: 0, y: 0 }); }}
                className="p-1.5 rounded-lg text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-colors"
                title="还原 100% 视口"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-[var(--apple-border)]" />

            {/* Smart Auto Layout */}
            <button
              onClick={handleAutoLayout}
              className="p-1.5 rounded-lg text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition-colors"
              title="智能整理对齐画布节点"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. RIGHT INSPECTOR DRAWER (macOS 节点属性检查器) */}
        {/* ============================================================ */}
        {isInspectorOpen && (
          <aside className="w-80 border-l border-[var(--apple-border)] bg-[var(--apple-surface)] flex flex-col shrink-0 select-none animate-in slide-in-from-right duration-200">
            {/* Inspector Header */}
            <div className="h-[52px] px-4 border-b border-[var(--apple-separator)] flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
                <span>节点属性检查器</span>
              </span>
              <button 
                onClick={() => setIsInspectorOpen(false)} 
                className="text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inspector Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {selectedNode ? (
                <>
                  {/* Category Switcher */}
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--apple-text-secondary)] block mb-1.5">
                      分类归属
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(CATEGORY_CONFIG) as NodeCategory[]).map(cat => {
                        const cfg = CATEGORY_CONFIG[cat];
                        const isMatch = selectedNode.category === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => {
                              setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, category: cat, color: cfg.color } : n));
                            }}
                            className={`p-2 rounded-xl border text-left transition-all flex items-center gap-1.5 ${
                              isMatch
                                ? 'border-[var(--apple-accent)] bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)] font-semibold shadow-xs'
                                : 'border-[var(--apple-border)] bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                            <span className="text-[11px]">{cfg.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title Field */}
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--apple-text-secondary)] block mb-1">
                      节点标题
                    </label>
                    <input
                      value={selectedNode.title}
                      onChange={e => {
                        const val = e.target.value;
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, title: val } : n));
                      }}
                      className="w-full p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)]"
                    />
                  </div>

                  {/* Content Manuscript */}
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--apple-text-secondary)] block mb-1">
                      内容手稿与细节
                    </label>
                    <textarea
                      value={selectedNode.content}
                      onChange={e => {
                        const val = e.target.value;
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, content: val } : n));
                      }}
                      rows={5}
                      className="w-full p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] leading-relaxed resize-none focus:outline-none focus:border-[var(--apple-accent)]"
                    />
                  </div>

                  {/* Apple Color Palette */}
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--apple-text-secondary)] block mb-1.5">
                      高亮标色 (Apple Palette)
                    </label>
                    <div className="flex items-center gap-2">
                      {APPLE_PALETTE.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, color } : n));
                          }}
                          style={{ backgroundColor: color }}
                          className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                            selectedNode.color === color ? 'scale-110 ring-2 ring-offset-2 ring-[var(--apple-accent)]' : 'hover:scale-105'
                          }`}
                        >
                          {selectedNode.color === color && <Check className="w-3 h-3 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Connected Links Summary */}
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--apple-text-secondary)] block mb-1.5">
                      因果链条连接 ({connections.filter(c => c.from === selectedNode.id || c.to === selectedNode.id).length})
                    </label>
                    <div className="space-y-1.5">
                      {connections
                        .filter(c => c.from === selectedNode.id || c.to === selectedNode.id)
                        .map(c => {
                          const isFrom = c.from === selectedNode.id;
                          const otherNode = nodes.find(n => n.id === (isFrom ? c.to : c.from));
                          return (
                            <div 
                              key={c.id}
                              className="p-2 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs flex items-center justify-between"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[10px] text-[var(--apple-accent)] font-mono">
                                  {isFrom ? '指向 ➔' : '来自 ⬅'}
                                </span>
                                <span className="font-semibold truncate text-[var(--apple-text-primary)]">
                                  {otherNode?.title || '未知节点'}
                                </span>
                              </div>
                              <button
                                onClick={() => setConnections(prev => prev.filter(item => item.id !== c.id))}
                                className="text-[var(--apple-text-tertiary)] hover:text-rose-500 p-0.5"
                                title="断开连线"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Node Actions */}
                  <div className="pt-2 border-t border-[var(--apple-separator)] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setNodes(prev => prev.filter(n => n.id !== selectedNode.id));
                        setConnections(prev => prev.filter(c => c.from !== selectedNode.id && c.to !== selectedNode.id));
                        setSelectedNodeId(null);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>删除节点</span>
                    </button>

                    <button
                      onClick={handleAiBrainstorm}
                      className="px-3 py-1.5 rounded-lg bg-[var(--apple-accent)] text-white text-xs font-semibold flex items-center gap-1 shadow-xs hover:bg-[var(--apple-accent-hover)] transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>发散冲突分支</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-[var(--apple-text-tertiary)] space-y-2">
                  <Layout className="w-8 h-8 mx-auto opacity-40 text-[var(--apple-accent)]" />
                  <p className="text-xs">在画布中点击选中卡片以检视与编辑属性</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
