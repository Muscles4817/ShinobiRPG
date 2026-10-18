import { conditionRefs, type Effect } from '@/systems/missions';

import { conditions, effectsOf } from './storyParts';
import type { ContentPack } from './types';

/**
 * Every village tally a job reads is one some job counts, and only a job that can't be done
 * twice counts one (an arc's job, or a job done once), so nobody farms mercy off the board.
 */
export function tallyProblems(pack: ContentPack): string[] {
  const counted = new Set(
    pack.missions
      .flatMap((m) => m.stages.flatMap(effectsOf))
      .flatMap((e) => (e.kind === 'tally' ? [e.tally] : [])),
  );
  const inArcs = new Set(pack.arcs.flatMap((a) => a.acts.flatMap((act) => act.jobs)));
  return [
    ...pack.missions.flatMap((m) =>
      m.stages
        .flatMap(conditions)
        .flatMap((c) => conditionRefs(c).tallies)
        .filter((tally) => !counted.has(tally))
        .map((tally) => `mission "${m.id}" reads tally "${tally}", which no job counts`),
    ),
    ...pack.missions
      .filter((m) => !m.once && !inArcs.has(m.id) && m.stages.flatMap(effectsOf).some(isTally))
      .map((m) => `mission "${m.id}" counts a tally but can be done again and again`),
  ];
}

function isTally(effect: Effect): boolean {
  return effect.kind === 'tally';
}
