// AI-assisted: OpenAI Codex, GPT-6. Human review by C pending.
import type { AppContext } from '../app-bridge';
import type { CampaignData, CampaignState } from '../core-bridge';
import { el } from '../dom';

const BEACON_FLAGS = { luna: 'beaconMoon', marte: 'beaconMars' } as const;

export function clueLog(ctx: AppContext, state: CampaignState, open: boolean): HTMLElement | null {
  const data: CampaignData = ctx.data;
  const levels = (['luna', 'marte'] as const).filter((level) => data.levels[level]?.secret);
  if (levels.length === 0) return null;
  const block = el('section');
  const details = el('details', 'clue-log');
  details.open = open;
  const toggle = el('summary', 'zone-title', ctx.t('ui.clues.heading'));
  toggle.dataset.hudFocus = 'clues';
  details.append(toggle);
  const list = el('ul', 'goal-list');
  const { mission, campaign } = state;
  for (const level of levels) {
    const beacon = data.levels[level]?.secret?.beacon;
    if (!beacon) continue;
    const name = ctx.t(`ui.clues.level.${level}`);
    const label = (key: string, params = {}): void => {
      list.append(el('li', undefined, ctx.t(`ui.clues.${key}`, { level: name, ...params })));
    };
    if (campaign.narrativeFlags[BEACON_FLAGS[level]]) label('found');
    if (campaign.clues.includes(`${level}.column`)) label('column', { n: beacon.x });
    if (campaign.clues.includes(`${level}.row`)) label('row', { n: beacon.y });
    if (campaign.clues.includes(`${level}.signal`)) {
      const reading = campaign.clueSignals?.[level];
      if (reading) label('distance', { x: reading.x, y: reading.y, n: reading.distance });
      else label('signal');
    }
  }
  if (!list.childElementCount) list.append(el('li', undefined, ctx.t('ui.clues.empty')));
  details.append(list);
  if (data.levels[mission.level]?.secret && data.constants.labClueDays !== undefined
    && !campaign.clues.includes(`${mission.level}.row`)) {
    details.append(el('p', undefined, ctx.t('ui.clues.lab', { n: mission.labDays ?? 0, target: data.constants.labClueDays })));
  }
  block.append(details);
  return block;
}
