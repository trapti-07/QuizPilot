import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Clock, 
  Bookmark, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Send,
  Sparkles,
  HelpCircle,
  Flag,
  BookOpen,
  Info
} from 'lucide-react';
import { quizService } from '../services/quizService';
import QuestionPalette from '../components/QuestionPalette';
import ConfirmModal from '../components/ConfirmModal';
import { DifficultyBadge, SourceBadge } from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function QuizAttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quiz Attempt State
  const [currentIndex, setCurrentIndex] = useState(0);
  // Answers map: questionIndex -> selectedOption index (0, 1, 2, 3)
  const [answers, setAnswers] = useState({});
  // Marked for review array of question indices
  const [markedQuestions, setMarkedQuestions] = useState([]);
  
  // Timer State
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Submit Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load Quiz
  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        const res = await quizService.getQuizById(id);
        if (res.success && res.quiz) {
          setQuiz(res.quiz);
        } else {
          setError(res.message || 'Quiz could not be retrieved.');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error loading quiz.');
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [id]);

  // Timer Tick
  useEffect(() => {
    if (!timerEnabled || loading || !quiz) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerEnabled, loading, quiz]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleClearAnswer = () => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentIndex];
      return copy;
    });
  };

  const toggleMarkForReview = () => {
    setMarkedQuestions((prev) => {
      if (prev.includes(currentIndex)) {
        return prev.filter((i) => i !== currentIndex);
      } else {
        return [...prev, currentIndex];
      }
    });
  };

  const handleNext = () => {
    if (quiz && currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Submit handler
  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      // Format answers for server evaluation
      const formattedAnswers = quiz.questions.map((q, idx) => ({
        questionIndex: idx,
        selectedOption: answers[idx] !== undefined ? answers[idx] : -1,
      }));

      const res = await quizService.submitQuiz(quiz._id, {
        answers: formattedAnswers,
        timeTaken: secondsElapsed,
      });

      if (res.success && res.attemptId) {
        navigate(`/results/${res.attemptId}`, {
          state: {
            justCompleted: true,
            results: res.results,
          },
        });
      } else {
        alert(res.message || 'Failed to submit quiz.');
        setSubmitting(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Submission failed.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing your Board Revision session..." size="lg" />;
  }

  if (error || !quiz) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-3xl p-8 border border-rose-100 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Quiz Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'Unable to open quiz session.'}</p>
        <button
          onClick={() => navigate('/generate')}
          className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700"
        >
          Return to Generator
        </button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const totalQ = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQ - answeredCount;
  const isMarked = markedQuestions.includes(currentIndex);
  const selectedOpt = answers[currentIndex];
  const progressPercentage = Math.round(((currentIndex + 1) / totalQ) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-50 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900">{quiz.title}</h1>
            <DifficultyBadge difficulty={quiz.difficulty} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {quiz.subject} • {quiz.unit}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SourceBadge source={quiz.generationSource} isAIGenerated={quiz.isAIGenerated} />

          {/* Timer Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 font-mono text-xs font-bold border border-indigo-100">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Quiz
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-indigo-600 h-1.5 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Prominent Question Source Indicator */}
      {quiz.generationSource === 'question_bank' || !quiz.isAIGenerated ? (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              <strong>Verified Board Question Bank:</strong> These questions are loaded from QuizPilot's verified syllabus bank with official answer keys. (Configure <code className="bg-slate-200/80 px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-800">GEMINI_API_KEY</code> in backend <code className="bg-slate-200/80 px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-800">.env</code> to enable live Gemini AI question synthesis).
            </span>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700">
            Fallback Active
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Google Gemini AI Active:</strong> Questions synthesized dynamically via the official Google Gen AI SDK for your chosen board parameters.
            </span>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white">
            AI Generated
          </span>
        </div>
      )}

      {/* Main Attempt Grid: Question area (Left 2 cols) & Palette (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Question & Options Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-50 shadow-xs space-y-6">
            
            {/* Question Header & Counter */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Question {currentIndex + 1} of {totalQ}
              </span>

              <button
                type="button"
                onClick={toggleMarkForReview}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isMarked
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isMarked ? 'fill-amber-500 text-amber-600' : ''}`} />
                {isMarked ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>

            {/* Question Text */}
            <div className="space-y-1">
              <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                {currentQ.question}
              </p>
              {currentQ.topic && (
                <span className="inline-block text-[11px] text-slate-400 font-medium">
                  Concept: {currentQ.topic}
                </span>
              )}
            </div>

            {/* Four Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((optText, optIdx) => {
                const isSelected = selectedOpt === optIdx;
                const optLetters = ['A', 'B', 'C', 'D'];

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleOptionSelect(optIdx)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-600 text-indigo-950 shadow-xs'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {optLetters[optIdx]}
                    </div>
                    <span className="text-sm font-medium leading-relaxed pt-0.5">
                      {optText}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action Bar (Clear Choice & Prev / Next) */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClearAnswer}
                disabled={selectedOpt === undefined}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Selection
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Previous
                </button>

                {currentIndex < totalQ - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Next
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Review & Submit
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar Question Palette */}
        <div className="space-y-4">
          <QuestionPalette
            totalQuestions={totalQ}
            currentIndex={currentIndex}
            answers={answers}
            markedQuestions={markedQuestions}
            onSelectQuestion={(idx) => setCurrentIndex(idx)}
          />

          {/* Quick Stats Pill */}
          <div className="p-4 rounded-2xl bg-white border border-indigo-50 shadow-xs text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span>Answered:</span>
              <span className="font-bold text-emerald-600">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Unanswered:</span>
              <span className="font-bold text-slate-800">{unansweredCount}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Marked for Review:</span>
              <span className="font-bold text-amber-600">{markedQuestions.length}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        totalCount={totalQ}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        onConfirm={handleSubmitQuiz}
        onCancel={() => setShowConfirmModal(false)}
        isSubmitting={submitting}
      />
    </div>
  );
}
