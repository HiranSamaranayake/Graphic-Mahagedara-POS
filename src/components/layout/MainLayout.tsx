import React from 'react';
import { Sidebar, navItems } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../ui/Toast';
import { NavLink } from 'react-router-dom';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans selection:bg-purple-600">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-24 sm:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar for quick access */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-colors ${
                  isActive ? 'text-purple-400 font-bold bg-purple-950/40' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {item.icon}
              <span className="truncate max-w-[64px]">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
