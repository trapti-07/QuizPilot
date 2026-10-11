import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  History, 
  Flame, 
  Trophy, 
  Settings, 
  LogOut, 
  BookOpen, 
  AlertTriangle,
  CalendarCheck,
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Generate Quiz', path: '/generate', icon: Sparkles },
    { name: 'Weak Topics', path: '/weak-topics', icon: AlertTriangle },
    { name: 'Revision Planner', path: '/planner', icon: CalendarCheck },
    { name: 'Improvement Report', path: '/improvement', icon: TrendingUp },
    { name: 'My Results', path: '/history', icon: History },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-indigo-50 shadow-sm select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-indigo-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              QuizPilot
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-500">Smart Revision Assistant</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 font-semibold'
                    : 'text-slate-600 hover:bg-indigo-50/70 hover:text-indigo-700'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User miniature footer */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-[#f8f7ff] to-indigo-50/50 border border-indigo-100/80">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'Student'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs mb-3">
          <div className="p-1.5 rounded-lg bg-white/80 border border-indigo-50">
            <span className="text-amber-500 font-semibold flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              {user?.currentStreak || 0}d
            </span>
            <span className="text-[10px] text-slate-500">Streak</span>
          </div>
          <div className="p-1.5 rounded-lg bg-white/80 border border-indigo-50">
            <span className="text-indigo-600 font-semibold flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3" />
              {user?.points || 0}
            </span>
            <span className="text-[10px] text-slate-500">Points</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity" 
        />
      )}

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </div>
    </>
  );
}
