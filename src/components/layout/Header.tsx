import React, { useState } from 'react';
import { Menu, Bell, Sun, Moon, CheckCircle, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { setMobileMenuOpen, theme, toggleTheme } = useApp();
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Admin User';

  const mockNotifications = [
    {
      id: '1',
      title: 'Database Synchronized',
      time: 'Just now',
      desc: 'Connected to Supabase PostgreSQL.',
    },
    {
      id: '2',
      title: 'Real-time Calculations',
      time: '1h ago',
      desc: 'All metrics dynamically calculated.',
    },
  ];

  return (
    <header className="sticky top-0 z-20 w-full glass-header px-4 sm:px-6 py-3 flex items-center justify-between transition-all shadow-xs">
      {/* Left: Mobile Menu & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="lg:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-black text-xs">
            GM
          </div>
          <div>
            <h2 className="font-black text-sm sm:text-base text-slate-900 tracking-tight leading-tight">
              GRAPHIC MAHAGEDARA
            </h2>
            <p className="text-[11px] text-teal-600 font-bold hidden sm:block">
              Business Management System
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Notifications, Theme, User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Icon */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-teal-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Notifications (2)
                </h4>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-teal-600 hover:underline font-bold"
                >
                  Mark as read
                </button>
              </div>
              <div className="space-y-3">
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors flex items-start gap-2.5 border border-slate-100"
                  >
                    <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900">{n.title}</p>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile Info & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left cursor-pointer"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-400 to-cyan-500 p-0.5 shadow-sm shadow-teal-500/20">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-teal-600 font-black text-xs uppercase">
                  {displayName.charAt(0)}
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>

            <div className="hidden sm:block text-left">
              <h4 className="text-xs font-extrabold text-slate-900 tracking-wide truncate max-w-[120px]">
                {displayName}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-teal-600 font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>Role: {role}</span>
              </div>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@graphicmahagedara.lk'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200 rounded-md">
                  Role: {role}
                </span>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-teal-600" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
