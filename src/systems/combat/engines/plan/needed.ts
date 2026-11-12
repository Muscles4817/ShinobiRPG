import type { CombatTechnique, RangeBand } from '../../contract';
import { hasPerk } from '../../rules/body';
import { effectsOf, hasVerb, isWounding, opensOf } from '../../rules/verbs';
import { isDefenceCard, type Card } from './cards';
import { partnered } from './combo';
import { bandOf } from './distance';
import { ownField } from './field';
import { moveDestination } from './footwork';
import { toolInstinct } from './pouch';
import { prepNeeded } from './prep';
import { inSight, opponentsOf } from './senses';
import type { PlanFighter, Round } from './state';

/**
 * Whether a card is needed now (`needed`), for a plan's slot (`slots.ts`) and a foe's
 * announced card at its turn (`round.ts`) alike.
 */

/**
 * No healing at full health, no sensing with no one hidden (or foes already read), no hiding
 * twice, no raising a field while yours is up, no move to where you already are, no
 * combination without a partner ready to join it, no riposte while one is ready, no throw
 * that only moves a foe to where they already are.
 */
/** Where a technique's throw or pull leaves the distance, if it has one. */
function knockTo(t: CombatTechnique): RangeBand | undefined {
  return effectsOf(t, 'knock')[0]?.to;
}

/** A riposte while one is ready, or a throw that only moves a foe to where they are. */
function wasted(self: PlanFighter, t: CombatTechnique, round: Round): boolean {
  if (hasVerb(t, 'counter') && self.riposte) return true;
  return !isWounding(t) && knockTo(t) === bandOf(round, self);
}

function jutsuNeeded(self: PlanFighter, t: CombatTechnique, round: Round): boolean {
  const hiddenFoe = opponentsOf(round.fighters, self).some((f) => f.hidden);
  if (wasted(self, t, round)) return false;
  // A gate that also heals is opened for the gate, not the healing.
  if (hasVerb(t, 'heal') && !opensOf(t) && self.health >= self.maxHealth) return false;
  if (hasVerb(t, 'sense') && (!hiddenFoe || hasPerk(self, 'insight'))) return false;
  if (hasVerb(t, 'field') && ownField(round.field, self)) return false;
  if (moveDestination(self, t) === bandOf(round, self)) return false;
  if (!partnered(round.fighters, self, t)) return false;
  const foes = opponentsOf(round.fighters, self);
  const foeInSight = foes.some((f) => inSight(self, f));
  const facing = {
    foeInSight,
    foes,
    exchange: round.number,
    ...(round.reads ? { reads: round.reads } : {}),
  };
  if (!prepNeeded(self, t, facing)) return false;
  return !(hasVerb(t, 'conceal') && self.hidden);
}

/**
 * Whether a card is needed now: no searching with no one hidden, no healing at full health, no
 * getting ready twice over or with no foe in sight (`prep.ts`). A foe's announced card is held
 * to it too, at its turn (`round.ts`).
 */
export function needed(self: PlanFighter, card: Card, round: Round): boolean {
  if (isDefenceCard(card)) return true;
  const hiddenFoe = opponentsOf(round.fighters, self).some((f) => f.hidden);
  switch (card.kind) {
    case 'search':
      return hiddenFoe;
    case 'dispel':
      return hiddenFoe || self.confused > 0;
    case 'item':
      return (
        card.item.effect === 'blast' ||
        toolInstinct(self, [card], { hiddenFoe, opening: round.opening ?? false }) !== undefined
      );
    case 'jutsu':
      return jutsuNeeded(self, card.technique, round);
    case 'strike':
    case 'throw':
    case 'step':
    case 'gather':
      return true;
  }
}
