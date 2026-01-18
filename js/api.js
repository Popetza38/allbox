// ========================================
// API Module with Caching
// ========================================

const API = {
    // Cache settings
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

    // Get cached data
    getCache(key) {
        try {
            const cached = sessionStorage.getItem(`api_cache_${key}`);
            if (!cached) return null;

            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > this.CACHE_DURATION) {
                sessionStorage.removeItem(`api_cache_${key}`);
                return null;
            }
            return data;
        } catch {
            return null;
        }
    },

    // Set cache data
    setCache(key, data) {
        try {
            sessionStorage.setItem(`api_cache_${key}`, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch {
            // Storage full, clear old cache
            this.clearOldCache();
        }
    },

    // Clear old cache entries
    clearOldCache() {
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
            if (key.startsWith('api_cache_')) {
                sessionStorage.removeItem(key);
            }
        });
    },

    // Base fetch helper with caching
    async fetch(endpoint, options = {}, useCache = true) {
        const cacheKey = endpoint;

        // Check cache first (only for GET requests without body)
        if (useCache && !options.body) {
            const cached = this.getCache(cacheKey);
            if (cached) {
                console.log('📦 Cache hit:', endpoint);
                return cached;
            }
        }

        try {
            const url = `${CONFIG.API_BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Cache successful responses
            if (useCache && !options.body) {
                this.setCache(cacheKey, data);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Get home page dramas
    async getHome(page = 1) {
        const data = await this.fetch(`/api/home?page=${page}`);
        return data;
    },

    // Get recommendations
    async getRecommend() {
        const data = await this.fetch('/api/recommend');
        return data;
    },

    // Get VIP/Theater dramas
    async getVIP() {
        const data = await this.fetch('/api/vip');
        return data;
    },

    // Get all categories
    async getCategories() {
        const data = await this.fetch('/api/categories');
        return data;
    },

    // Get dramas by category
    async getByCategory(categoryId, page = 1) {
        const data = await this.fetch(`/api/category/${categoryId}?page=${page}`);
        return data;
    },

    // Search dramas
    async search(query) {
        const data = await this.fetch(`/api/search?keyword=${encodeURIComponent(query)}`);
        return data;
    },

    // Get drama detail
    async getDetail(bookId) {
        const data = await this.fetch(`/api/detail/${bookId}/v2`);
        return data;
    },

    // Get chapters/episodes
    async getChapters(bookId) {
        const data = await this.fetch(`/api/chapters/${bookId}`);
        return data;
    },

    // Get stream URL
    async getStream(bookId, chapterId) {
        const data = await this.fetch(`/api/stream?bookId=${bookId}&chapterId=${chapterId}`);
        return data;
    },

    // Download all chapters info
    async downloadAll(bookId) {
        const data = await this.fetch(`/download/${bookId}`);
        return data;
    }
};

// Make API globally available
window.API = API;
