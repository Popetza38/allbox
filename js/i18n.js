/**
 * DramaBox - Internationalization (i18n) Module
 * Supports Thai (th) and English (en)
 */

const translations = {
    th: {
        // Navigation
        home: 'หน้าหลัก',
        search: 'ค้นหา',
        history: 'ประวัติ',
        profile: 'โปรไฟล์',

        // Search
        searchPlaceholder: 'ค้นหาซีรี่ย์...',
        searchButton: 'ค้นหา',
        searchResults: 'ผลการค้นหา',
        noResults: 'ไม่พบผลลัพธ์',

        // Home
        trending: '🔥 กำลังฮิต',
        latest: '✨ ใหม่ล่าสุด',
        forYou: '💝 แนะนำสำหรับคุณ',
        topRated: '⭐ ยอดนิยม',
        top10: '🏆 Top 10 ประจำสัปดาห์',
        continueWatching: '▶️ ดูต่อ',

        // Drama Details
        episodes: 'ตอน',
        episode: 'ตอนที่',
        description: 'เรื่องย่อ',
        cast: 'นักแสดง',
        director: 'ผู้กำกับ',
        genre: 'ประเภท',
        year: 'ปี',
        rating: 'เรท',

        // Player
        play: 'ดูเลย',
        watchNow: 'ดูตอนนี้',
        moreInfo: 'ข้อมูลเพิ่มเติม',
        autoPlayNext: 'เล่นต่ออัตโนมัติ',
        subtitleOff: 'ปิดซับไตเติล',
        nextEpisode: 'ตอนถัดไป',
        prevEpisode: 'ตอนก่อนหน้า',
        allEpisodesWatched: '🎉 ดูจบทุกตอนแล้ว!',
        playingNext: 'กำลังเล่นตอนถัดไป...',

        // History
        watchHistory: 'ประวัติการดู',
        clearHistory: 'ล้างประวัติ',
        clearHistoryConfirm: 'ต้องการล้างประวัติการดูทั้งหมดหรือไม่?',
        noHistory: 'ยังไม่มีประวัติการดู',
        noHistoryDesc: 'เริ่มดูซีรี่ย์เพื่อบันทึกประวัติ',
        continueWatch: 'ดูต่อ',
        watchedPercent: 'ดูไปแล้ว',

        // Badges
        new: 'ใหม่',
        hot: 'ฮิต',
        vip: 'VIP',
        dubbed: 'พากย์ไทย',

        // Loading & Errors
        loading: 'กำลังโหลด...',
        loadingEpisodes: 'กำลังโหลดตอน...',
        error: 'เกิดข้อผิดพลาด',
        tryAgain: 'ลองอีกครั้ง',
        notFound: 'ไม่พบข้อมูล',
        videoNotAvailable: 'วิดีโอไม่พร้อมใช้งาน',

        // Actions
        addToList: 'เพิ่มในรายการ',
        removeFromList: 'ลบออกจากรายการ',
        share: 'แชร์',
        download: 'ดาวน์โหลด',

        // Alerts
        confirmClearHistory: 'ยืนยันการล้างประวัติ',
        confirmClearHistoryText: 'ประวัติการดูทั้งหมดจะถูกลบ ไม่สามารถกู้คืนได้',
        cancel: 'ยกเลิก',
        confirm: 'ยืนยัน',
        success: 'สำเร็จ',
        historyCleared: 'ล้างประวัติเรียบร้อยแล้ว',

        // Time
        justNow: 'เมื่อสักครู่',
        minutesAgo: 'นาทีที่แล้ว',
        hoursAgo: 'ชั่วโมงที่แล้ว',
        daysAgo: 'วันที่แล้ว',

        // Footer
        seeAll: 'ดูทั้งหมด',
        back: 'กลับ',
        close: 'ปิด'
    },

    en: {
        // Navigation
        home: 'Home',
        search: 'Search',
        history: 'History',
        profile: 'Profile',

        // Search
        searchPlaceholder: 'Search series...',
        searchButton: 'Search',
        searchResults: 'Search Results',
        noResults: 'No results found',

        // Home
        trending: '🔥 Trending Now',
        latest: '✨ Latest',
        forYou: '💝 For You',
        topRated: '⭐ Top Rated',
        top10: '🏆 Top 10 This Week',
        continueWatching: '▶️ Continue Watching',

        // Drama Details
        episodes: 'Episodes',
        episode: 'Episode',
        description: 'Synopsis',
        cast: 'Cast',
        director: 'Director',
        genre: 'Genre',
        year: 'Year',
        rating: 'Rating',

        // Player
        play: 'Play',
        watchNow: 'Watch Now',
        moreInfo: 'More Info',
        autoPlayNext: 'Auto-play Next',
        subtitleOff: 'Subtitle Off',
        nextEpisode: 'Next Episode',
        prevEpisode: 'Previous Episode',
        allEpisodesWatched: '🎉 All episodes watched!',
        playingNext: 'Playing next episode...',

        // History
        watchHistory: 'Watch History',
        clearHistory: 'Clear History',
        clearHistoryConfirm: 'Clear all watch history?',
        noHistory: 'No watch history',
        noHistoryDesc: 'Start watching to save your history',
        continueWatch: 'Continue',
        watchedPercent: 'Watched',

        // Badges
        new: 'NEW',
        hot: 'HOT',
        vip: 'VIP',
        dubbed: 'DUBBED',

        // Loading & Errors
        loading: 'Loading...',
        loadingEpisodes: 'Loading episodes...',
        error: 'Error occurred',
        tryAgain: 'Try Again',
        notFound: 'Not found',
        videoNotAvailable: 'Video not available',

        // Actions
        addToList: 'Add to List',
        removeFromList: 'Remove from List',
        share: 'Share',
        download: 'Download',

        // Alerts
        confirmClearHistory: 'Confirm Clear History',
        confirmClearHistoryText: 'All watch history will be deleted. This cannot be undone.',
        cancel: 'Cancel',
        confirm: 'Confirm',
        success: 'Success',
        historyCleared: 'History cleared successfully',

        // Time
        justNow: 'Just now',
        minutesAgo: 'minutes ago',
        hoursAgo: 'hours ago',
        daysAgo: 'days ago',

        // Footer
        seeAll: 'See All',
        back: 'Back',
        close: 'Close'
    }
};

/**
 * i18n Class for handling translations
 */
class I18n {
    constructor() {
        this.currentLang = this.getSavedLanguage();
        this.listeners = [];
    }

    /**
     * Get saved language from localStorage or default to 'th'
     */
    getSavedLanguage() {
        return localStorage.getItem('dramabox_lang') || 'th';
    }

    /**
     * Set language and save to localStorage
     */
    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('dramabox_lang', lang);
            document.documentElement.lang = lang;
            this.notifyListeners();
            return true;
        }
        return false;
    }

    /**
     * Get current language
     */
    getLanguage() {
        return this.currentLang;
    }

    /**
     * Get translation by key
     */
    t(key) {
        const langData = translations[this.currentLang] || translations.th;
        return langData[key] || key;
    }

    /**
     * Get all translations for current language
     */
    getAll() {
        return translations[this.currentLang] || translations.th;
    }

    /**
     * Add listener for language changes
     */
    onLanguageChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove listener
     */
    offLanguageChange(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    /**
     * Notify all listeners of language change
     */
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentLang));
    }

    /**
     * Format relative time
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) {
            return this.t('justNow');
        } else if (minutes < 60) {
            return `${minutes} ${this.t('minutesAgo')}`;
        } else if (hours < 24) {
            return `${hours} ${this.t('hoursAgo')}`;
        } else {
            return `${days} ${this.t('daysAgo')}`;
        }
    }
}

// Create singleton instance
const i18n = new I18n();

// Export for use in other modules
window.i18n = i18n;
