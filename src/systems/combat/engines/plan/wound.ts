import { shouldFlee } from '../../rules/kit';
import { felled } from './falls';
import { breakHold } from './holding';
import { fighterIn, patch, say, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Taking damage off a fighter in a planned fight, whatever dealt it (a blow, a riposte, a
 * lingering harm): a coward who is now badly hurt runs and counts as beaten, one holding a
 * channelled pin loses their grip, and one it fells goes down in the story.
 */
export function wound(round: Round, id: string, damage: number): Round {
  const struck = fighterIn(round, id);
  if (!struck) return round;
  const hurt = { ...struck, health: Math.max(0, struck.health - damage) };
  // Hurting someone holding a channelled pin breaks it (`holding.ts`).
  const held = damage > 0 && struck.holding ? breakHold(round, id) : round;
  const fighters = patch(held.fighters, id, { health: hurt.health });
  if (!shouldFlee(hurt)) {
    const after = { ...held, fighters };
    return hurt.health <= 0 && struck.health > 0 ? felled(after, struck) : after;
  }
  const fled = tell('{t} turn{t.s} and run{t.s}.', { t: struck });
  return say({ ...held, fighters: patch(fighters, id, { health: 0 }) }, fled);
}
