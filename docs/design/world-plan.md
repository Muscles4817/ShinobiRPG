# World and travel: review, decisions, plan

Working document for milestone 4: other places to go, the roads between them, and who may
leave the village. Part 1 reviews what the game has today. Part 2 records what we agree.
Part 3 is the design that follows, with Port Shiomachi worked through as the reference
destination. Part 4 is the build plan. Nothing here is binding until it is in Part 2.

---

## Part 1: The review

### What travel is today

1. **The Travel tab** lists the pack's locations with days, cost and a danger line. Three are
   locked in the original pack: Port Shiomachi (a day, safe road, "Coming soon"), Sakyūgakure
   (three days, 120 ryo, "Coming soon") and Mount Reikon (four days, "Needs Chūnin rank").
   None has any places.
2. **The `travel` action** (`game/actions/travel.ts`) pays the cost, skips the days with
   `spendTime` and sets `locationId`. One journal line says you arrived.
3. **Away from home, most of the game switches off.** `whereNow` returns no one outside the
   start location, so there are no people, no talk, no training with anyone. `homeBlocker`
   means you can't sleep or rest. The board, the gear shops and the library all live in
   Tōrōgakure.

### What already exists that travel can use

The missions overhaul built most of a journey, just not for travel:

- **Days on the road** (`game/road.ts`): each day passes to the next morning through the
  same `spendTime` as home, with an evening meal from your pack (`IngredientDef.road`), a
  night in camp (`CAMP_HEALTH_SHARE`), and the sensei's lesson by the fire (`lessonAway`).
- **Legs with regions** and **road events** drawn by seed hash (`content/shared/road/`,
  regions `hill-road`, `river-road`, `coast-road`, `forest-track`, `mountain-pass`,
  `dune-road`).
- **Camp stages**, **decisions with tones**, **voices**, **marks and threads**, and the
  **field screen** with route stamps.
- **Away notes** (`game/awayNotes.ts`): your sensei won't sign you out for something that
  would make you miss an exam.
- **Places decide what you can do** (decision 10). A location with places gets place pages
  for free; every action checks `placeHere`.

### What is waiting on this milestone

- **Arc base locations** (missions plan 3.9): an act's "search" half spent somewhere else,
  with `baseLocationId` and `deadlineDays`.
- **Chakra control in the world** (progression plan, D13): tree-walking and water-walking as
  milestones that open places and routes.
- **The rogue path** (milestone 5) needs leaving to be something you can do without leave.

### What is wrong with it

- **Travel is a teleport.** Days pass with nothing in them, even though the road machinery
  exists. A one-day walk to the coast and a four-day climb up a haunted mountain play the same.
- **Destinations have no reason to exist.** Even unlocked, they would be an empty screen.
- **You can strand yourself.** Away from home you can't sleep, and nothing tells you so
  before you leave.
- **Leaving costs nothing in-world.** A genin of a hidden village can wander off for a week
  without anyone's say-so.
- **The world is a star.** Every place is a fixed distance from home; there is no "on the
  way", and no road you could open later.

---

## Part 2: Decisions

Decisions 4 and 7 to 9 are agreed. The rest are proposed until you say otherwise.

1. **Travel is a journey.** Going somewhere plays like a mission with no client: legs through
   regions, road events, a camp each night, rations from your pack. It reuses the mission
   road and the field screen; it adds no second way of passing days.
2. **The world is a map of routes.** Locations are joined by routes, each with days, a
   region per leg, a danger, and optionally a requirement (rank, a chakra-control milestone,
   a world mark). Travelling to a place walks the shortest open path.
3. **Every destination has a reason to go.** At least three things you can't get at home: a
   teacher or school, goods (gear, ingredients, tools), people, work, sights. A location with
   no reason stays locked.
4. **Leaving the village is earned.**
   - **Genin** leave only on a job, or on a pass their sensei signs (a short trip, at a
     lesson, like the library permit).
   - **Chūnin** take leave on their own, within limits (days a season).
   - **Jōnin** come and go.
   - Leaving **without** leave is possible, and is the first step of the rogue path
     (milestone 5). Until then, the Travel tab says why you can't.
5. **Home keeps going while you're away**, as on a long job: peers grow, the board turns,
   rent falls due. Abroad you sleep at an **inn** (a new place kind) or in camp.
6. **People travel too.** Some people live elsewhere (authored residents with schedules in
   their own location); your crew comes with you on a job; a companion may come on a trip
   if your bond allows it.
7. **Civilian towns and cities are where you go.** They are the common destinations, on
   your own time or on a job. **Foreign hidden villages** are not places you visit for the
   day: you reach one on a mission, you defect to one once you have a name (milestone 5),
   or you **start there**, playing the core game in another village's culture.
8. **Property, not moving.** Your home stays in your village. You can **buy property** in
   a civilian city (a house of your own there, with no rent). A defector has no village
   home and **makes camp in the wild** (milestone 5).
9. **Quick travel.** A route can be taken quickly: the days pass in one go, and only a road
   event stops you. The full journey (a camp each night) stays the default.
10. **Order:** milestone 4 starts once the technique work in progress (T-series) lands; the
    rest of milestone 3 (ranks, elements, spirits) can go on alongside, since Mount Reikon
    waits on spirits anyway.

### Open questions

None left. Settled: foreign villages have no visitor's board (decision 7), you can't move
home but can buy property (8), quick travel is an option (9), and leave is strict (4).

---

## Part 3: Design

### 3.1 The map

A pack declares **routes** beside its locations:

| Field      | Meaning                                                                         |
| ---------- | ------------------------------------------------------------------------------- |
| `from, to` | Two location ids. Routes go both ways.                                          |
| `legs`     | Days, each with a `region` (so road events fit) and an optional authored beat.  |
| `danger`   | The worst foe a road event may bring (`petty` … `elite`, as `EnemyDef.danger`). |
| `cost`     | Ryo for passage (a ferry, a toll), if any.                                      |
| `needs`    | Optional: a rank, a chakra-control milestone, a world mark.                     |

`LocationDef.travel` shrinks to what is true of the place itself (its danger line goes, the
route says it). A location may say `lockedReason` while it has no places.

The original pack's map, first pass:

```
                  Mount Reikon
                       │ mountain-pass ×4  (chūnin)
 Port Shiomachi ── Tōrōgakure ── forest-track ×1 ── Kiri Ford ┈┈ dune-road ×2 ┈┈ Sakyūgakure
   coast-road ×1                                   │                         (missions only)
        └──── water-walking: across the bay ───────┘  (saves a day)
```

Kiri Ford is a new river city, the first place you can buy property, and the way to the
dunes. The road on to Sakyūgakure is open only to jobs that go there (dotted). Names are
placeholders.

The Travel tab becomes a map: an ink drawing of the region, routes as brush lines, locked
routes dotted with what opens them, and your position as a stamp. It is inline SVG like
the backdrops, drawn per pack.

### 3.2 The journey

Travelling starts a **journey run**: a `MissionRun` with no client and no pay, built from
the route's legs. Everything the run already does applies:

- Each leg passes days through `game/road.ts` (meals from your pack, camp nights, hunger,
  healing, the board catching up).
- Each leg's region draws a road event; the route's `danger` caps which can come.
- A camp stage each night (talk, watch, train, rest, cook), with whoever is along.
- The field screen shows the route stamps; there is no debrief card, only an arrival line
  and anything the road left behind (memories, marks).

**Quick travel** is offered on every route: the legs run back to back without camp scenes
(meals and nights still happen, as one line each), and the trip stops only when a road
event is drawn. After the event you carry on quickly or slow down.

What differs from a job:

- **No pay, no ledger of pay.** Events can still cost or give things (a lost pack, a found
  herb) through their effects.
- **You can turn back** at a camp: the run walks the legs done back home.
- **Arrival** sets `locationId` when the last leg ends; leaving mid-route never leaves you
  somewhere with no places.

Before you set out, the route's sheet says what you need: days, rations you have against
nights you'll camp, where you'll sleep on arrival, and any exam or lesson you'll miss
(`awayNotes` extended to trips).

### 3.3 Leave

A new small slice, `travel` (or a field on an existing one), keeps:

- `pass`: a signed pass (destination, days, the day it expires), from the sensei at a lesson.
- `leaveUsed`: days of leave taken this season (chūnin).
- `awayWithoutLeave`: set when you go anyway; read by milestone 5.

`travelBlocker` (in `game/`) reads rank, pass, leave and the route's `needs`, and gives one
reason the Travel tab can show ("Your sensei signs passes at your weekly lesson."). Jobs
need no pass; a job's route counts as orders.

### 3.4 Living away

- **Inn** (new place kind `inn`): a room by the night, paid at the desk; sleeping, resting
  and the morning routine work as at home, healing a little less than your own bed. Your
  home's rent still falls due; a long trip with unpaid rent is the existing lock-out.
- **Residents**: authored `PersonDef`s with a `homeLocationId`; `whereNow` reads their
  schedule only when you are in their location. Bonds, talk, training and teaching apply
  unchanged. Generated people stay in the start location.
- **Companions**: a person with a high enough bond (and free days) may come on a trip;
  they join camp scenes and are present at the destination as if they lived there.
- **Property**: a city may sell a house (a `home` place with a price instead of rent, bought
  once). It is a second home: sleep, rest and cook there as at your own. Your village home
  stays where it is. Later, a property may earn something (a lodger, a shop) — not in
  milestone 4.
- **Camp in the wild** (milestone 5): a defector's home is a camp they set up on a route,
  with what they carry. It is noted here so the inn and the property don't assume a home is
  always in a town.
- **Your sensei** gives the week's lesson only at home or by the fire on a job. A trip that
  spans the lesson day misses it, and the route sheet says so.

### 3.5 The reference destination: Port Shiomachi

A fishing town a day down the coast road. Safe, open to genin on a pass from the start, and
the place that proves everything above.

| Place              | Kind       | Why go                                                             |
| ------------------ | ---------- | ------------------------------------------------------------------ |
| The Gull's Rest    | `inn`      | Somewhere to sleep.                                                |
| The fish market    | `market`   | Coastal ingredients (dried fish keeps on the road; seaweed; salt). |
| The net-mender's   | `gear`     | Wire, fishhook senbon, a harpoon-style polearm (C).                |
| The breakwater     | `training` | Drills against the tide (stamina, balance); later, water-walking.  |
| The Salt Lantern   | `tavern`   | Sailors' gossip: rumours from other villages, ahead of home.       |
| The harbour office | `missions` | Civilian work for an outsider: lost cargo, a smuggler, a wreck.    |

People: a retired chūnin who teaches a water-and-wire style (a `school`, as in the
techniques plan), the harbourmaster (a client who asks for you by name), and
a fisher's child who wants to be a shinobi (memories, a follow-up).

Festival: a boat-lantern night once a year, the coast's answer to home's lantern festival.

### 3.6 The other destinations

- **Kiri Ford**: see 3.1. Its inn, market, smith and city board are open to anyone; a
  house there is for sale.
- **Sakyūgakure**: another hidden village, and not somewhere you visit. You go there on
  jobs (an escort to its gate, a message, a joint mission), when you defect to it with a
  reputation it wants, or as your **starting village**. Its places on a job are only what
  the job needs.
- **Mount Reikon**: spirits. Chūnin only, four days up a pass where the road events are
  spirit encounters. It waits on milestone 3's spirit work; its shrines are where spirit
  contracts and the spirit discipline are found.

### 3.7 Other starting villages

Starting in Sakyūgakure means the whole core game there: its own academy, sensei, genin
classmates, clans, board, festivals, exam and culture. The pack's `startLocationId` becomes
a list of **start villages**, each a complete home (validated like a pack is today); the
creation scene asks which village. This is a large content job per village and does not
block the rest of milestone 4: the plan's code steps don't assume one start village (people
and housing read the save's home village, not `content.startLocationId`).

### 3.8 Chakra control in the world

Tree-walking and water-walking are **control exercises** learned by drill and mastered as
breakthroughs (`docs/design/milestone3-plan.md`). A route or a place may need one:

- Water-walking opens the bay crossing and the breakwater's tide drill.
- Tree-walking opens a forest shortcut and a hidden training ground at home.

They are checked by `needs` like rank, so the map shows the dotted line and what opens it.

### 3.9 Arc bases

Missions plan 3.9 lands here unchanged: an `ArcAct` names a `baseLocationId`, the "go" act's
job is the journey there, the act's jobs are offered at the base's `missions` place, days at
the base pass at the inn with the crew present, and `deadlineDays` moves the story on. A
crew on an arc is your company at the base (they count as residents while the act lasts).

### 3.10 Presentation

- **The map** (3.1) replaces the Travel list. A route sheet opens from a line on the map.
- **Away from home** the village screen says so: the backdrop and sky of the place, a
  "Far from home" stamp in the header (the header already knows `visiting`), and the dock's
  Here tab shows the place you're in.
- **Coming back** is a line on the ticker and, if anything happened at home (a promotion
  posted, rent due, a rumour about you), a short "while you were away" card, read from the
  journal and the board like the debrief reads the ledger.

---

## Part 4: Build plan

Each step lands green (`npm run check`, `npm run check:release`) with tests, and with a
migration and a previous-version save test wherever the save shape changes.

1. **Routes.** `RouteDef` in content, `validateWorld` checks (both ends exist, regions have
   road events, every playable location reachable), a shortest-open-path function in
   `game/`. `LocationDef.travel` slimmed. The Travel tab reads routes (still a list).
2. **Journeys.** Travelling starts a journey run built from the route's legs; camp nights,
   road events by danger, turning back, arrival. The route sheet (rations, sleep, missed
   lesson or exam). Migration: a save away from home stays where it is.
3. **The inn and residents.** `inn` place kind with its page; sleeping abroad; residents
   with `homeLocationId`; `whereNow` by location. Fixes being stranded.
4. **Port Shiomachi.** The places, people, food, gear, training and work in 3.5, in the
   original pack. Unlocked behind no rule yet (step 5 adds it).
5. **Leave.** Passes signed at the sensei's lesson, chūnin leave, `travelBlocker`, the
   away-without-leave flag. A CLAUDE.md decision for travel and leave.
6. **Companions on trips**, the "while you were away" card, and quick travel.
7. **The map screen.** Ink map per pack, route sheet, coming-soon routes.
8. **Arc bases.** `baseLocationId`, `deadlineDays`, a first arc act at Shiomachi.
9. **Chakra-control routes.** Milestones as `needs`; the bay crossing and the forest track.
10. **Kiri Ford and property.** The river city, houses for sale, a second home.
11. **Home village in the save.** Read the home village from the save, not the pack's start,
    everywhere (people, housing, the board), so a second start village is only content.
12. **Mount Reikon**, once milestone 3's spirits exist.
13. **The fan pack** gets its own routes and at least one destination (validation requires
    every pack to stay complete).
14. **Sakyūgakure as a start village** (later; big content). Jobs that go there can come
    sooner, as ordinary journeys whose end is its gate.

---

## Part 5: What was built

1. **Routes** (this step). `systems/travel` (routes, the quickest open journey, what can be
   reached), `ContentPack.routes` for both packs, `LocationDef.travel` replaced by
   `lockedReason` alone, `validateRoutes`, Kiri Ford as a locked waypoint, and the Travel tab
   showing days, ryo, the worst of the road and the places passed. Travel still jumps; step 2
   makes it a journey.
2. **Journeys** (this step). A trip is a mission run carrying a `journey` plan (from, to, the
   legs, whether to hurry); `game/journeys.ts` builds its stages (a leg per stretch, a camp
   between them) and the run plays as on a job, arriving when the last leg is walked. Each leg
   has a line of road text in the route. **Hurry** (`travel` with `quick`) walks on without
   camping until a road event needs a choice, then carries on. The Travel tab warns of short
   rations, nowhere to sleep and an exam you'd miss. Not yet: **turning back** at a camp (left
   for step 6, with companions), and the sensei's view on a trip (step 5, leave). No save
   migration: a run without `journey` is a job as before.
3. **The inn and residents** (this step). The `inn` place kind (a keeper and a room price),
   `takeRoom` (pay at the desk, sleep till dawn at `INN_HEALTH_SHARE` of your own bed's
   healing; the night's sleep is shared with home as `sleepTillDawn`), its page (a room slip)
   and its line on the village screen. People may live elsewhere (`homeLocationId`, shinobi and
   villagers only, validated; schedules and teaching places read their home), are met only
   there, and stay off your village's crews, exam replacements and dinner invites. The Travel
   tab's "nowhere to sleep" warning counts an inn.
4. **Port Shiomachi** (this step). The first real destination, as sketched in 3.5: the Gull's
   Rest (inn), the fish market (coastal food, dried fish for the road, kelp and sea salt, and a
   broth to cook from them), the net-mender's (fishhook darts, gutting needles, an oilskin
   coat, a cork float charm that sharpens a pin), the breakwater (three drills), the Salt
   Lantern, and the harbour office's three civilian jobs. People: Nagi, a retired chūnin who
   teaches **Tidewire** (wire that binds, hauls and nets) for a bond and the drowned nets job;
   Kai the harbourmaster; Umi, a fisher's daughter who wants to be a shinobi. Festivals can now
   belong to a town (`FestivalDef.locationId`): the Night of the Boat Lanterns. Open to anyone
   until step 5 adds leave. Checked at phone width: the village's street talk and night
   sights now stay at home (a tavern counter still carries the talk).
5. **Leave** (this step). A `leave` slice (`systems/travel/leave.ts`, save v32): a genin's
   pass, signed after the sensei's weekly lesson once the sensei knows you (bond stage 1),
   good for a week and for safe roads only; a chūnin's ten days of leave a season, spent by
   the days on the road out; a jōnin is free. Going home never needs leave. The Travel tab
   shows the pass or the days left on a slip. Leaving without leave waits for milestone 5.
6. **Companions, turning back, home again** (this step). A friend (a villager, genin or
   shinobi, bond stage 2, about in the village) can be asked along from the Travel tab: they
   ride the journey as a `companion` crew (camp talk by the fire), are found at your inn,
   gain bond and a shared memory ("the road to …") at each place reached, and go home when
   you do (`people.companionId`). At a camp on a trip of your own you can **turn back**: the
   legs walked so far, reversed. Coming home after a trip (`leave.awaySince`) shows a
   **home-again** card: days away, jobs posted meanwhile, festivals missed, rent overdue.
   Save v33. Turning back has no camp to show on today's open roads (Shiomachi is one leg);
   it appears once the longer roads open.
7. **The map** (this step). Every location has a point on its pack's map (`LocationDef.map`,
   within `MAP_SIZE`, validated). The Travel tab opens on the region on paper: routes as ink
   lines (dotted while either end is locked, red where the road is deadly), places as seals,
   a red seal where you stand. Tapping a place shows only its card; "Every place" brings the
   list back. The map is drawn from data, so a pack needs only its points, not a drawing.
8. **Arc bases** (this step). An act may name a `baseLocationId`: its jobs are posted at the
   office there (validated), the arc's card says where it is based, and while the act is open
   going there is orders (no pass, no leave days). A job may end somewhere else (`endsAt`,
   validated to be walked there by its legs). The first such story is **Salt in the
   Lanterns**: a letter from the harbour; the coast road down (ending in the port); the wreck's
   drowned lantern and what Umi saw, in the port; and the light given back, then home.
   Deadlines on acts (`deadlineDays`) are left for later: nothing yet needs to hurry you.
9. **Chakra-control routes** (this step). A route may have `needs` (a rank, a world mark, or
   walking on water or trees) and a `name` to say it by (validated: real ranks and surfaces,
   marks some job leaves behind). A road whose needs you don't meet is closed: journeys go the
   long way round, the map dots it, and the destination card says what opens it and how much
   quicker it would be (`game/routeNeeds.ts`). Whether you can walk on a surface is asked in
   one place, `game/walking.ts`; until milestone 3 builds the milestones it stands in with
   chakra control (trees at grade D, water at C). The original pack has **the bay crossing**,
   Port Shiomachi to Kiri Ford across the water in a day instead of two. The forest shortcut
   is left out: on today's map the only road it could shorten is the one to Mount Reikon,
   which would draw over the pass.
10. **Kiri Ford and property** (this step). The river city opens: the Ferryman's Rest (inn),
    the Ford Market, the Ferry Office's two jobs, and a house for sale on Reed Row (a `house`
    place kind: bought outright, then a second home to sleep and nap in, with no rent; the
    village landlord's lock and rent stay with the home you rent). `housing.owned`, save v38.
    The road there has bandits, so a genin's pass doesn't cover it: it is a chūnin's trip.
11. **Home village in the save** (this step). A home says which village it is in
    (`Housing.villageId`, absent for every save so far: the pack's start village), and
    `homeVillageId` replaces the pack's start wherever the game means _your_ village: being
    home or visiting, leave, trips and the home-again card, who counts as a villager, the
    street talk, your Shinobi sheet, and where your generated classmates live. What content
    means by "the village" (a person or festival with no location) stays the pack's start.
    A second start village is now content plus a choice at creation (step 14).

Step 12 (Mount Reikon) waits on milestone 3's spirits.

13. **The fan pack's towns** (this step). Two destinations, written to the setting. The
    **Land of Waves**, under the shipping tycoon's thumb: a room at Tazuna's house (Tsunami
    keeps it), a waterfront market with more shutters than stalls, three jobs at the bridge
    site, the unfinished bridge to practise water-walking on, and the forest behind the house
    for tree-walking, where the canon learned it. Tazuna, Tsunami and Inari live there. Its
    road has the tycoon's hired men on it, so a genin gets there on a job or with a crew, not
    on a pass. **Tanzaku Town**, two days down a safe road: the gamblers' castle town, with an
    inn, a festival street, a dice bar where Okichi deals, the constables' three jobs and a
    townhouse for sale. This is where a genin with a pass goes first. The Mist, the Sand and
    Mount Myōboku stay locked. Three more towns followed, all on safe roads: **Shukuba Town**,
    the post town halfway down the highway to Tanzaku (an inn, a travellers' market, an
    outfitter and the post office's errands); **Otafuku Town**, the pleasure quarter east
    over the hills (an inn, Lantern Row, the Willow Teahouse where Kotone plays, and the
    quarter office); and **the Fire Temple** up its mountain stair (the pilgrims' hall, the
    temple kitchen, the monks' courtyard drills, the steward's favours, and Chiriku, a jōnin
    who trains anyone in the courtyard, with the novice Kei).
