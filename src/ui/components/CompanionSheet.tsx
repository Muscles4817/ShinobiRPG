import {
  companionSheet,
  type Choice,
  type CompanionSheet as CompanionSheetView,
  type CompanionStrip as Strip,
  type GameAction,
  type GameContext,
  type GameState,
} from '@/game';

import { BondMeter } from './BondMeter';

type CompanionGrowingView = CompanionSheetView['growing'];

interface CompanionSheetProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
  readonly onClose: () => void;
}

/** A care button: does its action, disabled with its reason. */
function Care({
  label,
  note,
  choice,
  perform,
}: {
  readonly label: string;
  readonly note?: string;
  readonly choice: Choice;
  readonly perform: (action: GameAction) => void;
}) {
  return (
    <button
      type="button"
      className="care-option"
      disabled={choice.blocker !== null}
      onClick={() => {
        perform(choice.action);
      }}
    >
      <b>{label}</b>
      {note && <small>{note}</small>}
    </button>
  );
}

/** Why any of a group of care buttons is shut, said once under them (a phone has no hover). */
function Why({ choices }: { readonly choices: readonly Choice[] }) {
  const why = choices.find((c) => c.blocker !== null)?.blocker ?? null;
  return why ? <p className="blocker">{why}</p> : null;
}

/** How it is growing: its stage, its body (time) and its skills (training), in words. */
function Growing({ growing }: { readonly growing: CompanionGrowingView }) {
  return (
    <section className="companion-growing" aria-label="Growing">
      <p className="story">{growing.stageLine}</p>
      <p className="muted small">
        {growing.builtFor}
        {growing.genes && ` ${growing.genes}`}
      </p>
      <h3>Body</h3>
      <p className="muted small">
        {growing.body.join(', ')}. {growing.grown ? 'Grown as it will grow.' : 'Still growing.'}
      </p>
      <h3>Learned</h3>
      <p className="muted small">{growing.learned.join(', ')}. Drilled at a training ground.</p>
    </section>
  );
}

/** What the bond opens: its arts, known and still to come, and the job checks it takes. */
function Arts({
  arts,
  role,
}: {
  readonly arts: CompanionSheetView['arts'];
  readonly role: string | null;
}) {
  if (arts.length === 0 && !role) return null;
  return (
    <section className="companion-arts" aria-label="What the bond opens">
      <h3>What the bond opens</h3>
      <ul className="arts">
        {arts.map((a) => (
          <li key={a.name}>
            <b>{a.name}</b>{' '}
            {a.known ? (
              <span className="badge">Knows it</span>
            ) : (
              <small className="muted">{a.note}</small>
            )}
          </li>
        ))}
      </ul>
      {role && <p className="muted small">{role}</p>}
    </section>
  );
}

/** Your companion's sheet: how it is, and feeding, play and medicine, wherever it is with you. */
export function CompanionSheet({ ctx, state, perform, onClose }: CompanionSheetProps) {
  const c = companionSheet(state, ctx);
  if (!c) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="sheet person-sheet paper-sheet enter companion-sheet"
        aria-label={c.name}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <header className="person-top">
          <div>
            <h2>{c.name}</h2>
            <p className="person-tags">
              <span className="badge">{c.kind}</span>
              <span className="badge">{c.growing.stage}</span>
            </p>
          </div>
        </header>
        <p className="companion-vitals">
          <small>Health</small>
          <HealthBar health={c.health} maxHealth={c.maxHealth} />
          {c.hunger && <small>{c.hunger}</small>}
          {c.stamp && <span className="place-badge">{c.stamp}</span>}
        </p>
        <BondMeter stageName={c.stageName} progress={c.progress} />
        {c.laidUp && <p className="story">{c.laidUp}</p>}
        <Growing growing={c.growing} />
        <Arts arts={c.arts} role={c.role} />
        <h3>Feed</h3>
        <div className="care-row">
          {c.foods.map((f) => (
            <Care key={f.label} label={f.label} note={f.note} choice={f} perform={perform} />
          ))}
        </div>
        <Why choices={c.foods} />
        <h3>Play</h3>
        <div className="care-row">
          {c.plays.map((p) => (
            <Care key={p.label} label={p.label} choice={p} perform={perform} />
          ))}
        </div>
        <Why choices={c.plays} />
        {c.medicine && (
          <>
            <h3>Medicine</h3>
            <p className="chips">
              <span className="chip num">
                {c.medicine.doses} {c.medicine.doses === 1 ? 'dose' : 'doses'} carried
              </span>
            </p>
            <div className="care-row">
              <Care label="Hide it in food" choice={c.medicine.hidden} perform={perform} />
              <Care label="Give it plainly" choice={c.medicine.plain} perform={perform} />
            </div>
            <Why choices={[c.medicine.hidden, c.medicine.plain]} />
          </>
        )}
        <footer className="profile-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

function HealthBar({ health, maxHealth }: { readonly health: number; readonly maxHealth: number }) {
  return (
    <span className="health-bar" role="img" aria-label={`Health ${health} of ${maxHealth}`}>
      <i style={{ width: `${Math.round((health / Math.max(1, maxHealth)) * 100)}%` }} />
    </span>
  );
}

/** Your companion at your side on the village screen: health, hunger, and what needs you. */
export function CompanionStrip({
  strip,
  onOpen,
}: {
  readonly strip: Strip;
  readonly onOpen: () => void;
}) {
  return (
    <button type="button" className="companion-strip" onClick={onOpen}>
      <b>{strip.name}</b>
      {strip.stage && <span className="badge">{strip.stage}</span>}
      <small>Health</small>
      <HealthBar health={strip.health} maxHealth={strip.maxHealth} />
      {strip.hunger && <small>{strip.hunger}</small>}
      {strip.stamp && <span className="place-badge">{strip.stamp}</span>}
    </button>
  );
}
