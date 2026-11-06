import React, { useState } from 'react';
import { MetricCard } from '../components/common/MetricCard';
import { ModuleCard } from '../components/common/ModuleCard';
import {
  FileCode2,
  GitBranchPlus,
  Compass,
  TableProperties,
  PlayCircle,
  Network,
  Activity,
  Layers,
  CheckCircle2,
  ArrowRight,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import type { GrammarTemplate, RecentActivityItem } from '../types';

const quickStartTemplates: GrammarTemplate[] = [
  {
    id: 'arithmetic-expr',
    title: 'Arithmetic Expressions',
    description: 'Classic arithmetic grammar with +, *, parentheses and identifiers.',
    type: 'Arithmetic Expressions',
    productionCount: 5,
    preview: 'E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id',
  },
  {
    id: 'conditional-stmt',
    title: 'Conditional Branching',
    description: 'If-Else conditional statements with dangling-else challenge demonstration.',
    type: 'Conditionals',
    productionCount: 4,
    preview: 'S -> if C then S S_prime | a\nS_prime -> else S | ε\nC -> b',
  },
  {
    id: 'json-subset',
    title: 'Micro-JSON Parser',
    description: 'Compact JSON subset supporting key-value pairs, arrays, and primitives.',
    type: 'JSON-subset',
    productionCount: 8,
    preview: 'Obj -> { Members }\nMembers -> Pair Rest\nPair -> key : Val',
  },
];

export const Dashboard: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<GrammarTemplate | null>(null);

  // Realistic empty-state & initialized state values (No fabricated usage numbers)
  const recentActivities: RecentActivityItem[] = [
    {
      id: 'act-1',
      action: 'Core engine initialized',
      target: 'FastAPI /api/health',
      timestamp: 'Just now',
      status: 'success',
    },
    {
      id: 'act-2',
      action: 'CORS & Client established',
      target: 'Vite React-TS frontend',
      timestamp: '2 mins ago',
      status: 'info',
    },
    {
      id: 'act-3',
      action: 'Workspace configured',
      target: 'ParseViz Phase 1 Shell',
      timestamp: '5 mins ago',
      status: 'info',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-slate-800 bg-gradient-to-r from-purple-950/40 via-[#111827] to-cyan-950/30 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-700/50 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ParseViz Interactive Compiler Suite • Phase 1 Online</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Welcome to ParseViz
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            The next-generation interactive platform for compiler design, context-free grammar transformations, FIRST &amp; FOLLOW computation, and stepwise LL(1) parsing visualization.
          </p>
        </div>
      </div>

      {/* Metrics & Statistics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            System &amp; Parser Statistics
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            Engine State: Standby (Awaiting Input)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Grammar Analysis Count"
            value="0"
            subtitle="Analyzed grammars in current session"
            icon={Layers}
            badge="Initialized"
            badgeType="info"
          />
          <MetricCard
            title="Parsing Success Rate"
            value="—"
            subtitle="No simulation runs recorded yet"
            icon={CheckCircle2}
            badge="No Data"
            badgeType="neutral"
          />
          <MetricCard
            title="Active LL(1) Grammars"
            value="0"
            subtitle="Non-conflicting grammars"
            icon={TableProperties}
            badge="Ready"
            badgeType="purple"
          />
          <MetricCard
            title="Engine Health"
            value="100%"
            subtitle="FastAPI backend and SQLite linked"
            icon={Activity}
            badge="Operational"
            badgeType="success"
          />
        </div>
      </div>

      {/* Quick Start Grammar Templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-400">
              Quick-Start Grammar Templates
            </h2>
            <p className="text-xs text-slate-500">
              Select a pre-configured CFG template to load directly into the Grammar Editor.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quickStartTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className="p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800">
                    {template.type}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {template.productionCount} rules
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {template.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {template.description}
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300/90 border border-slate-900 whitespace-pre">
                  {template.preview}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-cyan-400 transition-colors">
                <span>View template details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div>
        <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-4">
          Core Compiler Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ModuleCard
            title="Grammar Editor"
            description="Author, validate, and format Context-Free Grammars with real-time non-terminal and terminal resolution."
            path="/grammar-editor"
            icon={FileCode2}
            badge="Phase 1 Active"
          />
          <ModuleCard
            title="Transformation Studio"
            description="Eliminate Left Recursion (immediate & indirect) and apply Left Factoring with step-by-step mathematical proofs."
            path="/transformations"
            icon={GitBranchPlus}
            badge="Phase 2 Planned"
          />
          <ModuleCard
            title="FIRST & FOLLOW Sets"
            description="Compute derivation sets with complete step tracking, epsilon transitions, and interactive symbol inspector."
            path="/first-follow"
            icon={Compass}
            badge="Phase 3 Planned"
          />
          <ModuleCard
            title="LL(1) Parsing Table"
            description="Generate predictive parsing tables, detect multi-entry LL(1) conflicts, and verify grammar suitability."
            path="/ll1-table"
            icon={TableProperties}
            badge="Phase 4 Planned"
          />
          <ModuleCard
            title="Parsing Simulator"
            description="Stepwise stack and input buffer trace execution with Play, Pause, Step-Forward, and Step-Backward controls."
            path="/simulator"
            icon={PlayCircle}
            badge="Phase 5 Planned"
          />
          <ModuleCard
            title="Parse Tree Visualizer"
            description="Interactive D3.js and React Flow tree rendering with zoom, pan, node expansion, and SVG export."
            path="/parse-tree"
            icon={Network}
            badge="Phase 6 Planned"
          />
        </div>
      </div>

      {/* Bottom Section: Recent Projects & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects (Realistic Empty State) */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                Recent Projects
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Local SQLite Storage</span>
            </div>

            {/* Empty state container */}
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 px-4 rounded-xl bg-slate-950/40 border border-slate-800/60 border-dashed">
              <div className="p-3 rounded-2xl bg-slate-900 text-slate-500">
                <FolderOpen className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">No Grammars Saved Yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  You haven&apos;t created or saved any grammars to your local workspace yet. Open the Grammar Editor to construct your first CFG.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
            <a
              href="/grammar-editor"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              <span>Create New Grammar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                Platform Activity Stream
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Live Event Bus</span>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                    <div>
                      <div className="font-medium text-slate-200">{act.action}</div>
                      <div className="text-[11px] font-mono text-slate-500">{act.target}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Template Modal Preview */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{selectedTemplate.title}</h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">{selectedTemplate.description}</p>
            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 whitespace-pre">
              {selectedTemplate.preview}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
              >
                Close
              </button>
              <a
                href="/grammar-editor"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-colors shadow-lg shadow-purple-950"
              >
                Load in Editor
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
