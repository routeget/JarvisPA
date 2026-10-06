import React, { useState, useEffect } from 'react';
import { Activity, Clock, ShieldCheck, Cpu, RefreshCw, Filter, Layers } from 'lucide-react';
import { jarvisAPI } from '../services/api';
import { ActivityLogItem } from '../types';

export const ActivityPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await jarvisAPI.getActivity();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Activity Center & Execution Audit
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically hashed audit records of every tool call, provider routing, and approval.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Activity Timeline Table */}
      <div className="rounded-xl glass-panel border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Task ID</th>
                <th className="px-4 py-3">Provider / Model</th>
                <th className="px-4 py-3">Tool Executed</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Classification</th>
                <th className="px-4 py-3">Arg Hash</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-900/40 transition-colors font-mono">
                  <td className="px-4 py-3 text-slate-400 text-[11px]">
                    {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-cyan-400 text-[11px]">{l.task_id || 'sys'}</td>
                  <td className="px-4 py-3 text-slate-200">
                    <span className="text-cyan-300 font-semibold">{l.provider?.toUpperCase()}</span>
                    {l.model && <span className="text-slate-500 text-[10px] block">{l.model}</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{l.tool || 'none'}</td>
                  <td className="px-4 py-3 text-slate-400">{l.duration_ms}ms</td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {l.classification}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[10px] truncate max-w-[80px]">
                    {l.arguments_hash || 'none'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 text-[11px] font-semibold">{l.result_status}</span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500 text-xs">
                    No activity logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
