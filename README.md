# MTG2A04_L02_S01 — ब्लॉक से नापें! (Measuring distances in non-standard units)

**Grade:** G2 · **LO:** MTG2A04_L02 · **Attribute:** A04 (Measurement) · **Type:** CORE

**Skill description:**
> ब्लॉक जैसी एक ही तरह की इकाई को एक कतार में, बिना जगह छोड़े रखकर, गिनकर किसी चीज़ की लंबाई नापता है।

> Code resolved via `skill_lookup.py MTG2A04_L02_S01` against the Green-Flagged Skills G2-G3 sheet — GREEN-FLAGGED, not inferred.

**Slides:** 13 · Tutorial 3 / Guided 4 / Practice 6

## Teach-then-test — gesture ledger
- **DEMO_COUNT** (autonomous teach) — the unit block is laid in one row (per_row=n) and counted aloud one at a time, concluding with the measured object's length in blocks.
- **MAKE_SET** (produce) — add unit blocks until the count matches what the named object needs (engine-capped at 5 items).
- **COUNT_HOW_MANY** (pick) — a completed row of blocks stands for a finished measurement; tap the numeral it was measured with. Distractors are ±1 (the off-by-one gap/overlap error).

## New-mechanic SPEC flagged for the dev team (not built here — KIT MODE, engine read-only)
**`MEASURE_STRIP`** — a produce module where a target object sits at one end of a horizontal track; tapping repeatedly lays one more unit copy hard-snapped against the last (so a gap/overlap is physically impossible) until the units span the target's marked end, then auto-counts the copies aloud. This is SME pathway [3] verbatim and the one true gap in the current catalog for the whole A04 Measurement domain — see the build script's docstring for the full spec, including a stretch variant rendering pathway [1] (a pre-laid row with a visible gap to spot and fix).

## Assets
- **Art — measurement kit (`assets/mk_*.webp`, 23 cuts):** cut from one supplied sheet.
  Each sprite is de-hazed (the source carried a broad translucent glow around every object),
  speck-cleaned and tight-cropped on its own alpha; the sheet's baked-in captions are excluded.
  - tables — `mk_table_plain` / `mk_table_small` / `mk_table_markers` / `mk_table_blocks6`
  - unit block, four states — `mk_block` (idle) / `mk_block_placed` / `mk_block_ghost` /
    `mk_block_glow`, plus the pre-laid `mk_blocks6_row`
  - measure markers — `mk_marker_start` / `mk_marker_end`
  - the two wrong-way figures — `mk_err_gap` / `mk_err_overlap`
  - `mk_sparkle`, `mk_badge_6`, and `mk_badge_blank` (the same plate with the baked-in
    "6 ब्लॉक्स" lifted off, so every count 1..9 this card uses can reuse one plate)
  - seven full-body Swiftie poses — `mk_sw_idle` / `explain` / `count` / `think` / `celebrate` /
    `guide` / `cheer`
  - PNG masters, the source sheet and the cutting script are kept in `_unused/kit_src/`.
- **Art — how it is wired** (`app.js` § 11b, `style.css` MEASUREMENT ART KIT):
  - measuring slides carry `.mk-on`, which lays the units **flush** (`.mk-rail`) instead of in
    bordered tiles with a 12–32px gutter — the old row drew the exact gap this skill forbids.
    `per_row` is forced to 0 there too, so a measurement is never split over two lines.
  - START/END markers bracket the measured object; a counted or placed unit swaps to its
    "placed" face and flashes `mk_block_glow`.
  - MAKE_SET parks a ghost unit hard against the last one (the anti-gap cue) and drops it once
    the row reaches the target.
  - the result lands on the badge plate with the sparkle. Both it and the wrong-way figure float
    inside `.slide-stage`, so they never steal height from the scene art above.
  - a wrong count shows the matching figure — too few units = a **gap**, too many = an
    **overlap** — which is exactly the ±1 misconception the distractors are built from.
  - the feedback card shows the full-body poses in place of the three `sw_anim_*.gif` frames.
- **Art — legacy:** `assets/obj_*.webp` (bed, door, almirah, fridge, mats, chairs, pillow)
  are unchanged and still used for the scenes the kit sheet does not cover. Emoji fallback if missing.
- **Art — landing cubes (`assets/blk_*.webp`, 9 cuts):** the cube characters cut out of the
  supplied title plate onto alpha. The blue plate is keyed on hue (background = clearly bluer than
  it is red), flood-filled from the border so nothing inside a character is punched out, then
  de-fringed against the plate colour so no blue rim survives.
  - `blk_1..5` — the row of five. They are cut apart at the body seams, so the inner three have no
    arms and a straight left edge: that is how the plate draws them (each is occluded by its
    neighbour). The landing therefore stands them **flush** (`gap:0`, `-9px` overlap = the shoe
    overhang past the seam), which restores the plate and also matches the skill itself — units in
    one row with no gaps. Only the two end cubes carry an outstretched arm, as in the source.
  - `blk_walk_1..3` — a complete, unoccluded cube in three walk-cycle poses, plus
    `blk_walk_anim.webp`, the same three as a looping animated WebP. Cut and ready, not yet placed;
    use these rather than `blk_1..5` anywhere a cube must stand **alone**, since they have no cut edge.
  - Landing motion (`style.css`, LANDING HERO): each cube walks on from the left in turn
    (`cubeWalkIn`, 0.33s apart — deck page 1's "blocks appear one by one", verified settling by
    ~1.7s), then breathes on the spot (`cubeBob`). The contact shadow is a real element
    (`.sg-ex::after`, `cubeShadow`) rather than a `drop-shadow` filter, so it flattens and spreads
    as the cube rises and falls instead of travelling with it. All three respect
    `prefers-reduced-motion`.
  - Rebuild: `cut_cubes.py` (kept with the VO build scripts). `LAYOUT = [1,1,1,5]` encodes the
    plate's arrangement and the script hard-fails if the plate changes shape.
- **Art - phase-gate peek clip** (`assets/gif/peeking.webp`): rebuilt from the two supplied
  high-resolution Swifty PNGs rather than the old 73-frame clip. One fixed pair of the supplied
  large hands stays on the ledge while her head and torso rise behind it, eliminating the old
  overlapping/two-character transition. She then talks for 6.64s, blinks twice,
  and parks on a closed-mouth smile. During talk, rows 390-499 (lower jacket, both hands, and
  ledge) are pixel-identical in every frame; only the head/upper character gets the subtle bob,
  sway, and breathing scale. The visible bottom stays anchored at `y=485`. The mouth cadence follows
  the measured studio speech rhythm, but uses clean authored open/closed beak keyframes.
  The app asset is a 500x500, 8.0s animated WebP with loop count 1; a continuously looping GIF is
  also available at `assets/swifty_peek_talk.gif`. `PG_CLIP_MS` in `app.js` is the matching
  8000ms contract. The current source art is under `_unused/UI/swifty_v2_*.png`; the mouth/blink
  feature keyframes remain `_unused/UI/swifty_peek_talk_{closed,blink}.png`.
  Rebuild: `fln-animation-toolkit/tools/make-swifty-peek-talk.py` (kit recipe 23).
- **Audio:** Hindi VO `.ogg` (Opus, aap register) — 48 clips (the 16 unwired spares moved to `../_unused_MTG2A04/`), script taken verbatim from the SME review deck, slides 3-17. Voice matched to HI01H01_L02_S04. See `VO_MANIFEST.md`. Missing audio → silent beat, lesson still plays.

## Status: 🧪 for SME review — teach arc + 2 mechanic families + new-mechanic spec flagged.

## FLN QA checklist pass (2026-09-28)
Every change is tagged `[QA nn]` (checklist section) in `app.js` / `style.css` / `index.html`.
- **Files:** `swiftpal-bridge.js` added (HI01's host bridge: Android / iOS / web), loaded before
  `app.js`. The internal signal bus is now `window.GameBus`; `window.SwiftPAL` belongs to the bridge.
- **Stability:** one reusable VO `Audio` element (was one per clip, ~150 live players by P5 —
  full playthroughs crashed the renderer there); preload players are released once cached.
- **Tutorial:** DEMO_COUNT is now tap-to-count (child taps each block to hear it); आगे unlocks
  only after all blocks + the conclusion are heard; the spoken numeral/prompt wears a white outline.
- **Scaffold:** MAKE_SET's आगे submits at any count > 0, so its wrong path (re-listen → hint →
  reveal) is live; `SW_REST` was undefined and froze the feedback popup — fixed.
- **Score:** first-try correctness over every answerable slide (`recordResult`); was mastery-only = always 0.
- **xAPI:** HI01 statement shape via `SwiftPAL.sendEvent`; one screen verb per slide; MAKE_SET sends
  `question_answered`; landing chip sends `audio_replayed`; no duplicate `hint_used`; `?dev=1` shows an
  on-screen verb log.
- **Art/type:** real button assets `btn-next-*` / `btn-continue-*` (default + deactive); Baloo 2
  SemiBold (600) embedded (instanced from the official Baloo 2 variable font, same 1.700 version and
  glyph set as the 700/800 faces); two-layer clipped nudge hand, fingertip 8px below its target,
  cut off above any button; veil blur 15.8px; landing mascot 180px, waves once.
- **Cleanup:** 16 unwired VO clips + 34 unused images moved to `../_unused_MTG2A04/`.
- **Test harness** (not shipped): automated Playwright playthrough — 0 console errors, 0 failed requests.
