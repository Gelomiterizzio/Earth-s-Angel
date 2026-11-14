// AI-assisted: Cursor Grok 4.7, reviewed by C
import type { Flow, OptionsService, Store } from '../app/context';
import type { AudioApi } from '../app/context';
import { createManager, type ManagedAudio } from './audio-manager';

const managers = new WeakMap<AudioApi, ManagedAudio>();

export function createAudio(options: OptionsService): AudioApi {
  const managed = createManager(options);
  managers.set(managed, managed);
  return managed;
}

/** A calls this from main.ts so game events play without the screens knowing each sound. */
export function attachAudio(audio: AudioApi, store: Store, flow: Flow): () => void {
  return managers.get(audio)?.attach(store, flow) ?? (() => undefined);
}
