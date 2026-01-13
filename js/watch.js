/**
 * DramaBox - Video Player Page Logic
 */

// Global state
let bookId = null;
let episodeIndex = 0;
let episodes = [];
let dramaData = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Get parameters from URL
    bookId = utils.getUrlParam('id');
    episodeIndex = parseInt(utils.getUrlParam('ep')) || 0;

    if (!bookId) {
        showError('Drama tidak ditemukan');
        return;
    }

    // Set back button URL
    document.getElementById('backBtn').href = `drama.html?id=${bookId}`;

    // Load drama info and episodes
    await loadData();

    // Setup UI controls
    setupControls();

    // Initialize Lucide Icons
    if (window.lucide) lucide.createIcons();
}

/**
 * Load drama data and episodes
 */
async function loadData() {
    try {
        // Show SweetAlert loading with steps
        const steps = ['กำลังโหลดข้อมูลละคร', 'กำลังโหลดรายการตอน', 'กำลังเตรียมวิดีโอ'];
        utils.showSwalProgress('🎬 กำลังเตรียมวิดีโอ', steps, 0);

        // Load drama details first for title
        dramaData = await dramaAPI.getDetail(bookId);

        if (dramaData) {
            const dramaTitle = dramaData.bookName || dramaData.name || 'Drama';
            document.getElementById('dramaTitle').textContent = dramaTitle;
            document.title = `${dramaTitle} - ตอนที่ ${episodeIndex + 1} | DramaBox`;
        }

        // Update progress
        utils.showSwalProgress('🎬 กำลังเตรียมวิดีโอ', steps, 1);

        // Load all episodes
        episodes = await dramaAPI.getAllEpisodes(bookId);

        if (!episodes || episodes.length === 0) {
            utils.hideSwalLoading();
            showError('ยังไม่มีตอนสำหรับละครนี้ ตอนอาจกำลังอยู่ในระหว่างการโหลด');
            return;
        }

        // Update episode count
        document.getElementById('episodeCurrent').textContent = `จาก ${episodes.length} ตอน`;

        // Update progress
        utils.showSwalProgress('🎬 กำลังเตรียมวิดีโอ', steps, 2);

        // Load current episode
        loadEpisode(episodeIndex);

        // Hide SweetAlert loading
        utils.hideSwalLoading();

    } catch (error) {
        console.error('Error loading data:', error);
        utils.hideSwalLoading();
        showError('ไม่สามารถโหลดข้อมูลวิดีโอได้');
    }
}

/**
 * Load specific episode
 */
function loadEpisode(index) {
    // Validate index
    if (index < 0 || index >= episodes.length) {
        showError('ไม่พบตอนนี้');
        return;
    }

    episodeIndex = index;
    const episode = episodes[index];

    // Update UI
    document.getElementById('episodeTitle').textContent = `ตอนที่ ${index + 1}`;
    document.getElementById('episodeIndicator').textContent = `ตอนที่ ${index + 1}`;

    // Update page title with drama name and episode number
    const dramaTitle = dramaData?.bookName || dramaData?.name || 'Drama';
    document.title = `${dramaTitle} - ตอนที่ ${index + 1} | DramaBox`;

    // Update navigation buttons
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').disabled = index === episodes.length - 1;

    // Update URL without reload
    const newUrl = `watch.html?id=${bookId}&ep=${index}`;
    window.history.replaceState({}, '', newUrl);


    // Get video URL from the complex API response structure
    let videoUrl = null;

    // API returns: episode.cdnList[].videoPathList[].videoPath
    // We need to find the default CDN and default quality video
    if (episode.cdnList && episode.cdnList.length > 0) {
        // Find default CDN or use first one
        const cdn = episode.cdnList.find(c => c.isDefault === 1) || episode.cdnList[0];

        if (cdn.videoPathList && cdn.videoPathList.length > 0) {
            // Find default quality (isDefault: 1) or use 720p or first available
            let videoPath = cdn.videoPathList.find(v => v.isDefault === 1);
            if (!videoPath) {
                videoPath = cdn.videoPathList.find(v => v.quality === 720);
            }
            if (!videoPath) {
                videoPath = cdn.videoPathList[0];
            }

            if (videoPath) {
                videoUrl = videoPath.videoPath;
            }
        }
    }

    // Fallback: check other possible response formats
    if (!videoUrl) {
        if (episode.playUrl) {
            videoUrl = episode.playUrl;
        } else if (episode.url) {
            videoUrl = episode.url;
        } else if (episode.videoUrl) {
            videoUrl = episode.videoUrl;
        } else if (typeof episode === 'string') {
            videoUrl = episode;
        }
    }

    if (!videoUrl) {
        showError('ไม่พบ URL วิดีโอสำหรับตอนนี้');
        return;
    }

    // Load video
    const video = document.getElementById('videoPlayer');
    video.src = videoUrl;

    // Save watch history
    saveCurrentWatchProgress();

    video.onerror = () => {
        showError('ไม่สามารถโหลดวิดีโอได้ รูปแบบอาจไม่รองรับโดยเบราว์เซอร์');
    };

    // Save progress periodically
    video.ontimeupdate = () => {
        // Save every 10 seconds
        if (Math.floor(video.currentTime) % 10 === 0) {
            saveCurrentWatchProgress();
        }
    };

    // Auto play next episode when current ends
    video.onended = () => {
        if (episodeIndex < episodes.length - 1) {
            nextEpisode();
        }
    };
}

/**
 * Save current watch progress to storage
 */
function saveCurrentWatchProgress() {
    if (!dramaData || !episodes) return;

    const video = document.getElementById('videoPlayer');
    storage.saveWatchProgress({
        dramaId: bookId,
        dramaName: dramaData.bookName || dramaData.name || 'Drama',
        cover: dramaData.bookCover || dramaData.cover || '',
        episodeIndex: episodeIndex,
        progress: video ? video.currentTime : 0,
        totalEpisodes: episodes.length
    });
}

/**
 * Go to previous episode
 */
function prevEpisode() {
    if (episodeIndex > 0) {
        utils.showSwalLoading('⏪ กำลังโหลด...', 'ตอนก่อนหน้า');
        loadEpisode(episodeIndex - 1);
        utils.hideSwalLoading();
    }
}

/**
 * Go to next episode
 */
function nextEpisode() {
    if (episodeIndex < episodes.length - 1) {
        utils.showSwalLoading('⏩ กำลังโหลด...', 'ตอนถัดไป');
        loadEpisode(episodeIndex + 1);
        utils.hideSwalLoading();
    }
}

/**
 * Setup UI controls
 */
function setupControls() {
    const video = document.getElementById('videoPlayer');
    const videoWrapper = document.getElementById('videoWrapper');
    const header = document.getElementById('playerHeader');
    const nav = document.getElementById('episodeNav');
    const videoControls = document.getElementById('videoControls');

    // Progress Bar Elements
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');

    // Control Buttons
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const speedBtn = document.getElementById('speedBtn');
    const speedOptions = document.getElementById('speedOptions');
    const muteBtn = document.getElementById('muteBtn');
    const volumeIcon = document.getElementById('volumeIcon');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const forwardBtn = document.getElementById('forwardBtn');

    let hideTimeout;

    // Auto-hide controls
    function showControls() {
        header.classList.remove('hidden');
        nav.style.opacity = '1';
        videoControls.style.opacity = '1';
        videoWrapper.style.cursor = 'default';
        clearTimeout(hideTimeout);

        hideTimeout = setTimeout(() => {
            if (!video.paused) {
                header.classList.add('hidden');
                nav.style.opacity = '0';
                videoControls.style.opacity = '0';
                videoWrapper.style.cursor = 'none';
            }
        }, 3000);
    }

    videoWrapper.addEventListener('mousemove', showControls);
    videoWrapper.addEventListener('touchstart', (e) => {
        if (e.target === video || e.target === videoWrapper) {
            if (videoControls.style.opacity === '1') {
                header.classList.add('hidden');
                nav.style.opacity = '0';
                videoControls.style.opacity = '0';
            } else {
                showControls();
            }
        } else {
            showControls();
        }
    });
    video.addEventListener('play', showControls);

    // Play/Pause
    function togglePlay() {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    function updatePlayIcon() {
        // Lucide REPLACES the <i> tag with <svg>, so we need to recreate the <i> tag
        playPauseBtn.innerHTML = `<i data-lucide="${video.paused ? 'play' : 'pause'}" id="playIcon"></i>`;
        if (window.lucide) lucide.createIcons();
    }

    playPauseBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', (e) => {
        if (e.target === video) togglePlay();
    });

    video.addEventListener('play', updatePlayIcon);
    video.addEventListener('pause', updatePlayIcon);

    // Rewind/Forward
    rewindBtn.addEventListener('click', () => video.currentTime -= 10);
    forwardBtn.addEventListener('click', () => video.currentTime += 10);

    // Time & Progress
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) {
            return `${h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
        }
        return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
    }

    function updateProgress() {
        if (!video.duration) return;
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(video.currentTime);
        durationEl.textContent = formatTime(video.duration);
    }

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);
    video.addEventListener('durationchange', updateProgress);

    // Initial update in case metadata is already there
    if (video.readyState >= 1) {
        updateProgress();
    }

    // Seeking
    function seek(e) {
        if (!video.duration) return;
        const rect = progressContainer.getBoundingClientRect();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        video.currentTime = pos * video.duration;
    }

    let isDragging = false;
    progressContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        seek(e);
    });

    progressContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        seek(e);
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
        if (isDragging) seek(e);
    });

    window.addEventListener('touchmove', (e) => {
        if (isDragging) seek(e);
    }, { passive: true });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Speed Control
    speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speedOptions.classList.toggle('show');
    });

    document.querySelectorAll('.speed-option').forEach(option => {
        option.addEventListener('click', () => {
            const speed = parseFloat(option.getAttribute('data-speed'));
            video.playbackRate = speed;
            speedBtn.textContent = `${speed}x`;

            document.querySelectorAll('.speed-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            speedOptions.classList.remove('show');
        });
    });

    window.addEventListener('click', () => {
        speedOptions.classList.remove('show');
    });

    // Mute/Volume
    // Mute/Volume
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        // Re-create the <i> tag
        muteBtn.innerHTML = `<i data-lucide="${video.muted ? 'volume-x' : 'volume-2'}" id="volumeIcon"></i>`;
        if (window.lucide) lucide.createIcons();
    });

    // Fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (videoWrapper.requestFullscreen) {
                videoWrapper.requestFullscreen();
            } else if (videoWrapper.webkitRequestFullscreen) {
                videoWrapper.webkitRequestFullscreen();
            } else if (videoWrapper.msRequestFullscreen) {
                videoWrapper.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    fullscreenBtn.addEventListener('click', toggleFullscreen);
    video.addEventListener('dblclick', toggleFullscreen);

    document.addEventListener('fullscreenchange', () => {
        // Re-create the <i> tag
        fullscreenBtn.innerHTML = `<i data-lucide="${document.fullscreenElement ? 'minimize' : 'maximize'}" id="fullscreenIcon"></i>`;
        if (window.lucide) lucide.createIcons();
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                video.currentTime -= 10;
                break;
            case 'ArrowRight':
                video.currentTime += 10;
                break;
            case 'ArrowUp':
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.1);
                break;
            case 'f':
                toggleFullscreen();
                break;
            case 'n':
                nextEpisode();
                break;
            case 'p':
                prevEpisode();
                break;
        }
    });

    // Show controls initially
    showControls();
}

/**
 * Download current video
 */
async function downloadVideo() {
    const video = document.getElementById('videoPlayer');
    const videoUrl = video.src;

    if (!videoUrl) {
        Swal.fire({
            icon: 'error',
            title: 'ไม่พบวิดีโอ',
            text: 'ไม่พบ URL ของวิดีโอที่จะดาวน์โหลด',
            confirmButtonColor: '#E50914'
        });
        return;
    }

    // Get drama title for filename
    const dramaTitle = dramaData?.bookName || dramaData?.name || 'Drama';
    const filename = `${dramaTitle}_EP${episodeIndex + 1}.mp4`;

    // Show loading with progress
    Swal.fire({
        title: 'กำลังดาวน์โหลด...',
        html: `
            <p style="margin-bottom: 1rem;">${dramaTitle} - ตอนที่ ${episodeIndex + 1}</p>
            <div style="width: 100%; background: #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div id="downloadProgress" style="width: 0%; height: 20px; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.3s;"></div>
            </div>
            <p id="downloadStatus" style="margin-top: 0.5rem; font-size: 0.875rem; color: #666;">กำลังเริ่มต้น...</p>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(videoUrl);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10);
        let loaded = 0;

        const reader = response.body.getReader();
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            chunks.push(value);
            loaded += value.length;

            // Update progress
            if (total) {
                const percent = Math.round((loaded / total) * 100);
                const progressEl = document.getElementById('downloadProgress');
                const statusEl = document.getElementById('downloadStatus');
                if (progressEl) progressEl.style.width = `${percent}%`;
                if (statusEl) {
                    const loadedMB = (loaded / 1024 / 1024).toFixed(1);
                    const totalMB = (total / 1024 / 1024).toFixed(1);
                    statusEl.textContent = `${loadedMB} MB / ${totalMB} MB (${percent}%)`;
                }
            }
        }

        // Create blob and download
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        URL.revokeObjectURL(url);

        Swal.fire({
            icon: 'success',
            title: 'ดาวน์โหลดสำเร็จ!',
            text: `บันทึก: ${filename}`,
            confirmButtonColor: '#10b981',
            timer: 3000
        });

    } catch (error) {
        console.error('Download error:', error);

        // Fallback: open in new tab
        Swal.fire({
            icon: 'warning',
            title: 'ไม่สามารถดาวน์โหลดโดยตรงได้',
            html: `
                <p style="margin-bottom: 1rem;">เนื่องจากข้อจำกัดของ server</p>
                <p style="color: #666; font-size: 0.9rem;">กดปุ่มด้านล่างเพื่อเปิดวิดีโอในแท็บใหม่<br>แล้วคลิกขวา → "Save video as..."</p>
            `,
            showCancelButton: true,
            confirmButtonText: '🔗 เปิดวิดีโอ',
            cancelButtonText: '📋 คัดลอกลิงก์',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6366f1'
        }).then((result) => {
            if (result.isConfirmed) {
                window.open(videoUrl, '_blank');
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                navigator.clipboard.writeText(videoUrl).then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'คัดลอกลิงก์แล้ว!',
                        timer: 2000,
                        showConfirmButton: false
                    });
                });
            }
        });
    }
}

/**
 * Show error overlay
 */
function showError(message) {
    utils.hideSwalLoading();
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorOverlay').classList.add('show');
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const video = document.getElementById('videoPlayer');

        switch (e.key.toLowerCase()) {
            case ' ':
            case 'k':
                e.preventDefault();
                if (video.paused) video.play();
                else video.pause();
                break;
            case 'arrowleft':
                e.preventDefault();
                video.currentTime = Math.max(0, video.currentTime - 10);
                break;
            case 'arrowright':
                e.preventDefault();
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
                break;
            case 'arrowup':
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.1);
                break;
            case 'arrowdown':
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.1);
                break;
            case 'f':
                e.preventDefault();
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.getElementById('videoWrapper').requestFullscreen();
                }
                break;
            case 'm':
                e.preventDefault();
                video.muted = !video.muted;
                break;
            case 'n':
                e.preventDefault();
                nextEpisode();
                break;
            case 'p':
                e.preventDefault();
                prevEpisode();
                break;
            case '?':
            case '/':
                e.preventDefault();
                showShortcutsGuide();
                break;
        }
    });
}

/**
 * Show keyboard shortcuts guide modal
 */
function showShortcutsGuide() {
    Swal.fire({
        title: '⌨️ ปุ่มลัดคีย์บอร์ด',
        html: `
            <div class="shortcuts-grid">
                <div class="shortcut-item">
                    <span class="shortcut-key">Space</span>
                    <span class="shortcut-desc">เล่น/หยุด</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">K</span>
                    <span class="shortcut-desc">เล่น/หยุด</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">←</span>
                    <span class="shortcut-desc">ถอยหลัง 10 วินาที</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">→</span>
                    <span class="shortcut-desc">เดินหน้า 10 วินาที</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">↑</span>
                    <span class="shortcut-desc">เพิ่มเสียง</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">↓</span>
                    <span class="shortcut-desc">ลดเสียง</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">F</span>
                    <span class="shortcut-desc">เต็มจอ</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">M</span>
                    <span class="shortcut-desc">ปิด/เปิดเสียง</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">N</span>
                    <span class="shortcut-desc">ตอนถัดไป</span>
                </div>
                <div class="shortcut-item">
                    <span class="shortcut-key">P</span>
                    <span class="shortcut-desc">ตอนก่อนหน้า</span>
                </div>
            </div>
        `,
        confirmButtonText: '<i data-lucide="check"></i> เข้าใจแล้ว',
        confirmButtonColor: '#E50914',
        background: 'linear-gradient(145deg, #1e1e1e, #2d2d2d)',
        color: '#fff',
        width: '500px',
        didOpen: () => {
            if (window.lucide) lucide.createIcons();
        }
    });
}

// Setup keyboard shortcuts on load
document.addEventListener('DOMContentLoaded', setupKeyboardShortcuts);

/**
 * Toggle quality menu visibility
 */
function toggleQualityMenu() {
    const qualityOptions = document.getElementById('qualityOptions');
    qualityOptions.classList.toggle('show');
}

/**
 * Set video quality (adjust playback quality effect)
 * Note: Actual quality depends on source. This simulates quality settings.
 */
function setVideoQuality(quality) {
    const video = document.getElementById('videoPlayer');
    const qualityLabel = document.getElementById('qualityLabel');
    const qualityOptions = document.getElementById('qualityOptions');

    // Update UI
    document.querySelectorAll('.quality-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.dataset.quality === quality) {
            opt.classList.add('active');
        }
    });

    // Update label
    const labels = { '360': 'SD', '480': 'SD', '720': 'HD', '1080': 'FHD' };
    qualityLabel.textContent = labels[quality] || 'HD';

    // Hide menu
    qualityOptions.classList.remove('show');

    // Save preference
    storage.setVideoQuality(quality);

    // Show notification
    Swal.fire({
        icon: 'success',
        title: `⚙️ ความละเอียด ${quality}p`,
        text: 'บันทึกการตั้งค่าแล้ว',
        timer: 1500,
        showConfirmButton: false,
        background: 'linear-gradient(145deg, #1e1e1e, #2d2d2d)',
        color: '#fff'
    });
}

/**
 * Initialize quality setting on load
 */
function initQualitySetting() {
    const savedQuality = storage.getVideoQuality();
    if (savedQuality) {
        document.querySelectorAll('.quality-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.quality === savedQuality) {
                opt.classList.add('active');
            }
        });
        const labels = { '360': 'SD', '480': 'SD', '720': 'HD', '1080': 'FHD' };
        const qualityLabel = document.getElementById('qualityLabel');
        if (qualityLabel) {
            qualityLabel.textContent = labels[savedQuality] || 'HD';
        }
    }
}

// Close quality menu when clicking outside
document.addEventListener('click', (e) => {
    const qualitySelector = document.querySelector('.quality-selector');
    const qualityOptions = document.getElementById('qualityOptions');
    if (qualitySelector && !qualitySelector.contains(e.target) && qualityOptions) {
        qualityOptions.classList.remove('show');
    }
});

// Initialize quality setting when DOM ready
document.addEventListener('DOMContentLoaded', initQualitySetting);
