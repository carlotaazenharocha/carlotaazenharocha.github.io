// ============================================
// PORTFOLIO PDF BUILDER
// Builds print-ready pages from projects.json; the browser's
// "Save as PDF" turns them into the portfolio.
// ============================================

const PAGE_SIZES = {
  a4: { short: 210, long: 297, scale: 1 },
  a3: { short: 297, long: 420, scale: 1.414 }
};

// Strings used only in the PDF
const LABELS = {
  pt: { portfolio: 'Portfólio', contents: 'Índice', contact: 'Contacto' },
  en: { portfolio: 'Portfolio', contents: 'Contents', contact: 'Contact' },
  es: { portfolio: 'Portafolio', contents: 'Índice', contact: 'Contacto' }
};

const METADATA_FIELDS = ['year', 'location', 'typology', 'context', 'institution', 'teachers'];
const STORAGE_KEY = 'portfolio-builder';

let projects = [];
let translations = null;
let about = null;

const state = {
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

// ============================================
// PAGE BUILDERS
// ============================================

function createPage(className) {
  return el('section', `page ${className}`);
}

function addFooter(page, left, number) {
  const footer = el('div', 'page-footer');
  footer.append(el('span', null, left), el('span', null, String(number).padStart(2, '0')));
  page.appendChild(footer);
}

function buildCover() {
  const page = createPage('page-cover');
  page.appendChild(el('div', 'cover-name', about?.contact?.name || 'Carlota Azenha da Rocha'));

  const bottom = el('div', 'cover-bottom');
  bottom.append(
    el('span', null, label('portfolio')),
    el('span', null, String(new Date().getFullYear()))
  );
  page.appendChild(bottom);
  return page;
}

function buildContents(entries) {
  const page = createPage('page-contents');
  page.appendChild(el('div', 'page-label', label('contents')));

  const list = el('ol', 'contents-list');
  entries.forEach(({ project, number, startPage }) => {
    const item = el('li', 'contents-item');
    item.append(
      el('span', 'contents-number', number),
      el('span', 'contents-title', getText(project.title)),
      el('span', 'contents-year', project.year || ''),
      el('span', 'contents-page', String(startPage).padStart(2, '0'))
    );
    list.appendChild(item);
  });
  page.appendChild(list);
  return page;
}

function buildProjectIntro(project, number) {
  const page = createPage('page-project-intro');
  page.appendChild(el('div', 'project-number', number));
  page.appendChild(el('h2', 'project-name', getText(project.title)));

  const meta = el('dl', 'project-meta');
  METADATA_FIELDS.filter(field => project[field]).forEach(field => {
    const item = el('div', 'meta-item');
    item.append(
      el('dt', 'meta-label', metadataLabel(field)),
      el('dd', 'meta-value', getText(project[field]))
    );
    meta.appendChild(item);
  });
  page.appendChild(meta);

  // Blank lines in the text separate paragraphs
  const text = el('div', 'project-text');
  getText(project.concept).split(/\n\s*\n/).forEach(paragraph => {
    text.appendChild(el('p', null, paragraph));
  });
  page.appendChild(text);
  return page;
}

// Consecutive half-width images share a page; everything else gets its own
function groupImages(images) {
  const groups = [];
  images.forEach(image => {
    const last = groups[groups.length - 1];
    if (image.layout === 'half' && last && last.half && last.images.length < 2 && !image.section) {
      last.images.push(image);
    } else {
      groups.push({ half: image.layout === 'half', images: [image] });
    }
  });
  return groups;
}

function buildImagePage(group) {
  const page = createPage('page-images');
  const section = group.images[0].section;
  if (section) page.appendChild(el('div', 'page-label', getText(section)));

  const area = el('div', `image-area ${group.images.length > 1 ? 'pair' : ''}`);
  group.images.forEach(image => {
    const figure = el('figure', 'figure');
    const img = el('img');
    img.src = image.src;
    img.alt = getText(image.caption);
    figure.appendChild(img);
    if (image.caption) figure.appendChild(el('figcaption', null, getText(image.caption)));
    area.appendChild(figure);
  });
  page.appendChild(area);
  return page;
}

function buildBackPage() {
  const page = createPage('page-back');
  const contact = el('div', 'back-contact');
  contact.appendChild(el('div', 'page-label', label('contact')));
  if (about?.contact) {
    contact.append(
      el('div', null, about.contact.name),
      el('div', null, about.contact.email),
      el('div', null, getText(about.contact.location))
    );
    if (about.contact.linkedin) contact.appendChild(el('div', null, about.contact.linkedin.url));
  }
  page.appendChild(contact);
  return page;
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

  fitPreview();
}

// Scale the preview so a page fits the available width (print ignores this)
function fitPreview() {
  const pagesEl = document.getElementById('pages');
  const preview = document.querySelector('.preview');
  const pageWidthPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-w')) * 96 / 25.4;
  const available = preview.clientWidth - 64;
  pagesEl.style.zoom = Math.min(1, available / pageWidthPx);
}

// Text in columns overflows sideways, single-column text overflows downwards
function isOverflowing(node) {
  return node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1;
}

// Shrink the concept text until it fits its page (measured at real size)
function fitText() {
  const pagesEl = document.getElementById('pages');
  const zoom = pagesEl.style.zoom;
  pagesEl.style.zoom = 1;

  document.querySelectorAll('.project-text').forEach(text => {
    text.style.fontSize = '';
    let size = parseFloat(getComputedStyle(text).fontSize);
    const minimum = size * 0.6;
    while (isOverflowing(text) && size > minimum) {
      size -= 0.25;
      text.style.fontSize = `${size}px`;
    }
    text.classList.toggle('overflowing', isOverflowing(text));
  });

  pagesEl.style.zoom = zoom;
}

function renderPages() {
  const pagesEl = document.getElementById('pages');
  pagesEl.innerHTML = '';

  const selected = projects.filter(project => state.selected.includes(project.id));
  const name = about?.contact?.name || 'Carlota Azenha da Rocha';

  // Build project pages first so the contents page knows where each one starts
  const hasContents = selected.length > 0;
  let pageNumber = hasContents ? 3 : 2; // cover = 1, contents = 2
  const entries = selected.map((project, index) => {
    const number = String(index + 1).padStart(2, '0');
    const pages = [buildProjectIntro(project, number), ...groupImages(project.images || []).map(buildImagePage)];
    const entry = { project, number, startPage: pageNumber, pages };
    pages.forEach(page => addFooter(page, `${name} — ${getText(project.title)}`, pageNumber++));
    return entry;
  });

  pagesEl.appendChild(buildCover());
  if (hasContents) {
    const contents = buildContents(entries);
    addFooter(contents, name, 2);
    pagesEl.appendChild(contents);
  }
  entries.forEach(entry => entry.pages.forEach(page => pagesEl.appendChild(page)));
  const back = buildBackPage();
  addFooter(back, name, pageNumber);
  pagesEl.appendChild(back);

  fitText();
  updateStatus();
}

function updateStatus(message) {
  const total = document.querySelectorAll('.page').length;
  const overflowing = document.querySelectorAll('.project-text.overflowing').length;
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
  renderPages();
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
  fitText();

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

  document.getElementById('export-pdf').addEventListener('click', exportPdf);
  window.addEventListener('resize', fitPreview);
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  const [projectsJson, translationsJson, aboutJson] = await Promise.all(
    ['projects.json', 'translations.json', 'about.json'].map(file =>
      fetch(file).then(response => response.json()).catch(() => null)
    )
  );
  projects = projectsJson?.projects || [];
  translations = translationsJson;
  about = aboutJson;

  // Drop saved ids of projects that no longer exist; default to all projects
  const ids = projects.map(p => p.id);
  state.selected = loadState() ? (state.selected || []).filter(id => ids.includes(id)) : ids;

  renderProjectList();
  initControls();
  update();

  // Re-fit text once the web font has loaded
  document.fonts.ready.then(fitText).then(() => updateStatus());
});
