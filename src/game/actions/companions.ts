import {
  PLAYER_OWNER,
  STRAY_START_BOND,
  visitStray,
  wonOver,
  type Companions,
} from '@/systems/companions';

import { newCompanion } from '../companions/make';
import { strayToday, type StrayToday } from '../companions/stray';
import { busyReason, firstBlocker, log, spendTime } from '../ops';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/** Winning over a stray: a little time with it each day, until it follows you home. */

const VISIT_SLOTS = 1;

/** The companions once a stray you have won over comes home with you. */
function adopted(state: GameState, stray: StrayToday): Companions {
  const id = `${stray.kind.id}-${state.time.day}`;
  const start = { id, seed: state.board.seed, day: state.time.day, bond: STRAY_START_BOND };
  // One of yours that went back to the streets comes home as itself, fed and forgiven.
  const back = state.companions.strayed;
  const companion =
    back?.kindId === stray.kind.id
      ? { ...back, bond: STRAY_START_BOND, lastFedDay: state.time.day }
      : newCompanion(stray.kind, start);
  return {
    ...state.companions,
    owned: { ...state.companions.owned, [PLAYER_OWNER]: companion },
    befriending: null,
    strayed: null,
  };
}

function visited(state: GameState, stray: StrayToday): GameState {
  const friendship = visitStray(state.companions.befriending, stray.kind.id, state.time.day);
  if (!wonOver(friendship, stray.kind.temperament)) {
    const companions = { ...state.companions, befriending: friendship };
    return log({ ...state, companions }, { text: stray.kind.stray.visit, tone: 'info' });
  }
  const companions = adopted(state, stray);
  const name = companions.owned[PLAYER_OWNER]?.name ?? stray.kind.name;
  return log(
    { ...state, companions },
    {
      heading: `${name} comes home`,
      text: `${stray.kind.stray.follows} You call them ${name}.`,
      tone: 'success',
    },
  );
}

export const befriendStray: ActionHandler<ActionOf<'befriendStray'>> = {
  check(state, _action, ctx) {
    return firstBlocker(
      busyReason(state),
      strayToday(state, ctx) === null && 'There is no stray about today.',
      state.companions.befriending?.lastVisitDay === state.time.day &&
        'It has had enough company for today. Come back tomorrow.',
    );
  },
  perform(state, _action, ctx) {
    const stray = strayToday(state, ctx);
    if (!stray) return state;
    return spendTime(visited(state, stray), VISIT_SLOTS, ctx);
  },
};
