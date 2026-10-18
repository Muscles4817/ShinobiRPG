import { createRng, fillSlots, hashString, type Rng } from '@/core';
import type { PersonDef } from '@/content';
import type { CombatOutcome } from '@/systems/combat';
import {
  boutLost,
  boutWon,
  conductMark,
  nextStage,
  withConduct,
  withNotes,
  type ConductSignal,
  type ExamRun,
  type TournamentStageDef,
} from '@/systems/exams';
import { createStats } from '@/systems/stats';
import { maxChakra, MAX_HEALTH } from '@/systems/vitals';

import { PLAYER_COMBATANT_ID, playerCombatant } from '../combatants';
import type { GameContext } from '../context';
import { personSlots } from '../people/pronouns';
import { startFight } from '../fightStyle';
import { adjust, spendTime } from '../ops';
import { everyone } from '../people/cast';
import { companionCombatant } from '../people/companions';
import { generateGenin } from '../people/generator';
import type { GameState } from '../state';
import { examHere, withRun, type ExamHere } from './current';
import { chakraBody } from '../hives/hive';

/**
 * The tournament: one-against-one bouts against rivals from other villages, a round at a time.
 * Rivals are generated genin with the grade the round asks for, made from the save's seed and
 * the sitting, so the same exam always brings the same faces. Between bouts the exam's medics
 * patch you up; a bout ends before anyone is really hurt (no hospital, no injury). How you won
 * or why you yielded goes in the examiners' book.
 */

const RIVAL_TAG = 'Rival';
/** Before each bout the medics bring you up to at least this share of health and chakra. */
export const BOUT_READY_SHARE = 0.6;
/** The medics stop a bout before you fall below this share of health. */
const BOUT_HEALTH_FLOOR = 0.2;
/** Yielding below this share of health is sensible; at or above `EARLY_YIELD`, it's giving up. */
const SENSIBLE_YIELD = 0.3;
const EARLY_YIELD = 0.5;
/** Techniques used to win, for the examiners to call it a plan rather than a brawl. */
const CLEVER_WIN_TECHNIQUES = 2;
/** A bout takes a slot of the day. */
const BOUT_SLOTS = 1;
const RIVAL_PREFIX = 'exam-rival-';

function tournamentHere(here: ExamHere | null) {
  if (here?.stage?.kind !== 'tournament' || here.run.progress?.kind !== 'tournament') return null;
  return { ...here, stage: here.stage, progress: here.run.progress };
}

/** The rival you meet in `round` of this sitting: a generated genin of the round's grade. */
export function rivalFor(
  state: GameState,
  ctx: GameContext,
  run: ExamRun,
  round: number,
): PersonDef | null {
  const here = tournamentHere(examHere(state, ctx));
  const best = here?.stage.rivals[round];
  if (!here || best === undefined) return null;
  const seed = state.board.seed;
  const rng = createRng(hashString(`${seed}|${run.examId}|${run.startedDay}|${round}`));
  const taken = everyone(state, ctx).map((p) => p.name);
  const [made] = generateGenin(ctx, rng, { count: 1, takenNames: taken, firstNumber: 0, seed });
  if (!made) return null;
  const specialty = made.specialty ?? 'taijutsu';
  const stats = createStats(here.stage.rivalBase, { [specialty]: best - here.stage.rivalBase });
  return { ...made, id: `${RIVAL_PREFIX}${round}`, title: 'Genin', stats };
}

/** The bout's rival, while one is under way or waiting. */
export function rivalNow(state: GameState, ctx: GameContext): PersonDef | null {
  const here = tournamentHere(examHere(state, ctx));
  return here ? rivalFor(state, ctx, here.run, here.progress.round) : null;
}

/** The medics bring you up to fighting shape for the bout. */
function patchedUp(state: GameState): GameState {
  const { vitals } = state.character;
  const health = Math.max(0, Math.round(MAX_HEALTH * BOUT_READY_SHARE) - vitals.health);
  const chakra = Math.max(
    0,
    Math.round(maxChakra(chakraBody(state)) * BOUT_READY_SHARE) - vitals.chakra,
  );
  return adjust(state, { health, chakra });
}

/** Into the ring for the next bout. */
export function startBout(state: GameState, ctx: GameContext, rng: Rng): GameState {
  const here = tournamentHere(examHere(state, ctx));
  const rival = rivalNow(state, ctx);
  if (!here || !rival || here.progress.fighting) return state;
  const intro = fillSlots(here.stage.bout, personSlots('them', rival));
  const ready = patchedUp(spendTime(state, BOUT_SLOTS, ctx));
  const run = withNotes(here.run, { kind: 'story', text: intro });
  const combat = startFight(
    ready,
    ctx,
    {
      player: playerCombatant(ready, ctx),
      allies: [],
      enemies: [companionCombatant(rival, ready, ctx, RIVAL_TAG)],
      canFlee: true,
      intro,
    },
    rng,
  );
  return { ...withRun(ready, { ...run, progress: { ...here.progress, fighting: true } }), combat };
}

/** Whether the fight under way is a tournament bout. */
export function inBout(state: GameState): boolean {
  const progress = state.exams.run?.progress;
  return progress?.kind === 'tournament' && progress.fighting;
}

function signalFor(outcome: CombatOutcome, health: number): ConductSignal | null {
  const share = health / MAX_HEALTH;
  switch (outcome.result) {
    case 'victory': {
      const used = new Set(outcome.used?.[PLAYER_COMBATANT_ID]?.techniqueIds ?? []);
      return used.size >= CLEVER_WIN_TECHNIQUES ? 'clever-win' : null;
    }
    case 'escaped':
      if (share < SENSIBLE_YIELD) return 'sensible-yield';
      return share >= EARLY_YIELD ? 'early-yield' : null;
    case 'defeat':
      return null;
  }
}

function lineFor(stage: TournamentStageDef, outcome: CombatOutcome, champion: boolean): string {
  if (champion) return stage.champion;
  switch (outcome.result) {
    case 'victory':
      return stage.won;
    case 'escaped':
      return stage.yielded;
    case 'defeat':
      return stage.lost;
  }
}

/** A bout is over: on to the next round, or out of the bracket and on to the verdict. */
export function resolveBout(state: GameState, outcome: CombatOutcome, ctx: GameContext): GameState {
  const here = tournamentHere(examHere(state, ctx));
  const { vitals } = state.character;
  const floor = Math.round(MAX_HEALTH * BOUT_HEALTH_FLOOR);
  const health = Math.max(outcome.player.health, Math.min(floor, vitals.health));
  const after = adjust(
    { ...state, combat: null },
    { health: health - vitals.health, chakra: outcome.player.chakra - vitals.chakra },
  );
  if (!here) return after;
  const signal = signalFor(outcome, outcome.player.health);
  const judged = signal ? withConduct(here.run, conductMark(signal)) : here.run;
  const won = outcome.result === 'victory' ? boutWon(judged, here.stage) : null;
  const line = lineFor(here.stage, outcome, won?.champion ?? false);
  const run = withNotes(won ? won.run : boutLost(judged), { kind: 'outcome', text: line });
  const over = !won || won.champion;
  return withRun(after, over ? nextStage(here.def, run) : run);
}
