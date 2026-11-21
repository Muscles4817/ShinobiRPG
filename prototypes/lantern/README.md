# Lantern techniques: more techniques for the original pack

One-off scripts that gave the `original` pack 140 new techniques and widened its people's kits.
What they produced lives in the pack, ready to review and edit by hand
(`docs/research/lantern-techniques.md` lists it all):

- `src/content/packs/original/techniques/lantern/`: the techniques, a file per art.
- `src/content/packs/original/kits/sources.ts`: where each is learned (`LANTERN_SHELVED`: academy
  E–D, the archive C–A; `LANTERN_TEACHES`: clan and school techniques, taught by a teacher of
  that clan or school).
- `src/content/packs/original/kits/fill*.ts`: techniques added to thin fighters (`FILL_KITS`),
  written by `prototypes/narutopedia/fill.py` and `emit_fill.py` run on the original pack.
- `kits/apply.ts` lays both over the pack through `src/content/kitAdditions.ts`.

## How it was decided

- **Inspired, never copied.** Five agents drafted techniques following `LANTERN_BRIEF.md`: what
  the fan pack's canon kits do (effect shapes, not names), recast for Tōrōgakure's clans,
  schools and lantern-lit streets, plus new ideas of the setting's own. No fan name may appear
  (`np/fan-names.json` is checked, and `npm run check:release` checks the build).
- **The pack's rules.** Hive clan techniques spend insects, ash clan ones dust, kenjutsu needs a
  blade, elemental B and up their nature, and every S is once a fight with a price after it
  (`lantern_compile.py` enforces these; `REVIEW` in it holds the hand corrections).

## Running it again

From the scratch folder holding the drafts (`np/lantern*.json`), the pack's inventory
(`original-inv.json`: techniques with their source, and the roster with grades and kits) and
`np/fan-names.json`:

```bash
python3 lantern_compile.py /path/to/repo
```

```bash
python3 lantern_sheet.py np/lantern-compiled.json original-inv.json fill.json docs/research/lantern-techniques.md
```

`lantern_compile.py` rewrites the `lantern/` folder and `sources.ts`, so keep the first run's
drafts with any new ones.
