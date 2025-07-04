// ====================================================================================================================================
// FILE: Bieudo.js
// MÔ TẢ: JavaScript cho hệ thống biểu đồ sản xuất nhà máy 1
// ====================================================================================================================================

console.log('🚀 Khởi tạo hệ thống biểu đồ sản xuất...');

// Biến toàn cục
let currentChartData = null;
let pieChart = null;
let quantityChart = null;  // Thêm dòng này
let macaChart = null;      // Thêm dòng này
let timeChart = null;  

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
        showNotification('Lỗi khi tải báo cáo: ' + error.message, 'error');
    }
}

// Thu thập điều kiện lọc
function collectFilters() {
    return {
        ws: document.getElementById('wsInput')?.value?.trim() || '',
        maca: (() => {
            const caSelect = document.getElementById('caSelect');
            if (!caSelect || !caSelect.value) return '';
            
            // Lấy value trực tiếp từ select (A, B, D, A1, AB+, etc.)
            const selectedValue = caSelect.value;
            console.log('🔍 Mã ca được chọn:', selectedValue);
            return selectedValue;
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
    
    
    // Kiểm tra dữ liệu có hợp lệ không
    if (!data || (data.totalPaper === 0 && data.totalWaste === 0 && (!data.shiftData || data.shiftData.length === 0))) {
        // Hiển thị thông báo không có dữ liệu
        const reportSection = document.getElementById('reportSection');
        if (reportSection) {
            reportSection.style.display = 'block';
            reportSection.innerHTML = `
                <div class="row">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body text-center p-5">
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
                        </div>
                    </div>
                </div>
            `;
        }
        return;
    }

    
    // Hiển thị section báo cáo
    const reportSection = document.getElementById('reportSection');
    if (reportSection) {
        reportSection.style.display = 'block';
        reportSection.classList.add('slide-up');
    }
    
    // Hiển thị tóm tắt số liệu
    displaySummaryStats(data);
    
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
    
    // Destroy chart cũ trước khi tạo mới
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
    const hasSpecificFilter = (filters.maca && filters.maca.trim() !== '') || (filters.may && filters.may.trim() !== '');
    
    if (hasSpecificFilter) {
        // Trường hợp có lọc ca hoặc máy cụ thể
        displayFilteredCharts(totalChartCanvas, shiftChartCanvas, data, filters);
    } else {
        // Trường hợp không lọc ca/máy - hiển thị tổng + các ca
        displayGeneralCharts(totalChartCanvas, shiftChartCanvas, data, filters);
    }
}



function displayFilteredCharts(totalCanvas, shiftCanvas, data, filters) {
    // Ẩn canvas thứ 2
    shiftCanvas.parentElement.style.display = 'none';
    
    // Hiển thị biểu đồ tròn cho điều kiện lọc
    if (filters.maca) {
        // Lọc theo mã ca
        const shiftData = data.shiftData ? data.shiftData.find(shift => shift.shift === filters.maca) : null;
        if (shiftData && (shiftData.paper > 0 || shiftData.waste > 0)) {
            quantityChart = createSingleShiftChartOnCanvas(totalCanvas, shiftData, `Ca ${filters.maca}`);
        } else {
            displayNoDataChart(totalCanvas, `Không có dữ liệu cho mã ca ${filters.maca}`);
        }
    } else if (filters.may) {
        // Lọc theo máy - sử dụng tổng data đã được lọc
        quantityChart = createSingleShiftChartOnCanvas(totalCanvas, data, `Máy ${filters.may}`);
    }
}



function displayGeneralCharts(totalCanvas, shiftCanvas, data, filters) {
    // Hiển thị biểu đồ tổng
    quantityChart = createTotalQuantityChartOnCanvas(totalCanvas, data);
    
    // Hiển thị biểu đồ các ca
    if (data.shiftData && data.shiftData.length > 0) {
        shiftCanvas.parentElement.style.display = 'block';
        displayMultipleShiftCharts(shiftCanvas, data.shiftData);
    } else {
        shiftCanvas.parentElement.style.display = 'none';
    }
}



function displayMultipleShiftCharts(canvas, shiftData) {
    // Thay thế canvas bằng container chứa nhiều biểu đồ tròn
    const container = canvas.parentElement;
    container.innerHTML = `
        <h6 class="text-center mb-3">Phân bố theo ca</h6>
        <div class="row" id="shiftChartsContainer"></div>
    `;
    
    const chartsContainer = container.querySelector('#shiftChartsContainer');
    
    // Tính số cột dựa trên số ca
    const colClass = shiftData.length <= 2 ? 'col-md-6' : 
                    shiftData.length <= 3 ? 'col-md-4' : 
                    shiftData.length <= 4 ? 'col-md-3' : 'col-md-2';
    
    shiftData.forEach((shift, index) => {
        const chartDiv = document.createElement('div');
        chartDiv.className = `${colClass} mb-3`;
        chartDiv.innerHTML = `
            <div class="text-center">
                <h6>Ca ${shift.shift}</h6>
                <div class="chart-container" style="height: 200px;">
                    <canvas id="shiftChart${index}"></canvas>
                </div>
            </div>
        `;
        chartsContainer.appendChild(chartDiv);
        
        // Tạo biểu đồ tròn cho ca này
        setTimeout(() => {
            const ctx = document.getElementById(`shiftChart${index}`);
            if (ctx) {
                new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: ['Thành phẩm', 'Phế liệu'],
                        datasets: [{
                            data: [shift.paper || 0, shift.waste || 0],
                            backgroundColor: [
                                'rgba(40, 167, 69, 0.8)',
                                'rgba(220, 53, 69, 0.8)'
                            ],
                            borderColor: [
                                'rgba(40, 167, 69, 1)',
                                'rgba(220, 53, 69, 1)'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 8,
                                    usePointStyle: true,
                                    font: { size: 10 }
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
                            }
                        }
                    }
                });
            }
        }, 100);
    });
}



function displayNoDataChart(canvas, message) {
    canvas.parentElement.innerHTML = `
        <div class="text-center text-muted p-4">
            <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
            <h5>${message}</h5>
            <p>Vui lòng kiểm tra lại điều kiện lọc.</p>
        </div>
    `;
}

// // Tạo biểu đồ tổng
// function createTotalQuantityChart(container, data) {
//     const totalPaper = data.totalPaper || 0;
//     const totalWaste = data.totalWaste || 0;
    
//     const chartWrapper = document.createElement('div');
//     chartWrapper.className = 'mb-4';
//     chartWrapper.innerHTML = `
//         <h6 class="text-center mb-3">Tổng sản xuất</h6>
//         <div class="chart-container">
//             <canvas id="totalQuantityChart"></canvas>
//         </div>
//     `;
    
//     container.appendChild(chartWrapper);
    
//     // Tạo biểu đồ
//     const ctx = document.getElementById('totalQuantityChart');
//     if (ctx) {
//         new Chart(ctx, {
//             type: 'pie',
//             data: {
//                 labels: ['Thành phẩm', 'Phế liệu'],
//                 datasets: [{
//                     data: [totalPaper, totalWaste],
//                     backgroundColor: [
//                         'rgba(40, 167, 69, 0.8)',
//                         'rgba(220, 53, 69, 0.8)'
//                     ],
//                     borderColor: [
//                         'rgba(40, 167, 69, 1)',
//                         'rgba(220, 53, 69, 1)'
//                     ],
//                     borderWidth: 2
//                 }]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                     legend: {
//                         position: 'bottom',
//                         labels: {
//                             padding: 15,
//                             usePointStyle: true
//                         }
//                     },
//                     tooltip: {
//                         callbacks: {
//                             label: function(context) {
//                                 const total = context.dataset.data.reduce((a, b) => a + b, 0);
//                                 const percent = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
//                                 return `${context.label}: ${formatNumber(context.parsed)} (${percent}%)`;
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//     }
// }

// // Tạo biểu đồ cho từng ca
// function createShiftQuantityCharts(container, shiftData) {
//     const shiftsWrapper = document.createElement('div');
//     shiftsWrapper.innerHTML = '<h6 class="text-center mb-3">Phân bố theo ca</h6>';
    
//     const chartsRow = document.createElement('div');
//     chartsRow.className = 'row';
    
//     shiftData.forEach((shift, index) => {
//         const chartCol = document.createElement('div');
//         chartCol.className = `col-md-${12 / Math.min(shiftData.length, 3)} mb-3`;
        
//         chartCol.innerHTML = `
//             <div class="text-center">
//                 <h6>Ca ${shift.shift}</h6>
//                 <div class="chart-container" style="height: 200px;">
//                     <canvas id="shiftChart${index}"></canvas>
//                 </div>
//             </div>
//         `;
        
//         chartsRow.appendChild(chartCol);
//     });
    
//     shiftsWrapper.appendChild(chartsRow);
//     container.appendChild(shiftsWrapper);
    
//     // Tạo biểu đồ cho từng ca
//     shiftData.forEach((shift, index) => {
//         const ctx = document.getElementById(`shiftChart${index}`);
//         if (ctx) {
//             new Chart(ctx, {
//                 type: 'pie',
//                 data: {
//                     labels: ['Thành phẩm', 'Phế liệu'],
//                     datasets: [{
//                         data: [shift.paper || 0, shift.waste || 0],
//                         backgroundColor: [
//                             'rgba(40, 167, 69, 0.8)',
//                             'rgba(220, 53, 69, 0.8)'
//                         ],
//                         borderColor: [
//                             'rgba(40, 167, 69, 1)',
//                             'rgba(220, 53, 69, 1)'
//                         ],
//                         borderWidth: 2
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false,
//                     plugins: {
//                         legend: {
//                             position: 'bottom',
//                             labels: {
//                                 padding: 10,
//                                 usePointStyle: true,
//                                 font: {
//                                     size: 11
//                                 }
//                             }
//                         },
//                         tooltip: {
//                             callbacks: {
//                                 label: function(context) {
//                                     const total = context.dataset.data.reduce((a, b) => a + b, 0);
//                                     const percent = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
//                                     return `${context.label}: ${formatNumber(context.parsed)} (${percent}%)`;
//                                 }
//                             }
//                         }
//                     }
//                 }
//             });
//         }
//     });
// }




// Tạo biểu đồ tổng trên canvas có sẵn
function createTotalQuantityChartOnCanvas(canvas, data) {
    const totalPaper = data.totalPaper || 0;
    const totalWaste = data.totalWaste || 0;
    
    return new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['Thành phẩm', 'Phế liệu'],
            datasets: [{
                data: [totalPaper, totalWaste],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
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
                }
            }
        }
    });
}



// Tạo biểu đồ theo mã ca trên canvas có sẵn
function createShiftQuantityChartOnCanvas(canvas, shiftData) {
    // Tạo biểu đồ bar chart để hiển thị nhiều ca
    const labels = shiftData.map(shift => `Ca ${shift.shift}`);
    const paperData = shiftData.map(shift => shift.paper || 0);
    const wasteData = shiftData.map(shift => shift.waste || 0);
    
    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Thành phẩm',
                data: paperData,
                backgroundColor: 'rgba(40, 167, 69, 0.8)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1
            }, {
                label: 'Phế liệu',
                data: wasteData,
                backgroundColor: 'rgba(220, 53, 69, 0.8)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Phân bố theo mã ca',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
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
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
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
                    <td><span class="badge bg-warning">${shift.may || 'N/A'}</span></td>
                    <td class="text-end"><strong>${formatNumber(total)}</strong></td>
                    <td class="text-end text-success"><strong>${formatNumber(paper)}</strong></td>
                    <td class="text-end text-danger"><strong>${formatNumber(waste)}</strong></td>
                    <td class="text-end">
                        <span class="badge bg-${paperRate >= 95 ? 'success' : paperRate >= 90 ? 'warning' : 'danger'}">
                            ${paperRate}%
                        </span>
                    </td>
                    <td class="text-end">
                        <span class="badge bg-${wasteRate <= 5 ? 'success' : wasteRate <= 10 ? 'warning' : 'danger'}">
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
                            <h4 class="text-${totalPaperRate >= 95 ? 'success' : totalPaperRate >= 90 ? 'warning' : 'danger'}">${totalPaperRate}%</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6>Tỷ lệ phế liệu</h6>
                            <h4 class="text-${totalWasteRate <= 5 ? 'success' : totalWasteRate <= 10 ? 'warning' : 'danger'}">${totalWasteRate}%</h4>
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
function displayEmptyChart(ctx) {
    try {
        pieChart = new Chart(ctx, {
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
                plugins: {
                    title: {
                        display: true,
                        text: 'Không có dữ liệu',
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
                    }
                }
            }
        });
    } catch (error) {
        console.error('❌ Lỗi khi tạo biểu đồ trống:', error);
    }
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

const runTime = Math.max(0, totalTime - setupTime - otherTime);
    
    console.log('⏰ Dữ liệu thời gian:', { runTime, setupTime, otherTime, totalTime });
    
    timeChart = new Chart(timeCtx, {
        type: 'pie',
        data: {
            labels: ['Thời gian chạy máy', 'Thời gian canh máy', 'Khác'],
            datasets: [{
                data: [runTime, setupTime, otherTime],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',    // Xanh lá - chạy máy
                    'rgba(255, 193, 7, 0.8)',    // Vàng - canh máy  
                    'rgba(220, 53, 69, 0.8)'     // Đỏ - khác
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
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
                }
            }
        }
    });
    
    // Cập nhật thông tin thời gian ở bên phân tích
    updateTimeAnalysisInfo(data.timeData);
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
            <table class="table table-striped table-hover">
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
                <td><span class="badge bg-info">${maca}</span></td>
                <td><span class="badge bg-warning">${may}</span></td>
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
    
    html += `
        <div class="row mt-3">
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h6>Tổng báo cáo</h6>
                        <h4 class="text-primary">${uniqueWS}</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h6>Tổng thành phẩm</h6>
                        <h4 class="text-success">${formatNumber(totalPaper)}</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
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