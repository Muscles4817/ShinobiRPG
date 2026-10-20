import { act, ctx, freshGame, newGame } from '@/test/gameFixtures';
import { blockerFor } from '@/game';
import { SCROLL_SESSIONS } from '@/systems/dusts';
import { slotsUntilNextMorning } from '@/systems/time';

import { handedOver } from '../missionRewards';
import { spendTime } from '../ops';
import type { GameState } from '../state';
import { dustCard } from '../views/dustCard';
import { gearShopView } from '../views/shops';
import { yourDust } from './dust';

/** S-rank dust scrolls studied into command of a dust; carried dust made at home or bought. */

const nextMorning = (s: GameState) => spendTime(s, slotsUntilNextMorning(s.time), ctx);

function controlled(state: GameState, chakraControl = 40): GameState {
  const stats = { ...state.character.stats, chakraControl };
  return { ...state, character: { ...state.character, stats } };
}

function ironUser(count = 0): GameState {
  return { ...newGame(), dust: { dustId: 'iron-sand', count }, wallet: { ryo: 1000 } };
}

describe('dust scrolls', () => {
  it('a job hands over its scroll, never to someone who commands dust', () => {
    const job = ctx.content.missions.require('ford-black-sand');
    expect(handedOver(freshGame(), ctx, job).dustScrolls).toEqual([
      { dustId: 'iron-sand', sessions: 0 },
    ]);
    expect(handedOver(ironUser(), ctx, job).dustScrolls).toEqual([]);
  });

  it('asks the chakra control to follow, and a day at a time', () => {
    const study = { type: 'studyDustScroll', dustId: 'glass-sand' } as const;
    const holder = { ...newGame(), dustScrolls: [{ dustId: 'glass-sand', sessions: 0 }] };
    expect(blockerFor(controlled(holder, 2), study, ctx)).toMatch(/chakra control/);
    const once = act(controlled(holder), study);
    expect(blockerFor(once, study, ctx)).toMatch(/today/);
  });

  it('mastered, it gives command of its dust, a first batch and its techniques', () => {
    const study = { type: 'studyDustScroll', dustId: 'glass-sand' } as const;
    let state: GameState = controlled({
      ...newGame(),
      dustScrolls: [{ dustId: 'glass-sand', sessions: 0 }],
    });
    for (let i = 0; i < SCROLL_SESSIONS; i += 1) state = nextMorning(act(state, study));
    const yours = yourDust(state, ctx);
    expect(yours?.def.id).toBe('glass-sand');
    expect(yours!.store.count).toBeGreaterThan(0);
    expect(state.techniques.known).toContain('dust-glass-shards');
  });
});

describe('making and buying carried dust', () => {
  it('makes a batch of iron sand at home for materials and an afternoon', () => {
    const made = act(ironUser(), { type: 'makeDust' });
    expect(made.dust!.count).toBeGreaterThan(0);
    expect(made.wallet.ryo).toBeLessThan(1000);
    expect(dustCard(made, ctx)?.make).not.toBeNull();
  });

  it('never makes dust the ground gives back', () => {
    const ash = { ...newGame(), dust: { dustId: 'ash', count: 0 } };
    expect(blockerFor(ash, { type: 'makeDust' }, ctx)).toMatch(/gathers itself/);
    expect(dustCard(ash, ctx)?.make).toBeNull();
  });

  it('buys a batch at the smith that sells it', () => {
    const morning = { ...ironUser(), time: { ...newGame().time, slot: 0 } };
    const shop = gearShopView(morning, ctx, 'kurogane-forge');
    expect(shop?.dust?.cost).toBe(180);
    const bought = act(morning, { type: 'buyDust', placeId: 'kurogane-forge' });
    expect(bought.dust!.count).toBeGreaterThan(0);
    expect(bought.wallet.ryo).toBe(820);
  });
});
