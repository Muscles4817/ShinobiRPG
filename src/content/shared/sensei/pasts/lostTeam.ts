import type { SenseiPast } from '../../../senseiParts';

/** The only one of their team to come home, and the rogue who made it so. */
export const LOST_TEAM: SenseiPast = {
  id: 'lost-team',
  wound:
    '{name} came home from {place} the only one of {name.their} old team. {lost} was the last to fall.',
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
      'The ambusher who caught {name}’s old team at {place}. Older now, and no less careful.',
    art: 'kenjutsu',
    encounter: 'lone-rogue',
  },
  beats: [
    {
      opener:
        '{them} is turning {keepsake} over in {them.their} hands when you come by. It isn’t {them.theirs}. “Old habit,” {them} says. “Never mind it.”',
      choices: [
        {
          label: 'Ask whose it was',
          tone: 'curious',
          reply: '“A friend’s,” {them} says, and puts it away. “Another time.”',
        },
        {
          label: 'Sit with {them.them} a while and say nothing',
          tone: 'quiet',
          reply: '{them} seems glad you didn’t ask.',
        },
        {
          label: 'Joke about lucky charms',
          tone: 'joke',
          reply: '“It wasn’t very lucky,” {them} says, but almost smiles.',
        },
      ],
    },
    {
      opener:
        '“I had a team once,” {them} says, out of nowhere, watching the three of you train. “Like yours. Loud, like yours.”',
      choices: [
        {
          label: 'Ask what happened to them',
          tone: 'curious',
          reply: '“They grew up,” {them} says. “Most of them.” And changes the subject.',
        },
        {
          label: 'Tell {them} your team is lucky',
          tone: 'kind',
          reply: '{them} looks at you oddly. “Luck,” {them} says. “Yes.”',
        },
        {
          label: 'Ask if your team is as good as {them.theirs}',
          tone: 'challenge',
          reply: '“Better,” {them} says. “You have a worse sensei to make up for.”',
        },
      ],
    },
    {
      opener:
        '{them} tells it plainly, as if it happened to someone else, the job at {place} and the ambush in the rain and {lost} shouting for the others to run. “I ran,” {them} says. “I was the one who was meant to lead.”',
      choices: [
        {
          label: 'Tell {them} running was what {lost} wanted',
          tone: 'kind',
          reply: '“I know,” {them} says. “Knowing doesn’t help as much as you’d think.”',
        },
        {
          label: 'Ask who set the ambush',
          tone: 'curious',
          reply: '“A rogue called {foe},” {them} says. “I have looked for {foe} every year since.”',
        },
        {
          label: 'Just listen',
          tone: 'quiet',
          reply:
            '{them} talks until the light goes. When {them} stops, something between you is different.',
        },
      ],
    },
    {
      opener:
        '{them} finds you at dawn, already dressed for the road. “Word came from {place},” {them} says. “{foe} has been seen there. I’m going. I would rather not go alone.”',
      choices: [
        {
          label: '“We’re coming.”',
          tone: 'earnest',
          reply: '“I hoped you would say that,” {them} says. “I was afraid you would, too.”',
        },
        {
          label: '“Is this justice, or revenge?”',
          tone: 'challenge',
          reply: '“I’ll tell you when we get there,” {them} says. “I don’t know yet.”',
        },
        {
          label: '“Then we bring {lost} home too, in a way.”',
          tone: 'kind',
          reply: '{them} has to look away for a moment. “Yes,” {them} says. “In a way.”',
        },
      ],
    },
  ],
  arc: {
    title: 'The Rain at {place}',
    summary: '{name}’s old team fell at {place}, and {foe} is back there.',
    ledger: {
      found: 'Found {foe}’s hollow under a rock face.',
      mercy: 'Told {name} to bring {foe} home for the village to judge.',
      leave: 'Left the choice to {name}.',
      finish: 'Told {name} to end it.',
      spared: 'Brought {foe} home bound and alive.',
      ended: '{foe} died where {name}’s team fell.',
    },
    find: {
      title: 'Back to {place}',
      summary: '{name} wants to see the place again, and find where {foe} is hiding.',
      act: 'Find where {foe} is hiding near {place}.',
      gate: '{name} says nothing at the gate. {keepsake} hangs from {name}’s belt.',
      road: 'The road to {place}. {name} sets a hard pace and doesn’t talk.',
      check:
        'Near {place} the signs are old and new at once, a cold camp beside a fresh one and a path someone wanted hidden.',
      found: 'A hollow under a rock face, a blade-rack, a fire banked for someone coming back.',
      lost: 'The trail runs out on wet stone. {name} finds the hollow anyway, as if {name} always knew.',
      camp: 'You camp out of sight of it. {name} sits up all night, facing the dark.',
      ending:
        '“Not now,” {name} says at last. “Next time we come, we finish it.” {name} turns for home without another word.',
      home: 'Back down the road to the village.',
    },
    settle: {
      title: 'What {name} Owes',
      summary: 'Back to {place}, to settle it with {foe}.',
      act: 'Go back with {name} and settle it.',
      road: 'The road again. This time {name} talks the whole way, about {lost}.',
      question:
        'At the edge of {place}, {name} stops. “I could end {foe} here,” {name} says. “Or bring {foe} home to answer for it. What would you do?”',
      mercy: {
        label: '“Bring {foe.them} home. Let the village judge.”',
        reply: '{name} breathes out, long. “That is what {lost} would have said.”',
      },
      leave: {
        label: '“It’s yours to decide.”',
        reply: '“Then I won’t become what {foe} is,” {name} says.',
      },
      finish: { label: '“End it.”', reply: '{name}’s face goes hard. “Maybe,” {name} says.' },
      appears:
        '{foe} steps out of the rain as if no time has passed at all. “You,” {foe} says to {name}. “I wondered when.”',
      spared:
        '{name} brings {foe} home bound and alive. At the stone for the dead, {name} stops a long while. “It’s done, {lost},” {name} says.',
      ended:
        '{foe} doesn’t get up. {name} stands in the rain a long time. “It’s done,” {name} says. It doesn’t sound like peace.',
      home: 'The road home, quieter than you came.',
    },
  },
};
