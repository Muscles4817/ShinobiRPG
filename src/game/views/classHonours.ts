import type { PersonDef } from '@/content';
import { lookOf, type ClassStanding, type Look } from '@/systems/profile';
import { fightingPower, STAT_INFO, type Stats } from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';

import type { GameContext } from '../context';
import { everyone } from '../people/cast';
import { personLook } from '../people/looks';
import { personStats } from '../people/progress';
import type { GameState } from '../state';

/**
 * Graduation day's honours: the year read out before the teams. Your year is you, the pack's
 * genin of the village and the classmates generated with the teams; the order is their real
 * standing (`fightingPower`), with your own place kept inside the band your class standing
 * says, so a dead last is last and a genius first. Honours go by rule: top of the year, the
 * clear best in each art, a couple of characters by trait, and dead last. How many of the year
 * are clan children says how strong a year it was.
 */

export interface Classmate {
  readonly id: string;
  readonly name: string;
  readonly appearance: Look;
  readonly you: boolean;
  /** "Kenjutsu, of the Kurogane". */
  readonly note: string;
  /** "1st". */
  readonly place: string;
}

export interface Honour {
  readonly title: string;
  readonly who: Classmate;
}

export interface ClassHonoursView {
  /** How strong a year it was, by its clan children. */
  readonly year: string;
  readonly honours: readonly Honour[];
  /** The whole year, top first. */
  readonly roll: readonly Classmate[];
}

const YOU = 'you';
/** An art's best must lead the next by this much to be honoured for it. */
const CLEAR_LEAD = 1;
/** Honours for a character, by trait, in order; at most `TRAIT_HONOURS` are given. */
const BY_TRAIT: readonly { readonly trait: string; readonly title: string }[] = [
  { trait: 'diligent', title: 'Never missed a day' },
  { trait: 'tireless', title: 'Last to leave the yard' },
  { trait: 'curious', title: 'Asked the most questions' },
  { trait: 'brash', title: 'Most detentions' },
];
const TRAIT_HONOURS = 2;
/** Where in the year (0 top, 1 bottom) each standing may place you. */
const STANDING_BAND: Readonly<Record<ClassStanding, readonly [number, number]>> = {
  'dead-last': [1, 1],
  'below-average': [0.6, 0.95],
  middle: [0.3, 0.7],
  top: [0.05, 0.3],
  genius: [0, 0],
};
/** Shares of the year born to the clans at which it reads as plain, good and strong. */
const THIN_YEAR = 0.2;
const GOOD_YEAR = 0.4;
const STRONG_YEAR = 0.6;
const NUMBER_WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

interface Member {
  readonly id: string;
  readonly name: string;
  readonly appearance: Look;
  readonly stats: Stats;
  readonly specialty: Discipline | null;
  readonly clanId: string | null;
  readonly traitIds: readonly string[];
}

/** The genin of your year: the village's own (authored and generated), not other towns'. */
function yearOf(state: GameState, ctx: GameContext): PersonDef[] {
  return everyone(state, ctx).filter((p) => p.role === 'genin' && !p.homeLocationId);
}

function memberOf(person: PersonDef, state: GameState): Member {
  return {
    id: person.id,
    name: person.name,
    appearance: personLook(person),
    stats: personStats(person, state),
    specialty: person.specialty ?? null,
    clanId: person.clanId && person.clanId !== 'none' ? person.clanId : null,
    traitIds: person.traitIds,
  };
}

function you(state: GameState): Member {
  const { character } = state;
  const best = DISCIPLINES.reduce((a, b) => (character.stats[b] > character.stats[a] ? b : a));
  return {
    id: YOU,
    name: character.name,
    appearance: lookOf(character.appearance, `player:${character.name}`, 'young'),
    stats: character.stats,
    specialty: best,
    clanId: character.clanId === 'none' ? null : character.clanId,
    traitIds: character.traitIds,
  };
}

/** The year top first, you placed by your score but kept inside your standing's band. */
function ordered(others: readonly Member[], me: Member, standing: ClassStanding): Member[] {
  const byScore = [...others].sort((a, b) => fightingPower(b.stats) - fightingPower(a.stats));
  const natural = byScore.filter((m) => fightingPower(m.stats) > fightingPower(me.stats)).length;
  const [from, to] = STANDING_BAND[standing];
  const place = Math.round(Math.min(Math.max(natural, from * others.length), to * others.length));
  return [...byScore.slice(0, place), me, ...byScore.slice(place)];
}

function noteOf(member: Member, ctx: GameContext): string {
  const art = member.specialty ? STAT_INFO[member.specialty].label : 'All-rounder';
  const clan = member.clanId ? ctx.content.clans.get(member.clanId) : undefined;
  return clan ? `${art}, of the ${clan.name}` : `${art}, clanless`;
}

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

type Honouring = (member: Member, title: string) => Honour[];

function artHonours(year: readonly Member[], honour: Honouring) {
  return DISCIPLINES.flatMap((art) => {
    const [best, next] = [...year].sort((a, b) => b.stats[art] - a.stats[art]);
    if (!best || (next && best.stats[art] - next.stats[art] < CLEAR_LEAD)) return [];
    return honour(best, `Top in ${STAT_INFO[art].label.toLowerCase()}`);
  });
}

function traitHonours(year: readonly Member[], taken: ReadonlySet<string>, honour: Honouring) {
  const given: Honour[] = [];
  for (const { trait, title } of BY_TRAIT) {
    const who = year.find((m) => m.traitIds.includes(trait) && !taken.has(m.id));
    if (!who || given.length >= TRAIT_HONOURS) continue;
    given.push(...honour(who, title));
  }
  return given;
}

/** How strong a year is, by the share of it born to the old clans. */
function yearLine(heirs: number, size: number): string {
  const count = NUMBER_WORDS[heirs] ?? 'many';
  const share = size === 0 ? 0 : heirs / size;
  if (heirs === 0) return 'A thin year: not one of the old clans sent a child.';
  if (share < THIN_YEAR) return `A thin year: only ${count} of the old clans among you.`;
  if (share < GOOD_YEAR) return `A plain year, with ${count} heirs of the old clans among you.`;
  if (share < STRONG_YEAR) return `A good year: ${count} heirs of the old clans graduate with you.`;
  return `A strong year, the kind the village talks about: ${count} clan heirs among you.`;
}

/** The year's ids top first, `you` among them, as the honours read it; empty before the teams. */
export function yearOrder(state: GameState, ctx: GameContext): readonly string[] {
  if (!state.people.team) return [];
  const others = yearOf(state, ctx).map((p) => memberOf(p, state));
  return ordered(others, you(state), state.character.classStanding).map((m) => m.id);
}

export const YOU_IN_ORDER = YOU;

/** The year's honours, or null before the year is known (teams not yet read). */
export function classHonoursView(state: GameState, ctx: GameContext): ClassHonoursView | null {
  if (!state.people.team) return null;
  const me = you(state);
  const others = yearOf(state, ctx).map((p) => memberOf(p, state));
  const year = ordered(others, me, state.character.classStanding);
  const roll = year.map((m, i) => ({
    id: m.id,
    name: m.name,
    appearance: m.appearance,
    you: m.id === YOU,
    note: noteOf(m, ctx),
    place: ordinal(i + 1),
  }));
  const honour: Honouring = (m, title) => {
    const who = roll.find((c) => c.id === m.id);
    return who ? [{ title, who }] : [];
  };
  const top = year[0];
  const last = year.at(-1);
  const arts = artHonours(year, honour).filter((h) => h.who.id !== top?.id);
  const taken = new Set(
    [top?.id, last?.id, ...arts.map((h) => h.who.id)].flatMap((id) => id ?? []),
  );
  return {
    year: yearLine(others.filter((m) => m.clanId !== null).length, others.length),
    honours: [
      ...(top ? honour(top, 'Top of the year') : []),
      ...arts,
      ...traitHonours(year, taken, honour),
      ...(last && last !== top ? honour(last, 'Dead last') : []),
    ],
    roll,
  };
}
