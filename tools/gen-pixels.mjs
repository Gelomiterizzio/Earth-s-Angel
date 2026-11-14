// AI-assisted: Cursor Grok 4.7 and OpenAI Codex; Earth's Angel Integrante C
// One-shot pixel exporter. Not part of the game runtime.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { exportSpriteArt, exportIconArt } from './sprite-art.mjs';

const C = {
  none: [0, 0, 0, 0],
  bg: [11, 16, 38, 255],
  panel: [20, 27, 58, 255],
  text: [242, 244, 255, 255],
  dim: [184, 192, 230, 255],
  accent: [255, 209, 102, 255],
  focus: [125, 249, 255, 255],
  safe: [61, 220, 151, 255],
  warn: [255, 176, 32, 255],
  crit: [255, 90, 95, 255],
  moon: [142, 154, 175, 255],
  moonS: [74, 85, 104, 255],
  moonL: [221, 227, 238, 255],
  ice: [155, 231, 255, 255],
  mineral: [201, 162, 39, 255],
  crater: [45, 55, 72, 255],
  mars: [181, 83, 42, 255],
  marsS: [110, 47, 26, 255],
  marsL: [232, 168, 124, 255],
  dust: [217, 160, 102, 255],
  sky: [201, 123, 74, 255],
  ocean: [30, 111, 184, 255],
  crisis: [139, 94, 60, 255],
  recovery: [123, 211, 137, 255],
  forest: [46, 139, 87, 255],
  city: [154, 165, 177, 255],
  fog: [0, 0, 0, 178],
};

function png(w, h, pixels) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y += 1) {
    raw[(w * 4 + 1) * y] = 0;
    Buffer.from(pixels.buffer, pixels.byteOffset + y * w * 4, w * 4).copy(raw, (w * 4 + 1) * y + 1);
  }
  const crc = (buf) => zlib.crc32(buf);
  const chunk = (tag, data) => {
    const body = Buffer.concat([Buffer.from(tag), data]);
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc(body) >>> 0, 8 + data.length);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('tEXt', Buffer.from('Comment\0AI-generated pixel art with OpenAI Codex (Earth\'s Angel Integrante C)')),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function sheet(w, h) {
  const data = new Uint8Array(w * h * 4);
  const dot = (x, y, color) => {
    if (x < 0 || y < 0 || x >= w || y >= h || !color) return;
    const i = (y * w + x) * 4;
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
    data[i + 3] = color[3];
  };
  const fill = (x, y, rw, rh, color) => {
    for (let yy = y; yy < y + rh; yy += 1) for (let xx = x; xx < x + rw; xx += 1) dot(xx, yy, color);
  };
  return { data, fill, dot, w, h };
}

function save(rel, image) {
  const file = path.resolve('public/assets', rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png(image.w, image.h, image.data));
  console.log(rel, image.w, image.h);
}

function blit(dest, src, dx, dy) {
  for (let y = 0; y < src.h; y += 1) {
    for (let x = 0; x < src.w; x += 1) {
      const i = (y * src.w + x) * 4;
      if (src.data[i + 3] === 0) continue;
      dest.dot(dx + x, dy + y, [src.data[i], src.data[i + 1], src.data[i + 2], src.data[i + 3]]);
    }
  }
}

function join(frames, fw, fh) {
  const g = sheet(frames.length * fw, fh);
  frames.forEach((frame, index) => blit(g, frame, index * fw, 0));
  return g;
}

exportSpriteArt(C, sheet, join, save);
exportIconArt(C, sheet, join, save);

if (!process.argv.includes('--sprites')) {
  const { generateCinematicArt } = await import('./gen-cinematic-art.mjs');
  generateCinematicArt();
}

console.log('assets done');
