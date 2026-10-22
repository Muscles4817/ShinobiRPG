import { QUALITY_GRADES, type ClanDef, type DustDef } from '@/content';
import type { CombatantSetup, CombatDust, DustKind, DustQuality } from '@/systems/combat';
import { fullStore, type DustStore } from '@/systems/dusts';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * Your commanded dust (`systems/dusts`, `docs/design/retinue-plan.md` step 4e): the kind you
 * command and the store you carry, how much your vessel holds (the kind's ordinary vessel, or
 * your clan's), and the dust as it goes into a fight. People of a dust clan fight with a full
 * store. A vessel never grows with chakra: making more in a fight is a draw's work.
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

/** What a vessel of this kind holds: one's own (a clan's, a fighter's), else the ordinary. */
export function vesselOf(def: DustDef, own?: number): number {
  return own ?? def.carried;
}

/** What your vessel holds: your clan's, if it is your clan's dust, else the ordinary. */
function yourVessel(state: Pick<GameState, 'character'>, def: DustDef, ctx: GameContext) {
  const clanDust = ctx.content.clans.get(state.character.clanId)?.dust;
  return vesselOf(def, clanDust?.dustId === def.id ? clanDust.vessel : undefined);
}

/** Your store, its kind and how much your vessel holds, or null without one. */
export function yourDust(
  state: Pick<GameState, 'character' | 'dust'>,
  ctx: GameContext,
): { readonly store: DustStore; readonly def: DustDef; readonly cap: number } | null {
  const kept = state.dust;
  const def = kept ? ctx.content.dusts.get(kept.dustId) : undefined;
  if (!kept || !def) return null;
  const cap = yourVessel(state, def, ctx);
  // A save from when stores grew with chakra may hold more than the vessel does.
  const store = kept.count > cap ? { ...kept, count: cap } : kept;
  return { store, def, cap };
}

/** Your dust as it goes into a fight, if you command any. */
export function dustPool(
  state: Pick<GameState, 'character' | 'dust'>,
  ctx: GameContext,
): Pick<CombatantSetup, 'dust'> {
  const yours = yourDust(state, ctx);
  if (!yours) return {};
  return { dust: { kind: dustKindOf(yours.def), count: yours.store.count, cap: yours.cap } };
}

/** The store a child of this clan is born with, full: none for a clan without dust. */
export function bornDust(clan: ClanDef | undefined, ctx: GameContext): DustStore | null {
  const def = clan?.dust ? ctx.content.dusts.get(clan.dust.dustId) : undefined;
  return def ? fullStore(def.id, vesselOf(def, clan?.dust?.vessel)) : null;
}

/** Whose dust a fighter commands: their own (an arsenal, a foe), else their clan's. */
export interface DustCarrier {
  readonly clan: ClanDef | undefined;
  readonly dustId: string | undefined;
  /** Their own vessel's size, when not the kind's ordinary one. */
  readonly vessel?: number | undefined;
}

/** A person's dust in a fight, a full vessel: their own, else their clan's; none for most. */
export function personDust(carrier: DustCarrier, ctx: GameContext): CombatDust | undefined {
  const own = carrier.dustId !== undefined;
  const dustId = carrier.dustId ?? carrier.clan?.dust?.dustId;
  const def = dustId ? ctx.content.dusts.get(dustId) : undefined;
  if (!def) return undefined;
  const cap = vesselOf(def, own ? carrier.vessel : carrier.clan?.dust?.vessel);
  return { kind: dustKindOf(def), count: cap, cap };
}
