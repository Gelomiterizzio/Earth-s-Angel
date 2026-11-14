// AI-assisted: Antigravity (Gemini), reviewed by A

import type {
  Building,
  BuildingDef,
  BuildingType,
  DayReport,
  DifficultyConfig,
  DifficultyId,
  GameData,
  GameState,
  LevelConfig,
  SimConstants,
  Terrain,
  Tile,
} from './types';
import buildingsJson from '../data/content/buildings.json';
import lunaLevelJson from '../data/content/levels/luna.json';
import constantsJson from '../data/balance/constants.json';
import difficultyJson from '../data/balance/difficulty.json';
import lunaBalanceJson from '../data/balance/luna.json';
import { advanceDay } from './day-cycle';
import { applyAction } from './actions';

const CHAR_TERRAIN: Record<string, Terrain> = {
  '.': 'llano',
  '#': 'roca',
  o: 'crater',
  i: 'hielo',
  m: 'mineral',
  '?': 'misterio',
  S: 'nave',
};

function buildTiles(exploredRadius: number): Tile[] {
  const rows = lunaLevelJson.rows as string[];
  const ship = lunaLevelJson.ship as { x: number; y: number };
  const tiles: Tile[] = [];
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 12; x++) {
      const ch = rows[y][x];
      const dx = Math.abs(x - ship.x);
      const dy = Math.abs(y - ship.y);
      tiles.push({
        x,
        y,
        terrain: CHAR_TERRAIN[ch] ?? 'llano',
        explored: dx <= exploredRadius && dy <= exploredRadius,
        collected: false,
      });
    }
  }
  return tiles;
}

export function fixtureGameData(): GameData {
  const buildings = buildingsJson as unknown as Record<BuildingType, BuildingDef>;
  const lunaLevel = lunaLevelJson as unknown as LevelConfig;
  const constants = constantsJson as unknown as SimConstants;
  const difficultyMeta = difficultyJson as Record<
    DifficultyId,
    { earthDays: number; bonusDays: number }
  >;
  const lunaByDiff = lunaBalanceJson as Record<DifficultyId, DifficultyConfig>;

  return {
    buildings,
    levels: { luna: lunaLevel },
    difficulty: {
      facil: {
        earthDays: difficultyMeta.facil.earthDays,
        bonusDays: difficultyMeta.facil.bonusDays,
        levels: { luna: lunaByDiff.facil },
      },
      media: {
        earthDays: difficultyMeta.media.earthDays,
        bonusDays: difficultyMeta.media.bonusDays,
        levels: { luna: lunaByDiff.media },
      },
      imposible: {
        earthDays: difficultyMeta.imposible.earthDays,
        bonusDays: difficultyMeta.imposible.bonusDays,
        levels: { luna: lunaByDiff.imposible },
      },
    },
    constants,
    nasa: {
      sep: [
        {
          nasa: {
            sepID: '2017-09-10T16:25:00-SEP-001',
            eventTime: '2017-09-10T16:25Z',
            instrument: 'GOES13: SEM/EPS >100 MeV',
            link: 'https://ccmc.gsfc.nasa.gov/donki/',
            flare: {
              flrID: '2017-09-10T15:35:00-FLR-001',
              classType: 'X8.2',
              beginTime: '2017-09-10T15:35Z',
              peakTime: '2017-09-10T16:06Z',
              sourceLocation: 'S08W88',
              activeRegionNum: 12673,
              link: 'https://ccmc.gsfc.nasa.gov/donki/',
            },
          },
          game: {
            radiationLevel: 2,
            rule: '>100 MeV -> radiationLevel 2',
            leadMinutes: 50,
          },
        },
        {
          nasa: {
            sepID: '2024-05-13T14:00:00-SEP-001',
            eventTime: '2024-05-13T14:00Z',
            instrument: 'GOES-P: SEISS >10 MeV',
            link: 'https://ccmc.gsfc.nasa.gov/donki/',
            flare: null,
          },
          game: {
            radiationLevel: 1,
            rule: '>10 MeV -> radiationLevel 1',
            leadMinutes: null,
          },
        },
      ],
    },
  };
}

function baseState(day: number, phase: 'planning' | 'decision'): GameState {
  return {
    campaign: {
      version: 1,
      seed: 'EA-DEMO',
      canonical: true,
      difficulty: 'media',
      level: 'luna',
      earthDaysRemaining: 54 - (day - 1),
      appliedTransitions: [],
      clues: [],
      narrativeFlags: {},
      manifest: null,
      history: [],
    },
    mission: {
      level: 'luna',
      day,
      phase,
      ap: 4,
      apSpentToday: 0,
      shelterToday: false,
      decisionPending: phase === 'decision' ? 'luna-sep-1' : null,
      resources: {
        energia: 10,
        oxigeno: 24,
        agua: 24,
        alimentos: 32,
        materiales: 40,
      },
      caps: {
        energia: 20,
        oxigeno: 40,
        agua: 40,
        alimentos: 40,
        materiales: 60,
      },
      map: { width: 12, height: 12, tiles: buildTiles(2) },
      buildings: [
        {
          id: 1,
          type: 'nave',
          x: 5,
          y: 5,
          placedDay: 1,
          operationalFromDay: 1,
          enabled: true,
          growth: 0,
          stress: 0,
          damaged: false,
        },
      ],
      nextBuildingId: 2,
      crew: [0, 1, 2, 3].map((id) => ({
        id,
        nameKey: `sim.crew.${id}`,
        health: 100,
        exposure: day === 1 ? 0 : day - 1,
      })),
      schedule: [
        {
          id: 'luna-shadow-1',
          type: 'sombra',
          startDay: 4,
          durationDays: 1,
          solarFactorPct: 25,
          sourceRef: 'SYNTHETIC',
        },
        {
          id: 'luna-sep-1',
          type: 'tormenta-solar',
          startDay: 8,
          durationDays: 1,
          radiationLevel: 2,
          sourceRef: '2017-09-10T16:25:00-SEP-001',
        },
      ],
      energyPriority: [
        'generador',
        'reciclador',
        'extractor',
        'invernadero',
      ],
      wastewater: 0,
      harvests: 0,
      streak: 0,
      objectives: [
        { id: 'soporte', met: false },
        { id: 'energia', met: true, current: 10, target: 10 },
        { id: 'alimentos', met: false, current: 0, target: 1 },
        { id: 'reservas', met: true, current: 24, target: 16 },
        { id: 'proteccion', met: false, current: 0, target: 4 },
        { id: 'racha', met: false, current: 0, target: 3 },
      ],
      discoveries: [],
      lastReport: null,
      result: null,
    },
  };
}

function makeBuilding(
  id: number,
  type: Building['type'],
  x: number,
  y: number,
  placedDay: number,
  buildDays: number,
): Building {
  return {
    id,
    type,
    x,
    y,
    placedDay,
    operationalFromDay: placedDay + buildDays,
    enabled: true,
    growth: 0,
    stress: 0,
    damaged: false,
  };
}

export function fixtureState(
  id: 'media-dia-1' | 'media-dia-8' | 'media-decision-8',
): GameState {
  if (id === 'media-dia-1') {
    return baseState(1, 'planning');
  }

  const s = baseState(8, 'decision');
  s.mission.resources = {
    energia: 24,
    oxigeno: 20,
    agua: 25,
    alimentos: 28,
    materiales: 14,
  };
  s.mission.caps.energia = 40;
  s.mission.wastewater = 4;
  s.mission.streak = 1;
  s.mission.harvests = 1;
  s.mission.crew.forEach((c) => {
    c.exposure = 7;
  });

  for (const t of s.mission.map.tiles) {
    if (t.x >= 1 && t.x <= 9 && t.y >= 1 && t.y <= 9) t.explored = true;
    if (t.x === 3 && t.y === 7) t.collected = true;
    if (t.x === 1 && t.y === 8) t.collected = true;
    if (t.x === 3 && t.y === 1) t.collected = true;
  }

  s.mission.buildings = [
    makeBuilding(1, 'nave', 5, 5, 1, 0),
    makeBuilding(2, 'panel', 4, 4, 1, 1),
    makeBuilding(3, 'panel', 5, 4, 1, 1),
    makeBuilding(4, 'extractor', 9, 8, 2, 1),
    makeBuilding(5, 'reciclador', 6, 4, 2, 1),
    makeBuilding(6, 'generador', 4, 5, 3, 1),
    makeBuilding(7, 'invernadero', 6, 6, 3, 1),
    makeBuilding(8, 'bateria', 4, 6, 4, 1),
    makeBuilding(9, 'refugio', 6, 5, 5, 2),
    makeBuilding(10, 'panel', 3, 4, 6, 1),
  ];
  s.mission.nextBuildingId = 11;
  s.mission.objectives = [
    { id: 'soporte', met: true },
    { id: 'energia', met: true, current: 24, target: 10 },
    { id: 'alimentos', met: true, current: 1, target: 1 },
    { id: 'reservas', met: true, current: 20, target: 16 },
    { id: 'proteccion', met: false, current: 4, target: 4 },
    { id: 'racha', met: false, current: 1, target: 3 },
  ];
  return s;
}

export function fixtureReport(): DayReport {
  const data = fixtureGameData();
  const s = fixtureState('media-dia-8');
  const decided = applyAction(s, { type: 'DECIDE_SHELTER', shelter: true, day: 8 }, data);
  const next = decided.ok ? decided.state : s;
  return advanceDay(next, data).report;
}
