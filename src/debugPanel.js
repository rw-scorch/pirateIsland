// Builds the debug panel DOM and wires it to a ship state object via callback.
// Keeps all DOM concerns out of state.js.

import { FACTIONS } from './state.js';

export function buildDebugPanel(container, ship, onChange) {
  container.innerHTML = '';
  container.appendChild(row('Hull condition', rangeInput(1, 4, ship.hullCondition, (v) => {
    ship.hullCondition = v;
    onChange();
  })));
  container.appendChild(row('Sail wear', rangeInput(1, 4, ship.sailWear, (v) => {
    ship.sailWear = v;
    onChange();
  })));
  container.appendChild(row('Faction', selectInput(FACTIONS.map((f) => [f.id, f.name]), ship.sailFaction, (v) => {
    ship.sailFaction = v;
    ship.flagFaction = v;
    onChange();
  })));
  container.appendChild(row('Crew count', rangeInput(0, 6, ship.crewCount, (v) => {
    ship.crewCount = v;
    onChange();
  })));
  container.appendChild(row('Mast', selectInput([[1, 'Intact'], [0, 'Down']], ship.mastIntact ? 1 : 0, (v) => {
    ship.mastIntact = !!v;
    onChange();
  })));
}

function row(label, control) {
  const wrap = document.createElement('div');
  wrap.className = 'debug-row';
  const lab = document.createElement('label');
  lab.textContent = label;
  wrap.appendChild(lab);
  wrap.appendChild(control);
  return wrap;
}

function rangeInput(min, max, value, cb) {
  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = '1';
  input.value = String(value);
  const out = document.createElement('span');
  out.textContent = String(value);
  const box = document.createElement('span');
  box.className = 'debug-control';
  box.appendChild(input);
  box.appendChild(out);
  input.addEventListener('input', () => {
    out.textContent = input.value;
    cb(Number(input.value));
  });
  return box;
}

function selectInput(options, value, cb) {
  const select = document.createElement('select');
  for (const [v, label] of options) {
    const opt = document.createElement('option');
    opt.value = String(v);
    opt.textContent = label;
    if (v === value) opt.selected = true;
    select.appendChild(opt);
  }
  select.addEventListener('change', () => {
    cb(Number(select.value));
  });
  return select;
}
