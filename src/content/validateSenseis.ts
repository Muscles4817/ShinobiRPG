import { CURRICULUM_BEATS } from './curriculum';
import type { PersonDef } from './people';
import { TEST_APPROACHES } from './senseiTests';
import type { SenseiWays } from './senseis';
import type { ContentPack } from './types';

/**
 * Checks how each sensei runs a team: numbers in range, lists that aren't empty, and the ways
 * hang together (a teamwork sensei drills the team and keeps a team day; a tight grip means
 * real sessions; a sensei who reads hidden talent pays attention; rewards they can give).
 */

/** Friendship stages run 0 (stranger) to 4 (bonded). */
const MAX_STAGE = 4;
const DAYS_PER_WEEK = 7;
/** A tight grip claims at least this many sessions a week; a loose one at most… */
const TIGHT_SESSIONS = 3;
const LOOSE_SESSIONS = 3;

export function validateSenseis(pack: ContentPack): string[] {
  return [
    ...pack.people.flatMap((p) => {
      const ways = p.sensei?.ways;
      if (!ways) return [];
      const test =
        ways.test === 'none' || pack.senseiTests.some((t) => t.id === ways.test)
          ? []
          : [`sets the "${ways.test}" test, which the pack doesn’t have`];
      return [...waysProblems(p, ways), ...test, ...storyProblems(pack, p, ways)].map(
        (problem) => `sensei "${p.id}" ${problem}`,
      );
    }),
    ...testProblems(pack),
    ...curriculumProblems(pack),
  ];
}

/** Friendship stages a sensei's story is told over, one beat each: acquaintance to bonded. */
const STORY_STAGES = 4;

/** Their story is one personal conversation per stage, in order; their arc is real. */
function storyProblems(pack: ContentPack, person: PersonDef, ways: SenseiWays): string[] {
  const { beats, arcId } = ways.story;
  const problems = beats.length === STORY_STAGES ? [] : [`needs ${STORY_STAGES} story beats`];
  beats.forEach((id, i) => {
    const talk = pack.conversations.find((c) => c.id === id);
    if (talk?.personId !== person.id) problems.push(`tells unknown story beat "${id}"`);
    else if (talk.minStage !== i + 1) problems.push(`tells story beat "${id}" at the wrong stage`);
  });
  if (arcId !== undefined && !pack.arcs.some((a) => a.id === arcId)) {
    problems.push(`leads unknown arc "${arcId}"`);
  }
  return problems;
}

/** A test is rounds of real choices, each a known way of going at it. */
function testProblems(pack: ContentPack): string[] {
  return pack.senseiTests.flatMap((test) => [
    ...(test.rounds.length > 0 ? [] : [`sensei test "${test.id}" has no rounds`]),
    ...test.rounds.flatMap((round, i) => [
      ...(round.options.length >= 2
        ? []
        : [`sensei test "${test.id}" round ${i + 1} needs choices`]),
      ...round.options
        .filter((o) => !TEST_APPROACHES.includes(o.approach))
        .map((o) => `sensei test "${test.id}" has an unknown approach "${o.approach}"`),
    ]),
  ]);
}

/** The curriculum teaches every beat, once. */
function curriculumProblems(pack: ContentPack): string[] {
  const ids = pack.curriculum.map((b) => b.id);
  return CURRICULUM_BEATS.filter((id) => ids.filter((b) => b === id).length !== 1).map(
    (id) => `curriculum needs exactly one "${id}" beat`,
  );
}

function inStages(stage: number): boolean {
  return Number.isInteger(stage) && stage >= 0 && stage <= MAX_STAGE;
}

function unique(items: readonly string[]): boolean {
  return new Set(items).size === items.length;
}

function shapeProblems(ways: SenseiWays): string[] {
  const { cadence, gatekeeping } = ways;
  return [
    ...(Number.isInteger(cadence.sessions) && cadence.sessions >= 1
      ? cadence.sessions <= DAYS_PER_WEEK
        ? []
        : ['trains you more than once a day']
      : ['needs at least one session a week']),
    ...(inStages(ways.loosensAtStage) && ways.loosensAtStage > 0
      ? []
      : ['loosens at a stage outside 1–4']),
    ...(inStages(gatekeeping.passStage) && inStages(gatekeeping.permitStage)
      ? []
      : ['gatekeeps at a stage outside 0–4']),
    ...(ways.formats.length > 0 && unique(ways.formats) ? [] : ['needs distinct session formats']),
    ...(ways.rewards.length > 0 && unique(ways.rewards) ? [] : ['needs distinct rewards']),
    ...(unique(ways.rituals.map((r) => r.kind)) ? [] : ['keeps the same team day twice']),
  ];
}

function coherenceProblems(person: PersonDef, ways: SenseiWays): string[] {
  const problems: string[] = [];
  if (ways.philosophy === 'teamwork' && !ways.formats.includes('team-drill')) {
    problems.push('teaches teamwork but never drills the team');
  }
  if (ways.philosophy === 'teamwork' && ways.rituals.length === 0) {
    problems.push('teaches teamwork but keeps no team day');
  }
  if (ways.grip === 'tight' && ways.cadence.sessions < TIGHT_SESSIONS) {
    problems.push(`has a tight grip but fewer than ${TIGHT_SESSIONS} sessions a week`);
  }
  if (ways.grip === 'loose' && ways.cadence.sessions > LOOSE_SESSIONS) {
    problems.push(`has a loose grip but more than ${LOOSE_SESSIONS} sessions a week`);
  }
  if (ways.onMissions === 'shield' && ways.grip === 'loose') {
    problems.push('shields you on jobs but lets you be the rest of the week');
  }
  if (ways.lens === 'hidden-talent' && person.teacher?.quirk === 'distracted') {
    problems.push('looks for hidden talent but is too distracted to see it');
  }
  return problems;
}

function rewardProblems(person: PersonDef, ways: SenseiWays): string[] {
  return [
    ...(ways.rewards.includes('signature') && (person.teacher?.teaches.length ?? 0) === 0
      ? ['rewards with a signature but teaches none']
      : []),
    ...(ways.rewards.includes('recipe') && person.favouriteRecipeId === undefined
      ? ['rewards with a recipe but has no favourite to teach']
      : []),
  ];
}

function waysProblems(person: PersonDef, ways: SenseiWays): string[] {
  return [
    ...shapeProblems(ways),
    ...coherenceProblems(person, ways),
    ...rewardProblems(person, ways),
  ];
}
