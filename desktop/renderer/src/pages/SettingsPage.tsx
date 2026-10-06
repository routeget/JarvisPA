import React, { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Sliders, Cpu, Key, Lock, Volume2, Globe, ExternalLink, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { jarvisAPI } from '../services/api';
import { AIProviderItem } from '../types';

export const SettingsPage: React.FC = () => {
  const { safetyStatus, toggleEmergencyStop, setCurrentScreen } = useAppStore();
  const [autonomyLevel, setAutonomyLevel] = useState<number>(2);
  const [primaryReasoningModel, setPrimaryReasoningModel] = useState<string>('claude-3-5-sonnet');
  const [fallbackModel, setFallbackModel] = useState<string>('gpt-4o');
  const [voiceProvider, setVoiceProvider] = useState<string>('local-webspeech');

  // Quick API Key Config
  const [providers, setProviders] = useState<AIProviderItem[]>([]);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [quickApiKey, setQuickApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<boolean>(false);

  const fetchProviders = async () => {
    try {
      const data = await jarvisAPI.getProviders();
      setProviders(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleQuickSaveKey = async (providerId: string) => {
    if (!quickApiKey.trim()) return;
    setSavingKey(true);
    setSaveMessage(null);
    try {
      await jarvisAPI.configureProvider(providerId, { api_key: quickApiKey.trim() });
      setSaveMessage(`Key saved and encrypted for ${providerId.toUpperCase()}.`);
      setQuickApiKey('');
      setEditingProviderId(null);
      await fetchProviders();
    } catch (e: any) {
      setSaveMessage(`Error saving key: ${e.message}`);
    } finally {
      setSavingKey(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Platform Settings & Security Policies
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure multi-model AI routing, human autonomy thresholds, API keys, and emergency fail-safes.
        </p>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center justify-between">
          <span>{saveMessage}</span>
          <button onClick={() => setSaveMessage(null)} className="text-slate-400 hover:text-slate-200">×</button>
        </div>
      )}

      {/* Emergency Safety Controls (Section 120) */}
      <div className="rounded-xl glass-panel p-5 border border-rose-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Emergency Safety Controls (Section 120)
            </h2>
            <p className="text-xs text-slate-400">
              Instantly halt all agent reasoning, background tasks, and external network transmissions.
            </p>
          </div>
          <button
            onClick={toggleEmergencyStop}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              safetyStatus.is_emergency_stopped
                ? 'bg-rose-600 text-white shadow-rose-600/50 animate-pulse'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {safetyStatus.is_emergency_stopped ? 'EMERGENCY STOP ACTIVE' : 'TRIGGER STOP ALL'}
          </button>
        </div>
      </div>

      {/* AI Provider API Keys & Vault Quick Setup */}
      <div className="rounded-xl glass-panel p-5 space-y-4 border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              AI Provider API Keys (Encrypted Local Vault)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              API keys are encrypted using AES-256 and stored locally in <code className="text-cyan-400 font-mono">.vault_store.enc</code>.
            </p>
          </div>
          <button
            onClick={() => setCurrentScreen('connections')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1 font-medium"
          >
            <span>Full Integrations Hub</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {providers.map((p) => {
            const isEditing = editingProviderId === p.id;
            return (
              <div
                key={p.id}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{p.name}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      p.is_configured
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {p.is_configured ? `Active (${p.masked_key})` : 'Mock / No Key'}
                  </span>
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-1">
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        placeholder={`Paste ${p.key_name || 'API Key'}`}
                        value={quickApiKey}
                        onChange={(e) => setQuickApiKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2 top-2 text-slate-500 hover:text-slate-300"
                      >
                        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setEditingProviderId(null);
                          setQuickApiKey('');
                        }}
                        className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleQuickSaveKey(p.id)}
                        disabled={savingKey}
                        className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-[11px] hover:bg-cyan-400 disabled:opacity-50"
                      >
                        {savingKey ? 'Saving...' : 'Save to Vault'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 font-mono">Env: {p.key_name}</span>
                    <button
                      onClick={() => {
                        setEditingProviderId(p.id);
                        setQuickApiKey('');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] underline"
                    >
                      {p.is_configured ? 'Update Key' : 'Configure Key'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Autonomy Level Slider (Section 56) */}
      <div className="rounded-xl glass-panel p-5 space-y-4 border border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Human Control & Autonomy Level (Section 56)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controls whether low-risk and high-risk actions require explicit human authorization before execution.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-cyan-400">
            <span>Level {autonomyLevel}: {
              autonomyLevel === 0 ? 'Advisory Only (No Execution)' :
              autonomyLevel === 1 ? 'Draft Mode (Prepares Actions Only)' :
              autonomyLevel === 2 ? 'Approval Mode (Standard - Approval Required for High Risk)' :
              autonomyLevel === 3 ? 'Controlled Autonomous (Pre-Approved Low Risk Auto-Run)' :
              'Advanced Autonomous (All Configured Workflows Auto-Run)'
            }</span>
          </div>
          <input
            type="range"
            min="0"
            max="4"
            value={autonomyLevel}
            onChange={(e) => setAutonomyLevel(parseInt(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0: Advisory</span>
            <span>1: Draft</span>
            <span>2: Approval (Default)</span>
            <span>3: Controlled</span>
            <span>4: Advanced</span>
          </div>
        </div>
      </div>

      {/* AI Model Routing Strategy (Section 7, 50, 51, 123) */}
      <div className="rounded-xl glass-panel p-5 space-y-4 border border-slate-800">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          Model Routing Strategy (Section 123)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-400">Primary Reasoning Model</label>
            <select
              value={primaryReasoningModel}
              onChange={(e) => setPrimaryReasoningModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Recommended)</option>
              <option value="gpt-4o">OpenAI GPT-4o</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400">Failover / Fallback Model (Section 81)</label>
            <select
              value={fallbackModel}
              onChange={(e) => setFallbackModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="gpt-4o">OpenAI GPT-4o</option>
              <option value="openrouter">OpenRouter Gateway</option>
              <option value="ollama-local">Ollama Local Air-Gapped Model</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voice Configuration (Section 40-42) */}
      <div className="rounded-xl glass-panel p-5 space-y-4 border border-slate-800">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          Voice & Real-Time Interaction (Section 41)
        </h2>
        <div className="text-xs space-y-1.5">
          <label className="text-slate-400">Real-Time Voice Engine</label>
          <select
            value={voiceProvider}
            onChange={(e) => setVoiceProvider(e.target.value)}
            className="w-full sm:w-80 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500 block"
          >
            <option value="local-webspeech">Local System WebSpeech STT / TTS (Active)</option>
            <option value="gemini-live">Gemini Live Realtime Voice API</option>
            <option value="openai-realtime">OpenAI Realtime API</option>
          </select>
        </div>
      </div>
    </div>
  );
};
