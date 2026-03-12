import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserAstronaut,
  faClockRotateLeft,
  faBrain,
  faChartLine,
  faBolt,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { getSessions } from "../game/sessionTracker";

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

  const currentRank = sessions.length > 0 ? "Active" : "Unranked";
  const totalSessions = sessions.length;

  const averageScore =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + (s.score ?? 0), 0) /
            sessions.length,
        )
      : 0;

  const averageAccuracy =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + (s.accuracy ?? 0), 0) /
            sessions.length,
        )
      : 0;
  const performanceInsight = (() => {
    if (sessions.length === 0) {
      return "Complete your first arena run to begin neural performance analysis.";
    }

    if (averageAccuracy >= 90) {
      return "Precision stability detected. Your pattern recognition accuracy is exceeding baseline performance.";
    }

    if (bestStreak >= 10) {
      return "Streak resilience detected. You maintain cognitive momentum under time pressure.";
    }

    if (averageScore >= 800) {
      return "Strong scoring efficiency detected. Your neural processing speed is trending above baseline.";
    }

    return "Early performance signals detected. Continue running sessions to unlock deeper cognitive analysis.";
  })();
  const scoreTrend = (() => {
    if (sessions.length < 2) {
      return "Not enough sessions yet to detect a score trend.";
    }

    const recentScores = recentSessions
      .slice()
      .reverse()
      .map((session) => session.score ?? 0);

    const firstScore = recentScores[0];
    const lastScore = recentScores[recentScores.length - 1];
    const difference = lastScore - firstScore;

    if (difference >= 100) {
      return "Score trend rising. Recent runs show stronger scoring output.";
    }

    if (difference <= -100) {
      return "Score trend dipping. Recent sessions suggest reduced scoring efficiency.";
    }

    return "Score trend stable. Performance output is holding near current baseline.";
  })();
  const accuracyTrend = (() => {
    if (sessions.length < 2) {
      return "Not enough sessions yet to detect an accuracy trend.";
    }

    const recentAccuracies = recentSessions
      .slice()
      .reverse()
      .map((session) => session.accuracy ?? 0);

    const firstAccuracy = recentAccuracies[0];
    const lastAccuracy = recentAccuracies[recentAccuracies.length - 1];
    const difference = lastAccuracy - firstAccuracy;

    if (difference >= 5) {
      return "Accuracy trend rising. Precision control is improving across recent runs.";
    }

    if (difference <= -5) {
      return "Accuracy trend slipping. Precision consistency is dropping under current conditions.";
    }

    return "Accuracy trend stable. Precision output is holding near current baseline.";
  })();

  const streakStability = (() => {
    if (sessions.length < 2) {
      return "Not enough sessions yet to detect streak stability.";
    }

    const recentStreaks = recentSessions
      .slice()
      .reverse()
      .map((session) => session.bestStreak ?? session.streak ?? 0);

    const minStreak = Math.min(...recentStreaks);
    const maxStreak = Math.max(...recentStreaks);
    const spread = maxStreak - minStreak;

    if (spread <= 2) {
      return "Streak stability strong. Cognitive momentum is holding consistently across recent runs.";
    }

    if (spread >= 6) {
      return "Streak stability volatile. Momentum is fluctuating noticeably between sessions.";
    }

    return "Streak stability moderate. Momentum control is forming but not yet fully consistent.";
  })();

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

                    <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Avg Score
                      </p>
                      <p className="mt-2 text-2xl font-bold text-fuchsia-300">
                        {averageScore}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Avg Accuracy
                      </p>
                      <p className="mt-2 text-2xl font-bold text-cyan-300">
                        {averageAccuracy}%
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4 col-span-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Sessions Played
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {totalSessions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Agent Summary
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {performanceInsight}
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
                  <p className="font-semibold text-cyan-300">
                    Adaptive pressure handling
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {streakStability}
                  </p>
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
                        {session.mode || "Pattern Rush"}
                      </span>
                      <span>{session.score ?? 0}</span>
                      <span>{session.accuracy ?? 0}%</span>
                      <span>{session.bestStreak ?? session.streak ?? 0}</span>
                    </div>
                  ))
                ) : (
                  <div className="border-t border-slate-800 px-4 py-10 text-center text-sm text-slate-400">
                    No recorded sessions yet. Complete a run to build your
                    profile history.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-emerald-400/20 bg-slate-900/70 p-5 backdrop-blur-md">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <FontAwesomeIcon
                    icon={faChartLine}
                    className="text-emerald-300"
                  />
                  Progression
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {scoreTrend}
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
                  {accuracyTrend}
                </p>
              </div>

              <div className="rounded-3xl border border-fuchsia-400/20 bg-slate-900/70 p-5 backdrop-blur-md">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <FontAwesomeIcon icon={faBolt} className="text-fuchsia-300" />
                  Momentum
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {streakStability}
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
