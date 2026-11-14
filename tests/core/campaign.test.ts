// AI-assisted: OpenAI Codex. Human review pending.
import { describe, expect, it } from 'vitest';
import { createFlow } from '../../src/app/flow';
import type { AppContext } from '../../src/app/context';
import { createStore } from '../../src/app/store';
import { applyAction, applyTransition, deserialize, portalRequirements, serialize } from '../../src/core';
import type { Action, ActionResult, DifficultyId, GameState } from '../../src/core';
import { loadGameData } from '../../src/data';
import { MEDIA_PLAN } from './plans/media';
import { runPlan } from './plans/runner';
import { MARS_PLAN } from './plans/mars';
import { FACIL_PLAN } from './plans/facil';
import { IMPOSIBLE_PLAN } from './plans/imposible';

const data = loadGameData();

function accept(result: ActionResult): GameState {
  if (!result.ok) throw new Error(result.error.messageKey);
  return result.state;
}

const lunarVictory = () => runPlan('media', MEDIA_PLAN, data).finalState;

const MOON_PLANS = { facil: FACIL_PLAN, media: MEDIA_PLAN, imposible: IMPOSIBLE_PLAN };

const moonScan: Action[] = [
  { type: 'EXPLORE', x: 8, y: 3 },
  { type: 'EXPLORE', x: 10, y: 2 },
  { type: 'SCAN', x: 10, y: 2 },
];

function runMars(difficulty: DifficultyId, secret = false): GameState {
  const moonPlan = MOON_PLANS[difficulty].map((step) =>
    secret && step.day === 7 ? { ...step, actions: moonScan } : step,
  );
  const moon = runPlan(difficulty, moonPlan, data).finalState;
  let state = accept(applyTransition(moon, 'luna->marte', data));
  function perform(action: Action) {
    const result = applyAction(state, action, data);
    if (!result.ok) {
      throw new Error(JSON.stringify({
        day: state.mission.day, action, error: result.error, ap: state.mission.ap, resources: state.mission.resources,
      }));
    }
    state = result.state;
  }
  while (!state.mission.result) {
    const day = state.mission.day;
    if (state.mission.phase === 'decision') {
      perform({ type: 'DECIDE_SHELTER', shelter: true, day });
    } else {
      for (const action of MARS_PLAN[day] ?? []) perform(action);
      for (const b of state.mission.buildings) {
        if (b.damaged) perform({ type: 'REPAIR', buildingId: b.id });
      }
      if (secret) {
        for (const action of MARS_SECRET_PLAN[day] ?? []) perform(action);
      }
      if (!MARS_PLAN[day] && (state.mission.dust ?? 0) > 0) perform({ type: 'CLEAN_PANELS' });
    }
    perform({ type: 'END_DAY', day });
    if (!state.mission.result) perform({ type: 'ACK_REPORT', day });
  }
  return state;
}

const MARS_SECRET_PLAN: Record<number, Action[]> = {
  4: [{ type: 'EXPLORE', x: 11, y: 15 }],
  15: [{ type: 'EXPLORE', x: 10, y: 17 }, { type: 'COLLECT', x: 10, y: 18 }],
  16: [{ type: 'BUILD', building: 'laboratorio', x: 11, y: 10 }, { type: 'EXPLORE', x: 14, y: 12 }],
  17: [{ type: 'EXPLORE', x: 16, y: 12 }, { type: 'SCAN', x: 17, y: 12 }],
};

describe('campaign transitions and persistence', () => {
  it.each(['facil', 'media', 'imposible'] as const)('wins the Mars mission in %s from a lunar campaign', (difficulty) => {
    const mars = runMars(difficulty);
    expect(mars.mission.result, JSON.stringify({
      day: mars.mission.day, resources: mars.mission.resources, objectives: mars.mission.objectives,
    })).toMatchObject({ level: 'marte', outcome: 'victory' });
  });
  it('transfers the lunar supplies and crew exactly once and preserves the Mars start on retry', () => {
    const moon = lunarVictory();
    const mars = accept(applyTransition(moon, 'luna->marte', data));
    expect(mars.mission.map).toMatchObject({ width: 20, height: 20 });
    expect(mars.campaign.earthDaysRemaining).toBe(55);
    expect(mars.campaign.manifest?.supplies).toEqual({
      energia: 0, oxigeno: 12, agua: 13, alimentos: 10, materiales: 7,
    });
    expect(mars.mission.resources).toEqual({
      energia: 12, oxigeno: 24, agua: 25, alimentos: 22, materiales: 57,
    });
    expect(mars.mission.crew.map((c) => [c.health, c.exposure])).toEqual([
      [100, 7], [100, 7], [100, 7], [100, 7], [100, 0], [100, 0],
    ]);
    expect(accept(applyTransition(mars, 'luna->marte', data))).toBe(mars);
    const later = accept(applyAction(mars, { type: 'END_DAY', day: 1 }, data));
    const loaded = deserialize(serialize(later), data);
    expect(loaded).toEqual({ ok: true, state: later });
    expect(accept(applyAction(later, { type: 'RESTART_MISSION' }, data))).toEqual(mars);
  });

  it('resumes the pending Mars cinematic after reloading and consumes no turn on completion', () => {
    const store = createStore(data, lunarVictory());
    const uiRoot = { innerHTML: '', querySelector: () => null } as unknown as HTMLElement;
    const ctx = { store, data } as AppContext;
    const flow = createFlow({ uiRoot, getContext: () => ctx });
    ctx.flow = flow;
    flow.go('titulo');
    flow.continueCampaign?.();
    expect(flow.current().scene).toBe('resultado');
    flow.departToMars?.();
    expect(flow.current().params.id).toBe('moonToMars');
    const saved = deserialize(serialize(store.getState()!), data);
    if (!saved.ok) throw new Error(saved.reason);
    const reloadStore = createStore(data, saved.state);
    const reloadCtx = { store: reloadStore, data } as AppContext;
    const reload = createFlow({ uiRoot, getContext: () => reloadCtx });
    reloadCtx.flow = reload;
    reload.go('titulo');
    reload.continueCampaign?.();
    expect(reload.current().params.id).toBe('moonToMars');
    flow.completeCinematic('moonToMars');
    reload.completeCinematic('moonToMars');
    reload.completeCinematic('moonToMars');
    expect(reload.current().scene).toBe('mision');
    expect(reloadStore.getState()).toEqual(store.getState());
    expect(reloadStore.getState()?.campaign.earthDaysRemaining).toBe(55);
  });

  it('keeps a scanned lunar beacon and rejects early portal activation', () => {
    const plan = MEDIA_PLAN.map((step) => step.day === 7 ? { ...step, actions: moonScan } : step);
    const moon = runPlan('media', plan, data).finalState;
    expect(moon.campaign.narrativeFlags.beaconMoon).toBe(true);
    expect(moon.campaign.clues).toContain('luna.column');
    const mars = accept(applyTransition(moon, 'luna->marte', data));
    expect(mars.campaign.manifest?.clues).toContain('luna.column');
    expect(portalRequirements(mars, data)).toEqual(['beaconMars', 'laboratory', 'victory']);
    const early = applyAction(mars, { type: 'ACTIVATE_BEACONS' }, data);
    expect(early.ok).toBe(false);
    expect(early.state).toBe(mars);
    expect(deserialize(serialize(mars), data)).toEqual({ ok: true, state: mars });
  });

  it('reaches the secret branch through both real maps, with Earth failure returning to the earned Mars victory', () => {
    const mars = runMars('media', true);
    expect(portalRequirements(mars, data)).toEqual([]);
    expect(mars.campaign.clueSignals?.marte).toEqual({ x: 10, y: 10, distance: 7 });
    for (const missing of ['beaconMoon', 'beaconMars', 'laboratory'] as const) {
      const locked = structuredClone(mars);
      if (missing === 'laboratory') {
        locked.mission.buildings = locked.mission.buildings.filter((b) => b.type !== 'laboratorio');
      } else {
        locked.campaign.narrativeFlags[missing] = false;
      }
      expect(portalRequirements(locked, data)).toEqual([missing]);
      expect(applyTransition(locked, 'marte->tierra', data)).toMatchObject({ ok: false, state: locked });
      expect(applyAction(locked, { type: 'ACTIVATE_BEACONS' }, data)).toMatchObject({ ok: false, state: locked });
    }
    const activated = accept(applyAction(mars, { type: 'ACTIVATE_BEACONS' }, data));
    const earth = accept(applyTransition(activated, 'marte->tierra', data));
    expect(accept(applyTransition(earth, 'marte->tierra', data))).toBe(earth);
    expect(deserialize(serialize(earth), data)).toEqual({ ok: true, state: earth });
    let failed = earth;
    while (failed.earth && !failed.earth.result) {
      failed = accept(applyAction(failed, { type: 'EARTH_END_SEASON', season: failed.earth.season }, data));
    }
    expect(failed.earth?.result).toMatchObject({ outcome: 'defeat', cause: 'plazo' });
    const returned = accept(applyTransition(failed, 'tierra->marte', data));
    expect(returned.earth).toBeUndefined();
    expect(returned.mission.result).toEqual(mars.mission.result);
    expect(returned.campaign.narrativeFlags.earthFailed).toBe(true);
    expect(returned.campaign.earthDaysRemaining).toBe(mars.campaign.earthDaysRemaining);
  });

  it('ends Mars on the Earth deadline and retries at the original arrival state', () => {
    const mars = accept(applyTransition(lunarVictory(), 'luna->marte', data));
    const lastDay = { ...mars, campaign: { ...mars.campaign, earthDaysRemaining: 1 } };
    const ended = accept(applyAction(lastDay, { type: 'END_DAY', day: 1 }, data));
    expect(ended.mission.result).toMatchObject({ outcome: 'defeat', cause: 'plazo', earthDaysRemaining: 0 });
    expect(accept(applyAction(ended, { type: 'RESTART_MISSION' }, data)).campaign.earthDaysRemaining).toBe(55);
  });

  it('counts an outage only after establishing a Mars link and enforces its hard-mode limit', () => {
    const finished = runMars('imposible');
    const state = structuredClone(finished);
    state.mission.result = null;
    state.mission.phase = 'planning';
    state.mission.buildings = state.mission.buildings.map((b) =>
      b.type === 'comunicaciones' ? { ...b, enabled: false } : b,
    );
    state.mission.linkOutageDays = 5;
    const ended = accept(applyAction(state, { type: 'END_DAY', day: state.mission.day }, data));
    expect(ended.mission.linkOutageDays).toBe(6);
    expect(ended.mission.result).toMatchObject({ outcome: 'defeat', cause: 'objetivos' });
  });
});
