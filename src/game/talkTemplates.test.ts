import { createRng } from '@/core';
import { ORIGINAL_PACK } from '@/content/packs/original';
import type { ConversationDef, ConversationTopic } from '@/content';
import { bondWith } from '@/systems/bonds';
import { newGame } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { findPerson } from './people/cast';
import { conversationValues, fillLine, pickConversation } from './people/talk';
import type { GameState } from './state';

const SMALL_TALK: ConversationDef = {
  id: 'small-talk',
  minStage: 0,
  opener: '{them} nods.',
  choices: [
    { label: 'Nod back.', tone: 'quiet', reply: 'Fine.' },
    { label: 'Wave.', tone: 'kind', reply: 'Fine.' },
  ],
};

const ART_TALK: ConversationDef = {
  id: 'art-talk',
  minStage: 2,
  about: 'specialty',
  opener: '{them} shows you {practice}. “I want to master {dream}.”',
  choices: [
    { label: '“Teach me {art}?”', tone: 'curious', reply: '“{advice}”' },
    { label: 'Watch quietly.', tone: 'quiet', reply: '{pride}' },
  ],
};

function topic(key: string): ConversationTopic {
  const values = {
    art: key,
    practice: `${key} drills`,
    pride: 'They once did it.',
    doubt: 'They worry.',
    dream: `the great ${key}`,
    advice: 'Keep at it.',
    keepsake: 'a worn glove',
  };
  return { kind: 'specialty', key, values };
}

const ARTS = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];
const ctx = createGameContext({
  ...ORIGINAL_PACK,
  conversations: [SMALL_TALK, ART_TALK],
  conversationTopics: ARTS.map(topic),
});

function withBond(state: GameState, personId: string, points: number): GameState {
  const bonds = { ...state.people.bonds, [personId]: bondWith(points) };
  return { ...state, people: { ...state.people, bonds } };
}

describe('templated conversations', () => {
  const state = newGame({}, ctx);
  const classmate = findPerson(state, ctx, 'genin-1')!;

  it('wait for their bond stage, then come before old small talk', () => {
    const acquainted = withBond(state, classmate.id, 10);
    expect(pickConversation(acquainted, ctx, classmate, createRng(1)).def.id).toBe('small-talk');
    const friends = withBond(state, classmate.id, 30);
    expect(pickConversation(friends, ctx, classmate, createRng(1)).def.id).toBe('art-talk');
  });

  it('are filled from the person’s own specialty', () => {
    const values = conversationValues(state, ctx, classmate, { def: ART_TALK, topicKey: null });
    const art = classmate.specialty!;
    expect(fillLine(ART_TALK.opener, values)).toBe(
      `${classmate.name} shows you ${art} drills. “I want to master the great ${art}.”`,
    );
  });

  it('are never said by someone with no topic for them', () => {
    const { specialty: _, ...noSpecialty } = classmate;
    const friends = withBond(state, classmate.id, 30);
    for (let seed = 1; seed < 20; seed++) {
      expect(pickConversation(friends, ctx, noSpecialty, createRng(seed)).def.id).toBe(
        'small-talk',
      );
    }
  });
});
