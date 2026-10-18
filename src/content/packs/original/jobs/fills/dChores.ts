import type { MissionFill } from '../../../../missionTemplates';

/** D-rank runaways and hard graft: the first jobs a genin is handed, across the whole village. */
export const D_CHORES: readonly MissionFill[] = [
  {
    id: 'shrine-goat',
    templateId: 'd-lost-animal',
    minMissionsCompleted: 0,
    values: {
      title: 'The Shrine Goat',
      client: 'Shrine Maiden Natsume',
      animal: 'the shrine’s white goat, Okayu',
      plea: '“She eats the prayer slips,” Natsume admits, “which the priests say is a kind of blessing. She also eats sandals, sleeves and anything written in red. Please hurry.”',
      trail:
        'Half-chewed prayer slips lie down the shrine hill stair like a paper trail, and every one of them was a wish for money.',
      caught:
        'You find Okayu in the moneylender’s garden, eating his ledger off the veranda. She comes away with a page still in her mouth and no regrets.',
      chase:
        'Okayu leads you through three back gardens, a laundry yard and a funeral, butting you into a pond on the way, before she trots home by herself.',
      ending:
        'Natsume ties a bell round Okayu’s neck. The goat eats the bell’s ribbon at once, and Natsume laughs until she has to sit down on the shrine steps.',
    },
  },
  {
    id: 'archivists-owl',
    templateId: 'd-lost-animal',
    minMissionsCompleted: 1,
    values: {
      title: 'The Archivist’s Owl',
      client: 'Archivist Senri',
      animal: 'a horned owl called Footnote',
      plea: '“He keeps the mice out of the scrolls,” Senri says, polishing his spectacles too hard. “He has never once left the archive. He hates daylight and he cannot stand bells.”',
      trail:
        'A single grey feather is caught in the archive’s skylight, and the noon bell on the shrine hill has just finished ringing.',
      caught:
        'You find Footnote in the darkest corner of the old granary, glaring at the bell tower through a knot-hole. He steps onto your arm as if he had sent for you.',
      chase:
        'Footnote flaps from shadow to shadow across the whole Lantern District, hooting at you from every eave, and only comes down when the sun does.',
      ending:
        'Senri carries Footnote back to his beam among the scrolls and reads him a page aloud to settle him. The owl falls asleep halfway through a sentence.',
    },
  },
  {
    id: 'smiths-dog',
    templateId: 'd-lost-animal',
    minMissionsCompleted: 2,
    values: {
      title: 'The Smith’s Dog',
      client: 'Forge Apprentice Tetsu',
      animal: 'the forge dog, a three-legged hound called Bellows',
      plea: 'Tetsu’s face is black with soot and streaked under the eyes. “He sleeps by the furnace. Thunder scares him half to death, and there was thunder last night. Master will kill me if he’s gone.”',
      trail:
        'There are scorch-dark paw prints, three to a set, leading from the forge door towards the river, and then nothing but rain-washed stone.',
      caught:
        'You find Bellows under the ferry steps, shaking, wedged in tight against the warm stones of a bathhouse flue. He licks your face all the way home.',
      chase:
        'Bellows bolts every time a cart rumbles, which in the market is always. You chase him the length of Market Street before he hides behind your legs.',
      ending:
        'The master smith pretends not to care, then quietly hammers a little iron cover for the furnace grate, so Bellows can lie closer when it storms.',
    },
  },
  {
    id: 'widows-rooster',
    templateId: 'd-lost-animal',
    minMissionsCompleted: 0,
    reward: { ryo: 65, reputation: 2 },
    values: {
      title: 'The Widow’s Rooster',
      client: 'Widow Kasane',
      animal: 'a fighting rooster called General',
      plea: '“My husband raised him,” Kasane says, counting out her coins twice. “He crows at the lanterns every evening, as if he could wake them. He hates the miller’s cockerel more than sin.”',
      trail:
        'The hens in the yard are in an uproar, and there is a single bronze tail feather on the path that runs down to the mill.',
      caught:
        'General is on the mill roof, puffed up to twice his size, shouting down at the miller’s cockerel. You grab him mid-crow and he forgives you by the gate.',
      chase:
        'General fights the miller’s cockerel, the miller’s cat and very nearly the miller before you pin him under your jacket, pecked bloody on both hands.',
      ending:
        'That evening General crows as the lanterns come on along the farm road, and Kasane stands in her doorway and listens to him as if to an old song.',
    },
  },
  {
    id: 'charcoal-for-the-forge',
    templateId: 'd-hard-graft',
    minMissionsCompleted: 0,
    values: {
      title: 'Charcoal for the Forge',
      client: 'The Kurogane Forge',
      task: 'haul a winter’s worth of charcoal up to the clan forge',
      setup:
        'A mountain of charcoal sacks waits at the bottom of the forge lane. The forge-wife hands you a carrying frame and says the master wants them all up by dark.',
      labour:
        'The lane is steep and cobbled, every sack sheds black dust down your neck, and there are more of them every time you come back down.',
      twist:
        'One sack is warm. When you open it, a single coal is burning red inside, though the rest are cold and black, and it will not go out when you smother it.',
      twistHandled:
        'You carry the coal up in your bare cupped hands, because it does not burn you, and the master smith drops it into the furnace with a little bow.',
      twistBotched:
        'You tip the coal into the gutter to be rid of it, and spend an hour fishing it out again with tongs while the forge-wife shouts at you.',
      ending:
        'The last sack goes up as the furnace roars. The master smith says the forge has not burned so clean in years, and he does not explain why.',
    },
  },
  {
    id: 'mending-the-weir',
    templateId: 'd-hard-graft',
    minMissionsCompleted: 2,
    values: {
      title: 'Mending the River Weir',
      client: 'The River Wardens',
      task: 'restack the stones of the river weir before the autumn floods',
      setup:
        'The spring floods have torn a gap in the weir, and the river is pouring through it. A warden with a face like a walnut points at a heap of boulders on the bank.',
      labour:
        'Each stone has to be rolled down the bank and set by hand in cold water up to your waist, and the current shoves you sideways with every step.',
      twist:
        'Among the fallen stones is one with a name carved into it, worn almost smooth, and a little dish of rice set on top as if someone had left it this morning.',
      twistHandled:
        'You set the carved stone back in the weir face first, where it was, and leave the rice. The warden tells you the name belongs to a lock-keeper who drowned long ago.',
      twistBotched:
        'You heave the carved stone into the gap with the rest, face down. The warden makes you dig it out and set it right, and the river makes you pay for it.',
      ending:
        'By evening the weir holds and the river runs smooth over it. The fish traps fill again below, and a boy on the bank cheers every stone you set.',
    },
  },
  {
    id: 'scaffolds-for-the-gate',
    templateId: 'd-hard-graft',
    minMissionsCompleted: 3,
    values: {
      title: 'Scaffolds for the Great Gate',
      client: 'The Hibana Lamplighters’ Guild',
      task: 'raise the scaffolds for hanging the great gate lanterns',
      setup:
        'The great lantern gate towers over the north road, and its lanterns have to come down for new paper. A Hibana foreman with burn-scarred hands hands you a coil of rope.',
      labour:
        'Bamboo poles twice the height of a house have to be hauled upright and lashed fast, while the foreman shouts that they are not straight.',
      twist:
        'With the lanterns down and dark, one of them lights itself in the middle of the afternoon, with nobody near it and no oil in its cup.',
      twistHandled:
        'You fetch a Tōkaku keeper instead of blowing it out. She sits with the lantern a while, talking to it under her breath, and it goes out on its own.',
      twistBotched:
        'You try to snuff it with your hat. The flame jumps to the hat, and the foreman has to throw a bucket over you both.',
      ending:
        'At dusk the great lanterns go back up in fresh paper, and the whole north road turns gold. The foreman claps you on the back and leaves a sooty handprint.',
    },
  },
  {
    id: 'terrace-walls',
    templateId: 'd-hard-graft',
    minMissionsCompleted: 5,
    reward: { ryo: 130, reputation: 3 },
    values: {
      title: 'Walls for the Tea Terraces',
      client: 'Tea Grower Oshima',
      task: 'rebuild the terrace walls the rains washed out on the tea slopes',
      setup:
        'Three terraces have slumped into one long brown smear down the hill. Oshima, small and fierce in a straw hat, has already marked every stone with chalk.',
      labour:
        'The fallen stones are buried in mud, and every one must be dug out, carried up the slope and fitted back like a puzzle without a picture.',
      twist:
        'Behind the old wall your spade rings on a clay jar, sealed with wax and heavy with coins, wrapped in a note in a child’s hand.',
      twistHandled:
        'You read the note before anyone else does. It is Oshima’s own, from when she was small and saving for a pony. She goes very quiet and then laughs aloud.',
      twistBotched:
        'You drop the jar and it splits, scattering old coins down the slope. Half the afternoon goes on picking them out of the tea bushes.',
      ending:
        'The new walls hold the rain the very next night. Oshima sends you home with a tin of the first picking, and the old coins, which she says are yours now.',
    },
  },
];
