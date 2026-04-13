import React from 'react';

const LogicGridArenaView = ({
  isCyber,
  renderLogicGridClues,
  renderLogicGridGrid,
  renderLogicGridAnswers,
  renderLogicGridReadout,
  showAnswers,
  showPuzzleDebugMeta,
  logicGridPuzzle,
  debugPanel,
}) => {
  const DebugPanel = debugPanel;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-md">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-emerald-400 text-glow-emerald" : "text-emerald-400"}`}>
              Logic Grid Arena
            </p>
            <h2 className={`text-xl font-bold ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
              Connect the clues. Solve the matrix.
            </h2>
          </div>
          <span className="rounded-full border border-emerald-500/50 bg-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            Deductive Analysis Live
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {renderLogicGridClues()}
            {renderLogicGridGrid()}
            {renderLogicGridAnswers()}
          </div>
          <div className="space-y-6 lg:col-span-1">
            {renderLogicGridReadout()}

            {(showAnswers || showPuzzleDebugMeta) && (
              <DebugPanel title="Logic Grid Dev">
                {showAnswers && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20">
                      <span className="text-[10px] font-bold uppercase text-emerald-400">Answer</span>
                      <span className="font-mono text-lg font-black text-white">{logicGridPuzzle.answer}</span>
                    </div>
                  </div>
                )}
                {showPuzzleDebugMeta && (
                  <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase font-bold">ID</span>
                      <span className="text-amber-200 font-mono">{logicGridPuzzle.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase font-bold">Cells</span>
                      <span className="text-amber-200 font-mono">{logicGridPuzzle.gridSize}</span>
                    </div>
                  </div>
                )}
              </DebugPanel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogicGridArenaView;
