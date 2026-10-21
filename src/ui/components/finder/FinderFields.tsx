import { OPEN_TECHNIQUE_FILTER, type FindableTechnique, type TechniqueFacetOption } from '@/game';

import type { TechniqueFinderState } from './useTechniqueFinder';

/**
 * A technique finder's fields: a name, the facets (art, rank, element, kind, each counting what
 * the others leave), the ready-only switch in the screen's own words, and a way back to
 * everything. A screen that shows the art another way (the deck's coloured chips) leaves it out.
 */

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
    <label className="finder-facet">
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

interface FinderFieldsProps<T extends FindableTechnique> {
  readonly finder: TechniqueFinderState<T>;
  /** What "ready only" means here: "Only what their grades carry now", "Only those you know". */
  readonly readyLabel: string;
  /** Leave the art out of the facets, for a screen that picks it another way. */
  readonly withoutArt?: boolean;
}

export function FinderFields<T extends FindableTechnique>({
  finder,
  readyLabel,
  withoutArt = false,
}: FinderFieldsProps<T>) {
  const { filter, setFilter, browse } = finder;
  return (
    <>
      <input
        type="search"
        className="finder-search"
        aria-label="Search techniques"
        placeholder="Search techniques by name"
        value={filter.query}
        onChange={(e) => {
          setFilter({ query: e.target.value });
        }}
      />
      <div className="finder-facets">
        {!withoutArt && (
          <FacetSelect
            label="Art"
            any="Every art"
            options={browse.arts}
            value={filter.art}
            onChange={(art) => {
              setFilter({ art });
            }}
          />
        )}
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
      <div className="finder-found">
        <label className="finder-ready">
          <input
            type="checkbox"
            checked={filter.readyOnly}
            onChange={(e) => {
              setFilter({ readyOnly: e.target.checked });
            }}
          />
          {readyLabel}
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
    </>
  );
}
