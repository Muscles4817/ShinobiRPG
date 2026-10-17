import { DISCIPLINES } from '@/systems/techniques';

import { createNewGame } from './creation';
import { yearClans, CLAN_CHILDREN_ODDS } from './people/yearClans';
import { ctx, draft, formTeam } from '@/test/gameFixtures';
import { classHonoursView } from './views/classHonours';

const SEEDS = Array.from({ length: 60 }, (_, i) => i * 7919 + 13);

function graduated(standing: 'dead-last' | 'middle' | 'genius', seed = 1234) {
  return formTeam(createNewGame({ draft: draft({ standing }), seed }, ctx));
}

describe('clan children in a year', () => {
  it('vary from year to year: some years have none, some several', () => {
    const counts = SEEDS.map((seed) => yearClans(ctx, seed, 6).filter((c) => c !== null).length);
    expect(Math.min(...counts)).toBe(0);
    expect(Math.max(...counts)).toBeGreaterThanOrEqual(3);
    expect(Math.max(...counts)).toBeLessThan(CLAN_CHILDREN_ODDS.length);
  });

  it('are the same for the same seed, and only of the pack’s real clans', () => {
    const clans = new Set(ctx.content.clans.all.map((c) => c.id));
    expect(yearClans(ctx, 42, 6)).toEqual(yearClans(ctx, 42, 6));
    for (const id of yearClans(ctx, 42, 6)) if (id) expect(clans.has(id)).toBe(true);
  });

  it('graduate as clan children: the clan’s name, its art, its blood', () => {
    const seed = SEEDS.find((s) => yearClans(ctx, s, 6).some((c) => c !== null))!;
    const game = formTeam(createNewGame({ draft: draft(), seed }, ctx));
    const heirs = game.people.generated.filter((p) => p.clanId);
    expect(heirs.length).toBeGreaterThan(0);
    for (const heir of heirs) {
      const clan = ctx.content.clans.require(heir.clanId!);
      expect(heir.familyName).toBe(clan.name);
      const art = DISCIPLINES.find((d) => clan.arts.includes(d));
      if (art) expect(heir.specialty).toBe(art);
    }
  });
});

describe('the year’s honours', () => {
  it('read out the whole year, you among them', () => {
    const view = classHonoursView(graduated('middle'), ctx)!;
    const genin = ctx.content.people.all.filter((p) => p.role === 'genin' && !p.homeLocationId);
    expect(view.roll).toHaveLength(genin.length + 6 + 1);
    expect(view.roll.filter((c) => c.you)).toHaveLength(1);
    expect(view.honours[0]?.title).toBe('Top of the year');
    expect(view.honours.at(-1)?.title).toBe('Dead last');
    expect(view.year).not.toMatch(/\d/);
  });

  it('keep you where your standing says: a dead last is last, a genius first', () => {
    const last = classHonoursView(graduated('dead-last'), ctx)!;
    expect(last.roll.at(-1)?.you).toBe(true);
    expect(last.honours.find((h) => h.title === 'Dead last')?.who.you).toBe(true);
    const genius = classHonoursView(graduated('genius'), ctx)!;
    expect(genius.roll[0]?.you).toBe(true);
    expect(genius.honours[0]?.who.you).toBe(true);
  });

  it('honour an art only for a clear best, never twice to the top of the year', () => {
    const view = classHonoursView(graduated('middle'), ctx)!;
    const top = view.honours[0]!.who.id;
    const arts = view.honours.filter((h) => h.title.startsWith('Top in'));
    for (const h of arts) expect(h.who.id).not.toBe(top);
  });

  it('say how strong a year it was, by how many of it the clans sent', () => {
    const heirs = (seed: number) => yearClans(ctx, seed, 6).filter((c) => c !== null).length;
    const thin = SEEDS.find((seed) => heirs(seed) === 0)!;
    const strong = SEEDS.find((seed) => heirs(seed) >= 4)!;
    const lineOf = (seed: number) =>
      classHonoursView(formTeam(createNewGame({ draft: draft(), seed }, ctx)), ctx)!.year;
    expect(lineOf(thin)).toMatch(/^A (thin|plain) year/);
    expect(lineOf(strong)).toMatch(/^A strong year/);
  });

  it('wait until the year is known', () => {
    expect(classHonoursView(createNewGame({ draft: draft(), seed: 1 }, ctx), ctx)).toBeNull();
  });
});
