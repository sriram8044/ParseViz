import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCode2,
  GitBranchPlus,
  Compass,
  TableProperties,
  PlayCircle,
  Network,
  Terminal,
  GraduationCap,
  Scale,
  Settings as SettingsIcon,
  Cpu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavSection {
  title: string;
  items: {
    name: string;
    path: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'PARSER DESIGN',
    items: [
      { name: 'Grammar Editor', path: '/grammar-editor', icon: FileCode2 },
      { name: 'Transformation Studio', path: '/transformations', icon: GitBranchPlus, badge: 'Phase 2' },
      { name: 'FIRST & FOLLOW', path: '/first-follow', icon: Compass },
      { name: 'LL(1) Parsing Table', path: '/ll1-table', icon: TableProperties },
    ],
  },
  {
    title: 'EXECUTION & VISUALIZATION',
    items: [
      { name: 'Parsing Simulator', path: '/simulator', icon: PlayCircle },
      { name: 'Parse Tree Visualizer', path: '/parse-tree', icon: Network },
      { name: 'Grammar Playground', path: '/playground', icon: Terminal },
    ],
  },
  {
    title: 'ACADEMIC & TOOLS',
    items: [
      { name: 'Learning Mode', path: '/learning-mode', icon: GraduationCap },
      { name: 'Comparison & Analysis', path: '/comparison', icon: Scale },
      { name: 'Settings', path: '/settings', icon: SettingsIcon },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-in-out border-r border-slate-800/80 bg-[#0B0F19]/95 backdrop-blur-md flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 shadow-lg shadow-purple-900/30 ring-1 ring-purple-400/20 shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-base tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                ParseViz
              </span>
              <span className="text-[10px] font-medium tracking-widest text-cyan-400 uppercase">
                Compiler Platform
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Link Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600/20 to-cyan-500/10 text-cyan-300 border border-purple-500/30 shadow-sm shadow-purple-950'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                      }`
                    }
                  >
                    <IconComponent className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/50">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-slate-200 text-xs rounded-md shadow-xl border border-slate-800 invisible opacity-0 -translate-x-1 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap">
                        {item.name}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-2 py-1.5`}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0 animate-pulse" />
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-slate-300">Phase 1 Architecture</span>
              <span className="text-[10px] text-slate-500">v0.1.0-alpha • Local</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

