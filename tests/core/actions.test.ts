// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import { applyAction, createCampaign } from '../../src/core/index';
import type { BuildingType } from '../../src/core/types';
import { loadGameData } from '../../src/data/index';

const data = loadGameData();

function newMedia() {
  return createCampaign('media', 'EA-DEMO', data, { canonical: true });
}

describe('Construction actions (U-CON-01..10)', () => {
  it('U-CON-01: BUILD panel (4,4) succeeds, materials 34, ap 3, operationalFromDay 2', () => {
    const s = newMedia();
    const res = applyAction(s, { type: 'BUILD', building: 'panel', x: 4, y: 4 }, data);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.state.mission.resources.materiales).toBe(34);
    expect(res.state.mission.ap).toBe(3);
    expect(res.state.mission.buildings.at(-1)?.operationalFromDay).toBe(2);
  });

  it('U-CON-02: BUILD in report phase returns WRONG_PHASE and preserves state reference', () => {
    const s = newMedia();
    const inReport = { ...s, mission: { ...s.mission, phase: 'report' as const } };
    const res = applyAction(inReport, { type: 'BUILD', building: 'panel', x: 4, y: 4 }, data);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('WRONG_PHASE');
    expect(res.state).toBe(inReport);
  });

  it('U-CON-03: BUILD with unknown building type returns UNKNOWN_BUILDING', () => {
    const s = newMedia();
    const res = applyAction(
      s,
      { type: 'BUILD', building: 'falso' as BuildingType, x: 4, y: 4 },
      data,
    );
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('UNKNOWN_BUILDING');
    expect(res.state).toBe(s);
  });

  it('U-CON-04: BUILD deposito (4,4) on Luna returns NOT_AVAILABLE_IN_LEVEL', () => {
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
      { type: 'BUILD', building: 'deposito', x: 4, y: 4 },
      dataWithDeposito,
    );
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('NOT_AVAILABLE_IN_LEVEL');
    expect(res.state).toBe(s);
  });

  it('U-CON-05: BUILD panel (12,0) returns TILE_OUT_OF_BOUNDS', () => {
    const s = newMedia();
    const res = applyAction(s, { type: 'BUILD', building: 'panel', x: 12, y: 0 }, data);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('TILE_OUT_OF_BOUNDS');
    expect(res.state).toBe(s);
  });

  it('U-CON-06: BUILD panel (0,2) returns TILE_UNEXPLORED', () => {
    const s = newMedia();
    const res = applyAction(s, { type: 'BUILD', building: 'panel', x: 0, y: 2 }, data);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('TILE_UNEXPLORED');
    expect(res.state).toBe(s);
  });

  it('U-CON-07: BUILD extractor (4,4) returns WRONG_TERRAIN; BUILD panel (5,5) returns TILE_BLOCKED', () => {
    const s = newMedia();
    const res1 = applyAction(s, { type: 'BUILD', building: 'extractor', x: 4, y: 4 }, data);
    expect(res1.ok).toBe(false);
    if (!res1.ok) {
      expect(res1.error.code).toBe('WRONG_TERRAIN');
      expect(res1.state).toBe(s);
    }

    const res2 = applyAction(s, { type: 'BUILD', building: 'panel', x: 5, y: 5 }, data);
    expect(res2.ok).toBe(false);
    if (!res2.ok) {
      expect(res2.error.code).toBe('TILE_BLOCKED');
      expect(res2.state).toBe(s);
    }
  });

  it('U-CON-08: BUILD panel (4,4) twice returns TILE_OCCUPIED on the second call', () => {
    const s = newMedia();
    const first = applyAction(s, { type: 'BUILD', building: 'panel', x: 4, y: 4 }, data);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = applyAction(
      first.state,
      { type: 'BUILD', building: 'panel', x: 4, y: 4 },
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
    const r5 = applyAction(s5, { type: 'BUILD', building: 'panel', x: 4, y: 4 }, data);
    expect(r5.ok).toBe(false);
    if (!r5.ok) {
      expect(r5.error.code).toBe('NO_MATERIALS');
      expect(r5.state).toBe(s5);
    }

    const s6 = {
      ...s,
      mission: { ...s.mission, resources: { ...s.mission.resources, materiales: 6 } },
    };
    const r6 = applyAction(s6, { type: 'BUILD', building: 'panel', x: 4, y: 4 }, data);
    expect(r6.ok).toBe(true);
    if (r6.ok) {
      expect(r6.state.mission.resources.materiales).toBe(0);
    }
  });

  it('U-CON-10: ap 0 + BUILD panel returns NO_AP', () => {
    const s = newMedia();
    const s0 = { ...s, mission: { ...s.mission, ap: 0 } };
    const res = applyAction(s0, { type: 'BUILD', building: 'panel', x: 4, y: 4 }, data);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('NO_AP');
    expect(res.state).toBe(s0);
  });
});

describe('Exploration and Collection actions (U-EXP-01..05)', () => {
  it('U-EXP-01: EXPLORE (8,8) succeeds, ap 3, reveals 9 tiles including ice at (9,8) and (9,9)', () => {
    const s = newMedia();
    const res = applyAction(s, { type: 'EXPLORE', x: 8, y: 8 }, data);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.state.mission.ap).toBe(3);

    const evt = res.events.find((e) => e.type === 'tile/explored');
    expect(evt).toBeDefined();
    if (evt?.type === 'tile/explored') {
      expect(evt.revealed).toHaveLength(9);
      expect(evt.revealed).toContainEqual({ x: 9, y: 8, terrain: 'hielo' });
      expect(evt.revealed).toContainEqual({ x: 9, y: 9, terrain: 'hielo' });
    }
  });

  it('U-EXP-02: EXPLORE (4,4) returns ALREADY_EXPLORED', () => {
    const s = newMedia();
    const res = applyAction(s, { type: 'EXPLORE', x: 4, y: 4 }, data);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('ALREADY_EXPLORED');
    expect(res.state).toBe(s);
  });

  it('U-EXP-03: EXPLORE (10,10) returns NOT_ADJACENT', () => {
    const s = newMedia();
    const res = applyAction(s, { type: 'EXPLORE', x: 10, y: 10 }, data);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe('NOT_ADJACENT');
    expect(res.state).toBe(s);
  });

  it('U-EXP-04: with (1,5) explored, EXPLORE (0,5) succeeds and only reveals in-bounds tiles', () => {
    const s = newMedia();
    const e1 = applyAction(s, { type: 'EXPLORE', x: 2, y: 5 }, data);
    expect(e1.ok).toBe(true);
    if (!e1.ok) return;

    const e2 = applyAction(e1.state, { type: 'EXPLORE', x: 0, y: 5 }, data);
    expect(e2.ok).toBe(true);
    if (!e2.ok) return;

    const evt = e2.events.find((e) => e.type === 'tile/explored');
    expect(evt?.type === 'tile/explored' && evt.revealed.length).toBe(6);
    if (evt?.type === 'tile/explored') {
      expect(evt.revealed.every((t) => t.x >= 0 && t.x < 12 && t.y >= 0 && t.y < 12)).toBe(
        true,
      );
    }
  });

  it('U-EXP-05: COLLECT (3,7) -> materials 55, ap 3; second time -> NOTHING_TO_COLLECT; (4,4) -> NOTHING_TO_COLLECT; (1,8) -> TILE_UNEXPLORED', () => {
    const s = newMedia();
    const c1 = applyAction(s, { type: 'COLLECT', x: 3, y: 7 }, data);
    expect(c1.ok).toBe(true);
    if (!c1.ok) return;
    expect(c1.state.mission.resources.materiales).toBe(55);
    expect(c1.state.mission.ap).toBe(3);

    const c2 = applyAction(c1.state, { type: 'COLLECT', x: 3, y: 7 }, data);
    expect(c2.ok).toBe(false);
    if (!c2.ok) {
      expect(c2.error.code).toBe('NOTHING_TO_COLLECT');
      expect(c2.state).toBe(c1.state);
    }

    const c3 = applyAction(c1.state, { type: 'COLLECT', x: 4, y: 4 }, data);
    expect(c3.ok).toBe(false);
    if (!c3.ok) {
      expect(c3.error.code).toBe('NOTHING_TO_COLLECT');
      expect(c3.state).toBe(c1.state);
    }

    const c4 = applyAction(c1.state, { type: 'COLLECT', x: 1, y: 8 }, data);
    expect(c4.ok).toBe(false);
    if (!c4.ok) {
      expect(c4.error.code).toBe('TILE_UNEXPLORED');
      expect(c4.state).toBe(c1.state);
    }
  });
});
