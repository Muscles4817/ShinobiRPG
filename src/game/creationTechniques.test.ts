import { STANDING_INFO } from '@/systems/profile';
import { ctx, draft } from '@/test/gameFixtures';

import { contextForPack } from './context';
import { createNewGame, draftProblems } from './creation';
import {
  creationBasics,
  defaultPicks,
  taughtProblems,
  techniqueOffer,
  techniquePicks,
  toggledTechnique,
} from './creationTechniques';
import { reviseDraft } from './creationDraft';
import { techniquesPage } from './views/creationTechniques';

describe('techniques chosen at creation', () => {
  it('gives more picks the higher the standing', () => {
    expect(techniquePicks(draft({ standing: 'dead-last' }))).toBe(1);
    expect(techniquePicks(draft({ standing: 'middle' }))).toBe(2);
    expect(techniquePicks(draft({ standing: 'genius' }))).toBe(3);
    expect(STANDING_INFO.top.techniques).toBeGreaterThanOrEqual(STANDING_INFO.middle.techniques);
  });

  it('offers only what the file’s grades carry steadily, never the basics or a nature art', () => {
    const offer = techniqueOffer(draft(), ctx);
    const basics = new Set(creationBasics(draft(), ctx));
    expect(offer.length).toBeGreaterThan(2);
    expect(offer.every((t) => !basics.has(t.id))).toBe(true);
    expect(offer.every((t) => t.needs?.nature === undefined)).toBe(true);
    expect(offer.every((t) => t.rank === 'E' || t.rank === 'D')).toBe(true);
  });

  it('offers a clan child the clan’s own arts', () => {
    // The Hyūga child's palm arts are taught at home, past the clan basics.
    const naruto = contextForPack('naruto')!;
    const heir = draft({ clanId: 'hyuga', standing: 'genius' }, naruto);
    const offer = techniqueOffer(heir, naruto);
    expect(offer.some((t) => t.clan === 'hyuga')).toBe(true);
    expect(offer.every((t) => t.clan === undefined || t.clan === 'hyuga')).toBe(true);
    expect(techniqueOffer(draft(), ctx).some((t) => t.clan !== undefined)).toBe(false);
  });

  it('teaches the chosen techniques beside the basics', () => {
    const offer = techniqueOffer(draft(), ctx).map((t) => t.id);
    const picks = offer.slice(-2);
    const chosen = draft({ techniqueIds: picks });
    expect(draftProblems(chosen, ctx)).toEqual([]);
    const game = createNewGame({ draft: chosen, seed: 1 }, ctx);
    expect(game.techniques.known).toEqual([...creationBasics(chosen, ctx), ...picks]);
  });

  it('refuses too many picks, or one the file doesn’t carry', () => {
    const offer = techniqueOffer(draft(), ctx).map((t) => t.id);
    // Written straight onto the draft: revising it would trim the picks back into line.
    const written = (techniqueIds: string[]) => ({ ...draft(), techniqueIds });
    expect(draftProblems(written(offer.slice(0, 3)), ctx)).toContain(
      'Choose at most 2 techniques.',
    );
    expect(draftProblems(written(['palm-strike']), ctx)[0]).toMatch(/no longer carries/);
    expect(taughtProblems(draft({ techniqueIds: offer.slice(0, 1) }), ctx)).toEqual([
      'Choose 2 techniques.',
    ]);
  });

  it('puts back the earliest pick when one more is chosen than the standing allows', () => {
    const offer = techniqueOffer(draft(), ctx).map((t) => t.id);
    const [a = '', b = '', c = ''] = offer;
    const two = draft({ techniqueIds: [a, b] });
    expect(toggledTechnique(two, c, ctx)).toEqual([b, c]);
    expect(toggledTechnique(two, a, ctx)).toEqual([b]);
  });

  it('drops picks a lower standing no longer carries', () => {
    const genius = draft({ standing: 'genius' });
    const picks = defaultPicks(genius, ctx);
    expect(picks).toHaveLength(3);
    const chosen = reviseDraft(genius, { techniqueIds: picks }, ctx);
    const fallen = reviseDraft(chosen, { standing: 'dead-last' }, ctx);
    expect(fallen.techniqueIds?.length).toBeLessThanOrEqual(1);
    expect(draftProblems(fallen, ctx)).toEqual([]);
  });

  it('lays the page out by art with the basics first, in both packs', () => {
    const page = techniquesPage(draft(), ctx);
    expect(page.basics.map((c) => c.id)).toEqual(creationBasics(draft(), ctx));
    expect(page.chosen).toBe(2);
    expect(page.groups.length).toBeGreaterThan(1);
    const naruto = contextForPack('naruto')!;
    const leaf = draft({}, naruto);
    expect(taughtProblems(leaf, naruto)).toEqual([]);
    expect(techniquesPage(leaf, naruto).groups.length).toBeGreaterThan(0);
  });
});
