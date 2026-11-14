// AI-assisted: Cursor (Composer), reviewed by B
// Campaign changes assisted by OpenAI Codex. Human review pending.
import type {
  BuildingDef,
  BuildingType,
  DifficultyConfig,
  DifficultyId,
  EarthData,
  GameData,
  LevelConfig,
  SimConstants,
} from '../core/types';
import buildingsJson from './content/buildings.json';
import eventsJson from './content/events.json';
import cardsJson from './content/cards.json';
import tutorialJson from './content/tutorial.json';
import lunaLevelJson from './content/levels/luna.json';
import marteLevelJson from './content/levels/marte.json';
import constantsJson from './balance/constants.json';
import difficultyJson from './balance/difficulty.json';
import lunaBalanceJson from './balance/luna.json';
import marteBalanceJson from './balance/marte.json';
import tierraBalanceJson from './balance/tierra.json';
import { loadSepRecords } from './nasa/adapter';
import { validateCards, validateContentCatalogs, validateGameData } from './validate';
import enContent from './i18n/en/content.json';
import esContent from './i18n/es/content.json';

export { loadSepRecords, findSepRecord, recordsByLevel, describeSepRecord } from './nasa/adapter';
export { validateGameData, dataError } from './validate';

export function loadGameData(): GameData {
  const buildings = buildingsJson as unknown as Record<BuildingType, BuildingDef>;
  const lunaLevel = lunaLevelJson as unknown as LevelConfig;
  const marteLevel = marteLevelJson as unknown as LevelConfig;
  const constants = constantsJson as unknown as SimConstants;
  const difficultyMeta = difficultyJson as Record<
    DifficultyId,
    { earthDays: number; bonusDays: number }
  >;
  const lunaByDiff = lunaBalanceJson as Record<DifficultyId, DifficultyConfig>;
  const marteByDiff = marteBalanceJson as Record<DifficultyId, DifficultyConfig>;
  const earth: EarthData = tierraBalanceJson;

  const sep = loadSepRecords();

  const data: GameData = {
    buildings,
    levels: { luna: lunaLevel, marte: marteLevel },
    difficulty: {
      facil: {
        earthDays: difficultyMeta.facil.earthDays,
        bonusDays: difficultyMeta.facil.bonusDays,
        levels: { luna: lunaByDiff.facil, marte: marteByDiff.facil },
      },
      media: {
        earthDays: difficultyMeta.media.earthDays,
        bonusDays: difficultyMeta.media.bonusDays,
        levels: { luna: lunaByDiff.media, marte: marteByDiff.media },
      },
      imposible: {
        earthDays: difficultyMeta.imposible.earthDays,
        bonusDays: difficultyMeta.imposible.bonusDays,
        levels: { luna: lunaByDiff.imposible, marte: marteByDiff.imposible },
      },
    },
    constants,
    earth,
    nasa: { sep },
    events: eventsJson as Record<string, unknown>,
    cards: cardsJson as unknown[],
    tutorial: tutorialJson as unknown[],
  };

  validateGameData(data);
  validateCards(cardsJson as { id: string; tag: string; source?: { url?: string } }[]);
  validateContentCatalogs(enContent, esContent, [
    buildings,
    eventsJson,
    cardsJson,
    tutorialJson,
  ]);
  return data;
}
