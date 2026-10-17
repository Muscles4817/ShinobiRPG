import type { CombatOutcome } from '@/systems/combat';
import { recordMeeting } from '@/systems/bonds';
import type { StatDelta } from '@/systems/stats';
import type { Discipline } from '@/systems/techniques';
import { MAX_HEALTH } from '@/systems/vitals';

import type { GameContext } from './context';
import { adjust, chip, log } from './ops';
import { bondOf, requirePerson } from './people/cast';
import { warmed } from './people/warmth';
import { trainPerson } from './people/progress';
import { addReport, type Report } from './reports';
import type { GameState } from './state';

/**
 * How a spar ends. Nobody goes to hospital: the fight stops before anyone is really hurt.
 * Win or lose, you grow closer; what the spar teaches is any fight's lesson (`fightGrowth.ts`),
 * written onto the spar's card afterwards. The bout is practice for your partner too.
 */

/** Sparring stops before you drop below this share of your health. */
const SPAR_HEALTH_FLOOR = 0.5;
/** What a bout is worth to your partner: their own specialty, and footwork. */
const PARTNER_LEARNING_GAIN = 0.5;
const PARTNER_FOOTWORK_GAIN = 0.3;
const BOND_FOR: Readonly<Record<SparResult, number>> = { won: 5, lost: 4, yielded: 1 };

type SparResult = Extract<Report, { kind: 'spar' }>['result'];

const RESULT_OF: Readonly<Record<CombatOutcome['result'], SparResult>> = {
  victory: 'won',
  defeat: 'lost',
  escaped: 'yielded',
};

function partnerPractice(result: SparResult, specialty: Discipline | undefined): StatDelta {
  if (result === 'yielded') return {};
  return {
    ...(specialty ? { [specialty]: PARTNER_LEARNING_GAIN } : {}),
    speed: PARTNER_FOOTWORK_GAIN,
  };
}

function sparLine(result: SparResult, name: string): string {
  switch (result) {
    case 'won':
      return `${name} taps out, grinning. "Again tomorrow?"`;
    case 'lost':
      return `${name} pulls the last blow and offers you a hand up.`;
    case 'yielded':
      return `You call it early. ${name} looks a little disappointed.`;
  }
}

export function resolveSpar(state: GameState, outcome: CombatOutcome, ctx: GameContext): GameState {
  const partnerId = state.people.sparringWith;
  if (!partnerId) return state;
  const partner = requirePerson(state, ctx, partnerId);
  const result = RESULT_OF[outcome.result];
  const { vitals } = state.character;
  const floor = Math.round(MAX_HEALTH * SPAR_HEALTH_FLOOR);
  const health = Math.max(outcome.player.health, Math.min(floor, vitals.health));
  // The same bout is practice in their own specialty, and footwork, for them.
  const people = trainPerson(state, ctx, partner, partnerPractice(result, partner.specialty));
  const bond = warmed(state, ctx, BOND_FOR[result]);
  const after = adjust(
    {
      ...state,
      combat: null,
      people: {
        ...people,
        sparringWith: null,
        bonds: {
          ...people.bonds,
          [partner.id]: recordMeeting(bondOf(state, partner.id), {
            day: state.time.day,
            delta: bond,
          }),
        },
      },
    },
    { health: health - vitals.health, chakra: outcome.player.chakra - vitals.chakra },
  );
  const text = sparLine(result, partner.name);
  const logged = log(after, {
    heading: `Spar with ${partner.name}`,
    text,
    tone: result === 'won' ? 'success' : 'info',
    chips: [chip(`+${bond} bond`, 'gain')],
  });
  const reported = addReport(logged, {
    kind: 'spar',
    opponent: partner.name,
    result,
    text,
    gains: [],
    bond,
  });
  return rivalSpar(reported, partner.id, result);
}

/** A spar with your rival goes in the tally, and they'll want a word after (unless you yielded). */
function rivalSpar(state: GameState, partnerId: string, result: SparResult): GameState {
  const rival = state.rival;
  if (rival?.personId !== partnerId || result === 'yielded') return state;
  const won = result === 'won';
  const spars = { you: rival.spars.you + (won ? 1 : 0), them: rival.spars.them + (won ? 0 : 1) };
  return { ...state, rival: { ...rival, spars, beat: { kind: 'after-spar', won } } };
}
