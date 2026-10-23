import type { CampActivity, Condition, Effect, MissionStage, Outcome } from '@/systems/missions';

/** The parts of a mission's stages that validation reads: outcomes, conditions, effects. */

/** Every outcome a stage can have: its approaches', options', camp activities', endings'. */
export function outcomes(stage: MissionStage): (Outcome | undefined)[] {
  switch (stage.kind) {
    case 'check':
      return stage.approaches.flatMap((a) => [a.onSuccess, a.onFailure]);
    case 'decision':
      return [...stage.options];
    case 'camp':
      return stage.activities.map(campOutcome);
    case 'ending':
      return [...stage.endings];
    case 'narrative':
    case 'leg':
    case 'combat':
    case 'encounter':
    case 'stop':
      return [];
  }
}

function campOutcome(activity: CampActivity): Outcome | undefined {
  if (activity.kind === 'charge') return activity.outcome;
  return activity.kind === 'watch' ? activity.onSuccess : undefined;
}

/** Every condition a stage reads: its own, its variants', and its choices'. */
export function conditions(stage: MissionStage): (Condition | undefined)[] {
  const own = [
    stage.when,
    ...('variants' in stage ? (stage.variants ?? []).map((v) => v.when) : []),
  ];
  switch (stage.kind) {
    case 'check':
      return [...own, ...stage.approaches.map((a) => a.when)];
    case 'decision':
      return [...own, ...stage.options.map((o) => o.when)];
    case 'camp':
      return [
        ...own,
        ...stage.activities.flatMap((a) => [a.when, a.kind === 'charge' ? a.opensWhen : undefined]),
      ];
    case 'ending':
      return [...own, ...stage.endings.map((e) => e.when)];
    case 'narrative':
    case 'leg':
    case 'combat':
    case 'encounter':
    case 'stop':
      return own;
  }
}

/** Every effect a stage's outcomes can have. */
export function effectsOf(stage: MissionStage): Effect[] {
  return outcomes(stage).flatMap((o) => o?.effects ?? []);
}
