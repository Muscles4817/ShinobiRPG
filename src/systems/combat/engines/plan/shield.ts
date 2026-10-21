import type { Rng } from '@/core';

import { hasPerk } from '../../rules/body';
import type { HitType } from '../../rules/hits';
import { reactionLine } from '../../rules/narration';
import { shieldBlock, shieldMeets, shieldRises } from '../../rules/shield';
import { tell } from '../../rules/telling';
import { fighterIn, say, type PlanFighter, type Round } from './state';

/**
 * The automatic shield in a planned fight (`rules/shield.ts`): a fighter with the `shield` perk
 * and dust to hand has it rise on its own between them and a hit that would land, after their
 * ready defence has done what it does. It may be outrun by a fast enough attacker, it keeps out
 * what it holds and its dust pays for, and the rest comes through.
 */

/** A hit about to land, as the shield meets it. */
export interface ShieldedHit {
  readonly attacker: PlanFighter;
  readonly target: PlanFighter;
  /** What the blow names itself ("strike", "Fireball"). */
  readonly what: string;
  readonly hit: HitType;
  readonly breaks: boolean;
  readonly rng: Rng;
}

/** The round after the shield, and the force still coming through (0 when it took it all). */
export interface Shielding {
  readonly round: Round;
  readonly force: number;
}

/** The shield's dust in words: "sand", "gold dust". */
function dustWord(target: PlanFighter): string {
  return (target.dust?.kind.name ?? 'dust').toLowerCase();
}

/** Lets the target's shield meet a hit of this force, if they have one and it rises. */
export function shieldUp(round: Round, incoming: ShieldedHit, force: number): Shielding {
  const { attacker, rng } = incoming;
  const target = fighterIn(round, incoming.target.id) ?? incoming.target;
  const dust = target.dust;
  const unmet = { round, force };
  if (!dust || !hasPerk(target, 'shield') || !shieldMeets(incoming.hit)) return unmet;
  if (!rng.chance(shieldRises(dust, attacker.attributes.speed))) return unmet;
  const { kept, cost } = shieldBlock(dust, force, incoming.breaks);
  if (kept <= 0) return unmet;
  const spent = { ...dust, count: dust.count - cost };
  const fighters = round.fighters.map((f) => (f.id === target.id ? { ...f, dust: spent } : f));
  const word = dustWord(target);
  const slots = { t: target, a: attacker };
  const line =
    kept >= force
      ? tell(`{t.poss} ${word} rises on its own and takes {a.poss} ${incoming.what}.`, slots)
      : tell(`{t.poss} ${word} rises and takes some of it, but not all.`, slots);
  return {
    round: say({ ...round, fighters }, reactionLine(line, 'shielded')),
    force: force - kept,
  };
}
