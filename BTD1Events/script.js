// API Base URL
const API_BASE = '/api/btd1-events';

// UI Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const infoEl = document.getElementById('info');
const eventsTable = document.getElementById('eventsTable');
const eventsTableBody = document.getElementById('eventsTableBody');
const statsContainer = document.getElementById('statsContainer');
const statsCards = document.getElementById('statsCards');

// Utility Functions
function showLoading() {
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    eventsTable.style.display = 'none';
    statsContainer.style.display = 'none';
}

function hideLoading() {
    loadingEl.style.display = 'none';
}

function showError(message) {
    hideLoading();
    errorEl.textContent = `❌ Lỗi: ${message}`;
    errorEl.style.display = 'block';
}

function showInfo(message) {
    infoEl.textContent = message;
    infoEl.style.display = 'block';
}

function clearResults() {
    eventsTableBody.innerHTML = '';
    statsCards.innerHTML = '';
    errorEl.style.display = 'none';
    infoEl.style.display = 'none';
}

// Format datetime for display
function formatDatetime(datetime) {
    if (!datetime) return 'N/A';
    
    try {
        const date = new Date(datetime);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (e) {
        return datetime;
    }
}

// Get event status emoji
function getEventEmoji(event) {
    switch (event?.toUpperCase()) {
        case 'RUNNING': return '🟢';
        case 'PAUSE': return '🟡';
        case 'PENDING': return '🔵';
        case 'STOP': return '🔴';
        case 'COMPLETE': return '✅';
        default: return '⚪';
    }
}

// API Call Functions
async function apiCall(endpoint, options = {}) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Unknown error');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        showError(error.message);
        throw error;
    } finally {
        hideLoading();
    }
}

// Load all events
async function loadAllEvents() {
    try {
        clearResults();
        
        const result = await apiCall('/');
        
        displayEvents(result.data);
        showInfo(`✅ Đã tải ${result.count} events từ ${result.source}`);
        
    } catch (error) {
        console.error('Error loading all events:', error);
    }
}

// Search by WS number
async function searchByWS() {
    try {
        const wsNumber = document.getElementById('wsInput').value.trim();
        
        if (!wsNumber) {
            showError('Vui lòng nhập WS number');
            return;
        }
        
        clearResults();
        
        const result = await apiCall(`/ws/${encodeURIComponent(wsNumber)}`);
        
        displayEvents(result.data);
        showInfo(`✅ Tìm thấy ${result.count} events cho WS: ${result.wsNumber}`);
        
    } catch (error) {
        console.error('Error searching by WS:', error);
    }
}

// Search by date range
async function searchByDateRange() {
    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            showError('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            showError('Ngày bắt đầu không thể sau ngày kết thúc');
            return;
        }
        
        clearResults();
        
        const result = await apiCall(`/date-range?startDate=${startDate}&endDate=${endDate}`);
        
        displayEvents(result.data);
        showInfo(`✅ Tìm thấy ${result.count} events trong khoảng thời gian đã chọn`);
        
    } catch (error) {
        console.error('Error searching by date range:', error);
    }
}

// Load statistics
async function loadStats() {
    try {
        clearResults();
        
        const result = await apiCall('/stats');
        
        displayStats(result.data);
        showInfo(`📊 Thống kê từ ${result.source}`);
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Display events in table
function displayEvents(events) {
    eventsTableBody.innerHTML = '';
    
    if (!events || events.length === 0) {
        eventsTableBody.innerHTML = '<tr><td colspan="4">Không có dữ liệu</td></tr>';
    } else {
        events.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.UID || 'N/A'}</td>
                <td><strong>${event.WS || 'N/A'}</strong></td>
                <td>${formatDatetime(event.Datetime)}</td>
                <td>
                    <span class="event-badge event-${event.Event?.toLowerCase() || 'unknown'}">
                        ${getEventEmoji(event.Event)} ${event.Event || 'N/A'}
                    </span>
                </td>
            `;
            eventsTableBody.appendChild(row);
        });
    }
    
    eventsTable.style.display = 'table';
    statsContainer.style.display = 'none';
}

// Display statistics
function displayStats(stats) {
    statsCards.innerHTML = '';
    
    if (!stats || stats.length === 0) {
        statsCards.innerHTML = '<p>Không có dữ liệu thống kê</p>';
    } else {
        stats.forEach(stat => {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <div class="stat-header">
                    <span class="stat-event">
                        ${getEventEmoji(stat.Event)} ${stat.Event || 'Unknown'}
                    </span>
                </div>
                <div class="stat-body">
                    <div class="stat-count">${stat.Count || 0}</div>
                    <div class="stat-details">
                        <small>
                            Đầu tiên: ${formatDatetime(stat.FirstEvent)}<br>
                            Gần nhất: ${formatDatetime(stat.LastEvent)}
                        </small>
                    </div>
                </div>
            `;
            statsCards.appendChild(card);
        });
    }
    
    statsContainer.style.display = 'block';
    eventsTable.style.display = 'none';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 BTD1 Events Viewer initialized');
    
    // Set default date range (last 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    document.getElementById('endDate').value = now.toISOString().slice(0, 16);
    document.getElementById('startDate').value = weekAgo.toISOString().slice(0, 16);
    
    // Load initial data
    loadAllEvents();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        loadAllEvents();
    }
    if (e.key === 'Enter' && e.target.id === 'wsInput') {
        searchByWS();
    }
});