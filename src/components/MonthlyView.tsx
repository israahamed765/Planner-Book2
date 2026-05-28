import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { parseLocalDate } from '../utils/dateUtils';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Sparkles, 
  Moon,
  Bookmark,
  Coffee,
  CheckCircle,
  Clock,
  Heart,
  Quote,
  Target,
  ArrowRight
} from 'lucide-react';

export default function MonthlyView() {
  const {
    currentDate,
    setCurrentDate,
    tasks,
    schedules,
    habits,
    habitHistory,
    focusItem,
    gratitude,
    setActiveTab
  } = usePlanner();

  const [monthlyNotes, setMonthlyNotes] = useState(() => {
    return localStorage.getItem('aura_monthly_notes') || 'Focus on drafting the design layout, updating the styled palette tokens, and relaxing under evening moonlight sessions.';
  });

  const saveMonthlyNotes = (val: string) => {
    setMonthlyNotes(val);
    localStorage.setItem('aura_monthly_notes', val);
  };

  // Extract month details based on the current virtual date
  const getMonthDetails = () => {
    try {
      const baseDate = parseLocalDate(currentDate);
      if (isNaN(baseDate.getTime())) return { grid: [], monthName: '', monthNameAr: '', year: 2026 };
      
      const year = baseDate.getFullYear();
      const monthIndex = baseDate.getMonth(); // 0 to 11

      const firstOfMonth = new Date(year, monthIndex, 1);
      const startDayOfWeek = firstOfMonth.getDay(); // Sunday is 0

      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      const gridDays = [];

      // Pads for offset from previous month
      for (let i = 0; i < startDayOfWeek; i++) {
        gridDays.push({
          dateStr: '',
          dayNum: 0,
        });
      }

      // True month days
      for (let d = 1; d <= daysInMonth; d++) {
        const mm = String(monthIndex + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        const dateStr = `${year}-${mm}-${dd}`;
        gridDays.push({
          dateStr,
          dayNum: d
        });
      }

      const arMonths = [
        'January', 'February', 'March', 'April', 
        'May', 'June', 'July', 'August', 
        'September', 'October', 'November', 'December'
      ];

      return {
        grid: gridDays,
        monthName: baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        monthNameAr: arMonths[monthIndex],
        year,
        monthIndex
      };
    } catch {
      return { grid: [], monthName: '', monthNameAr: '', year: 2026, monthIndex: 4 };
    }
  };

  const { grid, monthName, monthNameAr, year, monthIndex } = getMonthDetails();

  // Day filter computations for Selected Calendar Day
  const dayTasks = tasks.filter(t => t.date === currentDate);
  const daySchedules = schedules.filter(s => s.date === currentDate);
  const completedTasks = dayTasks.filter(t => t.completed);

  // Month shifting controls
  const handleShiftMonth = (direction: 'prev' | 'next') => {
    try {
      const baseDate = parseLocalDate(currentDate);
      if (isNaN(baseDate.getTime())) return;
      
      const targetMonth = direction === 'next' ? baseDate.getMonth() + 1 : baseDate.getMonth() - 1;
      baseDate.setMonth(targetMonth);
      
      const yyyy = baseDate.getFullYear();
      const mm = String(baseDate.getMonth() + 1).padStart(2, '0');
      const dd = String(baseDate.getDate()).padStart(2, '0');
      
      setCurrentDate(`${yyyy}-${mm}-${dd}`);
    } catch (e) {
      console.error(e);
    }
  };

  const weekdaysHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdaysHeaderAr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      {/* Header Month Switcher Card */}
      <div className="bg-white/40 backdrop-blur-md rounded-[2.2rem] p-7 border border-white/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Monthly Calendar • Overview</span>
          <h1 className="font-serif text-3xl font-bold text-stone-800 tracking-tight mt-0.5">
            {monthName}
          </h1>
          <p className="font-sans text-xs text-[#8C6A5C] font-semibold mt-1">
            Dynamic Monthly View ({year})
          </p>
        </div>

        {/* Shifter controllers */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-white/70 p-1.5 rounded-2xl border border-[#E9DFD3] shadow-sm">
          <button
            onClick={() => handleShiftMonth('prev')}
            className="p-2 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer text-stone-600"
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-stone-500 font-mono select-none px-2">Navigate</span>
          <button
            onClick={() => handleShiftMonth('next')}
            className="p-2 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer text-stone-600"
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid: Calendar Left & Focus Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Calendar Grid card (8 cols in wide width) */}
        <div className="lg:col-span-8 bg-white/80 backdrop-blur border border-stone-200/50 rounded-[2rem] p-6 shadow shadow-stone-200/5">
          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-stone-200/30 pb-3 mb-3">
            {weekdaysHeader.map((d, index) => (
              <div key={d} className="py-1">
                <span className="block text-[10px] font-extrabold uppercase text-stone-400 tracking-wider">
                  {d}
                </span>
                <span className="block text-[8px] font-sans font-bold text-stone-300">
                  {weekdaysHeaderAr[index]}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar cell rows */}
          <div className="grid grid-cols-7 gap-1.5">
            {grid.map((cell, index) => {
              // Empty padding blocks
              if (cell.dayNum === 0) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square bg-[#FAF8F5]/30 rounded-2xl border border-transparent"
                  />
                );
              }

              const isToday = currentDate === cell.dateStr;
              const hasTasks = tasks.filter(t => t.date === cell.dateStr);
              const completedTasksCount = hasTasks.filter(t => t.completed).length;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setCurrentDate(cell.dateStr)}
                  className={`aspect-square rounded-2xl p-2.5 border transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isToday
                      ? 'bg-gradient-to-tr from-white to-tertiary-container border-primary shadow-sm font-semibold ring-1 ring-primary/10'
                      : 'bg-white/70 hover:bg-white hover:border-theme-border/60 border-stone-200/10'
                  }`}
                >
                  <span className={`text-xs font-mono font-medium ${isToday ? 'text-secondary font-bold text-sm' : 'text-stone-700'}`}>
                    {cell.dayNum}
                  </span>

                  {/* Little Task Counter Indicators */}
                  {hasTasks.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#d36b54]" />
                      <span className="text-[8px] font-mono text-stone-500 group-hover:block hidden md:inline">
                        {completedTasksCount}/{hasTasks.length}
                      </span>
                    </div>
                  )}

                  {/* Ambient glowing hover halo helper */}
                  {isToday && (
                    <span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-secondary" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic monthly journal & sticker board (4 cols width) */}
        <div className="lg:col-span-4 space-y-7">
          
          {/* Monthly goals input */}
          <div className="bg-white/80 backdrop-blur border border-stone-200/50 rounded-[2rem] p-6 shadow-sm shadow-stone-200/10">
            <div className="bg-[#FAF1E6] p-4 rounded-2xl border border-[#EDE2D4] text-center">
              <Calendar size={18} className="mx-auto text-[#8C6A5C] mb-1" />
              <h4 className="font-serif text-sm font-bold text-stone-800">Monthly Focus</h4>
              <p className="text-[10px] text-stone-400">Main vision parameters for this full monthly spread</p>
            </div>

            <div className="mt-5">
              <label htmlFor="monthly-notes-textarea" className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Aspirations & Projects</label>
              <textarea
                id="monthly-notes-textarea"
                value={monthlyNotes}
                onChange={(e) => saveMonthlyNotes(e.target.value)}
                rows={5}
                placeholder="Declare monthly targets..."
                className="w-full bg-[#FCFAF7] border border-stone-200 rounded-2xl p-3.5 mt-2 text-xs text-stone-700 font-sans leading-relaxed focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none resize-none"
              />
            </div>
          </div>

          {/* Earthy self-care Sticker Card */}
          <div className="p-6 rounded-[2rem] bg-[#8da698]/10 border border-[#8da698]/20 flex flex-col justify-between min-h-[160px] relative overflow-hidden text-left">
            <div className="absolute right-0 bottom-0 text-7xl font-sans opacity-10 select-none translate-y-2 pointer-events-none">
              ☕
            </div>
            
            <div>
              <span className="text-[9px] uppercase font-bold text-[#8c6a5c]">Boho Coffee Accent</span>
              <p className="font-serif text-stone-700 italic font-medium text-sm mt-3 leading-relaxed">
                "Patience represents the dirt of the garden from which the finest lotuses gracefully emerge."
              </p>
            </div>
            
            <div className="pt-3 border-t border-stone-200/20 mt-4">
              <span className="text-[8px] font-mono text-stone-400 uppercase">Self reflection cycle</span>
            </div>
          </div>

        </div>

      </div>

      {/* 12-Column Day Recap Bento Block */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        key={currentDate}
        className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 md:p-9 border border-white/50 shadow-sm space-y-7 text-left font-sans mt-7 select-none"
      >
        <div className="flex flex-col md:flex-row items-start justify-between border-b border-stone-200/40 pb-5 gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Daily Event Logger • Archive & Logs</span>
            <h2 className="font-serif text-2xl font-bold text-stone-800 tracking-tight mt-0.5">
              🌿 Day Event Logs: {(() => {
                try {
                  const parsed = parseLocalDate(currentDate);
                  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const monthNamesAr = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ];
                  return `${dayNames[parsed.getDay()]}, ${parsed.getDate()} ${monthNamesAr[parsed.getMonth()]} ${parsed.getFullYear()}`;
                } catch {
                  return currentDate;
                }
              })()}
            </h2>
            <p className="text-xs text-[#8C6A5C] font-semibold mt-1">
              A quick overview of what was documented and completed on this specific day.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('daily')}
            className="px-5 py-2.5 bg-primary hover:bg-opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Configure or Update Daily Planner</span>
            <ArrowRight size={14} className="rotate-185 md:rotate-0" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column A: Intentions & Journal */}
          <div className="space-y-6">
            <div>
              <h4 className="font-serif text-xs uppercase text-stone-400 font-bold tracking-wider flex items-center gap-1.5 mb-2.5">
                <Target size={14} className="text-secondary" />
                <span>Main Intentions & Focus</span>
              </h4>
              {focusItem && focusItem.title ? (
                <div className="bg-gradient-to-br from-[#FAF5EF]/90 to-white p-4.5 rounded-2xl border border-stone-200/30">
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    focusItem.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-[#FAF1E6] text-secondary'
                  }`}>
                    {focusItem.completed ? '✓ Achieved' : '• Currently Active'}
                  </span>
                  <p className="font-sans text-xs font-bold text-stone-700 mt-2">{focusItem.title}</p>
                  <span className="text-[10px] text-stone-400 font-mono block mt-1">{focusItem.duration || 'Not configured'}</span>
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">No daily intention or focus goal has been logged for this day yet.</p>
              )}
            </div>

            <div>
              <h4 className="font-serif text-xs uppercase text-stone-400 font-bold tracking-wider flex items-center gap-1.5 mb-2.5">
                <Quote size={14} className="text-secondary" />
                <span>Daily Notes & Gratitude</span>
              </h4>
              {gratitude ? (
                <div className="bg-gradient-to-br from-stone-50 to-white p-4.5 rounded-2.5xl border border-stone-150/40 relative">
                  <p className="font-serif text-stone-600 leading-relaxed text-xs italic">
                    "{gratitude}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">No gratitude words or notes recorded for this date.</p>
              )}
            </div>
          </div>

          {/* Column B: Timeline Chronology */}
          <div>
            <h4 className="font-serif text-xs uppercase text-stone-400 font-bold tracking-wider flex items-center gap-1.5 mb-3">
              <Clock size={14} className="text-secondary" />
              <span>Simulated Timeline & Schedules ({daySchedules.length})</span>
            </h4>
            
            {daySchedules.length > 0 ? (
              <div className="space-y-4 pl-1.5 relative border-l border-stone-200/40 ml-1.5">
                {daySchedules.map((item) => (
                  <div key={item.id} className="relative pl-4">
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-white shrink-0 shadow-sm" />
                    <span className="font-mono text-[9px] font-extrabold text-[#d36b54] block leading-none">
                      {item.time}
                    </span>
                    <h5 className="font-serif text-xs font-extrabold text-stone-800 mt-1 leading-tight">{item.title}</h5>
                    {item.subtitle && (
                      <p className="text-[10px] text-stone-400 truncate mt-0.5">{item.subtitle}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">No schedules or timeline tracks logged for this day.</p>
            )}
          </div>

          {/* Column C: Tasks & Habits progress */}
          <div className="space-y-6">
            <div>
              <h4 className="font-serif text-xs uppercase text-stone-400 font-bold tracking-wider flex items-center gap-1.5 mb-2.5">
                <CheckCircle size={14} className="text-secondary" />
                <span>Tasks Progress ({completedTasks.length}/{dayTasks.length})</span>
              </h4>
              
              {dayTasks.length > 0 ? (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {dayTasks.map(t => (
                    <div key={t.id} className="flex items-center gap-2 bg-stone-50/50 p-2.5 rounded-xl border border-stone-200/25">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${t.completed ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      <span className={`text-xs truncate text-stone-700 ${t.completed ? 'line-through text-stone-400 decoration-stone-300' : ''}`}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">No tasks recorded for this date.</p>
              )}
            </div>

            <div>
              <h4 className="font-serif text-xs uppercase text-stone-400 font-bold tracking-wider flex items-center gap-1.5 mb-2.5">
                <Heart size={14} className="text-secondary" />
                <span>Boho Habits Compliance</span>
              </h4>
              <div className="space-y-2.5">
                {habits.map(h => {
                  const count = habitHistory[currentDate]?.[h.id] ?? 0;
                  const progress = Math.min((count / h.target) * 100, 100);
                  return (
                    <div key={h.id} className="space-y-1 bg-stone-50/40 p-2.5 rounded-xl border border-stone-200/20">
                      <div className="flex justify-between text-[10px] font-bold text-stone-600">
                        <span>{h.name}</span>
                        <span className="text-secondary font-mono">{count}/{h.target} {h.unit}</span>
                      </div>
                      <div className="w-full h-1 bg-stone-200/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
