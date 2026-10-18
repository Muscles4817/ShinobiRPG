import {
  personSheet,
  rivalryView,
  type GameAction,
  type GameContext,
  type GameState,
  type PersonSheet as Sheet,
} from '@/game';

import { Portrait } from '../art/Portrait';
import { RivalrySection } from './RivalrySection';
import {
  BetweenYou,
  Remembered,
  SinceTheAcademy,
  SizingUp,
  TheirArts,
  TheirDay,
  TheyTeach,
  WhatTheyreLike,
} from './PersonSections';

interface PersonSheetProps {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly personId: string;
  readonly perform: (action: GameAction) => void;
  readonly onClose: () => void;
}

const RELATION_LABEL = {
  sensei: 'Your sensei',
  teammate: 'Your teammate',
  rival: 'Your rival',
} as const;

interface ActionsProps {
  readonly sheet: Sheet;
  readonly perform: (action: GameAction) => void;
  readonly onClose: () => void;
}

/** A button that does its action and closes the sheet, disabled with its reason. */
function Act({
  label,
  choice,
  primary = false,
  perform,
  onClose,
}: {
  readonly label: string;
  readonly choice: { readonly action: GameAction; readonly blocker: string | null };
  readonly primary?: boolean;
} & Omit<ActionsProps, 'sheet'>) {
  return (
    <button
      type="button"
      className={primary ? 'btn' : 'btn ghost'}
      disabled={choice.blocker !== null}
      title={choice.blocker ?? undefined}
      onClick={() => {
        perform(choice.action);
        onClose();
      }}
    >
      {label}
    </button>
  );
}

/** What you can do with them, kept at the thumb; each says why not when it can't be done. */
function PersonActions({ sheet: p, perform, onClose }: ActionsProps) {
  const reasons = [
    p.talk.blocker,
    p.spar?.blocker ? `Spar: ${p.spar.blocker}` : null,
    p.recipe?.blocker ?? null,
    p.contract?.blocker ? `Contract: ${p.contract.blocker}` : null,
  ];
  const shown = [...new Set(reasons.filter((r): r is string => r !== null))];
  return (
    <footer className="profile-actions">
      {shown.map((r) => (
        <p key={r} className="blocker">
          {r}
        </p>
      ))}
      <div className="row-buttons">
        <Act
          label={`Talk to ${p.name}`}
          choice={p.talk}
          primary
          perform={perform}
          onClose={onClose}
        />
        {p.spar && <Act label="Spar" choice={p.spar} perform={perform} onClose={onClose} />}
      </div>
      {p.contract && (
        <Act
          label={`Sign ${p.contract.name}`}
          choice={p.contract}
          perform={perform}
          onClose={onClose}
        />
      )}
      {p.recipe && (
        <Act
          label={`Learn to cook ${p.recipe.name}`}
          choice={p.recipe}
          perform={perform}
          onClose={onClose}
        />
      )}
    </footer>
  );
}

/** A face ringed for who they are to you: lantern for your team, the rival's ink for your rival. */
function photoClass(relation: Sheet['relation']): string {
  if (relation === 'rival') return 'person-photo rival';
  return relation ? 'person-photo team' : 'person-photo';
}

/** Who they are, at a glance: face, name, rank and art, and where they are now. */
function PersonHead({ p }: { readonly p: Sheet }) {
  // A title that only repeats their rank says nothing the rank stamp doesn't.
  const kicker = p.relation ? RELATION_LABEL[p.relation] : p.title === p.rank ? null : p.title;
  return (
    <header className="person-top">
      <span className={photoClass(p.relation)}>
        <Portrait appearance={p.appearance} size={84} />
      </span>
      <div>
        {kicker && <p className="profile-kicker">{kicker}</p>}
        <h2>{p.fullName}</h2>
        <p className="person-tags">
          {p.rank && <span className="badge">{p.rank}</span>}
          {p.specialty && <span className={`badge d-${p.specialty.id}`}>{p.specialty.label}</span>}
          {p.clan && <span className="chip">{p.clan}</span>}
        </p>
        <p className="profile-where">{p.where}</p>
      </div>
    </header>
  );
}

/**
 * Someone's page, on paper: it starts short for a stranger and grows as you get to know them,
 * with what you can do together kept at the bottom.
 */
export function PersonSheet({ ctx, state, personId, perform, onClose }: PersonSheetProps) {
  const p = personSheet(state, ctx, personId);
  const rivalry = rivalryView(state, ctx, personId);
  if (!p) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="sheet person-sheet paper-sheet enter"
        aria-label={p.fullName}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <PersonHead p={p} />
        <p className="story">{p.bio}</p>
        {rivalry && <RivalrySection view={rivalry} perform={perform} onClose={onClose} />}
        <BetweenYou p={p} />
        <WhatTheyreLike p={p} />
        {p.day && <TheirDay day={p.day} />}
        {p.arts && <TheirArts arts={p.arts} />}
        {p.teaches && <TheyTeach teaches={p.teaches} />}
        {p.growth && <SinceTheAcademy growth={p.growth} />}
        {p.sizing && <SizingUp sizing={p.sizing} />}
        <Remembered p={p} />
        <PersonActions sheet={p} perform={perform} onClose={onClose} />
      </section>
    </div>
  );
}
