export const PUZZLE_TYPES = {
  PATTERN_RUSH: "pattern_rush",
  SEQUENCE_SPRINT: "sequence_sprint",
  GRID_RECALL: "grid_recall",
  LOGIC_GATE: "logic_gate",
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
    color: "violet",
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
};

export function getPuzzleTypeMetadata(puzzleType) {
  return (
    PUZZLE_TYPE_METADATA[puzzleType] ||
    PUZZLE_TYPE_METADATA[PUZZLE_TYPES.PATTERN_RUSH]
  );
}

