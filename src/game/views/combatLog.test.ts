import type { ToldEvent } from '@/systems/combat';
import { linesOf } from '@/test/fightLines';
import { divider, reacting, said } from '@/test/story';
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

/** About a fresh genin partner's level, so the spar lasts long enough to trade blows. */
const SPARRING_STATS = 7;

/** Every line the fight screen showed over a whole spar, picking sensibly each turn. */
function sparLog(style: string, context: GameContext): ToldEvent[] {
  let state: GameState = withAllStats(newGame({}, context), SPARRING_STATS);
  if (style !== state.settings.combatStyle) {
    state = act(state, { type: 'setCombatStyle', style }, context);
  }
  state = act(state, { type: 'spar', personId: 'kaen' }, context);
  const seen = new Map<string, ToldEvent>();
  for (let i = 0; i < 300 && state.combat; i++) {
    const view = combatScene(state, context)!;
    linesOf(view.story).forEach((line) => seen.set(JSON.stringify(line), line));
    const options = view.options.filter((o) => !o.disabledReason);
    const pick =
      options.find((o) => o.id === 'begin' || o.id === 'round') ??
      options.find((o) => o.targeted) ??
      options.find((o) => o.kind === 'end') ??
      options.find((o) => o.kind === 'move') ??
      options[0]!;
    state = act(state, { type: 'combatAct', optionId: pick.id }, context);
  }
  return [...seen.values()];
}

describe('combat log view', () => {
  it('sets round markers apart', () => {
    expect(combatLog([divider('— Round 2 —', false)])).toEqual([
      { kind: 'round', text: 'Round 2' },
    ]);
  });

  it('stamps the defences that reacted beside the damage', () => {
    const hit = said('Goro hits Aoi through a guard.', 'goro', {
      reactions: [reacting('guarded', 'aoi', 'goro')],
      amounts: [{ kind: 'harm', amount: 4 }],
    });
    expect(combatLog([hit])).toEqual([
      {
        kind: 'story',
        text: 'Goro hits Aoi through a guard.',
        chips: [
          { label: 'Guarded', tone: 'info' },
          { label: '−4', tone: 'harm' },
        ],
      },
    ]);
  });

  it('stamps a turn of the player’s that played off their plan, with why', () => {
    const [line] = combatLog([
      said('You throw a plain blow.', 'player', {
        offPlan: 'improvised',
        amounts: [{ kind: 'harm', amount: 3 }],
      }),
    ]);
    expect(line).toEqual({
      kind: 'story',
      text: 'You throw a plain blow.',
      chips: [
        { label: 'Off plan: nothing slotted fit', tone: 'info' },
        { label: '−3', tone: 'harm' },
      ],
    });
  });

  it.each(STYLES)('keeps numbers out of the story and its dividers in %s, as chips', (style, c) => {
    const lines = combatLog(sparLog(style, c));
    const story = lines.flatMap((l) => (l.kind === 'story' ? [l] : []));
    expect(story.filter((l) => /\d/.test(l.text))).toEqual([]);
    const dividers = lines.filter((l) => l.kind === 'round');
    expect(dividers.length).toBeGreaterThan(0);
    expect(dividers.filter((l) => /\d/.test(l.text))).toEqual([]);
    expect(story.some((l) => l.chips.some((chip) => chip.tone === 'harm'))).toBe(true);
  });
});

describe('a cause on the line', () => {
  it('shows as a stamp beside the reaction, in words', () => {
    const [line] = combatLog([
      said('Jin slips it.', 'aoi', {
        reactions: [reacting('missed', 'jin', 'aoi')],
        cause: { cause: 'read-it', kind: 'slipped', subject: 'aoi' },
      }),
    ]);
    expect(line).toEqual({
      kind: 'story',
      text: 'Jin slips it.',
      chips: [
        { label: 'Missed', tone: 'info' },
        { label: 'Read it coming', tone: 'info' },
      ],
    });
  });
});
