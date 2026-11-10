import { act, ctx, fightOut, intoFight, lastEntry, newGame, veteran } from '@/test/gameFixtures';
import { blockerFor } from '@/game';
import type { CombatOutcome } from '@/systems/combat';
import { MEND_BASE, NO_WORKSHOP, withPuppet } from '@/systems/puppets';

import { playerCombatant } from '../combatants';
import type { GameState } from '../state';
import { afterPuppetFight, notePuppetsLearned } from './keeping';
import { mendingCost } from './mending';
import { withYourPuppets, yourPuppets } from './yours';

/** Your puppets: given with their art, carried into fights, hurt there and mended at home. */

const DOLL = 'lantern-doll';
const UNSEAL = 'unseal-lantern-doll';

function knowing(state: GameState, ids: readonly string[]): GameState {
  const known = [...state.techniques.known, ...ids];
  return { ...state, techniques: { ...state.techniques, known } };
}

function puppeteer(condition = 1): GameState {
  const owned = withPuppet(NO_WORKSHOP, DOLL, 'Lantern Doll');
  const puppets = owned.puppets.map((p) => ({ ...p, condition }));
  return { ...knowing(newGame(), [UNSEAL]), puppetry: { ...owned, puppets } };
}

const outcome = (share: number): CombatOutcome => ({
  result: 'victory',
  rounds: 1,
  player: { health: 100, chakra: 50 },
  summonHealth: { [DOLL]: share },
});

describe('coming by a puppet', () => {
  it('comes with its art, once: learning its unsealing gives you the puppet', () => {
    const before = newGame();
    const learned = notePuppetsLearned(before, knowing(before, [UNSEAL]), ctx);
    expect(learned.puppetry.puppets).toEqual([
      { frameId: DOLL, name: 'Lantern Doll', condition: 1 },
    ]);
    const again = notePuppetsLearned(learned, learned, ctx);
    expect(again.puppetry.puppets).toHaveLength(1);
  });
});

describe('your puppets in a fight', () => {
  it('ride in as calls, as whole as they are, with their unsealing', () => {
    const player = withYourPuppets(playerCombatant(puppeteer(0.5), ctx), puppeteer(0.5), ctx);
    const call = player.calls?.find((c) => c.id === DOLL);
    expect(call?.puppet).toBe(true);
    expect(call?.body.health).toBe(Math.round((call?.body.maxHealth ?? 0) * 0.5));
    expect(player.techniques.map((t) => t.id)).toContain(UNSEAL);
  });

  it('leave a broken puppet at home, and its unsealing with it', () => {
    const broken = puppeteer(0);
    const player = withYourPuppets(playerCombatant(broken, ctx), broken, ctx);
    expect(player.calls ?? []).toEqual([]);
    expect(player.techniques.map((t) => t.id)).not.toContain(UNSEAL);
  });

  it('come home as whole as they ended it; beaten is broken', () => {
    expect(afterPuppetFight(puppeteer(), outcome(0.4)).puppetry.puppets[0]?.condition).toBe(0.4);
    const beaten = afterPuppetFight(puppeteer(), outcome(0));
    expect(beaten.puppetry.puppets[0]?.condition).toBe(0);
    expect(lastEntry(beaten)?.text).toMatch(/in pieces/);
  });

  it('fight a job’s fight with you through to the end', () => {
    let state = act(veteran(puppeteer(), 2), {
      type: 'startMission',
      missionId: 'tea-merchant-escort',
    });
    state = act(state, { type: 'missionContinue' });
    state = act(state, { type: 'missionChoose', approachIndex: 0 });
    const fighting = intoFight(state);
    expect(fighting.combat).not.toBeNull();
    const done = fightOut(fighting);
    expect(done.combat).toBeNull();
    expect(done.combatFinale?.log.join(' ')).toMatch(/Lantern Doll unfolds/);
  });
});

describe('mending a puppet', () => {
  const mend = { type: 'mendPuppet', frameId: DOLL } as const;

  it('is work at home, for materials, on a puppet that needs it', () => {
    expect(blockerFor(puppeteer(), mend, ctx)).toMatch(/whole/);
    expect(blockerFor({ ...puppeteer(0), wallet: { ryo: 0 } }, mend, ctx)).toMatch(/materials/);
  });

  it('mends a share and teaches craft, for the materials it took', () => {
    const broken = { ...puppeteer(0), wallet: { ryo: 500 } };
    const cost = mendingCost(broken, yourPuppets(broken, ctx)[0]!);
    const after = act(broken, mend);
    expect(after.puppetry.puppets[0]?.condition).toBe(MEND_BASE);
    expect(after.puppetry.craft).toBeGreaterThan(0);
    expect(after.wallet.ryo).toBe(500 - cost);
  });
});
