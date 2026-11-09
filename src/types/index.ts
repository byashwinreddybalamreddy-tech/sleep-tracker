export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface ClassScheduleItem {
  id: string;
  name: string;
  code?: string;
  day: DayOfWeek;
  startTime: string; // e.g. "09:00 AM" or "09:00"
  endTime: string;   // e.g. "10:30 AM" or "10:30"
  location?: string;
  instructor?: string;
  color: string;
}

export interface SleepRecord {
  id: string;
  date: string; // YYYY-MM-DD
  bedTime: string; // HH:mm
  wakeTime: string; // HH:mm
  durationHours: number;
  quality: 1 | 2 | 3 | 4 | 5;
  debtHours: number; // positive = deficit, negative = surplus
  notes?: string;
}

export interface ReelsLog {
  date: string; // YYYY-MM-DD
  count: number;
  estimatedMinutesLost: number;
  dailyLimit: number;
  history: { timestamp: number; added: number }[];
}

export interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  type: 'pomodoro' | 'short_break' | 'long_break' | 'deep_work';
  timestamp: string;
  notes?: string;
}

export type RingtoneId = 'gentle' | 'digital' | 'synth' | 'bowl';

export interface AlarmItem {
  id: string;
  label: string;
  time: string; // HH:mm (24h)
  enabled: boolean;
  days: DayOfWeek[];
  ringtone: RingtoneId;
  isAutoCalculated?: boolean;
  syncReason?: string;
  snoozeCount?: number;
  challengeType: 'none' | 'math' | 'detox_pledge';
}

export interface ReminderItem {
  id: string;
  title: string;
  time: string; // HH:mm
  category: 'class' | 'sleep' | 'study' | 'reels' | 'hydration';
  frequency: 'daily' | 'weekdays' | 'pre_class' | 'once';
  enabled: boolean;
  completed?: boolean;
  notes?: string;
}

export interface RoutineItem {
  time: string;
  activity: string;
  category: 'wake' | 'meal' | 'class' | 'study' | 'exercise' | 'winddown' | 'sleep';
  completed?: boolean;
}

export interface StudentPreferences {
  targetSleepHours: number;
  commuteMinutes: number;
  morningPrepMinutes: number;
  reelsDailyCap: number;
  preferredStudyBlockMinutes: number;
  autoAlarmEnabled: boolean;
}
