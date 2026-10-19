import { act, ctx, freshGame, newGame } from '@/test/gameFixtures';
import { blockerFor } from '@/game';
import { bondWith } from '@/systems/bonds';
import { maxChakra } from '@/systems/vitals';

import { laidUp } from '../injuries';
import { handedOver } from '../missionRewards';
import type { GameState } from '../state';
import { chakraBody, yourHive } from './hive';

/** The install later in life: learning a hive clan's rite, then taking the hive at home. */

const AFTERNOON = 1;

function closeTo(state: GameState, personId: string): GameState {
  const bonds = { ...state.people.bonds, [personId]: bondWith(1000) };
  return { ...state, people: { ...state.people, bonds } };
}

function knowing(state: GameState): GameState {
  return { ...state, rites: ['toga'] };
}

describe('the hive rite', () => {
  it('is taught by a Tōga in the port, once you are close to her', () => {
    const learn = { type: 'learnRite', personId: 'tomoshi' } as const;
    const there: GameState = {
      ...newGame(),
      locationId: 'port-shiomachi',
      time: { day: 3, slot: AFTERNOON },
    };
    expect(blockerFor(there, learn, ctx)).toMatch(/Tomoshi/);
    const taught = act(closeTo(there, 'tomoshi'), learn);
    expect(taught.rites).toEqual(['toga']);
    expect(blockerFor(taught, learn, ctx)).toMatch(/already/);
  });

  it('is lent by the clan archive only to a jōnin the head trusts', () => {
    const read = { type: 'readRite', placeId: 'toga-compound' } as const;
    const day = { ...newGame(), time: { day: 3, slot: AFTERNOON } };
    expect(blockerFor(day, read, ctx)).toMatch(/jōnin/);
    const jonin = { ...day, standing: { ...day.standing, rank: 'jonin' as const } };
    expect(blockerFor(jonin, read, ctx)).toMatch(/Mayu/);
    const trusted = act(closeTo(jonin, 'mayu'), read);
    expect(trusted.rites).toEqual(['toga']);
  });

  it('is handed over by a job that finds it, and not to someone with a hive', () => {
    const job = ctx.content.missions.require('harbour-lamp-wreck');
    const plain = handedOver(freshGame(), ctx, job);
    expect(plain.rites).toEqual(['toga']);
    expect(plain.report.rite).toBe('The Lamp Vigil');
    const hosted = freshGame();
    const withHive = {
      ...hosted,
      hive: { strainId: 'lantern-moth', share: 'half' as const, count: 1 },
    };
    expect(handedOver(withHive, ctx, job).rites).toEqual([]);
  });

  it('puts the clan strain in at home at the share you choose, and lays you up', () => {
    const take = { type: 'takeHive', clanId: 'toga', share: 'most' } as const;
    const start = newGame();
    expect(blockerFor(start, take, ctx)).toMatch(/know/);
    const before = maxChakra(chakraBody(start));
    const taken = act(knowing(start), take);
    const yours = yourHive(taken, ctx);
    expect(yours?.strain.id).toBe('lantern-moth');
    expect(yours!.hive.count).toBeLessThan(yours!.cap);
    expect(maxChakra(chakraBody(taken))).toBeLessThan(before);
    expect(taken.character.vitals.chakra).toBeLessThanOrEqual(maxChakra(chakraBody(taken)));
    expect(laidUp(taken, ctx)).not.toBeNull();
    expect(blockerFor(taken, take, ctx)).toMatch(/already/);
  });

  it('is done only at home', () => {
    const away = knowing({ ...newGame(), locationId: 'port-shiomachi' });
    expect(blockerFor(away, { type: 'takeHive', clanId: 'toga', share: 'half' }, ctx)).toMatch(
      /home/,
    );
  });
});
