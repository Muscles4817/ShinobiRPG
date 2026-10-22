import { isPinned } from '../../rules/verbs';
import { handsOnThreads, threadsHeld } from '../../rules/puppets';
import { tell } from '../../rules/telling';
import type { CombatTechnique } from '../../contract';
import { callOf } from './calls';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * Puppets on their master's threads in a planned fight (`rules/puppets.ts`): how many a master
 * has up, whether a puppet's call fits their attention and a technique their busy hands, and a
 * puppet hanging slack while its master is dazed, pinned, sealed or reeling from a hard hit.
 */

/** The puppets a fighter has up on their threads now. */
export function puppetsUp(fighter: PlanFighter): number {
  const out = fighter.summonsOut ?? [];
  return (fighter.calls ?? []).filter((c) => c.puppet && out.includes(c.id)).length;
}

/** Whether a technique is held back by the threads: a puppet past their attention, or signs. */
export function threadsForbid(fighter: PlanFighter, technique: CombatTechnique): boolean {
  if (unsealsPuppet(fighter, technique))
    return puppetsUp(fighter) >= threadsHeld(fighter.attributes);
  return puppetsUp(fighter) > 0 && !handsOnThreads(technique);
}

/** The master whose threads a puppet hangs on. */
function masterOf(round: Pick<Round, 'fighters'>, puppet: PlanFighter): PlanFighter | undefined {
  const id = puppet.puppet ? puppet.summoner : undefined;
  return id === undefined ? undefined : round.fighters.find((f) => f.id === id);
}

/** Whether a puppet's threads have gone slack: its master can't work them this moment. */
export function hangsSlack(round: Pick<Round, 'fighters'>, puppet: PlanFighter): boolean {
  const master = masterOf(round, puppet);
  if (!master) return false;
  return (
    master.stunned > 0 || master.sealed > 0 || isPinned(master) || master.threadsSlipped === true
  );
}

const SLACK = '{p} hang{p.s} slack on {p.their} threads.';

/** A puppet's turn lost to slack threads, or null while its master works it. */
export function slackTurn(round: Round, actor: PlanFighter): Round | null {
  return hangsSlack(round, actor) ? say(round, tell(SLACK, { p: actor })) : null;
}

/** The shell a fighter is inside, while it stands: a worn puppet of theirs. */
export function shellOf(round: Round, master: PlanFighter): PlanFighter | undefined {
  return round.fighters.find((f) => f.worn === true && f.summoner === master.id && f.health > 0);
}

/** A master's turn comes round: threads that slipped under a hard hit are taken up again. */
export function threadsRetaken(round: Round, actorId: string): Round {
  const actor = fighterIn(round, actorId);
  if (actor?.threadsSlipped !== true) return round;
  return { ...round, fighters: patch(round.fighters, actorId, { threadsSlipped: false }) };
}

function puppetCalled(fighter: PlanFighter, technique: CombatTechnique) {
  const call = callOf(technique);
  return (fighter.calls ?? []).find((c) => c.id === call && c.puppet);
}

/** Whether a summoning technique unseals one of this fighter's puppets. */
export function unsealsPuppet(fighter: PlanFighter, technique: CombatTechnique): boolean {
  return puppetCalled(fighter, technique) !== undefined;
}

/** Whether it unseals a shell its master fights from inside, which comes out first. */
export function unsealsShell(fighter: PlanFighter, technique: CombatTechnique): boolean {
  return puppetCalled(fighter, technique)?.worn === true;
}
