import React, { useState, useEffect, useRef } from 'react';
import { usePlanner } from '../context/PlannerContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Play, 
  Square, 
  Volume2, 
  Compass, 
  Wind, 
  Waves, 
  Coffee, 
  Heart, 
  Music,
  Brain,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function StudioView() {
  const { 
    currentDate, 
    tasks, 
    schedules, 
    toggleTask, 
    addToast,
    setActiveTab
  } = usePlanner();

  // Pick today's plans
  const dayTasks = tasks.filter(t => t.date === currentDate);
  const daySchedules = schedules.filter(s => s.date === currentDate);

  // States for Sound Synth
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const activeOscillatorsRef = useRef<any[]>([]);
  const activeIntervalsRef = useRef<number[]>([]);

  // Vision Card Generator
  const [visionCard, setVisionCard] = useState({
    title: 'Mindful Affirmation',
    quote: 'I will embrace the details of today with love and patience. My plan is my roadmap, not a restriction.',
    theme: 'bg-gradient-to-br from-[#FAF5EF] to-[#FAECE0]'
  });

  const affirmations = [
    {
      title: 'Deep Inhale',
      quote: 'Every tiny step you list today is a stride towards your grander purpose. Take a deep breath and start gently.',
      theme: 'bg-gradient-to-br from-[#FAF5EF] to-[#F2EFE9]'
    },
    {
      title: 'Inner Peace & Serenity',
      quote: 'My progress is not measured by the speed of finishing tasks, but by the level of gratitude and awareness I bring to my day.',
      theme: 'bg-gradient-to-br from-[#FAF5EF] to-[#E3ECE7]'
    },
    {
      title: 'Empowerment & Resilience',
      quote: 'Seasons shift, but your inner spark stays bright. Let your handwritten bohemian steps on this page inspire spacious growth.',
      theme: 'bg-gradient-to-br from-[#FAF5EF] to-[#F1E4E2]'
    }
  ];

  const handleNextVision = () => {
    const idx = Math.floor(Math.random() * affirmations.length);
    setVisionCard(affirmations[idx]);
    // Sound cute chime
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6 sound
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        o.start();
        o.stop(ctx.currentTime + 0.9);
        setTimeout(() => ctx.close(), 1000);
      }
    } catch {}
  };

  // Synthesize Cozy Soundscapes completely offline
  const stopAudio = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    // Clean up recursive intervals if any
    activeIntervalsRef.current.forEach(interval => clearInterval(interval));
    activeIntervalsRef.current = [];

    // Clean up auxiliary oscillators
    activeOscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    activeOscillatorsRef.current = [];

    if (audioCtxRef.current) {
      try {
        if (audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
        }
      } catch (err) {}
      audioCtxRef.current = null;
    }
    setActiveTrack(null);
  };

  const startSynthTrack = (trackId: string) => {
    stopAudio();
    setActiveTrack(trackId);

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        addToast('Your browser does not support synthesized audio ⚠️', 'info');
        return;
      }
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNodeRef.current = masterGain;

      if (trackId === 'wind') {
        // Synthesizing wind gusts with modulated bandpass filters on white noise
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 4.0;

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();

        // Modulate bandpass frequency like a dynamic natural breeze
        let angle = 0;
        const interval = setInterval(() => {
          if (ctx.state === 'closed') return;
          const freq = 450 + Math.sin(angle) * 200;
          filter.frequency.setValueAtTime(freq, ctx.currentTime);
          angle += 0.05;
        }, 80);
        synthIntervalRef.current = interval as any;

      } else if (trackId === 'river') {
        // Synthesizing autumn river: combining a brown noise buffer and warm soft oscillating chord tones
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain multiplier
        }

        const brownNoise = ctx.createBufferSource();
        brownNoise.buffer = noiseBuffer;
        brownNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, ctx.currentTime);

        brownNoise.connect(filter);
        filter.connect(masterGain);
        brownNoise.start();

        // Let's sweep a warm major chord pad on top for meditation!
        const chord = [261.63, 329.63, 392.00, 523.25]; // C major notes
        chord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.connect(oscGain);
          oscGain.connect(masterGain);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          oscGain.gain.setValueAtTime(0.005, ctx.currentTime);

          // Slower rhythmic volume breathe
          let breatheAngle = i * Math.PI / 2;
          const breatheInterval = setInterval(() => {
            if (ctx.state === 'closed') return;
            const volume = 0.003 + Math.sin(breatheAngle) * 0.002;
            oscGain.gain.setValueAtTime(volume, ctx.currentTime);
            breatheAngle += 0.02;
          }, 120);
          
          osc.start();
          
          activeOscillatorsRef.current.push(osc);
          activeIntervalsRef.current.push(breatheInterval as any);
        });

      } else if (trackId === 'chimes') {
        // Cozy Zen Chimes: trigger a wooden bell chime sequence sequentially
        let index = 0;
        const frequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; // C Major scale
        
        const triggerChime = () => {
          if (ctx.state === 'closed') return;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.connect(g);
          g.connect(masterGain);

          osc.type = 'triangle';
          const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
          osc.frequency.setValueAtTime(randomFreq, ctx.currentTime);

          g.gain.setValueAtTime(0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

          osc.start();
          osc.stop(ctx.currentTime + 2.7);
        };

        triggerChime();
        const chimeInterval = setInterval(triggerChime, 1800);
        synthIntervalRef.current = chimeInterval as any;
      }

      addToast(`🌸 Ambient soundscape activated successfully!`, 'success');
    } catch (e) {
      console.warn("Synth failed", e);
      addToast("Could not activate soundscape synthesizer ⚠️", "error");
    }
  };

  useEffect(() => {
    return () => {
      // Clean up audio on unmount safely
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-white/70 to-stone-50/50 backdrop-blur-md rounded-[2.5rem] p-8 md:p-9 border border-white/50 shadow-sm relative overflow-hidden text-left font-sans select-none">
        <div className="absolute right-0 top-0 text-7xl font-sans text-stone-200/20 translate-x-3 translate-y-[-10px] pointer-events-none">
          ✨
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 text-left">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Mental Sanctuary & Mind Knitting Space</span>
            <h2 className="font-serif text-3xl font-extrabold text-stone-800 tracking-tight">
              🎨 Aura Creative Space & Zen Studio
            </h2>
            <p className="text-xs text-[#8C6A5C] font-semibold">
              An interactive mindmap of your day with an offline ambient soundscape generator for deep focus and calmness.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('daily')}
            className="px-5 py-3 bg-stone-100 hover:bg-stone-200/60 text-stone-700 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Back to Daily Agenda</span>
            <ArrowRight size={14} className="rotate-180" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Hand: Constellation Mindmap (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 md:p-8 border border-white/50 shadow-sm text-left">
            <div className="flex items-center justify-between border-b border-stone-200/40 pb-4 mb-6">
              <div className="text-left">
                <h3 className="font-serif text-md font-bold text-stone-800 flex items-center gap-2">
                  <Brain className="text-[#d36b54]" size={16} />
                  <span>Interactive Path Mindmap</span>
                </h3>
                <span className="text-[9px] text-stone-400 font-sans block mt-0.5">Click any orbit node or custom hour-block to instantly toggle its status.</span>
              </div>
              <span className="text-[9px] uppercase font-extrabold px-2.5 py-1 rounded bg-[#FAF5EF] text-[#8C6A5C] font-mono select-none">
                {dayTasks.length + daySchedules.length} Active Nodes
              </span>
            </div>

            {/* Mindmap Interactive Canvas Area */}
            <div className="relative min-h-[350px] bg-gradient-to-tr from-stone-100/30 via-[#FAF8F5]/30 to-stone-50/20 rounded-[2rem] border border-stone-200/30 overflow-hidden flex items-center justify-center p-6">
              {/* Connected central glowing rings as SVG background */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-stone-300/40 stroke-2" style={{ strokeDasharray: '4 4' }}>
                <circle cx="50%" cy="50%" r="55" fill="none" />
                <circle cx="50%" cy="50%" r="120" fill="none" />
                <line x1="10%" y1="20%" x2="50%" y2="50%" />
                <line x1="90%" y1="15%" x2="50%" y2="50%" />
                <line x1="80%" y1="80%" x2="50%" y2="50%" />
                <line x1="20%" y1="75%" x2="50%" y2="50%" />
              </svg>

              {/* Central Core Aura Node */}
              <div className="absolute z-10 w-24 h-24 rounded-full bg-white border border-stone-200 shadow-xl flex flex-col items-center justify-center p-2 text-center select-none animate-pulse">
                <Compass className="text-secondary mb-1" size={18} />
                <span className="font-serif text-[10px] font-bold text-stone-800 leading-none">Aura Center</span>
                <span className="font-mono text-[8px] text-[#8C6A5C] mt-0.5 block">{currentDate.slice(5)}</span>
              </div>

              {/* Floating Orbit Nodes representing Plans */}
              {(dayTasks.length === 0 && daySchedules.length === 0) ? (
                <div className="text-center z-20 space-y-2 max-w-xs self-center">
                  <span className="text-2xl block select-none">🕊️</span>
                  <p className="text-xs text-stone-400 font-semibold leading-relaxed">
                    Your aura space is clear for today. Add timed daily tasks or schedule slots to watch them rotate in beautiful harmony!
                  </p>
                </div>
              ) : (
                <div className="w-full h-full min-h-[300px] relative">
                  {/* Map schedules and tasks with simulated trig coordinates on outer orbit ring */}
                  {[...daySchedules.map(x => ({ ...x, nodeType: 'schedule' })), ...dayTasks.map(x => ({ ...x, nodeType: 'task' }))].map((item, index, arr) => {
                    const total = arr.length;
                    const angle = (index * (2 * Math.PI)) / total;
                    const radiusX = 135; // ellipse radius horizontal
                    const radiusY = 110; // ellipse radius vertical
                    
                    // Center is 50%
                    const xPercent = 50 + Math.cos(angle) * (radiusX / 3.4);
                    const yPercent = 50 + Math.sin(angle) * (radiusY / 2.6);

                    const isTask = item.nodeType === 'task';
                    const isCompleted = isTask ? (item as any).completed : false;

                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          if (isTask) {
                            toggleTask(item.id);
                            // Synthesize nice soft positive sound
                            try {
                              const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                              if (AudioContext) {
                                const ctx = new AudioContext();
                                const o = ctx.createOscillator();
                                const g = ctx.createGain();
                                o.connect(g);
                                g.connect(ctx.destination);
                                o.type = 'sine';
                                o.frequency.setValueAtTime(isCompleted ? 440 : 880, ctx.currentTime);
                                g.gain.setValueAtTime(0.06, ctx.currentTime);
                                o.start();
                                o.stop(ctx.currentTime + 0.35);
                                setTimeout(() => ctx.close(), 500);
                              }
                            } catch{}
                            addToast(isCompleted ? 'Task reopened for active list progress ⏳' : 'Congratulations! Cycle task completed successfully 🎉', 'success');
                          } else {
                            addToast(`⏰ This is a scheduled hour block running at ${item.time}`, 'info');
                          }
                        }}
                        style={{
                          left: `${xPercent}%`,
                          top: `${yPercent}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        className={`absolute z-20 p-2.5 rounded-2xl border text-stone-700 min-w-[90px] max-w-[140px] text-left shadow-md flex flex-col gap-1 select-none cursor-pointer group transition-all text-ellipsis overflow-hidden ${
                          isCompleted 
                             ? 'bg-[#E3ECE7]/90 border-emerald-300 line-through text-stone-400' 
                            : isTask 
                              ? 'bg-white border-stone-200 hover:border-[#8C6A5C]/40' 
                              : 'bg-gradient-to-br from-[#FAF5EF]/95 to-white border-dashed border-secondary/30'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isCompleted ? 'bg-emerald-500' : isTask ? 'bg-amber-500' : 'bg-[#d36b54]'
                          }`} />
                          <span className="font-mono text-[7px] tracking-wider text-stone-400 font-extrabold uppercase truncate">
                            {isTask ? 'Active Task' : `Plan @ ${item.time}`}
                          </span>
                        </div>
                        <span className="font-serif text-[10px] font-bold truncate leading-tight block text-stone-800">
                          {item.title}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Hand: Audio Synth Studio & Mantras (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 text-left">
          {/* Ambient Player Card */}
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-7 border border-white/50 shadow-sm">
            <h3 className="font-serif text-md font-bold text-stone-800 flex items-center gap-2 mb-2">
              <Music className="text-[#d36b54]" size={16} />
              <span>Soothing Ambient Soundscapes</span>
            </h3>
            <p className="text-[10px] text-stone-400 mb-5">
              Our offline boho synthesizer. Play comforting frequencies in the background while designing your target hours.
            </p>

            <div className="space-y-4">
              {[
                { id: 'wind', name: 'Golden Meadow Wind', desc: 'Warm Autumn Meadow Breeze', icon: Wind, color: 'text-amber-600 bg-amber-50' },
                { id: 'river', name: 'Bohemian Stream Flow', desc: 'Soothing Flowing River Pad', icon: Waves, color: 'text-blue-600 bg-blue-50' },
                { id: 'chimes', name: 'Zen Sparkle Chimes', desc: 'Zen Soft Wind Chimes', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50' },
              ].map(track => {
                const isPlaying = activeTrack === track.id;
                const TrackIcon = track.icon;
                return (
                  <div 
                    key={track.id} 
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isPlaying 
                        ? 'bg-primary/5 border-primary/40 scale-[1.01]' 
                        : 'bg-stone-50/50 border-stone-200/50 hover:bg-stone-100/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${track.color} shrink-0`}>
                        <TrackIcon size={16} />
                      </div>
                      <div className="text-left">
                        <span className="font-serif text-xs font-bold text-stone-800 block">{track.name}</span>
                        <span className="font-mono text-[9px] text-[#8C6A5C] mt-0.5 block leading-none">{track.desc}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => isPlaying ? stopAudio() : startSynthTrack(track.id)}
                      className={`p-2.5 rounded-full cursor-pointer hover:scale-105 transition-all text-xs font-bold ${
                        isPlaying 
                          ? 'bg-rose-500 text-white shadow-md' 
                          : 'bg-primary text-on-primary shadow-sm hover:bg-opacity-90'
                      }`}
                    >
                      {isPlaying ? <Square size={11} className="fill-white" /> : <Play size={11} className="fill-white ml-0.5" />}
                    </button>
                  </div>
                );
              })}

              {activeTrack && (
                <div className="flex items-center justify-center gap-2 bg-stone-100/40 p-3 rounded-2xl border border-stone-200/20 text-[10px] text-stone-500 font-mono select-none">
                  <Volume2 size={13} className="text-secondary animate-pulse" />
                  <span>Synthesis running...</span>
                  <button onClick={stopAudio} className="text-rose-500 font-bold ml-auto hover:underline cursor-pointer">Stop</button>
                </div>
              )}
            </div>
          </div>

          {/* Inspirational card */}
          <motion.div 
            layout 
            className={`${visionCard.theme} rounded-[2.5rem] p-7 border border-stone-200/20 shadow-md relative min-h-[220px] flex flex-col justify-between`}
          >
            <div className="absolute right-6 top-6 text-2xl opacity-15 pointer-events-none">
              🌿
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-wider font-extrabold text-stone-400 block mb-2">{visionCard.title}</span>
              <p className="font-serif text-stone-700 leading-relaxed text-xs font-bold italic">
                "{visionCard.quote}"
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-stone-200/20 pt-4 mt-4">
              <span className="font-mono text-[8px] text-stone-400">Aura Positivity engine</span>
              <button 
                onClick={handleNextVision}
                className="text-[10px] font-sans font-bold text-secondary hover:text-black transition-all cursor-pointer flex items-center gap-1"
              >
                <span>New affirmation</span>
                <Sparkles size={11} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
