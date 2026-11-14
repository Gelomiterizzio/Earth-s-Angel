// AI-assisted: Cursor Grok 4.7, reviewed by C
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
