// src/pages/Play.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  faShapes,
  faScaleBalanced,
  faBrain,
} from "@fortawesome/free-solid-svg-icons";

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
      icon: faShapes,
      title: "Pattern Rush",
      description:
        "Spot sequences, decode visual patterns, and react fast under pressure.",
      buttonText: "Enter Pattern Rush",
    },
    {
      icon: faScaleBalanced,
      title: "Logic Duel",
      description:
        "Face reasoning-based puzzles built to test deduction, structure, and mental agility.",
      buttonText: "Enter Logic Duel",
    },
    {
      icon: faBrain,
      title: "Memory Blitz",
      description:
        "Train recall speed and focus through short, intense memory-driven challenge rounds.",
      buttonText: "Enter Memory Blitz",
    },
  ];

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className={`text-sm font-semibold uppercase tracking-[0.25em] ${
              isCyber ? "text-cyan-400" : "text-cyan-600"
            }`}
          >
            Play
          </p>

          <h1
            className={`mt-4 text-4xl font-bold md:text-5xl ${
              isCyber ? "text-white" : "text-slate-900"
            }`}
          >
            Choose your challenge arena
          </h1>

          <p
            className={`mt-6 text-lg leading-8 ${
              isCyber ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Enter a fast-paced cognitive challenge designed to test how you
            think, react, and adapt under pressure.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {challenges.map((challenge) => (
            <div
              key={challenge.title}
              className={`rounded-2xl border p-8 backdrop-blur-sm transition ${
                isCyber
                  ? "border-cyan-400/10 bg-white/5 shadow-[0_0_30px_rgba(0,0,0,0.18)] hover:border-cyan-400/30"
                  : "border-slate-200 bg-white shadow-sm hover:border-cyan-300"
              }`}
            >
              <div
                className={`text-4xl ${
                  isCyber
                    ? "text-cyan-400 drop-shadow-[0_0_16px_rgba(34,211,238,0.35)]"
                    : "text-cyan-600"
                }`}
              >
                <FontAwesomeIcon icon={challenge.icon} />
              </div>

              <h2
                className={`mt-5 text-2xl font-semibold ${
                  isCyber ? "text-white" : "text-slate-900"
                }`}
              >
                {challenge.title}
              </h2>

              <p
                className={`mt-4 leading-7 ${
                  isCyber ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {challenge.description}
              </p>

              <Link
                to="/arena"
                className={`mt-6 inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold transition ${
                  theme === "cyber"
                    ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                    : "bg-cyan-600 text-white hover:bg-cyan-500"
                }`}
              >
                Launch Pattern Rush
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Play;
