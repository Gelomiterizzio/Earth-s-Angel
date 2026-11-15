// AI-assisted: OpenAI Codex. Original pixel art drawn on Canvas. Team review pending.
import { TILE_PX } from './art';

interface Facing { x: number; y: number }

const baseSuit = {
  outline: '#132039',
  sole: '#253d58',
  seam: '#45617c',
  shadow: '#7b96af',
  cloth: '#c6d5dc',
  light: '#fcf4d7',
  visorDark: '#123a64',
  visor: '#337cb3',
  glass: '#65dce0',
  glare: '#c0ffff',
};

const crewTrim = {
  commander: { trim: '#ffb75c', trimShadow: '#bd673e' },
  engineer: { trim: '#72e2db', trimShadow: '#338b93' },
  botanist: { trim: '#c1df80', trimShadow: '#688847' },
  medic: { trim: '#e8b0ff', trimShadow: '#a76eb4' },
  geologist: { trim: '#eeac91', trimShadow: '#9b5741' },
  radio: { trim: '#a8bcff', trimShadow: '#5b6eb1' },
};
export type SuitRole = keyof typeof crewTrim;
type PaintPixel = (color: string, x: number, y: number, width: number, height: number) => void;

function drawCrewGear(pixel: PaintPixel, role: SuitRole, facing: Facing, head: number): void {
  const { outline } = baseSuit;
  switch (role) {
    case 'commander': {
      const bill = facing.x ? head + 5 : head + 1;
      pixel(outline, head + 4, 1, 5, 1);
      pixel(outline, head + 2, 2, 9, 1);
      pixel(outline, head + 1, 3, 11, 2);
      pixel('#597eab', head + 4, 2, 5, 1);
      pixel('#345582', head + 2, 3, 9, 1);
      pixel('#c48147', head + 2, 4, 9, 1);
      pixel('#ffcc7c', head + 6, 3, 2, 1);
      pixel(outline, bill, 5, facing.x ? 9 : 11, 1);
      break;
    }
    case 'engineer': {
      // The open jaws sit above the shoulder and the handle runs down the pack.
      const wrench = facing.x ? 0 : 17;
      pixel(outline, wrench + 1, 7, 2, 5);
      pixel(outline, wrench + 5, 7, 2, 5);
      pixel(outline, wrench + 1, 10, 6, 3);
      pixel(outline, wrench + 3, 12, 4, 7);
      pixel('#a5c2cd', wrench + 2, 8, 1, 3);
      pixel('#a5c2cd', wrench + 5, 8, 1, 3);
      pixel('#d5e1df', wrench + 2, 11, 4, 1);
      pixel('#679099', wrench + 4, 12, 2, 5);
      pixel('#416674', wrench + 4, 17, 2, 1);

      pixel(outline, head + 5, 1, 3, 1);
      pixel(outline, head + 3, 2, 7, 1);
      pixel(outline, head + 1, 3, 11, 2);
      pixel('#ffc863', head + 3, 3, 7, 1);
      pixel('#d58a32', head + 2, 4, 9, 1);
      pixel('#fff1a3', head + 5, 2, 2, 2);
      if (facing.y >= 0) {
        const lamp = facing.x ? head + 9 : head + 5;
        pixel(outline, lamp - 1, 3, 5, 3);
        pixel('#75b7c8', lamp, 3, 3, 2);
        pixel('#efffd4', lamp + 1, 3, 1, 1);
      }
      break;
    }
    case 'botanist': {
      const brim = head - 2;
      pixel(outline, head + 4, 1, 5, 1);
      pixel(outline, head + 2, 2, 9, 2);
      pixel('#f3d498', head + 4, 2, 5, 1);
      pixel('#d7a76a', head + 3, 3, 7, 1);
      pixel('#688847', head + 3, 4, 7, 1);
      pixel(outline, brim, 4, 4, 2);
      pixel(outline, brim + 13, 4, 4, 2);
      pixel(outline, brim + 2, 5, 13, 2);
      pixel('#e2bb7d', brim + 1, 5, 15, 1);
      pixel('#90bf6d', head + 1, 2, 2, 1);
      pixel('#c1df80', head + 1, 1, 1, 1);
      if (facing.x || facing.y < 0) {
        const sample = facing.x ? 3 : 7;
        pixel(outline, sample, 11, 5, 6);
        pixel('#71975a', sample + 1, 12, 3, 3);
        pixel('#c1df80', sample + 2, 12, 1, 2);
        pixel('#c9a16a', sample + 1, 15, 3, 1);
      }
      break;
    }
    case 'medic': {
      const kit = facing.x ? 2 : facing.y < 0 ? 7 : 15;
      const y = facing.x ? 10 : facing.y < 0 ? 11 : 12;
      pixel(outline, kit + 3, y - 2, 4, 2);
      pixel('#b98fd8', kit + 4, y - 1, 2, 1);
      pixel(outline, kit, y, 9, 7);
      pixel('#c7a9e5', kit + 1, y + 1, 7, 5);
      pixel('#705586', kit + 1, y + 5, 7, 1);
      // A pulse trace identifies the kit even on a greyscale display.
      pixel('#362650', kit + 2, y + 3, 2, 1);
      pixel('#362650', kit + 4, y + 2, 1, 3);
      pixel('#362650', kit + 5, y + 3, 2, 1);
      pixel('#f2dafd', head + 4, 2, 5, 1);
      break;
    }
    case 'geologist': {
      const hammer = facing.x ? 2 : 17;
      pixel(outline, hammer + 2, 7, 3, 12);
      pixel('#cf8a65', hammer + 3, 9, 1, 9);
      pixel(outline, hammer, 7, 7, 4);
      pixel('#ebbc9a', hammer + 1, 8, 5, 2);
      break;
    }
    case 'radio': {
      const antenna = facing.x ? 2 : 17;
      pixel(outline, antenna + 1, 1, 3, 13);
      pixel('#bfcfff', antenna + 2, 2, 1, 9);
      pixel(outline, antenna, 10, 5, 6);
      pixel('#697cc7', antenna + 1, 11, 3, 4);
      pixel('#a3efff', antenna + 2, 12, 1, 1);
      break;
    }
  }
}

// Backward contact, passing pose, forward contact and push-off for each foot.
const gait = [
  { left: 2, right: -2, bob: 0 },
  { left: 1, right: -1, bob: -1 },
  { left: -1, right: 1, bob: -1 },
  { left: -2, right: 2, bob: 0 },
  { left: -2, right: 2, bob: 0 },
  { left: -1, right: 1, bob: -1 },
  { left: 1, right: -1, bob: -1 },
  { left: 2, right: -2, bob: 0 },
];
const neutral = { left: 0, right: 0, bob: 0 };
const FRAME_MS = 44;
const STEP_MS = 132;

export function drawAstronaut(
  g: CanvasRenderingContext2D,
  facing: Facing,
  frame = -1,
  role: SuitRole = 'commander',
): void {
  const suit = { ...baseSuit, ...crewTrim[role] };
  const { left, right, bob } = gait[frame] ?? neutral;
  g.clearRect(0, 0, TILE_PX, TILE_PX);
  const pixel = (color: string, x: number, y: number, w: number, h: number) => {
    g.fillStyle = color;
    g.fillRect(x, y, w, h);
  };

  pixel('#111c2e59', 5, 20, 14, 2);
  pixel('#111c2e38', 7, 22, 10, 1);
  if (frame === 0 || frame === 4) {
    const tail = facing.x > 0 ? 3 : facing.x < 0 ? 19 : frame === 0 ? 5 : 17;
    pixel('#dce0d487', tail, 21, 2, 1);
    pixel('#a6b4c36b', tail + 1, 19, 1, 1);
  }

  g.save();
  if (facing.x < 0) {
    g.translate(TILE_PX, 0);
    g.scale(-1, 1);
  }
  // Keep a clear pixel above the tallest headgear even at the top of the stride.
  g.translate(0, 1 + bob);

  if (facing.x) {
    // A side silhouette exposes both the helmet rim and the oxygen pack.
    pixel(suit.outline, 3, 8, 7, 10);
    pixel(suit.seam, 4, 9, 5, 8);
    pixel(suit.shadow, 4, 9, 3, 6);
    pixel(suit.cloth, 5, 9, 3, 2);
    pixel(suit.trimShadow, 4, 15, 4, 1);
    for (const [offset, near] of [[right, false], [left, true]] as const) {
      const x = 9 + offset;
      const y = near ? 17 : 16;
      pixel(suit.outline, x, y, 5, 5);
      pixel(near ? suit.cloth : suit.shadow, x + 1, y, 3, 3);
      pixel(suit.sole, x + 1, y + 3, 5, 2);
    }
    pixel(suit.outline, 7, 9, 9, 10);
    pixel(suit.cloth, 8, 11, 7, 6);
    pixel(suit.shadow, 8, 15, 7, 3);
    pixel(suit.trim, 9, 16, 5, 1);
    const glove = 12 - left;
    pixel(suit.outline, glove, 12, 5, 5);
    pixel(suit.shadow, glove + 1, 13, 3, 3);
    pixel(suit.light, glove + 2, 14, 3, 2);
  } else {
    for (const [x, offset] of [[7, left], [12, right]] as const) {
      const y = 17 + Math.sign(offset);
      pixel(suit.outline, x, y - 1, 5, 5);
      pixel(suit.cloth, x + 1, y - 1, 3, 3);
      pixel(suit.sole, x, y + 2, 5, 2);
      pixel(suit.seam, x + 1, y + 2, 3, 1);
    }
    const leftGlove = 12 - Math.sign(left);
    const rightGlove = 12 - Math.sign(right);
    pixel(suit.outline, 4, leftGlove, 4, 6);
    pixel(suit.cloth, 5, leftGlove, 2, 5);
    pixel(suit.outline, 16, rightGlove, 4, 6);
    pixel(suit.shadow, 17, rightGlove, 2, 5);
    pixel(suit.outline, 7, 9, 10, 10);
    pixel(suit.shadow, 8, 10, 8, 8);
    pixel(suit.cloth, 8, 10, 7, 6);
    if (facing.y < 0) {
      pixel(suit.seam, 8, 11, 8, 6);
      pixel(suit.cloth, 9, 11, 6, 5);
      pixel(suit.shadow, 10, 12, 4, 4);
      pixel(suit.glass, 11, 13, 2, 1);
      pixel(suit.trim, 9, 16, 6, 1);
    } else {
      pixel(suit.light, 8, 11, 4, 2);
      pixel(suit.seam, 11, 12, 3, 3);
      pixel(suit.trim, 12, 12, 1, 1);
      pixel(suit.trimShadow, 8, 16, 8, 2);
      pixel(suit.trim, 10, 16, 4, 1);
    }
  }

  // Stepped edges keep the helmet round and the highlight legible at tile scale.
  const head = facing.x ? 8 : 6;
  if (role === 'medic') {
    pixel(suit.outline, head + 5, 1, 3, 1);
    pixel(suit.outline, head + 3, 2, 7, 1);
    pixel(suit.outline, head + 2, 3, 9, 1);
    pixel(suit.light, head + 4, 3, 4, 1);
  }
  pixel(suit.outline, head + 1, 4, 11, 1);
  pixel(suit.outline, head, 5, 13, 5);
  pixel(suit.outline, head + 2, 10, 9, 2);
  pixel(suit.shadow, head + 1, 5, 11, 5);
  pixel(suit.cloth, head + 2, 4, 9, 5);
  pixel(suit.light, head + 2, 5, 3, 2);

  if (facing.y >= 0) {
    const visor = facing.x ? head + 6 : head + 2;
    const width = facing.x ? 7 : 9;
    pixel(suit.visorDark, visor, 5, width, 5);
    pixel(suit.visor, visor + 1, 5, width - 2, 4);
    pixel(suit.glass, visor + 1, 5, width - 3, 2);
    pixel(suit.glare, visor + 2, 5, 2, 1);
    pixel(suit.trim, head + 2, 10, 2, 1);
  } else {
    pixel(suit.seam, head + 7, 5, 3, 4);
    pixel(suit.trimShadow, head + 8, 5, 2, 2);
    pixel(suit.trim, head + 8, 5, 1, 1);
  }
  drawCrewGear(pixel, role, facing, head);
  g.restore();
}

export function createAstronautAnimation(canvas: HTMLCanvasElement, reducedMotion: () => boolean) {
  const g = canvas.getContext('2d');
  let facing: Facing = { x: 0, y: 1 };
  let frameRequest = 0;
  let start = 0;
  let until = 0;
  let firstFoot = 4;
  let role: SuitRole = 'commander';

  function draw(frame = -1) {
    if (g) drawAstronaut(g, facing, frame, role);
  }

  function rest() {
    cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    draw();
  }

  function paint(now: number) {
    if (!canvas.isConnected || canvas.closest('[hidden]') || reducedMotion() || now >= until) {
      rest();
      return;
    }
    draw((firstFoot + Math.floor((now - start) / FRAME_MS)) % gait.length);
    frameRequest = requestAnimationFrame(paint);
  }

  return {
    setRole(nextRole: SuitRole) {
      if (role === nextRole) return;
      role = nextRole;
      draw();
    },
    look(direction: Facing) {
      facing = direction;
      if (reducedMotion()) rest();
      else if (!frameRequest) draw();
    },
    step(direction: Facing) {
      facing = direction;
      if (reducedMotion()) { rest(); return; }
      const now = performance.now();
      until = now + STEP_MS;
      if (!frameRequest) {
        start = now;
        firstFoot = (firstFoot + 4) % gait.length;
        paint(now);
      }
    },
    rest,
  };
}
