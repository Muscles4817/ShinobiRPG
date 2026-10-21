import { ctx, draft, newGame, withHound } from '@/test/gameFixtures';
import { BOND_STAGES } from '@/systems/bonds';
import { fightingPower } from '@/systems/stats';

import { signContract } from '../contracts/summons';
import { createNewGame } from '../creation';
import { yourHive } from '../hives/hive';
import { personReadinessLine, readinessLine } from './kitReadiness';

describe('what readiness reads besides your stats', () => {
  it('reads nothing you don’t bring', () => {
    const line = readinessLine(newGame(), ctx);
    expect(line).toMatchObject({ companion: 0, hive: 0, summons: 0 });
  });

  it('reads a grown companion’s fighting level, and nothing for a pup too young to fight', () => {
    const grown = withHound(newGame());
    const hound = grown.companions.owned.player!;
    expect(readinessLine(grown, ctx).companion).toBeCloseTo(fightingPower(hound.stats));
    const pup = withHound(newGame(), { grownDays: 0 });
    expect(readinessLine(pup, ctx).companion).toBe(0);
  });

  it('reads a hive by its strain and how full it is', () => {
    const born = createNewGame({ draft: draft({ clanId: 'toga' }), seed: 1234 }, ctx);
    const full = readinessLine(born, ctx).hive ?? 0;
    expect(full).toBeGreaterThan(0);
    const yours = yourHive(born, ctx)!;
    const halved = { ...born, hive: { ...yours.hive, count: Math.floor(yours.cap / 2) } };
    expect(readinessLine(halved, ctx).hive).toBeLessThan(full);
  });

  it('reads the strongest summons that answers at your standing', () => {
    const signed = signContract(newGame(), ctx, 'kiln-salamanders');
    const first = readinessLine(signed, ctx).summons ?? 0;
    expect(first).toBeGreaterThan(0);
    const trusted = { ...signed, contract: { ...signed.contract!, standing: BOND_STAGES[2].min } };
    expect(readinessLine(trusted, ctx).summons).toBeGreaterThan(first);
  });

  it('reads the hive a person’s clan gives them', () => {
    const state = newGame();
    const hived = ctx.content.people.all.find((p) => p.clanId === 'toga')!;
    const plain = ctx.content.people.all.find((p) => p.role === 'genin' && p.clanId !== 'toga')!;
    expect(personReadinessLine(hived, state, ctx).hive).toBeGreaterThan(0);
    expect(personReadinessLine(plain, state, ctx).hive).toBeUndefined();
  });
});
