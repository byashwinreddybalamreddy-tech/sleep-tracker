import { ClassScheduleItem, SleepRecord, ReminderItem, AlarmItem, StudentPreferences, RoutineItem } from '../types';

export const DEFAULT_PREFERENCES: StudentPreferences = {
  targetSleepHours: 8,
  commuteMinutes: 30,
  morningPrepMinutes: 45,
  reelsDailyCap: 35,
  preferredStudyBlockMinutes: 50,
  autoAlarmEnabled: true,
};

export const INITIAL_CLASSES: ClassScheduleItem[] = [
  {
    id: 'cls_1',
    name: 'Data Structures & Algorithms',
    code: 'CS 201',
    day: 'Monday',
    startTime: '08:30 AM',
    endTime: '10:00 AM',
    location: 'Turing Hall 302',
    instructor: 'Dr. Evelyn Vance',
    color: '#3b82f6',
  },
  {
    id: 'cls_2',
    name: 'Discrete Mathematics',
    code: 'MATH 150',
    day: 'Monday',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    location: 'Euler Hall 104',
    instructor: 'Prof. Miller',
    color: '#8b5cf6',
  },
  {
    id: 'cls_3',
    name: 'Physics for Engineers II',
    code: 'PHYS 210',
    day: 'Tuesday',
    startTime: '09:00 AM',
    endTime: '10:45 AM',
    location: 'Science Complex B12',
    instructor: 'Dr. Aris Thorne',
    color: '#10b981',
  },
  {
    id: 'cls_4',
    name: 'Data Structures Lab',
    code: 'CS 201L',
    day: 'Tuesday',
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    location: 'Computing Lab 4',
    instructor: 'TA Alex Rivera',
    color: '#06b6d4',
  },
  {
    id: 'cls_5',
    name: 'Data Structures & Algorithms',
    code: 'CS 201',
    day: 'Wednesday',
    startTime: '08:30 AM',
    endTime: '10:00 AM',
    location: 'Turing Hall 302',
    instructor: 'Dr. Evelyn Vance',
    color: '#3b82f6',
  },
  {
    id: 'cls_6',
    name: 'Discrete Mathematics',
    code: 'MATH 150',
    day: 'Wednesday',
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    location: 'Euler Hall 104',
    instructor: 'Prof. Miller',
    color: '#8b5cf6',
  },
  {
    id: 'cls_7',
    name: 'Physics for Engineers II',
    code: 'PHYS 210',
    day: 'Thursday',
    startTime: '09:00 AM',
    endTime: '10:45 AM',
    location: 'Science Complex B12',
    instructor: 'Dr. Aris Thorne',
    color: '#10b981',
  },
  {
    id: 'cls_8',
    name: 'Computer Organization & Architecture',
    code: 'CS 240',
    day: 'Friday',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    location: 'Hardware Lab 201',
    instructor: 'Prof. Sarah Chen',
    color: '#f59e0b',
  },
];

export const INITIAL_SLEEP_RECORDS: SleepRecord[] = [
  {
    id: 'sleep_1',
    date: '2026-11-04',
    bedTime: '23:30',
    wakeTime: '07:15',
    durationHours: 7.75,
    quality: 4,
    debtHours: 0.25,
    notes: 'Fell asleep smoothly after reading, no reels in bed.',
  },
  {
    id: 'sleep_2',
    date: '2026-11-03',
    bedTime: '00:45',
    wakeTime: '07:00',
    durationHours: 6.25,
    quality: 2,
    debtHours: 1.75,
    notes: 'Late night doomscrolling reels delayed bedtime by over an hour.',
  },
  {
    id: 'sleep_3',
    date: '2026-11-02',
    bedTime: '23:15',
    wakeTime: '07:30',
    durationHours: 8.25,
    quality: 5,
    debtHours: -0.25,
    notes: 'Excellent rest, woke up energized for CS lecture.',
  },
  {
    id: 'sleep_4',
    date: '2026-11-01',
    bedTime: '23:45',
    wakeTime: '07:00',
    durationHours: 7.25,
    quality: 3,
    debtHours: 0.75,
    notes: 'Slight morning grogginess, needed coffee early.',
  },
];

export const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'alarm_mon_wed',
    label: 'Earliest Class Wake-up (CS 201)',
    time: '07:00',
    enabled: true,
    days: ['Monday', 'Wednesday'],
    ringtone: 'gentle',
    isAutoCalculated: true,
    syncReason: 'CS 201 starts at 08:30 AM (45m prep + 30m commute + 15m buffer)',
    challengeType: 'math',
  },
  {
    id: 'alarm_tue_thu',
    label: 'Physics Wake-up (PHYS 210)',
    time: '07:30',
    enabled: true,
    days: ['Tuesday', 'Thursday'],
    ringtone: 'gentle',
    isAutoCalculated: true,
    syncReason: 'PHYS 210 starts at 09:00 AM (45m prep + 30m commute + 15m buffer)',
    challengeType: 'math',
  },
  {
    id: 'alarm_friday',
    label: 'Friday Wake-up (CS 240)',
    time: '08:30',
    enabled: true,
    days: ['Friday'],
    ringtone: 'synth',
    isAutoCalculated: true,
    syncReason: 'CS 240 starts at 10:00 AM (45m prep + 30m commute + 15m buffer)',
    challengeType: 'none',
  },
];

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem_1',
    title: 'Pre-Class Backpack & Notes Check',
    time: '07:45',
    category: 'class',
    frequency: 'weekdays',
    enabled: true,
    notes: 'Laptop charger, tablet stylus, and problem set printout',
  },
  {
    id: 'rem_2',
    title: 'Afternoon Deep Work Study Block',
    time: '14:30',
    category: 'study',
    frequency: 'weekdays',
    enabled: true,
    notes: 'Turn on Do Not Disturb and start 50-minute Pomodoro',
  },
  {
    id: 'rem_3',
    title: 'Hydration & Posture Reset',
    time: '16:00',
    category: 'hydration',
    frequency: 'daily',
    enabled: true,
    notes: '500ml water and 2 minute neck/shoulder stretch',
  },
  {
    id: 'rem_4',
    title: 'Reels & Doomscroll Hard Stop Alert',
    time: '21:30',
    category: 'reels',
    frequency: 'daily',
    enabled: true,
    notes: 'Close Instagram / TikTok / YouTube Shorts for the evening',
  },
  {
    id: 'rem_5',
    title: 'Bedtime Digital Wind-Down',
    time: '22:30',
    category: 'sleep',
    frequency: 'daily',
    enabled: true,
    notes: 'Blue light filters on, warm shower, light reading',
  },
];

export const SAMPLE_SCHEDULE_TEMPLATES = {
  cs: `Monday: 08:30 AM - 10:00 AM Data Structures & Algorithms (Turing Hall 302, Dr. Evelyn Vance)
Monday: 11:00 AM - 12:30 PM Discrete Mathematics (Euler Hall 104, Prof. Miller)
Tuesday: 09:00 AM - 10:45 AM Physics for Engineers II (Science Complex B12, Dr. Aris Thorne)
Tuesday: 02:00 PM - 04:00 PM Data Structures Lab (Computing Lab 4, TA Alex Rivera)
Wednesday: 08:30 AM - 10:00 AM Data Structures & Algorithms (Turing Hall 302, Dr. Evelyn Vance)
Wednesday: 11:00 AM - 12:30 PM Discrete Mathematics (Euler Hall 104, Prof. Miller)
Thursday: 09:00 AM - 10:45 AM Physics for Engineers II (Science Complex B12, Dr. Aris Thorne)
Friday: 10:00 AM - 12:00 PM Computer Organization & Architecture (Hardware Lab 201, Prof. Sarah Chen)`,

  premed: `Monday: 08:00 AM - 09:30 AM Organic Chemistry I (Hall 101, Dr. Hayes)
Monday: 10:00 AM - 11:30 AM Cellular Biology (Bio Science 204, Dr. Rodriguez)
Tuesday: 08:00 AM - 11:00 AM Chemistry Lab (Chem Annex 4, Prof. Green)
Wednesday: 08:00 AM - 09:30 AM Organic Chemistry I (Hall 101, Dr. Hayes)
Wednesday: 01:00 PM - 02:30 PM Statistics for Life Sciences (Math 112)
Thursday: 10:00 AM - 11:30 AM Cellular Biology (Bio Science 204, Dr. Rodriguez)
Friday: 09:00 AM - 10:30 AM Medical Ethics Seminar (Humanities 310)`,

  highschool: `Monday: 08:00 AM - 09:15 AM AP Calculus AB (Room 12, Mrs. Baker)
Monday: 09:25 AM - 10:40 AM AP English Literature (Room 24, Mr. Davis)
Monday: 11:00 AM - 12:15 PM AP Chemistry (Lab 3, Dr. Paul)
Monday: 01:00 PM - 02:15 PM US History (Room 18, Coach Miller)
Tuesday: 08:00 AM - 09:15 AM AP Calculus AB (Room 12, Mrs. Baker)
Wednesday: 08:00 AM - 09:15 AM AP Calculus AB (Room 12, Mrs. Baker)
Thursday: 08:00 AM - 09:15 AM AP Calculus AB (Room 12, Mrs. Baker)
Friday: 08:00 AM - 09:15 AM AP Calculus AB (Room 12, Mrs. Baker)`,
};
