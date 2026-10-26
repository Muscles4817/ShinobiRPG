import type { CarriedKit } from './carried';
import { gearSlot } from './items';
import type { ContentPack } from './types';

/**
 * What a fighter carries (`CarriedKit`, on a person's arsenal or a foe): gear is real, a piece
 * per slot, tools are real and carried by the piece, and weapon mastery runs 0 to 1.
 */
export function carriedProblems(
  pack: ContentPack,
  who: string,
  carries: CarriedKit | undefined,
): string[] {
  const gear = (carries?.gearIds ?? []).map((id) => ({
    id,
    def: pack.gear.find((g) => g.id === id),
  }));
  const slots = gear.flatMap(({ def }) => (def ? [gearSlot(def)] : []));
  const tools = Object.entries(carries?.tools ?? {});
  return [
    ...gear.flatMap(({ id, def }) => (def ? [] : [`${who} wears unknown gear "${id}"`])),
    ...slots
      .filter((slot, i) => slots.indexOf(slot) !== i)
      .map((slot) => `${who} wears two pieces in the ${slot} slot`),
    ...tools.flatMap(([id, count]) => [
      ...(pack.tools.some((t) => t.id === id) ? [] : [`${who} carries unknown tool "${id}"`]),
      ...(Number.isInteger(count) && count > 0 ? [] : [`${who} carries ${count} of "${id}"`]),
    ]),
    ...Object.entries(carries?.weaponMastery ?? {}).flatMap(([weaponClass, m]) =>
      m >= 0 && m <= 1 ? [] : [`${who} knows "${weaponClass}" at ${m}, not 0 to 1`],
    ),
  ];
}

/** Every foe's gear and pouch. */
export function validateFoesCarried(pack: ContentPack): string[] {
  return pack.enemies.flatMap((e) => carriedProblems(pack, `enemy "${e.id}"`, e.carries));
}
