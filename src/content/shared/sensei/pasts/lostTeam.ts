import type { SenseiPast } from '../../../senseiParts';

/** The only one of their team to come home, and the rogue who made it so. */
export const LOST_TEAM: SenseiPast = {
  id: 'lost-team',
  wound:
    '{name} came home from {place} the only one of {name.their} old team, and {lost} was the last of them to fall.',
  temperaments: ['iron-bell', 'big-sibling', 'old-soldier', 'quiet-blade', 'scholar'],
  regions: ['mountain-pass', 'forest-track', 'hill-road'],
  nudge: { grip: 'tight', onMissions: 'shield' },
  keepsakes: [
    'a cracked forehead protector',
    'a cord with three little bells on it',
    'a chipped kunai with someone else’s mark on the grip',
  ],
  foe: {
    epithet: 'the Ash Crow',
    kind: 'Rogue',
    description:
      'The ambusher who caught {name}’s old team at {place}, older now and no less careful than {foe.they} {foe.was} then.',
    art: 'kenjutsu',
    encounter: 'lone-rogue',
  },
  beats: [
    {
      opener:
        '{them} is turning {keepsake} over in {them.their} hands when you come by, and it isn’t {them.theirs}. “Never mind me. It’s an old habit, that’s all.”',
      choices: [
        {
          label: 'Ask whose it was',
          tone: 'curious',
          reply:
            '“A friend’s,” {them} says, putting it away. “I’ll tell you about it another time.”',
        },
        {
          label: 'Sit with {them.them} a while and say nothing',
          tone: 'quiet',
          reply:
            'You sit until the light changes, and when you get up {them} thanks you for not asking.',
        },
        {
          label: 'Joke about lucky charms',
          tone: 'joke',
          reply: '“It wasn’t very lucky for its owner,” {them} says, though not unkindly.',
        },
      ],
    },
    {
      opener:
        '“I had a team once,” {them} says out of nowhere, watching the three of you train. “Like yours, about your age. Just as loud as you lot, too.”',
      choices: [
        {
          label: 'Ask what happened to them',
          tone: 'curious',
          reply:
            '“They grew up. Most of them did.” Then {them} asks about your footwork, and that’s the end of that.',
        },
        {
          label: 'Tell {them} your team is lucky',
          tone: 'kind',
          reply: '“Lucky,” {them} repeats, looking at you oddly. “Yes, I hope you are.”',
        },
        {
          label: 'Ask if your team is as good as {them.theirs}',
          tone: 'challenge',
          reply:
            '“Better than mine was,” {them} says. “You’ve got a worse sensei to make up for, after all.”',
        },
      ],
    },
    {
      opener:
        '{them} tells it plainly, as if it happened to someone else, the job at {place} and the ambush in the rain and {lost} shouting for the others to run. “And I ran. I was the one who was meant to be leading them.”',
      choices: [
        {
          label: 'Tell {them} running was what {lost} wanted',
          tone: 'kind',
          reply:
            '“I know it was,” {them} says. “Knowing doesn’t help as much as you’d think it would.”',
        },
        {
          label: 'Ask who set the ambush',
          tone: 'curious',
          reply:
            '“A rogue called {foe}. I’ve been looking for {foe.them} one way or another every year since.”',
        },
        {
          label: 'Just listen',
          tone: 'quiet',
          reply:
            '{them} talks until the light goes. When {them} stops at last, you both know you’ve been trusted with it.',
        },
      ],
    },
    {
      opener:
        '{them} finds you at dawn, already dressed for the road. “Word came from {place}. {foe} has been seen there, and I’m going. I’d rather not go alone, if you’ll come.”',
      choices: [
        {
          label: '“We’re coming.”',
          tone: 'earnest',
          reply:
            '“I hoped you’d say that,” {them} says. “I was afraid you would, as well, if that makes any sense.”',
        },
        {
          label: '“Is this justice, or revenge?”',
          tone: 'challenge',
          reply: '“I don’t know yet. Ask me again when we get there, and I’ll tell you honestly.”',
        },
        {
          label: '“Then we bring {lost} home too, in a way.”',
          tone: 'kind',
          reply: '{them} has to look away before answering. “Yes. In a way we do.”',
        },
      ],
    },
  ],
  arc: {
    title: 'The Rain at {place}',
    summary: '{name}’s old team fell at {place}, and {foe} is back there.',
    find: {
      title: 'Back to {place}',
      summary: '{name} wants to see the place again, and find where {foe} is hiding.',
      act: 'Find where {foe} is hiding near {place}.',
      gate: '{name} is quiet at the gate, with {keepsake} hanging from {name.their} belt.',
      road: 'On the road to {place}, {name} sets a hard pace and doesn’t talk.',
      check:
        'Near {place} the signs are old and new at once, a cold camp beside a fresh one and a path someone wanted hidden.',
      found:
        'A hollow under a rock face, with a blade-rack and a fire banked for someone coming back.',
      lost: 'The trail runs out on wet stone, and {name} walks on to the hollow anyway, as if {name.they} had always known where it was.',
      camp: 'You camp out of sight of it, and {name} sits up all night facing the dark.',
      ending:
        '“Not now,” {name} says at last. “Next time we come, we finish it.” And {name} turns for home.',
      home: 'Back down the road to the village.',
    },
    settle: {
      title: 'What {name} Owes',
      summary: 'Back to {place}, to settle it with {foe}.',
      act: 'Go back with {name} and settle it.',
      road: 'On the road again, and this time {name} talks about {lost} the whole way.',
      question:
        'At the edge of {place}, {name} stops. “I could end {foe} here,” {name} says, “or bring {foe.them} home to answer for it. What would you do?”',
      mercy: {
        label: '“Bring {foe.them} home. Let the village judge.”',
        reply:
          '{name} lets out a long breath. “That’s just what {lost} would have said, you know.”',
      },
      leave: {
        label: '“It’s yours to decide.”',
        reply: '“Then I won’t turn into what {foe} is,” {name} says. “I can decide that much.”',
      },
      finish: {
        label: '“End it.”',
        reply: '{name}’s face goes hard. “Maybe. We’ll see when it comes to it.”',
      },
      appears:
        '{foe} steps out of the rain as if no time had passed at all. “You,” {foe} says to {name}. “I wondered when you’d come.”',
      spared:
        '{name} brings {foe} home bound and alive, and stops for a while at the stone for the dead. “It’s done, {lost},” {name} says to it.',
      ended:
        '{foe} doesn’t get up. {name} stands out in the rain until you have to fetch {name.them}, and says that it’s done, in a voice that doesn’t sound like peace.',
      home: 'The road home, quieter than you came.',
    },
  },
};
