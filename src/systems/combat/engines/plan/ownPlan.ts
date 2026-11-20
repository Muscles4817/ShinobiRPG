/**
 * Whose plan a fighter fights by (`Minded.ownPlan`): the player's fighter is planned by the
 * player unless the fight is only watched. It is set on the fighter once, as the fight starts,
 * so no reading of a round or a moment can lose it.
 */

interface Fighter {
  readonly isPlayer: boolean;
  readonly ownPlan?: true;
}

const OWN_PLAN = { ownPlan: true } as const;

/** The player's fighter, planned by the player unless the fight is only watched. */
export function ownPlanned<F extends Fighter>(f: F, watched: boolean): F {
  return f.isPlayer && !watched ? { ...f, ...OWN_PLAN } : f;
}
