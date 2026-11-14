// AI-assisted: Antigravity (Gemini) and OpenAI Codex; integrated from A and B.

import { describe, expect, it, vi } from 'vitest';
import type { AppContext, SceneId, Screen } from '../../src/app/context';
import { createFlow } from '../../src/app/flow';
import { createI18n } from '../../src/app/i18n';
import { createOptionsService } from '../../src/app/options';
import { createSilentAudio } from '../../src/app/silent-audio';
import { createStore } from '../../src/app/store';
import { createUiStore } from '../../src/app/ui-store';
import { fixtureState } from '../../src/core/fixtures';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();

function makeMockElement(): HTMLElement {
  return {
    innerHTML: '',
    querySelector: () => null,
  } as unknown as HTMLElement;
}

function setupFlow() {
  const uiRoot = makeMockElement();
  const store = createStore(data);
  const uiStore = createUiStore();
  const options = createOptionsService(null);
  const i18n = createI18n('en');
  const audio = createSilentAudio();
  const mapVisibleLog: boolean[] = [];

  let ctx!: AppContext;
  const flow = createFlow({
    uiRoot,
    getContext: () => ctx,
    getMapView: () => ({
      setVisible(v: boolean) {
        mapVisibleLog.push(v);
      },
      destroy() {},
    }),
    search: '?seed=demo',
  });

  ctx = {
    store,
    uiStore,
    flow,
    options,
    t: (k, p) => i18n.t(k, p),
    audio,
    data,
  };

  return { flow, store, uiStore, options, uiRoot, mapVisibleLog };
}

describe('Scene flow state machine (U-FLU-01..05)', () => {
  it('U-FLU-01: every P0 transition in the table is accepted', () => {
    const { flow } = setupFlow();

    expect(flow.current().scene).toBe('arranque');
    flow.go('titulo');
    expect(flow.current().scene).toBe('titulo');

    flow.go('opciones');
    expect(flow.current().scene).toBe('opciones');
    flow.back();
    expect(flow.current().scene).toBe('titulo');

    flow.go('creditos');
    expect(flow.current().scene).toBe('creditos');
    flow.go('titulo');
    expect(flow.current().scene).toBe('titulo');

    flow.go('despedida');
    expect(flow.current().scene).toBe('despedida');
    flow.go('titulo');
    expect(flow.current().scene).toBe('titulo');

    flow.go('dificultad');
    expect(flow.current().scene).toBe('dificultad');
    flow.go('cinematica', { id: 'opening' });
    expect(flow.current().scene).toBe('cinematica');

    flow.completeCinematic('opening');
    expect(flow.current().scene).toBe('mision');

    flow.go('pausa');
    expect(flow.current().scene).toBe('pausa');
    flow.go('opciones');
    expect(flow.current().scene).toBe('opciones');
    flow.back();
    expect(flow.current().scene).toBe('pausa');
    flow.go('mision');
    expect(flow.current().scene).toBe('mision');

    flow.go('resultado');
    expect(flow.current().scene).toBe('resultado');
    flow.go('mision');
    expect(flow.current().scene).toBe('mision');
    flow.go('resultado');
    flow.go('titulo');
    expect(flow.current().scene).toBe('titulo');
  });

  it('U-FLU-02: invalid transition titulo -> resultado is ignored and stays on titulo', () => {
    const { flow } = setupFlow();
    flow.go('titulo');
    flow.go('resultado');
    expect(flow.current().scene).toBe('titulo');
  });

  it('U-FLU-03: calling completeCinematic twice triggers only a single navigation', () => {
    const { flow } = setupFlow();
    const transitions: { from: SceneId; to: SceneId }[] = [];
    flow.subscribe((e) => transitions.push(e));

    flow.go('titulo');
    flow.startCampaign('media');
    expect(flow.current().scene).toBe('cinematica');

    transitions.length = 0;
    flow.completeCinematic('opening');
    flow.completeCinematic('opening');

    expect(flow.current().scene).toBe('mision');
    expect(transitions).toEqual([{ from: 'cinematica', to: 'mision' }]);
  });

  it('U-FLU-04: when state transitions to having a mission result, flow goes to resultado', () => {
    const { flow, store } = setupFlow();
    flow.go('titulo');
    flow.startCampaign('media');
    flow.completeCinematic('opening');
    expect(flow.current().scene).toBe('mision');

    const s8 = fixtureState('media-dia-8');
    // Force a defeat on day 8 by setting crew health to 0
    s8.mission.phase = 'planning';
    s8.mission.decisionPending = null;
    s8.mission.crew[0].health = 0;
    store.load(s8);
    store.dispatch({ type: 'END_DAY', day: 8 });

    expect(flow.current().scene).toBe('resultado');
  });

  it('U-FLU-05: changing scene calls unmount of previous before mount of next and cleans up subscriptions', () => {
    const { flow, store } = setupFlow();
    const callOrder: string[] = [];
    let unsub: (() => void) | null = null;
    const subSpy = vi.fn();

    const titleScreen: Screen = {
      mount(_root, ctx) {
        callOrder.push('mount:titulo');
        unsub = ctx.store.subscribe(subSpy);
      },
      unmount() {
        callOrder.push('unmount:titulo');
        unsub?.();
        unsub = null;
      },
    };

    const diffScreen: Screen = {
      mount() {
        callOrder.push('mount:dificultad');
      },
      unmount() {
        callOrder.push('unmount:dificultad');
      },
    };

    flow.register('titulo', titleScreen);
    flow.register('dificultad', diffScreen);

    flow.go('titulo');
    flow.go('dificultad');

    expect(callOrder).toEqual(['mount:titulo', 'unmount:titulo', 'mount:dificultad']);

    // Verify subscription from unmounted titleScreen is no longer active
    store.load(fixtureState('media-dia-1'));
    expect(subSpy).not.toHaveBeenCalled();
  });

  it('returns from mission options with the same turn, and offers a new difficulty from the result', () => {
    const { flow, store } = setupFlow();
    flow.go('titulo');
    flow.startCampaign('media');
    flow.completeCinematic('opening');
    const mission = store.getState();

    flow.go('opciones');
    expect(flow.current().scene).toBe('opciones');
    flow.back();
    expect(flow.current().scene).toBe('mision');
    expect(store.getState()).toBe(mission);

    flow.go('resultado');
    flow.go('dificultad');
    expect(flow.current().scene).toBe('dificultad');
    flow.startCampaign('facil');
    expect(store.getState()?.campaign.difficulty).toBe('facil');
    expect(flow.current().scene).toBe('cinematica');
  });

  it.each(['marsVictory', 'earthVictory'])('routes %s to credits after closing its playback', (id) => {
    const { flow } = setupFlow();
    flow.go('titulo');
    flow.startCampaign('media');
    flow.completeCinematic('opening');
    flow.go('resultado');
    flow.go('cinematica', { id });
    flow.completeCinematic(id);
    expect(flow.current().scene).toBe('creditos');
  });
});
