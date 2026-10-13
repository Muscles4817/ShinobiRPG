import { shouldFlee } from '../../rules/kit';
import { fighterIn, patch, say, type Round } from './state';

/**
 * Taking damage off a fighter in a planned fight, whatever dealt it (a blow, a riposte, a
 * lingering harm): a coward who is now badly hurt runs and counts as beaten.
 */
export function wound(round: Round, id: string, damage: number): Round {
  const struck = fighterIn(round, id);
  if (!struck) return round;
  const hurt = { ...struck, health: Math.max(0, struck.health - damage) };
  const fighters = patch(round.fighters, id, { health: hurt.health });
  if (!shouldFlee(hurt)) return { ...round, fighters };
  return say({ ...round, fighters: patch(fighters, id, { health: 0 }) }, `${struck.name} flees!`);
}
