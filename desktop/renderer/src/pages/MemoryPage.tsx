import React, { useState, useEffect } from 'react';
import { BrainCircuit, Search, Trash2, Shield, Star, RefreshCw } from 'lucide-react';
import { jarvisAPI } from '../services/api';
import { MemoryItem } from '../types';

export const MemoryPage: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const data = await jarvisAPI.getMemories();
      setMemories(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleForget = async (id: string) => {
    await jarvisAPI.forgetMemory(id);
    await fetchMemories();
  };

  const filteredMemories = memories.filter((m) => {
    return !search || m.content.toLowerCase().includes(search.toLowerCase()) || m.memory_type.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            Durable Memory & Semantic Vector Index
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect persistent long-term memories, user preferences, and data classification boundaries.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memory..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.map((m) => (
          <div key={m.id} className="rounded-xl glass-panel p-4 space-y-3 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {m.memory_type}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {m.classification}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{m.content}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>Importance: {m.importance}/5</span>
              </div>
              <button
                onClick={() => handleForget(m.id)}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-xs"
                title="Forget this memory"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Forget</span>
              </button>
            </div>
          </div>
        ))}
        {filteredMemories.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-500 text-xs">
            No durable memories found matching search.
          </div>
        )}
      </div>
    </div>
  );
};
