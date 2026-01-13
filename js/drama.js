/**
 * DramaBox - Drama Detail Page Logic
 */

// Global state
let dramaData = null;
let episodesData = [];
let bookId = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Get bookId from URL
    bookId = utils.getUrlParam('id');

    if (!bookId) {
        showError();
        return;
    }

    // Show SweetAlert loading
    utils.showSwalLoading('🎬 กำลังโหลดละคร', 'กำลังดึงข้อมูลละครและรายการตอน...');

    // Load drama detail
    await loadDramaDetail();
}

/**
 * Load drama detail and episodes
 */
async function loadDramaDetail() {
    try {
        // Try to get drama from detail API first
        const result = await dramaAPI.getDetail(bookId);

        // API returns { drama: {...}, chapters: [...] }
        if (result && result.drama) {
            dramaData = result.drama;
            episodesData = result.chapters || [];
        } else if (result && result.chapters) {
            // Detail API only returns chapters, need to fetch drama info separately
            episodesData = result.chapters || [];
            // Try to find drama from home/recommend API
            await findDramaFromHomeAPI();
        } else {
            dramaData = result;
        }

        if (!dramaData || (!dramaData.name && !dramaData.bookName && !dramaData.id && !dramaData.bookId)) {
            // If still no drama data, try to find from home API
            await findDramaFromHomeAPI();
        }

        if (!dramaData) {
            showError();
            return;
        }

        // Update page with drama data
        updatePageContent();

        // Hide SweetAlert loading
        utils.hideSwalLoading();

        // Show content
        document.getElementById('detailContent').classList.remove('hidden');
        document.getElementById('footer').style.display = 'block';

        // Update page title - handle both old (bookName) and new (name) formats
        const title = dramaData.bookName || dramaData.name || 'Drama';
        document.title = `${title} - DramaBox`;

        // Load episodes if not already loaded
        if (!episodesData || episodesData.length === 0) {
            loadEpisodes();
        } else {
            displayEpisodes();
        }

    } catch (error) {
        console.error('Error loading drama detail:', error);
        utils.hideSwalLoading();
        showError();
    }
}

/**
 * Find drama from home or recommend API
 */
async function findDramaFromHomeAPI() {
    try {
        // Try home API first (larger set)
        let dramas = await dramaAPI.getHome(1, 50);
        let found = dramas.find(d => String(d.id) === String(bookId) || String(d.bookId) === String(bookId));

        if (!found) {
            // Try recommend API
            dramas = await dramaAPI.getRecommend();
            found = dramas.find(d => String(d.id) === String(bookId) || String(d.bookId) === String(bookId));
        }

        if (!found) {
            // Try VIP - getVip already returns flattened array
            const vipDramas = await dramaAPI.getVip();
            if (Array.isArray(vipDramas)) {
                found = vipDramas.find(d => String(d.id) === String(bookId) || String(d.bookId) === String(bookId));
            }
        }

        if (found) {
            dramaData = found;
        }
    } catch (error) {
        console.error('Error finding drama from home API:', error);
    }
}

/**
 * Update page content with drama data
 */
function updatePageContent() {
    // Handle both old (coverWap, bookName) and new (cover, name) API formats
    const cover = dramaData.coverWap || dramaData.cover || (window.PLACEHOLDER_IMG || '');
    const name = dramaData.bookName || dramaData.name || 'Drama';
    const episodes = dramaData.chapterCount || 0;
    const tags = dramaData.tags || [];

    // Images - only set if we have a valid cover
    if (cover) {
        document.getElementById('detailBackdrop').src = cover;
        document.getElementById('detailPoster').src = cover;
    }
    document.getElementById('detailPoster').alt = name;

    // Title and meta
    document.getElementById('detailTitle').textContent = name;
    document.getElementById('episodeCount').textContent = episodes;
    document.getElementById('hotCount').textContent = dramaData.playCount || dramaData.rankVo?.hotCode || 'Popular';

    // Synopsis
    document.getElementById('detailSynopsis').textContent = dramaData.introduction || 'ไม่มีเรื่องย่อ';

    // Protagonist
    if (dramaData.protagonist) {
        document.getElementById('detailProtagonist').innerHTML = `<i data-lucide="user" class="icon-sm"></i> ${dramaData.protagonist}`;
    }

    // Re-initialize icons
    if (window.lucide) lucide.createIcons();

    // Tags - handle both string array and object array
    const tagsContainer = document.getElementById('detailTags');
    if (tags && tags.length > 0) {
        tagsContainer.innerHTML = tags
            .map(tag => {
                const tagText = typeof tag === 'string' ? tag : (tag.tagName || tag.name || tag);
                return `<span class="detail-tag">${tagText}</span>`;
            })
            .join('');
    }
}

/**
 * Load all episodes
 */
async function loadEpisodes() {
    // Show loading for episodes
    Swal.fire({
        title: '📺 กำลังโหลดตอน...',
        html: `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                <div class="swal-loading-spinner"></div>
                <p id="episodeLoadingStatus" style="color: #888; font-size: 0.9rem;">กำลังดึงข้อมูลตอน...</p>
            </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: 'linear-gradient(145deg, #1e1e1e, #2d2d2d)',
        color: '#fff',
        didOpen: () => {
            // Add spinner styles if not exist
            if (!document.getElementById('swal-loading-styles')) {
                const style = document.createElement('style');
                style.id = 'swal-loading-styles';
                style.textContent = `
                    .swal-loading-spinner {
                        width: 50px;
                        height: 50px;
                        border: 4px solid rgba(229, 9, 20, 0.2);
                        border-top-color: #E50914;
                        border-radius: 50%;
                        animation: swal-spin 1s linear infinite;
                    }
                    @keyframes swal-spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    });

    try {
        episodesData = await dramaAPI.getAllEpisodes(bookId);

        // Close loading and show success
        Swal.close();

        if (episodesData && episodesData.length > 0) {
            // Show success with episode count
            Swal.fire({
                icon: 'success',
                title: '✅ โหลดตอนสำเร็จ!',
                html: `<p style="font-size: 1.2rem; color: #10b981;"><strong>${episodesData.length}</strong> ตอน</p>`,
                timer: 1500,
                showConfirmButton: false,
                background: 'linear-gradient(145deg, #1e1e1e, #2d2d2d)',
                color: '#fff'
            });
        }

        displayEpisodes();
    } catch (error) {
        console.error('Error loading episodes:', error);
        Swal.fire({
            icon: 'error',
            title: 'ไม่สามารถโหลดตอนได้',
            text: 'กรุณาลองใหม่อีกครั้ง',
            confirmButtonColor: '#E50914',
            background: 'linear-gradient(145deg, #1e1e1e, #2d2d2d)',
            color: '#fff'
        });
        document.getElementById('episodesGrid').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
                <p><i data-lucide="alert-circle" class="icon-sm"></i> ไม่สามารถโหลดตอนได้</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
    }
}

/**
 * Display episodes in grid
 */
function displayEpisodes() {
    const episodesGrid = document.getElementById('episodesGrid');
    const episodesCount = document.getElementById('episodesCount');

    if (episodesData && episodesData.length > 0) {
        episodesCount.textContent = `${episodesData.length} ตอน`;

        episodesGrid.innerHTML = episodesData.map((episode, index) => {
            // Handle both array of objects with index/id and simple arrays
            const epNumber = episode.index || episode.chapterIndex || (index + 1);
            return `
                <div class="episode-card" onclick="watchEpisode(${index})">
                    <div class="episode-number">${epNumber}</div>
                    <div class="episode-info">
                        <h3 class="episode-title">ตอนที่ ${epNumber}</h3>
                        <p class="episode-duration"><i data-lucide="play-circle" class="icon-xs"></i> พร้อมรับชม</p>
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) lucide.createIcons();
    } else {
        episodesCount.textContent = 'ยังไม่มีตอน';
        episodesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
                <p><i data-lucide="loader" class="icon-sm"></i> กำลังโหลดตอนหรือยังไม่มีตอน</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">ลอง refresh หน้าอีกครั้ง</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
    }
}

/**
 * Watch first episode
 */
function watchFirstEpisode() {
    if (episodesData && episodesData.length > 0) {
        watchEpisode(0);
    } else {
        // Try to redirect anyway, watch.js will handle loading
        window.location.href = `watch.html?id=${bookId}&ep=0`;
    }
}

/**
 * Watch specific episode
 */
function watchEpisode(index) {
    window.location.href = `watch.html?id=${bookId}&ep=${index}`;
}

/**
 * Show error state
 */
function showError() {
    utils.hideSwalLoading();
    document.getElementById('detailContent').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    document.getElementById('errorState').style.display = 'flex';
}
