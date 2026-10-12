import { conductMark, conductScore, CONDUCT_POINTS } from './conduct';
import {
  boutLost,
  boutWon,
  currentExamStage,
  endRun,
  judge,
  nextStage,
  PROMOTION_SCORE,
  ROUND_POINTS,
  startExamRun,
  withConduct,
  type ExamDef,
  type TournamentStageDef,
} from './exams';

const TOURNAMENT: TournamentStageDef = {
  kind: 'tournament',
  name: 'Ring',
  intro: 'Bouts.',
  rivals: [10, 12],
  rivalBase: 8,
  bout: '{them} bows.',
  won: 'Won.',
  lost: 'Lost.',
  yielded: 'Yielded.',
  champion: 'Champion.',
};

const EXAM: ExamDef = {
  id: 'trial',
  name: 'Trial',
  rank: 'chunin',
  dates: [
    { season: 0, day: 1 },
    { season: 2, day: 1 },
  ],
  rumour: 'Soon.',
  announcement: 'Sign.',
  intro: 'The hall.',
  verdict: { promoted: 'Yes.', passedOver: 'No.' },
  stages: [
    {
      kind: 'survival',
      name: 'Wood',
      intro: 'In.',
      missionId: 'wood',
      passed: 'Out.',
      failed: 'Lost.',
    },
    TOURNAMENT,
  ],
};

describe('an exam run', () => {
  it('starts at the first stage with the intros in its story', () => {
    const run = startExamRun(EXAM, 5, ['a', 'b']);
    expect(run.progress).toEqual({ kind: 'survival', started: false });
    expect(run.notes.map((n) => (n.kind === 'story' ? n.text : ''))).toEqual(['The hall.', 'In.']);
    expect(currentExamStage(EXAM, run)?.kind).toBe('survival');
  });

  it('moves stage by stage and is judged after the last', () => {
    const run = nextStage(EXAM, startExamRun(EXAM, 5, []));
    expect(run.progress).toEqual({ kind: 'tournament', round: 0, roundsWon: 0, fighting: false });
    const won = boutWon(run, TOURNAMENT);
    expect(won.champion).toBe(false);
    const final = boutWon(won.run, TOURNAMENT);
    expect(final.champion).toBe(true);
    const over = nextStage(EXAM, final.run);
    expect(over.verdict).toMatchObject({ promoted: true, roundsWon: 2, score: 2 * ROUND_POINTS });
    expect(currentExamStage(EXAM, over)).toBeNull();
  });

  it('keeps the rounds won when a bout is lost', () => {
    const run = nextStage(EXAM, startExamRun(EXAM, 5, []));
    const lost = boutLost(boutWon(run, TOURNAMENT).run);
    expect(lost.roundsWon).toBe(1);
  });

  it('weighs conduct with results: losing well can be enough, winning badly not', () => {
    const goodLoser = withConduct(
      { ...startExamRun(EXAM, 1, []), roundsWon: 1 },
      conductMark('clever-win'),
      conductMark('stayed-for-final'),
    );
    expect(judge(goodLoser).promoted).toBe(true);
    const caught = conductMark('caught-cheating');
    const roughWinner = withConduct({ ...startExamRun(EXAM, 1, []), roundsWon: 2 }, caught, caught);
    expect(judge(roughWinner).score).toBeLessThan(PROMOTION_SCORE);
    expect(judge(roughWinner).promoted).toBe(false);
  });

  it('never promotes a run that ended early', () => {
    const run = withConduct(startExamRun(EXAM, 1, []), conductMark('sensible-withdrawal'));
    const ended = endRun({ ...run, roundsWon: 3 }, 'withdrew');
    expect(ended.verdict).toMatchObject({ promoted: false, exit: 'withdrew' });
  });
});

describe('conduct', () => {
  it('sums the marks, each worth what the table says', () => {
    expect(conductMark('team-standing')).toEqual({ signal: 'team-standing', points: 1 });
    expect(conductScore([conductMark('gave-up'), conductMark('sensible-withdrawal')])).toBe(
      CONDUCT_POINTS['gave-up'] + CONDUCT_POINTS['sensible-withdrawal'],
    );
  });
});
