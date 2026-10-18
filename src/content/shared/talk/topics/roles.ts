import type { ConversationTopic } from '../../../types';

/** What each role in the village gives templated talk: the work, its weight and its beginnings. */
export const ROLE_TOPICS: readonly ConversationTopic[] = [
  {
    kind: 'role',
    key: 'genin',
    values: {
      work: 'lost cats, leaky roofs, long drills and the odd job that turns out to be a real one',
      weight:
        'Everyone calls {them.them} a child with a headband. Nobody sees how often {them.they} come{them.s} home bruised from jobs that were meant to be easy.',
      memory:
        'On {them.their} first job {them.they} spent a whole day weeding a garden, and the old owner paid {them.them} in plums.',
      hope: 'That we both make it to the next rank. Together, I mean. I don’t want to go up alone.',
    },
  },
  {
    kind: 'role',
    key: 'sensei',
    values: {
      work: 'reports on my pupils, lesson plans written at midnight, and missions of my own when the team is resting',
      weight:
        'Every job {them.they} send{them.s} {them.their} pupils on is one {them.they} {them.has} imagined going wrong, in detail, the night before.',
      memory:
        '{them.their} first team ran rings round {them.them} for a month. {them.they} still keep{them.s} the prank letter those children left on {them.their} door.',
      hope: 'That one day you teach me something. That is how I will know I did this properly.',
    },
  },
  {
    kind: 'role',
    key: 'instructor',
    values: {
      work: 'chalk dust, marking papers, breaking up scuffles and teaching the same hand signs to a new class every spring',
      weight:
        '{them.they} remember{them.s} every pupil who passed through {them.their} classroom, including the ones who never came back from a mission.',
      memory:
        'In {them.their} first lesson {them.they} wrote a seal on the board upside down, and a child at the back was the only one who noticed.',
      hope: 'That you never stop being the child who asks why. Keep that, whatever rank you reach.',
    },
  },
  {
    kind: 'role',
    key: 'leader',
    values: {
      work: 'petitions, disputes, old grudges and choosing who goes where, and who might not come back',
      weight:
        'Every name on the memorial stone is one {them.they} signed a mission order for. {them.they} read{them.s} the list more often than anyone knows.',
      memory:
        'Before anyone answered to {them.them}, {them.they} {them.was} a nervous genin who got lost on {them.their} first patrol and was found asleep in a tree.',
      hope: 'That you grow strong enough to tell me when I’m wrong, and brave enough to actually do it.',
    },
  },
  {
    kind: 'role',
    key: 'shinobi',
    values: {
      work: 'night watches, sealed orders, long roads and reports nobody will ever read aloud',
      weight:
        'Most of what {them.they} do{them.es} can never be talked about, so when friends ask how work is going, {them.they} talk{them.s} about the weather.',
      memory:
        'On {them.their} first real mission {them.they} froze at a river crossing, and a stranger on the same team carried {them.them} over without a word.',
      hope: 'That you get the easy missions for a long while yet. The hard ones will find you soon enough.',
    },
  },
  {
    kind: 'role',
    key: 'villager',
    values: {
      work: 'early starts, sore feet, neighbours who always want a word, and the small gossip of the street',
      weight:
        'When shinobi go out, they are the ones left counting who comes back, without ever being told why some don’t.',
      memory:
        'On {them.their} first day of honest work {them.they} broke three bowls, and {them.their} master kept the pieces to tease {them.them} with for years.',
      hope: 'That you come home for supper, every time. The village is only the village while people come home.',
    },
  },
];
