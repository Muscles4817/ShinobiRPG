import type { MissionStage } from '@/systems/missions';

import { ORIGINAL_PACK } from './packs/original';
import { validateContent } from './validate';
import type { ContentPack } from './types';

/** The pack with one mission's encounter stage changed. */
function withStage(change: (stage: MissionStage) => MissionStage): ContentPack {
  return {
    ...ORIGINAL_PACK,
    missions: ORIGINAL_PACK.missions.map((m) =>
      m.id === 'academy-dropout'
        ? { ...m, stages: m.stages.map((s) => (s.kind === 'encounter' ? change(s) : s)) }
        : m,
    ),
  };
}

describe('mission role validation', () => {
  it('detects a team role on a check the team isn’t there for', () => {
    const solo = {
      ...ORIGINAL_PACK,
      missions: ORIGINAL_PACK.missions.map((m) =>
        m.id === 'academy-dropout'
          ? {
              ...m,
              stages: m.stages.map((s) =>
                s.kind === 'check'
                  ? {
                      ...s,
                      approaches: s.approaches.map((a) => ({ ...a, role: 'tracker' as const })),
                    }
                  : s,
              ),
            }
          : m,
      ),
    };
    expect(validateContent(solo)).toContain(
      'mission "academy-dropout" gives a check a team role but always goes alone',
    );
  });
});

describe('encounter validation', () => {
  it('every combat stage that isn’t a plain fight on purpose is an encounter', () => {
    const fights = ORIGINAL_PACK.missions.flatMap((m) => m.stages).map((s) => s.kind);
    expect(fights).toContain('encounter');
    expect(fights).not.toContain('combat');
  });

  it('detects an unknown template and unknown foes', () => {
    const lost = withStage((s) => ({ ...s, template: 'nowhere' }));
    expect(validateContent(lost)).toContain(
      'mission "academy-dropout" uses unknown encounter "nowhere"',
    );
    const ghost = withStage((s) => (s.kind === 'encounter' ? { ...s, enemyIds: ['nobody'] } : s));
    expect(validateContent(ghost)).toContain(
      'mission "academy-dropout" references unknown enemy "nobody"',
    );
  });

  it('detects talk with foes who have no resolve, and stages that leave only head-on', () => {
    const chatty = withStage((s) =>
      s.kind === 'encounter' ? { ...s, template: 'spirit', talkable: true } : s,
    );
    expect(validateContent(chatty)).toContain(
      'mission "academy-dropout" makes "spirit" foes talkable, but they have no resolve',
    );
    const bare = withStage((s) => (s.kind === 'encounter' ? { ...s, approaches: [] } : s));
    expect(validateContent(bare)).toContain(
      'mission "academy-dropout" has an encounter with nothing but head-on and withdraw',
    );
  });

  it('detects templates without head-on or withdraw, or offering talk to the deaf', () => {
    const [first, ...rest] = ORIGINAL_PACK.encounters;
    const broken = {
      ...ORIGINAL_PACK,
      encounters: [
        { ...first!, approaches: ['ambush' as const, 'talk' as const], talkable: false },
        ...rest,
      ],
    };
    const problems = validateContent(broken);
    expect(problems).toContain(`encounter "${first!.id}" must offer head-on and withdraw`);
    expect(problems).toContain(`encounter "${first!.id}" offers talk to foes who won’t listen`);
  });
});
