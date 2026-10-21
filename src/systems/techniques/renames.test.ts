import { renameInBook } from './renames';

const RENAMES = { old: 'kept' };

describe('renameInBook', () => {
  it('moves a known technique to the id it became', () => {
    const book = renameInBook(
      { known: ['old', 'other'], progress: {}, unstable: [], repertoire: null, chains: null },
      RENAMES,
    );
    expect(book.known).toEqual(['kept', 'other']);
  });

  it('knows a technique known under both ids once, and stable if either was', () => {
    const book = renameInBook(
      { known: ['old', 'kept'], progress: {}, unstable: ['old'], repertoire: null, chains: null },
      RENAMES,
    );
    expect(book.known).toEqual(['kept']);
    expect(book.unstable).toEqual([]);
  });

  it('keeps it unstable when the only way it was known was unstable', () => {
    const book = renameInBook(
      { known: ['old'], progress: {}, unstable: ['old'], repertoire: null, chains: null },
      RENAMES,
    );
    expect(book.unstable).toEqual(['kept']);
  });

  it('keeps the furthest study and drops study of what is now known', () => {
    expect(
      renameInBook(
        {
          known: [],
          progress: { old: 30, kept: 10 },
          unstable: [],
          repertoire: null,
          chains: null,
        },
        RENAMES,
      ),
    ).toMatchObject({ progress: { kept: 30 } });
    expect(
      renameInBook(
        { known: ['kept'], progress: { old: 30 }, unstable: [], repertoire: null, chains: null },
        RENAMES,
      ).progress,
    ).toEqual({});
  });

  it('leaves a book with nothing renamed as it was', () => {
    const book = {
      known: ['a'],
      progress: { b: 5 },
      unstable: ['a'],
      repertoire: null,
      chains: null,
    };
    expect(renameInBook(book, RENAMES)).toEqual(book);
  });
});
