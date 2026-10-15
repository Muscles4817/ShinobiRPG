import { pick } from './voice';

/**
 * The fight's voice for the field rather than the blows (`voice.ts` has those): someone thrown
 * across it or dragged in, illusions taking hold and lifting, a hidden fighter slipping away or
 * being traced, a swap out of harm. Picked by the moment, never the dice; no numbers.
 */

/** Someone thrown back to a distance, or dragged in close. */
export function knockLine(moment: string, target: string, where: string, closer: boolean): string {
  return pick(
    moment,
    closer
      ? [
          `${target} is dragged in close!`,
          `${target} is hauled in, face to face!`,
          `${target} is yanked off their feet and into reach!`,
        ]
      : [
          `${target} is thrown back to ${where} range!`,
          `${target} is sent skidding back to ${where} range!`,
          `${target} tumbles away to ${where} range!`,
        ],
  );
}

/** An illusion confuses its target. */
export function confusedLine(moment: string, target: string, caster: string): string {
  return pick(moment, [
    `${target}'s senses swim in ${caster}'s illusion.`,
    `${target} blinks, and the field is no longer where it was.`,
    `${caster}'s illusion folds the world around ${target}.`,
  ]);
}

/** Someone shakes an illusion off. */
export function clearHeadLine(moment: string, actor: string): string {
  return pick(moment, [
    `${actor} shakes off the illusion.`,
    `${actor} bites down and the world snaps back into place.`,
    `${actor} breaks free of the illusion.`,
  ]);
}

/** An illusionist slips back out of sight. */
export function rehideLine(moment: string, actor: string): string {
  return pick(moment, [
    `${actor} melts back into the illusion.`,
    `${actor} fades out of sight again.`,
    `${actor} is gone again, a shimmer where they stood.`,
  ]);
}

/** A hidden attacker traced back by the one they struck. */
export function tracedLine(moment: string, victim: string, actor: string): string {
  return pick(moment, [
    `${victim} traces the illusion back to ${actor}.`,
    `${victim} follows the blow back to its source: ${actor}.`,
    `${victim} catches the thread of the illusion and finds ${actor}.`,
  ]);
}

/** A substitution taking a hit in its owner's place. */
export interface SwapTold {
  readonly target: string;
  readonly attacker: string;
  /** The attack swapped out of. */
  readonly what: string;
  /** The substitution's name. */
  readonly jutsu: string;
}

/** A substitution takes a hit in its owner's place. */
export function swapLine(moment: string, { target, attacker, what, jutsu }: SwapTold): string {
  return pick(moment, [
    `${target} swaps out of ${attacker}'s ${what} with ${jutsu}.`,
    `${attacker}'s ${what} splinters a log where ${target} stood: ${jutsu}.`,
    `${target} is somewhere else when ${attacker}'s ${what} lands: ${jutsu}.`,
  ]);
}

/** Someone stepping in gets through a hold-off. */
export function throughLine(moment: string, closer: string, holder: string): string {
  return pick(moment, [
    `${closer} slips through ${holder}'s fire.`,
    `${closer} weaves in under ${holder}'s fire.`,
    `${closer} runs the gauntlet of ${holder}'s fire and comes out the other side.`,
  ]);
}

/** A hold-off stops someone stepping in. */
export function heldOffLine(moment: string, holder: string, closer: string): string {
  return pick(moment, [
    `${holder} keeps ${closer} off.`,
    `${holder} won't let ${closer} close.`,
    `${holder} meets ${closer}'s rush head on.`,
  ]);
}
