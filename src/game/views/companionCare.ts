import { stageName, stageOf, stageProgress } from '@/systems/bonds';
import {
  hungerOf,
  laidUp,
  PLAY_KINDS,
  type CompanionHunger,
  type CompanionInjury,
  type PlayKind,
} from '@/systems/companions';
import { pantryCount } from '@/systems/inventory';
import { STAT_INFO, statTier, type StatGrade } from '@/systems/stats';

import { stageOfLife } from '../companions/body';
import { favouriteOf, yourCompanion } from '../companions/care';
import { maxHealthOf } from '../companions/make';
import { trainableStats, TRAIN_ENERGY } from '../actions/companionTraining';
import type { GameContext } from '../context';
import { hardWorkEnergy } from '../profile';
import type { GameState } from '../state';
import { choice, type Choice } from './common';
import { companionGrowing, type CompanionGrowing } from './companionGrowing';
import { companionArts, roleLine, type CompanionArt } from './handling';

/**
 * Your companion's care, wherever it is with you: a strip on the village screen (health,
 * hunger, a stamp when it needs you), its sheet (feed, play, medicine) and the drill for
 * training together at a training ground.
 */

const HUNGER_WORDS: Readonly<Record<CompanionHunger, string>> = {
  fed: 'Not hungry',
  peckish: 'Peckish',
  hungry: 'Hungry',
  starving: 'Starving',
};

const PLAY_WORDS: Readonly<Record<PlayKind, string>> = {
  rough: 'Rough and tumble',
  fetch: 'A game of fetch',
  scent: 'Hide-and-seek by scent',
  walk: 'A quiet walk',
};

export interface CompanionStrip {
  readonly name: string;
  readonly health: number;
  readonly maxHealth: number;
  /** How hungry it is, in a word; null when the stamp already says it. */
  readonly hunger: string | null;
  /** Its stage of life while it is still growing ("Pup", "Young"), or null once grown. */
  readonly stage: string | null;
  /** What needs you now ("Ash is hungry", "Ash is limping"), or null. */
  readonly stamp: string | null;
}

export interface FoodOption extends Choice {
  readonly label: string;
  /** "Its favourite", or how many you have. */
  readonly note: string;
}

export interface CompanionSheet extends CompanionStrip {
  readonly kind: string;
  /** Its body and skills, and how it is growing (`companionGrowing.ts`). */
  readonly growing: CompanionGrowing;
  /** Its kind's arts, known and still to open (`handling.ts`). */
  readonly arts: readonly CompanionArt[];
  /** The job checks it takes for you, or will once you are close; null if none. */
  readonly role: string | null;
  readonly stageName: string;
  readonly progress: number;
  /** Why it is laid up and until when, in words, or null. */
  readonly laidUp: string | null;
  readonly fedToday: boolean;
  readonly foods: readonly FoodOption[];
  readonly plays: readonly (Choice & { readonly label: string })[];
  /** Medicine, while it is injured: doses carried, and the two ways to give one. */
  readonly medicine: {
    readonly doses: number;
    readonly hidden: Choice;
    readonly plain: Choice;
  } | null;
}

function stampFor(
  name: string,
  hunger: CompanionHunger,
  hurt: boolean,
  fed: boolean,
): string | null {
  if (hurt) return `${name} is limping`;
  if (hunger === 'hungry' || hunger === 'starving') return `${name} is ${hunger}`;
  return fed ? null : `${name} hasn’t eaten today`;
}

export function companionStrip(state: GameState, ctx: GameContext): CompanionStrip | null {
  const yours = yourCompanion(state, ctx);
  if (!yours) return null;
  const { companion, kind } = yours;
  const today = state.time.day;
  const hunger = hungerOf(companion, today);
  const fed = companion.lastFedDay === today;
  const stamp = stampFor(companion.name, hunger, laidUp(companion, today), fed);
  const stage = stageOfLife(companion, kind);
  return {
    name: companion.name,
    health: Math.round(companion.health),
    maxHealth: maxHealthOf(kind),
    hunger: stamp ? null : fed ? 'Fed today' : HUNGER_WORDS[hunger],
    stage: stage === 'grown' ? null : companionGrowing(companion, kind, state.board.seed).stage,
    stamp,
  };
}

function foods(state: GameState, ctx: GameContext): FoodOption[] {
  const yours = yourCompanion(state, ctx);
  if (!yours) return [];
  const favourite = favouriteOf(yours.companion, yours.kind, state.board.seed);
  const scraps = {
    ...choice(state, ctx, { type: 'feedCompanion', ingredientId: null }),
    label: 'Scraps',
    note: 'Free',
  };
  const pantry = yours.kind.diet
    .filter((id) => pantryCount(state.inventory, id) > 0)
    .map((id) => ({
      ...choice(state, ctx, { type: 'feedCompanion', ingredientId: id }),
      label: ctx.content.ingredients.require(id).name,
      note:
        yours.companion.favouriteKnown && id === favourite
          ? 'Its favourite'
          : `${pantryCount(state.inventory, id)} in the pantry`,
    }));
  return [scraps, ...pantry];
}

/** How long it is laid up, in words, and what would shorten it. */
function laidUpLine(injury: CompanionInjury, today: number): string {
  const left = injury.until - today;
  const when =
    left <= 1 ? 'until tomorrow' : left === 2 ? 'for two more days' : 'for a few more days';
  const help = injury.treated
    ? 'The vet has bandaged it; a dose of medicine would still help.'
    : 'A dose of medicine or a visit to the vet would shorten it.';
  return `Laid up and resting ${when}. ${help}`;
}

export function companionSheet(state: GameState, ctx: GameContext): CompanionSheet | null {
  const strip = companionStrip(state, ctx);
  const yours = yourCompanion(state, ctx);
  if (!strip || !yours) return null;
  const { companion, kind } = yours;
  const injury = laidUp(companion, state.time.day) ? companion.injury : null;
  return {
    ...strip,
    kind: kind.name,
    growing: companionGrowing(companion, kind, state.board.seed),
    arts: companionArts(companion, kind, ctx),
    role: roleLine(companion, kind),
    stageName: stageName(stageOf(companion.bond)),
    progress: stageProgress(companion.bond),
    laidUp: injury ? laidUpLine(injury, state.time.day) : null,
    fedToday: companion.lastFedDay === state.time.day,
    foods: foods(state, ctx),
    plays: PLAY_KINDS.map((play) => ({
      ...choice(state, ctx, { type: 'playWithCompanion', play }),
      label: PLAY_WORDS[play],
    })),
    medicine: injury
      ? {
          doses: state.companions.medicine,
          hidden: choice(state, ctx, { type: 'doseCompanion', hidden: true }),
          plain: choice(state, ctx, { type: 'doseCompanion', hidden: false }),
        }
      : null,
  };
}

export interface CompanionDrill extends Choice {
  readonly label: string;
  /** Its grade in the skill. */
  readonly theirs: StatGrade;
}

/** Training together at a training ground: a drill per stat it can learn. */
export function companionDrills(
  state: GameState,
  ctx: GameContext,
): {
  readonly name: string;
  /** What a session costs you in energy. */
  readonly energy: number;
  readonly drills: readonly CompanionDrill[];
} | null {
  const yours = yourCompanion(state, ctx);
  if (!yours) return null;
  const { companion } = yours;
  return {
    name: companion.name,
    energy: hardWorkEnergy(state.character, ctx, TRAIN_ENERGY),
    drills: trainableStats(companion).map((stat) => ({
      ...choice(state, ctx, { type: 'trainCompanion', stat }),
      label: STAT_INFO[stat].label,
      theirs: statTier(companion.stats[stat]).grade,
    })),
  };
}
