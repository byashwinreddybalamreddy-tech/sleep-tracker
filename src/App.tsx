import React, { useState, useEffect } from 'react';
import {
  ClassScheduleItem,
  SleepRecord,
  ReelsLog,
  StudySession,
  AlarmItem,
  ReminderItem,
  StudentPreferences,
} from './types';
import {
  INITIAL_CLASSES,
  INITIAL_SLEEP_RECORDS,
  INITIAL_ALARMS,
  INITIAL_REMINDERS,
  DEFAULT_PREFERENCES,
} from './utils/sampleData';
import {
  generateSmartAlarms,
  getCurrentDayOfWeek,
} from './utils/alarmCalculator';
import { startAlarmAudio, stopAlarmAudio, playChime } from './utils/audio';

import { DashboardOverview } from './components/DashboardOverview';
import { ClassTimings } from './components/ClassTimings';
import { SleepTracker } from './components/SleepTracker';
import { ReelsCounter } from './components/ReelsCounter';
import { StudyFocus } from './components/StudyFocus';
import { AlarmsReminders } from './components/AlarmsReminders';
import { RoutineOptimizer } from './components/RoutineOptimizer';
import { ActiveAlarmModal } from './components/ActiveAlarmModal';
import { WeeklySleepReportModal } from './components/WeeklySleepReportModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { exportStudentData, parseImportData } from './utils/backup';

import {
  LayoutGrid,
  Calendar,
  CheckSquare,
  Moon,
  Flame,
  Bell,
  Sparkles,
  Plus,
  Search,
  Check,
  SlidersHorizontal,
} from 'lucide-react';

type TabId = 'overview' | 'classes' | 'sleep' | 'reels' | 'study' | 'alarms' | 'routine';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const [classes, setClasses] = useState<ClassScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('syncstudy_classes');
      return saved ? JSON.parse(saved) : INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  });

  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>(() => {
    try {
      const saved = localStorage.getItem('syncstudy_sleep');
      return saved ? JSON.parse(saved) : INITIAL_SLEEP_RECORDS;
    } catch {
      return INITIAL_SLEEP_RECORDS;
    }
  });

  const [reelsLog, setReelsLog] = useState<ReelsLog>(() => {
    try {
      const saved = localStorage.getItem('syncstudy_reels');
      const todayDate = new Date().toISOString().slice(0, 10);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === todayDate) return parsed;
      }
      return {
        date: todayDate,
        count: 14,
        estimatedMinutesLost: 9,
        dailyLimit: DEFAULT_PREFERENCES.reelsDailyCap,
        history: [],
      };
    } catch {
      return {
        date: new Date().toISOString().slice(0, 10),
        count: 14,
        estimatedMinutesLost: 9,
        dailyLimit: DEFAULT_PREFERENCES.reelsDailyCap,
        history: [],
      };
    }
  });

  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem('syncstudy_study');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'sess_init_1',
              subject: 'Data Structures & Algorithms',
              durationMinutes: 25,
              type: 'pomodoro',
              timestamp: new Date().toISOString(),
            },
          ];
    } catch {
      return [];
    }
  });

  const [preferences, setPreferences] = useState<StudentPreferences>(() => {
    try {
      const saved = localStorage.getItem('syncstudy_prefs');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    try {
      const saved = localStorage.getItem('syncstudy_alarms');
      return saved ? JSON.parse(saved) : INITIAL_ALARMS;
    } catch {
      return INITIAL_ALARMS;
    }
  });

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      const saved = localStorage.getItem('syncstudy_reminders');
      return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
    } catch {
      return INITIAL_REMINDERS;
    }
  });

  const [activeRingingAlarm, setActiveRingingAlarm] = useState<AlarmItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWeeklySleepReport, setShowWeeklySleepReport] = useState(false);

  // LocalStorage syncing
  useEffect(() => {
    try {
      localStorage.setItem('syncstudy_classes', JSON.stringify(classes));
    } catch {}
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem('syncstudy_sleep', JSON.stringify(sleepRecords));
    } catch {}
  }, [sleepRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('syncstudy_reels', JSON.stringify(reelsLog));
    } catch {}
  }, [reelsLog]);

  useEffect(() => {
    try {
      localStorage.setItem('syncstudy_study', JSON.stringify(studySessions));
    } catch {}
  }, [studySessions]);

  useEffect(() => {
    try {
      localStorage.setItem('syncstudy_prefs', JSON.stringify(preferences));
    } catch {}
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem('syncstudy_alarms', JSON.stringify(alarms));
    } catch {}
  }, [alarms]);

  useEffect(() => {
    try {
      localStorage.setItem('syncstudy_reminders', JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSyncAlarms = () => {
    const smartAlarms = generateSmartAlarms(classes, preferences);
    const customAlarms = alarms.filter((a) => !a.isAutoCalculated);
    setAlarms([...smartAlarms, ...customAlarms]);
    playChime();
    showToast('Alarms synchronized with class timings!');
  };

  // Daily rollover effect for continuous everyday use
  useEffect(() => {
    const checkDailyRollover = () => {
      const todayStr = new Date().toISOString().slice(0, 10);
      setReelsLog((prev) => {
        if (prev.date !== todayStr) {
          return {
            date: todayStr,
            count: 0,
            estimatedMinutesLost: 0,
            dailyLimit: preferences.reelsDailyCap,
            history: prev.history || [],
          };
        }
        return prev;
      });
    };

    checkDailyRollover();
    const interval = setInterval(checkDailyRollover, 60000);
    return () => clearInterval(interval);
  }, [preferences.reelsDailyCap]);

  // Export / Import data handlers for permanent data persistence
  const handleExportBackup = () => {
    exportStudentData({
      classes,
      sleepRecords,
      reelsLog,
      studySessions,
      alarms,
      reminders,
      preferences,
    });
    playChime();
    showToast('Student data backup exported successfully!');
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawText = e.target?.result as string;
      const parsed = parseImportData(rawText);
      if (!parsed) {
        showToast('Error: Invalid backup file format.');
        return;
      }

      if (Array.isArray(parsed.classes)) setClasses(parsed.classes);
      if (Array.isArray(parsed.sleepRecords)) setSleepRecords(parsed.sleepRecords);
      if (parsed.reelsLog && typeof parsed.reelsLog.count === 'number') setReelsLog(parsed.reelsLog);
      if (Array.isArray(parsed.studySessions)) setStudySessions(parsed.studySessions);
      if (Array.isArray(parsed.alarms)) setAlarms(parsed.alarms);
      if (Array.isArray(parsed.reminders)) setReminders(parsed.reminders);
      if (parsed.preferences) setPreferences(parsed.preferences);

      playChime();
      showToast('All student routines, alarms, and logs restored!');
    };
    reader.readAsText(file);
  };

  // Alarm background watcher with system notifications
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const current24 = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = getCurrentDayOfWeek();

      alarms.forEach((alarm) => {
        if (
          alarm.enabled &&
          alarm.time === current24 &&
          alarm.days.includes(currentDay) &&
          now.getSeconds() < 10 &&
          !activeRingingAlarm
        ) {
          setActiveRingingAlarm(alarm);
          startAlarmAudio(alarm.ringtone);

          // Native web notification if permitted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`Alarm: ${alarm.label}`, {
                body: `It's ${alarm.time}. Time for your academic routine!`,
                icon: '/pwa-192x192.png',
              });
            } catch {}
          }
        }
      });
    };

    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [alarms, activeRingingAlarm]);


  const handleTriggerTestAlarm = (alarmToTest: AlarmItem) => {
    setActiveRingingAlarm(alarmToTest);
    startAlarmAudio(alarmToTest.ringtone);
  };

  const handleDismissRingingAlarm = () => {
    stopAlarmAudio();
    setActiveRingingAlarm(null);
    showToast('Alarm dismissed. Have a great day!');
  };

  const handleSnoozeRingingAlarm = (minutes: number) => {
    stopAlarmAudio();
    setActiveRingingAlarm(null);
    showToast(`Alarm snoozed for ${minutes} minutes.`);
  };

  const handleAddQuickReel = () => {
    const newCount = reelsLog.count + 1;
    const mins = Math.round((newCount * 40) / 60);
    setReelsLog({
      ...reelsLog,
      count: newCount,
      estimatedMinutesLost: mins,
      history: [...reelsLog.history, { timestamp: Date.now(), added: 1 }],
    });
    playChime();
    showToast(`Logged +1 Reel (${newCount} today)`);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-2 sm:p-5 lg:p-7 flex items-center justify-center font-sans antialiased">
      {/* Floating Application Shell matching the screenshot */}
      <div className="w-full max-w-[1420px] bg-white rounded-[28px] border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
        {/* Top Header Bar matching screenshot */}
        <header className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Professional Brand Mark */}
            <div
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0 select-none"
              title="SyncStudy · Overview"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 shadow-xs flex items-center justify-center text-white transition-all group-hover:bg-slate-900 group-hover:shadow-sm">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" className="stroke-slate-700" strokeWidth="1.5" />
                  <path d="M12 3a9 9 0 0 1 9 9" className="stroke-blue-500" strokeWidth="2.5" />
                  <circle cx="12" cy="12" r="2.5" className="fill-blue-500 stroke-none" />
                </svg>
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="font-display font-bold text-slate-900 text-sm tracking-tight leading-none">
                  SyncStudy
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
                  Academic OS
                </span>
              </div>
            </div>

            {/* Horizontal Nav Tabs with Icons moved to Top */}
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-500 overflow-x-auto scrollbar-none py-1 max-w-[55vw]">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('classes')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'classes'
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Classes</span>
              </button>
              <button
                onClick={() => setActiveTab('study')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'study'
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Study</span>
              </button>
              <button
                onClick={() => setActiveTab('sleep')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'sleep'
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Sleep</span>
              </button>
              <button
                onClick={() => setActiveTab('reels')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'reels'
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Reels</span>
              </button>
              <button
                onClick={() => setActiveTab('alarms')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'alarms'
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Alarms</span>
              </button>
              <button
                onClick={() => setActiveTab('routine')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'routine'
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Routine</span>
              </button>
            </nav>
          </div>

          {/* Right Header Controls matching screenshot */}
          <div className="flex items-center gap-3">
            {/* Search Input with ⌘K Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-500 w-52 md:w-60 focus-within:border-slate-400 focus-within:bg-white transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or ask AI..."
                className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400 text-xs"
              />
              <span className="font-mono text-[10px] text-slate-400 bg-white border border-slate-200 rounded px-1 py-0.2 shrink-0">
                ⌘ K
              </span>
            </div>

            {/* Everyday PWA Install & Data Backup */}
            <PWAInstallButton
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
            />

            {/* Import / Sync Alarms button */}
            <button
              onClick={handleSyncAlarms}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shadow-xs"
            >
              Sync Alarms
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab('alarms')}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors relative"
              title="Reminders & Alarms"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-600" />
            </button>

            {/* Quick Add / Focus Session Button */}
            <button
              onClick={() => setActiveTab('study')}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs shrink-0"
              title="Start New Focus Session"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Student Avatar */}
            <div
              onClick={() => setActiveTab('overview')}
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 border border-white shadow-xs cursor-pointer flex items-center justify-center text-[11px] font-semibold text-slate-900"
              title="Student Profile"
            >
              YR
            </div>
          </div>
        </header>

        {/* Main Content Area (Full Width with Top Navigation) */}
        <div className="flex-1 min-h-[720px] flex flex-col">
          <main className="flex-1 overflow-x-hidden bg-white">
            {activeTab === 'overview' && (
              <DashboardOverview
                classes={classes}
                sleepRecords={sleepRecords}
                reelsLog={reelsLog}
                studySessions={studySessions}
                alarms={alarms}
                reminders={reminders}
                preferences={preferences}
                onNavigate={(tab) => setActiveTab(tab)}
                onAddReel={handleAddQuickReel}
                onStartStudy={() => setActiveTab('study')}
                onSyncAlarms={handleSyncAlarms}
                onTriggerTestAlarm={handleTriggerTestAlarm}
                onOpenWeeklyReport={() => setShowWeeklySleepReport(true)}
              />
            )}

            {activeTab === 'classes' && (
              <div className="p-6 sm:p-8">
                <ClassTimings
                  classes={classes}
                  onUpdateClasses={(updated) => setClasses(updated)}
                  preferences={preferences}
                  onSyncAlarms={handleSyncAlarms}
                />
              </div>
            )}

            {activeTab === 'sleep' && (
              <div className="p-6 sm:p-8">
                <SleepTracker
                  sleepRecords={sleepRecords}
                  onUpdateSleep={(updated) => setSleepRecords(updated)}
                  preferences={preferences}
                  classes={classes}
                  onOpenWeeklyReport={() => setShowWeeklySleepReport(true)}
                />
              </div>
            )}

            {activeTab === 'reels' && (
              <div className="p-6 sm:p-8">
                <ReelsCounter
                  reelsLog={reelsLog}
                  onUpdateReels={(updated) => setReelsLog(updated)}
                  onLaunchStudySession={() => setActiveTab('study')}
                />
              </div>
            )}

            {activeTab === 'study' && (
              <div className="p-6 sm:p-8">
                <StudyFocus
                  classes={classes}
                  sessions={studySessions}
                  onLogSession={(session) => {
                    setStudySessions([session, ...studySessions]);
                    showToast(`Logged ${session.durationMinutes}m focus session!`);
                  }}
                />
              </div>
            )}

            {activeTab === 'alarms' && (
              <div className="p-6 sm:p-8">
                <AlarmsReminders
                  alarms={alarms}
                  reminders={reminders}
                  preferences={preferences}
                  classes={classes}
                  onUpdateAlarms={(updated) => setAlarms(updated)}
                  onUpdateReminders={(updated) => setReminders(updated)}
                  onUpdatePreferences={(updated) => setPreferences(updated)}
                  onTriggerTestAlarm={handleTriggerTestAlarm}
                />
              </div>
            )}

            {activeTab === 'routine' && (
              <div className="p-6 sm:p-8">
                <RoutineOptimizer
                  classes={classes}
                  sleepRecords={sleepRecords}
                  reelsLog={reelsLog}
                  studySessions={studySessions}
                  preferences={preferences}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 shadow-xl rounded-xl px-4 py-3 text-xs text-white flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Active Ringing Alarm Modal */}
      {activeRingingAlarm && (
        <ActiveAlarmModal
          alarm={activeRingingAlarm}
          onDismiss={handleDismissRingingAlarm}
          onSnooze={handleSnoozeRingingAlarm}
        />
      )}

      {/* Weekly Sleep Report Modal */}
      {showWeeklySleepReport && (
        <WeeklySleepReportModal
          sleepRecords={sleepRecords}
          preferences={preferences}
          classes={classes}
          reelsLog={reelsLog}
          onClose={() => setShowWeeklySleepReport(false)}
        />
      )}
    </div>
  );
}
