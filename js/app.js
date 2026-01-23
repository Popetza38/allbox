/**
 * DramaBox - Main Application JavaScript
 * Handles UI interactions, page rendering, and navigation
 */

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  initLanguageSelector();
  initHeaderScroll();
  initNavigation();
  initSearch();
  loadHomePage();

  // Listen for language changes - reload content
  i18n.onLanguageChange(() => {
    updateUIText();
    api.clearCache(); // Clear cache to get fresh data
    loadHomePage();   // Reload content with new language
  });
}

// ==================== Header & Navigation ====================
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function initNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'index';
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    const href = item.getAttribute('href') || '';
    // Check for both clean URL and .html version
    if (href.includes(currentPage.replace('.html', '')) ||
      (currentPage === '' && href.includes('index'))) {
      item.classList.add('active');
    }
  });
}

function initLanguageSelector() {
  const langSelect = document.getElementById('langSelect');
  if (!langSelect) return;

  langSelect.value = i18n.getLanguage();

  langSelect.addEventListener('change', (e) => {
    i18n.setLanguage(e.target.value);
    // Content will reload via onLanguageChange listener
  });
}

function updateUIText() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = i18n.t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = i18n.t(el.dataset.i18nPlaceholder);
  });
}

// ==================== Search ====================
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.querySelector('.search-btn');

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  // Check URL for search query
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  if (searchQuery && searchInput) {
    searchInput.value = searchQuery;
    performSearch();
  }
}

async function performSearch() {
  const searchInput = document.getElementById('searchInput');
  const query = searchInput?.value?.trim();

  if (!query) {
    loadHomePage();
    return;
  }

  showLoading();

  try {
    const results = await api.search(query);
    renderSearchResults(query, results);
  } catch (error) {
    showError(i18n.t('error') + ': ' + error.message);
  }

  hideLoading();
}

function renderSearchResults(query, results) {
  const container = document.getElementById('contentContainer');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-state slide-up">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">${i18n.t('noResults')}</h3>
        <p class="empty-description">"${query}"</p>
        <button class="btn btn-primary" onclick="loadHomePage()">
          🏠 ${i18n.t('home')}
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <section class="content-row fade-in">
      <div class="row-header">
        <h2 class="row-title">
          🔍 ${i18n.t('searchResults')}: "${query}"
          <span class="row-count">(${results.length})</span>
        </h2>
      </div>
      <div class="cards-container" style="flex-wrap: wrap;">
        ${results.map(drama => renderDramaCard(drama)).join('')}
      </div>
    </section>
  `;
}

// ==================== Home Page ====================
async function loadHomePage() {
  const container = document.getElementById('contentContainer');
  if (!container) return;

  // Show skeleton loading
  container.innerHTML = renderSkeletonRow() + renderSkeletonRow() + renderSkeletonRow() + renderSkeletonRow();

  try {
    // Load continue watching from history
    const continueWatching = watchHistory.getContinueWatching(10);

    // Load multiple categories in parallel - load 4 pages each for more content
    const [trending, latest, forYou, hot, completed] = await Promise.all([
      api.getMultiplePages(p => api.getTrending(p), 6), // 4 pages = more movies
      api.getMultiplePages(p => api.getLatest(p), 6),
      api.getMultiplePages(p => api.getForYou(p), 6),
      api.getMultiplePages(p => api.getHot(p), 4).catch(() => []),
      api.getMultiplePages(p => api.getCompleted(p), 4).catch(() => [])
    ]);

    let html = '';

    // Hero section (from trending)
    if (trending.length > 0) {
      html += renderHeroSection(trending.slice(0, 5));
    }

    // Continue watching section
    if (continueWatching.length > 0) {
      html += renderContinueWatchingSection(continueWatching);
    }

    // Content rows with more categories
    html += renderContentRow(i18n.t('trending'), trending, 'row-trending');
    html += renderContentRow(i18n.t('latest'), latest, 'row-latest');
    html += renderContentRow(i18n.t('forYou'), forYou, 'row-foryou');

    if (hot.length > 0) {
      html += renderContentRow('🌟 Hot Now', hot, 'row-hot');
    }

    if (completed.length > 0) {
      html += renderContentRow('✅ จบแล้ว', completed, 'row-completed');
    }

    // Top 10 section
    if (trending.length >= 10) {
      html += renderTop10Section(trending.slice(0, 10));
    }

    // Additional category rows (from different sources if available)
    if (latest.length > 20) {
      html += renderContentRow('📺 ยอดนิยมประจำสัปดาห์', latest.slice(10, 30), 'row-weekly');
    }

    container.innerHTML = html;

    // Initialize hero slideshow
    initHeroSlideshow();

    // Initialize sliders
    setTimeout(initSliders, 100);

  } catch (error) {
    console.error('Error loading home page:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3 class="empty-title">${i18n.t('error')}</h3>
        <p class="empty-description">${error.message}</p>
        <button class="btn btn-primary" onclick="loadHomePage()">
          🔄 ${i18n.t('tryAgain')}
        </button>
      </div>
    `;
  }
}

// ==================== Hero Section ====================
function renderHeroSection(items) {
  if (!items?.length) return '';

  return `
    <section class="hero">
      ${items.map((item, idx) => `
        <div class="hero-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
          <img src="${item.coverUrl}" alt="${item.bookName}" class="hero-backdrop"
               onerror="this.src='https://placehold.co/1920x1080/111/333?text=DramaBox'">
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <div class="hero-badge">
              ${item.isHot ? '🔥 HOT' : item.isNew ? '✨ NEW' : '▶️ DRAMA'}
            </div>
            <h1 class="hero-title">${item.bookName}</h1>
            <p class="hero-description">${item.description || ''}</p>
            <div class="hero-meta">
              ${item.chapterCount ? `<span class="hero-meta-item">📺 ${item.chapterCount} ${i18n.t('episodes')}</span>` : ''}
              ${item.genre ? `<span class="hero-meta-item">🎭 ${item.genre}</span>` : ''}
            </div>
            <div class="hero-buttons">
              <button class="btn btn-primary" onclick="openDrama('${item.bookId}')">
                ▶️ ${i18n.t('watchNow')}
              </button>
              <button class="btn btn-secondary" onclick="openDetail('${item.bookId}')">
                ℹ️ ${i18n.t('moreInfo')}
              </button>
            </div>
          </div>
        </div>
      `).join('')}
      <div class="hero-indicators">
        ${items.map((_, idx) => `
          <div class="hero-indicator ${idx === 0 ? 'active' : ''}" 
               onclick="setHeroSlide(${idx})"></div>
        `).join('')}
      </div>
    </section>
  `;
}

let heroInterval = null;

function initHeroSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length <= 1) return;

  if (heroInterval) clearInterval(heroInterval);

  heroInterval = setInterval(() => {
    const current = document.querySelector('.hero-slide.active');
    const currentIndex = parseInt(current?.dataset.index || 0);
    const nextIndex = (currentIndex + 1) % slides.length;
    setHeroSlide(nextIndex);
  }, 6000);
}

function setHeroSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const indicators = document.querySelectorAll('.hero-indicator');

  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  indicators.forEach((ind, i) => ind.classList.toggle('active', i === index));
}

// ==================== Content Rows ====================
function renderContentRow(title, items, rowId) {
  if (!items?.length) return '';
  const id = rowId || 'row-' + Math.random().toString(36).substr(2, 9);

  return `
    <section class="content-row slide-up">
      <div class="row-header">
        <h2 class="row-title">
          ${title}
          <span class="row-count">(${items.length})</span>
        </h2>
        <a href="#" class="see-all">${i18n.t('seeAll')} →</a>
      </div>
      <div class="cards-wrapper">
        <button class="slider-arrow prev" onclick="slideRow('${id}', -1)">❮</button>
        <div class="cards-container" id="${id}">
          ${items.map(drama => renderDramaCard(drama)).join('')}
        </div>
        <button class="slider-arrow next" onclick="slideRow('${id}', 1)">❯</button>
      </div>
    </section>
  `;
}

// Slider function
function slideRow(rowId, direction) {
  const container = document.getElementById(rowId);
  if (!container) return;

  const cardWidth = 186; // card width (170) + gap (16)
  const scrollAmount = cardWidth * 3; // Scroll 3 cards at a time

  container.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  });

  // Update fade edges
  setTimeout(() => updateSliderState(container), 300);
}

function updateSliderState(container) {
  const wrapper = container.closest('.cards-wrapper');
  if (!wrapper) return;

  const canScrollLeft = container.scrollLeft > 10;
  const canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 10);

  wrapper.classList.toggle('can-scroll-left', canScrollLeft);
  wrapper.classList.toggle('can-scroll-right', canScrollRight);
}

// Initialize all sliders on page
function initSliders() {
  document.querySelectorAll('.cards-container').forEach(container => {
    updateSliderState(container);
    container.addEventListener('scroll', () => updateSliderState(container));
  });
}

function renderDramaCard(drama) {
  const badges = [];
  if (drama.isNew) badges.push(`<span class="badge badge-new">${i18n.t('new')}</span>`);
  if (drama.isHot) badges.push(`<span class="badge badge-hot">${i18n.t('hot')}</span>`);
  if (drama.isVip) badges.push(`<span class="badge badge-vip">${i18n.t('vip')}</span>`);

  return `
    <div class="drama-card" onclick="openDrama('${drama.bookId}')">
      <div class="card-poster">
        <img src="${drama.coverUrl}" alt="${drama.bookName}" loading="lazy"
             onerror="this.src='https://placehold.co/300x450/1c1c1c/666?text=No+Image'">
        <div class="card-badges">
          ${badges.join('')}
          ${drama.chapterCount ? `<span class="badge badge-episodes">${drama.chapterCount} EP</span>` : ''}
        </div>
        <div class="card-overlay">
          <div class="play-icon">▶</div>
        </div>
      </div>
      <div class="card-info">
        <h3 class="card-title">${drama.bookName}</h3>
        ${drama.genre ? `<p class="card-meta">${drama.genre}</p>` : ''}
      </div>
    </div>
  `;
}

// ==================== Continue Watching ====================
function renderContinueWatchingSection(items) {
  return `
    <section class="content-row slide-up">
      <div class="row-header">
        <h2 class="row-title">${i18n.t('continueWatching')}</h2>
      </div>
      <div class="cards-container">
        ${items.map(item => {
    const progressPercent = watchHistory.getProgressPercent(item);
    return `
            <div class="drama-card" onclick="continueDrama('${item.bookId}', ${item.episodeIndex})">
              <div class="card-poster">
                <img src="${item.coverUrl}" alt="${item.bookName}" loading="lazy"
                     onerror="this.src='https://placehold.co/300x450/1c1c1c/666?text=No+Image'">
                <div class="card-overlay">
                  <div class="play-icon">▶</div>
                </div>
                <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:rgba(0,0,0,0.6);">
                  <div style="width:${progressPercent}%;height:100%;background:var(--primary);"></div>
                </div>
              </div>
              <div class="card-info">
                <h3 class="card-title">${item.bookName}</h3>
                <p class="card-meta">${item.episodeName}</p>
              </div>
            </div>
          `;
  }).join('')}
      </div>
    </section>
  `;
}

// ==================== Top 10 Section ====================
function renderTop10Section(items) {
  return `
    <section class="content-row slide-up">
      <div class="row-header">
        <h2 class="row-title">${i18n.t('top10')}</h2>
      </div>
      <div class="top10-container">
        ${items.map((drama, idx) => `
          <div class="top10-card" onclick="openDrama('${drama.bookId}')">
            <span class="top10-rank">${idx + 1}</span>
            <div class="top10-poster">
              <img src="${drama.coverUrl}" alt="${drama.bookName}" loading="lazy"
                   onerror="this.src='https://placehold.co/300x450/1c1c1c/666?text=No+Image'">
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

// ==================== Skeleton Loading ====================
function renderSkeletonRow() {
  return `
    <section class="content-row">
      <div class="row-header">
        <div class="skeleton" style="width:180px;height:24px;"></div>
      </div>
      <div class="cards-container">
        ${Array(6).fill('').map(() => `
          <div class="skeleton-card">
            <div class="skeleton skeleton-poster"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-meta"></div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

// ==================== Loading & Errors ====================
function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.add('hidden');
}

function showError(message) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      icon: 'error',
      title: i18n.t('error'),
      text: message,
      background: '#181818',
      color: '#fff',
      confirmButtonColor: '#e50914'
    });
  } else {
    alert(message);
  }
}

function showSuccess(message) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      icon: 'success',
      title: i18n.t('success'),
      text: message,
      background: '#181818',
      color: '#fff',
      confirmButtonColor: '#e50914',
      timer: 2000,
      showConfirmButton: false
    });
  }
}

// ==================== Navigation Functions ====================
// FIXED: Using clean URLs without .html to preserve query parameters
function openDrama(bookId) {
  window.location.href = `watch?id=${bookId}`;
}

function openDetail(bookId) {
  window.location.href = `detail?id=${bookId}`;
}

function continueDrama(bookId, episodeIndex) {
  window.location.href = `watch?id=${bookId}&ep=${episodeIndex}`;
}

// ==================== Export Functions ====================
window.loadHomePage = loadHomePage;
window.performSearch = performSearch;
window.openDrama = openDrama;
window.openDetail = openDetail;
window.continueDrama = continueDrama;
window.setHeroSlide = setHeroSlide;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showError = showError;
window.showSuccess = showSuccess;
window.slideRow = slideRow;
window.initSliders = initSliders;

