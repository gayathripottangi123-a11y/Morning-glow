
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Wind, Sparkles, ChevronRight } from 'lucide-react';

interface TimeDilationExperienceProps {
  onClose: () => void;
}

export const TimeDilationExperience: React.FC<TimeDilationExperienceProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'breathing' | 'particles'>('intro');
  const [breathCycle, setBreathCycle] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [seconds, setSeconds] = useState(0);
  const [expandSize, setExpandSize] = useState(50);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (isActive && phase === 'breathing') {
      const breathDuration = breathCycle === 'inhale' ? 4000 : breathCycle === 'hold' ? 4000 : 6000;
      const timer = setTimeout(() => {
        if (breathCycle === 'inhale') setBreathCycle('hold');
        else if (breathCycle === 'hold') setBreathCycle('exhale');
        else setBreathCycle('inhale');
      }, breathDuration);
      return () => clearTimeout(timer);
    }
  }, [isActive, breathCycle, phase]);

  useEffect(() => {
    if (isActive && phase === 'breathing') {
      const interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, phase]);

  useEffect(() => {
    if (isActive && phase === 'breathing') {
      const target = breathCycle === 'inhale' ? 100 : breathCycle === 'hold' ? 100 : 50;
      const duration = breathCycle === 'inhale' ? 4000 : breathCycle === 'hold' ? 4000 : 6000;
      const steps = 60;
      const stepDuration = duration / steps;
      const stepSize = (target - expandSize) / steps;
      
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setExpandSize(prev => prev + stepSize);
        if (step >= steps) clearInterval(interval);
      }, stepDuration);
      
      return () => clearInterval(interval);
    }
  }, [breathCycle, isActive, phase]);

  useEffect(() => {
    if (isActive && phase === 'particles') {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.01 + Math.random() * 0.02,
        size: 2 + Math.random() * 3
      }));
      setParticles(newParticles);

      const interval = setInterval(() => {
        setParticles(prev => prev.map(p => ({
          ...p,
          y: (p.y + p.speed) % 100
        })));
      }, 50);

      return () => clearInterval(interval);
    }
  }, [phase, isActive]);

  const startExperience = () => {
    setIsActive(true);
    setPhase('breathing');
    setSeconds(0);
  };

  const reset = () => {
    setIsActive(false);
    setPhase('intro');
    setSeconds(0);
    setBreathCycle('inhale');
    setExpandSize(50);
    setParticles([]);
  };

  const moveToParticles = () => {
    setPhase('particles');
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden animate-in fade-in duration-700">
      
      {/* Global Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all hover:rotate-90"
      >
        <X size={24} />
      </button>

      {/* Intro Phase */}
      {phase === 'intro' && (
        <div className="text-center z-10 px-8 max-w-2xl animate-in zoom-in-95 duration-1000">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/5 rounded-3xl border border-white/10">
              <Wind size={48} className="text-purple-300 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl font-light text-white mb-6 tracking-wide">Time Dilation</h1>
          <p className="text-xl text-purple-200/70 mb-10 leading-relaxed font-light">
            An immersive experience designed to expand your perception of time through focused breathing and visual meditation.
          </p>
          <button
            onClick={startExperience}
            className="group flex items-center gap-3 mx-auto bg-purple-500 hover:bg-purple-400 text-white px-12 py-5 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-[0_0_50px_rgba(168,85,247,0.4)]"
          >
            Begin Experience <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Breathing Phase */}
      {phase === 'breathing' && (
        <div className="text-center z-10 px-8 w-full max-w-md animate-in fade-in duration-500">
          <div className="mb-12">
            <div className="text-purple-300 text-[10px] font-bold mb-2 tracking-[0.3em] uppercase opacity-60">Time Elapsed</div>
            <div className="text-6xl font-extralight text-white font-mono tracking-tighter">{formatTime(seconds)}</div>
          </div>
          
          <div className="relative w-72 h-72 mx-auto mb-16">
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 opacity-20 blur-3xl"
              style={{
                transform: `scale(${expandSize / 50 + 0.5})`,
                transition: 'transform 0.1s linear'
              }}
            />
            <div 
              className="absolute inset-0 rounded-full glass border-white/30 flex items-center justify-center shadow-2xl"
              style={{
                transform: `scale(${expandSize / 100})`,
                transition: 'transform 0.1s linear'
              }}
            >
              <div className="text-white text-3xl font-light capitalize tracking-widest">{breathCycle}</div>
            </div>
          </div>

          <div className="min-h-[40px] text-purple-200 text-lg mb-12 font-light italic">
            {breathCycle === 'inhale' && 'Breathe in slowly through your nose...'}
            {breathCycle === 'hold' && 'Hold your breath gently...'}
            {breathCycle === 'exhale' && 'Release slowly through your mouth...'}
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={moveToParticles}
              className="flex items-center justify-center gap-2 bg-indigo-600/40 hover:bg-indigo-600/60 text-white py-4 rounded-2xl transition-all border border-indigo-500/30 font-medium tracking-wide"
            >
              <Sparkles size={18} /> Continue to Meditation
            </button>
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 text-white/40 hover:text-white/80 transition-all text-sm font-bold uppercase tracking-widest"
            >
              <RotateCcw size={14} /> Reset Session
            </button>
          </div>
        </div>
      )}

      {/* Particles Phase */}
      {phase === 'particles' && (
        <div className="absolute inset-0 z-10 animate-in fade-in duration-1000">
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center w-full px-6">
            <div className="text-purple-300 text-[10px] font-bold mb-2 tracking-[0.3em] uppercase opacity-60">Observe Each Moment</div>
            <div className="text-white text-xl font-light">Notice the space between movements</div>
          </div>

          {particles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                transition: 'top 0.05s linear'
              }}
            />
          ))}

          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
            <button
              onClick={reset}
              className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-full border border-white/20 transition-all backdrop-blur-xl font-bold uppercase text-xs tracking-[0.2em]"
            >
              <RotateCcw size={16} /> End Experience
            </button>
          </div>
        </div>
      )}

      {/* Ambient background elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
};
