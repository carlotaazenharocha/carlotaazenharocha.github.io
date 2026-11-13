// ============================================
// SKETCHBOOKS
// A project with "sketchbook" is shown unfolded as a leporello: one long strip
// of pages folded alternately, instead of a list of images. Each image is a
// spread ("pages": left and right) or a single page ("pages": one), with the
// subject in "site" and, for a travel sketchbook, "place" and "date"; spreads
// drawn on the same day form a journey. "sketchbook.cover" opens the strip.
// ============================================

const SKETCHBOOK_LABELS = {
  pt: { journey: 'Viagem', cover: 'Capa', previous: 'Anterior', next: 'Seguinte', drag: 'Arraste ou use as setas para desdobrar o caderno' },
  en: { journey: 'Journey', cover: 'Cover', previous: 'Previous', next: 'Next', drag: 'Drag or use the arrows to unfold the sketchbook' },
  es: { journey: 'Viaje', cover: 'Portada', previous: 'Anterior', next: 'Siguiente', drag: 'Arrastre o use las flechas para desplegar el cuaderno' }
};

function sketchLabel(key) {
  return (SKETCHBOOK_LABELS[currentLanguage] || SKETCHBOOK_LABELS.en)[key];
}

// 2023-12-08 → 08.12.23, as written in the sketchbook
function shortDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y.slice(2)}`;
}

function sketchCaption(item) {
  return [getText(item.caption) || item.site, item.date && shortDate(item.date)].filter(Boolean).join(' · ');
}

// Page numbers run through the sketchbook: 01–02, 03–04 ... or 01, 02 ...
function numberPages(items) {
  let page = 0;
  return items.map(item => item.pages.map(() => String(++page).padStart(2, '0')).join('–'));
}

// Consecutive items drawn on the same day form one journey
function sketchbookJourneys(items) {
  const journeys = [];
  items.forEach((item, index) => {
    let journey = journeys[journeys.length - 1];
    if (!journey || journey.date !== item.date) {
      journey = { date: item.date, places: [], items: [] };
      journeys.push(journey);
    }
    if (item.place && !journey.places.includes(item.place)) journey.places.push(item.place);
    journey.items.push(index);
  });
  return journeys;
}

const arrowIcon = points => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="${points}"/></svg>`;

function renderSketchbook(container, project) {
  const items = project.images;
  const numbers = numberPages(items);
  const withJourneys = items.every(item => item.date);
  const cover = project.sketchbook?.cover;
  let fold = 0; // pages alternate their fold along the whole strip
  const page = (src, alt) => `<div class="sb-lep-page ${fold++ % 2 ? 'is-even' : 'is-odd'}"><img src="${src}" alt="${alt}" loading="lazy" draggable="false"></div>`;
  const group = index => {
    const item = items[index];
    return `
      <div class="sb-lep-group" data-index="${index}">
        <div class="sb-lep-pages">${item.pages.map(src => page(src, item.site)).join('')}</div>
        <div class="sb-lep-label">
          <span class="sb-lep-label-pages">${numbers[index]}</span>
          <span class="sb-lep-label-site">${item.site}</span>
          ${item.place ? `<span class="sb-lep-label-place">${item.place}</span>` : ''}
        </div>
      </div>`;
  };

  const coverGroup = cover ? `
      <div class="sb-lep-group sb-lep-group--cover">
        <div class="sb-lep-pages">${page(cover, sketchLabel('cover'))}</div>
        <div class="sb-lep-label"><span class="sb-lep-label-site">${sketchLabel('cover')}</span></div>
      </div>` : '';
  const pages = withJourneys
    ? sketchbookJourneys(items).map((journey, j) => `
        <div class="sb-lep-journey">
          <span class="sb-lep-journey-num">${sketchLabel('journey')} ${String(j + 1).padStart(2, '0')}</span>
          <span class="sb-hand sb-lep-journey-date">${shortDate(journey.date)}</span>
          <span class="sb-lep-journey-places">${journey.places.join('<br>')}</span>
        </div>
        ${journey.items.map(group).join('')}`).join('')
    : items.map((item, index) => group(index)).join('');

  const section = document.createElement('section');
  section.className = 'sb-lep';
  section.innerHTML = `
    <div class="sb-lep-track"><div class="sb-lep-strip">${coverGroup}${pages}</div></div>
    <div class="sb-lep-bar">
      <button type="button" class="sb-arrow" aria-label="${sketchLabel('previous')}">${arrowIcon('15 18 9 12 15 6')}</button>
      <div class="sb-lep-progress"><span></span></div>
      <button type="button" class="sb-arrow" aria-label="${sketchLabel('next')}">${arrowIcon('9 18 15 12 9 6')}</button>
    </div>
    <p class="sb-lep-hint">${sketchLabel('drag')}</p>
  `;
  container.innerHTML = '';
  container.appendChild(section);

  const track = section.querySelector('.sb-lep-track');
  const bar = section.querySelector('.sb-lep-progress span');
  const [prevBtn, nextBtn] = section.querySelectorAll('.sb-arrow');
  const groups = [...section.querySelectorAll('.sb-lep-group')];

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    bar.style.width = `${max > 0 ? (track.scrollLeft / max) * 100 : 100}%`;
    prevBtn.disabled = track.scrollLeft <= 1;
    nextBtn.disabled = track.scrollLeft >= max - 1;
  };
  // Arrows bring the next or previous group of pages to the left edge
  const step = direction => {
    const left = track.scrollLeft;
    const starts = groups.map(g => g.offsetLeft - 24);
    const target = direction > 0 ? starts.find(x => x > left + 4) : [...starts].reverse().find(x => x < left - 4);
    track.scrollTo({ left: target ?? (direction > 0 ? track.scrollWidth : 0), behavior: 'smooth' });
  };
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  // Drag with the mouse to unfold; a click without dragging opens the pages larger
  let drag = null;
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    drag = { x: e.clientX, left: track.scrollLeft, moved: false };
    track.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    track.scrollLeft = drag.left - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    track.classList.remove('is-dragging');
    setTimeout(() => { drag = null; }, 0);
  });
  groups.forEach(g => g.addEventListener('click', () => {
    if (drag?.moved) return;
    const item = items[Number(g.dataset.index)];
    if (item) openLightbox(item.src, sketchCaption(item));
    else if (cover) openLightbox(cover, sketchLabel('cover'));
  }));

  update();
}
