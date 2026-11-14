// AI-assisted: Antigravity (Gemini), reviewed by A

import type { GameData, GameState, ResourceId } from './types';

const RESOURCES: ResourceId[] = [
  'energia',
  'oxigeno',
  'agua',
  'alimentos',
  'materiales',
];

export function validateState(state: GameState, data: GameData): string[] {
  const issues: string[] = [];
  if (!state || !state.campaign || !state.mission) {
    return ['state: missing campaign or mission'];
  }

  const { campaign, mission } = state;

  // 1. Version, difficulty, level
  if (campaign.version !== 1) {
    issues.push(`campaign.version: invalid version ${String(campaign.version)}`);
  }
  const diffBlock = data.difficulty[campaign.difficulty];
  if (!diffBlock) {
    issues.push(`campaign.difficulty: unknown difficulty ${String(campaign.difficulty)}`);
  }
  const levelCfg = data.levels[mission.level];
  const earthActive = campaign.level === 'tierra' && state.earth && mission.level === 'marte';
  if (!levelCfg || (!earthActive && campaign.level !== mission.level)) {
    issues.push(`mission.level: invalid or mismatched level ${String(mission.level)}`);
  }

  const cfg = diffBlock?.levels[mission.level] ?? diffBlock?.levels.luna;

  // 2. Map dimensions and ship count
  if (levelCfg) {
    if (
      mission.map.width !== levelCfg.width ||
      mission.map.height !== levelCfg.height ||
      mission.map.tiles.length !== levelCfg.width * levelCfg.height
    ) {
      issues.push('mission.map: invalid dimensions or tile count');
    }
  }
  const ships = mission.buildings.filter((b) => b.type === 'nave');
  if (ships.length !== 1) {
    issues.push(`mission.buildings: expected 1 nave, found ${ships.length}`);
  }

  // 3. Buildings validity
  const occupied = new Set<string>();
  for (const b of mission.buildings) {
    const def = data.buildings[b.type];
    if (!def) {
      issues.push(`building ${b.type}: unknown building type`);
      continue;
    }
    if (
      b.type !== 'nave' &&
      levelCfg &&
      !levelCfg.availableBuildings.includes(b.type)
    ) {
      issues.push(`building ${b.type}: not available in level ${mission.level}`);
    }
    const posKey = `${b.x},${b.y}`;
    if (occupied.has(posKey)) {
      issues.push(`building ${b.type}: duplicate position (${posKey})`);
    }
    occupied.add(posKey);

    if (
      b.x < 0 ||
      b.y < 0 ||
      b.x >= mission.map.width ||
      b.y >= mission.map.height
    ) {
      issues.push(`building ${b.type}: out of bounds (${posKey})`);
    } else {
      const tile = mission.map.tiles[b.y * mission.map.width + b.x];
      if (!tile?.explored) {
        issues.push(`building ${b.type}: placed on unexplored tile (${posKey})`);
      }
      if (tile && tile.terrain !== def.requiresTerrain) {
        issues.push(
          `building ${b.type}: invalid terrain ${tile.terrain} at (${posKey}), requires ${def.requiresTerrain}`,
        );
      }
    }
  }

  // 4. Resources between 0 and cap
  for (const r of RESOURCES) {
    const val = mission.resources[r];
    const cap = mission.caps[r];
    if (!Number.isInteger(val) || val < 0 || val > cap) {
      issues.push(`resource ${r}: value ${String(val)} out of range 0..${String(cap)}`);
    }
  }

  // 5. Crew size, health, exposure
  if (cfg && mission.crew.length !== cfg.crewSize) {
    issues.push(
      `mission.crew: expected ${cfg.crewSize} members, found ${mission.crew.length}`,
    );
  }
  for (const c of mission.crew) {
    if (!Number.isInteger(c.health) || c.health < 0 || c.health > 100) {
      issues.push(`crew ${c.id}: invalid health ${c.health}`);
    }
    if (!Number.isInteger(c.exposure) || c.exposure < 0) {
      issues.push(`crew ${c.id}: invalid exposure ${c.exposure}`);
    }
  }

  // 6. Clocks
  if (!Number.isInteger(mission.day) || mission.day < 1) {
    issues.push(`mission.day: invalid day ${mission.day}`);
  }
  if (!Number.isInteger(campaign.earthDaysRemaining)) {
    issues.push(`campaign.earthDaysRemaining: must be integer`);
  }

  // 7. Schedule events & NASA sourceRef
  const sepIds = new Set(data.nasa.sep.map((s) => s.nasa.sepID));
  for (const ev of mission.schedule) {
    if (
      ev.type !== 'sombra' &&
      ev.type !== 'tormenta-solar' &&
      ev.type !== 'tormenta-polvo' &&
      ev.type !== 'averia'
    ) {
      issues.push(`schedule event ${ev.id}: unknown type ${String(ev.type)}`);
    }
    if (
      ev.sourceRef &&
      ev.sourceRef !== 'SYNTHETIC' &&
      sepIds.size > 0 &&
      !sepIds.has(ev.sourceRef)
    ) {
      issues.push(`schedule event ${ev.id}: unknown sourceRef ${ev.sourceRef}`);
    }
  }

  // 8. Phase coherence
  if (mission.phase === 'ended' && mission.result === null) {
    issues.push('mission.phase: phase is ended but mission.result is null');
  }
  if (mission.phase !== 'ended' && mission.result !== null) {
    issues.push(`mission.phase: phase is ${mission.phase} but mission.result is present`);
  }
  if (mission.phase === 'decision' && !mission.decisionPending) {
    issues.push('mission.phase: phase is decision but decisionPending is null');
  }
  if (mission.phase !== 'decision' && mission.decisionPending !== null) {
    issues.push(`mission.phase: phase is ${mission.phase} but decisionPending is set`);
  }

  // 9. Action points
  if (
    !Number.isInteger(mission.ap) ||
    mission.ap < 0 ||
    mission.ap > mission.crew.length
  ) {
    issues.push(`mission.ap: invalid ap ${mission.ap}`);
  }

  // 10. Transitions
  if (
    mission.level === 'marte' &&
    !campaign.appliedTransitions.includes('luna->marte')
  ) {
    issues.push('campaign.appliedTransitions: missing luna->marte for marte level');
  }
  if (
    mission.level === 'tierra' &&
    !campaign.appliedTransitions.includes('marte->tierra')
  ) {
    issues.push('campaign.appliedTransitions: missing marte->tierra for tierra level');
  }

  if (campaign.level === 'tierra' || state.earth) {
    const earth = state.earth;
    const cfg = data.earth?.difficulty[campaign.difficulty];
    if (!earthActive || !earth || !cfg || !data.earth || mission.result?.outcome !== 'victory'
      || !campaign.appliedTransitions.includes('marte->tierra')
      || !Number.isInteger(earth.season) || earth.season < 1 || earth.season > cfg.seasons
      || earth.seasons !== cfg.seasons || !Number.isInteger(earth.budget)
      || earth.budget < 0 || earth.budget > cfg.budget + cfg.carryMax
      || (earth.result !== null && earth.result?.level !== 'tierra')) {
      issues.push('earth: invalid mission state');
    } else {
      for (const key of ['agua', 'emisiones', 'ecosistemas'] as const) {
        if (!Number.isInteger(earth.indicators[key]) || earth.indicators[key] < 0 || earth.indicators[key] > 100) {
          issues.push('earth: invalid indicator ' + key);
        }
      }
      for (const line of ['energia', 'agua', 'reciclaje', 'restauracion'] as const) {
        if (!Number.isInteger(earth.levels[line]) || earth.levels[line] < 0 || earth.levels[line] > data.earth.maxLevel) {
          issues.push('earth: invalid level ' + line);
        }
      }
    }
  }

  // 11. Collected tiles & streak
  for (const t of mission.map.tiles) {
    if (t.collected && t.terrain !== 'mineral') {
      issues.push(`tile (${t.x},${t.y}): collected is true on ${t.terrain}`);
    }
  }
  if (
    !Number.isInteger(mission.streak) ||
    mission.streak < 0 ||
    mission.streak > mission.day
  ) {
    issues.push(`mission.streak: invalid streak ${mission.streak}`);
  }

  return issues;
}
