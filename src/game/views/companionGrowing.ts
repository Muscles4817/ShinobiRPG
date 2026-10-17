import type { CompanionKindDef } from '@/content';
import {
  BODY_STATS,
  GROWN_ONLY,
  oldEnoughToFight,
  type BodyStat,
  type Companion,
  type LifeStage,
} from '@/systems/companions';
import { STAT_INFO, statTier, type StatId } from '@/systems/stats';

import { trainableStats } from '../actions/companionTraining';
import { genesOf, stageOfLife } from '../companions/body';

/**
 * How your companion is growing, in words: its stage of life and what that looks like, what its
 * kind is built for and never will be (its body's ceiling, read against the kind, never as a
 * number), whether it is big or slight for its kind, and its body and learned skills apart:
 * the body comes with time, the skills with training.
 */

const STAGE_WORDS: Readonly<Record<LifeStage, string>> = {
  pup: 'Pup',
  young: 'Young',
  grown: 'Grown',
};

const STAGE_LINES: Readonly<Record<LifeStage, string>> = {
  pup: 'All paws and ears, and trips over its own feet. Too young to fight; it stays home when you do.',
  young: 'Long in the leg and still filling out. It comes with you to fight now.',
  grown: 'Grown into the body it will have. What it can do from here is down to training.',
};

/** How each body stat reads in "built for …, never for …". */
const BUILT_WORDS: Readonly<Record<BodyStat, string>> = {
  strength: 'brute strength',
  speed: 'speed',
  stamina: 'staying power',
  perception: 'the nose',
};

/** Genes this far either side of its kind make it big or slight for one. */
const GENES_NOTED = 0.06;

export interface CompanionGrowing {
  /** "Pup", "Young", "Grown". */
  readonly stage: string;
  readonly grown: boolean;
  /** What it looks like at this stage, and whether it fights. */
  readonly stageLine: string;
  /** "A stray hound is built for the nose and speed, never for brute strength." */
  readonly builtFor: string;
  /** "Big for a stray hound", "Slight for a kennel hound", or null. */
  readonly genes: string | null;
  /** Its body's grades: they come with time. */
  readonly body: readonly string[];
  /** Its skills' grades: they come with training. */
  readonly learned: readonly string[];
}

function builtFor(kind: CompanionKindDef): string {
  const byAdult = [...BODY_STATS].sort((a, b) => kind.body.adult[b] - kind.body.adult[a]);
  const [first, second] = byAdult;
  const last = byAdult.at(-1);
  const best = [first, second]
    .filter((s): s is BodyStat => s !== undefined)
    .map((s) => BUILT_WORDS[s]);
  const never = last ? `, never for ${BUILT_WORDS[last]}` : '';
  const a = aKind(kind);
  return `${a.charAt(0).toUpperCase()}${a.slice(1)} is built for ${best.join(' and ')}${never}.`;
}

function genesLine(companion: Companion, kind: CompanionKindDef, seed: number): string | null {
  const genes = Object.values(genesOf(companion, kind, seed));
  const mean = genes.reduce((sum, g) => sum + g, 0) / Math.max(1, genes.length);
  if (mean >= 1 + GENES_NOTED) return `Big for ${aKind(kind)}.`;
  return mean <= 1 - GENES_NOTED ? `Slight for ${aKind(kind)}.` : null;
}

function grades(companion: Companion, stats: readonly StatId[]): string[] {
  return stats.map((id) => `${STAT_INFO[id].label} ${statTier(companion.stats[id]).grade}`);
}

/** "a stray hound", "an ox". */
function aKind(kind: CompanionKindDef): string {
  const name = kind.name.toLowerCase();
  return `${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name}`;
}

export function companionGrowing(
  companion: Companion,
  kind: CompanionKindDef,
  seed: number,
): CompanionGrowing {
  const stage = stageOfLife(companion, kind);
  return {
    stage: STAGE_WORDS[stage],
    grown: stage === 'grown',
    stageLine: oldEnoughToFight(stage) ? STAGE_LINES[stage] : STAGE_LINES.pup,
    builtFor: builtFor(kind),
    genes: genesLine(companion, kind, seed),
    body: grades(companion, GROWN_ONLY),
    learned: grades(companion, trainableStats(companion)),
  };
}
