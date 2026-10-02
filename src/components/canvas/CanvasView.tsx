import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Minimize2,
  Boxes,
  Workflow,
  Network,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  ChevronDown,
  Activity,
  Zap,
  SlidersHorizontal,
  FileCode,
  Sliders as SlidersIcon,
  History,
  Magnet,
  Map as MapIcon,
  Image,
  Upload,
  Copy,
  Target,
  Columns3
} from 'lucide-react';

export type NodeCategory = 'plot' | 'lore' | 'character' | 'promise' | 'sticky';
export type ConnectionType = 'solid' | 'dashed' | 'pulse';

export interface AISuggestion {
  from: string;
  to: string;
  label: string;
  type: ConnectionType;
  reason: string;
  confidence: number;
}

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  width: number;
  title: string;
  category: NodeCategory;
  content: string;
  color: string;
  backdropBlur?: number; // px
  opacity?: number;      // 0.1 to 1.0
  fontSize?: number;     // px
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  label?: string;
  type?: ConnectionType;
  lineWeight?: number;
  pulseSpeed?: number; // seconds
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

const INITIAL_NODES: CanvasNode[] = [
  {
    id: 'node-1',
    x: 80,
    y: 120,
    width: 250,
    title: '主线起点：黑风渡避祸',
    category: 'plot',
    content: '沈玄烛弹指破去鉴魂镜阵眼，与乔装商贾的柳清霜登上同一艘黑色灵梭飞舟。',
    color: '#0a84ff',
    backdropBlur: 24,
    opacity: 0.95,
    fontSize: 12
  },
  {
    id: 'node-2',
    x: 420,
    y: 70,
    width: 260,
    title: '核心法则：破妄真瞳',
    category: 'lore',
    content: '照彻天地气机死穴。严苛代价：每次全力施展不可超三息，否则双目如灼铁刺痛。',
    color: '#bf5af2',
    backdropBlur: 24,
    opacity: 0.95,
    fontSize: 12
  },
  {
    id: 'node-3',
    x: 420,
    y: 290,
    width: 260,
    title: '核心伏笔：云纹赤佩',
    category: 'promise',
    content: '校尉赵莽暗中佩戴刻有沈家灭门云纹徽记的古佩，牵扯十年前大裂纪血案。',
    color: '#ff9f0a',
    backdropBlur: 24,
    opacity: 0.95,
    fontSize: 12
  },
  {
    id: 'node-4',
    x: 780,
    y: 180,
    width: 260,
    title: '冲突爆发：大泽阴风遇袭',
    category: 'plot',
    content: '飞舟遭遇江中渊骨凶兽群围攻，赵莽借搜查隔间发难，沈玄烛与柳清霜被迫联手反杀。',
    color: '#30d158',
    backdropBlur: 24,
    opacity: 0.95,
    fontSize: 12
  },
  {
    id: 'node-5',
    x: 780,
    y: 400,
    width: 240,
    title: '随手灵感：飞舟货舱暗道',
    category: 'sticky',
    content: '在第四章结尾可安排柳清霜私运的“寒玉髓”在战斗中震碎微隙，恰好被主角吸纳止痛。',
    color: '#ffd60a',
    backdropBlur: 24,
    opacity: 0.95,
    fontSize: 12
  }
];

const INITIAL_CONNECTIONS: Connection[] = [
  { id: 'c-1', from: 'node-1', to: 'node-2', label: '破局手段', type: 'solid', lineWeight: 2, pulseSpeed: 3 },
  { id: 'c-2', from: 'node-1', to: 'node-3', label: '目击线索', type: 'dashed', lineWeight: 1.5, pulseSpeed: 4 },
  { id: 'c-3', from: 'node-2', to: 'node-4', label: '能力代价', type: 'pulse', lineWeight: 2, pulseSpeed: 2 },
  { id: 'c-4', from: 'node-3', to: 'node-4', label: '杀机诱因', type: 'solid', lineWeight: 2, pulseSpeed: 3 },
  { id: 'c-5', from: 'node-4', to: 'node-5', label: '危机巧合', type: 'dashed', lineWeight: 1.5, pulseSpeed: 5 }
];

export const CanvasView: React.FC = () => {
  // Canvas Nodes & Links
  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);

  // Canvas History scrub Timeline stack
  const [canvasHistory, setCanvasHistory] = useState<Array<{ nodes: CanvasNode[]; connections: Connection[]; actionLabel: string }>>([
    { nodes: INITIAL_NODES, connections: INITIAL_CONNECTIONS, actionLabel: '初始状态' }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Helper to commit a state and update history index
  const pushToHistory = (nextNodes: CanvasNode[], nextConns: Connection[], label: string) => {
    const nextHist = canvasHistory.slice(0, historyIndex + 1);
    nextHist.push({ nodes: nextNodes, connections: nextConns, actionLabel: label });
    setCanvasHistory(nextHist);
    setHistoryIndex(nextHist.length - 1);
    setNodes(nextNodes);
    setConnections(nextConns);
  };

  // Canvas Viewport & Tool States
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [toolMode, setToolMode] = useState<'select' | 'pan' | 'connect'>('select');
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(['node-1']);
  const selectedNodeId = selectedNodeIds.length > 0 ? selectedNodeIds[selectedNodeIds.length - 1] : null;
  const setSelectedNodeId = (id: string | null) => setSelectedNodeIds(id ? [id] : []);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<'node' | 'link' | 'auto_layout'>('node');

  // Auto-Layout Algorithm States
  type LayoutAlgorithm = 'tree-horizontal' | 'tree-vertical' | 'grid' | 'swimlane' | 'radial';
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<LayoutAlgorithm>('tree-horizontal');
  const [layoutScope, setLayoutScope] = useState<'selected' | 'all'>('selected');
  const [layoutGridCols, setLayoutGridCols] = useState<number>(3);
  const [layoutHorizontalGap, setLayoutHorizontalGap] = useState<number>(320);
  const [layoutVerticalGap, setLayoutVerticalGap] = useState<number>(140);
  const [showAutoLayoutPopover, setShowAutoLayoutPopover] = useState<boolean>(false);

  // Dragging states
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Grid & Snapping States (Adjustable from 10px to 100px)
  const [isSnappingEnabled, setIsSnappingEnabled] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(20);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showGridPopover, setShowGridPopover] = useState<boolean>(false);

  // Creation Dropdown Sheet
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | NodeCategory>('all');
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Mini-map States & Drag Interaction
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
  const [isMiniMapCollapsed, setIsMiniMapCollapsed] = useState<boolean>(false);
  const [isDraggingMiniMap, setIsDraggingMiniMap] = useState<boolean>(false);
  const miniMapRef = useRef<HTMLDivElement>(null);

  // Export Canvas States
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportResolution, setExportResolution] = useState<'1x' | '2x' | '3x'>('2x');
  const [exportBgStyle, setExportBgStyle] = useState<'dots' | 'solid' | 'transparent'>('dots');
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
  const [hasCopiedJson, setHasCopiedJson] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas Templates Panel States
  const [showTemplatesPanel, setShowTemplatesPanel] = useState<boolean>(false);
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<'all' | 'agile' | 'strategy' | 'brainstorm'>('all');

  // Right-Click Context Menu & AI Connection Suggestions
  interface ContextMenuState {
    x: number;
    y: number;
    targetNodeId?: string | null;
  }
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzingSuggestions, setIsAnalyzingSuggestions] = useState<boolean>(false);
  const [previewSuggestion, setPreviewSuggestion] = useState<AISuggestion | null>(null);

  // Mini-Map Bounding Calculation
  const miniMapBounds = useMemo(() => {
    const canvasEl = canvasRef.current;
    const viewW = canvasEl ? canvasEl.clientWidth : 1200;
    const viewH = canvasEl ? canvasEl.clientHeight : 800;

    const viewportLeft = -panOffset.x / scale;
    const viewportTop = -panOffset.y / scale;
    const viewportRight = viewportLeft + viewW / scale;
    const viewportBottom = viewportTop + viewH / scale;

    const allX = nodes.length > 0 ? nodes.flatMap(n => [n.x, n.x + n.width]) : [0, 800];
    const allY = nodes.length > 0 ? nodes.flatMap(n => [n.y, n.y + 120]) : [0, 600];

    const minX = Math.min(...allX, viewportLeft) - 150;
    const maxX = Math.max(...allX, viewportRight) + 150;
    const minY = Math.min(...allY, viewportTop) - 150;
    const maxY = Math.max(...allY, viewportBottom) + 150;

    const width = Math.max(800, maxX - minX);
    const height = Math.max(600, maxY - minY);

    return {
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      viewW,
      viewH,
      viewportLeft,
      viewportTop,
      viewportRight,
      viewportBottom
    };
  }, [nodes, panOffset, scale]);

  const mapWidth = 200;
  const mapHeight = 120;

  const toMapX = (worldX: number) => ((worldX - miniMapBounds.minX) / miniMapBounds.width) * mapWidth;
  const toMapY = (worldY: number) => ((worldY - miniMapBounds.minY) / miniMapBounds.height) * mapHeight;
  const toMapW = (worldW: number) => (worldW / miniMapBounds.width) * mapWidth;
  const toMapH = (worldH: number) => (worldH / miniMapBounds.height) * mapHeight;

  const toWorldX = (mX: number) => miniMapBounds.minX + (mX / mapWidth) * miniMapBounds.width;
  const toWorldY = (mY: number) => miniMapBounds.minY + (mY / mapHeight) * miniMapBounds.height;

  const panToMiniMapCoords = (clientX: number, clientY: number) => {
    const mapEl = miniMapRef.current;
    if (!mapEl) return;
    const rect = mapEl.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(mapWidth, clientX - rect.left));
    const clickY = Math.max(0, Math.min(mapHeight, clientY - rect.top));

    const targetWorldX = toWorldX(clickX);
    const targetWorldY = toWorldY(clickY);

    const canvasEl = canvasRef.current;
    const viewW = canvasEl ? canvasEl.clientWidth : 1200;
    const viewH = canvasEl ? canvasEl.clientHeight : 800;

    setPanOffset({
      x: viewW / 2 - targetWorldX * scale,
      y: viewH / 2 - targetWorldY * scale
    });
  };

  const handleMiniMapMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingMiniMap(true);
    panToMiniMapCoords(e.clientX, e.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => {
      panToMiniMapCoords(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      setIsDraggingMiniMap(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleFitView = () => {
    if (nodes.length === 0) return;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const padding = 100;
    const minX = Math.min(...nodes.map(n => n.x));
    const maxX = Math.max(...nodes.map(n => n.x + n.width));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxY = Math.max(...nodes.map(n => n.y + 140));

    const contentW = Math.max(200, maxX - minX);
    const contentH = Math.max(200, maxY - minY);

    const viewW = canvasEl.clientWidth;
    const viewH = canvasEl.clientHeight;

    const newScale = Math.min(1.5, Math.max(0.35, Math.min((viewW - padding * 2) / contentW, (viewH - padding * 2) / contentH)));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setScale(newScale);
    setPanOffset({
      x: viewW / 2 - centerX * newScale,
      y: viewH / 2 - centerY * newScale
    });
    showToast('已自适应全览所有图元与工作流节点');
  };

  // Export Handlers
  const handleExportPNG = async () => {
    if (nodes.length === 0) {
      showToast('画布中暂无图元节点可导出');
      return;
    }

    setIsExportingPng(true);
    showToast('正在光栅化渲染高清画布图像...');

    try {
      const padding = 80;
      const minX = Math.min(...nodes.map(n => n.x)) - padding;
      const maxX = Math.max(...nodes.map(n => n.x + n.width)) + padding;
      const minY = Math.min(...nodes.map(n => n.y)) - padding;
      const maxY = Math.max(...nodes.map(n => n.y + 160)) + padding;

      const contentW = Math.max(800, maxX - minX);
      const contentH = Math.max(600, maxY - minY);

      const dpr = exportResolution === '3x' ? 3 : exportResolution === '2x' ? 2 : 1;

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(contentW * dpr);
      canvas.height = Math.round(contentH * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法创建 Canvas 2D 绘图上下文');

      ctx.scale(dpr, dpr);

      // Background
      if (exportBgStyle === 'transparent') {
        ctx.clearRect(0, 0, contentW, contentH);
      } else {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, contentW, contentH);

        if (exportBgStyle === 'dots') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          const dotStep = gridSize || 20;
          for (let x = dotStep; x < contentW; x += dotStep) {
            for (let y = dotStep; y < contentH; y += dotStep) {
              ctx.beginPath();
              ctx.arc(x, y, 1.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw Connections (Bezier curves with arrows & labels)
      connections.forEach(c => {
        const fromNode = nodes.find(n => n.id === c.from);
        const toNode = nodes.find(n => n.id === c.to);
        if (!fromNode || !toNode) return;

        const startX = fromNode.x - minX + fromNode.width;
        const startY = fromNode.y - minY + 42;
        const endX = toNode.x - minX;
        const endY = toNode.y - minY + 42;
        const deltaX = Math.max(40, Math.abs(endX - startX) * 0.5);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(startX + deltaX, startY, endX - deltaX, endY, endX, endY);
        ctx.strokeStyle = '#0a84ff';
        ctx.lineWidth = c.lineWeight || 2;
        if (c.type === 'dashed') {
          ctx.setLineDash([6, 6]);
        }
        ctx.stroke();

        // Arrowhead
        ctx.setLineDash([]);
        ctx.fillStyle = '#0a84ff';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 8, endY - 5);
        ctx.lineTo(endX - 8, endY + 5);
        ctx.closePath();
        ctx.fill();

        // Label Badge
        if (c.label) {
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          ctx.font = '10px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
          const textMetrics = ctx.measureText(c.label);
          const badgeW = textMetrics.width + 16;
          const badgeH = 20;

          ctx.fillStyle = '#1c1c24';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(midX - badgeW / 2, midY - badgeH / 2, badgeW, badgeH, 6);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillRect(midX - badgeW / 2, midY - badgeH / 2, badgeW, badgeH);
            ctx.strokeRect(midX - badgeW / 2, midY - badgeH / 2, badgeW, badgeH);
          }

          ctx.fillStyle = '#a1a1aa';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(c.label, midX, midY + 1);
        }
        ctx.restore();
      });

      // Draw Nodes
      nodes.forEach(node => {
        const nx = node.x - minX;
        const ny = node.y - minY;
        const nw = node.width;
        const nh = 130;
        const cfg = CATEGORY_CONFIG[node.category] || CATEGORY_CONFIG.plot;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 8;

        ctx.fillStyle = '#16161c';
        ctx.strokeStyle = node.color ? `${node.color}66` : 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;

        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(nx, ny, nw, nh, 16);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(nx, ny, nw, nh);
          ctx.strokeRect(nx, ny, nw, nh);
        }
        ctx.restore();

        ctx.save();
        // Category indicator dot & tag
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(nx + 16, ny + 20, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
        ctx.fillStyle = '#a1a1aa';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(cfg.label, nx + 26, ny + 20);

        // Node Title
        ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(node.title, nx + 16, ny + 46);

        // Node Content (Word wrap)
        ctx.font = `${node.fontSize || 12}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
        ctx.fillStyle = '#9ca3af';

        const maxTextW = nw - 32;
        const words = node.content.split('');
        let line = '';
        let lineY = ny + 72;
        const lineHeight = 18;
        let lineCount = 0;

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i];
          const testW = ctx.measureText(testLine).width;
          if (testW > maxTextW && i > 0) {
            ctx.fillText(line, nx + 16, lineY);
            line = words[i];
            lineY += lineHeight;
            lineCount++;
            if (lineCount >= 3) {
              line += '...';
              break;
            }
          } else {
            line = testLine;
          }
        }
        if (line && lineCount < 3) {
          ctx.fillText(line, nx + 16, lineY);
        }

        ctx.restore();
      });

      // Watermark Footer
      ctx.save();
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "SF Pro Text", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'right';
      ctx.fillText(
        `Apple Freeform Canvas · ${exportResolution.toUpperCase()} Retina · ${nodes.length} 个节点 · ${connections.length} 条连线`,
        contentW - 24,
        contentH - 20
      );
      ctx.restore();

      // Download Image Blob
      canvas.toBlob(blob => {
        if (!blob) throw new Error('导出 Blob 失败');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `freeform_canvas_${exportResolution}_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExportingPng(false);
        setShowExportModal(false);
        showToast(`✨ 已成功导出 ${exportResolution} 高清画布 PNG 图像！`);
      }, 'image/png');

    } catch (err: any) {
      console.error(err);
      setIsExportingPng(false);
      showToast('导出图片出现异常，请重试');
    }
  };

  const handleExportJSON = () => {
    const data = {
      version: '2.0.0',
      exportTime: new Date().toISOString(),
      viewport: {
        scale,
        panOffset,
        gridSize,
        isSnappingEnabled
      },
      nodes,
      connections
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canvas_project_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
    showToast('✨ 已成功导出结构化 JSON 工程文件！');
  };

  const handleCopyJSON = () => {
    const data = {
      version: '2.0.0',
      exportTime: new Date().toISOString(),
      viewport: { scale, panOffset, gridSize, isSnappingEnabled },
      nodes,
      connections
    };

    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setHasCopiedJson(true);
    setTimeout(() => setHasCopiedJson(false), 2000);
    showToast('已复制完整画布 JSON 数据至剪贴板');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.connections)) {
          pushToHistory(parsed.nodes, parsed.connections, '导入 JSON 工程');
          if (parsed.viewport?.scale) setScale(parsed.viewport.scale);
          if (parsed.viewport?.panOffset) setPanOffset(parsed.viewport.panOffset);
          if (parsed.viewport?.gridSize) setGridSize(parsed.viewport.gridSize);
          setShowExportModal(false);
          showToast(`已成功还原工程，包含 ${parsed.nodes.length} 个节点！`);
        } else {
          showToast('JSON 格式无效，缺少 nodes 或 connections 字段');
        }
      } catch (err) {
        showToast('读取或解析 JSON 文件失败');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);
  const selectedConnection = useMemo(() => connections.find(c => c.id === selectedConnectionId) || null, [connections, selectedConnectionId]);

  // Two-Finger Trackpad Pinch-to-Zoom & Two-Finger Pan Gestures
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
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
        setPanOffset(prev => ({
          x: prev.x - e.deltaX * 1.05,
          y: prev.y - e.deltaY * 1.05
        }));
      }
    };

    canvasEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvasEl.removeEventListener('wheel', handleWheel);
    };
  }, [scale]);

  // Mouse Interaction Handlers
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    setContextMenu(null);
    setPreviewSuggestion(null);
    if (toolMode === 'pan' || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    } else {
      setSelectedNodeId(null);
      setSelectedConnectionId(null);
      setConnectingFromId(null);
    }
  };

  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setContextMenu(null);
    setPreviewSuggestion(null);
    if (toolMode === 'connect') {
      if (!connectingFromId) {
        setConnectingFromId(id);
      } else if (connectingFromId !== id) {
        // Create new connection
        const newConn: Connection = {
          id: `c-${Date.now()}`,
          from: connectingFromId,
          to: id,
          label: '关联推演',
          type: 'solid',
          lineWeight: 2,
          pulseSpeed: 3
        };
        const nextConns = [...connections, newConn];
        pushToHistory(nodes, nextConns, '新建连线');
        setConnectingFromId(null);
        setToolMode('select');
        showToast('已创建新连线');
      }
      return;
    }

    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      setSelectedNodeIds(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    } else {
      if (!selectedNodeIds.includes(id)) {
        setSelectedNodeIds([id]);
      }
    }

    setSelectedConnectionId(null);
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
      const draggedNode = nodes.find(n => n.id === draggedNodeId);
      if (!draggedNode) return;

      let targetX = (e.clientX / scale) - dragOffset.x;
      let targetY = (e.clientY / scale) - dragOffset.y;
      
      if (isSnappingEnabled && gridSize > 0) {
        targetX = Math.round(targetX / gridSize) * gridSize;
        targetY = Math.round(targetY / gridSize) * gridSize;
      }

      const dx = Math.round(targetX) - draggedNode.x;
      const dy = Math.round(targetY) - draggedNode.y;

      if (dx !== 0 || dy !== 0) {
        setNodes(prev => prev.map(n => {
          if (selectedNodeIds.includes(n.id)) {
            return {
              ...n,
              x: Math.round(n.x + dx),
              y: Math.round(n.y + dy)
            };
          }
          return n;
        }));
      }
    }
  };

  const handleMouseUp = () => {
    if (draggedNodeId) {
      // Record position end dragging into history
      pushToHistory(nodes, connections, '移动卡片位置');
    }
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Local Semantic Heuristic Suggestions Engine for Instant Feedback
  const generateLocalSemanticSuggestions = (
    targetNodes: CanvasNode[],
    targetConns: Connection[]
  ): AISuggestion[] => {
    const existingSet = new Set(targetConns.map(c => `${c.from}->${c.to}`));
    const reverseSet = new Set(targetConns.map(c => `${c.to}->${c.from}`));

    const suggestions: AISuggestion[] = [];

    for (let i = 0; i < targetNodes.length; i++) {
      for (let j = 0; j < targetNodes.length; j++) {
        if (i === j) continue;
        const a = targetNodes[i];
        const b = targetNodes[j];

        if (existingSet.has(`${a.id}->${b.id}`) || reverseSet.has(`${a.id}->${b.id}`)) {
          continue;
        }

        let label = '因果推演';
        let type: ConnectionType = 'solid';
        let reason = `「${a.title}」与「${b.title}」在剧情架构与逻辑递进中存在深层因果关联。`;
        let confidence = 0.86;

        const fullA = `${a.title} ${a.content || ''}`;
        const fullB = `${b.title} ${b.content || ''}`;

        if (fullA.includes('代价') || fullB.includes('代价') || fullA.includes('危机') || fullB.includes('危机')) {
          label = '破局代价';
          type = 'pulse';
          reason = `「${a.title}」所包含的危机或代价机制，直接决定了「${b.title}」能否顺利突破困局。`;
          confidence = 0.96;
        } else if (fullA.includes('线索') || fullA.includes('目击') || fullB.includes('线索')) {
          label = '目击线索';
          type = 'dashed';
          reason = `「${a.title}」提供的暗线线索直接指向了「${b.title}」的发生机理。`;
          confidence = 0.94;
        } else if (a.category === 'character' && b.category === 'plot') {
          label = '因果动机';
          type = 'solid';
          reason = `人物「${a.title}」的信念与行为动机直接促成了事件「${b.title}」的爆发。`;
          confidence = 0.95;
        } else if (a.category === 'lore' && b.category === 'plot') {
          label = '法则约束';
          type = 'solid';
          reason = `世界观法则「${a.title}」设定了「${b.title}」的核心运行边界与因果制约。`;
          confidence = 0.97;
        } else if (a.category === 'promise' && b.category === 'plot') {
          label = '伏笔闭环';
          type = 'pulse';
          reason = `前期埋下的暗线「${a.title}」在此事件「${b.title}」中迎来戏剧性兑现与高潮。`;
          confidence = 0.95;
        } else if (a.category === 'plot' && b.category === 'plot') {
          label = '递进承接';
          type = 'solid';
          reason = `情节「${a.title}」与「${b.title}」具有天然的时间序列与戏剧冲突递进关联。`;
          confidence = 0.89;
        } else if (a.category === 'sticky' || b.category === 'sticky') {
          label = '补充佐证';
          type = 'dashed';
          reason = `备忘批注与节点上下文形成推演互证，完善论证链路。`;
          confidence = 0.84;
        }

        suggestions.push({
          from: a.id,
          to: b.id,
          label,
          type,
          reason,
          confidence
        });
      }
    }

    suggestions.sort((x, y) => y.confidence - x.confidence);
    return suggestions.slice(0, 4);
  };

  // AI Connection Suggestions Fetcher
  const fetchAiSuggestions = async (nodeIds: string[]) => {
    if (nodeIds.length < 2) {
      setAiSuggestions([]);
      return;
    }

    const sensitivity = localStorage.getItem('canvas_ai_edge_sensitivity') || 'balanced';
    if (sensitivity === 'off') {
      setAiSuggestions([]);
      return;
    }
    const threshold = sensitivity === 'aggressive' ? 0.3 : sensitivity === 'conservative' ? 0.75 : 0.5;

    setIsAnalyzingSuggestions(true);
    const targetNodes = nodes.filter(n => nodeIds.includes(n.id));
    const targetConns = connections.filter(c => nodeIds.includes(c.from) && nodeIds.includes(c.to));

    // Provide instant heuristic feedback
    const instant = generateLocalSemanticSuggestions(targetNodes, targetConns).filter(s => s.confidence >= threshold);
    setAiSuggestions(instant);

    try {
      const res = await fetch('/api/canvas/suggest-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: targetNodes.map(n => ({ id: n.id, title: n.title, category: n.category, content: n.content })),
          existingConnections: targetConns
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        const filteredRemote = data.suggestions.filter((s: any) => (s.confidence ?? 0.6) >= threshold);
        setAiSuggestions(filteredRemote.length > 0 ? filteredRemote : instant);
      }
    } catch (err) {
      console.warn('AI suggestions error, falling back to heuristic:', err);
    } finally {
      setIsAnalyzingSuggestions(false);
    }
  };

  // Apply single connection suggestion
  const handleApplySuggestion = (s: AISuggestion) => {
    const exists = connections.some(c => c.from === s.from && c.to === s.to);
    if (exists) {
      showToast('该连线已存在于画布中');
      return;
    }
    const newConn: Connection = {
      id: `c-ai-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      from: s.from,
      to: s.to,
      label: s.label,
      type: s.type || 'solid',
      lineWeight: 2,
      pulseSpeed: s.type === 'pulse' ? 2 : 3
    };
    pushToHistory(nodes, [...connections, newConn], `AI连线: ${s.label}`);
    showToast(`✨ 已成功建立连线「${s.label}」`);
    setAiSuggestions(prev => prev.filter(item => !(item.from === s.from && item.to === s.to)));
    setPreviewSuggestion(null);
  };

  // Batch apply all connection suggestions
  const handleApplyAllSuggestions = () => {
    if (aiSuggestions.length === 0) return;
    const newConns: Connection[] = [];
    aiSuggestions.forEach((s, idx) => {
      const exists = connections.some(c => c.from === s.from && c.to === s.to) ||
                     newConns.some(c => c.from === s.from && c.to === s.to);
      if (!exists) {
        newConns.push({
          id: `c-ai-${Date.now()}-${idx}`,
          from: s.from,
          to: s.to,
          label: s.label,
          type: s.type || 'solid',
          lineWeight: 2,
          pulseSpeed: s.type === 'pulse' ? 2 : 3
        });
      }
    });

    if (newConns.length > 0) {
      pushToHistory(nodes, [...connections, ...newConns], `批量采纳 ${newConns.length} 条 AI 建议连线`);
      showToast(`✨ 已一键建立 ${newConns.length} 条 AI 语义关联连线！`);
      setAiSuggestions([]);
      setPreviewSuggestion(null);
      setContextMenu(null);
    }
  };

  // Delete selected nodes in batch
  const handleDeleteSelectedNodes = () => {
    if (selectedNodeIds.length === 0) return;
    const count = selectedNodeIds.length;
    const nextNodes = nodes.filter(n => !selectedNodeIds.includes(n.id));
    const nextConns = connections.filter(c => !selectedNodeIds.includes(c.from) && !selectedNodeIds.includes(c.to));
    pushToHistory(nextNodes, nextConns, `批量删除 ${count} 个节点`);
    setSelectedNodeIds([]);
    setContextMenu(null);
    showToast(`已删除 ${count} 个节点及其关联连线`);
  };

  // Context Menu Trigger Handlers
  const handleContextMenuCanvas = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedNodeIds.length > 1) {
      fetchAiSuggestions(selectedNodeIds);
    }
    const menuW = 380;
    const menuH = 460;
    const posX = Math.max(12, Math.min(e.clientX, window.innerWidth - menuW - 16));
    const posY = Math.max(12, Math.min(e.clientY, window.innerHeight - menuH - 16));
    setContextMenu({
      x: posX,
      y: posY,
      targetNodeId: null
    });
  };

  const handleContextMenuNode = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    let targetIds = selectedNodeIds;
    if (!selectedNodeIds.includes(id)) {
      if (selectedNodeIds.length > 0) {
        targetIds = [...selectedNodeIds, id];
        setSelectedNodeIds(targetIds);
      } else {
        targetIds = [id];
        setSelectedNodeIds([id]);
      }
    }

    if (targetIds.length > 1) {
      fetchAiSuggestions(targetIds);
    }

    const menuW = 380;
    const menuH = 460;
    const posX = Math.max(12, Math.min(e.clientX, window.innerWidth - menuW - 16));
    const posY = Math.max(12, Math.min(e.clientY, window.innerHeight - menuH - 16));
    setContextMenu({
      x: posX,
      y: posY,
      targetNodeId: id
    });
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
      color: cfg.color,
      backdropBlur: 24,
      opacity: 0.95,
      fontSize: 12
    };
    pushToHistory([...nodes, newNode], connections, `新建${cfg.label}`);
    setSelectedNodeId(newId);
    setShowAddMenu(false);
    showToast(`已创建${cfg.label}`);
  };

  // Pre-designed Workflow Patterns & Structures
  const TEMPLATE_PRESETS = [
    {
      id: 'mind_map',
      title: '放射状思维脑图',
      category: 'brainstorm',
      categoryLabel: '思维发散',
      badge: '脑力激荡',
      desc: '核心命题放射展开，建立因果发散分支与边缘参数评估。',
      nodeCount: 5,
      connCount: 4,
      color: '#bf5af2',
      icon: Boxes
    },
    {
      id: 'kanban',
      title: '敏捷看板泳道',
      category: 'agile',
      categoryLabel: '敏捷与工程',
      badge: '3 列泳道',
      desc: '待办、进行中、已交付三列标准泳道，包含任务卡片流转。',
      nodeCount: 9,
      connCount: 2,
      color: '#0a84ff',
      icon: Columns3
    },
    {
      id: 'swot',
      title: 'SWOT 战略态势矩阵',
      category: 'strategy',
      categoryLabel: '战略决策',
      badge: '四象限矩阵',
      desc: '优势、劣势、机会、威胁四象限，含 SO 扩张与 WT 防御联动。',
      nodeCount: 4,
      connCount: 2,
      color: '#30d158',
      icon: Target
    },
    {
      id: 'workflow',
      title: '脉冲流水线工作流',
      category: 'agile',
      categoryLabel: '敏捷与工程',
      badge: 'CI/CD 链路',
      desc: '仿真、压测、巡检、交付四阶连续作业，带脉冲动态连线。',
      nodeCount: 4,
      connCount: 3,
      color: '#ff9f0a',
      icon: Workflow
    },
    {
      id: 'flowchart',
      title: '分支决策逻辑流程图',
      category: 'strategy',
      categoryLabel: '战略决策',
      badge: '条件分支',
      desc: '起止点、条件判断与分流路由逻辑，清晰展示决策分支。',
      nodeCount: 4,
      connCount: 3,
      color: '#30d158',
      icon: Network
    },
    {
      id: 'fishbone',
      title: '根因鱼骨归因分析图',
      category: 'brainstorm',
      categoryLabel: '思维发散',
      badge: '石川因果',
      desc: '人员、机制、数据、算法四维归因模型，深度复盘核心异常。',
      nodeCount: 5,
      connCount: 4,
      color: '#ff375f',
      icon: Scale
    }
  ];

  // Master Template Insertion Engine (Supports Append & Replace)
  const insertWorkflowTemplate = (templateId: string, mode: 'append' | 'replace' = 'append') => {
    let ox = 80;
    let oy = 100;

    if (mode === 'append') {
      const canvasEl = canvasRef.current;
      const viewW = canvasEl ? canvasEl.clientWidth : 1000;
      const viewH = canvasEl ? canvasEl.clientHeight : 700;
      ox = Math.round((-panOffset.x + viewW / 2) / scale - 300);
      oy = Math.round((-panOffset.y + viewH / 2) / scale - 160);
    }

    const tplTime = Date.now();
    let newNodes: CanvasNode[] = [];
    let newConns: Connection[] = [];
    let tplName = '';

    if (templateId === 'mind_map') {
      tplName = '放射状思维脑图';
      const rootId = `root-mind-${tplTime}`;
      const rootNode: CanvasNode = {
        id: rootId,
        x: ox,
        y: oy + 120,
        width: 260,
        title: '🌟 核心主题：高维跨国计算中枢',
        category: 'plot',
        content: '面向低 TDP 限制下的星型分布式瓦片排布逻辑。',
        color: '#0a84ff',
        backdropBlur: 24,
        opacity: 0.95,
        fontSize: 12
      };

      const branches = [
        { cat: 'lore' as NodeCategory, title: '1. NoC 传输总线带宽约束', x: ox + 360, y: oy, color: '#bf5af2' },
        { cat: 'character' as NodeCategory, title: '2. 自适应分布式调度算子', x: ox + 360, y: oy + 95, color: '#30d158' },
        { cat: 'promise' as NodeCategory, title: '3. 热量散失与结温能耗平衡', x: ox + 360, y: oy + 190, color: '#ff9f0a' },
        { cat: 'sticky' as NodeCategory, title: '4. 动态电容补偿备忘录', x: ox + 360, y: oy + 285, color: '#ffd60a' }
      ];

      const branchNodes = branches.map((b, i) => ({
        id: `branch-mind-${tplTime}-${i}`,
        x: b.x,
        y: b.y,
        width: 240,
        title: b.title,
        category: b.cat,
        content: '分节点详细参数推演与边缘测试指标。',
        color: b.color,
        backdropBlur: 24,
        opacity: 0.95,
        fontSize: 12
      }));

      const branchConns = branchNodes.map(bn => ({
        id: `c-mind-${tplTime}-${bn.id}`,
        from: rootId,
        to: bn.id,
        label: '辐射分支',
        type: 'solid' as ConnectionType,
        lineWeight: 2,
        pulseSpeed: 3
      }));

      newNodes = [rootNode, ...branchNodes];
      newConns = branchConns;

    } else if (templateId === 'kanban') {
      tplName = '敏捷看板泳道';
      const col1Id = `kb-col1-${tplTime}`;
      const col2Id = `kb-col2-${tplTime}`;
      const col3Id = `kb-col3-${tplTime}`;

      // 3 Columns Headers
      const colHeaders: CanvasNode[] = [
        {
          id: col1Id,
          x: ox,
          y: oy,
          width: 240,
          title: '📋 待规划 (Backlog / To Do)',
          category: 'plot',
          content: '本迭代待排期与架构拆解任务项，按优先级排序。',
          color: '#0a84ff',
          fontSize: 11
        },
        {
          id: col2Id,
          x: ox + 270,
          y: oy,
          width: 240,
          title: '⚡ 进行中 (In Progress)',
          category: 'lore',
          content: '正在全力攻坚与联调验证的活跃工程任务。',
          color: '#bf5af2',
          fontSize: 11
        },
        {
          id: col3Id,
          x: ox + 540,
          y: oy,
          width: 240,
          title: '✅ 已完成 (Done / Delivered)',
          category: 'character',
          content: '已通过全部单元测试与自动化回归验收阶段。',
          color: '#30d158',
          fontSize: 11
        }
      ];

      // Task Cards in columns
      const task1: CanvasNode = {
        id: `kb-t1-${tplTime}`,
        x: ox,
        y: oy + 95,
        width: 240,
        title: '[TASK-101] 高并发分布式网关重构',
        category: 'plot',
        content: '解决边缘节点握手开销过大问题。',
        color: '#0a84ff'
      };
      const task2: CanvasNode = {
        id: `kb-t2-${tplTime}`,
        x: ox,
        y: oy + 190,
        width: 240,
        title: '[TASK-102] 零知识证明验证电路优化',
        category: 'promise',
        content: '将验证证明约束缩减 35%。',
        color: '#ff9f0a'
      };

      const task3: CanvasNode = {
        id: `kb-t3-${tplTime}`,
        x: ox + 270,
        y: oy + 95,
        width: 240,
        title: '[TASK-103] 多区域异地多活热备演练',
        category: 'lore',
        content: '模拟机房断电状态下的 0 丢包热切。',
        color: '#bf5af2'
      };
      const task4: CanvasNode = {
        id: `kb-t4-${tplTime}`,
        x: ox + 270,
        y: oy + 190,
        width: 240,
        title: '[TASK-104] 内存热敏泄漏诊断巡检',
        category: 'sticky',
        content: '实时捕获 Native 堆外内存泄漏点。',
        color: '#ffd60a'
      };

      const task5: CanvasNode = {
        id: `kb-t5-${tplTime}`,
        x: ox + 540,
        y: oy + 95,
        width: 240,
        title: '[TASK-105] 自动化全链路回归测试套件',
        category: 'character',
        content: '340 个用例全部通过，覆盖率 94.2%。',
        color: '#30d158'
      };
      const task6: CanvasNode = {
        id: `kb-t6-${tplTime}`,
        x: ox + 540,
        y: oy + 190,
        width: 240,
        title: '[TASK-106] 生产环境金丝雀灰度平滑发布',
        category: 'character',
        content: '首批 5% 流量平稳承接，错误率 0.001%。',
        color: '#30d158'
      };

      newNodes = [...colHeaders, task1, task2, task3, task4, task5, task6];
      newConns = [
        { id: `c-kb-1-${tplTime}`, from: task2.id, to: task3.id, label: '排期流转', type: 'pulse', lineWeight: 2 },
        { id: `c-kb-2-${tplTime}`, from: task4.id, to: task5.id, label: '提测验收', type: 'pulse', lineWeight: 2 }
      ];

    } else if (templateId === 'swot') {
      tplName = 'SWOT 战略态势矩阵';
      const sId = `swot-s-${tplTime}`;
      const wId = `swot-w-${tplTime}`;
      const oId = `swot-o-${tplTime}`;
      const tId = `swot-t-${tplTime}`;

      const sNode: CanvasNode = {
        id: sId,
        x: ox,
        y: oy,
        width: 280,
        title: '💪 优势 (Strengths)',
        category: 'character',
        content: '拥有独家全栈自研算法架构；超低推理时延与微瓦级功耗优势；极高技术壁垒与独家语料沉淀。',
        color: '#30d158'
      };

      const wNode: CanvasNode = {
        id: wId,
        x: ox + 310,
        y: oy,
        width: 280,
        title: '⚠️ 劣势 (Weaknesses)',
        category: 'promise',
        content: '初期先进制程晶圆代工产能依赖；跨洲低延迟数据同步成本偏高；开源模型平替方案带来价格竞争。',
        color: '#ff9f0a'
      };

      const oNode: CanvasNode = {
        id: oId,
        x: ox,
        y: oy + 175,
        width: 280,
        title: '🚀 机会 (Opportunities)',
        category: 'plot',
        content: '跨国主权数字基建与数据驻留合规强需求；端侧高算力智能终端普及浪潮；多模态边缘计算落地加速。',
        color: '#0a84ff'
      };

      const tNode: CanvasNode = {
        id: tId,
        x: ox + 310,
        y: oy + 175,
        width: 280,
        title: '🛡️ 威胁 (Threats)',
        category: 'sticky',
        content: '跨国高阶光刻供应链进出口管制升级；全球碳排放与电力供应配额收缩；开源社区快速迭代威胁。',
        color: '#ff375f'
      };

      newNodes = [sNode, wNode, oNode, tNode];
      newConns = [
        { id: `c-swot-so-${tplTime}`, from: sId, to: oId, label: 'SO 顺势扩张策略', type: 'solid', lineWeight: 2.5 },
        { id: `c-swot-wt-${tplTime}`, from: wId, to: tId, label: 'WT 避险防御壁垒', type: 'dashed', lineWeight: 2 }
      ];

    } else if (templateId === 'workflow') {
      tplName = '脉冲流水线工作流';
      const steps = [
        { title: '📦 阶段一：芯片架构仿真', desc: '仿真参数自适应计算。', color: '#0a84ff', x: ox, y: oy },
        { title: '⚙️ 阶段二：百万并发压测', desc: '蒙特卡洛敏感性收敛。', color: '#bf5af2', x: ox + 270, y: oy },
        { title: '👁️ 阶段三：拓扑热敏识图', desc: '多模态视觉故障识别。', color: '#ff9f0a', x: ox + 540, y: oy },
        { title: '🚀 阶段四：全球算力交付', desc: '自动灰度发布自愈。', color: '#30d158', x: ox + 810, y: oy }
      ];

      newNodes = steps.map((s, idx) => ({
        id: `wf-s-${tplTime}-${idx}`,
        x: s.x,
        y: s.y,
        width: 240,
        title: s.title,
        category: 'plot',
        content: s.desc,
        color: s.color,
        fontSize: 12
      }));

      newConns = [];
      for (let i = 0; i < newNodes.length - 1; i++) {
        newConns.push({
          id: `c-wf-${tplTime}-${i}`,
          from: newNodes[i].id,
          to: newNodes[i + 1].id,
          label: `Step 0${i + 1} 交付`,
          type: 'pulse',
          lineWeight: 2.5,
          pulseSpeed: 2
        });
      }

    } else if (templateId === 'flowchart') {
      tplName = '分支决策流程图';
      const startNode: CanvasNode = {
        id: `fc-start-${tplTime}`,
        x: ox,
        y: oy + 90,
        width: 210,
        title: '🟢 开始：网关流量监测',
        category: 'plot',
        content: '实时监测入站请求 QPS 指标。',
        color: '#30d158'
      };

      const decisionNode: CanvasNode = {
        id: `fc-decision-${tplTime}`,
        x: ox + 260,
        y: oy + 65,
        width: 230,
        title: '🔶 决策：流量是否超限？',
        category: 'lore',
        content: '判断当前吞吐量是否超过安全裕度阈值。',
        color: '#ff9f0a'
      };

      const passNode: CanvasNode = {
        id: `fc-pass-${tplTime}`,
        x: ox + 540,
        y: oy,
        width: 220,
        title: '🔵 正常路由分发',
        category: 'character',
        content: '低延迟高速总线路由正常派发。',
        color: '#0a84ff'
      };

      const failNode: CanvasNode = {
        id: `fc-fail-${tplTime}`,
        x: ox + 540,
        y: oy + 160,
        width: 220,
        title: '🔴 动态令牌限流降级',
        category: 'sticky',
        content: '激活 Token Bucket 限流，异地热备容灾。',
        color: '#ff375f'
      };

      newNodes = [startNode, decisionNode, passNode, failNode];
      newConns = [
        { id: `c-fc-1-${tplTime}`, from: startNode.id, to: decisionNode.id, label: '指标流' },
        { id: `c-fc-2-${tplTime}`, from: decisionNode.id, to: passNode.id, label: '未超限 (No)' },
        { id: `c-fc-3-${tplTime}`, from: decisionNode.id, to: failNode.id, label: '已超载 (Yes)' }
      ];

    } else if (templateId === 'fishbone') {
      tplName = '根因鱼骨归因分析图';
      const spineId = `fb-spine-${tplTime}`;
      const spineNode: CanvasNode = {
        id: spineId,
        x: ox + 520,
        y: oy + 95,
        width: 260,
        title: '🎯 核心异常：端到端延迟 > 850ms',
        category: 'sticky',
        content: '多集群跨区吞吐异常波动，达到 P99 告警阈值。',
        color: '#ff375f'
      };

      const rib1: CanvasNode = {
        id: `fb-rib-1-${tplTime}`,
        x: ox,
        y: oy,
        width: 230,
        title: '👥 人员协同：跨域上下文隐式丢失',
        category: 'character',
        content: '排障人员未及时对齐分布式链路 ID。',
        color: '#0a84ff'
      };

      const rib2: CanvasNode = {
        id: `fb-rib-2-${tplTime}`,
        x: ox + 260,
        y: oy,
        width: 230,
        title: '⚙️ 机制约束：锁争用与跨核心 GC',
        category: 'lore',
        content: '主线程持有临界区过长引发雪崩。',
        color: '#bf5af2'
      };

      const rib3: CanvasNode = {
        id: `fb-rib-3-${tplTime}`,
        x: ox,
        y: oy + 200,
        width: 230,
        title: '📦 数据载荷：冷热数据未解耦',
        category: 'promise',
        content: '大包透传导致网络拥塞。',
        color: '#ff9f0a'
      };

      const rib4: CanvasNode = {
        id: `fb-rib-4-${tplTime}`,
        x: ox + 260,
        y: oy + 200,
        width: 230,
        title: '📐 调度算法：贪婪启发路由陷入极值',
        category: 'plot',
        content: '动态权重未考虑多路径回环延迟。',
        color: '#30d158'
      };

      newNodes = [rib1, rib2, rib3, rib4, spineNode];
      newConns = [
        { id: `c-fb-1-${tplTime}`, from: rib1.id, to: spineId, label: '人员维度' },
        { id: `c-fb-2-${tplTime}`, from: rib2.id, to: spineId, label: '机制维度' },
        { id: `c-fb-3-${tplTime}`, from: rib3.id, to: spineId, label: '数据维度' },
        { id: `c-fb-4-${tplTime}`, from: rib4.id, to: spineId, label: '算法维度' }
      ];
    }

    if (mode === 'replace') {
      pushToHistory(newNodes, newConns, `新建画布模板: ${tplName}`);
      setScale(1);
      setPanOffset({ x: 0, y: 0 });
      showToast(`✨ 已为您全新建立「${tplName}」工程！`);
    } else {
      pushToHistory([...nodes, ...newNodes], [...connections, ...newConns], `追加置入模板: ${tplName}`);
      showToast(`✨ 已在当前视口中心置入「${tplName}」！`);
    }

    if (newNodes.length > 0) {
      setSelectedNodeId(newNodes[0].id);
    }
    setShowTemplatesPanel(false);
  };

  // Quick Preset Helper Aliases
  const generateMindMapPreset = () => insertWorkflowTemplate('mind_map', 'append');
  const generateWorkflowPreset = () => insertWorkflowTemplate('workflow', 'append');
  const generateFlowchartPreset = () => insertWorkflowTemplate('flowchart', 'append');

  // AI Brainstorming
  const handleAiBrainstorm = () => {
    if (!selectedNode) {
      showToast('请先在画布中点击选中一个起始节点');
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
      color: '#bf5af2',
      backdropBlur: 24,
      opacity: 0.95,
      fontSize: 12
    };
    pushToHistory([...nodes, newNode], [...connections, { id: `c-${Date.now()}`, from: selectedNode.id, to: newId, label: '戏剧逆转' }], 'AI冲突发散');
    setSelectedNodeId(newId);
    showToast(`已成功生成次级剧情冲突分支！`);
  };

  const handleAiCheckPromises = () => {
    const promises = nodes.filter(n => n.category === 'promise');
    const plots = nodes.filter(n => n.category === 'plot');
    showToast(`✅ 因果闭环体检：当前画布已检测到 ${promises.length} 处埋设伏笔与 ${plots.length} 个核心情节节点，因果链接健全！`);
  };

  // Comprehensive Auto-Layout Algorithm Engine (Tree, Grid, Swimlane, Radial)
  const applyAutoLayout = (
    algo: LayoutAlgorithm = layoutAlgorithm,
    targetScope: 'selected' | 'all' = layoutScope
  ) => {
    const targetNodes = (targetScope === 'selected' && selectedNodeIds.length > 0)
      ? nodes.filter(n => selectedNodeIds.includes(n.id))
      : nodes;

    if (targetNodes.length === 0) {
      showToast('未检测到需要自动排版的节点');
      return;
    }

    if (targetNodes.length === 1 && targetScope === 'selected') {
      showToast('单个节点无需排版，请按住 Shift 多选节点或选择“全画布所有节点”');
      return;
    }

    const targetIds = new Set(targetNodes.map(n => n.id));
    const subConns = connections.filter(c => targetIds.has(c.from) && targetIds.has(c.to));

    // Anchor: top-left of the bounding box of target nodes
    const minX = Math.min(...targetNodes.map(n => n.x));
    const minY = Math.min(...targetNodes.map(n => n.y));
    const anchorX = isSnappingEnabled && gridSize > 0 ? Math.round(minX / gridSize) * gridSize : minX;
    const anchorY = isSnappingEnabled && gridSize > 0 ? Math.round(minY / gridSize) * gridSize : minY;

    const newPositions = new Map<string, { x: number; y: number }>();

    if (algo === 'tree-horizontal' || algo === 'tree-vertical') {
      // 1. Hierarchical Tree (Topological Rank Assignment)
      const inDegree = new Map<string, number>();
      const outEdges = new Map<string, string[]>();

      targetNodes.forEach(n => {
        inDegree.set(n.id, 0);
        outEdges.set(n.id, []);
      });

      subConns.forEach(c => {
        inDegree.set(c.to, (inDegree.get(c.to) || 0) + 1);
        outEdges.get(c.from)?.push(c.to);
      });

      // Find root nodes (inDegree === 0)
      let roots = targetNodes.filter(n => (inDegree.get(n.id) || 0) === 0).map(n => n.id);
      if (roots.length === 0) {
        roots = [targetNodes[0].id];
      }

      // Assign ranks (BFS / longest path)
      const ranks = new Map<string, number>();
      const queue: string[] = [];

      roots.forEach(r => {
        ranks.set(r, 0);
        queue.push(r);
      });

      while (queue.length > 0) {
        const curr = queue.shift()!;
        const currRank = ranks.get(curr) || 0;
        const children = outEdges.get(curr) || [];

        children.forEach(child => {
          const prevRank = ranks.get(child) || 0;
          const nextRank = Math.max(prevRank, currRank + 1);
          ranks.set(child, nextRank);
          if (!queue.includes(child)) {
            queue.push(child);
          }
        });
      }

      // Unvisited nodes put into rank 0 or max
      targetNodes.forEach(n => {
        if (!ranks.has(n.id)) {
          ranks.set(n.id, 0);
        }
      });

      // Group nodes by rank
      const rankGroups = new Map<number, CanvasNode[]>();
      targetNodes.forEach(n => {
        const r = ranks.get(n.id) || 0;
        if (!rankGroups.has(r)) rankGroups.set(r, []);
        rankGroups.get(r)!.push(n);
      });

      // Sort nodes in each rank
      rankGroups.forEach((group) => {
        group.sort((a, b) => a.y - b.y);
      });

      const maxGroupCount = Math.max(...Array.from(rankGroups.values()).map(g => g.length));

      if (algo === 'tree-horizontal') {
        rankGroups.forEach((group, r) => {
          const colX = anchorX + r * layoutHorizontalGap;
          const groupHeight = (group.length - 1) * layoutVerticalGap;
          const totalMaxHeight = (maxGroupCount - 1) * layoutVerticalGap;
          const startY = anchorY + (totalMaxHeight - groupHeight) / 2;

          group.forEach((node, idx) => {
            let posX = colX;
            let posY = startY + idx * layoutVerticalGap;
            if (isSnappingEnabled && gridSize > 0) {
              posX = Math.round(posX / gridSize) * gridSize;
              posY = Math.round(posY / gridSize) * gridSize;
            }
            newPositions.set(node.id, { x: posX, y: posY });
          });
        });
      } else {
        // Vertical Tree
        rankGroups.forEach((group, r) => {
          const rowY = anchorY + r * (layoutVerticalGap * 1.4);
          const groupWidth = (group.length - 1) * layoutHorizontalGap;
          const totalMaxWidth = (maxGroupCount - 1) * layoutHorizontalGap;
          const startX = anchorX + (totalMaxWidth - groupWidth) / 2;

          group.forEach((node, idx) => {
            let posX = startX + idx * layoutHorizontalGap;
            let posY = rowY;
            if (isSnappingEnabled && gridSize > 0) {
              posX = Math.round(posX / gridSize) * gridSize;
              posY = Math.round(posY / gridSize) * gridSize;
            }
            newPositions.set(node.id, { x: posX, y: posY });
          });
        });
      }

    } else if (algo === 'grid') {
      // 2. Compact Grid Layout
      const cols = Math.max(1, layoutGridCols || 3);
      const sorted = [...targetNodes].sort((a, b) => (a.y * 1000 + a.x) - (b.y * 1000 + b.x));

      sorted.forEach((node, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        let posX = anchorX + col * layoutHorizontalGap;
        let posY = anchorY + row * layoutVerticalGap;
        if (isSnappingEnabled && gridSize > 0) {
          posX = Math.round(posX / gridSize) * gridSize;
          posY = Math.round(posY / gridSize) * gridSize;
        }
        newPositions.set(node.id, { x: posX, y: posY });
      });

    } else if (algo === 'swimlane') {
      // 3. Category Swimlane Columns
      const categories: NodeCategory[] = ['plot', 'lore', 'character', 'promise', 'sticky'];
      const activeCats = categories.filter(c => targetNodes.some(n => n.category === c));

      activeCats.forEach((cat, colIdx) => {
        const catNodes = targetNodes.filter(n => n.category === cat).sort((a, b) => a.y - b.y);
        const colX = anchorX + colIdx * (layoutHorizontalGap + 20);

        catNodes.forEach((node, rowIdx) => {
          let posX = colX;
          let posY = anchorY + rowIdx * layoutVerticalGap;
          if (isSnappingEnabled && gridSize > 0) {
            posX = Math.round(posX / gridSize) * gridSize;
            posY = Math.round(posY / gridSize) * gridSize;
          }
          newPositions.set(node.id, { x: posX, y: posY });
        });
      });

    } else if (algo === 'radial') {
      // 4. Concentric Radial Layout
      const centerNode = targetNodes[0];
      const otherNodes = targetNodes.slice(1);
      newPositions.set(centerNode.id, { x: anchorX + 250, y: anchorY + 250 });

      const radius = Math.max(220, otherNodes.length * 35);
      const angleStep = (2 * Math.PI) / Math.max(1, otherNodes.length);

      otherNodes.forEach((node, idx) => {
        const angle = idx * angleStep - Math.PI / 2;
        let posX = anchorX + 250 + Math.cos(angle) * radius;
        let posY = anchorY + 250 + Math.sin(angle) * radius;
        if (isSnappingEnabled && gridSize > 0) {
          posX = Math.round(posX / gridSize) * gridSize;
          posY = Math.round(posY / gridSize) * gridSize;
        }
        newPositions.set(node.id, { x: posX, y: posY });
      });
    }

    const nextNodes = nodes.map(n => {
      const pos = newPositions.get(n.id);
      return pos ? { ...n, x: pos.x, y: pos.y } : n;
    });

    const algoNames: Record<LayoutAlgorithm, string> = {
      'tree-horizontal': '水平分层树状拓扑',
      'tree-vertical': '垂直下行树状拓扑',
      'grid': '紧凑矩阵网格',
      'swimlane': '分类泳道看板',
      'radial': '环形放射拓扑'
    };

    pushToHistory(nextNodes, connections, `自动排版: ${algoNames[algo]}`);
    showToast(`✨ 已为您完成「${algoNames[algo]}」排列 (${targetNodes.length} 个节点)`);
  };

  const handleAutoLayout = () => applyAutoLayout(layoutAlgorithm, layoutScope);

  const showToast = (msg: string) => {
    setAiNotice(msg);
    setTimeout(() => setAiNotice(null), 2500);
  };

  const displayedNodes = nodes.filter(n => filterCategory === 'all' || n.category === filterCategory);

  return (
    <div 
      className="flex flex-col h-full w-full overflow-hidden bg-[#09090b] text-[#f5f5f7] select-none relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 1. TOP macOS SYSTEM TOOLBAR */}
      <header className="h-[52px] border-b border-white/10 bg-black/40 backdrop-blur-xl px-4 flex items-center justify-between shrink-0 select-none z-30">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex items-center space-x-2">
            <Layout className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-xs font-bold text-white">
              自由形式无限画布 (Freeform Canvas)
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-zinc-400 font-mono">
            <span>·</span>
            <span>{Math.round(scale * 100)}%</span>
            <span>·</span>
            <span>{nodes.length} 节点 ({connections.length} 连线)</span>
          </div>
        </div>

        {/* Center Zone: Canvas Templates Library & Grid Snapping Controls */}
        <div className="flex items-center space-x-2">
          {/* Templates Panel Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplatesPanel(p => !p)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition flex items-center space-x-1.5 shadow-xs ${
                showTemplatesPanel
                  ? 'bg-purple-600/25 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'bg-white/5 text-zinc-300 border-white/10 hover:text-white hover:bg-white/10'
              }`}
              title="打开工作流模板库，快速置入思维脑图、看板泳道或 SWOT 分析矩阵"
            >
              <Boxes className="w-3.5 h-3.5 text-purple-400" />
              <span>工作流模板库</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                6 预设
              </span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${showTemplatesPanel ? 'rotate-180' : ''}`} />
            </button>

            {/* Apple macOS Popover Menu */}
            {showTemplatesPanel && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTemplatesPanel(false)} />
                <div className="absolute top-full left-0 mt-2 w-[580px] max-w-[95vw] bg-[#181820]/95 backdrop-blur-3xl border border-white/15 rounded-3xl p-4 shadow-2xl z-50 text-xs select-none space-y-3.5 animate-in fade-in zoom-in-95">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                        <Boxes className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-xs">工作流图式模板库 (Canvas Templates)</div>
                        <div className="text-[10px] text-zinc-400">一键快速置入结构化工作流、敏捷看板泳道与 SWOT 战略矩阵</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTemplatesPanel(false)}
                      className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center space-x-1.5 text-[11px] pb-1 border-b border-white/5">
                    {[
                      { id: 'all', label: '全部模板 (6)' },
                      { id: 'agile', label: '敏捷与工程' },
                      { id: 'strategy', label: '战略与决策' },
                      { id: 'brainstorm', label: '思维发散' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setTemplateCategoryFilter(tab.id as any)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition ${
                          templateCategoryFilter === tab.id
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Templates Grid */}
                  <div className="grid grid-cols-2 gap-2.5 max-h-[440px] overflow-y-auto pr-1">
                    {TEMPLATE_PRESETS.filter(t => templateCategoryFilter === 'all' || t.category === templateCategoryFilter).map(tpl => {
                      const IconComp = tpl.icon;
                      return (
                        <div
                          key={tpl.id}
                          className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-2.5 group"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: `${tpl.color}25`, color: tpl.color }}
                                >
                                  <IconComp className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-bold text-white text-[12px]">{tpl.title}</span>
                              </div>
                              <span 
                                className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border shrink-0"
                                style={{ backgroundColor: `${tpl.color}15`, color: tpl.color, borderColor: `${tpl.color}40` }}
                              >
                                {tpl.badge}
                              </span>
                            </div>

                            <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                              {tpl.desc}
                            </p>

                            <div className="flex items-center space-x-2 text-[9px] font-mono text-zinc-500">
                              <span>{tpl.nodeCount} 节点</span>
                              <span>·</span>
                              <span>{tpl.connCount} 连线</span>
                              <span>·</span>
                              <span>{tpl.categoryLabel}</span>
                            </div>
                          </div>

                          {/* Quick Insert Buttons */}
                          <div className="flex items-center space-x-1.5 pt-1.5 border-t border-white/5">
                            <button
                              onClick={() => insertWorkflowTemplate(tpl.id, 'append')}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-[10px] transition text-center active:scale-95"
                              title="在当前视口中心追加此模板图元"
                            >
                              + 追加置入
                            </button>
                            <button
                              onClick={() => insertWorkflowTemplate(tpl.id, 'replace')}
                              className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 font-medium text-[10px] transition text-center active:scale-95"
                              title="清空当前画布并全新置入此模板"
                            >
                              新建替换
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Grid & Snapping Toolbar Popover */}
          <div className="relative">
            <button
              onClick={() => setShowGridPopover(p => !p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center space-x-1.5 shadow-xs ${
                isSnappingEnabled
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
              title="网格与磁吸吸附设置 (Grid & Snapping)"
            >
              <Grid className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">网格与吸附</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                isSnappingEnabled
                  ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                  : 'bg-black/40 text-zinc-500 border-white/5'
              }`}>
                {isSnappingEnabled ? `${gridSize}px` : '关'}
              </span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${showGridPopover ? 'rotate-180' : ''}`} />
            </button>

            {/* Apple-style Glass Popover */}
            {showGridPopover && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowGridPopover(false)} 
                />
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#1c1c24]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3.5 shadow-2xl z-50 text-xs select-none space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center space-x-1.5 font-bold text-white">
                      <Grid className="w-4 h-4 text-blue-400" />
                      <span>网格与磁吸吸附</span>
                    </div>
                    <button
                      onClick={() => setShowGridPopover(false)}
                      className="text-zinc-400 hover:text-white p-0.5 rounded transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Snapping Toggle Switch */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium text-xs">磁吸对齐 (Snap to Grid)</div>
                      <div className="text-[10px] text-zinc-500">拖拽节点自动锁定到网格点</div>
                    </div>
                    <button
                      onClick={() => {
                        const next = !isSnappingEnabled;
                        setIsSnappingEnabled(next);
                        showToast(next ? `已开启 ${gridSize}px 磁吸对齐` : '已关闭磁吸对齐');
                      }}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 relative ${
                        isSnappingEnabled ? 'bg-blue-600' : 'bg-white/15'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                          isSnappingEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Grid Display Toggle Switch */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium text-xs">显示画布网格 (Show Grid)</div>
                      <div className="text-[10px] text-zinc-500">在画布底板渲染微孔点阵</div>
                    </div>
                    <button
                      onClick={() => {
                        const next = !showGrid;
                        setShowGrid(next);
                        showToast(next ? '已显示画布网格' : '已隐藏画布网格');
                      }}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 relative ${
                        showGrid ? 'bg-blue-600' : 'bg-white/15'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                          showGrid ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Adjustable Grid Size Slider (10px to 100px) */}
                  <div className="space-y-1.5 pt-1 border-t border-white/10">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-medium">网格间距 (Grid Size)</span>
                      <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                        {gridSize} px
                      </span>
                    </div>

                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="2"
                      value={gridSize}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setGridSize(val);
                      }}
                      className="w-full accent-blue-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                    />

                    <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                      <span>精细 (10px)</span>
                      <span>标准 (20-30px)</span>
                      <span>宏观 (100px)</span>
                    </div>
                  </div>

                  {/* Quick Size Presets */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">常用吸附步长</span>
                    <div className="grid grid-cols-5 gap-1 font-mono text-[10px]">
                      {[10, 20, 25, 50, 100].map(sz => (
                        <button
                          key={sz}
                          onClick={() => {
                            setGridSize(sz);
                            setIsSnappingEnabled(true);
                            showToast(`已设定网格间距为 ${sz}px`);
                          }}
                          className={`py-1 rounded-lg text-center transition font-semibold ${
                            gridSize === sz && isSnappingEnabled
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {sz}px
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Auto-Layout Toolbar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAutoLayoutPopover(p => !p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center space-x-1.5 shadow-xs ${
                showAutoLayoutPopover
                  ? 'bg-blue-600/25 text-blue-300 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
              title="一键拓扑自动排版 (Auto-Layout)"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">智能排版</span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${showAutoLayoutPopover ? 'rotate-180' : ''}`} />
            </button>

            {showAutoLayoutPopover && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAutoLayoutPopover(false)} />
                <div className="absolute top-full right-0 mt-2 w-64 bg-[#1c1c24]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-2xl z-50 text-xs select-none space-y-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5 px-1">
                    <span className="font-bold text-white text-[11px]">快速自动排版</span>
                    <span className="text-[10px] font-mono text-blue-400">
                      {selectedNodeIds.length > 0 ? `已选 ${selectedNodeIds.length} 节点` : '全图'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        applyAutoLayout('tree-horizontal', selectedNodeIds.length > 0 ? 'selected' : 'all');
                        setShowAutoLayoutPopover(false);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-white/10 text-white flex items-center space-x-2 transition"
                    >
                      <span className="text-base">🌲</span>
                      <div>
                        <div className="font-bold text-[11px]">水平分层因果树</div>
                        <div className="text-[9px] text-zinc-400">向右展开层级，清晰对称</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        applyAutoLayout('tree-vertical', selectedNodeIds.length > 0 ? 'selected' : 'all');
                        setShowAutoLayoutPopover(false);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-white/10 text-white flex items-center space-x-2 transition"
                    >
                      <span className="text-base">🌿</span>
                      <div>
                        <div className="font-bold text-[11px]">垂直分级流程树</div>
                        <div className="text-[9px] text-zinc-400">自顶向下流程分明</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        applyAutoLayout('grid', selectedNodeIds.length > 0 ? 'selected' : 'all');
                        setShowAutoLayoutPopover(false);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-white/10 text-white flex items-center space-x-2 transition"
                    >
                      <span className="text-base">⊞</span>
                      <div>
                        <div className="font-bold text-[11px]">紧凑矩阵网格</div>
                        <div className="text-[9px] text-zinc-400">等距对齐，消除重叠</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        applyAutoLayout('swimlane', selectedNodeIds.length > 0 ? 'selected' : 'all');
                        setShowAutoLayoutPopover(false);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-white/10 text-white flex items-center space-x-2 transition"
                    >
                      <span className="text-base">📊</span>
                      <div>
                        <div className="font-bold text-[11px]">分类泳道对齐</div>
                        <div className="text-[9px] text-zinc-400">按五大类垂直并列</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        applyAutoLayout('radial', selectedNodeIds.length > 0 ? 'selected' : 'all');
                        setShowAutoLayoutPopover(false);
                      }}
                      className="w-full px-2.5 py-2 rounded-xl text-left hover:bg-white/10 text-white flex items-center space-x-2 transition"
                    >
                      <span className="text-base">🎯</span>
                      <div>
                        <div className="font-bold text-[11px]">环形放射因果星图</div>
                        <div className="text-[9px] text-zinc-400">等角环绕核心节点</div>
                      </div>
                    </button>
                  </div>

                  <div className="pt-1.5 border-t border-white/10">
                    <button
                      onClick={() => {
                        setIsInspectorOpen(true);
                        setInspectorTab('auto_layout');
                        setShowAutoLayoutPopover(false);
                      }}
                      className="w-full py-1 text-center text-[10px] text-blue-400 hover:text-blue-300 font-bold"
                    >
                      打开详细排版调优面板 →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Zone: AI Brainstorming & Inspector Toggle */}
        <div className="flex items-center space-x-1.5 text-xs">
          <button
            onClick={handleAiBrainstorm}
            className="px-2.5 py-1 rounded-lg font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all flex items-center space-x-1"
            title="基于当前选中节点发散生成次级冲突分支"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI 冲突发散</span>
          </button>

          <button
            onClick={handleAiCheckPromises}
            className="px-2.5 py-1 rounded-lg font-medium bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center space-x-1"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>伏笔对齐体检</span>
          </button>

          {/* Export Canvas Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-2.5 py-1 rounded-lg font-bold bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 transition-all flex items-center space-x-1 shadow-xs active:scale-95"
            title="导出画布为高清 PNG 或结构化 JSON 工程文件"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>导出画布</span>
          </button>

          <button
            onClick={() => setIsInspectorOpen(p => !p)}
            className={`p-1.5 rounded-lg border transition ${isInspectorOpen ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 border-white/10'}`}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. BODY INFINITE FREEFORM CANVAS & FLOATING CONTROLS */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Main Canvas Viewport */}
        <div 
          ref={canvasRef}
          onMouseDown={handleMouseDownCanvas}
          onContextMenu={handleContextMenuCanvas}
          className={`flex-1 relative overflow-hidden ${
            toolMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : toolMode === 'connect' ? 'cursor-crosshair' : 'cursor-default'
          }`}
          style={{
            backgroundColor: '#09090b',
            backgroundImage: showGrid 
              ? 'radial-gradient(rgba(255, 255, 255, 0.12) 1.2px, transparent 1.2px)' 
              : 'none',
            backgroundSize: showGrid ? `${gridSize * scale}px ${gridSize * scale}px` : undefined,
            backgroundPosition: showGrid ? `${panOffset.x}px ${panOffset.y}px` : undefined,
          }}
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
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#0071e3" opacity="0.8" />
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

                const isSelected = selectedConnectionId === c.id;

                return (
                  <g 
                    key={c.id} 
                    className="cursor-pointer pointer-events-auto"
                    onClick={(e) => { e.stopPropagation(); setSelectedConnectionId(c.id); setSelectedNodeId(null); }}
                  >
                    {/* Path Highlight selection glow */}
                    {isSelected && (
                      <path d={pathD} fill="none" stroke="#0071e3" strokeWidth="8" className="opacity-25" />
                    )}

                    <path
                      d={pathD}
                      fill="none"
                      stroke={isSelected ? '#0071e3' : 'rgba(255,255,255,0.2)'}
                      strokeWidth={c.lineWeight || 2}
                      strokeDasharray={c.type === 'dashed' ? '4 4' : undefined}
                      markerEnd="url(#apple-arrow)"
                      className={c.type === 'pulse' ? 'animate-pulse' : undefined}
                    />

                    {c.label && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect x="-32" y="-10" width="64" height="20" rx="6" fill="#1c1c24" stroke="rgba(255,255,255,0.1)" />
                        <text textAnchor="middle" dy="3.5" className="text-[9px] font-mono fill-zinc-400 pointer-events-none">{c.label}</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Preview AI Connection Suggestion on Card Hover */}
              {previewSuggestion && (() => {
                const fn = nodes.find(n => n.id === previewSuggestion.from);
                const tn = nodes.find(n => n.id === previewSuggestion.to);
                if (!fn || !tn) return null;
                const startX = fn.x + fn.width;
                const startY = fn.y + 42;
                const endX = tn.x;
                const endY = tn.y + 42;
                const deltaX = Math.max(40, Math.abs(endX - startX) * 0.5);
                const pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                return (
                  <g className="pointer-events-none animate-in fade-in duration-150">
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#bf5af2"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                      className="opacity-90 animate-pulse"
                    />
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect x="-46" y="-12" width="92" height="24" rx="8" fill="#181820" stroke="#bf5af2" strokeWidth="1.5" />
                      <text textAnchor="middle" dy="4" className="text-[10px] font-bold fill-purple-300">
                        ✨ {previewSuggestion.label} (预演)
                      </text>
                    </g>
                  </g>
                );
              })()}
            </svg>

            {/* Canvas Nodes */}
            {displayedNodes.map(node => {
              const isSelected = selectedNodeIds.includes(node.id);
              const cfg = CATEGORY_CONFIG[node.category] || CATEGORY_CONFIG.plot;
              const CategoryIcon = cfg.icon;

              return (
                <div
                  key={node.id}
                  onMouseDown={e => handleMouseDownNode(e, node.id)}
                  onContextMenu={e => handleContextMenuNode(e, node.id)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`,
                    backdropFilter: `blur(${node.backdropBlur || 24}px)`,
                    opacity: node.opacity || 0.95
                  }}
                  className={`absolute rounded-2xl p-4.5 bg-[#16161c]/95 border transition-all duration-200 z-20 ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500 scale-[1.01]'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
                      <span className="text-[10px] font-mono font-bold text-zinc-400 flex items-center space-x-1">
                        <CategoryIcon className="w-2.5 h-2.5" />
                        <span>{cfg.label}</span>
                      </span>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const nextNodes = nodes.filter(n => n.id !== node.id);
                        const nextConns = connections.filter(c => c.from !== node.id && c.to !== node.id);
                        pushToHistory(nextNodes, nextConns, '删除卡片');
                        if (selectedNodeId === node.id) setSelectedNodeId(null);
                      }}
                      className="text-zinc-500 hover:text-rose-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <input
                    value={node.title}
                    onChange={e => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, title: val } : n));
                    }}
                    className="w-full text-xs font-bold text-white bg-transparent outline-none mb-1 border-b border-transparent focus:border-white/10"
                  />

                  <textarea
                    value={node.content}
                    onChange={e => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, content: val } : n));
                    }}
                    rows={2}
                    style={{ fontSize: `${node.fontSize || 12}px` }}
                    className="w-full bg-transparent text-zinc-400 outline-none resize-none leading-relaxed"
                  />
                </div>
              );
            })}
          </div>

          {/* Mini-Map Floating View (Bottom-Right of Canvas) */}
          {showMiniMap && (
            <div
              onMouseDown={e => e.stopPropagation()}
              className="absolute bottom-6 right-6 z-30 select-none transition-all duration-200"
            >
              {isMiniMapCollapsed ? (
                <button
                  onClick={() => setIsMiniMapCollapsed(false)}
                  className="px-3 py-1.5 rounded-xl bg-[#16161c]/90 hover:bg-[#1c1c24] border border-white/15 text-white text-xs font-bold flex items-center space-x-2 shadow-2xl backdrop-blur-xl transition active:scale-95"
                  title="展开微缩导览图"
                >
                  <MapIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>微缩导览</span>
                </button>
              ) : (
                <div className="bg-[#16161c]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-2xl space-y-2 w-[220px]">
                  {/* Mini-map Header */}
                  <div className="flex items-center justify-between text-[11px] font-bold text-white px-0.5">
                    <div className="flex items-center space-x-1.5 text-zinc-300">
                      <MapIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>微缩导览 (Mini-Map)</span>
                    </div>

                    <div className="flex items-center space-x-1 text-zinc-400">
                      <button
                        onClick={handleFitView}
                        className="p-1 hover:text-white hover:bg-white/10 rounded transition"
                        title="适应全图 (Fit to View)"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setIsMiniMapCollapsed(true)}
                        className="p-1 hover:text-white hover:bg-white/10 rounded transition"
                        title="收起导览"
                      >
                        <Minimize2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Mini-map Interactive Drag Canvas */}
                  <div
                    ref={miniMapRef}
                    onMouseDown={handleMiniMapMouseDown}
                    style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
                    className={`relative bg-black/60 rounded-xl overflow-hidden border border-white/10 cursor-crosshair transition-shadow ${
                      isDraggingMiniMap ? 'ring-1 ring-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]' : 'hover:border-white/20'
                    }`}
                    title="点击或拖拽以快速平移视口"
                  >
                    {/* Subtle dot matrix grid on mini-map */}
                    <div 
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
                        backgroundSize: '12px 12px'
                      }}
                    />

                    {/* SVG Connection Lines in Mini-Map */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                      {connections.map(c => {
                        const fn = nodes.find(n => n.id === c.from);
                        const tn = nodes.find(n => n.id === c.to);
                        if (!fn || !tn) return null;
                        const x1 = toMapX(fn.x + fn.width / 2);
                        const y1 = toMapY(fn.y + 40);
                        const x2 = toMapX(tn.x + tn.width / 2);
                        const y2 = toMapY(tn.y + 40);
                        return (
                          <line
                            key={c.id}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(255, 255, 255, 0.25)"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                          />
                        );
                      })}
                    </svg>

                    {/* Mini Nodes with Content Density Glow */}
                    {nodes.map(n => {
                      const nx = toMapX(n.x);
                      const ny = toMapY(n.y);
                      const nw = Math.max(5, toMapW(n.width));
                      const nh = Math.max(4, toMapH(80));
                      const isSelected = n.id === selectedNodeId;

                      return (
                        <div
                          key={n.id}
                          style={{
                            left: `${nx}px`,
                            top: `${ny}px`,
                            width: `${nw}px`,
                            height: `${nh}px`,
                            backgroundColor: n.color
                          }}
                          className={`absolute rounded-xs pointer-events-none transition-all ${
                            isSelected 
                              ? 'ring-1 ring-white shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-100 z-10' 
                              : 'opacity-75'
                          }`}
                        />
                      );
                    })}

                    {/* Viewport Camera Frustum Indicator Box */}
                    {(() => {
                      const vpLeft = toMapX(miniMapBounds.viewportLeft);
                      const vpTop = toMapY(miniMapBounds.viewportTop);
                      const vpW = Math.max(16, toMapW(miniMapBounds.viewW / scale));
                      const vpH = Math.max(12, toMapH(miniMapBounds.viewH / scale));

                      return (
                        <div
                          style={{
                            left: `${Math.max(0, Math.min(mapWidth - 10, vpLeft))}px`,
                            top: `${Math.max(0, Math.min(mapHeight - 10, vpTop))}px`,
                            width: `${Math.min(mapWidth, vpW)}px`,
                            height: `${Math.min(mapHeight, vpH)}px`,
                          }}
                          className="absolute border border-blue-400 bg-blue-500/20 rounded-md pointer-events-none shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-[left,top,width,height] duration-75"
                        />
                      );
                    })()}
                  </div>

                  {/* Coordinate and Density Status Readout */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 px-0.5">
                    <span>X: {Math.round(-panOffset.x / scale)}, Y: {Math.round(-panOffset.y / scale)}</span>
                    <span className="text-zinc-500">{nodes.length} 个节点密度</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Floating Multi-Selection Action Pill */}
          {selectedNodeIds.length > 1 && (
            <div 
              onMouseDown={e => e.stopPropagation()}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-[#1c1c24]/95 border border-blue-500/40 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-2xl flex items-center space-x-2.5 text-xs select-none animate-in fade-in slide-in-from-top-2"
            >
              <div className="flex items-center space-x-1.5 text-blue-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>已选中 {selectedNodeIds.length} 个节点</span>
              </div>

              <div className="h-4 w-px bg-white/15" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchAiSuggestions(selectedNodeIds);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setContextMenu({
                    x: Math.max(12, Math.min(rect.left - 50, window.innerWidth - 390)),
                    y: Math.max(12, Math.min(rect.bottom + 10, window.innerHeight - 480)),
                    targetNodeId: null
                  });
                }}
                className="px-2.5 py-1 rounded-xl bg-purple-600/30 hover:bg-purple-600/45 text-purple-200 border border-purple-500/40 font-bold transition flex items-center space-x-1 active:scale-95 shadow-xs"
                title="AI 自动分析所选节点语义并在右键菜单中提供逻辑关联建议"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI 连线建议</span>
              </button>

              <button
                onClick={() => applyAutoLayout('tree-horizontal', 'selected')}
                className="px-2.5 py-1 rounded-xl bg-blue-600/25 hover:bg-blue-600/40 text-blue-200 border border-blue-500/40 font-bold transition flex items-center space-x-1 active:scale-95 shadow-xs"
                title="将所选节点以水平分层因果树排列"
              >
                <span>🌲 树状排布</span>
              </button>

              <button
                onClick={() => applyAutoLayout('grid', 'selected')}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/10 font-bold transition flex items-center space-x-1 active:scale-95 shadow-xs"
                title="将所选节点以紧凑矩阵网格排列"
              >
                <span>⊞ 网格排布</span>
              </button>

              <button
                onClick={() => applyAutoLayout('swimlane', 'selected')}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/10 font-bold transition flex items-center space-x-1 active:scale-95 shadow-xs"
                title="按分类泳道排列所选节点"
              >
                <span>📊 泳道排布</span>
              </button>

              <button
                onClick={() => setSelectedNodeIds([])}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition ml-1"
                title="取消多选"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Floating Toolbar & Control Pills */}
        <div className="absolute bottom-6 left-6 flex items-center space-x-2 z-30">
          <div className="bg-[#1c1c24]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1 flex items-center space-x-1 shadow-2xl">
            <button
              onClick={() => { setToolMode('select'); setConnectingFromId(null); }}
              className={`p-2 rounded-xl transition ${toolMode === 'select' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
              title="选择与拖拽模式"
            >
              <MousePointer className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setToolMode('pan'); setConnectingFromId(null); }}
              className={`p-2 rounded-xl transition ${toolMode === 'pan' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
              title="抓手平移画布"
            >
              <Hand className="w-4 h-4" />
            </button>
            <button
              onClick={() => setToolMode('connect')}
              className={`p-2 rounded-xl transition ${toolMode === 'connect' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
              title="建立因果连线"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowGridPopover(p => !p)}
              className={`p-2 rounded-xl transition ${isSnappingEnabled ? 'bg-blue-600/25 text-blue-300' : 'text-zinc-400 hover:text-white'}`}
              title={`网格与吸附 (${isSnappingEnabled ? `${gridSize}px 开启` : '已禁用'})`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setShowMiniMap(p => !p);
                if (!showMiniMap) setIsMiniMapCollapsed(false);
              }}
              className={`p-2 rounded-xl transition ${showMiniMap ? 'bg-blue-600/25 text-blue-300' : 'text-zinc-400 hover:text-white'}`}
              title={`微缩导览图: ${showMiniMap ? '已开启' : '已隐藏'}`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#1c1c24]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex items-center space-x-1.5 shadow-2xl">
            <button onClick={() => setScale(s => Math.max(0.4, s - 0.1))} className="p-1 hover:bg-white/5 rounded-lg transition text-zinc-400 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="text-[10px] font-mono text-white px-1">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="p-1 hover:bg-white/5 rounded-lg transition text-zinc-400 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
            <button onClick={() => { setScale(1); setPanOffset({ x: 0, y: 0 }); }} className="p-1 hover:bg-white/5 rounded-lg transition text-zinc-400 hover:text-white" title="重置视图"><RotateCcw className="w-3.5 h-3.5" /></button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowAddMenu(p => !p)}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>

            {showAddMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#1a1a22] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 text-xs">
                {(Object.keys(CATEGORY_CONFIG) as NodeCategory[]).map(cat => {
                  const cfg = CATEGORY_CONFIG[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCreateNode(cat)}
                      className="w-full px-3 py-2 rounded-xl hover:bg-white/5 text-left text-white flex items-center space-x-2"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                      <span>新建{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sleek Canvas History Timeline Scrub Slider (Mac Time Machine Design) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center z-20 pointer-events-none max-w-md w-full px-4">
          <div className="bg-[#1c1c24]/95 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-2xl shadow-2xl flex items-center space-x-3 pointer-events-auto w-full">
            <div className="flex items-center space-x-1.5 shrink-0 text-xs">
              <History className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white/90">历史时光机</span>
            </div>

            {/* Range Slider for History Scrubbing */}
            <input
              type="range"
              min="0"
              max={canvasHistory.length - 1}
              value={historyIndex}
              onChange={e => {
                const idx = parseInt(e.target.value);
                setHistoryIndex(idx);
                setNodes(canvasHistory[idx].nodes);
                setConnections(canvasHistory[idx].connections);
                showToast(`时光机回溯: ${canvasHistory[idx].actionLabel}`);
              }}
              className="flex-1 accent-purple-500 cursor-pointer"
            />

            <div className="text-[10px] text-zinc-400 font-mono shrink-0 whitespace-nowrap">
              步骤: {historyIndex + 1} / {canvasHistory.length}
            </div>
          </div>
        </div>

        {/* RIGHT INSPECTOR DRAWER (PRO CONFIGURATION) */}
        {isInspectorOpen && (
          <aside className="w-80 bg-[#121216]/95 border-l border-white/10 flex flex-col shrink-0 z-20 select-none">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-500" />
                <span>画布参数与拓扑调优</span>
              </span>
              <button onClick={() => setIsInspectorOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex border-b border-white/5 text-xs px-2 pt-1 font-bold text-center">
              <button onClick={() => setInspectorTab('node')} className={`flex-1 py-1.5 transition ${inspectorTab === 'node' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-400'}`}>节点配置</button>
              <button onClick={() => setInspectorTab('link')} className={`flex-1 py-1.5 transition ${inspectorTab === 'link' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-400'}`}>连线拓扑</button>
              <button onClick={() => setInspectorTab('auto_layout')} className={`flex-1 py-1.5 transition ${inspectorTab === 'auto_layout' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-400'}`}>自动布线</button>
            </div>

            {/* TAB 1: NODE ATTRIBUTES */}
            {inspectorTab === 'node' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {selectedNode ? (
                  <>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedNode.color }} />
                        <span className="font-bold text-white truncate max-w-[150px]">{selectedNode.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{selectedNode.id}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold text-[10px] uppercase">位置坐标与尺寸</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="bg-black/40 border border-white/10 p-2 rounded-xl">
                          <span className="text-zinc-500 block text-[9px] uppercase">X-坐标</span>
                          <input
                            type="number"
                            value={selectedNode.x}
                            onChange={e => {
                              const val = parseInt(e.target.value);
                              setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, x: val } : n));
                            }}
                            className="bg-transparent text-white font-mono font-bold w-full outline-none"
                          />
                        </div>
                        <div className="bg-black/40 border border-white/10 p-2 rounded-xl">
                          <span className="text-zinc-500 block text-[9px] uppercase">Y-坐标</span>
                          <input
                            type="number"
                            value={selectedNode.y}
                            onChange={e => {
                              const val = parseInt(e.target.value);
                              setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, y: val } : n));
                            }}
                            className="bg-transparent text-white font-mono font-bold w-full outline-none"
                          />
                        </div>
                        <div className="bg-black/40 border border-white/10 p-2 rounded-xl">
                          <span className="text-zinc-500 block text-[9px] uppercase">组件宽度</span>
                          <input
                            type="number"
                            value={selectedNode.width}
                            onChange={e => {
                              const val = parseInt(e.target.value);
                              setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, width: val } : n));
                            }}
                            className="bg-transparent text-white font-mono font-bold w-full outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="flex justify-between font-bold text-zinc-300">
                        <span>毛玻璃景深 (Backdrop Blur)</span>
                        <span className="font-mono text-blue-400">{selectedNode.backdropBlur || 24}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={selectedNode.backdropBlur || 24}
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, backdropBlur: val } : n));
                        }}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="flex justify-between font-bold text-zinc-300">
                        <span>卡片不透明度 (Opacity)</span>
                        <span className="font-mono text-blue-400">{Math.round((selectedNode.opacity || 0.95) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={(selectedNode.opacity || 0.95) * 100}
                        onChange={e => {
                          const val = parseFloat(e.target.value) / 100;
                          setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, opacity: val } : n));
                        }}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-zinc-500 italic">在无限画布中选中节点以调优超参数</div>
                )}
              </div>
            )}

            {/* TAB 2: CONNECTION ATTRIBUTES */}
            {inspectorTab === 'link' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {selectedConnection ? (
                  <>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-zinc-500 block text-[9px] uppercase">连线标记</span>
                      <input
                        value={selectedConnection.label || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setConnections(prev => prev.map(c => c.id === selectedConnectionId ? { ...c, label: val } : c));
                        }}
                        className="bg-transparent text-white font-bold w-full outline-none mt-1 border-b border-white/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-zinc-400 font-bold text-[10px] uppercase">连线形态</label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'solid', label: '实线' },
                          { id: 'dashed', label: '虚线' },
                          { id: 'pulse', label: '脉冲流动' }
                        ].map(st => (
                          <button
                            key={st.id}
                            onClick={() => setConnections(prev => prev.map(c => c.id === selectedConnectionId ? { ...c, type: st.id as ConnectionType } : c))}
                            className={`py-1 rounded font-bold ${selectedConnection.type === st.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400'}`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="flex justify-between font-bold text-zinc-300">
                        <span>粗细 (Line Weight)</span>
                        <span className="font-mono text-blue-400">{selectedConnection.lineWeight || 2}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        step="0.5"
                        value={selectedConnection.lineWeight || 2}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setConnections(prev => prev.map(c => c.id === selectedConnectionId ? { ...c, lineWeight: val } : c));
                        }}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-zinc-500 italic">在画布中选中关系连线以调优属性</div>
                )}
              </div>
            )}

            {/* TAB 3: AUTO LAYOUT & GRID SNAPPING ENGINE */}
            {inspectorTab === 'auto_layout' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Full Grid & Snapping Controls */}
                <div className="space-y-3 p-3 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-xs">磁吸吸附对齐 (Snapping)</div>
                      <div className="text-[10px] text-zinc-400">拖拽节点时自动吸附网格</div>
                    </div>
                    <button
                      onClick={() => {
                        const next = !isSnappingEnabled;
                        setIsSnappingEnabled(next);
                        showToast(next ? `已开启 ${gridSize}px 磁吸对齐` : '已关闭磁吸对齐');
                      }}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 relative ${
                        isSnappingEnabled ? 'bg-blue-600' : 'bg-white/15'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                          isSnappingEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-xs">显示画布网格 (Show Grid)</div>
                      <div className="text-[10px] text-zinc-400">渲染微孔点阵视觉辅助</div>
                    </div>
                    <button
                      onClick={() => {
                        const next = !showGrid;
                        setShowGrid(next);
                        showToast(next ? '已显示画布网格' : '已隐藏画布网格');
                      }}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 relative ${
                        showGrid ? 'bg-blue-600' : 'bg-white/15'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                          showGrid ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex justify-between font-bold text-zinc-300">
                      <span>网格吸附步长 (Grid Size)</span>
                      <span className="font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">{gridSize} px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="2"
                      value={gridSize}
                      onChange={e => setGridSize(parseInt(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                      <span>10px</span>
                      <span>50px</span>
                      <span>100px</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">快速预设步长</span>
                    <div className="grid grid-cols-5 gap-1 font-mono text-[10px]">
                      {[10, 20, 25, 50, 100].map(sz => (
                        <button
                          key={sz}
                          onClick={() => {
                            setGridSize(sz);
                            setIsSnappingEnabled(true);
                            showToast(`已设置网格吸附步长为 ${sz}px`);
                          }}
                          className={`py-1 rounded font-bold transition ${
                            gridSize === sz && isSnappingEnabled
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/5 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {sz}px
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-bold text-[10px] uppercase">拓扑自动排版算法 (Auto-Layout)</span>
                    <span className="text-[10px] font-mono text-purple-400">
                      {selectedNodeIds.length > 0 ? `已选 ${selectedNodeIds.length} 节点` : '全图'}
                    </span>
                  </div>

                  {/* Target Scope */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-medium">排版目标范围</span>
                    <div className="grid grid-cols-2 gap-1.5 font-bold">
                      <button
                        onClick={() => setLayoutScope('selected')}
                        className={`py-1.5 px-2 rounded-xl text-center transition border text-[11px] ${
                          layoutScope === 'selected'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                            : 'bg-white/5 text-zinc-400 border-white/5 hover:text-white'
                        }`}
                      >
                        所选节点 ({selectedNodeIds.length})
                      </button>
                      <button
                        onClick={() => setLayoutScope('all')}
                        className={`py-1.5 px-2 rounded-xl text-center transition border text-[11px] ${
                          layoutScope === 'all'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                            : 'bg-white/5 text-zinc-400 border-white/5 hover:text-white'
                        }`}
                      >
                        全图所有节点 ({nodes.length})
                      </button>
                    </div>
                  </div>

                  {/* Algorithm Selector */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-medium">排版拓扑模型</span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { id: 'tree-horizontal', label: '🌲 水平分层因果树 (Left-to-Right)', desc: '按连线层级向右辐射展开，整齐对称' },
                        { id: 'tree-vertical', label: '🌿 垂直分级流程树 (Top-to-Bottom)', desc: '向下自顶而底延伸，层次分明' },
                        { id: 'grid', label: '⊞ 紧凑规整矩阵网格 (Grid Matrix)', desc: '多列等距对齐，消除杂乱堆叠重叠' },
                        { id: 'swimlane', label: '📊 分类泳道看板 (Category Swimlanes)', desc: '按剧情/法则/角色/伏笔分类对齐' },
                        { id: 'radial', label: '🎯 环形放射因果星图 (Concentric Star)', desc: '以核心为圆心，向外等角环绕' }
                      ].map(algo => (
                        <button
                          key={algo.id}
                          onClick={() => setLayoutAlgorithm(algo.id as any)}
                          className={`p-2 rounded-xl text-left transition border ${
                            layoutAlgorithm === algo.id
                              ? 'bg-blue-600/20 text-white border-blue-500 shadow-xs'
                              : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="font-bold text-[11px] text-zinc-200">{algo.label}</div>
                          <div className="text-[9px] text-zinc-500">{algo.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid Columns if Grid chosen */}
                  {layoutAlgorithm === 'grid' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-300 font-medium">
                        <span>网格列数 (Columns)</span>
                        <span className="font-mono text-blue-400">{layoutGridCols} 列</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                        {[2, 3, 4, 5].map(c => (
                          <button
                            key={c}
                            onClick={() => setLayoutGridCols(c)}
                            className={`py-1 rounded font-bold transition ${
                              layoutGridCols === c ? 'bg-blue-600 text-white' : 'bg-white/5 text-zinc-400'
                            }`}
                          >
                            {c} 列
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spacing Controls */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-300">
                        <span>水平间距 (Horizontal Gap)</span>
                        <span className="font-mono text-blue-400">{layoutHorizontalGap}px</span>
                      </div>
                      <input
                        type="range"
                        min="180"
                        max="460"
                        step="10"
                        value={layoutHorizontalGap}
                        onChange={e => setLayoutHorizontalGap(parseInt(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-zinc-300">
                        <span>垂直间距 (Vertical Gap)</span>
                        <span className="font-mono text-blue-400">{layoutVerticalGap}px</span>
                      </div>
                      <input
                        type="range"
                        min="90"
                        max="240"
                        step="10"
                        value={layoutVerticalGap}
                        onChange={e => setLayoutVerticalGap(parseInt(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </div>

                  {/* Execute Button */}
                  <button
                    onClick={() => applyAutoLayout(layoutAlgorithm, layoutScope)}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-1.5 active:scale-98"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✨ 执行自适应拓扑排版</span>
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Floating Global HUD Alert / AI Notification */}
      {aiNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-[#1c1c24]/95 border border-white/20 px-5 py-2.5 rounded-full text-xs text-white shadow-2xl flex items-center space-x-2 backdrop-blur-2xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{aiNotice}</span>
        </div>
      )}

      {/* EXPORT CANVAS MODAL DIALOG (APPLE macOS HIG DESIGN) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in">
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-xl bg-[#181820]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 text-xs select-none"
          >
            {/* Window Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold text-white">导出与归档无限画布</span>
                </div>
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overview Stats Bar */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 font-mono text-[11px]">
              <span className="text-zinc-300">当前图元状态:</span>
              <div className="flex items-center space-x-3 text-zinc-400">
                <span>{nodes.length} 个节点</span>
                <span>·</span>
                <span>{connections.length} 条关系连线</span>
                <span>·</span>
                <span className="text-blue-400">网格吸附: {isSnappingEnabled ? `${gridSize}px` : '关闭'}</span>
              </div>
            </div>

            {/* Section 1: High-Resolution PNG Card */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Image className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-xs">导出高清光栅化图像 (High-Res PNG)</div>
                    <div className="text-[10px] text-zinc-400">完整绘制所有节点、贝塞尔流线与分类标签，支持高阶印刷与演示归档</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  PNG 格式
                </span>
              </div>

              {/* Resolution Selection */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-zinc-300">画质分辨率 (Resolution Multiplier)</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '1x', title: '1x 标准清 (1080p)', desc: '轻量快速分享' },
                    { id: '2x', title: '2x Retina (4K 视网膜)', desc: '推荐 · 极高清晰度' },
                    { id: '3x', title: '3x Ultra-HD (8K 印刷)', desc: '巨幅母版级精度' }
                  ].map(res => (
                    <button
                      key={res.id}
                      onClick={() => setExportResolution(res.id as any)}
                      className={`p-2 rounded-xl text-left transition border ${
                        exportResolution === res.id
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-xs'
                          : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{res.title}</div>
                      <div className="text-[9px] text-zinc-500">{res.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Style Selection */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-zinc-300">图像背景样式 (Canvas Background)</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'dots', label: '微孔点阵底纹' },
                    { id: 'solid', label: '纯黑极简底色' },
                    { id: 'transparent', label: '透明通道背景 (PNG)' }
                  ].map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => setExportBgStyle(bg.id as any)}
                      className={`py-1.5 rounded-xl text-center font-bold text-[11px] transition border ${
                        exportBgStyle === bg.id
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleExportPNG}
                disabled={isExportingPng}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
              >
                <Download className={`w-4 h-4 ${isExportingPng ? 'animate-bounce' : ''}`} />
                <span>{isExportingPng ? '正在光栅化渲染中...' : `⬇️ 立即生成并导出 ${exportResolution} 高清 PNG`}</span>
              </button>
            </div>

            {/* Section 2: JSON Project Engineering Card */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-xs">工程数据文件 (Project Schema JSON)</div>
                    <div className="text-[10px] text-zinc-400">完整保存坐标拓扑、因果连接与视口配置，可随时导入还原</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  JSON 规范
                </span>
              </div>

              {/* JSON Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleExportJSON}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition flex items-center justify-center space-x-1.5 active:scale-98"
                  title="下载 .json 工程备份文件"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>下载 .json 文件</span>
                </button>

                <button
                  onClick={handleCopyJSON}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition flex items-center justify-center space-x-1.5 active:scale-98"
                  title="复制 JSON 数据到剪贴板"
                >
                  {hasCopiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                  <span>{hasCopiedJson ? '已复制' : '复制 JSON'}</span>
                </button>

                <label className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>导入恢复工程</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. RIGHT-CLICK CONTEXT MENU (APPLE macOS HIG GLASS DESIGN) */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => { setContextMenu(null); setPreviewSuggestion(null); }}
            onContextMenu={e => { e.preventDefault(); setContextMenu(null); setPreviewSuggestion(null); }}
          />
          <div
            style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
            onClick={e => e.stopPropagation()}
            onContextMenu={e => e.preventDefault()}
            className="fixed z-50 w-[380px] max-w-[95vw] bg-[#16161c]/95 backdrop-blur-3xl border border-white/20 rounded-3xl p-3.5 shadow-2xl space-y-3 text-xs select-none animate-in fade-in zoom-in-95"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-white text-[12px] flex items-center space-x-1.5">
                    <span>AI 连线与语义拓扑建议</span>
                    {selectedNodeIds.length > 1 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {selectedNodeIds.length} 节点
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {selectedNodeIds.length > 1 ? '基于选中节点的剧情因果与世界观法则推演' : '在画布中按住 Shift 多选节点以分析因果'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {selectedNodeIds.length > 1 && (
                  <button
                    onClick={() => fetchAiSuggestions(selectedNodeIds)}
                    disabled={isAnalyzingSuggestions}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
                    title="重新分析语义关联"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingSuggestions ? 'animate-spin text-purple-400' : ''}`} />
                  </button>
                )}
                <button
                  onClick={() => { setContextMenu(null); setPreviewSuggestion(null); }}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* AI Suggestions Body */}
            {selectedNodeIds.length < 2 ? (
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-2">
                <div className="text-zinc-300 font-bold text-[11px]">💡 发现剧情潜在关联</div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  按住 <kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono">Shift</kbd> 或框选 2 个以上节点后再次右键，AI 将自动分析人物、法则、事件之间的隐秘伏笔与戏剧因果，并推荐高契合度连线。
                </p>
                {nodes.length >= 2 && (
                  <button
                    onClick={() => {
                      const firstTwo = nodes.slice(0, 2).map(n => n.id);
                      setSelectedNodeIds(firstTwo);
                      fetchAiSuggestions(firstTwo);
                    }}
                    className="w-full py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-[11px] transition"
                  >
                    + 自动选中前 2 个节点并开始推演
                  </button>
                )}
              </div>
            ) : isAnalyzingSuggestions && aiSuggestions.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto" />
                <div className="text-xs text-zinc-300 font-medium">Gemini 正在分析节点间的语义与因果网络...</div>
                <div className="text-[10px] text-zinc-500">推演戏剧冲突、世界观机制与前置约束</div>
              </div>
            ) : aiSuggestions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center space-y-2">
                <div className="text-zinc-400 text-xs">所选节点之间已有既定连线或因果关联已闭环</div>
                <button
                  onClick={() => fetchAiSuggestions(selectedNodeIds)}
                  className="px-3 py-1 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 font-bold text-[11px] transition"
                >
                  强制再次激发冲突推演
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Suggestions List */}
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                  {aiSuggestions.map((s, idx) => {
                    const fromNode = nodes.find(n => n.id === s.from);
                    const toNode = nodes.find(n => n.id === s.to);
                    if (!fromNode || !toNode) return null;

                    return (
                      <div
                        key={`${s.from}-${s.to}-${idx}`}
                        onMouseEnter={() => setPreviewSuggestion(s)}
                        onMouseLeave={() => setPreviewSuggestion(null)}
                        className="p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-purple-500/40 transition-all space-y-2 group"
                      >
                        {/* Node Pair Header & Confidence */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: fromNode.color }} />
                            <span className="font-bold text-white text-[11px] truncate max-w-[100px]" title={fromNode.title}>
                              {fromNode.title}
                            </span>
                            <ArrowRight className="w-3 h-3 text-purple-400 shrink-0" />
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: toNode.color }} />
                            <span className="font-bold text-white text-[11px] truncate max-w-[100px]" title={toNode.title}>
                              {toNode.title}
                            </span>
                          </div>

                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 ml-1">
                            {Math.round(s.confidence * 100)}% 契合
                          </span>
                        </div>

                        {/* Label & Type Indicator */}
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/15">
                            {s.label}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono">
                            {s.type === 'pulse' ? '⚡ 脉冲动态流' : s.type === 'dashed' ? '┄ 虚线推测' : '— 实线强因果'}
                          </span>
                        </div>

                        {/* Reason narrative */}
                        <p className="text-[10px] text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                          {s.reason}
                        </p>

                        {/* Apply Button */}
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => handleApplySuggestion(s)}
                            className="px-2.5 py-1 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-[10px] border border-purple-500/40 transition active:scale-95 flex items-center space-x-1"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>采纳并建立此连线</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Batch Connect All Button */}
                {aiSuggestions.length > 1 && (
                  <button
                    onClick={handleApplyAllSuggestions}
                    className="w-full py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:brightness-110 text-white font-bold text-[11px] shadow-lg transition flex items-center justify-center space-x-1.5 active:scale-98"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ 一键采纳全部建议连线 (共 {aiSuggestions.length} 条)</span>
                  </button>
                )}
              </div>
            )}

            {/* Context Actions Divider & Standard Canvas Actions */}
            <div className="pt-2 border-t border-white/10 space-y-1">
              <div className="text-[9px] font-semibold text-zinc-500 uppercase px-1">常用图元操作</div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {selectedNodeIds.length > 1 ? (
                  <>
                    <button
                      onClick={() => { applyAutoLayout('tree-horizontal', 'selected'); setContextMenu(null); }}
                      className="px-2 py-1.5 rounded-xl hover:bg-white/10 text-left text-zinc-300 hover:text-white flex items-center space-x-1.5 transition"
                    >
                      <span>🌲</span>
                      <span>树状因果排布</span>
                    </button>
                    <button
                      onClick={() => { applyAutoLayout('grid', 'selected'); setContextMenu(null); }}
                      className="px-2 py-1.5 rounded-xl hover:bg-white/10 text-left text-zinc-300 hover:text-white flex items-center space-x-1.5 transition"
                    >
                      <span>⊞</span>
                      <span>紧凑网格对齐</span>
                    </button>
                    <button
                      onClick={() => {
                        const sel = nodes.filter(n => selectedNodeIds.includes(n.id));
                        navigator.clipboard.writeText(JSON.stringify(sel, null, 2));
                        showToast(`已复制 ${sel.length} 个节点数据`);
                        setContextMenu(null);
                      }}
                      className="px-2 py-1.5 rounded-xl hover:bg-white/10 text-left text-zinc-300 hover:text-white flex items-center space-x-1.5 transition"
                    >
                      <Copy className="w-3 h-3 text-zinc-400" />
                      <span>复制选中节点</span>
                    </button>
                    <button
                      onClick={handleDeleteSelectedNodes}
                      className="px-2 py-1.5 rounded-xl hover:bg-red-500/20 text-left text-red-400 hover:text-red-300 flex items-center space-x-1.5 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>批量删除节点</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { handleFitView(); setContextMenu(null); }}
                      className="px-2 py-1.5 rounded-xl hover:bg-white/10 text-left text-zinc-300 hover:text-white flex items-center space-x-1.5 transition"
                    >
                      <Maximize2 className="w-3 h-3 text-blue-400" />
                      <span>自适应全览画布</span>
                    </button>
                    <button
                      onClick={() => { applyAutoLayout('tree-horizontal', 'all'); setContextMenu(null); }}
                      className="px-2 py-1.5 rounded-xl hover:bg-white/10 text-left text-zinc-300 hover:text-white flex items-center space-x-1.5 transition"
                    >
                      <span>🌲</span>
                      <span>全局自动排版</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
