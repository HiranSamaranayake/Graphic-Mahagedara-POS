import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { Layers, Calendar, Wallet, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import type { SalaryRecord, DailyPostCountRecord } from '../../types';

export const GraphicDesignerDashboardView: React.FC = () => {
  const { profile } = useAuth();

  const [todayPosts, setTodayPosts] = useState<number>(0);
  const [thisMonthPosts, setThisMonthPosts] = useState<number>(0);
  const [latestSalary, setLatestSalary] = useState<SalaryRecord | null>(null);
  const [recentPostRecords, setRecentPostRecords] = useState<DailyPostCountRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadPersonalData = async () => {
      if (!isSupabaseConfigured() || !profile) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const firstDayOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split('T')[0];

        // 1. Fetch own post counts
        const { data: postData } = await (supabase.from('daily_post_counts') as any)
          .select('*')
          .order('post_date', { ascending: false });

        if (postData && Array.isArray(postData)) {
          let tCount = 0;
          let mCount = 0;
          postData.forEach((p: any) => {
            if (p.post_date === todayStr) {
              tCount += Number(p.post_count || 0);
            }
            if (p.post_date >= firstDayOfMonthStr) {
              mCount += Number(p.post_count || 0);
            }
          });
          setTodayPosts(tCount);
          setThisMonthPosts(mCount);
          setRecentPostRecords(
            postData.slice(0, 5).map((p: any) => ({
              id: p.id,
              staffId: p.staff_id || '',
              postDate: p.post_date,
              postCount: Number(p.post_count || 0),
              notes: p.notes || '',
            }))
          );
        }

        // 2. Fetch own salary record (RLS blocks reading other staff members' salary)
        const { data: salData } = await (supabase.from('salary_payments') as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (salData && salData.length > 0) {
          const s = salData[0];
          setLatestSalary({
            id: s.id,
            staffId: s.staff_id,
            staffName: profile.fullName,
            month: s.salary_month,
            basicSalary: Number(s.basic_salary || 0),
            bonus: Number(s.bonus || 0),
            commission: Number(s.commission || 0),
            deductions: Number(s.deductions || 0),
            otherPayments: Number(s.other_payments || 0),
            finalSalary: Number(s.final_salary || 0),
            paymentStatus: s.payment_status || 'Pending',
            paymentDate: s.payment_date || s.created_at,
            notes: s.notes || undefined,
          });
        }
      } catch (err) {
        console.error('Error loading Graphic Designer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPersonalData();
  }, [profile]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>Graphic Designer Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wide">
              Welcome back, {profile?.fullName || 'Designer'}!
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 mt-1 font-medium max-w-xl">
              Track your daily artwork post output, review your post history, and check your salary payment details.
            </p>
          </div>
          <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
            <span className="block text-[11px] uppercase font-extrabold text-teal-200 tracking-wider">Assigned Role</span>
            <span className="text-sm font-black text-white">Graphic Designer</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Today's Post Count */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Today's Post Count
              </p>
              <h3 className="text-3xl font-black text-teal-600 mt-2">
                {loading ? '...' : todayPosts} <span className="text-sm font-bold text-slate-500">Posts</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            <span>Updated today ({new Date().toISOString().split('T')[0]})</span>
          </p>
        </div>

        {/* This Month's Post Count */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                This Month's Post Count
              </p>
              <h3 className="text-3xl font-black text-cyan-600 mt-2">
                {loading ? '...' : thisMonthPosts} <span className="text-sm font-bold text-slate-500">Posts</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
            <span>Cumulative monthly output</span>
          </p>
        </div>

        {/* Current / Latest Salary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Current / Latest Salary
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {loading ? '...' : latestSalary ? formatCurrency(latestSalary.finalSalary) : 'Rs. 0.00'}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-medium flex items-center justify-between">
            <span>Month: <strong>{latestSalary?.month || 'Current'}</strong></span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${latestSalary?.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {latestSalary?.paymentStatus || 'Pending'}
            </span>
          </p>
        </div>
      </div>

      {/* Grid: Recent Posts Log & Personal Salary Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Post Logs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              Recent Daily Post Logs
            </h3>
            <a href="/daily-post-count" className="text-xs font-bold text-teal-600 hover:text-teal-700">
              View All →
            </a>
          </div>

          {recentPostRecords.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              No post count logs recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPostRecords.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{formatDate(r.postDate)}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{r.notes || 'Daily design work'}</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-black text-xs">
                    {r.postCount} Posts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Personal Salary Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-teal-600" />
              My Personal Salary Details
            </h3>
            <span className="text-xs font-bold text-slate-500">Confidential</span>
          </div>

          {latestSalary ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Salary Period:</span>
                <span className="font-bold text-slate-900">{latestSalary.month}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Basic Salary:</span>
                <span className="font-bold text-slate-900">{formatCurrency(latestSalary.basicSalary)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Bonus / Performance:</span>
                <span className="font-bold text-teal-600">+{formatCurrency(latestSalary.bonus)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Deductions:</span>
                <span className="font-bold text-rose-600">-{formatCurrency(latestSalary.deductions)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-teal-50 rounded-xl border border-teal-200 mt-2">
                <span className="font-extrabold text-teal-900">Total Net Payout:</span>
                <span className="font-black text-teal-900 text-base">{formatCurrency(latestSalary.finalSalary)}</span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs font-medium">
              No salary disbursements found for your account.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
