import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import { LoginPage } from './pages/LoginPage';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentBooks } from './pages/student/StudentBooks';
import { StudentHistory } from './pages/student/StudentHistory';
import { StudentProfile } from './pages/student/StudentProfile';
import { QuizPage } from './pages/student/QuizPage';
import { ResultPage } from './pages/student/ResultPage';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminBooks } from './pages/admin/AdminBooks';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Student */}
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/books" element={<StudentBooks />} />
          <Route path="/history" element={<StudentHistory />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/result" element={<ResultPage />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/books" element={<AdminBooks />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}