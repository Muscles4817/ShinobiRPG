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
});
