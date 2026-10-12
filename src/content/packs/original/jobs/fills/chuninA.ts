import type { MissionFill } from '../../../../missionTemplates';

/** A-rank work a chūnin takes alone: sabotage behind other walls, and rescues with a pursuer. */
export const CHUNIN_A_FILLS: readonly MissionFill[] = [
  {
    id: 'the-fire-towers',
    templateId: 'a-sabotage',
    minMissionsCompleted: 12,
    values: {
      title: 'The Fire Towers',
      client: 'The Tōrokage’s Office',
      target: 'a raider band’s new signal towers along the dune border',
      briefing:
        'The towers can pass a fire signal from the dunes to the coast faster than any runner. With them, the raiders will know every caravan’s route before it leaves. They must fall, and they must look as if the sand took them.',
      approach:
        'The towers stand on rocky outcrops above the dunes, each one watched by a sentry who can see for miles.',
      insideLine:
        'You are at the foot of the main tower unseen. Above you, the signal fire smoulders in its iron basket.',
      seenLine:
        'You reach the tower, but a sentry on the next outcrop has seen a shadow cross the dune, and his signal fire is flaring.',
      work: 'The tower is timber on a stone footing. Its supports, eased in the right place, will let the sand wind do the rest, slowly enough to look like age.',
      sprung:
        'The first tower groans as you slip away. Between you and the dunes stand two of the band’s guards, a swordsman and a fire-breather, roused and running.',
      foe: 'ember-missing-nin',
      second: 'kurogane-renegade',
      slipped:
        'You slide down the dune face as the tower begins to lean. The guards run the wrong way, towards the falling timbers.',
      ending:
        'From a ridge at dawn you watch the last tower fall in a cloud of sand. The next caravan through the dunes arrives untouched.',
    },
  },
  {
    id: 'the-black-hulls',
    templateId: 'a-sabotage',
    minMissionsCompleted: 18,
    reward: { ryo: 1040, reputation: 18 },
    values: {
      title: 'The Black Hulls',
      client: 'The Tōrokage’s Office',
      target: 'a warlord’s warships, building in a hidden cove north of Port Shiomachi',
      briefing:
        'The warlord’s ships will be ready by spring, and they are meant for Shiomachi. The village cannot be seen to act against him. The ships must burn, and it must look like the shipwrights’ own carelessness.',
      approach:
        'The cove is ringed by cliffs, and the only way in is past a watchtower and a gatehouse full of hired swords.',
      insideLine:
        'You are in the shipyard unseen. Before you, three black hulls stand on their slips, smelling of fresh pitch.',
      seenLine:
        'You reach the shipyard, but a shipwright working late has seen a shadow among the hulls and is calling for the guard.',
      work: 'The hulls are pitched timber, and the pitch-pots are left to cool overnight by the slips. One pot, tipped just so, will do the rest.',
      sprung:
        'The first hull catches as you leave. Between you and the cliffs stand two of the warlord’s guards, a swordsman and a bandit captain.',
      foe: 'kurogane-renegade',
      second: 'bandit-chief',
      slipped:
        'You slip into the sea as the flames spread, and swim round the headland while the guards run to fight the fire.',
      ending:
        'From the clifftop at dawn you watch the last hull burn to the waterline. The warlord’s spring campaign is quietly cancelled.',
    },
  },
  {
    id: 'the-ember-foundry',
    templateId: 'a-sabotage',
    minMissionsCompleted: 26,
    reward: { ryo: 1100, reputation: 19 },
    values: {
      title: 'The Ember Foundry',
      client: 'The Tōrokage’s Office',
      target: 'a hidden foundry in Kiln Pass forging blades for raiders',
      briefing:
        'Someone is using stolen clan techniques to forge blades for every raider band on the border. The foundry must go cold, and it must look as if the old kilns simply failed.',
      approach:
        'The foundry is built into an old kiln chamber, and its only door is watched by rogue shinobi who know every trick you do.',
      insideLine:
        'You are inside the foundry unseen. Before you, a furnace roars, and racks of raw blades stand waiting for an edge.',
      seenLine:
        'You get in, but a rogue at the furnace has felt a flicker of chakra that is not his own and is looking round.',
      work: 'The furnace is built into the old kiln, and its flue is cracked. A seal in the right place will choke the fire and bring the roof down slowly.',
      sprung:
        'The furnace chokes and the roof begins to crack. Between you and the door stand two of the foundry’s rogues, both chūnin, both very angry.',
      foe: 'ember-missing-nin',
      second: 'ember-missing-nin',
      slipped:
        'You slip out through the smoke as the roof gives way, and the rogues run to save their blades instead of chasing you.',
      ending:
        'From the pass at dawn you watch the old kiln chamber collapse in a cloud of soot. No new blades come over the border that winter.',
    },
  },
  {
    id: 'rope-mistress-taken',
    templateId: 'a-rescue',
    minMissionsCompleted: 13,
    values: {
      title: 'The Rope-Mistress Taken',
      client: 'The Shimenawa Rope-House',
      captive: 'Rope-Mistress Ayaori',
      captors: 'a rogue cell on the slopes of Mount Reikon',
      plea: '“They want her to bind the mountain’s spirits for them,” the rope-house’s eldest says. “She will refuse, and then they will kill her. Please.”',
      search:
        'The cell left no note, only a cut length of sacred rope on the rope-house step, knotted in a way only Ayaori knows.',
      found:
        'The knot is a map, and it leads you to a ruined temple high on Mount Reikon, where Ayaori sits weaving under guard.',
      late: 'The knot is a map, but by the time you read it, the cell is already moving Ayaori higher up the mountain.',
      camp: 'Ayaori sits in the temple courtyard, her hands bound with her own rope. A rogue with a burnt headband stands over her, and a bowman watches from the roof.',
      foe: 'ember-missing-nin',
      second: 'bandit-archer',
      slipped:
        'You cut Ayaori’s bonds while the guards argue, and lead her out through the temple’s back gate in silence.',
      pursuit:
        'Halfway down the mountain a figure in black drops onto the path: the cell’s swordsman, his blade already drawn, and the mist closing round you.',
      pursuer: 'kurogane-renegade',
      relent:
        'He lowers his blade and looks at Ayaori. “She bound my mother’s ghost, once,” he says. “Go.” He steps back into the mist.',
      ending:
        'Ayaori walks into the rope-house with her own rope round her wrist. She weaves you a cord from it, knotted in the same secret way, and tells you to keep it.',
    },
  },
  {
    id: 'envoy-from-the-dunes',
    templateId: 'a-rescue',
    minMissionsCompleted: 20,
    reward: { ryo: 1150, reputation: 19 },
    values: {
      title: 'The Envoy from the Dunes',
      client: 'Envoy Kazamaki of Sakyūgakure',
      captive: 'the envoy’s son Hayate',
      captors: 'a raider band that wants war between the villages',
      plea: '“If my son dies on your soil, my village will call it murder,” Kazamaki says, his voice very flat. “And there will be war. Bring him back.”',
      search:
        'The raiders left a dune-glass bead at the inn where Hayate was taken, and the bead is the kind sold only at one oasis on the border.',
      found:
        'The bead leads you to the oasis, where Hayate is held in a trader’s tent, with raiders posing as merchants all round.',
      late: 'You find the oasis, but the raiders are already loading Hayate onto a camel, heading deeper into the dunes.',
      camp: 'Hayate sits in the tent, his hands bound. A swordsman with the Kurogane footwork guards him, and a bandit captain watches the tent door.',
      foe: 'kurogane-renegade',
      second: 'bandit-chief',
      slipped:
        'You slice open the back of the tent and lead Hayate out into the dunes while the guards play dice by the door.',
      pursuit:
        'In the dunes a figure rises from the sand ahead: the raiders’ leader, a fire-breathing rogue, his hands already glowing.',
      pursuer: 'ember-missing-nin',
      relent:
        'He looks at Hayate, then at you, and spits in the sand. “War will come anyway,” he says, and walks off into the heat haze.',
      ending:
        'Hayate walks into his father’s arms at the border post. Kazamaki bows to you, very low, and the treaty between the villages is signed that spring.',
    },
  },
  {
    id: 'child-who-lights-fires',
    templateId: 'a-rescue',
    minMissionsCompleted: 29,
    reward: { ryo: 1000, reputation: 18 },
    values: {
      title: 'The Child Who Lights Fires',
      client: 'The Hibana Clan',
      captive: 'a Hibana child prodigy named Akane',
      captors: 'a rogue cell planning to light a forbidden fire on the ash fells',
      plea: '“She can light a lantern from across the street,” the Hibana head says, “and they want her to light something much bigger. If the fells burn, the whole valley burns.”',
      search:
        'The cell left no trace, but the fells are full of charcoal camps, and every one of them could be hiding a child.',
      found:
        'The smoke from one camp burns a strange colour, and there you find Akane, ringed by seals and guarded closely.',
      late: 'You find the camp, but the cell has already started the ritual, and the seals round Akane are glowing.',
      camp: 'Akane sits in a ring of seals, small and furious. A rogue in a burnt headband stands at the ring’s edge, and a bowman watches from a charcoal heap.',
      foe: 'ember-missing-nin',
      second: 'bandit-archer',
      slipped:
        'You break the seal ring with a single stroke and carry Akane out through the smoke before the guards look round.',
      pursuit:
        'On the slopes below the fells a figure drops from the trees: the cell’s swordsman, cutting off the only path home.',
      pursuer: 'kurogane-renegade',
      relent:
        'He looks at Akane, small and furious in your arms, and laughs. “Let her burn something else, then,” he says, and sheathes his blade.',
      ending:
        'Akane runs into the Hibana compound and lights every lantern in it at once, just to show that she can. The Hibana head tells you she is going to be a handful.',
    },
  },
];
