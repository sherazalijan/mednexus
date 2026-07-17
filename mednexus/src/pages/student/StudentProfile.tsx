/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// BACKEND CONNECTION NOTICE:
// 1. This file renders profile metadata of the current authorized user.
// 2. These fields correlate directly to your `users` PostgreSQL table.
// 3. To update user details, hook up a PATCH or PUT `/users/{id}` endpoint in your FastAPI backend!
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Award, User, Mail, ShieldAlert, Key, Calendar, RefreshCw } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { currentUser, isLoading } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation Action */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50/60 border border-blue-100 hover:border-blue-200 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            ← Back to dashboard
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-slate-900 px-6 py-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-white/10 text-white rounded-full border border-white/20 flex items-center justify-center font-bold text-2xl">
                {currentUser?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl font-bold tracking-tight">{currentUser?.full_name}</h1>
                <p className="text-xs text-slate-300 mt-1 uppercase font-mono font-semibold tracking-widest">{currentUser?.role} account</p>
              </div>
            </div>

            <span className="px-3 py-1 bg-green-500/25 border border-green-500/20 text-green-300 rounded-full text-xs font-semibold flex items-center uppercase tracking-wider">
              {currentUser?.account_status} Status
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Account Credentials</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Email</span>
                  <span className="text-slate-800 mt-0.5 font-mono">{currentUser?.email}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Key className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">System ID</span>
                  <span className="text-slate-800 mt-0.5 font-mono">{currentUser?.id}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created On</span>
                  <span className="text-slate-800 mt-0.5 font-mono">
                    {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'Active Member'}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Award className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Syllabus Access</span>
                  <span className="text-slate-800 mt-0.5 font-sans">Full Clinical Catalog (AMBOSS & UWorld Compatible)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-500 shadow-sm">
          <span className="block font-bold text-slate-700 mb-1.5 flex items-center">
            <ShieldAlert className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            FastAPI Backend Instructions:
          </span>
          <p className="leading-relaxed">
            Ensure users authentication runs on HTTPS. Once your database is operational, password hashes should be updated over the API via <code className="bg-slate-200 px-1 rounded text-[10px]">authService.updateCredentials</code>.
          </p>
        </div>

      </div>
    </div>
  );
};
