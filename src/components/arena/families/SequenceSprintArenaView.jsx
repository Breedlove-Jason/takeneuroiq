import React from 'react';

const SequenceSprintArenaView = ({
  renderSequenceSprintRunner,
  renderSequencePrompt,
  renderSequenceAnswers,
  renderSprintReadout,
  shouldShowSequenceDebug,
  SHOW_SEQUENCE_SPRINT_ANSWERS,
  sequenceDebugInfo,
  debugPanel,
}) => {
  const DebugPanel = debugPanel;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(34,211,238,0.1)] backdrop-blur-md">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Sequence Sprint Arena
            </p>
            <h2 className="text-xl font-bold text-white text-glow-blue">
              Match the patterns. Maintain the pace.
            </h2>
          </div>
          <span className="rounded-full border border-cyan-500/50 bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            Speed Processing Live
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {renderSequenceSprintRunner()}
            {renderSequencePrompt()}
            {renderSequenceAnswers()}
          </div>
          <div className="space-y-6 lg:col-span-1">
            {renderSprintReadout()}

            {shouldShowSequenceDebug && (
              <DebugPanel title="Sequence Dev">
                {SHOW_SEQUENCE_SPRINT_ANSWERS && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-cyan-500/10 p-2 border border-cyan-500/20">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase">Answer</span>
                      <span className="font-mono text-lg font-black text-white">
                        {sequenceDebugInfo.answer ?? "—"}
                      </span>
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

export default SequenceSprintArenaView;
