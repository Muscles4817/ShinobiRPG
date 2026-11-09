import type { MissionDef } from '@/systems/missions';

/**
 * A-rank work at the Leaf's borders: a Hyūga child taken by the Cloud and carried north, a Mist
 * jōnin who wants to come over with the Blood Register in their head, and Sand jōnin watching
 * the Leaf from the Land of Rivers. Jōnin work, or chūnin under one.
 */

export const HYUGA_TAKEN: MissionDef = {
  id: 'senior-hyuga-taken',
  title: 'Pale Eyes Carried North',
  rank: 'A',
  client: 'Hiashi Hyūga',
  summary:
    'A child of the Hyūga branch house was taken from the compound last night. The Cloud is the only village that wants her that badly, and its border is two days away.',
  slots: 6,
  energyCost: 40,
  reward: { ryo: 1100, reputation: 17 },
  minMissionsCompleted: 14,
  goesTo: 'valley-of-the-end',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'North at a run, along the river road.' },
    {
      kind: 'check',
      text: 'The kidnappers have a night’s start and know the Leaf will follow. They will have laid false trails for it.',
      approaches: [
        { label: 'Read which trail is real', stat: 'perception', difficulty: 14 },
        { label: 'Go where the Cloud would cross', stat: 'intellect', difficulty: 14 },
        { label: 'Outrun the false trails', stat: 'speed', difficulty: 15 },
      ],
      success:
        'You come on them at the falls, waiting for a boat on the far bank, with the child asleep under a sealing tag.',
      failure:
        'You reach the falls as the boat pushes off, and have to cross the water to stop it.',
      onFailure: 'penalty',
      failureDamage: 8,
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'escort',
      ground: 'lake',
      text: 'A Cloud captain stands over the sleeping child at the foot of the statues, and a scout watches the river road you came by.',
      enemyIds: ['foe-kumogakure-captain-chunin', 'foe-kumogakure-scout-chunin'],
      canFlee: false,
      flavour: {
        slipped:
          'You take the child from under the captain’s hand while the scout is looking the other way, and you are across the river before either of them turns.',
      },
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'escort',
      ground: 'forest',
      text: 'Half a day south a Cloud sensor drops out of the trees in front of you. They have felt the child’s chakra all the way from the falls.',
      enemyIds: ['foe-kumogakure-sensor-chunin'],
      canFlee: false,
      bypassable: false,
      flavour: {
        parley:
          'The sensor looks at the child asleep on your back and steps out of the road. “I have a daughter her age,” they say. “Go on.”',
      },
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'Hiashi takes the child from your arms at the compound gate without a word to you, and that night a Hyūga elder brings a letter of thanks with the clan’s seal on it.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

export const MIST_DEFECTOR: MissionDef = {
  id: 'senior-mist-defector',
  title: 'The Man Who Kept the Register',
  rank: 'A',
  client: 'The Hokage’s office',
  summary:
    'A Mist jōnin who kept the Blood Register wants to come over to the Leaf, with every page of it in his head. He is waiting in the Land of Waves, and so are the people sent to stop him.',
  slots: 6,
  energyCost: 40,
  reward: { ryo: 1250, reputation: 18 },
  minMissionsCompleted: 18,
  goesTo: 'land-of-waves',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'South to the coast, as quietly as you can.' },
    {
      kind: 'narrative',
      text: 'Kōsuke of the Amibari is a thin man with ink on his fingers who flinches at every boat. “They burned my copy,” he says. “They forgot I wrote it.”',
    },
    {
      kind: 'decision',
      text: 'The Mist will send a jōnin for a man like this. You can meet them on your own ground, or try to be gone before they arrive.',
      options: [
        {
          label: 'Set a trap on the mudflats',
          tone: 'challenge',
          reply:
            'You spend the night burying tags in the mud at low tide, with Kōsuke holding the lantern and asking how long the seals last underwater.',
          effects: [{ kind: 'mark', mark: 'flats-trapped' }],
          ledger: 'Mined the mudflats where the Mist would come ashore.',
        },
        {
          label: 'Leave tonight by the coast road',
          tone: 'quiet',
          reply: 'You leave before moonrise with Kōsuke wrapped in a fisherman’s coat.',
          effects: [{ kind: 'mark', mark: 'left-early' }],
          ledger: 'Moved Kōsuke out before the Mist could land.',
        },
      ],
    },
    {
      kind: 'check',
      when: { has: 'flats-trapped' },
      text: 'The tide comes in faster than you planned, and the tags have to hold under a foot of seawater.',
      approaches: [
        { label: 'Seal them against the water', stat: 'fuuinjutsu', difficulty: 14 },
        { label: 'Hold the chakra in them yourself', stat: 'chakraControl', difficulty: 15 },
      ],
      success:
        'When the masks wade ashore at dawn the flats go up under them, and only their captain comes on.',
      failure: 'The sea gets into the seals, and the masks wade ashore untouched.',
      onFailure: 'forward',
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'escort',
      ground: 'lake',
      text: 'A Mist jōnin walks out of the fog on the water with two hunter-nin at his back, and Kōsuke goes white beside you.',
      enemyIds: ['foe-kirigakure-captain-jonin', 'mist-hunter-nin'],
      canFlee: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'Kōsuke spends a month in a quiet room with the interrogation corps, writing the Blood Register out again from memory, and the Leaf learns which of the Mist’s bloodlines are still alive.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

export const SAND_WATCHERS: MissionDef = {
  id: 'senior-sand-watchers',
  title: 'Watchers in the Reeds',
  rank: 'A',
  client: 'The Hokage’s office',
  summary:
    'The Sand is the Leaf’s ally on paper. Someone in the Land of Rivers is counting Leaf patrols for it anyway. Find out who, and what they have sent home.',
  slots: 6,
  energyCost: 40,
  reward: { ryo: 1150, reputation: 16 },
  minMissionsCompleted: 16,
  goesTo: 'land-of-rivers',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'West along the hill road and down into the reeds.' },
    {
      kind: 'check',
      text: 'The watchers move between the river islands and never sleep in the same reeds twice.',
      approaches: [
        { label: 'Hide in the reeds and wait', stat: 'stamina', difficulty: 14 },
        { label: 'Read where they must cross', stat: 'intellect', difficulty: 14 },
        { label: 'Feel for chakra across the water', stat: 'perception', difficulty: 15 },
      ],
      success:
        'Their camp is on a sandbar at the meeting of two rivers, and their reports go out tied to a hawk at dusk.',
      failure: 'The hawk is already in the air when you find the sandbar.',
      onFailure: 'penalty',
      failureDamage: 6,
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'eliminate',
      ground: 'desert',
      text: 'A Sand jōnin sits on the sandbar writing in a small neat hand, and a sensor lies on their back beside the fire with their eyes shut.',
      enemyIds: ['foe-sunagakure-scout-jonin', 'foe-sunagakure-sensor-chunin'],
      canFlee: true,
      flavour: {
        parley:
          'The jōnin closes the book. “Allies count each other,” they say. “Your Hokage knows that. Take it to him.”',
      },
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'The Sand’s notebook lists every Leaf patrol on the western border for a season, with the hours they change watch, and the Hokage reads it with a face like stone.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};
