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

/** The lattice across the stacks while you have no permit, and what lets you in. */
function Lattice({ view }: { view: LibraryView }) {
  return (
    <section className="lattice" aria-label="The stacks">
      <span className="lattice-seal" aria-hidden="true">
        禁
      </span>
      <h2>No permit, no stacks</h2>
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

/**
 * The library: shelves of scrolls by art (the open shelves for a genin with a permit, every
 * stack for chūnin), the restricted stacks and the sealed archive (for jōnin) folded away, and a
 * desk for the scrolls you own.
 */
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
            {view.restricted > 0 && (
              <section className="lattice folded" aria-label="Restricted stacks">
                <h2>Restricted stacks</h2>
                <p className="muted small">
                  {view.restricted === 1
                    ? 'One more scroll waits behind the lattice, for chūnin and above.'
                    : `${view.restricted} more scrolls wait behind the lattice, for chūnin and above.`}
                </p>
              </section>
            )}
            {view.sealed > 0 && (
              <section className="lattice folded" aria-label="Sealed archive">
                <h2>Sealed archive</h2>
                <p className="muted small">
                  {view.sealed === 1
                    ? 'One scroll is kept under seal, for jōnin and above.'
                    : `${view.sealed} scrolls are kept under seal, for jōnin and above.`}
                </p>
              </section>
            )}
            <ScrollDesk desk={view.desk} perform={perform} />
          </>
        )}
      </main>
    </>
  );
}
