import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Award, 
  Download, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  BarChart3,
  Flame,
  HelpCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_BASE_URL } from '../services/api';

export default function ImprovementReportPage() {
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'improved' | 'weak' | 'mastered'

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const res = await analyticsService.getImprovementReport();
        if (res.success && res.report) {
          setReport(res.report);
        }
      } catch (err) {
        console.error('Failed to load improvement report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('quizpilot_token');
      const response = await fetch(`${API_BASE_URL}/results/export-improvement`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QuizPilot_Learning_Improvement_${new Date().toISOString().slice(0, 10)}.csv`;
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

  if (loading) {
    return <LoadingSpinner message="Auditing comparative attempt trajectories..." size="lg" />;
  }

  if (!report || !report.hasData || report.totalAttempts < 2) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center bg-white rounded-3xl p-8 border border-indigo-50 shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Comparative Data Calibration Required</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          {report?.totalAttempts === 0
            ? 'No quiz attempts recorded yet. Attempt quizzes to start tracking your learning improvement over time.'
            : 'You have completed 1 quiz attempt so far. Complete at least 2 quizzes across your syllabus concepts to unlock comparative growth analytics and accuracy trajectory charts.'}
        </p>
        <button
          onClick={() => navigate('/generate')}
          className="mt-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all cursor-pointer"
        >
          Generate a Follow-up Quiz
        </button>
      </div>
    );
  }

  const metrics = report.metrics;
  const trajectories = report.topicTrajectories || [];

  // Prepare chart data comparing Initial vs Latest Accuracy
  const chartData = trajectories.slice(0, 8).map(t => ({
    name: t.topic.length > 16 ? `${t.topic.slice(0, 15)}…` : t.topic,
    fullTopic: t.topic,
    initial: t.initialAccuracy,
    latest: t.latestAccuracy,
    delta: t.delta,
  }));

  const filteredList = trajectories.filter(t => {
    if (activeTab === 'improved') return t.masteryStatus === 'Improving';
    if (activeTab === 'weak') return t.masteryStatus === 'Weak';
    if (activeTab === 'mastered') return t.masteryStatus === 'Strong';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            Empirical Mastery Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Learning Improvement Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Empirical before-and-after comparison of your concept accuracy across {report.totalAttempts} completed sessions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export Improvement CSV'}
        </button>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Accuracy Delta"
          value={`${metrics.overallDelta > 0 ? '+' : ''}${metrics.overallDelta}%`}
          subtitle={`From ${metrics.initialAccuracy}% to ${metrics.latestAccuracy}%`}
          icon={TrendingUp}
          gradient={metrics.overallDelta >= 0 ? 'from-emerald-600 to-teal-500' : 'from-rose-600 to-pink-500'}
          badgeText={metrics.overallDelta >= 10 ? 'Accelerated Growth' : metrics.overallDelta >= 0 ? 'Steady Retention' : 'Remediation Advised'}
          badgeColor={metrics.overallDelta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}
        />
        <MetricCard
          title="Concepts Mastered"
          value={metrics.masteredCount}
          subtitle="Sustained ≥ 80% accuracy"
          icon={Award}
          gradient="from-indigo-600 to-violet-600"
          badgeText="Exam Ready"
          badgeColor="bg-indigo-50 text-indigo-700"
        />
        <MetricCard
          title="Concepts Improving"
          value={metrics.improvingCount}
          subtitle="Positive score trajectory"
          icon={CheckCircle2}
          gradient="from-amber-500 to-orange-500"
          badgeText="Active Growth"
          badgeColor="bg-amber-50 text-amber-700"
        />
        <MetricCard
          title="Priority Weak Areas"
          value={metrics.weakCount}
          subtitle="Sub-60% accuracy threshold"
          icon={AlertTriangle}
          gradient="from-rose-500 to-red-600"
          badgeText="Target for Practice"
          badgeColor="bg-rose-50 text-rose-700"
        />
      </div>

      {/* Personalized AI Learning Summary & Strategic Guidance */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <Sparkles className="w-4 h-4 fill-amber-300" />
          <span>Personalized Diagnostic Growth Synthesis</span>
        </div>
        <p className="text-sm font-medium text-indigo-100 leading-relaxed">
          {report.summaryNarrative}
        </p>

        {report.nextSteps && report.nextSteps.length > 0 && (
          <div className="pt-3 border-t border-white/10 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Recommended Next Steps:</h4>
            <ul className="space-y-1.5 text-xs text-indigo-200">
              {report.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Comparative Trajectory Chart (Initial vs Latest Accuracy) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-50 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Before & After Accuracy Comparison</h3>
            <p className="text-xs text-slate-500">Visualizing retention gains from earlier to latest attempts</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-3 h-3 rounded-sm bg-indigo-200" /> Initial Attempt
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-sm bg-emerald-600" /> Latest Attempt
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#f1f0fa' }} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} unit="%" domain={[0, 100]} />
              <Tooltip
                formatter={(val, name) => [`${val}%`, name === 'initial' ? 'Initial Accuracy' : 'Latest Accuracy']}
                labelFormatter={(label, items) => items?.[0]?.payload?.fullTopic || label}
              />
              <Bar dataKey="initial" fill="#c7d2fe" radius={[6, 6, 0, 0]} maxBarSize={30} />
              <Bar dataKey="latest" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Concept Breakdown Table with Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-50 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Topic-by-Topic Learning Trajectory</h3>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({trajectories.length})
            </button>
            <button
              onClick={() => setActiveTab('improved')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'improved' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Improving ({metrics.improvingCount})
            </button>
            <button
              onClick={() => setActiveTab('weak')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'weak' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Weak Areas ({metrics.weakCount})
            </button>
            <button
              onClick={() => setActiveTab('mastered')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'mastered' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Mastered ({metrics.masteredCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Topic / Concept</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Initial</th>
                <th className="py-3 px-4">Latest</th>
                <th className="py-3 px-4">Net Change</th>
                <th className="py-3 px-4">Mastery Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredList.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{t.topic}</td>
                  <td className="py-3.5 px-4">{t.subject}</td>
                  <td className="py-3.5 px-4">{t.totalAttempts} Qs</td>
                  <td className="py-3.5 px-4 text-slate-500">{t.initialAccuracy}%</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{t.latestAccuracy}%</td>
                  <td className="py-3.5 px-4 font-bold">
                    <span className={t.delta > 0 ? 'text-emerald-600' : t.delta < 0 ? 'text-rose-600' : 'text-slate-400'}>
                      {t.delta > 0 ? `+${t.delta}%` : t.delta < 0 ? `${t.delta}%` : '0%'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.masteryStatus === 'Strong'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : t.masteryStatus === 'Improving'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : t.masteryStatus === 'Weak'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.masteryStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/generate?subject=${encodeURIComponent(t.subject)}&topic=${encodeURIComponent(t.topic)}`)}
                      className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Practice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
