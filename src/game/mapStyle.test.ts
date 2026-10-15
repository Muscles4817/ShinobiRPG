import { act, ctx, newGame } from '@/test/gameFixtures';

import { dispatch } from './dispatch';
import { DEFAULT_MAP_STYLE } from './mapStyle';
import { mapStyleOptions } from './views/settings';
import { travelMap } from './views/travelMap';

describe('the map style setting', () => {
  it('draws a save that never chose one as the washi chart', () => {
    const state = newGame();
    expect(state.settings.mapStyle).toBeUndefined();
    expect(travelMap(state, ctx).style).toBe(DEFAULT_MAP_STYLE);
    expect(mapStyleOptions(state, ctx).find((o) => o.on)?.style).toBe('washi');
  });

  it('switches the map to another style, and not to the one in use', () => {
    const night = act(newGame(), { type: 'setMapStyle', style: 'night' });
    expect(travelMap(night, ctx).style).toBe('night');
    expect(dispatch(night, { type: 'setMapStyle', style: 'night' }, ctx)).toEqual({
      ok: false,
      error: 'The map is already drawn this way.',
    });
    const options = mapStyleOptions(night, ctx);
    expect(options.filter((o) => o.blocker === null).map((o) => o.style)).toEqual([
      'washi',
      'brush',
    ]);
  });
});
