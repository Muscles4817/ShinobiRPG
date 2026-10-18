import { combine, type ModifierSpec, type Modifiers } from '@/systems/modifiers';
import { CLASS_STANDINGS, notesLeft, STANDING_INFO } from '@/systems/profile';
import { STAT_IDS, type StatId } from '@/systems/stats';
import { DISCIPLINES, ELEMENTS } from '@/systems/techniques';

import type { GameContext } from '../context';
import type { CreationDraft } from '../creation';
import { notesAptitude, notesOf } from '../notes';
import { traitNames } from './creationQuirks';
import { artReads, leanOf, usual } from './fileReadBackArts';

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
  'Hard work still pays, and training alone keeps its worth longer for you than for anyone else. You can climb, though it will take you longer than most.';
const HIGH_ROAD =
  'Fights at your own grade will still be close. Where you pull ahead is in how quickly you reach the next one, and you won’t win every bout on the way.';
const MIDDLE_ROAD =
  'Your talent is still mostly hidden, and only training will show you what it is.';

/** A multiplier read as a pace: null when it is too small a change to mention. */
function pace(by: number): { word: string; easy: boolean } | null {
  const lean = leanOf(by);
  if (lean === 0) return null;
  const word = { 2: 'very quickly', 1: 'quickly', [-1]: 'slowly', [-2]: 'very slowly' }[lean];
  return { word: word ?? '', easy: lean > 0 };
}

interface Read {
  readonly easy: string[];
  readonly hard: string[];
}

function paced(read: Read, subject: string, by: number): void {
  const p = pace(by);
  if (p) (p.easy ? read.easy : read.hard).push(`${subject} ${p.word}`);
}

/** What holds for every stat and every technique; single arts are read in `artReads`. */
function generalReads(read: Read, mods: Modifiers): void {
  const grows = pace(usual(STAT_IDS.map((id) => mods.growth[id])));
  const tires = leanOf(1 / mods.energyCost);
  // Quick to grow but tired by the work (or the other way round) is one thought, not two.
  if (grows && tires !== 0 && grows.easy !== tires > 0) {
    const line = `Every stat grows ${grows.word}, though hard work tires you ${tires > 0 ? 'less' : 'more'}`;
    (grows.easy ? read.easy : read.hard).push(line);
  } else {
    if (grows) (grows.easy ? read.easy : read.hard).push(`Every stat grows ${grows.word}`);
    if (tires !== 0)
      (tires > 0 ? read.easy : read.hard).push(
        `Hard work tires you ${tires > 0 ? 'less' : 'more'}`,
      );
  }
  paced(read, 'Techniques come', usual(DISCIPLINES.map((d) => mods.studyDiscipline[d])));
  for (const e of ELEMENTS) {
    paced(read, `${e.charAt(0).toUpperCase()}${e.slice(1)} techniques come`, mods.studyElement[e]);
  }
}

function dayReads(read: Read, mods: Modifiers): void {
  if (mods.hungerRate > 1.05) read.hard.push('You get hungry often');
  if (mods.hungerRate < 0.95) read.easy.push('You go a long while without food');
  if (mods.sleepHealing < 0.95) read.hard.push('Sleep heals you less');
  if (mods.injuryNights > 0) read.easy.push('Injuries heal sooner');
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

/** Stats a note on the file says will never come. */
function neverComes(draft: CreationDraft, ctx: GameContext): Set<StatId> {
  const never = notesAptitude(notesOf(draft.talentIds, ctx));
  return new Set(STAT_IDS.filter((id) => never[id] === 0));
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
    : ['Nothing stands out yet, so people will take you as they find you.'];
}

const LIMITS_HIDDEN = 'Everything else is still hidden. Training will tell you where it runs out.';

export function fileReadBack(draft: CreationDraft, ctx: GameContext): FileReadBack {
  const mods = combine(fileSpecs(draft, ctx));
  const arts = artReads({ mods, gifts: draft.file.gifts, never: neverComes(draft, ctx) });
  const read: Read = { easy: [], hard: [...arts.never] };
  generalReads(read, mods);
  read.easy.push(...arts.easy);
  read.hard.push(...arts.hard);
  dayReads(read, mods);
  const at = roadStep(draft, ctx);
  const step = ROAD_STEPS[at] ?? 'Steady';
  return {
    road: { steps: ROAD_STEPS, at },
    verdict: `${step}. ${STANDING_INFO[draft.standing].label}. ${WHERE_YOU_START[at] ?? ''}`,
    note: at <= 1 ? LOW_ROAD : at >= 3 ? HIGH_ROAD : MIDDLE_ROAD,
    easy:
      read.easy.length > 0 ? read.easy : ['Nothing yet, and that’s how it should be at the start.'],
    hard: read.hard.length > 0 ? read.hard : ['Nothing in particular.'],
    people: peopleReads(draft, ctx),
    limits: [...arts.limits, LIMITS_HIDDEN],
  };
}
