import type { PersonDef } from './people';
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
  return pack.people.flatMap((p) => {
    const ways = p.sensei?.ways;
    return ways ? waysProblems(p, ways).map((problem) => `sensei "${p.id}" ${problem}`) : [];
  });
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
