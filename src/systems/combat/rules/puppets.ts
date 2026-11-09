import { statTier, type StatGrade } from '@/systems/stats';

import type { CombatAttributes, CombatTechnique } from '../contract';
import { isSigned } from './blades';

/**
 * Puppets on threads (`docs/design/retinue-plan.md`, step 5): a body built, never minded. The
 * puppet brings its frame (how strong and tough it is, and how far it was built to go in each art:
 * hidden blades, seals fitted for a little ninjutsu or genjutsu, or a human puppet's art kept
 * from life); its master brings everything else, the same for any engine:
 *  - **Driven.** It moves and strikes with its master's hands: each art and its speed are the
 *    frame's as far as the master's threads can work it (`threadSkill`), and it sees, judges and
 *    stands firm by its master's mind (`drivenAttributes`).
 *  - **Attention.** A master works so many puppets at once by the grade of their chakra
 *    control (`threadsHeld`), and while any are up their hands are on the threads: no hand-sign
 *    technique of their own but the threads and the scrolls (`handsOnThreads`).
 *  - **The strings can be cut.** A master dazed, pinned or sealed leaves their puppets hanging
 *    slack, and a hard enough hit (`THREADS_SLIP_SHARE` of their health) makes the threads slip
 *    until their next turn.
 */

/** Puppets worked at once by the grade of the master's chakra control. */
const THREADS_BY_GRADE: Readonly<Record<StatGrade, number>> = {
  E: 1,
  D: 1,
  C: 1,
  B: 2,
  A: 3,
  S: 4,
};

/** A hit that takes this share of a master's health makes their threads slip. */
export const THREADS_SLIP_SHARE = 0.25;

/** The arts a puppet works at its frame's grade, as far as the threads allow. */
const WORKED: readonly (keyof CombatAttributes)[] = [
  'speed',
  'chakraControl',
  'taijutsu',
  'ninjutsu',
  'genjutsu',
  'kenjutsu',
  'fuuinjutsu',
];

/** How finely a master works their threads: their chakra control. */
export function threadSkill(master: CombatAttributes): number {
  return master.chakraControl;
}

/** How many puppets a master can work at once. */
export function threadsHeld(master: CombatAttributes): number {
  return THREADS_BY_GRADE[statTier(threadSkill(master)).grade];
}

/** A puppet's frame as its master works it: the body its own, the skill and the mind theirs. */
export function drivenAttributes(
  frame: CombatAttributes,
  master: CombatAttributes,
): CombatAttributes {
  const threads = threadSkill(master);
  const worked = Object.fromEntries(WORKED.map((k) => [k, Math.min(frame[k], threads)]));
  return {
    ...frame,
    ...worked,
    intellect: master.intellect,
    perception: master.perception,
    willpower: master.willpower,
  };
}

/**
 * Whether a technique can be played with hands on the threads: anything without hand signs,
 * a scroll's unsealing, or a hold the threads themselves keep (a channelled pin).
 */
export function handsOnThreads(technique: CombatTechnique): boolean {
  if (!isSigned(technique.discipline)) return true;
  return technique.effects.some(
    (e) => e.verb === 'summon' || (e.verb === 'pin' && e.channelled === true),
  );
}

/** Whether a hit this big makes a master's threads slip. */
export function threadsSlip(damage: number, maxHealth: number): boolean {
  return damage >= maxHealth * THREADS_SLIP_SHARE;
}
