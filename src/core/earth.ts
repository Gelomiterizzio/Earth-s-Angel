// AI-assisted: OpenAI Codex. Human review pending.
import type {
  ActionError,
  ActionResult,
  DifficultyId,
  EarthAction,
  EarthData,
  EarthIndicator,
  EarthLine,
  EarthSeasonReport,
  EarthState,
  GameData,
  GameState,
  MissionResult,
  SimEvent,
} from './types';

const LINES: readonly EarthLine[] = ['energia', 'agua', 'reciclaje', 'restauracion'];
const INDICATORS: readonly EarthIndicator[] = ['agua', 'emisiones', 'ecosistemas'];

export function createEarth(difficulty: DifficultyId, data: GameData): EarthState {
  if (!data.earth) throw new Error('Missing Earth balance data');
  const { seasons, budget } = data.earth.difficulty[difficulty];
  return {
    season: 1,
    seasons,
    budget,
    levels: { energia: 0, agua: 0, reciclaje: 0, restauracion: 0 },
    indicators: { ...data.earth.start },
    lastReport: null,
    result: null,
  };
}

function error(code: ActionError['code'], params?: ActionError['params']): ActionError {
  return { code, messageKey: `sim.error.${code}`, ...(params ? { params } : {}) };
}

function investmentCost(levels: EarthState['levels'], line: EarthLine, data: EarthData): number {
  if (line === 'restauracion' && levels.energia >= data.combos.cleanPowerDiscountAt) {
    return data.combos.restorationDiscountCost;
  }
  return data.lines[line].cost;
}

function checkTurn(earth: EarthState, action: EarthAction, data: EarthData): ActionError | null {
  if (action.type === 'EARTH_END_SEASON' && action.season !== earth.season) {
    return { code: 'STALE_DAY', messageKey: 'content.earth.error.staleSeason' };
  }
  if (earth.result) return error('WRONG_PHASE');
  if (action.type === 'EARTH_END_SEASON') return null;
  const line = action.action;
  if (!Object.hasOwn(data.lines, line)) return error('NOT_AVAILABLE_IN_LEVEL');
  if (earth.levels[line] >= data.maxLevel) return error('MAX_LEVEL', { max: data.maxLevel });
  const cost = investmentCost(earth.levels, line, data);
  if (earth.budget < cost) return error('NO_BUDGET', { cost });
  return null;
}

export function previewEarth(state: GameState, action: EarthAction, data: GameData): ActionError | null {
  if (state.campaign.level !== 'tierra' || !state.earth || !data.earth) return error('NOT_ON_EARTH');
  return checkTurn(state.earth, action, data.earth);
}

function reportSeason(earth: EarthState, data: EarthData): EarthSeasonReport {
  const { levels } = earth;
  const gains = { agua: 0, emisiones: 0, ecosistemas: 0 };
  const causeEffectKeys: string[] = [];

  for (const line of LINES) {
    if (levels[line] === 0) continue;
    const { effects } = data.lines[line];
    for (const indicator of INDICATORS) {
      gains[indicator] += levels[line] * (effects[indicator] ?? 0);
    }
    causeEffectKeys.push(`content.earth.report.${line}`);
  }
  if (levels.agua > 0 && levels.reciclaje >= data.combos.recyclingBoostsWaterAt) {
    gains.agua += levels.agua;
    causeEffectKeys.push('content.earth.report.recyclingBoost');
  }
  if (levels.restauracion > 0 && earth.indicators.agua < data.combos.lowWaterThreshold) {
    const restoration = levels.restauracion * (data.lines.restauracion.effects.ecosistemas ?? 0);
    gains.ecosistemas -= restoration - Math.floor(restoration / 2);
    causeEffectKeys.push('content.earth.report.lowWater');
  }
  causeEffectKeys.push('content.earth.report.drift');
  return { season: earth.season, gains, drift: { ...data.drift }, causeEffectKeys };
}

function closeSeason(state: GameState, earth: EarthState, data: EarthData): ActionResult {
  const { campaign } = state;
  const rules = data.difficulty[campaign.difficulty];
  const report = reportSeason(earth, data);
  const indicators = { ...earth.indicators };
  for (const id of INDICATORS) {
    indicators[id] = Math.min(100, Math.max(0, indicators[id] + report.gains[id] + report.drift[id]));
  }

  const events: SimEvent[] = [{ type: 'earth/season', report }];
  let next: EarthState = { ...earth, indicators, lastReport: report };

  if (indicators.agua === 0 || earth.season === earth.seasons) {
    const cause = indicators.agua === 0
      ? 'soporte-vital'
      : INDICATORS.every((id) => indicators[id] >= rules.targets[id]) ? undefined : 'plazo';
    const key = cause === 'soporte-vital' ? 'water' : cause === 'plazo' ? 'deadline' : 'victory';
    const result: MissionResult = {
      outcome: cause ? 'defeat' : 'victory',
      ...(cause ? { cause } : {}),
      level: 'tierra',
      difficulty: campaign.difficulty,
      seed: campaign.seed,
      daysUsed: earth.season,
      earthDaysRemaining: campaign.earthDaysRemaining,
      resources: { energia: 0, oxigeno: 0, agua: 0, alimentos: 0, materiales: 0 },
      margins: { energia: 0, oxigeno: 0, agua: 0, alimentos: 0 },
      maxExposure: 0,
      incidents: [],
      principleKey: `content.earth.result.${key}.principle`,
      suggestionKey: `content.earth.result.${key}.suggestion`,
      earth: { indicators: { ...indicators }, targets: { ...rules.targets }, seasonsUsed: earth.season },
    };
    next = { ...next, result };
    events.push(result.outcome === 'victory' ? { type: 'mission/victory', result } : { type: 'mission/defeat', result });
  } else {
    next = {
      ...next,
      season: earth.season + 1,
      budget: rules.budget + Math.min(earth.budget, rules.carryMax),
    };
  }
  return { ok: true, state: { ...state, earth: next }, events };
}

export function applyEarth(state: GameState, action: EarthAction, data: GameData): ActionResult {
  const earth = state.earth;
  const balance = data.earth;
  if (state.campaign.level !== 'tierra' || !earth || !balance) {
    return { ok: false, state, error: error('NOT_ON_EARTH') };
  }
  const rejected = checkTurn(earth, action, balance);
  if (rejected) return { ok: false, state, error: rejected };
  if (action.type === 'EARTH_END_SEASON') return closeSeason(state, earth, balance);
  const line = action.action;
  return {
    ok: true,
    state: {
      ...state,
      earth: {
        ...earth,
        budget: earth.budget - investmentCost(earth.levels, line, balance),
        levels: { ...earth.levels, [line]: earth.levels[line] + 1 },
      },
    },
    events: [],
  };
}
