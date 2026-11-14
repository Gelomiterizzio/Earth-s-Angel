// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
// Camera poses and audio cues adjusted with Codex.
const pose = (x, y, scale, opacity = 1) => ({ x, y, scale, opacity });
const layer = (image, from, to) => ({ image, from, to });

function scene(durationMs, captionKey, background, image, from, to, transition, sfx) {
  const row = {
    durationMs,
    captionKey,
    background,
    layers: [layer(image, from, to)],
    transition,
  };
  if (sfx) row.sfx = sfx;
  return row;
}

const scripts = {
  intro: {
    id: 'intro',
    music: 'music-cinematic',
    scenes: [
      scene(7000, 'ui.cine.intro.1', 'bg', 'intro-1.png', pose(0, 0, 1), pose(0, 0, 1.04), 'fade'),
      scene(8000, 'ui.cine.intro.2', 'crisis', 'intro-2.png', pose(12, 0, 1.035), pose(-12, 0, 1.035), 'fade'),
      scene(7000, 'ui.cine.intro.3', 'panel', 'intro-3.png', pose(0, 0, 1), pose(0, 0, 1), 'fade'),
      scene(8000, 'ui.cine.intro.4', 'panel', 'intro-4.png', pose(0, 0, 1.04), pose(0, 0, 1), 'fade', 'sfx-radio'),
      scene(7000, 'ui.cine.intro.5', 'mars-sky', 'intro-5.png', pose(0, 10, 1.04), pose(0, -10, 1.04), 'cut', 'sfx-launch'),
      scene(8000, 'ui.cine.intro.6', 'bg', 'intro-6.png', pose(0, 0, 1), pose(0, 0, 1.04), 'fade', 'sfx-landing'),
    ],
  },
  moonToMars: {
    id: 'moonToMars',
    music: 'music-transit',
    scenes: [
      scene(7000, 'ui.cine.moonToMars.1', 'moon-shadow', 'moon-to-mars-1.png', pose(12, 0, 1.035), pose(-12, 0, 1.035), 'fade'),
      scene(6000, 'ui.cine.moonToMars.2', 'panel', 'moon-to-mars-2.png', pose(0, 0, 1), pose(0, 0, 1), 'fade'),
      scene(8000, 'ui.cine.moonToMars.3', 'ocean', 'moon-to-mars-3.png', pose(0, 0, 1), pose(0, 0, 1.04), 'fade'),
      scene(7000, 'ui.cine.moonToMars.4', 'bg', 'moon-to-mars-4.png', pose(-12, 0, 1.035), pose(12, 0, 1.035), 'fade', 'sfx-launch'),
      scene(8000, 'ui.cine.moonToMars.5', 'mars-base', 'moon-to-mars-5.png', pose(0, 0, 1.04), pose(0, 0, 1), 'fade', 'sfx-landing'),
    ],
  },
  marsVictory: {
    id: 'marsVictory',
    music: 'music-ending',
    scenes: [
      scene(8000, 'ui.cine.marsVictory.1', 'mars-base', 'mars-victory-1.png', pose(12, 0, 1.035), pose(-12, 0, 1.035), 'fade'),
      scene(7000, 'ui.cine.marsVictory.2', 'mars-light', 'mars-victory-2.png', pose(0, 0, 1), pose(0, 0, 1), 'fade'),
      scene(7000, 'ui.cine.marsVictory.3', 'mars-sky', 'mars-victory-3.png', pose(0, 0, 1), pose(0, 0, 1.04), 'fade'),
      scene(8000, 'ui.cine.marsVictory.4', 'ocean', 'mars-victory-4.png', pose(0, 0, 1.04), pose(0, 0, 1), 'fade'),
    ],
  },
  wormhole: {
    id: 'wormhole',
    music: 'music-portal',
    scenes: [
      scene(7000, 'ui.cine.wormhole.1', 'panel', 'wormhole-1.png', pose(0, 0, 1), pose(0, 0, 1.04), 'fade', 'sfx-portal'),
      scene(7000, 'ui.cine.wormhole.2', 'bg', 'wormhole-2.png', pose(0, 0, 1), pose(0, 0, 1), 'fade'),
      scene(8000, 'ui.cine.wormhole.3', 'ice', 'wormhole-3.png', pose(0, 0, 1), pose(0, 0, 1.04), 'fade'),
      scene(8000, 'ui.cine.wormhole.4', 'forest', 'wormhole-4.png', pose(12, 0, 1.035), pose(-12, 0, 1.035), 'fade'),
    ],
  },
  earthVictory: {
    id: 'earthVictory',
    music: 'music-ending',
    scenes: [
      scene(8000, 'ui.cine.earthVictory.1', 'recovery', 'earth-victory-1.png', pose(12, 0, 1.035), pose(-12, 0, 1.035), 'fade'),
      scene(8000, 'ui.cine.earthVictory.2', 'forest', 'earth-victory-2.png', pose(0, 0, 1), pose(0, 0, 1.04), 'fade'),
      scene(8000, 'ui.cine.earthVictory.3', 'city', 'earth-victory-3.png', pose(0, 0, 1.04), pose(0, 0, 1), 'fade'),
      scene(8000, 'ui.cine.earthVictory.4', 'ocean', 'earth-victory-4.png', pose(0, 0, 1), pose(0, 0, 1), 'fade'),
    ],
  },
};

const fs = await import('node:fs');
const path = await import('node:path');
const dir = path.resolve('src/ui/cinematics/scripts');
fs.mkdirSync(dir, { recursive: true });
for (const [name, script] of Object.entries(scripts)) {
  const total = script.scenes.reduce((sum, item) => sum + item.durationMs, 0);
  fs.writeFileSync(path.join(dir, `${name}.json`), `${JSON.stringify(script, null, 2)}\n`);
  console.log(name, total);
}
