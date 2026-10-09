import { round1 } from '@/core';

/**
 * Character attributes. Adding a stat = add it here and give it a label/group;
 * everything else (training, checks, UI) is driven off this list.
 */
export const STAT_IDS = [
  'strength',
  'speed',
  'stamina',
  'chakraControl',
  'intellect',
  'perception',
  'willpower',
  'taijutsu',
  'ninjutsu',
  'genjutsu',
] as const;
export type StatId = (typeof STAT_IDS)[number];

export type StatGroup = 'body' | 'mind' | 'discipline';

export const STAT_INFO: Readonly<Record<StatId, { label: string; group: StatGroup }>> = {
  strength: { label: 'Strength', group: 'body' },
  speed: { label: 'Speed', group: 'body' },
  stamina: { label: 'Stamina', group: 'body' },
  chakraControl: { label: 'Chakra Control', group: 'mind' },
  intellect: { label: 'Intellect', group: 'mind' },
  perception: { label: 'Perception', group: 'mind' },
  willpower: { label: 'Willpower', group: 'mind' },
  taijutsu: { label: 'Taijutsu', group: 'discipline' },
  ninjutsu: { label: 'Ninjutsu', group: 'discipline' },
  genjutsu: { label: 'Genjutsu', group: 'discipline' },
};

export type Stats = Readonly<Record<StatId, number>>;
export type StatDelta = Readonly<Partial<Record<StatId, number>>>;

export function createStats(base: number, bonuses: StatDelta = {}): Stats {
  const entries = STAT_IDS.map((id) => [id, base + (bonuses[id] ?? 0)] as const);
  return Object.fromEntries(entries) as Record<StatId, number>;
}

/**
 * Training gain with diminishing returns: the higher a stat already is, the less a
 * session adds. `efficiency` scales the whole gain (e.g. 0.5 when exhausted).
 */
export function trainingGain(current: number, baseGain: number, efficiency = 1): number {
  return round1((baseGain * efficiency) / (1 + current / 25));
}

export function applyTraining(stats: Stats, gains: StatDelta, efficiency = 1): Stats {
  const next: Record<StatId, number> = { ...stats };
  for (const id of STAT_IDS) {
    const base = gains[id];
    if (base !== undefined)
      next[id] = round1(stats[id] + trainingGain(stats[id], base, efficiency));
  }
  return next;
}

/** Stat-by-stat difference `after - before`, omitting unchanged stats. */
export function diffStats(before: Stats, after: Stats): StatDelta {
  const delta: Partial<Record<StatId, number>> = {};
  for (const id of STAT_IDS) {
    const d = round1(after[id] - before[id]);
    if (d !== 0) delta[id] = d;
  }
  return delta;
}

/** Returns the requirements the stats do NOT meet (empty when all are met). */
export function unmetRequirements(stats: Stats, requirements: StatDelta): StatId[] {
  return STAT_IDS.filter((id) => {
    const needed = requirements[id];
    return needed !== undefined && stats[id] < needed;
  });
}
