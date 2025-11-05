import {
  BLOCK_MIN,
  machinesState,
  MACHINE_IDS,
} from './data.js';
import {
  startOfBlock,
  formatHourMinute,
  regenerateWindowCache,
  randomizeCurrent,
  applyRescanRules,
} from './logic.js';
import { renderTimeline, resizePanels } from './render.js';

document.addEventListener('DOMContentLoaded', () => {
  const timelineBox = document.getElementById('timelineBox');
  const rightCol = document.getElementById('rightCol');
  const timelineTable = document.getElementById('timeline');
  const summaryHost = document.getElementById('machines');
  const generateButton = document.getElementById('btnGenerate');

  const render = () => renderTimeline(timelineTable, summaryHost);

  resizePanels(timelineBox, rightCol);
  window.addEventListener('resize', () => resizePanels(timelineBox, rightCol));

  regenerateWindowCache();
  render();

  let lastLabel = '';
  setInterval(() => {
    const currentLabel = `${formatHourMinute(startOfBlock(new Date()))} – ${BLOCK_MIN} min`;
    if (currentLabel !== lastLabel) {
      randomizeCurrent();
      applyRescanRules();
      regenerateWindowCache();
      render();
      lastLabel = currentLabel;
    }
  }, 10000);

  generateButton.addEventListener('click', () => {
    randomizeCurrent();
    applyRescanRules();
    regenerateWindowCache();
    render();
  });
});

export { machinesState, MACHINE_IDS };
