// AI-assisted: Cursor Grok 4.7, reviewed by C
import type { Screen } from '../app-bridge';
import { mountMissionHud } from '../hud/mission-hud';
import { mountEarth } from './earth';

let cleanup: (() => void) | null = null;

export const missionScreen: Screen = {
  mount(root, ctx) {
    const state = ctx.store.getState();
    const earth = state as { earth?: unknown } | null;
    cleanup = state?.mission.level === 'tierra' || earth?.earth
      ? mountEarth(root, ctx)
      : mountMissionHud(root, ctx);
  },
  unmount() {
    cleanup?.();
    cleanup = null;
  },
};
