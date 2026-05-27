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
  // If the message already contains a spacer/divider, split it!
  if (msg.includes(' • ')) {
    const parts = msg.split(' • ');
    return { en: parts[0].trim(), ar: parts[1].trim() };
  }
  if (msg.includes(' | ')) {
    const parts = msg.split(' | ');
    return { en: parts[0].trim(), ar: parts[1].trim() };
  }

  const text = msg.trim();

  // Handle template strings
  if (text.includes('تم تغيير اليوم النشط إلى')) {
    const date = text.replace('تم تغيير اليوم النشط إلى', '').replace('📅', '').trim();
    return {
      en: `Active day changed to ${date} 📅`,
      ar: `تم تغيير اليوم النشط إلى ${date} 📅`
    };
  }

  if (text.includes('تنبيه الخطة:')) {
    const clean = text.replace('🔔 تنبيه الخطة:', '').trim();
    return {
      en: `⏰ Schedule Alert: It is time for ${clean}!`,
      ar: `🔔 تنبيه الخطة: حان وقت ${clean} الآن!`
    };
  }

  if (text.includes('خطة زمنية مجدولة حان وقتها في')) {
    const time = text.split('حان وقتها في').pop()?.trim() || '';
    return {
      en: `⏰ Scheduled plan is running at ${time}`,
      ar: `هذه خطة زمنية مجدولة حان وقتها في ${time}`
    };
  }

  if (text.includes('تم تغيير طابع ألوان المفكرة إلى')) {
    const themeName = text.replace('تم تغيير طابع ألوان المفكرة إلى', '').trim();
    return {
      en: `Palette style successfully updated to ${themeName}! 🎨`,
      ar: `تم تغيير طابع ألوان المفكرة إلى ${themeName}`
    };
  }

  if (text.includes('تم تشغيل المقطع الصوتي المهدئ')) {
    return {
      en: 'Playing soothing soundscapes ambiance! 🔊🌸',
      ar: 'تم تشغيل المقطع الصوتي المهدئ للأعصاب!'
    };
  }

  // Dictionary mapping
  const dict: Record<string, { en: string; ar: string }> = {
    'تمت إضافة مهمة جديدة بنجاح! 📝': {
      en: 'Primary task created successfully! 📝',
      ar: 'تمت إضافة مهمة جديدة بنجاح! 📝'
    },
    'عمل رائع! تم إنجاز المهمة بنجاح 🌟': {
      en: 'Great job! Task accomplished successfully 🌟',
      ar: 'عمل رائع! تم إنجاز المهمة بنجاح 🌟'
    },
    'تمت إعادة فتح المهمة للعمل ⏳': {
      en: 'Task reopened for active progress ⏳',
      ar: 'تمت إعادة فتح المهمة للعمل ⏳'
    },
    'تم حذف المهمة تماماً من القائمة 🗑️': {
      en: 'Task successfully deleted 🗑️',
      ar: 'تم حذف المهمة تماماً من القائمة 🗑️'
    },
    'تم تعديل تفاصيل المهمة بنجاح ✏️': {
      en: 'Task details updated successfully ✏️',
      ar: 'تم تعديل تفاصيل المهمة بنجاح ✏️'
    },
    'تمت إضافة خطة زمنية جديدة لجدول اليوم ⏰': {
      en: 'New hour block added to schedule ⏰',
      ar: 'تمت إضافة خطة زمنية جديدة لجدول اليوم ⏰'
    },
    'تم تحديث خطتك الزمنية بنجاح ✨': {
      en: 'Schedule block updated successfully ✨',
      ar: 'تم تحديث خطتك الزمنية بنجاح ✨'
    },
    'تم حذف الخطة من جدول اليوم 🗑️': {
      en: 'Schedule block removed successfully 🗑️',
      ar: 'تم حذف الخطة من جدول اليوم 🗑️'
    },
    'تم تسجيل عادة جديدة لتتبعها اليوم 🌱': {
      en: 'New daily habit registered 🌱',
      ar: 'تم تسجيل عادة جديدة لتتبعها اليوم 🌱'
    },
    'تمت إزالة العادة من المتتبع بنجاح 🗑️': {
      en: 'Habit deleted successfully 🗑️',
      ar: 'تمت إزالة العادة من المتتبع بنجاح 🗑️'
    },
    'تهانينا! لقد حققت نيتك وهدفك اليومي اليوم 🎉🏆': {
      en: 'Congratulations! Your primary intent is fulfilled 🎉🏆',
      ar: 'تهانينا! لقد حققت نيتك اليومية اليوم 🎉🏆'
    },
    'تمت إعادة النية اليومية إلى المسار النشط 🧭': {
      en: 'Daily focus returned to active path 🧭',
      ar: 'تمت إعادة النية اليومية إلى المسار النشط 🧭'
    },
    'تمت إعادة المهمة للمسار النشط': {
      en: 'Task set back to active status 🧭',
      ar: 'تمت إعادة المهمة للمسار النشط'
    },
    'تهانينا! تم إنجاز خطتك المستديرة بنجاح 🎉': {
      en: 'Congratulations! Cycle plan completed 🎉',
      ar: 'تهانينا! تم إنجاز خطتك المستديرة بنجاح 🎉'
    },
    'تم تحديث النية والهدف الرئيسي لليوم 🎯': {
      en: 'Primary daily focus updated 🎯',
      ar: 'تم تحديث النية والهدف الرئيسي لليوم 🎯'
    },
    'تم تحديث ملفك الشخصي الأنيق بنجاح 🌸': {
      en: 'Cozy user profile updated successfully 🌸',
      ar: 'تم تحديث ملفك الشخصي الأنيق بنجاح 🌸'
    },
    'تم تفعيل إشعارات المهام والمواعيد بنجاح! 🔔': {
      en: 'Task notifications enabled successfully! 🔔',
      ar: 'تم تفعيل إشعارات المهام والمواعيد بنجاح! 🔔'
    },
    'هذا المتصفح لا يدعم التنبيهات المباشرة ⚠️': {
      en: 'This browser does not support live desktop alerts ⚠️',
      ar: 'هذا المتصفح لا يدعم التنبيهات المباشرة ⚠️'
    },
    'تم تفعيل إشعارات سطح المكتب والتنبيهات المباشرة بنجاح! 🔔✨': {
      en: 'Desktop notifications successfully enabled! 🔔✨',
      ar: 'تم تفعيل إشعارات سطح المكتب والتنبيهات المباشرة بنجاح! 🔔✨'
    },
    'تم رفض الإشعارات. يرجى تفعيلها يدوياً من إعدادات المتصفح بجانب رابط الموقع 🔒': {
      en: 'Permissions denied. Activate manually in browser preferences 🔒',
      ar: 'يرجى تفعيلها يدوياً من إعدادات المتصفح بجانب رابط الموقع 🔒'
    },
    'تمت صياغة تصدير وحفظ نسخة احتياطية كاملة من بياناتك بنجاح! 💾✨': {
      en: 'Complete database backup saved successfully! 💾✨',
      ar: 'تمت صياغة تصدير وحفظ نسخة احتياطية كاملة بنجاح! 💾✨'
    },
    'عذراً، حدث خطأ ما أثناء تصدير نسخة احتياطية ⚠️': {
      en: 'Could not export database backup ⚠️',
      ar: 'عذراً، حدث خطأ ما أثناء تصدير نسخة احتياطية ⚠️'
    },
    'تم قراءة ملف النسخة الاحتياطية بنجاح! يتم الآن إعادة المزامنة... 🔄🌿': {
      en: 'Restore complete! Database synchronization in progress... 🔄🌿',
      ar: 'تم قراءة ملف النسخة الاحتياطية بنجاح! يتم الآن إعادة المزامنة... 🔄🌿'
    },
    'صلابة ملف النسخة غير متوافقة أو تالفة ⚠️': {
      en: 'Corrupted backup file structure ⚠️',
      ar: 'صلابة ملف النسخة غير متوافقة أو تالفة ⚠️'
    },
    'تمت إعادة تهيئة وتنظيف لوحة البيانات بنجاح كامل! سيتم تدوير الصفحة الآن... 🧼': {
      en: 'Database purged & reset successfully! Reloading... 🧼',
      ar: 'تمت إعادة تهيئة وتنظيف لوحة البيانات بنجاح كامل! 🧼'
    },
    'تم تحميل صورتك وتجهيز معاينتها 📸': {
      en: 'Avatar uploaded and updated 📸',
      ar: 'تم تحميل صورتك وتجهيز معاينتها 📸'
    },
    'يرجى كتابة رقم الهوية الشخصية لإتمام عملية الربط ⚠️': {
      en: 'Please type personal ID code first ⚠️',
      ar: 'يرجى كتابة رقم الهوية الشخصية لإتمام عملية الربط ⚠️'
    },
    '🌱 تم الربط المتبادل ومزامنة كافة بيانات هويتك مع تطبيق معلوماتي بنجاح الاستباقي للعمل!': {
      en: 'Identity verification synchronized via Maaloumati! 🌱',
      ar: 'تم الربط ومزامنة البيانات بهوية معلوماتي بنجاح! 🌱'
    },
    'تم فك ربط تطبيق معلوماتي بنجاح 🕊️': {
      en: 'Maaloumati identity unlinked cleanly 🕊️',
      ar: 'تم فك ربط تطبيق معلوماتي بنجاح 🕊️'
    },
    'الرجاء رفع صورة بحجم أصغر من 1 ميجابايت لتناسب سعة المتصفح التخزينية! 📸⚠️': {
      en: 'Please upload image smaller than 1MB to fit storage! 📸⚠️',
      ar: 'الرجاء رفع صورة بحجم أصغر من 1 ميجابايت للتخزين 📸⚠️'
    },
    'تم تزيين تخطيطك اليومي بالصورة بنجاح! 🌸✨': {
      en: 'Daily journal backdrop image set successfully! 🌸✨',
      ar: 'تم تزيين تخطيطك اليومي بالصورة بنجاح! 🌸✨'
    },
    'تم اختيار لقطة فنية دافئة لليوم! 🎨🌿': {
      en: 'Warm artistic photo added to journal! 🎨🌿',
      ar: 'تم اختيار لقطة فنية دافئة لليوم! 🎨🌿'
    },
    'تمت إزالة صورة اليوم تماماً 🗑️': {
      en: 'Backdrop picture removed completely 🗑️',
      ar: 'تمت إزالة صورة اليوم تماماً 🗑️'
    },
    'المتصفح لا يدعم توليد الصوت الاصطناعي ⚠️': {
      en: 'Your browser does not support synthesized audio ⚠️',
      ar: 'المتصفح لا يدعم توليد الصوت الاصطناعي ⚠️'
    },
    '🌸 تم تشغيل المقطع الصوتي المهدئ للأعصاب!': {
      en: 'Playing soothing forest ambiance audio! 🌸',
      ar: 'تم تشغيل المقطع الصوتي المهدئ للأعصاب! 🌸'
    },
    'فشل تفعيل نظام الصوت الاصطناعي ⚠️': {
      en: 'Failed to initiate forest sound synthesis ⚠️',
      ar: 'فشل تفعيل نظام الصوت الاصطناعي ⚠️'
    },
    'تم إخفاء التنبيه بنجاح، يمكنك التسجيل لاحقاً من قسم الإعدادات 🤍': {
      en: 'Banner hidden. Register anytime from Settings 🤍',
      ar: 'تم إخفاء التنبيه بنجاح، يمكنك التسجيل لاحقاً 🤍'
    }
  };

  if (dict[text]) {
    return dict[text];
  }

  const hasArabic = /[\u0600-\u06FF]/.test(text);
  if (hasArabic) {
    return {
      en: 'Mindful Reminder 🔔',
      ar: text
    };
  }

  return {
    en: text,
    ar: ''
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
    addToast(`تم تغيير اليوم النشط إلى ${date} 📅`, 'info');
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

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('aura_tasks');
      const storedSchedules = localStorage.getItem('aura_schedules');
      const storedHabits = localStorage.getItem('aura_habits');
      const storedFocusByDate = localStorage.getItem('aura_focus_by_date');
      const storedGratitudeByDate = localStorage.getItem('aura_gratitude_by_date');
      const storedNote = localStorage.getItem('aura_note');
      const storedProfile = localStorage.getItem('aura_profile');

      if (storedTasks) {
        // Safe migration: check if any task lacks a date field
        let parsedTasks: Task[] = JSON.parse(storedTasks);
        let migrated = false;
        parsedTasks = parsedTasks.map(t => {
          if (!t.date) {
            migrated = true;
            return { ...t, date: '2026-05-24' };
          }
          return t;
        });
        setTasks(parsedTasks);
        if (migrated) {
          localStorage.setItem('aura_tasks', JSON.stringify(parsedTasks));
        }
      } else {
        // Mock default tasks across a few days in Week 21 of 2026 (May 24 is Sunday)
        const defaultTasks: Task[] = [
          { id: 't-1', title: 'Review brand palette', completed: true, priority: true, date: '2026-05-24' },
          { id: 't-2', title: 'Update style tokens', completed: false, priority: false, date: '2026-05-24' },
          { id: 't-3', title: 'Weekly standup notes', completed: false, priority: false, date: '2026-05-24' },
          { id: 't-4', title: 'Schedule therapist appt', completed: false, priority: false, date: '2026-05-24' },
          
          { id: 't-5', title: 'Review brand designs with partner', completed: false, priority: true, date: '2026-05-22' },
          { id: 't-6', title: 'Optimize SVGs', completed: true, priority: false, date: '2026-05-23' },
          { id: 't-7', title: 'Call agency partners', completed: false, priority: false, date: '2026-05-23' },
          { id: 't-8', title: 'Yoga session', completed: false, priority: false, date: '2026-05-23' },
          { id: 't-9', title: 'Record tutorial screencast', completed: false, priority: true, date: '2026-05-25' },
          { id: 't-10', title: 'Push main design tokens', completed: false, priority: true, date: '2026-05-26' },
          { id: 't-11', title: 'Clean desk', completed: true, priority: false, date: '2026-05-26' },
        ];
        setTasks(defaultTasks);
        localStorage.setItem('aura_tasks', JSON.stringify(defaultTasks));
      }

      if (storedSchedules) {
        // Safe migration for schedule items
        let parsedSchedules: ScheduleItem[] = JSON.parse(storedSchedules);
        let migrated = false;
        parsedSchedules = parsedSchedules.map(s => {
          if (!s.date) {
            migrated = true;
            return { ...s, date: '2026-05-24' };
          }
          return s;
        });
        setSchedules(parsedSchedules);
        if (migrated) {
          localStorage.setItem('aura_schedules', JSON.stringify(parsedSchedules));
        }
      } else {
        // Mock default schedule items
        const defaultSchedules: ScheduleItem[] = [
          { id: 's-1', time: '07:00 AM', title: 'Morning Meditation', subtitle: 'Mindfulness Practice', category: 'meditation', date: '2026-05-24' },
          { id: 's-2', time: '09:00 AM', title: 'Deep Work: UI Design', subtitle: 'Main Dashboard Components', category: 'work', date: '2026-05-24' },
          { id: 's-3', time: '11:00 AM', title: 'Client Sync Call', subtitle: 'Aura Planner Project', category: 'sync', date: '2026-05-24' },
          { id: 's-4', time: '03:00 PM', title: 'Afternoon Tea', subtitle: 'Rest and Recharge', category: 'break', date: '2026-05-24' },
          
          { id: 's-5', time: '09:00 AM', title: 'Kickoff brainstorm', subtitle: 'New feature concepts', category: 'work', date: '2026-05-23' },
          { id: 's-6', time: '11:00 AM', title: 'Sync with engineering team', subtitle: 'Implementation overview', category: 'sync', date: '2026-05-25' },
          { id: 's-7', time: '03:00 PM', title: 'Team lunch celebration', subtitle: 'Post-launch relax', category: 'break', date: '2026-05-25' }
        ];
        setSchedules(defaultSchedules);
        localStorage.setItem('aura_schedules', JSON.stringify(defaultSchedules));
      }

      if (storedHabits) setHabits(JSON.parse(storedHabits));
      else {
        // Mock default habits
        const defaultHabits: Habit[] = [
          { id: 'h1', name: 'Hydration', icon: 'Droplets', count: 3, target: 8, unit: 'cups', colorClass: 'text-secondary hover:bg-secondary/10' },
          { id: 'h2', name: 'Step Goal', icon: 'Footprints', count: 6500, target: 10000, unit: 'steps', colorClass: 'text-primary hover:bg-primary/10' },
          { id: 'h3', name: 'Reading', icon: 'BookOpen', count: 15, target: 30, unit: 'pages', colorClass: 'text-secondary hover:bg-secondary/10' },
          { id: 'h4', name: 'Zen Time', icon: 'Flower2', count: 10, target: 20, unit: 'mins', colorClass: 'text-primary hover:bg-primary/10' },
        ];
        setHabits(defaultHabits);
        localStorage.setItem('aura_habits', JSON.stringify(defaultHabits));
      }

      if (storedFocusByDate) {
        setFocusByDate(JSON.parse(storedFocusByDate));
      } else {
        const legacyFocus = localStorage.getItem('aura_focus');
        const initialFocus = legacyFocus ? JSON.parse(legacyFocus) : {
          title: 'تصميم واجهة لوحة الإعدادات الأنيقة وترقية نظام التنبيهات',
          isPriority: true,
          duration: '3h Project',
          completed: false
        };
        const initialObj = {
          [currentDate]: initialFocus,
          '2026-05-24': {
            title: 'حفظ ومراجعة سورة الكهف وقراءة حصن المسلم',
            isPriority: true,
            duration: '1h Spiritual',
            completed: true
          }
        };
        setFocusByDate(initialObj);
        localStorage.setItem('aura_focus_by_date', JSON.stringify(initialObj));
      }

      if (storedGratitudeByDate) {
        setGratitudeByDate(JSON.parse(storedGratitudeByDate));
      } else {
        const legacyGratitude = localStorage.getItem('aura_gratitude');
        const initialGratitude = legacyGratitude ? JSON.parse(legacyGratitude) : 'ممتن للقرآن الكريم، وصلاة الفجر بروحانية، ولحظات فنجان الينسون الدافئة مع عائلتي اليوم.';
        const initialObj = {
          [currentDate]: initialGratitude,
          '2026-05-24': 'شاكرة جداً لنسمات الصباح الباردة وطاقة الإنجاز والهمة العالية في ترتيب غرفتي اليوم.'
        };
        setGratitudeByDate(initialObj);
        localStorage.setItem('aura_gratitude_by_date', JSON.stringify(initialObj));
      }

      const storedDiaries = localStorage.getItem('aura_diaries');
      if (storedDiaries) {
        setDiaries(JSON.parse(storedDiaries));
      } else {
        const defaultDiaries: Diary[] = [
          {
            id: 'd1',
            date: '2026-05-26',
            title: 'A Beautiful Sunny Morning',
            content: 'Today was absolutely mesmerizing. I woke up early, enjoyed a warm cup of herbal tea while listening to the birds chirping, and managed to complete all my design layouts before noon. Feeling so focused and peaceful.',
            mood: '🌸 Serene'
          },
          {
            id: 'd2',
            date: '2026-05-27',
            title: 'Mindful Evening Relax',
            content: 'Spent the evening reading a classic novel under the warm light of my boho room lamp. Self-care starts with a quiet mind and a grateful heart. Ready to plan out a beautiful tomorrow.',
            mood: '🧘 Peaceful'
          }
        ];
        setDiaries(defaultDiaries);
        localStorage.setItem('aura_diaries', JSON.stringify(defaultDiaries));
      }

      if (storedNote) setQuickNote(JSON.parse(storedNote));
      if (storedProfile) setUserProfile(JSON.parse(storedProfile));

      const storedHistory = localStorage.getItem('aura_habit_history');
      if (storedHistory) {
        setHabitHistory(JSON.parse(storedHistory));
      } else {
        const mockHist: Record<string, Record<string, number>> = {
          '2026-05-24': { h1: 3, h2: 6500, h3: 15, h4: 10 },
          '2026-05-23': { h1: 5, h2: 8000, h3: 20, h4: 15 },
          '2026-05-22': { h1: 8, h2: 11000, h3: 30, h4: 20 },
          '2026-05-21': { h1: 4, h2: 5500, h3: 10, h4: 5 },
          '2026-05-20': { h1: 6, h2: 9500, h3: 25, h4: 0 },
          '2026-05-19': { h1: 7, h2: 12000, h3: 35, h4: 18 },
          '2026-05-18': { h1: 3, h2: 6500, h3: 15, h4: 10 },
          '2026-05-17': { h1: 8, h2: 10500, h3: 30, h4: 20 },
          '2026-05-16': { h1: 4, h2: 7000, h3: 12, h4: 5 },
          '2026-05-15': { h1: 6, h2: 9000, h3: 25, h4: 15 },
        };
        setHabitHistory(mockHist);
        localStorage.setItem('aura_habit_history', JSON.stringify(mockHist));
      }

    } catch (e) {
      console.error("Failed loading from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save changes helper
  const save = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
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
    addToast('تمت إضافة مهمة جديدة بنجاح! 📝', 'success');
  };

  const toggleTask = (id: string) => {
    const matched = tasks.find(t => t.id === id);
    const wasCompleted = matched?.completed;
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    save('aura_tasks', updated);
    if (!wasCompleted) {
      addToast('عمل رائع! تم إنجاز المهمة بنجاح 🌟', 'success');
    } else {
      addToast('تمت إعادة فتح المهمة للعمل ⏳', 'info');
    }
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    save('aura_tasks', updated);
    addToast('تم حذف المهمة تماماً من القائمة 🗑️', 'info');
  };

  const editTask = (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...updates } : t);
    setTasks(updated);
    save('aura_tasks', updated);
    addToast('تم تعديل تفاصيل المهمة بنجاح ✏️', 'success');
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
    addToast('تمت إضافة خطة زمنية جديدة لجدول اليوم ⏰', 'success');
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
    addToast('تم تحديث خطتك الزمنية بنجاح ✨', 'success');
  };

  const deleteSchedule = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);
    save('aura_schedules', updated);
    addToast('تم حذف الخطة من جدول اليوم 🗑️', 'info');
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
    addToast('تم تسجيل عادة جديدة لتتبعها اليوم 🌱', 'success');
  };

  const deleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    save('aura_habits', updated);
    addToast('تمت إزالة العادة من المتتبع بنجاح 🗑️', 'info');
  };

  const toggleFocusCompleted = () => {
    const currentFocus = focusByDate[currentDate] || { title: 'مهمة جديدة', isPriority: false, duration: '1h', completed: false };
    const updated = { ...currentFocus, completed: !currentFocus.completed };
    const nextObj = { ...focusByDate, [currentDate]: updated };
    setFocusByDate(nextObj);
    save('aura_focus_by_date', nextObj);
    addToast(updated.completed ? 'تهانينا! لقد حققت نيتك وهدفك اليومي اليوم 🎉🏆' : 'تمت إعادة النية اليومية إلى المسار النشط 🧭', 'success');
  };

  const updateFocusItem = (title: string, isPriority: boolean, duration: string) => {
    const currentFocus = focusByDate[currentDate] || { title: 'مهمة جديدة', isPriority: false, duration: '1h', completed: false };
    const updated = { ...currentFocus, title, isPriority, duration };
    const nextObj = { ...focusByDate, [currentDate]: updated };
    setFocusByDate(nextObj);
    save('aura_focus_by_date', nextObj);
    addToast('تم تحديث النية والهدف الرئيسي لليوم 🎯', 'success');
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
    addToast('تم تحديث ملفك الشخصي الأنيق بنجاح 🌸', 'success');
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
    addToast('New diary entry saved successfully! 📝 • تم حفظ مذكرتك الجديدة بنجاح! 🌱', 'success');
  };

  const updateDiary = (id: string, updates: Partial<Omit<Diary, 'id'>>) => {
    const updated = diaries.map(d => d.id === id ? { ...d, ...updates } : d);
    setDiaries(updated);
    save('aura_diaries', updated);
    addToast('Diary entry updated! ✏️ • تم تحديث تفاصيل المذكرات بنجاح ✏️', 'success');
  };

  const deleteDiary = (id: string) => {
    const updated = diaries.filter(d => d.id !== id);
    setDiaries(updated);
    save('aura_diaries', updated);
    addToast('Diary entry deleted successfully 🗑️ • تم حذف صفحة المذكرات بنجاح 🗑️', 'info');
  };

  // 1. Storage for already notified items to prevent spamming
  const notifiedItemsRef = useRef<Set<string>>(new Set());

  // 2. Request Notification Permission on Mount safely
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          addToast('تم تفعيل إشعارات المهام والمواعيد بنجاح! 🔔', 'success');
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
            reason: subtitle || 'خطتك المجدولة الحالية'
          });

          // Trigger real desktop system alert
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`⏰ Schedule Alert: ${title}`, {
                body: `It is time for your plan! • حان وقت خطتك المجدولة الآن: ${subtitle || 'جدول ومواعيد اليوم'}`,
                icon: 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=128',
                requireInteraction: true // Keeps the notification on-screen until closed
              });
            } catch (notiErr) {
              console.warn("Native Notification failed", notiErr);
            }
          }

          // Inject Toast notification
          addToast(`🔔 تنبيه الخطة: ${title} حان وقتها الآن (${itemTimeStr})`, 'info');
        }
      };

      // Check schedules
      todaysPlans.forEach(p => {
        notifyUser(p.id, p.time, p.title, p.subtitle);
      });

      // Check tasks
      todaysTimedTasks.forEach(t => {
        if (t.time) {
          notifyUser(t.id, t.time, t.title, 'مهمة تخطيط يومي مجدولة');
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
      setAccentStyle
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
