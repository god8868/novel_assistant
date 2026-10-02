import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  X, 
  GitFork, 
  GitBranch, 
  Maximize2, 
  Search, 
  Play, 
  Eye, 
  ArrowRight, 
  Zap, 
  Layers, 
  Sparkles, 
  Check, 
  ShieldAlert, 
  Lightbulb, 
  Flag, 
  MessageSquare, 
  Cpu, 
  Filter, 
  Share2, 
  Copy, 
  CheckCircle2, 
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  BookmarkPlus
} from 'lucide-react';

export interface TopologyNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'root' | 'branch' | 'conflict' | 'decision' | 'conclusion';
  role: 'user' | 'assistant' | 'system';
  summary: string;
  messageId: string;
  color: string;
  icon: string;
  confidence: string;
  timestamp?: string;
  tags?: string[];
}

export interface TopologyLink extends d3.SimulationLinkDatum<TopologyNode> {
  source: string | TopologyNode;
  target: string | TopologyNode;
  relation: string;
}

interface Message {
  id: string;
  topic_id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  reasoning?: string;
  thought?: string;
  created_at: number;
}

interface Topic {
  id: string;
  title: string;
  model_id: string;
  system_prompt: string;
}

interface DialogueTopologyModalProps {
  topic: Topic | null;
  messages: Message[];
  onJumpToMessage: (messageId: string) => void;
  onClose: () => void;
  onSaveToMaterial?: (title: string, body: string) => void;
}

export const DialogueTopologyModal: React.FC<DialogueTopologyModalProps> = ({
  topic,
  messages,
  onJumpToMessage,
  onClose,
  onSaveToMaterial
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<TopologyNode, TopologyLink> | null>(null);
  
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TopologyNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [filterType, setFilterType] = useState<'all' | 'branch' | 'conflict' | 'decision'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Auto-map conversation into topology nodes and links
  const { nodes, links } = useMemo(() => {
    const rawNodes: TopologyNode[] = [];
    const rawLinks: TopologyLink[] = [];

    const rootId = 'node_root';
    const topicTitle = topic?.title || '智能会话命题';

    // 1. Root Node
    rawNodes.push({
      id: rootId,
      name: topicTitle.slice(0, 16),
      type: 'root',
      role: 'system',
      summary: `会话核心命题: ${topicTitle}`,
      messageId: messages[0]?.id || '',
      color: '#007AFF',
      icon: '🎯',
      confidence: '100%',
      timestamp: '命题确立',
      tags: ['核心命题', '因果源头']
    });

    let prevNodeId = rootId;

    // Iterate messages to parse branches, conflicts, and decisions
    messages.forEach((msg, idx) => {
      const isUser = msg.role === 'user';
      const text = msg.content;
      const thought = msg.thought || msg.reasoning || '';
      const timeStr = new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

      if (isUser) {
        // User Branch Node
        const branchId = `node_branch_${msg.id}`;
        rawNodes.push({
          id: branchId,
          name: text.length > 15 ? `探索: ${text.slice(0, 14)}...` : `探索: ${text}`,
          type: 'branch',
          role: 'user',
          summary: text,
          messageId: msg.id,
          color: '#AF52DE',
          icon: '❓',
          confidence: '99%',
          timestamp: timeStr,
          tags: ['用户需求', '议题分支']
        });

        rawLinks.push({
          source: prevNodeId,
          target: branchId,
          relation: idx === 0 ? '发起对话' : '延伸分支'
        });
        prevNodeId = branchId;
      } else {
        // Check if there is conflict/risk in thought or response
        const hasConflict = text.includes('风险') || text.includes('死锁') || text.includes('逃逸') || text.includes('两难') || text.includes('反噬') || text.includes('避免') || text.includes('警告') || text.includes('瓶颈');
        
        if (hasConflict) {
          const conflictId = `node_conflict_${msg.id}`;
          rawNodes.push({
            id: conflictId,
            name: `风险/矛盾排查`,
            type: 'conflict',
            role: 'assistant',
            summary: thought ? `思维链审视: ${thought.slice(0, 100)}...` : `辨析潜在风险：排查逻辑漏洞、死锁竞态与架构瓶颈`,
            messageId: msg.id,
            color: '#FF9500',
            icon: '⚔️',
            confidence: '96%',
            timestamp: timeStr,
            tags: ['矛盾冲突', '边界约束', '风险阻断']
          });

          rawLinks.push({
            source: prevNodeId,
            target: conflictId,
            relation: '识别矛盾'
          });
          prevNodeId = conflictId;
        }

        // Decision / Synthesis Node
        const isLastMsg = idx === messages.length - 1;
        const decisionId = `node_decision_${msg.id}`;
        rawNodes.push({
          id: decisionId,
          name: isLastMsg ? `最终落地闭环` : `方案决策推演`,
          type: isLastMsg ? 'conclusion' : 'decision',
          role: 'assistant',
          summary: text,
          messageId: msg.id,
          color: isLastMsg ? '#34C759' : '#5856D6',
          icon: isLastMsg ? '🏁' : '💡',
          confidence: '98%',
          timestamp: timeStr,
          tags: [isLastMsg ? '落地闭环' : '决策架构', '结构化输出']
        });

        rawLinks.push({
          source: prevNodeId,
          target: decisionId,
          relation: '推演合成'
        });
        prevNodeId = decisionId;
      }
    });

    // If only root exists, provide sample nodes
    if (rawNodes.length === 1) {
      const dummyBranch: TopologyNode = {
        id: 'node_branch_init',
        name: '初始议题诉求',
        type: 'branch',
        role: 'user',
        summary: '向本地智能体提出核心议题、代码审查或文学重构需求',
        messageId: '',
        color: '#AF52DE',
        icon: '❓',
        confidence: '98%',
        tags: ['分支探索']
      };
      const dummyDecision: TopologyNode = {
        id: 'node_decision_init',
        name: '结构化决策推演',
        type: 'decision',
        role: 'assistant',
        summary: '遵循冷峻白描与原子化架构输出落地成果',
        messageId: '',
        color: '#34C759',
        icon: '💡',
        confidence: '99%',
        tags: ['决策闭环']
      };
      rawNodes.push(dummyBranch, dummyDecision);
      rawLinks.push(
        { source: rootId, target: 'node_branch_init', relation: '提出诉求' },
        { source: 'node_branch_init', target: 'node_decision_init', relation: '推演合成' }
      );
    }

    return { nodes: rawNodes, links: rawLinks };
  }, [topic, messages]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (filterType === 'branch' && n.type !== 'branch' && n.type !== 'root') return false;
      if (filterType === 'conflict' && n.type !== 'conflict') return false;
      if (filterType === 'decision' && n.type !== 'decision' && n.type !== 'conclusion') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return n.name.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q);
      }
      return true;
    });
  }, [nodes, filterType, searchQuery]);

  const filteredLinks = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return links.filter(l => {
      const sId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return nodeIds.has(sId) && nodeIds.has(tId);
    });
  }, [links, filteredNodes]);

  // Set initial selected node
  useEffect(() => {
    if (nodes.length > 0 && !selectedNode) {
      setSelectedNode(nodes[nodes.length - 1]);
    }
  }, [nodes]);

  // D3 Graph Simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 540;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const g = svg.append('g').attr('class', 'graph-group');

    // Zoom setup
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom as any);

    const nodesCopy: TopologyNode[] = filteredNodes.map(d => ({ ...d }));
    const linksCopy: TopologyLink[] = filteredLinks.map(d => ({ ...d }));

    // Define Arrow Marker
    svg.append('defs').append('marker')
      .attr('id', 'topo-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 26)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(142,142,147,0.5)');

    // Force Simulation
    const simulation = d3
      .forceSimulation<TopologyNode>(nodesCopy)
      .force('link', d3.forceLink<TopologyNode, TopologyLink>(linksCopy).id((d) => d.id).distance(135))
      .force('charge', d3.forceManyBody().strength(-450))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(48));

    simulationRef.current = simulation as any;

    // Draw Links
    const link = g
      .append('g')
      .selectAll('line')
      .data(linksCopy)
      .join('line')
      .attr('stroke', 'rgba(142, 142, 147, 0.35)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d: any) => d.relation.includes('矛盾') ? '4 3' : 'none')
      .attr('marker-end', 'url(#topo-arrow)');

    const linkText = g
      .append('g')
      .selectAll('text')
      .data(linksCopy)
      .join('text')
      .text((d: any) => d.relation || '')
      .attr('font-size', '10px')
      .attr('fill', 'rgba(142, 142, 147, 0.75)')
      .attr('text-anchor', 'middle')
      .attr('font-family', 'sans-serif');

    // Drag Helper
    const drag = (sim: d3.Simulation<TopologyNode, undefined>) => {
      function dragstarted(event: any) {
        if (!event.active) sim.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: any) {
        if (!event.active) sim.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag<SVGGElement, TopologyNode>().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    };

    // Node Groups
    const node = g
      .append('g')
      .selectAll('g')
      .data(nodesCopy)
      .join('g')
      .attr('class', 'node-group cursor-pointer')
      .call(drag(simulation) as any)
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        }
      })
      .on('mousemove', (event) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        }
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      });

    // Outer Halo
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'root' ? 24 : d.type === 'conclusion' ? 22 : 18))
      .attr('fill', (d) => d.color)
      .attr('opacity', (d) => (d.id === selectedNode?.id ? 0.45 : 0.18))
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => (d.id === selectedNode?.id ? 3.5 : 1.2));

    // Inner Circle
    node
      .append('circle')
      .attr('r', (d) => (d.type === 'root' ? 17 : d.type === 'conclusion' ? 15 : 13))
      .attr('fill', '#1c1c1e')
      .attr('stroke', (d) => (d.id === selectedNode?.id ? '#ffffff' : d.color))
      .attr('stroke-width', 2);

    // Icon
    node
      .append('text')
      .text((d) => d.icon)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '11px');

    // Label pill underneath
    const labelGroup = node.append('g').attr('transform', 'translate(0, 24)');

    labelGroup
      .append('rect')
      .attr('x', (d) => -((d.name.length * 10.5) / 2 + 6))
      .attr('y', -9)
      .attr('width', (d) => d.name.length * 10.5 + 12)
      .attr('height', 17)
      .attr('rx', 6)
      .attr('fill', (d) => (d.id === selectedNode?.id ? d.color : 'rgba(28,28,30,0.85)'))
      .attr('stroke', 'rgba(255, 255, 255, 0.15)')
      .attr('stroke-width', 1);

    labelGroup
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.22em')
      .attr('fill', (d) => (d.id === selectedNode?.id ? '#ffffff' : 'rgba(255, 255, 255, 0.95)'))
      .attr('font-size', '9.5px')
      .attr('font-weight', 'bold');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkText
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 4);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredLinks, selectedNode?.id]);

  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy as any, factor);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.transform as any, d3.zoomIdentity);
  };

  const handleReheatSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.8).restart();
    }
  };

  const handleJump = (messageId: string) => {
    if (!messageId) return;
    onJumpToMessage(messageId);
    onClose();
  };

  const handleCopyTopologySummary = () => {
    const lines = [
      `# 对话逻辑脉络拓扑报告: ${topic?.title || '智能会话'}`,
      `生成节点数: ${nodes.length} | 关联路径: ${links.length}`,
      '',
      '## 核心逻辑路径节点:',
      ...nodes.map((n, i) => `${i + 1}. [${n.type.toUpperCase()}] ${n.name} (置信度: ${n.confidence})\n   - 摘要: ${n.summary.slice(0, 100)}...`)
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-macos-fade"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-5xl h-[85vh] max-h-[760px] bg-white/95 dark:bg-[#18181A]/95 rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col overflow-hidden">
        
        {/* Titlebar Header */}
        <header className="h-13 px-4 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-[#1C1C1E]/75 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] cursor-pointer" title="关闭" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            </div>

            <div className="flex items-center gap-2 ml-2">
              <GitFork className="w-4 h-4 text-[#007AFF]" />
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                全局对话逻辑脉络图 (D3.js Topology)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
                {nodes.length} 个逻辑节点
              </span>
            </div>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex items-center gap-2 text-xs">
            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索脉络节点..."
                className="w-32 h-6.5 pl-6 pr-2 text-[11px] rounded-lg bg-neutral-200/50 dark:bg-neutral-800/60 border border-transparent focus:border-blue-500/50 outline-none text-neutral-800 dark:text-neutral-200"
              />
            </div>

            <div className="bg-neutral-200/70 dark:bg-neutral-800/80 p-0.5 rounded-lg flex items-center font-medium">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-1 rounded-md transition text-[11px] ${filterType === 'all' ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
              >
                全部分支
              </button>
              <button
                onClick={() => setFilterType('branch')}
                className={`px-2 py-1 rounded-md transition text-[11px] ${filterType === 'branch' ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
              >
                主题分支
              </button>
              <button
                onClick={() => setFilterType('conflict')}
                className={`px-2 py-1 rounded-md transition text-[11px] ${filterType === 'conflict' ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
              >
                冲突/风险
              </button>
              <button
                onClick={() => setFilterType('decision')}
                className={`px-2 py-1 rounded-md transition text-[11px] ${filterType === 'decision' ? 'bg-white dark:bg-[#3A3A3C] text-neutral-900 dark:text-white shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
              >
                决策闭环
              </button>
            </div>

            <button
              onClick={handleCopyTopologySummary}
              className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-600 dark:text-neutral-300 transition"
              title="复制拓扑摘要文本"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Canvas & Detail Sidebar Split */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Left: D3.js Force Topology Canvas */}
          <div ref={containerRef} className="flex-1 h-full bg-[#FBFBFC] dark:bg-[#121214] relative overflow-hidden flex flex-col select-none">
            <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Canvas Floating Zoom & Physics Control Dock */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md p-1 rounded-xl border border-black/10 dark:border-white/10 shadow-sm text-xs text-neutral-600 dark:text-neutral-300">
              <button onClick={() => handleZoom(1.2)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg" title="放大">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleZoom(0.8)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg" title="缩小">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleResetZoom} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg" title="居中还原">
                <Compass className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-3.5 bg-neutral-300 dark:bg-neutral-700 my-auto"></div>
              <button onClick={handleReheatSimulation} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg" title="重启力导向物理排斥">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hover Tooltip */}
            {hoveredNode && (
              <div
                className="absolute z-30 p-3 rounded-xl bg-white/95 dark:bg-[#1E1E22]/95 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-2xl text-xs space-y-1.5 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3 max-w-xs"
                style={{ left: tooltipPos.x, top: tooltipPos.y }}
              >
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-100">
                    <span>{hoveredNode.icon}</span>
                    <span>{hoveredNode.name}</span>
                  </div>
                  <span className="text-[9px] font-mono px-1 rounded bg-black/5 dark:bg-white/10 text-blue-500">
                    {hoveredNode.type}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                  {hoveredNode.summary}
                </p>
                <div className="text-[9px] font-mono text-neutral-400">
                  点击固定详情 · 支持直接跳转
                </div>
              </div>
            )}

            {/* Canvas Bottom Tips */}
            <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2 bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/10 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#007AFF]" /> 根命题</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#AF52DE]" /> 用户分支</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF9500]" /> 矛盾风险</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#34C759]" /> 决策闭环</span>
            </div>
          </div>

          {/* Right: Selected Node Detail & Jump Card */}
          <div className="w-80 border-l border-black/5 dark:border-white/5 bg-neutral-50/60 dark:bg-[#161618]/65 backdrop-blur-2xl flex flex-col p-4 shrink-0 overflow-y-auto space-y-4 text-xs">
            {selectedNode ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">节点透视</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                      置信度 {selectedNode.confidence}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                      {selectedNode.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100">{selectedNode.name}</h4>
                      <p className="text-[10px] font-mono text-neutral-400">{selectedNode.timestamp ? `生成时间: ${selectedNode.timestamp}` : '核心逻辑锚点'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5">
                  <span className="text-[11px] font-semibold text-neutral-500">逻辑论述摘要</span>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 text-neutral-700 dark:text-neutral-300 text-xs leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {selectedNode.summary}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                  <span className="text-[11px] font-semibold text-neutral-500">结构化标签</span>
                  <div className="flex flex-wrap gap-1">
                    {(selectedNode.tags || ['逻辑节点', '因果推演']).map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[10px] font-mono text-neutral-600 dark:text-neutral-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Jump to Conversation Button */}
                <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/5 space-y-2">
                  <button
                    onClick={() => handleJump(selectedNode.messageId)}
                    disabled={!selectedNode.messageId}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>定位并跳转回对应消息</span>
                  </button>
                  <p className="text-[10px] text-neutral-400 text-center">
                    点击将自动定位对话窗口并高亮气泡
                  </p>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-400 text-center">
                点击左侧拓扑图中的任意节点查看逻辑推演详情与定位
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
