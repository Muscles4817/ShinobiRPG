import { headerView, tavernView } from '@/game';

import { Icon } from '../../art/Icon';
import { Banner } from '../../components/Banner';
import { Avatar } from '../../components/Faces';
import type { PlaceProps } from '../types';
import { FoodCard } from './FoodCard';

/** The izakaya: a lantern-lit counter, tonight's regulars, the menu and the talk. */
export function TavernPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = tavernView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner title={view.name} slot={header.slot} onBack={onBack} backLabel={header.location} />
      <main className="page tavern">
        <p className="tavern-keeper">
          <Icon id="sake" size={20} /> {view.keeper}
        </p>
        {view.closed ? (
          <p className="tavern-closed">
            {view.closed} The shutters are down and the lantern is out.
          </p>
        ) : (
          <>
            <section className="tavern-crowd" aria-label="Tonight's crowd">
              <h2 className="label">Tonight’s crowd</h2>
              {view.crowd.length === 0 ? (
                <p className="muted">Nobody you know is in yet.</p>
              ) : (
                <div className="crowd-row">
                  {view.crowd.map((f) => (
                    <span key={f.id} className="crowd-face">
                      <Avatar face={f} size={40} />
                      <small>{f.name}</small>
                    </span>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="btn small"
                disabled={view.round.blocker !== null}
                onClick={() => {
                  perform(view.round.action);
                }}
              >
                Stand everyone a round
              </button>
              <span className="chips">
                <span className="chip cost">−{view.round.cost} ryo</span>
                <span className="chip gain">Bonds +{view.round.bond} each</span>
              </span>
              {view.round.blocker && <small className="blocker">{view.round.blocker}</small>}
            </section>
            <section aria-label="Menu">
              <h2 className="label">Menu</h2>
              <div className="stall-items">
                {view.menu.map((item) => (
                  <FoodCard key={item.id} item={item} perform={perform} />
                ))}
              </div>
            </section>
            {view.overheard.length > 0 && (
              <section className="overheard" aria-label="Overheard">
                <h2 className="label">Overheard at the counter</h2>
                <ul>
                  {view.overheard.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}
