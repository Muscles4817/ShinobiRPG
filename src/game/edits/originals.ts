import { CONTENT_PACKS, type PersonDef, type PersonRank } from '@/content';
import type { Stats } from '@/systems/stats';
import type { Element } from '@/systems/techniques';

import { enemyStatLine } from '../enemyStats';
import type { GameContext } from '../context';
import { sandboxOf } from '../versus/profile';
import { setupOf } from '../versus/sides';
import { fighterRef, type FighterRef } from './state';

/**
 * A fighter as the pack wrote them, before any edit: what the editor compares against and what
 * a reset goes back to.
 */
export interface FighterOriginal {
  readonly ref: FighterRef;
  readonly stats: Stats;
  /** What they fight with: their arsenal, or for someone without one the kit they're given. */
  readonly techniqueIds: readonly string[];
  /** A person's clan, for the clan techniques they may take; null for a foe. */
  readonly clanId: string | null;
  /** A person's rank; null for a foe. */
  readonly rank: PersonRank | null;
  readonly nature?: Element;
}

/** What someone without an arsenal is given to fight with (the academy's kit and their art's). */
function kitOf(person: PersonDef, ctx: GameContext): readonly string[] {
  const setup = setupOf({ kind: 'person', def: person }, sandboxOf(ctx), ctx, '');
  return setup.techniques.map((t) => t.id);
}

function originalPerson(person: PersonDef, ctx: GameContext, ref: FighterRef): FighterOriginal {
  const nature = person.sensei?.nature;
  return {
    ref,
    stats: person.stats,
    techniqueIds: person.arsenal?.techniqueIds ?? kitOf(person, ctx),
    clanId: person.clanId ?? null,
    rank: person.rank,
    ...(nature ? { nature } : {}),
  };
}

/** The fighter a roster id names as the pack wrote them, or null for one it doesn't have. */
export function originalFighter(ctx: GameContext, key: string): FighterOriginal | null {
  const ref = fighterRef(key);
  const pack = CONTENT_PACKS.find((p) => p.id === ctx.content.packId);
  if (!ref || !pack) return null;
  if (ref.kind === 'enemy') {
    const def = pack.enemies.find((e) => e.id === ref.id);
    if (!def) return null;
    const nature = def.nature;
    return {
      ref,
      stats: enemyStatLine(def),
      techniqueIds: def.techniqueIds,
      clanId: null,
      rank: null,
      ...(nature ? { nature } : {}),
    };
  }
  const person = [...pack.people, ...(pack.duelists ?? [])].find((p) => p.id === ref.id);
  return person && person.rank !== 'civilian' ? originalPerson(person, ctx, ref) : null;
}
