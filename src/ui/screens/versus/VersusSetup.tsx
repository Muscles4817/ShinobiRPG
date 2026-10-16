import { useMemo, useState } from 'react';

import {
  contextForPack,
  packChoices,
  VERSUS_GROUNDS,
  VERSUS_GROUPS,
  VERSUS_SIDE_MAX,
  versusProblem,
  versusRoster,
  type GameContext,
  type VersusFighter,
  type VersusGround,
} from '@/game';

import { GradeBadge } from '../../components/Grade';

/** The fan pack is the one built for versus play; any pack works. */
const PREFERRED_PACK = 'naruto';

export interface VersusChoice {
  readonly ctx: GameContext;
  /** Your side by roster id, you first. */
  readonly side: readonly string[];
  readonly foes: readonly string[];
  /** Where they fight. */
  readonly ground: VersusGround['id'];
  /** Only watch: your side fights on its own too. */
  readonly watch: boolean;
}

interface PickerProps {
  readonly label: string;
  readonly roster: readonly VersusFighter[];
  readonly value: string;
  readonly onChange: (id: string) => void;
  /** Absent for the one slot a side can't do without. */
  readonly onRemove?: () => void;
}

/** One fighter: a list grouped by rank, and the one chosen as a card. */
function FighterPicker({ label, roster, value, onChange, onRemove }: PickerProps) {
  const chosen = roster.find((f) => f.id === value);
  const id = `versus-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="versus-slot">
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
      {onRemove && (
        <button type="button" className="btn ghost small versus-remove" onClick={onRemove}>
          Remove {chosen?.name ?? 'this fighter'}
        </button>
      )}
    </div>
  );
}

interface SideProps {
  readonly heading: string;
  /** What each slot is called, by position: "You fight as", "Ally 2"… */
  readonly slotLabel: (index: number) => string;
  readonly addLabel: string;
  readonly roster: readonly VersusFighter[];
  readonly ids: readonly string[];
  readonly onChange: (ids: readonly string[]) => void;
}

/** One side of the bout: one to four fighters. */
function SideEditor({ heading, slotLabel, addLabel, roster, ids, onChange }: SideProps) {
  const full = ids.length >= VERSUS_SIDE_MAX;
  return (
    <section className="versus-side" aria-label={heading}>
      <h2>{heading}</h2>
      {ids.map((value, i) => (
        <FighterPicker
          key={i}
          label={slotLabel(i)}
          roster={roster}
          value={value}
          onChange={(id) => {
            onChange(ids.map((old, j) => (j === i ? id : old)));
          }}
          {...(i > 0
            ? {
                onRemove: () => {
                  onChange(ids.filter((_, j) => j !== i));
                },
              }
            : {})}
        />
      ))}
      <button
        type="button"
        className="btn ghost"
        disabled={full}
        onClick={() => {
          onChange([...ids, ids[ids.length - 1] ?? roster[0]?.id ?? '']);
        }}
      >
        {full ? `A side fields at most ${VERSUS_SIDE_MAX}` : addLabel}
      </button>
    </section>
  );
}

function defaultPack(): string {
  const packs = packChoices();
  return (packs.find((p) => p.id === PREFERRED_PACK) ?? packs[0])?.id ?? '';
}

/** Ids still in this world's roster; a side left empty gets the fallback fighter. */
function kept(ids: readonly string[], roster: readonly VersusFighter[], fallback: number) {
  const known = ids.filter((id) => roster.some((f) => f.id === id));
  const first = roster[fallback]?.id ?? roster[0]?.id;
  return known.length > 0 ? known : first ? [first] : [];
}

/** Where the bout is fought, with what the ground changes. */
function GroundPicker({
  value,
  onChange,
}: {
  readonly value: VersusGround['id'];
  readonly onChange: (ground: VersusGround['id']) => void;
}) {
  const chosen = VERSUS_GROUNDS.find((g) => g.id === value);
  return (
    <section className="versus-slot">
      <label htmlFor="versus-ground">Ground</label>
      <select
        id="versus-ground"
        value={value}
        onChange={(e) => {
          const picked = VERSUS_GROUNDS.find((g) => g.id === e.target.value);
          if (picked) onChange(picked.id);
        }}
      >
        {VERSUS_GROUNDS.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      {chosen && <p className="muted">{chosen.line}</p>}
    </section>
  );
}

interface VersusSetupProps {
  readonly initial: VersusChoice | null;
  readonly onFight: (choice: VersusChoice) => void;
  readonly onBack: () => void;
}

/** Choose a world and the two sides, one to four fighters each, then fight. */
export function VersusSetup({ initial, onFight, onBack }: VersusSetupProps) {
  const packs = useMemo(() => packChoices(), []);
  const [packId, setPackId] = useState(() => initial?.ctx.content.packId ?? defaultPack());
  const ctx = useMemo(() => contextForPack(packId), [packId]);
  const roster = useMemo(() => (ctx ? versusRoster(ctx) : []), [ctx]);
  const [sideIds, setSideIds] = useState<readonly string[]>(initial?.side ?? []);
  const [foeIds, setFoeIds] = useState<readonly string[]>(initial?.foes ?? []);
  const [ground, setGround] = useState<VersusGround['id']>(initial?.ground ?? 'arena');
  const side = kept(sideIds, roster, 0);
  const foes = kept(foeIds, roster, 1);
  const problem = ctx ? versusProblem(ctx, side, foes) : 'Choose a world.';

  return (
    <main className="versus-setup">
      <header>
        <button type="button" className="btn ghost small" onClick={onBack}>
          Main menu
        </button>
        <h1>Versus</h1>
        <p className="muted">Fighters as the world writes them, up to four a side.</p>
      </header>
      {packs.length > 1 && (
        <section className="versus-slot">
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
      <SideEditor
        heading="Your side"
        slotLabel={(i) => (i === 0 ? 'You fight as' : `Ally ${i + 1}`)}
        addLabel="Add an ally"
        roster={roster}
        ids={side}
        onChange={setSideIds}
      />
      <button
        type="button"
        className="btn ghost versus-swap"
        onClick={() => {
          setSideIds(foes);
          setFoeIds(side);
        }}
      >
        Swap sides
      </button>
      <SideEditor
        heading="The other side"
        slotLabel={(i) => `Opponent ${i + 1}`}
        addLabel="Add an opponent"
        roster={roster}
        ids={foes}
        onChange={setFoeIds}
      />
      <GroundPicker value={ground} onChange={setGround} />
      {problem && <p className="versus-problem">{problem}</p>}
      <nav className="menu-options" aria-label="Start the bout">
        <button
          type="button"
          className="btn wide"
          disabled={!ctx || problem !== null}
          onClick={() => {
            if (ctx) onFight({ ctx, side, foes, ground, watch: false });
          }}
        >
          Fight
        </button>
        <button
          type="button"
          className="btn ghost wide"
          disabled={!ctx || problem !== null}
          onClick={() => {
            if (ctx) onFight({ ctx, side, foes, ground, watch: true });
          }}
        >
          Watch them fight
        </button>
      </nav>
      <p className="muted">Watching, both sides fight on their own, round after round.</p>
    </main>
  );
}
