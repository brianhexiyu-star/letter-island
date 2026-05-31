/* ═══════════════════════════════════════════════════════════════════════════
   Synthesized UI sounds via Web Audio API
   All sounds are generated programmatically — zero external audio files.
   ═══════════════════════════════════════════════════════════════════════════ */

let ctx: AudioContext | null = null;

function ensureContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

/* ── 1. Open Letter Chime ──
   Cozy ascending chord: G4 → C5 → E5 → G5
   High attack, long release sine-wave arpeggio.                          */
export function playLetterChime(): void {
  const c = ensureContext();
  const now = c.currentTime;

  const notes = [392, 523, 659, 784]; // G4, C5, E5, G5
  const spacing = 0.15;                // stagger between note starts
  const attack = 0.025;
  const release = 0.55;

  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    const t = now + i * spacing;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + attack);   // high attack
    gain.gain.exponentialRampToValueAtTime(0.001, t + release); // long tail
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + release + 0.05);
  });
}

/* ── 2. Animalese Voice Tick ──
   Triangle-wave blip with swept-up frequency & rapid decay (~80 ms).
   pitchFactor controls the character's voice register:
     1.4 = Isabelle (bright, chatty)
     1.0 = neutral
     0.6 = K.K. Slider (relaxed, bass-clef)                              */
export function playType(pitchFactor: number = 1.0): void {
  const c = ensureContext();
  const now = c.currentTime;

  const baseFreq = 420 * pitchFactor * (0.85 + Math.random() * 0.3);
  const duration = 0.08;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(baseFreq * 0.85, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + duration * 0.75);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.1, now + 0.005);   // snap attack
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // rapid decay
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + duration);
}
