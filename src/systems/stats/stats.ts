import { round2 } from '@/core';

/**
 * Character attributes. Adding a stat = add it here and give it a label/group;
 * everything else (training, checks, UI) is driven off this list.
 */
export const STAT_IDS = [
  'strength',
  'speed',
  'stamina',
  'reserves',
  'chakraControl',
  'intellect',
  'perception',
  'willpower',
  'taijutsu',
  'ninjutsu',
  'genjutsu',
  'kenjutsu',
  'fuuinjutsu',
] as const;
export type StatId = (typeof STAT_IDS)[number];

export type StatGroup = 'body' | 'mind' | 'discipline';

export const STAT_INFO: Readonly<Record<StatId, { label: string; group: StatGroup }>> = {
  strength: { label: 'Strength', group: 'body' },
  speed: { label: 'Speed', group: 'body' },
  stamina: { label: 'Stamina', group: 'body' },
  reserves: { label: 'Chakra Reserves', group: 'body' },
  chakraControl: { label: 'Chakra Control', group: 'mind' },
  intellect: { label: 'Intellect', group: 'mind' },
  perception: { label: 'Perception', group: 'mind' },
  willpower: { label: 'Willpower', group: 'mind' },
  taijutsu: { label: 'Taijutsu', group: 'discipline' },
  ninjutsu: { label: 'Ninjutsu', group: 'discipline' },
  genjutsu: { label: 'Genjutsu', group: 'discipline' },
  kenjutsu: { label: 'Kenjutsu', group: 'discipline' },
  fuuinjutsu: { label: 'Fūinjutsu', group: 'discipline' },
};

export type Stats = Readonly<Record<StatId, number>>;
export type StatDelta = Readonly<Partial<Record<StatId, number>>>;
/** Per-stat growth multipliers (1 = normal). Missing stats grow normally. */
export type StatScale = Readonly<Partial<Record<StatId, number>>>;

export function createStats(base: number, bonuses: StatDelta = {}): Stats {
  const entries = STAT_IDS.map((id) => [id, base + (bonuses[id] ?? 0)] as const);
  return Object.fromEntries(entries) as Record<StatId, number>;
}

/** Stat-by-stat difference `after - before`, omitting unchanged stats. */
export function diffStats(before: Stats, after: Stats): StatDelta {
  const delta: Partial<Record<StatId, number>> = {};
  for (const id of STAT_IDS) {
    const d = round2(after[id] - before[id]);
    if (d !== 0) delta[id] = d;
  }
  return delta;
}

/** Adds several stat deltas together. */
export function sumDeltas(...deltas: readonly StatDelta[]): StatDelta {
  const total: Partial<Record<StatId, number>> = {};
  for (const delta of deltas) {
    for (const [id, value] of Object.entries(delta) as [StatId, number][]) {
      total[id] = (total[id] ?? 0) + value;
    }
  }
  return total;
}
