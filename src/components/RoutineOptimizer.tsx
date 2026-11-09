import React, { useState, useEffect } from 'react';
import { ClassScheduleItem, SleepRecord, ReelsLog, StudySession, StudentPreferences, RoutineItem } from '../types';
import {
  Sparkles,
  Check,
  Clock,
  Flame,
  Moon,
  Zap,
} from 'lucide-react';

interface RoutineOptimizerProps {
  classes: ClassScheduleItem[];
  sleepRecords: SleepRecord[];
  reelsLog: ReelsLog;
  studySessions: StudySession[];
  preferences: StudentPreferences;
}

export const RoutineOptimizer: React.FC<RoutineOptimizerProps> = ({
  classes,
  sleepRecords,
  reelsLog,
  studySessions,
  preferences,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([
    { time: '07:00 AM', activity: 'Wake Up & Natural Morning Sunlight', category: 'wake', completed: true },
    { time: '07:30 AM', activity: 'Morning Prep, Light Stretch & High-Protein Breakfast', category: 'meal', completed: true },
    { time: '08:30 AM - 10:00 AM', activity: 'Class: Data Structures & Algorithms (Turing 302)', category: 'class', completed: false },
    { time: '10:15 AM - 10:45 AM', activity: 'Active Recall Review of Lecture Notes (No Screen Scrolling)', category: 'study', completed: false },
    { time: '11:00 AM - 12:30 PM', activity: 'Class: Discrete Mathematics (Euler 104)', category: 'class', completed: false },
    { time: '12:30 PM - 01:30 PM', activity: 'Nutritious Lunch & Brain Reset Walk', category: 'meal', completed: false },
    { time: '02:00 PM - 03:30 PM', activity: 'Peak Circadian Focus Study: CS Lab & Coding (Pomodoro 50/10)', category: 'study', completed: false },
    { time: '04:00 PM - 04:30 PM', activity: 'Guilt-Free Reels / Social Downtime (Hard Cap 20 Reels)', category: 'winddown', completed: false },
    { time: '05:00 PM - 06:30 PM', activity: 'Secondary Study Block: Physics Problem Sets', category: 'study', completed: false },
    { time: '07:00 PM - 08:00 PM', activity: 'Dinner & Socializing with Friends', category: 'meal', completed: false },
    { time: '08:30 PM - 09:30 PM', activity: 'Light Reading / Prepare Backpack & Tomorrow Schedule', category: 'study', completed: false },
    { time: '10:15 PM', activity: 'Digital Sunset: Zero Reels / Blue Light Filters Active', category: 'winddown', completed: false },
    { time: '11:00 PM', activity: 'Bedtime - Full 8 Hour Restorative Sleep', category: 'sleep', completed: false },
  ]);

  const [aiAnalysis, setAiAnalysis] = useState<{
    circadianInsight: string;
    reelsImpact: string;
    bedtime: string;
    wake: string;
    tips: string[];
  }>({
    circadianInsight: 'Your morning classes start at 08:30 AM on Mon/Wed. Waking up at 07:00 AM provides a steady 90-minute circadian cortisol rise before lecture, preventing brain fog.',
    reelsImpact: `${reelsLog.count} reels watched today (${reelsLog.estimatedMinutesLost} mins). Keeping reels strictly to the afternoon recovery window prevents delayed sleep onset.`,
    bedtime: '11:00 PM',
    wake: '07:00 AM',
    tips: [
      'Do not check reels immediately upon waking; natural light exposure boosts dopamine far more sustainably.',
      'Schedule hard problem-solving between 2:00 PM and 4:00 PM after morning lectures have settled.',
      'Stop social media feeds 45 minutes prior to sleep to preserve deep slow-wave REM sleep.',
    ],
  });

  // Auto-generate customized routine when classes or sleep preferences change
  useEffect(() => {
    handleGenerateOptimization();
  }, [classes.length, preferences.targetSleepHours]);

  const handleGenerateOptimization = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/gemini/optimize-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classes,
          sleepRecords,
          reelsCount: reelsLog.count,
          targetSleepHours: preferences.targetSleepHours,
          studySessions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.optimizedSchedule && Array.isArray(data.optimizedSchedule)) {
          setRoutineItems(
            data.optimizedSchedule.map((item: any) => ({
              ...item,
              completed: false,
            }))
          );
        }

        setAiAnalysis({
          circadianInsight: data.circadianInsight || 'Routine harmonized with timetable and sleep target.',
          reelsImpact: data.reelsImpact || `Current reel load: ${reelsLog.count} reels.`,
          bedtime: data.bedtimeRecommendation || '11:00 PM',
          wake: data.wakeRecommendation || '07:00 AM',
          tips: data.tips || [],
        });
      }
    } catch (err) {
      console.error('Failed to optimize routine:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const toggleRoutineComplete = (index: number) => {
    setRoutineItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = routineItems.filter((r) => r.completed).length;
  const routineProgress = Math.round((completedCount / routineItems.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-600">
              Daily Routine Optimizer
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-mono">
              {completedCount} / {routineItems.length} blocks completed
            </span>
          </div>
          <h2 className="text-2xl font-display font-semibold text-slate-900 mt-1">
            Circadian Student Master Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Harmonizes class hours, peak study windows, healthy sleep duration, and controlled reels downtime.
          </p>
        </div>

        <button
          onClick={handleGenerateOptimization}
          disabled={isOptimizing}
          className="px-4 py-2.5 bg-[#18181b] hover:bg-black disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          {isOptimizing ? 'Analyzing Timetable & Biology...' : 'Recalculate AI Routine'}
        </button>
      </div>

      {/* Routine Health Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-blue-600">
            <Moon className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Optimal Bedtime Window
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
            {aiAnalysis.bedtime} → {aiAnalysis.wake}
          </div>
          <p className="text-[11px] text-slate-500">
            Provides full {preferences.targetSleepHours}h sleep with adequate morning prep buffer.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-600">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Reels Dopamine Boundary
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
            Max {preferences.reelsDailyCap} reels/day
          </div>
          <p className="text-[11px] text-slate-500">
            {aiAnalysis.reelsImpact}
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-600">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Peak Study Window
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
            02:00 PM – 04:30 PM
          </div>
          <p className="text-[11px] text-slate-500">
            Post-lecture cognitive consolidation block with zero distraction.
          </p>
        </div>
      </div>

      {/* Circadian Insight Box */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-900">
            Coach Analysis &amp; Daily Strategy
          </h4>
          <p className="text-xs text-blue-950/80 leading-relaxed">
            {aiAnalysis.circadianInsight}
          </p>
        </div>
      </div>

      {/* Hourly Master Schedule Timeline */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Today&apos;s Hourly Execution Plan</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Check off tasks as you complete them throughout your day.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Progress:</span>
            <span className="text-blue-600 font-bold">{routineProgress}%</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {routineItems.map((item, index) => {
            const isCompleted = item.completed;
            let badgeBg = 'bg-slate-100 text-slate-700';
            if (item.category === 'class') badgeBg = 'bg-blue-50 text-blue-700 border border-blue-200';
            if (item.category === 'study') badgeBg = 'bg-indigo-50 text-indigo-700 border border-indigo-200';
            if (item.category === 'wake' || item.category === 'exercise') badgeBg = 'bg-amber-50 text-amber-700 border border-amber-200';
            if (item.category === 'sleep' || item.category === 'winddown') badgeBg = 'bg-purple-50 text-purple-700 border border-purple-200';
            if (item.category === 'meal') badgeBg = 'bg-emerald-50 text-emerald-700 border border-emerald-200';

            return (
              <div
                key={index}
                onClick={() => toggleRoutineComplete(index)}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-100 opacity-60 text-slate-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div>
                    <span
                      className={`text-sm font-medium ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {item.activity}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Category: {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-semibold text-slate-600">
                    {item.time}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${badgeBg}`}>
                    {item.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {aiAnalysis.tips.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pro Student Routine Hacks
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {aiAnalysis.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
