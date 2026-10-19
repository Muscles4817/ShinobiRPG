import { VERSUS_SIDE_MAX, type VersusFighter } from '@/game';

import { Portrait } from '../../art/Portrait';
import { GradeBadge } from '../../components/Grade';

export type SideKey = 'side' | 'foes';

/** A place on one side; `index` equal to the side's length is a fighter still to be added. */
export interface Slot {
  readonly side: SideKey;
  readonly index: number;
}

/** What each slot is called, by side and position: "You fight as", "Ally 2", "Opponent 1". */
export function slotLabel({ side, index }: Slot): string {
  if (side === 'foes') return `Opponent ${index + 1}`;
  return index === 0 ? 'You fight as' : `Ally ${index + 1}`;
}

/** The button that puts someone in a slot: "Fight as Kakashi", "Face Zabuza as opponent 1". */
export function placeLabel(slot: Slot, name: string): string {
  if (slot.side === 'foes') return `Face ${name} as ${slotLabel(slot).toLowerCase()}`;
  return slot.index === 0
    ? `Fight as ${name}`
    : `Bring ${name} as ${slotLabel(slot).toLowerCase()}`;
}

interface TokenProps {
  readonly slot: Slot;
  readonly fighter: VersusFighter | null;
  readonly active: boolean;
  readonly onOpen: (slot: Slot) => void;
}

/** One fighter on a side, as a card to tap: their face, name and power. */
function SlotToken({ slot, fighter, active, onOpen }: TokenProps) {
  const label = slotLabel(slot);
  return (
    <button
      type="button"
      className={active ? 'versus-token on' : 'versus-token'}
      aria-label={`${label}: ${fighter?.name ?? 'choose a fighter'}`}
      aria-current={active ? 'true' : undefined}
      onClick={() => {
        onOpen(slot);
      }}
    >
      <span className="versus-face" aria-hidden="true">
        {fighter?.look ? (
          <Portrait appearance={fighter.look} size={40} framing="face" />
        ) : (
          (fighter?.name.charAt(0) ?? '?')
        )}
      </span>
      <span className="versus-row-name">
        <small>{label}</small>
        <b>{fighter?.name ?? 'Choose a fighter'}</b>
      </span>
      {fighter && <GradeBadge grade={fighter.grade} />}
    </button>
  );
}

interface SideSlotsProps {
  readonly heading: string;
  readonly side: SideKey;
  readonly addLabel: string;
  readonly roster: readonly VersusFighter[];
  readonly ids: readonly string[];
  /** The slot being chosen for, if it is on this side. */
  readonly active: Slot | null;
  readonly onOpen: (slot: Slot) => void;
  readonly onRemove: (slot: Slot) => void;
}

/** One side of the bout: one to four fighters, each opened to change or read them. */
export function SideSlots(props: SideSlotsProps) {
  const { heading, side, addLabel, roster, ids, active, onOpen, onRemove } = props;
  const full = ids.length >= VERSUS_SIDE_MAX;
  const adding = active?.side === side && active.index === ids.length;
  return (
    <section className="versus-side" aria-label={heading}>
      <h2>{heading}</h2>
      {ids.map((id, index) => {
        const slot = { side, index };
        const fighter = roster.find((f) => f.id === id) ?? null;
        return (
          <div key={index} className="versus-token-row">
            <SlotToken
              slot={slot}
              fighter={fighter}
              active={active?.side === side && active.index === index}
              onOpen={onOpen}
            />
            {index > 0 && (
              <button
                type="button"
                className="btn ghost small"
                aria-label={`Remove ${fighter?.name ?? 'this fighter'}`}
                onClick={() => {
                  onRemove(slot);
                }}
              >
                Remove
              </button>
            )}
          </div>
        );
      })}
      {adding && (
        <SlotToken slot={{ side, index: ids.length }} fighter={null} active onOpen={onOpen} />
      )}
      {!adding && (
        <button
          type="button"
          className="btn ghost"
          disabled={full}
          onClick={() => {
            onOpen({ side, index: ids.length });
          }}
        >
          {full ? `A side fields at most ${VERSUS_SIDE_MAX}` : addLabel}
        </button>
      )}
    </section>
  );
}
