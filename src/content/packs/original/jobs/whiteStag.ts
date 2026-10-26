import type { MissionDef } from '@/systems/missions';

/**
 * The White Stag: a protect job in the deep woods (`docs/design/chakra-beasts-plan.md`).
 * Poachers are after a white stag the shrine says is older than the village. The job is to keep
 * it alive, and if it dies the job fails, however many poachers you stop.
 */
export const WHITE_STAG: MissionDef = {
  id: 'the-white-stag',
  title: 'The White Stag',
  rank: 'C',
  client: 'The Shrine of the Cedar Hill',
  summary: 'Poachers have gone into the deep woods after the white stag. Bring it through alive.',
  slots: 6,
  energyCost: 35,
  reward: { ryo: 520, reputation: 10 },
  minMissionsCompleted: 6,
  once: true,
  stages: [
    {
      kind: 'narrative',
      text: 'The shrine’s priest holds out a white hair as long as a hand. “Its antlers would buy a house in the capital. Two men went in after it two days ago, with a dog.”',
    },
    {
      kind: 'leg',
      text: 'Off the shrine path and in under the old cedars, following the dog’s tracks.',
      days: 1,
      region: 'woods-edge',
      danger: 'armed',
    },
    {
      kind: 'check',
      text: 'The poachers’ tracks split at a stream. One set goes on after the stag; the other doubles back to wait for whoever follows.',
      approaches: [
        {
          label: 'Follow the set that went on',
          stat: 'perception',
          difficulty: 10,
          role: 'tracker',
          onSuccess: { ledger: 'Kept to the poachers who went after the stag.' },
        },
        {
          label: 'Go round the ambush and cut ahead',
          stat: 'speed',
          difficulty: 10,
          onSuccess: { ledger: 'Went round the poachers’ ambush and got ahead of them.' },
        },
      ],
      success: 'You get ahead of them by the middle of the day, and hear the dog off to your left.',
      failure: 'You walk into the men waiting by the stream, and lose the morning to them.',
      onFailure: 'forward',
      failureDamage: 6,
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'eliminate',
      ground: 'forest',
      text: 'In a clearing a man is stringing nets between the trees, and a second holds the dog.',
      enemyIds: ['village-hunter', 'guard-dog', 'bandit-knifeman'],
      canFlee: false,
      flavour: {
        terrain:
          'A clearing among cedars with nets strung across one side and a stream on the other.',
      },
    },
    {
      kind: 'leg',
      text: 'On into the heart of the wood, where the stag’s tracks lead.',
      days: 1,
      region: 'woods-heart',
      danger: 'elite',
    },
    {
      kind: 'decision',
      text: 'The stag stands in a ring of cedars, whiter than the shrine’s paper. There is a snare round one hind leg, and it has pulled the wire tight trying to get free.',
      options: [
        {
          label: 'Go to it slowly and cut the wire',
          tone: 'kind',
          reply:
            'It lets you come close enough to touch, shaking all over. The wire comes away, and it doesn’t run.',
          effects: [{ kind: 'mark', mark: 'freed-the-stag' }],
          ledger: 'Cut the snare off the white stag’s leg.',
        },
        {
          label: 'Stay back and keep watch for the rest of them',
          tone: 'quiet',
          reply:
            'You keep to the trees. After an hour the stag works its own leg free, and limps into the cedars.',
          ledger: 'Watched the white stag free itself.',
        },
      ],
    },
    {
      kind: 'check',
      text: 'A bowstring creaks behind you. A third poacher, the one the priest didn’t know about, has an arrow on the stag.',
      approaches: [
        { label: 'Get between them', stat: 'speed', difficulty: 11 },
        { label: 'Throw first', stat: 'kenjutsu', difficulty: 11 },
        { label: 'Talk them down', stat: 'willpower', difficulty: 12 },
        {
          label: 'Call the stag to you',
          stat: 'willpower',
          difficulty: 8,
          when: { has: 'freed-the-stag' },
        },
      ],
      success:
        'The arrow goes into the cedar a hand’s width from the stag, and the poacher drops the bow.',
      failure: 'The arrow takes the stag through the neck, and it falls in the ring of cedars.',
      onFailure: 'abort',
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'freed-the-stag' },
          text: 'The stag walks with you as far as the edge of the old trees, then turns back into the wood. The priest laughs out loud when you tell them.',
          effects: [{ kind: 'memory', text: 'the white stag in the cedars' }],
        },
        {
          text: 'The poachers go to the village under guard. The priest burns the white hair at the shrine and rings the bell once.',
          effects: [{ kind: 'memory', text: 'the white stag in the cedars' }],
        },
      ],
    },
    {
      kind: 'leg',
      text: 'Back out through the edge of the wood with the poachers roped together.',
      days: 1,
      region: 'woods-edge',
      danger: 'armed',
    },
  ],
};
