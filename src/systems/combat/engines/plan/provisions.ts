import { healLine } from '../../rules/narration';
import { SECOND_WIND_HEAL, secondWindDue } from '../../rules/provisions';
import { patch, say, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Provisions in Plan & Watch (the rules are in `rules/provisions.ts`; fortified and steady are
 * set as the fight opens, the antidote where a harm lands): a second wind comes at the end of
 * an exchange, once a fight, to a fighter a good meal left in them.
 */
export function secondWinds(round: Round): Round {
  return round.fighters.reduce((now, f) => {
    if (!secondWindDue(f, f.secondWindSpent ?? false)) return now;
    const healed = Math.min(SECOND_WIND_HEAL, f.maxHealth - f.health);
    const fighters = patch(now.fighters, f.id, {
      health: f.health + healed,
      secondWindSpent: true,
    });
    const line = healLine(tell('{a} find{a.s} a second wind.', { a: f }), healed);
    return say({ ...now, fighters }, line);
  }, round);
}
