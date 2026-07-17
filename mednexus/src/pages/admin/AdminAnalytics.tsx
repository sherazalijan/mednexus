/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// BACKEND CONNECTION NOTICE:
// 1. This file renders interactive progress analytics for administrators.
// 2. The data streams come from PostgreSQL tables (`users` and `quiz_attempts`) via `adminService.getAnalytics`.
// 3. We use `recharts` for charting.
// 4. Ensure you have proper JSON serializations on your FastAPI backend for dates and numbers!
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { adminService } from '../../services/api';
import { BarChart3, TrendingUp, RefreshCw, AlertCircle, FileSpreadsheet, Sparkles } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { history, loadHistory, isLoading, error } = useApp();
  const [dbStats, setDbStats] = useState<{
    total_users: number;
    total_books: number;
    total_chapters: number;
    total_mcqs: number;
    total_attempts: number;
    average_score: number;
  } | null>(null);

  const loadData = async () => {
    try {
      await loadHistory();
      const stats = await adminService.getAnalytics();
      setDbStats(stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format Recharts data dynamically from real database attempts!
  const chartData = history.map((h, i) => ({
    name: `Exam #${i + 1}`,
    score: h.score_percentage,
    questions: h.total_questions,
    correct: h.correct_answers,
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Title Board */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2.5">
            <BarChart3 className="h-7 w-7 text-blue-600" strokeWidth={1.5} />
            <span>Analytical Statistics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xl">
            Track student accuracy distributions, examine textbook coverage, and monitor database telemetry.
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-6 text-center mb-8">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold uppercase tracking-wider text-sm">Database Analytics Offline</h3>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        ) : history.length === 0 ? (
          /* Empty Analytics State - No hardcoded graph data! */
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-2xl mx-auto shadow-sm">
            <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.2} />
            <h3 className="font-bold text-slate-800 text-base">Analytical Index is Empty</h3>
            <p className="text-xs text-slate-400 mt-1.5 mb-6 leading-relaxed max-w-sm mx-auto">
              No analytical graphs can be plotted yet since there are no completed board exams. Start student accounts to populate PostgreSQL metrics!
            </p>
            <div className="p-5 bg-slate-50 rounded-xl text-left border border-slate-200 text-xs mb-6 space-y-2 text-slate-600 max-w-md mx-auto">
              <p className="font-bold text-slate-800">Connection Checklist:</p>
              <p>1. Authenticate as a student account.</p>
              <p>2. Complete a Board Review Quiz in the syllabus catalog.</p>
              <p>3. Submit the quiz to write records to <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-800">quiz_attempts</code>.</p>
            </div>
            <button
              onClick={loadData}
              className="px-5 py-2.5 bg-slate-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
            >
              Refresh Statistics
            </button>
          </div>
        ) : (
          /* Real Dynamic Analytics Layout */
          <div className="space-y-8">
            
            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Chart 1: Student Score Line Progress */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span>Diagnostic Score Trend</span>
                </h3>
                <div className="h-80 w-full text-xs font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" unit="%" domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                      <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2.5} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Answer Distribution Chart */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  <span>Correct Key Breakdown</span>
                </h3>
                <div className="h-80 w-full text-xs font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="questions" name="Total Questions" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="correct" name="Correct Answers" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* General Telemetry Summary */}
            <div className="bg-slate-100/50 border border-slate-200 rounded-xl p-6 text-xs text-slate-500">
              <span className="block font-bold text-slate-800 uppercase tracking-widest text-[10px] mb-2">FastAPI Integration Guidance</span>
              <p className="leading-relaxed font-sans text-slate-500">
                This page parses live scores dynamically from your browser context. Once your FastAPI backend is running and writing attempts records, the charting components will auto-refresh to reflect clinical telemetry stored inside your real PostgreSQL instance.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
