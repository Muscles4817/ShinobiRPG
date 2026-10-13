import { crewOptions, DANGERS, type Danger } from '@/systems/missions';

import { jobProfile } from './jobProfile';
import type { ContentPack, EnemyDef } from './types';

/**
 * Who may be sent on each job. Every foe's danger fits their strength (a petty foe can't be a
 * real fight), and the assignment rules hold for every job in the pack: no genin alone against armed foes, no chūnin on an unsafe B-rank job, no chūnin on an
 * A-rank job without a jōnin over them.
 */

/** The base stats each danger may have: a petty foe is no stronger than a fresh genin's best. */
const DANGER_BASE: Readonly<Record<Danger, { readonly min: number; readonly max: number }>> = {
  petty: { min: 0, max: 6 },
  armed: { min: 3, max: 9 },
  deadly: { min: 8, max: 13 },
  elite: { min: 12, max: Infinity },
};

function enemyProblems(enemy: EnemyDef): string[] {
  if (!DANGERS.includes(enemy.danger)) return [`enemy "${enemy.id}" has an unknown danger`];
  const band = DANGER_BASE[enemy.danger];
  return enemy.baseStat < band.min || enemy.baseStat > band.max
    ? [
        `enemy "${enemy.id}" is too ${enemy.baseStat < band.min ? 'weak' : 'strong'} to be ${enemy.danger}`,
      ]
    : [];
}

const SEASONED = 99;

export function validateCrews(pack: ContentPack): string[] {
  const enemies = new Map(pack.enemies.map((e) => [e.id, e]));
  const jobs = pack.missions.filter((m) => !m.examOnly);
  return [
    ...pack.enemies.flatMap(enemyProblems),
    ...jobs.flatMap((m) => {
      const job = jobProfile(m, (id) => enemies.get(id));
      const genin = crewOptions(job, { rank: 'genin', seniorMissions: 0 });
      const chunin = crewOptions(job, { rank: 'chunin', seniorMissions: SEASONED });
      const soloDanger = job.danger !== null && job.danger !== 'petty';
      return [
        ...(soloDanger && genin.some((o) => o.kind === 'solo')
          ? [`mission "${m.id}" would send a genin alone against ${job.danger} foes`]
          : []),
        ...(job.rank === 'A' && chunin.some((o) => o.kind !== 'jonin-led')
          ? [`mission "${m.id}" would send chūnin on an A-rank job without a jōnin`]
          : []),
        ...(job.danger === 'elite' && chunin.length > 0
          ? [`mission "${m.id}" would send chūnin against elite foes`]
          : []),
      ];
    }),
  ];
}
