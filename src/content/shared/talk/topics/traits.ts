import type { ConversationTopic } from '../../../types';

/** What each personality trait gives templated talk: habits, old stories and quiet admissions. */
export const TRAIT_TOPICS: readonly ConversationTopic[] = [
  {
    kind: 'trait',
    key: 'brash',
    values: {
      habit: 'vaulting the fence instead of walking the extra few steps to the gate',
      story:
        'At the academy they challenged the top of the class to a duel on the first morning, and lost before lunch.',
      cost: 'They charged a wasp nest on a mission to look brave. The swelling lasted a week, and so did the jokes.',
      admission: 'Half the time I jump in because if I stop to think, I’ll see how scared I am.',
      wish: 'someone who can wait for the right moment and still look like they meant it',
    },
  },
  {
    kind: 'trait',
    key: 'calm',
    values: {
      habit: 'folding their hands and counting to five before answering anything that matters',
      story:
        'When the academy kitchen caught fire, they finished their sentence, then fetched the right bucket.',
      cost: 'A friend once mistook their quiet for not caring, and stopped talking to them for a season.',
      admission:
        'I’m not calm inside. I just learned early that nobody listens to the one who shouts.',
      wish: 'the people who laugh out loud without first checking who is watching',
    },
  },
  {
    kind: 'trait',
    key: 'diligent',
    values: {
      habit: 'writing tomorrow’s drills on a slip of paper before going to sleep',
      story:
        'At the academy they swept the training hall every evening, because nobody had told them it was a punishment.',
      cost: 'They trained straight through a festival once, and missed the only one their grandparent lived to see.',
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
        'They slept through an academy written test, woke for the last question, and still passed.',
      cost: 'They put off sharpening their kunai until the morning it mattered. It mattered.',
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
        'At the academy they lost a sparring match on purpose, because the other child’s parents were watching.',
      cost: 'They lent their savings to a friend in trouble. The friend left the village, and the money went too.',
      admission:
        'Sometimes I’m kind because I can’t bear anyone being cross with me. That’s not the same thing.',
      wish: 'someone who can say no without spending the whole night feeling sorry about it',
    },
  },
  {
    kind: 'trait',
    key: 'cunning',
    values: {
      habit: 'sitting where they can see every door, and remembering who comes in through which',
      story:
        'At the academy they traded lunch for answers, answers for favours, and favours for a key to the scroll room.',
      cost: 'They talked their way out of trouble so often that nobody believed them the one time they told the truth.',
      admission:
        'I’ve never been caught, it’s true. I’ve also never once been sure anyone liked me for myself.',
      wish: 'someone so honest it never even occurs to them to play an angle',
    },
  },
  {
    kind: 'trait',
    key: 'proud',
    values: {
      habit: 'mending their own clothes badly rather than asking anyone to show them how',
      story:
        'They lost a race at the academy by a hand’s width, then ran the course alone every night until they could beat the time.',
      cost: 'They refused help on a climb and fell the last stretch. They still tell people it was a jump.',
      admission: 'Losing doesn’t frighten me. Being pitied does. I’d rather bleed than be pitied.',
      wish: 'the people who can say ‘I don’t know’ out loud and not flinch',
    },
  },
  {
    kind: 'trait',
    key: 'humble',
    values: {
      habit: 'thanking the cook, the porter and the person who swept the street, by name',
      story:
        'At the academy they won the throwing prize and spent the ceremony praising the child who came second.',
      cost: 'They let someone else take the credit for their plan, and the wrong person was made squad leader.',
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
        'At the academy they climbed into the library through the skylight, to read the scrolls that were kept on the top shelf.',
      cost: 'They opened a sealed box on a mission because they had to know. The client has not hired them since.',
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
        'At the academy they spent a whole term on one throwing drill, and ignored every other lesson until it was perfect.',
      cost: 'They were so deep in practice that they missed a friend leaving the village, and never got to say goodbye.',
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
        'At the academy they did push-ups until the instructor gave up, handed them the keys and went home.',
      cost: 'They trained through a fever to keep up their laps, and spent the next fortnight in a hospital bed.',
      admission:
        'If I keep moving, I don’t have to think. Rest is the hard part, and I’m not good at it.',
      wish: 'the people who can sit by a river all afternoon and call it a good day',
    },
  },
];
