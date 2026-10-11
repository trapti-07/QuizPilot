import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  Sliders, 
  Layers, 
  HelpCircle, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';
import { quizService } from '../services/quizService';
import { analyticsService } from '../services/analyticsService';

const SUBJECT_UNITS = {
  'Physics': [
    'Electrostatics',
    'Current Electricity',
    'Magnetic Effects of Current',
    'Optics (Ray & Wave Optics)',
    'Modern Physics (Dual Nature, Atoms & Nuclei)',
    'Semiconductor Electronics',
    'Electromagnetic Induction & AC',
  ],
  'Chemistry': [
    'Solutions',
    'Electrochemistry',
    'Chemical Kinetics',
    'Coordination Compounds',
    'Organic Chemistry (Haloalkanes & Alcohols)',
    'Biomolecules',
    'Aldehydes, Ketones & Carboxylic Acids',
  ],
  'Mathematics': [
    'Calculus (Continuity & Integrals)',
    'Matrices & Determinants',
    'Vectors and 3D Geometry',
    'Probability',
    'Relations & Functions',
    'Linear Programming',
  ],
  'Biology': [
    'Genetics & Evolution',
    'Reproduction in Organisms',
    'Biotechnology and Applications',
    'Ecology & Environment',
    'Human Physiology',
  ],
  'Computer Science': [
    'Python Data Structures',
    'Relational Databases and SQL',
    'Computer Networks',
    'Boolean Logic & System Architecture',
    'Cyber Safety & Ethics',
  ],
  'English Core': [
    'Reading Comprehension',
    'Writing Skills (Letters, Notices, Reports)',
    'Grammar and Usage',
    'Literature Analysis & Figurative Devices',
  ],
};

export default function QuizGeneratorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initial values from query params (e.g. from Weak Topics or Adaptive Difficulty shortcuts)
  const initialSubject = searchParams.get('subject') || 'Physics';
  const initialTopic = searchParams.get('topic') || '';
  const initialDifficulty = searchParams.get('difficulty') || 'Medium';

  const [subject, setSubject] = useState(initialSubject);
  const [unit, setUnit] = useState(SUBJECT_UNITS[initialSubject]?.[0] || 'Electrostatics');
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [count, setCount] = useState(10);
  const [topic, setTopic] = useState(initialTopic);
  const [focusMistakes, setFocusMistakes] = useState(searchParams.get('focusMistakes') === 'true');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendedDifficulty, setRecommendedDifficulty] = useState(null);

  // Load adaptive difficulty calibration if available
  useEffect(() => {
    async function checkRecommendation() {
      try {
        const res = await analyticsService.getDifficultyRecommendation();
        if (res.success && res.recommendedDifficulty) {
          setRecommendedDifficulty(res);
        }
      } catch (err) {
        console.warn('Could not fetch difficulty recommendation:', err);
      }
    }
    checkRecommendation();
  }, []);

  // Update unit when subject changes
  const handleSubjectChange = (newSubject) => {
    setSubject(newSubject);
    const units = SUBJECT_UNITS[newSubject] || [];
    setUnit(units[0] || 'General');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!subject || !unit) {
      setError('Please select both a Subject and a Unit / Chapter.');
      return;
    }

    setLoading(true);

    try {
      const res = await quizService.generateQuiz({
        subject,
        unit,
        difficulty,
        count: Number(count),
        topic: topic.trim() || undefined,
        focusMistakes,
      });

      if (res.success && res.quiz?._id) {
        // Successfully created quiz, navigate to dedicated quiz-taking page
        navigate(`/quiz/${res.quiz._id}`, {
          state: {
            generationMessage: res.message,
            source: res.quiz.generationSource,
          },
        });
      } else {
        setError(res.message || 'Failed to generate questions. Please try different options.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Server error while generating quiz.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-300" />
          AI & Question-Bank Generator
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Configure Your Board Revision Quiz
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select your subject curriculum parameters to generate structured multiple-choice questions with verified answer keys.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Generation Notice</h4>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Generator Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-50 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-6">
          
          {/* 1. Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Board Subject
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.keys(SUBJECT_UNITS).map((subjName) => {
                const isSelected = subject === subjName;
                return (
                  <button
                    key={subjName}
                    type="button"
                    onClick={() => handleSubjectChange(subjName)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 font-bold'
                        : 'bg-white hover:bg-indigo-50/50 text-slate-700 border-slate-200 font-medium'
                    }`}
                  >
                    <span className="block text-sm">{subjName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Unit / Chapter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Unit / Chapter
            </label>
            <div className="relative">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer appearance-none"
              >
                {(SUBJECT_UNITS[subject] || []).map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Chapters updated dynamically based on selected {subject} syllabus.
            </p>
          </div>

          {/* 3. Difficulty */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Difficulty Level
              </label>
              {recommendedDifficulty && (
                <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 flex items-center gap-1">
                  <Sliders className="w-3 h-3" />
                  Recommended: {recommendedDifficulty.recommendedDifficulty}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'Easy', label: 'Easy', desc: 'Foundational concepts' },
                { id: 'Medium', label: 'Medium', desc: 'Standard board level' },
                { id: 'Hard', label: 'Hard', desc: 'HOTS & analytical' },
                { id: 'Adaptive', label: 'Adaptive', desc: 'Auto-calibrated' },
              ].map((diff) => {
                const isSelected = difficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setDifficulty(diff.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-600/20 font-bold'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold">{diff.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{diff.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Number of Questions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              4. Number of Questions
            </label>
            <div className="flex flex-wrap gap-2.5">
              {[5, 10, 15, 20, 25, 30].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCount(num)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    count === num
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {/* 5. Optional Concept / Specific Topic */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              5. Specific Topic / Concept <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Gauss's Law, Nernst Equation, Bayes Theorem, TCP vs UDP"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Target a specific sub-topic for deep revision or leave blank for a comprehensive unit test.
            </p>
          </div>

          {/* Targeted Remediation of Past Mistakes */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={focusMistakes}
                onChange={(e) => setFocusMistakes(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-amber-300 accent-indigo-600 cursor-pointer"
              />
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Prioritize Past Mistakes & Weak Concepts
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  When selected, QuizPilot prioritizes questions from concepts and sub-topics you previously answered incorrectly, strengthening your weak areas.
                </p>
              </div>
            </label>
          </div>

          {/* Generation Info & Fallback Assurance Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Dual-Engine Guarantee:</span> QuizPilot generates tailored questions via connected AI. If an AI API key is not configured, it automatically deploys verified board exam syllabus questions with complete step-by-step explanations.
            </div>
          </div>

          {/* 6. Generate Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-base shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating {count} Board Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Generate Quiz & Begin Revision</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
