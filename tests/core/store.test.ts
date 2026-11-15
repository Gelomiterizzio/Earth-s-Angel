// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it, vi } from 'vitest';
import { createStore } from '../../src/app/store';
import { createUiStore } from '../../src/app/ui-store';
import { fixtureState } from '../../src/core/fixtures';
import { loadGameData } from '../../src/data/index';
import type { GameEvent } from '../../src/core/types';

const data = loadGameData();

describe('Store and UiStore (U-ALM-01..03)', () => {
  it('U-ALM-01: load(state) notifies a subscriber once with the state', () => {
    const store = createStore(data);
    const sub = vi.fn();
    const unsub = store.subscribe(sub);

    const state = fixtureState('media-dia-1');
    store.load(state);

    expect(sub).toHaveBeenCalledTimes(1);
    expect(sub.mock.calls[0][0]).toBe(state);

    unsub();
    store.load(fixtureState('media-dia-8'));
    expect(sub).toHaveBeenCalledTimes(1);
  });

  it('U-ALM-02: dispatch of invalid action emits action/rejected and preserves getState() reference', () => {
    const initial = fixtureState('media-dia-1');
    const store = createStore(data, initial);
    const rejected: GameEvent[] = [];
    store.on('action/rejected', (ev) => rejected.push(ev));

    const res = store.dispatch({
      type: 'BUILD',
      building: 'extractor',
      x: 24,
      y: 24,
    });

    expect(res.ok).toBe(false);
    expect(store.getState()).toBe(initial);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].type).toBe('action/rejected');
  });

  it('U-ALM-03: dispatch of valid action notifies subscriber once and forwards events in order, and uiStore notifies on tool/hover change', () => {
    const initial = fixtureState('media-dia-1');
    const store = createStore(data, initial);
    const sub = vi.fn();
    const eventsOrder: string[] = [];

    store.subscribe(sub);
    store.on('tile/explored', (e) => eventsOrder.push(e.type));
    store.on('discovery/found', (e) => eventsOrder.push(e.type));

    const res = store.dispatch({ type: 'EXPLORE', x: 28, y: 22 });
    expect(res.ok).toBe(true);
    expect(sub).toHaveBeenCalledTimes(1);
    expect(eventsOrder).toEqual(['tile/explored', 'discovery/found']);

    // UiStore notifications
    const uiStore = createUiStore();
    const uiSub = vi.fn();
    const unsubUi = uiStore.subscribe(uiSub);

    uiStore.setTool({ kind: 'explore' });
    expect(uiSub).toHaveBeenCalledTimes(1);
    expect(uiStore.getState().tool).toEqual({ kind: 'explore' });

    uiStore.setHover({ x: 23, y: 24 });
    expect(uiSub).toHaveBeenCalledTimes(2);
    expect(uiStore.getState().hover).toEqual({ x: 23, y: 24 });

    unsubUi();
  });
});
