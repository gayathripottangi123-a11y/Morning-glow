
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Timer, Volume2, Music, Save, Trash2, Calendar, Headphones, Upload, Zap, Play, Square } from 'lucide-react';
import { PRESET_SOUNDS } from '../App';
import { Alarm, DayOfWeek } from '../types';
import { saveAudioBlob, getAudioBlob } from '../services/dbService';

interface AlarmControlsProps {
  alarm: Alarm;
  onSave: (alarm: Alarm) => void;
  onCancel: () => void;
  onDelete: () => void;
  volume: number;
  setVolume: (v: number) => void;
}

const DAYS: { label: string; value: DayOfWeek }[] = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

const SNOOZE_OPTIONS = [3, 5, 10, 15, 20, 30];

export const AlarmControls: React.FC<AlarmControlsProps> = ({
  alarm,
  onSave,
  onCancel,
  onDelete,
  volume,
  setVolume,
}) => {
  const [localAlarm, setLocalAlarm] = useState<Alarm>(alarm);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
      }
    };
  }, []);

  const toggleDay = (day: DayOfWeek) => {
    const nextDays = localAlarm.repeatDays.includes(day)
      ? localAlarm.repeatDays.filter(d => d !== day)
      : [...localAlarm.repeatDays, day].sort();
    setLocalAlarm({ ...localAlarm, repeatDays: nextDays });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const audioId = `custom-audio-${Date.now()}`;
      
      setIsUploading(true);
      try {
        await saveAudioBlob(audioId, file);
        setLocalAlarm({
          ...localAlarm,
          audioMode: 'custom',
          customAudioId: audioId,
          customAudioName: file.name
        });
      } catch (err) {
        alert("Failed to save audio file to IndexedDB.");
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleTogglePreview = async () => {
    if (isPreviewing) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.currentTime = 0;
      }
      setIsPreviewing(false);
      return;
    }

    let src: string | null = null;
    if (localAlarm.audioMode === 'preset') {
      const p = PRESET_SOUNDS.find(x => x.id === localAlarm.selectedPresetId);
      src = p?.url ?? null;
    } else if (localAlarm.audioMode === 'custom' && localAlarm.customAudioId) {
      const blob = await getAudioBlob(localAlarm.customAudioId);
      if (blob) {
        src = URL.createObjectURL(blob);
        previewBlobUrlRef.current = src;
      }
    }

    if (!src) {
      alert('Failed to play: No valid audio selected');
      return;
    }

    if (!previewAudioRef.current) previewAudioRef.current = new Audio();
    const previewAudio = previewAudioRef.current;
    previewAudio.volume = volume;
    
    if (previewAudio.src !== src) {
      previewAudio.src = src;
    }

    try {
      await previewAudio.play();
      setIsPreviewing(true);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Preview failed:', err);
        alert('Failed to play audio. It may be broken or unsupported.');
      }
      setIsPreviewing(false);
    }
    
    previewAudio.onended = () => {
      setIsPreviewing(false);
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
        previewBlobUrlRef.current = null;
      }
    };
  };

  return (
    <div className="glass rounded-3xl p-8 w-full shadow-2xl overflow-y-auto max-h-[90vh]">
      <div className="flex flex-col gap-6 text-left">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold tracking-widest text-xs uppercase">Configure Glow</h2>
          <button onClick={onCancel} className="text-white/40 hover:text-white transition-all"><X size={20} /></button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <input
            type="time"
            value={localAlarm.time}
            onChange={(e) => setLocalAlarm({ ...localAlarm, time: e.target.value })}
            className="bg-transparent text-white text-7xl border-b border-white/20 focus:border-white outline-none p-2 w-full text-center font-extralight transition-all"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <Calendar size={12} /> Recurrence
          </label>
          <div className="flex justify-between gap-1">
            {DAYS.map((day) => (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={`w-10 h-10 rounded-full text-xs font-bold transition-all border ${
                  localAlarm.repeatDays.includes(day.value) ? 'bg-white text-indigo-900 border-white' : 'bg-transparent text-white/40 border-white/10'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <Music size={12} /> Sound Source
          </label>
          <div className="flex bg-white/5 rounded-2xl p-1.5 gap-1.5">
            <button onClick={() => setLocalAlarm({ ...localAlarm, audioMode: 'preset' })} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] transition-all font-bold uppercase tracking-wider ${localAlarm.audioMode === 'preset' ? 'bg-white text-indigo-900' : 'text-white/50 hover:bg-white/5'}`}>
              <Headphones size={14} /> Presets
            </button>
            <button onClick={() => setLocalAlarm({ ...localAlarm, audioMode: 'custom' })} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] transition-all font-bold uppercase tracking-wider ${localAlarm.audioMode === 'custom' ? 'bg-white text-indigo-900' : 'text-white/50 hover:bg-white/5'}`}>
              <Upload size={14} /> Custom
            </button>
          </div>
        </div>

        <div className="min-h-[140px]">
          {localAlarm.audioMode === 'preset' ? (
            <div className="grid grid-cols-2 gap-2">
              {PRESET_SOUNDS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setLocalAlarm({ ...localAlarm, selectedPresetId: preset.id })}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${localAlarm.selectedPresetId === preset.id ? 'bg-white/20 border-white/40 shadow-lg' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <span className="text-xl shrink-0">{preset.icon}</span>
                  <span className="text-[10px] font-medium text-white/90 truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border border-dashed border-white/20 transition-all hover:bg-white/10 hover:border-white/40 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
              >
                <Upload size={20} className="text-white/60" />
                <span className="text-[11px] font-medium text-white block truncate max-w-[200px]">
                  {isUploading ? "Uploading to Vault..." : localAlarm.customAudioName || "Pick Your Music"}
                </span>
                {localAlarm.customAudioId && !isUploading && <div className="flex items-center gap-1 text-[9px] text-green-400 font-bold uppercase tracking-wider"><Check size={12} /> Saved to Local Vault</div>}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Volume2 size={12} /> Volume Intensity
            </label>
            <button 
              onClick={handleTogglePreview}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isPreviewing ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
            >
              {isPreviewing ? <Square size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
              {isPreviewing ? 'Stop' : 'Preview'}
            </button>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white" />
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={() => onSave(localAlarm)} className="flex-1 py-4 bg-white text-indigo-950 rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-xl"><Save size={16} /> Activate Aura</button>
          <button onClick={onDelete} className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"><Trash2 size={20} /></button>
        </div>
      </div>
    </div>
  );
};
