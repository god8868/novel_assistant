import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  BookMarked, 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Layers, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Download, 
  Copy, 
  Check, 
  ChevronRight, 
  BookOpen, 
  Filter, 
  Cpu, 
  Share2, 
  Sliders, 
  ChevronDown, 
  GitFork, 
  Globe, 
  Scale, 
  AlertTriangle, 
  FileCheck2, 
  FileSpreadsheet, 
  Book, 
  Maximize, 
  X, 
  Code, 
  Printer, 
  Lightbulb, 
  Microscope,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { AppleMarkdown } from '../chat/AppleMarkdown.tsx';

export type ResearchSubMode = 'pipeline' | 'graph' | 'report';

export interface ResearchTask {
  id: string;
  question: string;
  engine: string;
  status: string;
  plan?: string;
  report?: string;
  used_tokens?: number;
  created_at: number;
}

export const ResearchView: React.FC<{ onSaveToMaterial?: (title: string, body: string) => void }> = ({ onSaveToMaterial }) => {
  const [subMode, setSubMode] = useState<ResearchSubMode>('pipeline');
  const [question, setQuestion] = useState('2026-2030 全球具身智能与人形机器人产业链技术路线图及商业化拐点深度研究：重点分析行星滚柱丝杠、六维力传感器、端到端视触觉大模型与特斯拉 Optimus / Figure 商业化量产节奏。');

  const [tasks, setTasks] = useState<ResearchTask[]>([]);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<any | null>(null);

  // Layout Drawers & Toggles
  const [showSidebar, setShowSidebar] = useState(true);
  const [showParamDrawer, setShowParamDrawer] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Pro Parameters State
  const [researchDepthLevel, setResearchDepthLevel] = useState(6);
  const [consensusThreshold, setConsensusThreshold] = useState(95);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/research/tasks');
      const data = await res.json();
      setTasks(data);
      if (data.length > 0 && !activeTask) {
        loadTaskDetail(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadTaskDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/research/tasks/${id}`);
      const data = await res.json();
      setActiveTask(data);
      showToast(`已加载课题研究报告详情`);
    } catch (e) {
      console.error(e);
    }
  };

  // Run Real-time SSE Deep Research Flow
  const handleStartResearch = async () => {
    if (!question.trim() || isRunning) return;

    setIsRunning(true);
    setCurrentProgress({ step: 1, totalSteps: 5, phase: '子课题规划拆解', detail: '正在初始化研究环境并规划子课题与检索关键词...' });

    try {
      const response = await fetch('/api/research/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      if (!response.body) throw new Error('ReadableStream not supported');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const matchEvent = block.match(/^event:\s*(\w+)/m);
          const matchData = block.match(/^data:\s*(.*)/m);
          if (matchData) {
            try {
              const eventType = matchEvent ? matchEvent[1] : '';
              const payload = JSON.parse(matchData[1]);

              if (eventType === 'progress') {
                setCurrentProgress(payload);
              } else if (eventType === 'complete') {
                setActiveTask(payload);
              }
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
      showToast('✦ 深度研究推演完成，结构化报告已生成！');
    } catch (e: any) {
      showToast(`研究执行中断: ${e.message}`);
    } finally {
      setIsRunning(false);
      fetchTasks();
    }
  };

  // Save to Material Vault
  const handleSaveToMaterial = async () => {
    if (!activeTask) {
      if (onSaveToMaterial) {
        onSaveToMaterial(`深度研究课题: ${question.slice(0, 20)}...`, question);
      }
      showToast('已保存当前研究课题至素材知识库');
      return;
    }
    try {
      await fetch('/api/research/save_to_material', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: activeTask.id || activeTask.taskId,
          title: `研究报告: ${activeTask.question}`
        })
      });
      showToast('已无缝存入素材知识库！');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#090a0e] text-slate-100 font-sans select-none relative">
      {/* Dynamic Toast */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#181920]/95 border border-white/20 text-white text-xs font-semibold shadow-2xl flex items-center space-x-2 backdrop-blur-2xl animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* DYNAMIC ISLAND TOP STATUS PILL */}
      <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
        <div className="px-4 py-1.5 rounded-full bg-black/90 backdrop-blur-2xl text-white text-xs font-mono shadow-2xl flex items-center space-x-3 border border-white/15">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <div className="flex items-center space-x-1.5 font-sans">
            <span className="font-bold text-white/90">
              {isRunning ? currentProgress?.phase || '深度研究推理中...' : '规划与分解'}
            </span>
            <span className="text-[10px] text-zinc-400">· 正在构建多跳假说树</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono">
            <span>42 信源</span>
            <span>·</span>
            <span className="text-teal-300 font-bold">14.2k Tokens/s</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 1. LEFT SIDEBAR */}
        {showSidebar && (
          <aside className="w-72 shrink-0 flex flex-col bg-[#121318]/90 border-r border-white/10 backdrop-blur-2xl z-30 select-none">
            <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <button onClick={() => setShowSidebar(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400">
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-white/10 space-y-2 shrink-0">
              <button
                onClick={() => {
                  setQuestion('');
                  showToast('已新建空白研究画布');
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-95 text-xs font-bold text-white flex items-center justify-between shadow-md transition"
              >
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>新建深度研究</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 bg-black/20 px-1.5 py-0.5 rounded">⌘N</span>
              </button>
            </div>

            {/* Tasks & Mounted RAG List */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5 text-xs">
              <div>
                <div className="px-2 mb-2 flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <span>历史研究课题 ({tasks.length})</span>
                  <span className="text-[10px] font-mono text-blue-400 animate-pulse">● 运行中</span>
                </div>

                <div className="space-y-1">
                  {tasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => loadTaskDetail(t.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col space-y-1 ${
                        activeTask?.id === t.id ? 'bg-white/15 border-white/20 text-white font-bold' : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs truncate">{t.question}</span>
                      <span className="text-[9px] font-mono text-emerald-400 font-normal">{t.status || 'DONE'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RAG Assets */}
              <div>
                <div className="px-2 mb-2 flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <span>先验知识库挂载 (RAG)</span>
                  <span className="text-blue-400 cursor-pointer hover:underline text-[10px]">导入</span>
                </div>

                <div className="space-y-1.5">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[11px]">
                    <span className="truncate text-white font-medium">IEEE_Robotics_2025.pdf</span>
                    <input type="checkbox" defaultChecked className="rounded text-blue-500 focus:ring-0" />
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-[11px]">
                    <span className="truncate text-white font-medium">SEC_10K_Tesla_Optimus.xlsx</span>
                    <input type="checkbox" defaultChecked className="rounded text-blue-500 focus:ring-0" />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* 2. MAIN RESEARCH WORKSPACE */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#090a0e] relative overflow-hidden select-none">
          {/* MASTER HEADER */}
          <header className="h-14 px-4 bg-[#121318]/80 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center space-x-3">
              {!showSidebar && (
                <button onClick={() => setShowSidebar(true)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400">
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Microscope className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-xs font-bold text-white truncate max-w-md">
                    {activeTask ? activeTask.question : '深度研究与认知推理工作站'}
                  </h1>
                  <p className="text-[10px] text-zinc-400 font-mono">递归层级: 6 级 · 交叉共识率: 98.4%</p>
                </div>
              </div>
            </div>

            {/* VisionOS Segmented Controller */}
            <div className="hidden sm:flex items-center bg-black/40 p-1 rounded-2xl border border-white/10 backdrop-blur-md text-xs font-medium">
              <button
                onClick={() => setSubMode('pipeline')}
                className={`px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 transition ${
                  subMode === 'pipeline' ? 'bg-white/20 text-white font-bold shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>实时研究引擎</span>
              </button>

              <button
                onClick={() => setSubMode('graph')}
                className={`px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 transition ${
                  subMode === 'graph' ? 'bg-white/20 text-white font-bold shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <GitFork className="w-3.5 h-3.5 text-purple-400" />
                <span>知识与证据拓扑</span>
              </button>

              <button
                onClick={() => setSubMode('report')}
                className={`px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 transition ${
                  subMode === 'report' ? 'bg-white/20 text-white font-bold shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>结构化研报工作台</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={() => setShowParamDrawer(prev => !prev)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold flex items-center space-x-1.5 transition"
              >
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                <span>超细致参数</span>
              </button>

              <button
                onClick={handleSaveToMaterial}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>存入素材库</span>
              </button>
            </div>
          </header>

          {/* MODE A: REAL-TIME PIPELINE */}
          {subMode === 'pipeline' && (
            <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
              {/* Prompt Input Capsule */}
              <div className="p-0.5 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl">
                <div className="p-4 bg-[#121318] rounded-[22px] flex flex-col space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-zinc-400">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="font-bold text-white">Apple Intelligence 深度多跳推演指令</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                      自主检索 + 批判辩证
                    </span>
                  </div>

                  <div className="flex items-start space-x-3">
                    <textarea
                      value={question}
                      onChange={e => setQuestion(e.target.value)}
                      rows={2}
                      className="flex-1 bg-transparent text-xs md:text-sm text-white placeholder-zinc-500 outline-none resize-none leading-relaxed font-sans"
                      placeholder="输入深度研究课题..."
                    />

                    <button
                      onClick={handleStartResearch}
                      disabled={isRunning}
                      className="px-5 py-3 rounded-2xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition flex items-center space-x-2 shadow-md shrink-0 disabled:opacity-50"
                    >
                      <Compass className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                      <span>{isRunning ? '正在多跳推演...' : '执行推演'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Columns Pipeline Stages */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[460px]">
                {/* Column 1: Sub-question Tree */}
                <div className="p-4 rounded-3xl bg-[#181920]/80 border border-white/10 flex flex-col space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <GitFork className="w-4 h-4 text-blue-400" />
                      <h3 className="text-xs font-bold text-white">子课题拆解与假说树</h3>
                    </div>
                    <span className="text-[10px] font-mono text-blue-400">4 个主线</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {[
                      { q: 'Q1: 核心执行机构的降本曲线？', status: '已验证 99%', detail: '行星滚柱丝杠国产替代与空心杯电机批量化成本模型。' },
                      { q: 'Q2: 具身智能大模型端到端控制？', status: '正在深度遍历', detail: 'VLA (Vision-Language-Action) 多模态世界模型泛化能力测试对比。' },
                      { q: 'Q3: 特斯拉 Optimus Gen 3 交付时间表？', status: '多源交叉对齐', detail: 'SEC 财报声明与弗里蒙特工厂供应链产能卫星监控数据比对。' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{item.q}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Live Crawl Sources Stream */}
                <div className="p-4 rounded-3xl bg-[#181920]/80 border border-white/10 flex flex-col space-y-3 font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-purple-400" />
                      <h3 className="text-xs font-bold text-white font-sans">实时检索与信源穿透</h3>
                    </div>
                    <span className="text-[10px] text-zinc-400">84/120 节点</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {[
                      { url: 'arxiv.org/abs/2511.08942v3', ping: '24ms · 99.2%', snippet: '“RT-3 世界模型在 10,000 小时物理交互数据集训练下零样本抓取率 94.6%...”' },
                      { url: 'sec.gov/Archives/edgar/data/1318605', ping: '52ms · 96.8%', snippet: '“2026 年底计划部署超过 1,500 台 Optimus 机器人参与车间线束组装...”' }
                    ].map((s, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-blue-400 truncate">{s.url}</span>
                          <span className="text-zinc-500">{s.ping}</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">{s.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Synthesis & Conflict Resolution */}
                <div className="p-4 rounded-3xl bg-[#181920]/80 border border-white/10 flex flex-col space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-bold text-white">辩证反思与冲突消解</h3>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">共识度 98.4%</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <div className="flex items-center space-x-2 text-amber-400 font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>论据冲突发现 #01</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        高盛预测 2026 年 BOM 降至 $32,000，而麦肯锡调研指出滚柱丝杠磨削产能受限，短期仍将维持 $48,000 附近。
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 font-mono text-[10px] space-y-1">
                      <span className="text-blue-300 font-bold block">综合置信度评估:</span>
                      <div className="text-white">学术理论可实现性 (arXiv): 96%</div>
                      <div className="text-white">规模化降本支撑 (SEC 10-K): 91%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE B: GRAPH VIEW */}
          {subMode === 'graph' && (
            <div className="flex-1 p-6 relative overflow-hidden bg-black/40 flex items-center justify-center">
              <div className="text-center space-y-3">
                <GitFork className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
                <h3 className="text-sm font-bold text-white">知识与证据拓扑交互图谱</h3>
                <p className="text-xs text-zinc-400 max-w-sm">已将课题“{question.slice(0, 24)}...”解构为 18 个概念实体节点与 32 条推流支撑链。</p>
              </div>
            </div>
          )}

          {/* MODE C: REPORT VIEW */}
          {subMode === 'report' && (
            <div className="flex-1 p-6 overflow-y-auto flex justify-center bg-[#0e0f15]">
              <article className="max-w-3xl w-full bg-[#14151b] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl space-y-6 text-xs md:text-sm text-zinc-200">
                <div className="border-b border-white/10 pb-4 space-y-2">
                  <div className="text-blue-400 font-mono text-[11px] font-bold">
                    APPLE INTELLIGENCE DEEP RESEARCH MONOGRAPH · 2026
                  </div>
                  <h1 className="text-2xl font-bold text-white">
                    {activeTask ? activeTask.question : question}
                  </h1>
                </div>

                <div className="space-y-4 leading-relaxed">
                  <h2 className="text-base font-bold text-white">1. 执行摘要 (Executive Summary)</h2>
                  <p className="text-zinc-300">
                    根据对全球 84 个信源与 32 项核心专利的交叉推演，具身智能正在经历从实验室算法向大规模工业试点的商业化奇点...
                  </p>

                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1.5">
                    <div className="font-bold text-blue-400 flex items-center space-x-1.5">
                      <Lightbulb className="w-4 h-4" />
                      <span>核心战略结论</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-zinc-300">
                      <li>端到端 VLA 世界模型使得物理交互零样本泛化成为现实。</li>
                      <li>行星滚柱丝杠国产规模替代使单机 BOM 降至 $2.4万。</li>
                    </ul>
                  </div>
                </div>
              </article>
            </div>
          )}
        </main>

        {/* PRO PARAMETERS SLIDE-OVER DRAWER */}
        {showParamDrawer && (
          <aside className="w-80 shrink-0 bg-[#14151b] border-l border-white/10 p-4 space-y-5 text-xs overflow-y-auto z-30 select-none">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 font-bold text-white">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>深度研究超参数控制台</span>
              </div>
              <button onClick={() => setShowParamDrawer(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-300">研究递归深度 (Research Depth)</label>
              <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
                {[2, 4, 6].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setResearchDepthLevel(lvl)}
                    className={`py-1.5 rounded-lg font-bold transition ${
                      researchDepthLevel === lvl ? 'bg-blue-600 text-white shadow-xs' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    {lvl} 级多跳
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-white/10">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-zinc-300">交叉事实共识阈值:</span>
                <span className="text-emerald-400 font-bold">{consensusThreshold}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                value={consensusThreshold}
                onChange={e => setConsensusThreshold(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-white/10 rounded cursor-pointer"
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
