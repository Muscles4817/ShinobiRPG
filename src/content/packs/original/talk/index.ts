import type { ConversationTopic } from '../../../types';

/**
 * What the setting’s clans give templated talk about clans to say. Clanless families have
 * none: their talk comes from their art, traits and role instead.
 */
export const CLAN_TOPICS: readonly ConversationTopic[] = [
  {
    kind: 'clan',
    key: 'hibana',
    values: {
      clan: 'the Hibana',
      duty: 'a steady breath and a lit lantern at every dusk, whatever the weather and whatever the mood',
      elder:
        'my great-uncle, who lit the gate lantern every evening for sixty years and only missed it the night he died',
      rite: 'the first lighting, when a child breathes their own flame into a lantern while the whole clan waits in the dark',
      burden:
        'Everyone expects them to have a temper, so the one time they lose it, nobody is surprised. They hate that most of all.',
      secret:
        'Some nights the great lanterns burn a colour none of us can make. We don’t talk about it. We just light the next one.',
    },
  },
  {
    kind: 'clan',
    key: 'tokaku',
    values: {
      clan: 'the Tōkaku',
      duty: 'patience with the dead, who are slow to listen, and silence about what they say',
      elder:
        'my grandfather, who sets a place at dinner for my grandmother every night, and swears she complains about the soup',
      rite: 'the walk to the river on a child’s first festival night, carrying a lantern for someone they never met',
      burden:
        'They see the dead whether they want to or not. Some mornings the street is very crowded, and nobody else notices.',
      secret:
        'Not every spirit wants to go home. Some ask us to leave their lantern unlit. We are not supposed to listen, and sometimes we do.',
    },
  },
  {
    kind: 'clan',
    key: 'kurogane',
    values: {
      clan: 'the Kurogane',
      duty: 'a first blade forged by their own hand at twelve, and every blade after it worth the steel',
      elder:
        'my aunt, who can tell from the ring of a sword across the yard whether the smith was angry when they made it',
      rite: 'the quenching, when a child’s first blade is cooled in water from the shrine spring and named out loud',
      burden:
        'Their first blade cracked in the quench. The clan said nothing, which was worse than anything they could have said.',
      secret:
        'There is a sword in the back of the forge that nobody is allowed to draw. I drew it once. It was warm, and it knew my name.',
    },
  },
  {
    kind: 'clan',
    key: 'shimenawa',
    values: {
      clan: 'the Shimenawa',
      duty: 'clean hands, a careful knot, and no word of complaint when the cold gets into their bones',
      elder:
        'my great-grandmother, who still ties a rope at the shrine every morning though her fingers can barely bend',
      rite: 'the binding of the shrine ropes on the longest night, when every knot must be tied before the last brazier dies',
      burden:
        'Their body tires before their will does. Some days the rope is easy and the walk home is the hardest thing they do.',
      secret:
        'The ropes don’t only hold the dead in. The oldest ones hold something out, and only the head of the clan knows what.',
    },
  },
];
