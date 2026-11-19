function outline(width, height, wavelength, project = (x, y) => [x, y], sweep = 1, startAtFront = false) {
  const inset = 2;
  const radius = Math.min(26, width / 2 - inset, height / 2 - inset);
  const left = inset, right = width - inset, top = inset, bottom = height - inset;
  const point = (x, y) => project(x, y).map(value => value.toFixed(2)).join(' ');
  const commands = ['M' + point(startAtFront ? right - radius : left + radius, top)];

  function side(x, y, dx, dy, length) {
    const count = Math.round(length / wavelength);
    if (!count) {
      commands.push('L' + point(x + dx * length, y + dy * length));
      return;
    }
    const step = length / count;
    const at = (distance, depth) => point(x + dx * distance - dy * depth, y + dy * distance + dx * depth);
    for (let i = 0; i < count; i++) {
      const start = i * step;
      commands.push('C' + at(start + step * .22, 0), at(start + step * .28, 2.6), at(start + step * .5, 2.6));
      commands.push('S' + at(start + step * .78, 0), at((i + 1) * step, 0));
    }
  }
  const corner = (x, y) => commands.push(`A${radius} ${radius} 0 0 ${sweep} ` + point(x, y));
  const across = right - left - 2 * radius;
  const down = bottom - top - 2 * radius;
  if (!startAtFront) side(left + radius, top, 1, 0, across);
  corner(right, top + radius);
  side(right, top + radius, 0, 1, down);
  corner(right - radius, bottom);
  side(right - radius, bottom, -1, 0, across);
  corner(left, bottom - radius);
  side(left, bottom - radius, 0, -1, down);
  corner(left + radius, top);
  if (startAtFront) side(left + radius, top, 1, 0, across);
  return commands.join(' ') + ' Z';
}


function drawWave(element, width, height, wavelength) {
  const path = outline(width, height, wavelength);
  const layer = (fill, stroke) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/></svg>`;
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  };
  element.style.setProperty('--wave-shape', layer('white', 'white'));
  element.style.setProperty('--wave-stroke', layer('none', 'white'));
}

const groups = [
  '.workplace-mode', '.panel-tabs', '.market-collections', '.shop-categories',
  '.workloads', '.wiring-modes', '.rgb-modes', '.price-history-periods',
  '.budget-purpose', '.background-city', '.background-grid', '.camera-views',
  '.fan-walls', '.fan-list', '.cable-list'
].join(', ');
const selection = ':scope > button:is([aria-selected=true], [aria-pressed=true], .active)';
const previous = new WeakMap();
const running = new WeakMap();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function directedOutline(rect, vertical, forward, front) {
  const {x, y, width, height} = rect;
  const project = vertical
    ? (u, v) => [x + width - v, y + (forward ? u : height - u)]
    : (u, v) => [x + (forward ? u : width - u), y + height - v];
  return outline(vertical ? height : width, vertical ? width : height, 34,
    project, Number(vertical === forward), front);
}

function stopTrace(group) {
  running.get(group)?.layer.remove();
  running.delete(group);
  group.removeAttribute('data-wave-tracing');
}

function traceSelection(group, from, to) {
  const dx = to.x + to.width / 2 - from.x - from.width / 2;
  const dy = to.y + to.height / 2 - from.y - from.height / 2;
  const vertical = Math.abs(dy) > Math.abs(dx);
  const forward = (vertical ? dy : dx) > 0;
  const layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  layer.classList.add('wave-trace');
  layer.setAttribute('aria-hidden', 'true');
  layer.setAttribute('focusable', 'false');
  group.append(layer);

  function path(data, cssClass) {
    const shape = document.createElementNS(layer.namespaceURI, 'path');
    shape.setAttribute('d', data);
    shape.setAttribute('class', cssClass);
    layer.append(shape);
    return shape;
  }
  const old = path(directedOutline(from, vertical, forward, true), 'wave-fill');
  const next = path(directedOutline(to, vertical, forward, false), 'wave-fill');
  let start = old.getPointAtLength(0);
  let startLength = old.getTotalLength();
  let lead = old.getAttribute('d').replace(/ Z$/, '');
  const prior = running.get(group);
  if (prior?.layer.isConnected) {
    const style = getComputedStyle(prior.line);
    const head = parseFloat(style.strokeDasharray) - parseFloat(style.strokeDashoffset);
    start = prior.line.getPointAtLength(head);
    startLength = 0;
    lead = `M${start.x} ${start.y}`;
    old.remove();
    prior.layer.animate([{opacity: 1}, {opacity: 0}], {duration: 65, fill: 'forwards'}).onfinish = () => prior.layer.remove();
  }
  const end = next.getPointAtLength(0);
  const run = vertical ? end.y - start.y : end.x - start.x;
  const bend = Math.min(4, Math.abs(run) / 8);
  const connector = vertical
    ? `C${start.x + bend} ${start.y + run / 3} ${end.x + bend} ${end.y - run / 3} ${end.x} ${end.y}`
    : `C${start.x + run / 3} ${start.y + bend} ${end.x - run / 3} ${end.y + bend} ${end.x} ${end.y}`;
  const line = path(lead + connector + next.getAttribute('d').replace(/^M[^A-Z]+/, '').replace(/ Z$/, ''), 'wave-line');
  const total = line.getTotalLength();
  const arrival = total - next.getTotalLength();
  const duration = 300;
  const options = {duration, fill: 'both', easing: 'cubic-bezier(.32,0,.32,1)'};
  const dash = (tail, head) => ({strokeDasharray: `${head - tail}px ${total + 2}px`, strokeDashoffset: -tail + 'px'});
  if (old.isConnected) old.animate([{opacity: 1}, {opacity: 0, offset: .68}, {opacity: 0}], options);
  next.animate([{opacity: 0}, {opacity: 0, offset: .2}, {opacity: 1}], options);
  group.setAttribute('data-wave-tracing', '');
  running.set(group, {layer, line});
  line.animate([
    dash(0, startLength),
    {...dash(startLength * .65, arrival), offset: .38},
    dash(arrival, total)
  ], options).onfinish = () => {
    if (running.get(group)?.layer === layer) stopTrace(group);
  };
}

function measureSelection(group) {
  const button = group.querySelector(selection);
  if (!button || !button.offsetWidth) {
    stopTrace(group);
    group.removeAttribute('data-wave-selection');
    previous.delete(group);
    return;
  }
  const last = previous.get(group);
  const width = button.offsetWidth, height = button.offsetHeight;
  const x = button.offsetLeft, y = button.offsetTop;
  if (last && last.width === width && last.height === height && last.x === x && last.y === y) return;

  if (!last || width !== last.width || height !== last.height) drawWave(group, width, height, 34);
  group.style.setProperty('--wave-x', x + 'px');
  group.style.setProperty('--wave-y', y + 'px');
  group.style.setProperty('--wave-width', width + 'px');
  group.style.setProperty('--wave-height', height + 'px');
  group.setAttribute('data-wave-selection', '');
  const target = {width, height, x, y, button};
  previous.set(group, target);
  if (last && last.button !== button && (x !== last.x || y !== last.y) && !reducedMotion.matches) {
    traceSelection(group, last, target);
  } else {
    stopTrace(group);
  }
}

const sizes = new ResizeObserver(entries => {
  for (const entry of entries) {
    const element = entry.target;
    if (element.hasAttribute('data-wave-group')) {
      measureSelection(element);
      continue;
    }
    const {inlineSize: width, blockSize: height} = entry.borderBoxSize[0];
    if (width >= 4 && height >= 4) drawWave(element, width, height, 40);
  }
});

function mount(element) {
  if (element.hasAttribute('data-wave-group')) return;
  if (element.matches(groups)) {
    element.setAttribute('data-wave-group', '');
    const changes = new MutationObserver(() => measureSelection(element));
    changes.observe(element, {subtree: true, childList: true, attributes: true, attributeFilter: ['aria-pressed', 'aria-selected', 'class']});
    measureSelection(element);
  }
  sizes.observe(element, {box: 'border-box'});
}

const targets = [groups, '.workshop-toolbar'].join(', ');
document.querySelectorAll(targets).forEach(mount);
const additions = new MutationObserver(records => {
  for (const record of records) for (const node of record.addedNodes) {
    if (node.nodeType !== 1) continue;
    if (node.matches(targets)) mount(node);
    node.querySelectorAll(targets).forEach(mount);
  }
});
additions.observe(document.body, {childList: true});
const studio = document.getElementById('studio');
if (studio) additions.observe(studio, {childList: true});
