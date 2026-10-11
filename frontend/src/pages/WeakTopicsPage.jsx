import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Sliders, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { DifficultyBadge } from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WeakTopicsPage() {
  const navigate = useNavigate();

  const [weakTopics, setWeakTopics] = useState([]);
  const [improvingTopics, setImprovingTopics] = useState([]);
  const [strongTopics, setStrongTopics] = useState([]);
  const [insufficientDataTopics, setInsufficientDataTopics] = useState([]);
  const [allTopics, setAllTopics] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'weak' | 'improving' | 'strong' | 'insufficient'
  const [difficultyData, setDifficultyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [wtRes, diffRes] = await Promise.all([
          analyticsService.getWeakTopics(),
          analyticsService.getDifficultyRecommendation(),
        ]);

        if (wtRes.success) {
          setWeakTopics(wtRes.weakTopics || []);
          setImprovingTopics(wtRes.improvingTopics || []);
          setStrongTopics(wtRes.strongTopics || []);
          setInsufficientDataTopics(wtRes.insufficientDataTopics || []);
          setAllTopics(wtRes.allTopics || []);
        }
        if (diffRes.success) {
          setDifficultyData(diffRes);
        }
      } catch (err) {
        console.error('Failed to load weak topics analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const handleStartRevisionQuiz = (topic, subject) => {
    navigate(`/generate?topic=${encodeURIComponent(topic)}&subject=${encodeURIComponent(subject || '')}`);
  };

  if (loading) {
    return <LoadingSpinner message="Auditing your board exam question accuracy records..." size="lg" />;
  }

  const renderTrendIcon = (trend) => {
    if (trend === 'Improving') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <TrendingUp className="w-3 h-3 text-emerald-600" /> Improving
        </span>
      );
    }
    if (trend === 'Declining') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
          <TrendingDown className="w-3 h-3 text-rose-600" /> Declining
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
        <Minus className="w-3 h-3 text-slate-400" /> Stable
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Diagnostic Performance Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Weak Topics & Adaptive Difficulty
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Precision analytics calculated from your actual saved question attempts to eliminate exam blind spots.
        </p>
      </div>

      {/* Adaptive Recommendation Card */}
      {difficultyData && (
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-300" />
                <h3 className="text-lg font-bold">Personalized Adaptive Calibration</h3>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200">
                Current algorithmic recommendation: <span className="font-extrabold text-white underline decoration-amber-400">{difficultyData.recommendedDifficulty} Difficulty</span>
              </p>
            </div>

            <button
              onClick={() => navigate(`/generate?difficulty=${difficultyData.recommendedDifficulty}`)}
              className="px-5 py-2.5 rounded-2xl bg-white text-indigo-950 text-xs font-extrabold hover:bg-indigo-50 shadow-md transition-all self-start sm:self-auto cursor-pointer"
            >
              Generate at Recommended Level
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs text-indigo-100 leading-relaxed">
            <span className="font-bold text-white">Why this is recommended: </span>
            {difficultyData.reason}
          </div>
        </div>
      )}

      {/* Category Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('weak')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'weak'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-sm'
              : 'bg-white border-slate-100 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-700">Urgent Weak</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-900">{weakTopics.length}</div>
          <p className="text-[11px] text-rose-600/80 mt-1">Sub-65% accuracy, high priority</p>
        </div>

        <div 
          onClick={() => setActiveTab('improving')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'improving'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-slate-100 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700">Improving</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-900">{improvingTopics.length}</div>
          <p className="text-[11px] text-amber-600/80 mt-1">Upward trajectory recorded</p>
        </div>

        <div 
          onClick={() => setActiveTab('strong')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'strong'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-slate-100 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700">Strong & Mastered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{strongTopics.length}</div>
          <p className="text-[11px] text-emerald-600/80 mt-1">High retention (70%+ accuracy)</p>
        </div>

        <div 
          onClick={() => setActiveTab('insufficient')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'insufficient'
              ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-400/20 shadow-sm'
              : 'bg-white border-slate-100 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Building Baseline</span>
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-800">{insufficientDataTopics.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">&lt; 2 attempts (needs data)</p>
        </div>
      </div>

      {/* Baseline Threshold Educational Callout */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Algorithmic Baseline Safeguard:</span> QuizPilot requires at least 2 question attempts in a concept before classifying it as "Weak" or "Improving". This prevents an accidental misclick from falsely labeling a topic as weak.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label: 'All Concepts', count: allTopics.length },
          { id: 'weak', label: 'Urgent Weak Areas', count: weakTopics.length, color: 'text-rose-700 bg-rose-50 border-rose-200' },
          { id: 'improving', label: 'Improving', count: improvingTopics.length, color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { id: 'strong', label: 'Strong & Mastered', count: strongTopics.length, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { id: 'insufficient', label: 'Building Baseline', count: insufficientDataTopics.length, color: 'text-slate-700 bg-slate-100 border-slate-200' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtered Concept Cards */}
      <div className="space-y-4">
        {(() => {
          let list = [];
          if (activeTab === 'weak') list = weakTopics;
          else if (activeTab === 'improving') list = improvingTopics;
          else if (activeTab === 'strong') list = strongTopics;
          else if (activeTab === 'insufficient') list = insufficientDataTopics;
          else list = allTopics;

          if (list.length === 0) {
            return (
              <div className="text-center py-12 px-4 bg-white border border-dashed border-slate-200 rounded-3xl space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Concepts in this Category</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {activeTab === 'weak'
                    ? 'Great news! No critical weak topics are currently flagged in your profile.'
                    : 'Complete quizzes across subjects to populate this performance category.'}
                </p>
              </div>
            );
          }

          return list.map((item, idx) => {
            const isWeak = item.category === 'Weak';
            const isImproving = item.category === 'Improving';
            const isStrong = item.category === 'Strong';
            const isInsufficient = item.category === 'Insufficient Data';

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl bg-white border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isWeak
                    ? 'border-rose-100 hover:border-rose-300 shadow-xs'
                    : isImproving
                    ? 'border-amber-100 hover:border-amber-300'
                    : isStrong
                    ? 'border-emerald-100 hover:border-emerald-300'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">{item.topic}</h3>
                    {item.subject && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.subject}
                      </span>
                    )}

                    {/* Category Pill */}
                    {isWeak && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Urgent Weak Area
                      </span>
                    )}
                    {isImproving && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-amber-600" /> Improving {item.delta > 0 ? `(+${item.delta}%)` : ''}
                      </span>
                    )}
                    {isStrong && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Mastered
                      </span>
                    )}
                    {isInsufficient && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Baseline Establishing
                      </span>
                    )}

                    {/* Urgency Rank if weak */}
                    {isWeak && item.urgencyScore > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        Urgency Score: {item.urgencyScore}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{item.questionsAttempted}</span> questions attempted •{' '}
                    <span className="font-semibold text-emerald-600">{item.correctAnswers}</span> correct •{' '}
                    <span className="font-semibold text-rose-600">{item.incorrectAnswers || 0}</span> incorrect •{' '}
                    <span className={`font-bold ${isWeak ? 'text-rose-700' : isStrong ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {item.accuracy}% accuracy
                    </span>
                  </p>

                  <p className="text-xs text-slate-600 font-medium">
                    <span className="text-indigo-600 font-bold">Suggested Action: </span>
                    {item.recommendedAction}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="block text-[11px] text-slate-400">Target Level</span>
                    <DifficultyBadge difficulty={item.suggestedDifficulty || 'Medium'} />
                  </div>
                  <button
                    onClick={() => handleStartRevisionQuiz(item.topic, item.subject)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Targeted Revision Quiz
                  </button>
                </div>
              </div>
            );
          });
        })()}
      </div>

    </div>
  );
}
