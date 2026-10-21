import { round1 } from '@/core';
import type { LadderStep } from '@/systems/techniques';

/**
 * What a ladder's step takes out of the body (`docs/design/defence-plan.md` 4.1): the Eight Gates
 * cost more the deeper they go, while they are open and after they shut. The first gates wind
 * their user (breath runs out faster), the middle ones wear on health too, and once they shut the
 * body is spent for the rest of the fight: less wind (stamina), and past the third gate slower
 * and weaker. The seventh drains the body so fast it has about a round to win, and when it shuts
 * the body collapses: out of the fight. Opening the deep gates to throw one finisher costs the
 * fight unless it wins it.
 */

export interface StepToll {
  /** Share of the user's most breath lost each exchange it is open, beyond what moves cost. */
  readonly breath: number;
  /** Share of the user's most health lost each exchange it is open. */
  readonly health: number;
  /** Shares lost for the rest of the fight once it shuts: stamina, and speed and strength. */
  readonly spent: { readonly stamina: number; readonly body: number };
  /** Once it shuts the body collapses: out of the fight. */
  readonly collapses: boolean;
}

const toll = (breath: number, health: number, stamina: number, body: number): StepToll => ({
  breath,
  health,
  spent: { stamina, body },
  collapses: false,
});

const COLLAPSE = (breath: number, health: number): StepToll => ({
  breath,
  health,
  spent: { stamina: 0, body: 0 },
  collapses: true,
});

/** Each gate's toll (index 0: nothing open). */
const GATE_TOLLS: readonly StepToll[] = [
  toll(0, 0, 0, 0),
  toll(0.08, 0, 0.05, 0),
  toll(0.1, 0, 0.07, 0),
  toll(0.12, 0, 0.1, 0),
  toll(0.14, 0.03, 0.12, 0.05),
  toll(0.16, 0.04, 0.14, 0.07),
  toll(0.22, 0.08, 0.25, 0.15),
  COLLAPSE(0.25, 0.2),
  COLLAPSE(0.3, 0.3),
];

const NO_TOLL = toll(0, 0, 0, 0);

/** What a step costs while open and once it shuts. */
export function stepToll({ step }: LadderStep): StepToll {
  return GATE_TOLLS[step] ?? NO_TOLL;
}

/** Health a step costs each exchange, for a body of this much health. */
export function stepHealthPrice(step: LadderStep, maxHealth: number): number {
  return Math.round(stepToll(step).health * maxHealth);
}

/**
 * Exchanges a body could hold a step open before its health price brings it to `giveOutAt`:
 * no end while it costs no health.
 */
export function exchangesOpen(
  body: { readonly health: number; readonly maxHealth: number },
  step: LadderStep,
  giveOutAt: number,
): number {
  const price = stepHealthPrice(step, body.maxHealth);
  return price > 0 ? Math.floor((body.health - giveOutAt) / price) : Infinity;
}

/** Breath a step costs each exchange, for a body of this much breath. */
export function stepBreathPrice(step: LadderStep, maxBreath: number): number {
  return Math.round(stepToll(step).breath * maxBreath);
}

/** The body's stats once a step has shut: stamina, speed and strength spent for the fight. */
export function spentBody<T extends { stamina: number; speed: number; strength: number }>(
  attributes: T,
  step: LadderStep,
): T {
  const { spent } = stepToll(step);
  const cut = (value: number, share: number) => round1(value * (1 - share));
  return {
    ...attributes,
    stamina: cut(attributes.stamina, spent.stamina),
    speed: cut(attributes.speed, spent.body),
    strength: cut(attributes.strength, spent.body),
  };
}
