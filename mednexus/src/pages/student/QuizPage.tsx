/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// BACKEND CONNECTION FILE
// ============================================================================
// INSTRUCTIONS FOR BACKEND CONNECTION:
// 1. This file accesses your MCQ questions from `quizQuestions` in `AppContext`.
// 2. These questions are populated via your PostgreSQL `mcqs` table.
// 3. Make sure that when the student completes the quiz, it sends the attempt metrics
//    to FastAPI using `submitQuiz(correctCount, totalQuestions, quizType)`.
// 4. FastAPI will store these stats inside your `quiz_attempts` PostgreSQL table!
// 5. Be extremely cautious with the field names (question, option_a, option_b, etc.).
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AlertCircle, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Timer, Award, BookOpen, LogOut } from 'lucide-react';

export const QuizPage: React.FC = () => {
  const { quizQuestions, submitQuiz, isLoading, error } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: 'A' | 'B' | 'C' | 'D' }>({});
  const [timer, setTimer] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  // Run timer for UWorld-style elapsed testing
  useEffect(() => {
    if (quizQuestions.length === 0 || isSubmitted) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizQuestions, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
        <p className="mt-4 text-sm text-[#1E293B] font-medium font-sans">Retrieving board exam MCQs from database...</p>
      </div>
    );
  }

  // Handle empty state: if no quiz questions are loaded or selected
  if (!quizQuestions || quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white p-8 border border-slate-200 rounded-lg shadow-sm text-center">
          <BookOpen className="h-12 w-12 text-[#2563EB] mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-bold text-[#0F172A] font-sans">No Quiz Questions Available</h2>
          <p className="mt-2 text-sm text-slate-500 mb-6">
            You must first select books and chapters in the Books catalog to compile a dynamic exam review.
          </p>
          <div className="p-4 bg-slate-50 rounded text-left border border-slate-100 text-xs mb-6 space-y-2 text-slate-600">
            <span className="font-semibold text-slate-800">FastAPI Connection Context:</span>
            <p>Ensure the PostgreSQL database contains active rows in the <code className="bg-slate-200 px-1 rounded">mcqs</code> table connected to chapters.</p>
          </div>
          <button
            onClick={() => navigate('/books')}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0F172A] hover:bg-[#1E293B] cursor-pointer"
          >
            Go to Book Catalog
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentIndex];
  const isAnswered = selectedAnswers[currentIndex] !== undefined;
  const userAnswer = selectedAnswers[currentIndex];
  const correctAnswer = currentQuestion.correct_answer;

  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return; // Prevent changing answer after locked
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: option,
    });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_answer) {
        correct += 1;
      }
    });
    return {
      correct,
      total: quizQuestions.length,
      percentage: Math.round((correct / quizQuestions.length) * 100),
    };
  };

  const handleSubmitQuiz = async () => {
    const score = calculateScore();
    // Prompt confirmation if some questions are unanswered
    const unansweredCount = quizQuestions.length - Object.keys(selectedAnswers).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }

    setIsSubmitted(true);
    // submitQuiz stores in DB/localStorage and handles loading
    await submitQuiz(score.correct, score.total, 'Custom Board Quiz');
    navigate('/result', { state: { score, selectedAnswers, elapsedSeconds: timer } });
  };

  // Option background helper
  const getOptionStyle = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!isAnswered) {
      return 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white text-slate-700 shadow-sm';
    }

    const isCurrentOption = userAnswer === option;
    const isCorrectOption = correctAnswer === option;

    if (isCorrectOption) {
      return 'border-emerald-500 bg-emerald-50 text-slate-800 font-medium';
    }
    if (isCurrentOption) {
      return 'border-rose-500 bg-rose-50 text-slate-800 font-medium';
    }
    return 'border-slate-100 bg-white text-slate-400 opacity-50';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Quiz Header Bar */}
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold tracking-tight text-slate-900">Med<span className="text-blue-600">Nexus</span> <span className="text-sm font-medium text-slate-500 ml-1.5">Exam Room</span></span>
          <span className="h-4 w-px bg-slate-200"></span>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Quiz Mode</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-slate-700 font-mono text-sm bg-slate-50 px-3 py-1.5 border border-slate-100 rounded-lg shadow-sm">
            <Timer className="h-4 w-4 text-blue-600" />
            <span className="font-bold">{formatTime(timer)}</span>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Do you want to abandon this active quiz? Your progress will be lost.')) {
                navigate('/books');
              }
            }}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-all cursor-pointer flex items-center space-x-1 hover:bg-slate-50 px-2.5 py-1.5 rounded-md border border-transparent hover:border-slate-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Quit Exam</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col lg:flex-row gap-8 p-6 lg:p-8">
        {/* MCQ Workstation */}
        <main className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                QUESTION {currentIndex + 1} OF {quizQuestions.length}
              </span>
              <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 font-mono border border-slate-200/50">
                {currentQuestion.page_number ? `Page Ref: ${currentQuestion.page_number}` : 'Board Standard'}
              </span>
            </div>

            {/* MCQ Question Text */}
            <h2 className="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed mb-8">
              {currentQuestion.question}
            </h2>

            {/* MCQ Options */}
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                const text = letter === 'A' ? currentQuestion.option_a
                           : letter === 'B' ? currentQuestion.option_b
                           : letter === 'C' ? currentQuestion.option_c
                           : currentQuestion.option_d;

                const isCurrentOption = userAnswer === letter;
                const isCorrectOption = correctAnswer === letter;

                let circleStyle = 'bg-slate-100 text-slate-500 font-bold';
                if (isAnswered) {
                  if (isCorrectOption) circleStyle = 'bg-emerald-500 text-white font-bold';
                  else if (isCurrentOption) circleStyle = 'bg-rose-500 text-white font-bold';
                  else circleStyle = 'bg-slate-100 text-slate-300 font-normal';
                }

                return (
                  <button
                    key={letter}
                    onClick={() => handleSelectOption(letter)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center cursor-pointer ${getOptionStyle(letter)}`}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 text-sm shrink-0 transition-all ${circleStyle}`}>
                      {letter}
                    </div>
                    <span className="font-medium flex-1 text-sm md:text-base leading-snug">{text}</span>
                  </button>
                );
              })}
            </div>

            {/* MCQ Explanation Box */}
            {isAnswered && (
              <div className="mt-8 p-6 bg-slate-50 border-l-4 border-blue-500 rounded-r-xl overflow-y-auto max-h-72 shadow-sm animate-fade-in">
                <div className="flex items-center space-x-2 text-sm font-bold uppercase tracking-wider mb-3">
                  {userAnswer === correctAnswer ? (
                    <span className="text-emerald-600 flex items-center space-x-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Correct Answer Explanation</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center space-x-1.5">
                      <XCircle className="h-4 w-4" />
                      <span>Incorrect. Explanation Below:</span>
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-sans whitespace-pre-line">
                  {currentQuestion.explanation}
                </p>
                {currentQuestion.page_number && (
                  <div className="mt-4 flex gap-4 text-[10px] font-bold text-slate-400 uppercase font-mono">
                     <span>Page Ref: {currentQuestion.page_number}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-xs uppercase tracking-wide transition-all shadow-sm flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1.5" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === quizQuestions.length - 1}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-xs uppercase tracking-wide transition-all shadow-sm flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1.5" />
              </button>
            </div>

            <button
              onClick={handleSubmitQuiz}
              className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors shadow-blue-200 text-xs uppercase tracking-wider"
            >
              Submit Quiz
            </button>
          </div>
        </main>

        {/* Sidebar Question Navigator */}
        <aside className="w-full lg:w-72 bg-white border border-slate-200 rounded-xl shadow-sm p-6 h-fit sticky lg:top-24 flex flex-col">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Navigation</h3>
            <div className="grid grid-cols-5 gap-2">
              {quizQuestions.map((_, idx) => {
                const answered = selectedAnswers[idx] !== undefined;
                const isCurrent = idx === currentIndex;
                
                let tileStyle = 'bg-white text-slate-400 border-slate-200 hover:border-slate-300';
                if (isCurrent) {
                  tileStyle = 'bg-slate-800 text-white border-transparent';
                } else if (answered) {
                  tileStyle = 'bg-blue-50 text-blue-600 border-blue-200 font-bold';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 flex items-center justify-center rounded border text-xs font-semibold transition-all cursor-pointer ${tileStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-lg">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status Summary</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Answered:</span>
                  <span className="font-bold text-slate-700">{Object.keys(selectedAnswers).length} / {quizQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remaining:</span>
                  <span className="font-bold text-slate-700">{quizQuestions.length - Object.keys(selectedAnswers).length}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
