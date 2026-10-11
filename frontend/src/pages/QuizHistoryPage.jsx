import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  Filter, 
  BookOpen, 
  Calendar,
  ChevronRight
} from 'lucide-react';
import { quizService } from '../services/quizService';
import { DifficultyBadge } from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_BASE_URL } from '../services/api';

export default function QuizHistoryPage() {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await quizService.getQuizHistory();
        if (res.success) {
          setAttempts(res.attempts || []);
        }
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('quizpilot_token');
      const response = await fetch(`${API_BASE_URL}/results/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  if (loading) {
    return <LoadingSpinner message="Retrieving your private quiz history..." size="lg" />;
  }

  const subjects = ['All', ...new Set(attempts.map((a) => a.subject).filter(Boolean))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard', 'Adaptive'];

  const filteredAttempts = attempts.filter((a) => {
    if (subjectFilter !== 'All' && a.subject !== subjectFilter) return false;
    if (difficultyFilter !== 'All' && a.difficulty !== difficultyFilter) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5 text-indigo-600" />
            Personalized Attempt Archive
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Revision Results & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review detailed solutions, scores, and accuracy trends for all your completed sessions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exporting || attempts.length === 0}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export Results CSV'}
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl p-4 border border-indigo-50 shadow-xs flex flex-wrap items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filters:</span>
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Subject:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Difficulty:</span>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 cursor-pointer"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <span className="ml-auto text-slate-400 font-normal">
          Showing {filteredAttempts.length} of {attempts.length} attempts
        </span>
      </div>

      {/* Attempts List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-50 shadow-xs space-y-4">
        {filteredAttempts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredAttempts.map((attempt) => (
              <div
                key={attempt._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 -mx-3 px-3 rounded-2xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {attempt.subject}: {attempt.unit}
                    </h3>
                    <DifficultyBadge difficulty={attempt.difficulty} />
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(attempt.completedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <span className="block text-sm font-extrabold text-slate-900">
                      {attempt.score} / {attempt.totalQuestions} ({attempt.accuracy}%)
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      +{attempt.pointsAwarded || 0} pts
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/results/${attempt._id}`)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      View Report
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/quiz/${attempt.quizId}`)}
                      title="Retake Quiz"
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p>No matching quiz attempts found for current filter.</p>
            <button
              onClick={() => navigate('/generate')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
            >
              Generate a Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
