export const BLOCK_MIN = 15;
export const SYMMETRIC_ROWS = 8;
export const MACHINE_IDS = ['A', 'B', 'C', 'D'];

export const PHRASES = {
  missOp: 'Falta escaneo de operador',
  missTech: 'Falta escaneo de técnico',
  missSpool: 'Falta escaneo de carrete',
  missRoute: 'Falta escaneo de hoja de ruta',
  headStopped: 'Cabezal detenido con operador',
  spoolStop: 'Carrete no avanza',
};

export const ICON = {
  check: '<svg viewBox="0 0 20 20"><path d="M7.629 14.571 3.2 10.143l1.414-1.414 3.015 3.015 7.757-7.757 1.414 1.414z"/></svg>',
  warn: '<svg viewBox="0 0 20 20"><path d="M10 2 1 18h18L10 2zm0 5 1 6H9l1-6zm-1 9h2v2H9v-2z"/></svg>',
  cross: '<svg viewBox="0 0 20 20"><path d="M5.293 5.293 10 10l4.707-4.707 1.414 1.414L11.414 11.414l4.707 4.707-1.414 1.414L10 12.828l-4.707 4.707-1.414-1.414 4.707-4.707-4.707-4.707z"/></svg>',
};

export const machinesState = {
  A: {
    name: 'Máquina A',
    gafeteOperador: true,
    gafeteTecnico: false,
    carreteEscaneado: true,
    hojaRuta: true,
    cabezalOperando: true,
    carreteConsumo: true,
    oee: 92,
    spoolPct: 78,
    parts: 240,
    scrap: 1,
  },
  B: {
    name: 'Máquina B',
    gafeteOperador: true,
    gafeteTecnico: false,
    carreteEscaneado: true,
    hojaRuta: false,
    cabezalOperando: false,
    carreteConsumo: true,
    oee: 81,
    spoolPct: 40,
    parts: 180,
    scrap: 3,
  },
  C: {
    name: 'Máquina C',
    gafeteOperador: true,
    gafeteTecnico: false,
    carreteEscaneado: true,
    hojaRuta: true,
    cabezalOperando: true,
    carreteConsumo: true,
    oee: 88,
    spoolPct: 63,
    parts: 210,
    scrap: 2,
  },
  D: {
    name: 'Máquina D',
    gafeteOperador: true,
    gafeteTecnico: false,
    carreteEscaneado: true,
    hojaRuta: true,
    cabezalOperando: true,
    carreteConsumo: true,
    oee: 87,
    spoolPct: 55,
    parts: 209,
    scrap: 8,
  },
};

export const timers = {
  A: { stoppedWithOpMin: 0, spoolWhileHeadOffMin: 0, idleMin: 0, techIdleMin: 0, lastSpoolPct: null, criticalHits: [] },
  B: { stoppedWithOpMin: 0, spoolWhileHeadOffMin: 0, idleMin: 0, techIdleMin: 0, lastSpoolPct: null, criticalHits: [] },
  C: { stoppedWithOpMin: 0, spoolWhileHeadOffMin: 0, idleMin: 0, techIdleMin: 0, lastSpoolPct: null, criticalHits: [] },
  D: { stoppedWithOpMin: 0, spoolWhileHeadOffMin: 0, idleMin: 0, techIdleMin: 0, lastSpoolPct: null, criticalHits: [] },
};

export const TTL = {
  headStoppedWithOp: 10,
  spoolWithHeadOff: 5,
  routeIdleExpire: 30,
  techAway: 20,
  criticalWindow: 60,
  block: BLOCK_MIN,
};

export const consecutiveOK = { A: 0, B: 0, C: 0, D: 0 };

let windowCache = null;

export const getWindowCache = () => windowCache;
export const setWindowCache = (cache) => {
  windowCache = cache;
};
