/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, Chapter, MCQ, User, QuizAttempt, LeaderboardEntry } from '../types';
import { bookService, chapterService, quizService, authService, userService, adminService } from '../services/api';

interface AppContextType {
  currentUser: User | null;
  books: Book[];
  chapters: Chapter[];
  quizQuestions: MCQ[];
  history: QuizAttempt[];
  leaderboard: LeaderboardEntry[];
  users: User[];
  
  isLoading: boolean;
  error: string | null;
  apiConnected: boolean; 
  
  login: (email: string, passwordHash: string) => Promise<User>;
  logout: () => Promise<void>;
  
  loadBooks: () => Promise<void>;
  loadChapters: (bookId: string | number) => Promise<void>;
  loadRandomQuiz: (bookIds: (string | number)[], limit?: number) => Promise<void>;
  submitQuiz: (correctCount: number, totalQuestions: number, quizType: string) => Promise<QuizAttempt | null>;
  loadHistory: () => Promise<void>;
  loadUsers: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  
  addBook: (title: string, description: string) => Promise<Book>;
  addChapter: (bookId: string | number, name: string) => Promise<Chapter>;
  addMCQ: (mcq: Omit<MCQ, 'id' | 'created_at'>) => Promise<MCQ>;
  addUser: (fullName: string, email: string, role: 'admin' | 'student') => Promise<User>;
  updateUserStatus: (userId: string | number, status: 'active' | 'pending' | 'suspended') => Promise<void>;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<MCQ[]>([]);
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  // BUG FIX 1: Wrapping the initial load in a try/catch so corrupted local storage doesn't cause a White Screen of Death
  useEffect(() => {
    try {
      console.log("AppContext: Attempting to load user from storage...");
      const user = authService.getCurrentUser();
      if (user) {
        console.log("AppContext: User found!", user);
        setCurrentUser(user);
      } else {
        console.log("AppContext: No user logged in.");
      }
    } catch (err) {
      console.error("AppContext: CRITICAL ERROR loading user:", err);
      // If storage is corrupted, nuke it so the app can recover
      localStorage.removeItem('user');
      setCurrentUser(null);
    }
  }, []);

  const clearError = () => setError(null);

  // BUG FIX 2: Fixed the broken fallback logic that was calling the failing operation twice
  const executeLoad = async <T,>(
    label: string,
    operation: () => Promise<T>,
    setter: (data: T) => void
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operation();
      setter(result);
      setApiConnected(true);
    } catch (err: any) {
      console.error(`[API] ${label} failed:`, err.message);
      setApiConnected(false);
      setError(err.message || `Failed to fetch ${label}`);
      // Removed the duplicate try/catch block that was recursively throwing errors
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, passwordHash: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.login(email, passwordHash);
      setCurrentUser(user);
      return user;
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      setCurrentUser(null);
      setChapters([]);
      setQuizQuestions([]);
      setHistory([]);
    }
  };

  // ... (All the load functions remain the same, they are perfectly fine)
  const loadBooks = async () => await executeLoad('Books', () => bookService.getBooks(), setBooks);
  const loadChapters = async (bookId: string | number) => await executeLoad('Chapters', () => chapterService.getChapters(bookId), setChapters);
  const loadRandomQuiz = async (bookIds: (string | number)[], limit = 10) => await executeLoad('Random Quiz', () => quizService.getRandomQuiz({ book_ids: bookIds, limit }), setQuizQuestions);
  
  const submitQuiz = async (correctCount: number, totalQuestions: number, quizType: string): Promise<QuizAttempt | null> => {
    if (!currentUser) return null;
    setIsLoading(true);
    setError(null);
    try {
      const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const attempt = await quizService.submitQuizAttempt({
        user_id: currentUser.id,
        quiz_type: quizType,
        total_questions: totalQuestions,
        correct_answers: correctCount,
        score_percentage: scorePercentage,
      });
      await loadHistory();
      await loadLeaderboard();
      return attempt;
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz results');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!currentUser) return;
    await executeLoad('Quiz History', () => quizService.getHistory(currentUser.id), setHistory);
  };
  const loadUsers = async () => await executeLoad('Users', () => adminService.getAllUsers(), setUsers);
  const loadLeaderboard = async () => await executeLoad('Leaderboard', () => userService.getLeaderboard(), setLeaderboard);

  const addBook = async (title: string, description: string): Promise<Book> => {
    setIsLoading(true);
    try {
      const newBook = await bookService.createBook({ title, description });
      await loadBooks();
      return newBook;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addChapter = async (bookId: string | number, name: string): Promise<Chapter> => {
    setIsLoading(true);
    try {
      const newChap = await chapterService.createChapter(bookId, name);
      await loadChapters(bookId);
      return newChap;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addMCQ = async (mcq: Omit<MCQ, 'id' | 'created_at'>): Promise<MCQ> => {
    setIsLoading(true);
    try {
      return await quizService.createMCQ(mcq);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (fullName: string, email: string, role: 'admin' | 'student'): Promise<User> => {
    setIsLoading(true);
    try {
      const newUser = await adminService.createUser({ full_name: fullName, email, role, account_status: 'active' });
      await loadUsers();
      return newUser;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId: string | number, status: 'active' | 'pending' | 'suspended') => {
    setIsLoading(true);
    try {
      await adminService.updateUserStatus(userId, status);
      await loadUsers();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, books, chapters, quizQuestions, history, leaderboard, users,
        isLoading, error, apiConnected, login, logout, loadBooks, loadChapters,
        loadRandomQuiz, submitQuiz, loadHistory, loadUsers, loadLeaderboard,
        addBook, addChapter, addMCQ, addUser, updateUserStatus, clearError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};