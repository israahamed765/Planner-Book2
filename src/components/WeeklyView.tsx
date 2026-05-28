import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { parseLocalDate } from '../utils/dateUtils';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Calendar, 
  Plus, 
  Compass, 
  CheckSquare, 
  PlusCircle, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';

export default function WeeklyView() {
  const {
    currentDate,
    setCurrentDate,
    tasks,
    addTask,
  } = usePlanner();

  const [inlineTaskTitles, setInlineTaskTitles] = useState<Record<string, string>>({});
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    return localStorage.getItem('aura_weekly_goal') || 'Cultivate mindful pauses between design iterations & hydrate gracefully.';
  });

  const saveWeeklyGoal = (val: string) => {
    setWeeklyGoal(val);
    localStorage.setItem('aura_weekly_goal', val);
  };

  // Compute the 7-day range centered on the week of currentDate (starting on Sunday)
  const getWeekDays = () => {
    try {
      const baseDate = parseLocalDate(currentDate);
      if (isNaN(baseDate.getTime())) return [];
      const dayOfWeek = baseDate.getDay(); // 0 is Sunday
      const sunOffset = parseLocalDate(currentDate);
      sunOffset.setDate(baseDate.getDate() - dayOfWeek);

      const list = [];
      const arDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      for (let i = 0; i < 7; i++) {
        const itemDate = new Date(sunOffset.getTime());
        itemDate.setDate(sunOffset.getDate() + i);

        const yyyy = itemDate.getFullYear();
        const mm = String(itemDate.getMonth() + 1).padStart(2, '0');
        const dd = String(itemDate.getDate()).padStart(2, '0');
        const formatted = `${yyyy}-${mm}-${dd}`;

        list.push({
          dateStr: formatted,
          dayNameEn: itemDate.toLocaleDateString('en-US', { weekday: 'long' }),
          dayNameShort: itemDate.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNameAr: arDayNames[i],
          displayLabel: itemDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
        });
      }
      return list;
    } catch {
      return [];
    }
  };

  const weekDays = getWeekDays();

  // Add tasks inline for a specific day
  const handleAddInlineTask = (dateStr: string) => {
    const title = inlineTaskTitles[dateStr] || '';
    if (!title.trim()) return;
    addTask(title.trim(), false, dateStr);
    setInlineTaskTitles(prev => ({ ...prev, [dateStr]: '' }));
  };

  // Calculate some weekly stats
  const allWeeklyTaskIds = weekDays.map(d => d.dateStr);
  const weeklyTrackedTasks = tasks.filter(t => allWeeklyTaskIds.includes(t.date));
  const completedWeeklyTasks = weeklyTrackedTasks.filter(t => t.completed);

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white/40 backdrop-blur-md rounded-[2.2rem] p-7 border border-white/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Weekly Dashboard • Weekly Focus</span>
          <h1 className="font-serif text-3xl font-bold text-stone-800 tracking-tight mt-0.5">
            Weekly Notebook
          </h1>
          <p className="font-sans text-xs text-[#8C6A5C] font-semibold mt-1">
            An intelligent weekly layout to organize, reflect, and track your schedules.
          </p>
        </div>

        {/* Stats capsule */}
        <div className="flex gap-4 self-start md:self-auto">
          <div className="bg-white/70 px-4 py-3 rounded-2xl border border-stone-200/40 text-center shrink-0">
            <span className="block text-[9px] uppercase font-bold text-stone-500">Weekly Progress</span>
            <span className="font-mono text-sm font-extrabold text-[#d36b54]">
              {completedWeeklyTasks.length} / {weeklyTrackedTasks.length} Done
            </span>
          </div>
          <div className="bg-white/70 px-4 py-3 rounded-2xl border border-stone-200/40 text-center shrink-0 flex items-center gap-2">
            <Award size={18} className="text-stone-400" />
            <div className="text-left">
              <span className="block text-[9px] font-bold text-stone-400">Streak Level</span>
              <span className="text-xs font-bold text-stone-700">Mindful Activist</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Bento Structure (Days of Week + Weekly Focus Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Days grid of the week (7 Cards - spans 9 cols in large screen) */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-serif text-lg font-bold text-stone-800 pb-1 flex items-center gap-2 px-1">
            <Calendar size={16} className="text-[#8C6A5C]" />
            <span>Weekly Agenda Spread • Weekdays</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weekDays.map((day) => {
              const dayTasks = tasks.filter(t => t.date === day.dateStr);
              const isSelectedDay = currentDate === day.dateStr;

              return (
                <div
                  key={day.dateStr}
                  className={`rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                    isSelectedDay
                      ? 'bg-gradient-to-br from-white to-tertiary-container border-primary shadow-md shadow-black/5 ring-1 ring-primary/10'
                      : 'bg-white border-stone-200/40 hover:border-stone-300'
                  }`}
                >
                  <div>
                    {/* Day Title / Header */}
                    <div className="flex items-start justify-between">
                      <div className="text-left">
                        <span className="text-[10px] font-mono text-stone-400 font-bold block bg-stone-100/60 rounded px-1.5 py-0.5 inline-block">
                          {day.displayLabel}
                        </span>
                        <h4 className="font-serif font-extrabold text-base text-stone-800 mt-1.5">
                          {day.dayNameEn}
                        </h4>
                        <p className="text-[10px] text-primary font-bold -mt-0.5">
                          {day.dayNameShort}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setCurrentDate(day.dateStr)}
                        className={`text-[9px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                          isSelectedDay
                            ? 'bg-[#8C6A5C] text-white shadow-sm'
                            : 'bg-stone-100 text-stone-500 hover:bg-[#8C6A5C] hover:text-white'
                        }`}
                      >
                        {isSelectedDay ? 'Selected Focus' : 'Set Active'}
                      </button>
                    </div>

                    {/* Task snippets summary for this day */}
                    <div className="mt-4 space-y-1.5 min-h-[70px]">
                      {dayTasks.length === 0 ? (
                        <p className="text-[11px] text-stone-400 italic font-sans py-3 pl-1">No tasks recorded...</p>
                      ) : (
                        dayTasks.map(task => (
                          <div key={task.id} className="flex items-center gap-2 py-0.5 pr-2">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.completed ? 'bg-stone-300' : 'bg-secondary'}`} />
                            <span className={`text-xs font-medium truncate ${task.completed ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                              {task.title}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Task Inline creation for this day specifically */}
                  <div className="mt-4 pt-3.5 border-t border-stone-100/80 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add task..."
                      value={inlineTaskTitles[day.dateStr] || ''}
                      onChange={(e) => setInlineTaskTitles({ ...inlineTaskTitles, [day.dateStr]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddInlineTask(day.dateStr);
                      }}
                      className="flex-1 text-[11px] font-sans text-stone-800 bg-stone-50 border border-stone-200/50 rounded-xl px-2.5 py-2 outline-none focus:ring-1 focus:ring-primary/20 placeholder-stone-400/90"
                    />
                    <button
                      onClick={() => handleAddInlineTask(day.dateStr)}
                      className="p-2 bg-stone-100 hover:bg-[#8C6A5C] hover:text-white text-stone-500 rounded-xl transition-all cursor-pointer"
                      title="Add task inline"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Weekly intentions, goals, quote section (4 cols) */}
        <div className="lg:col-span-4 space-y-7">
          
          {/* Weekly goal intentions */}
          <div className="bg-white/80 backdrop-blur border border-stone-200/50 rounded-[2rem] p-6 shadow-sm shadow-stone-200/10">
            <div className="bg-[#FAF1E6] p-4 rounded-2xl border border-[#EDE2D4] text-center">
              <Sparkles size={18} className="mx-auto text-secondary mb-1" />
              <h4 className="font-serif text-sm font-bold text-stone-800">Weekly Intention</h4>
              <p className="text-[10px] text-stone-400">A deliberate compass guiding your energy this week</p>
            </div>

            <div className="mt-6">
              <label htmlFor="weekly-goals-textarea" className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Focus Objectives</label>
              <textarea
                id="weekly-goals-textarea"
                value={weeklyGoal}
                onChange={(e) => saveWeeklyGoal(e.target.value)}
                rows={4}
                placeholder="Declare your objectives here..."
                className="w-full bg-[#FCFAF7] border border-stone-200 rounded-2xl p-3.5 mt-2 text-xs text-stone-700 font-sans leading-relaxed focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="mt-4 p-4 rounded-2xl border border-stone-200/30 bg-[#FFFDFB] text-left">
              <h5 className="font-serif font-extrabold text-xs text-stone-700">Affirmation</h5>
              <p className="font-sans text-[11px] text-stone-500 mt-1 leading-relaxed">
                "I release urgency. Work will unfold beautifully on solid sand, styled by clear intention and deliberate presence."
              </p>
            </div>
          </div>

          {/* Inspirational Digital sticker look */}
          <div className="p-6 rounded-[2rem] bg-gradient-to-tr from-[#9BB0A5]/10 to-[#FAF1E6]/40 border border-stone-200/40 flex flex-col justify-between min-h-[160px] relative overflow-hidden">
            <div className="absolute right-0 bottom-0 text-[100px] stroke-[0.1] text-stone-200/20 font-serif select-none pointer-events-none translate-y-6 translate-x-3">
              🌿
            </div>
            
            <div>
              <span className="text-[9px] uppercase font-bold text-[#8C6A5C]">Mindful Reminder</span>
              <p className="font-serif text-stone-700 italic font-medium text-sm mt-2 leading-relaxed">
                "Small, steady strides across the sands create beautifully crafted landscapes of accomplishment."
              </p>
            </div>
            
            <div className="pt-4 border-t border-stone-200/20">
              <span className="text-[9px] font-mono text-stone-400 uppercase">Boho Planner Digital Book</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
