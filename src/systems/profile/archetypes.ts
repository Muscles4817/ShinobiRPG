import { STAT_IDS, type StatId } from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';

import { fileBalance, type AcademyFile, type EarlyTraining } from './academyFile';
import {
  HIGH_STEPS,
  maxStepsFor,
  nextStepCost,
  pointsIn,
  stepsIn,
  type Development,
} from './development';
import { giftsAllowed, type Bloom, type Gift, type Gifts } from './gifts';
import { STANDING_INFO, type ClassStanding } from './standing';

/**
 * Quick picks: kinds of student, each filling the academy file from whatever the standing and
 * upbringing allow. A slot names a stat, your chosen best art (`specialty`) or your clan's arts.
 * The player can take one as it is or open it up and change it by hand.
 */

export type Slot = StatId | 'specialty' | 'clan-arts';

export const ARCHETYPE_IDS = [
  'steady',
  'clan-heir',
  'athlete',
  'bookworm',
  'all-rounder',
  'early-bloomer',
  'late-bloomer',
  'prodigy',
] as const;
export type ArchetypeId = (typeof ARCHETYPE_IDS)[number];

export interface Archetype {
  readonly label: string;
  readonly note: string;
  /** Where the early training goes, first first. */
  readonly training: readonly Slot[];
  /** Taken one step at a time across the list, rather than each as far as it goes. */
  readonly spread?: boolean;
  /** Gifted stats, first first, as many as the file has room for (the rest wait for a genius). */
  readonly gifts: readonly Slot[];
  /** The first gift is a prodigy's, where the standing allows one. */
  readonly prodigy?: boolean;
  readonly flaw?: StatId;
  readonly bloom: Bloom;
  /** Offered only to clan children. */
  readonly clanOnly?: boolean;
  /** Offered only where a prodigy's gift is. */
  readonly geniusOnly?: boolean;
}

export const ARCHETYPES: Readonly<Record<ArchetypeId, Archetype>> = {
  steady: {
    label: 'Steady student',
    note: 'Good at one art, fit enough for the rest.',
    training: ['specialty', 'speed', 'stamina', 'strength', 'chakraControl'],
    gifts: ['specialty', 'speed'],
    bloom: 'on-time',
  },
  'clan-heir': {
    label: 'Clan heir',
    note: 'Trained in the family arts since you could walk.',
    training: ['clan-arts', 'specialty', 'speed', 'stamina'],
    gifts: ['clan-arts', 'specialty'],
    bloom: 'on-time',
    clanOnly: true,
  },
  athlete: {
    label: 'Natural athlete',
    note: 'Fast, strong and tireless. Books are another matter.',
    training: ['speed', 'strength', 'stamina', 'taijutsu'],
    gifts: ['speed', 'strength', 'stamina'],
    flaw: 'intellect',
    bloom: 'on-time',
  },
  bookworm: {
    label: 'Bookworm',
    note: 'Read the library twice. Gets winded on the stairs.',
    training: ['intellect', 'chakraControl', 'specialty', 'perception'],
    gifts: ['intellect', 'specialty', 'chakraControl'],
    flaw: 'stamina',
    bloom: 'on-time',
  },
  'all-rounder': {
    label: 'All-rounder',
    note: 'A little of everything, nothing left behind.',
    training: ['speed', 'strength', 'stamina', 'specialty', 'chakraControl', 'perception'],
    spread: true,
    gifts: ['specialty', 'stamina'],
    bloom: 'on-time',
  },
  'early-bloomer': {
    label: 'Early bloomer',
    note: 'Ahead of everyone at twelve. Whether it lasts is another question.',
    training: ['specialty', 'speed', 'strength', 'stamina'],
    gifts: ['specialty'],
    bloom: 'early',
  },
  'late-bloomer': {
    label: 'Late bloomer',
    note: 'Behind now. The instructors think it won’t stay that way.',
    training: ['specialty', 'speed'],
    gifts: ['specialty', 'speed', 'stamina'],
    bloom: 'late',
  },
  prodigy: {
    label: 'Prodigy',
    note: 'Fast, sharp and already better than some chūnin at your art.',
    training: ['specialty', 'speed', 'perception', 'stamina', 'strength'],
    gifts: ['specialty', 'speed'],
    prodigy: true,
    bloom: 'on-time',
    geniusOnly: true,
  },
};

/** What a quick pick needs to know about the student. */
export interface QuickPick {
  readonly archetype: ArchetypeId;
  readonly specialty: Discipline;
}

export interface Student {
  readonly standing: ClassStanding;
  readonly clanArts: readonly StatId[];
  readonly early: EarlyTraining;
}

/** Whether this kind of student is on offer. */
export function archetypeOffered(id: ArchetypeId, student: Student): boolean {
  const kind = ARCHETYPES[id];
  if (kind.clanOnly && student.clanArts.length === 0) return false;
  return !kind.geniusOnly || STANDING_INFO[student.standing].gifts.prodigy;
}

function statsOf(slots: readonly Slot[], pick: QuickPick, clanArts: readonly StatId[]): StatId[] {
  const stats = slots.flatMap((slot) => {
    if (slot === 'specialty') return [pick.specialty];
    return slot === 'clan-arts' ? clanArts : [slot];
  });
  return [...new Set(stats)];
}

function chosenGifts(kind: Archetype, pick: QuickPick, student: Student): Gifts {
  const allowance = STANDING_INFO[student.standing].gifts;
  const gifts: Partial<Record<StatId, Gift>> = {};
  if (kind.flaw && allowance.flaws > 0) gifts[kind.flaw] = 'flawed';
  let left = giftsAllowed(allowance, kind.bloom);
  for (const [i, stat] of statsOf(kind.gifts, pick, student.clanArts).entries()) {
    if (gifts[stat] === 'flawed') continue;
    if (kind.prodigy && allowance.prodigy && i === 0 && left >= 2) {
      gifts[stat] = 'prodigy';
      left -= 2;
    } else if (left >= 1) {
      gifts[stat] = 'gifted';
      left -= 1;
    }
  }
  return gifts;
}

/** One step more in `stat` if it is allowed and affordable; the same file otherwise. */
function stepUp(file: AcademyFile, stat: StatId, student: Student, upTo: number): AcademyFile {
  const steps = stepsIn(file.development, stat);
  const allowance = STANDING_INFO[student.standing].development;
  const cap = Math.min(upTo, maxStepsFor(file.development, stat, allowance));
  const cost = nextStepCost(steps);
  const { points } = fileBalance(file, student.standing, student.early);
  if (steps >= cap || cost === null || cost > points) return file;
  const development: Development = { ...file.development, [stat]: steps + 1 };
  return { ...file, development };
}

/** Raises each stat as far as it goes, in order (or one step at a time across them). */
function trained(file: AcademyFile, stats: readonly StatId[], student: Student, spread: boolean) {
  let next = file;
  const open = stats.filter((id) => file.gifts[id] !== 'flawed');
  if (!spread) {
    for (const stat of open) {
      for (let i = 0; i < HIGH_STEPS; i++) next = stepUp(next, stat, student, HIGH_STEPS);
    }
    return next;
  }
  for (let depth = 1; depth <= HIGH_STEPS; depth++) {
    for (const stat of open) next = stepUp(next, stat, student, depth);
  }
  return next;
}

/** The training an upbringing insists on, a step at a time across its arts, and no more. */
function focused(file: AcademyFile, student: Student): AcademyFile {
  const focus = student.early.focus;
  if (!focus || focus.stats.length === 0) return file;
  let next = file;
  for (let depth = 1; depth <= HIGH_STEPS; depth++) {
    for (const stat of focus.stats) {
      if (pointsIn(next.development, focus.stats) >= focus.points) return next;
      next = stepUp(next, stat, student, depth);
    }
  }
  return next;
}

/** The file this kind of student would have, from what the standing and upbringing allow. */
export function quickFile(pick: QuickPick, student: Student): AcademyFile {
  const kind = ARCHETYPES[pick.archetype];
  const noGiftToTrade = kind.bloom === 'early' && STANDING_INFO[student.standing].gifts.gifts === 0;
  const bloom = noGiftToTrade ? 'on-time' : kind.bloom;
  const start: AcademyFile = {
    development: {},
    gifts: chosenGifts({ ...kind, bloom }, pick, student),
    bloom,
  };
  const training = statsOf(kind.training, pick, student.clanArts);
  const own = trained(focused(start, student), training, student, kind.spread === true);
  // Whatever is left goes a step at a time into everything, so no point is wasted.
  return trained(own, STAT_IDS, student, true);
}
