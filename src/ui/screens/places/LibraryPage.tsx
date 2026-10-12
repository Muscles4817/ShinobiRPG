import { headerView, libraryView, type LibraryView, type Stack } from '@/game';

import { Banner } from '../../components/Banner';
import type { PlaceProps } from '../types';
import { ScrollDesk } from './ScrollDesk';
import { ScrollRow } from './ScrollRow';

/** One bay of the stacks: an art's scrolls lying on a wooden shelf. */
function Shelf({ stack, perform }: { stack: Stack; perform: PlaceProps['perform'] }) {
  return (
    <section className={`stack d-${stack.discipline}`} aria-label={stack.label}>
      <h2>{stack.label}</h2>
      <div className="shelf">
        {stack.scrolls.map((s) => (
          <ScrollRow key={s.id} scroll={s} perform={perform} />
        ))}
      </div>
    </section>
  );
}

/** The lattice across the stacks while your rank keeps you out, and what lets you in. */
function Lattice({ view }: { view: LibraryView }) {
  return (
    <section className="lattice" aria-label="Restricted stacks">
      <span className="lattice-seal" aria-hidden="true">
        禁
      </span>
      <h2>Restricted stacks</h2>
      <p className="story">
        An archivist looks up from her ledger and shakes her head before you reach the lattice.
      </p>
      <p className="blocker">{view.locked}</p>
      <p className="muted small">
        {view.unread === 1
          ? 'One scroll waits behind the lattice.'
          : `${view.unread} scrolls wait behind the lattice.`}
      </p>
    </section>
  );
}

/** The library: shelves of restricted scrolls by art, and a desk for the ones you own. */
export function LibraryPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = libraryView(state, ctx);
  const header = headerView(state, ctx);
  if (!view) return null;
  return (
    <>
      <Banner
        title={view.name}
        subtitle={`Study costs ${view.energyCost} energy and one time slot`}
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="page stacks">
        {view.locked !== null ? (
          <Lattice view={view} />
        ) : (
          <>
            {view.studying.length > 0 && (
              <section className="stack open-on-desk" aria-label="On your desk">
                <h2>On your desk</h2>
                <div className="rack">
                  {view.studying.map((s) => (
                    <ScrollRow key={s.id} scroll={s} perform={perform} />
                  ))}
                </div>
              </section>
            )}
            {view.stacks.map((stack) => (
              <Shelf key={stack.discipline} stack={stack} perform={perform} />
            ))}
            {view.unread === 0 && (
              <p className="story">You have read every scroll the stacks keep.</p>
            )}
            <ScrollDesk desk={view.desk} perform={perform} />
          </>
        )}
      </main>
    </>
  );
}
