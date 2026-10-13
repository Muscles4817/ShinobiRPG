import type { CombatantView, RangeBand, ScoutingRead } from '@/game';

import { HealthBar } from './HealthBar';
import type { HealthPulse } from './useHealthPulses';

/**
 * Both sides as they stand, read left to right: your back row, your front row, the distance
 * between the sides, their front row, their back row. Each fighter is a seal you can tap to
 * read them; a foe likely to act before you says so.
 */

const BANDS: readonly RangeBand[] = ['close', 'mid', 'far'];

const PACE_TAG = { faster: 'Faster', slower: 'Slower', even: null } as const;

/** A column with more fighters than this pairs them up, so the strip stays short. */
const COLUMN_MAX = 3;

/**
 * The word that tells a fighter apart, and their seal's letter: "Bandit Archer" is Archer (A),
 * "Hungry Ghost 2" is Ghost 2 (G2), "Kaen" is Kaen (K).
 */
export function shortName(name: string): { readonly label: string; readonly mark: string } {
  const words = name.split(' ');
  const last = words.at(-1) ?? name;
  const numbered = /^\d+$/.test(last) && words.length > 1;
  const word = numbered ? (words.at(-2) ?? last) : last;
  return {
    label: numbered ? `${word} ${last}` : word,
    mark: numbered ? `${word.charAt(0)}${last}` : word.charAt(0),
  };
}

interface FormationProps {
  readonly fighters: readonly CombatantView[];
  readonly range: RangeBand | undefined;
  readonly reads: Readonly<Record<string, ScoutingRead>>;
  readonly pulses: Readonly<Record<string, HealthPulse>>;
  readonly selected: string | null;
  readonly onSelect: (id: string) => void;
}

type TokenProps = Omit<FormationProps, 'fighters' | 'range'> & { readonly fighter: CombatantView };

function Token({ fighter: f, reads, pulses, selected, onSelect }: TokenProps) {
  const pace = PACE_TAG[reads[f.id]?.pace ?? 'even'];
  const short = shortName(f.name);
  const state = [f.health <= 0 && 'down', f.targetable === false && 'hidden']
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      className={`token ${f.side} ${state}`}
      aria-pressed={f.id === selected}
      aria-label={`${f.name}${f.health <= 0 ? ', down' : ''}`}
      onClick={() => {
        onSelect(f.id);
      }}
    >
      <span className="token-seal" aria-hidden="true">
        {short.mark}
        {pace && <span className={`pace ${pace.toLowerCase()}`}>{pace}</span>}
      </span>
      <span className="token-name">{short.label}</span>
      <HealthBar fighter={f} pulse={pulses[f.id]} mine={f.side === 'player'} />
    </button>
  );
}

type ColumnProps = Omit<TokenProps, 'fighter'> & {
  /** "Their back row", for screen readers; the column shows only `row`. */
  readonly label: string;
  readonly row: 'Back' | 'Front';
  readonly fighters: readonly CombatantView[];
};

function Column({ label, row, fighters, ...rest }: ColumnProps) {
  if (fighters.length === 0) return null;
  return (
    <div
      className={fighters.length > COLUMN_MAX ? 'formation-col paired' : 'formation-col'}
      role="group"
      aria-label={label}
    >
      <span className="formation-row">{row}</span>
      {fighters.map((f) => (
        <Token key={f.id} fighter={f} {...rest} />
      ))}
    </div>
  );
}

function Gap({ range }: { readonly range: RangeBand | undefined }) {
  if (!range) return <div className="formation-gap" />;
  return (
    <div className="formation-gap" role="img" aria-label={`Fighting at ${range} range`}>
      <span className="gap-label">{range.charAt(0).toUpperCase() + range.slice(1)} range</span>
      <span className="gap-ruler" aria-hidden="true">
        {BANDS.map((b) => (
          <i key={b} className={b === range ? 'on' : undefined} />
        ))}
      </span>
    </div>
  );
}

export function Formation({ fighters, range, ...rest }: FormationProps) {
  const inRow = (side: CombatantView['side'], back: boolean) =>
    fighters.filter((f) => f.side === side && (f.row === 'back') === back);
  return (
    <section className="formation" aria-label="Both sides">
      <Column label="Your back row" row="Back" fighters={inRow('player', true)} {...rest} />
      <Column label="Your front row" row="Front" fighters={inRow('player', false)} {...rest} />
      <Gap range={range} />
      <Column label="Their front row" row="Front" fighters={inRow('enemy', false)} {...rest} />
      <Column label="Their back row" row="Back" fighters={inRow('enemy', true)} {...rest} />
    </section>
  );
}
