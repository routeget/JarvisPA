import React, { useState, useEffect } from 'react';
import { Link2, CheckCircle2, XCircle, RefreshCw, Radio, Shield, Key } from 'lucide-react';
import { jarvisAPI } from '../services/api';
import { ConnectionItem, AIProviderItem } from '../types';

export const ConnectionsPage: React.FC = () => {
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [providers, setProviders] = useState<AIProviderItem[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [conns, provs] = await Promise.all([
        jarvisAPI.getConnections(),
        jarvisAPI.getProviders(),
      ]);
      setConnections(conns || []);
      setProviders(provs || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestMessage(null);
    try {
      const res = await jarvisAPI.testConnection(id);
      setTestMessage(res.message);
      await fetchData();
    } catch (e: any) {
      setTestMessage(`Test failed: ${e.message}`);
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-cyan-400" />
          Enterprise Integrations & AI Connections
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          OAuth 2.0 / Entra ID enterprise connectors, MCP tool endpoints, and multi-model AI gateways.
        </p>
      </div>

      {testMessage && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center justify-between">
          <span>{testMessage}</span>
          <button onClick={() => setTestMessage(null)} className="text-slate-400 hover:text-slate-200">×</button>
        </div>
      )}

      {/* Enterprise Connections Grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-400" />
          Connected Enterprise Ecosystems
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((c) => (
            <div key={c.id} className="rounded-xl glass-panel p-4 space-y-3 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-100">{c.name}</span>
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    {c.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">Auth: {c.auth_type}</div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  {c.last_synced_at ? `Synced: ${new Date(c.last_synced_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Ready'}
                </span>
                <button
                  onClick={() => handleTest(c.id)}
                  disabled={testingId === c.id}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${testingId === c.id ? 'animate-spin' : ''}`} />
                  <span>{testingId === c.id ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Provider Connections Grid */}
      <div className="pt-4">
        <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-1.5">
          <Key className="w-4 h-4 text-cyan-400" />
          Multi-Model AI Providers (Section 6 & 48)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (
            <div key={p.id} className="rounded-xl glass-panel p-4 space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100">{p.name}</span>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">Default: {p.default_model}</div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/80">
                <span>Budget: ${p.max_budget_daily}/day</span>
                <span className="text-emerald-400">Encrypted in Vault</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
