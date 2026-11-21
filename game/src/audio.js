// Tiny WebAudio sound kit: every sound is synthesized, no audio files, so
// the game stays fully offline. A find rings a warm two-note chime, a miss
// buzzes low, a hint sparkles, and clearing a level plays a short fanfare.

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, at, dur, type, gain) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ac.currentTime + at;
    amp.gain.setValueAtTime(0, t0);
    amp.gain.linearRampToValueAtTime(gain, t0 + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    unlock() { ensure(); },
    find() { tone(880, 0, 0.16, 'sine', 0.16); tone(1318, 0.07, 0.24, 'sine', 0.14); },
    miss() { tone(160, 0, 0.18, 'square', 0.06); tone(120, 0.05, 0.2, 'square', 0.05); },
    hint() { tone(1568, 0, 0.12, 'triangle', 0.1); tone(2093, 0.09, 0.18, 'triangle', 0.08); },
    clear() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, 'sine', 0.13)); },
    over() { [392, 330, 262].forEach((f, i) => tone(f, i * 0.13, 0.24, 'sine', 0.11)); },
    toggleMute() { muted = !muted; return muted; },
  };
}
