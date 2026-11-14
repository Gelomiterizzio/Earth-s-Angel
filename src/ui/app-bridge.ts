// AI-assisted: Cursor Grok 4.7 and OpenAI Codex. Human review by C pending.
import type { Flow } from '../app/context';

export type {
  AppContext,
  AudioApi,
  Flow,
  Options,
  OptionsService,
  SceneId,
  Screen,
  Store,
  UiState,
  UiStore,
} from '../app/context';

export type { Tool } from '../app/context';

// These methods are optional in standalone UI previews and the P0 checkout.
export function campaignFlow(flow: Flow): Flow & {
  canContinue?(): boolean;
  continueCampaign?(): void;
  departToMars?(): void;
  chooseEnding?(choice: 'mars' | 'portal'): void;
  finishEarth?(choice: 'retry' | 'mars' | 'earth'): void;
} {
  return flow;
}
