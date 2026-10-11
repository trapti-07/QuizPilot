import React from 'react';
import { Bookmark, CheckCircle2 } from 'lucide-react';

export default function QuestionPalette({
  totalQuestions,
  currentIndex,
  answers,
  markedQuestions = [],
  onSelectQuestion,
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-indigo-50 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h4 className="text-sm font-bold text-slate-900">Question Palette</h4>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          {totalQuestions} Questions
        </span>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[idx] !== undefined && answers[idx] !== -1;
          const isMarked = markedQuestions.includes(idx);

          let btnClasses = 'relative h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer select-none ';

          if (isCurrent) {
            btnClasses += 'ring-2 ring-indigo-600 ring-offset-2 ';
          }

          if (isAnswered) {
            btnClasses += 'bg-emerald-600 text-white shadow-xs ';
          } else if (isMarked) {
            btnClasses += 'bg-amber-100 text-amber-800 border-2 border-amber-400 ';
          } else {
            btnClasses += 'bg-slate-100 text-slate-700 hover:bg-slate-200 ';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={btnClasses}
            >
              <span>{idx + 1}</span>
              {isMarked && (
                <Bookmark className="w-2.5 h-2.5 text-amber-600 fill-amber-500 absolute top-1 right-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Palette Legend */}
      <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-emerald-600 shrink-0" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-slate-100 border border-slate-300 shrink-0" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm bg-amber-100 border border-amber-400 shrink-0" />
          <span>Marked for Review</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-sm border-2 border-indigo-600 shrink-0" />
          <span>Current Question</span>
        </div>
      </div>
    </div>
  );
}
