import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import type { HealthStatus } from '../../types';
import {
  Activity,
  RefreshCw,
  Bell,
  Code2,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  collapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ collapsed }) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.checkHealth();
      setHealth(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Connection failed');
      }
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // 30s auto check
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 transition-all duration-300 ease-in-out border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md flex items-center justify-between px-6 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left breadcrumb / context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Code2 className="w-4 h-4 text-purple-400" />
          <span>Workspace</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200">Interactive Compiler Suite</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-950/70 text-cyan-400 border border-cyan-800/60">
          Phase 1 Active
        </span>
      </div>

      {/* Right control panel & Health status */}
      <div className="flex items-center gap-3">
        {/* Backend Connectivity Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="relative flex items-center justify-center">
            {health?.status === 'healthy' ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            ) : error ? (
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
              Backend API:
              {health ? (
                <span className="text-emerald-400 font-mono">ONLINE</span>
              ) : error ? (
                <span className="text-rose-400 font-mono">OFFLINE</span>
              ) : (
                <span className="text-amber-400 font-mono">CONNECTING</span>
              )}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">
              {health ? `v${health.version} • :8000/api/health` : '127.0.0.1:8000'}
            </span>
          </div>

          <button
            onClick={fetchHealth}
            disabled={loading}
            title="Refresh backend status"
            className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Action icons */}
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noreferrer"
          title="Open FastAPI Swagger Documentation"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <span>API Docs</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>

        <button 
          title="Compiler Engine Settings"
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <button
          title="Notifications"
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900" />
        </button>
      </div>
    </header>
  );
};
