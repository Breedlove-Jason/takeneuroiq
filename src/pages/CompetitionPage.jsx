import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sword, Trophy, Lightning, Target, Medal, UsersThree, ArrowRight, ShieldCheck, Copy, Clock, CheckCircle, XCircle, ArrowClockwise } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';
import { accountsEnabled } from '../lib/supabase';
import { competitionRpc } from '../competition/api';
import { achievements, emptyStats, modes, tier } from '../competition/model';
function Metric({
  label,
  value,
  accent = ''
}) {
  return <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-2 text-3xl font-black tabular-nums ${accent}`}>{value}</p></div>;
}
function Match({
  initial,
  onClose,
  onFinished
}) {
  const [match, setMatch] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);
  const lock = useRef(false);
  const version = useRef(0);
  const completeNotified = useRef(false);
  const offset = useRef(Date.parse(initial.server_now) - Date.now());
  const apply = useCallback(data => {
    offset.current = Date.parse(data.server_now) - Date.now();
    setMatch(data);
    setNow(Date.now());
  }, []);
  const refresh = useCallback(async () => {
    const v = version.current;
    try {
      const data = await competitionRpc('competition_snapshot', {
        match_id: initial.id
      });
      if (v === version.current && !lock.current) {
        apply(data);
        setError('');
      }
    } catch (e) {
      if (v === version.current) setError(e.message);
    }
  }, [initial.id, apply]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (match.status === 'complete' && !completeNotified.current) {
      completeNotified.current = true;
      onFinished();
    }
  }, [match.status, onFinished]);
  useEffect(() => {
    if (!['waiting', 'active'].includes(match.status) || feedback) return;
    const timer = setInterval(refresh, 3000);
    return () => clearInterval(timer);
  }, [match.status, feedback, refresh]);
  const seconds = Math.max(0, Math.ceil((Date.parse(match.question_deadline) - now - offset.current) / 1000));
  const matchSeconds = Math.max(0, Math.ceil((Date.parse(match.expires_at) - now - offset.current) / 1000));
  async function answer(choice) {
    if (lock.current) return;
    lock.current = true;
    version.current++;
    setBusy(true);
    setError('');
    try {
      const data = await competitionRpc('competition_answer', {
        match_id: match.id,
        question_number: match.position,
        choice
      });
      if (data.accepted) {
        setFeedback(data);
        setMatch(m => ({
          ...m,
          question: null,
          position: m.position + 1,
          score: m.score + data.points,
          correct: m.correct + (data.correct ? 1 : 0)
        }));
      } else apply(data);
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function next() {
    setBusy(true);
    setError('');
    try {
      const data = await competitionRpc('competition_snapshot', {
        match_id: match.id,
        reveal_next: true
      });
      setFeedback(null);
      apply(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function leave() {
    if (lock.current) return;
    lock.current = true;
    version.current++;
    setBusy(true);
    try {
      apply(await competitionRpc('competition_leave', {
        match_id: match.id
      }));
      setFeedback(null);
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/compete?code=${match.code}`);
      setCopied(true);
    } catch {
      setError('Copy the challenge code shown below to invite your friend.');
    }
  }
  return <section className="neuro-panel mt-8" aria-label="Current competition">
  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">{modes[match.mode]}</p><h2 className="mt-2 text-2xl font-black">{match.status === 'waiting' ? 'Your next rival awaits.' : match.status === 'complete' ? 'The results are in.' : match.status === 'cancelled' ? 'Challenge closed.' : 'Stay sharp. Every answer counts.'}</h2></div>
   {['waiting', 'active'].includes(match.status) && <span className="flex items-center gap-2 text-sm tabular-nums text-slate-300"><Clock size={18} />{Math.floor(matchSeconds / 60)}:{String(matchSeconds % 60).padStart(2, '0')} remaining</span>}
  </div>
  {error && <div role="alert" className="my-4 rounded-xl bg-rose-500/15 p-4 text-rose-200">{error} <button onClick={refresh} className="underline">Reconnect</button></div>}
  {match.status === 'waiting' && <div className="py-10 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-violet-500/15 text-violet-300"><UsersThree size={40} weight="fill" /></div><h3 className="mt-6 text-2xl font-bold">{match.mode === 'friend' ? 'Invite a mind worth challenging.' : 'Searching for a real opponent…'}</h3><p className="mx-auto mt-3 max-w-lg leading-7 text-slate-400">{match.mode === 'friend' ? 'Share this code or invitation link. The duel starts when your friend joins.' : 'We look for a similar rating first and widen the search after a minute. Keep this screen open. A second signed-in player must join the ranked queue.'}</p>{match.code && <><p className="my-6 break-all font-mono text-3xl tracking-widest text-cyan-300">{match.code}</p><button className="neuro-button" onClick={copy}><Copy size={18} />{copied ? 'Invitation copied' : 'Copy invitation link'}</button></>}<div><button disabled={busy} className="mt-6 text-sm text-slate-400 underline" onClick={leave}>Leave waiting room</button></div></div>}
  {match.status === 'active' && <>
   <div className="mt-6 grid grid-cols-2 gap-4"><Metric label="Your score" value={match.score} accent="text-cyan-300" /><Metric label={match.opponent ? match.opponent.name : 'Questions completed'} value={match.opponent ? match.opponent.score : `${match.position} / ${match.total}`} accent="text-fuchsia-300" /></div>
   <div className="my-6 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-linear-to-r from-cyan-400 to-fuchsia-400 transition-all" style={{
          width: `${100 * match.position / match.total}%`
        }} /></div>
   {feedback ? <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-6" role="status"><div className={`flex items-center gap-3 text-xl font-bold ${feedback.correct ? 'text-emerald-300' : 'text-amber-300'}`}>{feedback.correct ? <CheckCircle size={28} weight="fill" /> : <XCircle size={28} weight="fill" />}{feedback.correct ? `Correct · +${feedback.points}` : 'A chance to sharpen your reasoning'}</div><p className="mt-4 text-lg font-semibold">{feedback.answer}</p><p className="mt-2 leading-7 text-slate-300">{feedback.explanation}</p><button disabled={busy} onClick={next} className="neuro-button mt-6">{match.position >= match.total ? 'See match status' : 'Next question'}<ArrowRight size={18} /></button></div> : match.finished ? <div className="py-10 text-center"><CheckCircle size={42} className="mx-auto text-emerald-300" /><h3 className="mt-4 text-xl font-bold">Your answers are locked in.</h3><p className="mt-3 text-slate-400">Waiting for your opponent to finish. Results settle when both players finish or the match timer expires.</p></div> : match.question && <div><div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span className="font-bold text-violet-300">{match.question.family} · {['', 'Focused', 'Advanced', 'Expert'][match.question.difficulty]}</span><span className={`font-mono font-bold ${seconds <= 10 ? 'text-rose-300' : 'text-cyan-300'}`}>{seconds}s · Question {match.position + 1}/{match.total}</span></div><h3 className="my-7 text-xl font-bold leading-relaxed sm:text-2xl">{match.question.prompt}</h3><div className="grid gap-3 sm:grid-cols-2">{match.question.options.map((option, i) => <button key={`${match.position}-${i}`} disabled={busy || seconds === 0} onClick={() => answer(i)} className="flex min-h-20 items-center gap-4 rounded-2xl border border-slate-600 bg-slate-900 p-5 text-left font-semibold transition hover:border-cyan-300 hover:bg-cyan-500/10 focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-800 text-sm text-cyan-300">{'ABCD'[i]}</span>{option}</button>)}</div><button className="mt-5 text-sm text-slate-400 underline" disabled={busy} onClick={() => answer(-1)}>{seconds === 0 ? 'Time is up — continue' : 'Skip this question'}</button></div>}
   {!feedback && !match.finished && !match.question && <button onClick={next} disabled={busy} className="neuro-button mt-6">Continue to next question</button>}
   {!feedback && !match.finished && <details className="mt-8 text-sm text-slate-400"><summary className="cursor-pointer">Need to stop?</summary><p className="mt-3">Finish with your current score. Unanswered questions earn zero. This consumes your daily attempt.</p><button disabled={busy} onClick={leave} className="mt-3 underline">Finish early</button></details>}
  </>}
  {match.status === 'complete' && <div className="pt-8"><div className="text-center"><Trophy size={56} weight="fill" className="mx-auto text-amber-300" /><h3 className="mt-4 text-3xl font-black">{match.outcome === 'win' ? 'Victory. Earned.' : match.outcome === 'loss' ? 'A rival to learn from.' : match.outcome === 'draw' ? 'A battle of equals.' : 'Daily challenge complete.'}</h3><p className="mt-3 text-slate-300">{match.correct}/{match.total} correct · +{match.xp} XP {match.mode === 'ranked' && `· ${match.rating_delta >= 0 ? '+' : ''}${match.rating_delta} rating`}</p></div><div className="my-7 grid grid-cols-2 gap-4"><Metric label="Final score" value={match.score} accent="text-cyan-300" /><Metric label={match.opponent ? 'Opponent' : 'Accuracy'} value={match.opponent ? match.opponent.score : `${Math.round(100 * match.correct / match.total)}%`} accent="text-fuchsia-300" /></div><button onClick={onClose} className="neuro-button">Back to competition hub<ArrowRight size={18} /></button><h4 className="mt-9 text-xl font-bold">Learn from this round</h4><p className="mt-2 text-sm text-slate-400">{match.total - match.review.length > 0 ? `${match.total - match.review.length} unanswered questions earned zero. ` : ''}Your accepted answers and explanations are saved with this match.</p><div className="mt-4 space-y-3">{match.review.map(row => <details key={row.number} className="rounded-xl border border-slate-700 p-4"><summary className="cursor-pointer font-semibold"><span className={row.correct ? 'text-emerald-300' : 'text-amber-300'}>{row.correct ? '✓' : '○'} {row.number}. {row.family}</span><span className="float-right text-cyan-300">+{row.points}</span></summary><p className="mt-4 leading-7">{row.prompt}</p><p className="mt-3 text-sm text-slate-400">Your answer: {row.your_answer}</p><p className="mt-2 font-semibold text-cyan-300">Answer: {row.answer}</p><p className="mt-2 text-sm leading-6 text-slate-300">{row.explanation}</p></details>)}</div></div>}
  {match.status === 'cancelled' && <button className="neuro-button mt-6" onClick={onClose}>Back to the hub</button>}
 </section>;
}
export default function CompetitionPage() {
  const {
    user
  } = useAuth();
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(() => params.get('code') || '');
  const [dashboard, setDashboard] = useState(null);
  const [match, setMatch] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!user) return;
    try {
      setDashboard(await competitionRpc('competition_dashboard'));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [user]);
  useEffect(() => {
    let alive = true;
    if (user) competitionRpc('competition_dashboard').then(d => {
      if (alive) setDashboard(d);
    }).catch(e => {
      if (alive) setError(e.message);
    });
    return () => {
      alive = false;
    };
  }, [user]);
  const stats = dashboard?.stats || emptyStats;
  const rank = tier(stats.rating);
  const level = 1 + Math.floor(stats.xp / 500);
  async function start(mode, join = null) {
    setBusy(true);
    setError('');
    try {
      const data = await competitionRpc('competition_start', {
        game_mode: mode,
        join_code: join
      });
      setMatch(data);
      if (params.has('code')) setParams({});
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function resume(id) {
    setBusy(true);
    setError('');
    try {
      setMatch(await competitionRpc('competition_snapshot', {
        match_id: id,
        reveal_next: true
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function close() {
    setMatch(null);
    load();
  }
  const canPlay = Boolean(user && dashboard && !busy);
  return <main className="competition-shell mx-auto max-w-7xl px-5 py-12 text-slate-100 sm:py-16">
  <div className="grid items-end gap-8 lg:grid-cols-[1.5fr_1fr]"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.24em] text-cyan-300"><Sword size={19} weight="fill" /> The NeuroIQ arena</p><h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl">Great minds.<br /><span className="bg-linear-to-r from-cyan-300 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent">Real rivals.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Read the pattern. Trust your reasoning. Take on a rival, climb the ranks, and make today your sharpest round yet.</p></div><div className="rounded-3xl border border-violet-400/30 bg-linear-to-br from-violet-500/15 to-slate-900 p-7"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your arena rank</p><Medal size={32} weight="fill" className={rank.color} /></div><div className="mt-5 flex items-baseline gap-3"><span className={`text-3xl font-black ${rank.color}`}>{rank.name}</span><span className="font-mono text-slate-300">{stats.rating}</span></div><p className="mt-3 text-sm text-slate-400">{rank.next ? `${Math.max(0, rank.next - stats.rating)} rating to the next division` : 'The top division. Keep defending your place.'}</p><div className="mt-6 flex justify-between text-xs font-bold text-slate-300"><span>LEVEL {level}</span><span>{stats.xp % 500} / 500 XP</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-linear-to-r from-violet-400 to-fuchsia-400" style={{
            width: `${stats.xp % 500 / 5}%`
          }} /></div></div></div>
  <div className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric label="Duels won" value={stats.wins} accent="text-amber-300" /><Metric label="Total XP" value={stats.xp.toLocaleString()} accent="text-violet-300" /><Metric label="Accuracy" value={stats.answered ? `${Math.round(100 * stats.correct / stats.answered)}%` : '—'} accent="text-cyan-300" /><Metric label="Daily streak" value={`${stats.daily_streak} days`} accent="text-fuchsia-300" /></div>
  {!user && <div className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-6"><div><h2 className="font-bold">Your competitive record starts here.</h2><p className="mt-2 text-sm text-slate-300">{accountsEnabled ? 'Sign in to keep your rating, match history, and achievements across devices.' : 'Competition accounts are being connected. All twelve training challenges are available.'}</p></div><Link to={accountsEnabled ? '/login' : '/play'} className="neuro-button">{accountsEnabled ? 'Sign in to compete' : 'Explore training'}<ArrowRight size={18} /></Link></div>}
  {error && <div role="alert" className="mt-6 rounded-xl bg-rose-500/15 p-5 text-rose-200">{error} <button onClick={load} className="underline">Retry connection</button></div>}
  {user && !dashboard && !error && <p role="status" className="mt-6 text-slate-400">Loading your competitive record…</p>}
  {match ? <Match key={match.id} initial={match} onClose={close} onFinished={load} /> : <>
   {dashboard?.active_match && <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-5"><p>You have a match in progress. Rejoin to keep playing.</p><button disabled={busy} onClick={() => resume(dashboard.active_match)} className="neuro-button">Resume match</button></div>}
   <div className="mt-10 flex items-center justify-between"><h2 className="text-2xl font-black">Choose your competition</h2><Link to="/rankings" className="flex items-center gap-2 text-sm font-bold text-cyan-300">Rankings<ArrowRight size={16} /></Link></div>
   <div className="mt-5 grid gap-5 lg:grid-cols-3">{[{
          mode: 'ranked',
          icon: Sword,
          color: 'text-cyan-300',
          border: 'border-cyan-400/30',
          label: 'Find your equal. Then improve.',
          detail: '8 questions. A real opponent. Identical puzzles, 30 seconds per question, and an Elo rating that moves with the result.',
          button: 'Find ranked match',
          tag: 'RATING ON THE LINE'
        }, {
          mode: 'daily',
          icon: Lightning,
          color: 'text-amber-300',
          border: 'border-amber-400/30',
          label: 'One day. One shot.',
          detail: '10 questions shared by today’s challengers. One scored attempt per UTC day. Build your streak and claim a place on the daily board.',
          button: dashboard?.daily_played ? 'View today’s attempt' : 'Take today’s challenge',
          tag: 'RESETS AT 00:00 UTC'
        }, {
          mode: 'friend',
          icon: UsersThree,
          color: 'text-fuchsia-300',
          border: 'border-fuchsia-400/30',
          label: 'Settle it in the arena.',
          detail: 'Create an invitation code for a head-to-head duel. Earn XP and keep the result in your history. Friendly matches do not affect Elo.',
          button: 'Create friend challenge',
          tag: 'YOUR FRIEND. YOUR RIVAL.'
        }].map(({
          mode,
          icon: Icon,
          color,
          border,
          label,
          detail,
          button,
          tag
        }) => <article key={mode} className={`flex flex-col rounded-3xl border ${border} bg-slate-900/70 p-6`}><div className={`flex items-center justify-between ${color}`}>{createElement(Icon, {
              size: 35,
              weight: "fill"
            })}<span className="text-[10px] font-black tracking-widest">{tag}</span></div><h3 className="mt-6 text-2xl font-black">{modes[mode]}</h3><p className={`mt-2 text-sm font-semibold ${color}`}>{label}</p><p className="mt-4 flex-1 text-sm leading-7 text-slate-400">{detail}</p><button disabled={!canPlay} onClick={() => start(mode)} className="neuro-button mt-6 w-full justify-center disabled:opacity-40">{busy ? 'Connecting…' : button}<ArrowRight size={18} /></button></article>)}
   </div>
   <form onSubmit={e => {
        e.preventDefault();
        start('friend', code);
      }} className="mt-5 flex flex-wrap items-end gap-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-5"><label className="min-w-0 flex-1 text-sm font-bold">Have a challenge code?<input name="challengeCode" value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} maxLength={12} minLength={12} required placeholder="12-character invitation code" className="neuro-field mt-2 font-mono uppercase" /></label><button disabled={!canPlay || code.length !== 12} className="neuro-button neuro-muted-button disabled:opacity-40">Join challenge</button></form>
   <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_1fr]"><section><div className="flex items-center justify-between"><h2 className="text-2xl font-black">Your recent battles</h2><button aria-label="Refresh match history" onClick={load} disabled={!user} className="p-2 text-slate-400"><ArrowClockwise size={20} /></button></div>{dashboard?.history?.length ? <div className="mt-5 space-y-3">{dashboard.history.map(h => <button key={h.id} onClick={() => resume(h.id)} disabled={busy} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-left transition hover:border-cyan-500"><div><p className="font-bold">{modes[h.mode]}</p><p className="mt-1 text-xs text-slate-400">{new Date(h.created_at).toLocaleDateString()} · {h.correct}/{h.total} correct</p></div><div className="text-right"><p className="font-black text-cyan-300">{h.score} pts</p><p className="mt-1 text-xs uppercase text-slate-400">{h.outcome === 'daily' ? 'Completed' : h.outcome} · +{h.xp} XP</p></div></button>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-600 p-9 text-center"><Target size={35} className="mx-auto text-slate-500" /><p className="mt-4 font-semibold">A clean slate. A lot of potential.</p><p className="mt-2 text-sm leading-6 text-slate-400">Finish your first competition to start a record you can build on.</p></div>}</section><section><h2 className="text-2xl font-black">Milestones worth earning</h2><div className="mt-5 grid grid-cols-2 gap-3">{achievements(stats).map(a => <div key={a.name} className={`rounded-2xl border p-4 ${a.earned ? 'border-amber-400/40 bg-amber-400/10' : 'border-slate-700 bg-slate-900/40'}`}><Medal size={26} weight={a.earned ? 'fill' : 'regular'} className={a.earned ? 'text-amber-300' : 'text-slate-500'} /><p className="mt-3 text-sm font-bold">{a.name}</p><p className="mt-1 text-xs leading-5 text-slate-400">{a.detail}</p><p className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${a.earned ? 'text-amber-300' : 'text-slate-500'}`}>{a.earned ? 'Earned' : 'In progress'}</p></div>)}</div></section></div>
  </>}
  <div className="mt-10 flex items-start gap-3 border-t border-slate-700 pt-6 text-sm leading-6 text-slate-400"><ShieldCheck size={23} className="shrink-0 text-emerald-300" /><p>Answers, timing, and results are checked by the arena. A correct answer earns 100 points plus up to 50 for speed. Ranked duels use Elo; the first three ranked meetings with the same opponent in 24 hours affect rating. Public rankings respect your <Link to="/account" className="text-cyan-300 underline">visibility setting</Link>. These are reasoning games, not clinical IQ measurements.</p></div>
 </main>;
}
