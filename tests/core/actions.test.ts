// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import { applyAction, createCampaign, fixtureState, validateState } from '../../src/core/index';
import type { BuildingType } from '../../src/core/types';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();

function newMedia() {
  return createCampaign('media', 'EA-DEMO', data, { canonical: true });
}

describe('Construction actions (U-CON-01..10)', () => {
  it('U-CON-01: BUILD panel (24, 24) succeeds, materials 34, ap 3, operationalFromDay 2', () => {
    const s = newMedia();
    const res = applyAction(s, { type: 'BUILD', building: 'panel', x: 24, y: 24 }, data);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.state.mission.resources.materiales).toBe(34);
    expect(res.state.mission.ap).toBe(3);
    expect(res.state.mission.buildings.at(-1)?.operationalFromDay).toBe(2);
  });

  it('U-CON-02: BUILD in report phase returns WRONG_PHASE and preserves state reference', () => {
    const s = newMedia();
    const inReport = { ...s, mission: { ...s.mission, phase: 'report' as const } };
    const res = applyAction(inReport, { type: 'BUILD', building: 'panel', x: 24, y: 24 }, data);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('WRONG_PHASE');
    expect(res.state).toBe(inReport);
  });

  it('U-CON-03: BUILD with unknown building type returns UNKNOWN_BUILDING', () => {
    const s = newMedia();
    const res = applyAction(
      s,
      { type: 'BUILD', building: 'falso' as BuildingType, x: 24, y: 24 },
      data,
    );
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('UNKNOWN_BUILDING');
    expect(res.state).toBe(s);
  });

  it('U-CON-04: BUILD deposito (24, 24) on Luna returns NOT_AVAILABLE_IN_LEVEL', () => {
    const s = newMedia();
    const dataWithDeposito = {
      ...data,
      buildings: {
        ...data.buildings,
        deposito: {
          ...data.buildings.bateria,
          type: 'deposito' as const,
          levels: ['marte' as const],
        },
      },
    };
    const res = applyAction(
      s,
      { type: 'BUILD', building: 'deposito', x: 24, y: 24 },
      dataWithDeposito,
    );
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('NOT_AVAILABLE_IN_LEVEL');
    expect(res.state).toBe(s);
  });

  it('U-CON-05: BUILD just beyond the east boundary returns TILE_OUT_OF_BOUNDS', () => {
    const s = fixtureState('media-dia-1');
    const res = applyAction(s, { type: 'BUILD', building: 'panel', x: s.mission.map.width, y: 20 }, data);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('TILE_OUT_OF_BOUNDS');
    expect(res.state).toBe(s);
    const expanded = newMedia();
    expect(applyAction(expanded, {
      type: 'BUILD', building: 'panel', x: expanded.mission.map.width, y: 0,
    }, data)).toMatchObject({ ok: false, error: { code: 'TILE_OUT_OF_BOUNDS' } });
  });

  it('U-CON-06: BUILD panel (20, 22) returns TILE_UNEXPLORED', () => {
    const s = newMedia();
    const res = applyAction(s, { type: 'BUILD', building: 'panel', x: 20, y: 22 }, data);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('TILE_UNEXPLORED');
    expect(res.state).toBe(s);
  });

  it('U-CON-07: BUILD extractor (24, 24) returns WRONG_TERRAIN; BUILD panel (25, 25) returns TILE_BLOCKED', () => {
    const s = newMedia();
    const res1 = applyAction(s, { type: 'BUILD', building: 'extractor', x: 24, y: 24 }, data);
    expect(res1.ok).toBe(false);
    if (!res1.ok) {
      expect(res1.error.code).toBe('WRONG_TERRAIN');
      expect(res1.state).toBe(s);
    }

    const res2 = applyAction(s, { type: 'BUILD', building: 'panel', x: 25, y: 25 }, data);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe('TILE_BLOCKED');
      expect(res2.state).toBe(s);
    }
  });

  it('U-CON-08: BUILD panel (24, 24) twice returns TILE_OCCUPIED on the second call', () => {
    const s = newMedia();
    const first = applyAction(s, { type: 'BUILD', building: 'panel', x: 24, y: 24 }, data);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = applyAction(
      first.state,
      { type: 'BUILD', building: 'panel', x: 24, y: 24 },
      data,
    );
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error.code).toBe('TILE_OCCUPIED');
    expect(second.state).toBe(first.state);
  });

  it('U-CON-09: materials 5 + BUILD panel -> NO_MATERIALS; materials 6 + BUILD panel -> ok, materials 0', () => {
    const s = newMedia();
    const s5 = {
      ...s,
      mission: { ...s.mission, resources: { ...s.mission.resources, materiales: 5 } },
    };
    const r5 = applyAction(s5, { type: 'BUILD', building: 'panel', x: 24, y: 24 }, data);
    expect(r5.ok).toBe(false);
    if (!r5.ok) {
      expect(r5.error.code).toBe('NO_MATERIALS');
      expect(r5.state).toBe(s5);
    }

    const s6 = {
      ...s,
      mission: { ...s.mission, resources: { ...s.mission.resources, materiales: 6 } },
    };
    const r6 = applyAction(s6, { type: 'BUILD', building: 'panel', x: 24, y: 24 }, data);
    expect(r6.ok).toBe(true);
    if (r6.ok) {
      expect(r6.state.mission.resources.materiales).toBe(0);
    }
  });

  it('U-CON-10: ap 0 + BUILD panel returns NO_AP', () => {
    const s = newMedia();
    const s0 = { ...s, mission: { ...s.mission, ap: 0 } };
    const res = applyAction(s0, { type: 'BUILD', building: 'panel', x: 24, y: 24 }, data);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('NO_AP');
    expect(res.state).toBe(s0);
  });
});

describe('Exploration and Collection actions (U-EXP-01..05)', () => {
  it('U-EXP-01: EXPLORE (28, 28) succeeds, ap 3, reveals 9 tiles including ice at (29, 28) and (29, 29)', () => {
    const s = newMedia();
    const res = applyAction(s, { type: 'EXPLORE', x: 28, y: 28 }, data);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.state.mission.ap).toBe(3);

    const evt = res.events.find((e) => e.type === 'tile/explored');
    expect(evt).toBeDefined();
    if (evt?.type === 'tile/explored') {
      expect(evt.revealed).toHaveLength(9);
      expect(evt.revealed).toContainEqual({ x: 29, y: 28, terrain: 'hielo' });
      expect(evt.revealed).toContainEqual({ x: 29, y: 29, terrain: 'hielo' });
    }
  });

  it('U-EXP-02: EXPLORE (24, 24) returns ALREADY_EXPLORED', () => {
    const s = newMedia();
    const res = applyAction(s, { type: 'EXPLORE', x: 24, y: 24 }, data);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('ALREADY_EXPLORED');
    expect(res.state).toBe(s);
  });

  it('U-EXP-03: EXPLORE (30, 30) returns NOT_ADJACENT', () => {
    const s = newMedia();
    const res = applyAction(s, { type: 'EXPLORE', x: 30, y: 30 }, data);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('NOT_ADJACENT');
    expect(res.state).toBe(s);
  });

  it('U-EXP-04: with (1, 25) explored, EXPLORE (0, 25) on the map edge reveals only in-bounds tiles', () => {
    const s = newMedia();
    const { width, height } = s.mission.map;
    s.mission.map.tiles[25 * width + 1].explored = true;
    const e2 = applyAction(s, { type: 'EXPLORE', x: 0, y: 25 }, data);
    expect(e2.ok).toBe(true);
    if (!e2.ok) return;

    const evt = e2.events.find((e) => e.type === 'tile/explored');
    expect(evt?.type === 'tile/explored' && evt.revealed.length).toBe(6);
    if (evt?.type === 'tile/explored') {
      expect(evt.revealed.every((t) => t.x >= 0 && t.x < width && t.y >= 0 && t.y < height)).toBe(
        true,
      );
    }
  });

  it('U-EXP-05: COLLECT (23, 27) -> materials 55, ap 3; second time -> NOTHING_TO_COLLECT; (24, 24) -> NOTHING_TO_COLLECT; (21, 28) -> TILE_UNEXPLORED', () => {
    const s = newMedia();
    const c1 = applyAction(s, { type: 'COLLECT', x: 23, y: 27 }, data);
    expect(c1.ok).toBe(true);
    if (!c1.ok) return;
    expect(c1.state.mission.resources.materiales).toBe(55);
    expect(c1.state.mission.ap).toBe(3);

    const c2 = applyAction(c1.state, { type: 'COLLECT', x: 23, y: 27 }, data);
    expect(c2.ok).toBe(false);
    if (!c2.ok) {
      expect(c2.error.code).toBe('NOTHING_TO_COLLECT');
      expect(c2.state).toBe(c1.state);
    }

    const c3 = applyAction(c1.state, { type: 'COLLECT', x: 24, y: 24 }, data);
    expect(c3.ok).toBe(false);
    if (!c3.ok) {
      expect(c3.error.code).toBe('NOTHING_TO_COLLECT');
      expect(c3.state).toBe(c1.state);
    }

    const c4 = applyAction(c1.state, { type: 'COLLECT', x: 21, y: 28 }, data);
    expect(c4.ok).toBe(false);
    if (!c4.ok) {
      expect(c4.error.code).toBe('TILE_UNEXPLORED');
      expect(c4.state).toBe(c1.state);
    }
  });
});

describe('Building on collected mineral deposits', () => {
  it('rejects building on a mineral deposit, then allows it once the deposit is collected', () => {
    const s = fixtureState('media-dia-1');
    const before = applyAction(s, { type: 'BUILD', building: 'panel', x: 23, y: 27 }, data);
    expect(before).toMatchObject({ ok: false, error: { code: 'WRONG_TERRAIN' } });
    const collected = applyAction(s, { type: 'COLLECT', x: 23, y: 27 }, data);
    expect(collected.ok).toBe(true);
    if (!collected.ok) return;
    const built = applyAction(collected.state, { type: 'BUILD', building: 'panel', x: 23, y: 27 }, data);
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    expect(validateState(built.state, data)).toEqual([]);
  });
});
