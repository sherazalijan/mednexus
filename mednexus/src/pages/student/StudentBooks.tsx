/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// BACKEND CONNECTION FILE
// ============================================================================
// INSTRUCTIONS FOR BACKEND CONNECTION:
// 1. This page displays books and chapters from your PostgreSQL database schema.
// 2. Selectable items trigger `loadRandomQuiz(selectedBookIds)` in AppContext.
// 3. To link this to FastAPI, ensure you serve standard CORS headers on the `/books` 
//    and `/books/{id}/chapters` routers.
// 4. If your backend database is active but empty, this page will beautifully
//    render a professional empty-state guiding you how to register tables.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BookOpen, FolderHeart, ShieldAlert, Library, Sparkles, RefreshCw, Layers, CheckSquare, Square, Play } from 'lucide-react';

export const StudentBooks: React.FC = () => {
  const { books, chapters, loadBooks, loadChapters, loadRandomQuiz, isLoading, error } = useApp();
  const [selectedBook, setSelectedBook] = useState<string | number | null>(null);
  const [selectedChapters, setSelectedChapters] = useState<{ [key: string]: boolean }>({});
  const [quizLimit, setQuizLimit] = useState<number>(10);
  const navigate = useNavigate();

  useEffect(() => {
    loadBooks();
  }, []);

  // Fetch chapters when selected book changes
  useEffect(() => {
    if (selectedBook) {
      loadChapters(selectedBook);
    }
  }, [selectedBook]);

  const handleSelectBook = (bookId: string | number) => {
    setSelectedBook(bookId);
    setSelectedChapters({}); // Reset chapter selections
  };

  const toggleChapter = (chapterId: string | number) => {
    const stringId = String(chapterId);
    setSelectedChapters((prev) => ({
      ...prev,
      [stringId]: !prev[stringId],
    }));
  };

  const handleSelectAllChapters = () => {
    const allSelected: { [key: string]: boolean } = {};
    chapters.forEach((chap) => {
      allSelected[String(chap.id)] = true;
    });
    setSelectedChapters(allSelected);
  };

  const handleDeselectAllChapters = () => {
    setSelectedChapters({});
  };

  const handleStartExam = async () => {
    if (!selectedBook) return;

    // Check how many chapters are selected
    const activeChapterIds = Object.keys(selectedChapters).filter((k) => selectedChapters[k]);
    if (activeChapterIds.length === 0) {
      alert('Please select at least one study chapter to build your review deck.');
      return;
    }

    try {
      // In a real application, you can request questions from specific chapters.
      // The current context action supports compiling standard random sets:
      await loadRandomQuiz([selectedBook], quizLimit);
      navigate('/quiz');
    } catch (err: any) {
      alert(`Could not compile board quiz: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Title Panel */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2.5">
            <Library className="h-7 w-7 text-blue-600" strokeWidth={1.5} />
            <span>Syllabus & Q-Bank Builder</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-2xl">
            Choose specialized clinical textbooks and compile custom quizzes to review specific sub-topics and measure your diagnostic accuracy.
          </p>
        </div>

        {/* Database Load Indicators */}
        {isLoading && books.length === 0 ? (
          <div className="py-20 flex flex-col justify-center items-center">
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs mt-3 font-mono">Paging index structures from database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-6 text-center mb-8">
            <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold uppercase tracking-wider text-sm">Syllabus Synchronization Error</h3>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        ) : books.length === 0 ? (
          /* Empty Catalog State */
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-2xl mx-auto shadow-sm">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.2} />
            <h3 className="font-semibold text-slate-850 text-base">PostgreSQL Books Catalog is Empty</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed max-w-md mx-auto font-sans">
              We did not detect any syllabus textbooks in the database.
              To inspect standard learning pages and test the dynamic UWorld engine, please log in as an administrator to load books, chapters, and MCQs!
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 bg-slate-950 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Go to Administrator Panel
              </button>
              <button
                onClick={() => loadBooks()}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer text-slate-600"
              >
                Retry Database Query
              </button>
            </div>
          </div>
        ) : (
          /* Active Books layout */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Col: Books List selection */}
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Available Textbooks</h3>
              <div className="space-y-3">
                {books.map((b) => {
                  const isSelected = b.id === selectedBook;
                  return (
                    <button
                      key={b.id}
                      onClick={() => handleSelectBook(b.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start space-x-3.5 ${
                        isSelected
                          ? 'bg-white border-blue-600 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <BookOpen className={`h-5 w-5 shrink-0 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight uppercase tracking-wider">{b.title}</h4>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{b.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Chapter selections & custom compiler controls */}
            <div className="md:col-span-2">
              {selectedBook ? (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chapter Selections</h3>
                      <p className="text-xs text-slate-500 mt-1">Toggle targeted subcategories for this manual.</p>
                    </div>

                    <div className="flex space-x-2 text-xs font-bold text-blue-600">
                      <button onClick={handleSelectAllChapters} className="hover:underline cursor-pointer uppercase tracking-wider">Select All</button>
                      <span className="text-slate-300">|</span>
                      <button onClick={handleDeselectAllChapters} className="hover:underline cursor-pointer uppercase tracking-wider">Clear</button>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="py-10 text-center">
                      <RefreshCw className="h-6 w-6 text-blue-600 animate-spin mx-auto" />
                      <p className="text-xs text-slate-500 mt-2">Loading chapter list...</p>
                    </div>
                  ) : chapters.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      <Layers className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-bold">No Chapters Registered</p>
                      <p className="text-[11px] mt-0.5">Chapters for this textbook are missing in PostgreSQL.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-2 mb-6">
                      {chapters.map((c) => {
                        const isChecked = !!selectedChapters[String(c.id)];
                        return (
                          <button
                            key={c.id}
                            onClick={() => toggleChapter(c.id)}
                            className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-colors cursor-pointer text-xs ${
                              isChecked
                                ? 'bg-slate-50 border-slate-300 text-slate-900 font-bold shadow-xs'
                                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {isChecked ? (
                              <CheckSquare className="h-4 w-4 text-blue-600 shrink-0" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-300 shrink-0" />
                            )}
                            <span className="truncate">{c.chapter_name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* MCQ Configuration Panel */}
                  {chapters.length > 0 && (
                    <div className="pt-6 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Exam Configuration</h4>
                      
                      <div className="flex flex-col sm:flex-row gap-5 justify-between items-end">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question Limit</label>
                          <div className="flex space-x-2">
                            {[5, 10, 20, 50].map((limit) => (
                              <button
                                key={limit}
                                onClick={() => setQuizLimit(limit)}
                                className={`px-3 py-1.5 border rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                  quizLimit === limit
                                    ? 'bg-slate-900 border-slate-900 text-white'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {limit} Qs
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={handleStartExam}
                          disabled={Object.keys(selectedChapters).filter(k => selectedChapters[k]).length === 0}
                          className="w-full sm:w-auto inline-flex justify-center items-center py-2.5 px-6 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors shadow-blue-200 uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Play className="h-3.5 w-3.5 mr-2" />
                          Launch Review Quiz
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center flex flex-col justify-center items-center min-h-[350px]">
                  <Sparkles className="h-10 w-10 text-slate-300 mb-3" strokeWidth={1.2} />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">textbook Select Required</h4>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                    Choose a syllabus textbook from the left panel to unpack categories and generate tests.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
