// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import intro from './scripts/intro.json';
import moonToMars from './scripts/moonToMars.json';
import marsVictory from './scripts/marsVictory.json';
import wormhole from './scripts/wormhole.json';
import earthVictory from './scripts/earthVictory.json';
import type { CinematicScript } from './player';

const scripts: Record<string, CinematicScript> = {
  intro: intro as CinematicScript,
  moonToMars: moonToMars as CinematicScript,
  marsVictory: marsVictory as CinematicScript,
  wormhole: wormhole as CinematicScript,
  earthVictory: earthVictory as CinematicScript,
};

export function getScript(id: string): CinematicScript | null {
  if (id === 'opening') return scripts.intro;
  return Object.hasOwn(scripts, id) ? scripts[id] : null;
}
