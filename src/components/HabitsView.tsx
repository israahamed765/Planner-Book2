import React, { useState } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  Sparkles, 
  Check, 
  Lightbulb, 
  Droplet, 
  Footprints, 
  BookOpen, 
  Flower2, 
  Smile, 
  Coffee,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function HabitsView() {
  const {
    currentDate,
    habits,
    habitHistory,
    addHabit,
    deleteHabit,
    incrementHabit,
    decrementHabit,
  } = usePlanner();

  // New Habit Drawer/Form states
  const [habitName, setHabitName] = useState('');
  const [habitTarget, setHabitTarget] = useState(8);
  const [habitUnit, setHabitUnit] = useState('cups');
  const [habitIcon, setHabitIcon] = useState('Droplets');

  const handleCreateHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim() || habitTarget <= 0) return;
    addHabit(habitName.trim(), habitIcon, habitTarget, habitUnit.trim());
    setHabitName('');
    // Reset to generic indicators
    setHabitUnit('cups');
    setHabitTarget(8);
  };

  // Get past 7 calendar days relative to currentDate to display in grid columns
  const getPast7Days = () => {
    try {
      const base = new Date(currentDate);
      if (isNaN(base.getTime())) return [];
      const list = [];
      for (let i = 6; i >= 0; i--) {
        const itemDate = new Date(base);
        itemDate.setDate(base.getDate() - i);

        const yyyy = itemDate.getFullYear();
        const mm = String(itemDate.getMonth() + 1).padStart(2, '0');
        const dd = String(itemDate.getDate()).padStart(2, '0');
        const formatted = `${yyyy}-${mm}-${dd}`;

        list.push({
          dateStr: formatted,
          dayNum: itemDate.getDate(),
          dayLabelNarrow: itemDate.toLocaleDateString('en-US', { weekday: 'narrow' }),
          displayLabel: itemDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
        });
      }
      return list;
    } catch {
      return [];
    }
  };

  const past7Days = getPast7Days();

  // Helper matching habit icons
  const renderIcon = (name: string) => {
    switch (name) {
      case 'Droplets': return <Droplet size={18} />;
      case 'Footprints': return <Footprints size={18} />;
      case 'BookOpen': return <BookOpen size={18} />;
      case 'Coffee': return <Coffee size={18} />;
      case 'Smile': return <Smile size={18} />;
      default: return <Flower2 size={18} />;
    }
  };

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white/40 backdrop-blur-md rounded-[2.2rem] p-7 border border-white/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Mindful Habits • Habit Tracker</span>
          <h1 className="font-serif text-3xl font-bold text-stone-800 tracking-tight mt-0.5">
            Habit Logbook
          </h1>
          <p className="font-sans text-xs text-[#8C6A5C] font-semibold mt-1">
            Keep track of your daily mindful routines and check your consistency over the last 7 days.
          </p>
        </div>

        {/* Informative advice sticker */}
        <div className="bg-white/70 px-5 py-3 rounded-2xl border border-[#E9DFD3] text-left shrink-0 max-w-xs">
          <span className="text-[9px] uppercase font-bold text-secondary flex items-center gap-1">
            <TrendingUp size={11} /> Mindful Habit Loop
          </span>
          <p className="text-[10px] text-stone-500 mt-1 leading-snug">
            Caring for yourself is not a sprint. Every drop of water, every page read, sculpts your peaceful state.
          </p>
        </div>
      </div>

      {/* Grid: Habits lists Left vs Creation Panel Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Habit Trackers Grid list (Spans 8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {habits.length === 0 ? (
            <div className="bg-white border rounded-[2rem] p-12 text-center border-stone-200/50">
              <Flower2 size={36} className="mx-auto text-stone-300 mb-2" />
              <p className="font-serif font-semibold text-stone-600 text-sm">No custom habits found</p>
              <p className="text-xs text-stone-400 mt-1">Create a custom habit in the form card to start tracking!</p>
            </div>
          ) : (
            habits.map((habit) => {
              const currentVal = habit.count;
              const completedPercent = Math.min((currentVal / habit.target) * 100, 100);

              return (
                <div
                  key={habit.id}
                  className="bg-white border border-stone-200/40 rounded-[2rem] p-6 shadow-sm shadow-stone-200/5 relative overflow-hidden"
                >
                  {/* Top segment: Title + Targets + Delete */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#FCFAF7] border border-stone-100 rounded-2xl text-[#8C6A5C] shrink-0">
                        {renderIcon(habit.icon)}
                      </div>
                      <div className="text-left">
                        <h3 className="font-serif text-base font-extrabold text-stone-800">
                          {habit.name}
                        </h3>
                        <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                          Daily Target: <span className="font-bold">{habit.target} {habit.unit}</span> (Currently: <span className="font-bold text-secondary">{currentVal}</span>)
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Remove habit completely"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Increment adjusters */}
                  <div className="mt-4 flex items-center gap-3 bg-[#FCFAF7] p-3 rounded-2xl border border-stone-200/10">
                    <div className="flex-1 text-left">
                      <span className="text-[10px] font-bold text-stone-400 uppercase">Interactive Adjuster</span>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-[#d36b54] h-full rounded-full transition-all duration-300"
                          style={{ width: `${completedPercent}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => decrementHabit(habit.id)}
                        className="p-1 px-2.5 bg-white hover:bg-stone-100 text-stone-500 rounded-xl border border-stone-200/30 text-xs font-bold cursor-pointer transition-all"
                      >
                        -
                      </button>
                      <button
                        onClick={() => incrementHabit(habit.id)}
                        className="p-1 px-2.5 bg-[#8C6A5C] hover:bg-[#745548] text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 7-day Habit History micro blocks */}
                  <div className="mt-5 border-t border-stone-100 pt-4">
                    <span className="text-[10px] font-bold text-stone-400 uppercase block text-left mb-2 tracking-wider">Last 7 Days Record</span>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {past7Days.map((day) => {
                        // Find this day's history record
                        const dayRecord = habitHistory[day.dateStr]?.[habit.id] || 0;
                        const isGoalMet = dayRecord >= habit.target;
                        const isPartial = dayRecord > 0 && dayRecord < habit.target;

                        return (
                          <div
                            key={day.dateStr}
                            title={`${day.displayLabel}: ${dayRecord} recorded`}
                            className="p-2 bg-[#FCFAF7] border border-stone-200/10 rounded-xl flex flex-col items-center justify-between"
                          >
                            <span className="text-[9px] font-mono font-bold text-stone-400">
                              {day.dayLabelNarrow}
                            </span>
                            
                            {/* Visual completion bullet */}
                            <div className="mt-1.5">
                              {isGoalMet ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                                  <Check size={11} className="stroke-[3]" />
                                </div>
                              ) : isPartial ? (
                                <div className="w-5 h-5 rounded-full border border-dashed border-[#d36b54] bg-[#FAF2E8]/40 text-[#d36b54] flex items-center justify-center text-[8px] font-bold font-mono">
                                  {Math.round((dayRecord / habit.target) * 10)}
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-stone-200 bg-stone-100/30" />
                              )}
                            </div>

                            <span className="text-[8px] text-stone-400 font-mono mt-1">
                              {day.dayNum}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Habit Formulator Cards panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Create Habit Form */}
          <div className="bg-white/80 backdrop-blur border border-stone-200/50 rounded-[2rem] p-6 shadow-sm shadow-stone-200/10">
            <span className="text-[10px] tracking-wider uppercase font-bold text-secondary">Boho Formulator</span>
            <h3 className="font-serif text-lg font-bold text-stone-800 mt-1 mb-4 leading-snug">
              Add New Habit
            </h3>

            <form onSubmit={handleCreateHabitSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Habit Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Morning Meditation..."
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 text-xs bg-[#FCFAF7] border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-sans">Objective Goal</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g., 8"
                    value={habitTarget}
                    onChange={(e) => setHabitTarget(parseInt(e.target.value) || 1)}
                    className="w-full mt-1 px-3.5 py-2.5 text-xs bg-[#FCFAF7] border border-stone-200 rounded-xl outline-none text-stone-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-sans">Unit Metric</label>
                  <input
                    required
                    type="text"
                    placeholder="cups, steps, mins"
                    value={habitUnit}
                    onChange={(e) => setHabitUnit(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 text-xs bg-[#FCFAF7] border border-stone-200 rounded-xl outline-none text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Pick an Icon Badge</label>
                <div className="grid grid-cols-5 gap-2 mt-1.5">
                  {[
                    { key: 'Droplets', label: '💧' },
                    { key: 'Footprints', label: '👟' },
                    { key: 'BookOpen', label: '📖' },
                    { key: 'Coffee', label: '☕' },
                    { key: 'Smile', label: '🌸' }
                  ].map((ic) => (
                    <button
                      key={ic.key}
                      type="button"
                      onClick={() => setHabitIcon(ic.key)}
                      className={`py-2 rounded-xl text-lg border transition-all cursor-pointer ${
                        habitIcon === ic.key
                          ? 'bg-[#8C6A5C] text-white border-[#8C6A5C]'
                          : 'bg-stone-50 hover:bg-stone-100 border-stone-200/50 text-stone-700'
                      }`}
                    >
                      {ic.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 bg-[#d36b54] hover:bg-[#b0533e] text-white font-bold text-xs rounded-full shadow-md hover:scale-[1.01] active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                Formulate Habit
              </button>
            </form>
          </div>

          {/* Static advice card */}
          <div className="p-5 rounded-[2rem] border border-stone-200/30 bg-[#FCFAF6] text-left">
            <h4 className="font-serif font-bold text-xs text-stone-700 flex items-center gap-1.5">
              <Lightbulb size={13} className="text-[#8c6a5c]" /> Habit formation advice
            </h4>
            <p className="font-sans text-[11px] text-stone-500 leading-relaxed mt-2.5">
              Begin small: choosing low friction targets (e.g., 2 steps or 5 pages of reading) builds strong habits faster than imposing mammoth requirements instantly. Follow a daily rhythmic pattern!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
