// AI-assisted: Antigravity (Gemini), reviewed by A

import { applyAction } from '../core/actions';
import type { Action, ActionResult, GameData, GameEvent, GameState } from '../core/types';
import { fixtureGameData } from '../core/fixtures';

export interface Store {
  getState(): GameState | null;
  dispatch(action: Action): ActionResult;
  subscribe(listener: (state: GameState, events: GameEvent[]) => void): () => void;
  on<T extends GameEvent['type']>(
    type: T,
    handler: (e: Extract<GameEvent, { type: T }>) => void,
  ): () => void;
  load(state: GameState): void;
  replaceState(state: GameState, events?: GameEvent[]): void;
}

function isGameData(obj: unknown): obj is GameData {
  return (
    Boolean(obj) &&
    typeof obj === 'object' &&
    'buildings' in (obj as Record<string, unknown>) &&
    'constants' in (obj as Record<string, unknown>)
  );
}

export function createStore(
  first?: GameData | GameState | null,
  second?: GameData | GameState | null,
): Store {
  let data: GameData;
  let state: GameState | null = null;

  if (isGameData(first)) {
    data = first;
    state = (second as GameState | null) ?? null;
  } else if (isGameData(second)) {
    data = second;
    state = (first as GameState | null) ?? null;
  } else {
    data = fixtureGameData();
    state = (first as GameState | null) ?? null;
  }

  const stateListeners = new Set<(s: GameState, events: GameEvent[]) => void>();
  const eventHandlers = new Map<
    GameEvent['type'],
    Set<(e: GameEvent) => void>
  >();

  function emitEvent(event: GameEvent): void {
    const handlers = eventHandlers.get(event.type);
    if (!handlers) return;
    for (const h of [...handlers]) {
      h(event);
    }
  }

  function notifySubscribers(s: GameState, events: GameEvent[]): void {
    for (const fn of [...stateListeners]) {
      fn(s, events);
    }
  }

  function load(next: GameState, events: GameEvent[] = []): void {
    state = next;
    notifySubscribers(next, events);
    for (const ev of events) {
      emitEvent(ev);
    }
  }

  return {
    getState(): GameState | null {
      return state;
    },

    dispatch(action: Action): ActionResult {
      if (!state) {
        const error = {
          code: 'WRONG_PHASE' as const,
          messageKey: 'sim.error.WRONG_PHASE',
        };
        emitEvent({ type: 'action/rejected', error });
        throw new Error('Cannot dispatch action before loading a GameState into store');
      }

      const result = applyAction(state, action, data);
      if (!result.ok) {
        const rejEvent: GameEvent = {
          type: 'action/rejected',
          error: result.error,
        };
        emitEvent(rejEvent);
        return result;
      }

      state = result.state;
      notifySubscribers(state, result.events);
      for (const ev of result.events) {
        emitEvent(ev);
      }
      return result;
    },

    subscribe(listener: (s: GameState, events: GameEvent[]) => void): () => void {
      stateListeners.add(listener);
      return () => {
        stateListeners.delete(listener);
      };
    },

    on<T extends GameEvent['type']>(
      type: T,
      handler: (e: Extract<GameEvent, { type: T }>) => void,
    ): () => void {
      let set = eventHandlers.get(type);
      if (!set) {
        set = new Set();
        eventHandlers.set(type, set);
      }
      const wrapped = handler as (e: GameEvent) => void;
      set.add(wrapped);
      return () => {
        set?.delete(wrapped);
      };
    },

    load(next: GameState): void {
      load(next, []);
    },

    replaceState(next: GameState, events: GameEvent[] = []): void {
      load(next, events);
    },
  };
}
