/**
 * DramaBox - Search Page Logic with Load More
 */

// Global state for pagination
let currentPage = 1;
let currentType = null;
let isLoading = false;
let hasMore = true;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

async function init() {
    const searchQuery = utils.getUrlParam('q');
    const categoryType = utils.getUrlParam('type');

    if (searchQuery) {
        // Search mode
        document.getElementById('searchInput').value = searchQuery;
        await performSearch(searchQuery);
    } else if (categoryType) {
        // Category mode
        await loadCategory(categoryType);
    } else {
        // Default: show popular searches and all categories
        await loadPopularSearches();
        await loadAllCategories();
    }

    // Setup live search
    setupLiveSearch();
}

/**
 * Load popular search keywords
 */
async function loadPopularSearches() {
    try {
        const popular = await dramaAPI.getPopularSearches();
        const container = document.getElementById('popularTags');

        if (popular && popular.length > 0) {
            container.innerHTML = popular.map(item => {
                // API returns full drama objects with bookName, not simple keyword strings
                const keyword = item.bookName || item.keyword || item.name || (typeof item === 'string' ? item : '');
                if (!keyword) return ''; // Skip empty items
                return `<span class="popular-tag" onclick="searchKeyword('${keyword.replace(/'/g, "\\'")}')">${keyword}</span>`;
            }).join('');
        } else {
            // Fallback popular tags
            const defaultTags = ['Romance', 'Action', 'Comedy', 'Drama', 'CEO', 'Revenge', 'Family', 'Modern'];
            container.innerHTML = defaultTags.map(tag =>
                `<span class="popular-tag" onclick="searchKeyword('${tag}')">${tag}</span>`
            ).join('');
        }
    } catch (error) {
        console.error('Error loading popular searches:', error);
        document.getElementById('popularTags').innerHTML = '<p style="color: var(--text-muted);">Gagal memuat pencarian populer</p>';
    }
}

/**
 * Load all categories on homepage
 */
async function loadAllCategories() {
    // Show all drama categories section
    const allCategoriesSection = document.getElementById('allCategoriesSection');
    if (allCategoriesSection) {
        allCategoriesSection.classList.remove('hidden');
    }

    // Load each category
    await loadCategoryPreview('trendingPreview', 'Trending Sekarang', dramaAPI.getTrending, 'trending');
    await loadCategoryPreview('latestPreview', 'Baru Dirilis', dramaAPI.getLatest, 'latest');
    await loadCategoryPreview('foryouPreview', 'Untukmu', dramaAPI.getForYou, 'foryou');
    await loadCategoryPreview('dubindoPreview', 'Sulih Suara Indonesia', () => dramaAPI.getDubIndo('terpopuler'), 'dubindo');
}

/**
 * Load category preview for homepage
 */
async function loadCategoryPreview(containerId, title, fetchFn, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        let dramas = await fetchFn();

        if (dramas && dramas.data) {
            dramas = dramas.data;
        }

        // Handle nested structure
        if (dramas && dramas.columnVoList) {
            dramas = dramas.columnVoList.reduce((acc, col) => acc.concat(col.bookList || []), []);
        }

        if (dramas && dramas.length > 0) {
            container.innerHTML = dramas.slice(0, 10).map(drama => utils.createDramaCard(drama)).join('');
            if (window.lucide) lucide.createIcons();
        }
    } catch (error) {
        console.error(`Error loading ${title}:`, error);
    }
}

/**
 * Load category dramas (trending, latest, etc.) with Load More support
 */
async function loadCategory(type) {
    // Reset pagination
    currentPage = 1;
    currentType = type;
    hasMore = true;

    // Hide other sections
    document.getElementById('popularSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('categorySection').classList.remove('hidden');

    // Hide all categories section
    const allCategoriesSection = document.getElementById('allCategoriesSection');
    if (allCategoriesSection) {
        allCategoriesSection.classList.add('hidden');
    }

    const categoryGrid = document.getElementById('categoryGrid');
    const categoryTitle = document.getElementById('categoryTitle');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    // Set titles
    const categories = {
        'trending': { title: 'Drama Trending', fetch: dramaAPI.getTrending, hasPagination: false },
        'latest': { title: 'Drama Terbaru', fetch: dramaAPI.getLatest, hasPagination: false },
        'foryou': { title: 'Untukmu', fetch: dramaAPI.getForYou, hasPagination: false },
        'vip': { title: 'VIP Eksklusif', fetch: dramaAPI.getVip, hasPagination: false },
        'dubindo': { title: 'Sulih Suara Indonesia (Terpopuler)', fetch: (page) => dramaAPI.getDubIndo('terpopuler', page), hasPagination: true },
        'dubindo-terbaru': { title: 'Sulih Suara Indonesia (Terbaru)', fetch: (page) => dramaAPI.getDubIndo('terbaru', page), hasPagination: true }
    };

    const category = categories[type];

    if (!category) {
        document.getElementById('categorySection').classList.add('hidden');
        document.getElementById('noResults').classList.remove('hidden');
        return;
    }

    // Update page title
    categoryTitle.textContent = category.title;
    document.getElementById('pageTitle').textContent = category.title;
    document.title = `${category.title} - DramaBox`;

    // Show/hide load more button based on pagination support
    if (loadMoreBtn) {
        loadMoreBtn.classList.toggle('hidden', !category.hasPagination);
    }

    // Show loading
    utils.showLoading(categoryGrid, 12);

    try {
        let dramas;
        if (category.hasPagination) {
            dramas = await category.fetch(currentPage);
        } else {
            dramas = await category.fetch();
        }

        // Handle different response structures
        if (dramas && dramas.data) {
            dramas = dramas.data;
        }

        // Special handling for VIP - it returns columnVoList with nested bookList arrays
        if (dramas && dramas.columnVoList) {
            console.log('Detected VIP columnVoList structure, flattening...');
            dramas = dramas.columnVoList.reduce((acc, col) => acc.concat(col.bookList || []), []);
        }

        if (dramas && dramas.length > 0) {
            categoryGrid.innerHTML = dramas.map(drama => utils.createDramaCard(drama)).join('');
            if (window.lucide) lucide.createIcons();

            // Check if there might be more items
            if (category.hasPagination && dramas.length < 10) {
                hasMore = false;
                if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
            }
        } else {
            categoryGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 2rem;">Tidak ada drama tersedia</p>';
            hasMore = false;
            if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error loading category:', error);
        categoryGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 2rem;">Gagal memuat data</p>';
    }
}

/**
 * Load more items for pagination
 */
async function loadMore() {
    if (isLoading || !hasMore || !currentType) return;

    const categories = {
        'dubindo': (page) => dramaAPI.getDubIndo('terpopuler', page),
        'dubindo-terbaru': (page) => dramaAPI.getDubIndo('terbaru', page)
    };

    const fetchFn = categories[currentType];
    if (!fetchFn) return;

    isLoading = true;
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const originalText = loadMoreBtn.textContent;
    loadMoreBtn.textContent = 'Memuat...';
    loadMoreBtn.disabled = true;

    currentPage++;

    try {
        let dramas = await fetchFn(currentPage);

        if (dramas && dramas.data) {
            dramas = dramas.data;
        }

        if (dramas && dramas.length > 0) {
            const categoryGrid = document.getElementById('categoryGrid');
            categoryGrid.innerHTML += dramas.map(drama => utils.createDramaCard(drama)).join('');
            if (window.lucide) lucide.createIcons();

            // Check if there might be more
            if (dramas.length < 10) {
                hasMore = false;
                loadMoreBtn.classList.add('hidden');
            }
        } else {
            hasMore = false;
            loadMoreBtn.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error loading more:', error);
        currentPage--; // Revert page on error
    } finally {
        isLoading = false;
        loadMoreBtn.textContent = originalText;
        loadMoreBtn.disabled = false;
    }
}

/**
 * Perform search
 */
async function performSearch(query) {
    if (!query.trim()) return;

    // Show SweetAlert loading
    utils.showSwalLoading('🔍 กำลังค้นหา...', `กำลังค้นหา "${query}"`);

    // Update UI
    document.getElementById('popularSection').classList.add('hidden');
    document.getElementById('categorySection').classList.add('hidden');
    document.getElementById('noResults').classList.add('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');

    // Hide all categories section
    const allCategoriesSection = document.getElementById('allCategoriesSection');
    if (allCategoriesSection) {
        allCategoriesSection.classList.add('hidden');
    }

    const resultsGrid = document.getElementById('resultsGrid');
    const resultsTitle = document.getElementById('resultsTitle');

    resultsTitle.textContent = `ผลลัพธ์สำหรับ "${query}"`;
    document.title = `ค้นหา: ${query} - DramaBox`;

    // Show loading
    utils.showLoading(resultsGrid, 8);

    try {
        const results = await dramaAPI.search(query);

        // Hide SweetAlert loading
        utils.hideSwalLoading();

        if (results && results.length > 0) {
            resultsGrid.innerHTML = results.map(drama => utils.createDramaCard(drama)).join('');
            if (window.lucide) lucide.createIcons();

            // Show success toast
            utils.showSuccess('พบละคร!', `พบ ${results.length} ผลลัพธ์`);
        } else {
            document.getElementById('resultsSection').classList.add('hidden');
            document.getElementById('noResults').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error searching:', error);
        utils.hideSwalLoading();
        utils.showError('เกิดข้อผิดพลาด', 'ไม่สามารถค้นหาได้');
        resultsGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 2rem;">ไม่สามารถค้นหาได้</p>';
    }
}

/**
 * Setup live search with debounce
 */
function setupLiveSearch() {
    const searchInput = document.getElementById('searchInput');

    const debouncedSearch = utils.debounce((query) => {
        if (query.trim().length >= 2) {
            // Update URL without reload
            const newUrl = `search.html?q=${encodeURIComponent(query)}`;
            window.history.replaceState({}, '', newUrl);

            performSearch(query);
        } else if (query.trim().length === 0) {
            // Reset to default state
            window.history.replaceState({}, '', 'search.html');
            document.getElementById('resultsSection').classList.add('hidden');
            document.getElementById('categorySection').classList.add('hidden');
            document.getElementById('noResults').classList.add('hidden');
            document.getElementById('popularSection').classList.remove('hidden');

            // Show all categories again
            const allCategoriesSection = document.getElementById('allCategoriesSection');
            if (allCategoriesSection) {
                allCategoriesSection.classList.remove('hidden');
            }
        }
    }, 500);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    // Focus search input
    searchInput.focus();
}

/**
 * Handle form submit
 */
function handleSearch(event) {
    event.preventDefault();
    const query = document.getElementById('searchInput').value;
    if (query.trim()) {
        performSearch(query);
    }
    return false;
}

/**
 * Search by keyword (from popular tags)
 */
function searchKeyword(keyword) {
    document.getElementById('searchInput').value = keyword;
    window.history.replaceState({}, '', `search.html?q=${encodeURIComponent(keyword)}`);
    performSearch(keyword);
}
