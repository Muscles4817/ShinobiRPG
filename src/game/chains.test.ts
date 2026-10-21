import { act, ctx, newGame } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { playerCombatant } from './combatants';
import type { GameState } from './state';
import { chainIds } from './style';
import { chainDraft, chainsView } from './views/chains';

const MOVES = ['post-sweep', 'crescent-drop', 'shoulder-throw', 'watchmans-rush', 'arm-lock'];

/** A genin with taijutsu at C and a handful of body moves. */
function trained(taijutsu = 16): GameState {
  const state = newGame();
  const known = [...new Set([...state.techniques.known, ...MOVES])];
  return {
    ...state,
    character: { ...state.character, stats: { ...state.character.stats, taijutsu } },
    techniques: { ...state.techniques, known },
  };
}

describe('your chains', () => {
  it('are built for you from what you know until you build your own', () => {
    const state = trained();
    expect(chainIds(state, ctx).length).toBeGreaterThan(0);
    expect(chainsView(state, ctx)).toMatchObject({ locked: false, length: 2, chosen: false });
    expect(playerCombatant(state, ctx).chains).toBeUndefined();
  });

  it('come at taijutsu grade C', () => {
    expect(chainsView(trained(10), ctx)?.locked).toBe(true);
    const keep = { type: 'keepChain', techniqueIds: ['post-sweep', 'crescent-drop'] } as const;
    expect(blockerFor(trained(10), keep, ctx)).toMatch(/taijutsu come at grade C/);
  });

  it('say before you keep one whether each move follows the last', () => {
    const built = trained();
    const state = { ...built, techniques: { ...built.techniques, chains: [] } };
    expect(chainDraft(state, ctx, ['arm-lock', 'post-sweep'])).toMatchObject({
      text: 'Arm Lock into Post Sweep',
      keep: { blocker: null },
    });
    expect(chainDraft(state, ctx, ['shoulder-throw', 'crescent-drop']).keep.blocker).toMatch(
      /leaves them at mid/,
    );
    const rush = chainDraft(state, ctx, ['shoulder-throw', 'watchmans-rush']).keep.blocker;
    expect(rush ?? '').not.toMatch(/leaves them/);
  });

  it('are kept and dropped as you choose, and fights carry them', () => {
    const state = trained();
    const cleared = chainIds(state, ctx).reduce(
      (s) => act(s, { type: 'dropChain', index: 0 }),
      state,
    );
    expect(cleared.techniques.chains).toEqual([]);
    const kept = act(cleared, {
      type: 'keepChain',
      techniqueIds: ['shoulder-throw', 'watchmans-rush'],
    });
    expect(kept.techniques.chains).toEqual([['shoulder-throw', 'watchmans-rush']]);
    expect(playerCombatant(kept, ctx).chains).toEqual(kept.techniques.chains);
    const again = {
      type: 'keepChain',
      techniqueIds: ['shoulder-throw', 'watchmans-rush'],
    } as const;
    expect(blockerFor(kept, again, ctx)).toMatch(/already keep/);
    expect(act(kept, { type: 'resetChains' }).techniques.chains).toBeNull();
  });
});
