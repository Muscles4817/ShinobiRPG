import type { ConversationTopic } from '../../../types';

/** What each role in the village gives templated talk: the work, its weight and its beginnings. */
export const ROLE_TOPICS: readonly ConversationTopic[] = [
  {
    kind: 'role',
    key: 'genin',
    values: {
      work: 'lost cats, leaky roofs, long drills and the odd job that turns out to be a real one',
      weight:
        'Everyone calls them a child with a headband. Nobody sees how often they come home bruised from jobs that were meant to be easy.',
      memory:
        'On their first job they spent a whole day weeding a garden, and the old owner paid them in plums.',
      hope: 'That we both make it to the next rank. Together, I mean. I don’t want to go up alone.',
    },
  },
  {
    kind: 'role',
    key: 'sensei',
    values: {
      work: 'reports on their pupils, lesson plans written at midnight, and missions of their own when the team is resting',
      weight:
        'Every job they send their pupils on is one they have imagined going wrong, in detail, the night before.',
      memory:
        'Their first team ran rings round them for a month. They still keep the prank letter those children left on their door.',
      hope: 'That one day you teach me something. That is how I will know I did this properly.',
    },
  },
  {
    kind: 'role',
    key: 'instructor',
    values: {
      work: 'chalk dust, marking papers, breaking up scuffles and teaching the same hand signs to a new class every spring',
      weight:
        'They remember every pupil who passed through their classroom, including the ones who never came back from a mission.',
      memory:
        'In their first lesson they wrote a seal on the board upside down, and a child at the back was the only one who noticed.',
      hope: 'That you never stop being the child who asks why. Keep that, whatever rank you reach.',
    },
  },
  {
    kind: 'role',
    key: 'leader',
    values: {
      work: 'petitions, disputes, old grudges and choosing who goes where, and who might not come back',
      weight:
        'Every name on the memorial stone is one they signed a mission order for. They read the list more often than anyone knows.',
      memory:
        'Before anyone answered to them, they were a nervous genin who got lost on their first patrol and was found asleep in a tree.',
      hope: 'That you grow strong enough to tell me when I’m wrong, and brave enough to actually do it.',
    },
  },
  {
    kind: 'role',
    key: 'shinobi',
    values: {
      work: 'night watches, sealed orders, long roads and reports nobody will ever read aloud',
      weight:
        'Most of what they do can never be talked about, so when friends ask how work is going, they talk about the weather.',
      memory:
        'On their first real mission they froze at a river crossing, and a stranger on the same team carried them over without a word.',
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
        'On their first day of honest work they broke three bowls, and their master kept the pieces to tease them with for years.',
      hope: 'That you come home for supper, every time. The village is only the village while people come home.',
    },
  },
];
