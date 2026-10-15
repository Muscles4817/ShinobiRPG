import { useMemo, useState } from 'react';

import {
  contextForPack,
  packChoices,
  VERSUS_GROUPS,
  versusRoster,
  type GameContext,
  type VersusFighter,
} from '@/game';

import { GradeBadge } from '../../components/Grade';

/** The fan pack is the one built for versus play; any pack works. */
const PREFERRED_PACK = 'naruto';

export interface VersusChoice {
  readonly ctx: GameContext;
  readonly youId: string;
  readonly foeId: string;
}

interface PickerProps {
  readonly label: string;
  readonly roster: readonly VersusFighter[];
  readonly value: string;
  readonly onChange: (id: string) => void;
}

/** One side's fighter: a list grouped by rank, and the one chosen as a card. */
function FighterPicker({ label, roster, value, onChange }: PickerProps) {
  const chosen = roster.find((f) => f.id === value);
  const id = `versus-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <section className="versus-side">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      >
        {VERSUS_GROUPS.map((group) => {
          const fighters = roster.filter((f) => f.group === group);
          return fighters.length === 0 ? null : (
            <optgroup key={group} label={group}>
              {fighters.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}, {f.title}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
      {chosen && (
        <div className="versus-card">
          <div>
            <b>{chosen.name}</b>
            <small>{chosen.title}</small>
          </div>
          <span className="versus-power">
            Fighting power <GradeBadge grade={chosen.grade} />
          </span>
        </div>
      )}
    </section>
  );
}

function defaultPack(): string {
  const packs = packChoices();
  return (packs.find((p) => p.id === PREFERRED_PACK) ?? packs[0])?.id ?? '';
}

interface VersusSetupProps {
  readonly initial: VersusChoice | null;
  readonly onFight: (choice: VersusChoice) => void;
  readonly onBack: () => void;
}

/** Choose a world and two fighters, then fight. */
export function VersusSetup({ initial, onFight, onBack }: VersusSetupProps) {
  const packs = useMemo(() => packChoices(), []);
  const [packId, setPackId] = useState(() => initial?.ctx.content.packId ?? defaultPack());
  const ctx = useMemo(() => contextForPack(packId), [packId]);
  const roster = useMemo(() => (ctx ? versusRoster(ctx) : []), [ctx]);
  const [youId, setYouId] = useState(initial?.youId ?? '');
  const [foeId, setFoeId] = useState(initial?.foeId ?? '');
  const has = (id: string) => roster.some((f) => f.id === id);
  const you = has(youId) ? youId : (roster[0]?.id ?? '');
  const foe = has(foeId) ? foeId : (roster[1]?.id ?? you);

  return (
    <main className="versus-setup">
      <header>
        <button type="button" className="btn ghost small" onClick={onBack}>
          Main menu
        </button>
        <h1>Versus</h1>
        <p className="muted">Two fighters as the world writes them, head to head.</p>
      </header>
      {packs.length > 1 && (
        <section className="versus-side">
          <label htmlFor="versus-world">World</label>
          <select
            id="versus-world"
            value={packId}
            onChange={(e) => {
              setPackId(e.target.value);
            }}
          >
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </section>
      )}
      <FighterPicker label="You fight as" roster={roster} value={you} onChange={setYouId} />
      <button
        type="button"
        className="btn ghost versus-swap"
        onClick={() => {
          setYouId(foe);
          setFoeId(you);
        }}
      >
        Swap sides
      </button>
      <FighterPicker label="Against" roster={roster} value={foe} onChange={setFoeId} />
      <button
        type="button"
        className="btn wide"
        disabled={!ctx || !you || !foe}
        onClick={() => {
          if (ctx) onFight({ ctx, youId: you, foeId: foe });
        }}
      >
        Fight
      </button>
    </main>
  );
}
