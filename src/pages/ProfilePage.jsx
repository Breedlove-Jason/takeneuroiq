import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserAstronaut,
  faClockRotateLeft,
  faBrain,
  faChartLine,
  faBolt,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { getPlayerName, setPlayerName } from "../game/playerIdentity";
import { useSessionData } from "../hooks/useSessionData";
import ProfileAnalytics, {
  IdentityCoreStats,
  PerformanceSnapshot,
  AgentSummary,
} from "../components/ProfileAnalytics";
import { buildSessionAnalytics } from "../analytics/sessionAnalytics";

function formatSessionTime(timestamp) {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function ProfilePage() {
  const [playerName, setPlayerNameState] = useState(() => getPlayerName());
  const [nameInput, setNameInput] = useState(() => getPlayerName());
  const [nameSaved, setNameSaved] = useState(false);
  const { sessions, resetSessions } = useSessionData();
  const analytics = buildSessionAnalytics(sessions);
  const chartContainerRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });

  const {
    cognitiveTracks = {
      patternRecognition: 0,
      focusStability: 0,
      processingSpeed: 0,
      consistency: 0,
    },
    neuralTrend = { direction: "neutral", change: 0 },
    pressureState = { state: "neutral", label: "Stable Load", detail: "" },
    adaptiveDifficulty = { state: "steady", label: "Steady Mode" },
    coachingInsight = { summary: "", detail: "" },
  } = analytics || {};

  const neuralTrendLabelMap = {
    rising: "Improving",
    steady: "Stable",
    falling: "Needs Recovery",
    neutral: "Neutral",
  };

  const pressureStateDetailMap = {
    "locked-in": "Your recent sessions show strong control under pressure.",
    "under-pressure":
      "Your recent sessions suggest strain is affecting consistency.",
    stable: "Your recent sessions are balanced and controlled.",
    neutral: "Complete more sessions to reveal your pressure profile.",
  };

  const adaptiveDifficultyDetailMap = {
    challenge: "You are ready for harder patterns and faster escalation.",
    steady: "Your current difficulty pacing looks well matched.",
    recover: "A lighter difficulty window may help rebuild momentum.",
  };

  const neuralTrendLabel =
    neuralTrendLabelMap[neuralTrend.direction] ?? "Neutral";
  const pressureStateDetail =
    pressureStateDetailMap[pressureState.state] ??
    "Complete more sessions to reveal your pressure profile.";
  const adaptiveDifficultyDetail =
    adaptiveDifficultyDetailMap[adaptiveDifficulty.state] ??
    "Keep training to generate a stronger adaptive signal.";

  const precisionScore = cognitiveTracks.patternRecognition ?? 0;
  const momentumScore = cognitiveTracks.focusStability ?? 0;
  const throughputScore = cognitiveTracks.processingSpeed ?? 0;
  const consistencyScore = cognitiveTracks.consistency ?? 0;

  const radarData = [
    { skill: "Precision", value: precisionScore },
    { skill: "Momentum", value: momentumScore },
    { skill: "Throughput", value: throughputScore },
    { skill: "Consistency", value: consistencyScore },
  ];

  const recentSessions = [...sessions].slice(-5).reverse();

  // Helper to calculate session accuracy for the table and trends.
  const getSessionAccuracy = (session) => {
    if (
      typeof session.puzzlesAttempted === "number" &&
      session.puzzlesAttempted > 0 &&
      typeof session.puzzlesCorrect === "number"
    ) {
      return Math.round(
        (session.puzzlesCorrect / session.puzzlesAttempted) * 100,
      );
    }
    return session.accuracy ?? 0;
  };

  const normalizedNameInput = nameInput.trim();
  const canSavePlayerName =
    normalizedNameInput.length > 0 && normalizedNameInput !== playerName;

  const currentRank = sessions.length > 0 ? "Active" : "Unranked";

  const handleResetData = () => {
    const confirmed = window.confirm(
      "Clear all TakeNeuroIQ session history and leaderboard data?",
    );

    if (!confirmed) return;

    resetSessions();
  };

  const handleSavePlayerName = () => {
    if (!canSavePlayerName) return;

    const savedName = setPlayerName(nameInput);
    setPlayerNameState(savedName);
    setNameInput(savedName);
    setNameSaved(true);
  };
  const handlePlayerNameKeyDown = (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    if (!canSavePlayerName) return;

    handleSavePlayerName();
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setNameSaved(false);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [nameSaved]);

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (!chartContainer) return undefined;

    const updateChartDimensions = () => {
      const nextWidth = chartContainer.clientWidth;
      const nextHeight = chartContainer.clientHeight;

      setChartDimensions((previousDimensions) => {
        if (
          previousDimensions.width === nextWidth &&
          previousDimensions.height === nextHeight
        ) {
          return previousDimensions;
        }

        return { width: nextWidth, height: nextHeight };
      });
    };

    updateChartDimensions();

    const observer = new ResizeObserver(updateChartDimensions);
    observer.observe(chartContainer);

    return () => observer.disconnect();
  }, []);

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
                <p className="mt-2 text-3xl font-bold text-indigo-400">
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
                          ? "border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:border-cyan-300/50 hover:bg-cyan-500/20 hover:text-cyan-200"
                          : "cursor-not-allowed border border-slate-700 bg-slate-800/60 text-slate-500"
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

                <IdentityCoreStats />

                <AgentSummary coachingInsight={coachingInsight} />
              </div>
            </div>

            <div className="rounded-3xl border border-fuchsia-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(217,70,239,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <FontAwesomeIcon icon={faBrain} className="text-fuchsia-300" />
                Cognitive Tracks
              </h2>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-cyan-300">
                      Pattern recognition
                    </p>
                    <span className="text-lg font-bold text-white">
                      {cognitiveTracks.patternRecognition}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-fuchsia-300">
                      Focus stability
                    </p>
                    <span className="text-lg font-bold text-white">
                      {cognitiveTracks.focusStability}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-emerald-300">
                      Processing speed
                    </p>
                    <span className="text-lg font-bold text-white">
                      {cognitiveTracks.processingSpeed}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-yellow-300">Consistency</p>
                    <span className="text-lg font-bold text-white">
                      {cognitiveTracks.consistency}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {pressureStateDetail}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/40 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
                Cognitive Analytics
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Track performance, neural growth, and recent training behavior.
              </p>
            </div>

            <PerformanceSnapshot />

            <ProfileAnalytics
              cognitiveTracks={cognitiveTracks}
              neuralTrend={neuralTrend}
              pressureState={pressureState}
              adaptiveDifficulty={adaptiveDifficulty}
              coachingInsight={coachingInsight}
            />

            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <FontAwesomeIcon icon={faBrain} className="text-cyan-300" />
                Cognitive Skill Signals
              </h2>

              <div
                ref={chartContainerRef}
                className="mt-5 h-80 min-h-[20rem] w-full min-w-0"
              >
                {chartDimensions.width > 0 && chartDimensions.height > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                    minHeight={320}
                  >
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(148, 163, 184, 0.25)" />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fill: "#cbd5e1", fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: "#64748b", fontSize: 10 }}
                      />
                      <Radar
                        name="Cognitive Profile"
                        dataKey="value"
                        stroke="#a855f7"
                        fill="#a855f7"
                        fillOpacity={0.35}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-2xl bg-slate-800/60" />
                )}
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Precision</span>
                    <span className="font-semibold text-cyan-400">
                      {precisionScore}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-cyan-400 transition-all duration-500`}
                      style={{ width: `${precisionScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Momentum</span>
                    <span className="font-semibold text-fuchsia-400">
                      {momentumScore}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-fuchsia-400 transition-all duration-500`}
                      style={{ width: `${momentumScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Throughput</span>
                    <span className="font-semibold text-emerald-400">
                      {throughputScore}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-emerald-400 transition-all duration-500`}
                      style={{ width: `${throughputScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Consistency</span>
                    <span className="font-semibold text-amber-400">
                      {consistencyScore}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-amber-400 transition-all duration-500`}
                      style={{ width: `${consistencyScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <FontAwesomeIcon
                  icon={faClockRotateLeft}
                  className="text-cyan-300"
                />
                Recent Sessions
              </h2>

              <div className="mt-4 rounded-2xl border border-slate-700/60">
                <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr_1.4fr_1fr] bg-slate-800/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span>Mode</span>
                  <span>Score</span>
                  <span>Accuracy</span>
                  <span>Streak</span>
                  <span>Run Data</span>
                  <span>When</span>
                </div>{" "}
                {recentSessions.length > 0 ? (
                  recentSessions.map((session, index) => (
                    <div
                      key={`${session.score ?? 0}-${index}`}
                      className="grid grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr_1.4fr_1fr] items-center border-t border-slate-800 px-4 py-4 text-sm text-slate-200 transition duration-200 hover:bg-slate-800/70"
                    >
                      <span className="font-semibold text-white">
                        {session.mode || "Pattern Rush"}
                      </span>
                      <span>{session.score ?? 0}</span>
                      <span>{getSessionAccuracy(session)}%</span>
                      <span>{session.bestStreak ?? session.streak ?? 0}</span>
                      <div className="flex flex-col">
                        <span className="font-semibold text-fuchsia-300">
                          {session.label}
                        </span>
                        <span className="font-bold text-yellow-300">
                          NP: {session.neuralPower ?? 0}
                        </span>
                      </div>
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
                  {neuralTrendLabel}
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
                  {adaptiveDifficultyDetail}
                </p>
              </div>

              <div className="rounded-3xl border border-fuchsia-400/20 bg-slate-900/70 p-5 backdrop-blur-md">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <FontAwesomeIcon icon={faBolt} className="text-fuchsia-300" />
                  Momentum
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {pressureStateDetail}
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
