import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import {
  PlayCircle,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { ParseResultResponse, TraceStep } from '../types';

const defaultGrammar = `E -> T E'
E' -> + T E' | ε
T -> F T'
T' -> * F T' | ε
F -> ( E ) | id`;

export const ParsingSimulator: React.FC = () => {
  const [grammarText, setGrammarText] = useState<string>(defaultGrammar);
  const [inputString, setInputString] = useState<string>('id + id * id');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<ParseResultResponse | null>(null);

  // Playback state
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(600);
  const timerRef = useRef<number | null>(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    setErrorMsg(null);
    setIsPlaying(false);
    try {
      const data = await apiService.simulateParse(grammarText, inputString);
      setSimulation(data);
      setCurrentStepIdx(0);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail?.message || err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  // Playback timer
  useEffect(() => {
    if (isPlaying && simulation && simulation.trace.length > 0) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= simulation.trace.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, simulation, speedMs]);

  const activeStep: TraceStep | null =
    simulation && simulation.trace[currentStepIdx] ? simulation.trace[currentStepIdx] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interactive Parsing Simulator"
        description="Stepwise execution of LL(1) predictive stack pushdown automata with playback controls, lookahead token buffer, and real-time state visualization."
        icon={PlayCircle}
        badge="Phase 3 Live"
      />

      {/* Input configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Grammar &amp; Input String
            </span>
            <button
              onClick={handleRunSimulation}
              disabled={loading || !grammarText.trim() || !inputString.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-950 transition-all disabled:opacity-50"
            >
              {loading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>Simulate Parse</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">CFG Productions</label>
              <textarea
                value={grammarText}
                onChange={(e) => setGrammarText(e.target.value)}
                rows={6}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Input Token Stream</label>
                <input
                  type="text"
                  value={inputString}
                  onChange={(e) => setInputString(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. id + id * id"
                />
              </div>

              {simulation && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Outcome:</span>
                    {simulation.success ? (
                      <span className="text-emerald-400 font-bold font-mono">ACCEPTED</span>
                    ) : (
                      <span className="text-rose-400 font-bold font-mono">SYNTAX ERROR</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>Total Derivation Steps:</span>
                    <span className="font-mono text-slate-300">{simulation.steps_count}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Playback Controls Box */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Playback Controls
            </span>

            {simulation && (
              <div className="text-xs font-mono text-slate-300 flex justify-between">
                <span>Step:</span>
                <span className="text-cyan-400 font-bold">
                  {currentStepIdx + 1} / {simulation.trace.length}
                </span>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx((p) => Math.max(0, p - 1));
                }}
                disabled={!simulation || currentStepIdx === 0}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40"
                title="Step backward"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!simulation}
                className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950 disabled:opacity-40"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx((p) =>
                    simulation ? Math.min(simulation.trace.length - 1, p + 1) : 0
                  );
                }}
                disabled={!simulation || (simulation && currentStepIdx >= simulation.trace.length - 1)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40"
                title="Step forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx(0);
                }}
                disabled={!simulation}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Playback Interval</span>
              <span className="font-mono text-cyan-400">{speedMs} ms</span>
            </div>
            <input
              type="range"
              min={100}
              max={1500}
              step={50}
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 font-mono">
          {errorMsg}
        </div>
      )}

      {/* Live State Stage */}
      {activeStep && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stack Panel */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Parsing Stack</span>
              <span className="text-[10px] font-mono text-purple-400">Top on Right</span>
            </span>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-cyan-300 min-h-[72px] flex items-center overflow-x-auto whitespace-nowrap">
              {activeStep.stack.split(' ').map((sym, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 mx-0.5 rounded ${
                    i === activeStep.stack.split(' ').length - 1
                      ? 'bg-purple-900 text-purple-200 border border-purple-600 font-bold'
                      : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  {sym}
                </span>
              ))}
            </div>
          </div>

          {/* Remaining Input Buffer */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Input Buffer</span>
              <span className="text-[10px] font-mono text-cyan-400">Lookahead: &apos;{activeStep.lookahead}&apos;</span>
            </span>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-purple-300 min-h-[72px] flex items-center overflow-x-auto whitespace-nowrap">
              {activeStep.input}
            </div>
          </div>

          {/* Action & Production Applied */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Automata Action
            </span>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1 min-h-[72px] flex flex-col justify-center">
              <div className="text-emerald-400 font-bold">{activeStep.action}</div>
              {activeStep.production && (
                <div className="text-slate-400 text-[11px]">Rule: {activeStep.production}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Execution Trace Table */}
      {simulation && (
        <div className="rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Complete Execution Trace History
            </h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="p-3 w-16">Step</th>
                  <th className="p-3">Stack</th>
                  <th className="p-3">Input</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {simulation.trace.map((tr, idx) => {
                  const isActive = idx === currentStepIdx;
                  return (
                    <tr
                      key={idx}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIdx(idx);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-purple-950/60 text-cyan-300 font-semibold'
                          : 'hover:bg-slate-900/40 text-slate-300'
                      }`}
                    >
                      <td className="p-3 text-slate-500 font-bold">#{tr.step}</td>
                      <td className="p-3 text-cyan-300">{tr.stack}</td>
                      <td className="p-3 text-purple-300">{tr.input}</td>
                      <td className="p-3 font-semibold text-emerald-400">{tr.action}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
