import { useRef, useState, type RefObject } from 'react';

import {
  techniquesPage,
  toggledTechnique,
  type Discipline,
  type GameContext,
  type TaughtCard,
} from '@/game';

import { TechniqueCard } from '../../components/TechniqueCard';
import { TechniqueSheet } from '../../components/TechniqueSheet';
import type { StepProps } from './types';

interface TechniquesStepProps extends StepProps {
  readonly ctx: GameContext;
}

const ART_LABEL: Readonly<Record<Discipline, string>> = {
  taijutsu: 'Taijutsu',
  ninjutsu: 'Ninjutsu',
  genjutsu: 'Genjutsu',
  kenjutsu: 'Kenjutsu',
  fuuinjutsu: 'Fūinjutsu',
};

/** The word stamped on a slip: chosen, the clan's own, or half of a combination. */
function stampOf(card: TaughtCard): string | undefined {
  if (card.selected) return 'Chosen';
  if (card.fromClan) return 'Clan art';
  return card.combo ? 'Combination' : undefined;
}

/**
 * A technique on offer: a slip that is chosen or put back, read beside the list on a desk and,
 * on a phone, unfolded under the slip.
 */
function Offer({
  card,
  onToggle,
  onRead,
}: {
  readonly card: TaughtCard;
  readonly onToggle: () => void;
  readonly onRead: () => void;
}) {
  const stamp = stampOf(card);
  return (
    <li>
      <button
        type="button"
        className={`taught-pick${card.selected ? ' selected' : ''}`}
        aria-pressed={card.selected}
        aria-disabled={card.blocker !== null}
        title={card.blocker ?? undefined}
        onClick={onToggle}
        onMouseEnter={onRead}
        onFocus={onRead}
      >
        <TechniqueCard
          name={card.name}
          detail={card.description}
          discipline={card.discipline}
          rank={card.rank}
          slip
          {...(stamp ? { stamp } : {})}
        />
      </button>
      <details className="sheet-fold taught-fold">
        <summary>What it does</summary>
        <TechniqueSheet sheet={card.sheet} />
      </details>
    </li>
  );
}

/** The slots the standing allows, filled in the order chosen, each with a way to put it back. */
function ChosenTray({
  chosen,
  picks,
  onPutBack,
  trayRef,
}: {
  readonly chosen: readonly TaughtCard[];
  readonly picks: number;
  readonly onPutBack: (id: string) => void;
  readonly trayRef: RefObject<HTMLElement | null>;
}) {
  const open = Math.max(0, picks - chosen.length);
  return (
    <section className="taught-tray" aria-label="Chosen techniques" ref={trayRef}>
      <h3 className="note-group">
        Chosen{' '}
        <span className="num">
          {chosen.length} of {picks}
        </span>
      </h3>
      <ol className="taught-slots">
        {chosen.map((c) => (
          <li key={c.id} className={`taught-slot filled t-${c.discipline}`}>
            <span className="taught-slot-name">{c.name}</span>
            <button
              type="button"
              className="btn ghost small"
              onClick={() => {
                onPutBack(c.id);
              }}
            >
              Put back
            </button>
          </li>
        ))}
        {Array.from({ length: open }, (_, i) => (
          <li key={`open-${String(i)}`} className="taught-slot">
            <span className="muted">Choose a technique below</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** The technique being read: what it is and what it does in a fight, for the student on file. */
function Reading({ card }: { readonly card: TaughtCard | null }) {
  if (!card) {
    return <p className="muted taught-reading-empty">Point at a technique to read it.</p>;
  }
  return (
    <section className="taught-reading" aria-label={`Technique: ${card.name}`}>
      <h3 className="note-group">
        {card.name}{' '}
        <span className="badge" data-grade={card.rank}>
          Rank {card.rank}
        </span>
      </h3>
      <p className="story">{card.description}</p>
      {card.blocker && <p className="blocker">{card.blocker}</p>}
      <TechniqueSheet sheet={card.sheet} />
    </section>
  );
}

/** What the academy taught you: the basics, then the techniques you chose at your grades. */
export function TechniquesStep({ draft, update, ctx }: TechniquesStepProps) {
  const page = techniquesPage(draft, ctx);
  const [readingId, setReadingId] = useState<string | null>(null);
  const trayRef = useRef<HTMLElement | null>(null);
  // A click on a slip the full file can't take sends you to the tray, where one is put back.
  const toTray = (id: string) => {
    setReadingId(id);
    trayRef.current?.querySelector('button')?.focus();
  };
  const all = [...page.basics, ...page.groups.flatMap((g) => g.cards)];
  const reading = all.find((c) => c.id === readingId) ?? page.chosen[0] ?? null;
  const toggle = (id: string) => {
    update({ techniqueIds: toggledTechnique(draft, id, ctx) });
  };
  return (
    <div className="step taught">
      <p className="taught-strip" aria-hidden="true">
        Chosen {page.chosen.length} of {page.picks}
        {page.chosen.length > 0 && `: ${page.chosen.map((c) => c.name).join(', ')}`}
      </p>
      <div className="taught-list">
        <p className="taught-allowance">{page.allowance}</p>
        <section className="opt-list">
          <h3 className="note-group">Every graduate knows</h3>
          <ul className="taught-grid">
            {page.basics.map((card) => (
              <li
                key={card.id}
                onMouseEnter={() => {
                  setReadingId(card.id);
                }}
              >
                <TechniqueCard
                  name={card.name}
                  detail={card.description}
                  discipline={card.discipline}
                  rank={card.rank}
                  slip
                />
              </li>
            ))}
          </ul>
        </section>
        {page.groups.map((group) => (
          <section key={group.discipline} className="opt-list">
            <h3 className="note-group">
              {ART_LABEL[group.discipline]}, taught up to rank {group.grade}
            </h3>
            {group.cards.length > 0 && (
              <ul className="taught-grid">
                {group.cards.map((card) => (
                  <Offer
                    key={card.id}
                    card={card}
                    onToggle={() => {
                      if (card.blocker) toTray(card.id);
                      else toggle(card.id);
                    }}
                    onRead={() => {
                      setReadingId(card.id);
                    }}
                  />
                ))}
              </ul>
            )}
            {group.heldBack && <p className="muted taught-held">{group.heldBack}</p>}
          </section>
        ))}
      </div>
      <aside className="taught-side">
        <ChosenTray chosen={page.chosen} picks={page.picks} onPutBack={toggle} trayRef={trayRef} />
        {page.full && (
          <p className="muted taught-full">Your file is full. Put one back to choose another.</p>
        )}
        <Reading card={reading} />
      </aside>
    </div>
  );
}
