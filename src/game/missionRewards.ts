import { RESCUED_START_BOND, type Companions } from '@/systems/companions';
import { signed, type Contract } from '@/systems/contracts';
import { knowsRecipe, learnRecipes, type Cooking } from '@/systems/cooking';
import { addGear, addScroll, owns, ownsScroll, type Inventory } from '@/systems/inventory';
import type { JournalChip } from '@/systems/journal';
import type { MissionDef } from '@/systems/missions';

import { metToday } from './companions/adopt';
import { signBlocker } from './contracts/summons';
import { riteBlocker, riteOf } from './hives/rite';
import { scrollKept } from './dust/scrolls';
import type { GameContext } from './context';
import { chip } from './ops';
import type { GameState } from './state';

/**
 * What a client hands over besides ryo on success: a technique scroll (studied at home or in a
 * library), a piece of gear such as a named weapon, a family recipe, or an animal you rescued,
 * which waits at the animal clinic until you choose to take it home (one waits at a time), a
 * summoning contract, or a hive clan's rite. Nothing you already own or know is given twice.
 */

export interface HandedOver {
  readonly inventory: Inventory;
  readonly cooking: Cooking;
  readonly companions: Companions;
  readonly contract: Contract | null;
  /** Hive clans whose rite you know, with any the job handed over. */
  readonly rites: readonly string[];
  /** Dust scrolls you hold, with any the job handed over. */
  readonly dustScrolls: GameState['dustScrolls'];
  readonly chips: readonly JournalChip[];
  /** For the debrief card, by name. */
  readonly report: {
    readonly scroll?: string;
    readonly gear?: string;
    readonly recipe?: string;
    readonly companion?: string;
    readonly contract?: string;
    readonly rite?: string;
    readonly dustScroll?: string;
  };
}

/** What this client still has to give you: only what you don't own or know yet. */
function giftsOf(state: GameState, ctx: GameContext, def: MissionDef) {
  const { scrollId, gearId, recipeId, companionKindId } = def.reward;
  const { content } = ctx;
  return {
    scroll:
      scrollId !== undefined && !ownsScroll(state.inventory, scrollId)
        ? content.techniques.require(scrollId)
        : null,
    gear:
      gearId !== undefined && !owns(state.inventory, gearId) ? content.gear.require(gearId) : null,
    recipe:
      recipeId !== undefined && !knowsRecipe(state.cooking, recipeId)
        ? content.recipes.require(recipeId)
        : null,
    animal:
      companionKindId !== undefined && state.companions.waiting === null
        ? content.companionKinds.require(companionKindId)
        : null,
  };
}

/** What was handed over, by name, for the chips and the debrief. */
type Given = HandedOver['report'];

/** The order the debrief and chips name them in. */
const GIVEN_KINDS = [
  'scroll',
  'gear',
  'recipe',
  'companion',
  'contract',
  'rite',
  'dustScroll',
] as const;

const GIVEN_CHIPS: Readonly<Record<keyof Given, (name: string) => string>> = {
  scroll: (name) => `${name} scroll`,
  gear: (name) => name,
  recipe: (name) => `Learned ${name}`,
  companion: (name) => `${name} is at the animal clinic`,
  contract: (name) => `Signed ${name}`,
  rite: (name) => `Learned ${name}`,
  dustScroll: (name) => `${name} scroll`,
};

function namedOnly(names: Record<keyof Given, string | undefined>): Given {
  return Object.fromEntries(Object.entries(names).filter(([, name]) => name !== undefined));
}

function chipsFor(given: Given): JournalChip[] {
  return GIVEN_KINDS.flatMap((kind) => {
    const name = given[kind];
    return name ? [chip(GIVEN_CHIPS[kind](name), 'gain')] : [];
  });
}

/** A contract the job offers, signed if you hold none yet (one at a time) and never broke it. */
function contractOffered(state: GameState, ctx: GameContext, def: MissionDef) {
  const offered = def.reward.contractId;
  return offered && signBlocker(state, offered) === null
    ? ctx.content.contracts.require(offered)
    : null;
}

/** A hive clan's rite the job hands over, if it is any use to you (no hive, not known yet). */
function riteFound(state: GameState, ctx: GameContext, def: MissionDef) {
  const clanId = def.reward.hiveRite;
  const found = clanId ? riteOf(ctx, clanId) : null;
  return found && riteBlocker(state, found.clan.id) === null ? found : null;
}

/** A dust scroll the job hands over, if it is any use to you (no dust, not held yet). */
function dustScrollFound(state: GameState, ctx: GameContext, def: MissionDef) {
  const dustId = def.reward.dustScroll;
  const found = dustId ? ctx.content.dusts.get(dustId) : undefined;
  return found && scrollKept(state, found.id) === null ? found : null;
}

/** The rites and dust scrolls you hold with what the job handed over, and their names. */
function secretsFound(state: GameState, ctx: GameContext, def: MissionDef) {
  const rite = riteFound(state, ctx, def);
  const dustScroll = dustScrollFound(state, ctx, def);
  return {
    kept: {
      rites: rite ? [...state.rites, rite.clan.id] : state.rites,
      dustScrolls: dustScroll
        ? [...state.dustScrolls, { dustId: dustScroll.id, sessions: 0 }]
        : state.dustScrolls,
    },
    rite: rite?.rite.name,
    dustScroll: dustScroll?.name,
  };
}

export function handedOver(state: GameState, ctx: GameContext, def: MissionDef): HandedOver {
  const { scroll, gear, recipe, animal } = giftsOf(state, ctx, def);
  const withScroll = scroll ? addScroll(state.inventory, scroll.id) : state.inventory;
  const rescued = animal
    ? metToday(state, animal, { bond: RESCUED_START_BOND, arrival: 'rescue' })
    : null;
  const contractDef = contractOffered(state, ctx, def);
  const secrets = secretsFound(state, ctx, def);
  const given = namedOnly({
    scroll: scroll?.name,
    gear: gear?.name,
    recipe: recipe?.name,
    companion: rescued?.name,
    contract: contractDef?.name,
    rite: secrets.rite,
    dustScroll: secrets.dustScroll,
  });
  return {
    inventory: gear ? addGear(withScroll, gear.id) : withScroll,
    cooking: recipe ? learnRecipes(state.cooking, [recipe.id]) : state.cooking,
    companions: rescued ? { ...state.companions, waiting: rescued } : state.companions,
    contract: contractDef ? signed(contractDef.id, state.time.day) : state.contract,
    ...secrets.kept,
    chips: chipsFor(given),
    report: given,
  };
}
