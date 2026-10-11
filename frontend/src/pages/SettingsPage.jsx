import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Server, 
  Sparkles,
  Flame,
  Trophy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    const res = await updateProfile({
      name,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });
    setSaving(false);

    if (res.success) {
      setMessage('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5 text-indigo-600" />
          Account & Preferences
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal credentials, study profile, and review backend AI engine connectivity.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Profile & Password Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-indigo-50 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900">Student Profile Information</h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-sm font-medium cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Email address cannot be changed once registered.</span>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Change Password (Optional)</h3>
              
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter to confirm changes"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Right 1 Col: Platform Engine Diagnostics */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-indigo-50 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              Engine Architecture
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#faf9ff] border border-indigo-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">AI Generator</span>
                  <span className="text-[10px] text-slate-500">Google Gemini / Cloud API</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Active
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#faf9ff] border border-indigo-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Question Bank</span>
                  <span className="text-[10px] text-slate-500">Verified Board MCQs</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready (33+ Qs)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#faf9ff] border border-indigo-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Database</span>
                  <span className="text-[10px] text-slate-500">MongoDB Atlas / Mongoose</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Connected
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#faf9ff] border border-indigo-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Auth Security</span>
                  <span className="text-[10px] text-slate-500">JWT + Bcrypt Hashing</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  Secured
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Privacy Assurance:
            </h4>
            <p>
              Your personal results, test attempts, and weak topic diagnostics are strictly private to your authenticated account. Public leaderboards expose only sanitized display names and cumulative points.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
