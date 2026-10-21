import { shouldFlee } from '../../rules/kit';
import { felled } from './falls';
import { breakHold } from './holding';
import { popLine, shadowsGone } from './shadows';
import { fighterIn, patch, say, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Taking damage off a fighter in a planned fight, whatever dealt it (a blow, a riposte, a
 * lingering harm): a coward who is now badly hurt runs and counts as beaten, one holding a
 * channelled pin loses their grip, one it fells goes down in the story (and their shadow clones
 * with them), and a shadow clone pops at any hit.
 */
/**
 * What a hit of this much takes from a fighter: never more than they have left. No hit is
 * capped (`docs/design/defence-plan.md`), so a blow far beyond a body is told as what it took.
 */
export function taken(f: { readonly health: number }, damage: number): number {
  return Math.min(damage, Math.max(1, Math.ceil(f.health)));
}

export function wound(round: Round, id: string, damage: number): Round {
  const struck = fighterIn(round, id);
  if (!struck) return round;
  // A shadow clone pops at the first hit that lands (`shadows.ts`).
  if (struck.shadowOf !== undefined && damage > 0 && struck.health > 0) {
    return say({ ...round, fighters: patch(round.fighters, id, { health: 0 }) }, popLine(struck));
  }
  const hurt = { ...struck, health: Math.max(0, struck.health - damage) };
  // Hurting someone holding a channelled pin breaks it (`holding.ts`).
  const held = damage > 0 && struck.holding ? breakHold(round, id) : round;
  const fighters = patch(held.fighters, id, { health: hurt.health });
  if (!shouldFlee(hurt)) {
    const after = { ...held, fighters };
    return hurt.health <= 0 && struck.health > 0
      ? shadowsGone(felled(after, struck), struck)
      : after;
  }
  const fled = tell('{t} turn{t.s} and run{t.s}.', { t: struck });
  return shadowsGone(say({ ...held, fighters: patch(fighters, id, { health: 0 }) }, fled), struck);
}
