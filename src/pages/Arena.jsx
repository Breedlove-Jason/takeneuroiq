import { useEffect, useMemo, useState } from 'react';
import PuzzleShape from '../components/PuzzleShape';
import patternPuzzles from '../game/patternPuzzles';
import { getRandomPuzzle, checkAnswer } from '../game/puzzleEngine';
import { recordSession } from '../game/sessionTracker';
import { calculateLiveAdaptiveDifficulty } from '../analytics/liveAdaptiveDifficulty.js';

/**
 * Helper function to get a random index
 * @param {number} length - The length of the array
 * @returns {number} A random index within the array bounds
 */
function getRandomIndex(length) {
  return Math.floor(Math.random() * length);
}

/**
 * Arena Component
 *
 * The primary gameplay container for the 'Pattern Rush' challenge.
 *
 * Responsibilities:
 * - Managing the game loop (timer, puzzle rotation, answer handling).
 * - Tracking real-time performance metrics (score, streak, accuracy).
 * - Recording session data to the global tracker upon game completion.
 * - Providing visual feedback (correct/incorrect) and game-over states.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.theme - Current UI theme ('cyber' or 'light').
 */

const adaptiveStateLabelMap = {
  recover: 'Recovery Mode',
  steady: 'Stable Load',
  challenge: 'Challenge Mode',
};

const adaptiveStateColorMap = {
  recover: 'text-yellow-300',
  steady: 'text-cyan-300',
  challenge: 'text-fuchsia-300',
};

const adaptiveConfidenceColorMap = {
  low: 'text-slate-300',
  medium: 'text-cyan-200',
  high: 'text-emerald-300',
};
function Arena({ theme }) {
  const isCyber = theme === 'cyber';

  const initialPuzzle = useMemo(() => getRandomPuzzle(), []);
  const [currentPuzzle, setCurrentPuzzle] = useState(initialPuzzle);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [puzzlesSeen, setPuzzlesSeen] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameOver, setGameOver] = useState(false);
  const [liveAdaptiveDifficulty, setLiveAdaptiveDifficulty] = useState({
    state: 'steady',
    targetDifficulty: 'medium',
    confidence: 'low',
    reason: 'Not enough live data yet.',
  });
  const adaptiveStateLabel =
    adaptiveStateLabelMap[liveAdaptiveDifficulty.state] ?? 'Stable Load';

  const adaptiveStateColor =
    adaptiveStateColorMap[liveAdaptiveDifficulty.state] ?? 'text-cyan-300';

  const adaptiveConfidenceColor =
    adaptiveConfidenceColorMap[liveAdaptiveDifficulty.confidence] ??
    'text-slate-300';

  useEffect(() => {
    if (gameOver) return;

    if (timeLeft <= 0) {
      const accuracyValue =
        totalAnswers === 0
          ? 0
          : Math.round((correctAnswers / totalAnswers) * 100);

      recordSession({
        score,
        accuracy: accuracyValue,
        bestStreak,
        puzzlesSeen,
        correctAnswers,
        puzzlesAttempted: totalAnswers,
        puzzlesCorrect: correctAnswers,
        timestamp: Date.now(),
        liveAdaptiveDifficulty,
      });
    }
  }, [
    timeLeft,
    gameOver,
    totalAnswers,
    correctAnswers,
    score,
    bestStreak,
    puzzlesSeen,
  ]);

  useEffect(
    () => {
      // Intentionally accessing gameOver without including in dependencies
      // to avoid cascading renders. gameOver prevents re-execution when true.
      if (timeLeft <= 0 && !gameOver) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGameOver(true);
      }
    },
    [timeLeft], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (gameOver) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  function loadNextPuzzle(currentId, preferredDifficulty = 'medium') {
    const availablePuzzles = patternPuzzles.filter(
      (puzzle) => puzzle.id !== currentId,
    );

    const difficultyMatchedPuzzles = availablePuzzles.filter(
      (puzzle) =>
        (puzzle.difficulty || puzzle.difficultyBucket || 'medium') ===
        preferredDifficulty,
    );

    const puzzlePool =
      difficultyMatchedPuzzles.length > 0
        ? difficultyMatchedPuzzles
        : availablePuzzles;

    const nextPuzzle = puzzlePool[getRandomIndex(puzzlePool.length)];

    setCurrentPuzzle(nextPuzzle);
    setPuzzlesSeen((prev) => prev + 1);
  }
  function handleAnswer(selectedAnswer) {
    if (gameOver) return;

    const isCorrect = checkAnswer(currentPuzzle, selectedAnswer);

    const nextTotalAnswers = totalAnswers + 1;
    const nextCorrectAnswers = isCorrect ? correctAnswers + 1 : correctAnswers;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const nextBestStreak = isCorrect
      ? Math.max(bestStreak, nextStreak)
      : bestStreak;

    setTotalAnswers(nextTotalAnswers);

    if (isCorrect) {
      setScore((prev) => prev + 100);
      setStreak(nextStreak);
      setBestStreak(nextBestStreak);
      setCorrectAnswers(nextCorrectAnswers);
      setFeedback('Correct');
    } else {
      setStreak(0);
      setFeedback('Incorrect');
    }

    const nextLiveAdaptiveDifficulty = calculateLiveAdaptiveDifficulty({
      puzzlesAttempted: nextTotalAnswers,
      puzzlesCorrect: nextCorrectAnswers,
      currentStreak: nextStreak,
      averageReactionTime: 0,
    });

    setLiveAdaptiveDifficulty(nextLiveAdaptiveDifficulty);

    setTimeout(() => {
      setFeedback('');
      if (!gameOver) {
        loadNextPuzzle(
          currentPuzzle.id,
          nextLiveAdaptiveDifficulty.targetDifficulty,
        );
      }
    }, 700);
  }

  function resetGame() {
    const newPuzzle = getRandomPuzzle();
    setCurrentPuzzle(newPuzzle);
    setLiveAdaptiveDifficulty({
      state: 'steady',
      targetDifficulty: 'medium',
      confidence: 'low',
      reason: 'Not enough live data yet.',
    });
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setFeedback('');
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setPuzzlesSeen(1);
    setTimeLeft(45);
    setGameOver(false);
  }
  const accuracy =
    puzzlesSeen === 0
      ? '--'
      : `${Math.round((correctAnswers / puzzlesSeen) * 100)}%`;
  const comboMultiplier =
    totalAnswers === 0
      ? null
      : streak >= 6
        ? 4
        : streak >= 4
          ? 3
          : streak >= 2
            ? 2
            : 1;
  function getPerformanceMessage() {
    if (totalAnswers === 0) {
      return 'No response data captured. Re-enter the arena to begin analysis.';
    }

    const accuracyValue = Math.round((correctAnswers / totalAnswers) * 100);

    if (accuracyValue >= 90 && bestStreak >= 6) {
      return 'Exceptional neural stability detected. Your pattern recognition remained precise even under time pressure.';
    }

    if (accuracyValue >= 80 && bestStreak >= 4) {
      return 'Strong cognitive performance recorded. Pattern recognition remained reliable throughout the round.';
    }

    if (accuracyValue >= 70) {
      return 'Good analytical performance. Your recognition accuracy remained solid, but streak interruptions reduced momentum.';
    }

    if (accuracyValue >= 60) {
      return 'Moderate stability detected. Your pattern recognition is developing, but response timing created inconsistency.';
    }

    return 'Analysis indicates unstable pattern response under pressure. Additional challenge reps recommended.';
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div
          className={`rounded-[28px] border p-6 md:p-8 ${
            isCyber
              ? 'border-cyan-400/20 bg-[#09101d]/80 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-xl'
              : 'border-slate-200 bg-white shadow-sm'
          }`}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? 'border-cyan-400/20 bg-cyan-400/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Challenge
              </p>
              <h1
                className={`mt-2 text-2xl font-bold ${
                  isCyber ? 'text-cyan-400' : 'text-cyan-600'
                }`}
              >
                Pattern Rush
              </h1>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 text-center ${
                isCyber
                  ? 'border-fuchsia-400/20 bg-fuchsia-500/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Time Remaining
              </p>
              <div
                className={`mt-2 font-mono text-3xl font-bold ${
                  isCyber ? 'text-fuchsia-400' : 'text-slate-800'
                }`}
              >
                {timeLeft.toString().padStart(2, '0')}s
              </div>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? 'border-cyan-400/20 bg-cyan-400/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Mode
              </p>
              <div
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  isCyber
                    ? 'bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20'
                    : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                }`}
              >
                Solo Arena
              </div>
            </div>
          </div>

          <div
            className={`mt-6 rounded-3xl border p-6 md:p-10 ${
              isCyber
                ? 'border-cyan-400/20 bg-[linear-gradient(180deg,rgba(10,17,32,0.95)_0%,rgba(7,11,20,0.98)_100%)] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.04)]'
                : 'border-slate-200 bg-white'
            }`}
          >
            {gameOver ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p
                  className={`text-sm font-semibold uppercase tracking-[0.25em] ${
                    isCyber ? 'text-fuchsia-400' : 'text-cyan-600'
                  }`}
                >
                  Round Complete
                </p>

                <h2
                  className={`mt-4 text-4xl font-bold ${
                    isCyber ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Pattern Rush Results
                </h2>

                <p
                  className={`mt-4 max-w-xl text-lg leading-8 ${
                    isCyber ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {getPerformanceMessage()}
                </p>

                <div className="mt-10 grid w-full max-w-3xl gap-4 md:grid-cols-3">
                  <div
                    className={`rounded-2xl border px-5 py-6 ${
                      isCyber
                        ? 'border-cyan-400/20 bg-cyan-400/5'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p
                      className={`text-sm uppercase tracking-[0.2em] ${
                        isCyber ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Final Score
                    </p>
                    <div
                      className={`mt-3 font-mono text-3xl font-bold ${
                        isCyber ? 'text-cyan-300' : 'text-slate-800'
                      }`}
                    >
                      {score.toString().padStart(4, '0')}
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl border px-5 py-6 ${
                      isCyber
                        ? 'border-fuchsia-400/20 bg-fuchsia-500/5'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p
                      className={`text-sm uppercase tracking-[0.2em] ${
                        isCyber ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Best Streak
                    </p>
                    <div
                      className={`mt-3 font-mono text-3xl font-bold ${
                        isCyber ? 'text-fuchsia-300' : 'text-slate-800'
                      }`}
                    >
                      x{bestStreak.toString().padStart(2, '0')}
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl border px-5 py-6 ${
                      isCyber
                        ? 'border-cyan-400/20 bg-cyan-400/5'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p
                      className={`text-sm uppercase tracking-[0.2em] ${
                        isCyber ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Accuracy
                    </p>
                    <div
                      className={`mt-3 font-mono text-3xl font-bold ${
                        isCyber ? 'text-cyan-300' : 'text-slate-800'
                      }`}
                    >
                      {accuracy}
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetGame}
                  className={`mt-10 rounded-xl px-8 py-4 font-semibold transition ${
                    isCyber
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:bg-cyan-300'
                      : 'bg-cyan-600 text-white hover:bg-cyan-500'
                  }`}
                >
                  Play Again
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                        isCyber ? 'text-slate-500' : 'text-slate-500'
                      }`}
                    >
                      Puzzle Feed
                    </p>
                    <h2
                      className={`mt-2 text-xl font-semibold ${
                        isCyber ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {currentPuzzle.title}
                    </h2>
                  </div>

                  <div
                    className={`hidden rounded-full px-3 py-1 text-xs font-semibold md:inline-flex ${
                      feedback === 'Correct'
                        ? 'bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20'
                        : feedback === 'Incorrect'
                          ? 'bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-fuchsia-400/20'
                          : isCyber
                            ? 'bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-fuchsia-400/20'
                            : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                    }`}
                  >
                    {feedback || 'Live Round'}
                  </div>
                </div>

                <div
                  className={`mt-8 rounded-2xl border p-8 md:p-12 ${
                    isCyber
                      ? 'border-cyan-400/15 bg-[#0c1526]'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="grid grid-cols-3 gap-4 md:gap-6">
                    {currentPuzzle.grid.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className={`flex aspect-square items-center justify-center rounded-2xl border ${
                          isCyber
                            ? 'border-cyan-400/10 bg-[#111b31] shadow-[inset_0_0_20px_rgba(34,211,238,0.03)]'
                            : 'border-slate-200 bg-white'
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
                      disabled={gameOver}
                      className={`group rounded-2xl border px-5 py-4 text-left transition ${
                        gameOver ? 'cursor-not-allowed opacity-50' : ''
                      } ${
                        isCyber
                          ? 'border-cyan-400/15 bg-cyan-400/5 text-white hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10 hover:shadow-[0_0_24px_rgba(217,70,239,0.12)]'
                          : 'border-slate-200 bg-white text-slate-900 hover:border-cyan-300'
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                          isCyber
                            ? 'text-cyan-400 group-hover:text-fuchsia-300'
                            : 'text-cyan-600'
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
              </>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? 'border-cyan-400/20 bg-cyan-400/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Score
              </p>
              <div
                className={`mt-2 font-mono text-2xl font-bold ${
                  isCyber ? 'text-cyan-300' : 'text-slate-800'
                }`}
              >
                {score.toString().padStart(4, '0')}
              </div>
            </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-5 shadow-[0_0_24px_rgba(34,211,238,0.08)]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Live Adaptive Signal
              </p>

              <div className="mt-2 flex items-center justify-between gap-4">
                <div>
                  <p className={`text-lg font-semibold ${adaptiveStateColor}`}>
                    {adaptiveStateLabel}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {liveAdaptiveDifficulty.reason}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                    Target
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-200">
                    {liveAdaptiveDifficulty.targetDifficulty.toUpperCase()}
                  </p>
                  <p
                    className={`mt-1 text-xs font-medium ${adaptiveConfidenceColor}`}
                  >
                    {liveAdaptiveDifficulty.confidence.toUpperCase()} confidence
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 transition-all duration-300 ${
                isCyber
                  ? streak >= 6
                    ? 'border-fuchsia-400/90 bg-fuchsia-500/25 shadow-[0_0_48px_rgba(217,70,239,0.60),0_0_90px_rgba(217,70,239,0.28)]'
                    : streak >= 4
                      ? 'border-fuchsia-400/60 bg-fuchsia-500/18 shadow-[0_0_32px_rgba(217,70,239,0.40)]'
                      : streak >= 2
                        ? 'border-fuchsia-400/35 bg-fuchsia-500/10 shadow-[0_0_18px_rgba(217,70,239,0.22)]'
                        : 'border-fuchsia-400/20 bg-fuchsia-500/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Streak
              </p>
              <div
                className={`mt-2 font-mono text-2xl font-bold transition-all duration-300 ${
                  isCyber
                    ? streak >= 6
                      ? 'text-fuchsia-100 drop-shadow-[0_0_16px_rgba(217,70,239,0.70)]'
                      : streak >= 4
                        ? 'text-fuchsia-200 drop-shadow-[0_0_10px_rgba(217,70,239,0.45)]'
                        : streak >= 2
                          ? 'text-fuchsia-300 drop-shadow-[0_0_6px_rgba(217,70,239,0.25)]'
                          : 'text-fuchsia-300'
                    : 'text-slate-800'
                }`}
              >
                x{streak.toString().padStart(2, '0')}
              </div>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? 'border-cyan-400/20 bg-cyan-400/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Accuracy
              </p>
              <div
                className={`mt-2 font-mono text-2xl font-bold ${
                  isCyber ? 'text-cyan-300' : 'text-slate-800'
                }`}
              >
                {accuracy}
              </div>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? comboMultiplier >= 3
                    ? 'border-fuchsia-400/30 bg-fuchsia-500/10 shadow-[0_0_20px_rgba(217,70,239,0.12)]'
                    : 'border-cyan-400/20 bg-cyan-400/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Combo
              </p>
              <div
                className={`mt-2 font-mono text-2xl font-bold ${
                  isCyber
                    ? comboMultiplier >= 3
                      ? 'text-fuchsia-300'
                      : 'text-cyan-300'
                    : 'text-slate-800'
                }`}
              >
                {comboMultiplier === null ? '--' : `x${comboMultiplier}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Arena;
