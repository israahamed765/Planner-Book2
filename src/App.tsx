import React from 'react';
import { PlannerProvider, usePlanner } from './context/PlannerContext';
import DailyView from './components/DailyView';
import WeeklyView from './components/WeeklyView';
import MonthlyView from './components/MonthlyView';
import HabitsView from './components/HabitsView';
import StudioView from './components/StudioView';
import SettingsView from './components/SettingsView';
import DiariesView from './components/DiariesView';
import QuickAddModal from './components/QuickAddModal';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  ClipboardList, 
  Clock, 
  Heart, 
  Settings, 
  BookOpen, 
  Notebook,
  Sparkles, 
  Plus, 
  Menu, 
  X, 
  Search, 
  User,
  History,
  Sunset
} from 'lucide-react';

function DashboardLayout() {
  const {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    searchQuery,
    setSearchQuery,
    openAddModal,
    toasts,
    removeToast,
    activeAlarm,
    dismissAlarm,
    addToast,
    activeIdentity,
    setActiveIdentity
  } = usePlanner();

  // Mapping from string tab key to english titles
  const tabsList = [
    { key: 'daily', labelEn: 'Daily Focus', icon: ClipboardList },
    { key: 'weekly', labelEn: 'Weekly Agenda', icon: Calendar },
    { key: 'monthly', labelEn: 'Monthly Calendar', icon: BookOpen },
    { key: 'habits', labelEn: 'Habit Logbook', icon: Heart },
    { key: 'diaries', labelEn: 'My Diary', icon: Notebook },
    { key: 'studio', labelEn: 'Creative Space', icon: Sparkles },
    { key: 'settings', labelEn: 'My Settings', icon: Settings },
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'daily':
        return <DailyView />;
      case 'weekly':
        return <WeeklyView />;
      case 'monthly':
        return <MonthlyView />;
      case 'habits':
        return <HabitsView />;
      case 'diaries':
        return <DiariesView />;
      case 'studio':
        return <StudioView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DailyView />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-page transition-colors duration-500 flex flex-col md:flex-row relative text-stone-700 antialiased overflow-x-hidden selection:bg-secondary/20">
      
      {/* 1. Mobile top header bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#ffffff]/70 backdrop-blur-md border-b border-theme-border/45 sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <Sunset className="text-secondary" size={18} />
          <span className="font-serif font-extrabold text-primary text-sm tracking-tight transition-colors duration-300">
            Boho Digital Planner
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 bg-stone-100 hover:bg-stone-200/60 text-stone-700 rounded-xl transition-all cursor-pointer"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* 2. Responsive Side Navigation Binder Drawer */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 w-[275px] shrink-0 bg-sidebar-bg/95 md:bg-sidebar-bg border-r border-theme-border/60 shadow-xl md:shadow-none z-50 p-6 flex flex-col justify-between transition-all duration-500 transform md:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo or Branded title */}
          <div className="flex items-center justify-between pb-3 border-b border-theme-border/40 transition-colors duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-colors duration-300">
                <Sunset size={16} />
              </div>
              <div>
                <span className="font-serif font-extrabold text-primary text-sm block leading-none tracking-tight transition-colors duration-300">
                  Boho Planner
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#8C6A5C]/60 block mt-1">
                  Creative Digital Diary
                </span>
              </div>
            </div>

            {/* Close button on mobile sidebar drawer */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 bg-stone-200/60 rounded-lg text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* User Profile / Custom Identity Badge */}
          <div className="bg-white/45 p-4 rounded-3xl border border-theme-border/40 relative overflow-hidden transition-colors duration-300">
            <div className="absolute right-0 top-0 text-primary/5 text-6xl pointer-events-none translate-x-3 translate-y-[-10px] select-none">
              🌿
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-extrabold text-xs shrink-0 uppercase border-2 border-white transition-colors duration-300 select-none">
                {activeIdentity.slice(0, 2)}
              </div>
              
              <div className="text-left min-w-0 flex-1">
                <span className="text-[8px] uppercase font-bold tracking-wider text-secondary block leading-none">Active Workspace</span>
                <h4 className="font-serif font-extrabold text-xs text-stone-800 truncate leading-none mt-1">
                  {activeIdentity}
                </h4>
                <p className="text-[9px] text-stone-400 font-mono truncate mt-0.5 font-semibold">
                  Insulated Sandbox
                </p>
              </div>
            </div>
          </div>

          {/* Search bar inside Sidebar */}
          <div className="relative mt-2">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search index..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/70 border border-theme-border/50 focus:border-primary focus:ring-1 focus:ring-primary/25 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none text-stone-800 placeholder-stone-400 transition-all font-sans"
            />
          </div>

          {/* Divider rings decoration representing real ring planner */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-primary block px-2 select-none transition-colors duration-300">
              Journal Sections
            </span>

            {/* Tabs List */}
            <nav className="space-y-1">
              {tabsList.map((tb) => {
                const TabIcon = tb.icon;
                const isActive = activeTab === tb.key;
                return (
                  <button
                    id={`sidebar-navigation-tab-${tb.key}`}
                    key={tb.key}
                    onClick={() => {
                      setActiveTab(tb.key as any);
                      setIsSidebarOpen(false); // Close on mobile navigation
                    }}
                    className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs transition-all relative select-none cursor-pointer group ${
                      isActive
                        ? 'bg-active-tab text-stone-800 shadow-sm border border-theme-border/50 font-extrabold shadow-black/5'
                        : 'text-stone-500 hover:text-stone-800 hover:bg-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TabIcon size={14} className={isActive ? 'text-secondary' : 'text-stone-400'} />
                      <div className="text-left">
                        <span className="block">{tb.labelEn}</span>
                      </div>
                    </div>

                    {/* Ring divider style indicator on the right */}
                    <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isActive ? 'bg-secondary' : 'bg-transparent'
                    }`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer info in Sidebar */}
        <div className="pt-6 border-t border-theme-border/40 text-left select-none transition-colors duration-300">
          <p className="text-[10px] text-stone-400 font-semibold flex items-center gap-1">
            <Sparkles size={11} className="text-secondary" />
            Designed mindful & cozy
          </p>
          <p className="text-[9px] text-stone-400 mt-0.5 font-mono">
            Vitesse Digital Engine © 2026
          </p>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-stone-900/10 backdrop-blur-sm"
        />
      )}

      {/* 3. Main Frame Area */}
      <main className="flex-1 p-5 md:p-9 relative min-w-0">
        
        {/* Maaloumati App Connection Alert Top Banner */}
        {localStorage.getItem('boho_banner_dismissed') !== 'true' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary via-[#a38072] to-secondary text-white px-5 py-4 rounded-[1.8rem] mb-6 shadow-md border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans select-none"
          >
            <div className="flex items-center gap-3 text-left text-xs">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 animate-bounce text-sm">
                📝
              </div>
              <div className="text-left">
                <p className="font-bold text-[13px]">Isolate or switch your journal workspace profile! 🌸</p>
                <p className="text-[10px] text-stone-200 mt-0.5 font-medium text-left">Type any unique nickname or workspace ID key in My Settings to securely load separate habits, schedules, and diaries.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 justify-end">
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsSidebarOpen(false);
                }}
                className="px-4.5 py-2 bg-white text-stone-700 hover:bg-bg-page rounded-xl text-[10px] font-bold transition-all shadow-sm shrink-0 cursor-pointer"
              >
                Go to Settings ↗
              </button>
              <button 
                onClick={() => {
                  localStorage.setItem('boho_banner_dismissed', 'true');
                  addToast('Helpful tutorial alert banner successfully dismissed!', 'info');
                }}
                className="text-white/70 hover:text-white text-xs px-1.5 font-bold shrink-0 cursor-pointer"
                title="Hide notice"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* Render actual selected view dynamically with a beautiful fade transition and container card wrapper */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>

        {/* Spacer at the bottom to allow scrolling over the bottom action button */}
        <div className="h-16" />

        {/* Floating Add Plan Action Button */}
        <button
          onClick={() => openAddModal('task')}
          className="fixed bottom-6 right-6 md:right-9 z-30 bg-secondary hover:bg-[#b0533e] text-white p-4.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm font-bold cursor-pointer flex items-center justify-center"
          title="Add quick plan element"
        >
          <Plus size={22} className="stroke-[2.5]" />
        </button>
      </main>

      {/* Cozy In-App Active Alarm Modal Dialogue Overlay */}
      <AnimatePresence>
        {activeAlarm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 20 }}
              className="bg-bg-page rounded-[2.5rem] border-2 border-theme-border p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden transition-all duration-300"
            >
              {/* Pulsing Bell Ambient Vector decoration */}
              <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mx-auto mb-5 relative">
                <div className="absolute inset-0 rounded-full bg-secondary/25 animate-ping" />
                <Clock size={36} className="stroke-[2.5] relative z-10" />
              </div>

              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C6A5C] font-sans block mb-1">
                Boho Mindful Awakening Alert 🌿
              </span>
              <h3 className="font-serif text-2xl font-extrabold text-stone-800 leading-tight">
                {activeAlarm.title}
              </h3>
              <p className="text-xs text-secondary mt-2.5 font-bold">
                {activeAlarm.reason || 'This scheduled activity has arrived!'} | {activeAlarm.time}
              </p>

              <p className="text-[10px] text-stone-400 mt-5 leading-relaxed font-sans">
                A serene forest chime loop is ringing to notify you. Take a deep, mindful breath and step peacefully into your scheduled routine.
              </p>

              <button
                onClick={dismissAlarm}
                className="mt-6 w-full py-3.5 bg-secondary hover:bg-[#b0533e] text-on-secondary rounded-2xl text-xs font-serif font-extrabold transition-all shadow-lg hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                Acknowledge & Quiet Bell 🕊️
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Modal Element added for Task Actions */}
      <QuickAddModal />

      {/* 5. Animated Cozy Toast Notification Center Stack */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none font-sans">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              layout
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.93 }}
              transition={{ duration: 0.25 }}
              onClick={() => removeToast(toast.id)}
              className="pointer-events-auto cursor-pointer bg-white/95 backdrop-blur-md border border-stone-200/70 p-4 rounded-2.5xl shadow-xl flex items-center justify-between gap-3 min-w-[290px] hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 animate-pulse ${
                  toast.type === 'success' 
                    ? 'bg-emerald-500' 
                    : toast.type === 'error' 
                      ? 'bg-rose-500' 
                      : 'bg-amber-500'
                }`} />
                <div className="flex flex-col text-left">
                  <p className="text-xs font-bold text-stone-800 leading-snug">
                    {toast.messageEn || toast.message}
                  </p>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="text-stone-400 hover:text-stone-700 text-[10px] p-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <PlannerProvider>
      <DashboardLayout />
    </PlannerProvider>
  );
}
