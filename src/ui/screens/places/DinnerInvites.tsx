import { useState } from 'react';

import type { DinnerInvite, GameAction } from '@/game';

interface DinnerInvitesProps {
  readonly invites: readonly DinnerInvite[];
  /** Why nobody can come round right now; shown once instead of on every guest. */
  readonly blocker: string | null;
  readonly perform: (action: GameAction) => void;
}

/** "Invite someone": folds open into the people you could cook this for tonight. */
export function DinnerInvites({ invites, blocker, perform }: DinnerInvitesProps) {
  const [open, setOpen] = useState(false);
  if (blocker !== null) {
    return (
      <div className="invites">
        <button type="button" className="btn ghost small" disabled title={blocker}>
          Invite someone
        </button>
        <small className="muted">{blocker}</small>
      </div>
    );
  }
  if (invites.length === 0) return null;
  return (
    <div className="invites">
      <button
        type="button"
        className="btn ghost small"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
        }}
      >
        Invite someone
      </button>
      {open && (
        <ul className="invite-list">
          {invites.map((g) => (
            <li key={g.guestId}>
              <button
                type="button"
                className="invite"
                disabled={g.blocker !== null}
                onClick={() => {
                  perform(g.action);
                }}
              >
                <b>{g.name}</b>
                <small>
                  {g.stage}
                  {g.favourite ? ' · their favourite' : ''}
                </small>
                {g.blocker && <small className="blocker">{g.blocker}</small>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
