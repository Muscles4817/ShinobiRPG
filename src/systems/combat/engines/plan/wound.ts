import { shouldFlee } from '../../rules/kit';
import { felled } from './falls';
import { breakHold } from './holding';
import { puppetsUp } from './puppets';
import { threadsSlip } from '../../rules/puppets';
import { popLine, shadowsGone } from './shadows';
import { setHealth, withHealth } from './health';
import { fighterIn, patch, say, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Taking damage off a fighter in a planned fight, whatever dealt it (a blow, a riposte, a
 * lingering harm, a tool): the one way a hit is taken, so it does everything a hit does. A
 * shadow clone pops at any hit; a hard hit makes a puppeteer's threads slip; one holding a
 * channelled pin loses their grip; a coward who is now badly hurt runs and counts as beaten; and
 * one it fells goes down in the story, their shadow clones with them. The health itself is set
 * by `health.ts`, which records whose hit it was.
 */

/** A hit on someone: how much, and whose it was (none for a harm with no one behind it). */
export interface Hit {
  readonly who: string;
  readonly damage: number;
  readonly by?: string;
}

/**
 * What a hit of this much takes from a fighter: never more than they have left. No hit is
 * capped (`docs/design/defence-plan.md`), so a blow far beyond a body is told as what it took.
 */
export function taken(
  f: { readonly health: number; readonly shadowOf?: string },
  damage: number,
): number {
  // A shadow clone is gone at any hit: it takes all it had.
  if (f.shadowOf !== undefined && f.health > 0) return f.health;
  return Math.min(damage, Math.max(1, Math.ceil(f.health)));
}

/**
 * The hit applied, then told: lines that tell it are said once the health has moved, so the
 * screen shows the hurt with the line that tells it, before any fall.
 */
export function wound(round: Round, hit: Hit, ...told: string[]): Round {
  const { who: id, damage } = hit;
  const by = hit.by ? { by: hit.by } : {};
  const struck = fighterIn(round, id);
  if (!struck) return say(round, ...told);
  // A shadow clone pops at the first hit that lands (`shadows.ts`).
  if (struck.shadowOf !== undefined && damage > 0 && struck.health > 0) {
    const popped = setHealth(round, id, 0, { cause: 'popped', ...by });
    return say(popped, ...told, popLine(struck));
  }
  const health = Math.max(0, struck.health - damage);
  // A hard hit makes a puppeteer's threads slip (`puppets.ts`).
  const slipped = puppetsUp(struck) > 0 && threadsSlip(damage, struck.maxHealth);
  const set = setHealth(round, id, health, { cause: 'hit', ...by });
  const marked = slipped
    ? { ...set, fighters: patch(set.fighters, id, { threadsSlipped: true }) }
    : set;
  const hurt = say(marked, ...told);
  // Hurting someone holding a channelled pin breaks it (`holding.ts`).
  const held = damage > 0 && struck.holding ? breakHold(hurt, id) : hurt;
  if (!shouldFlee(withHealth(struck, health))) {
    return health <= 0 && struck.health > 0 ? shadowsGone(felled(held, struck), struck) : held;
  }
  const fled = tell('{t} turn{t.s} and run{t.s}.', { t: struck });
  const gone = setHealth(held, id, 0, { cause: 'fled' });
  return shadowsGone(say(gone, fled), struck);
}
