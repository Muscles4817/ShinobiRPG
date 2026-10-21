import { useState, type ReactNode } from 'react';

import {
  browseTechniques,
  OPEN_TECHNIQUE_FILTER,
  type EditorTechnique,
  type TechniqueBrowse,
  type TechniqueFacetOption,
  type TechniqueFilter,
} from '@/game';

import { useWideScreen } from '../../layout/useWideScreen';

/**
 * Finding a technique to add among hundreds: an art, a rank, an element and a kind (each
 * counting what the others leave), a name, only what their grades carry, and a page at a time.
 * The list itself is drawn by the caller, so the editor keeps its own cards and buttons.
 */

/** A desk shows more of a page at once: it has the room, and short cards. */
const DESK_PAGE_SIZE = 18;

interface FacetSelectProps<V extends string> {
  readonly label: string;
  readonly any: string;
  readonly options: readonly TechniqueFacetOption<V>[];
  readonly value: V | 'all';
  readonly onChange: (value: V | 'all') => void;
}

function FacetSelect<V extends string>({
  label,
  any,
  options,
  value,
  onChange,
}: FacetSelectProps<V>) {
  return (
    <label className="editor-facet">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => {
          onChange(options.find((o) => o.value === e.target.value)?.value ?? 'all');
        }}
      >
        <option value="all">{any}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} ({o.count})
          </option>
        ))}
      </select>
    </label>
  );
}

/** Which page of how many, and the steps between them. */
function Pager({
  browse,
  onPage,
}: {
  readonly browse: TechniqueBrowse;
  readonly onPage: (page: number) => void;
}) {
  const { page, pages, found, pageSize } = browse;
  const first = page * pageSize + 1;
  const last = Math.min(found, first + pageSize - 1);
  return (
    <nav className="editor-pager" aria-label="Pages">
      <button
        type="button"
        className="btn ghost small"
        disabled={page === 0}
        onClick={() => {
          onPage(page - 1);
        }}
      >
        Previous
      </button>
      <span aria-live="polite">
        {first}–{last} of {found}, page {page + 1} of {pages}
      </span>
      <button
        type="button"
        className="btn ghost small"
        disabled={page >= pages - 1}
        onClick={() => {
          onPage(page + 1);
        }}
      >
        Next
      </button>
    </nav>
  );
}

interface TechniqueFinderProps {
  readonly choices: readonly EditorTechnique[];
  readonly children: (shown: readonly EditorTechnique[]) => ReactNode;
}

export function TechniqueFinder({ choices, children }: TechniqueFinderProps) {
  const [filter, setFilterState] = useState<TechniqueFilter>(OPEN_TECHNIQUE_FILTER);
  const [page, setPage] = useState(0);
  const wide = useWideScreen();
  const browse = browseTechniques(choices, filter, page, wide ? DESK_PAGE_SIZE : undefined);
  // A new filter starts again from the first page.
  const setFilter = (next: Partial<TechniqueFilter>) => {
    setFilterState((f) => ({ ...f, ...next }));
    setPage(0);
  };
  return (
    <div className="editor-finder">
      <input
        type="search"
        className="editor-search"
        aria-label="Search techniques"
        placeholder="Search techniques by name"
        value={filter.query}
        onChange={(e) => {
          setFilter({ query: e.target.value });
        }}
      />
      <div className="editor-facets">
        <FacetSelect
          label="Art"
          any="Every art"
          options={browse.arts}
          value={filter.art}
          onChange={(art) => {
            setFilter({ art });
          }}
        />
        <FacetSelect
          label="Rank"
          any="Any rank"
          options={browse.ranks}
          value={filter.rank}
          onChange={(rank) => {
            setFilter({ rank });
          }}
        />
        <FacetSelect
          label="Element"
          any="Any element"
          options={browse.elements}
          value={filter.element}
          onChange={(element) => {
            setFilter({ element });
          }}
        />
        <FacetSelect
          label="Kind"
          any="Any kind"
          options={browse.kinds}
          value={filter.kind}
          onChange={(kind) => {
            setFilter({ kind });
          }}
        />
      </div>
      <div className="editor-found">
        <label className="editor-ready">
          <input
            type="checkbox"
            checked={filter.readyOnly}
            onChange={(e) => {
              setFilter({ readyOnly: e.target.checked });
            }}
          />
          Only what their grades carry now
        </label>
        {browse.filtered && (
          <button
            type="button"
            className="btn ghost small"
            onClick={() => {
              setFilter(OPEN_TECHNIQUE_FILTER);
            }}
          >
            Clear filters
          </button>
        )}
      </div>
      {browse.found === 0 ? (
        <p className="muted">Nothing fits. Loosen a filter.</p>
      ) : (
        <>
          {children(browse.shown)}
          {browse.pages > 1 && <Pager browse={browse} onPage={setPage} />}
        </>
      )}
    </div>
  );
}
