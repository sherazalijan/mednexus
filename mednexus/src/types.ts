/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// BACKEND CONNECTION NOTICE:
// These models and types exactly match the PostgreSQL database tables used by your FastAPI backend.
// Do NOT rename these fields, as they are fully aligned with your database schema!
// ============================================================================

export interface Book {
  id: string | number;
  title: string;
  description: string;
  created_at: string;
}

export interface Chapter {
  id: string | number;
  book_id: string | number;
  chapter_name: string;
  created_at: string;
}

export interface MCQ {
  id: string | number;
  chapter_id: string | number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  page_number: number | null;
  created_at: string;
}

export interface User {
  id: string | number;
  full_name: string;
  email: string;
  password_hash?: string; // Kept secure on backend, optional on frontend
  role: 'admin' | 'student';
  account_status: 'active' | 'pending' | 'suspended';
  created_at: string;
}

export interface QuizAttempt {
  id: string | number;
  user_id: string | number;
  quiz_type: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  completed_at: string;
}

export interface LeaderboardEntry {
  user_id: string | number;
  full_name: string;
  score_percentage: number;
  total_attempts: number;
  rank: number;
}

export interface MCQExtractionStatus {
  chapter_id: string | number;
  chapter_name: string;
  status: 'idle' | 'extracting' | 'completed' | 'failed';
  total_mcqs: number;
  last_updated: string;
}
