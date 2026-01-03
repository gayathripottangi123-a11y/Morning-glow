import React from 'react';
import { Quote, RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import { QuoteData } from '../types';

interface QuoteWidgetProps {
  quoteData: QuoteData;
  onRefresh: () => void;
}

export const QuoteWidget: React.FC<QuoteWidgetProps> = ({ quoteData, onRefresh }) => {
  const isQuotaFallback = quoteData.error === 'QUOTA';
  const isOffline = quoteData.error === 'FAILED';
  const isGenericFallback = quoteData.error === 'FALLBACK';

  return (
    <div className="glass rounded-3xl p-6 w-full max-w-md mx-auto relative group transition-all duration-500 hover:bg-white/15">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Quote size={18} className="text-yellow-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">Morning Wisdom</span>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              <div className={`w-1.5 h-1.5 rounded-full ${
                quoteData.loading ? 'bg-blue-400 animate-pulse' : 
                isQuotaFallback ? 'bg-amber-400' :
                isOffline ? 'bg-rose-400' : 
                isGenericFallback ? 'bg-slate-400' : 'bg-green-400'
              }`} />
              <span className="text-[9px] uppercase tracking-tighter text-white/40 font-bold">
                {quoteData.loading ? 'Syncing' : isQuotaFallback ? 'Cached' : isOffline ? 'Offline' : isGenericFallback ? 'Local' : 'Live AI'}
              </span>
            </div>
          </div>

          <button 
            onClick={onRefresh}
            disabled={quoteData.loading}
            className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50 group/btn"
            title="Get new inspiration"
          >
            <RefreshCw size={16} className={`text-white/60 group-hover/btn:text-white transition-colors ${quoteData.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="min-h-[80px] flex items-center justify-center py-2">
          {quoteData.loading ? (
            <div className="flex flex-col items-center gap-2 text-white/40">
              <Sparkles size={20} className="animate-pulse text-yellow-200/50" />
              <span className="text-xs italic font-light">Seeking the perfect words...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-lg md:text-xl font-light text-white italic text-center leading-relaxed drop-shadow-sm px-2">
                "{quoteData.text}"
              </p>
              {(isQuotaFallback || isGenericFallback) && (
                <div className="flex items-center gap-1.5 text-[9px] text-white/20 uppercase font-bold tracking-widest">
                  <BookOpen size={10} /> Local Library Inspiration
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="w-12 h-12 border-t border-r border-white/10 rounded-tr-3xl" />
      </div>
    </div>
  );
};