// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
// Original game audio synthesized from oscillators and note patterns.

export interface Playback {
  stop(when?: number): void;
  ended: AudioScheduledSourceNode;
}

type Tone = {
  frequency: number;
  offset: number;
  length: number;
  amplitude: number;
  wave?: OscillatorType;
  endFrequency?: number;
};

const note = (
  frequency: number,
  offset: number,
  length: number,
  amplitude: number,
  wave?: OscillatorType,
  endFrequency?: number,
): Tone => ({ frequency, offset, length, amplitude, wave, endFrequency });

const EFFECTS: Record<string, Tone[]> = {
  'sfx-click': [note(880, 0, 0.055, 0.055)],
  'sfx-confirm': [note(523, 0, 0.14, 0.062), note(784, 0.08, 0.18, 0.055)],
  'sfx-error': [note(225, 0, 0.16, 0.065, 'triangle', 150)],
  'sfx-build': [note(140, 0, 0.17, 0.12, 'triangle', 52), note(330, 0.11, 0.17, 0.052, 'triangle', 440)],
  'sfx-online': [note(294, 0, 0.12, 0.048), note(587, 0.15, 0.22, 0.052)],
  'sfx-explore': [note(310, 0, 0.25, 0.06, 'sine', 525), note(620, 0.16, 0.14, 0.045)],
  'sfx-collect': [note(659, 0, 0.14, 0.064, 'triangle'), note(988, 0.07, 0.22, 0.063), note(1319, 0.13, 0.18, 0.039)],
  'sfx-produce': [note(523, 0, 0.22, 0.05), note(659, 0.05, 0.22, 0.038), note(784, 0.12, 0.28, 0.037)],
  'sfx-day-end': [note(330, 0, 0.55, 0.07), note(660, 0, 0.21, 0.035)],
  'sfx-alert-radiation': [0, 0.19, 0.38].map((offset) => note(640, offset, 0.14, 0.09, 'triangle')),
  'sfx-alert-shortage': [note(247, 0, 0.18, 0.085, 'triangle'), note(185, 0.2, 0.24, 0.068)],
  'sfx-objective': [note(523, 0, 0.18, 0.05), note(659, 0.12, 0.18, 0.06), note(784, 0.24, 0.3, 0.06)],
  'sfx-discovery': [note(440, 0, 0.3, 0.07), note(659, 0.1, 0.39, 0.066), note(880, 0.24, 0.42, 0.04)],
  'sfx-victory': [note(523, 0, 0.22, 0.077, 'triangle'), note(659, 0.14, 0.22, 0.066), note(784, 0.28, 0.36, 0.062)],
  'sfx-defeat': [note(392, 0, 0.23, 0.075), note(330, 0.18, 0.25, 0.062), note(262, 0.36, 0.42, 0.054)],
  'sfx-radio': [note(388, 0, 0.1, 0.055, 'triangle', 530), note(760, 0.12, 0.08, 0.036), note(510, 0.22, 0.12, 0.036)],
  'sfx-launch': [note(43, 0, 1.15, 0.113, 'triangle', 95), note(74, 0.15, 0.86, 0.057, 'triangle', 166), note(158, 0.34, 0.61, 0.036, 'sine', 285)],
  'sfx-landing': [note(116, 0, 0.43, 0.085, 'triangle', 51), note(330, 0.4, 0.28, 0.036), note(494, 0.57, 0.32, 0.032)],
  'sfx-portal': [note(587, 0, 0.9, 0.053, 'sine', 186), note(294, 0.11, 0.98, 0.059, 'triangle', 785)],
};

export function playSfx(ctx: AudioContext, destination: AudioNode, id: string): Playback {
  if (id === 'sfx-dust') return playDust(ctx, destination);
  const now = ctx.currentTime;
  const source = ctx.createGain();
  source.connect(destination);
  let last: AudioScheduledSourceNode | undefined;
  let tail = 0;
  const voices = (EFFECTS[id] ?? [note(440, 0, 0.08, 0.045)]).map((tone) => {
    const start = now + tone.offset;
    const end = start + tone.length;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = tone.wave ?? 'sine';
    osc.frequency.setValueAtTime(tone.frequency, start);
    if (tone.endFrequency !== undefined) osc.frequency.exponentialRampToValueAtTime(tone.endFrequency, end);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(tone.amplitude, start + Math.min(0.028, tone.length / 4));
    amp.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(amp).connect(source);
    osc.start(start);
    osc.stop(end + 0.01);
    if (end > tail) {
      last = osc;
      tail = end;
    }
    osc.addEventListener('ended', () => { osc.disconnect(); amp.disconnect(); }, { once: true });
    return osc;
  });

  const ended = last ?? voices[0];
  ended.addEventListener('ended', () => source.disconnect(), { once: true });
  return {
    ended,
    stop(when = now) {
      source.disconnect();
      for (const osc of voices) osc.stop(when);
    },
  };
}

function playDust(ctx: AudioContext, destination: AudioNode): Playback {
  const duration = 0.78;
  const rate = 16000;
  const buffer = ctx.createBuffer(1, Math.ceil(duration * rate), rate);
  const samples = buffer.getChannelData(0);
  let seed = 31;
  for (let i = 0; i < samples.length; i += 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    samples[i] = seed / 0x80000000 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 0.65;
  const now = ctx.currentTime;
  filter.frequency.setValueAtTime(520, now);
  filter.frequency.exponentialRampToValueAtTime(160, now + duration);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.26);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  source.connect(filter).connect(gain).connect(destination);
  source.start(now);
  source.addEventListener('ended', () => { source.disconnect(); filter.disconnect(); gain.disconnect(); }, { once: true });
  return { ended: source, stop: (when) => source.stop(when) };
}

interface Score {
  tempo: number;
  chords: number[][];
  motif: [beat: number, pitch: number][];
  pulse?: boolean;
}

const SCORES: Record<string, Score> = {
  'music-menu': {
    tempo: 91,
    chords: [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 59, 64], [55, 59, 62, 67]],
    motif: [[0, 0], [1.5, 1], [3, 3], [4.5, 2], [6, 0]],
  },
  'music-moon': {
    tempo: 67,
    chords: [[50, 57, 60, 65], [46, 53, 57, 60], [53, 57, 60, 67], [48, 55, 57, 64]],
    motif: [[0.5, 0], [3.5, 2], [6.5, 1]],
  },
  'music-cinematic': {
    tempo: 76,
    chords: [[52, 59, 62, 67], [48, 55, 59, 64], [55, 59, 62, 67], [50, 57, 62, 66]],
    motif: [[1, 1], [3, 3], [5.5, 2]],
  },
  'music-transit': {
    tempo: 83,
    chords: [[50, 57, 60, 65], [46, 53, 58, 62], [48, 55, 60, 64], [52, 59, 62, 67]],
    motif: [[0, 0], [2.5, 1], [4, 3], [7, 2]],
    pulse: true,
  },
  'music-mars': {
    tempo: 81,
    chords: [[45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 58], [48, 52, 55, 59]],
    motif: [[1, 0], [3, 3], [4.75, 2], [6, 1]],
    pulse: true,
  },
  'music-portal': {
    tempo: 69,
    chords: [[46, 53, 57, 61], [42, 49, 54, 57], [49, 56, 60, 64], [44, 51, 56, 60]],
    motif: [[0.75, 3], [2.5, 1], [5, 2], [7.25, 0]],
  },
  'music-earth': {
    tempo: 86,
    chords: [[53, 60, 64, 69], [45, 52, 57, 60], [46, 53, 57, 62], [48, 55, 60, 64]],
    motif: [[0, 0], [1, 2], [2.5, 3], [4.5, 2], [6, 1]],
  },
  'music-ending': {
    tempo: 74,
    chords: [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 59, 62]],
    motif: [[0.5, 2], [2.5, 3], [4.25, 1], [6.25, 0]],
  },
  'music-victory': {
    tempo: 96,
    chords: [[48, 55, 60, 64], [53, 60, 64, 69]],
    motif: [[0.5, 0], [1.5, 1], [2.5, 2], [4.5, 3]],
  },
  'music-defeat': {
    tempo: 71,
    chords: [[45, 52, 55, 60], [41, 48, 52, 57]],
    motif: [[0.5, 3], [2.5, 2], [5, 1]],
  },
};

const musicBuffers = new WeakMap<AudioContext, Map<string, AudioBuffer>>();
const TAU = 2 * Math.PI;
const BEATS_PER_CHORD = 8;

function frequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

function makeScore(ctx: AudioContext, score: Score, loop: boolean): AudioBuffer {
  const sampleRate = 16000;
  const beat = 60 / score.tempo;
  const section = beat * BEATS_PER_CHORD;
  const frames = Math.ceil(score.chords.length * section * sampleRate);
  const buffer = ctx.createBuffer(2, frames, sampleRate);
  const l = buffer.getChannelData(0);
  const r = buffer.getChannelData(1);

  const add = (midi: number, start: number, length: number, amount: number, pan: number, pad: boolean): void => {
    const step = TAU * frequency(midi) / sampleRate;
    const first = Math.floor(start * sampleRate);
    const samples = Math.floor(length * sampleRate);
    const attack = (pad ? 0.78 : 0.027) * sampleRate;
    const release = (pad ? 0.9 : length * 0.82) * sampleRate;
    const left = Math.sqrt((1 - pan) / 2) * amount;
    const right = Math.sqrt((1 + pan) / 2) * amount;
    const variation = pad ? 0.09 : 0.19;
    for (let i = 0; i < samples; i += 1) {
      const target = first + i;
      if (!loop && target >= frames) break;
      const index = target % frames;
      const envelope = Math.min(1, i / attack, (samples - i) / release);
      const phase = i * step;
      const sample = (Math.sin(phase) + variation * Math.sin(phase * (pad ? 2.001 : 2))) * envelope ** 2;
      l[index] += sample * left;
      r[index] += sample * right;
    }
  };

  score.chords.forEach((chord, bar) => {
    const start = bar * section;
    const length = section + (bar === score.chords.length - 1 && !loop ? 0 : 0.52);
    chord.forEach((pitch, voice) => {
      add(pitch, start, length, voice === 0 ? 0.061 : 0.032, (voice - 1.5) * 0.27, true);
    });
    if (score.pulse) {
      for (const time of [0, 2.5, 4, 6.5]) add(chord[0] - 12, start + time * beat, 0.6 * beat, 0.068, 0, false);
    }
    score.motif.forEach(([time, pitch], index) => {
      const midi = chord[pitch] + 12;
      const pan = index % 2 === 0 ? -0.42 : 0.42;
      add(midi, start + time * beat, 1.18 * beat, 0.076, pan, false);
      add(midi, start + (time + 0.48) * beat, 0.85 * beat, 0.018, -pan, false);
    });
  });
  if (!loop) {
    const release = Math.floor(0.4 * sampleRate);
    for (let i = 0; i < release; i += 1) {
      l[frames - 1 - i] *= i / release;
      r[frames - 1 - i] *= i / release;
    }
  }
  return buffer;
}

export function startBed(ctx: AudioContext, destination: AudioNode, id: string, loop: boolean): Playback {
  let buffers = musicBuffers.get(ctx);
  if (!buffers) {
    buffers = new Map();
    musicBuffers.set(ctx, buffers);
  }
  let buffer = buffers.get(id);
  if (!buffer) {
    buffer = makeScore(ctx, SCORES[id] ?? SCORES['music-menu'], loop);
    buffers.set(id, buffer);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;
  source.connect(destination);
  source.start();
  source.addEventListener('ended', () => source.disconnect(), { once: true });
  return { ended: source, stop: (when) => source.stop(when) };
}
