import { QUALITY_GRADES, type ClanDef, type DustDef } from '@/content';
import type { CombatantSetup, CombatDust, DustKind, DustQuality } from '@/systems/combat';
import { fullStore, storeCap, type DustStore } from '@/systems/dusts';
import type { Stats } from '@/systems/stats';
import { maxChakra } from '@/systems/vitals';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { chakraBody } from '../hives/hive';

/**
 * Your commanded dust (`systems/dusts`, `docs/design/retinue-plan.md` step 4e): the kind you
 * command and the store you carry, how much you can hold up (your full chakra decides), and the
 * dust as it goes into a fight. People of a dust clan fight with a full store.
 */

/** A kind of dust as the fight reads it: grades as 1 (E) to 5 (A). */
export function dustKindOf(def: DustDef): DustKind {
  const graded = (q: DustQuality) => QUALITY_GRADES.indexOf(def.qualities[q]) + 1;
  return {
    name: def.name,
    qualities: { weight: graded('weight'), hold: graded('hold'), draw: graded('draw') },
    gifts: def.gifts,
    banes: def.banes,
    drawnOn: def.drawnOn,
  };
}

/** Whether a ground gives this dust back (sand, ash), rather than only what is carried. */
export function drawable(def: DustDef): boolean {
  return def.drawnOn.length > 0;
}

/** Your store, its kind and how much you can hold up, or null without one. */
export function yourDust(
  state: Pick<GameState, 'character' | 'hive' | 'dust'>,
  ctx: GameContext,
): { readonly store: DustStore; readonly def: DustDef; readonly cap: number } | null {
  const store = state.dust;
  const def = store ? ctx.content.dusts.get(store.dustId) : undefined;
  if (!store || !def) return null;
  return { store, def, cap: storeCap(maxChakra(chakraBody(state))) };
}

/** Your dust as it goes into a fight, if you command any. */
export function dustPool(
  state: Pick<GameState, 'character' | 'hive' | 'dust'>,
  ctx: GameContext,
): Pick<CombatantSetup, 'dust'> {
  const yours = yourDust(state, ctx);
  if (!yours) return {};
  return { dust: { kind: dustKindOf(yours.def), count: yours.store.count, cap: yours.cap } };
}

/** The store a child of this clan is born with, full: none for a clan without dust. */
export function bornDust(
  clan: ClanDef | undefined,
  stats: Stats,
  ctx: GameContext,
): DustStore | null {
  const def = clan?.dust ? ctx.content.dusts.get(clan.dust.dustId) : undefined;
  return def ? fullStore(def.id, maxChakra(stats)) : null;
}

/**
 * A person's dust in a fight, a full store: their arsenal's (a versus fighter), else their
 * clan's; none for most.
 */
export function personDust(
  chakra: number,
  person: { readonly clan: ClanDef | undefined; readonly arsenalDust: string | undefined },
  ctx: GameContext,
): CombatDust | undefined {
  const dustId = person.arsenalDust ?? person.clan?.dust?.dustId;
  const def = dustId ? ctx.content.dusts.get(dustId) : undefined;
  if (!def) return undefined;
  const cap = storeCap(chakra);
  return { kind: dustKindOf(def), count: cap, cap };
}
