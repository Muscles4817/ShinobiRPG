import { useState } from 'react';

import {
  browseTechniques,
  OPEN_TECHNIQUE_FILTER,
  type FindableTechnique,
  type TechniqueBrowse,
  type TechniqueFilter,
} from '@/game';

import { useWideScreen } from '../../layout/useWideScreen';

/**
 * A technique finder's state: the filter, the page, and what they find. A new filter starts
 * again from the first page. A desk may show more of a page than a phone.
 */

export interface PageSizes {
  readonly phone: number;
  readonly desk: number;
}

export interface TechniqueFinderState<T extends FindableTechnique> {
  readonly filter: TechniqueFilter;
  readonly setFilter: (next: Partial<TechniqueFilter>) => void;
  readonly setPage: (page: number) => void;
  readonly browse: TechniqueBrowse<T>;
}

export function useTechniqueFinder<T extends FindableTechnique>(
  list: readonly T[],
  sizes: PageSizes,
): TechniqueFinderState<T> {
  const [filter, setFilterState] = useState<TechniqueFilter>(OPEN_TECHNIQUE_FILTER);
  const [page, setPage] = useState(0);
  const wide = useWideScreen();
  const browse = browseTechniques(list, filter, page, wide ? sizes.desk : sizes.phone);
  const setFilter = (next: Partial<TechniqueFilter>) => {
    setFilterState((f) => ({ ...f, ...next }));
    setPage(0);
  };
  return { filter, setFilter, setPage, browse };
}
