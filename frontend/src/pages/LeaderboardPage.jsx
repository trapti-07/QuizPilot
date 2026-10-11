import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Award, 
  Crown, 
  CheckCircle2, 
  User, 
  Sparkles,
  Info
} from 'lucide-react';
import { leaderboardService } from '../services/leaderboardService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        const res = await leaderboardService.getLeaderboard();
        if (res.success) {
          setLeaderboard(res.leaderboard || []);
          setCurrentUserRank(res.currentUserRank || null);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Querying global student rankings..." size="lg" />;
  }

  const topThree = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <Trophy className="w-3.5 h-3.5 text-indigo-600" />
          Global Student Standings
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Board Revision Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Rankings calculated automatically by server from verified quiz points and consistency streaks.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 (Silver) */}
          {topThree[1] && (
            <div className="order-2 sm:order-1 bg-white rounded-3xl p-6 border border-slate-200 text-center shadow-xs flex flex-col items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-lg mb-3 border border-slate-200">
                🥈 2
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm truncate max-w-full">
                {topThree[1].displayName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{topThree[1].quizzesCompleted} quizzes completed</p>
              <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-around text-xs">
                <div>
                  <span className="block font-black text-indigo-600 text-base">{topThree[1].points}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Points</span>
                </div>
                <div>
                  <span className="block font-black text-slate-700 text-base">{topThree[1].accuracy}%</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Accuracy</span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {topThree[0] && (
            <div className="order-1 sm:order-2 bg-gradient-to-b from-amber-500/10 to-amber-500/5 rounded-3xl p-6 border-2 border-amber-300 text-center shadow-md flex flex-col items-center justify-between transform sm:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center font-black text-xl mb-3 shadow-md shadow-amber-200">
                👑 1
              </div>
              <h3 className="font-extrabold text-slate-900 text-base truncate max-w-full">
                {topThree[0].displayName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{topThree[0].quizzesCompleted} quizzes completed</p>
              <div className="mt-4 pt-3 border-t border-amber-200/60 w-full flex items-center justify-around text-xs">
                <div>
                  <span className="block font-black text-amber-700 text-lg">{topThree[0].points}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Points</span>
                </div>
                <div>
                  <span className="block font-black text-slate-800 text-lg">{topThree[0].accuracy}%</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Accuracy</span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] && (
            <div className="order-3 bg-white rounded-3xl p-6 border border-slate-200 text-center shadow-xs flex flex-col items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-800 flex items-center justify-center font-black text-lg mb-3 border border-amber-200">
                🥉 3
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm truncate max-w-full">
                {topThree[2].displayName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{topThree[2].quizzesCompleted} quizzes completed</p>
              <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-around text-xs">
                <div>
                  <span className="block font-black text-indigo-600 text-base">{topThree[2].points}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Points</span>
                </div>
                <div>
                  <span className="block font-black text-slate-700 text-base">{topThree[2].accuracy}%</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Accuracy</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current User Standings Card */}
      {currentUserRank && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-base">
              #{currentUserRank.rank}
            </div>
            <div>
              <p className="text-xs text-indigo-200 font-medium">Your Current Ranking</p>
              <h4 className="font-bold text-sm">{currentUserRank.fullName} (You)</h4>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-right">
            <div>
              <span className="block text-sm font-black text-white">{currentUserRank.points}</span>
              <span className="text-[10px] text-indigo-200">Points</span>
            </div>
            <div>
              <span className="block text-sm font-black text-white">{currentUserRank.quizzesCompleted}</span>
              <span className="text-[10px] text-indigo-200">Quizzes</span>
            </div>
            <div>
              <span className="block text-sm font-black text-white">{currentUserRank.accuracy}%</span>
              <span className="text-[10px] text-indigo-200">Accuracy</span>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-50 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Ranked Students</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Quizzes</th>
                <th className="py-3 px-4">Average Accuracy</th>
                <th className="py-3 px-4">Streak</th>
                <th className="py-3 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {leaderboard.map((item) => {
                const isCurrentUser = item.isCurrentUser;
                return (
                  <tr
                    key={item.userId}
                    className={`transition-colors ${
                      isCurrentUser
                        ? 'bg-indigo-50/80 font-bold text-indigo-950'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-black">
                      {item.rank === 1 ? '🥇 1' : item.rank === 2 ? '🥈 2' : item.rank === 3 ? '🥉 3' : `#${item.rank}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span>{item.displayName}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-indigo-600 text-white">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{item.quizzesCompleted} completed</td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${item.accuracy >= 75 ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {item.accuracy}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        {item.currentStreak || 0}d
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-indigo-600 text-sm">
                      {item.points} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Points System Explanation */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-600" /> Scoring Mechanics:
        </h4>
        <p>
          Points are calculated on the server and awarded only once per completed attempt. Easy: 10 pts/question • Medium: 15 pts/question • Hard: 25 pts/question • Adaptive: 20 pts/question. High accuracy (&ge;90%) earns an extra 30 pts distinction bonus.
        </p>
      </div>
    </div>
  );
}
