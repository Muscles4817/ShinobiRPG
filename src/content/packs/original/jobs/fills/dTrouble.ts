import type { MissionFill } from '../../../../missionTemplates';

/** D-rank jobs with something at the end: small hauntings, raiding beasts and petty thieves. */
export const D_TROUBLE: readonly MissionFill[] = [
  {
    id: 'ghost-in-the-classroom',
    templateId: 'd-minor-haunting',
    minMissionsCompleted: 2,
    values: {
      title: 'The Ghost in the Old Classroom',
      client: 'Academy Caretaker Mokuzō',
      place: 'the old academy classroom that nobody uses any more',
      signs:
        'Chalk squeaks on the board behind the locked door every night. In the morning, the same line is written over and over, in a child’s hand, from one wall to the other.',
      steeled:
        'You read the line aloud, all the way through, and walk into the classroom as the chalk goes on squeaking.',
      shaken:
        'You find yourself sitting at a desk, writing the line yourself, before you shake free and stand up.',
      ghost:
        'A boy in an old academy uniform stands at the board, writing his lines. “I have to finish,” he says without turning. “Sensei said I can’t go home until I finish.”',
      foe: 'storehouse-wraith',
      slipped:
        'You slip past him to the teacher’s desk and find an old punishment slip pinned under the lid, never signed off. You sign it.',
      ending:
        'The caretaker lights a lantern on the boy’s desk. In the morning the board is clean, and at the bottom someone has written “thank you”, very neatly.',
    },
  },
  {
    id: 'cold-tea-at-the-willow-house',
    templateId: 'd-minor-haunting',
    minMissionsCompleted: 3,
    values: {
      title: 'Cold Tea at the Willow House',
      client: 'Tea-House Mistress Fusa',
      place: 'the Willow House tea-room on the canal',
      signs:
        'Every evening the best table sets itself for two. The tea goes cold the moment it is poured, and the customers leave without knowing why.',
      steeled:
        'You sit down at the set table, pour yourself a cup of cold tea, and wait for whoever it was set for.',
      shaken:
        'A grief that is not yours sits in your chest so heavily you have to step outside, before you can come back and sit at the table.',
      ghost:
        'A woman in an old-fashioned kimono sits opposite you, looking at the door. “He said he would come,” she says. “He promised. I ordered for us both.”',
      foe: 'storehouse-wraith',
      slipped:
        'While she watches the door, you find the letter she clutches, a soldier’s note of apology from long ago, never opened. You set it on the table.',
      ending:
        'Fusa hangs a lantern over the table and pours one last cup, hot. In the morning the cup is empty, and the table has been left for anyone.',
    },
  },
  {
    id: 'hand-in-the-canal',
    templateId: 'd-minor-haunting',
    minMissionsCompleted: 4,
    values: {
      title: 'The Hand in the Canal',
      client: 'Boatman Chōkichi',
      place: 'the dark stretch of canal under the old tannery',
      signs:
        'Under the tannery the floating lanterns go out one by one, and boatmen swear a cold hand closes on their poles and pulls.',
      steeled:
        'You wade into the dark water where the lanterns go out, step by step, until the cold is enough to stop your breath.',
      shaken:
        'A cold hand grips your ankle and drags you under, and you come up spluttering on the steps before you go back in.',
      ghost:
        'A grey shape rises from the water, reaching for the lantern in your hand. It is a young man with weed in his hair, and he wants the light so badly.',
      foe: 'canal-drowned',
      slipped:
        'You slip past the drowned man to the tannery wall, where a lantern bracket hangs empty over the water, the place he fell from.',
      ending:
        'Chōkichi hangs a lantern on the empty bracket. The floating lanterns drift past it unharmed that night, and the boatmen bow as they pass.',
    },
  },
  {
    id: 'mill-that-grinds-at-night',
    templateId: 'd-minor-haunting',
    minMissionsCompleted: 7,
    values: {
      title: 'The Mill That Grinds at Night',
      client: 'Miller Tora',
      place: 'the old water-mill on Mill Lane',
      signs:
        'The millstones turn at night with the sluice shut, grinding nothing, and the flour sacks are found torn open in the morning, licked clean.',
      steeled:
        'You walk into the mill with the stones roaring and the floor shaking, and find the cold heart of it by the empty hopper.',
      shaken:
        'A hunger that is not your own claws at your belly until you are licking flour from your fingers, and you have to force yourself back to your feet.',
      ghost:
        'A thin boy crouches by the millstones, stuffing raw flour into his mouth. “The famine winter,” he says. “There was flour here. There was always flour here.”',
      foe: 'hungry-ghost',
      slipped:
        'You slip past him to the miller’s shrine, where the offering bowl has been empty for years, and fill it with rice from your own pack.',
      ending:
        'Miller Tora sets a lantern and a bowl of rice by the millstones every night after. The stones stay still, and the sacks are never torn again.',
    },
  },
  {
    id: 'thieves-in-the-plum-orchard',
    templateId: 'd-pest-beast',
    minMissionsCompleted: 1,
    values: {
      title: 'Thieves in the Plum Orchard',
      client: 'Orchard-Keeper Umeko',
      place: 'the plum orchard at the foot of Mount Reikon',
      damage:
        'Umeko shows you branch after branch stripped bare, and the ground strewn with plum stones. “They take one bite of each and throw it away,” she says. “Spoilt brats.”',
      spoor:
        'Small hand prints in the mud, plum stones dropped in a neat line towards the trees, and a broken basket hung up in a cedar like a trophy.',
      beast:
        'In the cedar’s fork a big grey macaque sits on a heap of plums, eating one, and bares his teeth at you over it.',
      foe: 'reikon-macaque',
      terrain:
        'A tall cedar with low branches, an orchard of slender trees all round, and a stream at the bottom it could run along.',
      ending:
        'Umeko hangs bells in the plum trees to keep the troop away, and gives you a jar of plum wine that is older than you are.',
    },
  },
  {
    id: 'shrine-offerings-thief',
    templateId: 'd-pest-beast',
    minMissionsCompleted: 2,
    values: {
      title: 'The Shrine Offerings Thief',
      client: 'The Wayside Shrine Priest',
      place: 'the wayside shrines along the north road',
      damage:
        'The priest shows you shrine after shrine with their offering dishes licked clean and knocked over, and a stone fox with a bite out of its ear.',
      spoor:
        'Muddy paw prints on the offering ledges, rice scattered from shrine to shrine, and a sound like snoring from somewhere under the road.',
      beast:
        'In a culvert beneath the road a fat tanuki lies on a bed of stolen offerings, wearing a shrine’s paper charm on its head like a hat.',
      foe: 'feral-tanuki',
      terrain:
        'A narrow culvert under the road, a ditch full of reeds on either side, and a farm track it could bolt down.',
      ending:
        'The priest puts fresh offerings on every shrine, and one extra on a stone at the end of the road, just in case the tanuki comes back hungry.',
    },
  },
  {
    id: 'thief-at-the-fish-weir',
    templateId: 'd-pest-beast',
    minMissionsCompleted: 3,
    values: {
      title: 'The Thief at the Fish Weir',
      client: 'Fisherman Isaburō',
      place: 'the fish traps below the river weir',
      damage:
        'Isaburō hauls up trap after trap, every one torn open and empty. “Every night,” he says. “Not even a fish head left. It eats better than I do.”',
      spoor:
        'Wet paw prints on the weir stones, a slick trail through the reeds, and fish bones piled neatly under an upturned boat.',
      beast:
        'Under the upturned boat a feral tanuki is gorging on the night’s catch, too greedy to notice you coming.',
      foe: 'feral-tanuki',
      terrain:
        'An upturned boat, a slick of mud down to the water, and the roaring weir behind it where nothing would choose to go.',
      ending:
        'Isaburō’s traps come up full for the first time in weeks, and he grills the biggest fish right there on the bank and shares it with you.',
    },
  },
  {
    id: 'monkeys-in-the-temple-kitchen',
    templateId: 'd-pest-beast',
    minMissionsCompleted: 5,
    values: {
      title: 'Monkeys in the Temple Kitchen',
      client: 'Temple Cook Gendō',
      place: 'the kitchen of the mountain temple on the Reikon road',
      damage:
        'The kitchen is a ruin of overturned pots, smashed jars and rice everywhere. Gendō stands in the middle of it with a ladle like a sword.',
      spoor:
        'Rice grains lead out of the kitchen window, along the temple wall and up into the pine woods, with a stolen spoon dropped halfway.',
      beast:
        'High in a pine a macaque is teaching two smaller ones to open a pickle jar, and they are watching him very carefully.',
      foe: 'reikon-macaque',
      terrain:
        'Tall pines with branches close together, a steep slope down to the temple wall, and a ravine on the far side.',
      ending:
        'Gendō sets a monkey-proof latch on the kitchen window and feeds you a whole lunch while he tells you what he would have done with the ladle.',
    },
  },
  {
    id: 'stolen-wind-chimes',
    templateId: 'd-petty-thief',
    minMissionsCompleted: 2,
    values: {
      title: 'The Stolen Wind-Chimes',
      client: 'Glassblower Tamaki',
      stolen: 'a whole summer’s worth of glass wind-chimes',
      scene:
        'The shop’s shelves are bare, the door is untouched, and there is a single sliver of coloured glass on the roof tiles above the window.',
      lead: 'The glass on the roof leads over the rooftops to the abandoned dye-works by the river, where you can hear wind-chimes tinkling inside.',
      thief:
        'In the dye-works an academy dropout is hanging chimes from every rafter, and the whole building rings like a temple.',
      foe: 'academy-dropout',
      parley:
        '“I just wanted to hear them all at once,” he mutters, taking down the chimes. “Nobody ever hears them all at once.”',
    },
  },
  {
    id: 'rope-house-thief',
    templateId: 'd-petty-thief',
    minMissionsCompleted: 3,
    values: {
      title: 'The Rope-House Thief',
      client: 'The Shimenawa Rope-House',
      stolen: 'a bale of sacred hemp, blessed for the shrine ropes',
      scene:
        'The storehouse lock has been picked, very neatly. Behind the bales someone has left a cut length of hemp knotted into a crude seal, half finished.',
      lead: 'The knot is a seal from the academy’s first year, done wrong, and the only place selling cheap seal-rope this week is a stall under the north bridge.',
      thief:
        'Under the north bridge a young man is selling lengths of sacred hemp to passing pilgrims as charms, and knotting each one badly.',
      foe: 'academy-dropout',
      parley:
        '“They didn’t let me past the first year,” he says, handing the bale over. “I still remember the knots. I wanted somebody to want them.”',
    },
  },
  {
    id: 'nets-from-the-ferry-landing',
    templateId: 'd-petty-thief',
    minMissionsCompleted: 4,
    values: {
      title: 'Nets from the Ferry Landing',
      client: 'The Ferry Landing Fishers',
      stolen: 'every net from the ferry landing, and a morning’s catch',
      scene:
        'The drying racks are empty, the boats are untouched, and there is a deep scrape on the jetty where a heavy hull was dragged to the water.',
      lead: 'The scrape is from a skiff’s keel, and a stolen skiff has been seen tied up at the reed islands downstream, where the river pirates camp.',
      thief:
        'On the reed island a river pirate is spreading the stolen nets to dry, the catch smoking over his fire.',
      foe: 'river-pirate',
      parley:
        '“Fine, fine,” he says, throwing the nets into the skiff. “The fish are yours too. I already ate the best one.”',
    },
  },
  {
    id: 'weavers-missing-silk',
    templateId: 'd-petty-thief',
    minMissionsCompleted: 6,
    values: {
      title: 'The Weaver’s Missing Silk',
      client: 'Weaver Orie of Loom Lane',
      stolen: 'a bolt of lantern-red silk, woven for a clan wedding',
      scene:
        'The loom room is untouched, except for the empty peg where the silk hung, and a red thread caught on a nail by the back window.',
      lead: 'The red thread leads to a gambling den behind the Paper Lantern, where someone has paid a debt in red silk this very morning.',
      thief:
        'Behind the gambling den a big man is cutting the silk into lengths to sell, with the shears he took from Orie’s workbench.',
      foe: 'bandit-thug',
      parley:
        '“It was that or my hands,” he mutters, rolling the silk back up with surprising care. “Tell her I never cut the middle.”',
    },
  },
];
