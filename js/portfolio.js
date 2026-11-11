// ============================================
// PORTFOLIO PDF BUILDER
// Builds print-ready pages from the site's JSON files; the browser's
// "Save as PDF" turns them into the portfolio. The layout is an editorial
// template: oversized uppercase headings, large page numbers, thin labelled
// rules and a shared footer on every page.
// ============================================

const PAGE_SIZES = {
  a4: { short: 210, long: 297, scale: 1 },
  a3: { short: 297, long: 420, scale: 1.414 }
};

const MM = 96 / 25.4; // CSS pixels per millimetre

// Strings used only in the PDF
const LABELS = {
  pt: {
    portfolio: 'Portfólio', introduction: 'Introdução', education: 'Formação', participations: 'Participações',
    skills: 'Competências', software: 'Software', learning: 'Em aprendizagem', languages: 'Línguas',
    publications: 'Publicações', research: 'Investigação', project: 'Projeto', thanks: 'Obrigada',
    contact: 'Contacto', email: 'Email', location: 'Localização', mobility: 'Mobilidade', page: 'Pág.',
    role: 'Arquitetura', native: 'Nativa',
    tagline: 'Projetos académicos, desenhos, maquetes e processo de projeto.'
  },
  en: {
    portfolio: 'Portfolio', introduction: 'Introduction', education: 'Education', participations: 'Participations',
    skills: 'Skills', software: 'Software', learning: 'Learning', languages: 'Languages',
    publications: 'Publications', research: 'Research', project: 'Project', thanks: 'Thank you',
    contact: 'Contact', email: 'Email', location: 'Location', mobility: 'Mobility', page: 'p.',
    role: 'Architecture', native: 'Native',
    tagline: 'Academic projects, drawings, models and design process.'
  },
  es: {
    portfolio: 'Portafolio', introduction: 'Introducción', education: 'Formación', participations: 'Participaciones',
    skills: 'Competencias', software: 'Software', learning: 'Aprendiendo', languages: 'Idiomas',
    publications: 'Publicaciones', research: 'Investigación', project: 'Proyecto', thanks: 'Gracias',
    contact: 'Contacto', email: 'Email', location: 'Ubicación', mobility: 'Movilidad', page: 'Pág.',
    role: 'Arquitectura', native: 'Nativo',
    tagline: 'Proyectos académicos, dibujos, maquetas y proceso de proyecto.'
  }
};

const AUTHOR = 'Carlota Azenha da Rocha';
const MONOGRAM = 'car';
const WEBSITE = 'carlotaazenharocha.github.io';
const METADATA_FIELDS = ['year', 'location', 'typology', 'context', 'institution', 'teachers'];
const STORAGE_KEY = 'portfolio-builder-v2';

let projects = [];
let translations = null;
let about = null;
let research = null;
let participations = [];

// Image width / height by source; null when the image could not be loaded
const aspectRatios = new Map();
let renderToken = 0;

const state = {
  includeResearch: true,
  selected: [],
  format: 'a4',
  orientation: 'landscape',
  lang: 'pt'
};

// ============================================
// HELPERS
// ============================================

function getText(obj) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[state.lang] || obj.en || obj.pt || '';
}

function label(key) {
  return LABELS[state.lang][key];
}

function metadataLabel(field) {
  const labels = translations?.[state.lang]?.project?.metadata_labels;
  return labels?.[field] || field;
}

// Create an element with a class and optional text
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

// Size in CSS pixels of a length given in millimetres at A4 scale
function mm(value) {
  return value * MM * PAGE_SIZES[state.format].scale;
}

function paragraphs(value) {
  return getText(value).split(/\n\s*\n/).filter(Boolean);
}

// Image that fills its frame (cropped), used for the layout's picture slots
function picture(src, className = '') {
  const frame = el('div', `picture ${className}`);
  if (src) {
    const img = el('img');
    img.src = src;
    img.alt = '';
    frame.appendChild(img);
  }
  return frame;
}

// Thin labelled rules: label on the left, value on the right
function rules(items, className = '') {
  const list = el('dl', `rules ${className}`);
  items.forEach(item => {
    const row = el('div', 'rule');
    row.append(el('dt', null, item.label), el('dd', null, item.value || ''));
    list.appendChild(row);
  });
  return list;
}

// Placeholder for the page number, filled in once every page exists
function bigNumber() {
  return el('div', 'big-number');
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Storage unavailable (private mode): choices just aren't remembered
  }
}

// Returns true when saved choices were found
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      Object.assign(state, saved);
      return true;
    }
  } catch (error) {
    // Ignore unreadable storage
  }
  return false;
}

function loadAspectRatio(src) {
  if (aspectRatios.has(src)) return Promise.resolve();
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      aspectRatios.set(src, img.naturalWidth / img.naturalHeight);
      resolve();
    };
    img.onerror = () => {
      aspectRatios.set(src, null);
      resolve();
    };
    img.src = src;
  });
}

function available(src) {
  return Boolean(src && aspectRatios.get(src));
}

// ============================================
// PAGE SHELL
// ============================================

function addFooter(page) {
  const footer = el('footer', 'page-footer');
  const left = el('div', 'footer-left');
  left.append(el('span', null, AUTHOR), el('span', null, `${label('portfolio')} ${new Date().getFullYear()}`));
  footer.append(left, el('div', 'footer-mark', MONOGRAM), el('div', 'footer-right', WEBSITE));
  page.appendChild(footer);
}

// Appends a page and returns its content area
function addPage(className) {
  const page = el('section', `page ${className}`);
  const body = el('div', 'page-body');
  page.appendChild(body);
  addFooter(page);
  document.getElementById('pages').appendChild(page);
  return body;
}

function pageCount() {
  return document.querySelectorAll('#pages .page').length;
}

// ============================================
// OPENING PAGES
// ============================================

function addCover(image) {
  const body = addPage('page-layout page-cover');
  const top = el('div', 'cover-top');
  top.append(el('span', null, AUTHOR), el('span', null, String(new Date().getFullYear())));

  const title = el('div', 'cover-title-block');
  title.append(el('div', 'cover-mark', MONOGRAM), el('h1', 'cover-title', label('portfolio')), el('p', 'cover-tagline', label('tagline')));
  body.append(top, picture(image, 'cover-picture'), title);
}

function addIntroduction(images) {
  const body = addPage('page-layout layout-intro');
  const intro = about ? getText(about.intro) : [];

  const text = el('div', 'intro-text');
  text.append(el('div', 'small-heading', `${AUTHOR}\n${label('role')}`), el('p', null, intro[0] || ''));

  const side = el('div', 'intro-side');
  side.append(bigNumber(), rules([
    { label: label('email'), value: about?.contact?.email },
    { label: label('location'), value: getText(about?.contact?.location) },
    { label: label('mobility'), value: getText(about?.contact?.availability) }
  ]));

  body.append(
    el('h2', 'heading', label('introduction')),
    picture(images[0], 'intro-picture'),
    text,
    picture(images[1], 'intro-picture-tall'),
    side
  );
}

function addNamePage(image) {
  const body = addPage('page-layout layout-name');
  const intro = about ? getText(about.intro) : [];
  body.append(
    picture(image, 'name-picture'),
    el('h2', 'heading heading-name', AUTHOR),
    el('p', 'name-text', intro[1] || label('tagline'))
  );
}

function addEducationPage(images) {
  const body = addPage('page-layout layout-list');
  const items = (about?.education || []).map(item => ({
    label: `${getText(item.title)} — ${getText(item.institution)}`,
    value: getText(item.date)
  }));
  if (about?.thesis) {
    items.unshift({
      label: `${getText(about.thesis.title)} — ${getText(about.thesis.institution)}`,
      value: getText(about.thesis.date)
    });
  }

  const title = el('div', 'list-title');
  title.append(bigNumber(), el('h2', 'heading', label('education')));
  body.append(title, picture(images[0], 'list-picture'), picture(images[1], 'list-picture-small'), rules(items, 'list-rules'));
}

function addParticipationsPage(images) {
  const body = addPage('page-layout layout-experience');
  const items = [...participations]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map(item => ({ label: getText(item.title), value: getText(item.dateDisplay) || item.date }));

  const publications = (about?.publications || []).map(item => ({
    label: `${getText(item.title)} — ${getText(item.institution)}`,
    value: item.date
  }));

  const lists = el('div', 'experience-lists');
  lists.append(rules(items, 'list-rules'));
  if (publications.length) {
    lists.append(el('div', 'small-heading spaced', label('publications')), rules(publications, 'list-rules'));
  }

  body.append(
    el('h2', 'heading', label('participations')),
    picture(images[0], 'experience-picture'),
    bigNumber(),
    lists,
    picture(images[1], 'experience-picture-right')
  );
}

function addSkillsPage(images) {
  const body = addPage('page-layout layout-skills');
  const skills = about?.skills || {};
  const languages = (about?.languages || []).map(item => ({
    label: item.name,
    value: item.level === 'native' ? label('native') : item.level
  }));

  const lists = el('div', 'skills-lists');
  lists.append(
    rules((skills.experienced || []).map(name => ({ label: name, value: label('software') }))),
    rules((skills.learning || []).map(name => ({ label: name, value: label('learning') }))),
    el('div', 'small-heading spaced', label('languages')),
    rules(languages)
  );

  body.append(
    picture(images[0], 'skills-picture'),
    el('h2', 'heading', label('skills')),
    lists,
    bigNumber(),
    picture(images[1], 'skills-picture-small')
  );
}

// Section opener: list of every chapter with its first page
function addPortfolioPage(images) {
  const body = addPage('page-layout layout-portfolio');
  const index = rules([], 'portfolio-index');
  body.append(
    el('p', 'lead portfolio-lead', label('tagline')),
    picture(images[0], 'portfolio-picture'),
    picture(images[1], 'portfolio-picture-2'),
    el('h2', 'heading portfolio-heading', label('portfolio')),
    picture(images[2], 'portfolio-picture-small'),
    bigNumber(),
    index
  );
  return index;
}

function fillIndex(index, entries) {
  entries.forEach(entry => {
    const row = el('div', 'rule');
    row.append(el('dt', null, entry.title), el('dd', null, `${label('page')} ${entry.startPage}`));
    index.appendChild(row);
  });
}

function addThanksPage(image) {
  const body = addPage('page-layout layout-thanks');
  const contact = about?.contact || {};
  body.append(
    picture(image, 'thanks-picture'),
    el('h2', 'heading heading-thanks', label('thanks')),
    rules([
      { label: label('email'), value: contact.email },
      { label: label('location'), value: getText(contact.location) },
      { label: label('mobility'), value: getText(contact.availability) },
      { label: 'LinkedIn', value: contact.linkedin?.label }
    ], 'thanks-rules')
  );
}

// ============================================
// IMAGE PAGES
// Every image row fills the page width at a shared height (a justified
// layout), and the block is scaled down and centred when it is too tall.
// The images of a chapter are split into pages by comparing every possible
// grouping: few pages, little shrinking and well-filled pages win.
// ============================================

const MAX_PER_PAGE = 6;
const MAX_PER_ROW = 3;
const SHRINK_COST = 1;   // cost of an image shown at a fraction of its largest size
const EMPTY_COST = 0.8;  // cost of the page area left empty
const MIN_SIZE = 0.08;   // an image is never shown below this fraction of its largest size

function aspect(image) {
  return aspectRatios.get(image.src);
}

// Every way to split n images into consecutive rows of 1 to MAX_PER_ROW
function rowSplits(n) {
  if (n === 0) return [[]];
  const splits = [];
  for (let first = 1; first <= Math.min(MAX_PER_ROW, n); first++) {
    rowSplits(n - first).forEach(rest => splits.push([first, ...rest]));
  }
  return splits;
}

// Rows of one page and the cost of that page, or null when it cannot work
function planPage(group, sizes, width, height) {
  const gap = mm(4);
  const caption = mm(5);
  let start = 0;
  const rows = sizes.map(count => {
    const images = group.slice(start, start += count);
    const sum = images.reduce((total, image) => total + aspect(image), 0);
    return { images, height: (width - gap * (count - 1)) / sum };
  });

  const fixed = rows.length * caption + (rows.length - 1) * gap;
  const natural = rows.reduce((total, row) => total + row.height, 0);
  const scale = Math.min(1, (height - fixed) / natural);
  if (scale <= 0) return null;

  let covered = 0;
  let shrink = 0;
  for (const row of rows) {
    row.height *= scale;
    for (const image of row.images) {
      const ratio = aspect(image);
      const area = row.height * row.height * ratio;
      const alone = Math.min(width / ratio, height - caption);
      const size = area / (alone * alone * ratio);
      if (size < MIN_SIZE) return null;
      covered += area;
      shrink += 1 - size;
    }
  }
  return { rows, cost: 1 + SHRINK_COST * shrink + EMPTY_COST * (1 - covered / (width * height)) };
}

// Cheapest split of the images into pages, keeping their order
function planPages(images, width, height) {
  const best = new Array(images.length + 1).fill(null);
  best[images.length] = { cost: 0, pages: [] };
  for (let i = images.length - 1; i >= 0; i--) {
    for (let count = 1; count <= Math.min(MAX_PER_PAGE, images.length - i); count++) {
      const group = images.slice(i, i + count);
      for (const sizes of rowSplits(count)) {
        const page = planPage(group, sizes, width, height);
        if (!page) continue;
        const cost = page.cost + best[i + count].cost;
        if (!best[i] || cost < best[i].cost) best[i] = { cost, pages: [page.rows, ...best[i + count].pages] };
      }
    }
    // A single image always fits, so every position has a plan
    if (!best[i]) best[i] = { cost: Infinity, pages: [] };
  }
  return best[0].pages;
}

function buildRow(row) {
  const node = el('div', 'image-row');
  row.images.forEach(image => {
    const figure = el('figure', 'figure');
    figure.style.width = `${row.height * aspect(image)}px`;
    const img = el('img');
    img.src = image.src;
    img.alt = getText(image.caption);
    img.style.height = `${row.height}px`;
    figure.appendChild(img);
    figure.appendChild(el('figcaption', null, getText(image.caption)));
    node.appendChild(figure);
  });
  return node;
}

function addImagePage(heading, subtitle) {
  const body = addPage('page-images');
  const top = el('div', 'images-top');
  const name = el('div', 'images-heading');
  name.append(el('span', 'images-title', heading), el('span', 'images-subtitle', subtitle));
  top.append(name, bigNumber());
  const area = el('div', 'image-area');
  body.append(top, area);
  return area;
}

// Splits the images by section (each section starts a page) and lays them out
function addImagePages(images, heading, title) {
  const groups = [];
  images.filter(image => image.type !== 'video').forEach(image => {
    if (image.section || !groups.length) groups.push({ section: getText(image.section), images: [] });
    if (available(image.src)) groups[groups.length - 1].images.push(image);
  });

  groups.filter(group => group.images.length).forEach(group => {
    const subtitle = group.section ? `${title} · ${group.section}` : title;
    let area = addImagePage(heading, subtitle);
    const pages = planPages(group.images, area.clientWidth, area.clientHeight);
    pages.forEach((rows, i) => {
      if (i) area = addImagePage(heading, subtitle);
      rows.forEach(row => area.appendChild(buildRow(row)));
    });
  });
}

// ============================================
// CHAPTERS
// ============================================

// Shrink the text until the block fits its grid cell (measured at real size)
function shrinkToFit(block) {
  let size = parseFloat(getComputedStyle(block).fontSize);
  const minimum = size * 0.6;
  const overflowing = () => block.scrollHeight > block.clientHeight + 1 || block.scrollWidth > block.clientWidth + 1;
  while (overflowing() && size > minimum) {
    size -= 0.25;
    block.style.fontSize = `${size}px`;
  }
  block.classList.toggle('overflowing', overflowing());
}

// First-page layouts: grid span of the main picture (columns × rows) and the
// grid span of each secondary picture
const PROJECT_LAYOUTS = {
  a: { cover: [4, 4], extras: [[4, 4], [4, 4]] },
  b: { cover: [5, 7], extras: [[2, 3]] },
  c: { cover: [3, 5], extras: [[3, 5]] },
  d: { cover: [8, 5], extras: [[4, 4]] }
};

// Width / height of a block spanning the given grid cells of a layout page
function spanAspect(body, [columns, rows]) {
  const gap = mm(4);
  const cellWidth = (body.clientWidth - gap * 11) / 12;
  const cellHeight = (body.clientHeight - gap * 7) / 8;
  return (columns * cellWidth + (columns - 1) * gap) / (rows * cellHeight + (rows - 1) * gap);
}

// How far an image is from the shape of its frame (1 = same shape)
function mismatch(ratio, frame) {
  return Math.max(ratio / frame, frame / ratio);
}

let previousVariant = null;

// The layout whose main picture best matches the cover; the previous layout
// is only repeated when every other one would crop the cover too much
function chooseVariant(body, cover) {
  const ratio = aspectRatios.get(cover) || 1;
  const ranked = Object.keys(PROJECT_LAYOUTS)
    .map(key => ({ key, fit: mismatch(ratio, spanAspect(body, PROJECT_LAYOUTS[key].cover)) }))
    .sort((x, y) => x.fit - y.fit);
  const choice = ranked[0].key === previousVariant && ranked[1].fit <= 1.5 ? ranked[1] : ranked[0];
  previousVariant = choice.key;
  return choice.key;
}

function addProject(project, index) {
  const number = String(index + 1);
  const heading = `${label('project')} / ${number}`;
  const title = getText(project.title);
  const [lead, ...rest] = paragraphs(project.concept);
  const images = (project.images || []).filter(image => image.type !== 'video' && available(image.src));
  const cover = available(project.thumbnail) ? project.thumbnail : images[0]?.src;

  const body = addPage('page-layout layout-project');
  const variant = chooseVariant(body, cover);
  body.parentElement.classList.add(`layout-project-${variant}`);

  const meta = rules(METADATA_FIELDS.filter(field => project[field]).map(field => ({
    label: metadataLabel(field),
    value: getText(project[field])
  })), 'project-rules');
  const text = el('div', 'project-text');
  rest.forEach(paragraph => text.appendChild(el('p', null, paragraph)));

  const titleBlock = el('div', 'project-title');
  titleBlock.append(el('h2', 'heading', heading), el('div', 'project-name', title));

  // Secondary pictures: among the first images, the ones that best fit each frame
  const candidates = images.filter(image => image.src !== cover).slice(0, 8);
  const extra = [];
  PROJECT_LAYOUTS[variant].extras.forEach(span => {
    const frame = spanAspect(body, span);
    const best = candidates
      .filter(image => !extra.includes(image))
      .sort((x, y) => mismatch(aspect(x), frame) - mismatch(aspect(y), frame))[0];
    if (best) extra.push(best);
  });
  // Keep the project's order on the page
  extra.sort((x, y) => images.indexOf(x) - images.indexOf(y));

  body.append(titleBlock, picture(cover, 'project-picture'));
  extra.forEach((image, i) => body.appendChild(picture(image.src, `project-picture-${i + 2}`)));
  body.append(el('p', 'lead project-lead', lead || ''), text, bigNumber(), meta);

  // Images already on the first page are left out, but their section carries on
  const used = new Set([cover, ...extra.map(image => image.src)]);
  const remaining = [];
  let section = null;
  (project.images || []).forEach(image => {
    if (image.section) section = image.section;
    if (image.type === 'video' || !available(image.src) || used.has(image.src)) return;
    remaining.push(section ? { ...image, section } : image);
    section = null;
  });
  addImagePages(remaining, heading, title);
}

function addResearchCase(image, image2) {
  const body = addPage('page-layout layout-case');
  const [lead, ...rest] = paragraphs(research.abstract);
  const text = el('div', 'project-text');
  rest.forEach(paragraph => text.appendChild(el('p', null, paragraph)));

  body.append(
    bigNumber(),
    picture(image, 'case-picture'),
    el('h2', 'heading case-heading', getText(research.title)),
    el('p', 'lead case-lead', lead || ''),
    text,
    picture(image2, 'case-picture-2'),
    rules((research.metadata || []).map(item => ({ label: getText(item.label), value: getText(item.value) })), 'case-rules'),
    el('div', 'small-heading case-label', getText(research.label))
  );
}

function addTimelinePage(section) {
  const body = addPage('page-layout layout-timeline');
  const title = el('div', 'list-title');
  title.append(bigNumber(), el('h2', 'heading', getText(section.title)));

  const list = el('ol', 'pf-timeline');
  section.items.forEach(item => {
    const node = el('li', `pf-timeline-item${item.highlight ? ' pf-timeline-item--key' : ''}`);
    node.append(el('span', 'pf-timeline-year', item.year), el('p', 'pf-timeline-text', getText(item.text)));
    list.appendChild(node);
  });
  body.append(title, list);
}

function addPhasesPage(section) {
  const body = addPage('page-layout layout-phases');
  const title = el('div', 'list-title');
  title.append(bigNumber(), el('h2', 'heading', getText(section.title)));
  const list = el('ol', 'pf-phases');
  section.items.forEach((item, index) => {
    const node = el('li', 'pf-phase');
    node.append(
      el('span', 'pf-phase-number', String(index + 1).padStart(2, '0')),
      el('h3', 'pf-phase-title', getText(item.title)),
      el('p', 'pf-phase-text', getText(item.text))
    );
    list.appendChild(node);
  });
  body.append(title, section.intro ? el('p', 'lead phases-lead', getText(section.intro)) : el('div'), list);
}

// Classification status and publications share the last page of the chapter
function addStatusPage(status, publications) {
  const body = addPage('page-layout layout-list');
  const title = el('div', 'list-title');
  title.append(bigNumber(), el('h2', 'heading', getText(status?.title || publications?.title)));

  const content = el('div', 'list-rules status-content');
  if (status) {
    content.append(
      rules([{ label: getText(status.statusLabel), value: getText(status.status) }]),
      el('p', 'lead', getText(status.text))
    );
  }
  if (publications) {
    content.append(
      el('div', 'small-heading spaced', getText(publications.title)),
      rules(publications.items.map(item => ({ label: `${item.title} — ${getText(item.venue)}`, value: item.year })))
    );
  }
  body.append(title, content);
}

function researchImages() {
  return (research?.sections || []).flatMap(section => (section.images || []).map(image => image.src));
}

// Research chapter, presented as the case study; missing images are left out
function addResearch() {
  const find = type => research.sections.find(section => section.type === type);
  const images = researchImages().filter(available);
  addResearchCase(images[0], images[1]);

  const used = new Set(images.slice(0, 2));
  research.sections.forEach(section => {
    if (section.type === 'timeline') addTimelinePage(section);
    if (section.type === 'phases') addPhasesPage(section);
    if (section.type === 'text' && section.images) {
      const rest = section.images.filter(image => !used.has(image.src));
      addImagePages(rest, getText(research.title), getText(section.title));
    }
  });

  if (find('status') || find('publications')) addStatusPage(find('status'), find('publications'));
}

// ============================================
// RENDER
// ============================================

function applyPageSize() {
  const size = PAGE_SIZES[state.format];
  const landscape = state.orientation === 'landscape';
  const width = landscape ? size.long : size.short;
  const height = landscape ? size.short : size.long;

  const root = document.documentElement.style;
  root.setProperty('--page-w', `${width}mm`);
  root.setProperty('--page-h', `${height}mm`);
  root.setProperty('--u', size.scale);

  document.getElementById('page-size').textContent =
    `@page { size: ${state.format.toUpperCase()} ${state.orientation}; margin: 0; }`;
  document.body.classList.toggle('orientation-landscape', landscape);
  document.body.classList.toggle('orientation-portrait', !landscape);
  document.documentElement.lang = state.lang;
}

// Scale the preview so a page fits the available width (print ignores this)
function fitPreview() {
  const pagesEl = document.getElementById('pages');
  const preview = document.querySelector('.preview');
  const pageWidthPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-w')) * MM;
  const width = preview.clientWidth - 64;
  pagesEl.style.zoom = Math.min(1, width / pageWidthPx);
}

async function renderPages() {
  const token = ++renderToken;
  const selected = projects.filter(project => state.selected.includes(project.id));
  const withResearch = state.includeResearch && research;

  updateStatus('A preparar páginas…');
  const sources = selected.flatMap(project => [
    project.thumbnail,
    ...(project.images || []).filter(image => image.type !== 'video').map(image => image.src)
  ]);
  await Promise.all([...sources, ...(withResearch ? researchImages() : [])].filter(Boolean).map(loadAspectRatio));
  if (token !== renderToken) return; // a newer render has started

  // Pages are measured while they are built, so lay them out at real size
  const pagesEl = document.getElementById('pages');
  pagesEl.innerHTML = '';
  pagesEl.style.zoom = 1;

  // Pictures for the opening pages: the research photo, then project covers
  const pool = [
    ...(withResearch ? researchImages().filter(available) : []),
    ...selected.map(project => project.thumbnail).filter(available)
  ];
  const pick = i => pool.length ? pool[i % pool.length] : null;

  addCover(pick(0));
  addIntroduction([pick(1), pick(2)]);
  addNamePage(pick(3));
  addEducationPage([pick(4), pick(5)]);
  if (participations.length) addParticipationsPage([pick(6), pick(7)]);
  addSkillsPage([pick(8), pick(9)]);

  previousVariant = null;
  const entries = [];
  const hasChapters = selected.length > 0 || withResearch;
  const index = hasChapters ? addPortfolioPage([pick(1), pick(5), pick(3)]) : null;

  if (withResearch) {
    entries.push({ title: getText(research.title), startPage: pageCount() + 1 });
    addResearch();
  }
  selected.forEach((project, i) => {
    entries.push({ title: `${label('project')} / ${i + 1} — ${getText(project.title)}`, startPage: pageCount() + 1 });
    addProject(project, i);
  });
  if (index) fillIndex(index, entries);

  addThanksPage(pick(0));
  pagesEl.querySelectorAll('.project-text, .lead').forEach(shrinkToFit);
  fitPictures(pagesEl);

  pagesEl.querySelectorAll('.page').forEach((page, i) => {
    page.querySelectorAll('.big-number').forEach(node => {
      node.textContent = String(i + 1).padStart(2, '0');
    });
  });

  fitPreview();
  updateStatus();
}

// Picture slots crop their image; when that would cut too much (a drawing in
// a tall frame, a panorama in a square) the whole image is shown instead
function fitPictures(container) {
  container.querySelectorAll('.picture:not(.cover-picture):not(.project-picture):not(.thanks-picture) img').forEach(img => {
    const ratio = aspectRatios.get(img.getAttribute('src'));
    const frame = img.parentElement;
    const slot = frame.clientWidth / frame.clientHeight;
    if (ratio && slot && Math.max(ratio / slot, slot / ratio) > 1.4) frame.classList.add('picture-contain');
  });
}

function updateStatus(message) {
  const total = pageCount();
  const overflowing = document.querySelectorAll('.overflowing').length;
  let text = message || `${total} páginas`;
  if (!message && overflowing) text += ` · ${overflowing} texto(s) não cabem na página`;
  document.getElementById('builder-status').textContent = text;
}

// ============================================
// CONTROLS
// ============================================

function renderProjectList() {
  const list = document.getElementById('project-list');
  list.innerHTML = '';
  projects.forEach(project => {
    const option = el('label', 'project-option');
    const checkbox = el('input');
    checkbox.type = 'checkbox';
    checkbox.value = project.id;
    checkbox.checked = state.selected.includes(project.id);
    checkbox.addEventListener('change', () => {
      // Keep the order of projects.json
      state.selected = projects
        .map(p => p.id)
        .filter(id => id === project.id ? checkbox.checked : state.selected.includes(id));
      update();
    });
    option.append(checkbox, el('span', null, getText(project.title)), el('span', 'project-option-year', project.year || ''));
    list.appendChild(option);
  });
}

function updateSegmented() {
  document.querySelectorAll('.segmented').forEach(group => {
    group.querySelectorAll('button').forEach(button => {
      button.classList.toggle('active', state[group.dataset.option] === button.dataset.value);
    });
  });
}

function update() {
  saveState();
  updateSegmented();
  applyPageSize();
  return renderPages();
}

async function exportPdf() {
  const button = document.getElementById('export-pdf');
  button.disabled = true;
  updateStatus('A carregar imagens…');

  // Every image must be loaded before the print dialog captures the pages
  const images = [...document.querySelectorAll('#pages img')];
  await Promise.all(images.map(img => img.complete ? null : new Promise(resolve => {
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', resolve, { once: true });
  })));
  await document.fonts.ready;

  button.disabled = false;
  updateStatus();
  window.print();
}

function initControls() {
  document.querySelectorAll('.segmented').forEach(group => {
    group.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      state[group.dataset.option] = button.dataset.value;
      if (group.dataset.option === 'lang') renderProjectList();
      update();
    });
  });

  document.querySelectorAll('[data-select]').forEach(button => {
    button.addEventListener('click', () => {
      state.selected = button.dataset.select === 'all' ? projects.map(p => p.id) : [];
      renderProjectList();
      update();
    });
  });

  const researchToggle = document.getElementById('include-research');
  researchToggle.checked = state.includeResearch;
  researchToggle.disabled = !research;
  researchToggle.addEventListener('change', () => {
    state.includeResearch = researchToggle.checked;
    update();
  });

  document.getElementById('export-pdf').addEventListener('click', exportPdf);
  window.addEventListener('resize', fitPreview);
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  const [projectsJson, translationsJson, aboutJson, researchJson, participationsJson] = await Promise.all(
    ['projects.json', 'translations.json', 'about.json', 'research.json', 'participations.json'].map(file =>
      fetch(file).then(response => response.json()).catch(() => null)
    )
  );
  projects = projectsJson?.projects || [];
  translations = translationsJson;
  about = aboutJson;
  research = researchJson;
  participations = participationsJson?.participations || [];

  // Drop saved ids of projects that no longer exist; default to all projects
  const ids = projects.map(p => p.id);
  state.selected = loadState() ? (state.selected || []).filter(id => ids.includes(id)) : ids;

  renderProjectList();
  initControls();

  // Text is measured while laying out pages, so wait for the web font
  await document.fonts.ready;
  update();
});
