/**
 * How a side of thinking foes shares a round's thinking (`think.ts`), while the ways are measured
 * (`prototypes/planner-diag/team.test.ts`):
 *  - `sequential`: each foe plans with the moves its teammates have already settled on fixed in
 *    its model of the exchange, and with the usual move presumed for those yet to settle;
 *  - `spotlight`: one foe a round (in turn) plans with the round's whole budget, the rest keep
 *    their usual moves;
 *  - `budgetScale`: the round's budget, multiplied.
 */
export const TEAM_PLANNING = { sequential: false, spotlight: false, budgetScale: 1 };
