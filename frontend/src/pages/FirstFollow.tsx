import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import {
  Compass,
  Play,
  RotateCcw,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { FirstFollowResponse } from '../types';

const defaultGrammar = `E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> ( E ) | id`;

export const FirstFollow: React.FC = () => {
  const [grammarText, setGrammarText] = useState<string>(defaultGrammar);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<FirstFollowResponse | null>(null);
  const [selectedNt, setSelectedNt] = useState<string | null>(null);

  const handleCompute = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiService.getFirstFollow(grammarText);
      setData(res);
      if (res.non_terminals.length > 0) {
        setSelectedNt(res.non_terminals[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail?.message || err.message || 'Computation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="FIRST & FOLLOW Computation"
        description="Iterative fixed-point calculation of derivation sets, nullable symbols, and mathematical deduction logs."
        icon={Compass}
        badge="Phase 3 Live"
      />

      {/* Editor & Run Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Input Grammar
              </span>
              <button
                onClick={handleCompute}
                disabled={loading || !grammarText.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md transition-all disabled:opacity-50"
              >
                {loading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Compute Sets</span>
              </button>
            </div>
            <textarea
              value={grammarText}
              onChange={(e) => setGrammarText(e.target.value)}
              rows={11}
              className="w-full bg-[#0B0F19] border border-slate-800/80 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            />
          </div>

          {/* Nullable Indicators */}
          {data && (
            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Nullable Non-Terminals
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.nullable_symbols.length > 0 ? (
                  data.nullable_symbols.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono text-xs"
                    >
                      {s} ⇒* ε
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No nullable symbols</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Tables & Step Reasoning (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-300 font-mono">{errorMsg}</div>
            </div>
          )}

          {data ? (
            <div className="space-y-6">
              {/* Sets Table */}
              <div className="rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Calculated Set Inventory
                  </h3>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Click row to inspect deduction steps
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Non-Terminal</th>
                        <th className="p-3.5">FIRST Set</th>
                        <th className="p-3.5">FOLLOW Set</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {data.non_terminals.map((nt) => {
                        const isSelected = selectedNt === nt;
                        const firstList = data.first_sets[nt] || [];
                        const followList = data.follow_sets[nt] || [];
                        return (
                          <tr
                            key={nt}
                            onClick={() => setSelectedNt(nt)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-purple-950/40 text-cyan-300'
                                : 'hover:bg-slate-900/60 text-slate-300'
                            }`}
                          >
                            <td className="p-3.5 font-bold text-purple-400">{nt}</td>
                            <td className="p-3.5">
                              {'{ ' + firstList.map((s) => `'${s}'`).join(', ') + ' }'}
                            </td>
                            <td className="p-3.5 text-cyan-300">
                              {'{ ' + followList.map((s) => `'${s}'`).join(', ') + ' }'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deduction Reasoning Inspector */}
              {selectedNt && (
                <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 space-y-4 shadow-xl">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-400" />
                    <span>Deduction Proofs for &apos;{selectedNt}&apos;</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* FIRST Reason */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="text-[11px] font-semibold text-purple-400 uppercase">
                        FIRST({selectedNt}) Additions
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {(data.first_explanations[selectedNt] || []).map((exp, i) => (
                          <div key={i} className="text-xs text-slate-300 font-mono">
                            • {exp}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FOLLOW Reason */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="text-[11px] font-semibold text-cyan-400 uppercase">
                        FOLLOW({selectedNt}) Additions
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {(data.follow_explanations[selectedNt] || []).map((exp, i) => (
                          <div key={i} className="text-xs text-slate-300 font-mono">
                            • {exp}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-12 text-center text-xs text-slate-400">
              Click &quot;Compute Sets&quot; to calculate FIRST and FOLLOW tables and view derivation proofs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
