// AI-assisted: OpenAI Codex. Human review pending.
import assert from 'node:assert/strict';
import { MEDIA_PLAN } from '../core/plans/media.ts';
import { MARS_PLAN } from '../core/plans/mars.ts';
const url = process.argv[2] ?? 'http://127.0.0.1:5186/';
const targets = await (await fetch('http://127.0.0.1:' + (process.env.EA_CDP_PORT ?? '9227') + '/json')).json();
const socket = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
const awaiting = new Map();
const errors = [];
const assets = [];
socket.onmessage = ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails);
  if (msg.method === 'Network.responseReceived' && msg.params.response.url.includes('/assets/')) {
    assets.push([msg.params.response.status, msg.params.response.url]);
  }
  if (msg.id) {
    const { resolve, reject } = awaiting.get(msg.id);
    awaiting.delete(msg.id);
    if (msg.error) reject(msg.error);
    else resolve(msg.result);
  }
};
let id = 0;
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    awaiting.set(++id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function task(fn, ...args) {
  const expression = '(' + fn.toString() + ')(...' + JSON.stringify(args) + ')';
  const res = await send('Runtime.evaluate', { expression, userGesture: true, awaitPromise: true, returnByValue: true });
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description ?? res.exceptionDetails.text);
  return res.result.value;
}
await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
const instrumentation = await send('Page.addScriptToEvaluateOnNewDocument', { source: '(' + String(function () {
  window.eaTracks = [];
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...args) {
    if (this.loop && this.buffer) window.eaTracks.push(this.buffer.duration);
    return start.apply(this, args);
  };
}) + ')()' });
async function navigate() {
  await send('Page.navigate', { url: new URL('?seed=demo', url).href });
  for (let i = 0; i < 40; i++) {
    await sleep(150);
    if (await task(() => Boolean(document.querySelector('.title-screen'))).catch(() => false)) return;
  }
  throw new Error('Title not loaded: ' + await task(() => document.body.innerText));
}
const click = (selector) => task((selector) => {
  const item = document.querySelector(selector);
  if (!item || item.disabled) throw new Error(selector + ' missing/disabled: ' + document.body.innerText.slice(0, 700));
  item.click();
}, selector);
const named = (name, optional = false) => task((name, optional) => {
  const button = [...document.querySelectorAll('#ui button')].find((item) => item.textContent.trim().startsWith(name));
  if (!button && optional) return;
  if (!button || button.disabled) throw new Error(name + ' missing/disabled: ' + document.body.innerText.slice(0, 700));
  button.click();
}, name, optional);
const saved = () => task(() => JSON.parse(localStorage.getItem('ea.save.v1')).state);
const trackPlayed = (tempo) => task((duration) =>
  window.eaTracks.some((played) => Math.abs(played - duration) < 0.01), 32 * 60 / tempo,
);
const load = async (state) => {
  await task((state) => localStorage.setItem('ea.save.v1', JSON.stringify({
    schema: 'earths-angel/save', version: 1, savedAtDay: state.mission.day, state,
  })), state);
  await navigate();
  await named('Continue');
};
const skip = () => click('.cine .skip');
const cell = (x, y) => '.map-cell[data-x="' + x + '"][data-y="' + y + '"]';
const lunarBuilders = {
  panel: 0, bateria: 0, generador: 1, reciclador: 1, extractor: 1,
  invernadero: 2, laboratorio: 2, refugio: 3,
  deposito: 4, comunicaciones: 5, habitat: 3,
};
const action = async (act) => {
  const { mission } = await saved();
  const ap = mission.ap;
  const role = act.type === 'BUILD' ? lunarBuilders[act.building] : act.type === 'SCAN' ? 0 : undefined;
  if (role !== undefined) {
    const selected = await task(() => document.querySelector('.walk-avatar')?.dataset.crewId);
    if (selected !== String(role)) {
      await click('.walk-hint-menu');
      await click('[data-action-focus="crew-' + role + '"]');
      await click('.walk-actions-close');
    }
  }
  let control;
  if (act.type === 'BUILD') control = 'build-' + act.building;
  if (act.type === 'EXPLORE') control = 'explore';
  if (act.type === 'COLLECT') control = 'collect';
  if (act.type === 'SCAN') control = 'scan';
  if (await task(() => document.querySelector('.hud-side').hidden)) {
    await click('[data-hud-focus="base"]');
  }
  if (control) {
    await click('[data-hud-focus="' + control + '"]');
    await click(cell(act.x, act.y));
  } else if (act.type === 'CLEAN_PANELS') await click('[data-hud-focus="clean"]');
  else if (act.type === 'REPAIR') await click('[data-hud-focus="repair-' + act.buildingId + '"]');
  assert.ok((await saved()).mission.ap < ap, 'not applied: ' + JSON.stringify(act));
};
const secretMoon = [
  { type: 'EXPLORE', x: 28, y: 23 }, { type: 'EXPLORE', x: 30, y: 22 }, { type: 'SCAN', x: 30, y: 22 },
];
const secretMars = {
  4: [{ type: 'EXPLORE', x: 11, y: 15 }],
  15: [{ type: 'EXPLORE', x: 10, y: 17 }, { type: 'COLLECT', x: 10, y: 18 }],
  16: [{ type: 'BUILD', building: 'laboratorio', x: 11, y: 10 }, { type: 'EXPLORE', x: 14, y: 12 }],
  17: [{ type: 'EXPLORE', x: 16, y: 12 }, { type: 'SCAN', x: 17, y: 12 }],
};
async function lunarDay({ day, shelter, actions }) {
  if (shelter) await named('Shelter the crew');
  for (const act of actions) await action(act);
  await finishDay();
  const s = await saved();
  assert.equal(s.mission.lastReport.day, day);
  if (!s.mission.result) await click('[aria-labelledby="day-report-title"] .btn-primary');
}
async function finishDay() {
  if (await task(() => Boolean(document.querySelector('.shelter-scene')))) {
    await click('.shelter-scene .btn-primary');
  }
  if ((await saved()).mission.phase === 'planning') await click('.end-day');
}
async function verifySouthwest(original) {
  const surveyed = structuredClone(original);
  surveyed.mission.map.tiles.forEach((tile) => { tile.explored = true; });
  await load(surveyed);
  const finalPosition = await task(({ map, buildings }) => {
    const { width, height, tiles } = map;
    const avatar = document.querySelector('.walk-avatar');
    const start = Number(avatar.dataset.y) * width + Number(avatar.dataset.x);
    const target = (height - 2) * width + 1;
    const occupied = new Set(buildings.map(({ x, y }) => y * width + x));
    const parents = new Map([[start, null]]);
    const queue = [start];
    const steps = [
      ['a', 'west', -1, 0], ['s', 'south', 0, 1], ['d', 'east', 1, 0], ['w', 'north', 0, -1],
    ];
    for (let i = 0; i < queue.length && !parents.has(target); i++) {
      const index = queue[i];
      for (const [key, facing, dx, dy] of steps) {
        const x = index % width + dx;
        const y = Math.floor(index / width) + dy;
        const next = y * width + x;
        if (x < 0 || y < 0 || x >= width || y >= height || parents.has(next) || occupied.has(next)) continue;
        const tile = tiles[next];
        if (['nave', 'roca', 'crater'].includes(tile.terrain) || (tile.terrain === 'mineral' && !tile.collected)) continue;
        parents.set(next, { index, key, facing });
        queue.push(next);
      }
    }
    if (!parents.has(target)) throw Error('Southwest corner unreachable');
    const path = [];
    for (let index = target; index !== start;) {
      const step = parents.get(index);
      path.push(step);
      index = step.index;
    }
    const press = (key) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      window.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
    };
    for (const { key, facing } of path.reverse()) {
      if (avatar.dataset.facing !== facing) press(key);
      press(key);
    }
    if (avatar.dataset.facing !== 'south') press('s');
    return [Number(avatar.dataset.x), Number(avatar.dataset.y)];
  }, surveyed.mission);
  assert.deepEqual(finalPosition, [1, surveyed.mission.map.height - 2]);
  await sleep(280);
  assert.equal(await task(() => {
    const hint = document.querySelector('.walk-hint').getBoundingClientRect();
    const avatar = document.querySelector('.walk-avatar').getBoundingClientRect();
    const tile = document.querySelector('[data-walk-target]').getBoundingClientRect();
    return avatar.width > 0 && avatar.bottom < hint.top && tile.bottom < hint.top;
  }), true);
  await load(original);
}
async function setup() {
  await navigate();
  await task(() => {
    localStorage.removeItem('ea.save.v1');
    localStorage.setItem('ea.options.v1', JSON.stringify({ language: 'en', tutorial: false, learningCheck: false }));
  });
  await navigate();
  await named('New game');
  await click('.diff-card:nth-child(2)');
  await skip();
  assert.equal((await saved()).campaign.difficulty, 'media');
  const { width, height } = (await saved()).mission.map;
  assert.equal(await task(() => document.querySelectorAll('.map-cell').length), width * height);
  assert.match(await task(() => document.querySelector('.hud-bottom .space-apps-entry').textContent), /NASA Space Apps Challenge/);
  await verifySouthwest(await saved());
  for (const day of MEDIA_PLAN) await lunarDay(day.day === 7 ? { ...day, actions: secretMoon } : day);
  const s = await saved();
  assert.equal(s.mission.result.outcome, 'victory');
  assert.equal(s.campaign.narrativeFlags.beaconMoon, true);
  await named('Depart for Mars');
  const before = await saved();
  assert.equal(before.campaign.earthDaysRemaining, 55);
  await skip();
  const after = await saved();
  assert.equal(after.mission.day, 1);
  assert.equal(await task(() => document.querySelectorAll('.map-cell').length), 81 * 81);
  await load(before);
  assert.equal(await task(() => document.querySelectorAll('.manifest-stock').length), 2);
  assert.equal(Number(await task(() => document.querySelector('.manifest-stock:last-child dd').textContent)), after.mission.resources.energia);
  await click('.cine-briefing button');
  await sleep(180);
  assert.ok(await task(() => Boolean(document.querySelector('.cine-stage canvas'))));
  if (process.env.EA_NATURAL === '1') {
    for (let i = 0; i < 72; i++) {
      if (await task(() => Boolean(document.querySelector('.end-day')))) break;
      await sleep(500);
    }
  } else await skip();
  assert.deepEqual(await saved(), after);
  await verifySouthwest(after);
  await navigate();
  await named('Continue');
  assert.deepEqual(await saved(), after);
  assert.ok(await trackPlayed(81), 'Mars music never started');
  assert.ok(await task(() => Boolean(document.querySelector('#map[data-level="marte"][data-walk-world]'))));
  const landed = await task(() => document.querySelector('.walk-avatar').dataset.x);
  for (let press = 0; press < 2; press++) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'd', code: 'KeyD' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'd', code: 'KeyD' });
  }
  const moved = await task(() => document.querySelector('.walk-avatar').dataset.x);
  assert.equal(Number(moved), Number(landed) + 1);
  await click('.walk-hint-menu');
  assert.ok(await task(() => Boolean(document.querySelector('.walk-actions'))));
  await click('.walk-actions-close');
  assert.deepEqual(await saved(), after);
  console.log('Moon won through the map. Mars at sol 1, 55 days and 6561 squares. Travel skip and reload verified.');
  return after;
}
async function mars() {
  for (let day = 1; day <= 55; day++) {
    const s = await saved();
    if (s.mission.result) break;
    assert.equal(s.mission.day, day);
    if (s.mission.phase === 'decision') await named('Shelter the crew');
    else {
      for (const act of MARS_PLAN[day] ?? []) await action(act);
      for (const b of s.mission.buildings) if (b.damaged) await action({ type: 'REPAIR', buildingId: b.id });
      for (const act of secretMars[day] ?? []) await action(act);
      if (!MARS_PLAN[day] && s.mission.dust > 0) await action({ type: 'CLEAN_PANELS' });
    }
    await finishDay();
    if (!(await saved()).mission.result) await click('[aria-labelledby="day-report-title"] .btn-primary');
  }
  const s = await saved();
  assert.equal(s.mission.result.outcome, 'victory');
  assert.equal(s.campaign.narrativeFlags.beaconMars, true);
  console.log('Mars won on sol ' + s.mission.result.daysUsed + ' with both beacons.');
  return s;
}
async function earth(marsWon) {
  await named('Finish on Mars');
  await skip();
  assert.ok((await saved()).campaign.narrativeFlags.endingSeen);
  await load(marsWon);
  await named('Review the portal choice');
  await named('Enter the portal');
  await named('Yes');
  await skip();
  assert.equal((await saved()).earth.season, 1);
  assert.ok(await trackPlayed(86), 'Earth music never started');
  assert.equal(await task(() => document.querySelector('#map').hidden), true);
  for (let i = 1; i <= 8; i++) {
    await named('End season');
    if (i !== 8) await named('Plan the next season');
  }
  const lost = await saved();
  assert.equal(lost.earth.result.outcome, 'defeat');
  await named('Return to the Mars ending');
  assert.equal((await saved()).campaign.narrativeFlags.earthFailed, true);
  await skip();
  await load(lost);
  await named('Retry the Earth mission');
  assert.equal((await saved()).earth.season, 1);
  for (let i = 1; i <= 8; i++) {
    for (const line of ['energia', 'reciclaje', 'agua', 'restauracion']) {
      const selector = '[data-earth-focus="' + line + '"]';
      for (let n = 0; n < (line === 'energia' || line === 'restauracion' ? 3 : 2); n++) {
        if (!await task((selector) => Boolean(document.querySelector(selector) && !document.querySelector(selector).disabled), selector)) break;
        await click(selector);
      }
    }
    await named('End season');
    if (i !== 8) await named('Plan the next season');
  }
  assert.equal((await saved()).earth.result.outcome, 'victory');
  const earthWon = await saved();
  await click('.result-screen .btn-primary');
  await skip();
  assert.ok((await saved()).campaign.narrativeFlags.endingSeen);
  console.log('Earth played all eight seasons for defeat and victory. Final cinematic reached. Metrics: '
    + JSON.stringify(earthWon.earth.indicators));
}
async function loseMarsAndStartFresh(arrival) {
  await load(arrival);
  for (let day = 1; day <= 10 && !(await saved()).mission.result; day++) {
    await click('.end-day');
    if (!(await saved()).mission.result) await named('Continue');
  }
  assert.equal((await saved()).mission.result.outcome, 'defeat');
  await navigate();
  await named('New game');
  await named('Yes');
  await click('.diff-card:nth-child(1)');
  await skip();
  const fresh = await saved();
  assert.equal(fresh.mission.level, 'luna');
  assert.equal(fresh.mission.day, 1);
  assert.deepEqual(fresh.campaign.appliedTransitions, []);
  assert.deepEqual(fresh.campaign.clues, []);
  console.log('Mars defeat and new campaign verified.');
}

try {
  const arrival = await setup();
  const marsWon = await mars();
  await earth(marsWon);
  await loseMarsAndStartFresh(arrival);
  assert.deepEqual(errors, []);
  assert.ok(assets.length > 20);
  assert.deepEqual(assets.filter(([status]) => status >= 400), []);
  console.log('No runtime exceptions and ' + new Set(assets.map((a) => a[1])).size + ' unique assets loaded.');
} finally {
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: instrumentation.identifier });
  socket.close();
}
