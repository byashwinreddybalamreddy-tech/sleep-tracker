import React, { useState } from 'react';
import { ClassScheduleItem, DayOfWeek, StudentPreferences } from '../types';
import { DAYS_ORDER, parseTimeToMinutes, calculateAutomatedAlarmForDay, getCurrentDayOfWeek } from '../utils/alarmCalculator';
import { SAMPLE_SCHEDULE_TEMPLATES } from '../utils/sampleData';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Upload,
  FileText,
  Sparkles,
  Check,
  AlertCircle,
  Bell,
} from 'lucide-react';

interface ClassTimingsProps {
  classes: ClassScheduleItem[];
  onUpdateClasses: (classes: ClassScheduleItem[]) => void;
  preferences: StudentPreferences;
  onSyncAlarms: () => void;
}

export const ClassTimings: React.FC<ClassTimingsProps> = ({
  classes,
  onUpdateClasses,
  preferences,
  onSyncAlarms,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [replaceMode, setReplaceMode] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Class Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDay, setNewDay] = useState<DayOfWeek>('Monday');
  const [newStartTime, setNewStartTime] = useState('09:00 AM');
  const [newEndTime, setNewEndTime] = useState('10:30 AM');
  const [newLocation, setNewLocation] = useState('');
  const [newInstructor, setNewInstructor] = useState('');
  const [newColor, setNewColor] = useState('#2563eb');

  const today = getCurrentDayOfWeek();
  const tomorrow = getCurrentDayOfWeek(1);
  const tomorrowAlarmCalc = calculateAutomatedAlarmForDay(classes, tomorrow, preferences);

  const filteredClasses = classes
    .filter((c) => selectedDay === 'all' || c.day === selectedDay)
    .sort((a, b) => {
      const dayDiff = DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
    });

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newClass: ClassScheduleItem = {
      id: 'cls_' + Date.now(),
      name: newName.trim(),
      code: newCode.trim() || undefined,
      day: newDay,
      startTime: newStartTime.trim(),
      endTime: newEndTime.trim(),
      location: newLocation.trim() || 'TBA',
      instructor: newInstructor.trim() || undefined,
      color: newColor,
    };

    onUpdateClasses([...classes, newClass]);
    setNewName('');
    setNewCode('');
    setNewLocation('');
    setNewInstructor('');
    setShowAddForm(false);
  };

  const handleDeleteClass = (id: string) => {
    onUpdateClasses(classes.filter((c) => c.id !== id));
  };

  const handleClearAllClasses = () => {
    onUpdateClasses([]);
    setParseStatus({ type: 'success', message: 'Cleared all classes. You can now add your own timetable!' });
  };

  const handleParseText = async (textToParse: string) => {
    if (!textToParse.trim()) {
      setParseStatus({ type: 'error', message: 'Please paste schedule text or upload a file first.' });
      return;
    }

    setIsParsing(true);
    setParseStatus(null);

    try {
      const res = await fetch('/api/gemini/parse-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: textToParse }),
      });

      const data = await res.json();
      if (data.classes && Array.isArray(data.classes) && data.classes.length > 0) {
        onUpdateClasses(replaceMode ? data.classes : [...classes, ...data.classes]);
        setParseStatus({
          type: 'success',
          message: `Successfully ${replaceMode ? 'loaded' : 'added'} ${data.classes.length} class timings!`,
        });
        setUploadText('');
      } else {
        setParseStatus({
          type: 'error',
          message: 'No class timings could be recognized. Try pasting or choosing a preset.',
        });
      }
    } catch (err: any) {
      setParseStatus({
        type: 'error',
        message: err?.message || 'Failed to parse timetable.',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setUploadText(content);
        handleParseText(content);
      }
    };
    reader.readAsText(file);
  };

  const loadTemplate = (key: 'cs' | 'premed' | 'highschool') => {
    const templateText = SAMPLE_SCHEDULE_TEMPLATES[key];
    setUploadText(templateText);
    handleParseText(templateText);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Sync Info */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-600">
              Timetable &amp; Schedule
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">{classes.length} Classes Enrolled</span>
          </div>
          <h2 className="text-2xl font-display font-semibold text-slate-900 mt-1">
            Class Timings &amp; Auto-Alarm Alignment
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tomorrow is <strong className="text-slate-700">{tomorrow}</strong>: {tomorrowAlarmCalc.earliestClass ? (
              <span>Earliest lecture is <strong className="text-blue-600">{tomorrowAlarmCalc.earliestClass.name}</strong> at <strong className="text-blue-600">{tomorrowAlarmCalc.earliestClass.startTime}</strong> (Wake up at <strong className="text-slate-800">{tomorrowAlarmCalc.wakeTime24}</strong>)</span>
            ) : (
              <span>No classes scheduled. Baseline circadian wake-up active.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {classes.length > 0 && (
            <button
              onClick={handleClearAllClasses}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Clear all classes to set up your own personal timetable"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              Clear All ({classes.length})
            </button>
          )}
          <button
            onClick={() => setShowUploadArea(!showUploadArea)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            Upload / Import Timings
          </button>
          <button
            onClick={onSyncAlarms}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#18181b] hover:bg-black text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Bell className="w-3.5 h-3.5" />
            Sync Alarms to Classes
          </button>
        </div>
      </div>

      {/* Upload & Import Modal/Panel */}
      {showUploadArea && (
        <div className="bg-white border border-blue-200/80 rounded-2xl p-5 space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">Upload or Paste Class Schedule</h3>
            </div>
            <button
              onClick={() => setShowUploadArea(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Upload your syllabus, exported timetable (.txt / .csv), or paste text below. The AI parser extracts subjects, days, times, and lecture rooms automatically.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* File Drag/Drop */}
            <div className="border border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center relative bg-slate-50/50">
              <input
                type="file"
                accept=".txt,.csv,.json"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-blue-600 mb-1" />
              <span className="text-xs font-medium text-slate-800">Upload Timetable File</span>
              <span className="text-[11px] text-slate-400">.txt, .csv, or syllabus file</span>
            </div>

            {/* Quick Presets */}
            <div className="md:col-span-2 bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
              <span className="text-xs font-medium text-slate-700">Quick Template Pre-fills:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => loadTemplate('cs')}
                  className="px-2.5 py-1 text-xs rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                >
                  Computer Science College
                </button>
                <button
                  onClick={() => loadTemplate('premed')}
                  className="px-2.5 py-1 text-xs rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                >
                  Pre-Med / Biology Major
                </button>
                <button
                  onClick={() => loadTemplate('highschool')}
                  className="px-2.5 py-1 text-xs rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                >
                  High School AP Timetable
                </button>
              </div>
            </div>
          </div>

          {/* Paste Raw Text */}
          <div className="space-y-2">
            <textarea
              rows={4}
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              placeholder="e.g.: Monday: 09:00 AM - 10:30 AM Calculus II in Hall 101, Prof Davis&#10;Wednesday: 11:00 AM - 12:30 PM Physics..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={replaceMode}
                  onChange={(e) => setReplaceMode(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">Replace current timetable with imported classes</span>
              </label>
              <button
                disabled={isParsing || !uploadText.trim()}
                onClick={() => handleParseText(uploadText)}
                className="px-4 py-2 bg-[#18181b] hover:bg-black disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isParsing ? 'Parsing Timetable...' : replaceMode ? 'Parse & Set Timetable' : 'Parse & Append Classes'}
              </button>
            </div>
          </div>

          {parseStatus && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                parseStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {parseStatus.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{parseStatus.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Day Filter Tabs & Manual Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedDay === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            All Days ({classes.length})
          </button>
          {DAYS_ORDER.map((d) => {
            const count = classes.filter((c) => c.day === d).length;
            const isToday = d === today;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  selectedDay === d
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>{d.slice(0, 3)}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] tabular-nums px-1.5 py-0.2 rounded-full ${
                      selectedDay === d
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Today" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Single Class
        </button>
      </div>

      {/* Manual Class Addition Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddClass}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Add New Class Schedule</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Course / Subject Title *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Linear Algebra"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Course Code (Optional)
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. MATH 220"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Day of Week
              </label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value as DayOfWeek)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {DAYS_ORDER.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                End Time
              </label>
              <input
                type="text"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Room / Location
              </label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Science Hall 204"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Professor / Instructor
              </label>
              <input
                type="text"
                value={newInstructor}
                onChange={(e) => setNewInstructor(e.target.value)}
                placeholder="e.g. Dr. John Watson"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Color Tag
              </label>
              <div className="flex items-center gap-2 pt-1">
                {['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewColor(col)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      newColor === col ? 'scale-110 border-slate-900' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#18181b] hover:bg-black text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
            >
              Save Class Timing
            </button>
          </div>
        </form>
      )}

      {/* Classes List View */}
      {filteredClasses.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">No classes for this selection</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don&apos;t have any class timings scheduled for {selectedDay === 'all' ? 'your week' : selectedDay}.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#18181b] hover:bg-black text-white transition-colors"
            >
              Add Class Manually
            </button>
            <button
              onClick={() => setShowUploadArea(true)}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Upload Schedule
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredClasses.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-4 transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-semibold text-slate-500">
                      {item.day} {item.code && `· ${item.code}`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteClass(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    title="Delete Class"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 mt-1.5 line-clamp-1">
                  {item.name}
                </h4>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono tabular-nums text-slate-800">
                      {item.startTime} – {item.endTime}
                    </span>
                  </div>

                  {item.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}

                  {item.instructor && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.instructor}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Prep buffer: {preferences.morningPrepMinutes + preferences.commuteMinutes}m
                </span>
                <span className="text-blue-600 font-medium">Auto-Synced</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
