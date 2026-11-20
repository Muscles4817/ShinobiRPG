/**
 * Which minds a bench's fights are played with. Foes think ahead in the game
 * (`engines/plan/mind/planner/`). In CI only two benches play them so: the planner bench, which
 * sets thinking against instinct, and the invariant that what is shown is what is told
 * (`toldBench`), which must hold for the fights the game plays. Every other bench plays everyone
 * by instinct (`CombatSetup.instinct`): thinking costs about eight times as much a fight, and the
 * matrix, team and bestiary benches, played thinking, leave findings still being worked through
 * (`docs/design/research/thinking-foes-findings.md`). The weekly run
 * (`VITE_BENCH_THINKING=true`, `bench-thinking.yml`) plays every bench thinking, to show where
 * the two disagree.
 */

const THINKING_EVERYWHERE = import.meta.env.VITE_BENCH_THINKING === 'true';

/** The setup's minds: instinct, unless the weekly run asks for thinking everywhere. */
export function benchMinds(): { readonly instinct?: true } {
  return THINKING_EVERYWHERE ? {} : { instinct: true };
}
