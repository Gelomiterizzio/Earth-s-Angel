// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import type { Screen } from '../app-bridge';
import type { CampaignState } from '../core-bridge';
import { mountMissionHud } from '../hud/mission-hud';
import { mountEarth } from './earth';

let cleanup: (() => void) | null = null;

export const missionScreen: Screen = {
  mount(root, ctx) {
    const state: CampaignState | null = ctx.store.getState();
    cleanup = state?.mission.level === 'tierra' || state?.earth
      ? mountEarth(root, ctx)
      : mountMissionHud(root, ctx);
  },
  unmount() {
    cleanup?.();
    cleanup = null;
  },
};
