/** The cooking step of the save migrations (see `migrations.ts`). */

type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

/** Every recipe a save could cook before recipes had to be learned (shared by both packs). */
const RECIPES_BEFORE_LEARNING = [
  'rice-ball-bento',
  'miso-soup',
  'grilled-fish-set',
  'spicy-hot-pot',
  'egg-over-rice',
  'simmered-tofu',
  'bamboo-rice',
  'cucumber-rice',
  'chestnut-rice',
  'radish-stew',
];

/** Grade D's experience: enough to keep cooking the rank C hot pot those saves could cook. */
const GRADE_D_XP = 12;

/**
 * v31 → v32: recipes are learned and cooking is a skill. A save keeps every recipe it could
 * already cook, never cooked yet, as a grade D cook so none of them is out of reach.
 */
export function v31ToV32(state: RawState): RawState {
  const known = Object.fromEntries(RECIPES_BEFORE_LEARNING.map((id) => [id, 0]));
  return { ...state, cooking: { xp: GRADE_D_XP, known } };
}

/** v32 → v33: wild places and fishing spots remember the day they last gave; none yet. */
export function v32ToV33(state: RawState): RawState {
  return { ...state, cooking: { gathered: {}, ...asRecord(state.cooking) } };
}
