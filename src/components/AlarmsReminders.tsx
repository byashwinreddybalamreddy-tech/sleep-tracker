import React, { useState } from 'react';
import { AlarmItem, ReminderItem, StudentPreferences, ClassScheduleItem, RingtoneId, DayOfWeek } from '../types';
import { previewRingtone, playChime } from '../utils/audio';
import { DAYS_ORDER, calculateAutomatedAlarmForDay, getCurrentDayOfWeek } from '../utils/alarmCalculator';
import {
  Bell,
  Clock,
  Volume2,
  Plus,
  Trash2,
  Sparkles,
  ShieldAlert,
  Play,
  CheckCircle2,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

interface AlarmsRemindersProps {
  alarms: AlarmItem[];
  reminders: ReminderItem[];
  preferences: StudentPreferences;
  classes: ClassScheduleItem[];
  onUpdateAlarms: (alarms: AlarmItem[]) => void;
  onUpdateReminders: (reminders: ReminderItem[]) => void;
  onUpdatePreferences: (prefs: StudentPreferences) => void;
  onTriggerTestAlarm: (alarm: AlarmItem) => void;
}

export const AlarmsReminders: React.FC<AlarmsRemindersProps> = ({
  alarms,
  reminders,
  preferences,
  classes,
  onUpdateAlarms,
  onUpdateReminders,
  onUpdatePreferences,
  onTriggerTestAlarm,
}) => {
  const [showAddAlarm, setShowAddAlarm] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [newAlarmLabel, setNewAlarmLabel] = useState('Morning Study Session');
  const [newAlarmTime, setNewAlarmTime] = useState('07:30');
  const [newAlarmRingtone, setNewAlarmRingtone] = useState<RingtoneId>('gentle');
  const [newAlarmDays, setNewAlarmDays] = useState<DayOfWeek[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [newAlarmChallenge, setNewAlarmChallenge] = useState<'none' | 'math' | 'detox_pledge'>('math');

  const [newRemTitle, setNewRemTitle] = useState('Drink 500ml Water');
  const [newRemTime, setNewRemTime] = useState('14:00');
  const [newRemCategory, setNewRemCategory] = useState<'class' | 'sleep' | 'study' | 'reels' | 'hydration'>('hydration');
  const [newRemFreq, setNewRemFreq] = useState<'daily' | 'weekdays' | 'pre_class' | 'once'>('daily');
  const [newRemNotes, setNewRemNotes] = useState('');

  const tomorrow = getCurrentDayOfWeek(1);
  const tomorrowCalc = calculateAutomatedAlarmForDay(classes, tomorrow, preferences);

  const toggleAlarm = (id: string) => {
    onUpdateAlarms(
      alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const toggleReminder = (id: string) => {
    onUpdateReminders(
      reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const deleteAlarm = (id: string) => {
    onUpdateAlarms(alarms.filter((a) => a.id !== id));
  };

  const deleteReminder = (id: string) => {
    onUpdateReminders(reminders.filter((r) => r.id !== id));
  };

  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AlarmItem = {
      id: 'alm_' + Date.now(),
      label: newAlarmLabel.trim() || 'Wake-up Alarm',
      time: newAlarmTime,
      enabled: true,
      days: newAlarmDays,
      ringtone: newAlarmRingtone,
      challengeType: newAlarmChallenge,
    };
    onUpdateAlarms([...alarms, created]);
    setShowAddAlarm(false);
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ReminderItem = {
      id: 'rem_' + Date.now(),
      title: newRemTitle.trim() || 'Reminder',
      time: newRemTime,
      category: newRemCategory,
      frequency: newRemFreq,
      enabled: true,
      notes: newRemNotes.trim() || undefined,
    };
    onUpdateReminders([...reminders, created]);
    setShowAddReminder(false);
    setNewRemNotes('');
  };

  const handleDayToggle = (day: DayOfWeek) => {
    if (newAlarmDays.includes(day)) {
      setNewAlarmDays(newAlarmDays.filter((d) => d !== day));
    } else {
      setNewAlarmDays([...newAlarmDays, day]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-600">
              Automated Alarms &amp; Smart Reminders
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono">
              {alarms.filter((a) => a.enabled).length} Alarms Armed
            </span>
          </div>
          <h2 className="text-2xl font-display font-semibold text-slate-900 mt-1">
            Automated Alarm Setter &amp; Notification Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Never miss morning lecture. Automatically calculates wake-up times from your uploaded class timetable.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            Alarm &amp; Commute Settings
          </button>
          <button
            onClick={() => setShowAddAlarm(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#18181b] hover:bg-black text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Alarm
          </button>
        </div>
      </div>

      {/* Commute & Alarm Parameters Drawer */}
      {showSettings && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">Automated Alarm Math Parameters</h3>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-slate-500">
            How the automated alarm setter computes your wake-up time:
            <code className="block bg-slate-50 border border-slate-200 p-2 rounded-lg text-blue-700 font-mono text-[11px] mt-1.5">
              Wake Alarm = [Class Start Time] - (Morning Prep: {preferences.morningPrepMinutes}m + Commute: {preferences.commuteMinutes}m + Safety Buffer: 15m)
            </code>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Morning Prep Time: <strong className="text-blue-600 font-mono">{preferences.morningPrepMinutes} mins</strong>
              </label>
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={preferences.morningPrepMinutes}
                onChange={(e) =>
                  onUpdatePreferences({
                    ...preferences,
                    morningPrepMinutes: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">Shower, breakfast, packing</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Commute to Campus: <strong className="text-blue-600 font-mono">{preferences.commuteMinutes} mins</strong>
              </label>
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={preferences.commuteMinutes}
                onChange={(e) =>
                  onUpdatePreferences({
                    ...preferences,
                    commuteMinutes: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">Transit / walking duration</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Sleep Duration: <strong className="text-blue-600 font-mono">{preferences.targetSleepHours} hours</strong>
              </label>
              <input
                type="range"
                min="6"
                max="10"
                step="0.5"
                value={preferences.targetSleepHours}
                onChange={(e) =>
                  onUpdatePreferences({
                    ...preferences,
                    targetSleepHours: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">Sets optimal bedtime wind-down</span>
            </div>
          </div>
        </div>
      )}

      {/* Automated Alarm Feature Highlight Card */}
      <div className="bg-gradient-to-r from-blue-50/70 via-white to-slate-50 border border-blue-200/90 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Smart Auto-Alarm Status
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-600">Synchronized with Class Timetable</span>
          </div>

          <h3 className="text-base font-semibold text-slate-900">
            Tomorrow ({tomorrow}): Wake-up at <span className="text-blue-600 font-mono font-bold text-lg">{tomorrowCalc.wakeTime24}</span>
          </h3>

          <p className="text-xs text-slate-500 max-w-xl">
            {tomorrowCalc.reason}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() =>
              onTriggerTestAlarm({
                id: 'test_auto',
                label: 'Test: Smart Wake-up Alarm',
                time: tomorrowCalc.wakeTime24,
                enabled: true,
                days: [tomorrow],
                ringtone: 'gentle',
                isAutoCalculated: true,
                syncReason: tomorrowCalc.reason,
                challengeType: 'math',
              })
            }
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#18181b] hover:bg-black text-white transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Simulate Ringing Alarm
          </button>
        </div>
      </div>

      {/* Alarms List Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Configured Wake-Up Alarms ({alarms.length})
          </h3>
          <span className="text-xs text-slate-400">Live clock active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                alarm.enabled
                  ? 'bg-white border-slate-200/90 shadow-2xs hover:shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                      {alarm.isAutoCalculated ? 'Auto-Calculated' : 'Custom Alarm'}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 mt-0.5 line-clamp-1">
                      {alarm.label}
                    </h4>
                  </div>

                  <button
                    onClick={() => toggleAlarm(alarm.id)}
                    className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                      alarm.enabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                <div className="text-3xl font-mono font-bold text-slate-900 tracking-tight mt-2 tabular-nums">
                  {alarm.time}
                </div>

                {alarm.syncReason && (
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {alarm.syncReason}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mt-3">
                  {alarm.days.map((d) => (
                    <span
                      key={d}
                      className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded"
                    >
                      {d.slice(0, 3)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <button
                  onClick={() => previewRingtone(alarm.ringtone)}
                  className="p-1 text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 text-[11px]"
                  title="Preview Sound"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="capitalize">{alarm.ringtone}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTriggerTestAlarm(alarm)}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Test Modal
                  </button>
                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete Alarm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Alarm Modal */}
      {showAddAlarm && (
        <form
          onSubmit={handleAddAlarm}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Create New Alarm</h3>
            <button
              type="button"
              onClick={() => setShowAddAlarm(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Alarm Label
              </label>
              <input
                type="text"
                required
                value={newAlarmLabel}
                onChange={(e) => setNewAlarmLabel(e.target.value)}
                placeholder="e.g. Physics Revision Wake-up"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Time (24h)
              </label>
              <input
                type="time"
                required
                value={newAlarmTime}
                onChange={(e) => setNewAlarmTime(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Ringtone Sound
              </label>
              <select
                value={newAlarmRingtone}
                onChange={(e) => setNewAlarmRingtone(e.target.value as RingtoneId)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="gentle">Gentle Sunrise (Warm Chime)</option>
                <option value="digital">Digital Pulse (8-bit Beep)</option>
                <option value="synth">Energetic Synth (Upbeat)</option>
                <option value="bowl">Zen Singing Bowl (Resonant)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Wake-up Challenge
              </label>
              <select
                value={newAlarmChallenge}
                onChange={(e) => setNewAlarmChallenge(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="math">Math Puzzle (Solves to Wake)</option>
                <option value="detox_pledge">Anti-Doomscroll Pledge</option>
                <option value="none">Standard Instant Dismiss</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Repeat Days
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {DAYS_ORDER.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDayToggle(d)}
                  className={`px-3 py-1 text-xs rounded-lg font-mono transition-colors ${
                    newAlarmDays.includes(d)
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#18181b] hover:bg-black text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
            >
              Arm Alarm
            </button>
          </div>
        </form>
      )}

      {/* Reminders Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-900">Daily Student Reminders</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hydration, pre-class packing, focus blocks, and reels hard stops.
            </p>
          </div>

          <button
            onClick={() => setShowAddReminder(!showAddReminder)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Reminder
          </button>
        </div>

        {showAddReminder && (
          <form
            onSubmit={handleAddReminder}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-fade-in"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  required
                  value={newRemTitle}
                  onChange={(e) => setNewRemTitle(e.target.value)}
                  placeholder="e.g. Afternoon Water & Stretch"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Time (24h)
                </label>
                <input
                  type="time"
                  required
                  value={newRemTime}
                  onChange={(e) => setNewRemTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={newRemCategory}
                  onChange={(e) => setNewRemCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="class">Class Prep</option>
                  <option value="study">Study Focus Block</option>
                  <option value="reels">Reels &amp; Screen Stop</option>
                  <option value="hydration">Hydration / Health</option>
                  <option value="sleep">Sleep Wind-Down</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Frequency
                </label>
                <select
                  value={newRemFreq}
                  onChange={(e) => setNewRemFreq(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays Only</option>
                  <option value="pre_class">15m Pre-Class</option>
                  <option value="once">Once</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-[#18181b] hover:bg-black text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
              >
                Save Reminder
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                rem.enabled
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-white border-slate-100 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleReminder(rem.id)}
                  className={`w-8 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                    rem.enabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-2xs" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{rem.title}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-blue-600 font-mono tabular-nums font-bold">
                      {rem.time}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[10px] text-slate-500 uppercase">{rem.frequency}</span>
                  </div>
                  {rem.notes && <p className="text-[11px] text-slate-500">{rem.notes}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => playChime()}
                  className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Test Chime Sound"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteReminder(rem.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
