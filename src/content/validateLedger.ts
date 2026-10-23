import {
  writtenOptions,
  type MissionDef,
  type MissionStage,
  type Outcome,
} from '@/systems/missions';

import type { ContentPack } from './types';

/**
 * The ledger keeps apart from the story (`docs/design/prose-plan.md`): a ledger line is a short
 * fact for the debrief, never a line the player has already read in the scene, and it carries
 * no story-length prose.
 */

/** Longer than this, a ledger line is telling the story again rather than noting a fact. */
export const LEDGER_MAX_WORDS = 16;

function storyLines(stage: MissionStage): string[] {
  switch (stage.kind) {
    case 'check':
      return [
        stage.text,
        stage.success,
        stage.failure,
        ...stage.approaches.flatMap((a) => [a.success ?? '', a.failure ?? '']),
      ];
    case 'decision':
      return [stage.text, ...stage.options.map((o) => o.reply)];
    case 'ending':
      return stage.endings.map((e) => e.text);
    case 'camp':
      return [
        stage.text,
        ...stage.activities.flatMap((a) =>
          a.kind === 'charge'
            ? [a.text, a.guarded]
            : a.kind === 'watch'
              ? [a.success, a.failure]
              : [],
        ),
      ];
    case 'narrative':
    case 'leg':
    case 'combat':
    case 'encounter':
      return [stage.text];
    case 'road':
      return stage.text ? [stage.text] : [];
    case 'stop':
      return [];
  }
}

function outcomesOf(stage: MissionStage): (Outcome | undefined)[] {
  switch (stage.kind) {
    case 'check':
      return stage.approaches.flatMap((a) => [a.onSuccess, a.onFailure]);
    case 'decision':
      return [...stage.options];
    case 'ending':
      return [...stage.endings];
    case 'camp':
      return stage.activities.map((a) =>
        a.kind === 'charge' ? a.outcome : a.kind === 'watch' ? a.onSuccess : undefined,
      );
    case 'narrative':
    case 'leg':
    case 'combat':
    case 'encounter':
    case 'stop':
    case 'road':
      return [];
  }
}

function missionLedgerProblems(m: MissionDef): string[] {
  const told = new Set(m.stages.flatMap(storyLines).filter(Boolean));
  const ledgers = m.stages.flatMap(outcomesOf).flatMap((o) => (o?.ledger ? [o.ledger] : []));
  return [
    ...ledgers
      .filter((line) => told.has(line))
      .map((line) => `mission "${m.id}" writes the story’s own line into the ledger: "${line}"`),
    ...ledgers
      .filter((line) => line.split(/\s+/).length > LEDGER_MAX_WORDS)
      .map((line) => `mission "${m.id}" has a ledger line too long to be a fact: "${line}"`),
  ];
}

export function ledgerProblems(pack: ContentPack): string[] {
  const roadEvents = pack.roadEvents.flatMap((e) =>
    writtenOptions(e)
      .filter((o) => o.ledger !== undefined && o.ledger === o.reply)
      .map((o) => `road event "${e.id}" writes its reply to "${o.label}" into the ledger`),
  );
  return [...pack.missions.flatMap(missionLedgerProblems), ...roadEvents];
}
