import type { CombatItem } from '../../contract';
import { itemBlocker, itemEffect } from '../../rules/items';
import { volley } from './arms';
import { harmLine } from '../../rules/narration';
import { changeHealth } from './health';
import { taken, wound } from './wound';
import type { Card } from './cards';
import { opponentsOf, type Turn } from './senses';
import { fighterIn, say, type PlanFighter, type Round } from './state';
import { tell } from '../../rules/telling';

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
    case 'volley':
      return false;
  }
}

/** A slotted tool this moment calls for (explosive tags and shuriken are picked as attacks). */
export function toolInstinct(
  self: PlanFighter,
  ready: readonly Card[],
  moment: ToolMoment,
): Card | undefined {
  return ready.find((c): c is ToolCard => c.kind === 'item' && worthIt(self, c.item, moment));
}

/** Uses one of a tool from the pouch, writing the user and their foes back into the round. */
export function useTool(round: Round, turn: Turn, item: CombatItem): Round {
  const { actor, target, rng } = turn;
  const foes = opponentsOf(round.fighters, actor);
  if (itemBlocker(actor, item, foes)) return round;
  if (item.effect === 'volley') return thrown(round, turn, item);
  const used = itemEffect(
    { user: actor, item, foes, ...(target ? { targetId: target.id } : {}) },
    rng,
  );
  // Smoke is a fresh hiding place: no one has glimpsed them in it yet.
  const user = used.user.hidden && !actor.hidden ? { ...used.user, exposure: 0 } : used.user;
  const fighters = round.fighters.map((f) =>
    f.id === actor.id ? user : (used.foes.find((foe) => foe.id === f.id) ?? f),
  );
  // A salve's mending is written as it is made, and shows with the line that tells it.
  const mended = used.mended
    ? changeHealth({ ...round, fighters }, actor.id, used.mended, { cause: 'heal', by: actor.id })
    : { ...round, fighters };
  const told = say(mended, ...used.log);
  const struck = used.struck && fighterIn(told, used.struck.id);
  if (!used.struck || !struck) return told;
  // A tool's hit is a hit like any other (`wound.ts`): a clone pops, a hold breaks, a coward runs.
  const damage = taken(struck, used.struck.damage);
  const line = harmLine(tell('{t} take{t.s} the hit.', { t: struck }), damage);
  return wound(told, { who: struck.id, damage, by: actor.id }, line);
}

/** A volley of shuriken: one handful spent, then thrown as steel (`arms.ts`). */
function thrown(round: Round, turn: Turn, item: CombatItem): Round {
  const items = turn.actor.items.map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i));
  const fighters = round.fighters.map((f) => (f.id === turn.actor.id ? { ...f, items } : f));
  const spent = { ...round, fighters };
  const actor = fighterIn(spent, turn.actor.id) ?? turn.actor;
  return volley(spent, { ...turn, actor });
}
