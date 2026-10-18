import { findPerson } from '@/game/people/cast';
import { conversationScene } from '@/game/views/peopleScenes';
import { act, ctx, newGame } from '@/test/gameFixtures';

import { deserialize } from './save';

describe('the rotating talk migration', () => {
  it('lets a templated conversation begun before it finish, about the first facet', () => {
    const state = newGame();
    const personId = state.people.team!.teammateIds[0]!;
    const conversation = { personId, conversationId: 'talk-trait-1-habit', answer: null };
    const older = { ...state, people: { ...state.people, conversation } };
    const loaded = deserialize(JSON.stringify({ version: 56, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.people.conversation?.topicKey).toBeNull();
    expect(conversationScene(loaded.value, ctx)?.opener).not.toMatch(/\{/);
    const replied = act(loaded.value, { type: 'reply', choiceIndex: 0 });
    const firstTrait = findPerson(replied, ctx, personId)?.traitIds[0] ?? '';
    expect(replied.people.bonds[personId]?.heard).toContain(`talk-trait-1-habit@${firstTrait}`);
  });
});
