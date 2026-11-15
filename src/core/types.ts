// P1/P2 assisted by OpenAI Codex. Human review pending.
// AI-assisted: Antigravity (Gemini), reviewed by A

import type { MissionDesign, MissionDesignData } from './design';

export type DifficultyId = 'facil' | 'media' | 'imposible';
export type LevelId = 'luna' | 'marte' | 'tierra';
export type ResourceId = 'energia' | 'oxigeno' | 'agua' | 'alimentos' | 'materiales';
export type Resources = Record<ResourceId, number>;

export type BuildingType =
  | 'nave'
  | 'panel'
  | 'bateria'
  | 'generador'
  | 'reciclador'
  | 'extractor'
  | 'invernadero'
  | 'refugio'
  | 'deposito'
  | 'comunicaciones'
  | 'laboratorio'
  | 'habitat';

export type Terrain = 'llano' | 'roca' | 'crater' | 'hielo' | 'mineral' | 'misterio' | 'nave';
export type RadiationLevel = 0 | 1 | 2;
export type EventType = 'sombra' | 'tormenta-solar' | 'tormenta-polvo' | 'averia';
export type ObjectiveId =
  | 'soporte'
  | 'energia'
  | 'alimentos'
  | 'reservas'
  | 'proteccion'
  | 'racha'
  | 'comunicaciones'
  | 'autonomia';
export type MissionPhase = 'decision' | 'planning' | 'report' | 'ended';
export type DefeatCause = 'plazo' | 'soporte-vital' | 'exposicion' | 'escasez' | 'objetivos';

export interface Tile {
  x: number;
  y: number;
  terrain: Terrain;
  explored: boolean;
  collected: boolean;
}

export interface Building {
  id: number;
  type: BuildingType;
  x: number;
  y: number;
  placedDay: number;
  operationalFromDay: number;
  enabled: boolean;
  growth: number;
  stress: number;
  damaged: boolean;
}

export interface CrewMember {
  id: number;
  nameKey: string;
  health: number;
  exposure: number;
}

export interface ScheduledEvent {
  id: string;
  type: EventType;
  startDay: number;
  durationDays: number;
  solarFactorPct?: number;
  radiationLevel?: RadiationLevel;
  sourceRef?: string;
  target?: BuildingType;
}

export interface ObjectiveStatus {
  id: ObjectiveId;
  met: boolean;
  current?: number;
  target?: number;
}

export interface DayReport {
  day: number;
  level: LevelId;
  activeEvents: { id: string; type: EventType; sourceRef?: string }[];
  solarFactorPct: number;
  radiationLevel: RadiationLevel;
  energy: {
    start: number;
    generated: number;
    used: number;
    end: number;
    cap: number;
    wasted: number;
    unpowered: number[];
  };
  produced: { agua: number; oxigeno: number; alimentos: number };
  moduleInputs: { agua: number };
  crewConsumed: { oxigeno: number; agua: number; alimentos: number };
  shortages: { oxigeno: number; agua: number; alimentos: number };
  wasted: Partial<Resources>;
  crew: {
    id: number;
    health: number;
    healthDelta: number;
    exposure: number;
    exposureDelta: number;
    sheltered: boolean;
  }[];
  shelter: { requested: boolean; active: boolean };
  stable: boolean;
  streak: number;
  objectives: ObjectiveStatus[];
  causeEffectKeys: string[];
  result: MissionResult | null;
}

export interface MissionResult {
  outcome: 'victory' | 'defeat';
  cause?: DefeatCause;
  level: LevelId;
  difficulty: DifficultyId;
  seed: string;
  daysUsed: number;
  earthDaysRemaining: number;
  resources: Resources;
  margins: { oxigeno: number; agua: number; alimentos: number; energia: number };
  maxExposure: number;
  incidents: string[];
  principleKey: string;
  suggestionKey: string;
  earth?: { indicators: EarthIndicators; targets: EarthIndicators; seasonsUsed: number };
}

export type EarthLine = 'energia' | 'agua' | 'reciclaje' | 'restauracion';
export type EarthIndicator = 'agua' | 'emisiones' | 'ecosistemas';
export type EarthIndicators = Record<EarthIndicator, number>;
export interface EarthSeasonReport {
  season: number;
  gains: EarthIndicators;
  drift: EarthIndicators;
  causeEffectKeys: string[];
}
export interface EarthState {
  season: number;
  seasons: number;
  budget: number;
  levels: Record<EarthLine, number>;
  indicators: EarthIndicators;
  lastReport: EarthSeasonReport | null;
  result: MissionResult | null;
}
export interface EarthData {
  maxLevel: number;
  lines: Record<EarthLine, { cost: number; effects: Partial<EarthIndicators> }>;
  start: EarthIndicators;
  drift: EarthIndicators;
  combos: {
    recyclingBoostsWaterAt: number;
    cleanPowerDiscountAt: number;
    restorationDiscountCost: number;
    lowWaterThreshold: number;
  };
  difficulty: Record<DifficultyId, { seasons: number; budget: number; carryMax: number; targets: EarthIndicators }>;
}
export type EarthAction =
  | { type: 'EARTH_INVEST'; action: EarthLine }
  | { type: 'EARTH_END_SEASON'; season: number };

export interface MissionState {
  level: LevelId;
  day: number;
  phase: MissionPhase;
  ap: number;
  apSpentToday: number;
  shelterToday: boolean;
  decisionPending: string | null;
  resources: Resources;
  caps: Resources;
  map: { width: number; height: number; tiles: Tile[] };
  buildings: Building[];
  nextBuildingId: number;
  crew: CrewMember[];
  schedule: ScheduledEvent[];
  energyPriority: BuildingType[];
  wastewater: number;
  harvests: number;
  streak: number;
  objectives: ObjectiveStatus[];
  discoveries: string[];
  dust?: number;
  labDays?: number;
  linkStreak?: number;
  linkEstablished?: boolean;
  linkOutageDays?: number;
  lastReport: DayReport | null;
  result: MissionResult | null;
}

export interface TransferManifest {
  crew: CrewMember[];
  supplies: Resources;
  discoveries: string[];
  clues: string[];
  bonusDaysApplied: number;
}

export interface CampaignState {
  version: number;
  seed: string;
  canonical: boolean;
  difficulty: DifficultyId;
  level: LevelId;
  earthDaysRemaining: number;
  appliedTransitions: string[];
  clues: string[];
  narrativeFlags: Record<string, boolean>;
  clueSignals?: Partial<Record<LevelId, { x: number; y: number; distance: number }>>;
  manifest: TransferManifest | null;
  history: MissionResult[];
  /** Mission design chosen before the launch to the Moon. Missing in older saves: default design. */
  design?: MissionDesign;
}

export interface GameState {
  campaign: CampaignState;
  mission: MissionState;
  earth?: EarthState;
}

export type Action =
  | { type: 'BUILD'; building: BuildingType; x: number; y: number }
  | { type: 'EXPLORE'; x: number; y: number }
  | { type: 'COLLECT'; x: number; y: number }
  | { type: 'TOGGLE_BUILDING'; buildingId: number; enabled: boolean }
  | { type: 'SET_ENERGY_PRIORITY'; order: BuildingType[] }
  | { type: 'DECIDE_SHELTER'; shelter: boolean; day: number }
  | { type: 'END_DAY'; day: number }
  | { type: 'ACK_REPORT'; day: number }
  | { type: 'RESTART_MISSION' }
  | { type: 'REPAIR'; buildingId: number }
  | { type: 'CLEAN_PANELS' }
  | { type: 'ACTIVATE_BEACONS' }
  | { type: 'SCAN'; x: number; y: number }
  | EarthAction;

export type ErrorCode =
  | 'WRONG_PHASE'
  | 'STALE_DAY'
  | 'DECISION_PENDING'
  | 'NO_AP'
  | 'NO_MATERIALS'
  | 'TILE_OUT_OF_BOUNDS'
  | 'TILE_UNEXPLORED'
  | 'TILE_OCCUPIED'
  | 'TILE_BLOCKED'
  | 'WRONG_TERRAIN'
  | 'ALREADY_EXPLORED'
  | 'NOT_ADJACENT'
  | 'NOTHING_TO_COLLECT'
  | 'UNKNOWN_BUILDING'
  | 'NOT_AVAILABLE_IN_LEVEL'
  | 'NO_SHELTER'
  | 'NO_ENERGY_FOR_SHELTER'
  | 'NO_RADIATION_TODAY'
  | 'INVALID_PRIORITY'
  | 'NOTHING_TO_CLEAN'
  | 'PORTAL_LOCKED'
  | 'ALREADY_FOUND'
  | 'NOT_ON_EARTH'
  | 'NO_BUDGET'
  | 'MAX_LEVEL';

export type ActionErrorCode = ErrorCode;

export interface ActionError {
  code: ErrorCode;
  messageKey: string;
  params?: Record<string, string | number>;
}

export type ActionResult =
  | { ok: true; state: GameState; events: SimEvent[] }
  | { ok: false; state: GameState; error: ActionError };

export interface ForecastItem {
  eventId: string;
  type: EventType;
  inDays: number;
  durationDays: number;
  solarFactorPct?: number;
  radiationLevel?: RadiationLevel;
  sourceRef?: string;
}

export interface BuildingDef {
  type: BuildingType;
  cost: number;
  apCost: number;
  buildDays: number;
  energyPerDay: number;
  requiresTerrain: Terrain;
  levels: LevelId[];
  priority: number;
  capacity?: number;
  nameKey: string;
  descKey: string;
  whyKey: string;
  cardId?: string;
}

export interface DifficultyConfig {
  crewSize: number;
  dayLimit: number | null;
  initial: Resources;
  mineralYield: number;
  reserveThreshold: number;
  energyThreshold: number;
  streakDays: number;
  shelterEnergy: number;
  events: {
    type: EventType;
    startDay: number;
    durationDays: number;
    solarFactorPct?: number;
    radiationLevel?: RadiationLevel;
    jitterDays?: number;
    sourceRef?: string;
    target?: BuildingType;
  }[];
  dustPerDay?: number;
  dustCap?: number;
  linkDays?: number;
  maxLinkOutage?: number;
  logistics?: { near: number; far: number | null };
}

export interface LevelConfig {
  id: LevelId;
  width: number;
  height: number;
  rows: string[];
  ship: { x: number; y: number };
  initialExploredRadius: number;
  baseCaps: Resources;
  availableBuildings: BuildingType[];
  objectives: ObjectiveId[];
  forecastHorizonDays: number;
  forecastHorizonWithComms?: number;
  secret?: { beacon: { x: number; y: number } };
}

export interface SimConstants {
  panelOutput: number;
  batteryCapacity: number;
  extractorWater: number;
  recyclePct: number;
  generatorWaterIn: number;
  generatorOxygenOut: number;
  greenhouseWaterIn: number;
  greenhouseCycleDays: number;
  greenhouseHarvest: number;
  greenhouseStressPenalty: number;
  crewNeedPerDay: number;
  backgroundExposure: number;
  exposure: Record<'1' | '2', { unsheltered: number; sheltered: number }>;
  exposureCaution: number;
  exposureLimit: number;
  healthPenalty: { oxigeno: number; agua: number; alimentos: number };
  healthRecovery: number;
  exploreRevealRadius: number;
  repairCost?: number;
  labClueDays?: number;
}

export interface NasaSepRecord {
  nasa: {
    sepID: string;
    eventTime: string;
    instrument: string;
    link: string;
    flare: {
      flrID: string;
      classType: string;
      beginTime: string;
      peakTime: string;
      sourceLocation: string;
      activeRegionNum: number | null;
      link: string;
    } | null;
  };
  game: {
    radiationLevel: 1 | 2;
    rule: string;
    leadMinutes: number | null;
  };
}

export interface GameData {
  buildings: Record<BuildingType, BuildingDef>;
  levels: Partial<Record<LevelId, LevelConfig>> & { luna: LevelConfig };
  difficulty: Record<
    DifficultyId,
    {
      earthDays: number;
      bonusDays: number;
      levels: Partial<Record<LevelId, DifficultyConfig>> & { luna: DifficultyConfig };
    }
  >;
  constants: SimConstants;
  nasa: { sep: NasaSepRecord[] };
  earth?: EarthData;
  events?: Record<string, unknown>;
  cards?: unknown[];
  tutorial?: unknown[];
  /** Rockets, trajectories and payload for the mission design screen (balance values). */
  missionDesign?: MissionDesignData;
}

export type SimEvent =
  | { type: 'action/rejected'; error: ActionError }
  | { type: 'building/placed'; buildingId: number; building: BuildingType; x: number; y: number }
  | { type: 'building/operational'; buildingId: number; building: BuildingType }
  | { type: 'building/unpowered'; buildingId: number; building: BuildingType }
  | {
      type: 'tile/explored';
      x: number;
      y: number;
      revealed: { x: number; y: number; terrain: Terrain }[];
    }
  | { type: 'resource/collected'; resource: ResourceId; amount: number }
  | { type: 'discovery/found'; discoveryId: string }
  | { type: 'scan/empty' }
  | { type: 'building/damaged'; buildingId: number; building: BuildingType }
  | { type: 'earth/season'; report: EarthSeasonReport }
  | { type: 'day/started'; day: number }
  | { type: 'decision/required'; eventId: string; sourceRef?: string }
  | { type: 'decision/made'; eventId: string; shelter: boolean }
  | { type: 'day/ended'; report: DayReport }
  | { type: 'harvest/done'; amount: number }
  | { type: 'alert/radiation'; level: RadiationLevel; sheltered: boolean }
  | { type: 'alert/shortage'; resource: 'oxigeno' | 'agua' | 'alimentos'; crewAffected: number }
  | { type: 'event/forecast'; item: ForecastItem }
  | { type: 'objective/met'; objective: ObjectiveId }
  | { type: 'streak/changed'; streak: number }
  | { type: 'mission/victory'; result: MissionResult }
  | { type: 'mission/defeat'; result: MissionResult }
  | { type: 'transition/applied'; id: string };

export type GameEvent = SimEvent;

export type Status = 'seguro' | 'preventivo' | 'critico';

export interface HudSummary {
  energia: {
    status: Status;
    stored: number;
    cap: number;
    generationToday: number;
    demandToday: number;
  };
  soporte: {
    status: Status;
    marginDays: number;
    limiting: 'oxigeno' | 'agua' | 'alimentos';
  };
  proteccion: {
    status: Status;
    maxExposure: number;
    shelterReady: boolean;
    alertInDays: number | null;
  };
}

export interface SaveData {
  schema: 'earths-angel/save';
  version: number;
  savedAtDay: number;
  state: GameState;
}

export interface MapView {
  setVisible(visible: boolean): void;
  destroy(): void;
}

export type Tool =
  | { kind: 'inspect' }
  | { kind: 'build'; building: BuildingType }
  | { kind: 'explore' }
  | { kind: 'collect' }
  | { kind: 'scan' };

export interface UiState {
  tool: Tool;
  hover: { x: number; y: number } | null;
  openPanel: string | null;
}
