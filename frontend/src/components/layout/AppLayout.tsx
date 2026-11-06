import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Navbar collapsed={collapsed} />

        {/* Content Container */}
        <main className="flex-1 mt-16 p-6 lg:p-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

