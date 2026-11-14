// AI-assisted: Antigravity (Gemini), reviewed by A

import type {
  Action,
  ActionError,
  ActionResult,
  Building,
  ErrorCode,
  GameData,
  GameState,
  SimEvent,
} from './types';
import { advanceDay, startDay } from './day-cycle';
import { getDefaultEnergyPriority, isDefaultEnergyOrderValid } from './energy';
import { getRadiationForDay } from './events';
import { applyEarth, previewEarth } from './earth';
import { portalRequirements, restartMars } from './progression';
import { createMission } from './mission';
import { previewEnergy } from './objectives';
import { getOperationalShelterSeats } from './radiation';

function makeError(
  code: ErrorCode,
  params?: Record<string, string | number>,
): ActionError {
  return {
    code,
    messageKey: `sim.error.${code}`,
    ...(params ? { params } : {}),
  };
}

function reject(
  state: GameState,
  code: ErrorCode,
  params?: Record<string, string | number>,
): ActionResult {
  return {
    ok: false,
    state,
    error: makeError(code, params),
  };
}

function isAdjacentToExplored(
  state: GameState,
  x: number,
  y: number,
): boolean {
  const { width, height, tiles } = state.mission.map;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const neighbor = tiles[ny * width + nx];
      if (neighbor?.explored) return true;
    }
  }
  return false;
}

function logisticsCost(state: GameState, data: GameData, x: number, y: number): number {
  const { mission, campaign } = state;
  const rules = data.difficulty[campaign.difficulty].levels[mission.level]?.logistics;
  if (!rules) return 0;
  const origins = mission.buildings.filter((b) => b.type === 'nave'
    || (b.type === 'habitat' && b.operationalFromDay <= mission.day && b.enabled && !b.damaged));
  const distance = Math.min(...origins.map((b) => Math.max(Math.abs(x - b.x), Math.abs(y - b.y))));
  if (rules.far !== null && distance > rules.far) return 2;
  return distance > rules.near ? 1 : 0;
}

// Legacy lunar callers send only the four original consumers.
function withLunarLabPriority(order: GameState['mission']['energyPriority'], state: GameState, data: GameData) {
  const { mission } = state;
  if (mission.level === 'luna' && data.levels.luna.availableBuildings.includes('laboratorio')
    && !order.includes('laboratorio')) return [...order, 'laboratorio' as const];
  return [...order];
}

export function previewAction(
  state: GameState,
  action: Action,
  data: GameData,
): ActionError | null {
  const { mission, campaign } = state;
  const levelCfg = data.levels[mission.level] ?? data.levels.luna;
  const diffBlock = data.difficulty[campaign.difficulty];
  const cfg = diffBlock.levels[mission.level] ?? diffBlock.levels.luna;

  if (action.type === 'EARTH_INVEST' || action.type === 'EARTH_END_SEASON') {
    return previewEarth(state, action, data);
  }
  if (state.earth) return makeError('WRONG_PHASE');
  if ('x' in action && (!Number.isInteger(action.x) || !Number.isInteger(action.y))) {
    return makeError('TILE_OUT_OF_BOUNDS');
  }

  switch (action.type) {
    case 'BUILD': {
      if (mission.phase !== 'planning') return makeError('WRONG_PHASE');
      const def = data.buildings[action.building];
      if (!def || action.building === 'nave') {
        return makeError('UNKNOWN_BUILDING');
      }
      if (
        !def.levels.includes(mission.level) ||
        !levelCfg.availableBuildings.includes(action.building)
      ) {
        return makeError('NOT_AVAILABLE_IN_LEVEL');
      }
      if (
        action.x < 0 ||
        action.y < 0 ||
        action.x >= mission.map.width ||
        action.y >= mission.map.height
      ) {
        return makeError('TILE_OUT_OF_BOUNDS');
      }
      const tile = mission.map.tiles[action.y * mission.map.width + action.x];
      if (!tile?.explored) {
        return makeError('TILE_UNEXPLORED');
      }
      if (
        tile.terrain === 'roca' ||
        tile.terrain === 'crater' ||
        tile.terrain === 'nave' ||
        tile.terrain === 'misterio'
      ) {
        return makeError('TILE_BLOCKED');
      }
      if (
        mission.buildings.some((b) => b.x === action.x && b.y === action.y)
      ) {
        return makeError('TILE_OCCUPIED');
      }
      if (tile.terrain !== def.requiresTerrain) {
        return makeError('WRONG_TERRAIN');
      }
      if (mission.resources.materiales < def.cost) {
        return makeError('NO_MATERIALS', {
          need: def.cost,
          have: mission.resources.materiales,
        });
      }
      const actionCost = def.apCost + logisticsCost(state, data, action.x, action.y);
      if (mission.ap < actionCost) {
        return makeError('NO_AP', {
          need: actionCost,
          have: mission.ap,
        });
      }
      return null;
    }

    case 'EXPLORE': {
      if (mission.phase !== 'planning') return makeError('WRONG_PHASE');
      if (
        action.x < 0 ||
        action.y < 0 ||
        action.x >= mission.map.width ||
        action.y >= mission.map.height
      ) {
        return makeError('TILE_OUT_OF_BOUNDS');
      }
      const tile = mission.map.tiles[action.y * mission.map.width + action.x];
      if (tile?.explored) {
        return makeError('ALREADY_EXPLORED');
      }
      if (!isAdjacentToExplored(state, action.x, action.y)) {
        return makeError('NOT_ADJACENT');
      }
      const actionCost = 1 + logisticsCost(state, data, action.x, action.y);
      if (mission.ap < actionCost) {
        return makeError('NO_AP', { need: actionCost, have: mission.ap });
      }
      return null;
    }

    case 'COLLECT': {
      if (mission.phase !== 'planning') return makeError('WRONG_PHASE');
      if (
        action.x < 0 ||
        action.y < 0 ||
        action.x >= mission.map.width ||
        action.y >= mission.map.height
      ) {
        return makeError('TILE_OUT_OF_BOUNDS');
      }
      const tile = mission.map.tiles[action.y * mission.map.width + action.x];
      if (!tile?.explored) {
        return makeError('TILE_UNEXPLORED');
      }
      if (tile.terrain !== 'mineral' || tile.collected) {
        return makeError('NOTHING_TO_COLLECT');
      }
      const actionCost = 1 + logisticsCost(state, data, action.x, action.y);
      if (mission.ap < actionCost) {
        return makeError('NO_AP', { need: actionCost, have: mission.ap });
      }
      return null;
    }

    case 'TOGGLE_BUILDING': {
      if (mission.phase !== 'planning') return makeError('WRONG_PHASE');
      const target = mission.buildings.find((b) => b.id === action.buildingId);
      if (!target || target.type === 'nave') {
        return makeError('UNKNOWN_BUILDING');
      }
      return null;
    }

    case 'SET_ENERGY_PRIORITY': {
      if (mission.phase !== 'planning') return makeError('WRONG_PHASE');
      const expected = getDefaultEnergyPriority(
        levelCfg.availableBuildings,
        data,
      );
      const order = withLunarLabPriority(action.order, state, data);
      if (!isDefaultEnergyOrderValid(order, expected)) {
        return makeError('INVALID_PRIORITY');
      }
      return null;
    }

    case 'DECIDE_SHELTER': {
      if (mission.phase !== 'decision') return makeError('WRONG_PHASE');
      if (action.day !== mission.day) return makeError('STALE_DAY');
      const rad = getRadiationForDay(mission.schedule, mission.day);
      if (rad === 0) return makeError('NO_RADIATION_TODAY');
      if (action.shelter) {
        const seats = getOperationalShelterSeats(
          mission.buildings,
          mission.day,
          data,
        );
        if (seats <= 0) return makeError('NO_SHELTER');
        const preview = previewEnergy(state, data);
        if (mission.resources.energia + preview.generated < cfg.shelterEnergy) {
          return makeError('NO_ENERGY_FOR_SHELTER', {
            need: cfg.shelterEnergy,
            have: mission.resources.energia + preview.generated,
          });
        }
      }
      return null;
    }

    case 'END_DAY': {
      if (mission.phase === 'decision') return makeError('DECISION_PENDING');
      if (mission.phase !== 'planning') return makeError('WRONG_PHASE');
      if (action.day !== mission.day) return makeError('STALE_DAY');
      return null;
    }

    case 'ACK_REPORT': {
      if (mission.phase !== 'report') return makeError('WRONG_PHASE');
      const reportDay = mission.lastReport?.day ?? mission.day - 1;
      if (action.day !== reportDay && action.day !== mission.day) {
        return makeError('STALE_DAY');
      }
      return null;
    }

    case 'RESTART_MISSION': {
      return null;
    }

    case 'REPAIR': {
      if (mission.phase !== 'planning') return makeError('WRONG_PHASE');
      const target = mission.buildings.find((b) => b.id === action.buildingId);
      if (!target || !target.damaged) return makeError('UNKNOWN_BUILDING');
      const need = data.constants.repairCost ?? 0;
      if (mission.resources.materiales < need) {
        return makeError('NO_MATERIALS', { need, have: mission.resources.materiales });
      }
      if (mission.ap < 1) return makeError('NO_AP', { need: 1, have: mission.ap });
      return null;
    }

    case 'CLEAN_PANELS': {
      if (mission.phase !== 'planning') return makeError('WRONG_PHASE');
      if (!mission.dust || !mission.buildings.some((b) => b.type === 'panel')) return makeError('NOTHING_TO_CLEAN');
      if (mission.ap < 1) return makeError('NO_AP', { need: 1, have: mission.ap });
      return null;
    }
    case 'ACTIVATE_BEACONS': {
      const missing = portalRequirements(state, data);
      return missing.length === 0 ? null : {
        code: 'PORTAL_LOCKED',
        messageKey: 'sim.portal.' + missing[0],
      };
    }
    case 'SCAN': {
      if (!levelCfg.secret || mission.phase !== 'planning') return makeError('WRONG_PHASE');
      const { x, y } = action;
      if (x < 0 || y < 0 || x >= mission.map.width || y >= mission.map.height) {
        return makeError('TILE_OUT_OF_BOUNDS');
      }
      if (!mission.map.tiles[y * mission.map.width + x].explored) return makeError('TILE_UNEXPLORED');
      const flag = mission.level === 'luna' ? 'beaconMoon' : 'beaconMars';
      if (campaign.narrativeFlags[flag]) return makeError('ALREADY_FOUND');
      if (mission.ap < 1) return makeError('NO_AP', { need: 1, have: mission.ap });
      return null;
    }
  }
}

export function applyAction(
  state: GameState,
  action: Action,
  data: GameData,
): ActionResult {
  const err = previewAction(state, action, data);
  if (err) {
    return { ok: false, state, error: err };
  }

  const { mission, campaign } = state;
  const levelCfg = data.levels[mission.level] ?? data.levels.luna;
  const diffBlock = data.difficulty[campaign.difficulty];
  const cfg = diffBlock.levels[mission.level] ?? diffBlock.levels.luna;

  switch (action.type) {
    case 'EARTH_INVEST':
    case 'EARTH_END_SEASON':
      return applyEarth(state, action, data);

    case 'BUILD': {
      const def = data.buildings[action.building];
      const actionCost = def.apCost + logisticsCost(state, data, action.x, action.y);
      const newBuilding: Building = {
        id: mission.nextBuildingId,
        type: action.building,
        x: action.x,
        y: action.y,
        placedDay: mission.day,
        operationalFromDay: mission.day + def.buildDays,
        enabled: true,
        growth: 0,
        stress: 0,
        damaged: false,
      };
      const nextState: GameState = {
        campaign: { ...campaign },
        mission: {
          ...mission,
          ap: mission.ap - actionCost,
          apSpentToday: mission.apSpentToday + actionCost,
          resources: {
            ...mission.resources,
            materiales: mission.resources.materiales - def.cost,
          },
          buildings: [...mission.buildings, newBuilding],
          nextBuildingId: mission.nextBuildingId + 1,
        },
      };
      const events: SimEvent[] = [
        {
          type: 'building/placed',
          buildingId: newBuilding.id,
          building: newBuilding.type,
          x: newBuilding.x,
          y: newBuilding.y,
        },
      ];
      return { ok: true, state: nextState, events };
    }

    case 'EXPLORE': {
      const actionCost = 1 + logisticsCost(state, data, action.x, action.y);
      const radius = data.constants.exploreRevealRadius;
      const nextTiles = mission.map.tiles.map((t) => ({ ...t }));
      const revealed: { x: number; y: number; terrain: typeof nextTiles[number]['terrain'] }[] = [];
      const nextDiscoveries = [...mission.discoveries];
      const nextClues = [...campaign.clues];
      const events: SimEvent[] = [];

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const rx = action.x + dx;
          const ry = action.y + dy;
          if (
            rx < 0 ||
            ry < 0 ||
            rx >= mission.map.width ||
            ry >= mission.map.height
          ) {
            continue;
          }
          const idx = ry * mission.map.width + rx;
          const tile = nextTiles[idx];
          const wasExplored = tile.explored;
          tile.explored = true;
          revealed.push({ x: rx, y: ry, terrain: tile.terrain });

          if (!wasExplored && tile.terrain === 'misterio') {
            const discId = `misterio-${rx}-${ry}`;
            if (!nextDiscoveries.includes(discId)) {
              nextDiscoveries.push(discId);
            }
            if (!nextClues.includes(discId)) {
              nextClues.push(discId);
            }
            const columnClue = mission.level + '.column';
            if (levelCfg.secret && !nextClues.includes(columnClue)) nextClues.push(columnClue);
            events.push({ type: 'discovery/found', discoveryId: discId });
          }
        }
      }

      events.unshift({
        type: 'tile/explored',
        x: action.x,
        y: action.y,
        revealed,
      });

      const nextState: GameState = {
        campaign: {
          ...campaign,
          clues: nextClues,
        },
        mission: {
          ...mission,
          ap: mission.ap - actionCost,
          apSpentToday: mission.apSpentToday + actionCost,
          map: {
            ...mission.map,
            tiles: nextTiles,
          },
          discoveries: nextDiscoveries,
        },
      };
      return { ok: true, state: nextState, events };
    }

    case 'COLLECT': {
      const actionCost = 1 + logisticsCost(state, data, action.x, action.y);
      const nextTiles = mission.map.tiles.map((t) => ({ ...t }));
      const idx = action.y * mission.map.width + action.x;
      nextTiles[idx].collected = true;

      const added = Math.min(
        cfg.mineralYield,
        Math.max(0, mission.caps.materiales - mission.resources.materiales),
      );
      const nextMaterials = Math.min(
        mission.caps.materiales,
        mission.resources.materiales + cfg.mineralYield,
      );

      const nextState: GameState = {
        campaign: { ...campaign },
        mission: {
          ...mission,
          ap: mission.ap - actionCost,
          apSpentToday: mission.apSpentToday + actionCost,
          resources: {
            ...mission.resources,
            materiales: nextMaterials,
          },
          map: {
            ...mission.map,
            tiles: nextTiles,
          },
        },
      };

      const events: SimEvent[] = [
        {
          type: 'resource/collected',
          resource: 'materiales',
          amount: added,
        },
      ];
      return { ok: true, state: nextState, events };
    }

    case 'TOGGLE_BUILDING': {
      const nextBuildings = mission.buildings.map((b) =>
        b.id === action.buildingId ? { ...b, enabled: action.enabled } : { ...b },
      );
      const nextState: GameState = {
        campaign: { ...campaign },
        mission: {
          ...mission,
          buildings: nextBuildings,
        },
      };
      return { ok: true, state: nextState, events: [] };
    }

    case 'SET_ENERGY_PRIORITY': {
      const nextState: GameState = {
        campaign: { ...campaign },
        mission: {
          ...mission,
          energyPriority: withLunarLabPriority(action.order, state, data),
        },
      };
      return { ok: true, state: nextState, events: [] };
    }

    case 'DECIDE_SHELTER': {
      const eventId = mission.decisionPending ?? `tormenta-solar-${mission.day}`;
      const nextState: GameState = {
        campaign: { ...campaign },
        mission: {
          ...mission,
          phase: 'planning',
          shelterToday: action.shelter,
          ap: action.shelter ? 0 : mission.ap,
          decisionPending: null,
        },
      };
      const events: SimEvent[] = [
        {
          type: 'decision/made',
          eventId,
          shelter: action.shelter,
        },
      ];
      return { ok: true, state: nextState, events };
    }

    case 'END_DAY': {
      const res = advanceDay(state, data);
      return { ok: true, state: res.state, events: res.events };
    }

    case 'ACK_REPORT': {
      const res = startDay(state, data);
      return { ok: true, state: res.state, events: res.events };
    }

    case 'RESTART_MISSION': {
      const mars = mission.level === 'marte' ? restartMars(state, data) : null;
      if (mars) return { ok: true, ...mars };
      const freshMission = createMission(
        campaign.level,
        campaign.difficulty,
        campaign.seed,
        campaign.canonical,
        data,
      );
      const initialEarthDays =
        campaign.level === 'luna'
          ? diffBlock.earthDays
          : campaign.earthDaysRemaining + (mission.day - 1);

      const baseState: GameState = {
        campaign: {
          ...campaign,
          earthDaysRemaining: initialEarthDays,
        },
        mission: freshMission,
      };
      const opened = startDay(baseState, data);
      return { ok: true, state: opened.state, events: opened.events };
    }

    case 'REPAIR': {
      const nextBuildings = mission.buildings.map((b) =>
        b.id === action.buildingId ? { ...b, damaged: false } : { ...b },
      );
      return {
        ok: true,
        state: {
          campaign: { ...campaign },
          mission: {
            ...mission,
            ap: mission.ap - 1,
            apSpentToday: mission.apSpentToday + 1,
            buildings: nextBuildings,
            resources: { ...mission.resources, materiales: mission.resources.materiales - (data.constants.repairCost ?? 0) },
          },
        },
        events: [],
      };
    }

    case 'CLEAN_PANELS':
      return {
        ok: true,
        state: {
          ...state,
          mission: { ...mission, dust: 0, ap: mission.ap - 1, apSpentToday: mission.apSpentToday + 1 },
        },
        events: [],
      };

    case 'SCAN': {
      const beacon = levelCfg.secret?.beacon;
      const found = beacon?.x === action.x && beacon.y === action.y;
      const discoveryId = 'beacon-' + mission.level;
      const flag = mission.level === 'luna' ? 'beaconMoon' : 'beaconMars';
      return {
        ok: true,
        state: {
          campaign: found
            ? { ...campaign, narrativeFlags: { ...campaign.narrativeFlags, [flag]: true } }
            : campaign,
          mission: {
            ...mission,
            discoveries: found ? [...mission.discoveries, discoveryId] : mission.discoveries,
            ap: mission.ap - 1,
            apSpentToday: mission.apSpentToday + 1,
          },
        },
        events: found ? [{ type: 'discovery/found', discoveryId }] : [{ type: 'scan/empty' }],
      };
    }

    case 'ACTIVATE_BEACONS':
      if (campaign.narrativeFlags.beaconsActivated) return { ok: true, state, events: [] };
      return {
        ok: true,
        state: {
          ...state,
          campaign: { ...campaign, narrativeFlags: { ...campaign.narrativeFlags, beaconsActivated: true } },
        },
        events: [],
      };
  }
}
