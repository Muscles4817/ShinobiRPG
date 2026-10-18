import { SOLO } from './crew';
import { addLedger, applyOutcome } from './outcomes';
import { advance, pickTwist, startRun, type MissionDef } from './missions';
import { conditionRefs, holds, moveThread, onTheClock, variantText, type ThreadDef } from './story';

const trust: ThreadDef = {
  id: 'trust',
  label: 'Her trust',
  levels: ['Doubtful', 'Polite', 'At ease', 'Trusts you'],
  start: 1,
};

const job: MissionDef = {
  id: 'job',
  title: 'Job',
  rank: 'D',
  client: 'Client',
  summary: '',
  slots: 1,
  energyCost: 0,
  reward: { ryo: 100, reputation: 4 },
  minMissionsCompleted: 0,
  threads: [trust],
  charge: { name: 'Ume', thread: 'trust', likes: ['kind'], dislikes: ['tease'] },
  twists: [
    { mark: 'desperate', weight: 3 },
    { mark: 'followed', weight: 1 },
  ],
  stages: [{ kind: 'narrative', text: 'Off you go.' }],
};

const story = {
  marks: ['lost-light'],
  threads: { trust: 2 },
  crew: SOLO,
  remembered: ['spared'],
  tallies: { mercy: 2 },
};

describe('what a mission remembers', () => {
  it('reads marks, threads, who went, and combinations of them', () => {
    expect(holds(story, { has: 'lost-light' })).toBe(true);
    expect(holds(story, { lacks: 'lost-light' })).toBe(false);
    expect(holds(story, { thread: 'trust', atLeast: 2 })).toBe(true);
    expect(holds(story, { thread: 'trust', below: 2 })).toBe(false);
    expect(holds(story, { crew: 'solo' })).toBe(true);
    expect(holds(story, { crew: 'team' })).toBe(false);
    expect(holds(story, { all: [{ has: 'lost-light' }, { crew: 'you-lead' }] })).toBe(true);
    expect(holds(story, { any: [{ has: 'nope' }, { crew: 'led' }] })).toBe(false);
    expect(holds(story, undefined)).toBe(true);
    expect(holds(story, { remembers: 'spared' })).toBe(true);
    expect(holds(story, { remembers: 'trusted' })).toBe(false);
  });

  it('reads the village’s tallies as they stood, an untouched one as none', () => {
    expect(holds(story, { tally: 'mercy', atLeast: 2 })).toBe(true);
    expect(holds(story, { tally: 'mercy', below: 2 })).toBe(false);
    expect(holds(story, { tally: 'clues', below: 1 })).toBe(true);
    expect(holds(story, { tally: 'clues', atLeast: 1 })).toBe(false);
  });

  it('tells the first variant that holds, or the plain text', () => {
    const variants = [
      { when: { has: 'knows-why' }, text: 'She smiles.' },
      { when: { has: 'lost-light' }, text: 'Dusk.' },
    ];
    expect(variantText(story, 'Plain.', variants)).toBe('Dusk.');
    expect(variantText({ ...story, marks: [] }, 'Plain.', variants)).toBe('Plain.');
  });

  it('keeps a thread within its levels', () => {
    expect(moveThread({ trust: 3 }, trust, 2)).toEqual({ trust: 3 });
    expect(moveThread({}, trust, -5)).toEqual({ trust: 0 });
  });

  it('sets the day’s light to the hour, and leaves other threads alone', () => {
    const light: ThreadDef = { ...trust, id: 'daylight', clock: true };
    expect(onTheClock({ trust: 2 }, [trust, light], 0)).toEqual({ trust: 2, daylight: 3 });
    expect(onTheClock({}, [light], 2)).toEqual({ daylight: 1 });
    expect(onTheClock({}, [light], 3)).toEqual({ daylight: 0 });
  });

  it('lists what a condition reads', () => {
    expect(
      conditionRefs({
        all: [
          { has: 'a' },
          { any: [{ thread: 't', atLeast: 1 }, { lacks: 'b' }, { tally: 'mercy', atLeast: 2 }] },
        ],
      }),
    ).toEqual({
      marks: ['a', 'b'],
      threads: ['t'],
      world: [],
      tallies: ['mercy'],
    });
  });
});

describe('outcomes', () => {
  it('set marks, move threads (the charge by name), dock pay, and write the ledger', () => {
    const run = startRun(job, SOLO);
    const applied = applyOutcome(run, job, {
      effects: [
        { kind: 'mark', mark: 'lost-light' },
        { kind: 'thread', thread: 'charge', by: 1 },
        { kind: 'thread', thread: 'daylight', by: -1 },
        { kind: 'pay', share: -0.25 },
        { kind: 'harm', health: 3 },
        { kind: 'tally', tally: 'mercy', by: 1 },
      ],
      ledger: 'Lost the light at the spring.',
    });
    expect(applied.run.marks).toEqual(['lost-light']);
    expect(applied.run.threads).toEqual({ trust: 2 });
    expect(applied.run.rewardMultiplier).toBe(0.75);
    expect(applied.run.ledger).toEqual([
      { stageIndex: 0, text: 'Lost the light at the spring.', tone: 'cost', pay: -0.25 },
    ]);
    expect(applied.personal).toEqual([
      { kind: 'harm', health: 3 },
      { kind: 'tally', tally: 'mercy', by: 1 },
    ]);
  });

  it('writes nothing without a ledger line, and lines can be added directly', () => {
    const run = startRun(job, SOLO);
    expect(applyOutcome(run, job, { effects: [{ kind: 'mark', mark: 'x' }] }).run.ledger).toEqual(
      [],
    );
    expect(addLedger(run, { text: 'Fought them.', tone: 'plain' }).ledger).toHaveLength(1);
  });

  it('says what a thread did only when it really moved', () => {
    const light: ThreadDef = {
      id: 'daylight',
      label: 'Daylight',
      levels: ['Dark', 'Morning'],
      start: 1,
      ledger: { fell: 'It cost the light.', rose: 'It saved some light.' },
    };
    const lit = { ...job, threads: [light] };
    const lostHour = {
      effects: [{ kind: 'thread', thread: 'daylight', by: -1 }] as const,
      ledger: 'Pulled a cart out.',
    };
    const first = applyOutcome(startRun(lit, SOLO), lit, lostHour);
    expect(first.run.ledger.at(-1)?.text).toBe('Pulled a cart out. It cost the light.');
    // Already dark: nothing more to lose, so nothing is claimed.
    const again = applyOutcome(first.run, lit, lostHour);
    expect(again.run.ledger.at(-1)?.text).toBe('Pulled a cart out.');
    // A job that keeps no light is never told it lost any.
    expect(applyOutcome(startRun(job, SOLO), job, lostHour).run.ledger.at(-1)?.text).toBe(
      'Pulled a cart out.',
    );
  });

  it('says a thread’s change a new way each time the ledger says it again', () => {
    const light: ThreadDef = {
      id: 'daylight',
      label: 'Daylight',
      levels: ['Dark', 'Dusk', 'Afternoon', 'Morning'],
      start: 3,
      ledger: { fell: ['It cost the light.', 'That cost more of it.'] },
    };
    const lit = { ...job, threads: [light] };
    const lost = {
      effects: [{ kind: 'thread', thread: 'daylight', by: -1 }] as const,
      ledger: 'Lost.',
    };
    let run = startRun(lit, SOLO);
    for (let i = 0; i < 3; i++) run = applyOutcome(run, lit, lost).run;
    expect(run.ledger.map((l) => l.text)).toEqual([
      'Lost. It cost the light.',
      'Lost. That cost more of it.',
      'Lost. That cost more of it.',
    ]);
  });

  it('leaves the finished stage’s camp and road event behind on moving on', () => {
    const run = { ...startRun(job, SOLO), camp: { done: ['0'] }, roadEvent: 'x', marks: ['m'] };
    const next = advance(run);
    expect(next.camp).toBeUndefined();
    expect(next.roadEvent).toBeUndefined();
    expect(next.marks).toEqual(['m']);
  });
});

describe('twists', () => {
  it('are rolled by weight, and a job without any has none', () => {
    expect(pickTwist(job, 0)).toBe('desperate');
    expect(pickTwist(job, 0.74)).toBe('desperate');
    expect(pickTwist(job, 0.76)).toBe('followed');
    expect(pickTwist({ ...job, twists: [] }, 0.5)).toBeNull();
    expect(startRun(job, SOLO, ['followed']).marks).toEqual(['followed']);
  });
});
