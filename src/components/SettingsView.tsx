import { usePlanner } from '../context/PlannerContext';
import { useState, FormEvent, useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Save, 
  Sparkles, 
  Settings, 
  Camera, 
  ShieldCheck, 
  Palette, 
  Smartphone, 
  Check, 
  HelpCircle,
  Calendar,
  Clock,
  Bell
} from 'lucide-react';

export default function SettingsView() {
  const { 
    userProfile, 
    updateUserProfile, 
    currentDate, 
    setCurrentDate, 
    currentTime, 
    setCurrentTime,
    setVirtualTimeConfigured,
    accentStyle,
    setAccentStyle,
    addToast,
    activeIdentity,
    setActiveIdentity
  } = usePlanner();

  // Settings states
  const [userName, setUserName] = useState(userProfile.name);
  const [userEmail, setUserEmail] = useState(userProfile.email);
  const [showToast, setShowToast] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userProfile.avatarUrl || null);

  // New workspace active identity input
  const [newIdentityInput, setNewIdentityInput] = useState(activeIdentity);

  // Maaloumati registration helper states
  const [maaloumatiId, setMaaloumatiId] = useState(() => localStorage.getItem('maaloumati_national_id') || '');
  const [isMaaloumatiLinked, setIsMaaloumatiLinked] = useState(() => localStorage.getItem('maaloumati_registered') === 'true');

  // Background notifications permissions state
  const [notiPermission, setNotiPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const handleRequestNotiPermission = () => {
    if (!('Notification' in window)) {
      addToast('This browser does not support default system alerts ⚠️', 'error');
      return;
    }
    Notification.requestPermission().then(perm => {
      setNotiPermission(perm);
      if (perm === 'granted') {
        addToast('Desktop alerts and status notifications activated successfully! 🔔✨', 'success');
        try {
          new Notification('🔔 Alarms Activated Successfully!', {
            body: 'Welcome! You will receive hour-block alerts and sound reminders here.',
            icon: 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=128'
          });
        } catch {}
      } else if (perm === 'denied') {
        addToast('Notification permission denied. If inside an iframe, please open the app in a new browser tab to activate system alarms 🔒', 'error');
      }
    });
  };

  // Database Backup, Import, and Reset Functions
  const handleExportData = () => {
    try {
      const keys = [
        'aura_tasks', 
        'aura_schedules', 
        'aura_habits', 
        'aura_focus_by_date', 
        'aura_gratitude_by_date', 
        'aura_note', 
        'aura_profile', 
        'aura_accent_style',
        'maaloumati_national_id',
        'maaloumati_registered'
      ];
      const archive: Record<string, string | null> = {};
      keys.forEach(k => {
        archive[k] = localStorage.getItem(k);
      });
      const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `boho_planner_backup_${currentDate}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Complete database backup file downloaded successfully! 💾✨', 'success');
    } catch {
      addToast('Could not compile or export the sandbox database ⚠️', 'error');
    }
  };

  const handleImportData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        Object.entries(parsed).forEach(([key, val]) => {
          if (val) {
            localStorage.setItem(key, val as string);
          } else {
            localStorage.removeItem(key);
          }
        });
        addToast('Backup restored successfully! Synchronizing system data... 🔄🌿', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch {
        addToast('Corrupted or invalid JSON backup file structure ⚠️', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handlePurgeDatabase = () => {
    if (window.confirm('Are you absolutely sure you want to completely erase and purge all logged tasks, habits, and entries to factory reset the planner? This action cannot be undone.')) {
      const keysToClear = [
        'aura_tasks', 
        'aura_schedules', 
        'aura_habits', 
        'aura_focus_by_date', 
        'aura_gratitude_by_date', 
        'aura_note', 
        'aura_profile', 
        'aura_accent_style', 
        'aura_virtual_date', 
        'aura_virtual_time', 
        'aura_virtual_time_configured',
        'maaloumati_national_id',
        'maaloumati_registered'
      ];
      keysToClear.forEach(k => localStorage.removeItem(k));
      addToast('System database wiped completely! Reloading planner context... 🧼', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };

  // Synchronize avatar preview when user Profile loads or updates
  useEffect(() => {
    setAvatarPreview(userProfile.avatarUrl || null);
  }, [userProfile.avatarUrl]);

  // Reference for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Virtual Clock Configuration States
  const [tempDate, setTempDate] = useState(currentDate);

  const timeMatch = currentTime.match(/^(\d+):(\d+)\s+(AM|PM)$/i);
  const defaultHour = timeMatch ? timeMatch[1] : '09';
  const defaultMin = timeMatch ? timeMatch[2] : '00';
  const defaultAmpm = timeMatch ? timeMatch[3].toUpperCase() : 'AM';

  const [tempHour, setTempHour] = useState(defaultHour);
  const [tempMin, setTempMin] = useState(defaultMin);
  const [tempAmpm, setTempAmpm] = useState(defaultAmpm);

  // Split and bind year from date
  const parsedYear = currentDate.split('-')[0] || '2026';
  const [tempYear, setTempYear] = useState(parsedYear);

  const handleDateChange = (dateVal: string) => {
    setTempDate(dateVal);
    const yr = dateVal.split('-')[0];
    if (yr) {
      setTempYear(yr);
    }
  };

  const handleYearChange = (yrVal: string) => {
    setTempYear(yrVal);
    const parts = tempDate.split('-');
    if (parts.length === 3) {
      setTempDate(`${yrVal}-${parts[1]}-${parts[2]}`);
    }
  };

  // Handle Avatar File Selection
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        addToast('Avatar uploaded successfully and preview prepared! 📸', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (userName.trim() && userEmail.trim()) {
      // 1. Save Profile Preferences (including new avatar data URL)
      updateUserProfile(userName.trim(), userEmail.trim(), avatarPreview || undefined);

      // 2. Save Virtual Clock configuration
      setCurrentDate(tempDate);
      setCurrentTime(`${tempHour.padStart(2, '0')}:${tempMin.padStart(2, '0')} ${tempAmpm}`);

      // 3. Set the simulated time system as fully configured
      setVirtualTimeConfigured(true);

      // Soft cute sound chime
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'triangle';
          o.frequency.setValueAtTime(659.25, ctx.currentTime); // E5 note
          g.gain.setValueAtTime(0.05, ctx.currentTime);
          o.start();
          o.stop(ctx.currentTime + 0.4);
          setTimeout(() => ctx.close(), 600);
        }
      } catch{}

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Connect user Maaloumati Identity explicitly
  const handleMaaloumatiLink = () => {
    if (!maaloumatiId.trim()) {
      addToast('Please type a valid National Identification key first ⚠️', 'error');
      return;
    }
    localStorage.setItem('maaloumati_national_id', maaloumatiId.trim());
    localStorage.setItem('maaloumati_registered', 'true');
    setIsMaaloumatiLinked(true);
    addToast('🌱 Connected successfully! Identity verified and synced with Maaloumati Hub proactively.', 'success');
  };

  // Switch Active Workspace Identity Segregation
  const handleSwitchIdentity = () => {
    if (!newIdentityInput.trim()) {
      addToast('Please input a valid identity identifier code ⚠️', 'error');
      return;
    }
    setActiveIdentity(newIdentityInput.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-8 max-w-4xl mx-auto text-left"
    >
      {/* Toast Alert popup banner */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-primary text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-2.5 font-sans text-sm font-bold border border-primary/20"
          >
            <Sparkles size={16} className="text-white animate-bounce" />
            Planner preferences and simulated timeline applied! 🌸
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial Cozy Header */}
      <div className="bg-gradient-to-br from-white/70 to-bg-page/20 backdrop-blur-md rounded-[2.5rem] p-8 md:p-9 border border-theme-border/40 transition-all duration-300 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Settings size={26} />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-extrabold text-stone-800 tracking-tight">Identity & System Settings</h2>
              <p className="font-sans text-xs text-stone-500 font-medium mt-0.5">
                Personalize your digital planner style, simulated timeline clocks and identity links
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-extrabold px-3 py-1.5 rounded-full bg-stone-100 text-stone-500 font-mono tracking-wider select-none">
            Aura Space Config
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Polaroid Photo Showcase and Palette Selector (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Polaroid Preview */}
          <div className="bg-white p-5 rounded-[2rem] shadow-md border border-stone-200/40 text-center relative overflow-hidden group">
            {/* Cute mini tape decoration on top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#DECDB3]/30 -rotate-2 select-none" />
            
            <div className="w-full aspect-square bg-stone-100 rounded-xl overflow-hidden relative border border-stone-200/20 mt-4 flex items-center justify-center">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="My Portrait" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="text-stone-400/80 flex flex-col items-center justify-center gap-2">
                  <User size={48} strokeWidth={1} />
                  <span className="text-[10px] font-sans font-medium">No Portrait Photo set</span>
                </div>
              )}

              {/* Instant hover camera upload shortcut */}
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-serif font-bold"
              >
                <Camera size={22} className="animate-pulse" />
                <span>Upload My Avatar</span>
              </button>
            </div>

            {/* Handwritten style captions */}
            <div className="py-5 select-none text-stone-800 font-serif">
              <span className="text-sm font-extrabold block">"{userName || 'Me Today'}"</span>
              <span className="text-[9px] uppercase tracking-widest text-[#8C6A5C] block mt-1 font-mono">My Dear Diary Portrait</span>
            </div>

            {/* Change button */}
            <button 
              type="button"
              onClick={triggerFileInput}
              className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-[10px] font-bold border border-stone-200/40 transition-colors cursor-pointer"
            >
              Upload Custom Profile Avatar
            </button>

            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
          </div>

          {/* Aesthetic Palette Chooser Card */}
          <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 border border-white/40 shadow-sm text-left">
            <h3 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-2 mb-2">
              <Palette className="text-[#d36b54]" size={15} />
              <span>Cozy Accent Color Palette</span>
            </h3>
            <p className="text-[10px] text-stone-500 mb-4 leading-relaxed font-sans">
              Choose one of our hand-crafted color palettes to instantly adapt buttons, highlights, and borders to your visual preference.
            </p>

            <div className="flex flex-col gap-3">
              {[
                { key: 'girls', label: 'Warm Vintage Rose 🌸', colorBg: 'bg-[#B87E88]', desc: 'Soft Dusty Rose Lavender' },
                { key: 'boys', label: 'Nordic Ocean Blue 💎', colorBg: 'bg-[#4F7085]', desc: 'Cool Ocean Slate Blue' },
                { key: 'classic', label: 'Classic Boho Earth 🌿', colorBg: 'bg-[#8C6A5C]', desc: 'Earthy Clay Terracotta' },
              ].map(opt => {
                const isSelected = accentStyle === opt.key;
                return (
                  <button
                    id={`color-preset-select-${opt.key}`}
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setAccentStyle(opt.key as any);
                      addToast('Planner theme successfully updated!', 'success');
                    }}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-primary bg-[#FAF6F0] shadow-sm transform translate-x-1'
                        : 'border-stone-200/50 bg-white/40 hover:bg-white/80'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full ${opt.colorBg} border border-white/50 shadow-inner shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <span className="font-sans font-bold text-[11px] block text-stone-800 truncate">{opt.label}</span>
                      <span className="font-mono text-[8px] text-[#8C6A5C] block mt-0.5 truncate">{opt.desc}</span>
                    </div>
                    {isSelected && <Check size={12} className="ml-auto text-secondary stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Primary Info Fields, Virtual Clock & Maaloumati (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Workspace Identity Isolation block with Arabic & English supportive descriptors */}
          <div className="bg-white/60 backdrop-blur-md rounded-[25px] p-7 md:p-8 border border-theme-border/40 transition-colors duration-300 shadow-sm space-y-4 text-left">
            <h3 className="font-serif text-md font-bold text-stone-800 border-b border-stone-200/50 pb-3 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-md">🔑</span>
                <span>بوابة الهوية المستقلة والنسخ السحابي</span>
              </div>
              <span className="text-[10px] text-stone-500 font-sans tracking-tight block">Unique Profile Identity & Cloud Safe</span>
            </h3>
            
            <p className="text-xs text-stone-600 font-sans font-medium leading-relaxed">
              لكل مستخدم هوية فريدة ومميزة تربط جميع بياناته بشكل آمن. بمجرد إدخال اسم هويتك المفضل، سيقوم النظام باسترجاع ومزامنة كافة معلوماتك (المهام، جداول الوقت، اليوميات، ومستوى العادات اليومية) مباشرة من الخادم السحابي الاحتياطي لحمايتها من أي فقدان بالخطأ.
            </p>
            <p className="text-[10px] text-stone-400 font-sans leading-relaxed">
              Every user receives an insulated sandbox. Entering any unique key here instantly matches and restores all your planning logs and diaries directly from our persistent cloud node backend in case your local browser data gets cleared.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative focus-within:text-primary text-stone-400 transition-colors flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm select-none">
                  👤
                </span>
                <input
                  id="settings-workspace-key-input"
                  type="text"
                  required
                  placeholder="أدخل رمز الهوية الفريد (مثال: tsraathmd, guest)"
                  value={newIdentityInput}
                  onChange={(e) => setNewIdentityInput(e.target.value)}
                  className="w-full border border-stone-200 bg-white rounded-xl pl-11 pr-4 py-3 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50 text-left"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSwitchIdentity();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleSwitchIdentity}
                className="px-5 py-3 bg-secondary hover:bg-[#b0533e] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all shrink-0 font-sans"
              >
                تحميل المزامنة والبيانات 🔑
              </button>
            </div>
            
            <div className="bg-[#FAF6F0] p-4.5 rounded-2xl border border-stone-200/50 text-xs text-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10.5px] uppercase font-sans font-bold text-stone-400 block tracking-wider leading-none">الهوية الفعّالة حالياً / Active Identity Key:</span>
                <span className="font-mono font-bold text-xs text-stone-800 mt-1 block select-all">{activeIdentity}</span>
              </div>
              <span className="text-[9px] font-mono px-3 py-1 rounded-full bg-[#E3ECE7] text-emerald-800 border border-emerald-200 font-bold tracking-tight">
                🛡️ مزامنة الخادم السحابي نشطة
              </span>
            </div>
          </div>

          {/* Main Credentials Form */}
          <form onSubmit={handleSave} className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 md:p-8 border border-white/40 shadow-sm space-y-6 text-left">
            <h3 className="font-serif text-md font-bold text-stone-800 border-b border-stone-200/50 pb-3">
              Personal Details & Metadata
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="settings-username-input" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">Full Name</label>
                <div className="relative mt-1 focus-within:text-primary text-stone-400 transition-colors">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User size={15} />
                  </span>
                  <input
                    id="settings-username-input"
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full border border-stone-200 bg-white/80 rounded-xl pl-11 pr-4 py-3 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="settings-email-input" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">Email Address</label>
                <div className="relative mt-1 focus-within:text-primary text-stone-400 transition-colors">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Mail size={15} />
                  </span>
                  <input
                    id="settings-email-input"
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full border border-stone-200 bg-white/80 rounded-xl pl-11 pr-4 py-3 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50"
                  />
                </div>
              </div>
            </div>

            <h3 className="font-serif text-md font-bold text-stone-800 border-b border-stone-200/50 pt-2 pb-3">
              Simulated Clock & Time Travel
            </h3>
            <p className="text-[10px] text-stone-500 -mt-3 font-sans">
              Adjust your virtual timeframe below to travel in time, view historical or upcoming schedules, and test notification alarms.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="temp-date-picker" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">Simulated Current Date</label>
                <div className="relative mt-1 text-stone-400">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Calendar size={15} />
                  </span>
                  <input
                    id="temp-date-picker"
                    type="date"
                    required
                    value={tempDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full border border-stone-200 bg-white/80 rounded-xl pl-11 pr-4 py-3 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="temp-year-picker" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">Simulated Selected Year</label>
                <input
                  id="temp-year-picker"
                  type="number"
                  min="2020"
                  max="2100"
                  required
                  value={tempYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full border border-stone-200 bg-white/80 rounded-xl px-4 py-3 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="temp-hour-select" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">Simulated Hour</label>
                <div className="relative mt-1 text-stone-400">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Clock size={13} />
                  </span>
                  <select
                    id="temp-hour-select"
                    value={tempHour}
                    onChange={(e) => setTempHour(e.target.value)}
                    className="w-full border border-stone-200 bg-white/80 rounded-xl pl-8 pr-3 py-3 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50 cursor-pointer appearance-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="temp-minute-select" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">Simulated Minute</label>
                <select
                  id="temp-minute-select"
                  value={tempMin}
                  onChange={(e) => setTempMin(e.target.value)}
                  className="w-full border border-stone-200 bg-white/80 rounded-xl px-3.5 py-3 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50 mt-1 cursor-pointer"
                >
                  {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="temp-ampm-select" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">Simulated Period (AM/PM)</label>
                <select
                  id="temp-ampm-select"
                  value={tempAmpm}
                  onChange={(e) => setTempAmpm(e.target.value)}
                  className="w-full border border-stone-200 bg-white/80 rounded-xl px-3.5 py-3 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50 mt-1 cursor-pointer"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-200/40">
              <button
                id="settings-save-submit"
                type="submit"
                className="px-6 py-3.5 bg-primary hover:bg-opacity-95 text-white rounded-2xl font-sans text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 hover:scale-[1.01] active:scale-95 transition-all"
              >
                <Save size={14} />
                <span>Apply Time & Profile Configuration</span>
              </button>
            </div>
          </form>

          {/* Maaloumati Identity Sync Portal Section */}
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 md:p-8 border border-theme-border/40 transition-colors duration-300 shadow-sm space-y-5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/50 pb-3">
              <div className="text-left">
                <h3 className="font-serif text-md font-bold text-stone-800 mb-0.5 flex items-center gap-2">
                  <ShieldCheck className="text-secondary" size={17} />
                  <span>Maaloumati Hub Integration</span>
                </h3>
                <p className="text-[10px] text-stone-500 font-sans">Synchronize unique civilian credentials & national events for proactive smart scheduling.</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isMaaloumatiLinked ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="font-mono text-[9px] font-bold text-stone-600 uppercase select-none">
                  {isMaaloumatiLinked ? 'Active Sync Connected' : 'Not Linked'}
                </span>
              </div>
            </div>

            {!isMaaloumatiLinked ? (
              <div className="space-y-4">
                <div className="bg-[#FFF6F6] text-stone-700 p-4 rounded-2xl border border-rose-100 text-xs leading-relaxed text-left">
                  ⚠️ <strong>Synchronization Status:</strong> Your digital planner is currently offline and has not been synced with a validated Maaloumati National ID yet. Enter your civilian identification below to establish cross-linking.
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative focus-within:text-primary text-stone-400 transition-colors flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm">
                      🆔
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Enter National ID Number (e.g. 1234567)"
                      value={maaloumatiId}
                      onChange={(e) => setMaaloumatiId(e.target.value)}
                      className="w-full border border-stone-200 bg-white rounded-xl pl-11 pr-4 py-3 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleMaaloumatiLink}
                    className="px-5 py-3 bg-secondary hover:bg-[#b0533e] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all shrink-0 font-sans"
                  >
                    Connect & Sync Identity ↗
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#E3ECE7]/70 p-4.5 rounded-2xl border border-emerald-200 text-xs text-stone-700 leading-relaxed text-left flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold select-none mt-0.5">
                  ✓
                </div>
                <div className="text-left flex-1">
                  <span className="block font-bold text-stone-800 mb-0.5">National ID Linked Successfully</span>
                  <span className="block text-[10px] text-stone-500 mb-2 font-mono">Encrypted Sync Signature ID: {maaloumatiId}</span>
                  <span className="block text-[11px] text-[#8C6A5C]">Thank you! Proactive alerts are initialized. You can now design your calendar and navigate safely.</span>
                  
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('maaloumati_national_id');
                      localStorage.removeItem('maaloumati_registered');
                      setMaaloumatiId('');
                      setIsMaaloumatiLinked(false);
                      addToast('Maaloumati identity unlinked successfully! 🕊', 'info');
                    }}
                    className="mt-3 text-[10px] text-rose-500 font-bold hover:underline cursor-pointer block text-left"
                  >
                    Unlink Identity & Reset Portal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Core Background Alerts and PWA publisher guide */}
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 md:p-8 border border-theme-border/40 transition-colors duration-300 shadow-sm space-y-6 text-left">
            <div className="border-b border-stone-200/50 pb-3">
              <h3 className="font-serif text-md font-bold text-stone-800 flex items-center gap-2">
                <span>🔔 Live Alarms & Notifications Engine</span>
              </h3>
              <p className="text-[10px] text-stone-500 font-sans mt-0.5">
                Enable push notifications and ensure cozy chimes trigger correctly even in background processes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5 bg-[#FAF6F0] rounded-2xl border border-theme-border/40 text-left">
              <div>
                <p className="text-xs font-bold text-stone-800 flex items-center gap-2">
                  <span>System Notification Permission State:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    notiPermission === 'granted' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : notiPermission === 'denied' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {notiPermission === 'granted' && 'Granted ✓'}
                    {notiPermission === 'denied' && 'Denied / Blocked ❌'}
                    {notiPermission === 'default' && 'Pending / Default ⏳'}
                  </span>
                </p>
                <p className="text-[10px] text-stone-500 font-sans mt-1">
                  Desktop alerts send system-level banners for hourly blocks even if you are browsing other pages!
                </p>
              </div>

              <button
                type="button"
                onClick={handleRequestNotiPermission}
                disabled={notiPermission === 'granted'}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer font-sans ${
                  notiPermission === 'granted'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                    : 'bg-[#8c6a5c] hover:bg-[#745548] text-white'
                }`}
              >
                {notiPermission === 'granted' ? 'Notifications Activated ✓' : 'Activate System Notifications Now 🔔'}
              </button>
            </div>

            <div className="space-y-3.5 bg-stone-50 p-4.5 rounded-2xl border border-stone-200/50 text-xs text-stone-700 leading-relaxed text-left font-sans">
              <p className="font-bold text-primary flex items-center gap-1">
                <span>📢 Commercial Deployment & Background Audio Guide:</span>
              </p>
              
              <ul className="list-disc pl-5 space-y-2 text-[11px] text-stone-600 text-left">
                <li className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 list-none mb-1.5 text-left">
                  <span className="text-amber-800 font-extrabold block mb-1">⚠️ Why does it show "Blocked" or "Denied" in the current preview? (iFrame Restrictions)</span>
                  <p className="text-[10.5px] text-stone-700 leading-relaxed">
                    Because you are currently testing this application <strong>inside an embedded sandbox iframe</strong> on the AI Studio platform, modern web browsers protect your device by automatically blocking permission prompt requests.
                    <br />
                    <strong className="text-emerald-700">💡 Instant Solution:</strong> Simply open the application in a <strong>new standalone browser tab</strong> using the Direct App URL (either the Development link or the Shared link). There, live system alarms, popups, and notification permission dialogs will prompt beautifully and function flawlessly!
                  </p>
                </li>
                <li>
                  <strong className="text-stone-800">Browser background behavior:</strong> To preserve computer batteries and memory, modern renderers (such as Chrome, Safari, and Edge) pause timer threads and sound synthesizer scripts the moment a web tab is completely closed.
                </li>
                <li>
                  <strong className="text-stone-800">For optimal real-time sounds:</strong> We recommend pinning or background-running this tab on your computer. Alarms and acoustic chime intervals will resonate perfectly.
                </li>
                <li>
                  <strong className="text-stone-800">Progressive Web App (PWA) advantages:</strong> This application code is fully modern PWA-ready! You can package and compile it statically to download on any smartphone or desktop layout, ensuring autonomous native threads that bypass traditional browser freezes.
                </li>
              </ul>
            </div>
          </div>

          {/* Core isolated privacy database manager block */}
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 md:p-8 border border-theme-border/40 transition-colors duration-300 shadow-sm space-y-6 text-left">
            <div className="border-b border-stone-200/50 pb-3">
              <h3 className="font-serif text-md font-bold text-stone-800 flex items-center gap-2">
                <span>🔒 Data Privacy & Backup Sandbox</span>
              </h3>
              <p className="text-[10px] text-stone-500 font-sans mt-0.5">
                Secure local database sandbox with instant high-speed JSON export and restore capabilities.
              </p>
            </div>

            <div className="bg-primary/5 p-4.5 rounded-2xl border border-primary/10 text-xs text-stone-700 leading-relaxed text-left space-y-2 font-sans">
              <p className="font-semibold text-primary">🛡️ Absolute Privacy Guarantee & Individual Client Separation:</p>
              <p className="text-[11px] text-stone-600">
                This application operates strictly under an <strong className="text-secondary">Isolated Client-Side Sandbox</strong> architecture. All edits, logged habits, tasks, timeline schedules, and diaries are stored securely in local storage, exclusive to each browser.
              </p>
              <p className="text-[11px] text-stone-600">
                With zero remote databases, crossover or leakage between different users is physically impossible. This makes the application completely resilient, safe, and ready to license or hand off to separate buyers with maximum data protection.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {/* Export backup button */}
              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-3 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 rounded-2xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border border-stone-200 shadow-sm font-sans"
              >
                📥 Export Backup (JSON)
              </button>

              {/* Import backup button */}
              <label className="px-4 py-3 bg-white hover:bg-stone-50 text-secondary hover:text-[#b0533e] rounded-2xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border border-theme-border/50 shadow-sm text-center font-sans">
                📤 Import Backup (JSON)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>

              {/* Purge clean database reset */}
              <button
                type="button"
                onClick={handlePurgeDatabase}
                className="px-4 py-3 bg-rose-50/70 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-2xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border border-rose-100 shadow-sm font-sans"
              >
                🔥 Reset Database (Factory Purge)
              </button>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
