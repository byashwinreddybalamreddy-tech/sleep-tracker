import {
  ClassScheduleItem,
  SleepRecord,
  ReelsLog,
  StudySession,
  AlarmItem,
  ReminderItem,
  StudentPreferences,
} from '../types';

export interface AppExportData {
  version: string;
  exportedAt: string;
  classes: ClassScheduleItem[];
  sleepRecords: SleepRecord[];
  reelsLog: ReelsLog;
  studySessions: StudySession[];
  alarms: AlarmItem[];
  reminders: ReminderItem[];
  preferences: StudentPreferences;
}

export function exportStudentData(data: {
  classes: ClassScheduleItem[];
  sleepRecords: SleepRecord[];
  reelsLog: ReelsLog;
  studySessions: StudySession[];
  alarms: AlarmItem[];
  reminders: ReminderItem[];
  preferences: StudentPreferences;
}) {
  const exportPayload: AppExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    ...data,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportPayload, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `syncstudy-data-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseImportData(rawJson: string): AppExportData | null {
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as AppExportData;
  } catch (err) {
    console.error('Failed to parse backup JSON:', err);
    return null;
  }
}
