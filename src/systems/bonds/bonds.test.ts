import {
  addPoints,
  bondWith,
  MAX_BOND,
  NEW_BOND,
  reactionTo,
  recordTalk,
  stageName,
  stageOf,
  stageProgress,
  talkedToday,
} from './bonds';

describe('bonds', () => {
  it('climbs through named stages', () => {
    expect(stageOf(0)).toBe(0);
    expect(stageOf(10)).toBe(1);
    expect(stageOf(54)).toBe(2);
    expect(stageOf(MAX_BOND)).toBe(4);
    expect(stageName(stageOf(30))).toBe('Friend');
  });

  it('reports progress within a stage', () => {
    expect(stageProgress(20)).toBe(0.5);
    expect(stageProgress(MAX_BOND)).toBe(1);
  });

  it('stays between zero and the maximum', () => {
    expect(addPoints(NEW_BOND, -5).points).toBe(0);
    expect(addPoints(bondWith(98), 10).points).toBe(MAX_BOND);
  });

  it('rewards liked tones and punishes disliked ones', () => {
    const brash = { likes: ['challenge', 'joke'], dislikes: ['quiet'] };
    const proud = { likes: ['praise', 'challenge'], dislikes: ['tease'] };
    expect(reactionTo([brash, proud], 'challenge')).toBe(13);
    expect(reactionTo([brash, proud], 'kind')).toBe(3);
    expect(reactionTo([brash, proud], 'quiet')).toBe(-3);
  });

  it('remembers the day and what was said', () => {
    const after = recordTalk(NEW_BOND, { day: 3, delta: 8, heard: 'hello' });
    expect(after).toEqual({ points: 8, lastTalkDay: 3, heard: ['hello'] });
    expect(talkedToday(after, 3)).toBe(true);
    expect(talkedToday(after, 4)).toBe(false);
    expect(recordTalk(after, { day: 4, delta: 1, heard: 'hello' }).heard).toEqual(['hello']);
  });
});
