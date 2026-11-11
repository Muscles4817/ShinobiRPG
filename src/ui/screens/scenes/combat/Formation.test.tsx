// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';

import type { CombatantView } from '@/game';

import { Formation } from './Formation';

/** Foes standing at distances of their own say so beneath their seals, on the plan screen. */

const body = { health: 100, maxHealth: 100, chakra: 50, maxChakra: 50, statuses: [] };
const fighters: CombatantView[] = [
  { id: 'aoi', name: 'Aoi', side: 'player', ...body, distance: 'close' },
  { id: 'goro', name: 'Goro', side: 'enemy', ...body, distance: 'close' },
  { id: 'kaen', name: 'Kaen', side: 'enemy', ...body, distance: 'far', row: 'back' },
];
const ignore: string[] = [];
const onSelect = (id: string) => {
  ignore.push(id);
};
const shared = { reads: {}, pulses: {}, selected: null, onSelect };

describe('the formation', () => {
  it('tags each foe with its own distance when they stand apart', () => {
    render(<Formation fighters={fighters} range="close" {...shared} />);
    expect(screen.getByRole('button', { name: 'Kaen' }).textContent).toContain('Far');
    expect(screen.getByRole('button', { name: 'Goro' }).textContent).toContain('Close');
  });

  it('says nothing more when every foe stands at your distance', () => {
    const together = fighters.map((f) => ({ ...f, distance: 'close' as const }));
    render(<Formation fighters={together} range="close" {...shared} />);
    expect(screen.getByRole('button', { name: 'Kaen' }).textContent).not.toContain('Close');
  });
});
