export interface TrendingHotItem {
  rank: number;
  title: string;
  hot: string;
  tag?: string;
  url?: string;
  delta?: 'up' | 'down' | 'same' | 'new';
  desc?: string;
}

export type PlatformCategory = 'social' | 'tech' | 'entertainment' | 'novel' | 'finance' | 'gaming';

export interface PlatformBoard {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: PlatformCategory;
  categoryLabel: string;
  updateFreq: string;
  description: string;
  items: TrendingHotItem[];
}

export const PLATFORM_CATEGORIES: { id: PlatformCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: '🌟 全部聚合 (52个平台)', icon: '🌟' },
  { id: 'social', label: '🔥 综合社交 & 门户 (10)', icon: '🔥' },
  { id: 'tech', label: '💻 科技 & 极客开发 (10)', icon: '💻' },
  { id: 'entertainment', label: '🎬 影视 & 娱乐社区 (10)', icon: '🎬' },
  { id: 'novel', label: '📖 网文 & 数字文学 (10)', icon: '📖' },
  { id: 'finance', label: '📈 商业 & 金融创投 (6)', icon: '📈' },
  { id: 'gaming', label: '🎮 游戏 & 泛二次元 (6)', icon: '🎮' }
];

export const ALL_52_PLATFORMS: PlatformBoard[] = [
  // ==================== 1. 综合社交 & 门户 (10个) ====================
  {
    id: 'weibo',
    name: '微博热搜',
    icon: '🔥',
    color: '#ff8200',
    category: 'social',
    categoryLabel: '综合社交',
    updateFreq: '实时滚动',
    description: '全网公共话题与突发事件第一风向标',
    items: [
      { rank: 1, title: '全球新一代开源多模态大模型架构突破', hot: '489.2万', tag: '爆', delta: 'up' },
      { rank: 2, title: '先秦志怪与古蜀文明最新祭祀坑重大发现', hot: '325.6万', tag: '热', delta: 'up' },
      { rank: 3, title: '国产商业航天可重复使用火箭完成垂直起降', hot: '298.1万', tag: '新', delta: 'new' },
      { rank: 4, title: '东方古典美学影视服化道引爆海外社交平台', hot: '241.8万', tag: '热', delta: 'same' },
      { rank: 5, title: '新型超导磁体与可控核聚变装置点火成功', hot: '196.4万', tag: '荐', delta: 'up' },
      { rank: 6, title: '长篇网络小说硬核反套路与智斗题材流行', hot: '162.0万', tag: '', delta: 'same' },
      { rank: 7, title: '端侧大模型在笔记本与智能硬件上的普及浪潮', hot: '138.5万', tag: '', delta: 'down' },
      { rank: 8, title: '古籍文献数字化工程修复超万卷先秦残篇', hot: '112.4万', tag: '', delta: 'up' }
    ]
  },
  {
    id: 'zhihu',
    name: '知乎热榜',
    icon: '💡',
    color: '#0066ff',
    category: 'social',
    categoryLabel: '深度问答',
    updateFreq: '10分钟',
    description: '高价值长文深度剖析与专业思辨',
    items: [
      { rank: 1, title: '如何看待古典仙侠小说中“气机因果与生理代价”对传统开挂流的颠覆？', hot: '1850万热度', tag: '热议', delta: 'up' },
      { rank: 2, title: '大模型推理长思维链（Chain of Thought）对未来创作者工作流有何影响？', hot: '1420万热度', tag: '前沿', delta: 'up' },
      { rank: 3, title: '从社会学视角分析：古代宗门如果垄断了清气灵脉，底层散修会形成怎样的经济结构？', hot: '1180万热度', tag: '深度', delta: 'same' },
      { rank: 4, title: '为什么现在的读者更喜欢“男女主角势均力敌、利益盟约起步”的人物关系？', hot: '960万热度', tag: '', delta: 'up' },
      { rank: 5, title: '硬核科幻世界观中，如何设定一套兼具视觉冲击与物理因果自洽的星舰跃迁规则？', hot: '750万热度', tag: '', delta: 'down' }
    ]
  },
  {
    id: 'baidu',
    name: '百度热搜',
    icon: '🔍',
    color: '#2932e1',
    category: 'social',
    categoryLabel: '全网搜索',
    updateFreq: '实时',
    description: '海量网民全天候主动搜索热词聚合',
    items: [
      { rank: 1, title: '全国科技创新大会发布最新国家战略产业规划', hot: '480万', tag: '置顶', delta: 'same' },
      { rank: 2, title: '量子计算芯片相干时间突破千微秒大关', hot: '360万', tag: '热', delta: 'up' },
      { rank: 3, title: '高校录取通知书融入非遗传统工艺惊艳亮相', hot: '290万', tag: '新', delta: 'new' },
      { rank: 4, title: '我国深地探矿工程在万米深井发现超大规模特种矿藏', hot: '240万', tag: '', delta: 'up' }
    ]
  },
  {
    id: 'wechat',
    name: '微信24h热文',
    icon: '💬',
    color: '#07c160',
    category: 'social',
    categoryLabel: '微信生态',
    updateFreq: '每小时',
    description: '微信公众平台 10w+ 深度朋友圈爆款文章',
    items: [
      { rank: 1, title: '深度长文：那些在底层默默突围的普通人，做对了什么？', hot: '10万+ 在看', tag: '爆款', delta: 'up' },
      { rank: 2, title: '未来三年，最稀缺的个人核心竞争力是什么？', hot: '10万+ 赞', tag: '深度', delta: 'same' },
      { rank: 3, title: '国风古典美学的精神内核：为何我们总会被一缕山岚打动？', hot: '8.4万阅读', tag: '', delta: 'up' },
      { rank: 4, title: '人类简史作者最新访谈：当算法比我们更懂欲望', hot: '6.2万阅读', tag: '', delta: 'down' }
    ]
  },
  {
    id: 'toutiao',
    name: '今日头条',
    icon: '📰',
    color: '#ed4040',
    category: 'social',
    categoryLabel: '全网资讯',
    updateFreq: '5分钟',
    description: '智能个性化全网新闻热点资讯汇聚',
    items: [
      { rank: 1, title: '重大水利与清洁能源超级枢纽工程顺利截流', hot: '512万', tag: '要闻', delta: 'up' },
      { rank: 2, title: '全球气候极端异常应对联合倡议在京签署', hot: '388万', tag: '', delta: 'same' },
      { rank: 3, title: '多地出台支持青年创新创业与安居综合保障举措', hot: '270万', tag: '民生', delta: 'up' }
    ]
  },
  {
    id: 'douyin',
    name: '抖音热榜',
    icon: '🎵',
    color: '#161823',
    category: 'social',
    categoryLabel: '短视频',
    updateFreq: '实时',
    description: '短视频热门话题、创意滤镜与全民模因',
    items: [
      { rank: 1, title: '非遗打铁花与现代激光秀梦幻联动', hot: '1120万', tag: '热播', delta: 'up' },
      { rank: 2, title: '挑战一人分饰古风仙侠七大派系掌门对决', hot: '890万', tag: '挑战', delta: 'new' },
      { rank: 3, title: '用硬核机械臂弹奏传统古琴是一种什么体验', hot: '650万', tag: '', delta: 'up' }
    ]
  },
  {
    id: 'kuaishou',
    name: '快手热榜',
    icon: '⚡',
    color: '#ff5000',
    category: 'social',
    categoryLabel: '短视频社区',
    updateFreq: '10分钟',
    description: '烟火气市井生活与多元民间手艺人',
    items: [
      { rank: 1, title: '乡村大叔用老木匠技艺还原诸葛连弩', hot: '780万', tag: '手艺', delta: 'up' },
      { rank: 2, title: '夏夜丰收节千人长桌宴现场', hot: '540万', tag: '', delta: 'same' },
      { rank: 3, title: '民间高手自制全地形履带山地越野车', hot: '410万', tag: '科技', delta: 'up' }
    ]
  },
  {
    id: 'tencent_news',
    name: '腾讯新闻',
    icon: '🐧',
    color: '#1296db',
    category: 'social',
    categoryLabel: '主流门户',
    updateFreq: '15分钟',
    description: '权威时政与深度特稿综合报道',
    items: [
      { rank: 1, title: '我国天宫空间站最新空间科学实验取得阶段性突破', hot: '420万', tag: '要闻', delta: 'up' },
      { rank: 2, title: '夏季防汛抗旱国家应急响应机制高效运转', hot: '310万', tag: '', delta: 'same' }
    ]
  },
  {
    id: 'netease_news',
    name: '网易新闻',
    icon: '🔴',
    color: '#e60012',
    category: 'social',
    categoryLabel: '独家跟帖',
    updateFreq: '15分钟',
    description: '有态度的独家跟帖与犀利公众评述',
    items: [
      { rank: 1, title: '有态度特稿：那些坚守古籍修复五十年的老手艺人', hot: '9.8万跟帖', tag: '独家', delta: 'up' },
      { rank: 2, title: '跨学科解读：为什么古代神话故事里总有大洪水？', hot: '6.4万跟帖', tag: '', delta: 'up' }
    ]
  },
  {
    id: 'sohu_news',
    name: '搜狐热点',
    icon: '🦊',
    color: '#ffb700',
    category: 'social',
    categoryLabel: '综合资讯',
    updateFreq: '30分钟',
    description: '经典中文门户全天候热点集锦',
    items: [
      { rank: 1, title: '宏观经济数据解读：消费新业态持续激发增长动能', hot: '350万', tag: '', delta: 'same' },
      { rank: 2, title: '国际空间天体物理观测发现罕见双中子星并合引力波', hot: '260万', tag: '探索', delta: 'up' }
    ]
  },

  // ==================== 2. 科技 & 极客开发 (10个) ====================
  {
    id: '36kr',
    name: '36氪 · 科技创投',
    icon: '⚡',
    color: '#0a84ff',
    category: 'tech',
    categoryLabel: '科技前沿',
    updateFreq: '30分钟',
    description: '创投前沿、独角兽动态与新商业洞察',
    items: [
      { rank: 1, title: '8点1氪｜自主智能体与本地知识引擎成下一代生产力标配', hot: '96.5万', tag: '焦点', delta: 'up' },
      { rank: 2, title: '具身智能与人形机器人量产前夜：产业链最新研报拆解', hot: '84.2万', tag: '研报', delta: 'up' },
      { rank: 3, title: '硅谷新一轮算力基建热潮：全液冷机房与光互联芯片成为胜负手', hot: '68.0万', tag: '', delta: 'same' },
      { rank: 4, title: '网文 IP 短剧化出海营收破百亿，多模态 AI 生成管线全面渗透', hot: '52.3万', tag: '', delta: 'up' }
    ]
  },
  {
    id: 'ithome',
    name: 'IT之家 · 科技热评',
    icon: '💻',
    color: '#d22222',
    category: 'tech',
    categoryLabel: '数码极客',
    updateFreq: '实时',
    description: '数码硬件、操作系统与消费电子评测',
    items: [
      { rank: 1, title: '苹果 M5 芯片能效架构深度解析：全新神经引擎与超高带宽内存', hot: '1240 评', tag: '头条', delta: 'up' },
      { rank: 2, title: 'Linux 内核发布最新 LTS 版本，全面优化端侧异构多核调度', hot: '890 评', tag: '', delta: 'same' },
      { rank: 3, title: '纯血鸿蒙生态原生应用突破万款，跨设备互联体验革新', hot: '760 评', tag: '热', delta: 'up' }
    ]
  },
  {
    id: 'sspai',
    name: '少数派 Matrix',
    icon: '⚡',
    color: '#da282a',
    category: 'tech',
    categoryLabel: '数字生产力',
    updateFreq: '每日',
    description: '高效工作流、数字工具与极简生活方式',
    items: [
      { rank: 1, title: '从零构建个人全本地脱网 AI 知识库：隐私与高效兼得指南', hot: '9.9 评分', tag: '精选', delta: 'up' },
      { rank: 2, title: '长文创作者的 macOS 原生工作台搭建：告别臃肿与分散', hot: '9.8 评分', tag: '推荐', delta: 'up' }
    ]
  },
  {
    id: 'github',
    name: 'GitHub Trending',
    icon: '🐙',
    color: '#24292e',
    category: 'tech',
    categoryLabel: '开源趋势',
    updateFreq: '每日',
    description: '全球开源极客项目与技术框架风向标',
    items: [
      { rank: 1, title: 'antigravity-agent/framework: 本地多智能体协同框架与长程记忆引擎', hot: '★ 18.4k', tag: 'Trending', delta: 'up' },
      { rank: 2, title: 'macOS-hig-design/ui-components: 纯纯 Apple macOS 风格 React 组件库', hot: '★ 12.1k', tag: 'Featured', delta: 'up' },
      { rank: 3, title: 'open-rag/vector-sqlite: 基于 SQLite 的超轻量端侧向量与全文检索库', hot: '★ 9.8k', tag: '', delta: 'same' }
    ]
  },
  {
    id: 'v2ex',
    name: 'V2EX 热门话题',
    icon: '💬',
    color: '#333333',
    category: 'tech',
    categoryLabel: '程序员社区',
    updateFreq: '实时',
    description: '极客程序员关于技术、生活与独立开发的思辨',
    items: [
      { rank: 1, title: '大家现在用什么方案解决 50 万字长篇世界观的设定防遗忘问题？', hot: '320 回复', tag: '热议', delta: 'up' },
      { rank: 2, title: '做了一个纯本地端运行的 Markdown 深度创作工具，欢迎试用', hot: '180 回复', tag: '', delta: 'up' }
    ]
  },
  {
    id: 'juejin',
    name: '稀土掘金',
    icon: '💎',
    color: '#1e80ff',
    category: 'tech',
    categoryLabel: '前端技术',
    updateFreq: '每小时',
    description: '大前端、全栈与工程化落地实践',
    items: [
      { rank: 1, title: '彻底搞懂大模型 SSE 流式传输与前端 Markdown 极致平滑渲染', hot: '4.8k 赞', tag: '精选', delta: 'up' },
      { rank: 2, title: 'React 19 核心并发调度与 Server Actions 生产环境避坑指南', hot: '3.2k 赞', tag: '', delta: 'same' }
    ]
  },
  {
    id: 'infoq',
    name: 'InfoQ 架构',
    icon: '📊',
    color: '#10529d',
    category: 'tech',
    categoryLabel: '企业架构',
    updateFreq: '每日',
    description: '顶级企业技术架构与工程文化实践',
    items: [
      { rank: 1, title: '从零到亿级：下一代分布式数据库高可用容灾演化史', hot: '92.4k 阅读', tag: '深度', delta: 'up' }
    ]
  },
  {
    id: 'csdn',
    name: 'CSDN 今日热榜',
    icon: '🇨🇳',
    color: '#fc5531',
    category: 'tech',
    categoryLabel: '开发者',
    updateFreq: '实时',
    description: '国内老牌开发者知识问答与实战教程',
    items: [
      { rank: 1, title: '手把手教你微调属于自己的领域专属小语言模型', hot: '8.9w 访问', tag: '实战', delta: 'up' }
    ]
  },
  {
    id: 'oschina',
    name: '开源中国 OSChina',
    icon: '🦅',
    color: '#21b351',
    category: 'tech',
    categoryLabel: '国内开源',
    updateFreq: '每日',
    description: '国内本土开源生态与开源基金会动态',
    items: [
      { rank: 1, title: '国产开源操作系统全景白皮书正式发布', hot: '5.6w 阅', tag: '', delta: 'same' }
    ]
  },
  {
    id: 'producthunt',
    name: 'ProductHunt 精选',
    icon: '🐱',
    color: '#da552f',
    category: 'tech',
    categoryLabel: '全球新品',
    updateFreq: '每日',
    description: '硅谷与全球最新黑科技独立产品首发',
    items: [
      { rank: 1, title: 'NovelCraft Studio: AI-assisted Narrative Lore Ledger Engine', hot: '▲ 1420', tag: '#1 Product of the Day', delta: 'up' }
    ]
  },

  // ==================== 3. 影视 & 娱乐社区 (10个) ====================
  {
    id: 'bilibili',
    name: '哔哩哔哩 · 全站日榜',
    icon: '📺',
    color: '#00a1d6',
    category: 'entertainment',
    categoryLabel: '二次元视频',
    updateFreq: '实时',
    description: '年轻人的潮流文化社区与中长视频高地',
    items: [
      { rank: 1, title: '【硬核科普】用虚幻5与流体力学还原《庄子·逍遥游》中的北冥巨鲲！', hot: '348万播放', tag: '热门', delta: 'up' },
      { rank: 2, title: '【武术指导拆解】为什么老仙侠打斗讲究气机虚实，现代网剧只剩光效？', hot: '215万播放', tag: '深度', delta: 'up' },
      { rank: 3, title: '【AI前沿】本地运行70B大模型！手把手教你打造属于自己的超级写作助理', hot: '189万播放', tag: '干货', delta: 'up' },
      { rank: 4, title: '【志怪典籍】翻遍古代奇书，那些令人毛骨悚然的古代神异禁忌', hot: '142万播放', tag: '', delta: 'down' }
    ]
  },
  {
    id: 'douban_movie',
    name: '豆瓣电影 · 实时热门',
    icon: '🎬',
    color: '#007722',
    category: 'entertainment',
    categoryLabel: '影视评分',
    updateFreq: '每日',
    description: '华语影视口碑风向标与高分文艺佳作',
    items: [
      { rank: 1, title: '科幻史诗巨制《大渊破晓》口碑大爆，豆瓣开分 9.2', hot: '9.2 分', tag: '高分', delta: 'up' },
      { rank: 2, title: '新国风悬疑动画电影《斩妄纪》点映好评如潮', hot: '8.8 分', tag: '热门', delta: 'up' }
    ]
  },
  {
    id: 'douban_book',
    name: '豆瓣图书 · 热门虚构',
    icon: '📚',
    color: '#2e7d32',
    category: 'entertainment',
    categoryLabel: '文艺图书',
    updateFreq: '每周',
    description: '严肃文学、类型小说与思想社科精选',
    items: [
      { rank: 1, title: '《先秦两汉神怪异闻考注》：重新发现东方神话的恐怖与神圣', hot: '9.4 分', tag: '虚构榜首', delta: 'up' },
      { rank: 2, title: '《群星的崩落》：硬核天体物理视角下的文明兴衰史', hot: '8.9 分', tag: '', delta: 'same' }
    ]
  },
  {
    id: 'maoyan',
    name: '猫眼实时票房',
    icon: '🎟️',
    color: '#e51c23',
    category: 'entertainment',
    categoryLabel: '院线票房',
    updateFreq: '实时',
    description: '全国院线排片与实时大盘票房统计',
    items: [
      { rank: 1, title: '全国单日总票房突破 3.2 亿元，《破妄者》领跑暑期档', hot: '1.42 亿', tag: '冠军', delta: 'up' }
    ]
  },
  {
    id: 'beacon',
    name: '灯塔专业版',
    icon: '🏮',
    color: '#ff6f00',
    category: 'entertainment',
    categoryLabel: '影视数据',
    updateFreq: '实时',
    description: '阿里巴巴影业出品的专业宣发数据平台',
    items: [
      { rank: 1, title: '影视 IP 多模态漫改与微短剧联合孵化指数月报', hot: '全网指数 980', tag: '行业', delta: 'same' }
    ]
  },
  {
    id: 'hupu',
    name: '虎扑 · 步行街主干道',
    icon: '🏀',
    color: '#c01e2f',
    category: 'entertainment',
    categoryLabel: '体育社区',
    updateFreq: '实时',
    description: '直男文化、体育竞技与经典情怀讨论',
    items: [
      { rank: 1, title: '金庸武侠与古典仙侠里，谁才是真正把“气机虚实”写到极致的宗师？', hot: '4800 亮', tag: '热帖', delta: 'up' },
      { rank: 2, title: '如果现代特种部队穿越到修真世界，面对筑基期修士胜算几何？', hot: '3200 亮', tag: '', delta: 'up' }
    ]
  },
  {
    id: 'xiaohongshu',
    name: '小红书 · 爆款热词',
    icon: '📕',
    color: '#ff2442',
    category: 'entertainment',
    categoryLabel: '生活方式',
    updateFreq: '实时',
    description: '审美灵感、国风美学与好物种草指南',
    items: [
      { rank: 1, title: '新中式冷冽美学壁纸与手绘插画大赏', hot: '48.2w 赞', tag: '趋势', delta: 'up' },
      { rank: 2, title: '如何用 3 句话写出让人起鸡皮疙瘩的绝美古风文案？', hot: '32.1w 藏', tag: '', delta: 'up' }
    ]
  },
  {
    id: 'douyin_music',
    name: '抖音热歌榜',
    icon: '🎵',
    color: '#000000',
    category: 'entertainment',
    categoryLabel: '短视频神曲',
    updateFreq: '每日',
    description: '全网亿级使用的短视频背景音乐与魔性旋律',
    items: [
      { rank: 1, title: '《九渊剑引》国风器乐变奏版', hot: '1800w 使用', tag: '热歌', delta: 'up' }
    ]
  },
  {
    id: 'netease_music',
    name: '网易云音乐 · 飙升榜',
    icon: '🎧',
    color: '#c20c0c',
    category: 'entertainment',
    categoryLabel: '音乐社区',
    updateFreq: '每日',
    description: '治愈乐评、独立音乐人与原创仙侠 OST',
    items: [
      { rank: 1, title: '《秋雨断章》- 东方玄幻世界观概念交响乐', hot: '飙升 420%', tag: '新歌', delta: 'up' }
    ]
  },
  {
    id: 'qq_music',
    name: 'QQ音乐 · 巅峰榜',
    icon: '🎶',
    color: '#31c27c',
    category: 'entertainment',
    categoryLabel: '流行音乐',
    updateFreq: '实时',
    description: '主流华语乐坛权威排行与数字专辑销量',
    items: [
      { rank: 1, title: '院线电影原声大碟《天道无常》官方完整版', hot: '指数 98.4', tag: '冠军', delta: 'same' }
    ]
  },

  // ==================== 4. 网文 & 数字文学 (10个) ====================
  {
    id: 'qidian',
    name: '起点中文网 · 风云榜',
    icon: '📖',
    color: '#e02020',
    category: 'novel',
    categoryLabel: '男频网文',
    updateFreq: '每小时',
    description: '玄幻、仙侠、科幻网文风向标与万订神作',
    items: [
      { rank: 1, title: '《九渊破妄录》：长篇严谨法则流与冷冽剑修逆袭大渊', hot: '月票榜 No.1', tag: '万订', delta: 'up' },
      { rank: 2, title: '《赤阳劫仙》：重铸宗门秩序，从边陲灵田散修开辟商道', hot: '畅销榜 Top2', tag: '爆款', delta: 'up' },
      { rank: 3, title: '《天道残卷考》：考据志怪民俗与克系仙术的悬疑巨著', hot: '阅读指数 9.8', tag: '口碑', delta: 'same' },
      { rank: 4, title: '《星海薪火行》：硬核天体物理与文明降维打击的史诗挽歌', hot: '科幻榜首', tag: '', delta: 'down' }
    ]
  },
  {
    id: 'jinjiang',
    name: '晋江文学城 · 热推榜',
    icon: '🌸',
    color: '#009966',
    category: 'novel',
    categoryLabel: '女频巨头',
    updateFreq: '每日',
    description: '高智商双强、细腻权谋与深度群像叙事',
    items: [
      { rank: 1, title: '《商女问鼎修仙界》：万宝商盟女当家的资本与阵法霸权', hot: '积分 120 亿', tag: '金榜', delta: 'up' },
      { rank: 2, title: '《反派死遁后都后悔了》：极致推拉与冷冽宿命论的反叛', hot: '积分 98 亿', tag: '热推', delta: 'up' }
    ]
  },
  {
    id: 'weread',
    name: '微信读书 · 飙升榜',
    icon: '📘',
    color: '#1b88ee',
    category: 'novel',
    categoryLabel: '数字出版',
    updateFreq: '每日',
    description: '出版精选、严肃社科与全网高评分长篇',
    items: [
      { rank: 1, title: '《长篇小说创作的因果律与去AI套路实战手册》', hot: '96.2% 神作', tag: '飙升', delta: 'up' },
      { rank: 2, title: '《明清志怪传奇与民间秘密宗教仪式考》', hot: '94.8% 好评', tag: '', delta: 'same' }
    ]
  },
  {
    id: 'zongheng',
    name: '纵横中文网 · 人气榜',
    icon: '⚔️',
    color: '#d32f2f',
    category: 'novel',
    categoryLabel: '传统玄幻',
    updateFreq: '每日',
    description: '老派热血、历史架空与铁血征战史诗',
    items: [
      { rank: 1, title: '《斩天阙》：一人一剑横推三千魔宗的冷酷宗师', hot: '人气 4500万', tag: '榜首', delta: 'up' }
    ]
  },
  {
    id: 'fanqie',
    name: '番茄小说 · 原创榜',
    icon: '🍅',
    color: '#ff5722',
    category: 'novel',
    categoryLabel: '免费网文',
    updateFreq: '实时',
    description: '快节奏叙事、脑洞大开与读者高互动率',
    items: [
      { rank: 1, title: '《我的破妄瞳能看见万物死线》：绝境刺杀流爆火全网', hot: '在读 180w', tag: '顶流', delta: 'up' }
    ]
  },
  {
    id: 'qimao',
    name: '七猫小说 · 热搜榜',
    icon: '🐱',
    color: '#f57c00',
    category: 'novel',
    categoryLabel: '大众通俗',
    updateFreq: '每日',
    description: '主打逆袭爽感与强悬念钩子的大众文学',
    items: [
      { rank: 1, title: '《散修的自我修养：从种田到掀翻九重天》', hot: '人气 920w', tag: '畅销', delta: 'up' }
    ]
  },
  {
    id: 'douban_read',
    name: '豆瓣阅读 · 悬疑类型',
    icon: '🌿',
    color: '#388e3c',
    category: 'novel',
    categoryLabel: '精品中短篇',
    updateFreq: '每周',
    description: '严谨逻辑推理、社会派悬疑与高概念科幻',
    items: [
      { rank: 1, title: '《黑水渊谋杀事件：修真法则下的密室绝杀》', hot: '评分 9.1', tag: '悬疑首选', delta: 'up' }
    ]
  },
  {
    id: 'ciweimao',
    name: '刺猬猫 · 轻小说榜',
    icon: '🦔',
    color: '#7b1fa2',
    category: 'novel',
    categoryLabel: '二次元轻小说',
    updateFreq: '每日',
    description: '同人衍生、克苏鲁轻喜剧与玩梗反转',
    items: [
      { rank: 1, title: '《身为修仙反派，我给主角发因果抚恤金》', hot: '月票 Top1', tag: '', delta: 'up' }
    ]
  },
  {
    id: 'tadu',
    name: '塔读文学 · 人气榜',
    icon: '🏯',
    color: '#0288d1',
    category: 'novel',
    categoryLabel: '都市修仙',
    updateFreq: '每日',
    description: '都市异能、古武传承与草根逆袭',
    items: [
      { rank: 1, title: '《古法炼丹师的现代宗师之路》', hot: '人气 320w', tag: '', delta: 'same' }
    ]
  },
  {
    id: '17k',
    name: '17K小说网 · 战力榜',
    icon: '🔥',
    color: '#c2185b',
    category: 'novel',
    categoryLabel: '网文元老',
    updateFreq: '每日',
    description: '经典老牌文学站点与百万字长篇巨作',
    items: [
      { rank: 1, title: '《九重神霄劫》：八百年天劫降临的终局决战', hot: '指数 840', tag: '', delta: 'up' }
    ]
  },

  // ==================== 5. 商业 & 金融创投 (6个) ====================
  {
    id: 'xueqiu',
    name: '雪球 · 热门股票社区',
    icon: '❄️',
    color: '#3399ff',
    category: 'finance',
    categoryLabel: '价值投资',
    updateFreq: '实时',
    description: '聪明的投资者社区，聚焦财报与行业深度推演',
    items: [
      { rank: 1, title: 'AI 算力基础设施与芯片互联技术全景产业链调研', hot: '48.2w 讨论', tag: '焦点', delta: 'up' },
      { rank: 2, title: '光伏与储能新周期：出海高景气与国内装机韧性', hot: '32.1w 讨论', tag: '', delta: 'same' }
    ]
  },
  {
    id: 'eastmoney',
    name: '东方财富 · 热榜',
    icon: '📈',
    color: '#f35b00',
    category: 'finance',
    categoryLabel: '股市行情',
    updateFreq: '交易日实时',
    description: '海量股民情绪、主力资金流向与热点概念',
    items: [
      { rank: 1, title: '商业航天与卫星互联网概念股掀起涨停潮', hot: '热度 9800', tag: '主线', delta: 'up' }
    ]
  },
  {
    id: 'tonghuashun',
    name: '同花顺 · 实时热搜',
    icon: '💹',
    color: '#e53935',
    category: 'finance',
    categoryLabel: '量化盯盘',
    updateFreq: '实时',
    description: '快速捕捉盘面异动与机构调研动向',
    items: [
      { rank: 1, title: '液冷服务器龙头斩获百亿级算力中心采购大单', hot: '92.4万搜索', tag: '爆发', delta: 'up' }
    ]
  },
  {
    id: 'yicai',
    name: '第一财经 · 快讯',
    icon: '📊',
    color: '#1e88e5',
    category: 'finance',
    categoryLabel: '财经快讯',
    updateFreq: '实时',
    description: '专业宏观经济指标与跨国贸易动态解读',
    items: [
      { rank: 1, title: '全球央行货币政策分化背景下的跨境资本流动展望', hot: '深度解读', tag: '', delta: 'same' }
    ]
  },
  {
    id: 'gelonghui',
    name: '格隆汇 · 港美股热门',
    icon: '🌐',
    color: '#00897b',
    category: 'finance',
    categoryLabel: '全球视野',
    updateFreq: '每日',
    description: '港股、中概股与美股科技巨头深度财报解析',
    items: [
      { rank: 1, title: '硅谷七巨头 AI 资本开支再创新高，硬件供应链全面受益', hot: '研报 Top1', tag: '全球', delta: 'up' }
    ]
  },
  {
    id: 'wallstreetcn',
    name: '华尔街见闻',
    icon: '🐂',
    color: '#1a237e',
    category: 'finance',
    categoryLabel: '全球宏观',
    updateFreq: '实时',
    description: '7x24 小时全球市场异动与大宗商品速递',
    items: [
      { rank: 1, title: '黄金创历史新高背后的全球去美元化与地缘避险定价', hot: '实时焦点', tag: '置顶', delta: 'up' }
    ]
  },

  // ==================== 6. 游戏 & 泛二次元 (6个) ====================
  {
    id: 'steam',
    name: 'Steam 全球热销榜',
    icon: '💨',
    color: '#171a21',
    category: 'gaming',
    categoryLabel: 'PC单机',
    updateFreq: '每日',
    description: '全球核心玩家单机、独立神作与在线峰值',
    items: [
      { rank: 1, title: '国产硬核虚幻5修真动作游戏《破妄者》登顶全球心愿单', hot: '★ 98% 好评', tag: '榜首', delta: 'up' },
      { rank: 2, title: '赛博朋克回合制战术解谜《天机网络》发售首周破百万', hot: '★ 95% 特别好评', tag: '黑马', delta: 'up' }
    ]
  },
  {
    id: 'taptap',
    name: 'TapTap 热门榜',
    icon: '📱',
    color: '#00c3b2',
    category: 'gaming',
    categoryLabel: '手游前沿',
    updateFreq: '每日',
    description: '优质手游发现社区与真实玩家打分',
    items: [
      { rank: 1, title: '开放世界仙侠探索手游《大渊行》开放全球二测', hot: '评分 9.4', tag: '高分预定', delta: 'up' }
    ]
  },
  {
    id: 'mihoyo',
    name: '米游社 · 核心热帖',
    icon: '✨',
    color: '#ffb300',
    category: 'gaming',
    categoryLabel: '二次元玩家',
    updateFreq: '实时',
    description: '剧情考据、角色养成与世界观硬核解谜',
    items: [
      { rank: 1, title: '万字考据：从神话原型到游戏文本，深度解析提瓦特星空法则', hot: '9.8w 赞', tag: '考据神帖', delta: 'up' }
    ]
  },
  {
    id: 'nga',
    name: 'NGA 玩家社区',
    icon: '🛡️',
    color: '#6d4c41',
    category: 'gaming',
    categoryLabel: '硬核硬派',
    updateFreq: '实时',
    description: '魔兽、硬核网游与跨学科数值严密测算',
    items: [
      { rank: 1, title: '【数值机制分析】修真小说里战斗力膨胀的数学模型与崩坏临界点', hot: '1420 楼', tag: '精华', delta: 'up' }
    ]
  },
  {
    id: 'gcores',
    name: '机核网 GCORES',
    icon: '📻',
    color: '#e64a19',
    category: 'gaming',
    categoryLabel: '游戏电台',
    updateFreq: '每周',
    description: '次时代游戏文化、深度电台叙事与开发者专访',
    items: [
      { rank: 1, title: '【电台节目】重返先秦：我们为什么渴望在虚拟世界里寻仙问道？', hot: '4.8w 听', tag: '深度节目', delta: 'up' }
    ]
  },
  {
    id: 'ign_cn',
    name: 'IGN 中国 · 头条',
    icon: '🎮',
    color: '#b71c1c',
    category: 'gaming',
    categoryLabel: '权威评测',
    updateFreq: '每日',
    description: '全球游戏产业新闻、大师级评测与独家前瞻',
    items: [
      { rank: 1, title: '年度动作冒险黑马《九渊：剑落黄泉》前瞻体验：见招拆招的极致快感', hot: '9.5 Masterpiece', tag: '独家', delta: 'up' }
    ]
  }
];
