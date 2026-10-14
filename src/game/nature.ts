import { hashUnit } from '@/core';
import type { ClanDef } from '@/content';
import { ELEMENTS, type Element } from '@/systems/techniques';

import type { Character } from './state';

/**
 * Chakra nature is found, not picked. It is read from the save's seed when the character is
 * made (a clan with a nature passes it on most of the time) and stays hidden until the chakra
 * paper shows it (`actions/chakraPaper.ts`). Before that it is already your chakra (a fight
 * knows it), but nothing that needs you to know it works: no study bonus, no nature
 * techniques, and no sensei can see it.
 */

/** What each nature is like in a fight, for the paper's verdict. */
export const NATURE_LINES: Readonly<Record<Element, string>> = {
  fire: 'Burning, relentless. Strong against wind.',
  wind: 'Cutting, sharp. Strong against lightning.',
  lightning: 'Piercing, fast. Strong against earth.',
  earth: 'Solid, patient. Strong against water.',
  water: 'Flowing, adaptable. Strong against fire.',
};

/** How often a clan with a nature passes it on; otherwise any nature may come. */
export const CLAN_NATURE_CHANCE = 0.6;

/** The nature this character was born with. */
export function bornNature(seed: number, clan: ClanDef): Element {
  if (clan.nature && hashUnit(seed, 'nature-inherited') < CLAN_NATURE_CHANCE) return clan.nature;
  const roll = hashUnit(seed, 'nature');
  return ELEMENTS[Math.floor(roll * ELEMENTS.length)] ?? 'fire';
}

/** Their nature as far as they know it: null until the chakra paper. */
export function knownNature(character: Character): Element | null {
  return character.natureKnown ? character.nature : null;
}
