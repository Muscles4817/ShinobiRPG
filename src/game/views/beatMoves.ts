import type { FightBeat } from './fightReplay';

/**
 * Whose health a fight's beat moved, and which way, for the watch screen's bars to flash: read
 * from the beat and the one before it (the first beat against everyone's health as the beats
 * began), never from what was last drawn, so a beat says the same whichever way you came to it
 * (stepping back to a hit is still a hit, never a heal).
 */

export type HealthMove = 'hurt' | 'healed';

export function healthMoves(
  beats: readonly FightBeat[],
  at: number,
  started: Readonly<Record<string, number>> = {},
): Readonly<Record<string, HealthMove>> {
  const now = beats[at];
  const was = at === 0 ? { health: started } : beats[at - 1];
  if (!now || !was) return {};
  const moves: Record<string, HealthMove> = {};
  for (const [id, health] of Object.entries(now.health)) {
    const before = was.health[id];
    if (before === undefined || before === health) continue;
    moves[id] = health < before ? 'hurt' : 'healed';
  }
  return moves;
}
