export const PUZZLE_TYPES = {
  PATTERN_RUSH: "pattern_rush",
  SEQUENCE_SPRINT: "sequence_sprint",
  GRID_RECALL: "grid_recall",
  LOGIC_GATE: "logic_gate",
  SIGNAL_PATH: "signal_path",
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
  [PUZZLE_TYPES.GRID_RECALL]: {
    label: "Grid Recall",
    shortLabel: "Recall",
    description: "Spatial memory and attention",
    color: "emerald",
    cognitiveSkills: ["Spatial Memory", "Attention"],
    icon: "table-cells",
  },
  [PUZZLE_TYPES.LOGIC_GATE]: {
    label: "Logic Gate",
    shortLabel: "Logic",
    description: "Resolve binary signal outputs through gate logic.",
    color: "amber",
    cognitiveSkills: ["Reasoning", "Signals", "Binary Logic"],
    icon: "microchip",
  },
  [PUZZLE_TYPES.SIGNAL_PATH]: {
    label: "Signal Path",
    shortLabel: "Signal",
    description: "Route the correct signal path under rule constraints.",
    color: "violet",
    cognitiveSkills: ["Planning", "Routing", "Constraint Logic"],
    icon: "route",
  },
};

export function getPuzzleTypeMetadata(puzzleType) {
  return (
    PUZZLE_TYPE_METADATA[puzzleType] ||
    PUZZLE_TYPE_METADATA[PUZZLE_TYPES.PATTERN_RUSH]
  );
}

