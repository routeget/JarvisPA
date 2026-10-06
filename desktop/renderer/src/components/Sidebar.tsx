import React from 'react';
import { 
  Home, 
  MessageSquare, 
  CheckSquare, 
  Activity, 
  Workflow, 
  Link2, 
  BrainCircuit, 
  Settings,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { ScreenType } from '../types';

interface NavItem {
  id: ScreenType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { currentScreen, setCurrentScreen, pendingApprovals } = useAppStore();

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: pendingApprovals.length > 0 ? pendingApprovals.length : undefined },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'automations', label: 'Automations', icon: Workflow },
    { id: 'connections', label: 'Connections', icon: Link2 },
    { id: 'memory', label: 'Memory', icon: BrainCircuit },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 border-r border-slate-800 bg-[#090e1a]/95 flex flex-col justify-between select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono tracking-wider uppercase text-slate-500 font-semibold">
          Platform Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-900">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Info: Connected Architecture Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="rounded-lg p-2.5 bg-slate-950/60 border border-slate-800 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Runtime
            </span>
            <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Autonomy Level 2 active. Human authorization required for high-risk executions.
          </p>
        </div>
      </div>
    </aside>
  );
};
