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
4. **Threat counts the retinue.** `fightingPower`, scouting and a job's danger read a fighter
   with what they bring.
5. **Everything can be had, but the odds vary hugely.** Each kind of retinue has acquisition
   paths with gates and odds, from near-certain (a clan rite) to an arc of its own (a
   scavenged eye). Each scenario is planned on its own.
6. **Big questions get their own planning discussion and PR:** companion depth, puppetry (a
   discipline or not, design, the workshop), and the original pack's equivalents.

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
| Handler     | Two bodies and combination pressure: separate them, or take the weaker one out first.             |
| Swarm       | A pool that drains and senses: areas and fire thin it; don't let it settle on you.                |
| Puppeteer   | A frail master behind sturdy bodies: reach the back row, or cut the strings by hurting or dazing. |
| Summoner    | A heavy chakra bill: outlast the summon, or strike the summoner while it is out.                  |
| Shared mind | No blind spots, revivals, a hidden controller: find the source (a sensor, Search, a story beat).  |

Foes and teammates must know these too: targeting values a master whose fall ends their
bodies, and a default plan brings an area against a swarm.

### The contract

A new `systems/combat/unitContract.ts`, beside `teamContract.ts` and `gearContract.ts`:

- `CombatantSetup.retinue?: readonly UnitSetup[]`: bodies on the field from the start. A
  `UnitSetup` is a combatant's stats and kit plus its `mind` and `upkeep`.
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

---

## Part 4: The build plan

Each step proves one property and is its own PR.

1. **The framework.** `unitContract.ts`; own-mind full bodies from the start; the outcome's
   `units`; the vital rule; scouting and `fightingPower` counting the retinue; bench tests that
   units are graded honestly and that separating or felling a partner swings the fight. One
   plain companion proves it end to end (in the original pack, so the release build has it).
2. **Companions in depth** (planning discussion first): growth, bond, injuries, meals, the
   born and adopted paths.
3. **Summons and contracts:** called bodies, the `summon` verb, chakra upkeep, one huge or
   many small, the signed path.
4. **Swarms:** pools, kinds, swarm costs, area and fire against them, the born path for hosts.
5. **Puppetry** (planning discussion first): a discipline or not, driven bodies, strings and
   attention, design and the workshop, the taught path.
6. **Shared mind and the taken path:** pooled reads, a hidden controller, revival, the arc.
7. **The original pack's equivalents** (planning discussion first). Until then each PR ships
   engine rules with a plain placeholder in the original pack and its fan content in the fan
   pack, so `check:release` stays honest.

---

## Part 5: What was built

Nothing yet.
