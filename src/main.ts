// AI-assisted: Antigravity (Gemini) and OpenAI Codex; integrated from A and B.
import type { AppContext } from './app/context';
import { createFlow } from './app/flow';
import { mountPresentationMode, recoverInterruptedPresentation } from './app/presentation';
import { createI18n } from './app/i18n';
import { createOptionsService } from './app/options';
import { createPersistenceService } from './app/persistence';
import { createStore } from './app/store';
import { createUiStore } from './app/ui-store';
import { attachAudio, createAudio } from './audio/index';
import { loadGameData } from './data/index';
import { createMapView } from './map/index';
import { registerScreens } from './ui/index';
import './styles/index.css';

function boot(): void {
  const mapRoot = document.getElementById('map');
  const uiRoot = document.getElementById('ui');
  if (!mapRoot || !uiRoot) return;

  // Before anything reads storage: undo a presentation that was cut short.
  recoverInterruptedPresentation();
  const options = createOptionsService();
  const i18n = createI18n(options.get().language);
  options.subscribe(({ language }) => i18n.setLang(language));

  const data = loadGameData();
  const store = createStore(data);
  const persistence = createPersistenceService();
  const saved = persistence.loadCampaign(data);
  if (saved.ok) store.load(saved.state);
  store.subscribe((state) => { persistence.saveCampaign(state); });
  const uiStore = createUiStore();
  const audio = createAudio(options);

  const flow = createFlow({
    uiRoot,
    getContext: () => ctx,
    getMapView: () => mapView,
  });
  const ctx: AppContext = {
    store,
    uiStore,
    flow,
    options,
    t: (key, params) => i18n.t(key, params),
    audio,
    data,
  };
  const mapView = createMapView(mapRoot, ctx);
  mapView.setVisible(false);

  registerScreens(flow);
  attachAudio(audio, store, flow);
  // The mounted UI and map handle their own keyboard shortcuts.
  flow.go('titulo');

  // X: presentation (the game plays itself). Z: defeat demo. Available in every build.
  mountPresentationMode(ctx, () => mapView.walk);

  if (import.meta.env.DEV) {
    void import('./app/debug').then(({ mountDebugTools }) => mountDebugTools(ctx));
  }
}

if (typeof document !== 'undefined') {
  try {
    boot();
  } catch (error) {
    const title = document.createElement('h1');
    title.textContent = "Earth's Angel could not start";
    const details = document.createElement('pre');
    details.textContent = error instanceof Error ? error.message : String(error);
    document.getElementById('ui')?.replaceChildren(title, details);
  }
}
