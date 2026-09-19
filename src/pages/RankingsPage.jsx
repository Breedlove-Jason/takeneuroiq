import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, ArrowClockwise, Crown } from '@phosphor-icons/react';
import { competitionRpc } from '../competition/api';
import { tier } from '../competition/model';
const boards = {
  rating: {
    label: 'Global Elo',
    metric: 'Rating',
    description: 'Ranked duel ratings. Win against stronger rivals to climb.'
  },
  week: {
    label: 'Weekly XP',
    metric: 'XP this week',
    description: 'Experience earned in completed competitions since Monday, 00:00 UTC.'
  },
  daily: {
    label: 'Today’s challenge',
    metric: 'Daily score',
    description: 'One attempt. The same ten questions. Resets every day at 00:00 UTC.'
  }
};
export default function RankingsPage() {
  const [board, setBoard] = useState('rating');
  const [refresh, setRefresh] = useState(0);
  const [state, setState] = useState({
    loading: true,
    rows: [],
    error: ''
  });
  useEffect(() => {
    let alive = true;
    competitionRpc('competition_leaderboard', {
      board
    }).then(rows => {
      if (alive) setState({
        loading: false,
        rows,
        error: ''
      });
    }).catch(e => {
      if (alive) setState({
        loading: false,
        rows: [],
        error: e.message
      });
    });
    return () => {
      alive = false;
    };
  }, [board, refresh]);
  function change(value) {
    setState({
      loading: true,
      rows: [],
      error: ''
    });
    setBoard(value);
  }
  return <main className="competition-shell mx-auto max-w-6xl px-5 py-14 text-slate-100"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.25em] text-amber-300"><Trophy size={22} weight="fill" /> The competitive standings</p><div className="mt-5 flex flex-wrap items-end justify-between gap-6"><div><h1 className="text-5xl font-black tracking-tight sm:text-6xl">Earn your place.</h1><p className="mt-5 max-w-xl leading-7 text-slate-400">Every point comes from a completed competition. Every rival starts with the same opportunity.</p></div><Link to="/compete" className="neuro-button">Enter the arena<ArrowRight size={18} /></Link></div><div className="neuro-panel mt-9"><div className="flex flex-wrap items-center justify-between gap-4"><div role="group" aria-label="Competition leaderboard" className="flex flex-wrap gap-2">{Object.entries(boards).map(([key, b]) => <button key={key} onClick={() => change(key)} aria-pressed={board === key} className={`neuro-button ${board === key ? '' : 'neuro-muted-button'}`}>{b.label}</button>)}</div><button aria-label="Refresh rankings" className="rounded-lg p-3 text-cyan-300" onClick={() => {
          setState({
            loading: true,
            rows: [],
            error: ''
          });
          setRefresh(x => x + 1);
        }}><ArrowClockwise size={22} /></button></div><p className="my-6 text-sm leading-6 text-slate-400">{boards[board].description} Players appear after opting in through their account settings. Points first; correct answers break ties. Equal results share a place.</p>{state.loading ? <p role="status" className="py-12 text-center">Loading standings…</p> : state.error ? <p role="alert" className="rounded-xl bg-rose-500/10 p-5 text-rose-200">{state.error}</p> : state.rows.length === 0 ? <div className="py-14 text-center"><Crown size={48} weight="fill" className="mx-auto text-amber-300" /><h2 className="mt-5 text-2xl font-bold">The first place is waiting.</h2><p className="mt-3 text-slate-400">Complete a competition and enable public leaderboard visibility.</p><Link to="/compete" className="neuro-button mt-6">Make your first move</Link></div> : <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left"><caption className="sr-only">{boards[board].label} standings</caption><thead className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400"><tr>{['Place', 'Challenger', boards[board].metric, 'Division', 'Accuracy'].map(h => <th key={h} className="px-3 py-4" scope="col">{h}</th>)}</tr></thead><tbody>{state.rows.map((r, i) => {
              const place = state.rows.findIndex(x => x.value === r.value && x.correct === r.correct) + 1;
              return <tr key={i} className="border-b border-slate-800"><td className={`px-3 py-5 font-mono text-xl font-black ${place === 1 ? 'text-amber-300' : 'text-slate-400'}`}>{String(place).padStart(2, '0')}</td><th scope="row" className="max-w-52 break-words px-3 py-5 font-bold">{r.display_name}</th><td className="px-3 py-5 text-xl font-black text-cyan-300">{r.value.toLocaleString()}</td><td className={`px-3 py-5 text-sm font-bold ${tier(r.rating).color}`}>{tier(r.rating).name}</td><td className="px-3 py-5 text-slate-300">{r.answered ? `${Math.round(100 * r.correct / r.answered)}%` : '—'}</td></tr>;
            })}</tbody></table></div>}</div><div className="mt-6 flex flex-wrap justify-between gap-4 text-sm"><Link to="/account" className="text-cyan-300 underline">Manage my leaderboard visibility</Link><Link to="/leaderboard" className="text-slate-400 underline">View the separate practice board</Link></div></main>;
}
