import {
  BLOCK_MIN,
  SYMMETRIC_ROWS,
  MACHINE_IDS,
  PHRASES,
  machinesState,
  timers,
  TTL,
  consecutiveOK,
  getWindowCache,
  setWindowCache,
} from './data.js';

export function startOfBlock(date) {
  const copy = new Date(date);
  const minutes = copy.getMinutes();
  copy.setMinutes(Math.floor(minutes / BLOCK_MIN) * BLOCK_MIN, 0, 0);
  return copy;
}

export function addMinutes(date, minutes) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() + minutes);
  return copy;
}

export function formatHourMinute(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function classifyFromBooleans(state) {
  const scans = [state.gafeteOperador, state.gafeteTecnico, state.carreteEscaneado, state.hojaRuta];
  const machineFlags = [state.cabezalOperando, state.carreteConsumo];
  const missingScans = scans.filter((flag) => !flag).length;
  const missingMachineFlags = machineFlags.filter((flag) => !flag).length;

  if (missingScans === 0 && missingMachineFlags === 0) {
    return { sev: 'ok', causes: [] };
  }

  const causes = [];
  if (!state.gafeteOperador) causes.push(PHRASES.missOp);
  if (!state.gafeteTecnico) causes.push(PHRASES.missTech);
  if (!state.carreteEscaneado) causes.push(PHRASES.missSpool);
  if (!state.hojaRuta) causes.push(PHRASES.missRoute);
  if (!state.cabezalOperando && state.gafeteOperador) causes.push(PHRASES.headStopped);
  if (!state.carreteConsumo) causes.push(PHRASES.spoolStop);

  if (
    missingScans >= 3 ||
    (missingScans >= 2 && missingMachineFlags >= 1) ||
    (missingScans >= 1 && missingMachineFlags >= 2)
  ) {
    return { sev: 'bad', causes };
  }

  return { sev: 'warn', causes };
}

function randBool(probability) {
  return Math.random() < probability;
}

function randomFlags() {
  return {
    gafeteOperador: randBool(0.9),
    gafeteTecnico: randBool(0.3),
    carreteEscaneado: randBool(0.85),
    hojaRuta: randBool(0.85),
    cabezalOperando: randBool(0.85),
    carreteConsumo: randBool(0.85),
  };
}

function randomizeKPIs(machineState) {
  machineState.parts += Math.floor(Math.random() * 8);
  if (Math.random() > 0.9) machineState.scrap += 1;
  machineState.oee = Math.max(40, Math.min(98, Math.round(60 + Math.random() * 40)));
  machineState.spoolPct = Math.max(0, machineState.spoolPct - Math.floor(Math.random() * 3));
}

export function regenerateWindowCache() {
  const current = startOfBlock(new Date());
  const cache = [];

  for (let index = SYMMETRIC_ROWS; index > 0; index -= 1) {
    const date = addMinutes(current, -index * BLOCK_MIN);
    const row = { date, time: formatHourMinute(date), current: false, future: false, states: {} };

    MACHINE_IDS.forEach((id) => {
      const flags = randomFlags();
      const { sev, causes } = classifyFromBooleans(flags);
      row.states[id] = { sev, tooltip: causes.join(' | ') || 'OK' };
    });

    cache.push(row);
  }

  const rowNow = { date: current, time: formatHourMinute(current), current: true, future: false, states: {} };
  MACHINE_IDS.forEach((id) => {
    const { sev, causes } = classifyFromBooleans(machinesState[id]);
    rowNow.states[id] = { sev, tooltip: causes.join(' | ') || 'OK' };
  });
  cache.push(rowNow);

  for (let index = 1; index <= SYMMETRIC_ROWS; index += 1) {
    const date = addMinutes(current, index * BLOCK_MIN);
    cache.push({ date, time: formatHourMinute(date), current: false, future: true, states: {} });
  }

  setWindowCache(cache);
  return cache;
}

export function updateConsecutiveOK(cache = getWindowCache()) {
  if (!cache) return;
  const currentIndex = cache.findIndex((row) => row.current);

  MACHINE_IDS.forEach((id) => {
    let counter = 0;
    for (let index = currentIndex; index >= 0; index -= 1) {
      const row = cache[index];
      if (row.future) break;
      if (row.states[id]?.sev === 'ok') counter += 1;
      else break;
    }
    consecutiveOK[id] = counter * BLOCK_MIN;
  });
}

export function renderReadyCache() {
  return getWindowCache() ?? regenerateWindowCache();
}

export function randomizeCurrent() {
  MACHINE_IDS.forEach((id) => {
    const state = machinesState[id];
    const flip = (probability) => Math.random() < probability;

    if (flip(0.25)) state.cabezalOperando = !state.cabezalOperando;
    if (flip(0.25)) state.carreteConsumo = !state.carreteConsumo;
    if (flip(0.2)) state.gafeteOperador = Math.random() > 0.15;
    if (flip(0.15)) state.gafeteTecnico = Math.random() > 0.7;
    if (flip(0.2)) state.carreteEscaneado = Math.random() > 0.2;
    if (flip(0.2)) state.hojaRuta = Math.random() > 0.2;

    randomizeKPIs(state);
  });
}

export function applyRescanRules() {
  MACHINE_IDS.forEach((id) => {
    const state = machinesState[id];
    const timer = timers[id];
    if (timer.lastSpoolPct == null) timer.lastSpoolPct = state.spoolPct;

    if (!state.cabezalOperando && !state.carreteConsumo) timer.idleMin += TTL.block;
    else timer.idleMin = 0;

    if (!state.cabezalOperando && state.gafeteOperador) timer.stoppedWithOpMin += TTL.block;
    else timer.stoppedWithOpMin = 0;

    if (state.carreteConsumo && !state.cabezalOperando) timer.spoolWhileHeadOffMin += TTL.block;
    else timer.spoolWhileHeadOffMin = 0;

    if (state.gafeteTecnico && !state.cabezalOperando && !state.carreteConsumo) timer.techIdleMin += TTL.block;
    else timer.techIdleMin = 0;

    if (timer.stoppedWithOpMin >= TTL.headStoppedWithOp && state.gafeteOperador) state.gafeteOperador = false;
    if (timer.spoolWhileHeadOffMin >= TTL.spoolWithHeadOff && state.carreteEscaneado) state.carreteEscaneado = false;

    if (Math.abs((state.spoolPct ?? 0) - (timer.lastSpoolPct ?? 0)) >= 15 || (state.spoolPct ?? 0) > (timer.lastSpoolPct ?? 0)) {
      state.carreteEscaneado = false;
    }
    timer.lastSpoolPct = state.spoolPct;

    if (timer.idleMin >= TTL.routeIdleExpire && state.hojaRuta) state.hojaRuta = false;
    if (timer.techIdleMin >= TTL.techAway && state.gafeteTecnico) state.gafeteTecnico = false;

    const now = Date.now();
    timer.criticalHits = (timer.criticalHits || []).filter((timestamp) => now - timestamp <= TTL.criticalWindow * 60 * 1000);
    if ((timer.criticalHits || []).length >= 3) state.gafeteTecnico = false;
  });
}
