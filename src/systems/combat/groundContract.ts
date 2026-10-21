/**
 * Where a fight happens (`rules/ground.ts`): an open arena, a forest, a town's streets and
 * roofs, a room with no space to back away, a lake only water-walkers stand on, or open desert
 * under the sun.
 */
export const COMBAT_GROUNDS = ['arena', 'forest', 'town', 'room', 'lake', 'desert'] as const;
export type CombatGround = (typeof COMBAT_GROUNDS)[number];
