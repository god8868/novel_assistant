import { NovelProject, NovelLoreEntry, NovelChapter, NovelCharacter, NovelFact, NovelReviewItem, StorylineTrack } from './novel_types.ts';

export const DEFAULT_NOVEL_PROJECT: NovelProject = {
  id: 'project_star_sequence',
  title: '《星穹序列：归零纪元》',
  synopsis: '在旧神遗留的深渊废墟中，底层拾荒巡游者林巡手持残损的逆熵怀表，以精密算力推演无上法则，步步撕开银河执事堂与太古神明的秩序帷幕。',
  genre: '科幻修真 · 赛博序列 · 硬核权谋',
  totalWords: 348200,
  masterTheme: '在绝对冷酷的物理法则与阶级牢笼下，个体的理智、算力与反叛意志构成了唯一的熵减奇迹。',
  storyTimeCurrent: '星历342年9月14日 暴雨夜 · 辰时三刻',

  // -----------------------------------------------------------------------
  // 1. 寰宇世界观设定条目 (Lore Entries)
  // -----------------------------------------------------------------------
  loreEntries: [
    // 境界 Ladder
    {
      id: 'lore_realm_1',
      novelId: 'project_star_sequence',
      type: 'realm',
      name: '一阶 · 拾荒流民 (Scavenger)',
      aliases: ['一阶流民', '无序体', '零级肉身'],
      keywords: ['拾荒流民', '一阶', '肉身淬炼'],
      alwaysOn: false,
      priority: 8,
      specs: {
        realmRank: 1,
        lifespanLimit: '80年',
        powerScale: '极限握力 300kg · 徒手破木门',
        divineSenseRadius: '无神识，依赖肉眼与义眼热成像',
        inviolableLaw: '对高位威压无免疫力，受三阶以上神识直视将产生神经性眩晕'
      },
      content: '最底层未植入高纯度灵子回路的普通人类，需依靠粗劣的机械外骨骼与冷凝营养液维持高强度劳动。'
    },
    {
      id: 'lore_realm_2',
      novelId: 'project_star_sequence',
      type: 'realm',
      name: '二阶 · 基因序列者 (Sequencer)',
      aliases: ['二阶序列者', '灵基因初醒'],
      keywords: ['基因序列者', '二阶', '灵子回路'],
      alwaysOn: false,
      priority: 8,
      specs: {
        realmRank: 2,
        lifespanLimit: '150年',
        powerScale: '拳力 2.5 吨 · 击穿 20mm 均质钢板',
        divineSenseRadius: '微弱生物电磁感应，半径 15 米',
        inviolableLaw: '基因锁初开，必须定时服用逆熵抑制剂，否则灵子过载将导致细胞自噬'
      },
      content: '成功融合初阶古神基因序列的战术改造者，神经反射速度提升至常人 6 倍，可短时间感知亚空间灵子流动。'
    },
    {
      id: 'lore_realm_3',
      novelId: 'project_star_sequence',
      type: 'realm',
      name: '四阶 · 序列巡游者 (Void Stalker)',
      aliases: ['四阶巡游者', '虚空踏行官', '虚灵体'],
      keywords: ['序列巡游者', '四阶', '虚空跃迁', '巡游官'],
      alwaysOn: true,
      priority: 9,
      specs: {
        realmRank: 4,
        lifespanLimit: '300年',
        powerScale: '裂山级 · 单体撕裂重装星舰装甲',
        divineSenseRadius: '虚空神识笼罩半径 1500 米',
        inviolableLaw: '神识具备绝对致盲压制低阶能力；若无「绝灵灭魂佩」阻隔，低两阶目标将在 3 秒内被神识震碎意识。'
      },
      content: '能够直接肉身在近地太空中短暂停留，借由虚空缝隙进行短距离相位折叠，是各大执事堂的王牌战力中坚。'
    },
    {
      id: 'lore_realm_4',
      novelId: 'project_star_sequence',
      type: 'realm',
      name: '六阶 · 洞虚真罡 (Astral Sovereign)',
      aliases: ['六阶真罡', '星宿天尊', '歼星主宰'],
      keywords: ['洞虚真罡', '六阶', '真罡领域', '天尊'],
      alwaysOn: false,
      priority: 10,
      specs: {
        realmRank: 6,
        lifespanLimit: '1200年',
        powerScale: '歼星级 · 一击蒸发地表大洋',
        divineSenseRadius: '神识覆盖整颗中型行星',
        inviolableLaw: '掌握初级因果律干扰，任何五阶以下术法对其造成伤害衰减 99.8%。'
      },
      content: '已将灵子核心熔炼为微型恒星坍缩态，举手投足引动星宿重力潮汐，为星系级霸主。'
    },

    // 功法神通
    {
      id: 'lore_tech_1',
      novelId: 'project_star_sequence',
      type: 'technique',
      name: '太古逆熵神引 (Primal Entropy Inversion)',
      aliases: ['逆熵神引', '逆熵决', '归零心法'],
      keywords: ['逆熵神引', '逆熵决', '心法', '熵减'],
      alwaysOn: true,
      priority: 10,
      specs: {
        techniqueCategory: '主修心法',
        prerequisite: '身怀天生太古逆熵道骨，神识灵动值 > 180',
        resourceCost: '每轮大周天消耗 30% 灵核储备与 1 枚暗质晶石',
        costAndBacklash: '逆修魔纲每次施展必折损体内微量神经突触，若连续超载将陷入 30 秒五感剥夺',
        cooldownPeriod: '无常规冷却，但受脑域发热负荷限制'
      },
      content: '林巡的核心主修功法，逆转热力学第二定律，将周围散逸的混乱热能与狂暴灵压反向凝聚为极致冰封真元。'
    },
    {
      id: 'lore_tech_2',
      novelId: 'project_star_sequence',
      type: 'technique',
      name: '瞬息虚空错步 (Void Phase Blink)',
      aliases: ['虚空错步', '相位闪现', '错影步'],
      keywords: ['虚空错步', '身法', '闪现', '错步'],
      alwaysOn: false,
      priority: 7,
      specs: {
        techniqueCategory: '遁术身法',
        prerequisite: '二阶序列者以上，装备神经加速轴承',
        resourceCost: '每次闪烁消耗 8% 灵元与 50ml 战术冷凝液',
        costAndBacklash: '连续使用超过 5 次将引发足弓骨膜微裂',
        cooldownPeriod: '3 秒'
      },
      content: '在亚空间与现实空间切面间微型滑移，留下一道光学残影并瞬移至敌方盲区 15 米内。'
    },

    // 法宝神兵
    {
      id: 'lore_art_1',
      novelId: 'project_star_sequence',
      type: 'artifact',
      name: '转轮破甲猎铳 · 改 (Custom Revolver Buster)',
      aliases: ['转轮猎铳', '破甲猎铳', '黑星重铳'],
      keywords: ['转轮猎铳', '破甲符弹', '枪管', '重铳'],
      alwaysOn: true,
      priority: 9,
      specs: {
        rarity: '地阶神兵',
        ownerCharacterId: 'char_lin_xun',
        ownerName: '林巡',
        durability: '枪管微损 (在第38章射出过载破甲弹后膛线轻微磨损)',
        status: '完好'
      },
      content: '林巡亲手魔改的六连发磁轨击锤猎铳，枪膛内置太古逆火微雕符阵，可兼容实弹与纯灵能破甲弹头。'
    },
    {
      id: 'lore_art_2',
      novelId: 'project_star_sequence',
      type: 'artifact',
      name: '太古序列怀表 (Chronos Sequence Watch)',
      aliases: ['序列怀表', '逆火怀表', '青铜钟表'],
      keywords: ['序列怀表', '齿轮', '逆流', '怀表'],
      alwaysOn: true,
      priority: 10,
      specs: {
        rarity: '天地孤品',
        ownerCharacterId: 'char_lin_xun',
        ownerName: '林巡',
        durability: '核心逆火纹受损，仅剩 3 次局部时光回溯充能',
        status: '残缺'
      },
      content: '师尊楚玄机临终托付的核心奇物，表面雕刻有精密星轨齿轮，能在方圆 3 米内强行倒转 1.5 秒物理因果。'
    },

    // 宗门与势力
    {
      id: 'lore_fac_1',
      novelId: 'project_star_sequence',
      type: 'faction',
      name: '黑星港执事堂 (Blackstar Magistracy)',
      aliases: ['执事堂', '黑星执法官', '宗门巡察司'],
      keywords: ['执事堂', '黑星港', '总督', '执事官'],
      alwaysOn: false,
      priority: 6,
      specs: {},
      content: '盘踞在第三星环的垄断统治势力，掌控着全星域 90% 的人工神经素与星舰停泊坞口，等级森严且暗流涌动。'
    },

    // 天道法则 (Always-On)
    {
      id: 'lore_rule_1',
      novelId: 'project_star_sequence',
      type: 'rule',
      name: '灵子跃迁逆熵定律 (Entropy Inversion Axiom)',
      aliases: ['逆熵定律', '灵子法则', '绝对零度伴生'],
      keywords: ['逆熵', '绝对零度', '热寂', '物理法则'],
      alwaysOn: true,
      priority: 10,
      specs: {
        inviolableLaw: '凡进行高烈度灵子能级跃迁，其反作用场必将汲取周围分子动能，伴随局部 10 米内温度骤降至绝对零度附近。'
      },
      content: '本书最高物理与天道铁律：强大的术法爆发绝不会产生炫目的无端火花，而是极致的静谧、冷酷与空气凝结白霜。'
    }
  ],

  // -----------------------------------------------------------------------
  // 2. 核心人物卡 (Characters)
  // -----------------------------------------------------------------------
  characters: [
    {
      id: 'char_lin_xun',
      name: '林巡',
      role: '主角',
      realm: '四阶 · 序列巡游者',
      realmRank: 4,
      identity: '第三区黑星港流民出身 / 隐秘逆熵修者',
      appearance: '二十三四岁青年，眉骨冷峻，左耳后有轻微神经接口磨损痕迹，常年身着防油污深灰战术风衣。',
      temperament: '极度冷静、精于算力推演，信奉「事不过三，落子无悔」，不轻易动怒，出手必杀。',
      mainTechnique: '太古逆熵神引 (第4重)',
      boundArtifacts: ['转轮破甲猎铳 · 改', '太古序列怀表'],
      secrets: '已发现师尊楚玄机当年叛出执事堂并非背叛，而是发现了星穹总督圈养整个星系的降维真相。',
      state: '左肩在第37章受磁暴灼伤，已敷上冷凝机油绷带，战斗力维持在 88%',
      avatarColor: 'from-blue-600 to-indigo-700'
    },
    {
      id: 'char_chu_xuan_ji',
      name: '楚玄机',
      role: '阵营导师',
      realm: '六阶 · 洞虚真罡 (半步陨落)',
      realmRank: 6,
      identity: '前执事堂首席炼器宗师 / 渊天魔纲传人',
      appearance: '面容枯槁如古松，双目被逆火融封，常年闭目手抚斑驳青铜剑匣。',
      temperament: '孤傲冷彻，洞悉天机却守口如瓶，对林巡倾囊相授但极其严苛。',
      mainTechnique: '太古逆火斩神诀',
      boundArtifacts: ['逆火残剑', '青铜太古剑匣'],
      secrets: '逆修魔纲已导致其经脉寸断，寿命仅剩不足百日。',
      state: '闭关在黑星港地底熔炉残骸中，气息衰微',
      avatarColor: 'from-amber-600 to-red-700'
    },
    {
      id: 'char_su_qing_xue',
      name: '苏青雪',
      role: '主要配角',
      realm: '三阶 · 灵网掌控官',
      realmRank: 3,
      identity: '黑星港商会副会长独女 / 首席信息黑客',
      appearance: '银白齐肩短发，右眼佩戴全息战术单片镜，神色清冷干练。',
      temperament: '利益至上但重守信诺，擅长在各大势力夹缝中计算风险收益比。',
      mainTechnique: '天机千丝灵网术',
      boundArtifacts: ['矩阵算筹', '纳米侦测浮游针'],
      secrets: '暗中替林巡洗白黑市黑晶，并掌握执事堂内部巡查舰队的密保跳频。',
      state: '处于安全屋机房，全神监控第七泊位雷达',
      avatarColor: 'from-cyan-500 to-blue-600'
    }
  ],

  // -----------------------------------------------------------------------
  // 3. 结构化章节列表 (Structured Chapters)
  // -----------------------------------------------------------------------
  chapters: [
    {
      id: 'chap_037',
      vol: 1,
      seq: 37,
      title: '第37章：第七泊位的雨',
      status: 'final',
      words: 3420,
      currentVersionId: 'v_037_final',
      summary: '林巡在暴雨夜潜入第七泊位，遭遇铁骨帮三名改造杀手围堵。林巡开枪击碎油压储罐脱身，左肩受磁暴灼伤。',
      outline: {
        goal: '潜入第七泊位夺取冷凝机油与情报芯片',
        conflict: '铁骨帮伏击与巡查哨兵巡逻交叉封锁',
        cast: ['林巡', '铁骨帮改造杀手'],
        location: '第七冷凝泊位',
        storyTime: '星历342年9月14日 暴雨夜 · 寅时',
        targetWords: 3500,
        endingHook: '枪管残温尚存，阴影中走出一具披着执事堂制式斗篷的熟悉高挑身影。',
        beats: [
          { id: 'b1', seq: 1, label: 'Beat 1 雨夜潜行与哨位标记', targetWords: 800, tensionLevel: 'calm', summary: '冷雨掩盖脚步，林巡拆解第一道光栅锁' },
          { id: 'b2', seq: 2, label: 'Beat 2 铁骨帮破墙突袭', targetWords: 1200, tensionLevel: 'rising', summary: '近身肉搏与磁轨霰弹压制' },
          { id: 'b3', seq: 3, label: 'Beat 3 逆火引爆与带伤撤离', targetWords: 1400, tensionLevel: 'climax', summary: '打碎油压罐制造爆炸火海，林巡负伤翻墙' }
        ],
        foreshadowPlant: ['林巡发现杀手佩剑上刻有楚玄机一脉独有的逆火纹'],
        foreshadowPayoff: ['第34章埋下的铁骨帮走私路线情报']
      },
      content: `雨水不是落下的，是被高压通风管的巨型涡轮撕碎后，化作粘稠冰冷的雾沫砸在脸上的。\n\n林巡靠在第七泊位的锈蚀工字钢柱后，左手拇指压在风衣内侧的转轮猎铳击锤上。冷轧钢制成的枪管贴着肋骨，传来刺骨的寒意。\n\n前方十二米处，两名铁骨帮的二阶改造体正提着高频振动战刀巡行。他们的义眼在雨幕中闪烁着暴躁的猩红光斑。\n\n“老三，动作快点。执事堂的巡逻梭机还有七分钟过顶。”\n\n林巡没有呼吸。他体内的太古逆熵道骨缓缓共鸣，周围三米内的雨丝以肉眼可见的速度凝结成微小的白色冰棱。`
    },
    {
      id: 'chap_038',
      vol: 1,
      seq: 38,
      title: '第38章：逆火之剑与熟人',
      status: 'reviewing',
      words: 3680,
      currentVersionId: 'v_038_rev2',
      summary: '林巡与苏青雪在黑市安全屋接头，验看从杀手剑上拓印的逆火符文，确认师尊楚玄机当年在宗门执事堂留下的暗线仍在运作。',
      outline: {
        goal: '完成情报交割，确认逆火纹来源与师尊生机安危',
        conflict: '苏青雪对情报价值的商业质疑与暗哨搜查临近',
        cast: ['林巡', '苏青雪'],
        location: '黑星港地下安全屋 · 304号储藏室',
        storyTime: '星历342年9月14日 暴雨夜 · 辰时三刻',
        targetWords: 3600,
        endingHook: '怀表内的秒针突然逆时针震颤了半格——这意味着三分钟内将有六阶神识跨空锁定此处。',
        beats: [
          { id: 'b1', seq: 1, label: 'Beat 1 安全屋接头与伤口包扎', targetWords: 900, tensionLevel: 'calm', summary: '机油擦拭枪膛，苏青雪送来高纯度冷凝素' },
          { id: 'b2', seq: 2, label: 'Beat 2 逆火纹符拓印解析', targetWords: 1500, tensionLevel: 'rising', summary: '全息矩阵还原剑纹，证实乃楚玄机亲传工艺' },
          { id: 'b3', seq: 3, label: 'Beat 3 怀表异动与危机逼近', targetWords: 1200, tensionLevel: 'twist', summary: '序列怀表指针逆转，高阶威压降临' }
        ],
        foreshadowPlant: ['序列怀表指针自发逆转半格，预兆高阶死敌临近'],
        foreshadowPayoff: ['第37章杀手佩剑逆火纹的真实主人身份']
      },
      content: `安全屋的门轴涂满了厚重的石墨润滑脂，推开时没有发出半点声响。\n\n林巡反手将门闩扣死，脱下浸透雨水与机油的灰色风衣。左肩的皮肉被磁暴灼成一片焦黑，他没有皱眉，只是取出一管灰白色的冷凝膏，直接挤压在伤口表面。\n\n嗤的一声，白烟升腾，伴随着皮肉被急冻麻痹的微弱声响。\n\n“你迟到了九分钟。”阴影里，苏青雪推了推右眼的全息战术单片镜，指尖在悬浮光屏上快速滑过，“第七泊位的动静闹得太大，执事堂封锁了三条主干道。”\n\n“值得。”林巡将拓印有逆火纹样的金属残片扔在桌上，发出清脆的金属撞击声。\n\n苏青雪低头扫了一眼，神色微微一变：“这是楚玄机大师三十年前在执事堂留下的‘无相逆火印’……怎么会在铁骨帮的死士剑上？”\n\n林巡握紧了转轮猎铳，枪管微烫，眼神冷彻：“因为当年追杀他的，根本不是魔道，而是执事堂的大执事。”`
    },
    {
      id: 'chap_039',
      vol: 1,
      seq: 39,
      title: '第39章：虚空踏碎与破局一铳',
      status: 'planned',
      words: 0,
      currentVersionId: 'v_039_init',
      summary: '面对降临的执事堂四阶巡游官，林巡借助序列怀表回溯争取到的1.5秒空隙，射出最后一枚破甲符弹击破对方护体真罡。',
      outline: {
        goal: '在四阶神识压制下绝地反杀，突围出黑星港',
        conflict: '跨阶威压绝对死局与破甲弹仅剩最后一枚',
        cast: ['林巡', '苏青雪', '执事堂巡游官赵无咎'],
        location: '黑星港排污重水管道',
        storyTime: '星历342年9月14日 暴雨夜 · 巳时一刻',
        targetWords: 3800,
        endingHook: '暴雨停歇，巡游官的无头尸身轰然坠地，而林巡手里的猎铳彻底炸膛，枪管崩裂为三截。',
        beats: [
          { id: 'b1', seq: 1, label: 'Beat 1 威压降临与绝对致盲压迫', targetWords: 1000, tensionLevel: 'rising', summary: '四阶巡游官神识封锁街道，呼吸困难' },
          { id: 'b2', seq: 2, label: 'Beat 2 怀表逆转1.5秒绝命布局', targetWords: 1600, tensionLevel: 'climax', summary: '消耗怀表充能躲过必杀一击，枪口抵近眉心' },
          { id: 'b3', seq: 3, label: 'Beat 3 破甲弹爆发与法宝损毁', targetWords: 1200, tensionLevel: 'falling', summary: '一枪轰碎真罡，猎铳受损，遁入重水管道' }
        ],
        foreshadowPlant: ['猎铳彻底炸膛损毁，必须在第41章寻找新的炼器宗师修复'],
        foreshadowPayoff: ['第38章怀表自发异动的危机落地']
      },
      content: ''
    }
  ],

  // -----------------------------------------------------------------------
  // 4. 事实账本 (Fact Ledger)
  // -----------------------------------------------------------------------
  facts: [
    {
      id: 'fact_001',
      chapterId: 'chap_037',
      chapterSeq: 37,
      kind: 'state',
      subject: '林巡',
      content: '在第37章第七泊位突围中左肩受轻微磁暴灼伤，战斗力暂时受损',
      storyTime: '星历342年9月14日 寅时',
      resolved: false,
      confirmed: true,
      createdAt: '2026-10-01'
    },
    {
      id: 'fact_002',
      chapterId: 'chap_037',
      chapterSeq: 37,
      kind: 'item',
      subject: '转轮破甲猎铳 · 改',
      content: '第37章连续发射高压符弹，枪管内壁膛线受微热应力磨损',
      storyTime: '星历342年9月14日 寅时',
      resolved: false,
      confirmed: true,
      createdAt: '2026-10-01'
    },
    {
      id: 'fact_003',
      chapterId: 'chap_038',
      chapterSeq: 38,
      kind: 'promise',
      subject: '太古序列怀表',
      content: '指针自发逆转半格，预警有四阶或以上神识敌对目标将在短时间内赶赴现场',
      storyTime: '星历342年9月14日 辰时三刻',
      resolved: false,
      confirmed: true,
      createdAt: '2026-10-01'
    },
    {
      id: 'fact_004',
      chapterId: 'chap_038',
      chapterSeq: 38,
      kind: 'relation',
      subject: '楚玄机与执事堂',
      content: '当年追杀楚玄机的幕后黑手确认为执事堂大执事，而非此前宣称的魔道修士',
      storyTime: '星历342年9月14日 辰时三刻',
      resolved: true,
      confirmed: true,
      createdAt: '2026-10-01'
    }
  ],

  // -----------------------------------------------------------------------
  // 5. AI 专业审查项 (Review Items)
  // -----------------------------------------------------------------------
  reviews: [
    {
      id: 'rev_001',
      category: 'consistency',
      severity: 'high',
      quote: '林巡握紧了转轮猎铳，枪管微烫',
      startOffset: 620,
      endOffset: 635,
      issue: '违背了设定条目【转轮破甲猎铳 · 改】：第37章正文刚打过高压冷凝机油弹，且根据【灵子跃迁逆熵定律】，该枪械发射后枪体应产生绝对零度白霜，而非“微烫”。',
      ruleRefId: 'lore_rule_1',
      suggestion: '将“枪管微烫”修改为“枪管凝着一层冷硬的冰霜白霜”，符合逆熵法术冷酷基调。',
      rewrite: '林巡握紧了转轮猎铳，枪管凝着一层薄白如骨的冷霜',
      state: 'open'
    },
    {
      id: 'rev_002',
      category: 'logic',
      severity: 'medium',
      quote: '因为当年追杀他的，根本不是魔道，而是执事堂的大执事。',
      startOffset: 740,
      endOffset: 770,
      issue: '与事实账本【fact_004】吻合，但根据章纲，本章结尾前应重点呼应【太古序列怀表】的指针逆动异常。',
      suggestion: '在此段后补充怀表指针逆跳的机械齿轮脆响描写，自然引出章末悬念。',
      rewrite: '“因为当年追杀他的，根本不是魔道，而是执事堂的大执事。”话音未落，林巡怀中的青铜怀表突然发出咯哒一声刺耳的倒齿摩擦声。',
      state: 'open'
    },
    {
      id: 'rev_003',
      category: 'style',
      severity: 'low',
      quote: '苏青雪低头扫了一眼，神色微微一变',
      startOffset: 480,
      endOffset: 500,
      issue: '典型 AI 机械套话（“神色微微一变”、“心中不禁一震”）。建议替换为具体瞳孔缩放、呼吸滞涩或手指生理微动作。',
      suggestion: '改为生理镜头白描描写：“苏青雪战术单片镜上的数据瀑布猛然一滞，搭在光屏上的食指关节下意识扣紧”。',
      rewrite: '苏青雪战术单片镜上的数据瀑布骤然定格，她搭在光屏上的食指停在半空',
      state: 'open'
    }
  ],

  // -----------------------------------------------------------------------
  // 6. 宏观多轨故事线 (Storyline Tracks)
  // -----------------------------------------------------------------------
  storylineTracks: [
    {
      id: 'track_main',
      name: '主线轨：归零纪元与神明反抗',
      type: 'main',
      color: '#0A84FF',
      description: '林巡探寻身世、破除星穹总督降维封锁的主线推进',
      events: [
        { id: 'ev_1', chapterSeq: 37, title: '第七泊位突围', summary: '夺取冷凝机油与杀手佩剑', type: 'turning_point' },
        { id: 'ev_2', chapterSeq: 38, title: '逆火纹交割', summary: '确认大执事背叛真相', type: 'plant' },
        { id: 'ev_3', chapterSeq: 39, title: '虚空踏碎反杀', summary: '破甲弹轰碎四阶巡游官', type: 'climax' }
      ]
    },
    {
      id: 'track_mystery',
      name: '暗线轨：师尊楚玄机与逆熵道骨',
      type: 'mystery',
      color: '#BF5AF2',
      description: '三十年前黑星港大清洗的真相与太古序列怀表的终极归宿',
      events: [
        { id: 'ev_4', chapterSeq: 38, title: '无相逆火印重现', summary: '证实楚玄机当年暗桩尚在', type: 'plant' },
        { id: 'ev_5', chapterSeq: 39, title: '怀表初次回溯', summary: '局部回溯1.5秒', type: 'payoff' }
      ]
    },
    {
      id: 'track_faction',
      name: '势力轨：黑星港执事堂大清洗',
      type: 'faction',
      color: '#FF9F0A',
      description: '执事堂内部巡查官与外围黑帮的权力兼并冲突',
      events: [
        { id: 'ev_6', chapterSeq: 37, title: '铁骨帮走私破灭', summary: '巡查梭机封锁泊位', type: 'plant' },
        { id: 'ev_7', chapterSeq: 39, title: '巡游官赵无咎陨落', summary: '引发星系震荡', type: 'climax' }
      ]
    }
  ]
};
