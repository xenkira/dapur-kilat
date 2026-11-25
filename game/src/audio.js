// Dapur Kilat — all sound is synthesized with WebAudio: no audio files,
// no network, just short oscillator blips. Created lazily on the first
// gesture, because browsers block audio before the player interacts.

export function makeAudio() {
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

  function tone(freq, dur, type, vol, when = 0) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },
    pickup() { tone(660, 0.08, 'triangle', 0.12); },
    place() { tone(440, 0.07, 'triangle', 0.1); },
    chop() { tone(190, 0.06, 'square', 0.14); tone(95, 0.05, 'square', 0.1, 0.01); },
    sizzle() { tone(1200, 0.05, 'sawtooth', 0.03); },
    done() { tone(880, 0.12, 'triangle', 0.12); tone(1320, 0.18, 'triangle', 0.1, 0.09); },
    error() { tone(160, 0.18, 'sawtooth', 0.1); },
    tick() { tone(980, 0.05, 'sine', 0.06); },
    serve() { tone(523, 0.1, 'triangle', 0.12); tone(659, 0.1, 'triangle', 0.12, 0.08); tone(784, 0.2, 'triangle', 0.12, 0.16); },
  };
}
