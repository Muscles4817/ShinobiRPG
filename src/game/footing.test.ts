import { enemyWalking, walkingByRank } from './footing';

describe('walking in a fight', () => {
  it('anyone ranked chūnin or above walks on water and up trees; genin and civilians don’t', () => {
    expect(walkingByRank('jonin')).toEqual(['water-walking', 'tree-walking']);
    expect(walkingByRank('chunin')).toHaveLength(2);
    expect(walkingByRank('genin')).toEqual([]);
    expect(walkingByRank('civilian')).toEqual([]);
  });

  it('so does a foe dangerous enough to be trusted only to them', () => {
    expect(enemyWalking({ danger: 'elite' })).toHaveLength(2);
    expect(enemyWalking({ danger: 'deadly' })).toHaveLength(2);
    expect(enemyWalking({ danger: 'armed' })).toEqual([]);
  });
});
