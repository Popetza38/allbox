/**
 * DramaBox - Watch History Module
 * Manages user's watch history with localStorage
 */

class WatchHistory {
    constructor() {
        this.storageKey = 'dramabox_history';
        this.maxItems = 50; // Maximum items to keep in history
    }

    /**
     * Get all history items
     * @returns {Array} Array of history items sorted by last watched (newest first)
     */
    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            const items = data ? JSON.parse(data) : [];
            // Sort by lastWatched descending
            return items.sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched));
        } catch (error) {
            console.error('Error reading history:', error);
            return [];
        }
    }

    /**
     * Get single history item by bookId
     * @param {string} bookId - Drama book ID
     * @returns {Object|null} History item or null
     */
    get(bookId) {
        const items = this.getAll();
        return items.find(item => item.bookId === bookId) || null;
    }

    /**
     * Add or update history item
     * @param {Object} data - History item data
     */
    save(data) {
        try {
            const items = this.getAll();
            const existingIndex = items.findIndex(item => item.bookId === data.bookId);

            const historyItem = {
                bookId: data.bookId,
                bookName: data.bookName || data.name || 'Unknown',
                coverUrl: data.coverUrl || data.cover || data.coverWap || '',
                episodeIndex: data.episodeIndex || 0,
                episodeName: data.episodeName || `ตอนที่ ${(data.episodeIndex || 0) + 1}`,
                totalEpisodes: data.totalEpisodes || 0,
                progress: data.progress || 0, // Video progress in seconds
                duration: data.duration || 0, // Video duration in seconds
                lastWatched: new Date().toISOString()
            };

            if (existingIndex !== -1) {
                // Update existing item
                items[existingIndex] = historyItem;
            } else {
                // Add new item at the beginning
                items.unshift(historyItem);

                // Remove oldest items if exceeds maxItems
                if (items.length > this.maxItems) {
                    items.length = this.maxItems;
                }
            }

            localStorage.setItem(this.storageKey, JSON.stringify(items));
            this.notifyChange();

            return historyItem;
        } catch (error) {
            console.error('Error saving history:', error);
            return null;
        }
    }

    /**
     * Update video progress for a history item
     * @param {string} bookId - Drama book ID
     * @param {number} progress - Current video time in seconds
     * @param {number} duration - Total video duration in seconds
     */
    updateProgress(bookId, progress, duration) {
        try {
            const items = this.getAll();
            const item = items.find(i => i.bookId === bookId);

            if (item) {
                item.progress = progress;
                item.duration = duration;
                item.lastWatched = new Date().toISOString();
                localStorage.setItem(this.storageKey, JSON.stringify(items));
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    /**
     * Remove single history item
     * @param {string} bookId - Drama book ID
     */
    remove(bookId) {
        try {
            const items = this.getAll();
            const filtered = items.filter(item => item.bookId !== bookId);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            this.notifyChange();
            return true;
        } catch (error) {
            console.error('Error removing history item:', error);
            return false;
        }
    }

    /**
     * Clear all history
     */
    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            this.notifyChange();
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }

    /**
     * Get continue watching items (items with progress > 0 and not completed)
     * @param {number} limit - Maximum number of items to return
     * @returns {Array} Array of continue watching items
     */
    getContinueWatching(limit = 10) {
        const items = this.getAll();
        return items
            .filter(item => {
                // Has progress and not completed (less than 95%)
                const progressPercent = item.duration > 0 ? (item.progress / item.duration) * 100 : 0;
                return item.progress > 0 && progressPercent < 95;
            })
            .slice(0, limit);
    }

    /**
     * Get percentage watched
     * @param {Object} item - History item
     * @returns {number} Percentage watched (0-100)
     */
    getProgressPercent(item) {
        if (!item || !item.duration || item.duration === 0) return 0;
        return Math.min(100, Math.round((item.progress / item.duration) * 100));
    }

    /**
     * Format duration to MM:SS or HH:MM:SS
     * @param {number} seconds - Duration in seconds
     * @returns {string} Formatted duration
     */
    formatDuration(seconds) {
        if (!seconds || seconds <= 0) return '0:00';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Notify listeners of history change
     */
    notifyChange() {
        window.dispatchEvent(new CustomEvent('historyChange'));
    }

    /**
     * Listen for history changes
     * @param {Function} callback - Callback function
     */
    onChange(callback) {
        window.addEventListener('historyChange', callback);
    }

    /**
     * Remove history change listener
     * @param {Function} callback - Callback function
     */
    offChange(callback) {
        window.removeEventListener('historyChange', callback);
    }
}

// Create singleton instance
const watchHistory = new WatchHistory();

// Export for use in other modules
window.watchHistory = watchHistory;
