import React, { useState } from 'react';
import { Settings, ShieldAlert, Sliders, Cpu, Key, Lock, Volume2, Globe } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export const SettingsPage: React.FC = () => {
  const { safetyStatus, toggleEmergencyStop } = useAppStore();
  const [autonomyLevel, setAutonomyLevel] = useState<number>(2);
  const [primaryReasoningModel, setPrimaryReasoningModel] = useState<string>('claude-3-5-sonnet');
  const [fallbackModel, setFallbackModel] = useState<string>('gpt-4o');
  const [voiceProvider, setVoiceProvider] = useState<string>('gemini-live');

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Platform Settings & Security Policies
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure multi-model AI routing, human autonomy thresholds, and emergency fail-safes.
        </p>
      </div>

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
            <option value="gemini-live">Gemini Live Realtime Voice API</option>
            <option value="openai-realtime">OpenAI Realtime API</option>
            <option value="local-webspeech">Local System WebSpeech STT / TTS</option>
          </select>
        </div>
      </div>
    </div>
  );
};
