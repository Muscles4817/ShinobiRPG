import { hasPerk } from '../../rules/body';
import { isPinned } from '../../rules/verbs';
import { handsOnThreads, threadsHeld } from '../../rules/puppets';
import { tell } from '../../rules/telling';
import type { CombatTechnique } from '../../contract';
import { callsOf } from './calls';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * Puppets on their master's threads in a planned fight (`rules/puppets.ts`): how many a master
 * has up, whether a puppet's call fits their attention and a technique their busy hands, and a
 * puppet hanging slack while its master is dazed, pinned, sealed or reeling from a hard hit.
 * Eyes that see everything see the threads too: a hit they land on a puppet cuts them, and its
 * master spends their next turn casting fresh ones. A slack puppet holds no line (`rows.ts`).
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
  if (puppet.threadsCut !== undefined) return true;
  if (puppet.rethreading === true) return true;
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
  const calls = callsOf(technique);
  return (fighter.calls ?? []).find((c) => calls.includes(c.id) && c.puppet);
}

/** Whether a summoning technique unseals one of this fighter's puppets. */
export function unsealsPuppet(fighter: PlanFighter, technique: CombatTechnique): boolean {
  return puppetCalled(fighter, technique) !== undefined;
}

/** Whether it unseals a shell its master fights from inside, which comes out first. */
export function unsealsShell(fighter: PlanFighter, technique: CombatTechnique): boolean {
  return puppetCalled(fighter, technique)?.worn === true;
}

const CUT = '{a} see{a.s} the threads and strike{a.s} down them, and {t} drops slack.';

/** A hit landed on a puppet by eyes that see its threads cuts them. */
export function threadsCutBy(round: Round, attacker: PlanFighter, struck: PlanFighter): Round {
  const puppet = fighterIn(round, struck.id);
  if (!puppet?.puppet || puppet.threadsCut !== undefined || puppet.health <= 0) return round;
  if (!hasPerk(attacker, 'all-seeing')) return round;
  const fighters = patch(round.fighters, puppet.id, { threadsCut: round.number });
  return say({ ...round, fighters }, tell(CUT, { a: attacker, t: puppet }));
}

function retied(puppet: PlanFighter): PlanFighter {
  const { threadsCut: _cut, ...rest } = puppet;
  return { ...rest, rethreading: true };
}

const RETHREAD = '{a} cast{a.s} fresh threads to {p}.';

/**
 * A master whose threads were cut in an earlier exchange spends the turn casting fresh ones, or
 * null when none were: the exchange they were cut in, the puppet hangs slack whatever they do,
 * and it moves again only from the exchange after the fresh threads.
 */
export function rethreading(round: Round, master: PlanFighter): Round | null {
  const cut = round.fighters.filter(
    (f) => f.summoner === master.id && f.threadsCut !== undefined && f.threadsCut < round.number,
  );
  const [first] = cut;
  if (!first) return null;
  const fighters = round.fighters.map((f) => (cut.includes(f) ? retied(f) : f));
  return say({ ...round, fighters }, tell(RETHREAD, { a: master, p: first }));
}

/** As an exchange ends, puppets given fresh threads in it are worked again. */
export function threadsTaken(round: Round): Round {
  if (!round.fighters.some((f) => f.rethreading === true)) return round;
  const fighters = round.fighters.map((f) => {
    if (f.rethreading !== true) return f;
    const { rethreading: _done, ...rest } = f;
    return rest;
  });
  return { ...round, fighters };
}
