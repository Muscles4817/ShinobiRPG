import type { ConversationChoice } from '@/content';
import { COOL_LANDING_TO, WARM_LANDING_FROM } from '@/systems/bonds';
import { act, ctx, newGame } from '@/test/gameFixtures';

import { findPerson, tastesOf } from '../people/cast';
import { phrasingFor, registerOf } from '../people/register';
import { conversationValues, fillLine } from '../people/talk';
import type { GameState } from '../state';
import { answerAsItLanded, conversationScene } from './peopleScenes';

/** A reply is answered by how it landed: a tease that annoys reads as annoyance. */
describe('answers by how a reply landed', () => {
  const choice: ConversationChoice = {
    label: '“Hm.”',
    tone: 'tease',
    reply: 'plain',
    warm: 'pleased',
    cool: 'stung',
  };

  it('picks the warm, plain or cool answer by the points the reply earned', () => {
    expect(answerAsItLanded(choice, WARM_LANDING_FROM)).toBe('pleased');
    expect(answerAsItLanded(choice, WARM_LANDING_FROM - 1)).toBe('plain');
    expect(answerAsItLanded(choice, COOL_LANDING_TO)).toBe('stung');
  });

  it('falls back to the plain answer when authored talk has no other', () => {
    const plain: ConversationChoice = { label: '“Hm.”', tone: 'tease', reply: 'plain' };
    expect(answerAsItLanded(plain, WARM_LANDING_FROM)).toBe('plain');
    expect(answerAsItLanded(plain, COOL_LANDING_TO)).toBe('plain');
  });

  it('shows a templated reply’s cool answer when its tone grates on the listener', () => {
    const state = newGame();
    const person = findPerson(state, ctx, state.people.team!.teammateIds[0]!)!;
    const disliked = tastesOf(person, ctx).flatMap((t) => t.dislikes);
    const def = ctx.content.conversations.all.find(
      (c) => c.about === 'role' && c.choices.some((choice) => disliked.includes(choice.tone)),
    )!;
    const index = def.choices.findIndex((c) => disliked.includes(c.tone));
    const conversation = {
      personId: person.id,
      conversationId: def.id,
      topicKey: null,
      answer: null,
    };
    const talking: GameState = { ...state, people: { ...state.people, conversation } };
    const answer = conversationScene(
      act(talking, { type: 'reply', choiceIndex: index }),
      ctx,
    )?.answer;
    const cool = def.choices[index]?.cool ?? '';
    expect(answer?.delta).toBeLessThanOrEqual(COOL_LANDING_TO);
    expect(answer?.reply).toBe(
      fillLine(
        phrasingFor(cool, registerOf(ctx, person), `${person.id}|${def.id}`),
        conversationValues(state, ctx, person, { def, topicKey: null }),
      ),
    );
  });
});
