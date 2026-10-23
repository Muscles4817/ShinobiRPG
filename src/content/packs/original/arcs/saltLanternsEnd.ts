import type { MissionDef } from '@/systems/missions';

import { HARBOUR } from './saltLanternsStart';

/** Salt in the Lanterns, acts three and four: the search in the port, and the light given back. */

export const WRECK_LANTERN: MissionDef = {
  id: 'arc-salt-wreck',
  title: 'The Lantern in the Wreck',
  rank: 'D',
  client: HARBOUR,
  summary: 'Dive the old wreck off the point, where the lights were seen under the water.',
  slots: 3,
  energyCost: 25,
  reward: { ryo: 120, reputation: 3 },
  minMissionsCompleted: 2,
  stages: [
    {
      kind: 'narrative',
      text: 'The wreck lies in green water off the point. Its mast still points at the sky, and its hold is full of a pale green light.',
      variants: [
        {
          when: { remembers: 'salt-saw-the-light' },
          text: 'You know where to look now. The pale light you saw from the road is down there, in the wreck’s hold.',
        },
      ],
    },
    {
      kind: 'check',
      text: 'In the hold, lashed to a beam, is a ship’s lantern, still burning under the sea. The cold is fierce.',
      approaches: [
        {
          label: 'Hold your breath and cut it free',
          stat: 'stamina',
          difficulty: 8,
          onSuccess: {
            effects: [{ kind: 'world', mark: 'salt-lantern-raised' }],
            ledger: 'Brought the drowned ship’s lantern up from the hold.',
          },
        },
        {
          label: 'Keep your nerve while the light watches you',
          stat: 'willpower',
          difficulty: 8,
          onSuccess: {
            effects: [{ kind: 'world', mark: 'salt-lantern-raised' }],
            ledger: 'Kept your nerve in the hold, and brought the lantern up.',
          },
        },
      ],
      success: 'You break the surface with the lantern in your arms. It is still burning.',
      failure:
        'You come up gasping, empty-handed. On the second dive the lantern is waiting by the hatch, as if it wants to be found.',
      onFailure: 'forward',
      failureDamage: 4,
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'Kai won’t touch the lantern. “That’s the Asagiri’s light,” he says. “She went down with her whole crew, thirty years back.”',
        },
      ],
    },
  ],
};

export const WHAT_UMI_SAW: MissionDef = {
  id: 'arc-salt-umi',
  title: 'What Umi Saw',
  rank: 'D',
  client: HARBOUR,
  summary: 'The fisher’s girl says she has seen who puts the shrine lanterns out. Hear her out.',
  slots: 2,
  energyCost: 10,
  reward: { ryo: 80, reputation: 2 },
  minMissionsCompleted: 2,
  stages: [
    {
      kind: 'decision',
      text: 'Umi sits on the breakwater, throwing knives at driftwood. “Nobody listens to me,” she says. “I saw them. Wet people, at the shrine, every night.”',
      options: [
        {
          label: 'Listen, and take it seriously',
          tone: 'earnest',
          reply:
            'She tells you all of it. Sailors come up dripping and fill the lanterns with seawater, as if to put out a fire they can’t reach.',
          effects: [
            { kind: 'world', mark: 'salt-umi-told' },
            { kind: 'memory', text: 'the night on the breakwater' },
          ],
          ledger: 'Umi told you she had seen drowned sailors at the shrine.',
        },
        {
          label: 'Tell her ghosts are a shinobi’s job',
          tone: 'tease',
          reply:
            'She scowls, then laughs, then tells you anyway. Wet sailors, at the shrine, putting the lights out one by one.',
          effects: [{ kind: 'world', mark: 'salt-umi-told' }],
          ledger: 'Umi told you, once she had finished being annoyed.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'The drowned crew can’t see their own ship’s light from the shrine, so they put out every other light instead.',
        },
      ],
    },
  ],
};

export const LIGHT_GIVEN_BACK: MissionDef = {
  id: 'arc-salt-light',
  title: 'The Light Given Back',
  rank: 'D',
  client: HARBOUR,
  summary: 'Give the drowned crew their ship’s light, and the harbour its lanterns. Then go home.',
  slots: 1,
  energyCost: 20,
  reward: { ryo: 200, reputation: 5 },
  minMissionsCompleted: 2,
  endsAt: 'torogakure',
  stages: [
    {
      kind: 'decision',
      text: 'At dusk the whole harbour watches you carry the Asagiri’s lantern down the breakwater. What do you do with it?',
      options: [
        {
          label: 'Hang it at the shrine, among the others',
          tone: 'kind',
          reply:
            'The wet shapes come up the steps at midnight, see their light, and stand there until dawn. Then they are gone, and every lantern is burning.',
          effects: [{ kind: 'world', mark: 'salt-shrine-lit' }],
          ledger: 'Hung the drowned ship’s light at the shrine, where its crew could find it.',
        },
        {
          label: 'Row it out and give it back to the sea',
          tone: 'quiet',
          reply:
            'You set it on the water over the wreck. It sinks slowly with its light still burning, and one by one the lights under the sea go out, as if a door had closed.',
          effects: [{ kind: 'world', mark: 'salt-light-returned' }],
          ledger: 'Gave the light back to the sea, over the wreck.',
        },
      ],
    },
    {
      kind: 'road',
      to: 'home',
      text: 'The coast road home, up through the terraces, with the harbour lights behind you.',
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { remembers: 'salt-umi-told' },
          text: 'Umi walked you to the edge of town. “Next time,” she said, “take me with you.” You think she meant it.',
        },
        {
          text: 'Kai shook your hand on the slipway as you left. The boats went out again that morning.',
        },
      ],
    },
  ],
};
