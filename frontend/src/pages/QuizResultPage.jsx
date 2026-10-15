import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Trophy, 
  Flame, 
  RotateCcw, 
  Sparkles, 
  Download, 
  ArrowLeft,
  AlertTriangle,
  BookOpen,
  Filter
} from 'lucide-react';
import { quizService } from '../services/quizService';
import { DifficultyBadge, SourceBadge } from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_BASE_URL } from '../services/api';

export default function QuizResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'incorrect' | 'correct'
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadAttempt() {
      try {
        setLoading(true);
        const res = await quizService.getAttemptById(attemptId);
        if (res.success && res.attempt) {
          setAttempt(res.attempt);
        } else {
          alert('Could not retrieve attempt results.');
        }
      } catch (err) {
        console.error('Result load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttempt();
  }, [attemptId]);

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

  const handleRetakeQuiz = () => {
    if (attempt?.quizId) {
      navigate(`/quiz/${attempt.quizId}`);
    }
  };

  const handleGenerateSimilar = () => {
    if (attempt) {
      navigate(`/generate?subject=${encodeURIComponent(attempt.subject)}&unit=${encodeURIComponent(attempt.unit)}&difficulty=${encodeURIComponent(attempt.difficulty)}`);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating syllabus scoring and diagnostic breakdown..." size="lg" />;
  }

  if (!attempt) {
    return (
      <div className="py-12 text-center bg-white rounded-3xl p-8 border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Attempt Record Not Found</h3>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder}s`;
  };

  const filteredAnswers = (attempt.answers || []).filter((ans) => {
    if (filterMode === 'incorrect') return !ans.isCorrect;
    if (filterMode === 'correct') return ans.isCorrect;
    return true;
  });

  const optLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Top Banner with Performance Summary */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden ${
        attempt.accuracy >= 75
          ? 'bg-gradient-to-r from-emerald-800 via-teal-900 to-indigo-900'
          : attempt.accuracy >= 50
          ? 'bg-gradient-to-r from-indigo-900 via-violet-800 to-purple-900'
          : 'bg-gradient-to-r from-amber-900 via-rose-900 to-indigo-950'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold border border-white/20">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                Official Board Evaluation Summary
              </div>
              <SourceBadge 
                source={attempt.quizId?.generationSource} 
                isAIGenerated={attempt.quizId?.isAIGenerated} 
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {attempt.accuracy >= 75
                ? 'Outstanding Mastery!'
                : attempt.accuracy >= 50
                ? 'Good Solid Attempt!'
                : 'Revision Session Completed'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-lg">
              {attempt.title} • {attempt.subject} ({attempt.unit})
            </p>
          </div>

          {/* Big Score Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-center min-w-[130px] shrink-0">
            <span className="block text-4xl font-black">{attempt.accuracy}%</span>
            <span className="text-xs font-medium text-slate-200">
              {attempt.score} of {attempt.totalQuestions} Correct
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={handleRetakeQuiz}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retake Quiz
          </button>
          <button
            onClick={handleGenerateSimilar}
            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Similar Quiz
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? 'Exporting...' : 'Export Result CSV'}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors ml-auto cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Goal Celebration Banner if goal was achieved in this attempt */}
      {location.state?.results?.dailyProgress?.justCompletedGoal && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/10 border border-emerald-200/80 text-emerald-950 text-xs font-bold flex items-center gap-3 shadow-xs animate-in fade-in">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
          <div className="space-y-0.5">
            <span className="block text-sm font-extrabold text-emerald-900">🎉 Daily Goal Met!</span>
            <span className="text-emerald-700 font-medium">You completed your daily study goal with this quiz attempt. Keep up the phenomenal consistency!</span>
          </div>
        </div>
      )}

      {/* Metrics Row: Correct, Incorrect, Unanswered, Time Taken, Points Awarded */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
          <span className="block text-2xl font-extrabold text-emerald-700">{attempt.correctAnswers}</span>
          <span className="text-xs font-semibold text-emerald-800">Correct</span>
        </div>
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
          <span className="block text-2xl font-extrabold text-rose-700">{attempt.incorrectAnswers}</span>
          <span className="text-xs font-semibold text-rose-800">Incorrect</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
          <span className="block text-2xl font-extrabold text-slate-700">{attempt.unansweredCount || 0}</span>
          <span className="text-xs font-semibold text-slate-600">Unanswered</span>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
          <span className="block text-2xl font-extrabold text-indigo-700">+{attempt.pointsAwarded || 0}</span>
          <span className="text-xs font-semibold text-indigo-800">Points Earned</span>
        </div>
      </div>

      {/* Topic-wise Accuracy Breakdown */}
      {attempt.topicBreakdown && attempt.topicBreakdown.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-indigo-50 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Topic Diagnostics Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attempt.topicBreakdown.map((t, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#faf9ff] border border-indigo-50/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{t.topic}</span>
                  <span className={`font-extrabold ${t.accuracy >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {t.accuracy}% ({t.correct}/{t.total})
                  </span>
                </div>
                <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${t.accuracy >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${t.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Topics for Revision */}
      {attempt.revisionTopics && attempt.revisionTopics.length > 0 && (
        <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200/70 space-y-3">
          <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Recommended Immediate Revision Areas
          </h3>
          <p className="text-xs text-amber-800">
            Based on your answers, these concepts require reinforcement to ensure top board scores:
          </p>
          <div className="space-y-2">
            {attempt.revisionTopics.map((rev, i) => (
              <div key={i} className="p-3 rounded-xl bg-white border border-amber-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{rev.topic}</span>
                  <p className="text-[11px] text-slate-500">{rev.suggestion}</p>
                </div>
                <button
                  onClick={() => navigate(`/generate?topic=${encodeURIComponent(rev.topic)}&subject=${encodeURIComponent(attempt.subject)}`)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 cursor-pointer"
                >
                  Revise Concept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Question Review Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-50 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Comprehensive Solutions & Answers</h3>
            <p className="text-xs text-slate-500">Compare your selected response with verified explanations</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({attempt.answers?.length || 0})
            </button>
            <button
              onClick={() => setFilterMode('incorrect')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'incorrect' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Incorrect ({attempt.incorrectAnswers})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterMode === 'correct' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Correct ({attempt.correctAnswers})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredAnswers.map((ans, idx) => {
            const isAnswered = ans.selectedOption >= 0;
            const isCorrect = ans.isCorrect;

            return (
              <div
                key={ans.questionIndex || idx}
                className={`p-5 sm:p-6 rounded-2xl border-2 transition-all space-y-4 ${
                  isCorrect
                    ? 'border-emerald-100 bg-emerald-50/20'
                    : 'border-rose-100 bg-rose-50/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-700">
                      Q{ans.questionIndex + 1}
                    </span>
                    {ans.topic && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {ans.topic}
                      </span>
                    )}
                  </div>

                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isCorrect
                      ? 'bg-emerald-100 text-emerald-800'
                      : isAnswered
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct
                      </>
                    ) : isAnswered ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Incorrect
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Unanswered
                      </>
                    )}
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                  {ans.questionText}
                </p>

                {/* All Options Review List */}
                {Array.isArray(ans.options) && ans.options.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {ans.options.map((optText, optIdx) => {
                      const isCorrectOpt = optIdx === ans.correctOption;
                      const isSelectedOpt = optIdx === ans.selectedOption;

                      let cardStyle = 'bg-white border-slate-200 text-slate-700';
                      let letterStyle = 'bg-slate-100 text-slate-600';
                      let statusBadge = null;

                      if (isCorrectOpt) {
                        cardStyle = 'bg-emerald-50/90 border-emerald-500 text-emerald-950 font-semibold shadow-xs';
                        letterStyle = 'bg-emerald-600 text-white';
                        statusBadge = (
                          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-200/70 px-2.5 py-0.5 rounded-lg shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            {isSelectedOpt ? 'Your Answer (Correct)' : 'Correct Answer'}
                          </span>
                        );
                      } else if (isSelectedOpt) {
                        cardStyle = 'bg-rose-50/90 border-rose-400 text-rose-950 font-semibold shadow-xs';
                        letterStyle = 'bg-rose-600 text-white';
                        statusBadge = (
                          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-200/70 px-2.5 py-0.5 rounded-lg shrink-0">
                            <XCircle className="w-3.5 h-3.5 text-rose-700" />
                            Your Wrong Answer
                          </span>
                        );
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 sm:p-3.5 rounded-xl border-2 transition-all flex items-start sm:items-center gap-3 text-xs sm:text-sm ${cardStyle}`}
                        >
                          <div className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${letterStyle}`}>
                            {optLetters[optIdx]}
                          </div>
                          <span className="leading-relaxed flex-1">
                            {optText}
                          </span>
                          {statusBadge}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Option summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className={`p-3 rounded-xl border font-medium ${
                    isAnswered && !isCorrect
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}>
                    <span className="font-bold">Your Answer: </span>
                    {isAnswered ? (
                      <span>
                        <strong className="underline">Option {optLetters[ans.selectedOption]}</strong>
                        {ans.options?.[ans.selectedOption] ? `: ${ans.options[ans.selectedOption]}` : ''}
                      </span>
                    ) : (
                      'None (Unattempted)'
                    )}
                  </div>

                  <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-300 text-emerald-950 font-medium">
                    <span className="font-bold">Correct Answer: </span>
                    <span>
                      <strong className="underline">Option {optLetters[ans.correctOption]}</strong>
                      {ans.options?.[ans.correctOption] ? `: ${ans.options[ans.correctOption]}` : ''}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                {ans.explanation && (
                  <div className="p-3.5 rounded-xl bg-white border border-indigo-100 text-xs space-y-1">
                    <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Detailed Syllabus Explanation:
                    </span>
                    <p className="text-slate-700 leading-relaxed">{ans.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
