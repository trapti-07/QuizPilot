import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Calendar, BarChart2, CheckCircle2 } from 'lucide-react';

export default function WeeklyProgressChart({ weeklyData = [] }) {
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-indigo-50 shadow-xs text-center py-10">
        <p className="text-xs text-slate-500">No weekly progress records yet.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-2xl shadow-xl border border-indigo-100 text-xs space-y-1 z-50">
          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center justify-between gap-3">
            <span>{data.day} ({data.date})</span>
            {data.isGoalCompleted && (
              <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Met
              </span>
            )}
          </p>
          <div className="text-slate-600 space-y-0.5 pt-1">
            <p><span className="font-semibold text-slate-800">Questions:</span> {data.questionsAttempted}</p>
            <p><span className="font-semibold text-slate-800">Quizzes:</span> {data.quizzesCompleted}</p>
            <p><span className="font-semibold text-slate-800">Study Time:</span> {data.studyMinutes} mins</p>
            <p><span className="font-semibold text-slate-800">Accuracy:</span> {data.accuracy}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalWeeklyQuestions = weeklyData.reduce((acc, d) => acc + (d.questionsAttempted || 0), 0);
  const totalWeeklyQuizzes = weeklyData.reduce((acc, d) => acc + (d.quizzesCompleted || 0), 0);
  const goalsMetDays = weeklyData.filter((d) => d.isGoalCompleted).length;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-indigo-50 shadow-xs space-y-5">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-xs">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">7-Day Study Activity</h3>
            <p className="text-xs text-slate-500">Practice questions volume across the last 7 days</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-slate-800">
            {totalWeeklyQuestions} <span className="font-normal text-slate-500">questions</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-bold text-emerald-600">
            {goalsMetDays}/7 <span className="font-normal text-slate-500">goals met</span>
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-52 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: '#f1f0fa' }}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="questionsAttempted"
              radius={[8, 8, 4, 4]}
              maxBarSize={40}
            >
              {weeklyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isGoalCompleted ? '#10b981' : entry.questionsAttempted > 0 ? '#6366f1' : '#e2e8f0'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center gap-6 pt-1 text-xs text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
          <span>Goal Achieved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-indigo-500 shrink-0" />
          <span>Practice Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-slate-200 shrink-0" />
          <span>Rest Day</span>
        </div>
      </div>

    </div>
  );
}
