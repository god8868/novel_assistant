import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// Determine data directory
const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'ai_platform.sqlite');
export const db = new DatabaseSync(DB_PATH);

// Helper for running transactions and queries
export function initDatabase() {
  db.exec(`PRAGMA foreign_keys = ON;`);

  // 4.1 Providers & Models
  db.exec(`
    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      base_url TEXT NOT NULL,
      api_key TEXT,
      kind TEXT NOT NULL DEFAULT 'openai',
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS models (
      id TEXT PRIMARY KEY,
      provider_id TEXT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      model_name TEXT NOT NULL,
      display_name TEXT,
      context_window INTEGER NOT NULL,
      max_output INTEGER NOT NULL DEFAULT 4096,
      supports_tools INTEGER DEFAULT 0,
      supports_json INTEGER DEFAULT 0,
      has_reasoning INTEGER DEFAULT 0,
      price_in REAL,
      price_out REAL
    );

    CREATE TABLE IF NOT EXISTS model_roles (
      role TEXT PRIMARY KEY,
      model_id TEXT REFERENCES models(id)
    );
  `);

  // 4.2 Chat, Topics & Messages
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT,
      sort INTEGER
    );

    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      title TEXT,
      folder_id TEXT REFERENCES folders(id),
      pinned INTEGER DEFAULT 0,
      archived INTEGER DEFAULT 0,
      model_id TEXT REFERENCES models(id),
      system_prompt TEXT,
      web_search INTEGER DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      reasoning TEXT,
      model_id TEXT,
      tokens_in INTEGER,
      tokens_out INTEGER,
      pinned INTEGER DEFAULT 0,
      parent_id TEXT,
      status TEXT DEFAULT 'done',
      citations TEXT,
      created_at INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_messages_topic ON messages(topic_id, created_at);

    CREATE TABLE IF NOT EXISTS topic_summaries (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      covers_until_message_id TEXT NOT NULL,
      content TEXT NOT NULL,
      tokens INTEGER,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS topic_materials (
      topic_id TEXT,
      material_id TEXT,
      PRIMARY KEY(topic_id, material_id)
    );
  `);

  // 4.3 Novel Project, Lore, Character, Outlines, Chapters, Facts, Reviews
  db.exec(`
    CREATE TABLE IF NOT EXISTS novels (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      genre TEXT,
      pov TEXT DEFAULT '三',
      target_words INTEGER DEFAULT 100000,
      style_guide TEXT,
      logline TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS lore_entries (
      id TEXT PRIMARY KEY,
      novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      aliases TEXT,
      keywords TEXT,
      content TEXT NOT NULL,
      always_on INTEGER DEFAULT 0,
      priority INTEGER DEFAULT 5,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY,
      novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      aliases TEXT,
      role TEXT,
      profile TEXT NOT NULL,
      voice TEXT,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS relationships (
      id TEXT PRIMARY KEY,
      novel_id TEXT,
      a_id TEXT,
      b_id TEXT,
      kind TEXT,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS outlines (
      id TEXT PRIMARY KEY,
      novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
      level TEXT NOT NULL,
      parent_id TEXT,
      seq INTEGER,
      title TEXT,
      body TEXT,
      status TEXT DEFAULT 'draft'
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      novel_id TEXT NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
      outline_id TEXT REFERENCES outlines(id),
      seq INTEGER,
      title TEXT,
      status TEXT DEFAULT 'planned',
      current_version_id TEXT,
      summary TEXT,
      word_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS chapter_versions (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      source TEXT,
      note TEXT,
      model_id TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS facts (
      id TEXT PRIMARY KEY,
      novel_id TEXT NOT NULL,
      chapter_id TEXT,
      kind TEXT,
      subject TEXT,
      content TEXT NOT NULL,
      story_time TEXT,
      resolved INTEGER DEFAULT 0,
      confirmed INTEGER DEFAULT 0,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      novel_id TEXT,
      chapter_id TEXT,
      version_id TEXT,
      kind TEXT,
      model_id TEXT,
      status TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS review_items (
      id TEXT PRIMARY KEY,
      review_id TEXT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
      severity TEXT,
      category TEXT,
      quote TEXT,
      start_offset INTEGER,
      end_offset INTEGER,
      issue TEXT,
      suggestion TEXT,
      rewrite TEXT,
      state TEXT DEFAULT 'open'
    );
  `);

  // 4.4 Research & 4.5 Materials
  db.exec(`
    CREATE TABLE IF NOT EXISTS research_tasks (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      engine TEXT DEFAULT 'builtin',
      status TEXT DEFAULT 'pending',
      plan TEXT,
      report TEXT,
      budget_tokens INTEGER DEFAULT 20000,
      used_tokens INTEGER DEFAULT 0,
      created_at INTEGER,
      finished_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS research_sources (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL REFERENCES research_tasks(id) ON DELETE CASCADE,
      idx INTEGER,
      url TEXT,
      title TEXT,
      snippet TEXT,
      content TEXT,
      fetched_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      kind TEXT DEFAULT 'text',
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      source_url TEXT,
      file_path TEXT,
      content_hash TEXT UNIQUE,
      favorite INTEGER DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS material_tags (
      material_id TEXT,
      tag_id TEXT,
      PRIMARY KEY(material_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS material_links (
      material_id TEXT,
      target_type TEXT,
      target_id TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS usage_log (
      id TEXT PRIMARY KEY,
      ts INTEGER,
      role TEXT,
      model_id TEXT,
      tokens_in INTEGER,
      tokens_out INTEGER,
      est_cost REAL,
      ref_type TEXT,
      ref_id TEXT
    );
  `);

  // Seed default providers and models if empty
  seedDefaults();
}

function seedDefaults() {
  const providerCount = (db.prepare('SELECT COUNT(*) as cnt FROM providers').get() as { cnt: number }).cnt;
  if (providerCount > 0) return;

  const now = Date.now();

  // 1. Mock Provider for zero-cost immediate testing & offline usage
  db.prepare(`
    INSERT INTO providers (id, name, base_url, api_key, kind, enabled, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('mock-provider', '内置模拟引擎 (Mock Engine)', 'http://127.0.0.1:3000/api/mock', 'mock-key', 'mock', 1, now);

  db.prepare(`
    INSERT INTO models (id, provider_id, model_name, display_name, context_window, max_output, supports_tools, supports_json, has_reasoning, price_in, price_out)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('mock-smart', 'mock-provider', 'mock-smart-v1', 'Mock 智能旗舰模型', 64000, 4096, 1, 1, 1, 0, 0);

  db.prepare(`
    INSERT INTO models (id, provider_id, model_name, display_name, context_window, max_output, supports_tools, supports_json, has_reasoning, price_in, price_out)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('mock-fast', 'mock-provider', 'mock-fast-v1', 'Mock 极速分析模型', 32000, 2048, 1, 1, 0, 0, 0);

  // 2. Google Gemini Provider (AI Studio Runtime Integration)
  const geminiApiKey = process.env.GEMINI_API_KEY || '';
  db.prepare(`
    INSERT INTO providers (id, name, base_url, api_key, kind, enabled, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('gemini-provider', 'Google Gemini 官方接入', 'https://generativelanguage.googleapis.com', geminiApiKey, 'gemini', 1, now);

  db.prepare(`
    INSERT INTO models (id, provider_id, model_name, display_name, context_window, max_output, supports_tools, supports_json, has_reasoning, price_in, price_out)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('gemini-2.5-flash', 'gemini-provider', 'gemini-2.5-flash', 'Gemini 2.5 Flash (推荐主力/低延迟)', 1000000, 8192, 1, 1, 1, 0.15, 0.6);

  db.prepare(`
    INSERT INTO models (id, provider_id, model_name, display_name, context_window, max_output, supports_tools, supports_json, has_reasoning, price_in, price_out)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('gemini-2.5-pro', 'gemini-provider', 'gemini-2.5-pro', 'Gemini 2.5 Pro (深度写作与高维审查)', 2000000, 8192, 1, 1, 1, 1.25, 5.0);

  // 3. DeepSeek / SiliconFlow / OpenAI Compatible Provider preset
  db.prepare(`
    INSERT INTO providers (id, name, base_url, api_key, kind, enabled, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('deepseek-provider', 'DeepSeek 官方 API (或兼容源)', 'https://api.deepseek.com', '', 'openai', 1, now);

  db.prepare(`
    INSERT INTO models (id, provider_id, model_name, display_name, context_window, max_output, supports_tools, supports_json, has_reasoning, price_in, price_out)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('deepseek-chat', 'deepseek-provider', 'deepseek-chat', 'DeepSeek-V3 (64k)', 64000, 4096, 1, 1, 0, 1.0, 2.0);

  db.prepare(`
    INSERT INTO models (id, provider_id, model_name, display_name, context_window, max_output, supports_tools, supports_json, has_reasoning, price_in, price_out)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('deepseek-reasoner', 'deepseek-provider', 'deepseek-reasoner', 'DeepSeek-R1 (推理与思考)', 64000, 8192, 0, 1, 1, 2.0, 8.0);

  // Default Model Roles
  const defaultModel = geminiApiKey ? 'gemini-2.5-flash' : 'mock-smart';
  const roles = ['chat', 'novel_write', 'novel_review', 'summarize', 'research'];
  for (const role of roles) {
    db.prepare(`INSERT OR REPLACE INTO model_roles (role, model_id) VALUES (?, ?)`).run(role, defaultModel);
  }

  // Default Settings
  const defaultSettings: Record<string, string> = {
    theme: 'dark',
    fontSize: 'medium',
    budgetTokensPerTask: '20000',
    dshPort: '3080',
    dshEnabled: '1',
    mcpWriteAllowed: '1',
    searchProvider: 'built-in-sim'
  };
  for (const [k, v] of Object.entries(defaultSettings)) {
    db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`).run(k, v);
  }

  // Seed sample demo data for instant showcase
  seedDemoNovel();
  seedDemoMaterials();
}

function seedDemoNovel() {
  const novelId = 'demo-novel-1';
  const now = Date.now();

  db.prepare(`
    INSERT OR REPLACE INTO novels (id, title, genre, pov, target_words, style_guide, logline, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    novelId,
    '九渊破妄录',
    '东方玄幻 / 仙侠权谋',
    '三',
    120000,
    '文风凝练沉着，重场景具象描写与心理潜台词，杜绝现代流行词与轻浮网络语。打斗重招式虚实与气机流转，对话言有尽而意无穷。',
    '凡骨少年偶得照见天地破绽的“破妄瞳”，在九大仙门与域外渊海的千年棋局中，以身为刃，刺破宿命伪神的惊天骗局。',
    now,
    now
  );

  // Core Lore entries
  db.prepare(`
    INSERT OR REPLACE INTO lore_entries (id, novel_id, type, name, aliases, keywords, content, always_on, priority, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'lore-1',
    novelId,
    'era',
    '九渊大裂纪',
    JSON.stringify(['大裂之年', '渊海劫']),
    JSON.stringify(['九渊', '渊气', '天规', '裂天']),
    '八百年前天道崩裂，大地陷入九重大渊，清气上浮为悬空仙岛，浊气化作沉沦渊海。天地灵气受污，修真者结丹必经“天人五衰”异化风险。',
    1,
    10,
    now
  );

  db.prepare(`
    INSERT OR REPLACE INTO lore_entries (id, novel_id, type, name, aliases, keywords, content, always_on, priority, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'lore-2',
    novelId,
    'rule',
    '破妄真瞳法则',
    JSON.stringify(['破妄之目', '溯真眼']),
    JSON.stringify(['破妄', '金纹', '破绽', '死穴', '瞳光']),
    '能窥视天地气机运行缝隙与阵法命门，但每次全力催动超过三息，双目经络便受渊煞侵蚀如烈火灼烧，需辅以“寒玉髓”压制。严禁任何毫无代价的连续施展。',
    1,
    9,
    now
  );

  // Characters
  const char1Id = 'char-1';
  db.prepare(`
    INSERT OR REPLACE INTO characters (id, novel_id, name, aliases, role, profile, voice, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    char1Id,
    novelId,
    '沈玄烛',
    JSON.stringify(['小烛', '沈师弟', '七渊猎手']),
    '主角',
    JSON.stringify({
      age: '十九',
      gender: '男',
      appearance: '身形颀长清瘦，常着洗得泛白的玄色棉袍，眉骨深刻，右瞳偶有暗金游丝流转。',
      identity: '栖霞宗外门弃徒，现为流民渡口散修',
      personality: ['冷静克制', '隐忍决绝', '重然诺但绝不盲信'],
      motivation: '查清沈氏一族在“大渊夜变”中被当成阵眼祭炼的真相，寻回失踪的幼妹。',
      fear: '双目彻底魔化失去神智，沦为吞噬血肉的畸变妖魔。',
      abilities: '破妄瞳（初期一重），流风剑意（快且隐蔽，擅近身破招），灵台坚韧胜常人三倍。',
      background: '九岁遭家族灭门，由药肆老瞎子抚养长大，后拜入外门偷学剑术，因拒绝替内门弟子顶罪被逐出师门。',
      speech_style: '语调偏冷，多用祈使短句，少有情绪波动；对信任之人言简意赅。',
      address_terms: { '柳清霜': '柳姑娘 / 执事', '老瞎子': '师父' },
      secrets: '其体内所蕴破妄瞳，乃是八百年前渊尊陨落时撕下的一缕本命残魂所化。'
    }),
    '“阵法有生门三处，但死门……只有我脚下这一处。退后十丈，莫要挡我的剑。”',
    now
  );

  const char2Id = 'char-2';
  db.prepare(`
    INSERT OR REPLACE INTO characters (id, novel_id, name, aliases, role, profile, voice, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    char2Id,
    novelId,
    '柳清霜',
    JSON.stringify(['清霜仙子', '柳掌事']),
    '女主角/盟友',
    JSON.stringify({
      age: '二十一',
      gender: '女',
      appearance: '天水碧绫罗长裙，腰悬银纹算筹，眉目如远山覆雪，神情清雅中透着商贾练达。',
      identity: '万宝仙盟分舵三掌事，暗影阁谍报线人',
      personality: ['精明算度', '果决利落', '外圆内方'],
      motivation: '在仙盟内部权力倾轧中夺得总舵长老令，打破宗门世家对修行资源的垄断。',
      fear: '身份暴露连累商船数百口活命散修。',
      abilities: '算天机甲术，暗器银丝，识鉴天下奇珍。',
      background: '巨贾柳家庶女，凭借非凡商业手腕和狠辣决断在男人堆里杀出血路。',
      speech_style: '含笑带刺，善用账目利害剖析局势，谈判时气场迫人。'
    }),
    '“沈公子，这天下没有无本的买卖。你借我三千灵石渡江，我买你双眼看到的生路，童叟无欺。”',
    now
  );

  // Outlines
  db.prepare(`
    INSERT OR REPLACE INTO outlines (id, novel_id, level, parent_id, seq, title, body, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'outline-c1',
    novelId,
    'chapter',
    null,
    1,
    '第一章：渡口寒雨照真容',
    JSON.stringify({
      goal: '沈玄烛在黑风渡遭遇仙门暗探盘查，初次施展破妄瞳化解危局，并与微服的柳清霜达成初次交易。',
      conflict: '仙门缉凶卫封锁渡口搜捕妖化散修，暗中布下“锁魂缚灵阵”；沈玄烛必须在不暴露神瞳的前提下脱身。',
      cast: ['沈玄烛', '柳清霜', '缉凶卫校尉赵莽'],
      location: '黑水泽黑风渡口，风雨交加之夜',
      story_time: '大裂纪七百八十二年深秋夜',
      beats: [
        '秋雨连绵，黑风渡口积水成泥，沈玄烛披蓑衣等待末班灵梭船。',
        '缉凶卫强势包围渡口，祭出鉴魂镜挨个查验散修，一言不合即刀兵相向。',
        '沈玄烛双眼刺痛，暗中开启破妄瞳，看穿鉴魂镜阵眼乃是一块劣质赤阳玉，气机驳杂。',
        '沈玄烛弹指射出铜钱截断气机，引爆阵法干扰，掩护自己与身旁的乔装商客柳清霜。',
        '两人在灵梭船舱内对质，柳清霜识破沈玄烛非常人，递出金叶子与盟约暗号。'
      ],
      foreshadow_plant: ['赵莽腰间挂着的赤红玉佩，雕刻有沈家覆灭时的特殊云纹标志。'],
      foreshadow_payoff: [],
      ending_hook: '沈玄烛接过灵茶，垂眸看去，茶汤倒影中赵莽的影子正在舱外窗纸上缓缓拔出长刀……',
      target_words: 3000
    }),
    'drafted'
  );

  // Chapter 1 record
  db.prepare(`
    INSERT OR REPLACE INTO chapters (id, novel_id, outline_id, seq, title, status, summary, word_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'chap-1',
    novelId,
    'outline-c1',
    1,
    '第一章：渡口寒雨照真容',
    'drafted',
    '深秋暴雨之夜，沈玄烛在黑风渡口遇仙门缉凶卫设卡，以破妄瞳截断灵阵气机从容避祸，并在逃逸的灵梭船上与万宝仙盟柳清霜达成同盟。',
    2150
  );

  // Chapter 1 version
  const sampleChapterContent = `秋雨落进黑水泽时，腥涩的泥汽里总夹着一股陈年腐铁的冷味。

黑风渡口的木桩已被黑水浪头舔舐得发乌，几盏挂在风灯绳上的明矾琉璃灯在疾风中打着转，将昏黄的光斑洒在泥泞的跳板上。二十余名候船的散修缩着脖颈，像一排被寒潮冻透的寒鸦，谁也不敢高声言语。

沈玄烛压低了斗笠的竹檐。

粗麻蓑衣下的旧布袍被雨水浸透了大半，贴在背脊上泛起刺骨的寒意。他的右掌一直虚按在腰间那柄裹着油布的断剑柄上。剑柄磨损得厉害，缠着的粗麻绳已有些松脱，但只要他的指节扣紧，剑气便能在瞬息间透穿三寸青石。

“下一位！”

跳板前方，两尊高达九尺的铜甲傀儡重重踏在泥水里，泥浆四溅。傀儡之后，五名身着云纹青袍的缉凶卫修士神情冷肃，领头的一名疤面校尉腰悬阔背横刀，手托一面巴掌大的八棱鉴魂古镜。

镜面上泛着幽绿的符光，每一名散修走过，铜镜便发出一声低沉的嗡鸣。

“九渊魔煞肆虐，凡经脉异动、灵光污浊者，当场废去修为羁押！”疤面校尉冷声宣喝，目光如刀刮过在场众人，“莫要心存侥幸。三日前伏龙峡有妖修遁逃，今日这黑风渡，连一只苍蝇也飞不过去。”

队伍末端，一名干瘦的老散修身躯微微发抖。鉴魂镜的光晕照过去时，镜面上陡然腾起一抹赤黑之气。

“渊煞入髓！拿下！”两尊铜甲傀儡双臂如重锏猛然砸落，咔嚓一声骨碎脆响，老散修连惨嚎都未发出，便被铁索扣住琵琶骨拖入了泥水。

四周人群呼吸猛然一窒，数名修士下意识后退半步，面色煞白。

沈玄烛站在人群第七位，斗笠下的眼帘微垂。

此时，他的右瞳深处，一缕细微若游丝的暗金纹路正悄然游弋。那是他藏了十年的破妄真瞳。

在旁人眼中，那面八棱鉴魂镜是威不可测的仙门法器；但在沈玄烛的破妄瞳视野里，世界褪去了皮相颜色，化作了千万道纵横交织的气机光流。

他清晰地看见，鉴魂镜背面镶嵌着一枚赤阳玉，玉质斑驳，内蕴三道隐秘的裂痕。更致命的是，校尉注入法力的经脉走向滞涩，灵气在行至左肘曲池穴时，有半息的虚浮空隙。

整座看似天衣无缝的搜魂封锁阵，在沈玄烛眼中，破绽大如门牖。

然而，瞳中传来的灼烧感也如期而至，像是一根烧红的铁针正慢慢刺入眼底。沈玄烛暗暗咬紧牙关，咽下喉头泛起的一丝甜腥。

“不能久看。三息已过两息。”他心中默念。

就在这时，站在沈玄烛身前的一位青袍客忽然轻咳了一声。那人身披厚重的防雨羽缎披风，头戴帷帽，身形曼妙却透着内敛的锋芒。方才那一咳极轻，却在雨幕中激起一圈极其细微的银丝气障，将周遭散修的泥泞悄然荡开。

沈玄烛目光微凝。

“是个深藏不露的狠角色。”

眼看鉴魂镜的光芒就要扫到青袍客身上，渡口外突然传来一阵尖锐的破空声！黑水泽深处，七八头肋生双翼的渊骨鱼跃出水面，朝着停泊在码头的灵梭飞舟撕咬而去。

“警戒！结阵守舟！”疤面校尉厉喝，手中横刀出鞘半寸，鉴魂镜的法阵陡然一晃。

正是这一晃的间隙！

沈玄烛斗笠下的唇角微动，藏在袖中的左手无声弹指。

一枚磨平了字样的普通青铜钱，借着暴风雨的掩护，以极其刁钻的角度激射而出，正中那鉴魂镜背面赤阳玉的第二道裂痕！

“喀喇！”

一声细微至极的脆响被雷鸣完全掩盖。劣质赤阳玉内的火灵之气瞬息紊乱，与校尉涌出的灵流狠狠对撞！

“轰！”鉴魂镜中猛然喷出一团赤红烟岚，强横的反噬震得疤面校尉倒退三步，口中闷哼一声。阵法光幕如水泡般霍然崩散。

“镜子炸了！阵眼碎了！”渡口顿时大乱，散修们唯恐遭了池鱼之灾，蜂拥着往灵梭船舱内挤去。

混乱中，沈玄烛身形如游鱼般借势一滑，轻松穿过两尊僵直的铜甲傀儡，稳稳踏上了灵梭飞舟的乌木甲板。

刚踏入中层船舱的一处僻静隔间，身后便传来一道清幽如冰泉的女子嗓音：

“沈公子好俊的弹指功夫。凡铁青铜，打碎仙门鉴魂镜，若是让门外那赵莽校尉知晓，恐怕要把你生吞活剥了。”

沈玄烛背脊微绷，右手断剑在油布下缓缓转了半圈。

他转过身，只见方才那位青袍客已褪去了帷帽，露出一张极明艳、又极清冷的鹅蛋脸。她指尖正灵巧地拨弄着一枚银纹算筹，腰间悬着的一枚紫玉令牌在舱灯下流转着暗光——万宝仙盟，柳清霜。

沈玄烛神色平静，右瞳的金芒已尽数敛去，宛如一潭幽井：

“姑娘认错人了。在下不过是个混口饭吃的渡江客。”

柳清霜红唇微抿，似笑非笑地看着他，纤指轻轻推过来一只温热的青瓷茶盏：

“认没认错，喝了这盏‘定魂春’便知。赵校尉腰间那枚云纹赤佩，沈公子刚才可是盯了整整十息。怎么，故人之物，瞧着分外眼熟？”

沈玄烛眼神陡然一沉。

窗外风雨如晦，灵梭飞舟一声长鸣破浪而起。沈玄烛垂眸看向茶盏，茶汤倒影中，隔间雕花纸窗的外侧，一道魁梧的身影正按着长刀，缓缓投下一片浓重的阴翳……`;

  db.prepare(`
    INSERT OR REPLACE INTO chapter_versions (id, chapter_id, content, source, note, model_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('ver-1', 'chap-1', sampleChapterContent, 'ai', '初始AI生成版本', 'gemini-2.5-flash', now);

  db.prepare(`UPDATE chapters SET current_version_id = 'ver-1' WHERE id = 'chap-1'`).run();

  // Seed sample confirmed facts
  db.prepare(`
    INSERT OR REPLACE INTO facts (id, novel_id, chapter_id, kind, subject, content, story_time, resolved, confirmed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'fact-1',
    novelId,
    'chap-1',
    'promise',
    '沈家覆灭线索',
    '缉凶卫校尉赵莽腰间佩戴刻有沈家覆灭时特殊云纹标志的赤红玉佩，疑为当年灭门惨案参与者。',
    '大裂纪七百八十二年深秋夜',
    0,
    1,
    now
  );

  db.prepare(`
    INSERT OR REPLACE INTO facts (id, novel_id, chapter_id, kind, subject, content, story_time, resolved, confirmed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'fact-2',
    novelId,
    'chap-1',
    'state',
    '沈玄烛与柳清霜结识',
    '沈玄烛在黑风渡暗破鉴魂镜被万宝仙盟柳清霜当场看破，两人同处一船隔间达成默契交易。',
    '大裂纪七百八十二年深秋夜',
    0,
    1,
    now
  );
}

function seedDemoMaterials() {
  const now = Date.now();
  const m1 = `【东方古典武侠与仙侠打斗细节笔法指南】
1. 动静相生：写打斗最忌“你一招我一式”的枯燥报菜名。高手过招重在“势”。例如风吹草动、剑未出鞘时气机的牵引压迫。
2. 五感通达：除了视觉，声音（破空呼啸、铁器低鸣、雨滴在剑锋蒸发嘶鸣）与触觉（震荡入骨髓的麻痹）极易唤起身临其境之感。
3. 空间几何：巧妙利用环境掩体、光影、泥泞、狭窄船舱等限制，让破招逻辑自然且合乎物理常理。`;

  db.prepare(`
    INSERT OR REPLACE INTO materials (id, kind, title, body, source_url, content_hash, favorite, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('mat-1', 'text', '仙侠高潮对决与武戏构思笔记', m1, 'local-memo', 'hash-mat-1', 1, now, now);

  const m2 = `【世界观构建：九渊天地法则设定集】
- 上三渊（碧虚渊、太苍渊、紫极渊）：清气所聚，九大天门宗派居所，仙山飞瀑，但暗藏采补凡界维持天阶的腐朽机制。
- 中三渊（黑水渊、赤炎渊、罡风渊）：混乱商旅渡口、散修凡人城寨、灵矿古战场。
- 下三渊（极夜渊、化血渊、无间大渊）：渊魔孳生地，封印着八百年前天地崩裂的远古隐秘。`;

  db.prepare(`
    INSERT OR REPLACE INTO materials (id, kind, title, body, source_url, content_hash, favorite, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('mat-2', 'text', '九渊地理风物与势力阵营白皮书', m2, 'internal-wiki', 'hash-mat-2', 1, now, now);
}
