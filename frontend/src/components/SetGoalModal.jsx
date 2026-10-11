import React, { useState } from 'react';
import { Target, X, Check, HelpCircle, BookOpen, Clock, CheckCircle2 } from 'lucide-react';

export default function SetGoalModal({
  isOpen,
  onClose,
  currentGoalType = 'questions',
  currentGoalTarget = 20,
  onSave,
}) {
  const [goalType, setGoalType] = useState(currentGoalType);
  const [target, setTarget] = useState(currentGoalTarget);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const presets = {
    questions: [10, 15, 20, 30, 50],
    quizzes: [2, 3, 5, 8],
    study_minutes: [10, 15, 20, 30, 45, 60],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (target <= 0) return;
    setSaving(true);
    await onSave(goalType, target);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-indigo-50 transform scale-100 transition-all space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Set Daily Revision Goal</h3>
              <p className="text-xs text-slate-500">Choose your daily study target</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Goal Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Goal Metric
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'questions', label: 'Questions', icon: HelpCircle, desc: 'Total problems' },
                { id: 'quizzes', label: 'Quizzes', icon: BookOpen, desc: 'Completed tests' },
                { id: 'study_minutes', label: 'Minutes', icon: Clock, desc: 'Active revision' },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = goalType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setGoalType(opt.id);
                      setTarget(presets[opt.id][1] || 15);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/20 font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1 text-indigo-600" />
                    <span className="block text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 block">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Target presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Quick Target Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {(presets[goalType] || []).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTarget(val)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    target === val
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {val} {goalType === 'study_minutes' ? 'mins' : goalType === 'quizzes' ? 'quizzes' : 'questions'}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Custom Number Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Value
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value, 10) || 1)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {goalType === 'questions' && 'Target number of board practice questions to solve today.'}
              {goalType === 'quizzes' && 'Target number of complete revision quizzes to finish today.'}
              {goalType === 'study_minutes' && 'Target number of active revision minutes to log today.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || target <= 0}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Daily Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
