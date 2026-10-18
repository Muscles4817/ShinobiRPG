import type { ArcDef, MissionDef } from '@/systems/missions';

import { KOUN_LETTER, STRONGROOM_SWORD } from './kounFavoursEnd';
import { ASH_LANTERNS_BARGAIN, KOUN, KOUN_GRACE, WEDDING_DANCE } from './kounFavoursStart';

/**
 * Kōun's Three Favours: a list of tasks with its last item held back, each in a different
 * genre (a wedding comedy, a heist with a crew whose loyalty surfaces mid-job, a ghost story).
 * The third favour is the one he couldn't do himself, at the east bridge where his comrade
 * died. What you found and how you behaved on the first two decide how kindly it ends, and at
 * the end he speaks for you.
 */

export const EAST_BRIDGE: MissionDef = {
  id: 'arc-koun-east-bridge',
  title: 'The East Bridge',
  rank: 'C',
  client: KOUN,
  summary: 'The third favour, at last: go to the east bridge at the new moon, and ask a question.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 480, reputation: 8 },
  minMissionsCompleted: 5,
  stages: [
    {
      kind: 'narrative',
      text: '“Tsugumi held the far end of the bridge,” Kōun says, not sweeping now. “I held the near end. When the order came to fall back, I stayed, and I never went back across for her. She walks there at the new moon. Ask her if she forgives me. I can’t.”',
    },
    {
      kind: 'leg',
      text: 'Up into the pass to the old border, where the east bridge still spans the gorge.',
      days: 1,
      region: 'mountain-pass',
    },
    {
      kind: 'narrative',
      text: 'At the far end of the bridge a lantern is burning that nobody lit. Under it stands a woman in old armour, waiting, as she has waited every new moon since the war.',
    },
    {
      kind: 'decision',
      text: 'She looks past you, to the near end, for someone who isn’t there. “Did he send you instead?” she asks.',
      options: [
        {
          when: { remembers: KOUN_LETTER },
          label: 'Read her the letter she folded into his sword',
          tone: 'kind',
          reply:
            'You read it aloud: hold your end, whatever happens, and don’t you dare come back for me. She listens to her own words, and laughs. “He never could follow an order he agreed with,” she says.',
          effects: [
            { kind: 'mark', mark: 'at-peace' },
            { kind: 'mark', mark: 'letter-read' },
          ],
          ledger: 'Read Tsugumi the letter she folded into Kōun’s sword.',
        },
        {
          when: { tally: KOUN_GRACE, atLeast: 2 },
          label: 'Tell her what kind of man he has been since',
          tone: 'earnest',
          reply:
            'You tell her about the sweeping at dawn, the wedding he couldn’t bear to be seen at, the sword he held like a weight. She listens, and nods. “Then he’s still holding the bridge,” she says. “Tell him he can stop.”',
          effects: [{ kind: 'mark', mark: 'at-peace' }],
          ledger: 'Told Tsugumi what Kōun has been since the war.',
        },
        {
          label: 'Ask her plainly, for him',
          tone: 'curious',
          reply:
            '“Forgive him?” Her lantern flares. “He’s not even here.” The cold comes off the gorge like a wave.',
          ledger: 'Asked Tsugumi plainly. She wasn’t ready to answer.',
        },
      ],
    },
    {
      when: { lacks: 'at-peace' },
      kind: 'encounter',
      template: 'spirit',
      job: 'eliminate',
      text: 'She comes across the bridge with the war still in her, and the planks freeze where she steps.',
      enemyIds: ['reikon-shade'],
      canFlee: false,
      talkable: false,
      flavour: {
        terrain: 'A long bridge over a gorge, a lantern at each end, and nowhere to fall back to.',
      },
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'letter-read' },
          text: 'Footsteps on the near end. Kōun has come after all, the sword at his hip. He walks out to the middle of the bridge, and she walks out to meet him, and when the lantern goes out there is only one old man there, laughing and weeping at once.',
          effects: [
            { kind: 'world', mark: 'koun-favours-done' },
            { kind: 'memory', text: 'the night Kōun crossed the east bridge' },
          ],
          ledger: 'Kōun crossed the east bridge, and Tsugumi forgave him.',
        },
        {
          when: { has: 'at-peace' },
          text: 'Her lantern goes out gently. When you tell Kōun what she said, he puts down the broom and doesn’t pick it up again that morning.',
          effects: [{ kind: 'world', mark: 'koun-favours-done' }],
          ledger: 'Tsugumi forgave Kōun, and rests.',
        },
        {
          text: 'She breaks apart in the cold, unanswered. When you tell Kōun she is at rest, he thanks you, and knows you are being kind.',
          effects: [{ kind: 'world', mark: 'koun-favours-done' }],
          ledger: 'Laid Tsugumi to rest without an answer for Kōun.',
        },
      ],
    },
    { kind: 'leg', text: 'Down out of the pass, towards the village lights.', days: 1 },
  ],
};

export const KOUN_FAVOURS_JOBS: readonly MissionDef[] = [
  ASH_LANTERNS_BARGAIN,
  WEDDING_DANCE,
  STRONGROOM_SWORD,
  EAST_BRIDGE,
];

export const KOUN_FAVOURS: ArcDef = {
  id: 'kouns-three-favours',
  title: 'Kōun’s Three Favours',
  summary: 'Kōun, the Ash Lantern, has asked for you by name.',
  acts: [
    {
      beats: ['you', 'need'],
      title: 'The bargain',
      text: 'The old hero who sweeps the training ground wants three favours, and will name only two.',
      jobs: [ASH_LANTERNS_BARGAIN.id],
    },
    {
      beats: ['go', 'search'],
      title: 'Two favours',
      text: 'Dance at a wedding he swore to dance at, and bring home the sword the village sold.',
      jobs: [WEDDING_DANCE.id, STRONGROOM_SWORD.id],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'The third favour',
      text: 'The favour he couldn’t do himself, at the east bridge, at the new moon.',
      jobs: [EAST_BRIDGE.id],
    },
  ],
  recommends: {
    personId: 'koun',
    words:
      'Kōun, the Ash Lantern, comes in from the training ground with the broom still in his hand. "{you} did three favours for an old man," he says, "and the last was the one I couldn’t." The {leader} looks at him a long while. "When did you last ask me for anything, Kōun?" "Never." "Kneel, then, and stand up a chūnin."',
  },
};
