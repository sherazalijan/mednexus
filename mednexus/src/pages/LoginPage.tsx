import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, AlertCircle, RefreshCw } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setInputError(null);
    clearError();

    if (!email || !password) {
      setInputError('Please enter your email and password.');
      return;
    }

    try {
      const user = await login(email, password);

if (email.toLowerCase() === 'admin@sk23.com') {
  navigate('/admin/dashboard');
} else {
  navigate('/dashboard');
}
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center items-center space-x-3 text-slate-900 mb-2">
          <Shield className="h-10 w-10 text-blue-600" strokeWidth={1.5} />
          <span className="text-3xl font-extrabold tracking-tight">
            Med<span className="text-blue-600">Nexus</span>
          </span>
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Learn. Practice. Master Medicine.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            {(inputError || error) && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {inputError || error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 font-mono">
        © 2026 MedNexus. All Rights Reserved.
      </div>
    </div>
  );
};