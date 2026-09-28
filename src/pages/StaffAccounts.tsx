import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Shield, UserCheck, AlertCircle, CheckCircle2, Search, RefreshCw, KeyRound, Mail, User, Briefcase } from 'lucide-react';
import type { UserProfile } from '../context/AuthContext';
import type { StaffCategory } from '../types';

export const StaffAccounts: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form states
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [staffCategory, setStaffCategory] = useState<StaffCategory>('Call Center Operator');

  // Notification states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase.from('profiles') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
      } else if (data) {
        setProfiles(
          data.map((item: any) => ({
            id: item.id,
            fullName: item.full_name,
            email: item.email,
            role: item.role === 'admin' ? 'Admin' : 'Staff',
            staffCategory: (item.staff_category === 'Graphic Designer' ? 'Graphic Designer' : 'Call Center Operator') as StaffCategory,
            avatarUrl: item.avatar_url,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load user profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreateStaffAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Form Validation
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMsg('Please enter the staff member\'s full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Temporary password must be at least 6 characters long.');
      return;
    }

    setCreating(true);

    try {
      // Secure server-side user creation via Supabase Edge Function
      const { data, error: fnErr } = await supabase.functions.invoke('create-staff-account', {
        body: {
          fullName: cleanName,
          email: cleanEmail,
          temporaryPassword: password,
          staffCategory: staffCategory,
        },
      });

      if (fnErr) {
        throw new Error(fnErr.message || 'Failed to call Edge Function.');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSuccessMsg(`Staff login account successfully created for ${cleanName} (${cleanEmail}) as ${staffCategory}!`);
      setFullName('');
      setEmail('');
      setPassword('');
      setStaffCategory('Call Center Operator');
      await fetchProfiles();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create staff login account.');
    } finally {
      setCreating(false);
    }
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-wide flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-teal-600" />
            STAFF LOGIN ACCOUNTS
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Admin-only management to issue secure login credentials for Staff members
          </p>
        </div>
        <button
          onClick={fetchProfiles}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 text-teal-600 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Grid: Create Account Form + Existing Accounts List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Account Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              Create Staff Login Account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Calls secure server Edge Function. Created user receives role: <span className="font-extrabold text-teal-600">Staff</span>.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateStaffAccount} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                Staff Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kasun Perera"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-400/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-600" />
                Login Email
              </label>
              <input
                type="email"
                required
                placeholder="e.g. kasun@graphicmahagedara.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-400/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-teal-600" />
                Temporary Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-400/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                Staff Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={staffCategory}
                onChange={(e) => setStaffCategory(e.target.value as StaffCategory)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-400/40 transition-colors"
              >
                <option value="Call Center Operator">Call Center Operator</option>
                <option value="Graphic Designer">Graphic Designer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Assigned Role
              </label>
              <input
                type="text"
                disabled
                value="Staff (Enforced by Server)"
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-teal-700 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-black text-sm tracking-wide shadow-md shadow-teal-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {creating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Staff Account
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Existing User Login Accounts Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                Existing Authentication Profiles
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total accounts registered in system: {profiles.length}
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
              <span className="text-xs font-semibold">Loading accounts from Supabase...</span>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No user accounts found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-xs">
                            {p.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900">{p.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{p.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                            p.role === 'Admin'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {p.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {p.staffCategory || 'Call Center Operator'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
