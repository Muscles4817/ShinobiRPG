import { newGame } from '@/test/gameFixtures';

import { contextForPack } from '../../context';
import { academyView } from '../../views/academy';
import { libraryView } from '../../views/library';
import { packEdits, readEditBook, withPackEdits, writeEditBook, EMPTY_BOOK } from '../book';
import type { ContentEdits } from '../state';
import { BLANK_DRAFT, draftProblems, type TechniqueDraft } from './draft';
import { dropTechnique, keepTechnique, madeDraft } from './edit';
import { forgeView, madeShelf } from './view';

/** Made techniques taught in the home village: on the shelf their rank belongs on, or nowhere. */

const original = contextForPack('original')!;

const SPARK: TechniqueDraft = {
  ...BLANK_DRAFT,
  name: 'Wick Spark',
  rank: 'D',
  taught: true,
};

function keep(draft: TechniqueDraft) {
  const kept = keepTechnique(original, draft, null);
  if (!kept) throw new Error('the draft should be ready');
  return kept;
}

function shelfIds(edits: ContentEdits, kind: 'academy' | 'library'): readonly string[] {
  const ctx = contextForPack('original', edits)!;
  const home = ctx.content.locations.require(ctx.content.startLocationId);
  return home.places.flatMap((p) => (p.kind === kind ? p.techniqueIds : []));
}

describe('a made technique taught in the village', () => {
  it('goes on the academy’s rack at E–D, where a new game can study it', () => {
    const { edits, id } = keep(SPARK);
    expect(shelfIds(edits, 'academy')).toContain(id);
    expect(shelfIds(edits, 'library')).not.toContain(id);
    const ctx = contextForPack('original', edits)!;
    const view = academyView(newGame({}, ctx), ctx)!;
    expect([...view.ready, ...view.comingUp].map((s) => s.id)).toContain(id);
  });

  it('goes on the library’s shelves at C–A, under the library’s rules', () => {
    const { edits, id } = keep({ ...SPARK, rank: 'B' });
    expect(shelfIds(edits, 'library')).toContain(id);
    expect(shelfIds(edits, 'academy')).not.toContain(id);
    const ctx = contextForPack('original', edits)!;
    // A genin sees the restricted stacks only as a count, and it has one more in it.
    const before = libraryView(newGame({}, original), original)!.restricted;
    expect(libraryView(newGame({}, ctx), ctx)!.restricted).toBe(before + 1);
    expect(forgeView(original, { ...SPARK, rank: 'B' }).taughtAt).toMatch(/restricted stacks/);
  });

  it('is never shelved at S', () => {
    expect(draftProblems({ ...SPARK, rank: 'S' })).toEqual([
      'An S technique can’t be taught in the village.',
    ]);
  });

  it('is shelved nowhere unless asked, and comes off the shelf when no longer taught', () => {
    const { edits, id } = keep({ ...SPARK, taught: false });
    expect(shelfIds(edits, 'academy')).not.toContain(id);
    const ctx = contextForPack('original', edits)!;
    const taught = keepTechnique(ctx, SPARK, id)!;
    expect(madeDraft(taught.edits, id)?.taught).toBe(true);
    const untaught = keepTechnique(
      contextForPack('original', taught.edits)!,
      { ...SPARK, taught: false },
      id,
    )!;
    expect(shelfIds(untaught.edits, 'academy')).not.toContain(id);
  });

  it('comes off the shelf when dropped, and is kept on the device', () => {
    const { edits, id } = keep(SPARK);
    expect(madeShelf(contextForPack('original', edits)!)[0]?.taughtAt).toMatch(/academy/);
    const book = readEditBook(writeEditBook(withPackEdits(EMPTY_BOOK, 'original', edits)));
    expect(packEdits(book, 'original').taught).toEqual([id]);
    const dropped = dropTechnique(edits, id);
    expect(dropped.taught).toBeUndefined();
    expect(shelfIds(dropped, 'academy')).not.toContain(id);
  });
});
