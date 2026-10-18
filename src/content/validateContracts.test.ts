import { ORIGINAL_PACK } from './packs/original';
import { validateContracts } from './validateContracts';

describe('contract validation', () => {
  it('passes the shipped pack', () => {
    expect(validateContracts(ORIGINAL_PACK)).toEqual([]);
  });

  it('reports a summon its technique doesn’t call, and a contract no one offers', () => {
    const [contract] = ORIGINAL_PACK.contracts;
    const [first, ...rest] = contract!.summons;
    const miscalled = { ...first!, techniqueId: 'summon-kiln-mother' };
    const contracts = [{ ...contract!, summons: [miscalled, ...rest] }];
    const missions = ORIGINAL_PACK.missions.map((m) => {
      const { contractId: _c, ...reward } = m.reward;
      return { ...m, reward };
    });
    const problems = validateContracts({ ...ORIGINAL_PACK, contracts, missions });
    expect(problems).toContain(
      'summon "kiln-newt" of contract "kiln-salamanders" isn\'t called by its technique "summon-kiln-mother"',
    );
    expect(problems).toContain('contract "kiln-salamanders" can\'t be signed anywhere');
  });

  it('reports a foe calling a summon no contract holds', () => {
    const enemies = ORIGINAL_PACK.enemies.map((e) =>
      e.id === 'bandit-chief'
        ? { ...e, summons: [{ summonId: 'ghost-rat', tell: 'kept' as const }] }
        : e,
    );
    expect(validateContracts({ ...ORIGINAL_PACK, enemies })).toContain(
      'enemy "bandit-chief" calls "ghost-rat", which no contract holds',
    );
  });

  it('asks a contract you can sign for tastes and parting words; a foe’s own needs neither', () => {
    const contracts = ORIGINAL_PACK.contracts.map((c) => {
      const { tastes: _t, parting: _p, ...bare } = c;
      return bare;
    });
    const problems = validateContracts({ ...ORIGINAL_PACK, contracts });
    expect(problems).toEqual([
      'contract "kiln-salamanders" has no tastes for offerings',
      'contract "kiln-salamanders" has no parting words',
    ]);
  });
});
