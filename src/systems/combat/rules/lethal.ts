/**
 * Killing blows (`docs/design/defence-plan.md` 4.3): a technique made to end a fight in one strike
 * (`TechniqueDef.lethal`: a lightning blade, a spiralling sphere) is the pay-off a set-up is for.
 * On a target who can't see it coming (its user hidden) or can't move (dazed, reeling or held), it
 * hits to kill and goes through a guard; only a swap gets out of its way. Held or reeling, nobody
 * slips it; unseen, a quick enough body still may, though far less often (`UNSEEN_SLIP`). Against
 * a foe standing ready it is an ordinary attack, and an expensive one.
 */

/** A killing blow on a target who can't meet it lands this much harder. */
export const LETHAL_SCALE = 2;
/** A killing blow from out of sight is slipped this share as often as one seen coming. */
export const UNSEEN_SLIP = 0.25;
/** A hold cast from hiding takes this much less often to be shaken off. */
export const HIDDEN_HOLD_RESIST = 0.5;

/** The moment a killing blow meets: whether its target can see it, or move. */
export interface KillingMoment {
  readonly unseen: boolean;
  readonly open: boolean;
}

/** Whether a technique strikes to kill now: lethal, and its target unable to meet it. */
export function strikesToKill(
  t: { readonly lethal?: true },
  { unseen, open }: KillingMoment,
): boolean {
  return t.lethal === true && (unseen || open);
}

/**
 * How a killing blow's chance of being slipped is scaled now: never (0) on a target who can't
 * move, `UNSEEN_SLIP` on one who can't see it coming, and unchanged otherwise (1).
 */
export function killingSlipScale(t: { readonly lethal?: true }, moment: KillingMoment): number {
  if (!strikesToKill(t, moment)) return 1;
  return moment.open ? 0 : UNSEEN_SLIP;
}
