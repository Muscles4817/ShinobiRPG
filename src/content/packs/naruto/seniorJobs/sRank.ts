import type { MissionDef } from '@/systems/missions';

/**
 * S-rank work: jōnin sent with a chūnin squad after shinobi of their own grade. A swordsman who
 * left the Mist and sells his blade in Tanzaku, a pair of Cloud missing-nin picking off the
 * Leaf's forest posts, and the Wandering Sword Saint, who has come to the Valley of the End to
 * find out whether the Leaf has anyone worth crossing blades with.
 */

export const MIST_SWORD_FOR_HIRE: MissionDef = {
  id: 'senior-mist-sword-for-hire',
  title: 'A Mist Blade for Hire',
  rank: 'S',
  client: 'The Hokage’s office',
  summary:
    'A swordsman who walked out of the Mist with a jōnin’s skill and a grudge has taken a contract in Tanzaku. Nobody knows on whom. End it before he does.',
  slots: 8,
  energyCost: 50,
  reward: { ryo: 1800, reputation: 24 },
  minMissionsCompleted: 22,
  goesTo: 'tanzaku-town',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'Down the river road to Tanzaku, fast.' },
    {
      kind: 'check',
      text: 'He has been in the town three days and nobody has seen him. Someone has been paying to keep it that way.',
      approaches: [
        { label: 'Follow the money', stat: 'intellect', difficulty: 16 },
        { label: 'Feel for a killer’s chakra', stat: 'perception', difficulty: 17 },
        { label: 'Make yourself the target', stat: 'willpower', difficulty: 16 },
      ],
      success:
        'His contract is on the castle’s steward, and he means to do it in the morning mist on the moat bridge, where the steward walks every day.',
      failure:
        'You find out whose name is on his contract as the steward’s scream comes from the moat bridge.',
      onFailure: 'penalty',
      failureDamage: 10,
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'eliminate',
      ground: 'lake',
      text: 'The mist on the moat thickens until you can’t see the water, and a voice in it asks whether the Leaf sent you to die or to watch.',
      enemyIds: ['rogue-kirigakure-frontliner-jonin'],
      canFlee: true,
      talkable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'The steward pays the Leaf twice over and asks who wanted him dead. The swordsman’s purse has the answer, in a lord’s seal.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

export const CLOUD_PAIR: MissionDef = {
  id: 'senior-cloud-pair',
  title: 'The Pair in the Great Forest',
  rank: 'S',
  client: 'The Hokage’s office',
  summary:
    'Three of the Leaf’s forest posts have gone silent in a month, each after a storm on a clear night. Two Cloud missing-nin are working their way along the border. Stop them before the fourth.',
  slots: 8,
  energyCost: 50,
  reward: { ryo: 1900, reputation: 25 },
  minMissionsCompleted: 25,
  goesTo: 'great-forest',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'Out along the forest track to the last post standing.' },
    {
      kind: 'narrative',
      text: 'The burnt posts are all the same. The walls are scorched from inside, and nobody had time to send a hawk.',
    },
    {
      kind: 'decision',
      text: 'The fourth post is the obvious target, and the Cloud pair will know you know it.',
      options: [
        {
          label: 'Hold the fourth post and wait for them',
          tone: 'earnest',
          reply:
            'You wait in the post with its frightened chūnin for two nights, and on the third the sky goes white.',
          effects: [{ kind: 'mark', mark: 'held-the-post' }],
          ledger: 'Held the fourth post and made the Cloud pair come to you.',
        },
        {
          label: 'Hunt them in the forest instead',
          tone: 'challenge',
          reply: 'You leave the post to its garrison and go into the trees after them.',
          effects: [{ kind: 'mark', mark: 'hunted-them' }],
          ledger: 'Went after the Cloud pair in the trees rather than wait for them.',
        },
      ],
    },
    {
      kind: 'check',
      when: { has: 'hunted-them' },
      text: 'The pair don’t leave tracks, but their sensor feels the forest the way a spider feels its web.',
      approaches: [
        { label: 'Hide your chakra and creep in', stat: 'chakraControl', difficulty: 17 },
        { label: 'Leave a false chakra for them to chase', stat: 'genjutsu', difficulty: 16 },
      ],
      success: 'You find their camp before they feel you, and the fight starts on your terms.',
      failure: 'They feel you coming a mile off and choose where the fight will be.',
      onFailure: 'penalty',
      failureDamage: 10,
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'eliminate',
      ground: 'forest',
      text: 'Two Cloud missing-nin in grey cloaks stand among the trees, one with lightning running down both arms and the other with their eyes shut, listening to you.',
      enemyIds: ['rogue-kumogakure-captain-jonin', 'rogue-kumogakure-sensor-jonin'],
      canFlee: true,
      talkable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'held-the-post' },
          text: 'The fourth post stands, and its chūnin carve your name into the doorpost beside the names of the three posts that fell.',
        },
        {
          text: 'The Cloud pair’s bounty is paid by the Cloud itself, which sends it with a letter saying they were never theirs.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};

export const SWORD_SAINT: MissionDef = {
  id: 'senior-sword-saint',
  title: 'The Sword Saint at the Falls',
  rank: 'S',
  client: 'The Hokage’s office',
  summary:
    'The Wandering Sword Saint has crossed four countries cutting down every swordsman who would face him, and has sent word that he will wait at the Valley of the End for the Leaf’s best.',
  slots: 8,
  energyCost: 50,
  reward: { ryo: 2000, reputation: 28 },
  minMissionsCompleted: 30,
  goesTo: 'valley-of-the-end',
  endsAt: 'konohagakure',
  stages: [
    { kind: 'road', to: 'outbound', text: 'North along the river road to the falls.' },
    {
      kind: 'narrative',
      text: 'He is sitting on the First Hokage’s stone head when you come, with his sword across his knees and his eyes on the water.',
    },
    {
      kind: 'decision',
      text: 'He asks whether you have come to fight him, or only to make him go away.',
      options: [
        {
          label: 'To fight him',
          tone: 'challenge',
          reply: 'He stands, and for the first time he smiles.',
          effects: [{ kind: 'mark', mark: 'accepted-duel' }],
          ledger: 'Answered the Sword Saint’s challenge as he asked it to be answered.',
        },
        {
          label: 'To ask why he wants a Leaf blade',
          tone: 'curious',
          reply:
            '“Your White Fang cut me once,” he says, “when I was young and good. I came to find out if his village kept any of it.”',
          effects: [{ kind: 'mark', mark: 'heard-him-out' }],
          ledger: 'Heard the Sword Saint out before the duel.',
        },
      ],
    },
    {
      kind: 'combat',
      text: 'The falls roar behind him. He doesn’t move until you do.',
      enemyIds: ['wandering-sword-saint'],
      canFlee: true,
      ground: 'lake',
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'heard-him-out' },
          text: 'The Sword Saint gives you his whetstone, worn hollow in the middle, and says the White Fang would have been glad of you.',
        },
        {
          text: 'Word goes round every sword school in the Fire Country that the Wandering Sword Saint went to the Valley of the End and didn’t walk away from it.',
        },
      ],
    },
    { kind: 'road', to: 'home' },
  ],
};
