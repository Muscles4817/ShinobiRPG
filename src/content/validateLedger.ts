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
 * no story-length prose. A line is something you did unless it declares a subject of its own
 * (`ledgerSubject`); one that opens on somebody else is checked to say so.
 */

/** Longer than this, a ledger line is telling the story again rather than noting a fact. */
export const LEDGER_MAX_WORDS = 16;

/** Words a deed of yours never opens on: they begin a sentence about someone or something else. */
const SOMEONE_ELSE = new Set(
  (
    'The A An No Her His Their Its Our My Your This That These Those Every Each Some One ' +
    'It He She They We You I Everyone Nobody Someone'
  ).split(' '),
);

/**
 * Whether a line opens on somebody else: a word above, a slot that names a person (`{foe}`), or
 * the name of someone in the pack. Such a line must declare its own subject.
 */
export function opensOnSomeoneElse(line: string, names: ReadonlySet<string>): boolean {
  const first = /^[^\s,.]+/.exec(line.trim())?.[0] ?? '';
  return first.startsWith('{') || SOMEONE_ELSE.has(first) || names.has(first);
}

/** The first names of the pack's people and of its foes with names of their own. */
export function namesIn(pack: ContentPack): Set<string> {
  const named = [
    ...pack.people.map((p) => p.name),
    ...pack.enemies.filter((e) => e.proper === true).map((e) => e.name),
  ];
  return new Set(named.flatMap((n) => n.split(/\s+/)[0] ?? []));
}

/** A line told as yours that opens on someone else, or a subject declared with no line. */
function subjectProblems(where: string, outcome: Outcome, names: ReadonlySet<string>): string[] {
  const { ledger, ledgerSubject } = outcome;
  if (ledger === undefined)
    return ledgerSubject ? [`${where} declares a subject with no line`] : [];
  return !ledgerSubject && opensOnSomeoneElse(ledger, names)
    ? [`${where} tells "${ledger}" as yours: give it ledgerSubject 'its-own'`]
    : [];
}

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

function missionLedgerProblems(m: MissionDef, names: ReadonlySet<string>): string[] {
  const told = new Set(m.stages.flatMap(storyLines).filter(Boolean));
  const outcomes = m.stages.flatMap(outcomesOf).flatMap((o) => o ?? []);
  const ledgers = outcomes.flatMap((o) => (o.ledger ? [o.ledger] : []));
  return [
    ...outcomes.flatMap((o) => subjectProblems(`mission "${m.id}"`, o, names)),
    ...ledgers
      .filter((line) => told.has(line))
      .map((line) => `mission "${m.id}" writes the story’s own line into the ledger: "${line}"`),
    ...ledgers
      .filter((line) => line.split(/\s+/).length > LEDGER_MAX_WORDS)
      .map((line) => `mission "${m.id}" has a ledger line too long to be a fact: "${line}"`),
  ];
}

export function ledgerProblems(pack: ContentPack): string[] {
  const names = namesIn(pack);
  const roadEvents = pack.roadEvents.flatMap((e) => [
    ...writtenOptions(e)
      .filter((o) => o.ledger !== undefined && o.ledger === o.reply)
      .map((o) => `road event "${e.id}" writes its reply to "${o.label}" into the ledger`),
    ...writtenOptions(e).flatMap((o) => subjectProblems(`road event "${e.id}"`, o, names)),
  ]);
  return [...pack.missions.flatMap((m) => missionLedgerProblems(m, names)), ...roadEvents];
}
