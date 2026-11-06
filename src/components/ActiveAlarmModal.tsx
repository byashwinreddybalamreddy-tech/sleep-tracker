import React, { useState, useEffect } from 'react';
import { AlarmItem } from '../types';
import { stopAlarmAudio } from '../utils/audio';
import { BellRing, Check, Clock, ShieldAlert } from 'lucide-react';

interface ActiveAlarmModalProps {
  alarm: AlarmItem;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

export const ActiveAlarmModal: React.FC<ActiveAlarmModalProps> = ({
  alarm,
  onDismiss,
  onSnooze,
}) => {
  const [mathA, setMathA] = useState(23);
  const [mathB, setMathB] = useState(19);
  const [userAnswer, setUserAnswer] = useState('');
  const [pledgeText, setPledgeText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const targetPledge = 'I will not doomscroll today';

  useEffect(() => {
    const a = Math.floor(Math.random() * 40) + 15;
    const b = Math.floor(Math.random() * 40) + 12;
    setMathA(a);
    setMathB(b);
  }, []);

  const handleVerifyDismiss = (e: React.FormEvent) => {
    e.preventDefault();
    if (alarm.challengeType === 'math') {
      const correct = mathA + mathB;
      if (parseInt(userAnswer.trim(), 10) === correct) {
        stopAlarmAudio();
        onDismiss();
      } else {
        setErrorMsg(`Incorrect answer! Try again: ${mathA} + ${mathB}`);
      }
    } else if (alarm.challengeType === 'detox_pledge') {
      if (pledgeText.trim().toLowerCase() === targetPledge.toLowerCase()) {
        stopAlarmAudio();
        onDismiss();
      } else {
        setErrorMsg('Please type the exact phrase to awaken your focus!');
      }
    } else {
      stopAlarmAudio();
      onDismiss();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-amber-50 text-amber-600 mb-1 ring-8 ring-amber-100/60">
          <BellRing className="w-10 h-10 animate-bounce" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold">
            {alarm.isAutoCalculated ? 'Automated Class Alarm' : 'Wake-Up Alarm'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
            {alarm.label}
          </h2>
          <p className="text-5xl font-mono font-bold tracking-tight text-blue-600 mt-2">
            {alarm.time}
          </p>
          {alarm.syncReason && (
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
              {alarm.syncReason}
            </p>
          )}
        </div>

        {/* Challenge Section */}
        {alarm.challengeType !== 'none' ? (
          <form onSubmit={handleVerifyDismiss} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Wake-up Verification Challenge</span>
            </div>

            {alarm.challengeType === 'math' && (
              <div>
                <p className="text-sm text-slate-700 mb-2">
                  Solve to prove you are awake: <strong className="font-mono text-base text-blue-600">{mathA} + {mathB} = ?</strong>
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    autoFocus
                    value={userAnswer}
                    onChange={(e) => {
                      setUserAnswer(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Enter sum"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#18181b] hover:bg-black text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shadow-xs"
                  >
                    Dismiss Alarm
                  </button>
                </div>
              </div>
            )}

            {alarm.challengeType === 'detox_pledge' && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Type the morning pledge:</p>
                <p className="text-xs font-mono text-blue-700 select-all mb-2">&quot;{targetPledge}&quot;</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={pledgeText}
                    onChange={(e) => {
                      setPledgeText(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Type pledge here"
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#18181b] hover:bg-black text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shadow-xs"
                  >
                    Confirm &amp; Wake
                  </button>
                </div>
              </div>
            )}

            {errorMsg && <p className="text-xs text-rose-600">{errorMsg}</p>}
          </form>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => {
                stopAlarmAudio();
                onDismiss();
              }}
              className="w-full sm:w-auto px-8 py-3 bg-[#18181b] hover:bg-black text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 text-emerald-400" />
              I Am Awake &amp; Ready
            </button>
          </div>
        )}

        {/* Snooze Options */}
        <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Snooze:
          </span>
          <button
            onClick={() => onSnooze(5)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            +5 Minutes
          </button>
          <button
            onClick={() => onSnooze(10)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            +10 Minutes
          </button>
        </div>
      </div>
    </div>
  );
};
