import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserAstronaut,
  faClockRotateLeft,
  faBrain,
  faChartLine,
  faBolt,
  faLayerGroup,
  faWaveSquare,
  faShieldHalved,
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

const adaptiveStateHistoryLabelMap = {
  recover: "Recovery Mode",
  steady: "Stable Load",
  challenge: "Challenge Mode",
};

const adaptiveStateHistoryColorMap = {
  recover: "text-yellow-300",
  steady: "text-cyan-300",
  challenge: "text-fuchsia-300",
};

const recentSessionsGridColumns =
  "grid-cols-[minmax(7rem,1.25fr)_minmax(4.5rem,0.8fr)_minmax(4rem,0.7fr)_minmax(4.5rem,0.8fr)_minmax(6.75rem,1.2fr)_minmax(7rem,1fr)_minmax(5.5rem,0.9fr)]";

function formatNeuralTrendLabel(direction) {
  switch (direction) {
    case "improving":
      return "Improving";
    case "declining":
      return "Needs Recovery";
    case "stable":
      return "Stable";
    default:
      return "Neutral";
  }
}

function ProfilePage() {
  const [playerName, setPlayerNameState] = useState(() => getPlayerName());
  const [nameInput, setNameInput] = useState(() => getPlayerName());
  const [nameSaved, setNameSaved] = useState(false);
  const { sessions, resetSessions } = useSessionData();
  const analytics = buildSessionAnalytics(sessions) ?? {};

  const navigate = useNavigate();
  const handleStartRecommendedSession = () => {
    navigate("/arena", {
      state: {
        recommendedSession: {
          source: "profile-adaptive-coaching",
          adaptiveState: latestAdaptiveState || "steady",
          recommendation: adaptiveRecommendation,
        },
      },
    });
  };
  const {
    cognitiveTracks = {
      patternRecognition: 0,
      focusStability: 0,
      processingSpeed: 0,
      consistency: 0,
    },
    neuralTrend = { direction: "neutral", change: 0 },
    pressureState = { state: "neutral", label: "Stable Load", detail: "" },
    adaptiveDifficulty = {
      state: "steady",
      label: "Steady Mode",
      description: "",
      targetDifficulty: "medium",
    },
    coachingInsight = { headline: "", summary: "", focus: "", detail: "" },
  } = analytics;

  const neuralTrendLabel = formatNeuralTrendLabel(neuralTrend.direction);
  const pressureStateDetail =
    pressureState.detail ??
    "Complete more sessions to reveal your pressure profile.";
  const adaptiveDifficultyDetail =
    adaptiveDifficulty.description ??
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

  const latestAdaptiveState = useMemo(() => {
    if (!sessions || sessions.length === 0) return null;

    const recentAdaptiveSession = [...sessions]
      .slice()
      .reverse()
      .find((session) => session?.liveAdaptiveDifficulty?.state);

    return recentAdaptiveSession?.liveAdaptiveDifficulty?.state || null;
  }, [sessions]);

  const adaptiveInsightSubtextMap = {
    challenge:
      "Recent session behavior shows the system increasing difficulty in response to stronger performance.",
    steady:
      "Recent session behavior shows stable control, balanced output, and manageable pressure.",
    recover:
      "Recent session behavior shows signs of strain, so the system is easing intensity to protect consistency.",
    default: "Adaptive feedback updates as more session behavior is recorded.",
  };

  const adaptiveInsightStyles = {
    challenge: {
      border: "border-violet-500/30",
      glow: "shadow-violet-500/10",
      label: "text-violet-300",
    },
    steady: {
      border: "border-cyan-500/20",
      glow: "shadow-cyan-500/10",
      label: "text-cyan-300",
    },
    recover: {
      border: "border-amber-500/30",
      glow: "shadow-amber-500/10",
      label: "text-amber-300",
    },
    default: {
      border: "border-cyan-500/20",
      glow: "shadow-cyan-500/10",
      label: "text-cyan-300",
    },
  };

  const adaptiveInsightBadges = {
    challenge: {
      text: "Challenge",
      className: "bg-violet-500/15 text-violet-200 border border-violet-400/30",
    },
    steady: {
      text: "Steady",
      className: "bg-cyan-500/15 text-cyan-200 border border-cyan-400/30",
    },
    recover: {
      text: "Recovery",
      className: "bg-amber-500/15 text-amber-200 border border-amber-400/30",
    },
    default: {
      text: "Adaptive",
      className: "bg-slate-500/15 text-slate-200 border border-slate-400/20",
    },
  };

  const adaptiveInsightIcons = {
    challenge: faBolt,
    steady: faWaveSquare,
    recover: faShieldHalved,
    default: faWaveSquare,
  };

  const adaptiveInsightBadge =
    adaptiveInsightBadges[latestAdaptiveState] ?? adaptiveInsightBadges.default;

  const adaptiveInsightSubtext =
    adaptiveInsightSubtextMap[latestAdaptiveState] ||
    adaptiveInsightSubtextMap.default;

  const adaptiveInsightIcon =
    adaptiveInsightIcons[latestAdaptiveState] || adaptiveInsightIcons.default;
  const adaptiveInsightTone =
    adaptiveInsightStyles[latestAdaptiveState] ?? adaptiveInsightStyles.default;

  const adaptiveInsightTrend = useMemo(() => {
    if (!sessions || sessions.length === 0)
      return "No recent adaptive pattern yet.";

    const recentStates = [...sessions]
      .slice(-5)
      .map((session) => session?.liveAdaptiveDifficulty?.state)
      .filter(Boolean);

    if (recentStates.length === 0) {
      return "No recent adaptive pattern yet.";
    }

    const labelMap = {
      recover: "Recovery",
      steady: "Steady",
      challenge: "Challenge",
    };

    const labeledStates = recentStates.map((state) => labelMap[state] || state);

    const compressed = [];
    for (const state of labeledStates) {
      const last = compressed[compressed.length - 1];

      if (last && last.label === state) {
        last.count += 1;
      } else {
        compressed.push({ label: state, count: 1 });
      }
    }

    return compressed
      .map((item) =>
        item.count > 1 ? `${item.label} × ${item.count}` : item.label,
      )
      .join(" → ");
  }, [sessions]);

  const adaptiveInsight = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return "Complete more sessions to unlock adaptive insights.";
    }

    const recentAdaptiveSessions = [...sessions]
      .slice(-5)
      .filter((session) => session?.liveAdaptiveDifficulty?.state);

    if (recentAdaptiveSessions.length === 0) {
      return "Adaptive insight will appear once more session difficulty patterns are recorded.";
    }

    const states = recentAdaptiveSessions.map(
      (session) => session.liveAdaptiveDifficulty.state,
    );

    const counts = states.reduce(
      (acc, state) => {
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      },
      { recover: 0, steady: 0, challenge: 0 },
    );

    const latestState = states[states.length - 1];
    const previousState = states.length > 1 ? states[states.length - 2] : null;

    if (counts.challenge >= 3) {
      return "You're leaning into higher challenge and holding your ground. Keep pushing.";
    }

    if (counts.recover >= 3) {
      return "Your system is asking for a reset. Pull back slightly and rebuild your rhythm.";
    }

    if (counts.steady >= 3) {
      return "You're locked into a steady rhythm. This is where real growth compounds.";
    }

    if (previousState === "recover" && latestState === "steady") {
      return "You're recovering well and settling back into control.";
    }

    if (previousState === "steady" && latestState === "challenge") {
      return "You're stepping up. The system sees you ready for more.";
    }

    if (previousState === "challenge" && latestState === "recover") {
      return "You pushed hard. Now your system is dialing things back to recover.";
    }

    return "Your pattern is still forming, but your system is actively adapting to your performance.";
  }, [sessions]);

  const adaptiveTensionInsight = useMemo(() => {
    if (!latestAdaptiveState || !neuralTrend) return null;

    const trend = (neuralTrend.direction ?? "").toLowerCase();

    if (latestAdaptiveState === "challenge" && trend.includes("declin")) {
      return {
        text: "You're pushing into higher difficulty, but performance is starting to strain. Consider stabilizing before pushing further.",
        className: "text-rose-300/80",
      };
    }

    if (latestAdaptiveState === "recover" && trend.includes("improv")) {
      return {
        text: "Recovery is working. Your system is regaining stability and control.",
        className: "text-emerald-300/80",
      };
    }

    if (latestAdaptiveState === "steady" && trend.includes("improv")) {
      return {
        text: "You're building strength in a stable zone. This is ideal for long-term growth.",
        className: "text-cyan-300/80",
      };
    }

    return null;
  }, [latestAdaptiveState, neuralTrend]);
  const adaptiveActionLabels = {
    challenge: "Push Higher Difficulty",
    steady: "Maintain Your Rhythm",
    recover: "Run Recovery Session",
    default: "Start Session",
  };
  const adaptiveActionLabel =
    adaptiveActionLabels[latestAdaptiveState] || adaptiveActionLabels.default;

  const adaptiveRecommendation = useMemo(() => {
    if (!latestAdaptiveState) {
      return "Complete more sessions to unlock personalized coaching recommendations.";
    }

    const trend =
      typeof neuralTrend === "string" ? neuralTrend.toLowerCase() : "";

    if (latestAdaptiveState === "challenge" && trend.includes("declin")) {
      return "Run a shorter session and prioritize accuracy before pushing intensity higher again.";
    }

    if (latestAdaptiveState === "challenge") {
      return "Keep pushing, but stay sharp. Maintain accuracy as difficulty rises.";
    }

    if (latestAdaptiveState === "steady" && trend.includes("improv")) {
      return "You're in a strong growth zone. Try increasing difficulty and protecting consistency.";
    }

    if (latestAdaptiveState === "steady") {
      return "Stay in rhythm and aim for cleaner streaks before forcing a harder jump.";
    }

    if (latestAdaptiveState === "recover" && trend.includes("improv")) {
      return "Recovery is working. Keep the pace controlled and rebuild confidence through clean reps.";
    }

    if (latestAdaptiveState === "recover") {
      return "Slow down, focus on accuracy, and let your stability recover before chasing speed.";
    }

    return "Keep training. The system will sharpen its guidance as more performance data comes in.";
  }, [latestAdaptiveState, neuralTrend]);
  const adaptiveRecommendationTone = {
    challenge: "text-violet-200/90",
    steady: "text-cyan-200/90",
    recover: "text-amber-200/90",
    default: "text-slate-300/90",
  };
  const adaptiveRecommendationClass =
    adaptiveRecommendationTone[latestAdaptiveState] ||
    adaptiveRecommendationTone.default;

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
    setPlayerName(savedName);
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

                <IdentityCoreStats sessions={sessions} />

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

            <div
              key={latestAdaptiveState + adaptiveInsight}
              className={`mb-6 rounded-2xl border bg-slate-900/70 px-5 py-4 shadow-lg ${adaptiveInsightTone.border} ${adaptiveInsightTone.glow} transition-all duration-500 ease-out animate-[fadeIn_0.4s_ease-out]`}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div
                  className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${adaptiveInsightTone.label}`}
                >
                  <FontAwesomeIcon
                    icon={adaptiveInsightIcon}
                    className="text-sm opacity-90"
                    fixedWidth
                  />
                  <span>Adaptive Insight</span>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${adaptiveInsightBadge.className}`}
                >
                  {adaptiveInsightBadge.text}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-200 md:text-base">
                  {adaptiveInsight}
                </p>
                <p className="text-xs leading-6 text-slate-400 md:text-sm">
                  {adaptiveInsightSubtext}
                </p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 md:text-xs">
                  Recent pattern: {adaptiveInsightTrend}
                </p>
                {adaptiveTensionInsight && (
                  <p
                    className={`text-xs md:text-sm ${adaptiveTensionInsight.className}`}
                  >
                    {adaptiveTensionInsight.text}
                  </p>
                )}

                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:text-[11px]">
                    Recommended Next Focus
                  </div>
                </div>

                <p
                  className={`text-xs font-medium md:text-sm ${adaptiveRecommendationClass}`}
                >
                  {adaptiveRecommendation}
                </p>
                <button
                  onClick={handleStartRecommendedSession}
                  className="mt-1 inline-flex items-center rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-cyan-400/40 hover:text-white"
                >
                  {adaptiveActionLabel}
                </button>
              </div>
            </div>

            <PerformanceSnapshot sessions={sessions} />

            <ProfileAnalytics
              sessions={sessions}
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

              <div className="mt-5 h-80 min-h-[20rem] w-full min-w-0">
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
                {recentSessions.length > 0 ? (
                  <>
                    <div className="space-y-3 p-3 md:hidden">
                      {recentSessions.map((session, index) => {
                        const adaptiveStateKey =
                          session.liveAdaptiveDifficulty?.state ?? "steady";
                        const adaptiveStateLabel =
                          adaptiveStateHistoryLabelMap[adaptiveStateKey] ??
                          "Stable Load";
                        const adaptiveStateColor =
                          adaptiveStateHistoryColorMap[adaptiveStateKey] ??
                          "text-cyan-300";

                        return (
                          <div
                            key={`${session.score ?? 0}-${index}`}
                            className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-white">
                                  {session.mode || "Pattern Rush"}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                                  {formatSessionTime(session.timestamp)}
                                </p>
                              </div>
                              <span
                                className={`rounded-full border border-slate-700 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${adaptiveStateColor}`}
                              >
                                {adaptiveStateLabel}
                              </span>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-3">
                              <div className="rounded-xl bg-slate-950/40 p-3 text-center">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                  Score
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-100 tabular-nums">
                                  {session.score ?? 0}
                                </p>
                              </div>
                              <div className="rounded-xl bg-slate-950/40 p-3 text-center">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                  ACC
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-100 tabular-nums">
                                  {getSessionAccuracy(session)}%
                                </p>
                              </div>
                              <div className="rounded-xl bg-slate-950/40 p-3 text-center">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                  Streak
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-100 tabular-nums">
                                  {session.bestStreak ?? session.streak ?? 0}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 rounded-xl bg-slate-950/40 p-3">
                              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                Run Data
                              </p>
                              <p className="mt-1 truncate font-semibold text-fuchsia-300">
                                {session.label}
                              </p>
                              <p className="mt-1 text-sm font-bold text-yellow-300">
                                NP: {session.neuralPower ?? 0}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="hidden md:block">
                      <div
                        className={`grid ${recentSessionsGridColumns} items-center gap-x-4 bg-slate-800/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400`}
                      >
                        <span className="text-left">Mode</span>
                        <span className="text-center">Score</span>
                        <span className="text-center">ACC</span>
                        <span className="text-center">Streak</span>
                        <span className="text-left">Run Data</span>
                        <span className="text-left">Adaptive State</span>
                        <span className="text-left">When</span>
                      </div>

                      {recentSessions.map((session, index) => {
                        const adaptiveStateKey =
                          session.liveAdaptiveDifficulty?.state ?? "steady";
                        const adaptiveStateLabel =
                          adaptiveStateHistoryLabelMap[adaptiveStateKey] ??
                          "Stable Load";
                        const adaptiveStateColor =
                          adaptiveStateHistoryColorMap[adaptiveStateKey] ??
                          "text-cyan-300";

                        return (
                          <div
                            key={`${session.score ?? 0}-${index}`}
                            className={`grid ${recentSessionsGridColumns} items-center gap-x-4 border-t border-slate-800 px-4 py-4 text-sm text-slate-200 transition duration-200 hover:bg-slate-800/70`}
                          >
                            <span className="font-semibold text-white">
                              {session.mode || "Pattern Rush"}
                            </span>
                            <span className="text-center tabular-nums">
                              {session.score ?? 0}
                            </span>
                            <span className="text-center tabular-nums">
                              {getSessionAccuracy(session)}%
                            </span>
                            <span className="text-center tabular-nums">
                              {session.bestStreak ?? session.streak ?? 0}
                            </span>
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate font-semibold text-fuchsia-300">
                                {session.label}
                              </span>
                              <span className="font-bold text-yellow-300">
                                NP: {session.neuralPower ?? 0}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-semibold leading-tight ${adaptiveStateColor}`}
                            >
                              {adaptiveStateLabel}
                            </span>
                            <span className="text-sm text-slate-400">
                              {formatSessionTime(session.timestamp)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-10 text-center text-sm text-slate-400">
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
