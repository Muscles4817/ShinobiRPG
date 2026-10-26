/**
 * Going off the paths into wild country (`docs/design/chakra-beasts-plan.md`): a venture is a
 * run of your own, a day a depth, as deep as you mean to go and back out the way you came.
 * Only the plan lives here; how it plays is the game layer's (`game/ventures.ts`).
 */

/** How far into wild country: the edge, the deep where people go to hide, and the heart. */
export const WILD_DEPTHS = ['edge', 'deep', 'heart'] as const;
export type WildDepth = (typeof WILD_DEPTHS)[number];

export interface VenturePlan {
  /** The wild place you went in from, and come back out to. */
  readonly placeId: string;
  /** The kind of country it is (a wild place's biome). */
  readonly country: string;
  /** As deep as you mean to go. */
  readonly depth: WildDepth;
  /** Set once you turn back: the depth you are walking out from. */
  readonly out?: WildDepth;
}

/** A trip or a venture of your own, rather than a job: nobody is let down when it goes wrong. */
export function ownRun(run: { readonly journey?: unknown; readonly venture?: unknown }): boolean {
  return run.journey !== undefined || run.venture !== undefined;
}

/** The depths from the edge in to `depth`, in the order you reach them. */
export function depthsTo(depth: WildDepth): readonly WildDepth[] {
  return WILD_DEPTHS.slice(0, WILD_DEPTHS.indexOf(depth) + 1);
}

/** The depths walked back through on the way out from `depth`, the next one out first. */
export function depthsOut(depth: WildDepth): readonly WildDepth[] {
  return depthsTo(depth).slice(0, -1).reverse();
}

/** Days a venture to `depth` takes: a day at each depth going in, and one back through each. */
export function ventureDays(depth: WildDepth): number {
  return depthsTo(depth).length + depthsOut(depth).length;
}
