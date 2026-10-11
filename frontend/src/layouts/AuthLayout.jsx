import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BookOpen, Sparkles, CheckCircle2, Trophy, Flame } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f8f7ff] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              QuizPilot
              <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                AI
              </span>
            </h1>
            <p className="text-xs font-medium text-slate-500">Smart Revision Assistant for Boards</p>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-indigo-100/60 rounded-3xl sm:px-10 border border-indigo-50">
          <Outlet />
        </div>

        {/* Feature highlight badges */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> AI-Generated MCQs
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Daily Streaks
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-violet-500" /> Board Analytics
          </span>
        </div>
      </div>
    </div>
  );
}
