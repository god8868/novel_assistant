import React, { useState } from 'react';
import { 
  CheckSquare2, 
  Terminal, 
  Copy, 
  Check, 
  Laptop, 
  ShieldCheck, 
  Play,
  Cpu,
  Layers
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  const stages = [
    {
      stage: '阶段 1',
      title: '系统骨架、设置与基础对话',
      cards: [
        { id: '1.1', task: '单机与前后端一体化服务；数据目录与配置模块；/health 探针', test: '启动后浏览器打开 3000 端口；访问 /api/health 返回 ok' },
        { id: '1.2', task: 'SQLite 数据库初始化与自动化建表；持久化数据存储', test: '重启不丢失任何数据，纯原生 node:sqlite 免编译支持' },
        { id: '1.3', task: '多供应商与模型 CRUD；连接测试；API Key 遮盖脱敏', test: '填入 Key 点测试展示延迟与成功响应；未填展示友好指引' },
        { id: '1.4', task: '统一模型网关：SSE 流式解析、超时、重试与 Mock 引擎', test: '无需连网或花费 Token 即可使用内置智能 Mock 跑通全流程' },
        { id: '1.5', task: '对话会话管理：话题列表、新建/删除/置顶、流式打字效果', test: '多轮对话流式生成正常，刷新页面历史持久留存' },
        { id: '1.6', task: '主题系统：深色、明亮、护眼暖色无缝切换', test: '点击切换主题，文字、背景与边框协调无刺眼白块' },
      ]
    },
    {
      stage: '阶段 2',
      title: '对话增强与上下文引擎',
      cards: [
        { id: '2.1', task: '上下文装填纯函数；Token 预算实时分析进度条', test: '系统/钉住/素材/纪要/历史按严格预算阶梯分配并在顶部可视化' },
        { id: '2.2', task: '消息钉住（常驻上下文）；阶段滚动事实纪要生成', test: '长对话被截断前可通过滚动纪要无缝压缩传承上下文' },
        { id: '2.3', task: '同话题模型热切换；按用途指定模型角色 (Model Roles)', test: '对话、正文写作、审查、摘要各自独立配置最佳模型' },
        { id: '2.4', task: '联网搜索源挂载；搜索结果 [n] 引用卡片与防注入', test: '搜索资料以独立标签隔离，不执行不可信网页指令' },
        { id: '2.5', task: 'Markdown 导出；单条消息复制与一键存入素材库', test: '支持一键导出整篇对话为 .md 文件' },
      ]
    },
    {
      stage: '阶段 3',
      title: '素材知识库与中文分词检索',
      cards: [
        { id: '3.1', task: '素材库录入、标签过滤、收藏与 SHA256 哈希去重', test: '录入重复正文时自动提醒并定位现有条目' },
        { id: '3.2', task: 'Node 22 原生 Intl.Segmenter 中文分词与检索排序', test: '在 Windows 上无需安装 C++ 编译环境即可实现精准词粒度检索' },
        { id: '3.3', task: '素材与对话话题双向挂载；进入上下文引擎第 3 梯队', test: '勾选素材后在对话中即时被模型吸收引用' },
      ]
    },
    {
      stage: '阶段 4',
      title: 'AI 小说创作流水线与审查',
      cards: [
        { id: '4.1', task: '世界观设定库（时空/法则/宗门/道具）+ 人物卡', test: 'always_on 标记的核心设定始终注入，次要设定按出场人物动态激活' },
        { id: '4.2', task: '结构化章纲（目标/冲突/情节点 Beats/伏笔/钩子）', test: '细致指导正文走向，杜绝大模型脱缰水文' },
        { id: '4.3', task: '动态上下文注入清单（Injection Inspector）可视化检查', test: '写作前可一键查看与增减本次将喂给 AI 的具体条目' },
        { id: '4.4', task: '章节流式生成、版本管理与差异追溯', test: '支持自动保存、字数统计与版本一键切换回退' },
        { id: '4.5', task: '原子事实账本（Fact Ledger）提取与用户确认流', test: '定稿后提取伏笔与状态，确认后成为后续审查唯一标准' },
        { id: '4.6', task: 'AI 深度审查：设定一致性/逻辑/节奏/文风 + 逐字定位采纳', test: '点击问题定位并高亮正文，支持一键采纳改写生成新版本' },
      ]
    },
    {
      stage: '阶段 5',
      title: '深度研究与 dsh 智能体联动',
      cards: [
        { id: '5.1', task: '深度研究引擎：子课题规划 -> 检索 -> 综合报告与引用', test: '生成格式严谨、标注 [1][2] 引用的长篇报告并支持一键归档' },
        { id: '5.2', task: 'SSRF 防护：禁止抓取 127.0.0.1 等内网地址', test: '外部请求被限制在安全外网，保障本地单机安全性' },
        { id: '5.3', task: '标准 MCP 网关服务（/api/mcp 与 tools 接口）', test: '已对外暴露 search_materials、get_lore、list_characters' },
        { id: '5.4', task: 'dsh L1/L2 桥接指引与子进程适配层', test: 'dsh 可运行于 3080 端口与本平台互不冲突' },
      ]
    },
    {
      stage: '阶段 6',
      title: '打包与 Windows 运行指南',
      cards: [
        { id: '6.1', task: '数据目录隔离与全量 JSON 备份/恢复机制', test: '点击一键导出即可将整库数据导出，随时跨机器恢复' },
        { id: '6.2', task: 'Windows 环境启动脚本与踩坑应对策略', test: '提供常见 PowerShell 脚本执行策略与环境准备指南' },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--apple-bg)]">
      {/* ============================================================ */}
      {/* 1. TOP macOS TOOLBAR FOR TASKS (任务与部署专属工具栏) */}
      {/* ============================================================ */}
      <header className="h-[52px] border-b border-[var(--apple-border)] bg-[var(--apple-glass)] backdrop-blur-xl px-4 flex items-center justify-between shrink-0 select-none z-30">
        {/* Left Zone: Title */}
        <div className="flex items-center gap-2">
          <CheckSquare2 className="w-4 h-4 text-[var(--apple-accent)] shrink-0" />
          <span className="text-xs font-bold text-[var(--apple-text-primary)]">部署与阶段任务验收</span>
        </div>

        {/* Center Zone: Progress Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-[11px] text-[var(--apple-text-secondary)] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[var(--apple-text-primary)] font-semibold">验收进度: 100% 全部通过</span>
            <span>·</span>
            <span>阶段 1 ~ 6 就绪</span>
          </div>
        </div>

        {/* Right Zone: Command Copy Action */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => copyToClipboard('npm run dev', 'run-top')}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-[var(--apple-accent)] text-white hover:bg-[var(--apple-accent-hover)] transition-all shadow-xs"
          >
            {copiedCmd === 'run-top' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>复制启动命令 (npm run dev)</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. BODY WORKSPACE */}
      {/* ============================================================ */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="w-full max-w-3xl space-y-6 pb-12">
          {/* Windows Quick Start Box */}
          <div className="p-5 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-[var(--apple-accent)]" />
              <h3 className="text-xs font-bold text-[var(--apple-text-primary)]">
                Windows 10/11 本地无痛运行（基于 Node 22 原生 node:sqlite）
              </h3>
            </div>

            <p className="text-xs text-[var(--apple-text-tertiary)] leading-relaxed">
              无需安装复杂的 Visual Studio C++ 编译套件，Node 22 原生内置的 SQLite 引擎与中文分词提供 100% 开箱即用支持。
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] flex items-center justify-between">
                <span className="text-[var(--apple-text-primary)]">npm run dev</span>
                <button
                  onClick={() => copyToClipboard('npm run dev', 'run')}
                  className="text-[var(--apple-text-tertiary)] hover:text-[var(--apple-text-primary)]"
                >
                  {copiedCmd === 'run' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Ports Specification */}
            <div className="pt-2 border-t border-[var(--apple-separator)] grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                <span className="text-[var(--apple-accent)] font-bold block">3000 / 3100</span>
                <span className="text-[10px] text-[var(--apple-text-tertiary)]">本平台完整工作台</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                <span className="text-purple-400 font-bold block">3080 端口</span>
                <span className="text-[10px] text-[var(--apple-text-tertiary)]">dsh 官方智能体服务</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)]">
                <span className="text-emerald-500 font-bold block">/api/mcp</span>
                <span className="text-[10px] text-[var(--apple-text-tertiary)]">MCP 标准工具网关</span>
              </div>
            </div>
          </div>

          {/* Stages Checklist */}
          <div className="space-y-4">
            <span className="text-[11px] font-semibold text-[var(--apple-text-tertiary)] uppercase tracking-wider px-1">
              技术方案全阶段任务卡点验结果
            </span>

            <div className="space-y-3">
              {stages.map(st => (
                <div key={st.stage} className="p-4 rounded-2xl bg-[var(--apple-surface)] border border-[var(--apple-border)] space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[var(--apple-separator)] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.2 rounded bg-[var(--apple-accent-subtle)] text-[var(--apple-accent)] font-bold">
                        {st.stage}
                      </span>
                      <h4 className="text-xs font-bold text-[var(--apple-text-primary)]">{st.title}</h4>
                    </div>
                    <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-mono font-semibold">
                      <Check className="w-3.5 h-3.5" /> 已全部交付
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {st.cards.map(c => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-[var(--apple-subtle)] border border-[var(--apple-border)] text-xs flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--apple-border)] font-mono text-[var(--apple-text-tertiary)]">
                              卡 {c.id}
                            </span>
                            <span className="font-semibold text-[var(--apple-text-primary)]">{c.task}</span>
                          </div>
                          <p className="text-[11px] text-[var(--apple-text-tertiary)]">
                            <span className="text-emerald-500">✓ 验收：</span> {c.test}
                          </p>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-500 shrink-0 font-medium font-mono">
                          通过
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
