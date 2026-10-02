import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Wrench, 
  Settings, 
  ShieldCheck, 
  FileCode, 
  Database, 
  Terminal, 
  Globe, 
  BarChart3, 
  Cpu, 
  Layers, 
  Search, 
  Check, 
  X, 
  Copy, 
  Play, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  ArrowRight, 
  Code2, 
  Lock, 
  HelpCircle,
  FolderPlus
} from 'lucide-react';

export type PluginCategory = 'document' | 'runtime' | 'database' | 'network' | 'visualization' | 'custom';

export interface PluginParameter {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'password' | 'textarea';
  value: any;
  options?: string[];
  placeholder?: string;
  description?: string;
  required?: boolean;
}

export interface PluginFunction {
  name: string;
  description: string;
  params: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  sampleReturn: string;
}

export interface AgentPlugin {
  id: string;
  name: string;
  slug: string;
  category: PluginCategory;
  version: string;
  author: string;
  description: string;
  icon: string;
  iconColor: string;
  authType: 'none' | 'bearer' | 'apiKey' | 'oauth2';
  endpoint?: string;
  parameters: PluginParameter[];
  functions: PluginFunction[];
  enabled: boolean;
  isCustom?: boolean;
  installedAt?: string;
  docsUrl?: string;
}

export const DEFAULT_PLUGINS: AgentPlugin[] = [
  {
    id: 'plugin-pdf-parser',
    name: '智能 PDF 文档解析与多模态 OCR 提取器',
    slug: 'tools.document.pdf_parser',
    category: 'document',
    version: 'v2.4.0',
    author: 'Apple Intelligence Labs',
    description: '自动解析本地 PDF、扫描件与学术论文，提取多栏排版文本、结构化 Markdown 表格与嵌入公式图表。',
    icon: '📄',
    iconColor: 'from-red-500 to-rose-600',
    authType: 'none',
    enabled: true,
    installedAt: '2026-10-01',
    parameters: [
      {
        key: 'ocrEngine',
        label: 'OCR 识别引擎',
        type: 'select',
        value: 'apple_vision',
        options: ['apple_vision', 'tesseract_pro', 'cloud_multimodal'],
        description: '优先使用 Apple Vision Kit 端侧硬件加速 OCR'
      },
      {
        key: 'tableExtractionMode',
        label: '表格提取模式',
        type: 'select',
        value: 'markdown_grid',
        options: ['markdown_grid', 'json_schema', 'csv_raw'],
        description: '将文档内的表格自动转为清洗后的 Markdown 格式'
      },
      {
        key: 'maxPageLimit',
        label: '单次最大解析页数',
        type: 'number',
        value: 300,
        description: '防止过长超限文档阻塞计算内存'
      },
      {
        key: 'enableOcr',
        label: '启用扫描件深度图文 OCR',
        type: 'boolean',
        value: true,
        description: '对纯图片扫描页自动触发本地 Neural Engine OCR'
      }
    ],
    functions: [
      {
        name: 'pdf_parse_document',
        description: '完整解析指定路径的 PDF 文件，输出清洗后的 Markdown 与目录树',
        params: [
          { name: 'file_path', type: 'string', description: '本地或沙盒中的 PDF 文件绝对路径', required: true },
          { name: 'extract_images', type: 'boolean', description: '是否同时抽取嵌入插图与图表', required: false }
        ],
        sampleReturn: '{\n  "status": "success",\n  "pages": 48,\n  "text_content": "# 第一章 架构设计与理论证明...",\n  "tables_extracted": 6\n}'
      },
      {
        name: 'pdf_extract_tables',
        description: '定向扫描并提取文档中的财务报表、实验数据对照表',
        params: [
          { name: 'file_path', type: 'string', description: 'PDF 文件路径', required: true },
          { name: 'page_numbers', type: 'string', description: '指定页码范围如 "1-5, 12"', required: false }
        ],
        sampleReturn: '{\n  "tables": [\n    {"title": "基准评测对照", "headers": ["Model", "Throughput", "Latency"], "rows": [["Qwen 2.5", "142 t/s", "12ms"]]}\n  ]\n}'
      }
    ]
  },
  {
    id: 'plugin-sandbox-runner',
    name: '安全多语言代码隔离执行沙盒',
    slug: 'tools.runtime.code_sandbox',
    category: 'runtime',
    version: 'v3.1.2',
    author: 'System Architecture Team',
    description: '提供完全断网隔离的微型容器沙盒，即时执行 Python 3.12、TypeScript、Rust 与内存 SQLite 脚本并捕获标准输出与耗时。',
    icon: '⚡',
    iconColor: 'from-emerald-500 to-teal-600',
    authType: 'none',
    enabled: true,
    installedAt: '2026-10-01',
    parameters: [
      {
        key: 'defaultRuntime',
        label: '默认代码运行环境',
        type: 'select',
        value: 'python3.12',
        options: ['python3.12', 'nodejs20', 'rust1.75', 'wasm_sandbox'],
        description: '智能体执行数学建模、数据处理与算法验证时的默认环境'
      },
      {
        key: 'maxMemoryMb',
        label: '最大内存上限 (MB)',
        type: 'number',
        value: 512,
        description: '单次代码进程内存超限时自动熔断，防止 OOM'
      },
      {
        key: 'timeoutSec',
        label: '超时熔断时间 (秒)',
        type: 'number',
        value: 12,
        description: '防止代码进入死循环'
      },
      {
        key: 'networkAccess',
        label: '沙盒外部网络访问权限',
        type: 'boolean',
        value: false,
        description: '关闭外部网络以保障最高数据安全等级'
      },
      {
        key: 'preloadPackages',
        label: '预加载科学计算包 (用逗号分隔)',
        type: 'string',
        value: 'numpy, pandas, matplotlib, sympy, scipy, lodash',
        description: '沙盒环境预先注入的常用三方依赖'
      }
    ],
    functions: [
      {
        name: 'sandbox_exec_python',
        description: '在安全隔离沙盒中执行 Python 脚本并捕获输出与返回值',
        params: [
          { name: 'code', type: 'string', description: '待执行的完整 Python 代码', required: true },
          { name: 'timeout', type: 'number', description: '自定义超时时间（默认 10s）', required: false }
        ],
        sampleReturn: '{\n  "status": "success",\n  "stdout": "Optimal Hyperparameters: lr=0.001, batch_size=64\\nPareto Frontier Score: 98.4%",\n  "execution_time_ms": 18.4,\n  "memory_rss_mb": 14.2\n}'
      },
      {
        name: 'sandbox_exec_javascript',
        description: '执行 TypeScript / Node.js 脚本',
        params: [
          { name: 'code', type: 'string', description: 'TS / JS 代码', required: true }
        ],
        sampleReturn: '{\n  "status": "success",\n  "stdout": "[Done] AST Parsed 248 nodes without syntax error",\n  "execution_time_ms": 8.2\n}'
      }
    ]
  },
  {
    id: 'plugin-sqlite-api',
    name: '端侧 SQLite / Postgres 数据库安全网关',
    slug: 'tools.database.sqlite_gateway',
    category: 'database',
    version: 'v1.8.0',
    author: 'Data Vault Core',
    description: '安全参数化 SQL 检索接口，内置防注入机制、只读模式守卫及表元数据自动映射，支持百万级事实事实提取。',
    icon: '🗄️',
    iconColor: 'from-amber-500 to-orange-600',
    authType: 'none',
    enabled: true,
    installedAt: '2026-10-01',
    parameters: [
      {
        key: 'connectionUri',
        label: '数据库连接字符串',
        type: 'string',
        value: 'sqlite://./data/agent_studio_vault.db',
        description: '本地 SQLite 数据库或远程 PostgreSQL 连接串'
      },
      {
        key: 'readOnlyMode',
        label: '严格只读防护模式 (Read-Only Guard)',
        type: 'boolean',
        value: true,
        description: '拦截一切 DROP、DELETE、UPDATE 等破坏性写入操作'
      },
      {
        key: 'maxQueryLimit',
        label: '单次查询返回最大行数 (Limit)',
        type: 'number',
        value: 100,
        description: '保护上下文窗口不受巨量脏数据冲击'
      },
      {
        key: 'allowedTables',
        label: '允许访问的数据表白名单',
        type: 'string',
        value: 'topics, messages, materials, novel_chapters, character_dossiers, plot_hooks',
        description: '隔离系统敏感元数据表'
      }
    ],
    functions: [
      {
        name: 'db_execute_query',
        description: '执行参数化只读 SQL 查询，获取数据库记录',
        params: [
          { name: 'sql_query', type: 'string', description: '标准的 SELECT SQL 查询语句', required: true },
          { name: 'limit', type: 'number', description: '限制结果条数', required: false }
        ],
        sampleReturn: '{\n  "rows_count": 3,\n  "columns": ["id", "name", "realm", "affinity"],\n  "records": [\n    {"id": 1, "name": "林玄", "realm": "元婴后期", "affinity": "雷灵根"},\n    {"id": 2, "name": "苏青雪", "realm": "化神初期", "affinity": "太阴之体"}\n  ]\n}'
      },
      {
        name: 'db_describe_schema',
        description: '获取指定数据表或全库的字段定义、类型与外键关联',
        params: [
          { name: 'table_name', type: 'string', description: '表名（留空则返回所有表名）', required: false }
        ],
        sampleReturn: '{\n  "table": "character_dossiers",\n  "columns": [\n    {"name": "id", "type": "INTEGER", "primary_key": true},\n    {"name": "name", "type": "TEXT"},\n    {"name": "status", "type": "TEXT"}\n  ]\n}'
      }
    ]
  },
  {
    id: 'plugin-web-crawler',
    name: '实时网页正文智能清洗与 DOM 抽取器',
    slug: 'tools.network.smart_crawler',
    category: 'network',
    version: 'v2.1.0',
    author: 'Network Intelligence',
    description: '抓取权威网站或技术博客，自动剥离广告、导航栏与干扰脚本，输出高度精炼的 Markdown 正文。',
    icon: '🌐',
    iconColor: 'from-blue-500 to-cyan-600',
    authType: 'none',
    enabled: true,
    installedAt: '2026-10-01',
    parameters: [
      {
        key: 'extractMode',
        label: '正文抽取算法',
        type: 'select',
        value: 'readability_pro',
        options: ['readability_pro', 'raw_dom_clean', 'strict_markdown'],
        description: '基于 Mozilla Readability 算法的高纯度文本抽取'
      },
      {
        key: 'timeoutMs',
        label: '网络请求超时 (毫秒)',
        type: 'number',
        value: 8000,
        description: '超时未响应时自动退出'
      },
      {
        key: 'stripImages',
        label: '自动过滤冗余配图以节省上下文',
        type: 'boolean',
        value: true,
        description: '仅保留核心文本与代码块'
      }
    ],
    functions: [
      {
        name: 'web_fetch_clean_markdown',
        description: '抓取目标 URL 页面并转换为纯净 Markdown',
        params: [
          { name: 'url', type: 'string', description: '目标网页 URL', required: true }
        ],
        sampleReturn: '{\n  "title": "Apple M4 芯片架构深度剖析",\n  "author": "AnandTech",\n  "word_count": 3420,\n  "markdown": "## 统一内存与 NPU 矩阵计算单元...\\n..."\n}'
      }
    ]
  },
  {
    id: 'plugin-chart-generator',
    name: 'ECharts / D3 交互式可视化图表生成器',
    slug: 'tools.visualization.echarts_engine',
    category: 'visualization',
    version: 'v1.5.0',
    author: 'Data Visualization Team',
    description: '自动将智能体分析出的数据矩阵转化为美观的雷达图、因果网络拓扑图、折线图或桑基图。',
    icon: '📊',
    iconColor: 'from-purple-500 to-indigo-600',
    authType: 'none',
    enabled: true,
    installedAt: '2026-10-01',
    parameters: [
      {
        key: 'theme',
        label: '图表视觉主题',
        type: 'select',
        value: 'apple_dark',
        options: ['apple_dark', 'apple_light', 'macos_vibrant'],
        description: '匹配 Apple 工业设计深色/浅色配色规范'
      },
      {
        key: 'renderer',
        label: '渲染引擎',
        type: 'select',
        value: 'svg',
        options: ['svg', 'canvas'],
        description: 'SVG 矢量渲染保证无损清晰度'
      }
    ],
    functions: [
      {
        name: 'chart_render_echarts',
        description: '根据传入的 ECharts Option JSON 渲染交互式图表',
        params: [
          { name: 'option_json', type: 'string', description: 'ECharts 规范的配置 JSON 字符串', required: true },
          { name: 'chart_type', type: 'string', description: '图表类型如 "radar", "line", "graph"', required: true }
        ],
        sampleReturn: '{\n  "status": "success",\n  "chart_id": "chart_784920",\n  "svg_rendered": true\n}'
      }
    ]
  }
];

// =========================================================================
// MODAL 1: PLUGIN CONFIGURATION & LIVE TEST SHEET
// =========================================================================
export const PluginConfigModal: React.FC<{
  plugin: AgentPlugin;
  onSave: (updatedPlugin: AgentPlugin) => void;
  onClose: () => void;
}> = ({ plugin, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'params' | 'functions' | 'test'>('params');
  const [formData, setFormData] = useState<AgentPlugin>({ ...plugin });
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [testFuncIndex, setTestFuncIndex] = useState(0);
  const [testInputArgs, setTestInputArgs] = useState('{\n  "file_path": "/workspace/data/system_architecture.pdf",\n  "extract_images": false\n}');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const handleParamChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.map(p => p.key === key ? { ...p, value } : p)
    }));
  };

  const handleRunLiveTest = () => {
    setIsTestRunning(true);
    setTestOutput(null);
    const selectedFunc = formData.functions[testFuncIndex] || formData.functions[0];
    setTimeout(() => {
      setIsTestRunning(false);
      setTestOutput(
        `>> [Plugin Gateway: ${formData.name}] Function Invocation Success\n` +
        `>> Call: ${selectedFunc?.name || 'execute'}()\n` +
        `>> Latency: 24.8ms · Security Audit: Passed (Zero Data Leak)\n` +
        `>> Response Payload:\n${selectedFunc?.sampleReturn || '{"status": "ok"}'}`
      );
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-macos-fade select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-3xl h-[84vh] max-h-[720px] bg-[#16161B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 flex flex-col overflow-hidden text-white ring-1 ring-white/10">
        
        {/* Modal Header */}
        <header className="h-14 px-5 border-b border-white/10 bg-white/[0.04] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span onClick={onClose} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] cursor-pointer hover:opacity-80 transition" title="关闭" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            </div>

            <div className="flex items-center space-x-2.5 ml-2">
              <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${formData.iconColor} flex items-center justify-center text-sm shadow-sm`}>
                {formData.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white">{formData.name}</h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                    {formData.version}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono">{formData.slug}</p>
              </div>
            </div>
          </div>

          {/* Sub-Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-medium">
            <button
              onClick={() => setActiveTab('params')}
              className={`px-3 py-1 rounded-lg transition ${activeTab === 'params' ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-zinc-400 hover:text-white'}`}
            >
              参数配置 ({formData.parameters.length})
            </button>
            <button
              onClick={() => setActiveTab('functions')}
              className={`px-3 py-1 rounded-lg transition ${activeTab === 'functions' ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-zinc-400 hover:text-white'}`}
            >
              暴露函数 ({formData.functions.length})
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${activeTab === 'test' ? 'bg-white/20 text-white font-bold shadow-xs' : 'text-zinc-400 hover:text-white'}`}
            >
              <Play className="w-2.5 h-2.5 fill-current text-emerald-400" />
              <span>联调测试</span>
            </button>
          </div>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TAB 1: PARAMETERS */}
          {activeTab === 'params' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold text-white">端侧私密配置保护</p>
                  <p className="text-[11px] text-blue-200/80 mt-0.5">
                    插件的所有配置参数（如数据库连接串、OCR 阈值、沙盒资源）均加密保存在本地端侧配置库中，不会向云端泄露任何本地路径。
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {formData.parameters.map((param) => (
                  <div key={param.key} className="p-3.5 rounded-2xl bg-[#0F0F13]/80 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{param.label}</span>
                        {param.required && <span className="text-red-400 text-xs">*</span>}
                      </label>
                      <span className="text-[10px] font-mono text-zinc-500">{param.key}</span>
                    </div>

                    {param.description && (
                      <p className="text-[11px] text-zinc-400 leading-normal">{param.description}</p>
                    )}

                    {/* Controls based on type */}
                    {param.type === 'select' && (
                      <select
                        value={param.value}
                        onChange={e => handleParamChange(param.key, e.target.value)}
                        className="w-full h-8 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white outline-none focus:border-blue-500 transition font-sans cursor-pointer"
                      >
                        {param.options?.map(opt => (
                          <option key={opt} value={opt} className="bg-zinc-900 text-white">{opt}</option>
                        ))}
                      </select>
                    )}

                    {param.type === 'string' && (
                      <input
                        type="text"
                        value={param.value}
                        placeholder={param.placeholder}
                        onChange={e => handleParamChange(param.key, e.target.value)}
                        className="w-full h-8 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition font-mono"
                      />
                    )}

                    {param.type === 'password' && (
                      <div className="relative">
                        <input
                          type={showPassword[param.key] ? 'text' : 'password'}
                          value={param.value}
                          placeholder={param.placeholder || '••••••••••••••••'}
                          onChange={e => handleParamChange(param.key, e.target.value)}
                          className="w-full h-8 bg-white/5 border border-white/10 rounded-xl pl-3 pr-9 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 transition font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => ({ ...p, [param.key]: !p[param.key] }))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                        >
                          {showPassword[param.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    {param.type === 'number' && (
                      <input
                        type="number"
                        value={param.value}
                        onChange={e => handleParamChange(param.key, parseFloat(e.target.value) || 0)}
                        className="w-full h-8 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white outline-none focus:border-blue-500 transition font-mono"
                      />
                    )}

                    {param.type === 'boolean' && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-zinc-300 font-medium">当前状态: {param.value ? '已启用 (True)' : '已禁用 (False)'}</span>
                        <button
                          role="switch"
                          aria-checked={param.value}
                          onClick={() => handleParamChange(param.key, !param.value)}
                          className={`w-11 h-6 rounded-full transition-colors p-0.5 relative inline-flex items-center cursor-pointer ${
                            param.value ? 'bg-blue-600' : 'bg-zinc-700 border border-white/10'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${param.value ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: EXPOSED FUNCTIONS */}
          {activeTab === 'functions' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400">
                以下为该插件向大语言模型 (LLM) 暴露的 JSON-Schema 函数。智能体在推理过程中可根据任务自主调用：
              </div>

              <div className="space-y-3.5">
                {formData.functions.map((fn, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#0F0F13]/80 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-white font-mono">{fn.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Function Call
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-300 leading-relaxed">{fn.description}</p>

                    {/* Parameters list */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">入参列表 (Arguments):</span>
                      <div className="space-y-1">
                        {fn.params.map((p, pIdx) => (
                          <div key={pIdx} className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono flex items-center justify-between">
                            <span className="text-emerald-300 font-bold">{p.name} {p.required && <span className="text-red-400">*</span>}</span>
                            <span className="text-zinc-500 text-[10px]">{p.type} · {p.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sample return */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">预期返回结构 (Sample Output):</span>
                      <pre className="p-2.5 rounded-xl bg-black/60 text-[10px] font-mono text-zinc-300 leading-relaxed overflow-x-auto border border-white/5">
                        <code>{fn.sampleReturn}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE TEST CONSOLE */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#0F0F13]/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">选择联调函数:</label>
                  <select
                    value={testFuncIndex}
                    onChange={e => setTestFuncIndex(parseInt(e.target.value))}
                    className="h-7 bg-white/5 border border-white/10 rounded-lg px-2 text-xs text-white outline-none font-mono cursor-pointer"
                  >
                    {formData.functions.map((fn, idx) => (
                      <option key={idx} value={idx} className="bg-zinc-900 text-white">{fn.name}()</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">测试入参 (JSON Payload):</label>
                  <textarea
                    rows={4}
                    value={testInputArgs}
                    onChange={e => setTestInputArgs(e.target.value)}
                    className="w-full p-2.5 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-emerald-300 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                  />
                </div>

                <button
                  onClick={handleRunLiveTest}
                  disabled={isTestRunning}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isTestRunning ? '正在执行沙盒测试...' : '立即模拟调用 (Live Test Call)'}</span>
                </button>
              </div>

              {testOutput && (
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-emerald-500/30 text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed animate-macos-fade shadow-xl">
                  {testOutput}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <footer className="h-14 px-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-zinc-400 font-mono">
            <span>最后更新于: {formData.installedAt || '刚刚'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-zinc-300 hover:text-white transition font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={() => {
                onSave(formData);
                onClose();
              }}
              className="px-5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>保存配置</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};

// =========================================================================
// MODAL 2: CREATE CUSTOM EXTERNAL TOOL PLUGIN SHEET
// =========================================================================
export const NewPluginModal: React.FC<{
  onAdd: (newPlugin: AgentPlugin) => void;
  onClose: () => void;
}> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<PluginCategory>('custom');
  const [description, setDescription] = useState('');
  const [endpoint, setEndpoint] = useState('https://api.local-engine.internal/v1/tools');
  const [icon, setIcon] = useState('🔌');
  const [funcName, setFuncName] = useState('custom_tool_execute');
  const [funcDesc, setFuncDesc] = useState('执行自定义外部 API 工具，获取结构化业务结果');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlugin: AgentPlugin = {
      id: `plugin-custom-${Date.now()}`,
      name: name.trim(),
      slug: slug.trim() || `custom.${name.toLowerCase().replace(/\s+/g, '_')}`,
      category,
      version: 'v1.0.0',
      author: 'Custom Developer',
      description: description.trim() || '自定义外部工具插件网关',
      icon: icon || '🔌',
      iconColor: 'from-blue-600 to-indigo-600',
      authType: 'apiKey',
      endpoint: endpoint.trim(),
      enabled: true,
      isCustom: true,
      installedAt: new Date().toLocaleDateString('zh-CN'),
      parameters: [
        {
          key: 'apiKey',
          label: 'API Key / Access Token',
          type: 'password',
          value: '',
          description: '用于访问外部工具 API 的身份凭据'
        },
        {
          key: 'timeoutMs',
          label: '请求超时时间 (毫秒)',
          type: 'number',
          value: 6000,
          description: '单次调用最长等待时间'
        },
        {
          key: 'customHeaders',
          label: '自定义请求头 JSON',
          type: 'string',
          value: '{"Content-Type": "application/json"}',
          description: '附加的 HTTP Header 配置'
        }
      ],
      functions: [
        {
          name: funcName.trim() || 'custom_tool_execute',
          description: funcDesc.trim(),
          params: [
            { name: 'query_payload', type: 'string', description: '输入参数载荷', required: true }
          ],
          sampleReturn: '{\n  "status": "success",\n  "result": "Custom tool execution verified."\n}'
        }
      ]
    };

    onAdd(newPlugin);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-macos-fade select-none"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl bg-[#16161B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/15 flex flex-col overflow-hidden text-white ring-1 ring-white/10">
        
        <header className="h-13 px-5 border-b border-white/10 bg-white/[0.04] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <span onClick={onClose} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] cursor-pointer" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            <span className="text-xs font-bold text-white ml-2">注册与挂载自定义外部插件</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-zinc-300 mb-1">图标 Emoji</label>
              <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="w-full h-8 bg-white/5 border border-white/10 rounded-xl text-center text-base text-white outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-bold text-zinc-300 mb-1">插件名称 <span className="text-red-400">*</span></label>
              <input
                type="text"
                required
                placeholder="例如：智能企业飞书/钉钉工单通知器"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-8 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">唯一标识 (Slug)</label>
              <input
                type="text"
                placeholder="tools.custom.webhook"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="w-full h-8 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">插件分类</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as PluginCategory)}
                className="w-full h-8 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="custom" className="bg-zinc-900">自定义工具 (Custom)</option>
                <option value="document" className="bg-zinc-900">文档处理 (Document)</option>
                <option value="runtime" className="bg-zinc-900">沙盒计算 (Runtime)</option>
                <option value="database" className="bg-zinc-900">数据库检索 (Database)</option>
                <option value="network" className="bg-zinc-900">网络抓取 (Network)</option>
                <option value="visualization" className="bg-zinc-900">可视化 (Visualization)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">插件说明与能力描述</label>
            <textarea
              rows={2}
              placeholder="清晰描述该插件何时应被智能体调用..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500 resize-none font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">外部 API 端点 (Endpoint URL)</label>
            <input
              type="text"
              value={endpoint}
              onChange={e => setEndpoint(e.target.value)}
              className="w-full h-8 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white font-mono placeholder-zinc-500 outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>声明主函数 (Main Function Declaration)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="函数名 (如 notify_user)"
                value={funcName}
                onChange={e => setFuncName(e.target.value)}
                className="h-8 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white font-mono outline-none focus:border-purple-500"
              />
              <input
                type="text"
                placeholder="函数功能描述"
                value={funcDesc}
                onChange={e => setFuncDesc(e.target.value)}
                className="h-8 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-zinc-300"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold shadow-md"
            >
              完成注册并挂载
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

// =========================================================================
// SECTION 3: AGENT STUDIO PLUGINS SECTION (MOUNTED TO ACTIVE AGENT)
// =========================================================================
export const AgentPluginsSection: React.FC<{
  activeAgentPluginIds: string[];
  allPlugins: AgentPlugin[];
  onTogglePlugin: (pluginId: string, mounted: boolean) => void;
  onOpenConfig: (plugin: AgentPlugin) => void;
  onOpenNewPluginModal: () => void;
  onDeleteCustomPlugin?: (pluginId: string) => void;
}> = ({
  activeAgentPluginIds = [],
  allPlugins = [],
  onTogglePlugin,
  onOpenConfig,
  onOpenNewPluginModal,
  onDeleteCustomPlugin
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | PluginCategory>('all');

  const filteredPlugins = useMemo(() => {
    return allPlugins.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchQuery = !searchQuery.trim() || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [allPlugins, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--apple-separator)] pb-3">
        <div>
          <h4 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
            <Wrench className="w-4 h-4 text-emerald-500" />
            <span>外部工具插件扩展系统 (External Plugins & Tool Gateway)</span>
          </h4>
          <p className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">
            为当前智能体挂载专业工具插件（如 PDF OCR、隔离代码沙盒、本地 SQLite 数据库网关与自定义 Webhook）。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewPluginModal}
            className="px-3 py-1.5 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建自定义插件</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: '全部插件' },
            { id: 'document', label: '📄 文档与OCR' },
            { id: 'runtime', label: '⚡ 代码沙盒' },
            { id: 'database', label: '🗄️ 数据库API' },
            { id: 'network', label: '🌐 网页抓取' },
            { id: 'visualization', label: '📊 数据可视化' },
            { id: 'custom', label: '🔌 自定义扩展' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[var(--apple-accent)] text-white font-bold shadow-xs'
                  : 'bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] hover:bg-[var(--apple-border)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-56 shrink-0">
          <Search className="w-3.5 h-3.5 text-[var(--apple-text-tertiary)] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索工具插件名或函数..."
            className="w-full h-7 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl pl-8 pr-2.5 text-xs text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)] font-sans"
          />
        </div>
      </div>

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredPlugins.map(plugin => {
          const isMounted = activeAgentPluginIds.includes(plugin.id);

          return (
            <div
              key={plugin.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isMounted
                  ? 'bg-[var(--apple-surface)] border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20'
                  : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] opacity-85 hover:opacity-100 hover:border-[var(--apple-border-strong)]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${plugin.iconColor} flex items-center justify-center text-base shadow-xs shrink-0`}>
                      {plugin.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h5 className="text-xs font-bold text-[var(--apple-text-primary)]">{plugin.name}</h5>
                        {plugin.isCustom && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-semibold">
                            自定义
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)]">{plugin.slug}</span>
                    </div>
                  </div>

                  {/* Mount Switch */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      role="switch"
                      aria-checked={isMounted}
                      onClick={() => onTogglePlugin(plugin.id, !isMounted)}
                      className={`w-10 h-5 rounded-full transition-colors p-0.5 relative inline-flex items-center cursor-pointer ${
                        isMounted ? 'bg-emerald-500' : 'bg-zinc-700/60 border border-white/10'
                      }`}
                      title={isMounted ? '已挂载至当前智能体' : '点击挂载至当前智能体'}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${isMounted ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-[var(--apple-text-secondary)] leading-relaxed mt-2.5 line-clamp-2">
                  {plugin.description}
                </p>

                {/* Function Badges */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {plugin.functions.map((fn, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] text-[10px] font-mono text-[var(--apple-text-primary)] flex items-center gap-1">
                      <Code2 className="w-2.5 h-2.5 text-blue-500" />
                      <span>{fn.name}()</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-2.5 border-t border-[var(--apple-separator)] flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)]">
                  {isMounted ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 已为该智能体挂载
                    </span>
                  ) : (
                    <span>未挂载</span>
                  )}
                </span>

                <div className="flex items-center space-x-2">
                  {plugin.isCustom && onDeleteCustomPlugin && (
                    <button
                      onClick={() => onDeleteCustomPlugin(plugin.id)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-red-400 transition"
                      title="删除自定义插件"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onOpenConfig(plugin)}
                    className="px-2.5 py-1 rounded-xl bg-[var(--apple-surface)] hover:bg-[var(--apple-border)] border border-[var(--apple-border)] text-[11px] font-semibold text-[var(--apple-text-primary)] flex items-center gap-1 transition cursor-pointer"
                  >
                    <Settings className="w-3 h-3 text-[var(--apple-accent)]" />
                    <span>配置参数</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
