import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Settings2, X, Calendar, Clock as ClockIcon } from 'lucide-react';

interface LifeWidgetProps {
  birthDate: string | null;
  onSetBirthDate: (date: string) => void;
}

type DisplayUnit = 'years' | 'days' | 'minutes' | 'seconds';

export const LifeWidget: React.FC<LifeWidgetProps> = ({ birthDate, onSetBirthDate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDate, setTempDate] = useState(birthDate || '');
  const [unit, setUnit] = useState<DisplayUnit>('years');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    if (!birthDate) return null;
    const start = new Date(birthDate).getTime();
    const diff = now - start;

    return {
      years: (diff / (1000 * 60 * 60 * 24 * 365.25)).toFixed(9),
      days: Math.floor(diff / (1000 * 60 * 60 * 24)).toLocaleString(),
      minutes: Math.floor(diff / (1000 * 60)).toLocaleString(),
      seconds: Math.floor(diff / 1000).toLocaleString(),
    };
  }, [birthDate, now]);

  const handleSave = () => {
    onSetBirthDate(tempDate);
    setIsEditing(false);
  };

  if (!birthDate && !isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="glass rounded-3xl p-6 w-full max-w-md mx-auto flex items-center justify-between group hover:bg-white/15 transition-all duration-500"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
            <Heart size={24} className="text-rose-300 animate-pulse" />
          </div>
          <div className="text-left">
            <p className="text-white font-medium">Your Journey</p>
            <p className="text-white/50 text-xs">Set birth date to see your life's progress</p>
          </div>
        </div>
        <Settings2 size={20} className="text-white/40 group-hover:rotate-90 transition-transform duration-500" />
      </button>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 w-full max-w-md mx-auto relative overflow-hidden transition-all duration-500 hover:bg-white/15">
      {isEditing ? (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">Birth Date Settings</span>
            <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
          </div>
          <input 
            type="date" 
            value={tempDate}
            onChange={(e) => setTempDate(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl p-3 text-white outline-none focus:border-white/40 transition-colors w-full"
          />
          <button 
            onClick={handleSave}
            className="bg-white text-indigo-900 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
          >
            Update Journey
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-white/60">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-rose-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">Life Essence</span>
            </div>
            <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <Settings2 size={16} />
            </button>
          </div>

          <div className="flex flex-col items-center py-2">
            <div className="text-4xl md:text-5xl font-mono font-light text-white tracking-tight">
              {unit === 'years' ? stats?.years : 
               unit === 'days' ? stats?.days :
               unit === 'minutes' ? stats?.minutes :
               stats?.seconds}
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-2 font-medium">
              Time Lived in {unit}
            </p>
          </div>

          <div className="flex bg-white/5 rounded-xl p-1 gap-1">
            {(['years', 'days', 'minutes', 'seconds'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] transition-all capitalize ${
                  unit === u 
                    ? 'bg-white/20 text-white font-bold' 
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Background Decor */}
      <div className="absolute -bottom-6 -right-6 opacity-5 pointer-events-none">
        <Calendar size={120} />
      </div>
    </div>
  );
};