import { ORIGINAL_PACK } from './packs/original';
import { validateContent } from './validate';

describe('road events', () => {
  it('keep something for every road and season in every region a road crosses', () => {
    const seasonal = ORIGINAL_PACK.roadEvents.map((e) => ({ ...e, seasons: ['Winter' as const] }));
    expect(validateContent({ ...ORIGINAL_PACK, roadEvents: seasonal })).toContain(
      'region "coast-road" has no road event for every road and season',
    );
  });
});
