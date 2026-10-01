import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  TreeItem, 
  KnowledgeBase 
} from './MaterialsView.tsx';
import { 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Folder, 
  FileText, 
  Globe, 
  StickyNote, 
  Compass, 
  ExternalLink, 
  Star, 
  Check, 
  Copy,
  ChevronRight,
  Eye,
  Tag,
  X,
  Link,
  FolderInput,
  Download,
  Trash2,
  FolderOpen,
  ArrowRight,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

export interface CustomEdge {
  sourceId: string;
  targetId: string;
  label: string;
}

interface MaterialKnowledgeGraphProps {
  currentKb: KnowledgeBase;
  treeItems: TreeItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onSwitchToReader: (id: string) => void;
  onMoveItem?: (itemId: string, newParentId: string | null) => void;
  onDeleteItem?: (itemId: string) => void;
  onToggleFavorite?: (itemId: string) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  type: 'kb_root' | 'folder' | 'file';
  kind: 'root' | 'folder' | 'web' | 'text' | 'file' | 'ai' | 'report' | 'note';
  color: string;
  radius: number;
  tags?: string[];
  favorite?: number;
  body?: string;
  source_url?: string;
  updatedAt?: string;
  parentId?: string | null;
  itemRef?: TreeItem;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'hierarchy' | 'tag_similarity' | 'custom_relation';
  label?: string;
}

export const MaterialKnowledgeGraph: React.FC<MaterialKnowledgeGraphProps> = ({
  currentKb,
  treeItems,
  selectedItemId,
  onSelectItem,
  onSwitchToReader,
  onMoveItem,
  onDeleteItem,
  onToggleFavorite
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [activeInspectorNode, setActiveInspectorNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'folders' | 'files' | 'favorite'>('all');
  const [showTagLinks, setShowTagLinks] = useState(true);

  // Custom User Links in Graph
  const [customEdges, setCustomEdges] = useState<CustomEdge[]>([
    { sourceId: 'item-1', targetId: 'item-3', label: '盟约互利制约' }
  ]);

  // Context Menu State (macOS Frosted Glass)
  const [contextMenu, setContextMenu] = useState<{
    node: GraphNode;
    x: number;
    y: number;
  } | null>(null);

  // Sub-modals from Context Menu
  const [showMoveModal, setShowMoveModal] = useState<GraphNode | null>(null);
  const [showLinkModal, setShowLinkModal] = useState<GraphNode | null>(null);
  const [targetLinkId, setTargetLinkId] = useState<string>('');
  const [targetLinkLabel, setTargetLinkLabel] = useState<string>('因果伏笔关联');
  
  // Toast HUD notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Zoom Transform ref
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Folders in current KB for Quick Move
  const currentKbFolders = treeItems.filter(i => i.kbId === currentKb.id && i.type === 'folder');

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    // 1. Build Nodes & Links from treeItems for current KB
    const kbItems = treeItems.filter(i => i.kbId === currentKb.id);

    const nodes: GraphNode[] = [
      // Central Root Node for current KB
      {
        id: `root-${currentKb.id}`,
        title: currentKb.name,
        type: 'kb_root',
        kind: 'root',
        color: currentKb.color || '#0a84ff',
        radius: 26,
        body: currentKb.description,
        updatedAt: '根知识库'
      }
    ];

    // Add folders & files
    kbItems.forEach(item => {
      let color = '#0a84ff';
      let radius = 18;

      if (item.type === 'folder') {
        color = '#38bdf8'; // Sky blue for folders
        radius = 22;
      } else {
        if (item.kind === 'web') color = '#34d399'; // Emerald
        else if (item.kind === 'ai') color = '#c084fc'; // Purple
        else if (item.kind === 'report') color = '#38bdf8'; // Cyan
        else if (item.kind === 'note') color = '#fbbf24'; // Amber
        else color = '#60a5fa'; // Blue
      }

      nodes.push({
        id: item.id,
        title: item.title,
        type: item.type,
        kind: item.kind,
        color,
        radius,
        tags: item.tags,
        favorite: item.favorite,
        body: item.body,
        source_url: item.source_url,
        updatedAt: item.updatedAt,
        parentId: item.parentId,
        itemRef: item
      });
    });

    // Build Links
    const links: GraphLink[] = [];

    // Hierarchical Links
    kbItems.forEach(item => {
      if (item.parentId === null) {
        // Connect to KB root
        links.push({
          source: `root-${currentKb.id}`,
          target: item.id,
          type: 'hierarchy'
        });
      } else {
        // Connect to parent folder
        links.push({
          source: item.parentId,
          target: item.id,
          type: 'hierarchy'
        });
      }
    });

    // Custom User Edges (新建关联)
    customEdges.forEach(edge => {
      const srcExists = nodes.some(n => n.id === edge.sourceId);
      const tgtExists = nodes.some(n => n.id === edge.targetId);
      if (srcExists && tgtExists) {
        links.push({
          source: edge.sourceId,
          target: edge.targetId,
          type: 'custom_relation',
          label: edge.label
        });
      }
    });

    // Tag association links (Cross-item connections)
    if (showTagLinks) {
      const fileNodes = nodes.filter(n => n.type === 'file' && n.tags && n.tags.length > 0);
      for (let i = 0; i < fileNodes.length; i++) {
        for (let j = i + 1; j < fileNodes.length; j++) {
          const sharedTags = fileNodes[i].tags?.filter(t => fileNodes[j].tags?.includes(t)) || [];
          if (sharedTags.length > 0) {
            links.push({
              source: fileNodes[i].id,
              target: fileNodes[j].id,
              type: 'tag_similarity',
              label: sharedTags[0]
            });
          }
        }
      }
    }

    // Filter nodes if requested
    let displayNodes = nodes;
    if (filterType === 'folders') {
      displayNodes = nodes.filter(n => n.type === 'kb_root' || n.type === 'folder');
    } else if (filterType === 'files') {
      displayNodes = nodes.filter(n => n.type === 'kb_root' || n.type === 'file');
    } else if (filterType === 'favorite') {
      displayNodes = nodes.filter(n => n.type === 'kb_root' || n.favorite === 1);
    }

    const displayNodeIds = new Set(displayNodes.map(n => n.id));
    const displayLinks = links.filter(l => 
      displayNodeIds.has(typeof l.source === 'string' ? l.source : (l.source as GraphNode).id) &&
      displayNodeIds.has(typeof l.target === 'string' ? l.target : (l.target as GraphNode).id)
    );

    // 2. Clear SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    // Close context menu on svg background click
    svg.on('click', () => setContextMenu(null));

    // Defs for glowing gradients & shadows
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'apple-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g').attr('class', 'graph-viewport');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        if (contextMenu) setContextMenu(null);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Center view initially
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(1));

    // 3. Force Simulation setup
    const simulation = d3.forceSimulation<GraphNode>(displayNodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(displayLinks).id(d => d.id).distance(d => d.type === 'hierarchy' ? 95 : d.type === 'custom_relation' ? 120 : 160).strength(0.8))
      .force('charge', d3.forceManyBody().strength(d => (d as GraphNode).type === 'kb_root' ? -550 : -280))
      .force('center', d3.forceCenter(0, 0).strength(0.08))
      .force('collide', d3.forceCollide<GraphNode>().radius(d => d.radius + 28).iterations(2));

    // Render Links
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup.selectAll<SVGLineElement, GraphLink>('line')
      .data(displayLinks)
      .enter()
      .append('line')
      .attr('stroke', d => d.type === 'custom_relation' ? '#ffd60a' : d.type === 'tag_similarity' ? '#bf5af2' : 'rgba(255, 255, 255, 0.18)')
      .attr('stroke-opacity', d => d.type === 'custom_relation' ? 0.75 : d.type === 'tag_similarity' ? 0.35 : 0.6)
      .attr('stroke-width', d => d.type === 'custom_relation' ? 2.2 : d.type === 'tag_similarity' ? 1.5 : 2)
      .attr('stroke-dasharray', d => d.type === 'tag_similarity' ? '4 3' : d.type === 'custom_relation' ? '2 2' : 'none');

    // Render Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll<SVGGElement, GraphNode>('g')
      .data(displayNodes)
      .enter()
      .append('g')
      .attr('class', 'cursor-pointer select-none')
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        link
          .attr('stroke', l => (l.source === d || l.target === d) ? '#0a84ff' : 'rgba(255, 255, 255, 0.08)')
          .attr('stroke-width', l => (l.source === d || l.target === d) ? 3 : 1)
          .attr('stroke-opacity', l => (l.source === d || l.target === d) ? 0.9 : 0.2);
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
        link
          .attr('stroke', l => l.type === 'custom_relation' ? '#ffd60a' : l.type === 'tag_similarity' ? '#bf5af2' : 'rgba(255, 255, 255, 0.18)')
          .attr('stroke-width', l => l.type === 'custom_relation' ? 2.2 : l.type === 'tag_similarity' ? 1.5 : 2)
          .attr('stroke-opacity', l => l.type === 'custom_relation' ? 0.75 : l.type === 'tag_similarity' ? 0.35 : 0.6);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setContextMenu(null);
        setActiveInspectorNode(d);
        if (d.type === 'file') {
          onSelectItem(d.id);
        }
      })
      .on('contextmenu', (event, d) => {
        event.preventDefault();
        event.stopPropagation();
        const containerRect = containerRef.current?.getBoundingClientRect();
        const offsetX = containerRect ? event.clientX - containerRect.left : event.clientX;
        const offsetY = containerRect ? event.clientY - containerRect.top : event.clientY;

        setContextMenu({
          node: d,
          x: Math.min(offsetX, (containerRect?.width || 800) - 220),
          y: Math.min(offsetY, (containerRect?.height || 600) - 240)
        });
      });

    // Outer Halo Circle
    node.append('circle')
      .attr('r', d => d.radius + 6)
      .attr('fill', d => d.color)
      .attr('fill-opacity', 0.12)
      .attr('stroke', d => d.color)
      .attr('stroke-opacity', 0.35)
      .attr('stroke-width', 1);

    // Inner Solid Circle
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => d.type === 'kb_root' ? d.color : 'rgba(28, 28, 30, 0.95)')
      .attr('stroke', d => (selectedItemId === d.id) ? '#ffffff' : d.color)
      .attr('stroke-width', d => (selectedItemId === d.id) ? 2.5 : 1.8)
      .style('filter', d => (selectedItemId === d.id || d.type === 'kb_root') ? 'url(#apple-glow)' : 'none');

    // Center Node Emoji/Icon
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', d => d.type === 'kb_root' ? '14px' : '11px')
      .attr('fill', '#ffffff')
      .text(d => {
        if (d.type === 'kb_root') return '🔮';
        if (d.type === 'folder') return '📁';
        if (d.kind === 'web') return '🌐';
        if (d.kind === 'ai') return '✨';
        if (d.kind === 'report') return '📊';
        if (d.kind === 'note') return '📝';
        return '📄';
      });

    // Node Title Label (macOS Frosted Badge Style)
    const labelGroup = node.append('g')
      .attr('transform', d => `translate(0, ${d.radius + 14})`);

    labelGroup.append('rect')
      .attr('x', d => -Math.min(d.title.length * 5.5 + 8, 70))
      .attr('y', -7)
      .attr('width', d => Math.min(d.title.length * 11 + 16, 140))
      .attr('height', 16)
      .attr('rx', 5)
      .attr('fill', 'rgba(18, 18, 20, 0.85)')
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke-width', 0.5);

    labelGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('y', 4)
      .text(d => d.title.length > 10 ? d.title.slice(0, 9) + '…' : d.title);

    // Simulation Tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x || 0)
        .attr('y1', d => (d.source as GraphNode).y || 0)
        .attr('x2', d => (d.target as GraphNode).x || 0)
        .attr('y2', d => (d.target as GraphNode).y || 0);

      node.attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [currentKb.id, treeItems, selectedItemId, filterType, showTagLinks, customEdges]);

  // Handle Export Node Content
  const handleExportNodeContent = (node: GraphNode) => {
    const title = node.title || '知识条目';
    const body = node.body || '无正文内容';
    const tags = node.tags?.join(', ') || '未打标';
    const contentToExport = `# ${title}\n\n**所属知识库**: ${currentKb.name}\n**标签**: ${tags}\n**更新时间**: ${node.updatedAt || '未知'}\n\n---\n\n${body}`;

    // 1. Download as Markdown file
    const blob = new Blob([contentToExport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/[\\/:*?"<>|]/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 2. Copy to clipboard
    navigator.clipboard.writeText(contentToExport);
    showToast(`已导出《${title}》并复制 Markdown 到剪贴板`);
    setContextMenu(null);
  };

  // Handle Quick Move Node to Folder
  const handleExecuteMove = (targetFolderId: string | null) => {
    if (!showMoveModal) return;
    if (onMoveItem) {
      onMoveItem(showMoveModal.id, targetFolderId);
    }
    const folderName = targetFolderId 
      ? treeItems.find(i => i.id === targetFolderId)?.title 
      : '根目录';
    showToast(`已将《${showMoveModal.title}》移动至【${folderName}】`);
    setShowMoveModal(null);
    setContextMenu(null);
  };

  // Handle Create Custom Association
  const handleExecuteCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showLinkModal || !targetLinkId) return;

    setCustomEdges(prev => [
      ...prev,
      {
        sourceId: showLinkModal.id,
        targetId: targetLinkId,
        label: targetLinkLabel || '因果联想'
      }
    ]);

    const targetNode = treeItems.find(i => i.id === targetLinkId);
    showToast(`已在《${showLinkModal.title}》与《${targetNode?.title || '目标条目'}》间建立关联`);
    setShowLinkModal(null);
    setContextMenu(null);
    setTargetLinkId('');
  };

  // Zoom Controls
  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(250)
      .call(zoomBehaviorRef.current.scaleBy, factor);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !containerRef.current || !zoomBehaviorRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(1));
  };

  return (
    <div 
      ref={containerRef} 
      onClick={() => setContextMenu(null)}
      className="relative w-full h-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1b24] via-[#101014] to-[#0a0a0c] select-none flex"
    >
      {/* Background Subtle Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />

      {/* SVG Canvas */}
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating macOS Glass Controls */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
        <div className="p-1 rounded-xl bg-[var(--apple-surface)]/90 backdrop-blur-2xl border border-[var(--apple-border-strong)] shadow-2xl flex items-center gap-1 text-xs">
          <span className="px-2 py-1 text-[11px] font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
            <span>macOS 联想知识星系</span>
          </span>

          <div className="h-4 w-px bg-[var(--apple-separator)] mx-1" />

          {/* Filter Pills */}
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
              filterType === 'all' 
                ? 'bg-[var(--apple-accent)] text-white font-semibold' 
                : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)]'
            }`}
          >
            全部节点
          </button>
          <button
            onClick={() => setFilterType('folders')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
              filterType === 'folders' 
                ? 'bg-[var(--apple-accent)] text-white font-semibold' 
                : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)]'
            }`}
          >
            仅目录
          </button>
          <button
            onClick={() => setFilterType('files')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
              filterType === 'files' 
                ? 'bg-[var(--apple-accent)] text-white font-semibold' 
                : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)]'
            }`}
          >
            仅文件
          </button>

          <div className="h-4 w-px bg-[var(--apple-separator)] mx-1" />

          {/* Toggle Tag Links */}
          <button
            onClick={() => setShowTagLinks(!showTagLinks)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all ${
              showTagLinks
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-semibold'
                : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
            }`}
            title="显示/隐藏基于共享标签的跨条目联想引力线"
          >
            <Tag className="w-3 h-3" />
            <span>标签共现连线</span>
          </button>
        </div>
      </div>

      {/* Right Floating Zoom Toolbox */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
        <div className="p-1 rounded-xl bg-[var(--apple-surface)]/90 backdrop-blur-2xl border border-[var(--apple-border-strong)] shadow-2xl flex items-center gap-1 text-xs">
          <button
            onClick={() => handleZoom(1.25)}
            className="p-1.5 rounded-lg text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)]"
            title="放大视角"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-1.5 rounded-lg text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)]"
            title="缩小视角"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)]"
            title="居中重置"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Apple-grade Toast HUD */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-[var(--apple-surface)]/95 backdrop-blur-2xl border border-[var(--apple-border-strong)] shadow-2xl text-xs font-semibold text-[var(--apple-text-primary)] flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="px-3 py-1.5 rounded-xl bg-[var(--apple-surface)]/90 backdrop-blur-2xl border border-[var(--apple-border-strong)] shadow-2xl flex items-center gap-3 text-[10px] font-mono text-[var(--apple-text-secondary)]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0a84ff]" />
            <span>知识库根</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
            <span>分类文件夹</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ffd60a]" />
            <span>自定义关联</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#c084fc]" />
            <span>AI提炼</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#fbbf24]" />
            <span>灵感备忘</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* macOS FROSTED GLASS CONTEXT MENU (磨砂玻璃右键菜单) */}
      {/* ============================================================ */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`
          }}
          className="absolute z-50 w-52 rounded-2xl bg-[var(--apple-surface)]/85 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-[var(--apple-border-strong)] shadow-[0_18px_40px_rgba(0,0,0,0.4)] p-1.5 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-100 select-none"
        >
          {/* Header Title */}
          <div className="px-2.5 py-1 flex items-center gap-1.5 border-b border-[var(--apple-separator)] mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: contextMenu.node.color }} />
            <span className="font-bold text-[var(--apple-text-primary)] text-[11px] truncate max-w-[140px]">
              {contextMenu.node.title}
            </span>
          </div>

          {/* Action 1: 新建关联 */}
          <button
            onClick={() => {
              setShowLinkModal(contextMenu.node);
              setContextMenu(null);
            }}
            className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-[var(--apple-subtle)] text-[var(--apple-text-primary)] transition-colors"
          >
            <Link className="w-3.5 h-3.5 text-purple-400" />
            <span>新建关联 (Link)</span>
          </button>

          {/* Action 2: 快速移动至文件夹 */}
          {contextMenu.node.type === 'file' && (
            <button
              onClick={() => {
                setShowMoveModal(contextMenu.node);
                setContextMenu(null);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-[var(--apple-subtle)] text-[var(--apple-text-primary)] transition-colors"
            >
              <FolderInput className="w-3.5 h-3.5 text-sky-400" />
              <span>快速移动至文件夹...</span>
            </button>
          )}

          {/* Action 3: 导出节点内容 */}
          <button
            onClick={() => handleExportNodeContent(contextMenu.node)}
            className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-[var(--apple-subtle)] text-[var(--apple-text-primary)] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>导出节点内容 (Markdown)</span>
          </button>

          <div className="border-t border-[var(--apple-separator)] my-1" />

          {/* Action 4: 在工作台打开 */}
          {contextMenu.node.type === 'file' && (
            <button
              onClick={() => {
                onSwitchToReader(contextMenu.node.id);
                setContextMenu(null);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-[var(--apple-subtle)] text-[var(--apple-accent)] font-semibold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>在工作台精读与提炼</span>
            </button>
          )}

          {/* Action 5: 标为星标 */}
          {contextMenu.node.type === 'file' && onToggleFavorite && (
            <button
              onClick={() => {
                onToggleFavorite(contextMenu.node.id);
                setContextMenu(null);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] hover:text-amber-400 transition-colors"
            >
              <Star className={`w-3.5 h-3.5 ${contextMenu.node.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{contextMenu.node.favorite ? '取消星标收藏' : '标为核心星标'}</span>
            </button>
          )}

          {/* Action 6: 删除节点 */}
          {contextMenu.node.type !== 'kb_root' && onDeleteItem && (
            <button
              onClick={() => {
                if (confirm(`确定从知识库中删除《${contextMenu.node.title}》吗？`)) {
                  onDeleteItem(contextMenu.node.id);
                  setContextMenu(null);
                  showToast(`已删除《${contextMenu.node.title}》`);
                }
              }}
              className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left hover:bg-rose-500/15 text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>从知识库中移除</span>
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* QUICK MOVE TO FOLDER MODAL */}
      {/* ============================================================ */}
      {showMoveModal && (
        <div 
          onClick={() => setShowMoveModal(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--apple-surface)]/95 backdrop-blur-2xl border border-[var(--apple-border-strong)] rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl select-none"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--apple-separator)]">
              <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                <FolderInput className="w-4 h-4 text-sky-400" />
                <span>快速移动至文件夹</span>
              </span>
              <button onClick={() => setShowMoveModal(null)} className="text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-[11px] text-[var(--apple-text-secondary)]">
                移动条目：<strong className="text-[var(--apple-text-primary)]">{showMoveModal.title}</strong>
              </p>

              {/* Folder options */}
              <div className="space-y-1 pt-2 max-h-52 overflow-y-auto">
                <button
                  onClick={() => handleExecuteMove(null)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    showMoveModal.parentId === null
                      ? 'border-[var(--apple-accent)] bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)] font-semibold'
                      : 'border-[var(--apple-border)] bg-[var(--apple-subtle)] text-[var(--apple-text-primary)] hover:border-[var(--apple-accent)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[var(--apple-accent)]" />
                    <span>🔮 知识库根目录 (Root)</span>
                  </div>
                  {showMoveModal.parentId === null && <Check className="w-3.5 h-3.5" />}
                </button>

                {currentKbFolders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => handleExecuteMove(folder.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      showMoveModal.parentId === folder.id
                        ? 'border-[var(--apple-accent)] bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)] font-semibold'
                        : 'border-[var(--apple-border)] bg-[var(--apple-subtle)] text-[var(--apple-text-primary)] hover:border-[var(--apple-accent)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FolderOpen className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="truncate">{folder.title}</span>
                    </div>
                    {showMoveModal.parentId === folder.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CREATE ASSOCIATION MODAL */}
      {/* ============================================================ */}
      {showLinkModal && (
        <div 
          onClick={() => setShowLinkModal(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--apple-surface)]/95 backdrop-blur-2xl border border-[var(--apple-border-strong)] rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl select-none"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--apple-separator)]">
              <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                <Link className="w-4 h-4 text-purple-400" />
                <span>新建知识图谱联想关联</span>
              </span>
              <button onClick={() => setShowLinkModal(null)} className="text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteCreateLink} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--apple-text-secondary)] mb-1 font-semibold">
                  源节点
                </label>
                <div className="p-2 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] font-medium truncate">
                  {showLinkModal.title}
                </div>
              </div>

              <div>
                <label className="block text-[var(--apple-text-secondary)] mb-1 font-semibold">
                  关联目标节点
                </label>
                <select
                  required
                  value={targetLinkId}
                  onChange={e => setTargetLinkId(e.target.value)}
                  className="w-full p-2.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)]"
                >
                  <option value="">选择目标条目...</option>
                  {treeItems
                    .filter(i => i.kbId === currentKb.id && i.id !== showLinkModal.id)
                    .map(item => (
                      <option key={item.id} value={item.id}>
                        {item.type === 'folder' ? '📁 ' : '📄 '} {item.title}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--apple-text-secondary)] mb-1 font-semibold">
                  关联关系语义 (标签)
                </label>
                <input
                  value={targetLinkLabel}
                  onChange={e => setTargetLinkLabel(e.target.value)}
                  placeholder="如：因果因缘、克制关系、前置条件..."
                  className="w-full p-2.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--apple-separator)]">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(null)}
                  className="px-3 py-1.5 rounded-xl border border-[var(--apple-border)] text-xs text-[var(--apple-text-secondary)]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!targetLinkId}
                  className="px-4 py-1.5 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold shadow-xs hover:bg-[var(--apple-accent-hover)] transition-all disabled:opacity-40"
                >
                  创建关联引力线
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Node Inspector Floating Drawer */}
      {activeInspectorNode && (
        <div className="absolute right-4 top-16 bottom-4 w-96 rounded-3xl bg-[var(--apple-surface)]/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl border border-[var(--apple-border-strong)] shadow-[0_24px_50px_rgba(0,0,0,0.45)] z-30 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 select-text">
          {/* Header */}
          <div className="h-10 px-4 border-b border-[var(--apple-separator)] bg-[var(--apple-subtle)]/40 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeInspectorNode.color }} />
              <span className="text-xs font-bold text-[var(--apple-text-primary)] truncate max-w-[220px]">
                {activeInspectorNode.title}
              </span>
            </div>

            <button
              onClick={() => setActiveInspectorNode(null)}
              className="p-1 rounded-md text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Meta */}
          <div className="px-4 py-2 border-b border-[var(--apple-separator)] bg-[var(--apple-subtle)]/15 flex items-center justify-between text-[10px] font-mono text-[var(--apple-text-secondary)] select-none">
            <span>{activeInspectorNode.type === 'folder' ? '分类目录' : activeInspectorNode.type === 'kb_root' ? '知识库根' : '知识资产'}</span>
            <span>{activeInspectorNode.updatedAt || '刚刚'}</span>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed text-[var(--apple-text-primary)] font-sans">
            {activeInspectorNode.tags && activeInspectorNode.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {activeInspectorNode.tags.map(t => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[9px] font-mono text-[var(--apple-text-secondary)]">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {activeInspectorNode.body ? (
              <div className="p-3 rounded-xl bg-[var(--apple-subtle)]/40 border border-[var(--apple-border)]">
                <AppleMarkdown content={activeInspectorNode.body} />
              </div>
            ) : (
              <p className="text-[var(--apple-text-tertiary)] italic">暂无正文详情</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-[var(--apple-separator)] bg-[var(--apple-subtle)]/30 flex items-center justify-between gap-2 select-none">
            {activeInspectorNode.type === 'file' ? (
              <button
                onClick={() => onSwitchToReader(activeInspectorNode.id)}
                className="flex-1 py-1.5 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold shadow-xs hover:bg-[var(--apple-accent-hover)] transition-all flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>在主工作台精读与提炼</span>
              </button>
            ) : (
              <div className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">
                文件夹节点已展开子文件关联
              </div>
            )}

            <button
              onClick={() => handleExportNodeContent(activeInspectorNode)}
              className="p-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
              title="导出 Markdown"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
