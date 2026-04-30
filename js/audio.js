// ─────────────────────────────────────────────────────────────────────────────
// audio.js — chiptune sound effects via the Web Audio API
// ─────────────────────────────────────────────────────────────────────────────

// Plays a short square-wave melody. type can be:
//   "notify" — ascending 3-note tone (task scheduled / reschedule)
//   "done"   — punchy completion fanfare
//   "warn"   — descending 2-note alert (5-minute warning, wrong password)
function playBeep(type="notify") {
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();

    // Each sequence is an array of [frequency (Hz), duration (s)] pairs
    const seqs = {
      notify:[[523,.1],[659,.1],[784,.15]],
      done:[[784,.08],[784,.08],[1047,.2]],
      warn:[[440,.15],[349,.15]],
    };

    let t = ctx.currentTime;
    (seqs[type]||seqs.notify).forEach(([f,d]) => {
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type="square";          // square wave = classic 8-bit sound
      o.frequency.value=f;
      g.gain.setValueAtTime(.14,t);
      g.gain.exponentialRampToValueAtTime(.001,t+d); // quick fade-out to avoid clicks
      o.start(t); o.stop(t+d);
      t+=d+.02; // small gap between notes
    });
  } catch(e) {} // silently ignore if AudioContext is unavailable
}
