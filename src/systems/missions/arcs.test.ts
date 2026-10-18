import { actPassed, actReached, arcJobOpen, type ArcAct, type ArcDef } from './arcs';

/** How an arc's acts are passed: every job, any lead, or one fork. */

const act = (jobs: string[], pass?: ArcAct['pass']): ArcAct => ({
  beats: ['search'],
  title: jobs.join(' '),
  text: 'Something is going on.',
  jobs,
  ...(pass ? { pass } : {}),
});

const arc: ArcDef = {
  id: 'arc',
  title: 'An arc',
  summary: 'A story.',
  acts: [act(['start']), act(['well', 'servant', 'gravedigger'], 'any'), act(['night'])],
};

const fork: ArcDef = {
  id: 'fork',
  title: 'A fork',
  summary: 'A choice.',
  acts: [act(['start']), act(['home', 'lie', 'court'], 'one')],
};

describe('acts', () => {
  it('are passed by every job by default, or by any one of leads and forks', () => {
    expect(actPassed(act(['a', 'b']), ['a'])).toBe(false);
    expect(actPassed(act(['a', 'b']), ['a', 'b'])).toBe(true);
    expect(actPassed(act(['a', 'b'], 'any'), ['b'])).toBe(true);
    expect(actPassed(act(['a', 'b'], 'one'), [])).toBe(false);
    expect(actReached(arc, ['start', 'servant'])).toBe(2);
  });

  it('keep the other leads open as extra digging until a later act’s job is done', () => {
    const done = ['start', 'servant'];
    expect(arcJobOpen([arc], 'night', done)).toBe(true);
    expect(arcJobOpen([arc], 'well', done)).toBe(true);
    expect(arcJobOpen([arc], 'servant', done)).toBe(false);
    expect(arcJobOpen([arc], 'well', [...done, 'night'])).toBe(false);
  });

  it('close a fork’s other roads once one is taken', () => {
    expect(arcJobOpen([fork], 'lie', ['start'])).toBe(true);
    expect(arcJobOpen([fork], 'lie', ['start', 'home'])).toBe(false);
    expect(actReached(fork, ['start', 'home'])).toBe(2);
  });

  it('never open a job before its act', () => {
    expect(arcJobOpen([arc], 'well', [])).toBe(false);
    expect(arcJobOpen([arc], 'start', [])).toBe(true);
  });
});
