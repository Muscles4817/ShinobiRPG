import { ctx, newGame } from '@/test/gameFixtures';

import { contextForPack } from '../context';
import { blockerFor } from '../dispatch';
import { marketView } from './market';
import { trainingView } from './training';

describe('training view', () => {
  it('lists each drill’s stats biggest gain first', () => {
    const drills = trainingView(newGame(), ctx)?.drills ?? [];
    expect(drills.length).toBeGreaterThan(0);
    for (const drill of drills) {
      const gains = drill.previews.map((p) => p.after - p.now);
      expect(gains).toEqual([...gains].sort((a, b) => b - a));
    }
  });
});

describe('a location with two training grounds and two markets', () => {
  const naruto = contextForPack('naruto');
  // The fan pack's Kirigakure has two of each.
  const inKiri = () => (naruto ? { ...newGame({}, naruto), locationId: 'kirigakure' } : null);

  it('shows each training ground its own drills, and lets you train at either', () => {
    const state = inKiri();
    if (!naruto || !state) return;
    const drillsAt = (placeId: string) =>
      trainingView(state, naruto, placeId)?.drills.map((d) => d.id);
    expect(drillsAt('kiri-sea-cliffs')).toEqual(['blind-mist-drill', 'cliff-surf-run']);
    expect(drillsAt('kasumi-fog-shrine')).toEqual(['fog-breath-drill', 'brazier-watch']);
    // The shrine's drill is held back by nothing the cliffs' drill isn't.
    const drill = (trainingId: string) => ({ type: 'train', trainingId }) as const;
    const cliffs = blockerFor(state, drill('blind-mist-drill'), naruto);
    expect(blockerFor(state, drill('fog-breath-drill'), naruto)).toBe(cliffs);
  });

  it('shows each market its own stalls', () => {
    const state = inKiri();
    if (!naruto || !state) return;
    const stallsAt = (placeId: string) =>
      marketView(state, naruto, placeId)?.stalls.map((s) => s.name) ?? [];
    expect(stallsAt('isana-quay')).toContain('The Flensing Shed');
    expect(stallsAt('kiri-fish-auction')).not.toContain('The Flensing Shed');
  });
});
