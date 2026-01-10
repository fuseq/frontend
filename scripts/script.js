/**
 * Inmapper Analytics Dashboard
 * Modern, modular JavaScript architecture
 */

import {
    renderFromToEvents,
    renderFromToEventsByStart,
    renderSearchedEvents,
    renderTop5SearchedTerms,
    renderDailyEvents,
    renderHourlyEvents,
    renderOperatingSystemDistribution,
    renderLanguageDistribution,
    renderStoreCategoriesDonutChart,
    summarizeTitlesWithDetails,
    summarizeTopStoresByCategory,
    categorizeEventsByDayAndCategory,
    cleanCampaignData,
    getTotalActionsByFloor,
    findEventFloor,
    renderTopUnitsTable,
    renderTopStoresTable,
    summarizeTopFoodStoresByCategory,
    summarizeTopServicesByCategory,
    renderFoodPlacesTable,
    renderServicesTable,
    renderFloorsTable,
    renderKiosksTable,
    renderStoreCategoriesAreaChart,
    categorizeTitlesWithJson,
    categorizeUnitsWithJson,
    renderCategorizedUnitsList
} from './dataHandlers.js';

// =====================================================
// Configuration
// =====================================================

const CONFIG = {
    API_BASE_URL: 'http://localhost:3001/api',
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 4000,
    ANIMATION_DURATION: 300
};

// =====================================================
// State Management
// =====================================================

const state = {
    globalSiteId: '',
    isLoading: false,
    currentDateRange: null,
    sites: []
};

// =====================================================
// Utility Functions
// =====================================================

const utils = {
    // Show toast notification
    showToast(message, type = 'info', title = '') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.TOAST_DURATION);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
    },

    // Show/hide loading overlay
    setLoading(isLoading) {
        state.isLoading = isLoading;
        const overlay = document.getElementById('loadingOverlay');
        const fetchBtn = document.getElementById('fetchDataBtn');
        
        if (overlay) {
            overlay.classList.toggle('active', isLoading);
        }
        
        if (fetchBtn) {
            fetchBtn.classList.toggle('loading', isLoading);
            fetchBtn.disabled = isLoading;
        }
    },

    // Format number with locale
    formatNumber(num) {
        if (typeof num !== 'number') return num;
        return num.toLocaleString('tr-TR');
    },

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Safe localStorage
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('Storage error:', e);
            }
        },
        remove(key) {
            localStorage.removeItem(key);
        }
    }
};

// =====================================================
// API Functions
// =====================================================

const api = {
    async fetch(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${CONFIG.API_BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    },

    async getSites() {
        return await this.fetch('/sites');
    },

    async getUserStatistics(params) {
        return await this.fetch('/user-statistics', params);
    },

    async getFromToNames(params) {
        return await this.fetch('/events/from-to-names', params);
    },

    async getSearchedEvents(params) {
        return await this.fetch('/events/searched', params);
    },

    async getOsDistribution(params) {
        return await this.fetch('/os-distribution', params);
    },

    async getSummaryCounts(params) {
        return await this.fetch('/events/summary-counts', params);
    },

    async getLanguageDistribution(params) {
        return await this.fetch('/user-language-distribution', params);
    },

    async getDailyCount(params) {
        return await this.fetch('/events/daily-count', params);
    },

    async getHourlyVisits(params) {
        return await this.fetch('/hourly-visits', params);
    },

    async getTouchedEvents(params) {
        return await this.fetch('/events/touched', params);
    },

    async getInitializedEvents(params) {
        return await this.fetch('/events/initialized', params);
    },

    async getCampaigns(params) {
        return await this.fetch('/campaigns', params);
    },

    async getSearchedDaily(params) {
        return await this.fetch('/events/searched-daily', params);
    }
};

// =====================================================
// UI Update Functions
// =====================================================

const ui = {
    // Device type mapping
    deviceMap: {
        desktop: 'Masaüstü',
        mobile: 'Mobil',
        tablet: 'Tablet',
        other: 'Diğer'
    },

    // Update stat cards
    updateStatCards(data) {
        // Total visits
        const totalVisitsCard = document.getElementById('total-visits');
        if (totalVisitsCard) {
            const value = totalVisitsCard.querySelector('.stat-value');
            if (value) value.textContent = utils.formatNumber(data.totalVisits || 0);
        }

        // Bounce rate / Interest
        const bounceCard = document.getElementById('bounce-rate');
        if (bounceCard) {
            const value = bounceCard.querySelector('.stat-value');
            if (value) {
                const rate = parseFloat(data.bounceRate);
                let interest = 'Veri yok';
                if (!isNaN(rate)) {
                    if (rate < 30) interest = 'Mükemmel';
                    else if (rate < 50) interest = 'İyi';
                    else if (rate < 70) interest = 'Ortalama';
                    else interest = 'Düşük';
                }
                value.textContent = interest;
            }
        }

        // Most visited device
        const deviceCard = document.getElementById('most-visited-device');
        if (deviceCard) {
            const value = deviceCard.querySelector('.stat-value');
            if (value) {
                const deviceType = data.mostVisitedDeviceType?.toLowerCase();
                value.textContent = this.deviceMap[deviceType] || data.mostVisitedDeviceType || '-';
            }
        }

        // Average time
        const avgTimeCard = document.getElementById('avg-time');
        if (avgTimeCard) {
            const value = avgTimeCard.querySelector('.stat-value');
            if (value) {
                const seconds = parseInt(data.avgTimeOnPage) || 0;
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                value.textContent = minutes > 0 
                    ? `${minutes}dk ${remainingSeconds}sn` 
                    : `${remainingSeconds} sn`;
            }
        }

        // Store in localStorage for other uses
        utils.storage.set('totalVisits', data.totalVisits);
        utils.storage.set('bounceRate', data.bounceRate);
        utils.storage.set('mostVisitedDeviceType', data.mostVisitedDeviceType);
        utils.storage.set('avgTimeOnPage', data.avgTimeOnPage);
    },

    // Set active quick range button
    setActiveQuickRange(days) {
        document.querySelectorAll('.quick-range-btn').forEach(btn => {
            const btnDays = parseInt(btn.dataset.days);
            btn.classList.toggle('active', btnDays === days);
        });
    },

    // Update selected site name
    updateSelectedSiteName(name) {
        const el = document.getElementById('selectedSiteName');
        if (el) el.textContent = name || 'Site Seç';
    }
};

// =====================================================
// Data Fetching & Processing
// =====================================================

async function fetchAllData(startDate, endDate, siteId = state.globalSiteId) {
    if (!siteId) {
        utils.showToast('Lütfen önce bir site seçin', 'warning', 'Uyarı');
        return;
    }

    const params = { siteId };
    if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
    }

    utils.setLoading(true);

    try {
        // Parallel API calls for better performance
        const [
            userStats,
            fromToData,
            searchedData,
            osData,
            summaryData,
            languageData,
            dailyData,
            hourlyData,
            campaignData
        ] = await Promise.allSettled([
            api.getUserStatistics(params),
            api.getFromToNames(params),
            api.getSearchedEvents(params),
            api.getOsDistribution(params),
            api.getSummaryCounts(params),
            api.getLanguageDistribution(params),
            api.getDailyCount(params),
            api.getHourlyVisits(params),
            api.getCampaigns(params)
        ]);

        // Process user statistics
        if (userStats.status === 'fulfilled') {
            ui.updateStatCards(userStats.value);
        }

        // Process from-to events
        if (fromToData.status === 'fulfilled') {
            renderFromToEvents(fromToData.value, 'from-to-events');
            renderFromToEventsByStart(fromToData.value, 'start-to-end-events');
        }

        // Process searched events
        if (searchedData.status === 'fulfilled') {
            renderSearchedEvents(searchedData.value, 'searched-events');
            renderTop5SearchedTerms(searchedData.value, 'top-searchs');
            
            // Process category data
            await processCategoryData(searchedData.value, params);
        }

        // Process OS distribution
        if (osData.status === 'fulfilled') {
            renderOperatingSystemDistribution(osData.value, 'operating-systems');
        }

        // Process summary counts
        if (summaryData.status === 'fulfilled') {
            const data = summaryData.value;
            utils.storage.set('fromTo', data.fromTo);
            utils.storage.set('searched', data.searched);
            utils.storage.set('touched', data.touched);
            utils.storage.set('initialized', data.initialized);
            utils.storage.set('total', data.total);
        }

        // Process language distribution
        if (languageData.status === 'fulfilled') {
            const sortedData = Object.entries(languageData.value)
                .sort(([, a], [, b]) => b - a);
            const topLanguages = Object.fromEntries(sortedData);
            utils.storage.set('topLanguages', topLanguages);
            renderLanguageDistribution(topLanguages, 'language-distribution');
        }

        // Process daily events
        if (dailyData.status === 'fulfilled' && Array.isArray(dailyData.value) && dailyData.value.length > 0) {
            const data = dailyData.value.sort((a, b) => new Date(a.date) - new Date(b.date));
            processDailyEvents(data);
            renderDailyEvents(data, 'daily-events');
        }

        // Process hourly visits
        if (hourlyData.status === 'fulfilled' && hourlyData.value.success) {
            renderHourlyEvents(hourlyData.value.hourlyVisits, 'hourly-events');
            analyzeHourlyVisits(hourlyData.value.hourlyVisits);
        }

        // Process campaigns (kiosks)
        if (campaignData.status === 'fulfilled') {
            processKioskData(campaignData.value);
        }

        // Fetch additional data
        await Promise.allSettled([
            fetchCombinedUnitData(params),
            fetchFloorData(params),
            fetchDailyCategories(params)
        ]);

        utils.showToast('Veriler başarıyla yüklendi', 'success', 'Başarılı');

    } catch (error) {
        console.error('Data fetch error:', error);
        utils.showToast('Veriler yüklenirken bir hata oluştu', 'error', 'Hata');
    } finally {
        utils.setLoading(false);
    }
}

// Process category data from searched events
async function processCategoryData(searchedData, params) {
    try {
        const titles = searchedData
            .filter(item => item.label.includes('->'))
            .map(item => item.label.split('->')[1].trim());

        const jsonPath = `./assets/${state.globalSiteId}.json`;
        const categoryData = await categorizeTitlesWithJson(titles, jsonPath);

        if (categoryData.length > 0) {
            // Find most used category
            const maxCategory = categoryData.reduce((max, cat) => 
                cat.nb_events > max.nb_events ? cat : max
            , { nb_events: 0 });
            
            if (maxCategory.label) {
                utils.storage.set('mostUsedCategory', maxCategory.label);
            }

            renderStoreCategoriesDonutChart(categoryData, 'donut-container');
        }
    } catch (error) {
        console.error('Category processing error:', error);
    }
}

// Fetch combined unit data (searched + touched + initialized)
async function fetchCombinedUnitData(params) {
    try {
        const [searchedData, touchedData, initializedData] = await Promise.all([
            api.getSearchedEvents(params),
            api.getTouchedEvents(params),
            api.getInitializedEvents(params)
        ]);

        const mergedMap = {};
        
        // Process searched data
        searchedData.forEach(item => {
            const parts = item.label.split('->');
            if (parts.length > 1) {
                const name = parts[1].trim();
                mergedMap[name] = (mergedMap[name] || 0) + (item.nb_events || 0);
            }
        });

        // Add touched data
        for (const [title, count] of Object.entries(touchedData)) {
            mergedMap[title] = (mergedMap[title] || 0) + count;
        }

        // Add initialized data
        for (const [title, count] of Object.entries(initializedData)) {
            mergedMap[title] = (mergedMap[title] || 0) + count;
        }

        const totalEvents = Object.values(mergedMap).reduce((sum, count) => sum + count, 0);
        const jsonPath = `./assets/${state.globalSiteId}.json`;

        // Top units table
        const categoryData = await summarizeTitlesWithDetails(mergedMap, jsonPath, totalEvents);
        renderTopUnitsTable(categoryData, 'top-units-table-container', totalEvents);

        // Services table
        const titlesWithCounts = Object.entries(mergedMap).map(([eventName, nbEvents]) => 
            ({ eventName, nbEvents })
        );
        const servicesData = await summarizeTopServicesByCategory(titlesWithCounts, jsonPath, totalEvents);
        renderServicesTable(servicesData, 'services-container', totalEvents);

        // Store top processed units
        const sortedUnits = Object.entries(mergedMap)
            .map(([unit, count]) => ({ unit, count }))
            .filter(item => !item.unit.includes("Direct?"))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        utils.storage.set('topProcessedUnits', sortedUnits);

    } catch (error) {
        console.error('Combined unit data error:', error);
    }
}

// Fetch floor data
async function fetchFloorData(params) {
    try {
        const [campaignData, searchedData] = await Promise.all([
            api.getCampaigns(params),
            api.getSearchedEvents(params)
        ]);

        const ccpoResult = getTotalActionsByFloor(campaignData);
        
        const titlesWithCounts = searchedData
            .filter(item => item.label.includes('->'))
            .map(item => ({
                eventName: item.label.split('->')[1].trim(),
                nbEvents: item.nb_events
            }));

        const jsonPath = `./assets/${state.globalSiteId}.json`;
        const eventResult = await findEventFloor(titlesWithCounts, jsonPath);

        // Check if we have valid floor data
        const allCcpoZeros = Object.values(ccpoResult).every(v => v === 0);
        const floorCount = Object.keys(eventResult).length;

        if (!allCcpoZeros && floorCount > 1) {
            const allFloors = [-3, -2, -1, 0, 1, 2, 3];
            const totalCCPO = Object.values(ccpoResult).reduce((sum, val) => sum + val, 0);
            const totalEvents = Object.values(eventResult).reduce((sum, val) => sum + val, 0);

            const mergedResults = allFloors.map(floor => ({
                floor,
                kioskUsagePercent: totalCCPO > 0 ? ((ccpoResult[floor] || 0) / totalCCPO * 100).toFixed(2) : '0.00',
                unitSearchPercent: totalEvents > 0 ? ((eventResult[floor] || 0) / totalEvents * 100).toFixed(2) : '0.00'
            }));

            renderFloorsTable(mergedResults, 'floors-container');

            // Store max event floor
            const maxEventFloor = Object.entries(eventResult).reduce((max, [floor, nbEvents]) => 
                nbEvents > max.nbEvents ? { floor, nbEvents } : max
            , { floor: null, nbEvents: 0 });

            if (maxEventFloor.floor !== null) {
                utils.storage.set('maxEventFloor', maxEventFloor.floor);
                utils.storage.set('maxEventNbEvents', maxEventFloor.nbEvents);
            }
        } else {
            const container = document.getElementById('floors-container');
            if (container) container.innerHTML = '';
        }

    } catch (error) {
        console.error('Floor data error:', error);
    }
}

// Fetch daily categories for area chart
async function fetchDailyCategories(params) {
    try {
        const dailyData = await api.getSearchedDaily(params);
        const jsonPath = `./assets/${state.globalSiteId}.json`;
        const categorizedData = await categorizeEventsByDayAndCategory(dailyData, jsonPath);
        renderStoreCategoriesAreaChart(categorizedData, 'area-chart-container');
    } catch (error) {
        console.error('Daily categories error:', error);
    }
}

// Process kiosk data
function processKioskData(data) {
    const cleanedData = cleanCampaignData(data);
    
    if (!cleanedData || cleanedData.length === 0) {
        utils.storage.remove('mostUsedKioskId');
        utils.storage.remove('usagePercentage');
        const container = document.getElementById('kiosks-container');
        if (container) container.innerHTML = '';
        return;
    }

    // Skip if web or mobile-android
    const isExcluded = cleanedData.some(k => k.kiosk === 'web' || k.kiosk === 'mobile-android');
    if (isExcluded) return;

    const totalActions = cleanedData.reduce((total, k) => total + k.actions, 0);
    const mostUsed = cleanedData.reduce((max, k) => k.actions > max.actions ? k : max, cleanedData[0]);

    utils.storage.set('mostUsedKioskId', mostUsed.kiosk);
    utils.storage.set('usagePercentage', ((mostUsed.actions / totalActions) * 100).toFixed(2));

    renderKiosksTable(cleanedData, 'kiosks-container');
}

// Process daily events for analytics
function processDailyEvents(data) {
    const totalEvents = data.reduce((sum, day) => sum + day.totalEvents, 0);
    const average = totalEvents / data.length;
    const minIncrease = 20;

    const significantDates = data
        .filter(day => {
            const increase = ((day.totalEvents - average) / average) * 100;
            return increase >= minIncrease;
        })
        .map(day => ({
            date: day.date,
            currentCount: day.totalEvents,
            averageEventCount: average,
            increasePercentage: (((day.totalEvents - average) / average) * 100).toFixed(2)
        }));

    if (significantDates.length > 0) {
        utils.storage.set('significantIncreaseDates', significantDates);
    } else {
        utils.storage.remove('significantIncreaseDates');
    }

    // Most events day
    const mostEvents = data.reduce((max, day) => 
        day.totalEvents > max.totalEvents ? day : max
    , { totalEvents: 0 });

    utils.storage.set('mostEventsData', {
        date: mostEvents.date,
        totalEvents: mostEvents.totalEvents
    });
}

// Analyze hourly visits
function analyzeHourlyVisits(hourlyVisits) {
    const total = hourlyVisits.reduce((sum, val) => sum + val, 0);
    const average = total / hourlyVisits.length;

    const aboveAverage = hourlyVisits
        .map((value, hour) => ({ hour, value }))
        .filter(item => item.value > average)
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map(({ hour, value }) => ({ hour, visits: Math.ceil(value) }));

    const maxValue = Math.max(...hourlyVisits);
    const peakHour = hourlyVisits.indexOf(maxValue);

    utils.storage.set('hourlyVisitAnalysis', {
        totalVisits: Math.ceil(total),
        roundedAverage: Math.ceil(average),
        top3AboveAverage: aboveAverage,
        peakHour,
        peakValue: Math.ceil(maxValue)
    });
}

// =====================================================
// Date Range Handling
// =====================================================

function handleQuickRange(days) {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const today = new Date();
    let startDate, endDate;

    if (days === 30) {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (days === 365) {
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
    } else if (days) {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - days + 1);
    } else {
        startDateInput.value = '';
        endDateInput.value = '';
        fetchAllData();
        return;
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    startDateInput.value = startStr;
    endDateInput.value = endStr;

    ui.setActiveQuickRange(days);
    utils.storage.set('selectedRange', days);
    utils.storage.remove('startDate');
    utils.storage.remove('endDate');

    fetchAllData(startStr, endStr);
}

// =====================================================
// Site Management
// =====================================================

async function loadSites() {
    try {
        const response = await api.getSites();
        // Handle both old format (array) and new format (object with sites property)
        const sites = Array.isArray(response) ? response : (response.sites || []);
        const grouped = response.grouped || null;
        
        state.sites = sites;
        renderSiteDropdown(sites, grouped);
        
        // Check for stored site - convert both to string for comparison
        const storedSiteId = localStorage.getItem('selectedSiteId');
        const storedSiteName = localStorage.getItem('selectedSiteName');
        if (storedSiteId) {
            const site = sites.find(s => String(s.id) === String(storedSiteId));
            if (site) {
                selectSite(site);
            } else if (storedSiteName) {
                // Site not found in list but we have stored name - use it anyway
                selectSite({ id: storedSiteId, name: storedSiteName });
            }
        }
    } catch (error) {
        console.error('Failed to load sites:', error);
        utils.showToast('Siteler yüklenemedi', 'error', 'Hata');
    }
}

function renderSiteDropdown(sites, grouped = null) {
    const container = document.getElementById('siteDropdownList');
    if (!container) return;

    // If we have grouped data, render with categories
    if (grouped) {
        let html = '';
        Object.entries(grouped).forEach(([key, category]) => {
            if (category.sites && category.sites.length > 0) {
                html += `<div class="site-category-header">${category.icon} ${category.name}</div>`;
                html += category.sites.map(site => `
                    <div class="site-dropdown-item" data-id="${site.id}" data-name="${site.name}">
                        ${site.name}
                    </div>
                `).join('');
            }
        });
        container.innerHTML = html;
    } else {
        // Fallback to simple list
        container.innerHTML = sites.map(site => `
            <div class="site-dropdown-item" data-id="${site.id}" data-name="${site.name}">
                ${site.name}
            </div>
        `).join('');
    }

    // Add click handlers
    container.querySelectorAll('.site-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const site = {
                id: item.dataset.id,
                name: item.dataset.name
            };
            selectSite(site);
            document.getElementById('siteDropdown').classList.remove('open');
        });
    });
}

function selectSite(site) {
    state.globalSiteId = site.id;
    localStorage.setItem('selectedSiteId', site.id);
    localStorage.setItem('selectedSiteName', site.name);
    
    ui.updateSelectedSiteName(site.name);
    
    // Update selected state in dropdown - convert both to string for comparison
    document.querySelectorAll('.site-dropdown-item').forEach(item => {
        item.classList.toggle('selected', String(item.dataset.id) === String(site.id));
    });

    // Enable form elements
    document.querySelectorAll('#startDate, #endDate, .quick-range-btn, #fetchDataBtn').forEach(el => {
        el.disabled = false;
    });

    // Load data
    const storedRange = utils.storage.get('selectedRange');
    const storedStart = localStorage.getItem('startDate');
    const storedEnd = localStorage.getItem('endDate');

    if (storedStart && storedEnd) {
        document.getElementById('startDate').value = storedStart;
        document.getElementById('endDate').value = storedEnd;
        fetchAllData(storedStart, storedEnd);
    } else if (storedRange) {
        handleQuickRange(storedRange);
    } else {
        // Default to last 7 days
        handleQuickRange(7);
    }
}

// Site search filter
function setupSiteSearch() {
    const searchInput = document.getElementById('siteSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', utils.debounce((e) => {
        const query = e.target.value.toLowerCase();
        
        // Filter items
        document.querySelectorAll('.site-dropdown-item').forEach(item => {
            const name = item.dataset.name.toLowerCase();
            item.style.display = name.includes(query) ? 'block' : 'none';
        });
        
        // Hide category headers with no visible items
        document.querySelectorAll('.site-category-header').forEach(header => {
            let nextEl = header.nextElementSibling;
            let hasVisibleItem = false;
            
            while (nextEl && !nextEl.classList.contains('site-category-header')) {
                if (nextEl.classList.contains('site-dropdown-item') && nextEl.style.display !== 'none') {
                    hasVisibleItem = true;
                    break;
                }
                nextEl = nextEl.nextElementSibling;
            }
            
            header.style.display = hasVisibleItem ? 'block' : 'none';
        });
    }, CONFIG.DEBOUNCE_DELAY));
}

// =====================================================
// Event Listeners
// =====================================================

function setupEventListeners() {
    // Fetch data button
    const fetchBtn = document.getElementById('fetchDataBtn');
    if (fetchBtn) {
        fetchBtn.addEventListener('click', () => {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (startDate && endDate) {
                localStorage.setItem('startDate', startDate);
                localStorage.setItem('endDate', endDate);
                utils.storage.remove('selectedRange');
                ui.setActiveQuickRange(null);
            }
            
            fetchAllData(startDate, endDate);
        });
    }

    // Quick range buttons
    document.getElementById('btn-1g')?.addEventListener('click', () => handleQuickRange(1));
    document.getElementById('btn-1h')?.addEventListener('click', () => handleQuickRange(7));
    document.getElementById('btn-1a')?.addEventListener('click', () => handleQuickRange(30));
    document.getElementById('btn-1y')?.addEventListener('click', () => handleQuickRange(365));

    // Date inputs change
    ['startDate', 'endDate'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            ui.setActiveQuickRange(null);
        });
    });

    // Site search
    setupSiteSearch();
}

// =====================================================
// Language Flag Helper
// =====================================================

function normalizeLanguage(langString) {
    const lower = langString.toLowerCase();
    
    // English variants - combine all
    if (lower.includes('english') || lower === 'en' || lower.startsWith('en-')) {
        return { name: 'İngilizce', flag: '🇬🇧' };
    }
    // Turkish
    if (lower.includes('turkish') || lower === 'tr') {
        return { name: 'Türkçe', flag: '🇹🇷' };
    }
    // German
    if (lower.includes('german') || lower === 'de' || lower.startsWith('de-')) {
        return { name: 'Almanca', flag: '🇩🇪' };
    }
    // French
    if (lower.includes('french') || lower === 'fr' || lower.startsWith('fr-')) {
        return { name: 'Fransızca', flag: '🇫🇷' };
    }
    // Spanish
    if (lower.includes('spanish') || lower === 'es' || lower.startsWith('es-')) {
        return { name: 'İspanyolca', flag: '🇪🇸' };
    }
    // Italian
    if (lower.includes('italian') || lower === 'it' || lower.startsWith('it-')) {
        return { name: 'İtalyanca', flag: '🇮🇹' };
    }
    // Russian
    if (lower.includes('russian') || lower === 'ru') {
        return { name: 'Rusça', flag: '🇷🇺' };
    }
    // Arabic
    if (lower.includes('arabic') || lower === 'ar' || lower.startsWith('ar-')) {
        return { name: 'Arapça', flag: '🇸🇦' };
    }
    // Chinese
    if (lower.includes('chinese') || lower === 'zh' || lower.startsWith('zh-')) {
        return { name: 'Çince', flag: '🇨🇳' };
    }
    // Japanese
    if (lower.includes('japanese') || lower === 'ja') {
        return { name: 'Japonca', flag: '🇯🇵' };
    }
    // Korean
    if (lower.includes('korean') || lower === 'ko') {
        return { name: 'Korece', flag: '🇰🇷' };
    }
    // Portuguese
    if (lower.includes('portuguese') || lower === 'pt' || lower.startsWith('pt-')) {
        return { name: 'Portekizce', flag: '🇵🇹' };
    }
    // Dutch
    if (lower.includes('dutch') || lower === 'nl') {
        return { name: 'Felemenkçe', flag: '🇳🇱' };
    }
    // Polish
    if (lower.includes('polish') || lower === 'pl') {
        return { name: 'Lehçe', flag: '🇵🇱' };
    }
    // Swedish
    if (lower.includes('swedish') || lower === 'sv') {
        return { name: 'İsveççe', flag: '🇸🇪' };
    }
    // Greek
    if (lower.includes('greek') || lower === 'el') {
        return { name: 'Yunanca', flag: '🇬🇷' };
    }
    // Croatian
    if (lower.includes('croatian') || lower === 'hr') {
        return { name: 'Hırvatça', flag: '🇭🇷' };
    }
    // Czech
    if (lower.includes('czech') || lower === 'cs') {
        return { name: 'Çekçe', flag: '🇨🇿' };
    }
    // Romanian
    if (lower.includes('romanian') || lower === 'ro') {
        return { name: 'Romence', flag: '🇷🇴' };
    }
    // Hungarian
    if (lower.includes('hungarian') || lower === 'hu') {
        return { name: 'Macarca', flag: '🇭🇺' };
    }
    // Ukrainian
    if (lower.includes('ukrainian') || lower === 'uk') {
        return { name: 'Ukraynaca', flag: '🇺🇦' };
    }
    // Hebrew
    if (lower.includes('hebrew') || lower === 'he') {
        return { name: 'İbranice', flag: '🇮🇱' };
    }
    // Persian
    if (lower.includes('persian') || lower.includes('farsi') || lower === 'fa') {
        return { name: 'Farsça', flag: '🇮🇷' };
    }
    // Hindi
    if (lower.includes('hindi') || lower === 'hi') {
        return { name: 'Hintçe', flag: '🇮🇳' };
    }
    // Thai
    if (lower.includes('thai') || lower === 'th') {
        return { name: 'Tayca', flag: '🇹🇭' };
    }
    // Vietnamese
    if (lower.includes('vietnamese') || lower === 'vi') {
        return { name: 'Vietnamca', flag: '🇻🇳' };
    }
    // Indonesian
    if (lower.includes('indonesian') || lower === 'id') {
        return { name: 'Endonezce', flag: '🇮🇩' };
    }
    // Norwegian
    if (lower.includes('norwegian') || lower === 'no' || lower === 'nb') {
        return { name: 'Norveççe', flag: '🇳🇴' };
    }
    // Danish
    if (lower.includes('danish') || lower === 'da') {
        return { name: 'Danca', flag: '🇩🇰' };
    }
    // Finnish
    if (lower.includes('finnish') || lower === 'fi') {
        return { name: 'Fince', flag: '🇫🇮' };
    }
    
    // Default - return original with globe emoji
    return { name: langString, flag: '🌐' };
}

function getLanguageFlag(langString) {
    // Map language strings to emoji flags
    const flagMap = {
        'turkish': '🇹🇷',
        'tr': '🇹🇷',
        'turkish (tr)': '🇹🇷',
        'english': '🇬🇧',
        'en': '🇬🇧',
        'english - united states': '🇺🇸',
        'english - united states (en-us)': '🇺🇸',
        'en-us': '🇺🇸',
        'english - united kingdom': '🇬🇧',
        'english - united kingdom (en-gb)': '🇬🇧',
        'en-gb': '🇬🇧',
        'english - canada': '🇨🇦',
        'en-ca': '🇨🇦',
        'english - australia': '🇦🇺',
        'en-au': '🇦🇺',
        'german': '🇩🇪',
        'de': '🇩🇪',
        'german - germany': '🇩🇪',
        'de-de': '🇩🇪',
        'french': '🇫🇷',
        'fr': '🇫🇷',
        'french - france': '🇫🇷',
        'fr-fr': '🇫🇷',
        'spanish': '🇪🇸',
        'es': '🇪🇸',
        'spanish - spain': '🇪🇸',
        'es-es': '🇪🇸',
        'italian': '🇮🇹',
        'it': '🇮🇹',
        'russian': '🇷🇺',
        'ru': '🇷🇺',
        'arabic': '🇸🇦',
        'ar': '🇸🇦',
        'chinese': '🇨🇳',
        'zh': '🇨🇳',
        'japanese': '🇯🇵',
        'ja': '🇯🇵',
        'korean': '🇰🇷',
        'ko': '🇰🇷',
        'portuguese': '🇵🇹',
        'pt': '🇵🇹',
        'dutch': '🇳🇱',
        'nl': '🇳🇱',
        'dutch - netherlands': '🇳🇱',
        'polish': '🇵🇱',
        'pl': '🇵🇱',
        'swedish': '🇸🇪',
        'sv': '🇸🇪',
        'norwegian': '🇳🇴',
        'no': '🇳🇴',
        'danish': '🇩🇰',
        'da': '🇩🇰',
        'finnish': '🇫🇮',
        'fi': '🇫🇮',
        'greek': '🇬🇷',
        'el': '🇬🇷',
        'czech': '🇨🇿',
        'cs': '🇨🇿',
        'hungarian': '🇭🇺',
        'hu': '🇭🇺',
        'romanian': '🇷🇴',
        'ro': '🇷🇴',
        'ukrainian': '🇺🇦',
        'uk': '🇺🇦',
        'hebrew': '🇮🇱',
        'he': '🇮🇱',
        'persian': '🇮🇷',
        'fa': '🇮🇷',
        'hindi': '🇮🇳',
        'hi': '🇮🇳',
        'thai': '🇹🇭',
        'th': '🇹🇭',
        'vietnamese': '🇻🇳',
        'vi': '🇻🇳',
        'indonesian': '🇮🇩',
        'id': '🇮🇩',
        'malay': '🇲🇾',
        'ms': '🇲🇾'
    };
    
    const normalizedLang = langString.toLowerCase().trim();
    return flagMap[normalizedLang] || '🌐';
}

// =====================================================
// PDF Page Data Loading
// =====================================================

async function loadPdfPageData() {
    const storedSiteId = localStorage.getItem('selectedSiteId');
    if (!storedSiteId) {
        console.warn('No site selected for PDF');
        return;
    }

    state.globalSiteId = storedSiteId;

    // Get date range from localStorage
    const storedRange = utils.storage.get('selectedRange');
    const storedStart = localStorage.getItem('startDate');
    const storedEnd = localStorage.getItem('endDate');

    let startDate, endDate;

    if (storedStart && storedEnd) {
        startDate = storedStart;
        endDate = storedEnd;
    } else if (storedRange) {
        const today = new Date();
        if (storedRange === 30) {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        } else if (storedRange === 365) {
            startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
            endDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
        } else {
            endDate = today.toISOString().split('T')[0];
            const start = new Date();
            start.setDate(today.getDate() - storedRange + 1);
            startDate = start.toISOString().split('T')[0];
        }
    } else {
        // Default to last 7 days
        const today = new Date();
        endDate = today.toISOString().split('T')[0];
        const start = new Date();
        start.setDate(today.getDate() - 6);
        startDate = start.toISOString().split('T')[0];
    }

    console.log('📄 PDF Page - Loading data for site:', storedSiteId);
    await fetchAllData(startDate, endDate);
    
    // Wait a bit for localStorage to be populated
    setTimeout(() => {
        // Populate summary list
        populateSummaryList();
        
        // Load categorized units if available
        loadCategorizedUnitsForPdf();
    }, 500);
}

async function loadCategorizedUnitsForPdf() {
    try {
        const jsonPath = `./assets/${state.globalSiteId}_categorized_units.json`;
        const response = await fetch(jsonPath);
        if (response.ok) {
            const data = await response.json();
            renderCategorizedUnitsList(data, 'categorized-units-chart');
        }
    } catch (error) {
        console.log('Categorized units not available for this site');
    }
}

function populateSummaryList() {
    // Get date range
    const startDateStr = localStorage.getItem('startDate');
    const endDateStr = localStorage.getItem('endDate');
    let dateRangeText = '';
    if (startDateStr && endDateStr) {
        const startDate = new Date(startDateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const endDate = new Date(endDateStr).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        dateRangeText = `(${startDate} - ${endDate})`;
    }

    const summaryItems = {
        'summary-main': () => {
            const totalVisits = utils.storage.get('totalVisits', 0);
            const total = utils.storage.get('total', 0);
            if (totalVisits > 0 || total > 0) {
                return `Seçilen dönemde ${dateRangeText} toplam <strong>${utils.formatNumber(totalVisits)}</strong> ziyaretçi, <strong>${utils.formatNumber(total)}</strong> etkinlik (harita çağırım, rotalama, arama, tıklama) gerçekleştirmiştir.`;
            }
            return '';
        },
        'summary-events-breakdown': () => {
            const fromTo = utils.storage.get('fromTo', 0);
            const searched = utils.storage.get('searched', 0);
            const touched = utils.storage.get('touched', 0);
            const initialized = utils.storage.get('initialized', 0);
            if (fromTo > 0 || searched > 0 || touched > 0) {
                return `Kullanım sayıları <strong>${utils.formatNumber(fromTo)}</strong> rota çizdirme, <strong>${utils.formatNumber(searched)}</strong> arama, <strong>${utils.formatNumber(touched)}</strong> tıklama ve <strong>${utils.formatNumber(initialized)}</strong> harita çağrım olarak dağılım göstermiştir.`;
            }
            return '';
        },
        'summary-busiest-day': () => {
            const mostEvents = utils.storage.get('mostEventsData', {});
            if (mostEvents.date) {
                const date = new Date(mostEvents.date);
                const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' });
                const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
                return `En çok işlem yapılan gün <strong>${utils.formatNumber(mostEvents.totalEvents)}</strong> kez ile <strong>${dateStr} ${dayName}</strong> günü olmuştur.`;
            }
            return '';
        },
        'summary-platform': () => {
            const iosTotal = parseInt(localStorage.getItem('iosTotal')) || 0;
            const androidTotal = parseInt(localStorage.getItem('androidTotal')) || 0;
            const webTotal = parseInt(localStorage.getItem('webTotal')) || 0;
            
            if (iosTotal > 0 || androidTotal > 0 || webTotal > 0) {
                const parts = [];
                if (androidTotal > 0) parts.push(`<strong>Android</strong> üzerinden <strong>${utils.formatNumber(androidTotal)}</strong>`);
                if (iosTotal > 0) parts.push(`<strong>iOS</strong> üzerinden <strong>${utils.formatNumber(iosTotal)}</strong>`);
                if (webTotal > 0) parts.push(`<strong>Web</strong> üzerinden <strong>${utils.formatNumber(webTotal)}</strong>`);
                return `${parts.join(', ')} ziyaret gerçekleşmiştir.`;
            }
            return '';
        },
        'summary-languages': () => {
            const topLanguages = utils.storage.get('topLanguages', {});
            const entries = Object.entries(topLanguages);
            if (entries.length > 0) {
                // Combine and simplify languages
                const combinedLangs = {};
                
                entries.forEach(([lang, count]) => {
                    const normalized = normalizeLanguage(lang);
                    if (combinedLangs[normalized.name]) {
                        combinedLangs[normalized.name].count += count;
                    } else {
                        combinedLangs[normalized.name] = {
                            count: count,
                            flag: normalized.flag
                        };
                    }
                });
                
                // Sort by count and take top 10
                const sortedLangs = Object.entries(combinedLangs)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 10);
                
                const langItems = sortedLangs.map(([name, data]) => {
                    return `<span class="language-item"><span class="flag-emoji">${data.flag}</span><strong>${name}</strong> (${utils.formatNumber(data.count)} kez)</span>`;
                }).join('');
                return `Kullanıcıların dillere göre dağılımı:<span class="language-list">${langItems}</span>`;
            }
            return '';
        },
        'summary-total-visits': () => {
            const totalVisits = utils.storage.get('totalVisits', 0);
            if (totalVisits > 0) {
                return `Toplam <strong>${utils.formatNumber(totalVisits)}</strong> kez ziyaret gerçekleşmiştir.`;
            }
            return '';
        },
        'summary-hourly-avg': () => {
            const analysis = utils.storage.get('hourlyVisitAnalysis', {});
            if (analysis.roundedAverage) {
                return `Saatlik ortalama ziyaret sayısı <strong>${utils.formatNumber(analysis.roundedAverage)}</strong> olarak hesaplanmıştır.`;
            }
            return '';
        },
        'summary-peak-hours': () => {
            const analysis = utils.storage.get('hourlyVisitAnalysis', {});
            if (analysis.top3AboveAverage && analysis.top3AboveAverage.length > 0) {
                const hoursList = analysis.top3AboveAverage.map(h => `<strong>${h.hour}:00</strong> - ${utils.formatNumber(h.visits)} ziyaret`).join(', ');
                return `En çok ziyaret edilen saatler: ${hoursList}.`;
            }
            return '';
        },
        'summary-engagement': () => {
            const rate = parseFloat(utils.storage.get('bounceRate', 0));
            if (!isNaN(rate) && rate > 0) {
                const engagementRate = (100 - rate).toFixed(0);
                return `Ziyaretçilerin <strong>%${engagementRate}</strong> kadarı içeriklerle ilgilenmiş, sitede vakit geçirmiş ve tekrar ziyaret etmiştir.`;
            }
            return '';
        },
        'summary-top-units': () => {
            const topUnits = utils.storage.get('topProcessedUnits', []);
            if (topUnits.length > 0) {
                const unitsList = topUnits.slice(0, 5).map((u, i) => 
                    `<span class="unit-item"><strong>${i + 1}. ${u.unit}</strong> – ${utils.formatNumber(u.count)} işlem</span>`
                ).join('');
                return `Kullanıcılar tarafından en çok işlem yapılan birimler:<span class="units-list">${unitsList}</span>`;
            }
            return '';
        },
        'summary-kiosk': () => {
            const kioskId = utils.storage.get('mostUsedKioskId');
            const percentage = utils.storage.get('usagePercentage');
            if (kioskId && percentage) {
                return `En çok kullanılan kiosk <strong>${kioskId}</strong> olup, kullanım yüzdesi <strong>%${percentage}</strong> olarak ölçülmüştür.`;
            }
            return '';
        }
    };

    Object.entries(summaryItems).forEach(([id, getText]) => {
        const element = document.getElementById(id);
        if (element) {
            const text = getText();
            element.innerHTML = text;
            element.style.display = text ? 'list-item' : 'none';
        }
    });
}

// =====================================================
// Initialization
// =====================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inmapper Analytics Dashboard initialized');
    
    // Check if this is PDF page
    const isPdfPage = window.isPdfPage || window.location.pathname.includes('pdf_layout');
    
    if (isPdfPage) {
        // PDF page - auto load data
        await loadPdfPageData();
    } else {
        // Main dashboard - setup event listeners and load sites
        setupEventListeners();
        await loadSites();
        
        // Show welcome message if no site selected
        if (!state.globalSiteId) {
            utils.showToast('Başlamak için bir site seçin', 'info', 'Hoş Geldiniz');
        }
    }
});

// Export for potential external use
window.InmapperDashboard = {
    fetchAllData,
    state,
    utils
};
