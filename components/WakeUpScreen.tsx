
import React, { useEffect, useState } from 'react';
import { Sun, StopCircle, Loader2, Clock } from 'lucide-react';

interface WakeUpScreenProps {
  quote: string;
  loadingQuote: boolean;
  onStop: () => void;
  onSnooze: (duration: number) => void;
  initialSnoozeDuration: number;
}

export const WakeUpScreen: React.FC<WakeUpScreenProps> = ({ 
  quote, 
  loadingQuote, 
  onStop, 
  onSnooze,
  initialSnoozeDuration 
}) => {
  const [fadeIn, setFadeIn] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [selectedSnooze, setSelectedSnooze] = useState(initialSnoozeDuration);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loadingQuote) {
      setDisplayedText("");
      return;
    }
    if (!quote) return;

    let i = 0;
    setDisplayedText(""); 
    const intervalId = setInterval(() => {
      setDisplayedText(quote.slice(0, i + 1));
      i++;
      if (i === quote.length) {
        clearInterval(intervalId);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [quote, loadingQuote]);

  return (
    <div className={`fixed inset-0 z-[120] flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-xl transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      
      <div className="absolute inset-0 overflow-hidden -z-10">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/20 rounded-full blur-[100px] animate-breathe" />
         <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[80px] animate-pulse" />
      </div>

      <div className="flex flex-col items-center max-w-4xl text-center space-y-10 w-full">
        
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Sun size={80} className="text-yellow-100 relative z-10 animate-[spin_10s_linear_infinite]" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200 drop-shadow-sm">
          Good Morning
        </h1>

        <div className="min-h-[160px] flex items-center justify-center px-4 w-full">
          {loadingQuote ? (
             <div className="flex items-center gap-2 text-white/70">
                <Loader2 className="animate-spin" />
                <span>Crafting your morning inspiration...</span>
             </div>
          ) : (
            <div className="relative">
              <p className="text-3xl md:text-5xl font-light text-white leading-tight italic drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                "{displayedText}"
              </p>
            </div>
          )}
        </div>

        {/* Controls Container */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="text-white/40 text-[9px] font-bold uppercase tracking-[0.3em] mb-1">Adjust Snooze Duration</div>
          
          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-full backdrop-blur-sm border border-white/10">
            {[3, 5, 10, 15, 20, 30].map(d => (
              <button
                key={d}
                onClick={() => setSelectedSnooze(d)}
                className={`w-12 h-12 rounded-full text-xs transition-all flex items-center justify-center ${
                  selectedSnooze === d 
                    ? 'bg-white text-indigo-900 font-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {d}m
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
            <button
              onClick={() => onSnooze(selectedSnooze)}
              className="group relative flex items-center gap-3 px-8 py-5 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg backdrop-blur-md w-full md:w-auto justify-center"
            >
              <Clock size={28} className="text-white group-hover:text-blue-200 transition-colors" />
              <span className="text-xl font-medium text-white tracking-wide">Snooze {selectedSnooze}m</span>
            </button>

            <button
              onClick={onStop}
              className="group relative flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-rose-500/80 to-orange-500/80 hover:from-rose-500 hover:to-orange-500 rounded-full border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl backdrop-blur-md w-full md:w-auto justify-center"
            >
              <StopCircle size={32} className="text-white transition-colors" />
              <span className="text-xl font-bold text-white tracking-wide">I'm Awake</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
