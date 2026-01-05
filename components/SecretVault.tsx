
import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Unlock, Eye, EyeOff, Plus, Trash2, Key, Info, Sparkles } from 'lucide-react';
import { VaultItem } from '../types';

interface SecretVaultProps {
  onClose: () => void;
}

const VAULT_ITEMS_KEY = 'morning_glow_vault_items_v1';
const VAULT_PIN_KEY = 'morning_glow_vault_pin_v1';

export const SecretVault: React.FC<SecretVaultProps> = ({ onClose }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState<string | null>(localStorage.getItem(VAULT_PIN_KEY));
  const [error, setError] = useState('');
  
  const [items, setItems] = useState<VaultItem[]>(() => {
    const saved = localStorage.getItem(VAULT_ITEMS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<VaultItem>>({});
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLocked) {
      localStorage.setItem(VAULT_ITEMS_KEY, JSON.stringify(items));
    }
  }, [items, isLocked]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedPin) {
      if (pin.length < 4) {
        setError('Key must be at least 4 digits');
        return;
      }
      localStorage.setItem(VAULT_PIN_KEY, pin);
      setSavedPin(pin);
      setIsLocked(false);
      setPin('');
    } else {
      if (pin === savedPin) {
        setIsLocked(false);
        setError('');
        setPin('');
      } else {
        setError('The Stars do not align. Incorrect Key.');
        setPin('');
      }
    }
  };

  const addItem = () => {
    if (!newItem.title || !newItem.secret) return;
    const item: VaultItem = {
      id: Date.now().toString(),
      title: newItem.title,
      secret: newItem.secret,
      note: newItem.note
    };
    setItems([...items, item]);
    setNewItem({});
    setIsAdding(false);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const toggleVisibility = (id: string) => {
    const next = new Set(visibleSecrets);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisibleSecrets(next);
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-700">
        <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-950 to-black border border-white/10 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(0,0,0,1)]">
              <Shield size={40} className="text-purple-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-light text-white tracking-widest uppercase">Celestial Vault</h1>
            <p className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase">
              {savedPin ? 'Unlock with your Cosmic Key' : 'Establish your Cosmic Key'}
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="w-full space-y-6">
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="••••"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 text-center text-3xl tracking-[1em] text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-white/5"
                autoFocus
                maxLength={8}
              />
              {error && <p className="absolute -bottom-6 left-0 right-0 text-rose-400 text-[10px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-1">{error}</p>}
            </div>

            <div className="flex gap-3">
              <button 
                type="submit"
                className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-purple-100 transition-all active:scale-95 shadow-2xl"
              >
                {savedPin ? 'Access Void' : 'Create Key'}
              </button>
              <button 
                type="button"
                onClick={onClose}
                className="px-6 bg-white/5 text-white/40 rounded-2xl hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </form>

          {!savedPin && (
            <div className="flex items-center gap-2 text-white/20 text-[10px] font-medium tracking-wide">
              <Info size={12} />
              <span>This key is stored locally and cannot be recovered.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="glass rounded-[3rem] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border-white/10 bg-black/40 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        
        {/* Vault Header */}
        <header className="px-8 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-black border border-white/10 flex items-center justify-center text-purple-400 shadow-xl">
              <Unlock size={24} />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-white tracking-widest uppercase">The Void</h2>
              <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em]">Your secrets are safe among the stars</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAdding(true)}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-purple-50 transition-all shadow-xl active:scale-95 group"
              title="Seal New Secret"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <button onClick={onClose} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Vault Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isAdding && (
            <div className="mb-8 p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4 animate-in slide-in-from-top-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Identity / Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Secret Journal Code" 
                    value={newItem.title || ''} 
                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-purple-500/50 outline-none"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">The Secret</label>
                  <input 
                    type="text" 
                    placeholder="••••••••" 
                    value={newItem.secret || ''} 
                    onChange={e => setNewItem({...newItem, secret: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-purple-500/50 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Additional Note (Optional)</label>
                <textarea 
                  placeholder="Any extra details..." 
                  value={newItem.note || ''} 
                  onChange={e => setNewItem({...newItem, note: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-purple-500/50 outline-none h-24 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={addItem} className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-purple-500 shadow-lg transition-all">Seal Secret</button>
                <button onClick={() => setIsAdding(false)} className="px-6 bg-white/5 text-white/40 rounded-2xl hover:text-white">Discard</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
            {items.length === 0 && !isAdding && (
              <div className="col-span-full py-32 flex flex-col items-center text-center space-y-4 opacity-20">
                <Lock size={64} className="animate-pulse" />
                <p className="text-sm font-light tracking-[0.3em] uppercase">The Void is currently silent.</p>
              </div>
            )}
            {items.map(item => (
              <div key={item.id} className="group relative rounded-[2rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 hover:border-white/20 p-6 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => deleteItem(item.id)} className="p-2 text-white/20 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><Key size={14} /></div>
                    <h3 className="text-sm font-bold text-white/90 tracking-wide uppercase">{item.title}</h3>
                  </div>

                  <div className="bg-black/40 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                    <span className={`font-mono text-sm tracking-widest ${visibleSecrets.has(item.id) ? 'text-white' : 'text-white/20'}`}>
                      {visibleSecrets.has(item.id) ? item.secret : '••••••••••••'}
                    </span>
                    <button 
                      onClick={() => toggleVisibility(item.id)}
                      className="p-2 text-white/30 hover:text-white transition-colors"
                    >
                      {visibleSecrets.has(item.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {item.note && (
                    <p className="text-[10px] text-white/30 italic px-2 leading-relaxed text-left">{item.note}</p>
                  )}
                </div>

                <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none">
                  <Sparkles size={80} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <footer className="px-8 py-4 bg-black/40 border-t border-white/5 flex items-center justify-center gap-2">
          <Shield size={12} className="text-purple-400" />
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">End-to-End Local Persistence Enabled</span>
        </footer>
      </div>
    </div>
  );
};
