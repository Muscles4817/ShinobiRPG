import { act, ctx, fightOut, intoFight, newGame, withAllStats } from '@/test/gameFixtures';
import { blockerFor } from '@/game';
import { BOND_STAGES } from '@/systems/bonds';
import { stock } from '@/systems/inventory';

import { contextForPack } from '../context';
import type { GameState } from '../state';
import { afterSummons, signContract, withSummons } from './summons';
import { playerCombatant } from '../combatants';

const naruto = contextForPack('naruto')!;
const at = (stage: number) => BOND_STAGES[stage]!.min;

function signed(standing = 0): GameState {
  const state = signContract(newGame(), ctx, 'kiln-salamanders');
  return { ...state, contract: { ...state.contract!, standing } };
}

function calls(state: GameState): string[] {
  return withSummons(playerCombatant(state, ctx), state, ctx).calls?.map((c) => c.id) ?? [];
}

describe('summoning contracts', () => {
  it('lets only the smallest answer at first, the rest as your standing grows', () => {
    expect(calls(newGame())).toEqual([]);
    expect(calls(signed())).toEqual(['kiln-newt']);
    expect(calls(signed(at(2)))).toEqual(['kiln-newt', 'ember-salamander']);
    const techniques = withSummons(playerCombatant(signed(), ctx), signed(), ctx).techniques;
    expect(techniques.map((t) => t.id)).toContain('summon-kiln-newt');
  });

  it('a summon that asks an offering answers only when you carry it, and takes it', () => {
    const elder = signed(at(4));
    expect(calls(elder)).not.toContain('kiln-mother');
    const carrying = { ...elder, inventory: stock(elder.inventory, 'chestnuts') };
    expect(calls(carrying)).toContain('kiln-mother');
    const after = afterSummons(
      carrying,
      {
        result: 'victory',
        rounds: 2,
        player: { health: 50, chakra: 10 },
        summons: { 'kiln-mother': 'stayed' },
      },
      ctx,
    );
    expect(calls(after)).not.toContain('kiln-mother');
  });

  it('the clan thinks better of you for summons kept to the end, worse for those beaten', () => {
    const state = signed(20);
    const outcome = (fate: 'stayed' | 'fell') => ({
      result: 'victory' as const,
      rounds: 2,
      player: { health: 50, chakra: 10 },
      summons: { 'kiln-newt': fate },
    });
    expect(afterSummons(state, outcome('stayed'), ctx).contract!.standing).toBeGreaterThan(20);
    expect(afterSummons(state, outcome('fell'), ctx).contract!.standing).toBeLessThan(20);
  });

  it('a teacher lets a close friend sign their contract, one contract at a time', () => {
    const fresh = newGame({}, naruto);
    // In the afternoon Kakashi is at the training ground.
    const afternoon = { ...fresh, time: { ...fresh.time, slot: 1 } };
    const sign = { type: 'signContract', personId: 'kakashi' } as const;
    expect(blockerFor(afternoon, sign, naruto)).toMatch(/close friends/);
    const bonds = {
      ...afternoon.people.bonds,
      kakashi: { points: at(3), lastTalkDay: null, heard: [] },
    };
    const close = { ...afternoon, people: { ...afternoon.people, bonds } };
    const done = act(close, sign, naruto);
    expect(done.contract?.contractId).toBe('kakashi-ninken');
    expect(blockerFor(done, sign, naruto)).toMatch(/one at a time/);
  });

  it('calls its summon in a job’s fight and lets the clan judge it', () => {
    const start = withAllStats(signed(), 12);
    let state = act(
      { ...start, standing: { ...start.standing, missionsCompleted: 5 } },
      { type: 'startMission', missionId: 'tea-merchant-escort' },
    );
    state = act(state, { type: 'missionContinue' });
    state = act(state, { type: 'missionChoose', approachIndex: 0 });
    const after = fightOut(intoFight(state));
    expect(after.combat).toBeNull();
    expect(after.contract!.standing).not.toBe(start.contract!.standing);
  });
});
