import {
  browseRoster,
  OPEN_FILTER,
  withGroup,
  type FacetOption,
  type RosterBrowse,
  type VersusFighter,
  type VersusFilter,
} from '@/game';

import { Portrait } from '../../art/Portrait';
import { GradeBadge } from '../../components/Grade';

/** Where a fighter already stands, for the stamp on their row. */
export type Standing = 'side' | 'foes' | null;

interface FacetSelectProps {
  readonly id: string;
  readonly label: string;
  readonly any: string;
  readonly options: readonly FacetOption[];
  readonly value: string | null;
  readonly onChange: (value: string | null) => void;
}

/** One facet as a drop-down, each value with how many it would find. */
function FacetSelect({ id, label, any, options, value, onChange }: FacetSelectProps) {
  if (options.length === 0) return null;
  return (
    <span className="versus-facet">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => {
          onChange(e.target.value === '' ? null : e.target.value);
        }}
      >
        <option value="">{any}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.value} ({o.count})
          </option>
        ))}
      </select>
    </span>
  );
}

const GROUP_LABEL: Readonly<Record<VersusFilter['group'], string>> = {
  all: 'Everyone',
  Kage: 'Kage',
  Jōnin: 'Jōnin',
  Chūnin: 'Chūnin',
  Genin: 'Genin',
  Foes: 'Foes',
};

interface FiltersProps {
  readonly facets: RosterBrowse;
  readonly filter: VersusFilter;
  readonly onFilter: (filter: VersusFilter) => void;
}

/** Rank as tabs, the rest as drop-downs that offer only what still finds someone, and a search. */
function Filters({ facets, filter, onFilter }: FiltersProps) {
  return (
    <div className="versus-filters">
      <div className="versus-ranks" role="group" aria-label="Rank">
        {facets.groups.map((g) => (
          <button
            key={g.value}
            type="button"
            className={g.value === filter.group ? 'versus-rank on' : 'versus-rank'}
            aria-pressed={g.value === filter.group}
            onClick={() => {
              onFilter(withGroup(filter, g.value));
            }}
          >
            {GROUP_LABEL[g.value]} <small>{g.count}</small>
          </button>
        ))}
      </div>
      <input
        type="search"
        className="versus-search"
        aria-label="Search by name"
        placeholder="Search by name, clan or kind"
        value={filter.query}
        onChange={(e) => {
          onFilter({ ...filter, query: e.target.value });
        }}
      />
      <div className="versus-facets">
        <FacetSelect
          id="versus-village"
          label="Village"
          any="Any village"
          options={facets.villages}
          value={filter.village}
          onChange={(village) => {
            onFilter({ ...filter, village });
          }}
        />
        <FacetSelect
          id="versus-clan"
          label="Clan"
          any="Any clan"
          options={facets.clans}
          value={filter.clan}
          onChange={(clan) => {
            onFilter({ ...filter, clan });
          }}
        />
        <FacetSelect
          id="versus-kind"
          label="Kind"
          any="Any kind"
          options={facets.kinds}
          value={filter.kind}
          onChange={(kind) => {
            onFilter({ ...filter, kind });
          }}
        />
        <FacetSelect
          id="versus-grade"
          label="Power"
          any="Any power"
          options={facets.grades}
          value={filter.grade}
          onChange={(grade) => {
            const picked = facets.grades.find((g) => g.value === grade);
            onFilter({ ...filter, grade: picked?.value ?? null });
          }}
        />
        <span className="versus-facet">
          <label htmlFor="versus-sort">Sort</label>
          <select
            id="versus-sort"
            value={filter.sort}
            onChange={(e) => {
              const picked = facets.sorts.find((o) => o.value === e.target.value);
              if (picked) onFilter({ ...filter, sort: picked.value });
            }}
          >
            {facets.sorts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </span>
      </div>
    </div>
  );
}

/** "Jōnin of Konohagakure, Hatake clan"; a foe by their kind. */
function rowLine(f: VersusFighter): string {
  if (!f.village) return f.title;
  const clan = f.clan ? `, ${f.clan} clan` : '';
  return `${f.title} of ${f.village}${clan}`;
}

const STANDING_STAMP: Readonly<Record<Exclude<Standing, null>, string>> = {
  side: 'Your side',
  foes: 'Facing',
};

interface RowProps {
  readonly fighter: VersusFighter;
  readonly focused: boolean;
  readonly standing: Standing;
  readonly onFocus: (id: string) => void;
}

function FighterRow({ fighter, focused, standing, onFocus }: RowProps) {
  return (
    <li>
      <button
        type="button"
        className={focused ? 'versus-row on' : 'versus-row'}
        aria-current={focused ? 'true' : undefined}
        aria-label={`${fighter.name}, ${rowLine(fighter)}, fighting power ${fighter.grade}${standing ? `, ${STANDING_STAMP[standing].toLowerCase()}` : ''}`}
        onClick={() => {
          onFocus(fighter.id);
        }}
      >
        <span className="versus-face" aria-hidden="true">
          {fighter.look ? (
            <Portrait appearance={fighter.look} size={40} framing="face" />
          ) : (
            fighter.name.charAt(0)
          )}
        </span>
        <span className="versus-row-name">
          <b>{fighter.name}</b>
          <small>{rowLine(fighter)}</small>
        </span>
        {standing && <span className="badge">{STANDING_STAMP[standing]}</span>}
        <GradeBadge grade={fighter.grade} />
      </button>
    </li>
  );
}

interface RosterBrowserProps {
  readonly roster: readonly VersusFighter[];
  readonly filter: VersusFilter;
  readonly onFilter: (filter: VersusFilter) => void;
  readonly focusedId: string | null;
  readonly standingOf: (id: string) => Standing;
  readonly onFocus: (id: string) => void;
}

/** The roster, filtered: tap a fighter to read their profile. */
export function RosterBrowser(props: RosterBrowserProps) {
  const { roster, filter, onFilter, focusedId, standingOf, onFocus } = props;
  const browse = browseRoster(roster, filter);
  const { found } = browse;
  return (
    <section className="versus-browser" aria-label="Fighters">
      <Filters facets={browse} filter={filter} onFilter={onFilter} />
      <p className="versus-found muted" aria-live="polite">
        {found.length === 1 ? 'One fighter' : `${found.length} fighters`}
        {browse.filtered && (
          <button
            type="button"
            className="btn ghost small"
            onClick={() => {
              onFilter({ ...OPEN_FILTER, sort: filter.sort });
            }}
          >
            Clear filters
          </button>
        )}
      </p>
      <ul className="versus-list">
        {found.map((f) => (
          <FighterRow
            key={f.id}
            fighter={f}
            focused={f.id === focusedId}
            standing={standingOf(f.id)}
            onFocus={onFocus}
          />
        ))}
      </ul>
      {found.length === 0 && <p className="muted">No one fits. Loosen a filter.</p>}
    </section>
  );
}
