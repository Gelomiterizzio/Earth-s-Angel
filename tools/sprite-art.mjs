// AI-assisted: OpenAI Codex, Earth's Angel Integrante C
// One character is one source pixel. Keep object and building frames inside the
// documented 24 px cells and leave the bottom rows free for the ground anchor.

const chars = {
  '.': 'none', '#': 'bg', 'b': 'panel', 's': 'moonS', 'g': 'moon',
  'l': 'moonL', 'w': 'text', 'u': 'ocean', 'c': 'ice', 'h': 'focus',
  'a': 'accent', 'y': 'mineral', 'j': 'warn', 'r': 'crit', 'm': 'marsS',
  'd': 'marsL', 'f': 'forest', 'v': 'recovery', 'n': 'safe',
};

const structures = {
  ship: [
    '........##........',
    '.......#ww#.......',
    '......#wllg#......',
    '......#wlgg#......',
    '.....#wlgggs#.....',
    '.....#w##bgs#.....',
    '.....#w#hcgs#.....',
    '.....#w#ubgs#.....',
    '.....#wggggs#.....',
    '.....#wlaags#.....',
    '.....#wlajgs#.....',
    '....##wlgggs##....',
    '...#l#wlgggs#g#...',
    '..#wg#wlgggs#sg#..',
    '..#wg#sssss##sg#..',
    '.#wlg###b####sgs#.',
    '.#ss#..#bs#..#ss#.',
    '####...####...####',
  ],
  panel: [
    '.....##############.',
    '....#hhhhcccccccuu#.',
    '...#hcucucuucuuuu#..',
    '..#hcucucuucuuuu#...',
    '.#hcucucuucuuuu#....',
    '#hhhhccccuuuuuu#....',
    '##bbbbbbbbbbb##.....',
    '..############......',
    '.....#g#..#g#.......',
    '.....#l#..#s#.......',
    '.....#l#..#s#.......',
    '....##g####s##......',
    '...#lggggggsss#.....',
    '...############.....',
  ],
  battery: [
    '.....###..###.....',
    '....#wl#.#lg#.....',
    '..##############..',
    '.#waaaaaaaayyyys#.',
    '#ay############gs#',
    '#w#jjjjj#b#bbbs#s#',
    '#w#jjjjj#b#bbbs#s#',
    '#w#jjjjj#b#bbbs#s#',
    '#w##############s#',
    '#wggaaaaaaaayygss#',
    '#wggssggggggsssss#',
    '.################.',
  ],
  generator: [
    '...#####..#####...',
    '..#wlgs#.#wlgs#...',
    '..#wlgs#.#wlgs#...',
    '.#wwlgs###wwlgs#..',
    '.#wwlgs###wwlgs#..',
    '.#wwlgs#b#wwlgs#..',
    '.#wclgs#b#wclgs#..',
    '.#wclgs#n#wclgs#..',
    '.#wclgs#b#wclgs#..',
    '.#wclgs###wclgs#..',
    '..#wgs#...#wgs#...',
    '..#wgs#...#wgs#...',
    '..################',
    '.#llggggggggssss#.',
    '.################.',
  ],
  recycler: [
    '.....#####.........',
    '....#lcusg#........',
    '...#lcuuugs####....',
    '..#lchuuugs#lg#....',
    '.#lchcuuugs#lgs#...',
    '.#lchcuuugs#lgs#...',
    '.#lchuucugs#lgs#...',
    '.#lcchuucgs#lgs#...',
    '..#lcccuus#glgs#...',
    '...#lggggs#glgs#...',
    '....######ggssg###.',
    '....#gggggssssggss#',
    '....###############',
  ],
  extractor: [
    '.....#########....',
    '....#wllggssg#....',
    '....#waajy#sg#....',
    '....#wllggssg#....',
    '.....###g#####....',
    '.......#g#.#g#....',
    '......#lg#.#g#....',
    '.......#g#.#g#....',
    '.......#gs##g#....',
    '......#lg#.#g#....',
    '.......#g#.#g#....',
    '.......#w#.#g#....',
    '...#...#s#.#g#....',
    '..#hc#..#..#g#....',
    '.#cuhc#....#g#....',
    '##chcuh##.##s##...',
    '#lggggggs##gsss#..',
    '################..',
  ],
  greenhouse: [
    '......########......',
    '....##hccccccc##....',
    '...#hcvcchcccuuu#...',
    '..#hcvvchccuucuuu#..',
    '.#hcvvchcncuccuuug#.',
    '.#hvvwchcncuccuuug#.',
    '#hcvfchcwvncuccuuus#',
    '#hvffchcnvvcuccvufs#',
    '#hffuchgcfvguccvvfs#',
    '#lfflg#lgffgs#fgfs#',
    '#wggggg#gggggs#gss#',
    '.##################.',
  ],
  shelter: [
    '....############....',
    '...#llggggggssss#...',
    '..#llggggggssssss#..',
    '.#wlg############s#.',
    '#wlg#ggbwlg#bgs#sss#',
    '#wg#gbw#lgg#bgs#sss#',
    '#wg#jbw#lgg#bgs#sss#',
    '#wg#gbw#lgs#bgs#sss#',
    '#wg#gbw#lgs#bgs#sss#',
    '#wgg############ssss#',
    '#####################',
  ],
  scaffold: [
    '..#a#..........#a#..',
    '..#a############a#..',
    '..#aaaaaaaaaaaaaj#..',
    '..#a############j#..',
    '..#aj#.......#jsj#..',
    '..#a#j#.....#j##j#..',
    '..#a##j#...#j#.#j#..',
    '..#a#.#j#.#j#..#j#..',
    '..#a#..#jjj#...#j#..',
    '..#a#..#jjj#...#j#..',
    '..#a#.#j#.#j#..#j#..',
    '..#a##j#...#j#.#j#..',
    '..#aj#......#j##j#..',
    '..#a############j#..',
    '..#ajjjjjjjjjjjjj#..',
    '.##################.',
  ],
  depot: [
    '.......#####.......',
    '.....##ddddd##.....',
    '...##dddddddmm##...',
    '..#dddddddmmmmmm#..',
    '.#ddddddddmmmmmmm#.',
    '#wwl############gs#',
    '#wg#jlss#jlss#sss#',
    '#wg#jlss#jlss#sss#',
    '#wg#jlss#jlss#sss#',
    '#wg#############s#',
    '#wgggggggggsssss#.',
    '##################.',
  ],
  comms: [
    '....#h..............',
    '....#c##..#w........',
    '....#cc#..#w........',
    '....#ch##.l.........',
    '.....#chu#g.........',
    '.....#cch#s#........',
    '......#hcuc#ww......',
    '.......#cuucc#......',
    '........#uccc#......',
    '.........#####......',
    '..........#g#.......',
    '.........#lg#.......',
    '.........#lg#.......',
    '........#llg#.......',
    '........#lgg#.......',
    '.......#lggss#......',
    '......#lllggss#.....',
    '.....############...',
  ],
  lab: [
    '.......##............',
    '.......#a#...........',
    '.....###a#########...',
    '...##wwllgggggssss#..',
    '..#wwllgggggsssss##..',
    '.#wwll#########s#hs#.',
    '#wlgs#hcucucuu#s#cs#.',
    '#wlgs#cucucuuu#s#cs#.',
    '#wlgs#ucucuuuu#s#cs#.',
    '#wlgs##########s#ss#.',
    '#wlggggggsssssss#ss#.',
    '#wgggggggsssssss#s#..',
    '###################..',
  ],
  habitat: [
    '.......######.......',
    '.....##wllggs##.....',
    '....#wwlgggggss#....',
    '...#wlg########s#...',
    '..#wlg#hc#hc#usss#..',
    '..#wlg#cc#cc#usss#..',
    '.#wlg#########ssss#.',
    '.#wlgggggggggsssss#.',
    '#wlg#####ggggssssss#',
    '#wlg#bll#gggsssssss#',
    '#wlg#bll#ggssssssss#',
    '#wlg#bll#ggssssssss#',
    '####################',
  ],
};

const crewShell = [
  '.........############.........',
  '.......##wwwwwwlllllg##.......',
  '......#wwwwwlllllllgggs#......',
  '.....#wwll############gs#.....',
  '....#wwl##hhhcccuuuuu##gs#....',
  '....#wl##hhcccuucuuuuu##s#....',
  '...#wll#hcccuuuuuubuuuu#gs#...',
  '...#wl#hccuuuuuuubuuuuu#gs#...',
  '..#awl#hccuuuuuuuubuuub#gs#...',
  '..#awl#ccuuuuuuuuubuuub#gs#...',
  '..#awlg#cuuuuuuuuubuuu#ggs#...',
  '..#aws####bbbbbbbbbb####s##...',
  '...#wwwwll##########lgss#.....',
  '....#wwlllllggggggggsss#......',
  '.....##wllgggggggsss###.......',
  '......#################.......',
  '.....#wwllgggggggggsss#.......',
  '....#wwllg##wwll##ggsss#......',
  '...#wwllg##wllggs##ggsss#.....',
  '..#wwllgg#lgsgsss#ggggsss#....',
  '.#wllgggg############ggsss#...',
  '.#wllggggggggggggggggggsss#...',
  '.##########################...',
];

const roles = {
  commander: { accent: 'a', patch: ['..aaa..', '.aaaaa.', 'aaaaaaa', '...a...'] },
  engineer: { accent: 'c', patch: ['...cc..', '..ccc..', 'cccc...', '.cc....'] },
  botanist: { accent: 'n', patch: ['...nnn.', '..nnvn.', '.nnvn..', '.n.....'] },
  medic: { accent: 'r', patch: ['...w...', '..www..', '...w...', '.......'] },
  geology: { accent: 'y', patch: ['..aa...', '.adya..', '.adyaa.', '..aaa..'] },
  signals: { accent: 'h', patch: ['h.....h', '.h...h.', '..h.h..', '...h...'] },
};

const objects = [
  [
    '.....##.....', '....#hc#....', '....#cc#....', '.....##.....',
    '.....#g#....', '.....#g#....', '...###g##...',
    '..#wllggs#..', '..#wlhugs#..', '.#wllgggss#.', '############',
  ],
  [
    '.....##.....', '....#hl#....', '...#hcc#....', '..#hccu#....',
    '.#hchcu#....', '.#hhcuc##...', '..#ccuuub#..', '...######...',
  ],
  [
    '...######...', '..#nhhhhh#..', '.#nhc...cc#.', '#nhc.....cc#',
    '#nhc.....cc#', '#nhc.....cc#', '.#nhc...cc#.', '..#cccccc#..',
    '...######...',
  ],
];

function draw(g, C, x, y, rows, colors = chars) {
  rows.forEach((row, rowIndex) => [...row].forEach((bit, col) => {
    if (bit === '.') return;
    const px = x + col;
    const py = y + rowIndex;
    if (px < 0 || px >= g.w || py < 0 || py >= g.h || !C[colors[bit]]) {
      throw new Error(`Sprite pixel (${px}, ${py}) is outside its frame or palette`);
    }
    g.dot(px, py, C[colors[bit]]);
  }));
}

const terrainShapes = {
  rock: [
    '......LLL.......', '.....LMMMSS.....', '...LMMMMSSSS....',
    '..LMMMLMSSSDD...', '.LMMSSMSSDDSDD..', 'LMMSDSSSSSDDSDD.',
    'MSSDDDSSDDDDDDD.', '.DDDDDDDDDDDDD..', '...DDDDDDDDD....',
  ],
  crater: [
    '.....LLLLLL.....', '...LLSSSSSSLL...', '..LSSDDDDSSSSL..',
    '.LSLDDDDDDSSSSL.', 'LSSDDDDDDDSSSSSL', 'LSSDDDDDSSSSSSSL',
    '.LSSSSSSSSSSL...', '..LLLLLLLLLL....',
  ],
  ice: [
    '..........##....', '....##...#hc#...', '...#hh#.#hcuc#..',
    '..#hcuc#hccuc#..', '..#hcu#hhccuuu#.', '.#hccu#ccccuuu#.',
    '#hcucchccuucuu#.', '##uuuccuuuuuu##.', '..############..',
  ],
  ore: [
    '.............#..', '.....##.....#y#.', '....#ay#...#ya#.',
    '..##ayy##..#yy#.', '.#aayyyy#.#ayy#.', '#aayysyyy##yyy#.',
    '#ayysyyyyy#yy##.', '.#yyyyyy##.##...', '..######........',
  ],
  mystery: [
    '.....#######....', '....#hhhhhhh#...', '...#hc#####cc#..',
    '...#h#b...#uc#..', '......b..#uc#...', '.......##uc#....',
    '......#hcc#.....', '......#uc#......', '.......##.......',
    '......#hc#......', '.......##.......',
  ],
};

const marsShapes = {
  rock: [
    '....LLLLLL......', '...LMMMMMMS.....', '..LMMMMMSMS.....',
    '.LMMSSSSSMMSSL..', 'LMMMSMMMMMMMDDS.', 'MMMMSMMMMSSSDSDD',
    '.SSSSSSSDDDDDDD.', '..DDDDDDDDDDDD..',
  ],
  crater: [
    '..LLLLLLLLLL....', '.LSSSSSSSSSSSL..', 'LSSDDDDDDDDSSLS.',
    '.LSSDDDDDDDSSSLS', '..LSLSSDDSSSSSL.', '...LLSSSSSSLLS..',
    '.....LLLLLLSS...',
  ],
  ice: [
    '.............##.', '......###...#hc#', '.....#hhc#..#cc#',
    '...##hccu###hcu#', '..#hhccucuucuc#.', '##hchccucucc##..',
    '#cccuuuuccu#....', '.###########....',
  ],
};

function terrain(sheet, C, kind, mars) {
  const g = sheet(24, 24);
  if (kind === 'fog') {
    g.fill(0, 0, 24, 24, C.fog);
    return g;
  }
  const land = mars
    ? { 'M': 'mars', 'L': 'marsL', 'S': 'marsS', 'D': 'crater' }
    : { 'M': 'moon', 'L': 'moonL', 'S': 'moonS', 'D': 'crater' };
  const palette = { ...chars, ...land };
  g.fill(0, 0, 24, 24, C[land.M]);
  if (mars) {
    const strata = { ...palette, L: 'sky', S: 'marsS' };
    draw(g, C, 1, 2, [
      '.....LLLL...........', '...LL....LLLLLL.....', '..L............LL...',
      '..............S..LL.', '...............S....',
    ], strata);
    draw(g, C, 2, 17, [
      '....SSS.............', '.SSS...LLLL.........', 'L..........LLLLL....',
      '................LL..', '..................L.',
    ], strata);
  } else {
    draw(g, C, 1, 1, [
      '...............S....', '....LL.............', '.....S.............',
      '...........LL......', '............S......',
    ], palette);
    draw(g, C, 1, 16, [
      '.....S...........LL.', '.............S....S.', '..............S.....',
      '..LL................', '...S......L.........', '...........S...S....',
    ], palette);
  }
  const shape = (mars ? marsShapes[kind] : undefined) ?? terrainShapes[kind];
  if (shape) draw(g, C, 4, kind === 'mystery' ? 6 : 8, shape, palette);
  return g;
}

function portrait(sheet, C, { accent, patch }) {
  const g = sheet(32, 32);
  g.fill(0, 0, 32, 32, C.panel);
  g.fill(2, 2, 28, 28, C.crater);
  // Common visor and collar keep the head fixed across all six roles.
  draw(g, C, 1, 4, crewShell, { ...chars, a: chars[accent] });
  draw(g, C, 12, 22, patch);
  g.fill(5, 29, 22, 1, C[chars[accent]]);
  return g;
}

const effects = {
  build: {
    colors: ['text', 'accent', 'mineral'],
    frames: [
      [[11, 15], [14, 17], [9, 17]],
      [[11, 12], [16, 15], [7, 15], [11, 18]],
      [[11, 9], [18, 13], [5, 13], [13, 15], [9, 15]],
      [[11, 7], [19, 11], [4, 11], [14, 13], [8, 13]],
    ],
  },
  collect: {
    colors: ['text', 'accent', 'mineral'],
    frames: [
      [[11, 15], [8, 17], [15, 18]],
      [[11, 12], [7, 15], [16, 16], [13, 16]],
      [[11, 9], [8, 12], [16, 13], [13, 13]],
      [[11, 7], [9, 10], [15, 11], [13, 11]],
    ],
  },
  dust: {
    colors: ['marsL', 'dust', 'sky'],
    frames: [
      [[5, 17], [8, 18], [11, 17], [14, 18]],
      [[6, 16], [9, 17], [13, 16], [16, 17], [18, 15]],
      [[7, 15], [11, 16], [15, 15], [18, 16], [20, 14]],
      [[8, 14], [13, 15], [17, 14], [19, 15], [21, 13]],
    ],
  },
};

function effectFrames(sheet, C, name, { colors, frames }) {
  return frames.map((points, frame) => {
    const g = sheet(24, 24);
    const [light, body, dim] = colors.map((key) => C[key]);
    points.forEach(([x, y], index) => {
      if (name === 'dust') {
        g.fill(x - 2, y, frame < 3 ? 4 : 3, 1, dim);
        g.fill(x - 1, y - 1, 3, 1, frame < 3 ? body : dim);
        if (frame < 2) g.dot(x, y, light);
        return;
      }
      if (frame === 3 && index > 2) return;
      const center = index === 0;
      if (name === 'collect' || center) {
        g.fill(x - 1, y, 3, 2, C.crater);
        g.dot(x, y - 1, body);
        g.dot(x, y + 1, body);
      }
      if (name === 'build' && center && frame < 3) {
        g.fill(x - 2, y, 5, 1, body);
        g.fill(x, y - 2, 1, 5, body);
      } else if (frame < 2) {
        g.dot(x + 1, y, body);
        g.dot(x, y + 1, dim);
      }
      g.dot(x, y, frame < 3 ? light : body);
    });
    return g;
  });
}

export function exportSpriteArt(C, sheet, join, save) {
  const terrainKinds = ['plain', 'rock', 'crater', 'ice', 'ore', 'mystery', 'fog'];
  for (const [name, mars] of [['moon', false], ['mars', true]]) {
    save(`sprites/tiles-${name}.png`, join(terrainKinds.map((kind) => terrain(sheet, C, kind, mars)), 24, 24));
  }
  const buildingNames = Object.keys(structures);
  const renderBuilding = (name) => {
    const g = sheet(24, 32);
    const shape = structures[name];
    const width = Math.max(...shape.map((row) => row.length));
    g.fill(4, 29, 16, 1, C.crater);
    g.fill(7, 30, 10, 1, C.moonS);
    draw(g, C, Math.floor((24 - width) / 2), 29 - shape.length, shape);
    return g;
  };
  save('sprites/buildings.png', join(buildingNames.slice(0, 9).map(renderBuilding), 24, 32));
  save('sprites/buildings-p1.png', join(buildingNames.slice(9).map(renderBuilding), 24, 32));

  const portraits = Object.values(roles).map((role) => portrait(sheet, C, role));
  save('sprites/crew.png', join(portraits.slice(0, 4), 32, 32));
  save('sprites/crew-p1.png', join(portraits.slice(4), 32, 32));

  for (const [name, effect] of Object.entries(effects)) {
    save(`sprites/fx-${name}.png`, join(effectFrames(sheet, C, name, effect), 24, 24));
  }
  save('sprites/objects.png', join(objects.map((shape) => {
    const g = sheet(24, 24);
    g.fill(6, 19, 12, 1, C.crater);
    draw(g, C, 6, 19 - shape.length, shape);
    return g;
  }), 24, 24));
}

const icons = [
  // Energy, oxygen, water, food, materials, radiation, action points, day,
  // Earth, safe, warning and critical. This order is also used by the HUD.
  [
    '.....aaa..', '....aaa...', '...aaaa...', '..aaaa....', '.aaaa.....',
    'aaaaaaaaaa', '.....aaaa.', '....aaaa..', '...aaaa...', '...aaa....',
    '..aa......', '..a.......',
  ],
  [
    '....hhh.....', '..hh...hh...', '.hh.....hh..', 'hh.......hh.',
    'hh.......hh.', 'hh.......hh.', 'hh.......hh.', '.hh.....hh..',
    '..hh...hh...', '....hhh.....', '............',
  ],
  [
    '.....h.....', '....hhc....', '....hcc....', '...hhccc...',
    '..hhccuc...', '..hccuuc...', '.hhccuuuc..', '.hccuuuuc..',
    '.hcccucuc..', '..hccccc...', '...cccc....',
  ],
  [
    '.........n..', '.......nnn..', '.....nvvnn..', '....nvvvfn..',
    '...nvvvfn...', '..nvvffn....', '.nvffnn.....', '.vfnn.......',
    '.nn.........', 'n...........', 'n...........',
  ],
  [
    '.....yy.....', '...aayyyy...', '.aaayyyyyyy.', 'aaayyyyyyyyy',
    'ayyyggyyyyyy', 'ayyygsyyyyyy', 'ayyygsyyyyyy', 'ayyygsyyyyyy',
    '.ayygsyyyy..', '...yyyyy....', '.....y......',
  ],
  [
    '....rrrr....', '..r......r..', '.r........r.', 'r..rr..rr..r',
    'r...rrrr...r', 'r....rr....r', 'r....rr....r', 'r...rrrr...r',
    'r..rr..rr..r', '.r........r.', '..r......r..', '....rrrr....',
  ],
  [
    '.........ww.', '........www.', '.......www..', '......www...',
    '.....www....', '.ww.wwwwww..', '.wwwwwwww...', '..wwwww.....',
    '..wwwwww....', '.www........', 'www.........', 'ww..........',
  ],
  [
    '.a.a....a.a.', '.a.a....a.a.', 'aaaaaaaaaaaa', 'a..........a',
    'a.ww....ww.a', 'a.ww....ww.a', 'a..........a', 'a.ww.......a',
    'a.ww.......a', 'a..........a', 'aaaaaaaaaaaa',
  ],
  [
    '....cccc....', '..ccuuuccc..', '.cuuvvvvuuc.', 'cuuvvvuuuuuc',
    'cuvvvuuuuuuc', 'cuuvvuvuuvuc', 'cuuuvuuuuvuc', 'cuuuuuuuuuvc',
    'cuuuuuvuuvvc', '.cuuuuuvvuc.', '..ccuuuccc..', '....cccc....',
  ],
  [
    '....nnnn....', '..nnnnnnnn..', '.nnnnnnnnnn.', '.nnnnnnnbbn.',
    'nnnnnnnbbnnn', 'nnbbnnbbnnnn', 'nnnbbbbnnnnn', 'nnnnbbnnnnnn',
    '.nnnnnnnnnn.', '.nnnnnnnnnn.', '..nnnnnnnn..', '....nnnn....',
  ],
  [
    '.....jj.....', '.....jj.....', '....jjjj....', '...jjbbjj...',
    '...jjbbjj...', '..jjjbbjjj..', '..jjjbbjjj..', '.jjjjjjjjjj.',
    '.jjjjbbjjjj.', 'jjjjjbbjjjjj', 'jjjjjjjjjjjj',
  ],
  [
    '...rrrrrr...', '..rrrrrrrr..', '.rrrrrrrrrr.', 'rrbbrrrrbbrr',
    'rrrbbrbbrrrr', 'rrrrbbbrrrrr', 'rrrrbbbrrrrr', 'rrrbbrbbrrrr',
    'rrbbrrrrbbrr', '.rrrrrrrrrr.', '..rrrrrrrr..', '...rrrrrr...',
  ],
];

const earthIcons = [
  ['...aaa...', '..aaaaa..', '.aabbbaa.', '.aabbbaa.', 'aaaaabbba', 'aaaaabbba', 'aaaaaaaaa', '..aaaaa..'],
  ['..cccc...', '.cccccc..', '.ccuuucc.', 'ccuuuuucc', 'ccuuuuhcc', 'ccuuuhhcc', '.ccccccc.', '..ccccc..'],
  ['....nnn..', '...nnnnn.', '..nnwnnn.', '.nnwwnn..', 'nnwwnn...', 'nnnnn....', '.nnn.....', '.nn......'],
  ['..vvv....', '.vvvvv...', '..vvv.vv.', '...v.vvvv', '...v..vv.', '...v.v...', '...vv....', '...v.....'],
  ['...uuu...', '..uuuuu..', '..uuuuu..', '.uuuuuuc.', '.uuuuucc.', 'uuuuuucuu', 'uuuuuuuuu', 'uuuuuuuuu', '.uuuuuuu.'],
  ['....a....', '...aaa...', '..aaaaa..', '..aaaaa..', '.aajaaaa.', '.aajajaa.', 'aajjjjaaa', 'aajjjjjaa', 'aaaaaaaaa'],
  ['....n....', '...nnn...', '..nnfnn..', '...nfn...', '.nnnfnnn.', 'nnnnfnnnn', '...fff...', '...fff...'],
];

const angel = [
  '........aaaa........',
  '.......a....a.......',
  'w.......aaaa.......w',
  'ww.......ww.......ww',
  '.wlww...waaw...wwlw.',
  '.wwllw..waaw..wllww.',
  '..wgllw.waww.wllgw..',
  '...wgllw.ww.wllgw...',
  '....wggwwwwwwggw....',
  '.....wggggggggw.....',
  '......wwggggww......',
  '........wwww........',
  '.........aw.........',
  '.........wa.........',
];

function scaleIcon(sheet, C, shape, scale) {
  const g = sheet(16, 16);
  const width = Math.max(...shape.map((row) => row.length));
  draw(g, C, Math.floor((16 - width) / 2), Math.floor((16 - shape.length) / 2), shape);
  if (scale === 1) return g;
  const enlarged = sheet(16 * scale, 16 * scale);
  for (let y = 0; y < g.h; y += 1) {
    for (let x = 0; x < g.w; x += 1) {
      const offset = (y * g.w + x) * 4;
      if (g.data[offset + 3]) enlarged.fill(x * scale, y * scale, scale, scale, g.data.subarray(offset, offset + 4));
    }
  }
  return enlarged;
}

export function exportIconArt(C, sheet, join, save) {
  for (const size of [16, 32]) {
    save(`ui/icons-${size}.png`, join(icons.map((shape) => scaleIcon(sheet, C, shape, size / 16)), size, size));
  }
  save('ui/icons-earth.png', join(earthIcons.map((shape) => scaleIcon(sheet, C, shape, 2)), 32, 32));
  const angelIcon = sheet(32, 32);
  draw(angelIcon, C, 6, 9, angel);
  save('ui/angel.png', angelIcon);
}
