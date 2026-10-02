import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Search, 
  Layers, 
  BookOpen, 
  Zap, 
  Skull, 
  Compass, 
  Lock, 
  Pin, 
  Check, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Flame, 
  Activity, 
  Eye, 
  Cpu, 
  Tag, 
  Sliders, 
  Crown,
  ChevronRight,
  Clock,
  LayoutGrid,
  List,
  Copy,
  Globe,
  AlertTriangle,
  X,
  SlidersHorizontal,
  Bookmark,
  CheckSquare,
  Square,
  Filter,
  CheckCircle2,
  RefreshCw,
  FolderPlus,
  ArrowUpDown
} from 'lucide-react';
import { LoreEntry, LoreType, LoreSpecs } from './novel_types.ts';
import { PowerIndexChart } from './PowerIndexChart.tsx';

interface WorldMatrixViewProps {
  loreEntries: LoreEntry[];
  onUpdateLore: (entry: LoreEntry) => void;
  onAddLore: (entry: LoreEntry) => void;
  onDeleteLore: (id: string) => void;
}

export const WorldMatrixView: React.FC<WorldMatrixViewProps> = ({
  loreEntries,
  onUpdateLore,
  onAddLore,
  onDeleteLore
}) => {
  // Navigation & Filtering state
  const [activeCategory, setActiveCategory] = useState<LoreType | 'all'>('realm');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'alwaysOn' | 'dynamic'>('all');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'normal'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('grid');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showPowerChart, setShowPowerChart] = useState(true);

  // Batch Selection & Bulk Edit state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkAlwaysOn, setBulkAlwaysOn] = useState<boolean | null>(null);
  const [bulkPriority, setBulkPriority] = useState<number | null>(null);
  const [bulkAppendKeyword, setBulkAppendKeyword] = useState('');
  const [bulkOwnerName, setBulkOwnerName] = useState('');
  const [bulkDurability, setBulkDurability] = useState('');

  // Modal / Edit state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeFormEntry, setActiveFormEntry] = useState<LoreEntry | null>(null);

  // Form fields
  const [formType, setFormType] = useState<LoreType>('realm');
  const [formName, setFormName] = useState('');
  const [formAliases, setFormAliases] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formAlwaysOn, setFormAlwaysOn] = useState(false);
  const [formPriority, setFormPriority] = useState(5);
  const [formContent, setFormContent] = useState('');
  
  // Specs form fields
  const [specRealmRank, setSpecRealmRank] = useState(1);
  const [specLifespan, setSpecLifespan] = useState('');
  const [specPowerScale, setSpecPowerScale] = useState('');
  const [specDivineSense, setSpecDivineSense] = useState('');
  const [specInviolableLaw, setSpecInviolableLaw] = useState('');
  const [specTechniqueCategory, setSpecTechniqueCategory] = useState<'主修心法' | '遁术身法' | '攻击秘法' | '禁忌禁术'>('主修心法');
  const [specPrerequisite, setSpecPrerequisite] = useState('');
  const [specResourceCost, setSpecResourceCost] = useState('');
  const [specCostAndBacklash, setSpecCostAndBacklash] = useState('');
  const [specRarity, setSpecRarity] = useState<'凡品' | '灵品' | '地阶神兵' | '天地孤品' | '禁忌奇物'>('灵品');
  const [specOwnerName, setSpecOwnerName] = useState('');
  const [specDurability, setSpecDurability] = useState('完好');

  // Category counts
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {
      all: loreEntries.length,
      realm: 0,
      technique: 0,
      artifact: 0,
      faction: 0,
      cosmology: 0,
      rule: 0
    };
    loreEntries.forEach(e => {
      if (stats[e.type] !== undefined) stats[e.type]++;
    });
    return stats;
  }, [loreEntries]);

  // Extract top popular tags for quick cloud filtering
  const popularTags = useMemo(() => {
    const tagSet = new Set<string>();
    loreEntries.forEach(e => {
      e.keywords.forEach(k => tagSet.add(k));
      e.aliases.forEach(a => tagSet.add(a));
      if (e.specs.ownerName) tagSet.add(`持有:${e.specs.ownerName}`);
      if (e.specs.techniqueCategory) tagSet.add(e.specs.techniqueCategory);
      if (e.specs.rarity) tagSet.add(e.specs.rarity);
    });
    return Array.from(tagSet).slice(0, 10);
  }, [loreEntries]);

  // Filtered entries based on real-time React states
  const filteredEntries = useMemo(() => {
    return loreEntries.filter(e => {
      // 1. Category filter
      const matchCat = activeCategory === 'all' || e.type === activeCategory;
      if (!matchCat) return false;

      // 2. Status filter
      if (statusFilter === 'alwaysOn' && !e.alwaysOn) return false;
      if (statusFilter === 'dynamic' && e.alwaysOn) return false;

      // 3. Priority filter
      if (priorityFilter === 'high' && e.priority < 8) return false;
      if (priorityFilter === 'normal' && e.priority >= 8) return false;

      // 4. Tag filter
      if (activeTagFilter) {
        const hasKeyword = e.keywords.includes(activeTagFilter);
        const hasAlias = e.aliases.includes(activeTagFilter);
        const hasOwner = activeTagFilter.startsWith('持有:') && e.specs.ownerName === activeTagFilter.replace('持有:', '');
        const hasTech = e.specs.techniqueCategory === activeTagFilter;
        const hasRarity = e.specs.rarity === activeTagFilter;
        if (!hasKeyword && !hasAlias && !hasOwner && !hasTech && !hasRarity) return false;
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = e.name.toLowerCase().includes(q);
        const matchContent = e.content.toLowerCase().includes(q);
        const matchAliases = e.aliases.some(a => a.toLowerCase().includes(q));
        const matchKeywords = e.keywords.some(k => k.toLowerCase().includes(q));
        const matchPower = e.specs.powerScale && e.specs.powerScale.toLowerCase().includes(q);
        const matchOwner = e.specs.ownerName && e.specs.ownerName.toLowerCase().includes(q);
        const matchLaw = e.specs.inviolableLaw && e.specs.inviolableLaw.toLowerCase().includes(q);
        if (!matchName && !matchContent && !matchAliases && !matchKeywords && !matchPower && !matchOwner && !matchLaw) {
          return false;
        }
      }

      return true;
    });
  }, [loreEntries, activeCategory, statusFilter, priorityFilter, activeTagFilter, searchQuery]);

  // Sorted realm ladder
  const realmLadder = useMemo(() => {
    return loreEntries
      .filter(e => e.type === 'realm')
      .sort((a, b) => (a.specs.realmRank || 0) - (b.specs.realmRank || 0));
  }, [loreEntries]);

  const activeEntry = useMemo(() => {
    if (selectedEntryId) {
      return loreEntries.find(e => e.id === selectedEntryId) || filteredEntries[0] || null;
    }
    return filteredEntries[0] || null;
  }, [loreEntries, selectedEntryId, filteredEntries]);

  // Batch Selection Handlers
  const handleToggleSelectEntry = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedIds.size === filteredEntries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEntries.map(e => e.id)));
    }
  };

  // Bulk Edit Execution
  const handleExecuteBulkEdit = () => {
    if (selectedIds.size === 0) return;

    loreEntries.forEach(entry => {
      if (selectedIds.has(entry.id)) {
        let updated: LoreEntry = { ...entry };

        if (bulkAlwaysOn !== null) {
          updated.alwaysOn = bulkAlwaysOn;
        }
        if (bulkPriority !== null) {
          updated.priority = bulkPriority;
        }
        if (bulkAppendKeyword.trim()) {
          const kw = bulkAppendKeyword.trim();
          if (!updated.keywords.includes(kw)) {
            updated.keywords = [...updated.keywords, kw];
          }
        }
        if (bulkOwnerName.trim()) {
          updated.specs = { ...updated.specs, ownerName: bulkOwnerName.trim() };
        }
        if (bulkDurability.trim()) {
          updated.specs = { ...updated.specs, durability: bulkDurability.trim() };
        }

        onUpdateLore(updated);
      }
    });

    setIsBulkEditModalOpen(false);
    setBulkAlwaysOn(null);
    setBulkPriority(null);
    setBulkAppendKeyword('');
    setBulkOwnerName('');
    setBulkDurability('');
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    selectedIds.forEach(id => {
      onDeleteLore(id);
    });
    setSelectedIds(new Set());
  };

  // Bulk Toggle Always On
  const handleBulkToggleAlwaysOn = (targetState: boolean) => {
    loreEntries.forEach(entry => {
      if (selectedIds.has(entry.id)) {
        onUpdateLore({ ...entry, alwaysOn: targetState });
      }
    });
  };

  // Jump to realm card from PowerIndexChart
  const handleSelectRealmFromChart = (realmId: string) => {
    setSelectedEntryId(realmId);
    setActiveCategory('realm');
    
    // Smooth scroll to the target card
    setTimeout(() => {
      const el = document.getElementById(`lore_card_${realmId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  // Open Create Modal
  const handleOpenCreateModal = (typeToCreate?: LoreType) => {
    const targetType = typeToCreate || (activeCategory === 'all' ? 'realm' : activeCategory);
    setFormType(targetType);
    setFormName('');
    setFormAliases('');
    setFormKeywords('');
    setFormAlwaysOn(targetType === 'rule');
    setFormPriority(5);
    setFormContent('');
    
    // Reset Specs
    setSpecRealmRank(targetType === 'realm' ? (realmLadder.length + 1) : 1);
    setSpecLifespan(targetType === 'realm' ? '120年' : '');
    setSpecPowerScale(targetType === 'realm' ? '徒手碎石 · 极限爆发' : '');
    setSpecDivineSense(targetType === 'realm' ? '十丈方圆' : '');
    setSpecInviolableLaw('');
    setSpecTechniqueCategory('主修心法');
    setSpecPrerequisite('');
    setSpecResourceCost('');
    setSpecCostAndBacklash('');
    setSpecRarity('地阶神兵');
    setSpecOwnerName('');
    setSpecDurability('完好');

    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (entry: LoreEntry) => {
    setActiveFormEntry(entry);
    setFormType(entry.type);
    setFormName(entry.name);
    setFormAliases(entry.aliases.join(', '));
    setFormKeywords(entry.keywords.join(', '));
    setFormAlwaysOn(entry.alwaysOn);
    setFormPriority(entry.priority);
    setFormContent(entry.content);

    // Specs
    setSpecRealmRank(entry.specs.realmRank || 1);
    setSpecLifespan(entry.specs.lifespanLimit || '');
    setSpecPowerScale(entry.specs.powerScale || '');
    setSpecDivineSense(entry.specs.divineSenseRadius || '');
    setSpecInviolableLaw(entry.specs.inviolableLaw || '');
    setSpecTechniqueCategory(entry.specs.techniqueCategory || '主修心法');
    setSpecPrerequisite(entry.specs.prerequisite || '');
    setSpecResourceCost(entry.specs.resourceCost || '');
    setSpecCostAndBacklash(entry.specs.costAndBacklash || '');
    setSpecRarity(entry.specs.rarity || '地阶神兵');
    setSpecOwnerName(entry.specs.ownerName || '');
    setSpecDurability(entry.specs.durability || '完好');

    setIsEditModalOpen(true);
  };

  // Save Create
  const handleSaveCreate = () => {
    if (!formName.trim()) return;

    const specs: LoreSpecs = {};
    if (formType === 'realm') {
      specs.realmRank = specRealmRank;
      specs.lifespanLimit = specLifespan.trim();
      specs.powerScale = specPowerScale.trim();
      specs.divineSenseRadius = specDivineSense.trim();
      specs.inviolableLaw = specInviolableLaw.trim();
    } else if (formType === 'technique') {
      specs.techniqueCategory = specTechniqueCategory;
      specs.prerequisite = specPrerequisite.trim();
      specs.resourceCost = specResourceCost.trim();
      specs.costAndBacklash = specCostAndBacklash.trim();
    } else if (formType === 'artifact') {
      specs.rarity = specRarity;
      specs.ownerName = specOwnerName.trim();
      specs.durability = specDurability;
      specs.status = specDurability as any;
    } else if (formType === 'rule') {
      specs.inviolableLaw = specInviolableLaw.trim();
    }

    const newEntry: LoreEntry = {
      id: `lore_${Date.now()}`,
      novelId: 'project_star_sequence',
      type: formType,
      name: formName.trim(),
      aliases: formAliases.split(',').map(s => s.trim()).filter(Boolean),
      keywords: formKeywords.split(',').map(s => s.trim()).filter(Boolean),
      alwaysOn: formAlwaysOn,
      priority: formPriority,
      specs,
      content: formContent.trim() || '正文描写参考与因果律约束说明...'
    };

    onAddLore(newEntry);
    setSelectedEntryId(newEntry.id);
    setIsCreateModalOpen(false);
  };

  // Save Edit
  const handleSaveEdit = () => {
    if (!activeFormEntry || !formName.trim()) return;

    const specs: LoreSpecs = { ...activeFormEntry.specs };
    if (formType === 'realm') {
      specs.realmRank = specRealmRank;
      specs.lifespanLimit = specLifespan.trim();
      specs.powerScale = specPowerScale.trim();
      specs.divineSenseRadius = specDivineSense.trim();
      specs.inviolableLaw = specInviolableLaw.trim();
    } else if (formType === 'technique') {
      specs.techniqueCategory = specTechniqueCategory;
      specs.prerequisite = specPrerequisite.trim();
      specs.resourceCost = specResourceCost.trim();
      specs.costAndBacklash = specCostAndBacklash.trim();
    } else if (formType === 'artifact') {
      specs.rarity = specRarity;
      specs.ownerName = specOwnerName.trim();
      specs.durability = specDurability;
      specs.status = specDurability as any;
    } else if (formType === 'rule') {
      specs.inviolableLaw = specInviolableLaw.trim();
    }

    const updated: LoreEntry = {
      ...activeFormEntry,
      type: formType,
      name: formName.trim(),
      aliases: formAliases.split(',').map(s => s.trim()).filter(Boolean),
      keywords: formKeywords.split(',').map(s => s.trim()).filter(Boolean),
      alwaysOn: formAlwaysOn,
      priority: formPriority,
      specs,
      content: formContent.trim()
    };

    onUpdateLore(updated);
    setIsEditModalOpen(false);
  };

  // Toggle Always On directly
  const handleToggleAlwaysOn = (entry: LoreEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateLore({
      ...entry,
      alwaysOn: !entry.alwaysOn
    });
  };

  // Duplicate entry
  const handleDuplicateEntry = (entry: LoreEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const dup: LoreEntry = {
      ...entry,
      id: `lore_${Date.now()}`,
      name: `${entry.name} (副本)`,
      alwaysOn: false
    };
    onAddLore(dup);
    setSelectedEntryId(dup.id);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[var(--apple-bg)] select-none font-sans relative">
      
      {/* ------------------------------------------------------------ */}
      {/* 1. LEFT SIDEBAR: CATEGORIES & HIERARCHY LADDER               */}
      {/* ------------------------------------------------------------ */}
      <aside className="w-full md:w-64 border-r border-[var(--apple-border)] bg-[var(--apple-surface)]/80 backdrop-blur-xl flex flex-col shrink-0 z-10">
        
        {/* Header & Quick Create */}
        <div className="p-3.5 border-b border-[var(--apple-separator)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>寰宇世界观法则矩阵</span>
            </span>
            <button
              onClick={() => handleOpenCreateModal()}
              className="px-2 py-1 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer"
              title="新建世界观条目"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3 h-3 text-[var(--apple-text-tertiary)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索境界、功法、法宝、法则..."
              className="w-full h-8 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl pl-7 pr-2.5 text-xs text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Categories Navigation List */}
        <nav className="p-2 space-y-1 text-xs">
          {[
            { id: 'all' as const, label: '全部设定矩阵', icon: Layers, count: categoryStats.all, color: 'text-zinc-400' },
            { id: 'realm' as const, label: '🏆 修行境界体系', icon: Crown, count: categoryStats.realm, color: 'text-amber-500' },
            { id: 'technique' as const, label: '⚡ 功法神通谱系', icon: Flame, count: categoryStats.technique, color: 'text-red-500' },
            { id: 'artifact' as const, label: '🛡️ 天材神兵法宝', icon: ShieldCheck, count: categoryStats.artifact, color: 'text-blue-500' },
            { id: 'faction' as const, label: '🏛️ 宗门与势力网', icon: Compass, count: categoryStats.faction, color: 'text-purple-500' },
            { id: 'cosmology' as const, label: '🌌 时空纪元背景', icon: Globe, count: categoryStats.cosmology, color: 'text-indigo-400' },
            { id: 'rule' as const, label: '📜 天道核心法则', icon: Pin, count: categoryStats.rule, color: 'text-emerald-500' },
          ].map(cat => {
            const Icon = cat.icon;
            const isSel = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setActiveTagFilter(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                  isSel
                    ? 'bg-[var(--apple-accent)] text-white font-semibold shadow-xs'
                    : 'text-[var(--apple-text-secondary)] hover:bg-[var(--apple-subtle)] hover:text-[var(--apple-text-primary)]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-white' : cat.color}`} />
                  <span>{cat.label}</span>
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${isSel ? 'bg-white/20 text-white' : 'bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)]'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Realm Ladder Mini Preview */}
        {activeCategory === 'realm' && realmLadder.length > 0 && (
          <div className="p-3 border-t border-[var(--apple-separator)] mt-auto space-y-2">
            <div className="text-[10px] font-mono text-[var(--apple-text-tertiary)] uppercase font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>战力天梯阶位 (Ladder)</span>
            </div>
            <div className="space-y-1 max-h-44 overflow-y-auto">
              {realmLadder.map(r => (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedEntryId(r.id);
                    setViewMode('split');
                  }}
                  className={`p-1.5 rounded-lg text-[11px] font-mono flex items-center justify-between cursor-pointer transition ${
                    activeEntry?.id === r.id
                      ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                      : 'hover:bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)]'
                  }`}
                >
                  <span className="truncate">Rank {r.specs.realmRank} · {r.name.split('·')[0]}</span>
                  <span className="text-[9px] opacity-70 shrink-0">{r.specs.powerScale?.slice(0, 4)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </aside>

      {/* ------------------------------------------------------------ */}
      {/* 2. MAIN VIEWPORT: TOOLBAR, TAG CLOUD & CARDS                */}
      {/* ------------------------------------------------------------ */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[var(--apple-bg)]">
        
        {/* Top Control Filter Ribbon */}
        <div className="px-6 py-3 border-b border-[var(--apple-separator)] bg-[var(--apple-surface)]/60 backdrop-blur-xl space-y-2.5 shrink-0">
          
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left: Category Title & Multi-Select Status */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-[var(--apple-text-primary)]">
                {activeCategory === 'all' ? '全部设定总览' : 
                 activeCategory === 'realm' ? '修行境界体系' :
                 activeCategory === 'technique' ? '功法神通谱系' :
                 activeCategory === 'artifact' ? '天材神兵法宝库' :
                 activeCategory === 'faction' ? '宗门势力与阵营' :
                 activeCategory === 'cosmology' ? '时空背景与纪元' : '天道法则与物理定律'}
              </span>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)]">
                匹配 {filteredEntries.length} 条设定
              </span>

              {/* Select All Checkbox Button */}
              <button
                onClick={handleSelectAllFiltered}
                className="px-2.5 py-1 rounded-lg bg-[var(--apple-subtle)] hover:bg-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border border-[var(--apple-border)]"
              >
                {selectedIds.size > 0 && selectedIds.size === filteredEntries.length ? (
                  <CheckSquare className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-zinc-500" />
                )}
                <span>{selectedIds.size > 0 ? `已选 ${selectedIds.size} 项` : '全选'}</span>
              </button>
            </div>

            {/* Right: Real-Time State Filters & View Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Top Search Input Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--apple-text-tertiary)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索名称、别名或标签..."
                  className="w-44 lg:w-56 h-8 bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-xl pl-8 pr-7 text-xs text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)] transition font-sans"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/10"
                    title="清除搜索"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Injection Status Filter */}
              <div className="flex items-center p-0.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[11px]">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2 py-1 rounded-lg transition ${statusFilter === 'all' ? 'bg-[var(--apple-surface)] text-[var(--apple-text-primary)] font-bold shadow-xs' : 'text-zinc-400'}`}
                >
                  全部注入
                </button>
                <button
                  onClick={() => setStatusFilter('alwaysOn')}
                  className={`px-2 py-1 rounded-lg transition ${statusFilter === 'alwaysOn' ? 'bg-emerald-500/20 text-emerald-400 font-bold shadow-xs' : 'text-zinc-400'}`}
                >
                  ★ 强制必注
                </button>
                <button
                  onClick={() => setStatusFilter('dynamic')}
                  className={`px-2 py-1 rounded-lg transition ${statusFilter === 'dynamic' ? 'bg-blue-500/20 text-blue-400 font-bold shadow-xs' : 'text-zinc-400'}`}
                >
                  关键词触发
                </button>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center p-0.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[11px]">
                <button
                  onClick={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
                  className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${priorityFilter === 'high' ? 'bg-amber-500/20 text-amber-400 font-bold shadow-xs' : 'text-zinc-400'}`}
                  title="高优先级设定 (P8-P10)"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span>高优先级</span>
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center p-0.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-[var(--apple-surface)] text-[var(--apple-text-primary)] shadow-xs' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="卡片网格矩阵模式"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`p-1.5 rounded-lg transition ${viewMode === 'split' ? 'bg-[var(--apple-surface)] text-[var(--apple-text-primary)] shadow-xs' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="分栏透视检查模式"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => handleOpenCreateModal()}
                className="px-3 py-1.5 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新建设定</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Tag Cloud */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-[10px] font-mono">
            <span className="text-zinc-500 shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>快速标签定位:</span>
            </span>

            {activeTagFilter && (
              <button
                onClick={() => setActiveTagFilter(null)}
                className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 shrink-0 font-bold"
              >
                <span>清除标签: {activeTagFilter}</span>
                <X className="w-3 h-3" />
              </button>
            )}

            {popularTags.map(tag => {
              const isSelected = activeTagFilter === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTagFilter(isSelected ? null : tag)}
                  className={`px-2 py-0.5 rounded-md transition shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--apple-accent)] text-white font-bold shadow-xs'
                      : 'bg-[var(--apple-subtle)] text-zinc-400 hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-border)] border border-[var(--apple-border)]'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>

        </div>

        {/* Content Area */}
        {viewMode === 'grid' ? (
          /* ========================================================== */
          /* 2.1 GRID CARDS VIEW                                        */
          /* ========================================================== */
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 pb-24">
            
            {/* 战力指数与寿元分布图 (Recharts Power Scale Distribution Chart) */}
            {(activeCategory === 'realm' || activeCategory === 'all') && realmLadder.length > 0 && showPowerChart && (
              <PowerIndexChart
                realmEntries={realmLadder}
                selectedRealmId={selectedEntryId}
                onSelectRealm={handleSelectRealmFromChart}
              />
            )}

            {filteredEntries.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-500">
                <Layers className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-xs">暂无符合实时搜索与标签条件的设定条目</p>
                <div className="flex items-center gap-2 mt-3">
                  {(searchQuery || activeTagFilter || statusFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveTagFilter(null);
                        setStatusFilter('all');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs text-[var(--apple-text-secondary)]"
                    >
                      重置搜索与过滤
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenCreateModal()}
                    className="px-3 py-1.5 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold"
                  >
                    创建新设定
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredEntries.map(entry => {
                  const isRealm = entry.type === 'realm';
                  const isTechnique = entry.type === 'technique';
                  const isArtifact = entry.type === 'artifact';
                  const isRule = entry.type === 'rule';
                  const isSelected = selectedIds.has(entry.id);

                  const isHighlighted = selectedEntryId === entry.id;

                  return (
                    <div 
                      key={entry.id}
                      id={`lore_card_${entry.id}`}
                      onClick={() => {
                        setSelectedEntryId(entry.id);
                        handleToggleSelectEntry(entry.id);
                      }}
                      className={`p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between space-y-4 group relative overflow-hidden cursor-pointer ${
                        isHighlighted
                          ? 'bg-[var(--apple-surface)] border-amber-400 ring-4 ring-amber-400/30 shadow-xl'
                          : isSelected 
                          ? 'bg-[var(--apple-surface)] border-[var(--apple-accent)] ring-2 ring-[var(--apple-accent)]/40 shadow-md'
                          : 'bg-[var(--apple-surface)] border-[var(--apple-border)] hover:border-[var(--apple-border-strong)]'
                      }`}
                    >
                      {/* Top Checkbox, Badges & Title */}
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              onClick={(e) => handleToggleSelectEntry(entry.id, e)}
                              className={`p-1 rounded-lg border transition shrink-0 ${
                                isSelected ? 'bg-[var(--apple-accent)] text-white border-[var(--apple-accent)]' : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-transparent hover:border-zinc-400'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                            </button>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-xs font-bold text-[var(--apple-text-primary)]">
                                {entry.name}
                              </h3>
                              {entry.alwaysOn && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                                  必注
                                </span>
                              )}
                            </div>
                          </div>

                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md uppercase font-bold shrink-0 ${
                            isRealm ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            isTechnique ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            isArtifact ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            isRule ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {entry.type}
                          </span>
                        </div>

                        {/* Specs Grid */}
                        <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[11px] space-y-1.5">
                          {isRealm && (
                            <>
                              <div className="flex justify-between text-zinc-400">
                                <span>境界天梯位阶:</span>
                                <b className="text-amber-400 font-mono">Rank {entry.specs.realmRank}</b>
                              </div>
                              <div className="flex justify-between text-zinc-400">
                                <span>寿元极限:</span>
                                <b className="text-[var(--apple-text-primary)]">{entry.specs.lifespanLimit || '未指定'}</b>
                              </div>
                              <div className="flex justify-between text-zinc-400">
                                <span>破坏力尺度:</span>
                                <b className="text-[var(--apple-text-primary)] truncate max-w-[140px]">{entry.specs.powerScale || '未指定'}</b>
                              </div>
                              {entry.specs.inviolableLaw && (
                                <div className="pt-1 border-t border-[var(--apple-separator)] text-[10px] text-rose-400 leading-tight">
                                  <b>防线法则:</b> {entry.specs.inviolableLaw}
                                </div>
                              )}
                            </>
                          )}

                          {isTechnique && (
                            <>
                              <div className="flex justify-between text-zinc-400">
                                <span>功法分类:</span>
                                <b className="text-red-400">{entry.specs.techniqueCategory || '心法'}</b>
                              </div>
                              {entry.specs.prerequisite && (
                                <div className="text-[10px] text-zinc-300">
                                  <span className="text-zinc-500">前置门槛:</span> {entry.specs.prerequisite}
                                </div>
                              )}
                              {entry.specs.costAndBacklash && (
                                <div className="text-[10px] text-purple-400">
                                  <span className="text-zinc-500">消耗反噬:</span> {entry.specs.costAndBacklash}
                                </div>
                              )}
                            </>
                          )}

                          {isArtifact && (
                            <>
                              <div className="flex justify-between text-zinc-400">
                                <span>法宝品阶:</span>
                                <b className="text-blue-400">{entry.specs.rarity || '地阶神兵'}</b>
                              </div>
                              <div className="flex justify-between text-zinc-400">
                                <span>当前持有者:</span>
                                <b className="text-[var(--apple-text-primary)]">{entry.specs.ownerName || '天地无主'}</b>
                              </div>
                              <div className="flex justify-between text-zinc-400">
                                <span>状态:</span>
                                <b className="text-emerald-400">{entry.specs.durability || '完好'}</b>
                              </div>
                            </>
                          )}

                          {!isRealm && !isTechnique && !isArtifact && (
                            <div className="text-[10px] text-zinc-300 leading-relaxed">
                              优先级: P{entry.priority} · 别名: {entry.aliases.join(', ') || '无'}
                            </div>
                          )}
                        </div>

                        {/* Content text */}
                        <p className="text-[11px] text-[var(--apple-text-secondary)] line-clamp-3 leading-relaxed">
                          {entry.content}
                        </p>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="pt-2 border-t border-[var(--apple-separator)] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--apple-text-tertiary)]">
                          <button
                            onClick={(e) => handleToggleAlwaysOn(entry, e)}
                            className={`px-2 py-0.5 rounded cursor-pointer transition ${
                              entry.alwaysOn ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'hover:bg-white/5'
                            }`}
                            title="切换正文生成是否强制注入此设定"
                          >
                            {entry.alwaysOn ? '★ 强制必注' : '☆ 触发注入'}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(entry);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)] transition"
                            title="编辑此设定"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDuplicateEntry(entry, e)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                            title="复制副本"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteLore(entry.id);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="删除设定"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        ) : (
          /* ========================================================== */
          /* 2.2 SPLIT LIST & INSPECTOR VIEW                            */
          /* ========================================================== */
          <div className="flex-1 flex overflow-hidden">
            {/* List */}
            <div className="w-80 border-r border-[var(--apple-border)] overflow-y-auto p-3 space-y-2">
              {filteredEntries.map(entry => {
                const isSelected = activeEntry?.id === entry.id;
                const isChecked = selectedIds.has(entry.id);
                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntryId(entry.id)}
                    className={`p-3 rounded-2xl border transition cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-[var(--apple-surface)] border-[var(--apple-accent)] ring-1 ring-[var(--apple-accent)]/30'
                        : 'bg-[var(--apple-surface)]/60 border-[var(--apple-border)] hover:border-[var(--apple-border-strong)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleToggleSelectEntry(entry.id, e)}
                          className={`p-0.5 rounded border transition shrink-0 ${
                            isChecked ? 'bg-[var(--apple-accent)] text-white border-[var(--apple-accent)]' : 'border-zinc-500'
                          }`}
                        >
                          <Check className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-bold text-[var(--apple-text-primary)] truncate">{entry.name}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)] uppercase">{entry.type}</span>
                    </div>
                    <p className="text-[11px] text-[var(--apple-text-secondary)] line-clamp-2 leading-relaxed">{entry.content}</p>
                  </div>
                );
              })}
            </div>

            {/* Inspector */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5">
              {activeEntry ? (
                <div className="max-w-2xl mx-auto space-y-5">
                  <div className="flex items-center justify-between border-b border-[var(--apple-separator)] pb-3">
                    <div>
                      <h2 className="text-base font-bold text-[var(--apple-text-primary)]">{activeEntry.name}</h2>
                      <div className="text-xs text-[var(--apple-text-tertiary)] flex items-center gap-2 mt-0.5 font-mono">
                        <span>别名: {activeEntry.aliases.join(', ') || '无'}</span>
                        <span>·</span>
                        <span>优先级: P{activeEntry.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(activeEntry)}
                        className="px-3 py-1.5 rounded-xl bg-[var(--apple-surface)] hover:bg-[var(--apple-border)] border border-[var(--apple-border)] text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>编辑规范</span>
                      </button>
                      <button
                        onClick={() => onDeleteLore(activeEntry.id)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Specs Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-1">
                      <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)] uppercase font-semibold">破坏力尺度 / 规格</span>
                      <p className="text-xs font-bold text-[var(--apple-text-primary)]">{activeEntry.specs.powerScale || '常规单体'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-red-500/20 space-y-1 bg-red-500/[0.02]">
                      <span className="text-[10px] font-mono text-red-400 uppercase font-bold">不可逾越法则</span>
                      <p className="text-[11px] text-zinc-300">{activeEntry.specs.inviolableLaw || '跨阶战斗无特殊免伤'}</p>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="p-5 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-2">
                    <span className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                      <span>正文生成指引与详细设定内容</span>
                    </span>
                    <p className="text-xs text-[var(--apple-text-secondary)] leading-relaxed whitespace-pre-wrap">{activeEntry.content}</p>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-zinc-500 text-xs">请在左侧选择设定条目</div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ============================================================ */}
      {/* FLOATING GLASS BATCH ACTIONS DOCK (WHEN ITEMS SELECTED)      */}
      {/* ============================================================ */}
      {selectedIds.size > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#16161a]/90 border border-white/20 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-2xl flex items-center gap-4 text-xs animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 border-r border-white/15 pr-4">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--apple-accent)] animate-pulse" />
            <span className="font-bold text-white">已选中 {selectedIds.size} 项设定</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkToggleAlwaysOn(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Pin className="w-3.5 h-3.5" />
              <span>全部设为必注</span>
            </button>

            <button
              onClick={() => handleBulkToggleAlwaysOn(false)}
              className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>设为动态触发</span>
            </button>

            <button
              onClick={() => setIsBulkEditModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] hover:bg-[var(--apple-border)] text-white border border-white/20 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
              <span>批量修改属性</span>
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>批量删除</span>
            </button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition"
              title="取消选择"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: BULK EDIT SETTINGS MODAL                             */}
      {/* ============================================================ */}
      {isBulkEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--apple-surface)] border border-[var(--apple-border-strong)] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--apple-separator)] pb-3">
              <h3 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[var(--apple-accent)]" />
                <span>批量修改已选中的 {selectedIds.size} 项设定</span>
              </h3>
              <button onClick={() => setIsBulkEditModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">全局强制注入状态 (Always On)</label>
                <select
                  value={bulkAlwaysOn === null ? 'keep' : bulkAlwaysOn ? 'true' : 'false'}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'keep') setBulkAlwaysOn(null);
                    else setBulkAlwaysOn(val === 'true');
                  }}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                >
                  <option value="keep">保持原设定不变</option>
                  <option value="true">统一变更为：★ 强制必注 (Always On)</option>
                  <option value="false">统一变更为：☆ 关键词匹配动态触发</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">裁剪优先级 (Priority 1-10)</label>
                <select
                  value={bulkPriority === null ? 'keep' : bulkPriority}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'keep') setBulkPriority(null);
                    else setBulkPriority(parseInt(val));
                  }}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                >
                  <option value="keep">保持原优先级不变</option>
                  <option value="10">P10 - 绝对最高优先级 (不可裁剪)</option>
                  <option value="8">P8 - 核心设定 (优先保留)</option>
                  <option value="5">P5 - 常规设定</option>
                  <option value="2">P2 - 细微情调设定 (超限优先裁剪)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">统一追加触发关键词</label>
                <input
                  type="text"
                  placeholder="输入要为所选条目追加的关键词 (如：深渊纪元)"
                  value={bulkAppendKeyword}
                  onChange={e => setBulkAppendKeyword(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">统一绑定持有者姓名</label>
                <input
                  type="text"
                  placeholder="留空则保持原持有者不变 (如：林巡)"
                  value={bulkOwnerName}
                  onChange={e => setBulkOwnerName(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--apple-separator)]">
              <button
                onClick={() => setIsBulkEditModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleExecuteBulkEdit}
                className="px-4 py-1.5 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-xs font-semibold"
              >
                确认应用修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: CREATE NEW LORE ENTRY                               */}
      {/* ============================================================ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--apple-surface)] border border-[var(--apple-border-strong)] rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--apple-separator)] pb-3">
              <h3 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--apple-accent)]" />
                <span>新建世界观设定条目 (Lore Entry)</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">设定分类</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as LoreType)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  >
                    <option value="realm">🏆 修行境界体系 (Realm)</option>
                    <option value="technique">⚡ 功法神通谱系 (Technique)</option>
                    <option value="artifact">🛡️ 天材神兵法宝 (Artifact)</option>
                    <option value="faction">🏛️ 宗门与势力架构 (Faction)</option>
                    <option value="cosmology">🌌 时空背景纪元 (Cosmology)</option>
                    <option value="rule">📜 天道核心法则 (Rule)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">设定名称</label>
                  <input
                    type="text"
                    placeholder="如：三阶 · 虚空构装者"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  />
                </div>
              </div>

              {/* Dynamic Specs based on formType */}
              {formType === 'realm' && (
                <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-2.5">
                  <span className="text-[10px] font-bold text-amber-400 block uppercase">境界专有硬属性 (Realm Specs)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">阶梯序号 (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={specRealmRank}
                        onChange={e => setSpecRealmRank(parseInt(e.target.value) || 1)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">寿元极限</label>
                      <input
                        type="text"
                        placeholder="如：300年"
                        value={specLifespan}
                        onChange={e => setSpecLifespan(e.target.value)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">神识覆盖</label>
                      <input
                        type="text"
                        placeholder="如：方圆百里"
                        value={specDivineSense}
                        onChange={e => setSpecDivineSense(e.target.value)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">破坏力尺度</label>
                    <input
                      type="text"
                      placeholder="如：拳力千吨 · 徒手崩山"
                      value={specPowerScale}
                      onChange={e => setSpecPowerScale(e.target.value)}
                      className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-rose-400 mb-0.5">不可逾越法则 (战力防线)</label>
                    <input
                      type="text"
                      placeholder="如：高一阶神识压制绝对致盲，除非佩戴灭魂玉"
                      value={specInviolableLaw}
                      onChange={e => setSpecInviolableLaw(e.target.value)}
                      className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-rose-500/30 p-1.5 text-white"
                    />
                  </div>
                </div>
              )}

              {formType === 'technique' && (
                <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-2.5">
                  <span className="text-[10px] font-bold text-red-400 block uppercase">功法神通元数据 (Technique Specs)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">功法类别</label>
                      <select
                        value={specTechniqueCategory}
                        onChange={e => setSpecTechniqueCategory(e.target.value as any)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      >
                        <option value="主修心法">主修心法</option>
                        <option value="遁术身法">遁术身法</option>
                        <option value="攻击秘法">攻击秘法</option>
                        <option value="禁忌禁术">禁忌禁术</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">施法资源消耗</label>
                      <input
                        type="text"
                        placeholder="如：每次消耗40%灵核"
                        value={specResourceCost}
                        onChange={e => setSpecResourceCost(e.target.value)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">修炼前置门槛</label>
                    <input
                      type="text"
                      placeholder="如：需身怀太古逆熵骨"
                      value={specPrerequisite}
                      onChange={e => setSpecPrerequisite(e.target.value)}
                      className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-purple-400 mb-0.5">施法代价与反噬</label>
                    <input
                      type="text"
                      placeholder="如：施展后折损半年寿元"
                      value={specCostAndBacklash}
                      onChange={e => setSpecCostAndBacklash(e.target.value)}
                      className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-purple-500/30 p-1.5 text-white"
                    />
                  </div>
                </div>
              )}

              {formType === 'artifact' && (
                <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-2.5">
                  <span className="text-[10px] font-bold text-blue-400 block uppercase">法宝神兵规格 (Artifact Specs)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">品阶稀缺度</label>
                      <select
                        value={specRarity}
                        onChange={e => setSpecRarity(e.target.value as any)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      >
                        <option value="凡品">凡品</option>
                        <option value="灵品">灵品</option>
                        <option value="地阶神兵">地阶神兵</option>
                        <option value="天地孤品">天地孤品</option>
                        <option value="禁忌奇物">禁忌奇物</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">当前持有者</label>
                      <input
                        type="text"
                        placeholder="如：林巡"
                        value={specOwnerName}
                        onChange={e => setSpecOwnerName(e.target.value)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">受损/完整状态</label>
                      <input
                        type="text"
                        placeholder="如：完好 / 残缺"
                        value={specDurability}
                        onChange={e => setSpecDurability(e.target.value)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">扫描别名 (逗号分隔)</label>
                  <input
                    type="text"
                    placeholder="如：序列者, 灵基因觉醒"
                    value={formAliases}
                    onChange={e => setFormAliases(e.target.value)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">触发注入关键词 (逗号分隔)</label>
                  <input
                    type="text"
                    placeholder="如：基因锁, 虚空构装"
                    value={formKeywords}
                    onChange={e => setFormKeywords(e.target.value)}
                    className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">详细设定与描写规范</label>
                <textarea
                  rows={4}
                  placeholder="详细说明该设定的运行机制、视觉描写风格及审查防线..."
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] p-3 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                <div>
                  <span className="font-bold text-[var(--apple-text-primary)] block">全局强制注入 (Always On)</span>
                  <span className="text-[10px] text-[var(--apple-text-tertiary)]">开启后，每次正文生成都会将此设定前排注入提示词</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormAlwaysOn(!formAlwaysOn)}
                  className={`w-10 h-5 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                    formAlwaysOn ? 'bg-[var(--apple-accent)]' : 'bg-black/30 border border-white/10'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${formAlwaysOn ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--apple-separator)]">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleSaveCreate}
                className="px-4 py-1.5 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-xs font-semibold"
              >
                创建设定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: EDIT LORE ENTRY                                     */}
      {/* ============================================================ */}
      {isEditModalOpen && activeFormEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--apple-surface)] border border-[var(--apple-border-strong)] rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--apple-separator)] pb-3">
              <h3 className="text-xs font-bold text-[var(--apple-text-primary)] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[var(--apple-accent)]" />
                <span>编辑设定规范 · {activeFormEntry.name}</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">设定名称</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] px-3 py-2 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              {/* Dynamic Specs based on formType */}
              {formType === 'realm' && (
                <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-2.5">
                  <span className="text-[10px] font-bold text-amber-400 block uppercase">境界专有硬属性 (Realm Specs)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">阶位序号</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={specRealmRank}
                        onChange={e => setSpecRealmRank(parseInt(e.target.value) || 1)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">寿元极限</label>
                      <input
                        type="text"
                        value={specLifespan}
                        onChange={e => setSpecLifespan(e.target.value)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">神识覆盖</label>
                      <input
                        type="text"
                        value={specDivineSense}
                        onChange={e => setSpecDivineSense(e.target.value)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">破坏力尺度</label>
                    <input
                      type="text"
                      value={specPowerScale}
                      onChange={e => setSpecPowerScale(e.target.value)}
                      className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-rose-400 mb-0.5">不可逾越法则</label>
                    <input
                      type="text"
                      value={specInviolableLaw}
                      onChange={e => setSpecInviolableLaw(e.target.value)}
                      className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-rose-500/30 p-1.5 text-white"
                    />
                  </div>
                </div>
              )}

              {formType === 'technique' && (
                <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-2.5">
                  <span className="text-[10px] font-bold text-red-400 block uppercase">功法神通元数据</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">功法类别</label>
                      <select
                        value={specTechniqueCategory}
                        onChange={e => setSpecTechniqueCategory(e.target.value as any)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      >
                        <option value="主修心法">主修心法</option>
                        <option value="遁术身法">遁术身法</option>
                        <option value="攻击秘法">攻击秘法</option>
                        <option value="禁忌禁术">禁忌禁术</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">施法资源消耗</label>
                      <input
                        type="text"
                        value={specResourceCost}
                        onChange={e => setSpecResourceCost(e.target.value)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-purple-400 mb-0.5">施法代价与反噬</label>
                    <input
                      type="text"
                      value={specCostAndBacklash}
                      onChange={e => setSpecCostAndBacklash(e.target.value)}
                      className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-purple-500/30 p-1.5 text-white"
                    />
                  </div>
                </div>
              )}

              {formType === 'artifact' && (
                <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] space-y-2.5">
                  <span className="text-[10px] font-bold text-blue-400 block uppercase">法宝神兵规格</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">品阶</label>
                      <select
                        value={specRarity}
                        onChange={e => setSpecRarity(e.target.value as any)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      >
                        <option value="凡品">凡品</option>
                        <option value="灵品">灵品</option>
                        <option value="地阶神兵">地阶神兵</option>
                        <option value="天地孤品">天地孤品</option>
                        <option value="禁忌奇物">禁忌奇物</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">当前持有者</label>
                      <input
                        type="text"
                        value={specOwnerName}
                        onChange={e => setSpecOwnerName(e.target.value)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-0.5">状态</label>
                      <input
                        type="text"
                        value={specDurability}
                        onChange={e => setSpecDurability(e.target.value)}
                        className="w-full text-xs rounded-lg bg-[var(--apple-surface)] border border-[var(--apple-border)] p-1.5 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[var(--apple-text-secondary)] mb-1">设定描写与因果规则</label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  className="w-full text-xs rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] p-3 text-[var(--apple-text-primary)] outline-none focus:border-[var(--apple-accent)]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                <div>
                  <span className="font-bold text-[var(--apple-text-primary)] block">全局强制注入 (Always On)</span>
                  <span className="text-[10px] text-[var(--apple-text-tertiary)]">开启后，每次生成前排强制注入该设定</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormAlwaysOn(!formAlwaysOn)}
                  className={`w-10 h-5 rounded-full transition-colors p-0.5 relative inline-flex items-center shrink-0 ${
                    formAlwaysOn ? 'bg-[var(--apple-accent)]' : 'bg-black/30 border border-white/10'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${formAlwaysOn ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--apple-separator)]">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-[var(--apple-subtle)] text-[var(--apple-text-secondary)] text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-xl bg-[var(--apple-accent)] hover:bg-[var(--apple-accent-hover)] text-white text-xs font-semibold"
              >
                保存更新
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
