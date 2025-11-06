import { MACHINE_IDS, ICON, consecutiveOK, machinesState } from './data.js';
import { classifyFromBooleans, renderReadyCache, updateConsecutiveOK } from './logic.js';

const chipOK = (title = 'OK') =>
  `<span class="chip ok" title="${title}"><span class="ico">${ICON.check}</span></span>`;
const chipWarn = (causes) =>
  `<span class="chip warn" title="${causes.join(' | ')}"><span class="ico">${ICON.warn}</span></span>`;
const chipBad = (causes) =>
  `<span class="chip bad" title="${causes.join(' | ')}"><span class="ico">${ICON.cross}</span></span>`;
const chipFuture = () => '<span class="chip future"></span>';

export function resizePanels(timelineBox, summaryColumn, offset = 80) {
  const height = window.innerHeight - offset;
  if (timelineBox) timelineBox.style.height = `${height}px`;
  if (summaryColumn) summaryColumn.style.height = `${height}px`;
}

export function renderTimeline(timelineTable, summaryHost) {
  const cache = renderReadyCache();
  const tbody = timelineTable.querySelector('tbody');
  tbody.innerHTML = '';

  let currentRow = null;
  cache.forEach((row) => {
    const tr = document.createElement('tr');
    tr.className = row.current ? 'current' : '';
    const cells = row.future
      ? MACHINE_IDS.map(() => `<td>${chipFuture()}</td>`).join('')
      : MACHINE_IDS.map((id) => {
          const state = row.states[id];
          if (!state) return `<td>${chipFuture()}</td>`;
          if (state.sev === 'ok') return `<td>${chipOK(state.tooltip)}</td>`;
          if (state.sev === 'warn')
            return `<td>${chipWarn(state.tooltip ? state.tooltip.split(' | ') : [])}</td>`;
          return `<td>${chipBad(state.tooltip ? state.tooltip.split(' | ') : [])}</td>`;
        }).join('');

    tr.innerHTML = `<td class="time">${row.time}</td>${cells}`;
    if (row.current) currentRow = tr;
    tbody.appendChild(tr);
  });

  if (currentRow) {
    setTimeout(() => currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  }

  updateConsecutiveOK(cache);
  renderSummary(summaryHost);
}

export function renderSummary(summaryHost) {
  summaryHost.innerHTML = '';

  MACHINE_IDS.forEach((id) => {
    const state = machinesState[id];
    const { sev } = classifyFromBooleans(state);

    const card = document.createElement('div');
    card.className = 'machine';
    card.innerHTML = `
      <div class="header">
        <strong>${state.name}</strong>
        <div class="state"><span class="dot ${sev}"></span><span class="badge">${formatSeverity(sev)}</span></div>
      </div>

      <div class="rows">
        <div class="row">Cabezal operando <span class="oval ${state.cabezalOperando ? 'ok' : 'bad'}"></span></div>
        <div class="row">Carrete en uso <span class="oval ${state.carreteConsumo ? 'ok' : 'bad'}"></span></div>
        <div class="row">Gafete de operador <span class="oval ${state.gafeteOperador ? 'ok' : 'bad'}"></span></div>
        <div class="row">Gafete de técnico <span class="oval ${state.gafeteTecnico ? 'ok' : 'bad'}"></span></div>
        <div class="row">Carrete escaneado <span class="oval ${state.carreteEscaneado ? 'ok' : 'bad'}"></span></div>
        <div class="row">Hoja de ruta <span class="oval ${state.hojaRuta ? 'ok' : 'bad'}"></span></div>
        <div class="row">Tiempo operando <span><strong>${consecutiveOK[id]} min</strong></span></div>
      </div>

      <div class="kpis">
        <div class="k"><div class="label">Piezas</div><div class="val">${state.parts}</div></div>
        <div class="k"><div class="label">Scrap</div><div class="val">${state.scrap}</div></div>
        <div class="k"><div class="label">OEE</div><div class="val">${state.oee}%</div></div>
        <div class="k"><div class="label">Carrete</div><div class="val">${state.spoolPct}%</div></div>
      </div>
    `;
    summaryHost.appendChild(card);
  });
}

function formatSeverity(severity) {
  if (severity === 'ok') return 'OK';
  if (severity === 'warn') return 'Advertencia';
  return 'Crítico';
}
