import { ctx, newGame } from '@/test/gameFixtures';

import { changedNotes, changeSeen } from './scoutingChanged';

const owl = ctx.content.enemies.require('old-owl-of-the-pass');
const boar = ctx.content.enemies.require('ember-tusk-boar');

describe('reading a beast changed by chakra', () => {
  it('says only that it is changed until its nature and gifts are seen', () => {
    expect(changedNotes(boar, false).map((n) => n.label)).toEqual(['Changed by chakra.']);
  });

  it('names its nature, with what overpowers it, and its gifts once seen', () => {
    expect(changedNotes(boar, true)).toContainEqual({
      label: 'A fire nature.',
      counter: 'Water beats it.',
    });
    expect(changedNotes(owl, true).map((n) => n.label)).toEqual([
      'Changed by chakra.',
      'It sees a move coming.',
    ]);
  });

  it('says nothing of a plain animal', () => {
    expect(changedNotes(ctx.content.enemies.require('grey-wolf'), true)).toEqual([]);
  });

  it('sees everything in a fight, and more with sharper eyes before one', () => {
    const game = newGame();
    expect(changeSeen(game, boar, 'full')).toBe(true);
    const blind = {
      ...game,
      character: { ...game.character, stats: { ...game.character.stats, perception: 0 } },
    };
    expect(changeSeen(blind, boar, 'glance')).toBe(false);
    const sharp = {
      ...game,
      character: { ...game.character, stats: { ...game.character.stats, perception: 60 } },
    };
    const beasts = ctx.content.enemies.all.filter((e) => e.chakraBeast);
    expect(beasts.some((b) => changeSeen(sharp, b, 'glance'))).toBe(true);
  });
});
