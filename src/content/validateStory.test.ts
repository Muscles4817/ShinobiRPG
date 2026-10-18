import type { MissionDef } from '@/systems/missions';
import { STORY_JOB, storyPack } from '@/test/storyFixtures';

import { validateContent } from './validate';
import type { ContentPack } from './types';

function withJob(job: MissionDef): ContentPack {
  return { ...storyPack, missions: storyPack.missions.map((m) => (m.id === job.id ? job : m)) };
}

describe('story validation', () => {
  it('reports marks nothing sets, threads a job doesn’t keep and unknown tones', () => {
    const job: MissionDef = {
      ...STORY_JOB,
      stages: [
        { kind: 'narrative', when: { has: 'ghost-mark' }, text: 'Boo.' },
        {
          kind: 'decision',
          text: 'Well?',
          options: [
            {
              label: 'Shrug',
              tone: 'sulk',
              reply: 'You shrug.',
              effects: [{ kind: 'thread', thread: 'luck', by: 1 }],
            },
          ],
        },
        ...STORY_JOB.stages.slice(-1),
      ],
    };
    const problems = validateContent(withJob(job));
    expect(problems).toContain(`mission "${job.id}" reads mark "ghost-mark" that nothing sets`);
    expect(problems).toContain(`mission "${job.id}" names thread "luck" it doesn’t keep`);
    expect(problems).toContain(`mission "${job.id}" uses unknown tone "sulk"`);
  });

  it('wants an ending last, with one for every case, and roads where something can happen', () => {
    const job: MissionDef = {
      ...STORY_JOB,
      stages: [
        { kind: 'ending', endings: [{ when: { has: 'knows-why' }, text: 'Only sometimes.' }] },
        { kind: 'narrative', text: 'And then?' },
        { kind: 'leg', text: 'Nowhere.', days: 1, region: 'the-void' },
      ],
    };
    const problems = validateContent(withJob(job));
    expect(problems).toContain(
      `mission "${job.id}" has an ending with more than the road home after it`,
    );
    expect(problems).toContain(`mission "${job.id}" has no ending for every case`);
    expect(problems).toContain(
      `mission "${job.id}" goes by "the-void", where nothing ever happens`,
    );
  });

  it('wants every trait to have something to say', () => {
    const pack = {
      ...storyPack,
      voices: storyPack.voices.filter((v) => v.trait !== 'calm' || v.moment !== 'camp'),
    };
    expect(validateContent(pack)).toContain('trait "calm" has nothing to say at "camp"');
  });

  it('wants whoever recommends a genin at an arc’s end to be someone the pack has', () => {
    const [arc, ...rest] = storyPack.arcs;
    if (!arc) throw new Error('The story pack has no arc.');
    const pack = {
      ...storyPack,
      arcs: [{ ...arc, recommends: { personId: 'nobody', words: 'Kneel.' } }, ...rest],
    };
    expect(validateContent(pack)).toContain(
      `arc "${arc.id}" is recommended by unknown person "nobody"`,
    );
  });
});
