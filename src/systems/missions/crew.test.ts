import {
  canGoWithCrew,
  crewOptions,
  JONIN_D_POST_SHARE,
  JONIN_EXPERIENCED_RECORD,
  lowestRankFor,
  MAX_SOLO_A_SHARE,
  pickCrewKind,
  postingShare,
  soloAShare,
  worstDanger,
  type Assignee,
  type CrewKind,
  type JobProfile,
} from './crew';

const genin: Assignee = { rank: 'genin', seniorMissions: 0 };
const chunin: Assignee = { rank: 'chunin', seniorMissions: 0 };
const newJonin: Assignee = { rank: 'jonin', seniorMissions: 0 };
const veteran: Assignee = { rank: 'jonin', seniorMissions: JONIN_EXPERIENCED_RECORD };

const kinds = (job: JobProfile, who: Assignee): CrewKind[] =>
  crewOptions(job, who).map((o) => o.kind);

describe('danger', () => {
  it('is the worst of a job’s foes, or nothing when nobody is in the way', () => {
    const danger = { thief: 'petty', bandit: 'armed', rogue: 'deadly' } as const;
    const of = (id: string) => danger[id as keyof typeof danger];
    expect(worstDanger(['thief', 'rogue', 'bandit'], of)).toBe('deadly');
    expect(worstDanger(['thief'], of)).toBe('petty');
    expect(worstDanger([], of)).toBeNull();
  });
});

describe('who a genin is sent with', () => {
  it('goes alone only on chores and against petty foes', () => {
    expect(kinds({ rank: 'D', danger: null }, genin)).toEqual(['solo']);
    expect(kinds({ rank: 'D', danger: 'petty' }, genin)).toEqual(['solo']);
  });

  it('never goes alone against armed foes: the old team goes', () => {
    expect(kinds({ rank: 'D', danger: 'armed' }, genin)).toEqual(['old-team']);
    expect(kinds({ rank: 'C', danger: 'petty' }, genin)).toEqual(['old-team']);
    expect(kinds({ rank: 'C', danger: 'deadly' }, genin)).toEqual(['old-team']);
  });

  it('is never given B- or A-rank work, nor elite foes', () => {
    expect(kinds({ rank: 'B', danger: 'armed' }, genin)).toEqual([]);
    expect(kinds({ rank: 'A', danger: 'deadly' }, genin)).toEqual([]);
    expect(kinds({ rank: 'C', danger: 'elite' }, genin)).toEqual([]);
    expect(kinds({ rank: 'D', danger: 'deadly' }, genin)).toEqual([]);
  });
});

describe('who a chūnin is sent with', () => {
  it('leads genin, rejoins the old team, joins chūnin or now and then goes alone on C-rank', () => {
    expect(kinds({ rank: 'C', danger: 'armed' }, chunin).sort()).toEqual(
      ['chunin-squad', 'genin-squad', 'old-team', 'solo'].sort(),
    );
    const solo = crewOptions({ rank: 'C', danger: 'armed' }, chunin).find((o) => o.kind === 'solo');
    expect(solo?.weight).toBeLessThan(0.25);
  });

  it('takes only safe B-rank work, and never alone', () => {
    expect(kinds({ rank: 'B', danger: 'deadly' }, chunin)).toEqual(['genin-squad', 'chunin-squad']);
    expect(kinds({ rank: 'B', danger: 'elite' }, chunin)).toEqual([]);
  });

  it('goes on A-rank work only under a jōnin', () => {
    expect(kinds({ rank: 'A', danger: 'deadly' }, chunin)).toEqual(['jonin-led']);
  });

  it('is never sent against elite foes, at any rank of job', () => {
    expect(kinds({ rank: 'C', danger: 'elite' }, chunin)).toEqual([]);
    expect(kinds({ rank: 'A', danger: 'elite' }, chunin)).toEqual([]);
  });
});

describe('who a jōnin is sent with', () => {
  it('takes B-rank alone or leading a squad', () => {
    expect(kinds({ rank: 'B', danger: 'elite' }, newJonin)).toEqual(['solo', 'chunin-squad']);
  });

  it('is trusted with A-rank alone as their record grows', () => {
    expect(kinds({ rank: 'A', danger: 'elite' }, newJonin)).toEqual(['chunin-squad']);
    expect(soloAShare(0)).toBe(0);
    expect(soloAShare(JONIN_EXPERIENCED_RECORD / 2)).toBeCloseTo(MAX_SOLO_A_SHARE / 2);
    expect(soloAShare(JONIN_EXPERIENCED_RECORD * 3)).toBe(MAX_SOLO_A_SHARE);
    expect(kinds({ rank: 'A', danger: 'elite' }, veteran)).toEqual(['solo', 'chunin-squad']);
  });

  it('is seldom bothered with D-rank chores', () => {
    expect(postingShare({ rank: 'D', danger: null }, newJonin)).toBe(JONIN_D_POST_SHARE);
    expect(postingShare({ rank: 'D', danger: null }, chunin)).toBe(1);
  });
});

describe('picking a crew', () => {
  it('weighs the options by the roll', () => {
    const options = [
      { kind: 'solo', weight: 1 },
      { kind: 'old-team', weight: 3 },
    ] as const;
    expect(pickCrewKind(options, 0)).toBe('solo');
    expect(pickCrewKind(options, 0.2)).toBe('solo');
    expect(pickCrewKind(options, 0.3)).toBe('old-team');
    expect(pickCrewKind(options, 0.999)).toBe('old-team');
    expect(pickCrewKind([], 0.5)).toBeNull();
  });
});

describe('what a job asks', () => {
  it('names the lowest rank sent on it', () => {
    expect(lowestRankFor({ rank: 'C', danger: 'armed' })).toBe('genin');
    expect(lowestRankFor({ rank: 'B', danger: 'deadly' })).toBe('chunin');
    expect(lowestRankFor({ rank: 'B', danger: 'elite' })).toBe('jonin');
  });

  it('knows whether anyone ever goes on it with others', () => {
    expect(canGoWithCrew({ rank: 'D', danger: null })).toBe(false);
    expect(canGoWithCrew({ rank: 'D', danger: 'armed' })).toBe(true);
  });
});
