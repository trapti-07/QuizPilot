import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';

export function DifficultyBadge({ difficulty }) {
  const styles = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard: 'bg-rose-50 text-rose-700 border-rose-200',
    Adaptive: 'bg-violet-50 text-violet-700 border-violet-200',
  };

  const currentStyle = styles[difficulty] || styles.Medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle}`}>
      {difficulty}
    </span>
  );
}

export function SourceBadge({ source = 'question_bank', isAIGenerated }) {
  const isAI = isAIGenerated || source === 'ai';

  if (isAI) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-50 to-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
        <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-300" />
        AI Generated
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
      <BookOpen className="w-3 h-3 text-slate-500" />
      Verified Question Bank
    </span>
  );
}
