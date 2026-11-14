// AI-assisted: Cursor Grok 4.7, reviewed by C
import type { Flow } from './app-bridge';
import { cinematicScreen } from './screens/cinematic';
import { choiceScreen } from './screens/choice';
import { creditsScreen } from './screens/credits';
import { difficultyScreen } from './screens/difficulty';
import { farewellScreen } from './screens/farewell';
import { missionScreen } from './screens/mission';
import { optionsScreen } from './screens/options';
import { pauseScreen } from './screens/pause';
import { resultScreen } from './screens/result';
import { titleScreen } from './screens/title';

export function registerScreens(flow: Flow): void {
  flow.register('titulo', titleScreen);
  flow.register('opciones', optionsScreen);
  flow.register('dificultad', difficultyScreen);
  flow.register('despedida', farewellScreen);
  flow.register('cinematica', cinematicScreen);
  flow.register('mision', missionScreen);
  flow.register('pausa', pauseScreen);
  flow.register('resultado', resultScreen);
  flow.register('creditos', creditsScreen);
  flow.register('eleccion', choiceScreen);
}
