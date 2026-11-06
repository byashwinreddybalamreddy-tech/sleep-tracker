import React, { useState, useEffect } from 'react';
import { StudySession, ClassScheduleItem } from '../types';
import { playChime, startAmbientSound, stopAmbientSound } from '../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  BookOpen,
  Volume2,
  VolumeX,
  Plus,
  Check,
} from 'lucide-react';

interface StudyFocusProps {
  classes: ClassScheduleItem[];
  sessions: StudySession[];
  onLogSession: (session: StudySession) => void;
}

type TimerMode = 'pomodoro' | 'deep_work' | 'short_break' | 'long_break';

const MODE_DURATIONS: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  deep_work: 50 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export const StudyFocus: React.FC<StudyFocusProps> = ({
  classes,
  sessions,
  onLogSession,
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('General Study');
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'whitenoise' | 'alpha'>('off');

  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Review lecture notes & highlight key theorems', done: false },
    { id: '2', text: 'Solve 3 practice homework questions', done: false },
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  const uniqueSubjects = Array.from(new Set(classes.map((c) => c.name)));
  if (!uniqueSubjects.includes('General Study')) {
    uniqueSubjects.unshift('General Study');
  }

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playChime();

      const durationMinutes = Math.round(MODE_DURATIONS[mode] / 60);
      onLogSession({
        id: 'sess_' + Date.now(),
        subject: selectedSubject,
        durationMinutes,
        type: mode,
        timestamp: new Date().toISOString(),
      });

      if (mode === 'pomodoro' || mode === 'deep_work') {
        setMode('short_break');
        setTimeLeft(MODE_DURATIONS.short_break);
      } else {
        setMode('pomodoro');
        setTimeLeft(MODE_DURATIONS.pomodoro);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, selectedSubject, onLogSession]);

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const handleAmbientChange = (type: 'off' | 'rain' | 'whitenoise' | 'alpha') => {
    setAmbientSound(type);
    if (type === 'off') {
      stopAmbientSound();
    } else {
      startAmbientSound(type);
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: 't_' + Date.now(), text: newTaskText.trim(), done: false }]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalModeSeconds = MODE_DURATIONS[mode];
  const progressPercent = Math.round(((totalModeSeconds - timeLeft) / totalModeSeconds) * 100);

  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((s) => s.timestamp.startsWith(todayDateStr));
  const totalFocusMinutesToday = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-600">
              Deep Work &amp; Focus
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono">
              {totalFocusMinutesToday} mins studied today
            </span>
          </div>
          <h2 className="text-2xl font-display font-semibold text-slate-900 mt-1">
            Student Study Sessions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pomodoro flow timers, subject tracking linked to your classes, and ambient focus soundscapes.
          </p>
        </div>

        {/* Ambient Sound Controls */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 flex items-center gap-1 pl-2">
            {ambientSound === 'off' ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            )}
            <span className="hidden sm:inline">Audio:</span>
          </span>
          <button
            onClick={() => handleAmbientChange('off')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
              ambientSound === 'off' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mute
          </button>
          <button
            onClick={() => handleAmbientChange('rain')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
              ambientSound === 'rain' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rain
          </button>
          <button
            onClick={() => handleAmbientChange('alpha')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
              ambientSound === 'alpha' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Alpha Waves
          </button>
          <button
            onClick={() => handleAmbientChange('whitenoise')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
              ambientSound === 'whitenoise' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            White Noise
          </button>
        </div>
      </div>

      {/* Main Study Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Timer Box (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-2xs">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
              <button
                onClick={() => switchMode('pomodoro')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  mode === 'pomodoro'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pomodoro (25m)
              </button>
              <button
                onClick={() => switchMode('deep_work')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  mode === 'deep_work'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Deep Work (50m)
              </button>
              <button
                onClick={() => switchMode('short_break')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  mode === 'short_break'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Short Break (5m)
              </button>
              <button
                onClick={() => switchMode('long_break')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  mode === 'long_break'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Long Break (15m)
              </button>
            </div>

            <div className="shrink-0">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 max-w-[170px] truncate"
              >
                {uniqueSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Huge Digital Countdown */}
          <div className="py-12 text-center space-y-4">
            <span className="text-xs uppercase tracking-widest text-blue-600 font-semibold block">
              Studying: {selectedSubject}
            </span>

            <div className="text-7xl sm:text-9xl font-mono font-bold tracking-tight text-slate-900 tabular-nums select-none">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Session Completion</span>
                <span className="font-mono tabular-nums text-slate-700 font-semibold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    mode.includes('break') ? 'bg-emerald-500' : 'bg-[#1d7bf6]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={resetTimer}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3.5 rounded-xl font-semibold text-base transition-all flex items-center gap-2 shadow-xs ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-[#18181b] hover:bg-black text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause Session
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Start Focus
                </>
              )}
            </button>

            <button
              onClick={() => {
                setTimeLeft(0);
              }}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Skip / Finish"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Focus Checklist & Today's History */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Session Action Checklist
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {tasks.filter((t) => t.done).length}/{tasks.length} done
              </span>
            </div>

            <form onSubmit={addTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add focus objective..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-2 rounded-lg text-xs cursor-pointer flex items-start gap-2 border transition-colors ${
                    task.done
                      ? 'bg-slate-50 text-slate-400 border-slate-100 line-through'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                      task.done
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {task.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{task.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Today&apos;s Focus Log
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-600">
                {todaySessions.length} sessions
              </span>
            </div>

            {todaySessions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No study blocks completed yet today. Start your first Pomodoro above!
              </p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {todaySessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">{s.subject}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{s.type}</span>
                    </div>
                    <span className="font-mono font-bold text-blue-600 tabular-nums">
                      +{s.durationMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
