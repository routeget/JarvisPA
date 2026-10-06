import React, { useState, useEffect } from 'react';
import { Workflow, Play, Plus, Clock, CheckCircle2, Layers, RefreshCw } from 'lucide-react';
import { jarvisAPI } from '../services/api';
import { AutomationItem, MissionItem } from '../types';

export const AutomationsPage: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [missions, setMissions] = useState<MissionItem[]>([]);
  const [runningId, setRunningId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [autos, miss] = await Promise.all([
        jarvisAPI.getAutomations(),
        jarvisAPI.getMissions(),
      ]);
      setAutomations(autos || []);
      setMissions(miss || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunAutomation = async (autoId: string) => {
    setRunningId(autoId);
    try {
      await jarvisAPI.runAutomation(autoId);
      await fetchData();
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Workflow className="w-5 h-5 text-indigo-400" />
            Automations & Persistent Missions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Event-triggered workflows, recurring schedules, and persistent background missions.
          </p>
        </div>
      </div>

      {/* Persistent Missions (Section 35) */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Active Long-Lived Missions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missions.map((m) => (
            <div key={m.id} className="rounded-xl glass-panel p-4 space-y-3 border border-cyan-500/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-slate-100">{m.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{m.objective}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {m.status}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono text-slate-400">
                <span className="text-slate-500">Sources:</span>
                {m.sources.map((s, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Cron: {m.schedule}</span>
                <span>Next: in 6 hours</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trigger Automations (Section 79 & 103) */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Configured Workflow Automations
        </h2>
        <div className="space-y-2">
          {[
            {
              id: "auto_phoenix_blocker",
              title: "Project Phoenix Urgent Blocker Sync",
              description: "When an urgent blocker or critical bug is created in Azure DevOps, search Teams, GitHub PRs, and notify user.",
              trigger: "Azure DevOps: Critical Bug Created",
              status: "Active",
            },
            {
              id: "auto_morning_briefing",
              title: "Morning 9:00 AM Executive Briefing",
              description: "Collect calendar meetings, high priority emails, and Teams mentions and summarize.",
              trigger: "Schedule: 0 9 * * 1-5",
              status: "Active",
            },
          ].map((auto) => (
            <div key={auto.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl glass-panel border border-slate-800 text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-slate-200">{auto.title}</div>
                <div className="text-slate-400">{auto.description}</div>
                <div className="text-[10px] font-mono text-indigo-400">Trigger: {auto.trigger}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleRunAutomation(auto.id)}
                  disabled={runningId === auto.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 transition-colors font-medium"
                >
                  <Play className={`w-3.5 h-3.5 ${runningId === auto.id ? 'animate-spin' : ''}`} />
                  <span>{runningId === auto.id ? 'Running...' : 'Run Now'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
