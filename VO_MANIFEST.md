# VO manifest — MTG2A04_L02_S01 · लंबाई मापना (ब्लॉक से नापें!)

Every voiceover the game plays, in the order a child meets it: the exact line, its file in `assets/voiceover/`, when it
plays and where it comes from.

**Generated from the updated deck** `MTG2A04_L02_S01_review.pptx` (the copy in this folder, received 2026-10-09; slides
3–17 = pages 1–14) and checked on 2026-10-09 against the game: its line list in index.html, and all 51 sentence clips,
transcribed with faster-whisper. The deck's block counts are now the game's own on every screen, so every line keeps the
game's numbers: table 9, door 7, bed 12, almirah 7, pillow 5, fridge 7; mats 8 / 9; chairs 6 / 7; P2 7 / 5 / 3; P3 window 5,
bottle 4, TV 6; classroom 6 / 9 / 11 / 7.

- **46 clips say the deck's line.** 44 match it character for character; 2 are a deck sentence cut into two clips at its
  own break.
- **2 clips need re-recording**: the classroom's almirah pair. The new deck calls it अलमारी, but the clips still say
  छोटी अलमारी, the 24 Sep deck's name (see P4).
- **3 clips are not in the deck**: the transition cards between the phases.
- **The 12 counting clips (एक … बारह) are the deck's counting VO**, which for the bed now runs to बारह in the deck itself.
  These single words are too short to transcribe reliably. एक … नौ are the original 28 Sep renders; दस, ग्यारह and बारह
  were rendered 2026-10-08 in the same voice and loudness.

What changed since the 24 Sep deck:

- The five praise lines with a count (table, door, bed, pillow, fridge) now carry the game's counts, so the clips are the
  deck's lines exactly.
- The classroom page now writes out all four objects' two lines; before, only the bench's were written.
- The classroom page now has each object "repeat the same process" and drops "game continues without any VO". The game
  still speaks for the first object only (see P4).

**64 files: 63 voiceover clips + 1 sound effect.** Every file is used, and every line the game asks for has its file.

Source column — **PPT, exact**: the deck's line as written. **PPT, exact words (split point)**: the deck's sentence cut into two clips at its
own break. **PPT counting**: the deck's "एक… दो… तीन…" counting, one clip per number. **Not in the PPT**: the transition
cards between the phases. **Re-record**: the deck's line; the clip does not say it yet.

## Title screen — PPT page 1 (slide 3)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_landing` | नमस्ते दोस्त! मैं हूँ स्विफ्टी। आज हम सीखेंगे - किसी चीज की लंबाई कैसे मापते हैं। | As the loader lifts. If the browser blocks sound until a tap, the play button shows at once; its tap starts this line and the game then continues by itself | 7.5s | PPT, exact |

## Transition into the tutorial (after the play button)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_pt_tutorial` | चलिए, शुरू करते हैं! | The transition card; the pink headline is written on as it is said | 2.3s | Not in the PPT |

## T1 — which table is longer? — PPT page 2 (slide 4)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p2_ask` | इनमें से कौन-सी टेबल ज्यादा लंबी है? उस पर टैप करिए। | On entry | 4.6s | PPT, exact |
| `vo_p2_fb` | यह टेबल ज्यादा लंबी है। | Every wrong tap (the long table pulses, the hand taps it); also if the answer is shown after a 3rd wrong tap | 2.4s | PPT, exact |

Correct answer: **the sound effect only, no voiceover** (the deck: "Correct Response: SFX").

## T2 — measuring the table — PPT page 3 (slide 5)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p3_head` | यह टेबल कितनी लंबी है? चलिए, इसे ब्लॉक से मापकर देखते हैं। | On entry (the heading VO) | 5.4s | PPT, exact |
| `vo_p3_explain_a` | इसके लिए हम टेबल के एक छोर से मापना शुरू करेंगे। | VO1: the start line pulses | 4.1s | PPT, exact |
| `vo_p3_explain_b` | फिर एक-एक ब्लॉक रखते हुए दूसरे छोर तक जाएंगे। | VO1: the end line pulses | 3.8s | PPT, exact |
| `vo_demo_start` | चलिए, शुरू करते हैं। | VO2: before Swiftee drags blocks 1 and 2 | 2.2s | PPT, exact words (split point) — the deck's "चलिए, शुरू करते हैं—एक... दो...।" |
| `vo_num_1` `vo_num_2` | एक · दो | VO2: as Swiftee lays blocks 1 and 2 | ~1.0s each | PPT counting |
| `vo_rule_a` | अब ध्यान रखें! हर अगला ब्लॉक वहीं से शुरू करें, जहाँ पिछला खत्म हुआ था। | VO3: the end of the last block pulses | 6.0s | PPT, exact |
| `vo_rule_b` | बीच में जगह न छोड़ें, | VO3: a block is set down with a gap | 2.2s | PPT, exact words (split point) |
| `vo_rule_c` | और एक-दूसरे के ऊपर न रखें। | VO3: a block is set down overlapping | 2.7s | PPT, exact |
| `vo_p3_child` | अब आगे आप मापिए और बताइए, टेबल कितने ब्लॉक लंबी है। | The child-action VO: the child's turn starts | 4.8s | PPT, exact |
| `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` `vo_num_8` `vo_num_9` | तीन · चार · पाँच · छह · सात · आठ · नौ | Each block the child lays, counted aloud (blocks 3–9) | ~1.0s each | PPT counting |
| `vo_p3_done` | शाबाश! यह टेबल 9 ब्लॉक्स लंबी है। | On completion; the "9 ब्लॉक्स" badge pops on the number | 4.1s | PPT, exact |

A wrong drop (gap / overlap) bounces back and the ghost drag shows — no voiceover.

## T3 — measuring the door — PPT page 4 (slide 6)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p4_head` | क्या आप बता सकते हैं, यह दरवाजा कितना लंबा है? चलिए, इसे ब्लॉक से मापकर देखते हैं। | On entry (the heading VO) | 7.2s | PPT, exact |
| `vo_p4_explain_a` | इसके लिए हम दरवाजे के निचले छोर से मापना शुरू करेंगे | VO1: the start line pulses | 4.6s | PPT, exact |
| `vo_p4_explain_b` | और ऊपर तक जाएंगे। | VO1: the end line pulses | 1.9s | PPT, exact |
| `vo_demo_start` | चलिए, शुरू करते हैं। | VO2: before Swiftee drags blocks 1 and 2 | 2.2s | PPT, exact words (split point) — the deck's "चलिए, शुरू करते हैं—एक... दो...।" |
| `vo_num_1` `vo_num_2` | एक · दो | VO2: as Swiftee lays blocks 1 and 2 | ~1.0s each | PPT counting |
| `vo_rule_a` | अब ध्यान रखें! हर अगला ब्लॉक वहीं से शुरू करें, जहाँ पिछला खत्म हुआ था। | VO3: the end of the last block pulses | 6.0s | PPT, exact |
| `vo_rule_b` | बीच में जगह न छोड़ें, | VO3: a block is set down with a gap | 2.2s | PPT, exact words (split point) |
| `vo_rule_c` | और एक-दूसरे के ऊपर न रखें। | VO3: a block is set down overlapping | 2.7s | PPT, exact |
| `vo_p4_child` | अब आगे आप मापिए और बताइए, दरवाजे की लंबाई कितनी है। | The child-action VO: the child's turn starts | 5.1s | PPT, exact |
| `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` | तीन · चार · पाँच · छह · सात | Each block the child lays, counted aloud (blocks 3–7) | ~1.0s each | PPT counting |
| `vo_p4_done` | शाबाश! यह दरवाजा 7 ब्लॉक्स लंबा है। | On completion; on the number, the "7 ब्लॉक्स" box comes out onto the wall beside the door | 4.4s | PPT, exact |

A wrong drop (gap / overlap) bounces back and the ghost drag shows — no voiceover.

## Transition into the guided phase

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_pt_guided` | चलिए, साथ में करें! | The transition card | 2.3s | Not in the PPT |

## G1 — measure the bed (पलंग) — PPT page 5 (slide 7)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p5_instr` | पलंग की लंबाई ब्लॉक से मापिए। | On entry (the VO is the instruction OST) | 2.7s | PPT, exact |
| `vo_p5_ask` | अब बताइए, पलंग की लंबाई कितनी है? | After the last block is laid (the OST becomes the question) | 3.3s | PPT, exact |
| `vo_p5_ok` | शाबाश! पलंग की लंबाई 12 ब्लॉक्स है। | Correct answer (with the SFX and confetti) | 4.1s | PPT, exact |
| `vo_try_again` | ब्लॉक्स को एक बार फिर गिनिए। | Wrong answer 1: the option wiggles, the laid blocks glow | 2.6s | PPT, exact |
| `vo_num_1` `vo_num_2` `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` `vo_num_8` `vo_num_9` `vo_num_10` `vo_num_11` `vo_num_12` | एक … बारह | Wrong answer 2: each block lights up in turn as it is counted | ~1.0s each | PPT counting |

Wrong answer 3: counting digits below each block, then the hand on the right option — no voiceover. A block laid with a gap / overlap goes back — no voiceover.

## G2 — measure the almirah (अलमारी) — PPT page 6 (slide 8)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p6_instr` | अलमारी की लंबाई ब्लॉक से मापिए। | On entry (the VO is the instruction OST) | 2.9s | PPT, exact |
| `vo_p6_ask` | अब बताइए, अलमारी की लंबाई कितनी है? | After the last block is laid (the OST becomes the question) | 3.5s | PPT, exact |
| `vo_p6_ok` | शाबाश! अलमारी की लंबाई 7 ब्लॉक्स है। | Correct answer (with the SFX and confetti) | 3.8s | PPT, exact |
| `vo_try_again` | ब्लॉक्स को एक बार फिर गिनिए। | Wrong answer 1: the option wiggles, the laid blocks glow | 2.6s | PPT, exact |
| `vo_num_1` `vo_num_2` `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` | एक … सात | Wrong answer 2: each block lights up in turn as it is counted | ~1.0s each | PPT counting |

Wrong answer 3: counting digits beside each block, then the hand on the right option — no voiceover. A block laid with a gap / overlap goes back — no voiceover.

## G2b — measure the pillow (तकिया) — PPT page 6 (slide 9)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p6b_instr` | तकिये की लंबाई ब्लॉक से मापिए। | On entry (the VO is the instruction OST) | 2.7s | PPT, exact |
| `vo_p6b_ask` | अब बताइए, तकिये की लंबाई कितनी है? | After the last block is laid (the OST becomes the question) | 3.3s | PPT, exact |
| `vo_p6b_ok` | शाबाश! तकिये की लंबाई 5 ब्लॉक्स है। | Correct answer (with the SFX and confetti) | 4.2s | PPT, exact |
| `vo_try_again` | ब्लॉक्स को एक बार फिर गिनिए। | Wrong answer 1: the option wiggles, the laid blocks glow | 2.6s | PPT, exact |
| `vo_num_1` `vo_num_2` `vo_num_3` `vo_num_4` `vo_num_5` | एक … पाँच | Wrong answer 2: each block lights up in turn as it is counted | ~1.0s each | PPT counting |

Wrong answer 3: counting digits below each block, then the hand on the right option — no voiceover. A block laid with a gap / overlap goes back — no voiceover.

## G3 — measure the fridge (फ्रिज) — PPT page 7 (slide 10)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p7_instr` | फ्रिज की लंबाई ब्लॉक से मापिए। | On entry (the VO is the instruction OST) | 2.7s | PPT, exact |
| `vo_p7_ask` | अब बताइए, फ्रिज की लंबाई कितनी है? | After the last block is laid (the OST becomes the question) | 3.3s | PPT, exact |
| `vo_p7_ok` | शाबाश! फ्रिज की लंबाई 7 ब्लॉक्स है। | Correct answer (with the SFX and confetti) | 4.2s | PPT, exact |
| `vo_try_again` | ब्लॉक्स को एक बार फिर गिनिए। | Wrong answer 1: the option wiggles, the laid blocks glow | 2.6s | PPT, exact |
| `vo_num_1` `vo_num_2` `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` | एक … सात | Wrong answer 2: each block lights up in turn as it is counted | ~1.0s each | PPT counting |

Wrong answer 3: counting digits beside each block, then the hand on the right option — no voiceover. A block laid with a gap / overlap goes back — no voiceover.

## G4 — which mat is longer? — PPT page 8 (slide 11)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p8_ask` | कौन-सी चटाई ज़्यादा लंबी है? उस पर टैप करिए। | On entry | 4.0s | PPT, exact |
| `vo_p8_ok` | शाबाश! यह चटाई ज़्यादा लंबी है। | Correct on the first tap, or after the counting (after the hand nudge: the SFX only, as the deck says) | 3.4s | PPT, exact |
| `vo_num_1` `vo_num_2` `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` `vo_num_8` `vo_num_9` | एक … आठ, then एक … नौ | Wrong 1: both mats' blocks counted one by one, digits below | ~1.0s each | PPT counting |
| `vo_p8_reask` | अब बताइए, कौन-सी चटाई ज़्यादा लंबी है? | Wrong 1: after the counting, only the question again | 3.5s | PPT, exact |

Wrong 2: the hand on the longer mat — no voiceover.

## Transition into practice

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_pt_practice` | अब आपकी बारी! | The transition card | 1.7s | Not in the PPT |

## P1 — which chair is taller? — PPT page 9 (slide 12)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p9_ask` | कौन-सी कुर्सी ज़्यादा लंबी है? उस पर टैप करिए। | On entry | 4.0s | PPT, exact |
| `vo_p9_ok` | शाबाश! यह कुर्सी ज़्यादा लंबी है। | Correct answer — also when the child taps the right chair after the hand nudge | 3.4s | PPT, exact |
| `vo_num_1` `vo_num_2` `vo_num_3` `vo_num_4` `vo_num_5` `vo_num_6` `vo_num_7` | एक … छह, then एक … सात | Wrong 1: both chairs' blocks counted one by one, digits beside | ~1.0s each | PPT counting |
| `vo_p9_reask` | अब बताइए, कौन-सी कुर्सी ज़्यादा ऊँची है? | Wrong 1: after the counting, only the question again (the deck says ऊँची here) | 3.5s | PPT, exact |

Wrong 2: the hand on the taller chair — no voiceover.

## P2 and P3 — match each object to its measure — PPT pages 10 and 11 (slides 13, 14)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_match_instr` | हर चीज़ को उसके सही माप से मिलाइए। | On entry (both screens) | 3.1s | PPT, exact |
| `vo_match_ok` | शाबाश! आपने सभी चीज़ों को उनके सही माप से मिला दिया। | When all three are matched (both screens) | 4.9s | PPT, exact |

A right pair: the connection locks + a positive SFX — no voiceover. Wrong 1: the line bounces back; wrong 2: that object's blocks light up with digits 1, 2, 3… (shown, not said); wrong 3: the hand on the right box — no voiceover.

## P4 — the classroom — PPT pages 12–13 (slides 15, 16)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_p13_intro` | आज हमें कक्षा सजानी है! हर चीज़ अपनी सही जगह पर ही फिट होगी। ब्लॉक से मापिए और सही जगह चुनिए। | On entry | 8.3s | PPT, exact |
| `vo_p13_measure` | बेंच को ब्लॉक से मापिए। | VO1: the bench is picked and enlarged for measuring | 2.3s | PPT, exact |
| `vo_p13_place` | अब बेंच के लिए सही जगह चुनिए। | VO2: the bench is measured and the classroom comes back | 2.7s | PPT, exact |
| `vo_p13_measure_almirah` | अलमारी को ब्लॉक से मापिए। | VO1: the almirah is picked and enlarged for measuring | 2.9s (current clip) | **Re-record** — PPT, exact; the clip says "छोटी अलमारी को ब्लॉक से मापिए।" |
| `vo_p13_place_almirah` | अब अलमारी के लिए सही जगह चुनिए। | VO2: the almirah is measured and the classroom comes back | 3.4s (current clip) | **Re-record** — PPT, exact; the clip says "अब छोटी अलमारी के लिए सही जगह चुनिए।" |
| `vo_p13_measure_chair` | कुर्सी को ब्लॉक से मापिए। | VO1: the chair is picked and enlarged for measuring | 2.3s | PPT, exact |
| `vo_p13_place_chair` | अब कुर्सी के लिए सही जगह चुनिए। | VO2: the chair is measured and the classroom comes back | 2.8s | PPT, exact |
| `vo_p13_measure_board` | ब्लैकबोर्ड को ब्लॉक से मापिए। | VO1: the blackboard is picked and enlarged for measuring | 2.6s | PPT, exact |
| `vo_p13_place_board` | अब ब्लैकबोर्ड के लिए सही जगह चुनिए। | VO2: the blackboard is measured and the classroom comes back | 3.0s | PPT, exact |

**Where the game differs from the new deck:** only the first object picked speaks. The new deck gives each object its own
VO1 and VO2, has the child "repeat the same process" for each, and no longer says "game continues without any VO". The game
still follows the 24 Sep deck: the first object picked (any of the four) speaks its two lines, and the other three are
silent. To follow the new deck, every object would speak its pair; all eight clips already exist.

Blocks: bench 11, almirah 7, chair 6, blackboard 9. These are the deck's four spaces, 6 / 9 / 11 / 7, written inside the
spaces with no blocks shown, as the deck says. A right fit plays the correct SFX only. A wrong space shakes, and the object
goes back to its box in the tray, with no voiceover and no hints. When all four are in, the confetti plays with its SFX and
the finished room holds for a moment (the deck's "Game Completion").

## End screen — PPT page 14 (slide 17)

| Clip | Line | When it plays | Length | Source |
|---|---|---|---|---|
| `vo_well_done` | शाबाश! आपने ब्लॉक्स से लंबाई मापना सीख लिया! | On the end screen (no text on screen) | 4.2s | PPT, exact |
| `sfx_celebrate` | *(sound effect, no speech)* | The end screen's celebration | 1.5s | — |

## The counting clips

| Clip | Line | Length |
|---|---|---|
| `vo_num_1` | एक | 1.0s |
| `vo_num_2` | दो | 1.1s |
| `vo_num_3` | तीन | 1.1s |
| `vo_num_4` | चार | 1.0s |
| `vo_num_5` | पाँच | 1.0s |
| `vo_num_6` | छह | 0.9s |
| `vo_num_7` | सात | 1.1s |
| `vo_num_8` | आठ | 1.1s |
| `vo_num_9` | नौ | 1.1s |
| `vo_num_10` | दस | 1.2s |
| `vo_num_11` | ग्यारह | 1.2s |
| `vo_num_12` | बारह | 1.2s |

`vo_num_10` … `vo_num_12` (दस, ग्यारह, बारह) are for the bed's 12 blocks (G1, wrong answer 2).

In the hints that count block by block the numbers are said on a 600ms beat, each clip started 0.22s in (past its silent
lead-in, so the word lands on the beat). Each word starts ~0.28s into its clip and lasts 0.26–0.49s; a re-recorded number
must keep its word under ~0.5s, or the next number cuts its end.

## How the clips are made

Voice: `hi-IN-SwaraNeural` (edge-tts), rate +0%, pitch +0Hz. Finish: pauses inside a line pulled in to ~0.4s, sped up ×1.028
(pitch kept), 0.28s of silence before and 0.36s after, −18.5 LUFS, Ogg/Opus 48 kHz mono 32 kbps. To render a line in the same
voice and finish: `MTG2A01_L03_S02/tools/build_vo.py` (pointed at this folder; a target of −17.9 lands at −18.5 here). After any
clip is added, removed or re-encoded, run `node tools/gen_asset_sizes.js` or it is not preloaded.

## Clips removed (git has them)

FLN hint-sheet lines no screen uses since every screen follows its PPT page: `vo_hint_mcq2_1`, `vo_hint_mcq2_2`, `vo_hint_mcq3_1`,
`vo_hint_count`, `vo_hint_compare`, `vo_hint_tap`, `vo_hint_drag`, `vo_hint_dd_1`, `vo_hint_dd_2`, `vo_ok_dd`, `vo_ok_mcq2`.

