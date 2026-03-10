import { useEffect, useMemo, useState } from "react";
import patternPuzzles from "../game/patternPuzzles";
import PuzzleShape from "../components/PuzzleShape";
import { getRandomPuzzle, checkAnswer } from "../game/puzzleEngine";

function Arena({ theme }) {
  const isCyber = theme === "cyber";

  const initialPuzzle = useMemo(() => getRandomPuzzle(), []);
  const [currentPuzzle, setCurrentPuzzle] = useState(initialPuzzle);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameOver, setGameOver] = useState(false);

  function loadNextPuzzle(currentId) {
    const availablePuzzles = patternPuzzles.filter(
      (puzzle) => puzzle.id !== currentId,
    );

    const nextPuzzle =
      availablePuzzles[Math.floor(Math.random() * availablePuzzles.length)];

    setCurrentPuzzle(nextPuzzle);
  }

  function handleAnswer(selectedAnswer) {
    const isCorrect = checkAnswer(currentPuzzle, selectedAnswer);

    setTotalAnswers((prev) => prev + 1);

    if (isCorrect) {
      setScore((prev) => prev + 100);
      setStreak((prev) => prev + 1);
      setCorrectAnswers((prev) => prev + 1);
      setFeedback("Correct");
    } else {
      setStreak(0);
      setFeedback("Incorrect");
    }

    setTimeout(() => {
      setFeedback("");
      loadNextPuzzle(currentPuzzle.id);
    }, 700);
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div
          className={`rounded-[28px] border p-6 md:p-8 ${
            isCyber
              ? "border-cyan-400/20 bg-[#09101d]/80 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? "border-cyan-400/20 bg-cyan-400/5"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Challenge
              </p>
              <h1
                className={`mt-2 text-2xl font-bold ${
                  isCyber ? "text-cyan-400" : "text-cyan-600"
                }`}
              >
                Pattern Rush
              </h1>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 text-center ${
                isCyber
                  ? "border-fuchsia-400/20 bg-fuchsia-500/5"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Time Remaining
              </p>
              <div
                className={`mt-2 font-mono text-3xl font-bold ${
                  isCyber ? "text-fuchsia-400" : "text-slate-800"
                }`}
              >
                00:45
              </div>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? "border-cyan-400/20 bg-cyan-400/5"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Mode
              </p>
              <div
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  isCyber
                    ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20"
                    : "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200"
                }`}
              >
                Solo Arena
              </div>
            </div>
          </div>

          <div
            className={`mt-6 rounded-[24px] border p-6 md:p-10 ${
              isCyber
                ? "border-cyan-400/20 bg-[linear-gradient(180deg,rgba(10,17,32,0.95)_0%,rgba(7,11,20,0.98)_100%)] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.04)]"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                    isCyber ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  Puzzle Feed
                </p>
                <h2
                  className={`mt-2 text-xl font-semibold ${
                    isCyber ? "text-white" : "text-slate-900"
                  }`}
                >
                  {currentPuzzle.title}
                </h2>
              </div>

              <div
                className={`hidden rounded-full px-3 py-1 text-xs font-semibold md:inline-flex ${
                  feedback === "Correct"
                    ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20"
                    : feedback === "Incorrect"
                      ? "bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-fuchsia-400/20"
                      : isCyber
                        ? "bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-fuchsia-400/20"
                        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {feedback || "Live Round"}
              </div>
            </div>

            <div
              className={`mt-8 rounded-2xl border p-8 md:p-12 ${
                isCyber
                  ? "border-cyan-400/15 bg-[#0c1526]"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                {currentPuzzle.grid.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className={`flex aspect-square items-center justify-center rounded-2xl border ${
                      isCyber
                        ? "border-cyan-400/10 bg-[#111b31] shadow-[inset_0_0_20px_rgba(34,211,238,0.03)]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <PuzzleShape shape={item} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {currentPuzzle.choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleAnswer(choice)}
                  className={`group rounded-2xl border px-5 py-4 text-left transition ${
                    isCyber
                      ? "border-cyan-400/15 bg-cyan-400/5 text-white hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10 hover:shadow-[0_0_24px_rgba(217,70,239,0.12)]"
                      : "border-slate-200 bg-white text-slate-900 hover:border-cyan-300"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                      isCyber
                        ? "text-cyan-400 group-hover:text-fuchsia-300"
                        : "text-cyan-600"
                    }`}
                  >
                    Response
                  </span>
                  <div className="mt-3 flex items-center justify-center">
                    <PuzzleShape shape={choice} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? "border-cyan-400/20 bg-cyan-400/5"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Score
              </p>
              <div
                className={`mt-2 font-mono text-2xl font-bold ${
                  isCyber ? "text-cyan-300" : "text-slate-800"
                }`}
              >
                {score.toString().padStart(4, "0")}
              </div>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? "border-fuchsia-400/20 bg-fuchsia-500/5"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Streak
              </p>
              <div
                className={`mt-2 font-mono text-2xl font-bold ${
                  isCyber ? "text-fuchsia-300" : "text-slate-800"
                }`}
              >
                x{streak.toString().padStart(2, "0")}
              </div>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? "border-cyan-400/20 bg-cyan-400/5"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Accuracy
              </p>
              <div
                className={`mt-2 font-mono text-2xl font-bold ${
                  isCyber ? "text-cyan-300" : "text-slate-800"
                }`}
              >
                {totalAnswers === 0
                  ? "--"
                  : Math.round((correctAnswers / totalAnswers) * 100) + "%"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Arena;
