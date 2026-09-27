import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  DollarSign,
  CreditCard,
  Users,
  Wallet,
  BarChart3,
  FileText,
  Settings,
  X,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Daily Income', path: '/daily-income', icon: <DollarSign className="w-5 h-5" /> },
  { label: 'Expenses', path: '/expenses', icon: <CreditCard className="w-5 h-5" /> },
  { label: 'Staff', path: '/staff', icon: <Users className="w-5 h-5" /> },
  { label: 'Salaries', path: '/salaries', icon: <Wallet className="w-5 h-5" /> },
  { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" /> },
  { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mobileMenuOpen, setMobileMenuOpen } = useApp();
  const { signOut } = useAuth();

  const closeMobile = () => setMobileMenuOpen(false);

  const handleSignOut = async () => {
    closeMobile();
    await signOut();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/80 text-zinc-100">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/25 font-black text-xl border border-amber-300">
            GM
          </div>
          <div>
            <span className="block font-black text-sm tracking-wider uppercase text-white leading-tight">
              GRAPHIC
            </span>
            <span className="block font-extrabold text-xs tracking-widest text-amber-400 leading-tight">
              MAHAGEDARA
            </span>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={closeMobile}
          className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 shadow-lg shadow-amber-500/20 border border-amber-300'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <span
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110 text-zinc-950' : 'text-zinc-400 group-hover:text-amber-400'
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>

              {isActive && (
                <span className="absolute right-3 w-2 h-2 rounded-full bg-zinc-950 shadow-sm animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer / System Badge */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950">
        <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-amber-300">Supabase Connected</span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
        >
          <span>Sign Out</span>
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeMobile}
          />
          <aside className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
