import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import {
  TableProperties,
  Play,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { ParsingTableResponse } from '../types';

const defaultGrammar = `E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> ( E ) | id`;

export const LL1Table: React.FC = () => {
  const [grammarText, setGrammarText] = useState<string>(defaultGrammar);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<ParsingTableResponse | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiService.getParsingTable(grammarText);
      setData(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail?.message || err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="LL(1) Predictive Parsing Table"
        description="Construct predictive parsing matrix M[A, a], verify LL(1) determinism, and highlight FIRST/FIRST and FIRST/FOLLOW conflicts."
        icon={TableProperties}
        badge="Phase 3 Live"
      />

      {/* Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading || !grammarText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-950 transition-all disabled:opacity-50"
          >
            {loading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Generate LL(1) Table</span>
          </button>

          {data && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold">
              {data.is_ll1 ? (
                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border-emerald-800/60 px-2 py-0.5 rounded-lg border">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Grammar is strictly LL(1) Valid</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-400 bg-rose-950/60 border-rose-800/60 px-2 py-0.5 rounded-lg border">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Non-LL(1): {data.conflicts.length} Conflict Cell(s)</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-300 font-mono">{errorMsg}</div>
        </div>
      )}

      {/* Editor & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block pb-2 border-b border-slate-800">
              CFG Rules
            </span>
            <textarea
              value={grammarText}
              onChange={(e) => setGrammarText(e.target.value)}
              rows={12}
              className="w-full bg-[#0B0F19] border border-slate-800/80 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            />
          </div>

          {/* Conflict Summary Box */}
          {data && data.conflicts.length > 0 && (
            <div className="rounded-2xl border border-rose-900/60 bg-rose-950/30 p-4 space-y-2.5">
              <span className="text-xs font-semibold text-rose-300 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Conflicts Detected</span>
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {data.conflicts.map((c, i) => (
                  <div key={i} className="text-xs text-rose-300/90 font-mono p-2 bg-slate-950/80 rounded border border-rose-900/40">
                    <div className="font-bold text-rose-400">[{c.non_terminal}, {c.terminal}] — {c.conflict_type}</div>
                    <div className="text-[11px] text-slate-400">{c.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2D Table Display (3 cols) */}
        <div className="lg:col-span-3">
          {data ? (
            <div className="rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Parsing Matrix M[Non-Terminal, Terminal]
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  {data.non_terminals.length} rows × {data.terminals.length} columns
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3 border-r border-b border-slate-800 bg-slate-950 sticky left-0 z-10 text-purple-400">
                        NT \ T
                      </th>
                      {data.terminals.map((t) => (
                        <th key={t} className="p-3 border-r border-b border-slate-800 text-cyan-300 text-center">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.non_terminals.map((nt) => (
                      <tr key={nt} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-purple-400 border-r border-slate-800 bg-[#111827] sticky left-0 z-10">
                          {nt}
                        </td>
                        {data.terminals.map((t) => {
                          const entries = data.table[nt]?.[t] || [];
                          const isConflict = entries.length > 1;
                          return (
                            <td
                              key={t}
                              className={`p-2.5 border-r border-slate-800/80 text-center align-middle ${
                                isConflict
                                  ? 'bg-rose-950/60 text-rose-300 border-rose-800 ring-1 ring-rose-500/50'
                                  : entries.length > 0
                                  ? 'bg-slate-900/40 text-slate-200'
                                  : 'text-slate-600'
                              }`}
                            >
                              {entries.length > 0 ? (
                                <div className="space-y-1">
                                  {entries.map((e, idx) => (
                                    <div
                                      key={idx}
                                      className="px-2 py-1 rounded bg-slate-950/90 border border-slate-800 text-[11px] whitespace-nowrap"
                                    >
                                      {e.representation}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                '—'
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-16 text-center text-xs text-slate-400 shadow-xl">
              Click &quot;Generate LL(1) Table&quot; to build the predictive 2D parsing matrix.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
