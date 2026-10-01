import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Globe, 
  BookOpen, 
  Cpu, 
  Sparkles, 
  Lock, 
  Search, 
  XCircle, 
  SlidersHorizontal, 
  FileText, 
  Archive, 
  Download, 
  CheckCircle2, 
  Loader, 
  Circle, 
  Film, 
  FileCode, 
  Eye, 
  X, 
  BookOpenCheck, 
  Upload, 
  ShieldCheck, 
  Sliders, 
  Activity, 
  Users, 
  Zap, 
  ScanFace, 
  LineChart, 
  Network, 
  Gem, 
  LayoutList, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle,
  Copy,
  GitFork,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Layers,
  Code2,
  Filter,
  Flame,
  Target,
  Clock,
  Layers3,
  Radio,
  RadioTower,
  Play
} from 'lucide-react';

// ==========================================
// 1. DATA TYPES & D3 GRAPH STRUCTURES
// ==========================================

export interface ResourceItem {
  id: number;
  name: string;
  category: 'image' | 'media' | 'doc';
  type: string;
  size: string;
  res: string;
  url: string;
  desc: string;
}

export interface CharacterItem {
  id: string;
  name: string;
  avatarChar: string;
  roleBadge: string;
  color: string;
  motive: string;
  psychology: string;
  conflict: string;
}

export interface LogicNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  category: 'root' | 'pipeline' | 'feature' | 'evidence' | 'metric';
  confidence: number; // 0..100
  color: string;
  stage: string;
  depthLevel: 1 | 2 | 3;
  summary: string;
  details: string;
  rawChunk?: string;
  isLiveGenerated?: boolean;
}

export interface LogicLink extends d3.SimulationLinkDatum<LogicNode> {
  source: string | LogicNode;
  target: string | LogicNode;
  label?: string;
}

// Filter Options Types
export type FilterDimension = 'confidence' | 'stage' | 'depth';

// ==========================================
// 2. SAMPLE DATASETS
// ==========================================

const SAMPLE_WEB_RESOURCES: ResourceItem[] = [
  {
    id: 1,
    name: "vision-pro-exploded-spatial-sensor.png",
    category: "image",
    type: "PNG Retina",
    size: "4.8 MB",
    res: "4096 × 2304",
    url: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=600&q=80",
    desc: "R1 传感器阵列结构分解矢量原图"
  },
  {
    id: 2,
    name: "spatial-audio-acoustic-field.jpg",
    category: "image",
    type: "JPEG High",
    size: "3.2 MB",
    res: "3840 × 2160",
    url: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=600&q=80",
    desc: "物理声学光线追踪实时声场渲染切面"
  },
  {
    id: 3,
    name: "micro-oled-pixel-pitch-density.webp",
    category: "image",
    type: "WebP",
    size: "1.9 MB",
    res: "2880 × 1800",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
    desc: "注视点渲染显存吞吐与色域校准表"
  },
  {
    id: 4,
    name: "spatial-computing-interaction-demo.mp4",
    category: "media",
    type: "MP4 Video",
    size: "18.5 MB",
    res: "4K 60fps",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    desc: "微手势识别追踪延迟低于12ms实机录屏"
  },
  {
    id: 5,
    name: "apple-visionos-design-guideline.pdf",
    category: "doc",
    type: "PDF Document",
    size: "5.4 MB",
    res: "64 页",
    url: "#",
    desc: "visionOS 人机交互规范与色彩深度指南"
  },
  {
    id: 6,
    name: "extracted-article-clean.md",
    category: "doc",
    type: "Markdown",
    size: "38 KB",
    res: "4,920 词",
    url: "#",
    desc: "剔除广告与内嵌统计的纯净 Markdown 正文"
  }
];

const NOVEL_PRESETS = {
  xuanhuan: {
    title: "《万古天帝·前三章开篇》",
    text: `【第一章：寒潭惊梦，残镜重明】\n大夏历三千二百年，北域寒渊深达千丈。\n陈凡睁开双眼时，刺骨的冷冽正顺着经脉寸寸冻结气血。前世仙尊神识与这具孱弱的少年残躯交融，胸口一枚生锈的古铜残镜滚烫发热。\n“交出祖传的九阳天火印，你可以死得体面一些。”石阶上方，内门总管赵全手持玄铁鞭，眼神如鹰隼般贪婪。\n陈凡没有说话。他默念古镜秘咒，瞬息之间，四周飞溅的冰晶悬停于半空。时间回溯两息！\n破绽在右肋三寸。\n咔嚓——少年身影宛如鬼魅贴上，玄铁鞭甚至未曾挥落，赵全的咽喉已被冰棱贯穿。\n\n【第二章：祖祠试探，一指定乾坤】\n黑石铸就的陈氏祖祠内，气氛剑拔弩张。\n“家族矿脉已断供三月，按宗法，长房若无通玄境修士坐镇，矿脉当划归赵家代管！”族老陈远山声色俱厉。\n祠堂外，赵天烈负手而立，嘴角噙着一抹讥弄：“陈凡，你灵根已废，何必徒劳挣扎？”\n陈凡步入大殿，眼神掠过众人，抬手隔空轻点。一道肉眼难辨的纯白剑气横扫，将陈远山面前的青铜祭鼎齐齐削为两截。\n“通玄境？谁告诉你，我只有通玄？”\n\n【第三章：黑风峡底，天凤真羽现】\n黑风峡常年被紫煞阴雷笼罩。\n深渊裂隙前，赵天烈与四位半步神游死士已结成截杀天罗地网。危急关头，白衣胜雪的苏清寒御风而来，天凤真羽划开十里雷云……`
  },
  dushi: {
    title: "《神级投资家·商战高潮篇》",
    text: `【第一章：百亿做空，生死对赌】\n华尔街顶层，落地窗外暴雨如注。\n距离纳斯达克敲钟倒计时只剩八分钟，红杉与摩根的做空联盟已经抛出四百亿美元筹码，试图砸穿新芯科技的承销底线。\n林天野合上笔记本电脑，端起一杯浓缩咖啡：“告诉港岛和新加坡流动性池，反向拉升三十个基点。”\n“林总，如果十分钟内没托住，我们的杠杆会直接触发强制平仓！”交易总监双手颤抖。\n“按我说的做。他们不知道，三分钟后工信部会发布下一代架构自主替代白皮书。”`
  },
  scifi: {
    title: "《深空孤舰·硬科幻第1卷》",
    text: `【第一章：冷凝舱复苏协议】\n光年之外的奥尔特云外缘，“逐火者号”深空探测舰发出低沉的辅机蜂鸣。\n李岚中校从近绝对零度的冬眠凝胶中苏醒，视网膜HUD投射出刺眼的红色警报：主计算核心在经历九百年航行后，产生了无法归零的奇点漂移。`
  }
};

const CHARACTER_DOSSIERS: Record<string, CharacterItem> = {
  chen: {
    id: 'chen',
    name: "陈凡",
    avatarChar: "凡",
    roleBadge: "第一男主 · 隐忍枭雄",
    color: "blue",
    motive: "动机: 查明家族覆灭真相，抢夺太虚古镜第一序列权限",
    psychology: "外表内敛沉静，言辞极少但洞察力极强；极度信奉风险前置与斩草除根原则，在危急情境下具有极冷静的逻辑决断力。",
    conflict: "一方面需借用陈氏残存气运避祸，另一方面提防体内未消散的原主残魂反噬。"
  },
  su: {
    id: 'su',
    name: "苏清寒",
    avatarChar: "清",
    roleBadge: "核心女主 · 九霄宫圣女",
    color: "purple",
    motive: "动机: 逃离联姻枷锁，掌握自身天凤涅槃本源",
    psychology: "表面孤高出尘、不染世俗，实则背负宗门血咒；对陈凡身上若隐若现的古镜气息有强烈感应。",
    conflict: "宗门命其与赵家少主结亲换取护山大阵，她正密谋借秘境死遁斩断羁绊。"
  },
  zhao: {
    id: 'zhao',
    name: "赵天烈",
    avatarChar: "烈",
    roleBadge: "阶段主反派 · 傲慢天骄",
    color: "red",
    motive: "动机: 掠夺主角机缘，在成年大典立威巩固少宗主地位",
    psychology: "心胸狭隘、自负狂妄，仗着玄阳功法与家族权势横行无忌；极其忌惮陈凡可能的起死回生。",
    conflict: "在黑风峡被陈凡暗算重伤后，不惜动用禁忌魔器，促成后续更大的家族阵营血战。"
  }
};

// --- D3 Initial Graph Datasets ---
const INITIAL_WEB_GRAPH_NODES: LogicNode[] = [
  { id: 'n-root', label: '网页全域多模态解构中枢', category: 'root', confidence: 99.8, color: '#0a84ff', stage: 'Stage 0', depthLevel: 1, summary: '初始化多线程 HTTP/3 嗅探连接并完成证书自校验。', details: '通过无头 Chrome DOM 树渲染引擎在 12ms 内生成快照，并计算 DOM 结构熵。', rawChunk: 'GET /features/apple-spatial-computing HTTP/3.0\nHost: www.theverge.com\nUser-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4)' },
  { id: 'n-dom', label: 'DOM 结构树清洗', category: 'pipeline', confidence: 96.5, color: '#bf5af2', stage: 'Stage 1', depthLevel: 2, summary: '剥离导航栏、底部版权弹窗与动态 Trackers。', details: '采用阈值 0.82 的文本密度过滤算法，成功分离主文本与三方 Script 脚本。', rawChunk: 'document.querySelectorAll("script, iframe, .ad-banner").forEach(el => el.remove());' },
  { id: 'n-noise', label: '广告噪点过滤 (94.8%)', category: 'metric', confidence: 94.8, color: '#30d158', stage: 'Stage 1', depthLevel: 3, summary: '判定页面纯度比达 94.8%，未发现恶意混淆代码。', details: '过滤掉 14 个追踪脚本（Google Analytics、Doubleclick）与 3 处横幅广告。' },
  { id: 'n-media', label: '静态多媒体深嗅', category: 'pipeline', confidence: 98.2, color: '#ff9f0a', stage: 'Stage 2', depthLevel: 2, summary: '嗅探并提取 24 张 Retina 高清图片与 3 处音视频流。', details: '通过正则解析 srcset 与 Picture 标签，重新将相对路径重构为 CDN 绝对物理地址。' },
  { id: 'n-r1', label: 'R1 传感器分解图 (PNG)', category: 'evidence', confidence: 99.1, color: '#64d2ff', stage: 'Stage 2', depthLevel: 3, summary: '分辨率 4096x2304，已调用 Vision 模型识别关键标注。', details: '提取出传感器布局：12 个摄像头、5 个传感器与 6 个麦克风阵列。' },
  { id: 'n-micro', label: 'Micro-OLED 校准表 (WebP)', category: 'evidence', confidence: 95.4, color: '#64d2ff', stage: 'Stage 2', depthLevel: 3, summary: '色彩灰阶与 2300 万像素密度校准示意图。', details: '自动识别表格单元格数据并转换为结构化 JSON Schema。' },
  { id: 'n-ai', label: 'AI 核心语义摘要 (TL;DR)', category: 'feature', confidence: 97.6, color: '#bf5af2', stage: 'Stage 3', depthLevel: 2, summary: '归纳出空间计算与微秒级渲染管线三大技术立论。', details: '结合 LLM 提取本文核心要点：R1 协处理器、注视点渲染、空间音频算法。' },
  { id: 'n-md', label: '纯净 Markdown 归档', category: 'evidence', confidence: 98.9, color: '#30d158', stage: 'Stage 4', depthLevel: 3, summary: '生成 38KB 标准纯净 Markdown 文本，可直接存入素材库。', details: '所有图片链接已格式化为标准 Markdown Image 形式，支持离线预览。' }
];

const INITIAL_WEB_GRAPH_LINKS: LogicLink[] = [
  { source: 'n-root', target: 'n-dom', label: '传入 DOM 树' },
  { source: 'n-dom', target: 'n-noise', label: '文本密度过滤' },
  { source: 'n-root', target: 'n-media', label: '多媒体扫描' },
  { source: 'n-media', target: 'n-r1', label: '高清矢量提取' },
  { source: 'n-media', target: 'n-micro', label: '图表 OCR' },
  { source: 'n-dom', target: 'n-ai', label: '语义喂入' },
  { source: 'n-ai', target: 'n-md', label: '生成纯净文档' }
];

const INITIAL_NOVEL_GRAPH_NODES: LogicNode[] = [
  { id: 'nn-root', label: '网文小说多维解构中枢', category: 'root', confidence: 99.5, color: '#bf5af2', stage: 'Stage 0', depthLevel: 1, summary: '解析 14,820 字正文，建立高阶 NLP 自然语言切片图谱。', details: '使用 512-Token 动态滑动窗口，提取实体密度与剧情戏剧张力趋势。' },
  { id: 'nn-pacing', label: '多巴胺节拍心电曲线', category: 'pipeline', confidence: 96.8, color: '#ff375f', stage: 'Stage 1', depthLevel: 2, summary: '计算出场景从“受压抑”到“高潮反杀”的黄金抛物线。', details: '开篇第一章第 2 两息反杀点情绪释放度达 86%，形成极强代入感。' },
  { id: 'nn-hook1', label: '开篇入局钩子 (Hook 88)', category: 'feature', confidence: 98.2, color: '#ff9f0a', stage: 'Stage 2', depthLevel: 3, summary: '第一章结尾收缴信件并发现未婚妻蜡印，预设长线冲突。', details: '符合网文黄金三章“第一章解决当前危机，同时开启宗门大危机”的经典递进算法。' },
  { id: 'nn-char', label: '人物图谱与势力阵营', category: 'pipeline', confidence: 97.1, color: '#0a84ff', stage: 'Stage 1', depthLevel: 2, summary: '识别陈凡 (男主)、苏清寒 (圣女)、赵天烈 (反派) 三大核心阵营。', details: '陈凡动机得分：自保求道 80%、利益独占 20%；不存在无脑圣母属性。' },
  { id: 'nn-power', label: '金手指机制闭环', category: 'feature', confidence: 98.6, color: '#30d158', stage: 'Stage 2', depthLevel: 3, summary: '【时间回溯沙漏】每次消耗十年寿元，严格控制风险收益比。', details: '避免了无成本连续开挂导致的战斗战力价值通胀问题。' },
  { id: 'nn-deai', label: '去 AI 套路味诊断', category: 'metric', confidence: 94.2, color: '#64d2ff', stage: 'Stage 3', depthLevel: 3, summary: '警告：第二章宗祠对峙中的配角台词略显模板化。', details: '建议增加茶杯震碎水迹渗入红木案几的真实道具动作交互，强化冷感压迫。' }
];

const INITIAL_NOVEL_GRAPH_LINKS: LogicLink[] = [
  { source: 'nn-root', target: 'nn-pacing', label: '节奏分析' },
  { source: 'nn-pacing', target: 'nn-hook1', label: '挖掘遗留悬念' },
  { source: 'nn-root', target: 'nn-char', label: '实体提取' },
  { source: 'nn-root', target: 'nn-power', label: '设定检验' },
  { source: 'nn-root', target: 'nn-deai', label: '文风诊断' }
];

// ==========================================
// 3. D3 INTERACTIVE LOGIC GRAPH COMPONENT
// ==========================================

const D3LogicGraph: React.FC<{
  nodes: LogicNode[];
  links: LogicLink[];
  onSelectNode: (node: LogicNode) => void;
  selectedNodeId?: string;
  minConfidence: number;
  selectedStage: string;
  selectedDepth: number;
  isLiveSync: boolean;
}> = ({ nodes, links, onSelectNode, selectedNodeId, minConfidence, selectedStage, selectedDepth, isLiveSync }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute highlighted active node IDs
  const activeNodeIds = useMemo(() => {
    return new Set(
      nodes
        .filter(n => {
          const passConfidence = n.confidence >= minConfidence;
          const passStage = selectedStage === 'all' || n.stage === selectedStage;
          const passDepth = selectedDepth === 0 || n.depthLevel === selectedDepth;
          return passConfidence && passStage && passDepth;
        })
        .map(n => n.id)
    );
  }, [nodes, minConfidence, selectedStage, selectedDepth]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 480;

    // Clear previous SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Zoom container
    const g = svg.append('g').attr('class', 'graph-group');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Copy nodes & links
    const nodesCopy: LogicNode[] = nodes.map((d) => ({ ...d }));
    const linksCopy: LogicLink[] = links.map((d) => ({ ...d }));

    // Force Simulation
    const simulation = d3
      .forceSimulation<LogicNode>(nodesCopy)
      .force(
        'link',
        d3
          .forceLink<LogicNode, LogicLink>(linksCopy)
          .id((d) => d.id)
          .distance(120)
      )
      .force('charge', d3.forceManyBody().strength(-360))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(48));

    if (isLiveSync) {
      simulation.alphaTarget(0.3).restart();
    }

    // Render Links
    const link = g
      .append('g')
      .selectAll('line')
      .data(linksCopy)
      .join('line')
      .attr('stroke', (d: any) => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        const isActive = activeNodeIds.has(sourceId) && activeNodeIds.has(targetId);
        return isActive ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)';
      })
      .attr('stroke-width', (d: any) => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        return activeNodeIds.has(sourceId) && activeNodeIds.has(targetId) ? 2 : 1;
      })
      .attr('stroke-dasharray', '4 2');

    // Link Labels
    const linkText = g
      .append('g')
      .selectAll('text')
      .data(linksCopy)
      .join('text')
      .text((d: any) => d.label || '')
      .attr('font-size', '9px')
      .attr('fill', (d: any) => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        return activeNodeIds.has(sourceId) && activeNodeIds.has(targetId) ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.1)';
      })
      .attr('text-anchor', 'middle')
      .attr('font-family', 'sans-serif');

    // Drag behaviour
    const drag = (sim: d3.Simulation<LogicNode, undefined>) => {
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
      return d3.drag<SVGGElement, LogicNode>().on('start', dragstarted).on('drag', dragged).on('end', dragended);
    };

    // Render Nodes Group
    const node = g
      .append('g')
      .selectAll('g')
      .data(nodesCopy)
      .join('g')
      .attr('class', 'node-group cursor-pointer')
      .style('opacity', (d) => (activeNodeIds.has(d.id) ? 1 : 0.18))
      .call(drag(simulation) as any)
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectNode(d);
      });

    // Outer Glowing Halo
    node
      .append('circle')
      .attr('r', (d) => (d.category === 'root' ? 26 : 20))
      .attr('fill', (d) => d.color)
      .attr('opacity', (d) => (d.isLiveGenerated ? 0.8 : d.id === selectedNodeId ? 0.5 : activeNodeIds.has(d.id) ? 0.25 : 0.05))
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => (d.isLiveGenerated ? 5 : d.id === selectedNodeId ? 4 : 1));

    // Inner Solid Circle
    node
      .append('circle')
      .attr('r', (d) => (d.category === 'root' ? 18 : 14))
      .attr('fill', '#151821')
      .attr('stroke', (d) => (d.id === selectedNodeId ? '#ffffff' : d.color))
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 3 : 2));

    // Confidence Badge Text Inside Circle
    node
      .append('text')
      .text((d) => (d.category === 'root' ? '' : d.isLiveGenerated ? '⚡' : `${Math.round(d.confidence)}%`))
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', (d) => (d.id === selectedNodeId ? '#ffffff' : d.color))
      .attr('font-size', (d) => (d.category === 'root' ? '12px' : '9px'))
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace');

    // Node Title Label Underneath
    const labelGroup = node.append('g').attr('transform', 'translate(0, 26)');

    labelGroup
      .append('rect')
      .attr('x', (d) => -((d.label.length * 11) / 2 + 6))
      .attr('y', -10)
      .attr('width', (d) => d.label.length * 11 + 12)
      .attr('height', 16)
      .attr('rx', 6)
      .attr('fill', (d) => (d.isLiveGenerated ? '#30d158' : d.id === selectedNodeId ? d.color : 'rgba(0, 0, 0, 0.75)'))
      .attr('stroke', (d) => (d.id === selectedNodeId ? '#ffffff' : 'rgba(255, 255, 255, 0.15)'))
      .attr('stroke-width', 1);

    labelGroup
      .append('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.2em')
      .attr('fill', (d) => (d.isLiveGenerated ? '#000000' : d.id === selectedNodeId ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'))
      .attr('font-size', '10px')
      .attr('font-weight', 'bold');

    // Simulation Tick
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
  }, [nodes, links, selectedNodeId, activeNodeIds, isLiveSync]);

  return (
    <div ref={containerRef} className="w-full h-[480px] bg-[#0c0e14]/90 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col select-none">
      <div className="absolute top-3 left-4 z-10 flex items-center space-x-2 text-xs">
        <GitFork className="w-4 h-4 text-purple-400" />
        <span className="font-bold text-white">D3.js 多维逻辑分析拓扑节点</span>
        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30">
          已匹配高亮 {activeNodeIds.size} / {nodes.length} 个节点
        </span>
      </div>

      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute bottom-3 right-4 z-10 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-white/60">
        <span>支持拖拽与滚轮缩放</span>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN AI ANALYSIS VIEW COMPONENT
// ==========================================

export const AIAnalysisView: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  const [activeMainTab, setActiveMainTab] = useState<'web' | 'novel'>('web');
  const [viewSubTab, setViewSubTab] = useState<'dashboard' | 'graph'>('graph');

  // --- Live Sync Mode State (macOS Activity Monitor Style) ---
  const [isLiveSync, setIsLiveSync] = useState(true);
  const [liveBannerText, setLiveBannerText] = useState<string | null>(null);

  // --- Dynamic Graph State ---
  const [webGraphNodes, setWebGraphNodes] = useState<LogicNode[]>(INITIAL_WEB_GRAPH_NODES);
  const [webGraphLinks, setWebGraphLinks] = useState<LogicLink[]>(INITIAL_WEB_GRAPH_LINKS);

  const [novelGraphNodes, setNovelGraphNodes] = useState<LogicNode[]>(INITIAL_NOVEL_GRAPH_NODES);
  const [novelGraphLinks, setNovelGraphLinks] = useState<LogicLink[]>(INITIAL_NOVEL_GRAPH_LINKS);

  // --- Hierarchical Filter States ---
  const [minConfidenceFilter, setMinConfidenceFilter] = useState<number>(90);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [depthFilter, setDepthFilter] = useState<number>(0);

  // --- Web Analysis State ---
  const [webUrl, setWebUrl] = useState("https://www.theverge.com/features/apple-spatial-computing-future-architecture");
  const [webExtractMode, setWebExtractMode] = useState("deep");
  const [webDrawerOpen, setWebDrawerOpen] = useState(false);
  const [isWebAnalyzing, setIsWebAnalyzing] = useState(false);
  const [webProgress, setWebProgress] = useState(0);
  const [webStep, setWebStep] = useState(1);
  const [resFilter, setResFilter] = useState<'all' | 'image' | 'media' | 'doc'>('all');
  const [selectedAsset, setSelectedAsset] = useState<ResourceItem | null>(null);

  // --- Novel Analysis State ---
  const [novelText, setNovelText] = useState(NOVEL_PRESETS.xuanhuan.text);
  const [novelGranularity, setGranularity] = useState<'macro' | 'volume' | 'chapter' | 'beat'>('chapter');
  const [sensitivity, setSensitivity] = useState(0.82);
  const [isNovelAnalyzing, setIsNovelAnalyzing] = useState(false);
  const [novelProgress, setNovelProgress] = useState(0);
  const [novelProgressMsg, setNovelProgressMsg] = useState("正在切片与语义分析...");
  const [hasNovelResults, setHasNovelResults] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterItem | null>(null);

  // --- Selected D3 Node Modal ---
  const [selectedNode, setSelectedNode] = useState<LogicNode | null>(INITIAL_WEB_GRAPH_NODES[0]);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // ⭐ Listen for global chat message generation event
  useEffect(() => {
    const handleGlobalChatMessage = (event: any) => {
      if (!isLiveSync) return;
      const text = event.detail?.text || '用户新增思考';
      triggerLiveDynamicNodeUpdate(text);
    };

    window.addEventListener('app:chat-message-generated', handleGlobalChatMessage);
    return () => window.removeEventListener('app:chat-message-generated', handleGlobalChatMessage);
  }, [isLiveSync, activeMainTab]);

  // Dynamic Spawning of New Node into D3 Force Graph
  const triggerLiveDynamicNodeUpdate = (chatText: string) => {
    const snippet = chatText.length > 14 ? chatText.slice(0, 14) + '...' : chatText;
    const newNodeId = `live-${Date.now()}`;

    const newNode: LogicNode = {
      id: newNodeId,
      label: `对话联动: ${snippet}`,
      category: 'feature',
      confidence: 98.6,
      color: '#30d158',
      stage: 'Stage 3',
      depthLevel: 3,
      summary: `动态捕获来自对话页面的实时思考：“${chatText}”。`,
      details: `通过全域 EventBus 实时解构思考关联，自动绑定至【${activeMainTab === 'web' ? '网页全域多模态解构中枢' : '网文小说多维解构中枢'}】并重新计算物理力场拓扑。`,
      rawChunk: `User Thought Event: "${chatText}"`,
      isLiveGenerated: true
    };

    if (activeMainTab === 'web') {
      const newLinks: LogicLink[] = [
        ...webGraphLinks,
        { source: 'n-root', target: newNodeId, label: '实时推流关联' },
        { source: 'n-ai', target: newNodeId, label: '语义绑定' }
      ];
      setWebGraphNodes(prev => [...prev, newNode]);
      setWebGraphLinks(newLinks);
    } else {
      const newLinks: LogicLink[] = [
        ...novelGraphLinks,
        { source: 'nn-root', target: newNodeId, label: '实时推流关联' },
        { source: 'nn-pacing', target: newNodeId, label: '节拍匹配' }
      ];
      setNovelGraphNodes(prev => [...prev, newNode]);
      setNovelGraphLinks(newLinks);
    }

    setSelectedNode(newNode);
    setLiveBannerText(`⚡ [macOS 动态监视器] 捕获最新对话思考: "${snippet}" · 已实时挂载 D3 关联节点`);
    showToast(`🟢 实时联动模式：已自动动态生成 D3 关联节点《${newNode.label}》`);

    setTimeout(() => setLiveBannerText(null), 5000);
  };

  const handleStartWebAnalysis = () => {
    if (!webUrl.trim() || isWebAnalyzing) return;
    setIsWebAnalyzing(true);
    setWebProgress(10);
    setWebStep(1);

    let progress = 10;
    const interval = setInterval(() => {
      progress += 20;
      if (progress <= 100) {
        setWebProgress(progress);
        setWebStep(Math.min(5, Math.ceil(progress / 20)));
      } else {
        clearInterval(interval);
        setIsWebAnalyzing(false);
        showToast('网页全量资源提取与语义剖析完成！');
      }
    }, 350);
  };

  const handleStartNovelAnalysis = () => {
    if (!novelText.trim() || isNovelAnalyzing) return;
    setIsNovelAnalyzing(true);
    setNovelProgress(15);
    setHasNovelResults(false);

    const stages = [
      { pct: 25, msg: "语义切片与自然段落语义依存分析..." },
      { pct: 50, msg: "解构人物主次出场频次与对立动机..." },
      { pct: 75, msg: "拟合多巴胺与期待感心电波形..." },
      { pct: 90, msg: "挖掘未解伏笔与爽感兑现节奏..." },
      { pct: 100, msg: "拆书大纲与文风改进报告生成完毕" }
    ];

    let idx = 0;
    const timer = setInterval(() => {
      if (idx < stages.length) {
        setNovelProgress(stages[idx].pct);
        setNovelProgressMsg(stages[idx].msg);
        idx++;
      } else {
        clearInterval(timer);
        setIsNovelAnalyzing(false);
        setHasNovelResults(true);
        showToast('小说核心架构与节拍拆解已生成！');
      }
    }, 380);
  };

  const handleDownloadZip = () => {
    showToast('已触发打包下载：OmniIntel_Web_Archive.zip');
  };

  const handleCopyCleanMarkdown = () => {
    const md = `# Apple Vision Pro: 空间计算系统架构解析\n\n**核心摘要**：本报告剖析了 Apple 空间计算体系在下一代计算平台中的软硬件闭环...\n- 分辨率：双目 Micro-OLED 2300 万像素\n- 芯片方案：M2 + R1 实时协同\n- 交互机制：注视点追踪 + 微手势响应`;
    navigator.clipboard.writeText(md);
    showToast('已复制净化后的 Markdown 文本至剪贴板');
    if (onSaveToMaterial) {
      onSaveToMaterial("网页深度解析: Apple Vision Pro 空间计算", md);
    }
  };

  const handleExportNovelReport = () => {
    const report = `# 《小说结构深度拆解与创作指引报告》\n\n生成引擎: OmniIntel Pro v3.4\n分析字数: ${novelText.length.toLocaleString()} 字\n\n## 1. 情绪多巴胺与节奏心电图评估\n- 紧凑度评分: 92.4 (S级爽点密度)\n- 核心机制: “压抑-破局-留钩”三拍子高度自洽\n\n## 2. 核心人物动机\n- 陈凡: 查清身世血仇，独占远古权限\n- 苏清寒: 破除宗门宿命联姻\n- 赵天烈: 夺宝立威反遭制裁\n\n## 3. 金手指设定闭环\n- 【时间回溯沙漏】: 冷却时间受气血限制，避免无成本滥用`;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "OmniIntel_小说大纲拆解报告.md";
    a.click();
    URL.revokeObjectURL(url);
    showToast('已导出 Markdown 拆书大纲');
    if (onSaveToMaterial) {
      onSaveToMaterial("小说拆解报告: 万古天帝开篇", report);
    }
  };

  const filteredResources = SAMPLE_WEB_RESOURCES.filter(r => resFilter === 'all' || r.category === resFilter);

  // Active D3 graph datasets
  const activeNodes = activeMainTab === 'web' ? webGraphNodes : novelGraphNodes;
  const activeLinks = activeMainTab === 'web' ? webGraphLinks : novelGraphLinks;

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto bg-[var(--apple-bg)] text-[var(--apple-text-primary)] select-none font-sans">
      {/* Dynamic Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-apple-gray-900/90 dark:bg-white/90 text-white dark:text-black text-xs font-medium shadow-2xl flex items-center space-x-2 backdrop-blur-md animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="sticky top-0 z-30 bg-[var(--apple-surface)]/80 backdrop-blur-2xl border-b border-[var(--apple-border)] px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-slate-800 to-black dark:from-white dark:to-slate-200 text-white dark:text-black flex items-center justify-center shadow-xs">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold tracking-tight">OmniIntel Pro</span>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded-full border border-blue-500/20 font-mono">
              v3.4 Neural
            </span>
          </div>
        </div>

        {/* Segmented Control Switcher */}
        <div className="flex items-center space-x-3">
          <div className="bg-[var(--apple-subtle)] p-0.5 rounded-full inline-flex items-center text-xs font-medium border border-[var(--apple-border)]">
            <button
              onClick={() => { setActiveMainTab('web'); setSelectedNode(webGraphNodes[0]); }}
              className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center space-x-1.5 ${
                activeMainTab === 'web'
                  ? 'bg-[var(--apple-surface)] text-[var(--apple-text-primary)] shadow-xs font-bold'
                  : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>网页智能嗅探与提取</span>
            </button>
            <button
              onClick={() => { setActiveMainTab('novel'); setSelectedNode(novelGraphNodes[0]); }}
              className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center space-x-1.5 ${
                activeMainTab === 'novel'
                  ? 'bg-[var(--apple-surface)] text-[var(--apple-text-primary)] shadow-xs font-bold'
                  : 'text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>长篇小说与文本拆解</span>
            </button>
          </div>

          {/* Sub view toggle: Dashboard vs Graph */}
          <div className="bg-[var(--apple-subtle)] p-0.5 rounded-full inline-flex items-center text-xs font-medium border border-[var(--apple-border)]">
            <button
              onClick={() => setViewSubTab('graph')}
              className={`px-3 py-1 rounded-full transition ${
                viewSubTab === 'graph' ? 'bg-purple-600 text-white font-bold' : 'text-[var(--apple-text-tertiary)]'
              }`}
              title="D3.js 节点关系图"
            >
              <GitFork className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewSubTab('dashboard')}
              className={`px-3 py-1 rounded-full transition ${
                viewSubTab === 'dashboard' ? 'bg-blue-600 text-white font-bold' : 'text-[var(--apple-text-tertiary)]'
              }`}
              title="分析大纲 Dashboard"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Sync Indicator Pill */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => {
              setIsLiveSync(prev => !prev);
              showToast(isLiveSync ? '已关闭对话实时联动模式' : '已开启 macOS 动态监视器实时联动模式');
            }}
            className={`px-3 py-1 rounded-full border transition flex items-center space-x-1.5 ${
              isLiveSync
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold'
                : 'bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)] border-[var(--apple-border)]'
            }`}
            title="模拟 macOS Activity Monitor 实时监听对话推流"
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveSync ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{isLiveSync ? '🟢 实时联动开启' : '⚪ 实时联动关闭'}</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">
        {/* ============================================================ */}
        {/* 🌟 D3.JS INTERACTIVE GRAPH & HIERARCHICAL FILTER BAR */}
        {/* ============================================================ */}
        {viewSubTab === 'graph' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Live macOS Activity Monitor Style Status Banner */}
            {liveBannerText && (
              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in zoom-in-95">
                <div className="flex items-center space-x-2">
                  <RadioTower className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>{liveBannerText}</span>
                </div>
                <button onClick={() => setLiveBannerText(null)} className="text-emerald-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ⭐ 层级与关联度交互式筛选栏 */}
            <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-md flex flex-wrap items-center justify-between gap-4 text-xs select-none">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-1.5 text-purple-400 font-bold">
                  <Filter className="w-4 h-4" />
                  <span>层级筛选器:</span>
                </div>

                {/* Filter 1: Min Confidence Slider */}
                <div className="flex items-center space-x-2 bg-[var(--apple-subtle)] px-3 py-1.5 rounded-xl border border-[var(--apple-border)]">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[var(--apple-text-tertiary)] font-mono">关联置信度:</span>
                  <select
                    value={minConfidenceFilter}
                    onChange={e => setMinConfidenceFilter(Number(e.target.value))}
                    className="bg-transparent text-[var(--apple-text-primary)] font-bold font-mono focus:outline-none cursor-pointer"
                  >
                    <option value={90}>所有 (≥ 90%)</option>
                    <option value={95}>高置信 (≥ 95%)</option>
                    <option value={98}>极高置信 (≥ 98%)</option>
                  </select>
                </div>

                {/* Filter 2: Stage Selector */}
                <div className="flex items-center space-x-2 bg-[var(--apple-subtle)] px-3 py-1.5 rounded-xl border border-[var(--apple-border)]">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[var(--apple-text-tertiary)] font-mono">分析阶段:</span>
                  <select
                    value={stageFilter}
                    onChange={e => setStageFilter(e.target.value)}
                    className="bg-transparent text-[var(--apple-text-primary)] font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="all">全部阶段</option>
                    <option value="Stage 0">Stage 0: 路由/文本</option>
                    <option value="Stage 1">Stage 1: 清洗/节奏</option>
                    <option value="Stage 2">Stage 2: 媒体/钩子</option>
                    <option value="Stage 3">Stage 3: 语义/文风</option>
                    <option value="Stage 4">Stage 4: 打包归档</option>
                  </select>
                </div>

                {/* Filter 3: Depth Level */}
                <div className="flex items-center space-x-2 bg-[var(--apple-subtle)] px-3 py-1.5 rounded-xl border border-[var(--apple-border)]">
                  <Layers3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[var(--apple-text-tertiary)] font-mono">层级深度:</span>
                  <select
                    value={depthFilter}
                    onChange={e => setDepthFilter(Number(e.target.value))}
                    className="bg-transparent text-[var(--apple-text-primary)] font-bold focus:outline-none cursor-pointer"
                  >
                    <option value={0}>全部层级</option>
                    <option value={1}>Level 1: 核心根节点</option>
                    <option value={2}>Level 2: 一级流水线</option>
                    <option value={3}>Level 3: 叶子证据/细节</option>
                  </select>
                </div>
              </div>

              {/* Simulation Live Dispatch Demo Button */}
              <button
                onClick={() => {
                  triggerLiveDynamicNodeUpdate('探讨 Vision Pro 注视点渲染与显存吞吐优化算法');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition"
                title="手动模拟对话页面产生新思考推流"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>模拟实时对话推流</span>
              </button>
            </div>

            {/* D3 Simulation Graph */}
            <D3LogicGraph
              nodes={activeNodes}
              links={activeLinks}
              selectedNodeId={selectedNode?.id}
              minConfidence={minConfidenceFilter}
              selectedStage={stageFilter}
              selectedDepth={depthFilter}
              isLiveSync={isLiveSync}
              onSelectNode={(node) => setSelectedNode(node)}
            />

            {/* D3 Selected Node Detail Inspector Panel */}
            {selectedNode && (
              <div className="p-5 rounded-2xl bg-[var(--apple-surface)] border border-purple-500/30 shadow-xl space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between border-b border-[var(--apple-border)] pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold text-[var(--apple-text-primary)]">
                      D3.js 逻辑节点 AI 分析详情：{selectedNode.label}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 font-mono text-xs">
                    {selectedNode.isLiveGenerated && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center space-x-1">
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span>对话实时联动</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-bold border border-purple-500/30">
                      ✦ 置信度 {selectedNode.confidence}%
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)]">
                      {selectedNode.stage}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <span className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">推理过程与摘要 (Reasoning Summary)</span>
                    <p className="text-[var(--apple-text-primary)] leading-relaxed p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                      {selectedNode.summary}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">深度剖析细节 (Deep Analytical Breakdown)</span>
                    <p className="text-[var(--apple-text-secondary)] leading-relaxed p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                      {selectedNode.details}
                    </p>
                  </div>
                </div>

                {selectedNode.rawChunk && (
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)]">原始切片 / 关联代码段 (Source Code / Chunk)</span>
                    <pre className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                      {selectedNode.rawChunk}
                    </pre>
                  </div>
                )}

                <div className="pt-2 border-t border-[var(--apple-border)] flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      if (onSaveToMaterial) {
                        onSaveToMaterial(`AI分析节点: ${selectedNode.label}`, `${selectedNode.summary}\n\n${selectedNode.details}`);
                      }
                      showToast(`已将逻辑节点《${selectedNode.label}》的分析结论收录至素材库`);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-xs"
                  >
                    存入素材知识库
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DASHBOARD VIEWS */}
        {activeMainTab === 'web' && viewSubTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-md space-y-4">
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                <div className="flex-1 relative flex items-center">
                  <div className="absolute left-3.5 text-[var(--apple-text-tertiary)] flex items-center pointer-events-none">
                    <Lock className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={webUrl}
                    onChange={e => setWebUrl(e.target.value)}
                    placeholder="输入网页目标 URL..."
                    className="w-full pl-16 pr-24 py-3 bg-[var(--apple-subtle)] rounded-xl border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] focus:outline-none focus:border-blue-500 font-mono transition-all"
                  />
                </div>

                <button
                  onClick={handleStartWebAnalysis}
                  disabled={isWebAnalyzing}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center space-x-2 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>开始智能解析</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-md space-y-3">
                <h3 className="text-sm font-bold text-[var(--apple-text-primary)]">AI 智能页面速览与核心摘要</h3>
                <p className="text-xs text-[var(--apple-text-primary)] leading-relaxed">
                  本篇报道深入拆解了 Apple 空间计算系统架构在下一代人机交互中的软硬件协作机制。核心聚焦于 R1 实时协处理器的低延迟流渲染管线与注视点渲染优化。
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-md space-y-3">
                <h3 className="text-sm font-bold text-[var(--apple-text-primary)]">资源打包与导出</h3>
                <button onClick={handleDownloadZip} className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold">
                  打包下载全量资源 (ZIP)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeMainTab === 'novel' && viewSubTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-md space-y-3">
              <h3 className="text-xs font-bold text-[var(--apple-text-primary)]">长篇小说原稿输入</h3>
              <textarea
                value={novelText}
                onChange={e => setNovelText(e.target.value)}
                rows={8}
                className="w-full p-3.5 bg-[var(--apple-subtle)] rounded-xl border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)]"
              />
              <button onClick={handleStartNovelAnalysis} className="py-2.5 px-6 rounded-xl bg-purple-600 text-white text-xs font-bold">
                运行拆解引擎
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={() => setSelectedAsset(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[var(--apple-border)] pb-2">
              <span className="text-xs font-bold">{selectedAsset.name}</span>
              <button onClick={() => setSelectedAsset(null)}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-[var(--apple-text-secondary)]">{selectedAsset.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
};
