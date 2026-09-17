// Debug overlays require an explicit local opt-in and never appear in production.
const debug = import.meta.env.DEV && import.meta.env.VITE_PUZZLE_DEBUG === 'true';

export const PUZZLE_DEV_FLAGS = {
  SHOW_ANSWERS: debug,
  SHOW_PATTERN_RULE: debug,
  SHOW_PATTERN_RUSH_ANSWERS: debug,
  SHOW_SEQUENCE_SPRINT_ANSWERS: debug,
  SHOW_PUZZLE_DEBUG_META: debug,
  SHOW_GRID_RECALL_ANSWERS: debug,
  SHOW_LOGIC_GATE_ANSWERS: debug,
  SHOW_SIGNAL_PATH_ANSWERS: debug,
};
