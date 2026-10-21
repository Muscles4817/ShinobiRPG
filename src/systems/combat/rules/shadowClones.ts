/**
 * Shadow clones (`docs/design/defence-plan.md`, slice 5): solid copies of their maker, each a
 * share of them. Casting splits the maker's chakra evenly between maker and clones (what a clone
 * still holds when it pops is lost), and each clone fights as its maker does: the same body, the
 * same kit, its own turn and judgement. A clone pops at the first hit that lands. A body costs a
 * turn of the fight each, so only a few stand as fighters (`SHADOW_BODIES_MAX`); a technique that
 * makes more puts the rest beside its maker as a crowd that screens and soaks hits (`clones.ts`).
 * They look like their maker, so an attack aimed at the maker may go into a clone instead
 * (`misleadChance`).
 */

/** The most clones of one maker standing as fighters at once. */
export const SHADOW_BODIES_MAX = 4;
/** A technique makes one fighting clone for this much power, at least one. */
const POWER_PER_BODY = 5;

/** How many fighting clones a technique of this power makes. */
export function shadowBodies(power: number): number {
  return Math.min(SHADOW_BODIES_MAX, Math.max(1, Math.floor(power / POWER_PER_BODY)));
}

/**
 * How often an attacker aiming at a maker strikes one of their shadow clones instead: they look
 * alike, so the more clones the likelier; the attacker's eyes against the maker's skill in the
 * art shift it (`MISLEAD_PER_POINT`), and eyes that read foes (insight) see through most of it.
 */
const MISLEAD_PER_POINT = 0.03;
const MISLEAD_MAX = 0.8;
const INSIGHT_SCALE = 0.3;

/** The chance an attack aimed at a maker goes into one of their clones instead. */
export function misleadChance(
  clones: number,
  {
    eyes,
    skill,
    insight,
  }: { readonly eyes: number; readonly skill: number; readonly insight: boolean },
): number {
  if (clones <= 0) return 0;
  const alike = clones / (clones + 1);
  const read = Math.min(1.5, Math.max(0.5, 1 + (skill - eyes) * MISLEAD_PER_POINT));
  return Math.min(MISLEAD_MAX, alike * read * (insight ? INSIGHT_SCALE : 1));
}

/** Each one's share of the maker's chakra once it is split between maker and clones. */
export function shadowShare(chakra: number, clones: number): number {
  return Math.floor(chakra / (clones + 1));
}
