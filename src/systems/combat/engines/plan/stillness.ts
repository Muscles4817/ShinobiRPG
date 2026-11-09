import type { RangeBand } from '../../contract';
import { hasVerb } from '../../rules/verbs';
import { cardsFor, isOffence, playable } from './cards';
import { STILLNESS_BROKEN } from './meditation';
import { opponentsOf } from './senses';
import type { PlanFighter } from './state';
import { cardWorth } from './worth';

/**
 * Whether going still is safe (`meditation.ts`): a mind that reads the fight sizes up what each
 * foe could do to them in the turn they sit open, with the mount that would carry them clear
 * (`riding.ts`) and whatever hiding they have done, and meditates only when the stillness would
 * likely hold. Each foe is weighed by the worst attack they could bring here (`cardWorth`: how
 * likely it lands on a still body, and what it does); a foe searching for someone hidden can
 * only reach them with an area. Against a foe who would break it (someone far too quick to be
 * carried clear of, up close) they change the fight first: a hold, distance, hiding. A dull
 * fighter doesn't weigh it, and sits down regardless.
 */

/** What the fight looks like to someone thinking of going still. */
export interface StillMoment {
  readonly fighters: readonly PlanFighter[];
  readonly band: RangeBand;
}

/** The harm one foe could do this exchange to a body sitting still. */
function worstFrom(foe: PlanFighter, still: PlanFighter, moment: StillMoment): number {
  const where = { band: moment.band, fighters: moment.fighters };
  const reaching = cardsFor(foe, moment.band).filter(
    (c) =>
      isOffence(c) &&
      playable(foe, c) &&
      // A foe who can't see them can only catch them with an area.
      (!still.hidden || (c.kind === 'jutsu' && hasVerb(c.technique, 'area'))),
  );
  return Math.max(0, ...reaching.map((c) => cardWorth(foe, still, c, where) ?? 0));
}

/** Whether a fighter could sit still through this exchange without the stillness breaking. */
export function stillnessHolds(self: PlanFighter, moment: StillMoment): boolean {
  const still: PlanFighter = { ...self, gathering: true };
  const fighters = moment.fighters.map((f) => (f.id === self.id ? still : f));
  const among = { ...moment, fighters };
  const harm = opponentsOf(fighters, still).reduce(
    (sum, foe) => sum + worstFrom(foe, still, among),
    0,
  );
  return harm < self.maxHealth * STILLNESS_BROKEN;
}
