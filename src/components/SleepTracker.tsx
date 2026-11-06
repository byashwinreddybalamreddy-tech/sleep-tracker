import React, { useState } from 'react';
import { SleepRecord, StudentPreferences, ClassScheduleItem } from '../types';
import { calculateAutomatedAlarmForDay, getCurrentDayOfWeek } from '../utils/alarmCalculator';
import {
  Moon,
  Sun,
  Star,
  Plus,
  Trash2,
  Bed,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface SleepTrackerProps {
  sleepRecords: SleepRecord[];
  onUpdateSleep: (records: SleepRecord[]) => void;
  preferences: StudentPreferences;
  classes: ClassScheduleItem[];
  onOpenWeeklyReport: () => void;
}

export const SleepTracker: React.FC<SleepTrackerProps> = ({
  sleepRecords,
  onUpdateSleep,
  preferences,
  classes,
  onOpenWeeklyReport,
}) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [inBedTimestamp, setInBedTimestamp] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [notes, setNotes] = useState('');

  const tomorrow = getCurrentDayOfWeek(1);
  const tomorrowAlarm = calculateAutomatedAlarmForDay(classes, tomorrow, preferences);

  const calculateHours = (bed: string, wake: string): number => {
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let bedMins = bh * 60 + bm;
    let wakeMins = wh * 60 + wm;
    if (wakeMins <= bedMins) {
      wakeMins += 24 * 60; // crossed midnight
    }
    const diff = (wakeMins - bedMins) / 60;
    return parseFloat(diff.toFixed(2));
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateHours(bedTime, wakeTime);
    const debt = parseFloat((preferences.targetSleepHours - duration).toFixed(2));

    const newRecord: SleepRecord = {
      id: 'slp_' + Date.now(),
      date,
      bedTime,
      wakeTime,
      durationHours: duration,
      quality,
      debtHours: debt,
      notes: notes.trim() || undefined,
    };

    onUpdateSleep([newRecord, ...sleepRecords]);
    setShowLogForm(false);
    setNotes('');
  };

  const handleDeleteRecord = (id: string) => {
    onUpdateSleep(sleepRecords.filter((r) => r.id !== id));
  };

  const handleGoingToBedNow = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setInBedTimestamp(timeStr);
  };

  const handleJustWokeUp = () => {
    const now = new Date();
    const wakeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const bedStr = inBedTimestamp || '23:30';

    const duration = calculateHours(bedStr, wakeStr);
    const debt = parseFloat((preferences.targetSleepHours - duration).toFixed(2));

    const newRecord: SleepRecord = {
      id: 'slp_' + Date.now(),
      date: now.toISOString().slice(0, 10),
      bedTime: bedStr,
      wakeTime: wakeStr,
      durationHours: duration,
      quality: 4,
      debtHours: debt,
      notes: 'Logged via Quick Wake-Up action',
    };

    onUpdateSleep([newRecord, ...sleepRecords]);
    setInBedTimestamp(null);
  };

  const totalLoggedHours = sleepRecords.reduce((acc, r) => acc + r.durationHours, 0);
  const avgHours = sleepRecords.length > 0 ? (totalLoggedHours / sleepRecords.length).toFixed(1) : '0';
  const totalDebt = sleepRecords.reduce((acc, r) => acc + (r.debtHours > 0 ? r.debtHours : 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-600">
              Sleep &amp; Circadian Health
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono">
              Target: {preferences.targetSleepHours}h per night
            </span>
          </div>
          <h2 className="text-2xl font-display font-semibold text-slate-900 mt-1">
            Student Sleep Tracker &amp; Debt Recovery
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aligned with your class timetable to ensure restorative sleep before early lectures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onOpenWeeklyReport}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            Weekly Sleep Report
          </button>

          {!inBedTimestamp ? (
            <button
              onClick={handleGoingToBedNow}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
            >
              <Moon className="w-3.5 h-3.5 text-blue-600" />
              Going to Bed Now
            </button>
          ) : (
            <button
              onClick={handleJustWokeUp}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Sun className="w-3.5 h-3.5 fill-current" />
              Just Woke Up ({inBedTimestamp})
            </button>
          )}

          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Log Sleep Entry
          </button>
        </div>
      </div>

      {/* Recommended Bedtime Card */}
      <div className="bg-gradient-to-r from-blue-50 via-white to-slate-50 border border-blue-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">
              Optimal Bedtime for Tomorrow ({tomorrow})
            </span>
          </div>
          <p className="text-sm text-slate-800">
            Earliest lecture: <strong className="text-slate-900">{tomorrowAlarm.earliestClass ? tomorrowAlarm.earliestClass.name : 'Self-Paced Study'}</strong> at <strong className="text-slate-900">{tomorrowAlarm.earliestClass ? tomorrowAlarm.earliestClass.startTime : '09:00 AM'}</strong>
          </p>
          <p className="text-xs text-slate-500">
            For {preferences.targetSleepHours} hours rest + {preferences.morningPrepMinutes + preferences.commuteMinutes}m morning prep, head to sleep by:
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-3xl sm:text-4xl font-mono font-bold text-blue-600 block">
            {tomorrowAlarm.bedTime24}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Wake Alarm: {tomorrowAlarm.wakeTime24}
          </span>
        </div>
      </div>

      {/* Sleep Metrics Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 block">Average Nightly Sleep</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-display font-semibold text-slate-900 tabular-nums">{avgHours}</span>
            <span className="text-xs text-slate-400">hours</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Across {sleepRecords.length} recorded nights
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 block">Accumulated Sleep Debt</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-3xl font-display font-semibold tabular-nums ${totalDebt > 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {totalDebt.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">hours deficit</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {totalDebt > 2 ? 'Recommend 45m earlier sleep tonight' : 'Sleep debt under safe threshold'}
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 block">Sleep Quality Index</span>
          <div className="flex items-center gap-1 mt-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i <= 4 ? 'fill-current' : 'text-slate-200'}`}
              />
            ))}
            <span className="text-sm font-mono font-bold text-slate-800 ml-2">4.0 / 5</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Higher quality on zero-screen bedtimes
          </span>
        </div>
      </div>

      {/* Manual Sleep Entry Form */}
      {showLogForm && (
        <form
          onSubmit={handleSaveRecord}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Log Sleep Session</h3>
            <button
              type="button"
              onClick={() => setShowLogForm(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Bed Time (Went to Sleep)
              </label>
              <input
                type="time"
                required
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Wake Time (Woke Up)
              </label>
              <input
                type="time"
                required
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Sleep Quality (1 - 5)
              </label>
              <div className="flex items-center gap-1 pt-1.5 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setQuality(star as any)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= quality ? 'fill-current' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Sleep Observations &amp; Pre-bed Habits
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Read book for 20m, no phone in bed, woke up alert..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-600 font-mono">
              Calculated Rest: <strong>{calculateHours(bedTime, wakeTime)} hours</strong>
            </span>
            <button
              type="submit"
              className="px-4 py-2 bg-[#18181b] hover:bg-black text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
            >
              Save Sleep Log
            </button>
          </div>
        </form>
      )}

      {/* Historical Sleep Logs Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-2xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Recent Sleep Logs
        </h3>

        <div className="space-y-2">
          {sleepRecords.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 border border-blue-100">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 font-mono">{item.date}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600 font-mono">
                      {item.bedTime} → {item.wakeTime}
                    </span>
                  </div>
                  {item.notes && <p className="text-slate-500 text-[11px] mt-0.5">{item.notes}</p>}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-slate-900 tabular-nums block">
                    {item.durationHours} hrs
                  </span>
                  <span
                    className={`text-[10px] font-mono font-medium ${
                      item.debtHours > 0 ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {item.debtHours > 0 ? `+${item.debtHours}h debt` : 'Target met'}
                  </span>
                </div>

                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= item.quality ? 'fill-current' : 'text-slate-200'}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => handleDeleteRecord(item.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete Log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
