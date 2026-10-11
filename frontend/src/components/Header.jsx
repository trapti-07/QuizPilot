import React, { useState, useRef, useEffect } from 'react';
import { Menu, Flame, Trophy, ChevronDown, User, LogOut, Settings, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-indigo-50/80 px-4 md:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Welcome */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              Welcome, <span className="text-indigo-600">{user?.name || 'Student'}</span> 👋
            </h2>
            <p className="text-xs text-slate-500 hidden sm:flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {todayFormatted}
            </p>
          </div>
        </div>

        {/* Right: Quick Stats & User Profile Menu */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Daily Streak Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-semibold shadow-xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-400 animate-pulse" />
            <span>{user?.currentStreak || 0}</span>
            <span className="hidden sm:inline text-amber-700/80">day streak</span>
          </div>

          {/* Points Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-800 text-xs font-semibold shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-indigo-600" />
            <span>{user?.points || 0}</span>
            <span className="hidden sm:inline text-indigo-700/80">pts</span>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-indigo-50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/history');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    My Quiz History
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
