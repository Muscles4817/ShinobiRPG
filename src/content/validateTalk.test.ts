import { ORIGINAL_PACK } from './packs/original';
import { validateTalk } from './validateTalk';

describe('templated talk validation', () => {
  it('reports topics for nothing, missing or unknown words, and slots without words', () => {
    const problems = validateTalk({
      ...ORIGINAL_PACK,
      conversationTopics: [
        { kind: 'clan', key: 'nobody', values: {} },
        {
          kind: 'role',
          key: 'villager',
          values: { work: 'w', weight: 'w', memory: 'm', mood: 'x' },
        },
      ],
      conversations: [
        {
          id: 'chat',
          minStage: 1,
          about: 'role',
          opener: '{them} talks of {work} and {art}.',
          choices: [],
        },
      ],
    });
    expect(problems).toEqual(
      expect.arrayContaining([
        'clan topic "nobody" names no clan in the pack',
        'clan topic "nobody" is missing "duty"',
        'role topic "villager" is missing "hope"',
        'role topic "villager" has unknown slot "mood"',
        'conversation "chat" uses slot "{art}" it has no words for',
      ]),
    );
    expect(problems).not.toContain('conversation "chat" uses slot "{work}" it has no words for');
  });

  it('asks every choice of a template for a warm and a cool answer, and authored talk for none', () => {
    const plain = { label: 'Hm.', tone: 'quiet' as const, reply: 'Hm.' };
    const problems = validateTalk({
      ...ORIGINAL_PACK,
      conversations: [
        {
          id: 'chat',
          minStage: 1,
          about: 'role',
          opener: 'Hi.',
          choices: [{ ...plain, warm: 'Ha.' }],
        },
        { id: 'own', minStage: 1, opener: 'Hi.', choices: [plain] },
      ],
    });
    expect(problems).toEqual(['conversation "chat" choice 1 has no cool answer']);
  });

  it('lets talk and topics speak of the person by pronoun, and no other way', () => {
    const problems = validateTalk({
      ...ORIGINAL_PACK,
      conversationTopics: [
        {
          kind: 'role',
          key: 'villager',
          values: { work: '{them.their} rounds', weight: '{wish}', memory: 'm', hope: 'h' },
        },
      ],
      conversations: [
        {
          id: 'chat',
          minStage: 1,
          about: 'role',
          opener: '{them.they} say{them.s} {them.their} {work} is {them.bogus}.',
          choices: [],
        },
      ],
    });
    expect(problems).toEqual([
      'role topic "villager" uses slot "{wish}" it has no words for',
      'conversation "chat" uses slot "{them.bogus}" it has no words for',
    ]);
  });
});
