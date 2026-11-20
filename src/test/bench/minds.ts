/**
 * Which minds a bench's fights are played with. Foes think ahead in the game
 * (`engines/plan/mind/planner/`), but the pipeline plays every fight by instinct
 * (`CombatSetup.instinct`; the game's own fights through `defaultEngines` in `game/context.ts`):
 * thinking costs about eight times as much a fight. Thinking is run locally, on a machine with the
 * compute, with `npm run test:thinking` (`VITE_BENCH_THINKING=true`); what it showed is kept in
 * `docs/design/research/thinking-foes-findings.md`.
 */

/** Whether this run plays foes thinking, as the game does (`npm run test:thinking`). */
export const THINKING = import.meta.env.VITE_BENCH_THINKING === 'true';

/** The setup's minds: instinct, unless this run thinks. */
export function benchMinds(): { readonly instinct?: true } {
  return THINKING ? {} : { instinct: true };
}
