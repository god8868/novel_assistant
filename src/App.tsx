import React, { useState, useEffect } from 'react';
import { AppSidebar, MainTab } from './components/layout/AppSidebar.tsx';
import { ChatView } from './components/chat/ChatView.tsx';
import { AgentStudio } from './components/agents/AgentStudio.tsx';
import { ResearchView } from './components/research/ResearchView.tsx';
import { NovelStudio } from './components/novel/NovelStudio.tsx';
import { NotebookView } from './components/notebook/NotebookView.tsx';
import { CanvasView } from './components/canvas/CanvasView.tsx';
import { ImageView } from './components/image/ImageView.tsx';
import { SlidesView } from './components/slides/SlidesView.tsx';
import { DesignView } from './components/design/DesignView.tsx';
import { VideoView } from './components/video/VideoView.tsx';
import { AudioView } from './components/audio/AudioView.tsx';
import { ChartsView } from './components/charts/ChartsView.tsx';
import { TrendingView } from './components/trending/TrendingView.tsx';
import { AIGroupChatView } from './components/groupchat/AIGroupChatView.tsx';
import { AIGameTheoryView } from './components/gametheory/AIGameTheoryView.tsx';
import { MaterialsView } from './components/materials/MaterialsView.tsx';
import { AISearchView } from './components/search/AISearchView.tsx';
import { AICommandsView } from './components/commands/AICommandsView.tsx';
import { AIAnalysisView } from './components/analysis/AIAnalysisView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('chat');
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'sepia'>('dark');
  const [activeModelName, setActiveModelName] = useState('Mock 智能旗舰模型');

  // Load theme and default model from settings
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.theme && (data.theme === 'dark' || data.theme === 'light' || data.theme === 'sepia')) {
          setTheme(data.theme);
        }
      })
      .catch(() => {});

    fetch('/api/model_roles')
      .then(res => res.json())
      .then((data: any[]) => {
        const chatRole = data.find(r => r.role === 'novel_write' || r.role === 'chat');
        if (chatRole?.display_name) {
          setActiveModelName(chatRole.display_name);
        }
      })
      .catch(() => {});
  }, []);

  // Update document root data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global macOS keyboard shortcuts (⌘1~⌘9, ⌘0 to switch top tabs, ⌘B to toggle sidebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
        if (e.key === '1') { e.preventDefault(); setActiveTab('chat'); }
        else if (e.key === '2') { e.preventDefault(); setActiveTab('agents'); }
        else if (e.key === '3') { e.preventDefault(); setActiveTab('research'); }
        else if (e.key === '4') { e.preventDefault(); setActiveTab('novel'); }
        else if (e.key === '5') { e.preventDefault(); setActiveTab('notebook'); }
        else if (e.key === '6') { e.preventDefault(); setActiveTab('canvas'); }
        else if (e.key === '7') { e.preventDefault(); setActiveTab('image'); }
        else if (e.key === '8') { e.preventDefault(); setActiveTab('slides'); }
        else if (e.key === '9') { e.preventDefault(); setActiveTab('design'); }
        else if (e.key === 'b') { e.preventDefault(); setCollapsed(prev => !prev); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveToMaterial = async (title: string, body: string) => {
    try {
      await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          tags: ['工作台归档', '自动摘录']
        })
      });
      // Quiet Apple notification or toast
    } catch (e: any) {
      console.error(`保存失败: ${e.message}`);
    }
  };

  const handleStartResearchFromTrending = (topic: string) => {
    setActiveTab('research');
  };

  const handleNewChat = async () => {
    setActiveTab('chat');
    try {
      await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '新探索对话' })
      });
      window.dispatchEvent(new CustomEvent('app:new-chat'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyzeMaterials = () => {
    setActiveTab('materials');
    window.dispatchEvent(new CustomEvent('app:focus-material-search'));
  };

  const handleExportContent = async () => {
    if (activeTab === 'chat') {
      window.dispatchEvent(new CustomEvent('app:export-chat'));
    } else if (activeTab === 'novel') {
      window.dispatchEvent(new CustomEvent('app:export-novel'));
    } else {
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
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--apple-bg)] text-[var(--apple-text-primary)]">
      {/* ============================================================ */}
      {/* 1. LEFT PRIMARY NAVIGATION SIDEBAR (macOS Source List - 15 Subpages) */}
      {/* ============================================================ */}
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        theme={theme}
        setTheme={t => {
          setTheme(t);
          fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme: t })
          }).catch(() => {});
        }}
        activeModelName={activeModelName}
        onNewChat={handleNewChat}
        onAnalyzeMaterials={handleAnalyzeMaterials}
        onExportContent={handleExportContent}
      />

      {/* ============================================================ */}
      {/* 2. MAIN SUBPAGE VIEW WITH ITS OWN DEDICATED macOS TOOLBAR */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--apple-bg)]">
        <div key={activeTab} className="w-full h-full flex flex-col overflow-hidden animate-macos-fade">
          {activeTab === 'chat' && <ChatView onSaveToMaterial={handleSaveToMaterial} />}
          {activeTab === 'group_chat' && <AIGroupChatView onSaveToMaterial={handleSaveToMaterial} />}
          {activeTab === 'game_theory' && <AIGameTheoryView onSaveToMaterial={handleSaveToMaterial} />}
          {activeTab === 'ai_search' && <AISearchView />}
          {activeTab === 'ai_commands' && <AICommandsView />}
          {activeTab === 'ai_analysis' && <AIAnalysisView onSaveToMaterial={handleSaveToMaterial} />}
          {activeTab === 'agents' && <AgentStudio />}
          {activeTab === 'research' && <ResearchView onSaveToMaterial={handleSaveToMaterial} />}
          {activeTab === 'novel' && <NovelStudio />}
          {activeTab === 'notebook' && <NotebookView />}
          {activeTab === 'canvas' && <CanvasView />}
          {activeTab === 'image' && <ImageView onSaveToMaterial={handleSaveToMaterial} />}
          {activeTab === 'slides' && <SlidesView />}
          {activeTab === 'design' && <DesignView />}
          {activeTab === 'video' && <VideoView />}
          {activeTab === 'audio' && <AudioView />}
          {activeTab === 'charts' && <ChartsView />}
          {activeTab === 'trending' && (
            <TrendingView 
              onStartResearch={handleStartResearchFromTrending}
              onSaveToMaterial={handleSaveToMaterial}
            />
          )}
          {activeTab === 'materials' && <MaterialsView />}
          {activeTab === 'settings' && <SettingsView theme={theme} setTheme={setTheme} />}
        </div>
      </main>
    </div>
  );
}
