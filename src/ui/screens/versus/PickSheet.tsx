import { FighterProfile } from './FighterProfile';
import { RosterBrowser } from './RosterBrowser';
import { slotLabel, type Slot } from './SideSlots';
import type { VersusSetupState } from './useVersusSetup';

/** What can be done with the open profile on a phone: choose them, keep them, or look again. */
function SheetActions({ setup, slot }: { readonly setup: VersusSetupState; readonly slot: Slot }) {
  const { profile } = setup;
  if (!profile) return null;
  const name = profile.fighter.name;
  const current = setup.idAt(slot);
  const backToList = (
    <button
      type="button"
      className="btn ghost"
      onClick={() => {
        setup.setFocusId(null);
      }}
    >
      {current === profile.fighter.id ? 'Choose someone else' : 'Back to the list'}
    </button>
  );
  if (current === profile.fighter.id) {
    return (
      <>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setup.openSlot(null);
          }}
        >
          Keep {name}
        </button>
        {backToList}
      </>
    );
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
          setup.openSlot(null);
        }}
      >
        Choose {name}
      </button>
      {backToList}
      {problem && <p className="versus-problem">{problem}</p>}
    </>
  );
}

/**
 * On a phone, choosing a fighter takes the whole screen: the filtered roster, then the profile
 * of whoever is tapped, with the choice beneath their name.
 */
export function PickSheet({
  setup,
  slot,
}: {
  readonly setup: VersusSetupState;
  readonly slot: Slot;
}) {
  const label = slotLabel(slot);
  return (
    <div className="versus-sheet" role="dialog" aria-modal="true" aria-label={label}>
      <header className="versus-sheet-head">
        <h2>{label}</h2>
        <button
          type="button"
          className="btn ghost small"
          onClick={() => {
            setup.openSlot(null);
          }}
        >
          Close
        </button>
      </header>
      {setup.profile ? (
        <FighterProfile profile={setup.profile}>
          <SheetActions setup={setup} slot={slot} />
        </FighterProfile>
      ) : (
        <RosterBrowser
          roster={setup.roster}
          filter={setup.filter}
          onFilter={setup.setFilter}
          focusedId={setup.idAt(slot)}
          standingOf={setup.standingOf}
          onFocus={setup.setFocusId}
        />
      )}
    </div>
  );
}
