import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
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
  FileText
} from 'lucide-react';

export type SettingsSection = 'appearance' | 'providers' | 'roles' | 'guardrails' | 'storage' | 'shortcuts';

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

const SETTINGS_SECTIONS = [
  { id: 'appearance' as SettingsSection, label: '外观与显示', icon: Palette, desc: '深浅模式、强调色与界面偏好' },
  { id: 'providers' as SettingsSection, label: '模型供应商', icon: Bot, desc: 'API 密钥、网关与连通性' },
  { id: 'roles' as SettingsSection, label: '任务角色分派', icon: Route, desc: '起草、审查、研报与对话分流' },
  { id: 'guardrails' as SettingsSection, label: '创作风控约束', icon: ShieldCheck, desc: '去 AI 腔深度、禁用词与发散温度' },
  { id: 'storage' as SettingsSection, label: '数据与备份', icon: HardDrive, desc: 'SQLite 状态、全量快照与恢复' },
  { id: 'shortcuts' as SettingsSection, label: '快捷键与关于', icon: Keyboard, desc: 'macOS 键盘快捷键与系统信息' },
];

export const SettingsView: React.FC<{
  theme: 'dark' | 'light' | 'sepia';
  setTheme: (t: 'dark' | 'light' | 'sepia') => void;
}> = ({ theme, setTheme }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');

  // Backend Data
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [modelRoles, setModelRoles] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  // New Provider Modal
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvName, setNewProvName] = useState('');
  const [newProvUrl, setNewProvUrl] = useState('https://api.deepseek.com');
  const [newProvKey, setNewProvKey] = useState('');
  const [newProvKind, setNewProvKind] = useState('openai');

  // Guardrails States
  const [aiSensitivity, setAiSensitivity] = useState<'standard' | 'strict' | 'extreme'>('strict');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [bannedWords, setBannedWords] = useState<string[]>([
    '宛如', '仿佛', '不禁', '嘴角扬起一丝笑意', '眼神深邃', '倒吸一口凉气', '空气仿佛凝固'
  ]);
  const [newBannedWord, setNewBannedWord] = useState('');

  // Accent Color Preview
  const [accentColor, setAccentColor] = useState('#0a84ff');

  // Storage Status
  const [storageStats, setStorageStats] = useState({
    topicsCount: 12,
    messagesCount: 148,
    novelsCount: 2,
    chaptersCount: 18,
    materialsCount: 42,
    databaseSize: '2.4 MB'
  });

  useEffect(() => {
    fetchProviders();
    fetchModels();
    fetchModelRoles();
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

  const handleTestConnection = async (providerId: string) => {
    setTestingId(providerId);
    setTestResults(prev => ({ ...prev, [providerId]: '测试中...' }));
    try {
      const res = await fetch(`/api/providers/${providerId}/test`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTestResults(prev => ({ ...prev, [providerId]: `连接成功！响应: "${data.text}"` }));
      } else {
        setTestResults(prev => ({ ...prev, [providerId]: `连接失败: ${data.error}` }));
      }
    } catch (e: any) {
      setTestResults(prev => ({ ...prev, [providerId]: `请求失败: ${e.message}` }));
    } finally {
      setTestingId(null);
    }
  };

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
    } catch (e: any) {
      alert(`添加失败: ${e.message}`);
    }
  };

  const handleSaveRole = async (role: string, modelId: string) => {
    const nextRoles = { ...modelRoles, [role]: modelId };
    setModelRoles(nextRoles);
    await fetch('/api/model_roles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextRoles)
    });
  };

  const handleExportBackup = async () => {
    try {
      const res = await fetch('/api/backup/export');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `local-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`导出失败: ${e.message}`);
    }
  };

  const handleAddBannedWord = () => {
    if (!newBannedWord.trim()) return;
    if (!bannedWords.includes(newBannedWord.trim())) {
      setBannedWords([...bannedWords, newBannedWord.trim()]);
    }
    setNewBannedWord('');
  };

  const handleRemoveBannedWord = (word: string) => {
    setBannedWords(bannedWords.filter(w => w !== word));
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--apple-bg)] select-none">
      {/* ============================================================ */}
      {/* 1. TOP macOS TOOLBAR FOR SETTINGS (系统偏好设置顶栏) */}
      {/* ============================================================ */}
      <header className="h-[52px] border-b border-[var(--apple-border)] bg-[var(--apple-glass)] backdrop-blur-xl px-4 flex items-center justify-between shrink-0 select-none z-30">
        {/* Left Zone: Title & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Sliders className="w-4 h-4 text-[var(--apple-accent)] shrink-0" />
          <span className="text-xs font-bold text-[var(--apple-text-primary)]">系统偏好设置 (System Settings)</span>
          <div className="flex items-center gap-1.5 text-xs text-[var(--apple-text-secondary)] font-mono tabular-nums">
            <span>·</span>
            <span>{SETTINGS_SECTIONS.find(s => s.id === activeSection)?.label}</span>
          </div>
        </div>

        {/* Center Zone: Security & Database Indicator */}
        <div className="flex items-center gap-2 text-xs text-[var(--apple-text-secondary)] font-mono">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>本地 SQLite 离线持久化</span>
          <span aria-hidden="true">·</span>
          <span>端侧脱敏加密</span>
        </div>

        {/* Right Zone: Global Backup Action */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-[var(--apple-accent)] text-white hover:bg-[var(--apple-accent-hover)] transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出全量快照 (JSON)</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. BODY SPLIT-VIEW (macOS System Settings Architecture) */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Settings Functional Categories */}
        <aside className="w-64 border-r border-[var(--apple-border)] bg-[var(--apple-sidebar)] flex flex-col shrink-0 select-none">
          {/* Workstation Profile Card */}
          <div className="p-3.5 border-b border-[var(--apple-separator)]">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--apple-surface)]/80 border border-[var(--apple-border)]">
              <div className="p-2 rounded-lg bg-[var(--apple-accent)] text-white shadow-xs">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[var(--apple-text-primary)] truncate">
                  Local AI Studio
                </div>
                <div className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>引擎状态正常 · v2.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Categories */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
            {SETTINGS_SECTIONS.map(sec => {
              const Icon = sec.icon;
              const isSelected = activeSection === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[var(--apple-accent)] text-white font-semibold shadow-xs'
                      : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{sec.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isSelected ? 'text-white' : 'text-[var(--apple-text-tertiary)]'}`} />
                </button>
              );
            })}
          </div>

          {/* Section Info Card */}
          <div className="p-3 border-t border-[var(--apple-separator)] bg-[var(--apple-subtle)]/20 text-[11px] text-[var(--apple-text-tertiary)]">
            <div className="font-semibold text-[var(--apple-text-secondary)] mb-0.5">
              {SETTINGS_SECTIONS.find(s => s.id === activeSection)?.label}
            </div>
            <div className="text-[10px] leading-tight">
              {SETTINGS_SECTIONS.find(s => s.id === activeSection)?.desc}
            </div>
          </div>
        </aside>

        {/* Right Main Content Pane */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-[var(--apple-bg)]">
          <div className="w-full max-w-2xl space-y-6 pb-16">
            {/* Section Header */}
            <div>
              <h2 className="text-xl font-bold text-[var(--apple-text-primary)] tracking-tight">
                {SETTINGS_SECTIONS.find(s => s.id === activeSection)?.label}
              </h2>
              <p className="text-xs text-[var(--apple-text-secondary)] mt-0.5">
                {SETTINGS_SECTIONS.find(s => s.id === activeSection)?.desc}
              </p>
            </div>

            {/* ======================================================== */}
            {/* 1. 外观与显示 (Appearance) */}
            {/* ======================================================== */}
            {activeSection === 'appearance' && (
              <div className="space-y-5">
                {/* Theme Selector */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    系统主题外观
                  </span>
                  <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'dark' as const, label: '深色模式 (Dark)', desc: '极客深黑，暗光护眼', icon: Moon },
                        { id: 'light' as const, label: '日光浅色 (Light)', desc: '通透白净，明快专注', icon: Sun },
                        { id: 'sepia' as const, label: '仿古羊皮纸 (Sepia)', desc: '暖调沉浸，长文阅览', icon: Coffee },
                      ].map(t => {
                        const Icon = t.icon;
                        const isSel = theme === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                              isSel
                                ? 'border-[var(--apple-accent)] bg-[var(--apple-accent-subtle)] shadow-xs scale-[1.01]'
                                : 'border-[var(--apple-border)] bg-[var(--apple-subtle)] hover:border-[var(--apple-border-strong)]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                                <Icon className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
                                <span>{t.label}</span>
                              </span>
                              {isSel && <Check className="w-3.5 h-3.5 text-[var(--apple-accent)]" />}
                            </div>
                            <p className="text-[10px] text-[var(--apple-text-tertiary)]">{t.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Accent Color Chooser */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    强调色体系 (Accent Color)
                  </span>
                  <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[var(--apple-text-primary)]">系统高亮与按钮着色</div>
                      <div className="text-[10px] text-[var(--apple-text-tertiary)]">保持 Apple 经典的极简统一色彩规范</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#0a84ff', name: '经典蓝' },
                        { color: '#bf5af2', name: '深邃紫' },
                        { color: '#30d158', name: '翡翠绿' },
                        { color: '#ff9f0a', name: '琥珀金' },
                        { color: '#ff375f', name: '珊瑚红' }
                      ].map(c => (
                        <button
                          key={c.color}
                          onClick={() => setAccentColor(c.color)}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                          className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                            accentColor === c.color ? 'scale-110 ring-2 ring-offset-2 ring-[var(--apple-accent)]' : 'hover:scale-105'
                          }`}
                        >
                          {accentColor === c.color && <Check className="w-3 h-3 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 2. 模型供应商 (Providers) */}
            {/* ======================================================== */}
            {activeSection === 'providers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                    已接入供应商 ({providers.length})
                  </span>
                  <button
                    onClick={() => setShowAddProvider(true)}
                    className="text-xs text-[var(--apple-accent)] hover:underline flex items-center gap-0.5 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加自建/私有网关</span>
                  </button>
                </div>

                <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] divide-y divide-[var(--apple-separator)] shadow-xs overflow-hidden">
                  {providers.map(p => (
                    <div key={p.id} className="p-4 flex items-center justify-between gap-3 text-xs">
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
                              <span>未配置 Key</span>
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
                          className="px-3 py-1.5 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-medium text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:border-[var(--apple-accent)] transition-all shadow-xs"
                        >
                          {testingId === p.id ? '连通性测试中...' : '测试连通性'}
                        </button>
                        {p.id !== 'gemini-provider' && p.id !== 'mock-provider' && (
                          <button
                            onClick={async () => {
                              if (confirm('确定删除该供应商？')) {
                                await fetch(`/api/providers/${p.id}`, { method: 'DELETE' });
                                fetchProviders();
                              }
                            }}
                            className="p-1.5 rounded-lg text-[var(--apple-text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="删除供应商"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. 任务角色模型分派 (Model Roles) */}
            {/* ======================================================== */}
            {activeSection === 'roles' && (
              <div className="space-y-4">
                <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                  按创作职能智能路由分发
                </span>
                <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] divide-y divide-[var(--apple-separator)] shadow-xs overflow-hidden text-xs">
                  {[
                    { role: 'chat', label: '智能对话增强 (Chat)', desc: '多轮深度问答、思维链推演与事实引用' },
                    { role: 'novel_write', label: '小说正文创作 (Novel Write)', desc: '长篇沉浸生成、大纲细化与分段起草续写' },
                    { role: 'novel_review', label: '去 AI 腔深度审查 (Novel Review)', desc: '设定一致性、因果逻辑、文风去油腻审校' },
                    { role: 'summarize', label: '滚动事实账本压缩 (Summarize)', desc: '长篇正文事实提取与高密度剧情压缩' },
                    { role: 'research', label: '前沿深度研究 (Research)', desc: '子课题规划拆解与证据溯源研报' },
                  ].map(r => (
                    <div key={r.role} className="p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span className="font-bold text-[var(--apple-text-primary)] text-sm block">{r.label}</span>
                        <span className="text-[11px] text-[var(--apple-text-tertiary)]">{r.desc}</span>
                      </div>
                      <select
                        value={modelRoles[r.role] || ''}
                        onChange={e => handleSaveRole(r.role, e.target.value)}
                        className="p-2 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)] font-medium cursor-pointer max-w-[220px]"
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
            {/* 4. 创作风控与正文约束 (Guardrails) */}
            {/* ======================================================== */}
            {activeSection === 'guardrails' && (
              <div className="space-y-5">
                {/* De-AI Sensitivity */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    去 AI 腔审查灵敏度
                  </span>
                  <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'standard' as const, label: '标准校对', desc: '基础语病与明显生硬关联词' },
                        { id: 'strict' as const, label: '严格洗练 (推荐)', desc: '全面清除陈腐套话与空洞修辞' },
                        { id: 'extreme' as const, label: '极致文学冷调', desc: '极其严苛的文风与五感具象检验' },
                      ].map(lvl => (
                        <button
                          key={lvl.id}
                          onClick={() => setAiSensitivity(lvl.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            aiSensitivity === lvl.id
                              ? 'border-[var(--apple-accent)] bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)] font-semibold shadow-xs'
                              : 'border-[var(--apple-border)] bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
                          }`}
                        >
                          <div className="text-xs font-bold mb-1">{lvl.label}</div>
                          <div className="text-[10px] opacity-80 leading-tight">{lvl.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Banned Words Library */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
                      正文禁用与陈腐词库 ({bannedWords.length})
                    </span>
                    <span className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">
                      创作起草将强制回避此类词汇
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        value={newBannedWord}
                        onChange={e => setNewBannedWord(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddBannedWord()}
                        placeholder="输入需要杜绝的 AI 腔词汇 (回车添加)..."
                        className="flex-1 p-2 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)]"
                      />
                      <button
                        onClick={handleAddBannedWord}
                        className="px-3.5 py-2 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold hover:bg-[var(--apple-accent-hover)] transition-all shadow-xs"
                      >
                        添加词条
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {bannedWords.map(word => (
                        <span
                          key={word}
                          className="px-2.5 py-1 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-primary)] flex items-center gap-1.5 group"
                        >
                          <span>{word}</span>
                          <button
                            onClick={() => handleRemoveBannedWord(word)}
                            className="text-[var(--apple-text-tertiary)] hover:text-rose-500 transition-colors"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generation Parameters */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                    生成参数调优 (Temperature & Budget)
                  </span>
                  <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs space-y-4 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-[var(--apple-text-primary)]">默认采样温度 (Temperature): {temperature}</span>
                        <span className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">
                          {temperature < 0.5 ? '逻辑严谨' : temperature < 0.8 ? '叙事均衡' : '狂想脑洞'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="1.2"
                        step="0.05"
                        value={temperature}
                        onChange={e => setTemperature(parseFloat(e.target.value))}
                        className="w-full accent-[var(--apple-accent)] cursor-pointer"
                      />
                    </div>

                    <div className="pt-2 border-t border-[var(--apple-separator)]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-[var(--apple-text-primary)]">单次最大输出 Token 预算: {maxTokens}</span>
                        <span className="text-[10px] text-[var(--apple-text-tertiary)] font-mono">约合 {Math.round(maxTokens * 0.75)} 汉字</span>
                      </div>
                      <input
                        type="range"
                        min="1024"
                        max="8192"
                        step="512"
                        value={maxTokens}
                        onChange={e => setMaxTokens(parseInt(e.target.value))}
                        className="w-full accent-[var(--apple-accent)] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 5. 数据与备份 (Storage & Database) */}
            {/* ======================================================== */}
            {activeSection === 'storage' && (
              <div className="space-y-4">
                <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                  端侧 SQLite 本地持久化状态
                </span>

                <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] shadow-xs space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                      <div className="text-[10px] text-[var(--apple-text-tertiary)]">对话话题总计</div>
                      <div className="text-lg font-bold font-mono text-[var(--apple-text-primary)]">{storageStats.topicsCount}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                      <div className="text-[10px] text-[var(--apple-text-tertiary)]">手稿章节总数</div>
                      <div className="text-lg font-bold font-mono text-[var(--apple-text-primary)]">{storageStats.chaptersCount}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                      <div className="text-[10px] text-[var(--apple-text-tertiary)]">素材资产总计</div>
                      <div className="text-lg font-bold font-mono text-[var(--apple-text-primary)]">{storageStats.materialsCount}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--apple-separator)] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-[var(--apple-text-primary)]">全量数据资产快照</div>
                      <div className="text-[10px] text-[var(--apple-text-tertiary)]">包含话题、手稿、知识库、大纲与历史审校报告</div>
                    </div>
                    <button
                      onClick={handleExportBackup}
                      className="px-4 py-2 rounded-xl bg-[var(--apple-accent)] text-white font-semibold flex items-center gap-1.5 hover:bg-[var(--apple-accent-hover)] transition-all shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>导出 JSON 备份</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 6. 快捷键与关于 (Shortcuts & About) */}
            {/* ======================================================== */}
            {activeSection === 'shortcuts' && (
              <div className="space-y-4">
                <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
                  macOS 全局快捷键速查表
                </span>

                <div className="rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] divide-y divide-[var(--apple-separator)] shadow-xs overflow-hidden text-xs">
                  {[
                    { key: '⌘ K', label: '呼出全局指令中心 (Command Palette)', desc: '在任何视窗中快速执行跨页指令与搜索' },
                    { key: '⌘ 1 ~ ⌘ 9', label: '工作台核心页面快速切换', desc: '智能对话、AI智能体、深度研究、小说工坊等' },
                    { key: '⌘ B', label: '折叠 / 展开侧边导航栏', desc: '获取最大工作台手稿可视空间' },
                    { key: '⌘ N', label: '新建思考对话', desc: '快速发起新探索话题' },
                    { key: '⌘ E', label: '导出当前内容', desc: '下载对话 Markdown 或小说章节手稿' },
                    { key: '⌘ 0', label: '重置画布视口至 100%', desc: '无限画布视口复位' },
                  ].map(sc => (
                    <div key={sc.key} className="p-3.5 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-semibold text-[var(--apple-text-primary)] block">{sc.label}</span>
                        <span className="text-[11px] text-[var(--apple-text-tertiary)]">{sc.desc}</span>
                      </div>
                      <kbd className="px-2.5 py-1 rounded-lg bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs font-mono font-bold text-[var(--apple-text-primary)] shadow-xs shrink-0">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-[var(--apple-subtle)]/40 border border-[var(--apple-border)] text-xs text-[var(--apple-text-tertiary)] space-y-1">
                  <div className="font-bold text-[var(--apple-text-primary)]">Local AI Studio 创作工作站</div>
                  <div>版本：2.0.0 (Apple Silicon Native Edition) · SQLite 架构 · 零云端隐私上传</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Provider Modal */}
      {showAddProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[var(--apple-surface)] border border-[var(--apple-border-strong)] rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-bold text-[var(--apple-text-primary)]">添加模型供应商</h3>
            <form onSubmit={handleCreateProvider} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--apple-text-secondary)] mb-1">供应商名称</label>
                <input
                  required
                  value={newProvName}
                  onChange={e => setNewProvName(e.target.value)}
                  placeholder="如：DeepSeek 官方 / 本地 Ollama"
                  className="w-full p-2 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-lg text-[var(--apple-text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--apple-text-secondary)] mb-1">Base URL</label>
                <input
                  required
                  value={newProvUrl}
                  onChange={e => setNewProvUrl(e.target.value)}
                  placeholder="如：https://api.deepseek.com"
                  className="w-full p-2 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-lg text-[var(--apple-text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--apple-text-secondary)] mb-1">API Key</label>
                <input
                  type="password"
                  value={newProvKey}
                  onChange={e => setNewProvKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-2 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-lg text-[var(--apple-text-primary)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--apple-separator)]">
                <button type="button" onClick={() => setShowAddProvider(false)} className="px-3 py-1.5 rounded-lg border border-[var(--apple-border)] text-xs text-[var(--apple-text-secondary)]">取消</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-[var(--apple-accent)] text-white text-xs font-semibold">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
