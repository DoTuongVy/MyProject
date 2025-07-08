// ====================================================================================================================================
// FILE: Bieudo.js
// MÔ TẢ: JavaScript cho hệ thống biểu đồ sản xuất nhà máy 1
// ====================================================================================================================================

console.log('🚀 Khởi tạo hệ thống biểu đồ sản xuất...');

// Đăng ký plugin datalabels
Chart.register(ChartDataLabels);

// Biến toàn cục
let currentChartData = null;
let pieChart = null;
let quantityChart = null;  // Thêm dòng này
let macaChart = null;      // Thêm dòng này
let timeChart = null;
let stopReasonChart = null; 

// ====================================================================================================================================
// KHỞI TẠO HỆ THỐNG
// ====================================================================================================================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('🎯 DOM Content Loaded - Bắt đầu khởi tạo');
    
    // Kiểm tra trang hiện tại
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    console.log('📄 Current page detected:', currentPage);
    console.log('📍 Full pathname:', window.location.pathname);
    
    if (currentPage === 'dashboard.html' || currentPage === '') {
        console.log('✅ Vào Dashboard branch');
        initDashboard();
    } else if (currentPage === 'baocaoin.html') {
        console.log('✅ Vào Baocaoin branch');
        initBaoCaoIn();
    } else if (currentPage === 'baocaogmc.html') {
        console.log('✅ Vào Baocaogmc branch');
        initBaoCaoGMC();
    } else {
        console.log('❌ Không match page nào:', currentPage);
    }
});
// ====================================================================================================================================
// DASHBOARD FUNCTIONS
// ====================================================================================================================================

// Khởi tạo Dashboard
async function initDashboard() {
    try {
        showLoading(true);
        await loadModules();
        showLoading(false);
    } catch (error) {
        console.error('Lỗi khởi tạo dashboard:', error);
        showLoading(false);
        showNotification('Lỗi khi tải dashboard', 'error');
    }
}

// Tải danh sách modules sản xuất nhà máy 1
async function loadModules() {
    try {
        console.log('🔍 Bắt đầu gọi API modules...');
        
        // Đảm bảo có await
        const response = await fetch('/api/bieu-do/modules/nhamay1');
        
        if (!response.ok) {
            throw new Error('Không thể tải danh sách modules');
        }
        
        const modules = await response.json();
        console.log('📦 Dữ liệu nhận được:', modules);
        
        renderModules(modules);
        
    } catch (error) {
        console.error('Lỗi khi tải modules:', error);
        // Fallback data như cũ
        const fallbackModules = [
            {
                id: 'innm1',
                name: 'Báo cáo In',
                description: 'Theo dõi sản xuất in offset',
                icon: 'fas fa-print',
                url: 'Baocaoin.html',
                color: 'module-in'
            },
            {
                id: 'gmcnm1',
                name: 'Báo cáo GMC',
                description: 'Theo dõi cắt giấy GMC',
                icon: 'fas fa-cut',
                url: 'Baocaogmc.html',
                color: 'module-gmc'
            }
        ];
        renderModules(fallbackModules);
    }
}

// Render modules ra dashboard
function renderModules(modules) {
    const container = document.getElementById('moduleContainer');
    if (!container) return;
    
    container.innerHTML = modules.map(module => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card module-card ${module.color}" onclick="navigateToModule('${module.url}')">
                <div class="card-body">
                    <div class="module-icon">
                        <i class="${module.icon}"></i>
                    </div>
                    <h5>${module.name}</h5>
                    <p>${module.description}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    // Thêm animation
    setTimeout(() => {
        container.querySelectorAll('.module-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100);
        });
    }, 100);

    // Ngay đầu hàm renderModules()
console.log('🖼️ Render modules:', modules);
console.log('🎯 Container element:', container);

}

// Điều hướng đến module
function navigateToModule(url) {
    window.location.href = url;
}

// ====================================================================================================================================
// BÁO CÁO IN FUNCTIONS
// ====================================================================================================================================

// Khởi tạo báo cáo In
function initBaoCaoIn() {
    setupInFilters();
    setupInEvents();
    setDefaultDates();
}

// Thiết lập bộ lọc báo cáo In
function setupInFilters() {
    loadMachineList();
}

// Thiết lập events cho báo cáo In
function setupInEvents() {
    const btnViewReport = document.getElementById('btnViewReport');
    const btnReset = document.getElementById('btnReset');
    
    if (btnViewReport) {
        btnViewReport.addEventListener('click', handleViewInReport);
    }
    
    if (btnReset) {
        btnReset.addEventListener('click', handleResetFilters);
    }


    const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');

if (fromDate) {
    fromDate.addEventListener('focus', function() {
        if (!this.value) {
            const today = new Date().toISOString().split('T')[0];
            this.value = today;
        }
    });
}

if (toDate) {
    toDate.addEventListener('focus', function() {
        if (!this.value) {
            const today = new Date().toISOString().split('T')[0];
            this.value = today;
        }
    });
}


}



async function loadMachineList() {
    try {
        const response = await fetch('/api/machines/list?module_id=innm1');
        if (response.ok) {
            const machines = await response.json();
            const maySelect = document.getElementById('maySelect');
            if (maySelect) {
                maySelect.innerHTML = '<option value="">Tất cả máy</option>';
                machines.forEach(machine => {
                    maySelect.innerHTML += `<option value="${machine.name}">${machine.name}</option>`;
                });
            }
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách máy:', error);
    }
}


// Thiết lập ngày mặc định
function setDefaultDates() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    const fromDate = document.getElementById('fromDate');
    const toDate = document.getElementById('toDate');
    
    if (fromDate) {
        fromDate.value = todayString;
    }
    
    if (toDate) {
        toDate.value = todayString;
    }
}

// Xử lý xem báo cáo In
async function handleViewInReport() {
    try {
        showLoading(true);
        // Đảm bảo reportSection luôn có cấu trúc HTML đúng
ensureReportSectionStructure();
// Reset dữ liệu cũ và UI trước khi lọc mới
currentChartData = null;
destroyAllCharts();
hideReportSection();
        
        // Thu thập điều kiện lọc
        const filters = collectFilters();
        
        // Validate filters
        if (!validateFilters(filters)) {
            showLoading(false);
            return;
        }
        
        // Gọi API lấy dữ liệu
        const reportData = await fetchInReportData(filters);
        
        // Hiển thị báo cáo
        displayInReport(reportData, filters);
        
        showLoading(false);
        
    } catch (error) {
        console.error('Lỗi khi xem báo cáo In:', error);
        showLoading(false);
        hideReportSection();
        showNotification('Lỗi khi tải báo cáo: ' + error.message, 'error');
    }
}

// Thu thập điều kiện lọc
function collectFilters() {
    return {
        ws: document.getElementById('wsInput')?.value?.trim() || '',
        maca: (() => {
            const caSelect = document.getElementById('caSelect');
            if (!caSelect) return '';
            
            const selectedValue = caSelect.value;
            console.log('🔍 Giá trị mã ca từ select:', selectedValue);
            
            // Chỉ return giá trị nếu thực sự được chọn (không phải "Tất cả ca")
            if (selectedValue && selectedValue !== '') {
                return selectedValue;
            }
            
            return '';
        })(),
        may: document.getElementById('maySelect')?.value || '',
        tuan: document.getElementById('tuanSelect')?.value || '',
        fromDate: document.getElementById('fromDate')?.value || '',
        toDate: document.getElementById('toDate')?.value || ''
    };
}

// Validate điều kiện lọc
function validateFilters(filters) {
    // Bắt buộc phải có từ ngày và đến ngày
    if (!filters.fromDate || !filters.toDate) {
        showNotification('Vui lòng chọn từ ngày và đến ngày', 'warning');
        return false;
    }
    
    // Kiểm tra khoảng thời gian hợp lệ
    const from = new Date(filters.fromDate);
    const to = new Date(filters.toDate);
    
    if (from > to) {
        showNotification('Ngày bắt đầu không được lớn hơn ngày kết thúc', 'warning');
        return false;
    }
    
    return true;
}

// Gọi API lấy dữ liệu báo cáo In
async function fetchInReportData(filters) {
    try {
        const params = new URLSearchParams();
        
        if (filters.fromDate) params.append('fromDate', filters.fromDate);
        if (filters.toDate) params.append('toDate', filters.toDate);
        if (filters.ws) params.append('ws', filters.ws);
        if (filters.maca) params.append('ca', filters.maca);
        if (filters.may) params.append('may', filters.may);
        if (filters.tuan) params.append('tuan', filters.tuan);
        
        const response = await fetch(`/api/bieu-do/in/chart-data?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu báo cáo');
        }
        
        const rawData = await response.json();
        console.log('📥 Raw data từ API:', rawData);
        
        // Xử lý dữ liệu thành format đúng
        const processedData = processApiData(rawData);
        console.log('🔄 Processed data:', processedData);
        
        return processedData;
        
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        throw error;
    }
}



// Hàm xử lý dữ liệu từ API thành format mong muốn
function processApiData(apiData) {
    console.log('🔄 Bắt đầu xử lý dữ liệu API:', apiData);
    
    // Trường hợp 1: Dữ liệu là mảng các record (như bảng bạn gửi)
    if (Array.isArray(apiData)) {
        return processArrayData(apiData);
    }
    
    // Trường hợp 2: Dữ liệu đã được group sẵn
    if (apiData.totalPaper !== undefined || apiData.shiftData !== undefined) {
        return apiData;
    }
    
    // Trường hợp 3: Dữ liệu có cấu trúc khác
    if (apiData.data && Array.isArray(apiData.data)) {
        return processArrayData(apiData.data);
    }
    
    console.warn('⚠️ Không nhận diện được cấu trúc dữ liệu, sử dụng dữ liệu gốc');
    return apiData;
}



// Xử lý dữ liệu dạng mảng (mỗi phần tử là 1 record)
function processArrayData(records) {
    console.log('📊 Xử lý mảng dữ liệu:', records);
    
    // Group theo ca
    const shiftGroups = {};
    let totalPaper = 0;
    let totalWaste = 0;
    
    records.forEach(record => {
        // Lấy thông tin ca - có thể là "Mã ca", "ca", "shift", etc.
        const shift = record['Mã ca'] || record['ca'] || record['shift'] || record.shift || 'Unknown';
        
        // Lấy số lượng - có thể là "Tổng số lượng", "totalPaper", "so_luong", etc.
        const paper = parseFloat(record['Tổng số lượng'] || record['totalPaper'] || record['so_luong'] || record.paper || 0);
        
        // Lấy phế liệu - có thể là "Tổng phế liệu", "totalWaste", "phe_lieu", etc.
        const waste = parseFloat(record['Tổng phế liệu'] || record['totalWaste'] || record['phe_lieu'] || record.waste || 0);
        
        console.log(`📋 Record: Ca=${shift}, Paper=${paper}, Waste=${waste}`);
        
        // Lấy thông tin máy
const may = record['Máy'] || record['may'] || record['machine'] || record.may || '';

// Tổng hợp theo ca
if (!shiftGroups[shift]) {
    shiftGroups[shift] = { shift, paper: 0, waste: 0, may: may };
}

shiftGroups[shift].paper += paper;
shiftGroups[shift].waste += waste;
// Cập nhật thông tin máy (nếu có nhiều máy trong cùng ca, lấy máy cuối)
if (may) {
    shiftGroups[shift].may = may;
}
        
        // Tổng cộng
        totalPaper += paper;
        totalWaste += waste;
    });
    
    // Chuyển đổi thành mảng
    const shiftData = Object.values(shiftGroups);
    
    console.log('📈 Kết quả xử lý:', {
        totalPaper,
        totalWaste,
        shiftData,
        shiftCount: shiftData.length
    });
    
    return {
        totalPaper,
        totalWaste,
        shiftData,
        // Thêm dữ liệu thời gian mặc định nếu không có
        timeData: {
            totalTime: 480, // 8 giờ mặc định
            setupTime: 30,  // 30 phút canh máy mặc định
            otherTime: 0    // Không có thời gian dừng máy
        },
        stopReasons: [] // Không có lý do dừng máy
    };
}



// Hiển thị báo cáo In
function displayInReport(data, filters) {
    console.log('📋 Hiển thị báo cáo với dữ liệu:', data);
    console.log('📋 Với filters:', filters);
    console.log('📋 Số ca trong dữ liệu:', data.shiftData ? data.shiftData.length : 0);
    console.log('📋 Mã ca filter:', filters.maca);
    
    
    // Kiểm tra dữ liệu có hợp lệ không
if (!data || ((!data.totalPaper || data.totalPaper === 0) && 
(!data.totalWaste || data.totalWaste === 0) && 
(!data.shiftData || data.shiftData.length === 0))) {

// Hiển thị section báo cáo với thông báo không có dữ liệu
const reportSection = document.getElementById('reportSection');
if (reportSection) {
    reportSection.style.display = 'block';
    reportSection.classList.add('slide-up');
}

// Reset tất cả displays về 0
displaySummaryStats({ totalPaper: 0, totalWaste: 0 }, filters);
displayProgressBar({ totalPaper: 0, totalWaste: 0 }, filters);

// Hiển thị thông báo trong phần phân tích
const analysisContainer = document.getElementById('quantityAnalysis');
if (analysisContainer) {
    analysisContainer.innerHTML = `
        <div class="text-center text-muted p-4">
            <i class="fas fa-search fa-3x text-muted mb-4"></i>
            <h4 class="text-muted">Không có dữ liệu phù hợp</h4>
            <p class="text-muted">Không tìm thấy báo cáo nào phù hợp với điều kiện lọc đã chọn.</p>
            <p class="text-muted">Vui lòng thử:</p>
            <ul class="list-unstyled text-muted">
                <li>• Kiểm tra lại mã ca đã chọn</li>
                <li>• Thay đổi khoảng thời gian</li>
                <li>• Bỏ bớt điều kiện lọc</li>
            </ul>
        </div>
    `;
}

// Tạo biểu đồ trống
const totalChartCanvas = document.getElementById('quantityChart');
const shiftChartCanvas = document.getElementById('macaChart');
const timeChartCanvas = document.getElementById('timeChart');

if (totalChartCanvas) quantityChart = createEmptyChart(totalChartCanvas, 'Không có dữ liệu');
if (shiftChartCanvas) macaChart = createEmptyChart(shiftChartCanvas, 'Không có dữ liệu ca');
if (timeChartCanvas) timeChart = createEmptyChart(timeChartCanvas, 'Không có dữ liệu thời gian');

// Hiển thị bảng chi tiết trống
displayDetailTable({ totalPaper: 0, totalWaste: 0, shiftData: [] }, filters);

return;
}

    
    // Hiển thị section báo cáo
    const reportSection = document.getElementById('reportSection');
    if (reportSection) {
        reportSection.style.display = 'block';
        reportSection.classList.add('slide-up');
    }
    
    // Hiển thị tóm tắt số liệu
displaySummaryStats(data, filters);

// Hiển thị thống kê thời gian
displayTimeStats(data, filters);
    
    // Hiển thị progress bar
    displayProgressBar(data, filters);
    
    // Hiển thị biểu đồ số lượng sản xuất
    displayQuantityCharts(data, filters);
    
    // Hiển thị phân tích sản xuất (bảng)
    displayQuantityAnalysis(data, filters);;
    
    // Hiển thị biểu đồ thời gian
    displayTimeCharts(data, filters)
    
    // Hiển thị phân tích thời gian (lý do dừng máy)
    displayTimeAnalysis(data, filters);

    // Hiển thị bảng chi tiết
    displayDetailTable(data, filters);
    
    // Lưu dữ liệu hiện tại
    currentChartData = data;
}




// Hiển thị thông tin báo cáo
function displayReportInfo(data) {
    const customerName = document.getElementById('customerName');
    const productCode = document.getElementById('productCode');
    
    if (customerName) {
        customerName.textContent = data.customer || '-';
    }
    
    if (productCode) {
        productCode.textContent = data.product || '-';
    }
}

// Hiển thị điều kiện lọc
function displayFilterInfo(filters) {
    const filterInfo = document.getElementById('filterInfo');
    if (!filterInfo) return;
    
    const filterItems = [];
    
    if (filters.ws) filterItems.push(`<strong>WS:</strong> ${filters.ws}`);
    if (filters.maca) filterItems.push(`<strong>Ca:</strong> ${filters.maca}`);
    if (filters.may) filterItems.push(`<strong>Máy:</strong> ${filters.may}`);
    // if (filters.tuan) filterItems.push(`<strong>Tuần:</strong> ${filters.tuan}`);
    if (filters.fromDate && filters.toDate) {
        filterItems.push(`<strong>Thời gian:</strong> ${formatDate(filters.fromDate)} - ${formatDate(filters.toDate)}`);
    }
    
    if (filterItems.length === 0) {
        filterItems.push('<em>Không có điều kiện lọc</em>');
    }
    
    filterInfo.innerHTML = filterItems.join('<br>');
}

// Hiển thị tóm tắt số liệu
function displaySummaryStats(data, filters) {
    // Kiểm tra dữ liệu có hợp lệ không
    if (!data || (data.totalPaper === 0 && data.totalWaste === 0)) {
        const totalPaper = document.getElementById('totalPaper');
        const totalWaste = document.getElementById('totalWaste');
        const totalData = document.getElementById('totalData');
        
        if (totalPaper) totalPaper.textContent = '0';
        if (totalWaste) totalWaste.textContent = '0';
        if (totalData) totalData.textContent = '0';
        return;
    }

    // Nếu lọc theo mã ca cụ thể, chỉ hiển thị số liệu của ca đó
    let displayPaper = data.totalPaper || 0;
let displayWaste = data.totalWaste || 0;

if (filters && filters.maca && data.shiftData) {
    const shiftData = data.shiftData.find(shift => shift.shift === filters.maca);
    if (shiftData) {
        displayPaper = shiftData.paper || 0;
        displayWaste = shiftData.waste || 0;
    } else {
        // Không tìm thấy dữ liệu cho mã ca này - reset về 0
        displayPaper = 0;
        displayWaste = 0;
    }
}

    const totalPaper = document.getElementById('totalPaper');
    const totalWaste = document.getElementById('totalWaste');
    const totalData = document.getElementById('totalData');
    
    if (totalPaper) {
        totalPaper.textContent = formatNumber(displayPaper);
    }
    
    if (totalWaste) {
        totalWaste.textContent = formatNumber(displayWaste);
    }
    
    if (totalData) {
        totalData.textContent = formatNumber(displayPaper + displayWaste);
    }
}



// Hiển thị thống kê thời gian
function displayTimeStats(data, filters) {
    // Tính thời gian dừng máy
    const stopTime = data.stopReasons ? 
        data.stopReasons.reduce((sum, reason) => sum + (reason.duration || 0), 0) : 0;
    
    // Tính thời gian làm việc = Tg kết thúc - tg bắt đầu - tg dừng máy
const totalWorkTime = data.timeData?.totalTime || 0;
const setupTime = data.timeData?.setupTime || 0;
const workTime = Math.max(0, totalWorkTime - setupTime - stopTime);

// Tổng thời gian = thời gian làm việc + thời gian dừng máy + thời gian canh máy
const totalTime = workTime + stopTime + setupTime;
    
    // Lọc theo mã ca nếu có
    let displayWorkTime = workTime;
    let displayStopTime = stopTime;
    let displayTotalTime = totalTime;
    
    if (filters && filters.maca && data.shiftData) {
        const shiftData = data.shiftData.find(shift => shift.shift === filters.maca);
        if (shiftData) {
            const totalPaper = data.totalPaper || 0;
            const totalWaste = data.totalWaste || 0;
            const grandTotal = totalPaper + totalWaste;
            const shiftTotal = (shiftData.paper || 0) + (shiftData.waste || 0);
            
            if (grandTotal > 0) {
                const ratio = shiftTotal / grandTotal;
                displayWorkTime = Math.round(workTime * ratio);
                displayStopTime = Math.round(stopTime * ratio);
                const displaySetupTime = Math.round(setupTime * ratio);
                displayTotalTime = displayWorkTime + displayStopTime + displaySetupTime;
            }
        }
    }
    
    // Cập nhật display
    const totalTimeEl = document.getElementById('totalTimeDisplay');
    const workTimeEl = document.getElementById('workTimeDisplay');
    const stopTimeEl = document.getElementById('stopTimeDisplay');
    
    if (totalTimeEl) totalTimeEl.textContent = formatDuration(displayTotalTime);
    if (workTimeEl) workTimeEl.textContent = formatDuration(displayWorkTime);
    if (stopTimeEl) stopTimeEl.textContent = formatDuration(displayStopTime);
    
    // Cập nhật progress bar thời gian
    displayTimeProgressBar(displayWorkTime, displayStopTime, displayTotalTime);
}

// Hiển thị progress bar thời gian
// Hiển thị progress bar thời gian
function displayTimeProgressBar(workTime, stopTime, totalTime) {
    // Tính tổng cho thanh tiến độ = chỉ gồm thời gian làm việc + thời gian dừng máy
    const progressTotal = workTime + stopTime;
    
    if (progressTotal === 0) {
        const workProgress = document.getElementById('workTimeProgress');
        const stopProgress = document.getElementById('stopTimeProgress');
        const workPercentSpan = document.getElementById('workTimePercent');
        const stopPercentSpan = document.getElementById('stopTimePercent');
        
        if (workProgress) workProgress.style.width = '0%';
        if (stopProgress) stopProgress.style.width = '0%';
        if (workPercentSpan) workPercentSpan.textContent = '0%';
        if (stopPercentSpan) stopPercentSpan.textContent = '0%';
        return;
    }
    
    const workPercent = (workTime / progressTotal) * 100;
    const stopPercent = (stopTime / progressTotal) * 100;
    
    const workProgress = document.getElementById('workTimeProgress');
    const stopProgress = document.getElementById('stopTimeProgress');
    const workPercentSpan = document.getElementById('workTimePercent');
    const stopPercentSpan = document.getElementById('stopTimePercent');
    
    if (workProgress) {
        workProgress.style.width = workPercent + '%';
        workProgress.setAttribute('aria-valuenow', workPercent);
    }
    
    if (stopProgress) {
        stopProgress.style.width = stopPercent + '%';
        stopProgress.setAttribute('aria-valuenow', stopPercent);
    }
    
    if (workPercentSpan) {
        workPercentSpan.textContent = workPercent.toFixed(1) + '%';
    }
    
    if (stopPercentSpan) {
        stopPercentSpan.textContent = stopPercent.toFixed(1) + '%';
    }
}




// Hiển thị progress bar
function displayProgressBar(data, filters) {
    // Nếu lọc theo mã ca cụ thể, chỉ tính tổng của ca đó
let totalPaper = data.totalPaper || 0;
let totalWaste = data.totalWaste || 0;

if (filters && filters.maca && data.shiftData) {
    const shiftData = data.shiftData.find(shift => shift.shift === filters.maca);
    if (shiftData) {
        totalPaper = shiftData.paper || 0;
        totalWaste = shiftData.waste || 0;
    }
}

const total = totalPaper + totalWaste;
    
    if (total === 0) {
        // Reset progress bar về 0
        const paperProgress = document.getElementById('paperProgress');
        const wasteProgress = document.getElementById('wasteProgress');
        const paperPercentSpan = document.getElementById('paperPercent');
        const wastePercentSpan = document.getElementById('wastePercent');
        
        if (paperProgress) paperProgress.style.width = '0%';
        if (wasteProgress) wasteProgress.style.width = '0%';
        if (paperPercentSpan) paperPercentSpan.textContent = '0%';
        if (wastePercentSpan) wastePercentSpan.textContent = '0%';
        return;
    }
    
    if (total === 0) return;
    
    const paperPercent = (totalPaper / total) * 100;
const wastePercent = (totalWaste / total) * 100;
    
    const paperProgress = document.getElementById('paperProgress');
    const wasteProgress = document.getElementById('wasteProgress');
    const paperPercentSpan = document.getElementById('paperPercent');
    const wastePercentSpan = document.getElementById('wastePercent');
    
    if (paperProgress) {
        paperProgress.style.width = paperPercent + '%';
        paperProgress.setAttribute('aria-valuenow', paperPercent);
    }
    
    if (wasteProgress) {
        wasteProgress.style.width = wastePercent + '%';
        wasteProgress.setAttribute('aria-valuenow', wastePercent);
    }
    
    if (paperPercentSpan) {
        paperPercentSpan.textContent = paperPercent.toFixed(1) + '%';
    }
    
    if (wastePercentSpan) {
        wastePercentSpan.textContent = wastePercent.toFixed(1) + '%';
    }
}

// Hiển thị biểu đồ tròn
function displayPieChart(data) {
    // Destroy chart cũ trước khi tạo mới
    if (pieChart) {
        pieChart.destroy();
        pieChart = null;
    }
    
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            elements: {
                arc: {
                    hoverOffset: 0
                }
            },
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${formatNumber(context.parsed)} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
}




function displayQuantityCharts(data, filters) {
    console.log('🎯 Hiển thị biểu đồ số lượng sản xuất với filters:', filters);
    
    // Destroy chart cũ
    if (quantityChart) {
        quantityChart.destroy();
        quantityChart = null;
    }
    if (macaChart) {
        macaChart.destroy();
        macaChart = null;
    }
    
    // Lấy 2 canvas có sẵn
    const totalChartCanvas = document.getElementById('quantityChart');
    const shiftChartCanvas = document.getElementById('macaChart');
    
    if (!totalChartCanvas || !shiftChartCanvas) {
        console.error('Không tìm thấy canvas biểu đồ');
        return;
    }
    
    // Xác định logic hiển thị
    const hasSpecificMacaFilter = (filters.maca && filters.maca.trim() !== '');
    
    console.log('🔍 Kiểm tra filter mã ca:', hasSpecificMacaFilter, 'Giá trị mã ca:', filters.maca);
    console.log('🔍 Số ca trong dữ liệu:', data.shiftData ? data.shiftData.length : 0);
    
    // Luôn hiển thị cả 2 container
const totalContainer = totalChartCanvas.closest('.col-md-6');
const shiftContainer = shiftChartCanvas.closest('.col-md-6');

if (totalContainer) totalContainer.style.display = 'block';
if (shiftContainer) shiftContainer.style.display = 'block';

// Tạo biểu đồ tổng
quantityChart = createTotalQuantityChartOnCanvas(totalChartCanvas, data);

// Tạo biểu đồ từng ca
if (data.shiftData && data.shiftData.length > 0) {
    console.log('📊 Có', data.shiftData.length, 'ca - hiển thị biểu đồ từng ca');
    
    // Nếu lọc mã ca cụ thể, chỉ hiển thị ca đó
    const displayShiftData = hasSpecificMacaFilter ? 
        data.shiftData.filter(shift => shift.shift === filters.maca) : 
        data.shiftData;
    
    if (displayShiftData.length > 0) {
        createMultipleShiftCharts(shiftChartCanvas, displayShiftData);
    } else {
        macaChart = createEmptyChart(shiftChartCanvas, `Không có dữ liệu ca ${filters.maca}`);
    }
} else {
        // Người dùng KHÔNG chọn mã ca cụ thể - hiển thị tổng + từng ca
        console.log('📊 Hiển thị biểu đồ tổng + từng ca');
        
        // Hiển thị cả 2 container
        const totalContainer = totalChartCanvas.closest('.col-md-6');
        const shiftContainer = shiftChartCanvas.closest('.col-md-6');
        
        if (totalContainer) totalContainer.style.display = 'block';
        if (shiftContainer) shiftContainer.style.display = 'block';
        
        // Tạo biểu đồ tổng
        quantityChart = createTotalQuantityChartOnCanvas(totalChartCanvas, data);
        
        // Tạo biểu đồ từng ca
        if (data.shiftData && data.shiftData.length > 0) {
            console.log('📊 Có', data.shiftData.length, 'ca - hiển thị biểu đồ từng ca');
            createMultipleShiftCharts(shiftChartCanvas, data.shiftData);
        } else {
            console.log('📊 Không có dữ liệu ca');
            macaChart = createEmptyChart(shiftChartCanvas, 'Không có dữ liệu ca');
        }
    }
}






function displayNoDataChart(canvas, message) {
    // Tìm card-body chứa canvas
    const cardBody = canvas.closest('.card-body');
    if (!cardBody) return;
    
    // Thay thế nội dung card-body
    cardBody.innerHTML = `
        <div class="text-center text-muted p-4">
            <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
            <h5>${message}</h5>
            <p>Vui lòng kiểm tra lại điều kiện lọc.</p>
        </div>
    `;
}


// Tạo biểu đồ tổng trên canvas có sẵn
function createTotalQuantityChartOnCanvas(canvas, data) {
    const totalPaper = data.totalPaper || 0;
    const totalWaste = data.totalWaste || 0;
    
    console.log('🎯 Tạo biểu đồ tổng với dữ liệu:', {totalPaper, totalWaste});
    console.log('🎯 Canvas element:', canvas);
    console.log('🎯 Canvas ID:', canvas.id);
    console.log('🎯 Canvas parent:', canvas.parentElement);
    
    try {
        return new Chart(canvas, {
            type: 'pie',
            data: {
                labels: ['Thành phẩm', 'Phế liệu'],
                datasets: [{
                    data: [totalPaper, totalWaste],
                    backgroundColor: [
                        'rgb(174,207,188)',
                        'rgb(248,179,181)'
                    ],
                    borderColor: [
                        'rgb(148, 199, 169)',
                        'rgb(255, 141, 152)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                elements: {
                    arc: {
                        hoverOffset: 0
                    }
                },
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tổng sản xuất',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                                return `${context.label}: ${formatNumber(context.parsed)} (${percent}%)`;
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        color: 'white',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        formatter: function(value, context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return percent + '%';
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('❌ Lỗi khi tạo biểu đồ tổng:', error);
        return null;
    }
}



// Tạo biểu đồ đơn giản cho các ca trên canvas có sẵn
function createMultipleShiftCharts(canvas, shiftData) {
    // Giữ nguyên canvas gốc, chỉ thay đổi nội dung card-body chứa nó
    const cardBody = canvas.closest('.card-body');
    if (!cardBody) return;
    
    // Ẩn canvas gốc
    canvas.style.display = 'none';
    
    // Tạo container mới cho multiple charts
    const existingMultiContainer = cardBody.querySelector('.multi-shift-charts');
    if (existingMultiContainer) {
        existingMultiContainer.remove();
    }
    
    const multiContainer = document.createElement('div');
    multiContainer.className = 'multi-shift-charts';
    
    let html = '<div class="row justify-content-center">';
    
    shiftData.forEach((shift, index) => {
        const canvasId = `shiftChart_${index}`;
        const colClass = shiftData.length <= 2 ? 'col-md-6' : 'col-md-4';
        
        html += `
            <div class="${colClass} mb-3">
                <div class="text-center">
                    <h6 class="mb-2">Ca ${shift.shift}</h6>
                    <div style="height: 200px; position: relative;">
                        <canvas id="${canvasId}"></canvas>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    multiContainer.innerHTML = html;
    cardBody.appendChild(multiContainer);
    
    // Tạo biểu đồ cho từng ca
    shiftData.forEach((shift, index) => {
        const canvasId = `shiftChart_${index}`;
        const canvasElement = document.getElementById(canvasId);
        
        if (canvasElement) {
            createSingleShiftPieChart(canvasElement, shift);
        }
    });
}



function createSingleShiftPieChart(canvas, shiftData) {
    const paper = shiftData.paper || 0;
    const waste = shiftData.waste || 0;
    const total = paper + waste;
    
    if (total === 0) {
        // Hiển thị thông báo không có dữ liệu
        const container = canvas.parentElement;
        container.innerHTML = `
            <div class="text-center text-muted p-2">
                <i class="fas fa-exclamation-triangle"></i>
                <small>Không có dữ liệu</small>
            </div>
        `;
        return;
    }
    
    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['Thành phẩm', 'Phế liệu'],
            datasets: [{
                data: [paper, waste],
                backgroundColor: [
                    'rgb(174,207,188)',
                    'rgb(248,179,181)'
                ],
                borderColor: [
                    'rgb(148, 199, 169)',
                    'rgb(255, 141, 152)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            elements: {
                arc: {
                    hoverOffset: 0
                }
            },
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        usePointStyle: true,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const percent = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${formatNumber(context.parsed)} (${percent}%)`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    formatter: function(value, context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return percent + '%';
                    }
                }
            }
        }
    });
}


// Tạo biểu đồ cho một ca cụ thể trên canvas có sẵn
function createSingleShiftChartOnCanvas(canvas, data, shiftName) {
    return new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['Thành phẩm', 'Phế liệu'],
            datasets: [{
                data: [data.totalPaper || 0, data.totalWaste || 0],
                backgroundColor: [
                        'rgb(174,207,188)',
                        'rgb(248,179,181)'
                    ],
                    borderColor: [
                        'rgb(148, 199, 169)',
                        'rgb(255, 141, 152)'
                    ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            elements: {
                arc: {
                    hoverOffset: 0
                }
            },
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Sản xuất ca ${shiftName}`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${formatNumber(context.parsed)} (${percent}%)`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    formatter: function(value, context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return percent + '%';
                    }
                }
            }
        }
    });
}


// Cập nhật hàm hiển thị phân tích sản xuất
function displayQuantityAnalysis(data, filters) {
    const analysisContainer = document.getElementById('quantityAnalysis');
    if (!analysisContainer) return;
    
    console.log('📊 Hiển thị phân tích với dữ liệu:', data);
    
    let html = '';
    
    if (data.shiftData && data.shiftData.length > 0) {
    // Lọc dữ liệu theo mã ca nếu có
    const displayData = filters && filters.maca ? 
        data.shiftData.filter(shift => shift.shift === filters.maca) : 
        data.shiftData;
    
    if (displayData.length === 0) {
        html = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <h5>Không có dữ liệu cho mã ca ${filters.maca}</h5>
                <p>Vui lòng kiểm tra lại điều kiện lọc.</p>
            </div>
        `;
    } else {
        html += `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Mã Ca</th>
                            <th>Máy</th>
                            <th class="text-end">Tổng</th>
                            <th class="text-end">Thành phẩm</th>
                            <th class="text-end">Phế liệu</th>
                            <th class="text-end">Tỷ lệ TP</th>
                            <th class="text-end">Tỷ lệ PL</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        displayData.forEach(shift => {
            const paper = shift.paper || 0;
            const waste = shift.waste || 0;
            const total = paper + waste;
            const paperRate = total > 0 ? ((paper / total) * 100).toFixed(1) : 0;
            const wasteRate = total > 0 ? ((waste / total) * 100).toFixed(1) : 0;
            
            html += `
                <tr>
                    <td><strong>Ca ${shift.shift}</strong></td>
                    <td><span class="badge" style="background-color: rgb(128, 186, 151); color: white;">${shift.may || 'Tất cả'}</span></td>
                    <td class="text-end"><strong>${formatNumber(total)}</strong></td>
                    <td class="text-end text-success"><strong>${formatNumber(paper)}</strong></td>
                    <td class="text-end text-danger"><strong>${formatNumber(waste)}</strong></td>
                    <td class="text-end">
                        <span class="badge" style="background-color: rgb(128, 186, 151); color: white;">
                            ${paperRate}%
                        </span>
                    </td>
                    <td class="text-end">
                        <span class="badge" style="background-color: rgb(128, 186, 151); color: white;">
                            ${wasteRate}%
                        </span>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        // Thống kê chỉ cho dữ liệu được hiển thị
        const totalPaper = displayData.reduce((sum, shift) => sum + (shift.paper || 0), 0);
        const totalWaste = displayData.reduce((sum, shift) => sum + (shift.waste || 0), 0);
        const grandTotal = totalPaper + totalWaste;
        const totalPaperRate = grandTotal > 0 ? ((totalPaper / grandTotal) * 100).toFixed(1) : 0;
        const totalWasteRate = grandTotal > 0 ? ((totalWaste / grandTotal) * 100).toFixed(1) : 0;
        
        html += `
            <div class="row mt-3">
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6>${filters && filters.maca ? `Số ca được lọc` : `Số ca sản xuất`}</h6>
                            <h4 class="text-primary">${displayData.length}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6>Tỷ lệ thành phẩm</h6>
                            <h4 class="text-success">${totalPaperRate}%</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6>Tỷ lệ phế liệu</h6>
                            <h4 class="text-danger">${totalWasteRate}%</h4>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
} else {
    html = `
        <div class="text-center text-muted p-4">
            <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
            <h5>Không có dữ liệu phù hợp với điều kiện lọc</h5>
            <p>Vui lòng kiểm tra lại mã ca hoặc khoảng thời gian đã chọn.</p>
        </div>
    `;
}
    
    analysisContainer.innerHTML = html;
}




// Thêm hàm hiển thị biểu đồ trống
// Tạo biểu đồ trống
function createEmptyChart(canvas, message) {
    return new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['Không có dữ liệu'],
            datasets: [{
                data: [1],
                backgroundColor: ['rgba(108, 117, 125, 0.5)'],
                borderColor: ['rgba(108, 117, 125, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                arc: {
                    hoverOffset: 0
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: message || 'Không có dữ liệu',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                },
                datalabels: {
                    display: false
                }
            }
        }
    });
}



// Thêm hàm displayTimeCharts() sau hàm displayQuantityCharts():
function displayTimeCharts(data, filters) {
    // Destroy chart cũ trước khi tạo mới
    if (timeChart) {
        timeChart.destroy();
        timeChart = null;
    }
    
    const timeCtx = document.getElementById('timeChart');
    if (!timeCtx) return;
    
// Tính toán thời gian - nếu lọc theo mã ca thì tính theo tỷ lệ
let totalTime = data.timeData?.totalTime || 0;
let setupTime = data.timeData?.setupTime || 0;
let otherTime = data.timeData?.otherTime || 0;

if (filters && filters.maca && data.shiftData) {
    const shiftData = data.shiftData.find(shift => shift.shift === filters.maca);
    if (shiftData) {
        // Tính tỷ lệ thời gian theo tỷ lệ sản xuất
        const totalPaper = data.totalPaper || 0;
        const totalWaste = data.totalWaste || 0;
        const grandTotal = totalPaper + totalWaste;
        const shiftTotal = (shiftData.paper || 0) + (shiftData.waste || 0);
        
        if (grandTotal > 0) {
            const ratio = shiftTotal / grandTotal;
            totalTime = Math.round(totalTime * ratio);
            setupTime = Math.round(setupTime * ratio);
            otherTime = Math.round(otherTime * ratio);
        }
    }
}

// Thời gian chạy máy = tổng thời gian - thời gian canh máy - thời gian dừng máy
const runTime = Math.max(0, totalTime - setupTime - otherTime);
    
    console.log('⏰ Dữ liệu thời gian:', { runTime, setupTime, otherTime, totalTime });
    
    timeChart = new Chart(timeCtx, {
        type: 'pie',
        data: {
            labels: ['Thời gian chạy máy', 'Thời gian canh máy', 'Khác'],
            datasets: [{
                data: [runTime, setupTime, otherTime],
                backgroundColor: [
                    'rgb(167,190,211)',    // Xanh lá - chạy máy
                    'rgb(218,184,148)',    // Vàng - canh máy  
                    'rgb(240,128,128)'     // Đỏ - khác
                ],
                borderColor: [
                    'rgb(144, 169, 192)',    // Xanh lá - chạy máy
                    'rgb(196, 162, 126)',    // Vàng - canh máy  
                    'rgb(199, 105, 105)'     // Đỏ - khác
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            elements: {
                arc: {
                    hoverOffset: 0
                }
            },
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${formatDuration(context.parsed)} (${percent}%)`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    formatter: function(value, context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return percent + '%';
                    }
                }
            }
        }
    });
    
    // Tạo biểu đồ lý do dừng máy
displayStopReasonChart(data, filters);

// Cập nhật thông tin thời gian ở bên phân tích
updateTimeAnalysisInfo(data.timeData);
}



// Hiển thị biểu đồ lý do dừng máy
function displayStopReasonChart(data, filters) {
    // Destroy chart cũ
    if (stopReasonChart) {
        stopReasonChart.destroy();
        stopReasonChart = null;
    }
    
    const stopReasonCtx = document.getElementById('stopReasonChart');
    if (!stopReasonCtx) return;
    
    // Kiểm tra có dữ liệu lý do dừng máy không
    if (!data.stopReasons || data.stopReasons.length === 0) {
        stopReasonChart = createEmptyChart(stopReasonCtx, 'Không có lý do dừng máy');
        return;
    }
    
    // Lọc dữ liệu theo mã ca nếu có
    let displayStopReasons = data.stopReasons;
    if (filters && filters.maca && data.shiftData) {
        const shiftData = data.shiftData.find(shift => shift.shift === filters.maca);
        if (shiftData) {
            // Tính tỷ lệ cho ca cụ thể
            const totalPaper = data.totalPaper || 0;
            const totalWaste = data.totalWaste || 0;
            const grandTotal = totalPaper + totalWaste;
            const shiftTotal = (shiftData.paper || 0) + (shiftData.waste || 0);
            
            if (grandTotal > 0) {
                const ratio = shiftTotal / grandTotal;
                displayStopReasons = data.stopReasons.map(reason => ({
                    reason: reason.reason,
                    duration: Math.round(reason.duration * ratio)
                })).filter(reason => reason.duration > 0);
            }
        }
    }
    
    if (displayStopReasons.length === 0) {
        stopReasonChart = createEmptyChart(stopReasonCtx, 'Không có lý do dừng máy');
        return;
    }
    
    const labels = displayStopReasons.map(item => item.reason);
    const durations = displayStopReasons.map(item => item.duration);
    
    // Tạo màu sắc cho từng lý do
    const colors = [
        'rgb(148, 185, 219)',  // xanh dương pastel
        'rgb(229, 148, 148)',  // đỏ pastel
        'rgb(150, 208, 162)',  // xanh lá pastel
'rgb(179, 154, 228)',  // tím pastel
'rgb(224, 219, 152)',  // vàng pastel
'rgb(205, 170, 125)',  // nâu pastel
'rgb(223, 178, 133)',  // cam pastel
'rgb(174, 171, 171)',  // xám pastel
'rgb(130, 174, 174)',  // xanh đậm pastel (teal nhẹ)
'rgb(214, 153, 162)',  // hồng pastel
'rgb(141, 150, 193)',  // xanh tím than nhạt (đậm đằm)
    ];
    
    stopReasonChart = new Chart(stopReasonCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: durations,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: colors.slice(0, labels.length).map(color => color.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            elements: {
                arc: {
                    hoverOffset: 0
                }
            },
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${formatDuration(context.parsed)} (${percent}%)`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    color: 'white',
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    formatter: function(value, context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return percent + '%';
                    }
                }
            }
        }
    });
}



// Cập nhật thông tin thời gian
function updateTimeAnalysisInfo(timeData) {
    const runTimeEl = document.getElementById('runTime');
    const setupTimeEl = document.getElementById('setupTime');
    const otherTimeEl = document.getElementById('otherTime');
    const totalTimeEl = document.getElementById('totalTime');
    
    if (timeData) {
        const setupTime = timeData.setupTime || 0;
        const otherTime = timeData.otherTime || 0;
        const totalTime = timeData.totalTime || 0;
        const runTime = Math.max(0, totalTime - setupTime - otherTime);
        
        if (runTimeEl) runTimeEl.textContent = formatDuration(runTime);
        if (setupTimeEl) setupTimeEl.textContent = formatDuration(setupTime);
        if (otherTimeEl) otherTimeEl.textContent = formatDuration(otherTime);
        if (totalTimeEl) totalTimeEl.textContent = formatDuration(totalTime);
    }
}


// Hiển thị phân tích thời gian
function displayTimeAnalysis(data, filters) {
    const stopReasonsEl = document.getElementById('stopReasonsAnalysis');
    if (!stopReasonsEl) return;
    
    let html = '';
    
    // Chỉ hiển thị khi có lý do dừng máy (thời gian khác > 0)
    if (data.timeData && data.timeData.otherTime > 0 && data.stopReasons && data.stopReasons.length > 0) {
        html += `
            <div class="mt-3">
                <h6><i class="fas fa-exclamation-triangle text-warning me-2"></i>Chi tiết thời gian dừng máy:</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead class="table-light">
                            <tr>
                                <th>Lý do</th>
                                <th class="text-end">Thời gian</th>
                                <th class="text-end">Tỷ lệ</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        const totalStopTime = data.stopReasons.reduce((sum, reason) => sum + (reason.duration || 0), 0);
        
        data.stopReasons.forEach(reason => {
            const duration = reason.duration || 0;
            const percent = totalStopTime > 0 ? ((duration / totalStopTime) * 100).toFixed(1) : 0;
            
            html += `
                <tr>
                    <td>${reason.reason}</td>
                    <td class="text-end">${formatDuration(duration)}</td>
                    <td class="text-end">
                        <span class="badge bg-secondary">${percent}%</span>
                    </td>
                </tr>
            `;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
                <div class="mt-2 text-center">
                    <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>
                        Tổng thời gian dừng máy: <strong>${formatDuration(totalStopTime)}</strong>
                    </small>
                </div>
            </div>
        `;
    } else {
        html = `
            <div class="text-center text-success mt-3">
                <i class="fas fa-check-circle me-2"></i>
                Không có thời gian dừng máy
            </div>
        `;
    }
    
    stopReasonsEl.innerHTML = html;
}

// Reset filters
function handleResetFilters() {
    // Reset form
    document.getElementById('wsInput').value = '';
    document.getElementById('caSelect').selectedIndex = 0;
    document.getElementById('maySelect').selectedIndex = 0;
    
    // Reset dates
    setDefaultDates();

    // Reset thêm các trường khác
const wsInput = document.getElementById('wsInput');
const caSelect = document.getElementById('caSelect');
const maySelect = document.getElementById('maySelect');

if (wsInput) wsInput.value = '';
if (caSelect) caSelect.selectedIndex = 0;
if (maySelect) maySelect.selectedIndex = 0;
    
    // Ẩn báo cáo
    const reportSection = document.getElementById('reportSection');
    if (reportSection) {
        reportSection.style.display = 'none';
    }
    
    // Hủy biểu đồ
    if (pieChart) {
        pieChart.destroy();
        pieChart = null;
    }
    if (quantityChart) {
        quantityChart.destroy();
        quantityChart = null;
    }
    if (macaChart) {
        macaChart.destroy();
        macaChart = null;
    }
    if (timeChart) {
        timeChart.destroy();
        timeChart = null;
    }
    
    showNotification('Đã reset bộ lọc', 'info');
}

// ====================================================================================================================================
// BÁO CÁO GMC FUNCTIONS (tương tự In)
// ====================================================================================================================================

// Khởi tạo báo cáo GMC
function initBaoCaoGMC() {
    // Tương tự như initBaoCaoIn nhưng dành cho GMC
    console.log('Khởi tạo báo cáo GMC...');
}

// ====================================================================================================================================
// UTILITY FUNCTIONS
// ====================================================================================================================================

// Hiển thị loading
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// Hiển thị thông báo
function showNotification(message, type = 'info') {
    // Tạo toast notification
    const toast = document.createElement('div');
    toast.className = `alert alert-${getBootstrapClass(type)} alert-dismissible fade show position-fixed`;
    toast.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
    `;
    
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

// Chuyển đổi type thành class Bootstrap
function getBootstrapClass(type) {
    switch (type) {
        case 'success': return 'success';
        case 'error': return 'danger';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'info';
    }
}

// Format số
function formatNumber(num) {
    if (!num || isNaN(num)) return '0';
    return parseFloat(num).toLocaleString('vi-VN');
}

// Format ngày
function formatDate(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    } catch (error) {
        return dateString;
    }
}

// Format thời gian (phút -> giờ phút)
function formatDuration(minutes) {
    if (!minutes || isNaN(minutes)) return '0 phút';
    
    const totalMinutes = parseInt(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    if (hours === 0) {
        return `${mins} phút`;
    } else if (mins === 0) {
        return `${hours} giờ`;
    } else {
        return `${hours} giờ ${mins} phút`;
    }
}

console.log('✅ Hệ thống biểu đồ đã được khởi tạo hoàn tất');




// Hàm helper để destroy tất cả chart
function destroyAllCharts() {
    console.log('🗑️ Destroy tất cả biểu đồ');
    
    if (pieChart) {
        pieChart.destroy();
        pieChart = null;
    }
    if (quantityChart) {
        quantityChart.destroy();
        quantityChart = null;
    }
    if (macaChart) {
        macaChart.destroy();
        macaChart = null;
    }
    if (timeChart) {
        timeChart.destroy();
        timeChart = null;
    }
    if (stopReasonChart) {
        stopReasonChart.destroy();
        stopReasonChart = null;
    }
    
    // Destroy tất cả chart con được tạo động
    Chart.helpers.each(Chart.instances, function(instance) {
        if (instance.canvas && instance.canvas.id && instance.canvas.id.startsWith('shiftChart_')) {
            instance.destroy();
        }
    });


    // Xóa container multiple charts
document.querySelectorAll('.multi-shift-charts').forEach(container => {
    container.remove();
});

// Hiển thị lại canvas gốc
document.querySelectorAll('#macaChart').forEach(canvas => {
    canvas.style.display = 'block';
});
}



// Ẩn section báo cáo
function hideReportSection() {
    const reportSection = document.getElementById('reportSection');
    if (reportSection) {
        reportSection.style.display = 'none';
    }
}



// Đảm bảo cấu trúc HTML của reportSection
function ensureReportSectionStructure() {
    const reportSection = document.getElementById('reportSection');
    if (!reportSection) return;
    
    // Kiểm tra xem có đủ các element cần thiết không
    const requiredElements = [
        'totalPaper', 'totalWaste', 'totalData',
        'quantityChart', 'macaChart', 'timeChart',
        'quantityAnalysis', 'detailTableContainer'
    ];
    
    let needsReset = false;
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            needsReset = true;
        }
    });
    
    // Nếu thiếu element, reload lại trang
    if (needsReset) {
        location.reload();
    }
}



// Hiển thị bảng chi tiết báo cáo
function displayDetailTable(data, filters) {
    const container = document.getElementById('detailTableContainer');
    if (!container) return;
    
    // Gọi API lấy dữ liệu báo cáo In theo filters
fetchInReportList(filters)
.then(detailData => {
    // Lọc dữ liệu theo mã ca nếu có
    let filteredData = detailData;
    if (filters && filters.maca) {
        filteredData = detailData.filter(record => record.ma_ca === filters.maca);
    }
    renderDetailTable(container, filteredData, filters);
})
.catch(error => {
    console.error('Lỗi khi lấy dữ liệu chi tiết:', error);
    container.innerHTML = `
        <div class="text-center text-muted p-4">
            <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
            <h6>Không thể tải dữ liệu chi tiết</h6>
            <p>Lỗi: ${error.message}</p>
        </div>
    `;
});
}


// Lấy dữ liệu chi tiết từ API
async function fetchDetailTableData(filters) {
    try {
        const params = new URLSearchParams();
        
        if (filters.fromDate) params.append('fromDate', filters.fromDate);
        if (filters.toDate) params.append('toDate', filters.toDate);
        if (filters.ws) params.append('ws', filters.ws);
        if (filters.maca) params.append('ca', filters.maca);
        if (filters.may) params.append('may', filters.may);
        if (filters.tuan) params.append('tuan', filters.tuan);
        
        // Thêm tham số để lấy dữ liệu chi tiết
        params.append('detail', 'true');
        
        const response = await fetch(`/api/bao-cao-in/list?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu chi tiết');
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Lỗi khi gọi API chi tiết:', error);
        throw error;
    }
}




// Lấy dữ liệu báo cáo In theo filters
async function fetchInReportList(filters) {
    try {
        const params = new URLSearchParams();
        
        if (filters.fromDate) params.append('fromDate', filters.fromDate);
        if (filters.toDate) params.append('toDate', filters.toDate);
        if (filters.ws) params.append('ws', filters.ws);
        if (filters.maca) params.append('ca', filters.maca);
        if (filters.may) params.append('may', filters.may);
        if (filters.tuan) params.append('tuan', filters.tuan);
        
        const response = await fetch(`/api/bieu-do/in/chart-data?${params.toString()}&detail=true`);
        
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu báo cáo In');
        }
        
        const result = await response.json();
        return result.reports || [];
        
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu báo cáo In:', error);
        throw error;
    }
}




// Render bảng chi tiết
function renderDetailTable(container, data, filters) {
    if (!data || data.length === 0) {
        const noDataMessage = filters && filters.maca ? 
            `Không có dữ liệu chi tiết cho mã ca ${filters.maca}` : 
            'Không có dữ liệu chi tiết';
        container.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-table fa-2x mb-3"></i>
                <h6>${noDataMessage}</h6>
                <p>Vui lòng kiểm tra lại điều kiện lọc.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-striped table-hover text-center">
                <thead class="table-dark">
                    <tr>
                        <th>STT</th>
                        <th>WS</th>
                        <th>Mã Ca</th>
                        <th>Máy</th>
                        <th>Khách hàng</th>
                        <th>Mã sản phẩm</th>
                        <th class="text-end">Thành phẩm in</th>
                        <th class="text-end">Phế liệu</th>
                        <th>Thời gian</th>
                        <th class="text-end">Thời gian canh máy</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    data.forEach((record, index) => {
        const ws = record.ws || '-';
        const maca = record.ma_ca || '-';
        const may = record.may || '-';
        const customer = record.khach_hang || '-';
        const product = record.ma_sp || '-';
        const paper = formatNumber(record.thanh_pham_in || 0);
        const waste = formatNumber((parseFloat(record.phe_lieu) || 0) + (parseFloat(record.phe_lieu_trang) || 0));
        const setupTime = formatDuration(record.thoi_gian_canh_may || 0);
        
        // Format thời gian
        const timeRange = formatTimeRange(record.thoi_gian_bat_dau, record.thoi_gian_ket_thuc);
        
        html += `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td><span class="badge bg-primary">${ws}</span></td>
                <td><span class="badge " style="background-color: rgb(128, 186, 151); color: white;">${maca}</span></td>
                <td><span class="badge " style="background-color: rgb(208, 160, 145); color: white;">${may}</span></td>
                <td>${customer}</td>
                <td>${product}</td>
                <td class="text-end text-success"><strong>${paper}</strong></td>
                <td class="text-end text-danger"><strong>${waste}</strong></td>
                <td><small>${timeRange}</small></td>
                <td class="text-end">${setupTime}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    // Thêm thống kê tổng
    const totalPaper = data.reduce((sum, record) => sum + (parseFloat(record.thanh_pham_in) || 0), 0);
    const totalWaste = data.reduce((sum, record) => 
        sum + (parseFloat(record.phe_lieu) || 0) + (parseFloat(record.phe_lieu_trang) || 0), 0);
    const totalSetupTime = data.reduce((sum, record) => sum + (parseFloat(record.thoi_gian_canh_may) || 0), 0);

// Đếm số WS không trùng lặp
const uniqueWS = new Set(data.map(record => record.ws).filter(ws => ws && ws !== '-')).size;

// Tính tổng thời gian dừng máy từ currentChartData
const totalStopTime = currentChartData && currentChartData.stopReasons ? 
    currentChartData.stopReasons.reduce((sum, reason) => sum + (reason.duration || 0), 0) : 0;

    
html += `
<div class="row mt-3">
    <div class="col-md-2">
        <div class="card bg-light">
            <div class="card-body text-center">
                <h6>Tổng báo cáo</h6>
                <h4 class="text-primary">${uniqueWS}</h4>
            </div>
        </div>
    </div>
    <div class="col-md-2">
        <div class="card bg-light">
            <div class="card-body text-center">
                <h6>Tổng thành phẩm</h6>
                <h4 class="text-success">${formatNumber(totalPaper)}</h4>
            </div>
        </div>
    </div>
    <div class="col-md-2">
        <div class="card bg-light">
            <div class="card-body text-center">
                <h6>Tổng phế liệu</h6>
                <h4 class="text-danger">${formatNumber(totalWaste)}</h4>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-light">
            <div class="card-body text-center">
                <h6>Tổng thời gian canh máy</h6>
                <h4 class="text-warning">${formatDuration(totalSetupTime)}</h4>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card bg-light">
            <div class="card-body text-center">
                <h6>Tổng thời gian dừng máy</h6>
                <h4 class="text-info">${formatDuration(totalStopTime)}</h4>
            </div>
        </div>
    </div>
</div>
`;
    
    container.innerHTML = html;
}

// Format khoảng thời gian
function formatTimeRange(startTime, endTime) {
    if (!startTime || !endTime) return '-';
    
    try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        const startFormatted = formatDateTime(start);
        const endFormatted = formatDateTime(end);
        
        return `${startFormatted} - ${endFormatted}`;
    } catch (error) {
        return '-';
    }
}

// Format ngày giờ (dd/mm hh:mm:ss)
function formatDateTime(date) {
    if (!date) return '-';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month} ${hours}:${minutes}:${seconds}`;
}