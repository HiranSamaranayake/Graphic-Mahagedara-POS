import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { Mail, Lock, LogIn, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { addToast } = useApp();

  const [email, setEmail] = useState('admin@graphicmahagedara.lk');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        setErrorMsg(error);
        addToast({
          type: 'error',
          title: 'Authentication Failed',
          message: error,
        });
      } else {
        addToast({
          type: 'success',
          title: 'Login Successful',
          message: 'Welcome to Graphic Mahagedara Management System.',
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 relative overflow-hidden selection:bg-amber-400 selection:text-zinc-950">
      {/* Background ambient glowing radial blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-zinc-950 relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 font-black text-2xl shadow-xl shadow-amber-500/20 border border-amber-300 mb-2">
            GM
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase">
            GRAPHIC MAHAGEDARA
          </h1>
          <p className="text-xs text-amber-400 font-extrabold tracking-wide">
            Business Management System
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-400 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@graphicmahagedara.lk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4 text-amber-400" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-amber-400" />}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-amber-400 focus:ring-amber-400/50"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => alert('Password reset link will be dispatched to your registered email.')}
              className="text-amber-400 hover:text-yellow-300 font-bold cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            icon={<LogIn className="w-5 h-5" />}
          >
            Sign In to System
          </Button>
        </form>

        {/* Configuration status indicator */}
        <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl flex items-center justify-center gap-2 text-xs text-amber-300 font-bold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {isSupabaseConfigured()
              ? 'Connected to Supabase PostgreSQL'
              : 'Supabase Configuration Pending'}
          </span>
        </div>

        <div className="text-center text-[11px] text-zinc-400 pt-2 flex items-center justify-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>Graphic Mahagedara Management System</span>
        </div>
      </div>
    </div>
  );
};
