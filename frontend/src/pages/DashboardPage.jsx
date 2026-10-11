import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  HelpCircle, 
  Flame, 
  Award, 
  Sparkles, 
  AlertTriangle, 
  Trophy, 
  Download, 
  ArrowRight, 
  TrendingUp, 
  Sliders, 
  ChevronRight,
  BookOpen,
  Calendar,
  Zap
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { leaderboardService } from '../services/leaderboardService';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import { DifficultyBadge } from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import DailyProgressCard from '../components/DailyProgressCard';
import WeeklyProgressChart from '../components/WeeklyProgressChart';
import { progressService } from '../services/progressService';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [leaderboardPreview, setLeaderboardPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [sumRes, actRes, leadRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getRecentActivity(),
          leaderboardService.getLeaderboard(),
        ]);

        if (sumRes.success) setSummary(sumRes.summary);
        if (actRes.success) setRecentActivity(actRes.activity || []);
        if (leadRes.success) setLeaderboardPreview((leadRes.leaderboard || []).slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Unable to load dashboard metrics. Please refresh or check connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('quizpilot_token');
      const response = await fetch('/api/results/export', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export request failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QuizPilot_Results_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleFocusedRevision = (topic, subject) => {
    navigate(`/generate?topic=${encodeURIComponent(topic)}&subject=${encodeURIComponent(subject || '')}`);
  };

  const handleUpdateGoal = async (goalType, goalTarget) => {
    try {
      const res = await progressService.updateGoal(goalType, goalTarget);
      if (res.success) {
        setSummary((prev) => ({
          ...prev,
          dailyProgress: {
            progress: res.progress,
            currentValue: res.currentValue,
            percentage: res.percentage,
            friendlyMessage: res.friendlyMessage,
          },
        }));

        // Refresh weekly chart
        const weeklyRes = await progressService.getWeeklyProgress();
        if (weeklyRes.success) {
          setSummary((prev) => ({
            ...prev,
            weeklyProgress: weeklyRes.weekly,
          }));
        }
      }
    } catch (err) {
      alert(`Failed to update daily goal: ${err.message}`);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Assembling your personalized revision analytics..." size="lg" />;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Action */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Board Examination Revision Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to test your concept mastery, {user?.name?.split(' ')[0] || 'Student'}?
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-2 leading-relaxed">
            Generate customized board exam quizzes with instant server evaluation, topic diagnostics, and adaptive revision loops.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/generate')}
            className="px-5 py-3 rounded-2xl bg-white text-indigo-950 font-bold text-sm shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            Generate New Quiz
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export Results CSV'}
          </button>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Overview Cards (Requirement 3: Total Quizzes, Questions Attempted, Average Accuracy, Current Daily Streak) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Quizzes"
          value={summary?.totalQuizzes || 0}
          subtitle="Completed sessions"
          icon={BookOpen}
          gradient="from-indigo-600 to-indigo-500"
          badgeText="Verified Attempts"
          badgeColor="bg-indigo-50 text-indigo-700"
        />
        <MetricCard
          title="Questions Attempted"
          value={summary?.questionsAttempted || 0}
          subtitle="Board syllabus problems"
          icon={CheckCircle2}
          gradient="from-violet-600 to-purple-500"
          badgeText="Practice Volume"
          badgeColor="bg-violet-50 text-violet-700"
        />
        <MetricCard
          title="Average Accuracy"
          value={`${summary?.averageAccuracy || 0}%`}
          subtitle="Overall performance"
          icon={Award}
          gradient="from-emerald-600 to-teal-500"
          badgeText={summary?.averageAccuracy >= 75 ? 'Distinction Pace' : summary?.averageAccuracy >= 50 ? 'Steady Progress' : 'Revision Required'}
          badgeColor={summary?.averageAccuracy >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}
        />
        <MetricCard
          title="Daily Streak"
          value={`${summary?.currentStreak || 0} Days`}
          subtitle={`Longest: ${summary?.longestStreak || 0} days`}
          icon={Flame}
          gradient="from-amber-500 to-orange-500"
          badgeText="Consecutive Revision"
          badgeColor="bg-amber-50 text-amber-700"
        />
      </div>

      {/* Daily Progress Tracker & 7-Day Activity Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyProgressCard
          progressData={summary?.dailyProgress}
          onUpdateGoal={handleUpdateGoal}
        />
        <WeeklyProgressChart
          weeklyData={summary?.weeklyProgress || []}
        />
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide on desktop): Weak Topics & Adaptive Difficulty & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section A: Weak Topics Summary */}
          <div className="bg-white rounded-3xl p-6 border border-indigo-50 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Weak Topics Summary</h2>
                  <p className="text-xs text-slate-500">Topics identified with sub-65% accuracy from completed attempts</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/weak-topics')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View All ({summary?.weakTopicsCount || 0})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {summary?.weakTopicsSummary && summary.weakTopicsSummary.length > 0 ? (
              <div className="space-y-3">
                {summary.weakTopicsSummary.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#fbfaff] border border-indigo-50 hover:border-indigo-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.topic}</span>
                        {item.subject && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {item.subject}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {item.questionsAttempted} questions attempted • {item.accuracy}% accuracy
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-20 sm:w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: `${item.accuracy}%` }}
                        />
                      </div>
                      <button
                        onClick={() => handleFocusedRevision(item.topic, item.subject)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        Revise Topic
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-2xl bg-indigo-50/40 border border-dashed border-indigo-100">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No Critical Weak Topics Detected</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {summary?.totalQuizzes === 0
                    ? 'Complete your first quiz to generate topic-level analytics.'
                    : 'Great consistency! Your recent attempts meet or exceed the target accuracy threshold.'}
                </p>
                <button
                  onClick={() => navigate('/generate')}
                  className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700"
                >
                  Attempt a Quiz
                </button>
              </div>
            )}
          </div>

          {/* Section B: Difficulty Adjustment */}
          <div className="bg-white rounded-3xl p-6 border border-indigo-50 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Adaptive Difficulty Engine</h2>
                <p className="text-xs text-slate-500">Real-time calibrated difficulty based on verified performance history</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-violet-50/50 border border-indigo-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Recommended Difficulty:</span>
                  <DifficultyBadge difficulty={summary?.recommendedDifficulty || 'Medium'} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {summary?.difficultyReason || 'Based on your recent attempts, Medium provides balanced syllabus retention.'}
                </p>
              </div>

              <button
                onClick={() => navigate(`/generate?difficulty=${summary?.recommendedDifficulty || 'Medium'}`)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
              >
                Generate at Recommended Level
              </button>
            </div>
          </div>

          {/* Section E: Recent Activity */}
          <div className="bg-white rounded-3xl p-6 border border-indigo-50 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Quiz Activity</h2>
                <p className="text-xs text-slate-500">Click any attempt to inspect question breakdowns and solutions</p>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View History
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentActivity.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentActivity.map((item) => (
                  <div
                    key={item.attemptId}
                    onClick={() => navigate(`/results/${item.attemptId}`)}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-indigo-50/40 -mx-3 px-3 rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                          {item.title}
                        </span>
                        <DifficultyBadge difficulty={item.difficulty} />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {item.subject} • {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="block text-xs font-extrabold text-slate-900">
                          {item.score} / {item.totalQuestions} ({item.accuracy}%)
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          +{item.pointsAwarded || 0} pts
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No quiz activity recorded yet. Start your first revision session!
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Daily Streak Counter & Leaderboard Preview */}
        <div className="space-y-6">

          {/* Section D: Daily Streak Counter */}
          <div className="bg-white rounded-3xl p-6 border border-indigo-50 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Daily Study Streak</h2>
                <p className="text-xs text-slate-500">Consecutive days with at least 1 completed quiz</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/60 text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200">
                <Flame className="w-8 h-8 fill-amber-300 animate-bounce" />
              </div>
              <h3 className="text-3xl font-black text-slate-900">
                {summary?.currentStreak || 0} <span className="text-sm font-semibold text-slate-600">Days</span>
              </h3>
              <p className="text-xs text-amber-800 font-medium">
                {summary?.currentStreak > 0
                  ? `Active streak! Longest streak on record is ${summary?.longestStreak || 1} days.`
                  : 'Complete a quiz today to start your daily study streak!'}
              </p>
            </div>
          </div>

          {/* Section C: Leaderboard Preview */}
          <div className="bg-white rounded-3xl p-6 border border-indigo-50 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Leaderboard</h2>
                  <p className="text-xs text-slate-500">Ranked by total revision points</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/leaderboard')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Full Board
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {leaderboardPreview.map((student, i) => {
                const isCurrentUser = student.isCurrentUser;
                return (
                  <div
                    key={student.userId || i}
                    className={`p-3 rounded-2xl flex items-center justify-between gap-3 text-xs border transition-colors ${
                      isCurrentUser
                        ? 'bg-indigo-50/80 border-indigo-200 font-bold text-indigo-900'
                        : 'bg-[#faf9ff] border-indigo-50/50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 text-center font-extrabold ${
                        student.rank === 1 ? 'text-amber-500' :
                        student.rank === 2 ? 'text-slate-400' :
                        student.rank === 3 ? 'text-amber-700' : 'text-slate-500'
                      }`}>
                        #{student.rank}
                      </span>
                      <div>
                        <p className="font-bold truncate max-w-[110px]">
                          {student.displayName} {isCurrentUser && '(You)'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-normal">
                          {student.quizzesCompleted} quizzes • {student.accuracy}% acc
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-extrabold text-indigo-700">
                      {student.points} <span className="text-[10px] font-semibold text-slate-500">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section F: Export Results Panel */}
          <div className="bg-white rounded-3xl p-6 border border-indigo-50 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-600" />
              Export Progress Data
            </h3>
            <p className="text-xs text-slate-500">
              Download your complete attempt history including date, subject, difficulty, score, and accuracy as a spreadsheet (CSV).
            </p>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="w-full py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {exporting ? 'Generating CSV...' : 'Download Results CSV'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
