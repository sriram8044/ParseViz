import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  phase: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  phase,
  description,
  icon: Icon,
  features,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#111827]/70 backdrop-blur p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-purple-400">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                {phase}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Target Capabilities for this Module</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            {features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-950/20 via-slate-900 to-cyan-950/20 border border-slate-800">
          <div className="text-xs text-slate-400">
            Backend API integration endpoints and visualizer components mapped.
          </div>
          <span className="text-xs font-mono text-cyan-400 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
            Phase 1 Ready
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#111827]/70 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Module Architecture Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Router Configuration:</span>
              <span className="font-mono text-emerald-400">Configured & Mounted</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Axios Client Link:</span>
              <span className="font-mono text-emerald-400">Available</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Design System Theme:</span>
              <span className="font-mono text-cyan-400">Deep Navy Dark</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-[#111827]/70 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Integration Readiness
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All data contracts and visual layouts conform to the ParseViz multi-phase compiler specification.
          </p>
        </div>
      </div>
    </div>
  );
};
