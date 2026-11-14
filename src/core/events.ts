// AI-assisted: Antigravity (Gemini), reviewed by A

import type {
  DifficultyId,
  ForecastItem,
  GameData,
  LevelId,
  RadiationLevel,
  ScheduledEvent,
} from './types';
import { hashSeed, mulberry32, randInt } from './rng';

export function buildSchedule(
  difficulty: DifficultyId,
  level: LevelId,
  seed: string,
  canonical: boolean,
  data: GameData,
): ScheduledEvent[] {
  const diffBlock = data.difficulty[difficulty];
  const cfg = diffBlock.levels[level] ?? diffBlock.levels.luna;
  const rng = mulberry32(hashSeed(seed));
  const usedIds = new Set<string>();

  return cfg.events.map((tmpl, idx) => {
    const jitter = canonical ? 0 : randInt(rng, -(tmpl.jitterDays ?? 0), tmpl.jitterDays ?? 0);
    const startDay = Math.max(2, tmpl.startDay + jitter);

    let id = `${tmpl.type}-${startDay}`;
    if (usedIds.has(id)) {
      id = `${tmpl.type}-${startDay}-${idx + 1}`;
    }
    usedIds.add(id);

    let sourceRef = tmpl.sourceRef;
    if (!sourceRef && tmpl.type === 'tormenta-solar' && data.nasa.sep.length > 0) {
      const matching = data.nasa.sep.filter(
        (r) => !tmpl.radiationLevel || r.game.radiationLevel === tmpl.radiationLevel,
      );
      const pool = matching.length > 0 ? matching : data.nasa.sep;
      const pickIdx = canonical ? idx % pool.length : randInt(rng, 0, pool.length - 1);
      sourceRef = pool[pickIdx]?.nasa.sepID;
    }

    const scheduled: ScheduledEvent = {
      id,
      type: tmpl.type,
      startDay,
      durationDays: tmpl.durationDays,
    };
    if (tmpl.solarFactorPct !== undefined) {
      scheduled.solarFactorPct = tmpl.solarFactorPct;
    }
    if (tmpl.radiationLevel !== undefined) {
      scheduled.radiationLevel = tmpl.radiationLevel;
    }
    if (sourceRef !== undefined) {
      scheduled.sourceRef = sourceRef;
    }
    return scheduled;
  });
}

export function getActiveEvents(schedule: ScheduledEvent[], day: number): ScheduledEvent[] {
  return schedule.filter((e) => e.startDay <= day && day <= e.startDay + e.durationDays - 1);
}

export function getSolarFactorForDay(schedule: ScheduledEvent[], day: number): number {
  const active = getActiveEvents(schedule, day);
  if (active.length === 0) return 100;
  return Math.min(100, ...active.map((e) => e.solarFactorPct ?? 100));
}

export function getRadiationForDay(schedule: ScheduledEvent[], day: number): RadiationLevel {
  const active = getActiveEvents(schedule, day);
  if (active.length === 0) return 0;
  return Math.max(0, ...active.map((e) => e.radiationLevel ?? 0)) as RadiationLevel;
}

export function getDecisionEventForDay(
  schedule: ScheduledEvent[],
  day: number,
): ScheduledEvent | null {
  const active = getActiveEvents(schedule, day);
  return active.find((e) => (e.radiationLevel ?? 0) > 0) ?? null;
}

export function getForecast(
  schedule: ScheduledEvent[],
  day: number,
  horizonDays: number,
): ForecastItem[] {
  const items: ForecastItem[] = [];
  for (const e of schedule) {
    const endDay = e.startDay + e.durationDays - 1;
    const isActive = e.startDay <= day && day <= endDay;
    const isUpcoming = e.startDay > day && e.startDay - day <= horizonDays;
    if (isActive || isUpcoming) {
      const item: ForecastItem = {
        eventId: e.id,
        type: e.type,
        inDays: Math.max(0, e.startDay - day),
        durationDays: e.durationDays,
      };
      if (e.solarFactorPct !== undefined) item.solarFactorPct = e.solarFactorPct;
      if (e.radiationLevel !== undefined) item.radiationLevel = e.radiationLevel;
      if (e.sourceRef !== undefined) item.sourceRef = e.sourceRef;
      items.push(item);
    }
  }
  return items;
}
