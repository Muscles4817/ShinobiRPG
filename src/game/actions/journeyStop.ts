import { capitalise, type Rng } from '@/core';
import { drawFind, findsNow } from '@/systems/cooking';
import { stock } from '@/systems/inventory';
import { advance, type MissionRun } from '@/systems/missions';
import { diffStats } from '@/systems/stats';
import { sleepRecovery } from '@/systems/vitals';
import { spend } from '@/systems/wallet';

import type { GameContext } from '../context';
import { noteFinds } from '../fieldBook/record';
import { gatherMoment } from '../gathering';
import { growCharacter, logDiscoveries } from '../growth';
import { chakraBody } from '../hives/hive';
import { roomPrice, stopAt, type StopOffer } from '../journeyStops';
import { activeMission, activeStage, afterStage } from '../missionFlow';
import { adjust, chip, log, statChips } from '../ops';
import { placeInText } from '../placeName';
import { CAMP_HEALTH_SHARE, travel } from '../road';
import type { GameState } from '../state';
import { INN_HEALTH_SHARE } from './inn';
import type { ActionHandler, ActionOf } from './types';

/**
 * Stopping at a place on the way, or walking on (`journeyStops.ts`): a room at a town's inn
 * instead of the camp that would follow, a landmark's sight, or a day in wild country foraging
 * what it grows.
 */

/** A day in wild country turns up this many finds at most. */
const WILD_DAY_FINDS = 2;

interface Stay {
  readonly state: GameState;
  readonly line: string;
  readonly skipCamp: boolean;
}

/** A room for the night: what a bed heals over a night in camp, paid at the desk. */
function stayAtInn(state: GameState, ctx: GameContext, offer: StopOffer & { kind: 'inn' }): Stay {
  const price = roomPrice(state, ctx, offer);
  const paid = spend(state.wallet, price);
  if (!paid.ok) return { state, line: '', skipCamp: false };
  const night = sleepRecovery(state.character.vitals, chakraBody(state)).health ?? 0;
  const health = Math.round(night * (INN_HEALTH_SHARE - CAMP_HEALTH_SHARE));
  const rested = adjust({ ...state, wallet: paid.value }, { health });
  const line = `You take a room at ${placeInText(offer.inn.name)} and sleep in a bed for a change.`;
  const logged = log(rested, {
    heading: `A room at ${placeInText(offer.inn.name)}`,
    text: line,
    tone: 'info',
    chips: [chip(`−${price} ryo`, 'cost'), chip(`+${health} health`, 'gain')],
  });
  return { state: logged, line, skipCamp: true };
}

/** A landmark's sight: what you see there, and a little of what it teaches. */
function stayAtSight(
  state: GameState,
  ctx: GameContext,
  offer: StopOffer & { kind: 'sight' },
): Stay {
  const grown = growCharacter(state.character, offer.sight.reward, ctx);
  const changed = diffStats(state.character.stats, grown.character.stats);
  const logged = log(
    { ...state, character: grown.character },
    {
      heading: offer.location.name,
      text: offer.sight.text,
      tone: 'success',
      chips: statChips(changed),
    },
  );
  return {
    state: logDiscoveries(logged, grown.discovered, ctx),
    line: offer.sight.text,
    skipCamp: false,
  };
}

/** A day in wild country: the day passes as on the road, and it gives up what grows there. */
function stayInWilds(
  state: GameState,
  ctx: GameContext,
  offer: StopOffer & { kind: 'wild' },
  rng: Rng,
): Stay {
  const place = placeInText(offer.location.name);
  const line = `You leave the road for a day and wander ${place}, gathering as you go.`;
  const day = travel(state, ctx, 1, line);
  const finds = findsNow(offer.wilds.finds, gatherMoment(day));
  const ids = Array.from({ length: WILD_DAY_FINDS }, () => rng.next()).flatMap(
    (roll) => drawFind(finds, roll)?.ingredientId ?? [],
  );
  const inventory = ids.reduce((inv, id) => stock(inv, id), day.inventory);
  const found = { ...noteFinds(day, ids), inventory };
  const logged =
    ids.length === 0
      ? found
      : log(found, {
          text: `${capitalise(place)} gives up something for the pot.`,
          tone: 'success',
          chips: ids.map((id) => chip(ctx.content.ingredients.require(id).name, 'gain')),
        });
  return { state: logged, line, skipCamp: false };
}

function stay(state: GameState, ctx: GameContext, offer: StopOffer, rng: Rng): Stay {
  switch (offer.kind) {
    case 'inn':
      return stayAtInn(state, ctx, offer);
    case 'sight':
      return stayAtSight(state, ctx, offer);
    case 'wild':
      return stayInWilds(state, ctx, offer, rng);
  }
}

function passLine(offer: StopOffer | null): string {
  if (!offer) return 'You walk on.';
  const place = placeInText(offer.location.name);
  return offer.kind === 'inn'
    ? `You camp outside ${place} and keep your coin.`
    : `You walk on past ${place}.`;
}

/** On past the stop, and past the camp after it when a bed took its place. */
function onPast(run: MissionRun, line: string, skipCamp: boolean, nextIsCamp: boolean): MissionRun {
  const past = advance(run, { kind: 'story', text: line });
  return skipCamp && nextIsCamp ? advance(past) : past;
}

export const journeyStop: ActionHandler<ActionOf<'journeyStop'>> = {
  check(state, action, ctx) {
    const stage = activeStage(state, ctx);
    if (stage?.kind !== 'stop') return 'There is nowhere to stop here.';
    const offer = stopAt(ctx, stage.locationId);
    if (!action.stay || !offer) return null;
    const price = roomPrice(state, ctx, offer);
    return state.wallet.ryo < price ? `A room costs ${price} ryo.` : null;
  },
  perform(state, action, ctx, rng) {
    const stage = activeStage(state, ctx);
    const def = activeMission(state, ctx);
    if (stage?.kind !== 'stop' || !def) return state;
    const offer = stopAt(ctx, stage.locationId);
    const took = action.stay && offer ? stay(state, ctx, offer, rng) : null;
    const after = took?.state ?? state;
    if (!after.mission) return after;
    const nextIsCamp = def.stages[after.mission.stageIndex + 1]?.kind === 'camp';
    const run = onPast(
      after.mission,
      took?.line ?? passLine(offer),
      took?.skipCamp ?? false,
      nextIsCamp,
    );
    return afterStage({ ...after, mission: run }, ctx);
  },
};
