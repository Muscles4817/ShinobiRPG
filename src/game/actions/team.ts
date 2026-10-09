import { bondWith } from '@/systems/bonds';

import { chip, log } from '../ops';
import { fullName, requirePerson } from '../people/cast';
import { generateGenin } from '../people/generator';
import { offerSenseis } from '../people/senseis';
import { addReport } from '../reports';
import type { ActionHandler, ActionOf } from './types';

/** Classmates generated at team assignment: your two teammates and some faces around town. */
const CLASSMATES = 6;
const TEAMMATES = 2;
/** You already know your teammates and new sensei a little. */
const TEAMMATE_BOND = 10;
const SENSEI_BOND = 10;

export const assignTeam: ActionHandler<ActionOf<'assignTeam'>> = {
  check(state) {
    return state.people.team ? 'Teams have already been assigned.' : null;
  },
  perform(state, _action, ctx, rng) {
    const classmates = generateGenin(ctx, rng, {
      count: CLASSMATES,
      takenNames: [state.character.name, ...ctx.content.people.all.map((p) => p.name)],
      firstNumber: state.people.generated.length + 1,
    });
    const teammateIds = classmates.slice(0, TEAMMATES).map((p) => p.id);
    const next = {
      ...state,
      people: {
        ...state.people,
        generated: [...state.people.generated, ...classmates],
        bonds: {
          ...state.people.bonds,
          ...Object.fromEntries(teammateIds.map((id) => [id, bondWith(TEAMMATE_BOND)])),
        },
        team: {
          teammateIds,
          senseiOptions: offerSenseis(state.character, ctx.content.people.all),
          senseiId: null,
          lastLessonDay: null,
        },
      },
    };
    return log(next, { heading: 'Team assignment', text: ctx.content.team.intro, tone: 'info' });
  },
};

export const chooseSensei: ActionHandler<ActionOf<'chooseSensei'>> = {
  check(state, action) {
    const team = state.people.team;
    if (!team) return 'Teams have not been read out yet.';
    if (team.senseiId) return 'You already have a sensei.';
    return team.senseiOptions.includes(action.senseiId) ? null : 'That jōnin did not ask for you.';
  },
  perform(state, action, ctx) {
    const team = state.people.team;
    if (!team) return state;
    const sensei = requirePerson(state, ctx, action.senseiId);
    const teammates = team.teammateIds.map((id) => fullName(requirePerson(state, ctx, id)));
    const next = {
      ...state,
      people: {
        ...state.people,
        team: { ...team, senseiId: sensei.id },
        bonds: { ...state.people.bonds, [sensei.id]: bondWith(SENSEI_BOND) },
      },
    };
    const logged = log(next, {
      heading: 'Team formed',
      text: ctx.content.team.formed,
      tone: 'success',
      chips: [chip(`Sensei: ${fullName(sensei)}`, 'info')],
    });
    return addReport(logged, {
      kind: 'team-formed',
      sensei: fullName(sensei),
      senseiTitle: sensei.title,
      teammates,
      text: ctx.content.team.formed,
    });
  },
};
