
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 is Sunday

export interface Alarm {
  id: string;
  time: string; // HH:MM
  isActive: boolean;
  repeatDays: DayOfWeek[];
  audioMode: 'preset' | 'custom';
  selectedPresetId: string;
  customAudioData?: string; // Base64 string for persistence
  customAudioName?: string;
  label?: string;
}

export interface QuoteData {
  text: string;
  loading: boolean;
  error: string | null;
}
