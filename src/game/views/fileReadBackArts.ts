import type { Modifiers } from '@/systems/modifiers';
import type { Gift } from '@/systems/profile';
import { STAT_IDS, STAT_INFO, type StatId } from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';

/**
 * The file's read-back stat by stat: everything that bears on how fast a stat grows (a gift or
 * flaw, the identity specs, and for an art how fast its techniques come) is weighed into one
 * lean and said once; everything that bears on how far it goes (the gift again, a frame's
 * limit) into one line for the limits. Notes that pull against each other are said as one
 * line with a "but", or not at all when they cancel out, so no stat or art is named twice.
 */

/** A multiplier this far from the usual pace is worth mentioning. */
const NOTICEABLE = 0.05;
const MARKED = 0.25;

export interface ArtLines {
  /** What a note says will never come: said first, before anything hard. */
  readonly never: string[];
  readonly easy: string[];
  readonly hard: string[];
  readonly limits: string[];
}

export interface ArtFacts {
  readonly mods: Modifiers;
  readonly gifts: Readonly<Partial<Record<StatId, Gift>>>;
  /** Stats a note says will never come. */
  readonly never: ReadonlySet<StatId>;
}

const GIFT_PACE: Readonly<Record<Gift, number>> = { prodigy: 2, gifted: 1, flawed: -1 };
const GIFT_REACH: Readonly<Record<Gift, number>> = { prodigy: 2, gifted: 1, flawed: -1 };

/** A ratio to the usual pace as a lean: two steps either way. */
export function leanOf(ratio: number): number {
  if (ratio >= 1 + MARKED) return 2;
  if (ratio >= 1 + NOTICEABLE) return 1;
  if (ratio <= 1 - MARKED) return -2;
  return ratio <= 1 - NOTICEABLE ? -1 : 0;
}

/** The middle of a set of multipliers: what holds for most of them. */
export function usual(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 1;
}

function paceWord(lean: number): string {
  if (lean >= 3) return 'faster than for anyone';
  if (lean === 2) return 'very fast';
  if (lean === 1) return 'fast';
  return lean === -1 ? 'slowly' : 'very slowly';
}

const isArt = (id: StatId): id is Discipline => (DISCIPLINES as readonly string[]).includes(id);

/** "Taijutsu comes fast, and its techniques too"; "Speed comes fast, but its …". */
function artLine(label: string, grows: number, study: number): string {
  if (study === 0) return `${label} comes ${paceWord(grows)}`;
  if (grows === 0) return `${label} techniques come ${paceWord(study)}`;
  const same = Math.sign(grows) === Math.sign(study);
  return same
    ? `${label} comes ${paceWord(grows)}, and its techniques too`
    : `${label} comes ${paceWord(grows)}, but its techniques come ${paceWord(study)}`;
}

function paceLines(facts: ArtFacts, out: ArtLines): void {
  const { mods, gifts } = facts;
  const most = usual(STAT_IDS.map((id) => mods.growth[id]));
  const studyMost = usual(DISCIPLINES.map((d) => mods.studyDiscipline[d]));
  for (const id of STAT_IDS) {
    if (facts.never.has(id)) continue;
    const gift = gifts[id];
    const grows = (gift ? GIFT_PACE[gift] : 0) + leanOf(mods.growth[id] / most);
    const study = isArt(id) ? leanOf(mods.studyDiscipline[id] / studyMost) : 0;
    if (grows === 0 && study === 0) continue;
    (grows + study >= 0 && grows >= 0 ? out.easy : out.hard).push(
      artLine(STAT_INFO[id].label, grows, study),
    );
  }
}

function reachLine(label: string, lean: number): string | null {
  if (lean >= 2) return `${label} can go further than almost anyone’s.`;
  if (lean === 1) return `${label} can go further than most.`;
  if (lean === -1) return `${label} tops out early.`;
  return lean <= -2 ? `${label} tops out very early.` : null;
}

function reachLines(facts: ArtFacts, out: ArtLines): void {
  for (const id of STAT_IDS) {
    if (facts.never.has(id)) continue;
    const gift = facts.gifts[id];
    const lean = (gift ? GIFT_REACH[gift] : 0) + Math.sign(facts.mods.limitBonus[id]);
    const line = reachLine(STAT_INFO[id].label, lean);
    if (line) out.limits.push(line);
  }
}

/** One line per stat for its pace (easy or hard), one for its reach, and the never-comes. */
export function artReads(facts: ArtFacts): ArtLines {
  const out: ArtLines = { never: [], easy: [], hard: [], limits: [] };
  paceLines(facts, out);
  for (const id of facts.never) out.never.push(`${STAT_INFO[id].label} will never come`);
  reachLines(facts, out);
  return out;
}
