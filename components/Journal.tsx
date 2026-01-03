
import React, { useState, useEffect, useMemo } from 'react';
import { X, Book, CheckCircle2, Trophy, ListTodo, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Cake, Sparkles, Star, Gift } from 'lucide-react';
import { JournalEntry, TodoItem, SpecialDate } from '../types';

interface JournalProps {
  onClose: () => void;
}

const JOURNAL_STORAGE_KEY = 'morning_glow_journal_v1';
const SPECIAL_DATES_KEY = 'morning_glow_special_dates_v1';

export const Journal: React.FC<JournalProps> = ({ onClose }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date());
  const [entries, setEntries] = useState<Record<string, JournalEntry>>(() => {
    const saved = localStorage.getItem(JOURNAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>(() => {
    const saved = localStorage.getItem(SPECIAL_DATES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<SpecialDate>>({ type: 'special', isRecurring: false });

  useEffect(() => {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(SPECIAL_DATES_KEY, JSON.stringify(specialDates));
  }, [specialDates]);

  const currentEntry = useMemo(() => {
    return entries[selectedDate] || {
      date: selectedDate,
      diaryText: '',
      todos: [],
      achievements: []
    };
  }, [selectedDate, entries]);

  const updateCurrentEntry = (updates: Partial<JournalEntry>) => {
    setEntries(prev => ({
      ...prev,
      [selectedDate]: { ...currentEntry, ...updates }
    }));
  };

  const handleAddEvent = () => {
    if (!newEvent.label || !newEvent.date) return;
    const event: SpecialDate = {
      id: Date.now().toString(),
      label: newEvent.label,
      date: newEvent.date,
      type: newEvent.type as 'birthday' | 'special',
      isRecurring: newEvent.type === 'birthday'
    };
    setSpecialDates([...specialDates, event]);
    setNewEvent({ type: 'special', isRecurring: false });
    setIsAddingEvent(false);
  };

  const deleteSpecialDate = (id: string) => {
    setSpecialDates(specialDates.filter(d => d.id !== id));
  };

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(viewDate);
    const startOffset = startDayOfMonth(viewDate);
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  }, [viewDate]);

  const getDayEvents = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return specialDates.filter(sd => {
      if (sd.isRecurring) {
        const [, sdm, sdd] = sd.date.split('-');
        return m === sdm && d === sdd;
      }
      return sd.date === dateStr;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="glass rounded-[3rem] w-full max-w-6xl h-[92vh] flex flex-col md:flex-row overflow-hidden border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        
        {/* Sidebar: Navigation & Special Dates */}
        <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-white/[0.02]">
          <div className="p-8 border-b border-white/5">
            <h2 className="text-white font-black tracking-[0.3em] text-[10px] uppercase flex items-center gap-3 mb-6">
              <Sparkles size={16} className="text-yellow-400" /> Journey Logs
            </h2>
            
            {/* Calendar Widget */}
            <div className="bg-black/20 rounded-[2rem] p-5 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="text-white/40 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                <span className="text-white font-bold text-[11px] uppercase tracking-widest">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="text-white/40 hover:text-white transition-colors"><ChevronRight size={16} /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[9px] font-black text-white/10 mb-2">{d}</span>)}
                {calendarDays.map((day, idx) => {
                  if (day === null) return <div key={`empty-${idx}`} />;
                  const dateStr = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  const dayEvents = getDayEvents(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`aspect-square rounded-xl text-[10px] flex items-center justify-center transition-all relative group
                        ${isSelected ? 'bg-white text-indigo-950 font-black shadow-xl scale-110' : 'text-white/40 hover:bg-white/5'}
                        ${isToday && !isSelected ? 'border border-yellow-500/50 text-yellow-200' : ''}
                      `}
                    >
                      {day}
                      {dayEvents.length > 0 && !isSelected && (
                        <div className="absolute -top-1 -right-1">
                          {dayEvents.some(e => e.type === 'birthday') ? <div className="w-1.5 h-1.5 bg-rose-400 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" /> : <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.6)]" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            <div className="flex items-center justify-between">
              <h3 className="text-white/50 text-[10px] font-black uppercase tracking-widest">Celestial Events</h3>
              <button onClick={() => setIsAddingEvent(true)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                <Plus size={14} />
              </button>
            </div>

            {isAddingEvent && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3 animate-in slide-in-from-top-2">
                <input 
                  type="text" 
                  placeholder="Event Name" 
                  value={newEvent.label || ''} 
                  onChange={e => setNewEvent({...newEvent, label: e.target.value})}
                  className="w-full bg-black/20 border-white/10 border rounded-xl p-2 text-xs text-white outline-none"
                />
                <input 
                  type="date" 
                  value={newEvent.date || ''} 
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full bg-black/20 border-white/10 border rounded-xl p-2 text-xs text-white outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => setNewEvent({...newEvent, type: 'birthday'})} className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase ${newEvent.type === 'birthday' ? 'bg-rose-500 text-white' : 'bg-white/5 text-white/40'}`}>Birthday</button>
                  <button onClick={() => setNewEvent({...newEvent, type: 'special'})} className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase ${newEvent.type === 'special' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40'}`}>Special</button>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddEvent} className="flex-1 bg-white text-indigo-900 py-2 rounded-xl text-[10px] font-black uppercase">Add</button>
                  <button onClick={() => setIsAddingEvent(false)} className="px-3 bg-white/5 text-white/40 rounded-xl"><X size={14}/></button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {specialDates.length === 0 && <p className="text-[10px] text-white/20 italic text-center py-4">No events orbiting...</p>}
              {specialDates.map(sd => (
                <div key={sd.id} className="group flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all">
                  <div className={`p-2 rounded-xl ${sd.type === 'birthday' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {sd.type === 'birthday' ? <Cake size={14} /> : <Star size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white truncate">{sd.label}</p>
                    <p className="text-[9px] text-white/30 uppercase tracking-tighter">{sd.date.split('-').slice(1).join('/')} {sd.isRecurring && '(Yearly)'}</p>
                  </div>
                  <button onClick={() => deleteSpecialDate(sd.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 transition-all p-1"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-white/[0.01]">
          <header className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white/80">
                <Book size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-light text-white tracking-tight">
                  {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {getDayEvents(selectedDate).map(e => (
                    <span key={e.id} className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${e.type === 'birthday' ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'}`}>
                      {e.type === 'birthday' ? 'Birthday' : 'Special Day'}: {e.label}
                    </span>
                  ))}
                  {getDayEvents(selectedDate).length === 0 && <span className="text-[9px] text-white/30 uppercase tracking-[0.2em]">Standard Earth Day</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
              <X size={24} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
            {/* Journal Area */}
            <section className="space-y-4">
              <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Book size={14} className="text-indigo-400" /> Deep Reflections
              </label>
              <div className="relative group">
                <textarea
                  value={currentEntry.diaryText}
                  onChange={(e) => updateCurrentEntry({ diaryText: e.target.value })}
                  placeholder="Capture the essence of this moment..."
                  className="w-full h-64 bg-white/[0.03] rounded-[2.5rem] p-10 text-white font-light text-xl border border-white/5 focus:border-white/20 focus:bg-white/[0.05] outline-none transition-all resize-none placeholder:text-white/10 leading-relaxed shadow-inner"
                />
                <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity"><Sparkles size={20} className="text-indigo-300" /></div>
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-10">
              {/* Intentions */}
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <ListTodo size={14} className="text-blue-400" /> Intentions
                  </label>
                  <button 
                    onClick={() => {
                      const text = prompt("Define your next intention:");
                      if (text) updateCurrentEntry({ todos: [...currentEntry.todos, { id: Date.now().toString(), text, completed: false }] });
                    }} 
                    className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {currentEntry.todos.length === 0 && <div className="p-8 border border-dashed border-white/5 rounded-[2rem] text-center text-white/10 text-xs italic">Set a course for the day...</div>}
                  {currentEntry.todos.map(todo => (
                    <div key={todo.id} className="group flex items-center gap-4 p-5 rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all">
                      <button 
                        onClick={() => updateCurrentEntry({ todos: currentEntry.todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t) })}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-green-400 border-green-400 text-indigo-900' : 'border-white/20 group-hover:border-white/40'}`}
                      >
                        {todo.completed && <CheckCircle2 size={14} />}
                      </button>
                      <span className={`flex-1 text-sm text-white/80 font-medium transition-all ${todo.completed ? 'line-through opacity-30' : ''}`}>{todo.text}</span>
                      <button onClick={() => updateCurrentEntry({ todos: currentEntry.todos.filter(t => t.id !== todo.id) })} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 transition-all"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Glow Ups */}
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <Trophy size={14} className="text-yellow-400" /> Glow Ups
                  </label>
                  <button 
                    onClick={() => {
                      const text = prompt("Celebrate a victory!");
                      if (text) updateCurrentEntry({ achievements: [...currentEntry.achievements, text] });
                    }} 
                    className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {currentEntry.achievements.length === 0 && <div className="p-8 border border-dashed border-white/5 rounded-[2rem] text-center text-white/10 text-xs italic">Capture your moments of brilliance...</div>}
                  {currentEntry.achievements.map((achievement, idx) => (
                    <div key={idx} className="group flex items-center gap-4 p-5 rounded-[1.5rem] bg-gradient-to-r from-yellow-500/[0.05] to-transparent border border-yellow-500/10 hover:border-yellow-500/30 transition-all animate-in slide-in-from-right-3">
                      <div className="p-2 bg-yellow-500/20 rounded-xl"><Trophy size={16} className="text-yellow-400" /></div>
                      <span className="flex-1 text-sm text-white/90 font-bold tracking-tight">{achievement}</span>
                      <button onClick={() => updateCurrentEntry({ achievements: currentEntry.achievements.filter((_, i) => i !== idx) })} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 transition-all"><Trash2 size={16}/></button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
