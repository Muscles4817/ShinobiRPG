import type { RangeBand } from '../../../contract';
import { alive } from '../../../rules/body';
import { maxBreath } from '../../../rules/breath';
import { isTrump, lastDitch, outmatched, trumpSpent } from '../../../rules/trumps';
import { hasVerb, isHindering, isWounding } from '../../../rules/verbs';
import { fitsBand, playable } from '../cards';
import { nextOpening } from '../climbing';
import { canDaze } from '../daze';
import { bandOf } from '../distance';
import { isOpen } from '../finishers';
import { inSight, opponentsOf } from '../senses';
import type { PlanFighter, Round } from '../state';
import { heaviest, killerOf } from '../survival';
import { identityOf } from './identity';

/**
 * The assessment (`docs/design/combat-ai-plan.md` Part 5): the situation as one fighter reads
 * it when they decide, from their own true state and what they can see. A fixed set of
 * readings, each small and graded, that objectives are chosen from (`objectives.ts`). Shown
 * only, like everything in the mind for now.
 */

export interface Assessment {
  /** A foe who could end them now (`survival.ts`). */
  readonly killer: boolean;
  /** Their heaviest blow against the worst foe in sight, as a share of their own health left. */
  readonly danger: number;
  /** A foe in sight they could end with one blow from here. */
  readonly canEnd: boolean;
  /** A foe in sight dazed or held: open to a finisher. */
  readonly openFoe: boolean;
  /** A hold or a hiding in the kit, and a foe it would take on. */
  readonly canSetUp: boolean;
  /** Where they fight from, and whether they stand there. */
  readonly home: RangeBand;
  readonly atHome: boolean;
  readonly chakra: number;
  readonly breath: number;
  readonly health: number;
  /** Foes hidden and none to fight in sight. */
  readonly nothingInSight: boolean;
  /** A step up the kit can still take: a ladder, a summons, a trump kept back. */
  readonly canEscalate: boolean;
  /** The next step is a ladder's: climbing is how this fighter fights (the Gates, Sage Mode). */
  readonly climbs: boolean;
  /** A technique that wounds can still be paid for from here, besides a plain blow. */
  readonly canFight: boolean;
  /** Up against a far stronger foe, or badly hurt. */
  readonly outclassed: boolean;
}

const share = (n: number, of: number) => (of > 0 ? Math.min(1, Math.max(0, n / of)) : 1);

function kitCanEscalate(self: PlanFighter): boolean {
  if (nextOpening(self)) return true;
  return self.techniques.some(
    (t) =>
      (hasVerb(t, 'summon') || (isTrump(t) && !trumpSpent(self, t))) &&
      playable(self, { kind: 'jutsu', technique: t }),
  );
}

function holdsAndHides(self: PlanFighter): boolean {
  return self.techniques.some(
    (t) =>
      ((isHindering(t) && !isWounding(t)) || hasVerb(t, 'conceal')) &&
      playable(self, { kind: 'jutsu', technique: t }),
  );
}

export function assess(self: PlanFighter, round: Round): Assessment {
  const foes = opponentsOf(round.fighters, self).filter(alive);
  const seen = foes.filter((f) => inSight(self, f));
  const band = bandOf(round, self);
  const home = identityOf(self).range;
  const blows = seen.map((f) => ({
    foe: f,
    theirs: heaviest(f, self),
    mine: heaviest(self, f, band),
  }));
  const fresh = seen.some((f) => canDaze(f, round.number) && !isOpen(f));
  return {
    killer: killerOf(self, { ...round, fighters: round.fighters }) !== undefined,
    danger: share(Math.max(0, ...blows.map((b) => b.theirs)), self.health),
    canEnd: blows.some((b) => b.mine >= b.foe.health),
    openFoe: seen.some(isOpen),
    canSetUp: fresh && holdsAndHides(self),
    home,
    atHome: band === home,
    chakra: share(self.chakra, self.maxChakra),
    breath: share(self.breath ?? maxBreath(self.attributes), maxBreath(self.attributes)),
    health: share(self.health, self.maxHealth),
    nothingInSight: seen.length === 0 && foes.length > 0,
    canEscalate: kitCanEscalate(self),
    climbs: nextOpening(self) !== undefined,
    canFight: self.techniques.some((t) => {
      const card = { kind: 'jutsu' as const, technique: t };
      return isWounding(t) && playable(self, card) && fitsBand(card, band);
    }),
    outclassed: lastDitch(self) || outmatched(self, seen),
  };
}
