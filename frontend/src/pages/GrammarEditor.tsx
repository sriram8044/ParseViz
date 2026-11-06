import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import {
  FileCode2,
  Play,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  ListTree,
  RotateCcw,
} from 'lucide-react';
import { apiService } from '../services/api';
import type { GrammarResponse, ExampleGrammar } from '../types';

const defaultGrammar = `E -> E + T | T
T -> T * F | F
F -> ( E ) | id`;

export const GrammarEditor: React.FC = () => {
  const [grammarText, setGrammarText] = useState<string>(defaultGrammar);
  const [customStartSymbol, setCustomStartSymbol] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorPosition, setErrorPosition] = useState<{ line: number; column: number } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GrammarResponse | null>(null);
  const [isOutdated, setIsOutdated] = useState<boolean>(false);
  const [examples, setExamples] = useState<ExampleGrammar[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'productions' | 'terminals' | 'diagnostics'>('overview');

  // Load backend examples on mount
  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const data = await apiService.getExamples();
        setExamples(data);
      } catch (err) {
        console.warn('Failed to load examples from backend:', err);
      }
    };
    fetchExamples();
  }, []);

  const handleTextChange = (text: string) => {
    setGrammarText(text);
    if (analysisResult) {
      setIsOutdated(true);
    }
  };

  const handleParse = async () => {
    setLoading(true);
    setErrorMsg(null);
    setErrorPosition(null);
    try {
      const data = await apiService.parseGrammar(
        grammarText,
        customStartSymbol.trim() || undefined
      );
      setAnalysisResult(data);
      setIsOutdated(false);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'object' && detail !== null) {
        setErrorMsg(detail.message || 'Grammar processing error');
        if (detail.line) {
          setErrorPosition({ line: detail.line, column: detail.column || 1 });
        }
      } else if (typeof detail === 'string') {
        setErrorMsg(detail);
      } else {
        setErrorMsg(err.message || 'Unable to connect to ParseViz backend engine.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setLoading(true);
    setErrorMsg(null);
    setErrorPosition(null);
    try {
      const data = await apiService.validateGrammar(
        grammarText,
        customStartSymbol.trim() || undefined
      );
      if (analysisResult) {
        setAnalysisResult({
          ...analysisResult,
          validation: data.validation,
        });
      } else {
        // If no full analysis yet, run parse to get full view
        await handleParse();
        return;
      }
      setIsOutdated(false);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setErrorMsg(detail?.message || err.message || 'Validation failed');
      if (detail?.line) {
        setErrorPosition({ line: detail.line, column: detail.column || 1 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    await handleParse();
  };

  const loadExample = (ex: ExampleGrammar) => {
    setGrammarText(ex.grammar);
    setCustomStartSymbol(ex.start_symbol);
    setAnalysisResult(null);
    setIsOutdated(false);
    setErrorMsg(null);
    setErrorPosition(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grammar Editor & CFG Engine"
        description="Author, parse, and validate Context-Free Grammars with real-time symbol classification, epsilon detection, and direct recursion analysis."
        icon={FileCode2}
        badge="Phase 2 Online"
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 shadow-xl space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400">grammar.cfg</span>

                {isOutdated && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/60 animate-pulse">
                    Outdated Analysis (Re-run)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTextChange('')}
                  title="Clear editor"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(grammarText)}
                  title="Copy grammar"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-slate-800 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Custom Start Symbol Input */}
            <div className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">Start Symbol:</span>
              <input
                type="text"
                placeholder="Auto (First production head)"
                value={customStartSymbol}
                onChange={(e) => {
                  setCustomStartSymbol(e.target.value);
                  if (analysisResult) setIsOutdated(true);
                }}
                className="bg-[#0B0F19] border border-slate-800 rounded-lg px-3 py-1 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 w-44"
              />
              <span className="text-[11px] text-slate-500">
                (Defaults to first Non-Terminal if blank)
              </span>
            </div>

            {/* Editor TextArea */}
            <div className="relative">
              <textarea
                value={grammarText}
                onChange={(e) => handleTextChange(e.target.value)}
                rows={13}
                spellCheck={false}
                className="w-full bg-[#0B0F19] border border-slate-800/80 rounded-xl p-4 font-mono text-sm text-cyan-300 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 leading-relaxed resize-none shadow-inner"
                placeholder="E -> E + T | T&#10;T -> T * F | F&#10;F -> ( E ) | id"
              />
            </div>

            {/* Lexical / Syntax Error Alert */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-rose-300">
                    Syntax / Lexical Error
                  </div>
                  <div className="text-xs text-rose-400 font-mono">{errorMsg}</div>
                  {errorPosition && (
                    <div className="text-[11px] font-mono text-rose-400/80">
                      Line: {errorPosition.line}, Column: {errorPosition.column}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-slate-500 font-mono">
                Tokens: <span className="text-slate-400">Upper (NT), lower/quotes (T), ε (epsilon)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleValidate}
                  disabled={loading || !grammarText.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Validate</span>
                </button>

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !grammarText.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-purple-300 bg-purple-950/50 hover:bg-purple-900/50 border border-purple-800/50 transition-colors disabled:opacity-50"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Analyze</span>
                </button>

                <button
                  onClick={handleParse}
                  disabled={loading || !grammarText.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-950 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>Parse Grammar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Example Grammars Library */}
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Working CFG Templates Library</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {examples.length} catalog items
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {examples.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => loadExample(ex)}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/80 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">
                        {ex.category}
                      </span>
                      {ex.has_left_recursion && (
                        <span className="text-[9px] font-mono text-amber-400">
                          Left-Recursive
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {ex.title}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-cyan-400">
                    <span>Load into editor</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Engine Analysis & Symbol Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 space-y-4">
            {/* Header Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Grammar Inspector
              </h3>
              <div className="flex gap-1">
                {(['overview', 'productions', 'terminals', 'diagnostics'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors uppercase tracking-wider ${
                      activeTab === tab
                        ? 'bg-purple-950 text-cyan-300 border border-purple-800/60'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis Content or Empty State */}
            {analysisResult ? (
              <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2">
                    {analysisResult.validation.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="text-xs font-semibold text-slate-200">
                      {analysisResult.validation.valid ? 'Grammar is Well-Formed' : 'Validation Issues Detected'}
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                    Start: {analysisResult.start_symbol}
                  </span>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                        <div className="text-[10px] uppercase font-semibold text-slate-500">
                          Non-Terminals (V_N)
                        </div>
                        <div className="text-xl font-bold font-mono text-purple-300 mt-1">
                          {analysisResult.non_terminals.length}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                        <div className="text-[10px] uppercase font-semibold text-slate-500">
                          Terminals (V_T)
                        </div>
                        <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                          {analysisResult.terminals.length}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                        <div className="text-[10px] uppercase font-semibold text-slate-500">
                          Total Productions
                        </div>
                        <div className="text-xl font-bold font-mono text-white mt-1">
                          {analysisResult.statistics.production_count}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                        <div className="text-[10px] uppercase font-semibold text-slate-500">
                          Alternatives
                        </div>
                        <div className="text-xl font-bold font-mono text-white mt-1">
                          {analysisResult.statistics.alternative_count}
                        </div>
                      </div>
                    </div>

                    {/* Left Recursion Alert */}
                    {analysisResult.statistics.direct_left_recursive.length > 0 ? (
                      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>Direct Left Recursion Detected</span>
                        </div>
                        <p className="text-xs text-amber-400/90 leading-relaxed">
                          Symbols <span className="font-mono font-bold">{analysisResult.statistics.direct_left_recursive.join(', ')}</span> contain direct left-recursive rules. Will require elimination in Phase 2/3 for LL(1) parsing.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>No immediate left recursion found.</span>
                      </div>
                    )}

                    {/* Epsilon Symbols */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="text-xs font-semibold text-slate-400">
                        Epsilon (Nullable) Direct Producers:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.statistics.epsilon_non_terminals.length > 0 ? (
                          analysisResult.statistics.epsilon_non_terminals.map((sym) => (
                            <span
                              key={sym}
                              className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-800 font-mono text-xs text-purple-300"
                            >
                              {sym} -&gt; ε
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">None (No direct epsilon rules)</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PRODUCTIONS */}
                {activeTab === 'productions' && (
                  <div className="space-y-3 animate-fadeIn max-h-[420px] overflow-y-auto pr-1">
                    {analysisResult.productions.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-purple-400">
                            {rule.head}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {rule.alternatives.length} alternative(s)
                          </span>
                        </div>

                        <div className="space-y-1">
                          {rule.alternatives.map((alt, aIdx) => (
                            <div
                              key={aIdx}
                              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800/80 font-mono text-xs text-cyan-300 flex items-center justify-between"
                            >
                              <span>
                                {rule.head} -&gt; {alt.representation}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Rule #{alt.rule_index}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: TERMINALS & SYMBOLS */}
                {activeTab === 'terminals' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 mb-2">
                        Non-Terminal Vocabulary (V_N)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.non_terminals.map((nt) => (
                          <span
                            key={nt}
                            className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-800 font-mono text-xs text-purple-300"
                          >
                            {nt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-400 mb-2">
                        Terminal Vocabulary (V_T)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.terminals.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800/70 font-mono text-xs text-cyan-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: DIAGNOSTICS */}
                {activeTab === 'diagnostics' && (
                  <div className="space-y-3 animate-fadeIn">
                    {/* Warnings */}
                    {analysisResult.validation.warnings.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Validation Warnings</span>
                        </div>
                        {analysisResult.validation.warnings.map((w, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 text-xs text-amber-300"
                          >
                            {w.message}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Informational Notices */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Notices &amp; Readiness</span>
                      </div>
                      {analysisResult.validation.info.map((inf, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                        >
                          {inf.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 px-4 rounded-xl bg-slate-950/40 border border-slate-800/60 border-dashed">
                <div className="p-3 rounded-2xl bg-slate-900 text-slate-500">
                  <ListTree className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Grammar Analysis Pending
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Click &quot;Parse Grammar&quot; or select one of the pre-loaded CFG templates to inspect productions, symbols, and direct recursion.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
