import { useMemo } from 'react';

import { versusProfile, type VersusProfile } from '@/game';

import { useHoverPreview } from '../../layout/useHoverPreview';
import { useKeys } from '../../layout/useKeys';
import { FighterProfile } from './FighterProfile';
import { RosterBrowser } from './RosterBrowser';
import { BothSides, GroundPicker, StartBout, WorldPicker } from './SetupParts';
import { placeLabel, slotLabel, type Slot } from './SideSlots';
import type { VersusChoice, VersusSetupState } from './useVersusSetup';

const YOU: Slot = { side: 'side', index: 0 };

interface DeskActionsProps {
  readonly setup: VersusSetupState;
  readonly slot: Slot;
  readonly profile: VersusProfile;
}

/** On a desk, the open profile's one action: put them in the chosen slot. */
function DeskActions({ setup, slot, profile }: DeskActionsProps) {
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

/** Enter starts the bout once it can start (the search box keeps its own Enter). */
function useFightKey(setup: VersusSetupState, onFight: (choice: VersusChoice) => void): void {
  const { ctx, side, foes, ground, problem } = setup;
  useKeys(
    {
      Enter:
        ctx && problem === null
          ? () => {
              onFight({ ctx, side, foes, ground, watch: false });
            }
          : undefined,
    },
    true,
  );
}

/**
 * On a desk, everything at once and in view: the bout down the left (sides, ground, start), the
 * roster in the middle and a profile on the right, each scrolling on its own. The profile is
 * whoever is pointed at in the roster, else whoever was tapped, else whoever stands in the slot
 * being chosen for, so it is never empty; it can be put in that slot from there.
 */
export function VersusDesk({
  setup,
  onFight,
}: {
  readonly setup: VersusSetupState;
  readonly onFight: (choice: VersusChoice) => void;
}) {
  const slot = setup.slot ?? YOU;
  const hover = useHoverPreview();
  useFightKey(setup, onFight);
  const pickedId = setup.focusId ?? setup.idAt(slot);
  const shownId = hover.previewId ?? pickedId;
  // A preview is only a glance: the button to choose them waits until they are clicked.
  const previewing = shownId !== pickedId;
  const { ctx } = setup;
  const profile = useMemo(
    () => (ctx && shownId ? versusProfile(ctx, shownId) : null),
    [ctx, shownId],
  );
  return (
    <div className="versus-desk">
      <aside className="versus-plan" aria-label="The bout">
        <WorldPicker setup={setup} />
        <BothSides setup={setup} active={slot} onOpen={setup.openSlot} />
        <GroundPicker setup={setup} />
        <div className="versus-start">
          <StartBout setup={setup} onFight={onFight} />
          <p className="key-note">Enter fights.</p>
        </div>
      </aside>
      <RosterBrowser
        roster={setup.roster}
        filter={setup.filter}
        onFilter={setup.setFilter}
        focusedId={pickedId}
        stampOf={setup.stampOf}
        onFocus={setup.setFocusId}
        previewFor={hover.handlersFor}
      />
      <div className="versus-pane">
        {profile ? (
          <FighterProfile profile={profile}>
            {previewing ? (
              <p className="muted">Click them in the list to choose them.</p>
            ) : (
              <DeskActions setup={setup} slot={slot} profile={profile} />
            )}
          </FighterProfile>
        ) : (
          <p className="muted">
            Choose a fighter for {slotLabel(slot).toLowerCase()} from the list to read them here.
          </p>
        )}
      </div>
    </div>
  );
}
