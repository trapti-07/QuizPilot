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
  Info,
  GraduationCap,
  Tag
} from 'lucide-react';
import { quizService } from '../services/quizService';
import { analyticsService } from '../services/analyticsService';
import { CLASS_12_SYLLABUS, getSubjects, getUnitsForSubject } from '../data/class12Syllabus';

export default function QuizGeneratorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initial values from query params (e.g. from Weak Topics or Revision shortcuts)
  const initialSubject = searchParams.get('subject') || 'Physics';
  const initialTopic = searchParams.get('topic') || '';
  const initialDifficulty = searchParams.get('difficulty') || 'Medium';

  // Find matching unit if a topic was supplied
  const availableUnitsForInitialSubject = getUnitsForSubject(initialSubject);
  let defaultUnit = searchParams.get('unit') || availableUnitsForInitialSubject[0]?.name || 'Electrostatics';
  if (initialTopic) {
    const matchedUnit = availableUnitsForInitialSubject.find(u => 
      u.topics.some(t => 
        t.toLowerCase().includes(initialTopic.toLowerCase()) || 
        initialTopic.toLowerCase().includes(t.toLowerCase())
      )
    );
    if (matchedUnit) {
      defaultUnit = matchedUnit.name;
    }
  }

  const [subject, setSubject] = useState(initialSubject);
  const [unit, setUnit] = useState(defaultUnit);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [count, setCount] = useState(10);
  const [topic, setTopic] = useState(initialTopic);
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [customTopicText, setCustomTopicText] = useState('');
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

  // Update unit and reset topic when subject changes
  const handleSubjectChange = (newSubject) => {
    setSubject(newSubject);
    const units = getUnitsForSubject(newSubject) || [];
    const firstUnitName = units[0]?.name || 'General';
    setUnit(firstUnitName);
    setTopic('');
    setIsCustomTopic(false);
    setCustomTopicText('');
  };

  // Update unit and reset topic when unit changes (prevents unit/topic mismatch)
  const handleUnitChange = (newUnitName) => {
    setUnit(newUnitName);
    setTopic('');
    setIsCustomTopic(false);
    setCustomTopicText('');
  };

  // Get current active unit object and its verified Class 12 topics
  const currentUnitsList = getUnitsForSubject(subject) || [];
  const activeUnitObj = currentUnitsList.find(u => u.name === unit || u.id === unit) || currentUnitsList[0];
  const unitTopics = activeUnitObj?.topics || [];

  const handleTopicDropdownChange = (val) => {
    if (val === '__custom__') {
      setIsCustomTopic(true);
      setTopic(customTopicText.trim());
    } else {
      setIsCustomTopic(false);
      setTopic(val);
    }
  };

  const handleCustomTopicChange = (val) => {
    setCustomTopicText(val);
    setTopic(val.trim());
  };

  const handleSelectTopicPill = (tName) => {
    if (topic === tName) {
      // Toggle off to all topics
      setTopic('');
      setIsCustomTopic(false);
    } else {
      setTopic(tName);
      setIsCustomTopic(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!subject || !unit) {
      setError('Please select both a Class 12 Subject and Unit / Chapter.');
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
        navigate(`/quiz/${res.quiz._id}`, {
          state: {
            generationMessage: res.message,
            source: res.quiz.generationSource,
          },
        });
      } else {
        setError(res.message || 'Failed to generate Class 12 questions. Please try different options.');
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
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            Class 12 Board Exam Special
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Strictly CBSE & State Boards Curriculum
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Class 12 Board Revision Quiz Generator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select your Class 12 board curriculum parameters to generate high-yield multiple-choice questions with full verified answer keys.
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
              1. Class 12 Board Subject
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getSubjects().map((subjName) => {
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
                    <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                      Class 12 Syllabus
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Unit / Chapter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Class 12 Unit / Chapter
              </label>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                {currentUnitsList.length} Units Available
              </span>
            </div>
            
            <div className="relative">
              <select
                value={unit}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer appearance-none"
              >
                {currentUnitsList.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Chapters updated dynamically for Class 12 {subject}. Changing unit automatically aligns topics.
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

          {/* 5. Specific Topic / Concept (Strictly matched to selected Unit) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                5. Unit Concept / Sub-Topic <span className="text-slate-400 font-normal lowercase">(aligned to {activeUnitObj?.name})</span>
              </label>
              {topic && (
                <button
                  type="button"
                  onClick={() => { setTopic(''); setIsCustomTopic(false); setCustomTopicText(''); }}
                  className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Reset to All Topics
                </button>
              )}
            </div>

            {/* Quick Topic Pills for one-click selection within this Unit */}
            {unitTopics.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-500 font-medium block">
                  Click a verified Class 12 topic below to focus:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setTopic(''); setIsCustomTopic(false); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      !topic && !isCustomTopic
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    ★ All Topics in this Unit
                  </button>
                  {unitTopics.map((tName) => {
                    const isSelected = topic === tName && !isCustomTopic;
                    return (
                      <button
                        key={tName}
                        type="button"
                        onClick={() => handleSelectTopicPill(tName)}
                        className={`px-3 py-1.5 rounded-xl text-xs transition-all border cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                            : 'bg-white hover:bg-indigo-50/70 text-slate-700 border-slate-200 font-medium'
                        }`}
                      >
                        <Tag className={`w-3 h-3 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`} />
                        {tName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Topic Select Dropdown */}
            <div className="relative">
              <select
                value={isCustomTopic ? '__custom__' : topic}
                onChange={(e) => handleTopicDropdownChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer appearance-none"
              >
                <option value="">All Topics in {unit} (Comprehensive Chapter Test)</option>
                {unitTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="__custom__">Custom / Other Class 12 Concept...</option>
              </select>
            </div>

            {/* Custom Topic Input if selected */}
            {isCustomTopic && (
              <div className="pt-1">
                <input
                  type="text"
                  value={customTopicText}
                  onChange={(e) => handleCustomTopicChange(e.target.value)}
                  placeholder={`Enter specific sub-topic for ${unit} (e.g. Raoult's Law, Nernst Equation)`}
                  className="w-full px-4 py-2.5 rounded-xl border border-indigo-300 bg-indigo-50/30 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  autoFocus
                />
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              Only concepts belonging to <strong>{unit}</strong> are selected. Changing the unit will automatically reset topics to prevent mismatches.
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
                  Prioritize Past Mistakes in this Unit
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  When enabled, QuizPilot prioritizes Class 12 questions from concepts and sub-topics you previously answered incorrectly.
                </p>
              </div>
            </label>
          </div>

          {/* Generation Info & Fallback Assurance Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Class 12 Board Standard Guarantee:</span> All questions generated strictly adhere to official CBSE & State Board Class 12 syllabus boundaries, with complete verified answers and step-by-step rationales.
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
                <span>Generating {count} Class 12 Board Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Generate Class 12 Board Quiz & Begin Revision</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
