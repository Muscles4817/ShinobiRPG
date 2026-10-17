import type { BuildDef, ClanDef, UpbringingDef } from '@/content';
import {
  fileProblems,
  fileStartBonuses,
  type AcademyFile,
  type ClassStanding,
  type EarlyTraining,
  type Student,
} from '@/systems/profile';
import { createStats, STAT_IDS, sumDeltas, type Stats } from '@/systems/stats';

import type { GameContext } from './context';
import { notesAptitude, notesOf } from './notes';

/**
 * A student as the academy file describes them, before the game begins: who raised them, what
 * frame they have, and what their early training and known gifts come to. Creation, its view
 * model and the classmates generator all read a student through here, so a file means the same
 * thing wherever it is written.
 */

/** Every stat before anything is added: what any twelve-year-old has. */
export const BASE_STAT = 5;
/** The clan every pack has for those born outside one (validated). */
const CLANLESS = 'none';

/** What a file needs to know about who wrote it. */
export interface StudentProfile {
  readonly clanId: string;
  readonly talentIds: readonly string[];
  readonly buildId: string;
  readonly upbringingId: string;
  readonly standing: ClassStanding;
  readonly file: AcademyFile;
}

/** The early training an upbringing brings, with the clan's arts filled in. */
export function earlyTraining(upbringing: UpbringingDef, clan: ClanDef): EarlyTraining {
  const focus = upbringing.focus;
  if (!focus) return { points: upbringing.earlyTraining };
  const stats = focus.stats === 'clan-arts' ? clan.arts : focus.stats;
  return { points: upbringing.earlyTraining, focus: { stats, points: focus.points } };
}

/** The student a quick pick fills a file for. */
export function studentOf(
  profile: Omit<StudentProfile, 'file' | 'talentIds'>,
  ctx: GameContext,
): Student {
  const clan = ctx.content.clans.require(profile.clanId);
  const upbringing = ctx.content.upbringings.require(profile.upbringingId);
  const student: Student = {
    standing: profile.standing,
    clanArts: clan.arts,
    early: earlyTraining(upbringing, clan),
  };
  return student;
}

interface Parts {
  readonly clan: ClanDef;
  readonly build: BuildDef;
  readonly upbringing: UpbringingDef;
}

function partsOf(profile: StudentProfile, ctx: GameContext): Parts | null {
  const { content } = ctx;
  const clan = content.clans.get(profile.clanId);
  const build = content.builds.get(profile.buildId);
  const upbringing = content.upbringings.get(profile.upbringingId);
  return clan && build && upbringing ? { clan, build, upbringing } : null;
}

/** Stats on graduation day: the base, then clan, special note, frame and the file. */
export function graduationStats(profile: StudentProfile, ctx: GameContext): Stats {
  const parts = partsOf(profile, ctx);
  const notes = notesOf(profile.talentIds, ctx);
  const stats = createStats(
    BASE_STAT,
    sumDeltas(
      parts?.clan.statBonuses ?? {},
      ...notes.map((n) => n.statBonuses),
      parts?.build.statBonuses ?? {},
      fileStartBonuses(profile.file),
    ),
  );
  // Nobody graduates with less than nothing in a stat.
  return Object.fromEntries(STAT_IDS.map((id) => [id, Math.max(1, stats[id])])) as Stats;
}

/** Everything wrong with how this student was raised and what their file says. */
export function studentProblems(profile: StudentProfile, ctx: GameContext): string[] {
  const parts = partsOf(profile, ctx);
  // An unknown clan is the draft's own problem ("Choose your family"), said once.
  if (!parts)
    return ctx.content.clans.get(profile.clanId) ? ['Choose your upbringing and build.'] : [];
  const { clan, upbringing } = parts;
  const family = clan.id === CLANLESS ? 'clanless' : 'clan';
  const fixes = notesAptitude(notesOf(profile.talentIds, ctx));
  const fixed = STAT_IDS.filter(
    (id) => fixes[id] !== undefined && profile.file.gifts[id] !== undefined,
  );
  return [
    upbringing.family !== family &&
      (family === 'clan'
        ? 'A clan child is raised by the clan.'
        : 'Only clan children are raised by a clan.'),
    fixed.length > 0 &&
      'Your special note already says how far that stat goes; it can’t be a gift or a flaw too.',
    ...fileProblems(profile.file, profile.standing, earlyTraining(upbringing, clan)),
  ].filter((p): p is string => typeof p === 'string');
}
