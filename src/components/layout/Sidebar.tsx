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
  UserCheck,
  X,
  LogOut,
  Layers,
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
  { label: 'Daily Post Count', path: '/daily-post-count', icon: <Layers className="w-5 h-5" /> },
  { label: 'Staff', path: '/staff', icon: <Users className="w-5 h-5" /> },
  { label: 'Staff Accounts', path: '/staff-accounts', icon: <UserCheck className="w-5 h-5" /> },
  { label: 'Salaries', path: '/salaries', icon: <Wallet className="w-5 h-5" /> },
  { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" /> },
  { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mobileMenuOpen, setMobileMenuOpen } = useApp();
  const { signOut, role, profile } = useAuth();

  const closeMobile = () => setMobileMenuOpen(false);

  const handleSignOut = async () => {
    closeMobile();
    await signOut();
    navigate('/login');
  };

  const category = profile?.staffCategory || 'Call Center Operator';

  const filteredNavItems = navItems.filter((item) => {
    if (role === 'Staff') {
      if (category === 'Graphic Designer') {
        return ['/dashboard', '/daily-post-count', '/salaries'].includes(item.path);
      }
      // Call Center Operator
      return ['/dashboard', '/daily-income', '/salaries'].includes(item.path);
    }
    return true;
  }).map((item) => {
    if (role === 'Staff' && item.path === '/salaries') {
      return { ...item, label: 'My Salary' };
    }
    return item;
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-800 shadow-sm">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/25 font-black text-xl border border-teal-300">
            GM
          </div>
          <div>
            <span className="block font-black text-sm tracking-wider uppercase text-slate-900 leading-tight">
              GRAPHIC
            </span>
            <span className="block font-extrabold text-xs tracking-widest text-teal-600 leading-tight">
              MAHAGEDARA
            </span>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={closeMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-500/25 border border-teal-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110 text-white' : 'text-slate-500 group-hover:text-teal-600'
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>

              {isActive && (
                <span className="absolute right-3 w-2 h-2 rounded-full bg-white shadow-sm animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer / System Badge */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2">
        {profile && (
          <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
            <div className="truncate pr-2">
              <span className="block text-xs font-bold text-slate-900 truncate">{profile.fullName}</span>
              <span className="block text-[10px] text-slate-500 truncate">{profile.email}</span>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                role === 'Admin'
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {role}
            </span>
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
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
