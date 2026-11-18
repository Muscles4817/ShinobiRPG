import { statTier, STAT_GRADES } from '@/systems/stats';

import { maxBreath } from '../../rules/breath';
import { readLine } from '../../rules/narration';
import { tell } from '../../rules/telling';
import { findCard } from './cards';
import { eyeFor } from './fighterReads';
import { readsInTheMoment } from './judgement';
import { playerOf, type PlanFighter, type PlanState } from './state';

/**
 * What the player's fighter made of the round just played, said as the next one is planned:
 * the fight as they live it (`docs/design/combat-ai-plan.md` Part 13b). A foe caught unready and
 * hurt, the worse of it going to you, a foe winded or running dry of chakra, a foe leaning on one
 * move, a foe who has your own habit read. Wits set how many of these they put together after a
 * round; a keen eye says them plainly, a dull one says how it looked. Each is a `readLine`.
 */

/** Reads made after a round, by intellect grade. */
const ROUND_READS = [1, 1, 2, 2, 3, 3] as const;
/** Perception grade index from which a read is said as sure. */
const SURE_FROM = 3;
/** Perception grade index from which a foe's chakra can be felt running thin. */
const FEELS_CHAKRA_FROM = 3;
/** Intellect grade index from which a habit (theirs or yours) is noticed. */
const SEES_HABITS_FROM = 2;
/** Share of their health a round must take before it shows as a telling hurt. */
const HURT_SHARE = 0.25;
/** Share of breath or chakra left below which it shows. */
const LOW_SHARE = 0.3;
/** Turns running on one move before it is a habit. */
const HABIT_TURNS = 3;

interface Read {
  readonly sure: string;
  readonly looks: string;
  readonly about?: PlanFighter;
  readonly what?: string;
}

function lostShare(state: PlanState, f: PlanFighter): number {
  const was = state.healthAtRound?.[f.id];
  return was === undefined ? 0 : (was - f.health) / Math.max(1, f.maxHealth);
}

function hurt(state: PlanState, self: PlanFighter, foes: readonly PlanFighter[]): Read[] {
  const theirs = foes
    .filter((f) => lostShare(state, f) >= HURT_SHARE)
    .map((about) => ({
      about,
      sure: "{b} {b.was}n't ready for that, and it hurt.",
      looks: 'That looked like it hurt {b}.',
    }));
  const mine = lostShare(state, self);
  const worst = Math.max(0, ...foes.map((f) => lostShare(state, f)));
  const yours =
    mine >= HURT_SHARE && mine > worst
      ? [
          {
            sure: '{a} {a.is} getting the worse of this.',
            looks: 'That round went badly for {a.them}.',
          },
        ]
      : [];
  return [...yours, ...theirs];
}

function spent(self: PlanFighter, foe: PlanFighter): Read[] {
  const breath = foe.breath ?? maxBreath(foe.attributes);
  const winded =
    breath < maxBreath(foe.attributes) * LOW_SHARE
      ? [
          {
            about: foe,
            sure: "{b} {b.is} short of breath: {b.their} body moves won't last.",
            looks: '{b} looks winded.',
          },
        ]
      : [];
  const dry =
    eyeFor(self) >= FEELS_CHAKRA_FROM && foe.maxChakra > 0 && foe.chakra < foe.maxChakra * LOW_SHARE
      ? [
          {
            about: foe,
            sure: '{b.poss} chakra is running thin.',
            looks: '{b.poss} chakra feels low.',
          },
        ]
      : [];
  return [...winded, ...dry];
}

/** The technique a fighter has played turns running, if they have made a habit of one. */
function habit(f: PlanFighter): string | null {
  const streak = f.streak;
  if (!streak || streak.turns < HABIT_TURNS) return null;
  const card = findCard(f, streak.card);
  return card?.kind === 'jutsu' ? card.technique.name : null;
}

function habits(self: PlanFighter, foes: readonly PlanFighter[]): Read[] {
  if (STAT_GRADES.indexOf(statTier(self.attributes.intellect).grade) < SEES_HABITS_FROM) return [];
  const theirs = foes.flatMap((about): Read[] => {
    const what = habit(about);
    return what
      ? [
          {
            about,
            what,
            sure: '{b} keep{b.s} coming back to {what}. {a} can see it coming.',
            looks: '{b} keep{b.s} trying {what}.',
          },
        ]
      : [];
  });
  const mine = habit(self);
  const reader = mine ? foes.find(readsInTheMoment) : undefined;
  const yours: Read[] =
    mine && reader
      ? [
          {
            about: reader,
            what: mine,
            sure: '{b} {b.has} seen {a.poss} {what} enough to read it.',
            looks: '{b} may be onto {a.poss} {what}.',
          },
        ]
      : [];
  return [...theirs, ...yours];
}

/** What the player's fighter made of the round just played, as lines. */
export function roundReads(state: PlanState): string[] {
  const self = playerOf(state);
  if (self.health <= 0) return [];
  const foes = state.fighters.filter(
    (f) => f.side !== self.side && f.health > 0 && !f.hidden && !f.shadowOf,
  );
  const sure = eyeFor(self) >= SURE_FROM;
  const reads = [
    ...hurt(state, self, foes),
    ...foes.flatMap((foe) => spent(self, foe)),
    ...habits(self, foes),
  ];
  const wits = STAT_GRADES.indexOf(statTier(self.attributes.intellect).grade);
  return reads.slice(0, ROUND_READS[wits] ?? 1).map((r) =>
    readLine(
      tell(sure ? r.sure : r.looks, {
        a: self,
        ...(r.about ? { b: r.about } : {}),
        ...(r.what ? { what: r.what } : {}),
      }),
    ),
  );
}
