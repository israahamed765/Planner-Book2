import React, { useState, useEffect } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, ClipboardList, Clock, Sparkles, Check, Trash2 } from 'lucide-react';

export default function QuickAddModal() {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    modalInitialTab,
    setModalInitialTab,
    editingItem,
    setEditingItem,
    currentDate,
    tasks,
    schedules,
    addTask,
    editTask,
    deleteTask,
    addSchedule,
    editSchedule,
    deleteSchedule,
    focusItem,
    updateFocusItem,
  } = usePlanner();

  const [activeSegment, setActiveSegment] = useState<'task' | 'schedule' | 'focus'>('task');

  // Task Form States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState(false);
  const [taskDate, setTaskDate] = useState(currentDate);
  const [taskTime, setTaskTime] = useState('');

  // Schedule Form States
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleSubtitle, setScheduleSubtitle] = useState('');
  const [scheduleHour, setScheduleHour] = useState('09');
  const [scheduleMinute, setScheduleMinute] = useState('00');
  const [schedulePeriod, setSchedulePeriod] = useState('AM');
  const [scheduleCategory, setScheduleCategory] = useState('work');
  const [scheduleDate, setScheduleDate] = useState(currentDate);

  // Focus Form States
  const [focusTitle, setFocusTitle] = useState(focusItem.title);
  const [focusIsPriority, setFocusIsPriority] = useState(focusItem.isPriority);
  const [focusDuration, setFocusDuration] = useState(focusItem.duration);

  // Synchronize when modal opens or active inputs change
  useEffect(() => {
    if (isQuickAddOpen) {
      setTaskDate(currentDate);
      setScheduleDate(currentDate);
      
      if (editingItem) {
        setActiveSegment(editingItem.type);
        if (editingItem.type === 'task') {
          const matched = tasks.find(t => t.id === editingItem.id);
          if (matched) {
            setTaskTitle(matched.title);
            setTaskPriority(matched.priority);
            setTaskDate(matched.date);
            setTaskTime(matched.time || '');
          }
        } else if (editingItem.type === 'schedule') {
          const matched = schedules.find(s => s.id === editingItem.id);
          if (matched) {
            setScheduleTitle(matched.title);
            setScheduleSubtitle(matched.subtitle);
            setScheduleCategory(matched.category);
            setScheduleDate(matched.date);
            
            // Try parsing the time like "09:00 AM" or "9:30 PM"
            const timeMatch = matched.time.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
            if (timeMatch) {
              setScheduleHour(timeMatch[1].padStart(2, '0'));
              setScheduleMinute(timeMatch[2].padStart(2, '0'));
              setSchedulePeriod(timeMatch[3].toUpperCase());
            } else {
              setScheduleHour('09');
              setScheduleMinute('00');
              setSchedulePeriod('AM');
            }
          }
        }
      } else {
        // Reset defaults for creation
        setActiveSegment(modalInitialTab);
        setTaskTitle('');
        setTaskPriority(false);
        setTaskTime('');
        setScheduleTitle('');
        setScheduleSubtitle('');
        setScheduleHour('09');
        setScheduleMinute('00');
        setSchedulePeriod('AM');
        setScheduleCategory('work');
        
        // Sync Focus defaults
        setFocusTitle(focusItem.title);
        setFocusIsPriority(focusItem.isPriority);
        setFocusDuration(focusItem.duration);
      }
    }
  }, [isQuickAddOpen, editingItem, modalInitialTab, currentDate, tasks, schedules, focusItem]);

  const handleClose = () => {
    setIsQuickAddOpen(false);
    setEditingItem(null);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingItem && editingItem.type === 'task') {
      editTask(editingItem.id, {
        title: taskTitle.trim(),
        priority: taskPriority,
        date: taskDate,
        time: taskTime.trim() || undefined
      });
    } else {
      addTask(taskTitle.trim(), taskPriority, taskDate, taskTime.trim() || undefined);
    }
    handleClose();
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim()) return;

    const formattedTime = `${scheduleHour}:${scheduleMinute} ${schedulePeriod}`;
    
    if (editingItem && editingItem.type === 'schedule') {
      editSchedule(editingItem.id, {
        title: scheduleTitle.trim(),
        subtitle: scheduleSubtitle.trim(),
        category: scheduleCategory,
        time: formattedTime,
        date: scheduleDate
      });
    } else {
      addSchedule({
        title: scheduleTitle.trim(),
        subtitle: scheduleSubtitle.trim(),
        category: scheduleCategory,
        time: formattedTime,
        date: scheduleDate
      });
    }
    handleClose();
  };

  const handleFocusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusTitle.trim()) return;

    updateFocusItem(focusTitle.trim(), focusIsPriority, focusDuration.trim() || '1h Goal');
    handleClose();
  };

  const handleDeleteItem = () => {
    if (!editingItem) return;
    if (editingItem.type === 'task') {
      deleteTask(editingItem.id);
    } else {
      deleteSchedule(editingItem.id);
    }
    handleClose();
  };

  return (
    <AnimatePresence>
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#2C2421]/30 backdrop-blur-md"
          />

          {/* Modal content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative bg-[#FCFAF7] border border-stone-200/60 rounded-[2.2rem] shadow-2xl w-full max-w-lg p-7 overflow-hidden z-10 font-sans"
          >
            {/* Top Close */}
            <button
              onClick={handleClose}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-stone-200/40 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Title / Description */}
            <div className="mb-6">
              <span className="text-[10px] tracking-wider uppercase font-bold text-stone-400 flex items-center gap-1">
                <Sparkles size={11} className="text-secondary" />
                {editingItem ? 'Edit Existing' : 'Create New'}
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-800 mt-1">
                {editingItem ? 'Update Details' : 'Add to Planner'}
              </h2>
            </div>

            {/* Segment Controls (Disabled during Editing to lock item scope) */}
            {!editingItem && (
              <div className="flex bg-[#EFECE6] p-1 rounded-full mb-6 relative">
                {[
                  { id: 'task', label: 'Task', icon: ClipboardList },
                  { id: 'schedule', label: 'Daily Plan / Schedule', icon: Clock },
                  { id: 'focus', label: 'Primary Focus', icon: Calendar },
                ].map(seg => {
                  const IconComp = seg.icon;
                  return (
                    <button
                      key={seg.id}
                      onClick={() => setActiveSegment(seg.id as any)}
                      className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all relative z-10 cursor-pointer flex items-center justify-center gap-1.5 ${
                        activeSegment === seg.id
                          ? 'bg-white text-stone-800 shadow-sm'
                          : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      <IconComp size={13} />
                      <span>{seg.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Form Content */}
            <AnimatePresence mode="wait">
              {activeSegment === 'task' && (
                <motion.form
                  key="task-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleTaskSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Task Title</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Water the visual garden..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primaryoutline outline-none text-stone-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Date Reference</label>
                      <input
                        required
                        type="date"
                        value={taskDate}
                        onChange={(e) => setTaskDate(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primaryoutline outline-none text-stone-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Time (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., 03:00 PM"
                        value={taskTime}
                        onChange={(e) => setTaskTime(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primaryoutline outline-none text-stone-700"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-stone-100/50 rounded-2xl border border-stone-200/30">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800">Priority Item</h4>
                      <p className="text-[10px] text-stone-400">Pins task to the high-priority bento block</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTaskPriority(!taskPriority)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                        taskPriority ? 'bg-secondary' : 'bg-stone-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-200 ${
                          taskPriority ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-200/40">
                    {editingItem ? (
                      <button
                        type="button"
                        onClick={handleDeleteItem}
                        className="px-4 py-2.5 rounded-full hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} />
                        Delete Task
                      </button>
                    ) : <div />}
                    
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-on-primary font-bold text-xs rounded-full shadow-lg hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      {editingItem ? 'Save Edits' : 'Add Task'}
                    </button>
                  </div>
                </motion.form>
              )}

              {activeSegment === 'schedule' && (
                <motion.form
                  key="schedule-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleScheduleSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Plan Title / Hourly Focus</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g., UI Design Brainstorming..."
                        value={scheduleTitle}
                        onChange={(e) => setScheduleTitle(e.target.value)}
                        className="w-full mt-1.5 px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primaryoutline outline-none text-stone-800"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Subtitle / Room / Notes</label>
                      <input
                        type="text"
                        placeholder="e.g., Focus with coffee on the sofa..."
                        value={scheduleSubtitle}
                        onChange={(e) => setScheduleSubtitle(e.target.value)}
                        className="w-full mt-1.5 px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primaryoutline outline-none text-stone-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Hour Select */}
                    <div>
                      <label htmlFor="modal-hour-select" className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Plan Hour</label>
                      <select
                        id="modal-hour-select"
                        value={scheduleHour}
                        onChange={(e) => setScheduleHour(e.target.value)}
                        className="w-full mt-1.5 border border-stone-200 bg-white rounded-xl px-2.5 py-2.5 text-xs text-stone-700 outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    {/* Minute Select */}
                    <div>
                      <label htmlFor="modal-minute-select" className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Plan Minute</label>
                      <select
                        id="modal-minute-select"
                        value={scheduleMinute}
                        onChange={(e) => setScheduleMinute(e.target.value)}
                        className="w-full mt-1.5 border border-stone-200 bg-white rounded-xl px-2.5 py-2.5 text-xs text-stone-700 outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* AM/PM Select */}
                    <div>
                      <label htmlFor="modal-period-select" className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Period</label>
                      <select
                        id="modal-period-select"
                        value={schedulePeriod}
                        onChange={(e) => setSchedulePeriod(e.target.value)}
                        className="w-full mt-1.5 border border-stone-200 bg-white rounded-xl px-2.5 py-2.5 text-xs text-stone-700 outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="modal-category-select" className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Category Tag</label>
                      <select
                        id="modal-category-select"
                        value={scheduleCategory}
                        onChange={(e) => setScheduleCategory(e.target.value)}
                        className="w-full mt-1.5 border border-stone-200 bg-white rounded-xl px-3 py-2.5 text-xs text-stone-700 outline-none focus:ring-2 focus:ring-primary/20 mt-1 cursor-pointer"
                      >
                        <option value="work">💼 Work / Deep focus</option>
                        <option value="meditation">🧘 meditation / Mindfulness</option>
                        <option value="sync">🗣️ Sync / Collaboration</option>
                        <option value="break">☕ Pause / Break</option>
                        <option value="self-care">🌿 Selfcare / Healthy</option>
                        <option value="exercise">💪 Exercise / Gym</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Scheduled Date</label>
                      <input
                        required
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full mt-1.5 px-3 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-stone-700"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-200/40">
                    {editingItem ? (
                      <button
                        type="button"
                        onClick={handleDeleteItem}
                        className="px-4 py-2.5 rounded-full hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} />
                        Delete Plan
                      </button>
                    ) : <div />}

                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#8C6A5C] hover:bg-[#745548] text-white font-bold text-xs rounded-full shadow-lg hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      {editingItem ? 'Save Edits' : 'Add to Schedule'}
                    </button>
                  </div>
                </motion.form>
              )}

              {activeSegment === 'focus' && (
                <motion.form
                  key="focus-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleFocusSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Daily Focus Title</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Complete styling for Boho Planner core specs..."
                      value={focusTitle}
                      onChange={(e) => setFocusTitle(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primaryoutline outline-none text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Time / Project Scope Label</label>
                    <input
                      type="text"
                      placeholder="e.g., 2h Design Sprint"
                      value={focusDuration}
                      onChange={(e) => setFocusDuration(e.target.value)}
                      className="w-full mt-1.5 px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primaryoutline outline-none text-stone-800"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-stone-100/50 rounded-2xl border border-stone-200/30">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800">High Stakes Priority</h4>
                      <p className="text-[10px] text-stone-400">Flag this as the ultimate highlight of your 24 hours</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFocusIsPriority(!focusIsPriority)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                        focusIsPriority ? 'bg-secondary' : 'bg-stone-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-200 ${
                          focusIsPriority ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-stone-200/40">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#d36b54] hover:bg-[#b0533e] text-white font-bold text-xs rounded-full shadow-lg hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      Update Focus
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
