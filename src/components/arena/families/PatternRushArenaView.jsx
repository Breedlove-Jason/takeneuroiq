import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faZap, faTrophy } from "@fortawesome/pro-duotone-svg-icons";

const PatternRushArenaView = ({
  isCyber,
  patternRushActiveShapes,
  handlePatternRushShapeClick,
  gameOver,
  patternRushScore,
  patternRushHighStreak,
  patternRushTimeLeft,
  patternRushPuzzle,
  showPuzzleDebugMeta,
  showAnswers,
  debugPanel,
}) => {
  const DebugPanel = debugPanel;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900/80 p-8 shadow-[0_0_30px_rgba(16,185,129,0.1)] backdrop-blur-md">
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-10 flex flex-col items-center justify-between gap-6 border-b border-emerald-500/10 pb-8 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">
              Neural Pattern Recognition
            </p>
            <h2 className="mt-1 text-3xl font-black text-white text-glow-emerald">
              Select the Unique Signature
            </h2>
          </div>
          <div className="flex gap-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-3 text-center backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
                Score
              </p>
              <p className="font-mono text-2xl font-black text-white">
                {patternRushScore}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-3 text-center backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
                Best Streak
              </p>
              <p className="font-mono text-2xl font-black text-white">
                {patternRushHighStreak}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-12 py-4 lg:flex-row lg:items-start lg:gap-20">
          <div className="relative order-2 lg:order-1 lg:flex-1">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {patternRushActiveShapes.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => handlePatternRushShapeClick(shape)}
                  disabled={gameOver}
                  className={`group relative flex aspect-square flex-col items-center justify-center rounded-2xl border border-white/5 bg-slate-900/40 p-4 transition-all duration-300 hover:scale-105 hover:border-emerald-500/40 hover:bg-slate-900/60 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isCyber ? "shadow-[inset_0_0_20px_rgba(2,6,23,0.8)]" : ""
                  }`}
                >
                  <div className="mb-2 h-16 w-16 transition-transform duration-500 group-hover:rotate-12">
                    <div
                      className="h-full w-full opacity-90 group-hover:opacity-100"
                      style={{ color: shape.color }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-full w-full filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                      >
                        <circle cx="12" cy="12" r="8" />
                        <path d="M12 8v8M8 12h8" />
                      </svg>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-black tracking-widest text-slate-500 group-hover:text-emerald-400">
                    {shape.id.slice(0, 4).toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="order-1 w-full max-w-xs lg:order-2">
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Remaining Time
                </span>
                <FontAwesomeIcon icon={faClock} className="text-emerald-400" />
              </div>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-900 shadow-inner">
                <div
                  className={`h-full bg-linear-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-linear ${
                    patternRushTimeLeft < 5 ? "animate-pulse brightness-125" : ""
                  }`}
                  style={{ width: `${(patternRushTimeLeft / 30) * 100}%` }}
                />
              </div>
              <div className="mt-4 flex justify-center">
                <span className="font-mono text-5xl font-black text-white tabular-nums">
                  {patternRushTimeLeft}s
                </span>
              </div>

              <div className="mt-8 space-y-4 border-t border-white/5 pt-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <FontAwesomeIcon icon={faZap} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Current Multiplier
                    </p>
                    <p className="text-sm font-black text-white">1.5x Pulse</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <FontAwesomeIcon icon={faTrophy} />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Session Goal
                    </p>
                    <p className="text-sm font-black text-white">45 Points</p>
                  </div>
                </div>
              </div>
            </div>

            {showPuzzleDebugMeta && (
              <div className="mt-6">
                <DebugPanel title="Pattern Rush Dev">
                  {showAnswers && (
                    <div className="flex justify-between">
                      <span className="font-bold text-white">Target ID:</span>
                      <span className="text-emerald-400 font-mono">
                        {patternRushPuzzle?.targetShape?.id.slice(0, 8) ?? "—"}
                      </span>
                    </div>
                  )}
                  <div className="mt-2 flex justify-between">
                    <span className="font-bold text-white">Shape Count:</span>
                    <span className="text-amber-200 font-mono">
                      {patternRushActiveShapes.length}
                    </span>
                  </div>
                </DebugPanel>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternRushArenaView;
