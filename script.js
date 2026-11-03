import { createInteractiveMap } from './map.js';

const DATA_URL = 'data/cosmos.json';

function createGalaxyCard(galaxy) {
  const link = document.createElement('a');
  link.className = 'galaxy-card';
  link.href = `explorer.html?galaxy=${encodeURIComponent(galaxy.id)}`;
  link.setAttribute('aria-label', `探索${galaxy.name}`);

  const artwork = document.createElement('span');
  artwork.className = 'galaxy-art';
  artwork.dataset.visual = galaxy.visual;
  artwork.setAttribute('aria-hidden', 'true');

  const content = document.createElement('span');
  content.className = 'galaxy-card-content';

  const distance = document.createElement('span');
  distance.className = 'card-overline';
  distance.textContent = galaxy.distance;

  const title = document.createElement('span');
  title.className = 'galaxy-card-title';
  title.textContent = galaxy.name;

  const summary = document.createElement('span');
  summary.className = 'galaxy-card-summary';
  summary.textContent = galaxy.summary;

  const footer = document.createElement('span');
  footer.className = 'card-footer';
  const count = galaxy.categories.length;
  footer.textContent = `${count} 個探索分類`;

  const arrow = document.createElement('span');
  arrow.className = 'card-arrow';
  arrow.textContent = '↗';
  arrow.setAttribute('aria-hidden', 'true');

  content.append(distance, title, summary, footer);
  link.append(artwork, content, arrow);
  return link;
}

async function loadGalaxies() {
  const container = document.getElementById('galaxy-cards');
  const mapContainer = document.getElementById('universe-map');
  const focusPanel = document.getElementById('galaxy-focus');

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`資料載入失敗（HTTP ${response.status}）`);
    }

    const catalog = await response.json();
    if (!Array.isArray(catalog.galaxies) || catalog.galaxies.length === 0) {
      throw new Error('星系資料格式不正確。');
    }

    let selectedGalaxy = catalog.galaxies[0];
    const showSelection = (galaxy) => {
      selectedGalaxy = galaxy;
      mapContainer.querySelectorAll('.map-node').forEach((node) => {
        node.classList.toggle('is-selected', node.dataset.id === galaxy.id);
      });

      const heading = document.createElement('h3');
      heading.textContent = galaxy.name;
      const type = document.createElement('p');
      type.className = 'focus-type';
      type.textContent = `${galaxy.type} · ${galaxy.distance}`;
      const summary = document.createElement('p');
      summary.textContent = galaxy.summary;
      const action = document.createElement('a');
      action.className = 'focus-action';
      action.href = `explorer.html?galaxy=${encodeURIComponent(galaxy.id)}`;
      action.textContent = '進入星系探索 →';
      focusPanel.replaceChildren(
        Object.assign(document.createElement('p'), {
          className: 'eyebrow',
          textContent: 'SELECTED DESTINATION'
        }),
        heading,
        type,
        summary,
        action
      );
    };

    const map = createInteractiveMap(catalog.galaxies, {
      mode: 'universe',
      selectedId: selectedGalaxy.id,
      onSelect: showSelection,
      getHref: (galaxy) => `explorer.html?galaxy=${encodeURIComponent(galaxy.id)}`
    });
    mapContainer.replaceChildren(map);
    const initialNode = mapContainer.querySelector(`.map-node[data-id="${selectedGalaxy.id}"]`);
    if (initialNode) initialNode.classList.add('is-selected');
    showSelection(selectedGalaxy);

    const fragment = document.createDocumentFragment();
    catalog.galaxies.forEach((galaxy) => fragment.append(createGalaxyCard(galaxy)));
    container.replaceChildren(fragment);
  } catch (error) {
    console.error('無法載入星系目錄：', error);
    const message = document.createElement('p');
    message.className = 'error-message';
    message.textContent = '星系資料暫時無法載入，請確認使用本機伺服器開啟網站後重試。';
    container.replaceChildren(message);
  }
}

loadGalaxies();
