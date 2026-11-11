// @vitest-environment jsdom
import { render } from '@testing-library/react';

import type { CombatantView } from '@/game';
import { DEFAULT_APPEARANCE } from '@/systems/profile';

import { FighterSeal } from './FighterSeal';

const BASE: CombatantView = {
  id: 'x',
  name: 'Kaen',
  side: 'player',
  health: 100,
  maxHealth: 100,
  chakra: 50,
  maxChakra: 50,
  statuses: [],
};

/** The inked shapes a seal draws, as one string, to tell two silhouettes apart. */
function inked(container: HTMLElement): string {
  return [...container.querySelectorAll('path, ellipse')].map((el) => el.outerHTML).join('');
}

describe('a fighter’s seal', () => {
  it('cuts someone with a look as themselves, and a common foe as their kind', () => {
    const person = render(<FighterSeal fighter={{ ...BASE, look: DEFAULT_APPEARANCE }} />);
    const thug = render(<FighterSeal fighter={{ ...BASE, name: 'Bandit Thug', side: 'enemy' }} />);
    expect(person.container.querySelector('svg.shadow')).not.toBeNull();
    expect(thug.container.querySelector('svg.shadow')).not.toBeNull();
    expect(inked(person.container)).not.toBe(inked(thug.container));
  });

  it.each(['beast', 'swarm', 'spirit'] as const)('draws a %s as its own shape', (form) => {
    const foe = { ...BASE, name: 'Thing', side: 'enemy' as const };
    const plain = render(<FighterSeal fighter={foe} />);
    const shaped = render(<FighterSeal fighter={{ ...foe, form }} />);
    expect(inked(shaped.container)).not.toBe(inked(plain.container));
    expect(shaped.container.innerHTML).not.toContain('NaN');
  });

  it('numbers fighters of a kind, and cuts them all the same', () => {
    const one = render(<FighterSeal fighter={{ ...BASE, name: 'Bandit Thug 1', side: 'enemy' }} />);
    const two = render(<FighterSeal fighter={{ ...BASE, name: 'Bandit Thug 2', side: 'enemy' }} />);
    expect(two.container.querySelector('.seal-number')).toHaveTextContent('2');
    expect(
      render(<FighterSeal fighter={BASE} />).container.querySelector('.seal-number'),
    ).toBeNull();
    expect(inked(one.container)).toBe(inked(two.container));
  });

  it('stands your side against a warm lantern and the other against a red one', () => {
    const mine = render(<FighterSeal fighter={BASE} />);
    const theirs = render(<FighterSeal fighter={{ ...BASE, side: 'enemy' }} />);
    const glow = (c: HTMLElement) => c.querySelector('stop')?.getAttribute('stop-color');
    expect(glow(mine.container)).not.toBe(glow(theirs.container));
  });
});
