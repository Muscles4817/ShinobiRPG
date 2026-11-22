import { fieldBookKeys } from '../fieldBook/keys';
import type { GameState } from '../state';
import type { DayStart } from './state';

/** Taking the dawn snapshot the day's record is compared against (see `state.ts`). */

/** Where you stand now, as the start of a day. */
export function openDay(state: GameState): DayStart {
  const { character, inventory } = state;
  return {
    day: state.time.day,
    stats: character.stats,
    ryo: state.wallet.ryo,
    bonds: Object.fromEntries(
      Object.entries(state.people.bonds).map(([id, bond]) => [id, bond.points]),
    ),
    regard: state.mentor.regard,
    rank: state.standing.rank,
    techniques: state.techniques.known,
    recipes: Object.keys(state.cooking.known),
    pantry: inventory.pantry,
    tools: inventory.tools,
    gear: inventory.gear,
    scrolls: Object.keys(inventory.scrolls),
    satiety: character.vitals.satiety,
    journalFrom: state.journal.nextId,
    factsFrom: state.facts.length,
    ...(state.rival ? { rivalFirsts: Object.keys(state.rival.firsts) } : {}),
    fieldBook: fieldBookKeys(state.fieldBook),
  };
}
