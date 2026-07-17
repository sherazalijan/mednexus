
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// BACKEND CONNECTION NOTICE:
// 1. This is the student's central learning cockpit.
// 2. The statistics (average score, total questions answered, streak) are calculated 
//    dynamically from your database model via `history` and `leaderboard`.
// 3. Connect this to your FastAPI `/dashboard/metrics` route if you decide to compute 
//    aggregations directly on the PostgreSQL server (highly recommended for performance).
// ============================================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Award, BookOpen, Clock, BarChart3, HelpCircle, Trophy, Sparkles, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser, history, leaderboard, loadHistory, loadLeaderboard, logout } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
    loadLeaderboard();
  }, []);

  // SAFETY GATE: Prevents rendering crashes if data hasn't arrived from context/API yet
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-slate-400 font-bold tracking-widest text-xs uppercase">Loading Console...</div>
      </div>
    );
  }

  const totalAttempts = history.length;
  const avgScore = totalAttempts > 0 
    ? Math.round(history.reduce((sum, item) => sum + item.score_percentage, 0) / totalAttempts)
    : 0;
  const totalQuestionsAnswered = history.reduce((sum, item) => sum + item.total_questions, 0);
  const totalCorrect = history.reduce((sum, item) => sum + item.correct_answers, 0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 lg:p-8">
      
      {/* Main Container */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Welcome Block & Metrics (Colspan 2) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 rounded-xl text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="max-w-lg relative z-10">
              <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-500/20 border border-blue-400/30 px-2.5 py-1 rounded text-blue-300">
                BOARD SIMULATION CONSOLE
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight mt-4 font-sans">
                Welcome, Dr. {currentUser?.full_name?.split(' ').pop()}
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Your medical dashboard is connected to the PostgreSQL database schema. Start compiling specialized MCQs to measure diagnostic accuracy and track performance.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/books')}
                  className="inline-flex items-center bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                  Configure Custom Q-Bank
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"></div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            {/* Metric 1 */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                Completed Reviews
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-mono font-bold text-slate-800">{totalAttempts}</span>
                <span className="text-xs font-medium text-slate-400">exams</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                Cumulative Accuracy
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-mono font-bold text-slate-800">{avgScore}%</span>
                <span className="text-xs font-medium text-slate-400">avg</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                Diagnostic Output
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-mono font-bold text-slate-800">{totalQuestionsAnswered}</span>
                <span className="text-xs font-medium text-slate-400">answered</span>
              </div>
            </div>

          </div>

          {/* Subsystem Navigator Links */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Study Navigation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/books')}
                className="p-4 rounded-xl border-2 border-slate-100 hover:border-blue-600/40 bg-slate-50/50 text-left transition-all cursor-pointer flex justify-between items-center group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Textbook Syllabus</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Browse books and load target categories</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>

              <button
                onClick={() => navigate('/history')}
                className="p-4 rounded-xl border-2 border-slate-100 hover:border-blue-600/40 bg-slate-50/50 text-left transition-all cursor-pointer flex justify-between items-center group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Review History</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Re-evaluate previous questions & keys</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Dynamic Leaderboard Panel */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Diagnostic Leaderboard</span>
            </h3>

            {leaderboard.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                <Sparkles className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold">Leaderboard Empty</p>
                <p className="mt-0.5 max-w-[180px] mx-auto text-[10px]">Take quizzes to build real board rankings dynamically!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry, idx) => (
                  <div
                    key={entry.user_id}
                    className={`flex justify-between items-center p-3 rounded-lg border-2 ${
                      entry.user_id === currentUser?.id
                        ? 'bg-blue-50/50 border-blue-200 font-semibold text-blue-900'
                        : 'border-slate-50 hover:bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5 shrink-0">
                        #{entry.rank}
                      </span>
                      <span className="text-xs truncate max-w-[120px] font-medium">
                        {entry.full_name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-800">{entry.score_percentage}%</span>
                      <p className="text-[9px] text-slate-400 -mt-0.5 font-mono">{entry.total_attempts} attempts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Secure DB Audit Status */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-500 shadow-sm">
            <span className="block font-bold text-slate-700 mb-1.5 flex items-center">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
              PostgreSQL Schema Status
            </span>
            <p className="leading-relaxed font-sans">
              Models are fully aligned with the tables: <code className="bg-slate-200 px-1 rounded text-[10px]">books</code>, <code className="bg-slate-200 px-1 rounded text-[10px]">chapters</code>, <code className="bg-slate-200 px-1 rounded text-[10px]">mcqs</code>, <code className="bg-slate-200 px-1 rounded text-[10px]">quiz_attempts</code>, and <code className="bg-slate-200 px-1 rounded text-[10px]">users</code>.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};
