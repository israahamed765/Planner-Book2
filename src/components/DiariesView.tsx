import React, { useState, useEffect } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { Diary } from '../types';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  Calendar, 
  Smile, 
  Save, 
  Search, 
  Heart,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

const MOODS = [
  { emoji: '🌸', label: 'Serene' },
  { emoji: '🧘', label: 'Peaceful' },
  { emoji: '🌿', label: 'Reflected' },
  { emoji: '🌞', label: 'Joyful' },
  { emoji: '☕', label: 'Cozy' },
  { emoji: '🌾', label: 'Nostalgic' },
  { emoji: '💫', label: 'Grateful' },
  { emoji: '🌙', label: 'Dreamy' },
];

export default function DiariesView() {
  const { 
    diaries, 
    addDiary, 
    updateDiary, 
    deleteDiary, 
    currentDate,
    addToast 
  } = usePlanner();

  const [view, setView] = useState<'list' | 'write' | 'edit'>('list');
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for creating/editing
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('🌸 Serene');
  const [entryDate, setEntryDate] = useState('');

  // Start new diary
  const handleStartNew = () => {
    setTitle('');
    setContent('');
    setMood('🌸 Serene');
    setEntryDate(currentDate); // Default to current virtual date
    setSelectedDiary(null);
    setView('write');
  };

  // Start editing a diary
  const handleEdit = (diary: Diary) => {
    setSelectedDiary(diary);
    setTitle(diary.title);
    setContent(diary.content);
    setMood(diary.mood || '🌸 Serene');
    setEntryDate(diary.date);
    setView('edit');
  };

  // Save diary
  const handleSave = () => {
    if (!content.trim()) {
      addToast('Diary content cannot be empty! Please express your thoughts. 💭', 'error');
      return;
    }

    const finalTitle = title.trim() || 'Untitled Reflection';

    if (view === 'write') {
      addDiary(finalTitle, content, mood, entryDate);
    } else if (view === 'edit' && selectedDiary) {
      updateDiary(selectedDiary.id, {
        title: finalTitle,
        content,
        mood,
        date: entryDate
      });
    }

    // Return to list view
    setView('list');
  };

  // Auto-saving alert helper
  useEffect(() => {
    if (view === 'write' || view === 'edit') {
      const handler = setTimeout(() => {
        // Subtle assurance
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [title, content, mood, entryDate, view]);

  // Handle deletions
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this diary page? 🗑️')) {
      deleteDiary(id);
    }
  };

  // Filtered diary entries
  const filteredDiaries = diaries.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q) ||
      d.date.includes(q) ||
      (d.mood && d.mood.toLowerCase().includes(q))
    );
  });

  return (
    <div id="personal-diaries-container" className="space-y-6">
      
      {/* Page Title & Motivation Panel */}
      <div className="bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 border border-theme-border/50 shadow-sm transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <BookOpen className="text-secondary" size={24} />
              <h1 className="font-serif text-2xl font-black text-stone-800 tracking-tight">
                My Mindful Journal
              </h1>
            </div>
            <p className="text-[11px] text-stone-500 font-sans mt-1">
              Capture your whispers, milestones, and cozy moments in personal scoped sheets.
            </p>
          </div>
          
          <div className="bg-active-tab border border-theme-border/40 px-4 py-2.5 rounded-2xl flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-stone-500">
              📆 Virtual Calendar Date: {currentDate}
            </span>
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <div className="space-y-6">
          
          {/* Search and Quick Tip */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search your memories in English..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/60 border border-theme-border/50 focus:border-primary focus:ring-1 focus:ring-primary/25 rounded-2xl pl-10 pr-4 py-3 text-xs outline-none text-stone-800 placeholder-stone-400/85 transition-all font-sans"
              />
            </div>

            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-stone-400 hover:text-stone-800 text-xs font-sans cursor-pointer underline whitespace-nowrap"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Diaries Feed Layout */}
          {filteredDiaries.length === 0 ? (
            <div className="bg-white/40 border border-dashed border-theme-border/70 rounded-[2rem] p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-tertiary-container text-primary rounded-full flex items-center justify-center mx-auto text-xl">
                ☕
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-serif font-bold text-stone-800 text-base">No Journal Entries Found</h3>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Your notebook pages are empty. Write down your feelings, a warm morning story, or daily gratitude steps to review later!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredDiaries.map((diary) => (
                <div 
                  key={diary.id}
                  onClick={() => handleEdit(diary)}
                  className="bg-white/60 hover:bg-white/80 backdrop-blur-md rounded-[2rem] p-6 border border-theme-border/40 hover:border-theme-border transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer relative group flex flex-col justify-between text-left h-[230px]"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-tertiary-container border border-theme-border/40 font-mono text-stone-500 font-bold shrink-0">
                        <Calendar size={11} className="text-stone-400" />
                        <span>{diary.date}</span>
                      </div>
                      
                      {diary.mood && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/70 border border-stone-200/50 font-bold font-sans flex items-center gap-0.5 shadow-sm text-stone-600">
                          {diary.mood}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-extrabold text-[#8C6A5C] text-sm group-hover:text-secondary transition-colors line-clamp-1 mb-2">
                      {diary.title}
                    </h3>
                    
                    <p className="text-xs text-stone-600 font-serif leading-relaxed line-clamp-4 font-medium">
                      {diary.content}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex justify-between items-center border-t border-stone-100/50 pt-3 mt-3">
                    <span className="text-[9px] text-stone-400 font-sans italic">
                      Click to read or edit
                    </span>
                    
                    <button
                      onClick={(e) => handleDelete(diary.id, e)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer opacity-80 hover:opacity-100"
                      title="Delete this page"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action button at the very bottom as requested */}
          <div className="pt-6 flex justify-center">
            <button
              onClick={handleStartNew}
              className="px-8 py-4 bg-secondary hover:bg-[#b0533e] text-white font-serif text-sm font-black rounded-full shadow-lg hover:scale-[1.03] active:scale-95 transition-all cursor-pointer flex items-center gap-2.5"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>Write a New Diary Page ✍️</span>
            </button>
          </div>

        </div>
      ) : (
        /* Immersive notebook writing view */
        <div className="bg-gradient-to-br from-white to-tertiary-container/30 rounded-[2.5rem] border border-theme-border/60 shadow-md p-6 md:p-9 max-w-3xl mx-auto space-y-6 relative transition-all duration-300">
          
          {/* Notebook Spiral Binding */}
          <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 flex flex-col gap-3 z-10 pointer-events-none select-none">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-7 h-3 rounded-full bg-gradient-to-r from-stone-400 to-stone-200/40 border border-stone-300/60 shadow-sm" />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-theme-border/40">
            <div className="text-left">
              <h2 className="font-serif text-lg font-black text-[#8C6A5C] flex items-center gap-2">
                <BookOpen size={18} />
                <span>{view === 'write' ? 'Create Diary Entry' : 'Edit Diary Entry'}</span>
              </h2>
              <p className="text-[10px] text-stone-400 font-sans mt-0.5 uppercase tracking-wide">
                Saving to your secure active identity notebook workspace
              </p>
            </div>

            {/* Date Input inside editor */}
            <div className="flex items-center gap-2 bg-white/70 px-3 py-1.5 rounded-xl border border-theme-border/40 shadow-inner">
              <Calendar size={12} className="text-stone-400" />
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="bg-transparent border-none text-xs text-stone-700 outline-none font-sans font-bold cursor-pointer"
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-5 text-left">
            {/* Title */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C6A5C] block mb-1.5">
                Diary Page Title:
              </label>
              <input
                type="text"
                placeholder="Give your memory a mindful heading (e.g. A peaceful walk)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-theme-border/40 rounded-xl px-4 py-3 text-xs outline-none text-stone-850 font-serif focus:ring-1 focus:ring-primary/25 placeholder-stone-400/85 shadow-inner"
              />
            </div>

            {/* Mood selector */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C6A5C] block mb-2">
                Current Vibe & Mood:
              </label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => {
                  const tag = `${m.emoji} ${m.label}`;
                  const isSelected = mood === tag;
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMood(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold font-sans transition-all cursor-pointer border ${
                        isSelected 
                          ? 'bg-secondary text-white border-secondary shadow-sm scale-103'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-theme-border/60 hover:bg-stone-50'
                      }`}
                    >
                      <span className="mr-1">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Immersive ruled writing area */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C6A5C] block mb-1.5">
                What happened today? (Share your cozy thoughts):
              </label>
              
              <div className="relative">
                <textarea
                  placeholder="Dear Journal, today was a peaceful day because..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="w-full bg-white border border-theme-border/50 rounded-2.5xl px-5 py-4 text-xs tracking-wide leading-[2rem] text-stone-800 font-serif focus:ring-1 focus:ring-secondary/25 focus:border-secondary/40 outline-none resize-none placeholder-stone-400/85 shadow-inner journal-ruled-lines font-medium"
                />
                
                {/* Visual watermark */}
                <div className="absolute bottom-3 right-4 text-[9px] text-stone-300 font-mono select-none pointer-events-none uppercase">
                   🔏 Secured Local Vault
                </div>
              </div>
            </div>

            {/* Friendly guidance */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex gap-2.5 items-start">
              <Info size={14} className="text-secondary shrink-0 mt-0.5" />
              <p className="text-[10px] text-stone-500 leading-normal font-sans">
                By clicking "Save", this page will be digitally saved to your active identity scope inside your local browser. No other device profile can read your secure entry.
              </p>
            </div>

          </div>

          {/* Core Navigation Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-theme-border/40 pt-5 mt-4">
            
            {/* GO BACK BUTTON */}
            <button
              type="button"
              onClick={() => setView('list')}
              className="px-5 py-2.5 rounded-xl text-xs text-stone-600 hover:text-stone-850 hover:bg-stone-100/70 border border-stone-200 hover:border-stone-300 transition-all font-sans font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>← Back to Memories</span>
            </button>

            {/* SAVE BUTTON */}
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-3 bg-primary hover:bg-[#745548] text-white rounded-xl text-xs font-serif font-black shadow-md hover:scale-102 transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Save size={14} />
              <span>Save Journal Entry 💾</span>
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
