import React from 'react';

const MemoryChainArenaView = ({
  puzzle,
  feedback,
  onAnswer,
  gameOver,
  isCyber,
  getFeedbackBadgeClass,
  showPuzzleDebugMeta,
  showAnswers,
  memoryChainPuzzleMetrics,
  debugPanel,
}) => {
  const DebugPanel = debugPanel;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-900/80 p-6 shadow-[inset_0_0_45px_rgba(34,211,238,0.18),0_20px_40px_rgba(2,6,23,0.6)] backdrop-blur-md">
      <div className="relative z-10">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.35em] ${isCyber ? "text-cyan-300 text-glow-blue" : "text-cyan-300"}`}>
              Memory Chain Arena
            </p>
            <h3 className={`text-2xl font-bold ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
              {puzzle?.prompt || "Identify the hidden value."}
            </h3>
            <p className="text-xs font-medium text-slate-300">
              Track the ordered sequence and recover the missing link.
            </p>
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isCyber ? "text-slate-400 text-glow-blue/30" : "text-slate-400"}`}>
            Live Arena Feed
          </p>
        </div>

        <div className="mt-6 grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="rounded-2xl border border-violet-500/10 bg-slate-950/60 p-5 shadow-[inset_0_0_35px_rgba(2,6,23,0.6),0_0_30px_rgba(168,85,247,0.12)] backdrop-blur-[14px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-violet-300/90">
              Ordered Sequence
            </p>
            <p className="text-xs font-medium text-slate-300">
              Read the chain
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 md:gap-4">
              {(puzzle?.sequence ?? []).map((item, index) => {
                const isMissingSlot = item === null || item === undefined;
                return (
                  <div
                    key={`${index}-${item ?? "missing"}`}
                    className="flex min-w-14 items-center justify-center rounded-xl border border-white/5 bg-slate-900/40 px-4 py-3 shadow-[inset_0_0_20px_rgba(2,6,23,0.8)]"
                  >
                    {isMissingSlot ? (
                      <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-cyan-400/80 bg-cyan-500/10 text-3xl font-black text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.3)] animate-pulse">
                        ?
                      </span>
                    ) : (
                      <span className="text-[clamp(1.4rem,3vw,2.25rem)] font-black uppercase tracking-[0.14em] text-white text-glow-blue">
                        {item}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="xl:sticky xl:top-6">
            <div className="rounded-2xl border border-fuchsia-500/10 bg-slate-950/60 p-5 shadow-[inset_0_0_35px_rgba(2,6,23,0.6),0_0_30px_rgba(217,70,239,0.12)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-fuchsia-300/90">
                Answer Tray
              </p>
              <p className="text-xs font-medium text-slate-300">
                Choose the missing value
              </p>
              <div className="mt-4 flex flex-col items-center gap-3">
                {feedback && (
                  <div className="flex justify-center">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${getFeedbackBadgeClass(feedback, isCyber)}`}
                    >
                      {feedback}
                    </span>
                  </div>
                )}
                <div className="flex w-full flex-wrap justify-center gap-3 md:gap-4">
                  {(Array.isArray(puzzle?.options) ? puzzle.options : [puzzle?.answer])
                    .filter((option) => option !== null && option !== undefined)
                    .map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => onAnswer(option)}
                        disabled={gameOver}
                        className="min-w-20 rounded-xl border border-cyan-400/30 bg-slate-900/70 px-4 py-3 text-center text-lg font-black text-white shadow-[0_0_18px_rgba(34,211,238,0.12)] transition-all duration-300 hover:border-violet-400/60 hover:bg-slate-900 hover:text-cyan-100 hover:shadow-[0_0_24px_rgba(168,85,247,0.2)] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {option}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {showPuzzleDebugMeta && (
              <div className="mt-4">
                <DebugPanel title="Memory Chain Dev">
                  {showAnswers && (
                    <div>
                      <span className="font-bold text-white">Answer:</span>{" "}
                      <span className="text-amber-100">{puzzle?.answer ?? "—"}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-white">ID:</span>{" "}
                    <span className="text-amber-100">{puzzle?.id ?? "—"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-white">Hidden Index:</span>{" "}
                    <span className="text-amber-100">
                      {Number.isInteger(puzzle?.hiddenIndex) ? puzzle.hiddenIndex : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-white">Chain Length:</span>{" "}
                    <span className="text-amber-100">{memoryChainPuzzleMetrics?.chainLength ?? 0}</span>
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

export default MemoryChainArenaView;
