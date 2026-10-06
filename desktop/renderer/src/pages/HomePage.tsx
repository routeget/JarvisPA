import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Layers, 
  Bell, 
  Send 
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { jarvisAPI } from '../services/api';
import { MissionItem, TaskItem, AIProviderItem } from '../types';

export const HomePage: React.FC = () => {
  const { setCurrentScreen, sendMessage, setCommandBarOpen, pendingApprovals, decideApproval } = useAppStore();
  const [briefing, setBriefing] = useState<string>('');
  const [meetings, setMeetings] = useState<any[]>([]);
  const [missions, setMissions] = useState<MissionItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [providers, setProviders] = useState<AIProviderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [briefingData, missionsData, tasksData, providersData] = await Promise.all([
          jarvisAPI.getDailyBriefing().catch(() => ({ briefing: '', meetings: [] })),
          jarvisAPI.getMissions().catch(() => []),
          jarvisAPI.getTasks().catch(() => []),
          jarvisAPI.getProviders().catch(() => []),
        ]);
        setBriefing(briefingData.briefing || '');
        setMeetings(briefingData.meetings || []);
        setMissions(missionsData || []);
        setTasks(tasksData || []);
        setProviders(providersData || []);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* 1. Hero Greeting Banner (Section 45 & 100) */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-[#0b172a] to-slate-900 border border-cyan-500/30 p-6 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                Autonomous Mission Control
              </span>
              <span className="text-xs text-slate-400">• Operational Status: Nominal</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              Good day, Commander. All systems are coordinated.
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Cross-system intelligence is actively monitoring Outlook, Microsoft Teams, Azure DevOps, GitHub, Slack, and Google Workspace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentScreen('chat');
                sendMessage("JARVIS, check my email, Teams, Slack and Azure DevOps for everything related to Project Phoenix, summarize the current status, identify anything urgent, and prepare the required responses.");
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-semibold text-xs hover:from-cyan-400 hover:to-indigo-500 transition-all shadow-lg shadow-cyan-500/25 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run Project Phoenix Review</span>
            </button>
            <button
              onClick={() => setCommandBarOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors"
            >
              Open Command Bar
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pending Approvals Alert Bar if any */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Action Approval Required ({pendingApprovals.length} item)</span>
            </div>
            <button
              onClick={() => setCurrentScreen('tasks')}
              className="text-xs text-amber-400 hover:underline"
            >
              View in Tasks Center →
            </button>
          </div>
          {pendingApprovals.map((appr) => (
            <div key={appr.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <div>
                <div className="font-semibold text-slate-200">{appr.title}</div>
                <div className="text-slate-400 mt-0.5">{appr.description}</div>
                <div className="text-[10px] font-mono text-cyan-400 mt-1">Resource: {appr.target_resource} | Risk: {appr.risk_level}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => decideApproval(appr.id, 'REJECTED')}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => decideApproval(appr.id, 'APPROVED')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors"
                >
                  Approve & Execute
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Grid: Upcoming Meetings, Active Missions, Running Tasks, AI Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Briefing Card */}
        <div className="rounded-xl glass-panel p-4 space-y-2 col-span-1 md:col-span-2">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Upcoming Schedule & Briefing
            </span>
            <span className="font-mono text-[10px] text-cyan-400">Microsoft Graph Connected</span>
          </div>
          <div className="space-y-2">
            {meetings.map((m, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>{m.title}</span>
                  <span className="text-[10px] font-mono text-indigo-400">{new Date(m.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{m.summary}</p>
                <div className="text-[10px] text-slate-500 font-mono">Location: {m.location}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Missions Card (Section 35) */}
        <div className="rounded-xl glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Active Missions
            </span>
            <span className="text-[10px] font-mono text-emerald-400">{missions.length} Running</span>
          </div>
          <div className="space-y-2">
            {missions.map((mis) => (
              <div key={mis.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs space-y-1">
                <div className="font-semibold text-slate-200 truncate">{mis.title}</div>
                <p className="text-slate-400 text-[11px] line-clamp-2">{mis.objective}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>Schedule: {mis.schedule}</span>
                  <span className="text-cyan-400">{mis.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Model AI Health (Section 94) */}
        <div className="rounded-xl glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              AI Providers Health
            </span>
            <span className="text-[10px] font-mono text-emerald-400">All Online</span>
          </div>
          <div className="space-y-1.5">
            {providers.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 text-xs">
                <span className="text-slate-300 font-medium">{p.name}</span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Ready
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
