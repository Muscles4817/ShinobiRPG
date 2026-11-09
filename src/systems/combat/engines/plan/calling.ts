import { fightingPower } from '@/systems/stats';

import type { CombatCall, CombatTechnique, RangeBand } from '../../contract';
import { alive } from '../../rules/body';
import { lastDitch, outmatched } from '../../rules/trumps';
import { hasVerb, openStep } from '../../rules/verbs';
import { answers, callsOf, isOut } from './calls';
import { playable, type Card } from './cards';
import { climbReasons, isStill } from './climbing';
import { effortOf } from './effort';
import { readsInTheMoment } from './judgement';
import { stillnessHolds } from './stillness';
import { opponentsOf } from './senses';
import { upkeepOut, UPKEEP_HORIZON } from './summons';
import type { PlanFighter, Reads } from './state';

/** The fighters a call is weighed among. */
interface Table {
  readonly fighters: readonly PlanFighter[];
}

/**
 * A summoner fights from the kit (Jiraiya and the toads): a fighter whose kit calls more than
 * one summon calls them as the fight calls for them, taking no plan slot, the way a ladder is
 * climbed (`climbing.ts`). Against anyone reasonably strong (`STRONG_SHARE`) the style comes out
 * at once: a mount to cover and carry them, the sage toads onto their shoulders, and the
 * meditation into Sage Mode (`meditation.ts`; with no mount, a conceal to meditate in). Past
 * that, they call only what the fight shows they need, read as a ladder's next step is
 * (`climbReasons`): the trade going against them (or a foe sized up as far stronger), their
 * blows not touching the foe, or being hurt. A summoner who doesn't need help fights with their
 * own arts. What they call is what the need is: the biggest body that can be kept when they are
 * outmatched or hurt, else the cheapest that answers, and another, bigger one if the need is
 * still there once it is out. Calls that can't be kept a few exchanges (`UPKEEP_HORIZON`) wait;
 * and what is out goes home as it is hurt or the chakra runs low (`summons.ts`), so the
 * summoner calls and unsummons what the fight needs.
 */

/** From this share of their own power, a foe is worth the whole style from the start. */
export const STRONG_SHARE = 0.6;

/** Whether a fighter fights by summoning: their kit calls more than one summon. */
export function fightsBySummons(f: Pick<PlanFighter, 'techniques'>): boolean {
  return new Set(f.techniques.flatMap(callsOf)).size > 1;
}

function callOf(self: PlanFighter, id: string): CombatCall | undefined {
  return self.calls?.find((c) => c.id === id);
}

/** What a summoning technique would add to the upkeep paid each exchange. */
function addedUpkeep(self: PlanFighter, t: CombatTechnique): number {
  return callsOf(t).reduce((sum, id) => sum + (callOf(self, id)?.upkeep ?? 0), 0);
}

/** Whether a technique can be played now and, if it calls, its summons kept out a while. */
function canAfford(self: PlanFighter, round: Table, t: CombatTechnique): boolean {
  if (!playable(self, { kind: 'jutsu', technique: t })) return false;
  const calls = callsOf(t);
  if (calls.length === 0) return true;
  const upkeep = (upkeepOut(round, self) + addedUpkeep(self, t)) * UPKEEP_HORIZON;
  return self.chakra - effortOf(self, t).amount >= upkeep;
}

/** The kit's summoning techniques that would answer now and can be kept, best body first. */
function callers(self: PlanFighter, round: Table): CombatTechnique[] {
  const body = (t: CombatTechnique) =>
    callsOf(t).reduce((sum, id) => sum + (callOf(self, id)?.body.maxHealth ?? 0), 0);
  return self.techniques
    .filter((t) => callsOf(t).length > 0 && callsOf(t).every((id) => answers(self, id)))
    .filter((t) => canAfford(self, round, t))
    .sort((a, b) => body(b) - body(a));
}

const jutsu = (technique: CombatTechnique): Card => ({ kind: 'jutsu', technique });

/** How strong the strongest foe standing is, against their own power. */
function foeShare(self: PlanFighter, fighters: readonly PlanFighter[]): number {
  const foes = opponentsOf(fighters, self).filter(alive);
  const own = Math.max(1, fightingPower(self.attributes));
  return Math.max(0, ...foes.map((f) => fightingPower(f.attributes) / own));
}

/** The kit's Sage Mode, while it isn't open and they aren't meditating into it. */
function sageToOpen(self: PlanFighter): CombatTechnique | undefined {
  if (self.meditating) return undefined;
  return openStep(self, 'sage') === 0 ? self.techniques.find(isStill) : undefined;
}

/** Whether a mount of theirs stands ready to carry them. */
function mounted(self: PlanFighter, fighters: readonly PlanFighter[]): boolean {
  return fighters.some((f) => f.summoner === self.id && f.mount === true && alive(f));
}

/**
 * The road into Sage Mode: a mount to cover and carry them, the summons the mode needs (the sage
 * toads, onto their shoulders), then the meditation; with no mount to be had, a conceal to
 * meditate in when sitting still in the open wouldn't hold. Undefined when there is nothing to
 * do towards it now.
 */
function towardsSage(self: PlanFighter, round: CallingMoment): Card | undefined {
  const sage = sageToOpen(self);
  if (!sage) return undefined;
  const ready = callers(self, round);
  const covered = mounted(self, round.fighters) || self.hidden;
  const mount = ready.find((t) => callsOf(t).some((id) => callOf(self, id)?.mount));
  if (!covered && mount) return jutsu(mount);
  const missing = (sage.needsCalls ?? []).filter((id) => !isOut(self, id));
  if (missing.length > 0) {
    const call = ready.find((t) => callsOf(t).some((id) => missing.includes(id)));
    return call ? jutsu(call) : undefined;
  }
  // Going still only where the stillness would hold (`stillness.ts`); else hide first, or fight
  // on and let the plan change the fight (a hold, distance) before sitting down.
  const safe = !readsInTheMoment(self) || stillnessHolds(self, { ...round, band: round.band });
  if (safe) return canAfford(self, round, sage) ? jutsu(sage) : undefined;
  const hide = self.techniques.find((t) => hasVerb(t, 'conceal') && canAfford(self, round, t));
  return !self.hidden && hide ? jutsu(hide) : undefined;
}

/** What the fight has shown a summoner so far: whom they face, and what has been seen. */
export interface CallingMoment {
  readonly fighters: readonly PlanFighter[];
  /** The distance the fight stands at. */
  readonly band: RangeBand;
  readonly reads?: Reads;
  readonly exchange?: number;
}

/** Why they'd call for help now: the fight going against them, as a ladder reads it. */
function needsHelp(self: PlanFighter, { fighters, reads, exchange }: CallingMoment): boolean {
  const foes = opponentsOf(fighters, self);
  const why = climbReasons(self, {
    foes,
    ...(reads ? { reads } : {}),
    ...(exchange === undefined ? {} : { exchange }),
  });
  return why.losing || why.cantHurt || why.hurt;
}

/** The summon the need calls for: the biggest when outmatched or hurt, else the cheapest. */
function forTheNeed(self: PlanFighter, moment: CallingMoment): Card | undefined {
  const fighting = callers(self, moment).filter((t) =>
    callsOf(t).every((id) => !callOf(self, id)?.perch),
  );
  const foes = opponentsOf(moment.fighters, self);
  const dire = outmatched(self, foes) || lastDitch(self);
  const cheapest = [...fighting].sort((a, b) => addedUpkeep(self, a) - addedUpkeep(self, b));
  const pick = dire ? fighting[0] : cheapest[0];
  return pick ? jutsu(pick) : undefined;
}

/** What a summoner calls from the kit now, if anything: none for one who doesn't fight so. */
export function kitCall(self: PlanFighter, moment: CallingMoment): Card | undefined {
  if (!fightsBySummons(self) || self.sealed > 0) return undefined;
  if (opponentsOf(moment.fighters, self).length === 0) return undefined;
  const needed = needsHelp(self, moment);
  if (needed || foeShare(self, moment.fighters) >= STRONG_SHARE) {
    const sage = towardsSage(self, moment);
    if (sage) return sage;
  }
  return needed ? forTheNeed(self, moment) : undefined;
}
