// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';

import type { CombatantView } from '@/game';

import { FighterRead } from './FighterRead';

/** The read on a foe says what you make of them, once you believe anything of them. */

const body = { health: 100, maxHealth: 100, chakra: 50, maxChakra: 50, statuses: [] };

describe('the read on a foe', () => {
  it('lists what you make of them', () => {
    const foe: CombatantView = {
      id: 'goro',
      name: 'Goro',
      side: 'enemy',
      ...body,
      beliefs: ['Keeps a Counter ready up close: sure.', 'Has holds: fairly sure.'],
    };
    render(<FighterRead fighter={foe} read={undefined} />);
    expect(screen.getByText('What you make of them')).toBeTruthy();
    expect(screen.getByText('Has holds: fairly sure.')).toBeTruthy();
  });

  it('says nothing of it before you believe anything', () => {
    const foe: CombatantView = { id: 'goro', name: 'Goro', side: 'enemy', ...body };
    render(<FighterRead fighter={foe} read={undefined} />);
    expect(screen.queryByText('What you make of them')).toBeNull();
  });
});
