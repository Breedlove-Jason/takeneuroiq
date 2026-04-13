import React from 'react';

const RuleShiftArenaView = ({
  renderRuleShiftPrompt,
  renderRuleShiftAnswers,
  renderRuleShiftReadout,
  showPuzzleDebugMeta,
  ruleShiftDebugInfo,
  formatDevValue,
  debugPanel,
}) => {
  const DebugPanel = debugPanel;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-fuchsia-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(217,70,239,0.1)] backdrop-blur-md">
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-400">
              Rule Shift Arena
            </p>
            <h2 className="text-xl font-bold text-white text-glow-pink">
              Adapt to the rule. Pivot fast.
            </h2>
          </div>
          <span className="rounded-full border border-fuchsia-500/50 bg-fuchsia-500/20 px-3 py-1 text-xs font-semibold text-fuchsia-200 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
            Cognitive Flexibility Live
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {renderRuleShiftPrompt()}
            {renderRuleShiftAnswers()}
          </div>
          <div className="space-y-6 lg:col-span-1">
            {renderRuleShiftReadout()}

            {showPuzzleDebugMeta && (
              <DebugPanel title="Rule Shift Dev">
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase font-bold">ID</span>
                    <span className="text-amber-200 font-mono">{ruleShiftDebugInfo.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase font-bold">Difficulty</span>
                    <span className="text-amber-200 font-mono">{formatDevValue(ruleShiftDebugInfo.difficulty)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 uppercase font-bold">Rule</span>
                    <span className="text-amber-200 font-mono">{formatDevValue(ruleShiftDebugInfo.rule)}</span>
                  </div>
                </div>
              </DebugPanel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleShiftArenaView;
