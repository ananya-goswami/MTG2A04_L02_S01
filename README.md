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
- **Art — measurement kit (`assets/mk_*.webp`, 15 cuts):** cut from one supplied sheet.
  Each sprite is de-hazed (the source carried a broad translucent glow around every object),
  speck-cleaned and tight-cropped on its own alpha; the sheet's baked-in captions are excluded.
  - tables — none left from the kit: `mk_table_small` (T1) and `mk_table_plain` (T2) were removed 2026-09-30 with
    those slides' art. T1's own two tables are `obj_table_long.svg` / `obj_table_short.svg`, drawn 2026-09-30 after
    the deck's page 2 — see T1 below
  - unit block, four states — `mk_block` (idle) / `mk_block_placed` / `mk_block_ghost` /
    `mk_block_glow`
  - measure markers — `mk_marker_start` / `mk_marker_end`
  - the two wrong-way figures — `mk_err_gap` / `mk_err_overlap`
  - `mk_sparkle` and `mk_badge_blank` (the result plate with its baked-in caption lifted off,
    so every count 1..9 this card uses can reuse one plate)
  - three full-body Swiftie poses — `mk_sw_explain` / `guide` / `cheer`
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
- **Art — landing cubes (`assets/cubes_blue_row.webp`):** one strip of 10 plain glossy blue cubes (faces
  painted out), sliced per cube on the landing — see **Landing measure** below.
- **Art - phase-gate peek clip** (`assets/gif/peeking.webp`): rebuilt from the two supplied
  high-resolution Swifty PNGs rather than the old 73-frame clip. One fixed pair of the supplied
  large hands stays on the ledge while her head and torso rise behind it, eliminating the old
  overlapping/two-character transition. She then talks for 6.64s, blinks twice,
  and parks on a closed-mouth smile. During talk, rows 390-499 (lower jacket, both hands, and
  ledge) are pixel-identical in every frame; only the head/upper character gets the subtle bob,
  sway, and breathing scale. The visible bottom stays anchored at `y=485`. The mouth cadence follows
  the measured studio speech rhythm, but uses clean authored open/closed beak keyframes.
  The app asset is a 500x500, 8.0s animated WebP with loop count 1. `PG_CLIP_MS` in `app.js` is the
  matching 8000ms contract.
  Rebuild: `fln-animation-toolkit/tools/make-swifty-peek-talk.py` (kit recipe 23).
- **Audio:** Hindi VO `.ogg` (Opus, aap register) — 48 clips, all wired, script taken verbatim from the SME review deck, slides 3-17. Voice matched to HI01H01_L02_S04. See `VO_MANIFEST.md`. Missing audio → silent beat, lesson still plays.

## Status: 🧪 for SME review — teach arc + 2 mechanic families + new-mechanic spec flagged.

## FLN QA checklist pass (2026-09-28)
Every change is tagged `[QA nn]` (checklist section) in `app.js` / `style.css` / `index.html`.
- **Files:** `swiftpal-bridge.js` added (HI01's host bridge: Android / iOS / web), loaded before
  `app.js`. The internal signal bus is now `window.GameBus`; `window.SwiftPAL` belongs to the bridge.
- **Stability:** one reusable VO `Audio` element (was one per clip, ~150 live players by P5 —
  full playthroughs crashed the renderer there); preload players are released once cached.
- **T1 (2026-09-30):** its old one-table/blocks art was removed on review ("remove all the assets as shown in this
  screen": the VO asks for a two-table comparison the art did not show), then the deck's page 2 was built (review:
  "add 2 tables, 1 small and 1 big, as per the instruction"): `PICK_EXTREME` with a long and a short table
  (`assets/obj_table_long.svg` 450px / `obj_table_short.svg` 308px, vector, drawn after the deck's art). Tap the
  longer one. Correct = SFX + confetti, then on. Incorrect (deck: "pulsate / hand nudge on the long table and play
  VO: यह टेबल ज्यादा लंबी है।") = the long table pulses, the hand points at it, and `vo_p2_fb` plays — that line
  only, no re-ask (`reask:false`); the usual scaffold (hint at the 2nd wrong, reveal at the 3rd). Look (CSS
  `[T1 tables]`): the card gets a calm floor — the bottom 35%, light wood under the grid-paper wall, a skirting line
  and two faint board seams — and the tables STAND on it (feet ~60% into the floor, soft shadows), a little right of
  centre so Swifty's corner stays free; they drop in one after the other; a faint glint crosses each tabletop now
  and then; right = green glow, wrong = red glow. Like every tap-to-answer slide, आगे is hidden and a right answer
  moves on by itself.
- **T2 (2026-09-30):** its old face-cube/table art was removed on review ("in this screen also remove the table and
  yellow cubes"), then the deck's page 3 was built to its script ("add things and animation as per the instruction
  completely"): `MEASURE_DEMO` (app.js, CSS `[T2 measure]`). T1's long table, a wooden block tray, and each step on
  its own VO line — heading (`vo_p3_head`, the table + tray come in); VO1 (`vo_p3_explain_a/_b`: a pink dashed line
  at the table's left end pulses, then the right end); VO2 (`vo_demo_start`: the hand — Swiftee's — drags blocks 1
  and 2 from the tray, एक… दो…); VO3 (`vo_rule_a`: the previous block's end pulses; `vo_rule_b`: a block set down
  with a GAP, the gap boxed and pulsing, then taken back; `vo_rule_c`: one set down OVERLAPPING, boxed, taken back);
  child VO (`vo_p3_child`) with a ghost drag tray → next tile. Then the child drags blocks 3-6: a drop on the next
  tile snaps flush and is counted aloud (`vo_num_k`); anywhere else bounces back to the tray, then the ghost drag;
  idle 6s → the ghost drag. Done: "6 ब्लॉक्स" under the row + `vo_p3_done`, the empty tray fades, आगे unlocks. As on
  the first screen, the units lie in their own row a little below the table, flush, and the dashed end lines carry
  its length down to them; the blocks are the first screen's plain blue cubes. The five T2 lines were restored from
  the re-timed renders (explain and rule split at their pauses); the composed `vo_t2_prompt` was deleted.
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
- **Cleanup:** 16 unwired VO clips + 34 unused images deleted (2026-09-29), and the old thin `pencil_purple.webp` once the
  landing switched to the green pencil with a face. That art is now recoloured purple (2026-09-29) and ships as
  `pencil_purple.webp` (same 1658×283 framing; only its green turned purple, in OKLab keeping every pixel's
  lightness); `pencil_green.webp` is gone. No unused assets ship in the build.
- **Test harness** (not shipped): automated Playwright playthrough — 0 console errors, 0 failed requests.

## Swifty animation tools — `tools/swifty_anim_tools.py`
- One file with the six helper scripts that used to sit outside the game in `podc/tools/` (merged 2026-09-29, code
  unchanged; verified to give byte/pixel-identical results). Used to make and check Swifty's animation files
  (`assets/gif/*.webp`, e.g. the peeking clip); **the game never loads it.** Needs Pillow, numpy, scipy.
- `python tools/swifty_anim_tools.py inspect|audit|extract|blinks|smooth-hands|build ...` (`-h` for each): contact
  sheet · per-frame audit (PNGs, CSV, biggest changes) · extract frames · add natural blinks (67-frame GIF) · smooth
  hand outlines · build the finished peeking GIF from the 114-frame source.

## Phase gate Swifty (2026-09-30) — CSS `[peek-4]`
- Swifty on the "चलिए, शुरू करें!" gate is 1.2× bigger at every window size (300–520px → 360–624px), ledge still on
  the bottom edge. The headline is untouched (its rule still places it from her old height). Measured at 10 window
  sizes: her head, at the clip's highest frame, stays ≥ 93px below the title's ink (≈114px at 1333×714).

## Landing study-lamp light (2026-09-29) — CSS `.sg-lamp`
- The light comes only from INSIDE the shade: the bulb glow (`::before`) is clipped to the shade's lit opening, traced
  from the art, and the light on the wall (`::after`) starts below the shade — its top edge follows the shade's lower
  rim — and spreads down-left, the way the lamp points, fading out before its own edges. The old round glow also lit
  the shade's orange outside. The smooth flicker is brightness-only (a scale would push the light past the traced edges).

## Landing measure (2026-09-29) — `app.js` block `[landing measure]`, CSS `.sg-measure` / `.sgm-*`
- After the title animation, two pink dashed lines drop from the pencil's ends, then the cubes arrive one by one,
  flush, in one row just below the pencil (`assets/cubes_blue_row.webp` sliced per cube), then the play button pops.
- **Pace** (`STEP`, review 2026-09-30: "the cubes are getting placed very fast"): one cube every 400ms (was 140ms,
  when all 7 popped in within 0.84s — one sweep, not blocks placed one by one). The 7th lands ~3.3s after the lines
  start; each cube's pop, its shadow, the pencil's eyes and the play button's release follow the same `STEP`.
- **7 cubes** (was 10, then 8): the same cubes 1.43× bigger — the strip's first 7 cubes, scaled to span the pencil
  exactly (whole cubes only). With the layout shift below, their row ends ~21px above the play button.
- Layout: the title and the pencil group (pencil, cubes, lines) sit 28px higher than before (`style.css`
  `[landing layout]`: `.sg-content .sg-title{top:-38px}`, `#sgHero{top:-28px}`); the play button did not move.
- **Shadows on the table:** the cubes' bases stand on the tabletop (~27px in front of its back edge), so each casts a
  soft warm-brown contact shadow on it — darkest at the base, fading ~15px in front, shifted right with a longer
  right tail (window light from the left), behind the cubes and lines. Each shadow grows in as its cube lands; once
  the last one has landed the per-cube strips swap for one continuous shadow (no seams). CSS `.sgm-shadow*`.
- Both dashed lines end on a **complete dash**: their length is snapped to whole 19px dash periods (12px dash + 7px
  gap) minus the last gap, never shorter than 6px below the cubes.

## Landing Swifty (2026-09-29) — `assets/gif/new_landing_swiftee_anim.webp`
- The source clip (same as HI01) snaps between two different poses — waving hand and bag strap switch sides — at
  frames 1→2 (0.18s) and 29→30 (2.70s). Frames 0–1 are the clip's END pose (it was cut from a loop at the wrong
  point), so it opened with a flash of the other pose. Now it **starts at frame 2**, and the 29→30 snap has 3
  premultiplied cross-fade frames (60ms each): 37 frames, 3.24s, plays once, same final pose; WebP q90, 1.69 MB.
- **Blank frames:** measured with a frame-by-frame screen recording, Chrome painted nothing where Swifty is for 1–2
  frames in ~half the loads, right at a frame change of the big animated `<img>` (560×550, alpha) while the landing
  starts up — with the original file too (not caused by drop-shadow, will-change, the restart or the loader).
  `app.js` `[landing mascot player]` now decodes the file itself (WebCodecs `ImageDecoder`, next frame decoded
  ahead) and draws it on a canvas at the displayed size, swapped in when the loader lifts: 0 blanks in 6 runs (was
  3 in 6), same sharpness. Without `ImageDecoder` (e.g. iOS WebView), or on any error, the `<img>` path is unchanged.

## Landing title animation (2026-09-29) — `app.js` block `[landing title fx]`, CSS `[landing title fx]`
- **Start + speed (latest):** it starts on the spoken **"आज"** (आज हम सीखेंगे), 3.13s into `vo_landing.ogg` (`T_WORD`), and
  runs on one clock `SLOW = 1.5`× slower than its (tightened) durations in `app.js` — so it ENDS when the faster
  version that started on "लंबाई" did (~7.5s instead of ~5.0s; the first screen is no longer). Measured: लंबाई stretches
  on "आज हम सीखेंगे", मापना's ruler starts at 5.75s, as the voice says "कैसे मापते हैं". The per-step numbers below
  are from an earlier revision; `app.js` is the reference.
- **The pencil stretches with लंबाई** (review 2026-09-29): its nib is pulled out left by ⅔ of the word's pull
  (`PEN_K`, ~45px) on the same spring — out, hold, snap back, the same bounces — with the eraser end fixed. The word's
  own stretch is unchanged (review: "don't increase the stretch length of लंबाई"): it still ends 5px past the nib's
  rest position, so at full stretch the pencil reaches further left than the word. Only the plain barrel (image x 260..920 of 1658) lengthens; nib, face,
  band and eraser keep their shape. It is drawn on a canvas (`.sg-pen-stretch`) over the transparent real `<img>`, so the
  layout, the nib maths and the cubes' measure only ever see the pencil at rest.
- **लंबाई**: stretches over ~1s — ई's right edge fixed, ल's
  left edge drawn to the pencil nib tip, one taut top line — holds 0.3s, then springs back (0.9 Hz) onto a hard stop
  (the letters touch at rest, so they never overlap) with 30% rebounds; at each impact the top line buckles into a
  damped wave and the letters' upper parts bend with it. The STRETCH is drawn from the font outlines too (not the
  text copies), so when ब and ा separate each half keeps its own round outline and shadow — the text copies split
  "बा" with a straight vertical clip that left hard vertical edges in the gap (review 2026-09-29). (While it curls the whole word, line included, is drawn from
  the font outlines with every point bent the same way, and the straight copy underneath is faded out). The first impact
  also gives the line a permanent set, like an over-stretched spring: it settles into a held wave (dip first — 3 dips,
  2 humps, height 4% of the word ≈ 6px) and STAYS wavy while मापना's ruler forms and the heading glides to the centre;
  it then straightens TOGETHER with मापना's reversal (same start, same end), and the real CSS heading comes back.
- **मापना** (starts once लंबाई has settled into its wave — one after the other): goes grey while its letters
  move apart (16px each), then its ruler top line forms one letter at a time — मा, प, ना, each letter uncovered in orange
  behind the line's tip — with a start mark plus one mark after each letter (4 in all): as heavy as the line, sticking
  out as little as possible (~4.5px incl. the rounded end), equally above and below, with the same white outline as the
  line. The heading then glides back to the centre (0.6s), the finished ruler shows for 0.6s, and both words reverse
  together (~0.8s): लंबाई's wave straightens while मापना's marks pull back into the line and its letters slide back
  together — the heading stays centred,
  and the two words also move a little closer to each other (word-spacing 28px → 14px, each word half the way). The
  plain heading returns with that closer gap (set inline on `#sgTitle`; the animation copies are then rebuilt).
  A replay of the greeting plays both words again; with reduced motion मापना stays as it is.
- Both words' top lines are the same thickness (the letters' own top line); a wider gap separates the two words.
- At rest the heading is the real text; the moving copies are the same text in the same style, so swaps are invisible.
  Word timings come from edge-tts word boundaries of the same line, mapped through the VO re-time.

## Pencil eyes (2026-09-30) — `app.js` block `[pencil eyes]`, CSS `.sg-pen-eyes`, `assets/pencil_face_rig.webp`
- The landing pencil watches what happens on screen. Its eyes are drawn live on a small canvas over its face (the
  face never moves during the pencil stretch). Per eye, clipped to the painted eyeball: white, an iris ~13% smaller
  than the painted one (so the look direction reads at 480px), a pupil that widens and narrows, two shines, and
  eyelids in the barrel's own purple with a lash line. The brows are cut from the art — `pencil_face_rig.webp` holds
  the barrel with the brows removed plus each brow (11 KB) — and lift and tilt. The face is painted a quarter turn
  round (its "up" is the eraser), so the upper lids close from the right and the lower lids rise from the left.
- **What it looks at** (`SGEyes.look(id, element | {x,y} | fn, priority, ms)`, highest priority wins): Swifty while she
  greets; लंबाई's end as it stretches and bounces; the tip of मापना's ruler as it forms; the left then the right dashed
  line; each cube as it lands; then the play button. With nothing going on it wanders between the child (straight
  out), Swifty and the play button. A finger or mouse on the landing is looked at for a moment.
- **How it moves:** like real eyes — a fast jump (50–170ms) to each new target, smooth following of moving things with
  catch-up jumps, tiny drifts while it rests, a blink every 2–5s (sometimes a double blink, often with a big jump).
- **Expressions** (`SGEyes.react`): surprise when लंबाई starts to stretch (eyes grow, pupils narrow, brows up); a
  squeeze-shut wince at the snap-back's hard stop; curious (one brow up) as मापना starts and when the play button
  appears; happy "^^" once the last cube lands.
- Reduced motion: the eyes look at the child and only blink. Any error removes the canvas, leaving the painted eyes.
  Layout reads are cached (80–500ms) so the eyes never force a re-layout every frame.

## Phase-gate headline size (2026-09-30) — CSS `[07]` `.pg-title`
- "चलिए, शुरू करें!" / "चलिए, साथ में करें!" / "अब आपकी बारी!" are drawn as HI01H01_L02_S04 draws them: 96px, 271px from
  the top, 10px white stroke, centred on the screen. The earlier QA scaling (`min(96px, 7.4vw, 11vh)`) shrank it on
  ordinary laptop windows (77px at 1445×704). It now shrinks only where 96px cannot fit — narrower than the longest
  line (687px) plus 24px a side, or so short it would reach Swifty — and then moves up to stay 16px above her.
  Checked: 96px/271px at 1445×704, 1280×720 and 1920×1080; 96px at 1024×600 (raised to 188px); 50px on a phone
  sideways, 47.5px upright; always equally far from both sides.

## Next button (2026-09-30) — `assets/btn-next-{default,deactive}.svg`, CSS `[10]`
- Review: "remove the word आगे, keep only the arrow in the middle; the 1st screen's button style, but keep this button's
  structure - more width, not a circle". The same 170×62 pill (so no slide layout moves), drawn in the play button's
  construction (`btn-play-blob.svg`): a darker depth edge under a white rim, a shaded gold face with a light crescent
  along the top and a shade crescent along the bottom, two shine dots, and the symbol with a dark navy edge. The label
  is the arrow alone — the label's own Baloo 2 "→", 2.3× (~41×27px), centred. Deactive = the play button's grey
  "waiting" set. Shadows are the play button's navy-tinted ones. The button keeps "आगे" as its accessible name.
