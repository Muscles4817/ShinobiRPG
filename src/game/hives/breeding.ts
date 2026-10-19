import type { Rng } from '@/core';
import type { StrainDef } from '@/content';
import {
  crossBegun,
  jarOf,
  MAX_JARS,
  studiedJar,
  understood,
  withJar,
  type Hive,
} from '@/systems/hives';
import { rollCheck } from '@/systems/stats';
import { slotName } from '@/systems/time';

import type { GameContext } from '../context';
import { wildsHere } from '../gathering';
import { atHome } from '../home/home';
import { chip, log } from '../ops';
import type { GameState } from '../state';
import { strainSheet } from './hive';

/**
 * Finding, studying and crossing insects (`docs/design/retinue-plan.md`, step 4c): a host
 * searches a wild place for the insects that live there (at night, the night-flyers too; a
 * sharp eye finds more often), keeps them in jars at home, studies a jar for some days, and
 * crosses it into the hive. What hatches is luck, drawn from the seed and the day it hatches.
 */

/** Perception against this finds insects worth jarring. */
const FINDING_DIFFICULTY = 8;
/** The longest a bred strain's name may be. */
export const NAME_LENGTH = 24;

/** The wild strains that live in this place now. */
export function insectsHere(state: GameState, ctx: GameContext, placeId: string): StrainDef[] {
  const place = wildsHere(state, ctx, placeId);
  if (!place) return [];
  const night = slotName(state.time) === 'night';
  return ctx.content.strains.all.filter(
    (s) => s.wild?.biomes.includes(place.biome) && (night || !s.wild.night),
  );
}

/** Why you can't search this wild place for insects now, or null. */
export function seekBlocker(state: GameState, ctx: GameContext, placeId: string): string | null {
  const hive = state.hive;
  if (!hive) return 'Only someone with a hive in them knows what to look for.';
  if (hive.searchedDay === state.time.day) return 'You have searched for insects today.';
  if ((hive.jars ?? []).length >= MAX_JARS) return 'Your jars are full. Study or cross one first.';
  return insectsHere(state, ctx, placeId).length === 0 ? 'Nothing here worth jarring now.' : null;
}

function withHive(state: GameState, hive: Hive): GameState {
  return { ...state, hive };
}

/** You search a wild place: a sharp eye may find insects to take home in a jar. */
export function seekInsects(
  state: GameState,
  ctx: GameContext,
  placeId: string,
  rng: Rng,
): GameState {
  const hive = state.hive;
  if (!hive) return state;
  const searched = withHive(state, { ...hive, searchedDay: state.time.day });
  const found = rollCheck(state.character.stats.perception, FINDING_DIFFICULTY, rng).success;
  const strain = found ? rng.pick(insectsHere(state, ctx, placeId)) : undefined;
  if (!strain) {
    return log(searched, {
      text: 'You turn over bark and stones, and find nothing worth a jar.',
      tone: 'info',
    });
  }
  const jarred = withHive(searched, withJar({ ...hive, searchedDay: state.time.day }, strain.id));
  return log(jarred, {
    heading: strain.name,
    text: `${strain.description} You coax a few into a jar to take home.`,
    tone: 'success',
    chips: [chip('A new jar', 'gain')],
  });
}

/** Why you can't study this jar now, or null. */
export function studyBlocker(state: GameState, ctx: GameContext, strainId: string): string | null {
  const hive = state.hive;
  const jar = hive ? jarOf(hive, strainId) : undefined;
  if (!hive || !jar) return 'You have no such jar.';
  if (!atHome(state, ctx)) return 'Your jars are at home.';
  if (hive.studiedDay === state.time.day) return 'You have studied a jar today.';
  return understood(jar) ? 'You know these insects already.' : null;
}

export function studyJar(state: GameState, ctx: GameContext, strainId: string): GameState {
  const hive = state.hive;
  if (!hive) return state;
  const next = { ...studiedJar(hive, strainId), studiedDay: state.time.day };
  const jar = jarOf(next, strainId);
  const name = strainSheet(hive, strainId, ctx)?.name ?? 'the insects';
  return log(withHive(state, next), {
    text:
      jar && understood(jar)
        ? `You know ${name.toLowerCase()} now: how they move, what they eat, what they can do.`
        : `You watch ${name.toLowerCase()} for an afternoon, and learn a little of them.`,
    tone: 'info',
  });
}

/** Why you can't cross this jar into your hive now, or null. */
export function crossBlocker(state: GameState, ctx: GameContext, strainId: string): string | null {
  const hive = state.hive;
  const jar = hive ? jarOf(hive, strainId) : undefined;
  if (!hive || !jar) return 'You have no such jar.';
  if (!atHome(state, ctx)) return 'Your hive breeds only at home.';
  if (hive.breeding) return 'A brood is already breeding.';
  return understood(jar) ? null : 'Study them until you understand them first.';
}

export function beginCross(state: GameState, ctx: GameContext, strainId: string): GameState {
  const hive = state.hive;
  if (!hive) return state;
  const name = strainSheet(hive, strainId, ctx)?.name ?? 'the insects';
  return log(withHive(state, crossBegun(hive, strainId, state.time.day)), {
    text: `You let ${name.toLowerCase()} in among your own. Half the hive goes into the brood; in a few days you will see what comes of it.`,
    tone: 'info',
    chips: [chip('Hive thinned', 'cost')],
  });
}

/** Why you can't give your hive's strain this name, or null. */
export function nameBlocker(state: GameState, name: string): string | null {
  const hive = state.hive;
  if (!hive?.bred?.some((s) => s.id === hive.strainId))
    return 'Only a strain you bred is yours to name.';
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Write a name.';
  return trimmed.length > NAME_LENGTH ? 'That name is too long.' : null;
}

export function nameStrain(state: GameState, name: string): GameState {
  const hive = state.hive;
  if (!hive) return state;
  const bred = (hive.bred ?? []).map((s) =>
    s.id === hive.strainId ? { ...s, name: name.trim() } : s,
  );
  return withHive(state, { ...hive, bred });
}
