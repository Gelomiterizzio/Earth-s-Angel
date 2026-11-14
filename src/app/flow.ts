// AI-assisted: Antigravity (Gemini) and OpenAI Codex; integrated from A and B.

import { applyTransition } from '../core/progression';
import { createEarth } from '../core/earth';
import { startDay } from '../core/day-cycle';
import { createCampaign } from '../core/mission';
import type { DifficultyId, MapView } from '../core/types';
import type { AppContext, Flow, SceneId, Screen } from './context';
import { resolveSeed } from './seed';

export const ALLOWED_TRANSITIONS: Record<SceneId, SceneId[]> = {
  arranque: ['titulo'],
  titulo: ['dificultad', 'opciones', 'creditos', 'despedida', 'mision', 'resultado', 'cinematica'],
  opciones: ['titulo', 'pausa', 'mision'],
  dificultad: ['titulo', 'cinematica'],
  cinematica: ['mision', 'creditos', 'titulo'],
  mision: ['opciones', 'pausa', 'resultado'],
  pausa: ['mision', 'opciones', 'titulo'],
  resultado: ['mision', 'creditos', 'titulo', 'dificultad', 'cinematica', 'eleccion'],
  eleccion: ['cinematica', 'resultado', 'titulo'],
  creditos: ['titulo'],
  despedida: ['titulo'],
};

export interface CreateFlowOptions {
  uiRoot: HTMLElement;
  getContext: () => AppContext;
  getMapView?: () => MapView | null;
  search?: string;
}

export function createFlow(opts: CreateFlowOptions): Flow {
  const screens = new Map<SceneId, Screen>();
  const listeners = new Set<(e: { from: SceneId; to: SceneId }) => void>();

  let currentScene: SceneId = 'arranque';
  let currentParams: Record<string, unknown> = {};
  let activeScreen: Screen | null = null;
  let optionsReturn: 'titulo' | 'mision' | 'pausa' = 'titulo';
  let activeCinematicLatch: string | null = null;
  let storeSubscribed = false;

  function ensureStoreSubscription(): void {
    if (storeSubscribed) return;
    let ctx: AppContext;
    try {
      ctx = opts.getContext();
    } catch {
      return;
    }
    storeSubscribed = true;
    ctx.store.subscribe((state) => {
      if ((state.earth ? state.earth.result : state.mission.result) && currentScene === 'mision') {
        go('resultado');
      }
    });
  }

  function updateMapVisibility(scene: SceneId): void {
    const mapView = opts.getMapView?.();
    if (!mapView) return;
    mapView.setVisible((scene === 'mision' || scene === 'pausa') && !opts.getContext().store.getState()?.earth);
  }

  function focusFirstControl(): void {
    if (typeof HTMLElement === 'undefined') return;
    if (opts.uiRoot.contains(document.activeElement)) return;
    const first = opts.uiRoot.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    first?.focus?.();
  }

  function go(to: SceneId, params: Record<string, unknown> = {}): void {
    ensureStoreSubscription();
    if (to === currentScene) return;

    if (currentScene === 'titulo' && to === 'resultado') {
      const state = opts.getContext().store.getState();
      if (!(state?.earth ? state.earth.result : state?.mission.result)) return;
    }

    const allowed = ALLOWED_TRANSITIONS[currentScene] ?? [];
    if (!allowed.includes(to)) {
      if (import.meta.env?.DEV) {
        console.warn(`[flow] Ignored invalid transition: ${currentScene} -> ${to}`);
      }
      return;
    }

    const from = currentScene;
    if (to === 'opciones') {
      optionsReturn = from === 'mision' || from === 'pausa' ? from : 'titulo';
    }

    if (activeScreen) {
      try {
        activeScreen.unmount();
      } catch (err) {
        if (import.meta.env?.DEV) {
          console.error('[flow] Error unmounting screen:', err);
        }
      }
      activeScreen = null;
    }

    opts.uiRoot.innerHTML = '';
    currentScene = to;
    currentParams = { ...params };

    if (to === 'cinematica') {
      activeCinematicLatch = String(params.id ?? 'opening');
    } else {
      activeCinematicLatch = null;
    }

    updateMapVisibility(to);

    const nextScreen = screens.get(to) ?? null;
    if (nextScreen) {
      try {
        const ctx = opts.getContext();
        activeScreen = nextScreen;
        nextScreen.mount(opts.uiRoot, ctx);
      } catch (err) {
        if (import.meta.env?.DEV) {
          console.error(`[flow] Error mounting screen ${to}:`, err);
        }
        activeScreen = null;
        if (to !== 'titulo') {
          currentScene = 'titulo';
          updateMapVisibility('titulo');
          const titleScreen = screens.get('titulo');
          if (titleScreen) {
            try {
              activeScreen = titleScreen;
              titleScreen.mount(opts.uiRoot, opts.getContext());
            } catch {
              // ignore
            }
          }
        }
      }
    }

    for (const fn of [...listeners]) {
      fn({ from, to: currentScene });
    }

    focusFirstControl();
  }

  function updateFlags(flags: Record<string, boolean>): void {
    const { store } = opts.getContext();
    const state = store.getState();
    if (!state) return;
    store.replaceState({
      ...state,
      campaign: { ...state.campaign, narrativeFlags: { ...state.campaign.narrativeFlags, ...flags } },
    });
  }

  function playEnding(id: 'marsVictory' | 'earthVictory'): void {
    updateFlags({ [id]: true });
    go('cinematica', { id });
  }

  return {
    current(): { scene: SceneId; params: Record<string, unknown> } {
      return { scene: currentScene, params: { ...currentParams } };
    },

    register(scene: SceneId, screen: Screen): void {
      screens.set(scene, screen);
    },

    go,

    back(): void {
      if (currentScene === 'opciones') {
        go(optionsReturn);
      } else if (currentScene === 'pausa') {
        go('mision');
      } else if (
        currentScene === 'dificultad' ||
        currentScene === 'creditos' ||
        currentScene === 'despedida'
      ) {
        go('titulo');
      }
    },

    startCampaign(difficulty: DifficultyId): void {
      ensureStoreSubscription();
      const ctx = opts.getContext();
      const { seed, canonical } = resolveSeed(opts.search);
      const created = createCampaign(difficulty, seed, ctx.data, { canonical });
      const opened = startDay(created, ctx.data);
      ctx.store.replaceState(opened.state, opened.events);

      if (currentScene !== 'dificultad') {
        go('dificultad');
      }
      go('cinematica', { id: 'opening' });
    },

    canContinue(): boolean {
      const state = opts.getContext().store.getState();
      return state !== null && !state.campaign.narrativeFlags.endingSeen;
    },

    continueCampaign(): void {
      const state = opts.getContext().store.getState();
      if (!state || state.campaign.narrativeFlags.endingSeen) return;
      const flags = state.campaign.narrativeFlags;
      if (flags.earthVictory) go('cinematica', { id: 'earthVictory' });
      else if (flags.marsVictory) go('cinematica', { id: 'marsVictory' });
      else if (flags.wormholePending) go('cinematica', { id: 'wormhole' });
      else if (flags.marsArrivalPending) go('cinematica', { id: 'moonToMars' });
      else go((state.earth ? state.earth.result : state.mission.result) ? 'resultado' : 'mision');
    },

    departToMars(): void {
      const { store, data } = opts.getContext();
      const state = store.getState();
      if (!state || currentScene !== 'resultado' || state.mission.level !== 'luna') return;
      const result = applyTransition(state, 'luna->marte', data);
      if (!result.ok) return;
      result.state.campaign.narrativeFlags = { ...result.state.campaign.narrativeFlags, marsArrivalPending: true };
      store.replaceState(result.state, result.events);
      go('cinematica', { id: 'moonToMars' });
    },

    chooseEnding(choice): void {
      const { store, data } = opts.getContext();
      const state = store.getState();
      if (!state || state.earth || state.mission.level !== 'marte' || state.mission.result?.outcome !== 'victory'
        || (currentScene !== 'resultado' && currentScene !== 'eleccion')) return;
      if (choice === 'mars') {
        playEnding('marsVictory');
        return;
      }
      const activation = store.dispatch({ type: 'ACTIVATE_BEACONS' });
      if (!activation.ok) return;
      const result = applyTransition(activation.state, 'marte->tierra', data);
      if (!result.ok) return;
      result.state.campaign.narrativeFlags = { ...result.state.campaign.narrativeFlags, wormholePending: true };
      store.replaceState(result.state, result.events);
      go('cinematica', { id: 'wormhole' });
    },

    finishEarth(choice): void {
      const { store, data } = opts.getContext();
      const state = store.getState();
      if (currentScene !== 'resultado' || !state?.earth?.result) return;
      if (state.earth.result.outcome === 'victory') {
        if (choice === 'earth') playEnding('earthVictory');
      } else if (choice === 'retry' && data.earth) {
        store.replaceState({ ...state, earth: createEarth(state.campaign.difficulty, data) });
        go('mision');
      } else if (choice === 'mars') {
        const result = applyTransition(state, 'tierra->marte', data);
        if (!result.ok) return;
        store.replaceState(result.state, result.events);
        playEnding('marsVictory');
      }
    },

    completeCinematic(id: string): void {
      if (currentScene !== 'cinematica') return;
      if (activeCinematicLatch === null) return;
      if (id && activeCinematicLatch !== id) return;
      const destination = activeCinematicLatch === 'marsVictory' || activeCinematicLatch === 'earthVictory'
        ? 'creditos'
        : 'mision';
      const scene = activeCinematicLatch;
      activeCinematicLatch = null;
      if (scene === 'moonToMars') updateFlags({ marsArrivalPending: false });
      if (scene === 'wormhole') updateFlags({ wormholePending: false });
      if (destination === 'creditos') updateFlags({ endingSeen: true });
      go(destination);
    },

    hasActiveMission(): boolean {
      try {
        const state = opts.getContext().store.getState();
        return state !== null && (state.earth ? state.earth.result : state.mission.result) === null;
      } catch {
        return false;
      }
    },

    subscribe(listener: (e: { from: SceneId; to: SceneId }) => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
