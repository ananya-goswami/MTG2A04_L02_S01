const CARD = JSON.parse(document.getElementById('cardData').textContent);
  const AUDIO_EXT = (CARD.assets && CARD.assets.audio_ext) || "mp3";  // .mp3 (maths) / .ogg (Hindi FLN)
  const IMG_EXT   = (CARD.assets && CARD.assets.img_ext)   || "png";  // .png (working) / .webp (delivered/FLN) — twin of AUDIO_EXT (fixes A3)
  const ENGINE_VERSION = "2026.07.16i-r4-unified";  // ENGINE STAMP — the receipt (verify_bundle.py) asserts a built game carries THIS exact string; a stale/divergent engine → hard FAIL, so the wrong engine can never silently ship. BUMP IN LOCKSTEP with engine_guard.py + swiftpal_build.py + unified_build.py + verify_bundle.py on EVERY engine change (r2: drag/pattern feedback standard + PHASE_TRANSITION; r3c: off-white toybox bg, dual-coded counting options numeral+hand, full-body landing mascot, true-corner square/rect; r3d: Swiftie mouth-stops-when-silent (still frame), Arabic display numerals 1/2/3, landing shows full 1..n hand row, volume-chip aligned in header pill); r4: additive number-sequence path modules MEET_SEQUENCE + SEQUENCE_COMPLETE + SEQUENCE_NEXT (MTKGA01_L02_S04 "completes a number sequence within 20") — purely additive, existing lessons untouched. r4-landing (16c): landing recomposed to match reference — small corner mascot (230px, was 300), content re-centered (dropped padding-left:300 right-shift hack), VO chip moved from top-right to the mascot's shoulder (left:150/bottom:34, 58px). CSS-only; supersedes the 16b right-shift overlap fix.; 16d: TRUNK MERGE — unified the two diverged engine lines at base 12d: the 15e mechanics trunk (CONSERVE_COUNT + COUNT_ACTION + COUNT_DRAG_MATCH + ORDER_BY_WEIGHT + PICK_SET_BY_NUMBER, per_row/dense count-set grouping, bigNumCell numeral-only test options, title_first landing order) + the 16c r4 design trunk (boot loader, peek phase-transition, concept-strip landing, DS header, flat CTAs, sunburst/star-burst celebration, recomposed corner-mascot landing). Nothing dropped from either line. 16e: landing count-hero hand sizing FIXED — the .sg-hero sizing selectors never matched (template uses .sg-art); hands rendered natural-size, overflowing the card (title pushed outside the box, numeral-1 hidden behind the mascot — user-visible on MTKGA01_L02_S01). Retargeted to .sg-art .sg-hand/.sg-hand-cell/.sg-hand-num (112px; image-hero landings untouched). CSS-only. 16f: INTRO strip fit-or-wrap — old sizing assumed 1220px + a -100px breakout and punched wide strips (10 numerals, 7+ letters) through the tut-frame borders; now sized to the frame (960) and wrapping into two balanced rows below the 110px touch floor. Fixes MTKGA01_L02_S01 s00 (user-caught live) AND the HIKGH04_P2 letter-row daylight item.
  try { window.SWIFTPAL_ENGINE = ENGINE_VERSION; } catch(e){}
const $ = id => document.getElementById(id);

/* ---------- 1. SCALE THE 1333x750 STAGE ---------- */
function fit(){
  const vw = (window.visualViewport ? window.visualViewport.width  : document.documentElement.clientWidth)  || window.innerWidth;
  const vh = (window.visualViewport ? window.visualViewport.height : document.documentElement.clientHeight) || window.innerHeight;
  // contain-fit, scaling UP to fill the screen (no 1× cap, no margin) so a 16:9
  // viewport is covered edge-to-edge. Any leftover bars on non-16:9 are blue, not white.
  const s = Math.min(vw/1333, vh/750);
  document.documentElement.style.setProperty("--scale", s);
}
window.addEventListener("resize", fit);
window.addEventListener("load", fit);
if(window.visualViewport) window.visualViewport.addEventListener("resize", fit);
fit();

/* ---------- 2. SIGNAL BUS + OFFLINE TELEMETRY ---------- */
/* TELEMETRY: offline self-capture. Every signal is buffered to localStorage so
   the run survives a reload / works with NO host app. A full results record can
   be pulled via GameBus.downloadResults() (or the ?dev=1 button on the end
   screen). If `endpoint` is set AND the device is online, the final record is
   also POSTed — left null so the lesson is fully offline by default. */
const TELEMETRY = {
  endpoint: null,   // e.g. "https://lrs.example.com/swiftpal" — null = offline only
  storageKey: "swiftpal:run:" + CARD.skill_code + "_" + (CARD.part_label || "P1")
};
/* ===== QA CHECKLIST [14]: xAPI VERB LAYER =================================
   The engine emits 36 GameBus signals but none of the seven required xAPI
   verbs. This layer maps the ones that already have a signal and fires the
   rest explicitly. context echoes context_id / journey_id / medium straight
   off the launch URL and always carries skill_code. */
const XAPI = window.XAPI = (function(){
  var q; try{ q = new URLSearchParams(location.search); }catch(e){ q = { get:function(){ return null; } }; }
  var startedAt = Date.now();
  var ctx = { skill_code: CARD.skill_code, lo_code: CARD.lo_code,
              context_id: q.get("context_id"), journey_id: q.get("journey_id"),
              medium: q.get("medium") || CARD.medium || "hi" };
  /* [QA 14] question_format per answerable slide type (HI01's enum). */
  var QUESTION_FORMAT = { MAKE_SET:"build", COUNT_HOW_MANY:"tap_count" };
  var log = [], fired = {};
  /* send(verb, object, result): builds the standard { verb, object, result, context } statement
     (HI01 shape) and hands it to the platform bridge - SwiftPAL.sendEvent -> Android / iOS / web.
     Falls back to a direct postMessage only if the bridge is absent (standalone dev).
     context echoes context_id / journey_id / medium off the launch URL, always carries skill_code,
     and on a slide-level verb adds question_id / question_index / template / question_format / phase. */
  function send(verb, object, result){
    var o = object || {}, sl = null;
    try{ if(o.slide_id) sl = CARD.slides.find(function(x){ return x.id === o.slide_id; }) || null; }catch(e){}
    var c = Object.assign({}, ctx, { session_ms: Date.now() - startedAt });
    if(sl){ Object.assign(c, { question_id: sl.id, question_index: CARD.slides.indexOf(sl), template: sl.type,
                               question_format: QUESTION_FORMAT[sl.type] || null, phase: sl.phase }); }
    var statement = { verb: verb, object: o, result: result || {}, context: c };
    log.push(Object.assign({ ts: Date.now() }, statement));
    try{
      if(window.SwiftPAL && typeof window.SwiftPAL.sendEvent === "function") window.SwiftPAL.sendEvent(statement);
      else window.parent && window.parent.postMessage({ type:"swiftpal:xapi", statement: statement }, "*");
    }catch(e){}
    try{ console.log("[xapi]", verb, statement); }catch(e){}
    devLog(verb, statement);
    return statement;
  }
  /* [QA 14] ?dev=1 on-screen verb log: every verb as it fires, with a running count per verb, so a
     misfired or duplicated verb is visible on screen during a QA pass (not only in the console). */
  var devBox = null, counts = {};
  function devLog(verb, st){
    if(!q.get || q.get("dev") === null) return;
    try{
      if(!devBox){
        devBox = document.createElement("div"); devBox.id = "xapiDevLog";
        devBox.style.cssText = "position:fixed;right:8px;top:8px;z-index:2147483000;max-height:46vh;width:300px;overflow:auto;" +
          "font:12px/1.35 ui-monospace,Consolas,monospace;background:rgba(10,20,40,.86);color:#E6F1FF;border-radius:8px;padding:6px 8px;pointer-events:none;";
        (document.body || document.documentElement).appendChild(devBox);
      }
      counts[verb] = (counts[verb] || 0) + 1;
      var r = st.result || {}, line = document.createElement("div");
      line.textContent = verb + " #" + counts[verb] + (st.context.question_id ? " · " + st.context.question_id : "") +
        (r.is_correct !== undefined ? " · correct=" + r.is_correct + " att=" + r.attempt + " score=" + r.score : "");
      devBox.appendChild(line); devBox.scrollTop = devBox.scrollHeight;
    }catch(e){}
  }
  return { ctx:ctx, log:log, send:send,
           once:function(v,o,r){ if(fired[v]) return null; fired[v]=1; return send(v,o,r); },
           hasFired:function(v){ return !!fired[v]; } };
})();
/* signal -> verb, for the three that already have a 1:1 signal */
const XAPI_MAP = { slide_entered:"screen_viewed", hint_shown:"hint_used", audio_replay:"audio_replayed" };
const XAPI_ANSWERABLE = ["COUNT_HOW_MANY","MAKE_SET"];   /* slide types that send question_started */

/* [QA 01] The game's internal bus is GameBus (window.GameBus). The global SwiftPAL name belongs to
   the platform bridge (swiftpal-bridge.js, loaded first), which XAPI.send() hands each statement to.
   This bus used to be called SwiftPAL itself, which took the name the host bridge needs. */
const GameBus = window.GameBus = {
  signals: [],
  validatorReport: { missing_signals: [], errors: [], passed: false },
  firedSet: new Set(),
  startedAt: Date.now(),
  emit(name, payload){
    const evt = Object.assign({
      ts: Date.now(),
      skill_code: CARD.skill_code,
      lo_code: CARD.lo_code,
      signal: name
    }, payload || {});
    this.signals.push(evt);
    this.firedSet.add(name);
    /* [14] fan the mapped signals out as xAPI verbs */
    /* a MANUAL hint_shown is a bulb tap, whose hint_used the capture listener on #hintBtn already
       sent - mapping it too would log the verb twice ([QA 14] no duplicated verbs). */
    /* [QA 14] one verb per screen, as HI01 does: an answerable slide sends question_started
       (mountSlide), everything else screen_viewed - never both for the same slide. */
    try{ if(XAPI_MAP[name] && !(name === "hint_shown" && payload && payload.manual)
            && !(name === "slide_entered" && payload && XAPI_ANSWERABLE.indexOf(payload.type) >= 0))
           XAPI.send(XAPI_MAP[name], { slide_id: payload && payload.slide_id }, payload || {}); }catch(e){}
    try{ console.log("[signal]", name, evt); }catch(e){}
    /* [QA 14] NOISE CONTROL (as HI01): the raw signal firehose is DEV-ONLY. Production hosts receive
       only the 7 xAPI verbs through the bridge. */
    if(new URLSearchParams(location.search).has("dev")){
      try{ window.parent?.postMessage({type:"swiftpal:signal", payload: evt}, "*"); }catch(e){}
    }
    this.persist();
  },
  /* full results record (used for download / POST / end-of-lesson dump) */
  exportResults(){
    const ms = (typeof state!=="undefined") ? state.masteryAttempts : 0;
    const mh = (typeof state!=="undefined") ? state.masteryHits : 0;
    return {
      skill_code: CARD.skill_code, lo_code: CARD.lo_code, part: CARD.part_label || null,
      started_at: this.startedAt, exported_at: Date.now(),
      mastery: { hits: mh, attempts: ms, score: ms ? mh/ms : 0 },
      validatorReport: this.validatorReport,
      signals: this.signals
    };
  },
  /* silent: flush the running buffer to localStorage (survives reload / offline) */
  persist(){
    try{ localStorage.setItem(TELEMETRY.storageKey, JSON.stringify(this.exportResults())); }
    catch(e){ /* private mode / quota — non-fatal, postMessage + memory still work */ }
  },
  /* pull the run as a JSON file (teacher/dev; not in the child's flow) */
  downloadResults(){
    try{
      const blob = new Blob([JSON.stringify(this.exportResults(), null, 2)], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = CARD.skill_code + "_" + (CARD.part_label||"P1") + "_results.json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=> URL.revokeObjectURL(url), 1000);
    }catch(e){ console.error("[telemetry] download failed", e); }
  }
};

/* ---------- 3. AUDIO ---------- */
let isPlaying=false, currentAudio=null;
function setPlaying(on){
  // the dynamic Swiftie sits header-left; the audio chips pulse to signal playback. r4/F1: share the
  // .playing toggle across the header chip AND the tut-card replay chip (the header is hidden in the
  // tut frame, so the in-card .tut-audio is the only visible affordance and must react to VO too).
  isPlaying=on;
  /* [QA 05] only the chip the audio is actually coming FROM animates, and only one at a time.
     It used to pulse every chip for every sound - option words, feedback, the count-aloud. */
  const src = on && currentAudio ? currentAudio.getAttribute("src") : null;
  const from = on ? chipFor(src) : null;
  document.querySelectorAll(".audio-chip, .tut-audio, .sg-vo").forEach(c => c.classList.toggle("playing", c === from));
  swApplyPose();   // freeze/unfreeze Swiftie's mouth: animate only while a clip is sounding
}
/* [QA 15] ONE reusable VO element, not a new Audio() per clip. Every clip used to get its own
   element and none was ever released: ~150 live media players by the last question, and the
   renderer crashed there on every full playthrough (Android WebViews cap players far lower).
   _playTok retires a superseded clip's callbacks, so a stopped clip can never fire onEnd late. */
const voEl = new Audio(); voEl.preload = "auto";
let _playTok = 0;
/* chipFor(src): the ONE chip a clip belongs to, or null. The landing greeting belongs to the
   landing chip; a slide's own lines (prompt / ask / conclude ...) to that slide's chip - the in-card
   tutorial chip when the tutorial frame is up, else the header chip. Feedback, option words and
   the count-aloud belong to no chip, so no chip moves for them. */
const _FEEDBACK_KEYS = { correct:1, try_again:1, hint:1, hint1:1, reveal:1, sfx:1 };
function chipFor(src){
  if(!src || typeof CARD === "undefined") return null;
  const gate = document.getElementById("startGate");
  if(gate && !gate.classList.contains("hidden")){
    const land = (CARD.assets && CARD.assets.audio && CARD.assets.audio.vo_landing) || "";
    return land && src.indexOf(land) >= 0 ? document.getElementById("sgVo") : null;
  }
  const sl = CARD.slides[state.idx];
  if(!sl || !sl.audio) return null;
  const own = Object.keys(sl.audio).some(k => !_FEEDBACK_KEYS[k] && src === audioFor(sl, k));
  if(!own) return null;
  return document.querySelector("#slideHost .tut-audio") || document.getElementById("audioChip");
}
/* [QA 11] replay-chip guard (HI01 [24a N8]): a replay tap while a clip is sounding is ignored.
   play() stops the current clip, and a paused clip never fires its end callback - so a replay
   mid-count froze DEMO_COUNT (आगे never unlocked) and mid-answer-word lost the auto-advance.
   The tap still reports audio_replayed (flagged ignored), so every tap is logged. */
function replayTap(slide, src){
  state.audioReplays++;
  const busy = isPlaying;
  GameBus.emit("audio_replay", { slide_id: slide ? slide.id : "landing", phase: slide ? slide.phase : "landing",
    count: state.audioReplays, src: src, ignored_while_playing: busy });
  return !busy;
}
function stopAudio(){
  _playTok++;
  if(currentAudio){ try{ currentAudio.pause(); }catch(e){} currentAudio=null; }
  setPlaying(false);
}
/* play(src, onEnd): real clip if the path exists; silent beat if missing/blocked. */
function play(src, onEnd){
  stopAudio(); setPlaying(true);
  const tok = _playTok;
  let done=false; const fire=()=>{ if(done || tok !== _playTok) return; done=true; currentAudio=null; setPlaying(false); if(onEnd) onEnd(); };
  if(src){
    const a = voEl; currentAudio = a;
    a.onended = fire;
    a.onerror = ()=>{ if(tok === _playTok) setTimeout(fire, 1200); };
    a.src = src; setPlaying(true);   // re-apply now the src is known, so the right chip lights
    a.play().catch(()=>{ if(tok === _playTok) setTimeout(fire, 1200); });
  } else { setTimeout(fire, 800); }
}
/* playSfx(id): fire-and-forget sound effect that can overlap the spoken VO (does NOT touch
   currentAudio / the play() chain). Two pooled elements, reused - never one per call.
   Silently no-ops if the file is missing or playback is blocked. */
const _sfxPool = [new Audio(), new Audio()]; let _sfxNext = 0;
function playSfx(id){
  if(!id) return;
  try{
    const a = _sfxPool[_sfxNext++ % _sfxPool.length];
    a.pause(); a.volume = 0.7;
    a.src = "assets/voiceover/" + id + "." + AUDIO_EXT;
    a.play().catch(()=>{});
  }catch(e){}
}
/* ---------- game-feel: procedural SFX (no audio files) + success particle burst ----------
   WebAudio resumes on the first user tap (autoplay policy), so taps/answers always sound. */
let _juiceAC = null;
function _ac(){ if(!_juiceAC){ try{ _juiceAC = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){} }
  if(_juiceAC && _juiceAC.state === "suspended"){ try{ _juiceAC.resume(); }catch(e){} } return _juiceAC; }
function _tone(freqs, type, dur, vol){ const c = _ac(); if(!c) return; const t0 = c.currentTime;
  freqs.forEach((f, i)=>{ const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
    const t = t0 + i*(dur/freqs.length); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur/freqs.length); o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur/freqs.length); }); }
const sfxTap       = ()=> _tone([520], "sine", 0.09, 0.09);
const sfxCorrect   = ()=> _tone([660, 880, 1180], "sine", 0.42, 0.13);   // rising major arpeggio
const sfxWrongSoft = ()=> _tone([300, 235], "triangle", 0.20, 0.08);      // gentle, never harsh
/* a joyful star/confetti pop, centred on the play stage (upper-middle) */
function burstStars(){ const stage = document.querySelector(".slide-stage") || document.body;
  const cx = stage.offsetWidth/2, cy = stage.offsetHeight*0.38, emo = ["⭐","✨","🌟","💫","🎉"];
  for(let i=0;i<14;i++){ const s = document.createElement("span"); s.className = "spark"; s.textContent = emo[i % emo.length];
    const ang = (Math.PI*2)*(i/14) + Math.random()*0.5, dist = 70 + Math.random()*110;
    s.style.left = cx + "px"; s.style.top = cy + "px";
    s.style.setProperty("--dx", (Math.cos(ang)*dist).toFixed(0) + "px");
    s.style.setProperty("--dy", (Math.sin(ang)*dist).toFixed(0) + "px");
    s.style.animationDelay = (i*10) + "ms"; stage.appendChild(s); setTimeout(()=> s.remove(), 950); } }
/* dynamic Swiftie buddy: swap pose + a little pop on every reaction (correct/wrong/explain/celebrate) */
// [20a mascot-01] moods -> production EXPRESSIONS (head webp), not idle-gif basenames.
//   Ported verbatim from HI01H01_L02_S04_dist (its app lines 2474-2493) together with the
//   .mascot-wrap > .mascot-circle > .mascot-img markup. The old sw_anim_*.gif scheme and the
//   isPlaying mouth-coupling go with it - heads are now driven by setSwMood alone.
const SW_POSE = { talk:"talking", point:"talking", idle:"talking", happy:"celebrate", celebrate:"celebrate",
                  hint:"hint", teach:"hint", idea:"hint", tryagain:"tryagain" };
const SW_STILL = (() => { try { const q=new URLSearchParams(location.search);
  return q.has("still") || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); } catch(e){ return false; } })();
let swMood = "point";
function swApplyPose(){ /* [20a] retired: heads no longer couple to isPlaying (setSwMood drives them). */ }
function setSwMood(m){ swMood = m;
  const img = document.getElementById("swBuddyImg"), w = document.getElementById("swBuddy");
  if(!img) return;
  const expr = SW_POSE[m] || "talking";
  const animated = expr !== "talking" && !SW_STILL;   // resting face is the static talking head
  img.onerror = () => { img.onerror = null; img.src = "assets/mascot.webp"; };   // [mascot-10]
  const bust = (animated && expr === "celebrate") ? ("?r=" + (state.slideStart || 1)) : "";  // [mascot-08] replay play-once
  img.src = "assets/" + (animated ? "gif/" : "") + "sw_head_" + expr + (animated ? "_anim" : "") + ".webp" + bust;
  if(w){ w.dataset.expr = expr; w.classList.toggle("anim", animated);
         w.classList.remove("react"); void w.offsetWidth; w.classList.add("react"); } }   // .react pop kept from MTG
/* ===== FLN ANIMATION KIT: confetti (call site) BEGIN =====
   Recipe 7 REPLACES the correct-answer celebration rather than tuning it, so the
   two-sided .conf-shot cannon below is retired to _confettiCannonOld. The kit
   gates itself to guided/practice/mastery, so the phase of the live slide is
   passed through; in tutorial the tile-level confirm (recipe 19) is the feedback.
   The old function is kept, unreferenced, so the change is reversible in one line. */
function confettiCannon(){
  var sl = CARD.slides[state.idx] || {};
  /* [13] QA CHECKLIST gauge: ~100 pieces, 3s fall, staggered 0-0.5s, appended
     inside the stage, approved 7-colour palette. Size/radius/easing are pinned
     in style.css. phases:[] because the checklist asks for confetti on every
     correct answer, including tutorial. */
  FLNMotion.confetti.burst({
    host: ".stage-inner", phase: sl.phase, phases: [],
    count: 100, stagger: 0.5, fall: [3, 3], depth: [1, 1],
    colors: [["#8B2FC9","#5E1C8C"],["#3F51B5","#27358A"],["#1E88E5","#135FA6"],
             ["#22B24C","#157A34"],["#FFD21E","#D9A800"],["#FF8A1E","#C75F00"],
             ["#E5322D","#A81F1B"]]
  });
}
/* ===== FLN ANIMATION KIT: confetti (call site) END ===== */
/* confetti cannons from BOTH sides — the correct-answer celebration (replaces the popup) */
function _confettiCannonOld(){ const stage = document.querySelector(".slide-stage") || document.body;
  const W = stage.offsetWidth || 1000, cols = ["#F9695E","#FDC23C","#4EBE6A","#4EA3F0","#9B7BE8","#FF8FB1"];
  for(let side=0; side<2; side++){ for(let i=0;i<24;i++){ const c = document.createElement("i"); c.className = "conf-shot";
    c.style.background = cols[i % cols.length]; c.style.left = (side ? W-8 : 8) + "px"; c.style.bottom = "6px";
    const dir = side ? -1 : 1;
    c.style.setProperty("--tx", (dir*(120 + Math.random()*430)).toFixed(0) + "px");
    c.style.setProperty("--ty", (-(200 + Math.random()*300)).toFixed(0) + "px");
    c.style.animationDelay = (i*8) + "ms"; stage.appendChild(c); setTimeout(()=> c.remove(), 1300); } } }
/* ---------- Block Town helpers (flagship) ---------- */
const BT_COLORS = ["#F9695E","#FDC23C","#4EBE6A","#4EA3F0","#9B7BE8"];
function btBlock(i){ const b = document.createElement("div"); b.className = "blk"; b.style.background = BT_COLORS[i % BT_COLORS.length]; return b; }
function btThunk(n){ _tone([360 + n*46], "sine", 0.12, 0.10); }   // pitch climbs one step per block — HEAR the count
function btDust(plot){ const d = document.createElement("span"); d.className = "bt-dust"; d.textContent = "💨"; plot.appendChild(d); setTimeout(()=> d.remove(), 520); }
function btSkyline(done, total){ const s = document.createElement("div"); s.className = "bt-skyline";
  for(let i=0;i<total;i++){ const b = document.createElement("div"); b.className = "bt-bldg" + (i < done ? " done" : "");
    b.style.height = (26 + ((i*17) % 32)) + "px"; s.appendChild(b); } return s; }
/* the teach scene: the crane drops N blocks ONE AT A TIME (ascending thunk + spoken count) then a
   cardinality "freeze" (vo_total_N). Reached from MEET_NUMBER via data.present==='crane'. */
function btCraneMeet(host, slide){
  const d = slide.data, N = d.count;
  state.ownsAudio = true;   // the crane drops+counts blocks on its own timed VO — skip autoPlayChain
  const stage = document.createElement("div"); stage.className = "bt-stage";
  const board = document.createElement("div"); board.className = "bt-board";
  board.innerHTML = `<span class="bt-numeral">${N}</span>` + (d.word ? `<span class="bt-goallbl">${d.word}</span>` : "");   // Arabic numeral (from the integer, not card Devanagari)
  const track = document.createElement("div"); track.className = "bt-track"; const cells = [];
  for(let i=1;i<=N;i++){ const c = document.createElement("div"); c.className = "bt-nt"; track.appendChild(c); cells.push(c); }
  const yard = document.createElement("div"); yard.className = "bt-yard";
  const crane = document.createElement("div"); crane.className = "bt-crane"; crane.innerHTML = `<img src="assets/obj_crane.png" alt="">`;
  const plotwrap = document.createElement("div"); plotwrap.className = "bt-plotwrap";
  const plot = document.createElement("div"); plot.className = "bt-plot ground";
  plot.style.setProperty("--bh", Math.max(20, Math.min(46, Math.floor(230/N) - 2)) + "px");
  plotwrap.appendChild(plot); yard.appendChild(crane); yard.appendChild(plotwrap);
  stage.appendChild(board); stage.appendChild(track); stage.appendChild(yard);
  host.appendChild(stage);
  state.gateNavUntilAudio = false; setNavActive(false);
  $("navBtn").onclick = ()=> completeSlide(true);
  let i = 0;
  const step = ()=>{
    if(i >= N){ if(d.topper){ const t = document.createElement("div"); t.className = "bt-topper snap"; t.innerHTML = `<img src="assets/${d.topper}.png" alt="">`; plot.appendChild(t); }
      burstStars(); play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT, ()=> setNavActive(true)); return; }
    const b = btBlock(i); b.classList.add("drop"); plot.appendChild(b); i++;
    if(cells[i-1]){ cells[i-1].classList.add("lit"); cells[i-1].textContent = i; }
    btThunk(i); btDust(plot);
    play("assets/voiceover/vo_num_" + i + "." + AUDIO_EXT, ()=> setTimeout(step, 340));
  };
  // play the slide prompt FIRST, then start the crane count sequence — so the count VO never cuts the
  // prompt off (we own the audio here; mountSlide's autoPlayChain is skipped via state.ownsAudio).
  play(audioFor(slide, "prompt") || null, ()=> setTimeout(step, 400));
}
/* slide audio path: per slide, we look at slide.audio.prompt / .phoneme / etc.
   In this v0.1 the embedded card holds short ids; the compiler would replace
   them with base64 data URIs. We resolve to assets/voiceover/{id}.mp3 with fallback. */
function audioFor(slide, key){
  if(!slide.audio || !slide.audio[key]) return null;
  return "assets/voiceover/" + slide.audio[key] + "." + AUDIO_EXT;
}
/* audioText(slide,key): the exact Hindi line the VO for this slot speaks, so a
   popup can SHOW what it SAYS (shown == spoken). Looks up the build-injected
   CARD.assets.audio_text map by the slot's audio_id. null if unknown. */
function audioText(slide, key){
  const id = slide.audio && slide.audio[key];
  if(!id) return null;
  return (CARD.assets && CARD.assets.audio_text && CARD.assets.audio_text[id]) || null;
}
/* Play a SEQUENCE of audio sources back-to-back. Each one finishes (or
   falls back to silent beat if missing) before the next starts. */
function playChain(srcs, i, onDone){
  i = i || 0;
  if(i >= srcs.length){ if(onDone) onDone(); return; }
  play(srcs[i], () => playChain(srcs, i+1, onDone));
}
/* On slide mount, play prompt → phoneme/word_name → instruction in order.
   KG learners can't read prompt_hi — the chain gives them both the
   instruction AND the cue (letter sound or picture name) audibly.
   onDone fires after the whole chain finishes (used to gate the नav button). */
function autoPlayChain(slide, onDone){
  const order = ["prompt","phoneme","shape_name","word_name","instruction"];
  const chain = [];
  for(const k of order){
    const src = audioFor(slide, k);
    if(src) chain.push(src);
  }
  if(chain.length) playChain(chain, 0, onDone);
  else if(onDone) onDone();
}

/* nav button: enable/disable the kit-style pill. When it becomes active (the
   activity is done) but the child doesn't tap आगे, the hand-nudge points at it. */
function setNavActive(on){
  const btn = $("navBtn");
  btn.disabled = !on;
  btn.classList.toggle("active", on);
  clearTimeout(state.navNudgeTimer);
  if(on) state.navNudgeTimer = setTimeout(nudgeNavBtn, 4500);
}
function nudgeNavBtn(){
  /* [04] QA CHECKLIST: "Nudge hand only ever points at interactive tiles/objects
     - never at आगे, शुरू करें, or any other button." This pointed it straight at
     #navBtn, so it is now a no-op. Kept as a function because setNavActive()
     schedules it and several modules clear its timer. */
  return;
  /* eslint-disable no-unreachable */
  const btn = $("navBtn");
  if(!btn.classList.contains("active") || state.hintActive) return;
  const nh = $("nudgeHand");
  const r = btn.getBoundingClientRect();
  const sw = document.querySelector(".slide-stage").getBoundingClientRect();
  const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
  nh.style.left = ((r.left - sw.left)/scale + r.width/scale/2 - 48) + "px";
  nh.style.top  = ((r.top  - sw.top )/scale + r.height/scale/2 - 6) + "px";
  nh.classList.add("show");
}

/* ---------- 4. STATE ---------- */
const state = {
  idx: 0,
  slideStart: Date.now(),
  attempts: 0,
  audioReplays: 0,
  hintUsed: false,
  nudgeUsed: false,
  scaffoldLevel: 0,   // 0 none, 1 nudge, 2 hint, 3 reveal
  selectedKey: null,
  locked: false,
  hintActive: false,
  masteryHits: 0,
  masteryAttempts: 0,
  nudgeTimer: null
};
/* [QA 06] SCORE = first-try correctness over every ANSWERABLE question (guided + practice here).
   It used to count only phase==="mastery" slides - this card has none, so hits/attempts stayed
   0/0 and every run scored 0. recordResult() is called once per question when it resolves
   (right tap, or the reveal), from COUNT_HOW_MANY and MAKE_SET alike; a slide can only be
   scored once, so a replayed/re-entered slide can never be double-counted (no off-by-one). */
function recordResult(slide, firstTry){
  state.scored = state.scored || {};
  if(!slide || Object.prototype.hasOwnProperty.call(state.scored, slide.id)) return;
  state.scored[slide.id] = !!firstTry;
  state.masteryAttempts++; if(firstTry) state.masteryHits++;
}

/* ---------- 5. NUDGE ----------
   target may be a CSS selector OR an element. Used ONLY for flow guidance
   (e.g. the "listen" button / prompt) — never to point at the correct answer. */
function startNudge(slide, target){
  clearTimeout(state.nudgeTimer);
  if(!target) return;
  const ms = (CARD.scaffold_rules.nudge_timeout_ms || {})[slide.phase];
  if(!ms) return;
  state.nudgeTimer = setTimeout(()=>{
    if(state.locked || state.hintActive) return;
    const el = (typeof target === "string") ? document.querySelector(target) : target;
    if(!el) return;
    if(!placeNudge(el)) return;
    state.nudgeUsed = true;
    state.scaffoldLevel = Math.max(state.scaffoldLevel, 1);
    GameBus.emit("nudge_invoked", { slide_id: slide.id, phase: slide.phase });
  }, ms);
}
function stopNudge(){
  clearTimeout(state.nudgeTimer);
  $("nudgeHand").classList.remove("show");
}
/* [QA 12] THE HAND SITS BELOW ITS TARGET, NEVER ON IT, NEVER ON A BUTTON.
   #nudgeHand is 86x108 and nudge_hand_new.svg (75x94) fills it at scale 1.1467, which puts the
   fingertip at (34.2, 15.8) inside the box (kit recipe 4 geometry). The old code dropped the box
   -56px / -30px INTO the target, i.e. the fingertip 24-50px inside the tile and the hand over it.
   Now the FINGERTIP lands 8px below the target's bottom edge, and, as HI01 [28j] does, below any
   label text sitting under the target in the same column. It is clamped inside the stage
   (never flipped above - it points UP, so above a target it would point away), and if the box
   would still overlap any button other than its own target it is not shown at all.
   References .slide-stage (the nudge's positioning context), not .stage (~140px header off). */
const NH = { W:86, H:108, TIP_X:34.2, TIP_Y:15.8, GAP:8 };
function placeNudge(el){
  const nh = $("nudgeHand"), host = document.querySelector(".slide-stage");
  if(!el || !nh || !host || !el.getBoundingClientRect) return false;
  const r = el.getBoundingClientRect(), sw = host.getBoundingClientRect();
  const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
  const cx = (r.left - sw.left)/scale + r.width/scale/2;
  let tipY = (r.bottom - sw.top)/scale + NH.GAP;
  const tile = el.closest(".opt-cell, .count-item, .ms-item, .q-cell, .tut-card") || el.parentElement;
  if(tile){
    tile.querySelectorAll(".lbl, .opt-label, .count-badge, .pic-label").forEach(t => {
      const tr = t.getBoundingClientRect();
      if(tr.width < 2 || tr.height < 2 || tr.right < r.left || tr.left > r.right) return;
      const tb = (tr.bottom - sw.top)/scale + NH.GAP;
      if(tb > tipY) tipY = tb;
    });
  }
  const stageW = sw.width/scale, stageH = sw.height/scale;
  const left = Math.max(0, Math.min(stageW - NH.W, cx - NH.TIP_X));
  const top  = Math.max(0, Math.min(stageH - NH.H, tipY - NH.TIP_Y));
  nh.style.left = left + "px"; nh.style.top = top + "px";
  // never covering a button: test the hand's final box against every button except its target
  const hr = { l: sw.left + left*scale, t: sw.top + top*scale, r: sw.left + (left + NH.W)*scale, b: sw.top + (top + NH.H)*scale };
  /* A button in the hand's box: the hand is CUT OFF 4px above that button's top edge (clip-path),
     so it reads as tucked behind the button and never draws over it. On the tutorial slides आगे
     sits right under the unit row, so a plain "hide if it overlaps" rule hid the tutorial hand
     entirely. If the cut would leave less than 40% of the hand (fingertip + finger), it is hidden. */
  let cutTop = Infinity;
  [...document.querySelectorAll("button, .nav-btn, .audio-chip, .tut-audio, .hint-btn")].forEach(b => {
    if(b === el || b.contains(el) || el.contains(b)) return;
    const br = b.getBoundingClientRect();
    if(br.width < 2 || br.height < 2 || getComputedStyle(b).visibility === "hidden") return;
    if(br.left < hr.r && br.right > hr.l && br.top < hr.b && br.bottom > hr.t) cutTop = Math.min(cutTop, br.top);
  });
  nh.style.clipPath = "";
  if(cutTop !== Infinity){
    const keep = (cutTop - 4 - hr.t) / scale;                 // design px of the hand left visible
    if(keep < NH.H * 0.4){ nh.classList.remove("show"); return false; }
    nh.style.clipPath = "inset(0 0 " + Math.max(0, NH.H - keep).toFixed(1) + "px 0)";
  }
  nh.classList.add("show");
  return true;
}
/* Show the hand-nudge immediately on a specific element (teach slides use it to guide the
   next tap). Same placement as the idle nudge - see placeNudge(). */
function pointNudgeAt(el){ placeNudge(el); }

const SW_REST = "sw_anim_rest";   // the feedback-card Swiftie's closed-mouth rest frame (assets/sw_anim_rest.png)
/* ---------- 7. HINT / FEEDBACK BOX ----------
   No button: the popup plays its VO, then auto-dismisses. onEnd runs after it
   closes (callers add a short pause there so the revealed answer shows). */
function showBox(emoji, text, theme, audioSrc, onEnd){
  // CORRECT: no popup (lead review) — confetti cannons from both sides + Swiftie cheer, then onEnd.
  if(theme === "correct"){
    sfxCorrect(); confettiCannon(); setSwMood("celebrate");
    play(audioSrc || null, ()=> setTimeout(()=>{ if(onEnd) onEnd(); }, 300));
    return;
  }
  state.hintActive = true;
  // wrong/hint/reveal keep a light card (mechanics use it for a short cue); Swiftie reacts too.
  // one-Swiftie rule: the popup shows the reacting Swiftie (animated), so HIDE the header buddy
  // while it's open — never two Swifties on screen at once (MoM flag).
  /* [kit] the measurement sheet ships seven FULL-BODY Swiftie poses; the feedback
     card is the one place this build already shows a whole mascot, so it reads
     them instead of the old three-gif set. Falls back to the gifs if a cut is
     missing. */
  const swMap  = { wrong:"sw_anim_tryagain", hint:"sw_anim_teach", reveal:"sw_anim_teach" };
  const mkPose = { wrong:MK.sw.cheer, hint:MK.sw.guide, reveal:MK.sw.explain };
  const sw = $("hintMascot");
  if(sw){
    sw.style.display = "";
    const gif = "assets/gif/" + (swMap[theme] || "sw_anim_talk") + ".gif";
    sw.onerror = function(){ this.onerror = null; this.src = gif; };
    sw.src = mkPose[theme] ? mkSrc(mkPose[theme]) : gif;
  }
  const buddy = $("swBuddy"); if(buddy) buddy.style.visibility = "hidden";
  setSwMood(theme === "wrong" ? "tryagain" : "hint");
  $("hintBox").classList.remove("celebrate");
  sfxWrongSoft();
  const ht = $("hintText"); ht.textContent = text; ht.className = "hint-text " + theme;
  $("stage").classList.add("blurred");
  $("hintOverlay").classList.add("show");
  $("hintBtn").disabled = true;
  { const hb=$("hintBtn"); if(hb) hb.classList.remove("hint-glow"); }   // HI01 parity (its line 2965): the bulb stops pulsing once the hint is spent
  /* [12] QA CHECKLIST: the hint bulb is the inline SVG (gradient + ring + rays),
     so the old hint.png / hint_active.png swap is gone, not just inert. */
  const close = ()=>{
    $("hintOverlay").classList.remove("show");
    $("stage").classList.remove("blurred");
    if(buddy) buddy.style.visibility = "";   // header Swiftie returns when the popup closes
    state.hintActive = false;
    if(!state.locked) $("hintBtn").disabled = false;
    if(onEnd) onEnd();
  };
  // auto-dismiss after the VO finishes (small buffer so it never just flashes); freeze the popup
  // Swiftie's mouth to the still frame the instant its line ends
  /* [QA 05] SW_REST was never defined, so this callback threw and close() never ran - the popup
     stayed up and blocked every tap (reached once MAKE_SET's wrong path became live). The rest pose
     is the feedback card's own default (index.html #hintMascot). close() is now always scheduled. */
  play(audioSrc, ()=>{ try{ if(sw) sw.src = "assets/" + SW_REST + ".png"; }catch(e){} setTimeout(close, 300); });
}

/* ---------- 8. TAP-OPTION HELPER (shared by 5 slide types) ---------- */
function mountTapOptions({slide, host, signalName, stimulus, options, isCorrect, optionRenderer, columnsHint, mastery, hintAction, nudgeTarget, shuffle, onCorrect, onWrong}){
  state.attempts = 0; state.selectedKey = null; state.locked = false;
  state.audioReplays = 0; state.hintUsed = false; state.nudgeUsed = false; state.scaffoldLevel = 0;
  // idle hand-nudge target: defaults to the stimulus (re-listen), but a slide can pass
  // nudgeTarget:null to suppress it entirely (e.g. "how many?" — nothing to re-tap).
  const _nudge = (nudgeTarget !== undefined) ? nudgeTarget : (stimulus || null);
  // optional custom hint (runs on the live slide instead of a text popup), e.g. a
  // count-demonstration. Wrapped to block option taps while it plays.
  const runHint = hintAction ? (after)=>{ state.hintActive = true; hintAction(()=>{ state.hintActive = false; if(after) after(); }); } : null;

  // Shuffle options once so the correct answer isn't pinned to one position (engine-wide anti
  // positional-bias — otherwise "always tap the same spot" can pass mastery). Opt out with
  // shuffle:false for inherently-ordered options (e.g. a number line).
  const _opts = (shuffle === false) ? options.slice()
    : (function(a){ a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; })(options);

  const wrap = document.createElement("div"); wrap.className = "q-row";
  if(stimulus){ wrap.appendChild(stimulus); }
  const grid = document.createElement("div");
  const cols = columnsHint || (_opts.length <= 2 ? 2 : _opts.length <= 3 ? 3 : 4);
  grid.className = "opt-grid cols-" + cols;
  _opts.forEach((opt, i) => {
    const cell = optionRenderer(opt, i);
    cell.classList.add("opt-cell");
    cell.dataset.key = String(i);
    cell.onclick = ()=>{
      /* [10] a wrong card must stay tappable - the .crossed early-return is gone.
         .correct still blocks, because the slide is locked once it is answered. */
      if(state.locked || state.hintActive || cell.classList.contains("correct")) return;
      stopNudge();
      // SME rule: SPEAK THE TAPPED WORD on EVERY tap (right or wrong), then the feedback — never two
      // voices at once (buzz/confetti are sfx, they ride alongside the word). opt.audio = word clip id.
      // Fallback wiring for LETTER options (SME: the tapped item's own sound speaks EVERYWHERE): options
      // authored as {letter:"आ"} carry no audio id, but the slide's data.phonemes map has each letter's
      // clip — derive it here centrally so every TAP_LETTER_* / mastery module inherits speak-on-tap
      // without per-module or per-card changes. Explicit opt.audio always wins.
      const _aid = opt.audio ||
                   (opt.letter && slide.data && slide.data.phonemes && slide.data.phonemes[opt.letter]) || null;
      const _word = _aid ? ("assets/voiceover/" + _aid + "." + AUDIO_EXT) : null;
      const _afterWord = (cb)=>{ if(_word) play(_word, cb); else cb(); };
      if(isCorrect(opt, i)){
        state.locked = true; cell.classList.add("correct"); FLNMotion.correctSelect.play(cell);
        try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase },
             { is_correct:true, attempt: state.attempts + 1, score: state.attempts === 0 ? 1 : 0 }); }catch(e){}   /* kit recipe 19 - tile-level confirm; runs WITH the confetti, not instead of it */
        sfxCorrect(); confettiCannon(); setSwMood("happy");
        if(onCorrect) onCorrect(opt, cell);      // [kit] slide-level flourish (e.g. the result plate)
        recordResult(slide, state.attempts === 0);   // [QA 06] every answerable slide scores, not only "mastery"
        GameBus.emit(signalName, { slide_id: slide.id, phase: slide.phase, value: true,
          first_try: state.attempts === 0, attempts: state.attempts + 1,
          scaffold_level: state.scaffoldLevel, latency_ms: Date.now()-state.slideStart });
        _afterWord(()=> setTimeout(()=> completeSlide(true), 700));   // speak the word → then advance (confetti is the reward)
      } else {
        state.attempts++; cell.classList.add("crossed");
        /* [10] QA CHECKLIST: the wrong card auto-reverts after ~900ms and STAYS
           TAPPABLE, so this is the kit's transient .play() (release), no longer
           .out() (elimination). .play() releases at dur*1500+40 then fades over
           260ms = ~900ms at the default .4s beat, which is the spec figure.
           The .crossed class is left on only so existing logic still reads it;
           its dim/lock/cross are neutralised in style.css. */
        FLNMotion.wrongSelect.play(cell, { then: function(){ cell.classList.remove("crossed"); } });
        try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase },
             { is_correct:false, attempt: state.attempts, score: 0 }); }catch(e){}
        sfxWrongSoft(); setSwMood("tryagain");
        if(onWrong) onWrong(opt, cell);          // [kit] slide-level cue (e.g. gap vs overlap)
        // (do NOT count masteryAttempts here — the correct branch counts one attempt PER ITEM.)
        GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
        // LAYERED SCAFFOLD (A1): L1 re-listen → L2 hint → L3 REVEAL at max_attempts (never stuck).
        const _maxA = (CARD.scaffold_rules && CARD.scaffold_rules.max_attempts) || 3;
        $("hintBtn").classList.add("show","hint-glow");
        _afterWord(()=>{   // speak the tapped word FIRST, then the layered feedback VO (no overlap)
          if(state.attempts >= _maxA){ revealAnswer("wrong"); }
          else if(state.attempts >= 2){ state.scaffoldLevel = Math.max(state.scaffoldLevel, 2);
            GameBus.emit("hint_shown", { slide_id: slide.id, manual: false });   // [QA 14] auto hint -> hint_used
            if(runHint) runHint(); else play(audioFor(slide, "hint") || audioFor(slide, "try_again") || null, ()=>{}); }
          else { state.scaffoldLevel = Math.max(state.scaffoldLevel, 1);
            /* [QA 05] rung 1 = RE-LISTEN: the try-again line, then the question itself again */
            play(audioFor(slide, "try_again") || null, ()=>{ if(!state.locked && !state.hintActive) play(audioFor(slide, "prompt") || null, ()=>{}); }); }
        });
      }
    };
    grid.appendChild(cell);
  });
  wrap.appendChild(grid);
  host.appendChild(wrap);

  // ---- layered-hint helpers (A1/B2): reveal-on-max + a wired manual hint button ----
  function _correctCell(){ return [...grid.querySelectorAll(".opt-cell")].find(c => isCorrect(_opts[+c.dataset.key], +c.dataset.key)); }
  function revealAnswer(reason){
    if(state.locked) return; state.locked = true; state.scaffoldLevel = 3; setSwMood("hint");
    const el = _correctCell();
    [...grid.querySelectorAll(".opt-cell")].forEach(c => { if(c !== el) c.classList.add("faded"); });
    if(el) el.classList.add("correct", "ck-correct", "reveal-pulse");   // [QA 10] the spec green border, never the tick badge
    recordResult(slide, false);
    GameBus.emit("answer_revealed", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts, reason });
    play(audioFor(slide, "reveal") || audioFor(slide, "correct") || audioFor(slide, "try_again") || null,
      ()=> setTimeout(()=> completeSlide(false), 800));
  }
  $("hintBtn").onclick = ()=>{ if(state.locked || state.hintActive) return;
    state.hintUsed = true; if(state.attempts < 1) state.attempts = 1;
    GameBus.emit("hint_shown", { slide_id: slide.id, manual: true });
    if(runHint) runHint(); else play(audioFor(slide, "hint") || audioFor(slide, "try_again") || null, ()=>{}); };

  startNudge(slide, _nudge);
  // Tap-to-answer standard (lead review): a WRONG tap = soft buzz + ✕ + that card LOCKS (can't re-tap);
  // a RIGHT tap = confetti cannons + Swiftie cheer, then auto-advance. No select-then-आगे for pick questions.
  $("navBtn").style.display = "none"; setNavActive(false);
}

/* ---------- 10. RENDER HELPERS ---------- */
/* Render a picture as the real PNG (assets/<key>.png); if the file is
   missing it falls back to the emoji. Pass the image id (e.g. "pic_anaar"). */
function imgOrEmoji(imgKey, emoji, imgClass, emojiClass){
  if(imgKey){
    const fb = String(emoji||"❓").replace(/'/g,"");
    return `<img class="${imgClass}" src="assets/${imgKey}.${IMG_EXT}" alt="" `+
      `onerror="var s=document.createElement('span');s.className='${emojiClass}';s.textContent='${fb}';this.replaceWith(s);">`;
  }
  return `<span class="${emojiClass}">${emoji||"❓"}</span>`;
}
function letterCell(letter){
  const cell = document.createElement("div");
  cell.innerHTML = `<span class="big-glyph ink-glyph">${letter}</span>`;
  return cell;
}
/* ordering/seriation render (MTKGA02_L02_S02): an object at a given magnitude. by="size" scales the
   picture uniformly; by="length" draws a content-true rounded bar of width∝mag; by="weight" shows the
   picture at a uniform size (weight is not visual — the child uses known heaviness / the balance cue). */
function imgOrEmojiSized(img, emoji, px){
  const fb = String(emoji||"❓").replace(/'/g,"");
  if(img) return `<img class="ord-obj-img" style="width:${px}px;height:${px}px" src="assets/${img}.${IMG_EXT}" alt="" `+
    `onerror="var s=document.createElement('span');s.className='ord-obj-emoji';s.style.fontSize='${Math.round(px*0.82)}px';s.textContent='${fb}';this.replaceWith(s);">`;
  return `<span class="ord-obj-emoji" style="font-size:${Math.round(px*0.82)}px">${emoji||"❓"}</span>`;
}
function renderOrdObj(o, by){
  if(by === "length"){ const w = {1:130,2:210,3:300}[o.mag] || 200;
    return `<div class="ord-bar" style="width:${w}px;background:${o.color||"#F5A623"}"></div>`; }
  // size AND weight scale the picture by visual magnitude — so a BIG-but-LIGHT balloon looks big and
  // tempts the child (bigger=heavier misconception), while the small stone is the correct heaviest pick.
  const px = {1:80, 2:116, 3:154}[o.mag] || 116;
  return imgOrEmojiSized(o.img, o.emoji, px);
}
function pictureCell(picture, emoji, imgKey){
  const cell = document.createElement("div");
  cell.innerHTML = imgOrEmoji(imgKey, emoji, "pic-img", "pic-emoji") + `<span class="lbl">${picture||""}</span>`;
  return cell;
}
function stimulusLetter(letter){
  const el = document.createElement("div"); el.className = "stimulus-letter";
  el.innerHTML = `<span class="ink-glyph">${letter}</span>`;
  return el;
}
function stimulusPic(picture, emoji, imgKey){
  const el = document.createElement("div"); el.className = "stimulus-pic";
  el.innerHTML = imgOrEmoji(imgKey, emoji, "img", "emoji") + `<span class="lbl">${picture||""}</span>`;
  return el;
}
/* gender helpers: an option card showing a gender label (पुल्लिंग/स्त्रीलिंग),
   and a stimulus card showing the target gender label. */
function genderLabelCell(label, gender){
  const cell = document.createElement("div");
  cell.innerHTML = `<span class="gender-label${gender==="F"?" fem":""}">${label}</span>`;
  return cell;
}
function stimulusGender(label, gender){
  const el = document.createElement("div");
  el.className = "stimulus-gender" + (gender==="F"?" fem":"");
  el.textContent = label;
  return el;
}

/* shape helpers (maths): render circle/square/triangle/rectangle as inline SVG in
   any colour / size / rotation (LO: recognise regardless of orientation or size).
   No image assets needed — shapes are pure geometry, so the sample renders offline. */
function shapeSVG(shape, opts){
  opts = opts || {};
  const color = opts.color || "#386AF6";
  const size  = opts.size  || 120;
  const rot   = opts.rotate || 0;
  let inner = "";
  if(shape === "circle")         inner = `<circle cx="50" cy="50" r="42" fill="${color}"/>`;
  else if(shape === "square")    inner = `<rect x="12" y="12" width="76" height="76" rx="0" fill="${color}"/>`;   // TRUE corners — teachable geometry is never rounded
  else if(shape === "triangle")  inner = `<polygon points="50,9 91,89 9,89" fill="${color}"/>`;
  else if(shape === "rectangle") inner = `<rect x="6" y="28" width="88" height="44" rx="0" fill="${color}"/>`;    // TRUE corners
  const g = rot ? `<g transform="rotate(${rot} 50 50)">${inner}</g>` : inner;
  return `<svg class="shape-svg" viewBox="0 0 100 100" width="${size}" height="${size}" `+
         `xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${g}</svg>`;
}
function shapeCell(o){
  const cell = document.createElement("div");
  cell.innerHTML = shapeSVG(o.shape, {color:o.color, size:130, rotate:o.rotate});
  return cell;
}
function stimulusShape(o){
  const el = document.createElement("div"); el.className = "stimulus-shape";
  el.innerHTML = shapeSVG(o.shape, {color:o.color, size:150, rotate:o.rotate});
  return el;
}

/* counting helpers (maths): a numeral option card (big numeral + small number word),
   and a stimulus box showing a set of `count` identical objects to be counted. */
function numberCell(numeral, word){
  const cell = document.createElement("div");
  cell.innerHTML = `<span class="num-glyph">${numeral}</span>` + (word ? `<span class="num-word">${word}</span>` : "");
  return cell;
}
/* VISUAL-FIRST quantity: a HAND showing n fingers up (assets/hand_1..5) — pre-reader,
   NO number-word text. Falls back to the numeral only if n is outside 1..5 or the art is missing. */
function fingerCount(n, cls){ cls = cls || "finger-hand";
  if(!(n>=1 && n<=5)) return `<span class="num-glyph">${n}</span>`;
  return `<img class="${cls}" src="assets/hand_${n}.png" alt="" ` +
    `onerror="var s=document.createElement('span');s.className='num-glyph';s.textContent='${n}';this.replaceWith(s);">`;
}
function fingerCell(n){ const c = document.createElement("div"); c.innerHTML = fingerCount(n, "opt-hand"); return c; }
/* DISPLAY numeral: ALWAYS Arabic (1 2 3) on screen — kids learn the universal digit.
   Spoken VO stays Hindi (एक/दो/तीन) via the separate vo_num_/vo_total_ audio files. */
function devNumeral(n){ return String(n); }
/* DUAL-CODED counting option: the Devanagari NUMERAL the child is learning, big and on top,
   with a smaller finger-hand beneath it as a visual anchor. The point of counting is to learn the
   NUMBER SYMBOL, not just read a hand-sign — so the numeral leads and the hand supports. Falls back
   to the numeral alone if the hand art (1..5) is missing. */
function numFingerCell(n){
  // outer div BECOMES the .opt-cell (mountTapOptions adds that class), so the stack lives in an
  // INNER .numfinger wrapper — otherwise ".opt-cell .numfinger x" selectors wouldn't match.
  const c = document.createElement("div");
  // hand art exists only for 1..5; beyond that fingerCount would fall back to a SECOND numeral
  // (numeral shown twice — hit when the counting range grew to 10), so skip the hand entirely.
  c.innerHTML = `<div class="numfinger"><span class="num-glyph">${devNumeral(n)}</span>${(n>=1&&n<=5) ? fingerCount(n, "nf-hand") : ""}</div>`;
  return c;
}
function stimulusCountSet(count, obj, scatter, perRow){
  // counts >10 render DENSE (smaller objects, wrapping); perRow groups the set in rows of exactly
  // N (the curriculum's "rows of 5/10" organisation for sets up to 20 — MTKGA01_L01_S04).
  const dense = count > 10 || !!perRow;
  const el = document.createElement("div"); el.className = "count-set" + (scatter ? " scattered" : "") + (dense ? " dense" : "");
  if(perRow && !scatter){ el.style.display = "grid"; el.style.gridTemplateColumns = `repeat(${perRow}, auto)`; }
  for(let i=0;i<count;i++){
    const c = document.createElement("span"); c.className = "cobj";
    // SCATTERED arrangement (SME/misconception: "total changes when objects are scattered") —
    // deterministic per-index jitter (stable across mounts/captures), never so large items overlap-hide.
    if(scatter) c.style.transform = `translateY(${((i*23)%25)-12}px) rotate(${((i*37)%21)-10}deg)`;
    c.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji");
    el.appendChild(c);
  }
  return el;
}
/* SME (S01 review deck): outside the tutorial, numeral options show the NUMBER ONLY, larger —
   no finger-hand support (fingers are a TEACHING aid, not a test aid). */
function bigNumCell(n){
  const c = document.createElement("div");
  c.innerHTML = `<span class="bignum-glyph">${devNumeral(n)}</span>`;
  return c;
}
/* COMPARE_SETS helpers (one-to-one matching → ज़्यादा / कम / बराबर).
   Two left-aligned rows (columns line up), a dashed connector drawn top[i]↔bottom[i]
   for each matched pair, and the unmatched leftover item(s) in the longer row glow —
   that glow IS the "which has more" proof. Offsets (not getBoundingClientRect) so it
   works even when the preview tab is throttled. */
function cmpObj(obj){
  const c = document.createElement("span"); c.className = "cobj";
  c.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji");
  return c;
}
function stimulusCompareSets(data){
  const nA = data.a_count, nB = data.b_count, A = data.a_object, B = data.b_object;
  const NS = "http://www.w3.org/2000/svg";
  const stage = document.createElement("div"); stage.className = "compare-stage";
  const rowA = document.createElement("div"); rowA.className = "cmp-row top";
  const rowB = document.createElement("div"); rowB.className = "cmp-row bot";
  const svg  = document.createElementNS(NS, "svg"); svg.setAttribute("class", "cmp-lines");
  for(let i=0;i<nA;i++) rowA.appendChild(cmpObj(A));
  for(let i=0;i<nB;i++) rowB.appendChild(cmpObj(B));
  stage.appendChild(rowA); stage.appendChild(svg); stage.appendChild(rowB);
  const btn = document.createElement("button"); btn.type = "button"; btn.className = "cmp-match-btn";
  btn.textContent = "🔗 मिलाओ"; stage.appendChild(btn);
  const min = Math.min(nA, nB);
  let drawn = false;
  function draw(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    const IA = [...rowA.children], IB = [...rowB.children];
    const y1 = rowA.offsetTop + rowA.offsetHeight - 4;
    const y2 = rowB.offsetTop + 4;
    for(let i=0;i<min;i++){
      const x = IA[i].offsetLeft + IA[i].offsetWidth/2;
      const ln = document.createElementNS(NS, "line");
      ln.setAttribute("x1", x); ln.setAttribute("y1", y1);
      ln.setAttribute("x2", x); ln.setAttribute("y2", y2);
      ln.setAttribute("class", "cmp-line"); svg.appendChild(ln);
      setTimeout(()=> ln.classList.add("show"), 130*i);
    }
    const longer = nA > nB ? IA : nB > nA ? IB : null;   // null when equal (nothing left over)
    if(longer) for(let i=min;i<longer.length;i++)
      setTimeout(()=> longer[i].classList.add("leftover"), 130*min + 160);
  }
  // reveal the matching (child taps मिलाओ, or the hint/tutorial calls this). cb fires after it settles.
  stage._revealMatches = (cb)=>{ if(!drawn){ drawn = true; btn.disabled = true; draw(); }
    if(cb) setTimeout(cb, 130*min + 800); };
  btn.onclick = ()=> stage._revealMatches();
  if(data.show_matches){ btn.style.display = "none"; setTimeout(()=> stage._revealMatches(), 420); }
  return stage;
}
/* HINT for "how many": instead of a text popup, COUNT the set FOR the child —
   highlight each object left→right, say एक/दो/तीन, show the numeral on top of it.
   The child sees + hears the count modelled, then answers from the options. */
function demoCount(items, numerals, onDone){
  numerals = numerals || [];
  const clear = ()=> items.forEach(o=>{ o.classList.remove("counting"); const c=o.querySelector(".count-callout"); if(c) c.remove(); });
  clear();
  let i = 0;
  (function step(){
    if(i >= items.length){                       // last count landed → clear, then continue
      setTimeout(()=>{ clear(); if(onDone) onDone(); }, 1000);
      return;
    }
    const o = items[i];
    o.classList.add("counting");
    let cal = o.querySelector(".count-callout");
    if(!cal){ cal = document.createElement("span"); cal.className = "count-callout"; o.appendChild(cal); }
    cal.textContent = String(i+1);   // Arabic count callout; Hindi number-word is spoken separately
    play("assets/voiceover/vo_num_" + (i+1) + "." + AUDIO_EXT, ()=>{ i++; setTimeout(step, 320); });
  })();
}
function demoCountSet(setEl, count, numerals, onDone){   // count the "how many?" stimulus set
  demoCount([...setEl.querySelectorAll(".cobj")].slice(0, count), numerals, onDone);
}

/* ---------- 10b. DEVANAGARI GLYPH INK-CENTERING ----------
   Devanagari glyphs carry matras above (ओ, औ, अं) and below (ऋ) the shirorekha,
   so plain flex `align-items:center` leaves them sitting high with a gap below —
   and the offset differs per glyph. Measure each glyph's real ink box (canvas
   actualBoundingBox) + its baseline in the DOM, then translateY so the INK is
   truly centred in its tile/box. Font-agnostic; recomputed on mount + fonts.ready. */
let _inkCtx = null;
function centerInkGlyph(span){
  if(!span || !span.parentElement) return;
  const glyph = (span.textContent || "").trim();
  if(!glyph) return;
  const box = span.parentElement;
  const cs = getComputedStyle(span);
  const fpx = parseFloat(cs.fontSize);
  if(!fpx) return;
  _inkCtx = _inkCtx || document.createElement("canvas").getContext("2d");
  _inkCtx.font = `${cs.fontWeight} ${fpx}px ${cs.fontFamily}`;
  const m = _inkCtx.measureText(glyph);
  const a = m.actualBoundingBoxAscent, d = m.actualBoundingBoxDescent;
  if(!isFinite(a) || !isFinite(d)) return;
  const scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
  span.style.transform = "";   // reset before measuring baseline
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;";
  span.appendChild(probe);
  const baseScreen = probe.getBoundingClientRect().top;
  span.removeChild(probe);
  const br = box.getBoundingClientRect();
  if(br.height < 5) return;    // not laid out yet
  const boxCenter = br.top + br.height/2;
  const inkCenter = baseScreen + ((d - a)/2) * scale;   // screen px
  const dy = (boxCenter - inkCenter) / scale;           // css px to move glyph down
  span.style.transform = `translateY(${dy}px)`;
}
function centerAllGlyphs(root){
  (root || document).querySelectorAll(".ink-glyph").forEach(centerInkGlyph);
}

/* ---------- 11. DRAG-DROP PRIMITIVE ---------- */
function makeDraggable(tileEl, onDrop){
  let startX=0, startY=0, dx=0, dy=0, dragging=false;
  let scale = 1;
  const refScale = ()=> scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
  function onDown(e){
    if(tileEl.classList.contains("snapped") || tileEl.classList.contains("matched")) return;
    refScale();
    dragging = true;
    // bind move/up on the document ONLY while dragging (removed in onUp) — otherwise every tile leaves
    // stale document listeners that pile up across the 11 drag slides.
    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove, {passive:false});
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    const p = e.touches ? e.touches[0] : e;
    startX = p.clientX; startY = p.clientY;
    dx = 0; dy = 0;
    tileEl.classList.add("dragging");
    e.preventDefault();
  }
  function onMove(e){
    if(!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    dx = (p.clientX - startX) / scale; dy = (p.clientY - startY) / scale;
    tileEl.style.transform = `translate(${dx}px,${dy}px) scale(1.08)`;
    // highlight zone under — hide the tile from hit-testing so the dragged tile
    // (z-index 50, now covering the zone) doesn't mask the zone beneath it.
    const cx = p.clientX, cy = p.clientY;
    document.querySelectorAll(".dd-zone").forEach(z => z.classList.remove("hover"));
    tileEl.style.pointerEvents = "none";
    const under = document.elementFromPoint(cx, cy);
    tileEl.style.pointerEvents = "";
    const zone = under?.closest?.(".dd-zone");
    if(zone && !zone.classList.contains("filled")) zone.classList.add("hover");
    e.preventDefault();
  }
  function onUp(e){
    if(!dragging) return;
    dragging = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("mouseup", onUp);
    document.removeEventListener("touchend", onUp);
    tileEl.classList.remove("dragging");
    const p = e.changedTouches ? e.changedTouches[0] : e;
    // hide the tile from hit-testing so we detect the zone underneath it
    tileEl.style.pointerEvents = "none";
    const under = document.elementFromPoint(p.clientX, p.clientY);
    tileEl.style.pointerEvents = "";
    const zone = under?.closest?.(".dd-zone");
    document.querySelectorAll(".dd-zone").forEach(z => z.classList.remove("hover"));
    if(zone && !zone.classList.contains("filled")){
      // snap
      tileEl.style.transform = "";
      onDrop(zone, tileEl);
    } else {
      tileEl.style.transform = "";
    }
  }
  tileEl.addEventListener("mousedown", onDown);
  tileEl.addEventListener("touchstart", onDown, {passive:false});
}
/* shared wrong-drop response for drag/sort/sequence modules: soft buzz + Swiftie try-again pose + the
   authored spoken "try_again". Pre-readers need the SPOKEN recovery, not just the visual spring-back. */
function dragWrong(slide){ sfxWrongSoft(); setSwMood("tryagain"); play(audioFor(slide, "try_again") || null, ()=>{}); }

/* ---------- 11b. MEASUREMENT ART KIT (assets/mk_*) ----------------------
   The kit sheet cut for this card: tables, the unit block in four states
   (idle / placed / ghost / glow), start+end measure markers, the two wrong-way
   figures (gap, overlap), a success sparkle, a re-usable result plate and seven
   full-body Swiftie poses. It is wired here rather than inside each module so
   DEMO_COUNT / MAKE_SET / COUNT_HOW_MANY all pick the same visual language up.

   The pedagogy drives the art: this skill is "units laid in ONE ROW, WITH NO
   GAPS". So the kit lays its blocks FLUSH (.mk-rail) and names the two ways a
   child gets it wrong - a gap, or an overlap - with the sheet's own figures. */
const MK = {
  block:  "mk_block",        placed: "mk_block_placed",
  ghost:  "mk_block_ghost",  glow:   "mk_block_glow",
  mStart: "mk_marker_start", mEnd:   "mk_marker_end",
  errGap: "mk_err_gap",      errOver:"mk_err_overlap",
  sparkle:"mk_sparkle",      plate:  "mk_badge_blank",
  sw: { idle:"mk_sw_idle", explain:"mk_sw_explain", count:"mk_sw_count", think:"mk_sw_think",
        celebrate:"mk_sw_celebrate", guide:"mk_sw_guide", cheer:"mk_sw_cheer" }
};
const mkSrc = (id)=> "assets/" + id + "." + IMG_EXT;
/* is this a measuring slide? = the card gave it an object laid along a scene object */
function mkIsMeasure(slide){
  return !!(slide && slide.data && slide.data.object && slide.data.object.img &&
            String(slide.data.object.img).indexOf("mk_block") === 0);
}
/* swap a laid block between its states without re-rendering the tile */
function mkSetBlockState(itemEl, stateId){
  const img = itemEl && itemEl.querySelector(".cobj-img, .ms-obj-img");
  if(img && img.tagName === "IMG") img.src = mkSrc(stateId);
}
/* the kit's glow sprite, flashed over a block the instant it is laid/counted */
function mkGlow(itemEl){
  if(!itemEl) return;
  const g = document.createElement("img");
  g.className = "mk-glow"; g.src = mkSrc(MK.glow); g.alt = "";
  itemEl.appendChild(g);
  setTimeout(()=> g.remove(), 620);
}
/* START / END markers bracketing the thing being measured - the sheet's
   mk_table_markers page, generalised to whatever object the slide names. */
function mkAddMarkers(figEl){
  if(!figEl || figEl.querySelector(".mk-marker")) return;
  const mk = (cls, id)=>{ const i = document.createElement("img");
    i.className = "mk-marker " + cls; i.src = mkSrc(id); i.alt = ""; i.setAttribute("aria-hidden","true");
    i.onerror = function(){ this.remove(); }; return i; };
  figEl.classList.add("mk-measured");
  figEl.insertBefore(mk("mk-marker-s", MK.mStart), figEl.firstChild);
  figEl.appendChild(mk("mk-marker-e", MK.mEnd));
}
/* the result plate: "<n> \u092c\u094d\u0932\u0949\u0915\u094d\u0938" on the kit's own badge, + the sparkle burst.
   The sheet ships the plate with "6" baked in; the text is lifted off it once
   (mk_badge_blank) so every count 1..9 this card uses can reuse the same art. */
/* Both overlays FLOAT inside .slide-stage rather than joining the slide's flex
   column. That column is `flex:1;min-height:0` all the way down, so anything
   added to it steals height from the scene art above - which pulled the table
   up into the prompt. Absolute + anchored leaves every module's layout alone. */
function mkFloatHost(){ return document.querySelector(".slide-stage"); }
function mkClearFloats(){
  const h = mkFloatHost(); if(!h) return;
  h.querySelectorAll(".mk-result, .mk-errflash").forEach(n => n.remove());
}
/* Park `el` NEXT TO `anchorEl` if the gutter beside it is wide enough, else
   under it. Docking beside is preferred because "under" lands on the आगे button
   on the narrow modules, and the plate must never cover the control the child
   needs next. Measured after paint, so the element must already be in the DOM. */
function mkFloatBeside(el, anchorEl, gutter){
  const h = mkFloatHost(); if(!h) return;
  const hb = h.getBoundingClientRect();
  const ab = (anchorEl && anchorEl.getBoundingClientRect) ? anchorEl.getBoundingClientRect() : null;
  const w  = el.offsetWidth || 300, hh = el.offsetHeight || 110;
  const PAD = (gutter === undefined) ? 18 : gutter;
  if(ab){
    const freeRight = hb.right - ab.right;
    if(freeRight >= w + PAD * 2){                       // dock to the right of the anchor
      el.style.left = (ab.right - hb.left + PAD + w / 2) + "px";
      el.style.top  = Math.max(8, Math.min(ab.top - hb.top + (ab.height - hh) / 2, hb.height - hh - 8)) + "px";
      return;
    }
  }
  el.style.left = "50%";                                // otherwise: centred, just below
  const top = ab ? (ab.bottom - hb.top + 12) : (hb.height * 0.6);
  el.style.top = Math.max(8, Math.min(top, hb.height - hh - 8)) + "px";
}
/* re-place once each sprite has decoded - an undecoded <img> measures 0 wide,
   which would put the plate in the wrong gutter on a cold cache */
function mkPlace(el, anchorEl){
  mkFloatBeside(el, anchorEl);
  const imgs = el.tagName === "IMG" ? [el] : [...el.querySelectorAll("img")];
  imgs.forEach(im => { if(!im.complete) im.addEventListener("load", ()=> mkFloatBeside(el, anchorEl), { once:true }); });
}
function mkShowResult(anchorEl, n){
  const host = mkFloatHost(); if(!host || host.querySelector(".mk-result")) return null;
  const wrap = document.createElement("div"); wrap.className = "mk-result";
  wrap.innerHTML =
    '<img class="mk-sparkle" src="' + mkSrc(MK.sparkle) + '" alt="" aria-hidden="true">' +
    '<div class="mk-badge"><img class="mk-badge-plate" src="' + mkSrc(MK.plate) + '" alt="" aria-hidden="true">' +
      '<span class="mk-badge-text">' + devNumeral(n) + ' \u092c\u094d\u0932\u0949\u0915\u094d\u0938</span></div>';
  host.appendChild(wrap);
  mkPlace(wrap, anchorEl);
  requestAnimationFrame(()=> wrap.classList.add("in"));
  return wrap;
}
/* Which wrong-way figure fits this mistake? Too few units => the child left a
   GAP; too many => they OVERLAPPED. Straight off the kit sheet, and exactly the
   +/-1 misconception this card's distractors are built from (see README). */
function mkErrFigure(made, target){
  return made < target ? MK.errGap : MK.errOver;
}
/* flash that figure beside the laid row (inline cue - no popup), once at a time */
function mkFlashErr(nearEl, figId){
  const host = mkFloatHost(); if(!host) return;
  const prev = host.querySelector(".mk-errflash"); if(prev) prev.remove();
  const f = document.createElement("img");
  f.className = "mk-errflash"; f.src = mkSrc(figId); f.alt = ""; f.setAttribute("aria-hidden","true");
  f.onerror = function(){ this.remove(); };
  host.appendChild(f);
  mkPlace(f, nearEl);
  requestAnimationFrame(()=> f.classList.add("in"));
  setTimeout(()=>{ f.classList.remove("in"); setTimeout(()=> f.remove(), 320); }, 2400);
}

/* shared SUCCESS response — the engine-wide answer-feedback standard (lead-confirmed): side confetti
   cannons + rising sfx + Swiftie celebrates + the authored "correct" VO, then AUTO-ADVANCE. Never a
   celebration popup, never a "press आगे to continue" gate on a solved activity. `revealed` = the child
   got there via the reveal scaffold → quieter settle (no confetti/cheer) + completeSlide(false) so
   mastery telemetry stays honest. */
function celebrateThenAdvance(slide, revealed){
  if(revealed){ play(audioFor(slide, "reveal") || null, ()=>{}); setTimeout(()=> completeSlide(false), 1400); return; }
  sfxCorrect(); confettiCannon(); setSwMood("celebrate");
  play(audioFor(slide, "correct") || null, ()=>{});
  setTimeout(()=> completeSlide(true), 1400);
}

/* ---------- 12. SLIDE MODULES ---------- */
const SlideModules = {
  INTRO: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "intro-stage";
      const letters = slide.data.letters;
      const tapped = new Set();
      const tiles = [];
      // [16f] Size tiles to the REAL container: the r4 tut-card frame is ~990px inside (the old
      // math assumed 1220 + a -100px breakout and punched 10-card strips through the frame borders
      // — user-caught live on MTKGA01_L02_S01 s00; same root as the HIKGH04_P2 letter row).
      // Fit one row at MAXW=960; if tiles would drop below the 110px touch floor, WRAP into two
      // balanced rows (numerals 0-9 → fives-structure 0-4 / 5-9) sized to the wider row.
      const GAP = 20, MAXW = 960, n = letters.length;
      let rowsOf;
      let tSize = Math.min(184, Math.floor((MAXW - (n-1)*GAP) / n));
      if (tSize >= 110) { rowsOf = [n]; }
      else {
        const top = Math.ceil(n/2), bot = n - top;
        tSize = Math.min(184, Math.floor((MAXW - (top-1)*GAP) / top));
        rowsOf = [top, bot];
      }
      const tFont = Math.round(tSize * 0.565);
      const rowEls = rowsOf.map(() => {
        const r = document.createElement("div"); r.className = "intro-letters";
        r.style.gap = GAP + "px"; return r;
      });
      const rowFor = i => (rowsOf.length === 1 || i < rowsOf[0]) ? rowEls[0] : rowEls[1];
      // hand-nudge points at the first letter not yet tapped — guides every box
      function nudgeNext(){
        for(let i=0;i<letters.length;i++){
          if(!tapped.has(letters[i])){ pointNudgeAt(tiles[i]); return; }
        }
        stopNudge();
      }
      letters.forEach((L, i) => {
        const tile = document.createElement("div"); tile.className = "intro-letter";
        tile.style.width = tile.style.height = tSize + "px";
        tile.style.fontSize = tFont + "px";
        tile.innerHTML = `<span class="ink-glyph">${L}</span>`;
        tile.onclick = ()=>{
          if(slide.data.auto) return;   // [16h] Phase-1 autonomous mode: the demo plays itself
          tile.classList.add("played");
          const phon = slide.data.phonemes && slide.data.phonemes[L];
          play(phon ? "assets/voiceover/" + phon + "." + AUDIO_EXT : null);
          GameBus.emit("intro_letter_tap", { slide_id: slide.id, letter: L });
          tapped.add(L);
          // नav unlocks only after EVERY letter has been heard
          if(tapped.size >= letters.length){ stopNudge(); setNavActive(true); }
          else { nudgeNext(); }
        };
        rowFor(i).appendChild(tile); tiles.push(tile);
      });
      rowEls.forEach(r => wrap.appendChild(r));
      host.appendChild(wrap);

      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(tapped.size >= letters.length) completeSlide(true); };
      nudgeNext();
      // [16h] Phase-1 autonomous mode (lead's 3-phase contract): tiles highlight + speak one by
      // one BY THEMSELVES; the child watches/listens. आगे unlocks after the last one.
      if(slide.data.auto){
        stopNudge(); state.ownsAudio = true;
        let ai = 0;
        const aStep = ()=>{
          if(CARD.slides[state.idx] !== slide) return;
          if(ai >= letters.length){ stopNudge(); $("navBtn").onclick = ()=> completeSlide(true); setNavActive(true); return; }
          const L = letters[ai], tile = tiles[ai];
          tile.classList.add("played"); pointNudgeAt(tile);
          const phon = slide.data.phonemes && slide.data.phonemes[L];
          ai++;
          play(phon ? "assets/voiceover/" + phon + "." + AUDIO_EXT : null, ()=> setTimeout(aStep, 380));
        };
        play(audioFor(slide, "prompt") || null, ()=> setTimeout(aStep, 500));
      }   // start by guiding the first letter
    }
  },

  MEET_LETTER: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "meet-stage";
      if(slide.data.pair){
        const pair = document.createElement("div"); pair.className = "meet-pair";
        slide.data.pair.forEach(p => {
          const item = document.createElement("div"); item.className = "meet-pair-item";
          item.innerHTML = `
            <div class="meet-letter-box"><span class="glyph ink-glyph">${p.letter}</span></div>
            <div class="meet-arrow">→</div>
            <div class="meet-pic-box">
              ${imgOrEmoji(p.picture_img, p.picture_emoji, "pic-img", "pic-emoji")}
              <span class="pic-label">${p.word_hi}</span>
            </div>`;
          pair.appendChild(item);
        });
        wrap.appendChild(pair);
      } else {
        wrap.innerHTML = `
          <div class="meet-letter-box"><span class="glyph ink-glyph">${slide.data.letter}</span></div>
          <div class="meet-arrow">→</div>
          <div class="meet-pic-box">
            ${imgOrEmoji(slide.data.picture_img, slide.data.picture_emoji, "pic-img", "pic-emoji")}
            <span class="pic-label">${slide.data.word_hi}</span>
          </div>`;
      }
      host.appendChild(wrap);
      // नav unlocks only after the VO has played once (students can't skip the model)
      state.gateNavUntilAudio = true;
      setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  /* ===== SHAPES (maths) — reuse the same scaffold/nudge/feedback as letters ===== */
  SHAPE_INTRO: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "intro-stage";
      const row  = document.createElement("div"); row.className = "intro-shapes";
      const shapes = slide.data.shapes; const tapped = new Set(); const tiles = [];
      const GAP = 28, MAXW = 1220, n = shapes.length;
      const tSize = Math.max(120, Math.min(184, Math.floor((MAXW - (n-1)*GAP) / n)));
      row.style.gap = GAP + "px";
      function nudgeNext(){
        for(let i=0;i<shapes.length;i++){ if(!tapped.has(i)){ pointNudgeAt(tiles[i]); return; } }
        stopNudge();
      }
      shapes.forEach((sh, i) => {
        const tile = document.createElement("div"); tile.className = "intro-shape";
        tile.style.width = tile.style.height = tSize + "px";
        // name label (revealed on tap — child hears the name AND sees it on top of the shape)
        tile.innerHTML = `<span class="shape-name">${sh.name || ""}</span>` +
                         shapeSVG(sh.shape, {color: sh.color, size: Math.round(tSize*0.62), rotate: sh.rotate});
        tile.onclick = ()=>{
          tile.classList.add("played");
          play(sh.name_audio ? "assets/voiceover/" + sh.name_audio + "." + AUDIO_EXT : null);
          GameBus.emit("intro_shape_tap", { slide_id: slide.id, shape: sh.shape });
          tapped.add(i);
          if(tapped.size >= shapes.length){ stopNudge(); setNavActive(true); }
          else { nudgeNext(); }
        };
        row.appendChild(tile); tiles.push(tile);
      });
      wrap.appendChild(row); host.appendChild(wrap);
      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(tapped.size >= shapes.length) completeSlide(true); };
      nudgeNext();
    }
  },

  MEET_SHAPE: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "meet-stage";
      wrap.innerHTML = `
        <div class="meet-shape-box">
          ${shapeSVG(slide.data.shape, {color: slide.data.color, size: 190, rotate: slide.data.rotate})}
          <span class="label">${slide.data.name}</span>
        </div>
        <div class="meet-arrow">→</div>
        <div class="meet-pic-box">
          ${imgOrEmoji(slide.data.object_img, slide.data.object_emoji, "pic-img", "pic-emoji")}
          <span class="pic-label">${slide.data.object_hi}</span>
        </div>`;
      host.appendChild(wrap);
      state.gateNavUntilAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  TAP_SHAPE_BY_NAME: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "shape_name_first_try",
        stimulus: (()=> {
          const el = document.createElement("div"); el.className = "stimulus-pic"; el.style.cursor = "pointer";
          el.innerHTML = `<span class="emoji">🔊</span><span class="lbl">${slide.data.name || "नाम सुनो"}</span>`;
          el.onclick = ()=>{ state.audioReplays++; play(audioFor(slide,"shape_name") || null); };
          return el;
        })(),
        options: slide.data.options,
        isCorrect: (opt) => opt.shape === slide.data.target,
        optionRenderer: (opt) => shapeCell(opt)
      });
    }
  },

  TAP_SHAPE_BY_PICTURE: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "shape_env_first_try",
        stimulus: stimulusPic(slide.data.object_hi, slide.data.object_emoji, slide.data.object_img),
        options: slide.data.options,
        isCorrect: (opt) => opt.shape === slide.data.target,
        optionRenderer: (opt) => shapeCell(opt)
      });
    }
  },

  TAP_PICTURE_BY_SHAPE: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "shape_object_first_try",
        stimulus: stimulusShape({shape: slide.data.shape, color: slide.data.color, rotate: slide.data.rotate}),
        options: slide.data.options,
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => pictureCell(opt.object_hi, opt.object_emoji, opt.object_img)
      });
    }
  },

  SORT_SHAPE: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "sort-stage shape-sort";
      const binsRow = document.createElement("div");
      binsRow.className = "sort-bins" + (slide.data.bins.length >= 4 ? " many" : "");
      slide.data.bins.forEach(b => {
        const bin = document.createElement("div");
        bin.className = "sort-bin dd-zone";            // dd-zone → drop detection
        bin.dataset.shape = b.shape;
        // header (faint reference shape + label) INSIDE the box, then a clear drop area
        bin.innerHTML = `<div class="bin-head-row"><span class="bin-ref">${shapeSVG(b.shape, {color:"#AEB9CC", size:34})}</span><span class="bin-title">${b.label}</span></div>`+
          `<div class="bin-items"></div>`;
        binsRow.appendChild(bin);
      });
      const tray = document.createElement("div"); tray.className = "sort-tray";
      const items = slide.data.items.slice().sort(()=> Math.random() - 0.5);
      items.forEach(it => {
        const t = document.createElement("div"); t.className = "sort-item"; t.dataset.shape = it.shape;
        t.innerHTML = shapeSVG(it.shape, {color: it.color, size: 70, rotate: it.rotate});
        tray.appendChild(t);
      });
      wrap.appendChild(binsRow); wrap.appendChild(tray);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      let placed = 0; const need = slide.data.items.length;
      [...tray.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          const bin = zone.closest(".sort-bin"); if(!bin) return;
          state.attempts++;
          if(bin.dataset.shape === t.dataset.shape){
            t.classList.add("snapped");
            bin.querySelector(".bin-items").appendChild(t);
            placed++;
            GameBus.emit("shape_sort_item", { slide_id: slide.id, shape: t.dataset.shape, attempts: state.attempts });
            if(placed === need){
              state.locked = true;
              GameBus.emit("shape_sort_correct", {
                slide_id: slide.id, phase: slide.phase, value: true,
                attempts: state.attempts, latency_ms: Date.now() - state.slideStart
              });
              setTimeout(()=> celebrateThenAdvance(slide, false), 250);   // standard: confetti + VO + auto-advance, no popup
            }
          } else {
            bin.classList.add("hover"); bin.style.borderColor = "var(--wrong)";
            setTimeout(()=>{ bin.classList.remove("hover"); bin.style.borderColor = ""; }, 500);
            dragWrong(slide);   // buzz + Swiftie + spoken try_again (pre-readers need the spoken recovery)
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          }
        });
      });
    }
  },

  /* ===== COUNTING (maths) — OTO tap-count, cardinality, meet-number, make-set ===== */
  COUNT_TAP: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "count-stage";
      const row  = document.createElement("div"); row.className = "count-row";
      const N = slide.data.count, obj = slide.data.object, nums = slide.data.numerals || [];
      // large sets (S04, up to 20): smaller tiles + optional rows-of-N grouping (curriculum: rows of 5/10)
      if(N > 10 || slide.data.per_row) row.classList.add("dense");
      if(slide.data.per_row){ row.style.display = "grid"; row.style.gridTemplateColumns = `repeat(${slide.data.per_row}, auto)`; }
      const items = []; let c = 0;
      for(let i=0;i<N;i++){
        const it = document.createElement("div"); it.className = "count-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        row.appendChild(it); items.push(it);
      }
      wrap.appendChild(row); host.appendChild(wrap);

      function nudgeNext(){ const nx = items.find(x=>!x.classList.contains("counted")); if(nx) pointNudgeAt(nx); else stopNudge(); }
      items.forEach(it => {
        it.onclick = ()=>{
          if(it.classList.contains("counted")) return;   // one-to-one: never double-count
          c++; it.classList.add("counted");
          it.querySelector(".count-badge").textContent = String(c);   // Arabic running count; Hindi word spoken separately
          GameBus.emit("count_tap", { slide_id: slide.id, phase: slide.phase, n: c });
          if(c >= N){
            stopNudge();
            GameBus.emit("count_oto_complete", { slide_id: slide.id, phase: slide.phase,
              total: N, value: true, latency_ms: Date.now()-state.slideStart });
            // say the LAST number, then the total; enable आगे ONLY after "कुल N" finishes
            play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT, ()=> setTimeout(()=>
              play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT, ()=> setNavActive(true)), 300));
          } else {
            play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT);    // one number word per touch
            nudgeNext();
          }
        };
      });
      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(c >= N) completeSlide(true); };
      nudgeNext();
    }
  },

  CONSERVE_COUNT: {
    // MTKGA01_L01_S03 "the LAST counted number IS the total" + its core misconception ("the total
    // changes when objects move"). One slide, two beats: (A) the child tap-counts the set one-to-one
    // (badges + spoken एक/दो/…, ending "कुल N" — the freeze-the-final-number teach), then (B) the SAME
    // objects visibly MOVE to scattered spots (badges clear), the move line asks "अब कितनी हैं?" and
    // numeral options appear — correct is the SAME N; options include N±1 (the moved-so-changed error).
    // data:{count, object, numerals, options:[{value,audio}]} · audio:{prompt, move, try_again, hint, reveal}.
    // GENERALISED count-then-pick engine (S03 conservation + S02's tap-count items). One slide:
    // tap-count the set one-to-one (badges + spoken एक/दो/… → frozen "कुल N"), then numeral options.
    // data: {count, object, options, arrange?("row"|"scatter"|"circle"|"two_groups"), groups?[a,b],
    //        move?(default true = objects drift after counting; false = count-then-pick, no drift)}.
    // move:false emits cardinality_first_try; move:true emits conserve_count_first_try.
    mount(host, slide){
      const d = slide.data, N = d.count, obj = d.object;
      const arrange = d.arrange || "row";
      const doMove  = d.move !== false;
      state.ownsAudio = true; setNavActive(false);
      const wrap = document.createElement("div"); wrap.className = "count-stage conserve";
      const row  = document.createElement("div"); row.className = "count-row arr-" + arrange + (N > 8 ? " dense" : "");
      const items = []; let c = 0;
      const mkItem = ()=>{ const it = document.createElement("div"); it.className = "count-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        items.push(it); return it; };
      if(arrange === "two_groups"){
        const g = d.groups || [Math.ceil(N/2), Math.floor(N/2)];
        g.forEach((gn, gi)=>{ const cl = document.createElement("div"); cl.className = "count-cluster";
          for(let i=0;i<gn;i++) cl.appendChild(mkItem()); row.appendChild(cl);
          if(gi === 0){ const plus = document.createElement("div"); plus.className = "count-plus"; plus.textContent = "और"; row.appendChild(plus); } });
      } else if(arrange === "circle"){
        for(let i=0;i<N;i++){ const it = mkItem(); const a = -Math.PI/2 + i*2*Math.PI/N, R = N > 6 ? 176 : 140;
          it.style.position = "absolute";
          it.style.left = `calc(50% + ${Math.round(Math.cos(a)*R)}px)`;
          it.style.top  = `calc(50% + ${Math.round(Math.sin(a)*R)}px)`;
          it.style.marginLeft = "-48px"; it.style.marginTop = "-48px"; row.appendChild(it); }
      } else {
        for(let i=0;i<N;i++){ const it = mkItem();
          if(arrange === "scatter") it.style.transform = `translateY(${((i*23)%25)-12}px) rotate(${((i*37)%21)-10}deg)`;
          row.appendChild(it); }
      }
      wrap.appendChild(row); host.appendChild(wrap);
      const nudgeNext = ()=>{ const nx = items.find(x=>!x.classList.contains("counted")); if(nx) pointNudgeAt(nx); else stopNudge(); };
      const askOptions = ()=>{
        mountTapOptions({
          slide, host, signalName: doMove ? "conserve_count_first_try" : "cardinality_first_try",
          stimulus: null, nudgeTarget: null,
          options: d.options,
          columnsHint: Math.min(d.options.length, 5),
          isCorrect: (opt) => opt.value === N,
          optionRenderer: (opt) => slide.phase === "tutorial" ? numFingerCell(opt.value) : bigNumCell(opt.value),
          mastery: slide.phase === "mastery"
        });
      };
      const afterCount = ()=>{
        if(doMove){
          items.forEach((it,i)=>{ const keep = slide.phase === "tutorial" &&
              it.querySelector(".count-badge").textContent === String(N);
            if(!keep) it.querySelector(".count-badge").textContent = "";
            it.classList.add("moved");
            it.style.transform = `translate(${((i*53)%81)-40}px, ${((i*37)%61)-30}px) rotate(${((i*29)%25)-12}deg)`; });
          sfxTap();
          setTimeout(()=>{ play(audioFor(slide, "move") || null, ()=>{}); askOptions(); }, 950);
        } else {
          play(audioFor(slide, "ask") || null, ()=>{}); askOptions();
        }
      };
      items.forEach(it => {
        it.onclick = ()=>{
          if(it.classList.contains("counted") || it.classList.contains("moved")) return;   // one-to-one; inert once moved
          c++; it.classList.add("counted");
          it.querySelector(".count-badge").textContent = String(c);
          GameBus.emit("count_tap", { slide_id: slide.id, phase: slide.phase, n: c });
          if(c >= N){
            stopNudge();
            play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT, ()=> setTimeout(()=>
              play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT, ()=> setTimeout(afterCount, 450)), 300));
          } else {
            play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT);
            nudgeNext();
          }
        };
      });
      state.replayAudio = ()=> play(audioFor(slide, c >= N ? (doMove ? "move" : "ask") : "prompt") || null, ()=>{});
      play(audioFor(slide, "prompt") || null, ()=>{});
      nudgeNext();
    }
  },

  COUNT_ACTION: {
    // S02 themed tap-count: tap each object and it ENACTS to a target while counting — pop (balloon
    // vanishes), feed (flies to the monster's mouth), or basket (drops into the basket). After the last
    // one the frozen "कुल N" plays and numeral options appear. data:{count, object, options, theme
    // ("pop"|"feed"|"basket")}. audio:{prompt, ask, try_again, hint, reveal}.
    mount(host, slide){
      const d = slide.data, N = d.count, obj = d.object, theme = d.theme || "pop";
      state.ownsAudio = true; setNavActive(false);
      const wrap = document.createElement("div"); wrap.className = "count-stage act act-" + theme;
      let target = null;
      if(theme === "feed"){ target = document.createElement("div"); target.className = "act-target act-monster"; target.textContent = "👹"; wrap.appendChild(target); }
      if(theme === "basket"){ target = document.createElement("div"); target.className = "act-target act-basket";
        target.innerHTML = imgOrEmoji("obj_basket", "🧺", "act-basket-img", "act-basket-emoji"); wrap.appendChild(target); }
      const row = document.createElement("div"); row.className = "count-row act-row" + (N > 8 ? " dense" : "");
      const items = []; let c = 0;
      for(let i=0;i<N;i++){ const it = document.createElement("div"); it.className = "count-item act-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        row.appendChild(it); items.push(it); }
      wrap.appendChild(row); host.appendChild(wrap);
      const nudgeNext = ()=>{ const nx = items.find(x=>!x.classList.contains("done")); if(nx) pointNudgeAt(nx); else stopNudge(); };
      const askOptions = ()=>{ mountTapOptions({
        slide, host, signalName: "cardinality_first_try", stimulus: null, nudgeTarget: null,
        options: d.options, columnsHint: Math.min(d.options.length, 5),
        isCorrect: (opt) => opt.value === N,
        optionRenderer: (opt) => slide.phase === "tutorial" ? numFingerCell(opt.value) : bigNumCell(opt.value),
        mastery: slide.phase === "mastery" }); };
      items.forEach(it => {
        it.onclick = ()=>{
          if(it.classList.contains("done")) return;
          c++; it.classList.add("done", "act-go");   // act-go = fly/pop animation (theme-scoped CSS)
          it.querySelector(".count-badge").textContent = String(c);
          if(theme === "feed" && target) target.classList.add("chomp");
          sfxTap();
          GameBus.emit("count_tap", { slide_id: slide.id, phase: slide.phase, n: c });
          if(c >= N){
            stopNudge();
            play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT, ()=> setTimeout(()=>
              play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT, ()=> setTimeout(()=>{
                play(audioFor(slide, "ask") || null, ()=>{}); askOptions(); }, 450)), 300));
          } else { play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT); nudgeNext(); }
        };
      });
      state.replayAudio = ()=> play(audioFor(slide, c >= N ? "ask" : "prompt") || null, ()=>{});
      play(audioFor(slide, "prompt") || null, ()=>{});
      nudgeNext();
    }
  },

  COUNT_DRAG_MATCH: {
    // S02 drag items. mode "num_to_box": count the set, then DRAG the correct NUMBER CARD into the
    // answer box (#2, #9). mode "obj_to_num": count, then DRAG the object onto the correct NUMBER (#11).
    // data:{count, object, options:[{value}], mode}. audio:{prompt, ask, try_again, reveal}.
    mount(host, slide){
      const d = slide.data, N = d.count, obj = d.object, mode = d.mode || "num_to_box";
      state.ownsAudio = true; setNavActive(false);
      const wrap = document.createElement("div"); wrap.className = "count-stage dragmatch";
      const setRow = document.createElement("div"); setRow.className = "count-row show-set" + (N > 8 ? " dense" : "");
      const items = []; let c = 0;
      for(let i=0;i<N;i++){ const it = document.createElement("div"); it.className = "count-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        setRow.appendChild(it); items.push(it); }
      wrap.appendChild(setRow);
      const dz = document.createElement("div"); dz.className = "cdm-zone";   // built after counting
      const tray = document.createElement("div"); tray.className = "cdm-tray";
      wrap.appendChild(dz); wrap.appendChild(tray); host.appendChild(wrap);
      const nudgeNext = ()=>{ const nx = items.find(x=>!x.classList.contains("counted")); if(nx) pointNudgeAt(nx); else stopNudge(); };
      const settleWin = (revealed)=>{ state.locked = true;
        GameBus.emit("cardinality_first_try", { slide_id: slide.id, phase: slide.phase, value: !revealed, latency_ms: Date.now()-state.slideStart });
        celebrateThenAdvance(slide, revealed); };
      const buildDrag = ()=>{
        // shuffle the numeral options
        const opts = d.options.slice(); for(let i=opts.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [opts[i],opts[j]]=[opts[j],opts[i]]; }
        if(mode === "obj_to_num"){
          // number cards are the DROP ZONES; a single draggable object-chip is the tile
          dz.className = "cdm-numrow";
          opts.forEach(o=>{ const z = document.createElement("div"); z.className = "cdm-numzone dd-zone"; z.dataset.val = String(o.value);
            z.innerHTML = `<span class="bignum-glyph">${devNumeral(o.value)}</span>`; dz.appendChild(z); });
          const tile = document.createElement("div"); tile.className = "cdm-objtile";
          tile.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji"); tray.appendChild(tile);
          makeDraggable(tile, (zone)=>{ if(state.locked || !zone) return;
            if(parseInt(zone.dataset.val,10) === N){ zone.classList.add("filled","correct"); tile.classList.add("snapped"); settleWin(false); }
            else { zone.classList.add("wrong"); setTimeout(()=>zone.classList.remove("wrong"),500); dragWrong(slide);
              state.attempts=(state.attempts||0)+1; if(state.attempts>=(CARD.scaffold_rules.max_attempts||3)){ const zc=[...dz.children].find(z=>parseInt(z.dataset.val,10)===N); if(zc){zc.classList.add("filled","correct","reveal-glow"); tile.classList.add("snapped"); play(audioFor(slide,"reveal")||null,()=>{}); settleWin(true);} } }
          });
        } else {
          // one BOX is the drop zone; number cards are the draggable tiles
          dz.className = "cdm-box dd-zone"; dz.innerHTML = `<span class="cdm-box-q">?</span>`;
          opts.forEach(o=>{ const tile = document.createElement("div"); tile.className = "cdm-card"; tile.dataset.val = String(o.value);
            tile.innerHTML = `<span class="bignum-glyph">${devNumeral(o.value)}</span>`; tray.appendChild(tile);
            makeDraggable(tile, (zone)=>{ if(state.locked || zone !== dz) return;
              if(o.value === N){ dz.classList.add("filled","correct"); dz.innerHTML = `<span class="bignum-glyph">${devNumeral(N)}</span>`; tile.classList.add("snapped"); settleWin(false); }
              else { dz.classList.add("wrong"); setTimeout(()=>dz.classList.remove("wrong"),500); dragWrong(slide);
                state.attempts=(state.attempts||0)+1; if(state.attempts>=(CARD.scaffold_rules.max_attempts||3)){ dz.classList.add("filled","correct","reveal-glow"); dz.innerHTML=`<span class="bignum-glyph">${devNumeral(N)}</span>`; play(audioFor(slide,"reveal")||null,()=>{}); settleWin(true); } }
            });
          });
        }
        play(audioFor(slide, "ask") || null, ()=>{});
      };
      items.forEach(it => { it.onclick = ()=>{ if(it.classList.contains("counted")) return;
        c++; it.classList.add("counted"); it.querySelector(".count-badge").textContent = String(c);
        GameBus.emit("count_tap", { slide_id: slide.id, phase: slide.phase, n: c });
        if(c >= N){ stopNudge(); play("assets/voiceover/vo_num_"+c+"."+AUDIO_EXT, ()=> setTimeout(()=>
          play("assets/voiceover/vo_total_"+N+"."+AUDIO_EXT, ()=> setTimeout(buildDrag, 450)), 300)); }
        else { play("assets/voiceover/vo_num_"+c+"."+AUDIO_EXT); nudgeNext(); }
      }; });
      state.attempts = 0; state.locked = false;
      state.replayAudio = ()=> play(audioFor(slide, c >= N ? "ask" : "prompt") || null, ()=>{});
      play(audioFor(slide, "prompt") || null, ()=>{});
      nudgeNext();
    }
  },

  DEMO_COUNT: {
    // TUTORIAL TEACH, TAP-TO-COUNT ([QA 04] - was the [16h] autonomous count, which the FLN QA
    // checklist rejects: "tutorial intro is interactive, not auto-playing"). All N objects are
    // visible; after the prompt the hand points at the next one; each TAP counts it - a BIG running
    // count updates 1..N with vo_num_N; then the conclusion line plays and आगे unlocks.
    // NO options — never a test, and no wrong tap is possible (a tap always counts the next unit).
    // Zero (N=0): empty tray, straight to the conclusion. data:{count, object} audio:{prompt?, conclude}
    mount(host, slide){
      const d = slide.data, N = d.count, obj = d.object;
      state.ownsAudio = true; setNavActive(false); setSwMood("teach");
      const wrap = document.createElement("div"); wrap.className = "demo-stage";
      const counter = document.createElement("div"); counter.className = "demo-count";
      counter.textContent = N === 0 ? "0" : "";
      const row = document.createElement("div"); row.className = "count-row demo-row" + (N > 8 && !d.per_row ? " dense" : "");
      const measuring = mkIsMeasure(slide);
      if(measuring) row.classList.add("mk-rail");   // [kit] units laid flush - no gaps, which is the skill
      if(d.per_row){ row.classList.add("perrow"); row.style.gridTemplateColumns = `repeat(${d.per_row}, auto)`; }
      const items = [];
      for(let k = 0; k < N; k++){
        const it = document.createElement("div"); it.className = "count-item demo-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="count-badge"></span>`;
        row.appendChild(it); items.push(it);
      }
      if(N === 0){ row.classList.add("demo-empty"); }
      wrap.appendChild(counter); wrap.appendChild(row); host.appendChild(wrap);
      /* [QA 04] TUTORIAL INTRO IS INTERACTIVE, NOT AUTO-PLAYING. The count used to run by itself;
         now the CHILD taps each unit to hear it counted: after the prompt, the hand points (below)
         at the next unit, a tap counts it - "placed" face + glow, badge, big running numeral,
         vo_num_k - and the spoken numeral wears the white outline while its clip plays. Taps land
         in left-to-right order (any tap counts the NEXT unit, so the count is never out of order)
         and are ignored while a numeral is still being spoken. आगे unlocks only once every unit
         has been heard AND the conclusion line has played. */
      let i = 0, busy = true, finished = false;
      const tutPrompt = ()=> document.querySelector("#slideHost .tut-prompt");
      const conclude = ()=>{ stopNudge();
        /* [kit] the measurement lands on the sheet's own result plate - the count
           the child just made, restated as "<n> ब्लॉक्स" with the sparkle. */
        if(measuring && N > 0) mkShowResult(row, N);
        play(audioFor(slide, "conclude") || null, ()=>{ finished = true; setNavActive(true); }); };
      const nudgeNext = ()=>{ if(i < N) pointNudgeAt(items[i]); else stopNudge(); };
      const countNext = ()=>{
        if(CARD.slides[state.idx] !== slide || busy || i >= N) return;
        busy = true; stopNudge();
        const it = items[i];
        it.classList.add("counted", "demo-hit");
        /* [kit] a counted unit settles into its "placed" face and flashes the glow */
        if(measuring){ mkSetBlockState(it, MK.placed); mkGlow(it); }
        it.querySelector(".count-badge").textContent = String(i + 1);
        counter.textContent = String(i + 1);
        counter.classList.remove("demo-pop"); void counter.offsetWidth; counter.classList.add("demo-pop");
        counter.classList.add("speaking");
        i++;
        play("assets/voiceover/vo_num_" + i + "." + AUDIO_EXT, ()=>{
          counter.classList.remove("speaking"); busy = false;
          if(i >= N) setTimeout(conclude, 400); else nudgeNext();
        });
      };
      items.forEach(it => { it.style.cursor = "pointer"; it.onclick = countNext; });
      const tp0 = tutPrompt(); if(tp0) tp0.classList.add("speaking");
      play(audioFor(slide, "prompt") || null, ()=>{
        const tp = tutPrompt(); if(tp) tp.classList.remove("speaking");
        busy = false;
        if(N === 0) setTimeout(conclude, 400); else nudgeNext();
      });
      /* replay = the prompt again (or the conclusion once done). While it plays the prompt wears the
         outline; the child's next tap is held until it ends, and the hand returns to the next unit. */
      state.replayAudio = ()=>{
        if(finished || i >= N){ play(audioFor(slide, "conclude") || null, ()=>{}); return; }
        busy = true; stopNudge();
        const tp = tutPrompt(); if(tp) tp.classList.add("speaking");
        play(audioFor(slide, "prompt") || null, ()=>{ if(tp) tp.classList.remove("speaking"); busy = false; nudgeNext(); });
      };
    }
  },

  MEET_NUMBER: {
    mount(host, slide){
      if(slide.data && slide.data.present === "crane"){ return btCraneMeet(host, slide); }   // Block Town teach
      const wrap = document.createElement("div"); wrap.className = "meet-stage number-meet";
      const n = slide.data.count;
      // [16d] dual-code the numeral: hands for 1..5; for bigger numbers (teens) the Hindi number WORD.
      // Never the numeral twice — fingerCount's out-of-range fallback IS the numeral, which rendered
      // the "12 over 12" teach card the SME flagged on MTKGA01_L01_S04.
      const word = (slide.data.numerals || [])[n-1] || "";
      const second = (n>=1 && n<=5) ? fingerCount(n,'meet-hand') : (word ? `<span class="num-word">${word}</span>` : "");
      wrap.innerHTML = `
        <div class="meet-number-box"><span class="num-glyph">${n}</span>${second}</div>
        <div class="meet-arrow">→</div>`;
      // [16d] the teach set honors data.per_row (rows of 10 → a teen visibly reads as ten-and-ones)
      const setEl = stimulusCountSet(n, slide.data.object, false, slide.data.per_row);
      setEl.classList.add("meet-set");
      wrap.appendChild(setEl);
      host.appendChild(wrap);
      state.gateNavUntilAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  COUNT_HOW_MANY: {
    mount(host, slide){
      const setEl = stimulusCountSet(slide.data.count, slide.data.object, slide.data.scatter, slide.data.per_row);
      const measuring = mkIsMeasure(slide) && !slide.data.scatter;
      if(measuring) setEl.classList.add("mk-rail");   // [kit] a finished measurement = units laid flush
      mountTapOptions({
        slide, host, signalName: "cardinality_first_try",
        stimulus: setEl,
        /* [kit] the distractors here are +/-1 - i.e. exactly what a child gets by
           leaving a GAP (too few) or OVERLAPPING units (too many). A wrong tap
           names which of the two it was, using the sheet's own figure; a right
           tap lands on the result plate with the sparkle. */
        onWrong: measuring ? (opt)=>{ mkFlashErr(setEl, mkErrFigure(opt.value, slide.data.count)); } : undefined,
        onCorrect: measuring ? ()=>{ mkShowResult(setEl, slide.data.count); } : undefined,
        nudgeTarget: null,   // nothing to re-tap here → no idle hand
        options: slide.data.options,
        columnsHint: Math.min(slide.data.options.length, 5),
        isCorrect: (opt) => opt.value === slide.data.count,
        // SME (S01 review deck): finger-hands are a TUTORIAL teaching aid only — in guided/
        // independent/practice/mastery the options are the NUMBER ALONE, larger.
        optionRenderer: (opt) => slide.phase === "tutorial" ? numFingerCell(opt.value) : bigNumCell(opt.value),
        mastery: slide.phase === "mastery",
        // HINT = count the set FOR the child (highlight + say एक/दो/तीन + numeral on top)
        hintAction: (done) => demoCountSet(setEl, slide.data.count, slide.data.numerals, done)
      });
    }
  },

  PICK_SET_BY_NUMBER: {
    // SME-designed REVERSE how-many (S01 review deck, new pages): a big NUMBER is the stimulus;
    // the options are small OBJECT SETS — tap the set with that many. Speak-on-tap = each set's own
    // count line ("इसमें तीन चीज़ें हैं।"), which doubles as the SME's wrong-tap hint; the ladder then
    // runs try_again → hint → reveal-glow as everywhere. data:{target, options:[{count, object:{img,emoji},
    // audio, correct}]}.
    mount(host, slide){
      const d = slide.data;
      const stim = document.createElement("div"); stim.className = "psn-stimulus";
      stim.innerHTML = `<span class="psn-num">${devNumeral(d.target)}</span>`;
      mountTapOptions({
        slide, host, signalName: "pick_set_first_try",
        stimulus: stim,
        nudgeTarget: null,
        options: d.options,
        columnsHint: Math.min(d.options.length, 3),
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => {
          const c = document.createElement("div"); c.className = "psn-cell";
          let inner = "";
          for(let i=0;i<opt.count;i++) inner += `<span class="psn-obj">${imgOrEmoji(opt.object.img, opt.object.emoji, "psn-img", "psn-emoji")}</span>`;
          c.innerHTML = `<div class="psn-set">${inner}</div>`;
          return c;
        },
        mastery: slide.phase === "mastery"
      });
    }
  },

  MAKE_SET: {
    mount(host, slide){
      const N = slide.data.target, obj = slide.data.object;
      const wrap = document.createElement("div"); wrap.className = "makeset-stage";
      wrap.innerHTML = `
        <div class="makeset-target"><span class="ms-label">डालो</span><span class="num-glyph">${devNumeral(slide.data.target)}</span>${imgOrEmoji(obj.img, obj.emoji, "ms-goal-obj", "ms-goal-emoji")}</div>
        <div class="makeset-frame" id="msFrame"></div>
        <button class="makeset-add" id="msAdd"><span class="ms-add-plus">＋</span>${imgOrEmoji(obj.img, obj.emoji, "ms-add-obj", "ms-add-emoji")}</button>`;
      host.appendChild(wrap);
      const frame = wrap.querySelector("#msFrame"), addBtn = wrap.querySelector("#msAdd");
      const numerals = slide.data.numerals || [];
      const measuring = mkIsMeasure(slide);
      if(measuring) frame.classList.add("mk-rail");   // [kit] lay the units flush against each other
      /* [kit] GHOST SLOT - the sheet's dashed block, parked after the last laid
         unit, so "where does the next one go?" is answered before the child taps.
         It is the anti-gap cue: the slot always sits hard against the last block. */
      /* NB deliberately NOT .ms-item - the reveal/hint paths count and trim
         .ms-item, and a counted ghost would corrupt the child's total. */
      const ghost = document.createElement("div"); ghost.className = "mk-ghostslot";
      ghost.innerHTML = '<img class="cobj-img" src="' + mkSrc(MK.ghost) + '" alt="" aria-hidden="true">';
      const syncGhost = ()=>{
        if(!measuring) return;
        /* hide it once the row already measures N - a "next slot" cue at the
           finished length would invite one unit too many. */
        const done = state.locked || state.hintActive || c >= N;
        if(done || c >= MAXITEMS){ ghost.remove(); return; }
        frame.appendChild(ghost);                       // always last in the rail
      };
      /* Deck pages 5 and 7 ask for पलंग = 8 blocks and फ्रिज = 6, but this was
         capped at 5 - both targets were literally unreachable, so the slide could
         never be completed. Raised to 9, the top of the card's own number_set. */
      const MAXITEMS = 9;
      let c = 0; state.attempts = 0; state.locked = false; state.hintActive = false;
      /* [QA 05] आगे = SUBMIT, live once at least one unit is laid. It used to light ONLY at exactly N,
         which made every wrong-answer branch below unreachable - no re-listen, no hint, no reveal. */
      const refreshNav = ()=>{ setNavActive(!state.locked && !state.hintActive && c > 0); syncGhost(); };  // आगे activates ONLY at exactly N — no premature/wrong submit; child self-corrects by adding more / removing (×). Nudge on the add-button guides an idle child.
      function makeItem(){
        const it = document.createElement("div"); it.className = "ms-item";
        it.innerHTML = imgOrEmoji(obj.img, obj.emoji, "cobj-img", "cobj-emoji") + `<span class="ms-del" aria-label="हटाओ">×</span>`;
        const remove = (e)=>{ if(e) e.stopPropagation(); if(state.locked || state.hintActive) return; it.remove(); c--; refreshNav(); };
        // remove ONLY via the explicit × badge — tapping the object itself must NOT delete it
        // (the count tutorial teaches "tap the object to count it"; a placed apple that vanishes on tap
        //  would silently destroy the child's work)
        it.querySelector(".ms-del").onclick = remove;
        frame.insertBefore(it, ghost.parentNode === frame ? ghost : null);   // [kit] keep the ghost slot trailing
        if(measuring){ mkSetBlockState(it, MK.placed); mkGlow(it); }         // [kit] it lands "placed", with the glow
        return it;
      }
      addBtn.onclick = ()=>{
        if(state.locked || state.hintActive) return;
        if(c >= MAXITEMS){ addBtn.classList.add("shake"); setTimeout(()=> addBtn.classList.remove("shake"), 420);
          /* [kit] laying more units than fit IS the overlap error - name it with the
             sheet's figure instead of only buzzing the button. */
          if(measuring) mkFlashErr(frame, MK.errOver);
          return; }  // cap at MAXITEMS
        c++; makeItem();
        play("assets/voiceover/vo_num_" + c + "." + AUDIO_EXT);   // count up as you add
        GameBus.emit("make_set_add", { slide_id: slide.id, count: c });
        refreshNav();
      };
      // HINT = count what the child actually placed (highlight + say the number)
      const runHint = (after)=>{
        state.hintActive = true; refreshNav();
        /* [kit] before re-counting for the child, SHOW what went wrong: too few
           units means a gap was left, too many means they overlap. */
        if(measuring && c !== N) mkFlashErr(frame, mkErrFigure(c, N));
        demoCount([...frame.querySelectorAll(".ms-item")], numerals, ()=>{ state.hintActive = false; refreshNav(); if(after) after(); });
      };
      $("hintBtn").onclick = ()=>{ if(state.locked || state.hintActive) return;
        GameBus.emit("hint_shown", { slide_id: slide.id, manual: true }); runHint(); };
      // आगे = SUBMIT. correct → celebrate & advance. wrong → graduated scaffold, same as
      // everywhere: 1st = try again, 2nd = count-demo hint, 3rd = REVEAL (auto-fix to N,
      // count 1..N automatically, then move to the next slide).
      $("navBtn").onclick = ()=>{
        if(state.locked || state.hintActive || c === 0) return;
        if(c === N){
          state.locked = true; refreshNav();
          try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase },
               { is_correct:true, attempt: state.attempts + 1, score: state.attempts === 0 ? 1 : 0, response: c }); }catch(e){}
          recordResult(slide, state.attempts === 0);
          sfxCorrect(); setSwMood("happy");
          GameBus.emit("make_set_correct", { slide_id: slide.id, phase: slide.phase,
            value: true, target: N, attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          syncGhost();
          // [kit] the measurement, restated on the result plate. Anchored on the goal
          // chip, not the frame: the frame spans the card, leaving no side gutter.
          if(measuring) mkShowResult(wrap.querySelector(".makeset-target") || frame, N);
          play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT, ()=>
            celebrateThenAdvance(slide, false));   // standard: confetti + VO + auto-advance, no popup
          return;
        }
        state.attempts++;
        try{ XAPI.send("question_answered", { slide_id: slide.id, type: slide.type, phase: slide.phase },
             { is_correct:false, attempt: state.attempts, score: 0, response: c }); }catch(e){}
        sfxWrongSoft(); setSwMood("tryagain");
        frame.classList.remove("shake"); void frame.offsetWidth; frame.classList.add("shake");
        setTimeout(()=> frame.classList.remove("shake"), 450);
        GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts, made: c, target: N });
        const maxA = (CARD.scaffold_rules && CARD.scaffold_rules.max_attempts) || 3;
        $("hintBtn").classList.add("show","hint-glow");
        if(state.attempts >= maxA){
          // 3rd wrong → reveal: correct the set to exactly N, count it 1..N, then advance
          state.locked = true; state.scaffoldLevel = 3; refreshNav();
          /* NB last-of-type, not :last-child - the kit parks a ghost slot after the
             last real unit, so :last-child would match nothing and throw. */
          for(let ex = frame.querySelectorAll(".ms-item"); ex.length > N; ex = frame.querySelectorAll(".ms-item")) ex[ex.length-1].remove();
          while(frame.querySelectorAll(".ms-item").length < N) makeItem();
          c = N;
          recordResult(slide, false);
          GameBus.emit("answer_revealed", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          state.hintActive = true;
          // count the (now-correct) set 1..N, then say the total "कुल N", then advance
          demoCount([...frame.querySelectorAll(".ms-item")], numerals, ()=>{
            state.hintActive = false;
            play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT, ()=> setTimeout(()=> completeSlide(false), 500));
          });
        } else if(state.attempts === 2){
          state.scaffoldLevel = Math.max(state.scaffoldLevel, 2);
          GameBus.emit("hint_shown", { slide_id: slide.id, manual: false });
          runHint();                                                   // 2nd wrong → count what they made
        } else {
          // 1st wrong → RE-LISTEN: the try-again line, then the question itself again
          state.scaffoldLevel = Math.max(state.scaffoldLevel, 1);
          showBox("", audioText(slide,"try_again") || "फिर से कोशिश करो।", "wrong", audioFor(slide,"try_again"),
            ()=>{ if(!state.locked && !state.hintActive) play(audioFor(slide, "prompt") || null, ()=>{}); });
        }
      };
      setNavActive(false);
      if(slide.phase !== "practice") pointNudgeAt(addBtn);   // [QA 06] practice = the child alone, no hand by default
    }
  },

  COMPARE_SETS: {
    // Two visible groups, TWO picture options — the child taps the object that has MORE (or LESS).
    // No बराबर chip (lead review): equality is taught in MEET_COMPARE + produced on the see-saw, so
    // a judge question always has one clear answer between the two objects. Tap-to-answer: a wrong
    // tap buzzes + crosses + locks that card; the right one confetti-cheers + advances.
    mount(host, slide){
      const d = slide.data;
      const stage = stimulusCompareSets(d);
      // JUDGE (test): hide the "मिलाओ" reveal button — its one-to-one reveal + leftover glow gives the
      // answer away (and on a "less" question it glows the MORE set, pointing at the WRONG option).
      // The two rows stay visible so the child still compares by eye. (Reveal stays only on MEET_COMPARE.)
      const mb = stage.querySelector(".cmp-match-btn"); if(mb) mb.style.display = "none";
      const answer = (d.ask === "less") ? (d.a_count < d.b_count ? "a" : "b")
                                        : (d.a_count > d.b_count ? "a" : "b");
      const options = [ {kind:"a", obj:d.a_object}, {kind:"b", obj:d.b_object} ];
      // (option shuffle is now centralized in mountTapOptions — no per-module reverse needed)
      mountTapOptions({
        slide, host, signalName: "compare_first_try",
        stimulus: stage,
        nudgeTarget: null,
        options,
        columnsHint: 2,
        isCorrect: (opt)=> opt.kind === answer,
        optionRenderer: (opt)=>{
          const cell = document.createElement("div");
          cell.innerHTML = imgOrEmoji(opt.obj.img, opt.obj.emoji, "pic-img", "cmp-chip-emoji")
            + `<span class="cmp-chip-lbl">${opt.obj.word_hi || ""}</span>`;
          return cell;
        },
        mastery: slide.phase === "mastery"
      });
    }
  },

  MEET_COMPARE: {
    // TEACH BY DOING (lead review): the child COUNTS each group by tapping its objects one-by-one
    // (running numeral + spoken एक/दो/तीन), the top group then the bottom. Then the one-to-one
    // match reveals, the leftover glows, and Swiftie EXPLAINS the outcome by name — e.g.
    // "एक सेब बच गया, सेब ज़्यादा हैं, केले कम" / "कुछ नहीं बचा, दोनों बराबर". आगे appears after.
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div"); wrap.className = "meet-compare";
      const stage = stimulusCompareSets({a_object:d.a_object, a_count:d.a_count,
                                          b_object:d.b_object, b_count:d.b_count, show_matches:false});
      const mb = stage.querySelector(".cmp-match-btn"); if(mb) mb.style.display = "none";
      const verdict = document.createElement("div");
      verdict.className = "cmp-verdict " + (d.outcome || "more");
      verdict.textContent = d.label_hi || "";
      wrap.appendChild(stage); wrap.appendChild(verdict);
      host.appendChild(wrap);

      state.gateNavUntilAudio = false; state.locked = false; state.ownsAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=>{ if(state.locked) completeSlide(true); };

      // 🔊 replay: re-hear the teach line (and, once revealed, the explanation). autoPlayChain skips
      // count_intro/explain, so without this the header chip would be silent on teach slides.
      let revealed = false;
      state.replayAudio = ()=>{ const chain = [audioFor(slide, "count_intro")];
        if(revealed) chain.push(audioFor(slide, "explain"));
        playChain(chain.filter(Boolean), 0); };

      const rowA = [...stage.querySelectorAll(".cmp-row.top .cobj")];
      const rowB = [...stage.querySelectorAll(".cmp-row.bot .cobj")];

      // make one row countable-by-tapping; cb fires once every item in it is counted
      function countRow(items, cb){
        const nudgeNext = ()=>{ const nx = items.find(o=>!o.classList.contains("counted"));
          if(nx) pointNudgeAt(nx); else stopNudge(); };
        let n = 0;
        items.forEach(o=>{
          o.classList.add("tappable");
          o.onclick = ()=>{
            if(state.locked || o.classList.contains("counted")) return;
            o.classList.add("counted", "counting"); n++; sfxTap();
            let cal = o.querySelector(".count-callout");
            if(!cal){ cal = document.createElement("span"); cal.className = "count-callout"; o.appendChild(cal); }
            cal.textContent = n;
            play("assets/voiceover/vo_num_" + n + "." + AUDIO_EXT, ()=>{});
            if(items.every(x=>x.classList.contains("counted"))){ stopNudge(); setTimeout(cb, 550); }
            else nudgeNext();
          };
        });
        nudgeNext();
        // [16h] Phase-1 autonomous mode (lead's 3-phase contract): the demo hand counts the row
        // BY ITSELF — drives the same handlers a child would, so behavior is identical.
        if(slide.data.auto){
          items.forEach(o=> o.classList.remove("tappable"));
          let ai = 0;
          (function autoTap(){
            if(CARD.slides[state.idx] !== slide || ai >= items.length) return;
            const o = items[ai++]; pointNudgeAt(o); if(o.onclick) o.onclick();
            setTimeout(autoTap, 950);
          })();
        }
      }

      // intro VO → count group A → count group B → reveal match + explain the outcome.
      // NB: uses non-autochain role names (count_intro / explain) so mountSlide's autoPlayChain
      // does NOT also fire the intro — this module owns its own audio sequence.
      play(audioFor(slide, "count_intro") || null, ()=>{
        countRow(rowA, ()=> countRow(rowB, ()=>{
          stage._revealMatches(()=>{
            verdict.classList.add("show"); setSwMood("point");
            state.locked = true; revealed = true; setNavActive(true);
            play(audioFor(slide, "explain") || null, ()=>{});
          });
        }));
      });
    }
  },

  MAKE_EQUAL: {
    // PRODUCE mechanic (see-saw): the left pan holds a fixed group; the child taps + जोड़ो to
    // add to the right pan (tap an added item to take it back). The beam tilts toward the heavier
    // side in real time; at equal it levels, locks, celebrates. Overshoot is enacted (invite to
    // remove), never a red ✗ — the KG "produce, don't pick" model.
    mount(host, slide){
      const d = slide.data, L = d.a_count, fixedObj = d.a_object, addObj = d.b_object;
      const MAXR = d.max || Math.max(L + 2, 6);
      const wrap = document.createElement("div"); wrap.className = "balance-stage";
      wrap.innerHTML = `
        <div class="balance">
          <div class="beam-wrap" id="beamWrap"><div class="beam"></div>
            <div class="pan pan-left"><div class="pan-grid" id="panL"></div></div>
            <div class="pan pan-right"><div class="pan-grid" id="panR"></div></div></div>
          <div class="fulcrum"></div>
        </div>
        <button class="balance-add" id="balAdd" type="button"></button>`;
      host.appendChild(wrap);
      const panL = wrap.querySelector("#panL"), panR = wrap.querySelector("#panR");
      const beam = wrap.querySelector("#beamWrap"), addBtn = wrap.querySelector("#balAdd");
      const balance = wrap.querySelector(".balance");
      addBtn.innerHTML = imgOrEmoji(addObj.img, addObj.emoji, "cobj-img", "cobj-emoji") + `<span>+ जोड़ो</span>`;
      for(let i=0;i<L;i++){ const c=document.createElement("span"); c.className="cobj";
        c.innerHTML = imgOrEmoji(fixedObj.img, fixedObj.emoji, "cobj-img", "cobj-emoji"); panL.appendChild(c); }
      let right = 0; state.locked = false; state.attempts = 0; let tipT = 0;
      const TILT = 6, TMAX = 15;
      const tilt = ()=>{ const diff = right - L; const deg = Math.max(-TMAX, Math.min(TMAX, diff*TILT));
        beam.style.transform = `translateX(-50%) rotate(${deg}deg)`; balance.classList.toggle("level", diff===0 && right>0); };
      const check = ()=>{ if(state.locked) return; const diff = right - L;
        if(diff===0 && right>0){ state.locked = true; setNavActive(true);
          GameBus.emit("make_equal_correct", { slide_id: slide.id, phase: slide.phase, value: true,
            count: right, target: L, attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          showBox("⚖️", audioText(slide,"balanced") || "बराबर! दोनों बराबर हैं।", "correct", audioFor(slide,"balanced") || null, ()=>{});
        } else if(diff > 0){ state.attempts++;
          GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, made: right, target: L });
          if(Date.now()-tipT > 1200){ tipT = Date.now();
            showBox("", audioText(slide,"too_many") || "बहुत ज़्यादा! एक हटाओ।", "hint", audioFor(slide,"too_many"), ()=>{}); } }
      };
      const addItem = ()=>{ const c=document.createElement("span"); c.className="cobj added";
        c.innerHTML = imgOrEmoji(addObj.img, addObj.emoji, "cobj-img", "cobj-emoji");
        c.onclick = ()=>{ if(state.locked) return; c.remove(); right = Math.max(0, right-1); tilt(); check(); };
        panR.appendChild(c); right++; };
      addBtn.onclick = ()=>{ if(state.locked) return;
        if(right >= MAXR){ addBtn.classList.add("shake"); setTimeout(()=> addBtn.classList.remove("shake"), 400); return; }
        addItem(); tilt(); sfxTap();
        // count EVERY added item aloud INCLUDING the final/target one (एक, दो, तीन) — then, on the
        // last count, the "बराबर" VO follows (check runs in the count's onEnd so the number isn't cut).
        if(right <= L) play("assets/voiceover/vo_num_" + right + "." + AUDIO_EXT, right === L ? ()=> check() : ()=>{});
        else check();   // overshoot → "एक हटाओ" hint
      };
      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(state.locked) completeSlide(true); };
      tilt();                 // START tilted toward the heavier (left) group — the see-saw is NOT level yet
      pointNudgeAt(addBtn);
    }
  },

  MEET_PATTERN: {
    // TEACH: show a repeating pattern and pulse the repeating UNIT (first data.unit_len cells) a few
    // times so the child sees "this part comes again". Nav gated on the VO, like MEET_NUMBER.
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div"); wrap.className = "pattern-stage";
      const lbl = document.createElement("div"); lbl.className = "pat-unit-lbl"; lbl.textContent = "यह हिस्सा दोहराता है 🔁";
      const row = document.createElement("div"); row.className = "pattern-row";
      d.items.forEach(o=>{ const c = document.createElement("div"); c.className = "pat-cell";
        c.innerHTML = imgOrEmoji(o.img, o.emoji, "cobj-img", "cobj-emoji"); row.appendChild(c); });
      wrap.appendChild(lbl); wrap.appendChild(row); host.appendChild(wrap);
      state.gateNavUntilAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
      const cells = [...row.children]; let rep = 0;
      const glow = ()=>{ cells.forEach((c,i)=> { if(i < d.unit_len) c.classList.add("unit-glow"); });
        setTimeout(()=> cells.forEach(c=> c.classList.remove("unit-glow")), 1100); };
      glow(); const t = setInterval(()=>{ if(rep++ >= 2){ clearInterval(t); return; } glow(); }, 1700);
    }
  },

  PATTERN_BUILD: {
    // PRODUCE: a pattern with empty ghost slot(s) — at the END (extend) or in the MIDDLE (fill the
    // gap). Tap a tray item to drop it into the active slot; the correct item = data.items[slot].
    // Wrong taps bounce (enacted, no ✗). Fill every blank → complete. data:{items[],blanks[],tray[]}.
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div"); wrap.className = "pattern-stage";
      const row = document.createElement("div"); row.className = "pattern-row";
      const cells = d.items.map((o,i)=>{
        const c = document.createElement("div");
        if(d.blanks.includes(i)){ c.className = "pat-ghost"; c.innerHTML = `<span class="qmark">?</span>`; }
        else { c.className = "pat-cell"; c.innerHTML = imgOrEmoji(o.img, o.emoji, "cobj-img", "cobj-emoji"); }
        row.appendChild(c); return c;
      });
      const tray = document.createElement("div"); tray.className = "pattern-tray";
      d.tray.forEach(o=>{ const t = document.createElement("div"); t.className = "pat-tray-item"; t._obj = o;
        t.innerHTML = imgOrEmoji(o.img, o.emoji, "cobj-img", "cobj-emoji"); tray.appendChild(t); });
      wrap.appendChild(row); wrap.appendChild(tray); host.appendChild(wrap);
      const blanks = d.blanks.slice(); let bi = 0, wrongStreak = 0, revealedAny = false;
      state.locked = false; state.attempts = 0;
      const key = (o)=> o.img || o.emoji;
      const activeGhost = ()=> cells[blanks[bi]];
      const markActive = ()=>{ cells.forEach(c=> c.classList.remove("active"));
        // idle nudge points at the ACTIVE BLANK ('?' slot = "put one here"), re-armed per blank —
        // NEVER at a tray answer; startNudge is phase-aware so it's silent in practice/mastery.
        if(bi < blanks.length){ activeGhost().classList.add("active"); startNudge(slide, activeGhost()); } else stopNudge(); };
      const flashHint = ()=>{ const want = d.items[blanks[bi]], g = activeGhost(); const prev = g.innerHTML;
        g.innerHTML = imgOrEmoji(want.img, want.emoji, "cobj-img", "cobj-emoji"); g.style.opacity = ".4";
        setTimeout(()=>{ if(g.classList.contains("pat-ghost")){ g.innerHTML = prev; g.style.opacity = ""; } }, 950); };
      const placeCorrect = ()=>{                      // one placement path (tap AND reveal)
        const want = d.items[blanks[bi]], g = activeGhost();
        g.className = "pat-cell"; g.innerHTML = imgOrEmoji(want.img, want.emoji, "cobj-img", "cobj-emoji");
        g.classList.add("unit-glow"); setTimeout(()=> g.classList.remove("unit-glow"), 700); bi++;
        if(bi >= blanks.length){
          state.locked = true; stopNudge();
          GameBus.emit("pattern_extend_correct", { slide_id: slide.id, phase: slide.phase, value: !revealedAny,
            attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          // engine standard: confetti + cheer + correct VO + AUTO-advance — no popup, no आगे gate.
          celebrateThenAdvance(slide, revealedAny);
        } else markActive();
      };
      markActive();
      tray.querySelectorAll(".pat-tray-item").forEach(t=>{
        t.onclick = ()=>{
          if(state.locked || bi >= blanks.length) return;
          stopNudge();
          const want = d.items[blanks[bi]];
          if(key(t._obj) === key(want)){
            wrongStreak = 0;
            placeCorrect();
          } else {
            state.attempts++;
            t.classList.add("shake"); setTimeout(()=> t.classList.remove("shake"), 420);
            activeGhost().classList.add("shake"); setTimeout(()=> activeGhost().classList.remove("shake"), 420);
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            $("hintBtn").classList.add("show","hint-glow");
            // layered ladder, standard-aligned: L1 spoken try-again (buzz + Swiftie, no popup) →
            // L2 flash the answer ghost + spoken hint → L3 reveal ceiling: DEMONSTRATE the placement.
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts||3)){
              revealedAny = true; wrongStreak = 0;
              activeGhost().classList.add("reveal-glow");
              play(audioFor(slide,"reveal") || audioFor(slide,"hint") || null, ()=>{});
              setTimeout(()=>{ placeCorrect(); }, 1000);
            }
            else if(state.attempts >= 2){ flashHint(); play(audioFor(slide,"hint") || null, ()=>{}); }
            else dragWrong(slide);
          }
        };
      });
      setNavActive(false);
      $("navBtn").onclick = ()=>{};   // completion is automatic now — आगे never gates a solved pattern
      $("hintBtn").onclick = ()=>{ if(!state.locked && bi < blanks.length) flashHint(); };
      // NB: the idle nudge is armed by markActive() → startNudge(activeGhost) above — it points at the
      // BLANK, phase-aware. (Bug fix: was pointNudgeAt(first tray tile) = an immediate hand on the WRONG
      // answer on most slides, and it showed even in mastery.)
    }
  },

  /* ===== NUMBER-SEQUENCE PATH (MTKGA01_L02_S04 — "completes a number sequence within 20") =====
     Three additive modules that share the .seq-* number-path skin. Numerals are crisp text glyphs
     (Baloo), only the tile chrome is rounded — content-true geometry (never round the number). */

  MEET_SEQUENCE: {
    // TEACH BY DOING: a number path; a token sits on the first cell. The child taps the glowing NEXT
    // cell to hop the token forward, each number spoken (vo_num_N) with an ascending thunk — so the
    // child ENACTS "numbers move forward one step at a time" (curriculum teach spec). Nav gates until
    // the token reaches the end, then Swiftie's explain line plays. data:{path:[n…], token?}.
    mount(host, slide){
      const d = slide.data, nums = d.path;
      state.ownsAudio = true; setNavActive(false); setSwMood("teach");
      const stage = document.createElement("div"); stage.className = "seq-stage";
      const path  = document.createElement("div"); path.className = "seq-path";
      const cw = nums.length > 7 ? 74 : 90;
      const cells = nums.map((n,i)=>{
        if(i){ const con = document.createElement("div"); con.className = "seq-connector"; path.appendChild(con); }
        const cell = document.createElement("div"); cell.className = "seq-cell";
        cell.style.width = cell.style.height = cw+"px"; cell.style.fontSize = Math.round(cw*0.56)+"px";
        cell.textContent = n; path.appendChild(cell); return cell;
      });
      stage.appendChild(path); host.appendChild(stage);
      const token = document.createElement("span"); token.className = "seq-token"; token.textContent = d.token || "🐤";
      let pos = 0;
      const place = ()=>{ cells.forEach((c,i)=> c.classList.toggle("lit", i <= pos));
        if(!cells[pos].contains(token)) cells[pos].appendChild(token); };
      const glowNext = ()=>{ cells.forEach((c,i)=> c.classList.toggle("active", i === pos+1));
        if(pos+1 < cells.length) startNudge(slide, cells[pos+1]); else stopNudge(); };
      place(); btThunk(1); play("assets/voiceover/vo_num_" + nums[0] + "." + AUDIO_EXT, ()=>{}); glowNext();
      const advance = ()=>{
        if(pos >= cells.length-1) return;
        pos++; cells[pos].classList.remove("active"); place(); btThunk(pos+1);
        play("assets/voiceover/vo_num_" + nums[pos] + "." + AUDIO_EXT, ()=>{});
        if(pos >= cells.length-1){ stopNudge();
          GameBus.emit("meet_sequence_done", { slide_id: slide.id, phase: slide.phase });
          setTimeout(()=> play(audioFor(slide, "explain") || null, ()=> setNavActive(true)), 500);
        } else glowNext();
      };
      cells.forEach((c,i)=>{ c.onclick = ()=>{ if(i === pos+1) advance(); }; });
      // 🔊 replay re-speaks the current number (module owns its audio; autoPlayChain is skipped)
      state.replayAudio = ()=> play("assets/voiceover/vo_num_" + nums[pos] + "." + AUDIO_EXT, ()=>{});
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  SEQUENCE_COMPLETE: {
    // PRODUCE test: a number path with blank(s); tap a tray numeral into the active blank. Correct =
    // path[blankIdx]. Wrong = shake + soft buzz + spoken try_again; reveal (demonstrate) after
    // max_attempts. Fills left→right. data:{path:[n… , with the blank positions still holding the true
    // number], blanks:[idx…], tray:[n…] (numerals incl. misconception distractors)}.
    mount(host, slide){
      const d = slide.data;
      const stage = document.createElement("div"); stage.className = "seq-stage";
      const path  = document.createElement("div"); path.className = "seq-path";
      const cw = d.path.length > 7 ? 74 : 90;
      const cells = d.path.map((n,i)=>{
        if(i){ const con = document.createElement("div"); con.className = "seq-connector"; path.appendChild(con); }
        const cell = document.createElement("div");
        cell.style.width = cell.style.height = cw+"px"; cell.style.fontSize = Math.round(cw*0.56)+"px";
        if(d.blanks.includes(i)){ cell.className = "seq-cell seq-ghost"; cell.innerHTML = '<span class="seq-q">?</span>'; }
        else { cell.className = "seq-cell filled"; cell.textContent = n; }
        path.appendChild(cell); return cell;
      });
      const tray = document.createElement("div"); tray.className = "seq-tray";
      d.tray.forEach(n=>{ const t = document.createElement("div"); t.className = "seq-tile"; t._num = n; t.textContent = n; tray.appendChild(t); });
      stage.appendChild(path); stage.appendChild(tray); host.appendChild(stage);

      const blanks = d.blanks.slice(); let bi = 0, wrongStreak = 0, revealedAny = false;
      state.locked = false; state.attempts = 0;
      const activeGhost = ()=> cells[blanks[bi]];
      const markActive = ()=>{ cells.forEach(c=> c.classList.remove("active"));
        if(bi < blanks.length){ activeGhost().classList.add("active"); startNudge(slide, activeGhost()); } else stopNudge(); };
      const placeCorrect = ()=>{
        const want = d.path[blanks[bi]], g = activeGhost();
        g.className = "seq-cell filled unit-glow"; g.textContent = want; setTimeout(()=> g.classList.remove("unit-glow"), 700);
        const tile = [...tray.children].find(x=> x._num === want && !x.classList.contains("used")); if(tile) tile.classList.add("used");
        bi++;
        if(bi >= blanks.length){
          state.locked = true; stopNudge();
          GameBus.emit("sequence_complete_correct", { slide_id: slide.id, phase: slide.phase, value: !revealedAny,
            attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          celebrateThenAdvance(slide, revealedAny);
        } else markActive();
      };
      markActive();
      tray.querySelectorAll(".seq-tile").forEach(t=>{
        t.onclick = ()=>{
          if(state.locked || bi >= blanks.length || t.classList.contains("used")) return;
          stopNudge();
          if(t._num === d.path[blanks[bi]]){ wrongStreak = 0; placeCorrect(); }
          else {
            state.attempts++;
            t.classList.add("shake"); setTimeout(()=> t.classList.remove("shake"), 420);
            activeGhost().classList.add("shake"); setTimeout(()=> activeGhost().classList.remove("shake"), 420);
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            $("hintBtn").classList.add("show","hint-glow");
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts || 3)){
              revealedAny = true; wrongStreak = 0;
              activeGhost().classList.add("reveal-glow");
              play(audioFor(slide, "reveal") || audioFor(slide, "hint") || null, ()=>{});
              setTimeout(()=> placeCorrect(), 1000);
            } else dragWrong(slide);
          }
        };
      });
      setNavActive(false); $("navBtn").onclick = ()=>{};   // completion is automatic — never gate a solved path
      $("hintBtn").onclick = ()=>{ if(!state.locked && bi < blanks.length){ const g = activeGhost();
        g.classList.add("reveal-glow"); setTimeout(()=> g.classList.remove("reveal-glow"), 800); } };
    }
  },

  SEQUENCE_NEXT: {
    // PICK test (what comes next / before): a number path with ONE '?' cell (null in data.path) is the
    // stimulus; the child taps the correct numeral option. Reuses mountTapOptions → full tap-to-answer
    // contract (wrong=buzz+✗+lock+try_again, right=confetti+advance) + speak-the-number-on-tap +
    // mastery scoring. data:{path:[n…,null,…], options:[{num, audio:"vo_num_N", correct}]}.
    mount(host, slide){
      const d = slide.data;
      const stim = document.createElement("div"); stim.className = "seq-stage";
      const path = document.createElement("div"); path.className = "seq-path";
      const cw = d.path.length > 7 ? 74 : 90;
      d.path.forEach((n,i)=>{
        if(i){ const con = document.createElement("div"); con.className = "seq-connector"; path.appendChild(con); }
        const cell = document.createElement("div");
        cell.style.width = cell.style.height = cw+"px"; cell.style.fontSize = Math.round(cw*0.56)+"px";
        if(n === null){ cell.className = "seq-cell seq-ghost active"; cell.innerHTML = '<span class="seq-q">?</span>'; }
        else { cell.className = "seq-cell filled"; cell.textContent = n; }
        path.appendChild(cell);
      });
      stim.appendChild(path);
      mountTapOptions({
        slide, host, signalName: "sequence_next_correct", stimulus: stim,
        options: d.options,
        optionRenderer: (o)=>{ const cell = document.createElement("div"); const s = document.createElement("span");
          s.className = "seq-optnum"; s.textContent = o.num; cell.appendChild(s); return cell; },
        isCorrect: (o)=> o.correct === true,
        mastery: slide.phase === "mastery",
        columnsHint: d.options.length,
        nudgeTarget: null
      });
    }
  },

  /* ===== ORDERING / SERIATION (MTKGA02_L02_S02 — "orders three objects by size, length, or weight") =====
     Additive modules sharing the .ord-* skin. Objects render at true magnitude (size scale / bar length);
     weight is assessed by 'pick the heaviest' (weight is not visual) — targeting the bigger=heavier
     misconception with a big-but-light distractor. */

  MEET_ORDER: {
    // TEACH BY DOING: the 3 objects are shown already in order (small→big / short→long / light→heavy);
    // the child taps each left→right to hear its rank name (सबसे छोटा / बीच का / सबसे बड़ा etc.), then an
    // explain line plays and नav unlocks. data:{by, items:[{mag,img/emoji/color}] (ascending), rank_audio:[id…],
    // arrow_lo, arrow_hi, hint_icon?}.
    mount(host, slide){
      const d = slide.data; state.ownsAudio = true; setNavActive(false); setSwMood("teach");
      const stage = document.createElement("div"); stage.className = "ord-stage ord-" + d.by;
      const arrow = document.createElement("div"); arrow.className = "ord-arrow";
      arrow.innerHTML = `<span>${d.arrow_lo||""}</span><span class="ord-arrowline"></span><span>${d.arrow_hi||""}</span>`;
      const row = document.createElement("div"); row.className = "ord-tray";
      const cells = d.items.map((o,i)=>{ const el = document.createElement("div"); el.className = "ord-item";
        el.style.opacity = ".5"; el.innerHTML = renderOrdObj(o, d.by); row.appendChild(el); return el; });
      if(d.hint_icon){ const hi = document.createElement("div"); hi.className = "ord-hint-icon"; hi.textContent = d.hint_icon; stage.appendChild(hi); }
      stage.appendChild(arrow); stage.appendChild(row); host.appendChild(stage);
      let tapped = 0;
      const nudgeNext = ()=>{ cells.forEach((c,i)=> c.classList.toggle("active", i === tapped));
        if(tapped < cells.length) startNudge(slide, cells[tapped]); else stopNudge(); };
      nudgeNext();
      cells.forEach((c,i)=>{ c.onclick = ()=>{ if(i !== tapped) return; stopNudge();
        c.classList.remove("active"); c.style.opacity = "1"; c.classList.add("reveal-glow");
        setTimeout(()=> c.classList.remove("reveal-glow"), 600);
        play("assets/voiceover/" + (d.rank_audio[i]) + "." + AUDIO_EXT, ()=>{}); tapped++;
        if(tapped >= cells.length){ stopNudge();
          GameBus.emit("meet_order_done", { slide_id: slide.id, phase: slide.phase });
          setTimeout(()=> play(audioFor(slide, "explain") || null, ()=> setNavActive(true)), 450);
        } else nudgeNext();
      }; });
      state.replayAudio = ()=> play(audioFor(slide, "explain") || null, ()=>{});
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  ORDER_BY_ATTR: {
    // PRODUCE test: 3 scrambled objects + a left→right strip (arrow छोटा→बड़ा). Tap the smallest-remaining
    // → it fills the next slot. Wrong (not the current smallest) = shake + soft buzz + spoken try_again;
    // demonstrate after max_attempts. data:{by, items:[{mag,img/emoji/color}], arrow_lo, arrow_hi}.
    mount(host, slide){
      const d = slide.data;
      const stage = document.createElement("div"); stage.className = "ord-stage ord-" + d.by;
      const arrow = document.createElement("div"); arrow.className = "ord-arrow";
      arrow.innerHTML = `<span>${d.arrow_lo||""}</span><span class="ord-arrowline"></span><span>${d.arrow_hi||""}</span>`;
      const strip = document.createElement("div"); strip.className = "ord-strip";
      const n = d.items.length; const slots = [];
      for(let i=0;i<n;i++){ const sl = document.createElement("div"); sl.className = "ord-slot"; strip.appendChild(sl); slots.push(sl); }
      const tray = document.createElement("div"); tray.className = "ord-tray";
      const disp = d.items.slice(); for(let i=disp.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [disp[i],disp[j]]=[disp[j],disp[i]]; }
      const sortedMags = d.items.map(o=>o.mag).slice().sort((a,b)=>a-b);
      const tiles = disp.map(o=>{ const el = document.createElement("div"); el.className = "ord-item"; el._mag = o.mag;
        el.innerHTML = renderOrdObj(o, d.by); tray.appendChild(el); return el; });
      stage.appendChild(arrow); stage.appendChild(strip); stage.appendChild(tray); host.appendChild(stage);
      let placed = 0, wrongStreak = 0, revealed = false; state.locked = false; state.attempts = 0;
      const wantMag = ()=> sortedMags[placed];
      const nextTile = ()=> tiles.find(x=> !x.classList.contains("used") && x._mag === wantMag());
      const markActive = ()=>{ slots.forEach((s,i)=> s.classList.toggle("active", i === placed));
        if(placed < n) startNudge(slide, nextTile()); else stopNudge(); };
      const placeInto = (tile)=>{ const slot = slots[placed]; slot.classList.remove("active"); slot.classList.add("filled");
        slot.innerHTML = tile.innerHTML; tile.classList.add("used"); placed++;
        if(placed >= n){ state.locked = true; stopNudge();
          GameBus.emit("order_by_attr_correct", { slide_id: slide.id, phase: slide.phase, value: !revealed,
            attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          celebrateThenAdvance(slide, revealed);
        } else markActive();
      };
      markActive();
      tiles.forEach(t=>{ t.onclick = ()=>{ if(state.locked || t.classList.contains("used")) return; stopNudge();
        if(t._mag === wantMag()){ wrongStreak = 0; placeInto(t); }
        else { state.attempts++; t.classList.add("shake"); setTimeout(()=> t.classList.remove("shake"), 420);
          GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          $("hintBtn").classList.add("show","hint-glow");
          if(++wrongStreak >= (CARD.scaffold_rules.max_attempts || 3)){ revealed = true; wrongStreak = 0;
            const c = nextTile(); if(c){ c.classList.add("reveal-glow"); play(audioFor(slide,"reveal")||null, ()=>{});
              setTimeout(()=>{ c.classList.remove("reveal-glow"); placeInto(c); }, 1000); }
          } else dragWrong(slide);
        }
      }; });
      setNavActive(false); $("navBtn").onclick = ()=>{};
      $("hintBtn").onclick = ()=>{ if(!state.locked){ const t = nextTile(); if(t){ t.classList.add("reveal-glow"); setTimeout(()=> t.classList.remove("reveal-glow"), 800); } } };
    }
  },

  PICK_EXTREME: {
    // PICK test: tap the object that is the MOST (सबसे बड़ा / सबसे लंबा / सबसे भारी). For weight, options
    // include a big-but-light distractor to break the bigger=heavier misconception. Reuses mountTapOptions
    // → tap-to-answer + speak-the-word-on-tap + mastery. data:{by, options:[{img/emoji/color,mag,label,audio,correct}]}.
    mount(host, slide){
      const d = slide.data;
      mountTapOptions({
        slide, host, signalName: "pick_extreme_correct", stimulus: null,
        options: d.options,
        optionRenderer: (o)=>{ const cell = document.createElement("div"); cell.className = "ord-pick";
          cell.innerHTML = renderOrdObj(o, d.by) + (o.label ? `<span class="lbl">${o.label}</span>` : ""); return cell; },
        isCorrect: (o)=> o.correct === true,
        mastery: slide.phase === "mastery",
        columnsHint: d.options.length,
        nudgeTarget: null
      });
    }
  },

  ORDER_BY_WEIGHT: {
    // PRODUCE test — WEIGHT seriation via A-vs-B COMPARISON (weight is not visual). Two pans: tap a tray
    // object → it loads the next empty pan; with BOTH loaded the beam tilts toward the heavier (it DROPS)
    // + thunk, and the lighter one RISES + pulses. Tap the lighter (risen) object to send it to the next
    // हल्का→भारी slot — accepted only if it is the lightest still unplaced; else it is the lighter of a
    // heavy pair (an even lighter one exists) → soft buzz + try_again, both return. The last object
    // auto-places (it is forced). Objects render at sizes that DON'T match weight (a big balloon can be
    // light) so the SCALE is the only cue. data:{items:[{wmag,dmag,img,emoji}], arrow_lo, arrow_hi}.
    mount(host, slide){
      const d = slide.data;
      const stage = document.createElement("div"); stage.className = "ord-stage ord-weight";
      const arrow = document.createElement("div"); arrow.className = "ord-arrow";
      arrow.innerHTML = `<span>${d.arrow_lo||"हल्का"}</span><span class="ord-arrowline"></span><span>${d.arrow_hi||"भारी"}</span>`;
      const scale = document.createElement("div"); scale.className = "owt-scale";
      scale.innerHTML = `<div class="owt-foot"></div><div class="owt-post"></div>` +
        `<div class="owt-beamwrap"><div class="owt-beam"></div><div class="owt-cap"></div>` +
        `<div class="owt-arm l"></div><div class="owt-arm r"></div>` +
        `<div class="owt-pan l"><div class="owt-load"></div></div><div class="owt-pan r"><div class="owt-load"></div></div></div>`;
      const beamwrap = scale.querySelector(".owt-beamwrap");
      const panEl = { l: scale.querySelector(".owt-pan.l"), r: scale.querySelector(".owt-pan.r") };
      const loadEl = { l: panEl.l.querySelector(".owt-load"), r: panEl.r.querySelector(".owt-load") };
      const strip = document.createElement("div"); strip.className = "ord-strip";
      const n = d.items.length; const slots = [];
      for(let i=0;i<n;i++){ const sl = document.createElement("div"); sl.className = "ord-slot"; strip.appendChild(sl); slots.push(sl); }
      const tray = document.createElement("div"); tray.className = "ord-tray";
      const disp = d.items.slice(); for(let i=disp.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [disp[i],disp[j]]=[disp[j],disp[i]]; }
      const sortedW = d.items.map(o=>o.wmag).slice().sort((a,b)=>a-b);
      const tiles = disp.map(o=>{ const el = document.createElement("div"); el.className = "ord-item"; el._o = o; el._w = o.wmag; el._onpan = false;
        el.innerHTML = renderOrdObj({ mag: o.dmag, img: o.img, emoji: o.emoji }, "size"); tray.appendChild(el); return el; });
      stage.appendChild(arrow); stage.appendChild(scale); stage.appendChild(strip); stage.appendChild(tray);
      host.appendChild(stage);

      let placed = 0, wrongStreak = 0, revealed = false, busy = false; state.locked = false; state.attempts = 0;
      const pans = { l: null, r: null };
      const wantW = ()=> sortedW[placed];
      const nextTile = ()=> tiles.find(x=> !x.classList.contains("used") && x._w === wantW());
      const remaining = ()=> tiles.filter(x=> !x.classList.contains("used"));
      const markActive = ()=>{ slots.forEach((s,i)=> s.classList.toggle("active", i === placed));
        if(placed < n && !pans.l && !pans.r){ const t = nextTile(); if(t && !t._onpan) startNudge(slide, t); } else stopNudge(); };
      const resetPans = ()=>{ ["l","r"].forEach(k=>{ const t = pans[k]; if(t){ t._onpan = false; t.style.visibility = ""; }
        loadEl[k].innerHTML = ""; loadEl[k].classList.remove("lighter"); pans[k] = null; }); beamwrap.style.transform = "rotate(0deg)"; };
      const loadPan = (k, t)=>{ pans[k] = t; t._onpan = true; t.style.visibility = "hidden"; loadEl[k].innerHTML = imgOrEmojiSized(t._o.img, t._o.emoji, 56); };
      const compare = ()=>{ beamwrap.style.transform = `rotate(${(pans.r._w - pans.l._w) * 7}deg)`;   // heavier side drops
        btThunk(Math.max(pans.l._w, pans.r._w)); const lightK = pans.l._w < pans.r._w ? "l" : "r";
        loadEl[lightK].classList.add("lighter"); loadEl[lightK === "l" ? "r" : "l"].classList.remove("lighter"); };
      const placeToSlot = (t, cb)=>{ const slot = slots[placed]; slot.classList.remove("active"); slot.classList.add("filled");
        slot.innerHTML = renderOrdObj({ mag: t._o.dmag, img: t._o.img, emoji: t._o.emoji }, "size"); t.classList.add("used"); t._onpan = false; placed++;
        if(placed >= n){ state.locked = true; stopNudge();
          GameBus.emit("order_by_weight_correct", { slide_id: slide.id, phase: slide.phase, value: !revealed,
            attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
          celebrateThenAdvance(slide, revealed);
        } else markActive();
        if(cb) cb();
      };
      // when only one object remains it is forced — weigh it alone briefly, then place it.
      const autoLast = ()=>{ if(state.locked) return; const rem = remaining(); if(rem.length !== 1){ markActive(); return; }
        busy = true; const t = rem[0]; loadPan("l", t); beamwrap.style.transform = "rotate(-9deg)"; btThunk(t._w);
        setTimeout(()=>{ loadEl.l.innerHTML = ""; beamwrap.style.transform = "rotate(0deg)"; placeToSlot(t, ()=>{ busy = false; }); }, 850); };
      // tray tap → load the next empty pan (compare once both are full)
      tiles.forEach(t=>{ t.onclick = ()=>{ if(state.locked || busy || t.classList.contains("used") || t._onpan) return; stopNudge();
        if(!pans.l){ loadPan("l", t); }
        else if(!pans.r){ loadPan("r", t); compare(); }
      }; });
      // pan tap → try to place that pan's object (must be the LIGHTER of the two AND the lightest unplaced)
      ["l","r"].forEach(k=>{ panEl[k].onclick = ()=>{ if(state.locked || busy || !pans.l || !pans.r) return;
        const t = pans[k], other = pans[k === "l" ? "r" : "l"];
        if(t._w > other._w){ const lk = pans.l._w < pans.r._w ? "l" : "r";   // tapped the heavier one → re-pulse the lighter (hint), no penalty
          loadEl[lk].classList.remove("lighter"); void loadEl[lk].offsetWidth; loadEl[lk].classList.add("lighter"); return; }
        if(t._w === wantW()){ busy = true; wrongStreak = 0;   // correct: lighter AND globally lightest
          other._onpan = false; other.style.visibility = "";
          loadEl.l.innerHTML = ""; loadEl.r.innerHTML = ""; loadEl.l.classList.remove("lighter"); loadEl.r.classList.remove("lighter");
          pans.l = null; pans.r = null; beamwrap.style.transform = "rotate(0deg)";
          placeToSlot(t, ()=> setTimeout(()=>{ busy = false; autoLast(); }, 250));
        } else {   // lighter of the pair, but an even lighter one is still unplaced
          state.attempts++; GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts }); $("hintBtn").classList.add("show","hint-glow");
          if(++wrongStreak >= (CARD.scaffold_rules.max_attempts || 3)){ revealed = true; wrongStreak = 0; resetPans();
            const c = nextTile(); if(c){ c.classList.add("reveal-glow"); play(audioFor(slide, "reveal") || null, ()=>{});
              setTimeout(()=>{ c.classList.remove("reveal-glow"); busy = true; placeToSlot(c, ()=> setTimeout(()=>{ busy = false; autoLast(); }, 250)); }, 900); } }
          else { dragWrong(slide); resetPans(); }
        }
      }; });
      markActive();
      setNavActive(false); $("navBtn").onclick = ()=>{};
      $("hintBtn").onclick = ()=>{ if(!state.locked && !busy){ const t = nextTile(); if(t && !t._onpan){ t.classList.add("reveal-glow"); setTimeout(()=> t.classList.remove("reveal-glow"), 800); } } };
    }
  },

  BUILD_TO_NUMBER: {
    // Signature produce module. data: {target, mode:'guided'|'independent', topper, friend, goal_hi,
    // skyline_done, skyline_total}. Guided = dashed blueprint, auto-completes on fill. Independent =
    // free stack + "बन गया!" serve with world-enacted feedback (short/teeter, never a ✗). Ascending-
    // pitch thunk + spoken एक/दो/… per block. Geometry via offsets (throttle-safe).
    mount(host, slide){
      const d = slide.data, N = d.target, mode = d.mode || "independent";
      const stage = document.createElement("div"); stage.className = "bt-stage";
      const board = document.createElement("div"); board.className = "bt-board";
      board.innerHTML = `<span class="bt-numeral">${N}</span>` +
        (d.topper ? `<img class="bt-goalpic" src="assets/${d.topper}.png" alt="">` : "") +
        (d.goal_hi ? `<span class="bt-goallbl">${d.goal_hi}</span>` : "");
      const track = document.createElement("div"); track.className = "bt-track"; const cells = [];
      for(let i=1;i<=N;i++){ const c = document.createElement("div"); c.className = "bt-nt"; track.appendChild(c); cells.push(c); }
      const yard = document.createElement("div"); yard.className = "bt-yard";
      const crane = document.createElement("div"); crane.className = "bt-crane"; crane.innerHTML = `<img src="assets/obj_crane.png" alt="">`;
      const pile = document.createElement("div"); pile.className = "bt-pile";
      pile.innerHTML = `<div class="bt-pile-blocks"></div><span class="bt-pile-lbl">＋ ब्लॉक</span>`;
      const pb = pile.querySelector(".bt-pile-blocks");
      for(let i=0;i<3;i++){ const b = btBlock(i+1); b.style.left = (i*12) + "px"; b.style.bottom = (i*18) + "px"; pb.appendChild(b); }
      const plotwrap = document.createElement("div"); plotwrap.className = "bt-plotwrap";
      const plot = document.createElement("div"); plot.className = "bt-plot ground " + mode;
      plot.style.setProperty("--bh", Math.max(20, Math.min(46, Math.floor(230/N) - 2)) + "px");   // tall towers auto-shrink to fit
      plotwrap.appendChild(plot);
      const friend = document.createElement("div"); friend.className = "bt-friend";
      if(d.friend) friend.innerHTML = `<img src="assets/${d.friend}.png" alt="">`;
      yard.appendChild(crane); yard.appendChild(pile); yard.appendChild(plotwrap); if(d.friend) yard.appendChild(friend);
      stage.appendChild(board); stage.appendChild(track); stage.appendChild(yard);
      if(d.skyline_total) stage.appendChild(btSkyline(d.skyline_done || 0, d.skyline_total));
      let serveBtn = null;
      if(mode === "independent"){ serveBtn = document.createElement("button"); serveBtn.type = "button"; serveBtn.className = "bt-serve"; serveBtn.textContent = "बन गया!"; stage.appendChild(serveBtn); }
      host.appendChild(stage);

      let count = 0; state.locked = false; state.attempts = 0;
      const lit = ()=> cells.forEach((c,i)=>{ const on = i < count; c.classList.toggle("lit", on); c.textContent = on ? (i+1) : ""; });
      const addSound = ()=>{ btThunk(count); btDust(plot); play("assets/voiceover/vo_num_" + count + "." + AUDIO_EXT); };

      function success(){
        state.locked = true; if(serveBtn) serveBtn.disabled = true;
        if(d.topper){ const t = document.createElement("div"); t.className = "bt-topper snap"; t.innerHTML = `<img src="assets/${d.topper}.png" alt="">`; plot.appendChild(t);
          if(d.topper === "top_rocket") setTimeout(()=> t.classList.add("rocket-go"), 750); }
        if(d.friend) friend.classList.add("hop");
        sfxCorrect(); burstStars();
        const lots = [...stage.querySelectorAll(".bt-bldg")]; const nextLot = lots[d.skyline_done || 0];
        if(nextLot) setTimeout(()=> nextLot.classList.add("done"), 380);
        GameBus.emit("build_to_number_correct", { slide_id: slide.id, phase: slide.phase, value: true, target: N, attempts: state.attempts + 1, latency_ms: Date.now()-state.slideStart });
        play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT); setNavActive(true);
      }

      if(mode === "guided"){
        const ghosts = [];
        for(let i=0;i<N;i++){ const g = document.createElement("div"); g.className = "bp-slot"; plot.appendChild(g); ghosts.push(g); }
        ghosts[0].classList.add("next");
        pile.onclick = ()=>{ if(state.locked) return;
          const g = ghosts.find(x=> x.classList.contains("bp-slot"));
          if(!g){ showBox("", "बस इतने ही चाहिए!", "hint", null, ()=>{}); return; }
          g.className = "blk drop"; g.style.background = BT_COLORS[count % 5];
          count++; lit(); addSound();
          const nx = ghosts.find(x=> x.classList.contains("bp-slot")); if(nx) nx.classList.add("next");
          if(count === N) setTimeout(success, 280);
        };
      } else {
        pile.onclick = ()=>{ if(state.locked) return;
          const b = btBlock(count); b.classList.add("drop");
          b.onclick = (e)=>{ e.stopPropagation(); if(state.locked) return; b.remove(); count--; lit(); };
          plot.appendChild(b); count++; lit(); addSound(); };
        serveBtn.onclick = ()=>{ if(state.locked) return;
          if(count === N){ success(); return; }
          state.attempts++;
          GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts, made: count, target: N });
          if(count < N){ if(d.friend) friend.classList.add("peer");
            showBox("", "थोड़े और चाहिए!", "hint", null, ()=>{ if(d.friend) friend.classList.remove("peer"); }); }
          else { const bs = [...plot.querySelectorAll(".blk")]; const top = bs[bs.length-1];
            if(top){ top.classList.add("wobble"); setTimeout(()=> top.classList.remove("wobble"), 520); }
            showBox("", "अरे! एक ब्लॉक हटाओ।", "hint", null, ()=>{}); } };
      }
      setNavActive(false);
      $("navBtn").onclick = ()=>{ if(state.locked) completeSlide(true); };
      pointNudgeAt(pile);
    }
  },

  MAKE_NUMBER: {
    // produce-the-numeral dial (grafted from Firefly Valley). A set of N built blocks; ＋/− dials a
    // 1–10 numeral; wrong is inert (build dim), exact match ignites the build + snaps its topper.
    mount(host, slide){
      const d = slide.data, N = d.count;
      const stage = document.createElement("div"); stage.className = "bt-stage";
      if(d.prompt2_hi){ const lbl = document.createElement("div"); lbl.className = "pat-unit-lbl"; lbl.textContent = d.prompt2_hi; stage.appendChild(lbl); }
      const yard = document.createElement("div"); yard.className = "bt-yard";
      const plotwrap = document.createElement("div"); plotwrap.className = "bt-plotwrap";
      const plot = document.createElement("div"); plot.className = "bt-plot ground"; plot.style.filter = "grayscale(.35) brightness(.95)";
      plot.style.setProperty("--bh", Math.max(20, Math.min(46, Math.floor(230/N) - 2)) + "px");
      for(let i=0;i<N;i++){ plot.appendChild(btBlock(i)); }
      plotwrap.appendChild(plot); yard.appendChild(plotwrap);
      const dial = document.createElement("div"); dial.className = "bt-dial";
      dial.innerHTML = `<button class="bt-dial-btn" data-d="-1" type="button">−</button><div class="bt-dial-val">1</div><button class="bt-dial-btn" data-d="1" type="button">＋</button>`;
      stage.appendChild(yard); stage.appendChild(dial); host.appendChild(stage);
      let val = 1; state.locked = false; const valEl = dial.querySelector(".bt-dial-val");
      const check = ()=>{ if(val === N && !state.locked){ state.locked = true; valEl.classList.add("match"); plot.style.filter = "";
        if(d.topper){ const t = document.createElement("div"); t.className = "bt-topper snap"; t.innerHTML = `<img src="assets/${d.topper}.png" alt="">`; plot.appendChild(t); }
        sfxCorrect(); burstStars(); play("assets/voiceover/vo_total_" + N + "." + AUDIO_EXT);
        GameBus.emit("make_number_correct", { slide_id: slide.id, phase: slide.phase, value: true, count: N, latency_ms: Date.now()-state.slideStart });
        setNavActive(true); } };
      dial.querySelectorAll(".bt-dial-btn").forEach(btn=> btn.onclick = ()=>{ if(state.locked) return;
        val = Math.max(1, Math.min(10, val + parseInt(btn.dataset.d, 10))); valEl.textContent = val; sfxTap(); check(); });
      setNavActive(false); $("navBtn").onclick = ()=>{ if(state.locked) completeSlide(true); };
    }
  },

  TAP_LETTER_BY_NAME: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "letter_name_first_try",
        stimulus: null,
        options: slide.data.options,
        isCorrect: (opt) => opt.letter === slide.data.target,
        optionRenderer: (opt) => letterCell(opt.letter)
      });
    }
  },

  TAP_LETTER_BY_SOUND: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "letter_sound_first_try",
        stimulus: (()=> {
          const el = document.createElement("div"); el.className = "stimulus-pic";
          el.innerHTML = `<span class="emoji">🔊</span><span class="lbl">ध्वनि सुनो</span>`;
          el.style.cursor = "pointer";
          el.onclick = ()=>{ state.audioReplays++; play(audioFor(slide,"phoneme") || null); };
          return el;
        })(),
        options: slide.data.options,
        isCorrect: (opt) => opt.letter === slide.data.target,
        optionRenderer: (opt) => letterCell(opt.letter)
      });
    }
  },

  TAP_PICTURE_BY_LETTER: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "letter_image_match_first_try",
        stimulus: stimulusLetter(slide.data.target_letter),
        options: slide.data.options,
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => pictureCell(opt.picture, opt.emoji, opt.img)
      });
    }
  },

  TAP_LETTER_BY_PICTURE: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "image_letter_match_first_try",
        stimulus: stimulusPic(slide.data.picture, slide.data.emoji, slide.data.img),
        options: slide.data.options,
        isCorrect: (opt) => opt.letter === slide.data.target,
        optionRenderer: (opt) => letterCell(opt.letter)
      });
    }
  },

  ODD_ONE_OUT: {
    mount(host, slide){
      const sig = (slide.signals && slide.signals.on_complete && slide.signals.on_complete[0]) || "letter_recognise_first_try";
      const useShape = slide.data.options.some(o => o.shape);
      const usePic = slide.data.options.some(o => o.picture || o.word_hi || o.img);
      mountTapOptions({
        slide, host, signalName: sig,
        stimulus: null,
        options: slide.data.options,
        columnsHint: 4,
        isCorrect: (opt) => opt.is_odd === true,
        optionRenderer: (opt) => useShape
          ? shapeCell(opt)
          : usePic
            ? pictureCell(opt.word_hi || opt.picture, opt.emoji, opt.img)
            : letterCell(opt.letter),
        mastery: slide.phase === "mastery"
      });
    }
  },

  TAP_GENDER: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "gender_match_first_try",
        stimulus: stimulusPic(slide.data.noun.word_hi, slide.data.noun.emoji, slide.data.noun.img),
        options: slide.data.options,
        columnsHint: 2,
        isCorrect: (opt) => opt.gender === slide.data.target_gender,
        optionRenderer: (opt) => genderLabelCell(opt.label, opt.gender),
        mastery: slide.phase === "mastery"
      });
    }
  },

  TAP_PICTURE_BY_GENDER: {
    mount(host, slide){
      mountTapOptions({
        slide, host, signalName: "gender_match_first_try",
        stimulus: stimulusGender(slide.data.label, slide.data.target_gender),
        options: slide.data.options,
        // tap-to-answer needs ONE unambiguous key — author marks the single intended picture
        // with correct:true (matches every other TAP_* module). The old `|| gender===target`
        // fallback silently accepted any same-gender distractor, defeating buzz+✗+lock.
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => pictureCell(opt.word_hi, opt.emoji, opt.img),
        mastery: slide.phase === "mastery"
      });
    }
  },

  GENDER_INTRO: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "gender-cats";
      const cats = slide.data.categories;
      const tapped = new Set();
      cats.forEach(cat => {
        const card = document.createElement("div");
        card.className = "gender-cat " + (cat.gender === "F" ? "fem" : "masc");
        card.innerHTML =
          `<div class="cat-title">${cat.label}</div>` +
          imgOrEmoji(cat.anchor.img, cat.anchor.emoji, "cat-pic", "cat-emoji") +
          `<div class="cat-word">${cat.anchor.word_hi}</div>`;
        card.onclick = ()=>{
          card.classList.add("played");
          playChain(["assets/voiceover/" + cat.label_audio + "." + AUDIO_EXT, "assets/voiceover/" + cat.name_audio + "." + AUDIO_EXT], 0);
          tapped.add(cat.gender);
          GameBus.emit("gender_intro_tap", { slide_id: slide.id, gender: cat.gender });
          if(tapped.size >= cats.length){ stopNudge(); setNavActive(true); }
        };
        wrap.appendChild(card);
      });
      host.appendChild(wrap);
      state.gateNavUntilAudio = true;   // nav unlocks after the concept VO
      setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  MEET_GENDER: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "meet-gender";
      const n = slide.data.noun;
      wrap.innerHTML =
        `<div class="meet-pic-box">${imgOrEmoji(n.img, n.emoji, "pic-img", "pic-emoji")}<span class="pic-label">${n.word_hi}</span></div>` +
        `<div class="meet-arrow">→</div>` +
        `<div class="gender-badge${slide.data.gender === "F" ? " fem" : ""}">${slide.data.label}</div>`;
      host.appendChild(wrap);
      state.gateNavUntilAudio = true;   // nav unlocks after the model VO
      setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
    }
  },

  SORT_GENDER: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "sort-stage";
      const binsRow = document.createElement("div"); binsRow.className = "sort-bins";
      slide.data.bins.forEach(b => {
        const bin = document.createElement("div");
        bin.className = "sort-bin dd-zone" + (b.gender === "F" ? " fem" : "");   // dd-zone → drop detection
        bin.dataset.gender = b.gender;
        bin.innerHTML = `<div class="bin-title">${b.label}</div><div class="bin-items"></div>`;
        binsRow.appendChild(bin);
      });
      const tray = document.createElement("div"); tray.className = "sort-tray";
      const items = slide.data.items.slice().sort(()=> Math.random() - 0.5);
      items.forEach(it => {
        const t = document.createElement("div"); t.className = "sort-item";
        t.dataset.gender = it.gender;
        t.innerHTML = imgOrEmoji(it.img, it.emoji, "img", "emoji") + `<span class="lbl">${it.word_hi}</span>`;
        tray.appendChild(t);
      });
      wrap.appendChild(binsRow); wrap.appendChild(tray);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      let placed = 0; const need = slide.data.items.length;
      [...tray.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          const bin = zone.closest(".sort-bin"); if(!bin) return;
          state.attempts++;
          if(bin.dataset.gender === t.dataset.gender){
            t.classList.add("snapped");
            bin.querySelector(".bin-items").appendChild(t);
            placed++;
            GameBus.emit("gender_sort_item", { slide_id: slide.id, gender: t.dataset.gender, attempts: state.attempts });
            if(placed === need){
              state.locked = true;
              GameBus.emit("gender_sort_correct", {
                slide_id: slide.id, phase: slide.phase, value: true,
                attempts: state.attempts, latency_ms: Date.now() - state.slideStart
              });
              setTimeout(()=> celebrateThenAdvance(slide, false), 250);   // standard: confetti + VO + auto-advance, no popup
            }
          } else {
            bin.classList.add("hover"); bin.style.borderColor = "var(--wrong)";
            setTimeout(()=>{ bin.classList.remove("hover"); bin.style.borderColor = ""; }, 500);
            dragWrong(slide);   // buzz + Swiftie + spoken try_again (pre-readers need the spoken recovery)
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          }
        });
      });
    }
  },

  MATCH_GENDER_PAIRS: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "dd-stage";
      const zoneRow = document.createElement("div"); zoneRow.className = "dd-row";
      const zones = slide.data.pairs.slice().sort(()=> Math.random() - 0.5);
      zones.forEach(p => {
        const z = document.createElement("div"); z.className = "dd-zone"; z.dataset.accept = p.id;
        z.innerHTML = imgOrEmoji(p.f.img, p.f.emoji, "zone-img", "zone-emoji") + `<span class="zone-lbl">${p.f.word_hi}</span>`;
        zoneRow.appendChild(z);
      });
      const tileRow = document.createElement("div"); tileRow.className = "dd-row"; tileRow.style.marginTop = "34px";
      const tiles = slide.data.pairs.slice().sort(()=> Math.random() - 0.5);
      tiles.forEach(p => {
        const t = document.createElement("div"); t.className = "dd-tile pic-tile"; t.dataset.pairId = p.id;
        t.innerHTML = imgOrEmoji(p.m.img, p.m.emoji, "zone-img", "zone-emoji") + `<span class="zone-lbl">${p.m.word_hi}</span>`;
        tileRow.appendChild(t);
      });
      wrap.appendChild(zoneRow); wrap.appendChild(tileRow);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      let filled = 0, wrongStreak = 0, revealed = false; const need = slide.data.pairs.length;
      const settle = (zone, t)=>{                       // the one correct-placement path (drop AND reveal)
        zone.classList.add("filled","correct");
        // grey the matched masculine tile in place (pictures don't badge well)
        t.classList.add("matched"); t.style.transform = "";
        filled++;
        if(filled === need){ state.locked = true; setTimeout(()=> celebrateThenAdvance(slide, revealed), 250); }
      };
      // A8 reveal ceiling: after max consecutive misses, DEMONSTRATE one pair (pulse + auto-settle) so
      // the child is guided forward instead of dead-ending; run counts success=false via `revealed`.
      const revealOne = ()=>{
        const zone = [...zoneRow.children].find(z=> !z.classList.contains("filled")); if(!zone) return;
        const t = [...tileRow.children].find(x=> !x.classList.contains("matched") && x.dataset.pairId === zone.dataset.accept); if(!t) return;
        revealed = true; wrongStreak = 0;
        zone.classList.add("reveal-glow"); t.classList.add("reveal-glow");
        play(audioFor(slide,"reveal") || null, ()=>{});
        setTimeout(()=>{ zone.classList.remove("reveal-glow"); t.classList.remove("reveal-glow"); settle(zone, t); }, 1000);
      };
      [...tileRow.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          if(state.locked || zone.classList.contains("filled")) return;
          state.attempts++;
          if(zone.dataset.accept === t.dataset.pairId){
            wrongStreak = 0;
            GameBus.emit("gender_pair_match", {
              slide_id: slide.id, phase: slide.phase, value: true,
              pair: t.dataset.pairId, attempts: state.attempts
            });
            settle(zone, t);
          } else {
            zone.classList.add("filled","wrong");
            setTimeout(()=> zone.classList.remove("filled","wrong"), 600);
            dragWrong(slide);
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts||3)) revealOne();
          }
        });
      });
    }
  },

  MATCH_DRAG_1: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "dd-stage";
      // zone (target picture)
      const zoneRow = document.createElement("div"); zoneRow.className = "dd-row";
      const zone = document.createElement("div"); zone.className = "dd-zone";
      zone.innerHTML = imgOrEmoji(slide.data.target.img, slide.data.target.emoji, "zone-img", "zone-emoji") + `<span class="zone-lbl">${slide.data.target.picture||""}</span>`;
      zone.dataset.accept = slide.data.letter.letter;
      zoneRow.appendChild(zone);
      // tile
      const tileRow = document.createElement("div"); tileRow.className = "dd-row"; tileRow.style.marginTop = "30px";
      const tile = document.createElement("div"); tile.className = "dd-tile"; tile.innerHTML = `<span class="ink-glyph">${slide.data.letter.letter}</span>`;
      tileRow.appendChild(tile);
      wrap.appendChild(zoneRow); wrap.appendChild(tileRow);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      makeDraggable(tile, (zone, t) => {
        state.attempts++;
        const ok = (zone.dataset.accept === t.textContent.trim());
        if(ok){
          zone.classList.add("filled","correct");
          // snap tile into zone (badge is small — drop the ink-centering transform)
          t.classList.add("snapped");
          t.querySelector(".ink-glyph")?.style.removeProperty("transform");
          zone.appendChild(t);
          state.locked = true;
          GameBus.emit("letter_image_match_first_try", {
            slide_id: slide.id, phase: slide.phase, value: true,
            first_try: state.attempts === 1, attempts: state.attempts,
            latency_ms: Date.now()-state.slideStart
          });
          celebrateThenAdvance(slide, false);
        } else {
          zone.classList.add("filled","wrong");
          setTimeout(()=> zone.classList.remove("filled","wrong"), 600);
          dragWrong(slide);
          GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
          if(state.attempts >= (CARD.scaffold_rules.max_attempts||3)){
            state.locked = true;
            // reveal = DEMONSTRATE, don't just tell: snap the letter into its picture (dimmed pulse)
            // with the spoken reveal line, then move on as success=false.
            showBox("", audioText(slide,"reveal") || "कोई बात नहीं! इसे यहाँ रखो।", "reveal", audioFor(slide,"reveal"), ()=>{});
            setTimeout(()=>{
              zone.classList.add("filled","correct","reveal-glow");
              t.classList.add("snapped");
              t.querySelector(".ink-glyph")?.style.removeProperty("transform");
              zone.appendChild(t);
              setTimeout(()=> completeSlide(false), 1300);
            }, 900);
          }
        }
      });
    }
  },

  MATCH_DRAG_N: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "dd-stage";
      const zoneRow = document.createElement("div"); zoneRow.className = "dd-row";
      // shuffle zones so order ≠ tile order
      const zones = slide.data.pairs.slice().sort(()=> Math.random()-0.5);
      zones.forEach(p => {
        const z = document.createElement("div"); z.className = "dd-zone";
        z.innerHTML = imgOrEmoji(p.img, p.emoji, "zone-img", "zone-emoji") + `<span class="zone-lbl">${p.picture||""}</span>`;
        z.dataset.accept = p.letter;
        zoneRow.appendChild(z);
      });
      const tileRow = document.createElement("div"); tileRow.className = "dd-row"; tileRow.style.marginTop = "30px";
      const tiles = slide.data.pairs.slice().sort(()=> Math.random()-0.5);
      tiles.forEach(p => {
        const t = document.createElement("div"); t.className = "dd-tile"; t.innerHTML = `<span class="ink-glyph">${p.letter}</span>`;
        tileRow.appendChild(t);
      });
      wrap.appendChild(zoneRow); wrap.appendChild(tileRow);
      host.appendChild(wrap);

      state.attempts = 0; state.locked = false;
      let filled = 0, wrongStreak = 0, revealed = false; const need = slide.data.pairs.length;
      const settle = (zone, t)=>{                       // one correct-placement path (drop AND reveal)
        zone.classList.add("filled","correct");
        t.classList.add("snapped"); t.querySelector(".ink-glyph")?.style.removeProperty("transform"); zone.appendChild(t);
        filled++;
        if(filled === need){ state.locked = true; setTimeout(()=> celebrateThenAdvance(slide, revealed), 250); }
      };
      // A8 reveal ceiling: after max consecutive misses, demonstrate one letter→picture match.
      const revealOne = ()=>{
        const zone = [...zoneRow.children].find(z=> !z.classList.contains("filled")); if(!zone) return;
        const t = [...tileRow.children].find(x=> !x.classList.contains("snapped") && x.textContent.trim() === zone.dataset.accept); if(!t) return;
        revealed = true; wrongStreak = 0;
        zone.classList.add("reveal-glow"); t.classList.add("reveal-glow");
        play(audioFor(slide,"reveal") || null, ()=>{});
        setTimeout(()=>{ zone.classList.remove("reveal-glow"); t.classList.remove("reveal-glow"); settle(zone, t); }, 1000);
      };
      [...tileRow.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          if(state.locked || zone.classList.contains("filled")) return;
          state.attempts++;
          const ok = (zone.dataset.accept === t.textContent.trim());
          if(ok){
            wrongStreak = 0;
            GameBus.emit("letter_image_match_first_try", {
              slide_id: slide.id, phase: slide.phase, value: true,
              letter: t.textContent, attempts: state.attempts
            });
            settle(zone, t);
          } else {
            zone.classList.add("filled","wrong");
            dragWrong(slide);
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            setTimeout(()=> zone.classList.remove("filled","wrong"), 600);
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts||3)) revealOne();
          }
        });
      });
    }
  },

  SEQUENCE_DRAG: {
    mount(host, slide){
      const wrap = document.createElement("div"); wrap.className = "dd-stage";
      // slots row
      const slots = document.createElement("div"); slots.className = "seq-slots";
      slide.data.correct_order.forEach((L,i) => {
        const sl = document.createElement("div"); sl.className = "seq-slot";
        sl.dataset.accept = L; sl.dataset.idx = String(i);
        sl.classList.add("dd-zone");      // reuse drop logic
        sl.innerHTML = `<span class="ordinal">${i+1}</span>`;
        slots.appendChild(sl);
      });
      const tileRow = document.createElement("div"); tileRow.className = "dd-row"; tileRow.style.marginTop = "40px";
      slide.data.tiles.forEach(t => {
        const tl = document.createElement("div"); tl.className = "dd-tile"; tl.innerHTML = `<span class="ink-glyph">${t.letter}</span>`;
        tileRow.appendChild(tl);
      });
      wrap.appendChild(slots); wrap.appendChild(tileRow);
      host.appendChild(wrap);

      let placed = 0, wrongStreak = 0, revealed = false; const need = slide.data.correct_order.length;
      state.attempts = 0; state.locked = false;
      const settle = (zone, t)=>{                       // one correct-placement path (drop AND reveal)
        zone.classList.remove("dd-zone");
        zone.classList.add("filled","correct");
        zone.innerHTML = `<span class="ordinal">${parseInt(zone.dataset.idx,10)+1}</span><span class="ink-glyph">${t.textContent.trim()}</span>`;
        centerInkGlyph(zone.querySelector(".ink-glyph"));
        t.remove();
        placed++;
        if(placed === need){
          state.locked = true;
          GameBus.emit("letter_sequence_correct", {
            slide_id: slide.id, phase: slide.phase, value: !revealed,
            attempts: state.attempts, latency_ms: Date.now()-state.slideStart
          });
          setTimeout(()=> celebrateThenAdvance(slide, revealed), 250);
        }
      };
      // A8 reveal ceiling: after max consecutive misses, demonstrate the NEXT slot in the order.
      const revealOne = ()=>{
        const zone = [...slots.children].find(z=> !z.classList.contains("filled")); if(!zone) return;
        const t = [...tileRow.children].find(x=> x.textContent.trim() === zone.dataset.accept); if(!t) return;
        revealed = true; wrongStreak = 0;
        zone.classList.add("reveal-glow"); t.classList.add("reveal-glow");
        play(audioFor(slide,"reveal") || null, ()=>{});
        setTimeout(()=>{ zone.classList.remove("reveal-glow"); settle(zone, t); }, 1000);
      };
      [...tileRow.children].forEach(tile => {
        makeDraggable(tile, (zone, t) => {
          if(state.locked || zone.classList.contains("filled")) return;
          state.attempts++;
          const ok = (zone.dataset.accept === t.textContent.trim());
          if(ok){
            wrongStreak = 0;
            settle(zone, t);
          } else {
            zone.classList.add("wrong");
            setTimeout(()=> zone.classList.remove("wrong"), 600);
            dragWrong(slide);
            GameBus.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: state.attempts });
            if(++wrongStreak >= (CARD.scaffold_rules.max_attempts||3)) revealOne();
          }
        });
      });
    }
  },

  MASTERY_SILENT_PICK: {
    mount(host, slide){
      const mode = slide.data.mode;
      let stimulus = null, options = null, isCorrect = null, optionRenderer = null;
      if(mode === "sound_to_letter"){
        stimulus = (()=> {
          const el = document.createElement("div"); el.className = "stimulus-pic"; el.style.cursor="pointer";
          el.innerHTML = `<span class="emoji">🔊</span><span class="lbl">ध्वनि सुनो</span>`;
          el.onclick = ()=>{ state.audioReplays++; play(audioFor(slide,"phoneme") || null); };
          return el;
        })();
        options = slide.data.options;
        isCorrect = (opt) => opt.letter === slide.data.target;
        optionRenderer = (opt) => letterCell(opt.letter);
      } else if(mode === "picture_to_letter"){
        stimulus = stimulusPic(slide.data.picture, slide.data.emoji, slide.data.img);
        options = slide.data.options;
        isCorrect = (opt) => opt.letter === slide.data.target;
        optionRenderer = (opt) => letterCell(opt.letter);
      } else if(mode === "name_to_shape"){
        stimulus = (()=> {
          const el = document.createElement("div"); el.className = "stimulus-pic"; el.style.cursor="pointer";
          el.innerHTML = `<span class="emoji">🔊</span><span class="lbl">${slide.data.name || "नाम सुनो"}</span>`;
          el.onclick = ()=>{ state.audioReplays++; play(audioFor(slide,"shape_name") || null); };
          return el;
        })();
        options = slide.data.options;
        isCorrect = (opt) => opt.shape === slide.data.target;
        optionRenderer = (opt) => shapeCell(opt);
      } else if(mode === "object_to_shape"){
        stimulus = stimulusPic(slide.data.object_hi, slide.data.object_emoji, slide.data.object_img);
        options = slide.data.options;
        isCorrect = (opt) => opt.shape === slide.data.target;
        optionRenderer = (opt) => shapeCell(opt);
      } else if(mode === "shape_to_object"){
        stimulus = stimulusShape({shape: slide.data.shape, color: slide.data.color, rotate: slide.data.rotate});
        options = slide.data.options;
        isCorrect = (opt) => opt.correct === true;
        optionRenderer = (opt) => pictureCell(opt.object_hi, opt.object_emoji, opt.object_img);
      } else { // letter_to_picture
        stimulus = stimulusLetter(slide.data.letter);
        options = slide.data.options;
        isCorrect = (opt) => opt.correct === true;
        optionRenderer = (opt) => pictureCell(opt.picture, opt.emoji, opt.img);
      }
      // SAME scaffold as the rest of the lesson — hint button after 1st wrong,
      // correct/incorrect feedback popups, reveal-on-3rd-wrong. Not silent.
      // `mastery:true` keeps the mastery_score tracking (first-try = hit).
      mountTapOptions({
        slide, host, signalName: "mastery_item",
        stimulus, options, isCorrect, optionRenderer, mastery: true
      });
    }
  },

  STORY_SCENE: {
    // TEACH: one picture-story beat. Scene image fills the frame; narration VO plays on mount;
    // slow Ken-Burns pan keeps it alive for a pre-reader. Chain several in order for the story.
    mount(host, slide){
      const d = slide.data || {};
      const wrap = document.createElement("div"); wrap.className = "story-scene";
      const fb = String(d.emoji || "📖").replace(/'/g,"");
      wrap.innerHTML =
        '<div class="story-frame">' +
          '<img class="story-img" src="assets/' + d.image_id + '.' + IMG_EXT + '" alt="' + (d.alt_hi||'') + '" ' +
            'onerror="var s=document.createElement(\'span\');s.className=\'story-fallback\';s.textContent=\'' + fb + '\';this.replaceWith(s);"/>' +
        '</div>' +
        (d.caption_hi ? '<div class="story-caption">' + d.caption_hi + '</div>' : '');
      host.appendChild(wrap);
      state.ownsAudio = true; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
      state.replayAudio = ()=>{ play(audioFor(slide, "narration") || null, ()=>{}); };
      setSwMood("talk");
      let _armed = false;
      const _armNav = ()=>{ if(_armed) return; _armed = true; setNavActive(true); setSwMood("point"); };
      play(audioFor(slide, "narration") || null, _armNav);
      setTimeout(_armNav, 30000);   // watchdog: nav always eventually opens if VO buffers slowly
    }
  },

  STORY_QUESTION: {
    // TEST: a comprehension question after story beats. A recall thumb (visual anchor) + 🔊 chip
    // form the stimulus; options are 2–3 picture chips. Tap-to-answer feedback is inherited from
    // mountTapOptions. Recall thumb is a CUE, hidden at mastery / when data.hide_recall so the
    // answer isn't leaked by thumb-reading.
    mount(host, slide){
      const d = slide.data || {};
      const stim = document.createElement("div"); stim.className = "story-q-stim"; stim.style.cursor = "pointer";
      const hideRecall = slide.phase === "mastery" || d.hide_recall === true;
      const thumb = (!hideRecall && d.recall_image_id)
        ? '<img class="story-q-thumb" src="assets/' + d.recall_image_id + '.' + IMG_EXT + '" alt="" ' +
          'onerror="this.style.display=\'none\';"/>'
        : '';
      stim.innerHTML = thumb +
        '<span class="story-q-listen"><span class="emoji">🔊</span>' +
        '<span class="lbl">' + (d.stim_hi || 'प्रश्न सुनो') + '</span></span>';
      stim.onclick = ()=>{ state.audioReplays++; play(audioFor(slide, "prompt") || null); };
      mountTapOptions({
        slide, host,
        signalName: d.signal_name || "story_question_first_try",
        stimulus: stim,
        options: d.options,
        isCorrect: (opt) => opt.correct === true,
        optionRenderer: (opt) => {
          const cell = document.createElement("div");
          cell.innerHTML =
            imgOrEmoji(opt.img, opt.emoji, "story-q-opt-img", "story-q-opt-emoji") +
            (opt.label_hi ? '<span class="story-q-opt-label">' + opt.label_hi + '</span>' : '');
          return cell;
        },
        mastery: d.mastery === true,
        columnsHint: (d.options && d.options.length) <= 2 ? 2 : 3
      });
    }
  },

  TAP_IN_SCENE: {
    // "Tap the thing in the picture" — a PRODUCE-style comprehension mechanic (NOT an MCQ). A story
    // scene fills the frame; the child taps the target region(s) (e.g. the monkeys who took the caps).
    // A correct hotspot → confetti + advance; a miss → soft buzz + try_again VO; after a few idle
    // seconds the target gently pulses (hint). Data: {image_id, alt_hi, prompt, hotspots:[{x,y,w,h,
    // correct}] (as % of the frame), audio:{prompt,correct,try_again}}. Reusable for any "find X".
    mount(host, slide){
      const d = slide.data || {};
      const wrap = document.createElement("div"); wrap.className = "tis-scene";
      const frame = document.createElement("div"); frame.className = "tis-frame";
      const img = document.createElement("img"); img.className = "tis-img";
      img.src = "assets/" + d.image_id + "." + IMG_EXT; img.alt = d.alt_hi || "";
      frame.appendChild(img);
      let done = false;
      const miss = ()=>{ if(done) return; sfxWrongSoft(); setSwMood("tryagain"); play(audioFor(slide,"try_again")||null,()=>{}); };
      (d.hotspots || []).forEach(h => {
        const hs = document.createElement("button"); hs.className = "tis-hot" + (h.correct ? " correct-hot" : "");
        hs.style.left=h.x+"%"; hs.style.top=h.y+"%"; hs.style.width=h.w+"%"; hs.style.height=h.h+"%";
        hs.onclick = (e)=>{ e.stopPropagation(); if(done) return;
          if(h.correct){ done=true; hs.classList.add("hit"); sfxCorrect(); confettiCannon(); setSwMood("happy");
            GameBus.emit(d.signal_name || "scene_tap_first_try", {slide_id:slide.id, phase:slide.phase, correct:true});
            play(audioFor(slide,"correct")||null, ()=> setTimeout(()=>completeSlide(true), 900)); }
          else { hs.classList.add("shake"); miss(); } };
        frame.appendChild(hs);
      });
      frame.onclick = miss;   // tapping empty scene = gentle try_again
      wrap.appendChild(frame); host.appendChild(wrap);
      $("navBtn").style.display = "none";   // advance on the correct tap — no आगे on a pick
      state.replayAudio = ()=> play(audioFor(slide,"prompt")||null, ()=>{});
      setSwMood("point");
      play(audioFor(slide,"prompt")||null, ()=>{});
      setTimeout(()=>{ if(!done) frame.querySelectorAll(".tis-hot.correct-hot").forEach(el=>el.classList.add("pulse")); }, 6000);
    }
  },

  PHASE_TRANSITION: {
    // Additive "learning journey" beat between arc phases (the MoM "no sense of progression" fix).
    // Full-screen friendly panel: badge + "अब हम ___ करेंगे" headline + a 5-dot journey map with the
    // current step lit. The header Swiftie presents it (ONE-Swiftie rule — no second mascot). Learner-
    // paced: no auto-advance timer; आगे unlocks when the beat's VO ends (immediately if silent).
    // data:{ headline_hi, icon?, step (1-based), total_steps?, to_phase? }. Build scripts weave one of
    // these before each phase change; older cards without it are untouched (purely additive).
    mount(host, slide){
      const d = slide.data || {};
      const panel = document.createElement("div"); panel.className = "phase-transition";
      const total = d.total_steps || 5, step = Math.min(d.step || 1, total);
      let map = '<div class="pt-map">';
      for(let i = 1; i <= total; i++){
        map += `<span class="pt-step ${i < step ? 'done' : i === step ? 'current' : ''}"></span>`;
        if(i < total) map += '<span class="pt-connector"></span>';
      }
      map += '</div>';
      panel.innerHTML =
        `<div class="pt-badge">${d.icon || '🎯'}</div>` +
        `<div class="pt-headline">${d.headline_hi || slide.prompt_hi || ''}</div>` + map;
      host.appendChild(panel);
      setSwMood("teach");
      GameBus.emit("phase_transition_shown", { slide_id: slide.id, to_phase: d.to_phase || slide.phase, step });
      state.ownsAudio = true; state.locked = false; setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);
      const vo = audioFor(slide, "prompt");
      if(vo) play(vo, ()=> setNavActive(true)); else setNavActive(true);
    }
  },

  CELEBRATION: {
    mount(host, slide){
      // celebration SFX — own Audio element so it overlaps the spoken VO chain
      playSfx(slide.audio && slide.audio.sfx ? slide.audio.sfx : "sfx_celebrate");
      // show end screen overlay + a big Hindi headline (== the VO) so the finale feels like a reward
      const et = $("endTitle"); if(et) et.textContent = slide.prompt_hi || "";
      const st = $("endSubtitle"); if(st) st.textContent = (slide.data && slide.data.end_subtitle) || "";
      const es = $("endScreen"); es.classList.add("show");
      document.body.classList.add("is-end");   // r4: immersive sunburst backdrop (end_screen.webp)
      const c = $("confetti"); c.innerHTML = "";
      starBurst();   // r4: gold star burst from centre (replaces flat falling confetti)
      const masteryScore = state.masteryAttempts ? (state.masteryHits/state.masteryAttempts) : 0;
      GameBus.emit("mastery_score", { value: masteryScore, hits: state.masteryHits, attempts: state.masteryAttempts });
      GameBus.emit("lesson_completed", { skill_code: CARD.skill_code, total_signals: GameBus.signals.length });
      runValidator();
      setNavActive(false);
      // "आगे बढ़ें" appears only AFTER the celebration VO finishes (see autoPlayChain onDone)
      const eb = $("endBtn"); eb.classList.remove("show");
      state.endBtnPending = true;
      // dev-only: a small "download results" button (teacher/QA), never in child flow
      if(new URLSearchParams(location.search).has("dev") && !$("dlResults")){
        const dl = document.createElement("button"); dl.id = "dlResults"; dl.textContent = "⬇ results JSON";
        dl.style.cssText = "position:absolute;bottom:20px;left:20px;z-index:5;font-family:var(--font-hi);font-weight:700;font-size:16px;padding:8px 16px;border-radius:12px;border:2px solid #B7DCFB;background:#fff;color:var(--navy);cursor:pointer;";
        dl.onclick = ()=> GameBus.downloadResults();
        es.appendChild(dl);
      }
      /* [08][14] the completion event fires ONCE, and only on this tap - not on
         mount. XAPI.once() is the guard, so a fast double-tap cannot send it
         twice; the button also disables itself on the first tap. */
      eb.onclick = ()=>{
        if(eb.dataset.done === "1") return;
        eb.dataset.done = "1"; eb.disabled = true;
        /* [QA 06][14] score = first-try correctness over every answerable question (recordResult) */
        const firstTryScore = state.masteryAttempts ? (state.masteryHits/state.masteryAttempts) : 0;
        XAPI.once("activity_completed",
          { skill_code: CARD.skill_code, part: CARD.part_label },
          { completed: true, completion: true, progress: 100, score: firstTryScore,
            first_try_correct: state.masteryHits, questions: state.masteryAttempts,
            duration_ms: Date.now() - GameBus.startedAt });
        GameBus.emit("proceed_next", { skill_code: CARD.skill_code, part: CARD.part_label });
        try{ window.parent?.postMessage({type:"swiftpal:proceed", skill_code:CARD.skill_code, part:CARD.part_label}, "*"); }catch(e){}
      };
    }
  }
};

/* VACHAN (एकवचन/बहुवचन) + any 2-category attribute reuse the GENERIC gender modules — identical
   mechanic, just different labels. A vachan game authors these types with the category in the
   "gender" field (e.g. "S"/"P"), the two labels, and (for pairs) f=singular / m=plural; it then
   inherits immediate tap-to-answer feedback, speak-word-on-tap, layered hints, and the engine
   guard for free. Named *_VACHAN (not *_NUMBER) to avoid colliding with MEET_NUMBER = counting. */
SlideModules.VACHAN_INTRO          = SlideModules.GENDER_INTRO;
SlideModules.MEET_VACHAN           = SlideModules.MEET_GENDER;
SlideModules.TAP_VACHAN            = SlideModules.TAP_GENDER;
SlideModules.TAP_PICTURE_BY_VACHAN = SlideModules.TAP_PICTURE_BY_GENDER;
SlideModules.SORT_VACHAN           = SlideModules.SORT_GENDER;
SlideModules.MATCH_VACHAN_PAIRS    = SlideModules.MATCH_GENDER_PAIRS;

/* ---------- 13. CONTROLLER ---------- */
/* ===== FLN ANIMATION KIT: star-burst (call site) BEGIN =====
   Recipe 8 is a RETUNE of the function below, which was already the shipped
   HI01H05 original: fewer and slower (150 ticks / decay .975 / startV 14 /
   32 stars + 8 circles / spin .18 / shots 0-220-440, against 100 / .96 / 22 /
   80 + 20 / .3 / 0-150-300). Travel distance is held at ~547px so it still
   fills the same area - only the density and pace change.
   The original is kept as _starBurstOld, unreferenced, to make this reversible. */
function starBurst(){ FLNMotion.starBurst.fire({ host: "#confetti" }); }
/* ===== FLN ANIMATION KIT: star-burst (call site) END ===== */
/* r4: gold star burst for the celebration finale (adopted from Shruti's build) */
function _starBurstOld(){
  if(document.documentElement.classList.contains("no-anim")) return;
  const host = $("confetti"); if(!host) return;
  const cv = document.createElement("canvas");
  cv.width = 1333; cv.height = 750;
  cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
  host.appendChild(cv);
  const ctx = cv.getContext("2d");
  const COLORS = ["#FFE400","#FFBD00","#E89400","#FFCA6C","#FDFFB8"];
  const TICKS = 100, DECAY = 0.96, START_V = 22;
  const parts = [];
  function starPath(r){
    ctx.beginPath();
    for(let i=0;i<10;i++){
      const rad = (i % 2 === 0) ? r : r/2;
      const a = Math.PI/5*i - Math.PI/2;
      ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a)*rad, Math.sin(a)*rad);
    }
    ctx.closePath();
  }
  function shoot(){
    const add = (n, scalar, shape) => {
      for(let i=0;i<n;i++){
        const a = Math.random()*Math.PI*2;
        parts.push({ x:cv.width/2, y:cv.height/2, ax:Math.cos(a), ay:Math.sin(a),
          vel:START_V*(0.5 + Math.random()), tick:0, scalar, shape,
          color:COLORS[Math.floor(Math.random()*COLORS.length)],
          rot:Math.random()*Math.PI*2, spin:(Math.random()-.5)*0.3 });
      }
    };
    add(80, 1.8, "star");
    add(20, 1.0, "circle");
  }
  shoot(); setTimeout(shoot, 150); setTimeout(shoot, 300);
  let frames = 0;
  (function frame(){
    ctx.clearRect(0, 0, cv.width, cv.height);
    let alive = false;
    for(const p of parts){
      if(p.tick >= TICKS) continue;
      alive = true;
      p.x += p.ax*p.vel; p.y += p.ay*p.vel; p.vel *= DECAY; p.rot += p.spin; p.tick++;
      ctx.globalAlpha = 1 - p.tick/TICKS;
      ctx.fillStyle = p.color;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if(p.shape === "star"){ starPath(8*p.scalar); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(0, 0, 6*p.scalar, 0, Math.PI*2); ctx.fill(); }
      ctx.restore();
    }
    frames++;
    if(alive || frames < 30) requestAnimationFrame(frame);
    else setTimeout(()=> cv.remove(), 300);
  })();
}
function clearHost(){
  document.body.classList.remove("is-end");   // r4: clear immersive end state when leaving celebration
  $("slideHost").innerHTML = "";
  $("hintBtn").classList.remove("show");
  $("hintBtn").disabled = false;
  setNavActive(false);
  stopNudge();
  stopAudio();
}

function mountSlide(idx){
  state.idx = idx;
  state.slideStart = Date.now();
  state.attempts = 0; state.selectedKey = null; state.locked = false;
  state.hintUsed = false; state.nudgeUsed = false; state.scaffoldLevel = 0; state.hintActive = false;
  state.audioReplays = 0; state.gateNavUntilAudio = false; state.endBtnPending = false;
  state.replayAudio = null;   // a module may set a slide-specific replay (e.g. teach slides whose
                              // audio roles aren't in the autoPlayChain order); else the chip replays the chain
  state.ownsAudio = false;    // a module that drives its OWN audio sequence sets this → skip autoPlayChain
                              // (else the auto prompt-chain stomps/truncates the module's timed VO)
  const slide = CARD.slides[idx];
  /* [14] question_started - only on slides that actually ask something */
  try{ if(XAPI_ANSWERABLE.indexOf(slide.type) >= 0)
         XAPI.send("question_started", { slide_id: slide.id, type: slide.type, phase: slide.phase }); }catch(e){}
  clearHost();

  // header prompt
  $("promptText").textContent = slide.prompt_hi || "";

  // Hint button stays HIDDEN until the learner makes a wrong attempt, then it is
  // exposed (graduated scaffold). Mastery uses the SAME scaffold — not excluded.
  $("hintBtn").classList.remove("show");
  $("hintBtn").style.display = "";
  $("navBtn").style.display = "";        // restored by default; tap-to-answer slides hide it themselves
  // [16i] DEFAULT nav wiring — a module that enables आगे without overriding onclick still advances.
  // (DEMO_COUNT shipped an enabled-but-dead button; auto-INTRO inherited an unfulfillable tap guard.)
  $("navBtn").onclick = ()=> completeSlide(true);
  setSwMood("point");                    // Swiftie turns to present each new slide

  GameBus.emit("slide_entered", { slide_id: slide.id, phase: slide.phase, eis: slide.eis, type: slide.type, idx });

  // audio chip = replay the slide audio. Prefer a module-supplied replay (teach slides own their
  // count_intro/explain sequence, which autoPlayChain deliberately skips), else replay the chain.
  $("audioChip").onclick = ()=>{
    if(!replayTap(slide, "header_chip")) return;
    if(state.replayAudio) state.replayAudio(); else autoPlayChain(slide);
  };

  // mount the type
  const mod = SlideModules[slide.type];
  if(!mod){ console.error("[engine] no module for", slide.type); return; }
  // [engine JS] r4/F1 TEACHING FRAME: tutorial slides mount inside a grid-paper .tut-card (header hidden,
  // prompt in-card, standing Swiftie bottom-left + shoulder audio chip). Type-agnostic — any tutorial-phase
  // module renders into the card. Non-tutorial slides mount bare into slideHost as before.
  const isTut = (slide.phase === "tutorial" && slide.type !== "PHASE_TRANSITION" && slide.type !== "CELEBRATION");
  $("stage").classList.toggle("tut", isTut);
  document.body.classList.toggle("tut-page", isTut);
  let mountHost = $("slideHost");
  if(isTut){
    const card = document.createElement("div"); card.className = "tut-card";
    card.innerHTML = `<div class="tut-prompt">${slide.prompt_hi || ""}</div>` +
      `<img class="tut-mascot" src="assets/start_mascot.webp" alt="" onerror="this.style.display='none'">` +
      /* [05][11] QA CHECKLIST: the in-slide speaker chip is the inline SVG -
         gradient + white ring + wave arcs - never a flat PNG. Verbatim HI01. */
      `<span class="tut-audio" role="button" aria-label="फिर से सुनो"><svg viewBox="0 0 62 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Audio"><g filter="url(#tutChipShadow)"><rect x="8" y="4" width="46" height="44" rx="22" fill="url(#tutChipGrad)"/><rect x="6" y="2" width="50" height="48" rx="24" stroke="white" stroke-width="4"/><path d="M29.8466 19.0574C29.8804 19.0524 29.9145 19.0496 29.9487 19.0488C30.6094 19.0317 31.0021 19.5124 31.0015 20.1414C31.0008 20.9661 31.0003 21.7911 31.0005 22.6158L31.001 27.7212L31.0009 30.5591C31.0009 31.0364 31.0122 31.5472 30.9863 32.0228C30.9662 32.2709 30.902 32.4608 30.7251 32.643C30.3831 32.9952 29.8337 33.0842 29.4386 32.7671C29.0784 32.4781 28.7473 32.1159 28.4181 31.7862L26.4414 29.8087C26.1771 29.5426 25.9071 29.2636 25.6339 29.0081C25.0227 28.9649 24.3645 29.017 23.7487 28.9979C23.445 28.9885 23.1625 29.0211 22.8589 28.9606C22.3751 28.8616 22.0618 28.4823 22.0642 27.9824C22.0706 26.5937 22.0287 25.1949 22.0828 23.8081C22.0884 23.6626 22.2302 23.4334 22.3309 23.3252C22.454 23.1907 22.6146 23.0963 22.792 23.0543C23.0567 22.9904 23.5328 23.016 23.8224 23.0128C24.4143 23.0063 25.0171 23.0277 25.609 23.0073C25.6794 22.9529 25.8505 22.7743 25.919 22.706L26.5305 22.0945L28.5396 20.0838C28.9157 19.7059 29.3217 19.1749 29.8466 19.0574Z" fill="white"/><path class="wv wv2" d="M36.2367 18.6905C36.8783 18.6449 37.3041 19.231 37.6725 19.6829C38.7675 21.0046 39.4982 22.5894 39.7923 24.2804C40.2503 26.8763 39.6548 29.5478 38.1378 31.7035C37.8393 32.1274 37.508 32.5324 37.149 32.9063C36.9404 33.1236 36.7646 33.2558 36.4622 33.3081C36.2013 33.3412 35.9378 33.2717 35.7272 33.1144C35.5185 32.9615 35.3816 32.7298 35.3483 32.4733C35.2786 31.9235 35.5696 31.6821 35.8914 31.3297C36.0448 31.1639 36.1901 30.9908 36.3269 30.811C38.3669 28.136 38.4986 24.4654 36.6555 21.6511C36.4826 21.3899 36.2966 21.1376 36.0984 20.8951C35.8252 20.5652 35.3947 20.2691 35.3472 19.8184C35.2845 19.2225 35.6439 18.768 36.2367 18.6905Z" fill="white"/><path class="wv wv1" d="M33.3868 21.5044C33.9769 21.4549 34.2563 21.7845 34.5981 22.1981C35.1982 22.924 35.6149 23.7691 35.8211 24.6886C36.171 26.2384 35.8867 27.8637 35.0314 29.2026C34.7421 29.6568 34.2333 30.3745 33.6937 30.4946C33.1633 30.5437 32.6759 30.2927 32.5495 29.7376C32.3921 29.0462 32.9849 28.6956 33.3274 28.1763C34.2088 26.833 34.1932 25.0908 33.288 23.7635C33.0747 23.4522 32.6159 23.0564 32.5518 22.7133C32.4377 22.1027 32.7745 21.619 33.3868 21.5044Z" fill="white"/></g><defs><filter id="tutChipShadow" x="0" y="0" width="62" height="60" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="4"/><feGaussianBlur stdDeviation="2"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter><linearGradient id="tutChipGrad" x1="8" y1="26" x2="54" y2="26" gradientUnits="userSpaceOnUse"><stop stop-color="#1987FC"/><stop offset="1" stop-color="#1565F4"/></linearGradient></defs></svg></span>`;
    const inner = document.createElement("div"); inner.className = "tut-content";
    card.insertBefore(inner, card.querySelector(".tut-mascot"));
    card.querySelector(".tut-audio").onclick = ()=>{
      if(!replayTap(slide, "tut_chip")) return;
      if(state.replayAudio) state.replayAudio(); else autoPlayChain(slide);
    };
    $("slideHost").appendChild(card);
    mountHost = inner;
  }
  /* ===== DECK ART: the object being measured =============================
     The review deck shows each page's real object (table, door, पलंग, अलमारी…)
     with the blocks laid along it; the build had no assets/ at all, so
     every slide rendered a bare row of 🧱 fallbacks. The cut-outs are imported
     from the deck and named per slide in data.scene_img. Injected here, ahead of
     mod.mount, rather than inside each module, so DEMO_COUNT / MAKE_SET /
     COUNT_HOW_MANY all pick it up without touching their own render paths. */
  /* ONE ROW, ALWAYS, on a measuring slide. per_row groups the set into rows of
     N, which on P2 laid 7 units out as 6 + 1 - a measurement broken across two
     lines is not a measurement. Previously this reset lived inside the scene_img
     branch, so the two slides that ship no scene art kept wrapping. */
  /* .mk-on carries every kit style, so it is keyed off the slide being a
     measuring one - NOT off it happening to ship scene art. P2/P3/P4 have no
     scene picture and were left with the default gutters between their units. */
  $("stage").classList.toggle("mk-on", mkIsMeasure(slide));
  if(mkIsMeasure(slide) && slide.data && slide.data.per_row) slide.data.per_row = 0;
  if(slide.data && slide.data.scene_img){
    const fig = document.createElement("div"); fig.className = "measure-obj";
    fig.innerHTML = imgOrEmoji(slide.data.scene_img, (slide.data.object||{}).emoji || "", "measure-obj-img", "measure-obj-emoji");
    mountHost.appendChild(fig);
    /* [kit] bracket the object with the sheet's START / END markers, so the child
       can see WHAT is being measured - from this edge to that edge - before a
       single block is laid. Measuring slides also switch their block row to the
       flush .mk-rail (no gaps between units), which is the skill itself. */
    if(mkIsMeasure(slide)) mkAddMarkers(fig);
  }
  mkClearFloats();   // the floats live on .slide-stage, which outlives #slideHost
  mod.mount(mountHost, slide);
  // game-feel: animate the slide content in on every mount
  { const _sh = $("slideHost"); _sh.classList.remove("slide-in"); void _sh.offsetWidth; _sh.classList.add("slide-in"); }

  // vertically ink-centre every Devanagari glyph once the slide has laid out
  requestAnimationFrame(()=> centerAllGlyphs($("slideHost")));

  // play the full VO chain automatically (prompt → phoneme/word_name → instruction).
  // If the slide gated its nav button on audio, enable it once the chain finishes
  // (so students can't skip before hearing it). SKIP when the module owns its audio
  // (state.ownsAudio) — else this chain stomps/truncates the module's own timed VO.
  if(!state.ownsAudio){
    autoPlayChain(slide, ()=>{
      if(state.gateNavUntilAudio) setNavActive(true);
      if(state.endBtnPending){ $("endBtn").classList.add("show"); state.endBtnPending = false; }
    });
  }
}

/* ---------- [engine JS] r4/P1 PHASE-TRANSITION PEEK GATE (Shruti's peek beat) ----------
   An automatic interstitial fired ON A PHASE BOUNDARY (not a slide type): blur the stage, Swiftie
   peeks up from the bottom under a big headline, hold ≥2s, then mount the next slide. Kept ALONGSIDE
   our journey-map PHASE_TRANSITION module (a distinct, author-placed slide type) — the gate below
   skips PHASE_TRANSITION + CELEBRATION so the two never double-fire. */
function afterConfetti(fn){
  /* ===== FLN ANIMATION KIT: confetti (advance gate) BEGIN =====
     Recipe 7 renders into .fx-confetti, not the retired .conf-shot, so this gate
     was about to poll for an element that can no longer exist and wave every
     slide straight through mid-celebration. FLNMotion.confetti.after() is the
     kit's own version of this poll, with the same 8s cap. */
  FLNMotion.confetti.after(fn);
  /* ===== FLN ANIMATION KIT: confetti (advance gate) END ===== */
}
/* onscreen headline per gate (display only; distinct from any narration). Eligibility = phase IN this map. */
const PHASE_GATE_TITLE = { tutorial:"चलिए, शुरू करें!", guided:"चलिए, साथ में करें!", practice:"अब आपकी बारी!" };   // [16h] the lead’s official transition lines (VO = full sentences in the card manifest; NOTE aap-register — flagged)
const PHASE_GATE_VO    = { tutorial:"vo_pt_tutorial", guided:"vo_pt_guided", practice:"vo_pt_practice" };
/* [peek-2] The clip's own length, and the CSS duck-down that follows it. Both are contracts
   with assets/gif/peeking.webp and @keyframes pgDuck — if either is re-cut, change it here too. */
const ANIM_ASSETS = ["loader.gif", "new_landing_swiftee_anim.webp", "peeking.webp", "sw_anim_talk.gif", "sw_anim_teach.gif", "sw_anim_tryagain.gif", "sw_head_celebrate_anim.webp", "sw_head_hint_anim.webp", "sw_head_tryagain_anim.webp", "sw_lg_celebrating_anim.webp"];
const PG_CLIP_MS = 9720;  // peeking.webp: hands arrive, peek, blink, come out, talk with blinks, duck back; 9.72s, plays once.
const PG_EXIT_MS = 520;    // .phase-gate.leaving / @keyframes pgDuck - a FALLBACK bound only; animationend is what actually closes the gate
const _gatedPhases = new Set();   // each phase gate plays ONCE (Start→tutorial, →guided, →practice)
let _gateToken = 0;
function phaseBlurTransition(cb, toPhase){
  const tok = ++_gateToken;
  stopNudge(); stopAudio();
  const gate = $("phaseGate"), img = $("phaseGateImg");
  if(img) img.src = "assets/gif/peeking.webp?r=" + Date.now();   // restart the loop each time (cache-bust)
  const title = $("phaseGateTitle"); if(title) title.textContent = PHASE_GATE_TITLE[toPhase] || "";
  $("stage").classList.add("blurred", "gating");
  document.body.classList.add("gating");
  gate.classList.remove("leaving");   // a gate interrupted mid-exit would open her already off-screen
  gate.classList.add("show");
  GameBus.emit("phase_transition", { to: toPhase });
  const closeGate = ()=>{ gate.classList.remove("show", "leaving"); $("stage").classList.remove("blurred", "gating"); document.body.classList.remove("gating"); };
  // VO only if the card actually ships it; else a silent beat — the 2s min-hold keeps the peek visible.
  const voId = PHASE_GATE_VO[toPhase];
  const voSrc = (voId && CARD.assets && CARD.assets.audio && CARD.assets.audio[voId]) || null;
  const openedAt = Date.now();
  play(voSrc, ()=>{
    if(tok !== _gateToken){ closeGate(); return; }               // a newer gate superseded us
    /* peeking.webp now plays ONCE: rise, talk, then park on her smile (PG_CLIP_MS).
       The floor is that clip plus the duck-down, so the beat always completes even
       with no VO or a short one - the old 3100ms floor was cut to the 3.03s looping
       clip and closed the gate mid-rise on a silent card. If a future VO is LONGER
       than the clip, the VO still governs: play()'s callback is what starts this
       timer, and Swiftie holds her parked smile until it fires. */
    const hold = Math.max(0, PG_CLIP_MS - (Date.now() - openedAt));
    const finish = ()=>{
      gate.classList.remove("show", "leaving");
      $("stage").classList.remove("blurred");
      if(cb) cb();                              // mounts the next slide
      $("stage").classList.remove("gating");    // header returns once the slide is in
      document.body.classList.remove("gating");
    };
    /* Send her back down BEFORE the gate is torn down, not with it - the clip no longer
       ducks on its own (it can't: it would have to know how long the VO is). The close
       waits on animationend, NOT on a matching setTimeout: a fixed PG_EXIT_MS timer
       raced the animation and lost - decoding the clip's tail delayed the animation's
       first frame by ~270ms, so the gate vanished with Swiftie still barely moved. */
    setTimeout(()=>{
      if(tok !== _gateToken){ closeGate(); return; }   // a newer gate superseded us
      let done = false, fallback = 0;
      const once = ()=>{
        if(done) return; done = true;
        clearTimeout(fallback);
        if(img) img.removeEventListener("animationend", once);
        if(tok !== _gateToken){ closeGate(); return; }
        finish();
      };
      if(img) img.addEventListener("animationend", once);
      gate.classList.add("leaving");
      // reduced-motion, a missing clip, a backgrounded tab: nothing to end, so close anyway
      fallback = setTimeout(once, PG_EXIT_MS + 500);
    }, hold);
  });
}

function completeSlide(success){
  const slide = CARD.slides[state.idx];
  GameBus.emit("slide_completed", {
    slide_id: slide.id, phase: slide.phase, success: !!success,
    attempts: state.attempts + (success ? 1 : 0), latency_ms: Date.now()-state.slideStart,
    scaffold_level: state.scaffoldLevel, hint_used: state.hintUsed,
    nudge_used: state.nudgeUsed, audio_replays: state.audioReplays
  });
  if(state.idx >= CARD.slides.length - 1){
    // last slide is CELEBRATION; nothing more
    return;
  }
  // advance only AFTER the correct-answer confetti has landed (to the gate AND to the next slide alike).
  const fromIdx = state.idx, nextIdx = state.idx + 1;
  const next = CARD.slides[nextIdx];
  if(next && next.phase !== slide.phase && next.type !== "CELEBRATION" && next.type !== "PHASE_TRANSITION"
     && PHASE_GATE_TITLE[next.phase] && !_gatedPhases.has(next.phase)){
    _gatedPhases.add(next.phase);
    afterConfetti(()=>{ if(state.idx === fromIdx) phaseBlurTransition(()=> mountSlide(nextIdx), next.phase); });
    return;
  }
  afterConfetti(()=>{ if(state.idx === fromIdx) mountSlide(nextIdx); });
}

/* ---------- 14. VALIDATOR (runtime self-check) ---------- */
function runValidator(){
  const missing = (CARD.signals_expected || []).filter(s => !GameBus.firedSet.has(s));
  GameBus.validatorReport.missing_signals = missing;
  GameBus.validatorReport.passed = missing.length === 0;
  console.log("[validator]", GameBus.validatorReport);
  try{ window.parent?.postMessage({type:"swiftpal:lesson_complete", signals: GameBus.signals, validatorReport: GameBus.validatorReport}, "*"); }catch(e){}
  // offline self-capture: write the final record to localStorage; optionally POST
  // it to a learning-record endpoint if one is configured AND the device is online.
  GameBus.persist();
  if(TELEMETRY.endpoint && navigator.onLine){
    try{ fetch(TELEMETRY.endpoint, {method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(GameBus.exportResults()), keepalive:true}).catch(()=>{}); }catch(e){}
  }
  // dev banner
  if(new URLSearchParams(location.search).has("dev")){
    const b = $("devBanner");
    if(missing.length === 0){ b.textContent = "✓ all expected signals fired"; b.className = "dev-banner show ok"; }
    else { b.textContent = "✗ missing signals: " + missing.join(", "); b.className = "dev-banner show"; }
  }
}

/* ---------- [engine JS] r4/#2 DATA-DRIVEN LANDING CONCEPT STRIP ----------
   A landing_hero of kind "concept_strip" renders N visual-example tiles from card data, so any game
   declares its landing preview in card.json instead of hand-editing HTML. Tile types: discs (size),
   bars (length), balance (weight — equal-size objects, heavier lower, never a size cue), image. */
const SG_BALANCE_SVG =
  '<svg viewBox="0 0 124 112" xmlns="http://www.w3.org/2000/svg">' +
  '<line x1="62" y1="30" x2="62" y2="86" stroke="#8AA0C8" stroke-width="6" stroke-linecap="round"/>' +
  '<polygon points="62,60 44,100 80,100" fill="#8AA0C8"/>' +
  '<g transform="rotate(-13 62 34)">' +
  '<rect x="14" y="30" width="96" height="11" rx="5.5" fill="#4EA3F0"/>' +
  '<circle cx="22" cy="20" r="14" fill="#FBD24B" stroke="#D9A21A" stroke-width="2.5"/>' +
  '<circle cx="102" cy="20" r="14" fill="#98A2B3" stroke="#5B6577" stroke-width="2.5"/>' +
  '</g></svg>';
function conceptTileHTML(c){
  const lbl = c && c.label ? ` aria-label="${c.label}"` : "";   // a11y only; not shown (pre-reader → visual+VO)
  switch(c && c.type){
    case "discs": {
      const sizes = c.sizes || [34, 54, 76];
      return `<div class="sg-ex sg-ex-size" role="img"${lbl}>` +
        sizes.map(s => `<span class="sg-disc" style="width:${s}px;height:${s}px"></span>`).join("") + `</div>`;
    }
    case "bars": {
      const widths = c.widths || [42, 72, 102];
      return `<div class="sg-ex sg-ex-len" role="img"${lbl}>` +
        widths.map(w => `<span class="sg-bar" style="width:${w}px"></span>`).join("") + `</div>`;
    }
    case "balance":
      return `<div class="sg-ex sg-ex-wt" role="img"${lbl}>` + SG_BALANCE_SVG + `</div>`;
    case "image":
      return `<div class="sg-ex" role="img"${lbl}><img src="${c.src}" alt="${c.label || ''}"></div>`;
    default:
      return "";
  }
}

/* ---------- 15. BOOT ---------- */
function boot(){
  /* [14] activity_launched - once, at mount */
  try{ XAPI.once("activity_launched", { skill_code: CARD.skill_code, title: (CARD.title&&CARD.title.en)||"" }); }catch(e){}
  // god-mode visual theme (opt-in via CARD.theme) — warms the whole stage; scoped CSS under .thm-*
  if(CARD.theme) $("stage").classList.add("thm-" + CARD.theme);
  // banner title = skill name only (strip "(भाग…)" and the ": letters" list)
  $("sgTitle").textContent = (CARD.title.hi || "").split(/[:：(]/)[0].trim();
  // VISUAL-FIRST landing hero: SHOW the concept (shapes row / a finger-hand / an image), not just the title text
  (function(){ const hero = CARD.landing_hero, el = $("sgHero"); if(!hero || !el) return;
    if(hero.kind === "concept_strip"){
      // r4/#2: each cell is a .sg-acell (keeps the staggered fingerPop pop-in) wrapping a visual example.
      el.innerHTML = (hero.cells || []).map(c => `<div class="sg-acell">${conceptTileHTML(c)}</div>`).join("");
      /* HI01 PARITY: the early `return` here kept MTG's own landing type scale - 60px title and a
         150px content margin - by skipping the .compact / .has-hero classes every other hero kind
         adds. That is the whole remaining title-size and spacing gap against HI01, which runs the
         42px compact title and a 120px has-hero margin. Falling through instead of returning. */
    }
    if(hero.kind === "shapes" && typeof shapeSVG === "function")
      el.innerHTML = (hero.shapes||[]).map(s=> shapeSVG(s.shape, {color:s.color, size:104, rotate:s.rotate||0})).join("");
    else if(hero.kind === "count"){
      // counting game: preview the WHOLE 1..n sequence — a row of hands (1,2,3…), each with its Arabic numeral
      const hi = Math.min(Math.max(parseInt(hero.n,10)||3, 1), 5);   // clamp to available hand art (1..5)
      let cells = "";
      for(let i=1;i<=hi;i++){
        cells += `<div class="sg-hand-cell">${fingerCount(i, "sg-hand")}<span class="sg-hand-num">${devNumeral(i)}</span></div>`;
      }
      el.innerHTML = cells;
    }
    else if(hero.kind === "image") el.innerHTML = `<img src="${hero.src}" alt="">`;
    if(el.innerHTML){ el.classList.add("show"); $("sgTitle").classList.add("compact");
      const c = el.closest && el.closest(".sg-content"); if(c){ c.classList.add("has-hero");
        // SME (S01 review deck): landing reads TITLE first, image BELOW it, image smaller.
        if(hero.title_first) c.classList.add("title-first"); } }
  })();

  // ----- landing-screen welcome VO (lead review) -----
  // A warm greeting on the title screen. Autoplay is often blocked before a gesture, so we also
  // (a) expose a pulsing 🔊 "listen" button, and (b) fire it on the first pointer-down. The whole
  // greeting lives HERE now (not on slide 0), which also kills the old overlap glitch where the
  // landing VO and slide-0 VO could talk over each other.
  const landSrc = (CARD.assets && CARD.assets.audio && CARD.assets.audio["vo_landing"]) || ("assets/voiceover/vo_landing." + AUDIO_EXT);
  /* ---- PLAY BUTTON WAITS FOR THE GREETING, THEN POPS (as HI02H11_L01_S01, the reference game) ----
     While the landing greeting speaks, the play button is shown but DISABLED in its grey waiting art
     (btn-play-blob-waiting.svg) - a bright button that ignores taps reads as broken. When the greeting
     ENDS it swaps to the gold art with a one-shot pop + gold ring (.sg-pop), and becomes tappable.
     If the child then does nothing for 5s it starts the strong idle pulse (.idle-pulse, the reference's
     sgBtnPulseStrong); any tap on the landing restarts that 5s timer.
     "Heard" means the clip really played to its end (voEl.ended). When the browser BLOCKS autoplay the
     button stays grey and the child's first tap - anywhere, the grey button included - starts the
     greeting, so the pop still lands exactly when the greeting ends. Never strands the child: a 15s
     watchdog releases the button even if the greeting never reports back at all.
     NB the waiting state is .sg-waiting + aria-disabled, NOT the disabled attribute - a disabled
     button swallows the tap that has to start a blocked greeting. */
  let _greetingHeard = false, _startIdleT = 0, _startWatchT = 0;
  const onLandingNow = ()=> { const g = $("startGate"); return g && !g.classList.contains("hidden"); };
  const startWaiting = ()=>{ const b = $("sgBtn"); return !b || b.classList.contains("sg-waiting"); };
  const disarmStartPulse = ()=>{ clearTimeout(_startIdleT); _startIdleT = 0; const b = $("sgBtn"); if(b) b.classList.remove("idle-pulse"); };
  const armStartPulse = ()=>{
    disarmStartPulse();
    _startIdleT = setTimeout(()=>{ const b = $("sgBtn"); if(b && !startWaiting() && onLandingNow()) b.classList.add("idle-pulse"); }, 5000);
  };
  const setStartBtnReady = (ready)=>{
    const b = $("sgBtn"); if(!b) return;
    const img = b.querySelector("img");
    const was = !startWaiting();
    b.disabled = false;
    b.classList.toggle("sg-waiting", !ready);
    b.setAttribute("aria-disabled", ready ? "false" : "true");
    if(img) img.src = ready ? "assets/btn-play-blob.svg" : "assets/btn-play-blob-waiting.svg";
    if(!ready){ disarmStartPulse(); b.classList.remove("sg-pop"); return; }
    if(!was){ b.classList.remove("sg-pop"); void b.offsetWidth; b.classList.add("sg-pop");
      setTimeout(()=> b.classList.remove("sg-pop"), 900); }
    armStartPulse();
  };
  setStartBtnReady(false);   // grey + disabled from first paint, until the greeting has been heard
  const releaseStart = ()=>{ clearTimeout(_startWatchT); if(onLandingNow()) setStartBtnReady(true); };
  const playLanding = ()=>{
    if(!onLandingNow()) return;
    clearTimeout(_startWatchT); _startWatchT = setTimeout(releaseStart, 15000);   // watchdog
    /* released only when the greeting was really heard; a blocked/failed start leaves it grey for the
       child's first tap (or the watchdog) */
    play(landSrc, ()=>{ if(voEl.ended){ _greetingHeard = true; releaseStart(); } });
  };
  // any tap on the landing restarts the 5s idle timer (only once the button is live)
  window.addEventListener("pointerdown", ()=>{ if(onLandingNow() && !startWaiting()) armStartPulse(); }, true);
  const sgVo = $("sgVo"); if(sgVo) sgVo.onclick = (e)=>{ e.stopPropagation();
    if(replayTap(null, "landing_chip")) playLanding(); };   // [QA 11] the landing chip reports audio_replayed too
  // ---- [engine JS] r4/P2 boot loader: loader.gif until assets warm, then it dismisses ITSELF into
  // the landing (NO tap gate). DUAL auto-dismiss (window 'load' OR a 2.5s watchdog — never strand the
  // child), deduped by .done. The same handler adds body.loaded (unblocks the concept-strip stagger)
  // and fires the landing VO. play() absorbs an autoplay block; the pulsing 🔊 chip is the fallback. ----
  (function(){
    const bl = $("bootLoader"); if(!bl){ document.body.classList.add("loaded"); playLanding(); return; }
    const ready = ()=>{
      if(bl.classList.contains("done")) return;   // load event + watchdog both land here → dedup
      bl.classList.add("done");
      document.body.classList.add("loaded");       // starts the .sg-acell pop chain
      /* [QA 03] the landing wave plays ONCE (the .webp's loop count is 1). It decodes under the
         loader, so without a restart the one wave would be spent before the child sees it -
         re-point the src (cache-busted, same trick as peeking.webp) the moment the loader lifts. */
      const sgm = document.querySelector(".sg-mascot");
      if(sgm){ const base = (sgm.getAttribute("src") || "").split("?")[0]; if(base) sgm.src = base + "?r=" + Date.now(); }
      playLanding();
      setTimeout(()=> bl.remove(), 450);
    };
    /* ===== QA CHECKLIST [02]: PRELOAD EVERYTHING BEFORE THE START SCREEN =====
       `window.load` only waits for nodes already in the DOM. Every image this
       game uses is either a CSS background or injected per-slide, and no audio
       was warmed at all, so art and VO popped in mid-lesson. This walks the
       real asset list - card images, card audio, and the UI art the stylesheet
       and slides reference - and holds the branded loader until all of it has
       resolved, plus document.fonts.ready so no glyph reflows after paint.
       A FAILED ASSET COUNTS AS DONE, so a 404 can never strand the child. */
    const PRELOAD = (function(){
      const ext = (CARD.assets && CARD.assets.audio_ext) || AUDIO_EXT;
      const imgs = [], auds = [];
      const A = (CARD.assets || {});
      Object.keys(A.image || {}).forEach(k => imgs.push(A.image[k]));
      Object.keys(A.audio || {}).forEach(k => {
        const v = A.audio[k];
        auds.push(typeof v === "string" && v.indexOf("assets/") === 0 ? v : "assets/voiceover/" + k + "." + ext);
      });
      auds.push("assets/voiceover/sfx_celebrate." + ext);   /* [QA 02] the celebration sting (playSfx), not in the VO map */
      [ "loader.gif","startnew_bg_plain.webp","start_card.webp","background_1st_screen.webp","pencil_purple.webp","new_landing_swiftee_anim.webp",
        "end_screen.webp","peeking.webp","nudge_hand_new.svg","mascot.webp",
        "bgdeco_star.svg","bgdeco_star_o.svg","bgdeco_spark.svg",
        "sw_head_talking.webp","sw_head_celebrate.webp","sw_head_celebrate_anim.webp",
        "sw_head_hint.webp","sw_head_hint_anim.webp","sw_head_neutral.webp",
        "sw_head_tryagain.webp","sw_head_tryagain_anim.webp",
        "sw_lg_celebrating_anim.webp",
        /* [QA 02] used in play but missing from this list: the tutorial-card mascot (every tutorial
           slide), the landing play button, and the feedback-card rest pose */
        "start_mascot.webp","btn-play-blob.svg","btn-play-blob-waiting.svg","sw_anim_rest.png",
        /* [QA 10] the real button assets (default + deactive) */
        "btn-next-default.svg","btn-next-deactive.svg","btn-continue-default.svg","btn-continue-deactive.svg"
      ].forEach(f => imgs.push("assets/" + (ANIM_ASSETS.indexOf(f) >= 0 ? "gif/" : "") + f));
      /* deck object art - preload so it never pops in mid-lesson [QA 02] */
      ["obj_door","obj_bed","obj_almirah","obj_pillow","obj_fridge","obj_mat_1","obj_chairs"   /* [QA 01] only the ones a slide shows */
      ].forEach(f => imgs.push("assets/" + f + ".webp"));
      /* [kit] measurement art kit - the block states, markers, wrong-way figures,
         result plate and the Swiftie poses the feedback card reads. */
      ["mk_table_plain","mk_table_small",
       "mk_block","mk_block_placed","mk_block_ghost","mk_block_glow",
       "mk_marker_start","mk_marker_end","mk_err_gap","mk_err_overlap",
       "mk_sparkle","mk_badge_blank",
       "mk_sw_explain","mk_sw_guide","mk_sw_cheer"   /* [QA 01] the three poses MK.sw actually reads */
      ].forEach(f => imgs.push("assets/" + f + "." + IMG_EXT));
      return { imgs: imgs, auds: auds, total: imgs.length + auds.length };
    })();

    let _left = PRELOAD.total + 1;                    // +1 for the font pass
    const _tick = ()=>{ if(--_left <= 0) ready(); };  // a 404 still ticks - never strand
    PRELOAD.imgs.forEach(src => { const i = new Image(); i.onload = i.onerror = _tick; i.src = src; });
    PRELOAD.auds.forEach(src => {
      const a = new Audio(); let fired = false;
      /* once fetched, drop the element's source: the bytes stay in the HTTP cache for play(),
         and the media player behind this element is released instead of held all session.
         canplaythrough fires BEFORE a long clip is fully downloaded, so the release waits until
         the whole clip is buffered (or 15s) - releasing early aborted the tail of vo_t2_prompt. */
      const release = ()=>{ a.onprogress = null; try{ a.removeAttribute("src"); a.load(); }catch(e){} };
      const full = ()=>{ try{ return a.buffered.length && a.duration && a.buffered.end(a.buffered.length - 1) >= a.duration - 0.05; }catch(e){ return false; } };
      const once = ()=>{ if(!fired){ fired = true; a.oncanplaythrough = a.onerror = a.onabort = null;
        if(full()) release(); else { a.onprogress = ()=>{ if(full()) release(); }; setTimeout(release, 15000); }
        _tick(); } };
      a.oncanplaythrough = a.onerror = a.onabort = once;
      a.preload = "auto"; a.src = src;
      setTimeout(once, 6000);                          // a stalled clip must not hold the gate
    });
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(_tick, _tick);
    else _tick();

    if(document.readyState !== "complete") window.addEventListener("load", ()=>{});
    setTimeout(ready, 12000);   // hard watchdog: never strand the child on the loader
  })();
  // landing VO best-effort on first interaction too (some browsers block autoplay pre-gesture)
  /* ...but not when the greeting has already been heard or is playing now, and never on the play button
     itself - tapping the live gold button used to restart the greeting a split second before its click
     silenced it again. */
  window.addEventListener("pointerdown", function once(ev){ window.removeEventListener("pointerdown", once);
    if(ev && ev.target && ev.target.closest && ev.target.closest("#sgBtn")) return;
    if(!_greetingHeard && !isPlaying) playLanding(); }, { once:true });

  $("sgBtn").onclick = ()=>{
    if(startWaiting()){                 // still waiting for the greeting: a tap can only START it
      if(!_greetingHeard && !isPlaying) playLanding();
      return;
    }
    disarmStartPulse(); clearTimeout(_startWatchT);
    stopAudio();          // silence the landing greeting BEFORE slide 0 speaks (no VO overlap)
    _ac();                // unlock/resume WebAudio on the start gesture so the first clip never clips
    // [engine JS] r4/P1: peek gate into the tutorial. The landing stays visible-and-BLURRED behind the
    // peeking Swiftie + "चलिए शुरू करें"; it hides once the tutorial mounts (in the callback).
    _gatedPhases.add("tutorial");
    phaseBlurTransition(()=>{
      $("startGate").classList.add("hidden");
      document.body.classList.remove("is-start");   // blue bg only on the title screen
      mountSlide(0);
    }, "tutorial");
  };
  // tapping आगे clears any pending nav-nudge
  $("navBtn").addEventListener("click", ()=>{ clearTimeout(state.navNudgeTimer); stopNudge(); });
  /* [12][14] QA CHECKLIST: "hint_used event fires on every bulb tap." Each slide
     module rebinds $("hintBtn").onclick with its own `if(state.locked ...) return`
     guard, and only two of those seven handlers ever emitted hint_shown - so most
     bulb taps sent nothing. This capture-phase listener sits ahead of all of them
     and is the single place the verb is raised. */
  $("hintBtn").addEventListener("click", ()=>{
    const sl = CARD.slides[state.idx] || {};
    state.hintUsed = true;
    try{ XAPI.send("hint_used", { slide_id: sl.id, phase: sl.phase, type: sl.type },
                   { attempt: state.attempts }); }catch(e){}
  }, true);
  // [engine JS] r4 dev jump: ?slide=N skips the loader+gate and mounts slide N directly (QA/capture only)
  (function(){
    const j = parseInt(new URLSearchParams(location.search).get("slide"), 10);
    if(isNaN(j)) return;
    const bl = $("bootLoader"); if(bl) bl.remove();
    document.body.classList.add("loaded");
    $("startGate").classList.add("hidden");
    document.body.classList.remove("is-start");
    mountSlide(Math.max(0, Math.min(j, CARD.slides.length - 1)));
  })();
  // when the web font finishes loading, re-centre glyphs (metrics change vs fallback)
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(()=> centerAllGlyphs()); }
  // dev banner if ?dev=1 — show empty initially
  /* [QA 01] ?dev=1 JUMP PANEL. This engine revision shipped the dev BANNER but
     never the slide navigator - HI01 gained it in a later block (its line 7503)
     that MTG predates, which is why ?dev=1 looked like it "did nothing" here.
     buildDevNav() is ported verbatim; ?nav=1 is accepted too, as in HI01. */
  if(new URLSearchParams(location.search).has("dev") || new URLSearchParams(location.search).has("nav")){
    $("devBanner").textContent = "engine ready · slides=" + CARD.slides.length;
    $("devBanner").className = "dev-banner show";
    buildDevNav();
  }
}
/* ===== FLN ANIMATION KIT: core BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion = window.FLNMotion || {};
  M.still = function(){
    try{ return document.documentElement.classList.contains("no-anim") ||
      (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch(_){ return false; }
  };
  M.scale = function(){
    try{ return parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue("--scale")) || 1; }catch(_){ return 1; }
  };
  M.rect = function(r, sw){                    // screen rect -> stage coords (R1/R2)
    var s = M.scale();
    if(document.documentElement.classList.contains("rotated")){
      return { left:(r.top - sw.top)/s, top:(sw.right - r.right)/s, w:r.height/s, h:r.width/s };
    }
    return { left:(r.left - sw.left)/s, top:(r.top - sw.top)/s, w:r.width/s, h:r.height/s };
  };
  M.guard = function(fn){                      // R4
    try{ fn(); }catch(e){ try{ console.warn("[animation-kit]", e && e.message); }catch(_){} }
  };
  var _actx = null;
  M.audio = function(){
    try{
      var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null;
      _actx = _actx || new AC();
      if(_actx.state === "suspended") _actx.resume();
      return _actx;
    }catch(_){ return null; }
  };
  M.ready = function(fn){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  };
})();
/* ===== FLN ANIMATION KIT: core END ===== */

/* ===== FLN ANIMATION KIT: sky-drift BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;

  function build(o){
    var sky = typeof o.container === "string" ? document.querySelector(o.container) : o.container;
    if(!sky) return null;
    sky.textContent = "";
    var maxSize = 0, frag = document.createDocumentFragment();

    /* [landing card clear] every lane STARTS just outside the centre card, never behind it.
       The sky and the card share the viewport centre (body flex-centres the stage, the gate
       flex-centres the card), so per lane: distance from centre to where the ray leaves the
       card box (1114x456 design px x --scale) + the element's half-size + a gap, in vmax.
       Before this every star launched at a flat r0 = 22vmax - well inside the card - and slid
       out from under it. */
    var clear = null;
    if(o.avoid && document.querySelector(o.avoid)){
      var sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
      var vmaxPx = Math.max(document.documentElement.clientWidth, document.documentElement.clientHeight) / 100 || 1;
      clear = { hw:(o.avoidBox[0] / 2) * sc / vmaxPx, hh:(o.avoidBox[1] / 2) * sc / vmaxPx, gap:o.avoidGap * sc / vmaxPx };
    }
    function startR(cos, sin, size){
      if(!clear) return o.r0;
      var t = Math.min(Math.abs(cos) > 1e-6 ? clear.hw / Math.abs(cos) : Infinity,
                       Math.abs(sin) > 1e-6 ? clear.hh / Math.abs(sin) : Infinity);
      return Math.max(o.r0, t + size * 0.75 + clear.gap);   // 0.75: half-size + the glow halo
    }

    o.layers.forEach(function(L, li){
      for(var i = 0; i < o.lanes; i++){
        var a = ((360 / o.lanes) * i + L.rot) * Math.PI / 180;
        var cos = Math.cos(a), sin = Math.sin(a);
        var size = +((o.size[0] + Math.random() * (o.size[1] - o.size[0])) * L.scale).toFixed(2);
        if(size > maxSize) maxSize = size;
        var dur = +(o.dur[0] + Math.random() * (o.dur[1] - o.dur[0])).toFixed(1);
        var el = document.createElement("i"), r0 = startR(cos, sin, size);
        el.className = o.shapes[(i + li) % o.shapes.length];
        el.style.cssText =
          "--s:"  + size + "vmax;" +
          "--x1:" + (r0 * cos).toFixed(2) + "vmax;--y1:" + (r0 * sin).toFixed(2) + "vmax;" +
          "--x2:" + (o.r1 * cos).toFixed(2) + "vmax;--y2:" + (o.r1 * sin).toFixed(2) + "vmax;" +
          "--t:"  + dur + "s;" +
          "--d:-" + (Math.random() * dur).toFixed(1) + "s;" +     // negative = de-sync
          "--g:"  + (o.glow[0] + Math.random() * (o.glow[1] - o.glow[0])).toFixed(1) + "s;" +
          "--gd:-" + (Math.random() * 4).toFixed(1) + "s;" +
          "--o:"  + (o.opacity[0] + Math.random() * (o.opacity[1] - o.opacity[0])).toFixed(2) + ";";
        frag.appendChild(el);
      }
    });
    sky.appendChild(frag);

    // collision proof: lane arc at the tightest radius must be >= 1.5x the largest element
    var arc = (2 * Math.PI * o.r0) / o.lanes, ok = arc >= maxSize * 1.5;
    if(!ok && o.warn !== false){
      console.warn("[animation-kit] sky lanes too tight: arc " + arc.toFixed(2) +
        "vmax vs element " + maxSize.toFixed(2) + "vmax. Reduce lanes or size.");
    }
    return { arc:arc, maxSize:maxSize, safe:ok, count:sky.children.length };
  }

  M.sky = {
    defaults: {
      container:".sg-sky", lanes:29,
      layers:[{rot:0,scale:1},{rot:6.2,scale:0.62},{rot:-6.2,scale:0.55}],
      r0:22, r1:72, size:[0.8,2.6], dur:[18,34], glow:[3.0,4.8],
      opacity:[0.62,0.92], shapes:["s1","s2","s3","s4","s5"], warn:true,
      avoid:".sg-card", avoidBox:[1114,456], avoidGap:24   // [landing card clear] design px
    },
    init: function(opts){
      var o = Object.assign({}, this.defaults, opts || {}), res = null;
      this._last = opts;
      M.guard(function(){ res = build(o); });
      return res;
    }
  };
  M.ready(function(){ M.guard(function(){ if(!window.__skyManual) M.sky.init(); }); });
  /* the card's size in vmax changes with aspect ratio (rotation, split-screen), so re-plan the
     lanes after a resize settles - otherwise start points drift back inside the card. */
  var skyRz = 0;
  window.addEventListener("resize", function(){
    clearTimeout(skyRz);
    skyRz = setTimeout(function(){ M.guard(function(){ if(!window.__skyManual) M.sky.init(M.sky._last); }); }, 250);
  });
})();
/* ===== FLN ANIMATION KIT: sky-drift END ===== */

/* ===== FLN ANIMATION KIT: sky-burst BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;

  function boom(o){                      // sine thud + noise tail + square crackles
    var actx = M.audio(); if(!actx) return;
    try{
      var t = actx.currentTime, out = actx.createGain();
      out.gain.value = o.volume; out.connect(actx.destination);

      var tg = actx.createGain();
      tg.gain.setValueAtTime(0.9, t);
      tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      tg.connect(out);
      var osc = actx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.16);
      osc.connect(tg); osc.start(t); osc.stop(t + 0.18);

      var n = actx.sampleRate * 0.45;
      var buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
      for(var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6);
      var src = actx.createBufferSource(); src.buffer = buf;

      for(var c = 0; c < o.crackles; c++){
        var cg = actx.createGain(), ct = t + 0.10 + Math.random() * 0.30;
        cg.gain.setValueAtTime(0.0001, ct);
        cg.gain.exponentialRampToValueAtTime(0.18, ct + 0.006);
        cg.gain.exponentialRampToValueAtTime(0.0001, ct + 0.07);
        cg.connect(out);
        var co = actx.createOscillator();
        co.type = "square";
        co.frequency.setValueAtTime(1500 + Math.random() * 2200, ct);
        co.connect(cg); co.start(ct); co.stop(ct + 0.08);
      }
      var bp = actx.createBiquadFilter();
      bp.type = "bandpass"; bp.frequency.value = 3400; bp.Q.value = 0.8;
      var ng = actx.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.exponentialRampToValueAtTime(0.5, t + 0.03);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      src.connect(bp); bp.connect(ng); ng.connect(out); src.start(t + 0.02);
    }catch(_){}
  }

  function pop(el, r, o){
    el.classList.add("popped");
    // respawn on the next FLIGHT lap - the glow cycle is much shorter, so filter by name
    el.addEventListener("animationiteration", function back(e){
      if(e.animationName !== "sgFly") return;
      el.classList.remove("popped");
      el.removeEventListener("animationiteration", back);
    });

    var kind = "k-dot", cls = el.classList;
    for(var ci = 0; ci < cls.length; ci++){ if(o.kind[cls[ci]]) kind = o.kind[cls[ci]]; }

    var bs = Math.max(11, r.width);
    var b = document.createElement("div");
    b.className = "sg-burst " + kind;
    b.style.left = (r.left + r.width / 2) + "px";
    b.style.top  = (r.top  + r.height / 2) + "px";
    b.style.setProperty("--bs", bs + "px");
    b.appendChild(document.createElement("div")).className = "fl";

    var k = 0;
    for(var g = 0; g < o.rings.length; g++){
      var R = o.rings[g], off = Math.random() * Math.PI * 2;
      for(var i = 0; i < R.n; i++, k++){
        var a = off + i / R.n * Math.PI * 2;
        var dist = bs * R.rad * (0.78 + Math.random() * 0.44);
        var p = document.createElement("i");
        p.style.cssText =
          "--ps:"  + (bs * R.size * (0.8 + Math.random() * 0.5)).toFixed(1) + "px;" +
          "--dx:"  + (Math.cos(a) * dist).toFixed(1) + "px;" +
          "--dy:"  + (Math.sin(a) * dist).toFixed(1) + "px;" +
          "--gy:"  + (dist * o.gravity).toFixed(1) + "px;" +
          "--sd:"  + (R.dur + Math.random() * 0.22).toFixed(2) + "s;" +
          "--sdl:" + (Math.random() * 0.06).toFixed(3) + "s;" +
          "color:" + o.hues[k % o.hues.length];
        b.appendChild(p);
      }
    }
    document.body.appendChild(b);
    if(o.sound) boom(o);
    setTimeout(function(){ b.remove(); }, o.life);
  }

  M.skyBurst = {
    defaults: {
      container:".sg-sky", when:["is-start","is-end"],
      rings:[{n:9,rad:3.1,size:.58,dur:.80},{n:7,rad:1.8,size:.78,dur:.62}],
      hues:["#FCB717","#3B7DD8","#21A74A","#E5484D","#7048D6","#F1781D"],
      kind:{s1:"k-star",s2:"k-star",s3:"k-spark",s4:"k-dot",s5:"k-dot"},
      gravity:0.42, pad:12, padRatio:0.7, minAlpha:0.08, life:1200,
      sound:true, volume:0.22, crackles:4
    },
    init: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        var sky = typeof o.container === "string"
          ? document.querySelector(o.container) : o.container;
        if(!sky) return;
        // capture phase: .sg-sky is pointer-events:none, so hit-test by rect (R6)
        document.addEventListener("pointerdown", function(e){
          if(M.still()) return;
          if(!o.when.some(function(c){ return document.body.classList.contains(c); })) return;
          var els = sky.querySelectorAll("i:not(.popped)");
          for(var i = 0; i < els.length; i++){
            var el = els[i], r = el.getBoundingClientRect();
            if(r.width < 2) continue;
            var pad = Math.max(o.pad, r.width * o.padRatio);   // ~4px targets need slack
            if(e.clientX < r.left - pad || e.clientX > r.right  + pad ||
               e.clientY < r.top  - pad || e.clientY > r.bottom + pad) continue;
            if(parseFloat(getComputedStyle(el).opacity) < o.minAlpha) continue;
            // claim the tap, or it also fires the button under the star
            e.stopPropagation(); e.preventDefault();
            pop(el, r, o);
            return;
          }
        }, true);
      });
    }
  };
  M.ready(function(){ M.guard(function(){ M.skyBurst.init(); }); });
})();
/* ===== FLN ANIMATION KIT: sky-burst END ===== */

/* ===== FLN ANIMATION KIT: still-switch BEGIN ===== */
/* R5, second half. The kit's M.still() and the shipped starBurst both READ
   html.no-anim, but nothing in this activity ever SET it and there was no
   ?still=1 handler at all - so the kill-switch was unreachable. */
(function(){ "use strict";
  try{
    var q = new URLSearchParams(location.search);
    if(q.has("still") || (window.matchMedia &&
       matchMedia("(prefers-reduced-motion: reduce)").matches)){
      document.documentElement.classList.add("no-anim");
    }
  }catch(_){}
})();
/* ===== FLN ANIMATION KIT: still-switch END ===== */

/* ===== FLN ANIMATION KIT: nudge BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  function place(el, o){
    var nh = document.getElementById(o.hand); if(!nh || !el) return;
    var host = document.querySelector(o.host); if(!host) return;
    var r = el.getBoundingClientRect(), sw = host.getBoundingClientRect(), s = M.scale();
    nh.style.left = ((r.left - sw.left)/s + r.width/s/2 + o.dx) + "px";
    nh.style.top  = ((r.top  - sw.top )/s + r.height/s   + o.dy) + "px";
    nh.classList.add("show");
  }
  M.nudge = {
    defaults:{ hand:"nudgeHand", host:".slide-stage", dx:-34.2, dy:-7.8, oneHand:true },   /* [QA 12] fingertip 8px below target */
    pointAt: function(el, opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(M.still()) return;
        if(o.oneHand) document.querySelectorAll(".demo-hand").forEach(function(h){ h.remove(); });
        place(el, o);
      });
    },
    after: function(target, ms, opts){            // returns cancel()
      var o = Object.assign({}, this.defaults, opts || {}), t = null;
      M.guard(function(){
        if(!ms || M.still()) return;
        t = setTimeout(function(){
          var el = (typeof target === "string") ? document.querySelector(target) : target;
          if(el) place(el, o);
        }, ms);
      });
      return function(){ clearTimeout(t); };
    },
    hide: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      var nh = document.getElementById(o.hand); if(nh) nh.classList.remove("show");
    }
  };
})();
/* ===== FLN ANIMATION KIT: nudge END ===== */

/* ===== FLN ANIMATION KIT: confetti BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  function rnd(a, b){ return a + Math.random() * (b - a); }

  M.confetti = {
    defaults: {
      host:".stage-inner", count:80, stagger:0.35,
      fall:[1.1,1.8], drift:45, sway:[10,34], bob:[3,7],
      rockT:[0.6,1.2], tumbleT:[0.75,1.5], tumbleShare:0.22,
      amp:[28,52], yaw:30, depth:[0.75,1.15], tilt:25,
      /* weighted: star 40%, rectangle 20%, line 20%, square 20%.
         Repeat an entry to weight it - the array is sampled uniformly. */
      shapes:["st","st","st","st","rc","rc","ln","ln","sq","sq"],
      /* VIBGYOR. Front/back pairs - the back is the SAME hue darkened, never a
         different hue, or it reads as two pieces flickering instead of one turning. */
      colors:[["#8B2FC9","#5E1C8C"],   /* violet */
              ["#3F51B5","#27358A"],   /* indigo */
              ["#1E88E5","#135FA6"],   /* blue   */
              ["#22B24C","#157A34"],   /* green  */
              ["#FFD21E","#D9A800"],   /* yellow */
              ["#FF8A1E","#C75F00"],   /* orange */
              ["#E5322D","#A81F1B"]],  /* red    */
      phases:["guided","practice","mastery"]   /* [] disables phase gating */
    },
    burst: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(M.still()) return;
        /* confetti ONLY on activity phases - never tutorials, demos, landing, transitions */
        if(o.phases.length && o.phase && o.phases.indexOf(o.phase) < 0) return;
        var host = document.querySelector(o.host); if(!host) return;

        var dist = host.clientHeight + 60, maxLife = 0;
        var wrap = document.createElement("div");
        wrap.className = "fx-confetti";

        for(var i = 0; i < o.count; i++){
          var z     = rnd(o.depth[0], o.depth[1]);        /* depth */
          var fall  = rnd(o.fall[0], o.fall[1]) / z;      /* nearer = bigger = faster */
          var delay = rnd(0, o.stagger);
          if(fall + delay > maxLife) maxLife = fall + delay;
          var pair = o.colors[i % o.colors.length];
          /* most pieces flutter (face stays visible); a minority go end-over-end */
          /* Two regimes, and a real plate moves DIFFERENTLY in each:
             flutter = zigzags hard, almost no net sideways drift;
             tumble  = autorotation gives a steady lateral force, so it barely
                       zigzags but drifts consistently to one side. */
          var flutter = Math.random() > o.tumbleShare;
          var rockT   = flutter ? rnd(o.rockT[0], o.rockT[1])
                                : rnd(o.tumbleT[0], o.tumbleT[1]);
          var sway    = flutter ? rnd(o.sway[0], o.sway[1]) : rnd(2, 8);
          var drift   = flutter ? rnd(-o.drift/2.5, o.drift/2.5) : rnd(-o.drift, o.drift);
          var bob     = flutter ? rnd(o.bob[0], o.bob[1]) : rnd(2, 4);

          /* set every property once - they inherit down to .w and .f */
          var p = document.createElement("i"); p.className = "p";
          p.style.cssText =
            "--x:"     + rnd(-2, 98).toFixed(1) + "%;" +
            "--dist:"  + dist + "px;" +
            "--fall:"  + fall.toFixed(2) + "s;" +
            "--delay:" + delay.toFixed(2) + "s;" +
            "--drift:" + drift.toFixed(0) + "px;" +
            "--sway:"  + sway.toFixed(0) + "px;" +
            "--bob:"   + bob.toFixed(1) + "px;" +
            "--rockT:" + rockT.toFixed(2) + "s;" +
            /* capped short of 90deg: even at max tilt the face still reads */
            "--amp:"   + Math.round(rnd(o.amp[0], o.amp[1])) + "deg;" +
            "--yaw:"   + Math.round(rnd(-o.yaw, o.yaw)) + "deg;" +
            "--tilt:"  + Math.round(rnd(-o.tilt, o.tilt)) + "deg;" +
            "--z:"     + z.toFixed(2) + ";" +
            "--dim:"   + (0.72 + (z - o.depth[0]) /
                          (o.depth[1] - o.depth[0]) * 0.28).toFixed(2) + ";" +
            /* shapes stay legible by ASPECT RATIO, not size - see the shape table */
            "--c:"     + pair[0] + ";--c2:" + pair[1] + ";";

          var w = document.createElement("i"); w.className = "w";
          var f = document.createElement("i");
          f.className = "f " + o.shapes[Math.floor(Math.random() * o.shapes.length)] +
                        (flutter ? "" : " tum");
          w.appendChild(f); p.appendChild(w); wrap.appendChild(p);
        }
        host.appendChild(wrap);
        /* lifetime is computed, not hard-coded - a longer fall cannot be cut off */
        setTimeout(function(){ wrap.remove(); }, (maxLife + 0.3) * 1000);
      });
    },
    /* stops a slide advancing mid-celebration. 8s safety cap. */
    after: function(fn){
      var started = Date.now();
      (function check(){
        if(!document.querySelector(".fx-confetti") || Date.now() - started > 8000){ fn(); return; }
        setTimeout(check, 200);
      })();
    }
  };
})();
/* ===== FLN ANIMATION KIT: confetti END ===== */

/* ===== FLN ANIMATION KIT: star-burst BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  M.starBurst = {
    defaults:{ host:"#confetti", w:1333, h:750,
      colors:["#FFE400","#FFBD00","#E89400","#FFCA6C","#FDFFB8"],
      /* retuned: fewer, slower, longer. Travel distance is held at ~547px so the
         burst still fills the same area - only the density and pace changed. */
      ticks:150, decay:0.975, startV:14, shots:[0,220,440], spin:0.18,
      stars:32, starScale:1.8, circles:8, circleScale:1.0 },
    fire: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(M.still()) return;
        var host = document.querySelector(o.host); if(!host) return;
        var cv = document.createElement("canvas");
        cv.width = o.w; cv.height = o.h;                 // design grid, scaled by CSS
        cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
        host.appendChild(cv);
        var ctx = cv.getContext("2d"), parts = [];

        function starPath(r){
          ctx.beginPath();
          for(var i = 0; i < 10; i++){
            var rad = (i % 2 === 0) ? r : r/2, a = Math.PI/5*i - Math.PI/2;
            ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a)*rad, Math.sin(a)*rad);
          }
          ctx.closePath();
        }
        function add(n, scalar, shape){
          for(var i = 0; i < n; i++){
            var a = Math.random()*Math.PI*2;
            parts.push({ x:cv.width/2, y:cv.height/2, ax:Math.cos(a), ay:Math.sin(a),
              vel:o.startV*(0.5 + Math.random()), tick:0, scalar:scalar, shape:shape,
              color:o.colors[Math.floor(Math.random()*o.colors.length)],
              rot:Math.random()*Math.PI*2, spin:(Math.random()-.5)*o.spin });
          }
        }
        function shoot(){ add(o.stars, o.starScale, "star"); add(o.circles, o.circleScale, "circle"); }
        o.shots.forEach(function(ms){ ms ? setTimeout(shoot, ms) : shoot(); });

        /* derived from the LAST shot, so retiming the shots cannot end the loop
           before they have all fired. A hard-coded 30 breaks if shots move later. */
        var minFrames = Math.max.apply(null, o.shots) / 16 + 20;
        var frames = 0;
        (function frame(){
          ctx.clearRect(0, 0, cv.width, cv.height);
          var alive = false;
          for(var i = 0; i < parts.length; i++){
            var p = parts[i];
            if(p.tick >= o.ticks) continue;
            alive = true;
            p.x += p.ax*p.vel; p.y += p.ay*p.vel; p.vel *= o.decay;
            p.rot += p.spin; p.tick++;
            ctx.globalAlpha = 1 - p.tick/o.ticks;
            ctx.fillStyle = p.color;
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            if(p.shape === "star"){ starPath(8*p.scalar); ctx.fill(); }
            else { ctx.beginPath(); ctx.arc(0, 0, 6*p.scalar, 0, Math.PI*2); ctx.fill(); }
            ctx.restore();
          }
          frames++;
          if(alive || frames < minFrames) requestAnimationFrame(frame);  // survive delayed shots
          else setTimeout(function(){ cv.remove(); }, 300);
        })();
      });
    }
  };
})();
/* ===== FLN ANIMATION KIT: star-burst END ===== */

/* ===== FLN ANIMATION KIT: correct-select BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  function rnd(a, b){ return a + Math.random() * (b - a); }
  function mk(cls){ var i = document.createElement("i"); i.className = cls; return i; }

  /* Every deferred step is parked ON THE TILE so clear() can cancel it. Without this
     a second play inherits the FIRST play's pending timers and they strip the state
     off the new beat part-way through. Owning the timers is what makes these safely
     re-fireable, which the 2-attempt ladder needs. */
  function later(el, fn, ms){ (el._selT = el._selT || []).push(setTimeout(fn, ms)); }

  /* Tempo lives in CSS (--fx-beat / --fx-reward) so the two effects cannot drift
     apart. JS reads it rather than keeping a second copy, and only writes --ckT or
     --wgT when a caller explicitly passes `dur`. Custom properties do not resolve
     calc(), so the two numbers are read and multiplied here rather than reading
     the composed value. */
  function tempo(el){
    var cs = getComputedStyle(el);
    function num(p, d){
      var v = parseFloat(cs.getPropertyValue(p));
      if(!v && v !== 0) return d;
      return v > 20 ? v / 1000 : v;              /* tolerate ms as well as s */
    }
    var beat = num("--fx-beat", 0.4);
    return { beat: beat, reward: beat * (parseFloat(cs.getPropertyValue("--fx-reward")) || 2) };
  }

  M.answer = {
    clear: function(el){
      if(!el) return;
      if(el._selT){ for(var j = 0; j < el._selT.length; j++) clearTimeout(el._selT[j]); }
      el._selT = [];
      el.classList.remove("ck-correct", "wg-wrong", "wg-out", "wg-rel");
      var fx = el.querySelectorAll(".ck-fx,.wg-fx");
      for(var i = 0; i < fx.length; i++) fx[i].remove();
    }
  };

  M.correctSelect = {
    defaults:{ crown:5 },      /* dur comes from CSS unless you pass one */
    play: function(el, opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(!el) return;
        M.answer.clear(el);
        void el.offsetWidth;                 /* forced reflow - restarts the pop */
        var dur = o.dur || tempo(el).reward;            /* CSS owns the tempo */
        if(o.dur) el.style.setProperty("--ckT", dur + "s");

        var fx = mk("ck-fx");

        if(o.crown && !M.still()){
          var cr = mk("ck-crown");
          /* clientWidth is layout px INSIDE the scaled stage - design px already.
             getBoundingClientRect() would come back multiplied by --scale (R1). */
          var w = el.clientWidth || 96, h = el.clientHeight || 96;
          var rx = w * 0.46, ry = h * 0.46;               /* the tile's own edge */
          for(var i = 0; i < o.crown; i++){
            var t  = (o.crown === 1) ? 0.5 : i / (o.crown - 1);
            var a  = (-158 + t * 136 + rnd(-7, 7)) * Math.PI / 180;   /* TOP arc */
            var x0 = Math.cos(a) * rx, y0 = Math.sin(a) * ry;
            var out = rnd(.20, .34);
            var s = mk("");
            s.style.cssText =
              "--ss:" + rnd(7, 12).toFixed(1) + "px;" +
              "--x0:" + x0.toFixed(1) + "px;" +
              "--y0:" + y0.toFixed(1) + "px;" +
              "--sx:" + (x0 + Math.cos(a) * w * out).toFixed(1) + "px;" +
              "--sy:" + (y0 + Math.sin(a) * h * out).toFixed(1) + "px;" +
              "--sr:" + Math.round(rnd(-140, 140)) + "deg;";
            cr.appendChild(s);
          }
          fx.appendChild(cr);
        }

        /* class FIRST: the border and the pop are the feedback, and they must not
           wait on ~9 nodes of decoration being built. Measured 45ms of dead time
           before any pixel moved when this ran the other way round. */
        el.classList.add("ck-correct");
        el.appendChild(fx);
        /* Only the TRANSIENT layers are swept. .ck-correct stays: the green outline
           is the correct-mark and it belongs to the tile until the slide advances. */
        later(el, function(){
          var t = fx.querySelectorAll(".ck-crown");
          for(var i = 0; i < t.length; i++) t[i].remove();
        }, dur * 1050);
      });
    }
  };
})();
/* ===== FLN ANIMATION KIT: correct-select END ===== */

/* ===== FLN ANIMATION KIT: wrong-select BEGIN ===== */
/* needs the `later`, `tempo` and `M.answer.clear` helpers from recipe 19 */
(function(){ "use strict";
  var M = window.FLNMotion;
  function mk(cls){ var i = document.createElement("i"); i.className = cls; return i; }
  function later(el, fn, ms){ (el._selT = el._selT || []).push(setTimeout(fn, ms)); }
  /* ---- KIT PATCH (install-time), not part of the published block ----------
     Recipe 20's header says it "needs the `later`, `tempo` and `M.answer.clear`
     helpers from recipe 19". It re-declares `mk` and `later` in this IIFE but not
     `tempo`, which is local to recipe 19's IIFE - so both play() and out() threw
     `ReferenceError: tempo is not defined`. M.guard swallows it, so the wrong
     answer beat was silently DEAD rather than visibly broken. Verified with node
     before patching. Remove this once the kit block carries the helper itself. */
  function tempo(el){
    var cs = getComputedStyle(el);
    function num(p, d){
      var v = parseFloat(cs.getPropertyValue(p));
      if(!v && v !== 0) return d;
      return v > 20 ? v / 1000 : v;              /* tolerate ms as well as s */
    }
    var beat = num("--fx-beat", 0.4);
    return { beat: beat, reward: beat * (parseFloat(cs.getPropertyValue("--fx-reward")) || 2) };
  }

  M.wrongSelect = {
    defaults:{},               /* dur comes from CSS unless you pass one */

    /* transient: shakes, holds red, then RELEASES */
    play: function(el, opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(!el) return;
        M.answer.clear(el);
        void el.offsetWidth;
        var dur = o.dur || tempo(el).beat;              /* CSS owns the tempo */
        if(o.dur) el.style.setProperty("--wgT", dur + "s");
        el.classList.add("wg-wrong");          /* class first - see recipe 19 */
        var fx = mk("wg-fx"); fx.appendChild(mk("wg-pulse"));
        el.appendChild(fx);
        /* RELEASE on a timeout, never on animationend: under the reduced-motion kill
           switch animationend never fires and the tile would stay red forever - on
           exactly the devices least able to recover from it. (R5, second half.)
           .wg-rel goes on BEFORE .wg-wrong comes off so the border has something to
           transition with. */
        later(el, function(){
          el.classList.add("wg-rel");
          el.classList.remove("wg-wrong");
          var f = el.querySelector(".wg-fx"); if(f) f.remove();
          later(el, function(){
            el.classList.remove("wg-rel");
            if(o.then) o.then();
          }, 260);
        }, dur * 1500 + 40);
      });
    },

    /* elimination: shakes once, recedes, and STAYS recessed. No auto-clear. */
    out: function(el, opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        if(!el) return;
        M.answer.clear(el);
        void el.offsetWidth;
        var dur = o.dur || tempo(el).beat;
        if(o.dur) el.style.setProperty("--wgT", dur + "s");
        el.classList.add("wg-out");
        var fx = mk("wg-fx"); fx.appendChild(mk("wg-pulse"));
        el.appendChild(fx);
      });
    }
  };
})();
/* ===== FLN ANIMATION KIT: wrong-select END ===== */

/* ===== FLN ANIMATION KIT: object-outline BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;
  var ST = ["is-correct", "is-wrong", "is-muted"];

  M.objectOutline = {
    /* state is just a class - both engines read the same ones */
    set: function(el, state){
      M.guard(function(){
        if(!el) return;
        for(var i = 0; i < ST.length; i++) el.classList.remove(ST[i]);
        void el.offsetWidth;                  /* restart - as in recipe 19 */
        if(state) el.classList.add("is-" + state);
      });
    },
    correct: function(el){ this.set(el, "correct"); },
    muted:   function(el){ this.set(el, "muted"); },
    reset:   function(el){ if(el && el._olT) clearTimeout(el._olT); this.set(el, ""); },

    /* wrong RELEASES back to idle white - the child has another attempt, exactly
       as the tile does in recipe 20. Timeout, never animationend: under the
       reduced-motion kill-switch animationend never fires. */
    wrong: function(el, opts){
      var o = opts || {}, self = this;
      M.guard(function(){
        if(!el) return;
        self.set(el, "wrong");
        var v = parseFloat(getComputedStyle(el).getPropertyValue("--olT")) || 0.4;
        if(v > 20) v = v / 1000;
        if(el._olT) clearTimeout(el._olT);
        el._olT = setTimeout(function(){
          el.classList.remove("is-wrong");
          if(o.then) o.then();
        }, v * 1500 + 40);
      });
    },

    /* OPTIONAL, and read the caveat. A rectangular hit box over an irregular sprite
       steals taps meant for whatever is behind it - two overlapping characters and
       the child taps the wrong one. This tests the tap against the sprite's ALPHA.
       It FAILS OPEN: reading pixels back taints the canvas on file://, which is how
       the activities ship, so there it always returns true and you are back to the
       bounding box. Treat it as a dev-server nicety, not a guarantee - the reliable
       fix is z-order and not overlapping the tappable parts in the first place. */
    alphaHit: function(img, clientX, clientY){
      var r = img.getBoundingClientRect();
      if(clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom)
        return false;
      if(img._olA === undefined){
        try{
          var w = Math.min(img.naturalWidth, 256);
          var h = Math.round(img.naturalHeight * w / img.naturalWidth);
          var c = document.createElement("canvas"); c.width = w; c.height = h;
          var x = c.getContext("2d"); x.drawImage(img, 0, 0, w, h);
          img._olA = x.getImageData(0, 0, w, h);
        }catch(e){ img._olA = null; }         /* tainted - fail OPEN */
      }
      if(!img._olA) return true;
      var d = img._olA;
      var px = Math.floor((clientX - r.left) / r.width  * d.width);
      var py = Math.floor((clientY - r.top)  / r.height * d.height);
      return d.data[(py * d.width + px) * 4 + 3] > 24;
    }
  };
})();
/* ===== FLN ANIMATION KIT: object-outline END ===== */

/* [engine JS] DEV NAV — a review/QA slide navigator. Shows ONLY with ?dev=1 or ?nav=1 (children never
   see it). Jump to any slide by dropdown, step ◀▶, first/last, or back to the landing. Uses the
   engine's own mountSlide + state.idx; a light poll keeps the label synced when the game self-advances. */
function buildDevNav(){
  if(document.getElementById("devNav")) return;
  const bar = document.createElement("div"); bar.id = "devNav"; bar.className = "dev-nav";
  const mk = (txt, title)=>{ const b = document.createElement("button"); b.className = "dev-nav-btn"; b.textContent = txt; if(title) b.title = title; return b; };
  const land = mk("⌂", "landing"), first = mk("⏮", "first"), prev = mk("◀", "prev"), next = mk("▶", "next"), last = mk("⏭", "last");
  const sel = document.createElement("select"); sel.className = "dev-nav-sel"; sel.title = "jump to slide";
  CARD.slides.forEach((s, i)=>{ const o = document.createElement("option"); o.value = i; o.textContent = (i+1) + ". " + s.id + " · " + s.type; sel.appendChild(o); });
  const lbl = document.createElement("span"); lbl.className = "dev-nav-lbl";
  const cur = ()=> (state && typeof state.idx === "number") ? state.idx : 0;
  const leaveStart = ()=>{ const sg = $("startGate"); if(sg) sg.classList.add("hidden"); document.body.classList.remove("is-start"); document.body.classList.add("loaded"); const bl = $("bootLoader"); if(bl) bl.remove(); };
  const sync = ()=>{ const i = cur(); const s = CARD.slides[i]; if(document.activeElement !== sel) sel.value = i;
    lbl.textContent = (i+1) + "/" + CARD.slides.length + (s ? " · " + s.id : ""); };
  const go = (i)=>{ i = Math.max(0, Math.min(i, CARD.slides.length - 1)); leaveStart(); mountSlide(i); sync(); };
  land.onclick = ()=>{ const sg = $("startGate"); if(sg){ sg.classList.remove("hidden"); document.body.classList.add("is-start"); } };
  first.onclick = ()=> go(0); prev.onclick = ()=> go(cur() - 1); next.onclick = ()=> go(cur() + 1); last.onclick = ()=> go(CARD.slides.length - 1);
  sel.onchange = ()=> go(parseInt(sel.value, 10));
  bar.append(land, first, prev, sel, lbl, next, last);
  document.body.appendChild(bar);
  setInterval(sync, 300); sync();
}

boot();

/* ---------- [landing dust] sunlit dust motes on the first screen ----------
   Real dust in a sunbeam, not sprites on rails:
   - VISIBLE ONLY WHERE LIT. Each speck's brightness = the sunlight at its position:
     a falloff spilling down-right from the sun (.sg-sun, read live), so motes
     glint near the window and fade out toward the shaded right side.
   - DRIFTS ON AIR, NOT ON THE LIGHT. Light does not push dust: motion = a slow room
     draught from the window (down-right) + smooth per-particle turbulence + a tiny
     gravity settle + damping (dust is light, drag dominates). No straight paths.
   - TUMBLES. Flakes glint as they rotate to face the sun: brightness pulses ^3.
   - DEPTH. z 0..1: far = tiny, sharp, slow, dim; near = larger, softer (out of
     focus), faster across the screen (parallax). Most dust is far.
   Pauses off the landing and when the tab is hidden; one static frame under
   prefers-reduced-motion. Coordinates are .sg-fx-local design px (1096x438). */
(function(){
  const cv = document.getElementById("sgDust"); if(!cv || !cv.getContext) return;
  const ctx = cv.getContext("2d"), W = 1096, H = 438, N = 80;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // soft round sprite (one draw per mote); small sizes read as crisp points
  const spr = document.createElement("canvas"); spr.width = spr.height = 32;
  (function(){ const g = spr.getContext("2d"), r = g.createRadialGradient(16,16,0,16,16,16);
    r.addColorStop(0, "rgba(255,251,236,1)"); r.addColorStop(.45, "rgba(255,244,215,.75)");
    r.addColorStop(1, "rgba(255,236,196,0)"); g.fillStyle = r; g.fillRect(0,0,32,32); })();

  /* light field = the sun (the .sg-sun anchor, read live) spilling into the room: an
     elongated falloff pointing down-right from the window (~26deg, the angle of the
     painted wall streak) - bright near the window, gone by the shaded right side. */
  let sun = { x:170, y:70 };
  const LA = 26 * Math.PI / 180, LC = Math.cos(LA), LS = Math.sin(LA);
  function readSun(){
    const f = document.querySelector(".sg-fx .sg-sun");
    if(f) sun = { x:f.offsetLeft, y:f.offsetTop };            // .sg-sun is a 0x0 anchor AT the sun
  }
  function light(x, y){
    const dx = x - sun.x, dy = y - sun.y;
    const s = dx * LC + dy * LS, c = -dx * LS + dy * LC;       // along / across the spill
    const sa = s >= 0 ? s / 430 : s / 150;                     // reaches far into the room, little behind the sun
    return Math.exp(-(sa * sa + (c / 200) * (c / 200)));
  }

  const rnd = (a, b) => a + Math.random() * (b - a);
  function spawn(p, fresh){
    p.z = Math.pow(Math.random(), 1.8);                        // bias far
    // start anywhere on screen the first time; later re-enter from the window side
    if(fresh){ p.x = rnd(-20, W * .75); p.y = rnd(-10, H); }
    else if(Math.random() < .6){ p.x = rnd(-30, -5); p.y = rnd(0, H * .8); }
    else { p.x = rnd(0, W * .45); p.y = rnd(-30, -5); }
    p.vx = rnd(-2, 2); p.vy = rnd(-2, 2);
    p.r  = .7 + p.z * 3.2;                                     // radius px
    p.f1 = rnd(.07, .19); p.f2 = rnd(.11, .27); p.ph1 = rnd(0, 6.3); p.ph2 = rnd(0, 6.3);
    p.spin = rnd(.6, 2.2); p.sph = rnd(0, 6.3);
    p.fade = fresh ? 1 : 0;                                    // ease in after respawn
    return p;
  }
  const P = Array.from({length:N}, () => spawn({}, true));

  function fit(){
    const sc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
    const k = Math.min(sc * (window.devicePixelRatio || 1), 2);  // cap backing store for low-end GPUs
    cv.width = Math.round(W * k); cv.height = Math.round(H * k);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    readSun();
    if(reduce) draw(8);                                        // resizing clears the canvas
  }

  function step(p, t, dt){
    const par = .45 + p.z * .9;                                // parallax: near crosses faster
    // room draught from the window + slow global gusts
    const wx = 5.5 + 2.5 * Math.sin(t * .09), wy = 1.6 + 1.2 * Math.sin(t * .07 + 1.3);
    // smooth turbulence (two incommensurate sines per axis = no visible loop)
    const tx = 7 * Math.sin(t * p.f1 + p.ph1) + 4 * Math.sin(t * p.f2 * 1.7 + p.ph2);
    const ty = 6 * Math.cos(t * p.f2 + p.ph2) + 3 * Math.sin(t * p.f1 * 2.3 + p.ph1);
    const g  = .8 + p.z * .9;                                  // settling: heavier near flakes sink a touch faster
    // drag toward the local air velocity (dust has almost no inertia) + Brownian jitter
    const k = 1 - Math.exp(-1.6 * dt);
    p.vx += ((wx + tx) - p.vx) * k + rnd(-1, 1) * 6 * dt;
    p.vy += ((wy + ty + g) - p.vy) * k + rnd(-1, 1) * 6 * dt;
    p.x += p.vx * par * dt; p.y += p.vy * par * dt;
    if(p.fade < 1) p.fade = Math.min(1, p.fade + dt / 1.5);
    if(p.x > W + 20 || p.y > H + 20 || p.x < -40 || p.y < -40) spawn(p, false);
  }

  function draw(t){
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for(const p of P){
      const L = light(p.x, p.y);
      if(L < .02) continue;                                    // in shade: invisible, like real dust
      const glint = .35 + .65 * Math.pow(Math.max(0, Math.sin(t * p.spin + p.sph)), 3);
      const depth = .45 + .55 * (1 - Math.abs(p.z - .35));     // far dim, very near slightly defocused
      const a = Math.min(1, L * 1.3) * glint * depth * p.fade;
      if(a < .02) continue;
      const d = p.r * 2 * (p.z > .7 ? 1.35 : 1);               // near = out-of-focus blur disc
      ctx.globalAlpha = p.z > .7 ? a * .6 : a;
      ctx.drawImage(spr, p.x - d / 2, p.y - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
  }

  let last = 0, t = 0;
  function frame(now){
    requestAnimationFrame(frame);
    if(!document.body.classList.contains("is-start")){ last = 0; return; }
    const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now; t += dt;
    for(const p of P) step(p, t, dt);
    draw(t);
  }

  fit();
  window.addEventListener("resize", () => { clearTimeout(fit._t); fit._t = setTimeout(fit, 200); });
  window.addEventListener("load", fit);
  if(reduce){ for(let i = 0; i < 240; i++) for(const p of P) step(p, i / 30, 1 / 30); draw(8); }
  else requestAnimationFrame(frame);
})();
