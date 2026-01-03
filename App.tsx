
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock } from './components/Clock';
import { AlarmControls } from './components/AlarmControls';
import { WakeUpScreen } from './components/WakeUpScreen';
import { QuoteWidget } from './components/QuoteWidget';
import { LifeWidget } from './components/LifeWidget';
import { Notification, NotificationType } from './components/Notification';
import { generateMorningQuote } from './services/geminiService';
import { QuoteData, Alarm, DayOfWeek } from './types';
import { Volume2, Plus, Bell } from 'lucide-react';

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
  const [volume, setVolume] = useState<number>(0.7);
  const [birthDate, setBirthDate] = useState<string | null>(() => localStorage.getItem('morning_glow_dob'));
  
  const [activeAlarmId, setActiveAlarmId] = useState<string | null>(null);
  const [isRinging, setIsRinging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  // --- Effects ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    } catch (e) {
      console.warn("Storage quota exceeded. Some custom audio might be too large.");
      setNotification({ message: "Storage limit reached. Try a smaller audio file.", type: 'error', id: Date.now() });
    }
  }, [alarms]);

  useEffect(() => {
    if (isRinging && activeAlarmId) {
      const alarm = alarms.find(a => a.id === activeAlarmId);
      if (alarm && audioRef.current) {
        audioRef.current.volume = volume;
        if (alarm.audioMode === 'preset') {
          const preset = PRESET_SOUNDS.find(p => p.id === alarm.selectedPresetId);
          if (preset) {
            audioRef.current.src = preset.url;
          }
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

  // --- Handlers ---
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
      label: "New Glow"
    };
    setEditingAlarm(newAlarm);
    setIsEditing(true);
  };

  const handleSaveAlarm = (alarm: Alarm) => {
    const existingIndex = alarms.findIndex(a => a.id === alarm.id);
    if (existingIndex > -1) {
      const newAlarms = [...alarms];
      newAlarms[existingIndex] = alarm;
      setAlarms(newAlarms);
    } else {
      setAlarms([...alarms, alarm]);
    }
    setIsEditing(false);
    setEditingAlarm(null);
    setNotification({ message: "Glow saved!", type: 'success', id: Date.now() });
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const toggleAlarmStatus = (id: string) => {
    setAlarms(alarms.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
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
    
    // Add temporary snooze alarm
    const snoozeAlarmObj: Alarm = {
      id: `snooze-${Date.now()}`,
      time: snoozeTime,
      isActive: true,
      repeatDays: [], 
      audioMode: activeAlarm?.audioMode || 'preset',
      selectedPresetId: activeAlarm?.selectedPresetId || PRESET_SOUNDS[0].id,
      customAudioData: activeAlarm?.customAudioData,
      customAudioName: activeAlarm?.customAudioName
    };
    setAlarms([...alarms, snoozeAlarmObj]);
    setActiveAlarmId(null);
  };

  const getGradient = () => {
     const h = currentTime.getHours();
     if (h >= 5 && h < 12) return "from-orange-400 via-rose-400 to-purple-500"; 
     if (h >= 12 && h < 18) return "from-blue-400 via-indigo-400 to-purple-500";
     return "from-slate-900 via-purple-900 to-slate-800"; 
  };

  return (
    <div className={`min-h-screen w-full relative flex items-center justify-center transition-colors duration-1000 bg-gradient-to-br ${getGradient()}`}>
      <div className="container mx-auto px-4 py-8 h-screen relative z-10 flex flex-col items-center overflow-y-auto no-scrollbar">
        <header className="sticky top-0 flex justify-between items-center py-6 w-full text-white/80 z-20 backdrop-blur-sm px-4">
          <div className="flex items-center gap-2">
             <Volume2 size={24} />
             <span className="font-medium tracking-wide">Morning Glow</span>
          </div>
          <button onClick={handleAddAlarm} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
             <Plus size={24} />
          </button>
        </header>

        <main className="w-full max-w-lg flex flex-col gap-6 pb-24">
          <Clock />
          <LifeWidget birthDate={birthDate} onSetBirthDate={setBirthDate} />
          <QuoteWidget quoteData={quoteData} onRefresh={() => fetchQuote(false)} />
          
          <div className="flex flex-col gap-4">
            <h2 className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] px-2 flex items-center gap-2">
              <Bell size={12} /> Your Scheduled Glows
            </h2>
            {alarms.filter(a => !a.id.startsWith('snooze-')).length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center text-white/40 italic">
                No alarms set. Add one to start your day right.
              </div>
            ) : (
              alarms.filter(a => !a.id.startsWith('snooze-')).map(alarm => (
                <div key={alarm.id} onClick={() => { setEditingAlarm(alarm); setIsEditing(true); }} className="glass rounded-3xl p-6 flex items-center justify-between cursor-pointer hover:bg-white/15 transition-all group animate-in slide-in-from-right-2">
                  <div className="flex flex-col">
                    <span className="text-4xl font-light text-white">{alarm.time}</span>
                    <span className="text-[10px] text-white/60 uppercase tracking-widest mt-1">
                      {alarm.repeatDays.length === 7 ? "Every Day" : alarm.repeatDays.length === 0 ? "Once" : alarm.repeatDays.map(d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleAlarmStatus(alarm.id); }}
                      className={`w-12 h-6 rounded-full transition-all relative ${alarm.isActive ? 'bg-green-400' : 'bg-white/20'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${alarm.isActive ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {isEditing && editingAlarm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <AlarmControls 
              alarm={editingAlarm}
              onSave={handleSaveAlarm}
              onCancel={() => { setIsEditing(false); setEditingAlarm(null); }}
              onDelete={() => { handleDeleteAlarm(editingAlarm.id); setIsEditing(false); }}
              volume={volume}
              setVolume={setVolume}
            />
          </div>
        </div>
      )}

      {isRinging && <WakeUpScreen quote={quoteData.text} loadingQuote={quoteData.loading} onStop={stopAlarm} onSnooze={snoozeAlarm} initialSnoozeDuration={5} />}
      {notification && <Notification key={notification.id} message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <audio ref={audioRef} className="hidden" loop />
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default App;
