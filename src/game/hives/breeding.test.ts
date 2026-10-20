import { act, ctx, draft, formTeam } from '@/test/gameFixtures';
import { blockerFor, createNewGame } from '@/game';
import { slotsUntilNextMorning } from '@/systems/time';

import { spendTime } from '../ops';
import type { GameState } from '../state';
import { yourHive } from './hive';

/** Finding wild insects, studying them in a jar, crossing them in, and naming what hatches. */

function mothKeeper(): GameState {
  const fresh = createNewGame({ draft: draft({ clanId: 'toga' }), seed: 1234 }, ctx);
  const ready = formTeam(fresh);
  const stats = { ...ready.character.stats, perception: 40 };
  return { ...ready, character: { ...ready.character, stats } };
}

const nextMorning = (s: GameState) => spendTime(s, slotsUntilNextMorning(s.time), ctx);

describe('crossbreeding a hive', () => {
  it('finds wild insects in a wood, once a day, and only for someone with a hive', () => {
    const seek = { type: 'seekInsects', placeId: 'lantern-woods' } as const;
    const plain = formTeam(createNewGame({ draft: draft(), seed: 1234 }, ctx));
    expect(blockerFor(plain, seek, ctx)).toMatch(/hive/);
    const found = act(mothKeeper(), seek);
    expect(found.hive?.jars?.length).toBe(1);
    expect(blockerFor(found, seek, ctx)).toMatch(/today/);
  });

  it('studies a jar until understood, crosses it in, and the brood hatches days later', () => {
    let state = act(mothKeeper(), { type: 'seekInsects', placeId: 'lantern-woods' });
    const strainId = state.hive!.jars![0]!.strainId;
    const cross = { type: 'crossJar', strainId } as const;
    state = nextMorning(state);
    expect(blockerFor(state, cross, ctx)).toMatch(/understand/);
    state = act(state, { type: 'studyJar', strainId });
    state = act(nextMorning(state), { type: 'studyJar', strainId });
    const before = state.hive!.count;
    state = act(state, cross);
    expect(state.hive!.count).toBeLessThan(before);
    expect(state.hive!.breeding).toBeDefined();
    for (let i = 0; i < 4; i += 1) state = nextMorning(state);
    expect(state.hive!.breeding).toBeUndefined();
    expect(yourHive(state, ctx)).not.toBeNull();
  });

  it('lets you name a strain you bred, and only one you bred', () => {
    const named = { type: 'nameStrain', name: 'Dusk Wings' } as const;
    const state = mothKeeper();
    expect(blockerFor(state, named, ctx)).toMatch(/bred/);
    const strain = yourHive(state, ctx)!.strain;
    const bred = { ...strain, id: 'bred-1', depth: 1 };
    const breeder = { ...state, hive: { ...state.hive!, strainId: 'bred-1', bred: [bred] } };
    expect(yourHive(act(breeder, named), ctx)!.strain.name).toBe('Dusk Wings');
  });
});
