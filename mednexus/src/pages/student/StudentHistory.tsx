/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// BACKEND CONNECTION NOTICE:
// 1. This is the student's historic performance logs module.
// 2. These records are pulled from the `quiz_attempts` PostgreSQL table via `loadHistory()`.
// 3. To connect this directly, ensure you have an active API endpoint on your FastAPI
//    backend returning JSON records that match the `QuizAttempt` type schema in `src/types.ts`.
// ============================================================================

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ClipboardList, Award, Calendar, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export const StudentHistory: React.FC = () => {
  const { history, loadHistory, isLoading, error } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const getScoreBadgeStyle = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-50 text-green-700 border border-green-200';
    if (percentage >= 50) return 'bg-blue-50 text-blue-700 border border-blue-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Action */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50/60 border border-blue-100 hover:border-blue-200 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            ← Back to main console
          </button>
        </div>

        {/* Title panel */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2.5">
            <ClipboardList className="h-7 w-7 text-blue-600" strokeWidth={1.5} />
            <span>Diagnostic History Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xl">
            Re-evaluate your historic board exams, track previous scores, and find areas requiring clinical study.
          </p>
        </div>

        {/* Database Content Area */}
        {isLoading && history.length === 0 ? (
          <div className="py-20 flex flex-col justify-center items-center">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs mt-3 font-mono">Loading historic scores from PostgreSQL...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold uppercase tracking-wider text-sm">Database Query Failed</h3>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        ) : history.length === 0 ? (
          /* Empty History State */
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm max-w-xl mx-auto">
            <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.2} />
            <h3 className="font-semibold text-slate-800 text-base">No Historical Exam Attempts</h3>
            <p className="text-xs text-slate-400 mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
              We did not find any recorded quiz attempts in the database. Compile and finish a custom syllabus review exam to log your first report!
            </p>
            <button
              onClick={() => navigate('/books')}
              className="px-5 py-2.5 bg-slate-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 cursor-pointer"
            >
              Configure First Quiz
            </button>
          </div>
        ) : (
          /* Active Attempts Table */
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th scope="col" className="px-6 py-4">Quiz Session Details</th>
                  <th scope="col" className="px-6 py-4">Questions Answered</th>
                  <th scope="col" className="px-6 py-4">Diagnostic Score</th>
                  <th scope="col" className="px-6 py-4 text-right">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Award className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
                        <div>
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{h.quiz_type}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ATTEMPT ID: {h.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-600">
                      {h.correct_answers} / {h.total_questions} correct
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold border-2 ${getScoreBadgeStyle(h.score_percentage)}`}>
                        {h.score_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-slate-500 font-mono">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(h.completed_at).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
