import { fightingPower } from '@/systems/stats';

import type { CombatTechnique, RangeBand } from '../../contract';
import { alive } from '../../rules/body';
import { hasVerb } from '../../rules/verbs';
import { fitsBand, playable, type Card } from './cards';
import { isOpen } from './finishers';
import { readsInTheMoment } from './judgement';
import type { PlanFighter } from './state';

/**
 * A set-up (`docs/design/defence-plan.md` 4.3): hide, hold, finish. A mind that reads the fight,
 * with a way out of sight (a conceal), a hold (a daze or a pin) and a killing blow (`lethal`) in
 * its kit, fights a foe who is a match for it this way rather than trading blows: out of sight
 * first, then a hold cast from hiding (harder to shake off), then the killing blow on the held,
 * which nothing slips (`rules/lethal.ts`). Like the gates and a covered eye, it takes no slot: the
 * kit is the plan.
 */

/** A foe this close to the fighter's own fighting power is worth setting up rather than trading with. */
export const SETUP_MATCH_RATIO = 0.8;

/** Where the set-up is played, and against whom. */
export interface SetupMoment {
  readonly band: RangeBand;
  readonly foes: readonly PlanFighter[];
}

/** A set-up's next move, and whom it is for. */
export interface SetupPlay {
  readonly card: Card;
  readonly target: PlanFighter | undefined;
}

const killing = (t: CombatTechnique) => t.lethal === true;
const holding = (t: CombatTechnique) => !killing(t) && (hasVerb(t, 'daze') || hasVerb(t, 'pin'));
const hiding = (t: CombatTechnique) => hasVerb(t, 'conceal');

/** The first of the kit's techniques of a kind that can be played here now. */
function ready(self: PlanFighter, band: RangeBand, kind: (t: CombatTechnique) => boolean) {
  return self.techniques
    .filter(kind)
    .map((technique): Card => ({ kind: 'jutsu', technique }))
    .find((card) => fitsBand(card, band) && playable(self, card));
}

/** Whether a fighter's kit holds a whole set-up, and their mind would play it. */
export function setsUp(self: PlanFighter): boolean {
  const { techniques } = self;
  return (
    readsInTheMoment(self) &&
    techniques.some(killing) &&
    techniques.some(holding) &&
    techniques.some(hiding)
  );
}

/** The set-up's next move against a match, if there is one to play now. */
export function setupPlay(self: PlanFighter, { band, foes }: SetupMoment): SetupPlay | undefined {
  if (!setsUp(self)) return undefined;
  const own = Math.max(1, fightingPower(self.attributes));
  const matches = foes.filter(
    (f) => alive(f) && fightingPower(f.attributes) / own >= SETUP_MATCH_RATIO,
  );
  if (matches.length === 0) return undefined;
  const open = matches.find(isOpen);
  const kill = open ? ready(self, band, killing) : undefined;
  if (kill) return { card: kill, target: open };
  const target = matches.find((f) => !f.hidden);
  const hold = self.hidden && target ? ready(self, band, holding) : undefined;
  if (hold) return { card: hold, target };
  const hide = self.hidden ? undefined : ready(self, band, hiding);
  return hide ? { card: hide, target: undefined } : undefined;
}
