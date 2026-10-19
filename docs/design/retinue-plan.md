# Retinues: fighters who bring more than one body

Working document for the next phase of the combat engine. Some fighters don't fight alone: a
handler fights beside a ninken, a hive-host fights through a swarm, a puppeteer works bodies on
strings, a summoner calls creatures in, and one mind may walk in six bodies. This plan finds
what they have in common so each of these styles, and others like them (a sand host, a clay
sculptor, a fighter with spare hearts), slots in as data and a few rules rather than as a
branch per character. Part 1 reviews what the engine has today. Part 2 records what we agree.
Part 3 is the design. Part 4 is the build plan. Part 5 records what was built. Nothing here is
binding until it is in Part 2.

---

## Part 1: The review

### What already exists

Plan & Watch (`engines/plan/`) has three partial versions of "more than one body":

1. **Clones** (`rules/verbs/clones.ts`, `cloneKinds.ts`, `plan/clones.ts`, `decoys.ts`,
   `screening.ts`, `cloneUpkeep.ts`): a count on their maker (`CloneBody.clones`), no health of
   their own. They draw hits (`decoyChance`), screen a charge, help a step, strike beside their
   maker if solid, and cost upkeep every exchange. Kinds are a table keyed by kind
   (`CLONE_RULES`), so a new kind is a row, not a branch.
2. **Allies** (`CombatSetup.allies`, `teamContract.ts`, `plan/team.ts`, `orders.ts`): full
   bodies with their own stats, row, turn and plan, fighting by a `stance`, taking the orders
   the bond has earned (`game/people/teamOrders.ts`). Combination techniques (`plan/combo.ts`)
   need someone on your side who knows the other half.
3. **Channelled holds** (`plan/holding.ts`): a pin that keeps its caster's turns and hands on
   it, holds harder while they keep it, and breaks when they are hurt or dazed. This is how a
   puppeteer's strings should behave.

Around them: rows (`rules/rows.ts`, `canReach`) put sturdy bodies in front and frail ones
behind; `EnemyDef.healthScale` sizes creatures; the `pack` trait makes packmates hit harder
together; targeting (`plan/targeting.ts`) already weighs harm done against hits to fell;
`fightingPower` and `game/scouting.ts` rate one stat line.

### What is missing

- **A body that belongs to another fighter.** Allies are independent people; clones are a
  number. Nothing is a full body that answers to a master, arrives with them or is called in
  by them, and whose fall the game remembers.
- **A pool that is not a body.** Bugs, sand, paper and clay are a quantity a fighter spends
  and regrows, not targets.
- **Bodies that act on someone else's attention.** Nothing spends a master's turns or skill
  on several bodies at once.
- **One mind in several bodies.** Each fighter reads and plans alone.
- **Fighters joining mid-fight.** `PlanState.fighters` is fixed at `start`.
- **A side that falls with its master.** Today a side is beaten when its fighters are.
- **Honest threat.** Scouting and `fightingPower` see one stat line, so a handler reads as one
  fighter and a job's danger understates them.
- **A way to come by any of it.** No contract, companion, puppet or transplant exists outside
  the fight.

The naruto pack already names some of it as plain techniques (a summoned ninken pack that is a
daze and a hit, an insect swarm that is a damage verb, an insect jar that is a seal). Those
stay valid; the retinue gives them bodies when content is ready.

---

## Part 2: What we agree

1. **The common thread is one fighter, more than one body.** Model the properties that differ
   (Part 3), never named archetypes. The engine sees capabilities, never "the dog" or "the
   crow puppet" (decision 8).
2. **A retinue is a real advantage, paid for where it would naturally be paid for, and it can
   be countered.** It is not balanced to win about half against a solo fighter of the same
   grade.
   - **Who usually has it carries the cost, not hidden code.** A clan that leans on companions
     is weaker in the arts it neglects because its aptitude tilts that way (decision 11). A
     fighter gifted in ninjutsu who gains a companion is simply stronger; nothing claws it back.
   - **Units are graded honestly.** A D-grade ninken fights as a D-grade creature. A handler
     and partner are worth about what two fighters are worth, and every read says so.
   - **Running costs are the natural ones:** chakra for summons, up front and each exchange;
     attention for strings; care outside fights for companions (food, injuries, time).
   - **Each style poses its own problem, and the answer works** (Part 3, counters).
3. **The bench checks honesty and counters, not parity.** A unit's power matches its grade;
   each style's counter measurably swings its matchup.
4. **Threat counts the retinue, as far as you can tell it is there.** Scouting reads a fighter
   with the companions you can see. Retinues are scoutable to different levels: a hound at heel
   is plain to anyone, but a puppeteer or a hive-host often can't be told for what they are out
   of a fight. A sharp eye (perception) or a lucky look can catch it, never for certain; the
   client's report, a recon of their kit or the fight itself shows everything.
5. **A loyal companion fights on** when its master falls; the fight is won only once it is
   beaten too. (Summons, which go home, come later.)
6. **By default a companion is just a second body on your side.** It hits no harder for being
   theirs; there must be reasons to train and get stronger. Each body is trained and
   strengthened on its own; harder hits are earned: **combination techniques** learned together
   (the existing combo rule), and **traits and techniques the bond unlocks** as it is trained
   (the companions step).
7. **Foes first.** The framework ships with foes who have retinues; the player's own companions
   come with the companions discussion.
8. **Everything can be had, but the odds vary hugely.** Each kind of retinue has acquisition
   paths with gates and odds, from near-certain (a clan rite) to an arc of its own (a
   scavenged eye). Each scenario is planned on its own.
9. **Big questions get their own planning discussion and PR:** companion depth, puppetry (a
   discipline or not, design, the workshop), and the original pack's equivalents.
10. **Shamans come to both settings** (naruto and the lantern village), loosely after Shaman
    King: people who see and deal with spirits and seal them into things and people to empower
    them. They reach combat through this framework but are a progression path of their own,
    with their own planning discussion and PR.
11. **Companions** (the companions discussion; design in Part 3, "Companions"):
    - A companion is a **bonded creature**, its own system (`systems/companions`), built from
      the pure functions people use: stats, limits and growth, the bond's points and stages,
      injuries, the pantry. Not a `PersonDef`.
    - **No death by default.** Beaten means injured. A death may come only as a story beat.
    - **One companion at a time** for now (packs of creatures come with summons).
    - **The player's first.** The record is keyed by owner, so people's companions (a clan
      teammate's dog) follow without a reshape.
    - **Acquisition grows by data.** Born (a clan), a stray (in the village), and later found
      **on purpose** and in **particular places**: a wolf in the forest makes a stronger
      companion than a stray, but is harder to tame, train and bond with.
    - The original pack's first kind is a plain trained hound, until its own equivalents are
      discussed.

---

## Part 3: The design

### Five properties

| Property    | Values                                                                                                                                                                                                                  | Examples                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Body**    | full (health, row, targetable) or **pool** (a quantity, never a target)                                                                                                                                                 | a ninken, a puppet, a summon; insects, sand, paper                        |
| **Mind**    | **own** (its own judgement, orders as the bond allows), **driven** (acts only while the master holds its strings, with the master's skill and attention) or **shared** (one mind across bodies: pooled reads, one plan) | a ninken, summons; puppets; six paths                                     |
| **Arrival** | from the start, **called** mid-fight by a technique, or **grown** (a pool that refills)                                                                                                                                 | a ninken, unsealed puppets; summons; insects                              |
| **Upkeep**  | none, chakra each exchange (as clones pay), or attention (strings, a limit by grade)                                                                                                                                    | a ninken; summons; puppets                                                |
| **Falling** | the engine reports each unit's condition; the game decides what it means                                                                                                                                                | a companion injured (a vet), a puppet broken (repair), a summon goes home |

A whole fighter is a setting of these. A handler is a master with an own-mind full body from
the start. A summoner calls own-mind full bodies with chakra upkeep, one huge
(`healthScale`) or several small (`pack`). A puppeteer starts with driven full bodies on
attention. A hive-host grows a pool. Six paths are six full bodies of one shared mind whose
controller is off the field. New styles are new settings: ten puppets is a bigger attention
budget, sand is a pool kind, spare hearts are shared-mind bodies inside one frame.

### Counters: the problem each style poses

| Style       | What its opponent must solve                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Handler     | Two bodies, and combination techniques once learned: take the weaker out first, or outlast both.  |
| Swarm       | A pool that drains and senses: areas and fire thin it; don't let it settle on you.                |
| Puppeteer   | A frail master behind sturdy bodies: reach the back row, or cut the strings by hurting or dazing. |
| Summoner    | A heavy chakra bill: outlast the summon, or strike the summoner while it is out.                  |
| Shared mind | No blind spots, revivals, a hidden controller: find the source (a sensor, Search, a story beat).  |

Foes and teammates must know these too: targeting values a master whose fall ends their
bodies, and a default plan brings an area against a swarm.

### The contract

The framework (step 1) needs no contract change: the game expands a foe into their party
(master first, then each body), and the engine sees ordinary fighters on one side. What later
steps add, as they first need it (in a `systems/combat/unitContract.ts` beside
`teamContract.ts` and `gearContract.ts`):

- `master` on a body: whose it is, once something reads the link (a companion's orders by
  bond, a combo between master and companion, the outcome's `units`).
- `mind` on a linked body (own, driven, shared) and its `upkeep`.
- `CombatantSetup.calls?: readonly UnitSetup[]`: what this fighter can call in, by id; a new
  `summon` technique verb names one.
- `CombatantSetup.swarm?: SwarmSetup`: a pool's `kind`, size, cap and regrowth. Techniques may
  cost swarm beside or instead of chakra.
- `CombatantView.controller?`: whose body this is, so the fight screen groups units under
  their master.
- `CombatOutcome.units`: each unit's condition and usage, by unit id, for the game to write
  back (injury, wear, growth).
- A **vital** rule decides when a side falls: by default with its fighters; a master's units
  fall with them, and a shared mind falls when its bodies or its controller do.

### The engine

One concept per file in `engines/plan/`:

- `units.ts`: bodies entering (at the start or called), upkeep, leaving, and their outcome.
- `strings.ts`: driven bodies, the attention budget, strings cut when the master is hurt or
  dazed (as a channelled hold breaks).
- `swarm.ts`: pools, with kinds as a table keyed by kind like `CLONE_RULES` (insects drain and
  sense, sand guards on its own, paper screens); areas and fire thin them.
- `sharedMind.ts`: pooled reads (`reads.ts`) and one plan across bodies.

Reused, not rebuilt: rows put bodies in front of their master; combination techniques work
between a master and a unit, or two units of one master; `teamOrders` gates what a companion
takes from you; `healthScale` and `pack` size summons; the plan screen's `owner` already shows
another fighter's cards.

### Outside the fight

The game owns everything persistent, each in its own planning round:

- **Companions** (`systems/companions`): a partner that grows, is hurt, eats and has a bond.
- **Contracts** (`ContractDef`): an animal clan, what can be called at each rank, its price.
  This is milestone 3's spirits step (`milestone3-plan.md`), where Mount Reikon opens.
- **Puppets** (`systems/puppets`): a design is a frame (durability, speed, row) and mounts
  (blades, needles, a shield, a capture box), each turned into techniques and gear the way
  `gearContract.ts` turns gear into cards; a `workshop` place kind to build and repair; which
  puppets are unsealed is chosen while planning.
- **Transplants and taken bodies:** the rare path, an arc of its own.

### Acquisition paths

Each kind of retinue lists its paths as data, with gates and odds read from the seed and the
world (never the Rng), as a nature is found rather than picked:

| Path        | How                                                                        | Odds              | Gates through                      |
| ----------- | -------------------------------------------------------------------------- | ----------------- | ---------------------------------- |
| **Born**    | a clan rite gives a pup, a hive, a family puppet                           | near certain      | clan, upbringing                   |
| **Adopted** | a stray befriended in the village; untrained at first                      | uncommon          | bonds, time                        |
| **Taught**  | a master in another town teaches the craft                                 | needs seeking out | travel, leave, a teacher's price   |
| **Signed**  | a contract scroll from a job, a sensei's own contract, or the summon realm | rare to uncommon  | missions, sensei bond, milestone 3 |
| **Taken**   | scavenged bodies, a transplanted eye; heavy costs                          | very rare, an arc | world marks, arcs, bloodline perks |

Every gate is a system that exists already; acquisition is mostly content and a few checks.
Each scenario gets its own plan before it is built.

### Companions

**The record** (`GameState.companions`, keyed by owner; the player's only for now): a stable
id, its kind, a name, stats and aptitude (rolled from the seed within its kind's shape, found
out by training, like yours), the bond, injuries, unlocks, hunger and `lastGrownDay`.

**The kind** (`CompanionKindDef`, pack content): starting stats and a talent shape (arts it
can never learn have aptitude 0: a hound has no genjutsu), `healthScale`, traits (`brawler`,
`swift`), a diet, what the bond unlocks, and a **temperament**:

| Temperament | Where from                  | Genes | Bond and orders                         |
| ----------- | --------------------------- | ----- | --------------------------------------- |
| **bred**    | a clan's kennels, a breeder | true  | quick to bond, takes orders early       |
| **stray**   | the village streets         | rough | slow to trust at first, then ordinary   |
| **wild**    | the forest, the mountains   | wide  | slow to tame and bond, orders come late |

Temperament is data on the kind (a bond rate, how many stages later orders come, a limit
bonus), so a new kind is a row, never a branch.

**Growing stronger** (agreement 6: no free power). Each body trains on its own:

- **Its routine:** a light daily regimen, caught up lazily per day like peers (hashing the
  seed, never the Rng). It keeps it from falling behind; it won't climb much.
- **Training together:** at a training place, a drill with your partner costs your slot and
  energy, grows you as usual, and grows it in a stat you pick, far more than its routine.
- **Fights teach it**, as they teach you.

**The bond** (the bonds system's points and stages) opens what is earned:

| Stage | Opens                                                                                   |
| ----- | --------------------------------------------------------------------------------------- |
| 1     | It takes your stance orders in a fight                                                  |
| 2     | Its first kind technique; it takes card orders                                          |
| 3     | A trait (e.g. `tracker`: it may take a job's tracking check); its half of a combination |
| 4     | Its deeper technique; a combination that fires with yours (you learn your half as ever) |

A wild kind's orders come a stage or two later. The bond grows with daily care (feed, walk,
play), training together, and fights and jobs done together; neglect only lets it drift.

**Care** (slice 2b, agreed):

- **Feeding:** one meal a day keeps it fed; its hunger is settled each morning. A missed day
  is only peckish; two days hungry (fights weaker by your hunger stages, its routine stops);
  three or more starving (much weaker, and the bond drifts down). It never dies of it. A
  **stray** starved long enough wanders back to the streets (and may be won back); a bred or
  born companion never leaves.
- **What it eats, in tiers:** scraps (free once a day after you've eaten at home: fed, no
  bond); plain food (meat, fish: fed, a little bond); a treat (its favourite, or a dish cooked
  for it at the stove, better for a better meal quality: more bond and a small lift for the
  day); **medicine** from the vet, hidden in a treat or given plainly (it may spit it out, and
  minds). Each animal's favourite is drawn from the seed and found out by feeding it, like your
  own talents. On the road it eats from your pack at camp.
- **Play:** once a day, a little energy, no time slot; you pick how (rough and tumble, fetch,
  hide-and-seek by scent, a quiet walk) and each kind has tastes, like people's traits.
- **Training together:** at a training place, you drill it as its **teacher** (the teacher rule:
  the grade gap between you), in a stat you pick; your slot and energy, some bond.
- **Health and injuries:** its health carries between fights and heals overnight, like yours
  (the fight's outcome reports each ally's health). Knocked down, it is injured for some days
  (a light injury fights weakened, a bad one stays home).
- **The vet:** an authored person in each pack with a clinic (treatment once per injury,
  medicine, boarding while it heals); in Konoha the clinic is in the Inuzuka compound
  (`compounds-plan.md`), free to the clan's own.
- **Where (the screens):** daily care (feed, play, medicine) is on the companion itself,
  anywhere it is with you: a strip on the village screen (name, health, hunger, a stamp when it
  needs you) opens its sheet. Deliberate things stay at places: training together at a training
  ground, treatment at the vet.

It fights beside you in every
fight you are in, on jobs and in spars; it is yours, not a crew member, so crew rules don't
change. In the fight it is an ally whose orders the bond opens; the `master` link returns
when something first reads it (a combination between you, the outcome's `units`).

**Acquisition sources** (data, so each grows by content):

| Source     | How                                                                                                            | Odds and gates                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **born**   | a clan grants a kind (`ClanDef.companion`): a pup at graduation, some bond                                     | near certain for the clan                       |
| **stray**  | a stray turns up at some village places on days drawn from the seed; befriend it over days of feeding          | not every save; kind and odds vary              |
| **wild**   | sought on purpose in a `wilds` place of the kind's biome (a wolf in the forest); tracked over days, then tamed | rare; perception and patience; wild temperament |
| **bred**   | a breeder or a clan's kennels, as a gift at a high bond or for a price                                         | a person's bond, ryo                            |
| **reward** | a job's `reward.companionKindId`: a rescued animal that follows you home                                       | once, by story                                  |

**Slices** (step 2 is four PRs):

- **2a, the companion:** the system and slice (with a save migration), kinds (validated), the
  born and stray paths, the companion beside you in every fight (an ally,
  orders by bond stage), its routine, and its sheet on the Bonds tab.
- **2b, care:** feeding and hunger, play, training together, health, injuries and the vet
  (after the clan compounds, `compounds-plan.md`).
- **2c, finding them:** wild kinds sought on purpose in wilds places (the wolf), breeders and
  kennels, job rewards.
- **2d, what the bond opens:** kind techniques, traits (a check role), combinations.

### Companion moves: the brainstorm

Slice 2d gave each kind three or four moves and the player one (Pincer Strike). That is too
few. This brainstorm is kept so none of it gets lost; every idea is written against verbs the
engine already has.

**Where moves come from** (more sources, more reasons to play):

- **The bond's stages:** instinct moves.
- **Its kind's handler:** working moves from a kennel master; a clan handler's signature arts.
- **Handler scrolls** sold in other towns: each region's style teaches a different family of moves.
- **Temperament and genes:**
  - a wild one knows a hunting move from the start;
  - one big for its kind gets a power move;
  - one quick for its kind gets a speed move.
- **Learning by doing:**
  - enough fights won together;
  - a job in the matching role (tracking jobs teach Cold Trail).
- **Quests and rewards:** a rescued animal that knows a trick; an old hunter's manual from a job.

**Companion moves by family:**

- **Hounds:**

  | Move                     | What it does                             | Verb                                      |
  | ------------------------ | ---------------------------------------- | ----------------------------------------- |
  | Fang Rush (built)        | closes and bites                         | damage                                    |
  | Snapping Feint           | a fake lunge that pulls a guard off you  | confuse, brief                            |
  | Bark Alarm               | reveals a hidden foe                     | sense or search                           |
  | Scent Mark               | the foe can't hide and takes harder hits | afflict, or a new marked condition        |
  | Ankle Lock               | holds a leg; strength breaks it          | pin                                       |
  | Pack Circle              | boxes a foe in (needs a second animal)   | field                                     |
  | Guard Dog                | stands over you and takes the next blow  | counter or substitute, aimed at the owner |
  | Dynamic Marking (ninken) | fouls a foe's footing                    | field                                     |

- **Wolves:**

  | Move              | What it does                                             | Verb                        |
  | ----------------- | -------------------------------------------------------- | --------------------------- |
  | Hamstring (built) | bleed                                                    | afflict                     |
  | Throat Lunge      | slow; hits hard on a dazed or pinned foe                 | finisher damage             |
  | Stalk             | hides before the fight properly starts                   | conceal                     |
  | Howl to the Pack  | calls a stray wolf for a few exchanges (rare, wild only) | clone, a wolf kind          |
  | Run Down          | outpaces a foe fleeing or stepping away                  | move                        |
  | Alpha's Stare     | makes a weaker foe hesitate                              | daze, only on a lower grade |

- **Big cats** (a mountain cat or snow leopard, for the original pack):

  | Move              | What it does                          | Verb               |
  | ----------------- | ------------------------------------- | ------------------ |
  | Pounce            | an entry from far                     | damage, entry      |
  | Raking Claws      | a flurry of cuts that bleed           | damage and afflict |
  | Vanish into Cover | hides; strong in forests              | conceal            |
  | Coiled Spring     | dodges, then strikes back at once     | counter            |
  | Silent Approach   | strikes first at the start of a fight | first strike       |

- **Bears and boars:**

  | Move                   | What it does                            | Verb                  |
  | ---------------------- | --------------------------------------- | --------------------- |
  | Maul                   | a slow, brutal blow                     | damage, wild accuracy |
  | Bowl Over              | throws the foe to mid and staggers them | knock                 |
  | Bear Hug               | a crushing hold only strength breaks    | pin and damage        |
  | Hide Like Iron         | a guard stance against blows            | empower, defence      |
  | Rampage                | hits everyone close, friend and foe     | small area            |
  | Tusker's Charge (boar) | charges in and knocks back              | entry and knock       |

- **Birds of prey** (hawk, owl; scouts as well):

  | Move          | What it does                                      | Verb                          |
  | ------------- | ------------------------------------------------- | ----------------------------- |
  | Stoop         | dives from far onto the back row                  | damage, far reach             |
  | Eye Rake      | strikes the eyes                                  | daze, or a blinding condition |
  | Sky Watch     | sees everything hidden, and a foe's plan          | sense                         |
  | Wing Buffet   | spoils aim, scatters smoke and poison             | confuse, or breaks a field    |
  | Carry Message | out of a fight: calls help on a job, scouts ahead | a scout role                  |

- **Serpents** (for shamans later):

  | Move          | What it does                        | Verb            |
  | ------------- | ----------------------------------- | --------------- |
  | Venom Bite    | saps strength and speed             | afflict, poison |
  | Constrict     | a hold kept up while it squeezes    | pin, channelled |
  | Hypnotic Sway | a hold against poise                | daze            |
  | Shed Skin     | slips a hold or a seal once a fight | substitute      |

- **Monkeys and clever kinds:**

  | Move          | What it does                            | Verb                           |
  | ------------- | --------------------------------------- | ------------------------------ |
  | Pickpocket    | steals a foe's tool, or uses your pouch | items                          |
  | Thrown Stones | a ranged nuisance                       | damage, far                    |
  | Distraction   | a foe's next move goes wide             | confuse                        |
  | Untie         | frees you from a hold                   | struggle help, as a teammate's |

**Moves the player learns as a handler** (the bigger gap):

- **Commands**, a new technique family taught at clinics and by handler scrolls. Cheap in
  chakra, acting through the animal:

  | Command | What it does                                      |
  | ------- | ------------------------------------------------- |
  | Heel    | it pulls back to guard you                        |
  | Sic 'Em | it gets an extra attack this exchange             |
  | Fetch   | it brings back a dropped weapon or a thrown kunai |
  | Hold    | it pins whoever you name                          |
  | Speak   | its bark breaks an illusion on you                |

- **Combinations**, a pair per family, taught by handlers:

  | Pair                          | Notes                                              |
  | ----------------------------- | -------------------------------------------------- |
  | Pincer Strike / Flanking Bite | built                                              |
  | Fang Over Fang                | the Inuzuka clan art, made a true combination      |
  | Rider's Charge                | you ride a big companion in: an entry with a knock |
  | Feint and Fang                | your feint opens them to its bite                  |
  | Hunting Call                  | your sound illusion and its howl: a wide daze      |
  | Skyfall                       | your throw and a hawk's stoop, both from far       |

- **Support arts:**
  - Beast Medicine: heals your companion mid-fight; a medic art the vet teaches.
  - Shared Senses: borrow its perception for scouting and checks; a high-bond sensing art.
  - Beast Mimicry: Four Legs in the fan pack, a plain version in the original.
- **Clan arts that need a companion beside you.** The original pack has no animal clan, so a
  beast-handling school taught outside the village fills that place.

**Rough balance rules:**

- Each kind has five to seven moves:
  - instinct moves at bond stages 1–2;
  - handler-taught working moves;
  - a signature move;
  - a combination half.
- A companion takes only a few moves into a fight (two or three for a dog, by its intellect,
  as a plan's slots), so choosing them is a decision.
- Roles that work outside a fight (tracker, scout, guard, thief) make it worth having on jobs too.

**Open questions:**

1. Which families come next after hounds and wolves? A hawk is the strongest pick: it fights
   differently and scouts.
2. Should commands be a technique family of the player's own, or should there be combinations only?
3. Should a companion get its own plan (two or three moves chosen), or always bring everything it
   knows?
4. Should moves be learned by doing (fights and jobs), or only through bond, handlers, scrolls
   and quests?

### Summons and contracts (step 3): the proposal

For discussion before building. Summons are **called** full bodies with **their own minds**,
paid for in **chakra every exchange**, and they **go home** rather than die. The game keeps the
lasting side: a contract with a clan of summons.

**In the fight** (engine work, `engines/plan/units.ts`). Clones are counts on their maker, not
fighters, so this is new: a full fighter joining the field mid-fight.

- **The call.** A `summon` verb on a technique names what it calls (`CombatantSetup.calls`, by
  id): one huge body (`healthScale` well over 1) or a few small ones (`pack`). Calling costs the
  technique's chakra and the turn.
- **Where it enters.** In the front row, before its summoner. A big summon screens its summoner
  as a front-row fighter does now.
- **Upkeep.** Chakra each exchange, more for a bigger summon (as clones pay,
  `cloneUpkeep.ts`). When its summoner can't pay, it goes home. It goes home too when it falls
  or its summoner does, and the fight ends with it gone.
- **Its mind.** Its own, with orders by your standing with the clan (as a companion's bond
  opens them). An elder summon may refuse an order it doesn't like, and may leave early if
  insulted (a weak summoner, or no offering).
- **Foes.** Foes can summon too (`EnemyDef.calls`). Scouting sees a summoner's contract only
  with sharp eyes, or not at all (a `hidden` tell).
- **The outcome.** `CombatOutcome.units` reports how each summon left (fell, sent home, stayed
  to the end), so the game can count it.

**Outside the fight** (`systems/contracts`, `ContractDef` in each pack):

- **A contract is a clan of summons:**
  - a name and an elder;
  - its members by tier: small ones first, a war-summon at the top;
  - the art it is called through;
  - its tastes (offerings it likes);
  - its temper.
- **What you can call** is set by your rank, your reserves and your **standing** with the clan.
  Standing is a bond with the clan as a whole, raised by summoning well, offerings and the
  clan's own jobs, and lowered by wasting them or letting them fall for nothing.
- **Signing** (the signed path):
  - a scroll from a rare job;
  - a sensei or teacher's own contract, offered at a high bond;
  - a shrine on Mount Reikon (the original pack's spirit realm, which this opens);
  - a reverse summoning, by accident or by story.

  One contract at a time, as in canon; breaking one is a story beat.

- **Each summon is a character:**
  - small ones are cheerful;
  - the elder is proud and demands offerings (sake, a meal cooked well, the cooking system);
  - the war-summon answers only at the highest standing.

  What they say comes from content (their voice lines).

- **Summons and the spirit art.** Milestone 3 places the spirit art and Mount Reikon here. The
  Naruto pack's summons are space-time ninjutsu. In the original pack summoning could be the
  **spirit** art: Mount Reikon's spirits answer contracts. That would open the spirit discipline
  (teal), which shamans build on later.

**Content to start with:**

- **The Naruto pack:**
  - the toads (Mount Myōboku, signed through a sensei of that lineage, or by a job);
  - the slugs or snakes as rarer second contracts;
  - Ibiki's summoned instruments (existing techniques) come to read the same rules.
- **The original pack:** one Mount Reikon contract, the **lantern foxes**: spirit foxes in a
  ladder from kit to nine-tailed elder, with a shrine on Reikon to sign at.

**Decided** (with the designer):

1. **Summoning is ninjutsu in both packs** for now. The spirit art, a new discipline, comes with
   shamans, where it is the point.
2. **Contracts come only from jobs and teachers.** Mount Reikon isn't a summoning mountain; only
   the toads have a mountain (Myōboku, in the fan pack, reached by story, not by road).
3. **Standing is with the whole clan** for now.
4. **One contract at a time.**
5. **No rank lock.** What you can call is limited by what it costs:
   - chakra above all (to call it, and every exchange it stays);
   - for some summons, more: an offering of food carried into the fight, blood (some of the
     summoner's health), or a sacrifice.

   A genin may sign; few can pay for more than the smallest.

### Swarms (step 4): the proposal

For discussion before building. A swarm is a **pool**, not a body: a quantity its host spends
and regrows, which the other side can't target but can thin. The style poses one problem: a
pool that drains and senses. Areas and fire thin it, and you shouldn't let it settle on you.

**What exists today.** The fan pack's insect clan already has eight techniques, each a plain
verb paid in chakra: a swarm that bites (damage), the jar (seal), the rope (pin), the wall and
the clone (substitutions), the sphere and the tornado (drain, the tornado over an area) and the
jamming (conceal). Nothing is spent from a hive, nothing thins it, and the insects sense
nothing. This step gives those techniques a pool to come from.

**In the fight** (`engines/plan/swarm.ts`, kinds as a table like `CLONE_RULES`):

- **The pool.** `CombatantSetup.swarm` is `{ kind, size, cap, regrowth }`. A meter on the host,
  beside chakra ("Hive: thick", "thin", "spent"), shown in words and a bar, never as a number
  in the story.
- **Spending.** A technique may cost swarm (`swarmCost`) besides or instead of chakra. A host
  with an empty hive can't use it, as with chakra. The chakra cost stays small, because the
  insects do the work.
- **Regrowth.** Each exchange the pool regrows by its kind's rule. Insects breed slowly on
  their own, and faster on what they drain: chakra drained from a foe feeds the hive.
- **What the kind does** (insects to start; sand, paper and ink later fill the same table):
  - **Settling.** A hit with a swarm technique may leave insects on the target: a lingering
    drain, worn down each exchange like a burn. The target can scrape them off by struggling,
    as against a pin. Fire burns them off at once.
  - **Sensing.** Insects on a foe keep them found: they can't hide, and their conceal fails.
    A host also gets a passive Search against hidden foes, stronger as the hive is thicker.
  - **Screening.** The insect wall and clone spend swarm to take the hit.
- **Counters:**
  - An area technique that catches the host's side kills part of the pool: wide more, vast
    most.
  - A fire technique kills more of it, and burns off insects settled on anyone.
  - Foes and teammates know this: a default plan brings an area or fire against a swarm
    (as the plan's counters table already says), and scouting names "Swarm" with that counter.
- **Foes.** `EnemyDef.swarm`. A hive is carried inside the body, so before the fight it reads
  as a `hidden` tell, like a retinue.
- **The outcome.** `CombatOutcome.swarm` reports what the pool ended at, for the game to keep
  (if the hive is persistent, question 1).

**Outside the fight** (`systems/swarms`, a `SwarmKindDef` per pack):

- **The born path.** The insect clan's rite gives a child their hive. Its cap grows with the
  host's chakra reserves and with clan training (the clan's swarm techniques taught at the
  compound, as today).
- **Keeping it** (if persistent):
  - insects lost in a fight breed back over days;
  - a hungry host breeds them slower;
  - a quiet day at home with the hive (an action, like playing with a companion) speeds it.
- **The original pack** needs a swarm of its own, or none yet (question 3). The lantern village
  suggests **lantern moths**: drawn to light, dusting a foe so they glow (sensing, no hiding),
  and blinding with their scales (a daze) rather than draining.

**Decided** (with the designer):

1. **The hive is in the body, and it costs chakra for life.** Embedding the insects in the
   flesh is a clan secret, done at birth. It gives the hive a **share** of the host's chakra
   for good: a little, half, or most, chosen at creation by a child of the clan. The share is
   taken off the host's own chakra, and it sets how many insects the body can keep (its
   **cap**). Later in life the same operation can be learned from:
   - an S-rank scroll in the clan's own library;
   - another scroll somewhere out in the world;
   - a rogue of the clan who can be talked into teaching it.
2. **Insects are lost and bred back.** The hive is persistent. Damage kills insects in a
   fight, and some kinds of damage are worse for some **strains** (fire for most). An
   installed host's insects breed back quickly at home, and the host keeps a lot of them.
3. **Strains, and crossbreeding.** The clan's own strain is famous for draining chakra fast,
   and the install makes it hardier and lets the body hold more. Away from home you find other
   insects (wild places of other biomes and other countries), study what they do, and
   crossbreed them into your hive over time to mix their strengths.
4. **Draining a foe's chakra restores your own** (the `drain` verb's `absorb`, which the clan's
   techniques already use).
5. **The original pack starts from moths.** A clan of its own keeps lantern moths: glowing dust
   that keeps a foe found, and scales that blind. They drain less and sense more.
6. **Sand is a different thing, built later.** It is a pool made and remade by jutsu, so it
   can recover mid-fight, and it guards its host on its own. Its user learns sand techniques.
   It comes as its own slice, after the hive.

**The design that follows from these:**

- **In the fight** (`engines/plan/swarm.ts`, `rules/swarms.ts`):
  - `CombatantSetup.swarm` is `{ strain, count, cap }`, where a strain is the rules as data: how
    fast it drains, how hardy it is, what kills it most (by element or area), whether it senses
    or blinds.
  - Swarm techniques spend insects (`swarmCost` on the technique) beside a little chakra.
  - Insects don't breed mid-fight. They are lost to:
    - areas that catch their host's side (more for a wider area);
    - hits on their host by a damage kind the strain fears;
    - the ones spent on a wall or clone that takes a blow.
  - What they do: settle on a hit foe as a lingering drain that feeds the host's chakra (scraped
    off by struggling, burnt off by fire), keep a foe they sit on from hiding, give the host a
    passive Search, and screen (the wall and the clone).
  - `CombatOutcome.swarm` reports how many came home.
- **Outside the fight** (`systems/hives`, `GameState.hive`, a pack's `StrainDef`s):
  - the hive slice holds the strain, share, cap and count, and what strains you have studied;
  - each day at home the count breeds back towards the cap (faster for an installed host);
  - the share comes off max chakra wherever chakra is worked out;
  - foes carry hives too (`EnemyDef.swarm`, read before the fight as a `hidden` tell).

**Build order** (each its own PR):

- **4a, the hive in a fight:** the engine pool, strains as rules, losses, settling, sensing,
  the outcome. The fan pack's insect techniques gain `swarmCost`.
- **4b, the hive at home:** the slice, the install chosen at creation (a little, half or most),
  chakra given up, breeding back, fights writing back losses, the hive on the Shinobi tab, the
  moth clan in the original pack.
- **4c, other strains:** wild insects found away from home, studied, and crossbred.
- **4d, the install later in life:** the S-rank scroll, the scroll in the world, the rogue who
  teaches.
- **4e, sand:** a jutsu-made pool that recovers mid-fight and guards on its own.

**Still open** (answered with sensible defaults unless you say otherwise):

- The original pack's moth clan is new: the **Tōga** ("lamp moth"), who tend the moths that
  gather at the village's great lanterns. A child of the Tōga starts with the install, like a
  child of the insect clan.
- An adult taking the install later gets the same three shares, but at a price: days laid up
  while the body takes the hive.

### Strains and crossbreeding (step 4c)

To crossbreed, a strain has to be made of parts that can be mixed. The designer's model has two
layers: **qualities** every insect has, as a matter of degree, and **gifts** only some species
carry, which can be strong or weak.

**Qualities: what every insect has** (graded E to A, like stats; each read by one rule in
`rules/swarms.ts`):

| Quality   | What a better grade does in a fight or at home                                  |
| --------- | ------------------------------------------------------------------------------- |
| Speed     | Swarm attacks are harder to slip: fast insects land.                            |
| Bite      | Swarm attacks hit harder.                                                       |
| Toughness | Fewer insects lost to areas and feared elements.                                |
| Brood     | Breeds back faster at home.                                                     |
| Size      | Smaller insects: more of them to the chakra given (a bigger cap), each lighter. |
| Senses    | Finds the hidden; settled insects keep a foe found.                             |

**Gifts: what makes a species** (each one weak, strong or great, or absent):

| Gift         | What it does                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Chakra drain | Settled insects draw a foe's chakra into the host. The Aburame's kikaichū have it great; a few wild kinds have a trace. |
| Camouflage   | Swarm attacks are hard to see coming, so even harder to slip.                                                           |
| Glow         | Dust that marks: a settled foe can't conceal and is easier to hit.                                                      |
| Blinding     | Scales in the eyes: swarm techniques may daze, and settled foes aim worse.                                              |
| Venom        | Settled insects poison as well (saps strength and speed).                                                               |
| Silk         | Swarm holds grip harder and are harder to break.                                                                        |
| Shell        | The wall and the clone stand more hits before they come apart.                                                          |

**Weaknesses** are what a species can't stand: fire, wind, water, earth or lightning, each
doubling the losses to that element.

**Species and family.** Every strain has a species (kikaichū, lantern moth, paper wasp…) and
belongs to a family (beetles, moths, wasps, spiders, flies). How far apart two strains are is
how far apart their species are: the same species, the same family, or strangers.

**The strains to start with:**

- **Kikaichū** (beetles): chakra drain great; speed C, bite D, toughness B, brood C, size B,
  senses C; fears fire.
- **Lantern moths** (moths): glow strong, blinding strong; senses B, speed C, the rest D;
  fears fire and wind.
- **Wild strains away from home**, by biome, each with a quality or a gift worth having:
  - woods: a paper wasp (fast, a weak venom) and a weaving spider (silk);
  - marsh: a midge cloud (tiny, a fast brood);
  - river: a water beetle (shell, no fear of water);
  - mountain: a rock locust (tough);
  - grassland or anywhere at night: a bark moth (camouflage);
  - a few with a trace of chakra drain, found far from home;
  - foreign markets sell rarer strains for a price.

**Crossbreeding is luck, forgiving when simple and wild when complex:**

- **Stability.** Every cross has a stability, set by how far apart the parents are (same species,
  same family, strangers) and how many crosses deep the lineage already is. A first cross
  within a species is near certain; strangers several crosses deep are a gamble.
  Stability shows in words (true-breeding, settled, wavering, wild), never as a number.
- **What the brood inherits** is drawn from the seed and the day (never the Rng):
  - each quality lands between the parents' grades, and a less stable cross strays further
    either way;
  - each gift passes at its strength, a step weaker, or not at all, more often lost the less
    stable the cross; a stable cross keeps what both parents share;
  - weaknesses pass more easily than gifts;
  - a wild cross may throw back to one parent, fail outright (the brood dies and the
    insects spent on it are lost), or, rarely, come out with a gift stronger than either
    parent's.
- **Doing it.**
  1. Find insects in a wild place (an action like foraging, once a day): what turns up hangs on
     the biome, the season and your perception. A find goes into a jar at home.
  2. Study a jar each day at home to learn what it is; a cross needs it understood first.
  3. Cross it into your hive: over a few days at home the hive breeds the new strain, thinned
     while it does. You name what comes out. If you don't like it, the only way back is
     another cross.
- **The install** a child of the clan is born with adds a grade of toughness and size to
  whatever strain the body holds.

**Still open:**

- whether a hybrid is capped (a budget across qualities and gifts) or a patient breeder can
  stack everything given enough luck. The default is no cap: instability is the brake;
- whether a moth host may cross beetles and wasps, or only moths. The default is any insect,
  with strangers being the least stable cross.

### Shamans: spirits seen, bound and sealed

A shaman sees spirits, deals with them, and seals them into items and people to empower them.
It is the retinue's most open-ended user, and it adds two things the five properties don't
cover:

- **Sight.** A spirit unit is a full body only some can see. Those who can't, can't target it
  or read it, and the `spirit` trait already makes plain blows barely touch it. Seeing
  spirits is a perk (beside `insight`), so it also lets a shaman follow the night sights that
  today only an awakened bloodline can (`game/village.ts`).
- **Binding.** A spirit does not have to fight beside you. Sealed into an **item**, it becomes
  part of the gear: a focus-like boost, a perk, or an own-mind spirit acting through the
  weapon (Shaman King's over soul). Sealed into a **person**, it is a `ModifierSpec` plus
  combat perks, in yourself or in someone else (decision 11: identity is modifiers). A tailed
  beast's host is the same thing at its largest scale, so the naruto pack's jinchūriki can come
  later by this road.

Outside the fight: spirits are met (at places, at night, on the road), befriended or bargained
with (the bonds system, or a price), carried and released. Sealing is fūinjutsu's to do; the
spirit art (only a reserved teal colour token today, `--spirit`) may become the shaman's own
discipline. Both settings get shamans, each with its own spirits: the lantern village is the
natural home for them. Every one of these points is for the shamans' own planning
discussion; this section only fixes how they plug in.

---

## Part 4: The build plan

Each step proves one property and is its own PR.

1. **The framework** (built, Part 5): own-mind full bodies from the start; tiered scouting of
   retinues; the combined rating; the bench. One plain companion (the original pack's poacher
   and hound) proves it end to end. The `master` link, the outcome's `units`, the vital rule
   and the view's `controller` wait for the step that first reads them.
2. **Companions** (designed, Part 3): four slices, 2a the companion, 2b care, 2c finding them,
   2d what the bond opens.
3. **Summons and contracts:** called bodies, the `summon` verb, chakra upkeep, one huge or
   many small, the signed path.
4. **Swarms:** pools, kinds, swarm costs, area and fire against them, the born path for hosts.
5. **Puppetry** (planning discussion first): a discipline or not, driven bodies, strings and
   attention, design and the workshop, the taught path.
6. **Shared mind and the taken path:** pooled reads, a hidden controller, revival, the arc.
7. **The original pack's equivalents** (planning discussion first). Until then each PR ships
   engine rules with a plain placeholder in the original pack and its fan content in the fan
   pack, so `check:release` stays honest.
8. **Shamans** (planning discussion first): seeing spirits, spirit units, binding into items
   and people, the spirits of each setting, and how one becomes a shaman.

---

## Part 5: What was built

### Step 1: the framework

- **In the fight:** a companion is one more fighter on its master's side, by its own judgement,
  and fights on when its master falls. It hits no harder for being theirs (agreement 6). A
  tandem bonus was tried first (15% while both stood free of dazes and holds) and taken out:
  harder hits are to be earned through combination techniques and the bond.
- **Content:** `EnemyDef.retinue` (entries of `enemyId` and a `tell`), validated in
  `validateRetinues.ts` (a real enemy, not themselves, no retinue of its own, no more dangerous
  than its master). The game expands a foe with `enemyParty` (`game/combatants.ts`), in mission
  fights and watched matches. The original pack's poacher keeps a hound at heel, met on the
  night watch over the smokehouse.
- **Tiered scouting** (`game/retinueSight.ts`): a `tell` is `open` (always seen), `kept`
  (perception 5 up gives a first chance, at most 80%) or `hidden` (perception 9 up, at most
  35%), drawn from the seed and the foe, never the Rng, so a notice reads the same each time and
  grows clearer with your eyes. The report, a recon of their kit and the fight show everything.
- **The combined rating** (`partyPower`, `systems/stats/tiers.ts`): (Σ powerᵏ)^(1/k) with
  k = 1.5, each companion weighted by its `healthScale`. Measured on the bench: fights are steep
  (a plain fighter one point up on every stat wins every time), so even an E-grade hound beside
  an even foe turns a fair fight into a rare win; the rating reads that pair as stronger than
  you, and an equal pair as far stronger. Scouting reads every foe with the companions seen
  (`opponentPower`), the notice counts them, the report and the encounter's field notes name
  them, and the fight's read says how to answer the pair.
- **Bench** (`src/test/bench/retinueBench.test.ts`): an even fight becomes a rare win against
  the pair; the pair rates beyond even; a companion is worth its own grade (a grown hound is
  worse to face than a pup).
- **Left for later:** the naruto pack's handler (with the companions step, beside the player's
  own); a hound's nose in the encounter's stealth approaches; group threat for foes who are not
  a retinue (three bandits still read as their toughest), which moves crews on existing jobs and
  wants its own calibration.

### Step 2a: the companion

- **The system** (`systems/companions`): the `Companion` record (id, kind, name, stats, a
  rolled aptitude, bond points, `lastGrownDay`), the slice `GameState.companions` (`owned` by
  owner, yours under `PLAYER_OWNER`, and a stray being won over), and the temperament table
  (bred bonds ×1.2, stray ×1, wild ×0.6 and takes orders a stage later). A save step gives older
  saves none (a clan child of an older save meets no pup).
- **Content** (`content/companions.ts`, validated in `validateCompanions.ts`): `CompanionKindDef`
  (temperament, a starting body no better than a fresh genin's best, `healthScale`, traits,
  a talent shape with 0 for arts it never learns, names, and for street kinds a `stray` haunt:
  places of the start village, the share of saves that meet one, its lines) and
  `ClanDef.companion`. Naruto: the Inuzuka grow up with a bred ninken (bond 30, friends);
  both packs have a stray hound.
- **The game** (`game/companions/`): `newCompanion` rolls talent (±15% around the kind's) and a
  name from the seed and its id; the born pup is given at creation; its routine (`routine.ts`:
  light running, sniffing, scuffles, a quarter of days idle) is caught up each morning like
  peers'; `stray.ts` decides, from the seed and day, whether a save meets a stray and when it is
  about (40% of days, at one of its haunts), for anyone without a companion in their village.
  `befriendStray` spends a slot with it once a day; on the third day it follows you home (bond
  5, an acquaintance soon).
- **In fights** (`companions/combatant.ts`): your companion is an ally in every mission fight and
  spar, by its own judgement, taking stance orders and then card orders as the bond opens them
  (the order screen says why not yet). The forest exam's "teammate down" doesn't count it.
- **Views:** the companion's card heads the Bonds tab ("At your side": what it is, the bond, what
  it takes from you, its best grades); a stray about shows on the hub's village life.
- **Waiting for 2b:** it fights at full health every time (injuries are care), it isn't fed yet,
  and training together, walks and play are care too. The wild limit bonus comes with 2c.

### Step 2b: care

- **The record** gains `health` (carried between fights, mended half its maximum each night),
  `lastFedDay`, `lastPlayDay`, an `injury` (home until a day, treated once, dosed once a day) and
  whether you've found its favourite; the slice gains a `strayed` companion and the doses of
  `medicine` you carry. Rules in `systems/companions/care.ts`. The companions save step
  gives all of it.
- **Feeding** (`feedCompanion`): one meal a day: scraps (free: fed, no bond), plain food from its
  kind's `diet` in your pantry (a little bond), or its favourite (drawn from the seed, found out
  by feeding it: more bond). Hunger counts days without a meal (fed, peckish, hungry, starving):
  hungry or worse it fights weaker and skips its routine; starving, the bond drifts; a **stray**
  starved for days goes back to the streets (`strayed`), and winning it back brings it home as
  itself. On a job it eats from your pack.
- **Play** (`playWithCompanion`): once a day, a little energy, four games (rough and tumble,
  fetch, hide-and-seek by scent, a quiet walk) worth more or less by its kind's `plays` tastes.
- **Training together** (`trainCompanion`, a "Train with" section on the training ground's
  board): you drill it in a stat it has talent for, as its teacher (the teacher rule: your
  grade over its own), for your slot and energy and some bond. Not while laid up or hungry.
- **Injuries:** the fight's outcome now reports each ally's health (`CombatOutcome.allies`), so
  a companion keeps its wounds; knocked down in earnest it is laid up for days and stays home
  (a spar stops before anyone is hurt).
- **The vet** (a `vet` place: `keeperId`, `treatmentCost`, `medicineCost`, `freeForClanId`):
  treatment once per injury (half the days left, its strength back), medicine by the dose, given
  at home hidden in food or plainly (it may spit it out). Konoha's is the Inuzuka Animal Clinic,
  run by Hana and free to the clan; Tōrōgakure's is Kaori Kiyose's clinic.
- **Screens:** a strip on the village screen (name, a health bar, hunger, a stamp when it needs
  you) opens its sheet over any tab (feed, play, medicine, each saying why not); its card on
  the Bonds tab opens the sheet too; the clinic is a counter of two slips.
- **Left for later:** boarding at the vet, dishes cooked for it at the stove, a light injury
  that fights weakened, and the wild limit bonus (2c).

### Step 2c: finding them

- **Temperament rules** (`systems/companions`) gain a limit shift and the days to win one:
  bred 0 and none (it is given), stray −2 and three days, wild +4 and five good days.
  `companionGrowth` (`game/companions/routine.ts`) moves every limit by the shift, so a wolf
  grows past what its talent alone would allow and a stray stops a little short; an art it can
  never learn stays at 0.
- **Wild kinds** (`CompanionKindDef.wild`: a biome, the share of its wild places that have one,
  and its lines) live in some `wilds` places of their biome, read from the seed and the place
  (`game/companions/wild.ts`), and leave signs there for anyone without a companion. Tracking
  (`trackWild`) is two slots and hard-work energy, once a day and never at night; a day gets
  closer by a chance perception raises (never past 85%) and otherwise goes cold without losing
  ground. Five good days and it comes to you at no bond, slow to bond and a stage late to take
  orders. Both packs have the forest wolf (`shared/wildKinds.ts`) in their woods: a stronger
  body than a hound (base 5, health ×0.8, brawler and swift).
- **Kennels** (`VetFields.pups`: a bred kind, a price, the bond stage with the vet at which a pup
  is a gift): `takePup` at the clinic for anyone without a companion. Tōrōgakure's clinic breeds
  kennel hounds (600 ryo); the Inuzuka clinic sells ninken to outsiders (1,500 ryo); either vet
  gives one to a close friend. A pup starts as an acquaintance.
- **Rescues** (`MissionDef.reward.companionKindId`): an animal the job saves follows you home if
  you have none (otherwise the client keeps it); the debrief names it. The Pup in the Culvert
  (Tōrōgakure) and the Pup in the Old Well (Konoha) are D-rank chores after the first job.
- **Validation:** a wild kind is wild-tempered and its biome is some wild place's; a stray kind
  is stray-tempered; a kennel breeds a bred kind of the pack, for a price, gifting at a real
  stage; a job's animal is a kind of the pack.
- **Left for later:** boarding at the vet, dishes cooked for it, a light injury, wild kinds of
  other biomes (a hawk on the mountain, a river otter) and a second companion.

### Review fixes and growing up (after 2c)

A UX review and a game-design review of 2a–2c found five bugs, two design risks and a set of
screen problems. The designer then set a new fundamental: **a companion's body grows with time
and its genes, its skills with training**, and every kind has its own ceiling.

- **Bugs fixed:**
  - Companions stay out of spars, which are one against one; before, a rival spar was two against one.
  - Wild tracking has its own record (`tracking`), apart from stray befriending.
  - A stray won back is caught up from that day, and its old injury is cleared.
  - On the road a companion forages at camp, so a job never starves it.
  - Befriending a stray from anywhere in the village is kept: the card says where it is.
- **Choice:**
  - A rescued animal waits at the vet (`companions.waiting`, `takeRescued`) instead of joining
    you automatically.
  - A vet rehomes your companion (`rehomeCompanion`): a bred one back to the kennel, a stray
    back to the streets (it may be won back), a wild one back to the wild.
- **Bond pacing:**
  - Training gives bond from the day's first session only.
  - The bond drifts a point a day after `NEGLECT_AFTER` days without a game, a proper meal or
    training. Scraps keep it fed and nothing more.
- **Growing up** (`systems/companions/growth.ts`, `game/companions/body.ts`):
  - **The body:** a kind's `body` gives adult strength, speed, stamina and perception, plus
    `maturesInDays` (hounds 56, the wolf 70).
  - **Genes:** each animal's genes roll every body stat around its kind's adult value, seeded by
    its id:
    - bred ×1–1.15;
    - stray ×0.8–1.05;
    - wild ×0.85–1.15.
  - **The growth curve:** a newborn starts at 40% of its adult body. It grows fast early and
    eases out. A hungry day counts half; a starving day counts nothing.
  - **Senses:** perception grows to 70% on its own, and scent work trains the rest.
  - **The ceiling:** nothing passes 1.2 × the adult body.
  - **Life stages:**
    - pup (under 40% grown): too young to fight, stays home;
    - young: fights;
    - grown.

    The journal marks each new stage.

  - **Age at arrival:**

    | Way of coming | Arrives         |
    | ------------- | --------------- |
    | Clan-born     | half grown      |
    | Kennel pup    | a quarter grown |
    | Rescue        | 15% grown       |
    | Stray         | grown           |
    | Wild one      | grown           |

- **Training: the handler rule.** Strength, speed and stamina are never drilled. Skills (and
  perception) are drilled under the handler rule: a fixed D-grade pace held through B,
  whatever your own grades. This replaces the human teacher rule and the 2c limit shifts.
- **Save v51 (v48 before main took it):** every kept companion is grown (its body catches up as soon as time passes, and it
  loses nothing). Wild tracking starts fresh, and nothing is waiting at the vet.
- **Screens:**
  - **The strip:** health is labelled, there is one hunger word or a stamp (never both), and a
    stage badge shows while it grows.
  - **The sheet:** the stage, a body line, "A stray hound is built for the nose and speed, never
    for brute strength", big or slight for its kind, Body and Learned grades, how long it is laid
    up and what would shorten it, and every blocker shown, not hovered.
  - **Training and progress:** training tiles show its grade and the energy cost. Stray and wolf
    progress show as dots. The woods' line on the village screen names the wild one's signs.
  - **The clinic:** a Treatment slip, price stamps in amber and free ones in green, a litter
    card that says what the pup will be and how one is had free, the waiting rescue, and
    rehoming asked twice.
  - **Gates:** each gate card says what opens it, and your own clan's compound is "Your family's
    home".
- **Next (2d, rebuilt around handlers):**
  - Handler training at the vet (a kennel master) and with clan handlers (the Inuzuka), plus
    handler scrolls.
  - Check roles (a tracker uses its senses).
  - Kind techniques taught by handlers and earned by bond.
  - Combination moves last.
  - Ageing past its prime, portraits per stage, and a "stay home" toggle with light injuries
    come later.

### Step 2d: what the bond opens

- **Kind techniques** (`CompanionKindDef.techniques`, `game/companions/arts.ts`). Each opens at a
  bond stage. The deeper ones (`handler`) open only once a clinic's handler has taught them,
  kept in `companion.learned`. They live in `shared/beastTechniques.ts`: kinds' own, never
  learned by people, counted as sourced by validation through the kinds that hold them.

  | Kind   | Stage 1   | Stage 2             | Stage 3       | Stage 4                             |
  | ------ | --------- | ------------------- | ------------- | ----------------------------------- |
  | Hounds | Fang Rush | —                   | Flanking Bite | Baying Howl (a daze, taught)        |
  | Wolf   | Fang Rush | Hamstring (a bleed) | —             | Flanking Bite; Baying Howl (taught) |

  A companion fights with the techniques it knows.

- **A combination:** Flanking Bite is half of a combination with Pincer Strike, a D-rank
  taijutsu on each academy's rack. Each half plays only beside someone on your side who knows
  the other, so Pincer Strike needs a companion that knows Flanking Bite.
- **Job roles** (`CompanionKindDef.roles`; hounds and the wolf are trackers). From close friends
  (`ROLE_STAGE`), a crew job's check in that role falls to the companion when its stat is the
  best of you, your crew and it (`checkHand`), so the nose does the tracking.
- **Handlers** (`VetFields.handling`: quality, price, the bond stage with the vet, and what they
  teach):

  | Clinic                               | Quality | Price  | Bond needed   | Free to  |
  | ------------------------------------ | ------- | ------ | ------------- | -------- |
  | Kaori's clinic (kennel master)       | ×1.6    | 30 ryo | none          | —        |
  | Hana's Inuzuka clinic (clan handler) | ×2      | 40 ryo | acquaintances | the clan |
  - `handlerSession` drills a skill at the handler's quality. Every session, yours included,
    goes through one rule (`companions/drill.ts`): the work is multiplied by the handler's
    quality, and the pace never falls below a D-grade floor through B.
  - `handlerTeach` teaches a `handler` art once the bond is there, for four sessions' fees.

- **Handling lore** (`companionLore`, sold through a gear place's `loreIds`): A Kennel Master's
  Notes (300 ryo), in Port Shiomachi and in Shukuba, makes your own sessions ×1.25. Each piece
  is read once and kept in `companions.lore`.
- **Save v52 (v49 before main took it):** no companion has been taught anything, and no lore has been read.
- **Screens:**
  - The sheet's "What the bond opens": each art, known or what opens it, and the role line.
  - The clinic's handler slip: sessions as skill tiles, the fee, and the arts they teach with
    why not yet.
  - A "For handlers" shelf at shops that sell lore.
- **Later:** ageing, a "stay home" toggle and light injuries, portraits by stage, more kinds and
  their arts (summons, swarms, puppets come as their own steps).

### Step 3: summons and contracts

- **The engine** (`engines/plan/summons.ts`, `summonPlans.ts`, `calls.ts`):
  - **Calling.** A `summon` verb names one of its user's `CombatantSetup.calls` (a body, an
    upkeep, an optional blood price). It answers into the caller's front row at once and gets
    a default plan as the exchange ends, so it acts from the next.
  - **Paying.** Any blood price is paid at once, never the caller's last breath. Upkeep is paid
    in chakra at the end of every exchange.
  - **Going home.** When unpaid, beaten, or when its caller falls. A summoning card isn't
    playable while its summon is out.
  - **Reporting.** `CombatOutcome.summons` reports each call's fate: stayed, fell or sent home.
  - **Default plans** call a summon early, right after a sense or Search for a hidden foe.
- **Contracts** (`systems/contracts`, `GameState.contract`, save v55, renumbered v56 in #164):
  - **One at a time.**
  - **Standing.** Standing with the whole clan is kept in bond points:
    - a summon kept to the end +3;
    - one sent home +1;
    - one beaten −3.
  - **Who answers.** Summons answer from the stage they ask (0 at signing) if you carry their
    offering, which is given up when they are called. Only mission fights take them, never a spar.
  - **Signing.** Through a job's `reward.contractId` (if you hold none) or a teacher's
    `contract` once you are close (`signContract`).
- **Content:**
  - **The original pack:** the Salamanders of the Old Kilns, signed at the end of the Cold
    Kilns job.

    | Summon           | Answers from | Asks                     |
    | ---------------- | ------------ | ------------------------ |
    | Kiln Newt        | signing      | —                        |
    | Ember Salamander | friends      | blood                    |
    | The Kiln Mother  | bonded       | an offering of chestnuts |

  - **The Naruto pack:**
    - The Toads of Mount Myōboku: Gamakichi, Gamaken (blood), Gamabunta (wild game). Signed
      after the new job "A Toad on the Doorstep".
    - Kakashi's Ninken: Pakkun and Bull, signed with him at close friends.
- **Screens:**
  - a contract card on the Shinobi tab: the clan, your standing, and each summon's grade,
    whether it answers, and what it asks, in words;
  - "Sign …" on a teacher's sheet;
  - the debrief names a contract signed.

  Summons show in fights as ordinary fighters tagged "Summon".

- **Later:** the toads' mountain, reached by story.

### Step 3e: keeping, breaking, and foes who summon

- **Offerings.** A contract you can sign names its `tastes`. Once a day, at home, you may leave
  one of them out on the scroll (`makeOffering`): it is used up and your standing rises by
  `OFFERING_STANDING` (2), a little less than a summon kept to the end of a fight.
- **Breaking.** `breakContract` tears up your name. The contract is gone, you may sign another,
  and the clan's `parting` words are logged. The clan never takes you back: its id goes into
  `GameState.brokenContracts` (save v57), and neither its job nor its teacher offers it again.
  The card asks twice.
- **Foes who summon.** `EnemyDef.summons` lists summons from any contract of the pack, each with
  a `tell`. The foe goes into the fight with the call and its technique, the same way you do.
  Before the fight, `summonsSeen` reads the contract by its tell, as a retinue is read. Scouting
  counts a summon you can tell they hold in the threat, with its own counter ("goes home when
  they fall or run dry"). A client's report names it on the notice.
- **Content:**
  - the original pack's bandit chief keeps a cellar contract, the Rats of the Undercroft
    (`kept`);
  - the Naruto pack's missing-nin carries the rogue Sannin's snakes (`hidden`), so a Great
    Snake may come up out of nowhere.

  Contracts held only by foes need no tastes or parting words, and no one offers them.

### Step 4a: the hive in a fight

- **The contract** (`swarmContract.ts`): `CombatantSetup.swarm` is a strain's rules (drain,
  hardiness, feared elements, senses), a count and a cap. `TechniqueDef.swarmCost` is what a
  technique spends. `CombatOutcome.swarm` is how many came home.
- **The rules** (`rules/swarms.ts`):
  - a fighter without a hive pays a swarm technique's chakra alone;
  - an area that catches a host kills a share of the hive by its size (small, wide, vast),
    twice as many of a feared element, less for a hardy strain;
  - a feared hit kills insects as it hurts the host, never more than half at once;
  - settled insects draw chakra by the technique's power and the strain's drain;
  - a hive adds to its host's Search by how keen the strain is and how full the hive is.
- **The play** (`engines/plan/swarm.ts`):
  - a swarm card isn't playable without the insects it spends, and spends them;
  - one that reaches a foe settles insects on them for a few exchanges. They draw the foe's
    chakra each exchange, half of it into the host (`ABSORB_SHARE`), and keep the foe from
    hiding. Fire, or anything the strain fears, burns them off;
  - at the end of each exchange a host's hive may find hidden foes on its own;
  - the plan screen shows the player's hive as a meter beside chakra.
- **Content:** the fan pack's eight insect techniques have a `swarmCost`, and the technique
  sheet says they spend insects. No one carries a hive until 4b, so today they still play on
  chakra alone.
- **Not yet:** foes and teammates don't yet aim areas or fire at a hive on purpose. That
  comes with the hive at home (4b), when hives first appear in fights.

### Step 4b: the hive at home

- **The system** (`systems/hives`):
  - a hive is a strain, a share and a count;
  - the share (a quarter, half or most) is chakra given for good, and sets the cap, at
    `INSECTS_PER_CHAKRA` insects per point of chakra given;
  - each day the hive breeds back a share of the cap: `BREED_AT_HOME` in the home village,
    `BREED_AWAY` elsewhere, halved when the host is hungry.
- **Chakra given.** `maxChakra` reads a `chakraGiven` share (`ChakraBody`). The game reckons
  your chakra through `chakraBody(state)` everywhere: the meters, sleep, camp, exams, fights,
  exhaustion and time passing. The share comes off wherever chakra is worked out.
- **The game:**
  - `GameState.hive` (save v60) is null for most;
  - a child of a hive clan is born with it full, at the share chosen on the family history page;
  - an old save of a hive clan gets its hive the first time a day passes;
  - your hive rides into every fight, spars included, and what came home is kept;
  - people of a hive clan fight with a full hive at half, their chakra taken as yours is.
- **Content:**
  - the fan pack's kikaichū (strong drain, hardy, fear fire) for the Aburame;
  - the original pack's new clan, the **Tōga**: moth-keepers with a compound, a head (Mayu,
    who teaches their four techniques), clan talk and four moth techniques (dust that settles,
    scales that blind, a veil, a draining swarm). Their lantern moths drain little, sense
    keenly and fear fire and wind.
- **Screens:**
  - the share as three cards on the family history page;
  - a hive card on the Shinobi tab: the strain, what it took, how full it is in a word and a
    bar, and how soon it fills again.
- **Later:**
  - foes who carry hives (`EnemyDef.swarm`);
  - foes and teammates aiming areas and fire at a hive on purpose;
  - strains and crossbreeding (4c), the install later in life (4d), sand (4e).

### Step 4c-i: what insects are

- **The strain model** (`swarmContract.ts`, `content/strains.ts`):
  - every strain has six qualities graded E to A: speed, bite, toughness, brood, size, senses;
  - only some species carry gifts, weak to great: chakra drain, camouflage, glow, blinding,
    venom;
  - each strain has a species and a family (for crossing), and the elements it fears.
- **The fight** reads each one once (`rules/swarms.ts`):
  - speed and camouflage make swarm attacks harder to slip;
  - bite hits harder, and small insects hit lighter;
  - toughness sheds losses;
  - senses finds the hidden;
  - drain draws chakra (a strain without the gift settles without draining);
  - venom poisons each exchange;
  - glow makes a marked foe easier to hit, and blinding makes them aim worse.
- **The body:**
  - size sets how many insects the body keeps, and brood how fast they breed back
    (`systems/hives`);
  - the clan's install adds a grade of toughness and size to whatever strain the body holds
    (`qualitiesInBody`).
- **Content:**
  - kikaichū: drain great; size B, the rest C or D (toughness B in the body);
  - lantern moths: glow and blinding strong, senses B; they no longer drain.
- **The hive card** lists the gifts in words, the qualities as grades, and what the strain
  can't stand.
- **Not built yet:** silk and shell (swarm holds and walls), wild strains, and crossing (4c-ii).

### Step 4c-ii: finding, studying and crossing

- **Wild strains** (`shared/wildStrains.ts`, in every pack), each with a `wild` haunt:
  - paper wasps (woods: fast, a hard bite, a little venom);
  - bark moths (woods and mountain, by night: camouflage);
  - marsh midges (marsh: tiny, a fast brood, a trace of drain);
  - water beetles (river: very tough, a little camouflage);
  - rock locusts (mountain: fast and tough, a little blinding);
  - sand fleas (shore: very fast, a little venom).
- **Finding.** `seekInsects` at a wild place: once a day, for someone with a hive, an hour and
  some energy. Perception decides whether you find anything worth a jar. You keep up to three
  jars, one of each strain.
- **Studying.** `studyJar` at home, once a day: two days and you understand them, and the card
  says how a cross with your hive would go (true-breeding, settled, wavering, wild).
- **Crossing.** `crossJar` at home with one you understand. Half the hive goes into the brood,
  and it hatches three days later, as each day passes (`broodHatched`). What hatches is drawn by
  hash from the seed and the day (`systems/hives/crossing.ts`):
  - stability starts high for a first cross within a species, drops a quarter for each step of
    kinship apart (family, strangers) and a tenth for each cross deep;
  - the wilder the cross, the more often it fails (the brood dies) or throws back to a parent;
  - qualities land between the parents' grades and stray a grade more often;
  - gifts both parents share are kept by a stable cross, and one parent's comes through less
    surely, at its strength, a step weaker or not at all;
  - weaknesses pass more easily than gifts;
  - now and then a wild cross brings a gift out a step stronger.
- **Bred strains** are kept on the hive (`Hive.bred`, `StrainSheet`) and read like the pack's
  (`strainSheet`). The hive takes the new strain, and the card lets you name it.
- **Screens:** a search card on wild places for hive hosts, and jars (study, cross in), the
  brood and naming on the hive card.
- **Saves:** the new fields on the hive are optional, so no migration is needed.
- **Later:** foreign markets selling rarer strains, and silk and shell.
