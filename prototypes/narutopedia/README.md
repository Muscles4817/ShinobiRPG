# Narutopedia: canon kits for the versus fighters

One-off scripts that read Narutopedia (naruto.fandom.com) through its MediaWiki API and gave the
`naruto` fan pack's versus fighters the canon jutsu they use. What they produced lives in the
pack, ready to review and edit by hand:

- `src/content/packs/naruto/techniques/canon/wiki/`: the drafted techniques (177), a file per art.
- `src/content/packs/naruto/canonKits/kits*.ts` and `sources.ts`: who gains what (`CANON_KITS`), what each teacher
  of the world now teaches (`CANON_TEACHES`), what is shelved (`CANON_SHELVED`), and the kit kept
  by people of the world who had no arsenal (`KIT_KEPT`). `apply.ts` lays it over the pack.

The fan pack never ships, so none of this reaches a release build (`npm run check:release`).

## How it was decided

- **Canon:** a fighter uses a jutsu when the jutsu page's `users=` field names them with no
  `~anime`, `~novel`, `~game` or `~movie` mark, and the jutsu has a manga debut.
- **Kept to who the pack wrote:** a bloodline jutsu (Wood Release, Rinnegan, Mangekyō…) only for
  a fighter who already uses that bloodline in the pack; never summoning (contracts), sage arts
  (the sage ladder), tailed-beast powers, eye powers the engine models as perks, Gate steps, or a
  technique needing summons out.
- **Rank:** a versus-only fighter never grows, so a technique they hold is ranked no higher than
  their grade in its art (they can use it now). People of the world grow into their kit, so their
  techniques keep their real rank.
- **Sources:** a new technique held by a person of the world is taught by them when they teach,
  else shelved in the home village by rank. Versus-only fighters' arsenals are their own source.
- **Effects** were drafted from each page's first paragraph by five parallel agents following
  `BRIEF.md` (the verbs, the pack's power scale by rank), then reviewed; the review's corrections
  are `REVIEW` and `SAME_AS` in `compile.py`. Descriptions are written fresh, never copied (the
  wiki's text is CC BY-SA).

## Running it again

Python 3, from this folder. `out/` is ignored by git.

```bash
npx vitest run --config prototypes/narutopedia/vitest.config.ts
```

That dumps the pack to `out/roster2.json` and `out/techfull.json` (run from the repository root).
Then, in this folder:

```bash
python3 download.py && python3 match.py && python3 filter.py && python3 tasks.py
```

`out/tasks.json` holds one task per missing jutsu; split it into batches, draft each to
`out/outN.json` following `BRIEF.md`, then write the pack's files:

```bash
python3 compile.py ../..
python3 sheet.py ../../docs/research/canon-kits-review.md
```

The pack you dump already holds the kits applied here, so a second run only finds what is still
missing; `compile.py` rewrites `kits.ts` and the `wiki/` folder, so keep the first run's lists
(or empty them first) before running it on new drafts alone.

## Filling thin fighters

Narutopedia lists users only for jutsu seen used, so minor characters gained little. `fill.py`
gives every versus fighter under a target (Kage 12, jōnin 9, chūnin 6, genin 5) generic
techniques a person of the pack could have learned: shelved ones, their own clan's and those of
schools they already hold; never someone's signature (`signature.py`: a jutsu with fewer than
six named users on the wiki goes only to them); usable now; variety first (close, ranged,
defence, control, utility), then fit by art and element. `emit_fill.py` writes it as
`canonKits/fill*.ts`. Both run on a pack inventory (`out/<pack>-inv.json`), so they work for
any pack.
