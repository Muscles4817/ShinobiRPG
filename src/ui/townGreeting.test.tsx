// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';

import { contextForPack, villageView } from '@/game';
import { newGame } from '@/test/gameFixtures';

import { VillageLife } from './screens/VillageLife';

/** The village screen says what a town holds against you, and what it costs you, as chips. */

const naruto = contextForPack('naruto');
const describeFan = naruto ? describe : describe.skip;

describeFan('a town’s greeting', () => {
  it('shows the Sand’s grudge against the Leaf with its costs', () => {
    const ctx = naruto!;
    const state = newGame({ locationId: 'sunagakure' }, ctx);
    render(<VillageLife view={villageView(state, ctx)} perform={() => undefined} />);
    expect(screen.getByText(/Sakumo Hatake/)).toBeTruthy();
    expect(screen.getByText('Prices +50%')).toBeTruthy();
    expect(screen.getByText('Warms to you slowly')).toBeTruthy();
  });
});
