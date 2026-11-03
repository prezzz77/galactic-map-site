import { createInteractiveMap } from './map.js';

const DATA_URL = 'data/cosmos.json';
const params = new URLSearchParams(window.location.search);
const galaxyId = params.get('galaxy');
const categoryId = params.get('category');
const bodyId = params.get('body');
const content = document.getElementById('explorer-content');
const breadcrumbs = document.getElementById('breadcrumbs');

const fieldLabels = {
  diameter: '直徑',
  radius: '半徑',
  mass: '質量',
  distance: '距離地球',
  distanceFromParent: '與母星距離',
  orbitalPeriod: '軌道週期',
  rotationPeriod: '自轉週期',
  atmosphere: '表面／大氣',
  temperature: '溫度',
  moons: '已知衛星數',
  discovered: '發現／觀測'
};

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function makeLink(href, className, text) {
  const link = makeElement('a', className, text);
  link.href = href;
  return link;
}

function routeFor(galaxy, category, body) {
  const route = new URLSearchParams({ galaxy: galaxy.id });
  if (category) route.set('category', category.id);
  if (body) route.set('body', body.id);
  return `${body ? 'body.html' : 'explorer.html'}?${route.toString()}`;
}

function addBreadcrumb(label, href, current = false) {
  const item = makeElement('li');
  if (current) {
    const text = makeElement('span', 'breadcrumb-current', label);
    text.setAttribute('aria-current', 'page');
    item.append(text);
  } else {
    item.append(makeLink(href, '', label));
  }
  breadcrumbs.append(item);
}

function renderBreadcrumbs(galaxy, category, body) {
  breadcrumbs.replaceChildren();
  addBreadcrumb('宇宙', 'index.html', !galaxy);
  if (galaxy) addBreadcrumb(galaxy.name, routeFor(galaxy), !category);
  if (category) {
    addBreadcrumb(category.name, routeFor(galaxy, category), !body);
  }
  if (body) addBreadcrumb(body.name, routeFor(galaxy, category, body), true);
}

function makeBackLink(label, href) {
  return makeLink(href, 'back-link', `← ${label}`);
}

function makeArtwork(visual, className = 'planet-art') {
  const artwork = makeElement('div', className);
  artwork.dataset.visual = visual || 'unknown';
  artwork.setAttribute('role', 'img');
  artwork.setAttribute('aria-label', '天體示意圖');
  return artwork;
}

function makeHeader(kicker, title, description, backLink) {
  const header = makeElement('header', 'explorer-heading');
  const text = makeElement('div');
  text.append(makeElement('p', 'eyebrow', kicker), makeElement('h1', 'page-title', title));
  if (description) text.append(makeElement('p', 'page-intro', description));
  header.append(text, backLink);
  return header;
}

function makeMapSection(kicker, title, map) {
  const section = makeElement('section', 'exploration-map-section');
  const heading = makeElement('div', 'section-heading');
  const text = makeElement('div');
  text.append(makeElement('p', 'eyebrow', kicker), makeElement('h2', '', title));
  heading.append(text);
  section.append(heading, map);
  return section;
}

function createCategoryCard(galaxy, category) {
  const link = makeLink(routeFor(galaxy, category), 'catalog-card');
  const art = makeArtwork(category.visual, 'catalog-art');
  art.setAttribute('aria-hidden', 'true');

  const content = makeElement('span', 'catalog-card-content');
  content.append(
    makeElement('span', 'card-overline', category.type),
    makeElement('span', 'catalog-card-title', category.name),
    makeElement('span', 'catalog-card-summary', category.description),
    makeElement(
      'span',
      'card-footer',
      category.bodies.length
        ? `${category.bodies.length} 個代表天體`
        : '目前沒有已確認的代表天體'
    )
  );
  const arrow = makeElement('span', 'card-arrow', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  link.append(art, content, arrow);
  return link;
}

function createBodyCard(galaxy, category, body) {
  const link = makeLink(routeFor(galaxy, category, body), 'body-card');
  link.append(makeArtwork(body.visual, 'body-card-art'));
  const text = makeElement('span', 'body-card-content');
  text.append(
    makeElement('span', 'card-overline', body.kind),
    makeElement('span', 'body-card-title', body.name),
    makeElement('span', 'body-card-summary', body.summary)
  );
  const arrow = makeElement('span', 'card-arrow', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  link.append(text, arrow);
  return link;
}

function renderGalaxy(galaxy) {
  document.title = `${galaxy.name} — 宇宙漫遊`;
  renderBreadcrumbs(galaxy);
  const hero = makeElement('section', 'galaxy-overview');
  hero.append(makeArtwork(galaxy.visual, 'galaxy-artwork'));

  const copy = makeElement('div', 'galaxy-overview-copy');
  copy.append(
    makeElement('p', 'eyebrow', galaxy.type),
    makeElement('h1', 'page-title', galaxy.name),
    makeElement('p', 'page-intro', galaxy.description)
  );
  const distance = makeElement('p', 'distance-note');
  distance.append(makeElement('span', '', '觀測尺度'), makeElement('strong', '', galaxy.distance));
  copy.append(distance);
  hero.append(copy);

  const section = makeElement('section', 'catalog-section');
  const heading = makeElement('div', 'section-heading');
  const title = makeElement('div');
  title.append(makeElement('p', 'eyebrow', 'CHOOSE A CATEGORY'), makeElement('h2', '', '從分類開始探索'));
  heading.append(title, makeElement('p', 'section-hint', '選擇一個天體分類，繼續深入星圖'));
  section.append(heading);

  const grid = makeElement('div', 'catalog-grid');
  galaxy.categories.forEach((category) => grid.append(createCategoryCard(galaxy, category)));
  section.append(grid);

  const map = createInteractiveMap(galaxy.categories, {
    mode: 'galaxy',
    getHref: (category) => routeFor(galaxy, category)
  });
  const mapSection = makeMapSection(
    'GALACTIC ATLAS',
    '選擇星圖上的天體分類',
    map
  );
  content.replaceChildren(hero, mapSection, section);
}

function renderCategory(galaxy, category) {
  document.title = `${category.name} — ${galaxy.name} — 宇宙漫遊`;
  renderBreadcrumbs(galaxy, category);

  const heading = makeHeader(
    `${galaxy.name} / ${category.type}`,
    category.name,
    category.description,
    makeBackLink(`返回${galaxy.name}`, routeFor(galaxy))
  );
  const map = createInteractiveMap(category.bodies, {
    mode: category.id === 'solar-system' ? 'solar-system' : 'catalog',
    getHref: (body) => routeFor(galaxy, category, body)
  });
  const mapSection = makeMapSection(
    category.id === 'solar-system' ? 'ORBITAL MAP' : 'OBJECT MAP',
    category.id === 'solar-system' ? '太陽系軌道星圖' : '選擇星圖上的天體',
    map
  );
  const listSection = makeElement('section', 'catalog-section');
  const listHeading = makeElement('div', 'section-heading');
  listHeading.append(makeElement('h2', '', '天體目錄'));
  listSection.append(listHeading);
  const grid = makeElement('div', 'body-grid');

  category.bodies.forEach((body) => grid.append(createBodyCard(galaxy, category, body)));
  if (category.bodies.length) {
    listSection.append(grid);
  } else {
    const empty = makeElement('div', 'empty-state');
    empty.append(
      makeElement('span', 'empty-orbit', '○'),
      makeElement('h2', '', '這片星域仍在等待更多觀測'),
      makeElement('p', '', category.note || '目前尚無可列出的已確認代表天體。')
    );
    listSection.append(empty);
  }
  content.replaceChildren(heading, mapSection, listSection);
}

function createFactSection(title, label, entries) {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const section = makeElement('section', 'knowledge-section');
  const heading = makeElement('div', 'knowledge-heading');
  heading.append(makeElement('span', `knowledge-label ${label}`, label), makeElement('h2', '', title));
  const list = makeElement('ul', 'knowledge-list');
  entries.forEach((entry) => list.append(makeElement('li', '', entry)));
  section.append(heading, list);
  return section;
}

function renderBody(galaxy, category, body) {
  document.title = `${body.name} — ${category.name} — 宇宙漫遊`;
  renderBreadcrumbs(galaxy, category, body);
  const heading = makeHeader(
    `${galaxy.name} / ${category.name}`,
    body.name,
    body.summary,
    makeBackLink(`返回${category.name}`, routeFor(galaxy, category))
  );
  const detail = makeElement('section', 'body-detail');
  const visual = makeArtwork(body.visual, 'detail-art');
  const bodyCopy = makeElement('div', 'body-detail-copy');
  bodyCopy.append(
    makeElement('p', 'eyebrow', body.kind),
    makeElement('h2', '', body.name),
    makeElement('p', 'detail-description', body.description)
  );
  detail.append(visual, bodyCopy);

  const stats = makeElement('dl', 'facts-grid');
  Object.entries(fieldLabels).forEach(([key, label]) => {
    const value = body[key];
    if (value === undefined || value === null || value === '') return;
    const item = makeElement('div', 'fact-item');
    item.append(makeElement('dt', '', label), makeElement('dd', '', value));
    stats.append(item);
  });

  const knowledge = makeElement('section', 'knowledge-grid');
  const known = createFactSection('已知', 'known', body.known);
  const uncertain = createFactSection('目前未知', 'unknown', body.unknown);
  const inferred = createFactSection('科學家推測', 'inferred', body.inferred);
  [known, uncertain, inferred].filter(Boolean).forEach((section) => knowledge.append(section));

  const funFacts = createFactSection('你知道嗎？', 'fun-fact', body.funFacts);
  const source = makeElement('p', 'source-note');
  source.append(document.createTextNode('資料來源：'));
  const sourceLink = makeLink(body.source.url, 'source-link', body.source.name);
  sourceLink.target = '_blank';
  sourceLink.rel = 'noopener noreferrer';
  source.append(sourceLink, document.createTextNode(` · ${body.source.accessed}`));

  content.replaceChildren(heading, detail, stats, knowledge);
  if (funFacts) content.append(funFacts);
  content.append(source);
}

function renderError(message) {
  const section = makeElement('section', 'error-state');
  section.append(
    makeElement('p', 'eyebrow', 'STAR MAP ERROR'),
    makeElement('h1', '', '這條探索路線不存在'),
    makeElement('p', '', message),
    makeLink('index.html', 'button-link', '返回宇宙總覽')
  );
  breadcrumbs.replaceChildren();
  addBreadcrumb('宇宙', 'index.html', true);
  content.replaceChildren(section);
}

async function loadExplorer() {
  if (!galaxyId) {
    renderError('請先從宇宙首頁選擇一個星系，再開始探索。');
    return;
  }

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`資料載入失敗（HTTP ${response.status}）`);
    }
    const catalog = await response.json();
    const galaxy = catalog.galaxies.find((item) => item.id === galaxyId);
    if (!galaxy) {
      renderError('找不到這個星系，請回到總覽選擇其他星系。');
      return;
    }

    if (!categoryId) {
      renderGalaxy(galaxy);
      return;
    }
    const category = galaxy.categories.find((item) => item.id === categoryId);
    if (!category) {
      renderError('找不到這個分類，請返回星系頁面重新選擇。');
      return;
    }
    if (!bodyId) {
      renderCategory(galaxy, category);
      return;
    }
    const body = category.bodies.find((item) => item.id === bodyId);
    if (!body) {
      renderError('找不到這個天體，請返回分類頁面重新選擇。');
      return;
    }
    renderBody(galaxy, category, body);
  } catch (error) {
    console.error('無法載入探索資料：', error);
    renderError('探索資料暫時無法載入。請確認使用本機伺服器開啟網站後重試。');
  }
}

loadExplorer();
