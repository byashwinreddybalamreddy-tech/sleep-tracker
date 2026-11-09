import React, { useState } from 'react';
import {
  ClassScheduleItem,
  SleepRecord,
  ReelsLog,
  StudySession,
  AlarmItem,
  ReminderItem,
  StudentPreferences,
  DayOfWeek,
} from '../types';
import {
  DAYS_ORDER,
  getCurrentDayOfWeek,
  parseTimeToMinutes,
  calculateAutomatedAlarmForDay,
} from '../utils/alarmCalculator';
import {
  SlidersHorizontal,
  Calendar,
  Filter,
  ArrowUpRight,
  Sparkles,
  LayoutGrid,
  CheckSquare,
  Bot,
  Clock,
  FlaskConical,
  Flame,
  ChevronDown,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';

interface DashboardOverviewProps {
  classes: ClassScheduleItem[];
  sleepRecords: SleepRecord[];
  reelsLog: ReelsLog;
  studySessions: StudySession[];
  alarms: AlarmItem[];
  reminders: ReminderItem[];
  preferences: StudentPreferences;
  onNavigate: (tab: 'classes' | 'sleep' | 'reels' | 'study' | 'alarms' | 'routine') => void;
  onAddReel: () => void;
  onStartStudy: () => void;
  onSyncAlarms: () => void;
  onTriggerTestAlarm: (alarm: AlarmItem) => void;
  onOpenWeeklyReport: () => void;
  onUpdateReminders?: (reminders: ReminderItem[]) => void;
  onClearDemoData?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  classes,
  sleepRecords,
  reelsLog,
  studySessions,
  alarms,
  reminders,
  preferences,
  onNavigate,
  onAddReel,
  onStartStudy,
  onSyncAlarms,
  onOpenWeeklyReport,
  onUpdateReminders,
  onClearDemoData,
}) => {
  const today = getCurrentDayOfWeek();
  const dayNames: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const todayIndex = Math.max(0, dayNames.indexOf(today));

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayIndex !== -1 ? todayIndex : 0);
  const [bottomTab, setBottomTab] = useState<'classes' | 'tasks'>('classes');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  const tomorrow = getCurrentDayOfWeek(1);
  const tomorrowCalc = calculateAutomatedAlarmForDay(classes, tomorrow, preferences);

  // Compute dynamic weekday bars based on actual classes and study sessions
  const weekDays = dayNames.map((dayName) => {
    const dayClasses = classes.filter((c) => c.day === dayName);
    const dayClassHours = dayClasses.reduce((acc, c) => {
      const dur = (parseTimeToMinutes(c.endTime) - parseTimeToMinutes(c.startTime)) / 60;
      return acc + (dur > 0 ? dur : 1.5);
    }, 0);

    const daySessions = studySessions.filter((s) => {
      const d = new Date(s.timestamp);
      const sDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
      return sDay === dayName;
    });
    const dayStudyMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const dayStudyHours = dayStudyMins / 60;

    const totalHours = parseFloat((dayClassHours + dayStudyHours).toFixed(1));
    const percent = Math.max(18, Math.min(100, Math.round((totalHours / 6) * 100)));
    const tasksCount = dayClasses.length + daySessions.length;

    return {
      day: dayName,
      label: dayName.slice(0, 3),
      totalHours,
      tasks: tasksCount > 0 ? tasksCount : 1,
      percent: totalHours > 0 ? percent : 20,
      classCount: dayClasses.length,
      studyMins: dayStudyMins,
      isHighlight: today === dayName,
    };
  });

  const activeDayData = weekDays[selectedDayIndex] || weekDays[0];
  const selectedDayName = activeDayData.day;

  // Filter classes for the currently selected day
  const selectedDayClasses = classes
    .filter((c) => c.day === selectedDayName)
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  // Compute upcoming class today
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todaysClasses = classes
    .filter((c) => c.day === today)
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  const upcomingClass = todaysClasses.find(
    (c) => parseTimeToMinutes(c.endTime) >= currentMinutes
  );

  // Study stats
  const todayDateStr = now.toISOString().slice(0, 10);
  const todaySessions = studySessions.filter((s) => s.timestamp.startsWith(todayDateStr));
  const todayStudyMins = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const totalStudyMinsAll = studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalStudyHoursAll = (totalStudyMinsAll / 60).toFixed(1);
  const weeklyStudyGoal = 20; // 20 hours target
  const weeklyStudyPercent = Math.min(100, Math.round((totalStudyMinsAll / (weeklyStudyGoal * 60)) * 100));

  // Sleep stats
  const latestSleep = sleepRecords[0];
  const lastSleepDuration = latestSleep ? latestSleep.durationHours : preferences.targetSleepHours;

  // Has demo classes check
  const hasDemoClasses = classes.some((c) => c.id === 'cls_1' || c.id === 'cls_2');

  const handleToggleTask = (taskId: string) => {
    if (!onUpdateReminders) return;
    const updated = reminders.map((r) =>
      r.id === taskId ? { ...r, completed: !r.completed } : r
    );
    onUpdateReminders(updated);
  };

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim() || !onUpdateReminders) return;
    const newTask: ReminderItem = {
      id: 'rem_' + Date.now(),
      title: quickTaskTitle.trim(),
      time: '18:00',
      category: 'study',
      frequency: 'daily',
      enabled: true,
      completed: false,
    };
    onUpdateReminders([newTask, ...reminders]);
    setQuickTaskTitle('');
  };

  const handleDeleteTask = (taskId: string) => {
    if (!onUpdateReminders) return;
    onUpdateReminders(reminders.filter((r) => r.id !== taskId));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[760px]">
      {/* Left Main Pane (~68% width) */}
      <div className="lg:col-span-8 p-6 sm:p-8 space-y-7">
        {/* Demo banner if active */}
        {hasDemoClasses && onClearDemoData && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-blue-900 animate-fade-in">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Demo schedule active. Ready to set your own timetable?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClearDemoData}
                className="px-2.5 py-1 bg-white border border-blue-300 rounded-lg text-blue-700 font-semibold hover:bg-blue-100 transition-colors shadow-2xs text-[11px]"
              >
                Clear Demo Data
              </button>
              <button
                onClick={() => onNavigate('classes')}
                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-2xs text-[11px]"
              >
                Upload My Schedule
              </button>
            </div>
          </div>
        )}

        {/* Header row: "Overview" + right controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold tracking-tight text-slate-900">
              Overview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Today is <strong className="text-slate-700">{today}</strong> · Next class:{' '}
              {upcomingClass ? (
                <span className="font-medium text-blue-600">
                  {upcomingClass.name} at {upcomingClass.startTime} ({upcomingClass.location || 'Hall'})
                </span>
              ) : (
                <span className="text-slate-600">
                  {todaysClasses.length > 0 ? 'All lectures completed today' : 'No classes scheduled today'}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('routine')}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              Customize
            </button>

            <button
              onClick={() => onNavigate('classes')}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              This week
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={onSyncAlarms}
              className="p-1.5 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              title="Sync Alarms"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Top 3 KPI Grid with Corner Ticks matching image */}
        <div className="relative border border-slate-200/90 rounded-xl p-5 corner-tick-tl corner-tick-tr corner-tick-bl corner-tick-br grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
          {/* KPI 1: Tasks / Study focus */}
          <div className="sm:pr-6 pb-4 sm:pb-0">
            <span className="text-xs font-medium text-slate-500 block">
              Study Focus Completed
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-display font-semibold text-slate-900 tracking-tight tabular-nums">
                {todayStudyMins}m
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> {todayStudyMins > 0 ? 'Active' : '0%'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              {todaySessions.length} session{todaySessions.length === 1 ? '' : 's'} logged today
            </span>
          </div>

          {/* KPI 2: Sleep Average */}
          <div className="sm:px-6 py-4 sm:py-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 block">
                Nightly Sleep Hours
              </span>
              <button
                onClick={onOpenWeeklyReport}
                className="text-[11px] text-blue-600 font-semibold hover:underline"
              >
                Weekly Report →
              </button>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-display font-semibold text-slate-900 tracking-tight tabular-nums">
                {lastSleepDuration}h
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> {lastSleepDuration >= preferences.targetSleepHours ? 'Restored' : 'Deficit'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              {preferences.targetSleepHours}h target · Tonight Bedtime: {tomorrowCalc.bedTime24}
            </span>
          </div>

          {/* KPI 3: Reels & Dopamine Guard */}
          <div className="sm:pl-6 pt-4 sm:pt-0">
            <span className="text-xs font-medium text-slate-500 block">
              Reels Screen Quota
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-display font-semibold text-slate-900 tracking-tight tabular-nums">
                {reelsLog.count}
              </span>
              <span className="text-xs font-semibold text-blue-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> {Math.round((reelsLog.count / Math.max(1, reelsLog.dailyLimit)) * 100)}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              {reelsLog.dailyLimit - reelsLog.count >= 0
                ? `${reelsLog.dailyLimit - reelsLog.count} remaining today (~${reelsLog.estimatedMinutesLost}m spent)`
                : 'Daily cap exceeded'}
            </span>
          </div>
        </div>

        {/* Central Visual Feature: Dynamic Pastel Blue Bar Chart */}
        <div className="pt-2">
          <div className="relative h-64 flex items-end justify-between gap-3 sm:gap-6 px-4 pb-2 border-b border-slate-200">
            {weekDays.map((item, idx) => {
              const isSelected = selectedDayIndex === idx;

              return (
                <div
                  key={item.day}
                  onClick={() => setSelectedDayIndex(idx)}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                >
                  {/* Floating tooltip if selected */}
                  {isSelected && (
                    <div className="mb-3 bg-white border border-slate-200/90 shadow-lg rounded-xl px-3 py-2 text-left animate-fade-in z-10 whitespace-nowrap min-w-[130px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {item.totalHours} hrs {item.percent}%
                        </span>
                        <div className="flex -space-x-1">
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white" />
                          <span className="w-3.5 h-3.5 rounded-full bg-indigo-400 border border-white" />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {item.classCount} classes · {Math.round(item.studyMins)}m focus
                      </span>
                    </div>
                  )}

                  {/* Bar shape */}
                  <div className="w-full max-w-[84px] h-full flex flex-col justify-end">
                    <div
                      className={`w-full rounded-2xl transition-all duration-300 relative overflow-hidden ${
                        isSelected
                          ? 'bg-[#1d7bf6] shadow-md shadow-blue-500/20'
                          : 'bg-[#cfe5fe] hover:bg-[#b9daf9]'
                      }`}
                      style={{ height: `${item.percent}%` }}
                    >
                      <div
                        className={`w-full h-1/3 absolute bottom-0 ${
                          isSelected ? 'bg-blue-700/20' : 'bg-[#badcfd]'
                        }`}
                      />
                    </div>
                  </div>

                  <span className={`text-xs font-medium mt-3 transition-colors ${
                    isSelected ? 'text-blue-600 font-bold' : 'text-slate-500 group-hover:text-slate-900'
                  }`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Tabbed Table / Items Section */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setBottomTab('classes')}
                className={`text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  bottomTab === 'classes' ? 'text-slate-900 border-b-2 border-slate-900 -mb-2.5 pb-2' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <span>Classes for {selectedDayName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                  {selectedDayClasses.length}
                </span>
              </button>
              <button
                onClick={() => setBottomTab('tasks')}
                className={`text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  bottomTab === 'tasks' ? 'text-slate-900 border-b-2 border-slate-900 -mb-2.5 pb-2' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <span>Study Tasks &amp; Homework</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                  {reminders.length}
                </span>
              </button>
            </div>

            <button
              onClick={() => onNavigate(bottomTab === 'classes' ? 'classes' : 'alarms')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Manage all</span>
            </button>
          </div>

          <div className="space-y-2">
            {bottomTab === 'classes' ? (
              <>
                {selectedDayClasses.length > 0 ? (
                  selectedDayClasses.map((cls) => {
                    const startM = parseTimeToMinutes(cls.startTime);
                    const endM = parseTimeToMinutes(cls.endTime);
                    const durHours = ((endM - startM) / 60).toFixed(1);

                    return (
                      <div
                        key={cls.id}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: cls.color || '#2563eb' }}
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {cls.name} {cls.code && <span className="text-slate-400 font-mono text-[11px]">({cls.code})</span>}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {cls.day} · {cls.startTime} – {cls.endTime} {cls.location && `· ${cls.location}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                          <span className="font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                            {durHours} hrs
                          </span>
                          <button
                            onClick={() => onNavigate('classes')}
                            className="text-blue-600 font-medium hover:underline text-xs"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                    <p className="text-xs text-slate-500">No classes scheduled on {selectedDayName}.</p>
                    <button
                      onClick={() => onNavigate('classes')}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      Add Class for {selectedDayName}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Inline Quick Task Input */}
                <form onSubmit={handleAddQuickTask} className="flex items-center gap-2 pb-1">
                  <input
                    type="text"
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    placeholder="Add a homework task, reading, or assignment..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!quickTaskTitle.trim()}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs disabled:opacity-50 flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </form>

                {reminders.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl flex items-center justify-between text-xs transition-colors ${
                      task.completed ? 'bg-slate-50/60 opacity-60' : 'bg-slate-50 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          task.completed ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white hover:border-blue-500'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <span className={`font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400 text-[11px]">{task.time}</span>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {reminders.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No active study tasks. Type above to add your first task!
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Column (~32% width) with vertical divider matching mockup */}
      <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between space-y-7">
        <div className="space-y-6">
          {/* Top Banner Card: "Start your next study session" */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Start your next study session
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pomodoro focus with ambient study soundscapes
              </p>
            </div>

            <button
              onClick={onStartStudy}
              className="px-3.5 py-1.5 bg-[#18181b] hover:bg-black text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-slate-300" />
              1-click setup
            </button>
          </div>

          {/* Clean Action List with Hairlines */}
          <div className="divide-y divide-slate-100 border-y border-slate-100">
            {/* Item 1: Class Timetable */}
            <div className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Class Timetable
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {classes.length} lecture{classes.length === 1 ? '' : 's'} configured
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('classes')}
                className="px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Customized
              </button>
            </div>

            {/* Item 2: Automated Alarms */}
            <div className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Automated Alarms
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Tomorrow wake: {tomorrowCalc.wakeTime24}
                  </span>
                </div>
              </div>
              <button
                onClick={onSyncAlarms}
                className="px-3 py-1 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              >
                Sync Alarms
              </button>
            </div>

            {/* Item 3: AI Routine Coach */}
            <div className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    AI Routine Coach
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Circadian daily alignment
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('routine')}
                className="px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Open Routine
              </button>
            </div>

            {/* Item 4: Reels Doomscroll Tracker */}
            <div className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                  <Flame className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Reels Counter
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {reelsLog.count} / {reelsLog.dailyLimit} watched
                  </span>
                </div>
              </div>
              <button
                onClick={onAddReel}
                className="px-3 py-1 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                +1 Reel
              </button>
            </div>

            {/* Item 5: Sleep & Bedtime schedule */}
            <div className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                  <Clock className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">
                    Weekly Sleep Report
                  </span>
                  <span className="text-[11px] text-slate-500">
                    7-day circadian diagnostic
                  </span>
                </div>
              </div>
              <button
                onClick={onOpenWeeklyReport}
                className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-2xs"
              >
                View Report
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Status / Quota Bars matching screenshot */}
        <div className="pt-4 space-y-4 border-t border-slate-100">
          {/* Progress 1: Weekly Study Sessions */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span>Weekly Study Target</span>
              <span className="font-mono tabular-nums text-slate-800">
                {totalStudyHoursAll} / {weeklyStudyGoal} hrs
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1d7bf6] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, weeklyStudyPercent)}%` }}
              />
            </div>
          </div>

          {/* Progress 2: Reels Quota */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span>Reels Limit (Dopamine Cap)</span>
              <span className="font-mono tabular-nums text-slate-800">
                {reelsLog.count} / {reelsLog.dailyLimit}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  reelsLog.count >= reelsLog.dailyLimit ? 'bg-rose-500' : 'bg-[#1d7bf6]'
                }`}
                style={{ width: `${Math.min(100, (reelsLog.count / Math.max(1, reelsLog.dailyLimit)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Footer Card Notice matching screenshot */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-slate-400" />
              Circadian resets weekly
            </span>
            <button
              onClick={() => onNavigate('routine')}
              className="px-3 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Optimize
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
