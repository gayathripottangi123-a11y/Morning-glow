
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Flag, Timer as TimerIcon } from 'lucide-react';

interface StopwatchProps {
  onClose: () => void;
}

export const Stopwatch: React.FC<StopwatchProps> = ({ onClose }) => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(null);

  const update = (now: number) => {
    if (startTimeRef.current === 0) startTimeRef.current = now - time;
    setTime(now - startTimeRef.current);
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (isActive) {
      requestRef.current = requestAnimationFrame(update);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      startTimeRef.current = 0;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive]);

  const toggleStart = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(0);
    setLaps([]);
    startTimeRef.current = 0;
  };

  const handleLap = () => {
    setLaps([time, ...laps]);
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    const parts = [
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ];
    
    if (hours > 0) parts.unshift(hours.toString().padStart(2, '0'));
    
    return {
      main: parts.join(':'),
      ms: centiseconds.toString().padStart(2, '0')
    };
  };

  const timeData = formatTime(time);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass rounded-[3rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden border-white/20">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-white/60">
            <TimerIcon size={18} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Precision Timer</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Display */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-baseline font-mono text-white">
            <span className="text-7xl font-extralight tracking-tighter">{timeData.main}</span>
            <span className="text-3xl font-light text-white/30 ml-2">.{timeData.ms}</span>
          </div>
          {isActive && (
            <div className="mt-4 px-3 py-1 bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-full animate-pulse">
              Running
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button 
            onClick={handleReset}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          >
            <RotateCcw size={20} />
          </button>

          <button 
            onClick={toggleStart}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
              isActive 
                ? 'bg-rose-500 text-white shadow-rose-500/20' 
                : 'bg-white text-indigo-950 shadow-white/10'
            }`}
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>

          <button 
            onClick={handleLap}
            disabled={!isActive && time === 0}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Flag size={20} />
          </button>
        </div>

        {/* Laps List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {laps.length === 0 ? (
            <div className="text-center py-8 text-white/20 text-[10px] uppercase tracking-widest font-medium">
              No laps recorded
            </div>
          ) : (
            laps.map((lapTime, index) => {
              const formatted = formatTime(lapTime);
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 animate-in slide-in-from-top-2">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Lap {laps.length - index}</span>
                  <div className="font-mono text-white text-sm">
                    {formatted.main}<span className="text-white/30">.{formatted.ms}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Decorative Background Glow */}
        <div className={`absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </div>
  );
};
