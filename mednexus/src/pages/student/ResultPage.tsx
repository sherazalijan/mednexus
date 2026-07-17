/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// BACKEND CONNECTION FILE
// ============================================================================
// INSTRUCTIONS FOR BACKEND CONNECTION:
// 1. This file receives results from `QuizPage.tsx` via `react-router-dom` `useLocation()`.
// 2. These results are saved directly into your `quiz_attempts` table on PostgreSQL.
// 3. Ensure that when this page loads, it fetches latest scores or synchronizes
//    with `loadHistory()` in your context to match historical stats.
// 4. No fake analytics or mock graphs should be drawn from synthetic structures.
// ============================================================================

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Award, Timer, BookOpen, AlertCircle, RefreshCw, ClipboardList, CheckCircle2, XCircle } from 'lucide-react';

export const ResultPage: React.FC = () => {
  const { quizQuestions } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state passed from the QuizPage
  const { score, selectedAnswers, elapsedSeconds } = (location.state as {
    score: { correct: number; total: number; percentage: number };
    selectedAnswers: { [key: number]: 'A' | 'B' | 'C' | 'D' };
    elapsedSeconds: number;
  }) || { score: null, selectedAnswers: null, elapsedSeconds: 0 };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // If there are no active results, show a clean Empty State. No hardcoded results!
  if (!score || !selectedAnswers) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white p-8 border border-slate-200 rounded-lg shadow-sm text-center">
          <AlertCircle className="h-12 w-12 text-[#EF4444] mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-bold text-[#0F172A] font-sans">No Quiz Result Found</h2>
          <p className="mt-2 text-sm text-slate-500 mb-6">
            You navigated to this report without submitting an exam. Go back to the dashboard to begin.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0F172A] hover:bg-[#1E293B] cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Determine score color
  const getScoreColor = (percentage: number) => {
    if (percentage >= 75) return 'text-[#22C55E] border-[#22C55E]';
    if (percentage >= 50) return 'text-[#2563EB] border-[#2563EB]';
    return 'text-[#EF4444] border-[#EF4444]';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Action */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50/60 border border-blue-100 hover:border-blue-200 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center"
          >
            ← Back to medical command center
          </button>
        </div>

        {/* Results Overview Board */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8 mb-8">
          <div className="text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-md tracking-wider">
                Exam Evaluation Logged
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans mt-3">Board Review Complete</h1>
              <p className="text-xs text-slate-500 mt-1.5">
                Your performance metrics have been recorded in the database.
              </p>
            </div>
            
            <div className="flex items-center space-x-6 shrink-0">
              <div className="text-center">
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Time Elapsed</span>
                <span className="text-lg font-mono font-bold text-slate-800">{formatTime(elapsedSeconds)}</span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Accuracy</span>
                <span className="text-lg font-mono font-bold text-slate-800">{score.correct} / {score.total}</span>
              </div>
              <div className={`h-20 w-20 rounded-full border-4 flex flex-col justify-center items-center shadow-sm ${getScoreColor(score.percentage)}`}>
                <span className="text-xl font-mono font-bold">{score.percentage}%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider -mt-1">Score</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/books')}
              className="flex-1 inline-flex justify-center items-center py-2.5 px-4 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors shadow-blue-200 uppercase tracking-wider cursor-pointer"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Build New Custom Quiz
            </button>
            <button
              onClick={() => navigate('/history')}
              className="flex-1 inline-flex justify-center items-center py-2.5 px-4 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm uppercase tracking-wider cursor-pointer"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Inspect Historic Trends
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <h2 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-4 flex items-center space-x-2">
          <ClipboardList className="h-4 w-4 text-blue-600" />
          <span>Post-Exam Case Review ({score.total} questions)</span>
        </h2>

        <div className="space-y-6">
          {quizQuestions.map((q, idx) => {
            const chosen = selectedAnswers[idx];
            const correct = q.correct_answer;
            const isCorrect = chosen === correct;

            return (
              <div
                key={q.id}
                className={`bg-white border rounded-xl shadow-sm p-6 ${
                  isCorrect ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-rose-500'
                }`}
              >
                <div className="flex justify-between items-center gap-4 mb-4">
                  <span className="text-[10px] font-bold font-mono uppercase px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 border border-slate-200/50">
                    Question {idx + 1}
                  </span>
                  {isCorrect ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wide">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>CORRECT</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wide">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>INCORRECT</span>
                    </span>
                  )}
                </div>

                <p className="text-base font-medium text-slate-800 leading-relaxed mb-4">
                  {q.question}
                </p>

                {/* Option review breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs font-mono">
                  <div className={`p-3 rounded-xl border-2 ${
                    isCorrect ? 'border-emerald-200 bg-emerald-50/50 text-slate-700' : 'border-rose-200 bg-rose-50/50 text-slate-700'
                  }`}>
                    <span className="font-bold">Your Response: </span>
                    <span className="uppercase font-extrabold">({chosen || 'Unanswered'})</span> - {
                      chosen === 'A' ? q.option_a
                      : chosen === 'B' ? q.option_b
                      : chosen === 'C' ? q.option_c
                      : chosen === 'D' ? q.option_d
                      : 'None'
                    }
                  </div>

                  {!isCorrect && (
                    <div className="p-3 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 text-slate-700">
                      <span className="font-bold">Correct Key: </span>
                      <span className="uppercase font-extrabold">({correct})</span> - {
                        correct === 'A' ? q.option_a
                        : correct === 'B' ? q.option_b
                        : correct === 'C' ? q.option_c
                        : q.option_d
                      }
                    </div>
                  )}
                </div>

                {/* Explanation */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-600 shadow-xs">
                  <span className="block font-bold text-slate-800 mb-1.5 font-sans uppercase tracking-wider text-[10px]">Case Study & Explanation:</span>
                  <p className="font-sans whitespace-pre-line">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
