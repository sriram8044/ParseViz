import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModuleCardProps {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  tag?: string;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  path,
  icon: Icon,
  badge,
  tag,
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      className="group relative p-6 rounded-2xl bg-gradient-to-b from-[#111827] to-[#0d1320] border border-slate-800 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/20 cursor-pointer transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
            <Icon className="w-5 h-5" />
          </div>
          {badge && (
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/50">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-500">
          {tag || 'Module Ready'}
        </span>
        <div className="flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200">
          <span>Launch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
