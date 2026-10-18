import type { ConversationTopic } from '../../../types';

/** What each personality trait gives templated talk: habits, old stories and quiet admissions. */
export const TRAIT_TOPICS: readonly ConversationTopic[] = [
  {
    kind: 'trait',
    key: 'brash',
    values: {
      habit: 'vaulting the fence instead of walking the extra few steps to the gate',
      story:
        'At the academy {them.they} challenged the top of the class to a duel on the first morning, and lost before lunch.',
      cost: '{them.they} charged a wasp nest on a mission to look brave. The swelling lasted a week, and so did the jokes.',
      admission: 'Half the time I jump in because if I stop to think, I’ll see how scared I am.',
      wish: 'someone who can wait for the right moment and still look like they meant it',
    },
  },
  {
    kind: 'trait',
    key: 'calm',
    values: {
      habit:
        'folding {them.their} hands and counting to five before answering anything that matters',
      story:
        'When the academy kitchen caught fire, {them.they} finished {them.their} sentence, then fetched the right bucket.',
      cost: 'A friend once mistook {them.their} quiet for not caring, and stopped talking to {them.them} for a season.',
      admission:
        'I’m not calm inside, not really. I learned early that nobody listens to whoever shouts, so I stopped shouting, and the rest of it stayed.',
      wish: 'the people who laugh out loud without first checking who is watching',
    },
  },
  {
    kind: 'trait',
    key: 'diligent',
    values: {
      habit: 'writing tomorrow’s drills on a slip of paper before going to sleep',
      story:
        'At the academy {them.they} swept the training hall every evening, because nobody had told {them.them} it was a punishment.',
      cost: '{them.they} trained straight through a festival once, and missed the only one {them.their} grandparent lived to see.',
      admission:
        'If I stop working, even for a day, I’m afraid I’ll find out I was never any good.',
      wish: 'the ones who can lie in the grass all afternoon and not feel guilty about it',
    },
  },
  {
    kind: 'trait',
    key: 'lazy',
    values: {
      habit: 'finding the one patch of shade on any training ground within moments of arriving',
      story:
        '{them.they} slept through an academy written test, woke for the last question, and still passed.',
      cost: '{them.they} put off sharpening {them.their} kunai until the morning a bandit came over the wall, and {them.they} still wince{them.s} at the memory of that blunt edge.',
      admission:
        'I could try harder. I’m just afraid that trying and failing would be worse than not trying.',
      wish: 'the people who get up before dawn and seem to enjoy it, somehow',
    },
  },
  {
    kind: 'trait',
    key: 'kind',
    values: {
      habit: 'carrying a spare rice ball wrapped in cloth, always for somebody else',
      story:
        'At the academy {them.they} lost a sparring match on purpose, because the other child’s parents were watching.',
      cost: '{them.they} lent {them.their} savings to a friend in trouble. The friend left the village, and the money went too.',
      admission:
        'Sometimes I’m kind because I can’t bear anyone being cross with me, and I’m not sure that counts as kindness at all.',
      wish: 'someone who can say no without spending the whole night feeling sorry about it',
    },
  },
  {
    kind: 'trait',
    key: 'cunning',
    values: {
      habit:
        'sitting where {them.they} can see every door, and remembering who comes in through which',
      story:
        'At the academy {them.they} traded lunch for answers, answers for favours, and favours for a key to the scroll room.',
      cost: '{them.they} talked {them.their} way out of trouble so often that nobody believed {them.them} the one time {them.they} told the truth.',
      admission:
        'I’ve never been caught, it’s true. I’ve also never once been sure anyone liked me for myself.',
      wish: 'someone so honest it never even occurs to them to play an angle',
    },
  },
  {
    kind: 'trait',
    key: 'proud',
    values: {
      habit:
        'mending {them.their} own clothes badly rather than asking anyone to show {them.them} how',
      story:
        '{them.they} lost a race at the academy by a hand’s width, then ran the course alone every night until {them.they} could beat the time.',
      cost: '{them.they} refused help on a climb and fell the last stretch. {them.they} still tell{them.s} people it was a jump.',
      admission:
        'Losing doesn’t frighten me half as much as someone feeling sorry for me. I’d honestly rather bleed.',
      wish: 'the people who can say ‘I don’t know’ out loud and not flinch',
    },
  },
  {
    kind: 'trait',
    key: 'humble',
    values: {
      habit: 'thanking the cook, the porter and the person who swept the street, by name',
      story:
        'At the academy {them.they} won the throwing prize and spent the ceremony praising the child who came second.',
      cost: '{them.they} let someone else take the credit for {them.their} plan, and the wrong person was made squad leader.',
      admission:
        'I tell myself it’s modesty. Some days I think I just don’t want to be seen trying.',
      wish: 'someone who walks into a room as if it was built for them',
    },
  },
  {
    kind: 'trait',
    key: 'curious',
    values: {
      habit: 'taking apart anything with a hinge, a latch or a seal to see how it works',
      story:
        'At the academy {them.they} climbed into the library through the skylight, to read the scrolls that were kept on the top shelf.',
      cost: '{them.they} opened a sealed box on a mission because {them.they} had to know. The client has not hired {them.them} since.',
      admission:
        'I start a dozen things and finish one. I keep hoping the next one will be the one I stay with.',
      wish: 'the people who know exactly what they want and never wonder about the other road',
    },
  },
  {
    kind: 'trait',
    key: 'focused',
    values: {
      habit: 'eating the same breakfast every day so there is one less thing to think about',
      story:
        'At the academy {them.they} spent a whole term on one throwing drill, and ignored every other lesson until it was perfect.',
      cost: '{them.they} {them.was} so deep in practice that {them.they} missed a friend leaving the village, and never got to say goodbye.',
      admission:
        'When I put one thing down, it feels like I’ll never pick it up again. So I don’t put it down.',
      wish: 'someone who can wander off down a side path just to see where it goes',
    },
  },
  {
    kind: 'trait',
    key: 'tireless',
    values: {
      habit: 'running laps after the others have gone home, and a few more after that',
      story:
        'At the academy {them.they} did push-ups until the instructor gave up, handed {them.them} the keys and went home.',
      cost: '{them.they} trained through a fever to keep up {them.their} laps, and spent the next fortnight in a hospital bed.',
      admission:
        'If I keep moving, I don’t have to think. Rest is the hard part, and I’m not good at it.',
      wish: 'the people who can sit by a river all afternoon and call it a good day',
    },
  },
];
