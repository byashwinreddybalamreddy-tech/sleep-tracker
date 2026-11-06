import { ClassScheduleItem, DayOfWeek, AlarmItem, StudentPreferences } from '../types';

export const DAYS_ORDER: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * Parses time string like "09:30 AM", "9:30am", "14:15", "9:00" into minutes from midnight (0 - 1439)
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();

  const is12Hour = clean.includes('AM') || clean.includes('PM');
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');

  const numbersOnly = clean.replace(/[^\d:]/g, '');
  const [hoursStr, minsStr] = numbersOnly.split(':');
  let hours = parseInt(hoursStr || '0', 10);
  const minutes = parseInt(minsStr || '0', 10);

  if (is12Hour) {
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight into 24h format "HH:mm" (for HTML time inputs)
 */
export function minutesTo24h(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Converts 24h time "HH:mm" or minutes to friendly 12h string "9:30 AM"
 */
export function format12Hour(time: string | number): string {
  const totalMins = typeof time === 'number' ? time : parseTimeToMinutes(time);
  const normalized = ((totalMins % 1440) + 1440) % 1440;
  const h24 = Math.floor(normalized / 60);
  const m = normalized % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get current day of week as DayOfWeek
 */
export function getCurrentDayOfWeek(offsetDays: number = 0): DayOfWeek {
  const date = new Date();
  if (offsetDays !== 0) {
    date.setDate(date.getDate() + offsetDays);
  }
  const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const map: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return map[dayIndex];
}

/**
 * Find the earliest class for a given day
 */
export function getEarliestClassForDay(
  classes: ClassScheduleItem[],
  day: DayOfWeek
): ClassScheduleItem | null {
  const dayClasses = classes.filter((c) => c.day === day);
  if (dayClasses.length === 0) return null;

  return dayClasses.reduce((earliest, current) => {
    return parseTimeToMinutes(current.startTime) < parseTimeToMinutes(earliest.startTime)
      ? current
      : earliest;
  });
}

/**
 * Calculate automated wake up time and bedtime based on preferences and class schedule
 */
export function calculateAutomatedAlarmForDay(
  classes: ClassScheduleItem[],
  day: DayOfWeek,
  prefs: StudentPreferences
): {
  wakeMinutes: number;
  bedMinutes: number;
  wakeTime24: string;
  bedTime24: string;
  earliestClass: ClassScheduleItem | null;
  reason: string;
} {
  const earliestClass = getEarliestClassForDay(classes, day);
  const bufferMinutes = 15; // standard buffer

  let wakeMinutes = 7 * 60; // default 07:00 AM
  let reason = 'Consistent healthy circadian baseline (No early classes)';

  if (earliestClass) {
    const classStartMins = parseTimeToMinutes(earliestClass.startTime);
    const totalPrepAndCommute = prefs.morningPrepMinutes + prefs.commuteMinutes + bufferMinutes;
    wakeMinutes = classStartMins - totalPrepAndCommute;

    reason = `Auto-calculated: ${earliestClass.name} starts at ${earliestClass.startTime} (${prefs.morningPrepMinutes}m prep + ${prefs.commuteMinutes}m commute + 15m buffer)`;
  }

  // Bedtime calculation: Wake time - targetSleepHours - 30m winddown
  const bedMinutes = wakeMinutes - prefs.targetSleepHours * 60;

  return {
    wakeMinutes,
    bedMinutes,
    wakeTime24: minutesTo24h(wakeMinutes),
    bedTime24: minutesTo24h(bedMinutes),
    earliestClass,
    reason,
  };
}

/**
 * Generates automated alarm items for the student's timetable
 */
export function generateSmartAlarms(
  classes: ClassScheduleItem[],
  prefs: StudentPreferences
): AlarmItem[] {
  const alarms: AlarmItem[] = [];

  // Group days by earliest class time so we don't create 7 duplicate alarms if all start at the same time
  const dayMap = new Map<number, { days: DayOfWeek[]; reasons: string[]; className: string }>();

  DAYS_ORDER.forEach((day) => {
    const res = calculateAutomatedAlarmForDay(classes, day, prefs);
    const key = res.wakeMinutes;
    if (!dayMap.has(key)) {
      dayMap.set(key, {
        days: [day],
        reasons: [res.reason],
        className: res.earliestClass ? res.earliestClass.name : 'Morning Routine',
      });
    } else {
      dayMap.get(key)!.days.push(day);
    }
  });

  let index = 0;
  dayMap.forEach((val, wakeMins) => {
    index++;
    const isWeekday = val.days.every((d) => d !== 'Saturday' && d !== 'Sunday');
    const label = `Smart Wake-up (${val.className})`;

    alarms.push({
      id: `auto_alarm_${index}`,
      label,
      time: minutesTo24h(wakeMins),
      enabled: prefs.autoAlarmEnabled,
      days: val.days,
      ringtone: 'gentle',
      isAutoCalculated: true,
      syncReason: val.reasons[0],
      challengeType: 'math',
    });
  });

  return alarms;
}
