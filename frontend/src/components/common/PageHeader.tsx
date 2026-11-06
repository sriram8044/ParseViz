import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description: string;
  badge?: string;
  icon?: LucideIcon;
  backTo?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  icon: Icon,
  backTo,
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/80">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {Icon && (
            <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-800/50 text-purple-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {title}
            {badge && (
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/60 font-sans">
                {badge}
              </span>
            )}
          </h1>
        </div>
        <p className="text-xs text-slate-400 pl-0 md:pl-1 max-w-2xl">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-2 self-start md:self-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900/90 border border-slate-800 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          ParseViz Engine v0.1
        </span>
      </div>
    </div>
  );
};
