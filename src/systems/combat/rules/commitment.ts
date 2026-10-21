/**
 * Committed defence (`docs/design/defence-plan.md`): a fighter who gives their turn to not being
 * hit is much harder to hit than one meeting the foe halfway. Two commitments, each played from
 * an action slot and paid in breath, holding until the fighter's next turn:
 *  - **Evade**: everything aimed at them meets a far bigger slip (`EVADE_STANCE`), and a
 *    committed evader may get clear of more than anyone else can (`EVADE_MAX`).
 *  - **Brace**: every physical hit meets a guard much stronger than a ready Guard (`BRACE_LETS`,
 *    flurries' later blows too), and a pin, daze or knock takes hold far less often
 *    (`BRACE_HOLDS`). A break goes through it, and techniques of chakra, an element or the mind
 *    are what Evade (or a swap) is for.
 * The free ready defence (`readiness.ts`) still reacts on top. Breath is the clock: a fighter who
 * only turtles runs dry and is left with the ready defence alone, so turtling buys time and never
 * wins on its own.
 */

/** A defensive commitment, played as an action. */
export const COMMITMENTS = ['evade', 'brace'] as const;
export type Commitment = (typeof COMMITMENTS)[number];

/** Breath a commitment costs: staying clear of everything is harder work than standing firm. */
export const COMMIT_BREATH: Readonly<Record<Commitment, number>> = { evade: 8, brace: 5 };

/**
 * How much a committed evasion adds to the avoid roll's stance (`rules/avoidance.ts`), on top of
 * a ready Dodge's or an open fighter's: a blow, being quicker and closer, is harder to clear.
 */
export const EVADE_STANCE = { technique: 1, blow: 1.2 } as const;

/** A committed evader may slip up to this share of what comes at them. */
export const EVADE_MAX = 0.9;

/**
 * Reading what is coming (plan 3.3): an evader who reads the attacker well saves the evasion for
 * the attack that matters (one that would take `DANGER_SHARE` of their health or more) and lets
 * ordinary blows meet their ready defence; one who reads poorly spreads it over everything. A
 * blind evader puts `EVADE_SPREAD` of the lift into every attack; a perfect read puts all of it
 * into the dangerous ones and none into the rest.
 */
export const DANGER_SHARE = 0.25;
export const EVADE_SPREAD = 0.6;
/** The read's multiplier (`readScale`) at which an evader reads nothing, and reads it all. */
const READS_NOTHING = 0.75;
const READS_ALL = 1.25;

/** How well an evader reads what is coming, from the avoid roll's read: 0 blind, 1 clear. */
export function readClarity(read: number): number {
  return Math.min(1, Math.max(0, (read - READS_NOTHING) / (READS_ALL - READS_NOTHING)));
}

/**
 * How much of Evade's lift meets this attack: by how clearly it is read and whether it is the
 * dangerous one (`threat`, the share of the evader's health it would take; unknown counts as
 * spread).
 */
export function evadeFocus(read: number, threat: number | undefined): number {
  if (threat === undefined) return EVADE_SPREAD;
  const clarity = readClarity(read);
  return threat >= DANGER_SHARE
    ? EVADE_SPREAD + (1 - EVADE_SPREAD) * clarity
    : EVADE_SPREAD * (1 - clarity);
}

/** Share of a physical hit's damage that gets through a Brace (multiplying any guard). */
export const BRACE_LETS = 0.5;

/** A pin, daze or knock on someone braced takes hold this much as often. */
export const BRACE_HOLDS = 0.5;

/** The verbs a Brace stands against. */
const BRACED_AGAINST: readonly string[] = ['pin', 'daze', 'knock'];

/** Whether a condition's verb is one a Brace stands against. */
export function isBracedAgainst(verb: string): boolean {
  return BRACED_AGAINST.includes(verb);
}

/** The chance a condition fails to hold on a braced fighter, from its chance against anyone. */
export function bracedResist(resist: number): number {
  return 1 - (1 - resist) * BRACE_HOLDS;
}
