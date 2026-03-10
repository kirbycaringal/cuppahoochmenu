/* ============================================
   CUPPA HOOCH — Digital Menu
   menu.js
   ============================================ */

'use strict';

/* ── DOM references ── */
const viewerScreen = document.getElementById('viewer-screen');
const viewerCtr    = document.getElementById('viewer-counter');
const slidesTrack  = document.getElementById('slides-track');
const dotRow       = document.getElementById('dot-row');
const prevBtn      = document.getElementById('prev-btn');
const nextBtn      = document.getElementById('next-btn');
const closeBtn     = document.getElementById('close-btn');
const slideArea    = document.getElementById('slide-area');

let current = 0;
let total   = 0;

/* ══════════════════════════════
   OPEN VIEWER
   Called when a category button is clicked.
   Builds slides from the image list and opens the viewer.
══════════════════════════════ */
function openViewer(label, images) {
  current = 0;
  total   = images.length;

  /* build slides */
  slidesTrack.innerHTML = '';
  images.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';

    const img = document.createElement('img');
    img.alt = label + ' — page ' + (i + 1);
    img.src = src;
    img.onerror = function () {
      slide.innerHTML = '';
      slide.appendChild(makePlaceholder(label, i + 1));
    };

    slide.appendChild(img);
    slidesTrack.appendChild(slide);
  });

  /* build dot indicators */
  dotRow.innerHTML = '';
  images.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot';
    d.addEventListener('click', () => goTo(i));
    dotRow.appendChild(d);
  });

  /* show/hide navigation elements depending on slide count */
  const multi = total > 1;
  prevBtn.style.display    = multi ? '' : 'none';
  nextBtn.style.display    = multi ? '' : 'none';
  dotRow.style.display     = multi ? '' : 'none';
  viewerCtr.style.display  = multi ? '' : 'none';

  updateUI();

  viewerScreen.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ══════════════════════════════
   CLOSE VIEWER
   Hides the viewer and restores page scroll.
══════════════════════════════ */
function closeViewer() {
  viewerScreen.classList.remove('open');
  document.body.style.overflow = '';
  resetFitMode();
}

/* ══════════════════════════════
   GO TO SLIDE
   Moves the track to show the given slide index.
══════════════════════════════ */
function goTo(index) {
  current = Math.max(0, Math.min(index, total - 1));
  slidesTrack.style.transform = 'translateX(-' + current * 100 + '%)';
  updateUI();
}

/* ── sync counter, arrows and dots to current slide ── */
function updateUI() {
  viewerCtr.textContent = (current + 1) + ' / ' + total;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === total - 1;
  document.querySelectorAll('.dot').forEach((d, i) =>
    d.classList.toggle('active', i === current)
  );
}

/* ── create a placeholder slide when an image fails to load ── */
function makePlaceholder(label, page) {
  const div = document.createElement('div');
  div.className = 'slide-placeholder';
  div.innerHTML =
    '<i class="bi bi-image"></i>' +
    '<span class="ph-title">' + label + ' — Page ' + page + '</span>' +
    '<span class="ph-sub">Add filename in data-images</span>';
  return div;
}

/* ══════════════════════════════
   EVENTS
══════════════════════════════ */

/* category button click → open viewer */
document.getElementById('cat-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('.cat-btn');
  if (!btn) return;
  const label  = btn.dataset.label;
  const images = btn.dataset.images.split(',').map(s => s.trim()).filter(Boolean);
  if (images.length) openViewer(label, images);
});

/* arrow buttons */
prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => goTo(current + 1));

/* close button */
closeBtn.addEventListener('click', closeViewer);

/* ── fit-to-screen toggle ── */
const fullscreenBtn  = document.getElementById('fullscreen-btn');
const fullscreenIcon = document.getElementById('fullscreen-icon');
let isCover = false;

fullscreenBtn.addEventListener('click', () => {
  isCover = !isCover;

  // toggle cover class on all slide images
  document.querySelectorAll('.slide img').forEach(img => {
    img.classList.toggle('cover', isCover);
  });

  // swap icon: arrows-fullscreen = fill mode, fullscreen-exit look = contain mode
  fullscreenIcon.className = isCover
    ? 'bi bi-arrows-angle-contract'
    : 'bi bi-arrows-angle-expand';

  fullscreenBtn.title = isCover ? 'Fit to screen' : 'Fill screen';
});

/* reset fit mode when viewer closes */
function resetFitMode() {
  isCover = false;
  document.querySelectorAll('.slide img').forEach(img => img.classList.remove('cover'));
  fullscreenIcon.className = 'bi bi-arrows-angle-expand';
  fullscreenBtn.title = 'Fill screen';
}

/* keyboard navigation */
document.addEventListener('keydown', (e) => {
  if (!viewerScreen.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  goTo(current - 1);
  if (e.key === 'ArrowRight') goTo(current + 1);
  if (e.key === 'Escape')     closeViewer();
});

/* touch / swipe support */
let txStart = 0;
let txDelta = 0;

slideArea.addEventListener('touchstart', (e) => {
  txStart = e.touches[0].clientX;
  txDelta = 0;
}, { passive: true });

slideArea.addEventListener('touchmove', (e) => {
  txDelta = e.touches[0].clientX - txStart;
}, { passive: true });

slideArea.addEventListener('touchend', () => {
  if (Math.abs(txDelta) > 50) {
    txDelta < 0 ? goTo(current + 1) : goTo(current - 1);
  }
});
