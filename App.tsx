
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Clock } from './components/Clock';
import { AlarmControls } from './components/AlarmControls';
import { WakeUpScreen } from './components/WakeUpScreen';
import { QuoteWidget } from './components/QuoteWidget';
import { LifeWidget } from './components/LifeWidget';
import { Notification, NotificationType } from './components/Notification';
import { TimeDilationExperience } from './components/TimeDilationExperience';
import { Stopwatch } from './components/Stopwatch';
import { Journal } from './components/Journal';
import { generateMorningQuote } from './services/geminiService';
import { QuoteData, Alarm, DayOfWeek, SpecialDate } from './types';
import { Volume2, Plus, Bell, Wind, Timer as TimerIcon, BookText, Gift, Sparkles } from 'lucide-react';

interface AppNotification {
  message: string;
  type: NotificationType;
  id: number;
}

export const PRESET_SOUNDS = [
  { id: 'birds', name: 'Morning Forest', url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3', icon: '🐦' },
  { id: 'zen', name: 'Zen Garden', url: 'https://assets.mixkit.co/sfx/preview/mixkit-wind-chimes-singing-birds-1146.mp3', icon: '🧘' },
  { id: 'piano', name: 'Dreamy Piano', url: 'https://assets.mixkit.co/sfx/preview/mixkit-soft-piano-logo-vibe-613.mp3', icon: '🎹' },
  { id: 'lofi', name: 'Lo-Fi Rise', url: 'https://assets.mixkit.co/sfx/preview/mixkit-pueblo-lo-fi-hip-hop-loop-645.mp3', icon: '🎧' },
];

const STORAGE_KEY = 'morning_glow_alarms_v3';
const CACHE_KEY = 'morning_glow_cached_quote';
const CACHE_TIME_KEY = 'morning_glow_last_fetch';
const SPECIAL_DATES_KEY = 'morning_glow_special_dates_v1';

const FALLBACK_QUOTES = [
  "Today is a clean slate. Breathe in the possibility and exhale the doubt.",
  "The sun does not compare itself to the moon; it just shines when it's time.",
  "Your potential is like the horizon—limitless and always worth chasing.",
  "Small steps in the right direction can lead to the biggest changes.",
  "Every morning is a revolution against the shadows of yesterday."
];

const App: React.FC = () => {
  // --- State ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>(() => {
    const saved = localStorage.getItem(SPECIAL_DATES_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [volume, setVolume] = useState<number>(0.7);
  const [birthDate, setBirthDate] = useState<string | null>(() => localStorage.getItem('morning_glow_dob'));
  
  const [activeAlarmId, setActiveAlarmId] = useState<string | null>(null);
  const [isRinging, setIsRinging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isStopwatchOpen, setIsStopwatchOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);

  const [quoteData, setQuoteData] = useState<QuoteData>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return { text: cached || FALLBACK_QUOTES[0], loading: false, error: cached ? null : 'FALLBACK' };
  });
  
  const [notification, setNotification] = useState<AppNotification | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(() => {
    const saved = localStorage.getItem(CACHE_TIME_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Check Today's Events ---
  const todaysEvents = useMemo(() => {
    const now = new Date();
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const d = now.getDate().toString().padStart(2, '0');
    const y = now.getFullYear();
    const fullDate = `${y}-${m}-${d}`;

    return specialDates.filter(sd => {
      if (sd.isRecurring) {
        const [, sdm, sdd] = sd.date.split('-');
        return m === sdm && d === sdd;
      }
      return sd.date === fullDate;
    });
  }, [specialDates, currentTime.getDate()]); // Re-run on date change

  // --- Effects ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Refresh special dates from storage when journal closes or on mount
    const updateEvents = () => {
      const saved = localStorage.getItem(SPECIAL_DATES_KEY);
      if (saved) setSpecialDates(JSON.parse(saved));
    };
    if (!isJournalOpen) updateEvents();
  }, [isJournalOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    } catch (e) {
      setNotification({ message: "Storage limit reached.", type: 'error', id: Date.now() });
    }
  }, [alarms]);

  useEffect(() => {
    if (isRinging && activeAlarmId) {
      const alarm = alarms.find(a => a.id === activeAlarmId);
      if (alarm && audioRef.current) {
        audioRef.current.volume = volume;
        if (alarm.audioMode === 'preset') {
          const preset = PRESET_SOUNDS.find(p => p.id === alarm.selectedPresetId);
          if (preset) audioRef.current.src = preset.url;
        } else if (alarm.audioMode === 'custom' && alarm.customAudioData) {
          audioRef.current.src = alarm.customAudioData;
        }
        audioRef.current.play().catch(e => console.error("Playback failed", e));
      }
    }
  }, [isRinging, activeAlarmId, volume]);

  useEffect(() => {
    if (!isRinging) {
      const checkAlarms = () => {
        const now = new Date();
        const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentDay = now.getDay() as DayOfWeek;

        const triggered = alarms.find(a => 
          a.isActive && 
          a.time === currentHHMM && 
          (a.repeatDays.length === 0 || a.repeatDays.includes(currentDay)) &&
          now.getSeconds() === 0
        );

        if (triggered) {
          setActiveAlarmId(triggered.id);
          setIsRinging(true);
        }
      };
      const interval = setInterval(checkAlarms, 1000);
      return () => clearInterval(interval);
    }
  }, [alarms, isRinging]);

  const fetchQuote = async (silent = false) => {
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - lastFetchTime < oneHour && !silent) return;
    setQuoteData(prev => ({ ...prev, loading: true }));
    try {
      const text = await generateMorningQuote();
      setQuoteData({ text, loading: false, error: null });
      localStorage.setItem(CACHE_KEY, text);
      const now = Date.now();
      setLastFetchTime(now);
      localStorage.setItem(CACHE_TIME_KEY, now.toString());
    } catch (e: any) {
      setQuoteData(prev => ({ ...prev, loading: false, error: "FAILED" }));
    }
  };

  const handleAddAlarm = () => {
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: "07:00",
      isActive: true,
      repeatDays: [1, 2, 3, 4, 5],
      audioMode: 'preset',
      selectedPresetId: PRESET_SOUNDS[0].id,
      snoozeDuration: 5,
    };
    setEditingAlarm(newAlarm);
    setIsEditing(true);
  };

  const stopAlarm = () => {
    setIsRinging(false);
    setActiveAlarmId(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    fetchQuote(true);
  };

  const snoozeAlarm = (duration: number) => {
    setIsRinging(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const now = new Date();
    const futureTime = new Date(now.getTime() + duration * 60000);
    const snoozeTime = `${futureTime.getHours().toString().padStart(2, '0')}:${futureTime.getMinutes().toString().padStart(2, '0')}`;
    const activeAlarm = alarms.find(a => a.id === activeAlarmId);
    
    setAlarms([...alarms, {
      ...activeAlarm!,
      id: `snooze-${Date.now()}`,
      time: snoozeTime,
      repeatDays: [],
    }]);
    setActiveAlarmId(null);
  };

  const getGradient = () => {
     const h = currentTime.getHours();
     if (h >= 5 && h < 12) return "from-orange-400 via-rose-400 to-purple-500"; 
     if (h >= 12 && h < 18) return "from-blue-400 via-indigo-400 to-purple-500";
     return "from-slate-900 via-purple-900 to-slate-800"; 
  };

  const activeAlarm = activeAlarmId ? alarms.find(a => a.id === activeAlarmId) : null;

  return (
    <div className={`min-h-screen w-full relative flex items-center justify-center transition-colors duration-1000 bg-gradient-to-br ${getGradient()}`}>
      <div className="container mx-auto px-4 py-8 h-screen relative z-10 flex flex-col items-center overflow-y-auto no-scrollbar">
        <header className="sticky top-0 flex justify-between items-center py-6 w-full text-white/80 z-20 backdrop-blur-sm px-4">
          <div className="flex items-center gap-2">
             <Volume2 size={24} />
             <span className="font-medium tracking-wide">Morning Glow</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
             <button 
               onClick={() => setIsJournalOpen(true)} 
               className={`p-2 rounded-full transition-all border flex items-center gap-2 px-3 md:px-4 group ${todaysEvents.length > 0 ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200' : 'bg-white/10 border-white/5 hover:bg-white/20'}`}
               title="Personal Oasis Journal"
             >
                <BookText size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-widest hidden lg:block">Journal</span>
                {todaysEvents.length > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>}
             </button>
             <button onClick={() => setIsStopwatchOpen(true)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all border border-white/5"><TimerIcon size={18} /></button>
             <button onClick={() => setIsZenMode(true)} className="bg-white/10 hover:bg-purple-500/20 p-2 rounded-full transition-all flex items-center gap-2 px-3 md:px-4 group border border-white/5"><Wind size={18} className="group-hover:rotate-180 transition-transform duration-700" /><span className="text-[9px] font-black uppercase tracking-widest hidden lg:block">Zen Mode</span></button>
             <button onClick={handleAddAlarm} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all border border-white/5"><Plus size={24} /></button>
          </div>
        </header>

        <main className="w-full max-w-lg flex flex-col gap-6 pb-24">
          {todaysEvents.length > 0 && (
            <div className="glass rounded-[2rem] p-4 flex items-center justify-between border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-transparent animate-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-xl"><Gift size={20} className="text-yellow-400" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-yellow-200/60">Today's Celebration</p>
                  <p className="text-white font-bold text-sm">{todaysEvents[0].label}</p>
                </div>
              </div>
              <Sparkles size={16} className="text-yellow-400 animate-pulse" />
            </div>
          )}
          
          <Clock />
          <LifeWidget birthDate={birthDate} onSetBirthDate={setBirthDate} />
          <QuoteWidget quoteData={quoteData} onRefresh={() => fetchQuote(false)} />
          
          <div className="flex flex-col gap-4">
            <h2 className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] px-2 flex items-center gap-2"><Bell size={12} /> Your Scheduled Glows</h2>
            {alarms.filter(a => !a.id.startsWith('snooze-')).length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center text-white/40 italic">No alarms set.</div>
            ) : (
              alarms.filter(a => !a.id.startsWith('snooze-')).map(alarm => (
                <div key={alarm.id} onClick={() => { setEditingAlarm(alarm); setIsEditing(true); }} className="glass rounded-3xl p-6 flex items-center justify-between cursor-pointer hover:bg-white/15 transition-all group animate-in slide-in-from-right-2">
                  <div className="flex flex-col">
                    <span className="text-4xl font-light text-white">{alarm.time}</span>
                    <span className="text-[10px] text-white/60 uppercase tracking-widest mt-1">
                      {alarm.repeatDays.length === 7 ? "Every Day" : alarm.repeatDays.length === 0 ? "Once" : alarm.repeatDays.map(d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")}
                    </span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setAlarms(alarms.map(a => a.id === alarm.id ? { ...a, isActive: !a.isActive } : a)); }} className={`w-12 h-6 rounded-full transition-all relative ${alarm.isActive ? 'bg-green-400' : 'bg-white/20'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${alarm.isActive ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {isEditing && editingAlarm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <AlarmControls alarm={editingAlarm} onSave={a => {
              const idx = alarms.findIndex(x => x.id === a.id);
              if (idx > -1) { const n = [...alarms]; n[idx] = a; setAlarms(n); } else setAlarms([...alarms, a]);
              setIsEditing(false);
            }} onCancel={() => setIsEditing(false)} onDelete={() => { setAlarms(alarms.filter(x => x.id !== editingAlarm.id)); setIsEditing(false); }} volume={volume} setVolume={setVolume} />
          </div>
        </div>
      )}

      {isZenMode && <TimeDilationExperience onClose={() => setIsZenMode(false)} />}
      {isStopwatchOpen && <Stopwatch onClose={() => setIsStopwatchOpen(false)} />}
      {isJournalOpen && <Journal onClose={() => setIsJournalOpen(false)} />}
      {isRinging && <WakeUpScreen quote={todaysEvents.length > 0 ? `Happy ${todaysEvents[0].label}! ${quoteData.text}` : quoteData.text} loadingQuote={quoteData.loading} onStop={stopAlarm} onSnooze={snoozeAlarm} initialSnoozeDuration={activeAlarm?.snoozeDuration || 5} />}
      {notification && <Notification key={notification.id} message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <audio ref={audioRef} className="hidden" loop />
    </div>
  );
};

export default App;
