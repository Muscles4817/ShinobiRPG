# Kirigakure: the Mist's war

The Village Hidden in the Mist in the fan pack's setting, and the civil war it is in. What
exists today is a town you can visit in its first era, its fighters in versus and a little work
for both sides. The war's outcome is not designed yet. This page records the setting so far, so
later work builds on it rather than around it.

## The setting

**Yagura is Mizukage, and he is hunting bloodlines.** The Fourth Mizukage has named kekkei
genkai the enemy within. Bloodline clans are hunted by the Kurage house's masked hunter-nin, and
by neighbours who would rather report than be reported. The academy's last test is still a duel
to the death between classmates.

**Every bloodline clan is in the resistance.** Some fight and some hide, scattered across the
outer islands and in safe houses:

| Clan      | Bloodline                      | In the resistance                                                                                        |
| --------- | ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Yuki      | Ice                            | The most hunted. Hidden in the snow islands                                                              |
| Hōzuki    | Hydrification                  | Fighters and infiltrators of the canals and drains. Mangetsu is their legend                             |
| Hoshigaki | Shark-like body, deep reserves | Run the rebel boats through the blockade. Mistrusted for Kisame's sake                                   |
| Suikazan  | Chakra-eating needle hair      | Spies and saboteurs                                                                                      |
| Kaguya    | Bone                           | Rose against the purge too early and alone, and were wiped out. The survivors are a warning and a grudge |

**The loyal houses have no bloodline.** That is why they stand. Each keeps the regime running
in its own way and gets something from it:

| House                        | Root in real culture                     | What it does for Yagura                                                                           |
| ---------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Kasumi, the mist-keepers     | Fog kept like a shrine flame             | Their braziers and genjutsu keep the village's fog. It hides the village, and it watches for them |
| Amibari, the net-weavers     | Common fishing nets; the family register | Keep the Blood Register of every birth's chakra, and weave sealing nets                           |
| Kurage, the hunter-nin house | Jellyfish: clear, stinging, drifting     | The masks. Poison needles; they dispose of the bodies                                             |
| Isana, the whalers           | Whaling villages and whale graves        | Run the fleet and hold the blockade round the rebel islands                                       |
| Shiogama, the salt-smiths    | Salt kilns and sword-forging             | Forge for the Seven Swordsmen at the Seventh Forge. Some forge for the rebels at night            |
| Karatachi                    | Yagura's own family                      | Guard the tower                                                                                   |

The Uminari breath-divers belong to neither side and carry for whoever pays.

**There is no Terumī clan.** The Water Country has so many bloodlines that they sometimes
surface in children of families with none. A child whose bloodline shows learns to hide it, and
the whole village has learned not to look too closely.

**Mei is the Leaf's plant.** On paper the Leaf wants nothing to do with the war: it could be
read as a power grab. In fact ROOT raised Mei from childhood. She was born with Lava and Boil
Release, given a Water Country orphan's past, and sent home with two handlers to win the
rebellion and bring the Mist under the Leaf. One handler, Tsuru, poses as her net-mending uncle;
he is a sensor and sealer. The other, Ibara, poses as her quiet cousin; she is a blade, there to
keep Mei alive, or to end her if she forgets who raised her.

**The Swordsmen are split.** Kushimaru (Nuibari), Jinpachi (Shibuki) and Jinin (Kabutowari)
serve the tower. Mangetsu took Hiramekarei to the rebels. Kisame has gone rogue with Samehada,
and Zabuza with Kubikiribōchō.

## What exists today (Era I)

- **The town** (`packs/naruto/kirigakure/`), with its own backdrop (`mist-village`). A foreigner
  is kept to the harbour ward, the loyal houses' ward:
  - the Fog Lantern lodging house
  - the dawn auction
  - the Broker's Shed
  - the Seventh Forge
  - the Salt Bathhouse
  - the Drowned Man bar
  - the Kasumi fog shrine
  - the Isana whaling quay
  - the Kurage infirmary
  - a stilt house for sale
  - the sea cliffs and the Grey Shingle

  It also has the Night of Drowned Lanterns festival, and the mist-sea road events on the
  crossing.

- **Residents:** Ao, Mirei, Granny Shio and Ryūgo, plus a member of each loyal house and an
  Uminari diver.
- **Work for both sides.** Every job is open to the player and none is required. The war goes
  on whether or not you take part.

  | Job                     | Side                             |
  | ----------------------- | -------------------------------- |
  | Frost on the Windows    | Smuggle a Yuki family out        |
  | A Letter in the Lining  | Carry a letter to the rebels     |
  | Lookout on the Blockade | The Isana fleet                  |
  | Something in the Drains | Hunt a Hōzuki boy for the Kurage |
  | The Last Exam           | Neither                          |

- **Fighters in versus** (`duelists/kiri/`): Yagura, the loyal champions, the Swordsmen, Mei and
  her handlers, the resistance, Utakata. The town's foes cover the rank and file of each side.

## Where it could go (not designed)

The war has more than one ending, and the player may shape it or stay out of it:

- **Yagura wins.** The purge stands and the resistance is broken.
- **Yagura falls and the country falls apart.** The houses turn on each other and the islands
  go to warlords and pirates.
- **A new Mizukage.** Mei (and the Leaf behind her), someone else, or the player.

Each ending is a world mark that later content reads. Era II is whichever ending happened.

## Engine gaps for eras and clans

These are things that are fixed per town today and would need to change by world mark. One small
rule fits all of them: "only once this world mark is held / only until it is", which jobs already
have (`needsWorldMark`, `closedBy`).

| What needs to change | Today                                                                           |
| -------------------- | ------------------------------------------------------------------------------- |
| Places               | A town's places are fixed, so a compound can't open or the Register office burn |
| People               | Schedules and home towns are fixed, so a bloodline family can't come home       |
| Compounds            | A clan's outsiders stance is fixed                                              |
| Festivals            | Have no condition                                                               |

**Clans of another village** (done). A clan names its village (`ClanDef.village`), and only the
start village's clans are offered at creation or drawn into the academy year (`homeClans`).
The Mist's families are clans of Kirigakure (`kirigakure/clans.ts`). The loyal houses have
compounds in the Houses' Quarter, each with a member who comes home in the evening:

| Compound              | House    | Stance    |
| --------------------- | -------- | --------- |
| The Kasumi Lamp-House | Kasumi   | Reserved  |
| The Register House    | Amibari  | Guarded   |
| The Kurage Hall       | Kurage   | Guarded   |
| The Isana Boatsheds   | Isana    | Welcoming |
| The Forge-House       | Shiogama | Reserved  |

The Karatachi hold the tower, which a foreigner never enters. The bloodline clans (Yuki, Hōzuki,
Hoshigaki, Suikazan, Kaguya) and the Uminari are clans too, and the Kiri fighters belong to
them, but their compounds stand empty under the purge. They are a job for whichever era brings
them home.
