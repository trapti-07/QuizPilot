import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Submit Quiz?',
  message,
  answeredCount,
  unansweredCount,
  totalCount,
  onConfirm,
  onCancel,
  confirmText = 'Yes, Submit Quiz',
  cancelText = 'Review Answers',
  isSubmitting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-indigo-50 transform scale-100 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            {unansweredCount > 0 ? (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            ) : (
              <HelpCircle className="w-6 h-6 text-indigo-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">Board Exam Practice Session</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-5">
          {message || 'Are you sure you want to finish and submit this quiz? Once submitted, your score and analytics will be recorded.'}
        </p>

        {/* Question status pills */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
            <span className="block text-xl font-extrabold text-emerald-700">{answeredCount}</span>
            <span className="text-xs font-semibold text-emerald-800">Answered</span>
          </div>
          <div className={`p-3 rounded-2xl border text-center ${
            unansweredCount > 0 ? 'bg-amber-50/70 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-100 text-slate-600'
          }`}>
            <span className={`block text-xl font-extrabold ${unansweredCount > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
              {unansweredCount}
            </span>
            <span className="text-xs font-semibold">Unanswered</span>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>You have {unansweredCount} unattempted question{unansweredCount > 1 ? 's' : ''}. Unanswered questions receive 0 points.</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
          >
            {isSubmitting ? 'Evaluating...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
