import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faBrain,
} from "@fortawesome/pro-duotone-svg-icons";
import MemoryChainArenaView from './families/MemoryChainArenaView';
import RuleShiftArenaView from './families/RuleShiftArenaView';
import LogicGridArenaView from './families/LogicGridArenaView';
import SequenceSprintArenaView from './families/SequenceSprintArenaView';
import PatternRushArenaView from './families/PatternRushArenaView';

const ArenaActiveView = ({
  isCyber,
  puzzleFeedTitle,
  liveCoachingTone,
  liveCoachingPressureClass,
  adaptiveCoachingMessage,
  activePuzzleType,
  PUZZLE_TYPES,
  // Helper Renders passed from parent or moved here
  renderSequenceSprintRunner,
  renderSequencePrompt,
  renderSequenceAnswers,
  renderSprintReadout,
  renderRuleShiftPrompt,
  renderRuleShiftAnswers,
  renderRuleShiftReadout,
  renderSignalPathRulePanel,
  renderSignalPathNetwork,
  renderSignalPathAnswers,
  renderSignalPathReadout,
  renderLogicGateInputs,
  renderLogicGateCore,
  renderLogicGateAnswers,
  renderLogicGateReadout,
  renderLogicGridClues,
  renderLogicGridGrid,
  renderLogicGridAnswers,
  renderLogicGridReadout,
  renderGridRecallGrid,
  renderGridRecallAnswers,
  renderGridRecallReadout,
  currentPuzzle,
  feedback,
  handleAnswer,
  gameOver,
  getFeedbackBadgeClass,
  memoryChainPuzzleMetrics,
  SHOW_PUZZLE_DEBUG_META,
  SHOW_ANSWERS,
  // State / Logic
  // Memory Chain specific
  MEMORY_CHAIN_PUZZLE_TYPE,
  // Pattern Rush specific
  PATTERN_RUSH_PUZZLE_TYPE,
  patternRushActiveShapes,
  handlePatternRushShapeClick,
  patternRushScore,
  patternRushHighStreak,
  patternRushTimeLeft,
  // Debug Panels
  DevDebugPanel,
  shouldShowSequenceDebug,
  shouldShowSignalPathDebug,
  SHOW_SEQUENCE_SPRINT_ANSWERS,
  sequenceDebugInfo,
  ruleShiftDebugInfo,
  signalPathDebugInfo,
  signalPathPuzzle,
  logicGatePuzzle,
  SHOW_LOGIC_GATE_ANSWERS,
  logicGridPuzzle,
  SHOW_LOGIC_GRID_ANSWERS,
  patternRushPuzzle,
  formatDevValue
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black uppercase tracking-widest ${isCyber ? "text-white text-glow-blue" : "text-slate-900"}`}>
            {puzzleFeedTitle}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isCyber ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "bg-cyan-600"}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isCyber ? "text-cyan-400/80" : "text-slate-500"}`}>
              Live Neural Feed Active
            </span>
          </div>
        </div>

        <div className={`hidden items-center gap-4 rounded-2xl border px-5 py-3 backdrop-blur-md transition-all duration-500 md:flex ${liveCoachingTone}`}>
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
              Live Coaching
            </p>
            <p className={`text-xs font-bold transition-all duration-300 ${liveCoachingPressureClass}`}>
              {adaptiveCoachingMessage}
            </p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-current/20 bg-current/10 ${isCyber ? "text-glow-blue" : ""}`}>
            <FontAwesomeIcon icon={faBrain} className="text-lg" />
          </div>
        </div>
      </div>

      <div className="relative min-h-125">
        {activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT ? (
          <SequenceSprintArenaView
            renderSequenceSprintRunner={renderSequenceSprintRunner}
            renderSequencePrompt={renderSequencePrompt}
            renderSequenceAnswers={renderSequenceAnswers}
            renderSprintReadout={renderSprintReadout}
            shouldShowSequenceDebug={shouldShowSequenceDebug}
            SHOW_SEQUENCE_SPRINT_ANSWERS={SHOW_SEQUENCE_SPRINT_ANSWERS}
            sequenceDebugInfo={sequenceDebugInfo}
            debugPanel={DevDebugPanel}
          />
        ) : activePuzzleType === PUZZLE_TYPES.RULE_SHIFT ? (
          <RuleShiftArenaView
            renderRuleShiftPrompt={renderRuleShiftPrompt}
            renderRuleShiftAnswers={renderRuleShiftAnswers}
            renderRuleShiftReadout={renderRuleShiftReadout}
            showPuzzleDebugMeta={SHOW_PUZZLE_DEBUG_META}
            ruleShiftDebugInfo={ruleShiftDebugInfo}
            formatDevValue={formatDevValue}
            debugPanel={DevDebugPanel}
          />
        ) : activePuzzleType === PUZZLE_TYPES.SIGNAL_PATH ? (
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-md">
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-400">
                    Signal Path Arena
                  </p>
                  <h2 className="text-xl font-bold text-white text-glow-blue">
                    Route the signal. Obey the rule.
                  </h2>
                </div>
                <span className="rounded-full border border-violet-500/50 bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  Constraint Logic Live
                </span>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  {renderSignalPathRulePanel()}
                  {renderSignalPathNetwork()}
                  {renderSignalPathAnswers()}
                </div>
                <div className="space-y-6 lg:col-span-1">
                  {renderSignalPathReadout()}

                  {shouldShowSignalPathDebug && (
                    <DevDebugPanel title="Signal Path Dev">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg bg-violet-500/10 p-2 border border-violet-500/20">
                          <span className="text-[10px] font-bold text-violet-400 uppercase">Answer</span>
                          <span className="font-mono text-lg font-black text-white">
                            {signalPathPuzzle?.answer ?? "—"}
                          </span>
                        </div>
                      </div>
                      {SHOW_PUZZLE_DEBUG_META && (
                        <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500 uppercase font-bold">ID</span>
                            <span className="text-amber-200 font-mono">{signalPathDebugInfo.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 uppercase font-bold">Difficulty</span>
                            <span className="text-amber-200 font-mono">{formatDevValue(signalPathDebugInfo.difficulty)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 uppercase font-bold">Rule Type</span>
                            <span className="text-amber-200 font-mono">{formatDevValue(signalPathDebugInfo.ruleType)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 uppercase font-bold">Nodes</span>
                            <span className="text-amber-200 font-mono">{signalPathDebugInfo.nodeCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 uppercase font-bold">Paths</span>
                            <span className="text-amber-200 font-mono">{signalPathDebugInfo.pathCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 uppercase font-bold">Correct Path</span>
                            <span className="text-amber-200 font-mono">
                              {signalPathPuzzle?.puzzleMetrics?.correctPathId ?? "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 uppercase font-bold">Rule</span>
                            <p className="mt-1 text-[9px] leading-4 text-violet-200/80">{formatDevValue(signalPathDebugInfo.rule)}</p>
                          </div>
                        </div>
                      )}
                    </DevDebugPanel>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activePuzzleType === PUZZLE_TYPES.LOGIC_GATE ? (
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(245,158,11,0.1)] backdrop-blur-md">
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-amber-400 text-glow-amber" : "text-amber-400"}`}>
                    Logic Gate Arena
                  </p>
                  <h2 className={`text-xl font-bold ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
                    Resolve the signal. Predict the output.
                  </h2>
                </div>
                <span className="rounded-full border border-amber-500/50 bg-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  Binary Reasoning Live
                </span>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  {renderLogicGateInputs()}
                  {renderLogicGateCore()}
                  {renderLogicGateAnswers()}
                </div>
                <div className="space-y-6 lg:col-span-1">
                  {renderLogicGateReadout()}

                  {(SHOW_LOGIC_GATE_ANSWERS || SHOW_PUZZLE_DEBUG_META) && (
                    <DevDebugPanel title="Logic Gate Dev">
                      {SHOW_LOGIC_GATE_ANSWERS && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20">
                            <span className="text-[10px] font-bold uppercase text-emerald-400">Answer</span>
                            <span className="font-mono text-lg font-black text-white">{logicGatePuzzle.answer}</span>
                          </div>
                        </div>
                      )}
                      {SHOW_PUZZLE_DEBUG_META && (
                        <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500 uppercase font-bold">ID</span>
                            <span className="text-amber-200 font-mono">{logicGatePuzzle.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 uppercase font-bold">Complexity</span>
                            <span className="text-amber-200 font-mono">{logicGatePuzzle.complexity.map((item) => (
                              <div>
                              
                              </div>
                            ))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 uppercase font-bold">Gates</span>
                            <span className="text-amber-200 font-mono">{logicGatePuzzle.gateCount}</span>
                          </div>
                        </div>
                      )}
                    </DevDebugPanel>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activePuzzleType === PUZZLE_TYPES.LOGIC_GRID ? (
          <LogicGridArenaView
            isCyber={isCyber}
            renderLogicGridClues={renderLogicGridClues}
            renderLogicGridGrid={renderLogicGridGrid}
            renderLogicGridAnswers={renderLogicGridAnswers}
            renderLogicGridReadout={renderLogicGridReadout}
            showAnswers={SHOW_LOGIC_GRID_ANSWERS}
            showPuzzleDebugMeta={SHOW_PUZZLE_DEBUG_META}
            logicGridPuzzle={logicGridPuzzle}
            debugPanel={DevDebugPanel}
          />
        ) : activePuzzleType === PUZZLE_TYPES.GRID_RECALL ? (
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(59,130,246,0.1)] backdrop-blur-md">
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400">
                    Grid Recall Arena
                  </p>
                  <h2 className="text-xl font-bold text-white text-glow-blue">
                    Reconstruct the grid. Recall the state.
                  </h2>
                </div>
                <span className="rounded-full border border-blue-500/50 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  Visuospatial Memory Live
                </span>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  {renderGridRecallGrid()}
                  {renderGridRecallAnswers()}
                </div>
                <div className="space-y-6 lg:col-span-1">
                  {renderGridRecallReadout()}
                </div>
              </div>
            </div>
          </div>
        ) : activePuzzleType === MEMORY_CHAIN_PUZZLE_TYPE ? (
          <MemoryChainArenaView
            puzzle={currentPuzzle}
            feedback={feedback}
            onAnswer={handleAnswer}
            gameOver={gameOver}
            isCyber={isCyber}
            getFeedbackBadgeClass={getFeedbackBadgeClass}
            showPuzzleDebugMeta={SHOW_PUZZLE_DEBUG_META}
            showAnswers={SHOW_ANSWERS}
            memoryChainPuzzleMetrics={memoryChainPuzzleMetrics}
            debugPanel={DevDebugPanel}
          />
        ) : activePuzzleType === PATTERN_RUSH_PUZZLE_TYPE ? (
          <PatternRushArenaView
            isCyber={isCyber}
            patternRushActiveShapes={patternRushActiveShapes}
            handlePatternRushShapeClick={handlePatternRushShapeClick}
            gameOver={gameOver}
            patternRushScore={patternRushScore}
            patternRushHighStreak={patternRushHighStreak}
            patternRushTimeLeft={patternRushTimeLeft}
            patternRushPuzzle={patternRushPuzzle}
            showPuzzleDebugMeta={SHOW_PUZZLE_DEBUG_META}
            showAnswers={SHOW_ANSWERS}
            debugPanel={DevDebugPanel}
          />
        ) : (
          <div className="flex h-100 flex-col items-center justify-center rounded-3xl border border-white/5 bg-slate-900/50 backdrop-blur-sm">
            <div className="mb-4 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-slate-800">
              <FontAwesomeIcon icon={faLayerGroup} className="text-3xl text-slate-600" />
            </div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
              Initializing Arena...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArenaActiveView;
