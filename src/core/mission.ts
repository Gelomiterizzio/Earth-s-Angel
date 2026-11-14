// AI-assisted: Antigravity (Gemini), reviewed by A

import type {
  Building,
  CampaignState,
  DifficultyId,
  GameData,
  GameState,
  LevelId,
  MissionState,
  Terrain,
  Tile,
} from './types';
import { computeCrewAp, createInitialCrew } from './crew';
import { getDefaultEnergyPriority } from './energy';
import { buildSchedule, getDecisionEventForDay } from './events';
import { evaluateObjectives } from './objectives';
import { isCanonicalSeed } from './rng';

const CHAR_TO_TERRAIN: Record<string, Terrain> = {
  '.': 'llano',
  '#': 'roca',
  o: 'crater',
  i: 'hielo',
  m: 'mineral',
  '?': 'misterio',
  S: 'nave',
};

export function parseMapTiles(
  rows: string[],
  width: number,
  height: number,
  ship: { x: number; y: number },
  initialExploredRadius: number,
): Tile[] {
  const tiles: Tile[] = [];
  for (let y = 0; y < height; y++) {
    const row = rows[y] ?? '';
    for (let x = 0; x < width; x++) {
      const ch = row[x] ?? '.';
      const terrain = CHAR_TO_TERRAIN[ch] ?? 'llano';
      const explored =
        Math.abs(x - ship.x) <= initialExploredRadius &&
        Math.abs(y - ship.y) <= initialExploredRadius;
      tiles.push({
        x,
        y,
        terrain,
        explored,
        collected: false,
      });
    }
  }
  return tiles;
}

export function createMission(
  level: LevelId,
  difficulty: DifficultyId,
  seed: string,
  canonical: boolean,
  data: GameData,
): MissionState {
  const levelCfg = data.levels[level] ?? data.levels.luna;
  const diffBlock = data.difficulty[difficulty];
  const cfg = diffBlock.levels[level] ?? diffBlock.levels.luna;

  const tiles = parseMapTiles(
    levelCfg.rows,
    levelCfg.width,
    levelCfg.height,
    levelCfg.ship,
    levelCfg.initialExploredRadius,
  );

  const shipBuilding: Building = {
    id: 1,
    type: 'nave',
    x: levelCfg.ship.x,
    y: levelCfg.ship.y,
    placedDay: 1,
    operationalFromDay: 1,
    enabled: true,
    growth: 0,
    stress: 0,
    damaged: false,
  };

  const crew = createInitialCrew(cfg.crewSize);
  const schedule = buildSchedule(difficulty, level, seed, canonical, data);
  const energyPriority = getDefaultEnergyPriority(levelCfg.availableBuildings, data);
  const decisionEvt = getDecisionEventForDay(schedule, 1);

  const mission: MissionState = {
    level,
    day: 1,
    phase: decisionEvt ? 'decision' : 'planning',
    ap: computeCrewAp(crew, data),
    apSpentToday: 0,
    shelterToday: false,
    decisionPending: decisionEvt ? decisionEvt.id : null,
    resources: { ...cfg.initial },
    caps: { ...levelCfg.baseCaps },
    map: {
      width: levelCfg.width,
      height: levelCfg.height,
      tiles,
    },
    buildings: [shipBuilding],
    nextBuildingId: 2,
    crew,
    schedule,
    energyPriority,
    wastewater: 0,
    harvests: 0,
    streak: 0,
    objectives: [],
    discoveries: [],
    lastReport: null,
    result: null,
  };

  const tempState: GameState = {
    campaign: {
      version: 1,
      seed,
      canonical,
      difficulty,
      level,
      earthDaysRemaining: diffBlock.earthDays,
      appliedTransitions: [],
      clues: [],
      narrativeFlags: {},
      manifest: null,
      history: [],
    },
    mission,
  };

  mission.objectives = evaluateObjectives(tempState, data, {
    lsOk: false,
    greenhouseRan: false,
    stable: false,
  });

  return mission;
}

export function createCampaign(
  difficulty: DifficultyId,
  seed: string,
  data: GameData,
  opts?: { canonical?: boolean; level?: LevelId },
): GameState {
  const canonical = opts?.canonical ?? isCanonicalSeed(seed);
  const level = opts?.level ?? 'luna';
  const diffBlock = data.difficulty[difficulty];

  const mission = createMission(level, difficulty, seed, canonical, data);
  const campaign: CampaignState = {
    version: 1,
    seed,
    canonical,
    difficulty,
    level,
    earthDaysRemaining: diffBlock.earthDays,
    appliedTransitions: [],
    clues: [],
    narrativeFlags: {},
    manifest: null,
    history: [],
  };

  return { campaign, mission };
}
