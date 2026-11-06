import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { ParseResultResponse } from '../types';

interface TestResultItem {
  id: string;
  input: string;
  result: ParseResultResponse | null;
  loading: boolean;
  error?: string | null;
}

const defaultGrammar = `E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> ( E ) | id`;

export const GrammarPlayground: React.FC = () => {
  const [grammarText, setGrammarText] = useState<string>(defaultGrammar);
  const [testStrings, setTestStrings] = useState<TestResultItem[]>([
    { id: '1', input: 'id + id * id', result: null, loading: false },
    { id: '2', input: '( id + id ) * id', result: null, loading: false },
    { id: '3', input: 'id + * id', result: null, loading: false },
    { id: '4', input: 'id id', result: null, loading: false },
  ]);

  const runSingleTest = async (index: number) => {
    const item = testStrings[index];
    setTestStrings((prev) =>
      prev.map((t, i) => (i === index ? { ...t, loading: true, error: null } : t))
    );

    try {
      const res = await apiService.simulateParse(grammarText, item.input);
      setTestStrings((prev) =>
        prev.map((t, i) => (i === index ? { ...t, result: res, loading: false } : t))
      );
    } catch (err: any) {
      setTestStrings((prev) =>
        prev.map((t, i) =>
          i === index
            ? { ...t, error: err.response?.data?.detail?.message || err.message, loading: false }
            : t
        )
      );
    }
  };

  const runAllTests = async () => {
    for (let i = 0; i < testStrings.length; i++) {
      await runSingleTest(i);
    }
  };

  const addTestString = () => {
    setTestStrings((prev) => [
      ...prev,
      { id: Date.now().toString(), input: '', result: null, loading: false },
    ]);
  };

  const removeTestString = (idx: number) => {
    setTestStrings((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grammar Testing Playground"
        description="Batch evaluate input test suites against custom CFGs to rapidly verify syntax acceptance, rejection, and compare parse traces."
        icon={Terminal}
        badge="Phase 3 Live"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CFG Grammar input (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Grammar Under Test
            </span>
            <span className="text-[10px] font-mono text-cyan-400">LL(1) Evaluator</span>
          </div>
          <textarea
            value={grammarText}
            onChange={(e) => setGrammarText(e.target.value)}
            rows={14}
            className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
          />
        </div>

        {/* Input String Test Harness (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Input String Test Suite
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={addTestString}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Test</span>
              </button>
              <button
                onClick={runAllTests}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run All</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {testStrings.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.input}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTestStrings((prev) =>
                        prev.map((t, i) => (i === idx ? { ...t, input: val, result: null } : t))
                      );
                    }}
                    placeholder="Enter token string, e.g. id + id"
                    className="flex-1 bg-[#0B0F19] border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => runSingleTest(idx)}
                    disabled={item.loading || !item.input.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 disabled:opacity-50"
                  >
                    {item.loading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : 'Run'}
                  </button>
                  <button
                    onClick={() => removeTestString(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Outcome */}
                {item.result && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                    <div className="flex items-center gap-1.5 font-semibold">
                      {item.result.success ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-mono">ACCEPTED</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span className="text-rose-400 font-mono">REJECTED</span>
                        </>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Derivation steps: {item.result.steps_count}
                    </span>
                  </div>
                )}

                {item.error && (
                  <div className="text-[11px] font-mono text-rose-400 pt-1">
                    Error: {item.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
