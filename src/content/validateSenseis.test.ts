import type { PersonDef, SenseiWays } from './types';
import { ORIGINAL_PACK } from './packs/original';
import { validateSenseis } from './validateSenseis';

function withWays(id: string, change: Partial<SenseiWays>): typeof ORIGINAL_PACK {
  const people = ORIGINAL_PACK.people.map((p): PersonDef =>
    p.id === id && p.sensei
      ? { ...p, sensei: { ...p.sensei, ways: { ...p.sensei.ways, ...change } } }
      : p,
  );
  return { ...ORIGINAL_PACK, people };
}

describe('sensei ways validation', () => {
  it('passes the shipped pack', () => {
    expect(validateSenseis(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports numbers out of range and empty lists', () => {
    const pack = withWays('goran', {
      cadence: { sessions: 0, slot: 'morning', punctuality: 'punctual' },
      loosensAtStage: 5,
      formats: [],
      rewards: ['meal', 'meal'],
    });
    expect(validateSenseis(pack)).toEqual(
      expect.arrayContaining([
        'sensei "goran" needs at least one session a week',
        'sensei "goran" loosens at a stage outside 1–4',
        'sensei "goran" needs distinct session formats',
        'sensei "goran" needs distinct rewards',
      ]),
    );
  });

  it('reports ways that don’t hang together', () => {
    const teamwork = withWays('akari', { philosophy: 'teamwork', rituals: [] });
    expect(validateSenseis(teamwork)).toEqual([
      'sensei "akari" teaches teamwork but never drills the team',
      'sensei "akari" teaches teamwork but keeps no team day',
    ]);
    const lax = withWays('goran', {
      cadence: { sessions: 2, slot: 'morning', punctuality: 'late' },
    });
    expect(validateSenseis(lax)).toEqual([
      'sensei "goran" has a tight grip but fewer than 3 sessions a week',
    ]);
    const blind = withWays('yomi', { lens: 'hidden-talent' });
    expect(validateSenseis(blind)).toEqual([
      'sensei "yomi" looks for hidden talent but is too distracted to see it',
    ]);
    const careless = withWays('tetsu', { grip: 'loose' });
    expect(validateSenseis(careless)).toContain(
      'sensei "tetsu" shields you on jobs but lets you be the rest of the week',
    );
  });
});
