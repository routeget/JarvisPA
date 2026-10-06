import React, { useState, useEffect } from 'react';
import {
  Link2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Shield,
  Key,
  Sliders,
  Eye,
  EyeOff,
  Lock,
  ExternalLink,
  Plus,
  Trash2,
  Cpu,
  Server,
  Sparkles,
} from 'lucide-react';
import { jarvisAPI } from '../services/api';
import { ConnectionItem, AIProviderItem } from '../types';

export const ConnectionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'enterprise' | 'ai' | 'vault'>('enterprise');
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [providers, setProviders] = useState<AIProviderItem[]>([]);
  const [vaultKeys, setVaultKeys] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Connection edit modal state
  const [selectedConnection, setSelectedConnection] = useState<ConnectionItem | null>(null);
  const [connCredential, setConnCredential] = useState<string>('');
  const [connClientId, setConnClientId] = useState<string>('');
  const [connClientSecret, setConnClientSecret] = useState<string>('');
  const [connTenantId, setConnTenantId] = useState<string>('');
  const [connOrg, setConnOrg] = useState<string>('');
  const [connProject, setConnProject] = useState<string>('');
  const [connRepos, setConnRepos] = useState<string>('');
  const [connChannels, setConnChannels] = useState<string>('');
  const [connUrl, setConnUrl] = useState<string>('');
  const [showConnSecret, setShowConnSecret] = useState<boolean>(false);
  const [isSavingConn, setIsSavingConn] = useState<boolean>(false);

  // Provider edit modal state
  const [selectedProvider, setSelectedProvider] = useState<AIProviderItem | null>(null);
  const [provApiKey, setProvApiKey] = useState<string>('');
  const [provEndpoint, setProvEndpoint] = useState<string>('');
  const [provDefaultModel, setProvDefaultModel] = useState<string>('');
  const [provFallbackModel, setProvFallbackModel] = useState<string>('');
  const [provBudget, setProvBudget] = useState<number>(20);
  const [provEnabled, setProvEnabled] = useState<boolean>(true);
  const [showProvKey, setShowProvKey] = useState<boolean>(false);
  const [isSavingProv, setIsSavingProv] = useState<boolean>(false);

  // Custom vault secret state
  const [customKeyName, setCustomKeyName] = useState<string>('');
  const [customKeyValue, setCustomKeyValue] = useState<string>('');
  const [isSavingVault, setIsSavingVault] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [conns, provs, keys] = await Promise.all([
        jarvisAPI.getConnections(),
        jarvisAPI.getProviders(),
        jarvisAPI.getVaultKeys().catch(() => ({})),
      ]);
      setConnections(conns || []);
      setProviders(provs || []);
      setVaultKeys(keys || {});
    } catch (e: any) {
      console.error(e);
      setFeedback({ type: 'error', message: `Failed to load configurations: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTest = async (id: string) => {
    setTestingId(id);
    setFeedback(null);
    try {
      const res = await jarvisAPI.testConnection(id);
      setFeedback({
        type: res.status === 'Error' ? 'error' : 'success',
        message: res.message,
      });
      await fetchData();
    } catch (e: any) {
      setFeedback({ type: 'error', message: `Test failed: ${e.message}` });
    } finally {
      setTestingId(null);
    }
  };

  const openConnectionModal = (c: ConnectionItem) => {
    setSelectedConnection(c);
    setConnCredential('');
    setConnClientId((c.metadata as any)?.client_id || '');
    setConnClientSecret('');
    setConnTenantId((c.metadata as any)?.tenant_id || '');
    setConnOrg((c.metadata as any)?.org || '');
    setConnProject((c.metadata as any)?.project || '');
    setConnRepos(Array.isArray((c.metadata as any)?.repos) ? (c.metadata as any).repos.join(', ') : '');
    setConnChannels(Array.isArray((c.metadata as any)?.channels) ? (c.metadata as any).channels.join(', ') : '');
    setConnUrl((c.metadata as any)?.url || '');
    setShowConnSecret(false);
  };

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnection) return;
    setIsSavingConn(true);
    try {
      const metadata: Record<string, any> = { ...selectedConnection.metadata };

      if (selectedConnection.id === 'm365') {
        if (connTenantId) metadata.tenant_id = connTenantId;
        if (connClientId) metadata.client_id = connClientId;
      } else if (selectedConnection.id === 'azure_devops') {
        if (connOrg) metadata.org = connOrg;
        if (connProject) metadata.project = connProject;
      } else if (selectedConnection.id === 'github') {
        if (connOrg) metadata.owner = connOrg;
        if (connRepos) {
          metadata.repos = connRepos.split(',').map((r) => r.trim()).filter(Boolean);
        }
      } else if (selectedConnection.id === 'slack') {
        if (connChannels) {
          metadata.channels = connChannels.split(',').map((ch) => ch.trim()).filter(Boolean);
        }
      } else if (selectedConnection.id === 'n8n') {
        if (connUrl) metadata.url = connUrl;
      }

      await jarvisAPI.configureConnection(selectedConnection.id, {
        name: selectedConnection.name,
        auth_type: selectedConnection.auth_type,
        credential: connCredential.trim() || undefined,
        client_id: connClientId.trim() || undefined,
        client_secret: connClientSecret.trim() || undefined,
        tenant_id: connTenantId.trim() || undefined,
        metadata,
      });

      setFeedback({
        type: 'success',
        message: `Successfully configured and saved '${selectedConnection.name}'. Credentials encrypted in local vault.`,
      });
      setSelectedConnection(null);
      await fetchData();
    } catch (e: any) {
      setFeedback({ type: 'error', message: `Failed to save connection: ${e.message}` });
    } finally {
      setIsSavingConn(false);
    }
  };

  const openProviderModal = (p: AIProviderItem) => {
    setSelectedProvider(p);
    setProvApiKey('');
    setProvEndpoint(p.endpoint || '');
    setProvDefaultModel(p.default_model || '');
    setProvFallbackModel(p.fallback_model || '');
    setProvBudget(p.max_budget_daily || 20);
    setProvEnabled(p.is_enabled);
    setShowProvKey(false);
  };

  const handleSaveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;
    setIsSavingProv(true);
    try {
      await jarvisAPI.configureProvider(selectedProvider.id, {
        api_key: provApiKey.trim() || undefined,
        endpoint: provEndpoint.trim() || undefined,
        default_model: provDefaultModel.trim() || undefined,
        fallback_model: provFallbackModel.trim() || undefined,
        max_budget_daily: Number(provBudget),
        is_enabled: provEnabled,
      });

      setFeedback({
        type: 'success',
        message: `Successfully configured '${selectedProvider.name}'. API keys encrypted in local vault.`,
      });
      setSelectedProvider(null);
      await fetchData();
    } catch (e: any) {
      setFeedback({ type: 'error', message: `Failed to save provider: ${e.message}` });
    } finally {
      setIsSavingProv(false);
    }
  };

  const handleSaveCustomVaultKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeyName.trim() || !customKeyValue.trim()) return;
    setIsSavingVault(true);
    try {
      await jarvisAPI.setVaultKey(customKeyName.trim().toUpperCase(), customKeyValue.trim());
      setFeedback({
        type: 'success',
        message: `Secret '${customKeyName.trim().toUpperCase()}' encrypted and saved in local vault.`,
      });
      setCustomKeyName('');
      setCustomKeyValue('');
      await fetchData();
    } catch (e: any) {
      setFeedback({ type: 'error', message: `Failed to save secret: ${e.message}` });
    } finally {
      setIsSavingVault(false);
    }
  };

  const handleDeleteVaultKey = async (keyName: string) => {
    if (!confirm(`Are you sure you want to remove '${keyName}' from the vault?`)) return;
    try {
      await jarvisAPI.deleteVaultKey(keyName);
      setFeedback({ type: 'success', message: `Secret '${keyName}' removed.` });
      await fetchData();
    } catch (e: any) {
      setFeedback({ type: 'error', message: `Failed to delete secret: ${e.message}` });
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-cyan-400" />
            Integrations, AI Providers & Security Vault
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure live credentials for enterprise services (M365, Azure DevOps, GitHub, Slack) and multi-model AI API keys.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('enterprise')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'enterprise' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Enterprise Services ({connections.length})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            AI Providers ({providers.length})
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'vault' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            Encrypted Vault
          </button>
        </div>
      </div>

      {/* Global Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-200 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* TAB 1: ENTERPRISE SERVICES */}
      {activeTab === 'enterprise' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Connected Enterprise Ecosystems
            </h2>
            <span className="text-[11px] text-slate-500">
              All credentials encrypted locally via AES-256 (PBKDF2 HMAC-SHA256)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((c) => {
              const isConfigured = c.is_configured;
              return (
                <div
                  key={c.id}
                  className="rounded-xl glass-panel p-4 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-100">{c.name}</span>
                      <span
                        className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          isConfigured
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {isConfigured ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Configured
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" /> Ready / Setup
                          </>
                        )}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono space-y-1">
                      <div>Auth: <span className="text-slate-300">{c.auth_type}</span></div>
                      {c.masked_credential ? (
                        <div className="text-emerald-400 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Key: {c.masked_credential}</span>
                        </div>
                      ) : (
                        <div className="text-slate-500 italic">No live credentials configured yet</div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openConnectionModal(c)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Configure</span>
                    </button>

                    <button
                      onClick={() => handleTest(c.id)}
                      disabled={testingId === c.id}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${testingId === c.id ? 'animate-spin' : ''}`} />
                      <span>{testingId === c.id ? 'Testing...' : 'Test'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-MODEL AI PROVIDERS */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Multi-Model AI Providers & API Gateways
            </h2>
            <span className="text-[11px] text-slate-500">
              Configure Anthropic, OpenAI, Gemini, Groq, OpenRouter, and Ollama Local
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((p) => {
              const isConfigured = p.is_configured;
              return (
                <div
                  key={p.id}
                  className="rounded-xl glass-panel p-4 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-100">{p.name}</span>
                      <span
                        className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          isConfigured
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {isConfigured ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Key Active
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" /> Key Needed
                          </>
                        )}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono space-y-1">
                      <div>Default Model: <span className="text-cyan-400">{p.default_model}</span></div>
                      {p.masked_key ? (
                        <div className="text-emerald-400 flex items-center gap-1">
                          <Key className="w-2.5 h-2.5" />
                          <span>Vault: {p.masked_key}</span>
                        </div>
                      ) : (
                        <div className="text-slate-500 italic">Operating in mock / simulation mode</div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Budget: ${p.max_budget_daily}/day</span>
                    <button
                      onClick={() => openProviderModal(p)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Configure API</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ENCRYPTED VAULT SECRETS */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-400" />
                Local AES-256 Credential Vault
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect masked secrets stored at rest in <code className="text-cyan-400 font-mono">.vault_store.enc</code> on this device.
              </p>
            </div>
          </div>

          {/* Add custom secret form */}
          <div className="rounded-xl glass-panel p-4 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              Store or Override Vault Secret
            </h3>
            <form onSubmit={handleSaveCustomVaultKey} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="KEY_NAME (e.g. AZURE_DEVOPS_PAT)"
                value={customKeyName}
                onChange={(e) => setCustomKeyName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 uppercase font-mono focus:outline-none focus:border-cyan-500"
                required
              />
              <input
                type="password"
                placeholder="Secret Value / API Key"
                value={customKeyValue}
                onChange={(e) => setCustomKeyValue(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                required
              />
              <button
                type="submit"
                disabled={isSavingVault}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isSavingVault ? 'Encrypting...' : 'Save to Encrypted Vault'}</span>
              </button>
            </form>
          </div>

          {/* Key list */}
          <div className="rounded-xl glass-panel border border-slate-800 overflow-hidden">
            <div className="p-3 bg-slate-900/60 border-b border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Known Vault Keys & Environmental Overrides</span>
              <span className="text-slate-500 font-normal">Auto-loaded on startup</span>
            </div>
            <div className="divide-y divide-slate-800/80">
              {Object.entries(vaultKeys).map(([key, data]: [string, any]) => (
                <div key={key} className="p-3 flex items-center justify-between hover:bg-slate-900/40 text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="text-slate-200 font-bold flex items-center gap-2">
                      <span>{key}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border uppercase ${
                          data.is_configured
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {data.is_configured ? `Active (${data.source})` : 'Unset'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {data.masked_value ? `Value: ${data.masked_value}` : 'No secret configured'}
                    </div>
                  </div>

                  {data.is_configured && data.source === 'vault' && (
                    <button
                      onClick={() => handleDeleteVaultKey(key)}
                      className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete from vault"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CONFIGURE ENTERPRISE CONNECTION */}
      {selectedConnection && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-slate-100 text-base">Configure {selectedConnection.name}</h3>
              </div>
              <button
                onClick={() => setSelectedConnection(null)}
                className="text-slate-400 hover:text-slate-200 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveConnection} className="space-y-4 text-xs">
              {/* Service specific fields */}
              {selectedConnection.id === 'm365' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Microsoft Graph Access Token or Refresh Token</label>
                    <div className="relative">
                      <input
                        type={showConnSecret ? 'text' : 'password'}
                        placeholder={selectedConnection.masked_credential || 'Paste Bearer Token or App Secret'}
                        value={connCredential}
                        onChange={(e) => setConnCredential(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConnSecret(!showConnSecret)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showConnSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">Entra Tenant ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 72f988bf-86f1-41af-91ab..."
                        value={connTenantId}
                        onChange={(e) => setConnTenantId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">Entra Client ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 1a2b3c4d-..."
                        value={connClientId}
                        onChange={(e) => setConnClientId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedConnection.id === 'azure_devops' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Personal Access Token (PAT)</label>
                    <div className="relative">
                      <input
                        type={showConnSecret ? 'text' : 'password'}
                        placeholder={selectedConnection.masked_credential || 'Azure DevOps PAT with Work Items & Build access'}
                        value={connCredential}
                        onChange={(e) => setConnCredential(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConnSecret(!showConnSecret)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showConnSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">Organization</label>
                      <input
                        type="text"
                        placeholder="e.g. EnterpriseOrg"
                        value={connOrg}
                        onChange={(e) => setConnOrg(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">Default Project</label>
                      <input
                        type="text"
                        placeholder="e.g. Phoenix"
                        value={connProject}
                        onChange={(e) => setConnProject(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedConnection.id === 'github' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">GitHub Personal Access Token (PAT / Fine-Grained)</label>
                    <div className="relative">
                      <input
                        type={showConnSecret ? 'text' : 'password'}
                        placeholder={selectedConnection.masked_credential || 'ghp_... or github_pat_...'}
                        value={connCredential}
                        onChange={(e) => setConnCredential(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConnSecret(!showConnSecret)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showConnSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">Owner / Organization</label>
                      <input
                        type="text"
                        placeholder="e.g. routeget"
                        value={connOrg}
                        onChange={(e) => setConnOrg(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-medium">Repositories (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. JarvisPA, phoenix-core"
                        value={connRepos}
                        onChange={(e) => setConnRepos(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedConnection.id === 'slack' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Slack Bot OAuth Token</label>
                    <div className="relative">
                      <input
                        type={showConnSecret ? 'text' : 'password'}
                        placeholder={selectedConnection.masked_credential || 'xoxb-...'}
                        value={connCredential}
                        onChange={(e) => setConnCredential(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConnSecret(!showConnSecret)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showConnSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">Default Channels (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. #project-phoenix, #announcements"
                      value={connChannels}
                      onChange={(e) => setConnChannels(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              )}

              {selectedConnection.id === 'n8n' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">n8n API Key / Webhook Secret</label>
                    <input
                      type="password"
                      placeholder="n8n API key"
                      value={connCredential}
                      onChange={(e) => setConnCredential(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium">n8n Instance URL</label>
                    <input
                      type="text"
                      placeholder="http://localhost:5678"
                      value={connUrl}
                      onChange={(e) => setConnUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              )}

              {/* General for other connections */}
              {!['m365', 'azure_devops', 'github', 'slack', 'n8n'].includes(selectedConnection.id) && (
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Authentication Token / Key</label>
                  <input
                    type="password"
                    placeholder="Enter credential or leave empty to keep existing"
                    value={connCredential}
                    onChange={(e) => setConnCredential(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300/90 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0 text-cyan-400 mt-0.5" />
                <span>
                  Credentials are encrypted on-device with AES-256 and never sent to external AI servers.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedConnection(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingConn}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSavingConn ? 'Saving to Vault...' : 'Save & Connect'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIGURE AI PROVIDER */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-slate-100 text-base">Configure {selectedProvider.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-slate-400 hover:text-slate-200 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProvider} className="space-y-4 text-xs">
              {/* API Key field */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">
                  {selectedProvider.key_name || 'API_KEY'}
                </label>
                <div className="relative">
                  <input
                    type={showProvKey ? 'text' : 'password'}
                    placeholder={selectedProvider.masked_key || 'Paste API Key (leave empty to keep existing)'}
                    value={provApiKey}
                    onChange={(e) => setProvApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProvKey(!showProvKey)}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showProvKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Endpoint */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">API Endpoint URL</label>
                <input
                  type="text"
                  placeholder="https://api.provider.com/v1"
                  value={provEndpoint}
                  onChange={(e) => setProvEndpoint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Models */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Default Model</label>
                  <input
                    type="text"
                    value={provDefaultModel}
                    onChange={(e) => setProvDefaultModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Fallback Model</label>
                  <input
                    type="text"
                    value={provFallbackModel}
                    onChange={(e) => setProvFallbackModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Budget & Enabled */}
              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Daily Budget Limit ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={provBudget}
                    onChange={(e) => setProvBudget(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="provEnabled"
                    checked={provEnabled}
                    onChange={(e) => setProvEnabled(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                  <label htmlFor="provEnabled" className="text-slate-300 cursor-pointer">
                    Enable Provider for Routing
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300/90 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0 text-cyan-400 mt-0.5" />
                <span>
                  API keys are stored encrypted in your local machine's vault. When active, J.A.R.V.I.S. routes queries directly to this provider.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProv}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSavingProv ? 'Encrypting & Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
