export const ROSTER_REQUIREMENTS = {
  P: 3,
  D: 8,
  C: 8,
  A: 6
} as const;

export type RosterRequirements = typeof ROSTER_REQUIREMENTS;