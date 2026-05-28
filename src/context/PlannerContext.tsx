import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Task, ScheduleItem, Habit, QuickNote, Diary } from '../types';
import { parseLocalDate, formatLocalDateString, formatLocalTimeString } from '../utils/dateUtils';

interface FocusItem {
  title: string;
  isPriority: boolean;
  duration: string;
  completed: boolean;
}

interface UserProfile {
  email: string;
  name: string;
  avatarUrl?: string;
}

export function translateNotification(msg: string): { en: string; ar: string } {
  // Enforce pristine English notifications per user preference
  const text = msg.trim();
  return {
    en: text,
    ar: text
  };
}

export interface Toast {
  id: string;
  message: string;
  messageEn: string;
  messageAr: string;
  type: 'success' | 'info' | 'error';
}

interface PlannerContextType {
  // Navigation & Date Context
  activeTab: 'daily' | 'weekly' | 'monthly' | 'habits' | 'settings' | 'studio' | 'diaries';
  setActiveTab: (tab: 'daily' | 'weekly' | 'monthly' | 'habits' | 'settings' | 'studio' | 'diaries') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentDate: string; // 'YYYY-MM-DD'
  setCurrentDate: (date: string) => void;
  currentTime: string; // 'hh:mm AM/PM'
  setCurrentTime: (time: string) => void;
  virtualTimeConfigured: boolean;
  setVirtualTimeConfigured: (val: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;

  // Active Persistent Alarm & sound
  activeAlarm: { id: string; title: string; time: string; reason?: string } | null;
  dismissAlarm: () => void;

  // Data Queries
  tasks: Task[];
  schedules: ScheduleItem[];
  habits: Habit[];
  habitHistory: Record<string, Record<string, number>>;
  focusItem: FocusItem;
  gratitude: string;
  quickNote: QuickNote;
  userProfile: UserProfile;
  diaries: Diary[];

  // Toast Notifications
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Mutations (Mocked React-Query handlers with date and CRUD capabilities)
  addTask: (title: string, priority?: boolean, date?: string, time?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  
  addSchedule: (item: Omit<ScheduleItem, 'id'>, date?: string) => void;
  deleteSchedule: (id: string) => void;
  editSchedule: (id: string, updates: Partial<Omit<ScheduleItem, 'id'>>) => void;

  incrementHabit: (id: string) => void;
  decrementHabit: (id: string) => void;
  addHabit: (name: string, icon: string, target: number, unit: string) => void;
  deleteHabit: (id: string) => void;

  toggleFocusCompleted: () => void;
  updateFocusItem: (title: string, isPriority: boolean, duration: string) => void;

  updateGratitude: (text: string) => void;
  updateQuickNote: (text: string, labels?: string[]) => void;
  updateUserProfile: (name: string, email: string, avatarUrl?: string) => void;

  addDiary: (title: string, content: string, mood?: string, date?: string) => void;
  updateDiary: (id: string, updates: Partial<Omit<Diary, 'id'>>) => void;
  deleteDiary: (id: string) => void;

  // Dialog Controllers
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  modalInitialTab: 'task' | 'schedule' | 'focus';
  setModalInitialTab: (tab: 'task' | 'schedule' | 'focus') => void;
  editingItem: { type: 'task' | 'schedule'; id: string } | null;
  setEditingItem: (item: { type: 'task' | 'schedule'; id: string } | null) => void;
  openAddModal: (tab?: 'task' | 'schedule' | 'focus') => void;
  openEditModal: (type: 'task' | 'schedule', id: string) => void;

  // Active Workspace User Identity Scope
  activeIdentity: string;
  setActiveIdentity: (id: string) => void;
  dailyImage: string;
  saveDailyImage: (val: string) => void;
  deleteDailyImage: () => void;

  // Statuses (to mimic react-query state)
  isLoading: boolean;
  accentStyle: 'classic' | 'girls' | 'boys';
  setAccentStyle: (style: 'classic' | 'girls' | 'boys') => void;
}

const THEMES = {
  classic: {
    primary: '#8c6a5c', // Earthy Clay Brown
    secondary: '#d36b54', // Boho Terracotta
    tertiary: '#8da698', // Soft Sage Green
    'tertiary-container': '#fcf8f2', // Delicate Warm Sand
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff',
    bg: '#FAF6F0', // Creamy Warm Paper
    sidebar: '#EFE8DC', // Rich clay-board beige
    'active-tab': '#FFFBF6', // Milky paper highlight
    border: '#DECDB3' // Earthy sand borders
  },
  girls: {
    primary: '#B87E88', // Sweet Vintage Pink Lavender
    secondary: '#D68997', // Soft Dusty Rose Pink
    tertiary: '#9BB2A4', // Sweet Sage
    'tertiary-container': '#FFF6F6', // Cozy Strawberry Milk / Light Pink
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff',
    bg: '#FCF5F6', // Dreamy elegant soft rose back-screen
    sidebar: '#F5E2E5', // Warm mauve-pink diary margins
    'active-tab': '#FFF9FA', // Sparkling high-contrast rose white
    border: '#E8CFD4' // Cozy soft pink borders
  },
  boys: {
    primary: '#4F7085', // Cool Deep Steel Slate Blue
    secondary: '#5584AC', // Soft Breeze Sky Blue
    tertiary: '#8BA498', // Spruce Pine Green
    'tertiary-container': '#F2F7FA', // Cold Mist Oasis Cream
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff',
    bg: '#F5F8FA', // Majestic nordic misty ice-blue background
    sidebar: '#E1ECEF', // Steel-colored slate notebook spine
    'active-tab': '#F9FBFD', // Bright high-contrast glacial white
    border: '#C2D4DB' // Glacial steel-blue borders
  }
};

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const getLocalDateString = (d: Date = new Date()) => formatLocalDateString(d);
const getLocalTimeString = (d: Date = new Date()) => formatLocalTimeString(d);

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'habits' | 'settings' | 'studio' | 'diaries'>('daily');
  const [activeAlarm, setActiveAlarm] = useState<{ id: string; title: string; time: string; reason?: string } | null>(null);

  const dismissAlarm = () => {
    setActiveAlarm(null);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Real device-synchronized calendar tracking state
  const [currentDate, setCurrentDateState] = useState(() => {
    return localStorage.getItem('aura_virtual_date') || getLocalDateString(new Date());
  });
  const [currentTime, setCurrentTimeState] = useState(() => {
    return localStorage.getItem('aura_virtual_time') || getLocalTimeString(new Date());
  });
  const [virtualTimeConfigured, setVirtualTimeConfiguredState] = useState(() => {
    return localStorage.getItem('aura_virtual_time_configured') === 'true';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [habitHistory, setHabitHistory] = useState<Record<string, Record<string, number>>>({});

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const newId = Date.now().toString() + Math.random();
    const translated = translateNotification(message);
    setToasts(prev => [...prev, { 
      id: newId, 
      message, 
      messageEn: translated.en, 
      messageAr: translated.ar, 
      type 
    }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newId));
    }, 4500); // 4.5s so they have time to easily read both languages!
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Live ticking device clock loop to synchronize the digital clock with mobile phone
  useEffect(() => {
    const syncWithDevice = () => {
      const d = new Date();
      
      // Update the current device time
      setCurrentTimeState(getLocalTimeString(d));

      // Auto update active day based on device calendar date roll-over, unless manually specified
      if (!localStorage.getItem('aura_virtual_date')) {
        setCurrentDateState(getLocalDateString(d));
      }
    };
    syncWithDevice();
    const interval = setInterval(syncWithDevice, 1000);
    return () => clearInterval(interval);
  }, []);

  const [accentStyle, setAccentStyleState] = useState<'classic' | 'girls' | 'boys'>(() => {
    const val = localStorage.getItem('aura_accent_style');
    if (val === 'classic' || val === 'girls' || val === 'boys') {
      return val;
    }
    return 'classic';
  });

  const setAccentStyle = (style: 'classic' | 'girls' | 'boys') => {
    setAccentStyleState(style);
    localStorage.setItem('aura_accent_style', style);
  };

  useEffect(() => {
    const theme = THEMES[accentStyle] || THEMES.classic;
    if (theme) {
      Object.entries(theme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--theme-${key}`, value as string);
      });
    }
  }, [accentStyle]);

  const setCurrentDate = (date: string) => {
    setCurrentDateState(date);
    localStorage.setItem('aura_virtual_date', date);
    addToast(`Successfully changed active day to ${date} 📅`, 'info');
  };

  const setCurrentTime = (time: string) => {
    setCurrentTimeState(time);
    localStorage.setItem('aura_virtual_time', time);
  };

  const setVirtualTimeConfigured = (val: boolean) => {
    setVirtualTimeConfiguredState(val);
    localStorage.setItem('aura_virtual_time_configured', String(val));
  };

  // Dialog Controller States
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'task' | 'schedule' | 'focus'>('task');
  const [editingItem, setEditingItem] = useState<{ type: 'task' | 'schedule'; id: string } | null>(null);

  const openAddModal = (tab: 'task' | 'schedule' | 'focus' = 'task') => {
    setEditingItem(null);
    setModalInitialTab(tab);
    setIsQuickAddOpen(true);
  };

  const openEditModal = (type: 'task' | 'schedule', id: string) => {
    setEditingItem({ type, id });
    setModalInitialTab(type === 'task' ? 'task' : 'schedule');
    setIsQuickAddOpen(true);
  };

  // Active identity state configuration
  const [activeIdentity, setActiveIdentityState] = useState<string>(() => {
    return localStorage.getItem('aura_active_identity') || 'Sarah';
  });

  const setActiveIdentity = (id: string) => {
    const cleanId = id.trim().replace(/[^a-zA-Z0-9 _-]/g, '') || 'Sarah';
    setActiveIdentityState(cleanId);
    localStorage.setItem('aura_active_identity', cleanId);
    addToast(`Switched active workspace identity to: ${cleanId} 🔑`, 'success');
  };

  // Daily backdrop image state
  const [dailyImage, setDailyImage] = useState<string>('');

  useEffect(() => {
    const loadedImg = localStorage.getItem(`aura_daily_image_${activeIdentity}_${currentDate}`) || '';
    setDailyImage(loadedImg);
  }, [activeIdentity, currentDate]);

  const saveDailyImage = (val: string) => {
    setDailyImage(val);
    localStorage.setItem(`aura_daily_image_${activeIdentity}_${currentDate}`, val);
  };

  const deleteDailyImage = () => {
    setDailyImage('');
    localStorage.removeItem(`aura_daily_image_${activeIdentity}_${currentDate}`);
  };

  // Core States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [focusByDate, setFocusByDate] = useState<Record<string, FocusItem>>({});
  const [gratitudeByDate, setGratitudeByDate] = useState<Record<string, string>>({});
  const [quickNote, setQuickNote] = useState<QuickNote>({
    text: '',
    labels: ['Idea', 'Project Aura']
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    email: 'tsraathmd@gmail.com',
    name: 'Sarah Ahmed'
  });

  // Load from local storage depending on activeIdentity
  useEffect(() => {
    setIsLoading(true);
    try {
      const suffix = `_${activeIdentity}`;
      const storedTasks = localStorage.getItem(`aura_tasks${suffix}`);
      const storedSchedules = localStorage.getItem(`aura_schedules${suffix}`);
      const storedHabits = localStorage.getItem(`aura_habits${suffix}`);
      const storedFocusByDate = localStorage.getItem(`aura_focus_by_date${suffix}`);
      const storedGratitudeByDate = localStorage.getItem(`aura_gratitude_by_date${suffix}`);
      const storedNote = localStorage.getItem(`aura_note${suffix}`);
      const storedProfile = localStorage.getItem(`aura_profile${suffix}`);
      const storedDiaries = localStorage.getItem(`aura_diaries${suffix}`);
      const storedHistory = localStorage.getItem(`aura_habit_history${suffix}`);

      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        const defaultTasks: Task[] = [
          { id: 't-1', title: 'Start your brand new journal entry 🌸', completed: false, priority: true, date: currentDate },
          { id: 't-2', title: 'Complete first daily focus', completed: false, priority: false, date: currentDate },
        ];
        setTasks(defaultTasks);
        localStorage.setItem(`aura_tasks${suffix}`, JSON.stringify(defaultTasks));
      }

      if (storedSchedules) {
        setSchedules(JSON.parse(storedSchedules));
      } else {
        const defaultSchedules: ScheduleItem[] = [
          { id: 's-1', time: '09:00 AM', title: 'Morning Walk & Refresh', subtitle: 'Step outside for fresh air', category: 'break', date: currentDate },
          { id: 's-2', time: '11:00 AM', title: 'Core Task Brainstorming', subtitle: 'Work on daily priorities', category: 'work', date: currentDate }
        ];
        setSchedules(defaultSchedules);
        localStorage.setItem(`aura_schedules${suffix}`, JSON.stringify(defaultSchedules));
      }

      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      } else {
        const defaultHabits: Habit[] = [
          { id: 'h1', name: 'Hydration', icon: 'Droplets', count: 0, target: 8, unit: 'cups', colorClass: 'text-secondary hover:bg-secondary/10' },
          { id: 'h2', name: 'Step Goal', icon: 'Footprints', count: 0, target: 10000, unit: 'steps', colorClass: 'text-primary hover:bg-primary/10' },
          { id: 'h3', name: 'Reading', icon: 'BookOpen', count: 0, target: 30, unit: 'pages', colorClass: 'text-secondary hover:bg-secondary/10' }
        ];
        setHabits(defaultHabits);
        localStorage.setItem(`aura_habits${suffix}`, JSON.stringify(defaultHabits));
      }

      if (storedFocusByDate) {
        setFocusByDate(JSON.parse(storedFocusByDate));
      } else {
        const initialFocusObj = {
          [currentDate]: {
            title: 'Unwind and write inside My Mindful Journal 🎨',
            isPriority: true,
            duration: '30 mins focus',
            completed: false
          }
        };
        setFocusByDate(initialFocusObj);
        localStorage.setItem(`aura_focus_by_date${suffix}`, JSON.stringify(initialFocusObj));
      }

      if (storedGratitudeByDate) {
        setGratitudeByDate(JSON.parse(storedGratitudeByDate));
      } else {
        const initialGratitudeObj = {
          [currentDate]: 'I am grateful for high-performance, beautiful layouts and cozy digital planners.'
        };
        setGratitudeByDate(initialGratitudeObj);
        localStorage.setItem(`aura_gratitude_by_date${suffix}`, JSON.stringify(initialGratitudeObj));
      }

      if (storedDiaries) {
        setDiaries(JSON.parse(storedDiaries));
      } else {
        const defaultDiaries: Diary[] = [
          {
            id: 'd1',
            date: currentDate,
            title: `Welcome back to your safe space!`,
            content: `This is a safe workspace journal. Every user has their own secure identity code. All details and thoughts you record here are completely locked under your custom identity. Keep exploring and writing daily memories!`,
            mood: '🌸 Serene'
          }
        ];
        setDiaries(defaultDiaries);
        localStorage.setItem(`aura_diaries${suffix}`, JSON.stringify(defaultDiaries));
      }

      if (storedNote) {
        setQuickNote(JSON.parse(storedNote));
      } else {
        const defaultQuickNote = { text: 'Type a cozy dynamic quick reminder here...', labels: ['Cozy', 'Memory'] };
        setQuickNote(defaultQuickNote);
        localStorage.setItem(`aura_note${suffix}`, JSON.stringify(defaultQuickNote));
      }

      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        const defaultProfile = { name: activeIdentity, email: `${activeIdentity.toLowerCase()}@planner.com` };
        setUserProfile(defaultProfile);
        localStorage.setItem(`aura_profile${suffix}`, JSON.stringify(defaultProfile));
      }

      if (storedHistory) {
        setHabitHistory(JSON.parse(storedHistory));
      } else {
        setHabitHistory({});
        localStorage.setItem(`aura_habit_history${suffix}`, JSON.stringify({}));
      }

    } catch (e) {
      console.error("Failed loading from localStorage keyed for identity", e);
    } finally {
      setIsLoading(false);
    }
  }, [activeIdentity]);

  // Save changes helper
  const save = (key: string, data: any) => {
    localStorage.setItem(`${key}_${activeIdentity}`, JSON.stringify(data));
  };

// MUTATIONS
  const addTask = (title: string, priority = false, date?: string, time?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      priority,
      date: date || currentDate,
      time
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    save('aura_tasks', updated);
    addToast('Successfully added a new task! 📝', 'success');
  };

  const toggleTask = (id: string) => {
    const matched = tasks.find(t => t.id === id);
    const wasCompleted = matched?.completed;
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    save('aura_tasks', updated);
    if (!wasCompleted) {
      addToast('Great job! Task accomplished successfully 🌟', 'success');
    } else {
      addToast('Task has been reopened to active lists ⏳', 'info');
    }
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    save('aura_tasks', updated);
    addToast('Task removed from list successfully 🗑️', 'info');
  };

  const editTask = (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    setTasks(updated);
    save('aura_tasks', updated);
    addToast('Task details edited successfully ✏️', 'success');
  };

  const addSchedule = (item: Omit<ScheduleItem, 'id'>, date?: string) => {
    const newItem: ScheduleItem = {
      ...item,
      id: Date.now().toString(),
      date: date || currentDate
    };
    
    const getVal = (tStr: string) => {
      if (!tStr) return 12 * 60;
      const cleaned = tStr.trim().toUpperCase();
      
      const ampmMatch = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
      if (ampmMatch) {
        let hours = parseInt(ampmMatch[1], 10);
        const minutes = parseInt(ampmMatch[2], 10);
        const modifier = ampmMatch[3];
        if (hours === 12 && modifier === 'AM') hours = 0;
        if (hours !== 12 && modifier === 'PM') hours += 12;
        return hours * 60 + minutes;
      }
      
      const shortMatch = cleaned.match(/^(\d{1,2}):(\d{2})$/);
      if (shortMatch) {
        const hours = parseInt(shortMatch[1], 10);
        const minutes = parseInt(shortMatch[2], 10);
        return hours * 60 + minutes;
      }
      
      const singleMatch = cleaned.match(/^(\d{1,2})\s*(AM|PM)$/);
      if (singleMatch) {
        let hours = parseInt(singleMatch[1], 10);
        const modifier = singleMatch[2];
        if (hours === 12 && modifier === 'AM') hours = 0;
        if (hours !== 12 && modifier === 'PM') hours += 12;
        return hours * 60;
      }

      return 12 * 60;
    };

    const updated = [...schedules, newItem].sort((a, b) => getVal(a.time) - getVal(b.time));
    setSchedules(updated);
    save('aura_schedules', updated);
    addToast('Hourly plan successfully added to calendar ⏰', 'success');
  };

  const editSchedule = (id: string, updates: Partial<Omit<ScheduleItem, 'id'>>) => {
    const updatedSchedules = schedules.map(s => s.id === id ? { ...s, ...updates } : s);
    const getVal = (tStr: string) => {
      if (!tStr) return 12 * 60;
      const cleaned = tStr.trim().toUpperCase();
      
      const ampmMatch = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
      if (ampmMatch) {
        let hours = parseInt(ampmMatch[1], 10);
        const minutes = parseInt(ampmMatch[2], 10);
        const modifier = ampmMatch[3];
        if (hours === 12 && modifier === 'AM') hours = 0;
        if (hours !== 12 && modifier === 'PM') hours += 12;
        return hours * 60 + minutes;
      }
      
      const shortMatch = cleaned.match(/^(\d{1,2}):(\d{2})$/);
      if (shortMatch) {
        const hours = parseInt(shortMatch[1], 10);
        const minutes = parseInt(shortMatch[2], 10);
        return hours * 60 + minutes;
      }
      
      const singleMatch = cleaned.match(/^(\d{1,2})\s*(AM|PM)$/);
      if (singleMatch) {
        let hours = parseInt(singleMatch[1], 10);
        const modifier = singleMatch[2];
        if (hours === 12 && modifier === 'AM') hours = 0;
        if (hours !== 12 && modifier === 'PM') hours += 12;
        return hours * 60;
      }

      return 12 * 60;
    };
    const sorted = [...updatedSchedules].sort((a, b) => getVal(a.time) - getVal(b.time));
    setSchedules(sorted);
    save('aura_schedules', sorted);
    addToast('Hourly plan details updated successfully ✨', 'success');
  };

  const deleteSchedule = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    save('aura_schedules', updated);
    addToast('Hourly slot successfully deleted from list 🗑️', 'info');
  };

  const incrementHabit = (id: string) => {
    let finalCount = 0;
    const h = habits.find(x => x.id === id);
    if (!h) return;
    const currentCount = habitHistory[currentDate]?.[id] ?? 0;
    const jump = h.unit === 'steps' ? 1000 : 1;
    finalCount = Math.min(currentCount + jump, h.target * 1.5);

    setHabitHistory(prev => {
      const next = {
        ...prev,
        [currentDate]: {
          ...(prev[currentDate] || {}),
          [id]: finalCount
        }
      };
      save('aura_habit_history', next);
      return next;
    });
  };

  const decrementHabit = (id: string) => {
    let finalCount = 0;
    const h = habits.find(x => x.id === id);
    if (!h) return;
    const currentCount = habitHistory[currentDate]?.[id] ?? 0;
    const jump = h.unit === 'steps' ? 1000 : 1;
    finalCount = Math.max(currentCount - jump, 0);

    setHabitHistory(prev => {
      const next = {
        ...prev,
        [currentDate]: {
          ...(prev[currentDate] || {}),
          [id]: finalCount
        }
      };
      save('aura_habit_history', next);
      return next;
    });
  };

  const addHabit = (name: string, icon: string, target: number, unit: string) => {
    const colors = [
      'text-primary hover:bg-primary/10',
      'text-secondary hover:bg-secondary/10',
      'text-tertiary hover:bg-tertiary/10'
    ];
    const pickedColor = colors[habits.length % colors.length];
    const newHabit: Habit = {
      id: 'h_' + Date.now(),
      name,
      icon,
      count: 0,
      target,
      unit,
      colorClass: pickedColor
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    save('aura_habits', updated);
    addToast('New habit registered successfully for today 🌱', 'success');
  };

  const deleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    save('aura_habits', updated);
    addToast('Habit successfully removed from tracking 🗑️', 'info');
  };

  const toggleFocusCompleted = () => {
    const currentFocus = focusByDate[currentDate] || { title: 'My Main Focus Goal', isPriority: false, duration: '1h', completed: false };
    const updated = { ...currentFocus, completed: !currentFocus.completed };
    const nextObj = { ...focusByDate, [currentDate]: updated };
    setFocusByDate(nextObj);
    save('aura_focus_by_date', nextObj);
    addToast(updated.completed ? 'Congratulations! You achieved your core target for today 🎉🏆' : 'Daily focus returned to active path 🧭', 'success');
  };

  const updateFocusItem = (title: string, isPriority: boolean, duration: string) => {
    const currentFocus = focusByDate[currentDate] || { title: 'My Main Focus Goal', isPriority: false, duration: '1h', completed: false };
    const updated = { ...currentFocus, title, isPriority, duration };
    const nextObj = { ...focusByDate, [currentDate]: updated };
    setFocusByDate(nextObj);
    save('aura_focus_by_date', nextObj);
    addToast('Updated your main daily focus successfully 🎯', 'success');
  };

  const updateGratitude = (text: string) => {
    const nextObj = { ...gratitudeByDate, [currentDate]: text };
    setGratitudeByDate(nextObj);
    save('aura_gratitude_by_date', nextObj);
  };

  const updateQuickNote = (text: string, labels?: string[]) => {
    const updated = {
      text,
      labels: labels !== undefined ? labels : quickNote.labels
    };
    setQuickNote(updated);
    save('aura_note', updated);
  };

  const updateUserProfile = (name: string, email: string, avatarUrl?: string) => {
    const updated = { name, email, avatarUrl };
    setUserProfile(updated);
    save('aura_profile', updated);
    addToast('Successfully updated your bohemian profile details 🌸', 'success');
  };

  const addDiary = (title: string, content: string, mood?: string, date?: string) => {
    const newDiary: Diary = {
      id: 'd_' + Date.now(),
      date: date || currentDate,
      title,
      content,
      mood: mood || '🌸 Thoughtful'
    };
    const updated = [newDiary, ...diaries];
    setDiaries(updated);
    save('aura_diaries', updated);
    addToast('New diary entry saved successfully! 📝', 'success');
  };

  const updateDiary = (id: string, updates: Partial<Omit<Diary, 'id'>>) => {
    const updated = diaries.map(d => d.id === id ? { ...d, ...updates } : d);
    setDiaries(updated);
    save('aura_diaries', updated);
    addToast('Diary entry updated successfully! ✏️', 'success');
  };

  const deleteDiary = (id: string) => {
    const updated = diaries.filter(d => d.id !== id);
    setDiaries(updated);
    save('aura_diaries', updated);
    addToast('Diary entry deleted successfully 🗑️', 'info');
  };

  // 1. Storage for already notified items to prevent spamming
  const notifiedItemsRef = useRef<Set<string>>(new Set());

  // 2. Request Notification Permission on Mount safely
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          addToast('Alarms and notification services activated successfully! 🔔', 'success');
        }
      });
    }
  }, []);

  // 3. Reminder ticking thread
  useEffect(() => {
    const checkReminders = () => {
      // Current simulated time format is e.g. "09:00 AM" or "09:00 PM"
      const simTime = currentTime.trim().toUpperCase();

      // Current system device time
      const sysDate = new Date();
      let sysHours = sysDate.getHours();
      const sysMins = String(sysDate.getMinutes()).padStart(2, '0');
      const sysAmpm = sysHours >= 12 ? 'PM' : 'AM';
      sysHours = sysHours % 12;
      sysHours = sysHours ? sysHours : 12; // 0 is 12
      const sysTimeStr = `${String(sysHours).padStart(2, '0')}:${sysMins} ${sysAmpm}`;

      // Retrieve items for CURRENT selected date only
      const todaysPlans = schedules.filter(s => s.date === currentDate);
      const todaysTimedTasks = tasks.filter(t => t.date === currentDate && t.time);

      const notifyUser = (id: string, itemTimeStr: string, title: string, subtitle: string) => {
        const keyStr = `${currentDate}_${id}`;
        if (notifiedItemsRef.current.has(keyStr)) return;

        const formattedPlanTime = itemTimeStr.trim().toUpperCase();

        // Match if virtual time reached OR if real device time matches!
        if (formattedPlanTime === simTime || formattedPlanTime === sysTimeStr) {
          notifiedItemsRef.current.add(keyStr);

          // Set active persistent alarm! (sound loop triggers automatically from state)
          setActiveAlarm({
            id,
            title,
            time: itemTimeStr,
            reason: subtitle || 'Your Current Timetable Plan'
          });

          // Mobile check: only trigger native system alert if on laptop/desktop
          const isLaptop = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

          if (isLaptop && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`⏰ Schedule Alert: ${title}`, {
                body: `It is time for your plan: ${subtitle || 'Your schedule details'}`,
                icon: 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=128',
                requireInteraction: true // Keeps the notification on-screen until closed
              });
            } catch (notiErr) {
              console.warn("Native Notification failed", notiErr);
            }
          }

          // Inject Toast notification
          addToast(`🔔 Plan Reminder: ${title} is starting now (${itemTimeStr})`, 'info');
        }
      };

      // Check schedules
      todaysPlans.forEach(p => {
        notifyUser(p.id, p.time, p.title, p.subtitle);
      });

      // Check tasks
      todaysTimedTasks.forEach(t => {
        if (t.time) {
          notifyUser(t.id, t.time, t.title, 'Scheduled Task Action');
        }
      });
    };

    checkReminders();
    const intervalId = setInterval(checkReminders, 12000); // Ticking checks
    return () => clearInterval(intervalId);
  }, [currentTime, currentDate, schedules, tasks]);

  // 4. Repeated Cozy Wind Chime Melody for Active Alarm (Repeats until dismissed!)
  useEffect(() => {
    if (!activeAlarm) return;

    const playCozyAlarmChime = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const audioCtx = new AudioContext();
        
        // Beautiful rich wind chime notes (C5, E5, G5, C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const startTime = audioCtx.currentTime + idx * 0.16;
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.connect(g);
          g.connect(audioCtx.destination);
          
          o.type = 'triangle'; // Warm woodwind tone
          o.frequency.setValueAtTime(freq, startTime);
          
          g.gain.setValueAtTime(0, startTime);
          g.gain.linearRampToValueAtTime(0.08, startTime + 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.95);
          
          o.start(startTime);
          o.stop(startTime + 1.05);
        });

        setTimeout(() => {
          audioCtx.close();
        }, 1800);
      } catch (e) {
        console.warn("Chime generation failed", e);
      }
    };

    playCozyAlarmChime();
    const interval = setInterval(playCozyAlarmChime, 2200);
    return () => clearInterval(interval);
  }, [activeAlarm]);

  // Derived date-specific values dynamically computed based on activeDate
  const activeFocusItem: FocusItem = focusByDate[currentDate] || {
    title: '',
    isPriority: false,
    duration: '1h',
    completed: false
  };

  const activeGratitudeText: string = gratitudeByDate[currentDate] ?? '';

  const activeHabits: Habit[] = habits.map(h => ({
    ...h,
    count: habitHistory[currentDate]?.[h.id] ?? 0
  }));

  return (
    <PlannerContext.Provider value={{
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      currentDate,
      setCurrentDate,
      currentTime,
      setCurrentTime,
      virtualTimeConfigured,
      setVirtualTimeConfigured,
      isSidebarOpen,
      setIsSidebarOpen,
      activeAlarm,
      dismissAlarm,
      tasks,
      schedules,
      habits: activeHabits, // Derived dynamic list
      habitHistory,
      focusItem: activeFocusItem, // Derived dynamic item
      gratitude: activeGratitudeText, // Derived dynamic text
      quickNote,
      userProfile,
      toasts,
      addToast,
      removeToast,
      addTask,
      toggleTask,
      deleteTask,
      editTask,
      addSchedule,
      deleteSchedule,
      editSchedule,
      incrementHabit,
      decrementHabit,
      addHabit,
      deleteHabit,
      toggleFocusCompleted,
      updateFocusItem,
      updateGratitude,
      updateQuickNote,
      updateUserProfile,
      diaries,
      addDiary,
      updateDiary,
      deleteDiary,
      isQuickAddOpen,
      setIsQuickAddOpen,
      modalInitialTab,
      setModalInitialTab,
      editingItem,
      setEditingItem,
      openAddModal,
      openEditModal,
      isLoading,
      accentStyle,
      setAccentStyle,
      activeIdentity,
      setActiveIdentity,
      dailyImage,
      saveDailyImage,
      deleteDailyImage
    }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error('usePlanner must be used within a PlannerProvider');
  return context;
}
