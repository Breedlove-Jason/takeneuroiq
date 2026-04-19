export const PUZZLE_TYPES = {
  PATTERN_RUSH: "pattern_rush",
  SEQUENCE_SPRINT: "sequence_sprint",
  RULE_SHIFT: "rule_shift",
  GRID_RECALL: "grid_recall",
  LOGIC_GRID: "logic_grid",
  LOGIC_GATE: "logic_gate",
  SIGNAL_PATH: "signal_path",
  MEMORY_CHAIN: "memory_chain",
  SYMBOL_RECALL: "symbol_recall",
  ODD_ONE_MATRIX: "odd_one_matrix",
};

export const PUZZLE_TYPE_METADATA = {
  [PUZZLE_TYPES.PATTERN_RUSH]: {
    label: "Pattern Rush",
    shortLabel: "Pattern",
    description: "Visual pattern recognition under time pressure",
    color: "cyan",
    cognitiveSkills: ["Pattern Recognition", "Visual Processing"],
    icon: "star",
  },
  [PUZZLE_TYPES.SEQUENCE_SPRINT]: {
    label: "Sequence Sprint",
    shortLabel: "Sequence",
    description: "Sequential memory and prediction",
    color: "fuchsia",
    cognitiveSkills: ["Working Memory", "Predictive Reasoning"],
    icon: "diagram-project",
  },
  [PUZZLE_TYPES.RULE_SHIFT]: {
    label: "Rule Shift",
    shortLabel: "Shift",
    description: "Adaptive arithmetic transitions and rule switching",
    color: "magenta",
    cognitiveSkills: [
      "Arithmetic Transition Tracking",
      "Rule Switching",
      "Adaptive Sequence Reasoning",
    ],
    icon: "layer-group",
  },
  [PUZZLE_TYPES.GRID_RECALL]: {
    label: "Grid Recall",
    shortLabel: "Recall",
    description: "Spatial memory and attention",
    color: "aqua",
    cognitiveSkills: ["Spatial Memory", "Attention"],
    icon: "table-cells",
  },
  [PUZZLE_TYPES.LOGIC_GRID]: {
    label: "Logic Grid",
    shortLabel: "Grid",
    description: "Solve the missing cell using grid-based reasoning.",
    color: "cyan",
    cognitiveSkills: ["Matrix Logic", "Rule Detection", "Abstract Reasoning"],
    icon: "border-all",
  },
  [PUZZLE_TYPES.LOGIC_GATE]: {
    label: "Logic Gate",
    shortLabel: "Logic",
    description: "Resolve binary signal outputs through gate logic.",
    color: "lilac",
    cognitiveSkills: ["Reasoning", "Signals", "Binary Logic"],
    icon: "microchip",
  },
  [PUZZLE_TYPES.SIGNAL_PATH]: {
    label: "Signal Path",
    shortLabel: "Signal",
    description: "Route the correct signal path under rule constraints.",
    color: "cyan",
    cognitiveSkills: ["Planning", "Routing", "Constraint Logic"],
    icon: "route",
  },
  [PUZZLE_TYPES.MEMORY_CHAIN]: {
    label: "Memory Chain",
    shortLabel: "Memory",
    description: "Trace the sequence and identify the hidden link.",
    color: "lilac",
    cognitiveSkills: ["Trace Memory", "Visual Retention", "Sequential Recall"],
    icon: "link",
  },
  [PUZZLE_TYPES.SYMBOL_RECALL]: {
    label: "Symbol Recall",
    shortLabel: "Glyph",
    description:
      "Rapid visual retention and glyph recognition with short-term recall precision.",
    color: "rose",
    cognitiveSkills: [
      "Visual Memory",
      "Glyph Recognition",
      "Short-Term Recall Precision",
    ],
    icon: "bolt",
  },
  [PUZZLE_TYPES.ODD_ONE_MATRIX]: {
    label: "Odd One Matrix",
    shortLabel: "Odd One",
    description: "Identify the cell that breaks the pattern.",
    color: "fuchsia",
    cognitiveSkills: ["Visual Discrimination", "Pattern Matching"],
    icon: "bullseye",
  },
};

export function getPuzzleTypeMetadata(puzzleType) {
  return (
    PUZZLE_TYPE_METADATA[puzzleType] ||
    PUZZLE_TYPE_METADATA[PUZZLE_TYPES.PATTERN_RUSH]
  );
}

