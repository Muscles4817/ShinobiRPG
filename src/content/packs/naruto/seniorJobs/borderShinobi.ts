import type { MissionDef } from '@/systems/missions';

/**
 * B-rank work against other villages' shinobi on the Leaf's side of the line: a Stone survey
 * party at the Tenchi Bridge, and a Cloud sensor slipped out of a trade delegation in Tanzaku.
 * Chūnin work, so the foes are chūnin; what to do with them once caught is the job's question.
 */

export const STONE_SURVEYORS: MissionDef = {
  id: 'senior-stone-surveyors',
  title: 'The Stone Surveyors',
  rank: 'B',
  client: 'The Hokage’s office',
  summary:
    'Stone shinobi have been seen measuring the gorge at the Tenchi Bridge. Find out what they are drawing, and stop them drawing it.',
  slots: 4,
  energyCost: 35,
  reward: { ryo: 620, reputation: 10 },
  minMissionsCompleted: 9,
  goesTo: 'tenchi-bridge',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'North and west through the hills to the gorge.' },
    {
      kind: 'narrative',
      text: 'The bridge hangs over the gorge like a thread, and on the far cliff fresh chalk marks run down the rock at even spacing.',
    },
    {
      kind: 'check',
      text: 'Whoever made the marks is still near, and the gorge throws every sound back twice.',
      approaches: [
        { label: 'Read the chalk marks', stat: 'intellect', difficulty: 13 },
        { label: 'Feel for chakra on the cliffs', stat: 'perception', difficulty: 13 },
        { label: 'Climb down and look underneath', stat: 'chakraControl', difficulty: 13 },
      ],
      success:
        'The marks are a survey of the bridge’s footings, and the surveyors are camped on a ledge below the far end, where nobody on the bridge would see them.',
      failure:
        'You find the ledge at last, but a stone dropped from above tells you they found you first.',
      onFailure: 'penalty',
      failureDamage: 6,
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'retrieve',
      ground: 'forest',
      text: 'Two Stone chūnin sit on the ledge with a drawing board between them, the bridge’s footings sketched out to the last bolt.',
      enemyIds: ['foe-iwagakure-scout-chunin', 'foe-iwagakure-trapper-chunin'],
      canFlee: true,
      flavour: {
        parley:
          'The older of the two lays the drawing board down. “Take it,” she says. “We were told the Leaf had nobody out this far.”',
      },
    },
    {
      kind: 'decision',
      text: 'The survey is yours. The question is what to do with the people who drew it.',
      when: { lacks: 'slipped-past' },
      options: [
        {
          label: 'Bring them back for questioning',
          tone: 'earnest',
          reply:
            'You bind their hands and walk them home along the hill road, and neither says a word the whole way.',
          effects: [{ kind: 'mark', mark: 'surveyors-taken' }],
          ledger: 'Brought the Stone surveyors home for the interrogation corps.',
        },
        {
          label: 'Send them home with a message',
          tone: 'challenge',
          reply:
            'You tear the drawing in half and give them one half to carry home. “Tell them the Leaf watches its bridges,” you say.',
          effects: [
            { kind: 'mark', mark: 'surveyors-sent-home' },
            { kind: 'pay', share: -0.2 },
          ],
          ledger: 'Sent the surveyors home with half their drawing and a warning.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'surveyors-taken' },
          text: 'The interrogation corps learns that the Stone is counting the Leaf’s bridges, all of them, and the Hokage’s office begins counting the Stone’s.',
        },
        {
          when: { has: 'surveyors-sent-home' },
          text: 'The Hokage’s office calls the message a risk worth taking, and a quieter answer than a pair of prisoners would have been.',
        },
        {
          text: 'You bring back the survey and leave the surveyors to explain to their own village what happened to it.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

export const CLOUD_DELEGATION: MissionDef = {
  id: 'senior-cloud-delegation',
  title: 'The Delegation’s Shadow',
  rank: 'B',
  client: 'The Hokage’s office',
  summary:
    'A Cloud trade delegation in Tanzaku has one more shinobi in it than it signed for. Find the extra one before they find what they came for.',
  slots: 4,
  energyCost: 35,
  reward: { ryo: 660, reputation: 11 },
  minMissionsCompleted: 12,
  goesTo: 'tanzaku-town',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'Down the river road to Tanzaku.' },
    {
      kind: 'narrative',
      text: 'The Cloud delegation has taken a whole inn by the castle, and its guards sit in the doorway pretending to play go.',
    },
    {
      kind: 'check',
      text: 'The extra shinobi left the inn last night and hasn’t come back. Someone in the town has seen where they went.',
      approaches: [
        { label: 'Ask the gambling halls', stat: 'willpower', difficulty: 12 },
        { label: 'Read the inn’s ledger', stat: 'intellect', difficulty: 13 },
        { label: 'Follow their chakra from the doorway', stat: 'perception', difficulty: 14 },
      ],
      success:
        'They have been asking about Leaf families with pale eyes, and they paid a boatman to wait for them tonight below the castle wall.',
      failure:
        'The trail is cold by the time you find it, and the boatman is already gone with his boat.',
      onFailure: 'penalty',
      failureDamage: 4,
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'eliminate',
      ground: 'town',
      text: 'A Cloud sensor waits on the river steps below the castle wall, eyes shut, feeling the town for a chakra they mean to carry home.',
      enemyIds: ['foe-kumogakure-sensor-chunin'],
      canFlee: true,
      flavour: {
        parley:
          '“I was sent to look,” they say, opening their eyes. “Only to look. You can tell your Hokage the Cloud still wants what it always wanted.”',
      },
    },
    {
      kind: 'decision',
      text: 'The delegation will sail at dawn. They will either sail with their missing shinobi or without them.',
      when: { lacks: 'slipped-past' },
      options: [
        {
          label: 'Hand them back to the delegation, quietly',
          tone: 'quiet',
          reply:
            'The head of the delegation takes their shinobi back without a word, and the trade talks go on as if nothing had happened.',
          effects: [{ kind: 'mark', mark: 'cloud-quiet' }],
          ledger: 'Handed the sensor back quietly, so the trade talks stayed whole.',
        },
        {
          label: 'March them through the town in daylight',
          tone: 'challenge',
          reply:
            'Half of Tanzaku watches a Cloud shinobi walked to the castle in ropes, and the delegation sails a day early.',
          effects: [
            { kind: 'mark', mark: 'cloud-shamed' },
            { kind: 'pay', share: 0.2 },
          ],
          ledger: 'Shamed the delegation in front of the town; the castle paid a bonus for it.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'cloud-quiet' },
          text: 'The Hokage reads your report twice and puts it in a drawer with others like it, from years ago.',
        },
        {
          when: { has: 'cloud-shamed' },
          text: 'The Hyūga send a cask of good sake to your door, and the Hokage’s office sends a sterner letter than you expected.',
        },
        {
          text: 'The sensor goes home empty-handed, and the delegation sails as if they had never been one shinobi short.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};
