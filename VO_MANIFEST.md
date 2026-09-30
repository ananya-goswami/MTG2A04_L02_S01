# VO_MANIFEST — MTG2A04_L02_S01

**55 VO clips + 1 sfx on disk · all 56 wired into the lesson** · of the 16 recorded spares, 11 stay deleted (FLN QA checklist 01: no unused assets in the build); T2's five (heading, explain, rule, demo start, child) were restored 2026-09-30 from the re-timed renders when T2 was built to the deck's page 3 - explain and rule split at their sentence pauses so each animation has its own line - and the composed `vo_t2_prompt` was deleted

Script source: `MTG2A04_L02_S01_review.pptx`, **slides 3 → 17** (Pages 1 → 14), followed verbatim except where noted as DERIVED.

Voice: `hi-IN-SwaraNeural` (edge-tts) at pitch `+0Hz`, rate `+0%` — Swara's natural register. The HI01H01_L02_S04 reference voice (F0 ~199 Hz) is NOT an edge-tts voice; pitch-shifting Swara down to that register also drags her formants down (Azure prosody pitch is not formant-preserving) and the result reads as male, so the natural voice is used instead. See VOICE_AB/ for samples. Encoded Ogg/Opus mono 48 kHz ~32 kbps at −17.5 LUFS, identical to the reference clips.



**Pacing matched to HI01H01_L02_S04 (2026-09-28):** every wired clip was re-timed from the original render — pauses inside a line pulled in to HI01's range (a 1.1-1.8s sentence gap is now ~0.36-0.46s; short pauses untouched), speaking rate matched with a pitch-preserving ×1.028, HI01's edge silence (0.28s lead / 0.36s tail), loudness −18.5 LUFS, same Opus 48 kHz mono ~32 kbps encode. Medians now equal HI01's: longest pause 0.35s (HI01 0.36), 9.9 chars/s (HI01 9.9). The voice itself is unchanged.

## Wired

| file | exists | dur | Hindi text | used at | from |
|---|:-:|--:|---|---|---|
| `vo_demo_start` | yes | 2.2s | चलिए, शुरू करते हैं। | T2 VO2 demonstrate (then एक / दो as the hand sets blocks 1-2 down) | PPT slide 5 (Page 3) VO2 Demonstrate |
| `vo_landing` | yes | 7.5s | नमस्ते दोस्त! मैं हूँ स्विफ्टी। आज हम सीखेंगे - किसी चीज की लंबाई कैसे मापते हैं। | engine: landing | PPT slide 3 (Page 1) |
| `vo_match_instr` | yes | 3.1s | हर चीज़ को उसके सही माप से मिलाइए। | P2 prompt; P3 prompt | PPT slides 13+14 (Pages 10+11) Instruction OST/VO |
| `vo_match_ok` | yes | 4.9s | शाबाश! आपने सभी चीज़ों को उनके सही माप से मिला दिया। | P2 correct; P2 reveal; P2 option 7; P3 correct | PPT slides 13+14 (Pages 10+11) all-correct VO |
| `vo_num_1` | yes | 1.0s | एक | engine: count-aloud | engine count-aloud |
| `vo_num_2` | yes | 1.1s | दो | engine: count-aloud | engine count-aloud |
| `vo_num_3` | yes | 1.1s | तीन | P2 option 3; engine: count-aloud | engine count-aloud |
| `vo_num_4` | yes | 1.0s | चार | engine: count-aloud | engine count-aloud |
| `vo_num_5` | yes | 1.0s | पाँच | G4 option 5; P2 option 5; P5 option 5; engine: count-aloud | engine count-aloud |
| `vo_num_6` | yes | 0.9s | छह | G2 option 6; G4 option 6; P4 option 6; engine: count-aloud | engine count-aloud |
| `vo_num_7` | yes | 1.1s | सात | P5 option 7; engine: count-aloud | engine count-aloud |
| `vo_num_8` | yes | 1.1s | आठ | G2 option 8; P4 option 8; engine: count-aloud | engine count-aloud |
| `vo_num_9` | yes | 1.1s | नौ | engine: count-aloud | engine count-aloud |
| `vo_p12_ask` | yes | 3.3s | अब बताइए, यह कितने ब्लॉक्स लंबा है? | P4 prompt | DERIVED - PPT slide 15 (Page 12) is titled 'Game' and carries no VO script; built from the Page 5/6/7 question pattern |
| `vo_p12_ok` | yes | 3.4s | शाबाश! यह 7 ब्लॉक्स लंबा है। | P4 correct; P4 reveal; P4 option 7 | DERIVED - PPT slide 15 (Page 12) carries no VO script; built from the Page 5/6/7 correct-feedback pattern |
| `vo_p13_measure` | yes | 2.3s | बेंच को ब्लॉक से मापिए। | P5 prompt | PPT slide 16 (Page 13) VO |
| `vo_p13_ok` | yes | 3.7s | शाबाश! बेंच की लंबाई 6 ब्लॉक्स है। | P5 correct; P5 reveal; P5 option 6 | DERIVED - PPT slide 16 (Page 13) specifies no correct-feedback line for the measurement; built from the Page 5/6/7 pattern |
| `vo_p2_ask` | yes | 4.6s | इनमें से कौन-सी टेबल ज्यादा लंबी है? उस पर टैप करिए। | T1 prompt | PPT slide 4 (Page 2) VO |
| `vo_p2_fb` | yes | 2.4s | यह टेबल ज्यादा लंबी है। | T1 try_again; T1 hint; T1 reveal | PPT slide 4 (Page 2) incorrect-feedback VO |
| `vo_p3_child` | yes | 4.8s | अब आगे आप मापिए और बताइए, टेबल कितने ब्लॉक लंबी है। | T2 child-action VO (with the ghost drag) | PPT slide 5 (Page 3) child-action VO |
| `vo_p3_done` | yes | 3.7s | शाबाश! यह टेबल 6 ब्लॉक्स लंबी है। | T2 conclude | PPT slide 5 (Page 3) completion VO |
| `vo_p3_explain_a` | yes | 4.1s | इसके लिए हम टेबल के एक छोर से मापना शुरू करेंगे। | T2 VO1 explain, part 1 (left end line pulses) | PPT slide 5 (Page 3) VO1 Explain - split from vo_p3_explain at its sentence pause |
| `vo_p3_explain_b` | yes | 3.8s | फिर एक-एक ब्लॉक रखते हुए दूसरे छोर तक जाएंगे। | T2 VO1 explain, part 2 (right end line pulses) | PPT slide 5 (Page 3) VO1 Explain - split from vo_p3_explain at its sentence pause |
| `vo_p3_head` | yes | 5.4s | यह टेबल कितनी लंबी है? चलिए, इसे ब्लॉक से मापकर देखते हैं। | T2 heading VO | PPT slide 5 (Page 3) Heading VO |
| `vo_p4_done` | yes | 3.8s | शाबाश! यह दरवाजा 9 ब्लॉक्स लंबा है। | T3 conclude | PPT slide 6 (Page 4) completion VO |
| `vo_p5_instr` | yes | 2.7s | पलंग की लंबाई ब्लॉक से मापिए। | G1 prompt | PPT slide 7 (Page 5) Instruction OST/VO |
| `vo_p5_ok` | yes | 3.7s | शाबाश! पलंग की लंबाई 8 ब्लॉक्स है। | G1 correct | PPT slide 7 (Page 5) correct-feedback VO |
| `vo_p6_ask` | yes | 3.5s | अब बताइए, अलमारी की लंबाई कितनी है? | G2 prompt | PPT slide 8 (Page 6) post-measure VO |
| `vo_p6_ok` | yes | 3.8s | शाबाश! अलमारी की लंबाई 7 ब्लॉक्स है। | G2 correct; G2 reveal; G2 option 7 | PPT slide 8 (Page 6) correct-feedback VO |
| `vo_p7_instr` | yes | 2.7s | फ्रिज की लंबाई ब्लॉक से मापिए। | G3 prompt | PPT slide 10 (Page 7) Instruction OST/VO |
| `vo_p7_ok` | yes | 3.6s | शाबाश! फ्रिज की लंबाई 6 ब्लॉक्स है। | G3 correct | PPT slide 10 (Page 7) correct-feedback VO |
| `vo_p8_ask` | yes | 4.0s | कौन-सी चटाई ज़्यादा लंबी है? उस पर टैप करिए। | G4 prompt | PPT slide 11 (Page 8) VO |
| `vo_p8_ok` | yes | 3.4s | शाबाश! यह चटाई ज़्यादा लंबी है। | G4 correct; G4 reveal; G4 option 7 | PPT slide 11 (Page 8) correct VO |
| `vo_p8_reask` | yes | 3.5s | अब बताइए, कौन-सी चटाई ज़्यादा लंबी है? | G4 try_again; G4 hint | PPT slide 11 (Page 8) wrong-attempt-1 re-ask VO |
| `vo_p9_ask` | yes | 4.0s | कौन-सी कुर्सी ज़्यादा लंबी है? उस पर टैप करिए। | P1 prompt | PPT slide 12 (Page 9) VO |
| `vo_p9_ok` | yes | 3.4s | शाबाश! यह कुर्सी ज़्यादा लंबी है। | P1 correct | PPT slide 12 (Page 9) correct VO |
| `vo_p9_reask` | yes | 3.5s | अब बताइए, कौन-सी कुर्सी ज़्यादा ऊँची है? | P1 try_again | PPT slide 12 (Page 9) wrong-attempt-1 re-ask VO |
| `vo_pt_guided` | yes | 5.7s | बहुत बढ़िया! अब हम साथ मिलकर शुरू करते हैं। चलिए, साथ में करें! | engine: guided phase gate | ENGINE FURNITURE - phase gate, not in the PPT (kept from the existing card) |
| `vo_pt_practice` | yes | 2.3s | वाह! अब आपकी बारी। | engine: practice phase gate | ENGINE FURNITURE - phase gate, not in the PPT (kept from the existing card) |
| `vo_pt_tutorial` | yes | 5.0s | ध्यान से देखिए और मेरे साथ जानिए। चलिए, शुरू करें! | engine: tutorial phase gate | ENGINE FURNITURE - phase gate, not in the PPT (kept from the existing card) |
| `vo_rule_a` | yes | 6.0s | अब ध्यान रखें! हर अगला ब्लॉक वहीं से शुरू करें, जहाँ पिछला खत्म हुआ था। | T2 VO3 rule, part 1 (the previous block's end pulses) | PPT slide 5 (Page 3) VO3 - split from vo_rule at its pauses |
| `vo_rule_b` | yes | 2.2s | बीच में जगह न छोड़ें, | T2 VO3 rule, part 2 (a block set down with a gap, boxed) | PPT slide 5 (Page 3) VO3 - split from vo_rule at its pauses |
| `vo_rule_c` | yes | 2.7s | और एक-दूसरे के ऊपर न रखें। | T2 VO3 rule, part 3 (a block set down overlapping, boxed) | PPT slide 5 (Page 3) VO3 - split from vo_rule at its pauses |
| `vo_t3_prompt` | yes | 24.8s | क्या आप बता सकते हैं, यह दरवाजा कितना लंबा है? चलिए, इसे ब्लॉक से मापकर देखते हैं।  इसके लिए हम दरवाजे के निचले छोर से मापना शुरू करेंगे और ऊपर तक जाएंगे।  अब ध्यान रखें! हर अगला ब्लॉक वहीं से शुरू करें, जहाँ पिछला खत्म हुआ था। बीच में जगह न छोड़ें, और एक-दूसरे के ऊपर न रखें।  चलिए, शुरू करते हैं। | T3 prompt | PPT slide 6 (Page 4): Heading VO + VO1 Explain + VO3 Rule + VO2 Demonstrate, spoken before the engine lays and counts the blocks |
| `vo_total_1` | yes | 1.5s | कुल एक ब्लॉक | engine: set total | engine count-aloud total |
| `vo_total_2` | yes | 1.7s | कुल दो ब्लॉक्स | engine: set total | engine count-aloud total |
| `vo_total_3` | yes | 1.8s | कुल तीन ब्लॉक्स | engine: set total | engine count-aloud total |
| `vo_total_4` | yes | 1.9s | कुल चार ब्लॉक्स | engine: set total | engine count-aloud total |
| `vo_total_5` | yes | 1.9s | कुल पाँच ब्लॉक्स | engine: set total | engine count-aloud total |
| `vo_total_6` | yes | 1.8s | कुल छह ब्लॉक्स | engine: set total | engine count-aloud total |
| `vo_total_7` | yes | 1.8s | कुल सात ब्लॉक्स | engine: set total | engine count-aloud total |
| `vo_total_8` | yes | 1.8s | कुल आठ ब्लॉक्स | engine: set total | engine count-aloud total |
| `vo_total_9` | yes | 1.7s | कुल नौ ब्लॉक्स | engine: set total | engine count-aloud total |
| `vo_try_again` | yes | 2.6s | ब्लॉक्स को एक बार फिर गिनिए। | G1 try_again; G2 try_again; G2 hint; G3 try_again; P2 try_again; P2 hint; P3 try_again; P4 try_again; P4 hint; P5 try_again; P5 hint | PPT slides 7/8/9/10 wrong-attempt-1 VO (shared) |
| `vo_well_done` | yes | 4.2s | शाबाश! आपने ब्लॉक्स से लंबाई मापना सीख लिया! | CEL prompt | PPT slide 17 (Page 14) VO |
| `sfx_celebrate` | yes | 1.5s | *(sound effect - no speech)* | CEL: celebration sting (playSfx) | FLN animation toolkit `assets/sfx_celebrate.ogg` (the file the engine already asked for; it was missing → 404) |

## Recorded but not wired — deleted

Every remaining line of the PPT script was rendered in the same voice; the clips were deleted (2026-09-29) because none is used. Re-render from the text below if one is ever wired. They are unwired because the built engine has no slot for them — see the notes column.

| file | exists | dur | Hindi text | why it is not wired |
|---|:-:|--:|---|---|
| `vo_p13_intro` | deleted | 9.5s | आज हमें कक्षा सजानी है! हर चीज़ अपनी सही जगह पर ही फिट होगी। ब्लॉक से मापिए और सही जगह चुनिए। | the classroom free-play framing of PPT slide 16 is not built; P5 is a plain COUNT_HOW_MANY |
| `vo_p13_place` | deleted | 2.2s | अब बेंच के लिए सही जगह चुनिए। | the 'choose the right space' step of PPT slide 16 is not built |
| `vo_p4_child` | deleted | 4.8s | अब आगे आप मापिए और बताइए, दरवाजे की लंबाई कितनी है। | same as `vo_p3_child` |
| `vo_p4_explain` | deleted | 5.6s | इसके लिए हम दरवाजे के निचले छोर से मापना शुरू करेंगे और ऊपर तक जाएंगे। | folded into the composed `vo_t3_prompt` |
| `vo_p4_head` | deleted | 7.7s | क्या आप बता सकते हैं, यह दरवाजा कितना लंबा है? चलिए, इसे ब्लॉक से मापकर देखते हैं। | folded into the composed `vo_t3_prompt` |
| `vo_p5_ask` | deleted | 2.9s | अब बताइए, पलंग की लंबाई कितनी है? | MAKE_SET has no post-build question step; the slide ends when the set is correct |
| `vo_p6_instr` | deleted | 2.4s | अलमारी की लंबाई ब्लॉक से मापिए। | G2 is COUNT_HOW_MANY — the blocks are pre-laid, so the 'measure it' instruction never applies; the page's question line `vo_p6_ask` is used instead |
| `vo_p6b_ask` | deleted | 2.9s | अब बताइए, तकिये की लंबाई कितनी है? | PPT slide 9 has no slide in the built lesson |
| `vo_p6b_instr` | deleted | 2.2s | तकिये की लंबाई ब्लॉक से मापिए। | PPT slide 9 (the तकिया page) has no slide in the built lesson — see the report |
| `vo_p6b_ok` | deleted | 4.1s | शाबाश! तकिये की लंबाई 3 ब्लॉक्स है। | PPT slide 9 has no slide in the built lesson |
| `vo_p7_ask` | deleted | 3.0s | अब बताइए, फ्रिज की लंबाई कितनी है? | same as `vo_p5_ask` |

## Lines not taken from the PPT

| file | exists | Hindi text | why |
|---|:-:|---|---|
| `vo_p12_ask` | yes | अब बताइए, यह कितने ब्लॉक्स लंबा है? | DERIVED - PPT slide 15 (Page 12) is titled 'Game' and carries no VO script; built from the Page 5/6/7 question pattern |
| `vo_p12_ok` | yes | शाबाश! यह 7 ब्लॉक्स लंबा है। | DERIVED - PPT slide 15 (Page 12) carries no VO script; built from the Page 5/6/7 correct-feedback pattern |
| `vo_p13_ok` | yes | शाबाश! बेंच की लंबाई 6 ब्लॉक्स है। | DERIVED - PPT slide 16 (Page 13) specifies no correct-feedback line for the measurement; built from the Page 5/6/7 pattern |
| `vo_pt_guided` | yes | बहुत बढ़िया! अब हम साथ मिलकर शुरू करते हैं। चलिए, साथ में करें! | ENGINE FURNITURE - phase gate, not in the PPT (kept from the existing card) |
| `vo_pt_practice` | yes | वाह! अब आपकी बारी। | ENGINE FURNITURE - phase gate, not in the PPT (kept from the existing card) |
| `vo_pt_tutorial` | yes | ध्यान से देखिए और मेरे साथ जानिए। चलिए, शुरू करें! | ENGINE FURNITURE - phase gate, not in the PPT (kept from the existing card) |
