import React, { useState, useEffect } from 'react';
import { ReelsLog } from '../types';
import { playDoomscrollAlert, playChime } from '../utils/audio';
import {
  Flame,
  Minus,
  Plus,
  RotateCcw,
  Clock,
  Sparkles,
  BookOpen,
  Volume2,
  HeartPulse,
} from 'lucide-react';

interface ReelsCounterProps {
  reelsLog: ReelsLog;
  onUpdateReels: (updated: ReelsLog) => void;
  onLaunchStudySession: () => void;
}

export const ReelsCounter: React.FC<ReelsCounterProps> = ({
  reelsLog,
  onUpdateReels,
  onLaunchStudySession,
}) => {
  const [activeSessionActive, setActiveSessionActive] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showDetoxBreathing, setShowDetoxBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);

  // Active Doomscroll Session Timer
  useEffect(() => {
    let interval: any = null;
    if (activeSessionActive) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeSessionActive]);

  // Breathing Box Effect
  useEffect(() => {
    let timer: any = null;
    if (showDetoxBreathing) {
      timer = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            setBreathPhase((current) => {
              if (current === 'Inhale') return 'Hold';
              if (current === 'Hold') return 'Exhale';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showDetoxBreathing]);

  const addReels = (amount: number) => {
    const newCount = Math.max(0, reelsLog.count + amount);
    const estimatedMinutes = Math.round((newCount * 40) / 60);

    const updated: ReelsLog = {
      ...reelsLog,
      count: newCount,
      estimatedMinutesLost: estimatedMinutes,
      history: [
        ...reelsLog.history,
        { timestamp: Date.now(), added: amount },
      ],
    };

    onUpdateReels(updated);

    if (newCount >= reelsLog.dailyLimit && reelsLog.count < reelsLog.dailyLimit) {
      playDoomscrollAlert();
    }
  };

  const resetCount = () => {
    if (window.confirm("Reset today's reel count back to 0?")) {
      onUpdateReels({
        ...reelsLog,
        count: 0,
        estimatedMinutesLost: 0,
        history: [],
      });
      setSessionSeconds(0);
      setActiveSessionActive(false);
    }
  };

  const percentage = Math.min(100, Math.round((reelsLog.count / reelsLog.dailyLimit) * 100));
  const isOverLimit = reelsLog.count >= reelsLog.dailyLimit;
  const pomodorosLost = (reelsLog.estimatedMinutesLost / 25).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-600">
              Reels &amp; Doomscroll Counter
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">Dopamine Guard</span>
          </div>
          <h2 className="text-2xl font-display font-semibold text-slate-900 mt-1">
            Student Screen-Time &amp; Reels Interceptor
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Keep track of shorts and reels in real-time. Protect your sleep and deep work energy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetoxBreathing(!showDetoxBreathing)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
            {showDetoxBreathing ? 'Close Reset' : '60s Detox Reset'}
          </button>
          <button
            onClick={resetCount}
            className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-lg transition-colors shadow-2xs"
            title="Reset Counter"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 60-Second Mindful Detox Box */}
      {showDetoxBreathing && (
        <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-6 text-center space-y-4 animate-fade-in shadow-sm">
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-teal-900">
              Dopamine Detox &amp; Focus Centering
            </h3>
            <p className="text-xs text-teal-700 mt-1">
              Social media algorithms trigger rapid dopamine loops. Take 4 cycles of deep breaths to reset focus.
            </p>

            <div className="my-6 relative flex items-center justify-center">
              <div
                className={`w-36 h-36 rounded-full border-4 border-teal-400/60 flex flex-col items-center justify-center transition-all duration-1000 ${
                  breathPhase === 'Inhale'
                    ? 'scale-110 bg-teal-100 shadow-md shadow-teal-500/10'
                    : breathPhase === 'Hold'
                    ? 'scale-105 bg-teal-200/70'
                    : 'scale-90 bg-teal-100/50'
                }`}
              >
                <span className="text-xs uppercase tracking-widest text-teal-800 font-semibold">
                  {breathPhase}
                </span>
                <span className="text-3xl font-mono font-bold text-teal-950 mt-1">
                  {breathTimer}s
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowDetoxBreathing(false);
                onLaunchStudySession();
              }}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Mind Reset: Switch to Study Mode
            </button>
          </div>
        </div>
      )}

      {/* Main Counter & Live Impact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Big Counter Column (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={`w-5 h-5 ${isOverLimit ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
              <span className="text-xs font-semibold text-slate-800">Today&apos;s Reel Count</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <span>Target Cap:</span>
              <input
                type="number"
                min="5"
                max="200"
                value={reelsLog.dailyLimit}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 30;
                  onUpdateReels({ ...reelsLog, dailyLimit: val });
                }}
                className="w-14 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-center text-slate-900 text-xs font-mono"
              />
              <span>reels</span>
            </div>
          </div>

          {/* Central Counter Display */}
          <div className="py-8 text-center space-y-2">
            <div className="inline-block relative">
              <span
                className={`text-7xl sm:text-8xl font-display font-bold tracking-tight tabular-nums ${
                  isOverLimit ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {reelsLog.count}
              </span>
              <span className="block text-xs uppercase tracking-wider text-slate-400 font-medium">
                Shorts / Reels Watched Today
              </span>
            </div>

            {/* Quota Progress Bar */}
            <div className="max-w-md mx-auto pt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Budget Progress</span>
                <span className={`font-mono font-semibold ${isOverLimit ? 'text-rose-600' : 'text-slate-800'}`}>
                  {percentage}% ({reelsLog.count} / {reelsLog.dailyLimit})
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOverLimit ? 'bg-rose-500' : percentage > 75 ? 'bg-amber-500' : 'bg-[#1d7bf6]'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {isOverLimit && (
                <p className="text-xs text-rose-600 font-medium flex items-center justify-center gap-1.5 pt-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  Daily Reel Limit Exceeded! Time to switch to deep work or wind down.
                </p>
              )}
            </div>
          </div>

          {/* Quick Increment Controls */}
          <div className="grid grid-cols-5 gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={() => addReels(-1)}
              disabled={reelsLog.count === 0}
              className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 disabled:opacity-30 text-slate-500 transition-colors flex items-center justify-center"
              title="Minus 1"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => addReels(1)}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> 1
            </button>
            <button
              onClick={() => addReels(5)}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> 5
            </button>
            <button
              onClick={() => addReels(10)}
              className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm transition-colors flex items-center justify-center gap-1 border border-blue-200/60"
            >
              <Plus className="w-3.5 h-3.5" /> 10
            </button>
            <button
              onClick={() => addReels(25)}
              className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-sm transition-colors flex items-center justify-center gap-1 border border-rose-200/60"
            >
              <Plus className="w-3.5 h-3.5" /> 25
            </button>
          </div>
        </div>

        {/* Opportunity Cost & Live Stopwatch Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                Opportunity Cost Lost
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-500 block">Total Scrolling Time</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                    {reelsLog.estimatedMinutesLost}
                  </span>
                  <span className="text-xs text-slate-500">minutes lost</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  At ~40 seconds per reel
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[11px] text-slate-500 block">Study Sessions Forfeited</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-mono font-bold text-blue-600 tabular-nums">
                    {pomodorosLost}
                  </span>
                  <span className="text-xs text-slate-500">Pomodoros (25m)</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Equivalent to ~{Math.round(reelsLog.count * 0.8)} exam practice items
                </span>
              </div>
            </div>

            <button
              onClick={onLaunchStudySession}
              className="w-full py-2.5 px-3 bg-[#18181b] hover:bg-black text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              Reclaim Time: Start Study Focus
            </button>
          </div>

          {/* Live Doomscroll Session Tracker */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">Live Scroll Session</span>
              {activeSessionActive && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>

            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xs text-slate-500">Duration:</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {Math.floor(sessionSeconds / 60)}m {(sessionSeconds % 60).toString().padStart(2, '0')}s
              </span>
            </div>

            <button
              onClick={() => {
                if (activeSessionActive) {
                  setActiveSessionActive(false);
                  playChime();
                } else {
                  setActiveSessionActive(true);
                  setSessionSeconds(0);
                }
              }}
              className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeSessionActive
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {activeSessionActive ? 'Stop Active Scroll Session' : 'Start Scroll Stopwatch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
