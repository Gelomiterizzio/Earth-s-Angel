// AI-assisted: Antigravity (Gemini), reviewed by A

import type {
  DifficultyId,
  GameData,
  MapView,
  Tool,
  UiState,
} from '../core/types';
import type { Store } from './store';
import type { UiStore } from './ui-store';

export type { MapView, Store, Tool, UiState, UiStore };

export type SceneId =
  | 'arranque'
  | 'titulo'
  | 'opciones'
  | 'dificultad'
  | 'cinematica'
  | 'mision'
  | 'pausa'
  | 'resultado'
  | 'creditos'
  | 'despedida'
  | 'eleccion';

export interface Options {
  language: 'en' | 'es';
  volumeMaster: number;
  volumeMusic: number;
  volumeSfx: number;
  muted: boolean;
  subtitles: boolean;
  reducedMotion: boolean;
  fullscreen: boolean;
  tutorial: boolean;
  learningCheck: boolean;
}

export interface OptionsService {
  get(): Options;
  set<K extends keyof Options>(key: K, value: Options[K]): void;
  reset(): void;
  subscribe(listener: (o: Options) => void): () => void;
}

export interface AudioApi {
  unlock(): void;
  playMusic(id: string): void;
  stopMusic(): void;
  playSfx(id: string): void;
  setMusicVolume?(v: number): void;
  setSfxVolume?(v: number): void;
  setMuted?(m: boolean): void;
}

export interface Screen {
  mount(root: HTMLElement, ctx: AppContext): void;
  unmount(): void;
}

export interface Flow {
  current(): { scene: SceneId; params: Record<string, unknown> };
  register(scene: SceneId, screen: Screen): void;
  go(scene: SceneId, params?: Record<string, unknown>): void;
  back(): void;
  startCampaign(difficulty: DifficultyId): void;
  completeCinematic(id: string): void;
  hasActiveMission(): boolean;
  canContinue?(): boolean;
  continueCampaign?(): void;
  departToMars?(): void;
  chooseEnding?(choice: 'mars' | 'portal'): void;
  finishEarth?(choice: 'retry' | 'mars' | 'earth'): void;
  subscribe(listener: (e: { from: SceneId; to: SceneId }) => void): () => void;
}

export interface AppContext {
  store: Store;
  uiStore: UiStore;
  flow: Flow;
  options: OptionsService;
  t: (key: string, params?: Record<string, string | number>) => string;
  audio: AudioApi;
  data: GameData;
}
