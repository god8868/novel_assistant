// =========================================================================
// NOVEL STUDIO DOMAIN DATA MODELS & TYPE BLUEPRINT
// Strictly aligned with SQLite Schema, Zod Specs & Novel Engineering Architecture
// =========================================================================

export type LoreType = 
  | 'realm'      // 修行境界 (练气/筑基/金丹 或 序列1-9)
  | 'technique'  // 功法神通 (心法/身法/秘技/禁术)
  | 'artifact'   // 天材地宝与法宝 (灵药/矿石/本命神兵)
  | 'faction'    // 宗门与势力架构
  | 'cosmology'  // 时空背景与纪元历史 (era/geography)
  | 'rule';      // 天道法则与物理定律 (标记 alwaysOn = true 必注入)

export interface LoreSpecs {
  realmRank?: number;            // 境界阶梯序号 (1-10，用于战力越界审查)
  lifespanLimit?: string;        // 寿元极限 (如：元婴800年 / 基因锁三阶120年)
  powerScale?: string;           // 破坏力尺度 (如：单体破甲 / 焚江煮海 / 歼星级)
  divineSenseRadius?: string;    // 神识感知半径 (如：十里 / 笼罩整颗行星)
  inviolableLaw?: string;        // 不可逾越法则 (如：高一阶神识绝对致盲压制)
  
  // 功法专有元数据
  techniqueCategory?: '主修心法' | '遁术身法' | '攻击秘法' | '禁忌禁术';
  prerequisite?: string;         // 修炼前置门槛 (如：需身怀九阳纯脉)
  resourceCost?: string;         // 施法资源消耗 (如：抽空 40% 灵核储备)
  costAndBacklash?: string;      // 功法消耗与反噬代价 (如：施展后折损半年寿元)
  cooldownPeriod?: string;       // 冷却与调息周期
  
  // 宝物与法宝专有
  rarity?: '凡品' | '灵品' | '地阶神兵' | '天地孤品' | '禁忌奇物';
  ownerCharacterId?: string;     // 当前持有者绑定 (与人物卡联动)
  ownerName?: string;            // 持有者姓名
  durability?: string;           // 受损/残缺/耗尽状态
  status?: '完好' | '残缺' | '已耗尽' | '被封印' | '已损毁';
}

/**
 * LoreEntry: 世界观设定条目
 * 对应 SQLite 中的 lore_entries 表，支持分类、时空标记与注入权重
 */
export interface LoreEntry {
  id: string;
  novelId: string;
  type: LoreType;
  name: string;
  aliases: string[];               // 别名/称谓 (用于正文关键词触发扫描)
  keywords: string[];              // 触发注入的关键词数组
  alwaysOn: boolean;               // 是否每次正文生成必注入 (核心法则/主角主修)
  priority: number;                // 裁剪优先级 (1-10，预算超限时先裁低优先级)
  specs: LoreSpecs;                // 结构化专有元数据
  content: string;                 // 详细设定说明与正文描写参考
}

export type NovelLoreEntry = LoreEntry;

// -------------------------------------------------------------------------
// 2. STRUCTURED CHAPTER OUTLINE & CHAPTER LIFECYCLE
// -------------------------------------------------------------------------

export interface ChapterBeatItem {
  id: string;
  seq: number;
  label: string;                   // 拍线名称 (如：Beat 1 泊位接头)
  targetWords: number;             // 预设字数 (如：800)
  tensionLevel: 'calm' | 'rising' | 'climax' | 'twist' | 'falling'; // 情绪张力
  summary: string;                 // 拍线简述
}

/**
 * StructuredChapterOutline: 结构化章纲
 * 符合 JSON 校验规范，推进主线目标、矛盾冲突、节拍、伏笔与钩子
 */
export interface StructuredChapterOutline {
  goal: string;                    // 本章推进的主线目标
  conflict: string;                // 核心矛盾冲突点
  cast: string[];                  // 本章出场人物 ID / 名字
  location: string;                // 发生场景 (如：第三区·冷凝船坞)
  storyTime: string;               // 故事内绝对时间 (如：星历342年9月14日 暴雨夜)
  beats: ChapterBeatItem[];        // 节奏拍线序列
  foreshadowPlant: string[];       // 本章新埋设的伏笔 (Promise)
  foreshadowPayoff: string[];      // 本章必须回收的伏笔
  endingHook: string;              // 结尾断章黄金钩子
  targetWords: number;             // 目标字数预设 (如：3500)
}

export type ChapterStatus = 'planned' | 'drafting' | 'drafted' | 'reviewing' | 'final';

export interface NovelChapter {
  id: string;
  vol: number;
  seq: number;
  title: string;
  status: ChapterStatus;           // 五态生命周期状态机
  outline: StructuredChapterOutline; // 结构化章纲
  currentVersionId: string;
  words: number;
  summary: string;                 // 章节定稿自动生成的 200 字滚动摘要
  content: string;
  updatedAt?: string;
}

// -------------------------------------------------------------------------
// 3. FACT LEDGER (事实账本)
// -------------------------------------------------------------------------

/**
 * NovelFact: 事实账本条目
 * 实现战力不崩和长篇一致性的核心，登记状态/关系/物品/伏笔/时间线
 */
export interface NovelFact {
  id: string;
  chapterId: string;
  chapterSeq?: number;
  kind: 'state' | 'relation' | 'item' | 'promise' | 'timeline'; // 状态/关系/物品/伏笔/时间线
  subject: string;                 // 主体 (如：林巡、转轮猎铳)
  content: string;                 // 事实内容 (如：在第38章打出破甲符弹，枪管微损)
  storyTime?: string;              // 故事内发生时间
  resolved: boolean;               // 伏笔是否已回收
  confirmed: boolean;              // 用户确认状态 (confirmed=true 享有审查最高优先级)
  createdAt: string;
}

export type FactItem = NovelFact;

// -------------------------------------------------------------------------
// 4. AI REVIEW & AUDITING SYSTEM (四类专业审查)
// -------------------------------------------------------------------------

export type ReviewCategory = 'consistency' | 'logic' | 'pacing' | 'style';
export type ReviewSeverity = 'high' | 'medium' | 'low';
export type ReviewState = 'open' | 'accepted' | 'ignored';

/**
 * NovelReviewItem: AI 审查项
 * 涵盖设定一致性、逻辑伏笔、节奏拖沓与文风套话四大维度
 */
export interface NovelReviewItem {
  id: string;
  category: ReviewCategory;        // 设定一致性 / 逻辑伏笔 / 节奏拖沓 / 文风套话
  severity: ReviewSeverity;        // 严重等级
  quote: string;                   // 正文中的原句
  startOffset: number;
  endOffset: number;
  issue: string;                   // 违背了哪条设定或事实
  ruleRefId?: string;              // 关联的设定条目或事实 ID
  suggestion: string;              // 修改建议
  rewrite?: string;                // 建议改写片段
  state: ReviewState;
}

export type ReviewItem = NovelReviewItem;

// -------------------------------------------------------------------------
// 5. CHARACTER DOSSIER & RELATION MATRIX
// -------------------------------------------------------------------------

export interface NovelCharacter {
  id: string;
  name: string;
  role: '主角' | '主要配角' | '反派枭雄' | '阵营导师' | '过客龙套';
  realm: string;                   // 当前境界
  realmRank: number;               // 对应境界 Ladder 序号
  identity: string;                // 势力身份
  appearance: string;              // 外貌五官与生理特征
  temperament: string;             // 性格基调与心理防线
  mainTechnique: string;           // 主修功法
  boundArtifacts: string[];        // 随身本命法宝
  secrets: string;                 // 隐秘底牌
  state: string;                   // 当前身体与心理状态
  avatarColor: string;
}

// -------------------------------------------------------------------------
// 6. STORYLINE ARCS & TRACKS
// -------------------------------------------------------------------------

export interface StorylineTrack {
  id: string;
  name: string;
  type: 'main' | 'mystery' | 'faction' | 'romance';
  color: string;
  description: string;
  events: Array<{
    id: string;
    chapterSeq: number;
    title: string;
    summary: string;
    type: 'plant' | 'climax' | 'payoff' | 'turning_point';
  }>;
}

// -------------------------------------------------------------------------
// 7. WHOLE NOVEL PROJECT STATE
// -------------------------------------------------------------------------

export interface NovelProject {
  id: string;
  title: string;
  synopsis: string;
  genre: string;
  totalWords: number;
  masterTheme: string;             // 全书主旨哲学
  storyTimeCurrent: string;        // 故事当前绝对时空节点
  chapters: NovelChapter[];
  loreEntries: LoreEntry[];
  characters: NovelCharacter[];
  facts: NovelFact[];
  reviews: NovelReviewItem[];
  storylineTracks: StorylineTrack[];
}
