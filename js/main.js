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
function switchLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('portfolio-language', lang);
  updateLanguageUI();

  // Always update navigation text and footer
  updateNavigationText();
  updateFooter();

  // Reload current page content
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage === 'index.html' || currentPage === '') {
    initHomepage();
  } else if (currentPage === 'project.html') {
    initProjectPage();
  } else if (currentPage === 'about.html') {
    updateAboutPage();
  } else if (currentPage === 'participation.html') {
    initParticipationPage();
  }
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
    const response = await fetch('projects.json');
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
    const response = await fetch('translations.json');
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
    const response = await fetch('participations.json');
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
    const response = await fetch('about.json');
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

  data.projects.forEach(project => {
    const card = createProjectCard(project);
    gridContainer.appendChild(card);
  });

  // Add fade-in animation
  setTimeout(() => {
    gridContainer.classList.add('loading');
  }, 100);
}

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
    const fields = ['year', 'location', 'typology', 'context', 'institution', 'teachers'];
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



  // Populate images
  const contentContainer = document.getElementById('project-content');
  if (contentContainer) {
    contentContainer.innerHTML = '';
    let row = null;
    project.images.forEach(image => {
      // Optional section heading before this image
      if (image.section) {
        const heading = document.createElement('h2');
        heading.className = 'project-section-title';
        heading.textContent = getText(image.section);
        contentContainer.appendChild(heading);
        row = null;
      }

      const layoutClass = { full: 'full-width', half: 'half-width' }[image.layout] || 'inset';
      const imageDiv = document.createElement('div');
      imageDiv.className = `project-image ${layoutClass}`;
      imageDiv.innerHTML = `
        <img src="${image.src}" alt="${getText(image.caption)}" loading="lazy">
        <div class="image-caption">${getText(image.caption)}</div>
      `;

      // Consecutive half-width images share a row
      if (image.layout === 'half') {
        if (!row) {
          row = document.createElement('div');
          row.className = 'project-image-row';
          contentContainer.appendChild(row);
        }
        row.appendChild(imageDiv);
      } else {
        row = null;
        contentContainer.appendChild(imageDiv);
      }
    });
  }

  // Setup navigation
  setupProjectNavigation(data.projects, projectId);

  // Update page title
  document.title = `${getText(project.title)} — Architecture Portfolio`;

  // Add fade-in
  setTimeout(() => {
    document.querySelector('main').classList.add('loading');
  }, 100);

  // Reinitialize lightbox and animations for new content
  initLightbox();
  initScrollAnimations();
}

function setupProjectNavigation(projects, currentId) {
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
    loadParticipationsData()
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
    educationContainer.innerHTML = aboutData.education.map(edu => `
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
    publicationsContainer.innerHTML = aboutData.publications.map(pub => `
      <div class="cv-item">
        <div class="cv-date">${pub.date}</div>
        <div class="cv-title">${getText(pub.title)}</div>
        <div class="cv-institution">${getText(pub.institution)}</div>
      </div>
    `).join('');
  }

  // Update thesis section
  const thesisContainer = document.getElementById('thesis-section');
  if (thesisContainer && aboutData.thesis) {
    thesisContainer.innerHTML = `
      <div class="cv-item">
        <div class="cv-date">${getText(aboutData.thesis.date)}</div>
        <div class="cv-title">${getText(aboutData.thesis.title)}</div>
        <div class="cv-institution">${getText(aboutData.thesis.institution)}</div>
      </div>
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

  // Update contact section
  const contactContainer = document.getElementById('contact-section');
  if (contactContainer && aboutData.contact) {
    contactContainer.innerHTML = `
      <h3>${labels.contact}</h3>
      <div class="contact-item">
        <div class="contact-label">${labels.contact_labels.name}</div>
        <div class="contact-value">${aboutData.contact.name}</div>
      </div>
      <div class="contact-item">
        <div class="contact-label">${labels.contact_labels.email}</div>
        <div class="contact-value">
          <a href="mailto:${aboutData.contact.email}">${aboutData.contact.email}</a>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-label">${labels.contact_labels.location}</div>
        <div class="contact-value">${getText(aboutData.contact.location)}</div>
      </div>
      <div class="contact-item">
        <div class="contact-label">${labels.contact_labels.linkedin}</div>
        <div class="contact-value">
          <a href="${aboutData.contact.linkedin.url}" target="_blank" rel="noopener">${aboutData.contact.linkedin.label} <span class="external-arrow">↗</span></a>
        </div>
      </div>
    `;
  }

  // Update footer
  updateFooter();
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
        <div class="cv-date">${getText(p.dateDisplay)}</div>
        <div class="cv-title">${getText(p.title)} <span class="link-arrow">→</span></div>
        <div class="cv-institution">${getText(p.location)} · ${getText(p.institution)}</div>
      </a>
    `;
  }).join('');
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
      <div class="meta-item">${getText(participation.institution)}</div>
    `;
  }

  // Description
  const descContainer = document.getElementById('participation-description');
  if (descContainer) {
    descContainer.innerHTML = `<p>${getText(participation.description)}</p>`;
  }

  // Images
  const imagesContainer = document.getElementById('participation-images');
  if (imagesContainer && participation.images && participation.images.length > 0) {
    imagesContainer.innerHTML = participation.images.map(img => `
      <div class="participation-image">
        <img src="${img.src}" alt="${getText(img.caption || '')}" loading="lazy">
        ${img.caption ? `<div class="image-caption">${getText(img.caption)}</div>` : ''}
      </div>
    `).join('');
  }

  // External links
  const linksContainer = document.getElementById('participation-links');
  if (linksContainer && participation.externalLinks && participation.externalLinks.length > 0) {
    linksContainer.innerHTML = `
      <h3>${t('participation.external_links')}</h3>
      <ul class="external-links-list">
        ${participation.externalLinks.map(link => `
          <li><a href="${link.url}" target="_blank" rel="noopener">${getText(link.label)} ↗</a></li>
        `).join('')}
      </ul>
    `;
  }

  // Back link
  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.textContent = `← ${t('participation.back_to_about')}`;
  }

  // Update page title
  document.title = `${getText(participation.title)} — Architecture Portfolio`;

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
      (currentPage.includes('project.html') && href === 'index.html')
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

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(
    '.project-card, .project-image, .cv-item, .cv-item-link, ' +
    '.about-main h2, .skills-section, .languages-section, .cv-section, ' +
    '.participations-section, .fade-in, .participation-image'
  );

  animatedElements.forEach(el => observer.observe(el));
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
