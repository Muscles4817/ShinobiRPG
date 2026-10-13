import type { IngredientDef } from '@/content';
import { pantryCount, useUp } from '@/systems/inventory';
import { slotsUntilNextMorning } from '@/systems/time';
import { METER_MAX, sleepRecovery } from '@/systems/vitals';

import { lessonAway } from './actions/trainWith';
import type { GameContext } from './context';
import { crewLeader } from './missionTeam';
import { sleepChakra } from './injuries';
import { adjust, chip, log, spendTime } from './ops';
import type { JournalChip } from '@/systems/journal';
import type { GameState } from './state';

/**
 * Days on the road. Each passes to the next morning: you eat from your pack in the evening
 * (food that keeps, `IngredientDef.road`), sleep in camp (a night's rest, though a bedroll heals
 * less than a bed), and everything that happens when a day ends at home happens here too
 * (hunger, healing, the village moving on). Your sensei, out with the team, gives the week's
 * lesson by the fire.
 */

/** A night in camp heals this share of what a night in your own bed would. */
export const CAMP_HEALTH_SHARE = 0.6;

/** Food in your pack that keeps on the road, best first. */
export function roadFoods(state: GameState, ctx: GameContext): IngredientDef[] {
  return ctx.content.ingredients.all
    .filter((i) => (i.road ?? 0) > 0 && pantryCount(state.inventory, i.id) > 0)
    .sort((a, b) => (b.road ?? 0) - (a.road ?? 0));
}

/** Days of meals in your pack. */
export function rationDays(state: GameState, ctx: GameContext): number {
  return roadFoods(state, ctx).reduce((n, i) => n + pantryCount(state.inventory, i.id), 0);
}

/** The evening meal from your pack, if there's anything in it and you've room for it. */
function eatFromPack(state: GameState, ctx: GameContext): { state: GameState; ate: boolean } {
  const [food] = roadFoods(state, ctx);
  const room = METER_MAX - state.character.vitals.satiety;
  if (!food || room < (food.road ?? 0) / 2) return { state, ate: false };
  const left = useUp(state.inventory, [{ id: food.id, count: 1 }]);
  if (!left.ok) return { state, ate: false };
  const fed = adjust({ ...state, inventory: left.value }, { satiety: food.road ?? 0 });
  return { state: fed, ate: true };
}

/** To the next morning, through a night in camp. */
function nightInCamp(state: GameState, ctx: GameContext): GameState {
  const night = sleepChakra(state);
  const rest = sleepRecovery(state.character.vitals, state.character.stats);
  const slept = spendTime(state, slotsUntilNextMorning(state.time), ctx);
  return adjust(slept, {
    ...rest,
    chakra: night.chakra,
    health: Math.round((rest.health ?? 0) * CAMP_HEALTH_SHARE),
  });
}

interface Days {
  readonly state: GameState;
  readonly meals: number;
  readonly hungryNights: number;
  readonly lesson: boolean;
}

function oneDay(days: Days, ctx: GameContext): Days {
  const eaten = eatFromPack(days.state, ctx);
  const hungry = !eaten.ate && eaten.state.character.vitals.satiety < METER_MAX / 2;
  const slept = nightInCamp(eaten.state, ctx);
  const sensei = days.lesson ? null : senseiAlong(slept, ctx);
  const taught = sensei ? lessonAway(slept, ctx, sensei) : null;
  return {
    state: taught ?? slept,
    meals: days.meals + (eaten.ate ? 1 : 0),
    hungryNights: days.hungryNights + (hungry ? 1 : 0),
    lesson: days.lesson || taught !== null,
  };
}

/** Your sensei, when they lead your team out on this job. */
function senseiAlong(state: GameState, ctx: GameContext) {
  const leader = crewLeader(state, ctx);
  return leader && leader.id === state.people.team?.senseiId ? leader : null;
}

function roadChips(days: number, done: Days): JournalChip[] {
  return [
    chip(days === 1 ? 'A day on the road' : `${days} days on the road`, 'info'),
    ...(done.meals > 0 ? [chip(`${done.meals} from your pack`, 'cost')] : []),
    ...(done.hungryNights > 0
      ? [
          chip(
            done.hungryNights === 1 ? 'A hungry night' : `${done.hungryNights} hungry nights`,
            'harm',
          ),
        ]
      : []),
  ];
}

/** `days` on the road, summed up in `line`, with what they took from you. */
export function travel(state: GameState, ctx: GameContext, days: number, line: string): GameState {
  let done: Days = { state, meals: 0, hungryNights: 0, lesson: false };
  for (let day = 0; day < days; day++) done = oneDay(done, ctx);
  return log(done.state, {
    heading: 'On the road',
    text: line,
    tone: done.hungryNights > 0 ? 'warning' : 'info',
    chips: roadChips(days, done),
  });
}
