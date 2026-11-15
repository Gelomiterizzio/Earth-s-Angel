// AI-assisted: OpenAI Codex. Original synthetic score; team review pending.

interface EnvelopeOptions {
  peak?: number;
  attack?: number;
  release?: number;
  pan?: number;
}

interface ToneOptions extends EnvelopeOptions {
  endFrequency?: number;
  type?: OscillatorType;
}

interface NoiseOptions extends EnvelopeOptions {
  center?: number;
}

export function createLunarSecretScore(volume: number) {
  const amplitude = Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : 0));
  const minGain = 0.0001;
  let context: AudioContext | null = null;
  let master: DynamicsCompressorNode | null = null;
  let playback: { channel: GainNode; voices: Set<AudioScheduledSourceNode> } | null = null;
  let disposed = false;

  function initialize() {
    const Audio = window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Audio) return false;
    try {
      context = new Audio();
    } catch {
      return false;
    }
    master = context.createDynamicsCompressor();
    master.threshold.value = -15;
    master.knee.value = 9;
    master.ratio.value = 4;
    master.attack.value = 0.008;
    master.release.value = 0.16;
    master.connect(context.destination);
    return true;
  }

  function stop() {
    if (!playback || !context) return;
    const { channel, voices } = playback;
    playback = null;
    const now = context.currentTime;
    channel.gain.setTargetAtTime(0, now, 0.012);
    for (const voice of voices) {
      voice.stop(now + 0.06);
    }
    window.setTimeout(() => channel.disconnect(), 125);
  }

  function start(offset = 0) {
    stop();
    if (disposed || amplitude === 0 || !Number.isFinite(offset) || offset >= 50) return;
    offset = Math.max(0, offset);
    if (!context && !initialize()) return;
    if (!context || !master) return;
    const ctx: AudioContext = context;
    if (ctx.state !== "running") void ctx.resume().catch(() => {});

    const origin = ctx.currentTime + 0.025 - offset;
    const channel = ctx.createGain();
    channel.gain.value = amplitude;
    const voices = new Set<AudioScheduledSourceNode>();
    channel.connect(master);
    playback = { channel, voices };

    function route(source: AudioScheduledSourceNode, envelope: GainNode, pan: number) {
      source.connect(envelope);
      const panner = pan && ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner) {
        panner.pan.value = pan;
        envelope.connect(panner);
        panner.connect(channel);
      } else {
        envelope.connect(channel);
      }
      source.onended = () => {
        voices.delete(source);
        source.disconnect();
        envelope.disconnect();
        if (panner) panner.disconnect();
      };
      voices.add(source);
    }

    function envelopeAt(from: number, duration: number, attack: number, release: number, peak: number) {
      if (offset >= from + duration) return null;
      const envelope = ctx.createGain();
      const breakpoints = [
        [0, minGain],
        [attack, peak],
        [duration - release, peak],
        [duration, minGain],
      ];
      const elapsed = Math.max(0, offset - from);
      const begin = origin + from + elapsed;
      let gain = minGain;
      for (let i = 1; i < breakpoints.length; i += 1) {
        const [leftTime, leftGain] = breakpoints[i - 1];
        const [rightTime, rightGain] = breakpoints[i];
        if (elapsed <= rightTime) {
          const progress = (elapsed - leftTime) / Math.max(0.0001, rightTime - leftTime);
          gain = leftGain * Math.pow(rightGain / leftGain, progress);
          break;
        }
      }
      envelope.gain.setValueAtTime(gain, begin);
      for (const [time, value] of breakpoints) {
        if (time > elapsed) envelope.gain.exponentialRampToValueAtTime(value, origin + from + time);
      }
      return { envelope, begin, elapsed, end: origin + from + duration };
    }

    function tone(from: number, duration: number, frequency: number, options: ToneOptions = {}) {
      const {
        endFrequency = frequency, peak = 0.04, attack = 0.035, release = duration * 0.68,
        type = "sine", pan = 0,
      } = options;
      const timing = envelopeAt(from, duration, attack, release, peak);
      if (!timing) return;
      const { envelope, begin, elapsed, end } = timing;
      const voice = ctx.createOscillator();
      voice.type = type;
      const firstFrequency = frequency * Math.pow(endFrequency / frequency, elapsed / duration);
      voice.frequency.setValueAtTime(firstFrequency, begin);
      if (frequency !== endFrequency) voice.frequency.exponentialRampToValueAtTime(endFrequency, end);
      route(voice, envelope, pan);
      voice.start(begin);
      voice.stop(end + 0.001);
    }

    function noise(from: number, duration: number, options: NoiseOptions = {}) {
      const { center = 700, peak = 0.045, attack = 0.06, release = duration * 0.68, pan = 0 } = options;
      const timing = envelopeAt(from, duration, attack, release, peak);
      if (!timing) return;
      const { envelope, begin, elapsed, end } = timing;
      const data = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
      const samples = data.getChannelData(0);
      let seed = 34619;
      for (let i = 0; i < samples.length; i += 1) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        samples[i] = seed / 2147483648 - 1;
      }
      const source = ctx.createBufferSource();
      source.buffer = data;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = center;
      filter.Q.value = 0.7;

      source.connect(filter);
      filter.connect(envelope);
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner) {
        panner.pan.value = pan;
        envelope.connect(panner);
        panner.connect(channel);
      } else {
        envelope.connect(channel);
      }
      source.onended = () => {
        voices.delete(source);
        source.disconnect();
        filter.disconnect();
        envelope.disconnect();
        if (panner) panner.disconnect();
      };
      voices.add(source);
      source.start(begin, Math.min(elapsed, data.duration - 1 / ctx.sampleRate));
      source.stop(end + 0.001);
    }

    // The lunar ambience cuts to silence.
    tone(0, 3.95, 56, { endFrequency: 48, peak: 0.027, attack: 0.45, release: 0.72 });
    tone(0.12, 3.72, 110, { endFrequency: 104, peak: 0.013, attack: 0.6, release: 1.12, pan: -0.38 });
    noise(0, 3.96, { center: 230, peak: 0.022, attack: 0.34, release: 0.58 });
    tone(3, 0.9, 302, { endFrequency: 43, peak: 0.082, attack: 0.012, type: "triangle" });
    tone(3, 0.68, 760, { endFrequency: 388, peak: 0.026, attack: 0.015, pan: 0.2 });

    // Two low pulses open the eyes, leading into a very quiet bed under speech.
    tone(6.8, 1.38, 83, { endFrequency: 38, peak: 0.12, attack: 0.07 });
    tone(6.96, 1.32, 134, { endFrequency: 77, peak: 0.05, attack: 0.16, type: "triangle", pan: 0.52 });
    noise(6.83, 1.5, { center: 365, peak: 0.055, attack: 0.25, pan: -0.42 });
    tone(7.35, 20.65, 73.42, { endFrequency: 71.6, peak: 0.028, attack: 1.35, release: 1.9, pan: -0.17 });
    tone(7.58, 20.42, 110.32, { endFrequency: 113, peak: 0.015, attack: 2.4, release: 2.3, pan: 0.37 });
    tone(8.45, 19.55, 154.2, { endFrequency: 147.9, peak: 0.009, attack: 2.55, release: 1.7, pan: -0.51 });
    for (const [at, hz, side] of [[9.12, 166, 0.36], [14.05, 224, -0.34], [18.08, 137, 0.38], [24.14, 198, -0.35]]) {
      tone(at, 0.73, hz, { endFrequency: hz * 0.97, peak: 0.011, attack: 0.07, pan: side });
    }

    // Staggered sweeps contract and rise into the return to the launchpad.
    noise(28, 4.96, { center: 500, peak: 0.051, attack: 1.53, release: 0.55 });
    tone(28, 4.97, 49, { endFrequency: 170, peak: 0.041, attack: 1.18, release: 0.42 });
    for (let i = 0; i < 12; i += 1) {
      const at = 28.14 + 4.36 * (1 - Math.pow(1 - i / 12, 1.47));
      const hz = 480 * Math.pow(1.055, i);
      tone(at, Math.min(0.91, 33 - at), hz, {
        endFrequency: hz * 0.28, peak: 0.024, attack: 0.072 + i * 0.008,
        type: "triangle", pan: i % 2 ? 0.46 : -0.46,
      });
    }

    function bell(from: number, hz: number, peak: number, pan = 0) {
      tone(from, 1.45, hz, { peak, attack: 0.016, release: 1.42, pan });
      tone(from + 0.008, 0.54, hz * 2.01, { peak: peak * 0.25, attack: 0.014, release: 0.515, pan });
    }

    // Warm chord and a brief melody. Leave space for the match cut to land.
    for (const [hz, side] of [[146.832, -0.23], [220, 0.27], [293.665, -0.33], [369.994, 0.31], [440, -0.1]]) {
      tone(33.2, 4.21, hz, { peak: hz < 220 ? 0.05 : 0.021, attack: 0.32, release: 2.7, pan: side });
    }
    for (const [at, hz, side] of [
      [33.2, 293.665, -0.23], [33.33, 369.994, -0.09], [33.48, 440, 0.11],
      [33.68, 587.33, 0.26], [34.7, 659.255, 0.34], [35.38, 587.33, 0.18],
      [36.17, 440, -0.09], [37.03, 493.883, 0.06], [38.12, 369.994, -0.23],
      [39.4, 293.665, -0.19],
    ]) bell(at, hz, 0.037, side);
    noise(33.2, 0.46, { center: 4400, peak: 0.034, attack: 0.02 });

    tone(42, 0.32, 285, { endFrequency: 75, peak: 0.086, attack: 0.008, type: "triangle" });
    tone(42.04, 0.16, 640, { endFrequency: 194, peak: 0.036, attack: 0.009, pan: 0.12 });
    noise(42, 0.13, { center: 938, peak: 0.046, attack: 0.012, release: 0.104 });

    // A muted closing cadence gives the last line time to read.
    bell(47.5, 440, 0.024, -0.2);
    bell(47.91, 369.994, 0.026, 0.17);
    bell(48.41, 293.665, 0.029, -0.09);
    tone(48.4, 1.58, 146.832, { peak: 0.028, attack: 0.097, release: 1.4 });
  }

  function dispose(): void {
    if (disposed) return;
    disposed = true;
    stop();
    const closing = context;
    context = null;
    master = null;
    if (closing && closing.state !== "closed") void closing.close().catch(() => {});
  }

  return { start, stop, dispose };
}
