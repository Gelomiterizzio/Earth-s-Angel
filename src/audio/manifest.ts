// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import type { GameEvent, LevelId } from '../core/types';
import type { SceneId } from '../app/context';

export const PACKAGED_AUDIO: readonly string[] = [];

export const EVENT_SFX: Partial<Record<GameEvent['type'], string>> = {
  'building/placed': 'sfx-build',
  'building/operational': 'sfx-online',
  'action/rejected': 'sfx-error',
  'tile/explored': 'sfx-explore',
  'resource/collected': 'sfx-collect',
  'day/ended': 'sfx-day-end',
  'harvest/done': 'sfx-produce',
  'decision/required': 'sfx-alert-radiation',
  'alert/shortage': 'sfx-alert-shortage',
  'objective/met': 'sfx-objective',
  'discovery/found': 'sfx-discovery',
  'mission/victory': 'sfx-victory',
  'mission/defeat': 'sfx-defeat',
};

export function musicFor(scene: SceneId, previous: SceneId, level?: LevelId): string | null {
  if (scene === 'titulo' || scene === 'dificultad' || scene === 'creditos' ||
      (scene === 'opciones' && previous === 'titulo')) return 'music-menu';
  if (scene === 'mision' || scene === 'eleccion') {
    if (level === 'marte') return 'music-mars';
    if (level === 'tierra') return 'music-earth';
    return 'music-moon';
  }
  return null;
}

export const MUSIC_LOOP = new Set([
  'music-menu', 'music-moon', 'music-cinematic', 'music-transit', 'music-mars',
  'music-portal', 'music-earth', 'music-ending',
]);

export const MUSIC_FILE: Record<string, string> = {
  'music-menu': './assets/audio/music/menu.ogg',
  'music-moon': './assets/audio/music/moon.ogg',
  'music-cinematic': './assets/audio/music/cinematic.ogg',
  'music-transit': './assets/audio/music/transit.ogg',
  'music-mars': './assets/audio/music/mars.ogg',
  'music-portal': './assets/audio/music/portal.ogg',
  'music-earth': './assets/audio/music/earth.ogg',
  'music-ending': './assets/audio/music/ending.ogg',
  'music-victory': './assets/audio/music/victory.ogg',
  'music-defeat': './assets/audio/music/defeat.ogg',
};
