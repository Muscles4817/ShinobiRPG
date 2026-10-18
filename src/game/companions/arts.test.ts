import { act, ctx, newGame, withAllStats, withHound } from '@/test/gameFixtures';
import { blockerFor } from '@/game';
import { BOND_STAGES } from '@/systems/bonds';

import { contextForPack } from '../context';
import type { GameState } from '../state';
import { companionAllies } from './combatant';
import { ownerHandling } from './drill';
import { playerCompanion } from './make';
import { checkHand } from '../missionRoles';

const at = (stage: number) => BOND_STAGES[stage]!.min;

function techniquesIn(state: GameState): string[] {
  return companionAllies(state, ctx)[0]?.techniques.map((t) => t.id) ?? [];
}

const naruto = contextForPack('naruto')!;

describe('what the bond opens', () => {
  it('opens its techniques stage by stage', () => {
    expect(techniquesIn(withHound(newGame(), { bond: 0 }))).toEqual([]);
    expect(techniquesIn(withHound(newGame(), { bond: at(1) }))).toEqual(['fang-rush']);
    expect(techniquesIn(withHound(newGame(), { bond: at(3) }))).toEqual([
      'fang-rush',
      'flanking-bite',
    ]);
  });

  it('a deeper art needs a handler to teach it, once the bond is there', () => {
    const close = withHound(newGame({ wallet: { ryo: 500 } }), { bond: at(4) });
    expect(techniquesIn(close)).not.toContain('baying-howl');
    const early = withHound(newGame({ wallet: { ryo: 500 } }), { bond: at(3) });
    expect(blockerFor(early, { type: 'handlerTeach', techniqueId: 'baying-howl' }, ctx)).toMatch(
      /isn’t ready/,
    );
    const taught = act(close, { type: 'handlerTeach', techniqueId: 'baying-howl' });
    expect(techniquesIn(taught)).toContain('baying-howl');
    expect(taught.wallet.ryo).toBeLessThan(500);
  });

  it('a kennel master drills it better than you can, for a fee', () => {
    const state = withHound(newGame({ wallet: { ryo: 500 } }));
    const yours = playerCompanion(act(state, { type: 'trainCompanion', stat: 'taijutsu' }))!;
    const theirs = playerCompanion(act(state, { type: 'handlerSession', stat: 'taijutsu' }))!;
    const before = playerCompanion(state)!.stats.taijutsu;
    expect(theirs.stats.taijutsu - before).toBeGreaterThan(yours.stats.taijutsu - before);
  });

  it('a clan handler works only with those close enough to them, and never for nothing', () => {
    const outsider = withHound(newGame({ wallet: { ryo: 500 } }, naruto));
    const session = { type: 'handlerSession', stat: 'taijutsu' } as const;
    expect(blockerFor(outsider, session, naruto)).toMatch(/works only with/);
    const bonds = { hana: { points: at(1), lastTalkDay: null, heard: [] } };
    const known = { ...outsider, people: { ...outsider.people, bonds } };
    expect(blockerFor(known, session, naruto)).toBeNull();
    const poor = withHound(newGame({ wallet: { ryo: 0 } }));
    expect(blockerFor(poor, session, ctx)).toMatch(/ryo/);
  });

  it('handling lore bought far from home makes your own sessions count for more', () => {
    const abroad = { ...newGame({ wallet: { ryo: 500 } }), locationId: 'port-shiomachi' };
    const read = act(abroad, { type: 'buyLore', loreId: 'kennel-masters-notes' });
    expect(ownerHandling(read, ctx)).toBeGreaterThan(ownerHandling(abroad, ctx));
    expect(blockerFor(read, { type: 'buyLore', loreId: 'kennel-masters-notes' }, ctx)).toMatch(
      /already/,
    );
  });

  it('takes a tracker’s check once you are close, when its nose is the best', () => {
    const tracking = {
      label: 'Follow the trail',
      stat: 'perception' as const,
      difficulty: 8,
      role: 'tracker' as const,
    };
    const dull = withAllStats(newGame(), 2);
    expect(checkHand(withHound(dull, { bond: at(2) }), ctx, tracking).name).toBe('You');
    expect(checkHand(withHound(dull, { bond: at(3) }), ctx, tracking).name).toBe('Ash');
    const { role: _role, ...plain } = tracking;
    expect(checkHand(withHound(dull, { bond: at(3) }), ctx, plain).name).toBe('You');
  });
});
