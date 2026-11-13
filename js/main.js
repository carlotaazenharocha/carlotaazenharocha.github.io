// ============================================
// ARCHITECTURE PORTFOLIO - MAIN SCRIPT
// With Bilingual Support (EN/PT)
// ============================================

// Global variables
let projectsData = null;
let translationsData = null;
let participationsData = null;
let aboutData = null;
let currentLanguage = 'en'; // Default language

// ============================================
// LANGUAGE SYSTEM
// ============================================

// Initialize language from localStorage or default to English
function initLanguage() {
  const savedLang = localStorage.getItem('portfolio-language');
  currentLanguage = savedLang || 'en';
  updateLanguageUI();
}

// Switch language
async function switchLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('portfolio-language', lang);
  updateLanguageUI();

  // Always update navigation text and footer
  updateNavigationText();
  updateFooter();

  // Reload current page content
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'index.html' || currentPage === '') {
    await initHomepage();
  } else if (currentPage === 'project.html') {
    await initProjectPage();
  } else if (currentPage === 'about.html') {
    updateAboutPage();
  } else if (currentPage === 'participation.html') {
    await initParticipationPage();
  } else if (currentPage === 'research.html') {
    await initResearchPage();
  }

  // Re-rendered elements start hidden (scroll animation); after a language
  // switch the content only changes text, so show it straight away
  revealAnimatedElements();
}

// Update language button states
function updateLanguageUI() {
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    if (btn.dataset.lang === currentLanguage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Get translated text
function t(key) {
  if (!translationsData) return key;
  
  const keys = key.split('.');
  let value = translationsData[currentLanguage];
  
  for (const k of keys) {
    if (value && value[k] !== undefined) {
      value = value[k];
    } else {
      return key;
    }
  }
  
  return value;
}

// Get translated content from bilingual object
function getText(obj) {
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object' && obj[currentLanguage]) {
    return obj[currentLanguage];
  }
  return obj.en || obj.pt || '';
}

// ============================================
// DATA LOADING
// ============================================

// Fetch projects data
async function loadProjectsData() {
  try {
    const response = await fetch('projects.json', { cache: 'no-cache' });
    projectsData = await response.json();
    return projectsData;
  } catch (error) {
    console.error('Error loading projects data:', error);
    return null;
  }
}

// Fetch translations data
async function loadTranslations() {
  try {
    const response = await fetch('translations.json', { cache: 'no-cache' });
    translationsData = await response.json();
    return translationsData;
  } catch (error) {
    console.error('Error loading translations:', error);
    return null;
  }
}

// Fetch participations data
async function loadParticipationsData() {
  try {
    const response = await fetch('participations.json', { cache: 'no-cache' });
    participationsData = await response.json();
    return participationsData;
  } catch (error) {
    console.error('Error loading participations data:', error);
    return null;
  }
}

// Fetch about data
async function loadAboutData() {
  try {
    const response = await fetch('about.json', { cache: 'no-cache' });
    aboutData = await response.json();
    return aboutData;
  } catch (error) {
    console.error('Error loading about data:', error);
    return null;
  }
}

// ============================================
// HOMEPAGE - Projects Grid
// ============================================

async function initHomepage() {
  const data = await loadProjectsData();
  if (!data) return;

  const gridContainer = document.getElementById('projects-grid');
  if (!gridContainer) return;

  gridContainer.innerHTML = '';

  // Projects fill the grid; other work (studies, surveys, exercises) follows
  data.projects.filter(project => !isOtherWork(project)).forEach(project => {
    gridContainer.appendChild(createProjectCard(project));
  });
  renderOtherWork(data.projects.filter(project => isOtherWork(project) && !isSketchbook(project)));

  // Add fade-in animation
  setTimeout(() => {
    gridContainer.classList.add('loading');
  }, 100);
}

// Other work (studies, surveys, exercises) lives in projects/outros-trabalhos/
const OTHER_WORK_FOLDER = 'projects/outros-trabalhos/';

function isOtherWork(project) {
  return (project.thumbnail || '').startsWith(OTHER_WORK_FOLDER);
}

// Sketchbooks live with the other work but are shown on the About page
function isSketchbook(project) {
  return Boolean(project.sketchbook);
}

// Projects, other work and sketchbooks each have their own previous / next
function projectGroup(project) {
  return isSketchbook(project) ? 'sketchbook' : isOtherWork(project) ? 'other' : 'project';
}

function renderOtherWork(works) {
  const section = document.getElementById('other-work');
  if (!section) return;
  section.innerHTML = '';
  if (!works.length) return;

  // Title with the slider arrows on the right
  const arrow = (direction, points) => `
    <button type="button" class="other-work-arrow" data-direction="${direction}" aria-label="${t(`projects.${direction < 0 ? 'previous' : 'next'}`)}">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="${points}"/></svg>
    </button>`;
  section.innerHTML = `
    <div class="other-work-header">
      <h2 class="other-work-title">${t('projects.other_title')}</h2>
      <div class="other-work-arrows">${arrow(-1, '15 18 9 12 15 6')}${arrow(1, '9 18 15 12 9 6')}</div>
    </div>
  `;

  // Slider of small cards (swipe, trackpad or arrows), title and details below each
  const container = document.createElement('div');
  container.className = 'other-work-items fade-in';
  works.forEach(work => {
    const item = document.createElement('a');
    item.href = `project.html?id=${work.id}`;
    item.className = 'other-work-item';
    const title = getText(work.title);
    item.innerHTML = `
      <div class="other-work-image"><img src="${work.thumbnail}" alt="${title}" loading="lazy"></div>
      <div class="other-work-name">${title}</div>
      <div class="other-work-meta">${[getText(work.typology), work.year].filter(Boolean).join(' · ')}</div>
    `;
    container.appendChild(item);
  });
  section.appendChild(container);
  setupOtherWorkSlider(section, container);
}

// Arrows move the slider by one card; each is disabled at its end and both
// are hidden when every card already fits
function setupOtherWorkSlider(section, track) {
  const arrows = section.querySelectorAll('.other-work-arrow');
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    section.classList.toggle('other-work--static', max <= 1);
    arrows[0].disabled = track.scrollLeft <= 1;
    arrows[1].disabled = track.scrollLeft >= max - 1;
  };
  arrows.forEach(button => button.addEventListener('click', () => {
    const card = track.querySelector('.other-work-item');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: Number(button.dataset.direction) * (card.offsetWidth + gap), behavior: 'smooth' });
  }));
  track.addEventListener('scroll', update, { passive: true });
  // The section is rebuilt on language change: keep a single resize listener
  window.removeEventListener('resize', otherWorkResize);
  otherWorkResize = update;
  window.addEventListener('resize', otherWorkResize);
  update();
}
let otherWorkResize = null;

function createProjectCard(project) {
  const card = document.createElement('a');
  card.href = `project.html?id=${project.id}`;
  card.className = 'project-card';

  const title = getText(project.title);
  const year = project.year;

  card.innerHTML = `
    <img src="${project.thumbnail}" alt="${title}" loading="lazy">
    <div class="project-overlay">
      <div class="project-info">
        <div class="project-title">${title}</div>
        <div class="project-year">${year}</div>
      </div>
    </div>
  `;

  return card;
}

// ============================================
// PROJECT PAGE
// ============================================

async function initProjectPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  if (!projectId) {
    window.location.href = 'index.html';
    return;
  }

  const data = await loadProjectsData();
  if (!data) return;

  const project = data.projects.find(p => p.id === projectId);
  if (!project) {
    window.location.href = 'index.html';
    return;
  }

  // Populate title
  const titleContainer = document.getElementById('project-title');
  if (titleContainer) {
    titleContainer.textContent = getText(project.title);
  }

  // Populate concept
  const conceptContainer = document.getElementById('project-concept');
  if (conceptContainer) {
    // Blank lines in the text separate paragraphs
    conceptContainer.innerHTML = getText(project.concept)
      .split(/\n\s*\n/)
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
  }

// Populate metadata (fields missing from a project are skipped)
  const metadataContainer = document.getElementById('project-metadata');
  if (metadataContainer) {
    const fields = ['year', 'location', 'typology', 'context', 'institution', 'teachers', 'authors'];
    metadataContainer.innerHTML = fields
      .filter(field => project[field])
      .map(field => `
        <div class="metadata-item">
          <dt class="metadata-label">${t(`project.metadata_labels.${field}`)}</dt>
          <dd class="metadata-value">${getText(project[field])}</dd>
        </div>
      `)
      .join('');
  }

  // Participations linked to the project (e.g. an exhibition of it): one sentence
  // before the metadata, with {link} replaced by a link to the participation
  const relatedContainer = document.getElementById('project-related');
  if (relatedContainer) {
    relatedContainer.innerHTML = '';
    if (project.participations && project.participations.length > 0) {
      const participations = await loadParticipationsData();
      relatedContainer.innerHTML = project.participations.map(link => {
        const participation = participations?.participations.find(p => p.id === link.id);
        if (!participation) return '';
        const anchor = `<a href="participation.html?id=${participation.id}">${getText(participation.title)}</a>`;
        return `<p>${getText(link.text).replace('{link}', anchor)}</p>`;
      }).join('');
    }
  }

  // Populate images
  const contentContainer = document.getElementById('project-content');
  if (contentContainer) {
    contentContainer.innerHTML = '';
    // A sketchbook has its own presentation (js/caderno.js)
    if (project.sketchbook && typeof renderSketchbook === 'function') {
      renderSketchbook(contentContainer, project);
      // Sketchbooks are listed on the About page
      document.querySelectorAll('nav a').forEach(link =>
        link.classList.toggle('active', link.getAttribute('href') === 'about.html'));
    } else {
      renderImages(contentContainer, project.images, project.parts);
    }
  }

  // Setup navigation
  setupProjectNavigation(data.projects, projectId);

  // Update page title
  document.title = `${getText(project.title)} — Carlota Azenha da Rocha`;

  // Add fade-in
  setTimeout(() => {
    document.querySelector('main').classList.add('loading');
  }, 100);

  // Reinitialize lightbox and animations for new content
  initLightbox();
  initScrollAnimations();
}

// Render a list of images into a container (used by project and research pages)
// Opening of one part of a project that brings together separate works:
// number, title, context line, its own text and details
function renderPart(part, number) {
  const header = document.createElement('div');
  header.className = 'project-part';
  const details = ['institution', 'teachers']
    .filter(field => part[field])
    .map(field => `
      <div class="metadata-item">
        <dt class="metadata-label">${t(`project.metadata_labels.${field}`)}</dt>
        <dd class="metadata-value">${getText(part[field])}</dd>
      </div>
    `).join('') + (part.publication ? `
      <div class="metadata-item">
        <dt class="metadata-label">${t('project.metadata_labels.publication')}</dt>
        <dd class="metadata-value"><a href="${part.publication.url}" target="_blank" rel="noopener">${getText(part.publication.label)} ↗</a></dd>
      </div>
    ` : '');
  header.innerHTML = `
    <div class="project-part-heading">
      <span class="project-part-number">${String(number).padStart(2, '0')}</span>
      <div>
        <h2 class="project-part-title">${getText(part.title)}</h2>
        ${part.subtitle ? `<p class="project-part-subtitle">${getText(part.subtitle)}</p>` : ''}
      </div>
    </div>
    <div class="project-intro-body">
      <div class="project-concept">${paragraphs(part.text)}</div>
      ${details ? `<dl class="project-metadata">${details}</dl>` : ''}
    </div>
  `;
  return header;
}

// Width of a photo in a flex row following its shape, so the row keeps one height
function growByShape(imageDiv) {
  const img = imageDiv.querySelector('img');
  const grow = () => { imageDiv.style.flex = `${img.naturalWidth / img.naturalHeight} 1 0`; };
  if (img.complete && img.naturalWidth) grow(); else img.addEventListener('load', grow, { once: true });
}

// A mosaic names its arrangement and optional modifiers, e.g. "justified-2 narrow":
// grid-3, grid-2, row-4, uniform (3 columns of equal cells, each drawing whole),
// justified[-n] (rows of n whole pictures at one height, 3 by default), masonry,
// scroll (one row that scrolls sideways); narrow keeps
// it to the width of an inset image
const MOSAIC_ROW = 3;

function renderImages(container, images, parts = []) {
  let row = null;
  let mosaic = null;
  let mosaicRow = MOSAIC_ROW;
  images.forEach(image => {

    // Optional part opening before this image (its sections follow it)
    const part = image.part && parts.find(item => item.id === image.part);
    if (part) {
      container.appendChild(renderPart(part, parts.indexOf(part) + 1));
      row = null;
      mosaic = null;
    }

    // Optional section heading before this image
    if (image.section) {
      const heading = document.createElement('h2');
      heading.className = 'project-section-title';
      heading.textContent = getText(image.section);
      container.appendChild(heading);
      row = null;
      mosaic = null;
    }

    const layoutClass = { full: 'full-width', half: 'half-width', tile: 'tile' }[image.layout] || 'inset';
    const imageDiv = document.createElement('div');
    imageDiv.className = `project-image ${layoutClass}`;
    // Videos play silently in a loop like an image, without controls; with
    // "controls" (an interview, say) they wait to be played, with sound
    const video = image.controls
      ? `<video src="${image.src}" controls playsinline preload="metadata"></video>`
      : `<video src="${image.src}" autoplay muted loop playsinline disablepictureinpicture preload="metadata"></video>`;
    // A Vimeo video plays in Vimeo's own player, with sound and controls
    const vimeo = `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${image.vimeo}?dnt=1" title="${getText(image.caption)}" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe></div>`;
    const media = image.type === 'video' ? video
      : image.type === 'vimeo' ? vimeo
      : `<img src="${image.src}" alt="${getText(image.caption)}" loading="lazy">`;
    imageDiv.innerHTML = `
      ${media}
      <div class="image-caption">${getText(image.caption)}</div>
    `;

    // Until the file exists, show a box describing the image to add
    if (image.placeholder) {
      const img = imageDiv.querySelector('img');
      img.loading = 'eager';
      img.addEventListener('error', () => {
        const box = document.createElement('div');
        box.className = 'image-placeholder';
        box.innerHTML = `<span>${image.placeholder}</span><code>${image.src}</code>`;
        img.replaceWith(box);
      }, { once: true });
    }

    // Consecutive "tile" images form a mosaic of small pictures; "mosaic" on an
    // image starts a new one and names its arrangement (grid-3, grid-2, ...)
    if (image.layout === 'tile') {
      row = null;
      if (!mosaic || image.mosaic) {
        const [arrangement, ...modifiers] = (image.mosaic || 'grid-3').split(/\s+/);
        const [, justifiedRow] = arrangement.match(/^justified-(\d)$/) || [];
        mosaicRow = Number(justifiedRow) || MOSAIC_ROW;
        mosaic = document.createElement('div');
        mosaic.className = ['project-mosaic', `project-mosaic--${justifiedRow ? 'justified' : arrangement}`,
          ...modifiers.map(modifier => `project-mosaic--${modifier}`)].join(' ');
        container.appendChild(mosaic);
      }
      if (mosaic.classList.contains('project-mosaic--justified')) {
        let line = mosaic.lastElementChild;
        if (!line || line.children.length >= mosaicRow) {
          line = document.createElement('div');
          line.className = 'project-mosaic-row';
          mosaic.appendChild(line);
        }
        growByShape(imageDiv);
        line.appendChild(imageDiv);
      } else {
        mosaic.appendChild(imageDiv);
      }
      return;
    }
    mosaic = null;

    // Consecutive half-width images share a row; "row" on an image starts a
    // new row ("equal": same height, each width following the photo's shape)
    if (image.layout === 'half') {
      if (!row || image.row) {
        row = document.createElement('div');
        row.className = `project-image-row${image.row ? ` project-image-row--${image.row}` : ''}`;
        container.appendChild(row);
      }
      // In an equal-height row each photo's width follows its shape
      if (row.classList.contains('project-image-row--equal')) growByShape(imageDiv);
      row.appendChild(imageDiv);
    } else {
      row = null;
      container.appendChild(imageDiv);
    }
  });
}

// ============================================
// RESEARCH PAGE
// ============================================

let researchData = null;

// Blank lines in the text separate paragraphs
function paragraphs(text) {
  return getText(text).split(/\n\s*\n/).map(paragraph => `<p>${paragraph}</p>`).join('');
}

function sectionTitle(title) {
  return `<h2 class="project-section-title">${getText(title)}</h2>`;
}

function renderResearchSection(section) {
  const wrapper = document.createElement('section');
  wrapper.className = `research-section research-section--${section.type}`;

  if (section.type === 'text') {
    wrapper.innerHTML = `${sectionTitle(section.title)}<div class="research-text">${paragraphs(section.text)}</div>`;
    if (section.images) renderImages(wrapper, section.images);
  }

  if (section.type === 'timeline') {
    wrapper.innerHTML = `
      ${sectionTitle(section.title)}
      <ol class="timeline">
        ${section.items.map(item => `
          <li class="timeline-item${item.highlight ? ' timeline-item--key' : ''}">
            <span class="timeline-year">${item.year}</span>
            <p class="timeline-text">${getText(item.text)}</p>
          </li>
        `).join('')}
      </ol>
    `;
  }

  if (section.type === 'phases') {
    wrapper.innerHTML = `
      ${sectionTitle(section.title)}
      <div class="research-text">${paragraphs(section.intro)}</div>
      <ol class="phases">
        ${section.items.map((item, index) => `
          <li class="phase">
            <span class="phase-number">${String(index + 1).padStart(2, '0')}</span>
            <h3 class="phase-title">${getText(item.title)}</h3>
            <p class="phase-text">${getText(item.text)}</p>
            ${item.next ? `<p class="phase-next">${getText(item.next)}</p>` : ''}
          </li>
        `).join('')}
      </ol>
    `;
  }

  if (section.type === 'status') {
    wrapper.innerHTML = `
      ${sectionTitle(section.title)}
      <div class="status">
        <span class="metadata-label">${getText(section.statusLabel)}</span>
        <span class="status-badge">${getText(section.status)}</span>
      </div>
      <div class="research-text">${paragraphs(section.text)}</div>
    `;
  }

  if (section.type === 'contact') {
    const href = `mailto:${section.email}?subject=${encodeURIComponent(section.subject || '')}`;
    wrapper.innerHTML = `
      ${sectionTitle(section.title)}
      <div class="research-text">${paragraphs(section.text)}</div>
      <a class="research-contact-btn" href="${href}">${getText(section.cta)} — ${section.email}</a>
    `;
  }

  if (section.type === 'publications') {
    wrapper.innerHTML = `
      ${sectionTitle(section.title)}
      <ul class="publications">
        ${section.items.map(item => `
          <li class="publication">
            <span class="publication-year">${item.year}</span>
            <div>
              <p class="publication-title">${item.title}</p>
              <p class="publication-venue">${item.authors} — ${getText(item.venue)}</p>
              ${item.url ? `<a class="publication-link" href="${item.url}" target="_blank" rel="noopener">${getText(section.linkLabel)} ↗</a>` : ''}
            </div>
          </li>
        `).join('')}
      </ul>
      ${section.dissertationNote ? `<p class="publication-note">${getText(section.dissertationNote)}</p>` : ''}
    `;
  }

  return wrapper;
}

// Fetch research data (shared by the research page and the homepage highlight)
async function loadResearchData() {
  if (!researchData) {
    try {
      const response = await fetch('research.json', { cache: 'no-cache' });
      researchData = await response.json();
    } catch (error) {
      console.error('Error loading research data:', error);
      return null;
    }
  }
  return researchData;
}

async function initResearchPage() {
  if (!await loadResearchData()) return;

  document.getElementById('research-label').textContent = getText(researchData.label);
  document.getElementById('research-title').textContent = getText(researchData.title);
  document.getElementById('research-subtitle').textContent = getText(researchData.subtitle);
  document.getElementById('research-abstract').innerHTML = paragraphs(researchData.abstract);

  const content = document.getElementById('research-content');
  content.innerHTML = '';
  researchData.sections.forEach(section => content.appendChild(renderResearchSection(section)));

  document.getElementById('research-metadata').innerHTML = researchData.metadata.map(item => `
    <div class="metadata-item">
      <dt class="metadata-label">${getText(item.label)}</dt>
      <dd class="metadata-value">${getText(item.value)}</dd>
    </div>
  `).join('');

  document.title = `${getText(researchData.title)} — Carlota Azenha da Rocha`;

  // Add fade-in
  setTimeout(() => {
    document.querySelector('main').classList.add('loading');
  }, 100);

  // Reinitialize lightbox and animations for new content
  initLightbox();
  initScrollAnimations();
}

function setupProjectNavigation(allProjects, currentId) {
  // Previous / next stay within the same group (projects, other work or sketchbooks)
  const current = allProjects.find(p => p.id === currentId);
  const projects = allProjects.filter(p => projectGroup(p) === projectGroup(current));
  const currentIndex = projects.findIndex(p => p.id === currentId);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  const navContainer = document.getElementById('project-navigation');
  if (!navContainer) return;

  navContainer.innerHTML = `
    <div>
      ${prevProject ? `<a href="project.html?id=${prevProject.id}" class="nav-link">← ${getText(prevProject.title)}</a>` : '<div></div>'}
    </div>
    <div>
      ${nextProject ? `<a href="project.html?id=${nextProject.id}" class="nav-link">${getText(nextProject.title)} →</a>` : '<div></div>'}
    </div>
  `;
}

// ============================================
// ABOUT PAGE
// ============================================

async function initAboutPage() {
  // Load about data and participations data
  await Promise.all([
    loadAboutData(),
    loadParticipationsData(),
    loadProjectsData()
  ]);

  // Update page content
  updateAboutPage();
}

function updateAboutPage() {
  // Update navigation text
  updateNavigationText();

  const aboutMain = document.querySelector('.about-main');
  if (!aboutMain || !aboutData) return;

  // Get translation labels
  const labels = translationsData[currentLanguage].about;

  // Update intro paragraphs
  const introContainer = document.getElementById('about-intro');
  if (introContainer && aboutData.intro) {
    const introTexts = aboutData.intro[currentLanguage] || aboutData.intro.en;
    introContainer.innerHTML = introTexts.map(p => `<p>${p}</p>`).join('');
  }

  // Update section headings (h2)
  const headings = aboutMain.querySelectorAll('h2');
  headings.forEach(heading => {
    const section = heading.dataset.section;
    if (section && labels[section]) {
      heading.textContent = labels[section];
    }
  });

  // Update skills section
  const skillsContainer = document.getElementById('skills-section');
  if (skillsContainer && aboutData.skills) {
    skillsContainer.innerHTML = `
      <div class="skills-group">
        <h3>${labels.skills_experienced}</h3>
        <div class="skills-list">
          ${aboutData.skills.experienced.map(s => `<span class="skill-item">${s}</span>`).join('')}
        </div>
      </div>
      <div class="skills-group">
        <h3>${labels.skills_learning}</h3>
        <div class="skills-list">
          ${aboutData.skills.learning.map(s => `<span class="skill-item">${s}</span>`).join('')}
        </div>
      </div>
    `;
  }

  // Update languages section
  const languagesContainer = document.getElementById('languages-section');
  if (languagesContainer && aboutData.languages) {
    languagesContainer.innerHTML = aboutData.languages.map(lang => `
      <div class="language-item">
        <span class="language-name">${lang.name}</span>
        <span class="language-level">${lang.level === 'native' ? labels.language_native : lang.level}</span>
      </div>
    `).join('');
  }

  // Update education section
  const educationContainer = document.getElementById('education-section');
  if (educationContainer && aboutData.education) {
    // Newest first: by the year it ends, then the year it starts
    const years = edu => (getText(edu.date).match(/\d{4}/g) || ['0']).map(Number);
    const education = [...aboutData.education].sort((a, b) =>
      Math.max(...years(b)) - Math.max(...years(a)) || Math.min(...years(b)) - Math.min(...years(a))
    );
    educationContainer.innerHTML = education.map(edu => `
      <div class="cv-item">
        <div class="cv-date">${getText(edu.date)}</div>
        <div class="cv-title">${getText(edu.title)}</div>
        <div class="cv-institution">${getText(edu.institution)}</div>
      </div>
    `).join('');
  }

  // Update publications section
  const publicationsContainer = document.getElementById('publications-section');
  if (publicationsContainer && aboutData.publications) {
    // Newest first; publications with a url open in a new tab
    const publications = [...aboutData.publications].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    publicationsContainer.innerHTML = publications.map(pub => {
      const content = `
        <div class="cv-date">${pub.date}</div>
        <div class="cv-title">${getText(pub.title)}${pub.url ? ' ↗' : ''}</div>
        <div class="cv-institution">${getText(pub.institution)}</div>
      `;
      return pub.url
        ? `<a href="${pub.url}" class="cv-item cv-item-link" target="_blank" rel="noopener">${content}</a>`
        : `<div class="cv-item">${content}</div>`;
    }).join('');
  }

  // Update thesis section
  const thesisContainer = document.getElementById('thesis-section');
  if (thesisContainer && aboutData.thesis) {
    thesisContainer.innerHTML = `
      <a href="research.html" class="cv-item cv-item-link">
        <div class="cv-date">${getText(aboutData.thesis.date)}</div>
        <div class="cv-title">${getText(aboutData.thesis.title)} →</div>
        <div class="cv-institution">${getText(aboutData.thesis.institution)}</div>
      </a>
    `;
  }

  // Update CV download button
  const cvBtn = document.getElementById('cv-download-btn');
  if (cvBtn && aboutData.cvFile) {
    cvBtn.href = aboutData.cvFile;
    cvBtn.textContent = labels.cv_download;
  }

  // Update participations section
  updateParticipationsSection();
  updateSketchbooksSection();

  // Update contact section
  const contactContainer = document.getElementById('contact-section');
  if (contactContainer && aboutData.contact) {
    contactContainer.innerHTML = `
      <h3>${labels.contact}</h3>
      <div class="contact-item contact-item--name">
        <div class="contact-label">${labels.contact_labels.name}</div>
        <div class="contact-value">${aboutData.contact.name}</div>
      </div>
      <div class="contact-item">
        <div class="contact-label">${labels.contact_labels.email}</div>
        <div class="contact-value">
          <a href="mailto:${aboutData.contact.email}">${aboutData.contact.email}</a>
        </div>
      </div>
      <div class="contact-item contact-item--location">
        <div class="contact-label">${labels.contact_labels.location}</div>
        <div class="contact-value">${getText(aboutData.contact.location)}</div>
        ${aboutData.contact.availability ? `<div class="contact-note">${getText(aboutData.contact.availability)}</div>` : ''}
      </div>
      <div class="contact-item">
        <div class="contact-label">${labels.contact_labels.linkedin}</div>
        <div class="contact-value">
          <a href="${aboutData.contact.linkedin.url}" target="_blank" rel="noopener">${aboutData.contact.linkedin.label} <span class="external-arrow">↗</span></a>
        </div>
      </div>
    `;
  }

  // Presentation card for phones and tablets (hidden on desktop)
  renderAboutCard(labels);

  // Update footer
  updateFooter();
}

// Photo, name and location at the top of the About page on phones and
// tablets (the CV button and the contacts move to the end of the page)
function renderAboutCard(labels) {
  const card = document.getElementById('about-card');
  const contact = aboutData.contact;
  if (!card || !contact) return;
  const photo = document.querySelector('.profile-image');
  card.innerHTML = `
    ${photo ? `<img src="${photo.getAttribute('src')}" alt="${contact.name}" class="about-card-photo">` : ''}
    <div>
      <h1 class="about-card-name">${contact.name}</h1>
      <p class="about-card-location">${getText(contact.location)}</p>
      ${contact.availability ? `<p class="about-card-note">${getText(contact.availability)}</p>` : ''}
    </div>
  `;
}

function updateParticipationsSection() {
  const container = document.getElementById('participations-list');
  if (!container || !participationsData) return;

  // Sort participations by date (newest first)
  const sorted = [...participationsData.participations].sort((a, b) => {
    return b.date.localeCompare(a.date);
  });

  container.innerHTML = sorted.map(p => {
    return `
      <a href="participation.html?id=${p.id}" class="cv-item cv-item-link">
        <div class="cv-title">${getText(p.title)} <span class="link-arrow">→</span></div>
        <div class="cv-institution">${getText(p.location)} · ${getText(p.institution)}</div>
        <div class="cv-date cv-date--below">${getText(p.dateDisplay)}</div>
      </a>
    `;
  }).join('');
}

// Sketchbooks: one line each, like the participations, opening its page (the leporello)
function updateSketchbooksSection() {
  const container = document.getElementById('sketchbooks-section');
  if (!container || !projectsData) return;
  const books = projectsData.projects.filter(isSketchbook);
  const heading = document.querySelector('[data-section="sketchbooks"]');
  if (heading) heading.hidden = !books.length;
  container.hidden = !books.length;
  container.innerHTML = books.map(book => `
    <a href="project.html?id=${book.id}" class="cv-item cv-item-link">
      <div class="cv-title">${getText(book.title)} <span class="link-arrow">→</span></div>
      <div class="cv-institution">${getText(book.sketchbook.summary)}</div>
      <div class="cv-date cv-date--below">${book.year}</div>
    </a>
  `).join('');
}

// ============================================
// PARTICIPATION PAGE
// ============================================

async function initParticipationPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const participationId = urlParams.get('id');

  if (!participationId) {
    window.location.href = 'about.html';
    return;
  }

  const data = await loadParticipationsData();
  if (!data) return;

  const participation = data.participations.find(p => p.id === participationId);
  if (!participation) {
    window.location.href = 'about.html';
    return;
  }

  // Type badge
  const typeContainer = document.getElementById('participation-type');
  if (typeContainer) {
    const typeLabel = data.types[participation.type] ? getText(data.types[participation.type]) : participation.type;
    typeContainer.textContent = typeLabel;
  }

  // Title
  const titleContainer = document.getElementById('participation-title');
  if (titleContainer) {
    titleContainer.textContent = getText(participation.title);
  }

  // Meta info
  const metaContainer = document.getElementById('participation-meta');
  if (metaContainer) {
    metaContainer.innerHTML = `
      <div class="meta-item">${getText(participation.dateDisplay)}</div>
      <div class="meta-item">${getText(participation.location)}</div>
      <div class="meta-item">${participation.institutionUrl
        ? `<a href="${participation.institutionUrl}" target="_blank" rel="noopener">${getText(participation.institution)} ↗</a>`
        : getText(participation.institution)}</div>
      ${participation.role ? `<div class="meta-item">${getText(participation.role)}</div>` : ''}
      ${participation.eventUrl ? `<div class="meta-item"><a href="${participation.eventUrl}" target="_blank" rel="noopener">${getText(participation.eventName)} ↗</a></div>` : ''}
    `;
  }

  // Short note on the author's role, below the meta line
  const noteContainer = document.getElementById('participation-note');
  if (noteContainer) {
    noteContainer.textContent = participation.note ? getText(participation.note) : '';
  }

  // Description
  const descContainer = document.getElementById('participation-description');
  if (descContainer) {
    descContainer.innerHTML = paragraphs(participation.description);
  }

  // Images
  const imagesContainer = document.getElementById('participation-images');
  if (imagesContainer && participation.images && participation.images.length > 0) {
    // Images with a "layout" are arranged like a project's: rows at one height,
    // mosaics, videos; otherwise a mosaic of whole images in columns
    const arranged = participation.images.some(img => img.layout);
    imagesContainer.classList.toggle('participation-images--arranged', arranged);
    if (arranged) {
      imagesContainer.innerHTML = '';
      renderImages(imagesContainer, participation.images);
    } else {
      imagesContainer.innerHTML = participation.images.map(img => `
        <div class="participation-image">
          <img src="${img.src}" alt="${getText(img.caption || '')}" loading="lazy">
          ${img.caption ? `<div class="image-caption">${getText(img.caption)}</div>` : ''}
        </div>
      `).join('');
    }
  }

  // Related projects and external links
  const linksContainer = document.getElementById('participation-links');
  if (linksContainer) {
    let html = '';
    if (participation.projects && participation.projects.length > 0) {
      const projectsData = await loadProjectsData();
      const related = (projectsData?.projects || []).filter(p => participation.projects.includes(p.id));
      if (related.length > 0) {
        html += `
          <h3>${t('participation.related_project')}</h3>
          <ul class="external-links-list">
            ${related.map(p => `
              <li><a href="project.html?id=${p.id}">${getText(p.title)} →</a></li>
            `).join('')}
          </ul>
        `;
      }
    }
    if (participation.externalLinks && participation.externalLinks.length > 0) {
      html += `
        <h3>${t('participation.external_links')}</h3>
        <ul class="external-links-list">
          ${participation.externalLinks.map(link => `
            <li><a href="${link.url}" target="_blank" rel="noopener">${getText(link.label)} ↗</a></li>
          `).join('')}
        </ul>
      `;
    }
    linksContainer.innerHTML = html;
  }

  // Back link
  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.textContent = `← ${t('participation.back_to_about')}`;
  }

  // Update page title
  document.title = `${getText(participation.title)} — Carlota Azenha da Rocha`;

  // Add fade-in
  setTimeout(() => {
    document.querySelector('main').classList.add('loading');
  }, 100);

  // Reinitialize lightbox and animations for new content
  initLightbox();
  initScrollAnimations();
}

// ============================================
// NAVIGATION - Active State & Text
// ============================================

function updateNavigationText() {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === 'index.html') {
      link.textContent = t('nav.projects');
    } else if (href === 'research.html') {
      link.textContent = t('nav.research');
    } else if (href === 'about.html') {
      link.textContent = t('nav.about');
    }
  });
}

function setActiveNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (
      (currentPage === 'index.html' && href === 'index.html') ||
      (currentPage === 'about.html' && href === 'about.html') ||
      (currentPage.includes('project.html') && href === 'index.html') ||
      (currentPage === 'research.html' && href === 'research.html')
    ) {
      link.classList.add('active');
    }
  });
  
  // Update navigation text
  updateNavigationText();
}

// ============================================
// FOOTER
// ============================================

function updateFooter() {
  const footer = document.querySelector('footer p');
  if (footer && translationsData) {
    footer.textContent = t('footer.copyright');
  }
}

// ============================================
// LIGHTBOX / IMAGE MODAL
// ============================================

function initLightbox() {
  // Create lightbox element if it doesn't exist
  if (!document.getElementById('lightbox')) {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <div class="lightbox-content">
        <img src="" alt="">
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(lightbox);

    // Close on click outside image
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        closeLightbox();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }
    });
  }

  // Add click listeners to all project and participation images
  document.querySelectorAll('.project-image img, .participation-image img').forEach(img => {
    img.addEventListener('click', () => {
      openLightbox(img.src, img.alt);
    });
  });
}

function openLightbox(src, caption) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-content img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');

  lightboxImg.src = src;
  lightboxCaption.textContent = caption || '';

  // Show lightbox with animation
  lightbox.style.display = 'flex';
  requestAnimationFrame(() => {
    lightbox.classList.add('active');
  });

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');

  setTimeout(() => {
    lightbox.style.display = 'none';
  }, 300);

  // Restore body scroll
  document.body.style.overflow = '';
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('nav ul');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking on a link
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

// Elements that fade in when they scroll into view
const ANIMATED_ELEMENTS =
  '.project-card, .project-image, .cv-item, .cv-item-link, ' +
  '.about-main h2, .skills-section, .languages-section, .cv-section, ' +
  '.participations-section, .fade-in, .participation-image';

function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add stagger delay for grid items
        const delay = entry.target.classList.contains('project-card')
          ? index * 100
          : 0;

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation (already revealed ones are skipped)
  document.querySelectorAll(ANIMATED_ELEMENTS).forEach(el => {
    if (!el.classList.contains('visible')) observer.observe(el);
  });
}

function revealAnimatedElements() {
  document.querySelectorAll(ANIMATED_ELEMENTS).forEach(el => el.classList.add('visible'));
}

// ============================================
// LAZY LOADING IMAGES
// ============================================

function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Load translations first
  await loadTranslations();

  // Initialize language
  initLanguage();

  // Set active navigation
  setActiveNavigation();

  // Setup language switcher buttons
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchLanguage(btn.dataset.lang);
    });
  });

  // Initialize appropriate page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  if (currentPage === 'index.html' || currentPage === '') {
    await initHomepage();
  } else if (currentPage === 'project.html') {
    await initProjectPage();
  } else if (currentPage === 'about.html') {
    await initAboutPage();
  } else if (currentPage === 'participation.html') {
    await initParticipationPage();
  } else if (currentPage === 'research.html') {
    await initResearchPage();
  }

  // Update footer
  updateFooter();

  // Setup lazy loading
  setupLazyLoading();

  // Setup lightbox for images
  initLightbox();

  // Setup mobile menu
  initMobileMenu();

  // Setup scroll animations
  initScrollAnimations();
});
