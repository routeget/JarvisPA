import React, { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandBar } from './components/CommandBar';
import { VoiceModal } from './components/VoiceModal';

import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { TasksPage } from './pages/TasksPage';
import { ActivityPage } from './pages/ActivityPage';
import { AutomationsPage } from './pages/AutomationsPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { MemoryPage } from './pages/MemoryPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const { currentScreen, loadApprovals, refreshSafetyStatus } = useAppStore();

  useEffect(() => {
    loadApprovals();
    refreshSafetyStatus();
    // Poll approvals and safety status every 15s
    const timer = setInterval(() => {
      loadApprovals();
      refreshSafetyStatus();
    }, 15000);
    return () => clearInterval(timer);
  }, [loadApprovals, refreshSafetyStatus]);

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomePage />;
      case 'chat':
        return <ChatPage />;
      case 'tasks':
        return <TasksPage />;
      case 'activity':
        return <ActivityPage />;
      case 'automations':
        return <AutomationsPage />;
      case 'connections':
        return <ConnectionsPage />;
      case 'memory':
        return <MemoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#080c14] text-slate-100 overflow-hidden font-sans">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-[#080c14]/90 relative">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Global Overlays */}
      <CommandBar />
      <VoiceModal />
    </div>
  );
};
