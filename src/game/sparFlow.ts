import type { CombatOutcome } from '@/systems/combat';
import { recordMeeting } from '@/systems/bonds';
import type { StatDelta } from '@/systems/stats';
import { MAX_HEALTH } from '@/systems/vitals';

import type { GameContext } from './context';
import { adjust, chip, log } from './ops';
import { bondOf, requirePerson } from './people/cast';
import { trainPerson } from './people/progress';
import { addReport, type Report } from './reports';
import type { GameState } from './state';

/**
 * How a spar ends. Nobody goes to hospital: the fight stops before anyone is really hurt.
 * Win or lose, you grow closer; what the spar teaches you is any fight's lesson
 * (`fightGrowth.ts`), written onto the spar's card afterwards. Your partner practises their
 * specialty and footwork in the same bout.
 */

/** Sparring stops before you drop below this share of your health. */
const SPAR_HEALTH_FLOOR = 0.5;
const BOND_FOR: Readonly<Record<SparResult, number>> = { won: 5, lost: 4, yielded: 1 };
/** What the bout is worth to your partner, before their own growth formula. */
const PARTNER_LEARNING_GAIN = 0.5;
const PARTNER_FOOTWORK_GAIN = 0.3;

type SparResult = Extract<Report, { kind: 'spar' }>['result'];

const RESULT_OF: Readonly<Record<CombatOutcome['result'], SparResult>> = {
  victory: 'won',
  defeat: 'lost',
  escaped: 'yielded',
};

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
  const partnerGains: StatDelta =
    result === 'yielded'
      ? {}
      : {
          ...(partner.specialty ? { [partner.specialty]: PARTNER_LEARNING_GAIN } : {}),
          speed: PARTNER_FOOTWORK_GAIN,
        };
  const people = trainPerson(state, ctx, partner, partnerGains);
  const bond = BOND_FOR[result];
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
  return addReport(logged, { kind: 'spar', opponent: partner.name, result, text, gains: [], bond });
}
