
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// BACKEND CONNECTION FILE
// ============================================================================
// INSTRUCTIONS FOR BACKEND CONNECTION:
// 1. This admin module manages the PostgreSQL `users` table via `adminService`.
// 2. The function `loadUsers()` pulls all registers.
// 3. Make sure to bind status changes (`updateUserStatus`) to a real PATCH API call.
// 4. Protect your backend REST routes so that only authorized accounts with 
//    `role = 'admin'` can execute user management scripts!
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, UserPlus, ShieldAlert, CheckCircle, Ban, Mail, RefreshCw, AlertCircle } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { users, loadUsers, addUser, updateUserStatus, isLoading, error } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'student'>('student');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName || !email) {
      setFormError('All fields must be fully populated.');
      return;
    }

    try {
      await addUser(fullName, email, role);
      setFullName('');
      setEmail('');
      setRole('student');
      setShowAddForm(false);
    } catch (err: any) {
      setFormError(err.message || 'User creation failed.');
    }
  };

  const handleStatusChange = async (
  userId: string | number,
  currentStatus: string
) => {
  console.log("userId =", userId);
  console.log("currentStatus =", currentStatus);

  const nextStatus = currentStatus === 'active'
    ? 'disabled'
    : 'active';

  try {
    await updateUserStatus(userId, nextStatus as any);
  } catch (err: any) {
    alert(`Could not patch status: ${err.message}`);
  }
};

  // Render Status Badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </span>
        );
      case 'disabled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <Ban className="h-3 w-3 mr-1" />
            Disabled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2.5">
              <Users className="h-7 w-7 text-blue-600" />
              <span>User Base Management</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xl">
              Audit registration histories, toggle permissions, and create secure profiles.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center py-2.5 px-5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors shadow-blue-200 uppercase tracking-wider cursor-pointer"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Secure Profile
          </button>
        </div>

        {/* Create Profile Overlay Form */}
        {showAddForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mb-8 max-w-xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Register New System Account</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Gregory House"
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Medical Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="house@mednexus.com"
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Account Role</label>
                <div className="flex space-x-6 mt-1.5">
                  <label className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      checked={role === 'student'}
                      onChange={() => setRole('student')}
                      className="form-radio text-blue-600 focus:ring-blue-600 h-4 w-4 border-slate-300"
                    />
                    <span className="ml-2">Student Scholar</span>
                  </label>
                  <label className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                      className="form-radio text-blue-600 focus:ring-blue-600 h-4 w-4 border-slate-300"
                    />
                    <span className="ml-2">Administrator</span>
                  </label>
                </div>
              </div>

              {formError && (
                <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{formError}</p>
              )}

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Database Content Area */}
        {isLoading ? (
          <div className="py-20 flex flex-col justify-center items-center">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs mt-3 font-mono">Quering credentials database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-6 text-center">
            <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold uppercase tracking-wider text-sm">Database Query Failed</h3>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm max-w-xl mx-auto">
            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.2} />
            <h3 className="font-semibold text-slate-800 text-base">No Users registered</h3>
            <p className="text-xs text-slate-400 mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
              The users collection is currently empty.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th scope="col" className="px-6 py-4">User Info</th>
                    <th scope="col" className="px-6 py-4">Security Role</th>
                    <th scope="col" className="px-6 py-4">Account Status</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold font-sans border border-slate-200 text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight text-xs">{u.name}</p>
                            <p className="text-[10px] text-slate-400 flex items-center mt-1 font-mono">
                              <Mail className="h-3 w-3 mr-1 shrink-0" />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-[10px]">
                        <span className={`px-2 py-0.5 rounded-md font-bold border-2 ${
                          u.role === 'admin' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(u.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <button
                          onClick={() => handleStatusChange(u.id, u.status)}
                          className={`inline-flex items-center font-bold cursor-pointer text-xs uppercase tracking-wider ${
                            u.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'
                          }`}
                        >
                          {u.status === 'active' ? 'Disable' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

