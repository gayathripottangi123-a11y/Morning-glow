
import React, { useState, useRef } from 'react';
import { Bell, Check, X, Timer, Volume2, Music, Save, Trash2, Calendar, Headphones, Upload } from 'lucide-react';
import { PRESET_SOUNDS } from '../App';
import { Alarm, DayOfWeek } from '../types';

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

export const AlarmControls: React.FC<AlarmControlsProps> = ({
  alarm,
  onSave,
  onCancel,
  onDelete,
  volume,
  setVolume,
}) => {
  const [localAlarm, setLocalAlarm] = useState<Alarm>(alarm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleDay = (day: DayOfWeek) => {
    const nextDays = localAlarm.repeatDays.includes(day)
      ? localAlarm.repeatDays.filter(d => d !== day)
      : [...localAlarm.repeatDays, day].sort();
    setLocalAlarm({ ...localAlarm, repeatDays: nextDays });
  };

  const toggleEveryDay = () => {
    const isEveryDay = localAlarm.repeatDays.length === 7;
    setLocalAlarm({ ...localAlarm, repeatDays: isEveryDay ? [] : [0, 1, 2, 3, 4, 5, 6] });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        setLocalAlarm({
          ...localAlarm,
          audioMode: 'custom',
          customAudioData: base64Data,
          customAudioName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="glass rounded-3xl p-8 w-full shadow-2xl overflow-y-auto max-h-[90vh]">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold tracking-widest text-xs uppercase">Configure Glow</h2>
          <button onClick={onCancel} className="text-white/40 hover:text-white transition-all"><X size={20} /></button>
        </div>

        {/* Time Input */}
        <div className="flex flex-col items-center gap-2">
          <input
            type="time"
            value={localAlarm.time}
            onChange={(e) => setLocalAlarm({ ...localAlarm, time: e.target.value })}
            className="bg-transparent text-white text-7xl border-b border-white/20 focus:border-white outline-none p-2 w-full text-center font-extralight transition-all"
          />
        </div>

        {/* Recurrence Selection */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Calendar size={12} /> Recurrence
            </label>
            <button 
              onClick={toggleEveryDay}
              className={`text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-full transition-all ${localAlarm.repeatDays.length === 7 ? 'bg-white text-indigo-900' : 'bg-white/10 text-white/60'}`}
            >
              Every Day
            </button>
          </div>
          <div className="flex justify-between gap-1">
            {DAYS.map((day) => {
              const isActive = localAlarm.repeatDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`w-10 h-10 rounded-full text-xs font-bold transition-all border ${
                    isActive ? 'bg-white text-indigo-900 border-white' : 'bg-transparent text-white/40 border-white/10'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Mode Selection */}
        <div className="flex flex-col gap-3">
          <label className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <Music size={12} /> Sound Source
          </label>
          <div className="flex bg-white/5 rounded-2xl p-1.5 gap-1.5">
            <button
              onClick={() => setLocalAlarm({ ...localAlarm, audioMode: 'preset' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] transition-all font-bold uppercase tracking-wider ${
                localAlarm.audioMode === 'preset' ? 'bg-white text-indigo-900' : 'text-white/50 hover:bg-white/5'
              }`}
            >
              <Headphones size={14} /> Presets
            </button>
            <button
              onClick={() => setLocalAlarm({ ...localAlarm, audioMode: 'custom' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] transition-all font-bold uppercase tracking-wider ${
                localAlarm.audioMode === 'custom' ? 'bg-white text-indigo-900' : 'text-white/50 hover:bg-white/5'
              }`}
            >
              <Upload size={14} /> Custom
            </button>
          </div>
        </div>

        {/* Dynamic Sound Section */}
        <div className="min-h-[140px]">
          {localAlarm.audioMode === 'preset' ? (
            <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-300">
              {PRESET_SOUNDS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setLocalAlarm({ ...localAlarm, selectedPresetId: preset.id })}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    localAlarm.selectedPresetId === preset.id 
                      ? 'bg-white/20 border-white/40 shadow-lg' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">{preset.icon}</span>
                  <span className="text-[10px] font-medium text-white/90 truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 animate-in fade-in duration-300">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border border-dashed border-white/20 transition-all hover:bg-white/10 hover:border-white/40`}
              >
                <div className="p-3 bg-white/10 rounded-full">
                  <Upload size={20} className="text-white/60" />
                </div>
                <div className="text-center px-4">
                  <span className="text-[11px] font-medium text-white block truncate max-w-[200px]">
                    {localAlarm.customAudioName || "Choose Music File"}
                  </span>
                  <span className="text-[9px] text-white/30 uppercase tracking-widest mt-1">MP3, WAV, AAC</span>
                </div>
                {localAlarm.customAudioData && <div className="flex items-center gap-1 text-[9px] text-green-400 font-bold uppercase tracking-wider"><Check size={12} /> Selected</div>}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Volume Row */}
        <div className="flex flex-col gap-2">
          <label className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <Volume2 size={12} /> Volume
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onSave(localAlarm)}
            className="flex-1 py-4 bg-white text-indigo-950 rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-xl"
          >
            <Save size={16} /> Save Alarm & Activate
          </button>
          {!alarm.id.includes('snooze') && (
            <button
              onClick={onDelete}
              className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
