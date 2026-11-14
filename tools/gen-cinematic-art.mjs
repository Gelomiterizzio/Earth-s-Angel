// AI-assisted: OpenAI Codex (GPT-6). Accepting team review is pending.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';

const assetRoot = fileURLToPath(new URL('../public/assets/', import.meta.url));
const palette = {
  space: 0x0b1026, navy: 0x141b3a, deep: 0x1e294b, muted: 0x2e3a6e,
  ink: 0x101829, white: 0xf2f4ff, silver: 0xdde3ee, grey: 0x8e9aaf,
  slate: 0x4a5568, crater: 0x2d3748, ice: 0x9be7ff, cyan: 0x7df9ff,
  ocean: 0x1e6fb8, shore: 0x3993bf, forest: 0x2e8b57, moss: 0x527d63,
  green: 0x7bd389, gold: 0xffd166, amber: 0xffb020, dust: 0xd9a066,
  earth: 0x8b5e3c, rust: 0xb5532a, darkRust: 0x6e2f1a, peach: 0xe8a87c,
  rose: 0xff866c, red: 0xff5a5f,
};
const P = palette;
const width = 320;
const height = 180;

const alphabet = {
  A: ['01110','10001','10001','11111','10001','10001','10001'],
  E: ['11111','10000','10000','11110','10000','10000','11111'],
  G: ['01111','10000','10000','10111','10001','10001','01111'],
  H: ['10001','10001','10001','11111','10001','10001','10001'],
  I: ['111','010','010','010','010','010','111'],
  L: ['10000','10000','10000','10000','10000','10000','11111'],
  N: ['10001','11001','11001','10101','10011','10011','10001'],
  R: ['11110','10001','10001','11110','10100','10010','10001'],
  S: ['01111','10000','10000','01110','00001','00001','11110'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  a: ['00000','00000','01110','00001','01111','10001','01111'],
  d: ['00001','00001','01111','10001','10001','10001','01111'],
  e: ['00000','00000','01110','10001','11111','10000','01111'],
  g: ['00000','01111','10001','10001','01111','00001','01110'],
  n: ['00000','00000','10110','11001','10001','10001','10001'],
  r: ['00000','00000','10110','11001','10000','10000','10000'],
  t: ['00100','00100','11111','00100','00100','00101','00010'],
  ' ': ['000'],
  '-': ['00000','00000','00000','11111','00000','00000','00000'],
  "'": ['11','01','10','00','00','00','00'],
};

class Raster {
  constructor(w = width, h = height, color) {
    this.w = w;
    this.h = h;
    this.pixels = new Uint8Array(w * h * 4);
    if (color !== undefined) this.rect(0, 0, w, h, color);
  }

  dot(x, y, color) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    const offset = (y * this.w + x) * 4;
    this.pixels[offset] = color >> 16;
    this.pixels[offset + 1] = color >> 8;
    this.pixels[offset + 2] = color;
    this.pixels[offset + 3] = 255;
  }

  rect(x, y, w, h, color) {
    const left = Math.max(0, Math.round(x));
    const top = Math.max(0, Math.round(y));
    const right = Math.min(this.w, Math.round(x + w));
    const bottom = Math.min(this.h, Math.round(y + h));
    for (let row = top; row < bottom; row += 1) {
      for (let col = left; col < right; col += 1) this.dot(col, row, color);
    }
  }

  ellipse(x, y, rx, ry, color) {
    for (let row = -Math.floor(ry); row <= ry; row += 1) {
      const extent = Math.floor(rx * Math.sqrt(1 - (row / ry) ** 2));
      this.rect(x - extent, y + row, 2 * extent + 1, 1, color);
    }
  }

  poly(points, color) {
    const ys = points.map(([, y]) => y);
    const top = Math.max(0, Math.ceil(Math.min(...ys)));
    const bottom = Math.min(this.h, Math.ceil(Math.max(...ys)));
    for (let row = top; row < bottom; row += 1) {
      const crossings = [];
      for (let i = 0; i < points.length; i += 1) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];
        if ((row >= y1 && row < y2) || (row >= y2 && row < y1)) {
          crossings.push(x1 + (row - y1) * (x2 - x1) / (y2 - y1));
        }
      }
      crossings.sort((a, b) => a - b);
      for (let i = 0; i < crossings.length; i += 2) {
        const left = Math.ceil(crossings[i]);
        this.rect(left, row, Math.ceil(crossings[i + 1]) - left, 1, color);
      }
    }
  }

  line(x1, y1, x2, y2, color, size = 1) {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))));
    for (let i = 0; i <= steps; i += 1) {
      this.rect(x1 + (x2 - x1) * i / steps, y1 + (y2 - y1) * i / steps, size, size, color);
    }
  }

  trace(points, color, size = 1) {
    points.slice(1).forEach(([x, y], index) => this.line(...points[index], x, y, color, size));
  }
}

function letteringWidth(message, size) {
  return (Array.from(message, (letter) => alphabet[letter][0].length + 1)
    .reduce((sum, length) => sum + length, 0) - 1) * size;
}

function lettering(frame, message, x, y, color, size) {
  for (const letter of message) {
    const rows = alphabet[letter];
    rows.forEach((row, rowIndex) => {
      for (let col = 0; col < row.length; col += 1) {
        if (row[col] === '1') frame.rect(x + col * size, y + rowIndex * size, size, size, color);
      }
    });
    x += (rows[0].length + 1) * size;
  }
}

function save(relativePath, frame, scale = 2) {
  const w = frame.w * scale;
  const h = frame.h * scale;
  const stride = w * 4 + 1;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y += 1) {
    const start = y * stride;
    raw[start] = y % scale === 0 ? 1 : 2;
    if (raw[start] === 2) continue;
    for (let x = 0; x < w; x += 1) {
      const source = (Math.floor(y / scale) * frame.w + Math.floor(x / scale)) * 4;
      const previous = x === 0 ? 0 : (Math.floor(y / scale) * frame.w + Math.floor((x - 1) / scale)) * 4;
      for (let channel = 0; channel < 4; channel += 1) {
        raw[start + 1 + x * 4 + channel] = frame.pixels[source + channel]
          - (x === 0 ? 0 : frame.pixels[previous + channel]);
      }
    }
  }
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const header = Buffer.alloc(4);
    header.writeUInt32BE(data.length);
    const check = Buffer.alloc(4);
    check.writeUInt32BE(crc32(body));
    return Buffer.concat([header, body, check]);
  };
  const info = Buffer.alloc(13);
  info.writeUInt32BE(w);
  info.writeUInt32BE(h, 4);
  info[8] = 8;
  info[9] = 6;
  const provenance = Buffer.from('Comment\0AI-assisted artwork drawn in JavaScript with OpenAI Codex (GPT-6)');
  fs.writeFileSync(path.join(assetRoot, relativePath), Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', info), chunk('tEXt', provenance),
    chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]));
}

function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
}

function starfield(frame, seed, horizon = height, count = 110) {
  const rand = random(seed);
  for (let i = 0; i < count; i += 1) {
    const x = Math.floor(rand() * width);
    const y = Math.floor(rand() * horizon);
    const color = i % 13 === 0 ? P.silver : i % 5 === 0 ? P.grey : P.muted;
    frame.dot(x, y, color);
    if (i % 23 === 0) {
      frame.line(x - 2, y, x + 2, y, color);
      frame.line(x, y - 2, x, y + 2, color);
      frame.dot(x, y, P.white);
    }
  }
}

function atmosphere(frame, colors, horizon) {
  colors.forEach((color, index) => {
    const y = Math.floor(horizon * index / colors.length);
    const end = Math.ceil(horizon * (index + 1) / colors.length);
    frame.rect(0, y, width, end - y, color);
  });
}

function clouds(frame, seed, y, color, count = 14) {
  const rand = random(seed);
  for (let i = 0; i < count; i += 1) {
    const x = rand() * width;
    const span = 10 + rand() * 60;
    const level = y + rand() * 37;
    frame.line(x, level, x + span, level, color);
    frame.line(x + span * 0.35, level - 1, x + span * 0.73, level - 1, color);
  }
}

const ridgeShape = [[0,8],[11,3],[21,6],[41,0],[64,15],[88,11],[101,17],[123,5],
  [146,0],[163,18],[188,23],[213,7],[241,16],[255,4],[287,1],[302,13],[320,11]];

function ridge(frame, y, color, seed, heightFactor = 1) {
  const rand = random(seed);
  const points = ridgeShape.map(([x, rise]) => [x, Math.round(y + (rise - rand() * 20) * heightFactor)]);
  frame.poly([...points, [width, height], [0, height]], color);
}

function globe(frame, cx, cy, radius, planet = 'earth') {
  const colors = {
    earth: [0x18284f, 0x205186, P.ocean, P.shore, P.ice],
    moon: [P.ink, P.crater, P.slate, P.grey, P.silver],
    mars: [0x472736, P.darkRust, P.rust, P.peach, P.gold],
  }[planet];
  for (let y = -radius; y <= radius; y += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      const r = (x * x + y * y) / (radius * radius);
      if (r > 1) continue;
      const light = Math.sqrt(1 - r) - (x * 0.65 + y * 0.8) / radius;
      const shade = light > 1.06 ? 3 : light > 0.55 ? 2 : light > 0.25 ? 1 : 0;
      const rim = r > 1 - 2.5 / radius && light > 0.6;
      frame.dot(cx + x, cy + y, colors[rim ? 4 : shade]);
    }
  }
  const fit = (points) => points.map(([x, y]) => [cx + x * radius, cy + y * radius]);
  if (planet === 'earth') {
    frame.poly(fit([[-.77,-.53],[-.55,-.67],[-.36,-.64],[-.27,-.74],[-.08,-.65],
      [-.11,-.49],[-.3,-.42],[-.24,-.26],[-.37,-.14],[-.54,-.24],[-.57,-.4]]), P.forest);
    frame.poly(fit([[-.5,-.26],[-.39,-.18],[-.33,-.07],[-.17,-.02],[-.05,.14],
      [-.18,.36],[-.34,.6],[-.38,.41],[-.32,.22],[-.39,.1]]), P.moss);
    frame.poly(fit([[.04,-.79],[.19,-.85],[.4,-.79],[.49,-.67],[.63,-.59],
      [.77,-.47],[.69,-.33],[.53,-.35],[.42,-.21],[.26,-.34],[.15,-.33],
      [.17,-.49],[-.01,-.53]]), P.forest);
    frame.poly(fit([[.24,-.3],[.48,-.24],[.5,-.01],[.42,.2],[.29,.41],[.2,.22],[.13,-.06]]), P.forest);
    frame.poly(fit([[-.68,-.55],[-.5,-.59],[-.32,-.54],[-.42,-.4],[-.57,-.36]]), P.green);
    frame.poly(fit([[.13,-.69],[.32,-.68],[.48,-.59],[.47,-.46],[.27,-.51],[.16,-.52]]), P.green);
    frame.poly(fit([[.67,.28],[.81,.36],[.79,.48],[.65,.55],[.56,.42]]), 0x374d55);
    frame.trace(fit([[-.79,-.32],[-.67,-.35],[-.43,-.39],[-.22,-.4],[.02,-.32]]), 0xa7d2db, Math.max(1, radius / 33));
    frame.trace(fit([[-.59,.11],[-.41,.12],[-.1,.17],[.08,.25],[.3,.21]]), 0x9bd8e7, Math.max(1, radius / 41));
    frame.trace(fit([[-.35,.84],[-.18,.89],[.02,.91],[.22,.87]]), 0x6f98ad);
  } else {
    const spots = [[-.49,-.24,.16], [.17,-.36,.22], [.32,.14,.27], [-.34,.43,.19]];
    spots.forEach(([x, y, size], index) => {
      const xx = cx + x * radius;
      const yy = cy + y * radius;
      frame.ellipse(xx, yy, size * radius, Math.max(1, size * radius * .43), colors[index < 2 ? 2 : 0]);
    });
  }
}

function terrain(frame, seed, mars, horizon = 110) {
  const colors = mars
    ? [0x873e35, 0xa24a37, 0xc16747, 0xac5135, 0xe39562, P.darkRust]
    : [0x273043, 0x4b586b, 0x727f94, 0x58657a, 0xa7b5c8, P.crater];
  ridge(frame, horizon - 13, colors[0], seed, 1.15);
  ridge(frame, horizon + 1, colors[1], seed + 4, .78);
  frame.poly([[0,horizon + 24],[58,horizon + 17],[133,horizon + 24],[228,horizon + 15],
    [320,horizon + 21],[320,180],[0,180]], colors[2]);
  frame.poly([[0,horizon + 47],[82,horizon + 41],[169,horizon + 53],[232,horizon + 43],
    [320,horizon + 48],[320,180],[0,180]], colors[3]);
  const rand = random(seed);
  for (let i = 0; i < 110; i += 1) {
    const y = horizon + 24 + rand() * (height - horizon - 24);
    const x = rand() * width;
    const size = Math.floor(1 + rand() * (y - horizon) / 10);
    frame.rect(x, y, size, 1, i % 4 === 0 ? colors[4] : colors[1]);
    if (i % 17 === 0) {
      frame.poly([[x - size,y + 1],[x - size / 2,y - size / 2],[x + size / 4,y - size],
        [x + size,y + 1],[x + size * 2,y + 3]], colors[5]);
      frame.line(x - size / 2, y - size / 2, x + size / 4, y - size, colors[4]);
    }
  }
}

function marsSky(frame, seed) {
  atmosphere(frame, [0x45263b, 0x62323e, 0x8c493f, P.rust, 0xc97652, P.peach], 142);
  clouds(frame, seed, 63, 0x985846);
  clouds(frame, seed + 5, 88, 0xe19060);
}

function detail(frame, x, y, scale, shape) {
  const point = ([dx, dy]) => [x + dx * scale, y + dy * scale];
  shape({
    poly(points, color) { frame.poly(points.map(point), color); },
    rect(dx, dy, w, h, color) { frame.rect(x + dx * scale, y + dy * scale, w * scale, h * scale, color); },
    ellipse(dx, dy, rx, ry, color) { frame.ellipse(x + dx * scale, y + dy * scale, rx * scale, ry * scale, color); },
    line(from, to, color, size = 1) { frame.line(...point(from), ...point(to), color, Math.max(1, size * scale)); },
  });
}

function lander(frame, x, y, scale, launched = false) {
  detail(frame, x, y, scale, ({poly, rect, ellipse, line}) => {
    if (launched) {
      poly([[-10,-10],[10,-10],[8,4],[3,26],[0,39],[-3,26],[-8,4]], P.rose);
      poly([[-6,-10],[6,-10],[2,17],[0,28],[-2,17]], P.gold);
      poly([[-3,-11],[3,-11],[0,15]], P.white);
    } else {
      ellipse(2, 1, 31, 6, P.crater);
      line([-13,-21],[-26,-1], P.ink, 4);
      line([11,-21],[23,-1], P.ink, 4);
      line([-13,-19],[-25,-2], P.grey, 1);
      line([13,-19],[23,-2], P.grey, 1);
      rect(-31, -2, 12, 3, P.silver);
      rect(19, -2, 12, 3, P.grey);
    }
    poly([[-8,-63],[0,-71],[8,-63],[16,-47],[21,-38],[21,-23],[13,-13],
      [-13,-13],[-21,-24],[-21,-38],[-15,-49]], P.ink);
    poly([[-7,-62],[0,-68],[6,-61],[14,-45],[17,-29],[10,-18],
      [-12,-18],[-17,-28],[-17,-39]], P.silver);
    poly([[0,-68],[6,-61],[14,-45],[17,-29],[10,-18],[0,-18],[4,-45]], P.grey);
    poly([[-18,-42],[-12,-48],[8,-48],[15,-43],[11,-35],[-14,-35]], P.navy);
    poly([[-15,-42],[-10,-46],[6,-46],[9,-43],[-7,-40],[-14,-40]], P.ice);
    line([-14,-32],[13,-32], P.gold, 2);
    poly([[-20,-34],[-15,-28],[-11,-15],[-22,-16],[-28,-20],[-26,-28]], P.slate);
    poly([[21,-34],[26,-28],[28,-20],[22,-16],[12,-15],[16,-28]], P.slate);
    rect(-24, -21, 6, 2, P.gold);
    rect(18, -21, 6, 2, P.amber);
    rect(-10, -15, 20, 4, P.ink);
  });
}

function astronaut(frame, x, y, scale, stripe, celebrate = false) {
  detail(frame, x, y, scale, ({poly, rect, ellipse, line}) => {
    ellipse(1, 0, 12, 3, P.crater);
    rect(-8, -16, 6, 16, P.ink);
    rect(2, -16, 6, 16, P.ink);
    rect(-7, -12, 4, 9, P.grey);
    rect(3, -12, 4, 9, P.slate);
    poly([[-9,-25],[-6,-28],[6,-28],[9,-25],[8,-10],[4,-8],[-5,-8],[-8,-12]], P.ink);
    line([-9,-23], [-14,celebrate ? -35 : -12], P.grey, 4);
    line([7,-23], [12,celebrate ? -36 : -12], P.slate, 4);
    line([-14,celebrate ? -36 : -12],[-13,celebrate ? -36 : -11], P.silver, 3);
    line([12,celebrate ? -37 : -13],[13,celebrate ? -37 : -12], P.grey, 3);
    rect(-6, -24, 12, 11, P.grey);
    rect(-6, -23, 3, 8, P.silver);
    rect(-4, -23, 8, 3, stripe);
    rect(2, -19, 3, 5, P.slate);
    ellipse(0, -32, 9, 8, P.ink);
    ellipse(0, -33, 8, 7, P.silver);
    if (celebrate) {
      poly([[-8,-31],[-5,-35],[4,-35],[8,-31],[5,-26],[-4,-26]], P.navy);
      line([-5,-33],[2,-34], P.ice);
    } else {
      poly([[-8,-34],[-5,-38],[4,-38],[7,-35],[7,-30],[4,-28],[-5,-28],[-8,-31]], P.grey);
      line([-7,-34],[-4,-37], P.white, 2);
      line([-4,-33],[2,-33], P.silver, 2);
      line([-7,-30],[-6,-28], P.ice);
      line([5,-28],[7,-30], P.slate, 2);
    }
  });
}

function panel(frame, x, y, scale) {
  detail(frame, x, y, scale, ({poly, rect, ellipse, line}) => {
    ellipse(0, 1, 20, 3, P.crater);
    rect(-3, -12, 6, 12, P.grey);
    poly([[-20,-6],[-13,-22],[22,-22],[15,-6]], P.ink);
    poly([[-17,-8],[-12,-20],[19,-20],[13,-8]], P.ocean);
    line([-13,-14],[15,-14], P.ice);
    for (const tick of [-6, 2, 10]) line([tick,-20],[tick - 5,-8], P.deep);
  });
}

function dome(frame, x, y, scale, warm = false) {
  detail(frame, x, y, scale, ({poly, rect, ellipse, line}) => {
    ellipse(2, 2, 28, 4, P.crater);
    poly([[-23,-7],[-22,-18],[-16,-25],[-8,-29],[8,-29],[17,-24],[22,-17],[24,-7]], P.ink);
    poly([[-20,-7],[-18,-17],[-13,-23],[-7,-26],[7,-26],[15,-22],[19,-16],[21,-7]], warm ? 0x519d91 : 0x36798b);
    poly([[-15,-8],[-13,-16],[-10,-20],[-8,-21],[-7,-8]], P.green);
    poly([[-5,-8],[-5,-14],[0,-19],[3,-15],[3,-8]], P.forest);
    poly([[6,-8],[8,-15],[15,-17],[17,-8]], P.green);
    line([-20,-12],[19,-12], P.ice);
    line([-5,-26],[-10,-8], P.silver);
    line([7,-26],[12,-8], P.grey);
    rect(-23, -6, 48, 7, P.grey);
    rect(-21, -6, 46, 2, P.silver);
    rect(3, -4, 12, 3, P.slate);
  });
}

function station(frame, x, y, scale, color = P.ice) {
  detail(frame, x, y, scale, ({poly, rect, ellipse, line}) => {
    ellipse(5, 0, 27, 5, P.crater);
    poly([[-24,-2],[-24,-16],[-17,-25],[15,-25],[25,-16],[25,-2]], P.ink);
    poly([[-22,-4],[-22,-15],[-16,-23],[13,-23],[22,-15],[22,-4]], P.grey);
    poly([[-22,-14],[-15,-22],[13,-22],[19,-14]], P.silver);
    rect(-20, -12, 40, 7, P.slate);
    rect(-16, -11, 13, 4, color);
    rect(5, -13, 10, 9, P.ink);
    line([5,-13],[15,-13], P.grey);
    rect(-18, -1, 36, 2, P.ink);
  });
}

function antenna(frame, x, y, scale) {
  detail(frame, x, y, scale, ({poly, rect, ellipse, line}) => {
    ellipse(1, 0, 13, 3, P.crater);
    rect(-1, -27, 3, 28, P.grey);
    line([-1,-7],[-9,0], P.silver);
    line([2,-7],[10,0], P.silver);
    poly([[-15,-36],[-9,-26],[-3,-22],[5,-22],[11,-25],[15,-32]], P.ink);
    poly([[-12,-34],[-5,-25],[2,-23],[9,-26],[13,-31]], P.silver);
    line([-1,-28],[4,-39], P.grey, 2);
    rect(4, -40, 2, 2, P.gold);
  });
}

function flight(frame, x, y) {
  frame.trace([[50,143],[94,128],[130,115],[175,90],[216,69],[258,51],[291,47]], P.muted);
  for (const [xx, yy] of [[73,136],[111,122],[147,106],[190,82],[231,62],[267,50]]) {
    frame.rect(xx, yy, 4, 2, P.ice);
  }
  const sprite = new Raster(48, 80);
  lander(sprite, 24, 52, .69, true);
  const angle = Math.PI * .33;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let dy = -42; dy <= 42; dy += 1) {
    for (let dx = -52; dx <= 52; dx += 1) {
      const sampleX = Math.round(24 + dx * cos + dy * sin);
      const sampleY = Math.round(32 - dx * sin + dy * cos);
      if (sampleX < 0 || sampleX >= sprite.w || sampleY < 0 || sampleY >= sprite.h) continue;
      const index = (sampleY * sprite.w + sampleX) * 4;
      if (sprite.pixels[index + 3] === 0) continue;
      const [r, g, b] = sprite.pixels.subarray(index, index + 3);
      frame.dot(x + dx, y + dy, (r << 16) | (g << 8) | b);
    }
  }
}

function trees(frame, seed, y, living, count, start = 0, end = width) {
  const rand = random(seed);
  for (let i = 0; i < count; i += 1) {
    const x = start + rand() * (end - start);
    const base = y + rand() * 22;
    const size = 4 + rand() * 12;
    frame.line(x, base - size, x, base, living ? 0x334d43 : 0x594340, size * .14);
    if (living) {
      frame.poly([[x - size * .47,base - 3],[x,base - size],[x + size * .52,base - 3]],
        i % 3 === 0 ? P.moss : P.forest);
      frame.poly([[x - size * .36,base - 5],[x,base - size],[x,base - 4]], 0x70aa7d);
    } else {
      frame.line(x, base - size * .4, x - size * .28, base - size * .65, 0x594340);
      frame.line(x, base - size * .56, x + size * .28, base - size * .88, 0x594340);
    }
  }
}

function riverValley({distressed = false, restoration = 0, earlyDamage = false} = {}) {
  const frame = new Raster();
  const sky = distressed ? [0x464758, 0x676072, 0x986f69, 0xc3846b, 0xddac86]
    : [0x344465, 0x465f7f, 0x6297a7, 0x87aebe, 0xb6d1ba];
  atmosphere(frame, sky, 138);
  frame.ellipse(242, 66, 17, 17, distressed ? 0xeaa982 : 0xffe5ac);
  clouds(frame, 11, 42, distressed ? 0xa78480 : 0xa1c5c4);
  ridge(frame, 84, distressed ? 0x62575a : 0x556e84, 29, 1.2);
  ridge(frame, 102, distressed ? 0x74676a : 0x68858a, 71, .92);
  ridge(frame, 113, distressed ? 0x936d5a : 0x51745f, 39, .57);
  frame.poly([[0,124],[53,119],[126,132],[157,114],[215,123],[320,129],[320,180],[0,180]],
    distressed ? 0xa58260 : 0x63956c);
  frame.poly([[130,125],[165,119],[181,126],[162,137],[105,144],[102,154],
    [173,167],[212,180],[93,180],[67,161],[70,143],[133,135],[154,128]],
    distressed ? 0xc59d7a : 0x82b47c);
  const narrow = distressed || earlyDamage;
  frame.poly(narrow
    ? [[162,123],[168,123],[176,127],[158,136],[103,145],[98,151],[116,157],
      [172,170],[192,180],[164,180],[137,170],[93,157],[86,148],[94,143],[151,133],[166,127]]
    : [[160,122],[171,122],[181,127],[160,139],[108,147],[107,152],[166,163],
      [221,180],[109,180],[73,163],[72,147],[87,140],[148,132],[165,127]],
    distressed ? 0x617f88 : P.ocean);
  frame.trace(narrow
    ? [[166,126],[154,134],[100,146],[94,151],[110,156],[166,171]]
    : [[171,126],[154,134],[101,144],[84,152],[103,161],[150,174],[170,180]],
    distressed ? 0xa5a7a0 : P.ice);
  trees(frame, 83, 121, !distressed, distressed ? 11 : 36 + restoration * 8, 3, 71);
  trees(frame, 43, 123, !distressed, distressed ? 10 : 46 + restoration * 8, 190, 315);
  if (distressed || earlyDamage) {
    frame.trace([[25,165],[37,158],[43,160],[46,166],[57,171]], 0x85594c);
    frame.trace([[259,156],[255,160],[263,166],[252,173]], 0x85594c);
  }
  return frame;
}

function city(recovered = false) {
  const frame = new Raster();
  atmosphere(frame, recovered
    ? [0x273e68,0x385b83,0x597d9a,0x8ca4b0,0xe2bd9b]
    : [P.space,0x18182e,0x252437,0x42334b,0x66465b], 140);
  starfield(frame, 40, 72, 41);
  ridge(frame, 105, recovered ? 0x566d7d : 0x39394c, 2, .9);
  const rand = random(42);
  for (let level = 0; level < 2; level += 1) {
    for (let x = -3; x < width; x += 10 + Math.floor(rand() * 10)) {
      const w = 10 + Math.floor(rand() * 12);
      const h = 12 + Math.floor(rand() * (level === 0 ? 26 : 49));
      const base = 122 + level * 19;
      const top = base - h;
      const wall = recovered ? [0x4c5f73,0x384f65][level] : [0x252a40,0x191e33][level];
      frame.rect(x, top, w, h, wall);
      frame.rect(x, top, w - 2, 2, recovered ? 0x768b9a : 0x414258);
      frame.rect(x + w - 3, top + 1, 3, h, recovered ? 0x344458 : P.space);
      if (rand() < .45) frame.rect(x + 1, top - 4, w - 4, 4, wall);
      for (let row = top + 6; row < base - 6; row += 5) {
        for (let col = x + 3; col < x + w - 3; col += 4) {
          const light = rand();
          frame.rect(col, row, 2, 2, light < (recovered ? .75 : .07) ? P.gold : P.deep);
        }
      }
    }
  }
  frame.poly([[0,142],[174,137],[320,145],[320,180],[0,180]], recovered ? 0x415f62 : 0x27283a);
  if (recovered) {
    frame.poly([[0,163],[206,151],[228,153],[72,180],[0,180]], 0x3b7480);
    frame.trace([[0,168],[106,160],[197,155]], 0x65a7aa);
    trees(frame, 5, 139, true, 26, 0, 118);
    trees(frame, 19, 144, true, 22, 224, 320);
  } else {
    frame.poly([[0,168],[81,149],[151,151],[94,180],[0,180]], 0x393447);
    frame.rect(49, 153, 49, 6, P.slate);
    frame.rect(51, 151, 45, 3, P.grey);
    frame.rect(69, 141, 8, 11, P.slate);
    frame.trace([[72,142],[74,138],[78,141]], P.ice);
    for (const [x, y, size] of [[220,172,1.05],[193,168,.92],[171,165,.83],[151,162,.76],[134,160,.71]]) {
      frame.ellipse(x, y, 6 * size, 2 * size, P.ink);
      frame.ellipse(x, y - 20 * size, 4 * size, 5 * size, P.ink);
      frame.poly([[x-4*size,y-16*size],[x+3*size,y-16*size],[x+6*size,y-7*size],
        [x+4*size,y],[x-4*size,y],[x-5*size,y-7*size]], P.ink);
      frame.line(x - 4 * size, y - 13 * size, x - 5 * size, y - 4 * size, P.slate);
    }
  }
  return frame;
}

function briefing(celebrate = false) {
  const frame = new Raster(width, height, P.ink);
  frame.poly([[0,34],[43,15],[277,15],[320,34],[320,140],[0,140]], P.deep);
  frame.poly([[0,143],[59,122],[261,122],[320,144],[320,180],[0,180]], P.navy);
  frame.trace([[0,33],[43,15],[277,15],[320,33]], P.slate, 2);
  frame.trace([[0,145],[45,125],[274,125],[320,146]], P.muted, 2);
  for (const x of [21, 27, 291, 297]) {
    frame.rect(x, 50, 2, 50, P.muted);
    frame.rect(x, 66, 2, 20, P.ice);
  }
  frame.rect(65, 29, 192, 77, P.ink);
  frame.rect(67, 31, 188, 73, 0x24506a);
  frame.rect(69, 33, 184, 69, P.space);
  if (celebrate) {
    const view = new Raster(width, height, P.space);
    starfield(view, 183, 74);
    terrain(view, 3, false, 74);
    globe(view, 203, 52, 11, 'earth');
    for (let y = 33; y < 102; y += 1) {
      const from = 4 * (y * width + 69);
      frame.pixels.set(view.pixels.subarray(from, from + 184 * 4), from);
    }
    frame.rect(164, 33, 2, 69, P.slate);
  } else {
    for (let x = 76; x < 252; x += 11) frame.rect(x, 35, 1, 65, P.navy);
    for (let y = 40; y < 100; y += 10) frame.rect(72, y, 178, 1, P.navy);
    globe(frame, 97, 74, 15, 'earth');
    globe(frame, 154, 60, 11, 'moon');
    globe(frame, 222, 72, 15, 'mars');
    frame.trace([[113,70],[125,64],[139,60]], P.ice);
    frame.trace([[170,58],[188,59],[205,67]], P.dust);
    for (const [x, y] of [[124,64],[188,59]]) frame.ellipse(x, y, 2, 2, P.gold);
  }
  frame.poly([[83,114],[238,114],[267,138],[53,138]], P.slate);
  frame.poly([[84,115],[236,115],[251,130],[69,130]], 0x35445e);
  frame.poly([[127,119],[192,119],[205,127],[115,127]], 0x256278);
  frame.line(118, 128, 203, 128, P.ice);
  frame.rect(53, 139, 214, 4, P.ink);
  const crew = [[66,162,1.11,P.gold],[126,173,1.24,P.ice],
    [197,173,1.24,P.green],[259,162,1.11,P.red]];
  for (const [x, y, scale, stripe] of crew) astronaut(frame, x, y, scale, stripe, celebrate);
  return frame;
}

function launch() {
  const frame = new Raster();
  atmosphere(frame, [0x333556,0x615574,0x8f6171,0xc17a72,0xe58e71,0xf4b180], 149);
  starfield(frame, 2, 38, 25);
  clouds(frame, 19, 72, 0xd29280);
  frame.ellipse(218, 110, 27, 27, 0xffcf94);
  ridge(frame, 134, 0x6b4b61, 11, 1.24);
  ridge(frame, 149, 0x514152, 83, .7);
  frame.poly([[71,180],[83,81],[100,81],[114,180],[103,180],[92,98],[82,180]], 0x374052);
  for (const y of [96,112,128,144,160]) {
    frame.line(87, y, 98, y + 15, P.slate, 2);
    frame.line(98, y, 83, y + 15, P.slate, 2);
  }
  frame.rect(97, 103, 44, 4, 0x4b4a60);
  for (const [x, y, rx, ry] of [[148,155,20,11],[167,149,21,18],[190,162,34,17],[127,165,27,10],
    [214,171,24,11],[101,177,32,10]]) {
    frame.ellipse(x, y, rx, ry, 0xd58373);
    frame.ellipse(x - 2, y - 3, rx * .75, ry * .55, 0xf3b690);
  }
  lander(frame, 166, 108, 1.04, true);
  return frame;
}

function arrival(mars = false) {
  const frame = new Raster(width, height, P.space);
  if (mars) {
    marsSky(frame, 122);
    frame.ellipse(263, 69, 18, 18, 0xefbb89);
    clouds(frame, 18, 115, 0xd1835c, 12);
  } else {
    starfield(frame, 9);
    globe(frame, 234, 67, 21, 'earth');
  }
  terrain(frame, mars ? 45 : 21, mars, 101);
  lander(frame, 143, 151, 1.25);
  astronaut(frame, 183, 159, .68, P.gold);
  astronaut(frame, 205, 164, .54, P.ice);
  const groundLight = mars ? P.dust : P.grey;
  frame.trace([[21,164],[44,159],[77,158]], groundLight);
  frame.trace([[245,155],[272,150],[316,150]], groundLight);
  return frame;
}

function outpost(mars = false) {
  const frame = new Raster(width, height, P.space);
  if (mars) {
    marsSky(frame, 181);
    frame.ellipse(65, 88, 15, 15, 0xf0b98e);
  } else {
    starfield(frame, 78);
    globe(frame, 63, 68, 19, 'earth');
  }
  terrain(frame, mars ? 51 : 147, mars, 106);
  const route = mars ? 0xe59263 : P.grey;
  frame.trace([[29,161],[88,156],[144,150],[220,158],[271,152]], route, 2);
  panel(frame, 45, 148, .76);
  panel(frame, 79, 157, .92);
  station(frame, 109, 136, .74, P.gold);
  station(frame, 148, 152, 1.14);
  dome(frame, 223, 152, 1.17, mars);
  antenna(frame, 267, 143, .94);
  if (mars) dome(frame, 192, 132, .65, true);
  astronaut(frame, 180, 161, .43, P.gold);
  return frame;
}

function homePlanet(final = false) {
  const frame = new Raster(width, height, P.space);
  starfield(frame, final ? 54 : 7, height, 153);
  globe(frame, 163, final ? 96 : 94, final ? 74 : 59);
  return frame;
}

function gainsTime() {
  const frame = new Raster(width, height, P.space);
  starfield(frame, 26);
  globe(frame, 105, 97, 54);
  frame.trace([[161,96],[185,96],[194,78],[203,88],[215,88]], P.muted);
  frame.ellipse(235, 88, 31, 31, P.deep);
  frame.ellipse(235, 88, 29, 29, P.ice);
  frame.ellipse(235, 88, 27, 27, P.navy);
  for (let hour = 0; hour < 12; hour += 1) {
    const angle = Math.PI * hour / 6;
    frame.dot(235 + 23 * Math.cos(angle), 88 + 23 * Math.sin(angle), P.ice);
  }
  frame.line(235, 88, 235, 72, P.white, 2);
  frame.line(235, 88, 247, 89, P.gold, 2);
  frame.ellipse(235, 88, 2, 2, P.gold);
  frame.trace([[264,124],[278,110],[287,108],[299,94]], P.green, 2);
  frame.trace([[289,95],[299,94],[299,104]], P.green, 2);
  return frame;
}

function transit() {
  const frame = new Raster(width, height, P.space);
  starfield(frame, 126, height, 135);
  globe(frame, 34, 152, 60, 'moon');
  globe(frame, 283, 46, 17, 'mars');
  flight(frame, 176, 91);
  return frame;
}

function martianDawn(showCrew) {
  const frame = new Raster();
  if (showCrew) {
    marsSky(frame, 23);
    frame.ellipse(226, 99, 26, 26, 0xffc998);
    terrain(frame, 62, true, 105);
    const colors = [P.gold,P.ice,P.green,P.red,P.dust,P.cyan];
    colors.forEach((color, index) => astronaut(frame, 68 + index * 32, 140 + (index % 3) * 6, .9, color));
  } else {
    frame.rect(0, 0, width, height, P.space);
    atmosphere(frame, [P.space,0x201c35,0x372536,0x553141,0x7f454b,0xa4534b], 151);
    starfield(frame, 31, 105, 95);
    globe(frame, 179, 59, 3, 'earth');
    frame.dot(179, 57, P.ice);
    ridge(frame, 114, 0x683b3c, 85, 1.1);
    ridge(frame, 132, 0x382737, 1, .85);
    ridge(frame, 153, 0x231e2f, 9, .64);
  }
  return frame;
}

function gate(frame, x, y, size) {
  detail(frame, x, y, size, ({poly, rect, ellipse, line}) => {
    ellipse(0, 2, 43, 6, P.ink);
    poly([[-31,1],[-28,-20],[-17,-47],[-9,-48],[-16,-11],[18,-11],
      [10,-48],[17,-47],[29,-20],[33,1]], P.slate);
    poly([[-24,-7],[24,-7],[26,-1],[-26,-1]], P.deep);
    ellipse(0, -48, 39, 43, P.navy);
    ellipse(0, -48, 36, 40, P.slate);
    ellipse(0, -48, 32, 36, P.cyan);
    ellipse(0, -48, 30, 34, P.ocean);
    ellipse(2, -48, 25, 30, P.deep);
    ellipse(6, -48, 20, 26, P.muted);
    ellipse(8, -50, 15, 21, P.navy);
    ellipse(11, -53, 7, 12, P.space);
    line([-29,-51], [-25,-66], P.white, 2);
    line([-25,-66], [-16,-77], P.white, 2);
    line([20,-25], [27,-39], P.ice, 2);
    rect(-16, -10, 6, 3, P.cyan);
    rect(12, -10, 6, 3, P.cyan);
  });
}

function portal(withCrew) {
  const frame = new Raster(width, height, P.space);
  starfield(frame, 105, height, 83);
  terrain(frame, 42, false, 100);
  if (withCrew) {
    gate(frame, 162, 141, 1.28);
    const colors = [P.gold,P.ice,P.green,P.red,P.dust,P.cyan];
    colors.forEach((color, index) => astronaut(frame, 55 + index * 40, 162 - (index % 3) * 4, .71, color));
  } else {
    station(frame, 159, 156, 1.45, P.cyan);
    for (const x of [77,244]) {
      frame.poly([[x-16,147],[x-6,131],[x+6,131],[x+16,147]], P.deep);
      frame.poly([[x-6,132],[x-7,117],[x,104],[x+7,117],[x+6,132]], P.ocean);
      frame.trace([[x,108],[x-4,120],[x-3,130]], P.white, 2);
      frame.trace([[x,103],[x,87],[159,75]], P.ice);
    }
    gate(frame, 159, 125, .98);
  }
  return frame;
}

function tunnel() {
  const frame = new Raster(width, height, P.space);
  const rand = random(23);
  const tx = 173;
  const ty = 88;
  for (let i = 0; i < 66; i += 1) {
    const angle = Math.PI * 2 * rand();
    const length = .44 + rand() * .86;
    const x = 210 * Math.cos(angle);
    const y = 126 * Math.sin(angle);
    frame.line(tx + x * length * .55, ty + y * length * .55, tx + x * length, ty + y * length,
      i % 3 === 0 ? P.ocean : P.muted);
  }
  const rings = [[192,105,P.navy],[136,80,P.deep],[94,60,P.muted],[65,42,0x215f8e],
    [45,31,P.ocean],[27,21,P.ice],[17,13,P.cyan],[12,9,P.white]];
  rings.forEach(([rx, ry, color], index) => {
    const x = tx - (rings.length - index) * 2;
    frame.ellipse(x, ty, rx, ry, color);
    frame.ellipse(x + 1, ty + 1, rx - 2, ry - 2, index === rings.length - 1 ? P.ice : P.space);
    for (let j = 0; j < 14; j += 1) {
      const angle = rand() * Math.PI * 2;
      const inset = .85 + rand() * .16;
      frame.dot(x + Math.cos(angle) * rx * inset, ty + Math.sin(angle) * ry * inset, color);
    }
  });
  return frame;
}

function reuse() {
  const frame = riverValley({restoration: 2});
  const roofs = [[25,130,.8],[90,129,.66],[251,133,.8],[283,152,1]];
  for (const [x, y, scale] of roofs) {
    station(frame, x, y, scale, P.gold);
    panel(frame, x, y - 13 * scale, scale * .72);
  }
  dome(frame, 224, 156, .77, true);
  frame.rect(202, 157, 27, 2, P.ice);
  frame.line(203, 159, 182, 166, P.shore, 2);
  return frame;
}

function earlyEarth(stage) {
  if (stage === 0) return riverValley({distressed: true});
  if (stage <= 2) return riverValley({restoration: stage - 1, earlyDamage: stage === 1});
  return stage === 3 ? reuse() : city(true);
}

function menu() {
  const frame = new Raster(width, height, P.space);
  starfield(frame, 30, 143, 150);
  globe(frame, 256, 58, 36);
  terrain(frame, 66, false, 129);
  frame.poly([[0,163],[74,157],[146,165],[241,150],[320,161],[320,180],[0,180]], 0x394658);
  panel(frame, 55, 155, .64);
  lander(frame, 47, 158, .91);
  antenna(frame, 271, 159, .76);
  frame.trace([[193,171],[249,163],[309,169]], P.slate);
  return frame;
}

function logo() {
  const frame = new Raster(160, 60);
  const wing = [[65,22],[47,8],[31,5],[37,10],[20,6],[23,11],[9,9],[18,16],[25,19],
    [25,24],[34,25],[33,29],[51,32]];
  const light = [[65,23],[46,13],[28,10],[36,16],[20,13],[27,19],[45,24],[38,24],[49,28]];
  for (const mirror of [false, true]) {
    const points = (shape) => shape.map(([x, y]) => [mirror ? 159 - x : x, y]);
    frame.poly(points(wing), P.muted);
    frame.poly(points(light), P.ice);
    frame.trace(points([[10,9],[25,12],[42,15],[55,22]]), P.white);
    frame.trace(points([[29,24],[44,27],[53,25]]), P.slate);
  }
  frame.ellipse(80, 19, 19, 16, P.deep);
  frame.ellipse(80, 19, 17, 15, P.ice);
  globe(frame, 80, 19, 14);
  frame.trace([[72,34],[47,39],[15,38]], P.gold);
  frame.trace([[88,34],[112,39],[145,38]], P.gold);
  const title = "EARTH'S ANGEL";
  const size = 2;
  const left = Math.round((160 - letteringWidth(title, size)) / 2);
  frame.rect(left - 4, 34, letteringWidth(title, size) + 8, 18, P.space);
  lettering(frame, title, left, 36, P.white, size);
  return frame;
}

export function generateCinematicArt() {
  const sequences = {
    intro: [() => homePlanet(), () => riverValley({distressed: true}), () => city(), () => briefing(), launch, () => arrival()],
    'moon-to-mars': [() => outpost(), () => briefing(true), gainsTime, transit, () => arrival(true)],
    'mars-victory': [() => outpost(true), () => martianDawn(true), () => martianDawn(false), () => homePlanet(true)],
    wormhole: [() => portal(false), () => portal(true), tunnel, () => riverValley({earlyDamage: true})],
    'earth-victory': [reuse, () => riverValley({restoration: 4}), () => city(true), () => homePlanet(true)],
  };
  for (const [name, shots] of Object.entries(sequences)) {
    shots.forEach((draw, index) => {
      save(`cinematics/${name}-${index + 1}.png`, draw());
    });
  }
  for (let stage = 0; stage < 5; stage += 1) {
    save(`cinematics/earth-stage-${stage}.png`, earlyEarth(stage));
  }
  save('ui/menu-bg.png', menu());
  save('ui/logo.png', logo());

  const earthFrame = new Raster(96, 96);
  globe(earthFrame, 48, 44, 38);
  save('ui/earth.png', earthFrame, 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateCinematicArt();
}
