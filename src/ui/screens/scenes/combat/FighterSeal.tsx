import type { ReactNode } from 'react';

import type { CombatantView } from '@/game';

import { FighterShadow } from '../../../art/portrait/Figure';

import { shortName } from './shortName';

const SEAL_SIZE = 40;
const SMALL_SEAL = 24;

interface FighterSealProps {
  /** Whoever the seal is of; none shows an empty one. */
  readonly fighter: CombatantView | undefined;
  readonly small?: boolean;
  /** Extra state for the seal's class (acting, struck, down). */
  readonly state?: string;
  readonly children?: ReactNode;
}

/**
 * A fighter's seal: their lantern shadow, warm for your side and red for the other, with their
 * number when several of a kind stand together ("Bandit Thug 2").
 */
export function FighterSeal({ fighter: f, small = false, state = '', children }: FighterSealProps) {
  const size = small ? SMALL_SEAL : SEAL_SIZE;
  const number = f ? /\d+$/.exec(shortName(f.name).mark)?.[0] : undefined;
  return (
    <span
      className={`token-seal ${small ? 'small ' : ''}${f?.side ?? ''} ${state}`}
      title={small ? f?.name : undefined}
      aria-hidden="true"
    >
      {f && (
        <FighterShadow
          look={f.look}
          form={f.form}
          name={f.name}
          tone={f.side === 'enemy' ? 'red' : 'warm'}
          size={size}
        />
      )}
      {number && <span className="seal-number">{number}</span>}
      {children}
    </span>
  );
}
