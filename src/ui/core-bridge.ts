// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import * as core from '../core/index';
import type { GameData, GameState, MissionResult } from '../core/types';

export type {
  Action,
  ActionError,
  BuildingDef,
  BuildingType,
  DayReport,
  DifficultyId,
  ForecastItem,
  GameData,
  GameState,
  LevelId,
  MissionResult,
  ObjectiveStatus,
  ResourceId,
  TransferManifest,
} from '../core/types';

export type { HudSummary, Status } from '../core/types';

export { computeForecast, previewAction, previewEnergy, summarizeHud } from '../core/index';

export const EARTH_LINES = ['energia', 'agua', 'reciclaje', 'restauracion'] as const;
export const EARTH_INDICATORS = ['agua', 'emisiones', 'ecosistemas'] as const;
export type EarthLine = (typeof EARTH_LINES)[number];
export type EarthIndicator = (typeof EARTH_INDICATORS)[number];
type EarthIndicators = Record<EarthIndicator, number>;
export type EarthAction = { type: 'EARTH_INVEST'; action: EarthLine }
  | { type: 'EARTH_END_SEASON'; season: number };

export interface EarthSeasonReport {
  season: number;
  gains: EarthIndicators;
  drift: EarthIndicators;
  causeEffectKeys: string[];
}

interface EarthState {
  season: number;
  seasons: number;
  budget: number;
  levels: Record<EarthLine, number>;
  indicators: EarthIndicators;
  lastReport: EarthSeasonReport | null;
  result: MissionResult | null;
}

interface EarthData {
  maxLevel: number;
  lines: Record<EarthLine, { cost: number; effects: Partial<EarthIndicators> }>;
  combos: {
    cleanPowerDiscountAt: number;
    restorationDiscountCost: number;
  };
  difficulty: Record<GameState['campaign']['difficulty'], { targets: EarthIndicators }>;
}

// Compatibility with the P0 sources in the isolated copy and the UI mocks.
export type CampaignState = GameState & {
  earth?: EarthState;
  mission: { dust?: number; linkStreak?: number; labDays?: number };
};
export type CampaignData = GameData & {
  earth?: EarthData;
  levels: Partial<Record<GameState['mission']['level'], { secret?: { beacon: { x: number; y: number } } }>>;
  difficulty: Record<GameState['campaign']['difficulty'], {
    levels: Partial<Record<GameState['mission']['level'], { linkDays?: number }>>;
  }>;
  constants: { repairCost?: number; labClueDays?: number };
};

export function readPortalRequirements(state: GameState, data: GameData): string[] | undefined {
  const helper: unknown = Reflect.get(core, 'portalRequirements');
  if (typeof helper === 'function') return (helper as (state: GameState, data: GameData) => string[])(state, data);
}

export function readMissionResult(state: CampaignState | null): MissionResult | null {
  return state?.earth ? state.earth.result : state?.mission.result ?? null;
}
