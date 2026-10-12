import { act, classicCtx, ctx, newGame, withAllStats } from '@/test/gameFixtures';

import type { GameContext } from '../context';
import type { GameState } from '../state';
import { combatLog } from './combatLog';
import { combatScene } from './scene';

/** Each style with a context that offers it: Classic is shelved, so it is injected. */
const STYLES: readonly (readonly [string, GameContext])[] = [
  ['duel-v1', classicCtx],
  ['plan-v1', ctx],
];

/** Every log line the fight screen showed over a whole spar, picking sensibly each turn. */
function sparLog(style: string, context: GameContext): string[] {
  let state: GameState = withAllStats(newGame({}, context), 20);
  if (style !== state.settings.combatStyle) {
    state = act(state, { type: 'setCombatStyle', style }, context);
  }
  state = act(state, { type: 'spar', personId: 'kaen' }, context);
  const seen = new Set<string>();
  for (let i = 0; i < 300 && state.combat; i++) {
    const view = combatScene(state, context)!;
    view.log.forEach((line) => seen.add(line));
    const options = view.options.filter((o) => !o.disabledReason);
    const pick =
      options.find((o) => o.id === 'begin' || o.id === 'round') ??
      options.find((o) => o.targeted) ??
      options.find((o) => o.kind === 'end') ??
      options.find((o) => o.kind === 'move') ??
      options[0]!;
    state = act(state, { type: 'combatAct', optionId: pick.id }, context);
  }
  return [...seen];
}

describe('combat log view', () => {
  it('sets round markers apart', () => {
    expect(combatLog(['— Round 2 —'])).toEqual([{ kind: 'round', text: 'Round 2' }]);
  });

  it.each(STYLES)('keeps numbers out of the story in %s and shows them as chips', (style, c) => {
    const lines = combatLog(sparLog(style, c));
    const story = lines.flatMap((l) => (l.kind === 'story' ? [l] : []));
    expect(story.filter((l) => /\d/.test(l.text))).toEqual([]);
    expect(story.some((l) => l.chips.some((chip) => chip.tone === 'harm'))).toBe(true);
  });
});
