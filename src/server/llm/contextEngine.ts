export interface ContextMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  pinned?: boolean;
  id?: string;
}

export interface AttachedMaterial {
  id: string;
  title: string;
  body: string;
}

export interface ContextOptions {
  contextWindow: number;
  maxOutput?: number;
  systemPrompt?: string;
  pinnedMessages?: ContextMessage[];
  attachedMaterials?: AttachedMaterial[];
  rollingSummary?: string;
  historyMessages: ContextMessage[];
  currentUserMessage: string;
}

export interface TokenBreakdown {
  systemTokens: number;
  pinnedTokens: number;
  materialsTokens: number;
  summaryTokens: number;
  historyTokens: number;
  userTokens: number;
  totalTokens: number;
  maxBudget: number;
  availableTokens: number;
  historyIncludedCount: number;
  historyTotalCount: number;
  truncatedMaterials: boolean;
}

export interface ContextEngineResult {
  messages: ContextMessage[];
  breakdown: TokenBreakdown;
}

// Token estimation: conservative formula from spec
// Chinese ~0.8-1 token/char, English ~1.3 token/word
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Count CJK characters
  const cjkMatches = text.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;
  // Non-CJK words
  const nonCjkText = text.replace(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g, ' ');
  const words = nonCjkText.trim().split(/\s+/).filter(Boolean);
  const nonCjkTokens = Math.ceil(words.length * 1.3);
  return Math.ceil(cjkCount * 0.9 + nonCjkTokens) + 4; // Add small overhead
}

export function assembleContext(options: ContextOptions): ContextEngineResult {
  const {
    contextWindow = 32000,
    maxOutput = 4096,
    systemPrompt = '你是一个专业、严谨且富有创造力的本地 AI 创作与研究助手。',
    pinnedMessages = [],
    attachedMaterials = [],
    rollingSummary = '',
    historyMessages = [],
    currentUserMessage = ''
  } = options;

  // Available budget = context_window - max_output - safety margin (5%)
  const safetyMargin = Math.floor(contextWindow * 0.05);
  const maxBudget = Math.max(1024, contextWindow - maxOutput - safetyMargin);

  let currentUsed = 0;

  // 1. System Prompt (Must retain)
  const systemTokens = estimateTokens(systemPrompt);
  currentUsed += systemTokens;

  // 6. Current User Message (Must retain, calculate early to guarantee budget)
  const userTokens = estimateTokens(currentUserMessage);
  currentUsed += userTokens;

  // 2. Pinned messages (Must retain unless catastrophic overflow)
  let pinnedTokens = 0;
  const validPinned: ContextMessage[] = [];
  for (const msg of pinnedMessages) {
    const t = estimateTokens(msg.content);
    pinnedTokens += t;
    validPinned.push(msg);
  }
  currentUsed += pinnedTokens;

  // 3. Attached Materials (Truncatable)
  let materialsTokens = 0;
  let materialsPrompt = '';
  let truncatedMaterials = false;
  if (attachedMaterials.length > 0) {
    const remainingForMat = Math.max(0, Math.floor((maxBudget - currentUsed) * 0.35)); // Allow up to 35% remaining
    const formattedMats: string[] = [];

    for (const mat of attachedMaterials) {
      let body = mat.body;
      if (body.length > 1500) {
        body = body.slice(0, 1500) + '...[素材内容过长已截断]';
        truncatedMaterials = true;
      }
      formattedMats.push(`【参考素材：${mat.title}】\n${body}`);
    }

    materialsPrompt = `以下是用户指定的参考素材资料库，请充分吸收并可引用：\n` + formattedMats.join('\n\n');
    materialsTokens = estimateTokens(materialsPrompt);
    currentUsed += materialsTokens;
  }

  // 4. Rolling Summary (If present)
  let summaryTokens = 0;
  let summaryPrompt = '';
  if (rollingSummary.trim()) {
    summaryPrompt = `【前期对话历史滚动纪要】\n${rollingSummary.trim()}`;
    summaryTokens = estimateTokens(summaryPrompt);
    currentUsed += summaryTokens;
  }

  // 5. Recent History Messages (Fill backwards from newest until budget is reached)
  const availableForHistory = Math.max(0, maxBudget - currentUsed);
  let historyTokens = 0;
  const includedHistory: ContextMessage[] = [];

  // Filter out any messages that are already in pinnedMessages to avoid duplication
  const pinnedIds = new Set(validPinned.map(p => p.id).filter(Boolean));
  const candidateHistory = historyMessages.filter(m => !m.id || !pinnedIds.has(m.id));

  // Traverse from newest to oldest
  for (let i = candidateHistory.length - 1; i >= 0; i--) {
    const msg = candidateHistory[i];
    const t = estimateTokens(msg.content);
    if (historyTokens + t <= availableForHistory) {
      historyTokens += t;
      includedHistory.unshift(msg);
    } else {
      break; // Stop when budget exhausted
    }
  }
  currentUsed += historyTokens;

  // Assemble the final message list in strict order
  // Stable prefix first (System -> Materials -> Summary -> Pinned -> History -> Current)
  const finalMessages: ContextMessage[] = [];

  // System
  let fullSystemContent = systemPrompt;
  if (materialsPrompt) {
    fullSystemContent += `\n\n${materialsPrompt}`;
  }
  if (summaryPrompt) {
    fullSystemContent += `\n\n${summaryPrompt}`;
  }

  finalMessages.push({
    role: 'system',
    content: fullSystemContent
  });

  // Pinned messages
  for (const pm of validPinned) {
    finalMessages.push({
      role: pm.role,
      content: pm.content
    });
  }

  // History messages
  for (const hm of includedHistory) {
    finalMessages.push({
      role: hm.role,
      content: hm.content
    });
  }

  // Current User Message
  if (currentUserMessage) {
    finalMessages.push({
      role: 'user',
      content: currentUserMessage
    });
  }

  const breakdown: TokenBreakdown = {
    systemTokens,
    pinnedTokens,
    materialsTokens,
    summaryTokens,
    historyTokens,
    userTokens,
    totalTokens: currentUsed,
    maxBudget,
    availableTokens: Math.max(0, maxBudget - currentUsed),
    historyIncludedCount: includedHistory.length,
    historyTotalCount: candidateHistory.length,
    truncatedMaterials
  };

  return {
    messages: finalMessages,
    breakdown
  };
}
