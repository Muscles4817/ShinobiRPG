import type { Rng } from '@/core';
import type { RangeBand } from '@/systems/combat';
import {
  addLedger,
  advance,
  afterFailedApproach,
  raiseAlertness,
  stagePay,
  withStagePay,
  type ApproachId,
  type EncounterEnd,
  type MissionNote,
} from '@/systems/missions';
import { spend } from '@/systems/wallet';

import type { GameContext } from '../context';
import { beginCombat, afterStage, failMission, type FightStart } from '../missionFlow';
import type { GameState } from '../state';
import { approachPlans, bribeCost, type ApproachPlan } from './approaches';
import { encounterHere, withEncounter, type EncounterHere } from './current';
import { groundMeans, toolInPouch, useTool } from './means';
import { ambushOpening, CAUGHT_OPENING, groundOpening, headOnOpening } from './opening';

/**
 * Playing an approach: a fight with the opening it earned, a way past that pays as the job says
 * (`stagePay`), a failure that leaves the foes more alert, or a withdrawal.
 */

/** Pulling out before it comes to blows costs less face than failing. */
export const WITHDRAW_REPUTATION_LOSS = 1;
/** Where an ambush or prepared ground starts when no distance was chosen. */
const DEFAULT_RANGE: RangeBand = 'close';

const UNDONE_REASON = 'You got past them, but the job was to deal with them. Nobody pays for that.';
const WITHDRAW_REASON =
  'You pulled back before it came to blows. The job will wait for someone else.';

/** The debrief's line for each way past the foes. */
const END_LINES: Readonly<Record<EncounterEnd, string>> = {
  fought: 'Fought your way past them.',
  'slipped-past': 'Slipped past them unseen.',
  'talked-down': 'Talked them down without a fight.',
  'paid-off': 'Paid them to go.',
};

interface Played {
  readonly here: EncounterHere;
  readonly plan: ApproachPlan;
  readonly range: RangeBand;
}

function choiceNote(plan: ApproachPlan): MissionNote {
  return { kind: 'choice', text: plan.label };
}

function rollNotes(plan: ApproachPlan, success: boolean): MissionNote[] {
  return plan.stat ? [{ kind: 'roll', stat: plan.stat, chance: plan.chance, success }] : [];
}

/** The way past worked: the stage is over, and the job pays (or doesn't) as its kind says. */
function getPast(
  state: GameState,
  ctx: GameContext,
  here: EncounterHere,
  ending: { readonly end: EncounterEnd; readonly notes: readonly MissionNote[] },
): GameState {
  const pay = stagePay(here.stage.job, ending.end);
  if (!pay.jobDone) return failMission(state, ctx, UNDONE_REASON, 0);
  const share = pay.ryo - 1;
  const told = addLedger(here.run, {
    text: END_LINES[ending.end],
    tone: share < 0 ? 'cost' : 'plain',
    ...(share !== 0 ? { pay: share } : {}),
  });
  const run = withStagePay(advance(told, ...ending.notes), pay);
  return afterStage({ ...state, mission: run }, ctx);
}

/** Into the fight, with the notes on how it began kept in the story. */
function fight(
  state: GameState,
  ctx: GameContext,
  rng: Rng,
  begin: { readonly notes: readonly MissionNote[]; readonly start: FightStart },
): GameState {
  const { mission } = state;
  if (!mission) return state;
  const noted = { ...state, mission: { ...mission, notes: [...mission.notes, ...begin.notes] } };
  return beginCombat(noted, ctx, rng, begin.start);
}

/** It didn't work, but nobody is fighting yet: they're more alert and it can't be tried again. */
function stirred(state: GameState, played: Played, notes: readonly MissionNote[]): GameState {
  const { here, plan } = played;
  const alertness = raiseAlertness(here.encounter.alertness);
  const encounter = afterFailedApproach(here.encounter, plan.id, alertness);
  return { ...state, mission: withEncounter(here, encounter, ...notes) };
}

function sneak(state: GameState, ctx: GameContext, played: Played, rng: Rng): GameState {
  const { here, plan } = played;
  const smoke = toolInPouch(state, ctx, 'smoke');
  const used = smoke ? useTool(state, smoke) : state;
  const success = rng.chance(plan.chance);
  const notes = [choiceNote(plan), ...rollNotes(plan, success)];
  if (success) {
    const story: MissionNote = { kind: 'story', text: here.flavour.slipped };
    return getPast(used, ctx, here, { end: 'slipped-past', notes: [...notes, story] });
  }
  const caught: MissionNote = { kind: 'story', text: here.flavour.caught };
  return fight(used, ctx, rng, { notes: [...notes, caught], start: { opening: CAUGHT_OPENING } });
}

function talk(state: GameState, ctx: GameContext, played: Played, rng: Rng): GameState {
  const { here, plan } = played;
  const success = rng.chance(plan.chance);
  const notes = [choiceNote(plan), ...rollNotes(plan, success)];
  if (success) {
    const story: MissionNote = { kind: 'story', text: here.flavour.parley };
    return getPast(state, ctx, here, { end: 'talked-down', notes: [...notes, story] });
  }
  if (plan.id === 'intimidate') {
    const story: MissionNote = { kind: 'story', text: 'They don’t scare. They come at you.' };
    return fight(state, ctx, rng, { notes: [...notes, story], start: { opening: CAUGHT_OPENING } });
  }
  return stirred(state, played, [...notes, { kind: 'story', text: 'They laugh you off.' }]);
}

function bribe(state: GameState, ctx: GameContext, played: Played): GameState {
  const paid = spend(state.wallet, bribeCost(played.here));
  if (!paid.ok) return state;
  const notes: MissionNote[] = [
    choiceNote(played.plan),
    { kind: 'story', text: played.here.flavour.parley },
  ];
  return getPast({ ...state, wallet: paid.value }, ctx, played.here, { end: 'paid-off', notes });
}

function setGround(state: GameState, ctx: GameContext, played: Played, rng: Rng): GameState {
  const { here, plan, range } = played;
  const means = groundMeans(state, ctx);
  if (!means) return state;
  const used = means.kind === 'smoke' ? useTool(state, means.tool) : state;
  const success = rng.chance(plan.chance);
  const notes = [choiceNote(plan), ...rollNotes(plan, success)];
  if (!success) {
    return stirred(used, played, [...notes, { kind: 'story', text: here.flavour.noticed }]);
  }
  const ready: MissionNote = { kind: 'story', text: `${means.name}: the ground is yours.` };
  const opening = groundOpening(here, range, means);
  return fight(used, ctx, rng, { notes: [...notes, ready], start: { opening } });
}

function play(state: GameState, ctx: GameContext, played: Played, rng: Rng): GameState {
  const { here, plan, range } = played;
  switch (plan.id) {
    case 'head-on': {
      const opening = headOnOpening(here.encounter.alertness);
      return fight(state, ctx, rng, {
        notes: [choiceNote(plan)],
        start: opening ? { opening } : {},
      });
    }
    case 'ambush':
      return fight(state, ctx, rng, {
        notes: [choiceNote(plan), { kind: 'story', text: here.flavour.ambush }],
        start: { opening: ambushOpening(here, range), intro: here.flavour.ambush },
      });
    case 'sneak':
      return sneak(state, ctx, played, rng);
    case 'talk':
    case 'intimidate':
      return talk(state, ctx, played, rng);
    case 'bribe':
      return bribe(state, ctx, played);
    case 'set-ground':
      return setGround(state, ctx, played, rng);
    case 'withdraw':
      return failMission(state, ctx, WITHDRAW_REASON, WITHDRAW_REPUTATION_LOSS);
  }
}

/** Plays an approach the player picked (already checked open). */
export function performApproach(
  state: GameState,
  ctx: GameContext,
  choice: { readonly approach: ApproachId; readonly range?: RangeBand | undefined },
  rng: Rng,
): GameState {
  const here = encounterHere(state, ctx);
  if (!here) return state;
  const plan = approachPlans(state, ctx, here).find((p) => p.id === choice.approach);
  if (!plan) return state;
  return play(state, ctx, { here, plan, range: choice.range ?? DEFAULT_RANGE }, rng);
}
