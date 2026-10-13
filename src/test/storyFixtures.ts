import { CONTENT_PACKS, type ContentPack } from '@/content';
import { createGameContext, type GameContext } from '@/game';
import type { MissionDef } from '@/systems/missions';

/** A job that uses every piece of a mission's story, in a copy of the original pack. */

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;

export const STORY_JOB: MissionDef = {
  id: 'test-ume-lantern',
  title: 'Sister Ume’s Lantern',
  rank: 'D',
  client: 'The Mountain Temple',
  summary: 'See Sister Ume to the foot shrine.',
  slots: 1,
  energyCost: 10,
  reward: { ryo: 400, reputation: 4 },
  minMissionsCompleted: 0,
  standing: true,
  threads: [
    {
      id: 'trust',
      label: 'Ume’s trust',
      levels: ['Doubtful', 'Polite', 'At ease', 'Trusts you'],
      start: 1,
    },
    {
      id: 'daylight',
      label: 'Daylight',
      levels: ['Dark', 'Dusk', 'Afternoon', 'Morning'],
      start: 3,
    },
  ],
  charge: { name: 'Sister Ume', thread: 'trust', likes: ['kind', 'earnest'], dislikes: ['tease'] },
  twists: [{ mark: 'desperate-men', weight: 1 }],
  stages: [
    {
      kind: 'decision',
      text: '“You’re very young. Have you eaten?”',
      options: [
        { label: '“Not yet, actually.”', tone: 'kind', reply: 'She presses a rice ball on you.' },
        {
          label: '“That isn’t part of the job.”',
          tone: 'tease',
          reply: 'She laughs, but she watches you after that.',
        },
      ],
    },
    {
      kind: 'check',
      text: 'At the spring she stops to bless every pilgrim who passes.',
      approaches: [
        {
          label: 'Hurry her along',
          stat: 'speed',
          difficulty: 1000,
          onFailure: {
            effects: [
              { kind: 'thread', thread: 'daylight', by: -3 },
              { kind: 'mark', mark: 'lost-light' },
            ],
            ledger: 'Tried to hurry the blessing and lost the light.',
          },
        },
      ],
      success: 'You keep her moving.',
      failure: 'She blesses you too, at great length.',
      onFailure: 'forward',
    },
    { kind: 'narrative', when: { has: 'lost-light' }, text: 'Dusk falls before the pass.' },
    {
      kind: 'narrative',
      when: { lacks: 'lost-light' },
      text: 'You reach the pass with light to spare.',
    },
    { kind: 'leg', text: 'A day on the hill road.', days: 1, region: 'hill-road' },
    {
      kind: 'camp',
      text: 'You make camp below the pass.',
      picks: 2,
      activities: [
        {
          kind: 'charge',
          label: 'Sit with Sister Ume',
          text: 'She tells you about her brother, who walked this road and never came down.',
          guarded: 'She asks about your family instead.',
          opensWhen: { thread: 'trust', atLeast: 2 },
          outcome: { effects: [{ kind: 'mark', mark: 'knows-why' }] },
        },
        {
          kind: 'watch',
          label: 'Take first watch',
          stat: 'perception',
          difficulty: 0,
          success: 'A figure on the rocks ahead, gone when you look again.',
          failure: 'Nothing but wind.',
          onSuccess: { effects: [{ kind: 'mark', mark: 'saw-scouts' }] },
        },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
        { kind: 'crew', label: 'Sit with the others', when: { crew: 'team' } },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'knows-why' },
          text: 'She hands you the taper and asks you to light her brother’s lantern.',
          effects: [{ kind: 'pay', share: 0.25 }],
          ledger: 'Lit the lantern with her.',
        },
        { text: 'She thanks you at the shrine gate.' },
      ],
    },
  ],
};

export const storyPack: ContentPack = {
  ...original,
  missions: [...original.missions, STORY_JOB],
  locations: original.locations.map((l) => ({
    ...l,
    places: l.places.map((p) =>
      p.kind === 'missions' ? { ...p, missionIds: [...p.missionIds, STORY_JOB.id] } : p,
    ),
  })),
};

export const storyCtx: GameContext = createGameContext(storyPack);
