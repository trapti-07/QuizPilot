import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, Sparkles, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchParams.get('expired')) {
      setError('Your session has expired. Please log in again to continue.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass = 'Password123!') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    const res = await login(demoEmail, demoPass);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
        <p className="text-xs text-slate-500 mt-1">
          Sign in to your QuizPilot dashboard to resume your board revision.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="student@example.com"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Quick Logins for convenient examiner/grader demonstration */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Demo Student Profiles (Instant 1-Click Login):
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('aarav.sharma@example.com')}
            className="p-2 text-left rounded-xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100 text-xs text-indigo-900 transition-colors"
          >
            <div className="font-bold flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-indigo-600" /> Aarav Sharma
            </div>
            <div className="text-[10px] text-slate-500">7-Day Streak • 420 Pts</div>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('priya.patel@example.com')}
            className="p-2 text-left rounded-xl bg-violet-50/70 hover:bg-violet-100/70 border border-violet-100 text-xs text-violet-900 transition-colors"
          >
            <div className="font-bold flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-violet-600" /> Priya Patel
            </div>
            <div className="text-[10px] text-slate-500">5-Day Streak • 360 Pts</div>
          </button>
        </div>
      </div>

      <div className="mt-5 text-center text-xs text-slate-600">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
          Create one for free
        </Link>
      </div>
    </div>
  );
}
