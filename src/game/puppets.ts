import type { PuppetDef } from '@/content';
import type { CombatantSetup, CombatCall } from '@/systems/combat';
import { MAX_HEALTH } from '@/systems/vitals';

import { attributesOf } from './combatants';
import type { GameContext } from './context';
import { personDust } from './dust/dust';

/**
 * Puppets as a fighter carries them into a fight (`content/puppets.ts`): each a call its
 * unsealing technique makes, a built body worked on threads. It answers no clan and asks no
 * blood, only the chakra for its threads every exchange.
 */

const PUPPET_TAG = 'Puppet';

function puppetBody(puppet: PuppetDef, ctx: GameContext): CombatantSetup {
  const health = Math.max(1, Math.round(MAX_HEALTH * puppet.healthScale));
  const dust = personDust({ clan: undefined, dustId: puppet.dust }, ctx);
  return {
    id: puppet.id,
    name: puppet.name,
    grammar: 'it',
    tag: PUPPET_TAG,
    attributes: attributesOf(puppet.stats),
    health,
    maxHealth: health,
    chakra: puppet.maxChakra,
    maxChakra: puppet.maxChakra,
    techniques: puppet.techniqueIds.map((id) => ctx.content.techniques.require(id)),
    ...(puppet.traits ? { traits: puppet.traits } : {}),
    ...(dust ? { dust } : {}),
  };
}

function puppetCall(puppet: PuppetDef, ctx: GameContext): CombatCall {
  return { id: puppet.id, body: puppetBody(puppet, ctx), upkeep: puppet.upkeep, puppet: true };
}

/** A fighter with these puppets on their threads: the unsealing techniques and the calls. */
export function withPuppets(
  fighter: CombatantSetup,
  puppetIds: readonly string[],
  ctx: GameContext,
): CombatantSetup {
  if (puppetIds.length === 0) return fighter;
  const puppets = puppetIds.map((id) => ctx.content.puppets.require(id));
  return {
    ...fighter,
    techniques: [
      ...fighter.techniques,
      ...puppets.map((p) => ctx.content.techniques.require(p.techniqueId)),
    ],
    calls: [...(fighter.calls ?? []), ...puppets.map((p) => puppetCall(p, ctx))],
  };
}
