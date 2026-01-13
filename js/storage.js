/**
 * DramaBox - Storage Service Layer
 * Handles all LocalStorage operations for watch history, favorites, settings
 */

const STORAGE_KEYS = {
    WATCH_HISTORY: 'dramabox_watch_history',
    FAVORITES: 'dramabox_favorites',
    SETTINGS: 'dramabox_settings',
    THEME: 'dramabox_theme'
};

const storage = {
    // ============================================
    // Watch History
    // ============================================

    /**
     * Save watch progress for a drama episode
     * @param {object} data - { dramaId, dramaName, cover, episodeIndex, progress, totalEpisodes }
     */
    saveWatchProgress: (data) => {
        const history = storage.getWatchHistory();
        const existingIndex = history.findIndex(h => h.dramaId === data.dramaId);

        const watchData = {
            dramaId: data.dramaId,
            dramaName: data.dramaName || 'Drama',
            cover: data.cover || '',
            episodeIndex: data.episodeIndex,
            progress: data.progress || 0, // video progress in seconds
            totalEpisodes: data.totalEpisodes || 0,
            lastWatched: Date.now()
        };

        if (existingIndex !== -1) {
            history[existingIndex] = watchData;
        } else {
            history.unshift(watchData);
        }

        // Keep only last 50 items
        const trimmedHistory = history.slice(0, 50);
        localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(trimmedHistory));
    },

    /**
     * Get watch history
     * @returns {Array} Watch history sorted by lastWatched
     */
    getWatchHistory: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    /**
     * Get continue watching info for a specific drama
     * @param {string} dramaId 
     * @returns {object|null}
     */
    getContinueWatching: (dramaId) => {
        const history = storage.getWatchHistory();
        return history.find(h => String(h.dramaId) === String(dramaId)) || null;
    },

    /**
     * Clear watch history
     */
    clearWatchHistory: () => {
        localStorage.removeItem(STORAGE_KEYS.WATCH_HISTORY);
    },

    // ============================================
    // Favorites
    // ============================================

    /**
     * Add drama to favorites
     * @param {object} drama - { dramaId, dramaName, cover, totalEpisodes }
     */
    addFavorite: (drama) => {
        const favorites = storage.getFavorites();
        const exists = favorites.some(f => String(f.dramaId) === String(drama.dramaId));

        if (!exists) {
            favorites.unshift({
                dramaId: drama.dramaId,
                dramaName: drama.dramaName || 'Drama',
                cover: drama.cover || '',
                totalEpisodes: drama.totalEpisodes || 0,
                addedAt: Date.now()
            });
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        }
    },

    /**
     * Remove drama from favorites
     * @param {string} dramaId 
     */
    removeFavorite: (dramaId) => {
        const favorites = storage.getFavorites();
        const filtered = favorites.filter(f => String(f.dramaId) !== String(dramaId));
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
    },

    /**
     * Toggle favorite status
     * @param {object} drama
     * @returns {boolean} New favorite status
     */
    toggleFavorite: (drama) => {
        if (storage.isFavorite(drama.dramaId)) {
            storage.removeFavorite(drama.dramaId);
            return false;
        } else {
            storage.addFavorite(drama);
            return true;
        }
    },

    /**
     * Check if drama is in favorites
     * @param {string} dramaId 
     * @returns {boolean}
     */
    isFavorite: (dramaId) => {
        const favorites = storage.getFavorites();
        return favorites.some(f => String(f.dramaId) === String(dramaId));
    },

    /**
     * Get all favorites
     * @returns {Array}
     */
    getFavorites: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    /**
     * Clear all favorites
     */
    clearFavorites: () => {
        localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    },

    // ============================================
    // Settings & Theme
    // ============================================

    /**
     * Get current theme
     * @returns {string} 'dark' or 'light'
     */
    getTheme: () => {
        return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    },

    /**
     * Set theme
     * @param {string} theme - 'dark' or 'light'
     */
    setTheme: (theme) => {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        document.documentElement.setAttribute('data-theme', theme);
    },

    /**
     * Toggle theme
     * @returns {string} New theme
     */
    toggleTheme: () => {
        const current = storage.getTheme();
        const newTheme = current === 'dark' ? 'light' : 'dark';
        storage.setTheme(newTheme);
        return newTheme;
    },

    /**
     * Apply saved theme on page load
     */
    applyTheme: () => {
        const theme = storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
    },

    /**
     * Get settings
     * @returns {object}
     */
    getSettings: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return data ? JSON.parse(data) : {
                videoQuality: '720',
                autoPlay: true,
                autoNext: true
            };
        } catch {
            return { videoQuality: '720', autoPlay: true, autoNext: true };
        }
    },

    /**
     * Save settings
     * @param {object} settings 
     */
    saveSettings: (settings) => {
        const current = storage.getSettings();
        const merged = { ...current, ...settings };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    },

    /**
     * Get video quality preference
     * @returns {string}
     */
    getVideoQuality: () => {
        return storage.getSettings().videoQuality || '720';
    },

    /**
     * Set video quality preference
     * @param {string} quality 
     */
    setVideoQuality: (quality) => {
        storage.saveSettings({ videoQuality: quality });
    }
};

// Export for use in other files
window.storage = storage;

// Apply theme on load
document.addEventListener('DOMContentLoaded', () => {
    storage.applyTheme();
});
