function playBeep(type="notify") {
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const seqs = {
      notify:[[523,.1],[659,.1],[784,.15]],
      done:[[784,.08],[784,.08],[1047,.2]],
      warn:[[440,.15],[349,.15]],
    };
    let t = ctx.currentTime;
    (seqs[type]||seqs.notify).forEach(([f,d]) => {
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type="square"; o.frequency.value=f;
      g.gain.setValueAtTime(.14,t);
      g.gain.exponentialRampToValueAtTime(.001,t+d);
      o.start(t); o.stop(t+d); t+=d+.02;
    });
  } catch(e) {}
}
