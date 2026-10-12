import type { MissionFill } from '../../../../missionTemplates';

/** The first fill of each B- and A-rank template: chūnin work, taken alone. */
export const EXEMPLARS_CHUNIN: readonly MissionFill[] = [
  {
    id: 'false-seals-shiomachi',
    templateId: 'b-smuggling-ring',
    values: {
      title: 'False Seals at Shiomachi',
      client: 'The Harbour Office',
      contraband: 'ember-oil under forged Kurogane seals',
      route: 'through the fish market at Port Shiomachi',
      papers:
        'The harbour manifests list the oil as lamp tallow. The seals on them are Kurogane, perfect in every line, except that the Kurogane never seal tallow.',
      papersRead:
        'Every forged seal was stamped on the same day of the month, and every cart was signed for by the same fishmonger, Ryōta, who cannot write.',
      papersBlind:
        'The ledgers are clean on every page you can find. When you leave the harbour office, a fish-porter you have seen twice already is waiting across the street.',
      cover:
        'The fish market is a closed world. Everybody knows everybody, and a stranger who asks about the night carts is a stranger who ends up in the harbour.',
      den: 'Behind the ice-house, crates of ember-oil stand under fish nets. A rogue in a scratched-through forehead protector checks the seals, and a hired thug minds the door.',
      foe: 'ember-missing-nin',
      second: 'bandit-chief',
      ending:
        'In the rogue’s coat is a set of seal blocks, cut by a master. On the bottom of each is the mark of a Kurogane smith who is supposed to have died last winter.',
    },
  },
  {
    id: 'rope-at-hollow-ford',
    templateId: 'b-spirit-binding',
    values: {
      title: 'The Rope at Hollow Ford',
      client: 'The Shimenawa Rope-House',
      spirit: 'the drowned ferryman of Hollow Ford',
      legend:
        '“He took the ferry over in a flood to fetch a doctor,” the rope-mistress says. “The ferry came back. He never did. Now he takes travellers across, and the river keeps them.”',
      preparation:
        'The binding rope must be laid across the ford from bank to bank, every knot sealed, before the ferryman rises at midnight.',
      readied:
        'The rope lies across the black water, glowing faintly at every knot. It feels like a held breath.',
      rushed:
        'The last knots are rushed and the seals smudged. The rope sags in the current, and you know it will not hold for long.',
      manifest:
        'The ferry slides out of the mist without a pole. On it stands a man of river-water and weed, his hand held out for your fare.',
      foe: 'kiln-wraith',
      ambush:
        'You strike as he bends to his pole, still looking across the river for the doctor he never brought.',
      ending:
        'The rope draws tight and the ferryman sinks into it, knot by knot, until only the ferry is left, bumping gently at the bank. The rope-house will tend the rope every spring from now on.',
    },
  },
  {
    id: 'ash-hand-deserter',
    templateId: 'b-rogue-hunt',
    values: {
      title: 'The Ash-Hand Deserter',
      client: 'The Tōrokage’s Office',
      quarry: 'Masaru of the Hibana, who left the village with a forbidden scroll',
      dossier:
        'The file lists his techniques, his teachers and his debts. It does not say that the scroll he took was his own grandmother’s, sealed away by the clan after her death.',
      trail: 'He left a season ago, by the river gate, at night, and nobody has seen him since.',
      trap: 'In the doorway of an empty farmhouse on his trail, a single sheet of paper is pinned to the lintel, and the air around it shimmers.',
      cornered:
        'Masaru waits in a burnt-out shrine, his grandmother’s scroll open in his lap. “They’ll burn it,” he says. “You know they will.”',
      foe: 'ember-missing-nin',
      parley:
        'He looks at the scroll for a long time. Then he rolls it up and holds it out to you. “Make them read it first.”',
      ending:
        'You hand the scroll and the report to the Office. The Hibana head reads the report twice and asks to keep the scroll, unburnt.',
    },
  },
  {
    id: 'black-dam',
    templateId: 'a-sabotage',
    values: {
      title: 'The Black Dam',
      client: 'The Tōrokage’s Office',
      target: 'a rogue cell’s new dam on the Kuro river',
      briefing:
        'Downstream, the rice terraces of three villages are drying out, and the cell is selling the water back to them. It must break, and it must look as if it broke by itself.',
      approach:
        'The dam is ringed with watch-fires, and the only road in passes under a tower where someone is always awake.',
      insideLine:
        'You are on the dam wall unseen. Below you, the sluice-gates groan under the weight of a held river.',
      seenLine:
        'You reach the wall, but a watchman on the tower has seen a shape move and is calling down to the gate.',
      work: 'The dam is timber and packed earth. One sluice-gate, eased in the right place, will let the river do the rest, slowly enough to look like rot.',
      sprung:
        'The first timbers crack as you leave. Between you and the trees stand two of the cell’s guards, roused and running.',
      foe: 'ember-missing-nin',
      second: 'bandit-chief',
      slipped:
        'You slide off the dam wall into the dark as the timbers begin to groan. The guards run the wrong way, towards the water.',
      ending:
        'From the ridge at dawn you watch the river find its old course. By noon the terraces downstream are shining wet again.',
    },
  },
  {
    id: 'envoys-daughter',
    templateId: 'a-rescue',
    values: {
      title: 'The Envoy’s Daughter',
      client: 'Envoy Hōjō of the capital',
      captive: 'the envoy’s daughter, Kiyo',
      captors: 'a rogue cell in the Ash Hills',
      plea: 'Hōjō has not slept. “They want the trade treaty torn up, or they want her dead. I cannot give them either and live with it.”',
      search:
        'The ransom note was left on a lantern at the village gate. The paper is from the capital, the ink is from the hills, and the knot is a sailor’s.',
      found:
        'The paper and ink lead you to a charcoal camp in the Ash Hills, where a girl in a silk sash is drawing water under guard.',
      late: 'You find the charcoal camp in the Ash Hills, but they are already breaking it up, and the girl in the silk sash is being tied to a mule.',
      camp: 'Kiyo sits by the fire with her hands bound. A rogue with a scratched-through headband sits beside her, and a bowman watches from a charcoal heap.',
      foe: 'ember-missing-nin',
      second: 'bandit-archer',
      slipped:
        'You cut Kiyo’s ropes under cover of the smoke and lead her out past a sleeping guard, a hand over her mouth.',
      pursuit:
        'Halfway home a figure drops onto the path ahead of you: the cell’s leader, with ash on his hands and fire in his eyes. Kiyo hides behind a rock.',
      pursuer: 'ember-missing-nin',
      relent:
        'He looks at Kiyo, then at you, and laughs without any joy in it. “Keep her, then. The hills will still be here.” He is gone into the smoke.',
      ending:
        'Kiyo runs the last stretch to her father on her own. Hōjō signs the treaty that afternoon, and leaves a letter for you at the Mission Hall that you are not allowed to open until you are jōnin.',
    },
  },
];
