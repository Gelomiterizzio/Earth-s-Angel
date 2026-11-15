// AI-assisted: OpenAI Codex. Human review pending.
import { designCommsForecast, designForecastBonus, designStorageBonus } from './design';
import type { ActionResult, GameData, GameState, ResourceId, TransferManifest } from './types';
import { startDay } from './day-cycle';
import { createEarth } from './earth';
import { createMission } from './mission';
import { resolveEnergyStep } from './energy';
import { getSolarFactorForDay } from './events';

type Transition = 'luna->marte' | 'marte->tierra' | 'tierra->marte';

export function portalRequirements(state: GameState, data: GameData): string[] {
  const { campaign, mission } = state;
  const missing: string[] = [];
  if (!campaign.narrativeFlags.beaconMoon) missing.push('beaconMoon');
  if (!campaign.narrativeFlags.beaconMars) missing.push('beaconMars');
  const day = mission.result?.daysUsed ?? mission.day;
  if (!mission.buildings.some((b) =>
    b.type === 'laboratorio' && b.enabled && !b.damaged && b.operationalFromDay <= day
  )) missing.push('laboratory');
  if (mission.level !== 'marte' || mission.result?.outcome !== 'victory') missing.push('victory');
  return missing;
}

export function forecastHorizon(state: GameState, data: GameData): number {
  // The radiation sensor chosen in the mission design adds warning days on every level.
  return baseForecastHorizon(state, data) + designForecastBonus(state.campaign, data);
}

function baseForecastHorizon(state: GameState, data: GameData): number {
  const { mission, campaign } = state;
  const level = data.levels[mission.level] ?? data.levels.luna;
  const commsBonus = designCommsForecast(campaign, data);
  if (!level.forecastHorizonWithComms) return level.forecastHorizonDays + commsBonus;
  if (commsBonus > 0) return level.forecastHorizonWithComms;
  const cfg = data.difficulty[campaign.difficulty].levels[mission.level];
  const power = resolveEnergyStep(mission, mission.day,
    getSolarFactorForDay(mission.schedule, mission.day), cfg?.shelterEnergy ?? 0, data);
  return mission.buildings.some((b) => b.type === 'comunicaciones' && power.poweredIds.has(b.id))
    ? level.forecastHorizonWithComms : level.forecastHorizonDays;
}

function arrived(state: GameState, data: GameData, manifest: TransferManifest) {
  const { difficulty, seed, canonical } = state.campaign;
  const mission = createMission('marte', difficulty, seed, canonical, data);
  const storageBonus = designStorageBonus(state.campaign, data);
  if (storageBonus > 0) {
    for (const id of ['oxigeno', 'agua', 'alimentos', 'materiales'] as const) {
      mission.caps[id] += storageBonus;
    }
  }
  for (const id of Object.keys(mission.resources) as ResourceId[]) {
    if (id !== 'energia') {
      mission.resources[id] = Math.min(
        mission.caps[id], mission.resources[id] + manifest.supplies[id],
      );
    }
  }
  const specialists = mission.crew.slice(manifest.crew.length);
  mission.crew = [...manifest.crew.map((member) => ({ ...member })), ...specialists];
  mission.discoveries = [...manifest.discoveries];
  return mission;
}

export function restartMars(state: GameState, data: GameData) {
  const manifest = state.campaign.manifest;
  if (!manifest) return null;
  const origin = state.campaign.history.find((result) => result.level === 'luna' && result.outcome === 'victory');
  if (!origin) return null;
  return startDay({
    campaign: {
      ...state.campaign,
      earthDaysRemaining: origin.earthDaysRemaining + manifest.bonusDaysApplied,
    },
    mission: arrived(state, data, manifest),
  }, data);
}

export function applyTransition(state: GameState, id: Transition, data: GameData): ActionResult {
  const { campaign, mission } = state;
  if (campaign.appliedTransitions.includes(id)) return { ok: true, state, events: [] };

  const next = (transitioned: GameState): ActionResult => ({
    ok: true,
    state: {
      ...transitioned,
      campaign: { ...transitioned.campaign, appliedTransitions: [...campaign.appliedTransitions, id] },
    },
    events: [{ type: 'transition/applied', id }],
  });

  if (id === 'luna->marte' && mission.level === 'luna' && mission.result?.outcome === 'victory'
    && data.levels.marte && data.difficulty[campaign.difficulty].levels.marte) {
    const bonus = data.difficulty[campaign.difficulty].bonusDays;
    const manifest: TransferManifest = {
      crew: mission.crew.map((c) => ({ ...c, health: 100, exposure: Math.floor(c.exposure / 2) })),
      supplies: { ...mission.resources, energia: 0 },
      discoveries: [...mission.discoveries],
      clues: [...campaign.clues],
      bonusDaysApplied: bonus,
    };
    for (const id of Object.keys(manifest.supplies) as ResourceId[]) {
      manifest.supplies[id] = Math.floor(manifest.supplies[id] / 2);
    }
    const history = campaign.history.includes(mission.result)
      || campaign.history.some((result) => result.level === 'luna' && result.outcome === 'victory')
      ? campaign.history : [...campaign.history, mission.result];
    const opened = startDay({
      campaign: { ...campaign, level: 'marte', earthDaysRemaining: campaign.earthDaysRemaining + bonus, manifest, history },
      mission: arrived(state, data, manifest),
    }, data);
    const response = next(opened.state);
    if (response.ok) response.events.push(...opened.events);
    return response;
  }

  if (id === 'marte->tierra' && data.earth && campaign.level === 'marte'
    && campaign.narrativeFlags.beaconsActivated && portalRequirements(state, data).length === 0) {
    return next({
      campaign: { ...campaign, level: 'tierra' },
      mission,
      earth: createEarth(campaign.difficulty, data),
    });
  }

  if (id === 'tierra->marte' && campaign.level === 'tierra' && state.earth?.result?.outcome === 'defeat') {
    return next({
      campaign: { ...campaign, level: 'marte', narrativeFlags: { ...campaign.narrativeFlags, earthFailed: true } },
      mission,
    });
  }

  const code = id === 'marte->tierra' ? 'PORTAL_LOCKED' : 'WRONG_PHASE';
  return { ok: false, state, error: { code, messageKey: 'sim.error.' + code } };
}
