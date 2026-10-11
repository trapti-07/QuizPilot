import React, { useState } from 'react';
import { 
  Target, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  Settings2, 
  BookOpen, 
  HelpCircle, 
  Clock, 
  Award,
  Zap
} from 'lucide-react';
import SetGoalModal from './SetGoalModal';

export default function DailyProgressCard({
  progressData,
  onUpdateGoal,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const progress = progressData?.progress || {};
  const percentage = progressData?.percentage || 0;
  const currentValue = progressData?.currentValue || 0;
  const friendlyMessage = progressData?.friendlyMessage || 'Set your target to begin revision!';

  const goalType = progress.goalType || 'questions';
  const goalTarget = progress.goalTarget || 20;
  const isCompleted = !!progress.isGoalCompleted || percentage >= 100;

  const goalTypeLabels = {
    questions: 'Questions Attempted',
    quizzes: 'Quizzes Completed',
    study_minutes: 'Study Minutes',
  };

  const metricSuffix = {
    questions: 'Questions',
    quizzes: 'Quizzes',
    study_minutes: 'Mins',
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-indigo-50 shadow-xs space-y-6">
      
      {/* Top Header: Title, Metric Badge, Edit Goal Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-100">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Daily Revision Tracker
              {isCompleted && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Goal Achieved
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Target: <span className="font-semibold text-slate-700">{goalTarget} {metricSuffix[goalType]}</span> ({goalTypeLabels[goalType]})
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl border border-indigo-100 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Edit Study Goal
        </button>
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 flex items-center gap-1.5">
            <span className="text-sm font-extrabold text-indigo-600">{currentValue}</span>
            <span className="text-slate-400">/</span>
            <span>{goalTarget} {metricSuffix[goalType]}</span>
          </span>
          <span className={`text-sm font-black ${isCompleted ? 'text-emerald-600' : 'text-indigo-600'}`}>
            {percentage}%
          </span>
        </div>

        {/* Outer Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm'
                : 'bg-gradient-to-r from-indigo-600 to-violet-500 shadow-sm'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      {/* Encouraging Message / Celebration Alert */}
      <div className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-3 transition-colors ${
        isCompleted
          ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900'
          : 'bg-indigo-50/60 border border-indigo-100 text-indigo-900'
      }`}>
        {isCompleted ? (
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
        ) : (
          <Zap className="w-4 h-4 text-indigo-600 shrink-0" />
        )}
        <p className="leading-relaxed">{friendlyMessage}</p>
      </div>

      {/* 4 Detail Metric Pills: Quizzes, Questions, Correct Answers, Accuracy */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3.5 rounded-2xl bg-[#faf9ff] border border-indigo-50 text-center">
          <span className="block text-xl font-black text-slate-900">{progress.quizzesCompleted || 0}</span>
          <span className="text-[11px] font-semibold text-slate-500">Quizzes Done</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#faf9ff] border border-indigo-50 text-center">
          <span className="block text-xl font-black text-slate-900">{progress.questionsAttempted || 0}</span>
          <span className="text-[11px] font-semibold text-slate-500">Questions Solved</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#faf9ff] border border-indigo-50 text-center">
          <span className="block text-xl font-black text-emerald-600">{progress.correctAnswers || 0}</span>
          <span className="text-[11px] font-semibold text-slate-500">Correct Answers</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#faf9ff] border border-indigo-50 text-center">
          <span className="block text-xl font-black text-indigo-600">{progress.accuracy || 0}%</span>
          <span className="text-[11px] font-semibold text-slate-500">Today's Accuracy</span>
        </div>
      </div>

      {/* Modal */}
      <SetGoalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentGoalType={goalType}
        currentGoalTarget={goalTarget}
        onSave={onUpdateGoal}
      />
    </div>
  );
}
