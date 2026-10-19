import { FighterProfile } from './FighterProfile';
import { RosterBrowser } from './RosterBrowser';
import { BothSides, GroundPicker, StartBout, WorldPicker } from './SetupParts';
import { placeLabel, slotLabel, type Slot } from './SideSlots';
import type { VersusChoice, VersusSetupState } from './useVersusSetup';

const YOU: Slot = { side: 'side', index: 0 };

/** On a desk, the open profile's one action: put them in the chosen slot. */
function DeskActions({ setup, slot }: { readonly setup: VersusSetupState; readonly slot: Slot }) {
  const { profile } = setup;
  if (!profile) return null;
  if (setup.idAt(slot) === profile.fighter.id) {
    return <p className="muted">Chosen: {slotLabel(slot).toLowerCase()}.</p>;
  }
  const problem = setup.placeProblem(slot, profile.fighter.id);
  return (
    <>
      <button
        type="button"
        className="btn"
        disabled={problem !== null}
        onClick={() => {
          setup.place(slot, profile.fighter.id);
        }}
      >
        {placeLabel(slot, profile.fighter.name)}
      </button>
      {problem && <p className="versus-problem">{problem}</p>}
    </>
  );
}

/**
 * On a desk, everything at once: the bout down the left (sides, ground, start), the roster in
 * the middle and the profile of whoever is tapped on the right, ready to be put in the slot
 * that is chosen on the left.
 */
export function VersusDesk({
  setup,
  onFight,
}: {
  readonly setup: VersusSetupState;
  readonly onFight: (choice: VersusChoice) => void;
}) {
  const slot = setup.slot ?? YOU;
  return (
    <div className="versus-desk">
      <aside className="versus-plan" aria-label="The bout">
        <WorldPicker setup={setup} />
        <BothSides setup={setup} active={slot} onOpen={setup.openSlot} />
        <GroundPicker setup={setup} />
        <StartBout setup={setup} onFight={onFight} />
      </aside>
      <RosterBrowser
        roster={setup.roster}
        filter={setup.filter}
        onFilter={setup.setFilter}
        focusedId={setup.focusId ?? setup.idAt(slot)}
        standingOf={setup.standingOf}
        onFocus={setup.setFocusId}
      />
      <div className="versus-pane">
        {setup.profile ? (
          <FighterProfile profile={setup.profile}>
            <DeskActions setup={setup} slot={slot} />
          </FighterProfile>
        ) : (
          <p className="muted">
            Choose a slot on the left, then pick a fighter from the list to read them here.
          </p>
        )}
      </div>
    </div>
  );
}
