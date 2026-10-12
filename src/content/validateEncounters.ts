import {
  ALWAYS_OPEN,
  encounterApproaches,
  TALK_APPROACHES,
  type EncounterStage,
  type EncounterTemplate,
} from '@/systems/missions';

import type { ContentPack } from './types';

/**
 * Encounter templates make sense on their own (head-on and withdraw always there, real recon,
 * a resolve for foes who'd listen), and every encounter stage names a template, real foes and
 * approaches its foes allow.
 */
export function validateEncounters(pack: ContentPack): string[] {
  const templates = new Map(pack.encounters.map((t) => [t.id, t]));
  return [
    ...pack.encounters.flatMap(templateProblems),
    ...pack.missions.flatMap((m) =>
      m.stages.flatMap((stage) =>
        stage.kind === 'encounter'
          ? stageProblems(stage, templates.get(stage.template), pack).map(
              (p) => `mission "${m.id}" ${p}`,
            )
          : [],
      ),
    ),
  ];
}

function templateProblems(t: EncounterTemplate): string[] {
  const problems: string[] = [];
  const missing = ALWAYS_OPEN.filter((a) => !t.approaches.includes(a));
  if (missing.length > 0) problems.push(`must offer ${missing.join(' and ')}`);
  if (t.recon.length === 0) problems.push('offers no recon');
  if (new Set(t.recon.map((r) => r.id)).size < t.recon.length) problems.push('repeats a recon');
  if (t.recon.some((r) => r.id !== 'ask' && r.difficulty <= 0)) {
    problems.push('has a recon with no difficulty');
  }
  if (t.talkable && t.resolve <= 0) problems.push('would listen but has no resolve');
  if (!t.talkable && t.approaches.some((a) => TALK_APPROACHES.includes(a))) {
    problems.push('offers talk to foes who won’t listen');
  }
  return problems.map((p) => `encounter "${t.id}" ${p}`);
}

function stageProblems(
  stage: EncounterStage,
  template: EncounterTemplate | undefined,
  pack: ContentPack,
): string[] {
  if (!template) return [`uses unknown encounter "${stage.template}"`];
  const enemyIds = new Set(pack.enemies.map((e) => e.id));
  const problems = stage.enemyIds
    .filter((id) => !enemyIds.has(id))
    .map((id) => `references unknown enemy "${id}"`);
  if (stage.enemyIds.length === 0) problems.push('has an encounter with no foes');
  const talkable = stage.talkable ?? template.talkable;
  if (talkable && template.resolve <= 0) {
    problems.push(`makes "${template.id}" foes talkable, but they have no resolve`);
  }
  const offered = encounterApproaches(stage, template);
  if (offered.length <= ALWAYS_OPEN.length) {
    problems.push('has an encounter with nothing but head-on and withdraw');
  }
  return problems;
}
