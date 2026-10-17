import { combine, type ModifierSpec, type Modifiers } from '@/systems/modifiers';
import { CLASS_STANDINGS, notesLeft, STANDING_INFO } from '@/systems/profile';
import { STAT_IDS, STAT_INFO, type StatId } from '@/systems/stats';
import { DISCIPLINES, ELEMENTS } from '@/systems/techniques';

import type { GameContext } from '../context';
import type { CreationDraft } from '../creation';
import { notesAptitude, notesOf } from '../notes';
import { traitNames } from './creationQuirks';

/**
 * The academy file read back, as the instructors would: how hard the road looks (the standing,
 * moved a little by how full the file is), what comes easy and hard (every identity spec on the
 * file, put together, and the gifts and flaws), what people will think (the habits) and where
 * talent you know of stops. In words only: what the player is told is what the code does.
 */

export const ROAD_STEPS = ['Hard road', 'Uphill', 'Steady', 'Smooth', 'Easy going'] as const;

export interface FileReadBack {
  readonly road: { readonly steps: readonly string[]; readonly at: number };
  readonly verdict: string;
  readonly note: string;
  readonly easy: readonly string[];
  readonly hard: readonly string[];
  readonly people: readonly string[];
  readonly limits: readonly string[];
}

const WHERE_YOU_START: readonly string[] = [
  'Everyone in your year starts ahead of you.',
  'Most of your year starts ahead of you.',
  'You start about where most of your year does.',
  'You start ahead of most of your year.',
  'You’ll outgrow your year quickly.',
];
const LOW_ROAD =
  'Hard work still pays: training alone keeps its worth longer for you than for anyone else. You can climb; it just takes longer.';
const HIGH_ROAD =
  'Fights at your own grade are still close: your edge is how fast you reach the next one, not winning every bout.';
const MIDDLE_ROAD = 'Your talent is still mostly hidden. Training will show you what it is.';

/** A multiplier read as a pace: null when it is too small a change to mention. */
function pace(by: number): { word: string; easy: boolean } | null {
  if (by >= 1.25) return { word: 'very quickly', easy: true };
  if (by >= 1.05) return { word: 'quickly', easy: true };
  if (by <= 0.75) return { word: 'very slowly', easy: false };
  return by <= 0.95 ? { word: 'slowly', easy: false } : null;
}

interface Read {
  readonly easy: string[];
  readonly hard: string[];
}

function paced(read: Read, subject: string, by: number): void {
  const p = pace(by);
  if (p) (p.easy ? read.easy : read.hard).push(`${subject} ${p.word}`);
}

/** The middle of a set of multipliers: what holds for most of them. */
function usual(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 1;
}

/** One line for what holds for most, then only the ones that stand out from it. */
function spread<K extends string>(
  read: Read,
  keys: readonly K[],
  by: (k: K) => number,
  say: Saying<K>,
): void {
  const most = usual(keys.map(by));
  paced(read, say.all, most);
  for (const k of keys) {
    const ratio = by(k) / most;
    if (ratio >= 1.05) read.easy.push(`${say.one(k)}, faster still`);
    if (ratio <= 0.95) read.hard.push(`${say.one(k)}, slower than the rest`);
  }
}

interface Saying<K> {
  readonly all: string;
  readonly one: (k: K) => string;
}

function growthReads(read: Read, mods: Modifiers): void {
  spread(read, STAT_IDS, (id) => mods.growth[id], {
    all: 'Every stat grows',
    one: (id) => STAT_INFO[id].label,
  });
}

function studyReads(read: Read, mods: Modifiers): void {
  spread(read, DISCIPLINES, (d) => mods.studyDiscipline[d], {
    all: 'Techniques come',
    one: (d) => `${STAT_INFO[d].label} techniques`,
  });
  for (const e of ELEMENTS) {
    paced(read, `${e.charAt(0).toUpperCase()}${e.slice(1)} techniques come`, mods.studyElement[e]);
  }
}

function dayReads(read: Read, mods: Modifiers): void {
  if (mods.hungerRate > 1.05) read.hard.push('Staying fed: you get hungry often');
  if (mods.hungerRate < 0.95) read.easy.push('Going a long while without food');
  if (mods.energyCost < 0.95) read.easy.push('Hard work: it tires you less');
  if (mods.energyCost > 1.05) read.hard.push('Hard work: it tires you more');
  if (mods.sleepHealing < 0.95) read.hard.push('Sleeping it off: sleep heals you less');
  if (mods.injuryNights > 0) read.easy.push('Mending: injuries heal sooner');
  paced(read, 'People warm to you', mods.bondGain);
  if (mods.afterDark > 1) read.easy.push('Training after dark');
  if (mods.afterDark > 1) read.hard.push('Training in the morning');
}

function fileSpecs(draft: CreationDraft, ctx: GameContext): ModifierSpec[] {
  const { content } = ctx;
  return [
    content.clans.get(draft.clanId)?.modifiers ?? {},
    content.builds.get(draft.buildId)?.modifiers ?? {},
    content.upbringings.get(draft.upbringingId)?.modifiers ?? {},
    ...draft.traitIds.flatMap((id) => content.traits.get(id)?.modifiers ?? []),
    ...notesOf(draft.talentIds, ctx).map((n) => n.modifiers),
  ];
}

function giftReads(read: Read, draft: CreationDraft, ctx: GameContext): void {
  for (const id of STAT_IDS) {
    const gift = draft.file.gifts[id];
    const label = STAT_INFO[id].label;
    if (gift === 'prodigy') read.easy.unshift(`${label}, faster and further than anyone`);
    if (gift === 'gifted') read.easy.unshift(`${label}, fast and far`);
    if (gift === 'flawed') read.hard.unshift(`${label}: it grows slowly and stops early`);
  }
  const never = notesAptitude(notesOf(draft.talentIds, ctx));
  for (const id of STAT_IDS) {
    if (never[id] === 0) read.hard.unshift(`${STAT_INFO[id].label} will never come`);
  }
}

/** Where the road sits: the standing, a step easier for a file filled to the brim. */
function roadStep(draft: CreationDraft, ctx: GameContext): number {
  const base = CLASS_STANDINGS.indexOf(draft.standing);
  const left = notesLeft(
    notesOf(draft.talentIds, ctx).map((n) => n.weight),
    STANDING_INFO[draft.standing].notes,
  );
  const full = left.major <= 0 && left.minor <= 0;
  const gifted = Object.values(draft.file.gifts).some((g) => g !== 'flawed');
  const lift = full && gifted ? 1 : 0;
  return Math.min(ROAD_STEPS.length - 1, base + lift);
}

function peopleReads(draft: CreationDraft, ctx: GameContext): string[] {
  const quirks = draft.quirkIds.flatMap((id) => ctx.content.quirks.get(id) ?? []);
  const warm = traitNames([...new Set(quirks.flatMap((q) => q.warms))], ctx);
  const cool = traitNames([...new Set(quirks.flatMap((q) => q.cools))], ctx);
  const lines = [
    ...(warm ? [`${warm} people will like you sooner.`] : []),
    ...(cool ? [`${cool} people won’t, at first.`] : []),
  ];
  return lines.length > 0
    ? lines
    : ['Nothing stands out yet: people will take you as they find you.'];
}

function limitReads(mods: Modifiers, draft: CreationDraft): string[] {
  const lines = STAT_IDS.flatMap((id: StatId) => {
    const by = mods.limitBonus[id];
    const label = STAT_INFO[id].label;
    if (by > 0) return [`${label} can go further than most.`];
    return by < 0 ? [`${label} tops out early.`] : [];
  });
  const flawed = STAT_IDS.filter((id) => draft.file.gifts[id] === 'flawed');
  return [
    ...lines,
    ...flawed.map((id) => `${STAT_INFO[id].label} stops early.`),
    'Everything else is still hidden: training will tell you where it runs out.',
  ];
}

export function fileReadBack(draft: CreationDraft, ctx: GameContext): FileReadBack {
  const mods = combine(fileSpecs(draft, ctx));
  const read: Read = { easy: [], hard: [] };
  growthReads(read, mods);
  studyReads(read, mods);
  dayReads(read, mods);
  giftReads(read, draft, ctx);
  const at = roadStep(draft, ctx);
  const step = ROAD_STEPS[at] ?? 'Steady';
  return {
    road: { steps: ROAD_STEPS, at },
    verdict: `${step}. ${STANDING_INFO[draft.standing].label}. ${WHERE_YOU_START[at] ?? ''}`,
    note: at <= 1 ? LOW_ROAD : at >= 3 ? HIGH_ROAD : MIDDLE_ROAD,
    easy: read.easy.length > 0 ? read.easy : ['Nothing yet. That’s the point.'],
    hard: read.hard.length > 0 ? read.hard : ['Nothing in particular.'],
    people: peopleReads(draft, ctx),
    limits: limitReads(mods, draft),
  };
}
