import type { ReactNode } from 'react';

import type { ActionOption, GameAction } from '@/game';

interface ActionCardProps {
  readonly option: ActionOption;
  readonly onPerform: (action: GameAction) => void;
  readonly buttonLabel?: string;
  readonly children?: ReactNode;
}

/** Renders any ActionOption: title, description, tags and a button (disabled with a reason). */
export function ActionCard({ option, onPerform, buttonLabel = 'Go', children }: ActionCardProps) {
  return (
    <article className="card">
      <header className="card-header">
        <div>
          <h3>{option.title}</h3>
          <p className="muted">{option.subtitle}</p>
        </div>
        <button
          type="button"
          disabled={option.blocker !== null}
          onClick={() => {
            onPerform(option.action);
          }}
        >
          {buttonLabel}
        </button>
      </header>
      <p>{option.description}</p>
      {children}
      <ul className="tags">
        {option.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      {option.blocker && <p className="blocker">{option.blocker}</p>}
    </article>
  );
}
