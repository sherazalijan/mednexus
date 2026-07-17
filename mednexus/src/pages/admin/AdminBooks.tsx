/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// BACKEND CONNECTION NOTICE:
// 1. This is the administrator's syllabus and MCQ database compiler.
// 2. These functions interface with `books`, `chapters` and `mcqs` in PostgreSQL.
// 3. To link this to your FastAPI backend, map the forms to:
//    - POST `/books`
//    - POST `/books/{book_id}/chapters`
//    - POST `/chapters/{chapter_id}/mcqs`
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RefreshCw, BookOpen, Layers, HelpCircle, Plus, Sparkles, FolderPlus, ArrowRight, Check } from 'lucide-react';

export const AdminBooks: React.FC = () => {
  const { books, chapters, loadBooks, loadChapters, addBook, addChapter, addMCQ, isLoading, error } = useApp();
  
  // Book creation state
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookDesc, setNewBookDesc] = useState('');
  
  // Selected Book context for adding chapters
  const [selectedBookId, setSelectedBookId] = useState<string | number | null>(null);
  const [newChapterName, setNewChapterName] = useState('');

  // Chapter selected context for adding MCQs
  const [selectedChapterId, setSelectedChapterId] = useState<string | number | null>(null);

  // MCQ creation state
  const [mcqQuestion, setMcqQuestion] = useState('');
  const [mcqA, setMcqA] = useState('');
  const [mcqB, setMcqB] = useState('');
  const [mcqC, setMcqC] = useState('');
  const [mcqD, setMcqD] = useState('');
  const [mcqCorrect, setMcqCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [mcqExplanation, setMcqExplanation] = useState('');
  const [mcqPage, setMcqPage] = useState<number>(1);

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (selectedBookId) {
      loadChapters(selectedBookId);
      setSelectedChapterId(null);
    }
  }, [selectedBookId]);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle || !newBookDesc) return;
    try {
      const book = await addBook(newBookTitle, newBookDesc);
      setSelectedBookId(book.id);
      setNewBookTitle('');
      setNewBookDesc('');
      triggerFeedback('Book registered successfully!');
    } catch (err) {
      triggerFeedback('Error registering book.');
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !newChapterName) return;
    try {
      await addChapter(selectedBookId, newChapterName);
      setNewChapterName('');
      triggerFeedback('Chapter added successfully!');
    } catch (err) {
      triggerFeedback('Error adding chapter.');
    }
  };

  const handleCreateMCQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterId || !mcqQuestion || !mcqA || !mcqB || !mcqC || !mcqD || !mcqExplanation) {
      alert('Please fill out all MCQ fields');
      return;
    }
    try {
      await addMCQ({
        chapter_id: selectedChapterId,
        question: mcqQuestion,
        option_a: mcqA,
        option_b: mcqB,
        option_c: mcqC,
        option_d: mcqD,
        correct_answer: mcqCorrect,
        explanation: mcqExplanation,
        page_number: mcqPage || null,
      });

      // Reset Q fields
      setMcqQuestion('');
      setMcqA('');
      setMcqB('');
      setMcqC('');
      setMcqD('');
      setMcqExplanation('');
      setMcqCorrect('A');
      triggerFeedback('Exam MCQ written to PostgreSQL successfully!');
    } catch (err) {
      triggerFeedback('Error compiling MCQ.');
    }
  };

  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Title Board */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-blue-600" strokeWidth={1.5} />
            <span>Syllabus & MCQ Compiler</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xl">
            Build specialized medical syllabus volumes, define teaching chapters, and append parsed MCQs.
          </p>
        </div>

        {feedback && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center shadow-xs">
            <Check className="h-4 w-4 mr-2 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Add/Select Book */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 h-fit">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <FolderPlus className="h-4 w-4 text-blue-600" />
                <span>Add Syllabus Book</span>
              </h3>
              <form onSubmit={handleCreateBook} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Book Title</label>
                  <input
                    type="text"
                    required
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    placeholder="e.g. Harrison's Internal Medicine"
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    required
                    rows={2}
                    value={newBookDesc}
                    onChange={(e) => setNewBookDesc(e.target.value)}
                    placeholder="Brief description of board content..."
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-950 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Register Book Volume
                </button>
              </form>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Active Volumes</h3>
              {books.length === 0 ? (
                <p className="text-[11px] text-slate-400">No textbook books compiled yet.</p>
              ) : (
                <div className="space-y-2">
                  {books.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBookId(b.id)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 text-xs flex justify-between items-center transition-all cursor-pointer ${
                        b.id === selectedBookId
                          ? 'border-blue-600 bg-white font-bold shadow-xs text-slate-900'
                          : 'border-slate-100 bg-slate-50 hover:bg-slate-100/80 text-slate-600'
                      }`}
                    >
                      <span className="truncate">{b.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Chapters under selected Book */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 h-fit">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Chapter Manager</span>
            </h3>

            {selectedBookId ? (
              <div className="space-y-5">
                <form onSubmit={handleCreateChapter} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Chapter Name</label>
                    <input
                      type="text"
                      required
                      value={newChapterName}
                      onChange={(e) => setNewChapterName(e.target.value)}
                      placeholder="e.g. Chapter 4: Cardiovascular Disease"
                      className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-950 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-wider cursor-pointer shadow-sm"
                  >
                    Append Chapter
                  </button>
                </form>

                <div className="border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Chapter Indices</h4>
                  {chapters.length === 0 ? (
                    <p className="text-[11px] text-slate-400">No chapters compiled for this book.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {chapters.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedChapterId(c.id)}
                          className={`w-full text-left p-3.5 rounded-xl border-2 text-xs flex justify-between items-center transition-all cursor-pointer ${
                            c.id === selectedChapterId
                              ? 'border-blue-600 bg-white font-bold shadow-xs text-slate-900'
                              : 'border-slate-100 bg-slate-50 hover:bg-slate-100/80 text-slate-600'
                          }`}
                        >
                          <span className="truncate">{c.chapter_name}</span>
                          <Check className={`h-4 w-4 text-emerald-600 ${c.id === selectedChapterId ? 'opacity-100' : 'opacity-0'}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <Sparkles className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Textbook Required</p>
                <p className="text-[10px] mt-1 text-slate-400 max-w-[200px] mx-auto leading-relaxed">Please select a volume on the left to configure chapters.</p>
              </div>
            )}
          </div>

          {/* Column 3: Append MCQ Questions to Selected Chapter */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 h-fit">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span>Diagnostic MCQ Builder</span>
            </h3>

            {selectedChapterId ? (
              <form onSubmit={handleCreateMCQ} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Question Description</label>
                  <textarea
                    required
                    rows={3}
                    value={mcqQuestion}
                    onChange={(e) => setMcqQuestion(e.target.value)}
                    placeholder="A 54-year-old male presents with..."
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Option A</label>
                    <input
                      type="text"
                      required
                      value={mcqA}
                      onChange={(e) => setMcqA(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Option B</label>
                    <input
                      type="text"
                      required
                      value={mcqB}
                      onChange={(e) => setMcqB(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Option C</label>
                    <input
                      type="text"
                      required
                      value={mcqC}
                      onChange={(e) => setMcqC(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Option D</label>
                    <input
                      type="text"
                      required
                      value={mcqD}
                      onChange={(e) => setMcqD(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Correct Answer</label>
                    <select
                      value={mcqCorrect}
                      onChange={(e) => setMcqCorrect(e.target.value as any)}
                      className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Page Number</label>
                    <input
                      type="number"
                      value={mcqPage}
                      onChange={(e) => setMcqPage(Number(e.target.value))}
                      className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Diagnostic Explanation</label>
                  <textarea
                    required
                    rows={3}
                    value={mcqExplanation}
                    onChange={(e) => setMcqExplanation(e.target.value)}
                    placeholder="Explain the physiological mechanisms of the correct option..."
                    className="block w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Compile MCQ to Chapter
                </button>
              </form>
            ) : (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <Sparkles className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Chapter Required</p>
                <p className="text-[10px] mt-1 text-slate-400 max-w-[200px] mx-auto leading-relaxed">Please select a chapter above to compile exam questions.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
