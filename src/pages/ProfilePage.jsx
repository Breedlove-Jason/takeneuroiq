import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserAstronaut,
  faClockRotateLeft,
  faBrain,
  faChartLine,
  faBolt,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import { getSessions, clearSessions } from '../game/sessionTracker';
import { getPlayerName, setPlayerName } from '../game/playerIdentity';

function formatSessionTime(timestamp) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function ProfilePage() {
  const [playerName, setPlayerNameState] = useState(() => getPlayerName());
  const [nameInput, setNameInput] = useState(() => getPlayerName());
  const [nameSaved, setNameSaved] = useState(false);
  const [sessions, setSessions] = useState(() => [...getSessions()]);

  const recentSessions = [...sessions].slice(-5).reverse();

  const normalizedNameInput = nameInput.trim();
  const canSavePlayerName =
    normalizedNameInput.length > 0 && normalizedNameInput !== playerName;
  const bestScore =
    sessions.length > 0
      ? Math.max(...sessions.map((session) => session.score ?? 0))
      : 0;

  const getSessionAccuracy = (session) => {
    if (
      typeof session.puzzlesAttempted === 'number' &&
      session.puzzlesAttempted > 0 &&
      typeof session.puzzlesCorrect === 'number'
    ) {
      return Math.round(
        (session.puzzlesCorrect / session.puzzlesAttempted) * 100,
      );
    }

    return session.accuracy ?? 0;
  };

  const bestStreak =
    sessions.length > 0
      ? Math.max(
          ...sessions.map(
            (session) => session.bestStreak ?? session.streak ?? 0,
          ),
        )
      : 0;

  const currentRank = sessions.length > 0 ? 'Active' : 'Unranked';
  const totalSessions = sessions.length;
  const totalPuzzlesSolved = sessions.reduce(
    (sum, session) =>
      sum + (session.puzzlesCorrect ?? session.correctAnswers ?? 0),
    0,
  );
  const totalPuzzlesAttempted = sessions.reduce(
    (sum, session) =>
      sum + (session.puzzlesAttempted ?? session.puzzlesSeen ?? 0),
    0,
  );

  const solveRate =
    totalPuzzlesAttempted > 0
      ? Math.round((totalPuzzlesSolved / totalPuzzlesAttempted) * 100)
      : 0;

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
          sessions.reduce((sum, s) => {
            if (
              typeof s.puzzlesAttempted === 'number' &&
              s.puzzlesAttempted > 0 &&
              typeof s.puzzlesCorrect === 'number'
            ) {
              return (
                sum + Math.round((s.puzzlesCorrect / s.puzzlesAttempted) * 100)
              );
            }

            return sum + (s.accuracy ?? 0);
          }, 0) / sessions.length,
        )
      : 0;
  const performanceInsight = (() => {
    if (sessions.length === 0) {
      return 'Complete your first arena run to begin neural performance analysis.';
    }

    const insights = [];

    if (averageAccuracy >= 90) {
      insights.push(
        'Precision is running above baseline, indicating strong pattern recognition control.',
      );
    } else if (averageAccuracy >= 75) {
      insights.push(
        'Accuracy is stable, with room to sharpen precision under pressure.',
      );
    } else {
      insights.push(
        'Precision remains an active improvement area and may benefit from slower, more controlled runs.',
      );
    }

    if (solveRate >= 90) {
      insights.push(
        'Solve rate is elite, showing highly efficient puzzle conversion across attempts.',
      );
    } else if (solveRate >= 75) {
      insights.push(
        'Solve rate is healthy, suggesting a solid balance between output and precision.',
      );
    } else {
      insights.push(
        'Solve rate is still developing, indicating that accuracy under active attempt volume can improve further.',
      );
    }

    if (bestStreak >= 10) {
      insights.push(
        'Momentum resilience is strong, with extended streaks sustained during timed play.',
      );
    } else if (bestStreak >= 5) {
      insights.push(
        'Streak control is forming, though longer momentum chains are still developing.',
      );
    } else {
      insights.push(
        'Momentum breaks quickly, suggesting pressure handling is still stabilizing.',
      );
    }

    if (averageScore >= 1000) {
      insights.push(
        'Scoring efficiency is trending high, pointing to strong processing speed and execution.',
      );
    } else if (averageScore >= 600) {
      insights.push('Scoring output is building steadily across sessions.');
    } else {
      insights.push(
        'Scoring output is still early-stage, with growth expected as consistency improves.',
      );
    }

    return insights.join(' ');
  })();
  const scoreTrend = (() => {
    if (sessions.length < 2) {
      return 'Not enough sessions yet to detect a score trend.';
    }

    const recentScores = recentSessions
      .slice()
      .reverse()
      .map((session) => session.score ?? 0);

    const firstScore = recentScores[0];
    const lastScore = recentScores[recentScores.length - 1];
    const difference = lastScore - firstScore;

    if (difference >= 100) {
      return 'Score trend rising. Recent runs show stronger scoring output.';
    }

    if (difference <= -100) {
      return 'Score trend dipping. Recent sessions suggest reduced scoring efficiency.';
    }

    return 'Score trend stable. Performance output is holding near current baseline.';
  })();
  const accuracyTrend = (() => {
    if (sessions.length < 2) {
      return 'Not enough sessions yet to detect an accuracy trend.';
    }

    const recentAccuracies = recentSessions
      .slice()
      .reverse()
      .map((session) => session.accuracy ?? 0);

    const firstAccuracy = recentAccuracies[0];
    const lastAccuracy = recentAccuracies[recentAccuracies.length - 1];
    const difference = lastAccuracy - firstAccuracy;

    if (difference >= 5) {
      return 'Accuracy trend rising. Precision control is improving across recent runs.';
    }

    if (difference <= -5) {
      return 'Accuracy trend slipping. Precision consistency is dropping under current conditions.';
    }

    return 'Accuracy trend stable. Precision output is holding near current baseline.';
  })();

  const streakStability = (() => {
    if (sessions.length < 2) {
      return 'Not enough sessions yet to detect streak stability.';
    }

    const recentStreaks = recentSessions
      .slice()
      .reverse()
      .map((session) => session.bestStreak ?? session.streak ?? 0);

    const minStreak = Math.min(...recentStreaks);
    const maxStreak = Math.max(...recentStreaks);
    const spread = maxStreak - minStreak;

    if (spread <= 2) {
      return 'Streak stability strong. Cognitive momentum is holding consistently across recent runs.';
    }

    if (spread >= 6) {
      return 'Streak stability volatile. Momentum is fluctuating noticeably between sessions.';
    }

    return 'Streak stability moderate. Momentum control is forming but not yet fully consistent.';
  })();

  const scoreBarMax = Math.max(bestScore, 1500);
  const bestScorePercent = Math.min((bestScore / scoreBarMax) * 100, 100);
  const averageScorePercent = Math.min((averageScore / scoreBarMax) * 100, 100);
  const averageAccuracyPercent = Math.min(averageAccuracy, 100);
  const bestStreakPercent = Math.min((bestStreak / 20) * 100, 100);
  const handleResetData = () => {
    const confirmed = window.confirm(
      'Clear all TakeNeuroIQ session history and leaderboard data?',
    );

    if (!confirmed) return;

    clearSessions();
    setSessions([]);
  };

  const handleSavePlayerName = () => {
    if (!canSavePlayerName) return;

    const savedName = setPlayerName(nameInput);
    setPlayerNameState(savedName);
    setNameInput(savedName);
    setNameSaved(true);
  };
  const handlePlayerNameKeyDown = (event) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();

    if (!canSavePlayerName) return;

    handleSavePlayerName();
  };

  useEffect(() => {
    if (!nameSaved) return;

    const timeout = window.setTimeout(() => {
      setNameSaved(false);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [nameSaved]);

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

            <div className="flex flex-col items-end gap-3">
              <div className="rounded-2xl border border-cyan-400/20 bg-slate-800/70 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Current Rank
                </p>
                <p className="mt-2 text-3xl font-bold text-cyan-300">
                  {currentRank}
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetData}
                className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-300 transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/20 hover:text-fuchsia-200"
              >
                Reset Session Data
              </button>
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
                    {playerName}
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(event) => setNameInput(event.target.value)}
                      onKeyDown={handlePlayerNameKeyDown}
                      placeholder="Enter player name"
                      className="w-full rounded-xl border border-cyan-400/20 bg-slate-900/80 px-4 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
                    />
                    <button
                      type="button"
                      onClick={handleSavePlayerName}
                      disabled={!canSavePlayerName}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        canSavePlayerName
                          ? 'border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:border-cyan-300/50 hover:bg-cyan-500/20 hover:text-cyan-200'
                          : 'cursor-not-allowed border border-slate-700 bg-slate-800/60 text-slate-500'
                      }`}
                    >
                      Save Name
                    </button>
                  </div>

                  {nameSaved && (
                    <p className="mt-2 text-sm font-medium text-emerald-300">
                      Player name saved.
                    </p>
                  )}
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

                    <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Puzzles Solved
                      </p>
                      <p className="mt-2 text-2xl font-bold text-emerald-300">
                        {totalPuzzlesSolved}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Total Attempts
                      </p>
                      <p className="mt-2 text-2xl font-bold text-cyan-300">
                        {totalPuzzlesAttempted}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Solve Rate
                      </p>
                      <p className="mt-2 text-2xl font-bold text-fuchsia-300">
                        {solveRate}%
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
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1.2fr_1.2fr] bg-slate-800/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span>Mode</span>
                  <span>Score</span>
                  <span>Accuracy</span>
                  <span>Streak</span>
                  <span>Label</span>
                  <span>When</span>
                </div>

                {recentSessions.length > 0 ? (
                  recentSessions.map((session, index) => (
                    <div
                      key={`${session.score ?? 0}-${index}`}
                      className="grid grid-cols-[1fr_1fr_1fr_1fr_1.2fr_1.2fr] items-center border-t border-slate-800 px-4 py-4 text-sm text-slate-200 transition duration-200 hover:bg-slate-800/70"
                    >
                      <span className="font-semibold text-white">
                        {session.mode || 'Pattern Rush'}
                      </span>
                      <span>{session.score ?? 0}</span>
                      <span>{getSessionAccuracy(session)}%</span>
                      <span>{session.bestStreak ?? session.streak ?? 0}</span>
                      <span className="text-fuchsia-300 font-semibold">
                        {session.label}
                      </span>
                      <span className="text-slate-400">
                        {formatSessionTime(session.timestamp)}
                      </span>
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

            <div className="rounded-3xl border border-fuchsia-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(217,70,239,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="text-fuchsia-300"
                />
                Performance Snapshot
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Best Score</span>
                    <span className="font-semibold text-cyan-300">
                      {bestScore}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                      style={{ width: `${bestScorePercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Average Score</span>
                    <span className="font-semibold text-fuchsia-300">
                      {averageScore}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-fuchsia-400 transition-all duration-500"
                      style={{ width: `${averageScorePercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Average Accuracy</span>
                    <span className="font-semibold text-emerald-300">
                      {averageAccuracy}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                      style={{ width: `${averageAccuracyPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Best Streak</span>
                    <span className="font-semibold text-yellow-300">
                      {bestStreak}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                      style={{ width: `${bestStreakPercent}%` }}
                    />
                  </div>
                </div>
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
