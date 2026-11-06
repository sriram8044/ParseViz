import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'success' | 'info' | 'purple' | 'neutral';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'neutral',
}) => {
  const badgeStyles = {
    success: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    info: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60',
    purple: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    neutral: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
  };

  return (
    <div className="p-5 rounded-2xl bg-[#111827]/80 backdrop-blur-sm border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 shadow-lg shadow-black/20 group">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">
          {value}
        </span>
        {badge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badgeStyles[badgeType]}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};
