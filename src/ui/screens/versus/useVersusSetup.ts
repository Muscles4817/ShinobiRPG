import { useMemo, useState } from 'react';

import {
  contextForPack,
  OPEN_FILTER,
  packChoices,
  versusProblem,
  versusProfile,
  versusRoster,
  type GameContext,
  type VersusFighter,
  type VersusFilter,
  type VersusGround,
} from '@/game';

import type { Standing } from './RosterBrowser';
import type { Slot } from './SideSlots';

/** The fan pack is the one built for versus play; any pack works. */
const PREFERRED_PACK = 'naruto';

export interface VersusChoice {
  readonly ctx: GameContext;
  /** Your side by roster id, you first. */
  readonly side: readonly string[];
  readonly foes: readonly string[];
  /** Where they fight. */
  readonly ground: VersusGround['id'];
  /** Only watch: your side fights on its own too. */
  readonly watch: boolean;
}

function defaultPack(): string {
  const packs = packChoices();
  return (packs.find((p) => p.id === PREFERRED_PACK) ?? packs[0])?.id ?? '';
}

/** Ids still in this world's roster; a side left empty gets the fallback fighter. */
function kept(ids: readonly string[], roster: readonly VersusFighter[], fallback: number) {
  const known = ids.filter((id) => roster.some((f) => f.id === id));
  const first = roster[fallback]?.id ?? roster[0]?.id;
  return known.length > 0 ? known : first ? [first] : [];
}

/** A side with the slot set to `id`: replaced, or added at the end. */
function placed(ids: readonly string[], index: number, id: string): string[] {
  return index >= ids.length ? [...ids, id] : ids.map((old, i) => (i === index ? id : old));
}

/**
 * Everything the versus setup keeps, for either layout: the world, both sides, the ground, the
 * roster filter, which slot is being chosen for and whose profile is open.
 */
export function useVersusSetup(initial: VersusChoice | null) {
  const packs = useMemo(() => packChoices(), []);
  const [packId, setPackId] = useState(() => initial?.ctx.content.packId ?? defaultPack());
  const ctx = useMemo(() => contextForPack(packId), [packId]);
  const roster = useMemo(() => (ctx ? versusRoster(ctx) : []), [ctx]);
  const [sideIds, setSideIds] = useState<readonly string[]>(initial?.side ?? []);
  const [foeIds, setFoeIds] = useState<readonly string[]>(initial?.foes ?? []);
  const [ground, setGround] = useState<VersusGround['id']>(initial?.ground ?? 'arena');
  const [filter, setFilter] = useState<VersusFilter>(OPEN_FILTER);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const side = kept(sideIds, roster, 0);
  const foes = kept(foeIds, roster, 1);
  const problem = ctx ? versusProblem(ctx, side, foes) : 'Choose a world.';
  const profile = useMemo(
    () => (ctx && focusId ? versusProfile(ctx, focusId) : null),
    [ctx, focusId],
  );

  const idsOf = (s: Slot) => (s.side === 'side' ? side : foes);
  const idAt = (s: Slot): string | null => idsOf(s)[s.index] ?? null;

  /** Choosing for a slot opens the profile of whoever is in it; filters stay, a search doesn't. */
  const openSlot = (s: Slot | null) => {
    setSlot(s);
    setFocusId(s ? idAt(s) : null);
    setFilter((f) => ({ ...f, query: '' }));
  };

  /** The sides with `id` put in the slot. */
  const withPlaced = (s: Slot, id: string) => ({
    side: s.side === 'side' ? placed(side, s.index, id) : side,
    foes: s.side === 'foes' ? placed(foes, s.index, id) : foes,
  });

  /** Why `id` can't go in the slot, or null. */
  const placeProblem = (s: Slot, id: string): string | null => {
    const next = withPlaced(s, id);
    return ctx ? versusProblem(ctx, next.side, next.foes) : 'Choose a world.';
  };

  const place = (s: Slot, id: string) => {
    const next = withPlaced(s, id);
    setSideIds(next.side);
    setFoeIds(next.foes);
  };

  const remove = (s: Slot) => {
    const without = idsOf(s).filter((_, i) => i !== s.index);
    if (s.side === 'side') setSideIds(without);
    else setFoeIds(without);
    if (slot?.side === s.side) openSlot(null);
  };

  const swap = () => {
    setSideIds(foes);
    setFoeIds(side);
  };

  const standingOf = (id: string): Standing => {
    if (side.includes(id)) return 'side';
    return foes.includes(id) ? 'foes' : null;
  };

  return {
    packs,
    packId,
    setPackId,
    ctx,
    roster,
    side,
    foes,
    ground,
    setGround,
    filter,
    setFilter,
    slot,
    openSlot,
    focusId,
    setFocusId,
    profile,
    idAt,
    place,
    placeProblem,
    remove,
    swap,
    standingOf,
    problem,
  };
}

export type VersusSetupState = ReturnType<typeof useVersusSetup>;
