
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 is Sunday

export interface Alarm {
  id: string;
  time: string; // HH:MM
  isActive: boolean;
  repeatDays: DayOfWeek[];
  audioMode: 'preset' | 'custom';
  selectedPresetId: string;
  customAudioId?: string; // Reference to IndexedDB key
  customAudioName?: string;
  snoozeDuration: number; // Duration in minutes
  label?: string;
}

export interface QuoteData {
  text: string;
  loading: boolean;
  error: string | null;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  diaryText: string;
  todos: TodoItem[];
  achievements: string[];
}

export interface SpecialDate {
  id: string;
  label: string;
  date: string; // YYYY-MM-DD
  type: 'birthday' | 'special';
  isRecurring: boolean; // For birthdays, matches MM-DD regardless of year
}

export interface VaultItem {
  id: string;
  title: string;
  secret: string;
  note?: string;
}
