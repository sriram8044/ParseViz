import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import {
  GitBranchPlus,
  Play,
  RotateCcw,
  Copy,
  Split,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { TransformResponse } from '../types';

const defaultGrammar = `E -> E + T | T
T -> T * F | F
F -> ( E ) | id`;

export const TransformationStudio: React.FC = () => {
  const [grammarText, setGrammarText] = useState<string>(defaultGrammar);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<TransformResponse | null>(null);

  const handleEliminateLeftRecursion = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.eliminateLeftRecursion(grammarText);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail?.message || err.message || 'Transformation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLeftFactor = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.leftFactor(grammarText);
      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail?.message || err.message || 'Transformation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transformation Studio"
        description="Eliminate immediate and indirect left recursion, and factor common prefixes to generate deterministic LL(1) grammars."
        icon={GitBranchPlus}
        badge="Phase 3 Live"
      />

      {/* Control Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={handleEliminateLeftRecursion}
            disabled={loading || !grammarText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-950 transition-all disabled:opacity-50"
          >
            {loading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Eliminate Left Recursion</span>
          </button>

          <button
            onClick={handleLeftFactor}
            disabled={loading || !grammarText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 transition-all disabled:opacity-50"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Apply Left Factoring</span>
          </button>
        </div>

        <button
          onClick={() => {
            setGrammarText(defaultGrammar);
            setResult(null);
            setErrorMsg(null);
          }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
        >
          Reset Default
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-300 font-mono">{errorMsg}</div>
        </div>
      )}

      {/* Side-by-Side Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Grammar */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Input CFG (Original)
            </span>
            <span className="text-[10px] font-mono text-purple-400">Editable</span>
          </div>
          <textarea
            value={grammarText}
            onChange={(e) => setGrammarText(e.target.value)}
            rows={12}
            className="w-full bg-[#0B0F19] border border-slate-800/80 rounded-xl p-4 font-mono text-sm text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
          />
        </div>

        {/* Transformed Output */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Transformed Output CFG
            </span>
            {result && (
              <button
                onClick={() => navigator.clipboard.writeText(result.transformed_grammar)}
                title="Copy transformed grammar"
                className="p-1 rounded text-slate-400 hover:text-cyan-400"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="w-full bg-[#0B0F19] border border-slate-800/80 rounded-xl p-4 font-mono text-sm text-purple-300 min-h-[288px] overflow-y-auto whitespace-pre leading-relaxed">
            {result ? result.transformed_grammar : '// Click "Eliminate Left Recursion" or "Apply Left Factoring" to generate.'}
          </div>
        </div>
      </div>

      {/* Step-by-Step Derivation Logs */}
      {result && (
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Mathematical Transformation Steps &amp; Proofs ({result.steps.length})</span>
          </h3>

          <div className="space-y-2.5">
            {result.steps.length > 0 ? (
              result.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-mono flex items-start gap-3"
                >
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 text-[10px] shrink-0">
                    Step {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                No transformations required. Grammar is already non-left-recursive or factored.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
