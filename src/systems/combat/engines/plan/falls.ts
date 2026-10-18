import type { CombatResult } from '../../contract';
import { momentOf, told, type Bank } from './fresh';
import { patch, playerOf, say, type PlanFighter, type Round } from './state';

/**
 * How a planned fight marks its ends: a line when a fighter goes down (in words for what they
 * are: a spirit comes apart, a beast crumples, a person stays down), remembered as the exchange
 * they fell in for the fight's summary, and a closing beat when the fight is over. Narration
 * only: who falls is the rules' business, never this file's.
 */

const FALLS: Readonly<Record<'spirit' | 'creature' | 'person', Bank>> = {
  spirit: {
    id: 'fall-spirit',
    lines: [
      '{t} comes apart like smoke.',
      '{t} thins to nothing and is gone.',
      '{t} unravels with a sound like a long breath let out.',
    ],
  },
  creature: {
    id: 'fall-creature',
    lines: ['{t} crumples and lies still.', '{t} sinks down and doesn’t get up again.'],
  },
  person: {
    id: 'fall-person',
    lines: [
      '{t} go{t.es} down and stay{t.s} down.',
      '{t} drop{t.s} to {t.their} knees and topple{t.s} over.',
      '{t} hit{t.s} the ground and {t.does}n’t get up.',
    ],
  },
};

function fallsAs(f: PlanFighter): Bank {
  if (f.traits.includes('spirit')) return FALLS.spirit;
  return f.grammar === 'it' ? FALLS.creature : FALLS.person;
}

/** A fighter who has just gone down: told, and the exchange remembered. */
export function felled(round: Round, f: PlanFighter): Round {
  const fighters = patch(round.fighters, f.id, { fellAt: round.number });
  return say({ ...round, fighters }, told(momentOf(round, f.id), fallsAs(f), { t: f }));
}

const CLOSINGS: Readonly<Record<CombatResult, Bank>> = {
  victory: {
    id: 'won',
    lines: [
      '{a} {a.is} still on {a.their} feet, and no one is left to face {a.them}.',
      'It goes quiet, and the fight is over.',
      'The last of them is down, and it is over.',
    ],
  },
  defeat: {
    id: 'lost',
    lines: [
      'Everything goes dark.',
      'The fight goes on a little longer without {a.them}, then ends.',
    ],
  },
  escaped: { id: 'fled', lines: ['{a} {a.is} away, and no one follows.'] },
};

/** The beat that closes a fight. */
export function closingLine(round: Round, result: CombatResult): string {
  const player = playerOf(round);
  return told(momentOf(round, 'end'), CLOSINGS[result], { a: player });
}
