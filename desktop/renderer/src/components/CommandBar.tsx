import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, ArrowRight, CornerDownLeft, Sparkles, X } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export const CommandBar: React.FC = () => {
  const { isCommandBarOpen, setCommandBarOpen, sendMessage, setCurrentScreen, setVoiceModalOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+Space hotkey listener per Section 63
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setCommandBarOpen(!isCommandBarOpen);
      }
      if (e.key === 'Escape' && isCommandBarOpen) {
        setCommandBarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandBarOpen, setCommandBarOpen]);

  useEffect(() => {
    if (isCommandBarOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandBarOpen]);

  if (!isCommandBarOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query;
    setCommandBarOpen(false);
    setCurrentScreen('chat');
    sendMessage(q);
  };

  const quickPrompts = [
    "JARVIS, check my email, Teams, Slack and Azure DevOps for everything related to Project Phoenix",
    "Show me all critical bugs in Azure DevOps assigned to Marcus Vance",
    "Prepare daily morning executive briefing with meetings and urgent items",
    "Search GitHub for open PRs with green CI in phoenix-core",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-cyan-500/40 rounded-xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col">
        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tell J.A.R.V.I.S. what you want done... (e.g., Project Phoenix review)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setCommandBarOpen(false);
              setVoiceModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            title="Start Voice Input"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCommandBarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Suggestions per Section 108 */}
        <div className="p-3 bg-slate-900/60 space-y-1 text-xs">
          <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Recommended Autonomous Objectives</span>
          </div>
          {quickPrompts.map((p, idx) => (
            <div
              key={idx}
              onClick={() => {
                setCommandBarOpen(false);
                setCurrentScreen('chat');
                sendMessage(p);
              }}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 cursor-pointer transition-colors group"
            >
              <span className="truncate">{p}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
            </div>
          ))}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with <kbd className="font-mono bg-slate-800 px-1 rounded text-slate-400">Enter</kbd> to execute</span>
          <span>Close with <kbd className="font-mono bg-slate-800 px-1 rounded text-slate-400">Esc</kbd></span>
        </div>
      </div>
    </div>
  );
};
