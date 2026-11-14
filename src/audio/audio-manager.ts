// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import type { AudioApi, Flow, OptionsService, Store } from '../app/context';
import type { GameEvent } from '../core/types';
import { EVENT_SFX, MUSIC_FILE, MUSIC_LOOP, PACKAGED_AUDIO, musicFor } from './manifest';
import { playSfx, startBed, type Playback } from './synth';

const MAX_VOICES = 8;
const FADE_SECONDS = 0.8;

interface Music {
  id: string;
  playback: Playback;
  gain: GainNode;
}

export interface ManagedAudio extends AudioApi {
  attach(store: Store, flow: Flow): () => void;
}

export function createManager(options: OptionsService): ManagedAudio {
  let context: AudioContext | null = null;
  let master: GainNode | null = null;
  let musicGain: GainNode | null = null;
  let sfxGain: GainNode | null = null;
  let wantedMusic: string | null = null;
  let activeMusic: Music | null = null;
  const voices = new Set<Playback>();
  const packaged = new Map<string, Promise<AudioBuffer | null>>();

  function applyGains(initial = false): void {
    if (!master || !musicGain || !sfxGain || !context) return;
    const settings = options.get();
    const now = context.currentTime;
    const masterValue = settings.muted ? 0 : settings.volumeMaster / 100;
    if (initial) {
      master.gain.setValueAtTime(masterValue, now);
      musicGain.gain.setValueAtTime(settings.volumeMusic / 100, now);
      sfxGain.gain.setValueAtTime(settings.volumeSfx / 100, now);
    } else {
      master.gain.setTargetAtTime(masterValue, now, 0.012);
      musicGain.gain.setTargetAtTime(settings.volumeMusic / 100, now, 0.012);
      sfxGain.gain.setTargetAtTime(settings.volumeSfx / 100, now, 0.012);
    }
  }

  function fadeOut(): void {
    if (!activeMusic || !context) return;
    const { gain, playback } = activeMusic;
    const now = context.currentTime;
    if (typeof gain.gain.cancelAndHoldAtTime === 'function') gain.gain.cancelAndHoldAtTime(now);
    else {
      const value = gain.gain.value;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(value, now);
    }
    gain.gain.linearRampToValueAtTime(0, now + FADE_SECONDS);
    playback.stop(now + FADE_SECONDS);
    activeMusic = null;
  }

  function loadPackaged(ctx: AudioContext, id: string, filename: string): Promise<AudioBuffer | null> {
    let pending = packaged.get(id);
    if (!pending) {
      // BASE_URL is relative to the page for Vite's GitHub Pages build.
      const url = new URL(filename, new URL(import.meta.env?.BASE_URL ?? '../..', document.baseURI));
      pending = fetch(url)
        .then((response) => response.ok ? response.arrayBuffer() : null)
        .then((bytes) => bytes ? ctx.decodeAudioData(bytes) : null)
        .catch(() => null);
      packaged.set(id, pending);
    }
    return pending;
  }

  async function startMusic(id: string): Promise<void> {
    const ctx = context;
    if (!ctx || !musicGain || activeMusic?.id === id) return;
    const file = PACKAGED_AUDIO.includes(id) ? MUSIC_FILE[id] : undefined;
    const buffer = file ? await loadPackaged(ctx, id, file) : null;
    if (wantedMusic !== id || activeMusic?.id === id) return;

    fadeOut();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + FADE_SECONDS);
    gain.connect(musicGain);
    const loop = MUSIC_LOOP.has(id);
    const playback = buffer ? startBuffer(ctx, gain, buffer, loop) : startBed(ctx, gain, id, loop);
    const track = { id, playback, gain };
    activeMusic = track;
    playback.ended.addEventListener('ended', () => {
      gain.disconnect();
      if (activeMusic === track) activeMusic = null;
    }, { once: true });
  }

  const api: ManagedAudio = {
    unlock() {
      if (!context) {
        const Context = window.AudioContext ??
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Context) return;
        try {
          context = new Context();
        } catch {
          return;
        }
        master = context.createGain();
        musicGain = context.createGain();
        sfxGain = context.createGain();
        musicGain.connect(master);
        sfxGain.connect(master);
        master.connect(context.destination);
        applyGains(true);
        if (wantedMusic) void startMusic(wantedMusic);
      }
      if (context.state === 'suspended') void context.resume().catch(() => {});
    },
    playMusic(id) {
      if (wantedMusic === id) return;
      wantedMusic = id;
      void startMusic(id);
    },
    stopMusic() {
      wantedMusic = null;
      fadeOut();
    },
    playSfx(id) {
      if (!context || !sfxGain) return;
      if (voices.size >= MAX_VOICES) {
        const oldest = voices.values().next().value;
        if (oldest) {
          voices.delete(oldest);
          oldest.stop(context.currentTime);
        }
      }
      const playback = playSfx(context, sfxGain, id);
      voices.add(playback);
      playback.ended.addEventListener('ended', () => voices.delete(playback), { once: true });
    },
    attach(store, flow) {
      const events = Object.keys(EVENT_SFX) as GameEvent['type'][];
      const playedInBatch = new Set<string>();
      const offEvents = events.map((type) => store.on(type, () => {
        const id = EVENT_SFX[type];
        if (!id || playedInBatch.has(id)) return;
        playedInBatch.add(id);
        queueMicrotask(() => playedInBatch.delete(id));
        api.playSfx(id);
      }));
      const offFlow = flow.subscribe(({ from, to }) => {
        if (to === 'despedida') {
          api.stopMusic();
          return;
        }
        const track = musicFor(to, from, store.getState()?.campaign.level);
        if (track) api.playMusic(track);
      });
      return () => {
        for (const off of offEvents) off();
        offFlow();
      };
    },
  };

  options.subscribe(() => applyGains());
  document.addEventListener('visibilitychange', () => {
    if (!context) return;
    const work = document.hidden ? context.suspend() : context.resume();
    void work.catch(() => {});
  });
  return api;
}

function startBuffer(ctx: AudioContext, destination: AudioNode, buffer: AudioBuffer, loop: boolean): Playback {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;
  source.connect(destination);
  source.start();
  source.addEventListener('ended', () => source.disconnect(), { once: true });
  return { ended: source, stop: (when) => source.stop(when) };
}
