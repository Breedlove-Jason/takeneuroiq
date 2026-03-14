import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faMedal,
  faChartLine,
  faBolt,
  faBrain,
} from "@fortawesome/free-solid-svg-icons";
import { useSessionData } from "../hooks/useSessionData";

function LeaderboardPage() {
  const { leaderboardData } = useSessionData();
  const getPlayerAccuracy = (player) => {
    if (
      typeof player.puzzlesAttempted === "number" &&
      player.puzzlesAttempted > 0 &&
      typeof player.puzzlesCorrect === "number"
    ) {
      return Math.round(
        (player.puzzlesCorrect / player.puzzlesAttempted) * 100,
      );
    }

    return Number.parseInt(player.accuracy, 10) || 0;
  };
  const topScore =
    leaderboardData.length > 0
      ? Math.max(...leaderboardData.map((player) => player.score))
      : 0;

  const bestAccuracy =
    leaderboardData.length > 0
      ? Math.max(
          ...leaderboardData.map((player) => {
            if (
              player.puzzlesAttempted &&
              player.puzzlesCorrect &&
              player.puzzlesAttempted > 0
            ) {
              return Math.round(
                (player.puzzlesCorrect / player.puzzlesAttempted) * 100,
              );
            }

            return Number.parseInt(player.accuracy, 10) || 0;
          }),
        )
      : 0;

  const longestStreak =
    leaderboardData.length > 0
      ? Math.max(...leaderboardData.map((player) => player.streak))
      : 0;

  return (
    <section className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-cyan-400/30 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-md dark:bg-slate-900/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-300">
                <FontAwesomeIcon icon={faBolt} />
                Neural Arena Rankings
              </p>

              <h1 className="text-3xl font-extrabold tracking-tight text-cyan-300 md:text-5xl">
                Leaderboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Track the strongest minds in the arena. This page will evolve
                into a live competitive board powered by session history, ranked
                runs, and adaptive performance analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-400/20 bg-slate-800/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Top Score
                </p>
                <p className="mt-2 text-2xl font-bold text-cyan-300">
                  {topScore}
                </p>
              </div>

              <div className="rounded-2xl border border-fuchsia-400/20 bg-slate-800/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Best Accuracy
                </p>
                <p className="mt-2 text-2xl font-bold text-fuchsia-300">
                  {bestAccuracy}%
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-slate-800/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Longest Streak
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-300">
                  {longestStreak}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <FontAwesomeIcon
                    icon={faTrophy}
                    className="text-yellow-300"
                  />
                  Top Competitors
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Prototype rankings for the neural competition layer.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-700/60">
              <div className="grid grid-cols-[80px_1.2fr_1fr_1fr_1fr_1.2fr] bg-slate-800/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span>Rank</span>
                <span>Player</span>
                <span>Score</span>
                <span>Accuracy</span>
                <span>Streak</span>
                <span>Label</span>
              </div>

              {leaderboardData.length > 0 ? (
                leaderboardData.map((player) => (
                  <div
                    key={`${player.rank}-${player.name}-${player.score}`}
                    className="grid grid-cols-[80px_1.2fr_1fr_1fr_1fr_1.2fr] items-center border-t border-slate-800 px-4 py-4 text-sm text-slate-200 transition duration-200 hover:bg-slate-800/70"
                  >
                    <span className="font-bold text-cyan-300">
                      #{player.rank}
                    </span>

                    <span className="font-semibold text-white">
                      {player.name}
                    </span>

                    <span>{player.score}</span>
                    <span>{getPlayerAccuracy(player)}%</span>
                    <span>{player.streak}</span>
                    <span className="font-semibold text-fuchsia-300">
                      {player.label}
                    </span>
                  </div>
                ))
              ) : (
                <div className="border-t border-slate-800 px-4 py-10 text-center text-sm text-slate-400">
                  No arena sessions recorded yet. Complete a run to populate the
                  leaderboard.
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-fuchsia-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(217,70,239,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <FontAwesomeIcon icon={faMedal} className="text-fuchsia-300" />
                Rank Signals
              </h2>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  <p className="font-semibold text-cyan-300">Score Power</p>
                  <p className="mt-1 text-slate-400">
                    Total points earned during a session.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  <p className="font-semibold text-fuchsia-300">
                    Accuracy Stability
                  </p>
                  <p className="mt-1 text-slate-400">
                    Precision based on puzzles actually seen.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  <p className="font-semibold text-emerald-300">
                    Streak Pressure
                  </p>
                  <p className="mt-1 text-slate-400">
                    Consecutive correct answers under time stress.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <FontAwesomeIcon icon={faBrain} className="text-cyan-300" />
                Agent Note
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This leaderboard is the front shell for the competitive system.
                Next, we will connect it to recorded session data so the board
                reflects actual arena performance.
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="text-emerald-300"
                />
                Future Expansion
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>Daily challenge rankings</li>
                <li>Friends and team boards</li>
                <li>Adaptive skill tiers</li>
                <li>Tournament ladders</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default LeaderboardPage;
