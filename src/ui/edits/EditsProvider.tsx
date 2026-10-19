import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  EMPTY_BOOK,
  packEdits,
  readEditBook,
  withPackEdits,
  writeEditBook,
  type ContentEdits,
  type EditBook,
  type SaveStore,
} from '@/game';

/**
 * The content editor's changes for the whole app: read from the device once, written back on
 * every change. Versus and a new game take a pack's edits from here; a game under way keeps
 * the copy in its own save.
 */

export interface EditsApi {
  readonly book: EditBook;
  readonly editsFor: (packId: string) => ContentEdits;
  readonly change: (packId: string, edits: ContentEdits) => void;
}

const NO_BOOK: EditsApi = {
  book: EMPTY_BOOK,
  editsFor: (packId) => packEdits(EMPTY_BOOK, packId),
  change: () => undefined,
};

const EditsContext = createContext<EditsApi>(NO_BOOK);

export function EditsProvider({
  store,
  children,
}: {
  readonly store: SaveStore;
  readonly children: ReactNode;
}) {
  const [book, setBook] = useState(() => readEditBook(store.load()));
  const api = useMemo<EditsApi>(
    () => ({
      book,
      editsFor: (packId) => packEdits(book, packId),
      change: (packId, edits) => {
        const next = withPackEdits(book, packId, edits);
        setBook(next);
        store.save(writeEditBook(next));
      },
    }),
    [book, store],
  );
  return <EditsContext.Provider value={api}>{children}</EditsContext.Provider>;
}

export function useEdits(): EditsApi {
  return useContext(EditsContext);
}
