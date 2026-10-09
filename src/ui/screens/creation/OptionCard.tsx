import type { ReactNode } from 'react';

import type { EffectLine } from '@/game';

interface OptionCardProps {
  readonly name: string;
  readonly description: string;
  readonly effects?: readonly EffectLine[];
  readonly selected: boolean;
  readonly disabled?: boolean;
  readonly onSelect: () => void;
  readonly children?: ReactNode;
}

/** A selectable option on the academy file, showing exactly what it does. */
export function OptionCard({
  name,
  description,
  effects = [],
  selected,
  disabled = false,
  onSelect,
  children,
}: OptionCardProps) {
  return (
    <button
      type="button"
      className={`opt-card${selected ? ' selected' : ''}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      <b>{name}</b>
      <span className="opt-desc">{description}</span>
      {effects.length > 0 && (
        <span className="chips">
          {effects.map((e) => (
            <span key={e.label} className={`chip ${e.tone}`}>
              {e.label}
            </span>
          ))}
        </span>
      )}
      {children}
    </button>
  );
}
