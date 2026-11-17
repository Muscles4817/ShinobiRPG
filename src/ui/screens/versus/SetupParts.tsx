import { VERSUS_GROUNDS } from '@/game';

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

/** The rules on trial a bout carries, as the setup has them ticked. */
export function trialsOf(setup: VersusSetupState) {
  const { dodgeLeaps, foesThink, rushing, handSigns, standFirm } = setup;
  return { dodgeLeaps, foesThink, rushing, handSigns, standFirm };
}

/** Rules on trial: off unless turned on here, for this bout only. */
export function TrialRules({ setup }: { readonly setup: VersusSetupState }) {
  return (
    <section className="versus-slot versus-trial">
      <span className="versus-trial-head">Rules on trial</span>
      <label className="versus-trial-rule" htmlFor="versus-dodge-leaps">
        <input
          id="versus-dodge-leaps"
          type="checkbox"
          checked={setup.dodgeLeaps}
          onChange={(e) => {
            setup.setDodgeLeaps(e.target.checked);
          }}
        />
        A Dodge leaps clear
      </label>
      <p className="muted">
        Anyone who slips an attack up close with a Dodge ready lands at mid range, clear of whoever
        threw it. It helps a fighter who wants distance and costs one who wants to stay close.
      </p>
      <label className="versus-trial-rule" htmlFor="versus-foes-think">
        <input
          id="versus-foes-think"
          type="checkbox"
          checked={setup.foesThink}
          onChange={(e) => {
            setup.setFoesThink(e.target.checked);
          }}
        />
        Foes think ahead
      </label>
      <p className="muted">
        The other side plans each round by playing out its options before it moves, as far ahead as
        its wits allow, and keeps to the plan unless it breaks. Rounds take a moment longer to
        start.
      </p>
      <label className="versus-trial-rule" htmlFor="versus-rushing">
        <input
          id="versus-rushing"
          type="checkbox"
          checked={setup.rushing}
          onChange={(e) => {
            setup.setRushing(e.target.checked);
          }}
        />
        Taijutsu fighters strike as they rush in
      </label>
      <p className="muted">
        A step that gets a taijutsu fighter in close carries a lighter blow as they land, so closing
        in no longer hands the foe a free turn. Closing on someone faster is still hard.
      </p>
      <label className="versus-trial-rule" htmlFor="versus-hand-signs">
        <input
          id="versus-hand-signs"
          type="checkbox"
          checked={setup.handSigns}
          onChange={(e) => {
            setup.setHandSigns(e.target.checked);
          }}
        />
        Hand signs can be broken up close
      </label>
      <p className="muted">
        With a foe close enough to touch, a technique that needs hand signs is a contest: speed and
        chakra control against their speed and taijutsu. Lost, the seals come apart.
      </p>
      <label className="versus-trial-rule" htmlFor="versus-stand-firm">
        <input
          id="versus-stand-firm"
          type="checkbox"
          checked={setup.standFirm}
          onChange={(e) => {
            setup.setStandFirm(e.target.checked);
          }}
        />
        Hold your ground against blasts
      </label>
      <p className="muted">
        A wide blast may fail to throw someone strong, big or braced, as a knock may fail to take
        hold. A blast far stronger than they are still throws them.
      </p>
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
  const trials = trialsOf(setup);
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
