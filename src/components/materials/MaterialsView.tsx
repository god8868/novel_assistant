import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FolderGit2, 
  Search, 
  Plus, 
  Tag, 
  Star, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  FileText, 
  Layers, 
  Globe, 
  StickyNote, 
  Sparkles, 
  Compass, 
  Brain, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  Network, 
  BookOpen, 
  Upload, 
  Link2, 
  User, 
  Flame, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown, 
  Edit3, 
  Folder, 
  FolderPlus, 
  FilePlus, 
  FolderOpen, 
  Download, 
  MoreHorizontal, 
  FileCode, 
  SlidersHorizontal, 
  BookmarkPlus, 
  ArrowRight, 
  Database, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  GitFork, 
  Eye, 
  PanelRight, 
  Clock, 
  Image as ImageIcon, 
  Headphones, 
  Code2, 
  Cloud, 
  Expand, 
  Play, 
  CheckCircle2, 
  CheckCircle, 
  PlusCircle, 
  Hash, 
  ArrowUpRight,
  Lock,
  Archive,
  Table as TableIcon,
  HardDrive,
  FileSpreadsheet,
  AlertOctagon,
  Shield,
  FolderTree,
  Filter,
  CornerDownRight,
  CheckSquare,
  Columns as ColumnsIcon
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

// ==========================================
// 1. DATA STRUCTURES & MULTI-VAULT TYPES
// ==========================================

export type VaultColor = '#0a84ff' | '#bf5af2' | '#30d158' | '#ff9f0a' | '#64d2ff' | '#ff453a';

export interface Vault {
  id: string;
  name: string;
  description: string;
  color: VaultColor;
  icon: string;
  storageUsed: string;
  fileCount: number;
  embeddingModel: string;
  createdAt: number;
}

export type MultimodalBadge = 'Doc' | 'Table' | 'Image' | 'Audio' | 'Code';

export interface VaultFile {
  id: string;
  vaultId: string;
  folderId: string; // 'root' or folder ID
  title: string;
  type: 'md' | 'code' | 'pdf' | 'image' | 'audio' | 'html' | 'xlsx' | 'csv';
  badge: MultimodalBadge;
  formatLabel: string;
  size: string;
  date: string;
  starred: boolean;
  colorTag: 'purple' | 'blue' | 'green' | 'orange' | 'yellow' | 'red';
  tags: string[];
  relevance: number;
  tokenCount: number;
  chunkCount: number;
  previewText: string;
  summary: string;
  entities: string[];
  backlinks: string[];
  content: string;
  isTrash?: boolean;
}

export interface VaultFolder {
  id: string;
  vaultId: string;
  parentId: string | null; // null for root level
  name: string;
  isOpen: boolean;
  isTrash?: boolean;
}

// For compatibility with MaterialKnowledgeGraph
export interface TreeItem {
  id: string;
  kbId: string;
  parentId: string | null;
  type: 'folder' | 'file';
  kind: 'web' | 'text' | 'file' | 'ai' | 'report' | 'note';
  title: string;
  body: string;
  source_url?: string;
  tags?: string[];
  favorite: number;
  isOpen?: boolean;
  updatedAt: string;
  createdAt: number;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: number;
}

// ==========================================
// 2. MULTI-VAULT SANDBOX DATASET
// ==========================================

const INITIAL_VAULTS: Vault[] = [
  {
    id: 'vault-semi',
    name: '商业投资与半导体研报库',
    description: '独立命名空间 · 存储先进晶圆制程、算力集群架构与投研财务模型',
    color: '#0a84ff',
    icon: '📊',
    storageUsed: '42.8 MB',
    fileCount: 4,
    embeddingModel: 'text-embedding-3-large (3072维)',
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'vault-novel',
    name: '《九渊破妄录》世界观法则库',
    description: '独立命名空间 · 收录天道因果、境界梯度、宗门垄断与法宝账本',
    color: '#bf5af2',
    icon: '🔮',
    storageUsed: '18.4 MB',
    fileCount: 3,
    embeddingModel: 'bge-m3-multilingual (1024维)',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'vault-code',
    name: '个人代码与着色器架构库',
    description: '独立命名空间 · Metal 3 片元着色器、SwiftData 向量引擎与 WebGPU 管线',
    color: '#30d158',
    icon: '💻',
    storageUsed: '24.1 MB',
    fileCount: 3,
    embeddingModel: 'code-search-babbage (1536维)',
    createdAt: Date.now() - 86400000 * 2
  }
];

const INITIAL_FOLDERS: VaultFolder[] = [
  // --- Vault 1: 半导体与商业研报 ---
  { id: 'f-semi-1', vaultId: 'vault-semi', parentId: null, name: '01_先进晶圆与光刻制程', isOpen: true },
  { id: 'f-semi-2', vaultId: 'vault-semi', parentId: null, name: '02_算力集群与互联拓扑', isOpen: true },
  { id: 'f-semi-2-1', vaultId: 'vault-semi', parentId: 'f-semi-2', name: 'NV_Blackwell架构', isOpen: true },
  { id: 'f-semi-3', vaultId: 'vault-semi', parentId: null, name: '03_财务模型与产能排期', isOpen: false },

  // --- Vault 2: 小说世界观 ---
  { id: 'f-novel-1', vaultId: 'vault-novel', parentId: null, name: '01_天道因果与代价体系', isOpen: true },
  { id: 'f-novel-2', vaultId: 'vault-novel', parentId: null, name: '02_宗门垄断与散修赋税', isOpen: true },

  // --- Vault 3: 个人代码 ---
  { id: 'f-code-1', vaultId: 'vault-code', parentId: null, name: '01_Metal3_着色器管线', isOpen: true },
  { id: 'f-code-2', vaultId: 'vault-code', parentId: null, name: '02_SwiftData_离线向量索引', isOpen: true }
];

const INITIAL_FILES: VaultFile[] = [
  // --- Vault 1: 半导体与商业研报 ---
  {
    id: 'file-semi-1',
    vaultId: 'vault-semi',
    folderId: 'f-semi-1',
    title: '2026_AI芯片先进制程演进与台积电A16规划.pdf',
    type: 'pdf',
    badge: 'Doc',
    formatLabel: 'PDF',
    size: '14.2 MB',
    date: '2026-09-28',
    starred: true,
    colorTag: 'blue',
    tags: ['半导体', '先进制程', 'A16', '台积电'],
    relevance: 99,
    tokenCount: 48200,
    chunkCount: 64,
    previewText: '深入分析 A16 制程中 SuperPower 背面供电网络（BSPDN）对高频算力芯片压降与能效比的提升幅度...',
    summary: '台积电 A16 纳米制程采用背面供电网络与纳米片晶体管架构，在相同 Vdd 下带来 8~10% 的速度提升与 15~20% 的功耗缩减。',
    entities: ['SuperPower 背面供电', '纳米片晶体管', 'A16制程', '能效比'],
    backlinks: ['file-semi-2'],
    content: `# 2026 AI 芯片先进制程研报

## 1. 核心架构突破：背面供电网络（BSPDN）
将电源信号与数据信号分离布线，消除正面金属层的红外压降（IR Drop），为超大尺寸 AI Accelerator 释放超 15% 的金属互联布线资源。`
  },
  {
    id: 'file-semi-2',
    vaultId: 'vault-semi',
    folderId: 'f-semi-2-1',
    title: 'NV_B200_超节点互联拓扑与液冷散热拆解.md',
    type: 'md',
    badge: 'Doc',
    formatLabel: 'MARKDOWN',
    size: '18.4 KB',
    date: '2026-09-26',
    starred: true,
    colorTag: 'purple',
    tags: ['Blackwell', 'NVLink5', '液冷散热', '算力集群'],
    relevance: 96,
    tokenCount: 16500,
    chunkCount: 22,
    previewText: 'NVLink 5.0 双向 1.8TB/s 带宽下，72 颗 GPU 构成单机柜统一共享内存域，液冷进水温差控制在 32°C 以内...',
    summary: '详细拆解 NVLink 5 铜缆直连与高密机柜散热模型，探讨万卡集群在 128k 上下文训练中的 AllReduce 通信延迟。',
    entities: ['NVLink 5.0', '液冷温差', '统一内存域', 'AllReduce'],
    backlinks: ['file-semi-1'],
    content: `# NV_B200 超节点架构分析

## 1. 内存共享域
NVLink 5.0 实现 72-GPU 极低延迟全互联，为 Mixture-of-Experts（MoE）路由提供无损高带宽保障。`
  },
  {
    id: 'file-semi-3',
    vaultId: 'vault-semi',
    folderId: 'f-semi-3',
    title: '2025Q4_全球先进封测产能排期与单价测算.xlsx',
    type: 'xlsx',
    badge: 'Table',
    formatLabel: 'EXCEL',
    size: '2.8 MB',
    date: '2026-09-20',
    starred: false,
    colorTag: 'green',
    tags: ['CoWoS', '封测产能', '财务模型', '单价测算'],
    relevance: 91,
    tokenCount: 8200,
    chunkCount: 12,
    previewText: '包含日月光、台积电 CoWoS-S 与 CoWoS-L 季度出货晶圆当量数据，以及 2.5D 中介层良率爬坡曲线...',
    summary: '结构化表格记录 2025-2026 各代工厂 CoWoS 产能供给缺口，测算单颗芯片封装成本变动对整机毛利率的影响。',
    entities: ['CoWoS-L', '中介层良率', '封装单价', '产能缺口'],
    backlinks: [],
    content: `| 季度 | CoWoS-S 晶圆 (k/月) | CoWoS-L 晶圆 (k/月) | 平均单价 ($) | 良品率 (%) |
| --- | --- | --- | --- | --- |
| 2025Q4 | 38.5 | 16.2 | 4,200 | 94.2% |
| 2026Q1 | 42.0 | 22.5 | 3,950 | 96.1% |`
  },
  {
    id: 'file-semi-4',
    vaultId: 'vault-semi',
    folderId: 'f-semi-1',
    title: '芯片微观晶圆缺陷与电镜扫描图鉴.png',
    type: 'image',
    badge: 'Image',
    formatLabel: 'IMAGE',
    size: '5.6 MB',
    date: '2026-09-18',
    starred: false,
    colorTag: 'orange',
    tags: ['晶圆缺陷', '电镜扫描', '良率分析'],
    relevance: 85,
    tokenCount: 3200,
    chunkCount: 4,
    previewText: '透射电镜（TEM）高倍率断层扫描，标定栅极氧化层微孔洞与铜互连空洞形态...',
    summary: '多模态图像资产，利用 Vision 模型提取缺陷几何分布特征与工艺补偿建议。',
    entities: ['透射电镜 TEM', '栅极氧化层', '铜互连空洞'],
    backlinks: [],
    content: `【视觉多模态数据说明】
分辨率：4096 x 2160 • 4-bit 灰度电镜图像。
已完成自动 OCR 与缺陷形态标注。`
  },

  // --- Vault 2: 小说世界观 ---
  {
    id: 'file-novel-1',
    vaultId: 'vault-novel',
    folderId: 'f-novel-1',
    title: '破妄真瞳施展反噬与寒玉髓压制法则.md',
    type: 'md',
    badge: 'Doc',
    formatLabel: 'MARKDOWN',
    size: '12.6 KB',
    date: '2026-09-25',
    starred: true,
    colorTag: 'purple',
    tags: ['世界观', '瞳术法则', '生理反噬', '核心设定'],
    relevance: 98,
    tokenCount: 14200,
    chunkCount: 18,
    previewText: '破妄真瞳照彻气机缝隙具有严格的“三息极限”生理约束，超限将引发经络烈铁灼烧反噬...',
    summary: '明确了主角瞳术的运作界限与消耗代价，设置不可逾越的生理约束以保证长篇小说战力不崩塌。',
    entities: ['破妄真瞳', '三息极限', '寒玉髓', '经络灼烧'],
    backlinks: ['file-novel-2'],
    content: `# 破妄真瞳施展法则与反噬规约

## 1. 代价守恒
每次施展不可连续超过三息，否则暗金灵纹逆冲心脉，需配合万年寒玉髓方可平息。`
  },
  {
    id: 'file-novel-2',
    vaultId: 'vault-novel',
    folderId: 'f-novel-2',
    title: '宗门垄断清气灵脉对散修经济的剥削模型.md',
    type: 'md',
    badge: 'Doc',
    formatLabel: 'MARKDOWN',
    size: '15.1 KB',
    date: '2026-09-22',
    starred: false,
    colorTag: 'blue',
    tags: ['修真社会学', '散修赋税', '黑市经济'],
    relevance: 94,
    tokenCount: 18900,
    chunkCount: 24,
    previewText: '仙门控制筑基丹与飞舟通行证，散修需上缴九成采集灵草以换取庇护，形成严密的阶层依附...',
    summary: '构建了逻辑自洽的修真界资源分配体系，为底层散修与高层仙门之间的阶级冲突奠定叙事底色。',
    entities: ['筑基丹配额', '飞舟通行证', '九渊灵草税', '黑市钱庄'],
    backlinks: ['file-novel-1'],
    content: `# 修真阶层资源垄断模型

仙门垄断九重天清气灵眼，散修居于浊煞大泽，需定期上缴灵石换取清气丹，形成经济锁链。`
  },
  {
    id: 'file-novel-3',
    vaultId: 'vault-novel',
    folderId: 'f-novel-1',
    title: '先秦神异母题与天人五衰病理考据.pdf',
    type: 'pdf',
    badge: 'Doc',
    formatLabel: 'PDF',
    size: '4.8 MB',
    date: '2026-09-15',
    starred: true,
    colorTag: 'yellow',
    tags: ['志怪考据', '天人五衰', '神异病理'],
    relevance: 92,
    tokenCount: 28000,
    chunkCount: 36,
    previewText: '论述古代典籍中羽化飞升与肉体疯狂的共生性，强调神性与异化的两面一体...',
    summary: '考据先秦两汉神怪典籍，为小说中的仙人堕落与天道崩裂提供扎实的文献学依据。',
    entities: ['天人五衰', '山海经异化', '肉身神异', '文献实证'],
    backlinks: [],
    content: `# 先秦神怪叙事与肉体变异考

古代神话中凡人窥视神明必付肉身代价，羽化与异化并存。`
  },

  // --- Vault 3: 个人代码 ---
  {
    id: 'file-code-1',
    vaultId: 'vault-code',
    folderId: 'f-code-1',
    title: '基于 Metal 3 的物理磨砂玻璃着色器.metal',
    type: 'code',
    badge: 'Code',
    formatLabel: 'METAL',
    size: '4.8 KB',
    date: '2026-09-25',
    starred: true,
    colorTag: 'orange',
    tags: ['Metal3', '着色器', '物理磨砂', 'VisionOS'],
    relevance: 95,
    tokenCount: 4800,
    chunkCount: 6,
    previewText: 'fragment float4 frostedGlassFragment(VertexOut in [[stage_in]], texture2d<float> sceneTex [[texture(0)]]) { ...',
    summary: '高性能 Metal 3 片元着色器，利用双重高斯采样与环境光探针实现 120fps 极速透射磨砂效果。',
    entities: ['Metal 3', '高斯模糊', '片元着色器', '环境光探针'],
    backlinks: [],
    content: `// Metal 3 Frosted Glass Shader
#include <metal_stdlib>
using namespace metal;

fragment float4 frostedGlassFragment(VertexOut in [[stage_in]]) {
    return float4(0.15, 0.18, 0.25, 0.85);
}`
  },
  {
    id: 'file-code-2',
    vaultId: 'vault-code',
    folderId: 'f-code-2',
    title: 'SwiftData 离线知识向量索引实践.swift',
    type: 'code',
    badge: 'Code',
    formatLabel: 'SWIFT',
    size: '6.2 KB',
    date: '2026-09-20',
    starred: true,
    colorTag: 'blue',
    tags: ['SwiftData', '向量检索', 'Accelerate', 'CoreML'],
    relevance: 93,
    tokenCount: 6200,
    chunkCount: 8,
    previewText: '@Model final class KnowledgeEmbedding { @Attribute(.unique) var id: UUID; var vector: [Float]; ...',
    summary: '基于 SwiftData 与 Accelerate 框架的本地余弦相似度检索库，实现 50,000 篇知识卡片 15ms 毫秒级召回。',
    entities: ['SwiftData', '余弦相似度', 'Accelerate框架', 'CoreML'],
    backlinks: [],
    content: `// SwiftData Vector Search Engine
import SwiftData
import Accelerate

@Model
final class KnowledgeEmbedding {
    var id: UUID
    var vector: [Float]
}`
  },
  {
    id: 'file-code-3',
    vaultId: 'vault-code',
    folderId: 'f-code-1',
    title: 'WebGPU 现代计算着色器管线剪藏.html',
    type: 'html',
    badge: 'Code',
    formatLabel: 'WEB CLIP',
    size: '420 KB',
    date: '2026-09-10',
    starred: false,
    colorTag: 'green',
    tags: ['WebGPU', 'ComputeShader', 'WGSL'],
    relevance: 88,
    tokenCount: 9400,
    chunkCount: 14,
    previewText: '剪藏自 W3C WebGPU Working Group。针对 Compute Shader 异步计算与 Indirect Draw 间接绘制的最新案例解析...',
    summary: '网页原生 GPU 加速标准深度剪藏，涵盖着色语言 WGSL 与底层 Metal/DirectX 12 的映射对齐。',
    entities: ['WebGPU', 'WGSL', 'Compute Shader', '间接绘制'],
    backlinks: [],
    content: `<!-- WebGPU Pipeline Clip -->
<h1>WebGPU: Compute Shader Pipeline</h1>`
  }
];

export const MaterialsView: React.FC = () => {
  // Vaults State (Level 0)
  const [vaults, setVaults] = useState<Vault[]>(INITIAL_VAULTS);
  const [activeVaultId, setActiveVaultId] = useState<string>('vault-semi');

  // Folders State (Levels 1..N)
  const [folders, setFolders] = useState<VaultFolder[]>(INITIAL_FOLDERS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Files State (Level N+1)
  const [files, setFiles] = useState<VaultFile[]>(INITIAL_FILES);
  const [selectedFileId, setSelectedFileId] = useState<string>('file-semi-1');

  // ⭐ 核心新增：macOS Finder 分栏视图深入路径追踪 (Miller Columns Active Path)
  const [columnPath, setColumnPath] = useState<string[]>(['f-semi-2', 'f-semi-2-1']);

  // Scoped Copilot Context (Folder filter / Entire Vault)
  const [scopedFolderId, setScopedFolderId] = useState<string | null>(null);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<{ role: 'user' | 'assistant'; text: string; scopeBadge?: string }[]>([
    { role: 'assistant', text: '你好！我是本知识库的专属副驾。当前检索范围已硬隔离于【商业投资与半导体研报库】内部，你可以向我提问或圈定文件夹检索。' }
  ]);
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  // View Mode: 'grid' | 'list' | 'columns' | 'graph'
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'columns' | 'graph'>('columns');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [inspectorOpen, setInspectorOpen] = useState(true);

  // Modals & Popups
  const [showNewVaultModal, setShowNewVaultModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [quickLookOpen, setQuickLookOpen] = useState(false);
  const [shakeSidebar, setShakeSidebar] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultDesc, setNewVaultDesc] = useState('');
  const [newVaultColor, setNewVaultColor] = useState<VaultColor>('#0a84ff');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileTitle, setNewFileTitle] = useState('');
  const [newFileType, setNewFileType] = useState<'md' | 'code' | 'pdf' | 'xlsx' | 'audio'>('md');
  const [newFileContent, setNewFileContent] = useState('');

  // Auto-scroll ref for Miller Columns container
  const columnsContainerRef = useRef<HTMLDivElement>(null);

  // Active Vault & File resolution
  const activeVault = vaults.find(v => v.id === activeVaultId) || vaults[0];
  const activeFiles = useMemo(() => files.filter(f => f.vaultId === activeVaultId && !f.isTrash), [files, activeVaultId]);
  const activeFolders = useMemo(() => folders.filter(f => f.vaultId === activeVaultId && !f.isTrash), [folders, activeVaultId]);
  const selectedFile = files.find(f => f.id === selectedFileId) || activeFiles[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Keyboard Shortcuts (Space for Quick Look, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(activeTag)) {
        e.preventDefault();
        setQuickLookOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setQuickLookOpen(false);
        setShowNewVaultModal(false);
        setShowNewFolderModal(false);
        setShowNewFileModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Vault Switch Handler (Hard Context Reset)
  const handleSwitchVault = (vaultId: string) => {
    if (vaultId === activeVaultId) return;
    setActiveVaultId(vaultId);
    setSelectedFolderId(null);
    setScopedFolderId(null);
    setColumnPath([]);

    // Hard reset Copilot context
    const targetVault = vaults.find(v => v.id === vaultId);
    setCopilotMessages([
      { 
        role: 'assistant', 
        text: `已切换至【${targetVault?.name}】。上下文已执行硬重置与向量分区隔离，杜绝跨库数据召回。` 
      }
    ]);

    const firstFileInVault = files.find(f => f.vaultId === vaultId && !f.isTrash);
    if (firstFileInVault) {
      setSelectedFileId(firstFileInVault.id);
    }
    showToast(`已切换至独立沙箱库：${targetVault?.name}`);
  };

  // Drag & Drop Boundary Guard
  const handleCrossVaultDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setShakeSidebar(true);
    setTimeout(() => setShakeSidebar(false), 500);
  };

  // Toggle Folder Open/Close in Tree View
  const handleToggleFolder = (folderId: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, isOpen: !f.isOpen } : f));
  };

  // Toggle Star
  const handleToggleStar = (fileId: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, starred: !f.starred } : f));
    const target = files.find(f => f.id === fileId);
    showToast(target?.starred ? '已取消星标' : '已加入星标收藏');
  };

  // Filtered Files based on Selected Folder & Search
  const displayFiles = useMemo(() => {
    let list = activeFiles;
    if (selectedFolderId) {
      list = list.filter(f => f.folderId === selectedFolderId);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      list = list.filter(f => 
        f.title.toLowerCase().includes(kw) ||
        f.summary.toLowerCase().includes(kw) ||
        f.tags.some(t => t.toLowerCase().includes(kw))
      );
    }
    return list;
  }, [activeFiles, selectedFolderId, searchKeyword]);

  // Breadcrumb Path Generator
  const breadcrumbs = useMemo(() => {
    const list: string[] = [activeVault.name];
    if (activeView === 'columns' && columnPath.length > 0) {
      columnPath.forEach(fId => {
        const folder = folders.find(f => f.id === fId);
        if (folder) list.push(folder.name);
      });
    } else if (selectedFolderId) {
      const folder = folders.find(f => f.id === selectedFolderId);
      if (folder) {
        if (folder.parentId) {
          const parent = folders.find(f => f.id === folder.parentId);
          if (parent) list.push(parent.name);
        }
        list.push(folder.name);
      }
    }
    if (selectedFile) {
      list.push(selectedFile.title);
    }
    return list;
  }, [activeVault, selectedFolderId, selectedFile, folders, activeView, columnPath]);

  // Copilot Query Submit
  const handleCopilotSubmit = () => {
    if (!copilotInput.trim()) return;
    const q = copilotInput.trim();
    setCopilotInput('');
    setIsCopilotThinking(true);

    const scopeBadge = scopedFolderId 
      ? `📁 仅限定: /${folders.find(f => f.id === scopedFolderId)?.name}` 
      : `📚 知识库全域隔离: ${activeVault.name}`;

    setCopilotMessages(prev => [...prev, { role: 'user', text: q, scopeBadge }]);

    setTimeout(() => {
      let reply = `已在【${activeVault.name}】的物理 Partition 中完成语义检索。\n\n针对问题：“${q}”，提炼要点如下：\n1. **技术与法则约束**：符合当前库隔离索引要求，已过滤无关干扰；\n2. **向量契合度**：匹配到 2 处高置信度切片（Score: 0.98），未发现跨库穿透风险。`;
      setCopilotMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsCopilotThinking(false);
    }, 600);
  };

  // Create New Vault
  const handleCreateVault = () => {
    if (!newVaultName.trim()) return;
    const newV: Vault = {
      id: `vault-${Date.now()}`,
      name: newVaultName.trim(),
      description: newVaultDesc.trim() || '用户自定义独立知识库沙箱',
      color: newVaultColor,
      icon: '📁',
      storageUsed: '1.2 KB',
      fileCount: 0,
      embeddingModel: 'text-embedding-3-large (3072维)',
      createdAt: Date.now()
    };
    setVaults([...vaults, newV]);
    setActiveVaultId(newV.id);
    setShowNewVaultModal(false);
    setNewVaultName('');
    setNewVaultDesc('');
    showToast(`已建立全新独立知识库沙箱《${newV.name}》`);
  };

  // Create New Folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newF: VaultFolder = {
      id: `f-${Date.now()}`,
      vaultId: activeVaultId,
      parentId: selectedFolderId || (columnPath.length > 0 ? columnPath[columnPath.length - 1] : null),
      name: newFolderName.trim(),
      isOpen: true
    };
    setFolders([...folders, newF]);
    setShowNewFolderModal(false);
    setNewFolderName('');
    showToast(`已在当前库创建文件夹【${newF.name}】`);
  };

  // Create New File
  const handleCreateFile = () => {
    if (!newFileTitle.trim()) return;
    const badgeMap: Record<string, MultimodalBadge> = {
      md: 'Doc',
      pdf: 'Doc',
      xlsx: 'Table',
      code: 'Code',
      audio: 'Audio'
    };
    const targetFolderId = selectedFolderId || (columnPath.length > 0 ? columnPath[columnPath.length - 1] : (activeFolders[0]?.id || 'root'));
    const newFi: VaultFile = {
      id: `file-${Date.now()}`,
      vaultId: activeVaultId,
      folderId: targetFolderId,
      title: newFileTitle.trim(),
      type: newFileType,
      badge: badgeMap[newFileType] || 'Doc',
      formatLabel: newFileType.toUpperCase(),
      size: `${(newFileContent.length * 0.08 + 1.5).toFixed(1)} KB`,
      date: '2026-10-01',
      starred: false,
      colorTag: 'blue',
      tags: ['新建文档', '未分类'],
      relevance: 95,
      tokenCount: Math.round(newFileContent.length * 1.5) + 120,
      chunkCount: Math.max(1, Math.round(newFileContent.length / 500)),
      previewText: newFileContent.slice(0, 80) + '...',
      summary: '用户手动创建的新文档，已完成向量化索引。',
      entities: ['新知识节点'],
      backlinks: [],
      content: newFileContent.trim() || '# 未命名手稿\n在此记录正文...'
    };
    setFiles([newFi, ...files]);
    setSelectedFileId(newFi.id);
    setShowNewFileModal(false);
    setNewFileTitle('');
    setNewFileContent('');
    showToast(`已录入文件《${newFi.title}》并建立向量索引`);
  };

  // Standalone Vault Export
  const handleExportVault = () => {
    const vaultData = {
      vault: activeVault,
      folders: activeFolders,
      files: activeFiles,
      exportedAt: new Date().toISOString(),
      formatVersion: 'Apple.Finder.Vault.v2'
    };
    const blob = new Blob([JSON.stringify(vaultData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeVault.name}.vault.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`已成功打包导出【${activeVault.name}】独立归档包`);
  };

  // Get icon by badge
  const getBadgeIcon = (badge: MultimodalBadge) => {
    switch (badge) {
      case 'Doc': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'Table': return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case 'Image': return <ImageIcon className="w-4 h-4 text-pink-400" />;
      case 'Audio': return <Headphones className="w-4 h-4 text-purple-400" />;
      case 'Code': return <Code2 className="w-4 h-4 text-orange-400" />;
      default: return <FileText className="w-4 h-4 text-white/60" />;
    }
  };

  // ============================================================
  // 🏛️ MILLER COLUMNS (分栏视图) 数据计算
  // ============================================================
  const millerColumns = useMemo(() => {
    const cols: {
      depth: number;
      folderId: string | null;
      folders: VaultFolder[];
      files: VaultFile[];
      activeSelectedFolderId?: string | null;
      activeSelectedFileId?: string | null;
    }[] = [];

    // Column 0: Root Level
    const rootFolders = activeFolders.filter(f => f.parentId === null);
    const rootFiles = activeFiles.filter(f => f.folderId === 'root');
    cols.push({
      depth: 0,
      folderId: null,
      folders: rootFolders,
      files: rootFiles,
      activeSelectedFolderId: columnPath[0] || null,
      activeSelectedFileId: columnPath.length === 0 ? selectedFileId : null
    });

    // Sub columns
    columnPath.forEach((parentId, idx) => {
      const subFolders = activeFolders.filter(f => f.parentId === parentId);
      const subFiles = activeFiles.filter(f => f.folderId === parentId);
      cols.push({
        depth: idx + 1,
        folderId: parentId,
        folders: subFolders,
        files: subFiles,
        activeSelectedFolderId: columnPath[idx + 1] || null,
        activeSelectedFileId: selectedFile?.folderId === parentId ? selectedFile.id : null
      });
    });

    return cols;
  }, [activeFolders, activeFiles, columnPath, selectedFileId, selectedFile]);

  // Click Folder in Column View
  const handleColumnFolderClick = (folderId: string, depth: number) => {
    const nextPath = columnPath.slice(0, depth);
    nextPath.push(folderId);
    setColumnPath(nextPath);
    setSelectedFolderId(folderId);

    // Auto select first file in folder if exists
    const firstFile = activeFiles.find(f => f.folderId === folderId);
    if (firstFile) {
      setSelectedFileId(firstFile.id);
    }

    // Smooth horizontal scroll
    setTimeout(() => {
      if (columnsContainerRef.current) {
        columnsContainerRef.current.scrollTo({
          left: columnsContainerRef.current.scrollWidth,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  // Click File in Column View
  const handleColumnFileClick = (fileId: string, depth: number) => {
    setSelectedFileId(fileId);
    const file = files.find(f => f.id === fileId);
    if (file && file.folderId !== 'root') {
      const nextPath = columnPath.slice(0, depth);
      setColumnPath(nextPath);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#0c0e14] text-slate-100 select-none relative font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 right-6 z-50 px-4 py-2 rounded-2xl bg-[#151821]/95 border border-cyan-500/40 shadow-2xl backdrop-blur-2xl text-xs font-semibold text-cyan-200 flex items-center gap-2 animate-in fade-in zoom-in-95">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. TOP macOS SEQUOIA UNIFIED FINDER HEADER */}
      {/* ============================================================ */}
      <header className="h-12 bg-[#151821]/90 backdrop-blur-2xl border-b border-white/10 px-4 flex items-center justify-between z-40 shrink-0 select-none">
        {/* Left: Traffic Lights & Vault Switcher */}
        <div className="flex items-center space-x-3 min-w-[300px]">
          <div className="flex items-center space-x-2 mr-1">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]/50 cursor-pointer hover:brightness-110" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]/50 cursor-pointer hover:brightness-110" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]/50 cursor-pointer hover:brightness-110" />
          </div>

          {/* Active Vault Selector Pill */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeVault.color }} />
            <span className="text-xs font-bold text-white max-w-[150px] truncate">{activeVault.name}</span>
            <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] font-mono text-white/50">沙箱隔离</span>
          </div>

          <button
            onClick={() => setShowNewVaultModal(true)}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
            title="新建独立知识库沙箱"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Search & View Mode Switcher */}
        <div className="flex items-center space-x-3 flex-1 max-w-xl justify-center">
          <div className="relative w-80">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              placeholder={`在【${activeVault.name}】中搜索 (⌘F)...`}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-10 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Segmented View Mode Switcher (Grid / List / Columns / Graph) */}
          <div className="flex items-center bg-black/40 border border-white/10 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setActiveView('grid')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1 transition shadow-sm ${
                activeView === 'grid' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
              }`}
              title="卡片网格"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px]">卡片</span>
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1 transition ${
                activeView === 'list' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
              }`}
              title="Finder 列表"
            >
              <List className="w-3.5 h-3.5" />
              <span className="text-[11px]">列表</span>
            </button>
            <button
              onClick={() => setActiveView('columns')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1 transition ${
                activeView === 'columns' ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20' : 'text-white/50 hover:text-white'
              }`}
              title="macOS Finder 分栏视图 (Miller Columns)"
            >
              <ColumnsIcon className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-[11px]">分栏</span>
            </button>
            <button
              onClick={() => setActiveView('graph')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1 transition ${
                activeView === 'graph' ? 'bg-white/20 text-purple-300' : 'text-white/50 hover:text-white'
              }`}
              title="知识星图拓扑"
            >
              <GitFork className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px]">星图</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Look, Export Vault, Toggle Inspector */}
        <div className="flex items-center space-x-2 min-w-[280px] justify-end">
          <button
            onClick={() => setQuickLookOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs flex items-center space-x-1.5 transition"
            title="快捷键：空格键 Space"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>快速预览</span>
            <span className="text-[10px] text-white/40 font-mono">Space</span>
          </button>

          <button
            onClick={handleExportVault}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition"
            title="打包导出当前知识库 (.vault.json)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowNewFileModal(true)}
            className="px-3 py-1 rounded-lg bg-[#0a84ff] hover:bg-blue-600 text-white text-xs font-medium flex items-center space-x-1 shadow-md shadow-blue-500/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>导入/新建</span>
          </button>

          <button
            onClick={() => setInspectorOpen(prev => !prev)}
            className={`p-1.5 rounded-lg border transition ${
              inspectorOpen ? 'bg-blue-500/20 text-cyan-300 border-blue-500/40' : 'text-white/50 border-white/10 hover:bg-white/10'
            }`}
            title="折叠/显示检查器"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. FOUR-COLUMN WORKSPACE: VAULTS | FINDER TREE / COLUMNS | PREVIEW */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ========================================================== */}
        {/* COLUMN 1: LEVEL 0 知识库沙箱侧边栏 (VAULT SIDEBAR) */}
        {/* ========================================================== */}
        <aside 
          onDragOver={handleCrossVaultDragOver}
          className={`w-56 bg-[#12141a]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between shrink-0 select-none z-20 transition-all ${
            shakeSidebar ? 'animate-bounce border-rose-500/60 bg-rose-950/20' : ''
          }`}
        >
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <div>
              <div className="flex items-center justify-between px-2 mb-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                <span>独立知识库沙箱 ({vaults.length})</span>
                <Lock className="w-3 h-3 text-emerald-400" />
              </div>

              <div className="space-y-1.5">
                {vaults.map(v => {
                  const isActive = v.id === activeVaultId;
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleSwitchVault(v.id)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer space-y-1 group ${
                        isActive
                          ? 'bg-white/10 border-white/20 shadow-xs'
                          : 'bg-white/5 border-transparent hover:bg-white/8 text-white/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: v.color }} />
                          <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-white/80'}`}>
                            {v.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pl-4.5">
                        <span>{v.fileCount} 个文档</span>
                        <span>{v.storageUsed}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 space-y-1 leading-relaxed">
              <div className="flex items-center space-x-1 font-bold">
                <Shield className="w-3 h-3 text-blue-400 shrink-0" />
                <span>向量空间硬隔离已启用</span>
              </div>
              <p className="text-white/60">跨知识库禁止软引用，切换库自动重置 AI 记忆。</p>
            </div>
          </div>

          <div className="p-3 border-t border-white/10 bg-black/30">
            <button
              onClick={() => setShowNewVaultModal(true)}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 transition-all flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>新建独立知识库</span>
            </button>
          </div>
        </aside>

        {/* ========================================================== */}
        {/* ⭐ FINDER COLUMN VIEW (分栏视图模式) OR TRADITIONAL TREE */}
        {/* ========================================================== */}
        {activeView === 'columns' ? (
          /* ======================================================== */
          /* 🏛️ macOS FINDER COLUMN VIEW (MILLER COLUMNS) */
          /* ======================================================== */
          <div 
            ref={columnsContainerRef}
            className="flex-1 flex overflow-x-auto overflow-y-hidden bg-[#0c0e14] divide-x divide-white/10 relative"
          >
            {/* Dynamic Iteration of Miller Columns */}
            {millerColumns.map((col, cIdx) => (
              <div 
                key={cIdx} 
                className="w-64 min-w-[250px] max-w-[320px] h-full bg-[#151821]/80 backdrop-blur-xl flex flex-col shrink-0 overflow-hidden select-none animate-in fade-in slide-in-from-left-2 duration-150"
              >
                {/* Column Sub-Header */}
                <div className="h-9 px-3 border-b border-white/10 flex items-center justify-between bg-black/20 text-[10px] font-mono text-white/40">
                  <span className="truncate">
                    {cIdx === 0 ? '根目录 / Top Level' : `层级 ${cIdx} / ${folders.find(f => f.id === col.folderId)?.name}`}
                  </span>
                  <span>{col.folders.length + col.files.length} 项</span>
                </div>

                {/* Column Items Scroll List */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 text-xs">
                  {/* Folders in this Column */}
                  {col.folders.map(folder => {
                    const isSelected = col.activeSelectedFolderId === folder.id;
                    const childCount = activeFiles.filter(f => f.folderId === folder.id).length;
                    return (
                      <div
                        key={folder.id}
                        onClick={() => handleColumnFolderClick(folder.id, cIdx)}
                        className={`px-2.5 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white fill-white' : 'text-amber-400 fill-amber-400/30'}`} />
                          <span className="truncate">{folder.name}</span>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-white/40'}`}>
                            {childCount}
                          </span>
                          <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-white/40'}`} />
                        </div>
                      </div>
                    );
                  })}

                  {/* Files in this Column */}
                  {col.files.map(file => {
                    const isSelected = selectedFileId === file.id;
                    return (
                      <div
                        key={file.id}
                        onClick={() => handleColumnFileClick(file.id, cIdx)}
                        onDoubleClick={() => setQuickLookOpen(true)}
                        className={`px-2.5 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="shrink-0">
                            {getBadgeIcon(file.badge)}
                          </div>
                          <span className="truncate">{file.title}</span>
                        </div>

                        <span className={`text-[10px] font-mono shrink-0 ml-1 ${isSelected ? 'text-white/80' : 'text-white/40'}`}>
                          {file.size}
                        </span>
                      </div>
                    );
                  })}

                  {col.folders.length === 0 && col.files.length === 0 && (
                    <div className="py-12 text-center text-[11px] text-white/30">
                      空文件夹
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* ====================================================== */}
            {/* ⭐ RIGHTMOST CONTEXT INSPECTOR SIDEBAR (上下文检查器侧边栏) */}
            {/* ====================================================== */}
            {selectedFile && (
              <aside className="w-96 min-w-[360px] max-w-[420px] h-full bg-[#151821]/85 backdrop-blur-3xl border-l border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col shrink-0 select-none z-20 overflow-y-auto animate-in fade-in slide-in-from-right-3 duration-200">
                {/* 1. Inspector Header Bar */}
                <div className="h-11 px-4 border-b border-white/10 flex items-center justify-between bg-black/20 shrink-0">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white tracking-wide">上下文检查器 (Context Inspector)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/30 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>已向量化</span>
                    </span>
                    <button
                      onClick={() => handleToggleStar(selectedFile.id)}
                      className={`p-1 rounded-md transition ${selectedFile.starred ? 'text-amber-400' : 'text-white/40 hover:text-white'}`}
                      title="星标收藏"
                    >
                      <Star className={`w-3.5 h-3.5 ${selectedFile.starred ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* 2. Inspector Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  {/* Hero Thumbnail Preview Card */}
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col items-center justify-center text-center space-y-2 shadow-inner">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                      {getBadgeIcon(selectedFile.badge)}
                    </div>
                    <div className="text-xs font-bold text-white px-2 break-all">{selectedFile.title}</div>
                    <div className="text-[10px] text-white/40 font-mono">{selectedFile.formatLabel} • {selectedFile.size}</div>

                    <button
                      onClick={() => setQuickLookOpen(true)}
                      className="mt-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs"
                    >
                      <Expand className="w-3.5 h-3.5 text-blue-400" />
                      <span>全屏 Quick Look (Space)</span>
                    </button>
                  </div>

                  {/* Live Content Thumbnail Preview (内容缩略预览) */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-white/80">
                      <span className="flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>内容缩略预览 (Live Snippet)</span>
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedFile.content);
                          showToast('已复制该素材正文到剪贴板');
                        }}
                        className="text-[10px] text-cyan-400 hover:underline flex items-center space-x-0.5"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制</span>
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-black/50 border border-white/5 max-h-36 overflow-y-auto font-mono text-[11px] text-white/80 leading-relaxed whitespace-pre-wrap select-text">
                      {selectedFile.content.slice(0, 320)}...
                    </div>
                  </div>

                  {/* Metadata Properties Grid (格式、大小、创建时间、向量化状态) */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                    <span className="font-bold text-white/90">元数据与向量化拓扑</span>
                    <div className="space-y-2 text-[11px] font-mono">
                      <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                        <span className="text-white/40">文件格式</span>
                        <span className="text-white font-bold uppercase">{selectedFile.badge} ({selectedFile.formatLabel})</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                        <span className="text-white/40">文件大小</span>
                        <span className="text-white font-bold">{selectedFile.size}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                        <span className="text-white/40">创建 / 修改时间</span>
                        <span className="text-white/80">{selectedFile.date}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                        <span className="text-white/40">向量化状态</span>
                        <span className="text-emerald-400 font-bold">已建立 {selectedFile.chunkCount} 块索引 ({selectedFile.tokenCount.toLocaleString()} Tokens)</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                        <span className="text-white/40">嵌入模型</span>
                        <span className="text-cyan-300 text-[10px] truncate max-w-[170px]">{activeVault.embeddingModel.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-white/40">所在知识库</span>
                        <span className="text-blue-400 font-bold truncate max-w-[150px]">{activeVault.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Apple Intelligence Summary Card */}
                  <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 font-bold flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>✦ Apple Intelligence 深度提炼</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 font-mono">核准摘要</span>
                    </div>
                    <p className="text-[11px] text-white/70 leading-relaxed">{selectedFile.summary}</p>

                    <div className="pt-1.5 border-t border-white/5">
                      <div className="text-[10px] text-white/40 mb-1">关键实体概念：</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedFile.entities.map(e => (
                          <span key={e} className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-200 border border-purple-500/20">
                            ✦ {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Reindex & Trash */}
                  <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                    <button
                      onClick={() => showToast('已触发后台重新分块与嵌入向量化')}
                      className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-white/80 transition flex items-center justify-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3 text-cyan-400" />
                      <span>重新向量化</span>
                    </button>
                    <button
                      onClick={() => {
                        setFiles(prev => prev.filter(f => f.id !== selectedFile.id));
                        showToast(`已将《${selectedFile.title}》移至废纸篓`);
                      }}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400"
                      title="移至废纸篓"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </aside>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* TRADITIONAL TREE & ASSETS VIEW (卡片 / 列表 / 星图模式) */
          /* ======================================================== */
          <>
            {/* COLUMN 2: TREE NAVIGATION */}
            <nav className="w-64 bg-[#151821]/90 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between shrink-0 select-none z-20">
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <FolderTree className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white truncate max-w-[140px]">层级目录树</span>
                </div>
                <button onClick={() => setShowNewFolderModal(true)} className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10">
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
                <div
                  onClick={() => setSelectedFolderId(null)}
                  className={`px-2.5 py-1.5 rounded-xl flex items-center justify-between cursor-pointer transition ${
                    selectedFolderId === null
                      ? 'bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                    <span>根目录 (全部文档)</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">{activeFiles.length}</span>
                </div>

                {activeFolders.map(folder => {
                  const isSelected = selectedFolderId === folder.id;
                  const isScoped = scopedFolderId === folder.id;
                  const childFiles = activeFiles.filter(f => f.folderId === folder.id);
                  const indent = folder.parentId ? 'pl-6' : 'pl-2';

                  return (
                    <div key={folder.id} className="space-y-0.5">
                      <div
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={`px-2 py-1.5 rounded-xl flex items-center justify-between cursor-pointer transition ${indent} ${
                          isSelected
                            ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <button onClick={(e) => { e.stopPropagation(); handleToggleFolder(folder.id); }} className="p-0.5 text-white/40 hover:text-white">
                            <ChevronRight className={`w-3 h-3 transition-transform ${folder.isOpen ? 'rotate-90' : ''}`} />
                          </button>
                          <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-400' : 'text-amber-400'}`} />
                          <span className="truncate text-xs">{folder.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-white/40">{childFiles.length}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* COLUMN 3: ASSET CANVAS */}
            <main className="flex-1 flex flex-col bg-black/40 overflow-hidden relative">
              <div className="h-10 px-4 bg-[#151821]/60 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shrink-0 z-10 select-none text-xs">
                <div className="flex items-center space-x-1.5 text-white/60 overflow-hidden max-w-xl">
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-white/20">/</span>}
                      <span className={`truncate ${idx === breadcrumbs.length - 1 ? 'text-white font-bold' : 'hover:text-white cursor-pointer'}`}>
                        {crumb}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
                <span className="text-[10px] text-white/40 font-mono">已检索 {displayFiles.length} 个文档</span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 relative">
                {activeView === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayFiles.map(file => {
                      const isSelected = file.id === selectedFileId;
                      return (
                        <div
                          key={file.id}
                          onClick={() => setSelectedFileId(file.id)}
                          onDoubleClick={() => setQuickLookOpen(true)}
                          className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between group relative ${
                            isSelected
                              ? 'ring-2 ring-blue-500 bg-[#1c202b] shadow-2xl'
                              : 'bg-[#151821]/60 hover:bg-[#232836] border border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                  {getBadgeIcon(file.badge)}
                                </div>
                                <div>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/70 font-mono font-bold">{file.badge}</span>
                                  <span className="text-[10px] text-white/40 ml-1 font-mono">{file.size}</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-purple-400">{file.relevance}%</span>
                            </div>
                            <h3 className="text-xs font-semibold text-white/95 line-clamp-1 mb-1.5">{file.title}</h3>
                            <p className="text-[11px] text-white/50 line-clamp-2 mb-3">{file.previewText}</p>
                          </div>
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
                            <span>Tokens: {file.tokenCount}</span>
                            <span>{file.chunkCount} 分块</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeView === 'list' && (
                  <div className="rounded-xl border border-white/10 overflow-hidden bg-[#151821]/40">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 border-b border-white/10 text-white/50 text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3 font-medium">名称</th>
                          <th className="py-2.5 px-3 font-medium">分类</th>
                          <th className="py-2.5 px-3 font-medium">Token 规模</th>
                          <th className="py-2.5 px-3 font-medium">大小</th>
                          <th className="py-2.5 px-3 font-medium">修改日期</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/80">
                        {displayFiles.map(file => (
                          <tr
                            key={file.id}
                            onClick={() => setSelectedFileId(file.id)}
                            onDoubleClick={() => setQuickLookOpen(true)}
                            className={`cursor-pointer transition ${file.id === selectedFileId ? 'bg-blue-500/20 text-white' : 'hover:bg-white/5'}`}
                          >
                            <td className="py-2.5 px-3 flex items-center space-x-2">
                              {getBadgeIcon(file.badge)}
                              <span className="font-medium truncate max-w-xs">{file.title}</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-white/60">{file.badge}</td>
                            <td className="py-2.5 px-3 font-mono text-purple-400 text-[11px]">{file.tokenCount} Tokens</td>
                            <td className="py-2.5 px-3 font-mono text-white/50 text-[11px]">{file.size}</td>
                            <td className="py-2.5 px-3 font-mono text-white/40 text-[11px]">{file.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Scoped Copilot Floating Capsule */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 w-11/12 max-w-2xl select-none">
                <div className="p-[1.5px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-2xl">
                  <div className="bg-[#151821]/95 backdrop-blur-2xl rounded-full px-4 py-2 flex items-center justify-between space-x-2 shadow-2xl">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-mono text-[9px] font-bold border border-blue-500/30 shrink-0">
                      全域隔离: {activeVault.name}
                    </span>
                    <input
                      type="text"
                      value={copilotInput}
                      onChange={e => setCopilotInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCopilotSubmit()}
                      placeholder="向当前隔离知识库提问..."
                      className="bg-transparent text-xs text-white placeholder-white/40 flex-1 focus:outline-none"
                    />
                    <button onClick={handleCopilotSubmit} className="px-3.5 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
                      提问
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. macOS QUICK LOOK MODAL */}
      {/* ============================================================ */}
      {quickLookOpen && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in" onClick={() => setQuickLookOpen(false)}>
          <div className="w-full max-w-4xl h-[78vh] rounded-2xl bg-[#151821]/95 backdrop-blur-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="h-11 px-4 bg-white/5 border-b border-white/10 flex items-center justify-between select-none">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57] cursor-pointer hover:brightness-110" onClick={() => setQuickLookOpen(false)} />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="text-white/20 mx-1">|</span>
                <span className="text-xs font-semibold text-white truncate max-w-md">{selectedFile.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60 font-mono uppercase">{selectedFile.badge}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedFile.content);
                    showToast('已复制该素材文本到系统剪贴板');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制内容</span>
                </button>
                <button onClick={() => setQuickLookOpen(false)} className="p-1 rounded-md text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 text-slate-200 select-text">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>【{activeVault.name}】沙箱隔离索引数据 · 文本契合度 {selectedFile.relevance}%</span>
                </div>
                <pre className="bg-black/50 p-4 rounded-xl border border-white/10 font-mono text-[11px] text-white/90 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {selectedFile.content}
                </pre>
              </div>
            </div>

            <div className="h-9 px-4 bg-white/5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 font-mono">
              <div>{selectedFile.size} • {selectedFile.tokenCount} Tokens • {selectedFile.date}</div>
              <span>按 <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">Space</kbd> 或 <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">ESC</kbd> 关闭</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MODALS (NEW VAULT, NEW FOLDER, NEW FILE) */}
      {/* ============================================================ */}
      {showNewVaultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in" onClick={() => setShowNewVaultModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-[#151821]/98 backdrop-blur-3xl border border-white/10 shadow-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm font-bold text-white">创建独立多知识库沙箱 (New Vault)</span>
              <button onClick={() => setShowNewVaultModal(false)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <input type="text" value={newVaultName} onChange={e => setNewVaultName(e.target.value)} placeholder="知识库名称 (如：医疗健康与基因档案库)" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              <input type="text" value={newVaultDesc} onChange={e => setNewVaultDesc(e.target.value)} placeholder="描述与命名空间说明..." className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
              <div className="flex space-x-2 pt-1">
                {(['#0a84ff', '#bf5af2', '#30d158', '#ff9f0a', '#64d2ff', '#ff453a'] as VaultColor[]).map(c => (
                  <button key={c} type="button" onClick={() => setNewVaultColor(c)} className={`w-6 h-6 rounded-full border-2 transition ${newVaultColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
              <button onClick={() => setShowNewVaultModal(false)} className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs">取消</button>
              <button onClick={handleCreateVault} className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold">创建沙箱</button>
            </div>
          </div>
        </div>
      )}

      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in" onClick={() => setShowNewFolderModal(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-[#151821]/98 backdrop-blur-3xl border border-white/10 shadow-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-white">新建文件夹</span>
              <button onClick={() => setShowNewFolderModal(false)} className="text-white/40 hover:text-white"><X className="w-3.5 h-3.5" /></button>
            </div>
            <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="文件夹名称 (如：03_财务模型)" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowNewFolderModal(false)} className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs">取消</button>
              <button onClick={handleCreateFolder} className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold">确认新建</button>
            </div>
          </div>
        </div>
      )}

      {showNewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in" onClick={() => setShowNewFileModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-[#151821]/98 backdrop-blur-3xl border border-white/10 shadow-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white">导入/新建文件至【{activeVault.name}】</span>
              <button onClick={() => setShowNewFileModal(false)} className="text-white/40 hover:text-white"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <input type="text" value={newFileTitle} onChange={e => setNewFileTitle(e.target.value)} placeholder="文件标题 (如：2026Q1_财务测算.md)" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
              <select value={newFileType} onChange={e => setNewFileType(e.target.value as any)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none">
                <option value="md">Markdown 文档 (.md)</option>
                <option value="pdf">研报文献 (.pdf)</option>
                <option value="xlsx">数据表格 (.xlsx)</option>
                <option value="code">工程代码 (.metal / .swift)</option>
                <option value="audio">访谈录音 (.m4a)</option>
              </select>
              <textarea value={newFileContent} onChange={e => setNewFileContent(e.target.value)} rows={4} placeholder="录入正文内容，系统将自动切片并生成向量索引..." className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none" />
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
              <button onClick={() => setShowNewFileModal(false)} className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs">取消</button>
              <button onClick={handleCreateFile} className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold">入库向量化</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
