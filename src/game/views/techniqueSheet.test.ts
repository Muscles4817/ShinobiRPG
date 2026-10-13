import { ctx, newGame, withAllStats } from '@/test/gameFixtures';

import { academyView } from './academy';
import { jutsuDeck } from './you';
import { shareRead, strengthWord, techniqueSheet } from './techniqueSheet';

describe('the technique sheet', () => {
  const state = withAllStats(newGame(), 10);
  const sheet = (id: string) => techniqueSheet(state, ctx, ctx.content.techniques.require(id));

  it('shows a fist’s reach as close only, and ninjutsu at a distance', () => {
    expect(
      sheet('palm-strike')
        .reach.filter((r) => r.reaches)
        .map((r) => r.band),
    ).toEqual(['Close']);
    expect(
      sheet('ember-breath')
        .reach.filter((r) => r.reaches)
        .map((r) => r.band),
    ).toEqual(['Mid', 'Far']);
  });

  it('names how hard it hits, with the power as a chip, and what it does in order', () => {
    const flurry = sheet('night-watch-flurry');
    expect(flurry.strength).toEqual({ word: 'Heavy', power: 16 });
    expect(flurry.effects.map((e) => e.text)).toEqual([
      'Strikes',
      'Dazes: they lose their next turn',
    ]);
    expect(sheet('mending-glow').strength).toBeNull();
    expect(sheet('mending-glow').effects[0]).toEqual({ text: 'Heals you', chip: '18 health' });
  });

  it('says what a hit takes from an equal, in words', () => {
    expect(sheet('palm-strike').inYourHands).toMatch(/of an equal’s health$/);
    expect(sheet('paper-veil').inYourHands).toBeNull();
  });

  it('names a clan’s art, and a technique’s needs', () => {
    expect(sheet('hibana-spark').school).toBe('Hibana clan art');
    expect(sheet('palm-strike').school).toBe('Standard technique');
  });

  it('is on every academy scroll and every card in the deck', () => {
    const scrolls = academyView(state, ctx)!;
    expect([...scrolls.ready, ...scrolls.comingUp].every((s) => s.sheet.reach.length === 3)).toBe(
      true,
    );
    expect(jutsuDeck(state, ctx).every((c) => c.sheet.chakra > 0)).toBe(true);
  });
});

describe('words for numbers', () => {
  it('bands strength and shares of health', () => {
    expect([4, 10, 16, 23, 30].map(strengthWord)).toEqual([
      'Light',
      'Solid',
      'Heavy',
      'Crushing',
      'Devastating',
    ]);
    expect([0.05, 0.1, 0.15, 0.25, 0.35, 0.5].map(shareRead)).toEqual([
      'a scratch',
      'about a tenth',
      'about a sixth',
      'about a quarter',
      'about a third',
      'about half',
    ]);
  });
});
