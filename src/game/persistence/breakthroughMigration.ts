/** The breakthroughs step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** What each promotion did to the limits when breakthroughs arrived (kept as it was then). */
const PROMOTIONS = [
  { rank: 'chunin', source: 'promotion:chunin', limits: { reserves: 4 } },
  { rank: 'jonin', source: 'promotion:jonin', limits: { reserves: 4 } },
] as const;
const RANK_ORDER = ['genin', 'chunin', 'jonin', 'kage'];

/**
 * v33 → v34: breakthroughs. Characters already promoted have had the promotions' breakthroughs,
 * as if the rule had been there when they stepped forward.
 */
export function v33ToV34(state: RawState): RawState {
  const character = asRecord(state.character);
  const rank = asRecord(state.standing).rank;
  const at = RANK_ORDER.indexOf(typeof rank === 'string' ? rank : 'genin');
  const earned = PROMOTIONS.filter((p) => RANK_ORDER.indexOf(p.rank) <= at).map(
    ({ source, limits }) => ({ source, limits }),
  );
  return { ...state, character: { ...character, breakthroughs: earned } };
}
