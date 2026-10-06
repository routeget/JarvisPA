import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  StopCircle, 
  Calendar, 
  RefreshCw, 
  Search,
  ChevronRight
} from 'lucide-react';
import { jarvisAPI } from '../services/api';
import { useAppStore } from '../stores/appStore';
import { TaskItem } from '../types';

export const TasksPage: React.FC = () => {
  const { pendingApprovals, decideApproval } = useAppStore();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await jarvisAPI.getTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCancel = async (taskId: string) => {
    await jarvisAPI.cancelTask(taskId);
    await fetchTasks();
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesFilter = filterStatus === 'ALL' || t.status.toUpperCase() === filterStatus;
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'running':
        return <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse"><RefreshCw className="w-3 h-3 animate-spin" /> Running</span>;
      case 'waiting for approval':
        return <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30"><AlertTriangle className="w-3 h-3" /> Waiting Approval</span>;
      case 'cancelled':
        return <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-700 text-slate-300"><StopCircle className="w-3 h-3" /> Cancelled</span>;
      case 'failed':
        return <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30"><XCircle className="w-3 h-3" /> Failed</span>;
      default:
        return <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400"><Clock className="w-3 h-3" /> {status}</span>;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            Autonomous Task Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor, inspect execution histories, authorize actions, and cancel pending tasks.
          </p>
        </div>
        <button
          onClick={fetchTasks}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-cyan-400 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Approvals Section per Section 47 */}
      {pendingApprovals.length > 0 && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Human Approval Center - High Risk Operations Pending</span>
          </div>
          <div className="space-y-2">
            {pendingApprovals.map((appr) => (
              <div key={appr.id} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200">{appr.title}</div>
                  <div className="text-slate-400">{appr.description}</div>
                  <div className="text-[11px] font-mono text-cyan-400">
                    Action: {appr.action_type} • Resource: {appr.target_resource} • Risk: {appr.risk_level}
                  </div>
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
                    Authorize & Run
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'RUNNING', 'WAITING FOR APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Task List Table */}
      <div className="rounded-xl glass-panel border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="px-4 py-3">Task ID</th>
                <th className="px-4 py-3">Title & Summary</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-cyan-400">{t.id}</td>
                  <td className="px-4 py-3 max-w-md">
                    <div className="font-semibold text-slate-200 truncate">{t.title}</div>
                    {t.result_summary && <div className="text-[11px] text-slate-400 truncate">{t.result_summary}</div>}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">{t.assigned_agent}</td>
                  <td className="px-4 py-3">{getStatusBadge(t.status)}</td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                    {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.status === 'Running' || t.status === 'Waiting for approval' ? (
                      <button
                        onClick={() => handleCancel(t.id)}
                        className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-[11px]"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[11px] font-mono">Archived</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                    No tasks found matching filter criteria.
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
