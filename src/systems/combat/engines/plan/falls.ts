import type { CombatForm, CombatOccasion, CombatResult } from '../../contract';
import { momentOf, told, type Bank } from './fresh';
import { formOf } from './scene';
import { patch, playerOf, say, type PlanFighter, type Round } from './state';

/**
 * How a planned fight marks its ends: a line when a fighter goes down (in words for what they
 * are: a spirit comes apart, a beast crumples, a person stays down; and where: against a wall,
 * among the roots), remembered as the exchange they fell in for the fight's summary, and a
 * closing beat when the fight is over, which a spar or a bout ends in its own way. Narration
 * only: who falls is the rules' business, never this file's.
 */

const FALLS: Readonly<Record<CombatForm, Bank>> = {
  spirit: {
    id: 'fall-spirit',
    lines: [
      '{t} comes apart like smoke.',
      '{t} thins to nothing and is gone.',
      '{t} unravels with a sound like a long breath let out.',
    ],
    scene: {
      room: ['{t} sinks into the floorboards and does not come back up.'],
      lake: ['{t} sinks into the lake without a ripple.'],
    },
  },
  beast: {
    id: 'fall-creature',
    lines: ['{t} crumples and lies still.', '{t} sinks down and doesn’t get up again.'],
    scene: {
      forest: ['{t} crashes down into the undergrowth and lies still.'],
      lake: ['{t} rolls over in the water and floats there, still.'],
      desert: ['{t} slumps into the sand, and the wind starts covering it at once.'],
      late: ['{t} has fought as long as it can, and goes down at last.'],
    },
  },
  swarm: {
    id: 'fall-swarm',
    lines: [
      '{t} breaks apart, and what is left of it scatters.',
      '{t} thins out and drifts away in ones and twos.',
    ],
  },
  person: {
    id: 'fall-person',
    lines: [
      '{t} go{t.es} down and stay{t.s} down.',
      '{t} drop{t.s} to {t.their} knees and topple{t.s} over.',
      '{t} hit{t.s} the ground and {t.does}n’t get up.',
    ],
    scene: {
      teammate: ['{t} go{t.es} down in a heap, laughing at {t.themself} for walking into it.'],
      rival: ['{t} go{t.es} down hard, and it costs {t.them} more than the fall.'],
      spar: ['{t} go{t.es} down and raise{t.s} a hand to call it.'],
      bout: ['{t} go{t.es} down, and the proctor is already moving in.'],
      room: ['{t} slide{t.s} down the wall and stay{t.s} there.'],
      forest: ['{t} fall{t.s} among the roots and {t.does}n’t get up.'],
      town: ['{t} crumple{t.s} in the street and {t.does}n’t get up.'],
      lake: ['{t} lose{t.s} {t.their} footing on the water and go{t.es} down into it.'],
      desert: ['{t} pitch{t.es} forward into the hot sand and {t.does}n’t get up.'],
      late: ['After all of it, {t} simply fold{t.s} and go{t.es} down.'],
    },
  },
};

/** A fighter who has just gone down: told, and the exchange remembered. */
export function felled(round: Round, f: PlanFighter): Round {
  const fighters = patch(round.fighters, f.id, { fellAt: round.number });
  return say({ ...round, fighters }, told(momentOf(round, f.id), FALLS[formOf(f)], { t: f }));
}

type Closings = Readonly<Record<CombatResult, Bank>>;

const CLOSINGS: Closings = {
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

const CALLED_OFF: Bank = {
  id: 'called-off',
  lines: ['{a} call{a.s} it before it goes any further, and {f} let{f.s} it go.'],
};

/** How a spar or a bout ends: on its feet, with a hand up or a look, never in the dark. */
const OCCASION_CLOSINGS: Readonly<Record<CombatOccasion, Closings>> = {
  spar: {
    victory: {
      id: 'won-spar',
      lines: [
        '{f} stay{f.s} down a moment, then raise{f.s} a hand to say that’s enough.',
        'That’s the spar. {f} take{f.s} a breath on the ground before getting up.',
      ],
    },
    defeat: {
      id: 'lost-spar',
      lines: [
        '{f} step{f.s} back and wait{f.s} for {a} to get {a.their} breath.',
        'The spar is over, and {a} lie{a.s} there a while getting {a.their} breath back.',
      ],
    },
    escaped: CALLED_OFF,
  },
  teammate: {
    victory: {
      id: 'won-teammate',
      lines: [
        '{f} lie{f.s} on the grass a moment, then ask{f.s} {a} to show {f.them} that again.',
        '{f} take{f.s} {a.poss} hand up, already asking for another go.',
      ],
    },
    defeat: {
      id: 'lost-teammate',
      lines: [
        '{f} stand{f.s} back, breathing hard, and tell{f.s} {a} what {f.they} saw {a.them} do wrong.',
        '{f} {f.is} already talking about the next one before {a} {a.is} back on {a.their} feet.',
      ],
    },
    escaped: CALLED_OFF,
  },
  rival: {
    victory: {
      id: 'won-rival',
      lines: [
        '{f} get{f.s} up without taking {a.poss} hand and won’t meet {a.poss} eye.',
        '{f} stay{f.s} down a moment longer than {f.they} need{f.ps} to.',
      ],
    },
    defeat: {
      id: 'lost-rival',
      lines: [
        '{f} stand{f.s} over {a} long enough to be sure {a.they} know{a.ps} who won.',
        '{f} walk{f.s} away before {a} can get up.',
      ],
    },
    escaped: {
      id: 'fled-rival',
      lines: ['{f} let{f.s} {a} go, and make{f.s} sure everyone watching saw it.'],
    },
  },
  bout: {
    victory: {
      id: 'won-bout',
      lines: [
        'The proctor steps in and calls the bout.',
        'The proctor raises a hand, and the bout is over.',
      ],
    },
    defeat: {
      id: 'lost-bout',
      lines: [
        'The proctor steps between {a} and {f} and calls it.',
        'The proctor calls the bout before it goes any further.',
      ],
    },
    escaped: {
      id: 'fled-bout',
      lines: ['{a} step{a.s} out of the ring, and the proctor calls it.'],
    },
  },
};

/** The beat that closes a fight. */
export function closingLine(round: Round, result: CombatResult): string {
  const player = playerOf(round);
  const foe = round.fighters.find((f) => f.side === 'enemy') ?? player;
  const closings = round.occasion ? OCCASION_CLOSINGS[round.occasion] : CLOSINGS;
  return told(momentOf(round, 'end'), closings[result], { a: player, f: foe });
}
