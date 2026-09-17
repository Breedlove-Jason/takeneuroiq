import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDots, CheckCircle, Compass, Target } from '@phosphor-icons/react';
import { getPuzzleTypeMetadata } from '../utils/puzzleTypeRegistry';
import { buildTrainingSummary, TRAINING_CHALLENGES } from '../game/trainingSummary';

const panel = 'rounded-3xl border bg-slate-900/70 p-5 shadow-lg backdrop-blur-md';
const action = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300';

export default function ProfileTrainingHub({ sessions }) {
  const summary = buildTrainingSummary(sessions);
  const next = summary.challenges.find((challenge) => challenge.runs === 0)
    ?? [...summary.challenges].sort((a, b) => a.runs - b.runs)[0];

  return (
    <div className="space-y-6" aria-label="Your training hub">
      <section className={`${panel} border-cyan-400/25`} aria-labelledby="training-week-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="training-week-title" className="flex items-center gap-2 text-xl font-bold text-white">
            <CalendarDots weight="fill" className="text-cyan-300" aria-hidden="true" /> Training rhythm
          </h2>
          <span className="text-xs font-bold text-cyan-300">LAST 7 DAYS</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">Small sessions add up. Here’s your week on this device.</p>
        <div className="mt-5 grid grid-cols-7 gap-2" role="list" aria-label="Sessions by day">
          {summary.days.map((day) => (
            <div key={day.key} role="listitem" aria-label={`${day.label}: ${day.count} sessions`} className="min-w-0 text-center">
              <div className={`flex h-20 items-end justify-center rounded-xl border p-2 ${day.count ? 'border-cyan-300/40 bg-cyan-400/10' : 'border-slate-700/60 bg-slate-950/50'}`}>
                <div className={`w-full rounded-md ${day.count ? 'bg-linear-to-t from-blue-500 to-cyan-300' : 'bg-slate-700'}`} style={{ height: `${day.count ? 18 + (day.count / summary.maxDailyRuns) * 82 : 5}%` }} />
              </div>
              <p className="mt-2 text-[10px] font-semibold text-slate-400">{day.shortLabel}</p>
              <p className={`mt-1 text-xs font-bold ${day.count ? 'text-cyan-300' : 'text-slate-500'}`}>{day.count}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-4 text-sm">
          <span className="text-slate-300"><strong className="text-white">{summary.weekRuns}</strong> sessions this week</span>
          <span className="text-cyan-300">{summary.activeDays} / 7 active days</span>
        </div>
      </section>

      <section className={`${panel} border-amber-400/30 bg-linear-to-br from-amber-400/10 via-slate-900 to-slate-900`} aria-labelledby="training-goal-title">
        <h2 id="training-goal-title" className="flex items-center gap-2 text-xl font-bold text-white">
          <Target weight="fill" className="text-amber-300" aria-hidden="true" /> Today’s small win
        </h2>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="text-sm text-slate-300">Complete 3 sessions at your own pace.</p>
          <span className="shrink-0 font-mono text-2xl font-black text-amber-300">{Math.min(summary.todayRuns, 3)}<span className="text-sm text-slate-500"> / 3</span></span>
        </div>
        <div role="progressbar" aria-label="Today's session goal" aria-valuemin={0} aria-valuemax={3} aria-valuenow={Math.min(summary.todayRuns, 3)} className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-linear-to-r from-orange-400 to-yellow-300" style={{ width: `${Math.min(summary.todayRuns / 3, 1) * 100}%` }} />
        </div>
        <p className="mt-3 text-xs leading-5 text-amber-100/80">{summary.todayRuns >= 3 ? 'Goal complete. Nice work—take a breather or explore another challenge.' : 'Accuracy first. Give yourself a short break between rounds.'}</p>
        <Link to="/arena" state={{ puzzleType: next.type }} className={`mt-5 flex items-center justify-between gap-3 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-200 transition hover:bg-amber-300/20 ${action}`}>
          {next.runs ? 'Revisit' : 'Try'} {getPuzzleTypeMetadata(next.type).label}
          <ArrowUpRight weight="bold" className="shrink-0" aria-hidden="true" />
        </Link>
        <p className="mt-2 text-xs text-slate-400">{next.runs ? 'Your least-played challenge: give it another round.' : 'A challenge you haven’t completed yet.'}</p>
      </section>

      <section className={`${panel} border-violet-400/30`} aria-labelledby="challenge-passport-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="challenge-passport-title" className="flex items-center gap-2 text-xl font-bold text-white">
            <Compass weight="fill" className="text-violet-300" aria-hidden="true" /> Challenge passport
          </h2>
          <span className="shrink-0 rounded-full bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-200">{summary.explored} / {TRAINING_CHALLENGES.length}</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-400">Explore all twelve arenas. Each completed session adds to your personal record.</p>
        <div className="mt-5 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
          {summary.challenges.map((challenge, index) => (
            <Link key={challenge.type} to="/arena" state={{ puzzleType: challenge.type }} className={`group flex min-w-0 flex-col rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:-translate-y-0.5 hover:border-[var(--passport-accent)] hover:bg-slate-800/70 ${action}`} style={{ '--passport-accent': challenge.color }}>
              <div className="flex items-center justify-between text-xs font-bold" style={{ color: challenge.color }}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {challenge.runs > 0 ? <CheckCircle weight="fill" size={19} aria-label="Completed" /> : <ArrowUpRight size={19} aria-hidden="true" />}
              </div>
              <h3 className="mt-3 text-sm font-bold text-white">{getPuzzleTypeMetadata(challenge.type).label}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">{challenge.runs ? `${challenge.runs} ${challenge.runs === 1 ? 'session' : 'sessions'} · Best ${challenge.best.toLocaleString()}` : 'Ready to explore'}</p>
              <span className="mt-3 text-xs font-bold" style={{ color: challenge.color }}>{challenge.runs ? 'Play again' : 'Launch challenge'} <span aria-hidden="true">↗</span></span>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-400">{summary.explored === 12 ? 'Full passport! Revisit a favorite and build on your personal best.' : `${12 - summary.explored} arenas still to explore. Try a different skill each time.`}</p>
      </section>
    </div>
  );
}
