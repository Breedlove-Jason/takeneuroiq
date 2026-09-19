import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  GlobeHemisphereWest,
  Desktop,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { useSessionData } from "../hooks/useSessionData";
import { PUZZLE_TYPE_METADATA } from "../utils/puzzleTypeRegistry";
import { rankLocalSessions } from "../lib/leaderboard";
import { supabase, accountsEnabled } from "../lib/supabase";

export default function LeaderboardPage() {
  const { sessions } = useSessionData();
  const [scope, setScope] = useState(accountsEnabled ? "community" : "device");
  const [family, setFamily] = useState("pattern_rush");
  const [period, setPeriod] = useState("all");
  const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [remote, setRemote] = useState({
    rows: [],
    loading: accountsEnabled,
    error: "",
  });
  const since = period === "week" ? now - 7 * 86400000 : 0;
  useEffect(() => {
    if (scope !== "community" || !supabase) return;
    let active = true;
    supabase
      .rpc("community_leaderboard", { family, recent_only: period === "week" })
      .then(({ data, error }) => {
        if (active)
          setRemote({
            rows: data || [],
            loading: false,
            error: error
              ? "The community board could not be loaded. Try refreshing or view this device’s scores."
              : "",
          });
      })
      .catch(() => {
        if (active)
          setRemote({
            rows: [],
            loading: false,
            error: "The community board is temporarily unavailable.",
          });
      });
    return () => {
      active = false;
    };
  }, [scope, family, period, refresh]);
  const local = useMemo(
    () => rankLocalSessions(sessions, family, since),
    [sessions, family, since],
  );
  const rows = scope === "device" ? local : remote.rows;
  function change(setter, value) {
    setNow(Date.now());
    setter(value);
    setRemote({ rows: [], loading: true, error: "" });
  }
  return (
    <main className="mx-auto max-w-6xl px-5 py-14">
      <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[.22em] text-amber-500">
        <Trophy weight="fill" size={26} /> The practice board
      </div>
      <h1 className="mt-4 text-4xl font-black sm:text-6xl">
        Small wins. Big progress.
      </h1>
      <p className="mt-5 max-w-2xl leading-7 opacity-75">
        See the best run from each player in a challenge. Compare like with
        like, celebrate a new best, and come back for another round.
      </p>
      <Link to="/rankings" className="neuro-button mt-6">View competitive rankings</Link>
      <div className="neuro-panel mt-9">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Leaderboard source"
          >
            <button
              onClick={() => change(setScope, "device")}
              aria-pressed={scope === "device"}
              className={`neuro-button ${scope === "device" ? "" : "neuro-muted-button"}`}
            >
              <Desktop size={18} />
              This device
            </button>
            <button
              onClick={() => change(setScope, "community")}
              aria-pressed={scope === "community"}
              className={`neuro-button ${scope === "community" ? "" : "neuro-muted-button"}`}
            >
              <GlobeHemisphereWest size={18} />
              Community
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-bold text-slate-300">
              Challenge
              <select
                className="neuro-field mt-2 max-w-full"
                value={family}
                onChange={(e) => change(setFamily, e.target.value)}
              >
                {Object.entries(PUZZLE_TYPE_METADATA).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-300">
              Period
              <select
                className="neuro-field mt-2"
                value={period}
                onChange={(e) => change(setPeriod, e.target.value)}
              >
                <option value="all">All time</option>
                <option value="week">Last 7 days</option>
              </select>
            </label>
            <button
              className="neuro-button neuro-muted-button"
              aria-label="Refresh leaderboard"
              onClick={() => change(setRefresh, refresh + 1)}
            >
              <ArrowClockwise size={20} />
            </button>
          </div>
        </div>
        <p className="my-6 text-sm leading-6 text-slate-400">
          {scope === "device"
            ? "Practice records saved in this browser for the current guest or account."
            : "Opt-in display names and best scores. Practice scores are submitted by players’ browsers and are not verified competitive results."}
        </p>
        {scope === "community" && !accountsEnabled ? (
          <div className="rounded-2xl border border-dashed border-slate-600 px-6 py-12 text-center">
            <h2 className="text-xl font-bold">
              The community board is opening soon.
            </h2>
            <p className="mt-3 text-slate-300">
              Your device leaderboard is ready to use now.
            </p>
            <button
              className="neuro-button mt-5"
              onClick={() => setScope("device")}
            >
              View device scores
            </button>
          </div>
        ) : scope === "community" && remote.error ? (
          <p
            role="alert"
            className="rounded-xl bg-rose-500/10 p-5 text-rose-200"
          >
            {remote.error}
          </p>
        ) : scope === "community" && remote.loading ? (
          <p role="status" className="py-12 text-center">
            Loading the board…
          </p>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy
              weight="fill"
              size={42}
              className="mx-auto text-amber-300"
            />
            <h2 className="mt-4 text-xl font-bold">
              A fresh board. Your move.
            </h2>
            <p className="mt-3 text-slate-400">
              No runs for this challenge and period yet.
            </p>
            <Link className="neuro-button mt-6" to="/play">
              Choose a challenge
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <caption className="sr-only">
                {PUZZLE_TYPE_METADATA[family].label} {scope} leaderboard
              </caption>
              <thead className="border-b border-slate-600 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  {["Rank", "Player", "Best score", "Accuracy", "Streak"].map(
                    (t) => (
                      <th key={t} scope="col" className="px-3 py-4">
                        {t}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id || row.display_name + index}
                    className="border-b border-slate-800"
                  >
                    <td
                      className={`px-3 py-5 font-black ${index === 0 ? "text-amber-300" : index === 1 ? "text-cyan-300" : index === 2 ? "text-fuchsia-300" : "text-slate-500"}`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <th
                      scope="row"
                      className="max-w-[220px] break-words px-3 py-5 font-semibold"
                    >
                      {row.display_name}
                    </th>
                    <td className="px-3 py-5 text-lg font-black text-cyan-300">
                      {Number(row.score).toLocaleString()}
                    </td>
                    <td className="px-3 py-5">{Math.round(row.accuracy)}%</td>
                    <td className="px-3 py-5">{row.streak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {scope === "community" && accountsEnabled && (
          <p className="mt-6 text-sm text-slate-400">
            Want to appear here?{" "}
            <Link to="/account" className="text-cyan-300 underline">
              Enable community visibility in your account.
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
