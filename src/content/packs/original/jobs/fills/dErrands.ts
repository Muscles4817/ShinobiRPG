import type { MissionFill } from '../../../../missionTemplates';

/** D-rank errands: parcels to carry across the village and people to bring home. */
export const D_ERRANDS: readonly MissionFill[] = [
  {
    id: 'rope-for-the-ferry',
    templateId: 'd-courier',
    minMissionsCompleted: 1,
    values: {
      title: 'A Rope for the Ferry',
      client: 'The Shimenawa Rope-House',
      parcel: 'a coil of blessed hemp rope, knotted with paper charms',
      recipient: 'the ferry-master at the river crossing',
      route:
        'The rope weighs as much as a sack of rice, it must not touch the ground, and the river road is a mire after last night’s rain.',
      routeWon:
        'You go along the tops of the field walls, rope over both shoulders, and reach the ferry with the charms still crisp and white.',
      routeLost:
        'A cart splashes you at the ford, and you arrive with the rope dry but the charms spattered brown with mud.',
      doorstep:
        'The ferry-master will not take the rope until the rope-house’s seal is checked against the old one, and the old one is at the bottom of the river.',
      ending:
        'The new rope goes onto the ferry posts with the old prayer, and the ferry-master rows you across and back twice for nothing, just to try it.',
    },
  },
  {
    id: 'midwifes-bag',
    templateId: 'd-courier',
    minMissionsCompleted: 2,
    values: {
      title: 'The Midwife’s Bag',
      client: 'Midwife Chiyo',
      parcel: 'the midwife’s bag of herbs, linen and little steel tools',
      recipient: 'the midwife herself, already at a birth on the Ogata farm',
      route:
        'Chiyo ran out of the door without her bag, the Ogata farm is past the east fields, and a baby is not going to wait for anyone.',
      routeWon:
        'You run the field walls and the ditches straight as a crow, and hand the bag through the farmhouse window before the next cry.',
      routeLost:
        'You take the wrong farm track in the dark and arrive breathless and late, with the bag’s jars clinking ominously.',
      doorstep:
        'The grandmother of the house bars the door with a broom. No stranger crosses her threshold during a birth, shinobi or not.',
      ending:
        'A thin new cry comes from inside. The grandmother comes out to bow to you, and asks your name, because they will need a name for luck.',
    },
  },
  {
    id: 'blade-for-the-captain',
    templateId: 'd-courier',
    minMissionsCompleted: 3,
    values: {
      title: 'A Blade for the Gate Captain',
      client: 'Master Smith Hagane',
      parcel: 'a new sword in a plain wooden scabbard, still smelling of oil',
      recipient: 'the captain of the east gate, who has rejected the last two',
      route:
        'Carrying a bare blade through the market draws every eye, and the east gate is on the far side of the busiest street in the village.',
      routeWon:
        'You wrap it in a mat, sling it like a fishing rod, and walk through the crowds without a single person looking twice.',
      routeLost:
        'A pair of off-duty guards stop you to admire it, then to argue about it, and the captain has been kept waiting by the time you get there.',
      doorstep:
        'The captain draws the blade, sights down it, flexes it, and announces that it is too short, too long and too plain, all at once.',
      ending:
        'The captain swings it once in the gate yard and goes silent. He sends a sealed note back to Hagane, and Hagane is pleased with himself for the rest of the day.',
    },
  },
  {
    id: 'sweets-for-the-wedding',
    templateId: 'd-courier',
    minMissionsCompleted: 1,
    reward: { ryo: 115, reputation: 2 },
    values: {
      title: 'Sweets for the Wedding',
      client: 'Confectioner Kōbai',
      parcel: 'a tower of sugar lanterns on a lacquer tray, as fragile as spun glass',
      recipient: 'the wedding hall on the far side of the canal',
      route:
        'The canal bridges are humped and crowded, the afternoon is hot, and sugar lanterns sag in the sun if you dawdle.',
      routeWon:
        'You cross by the shaded side of every street, tray held level as a pond, and arrive with every little lantern standing.',
      routeLost:
        'A child bumps the tray on the second bridge. You arrive with the tower intact and one lantern missing, and you know which child ate it.',
      doorstep:
        'The groom’s mother insists the lanterns be counted, and counts them wrong, and accuses you of eating one.',
      ending:
        'The sugar lanterns are lit with tiny candles at the feast and look just like the real thing. Kōbai saves you the cracked one, which tastes better than it looks.',
    },
  },
  {
    id: 'weir-keepers-daughter',
    templateId: 'd-missing-person',
    minMissionsCompleted: 2,
    reward: { ryo: 120, reputation: 4 },
    values: {
      title: 'The Weir-Keeper’s Daughter',
      client: 'Weir-Keeper Jōji',
      person: 'Jōji’s daughter Hana',
      worry:
        '“She wanted to see where the floating lanterns go,” Jōji says. “Every year she asks me, and every year I tell her the sea. She took the punt.”',
      rumour:
        'The fishermen below the weir all saw a small boat go by in the dusk, and every one of them remembers it going a different way.',
      lead: 'An old net-mender noticed the punt because it had a lantern tied to its pole, and it went down the left channel, where nobody fishes.',
      deadEnd:
        'You lose the afternoon between drinking fishermen and their tall stories, until an old net-mender remembers a punt with a lantern on its pole.',
      search:
        'The left channel winds into a maze of reed beds and sandbars, and the reeds close over the water so tightly you cannot see a boat’s length ahead.',
      found:
        'Hana is on a sandbar, the punt stuck fast beside her, watching a little drift of last year’s festival lanterns caught in the reeds. “They don’t go to the sea,” she says. “They stop here.”',
      ending:
        'Jōji wades out to his knees to fetch her. The next festival, he takes his punt down the left channel and frees the lanterns from the reeds, with Hana at the pole.',
    },
  },
  {
    id: 'potter-who-walked-away',
    templateId: 'd-missing-person',
    minMissionsCompleted: 4,
    reward: { ryo: 115, reputation: 4 },
    values: {
      title: 'The Potter Who Walked Away',
      client: 'Kiln-Woman Sumi',
      person: 'Sumi’s grandfather, old Rokuemon',
      worry:
        '“He forgets the day, he forgets my name,” Sumi says. “He never forgets the way to a kiln. He was talking about firing one last bowl.”',
      rumour:
        'The tea-house by the north road served an old man with clay under his nails at dawn, but nobody can agree which way he went.',
      lead: 'The tea-house boy remembers the old man asking how far it was to Kiln Pass, and whether the dragon kiln was still standing.',
      deadEnd:
        'Half the afternoon goes on helpful neighbours sending you after every old man in the village, before the tea-house boy remembers Kiln Pass.',
      search:
        'The old dragon kiln climbs the hillside in a long broken line of chambers, half fallen in, and any one of them could hide a man.',
      found:
        'Rokuemon sits in the top chamber by a small fire of twigs, a lumpy clay bowl warming in the ashes. “The kiln is cold,” he says. “Someone has to keep it warm.”',
      ending:
        'Sumi carries the bowl home for him, still warm. She sets it by the family lantern, and her grandfather calls her by her name all evening.',
    },
  },
  {
    id: 'runaway-apprentice',
    templateId: 'd-missing-person',
    minMissionsCompleted: 6,
    values: {
      title: 'The Runaway Apprentice',
      client: 'Master Smith Hagane',
      person: 'Hagane’s youngest apprentice, Ren',
      worry:
        '“I told him his blade was rubbish,” Hagane growls, not looking at you. “It was rubbish. He didn’t have to go off. Find him before his mother does.”',
      rumour:
        'The other apprentices claim to know nothing, very loudly, and one of them keeps glancing up towards Mount Reikon.',
      lead: 'The apprentice finally admits that Ren went to pray at the sword shrine on the mountain’s lower slopes, where the old smiths offered their first blades.',
      deadEnd:
        'The apprentices close ranks and lie badly until evening, when one of them finally admits Ren went to the sword shrine on Mount Reikon.',
      search:
        'The sword shrine is up a goat track in the mist, and the mountain’s spirits are thick there, murmuring just past the edge of hearing.',
      found:
        'Ren kneels in the shrine before a rack of ancient rusted swords, his own sad blade laid among them. “I wanted them to tell me if I should give up,” he says.',
      ending:
        'Hagane meets you at the forge door, takes Ren by the ear, and puts a hammer into his hand. “Again,” he says, and for once it sounds like praise.',
    },
  },
  {
    id: 'bride-on-the-eve',
    templateId: 'd-missing-person',
    minMissionsCompleted: 8,
    values: {
      title: 'The Bride on Her Wedding Eve',
      client: 'Tea-House Mistress Fusa',
      person: 'Fusa’s daughter Mitsu, who is to be married tomorrow',
      worry:
        '“The whole canal district is invited,” Fusa says, her hands shaking round a cup. “She was laughing at supper. She seemed so happy. Then her room was empty.”',
      rumour:
        'The maids swear they saw nothing, and the bridegroom’s family has already started talking. Only the old bell-ringer will not meet your eye.',
      lead: 'The bell-ringer finally says he lent Mitsu the key to the shrine bell tower, because she asked so nicely and he is a soft old fool.',
      deadEnd:
        'The evening goes on angry relatives and wild theories, until the old bell-ringer confesses that he lent Mitsu the bell tower key.',
      search:
        'The bell tower stair has rotted, the trapdoor is wedged, and the only other way up is the outside of the tower in the dark.',
      found:
        'Mitsu sits under the great bell, wrapped in a blanket, writing by lantern light. “I wanted to watch the sun come up over the village once,” she says, “as just myself.”',
      ending:
        'You sit with her until dawn, and the sun comes up gold over every roof. Mitsu walks home, sleepless and smiling, and is married by noon.',
    },
  },
];
