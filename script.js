const galaxySystems = [
  {
    id: 'A-01',
    label: 'A-01',
    x: 23,
    y: 22,
    size: 18,
    type: 'primary',
    status: 'Stable',
    className: 'G7p',
    distance: '12.4 AU',
    description: 'Primary waypoint with consistent signal density and stable portal conditions.',
    beacon: 'VIV-017',
    beaconNote: 'Stable portal residuals'
  },
  {
    id: 'A-14',
    label: 'A-14',
    x: 33,
    y: 34,
    size: 14,
    type: 'secondary',
    status: 'Scanning',
    className: 'K4f',
    distance: '18.6 AU',
    description: 'Dense orbital ring under active scan, suitable for route expansion.',
    beacon: 'RHO-92',
    beaconNote: 'High-energy drift'
  },
  {
    id: 'B-07',
    label: 'B-07',
    x: 48,
    y: 18,
    size: 14,
    type: 'secondary',
    status: 'Stable',
    className: 'M2a',
    distance: '11.3 AU',
    description: 'Low-noise corridor with fast travel windows and consistent stellar output.',
    beacon: 'TIB-44',
    beaconNote: 'Low signal variance'
  },
  {
    id: 'C-22',
    label: 'C-22',
    x: 62,
    y: 26,
    size: 16,
    type: 'tertiary',
    status: 'Watch',
    className: 'F8d',
    distance: '24.8 AU',
    description: 'Emergent cluster near a volatile relay gate; watch for route interference.',
    beacon: 'KOR-73',
    beaconNote: 'Relay interference'
  },
  {
    id: 'D-09',
    label: 'D-09',
    x: 76,
    y: 34,
    size: 13,
    type: 'secondary',
    status: 'Stable',
    className: 'A2v',
    distance: '20.5 AU',
    description: 'High-visibility route with clear alignment to the outbound lane network.',
    beacon: 'NEX-07',
    beaconNote: 'Strong signal lock'
  },
  {
    id: 'E-18',
    label: 'E-18',
    x: 84,
    y: 26,
    size: 18,
    type: 'primary',
    status: 'Priority',
    className: 'G2p',
    distance: '26.1 AU',
    description: 'Priority signal beacon with direct access to the western corridor.',
    beacon: 'VOR-61',
    beaconNote: 'Priority route lock'
  },
  {
    id: 'F-03',
    label: 'F-03',
    x: 56,
    y: 52,
    size: 20,
    type: 'primary',
    status: 'Stable',
    className: 'B5a',
    distance: '17.9 AU',
    description: 'Navigation anchor for the center branch with balanced route coverage.',
    beacon: 'LUM-08',
    beaconNote: 'Balanced pathing'
  },
  {
    id: 'G-41',
    label: 'G-41',
    x: 42,
    y: 62,
    size: 15,
    type: 'secondary',
    status: 'Scanning',
    className: 'K7d',
    distance: '29.4 AU',
    description: 'Dense asteroid fields slow traversal but reveal rich mineral traces.',
    beacon: 'MIR-34',
    beaconNote: 'Resource-rich field'
  },
  {
    id: 'H-12',
    label: 'H-12',
    x: 60,
    y: 71,
    size: 13,
    type: 'tertiary',
    status: 'Watch',
    className: 'F4t',
    distance: '30.7 AU',
    description: 'Fringe system with noisy signatures and shifting scan readings.',
    beacon: 'HAL-66',
    beaconNote: 'Signal jitter'
  },
  {
    id: 'J-29',
    label: 'J-29',
    x: 76,
    y: 58,
    size: 16,
    type: 'secondary',
    status: 'Stable',
    className: 'A9f',
    distance: '21.4 AU',
    description: 'High-speed route node with clear path lines and predictable movement.',
    beacon: 'SOL-19',
    beaconNote: 'Fast lane access'
  },
  {
    id: 'K-06',
    label: 'K-06',
    x: 18,
    y: 62,
    size: 12,
    type: 'secondary',
    status: 'Stable',
    className: 'M5q',
    distance: '16.8 AU',
    description: 'Outer edge waypoint for outbound explorers and long-haul craft.',
    beacon: 'TAL-91',
    beaconNote: 'Silent corridor'
  },
  {
    id: 'L-31',
    label: 'L-31',
    x: 28,
    y: 78,
    size: 13,
    type: 'tertiary',
    status: 'Watch',
    className: 'D3c',
    distance: '34.2 AU',
    description: 'Sparse signatures with variable heat plumes; not ideal for routine travel.',
    beacon: 'YON-13',
    beaconNote: 'Thermal variance'
  },
  {
    id: 'M-10',
    label: 'M-10',
    x: 67,
    y: 84,
    size: 18,
    type: 'primary',
    status: 'Priority',
    className: 'G9p',
    distance: '28.1 AU',
    description: 'Priority maintenance station anchored to the southern corridor.',
    beacon: 'AER-50',
    beaconNote: 'Service beacon online'
  },
  {
    id: 'N-27',
    label: 'N-27',
    x: 88,
    y: 72,
    size: 14,
    type: 'secondary',
    status: 'Stable',
    className: 'K3v',
    distance: '23.9 AU',
    description: 'Well-lit edge route with lower congestion and strong visual lock.',
    beacon: 'CIS-22',
    beaconNote: 'Low congestion'
  }
];

const routePairs = [
  ['A-01', 'B-07'],
  ['B-07', 'F-03'],
  ['F-03', 'J-29'],
  ['J-29', 'M-10'],
  ['A-01', 'A-14'],
  ['F-03', 'G-41'],
  ['G-41', 'L-31'],
  ['F-03', 'C-22'],
  ['C-22', 'E-18'],
  ['E-18', 'N-27']
];

function buildRouteLayer() {
  const layer = document.getElementById('route-layer');
  if (!layer) return;

  const points = new Map(galaxySystems.map((system) => [system.id, system]));

  routePairs.forEach(([fromId, toId]) => {
    const from = points.get(fromId);
    const to = points.get(toId);
    if (!from || !to) return;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.setAttribute('class', 'route-line');
    layer.appendChild(line);
  });
}

function updateSystemPanel(system) {
  const statusValue = document.getElementById('system-status');
  const systemId = document.getElementById('system-id');
  const systemClass = document.getElementById('system-class');
  const systemDistance = document.getElementById('system-distance');
  const systemDescription = document.getElementById('system-description');
  const primaryBeacon = document.getElementById('primary-beacon');
  const beaconNote = document.getElementById('beacon-note');

  statusValue.textContent = system.status;
  systemId.textContent = system.id;
  systemClass.textContent = system.className;
  systemDistance.textContent = system.distance;
  systemDescription.textContent = system.description;
  primaryBeacon.textContent = system.beacon;
  beaconNote.textContent = system.beaconNote;
}

function selectSystem(systemId) {
  const nodes = document.querySelectorAll('.system-node');
  nodes.forEach((node) => {
    const active = node.dataset.id === systemId;
    node.classList.toggle('selected', active);
  });

  const selectedSystem = galaxySystems.find((system) => system.id === systemId) || galaxySystems[0];
  updateSystemPanel(selectedSystem);
}

function renderGalaxySystems() {
  const layer = document.getElementById('system-layer');
  if (!layer) return;

  galaxySystems.forEach((system) => {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `system-node ${system.type}`;
    node.dataset.id = system.id;
    node.style.left = `${system.x}%`;
    node.style.top = `${system.y}%`;
    node.style.width = `${system.size}px`;
    node.style.height = `${system.size}px`;
    node.setAttribute('aria-label', `Select system ${system.id}`);
    node.addEventListener('click', () => selectSystem(system.id));

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = system.label;
    node.appendChild(label);
    layer.appendChild(node);
  });

  selectSystem(galaxySystems[0].id);
}

function bindToolbar() {
  const modeButtons = document.querySelectorAll('.tool-btn');
  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      modeButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
      const mode = button.dataset.mode;
      const mapPane = document.querySelector('.map-panel');
      mapPane?.setAttribute('data-mode', mode);
    });
  });
}

function bindSearch() {
  const searchInput = document.getElementById('system-search');
  const searchButton = document.getElementById('search-button');

  const findSystem = () => {
    const query = searchInput.value.trim().toUpperCase();
    if (!query) return;

    const match = galaxySystems.find((system) => system.id.toUpperCase().includes(query) || system.label.toUpperCase().includes(query));
    if (match) {
      selectSystem(match.id);
      const node = document.querySelector(`.system-node[data-id="${match.id}"]`);
      node?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  searchButton?.addEventListener('click', findSystem);
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') findSystem();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildRouteLayer();
  renderGalaxySystems();
  bindToolbar();
  bindSearch();
});
