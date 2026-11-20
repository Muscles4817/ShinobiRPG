/**
 * Which minds a bench's fights are played with. Foes think ahead in the game
 * (`engines/plan/mind/planner/`), and the benches that measure the minds play them so: the
 * planner, the matrix, teams and the bestiary, and the invariant that what is shown is what is
 * told (`toldBench`), which must hold for the fights the game plays. A bench that measures a
 * rule (defence, keep trying, holds, gear, foreign shinobi…) plays everyone by instinct (`CombatSetup.instinct`), which
 * keeps the suite near ten minutes; thinking costs about eight times as much a fight. The weekly
 * run (`VITE_BENCH_THINKING=true`) plays every bench with thinking foes, to show where the two
 * disagree.
 */

const THINKING_EVERYWHERE = import.meta.env.VITE_BENCH_THINKING === 'true';

/** The setup's minds: thinking (as the game plays) for a bench of the minds, else instinct. */
export function benchMinds(thinking = false): { readonly instinct?: true } {
  return thinking || THINKING_EVERYWHERE ? {} : { instinct: true };
}
