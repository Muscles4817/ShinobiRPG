# Sunagakure: the sand that buried a queen

The Village Hidden in the Sand in the fan pack's setting. Nothing of the town exists yet: the
location is a locked stub. Its families are clans of Sunagakure, and its fighters are in versus
(`duelists/suna/`, listed at the end). This page records the setting agreed so far, so the town, its
fighters and the desert are built on it.

## The history

**The Monarch.** Before the Sand, the Wind Country had a queen who collected summons. She ruled
from a city in the Deep Desert and sent her summons to ravage any settlement that crossed her.
Her soldiers were the **sand tribe**, bound to her by marriage, and they marched beside the beasts.

**The tomb.** Shukaku lay sealed in a tomb in the desert for centuries, and the seal leaked. The
sand around the tomb was soaked in its chakra, and the sand tribe grew strong on it and worshipped
what lay inside. That sand is the first **spice**.

**The gift.** The man who would be the First Kazekage led a great many small clans that had
nothing in common but the Monarch's boot. When she demanded his fealty, he went to her city with
a gift: Shukaku, taken from the tomb. She tried to bind it to her as a summon. It broke free,
killed her and her family, and buried her city in sand. He led the survivors out, and when the
clans founded Sunagakure, he became its first Kazekage. Whether he knew it would break free is
the Sand's oldest argument.

**The raging decades.** Nobody could stop Shukaku, so it was left in the Deep Desert. For decades
its chakra sank into the sand and spread. What lives in the desert changed: beasts, plants and
spirits grew strange and strong on it. When the corruption reached too far from the Deep Desert,
the Sand mounted a mission and sealed Shukaku in a sand priest (Bunpuku in canon).

## The Sand today

**The sand priests.** The sand tribe's heirs. Almost all of them are sand users, and they
worship Shukaku: their power came from its tomb, and the Kazekage's line robbed it. Everyone
despises them, in the Wind Country and beyond, for what they did at the Monarch's side. The Sand
keeps a truce with them rather than a friendship: they pilot the sand barges, the only safe way
in or out across the desert, and in return the Sand protects them. They live apart, they are
needed, and they are never forgiven. Shukaku sits inside one of the people the village hates
most.

**The Kazekage's house.** The First Kazekage sealed the truce by marrying a priestess, so the
Kazekage's house is part priest by blood. The Kazekage use dust, but refined dust: iron sand (the
Third), gold dust (Rasa). Plain sand is the priests'. That is why Gaara is a horror twice over:
the Kazekage's son carries the priests' raw sand and their god inside him.

**The clans.** The small clans that followed the First Kazekage, and among them the great
families (`sunagakure/clans.ts`). The Sand names its people for their family in its own way:
Gaara of the Sands, Sasori of the Red Sand.

| Clan       | Called              | Art                   | Notes                                                                                                                                                                                                   |
| ---------- | ------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sabaku     | of the Sands        | Refined dust          | The Kazekage's house, part priest by blood                                                                                                                                                              |
| Akasuna    | of the Red Sand     | Puppets               | Done for versus: a `PuppetDef` is a call like a summon's, unsealed by its own technique and kept up in chakra, and its maker steps back behind it. Building, repairing and owning one are still to come |
| Kamaitachi | of the Cutting Wind | Wind through war fans | Fill the barges' sails                                                                                                                                                                                  |
| Sakyū      | of the Dunes        | Sand (dust)           | The sand priests, apart from the rest under the truce                                                                                                                                                   |

The Kazekage comes from the house's line, by lineage as far as anyone has said.

**Beasts are dominated, never befriended.** The Monarch taught the Sand that a beast with a mind
of its own will turn on you one day. The Sand breeds and breaks its animals for obedience with
collars, brands and drilling, and it will not tolerate an intelligent beast at all: a talking
dog is an abomination, and a mutated beast that shows cunning is put down. Summoning is the
Monarch's sin. A human puppet is the same sin in another shape, which is what makes Sasori the
Sand's worst nightmare. Temari doesn't have Kamatari at the start; she takes him in later, a
quiet refusal to follow blind tradition and inherited hate. Her mother's family, the Cutting
Wind, is named for the same weasel of the old stories.

**The Sand hates the Leaf.** In the last great war the Leaf fought the Stone in the Rain. The
Sand saw its chance to weaken the Leaf. Sakumo Hatake was given a small outpost and told to keep
the Sand busy, and he did it brilliantly: his raids taught the Sand to fear its own desert.
Sasori's parents were among the dead. A Leaf shinobi is unwelcome, and the name Hatake is cursed.

## The desert

The desert is the Sand's wall. It worsens towards the Deep Desert, where the corruption started:

| Region           | What it holds                                                               |
| ---------------- | --------------------------------------------------------------------------- |
| The outer sands  | Heat, storms, raiders; mostly natural                                       |
| The tainted belt | Mutated beasts and plants, restless spirits, spice harvesters and smugglers |
| The Deep Desert  | The Monarch's buried city and the tomb; the worst of what Shukaku made      |

**The barges** are how anyone sane crosses: a priest at the helm steers the sand, and a fan
user fills the sails. Walking is possible and deadly.

**The spice** is sand soaked in bijū chakra. The priests' strongest sand is spice, the Sand's
economy and the daimyo's interest run on it, smugglers die for it in the tainted belt, and the
dark rings round a priest's eyes (and Gaara's) are its mark.

## Engine gaps

| Need                     | Today                                                                                                                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A `desert` biome         | The bestiary, wild places, wild companions and wild strains know woods, river, shore, mountain, marsh                                                                                              |
| A desert fighting ground | Grounds are arena, forest, town, room, lake. Dunes: open, no cover, room for far, and sand to draw on                                                                                              |
| The barge crossing       | Routes have `needs`, `cost` and `danger`; a passage by barge is a new kind of need, or a fare beside a deadly road                                                                                 |
| Desert road regions      | One region (`dune-road`); the three above need their own events                                                                                                                                    |
| How a town greets you    | Nothing reads where you're from or what you carry. The Sand reacts to the Leaf and to a contract, as the Mist will to a bloodline: one rule for all three                                          |
| Breaking a beast         | A companion takes orders only as the bond opens them. Breaking opens orders early and keeps the bond thin                                                                                          |
| Intelligent beasts       | Nothing marks a companion kind as having a mind of its own                                                                                                                                         |
| Puppets                  | A puppet is a summon without a contract: a front-row body on threads, paid in chakra, dropping when its maker falls. The full system (building, repair, hidden weapons) is like companions or dust |
| Spice                    | A dust kind of its own, a trade good; whether it can be taken (and what it costs) is open                                                                                                          |

## Open questions

- Can the player take the spice, and what does it cost them?
- Who else stands among the small clans.

## Fighters in versus

Every one lives in Sunagakure (`duelists/suna/`):

| Family              | Fighters                                                                    |
| ------------------- | --------------------------------------------------------------------------- |
| of the Sands        | Gaara, Rasa, the Third Kazekage, Temari, Kankurō                            |
| of the Red Sand     | Chiyo with Father and Mother, Sasori with the Third Kazekage and Hiruko     |
| of the Cutting Wind | Oroshi the sail-master, Yashamaru                                           |
| of the Dunes        | Isago the high priestess, Nagi the barge pilot, Bunpuku the host of Shukaku |
| The village's own   | Baki, Pakura of the Scorch, Maki                                            |
