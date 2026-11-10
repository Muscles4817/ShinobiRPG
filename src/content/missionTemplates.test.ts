import { ORIGINAL_PACK } from './packs/original';
import { MISSION_FILLS, MISSION_TEMPLATES } from './packs/original/jobs';
import { isFightStage } from '@/systems/missions';

import { missionFromFill, placeholdersIn, type MissionTemplate } from './missionTemplates';

const TEMPLATE: MissionTemplate = {
  id: 'lost-thing',
  rank: 'D',
  slots: 2,
  energyCost: 15,
  reward: { ryo: 80, reputation: 2 },
  minMissionsCompleted: 0,
  placeholders: { thing: 'what was lost', foe: 'an enemy id' },
  title: 'The Lost {thing}',
  client: 'Someone',
  summary: 'Find the {thing}.',
  stages: [
    {
      kind: 'encounter',
      template: 'beast',
      job: 'retrieve',
      text: 'The {thing} is in its den.',
      enemyIds: ['{foe}'],
      canFlee: true,
      flavour: { slipped: 'You leave with the {thing}.' },
    },
  ],
};

describe('mission templates', () => {
  it('fills every string, enemy ids and flavour included', () => {
    const mission = missionFromFill(TEMPLATE, {
      id: 'lost-kite',
      templateId: 'lost-thing',
      values: { thing: 'Kite', foe: 'feral-tanuki' },
    });
    expect(mission.title).toBe('The Lost Kite');
    expect(placeholdersIn(JSON.stringify(mission))).toEqual([]);
    expect(mission.stages[0]).toMatchObject({
      enemyIds: ['feral-tanuki'],
      flavour: { slipped: 'You leave with the Kite.' },
    });
  });

  it('leaves a missing value in place for validation to report', () => {
    const mission = missionFromFill(TEMPLATE, { id: 'x', templateId: 'lost-thing', values: {} });
    expect(placeholdersIn(mission.summary)).toEqual(['thing']);
  });

  it('lets a fill override the record and the pay', () => {
    const mission = missionFromFill(TEMPLATE, {
      id: 'x',
      templateId: 'lost-thing',
      values: {},
      minMissionsCompleted: 6,
      reward: { ryo: 120, reputation: 3 },
    });
    expect(mission.minMissionsCompleted).toBe(6);
    expect(mission.reward.ryo).toBe(120);
  });

  it('sets a fill’s ground on the fights its template leaves on open ground', () => {
    const fill = { id: 'x', templateId: 'lost-thing', values: {}, ground: 'forest' } as const;
    expect(missionFromFill(TEMPLATE, fill).stages[0]).toMatchObject({ ground: 'forest' });
    const indoors: MissionTemplate = {
      ...TEMPLATE,
      stages: TEMPLATE.stages.map((s) => ({ ...s, ground: 'room' as const })),
    };
    expect(missionFromFill(indoors, fill).stages[0]).toMatchObject({ ground: 'room' });
  });
});

describe('the original pack’s templates and fills', () => {
  const templates = new Map(MISSION_TEMPLATES.map((t) => [t.id, t]));

  it('gives the board over a hundred distinct jobs', () => {
    const jobs = ORIGINAL_PACK.missions.filter((m) => m.examOnly !== true);
    expect(jobs.length).toBeGreaterThan(100);
    expect(new Set(jobs.map((m) => m.title)).size).toBe(jobs.length);
  });

  it.each(MISSION_TEMPLATES.map((t) => [t.id, t] as const))(
    'template "%s" uses exactly the placeholders it declares',
    (_id, template) => {
      const used = [...new Set(placeholdersIn(JSON.stringify(template)))].sort();
      expect(used).toEqual(Object.keys(template.placeholders).sort());
    },
  );

  it.each(MISSION_FILLS.map((f) => [f.id, f] as const))(
    'fill "%s" gives exactly the values its template asks for',
    (_id, fill) => {
      const template = templates.get(fill.templateId);
      expect(template).toBeDefined();
      const asked = Object.keys(template?.placeholders ?? {}).sort();
      expect(Object.keys(fill.values).sort()).toEqual(asked);
      if (!fill.ground || !template) return;
      const fights = missionFromFill(template, fill).stages.filter(isFightStage);
      expect(fights.some((s) => s.ground === fill.ground)).toBe(true);
    },
  );
});
