import type { CombatAttributes } from '../../contract';
import { maxBreath } from '../../rules/breath';
import { poolsLine } from '../../rules/narration';

/**
 * Where fighters' health and pools stand, as the story tells them (`say` in `state.ts`): each line
 * carries what moved since the one before, so the screen folds them in order
 * (`views/fightReplay.ts`). Typed by shape, so `state.ts` can tell without importing back.
 */

export type Pools = Readonly<Record<string, Readonly<Record<string, number>>>>;

interface Pooled {
  readonly id: string;
  readonly health: number;
  readonly chakra: number;
  readonly attributes: CombatAttributes;
  readonly breath?: number;
  readonly will?: number;
  readonly swarm?: { readonly count: number };
  readonly dust?: { readonly count: number };
}

/** A fighter's health and pools as the screen shows them. */
export function poolsOf(f: Pooled): Record<string, number> {
  return {
    health: f.health,
    chakra: f.chakra,
    breath: f.breath ?? maxBreath(f.attributes),
    ...(f.will !== undefined ? { will: f.will } : {}),
    ...(f.swarm ? { hive: f.swarm.count } : {}),
    ...(f.dust ? { dust: f.dust.count } : {}),
  };
}

export function poolsNow(fighters: readonly Pooled[]): Pools {
  return Object.fromEntries(fighters.map((f) => [f.id, poolsOf(f)]));
}

/** What moved between two tellings, by fighter; someone gone from the field is told at nothing. */
export function poolsMovedSince(was: Pools | undefined, now: Pools): Pools {
  const moved = Object.entries(now).flatMap(([id, theirs]): [string, Record<string, number>][] => {
    const before = was?.[id];
    const changed = Object.entries(theirs).filter(([pool, n]) => before?.[pool] !== n);
    return changed.length > 0 ? [[id, Object.fromEntries(changed)]] : [];
  });
  const gone = Object.keys(was ?? {}).filter((id) => !(id in now) && (was?.[id]?.health ?? 0) > 0);
  const left = gone.map((id): [string, Record<string, number>] => [id, { health: 0 }]);
  return Object.fromEntries([...moved, ...left]);
}

interface Told {
  readonly lines: readonly string[];
  readonly fighters: readonly Pooled[];
  readonly toldPools?: Pools;
}

/**
 * The story so far brought level with the fighters as an exchange ends: everyone's pools in full
 * on its last line, so what is shown once it has played is the fight as it stands.
 */
export function toldInFull<R extends Told>(round: R): R {
  const last = round.lines.at(-1);
  if (last === undefined) return round;
  const now = poolsNow(round.fighters);
  const said = poolsLine(last, { ...poolsMovedSince(round.toldPools, now), ...now });
  return { ...round, lines: [...round.lines.slice(0, -1), said], toldPools: now };
}

/**
 * Tells lines, the one writer of the story. The first line carries where the health and pools of
 * everyone they moved for stand now (`poolsLine`), since the line before: what is shown is folded
 * from what is told, in order (`views/fightReplay.ts`), so a change shows with the first line
 * after it. Tell a change after making it.
 */
export function say<R extends Told>(round: R, ...lines: string[]): R {
  const [first, ...rest] = lines;
  if (first === undefined) return round;
  const now = poolsNow(round.fighters);
  const moved = poolsMovedSince(round.toldPools, now);
  return { ...round, lines: [...round.lines, poolsLine(first, moved), ...rest], toldPools: now };
}
