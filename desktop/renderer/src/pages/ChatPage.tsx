import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  Paperclip, 
  Sparkles, 
  Clock, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Volume2
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export const ChatPage: React.FC = () => {
  const { 
    messages, 
    sendMessage, 
    isChatLoading, 
    currentTrace, 
    setVoiceModalOpen, 
    decideApproval,
    speakResponse 
  } = useAppStore();

  const [input, setInput] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('claude');
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading, currentTrace]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;
    const q = input;
    setInput('');
    sendMessage(q, selectedProvider);
  };

  const toggleTrace = (id: string) => {
    setExpandedTraceId(expandedTraceId === id ? null : id);
  };

  return (
    <div className="h-full flex flex-col justify-between bg-[#080c14] overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isTraceOpen = expandedTraceId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">
                  {isUser ? 'You' : 'J.A.R.V.I.S. Core'}
                </span>
                {!isUser && msg.provider && (
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px]">
                    {msg.provider.toUpperCase()} : {msg.model || 'model'}
                  </span>
                )}
                {!isUser && msg.duration_ms && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    {msg.duration_ms}ms
                  </span>
                )}
                {!isUser && (
                  <button
                    onClick={() => speakResponse(msg.content)}
                    className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 ml-1 px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20 transition-colors"
                    title="Speak response out loud (Text-to-Speech)"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Read Aloud</span>
                  </button>
                )}
              </div>

              {/* Message Body */}
              <div
                className={`rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-cyan-900/30'
                    : 'glass-panel text-slate-200 rounded-tl-none border border-slate-800/90 shadow-lg'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Safe Reasoning Activity Trace per Section 119 */}
                {msg.activity_trace && msg.activity_trace.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => toggleTrace(msg.id)}
                      className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Execution Trace ({msg.activity_trace.length} steps)</span>
                      {isTraceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isTraceOpen && (
                      <div className="mt-2 space-y-1 pl-2 border-l border-cyan-500/40 text-[11px] font-mono text-slate-400">
                        {msg.activity_trace.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-cyan-500 font-bold">›</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Citations & Evidence per Section 117 */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                      <span>Correlated Evidence & Citations</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((c, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] space-y-0.5">
                          <span className="font-semibold text-cyan-300 block">{c.system}</span>
                          <span className="text-slate-300 truncate block">{c.title}</span>
                          {c.source && <span className="text-[10px] text-slate-500 block truncate">{c.source}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* In-Chat Approval Requests */}
                {msg.pending_approvals && msg.pending_approvals.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Authorization Required</span>
                    </div>
                    {msg.pending_approvals.map((appr) => (
                      <div key={appr.id} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="font-semibold text-slate-200">{appr.title}</div>
                          <div className="text-[11px] text-slate-400">{appr.description}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => decideApproval(appr.id, 'REJECTED')}
                            className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => decideApproval(appr.id, 'APPROVED')}
                            className="px-2.5 py-1 rounded bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 text-xs"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Loading Stepper */}
        {isChatLoading && (
          <div className="flex flex-col items-start max-w-4xl mx-auto space-y-2">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>J.A.R.V.I.S. is executing workflow...</span>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 w-full space-y-2">
              {currentTrace.map((trace, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{trace}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#090e1a]/95 backdrop-blur-md">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto space-y-2">
          {/* Provider Selection & Controls */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-500">PROVIDER:</span>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="claude">Claude 3.5 Sonnet (Default)</option>
                <option value="openai">OpenAI GPT-4o</option>
                <option value="gemini">Google Gemini 1.5 Pro</option>
                <option value="groq">Groq LLaMA 3.3 (Fast)</option>
                <option value="openrouter">OpenRouter Gateway</option>
                <option value="ollama">Ollama (Local Air-Gapped)</option>
              </select>
            </div>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              Autonomy: Level 2 (Human Approval for High Risk)
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 p-2 focus-within:border-cyan-500/60 transition-colors shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell J.A.R.V.I.S. what to accomplish across connected systems..."
              className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 px-2 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setVoiceModalOpen(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
              title="Voice Input"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={isChatLoading || !input.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 text-xs shadow-md shadow-cyan-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
