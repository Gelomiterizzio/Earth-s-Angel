// AI-assisted: Antigravity (Gemini), reviewed by A

import { describe, expect, it } from 'vitest';
import { hashSeed, mulberry32 } from '../../src/core/rng';

describe('RNG determinism (U-RNG-01)', () => {
  it('U-RNG-01: two generators with same seed produce identical 100-number sequences; a different seed differs', () => {
    const genA = mulberry32(hashSeed('EA-SEED-TEST'));
    const genB = mulberry32(hashSeed('EA-SEED-TEST'));
    const genC = mulberry32(hashSeed('EA-OTHER-SEED'));

    const seqA = Array.from({ length: 100 }, () => genA());
    const seqB = Array.from({ length: 100 }, () => genB());
    const seqC = Array.from({ length: 100 }, () => genC());

    expect(seqA).toEqual(seqB);
    expect(seqA).not.toEqual(seqC);
  });
});
