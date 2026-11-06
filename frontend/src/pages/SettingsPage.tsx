import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { apiService } from '../services/api';
import type { HealthStatus } from '../types';
import { Settings as SettingsIcon, Database, Server, RefreshCw, CheckCircle, Monitor } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [endpoint, setEndpoint] = useState<string>('http://127.0.0.1:8000/api');

  const checkConnection = async () => {
    setLoading(true);
    try {
      const data = await apiService.checkHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Environment Configuration"
        description="Configure backend API endpoints, database connections, visualization defaults, and compiler engine parameters."
        icon={SettingsIcon}
        badge="System Configuration"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Backend Connection Settings */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              <span>Backend API Server</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">
                  FastAPI Base URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    className="flex-1 bg-[#0B0F19] border border-slate-800 rounded-xl px-4 py-2 font-mono text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={checkConnection}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Test Connection</span>
                  </button>
                </div>
              </div>

              {health && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Successfully connected to ParseViz Engine</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-2 border-t border-slate-900">
                    <div>Status: <span className="text-emerald-400">{health.status}</span></div>
                    <div>Version: <span className="text-cyan-400">{health.version}</span></div>
                    <div>Compiler: <span className="text-purple-400">{health.details?.compiler_engine}</span></div>
                    <div>SQLite DB: <span className="text-cyan-400">{health.details?.sqlite_db}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Database Configuration */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Storage Configuration</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span>Database Engine</span>
                <span className="font-mono text-white">SQLite 3 (Local Embedded)</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span>Database Path</span>
                <span className="font-mono text-slate-300">backend/parseviz.db</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span>Local Storage Cache</span>
                <span className="font-mono text-emerald-400">Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Specs */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-purple-400" />
              <span>Environment Overview</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Operating System</span>
                <span className="font-mono text-slate-200">Windows 11</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Python Runtime</span>
                <span className="font-mono text-slate-200">Python 3.11.9</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Node Runtime</span>
                <span className="font-mono text-slate-200">v22.21.0</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Frontend Stack</span>
                <span className="font-mono text-cyan-400">Vite 8 + React 19 + TS</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Styling System</span>
                <span className="font-mono text-cyan-400">Tailwind CSS v4</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Backend Framework</span>
                <span className="font-mono text-purple-400">FastAPI + Uvicorn</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
