import type { PersonDef } from '@/content';
import { STAT_IDS, STAT_INFO, statTier, type StatGrade } from '@/systems/stats';
import { gradeIndex, gradeOf, type Discipline, type TechniqueDef } from '@/systems/techniques';
import { slotName, TIME_SLOTS, type TimeSlot } from '@/systems/time';

import type { GameContext } from '../context';
import { canDoNow } from '../people/capable';
import { growsOnTheirOwn, personStats } from '../people/progress';
import type { GameState } from '../state';

/**
 * What a profile shows of someone beyond your bond: their day (where they are at each time,
 * now marked), what they can do today and what they're still growing into (with what unlocks
 * each: their grade in its art, their control, their reserves; `capable.ts` decides), and for a
 * genin, where they've grown since the academy (peers train on their own).
 */

export interface DaySlot {
  readonly slot: string;
  /** The place they keep then, or "Away". */
  readonly where: string;
  readonly now: boolean;
}

export interface ArtChip {
  readonly id: string;
  readonly name: string;
  readonly discipline: Discipline;
  /** The art in words. */
  readonly art: string;
  readonly rank: TechniqueDef['rank'];
}

export interface Arts {
  readonly doable: readonly ArtChip[];
  /** The nearest few they're growing into, lowest rank first. */
  readonly growing: readonly (ArtChip & { readonly when: string })[];
  /** How many more wait beyond those. */
  readonly moreGrowing: number;
}

/** How many techniques still out of reach a profile names; the rest are counted. */
const GROWING_SHOWN = 6;

export interface Growth {
  readonly stat: string;
  readonly from: StatGrade;
  readonly to: StatGrade;
}

const SLOT_WORDS: Readonly<Record<TimeSlot, string>> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
};

/** Their day: where they are at each time, in the place they live. */
export function dayOf(state: GameState, ctx: GameContext, person: PersonDef): DaySlot[] {
  const homeId = person.homeLocationId ?? ctx.content.startLocationId;
  const home = ctx.content.locations.get(homeId);
  const here = state.locationId === homeId;
  const current = slotName(state.time);
  return TIME_SLOTS.map((slot) => {
    const placeId = person.schedule[slot];
    const place = placeId ? home?.places.find((p) => p.id === placeId) : undefined;
    return { slot: SLOT_WORDS[slot], where: place?.name ?? 'Away', now: here && slot === current };
  });
}

function chipOf(def: TechniqueDef): ArtChip {
  return {
    id: def.id,
    name: def.name,
    discipline: def.discipline,
    art: STAT_INFO[def.discipline].label,
    rank: def.rank,
  };
}

/** What a technique still waits on in them, as a phrase. */
function waitsOn(def: TechniqueDef, person: PersonDef, state: GameState): string {
  const stats = personStats(person, state);
  if (gradeIndex(gradeOf(stats[def.discipline])) < gradeIndex(def.rank)) {
    return `When their ${STAT_INFO[def.discipline].label.toLowerCase()} reaches ${def.rank}`;
  }
  const control = def.needs?.control;
  if (control && gradeIndex(gradeOf(stats.chakraControl)) < gradeIndex(control)) {
    return `When their chakra control reaches ${control}`;
  }
  return 'When their reserves run deeper';
}

/** Everything they'll ever fight with or teach: what they can do now, and what waits. */
export function artsOf(state: GameState, ctx: GameContext, person: PersonDef): Arts | null {
  const ids = [
    ...new Set([...(person.arsenal?.techniqueIds ?? []), ...(person.teacher?.teaches ?? [])]),
  ];
  if (ids.length === 0) return null;
  const defs = ids.flatMap((id) => {
    const def = ctx.content.techniques.get(id);
    // A clan's arts belong to its members alone; anyone else never grows into them.
    return def && (def.clan === undefined || def.clan === person.clanId) ? [def] : [];
  });
  const now = defs.filter((d) => canDoNow(person, state, ctx, d.id));
  const waiting = defs
    .filter((d) => !now.includes(d))
    .sort((a, b) => gradeIndex(a.rank) - gradeIndex(b.rank));
  return {
    doable: now.map(chipOf),
    growing: waiting
      .slice(0, GROWING_SHOWN)
      .map((d) => ({ ...chipOf(d), when: waitsOn(d, person, state) })),
    moreGrowing: Math.max(0, waiting.length - GROWING_SHOWN),
  };
}

/** For a genin, the stats whose grade has risen since the academy; null for anyone else. */
export function growthOf(state: GameState, person: PersonDef): Growth[] | null {
  if (!growsOnTheirOwn(person)) return null;
  const now = personStats(person, state);
  return STAT_IDS.flatMap((id) => {
    const from = statTier(person.stats[id]).grade;
    const to = statTier(now[id]).grade;
    return from === to ? [] : [{ stat: STAT_INFO[id].label, from, to }];
  });
}
