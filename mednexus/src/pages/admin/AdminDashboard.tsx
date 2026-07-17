/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// BACKEND CONNECTION NOTICE:
// 1. This is the administrator's operational control room.
// 2. Statistics and chapter parsing queues are populated from PostgreSQL via `adminService`.
// 3. To link PDF MCQ extraction pipelines, configure a background Celery worker on FastAPI
//    that alters the statuses inside your chapters schema!
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { adminService } from '../../services/api';
import { MCQExtractionStatus } from '../../types';
import { Shield, Users, BookOpen, Layers, BarChart3, HelpCircle, FileText, CheckCircle, Clock, PlayCircle, LogOut, RefreshCw } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser, logout } = useApp();
  const [stats, setStats] = useState<{
    total_users: number;
    total_books: number;
    total_chapters: number;
    total_mcqs: number;
    total_attempts: number;
    average_score: number;
  } | null>(null);
  
  const [extractions, setExtractions] = useState<MCQExtractionStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadAdminMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getAnalytics();
      setStats(data);
      const queue = await adminService.getMCQExtractionStatus();
      setExtractions(queue);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminMetrics();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getStatusBadge = (status: 'idle' | 'extracting' | 'completed' | 'failed') => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'extracting':
        return 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'idle':
      default:
        return 'bg-slate-50 border-slate-200 text-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      
      {/* Top Admin Navigation Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold font-sans tracking-tight text-slate-900">MedNexus Admin Operations</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Drawer Navigation (Management Panel Theme) */}
        <nav className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 h-fit space-y-2.5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Admin Subsystems</h3>
          
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-full text-left px-4 py-3 rounded-xl font-bold text-xs bg-slate-900 text-white flex items-center space-x-2 cursor-pointer uppercase tracking-wider"
          >
            <Shield className="h-4 w-4 shrink-0 text-blue-500" />
            <span>Control Dashboard</span>
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="w-full text-left px-4 py-3 rounded-xl font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center space-x-2 border border-transparent hover:border-slate-100 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Users className="h-4 w-4 text-slate-400 shrink-0" />
            <span>User Base Manager</span>
          </button>

          <button
            onClick={() => navigate('/admin/books')}
            className="w-full text-left px-4 py-3 rounded-xl font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center space-x-2 border border-transparent hover:border-slate-100 transition-all cursor-pointer uppercase tracking-wider"
          >
            <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Syllabus & MCQ Creator</span>
          </button>

          <button
            onClick={() => navigate('/admin/analytics')}
            className="w-full text-left px-4 py-3 rounded-xl font-bold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center space-x-2 border border-transparent hover:border-slate-100 transition-all cursor-pointer uppercase tracking-wider"
          >
            <BarChart3 className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Analytical Statistics</span>
          </button>
        </nav>

        {/* Right Content Stream */}
        <main className="lg:col-span-3 space-y-8">
          
          {/* Main Console Welcome Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex justify-between items-center shadow-sm">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Syllabus Command Center</h2>
              <p className="text-xs text-slate-500 mt-1">
                You are authenticated as <span className="font-semibold text-slate-700">{currentUser?.full_name}</span>. Oversee exam pipelines below.
              </p>
            </div>
            <button
              onClick={loadAdminMetrics}
              className="p-2.5 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Database Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Users</span>
              <span className="block text-2xl font-mono font-bold text-slate-900 mt-1">{stats?.total_users ?? 0}</span>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Books Registered</span>
              <span className="block text-2xl font-mono font-bold text-slate-900 mt-1">{stats?.total_books ?? 0}</span>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exam Questions</span>
              <span className="block text-2xl font-mono font-bold text-slate-900 mt-1">{stats?.total_mcqs ?? 0}</span>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cumulative Avg</span>
              <span className="block text-2xl font-mono font-bold text-slate-900 mt-1">{stats?.average_score ?? 0}%</span>
            </div>

          </div>

          {/* MCQ Extraction Status ( Parser Queue Logs ) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">MCQ Extraction Queue</h3>
                <p className="text-xs text-slate-500 mt-1">Automated parsing status for registered syllabus chapters.</p>
              </div>
            </div>

            {extractions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" strokeWidth={1.2} />
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">No Parser Logs Detected</h4>
                <p className="mt-1.5 max-w-xs mx-auto text-[11px] text-slate-400">
                  Chapters with questions must be compiled before extraction queue records display. Start by adding chapters in the Syllabus Manager.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {extractions.map((ex) => (
                  <div key={ex.chapter_id} className="py-3.5 flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4.5 w-4.5 text-slate-400" />
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">{ex.chapter_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">CHAPTER ID: {ex.chapter_id}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="font-mono text-slate-600">{ex.total_mcqs} parsed MCQs</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border font-semibold text-[10px] uppercase tracking-wider ${getStatusBadge(ex.status)}`}>
                        {ex.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};
