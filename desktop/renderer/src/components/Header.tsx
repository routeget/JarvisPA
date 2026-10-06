import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Mic, 
  Search, 
  Bell, 
  Sliders, 
  Cpu, 
  Radio,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export const Header: React.FC = () => {
  const { 
    safetyStatus, 
    toggleEmergencyStop, 
    pendingApprovals, 
    setCurrentScreen,
    setCommandBarOpen,
    setVoiceModalOpen,
    voiceResponseEnabled,
    setVoiceResponseEnabled,
    stopSpeaking
  } = useAppStore();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-slate-800 bg-[#0a0f1d]/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Platform Brand & Operational Status */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-sm">
          J
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wider text-slate-100">J.A.R.V.I.S.</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              LEVEL 2 AGENT
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Multi-Model MCP Runtime Active</span>
          </div>
        </div>
      </div>

      {/* Center: Global Search / Command Bar Trigger */}
      <div 
        onClick={() => setCommandBarOpen(true)}
        className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 text-xs hover:border-cyan-500/50 hover:text-slate-200 cursor-pointer transition-all w-80 justify-between"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask J.A.R.V.I.S. or trigger task...</span>
        </div>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 rounded border border-slate-700 text-slate-400">
          Ctrl + Space
        </kbd>
      </div>

      {/* Right: Actions, Voice, Approvals, Emergency Stop */}
      <div className="flex items-center gap-2.5">
        {/* Voice Response (TTS) Toggle */}
        <button
          onClick={() => {
            const next = !voiceResponseEnabled;
            setVoiceResponseEnabled(next);
            if (!next) stopSpeaking();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
            voiceResponseEnabled
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={voiceResponseEnabled ? "Voice Response: Enabled (Click to Mute)" : "Voice Response: Muted (Click to Enable)"}
        >
          {voiceResponseEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline font-mono text-[11px]">Voice: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline font-mono text-[11px]">Voice: MUTED</span>
            </>
          )}
        </button>

        {/* Voice Trigger Button */}
        <button
          onClick={() => setVoiceModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs hover:bg-indigo-500/20 transition-colors"
          title="Start Real-Time Voice Mode"
        >
          <Mic className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline font-mono">Speak</span>
        </button>

        {/* Pending Approvals Pill */}
        {pendingApprovals.length > 0 && (
          <button
            onClick={() => setCurrentScreen('tasks')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs animate-bounce"
            title={`${pendingApprovals.length} Action(s) awaiting approval`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{pendingApprovals.length} Approval{pendingApprovals.length > 1 ? 's' : ''}</span>
          </button>
        )}

        {/* Local Clock */}
        <div className="hidden lg:flex items-center font-mono text-xs text-slate-400 px-2 py-1 rounded bg-slate-900/60 border border-slate-800">
          {currentTime || '00:00:00'}
        </div>

        {/* Emergency Stop / Safety Button (Section 120) */}
        <button
          onClick={toggleEmergencyStop}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
            safetyStatus.is_emergency_stopped
              ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/50'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
          }`}
          title="Section 120: Emergency Stop All Agent Execution"
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>{safetyStatus.is_emergency_stopped ? 'STOP ACTIVE' : 'STOP ALL'}</span>
        </button>
      </div>
    </header>
  );
};
