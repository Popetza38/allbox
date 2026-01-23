/**
 * DramaBox - API Module
 * Handles all API calls with caching and CORS proxy
 */

class DramaBoxAPI {
    constructor() {
        this.baseUrl = 'https://api.megawe.net/api/dramabox';
        this.corsProxy = 'https://corsproxy.io/?';
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache
    }

    /**
     * Get current language for API requests
     */
    getLanguage() {
        return window.i18n?.getLanguage() || localStorage.getItem('dramabox_lang') || 'th';
    }

    /**
     * Get API URL with CORS proxy and language parameter
     */
    getProxyUrl(endpoint) {
        // Add language parameter
        const lang = this.getLanguage();
        const separator = endpoint.includes('?') ? '&' : '?';
        const url = `${this.baseUrl}${endpoint}${separator}lang=${lang}`;
        return this.corsProxy + encodeURIComponent(url);
    }

    /**
     * Fetch with caching
     */
    async fetchWithCache(endpoint, options = {}) {
        const cacheKey = endpoint;
        const now = Date.now();

        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (now - cached.timestamp < this.cacheTTL) {
                return cached.data;
            }
        }

        try {
            const url = this.getProxyUrl(endpoint);
            const response = await fetch(url, {
                method: 'GET',
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Store in cache
            this.cache.set(cacheKey, {
                data,
                timestamp: now
            });

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * Clear all cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get trending dramas
     */
    async getTrending(page = 1) {
        const response = await this.fetchWithCache(`/trending?page=${page}`);
        return this.normalizeList(response);
    }

    /**
     * Get latest dramas
     */
    async getLatest(page = 1) {
        const response = await this.fetchWithCache(`/latest?page=${page}`);
        return this.normalizeList(response);
    }

    /**
     * Get for you recommendations
     */
    async getForYou(page = 1) {
        const response = await this.fetchWithCache(`/foryou?page=${page}`);
        return this.normalizeList(response);
    }

    /**
     * Get hot dramas
     */
    async getHot(page = 1) {
        const response = await this.fetchWithCache(`/hot?page=${page}`);
        return this.normalizeList(response);
    }

    /**
     * Get completed dramas
     */
    async getCompleted(page = 1) {
        const response = await this.fetchWithCache(`/completed?page=${page}`);
        return this.normalizeList(response);
    }

    /**
     * Get romance category
     */
    async getRomance(page = 1) {
        const response = await this.fetchWithCache(`/category/romance?page=${page}`);
        return this.normalizeList(response);
    }

    /**
     * Get action category
     */
    async getAction(page = 1) {
        const response = await this.fetchWithCache(`/category/action?page=${page}`);
        return this.normalizeList(response);
    }

    /**
     * Get comedy category
     */
    async getComedy(page = 1) {
        const response = await this.fetchWithCache(`/category/comedy?page=${page}`);
        return this.normalizeList(response);
    }

    /**
     * Get multiple pages for more content
     */
    async getMultiplePages(fetchFn, pages = 3) {
        const results = await Promise.all(
            Array.from({ length: pages }, (_, i) => fetchFn(i + 1).catch(() => []))
        );
        // Flatten and dedupe by bookId
        const all = results.flat();
        const seen = new Set();
        return all.filter(item => {
            if (seen.has(item.bookId)) return false;
            seen.add(item.bookId);
            return true;
        });
    }

    /**
     * Search dramas
     */
    async search(query) {
        if (!query || query.trim() === '') return [];
        const response = await this.fetchWithCache(`/search?query=${encodeURIComponent(query)}`);
        return this.normalizeList(response);
    }

    /**
     * Get drama detail
     */
    async getDetail(bookId) {
        const response = await this.fetchWithCache(`/detail?bookId=${bookId}`);
        const data = response.data || response;
        return this.normalizeDrama(data);
    }

    /**
     * Get all episodes for a drama
     */
    async getEpisodes(bookId) {
        const response = await this.fetchWithCache(`/allepisode?bookId=${bookId}`);
        const episodes = Array.isArray(response) ? response : (response.data || []);
        return episodes.map((ep, index) => this.normalizeEpisode(ep, index));
    }

    /**
     * Get video URL from episode data - prefers highest quality
     */
    getVideoUrl(episode) {
        // Direct video URL
        let url = episode.videoUrl || episode.video_url || episode.url;

        // Check cdnList structure - prefer highest quality
        if (!url && episode.cdnList && episode.cdnList.length > 0) {
            const cdn = episode.cdnList.find(c => c.isDefault === 1) || episode.cdnList[0];
            if (cdn.videoPathList && cdn.videoPathList.length > 0) {
                // Sort by quality descending (highest first)
                const sortedVideos = [...cdn.videoPathList].sort((a, b) => (b.quality || 0) - (a.quality || 0));
                // Try to get highest quality: 1080 > 720 > 480 > default
                const video1080 = sortedVideos.find(v => v.quality === 1080);
                const video720 = sortedVideos.find(v => v.quality === 720);
                const video480 = sortedVideos.find(v => v.quality === 480);
                const videoDefault = sortedVideos.find(v => v.isDefault === 1);
                const videoAny = sortedVideos[0]; // Highest available
                url = (video1080 || video720 || video480 || videoDefault || videoAny)?.videoPath;
            }
        }

        return url || null;
    }

    /**
     * Normalize list response to array
     */
    normalizeList(response) {
        if (Array.isArray(response)) return response.map(item => this.normalizeDrama(item));
        if (response.data?.list) return response.data.list.map(item => this.normalizeDrama(item));
        if (response.data && Array.isArray(response.data)) return response.data.map(item => this.normalizeDrama(item));
        return [];
    }

    /**
     * Normalize drama object
     */
    normalizeDrama(item) {
        if (!item) return null;
        return {
            bookId: item.bookId || item.id,
            bookName: item.bookName || item.name || item.title || '',
            coverUrl: item.coverWap || item.cover || item.coverUrl || '',
            description: item.description || item.synopsis || item.intro || '',
            chapterCount: item.chapterCount || item.episodeCount || 0,
            playCount: item.playCount || item.views || 0,
            tags: item.tags || [],
            genre: item.genre || item.category || '',
            year: item.year || '',
            rating: item.rating || item.score || 0,
            isNew: item.isNew || false,
            isHot: item.isHot || item.hot || false,
            isVip: item.isVip || item.vip || false,
            raw: item // Keep original data
        };
    }

    /**
     * Normalize episode object
     */
    normalizeEpisode(episode, index) {
        return {
            index: index,
            chapterName: episode.chapterName || episode.name || `ตอนที่ ${index + 1}`,
            videoUrl: this.getVideoUrl(episode),
            thumbnail: episode.thumbnail || episode.coverUrl || '',
            duration: episode.duration || 0,
            raw: episode
        };
    }
}

// Create singleton instance
const api = new DramaBoxAPI();

// Export for use in other modules
window.api = api;
