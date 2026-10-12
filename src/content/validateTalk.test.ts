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
});
