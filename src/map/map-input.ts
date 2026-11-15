// AI-assisted: Cursor (Composer), OpenAI Codex, and Antigravity (Gemini). Team review pending.
import type { AppContext } from '../app/context';
import { previewAction } from '../core/index';
import type { Action, ActionError, ActionResult, BuildingType, GameData, GameState, Tool } from '../core/types';

export interface PreviewInfo {
  error: ActionError | null;
  readyDay?: number;
  revealCells?: { x: number; y: number }[];
}

export interface WalkActionOption {
  action: Action;
  label: string;
  costAp: number;
  costMaterials: number;
  readyDay?: number;
  yieldMaterials?: number;
  error: ActionError | null;
  blockedReason: string | null;
}

export function actionApCost(
  _state: GameState,
  data: GameData,
  action: Action,
): number {
  if (action.type === 'BUILD') return data.buildings[action.building]?.apCost ?? 1;
  if (
    action.type === 'EXPLORE' ||
    action.type === 'COLLECT' ||
    action.type === 'SCAN' ||
    action.type === 'REPAIR' ||
    action.type === 'CLEAN_PANELS'
  ) {
    return 1;
  }
  return 0;
}

export function actionMaterialsCost(
  data: GameData,
  action: Action,
): number {
  if (action.type === 'BUILD') return data.buildings[action.building]?.cost ?? 0;
  if (action.type === 'REPAIR') return data.constants.repairCost ?? 0;
  return 0;
}

export function describeActionOption(
  ctx: AppContext,
  state: GameState,
  action: Action,
): WalkActionOption {
  const error = previewAction(state, action, ctx.data);
  const blockedReason = error ? ctx.t(error.messageKey, error.params) : null;
  // Ask the existing validation rule for the total, including Mars logistics.
  const withoutAp = state.mission.level === 'marte' && !error
    ? previewAction({ ...state, mission: { ...state.mission, ap: 0 } }, action, ctx.data)
    : error;
  const requiredAp = withoutAp?.code === 'NO_AP' ? withoutAp.params?.need : undefined;
  const costAp = typeof requiredAp === 'number' ? requiredAp : actionApCost(state, ctx.data, action);
  const costMaterials = actionMaterialsCost(ctx.data, action);

  let label = ctx.t(action.type === 'CLEAN_PANELS' ? 'ui.hud.clean' : `content.map.walk.${action.type}`);
  let readyDay: number | undefined;
  let yieldMaterials: number | undefined;

  if (action.type === 'BUILD') {
    const def = ctx.data.buildings[action.building];
    const name = def ? ctx.t(def.nameKey) : action.building;
    label = ctx.t('content.map.walk.BUILD_NAME', { name });
    readyDay = state.mission.day + (def?.buildDays ?? 1);
  } else if (action.type === 'REPAIR') {
    const found = state.mission.buildings.find((b) => b.id === action.buildingId);
    if (found) {
      const def = ctx.data.buildings[found.type];
      const name = def ? ctx.t(def.nameKey) : found.type;
      label = ctx.t('content.map.walk.REPAIR_NAME', { name });
    }
  } else if (action.type === 'COLLECT') {
    const diffCfg = ctx.data.difficulty[state.campaign.difficulty]?.levels[state.mission.level];
    const freeSpace = Math.max(0, state.mission.caps.materiales - state.mission.resources.materiales);
    yieldMaterials = Math.min(freeSpace, diffCfg?.mineralYield ?? 0);
  }

  return {
    action,
    label,
    costAp,
    costMaterials,
    readyDay,
    yieldMaterials,
    error,
    blockedReason,
  };
}

export function actionForTool(
  tool: Tool,
  x: number,
  y: number,
): Action | null {
  if (tool.kind === 'build') return { type: 'BUILD', building: tool.building, x, y };
  if (tool.kind === 'explore') return { type: 'EXPLORE', x, y };
  if (tool.kind === 'collect') return { type: 'COLLECT', x, y };
  if (tool.kind === 'scan') return { type: 'SCAN', x, y };
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
