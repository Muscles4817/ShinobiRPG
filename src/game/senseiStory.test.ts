import { bondWith } from '@/systems/bonds';
import { act, ctx, newGame, veteran } from '@/test/gameFixtures';

import { availability, crewFor } from './board';
import type { GameState } from './state';
import { personSheet } from './views/personSheet';

/** A sensei's story, told over the stages of a bond, and the arc it opens. */

const UP_THE_PASS = 'arc-blade-up-the-pass';

function under(senseiId: string, state: GameState): GameState {
  const team = { ...state.people.team!, senseiId };
  return { ...state, people: { ...state.people, team } };
}

function hearing(state: GameState, personId: string, conversationId: string): GameState {
  const conversation = { personId, conversationId, topicKey: null, answer: null };
  return { ...state, people: { ...state.people, conversation } };
}

describe('a sensei’s story', () => {
  it('tells what they carry once you have heard it', () => {
    const state = newGame();
    expect(personSheet(state, ctx, 'goran')?.carries).toBeNull();
    const told = act(
      act(hearing(state, 'goran', 'goran-daichi'), { type: 'reply', choiceIndex: 0 }),
      {
        type: 'endConversation',
      },
    );
    expect(personSheet(told, ctx, 'goran')?.carries).toMatch(/a step too slow/);
  });

  it('its last beat opens their arc, which they lead', () => {
    const start = under('goran', veteran(newGame(), 5));
    const def = ctx.content.missions.require(UP_THE_PASS);
    expect(availability(start, ctx, def).kind).toBe('absent');
    const close = {
      ...start,
      people: { ...start.people, bonds: { ...start.people.bonds, goran: bondWith(120) } },
    };
    const asked = act(hearing(close, 'goran', 'goran-kurobane'), { type: 'reply', choiceIndex: 0 });
    expect(asked.village.marks).toContain('goran-old-debt');
    const after = act(asked, { type: 'endConversation' });
    expect(availability(after, ctx, def).kind).toBe('arc');
    expect(crewFor(after, ctx, def)).toMatchObject({ kind: 'old-team', leaderId: 'goran' });
  });
});
