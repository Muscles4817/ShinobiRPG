import { VERSUS_GROUNDS, VERSUS_STARTS } from '@/game';

import { SideSlots, type Slot } from './SideSlots';
import type { VersusChoice, VersusSetupState } from './useVersusSetup';

/** The world the fighters come from, when there is more than one. */
export function WorldPicker({ setup }: { readonly setup: VersusSetupState }) {
  if (setup.packs.length < 2) return null;
  return (
    <section className="versus-slot">
      <label htmlFor="versus-world">World</label>
      <select
        id="versus-world"
        value={setup.packId}
        onChange={(e) => {
          setup.setPackId(e.target.value);
          setup.openSlot(null);
        }}
      >
        {setup.packs.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </section>
  );
}

/** Where the bout is fought, with what the ground changes. */
export function GroundPicker({ setup }: { readonly setup: VersusSetupState }) {
  const chosen = VERSUS_GROUNDS.find((g) => g.id === setup.ground);
  return (
    <section className="versus-slot">
      <label htmlFor="versus-ground">Ground</label>
      <select
        id="versus-ground"
        value={setup.ground}
        onChange={(e) => {
          const picked = VERSUS_GROUNDS.find((g) => g.id === e.target.value);
          if (picked) setup.setGround(picked.id);
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

/** Where the bout starts, as the setup has it. */
export function openingOf(setup: VersusSetupState) {
  return { start: setup.start };
}

/** Where the bout starts, with what starting there means. */
export function StartPicker({ setup }: { readonly setup: VersusSetupState }) {
  const chosen = VERSUS_STARTS.find((s) => s.id === setup.start);
  return (
    <section className="versus-slot">
      <label htmlFor="versus-start">Starting distance</label>
      <select
        id="versus-start"
        value={setup.start}
        onChange={(e) => {
          const picked = VERSUS_STARTS.find((s) => s.id === e.target.value);
          if (picked) setup.setStart(picked.id);
        }}
      >
        {VERSUS_STARTS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      {chosen && <p className="muted">{chosen.line}</p>}
    </section>
  );
}

/** Both sides, each slot opened to read or change its fighter, and the swap between them. */
export function BothSides({
  setup,
  active,
  onOpen,
}: {
  readonly setup: VersusSetupState;
  readonly active: Slot | null;
  readonly onOpen: (slot: Slot) => void;
}) {
  return (
    <>
      <SideSlots
        heading="Your side"
        side="side"
        addLabel="Add an ally"
        roster={setup.roster}
        ids={setup.side}
        active={active}
        onOpen={onOpen}
        onRemove={setup.remove}
      />
      <button type="button" className="btn ghost versus-swap" onClick={setup.swap}>
        Swap sides
      </button>
      <SideSlots
        heading="The other side"
        side="foes"
        addLabel="Add an opponent"
        roster={setup.roster}
        ids={setup.foes}
        active={active}
        onOpen={onOpen}
        onRemove={setup.remove}
      />
    </>
  );
}

/** Why the bout can't start, or the two ways to start it. */
export function StartBout({
  setup,
  onFight,
}: {
  readonly setup: VersusSetupState;
  readonly onFight: (choice: VersusChoice) => void;
}) {
  const { ctx, side, foes, ground, problem } = setup;
  const trials = openingOf(setup);
  const start = (watch: boolean) => {
    if (ctx) onFight({ ctx, side, foes, ground, watch, ...trials });
  };
  return (
    <>
      {problem && <p className="versus-problem">{problem}</p>}
      <nav className="menu-options" aria-label="Start the bout">
        <button
          type="button"
          className="btn wide"
          disabled={!ctx || problem !== null}
          onClick={() => {
            start(false);
          }}
        >
          Fight
        </button>
        <button
          type="button"
          className="btn ghost wide"
          disabled={!ctx || problem !== null}
          onClick={() => {
            start(true);
          }}
        >
          Watch them fight
        </button>
      </nav>
      <p className="muted">Watching, both sides fight on their own, round after round.</p>
    </>
  );
}
