import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  Bot, 
  Send, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  BookmarkPlus, 
  Copy, 
  Check, 
  Search, 
  Plus, 
  MessageSquare, 
  Settings, 
  Sliders, 
  Layers, 
  Trash2, 
  Volume2, 
  Share2, 
  CheckCircle2,
  ChevronRight,
  UserCheck,
  Shield,
  Zap,
  Globe,
  Radio,
  FileText,
  Activity,
  Cpu,
  GitCommit,
  Network,
  Maximize2,
  Minimize2,
  X,
  PieChart,
  BarChart3,
  TrendingUp,
  ArrowDown
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

export interface GroupMember {
  id: string;
  name: string;
  title: string;
  avatar: string;
  color: string;
  systemPrompt: string;
  stance: string;
  model: string;
  dimension: string; // 维度标签
}

export interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderColor: string;
  senderTitle: string;
  content: string;
  timestamp: string;
  isUser?: boolean;
  logicStepTag?: string; // 逻辑环节标签 (e.g. "提出命题", "施加约束", "反派死局", "毒舌校准")
}

export interface GroupRoom {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  topic: string;
  members: GroupMember[];
}

const DEFAULT_ROOMS: GroupRoom[] = [
  {
    id: 'room-novel',
    name: '长篇小说编剧圆桌群',
    icon: '📖',
    category: '创意写作',
    description: '主编、世界观架构师、反派演练师与毒舌评论员的头脑风暴',
    topic: '如何设计第 3 卷大渊夜变中主角破妄瞳进阶与宗门垄断清气的极端戏剧冲突？',
    members: [
      {
        id: 'mem-1',
        name: '总编剧 · 执笔仙',
        title: '叙事动力学导师',
        avatar: '✍️',
        color: '#ff8200',
        systemPrompt: '你是一名资深网络小说总编剧，擅长把握节奏高潮、伏笔铺设与读者期待感管理。发言紧凑有力，聚焦剧情张力。',
        stance: '注重节奏爽点与主线推力',
        model: 'Gemini 2.5 Flash',
        dimension: '叙事推进'
      },
      {
        id: 'mem-2',
        name: '架构师 · 玄枢子',
        title: '世界观因果核验官',
        avatar: '📐',
        color: '#0a84ff',
        systemPrompt: '你是一名严谨的世界观架构师，精通修真体系的物质能量守恒、气机清浊因果与境界生理代价。坚决反对无脑开挂。',
        stance: '坚持法则自洽与生理严苛代价',
        model: 'Claude 3.7 Sonnet',
        dimension: '因果法则'
      },
      {
        id: 'mem-3',
        name: '反派演练 · 幽绝魔',
        title: '高智商对手策动机',
        avatar: '🎭',
        color: '#bf5af2',
        systemPrompt: '你是大反派的角色扮演者，拥有冷酷、务实且逻辑极其严密的博弈思维。你时刻在寻找主角逻辑与防御漏洞，策划致命死局。',
        stance: '高智商反派逻辑与致命布局',
        model: 'DeepSeek R1',
        dimension: '危机博弈'
      },
      {
        id: 'mem-4',
        name: '毒舌评委 · 阅卷客',
        title: '黄金读者代表',
        avatar: '🧐',
        color: '#30d158',
        systemPrompt: '你代表审美极为挑剔的老书虫与读者，专门挑刺陈词滥调，指出降智桥段，并提出令人眼前一亮的反套路建议。',
        stance: '严厉批判套路，追求创新反转',
        model: 'GPT-4o',
        dimension: '读者审美'
      }
    ]
  },
  {
    id: 'room-tech',
    name: '硬核科技创投评审群',
    icon: '🚀',
    category: '科技前沿',
    description: 'CTO、宏观经济学家、风险投资人与合规监管官的闭门研讨',
    topic: '端侧 70B 大模型全本地脱网运行与分布式长程知识库商业化落地的可行性论证',
    members: [
      {
        id: 'mem-t1',
        name: '首席技术官 CTO',
        title: '架构与性能专家',
        avatar: '💻',
        color: '#0a84ff',
        systemPrompt: '你是一名硬核底层系统架构师，深入分析算力消耗、内存带宽（Unified Memory）与量化压缩极限。',
        stance: '技术可行性与算力架构上限',
        model: 'Gemini 2.5 Pro',
        dimension: '算力与工程'
      },
      {
        id: 'mem-t2',
        name: '风险投资人 VC',
        title: '合伙人 / 资本风向',
        avatar: '💼',
        color: '#ff9f0a',
        systemPrompt: '你是一名一线科技 VC 投资人，极度关注单位经济模型（Unit Economics）、用户留存壁垒与商业护城河。',
        stance: '商业化变现与市场天花板',
        model: 'GPT-4o',
        dimension: '资本估值'
      },
      {
        id: 'mem-t3',
        name: '安全合规官 CISO',
        title: '隐私与安全法律顾问',
        avatar: '🛡️',
        color: '#ff453a',
        systemPrompt: '你负责数据出海、脱网数据所有权与模型越狱防御，时刻提示合规边界。',
        stance: '企业数据隐私与合规红线',
        model: 'Claude 3.7 Sonnet',
        dimension: '安全合规'
      }
    ]
  },
  {
    id: 'room-archeology',
    name: '先秦古文明与异闻考据会',
    icon: '🏛️',
    category: '学术人文',
    description: '古文字学家、民俗志怪学者与物理因果解构师的跨学科对话',
    topic: '三星堆古蜀青铜神树与《山海经》建木神话在物质遗存与空间宇宙观上的同构关系',
    members: [
      {
        id: 'mem-a1',
        name: '古文字学家 · 秉简先生',
        title: '甲骨金文考据领队',
        avatar: '📜',
        color: '#ffd60a',
        systemPrompt: '你精通先秦金文与卜辞，严格基于出土文献字形演变与音韵考据发言。',
        stance: '出土文献与字形实证',
        model: 'Claude 3.7 Sonnet',
        dimension: '文字训诂'
      },
      {
        id: 'mem-a2',
        name: '神话民俗学家 · 语冰客',
        title: '民俗人类学研究员',
        avatar: '🏮',
        color: '#ff375f',
        systemPrompt: '你精通上古巫祭仪式、神煞传说与民间萨满宇宙观，善于从仪式结构中解析神话隐喻。',
        stance: '原始信仰与巫祭仪式结构',
        model: 'Gemini 2.5 Flash',
        dimension: '民俗仪式'
      }
    ]
  }
];

export const AIGroupChatView: React.FC<{
  onSaveToMaterial?: (title: string, body: string) => void;
}> = ({ onSaveToMaterial }) => {
  const [rooms, setRooms] = useState<GroupRoom[]>(DEFAULT_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>('room-novel');
  const [messages, setMessages] = useState<Record<string, GroupMessage[]>>({
    'room-novel': [
      {
        id: 'msg-1',
        senderId: 'mem-1',
        senderName: '总编剧 · 执笔仙',
        senderAvatar: '✍️',
        senderColor: '#ff8200',
        senderTitle: '叙事动力学导师',
        content: '各位老师，第 3 卷“大渊夜变”是整部小说的中期爆发点。我设想在祭天大典时，主角沈玄烛必须在万众瞩目下强行开眼，破除九大宗门的伪善护宗阵，大家觉得怎样切入最能调动情绪？',
        timestamp: '11:02',
        logicStepTag: '提出主线命题'
      },
      {
        id: 'msg-2',
        senderId: 'mem-2',
        senderName: '架构师 · 玄枢子',
        senderAvatar: '📐',
        senderColor: '#0a84ff',
        senderTitle: '世界观因果核验官',
        content: '等等，破妄瞳每次强开必须支付视神经枯竭与神魂浊煞侵蚀的严苛代价。如果他无损强开，整个设定体系就崩了！必须设计“每次直视神阵，眼底就会渗出青铜锈血，且消耗一枚续命金蝉”的约束机制。',
        timestamp: '11:03',
        logicStepTag: '施加法则约束'
      },
      {
        id: 'msg-3',
        senderId: 'mem-3',
        senderName: '反派演练 · 幽绝魔',
        senderAvatar: '🎭',
        senderColor: '#bf5af2',
        senderTitle: '高智商对手策动机',
        content: '哼，如果我是宗门掌事柳长卿，我早就预料到他会开眼。我会在护宗阵核心埋入“逆反生生镜”，只要他破妄瞳的视线聚焦阵眼，就会瞬间将浊煞反弹给全场无辜的外门弟子——逼主角在“自证清白”与“殃及无辜”之间两难！',
        timestamp: '11:04',
        logicStepTag: '设下两难死局'
      },
      {
        id: 'msg-4',
        senderId: 'mem-4',
        senderName: '毒舌评委 · 阅卷客',
        senderAvatar: '🧐',
        senderColor: '#30d158',
        senderTitle: '黄金读者代表',
        content: '这招反套路设计极好！但千万别让主角临阵突破靠吼叫解开，必须让主角早在第一卷埋下的商盟契约伏笔在此时生效——商贾掌事柳清霜暗中调包生生镜的阵髓，完成绝地伏笔反杀！',
        timestamp: '11:05',
        logicStepTag: '读者审美反套路校准'
      }
    ]
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isAutoDebating, setIsAutoDebating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [nextSpeakerIndex, setNextSpeakerIndex] = useState(0);
  const [selectedMentionId, setSelectedMentionId] = useState<string>('all');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // ⭐ macOS 活动监视器风格可视化面板显示开关
  const [showActivityMonitor, setShowActivityMonitor] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoDebateTimerRef = useRef<any>(null);

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];
  const currentMessages = messages[activeRoom.id] || [];

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isGenerating]);

  // ============================================================
  // 🧮 多智能体贡献权重与交互拓扑流向实时量化计算
  // ============================================================
  const monitorStats = useMemo(() => {
    const totalMsgCount = currentMessages.length;
    if (totalMsgCount === 0) {
      return {
        memberStats: activeRoom.members.map(m => ({ ...m, count: 0, charCount: 0, percentage: 25 })),
        totalChars: 0,
        activeFlowSteps: []
      };
    }

    // Calculate message counts & character counts per member
    let totalChars = 0;
    const countMap: Record<string, { count: number; chars: number }> = {};
    activeRoom.members.forEach(m => { countMap[m.id] = { count: 0, chars: 0 }; });

    currentMessages.forEach(msg => {
      totalChars += msg.content.length;
      if (countMap[msg.senderId]) {
        countMap[msg.senderId].count += 1;
        countMap[msg.senderId].chars += msg.content.length;
      }
    });

    const memberStats = activeRoom.members.map(m => {
      const chars = countMap[m.id]?.chars || 0;
      const count = countMap[m.id]?.count || 0;
      const percentage = totalChars > 0 ? Math.round((chars / totalChars) * 100) : 0;
      return {
        ...m,
        count,
        charCount: chars,
        percentage
      };
    });

    // Flow steps
    const activeFlowSteps = currentMessages.map((msg, idx) => ({
      index: idx + 1,
      senderName: msg.senderName,
      senderColor: msg.senderColor,
      senderAvatar: msg.senderAvatar,
      tag: msg.logicStepTag || (idx === 0 ? '提出命题' : idx % 2 === 1 ? '约束与辩驳' : '拓展反转'),
      snippet: msg.content.slice(0, 36) + '...'
    }));

    return {
      memberStats,
      totalChars,
      activeFlowSteps
    };
  }, [currentMessages, activeRoom]);

  // Handle single turn AI generation
  const generateAgentReply = async (targetMember: GroupMember, customPrompt?: string) => {
    setIsGenerating(true);

    const contextHistory = currentMessages.slice(-6).map(m => `${m.senderName}: ${m.content}`).join('\n');
    const promptToSend = customPrompt || inputPrompt;

    // Logic step tag inferencing
    const stepTags = ['深化叙事推力', '因果法则约束', '反派两难布局', '反套路审美修正', '多维整合收束'];
    const assignedTag = stepTags[nextSpeakerIndex % stepTags.length];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `${targetMember.systemPrompt}\n当前群聊主题：【${activeRoom.topic}】\n你的立场：${targetMember.stance}。\n请直接以你的角色身份在群聊中发表见解（150字以内），逻辑严密、个性鲜明、针对前序发言展开回应或提出建设性反驳。`
            },
            {
              role: 'user',
              content: `【近期群聊记录】\n${contextHistory}\n\n【用户最新引导或话题】\n${promptToSend || '请根据前序讨论继续发表你的见解'}`
            }
          ]
        })
      });

      const data = await response.json();
      const replyText = data.reply || data.content || data.response || '（沉思片刻后提出观点）';

      const newMsg: GroupMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        senderId: targetMember.id,
        senderName: targetMember.name,
        senderAvatar: targetMember.avatar,
        senderColor: targetMember.color,
        senderTitle: targetMember.title,
        content: replyText,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        logicStepTag: assignedTag
      };

      setMessages(prev => ({
        ...prev,
        [activeRoom.id]: [...(prev[activeRoom.id] || []), newMsg]
      }));
    } catch (e) {
      const newMsg: GroupMessage = {
        id: `msg-${Date.now()}`,
        senderId: targetMember.id,
        senderName: targetMember.name,
        senderAvatar: targetMember.avatar,
        senderColor: targetMember.color,
        senderTitle: targetMember.title,
        content: `从我的角度来看，这个设定在【${targetMember.stance}】层面具有极大的延展空间，我们应当顺着这个线索进一步细化！`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        logicStepTag: assignedTag
      };
      setMessages(prev => ({
        ...prev,
        [activeRoom.id]: [...(prev[activeRoom.id] || []), newMsg]
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  // User sends a message or triggers a turn
  const handleSendMessage = () => {
    if (!inputPrompt.trim()) return;

    const userMsg: GroupMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user',
      senderName: '主持人 (你)',
      senderAvatar: '👤',
      senderColor: '#0a84ff',
      senderTitle: '群主 / 研讨主持人',
      content: inputPrompt,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
      logicStepTag: '主持人调度与引导'
    };

    setMessages(prev => ({
      ...prev,
      [activeRoom.id]: [...(prev[activeRoom.id] || []), userMsg]
    }));

    const textToPass = inputPrompt;
    setInputPrompt('');

    if (selectedMentionId !== 'all') {
      const member = activeRoom.members.find(m => m.id === selectedMentionId);
      if (member) {
        setTimeout(() => generateAgentReply(member, textToPass), 400);
      }
    } else {
      const nextMember = activeRoom.members[nextSpeakerIndex % activeRoom.members.length];
      setNextSpeakerIndex(prev => prev + 1);
      setTimeout(() => generateAgentReply(nextMember, textToPass), 400);
    }
  };

  // Auto round-robin debate loop
  useEffect(() => {
    if (isAutoDebating && !isGenerating) {
      autoDebateTimerRef.current = setTimeout(() => {
        const nextMember = activeRoom.members[nextSpeakerIndex % activeRoom.members.length];
        setNextSpeakerIndex(prev => prev + 1);
        generateAgentReply(nextMember);
      }, 2400);
    }
    return () => clearTimeout(autoDebateTimerRef.current);
  }, [isAutoDebating, isGenerating, nextSpeakerIndex, activeRoom]);

  // Save full discussion to material knowledge base
  const handleSaveDiscussionToMaterial = async () => {
    const transcript = currentMessages.map(m => `**${m.senderName} (${m.senderTitle})** [${m.timestamp} - ${m.logicStepTag || '发言'}]:\n${m.content}\n`).join('\n---\n\n');
    try {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `AI群聊纪要: ${activeRoom.name}`,
          body: `## 📌 群聊主题：${activeRoom.topic}\n\n### 👥 参会智能体与贡献占比：\n${monitorStats.memberStats.map(m => `- **${m.name}** (${m.title})：贡献权重 ${m.percentage}% | 观点倾向：${m.stance}`).join('\n')}\n\n---\n\n### 💬 讨论全文记录：\n\n${transcript}`,
          kind: 'meeting',
          tags: ['AI群聊', '多智能体圆桌', '活动监视器', activeRoom.category, activeRoom.name]
        })
      });
      setSavedSuccess(true);
      if (onSaveToMaterial) {
        onSaveToMaterial(`AI群聊纪要: ${activeRoom.name}`, transcript);
      }
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--apple-bg)] select-none text-[var(--apple-text-primary)]">
      {/* ============================================================ */}
      {/* 1. LEFT ROOMS & AGENT SQUAD SIDEBAR */}
      {/* ============================================================ */}
      <aside className="w-68 border-r border-[var(--apple-border)] bg-[var(--apple-surface)]/80 backdrop-blur-2xl flex flex-col shrink-0">
        <div className="h-14 px-4 border-b border-[var(--apple-separator)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[var(--apple-text-primary)]">
              AI 群聊圆桌
            </span>
          </div>
          <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 font-mono text-[9px] font-bold border border-purple-500/20">
            Multi-Agent
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <p className="px-2 text-[10px] font-bold text-[var(--apple-text-tertiary)] uppercase tracking-wider">
            预设群聊房间
          </p>

          {rooms.map(room => (
            <div
              key={room.id}
              onClick={() => {
                setActiveRoomId(room.id);
                setIsAutoDebating(false);
              }}
              className={`p-2.5 rounded-2xl transition-all cursor-pointer flex items-start gap-2.5 ${
                activeRoomId === room.id
                  ? 'bg-[var(--apple-accent-subtle)] border border-[var(--apple-accent)]/30 shadow-xs'
                  : 'hover:bg-[var(--apple-subtle)] border border-transparent'
              }`}
            >
              <span className="text-lg shrink-0 mt-0.5">{room.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[var(--apple-text-primary)] truncate">
                    {room.name}
                  </h4>
                  <span className="text-[9px] font-mono text-[var(--apple-text-tertiary)]">
                    {room.members.length}人
                  </span>
                </div>
                <p className="text-[10px] text-[var(--apple-text-tertiary)] line-clamp-1 mt-0.5">
                  {room.description}
                </p>
              </div>
            </div>
          ))}

          {/* Current Room Member Cards */}
          <div className="pt-3 border-t border-[var(--apple-separator)] space-y-2">
            <p className="px-2 text-[10px] font-bold text-[var(--apple-text-tertiary)] uppercase tracking-wider flex items-center justify-between">
              <span>群内专家智能体</span>
              <span>{activeRoom.members.length} 位</span>
            </p>

            <div className="space-y-1.5">
              {activeRoom.members.map(member => (
                <div
                  key={member.id}
                  className="p-2 rounded-xl bg-[var(--apple-subtle)]/60 border border-[var(--apple-border)] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-sm">{member.avatar}</span>
                      <span className="truncate max-w-[120px]" style={{ color: member.color }}>
                        {member.name}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[var(--apple-text-tertiary)]">
                      {member.dimension}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--apple-text-secondary)] pl-5 line-clamp-1">
                    {member.stance}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN CHAT AREA */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <header className="h-14 border-b border-[var(--apple-border)] bg-[var(--apple-glass)] backdrop-blur-xl px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">{activeRoom.icon}</span>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-[var(--apple-text-primary)] truncate">
                {activeRoom.name}
              </h2>
              <p className="text-[10px] text-[var(--apple-text-tertiary)] truncate">
                议题：{activeRoom.topic}
              </p>
            </div>
          </div>

          {/* Controls: Auto-Debate + Activity Monitor Toggle + Export */}
          <div className="flex items-center gap-2">
            {/* Auto Debate Toggle Button */}
            <button
              onClick={() => setIsAutoDebating(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-xs ${
                isAutoDebating
                  ? 'bg-amber-500 text-white border-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.25)] animate-pulse'
                  : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-primary)] hover:border-[var(--apple-border-strong)]'
              }`}
            >
              {isAutoDebating ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>暂停自动交锋</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>开启连续观点碰撞</span>
                </>
              )}
            </button>

            {/* ⭐ 核心新增：活动监视器可视化面板开关 */}
            <button
              onClick={() => setShowActivityMonitor(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-xs ${
                showActivityMonitor
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent shadow-[0_4px_12px_rgba(16,185,129,0.25)]'
                  : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:border-[var(--apple-border-strong)]'
              }`}
              title="切换 macOS 活动监视器风格的交互流向与贡献权重看板"
            >
              <Activity className={`w-3.5 h-3.5 ${showActivityMonitor ? 'animate-pulse' : ''}`} />
              <span>交互监视器</span>
            </button>

            {/* Save to Material */}
            <button
              onClick={handleSaveDiscussionToMaterial}
              disabled={savedSuccess || currentMessages.length === 0}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                savedSuccess
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-[var(--apple-subtle)] border-[var(--apple-border)] text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]'
              }`}
              title="保存整场群聊记录为素材资产"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>已收录</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>收录纪要</span>
                </>
              )}
            </button>

            {/* Clear Messages */}
            <button
              onClick={() => {
                setMessages(prev => ({ ...prev, [activeRoom.id]: [] }));
                setIsAutoDebating(false);
              }}
              className="p-1.5 rounded-xl text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-subtle)]"
              title="清空本群消息"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 select-text">
          {currentMessages.length === 0 ? (
            <div className="py-24 text-center space-y-3 select-none">
              <Users className="w-10 h-10 text-[var(--apple-text-tertiary)] mx-auto opacity-40" />
              <p className="text-xs text-[var(--apple-text-secondary)] font-semibold">
                群聊已建立，{activeRoom.members.length} 位 AI 专家已就位
              </p>
              <p className="text-[11px] text-[var(--apple-text-tertiary)] max-w-sm mx-auto">
                点击“开启连续观点碰撞”或在下方输入主持人指引，启动多智能体深度讨论！
              </p>
            </div>
          ) : (
            currentMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 max-w-3xl ${
                  msg.isUser ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-xs shrink-0 select-none"
                  style={{ backgroundColor: `${msg.senderColor}20`, border: `1px solid ${msg.senderColor}40` }}
                >
                  {msg.senderAvatar}
                </div>

                {/* Bubble Container */}
                <div className={`space-y-1 ${msg.isUser ? 'items-end' : ''}`}>
                  <div className={`flex items-center gap-2 text-[10px] ${msg.isUser ? 'justify-end' : ''}`}>
                    <span className="font-bold text-[var(--apple-text-primary)]">
                      {msg.senderName}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-[var(--apple-subtle)] text-[var(--apple-text-tertiary)] font-mono">
                      {msg.senderTitle}
                    </span>
                    {msg.logicStepTag && (
                      <span className="px-1.5 py-0.2 rounded bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)] font-mono text-[9px] font-bold border border-[var(--apple-accent)]/20">
                        {msg.logicStepTag}
                      </span>
                    )}
                    <span className="text-[var(--apple-text-tertiary)] font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Message Body */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      msg.isUser
                        ? 'bg-[var(--apple-accent)] text-white rounded-tr-xs'
                        : 'bg-[var(--apple-surface)] border border-[var(--apple-border)] text-[var(--apple-text-primary)] rounded-tl-xs'
                    }`}
                  >
                    <AppleMarkdown content={msg.content} />
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-[var(--apple-text-tertiary)] font-mono animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-[var(--apple-accent)] animate-spin" />
              <span>智能体正在组织论据并准备发言...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[var(--apple-separator)] bg-[var(--apple-surface)]/90 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-2 select-none">
            <span className="text-[10px] font-mono text-[var(--apple-text-tertiary)]">指定发言人：</span>
            <select
              value={selectedMentionId}
              onChange={e => setSelectedMentionId(e.target.value)}
              className="bg-[var(--apple-subtle)] border border-[var(--apple-border)] rounded-lg text-[11px] px-2 py-0.5 text-[var(--apple-text-primary)] focus:outline-none focus:border-[var(--apple-accent)]"
            >
              <option value="all">🔄 自由接龙 (轮流依次发言)</option>
              {activeRoom.members.map(m => (
                <option key={m.id} value={m.id}>
                  @{m.name} ({m.title})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="以主持人身份发言、抛出新议题、或 @特定专家 进行反驳..."
              className="flex-1 px-4 py-2 bg-[var(--apple-subtle)] border border-[var(--apple-border)] focus:border-[var(--apple-accent)] rounded-xl text-xs text-[var(--apple-text-primary)] placeholder-[var(--apple-text-tertiary)] focus:outline-none shadow-xs"
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputPrompt.trim() || isGenerating}
              className="px-4 py-2 rounded-xl bg-[var(--apple-accent)] text-white text-xs font-semibold shadow-xs hover:bg-[var(--apple-accent-hover)] transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>发送</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. ⭐ macOS 活动监视器风格：多智能体交互流向与权重面板 */}
      {/* ============================================================ */}
      {showActivityMonitor && (
        <aside className="w-84 border-l border-[var(--apple-border-strong)] bg-[var(--apple-surface)]/95 dark:bg-[#1c1c1e]/95 backdrop-blur-3xl flex flex-col shrink-0 shadow-[0_24px_60px_rgba(0,0,0,0.5)] z-30 animate-in fade-in slide-in-from-right-4 duration-200 select-none">
          {/* Activity Monitor Header (macOS Traffic Lights + Title) */}
          <div className="h-11 px-4 border-b border-[var(--apple-separator)] bg-[var(--apple-subtle)]/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowActivityMonitor(false)}
                className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-90 flex items-center justify-center text-[8px] text-[#4c0000] font-bold group shadow-xs"
              >
                <span className="opacity-0 group-hover:opacity-100">✕</span>
              </button>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-xs" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-xs" />

              <span className="ml-2 text-[11px] font-bold text-[var(--apple-text-primary)] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>交互活动监视器</span>
              </span>
            </div>

            <span className="text-[9px] font-mono text-[var(--apple-text-tertiary)] px-1.5 py-0.2 rounded bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
              {currentMessages.length} 轮交互
            </span>
          </div>

          {/* Activity Monitor Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans select-text">
            {/* 1. Contribution Weight (CPU / Load style meters) */}
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-[var(--apple-subtle)]/40 border border-[var(--apple-border)]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--apple-text-primary)]">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[var(--apple-accent)]" />
                  <span>各智能体贡献权重与负载</span>
                </span>
                <span className="font-mono text-[10px] text-[var(--apple-text-tertiary)]">
                  {monitorStats.totalChars} 字符产出
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {monitorStats.memberStats.map(member => (
                  <div key={member.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-1 font-bold" style={{ color: member.color }}>
                        <span>{member.avatar}</span>
                        <span className="truncate max-w-[140px]">{member.name}</span>
                      </div>
                      <span className="text-[var(--apple-text-secondary)]">
                        {member.percentage}% ({member.count}条)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[var(--apple-subtle)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(member.percentage, 4)}%`,
                          backgroundColor: member.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Viewpoint Stance & Polarity Index */}
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-[var(--apple-subtle)]/40 border border-[var(--apple-border)]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--apple-text-primary)]">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  <span>观点倾向与论据坐标</span>
                </span>
                <span className="font-mono text-[10px] text-amber-500/80">动态平衡</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {monitorStats.memberStats.map(member => (
                  <div
                    key={member.id}
                    className="p-2 rounded-xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-1 text-[10px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate" style={{ color: member.color }}>
                        {member.name.split('·')[0]}
                      </span>
                      <span className="px-1 py-0.2 rounded bg-[var(--apple-subtle)] text-[9px] font-mono text-[var(--apple-text-tertiary)]">
                        {member.dimension}
                      </span>
                    </div>
                    <p className="text-[9px] text-[var(--apple-text-tertiary)] leading-tight line-clamp-2">
                      {member.stance}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Logical Flow Topology (交互逻辑路径拓扑) */}
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-[var(--apple-subtle)]/40 border border-[var(--apple-border)]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--apple-text-primary)]">
                <span className="flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-indigo-400" />
                  <span>逻辑交互流动路径</span>
                </span>
                <span className="font-mono text-[10px] text-[var(--apple-text-tertiary)]">
                  连续接力
                </span>
              </div>

              {monitorStats.activeFlowSteps.length === 0 ? (
                <p className="text-[10px] text-[var(--apple-text-tertiary)] py-4 text-center">
                  暂无交互链路数据
                </p>
              ) : (
                <div className="space-y-2 relative pl-2 pt-1">
                  {/* Vertical connecting line */}
                  <div className="absolute left-4.5 top-3 bottom-3 w-0.5 bg-[var(--apple-separator)]" />

                  {monitorStats.activeFlowSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 relative z-10">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-mono text-white shadow-xs shrink-0 ring-2 ring-[var(--apple-surface)]"
                        style={{ backgroundColor: step.senderColor }}
                      >
                        {step.index}
                      </div>

                      <div className="flex-1 p-2 rounded-xl bg-[var(--apple-surface)] border border-[var(--apple-border)] text-[10px] space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold truncate" style={{ color: step.senderColor }}>
                            {step.senderName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-[var(--apple-subtle)] font-mono text-[9px] text-[var(--apple-accent)] font-semibold">
                            {step.tag}
                          </span>
                        </div>
                        <p className="text-[9px] text-[var(--apple-text-tertiary)] truncate">
                          {step.snippet}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Status */}
          <div className="p-3 border-t border-[var(--apple-separator)] bg-[var(--apple-subtle)]/30 flex items-center justify-between text-[10px] font-mono text-[var(--apple-text-tertiary)]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>链路状态：正常互连</span>
            </span>
            <span>更新频率：实时</span>
          </div>
        </aside>
      )}
    </div>
  );
};
