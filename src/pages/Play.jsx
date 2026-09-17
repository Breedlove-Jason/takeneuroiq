// src/pages/Play.jsx
import SolidIcon from "../components/SolidIcon.jsx";
import { PLAY_DIRECTIONS } from "../game/playDirections.js";
import { Link } from "react-router-dom";
import {
  Cpu as microchipIcon,
  GridFour as borderAllIcon,
  Path as routeIcon,
  Star as starIcon,
  FlowArrow as diagramProjectIcon,
  Table as tableCellsIcon,
  Link as linkIcon,
  ArrowClockwise as rotateRightIcon,
  Target as bullseyeIcon,
  Shapes as shapesIcon,
  Stack as layerGroupIcon,
} from "@phosphor-icons/react";

/**
 * Play Page Component
 *
 * Provides a selection screen for different game modes (challenges).
 * Currently, all modes link to the 'Arena' where the primary 'Pattern Rush'
 * game logic resides.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.theme - Current UI theme ('cyber' or 'light').
 */
function Play({ theme }) {
  const isCyber = theme === "cyber";

  const challenges = [
    {
      icon: starIcon,
      puzzleType: "pattern_rush",
      title: "Pattern Rush",
      description:
        "Spot sequences, decode visual patterns, and react fast under pressure.",
      buttonText: "Launch Pattern Rush",
      skills: ["Patterns", "Visual"],
      accent: "#22d3ee",
    },
    {
      icon: rotateRightIcon,
      puzzleType: "rule_shift",
      title: "Rule Shift",
      description:
        "Adapt to changing rules mid-session. Maintain cognitive flexibility to keep scoring.",
      buttonText: "Launch Rule Shift",
      skills: ["Adaptation", "Rules"],
      accent: "#fb923c",
    },
    {
      icon: diagramProjectIcon,
      puzzleType: "sequence_sprint",
      title: "Sequence Sprint",
      description:
        "Read number patterns, predict what comes next, and respond under pressure.",
      buttonText: "Launch Sequence Sprint",
      skills: ["Memory", "Prediction"],
      accent: "#c084fc",
    },
    {
      icon: tableCellsIcon,
      puzzleType: "grid_recall",
      title: "Grid Recall",
      description:
        "Memorize complex neural patterns and reconstruct them from memory.",
      buttonText: "Launch Grid Recall",
      skills: ["Spatial", "Attention"],
      accent: "#a3e635",
    },
    {
      icon: borderAllIcon,
      puzzleType: "logic_grid",
      title: "Logic Grid",
      description:
        "Solve a missing cell by tracing structured reasoning across a matrix and inferring the hidden rule.",
      buttonText: "Launch Logic Grid",
      skills: ["Matrices", "Inference"],
      accent: "#fb7185",
    },
    {
      icon: routeIcon,
      puzzleType: "signal_path",
      title: "Signal Path",
      description:
        "Route the correct signal path through a compact network using constraint-driven logic.",
      buttonText: "Launch Signal Path",
      skills: ["Planning", "Routing"],
      accent: "#60a5fa",
    },
    {
      icon: rotateRightIcon,
      puzzleType: "spatial_rotation",
      title: "Spatial Rotation",
      description:
        "A source shape is shown first. Identify the correctly rotated match while ignoring distractors that look similar but are not the true rotation.",
      buttonText: "Launch Spatial Rotation",
      skills: ["Mental Rotation", "Visual Reasoning"],
      accent: "#facc15",
    },
    {
      icon: linkIcon,
      puzzleType: "memory_chain",
      title: "Memory Chain",
      description:
        "An ordered chain of values is shown with one hidden. Recall the missing value to maintain the sequence.",
      buttonText: "Launch Memory Chain",
      skills: ["Ordered Recall", "Working Memory"],
      accent: "#e879f9",
    },
    {
      icon: shapesIcon,
      puzzleType: "symbol_recall",
      title: "Symbol Recall",
      description:
        "A target symbol is shown first, then you must remember it and identify the same symbol from the answer options.",
      buttonText: "Launch Symbol Recall",
      skills: ["Visual Memory", "Rapid Recall"],
      accent: "#34d399",
    },
    {
      icon: microchipIcon,
      puzzleType: "logic_gate",
      title: "Logic Gate",
      description:
        "Resolve binary signal outputs through gate logic and deductive reasoning.",
      buttonText: "Launch Logic Gate",
      skills: ["Signals", "Binary Logic"],
      accent: "#ff7e67",
    },
    {
      icon: bullseyeIcon,
      puzzleType: "odd_one_matrix",
      title: "Odd One Matrix",
      description:
        "Almost every cell follows the same hidden rule. One cell breaks that rule \u2014 scan the matrix and select the odd one out.",
      buttonText: "Launch Odd One Matrix",
      skills: ["Pattern Filtering", "Visual Logic"],
      accent: "#a5b4fc",
    },
    {
      icon: layerGroupIcon,
      puzzleType: "number_weave",
      title: "Number Weave",
      description:
        "Two number rules are interwoven into one visible sequence. Infer the combined pattern and identify the missing value.",
      buttonText: "Launch Number Weave",
      skills: ["Number Reasoning", "Pattern Fusion"],
      accent: "#f0abfc",
    },
  ];

  return (
    <section className="px-5 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="relative mx-auto max-w-3xl text-center animate-fadeIn">
          {isCyber && (
            <div className="pointer-events-none absolute inset-x-10 -bottom-6 -top-8 -z-10 rounded-full bg-cyan-400/20 blur-[100px] animate-pulse" />
          )}
          <p
            className={`text-sm font-bold uppercase tracking-[0.25em] ${
              isCyber ? "text-cyan-300 text-glow-blue" : "text-cyan-600"
            }`}
          >
            Neural Challenge Console
          </p>

          <h1
            className={`mt-4 text-4xl font-bold md:text-5xl ${
              isCyber
                ? "bg-linear-to-r from-white via-cyan-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                : "text-slate-900"
            }`}
          >
            Choose your challenge arena
          </h1>

          <p
            className={`mt-6 text-lg font-medium leading-8 ${
              isCyber ? "text-slate-200" : "text-slate-600"
            }`}
          >
            Enter a fast-paced cognitive challenge designed to test how you
            think, react, and adapt under pressure.
          </p>
        </div>

        <div className="challenge-grid mt-14">
          {challenges.map((challenge, index) => (
            <article
              key={challenge.puzzleType}
              className={`challenge-card ${isCyber ? "" : "challenge-card-light"}`}
              style={{ "--arena-accent": challenge.accent }}
            >
              <div className="flex items-center justify-between">
                <span className="challenge-icon">
                  <SolidIcon icon={challenge.icon} />
                </span>
                <span className="text-xs font-bold tracking-[.18em] opacity-60">
                  {String(index + 1).padStart(2, "0")} / 12
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {challenge.title}
              </h2>
              <p className="challenge-description">{challenge.description}</p>
              <details className="challenge-directions">
                <summary>
                  How to play <span aria-hidden="true">+</span>
                </summary>
                <div className="pt-3 text-sm leading-6">
                  <p>{PLAY_DIRECTIONS[challenge.puzzleType]}</p>
                  <p className="mt-3">
                    Your 45-second session starts when you enter the arena.
                    Click or tap an answer, or use Tab and Enter. Build accuracy
                    first, then speed.
                  </p>
                </div>
              </details>
              <div className="flex flex-wrap content-start gap-2">
                {challenge.skills.map((skill) => (
                  <span key={skill} className="challenge-tag">
                    {skill}
                  </span>
                ))}
              </div>
              <Link
                to="/arena"
                state={{ puzzleType: challenge.puzzleType }}
                className="challenge-launch"
              >
                {challenge.buttonText} <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Play;
