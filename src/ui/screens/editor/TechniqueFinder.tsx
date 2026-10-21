import type { ReactNode } from 'react';

import type { EditorTechnique } from '@/game';

import { FinderFields } from '../../components/finder/FinderFields';
import { FinderPager } from '../../components/finder/FinderPager';
import { useTechniqueFinder } from '../../components/finder/useTechniqueFinder';

/**
 * Finding a technique to give a fighter among hundreds, a page at a time. The list itself is
 * drawn by the caller, so the editor keeps its own cards and buttons.
 */

/** A desk shows more of a page at once: it has the room, and short cards. */
const PAGE_SIZES = { phone: 12, desk: 18 } as const;

interface TechniqueFinderProps {
  readonly choices: readonly EditorTechnique[];
  readonly children: (shown: readonly EditorTechnique[]) => ReactNode;
}

export function TechniqueFinder({ choices, children }: TechniqueFinderProps) {
  const finder = useTechniqueFinder(choices, PAGE_SIZES);
  const { browse } = finder;
  return (
    <div className="finder">
      <FinderFields finder={finder} readyLabel="Only what their grades carry now" />
      {browse.found === 0 ? (
        <p className="muted">Nothing fits. Loosen a filter.</p>
      ) : (
        <>
          {children(browse.shown)}
          <FinderPager browse={browse} onPage={finder.setPage} />
        </>
      )}
    </div>
  );
}
