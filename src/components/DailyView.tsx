import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { parseLocalDate } from '../utils/dateUtils';
import { motion } from 'motion/react';
import { 
  Droplet, 
  Footprints, 
  BookOpen, 
  Flower2, 
  Plus, 
  Minus, 
  Clock, 
  Trash2, 
  Edit3, 
  Check, 
  Square, 
  CheckSquare, 
  Heart, 
  PenTool, 
  CalendarDays,
  Sparkles
} from 'lucide-react';

export default function DailyView() {
  const {
    currentDate,
    currentTime,
    tasks,
    schedules,
    habits,
    focusItem,
    gratitude,
    updateGratitude,
    addTask,
    toggleTask,
    deleteTask,
    incrementHabit,
    decrementHabit,
    toggleFocusCompleted,
    openAddModal,
    openEditModal,
    addToast,
    dailyImage,
    saveDailyImage,
    deleteDailyImage
  } = usePlanner();

  // Local task creator state
  const [newQuickTaskTitle, setNewQuickTaskTitle] = useState('');
  const [isPriorityForQuickTask, setIsPriorityForQuickTask] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Safety check size to prevent browser local storage quota issues (< 1MB)
    if (file.size > 1024 * 1024) {
      addToast('Please upload an image smaller than 1MB to align with browser storage capacity! 📸⚠️', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      saveDailyImage(base64);
      addToast('Decorated your daily planner with a memory photo! 🌸✨', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    saveDailyImage(url);
    addToast('Decorated your planner with an aesthetic scene! 🎨🌿', 'success');
  };

  const handleClearImage = () => {
    deleteDailyImage();
    addToast('Removed daily memory photo completely 🗑️', 'info');
  };

  // Filter tasks for current simulated date
  const todaysTasks = tasks.filter(t => t.date === currentDate);
  const priorityTasks = todaysTasks.filter(t => t.priority);
  const normalTasks = todaysTasks.filter(t => !t.priority);

  // Filter schedules for current simulated date
  const todaysSchedules = schedules.filter(s => s.date === currentDate);

  // Format Date for Boho Header
  const getFormattedBohoDate = () => {
    try {
      const parsed = parseLocalDate(currentDate);
      if (isNaN(parsed.getTime())) return currentDate;
      return parsed.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return currentDate;
    }
  };

  const handleQuickTaskAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickTaskTitle.trim()) return;
    addTask(newQuickTaskTitle.trim(), isPriorityForQuickTask, currentDate);
    setNewQuickTaskTitle('');
  };

  // Helper matching habit icons
  const getHabitIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets': return <Droplet size={18} />;
      case 'Footprints': return <Footprints size={18} />;
      case 'BookOpen': return <BookOpen size={18} />;
      default: return <Flower2 size={18} />;
    }
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      {/* Top Header Row with Time coordinates */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md rounded-[2.2rem] p-7 border border-white/50 shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
            {currentDate} • Virtual Simulated Reference
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-800 tracking-tight mt-0.5">
            {getFormattedBohoDate()}
          </h1>
          <p className="font-sans text-xs text-primary font-semibold mt-1">
            Boho Creative Digital Journal Workspace
          </p>
        </div>
        
        <div className="bg-tertiary-container md:bg-white/70 px-6 py-3.5 rounded-2xl border border-theme-border/50 flex items-center gap-3 self-start md:self-auto">
          <Clock size={16} className="text-secondary animate-pulse" />
          <div>
            <span className="block text-[9px] uppercase font-bold text-stone-400 select-none">Active Virtual Time</span>
            <span className="font-mono text-sm font-bold text-stone-700">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Grid: Main Page layout representing real double-page notebook layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* LEFT COLUMN: Focus, Gratitude, Dynamic Schedule (7 cols in wide screens) */}
        <div className="lg:col-span-7 space-y-7">
          
          {/* Primary Focus Card */}
          <div className="bg-gradient-to-tr from-white to-tertiary-container border-2 border-theme-border/40  rounded-[2.2rem] p-7 shadow-md relative overflow-hidden transition-all duration-300">
            {/* Soft decorative botanical visual watermark */}
            <div className="absolute right-[-10px] top-[-10px] text-[7.5rem] font-serif text-secondary/5 pointer-events-none select-none rotate-12">
              🌿
            </div>
            
            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d36b54] flex items-center gap-1">
                  <Sparkles size={11} className="animate-pulse" />
                  Today's Intent
                </span>
                <h3 className="font-serif text-xl font-extrabold text-primary mt-1 tracking-tight">
                  Core Daily Focus
                </h3>
              </div>
              <button 
                onClick={() => openAddModal('focus')}
                className="text-[10px] md:text-xs font-bold bg-white hover:bg-white/80 text-secondary border border-secondary/20 px-3 py-1.5 rounded-full cursor-pointer transition-colors shadow-sm"
              >
                Change Intent
              </button>
            </div>

            <div className="mt-5 p-4.5 rounded-2.5xl bg-white/70 backdrop-blur-sm border border-secondary/10 flex items-center justify-between gap-4 relative z-10 shadow-sm transition-all duration-300 hover:bg-white">
              <div className="flex items-center gap-3.5">
                <button
                  onClick={toggleFocusCompleted}
                  className="p-1.5 rounded-full text-[#d36b54] hover:bg-tertiary-container cursor-pointer transition-colors shrink-0"
                  title="Toggle completed state"
                >
                  {focusItem.completed ? (
                    <CheckSquare size={24} className="stroke-[2] text-[#8da698]" />
                  ) : (
                    <Square size={24} className="stroke-[1.5] text-stone-400 hover:text-[#d36b54]" />
                  )}
                </button>
                <div className="text-left">
                  <p className={`font-serif font-extrabold text-sm md:text-base leading-snug tracking-tight ${focusItem.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                    {focusItem.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-mono font-bold text-primary px-2 py-0.5 bg-tertiary-container border border-theme-border/40 rounded-full">
                      🎯 {focusItem.duration}
                    </span>
                    {focusItem.completed && (
                      <span className="text-[9px] font-bold text-[#8da698] px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-1">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {focusItem.isPriority && (
                <span className="bg-tertiary-container text-secondary text-[9px] font-bold px-3 py-1 rounded-full border border-theme-border/40 select-none flex items-center gap-1 shrink-0 animate-bounce">
                  <Sparkles size={11} className="fill-secondary/20" />
                  High Priority
                </span>
              )}
            </div>
          </div>

          {/* Daily Schedule - Timetable */}
          <div className="bg-white/80 backdrop-blur border border-stone-200/50 rounded-[2rem] p-6 shadow-sm shadow-stone-200/10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-800">
                  Daily Timetable
                </h3>
                <p className="font-sans text-[10px] text-stone-400 mt-0.5">
                  Hourly planning outline organized chronological order
                </p>
              </div>
              <button
                onClick={() => openAddModal('schedule')}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] rounded-full border border-stone-200 shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                id="btn-add-hourly-plan"
              >
                <Plus size={13} className="text-primary" />
                <span>Add Hourly Plan</span>
              </button>
            </div>

            {/* Timetable timeline slots matches */}
            <div className="space-y-3.5 mt-2">
              {todaysSchedules.length === 0 ? (
                <div className="py-12 text-center bg-[#FAF8F5]/50 border border-dashed border-stone-200/60 rounded-2xl">
                  <Clock className="mx-auto text-stone-300 stroke-[1.2] mb-2" size={32} />
                  <p className="font-serif font-medium text-sm text-stone-500">No schedule slot added for today</p>
                  <p className="font-sans text-[10px] text-stone-400 mt-0.5">Add hourly elements to plan your daytime</p>
                </div>
              ) : (
                todaysSchedules.map((slot) => (
                  <div
                    key={slot.id}
                    className="group relative flex items-start gap-4 p-3.5 rounded-2xl bg-[#FCFAF8] hover:bg-white border border-stone-200/40 hover:border-stone-300/60 transition-all shadow-sm/5 cursor-pointer"
                    onClick={() => openEditModal('schedule', slot.id)}
                  >
                    {/* Time block */}
                    <div className="font-mono text-xs font-extrabold text-primary bg-tertiary-container px-2.5 py-1.5 rounded-xl border border-theme-border/50 w-[84px] text-center shrink-0">
                      {slot.time}
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left min-w-0 pr-10">
                      <h4 className="font-serif font-bold text-sm text-stone-800 truncate">
                        {slot.title}
                      </h4>
                      {slot.subtitle && (
                        <p className="text-xs text-stone-500 truncate mt-0.5">
                          {slot.subtitle}
                        </p>
                      )}
                      
                      {/* Tag mapping */}
                      <span className="text-[9px] uppercase font-bold font-sans mt-2 inline-block px-2 py-0.5 rounded-full bg-stone-100 text-stone-400 border border-stone-200/40">
                        {slot.category}
                      </span>
                    </div>

                    {/* Quick indicator and pointer */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-stone-400">
                      <Edit3 size={12} />
                      <span className="text-[9px] font-bold">Edit</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Gratitude Journaling Card */}
          <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FAF3EB] border-2 border-pink-100/80 rounded-[2.2rem] p-7 shadow-md relative overflow-hidden transition-all duration-300">
            <div className="absolute left-[-20px] bottom-[-20px] text-[8rem] font-serif text-[#d36b54]/5 pointer-events-none select-none rotate-45">
              🌸
            </div>
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-secondary shadow-inner">
                <Heart size={18} className="fill-secondary animate-pulse text-secondary" />
              </div>
              <div className="text-left">
                <h3 className="font-serif text-lg font-extrabold text-primary leading-snug">
                  Immersive Daily Gratitude
                </h3>
                <p className="font-sans text-[10.5px] text-stone-500 font-medium">
                  Log 3 beautiful things you are grateful for today to cultivate peace
                </p>
              </div>
            </div>

            <div className="relative mt-4 z-10">
              <PenTool size={15} className="absolute left-4 top-3.5 text-[#d36b54] pointer-events-none animate-bounce" />
              <textarea
                value={gratitude}
                onChange={(e) => updateGratitude(e.target.value)}
                placeholder="Today I am deeply grateful for..."
                rows={4}
                className="w-full bg-tertiary-container border border-theme-border/50 rounded-2.5xl pl-11 pr-5 py-3 text-xs leading-[2rem] text-stone-800 font-serif focus:ring-2 focus:ring-secondary/15 focus:border-secondary/40 outline-none resize-none placeholder-stone-400/85 shadow-inner journal-ruled-lines font-medium"
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Habits Tracker, Complete Task lists (5 cols in wide screens) */}
        <div className="lg:col-span-5 space-y-7">
          
          {/* Daily Circular Habits Tracking */}
          <div className="bg-white/80 backdrop-blur border border-stone-200/50 rounded-[2rem] p-6 shadow-sm shadow-stone-200/10">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-800">
                Today's Habits
              </h3>
              <p className="font-sans text-[10px] text-stone-400 mt-0.5">
                Nurture your daily rituals and wholesome wellness trace
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
              {habits.map((h) => {
                const percent = Math.min((h.count / h.target) * 100, 100);
                const isCompleted = percent >= 100;
                return (
                  <div
                    key={h.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                      isCompleted 
                        ? 'bg-[#F4F8F5] border-emerald-100 shadow-sm' 
                        : 'bg-[#FCFAF7] border-stone-200/30 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl shadow-sm ${
                        isCompleted 
                          ? 'bg-emerald-50 text-[#8da698]' 
                          : 'bg-white text-stone-500'
                      }`}>
                        {getHabitIcon(h.icon)}
                      </div>
                      
                      {/* Increment / Decrement buttons */}
                      <div className="flex items-center bg-white/70 p-0.5 rounded-lg border border-stone-200/30 shadow-sm">
                        <button
                          onClick={() => decrementHabit(h.id)}
                          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-white rounded cursor-pointer transition-colors"
                          title="Decrease"
                        >
                          <Minus size={11} />
                        </button>
                        <button
                          onClick={() => incrementHabit(h.id)}
                          className="p-1 text-primary hover:text-stone-800 hover:bg-white rounded cursor-pointer transition-colors"
                          title="Increase"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-serif font-extrabold text-sm text-stone-800 h-5 overflow-hidden truncate">
                        {h.name}
                      </h4>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5 flex items-center justify-between">
                        <span>{h.count} / {h.target} <span className="text-stone-400 text-[9px]">{h.unit}</span></span>
                        {isCompleted && <span className="text-[10px] text-emerald-600 font-bold">✓ Great</span>}
                      </p>
                    </div>

                    {/* Highly interactive moving progress bar trace with spring physics! */}
                    <div className="w-full bg-stone-200/60 h-2.5 rounded-full mt-3 overflow-hidden relative shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ type: 'spring', stiffness: 85, damping: 14 }}
                        className="h-full rounded-full"
                        style={{ 
                          background: isCompleted 
                            ? 'linear-gradient(90deg, #8da698 0%, #b3cbbf 100%)' 
                            : 'linear-gradient(90deg, #8C6A5C 0%, #d36b54 100%)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Polaroid memory snapshots Vision Card & Photo Upload */}
          <div className="bg-gradient-to-br from-[#FFFDFB] to-[#FAF5EE] border border-stone-200/50 rounded-[2.2rem] p-6 shadow-sm shadow-stone-200/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-extrabold text-[#8C6A5C] leading-none">
                  Memory Board
                </h3>
                <p className="font-sans text-[10px] text-stone-400 mt-1">
                  Document cozy glances of your day in polaroid layout
                </p>
              </div>
              {dailyImage && (
                <button
                  onClick={handleClearImage}
                  className="text-[9px] font-bold text-rose-500 hover:text-rose-700 bg-white border border-rose-100 px-2.5 py-1 rounded-full cursor-pointer shadow-sm transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {dailyImage ? (
              <div className="bg-white p-4.5 pb-8 rounded-2xl border border-stone-200 shadow-md transform rotate-[-1deg] transition-all hover:rotate-0 relative">
                {/* Visual Sticky Tape decoration on top */}
                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-20 h-5 bg-[#DFCBAE]/40 backdrop-blur-xs border border-white/20 transform rotate-1 shadow-sm shrink-0 pointer-events-none" />
                
                <img
                  src={dailyImage}
                  alt="Daily Memory Snapshot"
                  referrerPolicy="no-referrer"
                  className="w-full h-44 object-cover rounded-lg border border-stone-100 placeholder-stone-200 shrink-0"
                />
                
                <div className="mt-4 text-center">
                  <span className="font-serif text-xs font-bold text-stone-500 italic">
                    ✨ {currentDate} Snapchat Memory ✨
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Interactive Drag/Click Area */}
                <label className="border-2 border-dashed border-[#DFCBAE] hover:border-[#8C6A5C] bg-[#FAF8F5]/50 h-36 rounded-2.5xl flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white p-4 text-center group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="p-3 bg-white rounded-full text-secondary shadow-sm group-hover:scale-110 transition-transform">
                    📸
                  </div>
                  <span className="font-serif font-extrabold text-xs text-[#8C6A5C] mt-2 block">
                    Upload beautiful daily photo
                  </span>
                  <span className="text-[9px] text-stone-400 mt-1 font-mono">
                    JPG, PNG (under 1MB)
                  </span>
                </label>

                {/* Preset aesthetic nature backgrounds */}
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block mb-2 text-left">
                    Quick Aesthetic Presets
                  </span>
                  <div className="flex gap-2.5">
                    {[
                      { name: '☕ Coffee', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400' },
                      { name: '🌱 Sage', url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=400' },
                      { name: '🌅 Sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400' }
                    ].map((pst, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectPreset(pst.url)}
                        className="flex-1 py-1.5 px-2 bg-white hover:bg-[#FAF0E6] text-[10px] font-bold rounded-xl border border-stone-200/60 shadow-sm cursor-pointer hover:border-secondary/40 transition-colors"
                      >
                        {pst.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Today's Tasks checklist notebook page */}
          <div className="bg-white/80 backdrop-blur border border-stone-200/50 rounded-[2rem] p-6 shadow-sm shadow-stone-200/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-800">
                  Daily Checklist
                </h3>
                <p className="font-sans text-[10px] text-stone-400 mt-0.5">
                  Action lists for the day with priority indicators
                </p>
              </div>
              <span className="text-[10px] font-mono bg-[#FAF1E6] text-[#8C6A5C] font-bold px-2 py-0.5 rounded border border-[#EDE1D2]">
                {todaysTasks.filter(t => t.completed).length}/{todaysTasks.length} Done
              </span>
            </div>

            {/* Quick Inline task submission field */}
            <form onSubmit={handleQuickTaskAddSubmit} className="flex gap-2 mb-5">
              <input
                type="text"
                placeholder="➕ Add a task quickly..."
                value={newQuickTaskTitle}
                onChange={(e) => setNewQuickTaskTitle(e.target.value)}
                className="flex-1 bg-stone-100/70 border border-stone-200/60 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 outline-none focus:ring-1 focus:ring-primary/20 placeholder-stone-400"
              />
              <button
                type="button"
                onClick={() => setIsPriorityForQuickTask(!isPriorityForQuickTask)}
                title="Mark Priority"
                className={`px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isPriorityForQuickTask 
                    ? 'bg-rose-50 border-rose-200 text-rose-500' 
                    : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-600'
                }`}
              >
                ⭐ Priority
              </button>
              <button
                type="submit"
                className="bg-[#8C6A5C] hover:bg-[#745548] text-white px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Add
              </button>
            </form>

            <div className="space-y-5">
              
              {/* Priority stack */}
              {priorityTasks.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-rose-500 flex items-center gap-1 mb-2">
                    <span>⭐</span> High Priority Tasks
                  </h4>
                  <div className="space-y-2.5">
                    {priorityTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-orange-50/20 border border-orange-100/40 hover:bg-white group transition-colors"
                      >
                        <div className="flex items-center gap-2.5 pr-2 min-w-0">
                          <button
                            onClick={() => toggleTask(t.id)}
                            className="p-0.5 text-[#d36b54] rounded cursor-pointer"
                          >
                            {t.completed ? (
                              <CheckSquare size={16} />
                            ) : (
                              <Square size={16} className="text-stone-400" />
                            )}
                          </button>
                          <span className={`text-xs font-medium truncate ${t.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                            {t.title}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-all cursor-pointer rounded"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Tasks stack */}
              <div>
                <h4 className="text-[10px] font-bold uppercase text-stone-400 flex items-center gap-1 mb-2">
                  <span>⚓</span> Daily Tasks
                </h4>
                {normalTasks.length === 0 && priorityTasks.length === 0 ? (
                  <div className="py-8 text-center bg-stone-50/50 border border-dashed border-stone-200/50 rounded-2xl">
                    <p className="font-serif text-xs text-stone-400">Your task list is beautifully empty</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {normalTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-stone-50/20 hover:bg-white border border-stone-200/10 hover:border-stone-200/40 group transition-all"
                      >
                        <div className="flex items-center gap-2.5 pr-2 min-w-0">
                          <button
                            onClick={() => toggleTask(t.id)}
                            className="p-0.5 text-stone-500 rounded cursor-pointer"
                          >
                            {t.completed ? (
                              <CheckSquare size={16} className="text-primary" />
                            ) : (
                              <Square size={16} className="text-stone-400" />
                            )}
                          </button>
                          <span className={`text-xs font-medium truncate ${t.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                            {t.title}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-all cursor-pointer rounded"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
