// AI-assisted: Cursor (Composer) and OpenAI Codex. Team review pending.
import type { AppContext } from '../app/context';
import { previewAction } from '../core/index';
import type { Action, ActionError, ActionResult, BuildingType, GameState, Tool } from '../core/types';

export interface PreviewInfo {
  error: ActionError | null;
  readyDay?: number;
  revealCells?: { x: number; y: number }[];
}

export function actionForTool(
  tool: Tool,
  x: number,
  y: number,
): Action | null {
  if (tool.kind === 'build') return { type: 'BUILD', building: tool.building, x, y };
  if (tool.kind === 'explore') return { type: 'EXPLORE', x, y };
  if (tool.kind === 'collect') return { type: 'COLLECT', x, y };
  return null;
}

export function previewAt(
  ctx: AppContext,
  state: GameState,
  x: number,
  y: number,
): PreviewInfo {
  const tool = ctx.uiStore.get().tool;
  const action = actionForTool(tool, x, y);
  if (!action) return { error: null };

  const error = previewAction(state, action, ctx.data);
  if (error) return { error };

  if (action.type === 'BUILD') {
    const def = ctx.data.buildings[action.building as BuildingType];
    return { error: null, readyDay: state.mission.day + (def?.buildDays ?? 1) };
  }

  if (action.type === 'EXPLORE') {
    const radius = ctx.data.constants.exploreRevealRadius;
    const revealCells: { x: number; y: number }[] = [];
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const rx = x + dx;
        const ry = y + dy;
        if (rx >= 0 && ry >= 0 && rx < state.mission.map.width && ry < state.mission.map.height) {
          revealCells.push({ x: rx, y: ry });
        }
      }
    }
    return { error: null, revealCells };
  }

  return { error: null };
}

export function dispatchToolAction(ctx: AppContext, x: number, y: number): ActionResult | null {
  const tool = ctx.uiStore.get().tool;
  const action = actionForTool(tool, x, y);
  if (!action) return null;
  ctx.audio.unlock();
  const result = ctx.store.dispatch(action);
  if (result.ok && tool.kind === 'build') {
    const state = ctx.store.getState();
    if (
      state &&
      (state.mission.ap <= 0 ||
        state.mission.resources.materiales < (ctx.data.buildings[tool.building]?.cost ?? 0))
    ) {
      ctx.uiStore.setTool({ kind: 'inspect' });
    }
  }
  return result;
}
