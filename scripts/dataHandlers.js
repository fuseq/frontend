/**
 * Inmapper Analytics Dashboard - Data Handlers
 * Modern chart rendering with beautiful styling
 */

// =====================================================
// Chart Theme Configuration
// =====================================================

const CHART_THEME = {
    // Color palette - Modern gradient colors
    colors: {
        primary: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
        secondary: ['#3b82f6', '#60a5fa', '#93c5fd'],
        accent: ['#10b981', '#34d399', '#6ee7b7'],
        warm: ['#f59e0b', '#fbbf24', '#fcd34d'],
        cool: ['#06b6d4', '#22d3ee', '#67e8f9'],
        pink: ['#ec4899', '#f472b6', '#f9a8d4']
    },
    
    // Gradient generator
    getGradient(ctx, colorStart, colorEnd) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    },
    
    // Generate color palette for charts
    generatePalette(count) {
        const baseColors = [
            '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899',
            '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6',
            '#a855f7', '#0ea5e9', '#22c55e', '#eab308', '#f43f5e'
        ];
        
        return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
    },
    
    // Pastel color generator
    generatePastelColors(count) {
        const hueStart = 240;
        const hueEnd = 360;
        return Array.from({ length: count }, (_, i) => {
            const hue = hueStart + (hueEnd - hueStart) * (i / Math.max(count - 1, 1));
            return `hsla(${hue}, 70%, 65%, 0.85)`;
        });
    }
};

// =====================================================
// Chart.js Global Configuration
// =====================================================

// Theme detection helper
function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
}

function getChartColors() {
    const dark = isDarkMode();
    return {
        text: dark ? 'rgba(255, 255, 255, 0.7)' : '#334155',
        textPrimary: dark ? '#ffffff' : '#0f172a',
        grid: dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)',
        tooltipBg: dark ? 'rgba(26, 26, 36, 0.95)' : 'rgba(255, 255, 255, 0.98)',
        tooltipText: dark ? '#ffffff' : '#0f172a',
        tooltipBorder: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        dataLabelColor: dark ? '#ffffff' : '#1e293b',
        dataLabelShadow: dark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)'
    };
}

// Apply chart defaults based on theme
function applyChartDefaults() {
    if (typeof Chart === 'undefined') return;
    
    const colors = getChartColors();
    
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.font.size = 13; // Increased from default 12
    Chart.defaults.font.weight = '500'; // Semi-bold for better clarity
    Chart.defaults.color = colors.text;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 20;
    Chart.defaults.plugins.legend.labels.font = { size: 13, weight: '500' };
    Chart.defaults.plugins.legend.labels.color = colors.text;
    Chart.defaults.plugins.tooltip.backgroundColor = colors.tooltipBg;
    Chart.defaults.plugins.tooltip.titleColor = colors.tooltipText;
    Chart.defaults.plugins.tooltip.titleFont = { size: 13, weight: '600' };
    Chart.defaults.plugins.tooltip.bodyColor = colors.text;
    Chart.defaults.plugins.tooltip.bodyFont = { size: 12, weight: '500' };
    Chart.defaults.plugins.tooltip.borderColor = colors.tooltipBorder;
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.elements.bar.borderRadius = 6;
    Chart.defaults.elements.line.tension = 0.4;
    
    // Scale/Axis font settings for better readability
    Chart.defaults.scale.ticks.font = { size: 12, weight: '500' };
    
    // Animation optimization to prevent glitches
    Chart.defaults.animation = false; // Disable all animations to prevent glitches
    Chart.defaults.responsive = true;
    Chart.defaults.responsiveAnimationDuration = 0; // Disable resize animations
    Chart.defaults.maintainAspectRatio = false;
}

// Initial apply
applyChartDefaults();

// Chart registry to track all instances
const chartRegistry = new Map();

// Register a chart instance
function registerChart(containerId, chart) {
    // Chart is already destroyed in getChartContainer if it existed
    chartRegistry.set(containerId, chart);
    
    // Force chart update after a small delay to prevent rendering glitches
    requestAnimationFrame(() => {
        if (chart && typeof chart.update === 'function') {
            chart.update('none'); // Update without animation
        }
    });
}

// Update all charts when theme changes
function updateAllChartsTheme() {
    const colors = getChartColors();
    
    chartRegistry.forEach((chart) => {
        if (chart && chart.options) {
            // Update legend colors
            if (chart.options.plugins?.legend?.labels) {
                chart.options.plugins.legend.labels.color = colors.text;
            }
            // Update scale colors
            if (chart.options.scales) {
                Object.values(chart.options.scales).forEach(scale => {
                    if (scale.ticks) scale.ticks.color = colors.text;
                    if (scale.grid) scale.grid.color = colors.grid;
                });
            }
            // Update tooltip colors
            if (chart.options.plugins?.tooltip) {
                chart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
                chart.options.plugins.tooltip.titleColor = colors.tooltipText;
                chart.options.plugins.tooltip.bodyColor = colors.text;
                chart.options.plugins.tooltip.borderColor = colors.tooltipBorder;
            }
            chart.update('none');
        }
    });
}

// Add zoom reset button to chart container
function addZoomResetButton(containerId, chart) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const parentCard = container.closest('.chart-card');
    if (!parentCard) return;
    
    // Check if button already exists
    if (parentCard.querySelector('.zoom-reset-btn')) return;
    
    const header = parentCard.querySelector('.chart-card-header');
    if (!header) return;
    
    const resetBtn = document.createElement('button');
    resetBtn.className = 'zoom-reset-btn';
    resetBtn.innerHTML = '<i data-lucide="zoom-out"></i> Sıfırla';
    resetBtn.title = 'Zoom\'u sıfırla';
    resetBtn.style.cssText = `
        display: none;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 500;
        color: var(--color-text-secondary);
        background: var(--color-bg-tertiary);
        border: 1px solid var(--color-border);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-left: auto;
    `;
    
    resetBtn.addEventListener('mouseenter', () => {
        resetBtn.style.background = 'var(--color-bg-card-hover)';
        resetBtn.style.color = 'var(--color-text-primary)';
    });
    
    resetBtn.addEventListener('mouseleave', () => {
        resetBtn.style.background = 'var(--color-bg-tertiary)';
        resetBtn.style.color = 'var(--color-text-secondary)';
    });
    
    resetBtn.addEventListener('click', () => {
        chart.resetZoom();
        resetBtn.style.display = 'none';
    });
    
    header.appendChild(resetBtn);
    
    // Initialize Lucide icon
    if (window.lucide) {
        window.lucide.createIcons({ icons: { 'zoom-out': true }, nameAttr: 'data-lucide' });
    }
    
    // Show button when zoomed
    chart.options.plugins.zoom.zoom.onZoomComplete = ({ chart }) => {
        resetBtn.style.display = 'flex';
    };
}

// Listen for theme changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            applyChartDefaults();
            // Small delay to ensure CSS variables are updated
            setTimeout(updateAllChartsTheme, 50);
        }
    });
});

if (typeof document !== 'undefined') {
    observer.observe(document.documentElement, { attributes: true });
}

// =====================================================
// Helper Functions
// =====================================================

function getChartContainer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container '${containerId}' not found`);
        return null;
    }
    
    // Destroy existing chart before clearing container to prevent glitches
    if (chartRegistry.has(containerId)) {
        const existingChart = chartRegistry.get(containerId);
        if (existingChart) {
            existingChart.destroy();
        }
        chartRegistry.delete(containerId);
    }
    
    // Small delay to ensure DOM is ready and prevent glitches
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    // Explicitly set canvas size to prevent rendering issues
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    
    // Force a reflow to ensure canvas is properly sized
    canvas.offsetHeight;
    
    return canvas;
}

function showEmptyState(containerId, message = 'Veri bulunamadı') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">
                <i class="lucide-inbox"></i>
            </div>
            <div class="empty-state-title">${message}</div>
            <div class="empty-state-text">Bu tarih aralığında gösterilecek veri bulunmuyor</div>
        </div>
    `;
}

// =====================================================
// From-To Events Chart
// =====================================================

export const renderFromToEvents = (data, containerId) => {
    const canvas = getChartContainer(containerId);
    if (!canvas || !data?.length) {
        showEmptyState(containerId);
        return;
    }

    const colors = getChartColors();
    const startPoints = {};
    const endPoints = {};

    data.forEach(item => {
        if (!item.label || !item.label.includes('->')) return;
        const [start, end] = item.label.split('->');
        if (!start || !end) return;
        startPoints[start.trim()] = (startPoints[start.trim()] || 0) + item.nb_events;
        endPoints[end.trim()] = (endPoints[end.trim()] || 0) + item.nb_events;
    });

    const topStartPoints = Object.entries(startPoints).sort((a, b) => b[1] - a[1]);
    const topEndPoints = Object.entries(endPoints).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const endLabels = topEndPoints.map(([end]) => end);
    const chartColors = CHART_THEME.generatePalette(topStartPoints.length);

    const datasets = topStartPoints.map(([start], i) => ({
        label: start,
        data: topEndPoints.map(([end]) => 
            data.filter(item => {
                if (!item.label || !item.label.includes('->')) return false;
                const [s, e] = item.label.split('->');
                return s && e && s.trim() === start && e.trim() === end;
            }).reduce((sum, item) => sum + item.nb_events, 0)
        ),
        backgroundColor: chartColors[i],
        borderColor: chartColors[i],
        borderWidth: 0,
        borderRadius: 4,
        stack: 'fromTo'
    }));

    const chart = new Chart(canvas, {
        type: 'bar',
        data: { labels: endLabels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false },
                legend: { display: false },
                datalabels: {
                    display: (context) => context.dataset.data[context.dataIndex] > 0,
                    color: '#ffffff',
                    anchor: 'center',
                    align: 'center',
                    font: { weight: 'bold', size: 10 },
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textShadowBlur: 4,
                    formatter: (value, context) => {
                        if (value <= 0) return '';
                        const label = context.dataset.label;
                        const firstWord = label.split(' ')[0];
                        return firstWord.length > 10 ? firstWord.slice(0, 8) + '..' : firstWord;
                    }
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy'
                    },
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'xy',
                        onZoomComplete: ({ chart }) => {
                            chart.canvas.style.cursor = 'move';
                        }
                    }
                }
            },
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: {
                        color: colors.text,
                        maxRotation: 30,
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 15 ? label.slice(0, 15) + '...' : label;
                        }
                    }
                },
                y: {
                    stacked: true,
                    grid: { color: colors.grid },
                    ticks: { color: colors.text },
                    beginAtZero: true
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    registerChart(containerId, chart);
    addZoomResetButton(containerId, chart);
};

// =====================================================
// From-To Events by Start Point
// =====================================================

export const renderFromToEventsByStart = (data, containerId) => {
    const canvas = getChartContainer(containerId);
    if (!canvas || !data?.length) {
        showEmptyState(containerId);
        return;
    }

    const colors = getChartColors();
    const startPoints = {};
    const endPoints = {};

    data.forEach(item => {
        if (!item.label || !item.label.includes('->')) return;
        const [start, end] = item.label.split('->');
        if (!start || !end) return;
        startPoints[start.trim()] = (startPoints[start.trim()] || 0) + item.nb_events;
        endPoints[end.trim()] = (endPoints[end.trim()] || 0) + item.nb_events;
    });

    const topStartPoints = Object.entries(startPoints).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topEndPoints = Object.entries(endPoints).sort((a, b) => b[1] - a[1]);
    const startLabels = topStartPoints.map(([start]) => start);
    const chartColors = CHART_THEME.generatePalette(topEndPoints.length);

    const datasets = topEndPoints.map(([end], i) => ({
        label: end,
        data: topStartPoints.map(([start]) =>
            data.filter(item => {
                if (!item.label || !item.label.includes('->')) return false;
                const [s, e] = item.label.split('->');
                return s && e && e.trim() === end && s.trim() === start;
            }).reduce((sum, item) => sum + item.nb_events, 0)
        ),
        backgroundColor: chartColors[i],
        borderColor: chartColors[i],
        borderWidth: 0,
        borderRadius: 4,
        stack: 'fromTo'
    }));

    const chart = new Chart(canvas, {
        type: 'bar',
        data: { labels: startLabels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false },
                legend: { display: false },
                datalabels: {
                    display: (context) => context.dataset.data[context.dataIndex] > 0,
                    color: '#ffffff',
                    anchor: 'center',
                    align: 'center',
                    font: { weight: 'bold', size: 10 },
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textShadowBlur: 4,
                    formatter: (value, context) => {
                        if (value <= 0) return '';
                        const label = context.dataset.label;
                        const firstWord = label.split(' ')[0];
                        return firstWord.length > 10 ? firstWord.slice(0, 8) + '..' : firstWord;
                    }
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy'
                    },
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'xy',
                        onZoomComplete: ({ chart }) => {
                            chart.canvas.style.cursor = 'move';
                        }
                    }
                }
            },
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: {
                        color: colors.text,
                        maxRotation: 30,
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 15 ? label.slice(0, 15) + '...' : label;
                        }
                    }
                },
                y: {
                    stacked: true,
                    grid: { color: colors.grid },
                    ticks: { color: colors.text },
                    beginAtZero: true
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    registerChart(containerId, chart);
    addZoomResetButton(containerId, chart);
};

// =====================================================
// Searched Events Chart
// =====================================================

export const renderSearchedEvents = (data, containerId) => {
    const canvas = getChartContainer(containerId);
    if (!canvas || !data?.length) {
        showEmptyState(containerId);
        return;
    }

    const colors = getChartColors();
    const placeMap = {};

    data.forEach(item => {
        if (!item.label || !item.label.includes('->')) return;
        let [searchTerm, selectedPlace] = item.label.split('->').map(str => str ? str.trim() : '');
        if (!searchTerm) searchTerm = "Doğrudan Seçim";
        if (!selectedPlace) return;
        if (!placeMap[selectedPlace]) placeMap[selectedPlace] = {};
        placeMap[selectedPlace][searchTerm] = (placeMap[selectedPlace][searchTerm] || 0) + item.nb_events;
    });

    const placeTotals = Object.entries(placeMap).map(([place, terms]) => ({
        place,
        total: Object.values(terms).reduce((sum, count) => sum + count, 0)
    }));

    const topPlaces = placeTotals.sort((a, b) => b.total - a.total).slice(0, 5).map(e => e.place);
    const allSearchTermsSet = new Set();
    topPlaces.forEach(place => Object.keys(placeMap[place] || {}).forEach(term => allSearchTermsSet.add(term)));
    
    const allSearchTerms = Array.from(allSearchTermsSet);
    const chartColors = CHART_THEME.generatePalette(allSearchTerms.length);

    const datasets = allSearchTerms.map((term, i) => ({
        label: term,
        data: topPlaces.map(place => placeMap[place]?.[term] || 0),
        backgroundColor: chartColors[i],
        borderColor: chartColors[i],
        borderWidth: 0,
        borderRadius: 4,
        stack: 'search'
    }));

    const chart = new Chart(canvas, {
        type: 'bar',
        data: { labels: topPlaces, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false },
                legend: { display: false },
                datalabels: {
                    display: (context) => context.dataset.data[context.dataIndex] > 0,
                    color: '#ffffff',
                    anchor: 'center',
                    align: 'center',
                    font: { weight: 'bold', size: 9 },
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textShadowBlur: 4,
                    formatter: (value, context) => {
                        if (value <= 0) return '';
                        let label = context.dataset.label;
                        if (label.length > 12) label = label.slice(0, 10) + '..';
                        return label;
                    }
                }
            },
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: {
                        color: colors.text,
                        maxRotation: 0,
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 20 ? label.slice(0, 20) + '...' : label;
                        }
                    }
                },
                y: {
                    stacked: true,
                    grid: { color: colors.grid },
                    ticks: { color: colors.text },
                    beginAtZero: true
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    registerChart(containerId, chart);
};

// =====================================================
// Top 5 Searched Terms
// =====================================================

export const renderTop5SearchedTerms = (data, containerId) => {
    const canvas = getChartContainer(containerId);
    if (!canvas || !data?.length) {
        showEmptyState(containerId);
        return;
    }

    const themeColors = getChartColors();
    const searchTermMap = {};
    data.forEach(item => {
        const [searchTerm] = item.label.split('->').map(str => str.trim());
        if (searchTerm) {
            searchTermMap[searchTerm] = (searchTermMap[searchTerm] || 0) + item.nb_events;
        }
    });

    const sorted = Object.entries(searchTermMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const labels = sorted.map(([term]) => term);
    const dataValues = sorted.map(([, count]) => count);
    const chartColors = CHART_THEME.generatePalette(5);

    const chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Arama Sayısı',
                data: dataValues,
                backgroundColor: chartColors,
                borderColor: chartColors,
                borderWidth: 0,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            layout: {
                padding: {
                    right: 50
                }
            },
            plugins: {
                title: { display: false },
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: themeColors.text,
                    font: { weight: '600', size: 12 },
                    formatter: (value) => value.toLocaleString('tr-TR'),
                    clip: false
                }
            },
            scales: {
                x: {
                    grid: { color: themeColors.grid },
                    ticks: { color: themeColors.text },
                    beginAtZero: true,
                    grace: '10%'
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        color: themeColors.text,
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 20 ? label.slice(0, 20) + '...' : label;
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    registerChart(containerId, chart);
};

// =====================================================
// Daily Events Chart
// =====================================================

export const renderDailyEvents = (data, containerId) => {
    const canvas = getChartContainer(containerId);
    if (!canvas || !data?.length) {
        showEmptyState(containerId);
        return;
    }

    const colors = getChartColors();
    const labels = data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    });
    const values = data.map(item => item.totalEvents);

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.02)');

    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Etkinlik Sayısı',
                data: values,
                borderColor: '#8b5cf6',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: isDarkMode() ? '#1a1a24' : '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false },
                legend: { display: false }
            },
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: colors.text,
                        maxTicksLimit: 10 
                    }
                },
                y: {
                    grid: { color: colors.grid },
                    ticks: { color: colors.text },
                    beginAtZero: true
                }
            }
        }
    });
    registerChart(containerId, chart);
};

// =====================================================
// Hourly Events Chart
// =====================================================

export const renderHourlyEvents = (hourlyVisits, containerId) => {
    const canvas = getChartContainer(containerId);
    if (!canvas || !hourlyVisits?.length) {
        showEmptyState(containerId);
        return;
    }

    const themeColors = getChartColors();
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

    const chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [{
                label: 'Ziyaret',
                data: hourlyVisits,
                backgroundColor: 'rgba(59, 130, 246, 0.85)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 25
                }
            },
            plugins: {
                title: { display: false },
                legend: { display: false },
                datalabels: {
                    display: true,
                    anchor: 'end',
                    align: 'top',
                    color: '#1e3a5f',
                    font: { weight: '700', size: 9 },
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: themeColors.text,
                        maxTicksLimit: 12 
                    }
                },
                y: {
                    grid: { color: themeColors.grid },
                    ticks: { color: themeColors.text },
                    beginAtZero: true
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    registerChart(containerId, chart);
};

// =====================================================
// Operating System Distribution (Pie Chart)
// =====================================================

export const renderOperatingSystemDistribution = (data, containerId) => {
    const canvas = getChartContainer(containerId);
    if (!canvas || !data?.length) {
        showEmptyState(containerId);
        return;
    }

    const themeColors = getChartColors();
    const labels = data.map(item => item.osFamily);
    const values = data.map(item => item.visits);
    const total = values.reduce((a, b) => a + b, 0);
    const chartColors = CHART_THEME.generatePalette(labels.length);

    // Calculate OS totals for storage
    let iosTotal = 0, androidTotal = 0, webTotal = 0;
    labels.forEach((label, i) => {
        const val = values[i];
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('ios')) iosTotal += val;
        else if (lowerLabel.includes('android')) androidTotal += val;
        else webTotal += val;
    });

    localStorage.setItem('iosTotal', iosTotal);
    localStorage.setItem('androidTotal', androidTotal);
    localStorage.setItem('webTotal', webTotal);

    const chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: chartColors,
                borderColor: isDarkMode() ? 'rgba(26, 26, 36, 1)' : 'rgba(255, 255, 255, 1)',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            cutout: '60%',
            plugins: {
                title: { display: false },
                legend: {
                    position: 'bottom',
                    labels: {
                        color: themeColors.text,
                        padding: 15,
                        generateLabels(chart) {
                            const colors = getChartColors();
                            return chart.data.labels.map((label, i) => {
                                const value = chart.data.datasets[0].data[i];
                                const percentage = ((value / total) * 100).toFixed(1);
                                if (percentage < 0.1) return null;
                                return {
                                    text: `${label} (${percentage}%)`,
                                    fillStyle: chart.data.datasets[0].backgroundColor[i],
                                    fontColor: colors.text,
                                    index: i
                                };
                            }).filter(Boolean);
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: { weight: '600', size: 11 },
                    formatter: (value) => {
                        const pct = ((value / total) * 100);
                        return pct >= 5 ? `${pct.toFixed(0)}%` : '';
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    registerChart(containerId, chart);
};

// =====================================================
// Language Distribution (Pie Chart)
// =====================================================

export const renderLanguageDistribution = (data, containerId) => {
    const canvas = getChartContainer(containerId);
    if (!canvas || !data || Object.keys(data).length === 0) {
        showEmptyState(containerId);
        return;
    }

    const themeColors = getChartColors();
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5);

    const labels = top5.map(([lang]) => lang.split(' (')[0]);
    const values = top5.map(([, val]) => val);

    if (others.length > 0) {
        labels.push('Diğer');
        values.push(others.reduce((sum, [, val]) => sum + val, 0));
    }

    const total = values.reduce((a, b) => a + b, 0);
    const chartColors = CHART_THEME.generatePalette(labels.length);

    const chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: chartColors,
                borderColor: isDarkMode() ? 'rgba(26, 26, 36, 1)' : 'rgba(255, 255, 255, 1)',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            cutout: '60%',
            plugins: {
                title: { display: false },
                legend: {
                    position: 'bottom',
                    labels: { 
                        color: themeColors.text,
                        padding: 15,
                        usePointStyle: true,
                        generateLabels(chart) {
                            const colors = getChartColors();
                            return chart.data.labels.map((label, i) => ({
                                text: label,
                                fillStyle: chart.data.datasets[0].backgroundColor[i],
                                fontColor: colors.text,
                                index: i
                            }));
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: { weight: '600', size: 11 },
                    formatter: (value) => {
                        const pct = ((value / total) * 100);
                        return pct >= 5 ? `${pct.toFixed(0)}%` : '';
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    registerChart(containerId, chart);
};

// =====================================================
// Store Categories Donut Chart
// =====================================================

export const renderStoreCategoriesDonutChart = (data, containerId) => {
    const canvas = getChartContainer(containerId);
    if (!canvas || !data?.length) {
        showEmptyState(containerId);
        return;
    }

    const themeColors = getChartColors();
    const categoryMap = {};
    data.forEach(item => {
        const category = item.label.trim();
        categoryMap[category] = (categoryMap[category] || 0) + item.nb_events;
    });

    const totalEvents = Object.values(categoryMap).reduce((sum, c) => sum + c, 0);
    const updated = {};
    let otherCount = 0;

    Object.entries(categoryMap).forEach(([cat, count]) => {
        if ((count / totalEvents) * 100 < 5) {
            otherCount += count;
        } else {
            updated[cat] = count;
        }
    });

    if (otherCount > 0) updated['Diğer'] = otherCount;

    const labels = Object.keys(updated);
    const values = Object.values(updated);
    const chartColors = CHART_THEME.generatePalette(labels.length);

    const chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: chartColors,
                borderColor: isDarkMode() ? 'rgba(26, 26, 36, 1)' : 'rgba(255, 255, 255, 1)',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            cutout: '55%',
            plugins: {
                title: { display: false },
                legend: {
                    position: 'bottom',
                    labels: { 
                        color: themeColors.text,
                        padding: 12, 
                        font: { size: 11 },
                        usePointStyle: true,
                        generateLabels(chart) {
                            const colors = getChartColors();
                            return chart.data.labels.map((label, i) => ({
                                text: label,
                                fillStyle: chart.data.datasets[0].backgroundColor[i],
                                fontColor: colors.text,
                                index: i
                            }));
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: { weight: '600', size: 10 },
                    formatter: (value) => {
                        const pct = (value / totalEvents) * 100;
                        return pct >= 5 ? `${pct.toFixed(0)}%` : '';
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    registerChart(containerId, chart);
};

// =====================================================
// Store Categories Area Chart
// =====================================================

export const renderStoreCategoriesAreaChart = (data, containerId) => {
    const canvas = getChartContainer(containerId);
    if (!canvas || !data || Object.keys(data).length === 0) {
        showEmptyState(containerId);
        return;
    }

    const themeColors = getChartColors();
    const categoryDateMap = {};
    const dateSet = new Set();

    Object.entries(data).forEach(([date, categories]) => {
        dateSet.add(date);
        Object.entries(categories).forEach(([category, count]) => {
            if (!categoryDateMap[category]) categoryDateMap[category] = {};
            categoryDateMap[category][date] = (categoryDateMap[category][date] || 0) + count;
        });
    });

    const sortedDates = Array.from(dateSet).sort();
    const labels = sortedDates.map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    });
    
    const chartColors = CHART_THEME.generatePalette(Object.keys(categoryDateMap).length);

    const datasets = Object.keys(categoryDateMap).map((category, i) => ({
        label: category,
        data: sortedDates.map(date => categoryDateMap[category][date] || 0),
        borderColor: chartColors[i],
        backgroundColor: chartColors[i].replace(')', ', 0.1)').replace('rgb', 'rgba'),
        fill: true,
        tension: 0.4,
        borderWidth: 2
    }));

    const chart = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false },
                legend: {
                    position: 'bottom',
                    labels: { 
                        color: themeColors.text,
                        padding: 12, 
                        font: { size: 11 }, 
                        usePointStyle: true 
                    }
                }
            },
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { 
                        color: themeColors.text,
                        maxTicksLimit: 10 
                    }
                },
                y: {
                    grid: { color: themeColors.grid },
                    ticks: { color: themeColors.text },
                    beginAtZero: true,
                    stacked: true
                }
            }
        }
    });
    registerChart(containerId, chart);
};

// =====================================================
// Modern Table Renderer
// =====================================================

function createModernTable(data, columns, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!data?.length) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px;">
                <div class="empty-state-icon"><i class="lucide-inbox"></i></div>
                <div class="empty-state-title">Veri bulunamadı</div>
            </div>
        `;
        return;
    }

    const table = document.createElement('table');
    
    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.label;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            if (col.render) {
                td.innerHTML = col.render(item, index);
            } else {
                td.textContent = item[col.key] ?? '-';
            }
            td.style.cssText = col.style || '';
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);
}

function getRankBadge(index) {
    if (index === 0) return '<span class="rank-badge gold">1</span>';
    if (index === 1) return '<span class="rank-badge silver">2</span>';
    if (index === 2) return '<span class="rank-badge bronze">3</span>';
    return `<span class="rank-badge default">${index + 1}</span>`;
}

// =====================================================
// Top Units Table
// =====================================================

export const renderTopUnitsTable = (data, containerId, totalEvents) => {
    const top15 = data.sort((a, b) => b.Count - a.Count).slice(0, 15);
    
    createModernTable(top15, [
        { label: '#', render: (_, i) => getRankBadge(i) },
        { label: 'Birim', key: 'Title' },
        { label: 'Kategori', key: 'Cat_TR' },
        { 
            label: 'Oran', 
            render: (item) => {
                const pct = totalEvents ? ((item.Count / totalEvents) * 100).toFixed(1) : 0;
                return `<span style="font-weight: 600;">${pct}%</span>`;
            }
        }
    ], containerId);
};

// =====================================================
// Top Stores Table
// =====================================================

export const renderTopStoresTable = (data, containerId, totalEvents) => {
    createModernTable(data, [
        { label: '#', render: (_, i) => getRankBadge(i) },
        { label: 'Mağaza', key: 'Title' },
        { label: 'Kategori', key: 'Cat_TR' },
        { 
            label: 'Oran',
            render: (item) => {
                const pct = ((item.Count / totalEvents) * 100).toFixed(1);
                return `${pct}%`;
            }
        }
    ], containerId);
};

// =====================================================
// Food Places Table
// =====================================================

export const renderFoodPlacesTable = (data, containerId, totalEvents) => {
    const top10 = data.sort((a, b) => b.Count - a.Count).slice(0, 10);
    
    createModernTable(top10, [
        { label: '#', render: (_, i) => getRankBadge(i) },
        { label: 'Mekan', key: 'Title' },
        { label: 'Kategori', key: 'Cat_TR' },
        { 
            label: 'Oran',
            render: (item) => {
                const pct = totalEvents > 0 ? ((item.Count / totalEvents) * 100).toFixed(1) : '0';
                return `${pct}%`;
            }
        }
    ], containerId);
};

// =====================================================
// Services Table
// =====================================================

export const renderServicesTable = (data, containerId, totalEvents) => {
    const top10 = data.sort((a, b) => b.Count - a.Count).slice(0, 10);
    
    createModernTable(top10, [
        { label: '#', render: (_, i) => getRankBadge(i) },
        { label: 'Hizmet', key: 'Title' },
        { label: 'Kategori', key: 'Cat_TR' },
        { 
            label: 'Oran',
            render: (item) => {
                const pct = totalEvents > 0 ? Math.ceil((item.Count / totalEvents) * 1000) / 10 : 0;
                return `${pct.toFixed(1)}%`;
            }
        }
    ], containerId);
};

// =====================================================
// Floors Table
// =====================================================

export const renderFloorsTable = (data, containerId) => {
    const sorted = data.sort((a, b) => parseFloat(b.kioskUsagePercent) - parseFloat(a.kioskUsagePercent));
    
    createModernTable(sorted, [
        { 
            label: 'Kat', 
            render: (item) => `<strong>${item.floor}. Kat</strong>`
        },
        { 
            label: 'Kiosk Kullanım',
            render: (item) => {
                const pct = parseFloat(item.kioskUsagePercent);
                return `<span style="font-weight: 600;">${pct}%</span>`;
            }
        },
        { 
            label: 'Birim Arama',
            render: (item) => `${item.unitSearchPercent}%`
        }
    ], containerId);
};

// =====================================================
// Kiosks Table
// =====================================================

export const renderKiosksTable = (data, containerId) => {
    const totalActions = data.reduce((sum, k) => sum + k.actions, 0);
    const sorted = data.map(item => ({
        ...item,
        percentage: ((item.actions / totalActions) * 100).toFixed(2)
    })).sort((a, b) => b.percentage - a.percentage);

    createModernTable(sorted, [
        { label: 'Kiosk ID', key: 'kiosk' },
        { label: 'Kat', key: 'floor' },
        { 
            label: 'Kullanım',
            render: (item) => {
                const pct = parseFloat(item.percentage);
                return `<span style="font-weight: 600;">${pct}%</span>`;
            }
        }
    ], containerId);
};

// =====================================================
// Touched Events (Legacy Support)
// =====================================================

export const renderTouchedEvents = (data, containerId) => {
    createModernTable(data, [
        { label: 'Seçilen Yer', key: 'label' },
        { label: 'Seçim Sayısı', key: 'nb_events' }
    ], containerId);
};

// =====================================================
// Data Processing Functions
// =====================================================

export async function categorizeTitlesWithJson(titles, jsonFilePath) {
    try {
        const response = await fetch(jsonFilePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const excelData = await response.json();
        const result = {};

        titles.forEach(title => {
            const matched = excelData.find(item => item.Title === title);
            if (matched?.Cat_TR) {
                if (!result[matched.Cat_TR]) result[matched.Cat_TR] = [];
                result[matched.Cat_TR].push({ id: matched.ID, title: matched.Title });
            }
        });

        return Object.entries(result).map(([category, items]) => ({
            label: category,
            nb_events: items.length
        }));
    } catch (error) {
        console.error('Categorization error:', error);
        return [];
    }
}

export async function summarizeTitlesWithDetails(titleCountMap, jsonFilePath, totalEvents) {
    try {
        const response = await fetch(jsonFilePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const jsonData = await response.json();
        const result = [];
        const highlighted = [];

        Object.entries(titleCountMap).forEach(([title, count]) => {
            const matched = jsonData.find(item => item.Title === title);
            if (matched) {
                const entry = {
                    Title: matched.Title,
                    Count: count,
                    Cat_TR: matched.Cat_TR || "Kategori Yok",
                    Description: matched.Description || "Açıklama Yok"
                };
                result.push(entry);

                if (["Stand,Premium", "Premium Stant"].includes(matched.Cat_TR)) {
                    highlighted.push(entry);
                }
            }
        });

        localStorage.setItem("highlightedEntries", JSON.stringify(highlighted));
        return result;
    } catch (error) {
        console.error('Summary error:', error);
        return [];
    }
}

export async function summarizeTopStoresByCategory(titleEventsMap, jsonFilePath) {
    try {
        const response = await fetch(jsonFilePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const jsonData = await response.json();
        const categoriesToInclude = [
            "Mağaza", "Giyim", "Ayakkabı & Çanta", "Aksesuar & Mücevher", "Elektronik", 
            "Çocuk", "Kozmetik & Sağlık", "Ev & Dekorasyon", "Lokum & Şekerleme", "Spor",
            "Market", "Kültür & Eğlence", "Stand", "Stant", "Stand,Premium", "Premium Stant", "Sahne"
        ];

        const results = [];
        Object.entries(titleEventsMap).forEach(([title, count]) => {
            const matched = jsonData.find(item => 
                item.Title === title && categoriesToInclude.includes(item.Cat_TR)
            );
            if (matched) {
                results.push({
                    Title: matched.Title,
                    Count: count,
                    Cat_TR: matched.Cat_TR,
                    Description: matched.Description || "Açıklama Yok"
                });
            }
        });

        return results.sort((a, b) => b.Count - a.Count).slice(0, 10);
    } catch (error) {
        console.error('Store summary error:', error);
        return [];
    }
}

export async function categorizeEventsByDayAndCategory(dailyData, jsonFilePath) {
    try {
        const response = await fetch(jsonFilePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const jsonData = await response.json();
        const categoriesToInclude = [
            "Mağaza", "Giyim", "Ayakkabı & Çanta", "Aksesuar & Mücevher", "Elektronik",
            "Çocuk", "Kozmetik & Sağlık", "Ev & Dekorasyon", "Lokum & Şekerleme", "Spor",
            "Market", "Kültür & Eğlence", "Hizmet", "Otopark", "Stand", "Stant", 
            "Stand,Premium", "Premium Stant", "Sahne", "Wc", "Yiyecek", "Atm"
        ];

        const categorizedData = {};

        Object.entries(dailyData).forEach(([date, events]) => {
            const dailyCategories = {};
            events.forEach(event => {
                const matched = jsonData.find(item => 
                    item.Title === event.label && categoriesToInclude.includes(item.Cat_TR)
                );
                if (matched) {
                    dailyCategories[matched.Cat_TR] = (dailyCategories[matched.Cat_TR] || 0) + event.total_nb_events;
                }
            });
            categorizedData[date] = dailyCategories;
        });

        return categorizedData;
    } catch (error) {
        console.error('Daily categorization error:', error);
        return {};
    }
}

export async function summarizeTopFoodStoresByCategory(titlesWithCounts, jsonFilePath) {
    try {
        const response = await fetch(jsonFilePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const jsonData = await response.json();
        const combined = titlesWithCounts.reduce((acc, item) => {
            acc[item.eventName] = (acc[item.eventName] || 0) + item.nbEvents;
            return acc;
        }, {});

        const categories = ["Restoran & Cafe", "Fast Food", "Yiyecek"];
        const results = [];

        Object.entries(combined).forEach(([name, count]) => {
            const matched = jsonData.find(item => 
                item.Title === name && categories.includes(item.Cat_TR)
            );
            if (matched) {
                results.push({
                    Title: matched.Title,
                    Count: count,
                    Cat_TR: matched.Cat_TR,
                    Description: matched.Description || "Açıklama Yok"
                });
            }
        });

        return results.sort((a, b) => b.Count - a.Count).slice(0, 10);
    } catch (error) {
        console.error('Food summary error:', error);
        return [];
    }
}

export async function summarizeTopServicesByCategory(titlesWithCounts, jsonFilePath) {
    try {
        const response = await fetch(jsonFilePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const jsonData = await response.json();
        const combined = titlesWithCounts.reduce((acc, item) => {
            acc[item.eventName] = (acc[item.eventName] || 0) + item.nbEvents;
            return acc;
        }, {});

        const categories = ["Hizmetler", "Hizmet Mağazaları", "Hizmet", "Otopark", "Wc", "WC", "Yiyecek", "Giriş", "Atm", "Diğer"];
        const results = [];

        Object.entries(combined).forEach(([name, count]) => {
            const matched = jsonData.find(item => 
                item.Title === name && categories.includes(item.Cat_TR)
            );
            if (matched) {
                results.push({
                    Title: matched.Title,
                    Count: count,
                    Cat_TR: matched.Cat_TR,
                    Description: matched.Description || "Açıklama Yok"
                });
            }
        });

        // Name corrections
        const corrections = {
            "Car Park (Hall 7-8)": "Otopark (Hall 7-8)",
            "Entrance (Hall 11A)": "Giriş (Hall 11A)",
            "Entrance (Hall 11)": "Giriş (Hall 11)",
            "Car Park Batı": "Otopark Batı",
            "Entrance (Atrium)": "Giriş (Atrium)",
            "Mescid - Masjid": "Mescid",
            "Medya Köşesi - Media Corner": "Medya Köşesi"
        };

        return results
            .map(item => ({
                ...item,
                Title: corrections[item.Title] || item.Title
            }))
            .sort((a, b) => b.Count - a.Count)
            .slice(0, 10);
    } catch (error) {
        console.error('Services summary error:', error);
        return [];
    }
}

// =====================================================
// Campaign Data Processing
// =====================================================

export function cleanCampaignData(data) {
    const floorMap = {
        "-3": "-3. kat", "-2": "-2. kat", "-1": "-1. kat",
        "0": "0. kat", "1": "1. kat", "2": "2. kat", "3": "3. kat"
    };

    return data.map(item => {
        const label = item.label;
        const match = label.match(/k-?(\d+)/i);
        let number = match ? parseInt(match[1], 10) : null;

        let floorKey;
        if (label.includes('-')) {
            floorKey = number >= 300 ? "-3" : number >= 200 ? "-2" : "-1";
        } else {
            floorKey = number < 100 ? "0" : number < 200 ? "1" : number < 300 ? "2" : "3";
        }

        return {
            kiosk: label,
            actions: item.nb_actions,
            floor: floorMap[floorKey] || "Bilinmeyen"
        };
    });
}

export function getTotalActionsByFloor(data) {
    const totals = { "-3": 0, "-2": 0, "-1": 0, "0": 0, "1": 0, "2": 0, "3": 0 };

    data.forEach(item => {
        const match = item.label.match(/k-?(\d+)/i);
        let number = match ? parseInt(match[1], 10) : null;

        let floorKey;
        if (item.label.includes('-')) {
            floorKey = number >= 300 ? "-3" : number >= 200 ? "-2" : "-1";
        } else {
            floorKey = number < 100 ? "0" : number < 200 ? "1" : number < 300 ? "2" : "3";
        }

        if (totals[floorKey] !== undefined) {
            totals[floorKey] += item.nb_actions;
        }
    });

    return totals;
}

export async function findEventFloor(titlesWithCounts, filepath) {
    try {
        const response = await fetch(filepath);
        const floorData = await response.json();

        const eventFloorMap = floorData.reduce((acc, item) => {
            acc[item.Title.trim()] = item.Floor;
            return acc;
        }, {});

        const results = titlesWithCounts
            .map(item => ({
                eventName: item.eventName,
                floor: eventFloorMap[item.eventName.trim()] || "Bilinmiyor",
                nbEvents: item.nbEvents
            }))
            .filter(item => item.floor !== "Bilinmiyor");

        return results.reduce((acc, item) => {
            acc[item.floor] = (acc[item.floor] || 0) + item.nbEvents;
            return acc;
        }, {});
    } catch (error) {
        console.error('Floor finding error:', error);
        return {};
    }
}

// =====================================================
// Categorized Units
// =====================================================

export async function categorizeUnitsWithJson(titleCountMap, jsonFilePath) {
    try {
        const response = await fetch(jsonFilePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const categorizedData = await response.json();
        const results = {};

        Object.entries(categorizedData).forEach(([category, units]) => {
            results[category] = 0;
            units.forEach(unit => {
                if (titleCountMap[unit]) {
                    results[category] += titleCountMap[unit];
                }
            });
        });

        return Object.entries(results)
            .filter(([, count]) => count > 0)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);
    } catch (error) {
        console.error('Unit categorization error:', error);
        return [];
    }
}

export const renderCategorizedUnitsList = (data, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!data?.length) {
        container.innerHTML = '';
        return;
    }

    const total = data.reduce((sum, item) => sum + item.count, 0);
    const top5 = data.slice(0, 5);

    container.innerHTML = `
        <div style="padding: 16px;">
            <h4 style="margin-bottom: 12px; color: var(--color-text-primary); font-weight: 600;">
                Top 5 İlgi Gösterilen Ürün Grupları
            </h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${top5.map((item, i) => {
                    const pct = ((item.count / total) * 100).toFixed(1);
                    return `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            ${getRankBadge(i)}
                            <span style="flex: 1; color: var(--color-text-secondary);">${item.category}</span>
                            <span style="font-weight: 600; color: var(--color-accent-purple);">${pct}%</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
};
