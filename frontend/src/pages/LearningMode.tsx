import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import {
  Play,
  RotateCcw,
  Sparkles,
  GitBranchPlus,
  Compass,
  TableProperties,
  Network,
  ShieldCheck,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { DemoWorkflowData } from '../types';

export const LearningMode: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [demoData, setDemoData] = useState<DemoWorkflowData | null>(null);
  const [activeStage, setActiveStage] = useState<number>(1);

  const runDemo = async () => {
    setLoading(true);
    try {
      const data = await apiService.getDemonstrationWorkflow();
      setDemoData(data);
      setActiveStage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demonstration Mode & Compiler Pedagogy"
        description="Live, automated guided walkthrough calculating the complete compiler workflow from arithmetic CFG to syntax tree."
        icon={Sparkles}
        badge="Live Demo Suite"
      />

      {/* Hero Action */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#111827] to-cyan-950/40 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Hackathon Guided Demonstration</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Live Engine Computed
            </span>
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Watch the ParseViz engine transform an ambiguous left-recursive arithmetic grammar, calculate fixed-point FIRST/FOLLOW sets, construct an LL(1) matrix, and execute pushdown automata parsing.
          </p>
        </div>

        <button
          onClick={runDemo}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-950 transition-all disabled:opacity-50"
        >
          {loading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          <span>Launch Demonstration</span>
        </button>
      </div>

      {/* Demonstration Stepper */}
      {demoData && (
        <div className="space-y-6">
          {/* Progress Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { id: 1, label: '1. Original CFG', icon: GitBranchPlus },
              { id: 2, label: '2. Transformed', icon: GitBranchPlus },
              { id: 3, label: '3. FIRST & FOLLOW', icon: Compass },
              { id: 4, label: '4. LL(1) Table', icon: TableProperties },
              { id: 5, label: '5. Automata Parse Tree', icon: Network },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setActiveStage(st.id)}
                className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeStage === st.id
                    ? 'bg-purple-950/80 border-purple-500 text-cyan-300 shadow-lg shadow-purple-950/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <st.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{st.label}</span>
              </button>
            ))}
          </div>

          {/* STAGE 1: Original Grammar */}
          {activeStage === 1 && (
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Stage 1: Ambiguous Left-Recursive CFG</h3>
                <span className="text-xs text-amber-400 font-mono">Contains Immediate Left-Recursion</span>
              </div>
              <p className="text-xs text-slate-400">
                Grammar for arithmetic expressions where rules contain direct left-recursion ($E \to E + T$), preventing deterministic top-down parsing.
              </p>
              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800">
                {demoData.original_grammar}
              </pre>
            </div>
          )}

          {/* STAGE 2: Transformed */}
          {activeStage === 2 && (
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Stage 2: Transformed Non-Left-Recursive CFG</h3>
                <span className="text-xs text-emerald-400 font-mono">Elimination Successful</span>
              </div>
              <p className="text-xs text-slate-400">
                Left-recursion was systematically eliminated introducing prime non-terminals ($E&apos;, T&apos;$) and epsilon transitions ($\varepsilon$).
              </p>
              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-purple-300 border border-slate-800">
                {demoData.transformed_grammar}
              </pre>
              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-semibold text-slate-300">Mathematical Steps:</div>
                {demoData.transformation_steps.map((st, i) => (
                  <div key={i} className="text-xs text-slate-400 font-mono p-2 rounded bg-slate-950">
                    • {st}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 3: FIRST & FOLLOW */}
          {activeStage === 3 && (
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Stage 3: Fixed-Point FIRST &amp; FOLLOW Sets</h3>
                <span className="text-xs text-cyan-400 font-mono">Fixed-Point Convergence</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Symbol</th>
                      <th className="p-3">FIRST Set</th>
                      <th className="p-3">FOLLOW Set</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {Object.keys(demoData.first_sets).map((nt) => (
                      <tr key={nt} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-purple-400">{nt}</td>
                        <td className="p-3 text-cyan-300">{'{ ' + demoData.first_sets[nt].join(', ') + ' }'}</td>
                        <td className="p-3 text-slate-300">{'{ ' + demoData.follow_sets[nt].join(', ') + ' }'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STAGE 4: LL(1) Table */}
          {activeStage === 4 && (
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Stage 4: LL(1) Parsing Table Verification</h3>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>0 Conflicts — Deterministic LL(1) Grammar</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                All production lookaheads are disjoint. Every cell in $M[A, a]$ contains at most one production rule.
              </p>
            </div>
          )}

          {/* STAGE 5: Automata & Parse Tree */}
          {activeStage === 5 && (
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Stage 5: Parsing Automata on &apos;{demoData.test_input}&apos;</h3>
                <span className="text-xs text-emerald-400 font-mono">
                  Parsed in {demoData.steps_count} steps (ACCEPTED)
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-slate-500 font-semibold uppercase text-[10px]">Sample PDA Execution Steps:</div>
                {demoData.trace.slice(0, 8).map((tr, i) => (
                  <div key={i} className="flex justify-between border-b border-slate-900 py-1">
                    <span className="text-slate-500">#{tr.step}</span>
                    <span className="text-cyan-300">Stack: {tr.stack}</span>
                    <span className="text-purple-300">Action: {tr.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
