import React, { useState } from 'react';
import {
  ClassScheduleItem,
  SleepRecord,
  ReelsLog,
  StudySession,
  AlarmItem,
  ReminderItem,
  StudentPreferences,
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
  Users,
  Clock,
  FlaskConical,
  Flame,
  Moon,
  BookOpen,
  Bell,
  ChevronDown,
  Check,
  Plus,
  Play,
  RotateCcw,
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
  onTriggerTestAlarm,
  onOpenWeeklyReport,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(2); // Wednesday (matches mockup)
  const [bottomTab, setBottomTab] = useState<'classes' | 'tasks'>('classes');

  const today = getCurrentDayOfWeek();
  const tomorrow = getCurrentDayOfWeek(1);
  const tomorrowCalc = calculateAutomatedAlarmForDay(classes, tomorrow, preferences);

  // Day bars data matching the screenshot style
  const weekDays = [
    { day: 'Monday', label: 'Mon', focusHours: 3.8, tasks: 24, percent: 38 },
    { day: 'Tuesday', label: 'Tue', focusHours: 4.2, tasks: 28, percent: 45 },
    { day: 'Wednesday', label: 'Wed', focusHours: 5.5, tasks: 32, percent: 85, isHighlight: true },
    { day: 'Thursday', label: 'Thu', focusHours: 3.5, tasks: 20, percent: 52 },
    { day: 'Friday', label: 'Fri', focusHours: 2.8, tasks: 16, percent: 32 },
  ];

  const activeDayData = weekDays[selectedDayIndex] || weekDays[2];

  // Compute upcoming class
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

  // Sleep stats
  const latestSleep = sleepRecords[0];
  const lastSleepDuration = latestSleep ? latestSleep.durationHours : preferences.targetSleepHours;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[760px]">
      {/* Left Main Pane (~68% width) */}
      <div className="lg:col-span-8 p-6 sm:p-8 space-y-7">
        {/* Header row: "Overview" + right controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold tracking-tight text-slate-900">
              Overview
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Today is <strong className="text-slate-700">{today}</strong> · Next class: {upcomingClass ? (
                <span className="font-medium text-blue-600">{upcomingClass.name} at {upcomingClass.startTime}</span>
              ) : (
                <span className="text-slate-600">No more classes scheduled today</span>
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
                {todayStudyMins > 0 ? `${todayStudyMins}m` : '60m'}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> 15%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              {todaySessions.length > 0 ? `${todaySessions.length} sessions logged today` : '52m in the last week'}
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
                <ArrowUpRight className="w-3 h-3" /> 2%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              {preferences.targetSleepHours}h target · Bedtime: {tomorrowCalc.bedTime24}
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
                <ArrowUpRight className="w-3 h-3" /> {Math.round((reelsLog.count / reelsLog.dailyLimit) * 100)}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              {reelsLog.dailyLimit - reelsLog.count >= 0 ? `${reelsLog.dailyLimit - reelsLog.count} remaining today` : 'Cap exceeded'}
            </span>
          </div>
        </div>

        {/* Central Visual Feature: Clean Pastel Blue Bar Chart from Screenshot */}
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
                          {item.tasks} {item.percent}%
                        </span>
                        {/* Avatar stack dots matching mockup */}
                        <div className="flex -space-x-1">
                          <span className="w-3.5 h-3.5 rounded-full bg-rose-400 border border-white" />
                          <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-white" />
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white" />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Study hours completed
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
                      {/* Secondary base tone for depth matching mockup */}
                      <div
                        className={`w-full h-1/3 absolute bottom-0 ${
                          isSelected ? 'bg-blue-700/20' : 'bg-[#badcfd]'
                        }`}
                      />
                    </div>
                  </div>

                  <span className="text-xs font-medium text-slate-500 mt-3 group-hover:text-slate-900 transition-colors">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Tabbed Table / Items Section matching mockup */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-6 border-b border-slate-200/80 pb-2">
            <button
              onClick={() => setBottomTab('classes')}
              className={`text-xs font-semibold transition-colors ${
                bottomTab === 'classes' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Enrolled Classes
            </button>
            <button
              onClick={() => setBottomTab('tasks')}
              className={`text-xs font-semibold transition-colors ${
                bottomTab === 'tasks' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Study Focus Tasks
            </button>
          </div>

          <div className="space-y-2">
            {bottomTab === 'classes' ? (
              <>
                {classes.slice(0, 3).map((cls, i) => (
                  <div
                    key={cls.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cls.color }}
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">{cls.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {cls.day} · {cls.startTime} – {cls.endTime} {cls.location && `· ${cls.location}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                      <span className="font-semibold text-slate-700">
                        {i === 0 ? '365 81.1%' : '25 81.1%'}
                      </span>
                      <button
                        onClick={() => onNavigate('classes')}
                        className="text-blue-600 font-medium hover:underline text-xs"
                      >
                        Timetable
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded border border-slate-300 bg-white" />
                    <span className="font-medium text-slate-800">
                      Solve Discrete Math problem set #4
                    </span>
                  </div>
                  <span className="font-mono text-slate-500">MATH 150</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded border border-slate-300 bg-white" />
                    <span className="font-medium text-slate-800">
                      Physics Lab II pre-reading &amp; diagram check
                    </span>
                  </div>
                  <span className="font-mono text-slate-500">PHYS 210</span>
                </div>
              </>
            )}

            <div className="text-center pt-2">
              <button
                onClick={() => onNavigate(bottomTab === 'classes' ? 'classes' : 'study')}
                className="text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors"
              >
                View all
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (~32% width) with vertical divider matching mockup */}
      <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between space-y-7">
        <div className="space-y-6">
          {/* Top Banner Card: "Start your next project" / "Start your next study session" */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Start your next study session
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pomodoro focus with ambient study soundscapes
              </p>
            </div>

            {/* Dark Charcoal Pill Button matching screenshot */}
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
            {/* Item 1: Home views / Class Timetable */}
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
                    {classes.length} lectures configured
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

            {/* Item 2: Tasks completed / Sync Smart Alarms */}
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
                Import
              </button>
            </div>

            {/* Item 3: AI Assistant / AI Routine Coach */}
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
                className="px-3 py-1 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-lg hover:text-slate-800 transition-colors"
              >
                Installed
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
              <span className="font-mono tabular-nums text-slate-800">50/100 hrs</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#1d7bf6] rounded-full" style={{ width: '50%' }} />
            </div>
          </div>

          {/* Progress 2: Reels Quota */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span>Reels Limit (Dopamine Cap)</span>
              <span className="font-mono tabular-nums text-slate-800">
                {reelsLog.count}/{reelsLog.dailyLimit}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  reelsLog.count >= reelsLog.dailyLimit ? 'bg-rose-500' : 'bg-[#1d7bf6]'
                }`}
                style={{ width: `${Math.min(100, (reelsLog.count / reelsLog.dailyLimit) * 100)}%` }}
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
