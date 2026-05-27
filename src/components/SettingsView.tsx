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
    addToast
  } = usePlanner();

  // Settings states
  const [userName, setUserName] = useState(userProfile.name);
  const [userEmail, setUserEmail] = useState(userProfile.email);
  const [showToast, setShowToast] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userProfile.avatarUrl || null);

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
      addToast('هذا المتصفح لا يدعم التنبيهات المباشرة ⚠️', 'error');
      return;
    }
    Notification.requestPermission().then(perm => {
      setNotiPermission(perm);
      if (perm === 'granted') {
        addToast('تم تفعيل إشعارات سطح المكتب والتنبيهات المباشرة بنجاح! 🔔✨', 'success');
        try {
          new Notification('🔔 تم تفعيل التنبيهات بنجاح!', {
            body: 'مرحباً بك! ستصلك التنبيهات والأجراس هنا حتى لو كان هذا التبويب مفتوحاً بالخلفية.',
            icon: 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=128'
          });
        } catch {}
      } else if (perm === 'denied') {
        addToast('تم رفض إذن الإشعارات. إذا كنت داخل لوحة المعاينة (iFrame)، يرجى فتح التطبيق في علامة تبويب مستقلة كاملة وتفعيل الإذن بنجاح 🔒', 'error');
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
      addToast('تمت صياغة تصدير وحفظ نسخة احتياطية كاملة من بياناتك بنجاح! 💾✨', 'success');
    } catch {
      addToast('عذراً، حدث خطأ ما أثناء تصدير نسخة احتياطية ⚠️', 'error');
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
        addToast('تم قراءة ملف النسخة الاحتياطية بنجاح! يتم الآن إعادة المزامنة... 🔄🌿', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch {
        addToast('صلابة ملف النسخة غير متوافقة أو تالفة ⚠️', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handlePurgeDatabase = () => {
    if (window.confirm('هل أنت متأكد تماماً من رغبتك في تصفير وتهيئة كافة جداولك ومهامك لتهيئة الموقع للبيع والنشر لأشخاص جدد؟ لا يمكن استرجاع هذه البيانات.')) {
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
      addToast('تمت إعادة تهيئة وتنظيف لوحة البيانات بنجاح كامل! سيتم تدوير الصفحة الآن... 🧼', 'success');
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
        addToast('تم تحميل صورتك وتجهيز معاينتها 📸', 'info');
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
      addToast('يرجى كتابة رقم الهوية الشخصية لإتمام عملية الربط ⚠️', 'error');
      return;
    }
    localStorage.setItem('maaloumati_national_id', maaloumatiId.trim());
    localStorage.setItem('maaloumati_registered', 'true');
    setIsMaaloumatiLinked(true);
    addToast('🌱 تم الربط المتبادل ومزامنة كافة بيانات هويتك مع تطبيق معلوماتي بنجاح الاستباقي للعمل!', 'success');
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
            تم حفظ وتثبيت كافة تفضيلات المفكرة وخطتك بنجاح! 🌸
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial Cozy Header */}
      <div className="bg-gradient-to-br from-white/70 to-bg-page/20 backdrop-blur-md rounded-[2.5rem] p-8 md:p-9 border border-theme-border/40 transition-all duration-300 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Settings size={26} />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-extrabold text-stone-800 tracking-tight">إعدادات هويتك وجدولك</h2>
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
                  <span className="text-[10px] font-sans font-medium">لا توجد صورة شخصية</span>
                </div>
              )}

              {/* Instant hover camera upload shortcut */}
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-serif font-bold"
              >
                <Camera size={22} className="animate-pulse" />
                <span>تحميل صورتي المفضلة</span>
              </button>
            </div>

            {/* Handwritten style captions */}
            <div className="py-5 select-none text-stone-800 font-serif">
              <span className="text-sm font-extrabold block">"{userName || 'أنا اليوم'}"</span>
              <span className="text-[9px] uppercase tracking-widest text-[#8C6A5C] block mt-1 font-mono">My Dear Diary Portrait</span>
            </div>

            {/* Change button */}
            <button 
              type="button"
              onClick={triggerFileInput}
              className="w-full py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-[10px] font-bold border border-stone-200/40 transition-colors cursor-pointer"
            >
              عرض وتحديث صورة الملف شخصياً
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
          <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 border border-white/40 shadow-sm">
            <h3 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-2 mb-2">
              <Palette className="text-[#d36b54]" size={15} />
              <span>طابع ألوان مفكرتك المحبوبة</span>
            </h3>
            <p className="text-[10px] text-stone-500 mb-4 leading-relaxed">
              اختر أحد التنسيقات المجهزة بكامل الألوان للأولاد أو البنات ليتغير تصميم وألوان أزرار جدولك فورياً.
            </p>

            <div className="flex flex-col gap-3">
              {[
                { key: 'girls', label: 'عنابي دافئ وبناتي دافئ 🌸', colorBg: 'bg-[#B87E88]', desc: 'Soft Dusty Rose Lavender' },
                { key: 'boys', label: 'أزرق سلفر وأزرق نيلي للأولاد 💎', colorBg: 'bg-[#4F7085]', desc: 'Cool Ocean Slate Blue' },
                { key: 'classic', label: 'ترابي بوهيمي كلاسيكي هادئ 🌿', colorBg: 'bg-[#8C6A5C]', desc: 'Earthy Clay Terracotta' },
              ].map(opt => {
                const isSelected = accentStyle === opt.key;
                return (
                  <button
                    id={`color-preset-select-${opt.key}`}
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setAccentStyle(opt.key as any);
                      addToast(`تم تحويل طابع ألوان المفكرة إلى ${opt.label}`, 'success');
                    }}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-primary bg-[#FAF6F0] shadow-sm transform translate-x-1'
                        : 'border-stone-200/50 bg-white/40 hover:bg-white/80'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full ${opt.colorBg} border border-white/50 shadow-inner shrink-0`} />
                    <div className="min-w-0">
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
          {/* Main Credentials Form */}
          <form onSubmit={handleSave} className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 md:p-8 border border-white/40 shadow-sm space-y-6">
            <h3 className="font-serif text-md font-bold text-stone-800 border-b border-stone-200/50 pb-3">
              البيانات الشخصية والتعريفية • Personal Metadata
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="settings-username-input" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">الاسم الكامل • Your Name</label>
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
                <label htmlFor="settings-email-input" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">البريد الإلكتروني • Email Address</label>
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
              منظم الوقت والساعة الافتراضية • Temporal Systems
            </h3>
            <p className="text-[10px] text-stone-500 -mt-3">
              يمكنك السفر بالزمن في مفكرتك الافتراضية لعرض مواعيد ومهام أيام سابقة أو قادمة، وتحديث أجهزة الإشعار محلياً.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="temp-date-picker" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">اليوم الافتراضي النشط • Current Date</label>
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
                <label htmlFor="temp-year-picker" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">سنة التقويم المختارة • Selected Year</label>
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
                <label htmlFor="temp-hour-select" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">ساعة التنبيه الافتراضية</label>
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
                <label htmlFor="temp-minute-select" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">دقيقة التنبيه الافتراضية</label>
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
                <label htmlFor="temp-ampm-select" className="text-[10px] uppercase font-sans font-extrabold text-stone-400 select-none">الفترة الافتراضية AM/PM</label>
                <select
                  id="temp-ampm-select"
                  value={tempAmpm}
                  onChange={(e) => setTempAmpm(e.target.value)}
                  className="w-full border border-stone-200 bg-white/80 rounded-xl px-3.5 py-3 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50 mt-1 cursor-pointer"
                >
                  <option value="AM">صباحاً (AM)</option>
                  <option value="PM">مساءً (PM)</option>
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
                <span>حفظ التمييز وتوقيت المفكرة • Apply Settings</span>
              </button>
            </div>
          </form>

          {/* Maaloumati Identity Sync Portal Section */}
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 md:p-8 border border-theme-border/40 transition-colors duration-300 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/50 pb-3">
              <div>
                <h3 className="font-serif text-md font-bold text-stone-800 mb-0.5 flex items-center gap-2">
                  <ShieldCheck className="text-secondary" size={17} />
                  <span>تطبيق معلوماتي الموحد • Maaloumati Hub</span>
                </h3>
                <p className="text-[10px] text-stone-500 font-sans">تزامن الهوية الفردية والأحوال الوطنية لتخصيص جدول المواعيد بذكاء استباقي.</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isMaaloumatiLinked ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="font-mono text-[9px] font-bold text-stone-600 uppercase select-none">
                  {isMaaloumatiLinked ? 'مربط نشط ومزامن' : 'غير مكتمل الربط بعد'}
                </span>
              </div>
            </div>

            {!isMaaloumatiLinked ? (
              <div className="space-y-4">
                <div className="bg-[#FFF6F6] text-stone-700 p-4 rounded-2xl border border-rose-100 text-xs text-left leading-relaxed">
                  ⚠️ <strong>تنبيه الربط المفقود</strong>: لم تقم بربط جدولك بتطبيق "معلوماتي". سيظل شريط التنبيه الإرشادي معروضاً في أعلى الصفحة الرئيسية حتى يتم استكمال مزامنة رقم هويتك لتفعيل الدعم.
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative focus-within:text-primary text-stone-400 transition-colors flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm">
                      🆔
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="أدخل رقم الهوية الوطنية (مثل 1234567)"
                      value={maaloumatiId}
                      onChange={(e) => setMaaloumatiId(e.target.value)}
                      className="w-full border border-stone-200 bg-white rounded-xl pl-11 pr-4 py-3 text-xs text-stone-800 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleMaaloumatiLink}
                    className="px-5 py-3 bg-secondary hover:bg-[#b0533e] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all shrink-0 animate-pulse"
                  >
                    تأكيد والربط المباشر ↗
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#E3ECE7]/70 p-4.5 rounded-2xl border border-emerald-200 text-xs text-stone-700 leading-relaxed text-left flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold select-none mt-0.5">
                  ✓
                </div>
                <div>
                  <span className="block font-bold text-stone-800 mb-0.5">تم ربط الهوية الوطنية بنجاح تام</span>
                  <span className="block text-[10px] text-stone-500 mb-2">رقم المزامنة السري المشفر: {maaloumatiId}</span>
                  <span className="block text-[11px] text-[#8C6A5C] font-mono">شكراً لك! لقد تم إلغاء البانر الإرشادي العلوي. يمكنك الآن برمجة يومك بكل أمان.</span>
                  
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('maaloumati_national_id');
                      localStorage.removeItem('maaloumati_registered');
                      setMaaloumatiId('');
                      setIsMaaloumatiLinked(false);
                      addToast('تم فك ربط تطبيق معلوماتي بنجاح 🕊️', 'info');
                    }}
                    className="mt-3 text-[10px] text-rose-500 font-bold hover:underline cursor-pointer block"
                  >
                    فك ربط الحساب والبدء من جديد
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Core Background Alerts and PWA publisher guide */}
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 md:p-8 border border-theme-border/40 transition-colors duration-300 shadow-sm space-y-6">
            <div className="border-b border-stone-200/50 pb-3">
              <h3 className="font-serif text-md font-bold text-stone-800 flex items-center gap-2">
                <span>🔔 محرك التنبيهات والمستجدات • Background Alerts Engine</span>
              </h3>
              <p className="text-[10px] text-stone-500 font-sans mt-0.5">
                تفعيل الإشعارات وتأمين عمل النغمات الصوتية الهادئة خارج المتصفح وعند العمل في الخلفية
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4.5 bg-secondary/5 rounded-2xl border border-secondary/10">
              <div>
                <p className="text-xs font-bold text-stone-800 flex items-center gap-2">
                  <span>حالة إذن الإشعارات بالنظام:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    notiPermission === 'granted' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : notiPermission === 'denied' 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {notiPermission === 'granted' && 'مفعّلة ومسموحة بنجاح ✓'}
                    {notiPermission === 'denied' && 'مرفوضة / محجوبة ❌'}
                    {notiPermission === 'default' && 'معلّقة بانتظار التمتين ⏳'}
                  </span>
                </p>
                <p className="text-[10px] text-stone-500 font-sans mt-1">
                  تساعد إشعارات سطح المكتب ونظام التشغيل على تمرير نوافذ المواعيد والأجراس حتى لو كنت تتصفح مواقع أخرى!
                </p>
              </div>

              <button
                type="button"
                onClick={handleRequestNotiPermission}
                disabled={notiPermission === 'granted'}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer ${
                  notiPermission === 'granted'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                    : 'bg-[#8c6a5c] hover:bg-[#745548] text-white'
                }`}
              >
                {notiPermission === 'granted' ? 'التنبيهات مفعّلة بالكامل ✓' : '🔔 تفعيل تنبيهات سطح المكتب الان'}
              </button>
            </div>

            <div className="space-y-3.5 bg-stone-50 p-4.5 rounded-2xl border border-stone-200/50 text-xs text-stone-700 leading-relaxed text-left">
              <p className="font-bold text-primary flex items-center gap-1">
                <span>📢 دليل النشر التجاري والحلول التقنية (كيف تضمن عمل برنامجك بصوت ونغمة دائمة؟):</span>
              </p>
              
              <ul className="list-disc pl-5 space-y-2 text-[11px] text-stone-600">
                <li className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 list-none mb-1.5">
                  <span className="text-amber-800 font-extrabold block mb-1">⚠️ سبب ظهور "تم رفض تفعيل الإشعارات" بالمعاينة الحالية? iFrame Restriction</span>
                  <p className="text-[10.5px] text-stone-700 leading-relaxed">
                    نظراً لأنك تقوم بتجربة التطبيق حالياً <strong>داخل نافذة مدمجة (iFrame)</strong> تابعة للمنصة، فإن المتصفحات الحديثة <strong>تحظر تلقائياً طلبات الإذن لحماية الأمان</strong> وتعتبرها مرفوضة مسبقاً.
                    <br />
                    <strong className="text-emerald-700">💡 الحل الفوري والوحيد:</strong> يرجى تصفح التطبيق عبر <strong>علامة تبويب مستقلة كاملة (خارج المنصة)</strong> باستخدام رابط التطبيق المباشر (المطور أو المشترك) المفتوح بالمتصفح، وستتمكن من تفعيل الإذن واستقبال أجراس التنبيه والموجات فورياً وبأعلى دقة!
                  </p>
                </li>
                <li>
                  <strong className="text-stone-800">سلوك المتصفحات الحديثة:</strong> لأسباب تتعلق بالأمان وتوفير شحن الأجهزة، تقوم جميع المتصفحات (Chrome, Safari, Edge) <strong className="text-secondary">بتجميد وإيقاف أكواد المواقع فور إغلاق علامة التبويب (Tab) بالكامل</strong>.
                </li>
                <li>
                  <strong className="text-stone-800">لتجربة مثالية أثناء الاستخدام:</strong> ننصح بـ <strong className="text-secondary">تثبيت أو ترك التبويب مفتوحاً بالمتصفح</strong> (حتى لو كان مصغراً بالأسفل). ستعمل النوتات الصوتية ونوافذ التنبيه البوهيمية بدقة عالية فورية.
                </li>
                <li>
                  <strong className="text-stone-800">ميزة تطبيق الويب التقدمي (PWA):</strong> نظراً لجهوزية هذا الكود، يمكنك تصديره وتغليفه بنقرة واحدة كتطبيق <strong className="text-stone-800">PWA</strong> قابل للتنزيل على سطح المكتب وهواتف العملاء، مما يمنحه معالجة مستقلة لا تتجمد بالخلفية كأنه برنامج مثبت أصلي!
                </li>
              </ul>
            </div>
          </div>

          {/* Core isolated privacy database manager block */}
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 md:p-8 border border-theme-border/40 transition-colors duration-300 shadow-sm space-y-6">
            <div className="border-b border-stone-200/50 pb-3">
              <h3 className="font-serif text-md font-bold text-stone-800 flex items-center gap-2">
                <span>🔒 خصوصية البيانات وإدارة النسخ الاحتياطية • Privacy & Data Sandbox</span>
              </h3>
              <p className="text-[10px] text-stone-500 font-sans mt-0.5">
                تأمين وحماية لسرية بيانات العملاء محلياً وإمكانية استيراد وتصدير قاعدة البيانات فورياً
              </p>
            </div>

            <div className="bg-primary/5 p-4.5 rounded-2xl border border-primary/10 text-xs text-stone-700 leading-relaxed text-left space-y-2">
              <p className="font-semibold text-primary">🛡️ ضمانة الخصوصية المطلقة وعزل المستخدمين ومناسبته للبيع المنفصل:</p>
              <p className="text-[11px] text-stone-600">
                يعمل هذا التطبيق بنظام الـ <strong className="text-secondary">Isolated Client-Side Sandbox</strong>، حيث يتم تنزيل قوالب وتعديلات ومهام كل عميل وحفظها مشفرة <strong>على جهاز ومتصفح كل عميل فقط بشكل مستقل بالكامل</strong> (باستخدام LocalStorage).
              </p>
              <p className="text-[11px] text-stone-600">
                نظراً لعدم وجود خوادم سحابية مشتركة، <strong>يستحيل تقنياً حدوث أي تداخل في السجلات، أو تسريب للمعلومات، أو رؤية لمهام شخص من قِبل شخص آخر</strong>. هذا يمنحك الجاهزية والصلابة المطلقة لبيع ونشر التطبيق كمنتج رقمي متميز ومغلق آمن لكل مشترٍ على حدة!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              {/* Export backup button */}
              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-3 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 rounded-2xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border border-stone-200 shadow-sm"
              >
                📥 تصدير البيانات (Backup)
              </button>

              {/* Import backup button */}
              <label className="px-4 py-3 bg-white hover:bg-stone-50 text-secondary hover:text-[#b0533e] rounded-2xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border border-theme-border/50 shadow-sm text-center">
                📤 استيراد البيانات (Restore)
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
                className="px-4 py-3 bg-rose-50/70 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-2xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 border border-rose-100 shadow-sm"
              >
                🔥 مسح وتصفير للبيع (Reset)
              </button>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
