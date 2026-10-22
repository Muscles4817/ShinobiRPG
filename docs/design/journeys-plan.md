# Journeys: the road as an adventure

Working document for the next pass over travel, after the world plan (`world-plan.md`) built
routes, journeys, leave and the atlas. The aim is that crossing the country feels like the
travel montage in an adventure film: the map, a line inking itself across it, days going by,
and the road stopping you when something happens. Part 1 reviews what the game has. Part 2
records what we agree. Part 3 is the design. Part 4 is the build plan. Nothing here is binding
until it is in Part 2.

---

## Part 1: The review

### What exists

- **Routes and journeys.** Locations are joined by `RouteDef`s (legs of days through regions, a
  danger, a cost, `needs`, a `trail` that bends with the land). `findJourney` walks the quickest
  open way; a trip is a mission run carrying a `JourneyPlan` (`game/journeys.ts`): a leg per
  stretch, a camp between legs, road events by region, meals from your pack, nights in camp,
  and **hurry**, which walks on until a road event needs a choice.
- **Rules around the road.** Leave and passes (`game/leave.ts`), grudges and gates
  (`game/greetings.ts`), the hunt (`game/hunt.ts`), a friend along (`game/trips.ts`), the
  home-again card.
- **The atlas.** Each pack's `atlas` (coastlines, borders, rivers, names) is drawn on the
  Travel tab in the player's map style, with roads as ink lines and places as seals.
- **Wild places, but inside towns.** `wilds` places (woods, river, marsh, desert) are places
  in a location: foraging, fishing, tracking a companion, seeking insects.
- **The field book** has pages for fish, finds, recipes, sights and foes.

### What is wrong with it

1. **The map is thin.** The original pack has five locations (Tōrōgakure, Port Shiomachi,
   Kiri Ford, Sakyūgakure, Mount Reikon); the fan pack about ten. Almost all are towns. A
   country should feel full of places, most of them small.
2. **There is nothing on the way.** A route joins two towns. Nothing sits on it to pass,
   stop at or discover, so the map has no "on the way" and no reason to take the long road.
3. **The journey has no picture.** You choose where to go on the map, and then the map is gone:
   the trip plays in the mission screen with a strip of route stamps.
4. **Road events will repeat.** About two dozen shared events cover every region of both packs,
   all of them decisions. There are no fights, finds, weather, sights or travellers on the
   road, and nothing stops the same event coming up twice in a week.
5. **Jobs walk their own roads.** A job away writes its own `leg` stages. It doesn't read the
   map, so it doesn't get the map's events, and the map doesn't show where it goes.

---

## Part 2: Decisions

All proposed until agreed.

1. **The journey is shown on the map.** A trip (yours or a job's) plays as a montage on the
   atlas: the road inks itself in, your seal walks it, the sky cycles with the days, and the
   montage stops where the story does. The map is presentation over a view model; nothing
   about passing days changes.
2. **Locations have kinds.** Hidden village, city, town, wild, landmark. The kind decides what
   a location must have (validated) and how the map marks it.
3. **Most places are small.** A country has some 8 to 15 locations, and most are wilds and
   landmarks: cheap to write, each with one reason to be there.
4. **Roads pass places.** A journey goes through the locations on its way, and each one is a
   chance to stop: a night at a town's inn instead of camp, an hour at a landmark, a day in a
   wild place.
5. **The map is found.** You start knowing your own country's towns and roads. Other places are
   learned from rumours, travellers, maps bought in towns, jobs, and by passing near them. What
   you've been to fills a field-book page.
6. **The road has variety and memory.** Road events are drawn by region, danger, season, time
   and rarity, never the same one twice close together, and come in more kinds than decisions.
   Some days are quiet, which is what makes the stops count.
7. **Jobs use the map's roads.** A job that goes somewhere names where. The map supplies its
   road, and the job's own beats are stops on it.
8. **Designed for the desk first.** The montage is laid out for a wide window first (the map
   large, the story beside it); on a phone it stacks. See the open question on platform.

### Open questions

- **Platform.** CLAUDE.md says the game is an offline-first phone PWA with desktop as a second
  arrangement. If desktop becomes the lead (a paid desktop release), that is a change to
  CLAUDE.md and the UI rules, not only to this plan. The design below works either way.
- **Does hurrying skip passing places?** Proposed: hurry walks past landmarks you've seen
  before and stops at ones you haven't.

---

## Part 3: Design

### 3.1 The montage

The journey screen is the atlas, zoomed to the road ahead, with the story over it.

- **The line.** The road inks itself in from your seal toward the destination as each leg is
  walked, following the route's `trail`. Roads still ahead are faint; the road behind stays
  inked.
- **Time.** The sky tint over the map runs dawn, day, dusk and night with each day walked (the
  same tokens the village sky uses, `data-slot`). A day counter and the date tick in a corner
  stamp.
- **Regions.** Entering a leg's region fades its name in over the map ("The Hill Road",
  "The Dune Road"), as a film puts a caption on a new place.
- **Stops.** When the run reaches a stage that needs you (a road event, a stop, a camp, a
  fight), the seal halts, the map dims slightly, and the stage's card rises from where you
  stand. Answering it carries the seal on.
- **Camp.** The map darkens to night and a small fire glows at your seal; the camp's choices
  are the card.
- **Arrival.** The destination's backdrop sweeps over the map with its name and epithet as a
  title card, then the village screen.
- **Pace.** A quiet leg plays in a second or two. Hurry plays the whole road straight through,
  stopping only for what needs a choice. A tap or a key skips the animation to the next stop.
  Under `prefers-reduced-motion` the seal steps from stop to stop without tweening.

**The view model.** `views/journeyView.ts` builds a `JourneyView` from the run: the path in
map units (each route's ends and `trail`, in walking order), the legs as fractions of the path
with their region names and days, where the seal is (the leg just walked), the day and slot,
the stops ahead that you already know about (a town where you'll sleep, a landmark you've
heard of) and the stage now waiting. The UI only animates between two views: the one before an
action and the one after. Nothing in the game reads the animation, so determinism and saves
are untouched.

**Layout.** On a desk the map is the main pane and the stage's card sits in the side pane
beside it, as the mission screen sets its panes now (`WIDE_SCENES`); the ledger and crew stay
in the panel (`JobSoFar`). On a phone the map takes the top of the screen and the card the
choice bar's place below it. The current `RouteStrip` stays as the phone's fallback when the
map has no room (a very short screen).

The atlas drawing is shared with the Travel tab (`ui/components/TravelMapCard.tsx`, `mapCurve.ts`), so a pack needs no new
art: the montage is drawn from the same `atlas`, routes and points.

### 3.2 Kinds of location

`LocationDef.kind`:

| Kind       | What it is                               | Must have (validated)                                                   |
| ---------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| `village`  | A hidden village                         | As today: a home village is complete; a foreign one is reached by jobs. |
| `city`     | A big civilian town                      | An inn, a market, a mission office, and at least three other places.    |
| `town`     | A small one: a post town, a fishing town | An inn and at least one reason to go.                                   |
| `wild`     | A forest, a marsh, a stretch of desert   | A `wilds` place; no inn (you camp); usually a foe or two of its biome.  |
| `landmark` | A waterfall, a battlefield, a ruin       | A **sight** (3.3); at most two places; no inn.                          |

The map marks each kind its own way: a seal for villages and cities, a smaller stamp for towns,
a brush mark for wilds, a small ink glyph for landmarks.

Wild and landmark locations have no inn, so arriving at one and staying means camping
(`camp` here, a night like a journey's camp, from your pack). The `wilds` places inside towns
stay as they are: a town's own woods are a walk, a wild location is a destination.

### 3.3 Passing through and stopping

`Journey.via` already lists the locations a journey passes. Each becomes a stop on the road:

- **A town or city on the way** offers the night at its inn instead of camp ("Sleep at the
  Ferryman's Rest" against "Push on and camp"): dearer, better healing, and a chance to shop.
  Stopping there doesn't end the journey.
- **A landmark on the way** offers its sight: stop an hour (a slot) or walk on. The sight is a
  short scene of its own (`LandmarkSight`: text, an optional choice with a `Tone`, a small
  reward, a field-book entry). Its first visit is the full scene; later ones are one line.
- **A wild place on the way** offers a day there: forage, fish, track, or look for what it
  holds, then carry on.

Landmarks are where the world keeps things worth finding: a teacher who lives alone, a clue for
an arc (`needsWorldMark`, a world mark the sight leaves), a scroll, a rare fish, a spirit. Their
content is small and self-contained, so the map can afford many.

### 3.4 Finding the map

A new slice, `atlas`, keeps:

- `known`: location ids you know about.
- `visited`: location ids you've stood in.

What you know:

- At creation: your home country's towns and the roads between them (the pack names them,
  `ContentPack.knownAtStart`, validated reachable).
- **Rumours** with `revealsLocationId`, at the tavern counter or in the street.
- **Maps** sold at a gear place (`mapIds`, a `MapDef` listing locations): buying one marks them
  known.
- **Travellers and road events** with a `reveal` effect.
- **Jobs**: taking a job that goes somewhere marks it known.
- **Passing near**: a location one leg off a road you walk becomes known (heard of, not seen).

On the map an unknown place isn't drawn and a road to it is drawn only as far as the place you
know at its other end. A known but unvisited place is drawn faint, with its name. The Travel tab
can't plan a journey to somewhere unknown.

**Save migration.** Every existing save gets every location known and its visited ones
visited (read from the journal's arrivals where possible, else only the home village), so no
one loses what they could already reach.

A **Places** page in the field book (`FIELD_BOOK_PAGES` gains `places`) lists every location
of the pack, its empty slots giving the hint ("somewhere on the coast road") never the name, and
rewards a full page like the others.

### 3.5 The road

Road events grow in three ways.

**Filters and rarity.** `RoadEventDef` gains optional `danger` (the least road danger it needs:
bandits never come on a petty road), `seasons`, `slots` (night events), `rarity` (common,
uncommon, rare) and `when` (a `Condition`: a world mark, a rank). The draw still hashes the
seed, day and leg, never the Rng; rarity weights it.

**Memory.** The `atlas` slice keeps the last few road events drawn (`recentRoad`, a short list).
The draw passes over those, as `tellFresh` does for speech. Once-only events (`once: true`) are
kept as seen for good.

**Kinds.** A road event is a discriminated union by `kind`:

| Kind        | What happens                                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `decision`  | As today: a scene and options with tones.                                                                               |
| `encounter` | Foes of the region's biome from the shared bestiary, capped by the road's danger, through the existing encounter stage. |
| `find`      | Something by the road (from the region's finds), or nothing if you walk past.                                           |
| `weather`   | Rain, a sandstorm, snow: lose a slot or a day, or push through at a cost in energy and health.                          |
| `sight`     | A field-book sight on the road (a comet, a heron's dance), worth a little perception, like the village's night sights.  |
| `traveller` | Someone on the road (3.6).                                                                                              |

**Quiet days.** Each leg has a chance of an event set by the road's danger and the region,
not a certainty. A quiet day is one line of the leg's text in the montage. Hurrying doesn't
change the chance, only whether a quiet camp stops you.

### 3.6 Travellers

Travellers are people of the road (`TravellerDef`): a peddler, a pilgrim, a ronin, a troupe of
players. Each has a few meetings in order, on the regions they walk, drawn as road events. A
traveller remembers you: the second meeting knows how the first went (a mark), the third may
leave a memory, teach a recipe, reveal a place or sell from their pack. They are the road's
recurring cast, so a long trip can bring an old face back.

They are written like conversations (meetings with `minMeeting`, options with tones) and live
in `content/shared/road/travellers.ts`, so both packs share them; a pack may add its own.

### 3.7 Jobs on the map

A job that goes somewhere names it: `MissionDef.goesTo` (a location id). A stage of kind `road`
(`{ kind: 'road', to: 'outbound' | 'home' }`) expands, when the run starts, into the legs of the
quickest open way there or back, with the map's road events, camps and stops, exactly as a trip
does. The job's own beats slot into the road by `at` (a leg number or `arrive`). The montage
plays for it, with the job's crew in the panel.

Authored `leg` stages stay valid, so no job has to change at once; validation warns where a job
with `endsAt` or a foreign town in its stages walks its own legs, and jobs move over as they're
touched. `endsAt` becomes "where `goesTo` leaves you" for jobs that use the map's road.

### 3.8 The original pack's map

A first pass at filling the home country, around the five locations it has. Names are
placeholders.

| Location            | Kind     | Where                            | Why go                                                        |
| ------------------- | -------- | -------------------------------- | ------------------------------------------------------------- |
| Tōrōgakure          | village  | Home                             | Everything.                                                   |
| Port Shiomachi      | town     | A day down the coast road        | As built.                                                     |
| Kiri Ford           | city     | Up the forest track              | As built.                                                     |
| The Cedar Deep      | wild     | On the forest track              | Old forest: foraging, the biome's beasts, a hermit's hut.     |
| The Drowned Shrine  | landmark | In the bay, seen from the coast  | A shrine the tide covers twice a day; water-walkers reach it. |
| Hanebashi           | town     | A post town on the way to Reikon | Inn, an outfitter for the mountain, pilgrims' gossip.         |
| Lanternfall         | landmark | On the Reikon pass               | A waterfall where the old lanterns were washed; a sight.      |
| The Salt Flats      | wild     | Between Kiri Ford and the dunes  | Desert's edge: salt, desert foes, a caravan camp.             |
| The Old Battlefield | landmark | Off the dune road                | Rusted blades and a grave field; a teacher who keeps it.      |
| Mount Reikon        | landmark | Up the pass                      | Waits on milestone 3's spirits; becomes a place of its own.   |
| Sakyūgakure         | village  | Over the dunes                   | Jobs only (world plan, decision 7).                           |

That is eleven, six of them small. The fan pack follows with its own (validation requires every
pack to have a kind on every location; it need not add new ones in the same step).

---

## Part 4: Build plan

Each step lands green (`npm run check`, `npm run check:release`) with tests, and with a save
migration and a previous-version save test wherever the save shape changes.

1. **The journey view.** `JourneyView` from a run with a `journey` plan (path, legs as
   fractions, seal, day and slot, known stops, the stage waiting), tested headless against
   the existing trips.
2. **The montage.** The journey screen on the atlas: the line, the seal, the sky, region
   captions, stops as cards over the map, camp, the arrival title card, skip and reduced
   motion. Desk layout first, then the phone's. Smoke tests, and screenshots at 390px and on a
   wide window.
3. **Kinds of location.** `LocationDef.kind` on every location in both packs, validation by
   kind, the map's marks by kind. Camping at a wild or a landmark.
4. **Stops on the way.** `via` locations as stops: the inn night, the landmark's sight
   (`LandmarkSight`), the day in a wild place. Hurry passes seen landmarks.
5. **Finding the map.** The `atlas` slice (`known`, `visited`), its migration, reveals from
   rumours, maps, jobs, events and passing near, and the map drawn by what you know.
6. **Road events, filtered and remembered.** Danger, seasons, slots, rarity and `when`;
   `recentRoad`; quiet days. More decision events for every region.
7. **New road event kinds.** Encounters from the bestiary, finds, weather, sights.
8. **Travellers.** `TravellerDef`, meetings in order, a first cast of four or five.
9. **Jobs on the map.** `goesTo`, the `road` stage and `at` beats; move the Salt in the
   Lanterns arc over as the reference.
10. **The original pack's map**, as 3.8.
11. **The Places page** of the field book, and its reward.
12. **The fan pack's map**, filled to the same density.
