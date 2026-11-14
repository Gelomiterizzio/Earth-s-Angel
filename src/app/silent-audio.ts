// AI-assisted: Antigravity (Gemini), reviewed by A

import type { AudioApi } from './context';

export function createSilentAudio(): AudioApi {
  return {
    unlock(): void {},
    playMusic(): void {},
    stopMusic(): void {},
    playSfx(): void {},
    setMusicVolume(): void {},
    setSfxVolume(): void {},
    setMuted(): void {},
  };
}
