const svgNamespace = 'http://www.w3.org/2000/svg';

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function getPosition(item, mode, index, count) {
  if (mode === 'universe') {
    const columns = 2;
    const rows = Math.ceil(count / columns);
    return [
      ((index % columns) + 0.5) * (100 / columns),
      (Math.floor(index / columns) + 0.5) * (100 / rows)
    ];
  }

  if (mode === 'solar-system') {
    if (item.id === 'sun') return [50, 50];
    const positions = [
      [48, 39],
      [62, 39],
      [71, 50],
      [66, 64],
      [52, 77],
      [35, 72],
      [26, 53],
      [37, 36]
    ];
    return positions[(index - 1) % positions.length];
  }

  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(count, 1);
  const radius = mode === 'galaxy' ? 34 : 31;
  return [50 + radius * Math.cos(angle), 50 + radius * Math.sin(angle)];
}

function addStars(canvas, mode) {
  const starCount = mode === 'universe' ? 64 : 44;
  for (let index = 0; index < starCount; index += 1) {
    const star = makeElement('span', 'map-star');
    const x = (index * 47 + 13) % 97;
    const y = (index * 67 + 7) % 91;
    const size = index % 13 === 0 ? 2 : 1;
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.setProperty('--star-size', `${size}px`);
    star.style.setProperty('--star-opacity', String(0.24 + (index % 5) * 0.12));
    canvas.append(star);
  }
}

function addOrbitLayer(canvas) {
  const svg = document.createElementNS(svgNamespace, 'svg');
  svg.classList.add('orbit-layer');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');

  [8, 12, 16, 20, 24, 28, 32, 36].forEach((radius) => {
    const orbit = document.createElementNS(svgNamespace, 'ellipse');
    orbit.setAttribute('cx', '50');
    orbit.setAttribute('cy', '50');
    orbit.setAttribute('rx', String(radius));
    orbit.setAttribute('ry', String(radius * 0.78));
    orbit.setAttribute('class', 'orbit-line');
    svg.append(orbit);
  });
  canvas.append(svg);
}

function addGalaxyRegions(canvas, galaxies) {
  const columns = 2;
  const rows = Math.ceil(galaxies.length / columns);
  galaxies.forEach((galaxy, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const region = makeElement('div', `map-sector map-sector-${index % 4}`);
    region.style.left = `calc(${column * (100 / columns)}% + 5px)`;
    region.style.top = `calc(${row * (100 / rows)}% + 5px)`;
    region.style.width = `calc(${100 / columns}% - 10px)`;
    region.style.height = `calc(${100 / rows}% - 10px)`;
    region.append(
      makeElement('span', 'map-sector-index', `區域 ${String(index + 1).padStart(2, '0')}`),
      makeElement('strong', 'map-sector-name', galaxy.name)
    );
    region.setAttribute('aria-hidden', 'true');
    canvas.append(region);
  });
}

function createMapNode(item, index, count, options) {
  const { mode, getHref, onSelect, selectedId } = options;
  const isDense = mode === 'catalog' && count > 8;
  const [x, y] = getPosition(item, mode, index, count);
  const isSelected = selectedId === item.id;
  const node = getHref
    ? document.createElement('a')
    : document.createElement('button');

  if (getHref) {
    node.href = getHref(item);
    if (onSelect) {
      node.addEventListener('mouseenter', () => onSelect(item));
      node.addEventListener('focus', () => onSelect(item));
    }
  } else {
    node.type = 'button';
    node.addEventListener('click', () => onSelect(item));
  }
  node.className = `map-node${isSelected ? ' is-selected' : ''}`;
  node.dataset.id = item.id;
  node.dataset.visual = item.visual || 'unknown';
  node.dataset.palette = String(index % 4);
  if (!isDense) {
    node.style.left = `${x}%`;
    node.style.top = `${y}%`;
    if (y > 65) node.classList.add('label-above');
  }
  if (mode === 'solar-system') {
    const labelPositions = [
      'right',
      'above',
      'right',
      'right',
      'below',
      'left',
      'left',
      'above',
      'above'
    ];
    node.classList.add(`label-${labelPositions[index % labelPositions.length]}`);
  } else if (mode === 'universe') {
    node.classList.add('map-node-galaxy');
  }
  node.setAttribute('aria-label', `探索${item.name}`);

  const marker = makeElement('span', 'map-node-marker');
  marker.setAttribute('aria-hidden', 'true');
  const label = makeElement('span', 'map-node-label');
  if (mode === 'universe') {
    label.append(makeElement('small', 'map-node-kicker', `星系 ${String(index + 1).padStart(2, '0')}`));
  }
  label.append(makeElement('strong', '', item.name));
  if (mode !== 'solar-system' && mode !== 'universe') {
    label.append(makeElement('small', '', item.type || item.kind || ''));
  }
  node.append(marker, label);
  return node;
}

export function createInteractiveMap(items, options) {
  const { mode, getHref, onSelect, selectedId } = options;
  const section = makeElement('section', `map-console map-console-${mode}`);
  const isDense = mode === 'catalog' && items.length > 8;
  if (isDense) section.classList.add('is-dense');
  const canvas = makeElement('div', 'interactive-map');
  canvas.setAttribute('role', 'group');
  canvas.setAttribute(
    'aria-label',
    mode === 'solar-system' ? '太陽系軌道示意圖' : '可互動星圖'
  );
  addStars(canvas, mode);

  if (mode === 'universe') {
    addGalaxyRegions(canvas, items);
  }

  if (mode === 'solar-system') {
    addOrbitLayer(canvas);
    const core = makeElement('span', 'map-core map-core-sun');
    core.setAttribute('aria-hidden', 'true');
    canvas.append(core);
  } else if (!isDense) {
    const core = makeElement('span', 'map-core');
    if (mode !== 'universe') {
      core.append(makeElement('span', '', '星系中心'));
    }
    core.setAttribute('aria-hidden', 'true');
    canvas.append(core);
  }

  items.forEach((item, index) => {
    canvas.append(createMapNode(item, index, items.length, options));
  });
  section.append(canvas);

  if (mode === 'solar-system') {
    section.append(makeElement('p', 'map-caption', '軌道與天體大小為示意圖，並非按實際比例呈現。'));
  } else if (mode !== 'universe') {
    section.append(makeElement('p', 'map-caption', '天體位置為探索導覽示意，不代表實際空間尺度。'));
  }
  return section;
}
