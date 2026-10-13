import {
  afterFailedApproach,
  afterRecon,
  encounterApproaches,
  encounterFlavour,
  raiseAlertness,
  startEncounter,
  stillHidden,
  type EncounterStage,
  type EncounterTemplate,
} from './encounter';
import { SOLO } from './crew';
import { stagePay } from './encounterPay';
import { advance, reward, startRun, withStagePay, type MissionDef } from './missions';

const camp: EncounterTemplate = {
  id: 'camp',
  name: 'Camp',
  approaches: ['ambush', 'sneak', 'talk', 'bribe', 'intimidate', 'set-ground'],
  recon: [{ id: 'observe', label: 'Watch', difficulty: 8 }],
  alertness: 'unaware',
  talkable: true,
  resolve: 9,
  flavour: {
    terrain: 'A hollow.',
    noticed: 'A dog barks.',
    slipped: 'You slip by.',
    caught: 'Caught!',
    parley: 'They let you by.',
    ambush: 'You drop on them.',
    spotted: 'They saw you first.',
  },
};

const stage: EncounterStage = {
  kind: 'encounter',
  text: 'Bandits.',
  template: 'camp',
  enemyIds: ['thug'],
  canFlee: true,
  job: 'eliminate',
};

describe('encounter approaches', () => {
  it('always offers head-on and withdraw, in a fixed order', () => {
    expect(encounterApproaches(stage, camp)).toEqual([
      'head-on',
      'ambush',
      'sneak',
      'talk',
      'bribe',
      'intimidate',
      'set-ground',
      'withdraw',
    ]);
  });

  it('drops talk, bribes and threats for foes who won’t listen, and sneaking where there is no way past', () => {
    const deaf = encounterApproaches({ ...stage, talkable: false, bypassable: false }, camp);
    expect(deaf).toEqual(['head-on', 'ambush', 'set-ground', 'withdraw']);
  });

  it('lets a stage replace the template’s list', () => {
    expect(encounterApproaches({ ...stage, approaches: ['sneak'] }, camp)).toEqual([
      'head-on',
      'sneak',
      'withdraw',
    ]);
  });

  it('swaps in a stage’s own flavour', () => {
    const own = encounterFlavour(
      { ...stage, flavour: { slipped: 'Round by the goat track.' } },
      camp,
    );
    expect(own.slipped).toBe('Round by the goat track.');
    expect(own.caught).toBe('Caught!');
  });
});

describe('alertness and recon', () => {
  it('rises a step at a time and stops at alert', () => {
    expect(raiseAlertness('unaware')).toBe('wary');
    expect(raiseAlertness('wary')).toBe('alert');
    expect(raiseAlertness('alert')).toBe('alert');
  });

  it('a successful recon reveals its facts; a failed one puts them on guard', () => {
    const start = startEncounter(camp, ['identity'], 0);
    expect(start).toMatchObject({ alertness: 'unaware', known: ['identity'], recons: 0 });
    const seen = afterRecon(start, 'observe', true);
    expect(seen.known).toEqual(['identity', 'count', 'terrain', 'awareness']);
    expect(seen.alertness).toBe('unaware');
    expect(stillHidden(seen, 'observe')).toEqual([]);
    const heard = afterRecon(seen, 'track', false);
    expect(heard).toMatchObject({ alertness: 'wary', recons: 2 });
    expect(heard.known).toEqual(seen.known);
  });

  it('a failed approach can’t be tried again', () => {
    const run = afterFailedApproach(startEncounter(camp, [], 0), 'talk', 'alert');
    expect(run).toMatchObject({ alertness: 'alert', tried: ['talk'] });
  });
});

describe('encounter pay on the mission', () => {
  const def: MissionDef = {
    id: 'm',
    title: 'M',
    rank: 'D',
    client: 'C',
    summary: '',
    slots: 1,
    energyCost: 0,
    reward: { ryo: 100, reputation: 10 },
    minMissionsCompleted: 0,
    stages: [stage],
  };

  it('a surrender pays less ryo and more reputation', () => {
    const run = withStagePay(advance(startRun(def, SOLO)), stagePay('eliminate', 'talked-down'));
    expect(reward(def, run)).toEqual({ ryo: 60, reputation: 15 });
  });

  it('moving on leaves the encounter behind but keeps the pay', () => {
    const met = { ...startRun(def, SOLO), encounter: startEncounter(camp, [], 0) };
    const paid = withStagePay(met, stagePay('patrol', 'slipped-past'));
    const next = advance(paid);
    expect(next.encounter).toBeUndefined();
    expect(next.pay).toEqual({ ryo: 0.5, reputation: 0.5 });
  });
});
