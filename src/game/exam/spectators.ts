import { createRng, hashString, type Rng } from '@/core';
import type { PersonDef } from '@/content';
import type { CombatOutcome } from '@/systems/combat';
import type { ExamDef, TournamentStageDef } from '@/systems/exams';
import { createStats, diffStats } from '@/systems/stats';
import { daysUntil, TIME_SLOTS } from '@/systems/time';

import { PLAYER_COMBATANT_ID } from '../combatants';
import type { GameContext } from '../context';
import { startFight } from '../fightStyle';
import { growCharacter } from '../growth';
import { underSensei } from '../mentorship';
import { log, spendTime, statChips } from '../ops';
import { everyone, requirePerson } from '../people/cast';
import { companionCombatant } from '../people/companions';
import { generateGenin } from '../people/generator';
import { fillNames } from '../people/talk';
import { addReport } from '../reports';
import { waysOf } from '../sensei/generate';
import { mentorOf } from '../sensei/plan';
import type { GameState } from '../state';
import { examAnnounced } from './calendar';
import { nominationBlocker } from './entry';

/**
 * The exam for those not sitting it. In the week before, someone tells you it is coming: your
 * sensei, inviting you to watch when they won't put you forward, or, if they keep too loose a
 * grip to say so, a teammate who heard it in the street. On the day, anyone at home may spend
 * an afternoon in the stands watching the finals: two genin from other villages, stronger than
 * any you have fought, generated from the seed and the sitting, in a fight you only watch. You
 * come away a little sharper for it, and nothing else changes.
 */

/** The finalists stand this far above the last round's rival in their art, and in speed. */
const FINALIST_EDGE = 1.5;
const FINALIST_SPEED_SHARE = 0.75;
/** An afternoon in the stands. */
export const WATCH_SLOTS = 2;
/** What watching closely teaches: an eye for a fight, and a feel for how it was won. */
export const WATCH_GAINS = { perception: 0.6, intellect: 0.4 } as const;
/** The finals are fought by day: you can still catch them in the afternoon. */
const LAST_WATCH_SLOT = TIME_SLOTS.indexOf('afternoon');
const FINALIST_PREFIX = 'exam-finalist-';
const FINALIST_TAG = 'Finalist';

/** What someone tells you of the exam in the week before. */
export interface ExamWord {
  readonly speaker: string;
  readonly text: string;
}

function tournamentOf(exam: ExamDef): TournamentStageDef | null {
  for (const stage of exam.stages) if (stage.kind === 'tournament') return stage;
  return null;
}

/** An exam whose finals are held at home today, if you are home to see them. */
export function finalsToday(state: GameState, ctx: GameContext): ExamDef | null {
  if (state.locationId !== ctx.content.startLocationId) return null;
  const held = (exam: ExamDef) => exam.dates.some((d) => daysUntil(state.time.day, d) === 0);
  return ctx.content.exams.all.find((exam) => held(exam) && tournamentOf(exam)) ?? null;
}

/** The two genin left in today's finals, the same every time they are asked for. */
export function finalists(state: GameState, ctx: GameContext, exam: ExamDef): PersonDef[] {
  const stage = tournamentOf(exam);
  const last = stage?.rivals.at(-1);
  if (!stage || last === undefined) return [];
  const seed = state.board.seed;
  const rng = createRng(hashString(`${seed}|${exam.id}|${state.time.day}|finals`));
  const taken = everyone(state, ctx).map((p) => p.name);
  const made = generateGenin(ctx, rng, { count: 2, takenNames: taken, firstNumber: 0, seed });
  const best = last + FINALIST_EDGE;
  const speed = stage.rivalBase + (best - stage.rivalBase) * FINALIST_SPEED_SHARE;
  return made.map((person, i) => {
    const art = person.specialty ?? 'taijutsu';
    const stats = createStats(stage.rivalBase, { [art]: best - stage.rivalBase, speed });
    return { ...person, id: `${FINALIST_PREFIX}${i}`, title: 'Genin', stats };
  });
}

/** Who tells you the exam is coming, and what they say; null when nobody needs to. */
export function examWord(state: GameState, ctx: GameContext): ExamWord | null {
  const coming = examAnnounced(state, ctx);
  // Put forward, you hear it at the hall; sitting it, you know.
  if (!coming || state.exams.run || !underSensei(state)) return null;
  if (nominationBlocker(state, ctx) === null) return null;
  const sensei = mentorOf(state, ctx);
  if (!sensei) return null;
  const mateId = state.people.team?.teammateIds[0];
  const friend =
    waysOf(sensei)?.grip === 'loose' && mateId ? requirePerson(state, ctx, mateId) : null;
  const speaker = friend ?? sensei;
  const line = friend ? coming.exam.spectators.hearsay : coming.exam.spectators.invitation;
  return {
    speaker: speaker.name,
    text: fillNames(line, { you: state.character.name, them: speaker }),
  };
}

/** Why you can't go and watch the finals now, or null when you can. */
export function watchBlocker(state: GameState, ctx: GameContext): string | null {
  if (!finalsToday(state, ctx)) return 'There are no finals to watch today.';
  if (state.exams.run) return 'You are sitting the exam yourself.';
  if (state.exams.watchedDay === state.time.day) return 'You have watched today’s finals.';
  if (state.time.slot > LAST_WATCH_SLOT) return 'The finals are over for the day.';
  return null;
}

/** Into the stands: an afternoon goes, and the finals are fought in front of you. */
export function watchFinals(state: GameState, ctx: GameContext, rng: Rng): GameState {
  const exam = finalsToday(state, ctx);
  const [a, b] = exam ? finalists(state, ctx, exam) : [];
  if (!exam || !a || !b) return state;
  const intro = exam.spectators.finals.replaceAll('{a}', a.name).replaceAll('{b}', b.name);
  const seated: GameState = {
    ...spendTime(state, WATCH_SLOTS, ctx),
    exams: { ...state.exams, watchedDay: state.time.day, spectating: true },
  };
  const combat = startFight(
    seated,
    ctx,
    {
      player: { ...companionCombatant(a, seated, ctx, FINALIST_TAG), id: PLAYER_COMBATANT_ID },
      allies: [],
      enemies: [companionCombatant(b, seated, ctx, FINALIST_TAG)],
      canFlee: false,
      watch: true,
      intro,
    },
    rng,
  );
  return { ...seated, combat };
}

/** The finals are over: a card for who won, and what watching taught you. Nobody was you. */
export function resolveFinals(
  state: GameState,
  outcome: CombatOutcome,
  ctx: GameContext,
): GameState {
  const exam = finalsToday(state, ctx);
  const [a, b] = exam ? finalists(state, ctx, exam) : [];
  const left = { ...state, combat: null, exams: { ...state.exams, spectating: false } };
  if (!exam || !a || !b) return left;
  const [winner, loser] = outcome.result === 'victory' ? [a, b] : [b, a];
  const grown = growCharacter(state.character, WATCH_GAINS, ctx);
  const taught = diffStats(state.character.stats, grown.character.stats);
  const text = exam.spectators.won
    .replaceAll('{winner}', winner.name)
    .replaceAll('{loser}', loser.name);
  const watched = log(
    { ...left, character: grown.character },
    { heading: exam.name, text, tone: 'success', chips: statChips(taught) },
  );
  return addReport(watched, {
    kind: 'fight',
    result: outcome.result,
    enemies: `${a.name} and ${b.name}`,
    rounds: outcome.rounds,
    damageTaken: 0,
    chakraSpent: 0,
    health: state.character.vitals.health,
    maxHealth: state.character.vitals.health,
    verdict: `${winner.name} wins`,
    taught: statChips(taught).map((c) => c.label),
  });
}
