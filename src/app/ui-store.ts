// AI-assisted: Antigravity (Gemini), reviewed by A

import type { Tool, UiState } from '../core/types';

export type { Tool, UiState };

export interface UiStore {
  getState(): UiState;
  get(): UiState;
  setTool(tool: Tool): void;
  setHover(tile: { x: number; y: number } | null): void;
  openPanel(panelId: string | null): void;
  setOpenPanel(panelId: string | null): void;
  subscribe(fn: (ui: UiState) => void): () => void;
}

export function createUiStore(initial?: Partial<UiState>): UiStore {
  let state: UiState = {
    tool: initial?.tool ?? { kind: 'inspect' },
    hover: initial?.hover ?? null,
    openPanel: initial?.openPanel ?? null,
  };
  const listeners = new Set<(ui: UiState) => void>();

  function notify(): void {
    for (const fn of [...listeners]) {
      fn(state);
    }
  }

  function setOpenPanel(panelId: string | null): void {
    if (state.openPanel === panelId) return;
    state = { ...state, openPanel: panelId };
    notify();
  }

  return {
    getState(): UiState {
      return state;
    },
    get(): UiState {
      return state;
    },
    setTool(tool: Tool): void {
      state = { ...state, tool };
      notify();
    },
    setHover(tile: { x: number; y: number } | null): void {
      if (
        (state.hover === null && tile === null) ||
        (state.hover !== null && tile !== null && state.hover.x === tile.x && state.hover.y === tile.y)
      ) {
        return;
      }
      state = { ...state, hover: tile };
      notify();
    },
    openPanel: setOpenPanel,
    setOpenPanel,
    subscribe(fn: (ui: UiState) => void): () => void {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}
