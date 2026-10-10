import type { CombatItem } from '../../contract';
import { itemBlocker, useItem } from '../../rules/items';
import { shouldFlee } from '../../rules/kit';
import type { Card } from './cards';
import { opponentsOf, type Turn } from './senses';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * Tools as cards. A slotted tool is played like a jutsu card and spent, but only when it helps:
 * salves and pills when running low, a flash when someone is hiding, a charm when confused,
 * smoke to open a round. An explosive tag is an attack and is picked like one. Tools never
 * misfire from confusion and never give a hidden fighter away.
 */

/** Below this share of health or chakra, a salve or pill is worth using. */
const RESTORE_BELOW = 0.5;

type ToolCard = Extract<Card, { kind: 'item' }>;

/** What a fighter knows when deciding whether a tool is worth using now. */
export interface ToolMoment {
  /** Some living foe is hidden. */
  readonly hiddenFoe: boolean;
  /** The first exchange of a round. */
  readonly opening: boolean;
}

function worthIt(self: PlanFighter, item: CombatItem, moment: ToolMoment): boolean {
  switch (item.effect) {
    case 'smoke':
      return moment.opening && !self.hidden;
    case 'flash':
      return moment.hiddenFoe;
    case 'clarity':
      return self.confused > 0;
    case 'heal':
      return self.health < self.maxHealth * RESTORE_BELOW;
    case 'chakra':
      return self.chakra < self.maxChakra * RESTORE_BELOW;
    case 'blast':
      return false;
  }
}

/** A slotted tool this moment calls for (explosive tags are picked as attacks instead). */
export function toolInstinct(
  self: PlanFighter,
  ready: readonly Card[],
  moment: ToolMoment,
): Card | undefined {
  return ready.find((c): c is ToolCard => c.kind === 'item' && worthIt(self, c.item, moment));
}

/** A blast that leaves a coward badly hurt sends them running, like any other wound. */
function fleeIfBroken(round: Round, id: string): Round {
  const struck = fighterIn(round, id);
  if (!struck || struck.health <= 0 || !shouldFlee(struck)) return round;
  return say(
    { ...round, fighters: patch(round.fighters, struck.id, { health: 0 }) },
    `${struck.name} flees!`,
  );
}

/** Uses one of a tool from the pouch, writing the user and their foes back into the round. */
export function useTool(round: Round, { actor, target, rng }: Turn, item: CombatItem): Round {
  const foes = opponentsOf(round.fighters, actor);
  if (itemBlocker(actor, item, foes)) return round;
  const used = useItem(
    { user: actor, item, foes, ...(target ? { targetId: target.id } : {}) },
    rng,
  );
  const fighters = round.fighters.map((f) =>
    f.id === actor.id ? used.user : (used.foes.find((foe) => foe.id === f.id) ?? f),
  );
  const told = say({ ...round, fighters }, ...used.log);
  const struck = used.foes.find((f) => f.id === target?.id);
  const damage = struck && target ? target.health - struck.health : 0;
  if (!struck || damage <= 0) return told;
  return fleeIfBroken(say(told, `${struck.name} takes ${damage}.`), struck.id);
}
