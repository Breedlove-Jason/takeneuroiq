import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserAstronaut,
  faClockRotateLeft,
  faBrain,
  faChartLine,
  faBolt,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import { getSessions } from '../game/sessionTracker';

function ProfilePage() {
  const sessions = getSessions();
  const recentSessions = [...sessions].slice(-5).reverse();

  const bestScore =
    sessions.length > 0
      ? Math.max(...sessions.map((session) => session.score ?? 0))
      : 0;

  const bestStreak =
    sessions.length > 0
      ? Math.max(
          ...sessions.map(
            (session) => session.bestStreak ?? session.streak ?? 0,
          ),
        )
      : 0;

  const currentRank = sessions.length > 0 ? 'Active' : 'Unranked';
  return (
    <section className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-cyan-400/30 bg-slate-900/70 p-6 shadow-[0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-300">
                <FontAwesomeIcon icon={faBolt} />
                Neural Identity
              </p>

              <h1 className="text-3xl font-extrabold tracking-tight text-cyan-300 md:text-5xl">
                Player Profile
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Your performance hub for session history, cognitive growth, and
                future adaptive analysis. This page will evolve into a
                personalized command center for competitive brain training.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-slate-800/70 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Current Rank
              </p>
              <p className="mt-2 text-3xl font-bold text-cyan-300">
                {currentRank}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <FontAwesomeIcon
                  icon={faUserAstronaut}
                  className="text-cyan-300"
                />
                Identity Core
              </h2>

              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Player
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Arena Runner
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Best Score
                    </p>
                    <p className="mt-2 text-2xl font-bold text-cyan-300">
                      {bestScore}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Best Streak
                    </p>
                    <p className="mt-2 text-2xl font-bold text-emerald-300">
                      {bestStreak}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Agent Summary
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Performance analysis will appear here as the session system
                    expands. Future versions will surface strengths, weakness
                    patterns, and training recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-fuchsia-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(217,70,239,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <FontAwesomeIcon icon={faBrain} className="text-fuchsia-300" />
                Cognitive Tracks
              </h2>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  Pattern recognition
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  Reaction consistency
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  Working memory
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  Adaptive pressure handling
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <FontAwesomeIcon
                  icon={faClockRotateLeft}
                  className="text-cyan-300"
                />
                Recent Sessions
              </h2>

              <div className="mt-4 rounded-2xl border border-slate-700/60">
                <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] bg-slate-800/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span>Mode</span>
                  <span>Score</span>
                  <span>Accuracy</span>
                  <span>Streak</span>
                </div>

                {recentSessions.length > 0 ? (
                  recentSessions.map((session, index) => (
                    <div
                      key={`${session.score ?? 0}-${index}`}
                      className="grid grid-cols-[1.2fr_1fr_1fr_1fr] items-center border-t border-slate-800 px-4 py-4 text-sm text-slate-200 transition duration-200 hover:bg-slate-800/70"
                    >
                      <span className="font-semibold text-white">
                        {session.mode || 'Pattern Rush'}
                      </span>
                      <span>{session.score ?? 0}</span>
                      <span>{session.accuracy ?? 0}%</span>
                      <span>{session.bestStreak ?? session.streak ?? 0}</span>
                    </div>
                  ))
                ) : (
                  <div className="border-t border-slate-800 px-4 py-10 text-center text-sm text-slate-400">
                    No recorded sessions yet. Complete a run to build your profile history.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-emerald-400/20 bg-slate-900/70 p-5 backdrop-blur-md">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <FontAwesomeIcon
                    icon={faChartLine}
                    className="text-emerald-300"
                  />
                  Progression
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  This panel will later show score trends, accuracy trends, and
                  consistency patterns across multiple sessions.
                </p>
              </div>

              <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 backdrop-blur-md">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <FontAwesomeIcon
                    icon={faLayerGroup}
                    className="text-cyan-300"
                  />
                  Adaptive Layer
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Future versions will use performance data to suggest challenge
                  types, identify strengths, and shape dynamic difficulty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
