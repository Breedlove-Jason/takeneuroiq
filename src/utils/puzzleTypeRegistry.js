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
  },
  [PUZZLE_TYPES.SEQUENCE_SPRINT]: {
    label: "Sequence Sprint",
    shortLabel: "Sequence",
    description: "Sequential memory and prediction",
    color: "violet",
    cognitiveSkills: ["Working Memory", "Predictive Reasoning"],
  },
  [PUZZLE_TYPES.GRID_RECALL]: {
    label: "Grid Recall",
    shortLabel: "Recall",
    description: "Spatial memory and attention",
    color: "emerald",
    cognitiveSkills: ["Spatial Memory", "Attention"],
  },
  [PUZZLE_TYPES.LOGIC_GATE]: {
    label: "Logic Gate",
    shortLabel: "Logic",
    description: "Deductive reasoning and rule application",
    color: "amber",
    cognitiveSkills: ["Logical Reasoning", "Deduction"],
  },
};

export function getPuzzleTypeMetadata(puzzleType) {
  return (
    PUZZLE_TYPE_METADATA[puzzleType] ||
    PUZZLE_TYPE_METADATA[PUZZLE_TYPES.PATTERN_RUSH]
  );
}

