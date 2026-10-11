import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarCheck, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ArrowRight, 
  Target, 
  Clock, 
  BookOpen, 
  AlertTriangle,
  RotateCcw,
  Zap,
  Calendar,
  CheckCheck
} from 'lucide-react';
import { plannerService } from '../services/plannerService';
import { progressService } from '../services/progressService';
import DailyProgressCard from '../components/DailyProgressCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RevisionPlannerPage() {
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    async function loadPlannerData() {
      try {
        setLoading(true);
        const [planRes, weekRes, progRes] = await Promise.all([
          plannerService.getTodayPlan(),
          plannerService.getWeeklySummary(),
          progressService.getTodayProgress(),
        ]);

        if (planRes.success) setPlan(planRes.plan);
        if (weekRes.success) setWeeklySummary(weekRes.summary || []);
        if (progRes.success) setProgressData(progRes);
      } catch (err) {
        console.error('Failed to load revision planner:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlannerData();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      setUpdatingTaskId(taskId);
      const res = await plannerService.toggleTask(taskId);
      if (res.success && res.plan) {
        setPlan(res.plan);
        // Refresh weekly summary
        const weekRes = await plannerService.getWeeklySummary();
        if (weekRes.success) setWeeklySummary(weekRes.summary || []);
      }
    } catch (err) {
      alert(`Could not update task: ${err.message}`);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleUpdateGoal = async (goalType, goalTarget) => {
    try {
      const res = await progressService.updateGoal(goalType, goalTarget);
      if (res.success) {
        setProgressData(res);
      }
    } catch (err) {
      alert(`Could not update goal: ${err.message}`);
    }
  };

  const handleStartTaskQuiz = (task) => {
    navigate(`/generate?subject=${encodeURIComponent(task.subject)}&topic=${encodeURIComponent(task.topic)}&unit=${encodeURIComponent(task.unit || '')}`);
  };

  if (loading) {
    return <LoadingSpinner message="Synthesizing your personalized daily revision agenda..." size="lg" />;
  }

  const tasks = plan?.tasks || [];
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const allTasksDone = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
          Intelligent Daily Agenda
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Revision Planner
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Dynamic study roadmap tailored to your specific weak topics, recent mistake patterns, and syllabus targets.
        </p>
      </div>

      {/* Daily Progress Tracker Integration */}
      <DailyProgressCard
        progressData={progressData}
        onUpdateGoal={handleUpdateGoal}
      />

      {/* AI Coach Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <Sparkles className="w-4 h-4 fill-amber-300" />
          <span>AI Study Coach Daily Strategy:</span>
        </div>
        <p className="text-sm font-medium text-indigo-100 leading-relaxed">
          "{plan?.summaryMessage || 'Consistent targeted revision on your highest-urgency topics creates compounding exam mastery.'}"
        </p>
      </div>

      {/* Today's Tasks Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-50 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              Today's Recommended Revision Actions
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {completedCount} of {totalCount} Completed
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Check off completed activities to maintain your daily mastery trajectory
            </p>
          </div>

          {allTasksDone && (
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              All Daily Tasks Completed!
            </div>
          )}
        </div>

        {/* Task Cards List */}
        <div className="space-y-4">
          {tasks.map((task) => {
            const isCompleted = task.completed;
            const isUpdating = updatingTaskId === task._id;

            return (
              <div
                key={task._id}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-emerald-50/20 border-emerald-200 opacity-80'
                    : 'bg-[#faf9ff] border-indigo-100/70 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start gap-3.5 max-w-2xl">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task._id)}
                    disabled={isUpdating}
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 hover:text-indigo-500" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {task.topic}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {task.subject}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : task.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.priority} Priority
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      <span className="font-bold text-slate-800">Action: </span>
                      {task.action}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-500">Why: </span>
                      {task.reason}
                    </p>
                  </div>
                </div>

                {/* Practice Button */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleStartTaskQuiz(task)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Practice Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Planner Consistency Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-50 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">7-Day Revision Agenda History</h3>
            <p className="text-xs text-slate-500">Historical task completion preserved across study dates</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Past 7 Days</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5 pt-2">
          {weeklySummary.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                item.allCompleted
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : item.completedTasks > 0
                  ? 'bg-indigo-50/60 border-indigo-200'
                  : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}
            >
              <span className="block text-xs font-bold text-slate-700">{item.day}</span>
              <span className={`block text-lg font-black ${
                item.allCompleted ? 'text-emerald-700' : item.completedTasks > 0 ? 'text-indigo-700' : 'text-slate-400'
              }`}>
                {item.completedTasks}/{item.totalTasks}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 block">
                {item.allCompleted ? 'Complete' : item.completedTasks > 0 ? 'Partial' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
