import { loadoutView, type GameContext, type GameState } from '@/game';

import { Icon } from '../../art/Icon';
import type { PlaceProps } from '../types';

interface GearLockerProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: PlaceProps['perform'];
}

/** The chest: what you're wearing in each slot, and spare gear to swap in. */
export function GearLocker({ ctx, state, perform }: GearLockerProps) {
  const view = loadoutView(state, ctx);
  return (
    <section id="locker" className="locker" aria-label="Gear">
      <h2 className="label">Gear</h2>
      {view.total.length > 0 && (
        <p className="chips">
          {view.total.map((t) => (
            <span key={t} className="chip gain">
              {t}
            </span>
          ))}
        </p>
      )}
      {view.slots.map((slot) => (
        <div key={slot.slot} className="locker-slot">
          <span className="label">{slot.label}</span>
          {slot.worn ? (
            <div className="locker-row">
              <Icon id={slot.worn.icon} size={22} />
              <b>{slot.worn.name}</b>
              <small className="muted">{slot.worn.bonuses.join(' · ')}</small>
              {slot.takeOff && (
                <button
                  type="button"
                  className="btn ghost small"
                  disabled={slot.takeOff.blocker !== null}
                  onClick={() => {
                    if (slot.takeOff) perform(slot.takeOff.action);
                  }}
                >
                  Take off
                </button>
              )}
            </div>
          ) : (
            <small className="muted">Nothing. The shops in the village sell gear.</small>
          )}
          {slot.spares.map((g) => (
            <div key={g.id} className="locker-row spare">
              <Icon id={g.icon} size={22} />
              <span>{g.name}</span>
              <small className="muted">{g.bonuses.join(' · ')}</small>
              {g.equip && (
                <button
                  type="button"
                  className="btn small"
                  disabled={g.equip.blocker !== null}
                  onClick={() => {
                    if (g.equip) perform(g.equip.action);
                  }}
                >
                  Wear
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
      <div className="locker-slot">
        <span className="label">Pouch</span>
        {view.pouch.length === 0 && (
          <small className="muted">Empty. Fight tools are sold by the piece.</small>
        )}
        {view.pouch.map((t) => (
          <div key={t.id} className="locker-row">
            <Icon id={t.icon} size={22} />
            <b>{t.name}</b>
            <small className="muted num">×{t.count}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
