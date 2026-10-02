import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Cpu, 
  ShieldCheck, 
  Download, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw, 
  Sun, 
  Moon, 
  Coffee, 
  Key, 
  Database,
  Lock,
  Palette,
  Bot,
  Route,
  HardDrive,
  Keyboard,
  Info,
  ChevronRight,
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Upload,
  Layers,
  FileText,
  Search,
  X,
  Volume2,
  VolumeX,
  Activity,
  Eye,
  EyeOff,
  Type,
  Maximize2,
  FolderArchive,
  Terminal,
  Microscope,
  Compass,
  Laptop,
  CheckCheck
} from 'lucide-react';

export type SettingsSection = 
  | 'appearance'   // 外观与显示
  | 'providers'    // 模型与网关
  | 'roles'        // 任务角色智能路由
  | 'research'     // 科研与知识引擎 (从 ResearchView 收敛)
  | 'guardrails'   // 创作风控与去AI腔 (从 Novel/Chat 收敛)
  | 'canvas'       // 交互与无限画布 (从 CanvasView 收敛)
  | 'storage'      // 数据备份与存储
  | 'shortcuts';   // 快捷键速查与关于

interface Provider {
  id: string;
  name: string;
  base_url: string;
  api_key_masked: string;
  has_key: boolean;
  kind: string;
  enabled: number;
}

interface ModelItem {
  id: string;
  provider_id: string;
  provider_name?: string;
  model_name: string;
  display_name: string;
  context_window: number;
  max_output: number;
  has_reasoning: number;
}

interface StorageStats {
  topicsCount: number;
  messagesCount: number;
  novelsCount: number;
  chaptersCount: number;
  materialsCount: number;
  researchCount: number;
  providersCount: number;
  modelsCount: number;
  dbSizeBytes: number;
  dbSizeFormatted: string;
}

const SETTINGS_SECTIONS = [
  { id: 'appearance' as SettingsSection, label: '外观与显示', icon: Palette, color: '#0a84ff', desc: '深浅模式、强调色、排版缩放与动效' },
  { id: 'providers' as SettingsSection, label: '模型与推理网关', icon: Cpu, color: '#bf5af2', desc: 'Gemini 官方直通密钥、私有网关与连通性' },
  { id: 'roles' as SettingsSection, label: '任务角色分派', icon: Route, color: '#30d158', desc: '对话、小说起草、去AI腔审查与研报模型分流' },
  { id: 'research' as SettingsSection, label: '科研与知识引擎', icon: Microscope, color: '#5e5ce6', desc: '学术探索深度、信源白名单、思维链与独立研报模板' },
  { id: 'guardrails' as SettingsSection, label: '创作风控与去AI腔', icon: ShieldCheck, color: '#ff9f0a', desc: '审查灵敏度、禁用陈腐套话词库、温度与Token预算' },
  { id: 'canvas' as SettingsSection, label: '交互与无限画布', icon: Layers, color: '#ff375f', desc: 'AI连线建议灵敏度、网格吸附、打字机流速与提示音' },
  { id: 'storage' as SettingsSection, label: '数据备份与存储', icon: HardDrive, color: '#64d2ff', desc: 'SQLite 物理维护、碎片整理、全量快照与还原' },
  { id: 'shortcuts' as SettingsSection, label: '快捷键速查与关于', icon: Keyboard, color: '#8e8e93', desc: 'macOS 键盘快捷键体系与端侧离线架构' },
];

export const SettingsView: React.FC<{
  theme: 'dark' | 'light' | 'sepia';
  setTheme: (t: 'dark' | 'light' | 'sepia') => void;
}> = ({ theme, setTheme }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Play subtle Apple macOS audio cue
  const playSound = (kind: 'click' | 'success' | 'alert' = 'click') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (kind === 'click') {
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } else if (kind === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (_) {}
  };

  const showToast = (msg: string, sound: boolean = true) => {
    setToastMessage(msg);
    if (sound && soundEffectsEnabled) playSound('success');
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // ==========================================
  // 1. Appearance & Display State
  // ==========================================
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('omni_accent_color') || '#0a84ff');
  const [fontScale, setFontScale] = useState<'compact' | 'standard' | 'comfortable'>(() => {
    return (localStorage.getItem('omni_font_scale') as any) || 'standard';
  });
  const [codeFont, setCodeFont] = useState<'sf-mono' | 'jetbrains' | 'fira'>(() => {
    return (localStorage.getItem('omni_code_font') as any) || 'sf-mono';
  });
  const [showCodeLineNumbers, setShowCodeLineNumbers] = useState(() => {
    return localStorage.getItem('omni_code_line_numbers') !== 'false';
  });
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('omni_reduced_motion') === 'true';
  });
  const [glassmorphismEnabled, setGlassmorphismEnabled] = useState(() => {
    return localStorage.getItem('omni_glassmorphism') !== 'false';
  });

  // Apply font scale & accent to document
  useEffect(() => {
    localStorage.setItem('omni_accent_color', accentColor);
    document.documentElement.style.setProperty('--apple-accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('omni_font_scale', fontScale);
    if (fontScale === 'compact') {
      document.documentElement.style.fontSize = '13px';
    } else if (fontScale === 'comfortable') {
      document.documentElement.style.fontSize = '15px';
    } else {
      document.documentElement.style.fontSize = '14px';
    }
  }, [fontScale]);

  // ==========================================
  // 2. Providers & Gemini Key State
  // ==========================================
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [modelRoles, setModelRoles] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  // Gemini Direct API Key State (Converged from ResearchView)
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('omni_gemini_api_key') || '');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiHealthStatus, setGeminiHealthStatus] = useState<'ready' | 'testing' | 'offline'>(
    geminiApiKey.trim() ? 'ready' : 'offline'
  );
  const [geminiTestLatency, setGeminiTestLatency] = useState<number | null>(null);

  // New Provider Modal
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvName, setNewProvName] = useState('');
  const [newProvUrl, setNewProvUrl] = useState('https://api.deepseek.com');
  const [newProvKey, setNewProvKey] = useState('');
  const [newProvKind, setNewProvKind] = useState('openai');

  // ==========================================
  // 3. Research Engine State (Converged from ResearchView)
  // ==========================================
  const [researchDepthLevel, setResearchDepthLevel] = useState(() => {
    return parseInt(localStorage.getItem('omni_depth_level') || '6');
  });
  const [researchDomainFilter, setResearchDomainFilter] = useState(() => {
    return localStorage.getItem('omni_domain_filter') || 'site:arxiv.org, site:neurips.cc, -site:csdn.net';
  });
  const [researchShowThinking, setResearchShowThinking] = useState(() => {
    return localStorage.getItem('omni_show_thinking') !== 'false';
  });
  const [researchHtmlTemplate, setResearchHtmlTemplate] = useState<'academic' | 'minimal' | 'dark'>(() => {
    return (localStorage.getItem('omni_html_template') as any) || 'academic';
  });
  const [researchTokenBudget, setResearchTokenBudget] = useState(() => {
    return parseInt(localStorage.getItem('omni_token_budget') || '32768');
  });

  // ==========================================
  // 4. Guardrails & Tone State (Converged from Novel/Chat)
  // ==========================================
  const [aiSensitivity, setAiSensitivity] = useState<'standard' | 'strict' | 'extreme'>(() => {
    return (localStorage.getItem('omni_ai_sensitivity') as any) || 'strict';
  });
  const [temperature, setTemperature] = useState(() => {
    return parseFloat(localStorage.getItem('omni_temperature') || '0.7');
  });
  const [maxTokens, setMaxTokens] = useState(() => {
    return parseInt(localStorage.getItem('omni_max_tokens') || '4096');
  });
  const [bannedWords, setBannedWords] = useState<string[]>(() => {
    const saved = localStorage.getItem('omni_banned_words');
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return ['宛如', '仿佛', '不禁', '嘴角扬起一丝笑意', '眼神深邃', '倒吸一口凉气', '空气仿佛凝固', '赫然', '顿时'];
  });
  const [newBannedWord, setNewBannedWord] = useState('');

  // ==========================================
  // 5. Canvas & Interaction State (Converged from CanvasView)
  // ==========================================
  const [aiEdgeSensitivity, setAiEdgeSensitivity] = useState<'aggressive' | 'balanced' | 'conservative' | 'off'>(() => {
    return (localStorage.getItem('canvas_ai_edge_sensitivity') as any) || 'balanced';
  });
  const [canvasGridSnap, setCanvasGridSnap] = useState(() => {
    return localStorage.getItem('canvas_grid_snap') !== 'false';
  });
  const [canvasBgPattern, setCanvasBgPattern] = useState<'dots' | 'grid' | 'blank'>(() => {
    return (localStorage.getItem('canvas_bg_pattern') as any) || 'dots';
  });
  const [canvasFpsMode, setCanvasFpsMode] = useState<'smooth' | 'powersave'>(() => {
    return (localStorage.getItem('canvas_fps_mode') as any) || 'smooth';
  });
  const [typingSpeed, setTypingSpeed] = useState<'fast' | 'natural' | 'slow'>(() => {
    return (localStorage.getItem('omni_typing_speed') as any) || 'natural';
  });
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(() => {
    return localStorage.getItem('omni_sound_effects') !== 'false';
  });
  const [autoSaveMaterials, setAutoSaveMaterials] = useState(() => {
    return localStorage.getItem('omni_auto_save_materials') !== 'false';
  });

  // ==========================================
  // 6. Storage & Snapshot State
  // ==========================================
  const [storageStats, setStorageStats] = useState<StorageStats>({
    topicsCount: 0,
    messagesCount: 0,
    novelsCount: 0,
    chaptersCount: 0,
    materialsCount: 0,
    researchCount: 0,
    providersCount: 0,
    modelsCount: 0,
    dbSizeBytes: 0,
    dbSizeFormatted: '加载中...'
  });
  const [isOptimizingDb, setIsOptimizingDb] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize data from server
  useEffect(() => {
    fetchProviders();
    fetchModels();
    fetchModelRoles();
    fetchStorageStats();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/providers');
      const data = await res.json();
      setProviders(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setModels(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchModelRoles = async () => {
    try {
      const res = await fetch('/api/model_roles');
      const data: any[] = await res.json();
      const map: Record<string, string> = {};
      for (const r of data) map[r.role] = r.model_id;
      setModelRoles(map);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStorageStats = async () => {
    try {
      const res = await fetch('/api/storage/stats');
      if (res.ok) {
        const data = await res.json();
        setStorageStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Test provider connection
  const handleTestConnection = async (providerId: string) => {
    setTestingId(providerId);
    setTestResults(prev => ({ ...prev, [providerId]: '测试中...' }));
    try {
      const res = await fetch(`/api/providers/${providerId}/test`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTestResults(prev => ({ ...prev, [providerId]: `连接成功！响应: "${data.text}"` }));
        showToast('供应商网络握手成功');
      } else {
        setTestResults(prev => ({ ...prev, [providerId]: `连接失败: ${data.error}` }));
        showToast('供应商连接失败，请检查 Base URL 与 Key', false);
      }
    } catch (e: any) {
      setTestResults(prev => ({ ...prev, [providerId]: `请求失败: ${e.message}` }));
    } finally {
      setTestingId(null);
    }
  };

  // Gemini Direct API Key Test & Persistence
  const handleSaveGeminiKey = (key: string) => {
    const trimmed = key.trim();
    setGeminiApiKey(trimmed);
    localStorage.setItem('omni_gemini_api_key', trimmed);
    if (!trimmed) {
      setGeminiHealthStatus('offline');
      setGeminiTestLatency(null);
      showToast('已清空 Gemini 官方密钥，恢复离线科学推理');
    } else {
      setGeminiHealthStatus('ready');
      showToast('Gemini API 密钥已持久化保存');
    }
    // Also sync to /api/settings
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gemini_api_key: trimmed })
    }).catch(() => {});
  };

  const handleTestGeminiKey = async () => {
    if (!geminiApiKey.trim()) {
      showToast('请先输入 Gemini API 密钥', false);
      return;
    }
    setGeminiHealthStatus('testing');
    const start = performance.now();
    try {
      // Test Gemini API endpoint
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiApiKey.trim())}`);
      const latency = Math.round(performance.now() - start);
      setGeminiTestLatency(latency);
      if (res.ok) {
        setGeminiHealthStatus('ready');
        showToast(`Gemini API 连通成功！握手延迟: ${latency}ms`);
      } else {
        setGeminiHealthStatus('offline');
        showToast(`Gemini API 验证未通过 (${res.status})，将使用本地推理`, false);
      }
    } catch (err: any) {
      // Offline fallback
      setGeminiHealthStatus('offline');
      showToast(`网络握手阻断: ${err.message || '已自动切换至本地学术引擎'}`);
    }
  };

  // Add custom provider
  const handleCreateProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProvName,
          base_url: newProvUrl,
          api_key: newProvKey,
          kind: newProvKind
        })
      });
      setShowAddProvider(false);
      setNewProvName('');
      setNewProvUrl('');
      setNewProvKey('');
      fetchProviders();
      showToast('自建供应商已接入系统');
    } catch (e: any) {
      alert(`添加失败: ${e.message}`);
    }
  };

  // Save role assignment
  const handleSaveRole = async (role: string, modelId: string) => {
    const nextRoles = { ...modelRoles, [role]: modelId };
    setModelRoles(nextRoles);
    await fetch('/api/model_roles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextRoles)
    });
    showToast('任务角色模型路由已更新');
  };

  // Database Vacuum & Optimization
  const handleOptimizeDb = async () => {
    setIsOptimizingDb(true);
    try {
      const res = await fetch('/api/storage/vacuum', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`SQLite 碎片整理完成，优化后物理体积: ${data.afterFormatted}`);
        fetchStorageStats();
      } else {
        showToast('数据库优化完成');
      }
    } catch (e: any) {
      showToast(`优化失败: ${e.message}`, false);
    } finally {
      setIsOptimizingDb(false);
    }
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    try {
      const res = await fetch('/api/backup/export');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `local-ai-studio-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('全量数据资产快照已成功导出');
    } catch (e: any) {
      alert(`导出失败: ${e.message}`);
    }
  };

  // Import JSON Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('确定导入该数据快照？系统将合并并覆盖当前话题与设定记录。')) {
      e.target.value = '';
      return;
    }

    setIsRestoringBackup(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`成功恢复 ${data.restoredCount} 条端侧数据记录！`);
        fetchStorageStats();
        fetchProviders();
        fetchModels();
      } else {
        showToast(`恢复失败: ${data.error}`, false);
      }
    } catch (err: any) {
      showToast(`导入解析失败: ${err.message}`, false);
    } finally {
      setIsRestoringBackup(false);
      e.target.value = '';
    }
  };

  // Banned words management
  const handleAddBannedWord = () => {
    if (!newBannedWord.trim()) return;
    const word = newBannedWord.trim();
    if (!bannedWords.includes(word)) {
      const next = [...bannedWords, word];
      setBannedWords(next);
      localStorage.setItem('omni_banned_words', JSON.stringify(next));
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned_words: JSON.stringify(next) })
      }).catch(() => {});
      showToast(`已增添禁用词: ${word}`);
    }
    setNewBannedWord('');
  };

  const handleRemoveBannedWord = (word: string) => {
    const next = bannedWords.filter(w => w !== word);
    setBannedWords(next);
    localStorage.setItem('omni_banned_words', JSON.stringify(next));
    showToast(`已移除: ${word}`);
  };

  const handleLoadClassicBannedWords = () => {
    const presets = [
      '宛如', '仿佛', '不禁', '嘴角扬起一丝笑意', '眼神深邃', '倒吸一口凉气', 
      '空气仿佛凝固', '赫然', '顿时', '眼眸中闪过一丝', '耐人寻味', '不言而喻',
      '毋庸置疑', '在某种程度上', '正如前文所述', '总而言之', '值得注意的是'
    ];
    const set = Array.from(new Set([...bannedWords, ...presets]));
    setBannedWords(set);
    localStorage.setItem('omni_banned_words', JSON.stringify(set));
    showToast(`已装载 Apple 文学典范去套话词库 (共 ${set.length} 词条)`);
  };

  // Search filter
  const filteredSections = SETTINGS_SECTIONS.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.label.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--apple-bg)] select-none font-sans">
      {/* ============================================================ */}
      {/* 1. TOP macOS SEQUOIA UNIFIED TOOLBAR */}
      {/* ============================================================ */}
      <header className="h-[52px] border-b border-[var(--apple-border)] bg-[var(--apple-glass)] backdrop-blur-2xl px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-30">
        {/* Left: Window Traffic Lights & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-xs inline-block" />
          </div>
          <div className="h-4 w-px bg-[var(--apple-border)] hidden sm:block" />
          <div className="flex items-center gap-2 min-w-0">
            <Sliders className="w-4 h-4 text-[var(--apple-accent)] shrink-0" />
            <h1 className="text-xs md:text-sm font-bold text-[var(--apple-text-primary)] tracking-tight">
              系统偏好与工具台设置中心
            </h1>
            <span className="text-[11px] text-[var(--apple-text-tertiary)] hidden md:inline">
              · {SETTINGS_SECTIONS.find(s => s.id === activeSection)?.label}
            </span>
          </div>
        </div>

        {/* Center: Privacy & Offline Architecture Assertion */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-[var(--apple-text-secondary)] font-mono">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>本地 SQLite 离线持久化</span>
          <span aria-hidden="true">·</span>
          <span>端侧脱敏零上传</span>
          <span aria-hidden="true">·</span>
          <span>Apple 工业设计规范</span>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--apple-surface)] hover:bg-[var(--apple-subtle)] text-[var(--apple-text-primary)] border border-[var(--apple-border)] transition-all shadow-xs"
            title="导出全部数据为 JSON 快照"
          >
            <Download className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
            <span className="hidden sm:inline">全量备份快照</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white transition-all shadow-xs"
            title="从本地 JSON 快照恢复数据"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">恢复快照</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportBackup}
            accept=".json"
            className="hidden"
          />
        </div>
      </header>

      {/* Floating Apple HUD Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#181924]/95 text-white border border-white/20 text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. BODY SPLIT-VIEW (macOS System Settings Architecture) */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Settings Categories & Search */}
        <aside className="w-72 border-r border-[var(--apple-border)] bg-[var(--apple-sidebar)] flex flex-col shrink-0 select-none">
          {/* Settings Search Omnibar */}
          <div className="p-3 border-b border-[var(--apple-separator)]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--apple-text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索偏好设置与选项..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] outline-none focus:border-[var(--apple-accent)] transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Categories */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
            {filteredSections.map(sec => {
              const Icon = sec.icon;
              const isSelected = activeSection === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    if (soundEffectsEnabled) playSound('click');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[var(--apple-accent)] text-white font-semibold shadow-xs'
                      : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'text-white'
                      }`}
                      style={{ backgroundColor: isSelected ? undefined : sec.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left truncate">
                      <div className="truncate">{sec.label}</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 opacity-60 ${isSelected ? 'text-white' : 'text-[var(--apple-text-tertiary)]'}`} />
                </button>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="p-6 text-center text-xs text-[var(--apple-text-tertiary)]">
                未找到匹配的设置项
              </div>
            )}
          </div>

          {/* Workstation Profile Badge */}
          <div className="p-3 border-t border-[var(--apple-separator)] bg-[var(--apple-subtle)]/40">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--apple-surface)] border border-[var(--apple-border)]">
              <div className="p-2 rounded-lg bg-[var(--apple-accent)] text-white shadow-xs shrink-0">
                <Laptop className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-[var(--apple-text-primary)] truncate">
                  Local AI Studio Workstation
                </div>
                <div className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>端侧引擎就绪 · v2.0</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex justify-center bg-[var(--apple-bg)]">
          <div className="w-full max-w-3xl space-y-6 pb-20">
            {/* Active Category Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--apple-separator)]">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--apple-text-primary)] tracking-tight">
                  {SETTINGS_SECTIONS.find(s => s.id === activeSection)?.label}
                </h2>
                <p className="text-xs text-[var(--apple-text-secondary)] mt-0.5">
                  {SETTINGS_SECTIONS.find(s => s.id === activeSection)?.desc}
                </p>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 1. 外观与显示 (Appearance & Display) */}
            {/* ======================================================== */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                {/* Theme Selector */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    系统主题与光线调谐
                  </span>
                  <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] p-4 shadow-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'dark' as const, label: '深色模式 (Dark)', desc: '极客深黑，暗光护眼与专注', icon: Moon },
                        { id: 'light' as const, label: '日光浅色 (Light)', desc: '通透白净，明快开阔与高反差', icon: Sun },
                        { id: 'sepia' as const, label: '仿古羊皮纸 (Sepia)', desc: '温润暖调，沉浸式长文撰阅', icon: Coffee },
                      ].map(t => {
                        const Icon = t.icon;
                        const isSel = theme === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              setTheme(t.id);
                              fetch('/api/settings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ theme: t.id })
                              }).catch(() => {});
                              showToast(`已应用主题: ${t.label}`);
                            }}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              isSel
                                ? 'border-[var(--apple-accent)] bg-[var(--apple-accent-subtle)] shadow-xs scale-[1.01]'
                                : 'border-[var(--apple-border)] bg-[var(--apple-subtle)] hover:border-[var(--apple-border-strong)]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                                <Icon className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
                                <span>{t.label}</span>
                              </span>
                              {isSel && <Check className="w-4 h-4 text-[var(--apple-accent)]" />}
                            </div>
                            <p className="text-[11px] text-[var(--apple-text-tertiary)] leading-relaxed">{t.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Accent Color Inset Card */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    强调色体系 (Accent Palette)
                  </span>
                  <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[var(--apple-text-primary)]">系统高亮与按钮着色</div>
                      <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">保持 Apple 工业设计一贯的克制与色彩饱和度</div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {[
                        { color: '#0a84ff', name: '经典蓝' },
                        { color: '#bf5af2', name: '深邃紫' },
                        { color: '#30d158', name: '翡翠绿' },
                        { color: '#ff9f0a', name: '琥珀金' },
                        { color: '#ff375f', name: '珊瑚红' },
                        { color: '#8e8e93', name: '石墨灰' }
                      ].map(c => (
                        <button
                          key={c.color}
                          onClick={() => {
                            setAccentColor(c.color);
                            showToast(`已更新系统强调色: ${c.name}`);
                          }}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                          className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                            accentColor === c.color ? 'scale-110 ring-2 ring-offset-2 ring-[var(--apple-accent)]' : 'hover:scale-105 opacity-90'
                          }`}
                        >
                          {accentColor === c.color && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Typography & Code Display Inset Group */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    排版缩放与代码视觉
                  </span>
                  <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] divide-y divide-[var(--apple-separator)] shadow-xs overflow-hidden text-xs">
                    {/* Scale */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[var(--apple-text-primary)]">界面文本缩放比例</div>
                        <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">自适应调节工作台全局字号层次</div>
                      </div>
                      <div className="flex items-center gap-1 p-1 bg-[var(--apple-subtle)] rounded-xl border border-[var(--apple-border)]">
                        {[
                          { id: 'compact' as const, label: '紧凑 90%' },
                          { id: 'standard' as const, label: '标准 100%' },
                          { id: 'comfortable' as const, label: '宽适 110%' },
                        ].map(sc => (
                          <button
                            key={sc.id}
                            onClick={() => {
                              setFontScale(sc.id);
                              showToast(`字号已调整为: ${sc.label}`);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                              fontScale === sc.id
                                ? 'bg-[var(--apple-accent)] text-white shadow-xs'
                                : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
                            }`}
                          >
                            {sc.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Code Font */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[var(--apple-text-primary)]">等宽代码字体 (Monospace Font)</div>
                        <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">代码块与数理公式中的字体渲染家族</div>
                      </div>
                      <select
                        value={codeFont}
                        onChange={e => {
                          const v = e.target.value as any;
                          setCodeFont(v);
                          localStorage.setItem('omni_code_font', v);
                          showToast('代码字体已更新');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] font-mono outline-none"
                      >
                        <option value="sf-mono">SF Mono (Apple Native)</option>
                        <option value="jetbrains">JetBrains Mono</option>
                        <option value="fira">Fira Code Retina</option>
                      </select>
                    </div>

                    {/* Code Line Numbers Switch */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[var(--apple-text-primary)]">在代码块中显示行号</div>
                        <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">代码阅读时在左侧渲染连续行序号与复制锚点</div>
                      </div>
                      <button
                        role="switch"
                        aria-checked={showCodeLineNumbers}
                        onClick={() => {
                          const next = !showCodeLineNumbers;
                          setShowCodeLineNumbers(next);
                          localStorage.setItem('omni_code_line_numbers', String(next));
                          showToast(next ? '已开启代码行号' : '已关闭代码行号');
                        }}
                        className={`w-11 h-6 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                          showCodeLineNumbers ? 'bg-[var(--apple-accent)]' : 'bg-[var(--apple-subtle)] border border-[var(--apple-border)]'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${showCodeLineNumbers ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Reduced Motion Switch */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[var(--apple-text-primary)]">减弱动态效果 (Reduced Motion)</div>
                        <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">减少弹窗、页面推入与微交互动画以适应舒适度需求</div>
                      </div>
                      <button
                        role="switch"
                        aria-checked={reducedMotion}
                        onClick={() => {
                          const next = !reducedMotion;
                          setReducedMotion(next);
                          localStorage.setItem('omni_reduced_motion', String(next));
                          showToast(next ? '已开启减弱动态效果' : '已恢复标准动态效果');
                        }}
                        className={`w-11 h-6 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                          reducedMotion ? 'bg-[var(--apple-accent)]' : 'bg-[var(--apple-subtle)] border border-[var(--apple-border)]'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${reducedMotion ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 2. 模型与推理网关 (Models & Providers) */}
            {/* ======================================================== */}
            {activeSection === 'providers' && (
              <div className="space-y-6">
                {/* Official Gemini Direct Key Card (Converged from ResearchView) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                      官方 Gemini API 直连凭证与健康探针 (收敛自深度研究)
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      <span className={`w-2 h-2 rounded-full ${
                        geminiHealthStatus === 'ready' ? 'bg-emerald-500 animate-pulse' : 
                        geminiHealthStatus === 'testing' ? 'bg-amber-500 animate-ping' : 'bg-zinc-500'
                      }`} />
                      <span className={geminiHealthStatus === 'ready' ? 'text-emerald-500 font-bold' : 'text-[var(--apple-text-tertiary)]'}>
                        {geminiHealthStatus === 'ready' 
                          ? `已就绪 ${geminiTestLatency ? `(${geminiTestLatency}ms)` : ''}` 
                          : geminiHealthStatus === 'testing' ? '握手测试中...' : '未配置 (离线高保真学术推理)'}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] p-4 shadow-xs space-y-4 text-xs">
                    <div className="relative">
                      <input
                        type={showGeminiKey ? 'text' : 'password'}
                        value={geminiApiKey}
                        onChange={e => handleSaveGeminiKey(e.target.value)}
                        placeholder="AIzaSy... (输入 Google AI Studio 官方 Gemini API 密钥)"
                        className="w-full px-3.5 py-2.5 pr-20 text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] outline-none font-mono text-[var(--apple-text-primary)] focus:border-[var(--apple-accent)] transition-all"
                      />
                      <button
                        onClick={() => setShowGeminiKey(p => !p)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)] p-1"
                        title={showGeminiKey ? '隐藏' : '显示'}
                      >
                        {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[var(--apple-text-tertiary)]">
                      <span>密钥持久化存储于本地受保护的 localStorage 与端侧 SQLite</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleTestGeminiKey}
                          disabled={geminiHealthStatus === 'testing'}
                          className="text-[var(--apple-accent)] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>测试连通性 (Ping)</span>
                        </button>
                        <span>·</span>
                        <button
                          onClick={() => handleSaveGeminiKey('')}
                          className="text-rose-500 hover:underline"
                        >
                          清空凭证
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--apple-subtle)]/70 border border-[var(--apple-border)] text-[11px] text-[var(--apple-text-secondary)] leading-relaxed">
                      <strong>平滑自适应离线机制：</strong>未填入密钥或网络离线时，系统将无缝激活端侧<strong>高保真科学推理引擎</strong>，提供完整的学术假说推演、力导向拓扑、双向分屏原件与反脆弱矩阵，研究创作零阻断。
                    </div>
                  </div>
                </div>

                {/* Registered Providers Inset Group */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                      已挂载模型供应商 ({providers.length})
                    </span>
                    <button
                      onClick={() => setShowAddProvider(true)}
                      className="text-xs text-[var(--apple-accent)] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>添加自建 / 私有网关</span>
                    </button>
                  </div>

                  <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] divide-y divide-[var(--apple-separator)] shadow-xs overflow-hidden">
                    {providers.map(p => (
                      <div key={p.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--apple-text-primary)] text-sm">{p.name}</span>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)] border border-[var(--apple-border)]">
                              {p.kind}
                            </span>
                            {p.has_key ? (
                              <span className="text-[11px] font-mono text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{p.api_key_masked}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono text-amber-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>未设 Key (使用端侧离线模拟)</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--apple-text-tertiary)] font-mono truncate">{p.base_url}</div>
                          {testResults[p.id] && (
                            <div className={`text-[11px] font-mono pt-1 ${testResults[p.id].includes('成功') ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {testResults[p.id]}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleTestConnection(p.id)}
                            disabled={testingId === p.id}
                            className="px-3 py-1.5 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-semibold text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:border-[var(--apple-accent)] transition-all shadow-xs"
                          >
                            {testingId === p.id ? '连通中...' : '测试网关'}
                          </button>
                          {p.id !== 'gemini-provider' && p.id !== 'mock-provider' && (
                            <button
                              onClick={async () => {
                                if (confirm('确定删除该供应商？')) {
                                  await fetch(`/api/providers/${p.id}`, { method: 'DELETE' });
                                  fetchProviders();
                                  showToast('供应商已移除');
                                }
                              }}
                              className="p-1.5 rounded-lg text-[var(--apple-text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="删除网关"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. 任务角色智能路由 (Model Roles) */}
            {/* ======================================================== */}
            {activeSection === 'roles' && (
              <div className="space-y-4">
                <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                  按工作台核心职能分配最优模型
                </span>
                <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] divide-y divide-[var(--apple-separator)] shadow-xs overflow-hidden text-xs">
                  {[
                    { role: 'chat', label: '智能对话增强 (Chat)', desc: '多轮深度问答、思维链推演与多模态引用' },
                    { role: 'novel_write', label: '小说正文创作 (Novel Write)', desc: '长篇沉浸生成、大纲细化与分段起草续写' },
                    { role: 'novel_review', label: '去 AI 腔深度审查 (Novel Review)', desc: '设定一致性、因果逻辑、文风去油腻审校' },
                    { role: 'summarize', label: '滚动事实账本压缩 (Summarize)', desc: '长篇正文事实提取与高密度剧情压缩' },
                    { role: 'research', label: '前沿深度研究 (Research)', desc: '学术子课题规划拆解与证据溯源研报' },
                  ].map(r => (
                    <div key={r.role} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-bold text-[var(--apple-text-primary)] text-sm block">{r.label}</span>
                        <span className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5 block">{r.desc}</span>
                      </div>
                      <select
                        value={modelRoles[r.role] || ''}
                        onChange={e => handleSaveRole(r.role, e.target.value)}
                        className="px-3 py-2 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)] font-medium cursor-pointer sm:max-w-[240px] shrink-0"
                      >
                        {models.map(m => (
                          <option key={m.id} value={m.id} className="bg-[var(--apple-surface)] text-[var(--apple-text-primary)]">
                            {m.display_name} ({m.provider_name})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 4. 科研与知识引擎设置 (Research Engine - Converged) */}
            {/* ======================================================== */}
            {activeSection === 'research' && (
              <div className="space-y-6">
                {/* Research Depth & Budget */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    前沿学术研报生成策略 (收敛自深度研究)
                  </span>
                  <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] divide-y divide-[var(--apple-separator)] shadow-xs overflow-hidden text-xs">
                    {/* Depth */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[var(--apple-text-primary)]">
                            研报子命题分解深度: {researchDepthLevel} 阶段
                          </div>
                          <div className="text-[11px] text-[var(--apple-text-tertiary)]">
                            控制由粗到细的学术假设拆解步长与交叉验证轮次
                          </div>
                        </div>
                        <span className="font-mono text-[var(--apple-accent)] font-bold text-sm">
                          {researchDepthLevel} 步演进
                        </span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="10"
                        step="1"
                        value={researchDepthLevel}
                        onChange={e => {
                          const v = parseInt(e.target.value);
                          setResearchDepthLevel(v);
                          localStorage.setItem('omni_depth_level', String(v));
                          fetch('/api/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ research_depth_level: v })
                          }).catch(() => {});
                        }}
                        className="w-full accent-[var(--apple-accent)] cursor-pointer"
                      />
                    </div>

                    {/* Token Budget */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[var(--apple-text-primary)]">
                            单篇综合研报 Token 思考预算: {researchTokenBudget.toLocaleString()} Tokens
                          </div>
                          <div className="text-[11px] text-[var(--apple-text-tertiary)]">
                            包含思维链长推演、数理证明与四方专家圆桌生成预算
                          </div>
                        </div>
                        <span className="font-mono text-[var(--apple-accent)] font-bold text-sm">
                          {researchTokenBudget >= 32768 ? '学术典范级' : '敏捷速查级'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="8192"
                        max="65536"
                        step="4096"
                        value={researchTokenBudget}
                        onChange={e => {
                          const v = parseInt(e.target.value);
                          setResearchTokenBudget(v);
                          localStorage.setItem('omni_token_budget', String(v));
                          fetch('/api/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ research_token_budget: v })
                          }).catch(() => {});
                        }}
                        className="w-full accent-[var(--apple-accent)] cursor-pointer"
                      />
                    </div>

                    {/* Show Thinking Process Toggle */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[var(--apple-text-primary)]">默认展开思维链推演折叠框</div>
                        <div className="text-[11px] text-[var(--apple-text-tertiary)]">在研报阅读态自动显示推演步骤与反思审查流程</div>
                      </div>
                      <button
                        role="switch"
                        aria-checked={researchShowThinking}
                        onClick={() => {
                          const next = !researchShowThinking;
                          setResearchShowThinking(next);
                          localStorage.setItem('omni_show_thinking', String(next));
                          showToast(next ? '已开启思维链自动展开' : '已关闭思维链自动展开');
                        }}
                        className={`w-11 h-6 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                          researchShowThinking ? 'bg-[var(--apple-accent)]' : 'bg-[var(--apple-subtle)] border border-[var(--apple-border)]'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${researchShowThinking ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Domain Whitelist & Filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                      学术信源白名单与屏蔽规则 (Domain Filter)
                    </span>
                    <button
                      onClick={() => {
                        const standard = 'site:arxiv.org, site:neurips.cc, site:nature.com, -site:csdn.net';
                        setResearchDomainFilter(standard);
                        localStorage.setItem('omni_domain_filter', standard);
                        showToast('已重置为顶级学术期刊白名单');
                      }}
                      className="text-xs text-[var(--apple-accent)] hover:underline font-semibold"
                    >
                      恢复期刊白名单预设
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs space-y-3 text-xs">
                    <input
                      type="text"
                      value={researchDomainFilter}
                      onChange={e => {
                        setResearchDomainFilter(e.target.value);
                        localStorage.setItem('omni_domain_filter', e.target.value);
                      }}
                      placeholder="如: site:arxiv.org, site:neurips.cc, -site:csdn.net"
                      className="w-full p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] font-mono text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                    />
                    <div className="text-[11px] text-[var(--apple-text-tertiary)] leading-relaxed">
                      支持 Google 搜索语法：使用 <code>site:</code> 指定高权重学术域，使用 <code>-site:</code> 过滤劣质搬运站，研报检索引擎将优先定向溯源。
                    </div>
                  </div>
                </div>

                {/* Standalone HTML Report Template Style */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    独立学术研报 HTML 导出样式预设
                  </span>
                  <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] p-4 shadow-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {[
                        { id: 'academic' as const, label: '经典学术蓝 (Academic Blue)', desc: '高亮引用、标准科技期刊排版' },
                        { id: 'minimal' as const, label: '极简明亮 (Clean Monochrome)', desc: '纸质印刷质感、纯净高反差' },
                        { id: 'dark' as const, label: '深空沉浸 (Graphite Dark)', desc: '极客暗夜视觉、发光图谱配色' },
                      ].map(tmpl => (
                        <div
                          key={tmpl.id}
                          onClick={() => {
                            setResearchHtmlTemplate(tmpl.id);
                            localStorage.setItem('omni_html_template', tmpl.id);
                            showToast(`已选择研报导出预设: ${tmpl.label}`);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            researchHtmlTemplate === tmpl.id
                              ? 'border-[var(--apple-accent)] bg-[var(--apple-accent-subtle)] font-semibold shadow-xs'
                              : 'border-[var(--apple-border)] bg-[var(--apple-subtle)] hover:border-[var(--apple-border-strong)]'
                          }`}
                        >
                          <div className="font-bold text-[var(--apple-text-primary)] mb-1">{tmpl.label}</div>
                          <div className="text-[10px] text-[var(--apple-text-tertiary)]">{tmpl.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 5. 创作风控与正文约束 (Guardrails & Tone - Converged) */}
            {/* ======================================================== */}
            {activeSection === 'guardrails' && (
              <div className="space-y-6">
                {/* De-AI Strictness */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    去 AI 腔审查灵敏度 (收敛自小说工坊)
                  </span>
                  <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {[
                        { id: 'standard' as const, label: '标准校对', desc: '基础语病与明显生硬关联词检测' },
                        { id: 'strict' as const, label: '严格洗练 (推荐)', desc: '全面清除陈腐套话、浮夸空洞与油腻修辞' },
                        { id: 'extreme' as const, label: '极致文学冷调', desc: '极其严苛的文风、节奏与五感具象检验' },
                      ].map(lvl => (
                        <button
                          key={lvl.id}
                          onClick={() => {
                            setAiSensitivity(lvl.id);
                            localStorage.setItem('omni_ai_sensitivity', lvl.id);
                            showToast(`审查灵敏度已设为: ${lvl.label}`);
                          }}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            aiSensitivity === lvl.id
                              ? 'border-[var(--apple-accent)] bg-[var(--apple-accent-subtle)] font-semibold shadow-xs'
                              : 'border-[var(--apple-border)] bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
                          }`}
                        >
                          <div className="text-xs font-bold mb-1 text-[var(--apple-text-primary)]">{lvl.label}</div>
                          <div className="text-[11px] text-[var(--apple-text-tertiary)] leading-tight">{lvl.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Banned Words Library */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                      正文禁用与陈腐套话词库 ({bannedWords.length} 词)
                    </span>
                    <button
                      onClick={handleLoadClassicBannedWords}
                      className="text-xs text-[var(--apple-accent)] hover:underline font-semibold"
                    >
                      加载 Apple 文学典范去套话词库
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        value={newBannedWord}
                        onChange={e => setNewBannedWord(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddBannedWord()}
                        placeholder="输入需要杜绝的 AI 腔词汇 (回车添加)..."
                        className="flex-1 p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                      />
                      <button
                        onClick={handleAddBannedWord}
                        className="px-4 py-2.5 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold hover:bg-[var(--apple-accent-hover)] transition-all shadow-xs"
                      >
                        添加词条
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto">
                      {bannedWords.map(word => (
                        <span
                          key={word}
                          className="px-3 py-1 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] flex items-center gap-2 group shadow-xs"
                        >
                          <span>{word}</span>
                          <button
                            onClick={() => handleRemoveBannedWord(word)}
                            className="text-[var(--apple-text-tertiary)] hover:text-rose-500 transition-colors"
                            title="移除词条"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Global Sampling Temperature & Tokens */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    全局采样发散度与输出预算
                  </span>
                  <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs space-y-4 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-[var(--apple-text-primary)]">默认采样温度 (Temperature): {temperature}</span>
                        <span className="text-[11px] text-[var(--apple-text-tertiary)] font-mono">
                          {temperature < 0.5 ? '理智严谨' : temperature < 0.8 ? '叙事均衡' : '天马行空'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="1.2"
                        step="0.05"
                        value={temperature}
                        onChange={e => {
                          const v = parseFloat(e.target.value);
                          setTemperature(v);
                          localStorage.setItem('omni_temperature', String(v));
                        }}
                        className="w-full accent-[var(--apple-accent)] cursor-pointer"
                      />
                    </div>

                    <div className="pt-3 border-t border-[var(--apple-separator)]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-[var(--apple-text-primary)]">单次最大生成 Token 预算: {maxTokens}</span>
                        <span className="text-[11px] text-[var(--apple-text-tertiary)] font-mono">约合 {Math.round(maxTokens * 0.75)} 汉字</span>
                      </div>
                      <input
                        type="range"
                        min="1024"
                        max="8192"
                        step="512"
                        value={maxTokens}
                        onChange={e => {
                          const v = parseInt(e.target.value);
                          setMaxTokens(v);
                          localStorage.setItem('omni_max_tokens', String(v));
                        }}
                        className="w-full accent-[var(--apple-accent)] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 6. 交互与无限画布 (Canvas & Interaction - Converged) */}
            {/* ======================================================== */}
            {activeSection === 'canvas' && (
              <div className="space-y-6">
                {/* AI Edge Connection Sensitivity */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    无限画布 AI 连线建议灵敏度 (收敛自无限画布)
                  </span>
                  <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] p-4 shadow-xs text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[var(--apple-text-primary)]">语义关联建议强度</div>
                        <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">当多选节点时，AI 自动分析节点语义并在右键菜单提供连线推荐</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {[
                        { id: 'aggressive' as const, label: '激进敏锐', desc: '0.3 置信度召回' },
                        { id: 'balanced' as const, label: '均衡推荐 (默认)', desc: '0.5 置信度最佳' },
                        { id: 'conservative' as const, label: '严谨收敛', desc: '0.75 高确信度' },
                        { id: 'off' as const, label: '完全停用', desc: '仅手动右键连线' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setAiEdgeSensitivity(opt.id);
                            localStorage.setItem('canvas_ai_edge_sensitivity', opt.id);
                            showToast(`画布连线建议已切换为: ${opt.label}`);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            aiEdgeSensitivity === opt.id
                              ? 'border-[var(--apple-accent)] bg-[var(--apple-accent-subtle)] font-semibold shadow-xs'
                              : 'border-[var(--apple-border)] bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
                          }`}
                        >
                          <div className="font-bold text-[var(--apple-text-primary)] mb-0.5">{opt.label}</div>
                          <div className="text-[10px] text-[var(--apple-text-tertiary)]">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Canvas Grid & Snapping Inset Group */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    画布网格与渲染品质
                  </span>
                  <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] divide-y divide-[var(--apple-separator)] shadow-xs overflow-hidden text-xs">
                    {/* Grid Snap Switch */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[var(--apple-text-primary)]">网格自动吸附 (Snap to Grid)</div>
                        <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">拖拽节点时自动吸附至 16px 像素网格，保持对齐</div>
                      </div>
                      <button
                        role="switch"
                        aria-checked={canvasGridSnap}
                        onClick={() => {
                          const next = !canvasGridSnap;
                          setCanvasGridSnap(next);
                          localStorage.setItem('canvas_grid_snap', String(next));
                          showToast(next ? '已开启网格吸附' : '已关闭网格吸附');
                        }}
                        className={`w-11 h-6 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                          canvasGridSnap ? 'bg-[var(--apple-accent)]' : 'bg-[var(--apple-subtle)] border border-[var(--apple-border)]'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${canvasGridSnap ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Canvas Background Pattern */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[var(--apple-text-primary)]">画布背景底纹样式</div>
                        <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">微弱点阵或网格纹理辅助距离感</div>
                      </div>
                      <select
                        value={canvasBgPattern}
                        onChange={e => {
                          const v = e.target.value as any;
                          setCanvasBgPattern(v);
                          localStorage.setItem('canvas_bg_pattern', v);
                          showToast('画布底纹已更改');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] outline-none"
                      >
                        <option value="dots">科技点阵 (Dot Matrix)</option>
                        <option value="grid">工程网格 (Isometric Grid)</option>
                        <option value="blank">纯净无底纹 (Minimal Blank)</option>
                      </select>
                    </div>

                    {/* FPS Mode */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[var(--apple-text-primary)]">画布渲染帧率与能效</div>
                        <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">平移缩放时的 GPU 渲染刷新率</div>
                      </div>
                      <div className="flex items-center gap-1 p-1 bg-[var(--apple-subtle)] rounded-xl border border-[var(--apple-border)]">
                        <button
                          onClick={() => {
                            setCanvasFpsMode('smooth');
                            localStorage.setItem('canvas_fps_mode', 'smooth');
                            showToast('已激活 60FPS 丝滑高刷');
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            canvasFpsMode === 'smooth'
                              ? 'bg-[var(--apple-accent)] text-white shadow-xs'
                              : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
                          }`}
                        >
                          60FPS 丝滑
                        </button>
                        <button
                          onClick={() => {
                            setCanvasFpsMode('powersave');
                            localStorage.setItem('canvas_fps_mode', 'powersave');
                            showToast('已切换为 30FPS 省电模式');
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            canvasFpsMode === 'powersave'
                              ? 'bg-[var(--apple-accent)] text-white shadow-xs'
                              : 'text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
                          }`}
                        >
                          30FPS 省电
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Global Interaction Feedback */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    系统流式与音效触感
                  </span>
                  <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] divide-y divide-[var(--apple-separator)] shadow-xs overflow-hidden text-xs">
                    {/* Sound Effects Switch */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[var(--apple-subtle)] text-[var(--apple-accent)]">
                          {soundEffectsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--apple-text-primary)]">macOS 轻量音效反馈</div>
                          <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">任务执行完毕、长研报生成与快照保存时播放提示音</div>
                        </div>
                      </div>
                      <button
                        role="switch"
                        aria-checked={soundEffectsEnabled}
                        onClick={() => {
                          const next = !soundEffectsEnabled;
                          setSoundEffectsEnabled(next);
                          localStorage.setItem('omni_sound_effects', String(next));
                          showToast(next ? '已开启系统操作音效' : '已静音操作音效');
                        }}
                        className={`w-11 h-6 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                          soundEffectsEnabled ? 'bg-[var(--apple-accent)]' : 'bg-[var(--apple-subtle)] border border-[var(--apple-border)]'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${soundEffectsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Auto Save to Materials */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[var(--apple-subtle)] text-emerald-500">
                          <FolderArchive className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--apple-text-primary)]">精选摘录自动沉淀至素材管理</div>
                          <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">在研报与小说工坊中点击保存时，自动同步归档到素材中心</div>
                        </div>
                      </div>
                      <button
                        role="switch"
                        aria-checked={autoSaveMaterials}
                        onClick={() => {
                          const next = !autoSaveMaterials;
                          setAutoSaveMaterials(next);
                          localStorage.setItem('omni_auto_save_materials', String(next));
                          showToast(next ? '已开启素材自动沉淀' : '已关闭素材自动沉淀');
                        }}
                        className={`w-11 h-6 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                          autoSaveMaterials ? 'bg-[var(--apple-accent)]' : 'bg-[var(--apple-subtle)] border border-[var(--apple-border)]'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${autoSaveMaterials ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 7. 数据备份与存储 (Data, Storage & Backup) */}
            {/* ======================================================== */}
            {activeSection === 'storage' && (
              <div className="space-y-6">
                {/* SQLite Real-time Metrics Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                      端侧 SQLite 数据库实时状态
                    </span>
                    <button
                      onClick={fetchStorageStats}
                      className="text-xs text-[var(--apple-accent)] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>刷新统计</span>
                    </button>
                  </div>

                  <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] p-4 shadow-xs space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                        <div className="text-[11px] text-[var(--apple-text-tertiary)]">对话话题总数</div>
                        <div className="text-lg font-bold font-mono text-[var(--apple-text-primary)] mt-0.5">{storageStats.topicsCount}</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                        <div className="text-[11px] text-[var(--apple-text-tertiary)]">消息交互日志</div>
                        <div className="text-lg font-bold font-mono text-[var(--apple-text-primary)] mt-0.5">{storageStats.messagesCount}</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                        <div className="text-[11px] text-[var(--apple-text-tertiary)]">小说章节手稿</div>
                        <div className="text-lg font-bold font-mono text-[var(--apple-text-primary)] mt-0.5">{storageStats.chaptersCount}</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                        <div className="text-[11px] text-[var(--apple-text-tertiary)]">素材资产词条</div>
                        <div className="text-lg font-bold font-mono text-[var(--apple-text-primary)] mt-0.5">{storageStats.materialsCount}</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--apple-subtle)]/70 border border-[var(--apple-border)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <Database className="w-4 h-4 text-emerald-500" />
                        <div>
                          <div className="font-semibold text-[var(--apple-text-primary)]">
                            数据库物理存储占用: <span className="font-mono text-emerald-500">{storageStats.dbSizeFormatted}</span>
                          </div>
                          <div className="text-[11px] text-[var(--apple-text-tertiary)]">本地 SQLite 文件位于 <code>/data/ai_platform.sqlite</code></div>
                        </div>
                      </div>

                      <button
                        onClick={handleOptimizeDb}
                        disabled={isOptimizingDb}
                        className="px-3.5 py-1.5 rounded-xl bg-[var(--apple-surface)] hover:bg-[var(--apple-subtle)] border border-[var(--apple-border)] font-semibold text-xs text-[var(--apple-text-primary)] flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isOptimizingDb ? 'animate-spin' : ''}`} />
                        <span>{isOptimizingDb ? '碎片整理中...' : '整理与优化 (VACUUM)'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Snapshot Backup & Restore Inset Group */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    全量资产快照管理 (Backup & Restore)
                  </span>
                  <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] divide-y divide-[var(--apple-separator)] shadow-xs overflow-hidden text-xs">
                    {/* Export */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[var(--apple-text-primary)]">导出工作台全量快照 (JSON)</div>
                        <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">
                          将全部话题、正文、大纲、世界观、素材与已配置的私有网关打包为可移植 JSON 文件
                        </div>
                      </div>
                      <button
                        onClick={handleExportBackup}
                        className="px-4 py-2 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white font-semibold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>导出快照</span>
                      </button>
                    </div>

                    {/* Import */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[var(--apple-text-primary)]">从快照文件恢复 (Restore Snapshot)</div>
                        <div className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">
                          上传此前导出的 JSON 文件，将无损还原并增补至端侧 SQLite 数据库
                        </div>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isRestoringBackup}
                        className="px-4 py-2 rounded-xl bg-[var(--apple-subtle)] hover:bg-[var(--apple-border)] border border-[var(--apple-border)] font-semibold text-[var(--apple-text-primary)] flex items-center gap-1.5 shadow-xs transition-all shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
                        <span>{isRestoringBackup ? '正在恢复...' : '选择文件'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 8. 快捷键与关于 (Shortcuts & About) */}
            {/* ======================================================== */}
            {activeSection === 'shortcuts' && (
              <div className="space-y-6">
                {/* Shortcuts Reference Inset Group */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    macOS 全局原生键盘快捷键体系
                  </span>
                  <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] divide-y divide-[var(--apple-separator)] shadow-xs overflow-hidden text-xs">
                    {[
                      { key: '⌘ K', label: '呼出全局 Spotlight 指令中心 (Command Palette)', desc: '在任意视窗中快速执行跨模块搜索与即时操作' },
                      { key: '⌘ 1 ~ ⌘ 9', label: '工作台核心页面极速直达', desc: '⌘1 对话 · ⌘2 智能体 · ⌘3 深度研报 · ⌘4 小说工坊 · ⌘6 画布' },
                      { key: '⌘ B', label: '折叠 / 展开左侧系统导航栏', desc: '一键释放屏幕空间，最大化沉浸撰写' },
                      { key: '⌘ N', label: '新建深度探索话题 (New Chat)', desc: '随时开启全新的思维分支与独立上下文' },
                      { key: '⌘ E', label: '导出当前视窗学术成果 / 手稿', desc: '将当前报告或长文下载为 Markdown / HTML' },
                      { key: '⌘ 0', label: '重置视口与画布缩放至 100%', desc: '无限画布与拓扑视图居中复位' },
                    ].map(sc => (
                      <div key={sc.key} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <span className="font-semibold text-[var(--apple-text-primary)] block text-xs">{sc.label}</span>
                          <span className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5 block">{sc.desc}</span>
                        </div>
                        <kbd className="px-2.5 py-1 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-mono font-bold text-[var(--apple-text-primary)] shadow-xs shrink-0">
                          {sc.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About Box */}
                <div className="p-5 rounded-2xl bg-[var(--apple-subtle)]/50 border border-[var(--apple-border)] text-xs text-[var(--apple-text-secondary)] space-y-2">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-[var(--apple-accent)]" />
                    <span className="font-bold text-[var(--apple-text-primary)] text-sm">Local AI Studio Pro</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--apple-surface)] border border-[var(--apple-border)] text-[var(--apple-accent)] font-semibold">
                      v2.0.0 (Apple Sequoia Native)
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--apple-text-tertiary)] leading-relaxed">
                    本工作台严格秉承 Apple 工业设计宪章规范构建，采用无胶囊严谨排版、高阶毛玻璃视窗质感、端侧 SQLite 零上传隐私架构，全面收敛并统一了全工作台的模型路由、去 AI 腔风控、学术研报步长与无限画布参数。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Provider Modal */}
      {showAddProvider && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[var(--apple-surface)] border border-[var(--apple-border-strong)] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--apple-separator)]">
              <h3 className="text-sm font-bold text-[var(--apple-text-primary)]">添加自建 / 私有模型网关</h3>
              <button onClick={() => setShowAddProvider(false)} className="text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProvider} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--apple-text-secondary)] font-semibold mb-1">供应商名称</label>
                <input
                  required
                  value={newProvName}
                  onChange={e => setNewProvName(e.target.value)}
                  placeholder="如：DeepSeek 官方 / 本地 Ollama / vLLM"
                  className="w-full p-2.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div>
                <label className="block text-[var(--apple-text-secondary)] font-semibold mb-1">Base URL</label>
                <input
                  required
                  value={newProvUrl}
                  onChange={e => setNewProvUrl(e.target.value)}
                  placeholder="如：https://api.deepseek.com"
                  className="w-full p-2.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-[var(--apple-text-primary)] font-mono outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div>
                <label className="block text-[var(--apple-text-secondary)] font-semibold mb-1">API Key</label>
                <input
                  type="password"
                  value={newProvKey}
                  onChange={e => setNewProvKey(e.target.value)}
                  placeholder="sk-... (私有内网无鉴权可留空)"
                  className="w-full p-2.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-[var(--apple-text-primary)] font-mono outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div>
                <label className="block text-[var(--apple-text-secondary)] font-semibold mb-1">协议架构</label>
                <select
                  value={newProvKind}
                  onChange={e => setNewProvKind(e.target.value)}
                  className="w-full p-2.5 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl text-[var(--apple-text-primary)] outline-none"
                >
                  <option value="openai">OpenAI 兼容协议 (标准)</option>
                  <option value="gemini">Google Gemini 原生协议</option>
                  <option value="ollama">Ollama 本地端口协议</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--apple-separator)]">
                <button
                  type="button"
                  onClick={() => setShowAddProvider(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--apple-border)] text-xs text-[var(--apple-text-secondary)] font-semibold hover:bg-[var(--apple-subtle)]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold hover:bg-[var(--apple-accent-hover)] transition-all shadow-xs"
                >
                  确认接入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
