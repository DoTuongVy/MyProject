// ====================================================================================================================================
// FILE: Bieudo.js
// MÔ TẢ: JavaScript cho hệ thống biểu đồ sản xuất nhà máy 1
// ====================================================================================================================================

console.log('🚀 Khởi tạo hệ thống biểu đồ sản xuất...');

// Đăng ký plugin datalabels
Chart.register(ChartDataLabels);
// Thiết lập font mặc định cho Chart.js
Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// Biến toàn cục
let currentChartData = null;
let pieChart = null;
let quantityChart = null;  // Thêm dòng này
let macaChart = null;      // Thêm dòng này
let timeChart = null;
let stopReasonChart = null;

let leaderShiftStackedChartInstance = null;

// Biến phân trang
let currentPageData = [];
let currentPage = 1;
let itemsPerPage = 10;
let totalItems = 0;


let currentLeaderSelections = { left: '', right: '' };


let topCustomersChart = null;
let topProductsChart = null;

let topSpeedLeftChart = null;
let topSpeedRightChart = null;
let currentSpeedSelections = { left: '', right: '' };

let sampleProductTimeChart = null;

// Biến cho filter bảng chi tiết
let originalTableData = [];
let filteredTableData = [];
let currentDetailFilters = {
    soMau: [],
    maSp: [],
    khachHang: [],
    may: [],
    maCa: [],
    speedFilter: { type: 'range', min: '', max: '' },
    orderFilter: { type: 'range', min: '', max: '' }
};

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

    // Tạo biểu đồ theo năm ngay khi load trang
    const currentYear = new Date().getFullYear();
    setTimeout(() => {
        loadYearlyLeaderData(null, currentYear);
    }, 1000);


}

// Thiết lập bộ lọc báo cáo In
function setupInFilters() {
    loadMachineList();
    setupYearlyCharts();
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
        fromDate.addEventListener('focus', function () {
            if (!this.value) {
                const today = new Date().toISOString().split('T')[0];
                this.value = today;
            }
        });
    }

    if (toDate) {
        toDate.addEventListener('focus', function () {
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


function setupYearlyCharts() {
    const yearSelect = document.getElementById('yearSelectChart');
    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        yearSelect.innerHTML = '';

        // Thêm 5 năm gần nhất, chọn sẵn năm hiện tại
        for (let i = 0; i < 5; i++) {
            const year = currentYear - i;
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }

        // Gắn sự kiện thay đổi năm
        yearSelect.addEventListener('change', function () {
            loadYearlyCharts(this.value);
        });

        // Load biểu đồ cho năm hiện tại
        loadYearlyCharts(currentYear);

        // Đảm bảo tạo biểu đồ trưởng máy ngay khi load
        setTimeout(() => {
            loadYearlyLeaderData(null, currentYear);
        }, 500);

    }
}


async function loadYearlyCharts(year) {
    try {
        showLoading(true);

        // Destroy các biểu đồ năm cũ
        if (window.yearlyCharts) {
            window.yearlyCharts.forEach(chart => {
                if (chart) chart.destroy();
            });
            window.yearlyCharts = [];
        }

        // Destroy biểu đồ trưởng máy theo năm
        ['yearlyLeaderChartLeft', 'yearlyLeaderChartRight', 'yearlyLeaderPaperLineChart', 'yearlyLeaderWasteLineChart'].forEach(canvasId => {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                const chart = Chart.getChart(canvas);
                if (chart) {
                    chart.destroy();
                }
            }
        });

        // Lấy dữ liệu theo năm
        const yearlyData = await fetchYearlyData(year);

        // Hiển thị biểu đồ
        displayYearlyMachineCharts(yearlyData, year);

        // Tạo biểu đồ trưởng máy cho năm này
        setTimeout(() => {
            loadYearlyLeaderData(yearlyData, year);
        }, 300);

        showLoading(false);
    } catch (error) {
        console.error('Lỗi khi tải biểu đồ năm:', error);
        showLoading(false);
    }
}



async function fetchYearlyData(year) {
    try {
        const response = await fetch(`/api/bieu-do/in/yearly-data?year=${year}`);
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu theo năm');
        }
        return await response.json();
    } catch (error) {
        console.error('Lỗi khi gọi API dữ liệu năm:', error);
        throw error;
    }
}


function displayYearlyMachineCharts(yearlyData, year) {
    const container = document.getElementById('yearlyChartsContainer');
    if (!container) return;

    // Destroy tất cả chart cũ
    if (window.yearlyCharts) {
        window.yearlyCharts.forEach(chart => {
            if (chart) chart.destroy();
        });
    }
    window.yearlyCharts = [];

    // Lấy danh sách máy từ dữ liệu thực tế
    const machines = Object.keys(yearlyData).sort();

    // THÊM DÒNG NÀY Ở ĐÂY - TRƯỚC KHI SỬ DỤNG
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

    console.log('🔍 DEBUG yearlyData:', yearlyData);
    console.log('🔍 DEBUG machines:', machines);

    if (machines.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h6>Không có dữ liệu máy cho năm này</h6>
            </div>
        `;
        return;
    }

    // Tạo HTML cho 2 biểu đồ line
    let html = `
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h6 class="mb-0"><i class="fas fa-chart-line me-2"></i>Biểu đồ thành phẩm theo tháng</h6>
                    </div>
                    <div class="card-body">
                        <div style="height: 400px; position: relative;">
                        <button class="chart-expand-btn" onclick="openFullscreen('yearlyPaperLineChart', 'Biểu đồ thành phẩm theo tháng')">
                                            <i class="fas fa-expand"></i>
                                        </button>
                            <canvas id="yearlyPaperLineChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-danger text-white">
                        <h6 class="mb-0"><i class="fas fa-chart-line me-2"></i>Biểu đồ phế liệu theo tháng</h6>
                    </div>
                    <div class="card-body">
                        <div style="height: 400px; position: relative;">
                        <button class="chart-expand-btn" onclick="openFullscreen('yearlyWasteLineChart', 'Biểu đồ phế liệu theo tháng')">
                                            <i class="fas fa-expand"></i>
                                        </button>
                            <canvas id="yearlyWasteLineChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Sản xuất theo trưởng máy - Trái</h6>
                            <select class="form-select form-select-sm" id="leaderSelectLeft" style="width: 200px;">
                                <option value="">Chọn trưởng máy</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body">
                        <div style="height: 400px; position: relative;">
                            <button class="chart-expand-btn" onclick="openFullscreen('yearlyLeaderChartLeft', '')">
                                <i class="fas fa-expand"></i>
                            </button>
                            <canvas id="yearlyLeaderChartLeft"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-warning text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Sản xuất theo trưởng máy - Phải</h6>
                            <select class="form-select form-select-sm" id="leaderSelectRight" style="width: 200px;">
                                <option value="">Chọn trưởng máy</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body">
                        <div style="height: 400px; position: relative;">
                            <button class="chart-expand-btn" onclick="openFullscreen('yearlyLeaderChartRight', '')">
                                <i class="fas fa-expand"></i>
                            </button>
                            <canvas id="yearlyLeaderChartRight"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>




        <div class="row mt-4">
    <div class="col-md-6">
        <div class="card">
            <div class="card-header bg-success text-white">
                <h6 class="mb-0"><i class="fas fa-chart-line me-2"></i>Biểu đồ thành phẩm theo trưởng máy</h6>
            </div>
            <div class="card-body">
                <div style="height: 400px; position: relative;">
                    <button class="chart-expand-btn" onclick="openFullscreen('yearlyLeaderPaperLineChart', 'Biểu đồ thành phẩm theo trưởng máy')">
                        <i class="fas fa-expand"></i>
                    </button>
                    <canvas id="yearlyLeaderPaperLineChart"></canvas>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="card">
            <div class="card-header bg-danger text-white">
                <h6 class="mb-0"><i class="fas fa-chart-line me-2"></i>Biểu đồ phế liệu theo trưởng máy</h6>
            </div>
            <div class="card-body">
                <div style="height: 400px; position: relative;">
                    <button class="chart-expand-btn" onclick="openFullscreen('yearlyLeaderWasteLineChart', 'Biểu đồ phế liệu theo trưởng máy')">
                        <i class="fas fa-expand"></i>
                    </button>
                    <canvas id="yearlyLeaderWasteLineChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>


    `;

    // Sau khi set container.innerHTML = html;
    container.innerHTML = html;


    // Tạo biểu đồ trưởng máy
    setTimeout(() => {
        loadYearlyLeaderData(yearlyData, year);
    }, 200);


    // THÊM TIMEOUT ĐỂ ĐỢI DOM RENDER
    setTimeout(() => {
        // Tạo datasets cho biểu đồ thành phẩm
        const paperDatasets = [];
        const wasteDatasets = [];
        const colors = [
            '#e8b0c9', '#accae3', '#e8c3a7', '#a9dbca', '#a3add9', '#dbd89e'
        ];

        console.log('🔍 Bắt đầu tạo datasets...');

        machines.forEach((machine, index) => {
            const machineData = yearlyData[machine] || {};
            const paperData = months.map(month => {
                const value = machineData[month]?.paper || 0;
                return value > 0 ? value : null;
            });
            const wasteData = months.map(month => {
                const value = machineData[month]?.waste || 0;
                return value > 0 ? value : null;
            });

            paperDatasets.push({
                label: `Máy ${machine}`,
                data: paperData,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
                fill: false,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 3,
                spanGaps: false
            });

            wasteDatasets.push({
                label: `Máy ${machine}`,
                data: wasteData,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
                fill: false,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 3,
                spanGaps: false
            });
        });

        console.log('📊 Final paperDatasets:', paperDatasets);
        console.log('📊 Final wasteDatasets:', wasteDatasets);

        // Tạo biểu đồ thành phẩm
        const paperCanvas = document.getElementById('yearlyPaperLineChart');
        console.log('🔍 Paper canvas element:', paperCanvas);

        if (paperCanvas) {
            console.log('✅ Tạo biểu đồ thành phẩm...');

            try {
                const paperChart = new Chart(paperCanvas, {
                    type: 'line',
                    data: {
                        labels: months,
                        datasets: paperDatasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: {
                                top: 40 // THÊM PADDING ĐỂ CHỪA CHỖ CHO LABEL
                            }
                        },
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                    usePointStyle: true,
                                    pointStyle: 'line',
                                    pointStyleWidth: 20,  // Làm đường line dài hơn
                                    font: {
                                        weight: 'bold',   // Làm chữ đậm
                                        size: 12
                                    },
                                    padding: 20          // Tăng khoảng cách giữa các legend items
                                }

                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                                    }
                                }
                            },
                            datalabels: {
                                display: true,
                                anchor: 'end',
                                align: function (context) {
                                    const datasetIndex = context.datasetIndex;
                                    const totalDatasets = context.chart.data.datasets.length;

                                    // Phân bổ vị trí để tránh overlap
                                    if (totalDatasets <= 3) {
                                        return datasetIndex === 0 ? 'top' : (datasetIndex === 1 ? 'bottom' : 'right');
                                    } else {
                                        // Với nhiều dataset, xoay vòng các vị trí
                                        const positions = ['top', 'bottom', 'right', 'left', 'center'];
                                        return positions[datasetIndex % positions.length];
                                    }
                                },
                                color: function (context) {
                                    // Sử dụng màu đậm hơn của đường line
                                    const originalColor = context.dataset.borderColor || context.dataset.backgroundColor;

                                    // Chuyển màu thành đậm hơn
                                    if (originalColor.includes('rgb(')) {
                                        // Giảm độ sáng xuống 30%
                                        return originalColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, function (match, r, g, b) {
                                            const newR = Math.max(0, Math.floor(r * 0.7));
                                            const newG = Math.max(0, Math.floor(g * 0.7));
                                            const newB = Math.max(0, Math.floor(b * 0.7));
                                            return `rgb(${newR}, ${newG}, ${newB})`;
                                        });
                                    }

                                    return originalColor;
                                },
                                font: {
                                    size: 9,
                                    weight: 'bold'
                                },
                                formatter: function (value) {
                                    return value > 0 ? formatNumber(value) : '';
                                },
                                padding: 4,
                                textAlign: 'center',
                                // Thêm stroke để label nổi bật hơn
                                textStrokeColor: 'white',
                                textStrokeWidth: 1
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Số lượng thành phẩm',
                                    font: {
                                        color: 'black',
                                        weight: 'bold'
                                    },
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Tháng',
                                    font: {
                                        color: 'black',
                                        weight: 'bold'
                                    },
                                }
                            }
                        }
                    }
                });

                window.yearlyCharts.push(paperChart);
                console.log('✅ Biểu đồ thành phẩm đã tạo thành công');

            } catch (error) {
                console.error('❌ Lỗi tạo biểu đồ thành phẩm:', error);
            }
        } else {
            console.error('❌ Không tìm thấy canvas thành phẩm');
        }

        // Tạo biểu đồ phế liệu
        const wasteCanvas = document.getElementById('yearlyWasteLineChart');
        console.log('🔍 Waste canvas element:', wasteCanvas);

        if (wasteCanvas) {
            console.log('✅ Tạo biểu đồ phế liệu...');

            try {
                const wasteChart = new Chart(wasteCanvas, {
                    type: 'line',
                    data: {
                        labels: months,
                        datasets: wasteDatasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: {
                                top: 40 // THÊM PADDING ĐỂ CHỪA CHỖ CHO LABEL
                            }
                        },
                        interaction: {
                            intersect: false,
                            mode: 'index'
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                    usePointStyle: true,
                                    pointStyle: 'line',
                                    pointStyleWidth: 20,  // Làm đường line dài hơn
                                    font: {
                                        weight: 'bold',   // Làm chữ đậm
                                        size: 12
                                    },
                                    padding: 20          // Tăng khoảng cách giữa các legend items
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                                    }
                                }
                            },
                            datalabels: {
                                display: true,
                                anchor: 'end',
                                align: function (context) {
                                    const datasetIndex = context.datasetIndex;
                                    const totalDatasets = context.chart.data.datasets.length;

                                    // Phân bổ vị trí để tránh overlap
                                    if (totalDatasets <= 3) {
                                        return datasetIndex === 0 ? 'top' : (datasetIndex === 1 ? 'bottom' : 'right');
                                    } else {
                                        // Với nhiều dataset, xoay vòng các vị trí
                                        const positions = ['top', 'bottom', 'right', 'left', 'center'];
                                        return positions[datasetIndex % positions.length];
                                    }
                                },
                                color: function (context) {
                                    // Sử dụng màu đậm hơn của đường line
                                    const originalColor = context.dataset.borderColor || context.dataset.backgroundColor;

                                    // Chuyển màu thành đậm hơn
                                    if (originalColor.includes('rgb(')) {
                                        // Giảm độ sáng xuống 30%
                                        return originalColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, function (match, r, g, b) {
                                            const newR = Math.max(0, Math.floor(r * 0.7));
                                            const newG = Math.max(0, Math.floor(g * 0.7));
                                            const newB = Math.max(0, Math.floor(b * 0.7));
                                            return `rgb(${newR}, ${newG}, ${newB})`;
                                        });
                                    }

                                    return originalColor;
                                },
                                font: {
                                    size: 9,
                                    weight: 'bold'
                                },
                                formatter: function (value) {
                                    return value > 0 ? formatNumber(value) : '';
                                },
                                padding: 4,
                                textAlign: 'center',
                                // Thêm stroke để label nổi bật hơn
                                textStrokeColor: 'white',
                                textStrokeWidth: 1
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Số lượng phế liệu',
                                    font: {
                                        color: 'black',
                                        weight: 'bold'
                                    },
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Tháng',
                                    font: {
                                        color: 'black',
                                        weight: 'bold'
                                    },
                                }
                            }
                        }
                    }
                });

                window.yearlyCharts.push(wasteChart);
                console.log('✅ Biểu đồ phế liệu đã tạo thành công');

            } catch (error) {
                console.error('❌ Lỗi tạo biểu đồ phế liệu:', error);
            }
        } else {
            console.error('❌ Không tìm thấy canvas phế liệu');
        }

    }, 100); // Đợi 100ms để DOM render xong

    // Tạo biểu đồ phế liệu
    const wasteCanvas = document.getElementById('yearlyWasteLineChart');
    if (wasteCanvas) {
        console.log('✅ Tạo biểu đồ phế liệu...');

        // Kiểm tra có dữ liệu không
        const hasWasteData = wasteDatasets.some(dataset =>
            dataset.data.some(value => value > 0)
        );

        if (!hasWasteData) {
            console.log('⚠️ Không có dữ liệu phế liệu');
            wasteCanvas.parentElement.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-chart-line fa-3x mb-3"></i>
                <h6>Không có dữ liệu phế liệu cho năm này</h6>
            </div>
        `;
        } else {
            const wasteChart = new Chart(wasteCanvas, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: wasteDatasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Số lượng phế liệu'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Tháng'
                            }
                        }
                    }
                }
            });

            window.yearlyCharts.push(wasteChart);
        }
    }

    container.innerHTML = html;

    // Tạo biểu đồ cho từng máy
    // const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

    machines.forEach(machine => {
        const paperCanvasId = `yearlyPaperChart_${machine.replace(/\s+/g, '_')}`;
        const wasteCanvasId = `yearlyWasteChart_${machine.replace(/\s+/g, '_')}`;

        const paperCanvas = document.getElementById(paperCanvasId);
        const wasteCanvas = document.getElementById(wasteCanvasId);

        if (!paperCanvas || !wasteCanvas) return;

        // Lấy dữ liệu cho máy này
        const machineData = yearlyData[machine] || {};
        const paperData = months.map(month => machineData[month]?.paper || 0);
        const wasteData = months.map(month => machineData[month]?.waste || 0);

        // Tạo biểu đồ thành phẩm
        const paperChart = new Chart(paperCanvas, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Thành phẩm',
                    data: paperData,
                    backgroundColor: 'rgba(174, 207, 188, 0.8)',
                    borderColor: 'rgba(148, 199, 169, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 40 // Thêm khoảng cách cho số liệu trên đầu
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `Thành phẩm: ${formatNumber(context.parsed.y)}`;
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        color: 'black',
                        font: {
                            size: 10,
                            weight: 'bold'
                        },
                        formatter: function (value) {
                            return value > 0 ? formatNumber(value) : '';
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng thành phẩm'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tháng'
                        }
                    }
                }
            }
        });

        // Tạo biểu đồ phế liệu
        const wasteChart = new Chart(wasteCanvas, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Phế liệu',
                    data: wasteData,
                    backgroundColor: 'rgba(248, 179, 181, 0.8)',
                    borderColor: 'rgba(255, 141, 152, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 40 // Thêm khoảng cách cho số liệu trên đầu
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `Phế liệu: ${formatNumber(context.parsed.y)}`;
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        color: 'black',
                        font: {
                            size: 10,
                            weight: 'bold'
                        },
                        formatter: function (value) {
                            return value > 0 ? formatNumber(value) : '';
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng phế liệu'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tháng'
                        }
                    }
                }
            }
        });

        window.yearlyCharts.push(paperChart, wasteChart);
    });
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

        const response = await fetch(`/api/bieu-do/in/chart-data?${params.toString()}&detail=true`);

        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu báo cáo');
        }

        const rawData = await response.json();
        console.log('📥 Raw data từ API:', rawData);

        // Xử lý dữ liệu thành format đúng
        const processedData = processApiData(rawData);
        console.log('🔄 Processed data:', processedData);


        return processedData;

        // Sửa phần catch error:
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);

        // Thử gọi lại không có detail=true
        try {
            const fallbackResponse = await fetch(`/api/bieu-do/in/chart-data?${params.toString()}`);
            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                console.warn('Sử dụng dữ liệu fallback (không có detail)');
                return fallbackData;
            }
        } catch (fallbackError) {
            console.error('Fallback cũng thất bại:', fallbackError);
        }

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


    // Hiển thị Top 10 Analytics
    displayTopAnalytics(data, filters);


    // Hiển thị section Top Analytics - ĐẢM BẢO LUÔN HIỂN THỊ
    const topAnalyticsSection = document.getElementById('topAnalyticsSection');
    if (topAnalyticsSection) {
        topAnalyticsSection.style.display = 'block';
        console.log('✅ Đã hiển thị topAnalyticsSection');
    } else {
        console.log('❌ Không tìm thấy topAnalyticsSection');
    }


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
    // Tính thời gian dừng máy (thời gian khác)
    const stopTime = data.stopReasons ?
        data.stopReasons.reduce((sum, reason) => sum + (reason.duration || 0), 0) : 0;

    console.log('📊 Thời gian dừng máy từ API:', stopTime, 'phút');

    // Tính tổng thời gian từ dữ liệu thực tế (thời gian kết thúc - thời gian bắt đầu)
    let totalTime = 0;
    if (data.reports && data.reports.length > 0) {
        totalTime = data.reports.reduce((sum, report) => {
            if (report.thoi_gian_bat_dau && report.thoi_gian_ket_thuc) {
                const start = new Date(report.thoi_gian_bat_dau);
                const end = new Date(report.thoi_gian_ket_thuc);

                // Với định dạng ISO, ca đêm sẽ có ngày khác nhau
                // Nếu end < start, có nghĩa là ca đêm qua ngày hôm sau
                let diff = Math.round((end - start) / (1000 * 60)); // phút

                // Nếu diff âm, có thể là ca đêm - cộng thêm 24 giờ
                if (diff < 0) {
                    diff += 24 * 60; // cộng 24 giờ = 1440 phút
                }

                return sum + diff;
            }
            return sum;
        }, 0);
    } else {
        totalTime = data.timeData?.totalTime || 0;
    }
    const setupTime = data.timeData?.setupTime || 0;

    // Thời gian chạy máy = tổng thời gian - thời gian canh máy - thời gian dừng máy
    const runTime = Math.max(0, totalTime - setupTime - stopTime);

    // Thời gian làm việc = tổng thời gian - thời gian dừng máy
    const workTime = runTime + setupTime;

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
                displayTotalTime = Math.round(totalTime * ratio);
                const displaySetupTime = Math.round(setupTime * ratio);
                displayStopTime = Math.round(stopTime * ratio);
                const displayRunTime = Math.max(0, displayTotalTime - displaySetupTime - displayStopTime);
                displayWorkTime = displayRunTime + displaySetupTime;
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
                        label: function (context) {
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


    // Xác định dữ liệu hiển thị
    let displayShiftData = [];
    if (data.shiftData && data.shiftData.length > 0) {
        displayShiftData = hasSpecificMacaFilter ?
            data.shiftData.filter(shift => shift.shift === filters.maca) :
            data.shiftData;
    }

    // Luôn hiển thị cả 2 container
    const totalContainer = totalChartCanvas.closest('.col-md-6');
    const shiftContainer = shiftChartCanvas.closest('.col-md-6');

    if (totalContainer) totalContainer.style.display = 'none';
    if (shiftContainer) shiftContainer.style.display = 'block';

    // // Tạo biểu đồ tổng
    // quantityChart = createTotalQuantityChartOnCanvas(totalChartCanvas, data);

    // // Tạo biểu đồ từng ca
    // if (data.shiftData && data.shiftData.length > 0) {
    //     console.log('📊 Có', data.shiftData.length, 'ca - hiển thị biểu đồ từng ca');

    //     // Nếu lọc mã ca cụ thể, chỉ hiển thị ca đó
    //     const displayShiftData = hasSpecificMacaFilter ?
    //         data.shiftData.filter(shift => shift.shift === filters.maca) :
    //         data.shiftData;

    //     if (displayShiftData.length > 0) {
    //         createMultipleShiftCharts(shiftChartCanvas, displayShiftData);
    //     } else {
    //         macaChart = createEmptyChart(shiftChartCanvas, `Không có dữ liệu ca ${filters.maca}`);
    //     }
    // } else {
    //     // Người dùng KHÔNG chọn mã ca cụ thể - hiển thị tổng + từng ca
    //     console.log('📊 Hiển thị biểu đồ tổng + từng ca');

    //     // Hiển thị cả 2 container
    //     const totalContainer = totalChartCanvas.closest('.col-md-6');
    //     const shiftContainer = shiftChartCanvas.closest('.col-md-6');

    //     if (totalContainer) totalContainer.style.display = 'block';
    //     if (shiftContainer) shiftContainer.style.display = 'block';

    //     // Tạo biểu đồ tổng
    //     quantityChart = createTotalQuantityChartOnCanvas(totalChartCanvas, data);

    //     // Tạo biểu đồ từng ca
    //     if (data.shiftData && data.shiftData.length > 0) {
    //         console.log('📊 Có', data.shiftData.length, 'ca - hiển thị biểu đồ từng ca');
    //         createMultipleShiftCharts(shiftChartCanvas, data.shiftData);
    //     } else {
    //         console.log('📊 Không có dữ liệu ca');
    //         macaChart = createEmptyChart(shiftChartCanvas, 'Không có dữ liệu ca');
    //     }
    // }

    // Tạo tất cả biểu đồ dạng multiple charts (bao gồm cả tổng)
    const allChartsData = [{
        shift: 'Tổng',
        paper: data.totalPaper || 0,
        waste: data.totalWaste || 0,
        isTotal: true
    }];

    // Sắp xếp displayShiftData theo thứ tự A-B-C-D-A1-B1-AB-AB--AB+-HC
    if (displayShiftData.length > 0) {
        const sortedShiftData = [...displayShiftData].sort((a, b) => {
            const aShift = a.shift.toString().toUpperCase();
            const bShift = b.shift.toString().toUpperCase();

            const order = ['A', 'B', 'C', 'D', 'A1', 'B1', 'AB', 'AB-', 'AB+', 'HC'];

            const aIndex = order.indexOf(aShift);
            const bIndex = order.indexOf(bShift);

            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }

            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;

            return aShift.localeCompare(bShift);
        });

        allChartsData.push(...sortedShiftData);
    }

    createMultipleShiftCharts(shiftChartCanvas, allChartsData);


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

    console.log('🎯 Tạo biểu đồ tổng với dữ liệu:', { totalPaper, totalWaste });
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
                            label: function (context) {
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
                        formatter: function (value, context) {
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

    let html = '<div class="">';

    html += `
    <div class="col-12 card-custom-sub border-left-sub">
        <div class="text-start mb-3 label-title-sub">
            Sản xuất theo mã ca
        </div>
        <div style="height: 400px; position: relative;">
        <button class="chart-expand-btn" onclick="openFullscreen('shiftStackedChart', 'Sản xuất theo mã ca')">
                                            <i class="fas fa-expand"></i>
                                        </button>
            <canvas id="shiftStackedChart"></canvas>
        </div>
    </div>
`;

    html += '</div>';

    multiContainer.innerHTML = html;
    cardBody.appendChild(multiContainer);

    // Tạo biểu đồ stacked cho tất cả ca
    const stackedCanvas = document.getElementById('shiftStackedChart');
    if (stackedCanvas) {
        createShiftStackedChart(stackedCanvas, shiftData);
    }
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
                    display: false // Ẩn legend
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
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
                    formatter: function (value, context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return percent + '%';
                    }
                }
            }
        }
    });
}



function createShiftStackedChart(canvas, shiftData) {
    // Lọc bỏ mục "Tổng" nếu có
    const filteredData = shiftData.filter(shift => !shift.isTotal);

    if (filteredData.length === 0) {
        const container = canvas.parentElement;
        container.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-exclamation-triangle"></i>
                <h6>Không có dữ liệu ca</h6>
            </div>
        `;
        return;
    }

    const labels = filteredData.map(shift => `Ca ${shift.shift}`);
    const paperData = filteredData.map(shift => shift.paper || 0);
    const wasteData = filteredData.map(shift => shift.waste || 0);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Thành phẩm',
                data: paperData,
                backgroundColor: 'rgba(174, 207, 188, 0.8)',
                borderColor: 'rgba(148, 199, 169, 1)',
                borderWidth: 1
            }, {
                label: 'Phế liệu',
                data: wasteData,
                backgroundColor: 'rgba(248, 179, 181, 0.8)',
                borderColor: 'rgba(255, 141, 152, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 40
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        // text: 'Mã ca',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Số lượng',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    anchor: function (context) {
                        return context.datasetIndex === 1 ? 'end' : 'center';
                    },
                    align: function (context) {
                        return context.datasetIndex === 1 ? 'top' : 'center';
                    },
                    color: function (context) {
                        return context.datasetIndex === 1 ? '#8b2635' : 'black';
                    },
                    font: {
                        size: 11,
                        weight: 'bold'
                    },
                    formatter: function (value, context) {
                        if (!value || value === 0) return '';

                        const dataIndex = context.dataIndex;
                        const datasets = context.chart.data.datasets;
                        const paperValue = datasets[0]?.data[dataIndex] || 0;
                        const wasteValue = datasets[1]?.data[dataIndex] || 0;
                        const total = paperValue + wasteValue;

                        if (total === 0) return '';

                        const percent = ((value / total) * 100).toFixed(1);

                        if (context.datasetIndex === 1) {
                            return `${formatNumber(value)}\n(${percent}%)`;
                        }

                        if (value < 1000) {
                            return `${percent}%`;
                        } else {
                            return `${formatNumber(value)}\n(${percent}%)`;
                        }
                    },
                    padding: {
                        top: 4,
                        bottom: 4
                    },
                    textAlign: 'center'
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
                        label: function (context) {
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
                    formatter: function (value, context) {
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
            // Sắp xếp dữ liệu theo mã ca theo thứ tự A-B-C-D-A1-B1-AB-AB--AB+-HC
            displayData.sort((a, b) => {
                const aShift = a.shift.toString().toUpperCase();
                const bShift = b.shift.toString().toUpperCase();

                // Định nghĩa thứ tự ưu tiên
                const order = ['A', 'B', 'C', 'D', 'A1', 'B1', 'AB', 'AB-', 'AB+', 'HC'];

                const aIndex = order.indexOf(aShift);
                const bIndex = order.indexOf(bShift);

                // Nếu cả hai đều có trong danh sách ưu tiên
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex;
                }

                // Nếu chỉ có một trong hai có trong danh sách ưu tiên
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;

                // Nếu cả hai đều không có trong danh sách ưu tiên, sắp xếp theo alphabet
                return aShift.localeCompare(bShift);
            });
            html += `
            <button class="btn btn-outline-info btn-sm mb-2 " onclick="switchToShiftLeaderTable()">
                <i class="fas fa-user-tie me-1"></i>Chuyển bảng trưởng máy
            </button>
            <div class="table-responsive" style="max-height: 400px; overflow-y: auto; overflow-x: auto;">
        <table class="table table-striped table-hover" style="min-width: 700px;">
                    <thead class="table-dark sticky-top" style="position: sticky; top: 0; z-index: 10;">
                        <tr>
                            <th>Mã Ca</th>
                            <th>Máy</th>
                            <th class="text-end">Tổng SL giấy</th>
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
                        <span class="badge" style="background-color: rgba(223, 140, 143, 0.8); color: white;">
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

    // Debug và tạo biểu đồ cột cho máy
    console.log('🔍 Kiểm tra dữ liệu cho biểu đồ máy:', data);

    if (data.reports && data.reports.length > 0) {
        let reportData = data.reports;

        // Lọc theo mã ca nếu có
        if (filters && filters.maca) {
            reportData = data.reports.filter(report => report.ma_ca === filters.maca);
            console.log('🔍 Dữ liệu sau khi lọc theo mã ca:', reportData.length);
        }

        console.log('🔍 Report data for chart:', reportData);

        if (reportData.length > 0) {
            setTimeout(() => {
                createMachineProductionChart(reportData);
            }, 200);
        }
    } else {
        console.log('⚠️ Không có data.reports để tạo biểu đồ máy');
    }

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
    // Tính tổng thời gian từ dữ liệu thực tế
    let totalTime = 0;
    if (data.reports && data.reports.length > 0) {
        totalTime = data.reports.reduce((sum, report) => {
            if (report.thoi_gian_bat_dau && report.thoi_gian_ket_thuc) {
                const start = new Date(report.thoi_gian_bat_dau);
                const end = new Date(report.thoi_gian_ket_thuc);

                let diff = (end - start) / (1000 * 60); // phút

                // Nếu diff âm, có thể là ca đêm - cộng thêm 24 giờ
                if (diff < 0) {
                    diff += 24 * 60; // cộng 24 giờ = 1440 phút
                }

                return sum + diff;
            }
            return sum;
        }, 0);
    } else {
        totalTime = data.timeData?.totalTime || 0;
    }

    // Sử dụng totalTime làm totalWorkTime (TG kết thúc - TG bắt đầu)
    const totalWorkTime = totalTime;

    let setupTime = data.timeData?.setupTime || 0;
    let otherTime = data.stopReasons ? data.stopReasons.reduce((sum, reason) => sum + (reason.duration || 0), 0) : 0;

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
    let runTime = 0;
    if (data && data.reports) {
        const { totalRunTime } = calculateProductionAndSampleTime(data.reports);
        runTime = totalRunTime;
    } else {
        runTime = Math.max(0, totalWorkTime - setupTime - otherTime);
    }



    console.log('🔍 Trước khi tạo timeChart:');
    console.log('- runTime:', runTime);
    console.log('- setupTime:', setupTime);
    console.log('- otherTime:', otherTime);
    console.log('- formatDuration(runTime):', formatDuration(runTime));



    console.log('⏰ Dữ liệu thời gian:', { runTime, setupTime, otherTime, totalTime });

    timeChart = new Chart(timeCtx, {
        type: 'pie',
        data: {
            labels: ['Thời gian chạy máy', 'Thời gian canh máy', 'Khác'],
            datasets: [{
                data: [runTime, setupTime, otherTime],
                backgroundColor: [
                    'rgb(175, 196, 215)',  // Xanh dương pastel dịu (thay cho xanh lá quá đậm)
                    'rgb(225, 203, 161)',  // Vàng kem pastel (dịu hơn)
                    'rgb(243, 174, 174)'   // Hồng nhạt pastel (dịu thay đỏ)
                ],
                borderColor: [
                    'rgb(165, 190, 214)',  // Xanh dương pastel viền
                    'rgb(223, 201, 158)',  // Vàng kem viền
                    'rgb(221, 152, 152)'   // Hồng pastel viền
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
                        label: function (context) {
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
                    formatter: function (value, context) {
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


    // Tạo biểu đồ máy nếu có dữ liệu
if (data && data.reports && data.reports.length > 0) {
    setTimeout(() => {
        createMachineTimeChart(data.reports);
    }, 200);
}

    // Cập nhật thông tin thời gian ở bên phân tích
    updateTimeAnalysisInfo({
        totalTime: totalTime,
        setupTime: setupTime,
        otherTime: otherTime, // Truyền otherTime đã tính toán
        runTime: runTime
    });


    // Tính toán và hiển thị thời gian sản xuất/chạy mẫu
    if (data && data.reports) {
        const { totalRunTime, productionTime, sampleTime, productionSetupTime, sampleSetupTime, productionStopTime, sampleStopTime } = calculateProductionAndSampleTime(data.reports);

        // Tính tổng thời gian cho sản xuất và mẫu
        const totalProductionTime = productionTime + productionSetupTime + productionStopTime;
        const totalSampleTime = sampleTime + sampleSetupTime + sampleStopTime;
        const totalTimeRight = totalProductionTime + totalSampleTime;

        // Debug tổng thời gian
        console.log('🔍 DEBUG tổng thời gian bên phải:');
        console.log('- productionTime:', productionTime, 'phút');
        console.log('- sampleTime:', sampleTime, 'phút');
        console.log('- setupTimeRight:', productionSetupTime, 'phút');
        console.log('- stopTimeRight:', productionStopTime, 'phút');
        console.log('- totalTimeRight (tính toán):', totalTimeRight, 'phút');
        console.log('- totalTimeRight (format):', formatDuration(totalTimeRight));

        // Cập nhật display bên phải
        const productionTimeEl = document.getElementById('productionTime');
        const sampleTimeEl = document.getElementById('sampleTime');
        const setupTimeRightEl = document.getElementById('setupTimeRight');
        const stopTimeRightEl = document.getElementById('stopTimeRight');
        const totalTimeRightEl = document.getElementById('totalTimeRight');

        // Thêm các element mới cho canh mẫu và dừng mẫu
        const sampleSetupTimeEl = document.getElementById('sampleSetupTime');
        const sampleStopTimeEl = document.getElementById('sampleStopTime');
        const totalSampleTimeEl = document.getElementById('totalSampleTime');

        if (productionTimeEl) productionTimeEl.textContent = formatDuration(productionTime);
        if (sampleTimeEl) sampleTimeEl.textContent = formatDuration(sampleTime);
        if (setupTimeRightEl) setupTimeRightEl.textContent = formatDuration(productionSetupTime);
        if (stopTimeRightEl) stopTimeRightEl.textContent = formatDuration(productionStopTime);
        if (sampleSetupTimeEl) sampleSetupTimeEl.textContent = formatDuration(sampleSetupTime);
        if (sampleStopTimeEl) sampleStopTimeEl.textContent = formatDuration(sampleStopTime);
        if (totalTimeRightEl) totalTimeRightEl.textContent = formatDuration(totalProductionTime);
        if (totalSampleTimeEl) totalSampleTimeEl.textContent = formatDuration(totalSampleTime);

        // Tạo biểu đồ chi tiết với thời gian đúng
        createSampleProductTimeChart(productionTime, productionSetupTime, productionStopTime, sampleTime, sampleSetupTime, sampleStopTime);

        console.log('✅ Cập nhật xong bên phải với cách mới');
    }



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
        'rgb(166, 219, 211)',  // Xanh mint nhạt
        'rgb(255, 186, 156)',  // Cam đào nhạt
        'rgb(181, 234, 215)',  // Xanh ngọc nhạt
        'rgb(203, 170, 203)',  // Tím pastel nhẹ
        'rgb(255, 218, 193)',  // Be sáng
        'rgb(226, 240, 203)',  // Xanh lá nhạt
        'rgb(255, 154, 162)',  // Hồng nhạt nổi bật
        'rgb(212, 165, 165)',  // Hồng đất nhẹ
        'rgb(213, 170, 255)',  // Tím oải hương
        'rgb(185, 251, 192)',  // Xanh bạc hà
        'rgb(255, 218, 170)',  // Vàng pastel nhạt
        'rgb(174, 198, 207)',  // Xanh baby blue pastel
        'rgb(210, 210, 210)',  // Xám nhạt trung tính
    ];
    // Tạo mảng combined để sắp xếp cùng nhau
    const combined = displayStopReasons.map((reason, index) => ({
        reason: reason.reason,
        duration: reason.duration,
        color: colors[index % colors.length]
    }));

    // Sắp xếp theo thứ tự F1-F13
    combined.sort((a, b) => {
        const aMatch = a.reason.match(/F(\d+)/);
        const bMatch = b.reason.match(/F(\d+)/);

        if (aMatch && bMatch) {
            return parseInt(aMatch[1]) - parseInt(bMatch[1]);
        }

        // Nếu không match pattern F+số, sắp xếp theo alphabet
        return a.reason.localeCompare(b.reason);
    });

    // Tách lại thành các mảng riêng sau khi sắp xếp
    const sortedLabels = combined.map(item => item.reason);
    const sortedDurations = combined.map(item => item.duration);
    const sortedColors = combined.map(item => item.color);

    stopReasonChart = new Chart(stopReasonCtx, {
        type: 'pie',
        data: {
            labels: sortedLabels,  // Sử dụng labels đã sắp xếp
            datasets: [{
                data: sortedDurations,  // Sử dụng durations đã sắp xếp
                backgroundColor: sortedColors,  // Sử dụng colors đã sắp xếp
                borderColor: sortedColors.map(color => color.replace('0.8', '1')),
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
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${formatDuration(context.parsed)} (${percent}%)`;
                        }
                    }
                },
                datalabels: {
                    display: function (context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = total > 0 ? ((context.parsed / total) * 100) : 0;
                        return percent >= 5; // Chỉ hiển thị label nếu >= 5%
                    },
                    color: 'white',
                    font: {
                        size: 11,
                        weight: 'bold'
                    },
                    formatter: function (value, context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return percent + '%';
                    },
                    anchor: 'center',
                    align: 'center'
                }
            }
        }
    });
}



// Cập nhật thông tin thời gian
function updateTimeAnalysisInfo(timeData) {
    console.log('🎯 updateTimeAnalysisInfo được gọi!');

    // Lấy các element DOM
    const runTimeEl = document.getElementById('runTime');
    const setupTimeEl = document.getElementById('setupTime');
    const otherTimeEl = document.getElementById('otherTime');
    const totalTimeEl = document.getElementById('totalTime');
    const totalWorkHoursEl = document.getElementById('totalWorkHours');

    if (!timeData) {
        console.log('❌ Không có timeData');
        return;
    }

    const setupTime = timeData.setupTime || 0;
    const otherTime = timeData.otherTime || 0;

    // Tính tổng thời gian từ dữ liệu báo cáo thực tế (GIỐNG CODE CŨ)
    let totalTime = 0;
    if (currentChartData && currentChartData.reports) {
        totalTime = currentChartData.reports.reduce((sum, report) => {
            if (report.thoi_gian_bat_dau && report.thoi_gian_ket_thuc) {
                const start = new Date(report.thoi_gian_bat_dau);
                const end = new Date(report.thoi_gian_ket_thuc);

                let diff = (end - start) / (1000 * 60); // phút
                if (diff < 0) {
                    diff += 24 * 60; // cộng 24 giờ = 1440 phút
                }
                return sum + diff;
            }
            return sum;
        }, 0);
    } else {
        totalTime = timeData?.totalTime || 0;
    }

    // Tính thời gian chạy máy bằng cách mới
    let runTime = timeData.runTime || 0;
    if (runTime === 0) {
        // Fallback: tính lại nếu không có runTime được truyền vào
        if (currentChartData && currentChartData.reports) {
            const { totalRunTime } = calculateProductionAndSampleTime(currentChartData.reports);
            runTime = totalRunTime;
        } else {
            runTime = Math.max(0, totalTime - setupTime - otherTime);
        }
    }

    // Cập nhật display bên trái
    if (runTimeEl) runTimeEl.textContent = formatDuration(runTime);
    if (setupTimeEl) setupTimeEl.textContent = formatDuration(setupTime);
    if (otherTimeEl) otherTimeEl.textContent = formatDuration(otherTime);
    if (totalTimeEl) totalTimeEl.textContent = formatDuration(runTime + setupTime + otherTime); // SỬA: cộng lại thay vì dùng totalTime

    // Tính tổng thời gian làm việc theo ca và ngày (logic định nghĩa ca)
    let totalWorkHoursByDay = 0;

    // Định nghĩa thời gian chuẩn cho từng mã ca (tính bằng giờ)
    const shiftHours = {
        'A': 8,     // 6H - 14H
        'B': 8,     // 14H - 22H  
        'C': 8,     // 22H - 6H
        'D': 12,    // 10H - 22H
        'A1': 12,   // 6H - 18H
        'B1': 12,   // 18H - 6H
        'AB': 9,    // 7H - 16H
        'AB-': 8,   // 7H - 15H
        'AB+': 10,  // 7H - 17H
        'HC': 9     // 8H - 17H
    };

    if (currentChartData && currentChartData.reports && currentChartData.reports.length > 0) {
        let workTimeByDay = {};

        console.log('🔍 Tính toán tổng thời gian làm việc theo định nghĩa mã ca:');
        console.log('🔍 Số báo cáo:', currentChartData.reports.length);

        currentChartData.reports.forEach((report, index) => {
            const workDate = report.ngay_phu ? new Date(report.ngay_phu).toISOString().split('T')[0] :
                new Date(report.thoi_gian_bat_dau).toISOString().split('T')[0];
            const maCa = report.ma_ca || 'Unknown';
            const may = report.may || 'Unknown';

            // Lấy số giờ chuẩn của ca này
            const caHours = shiftHours[maCa] || 8; // Mặc định 8 giờ nếu không tìm thấy

            const dayKey = workDate;
            const machineShiftKey = `${may}_${maCa}`;

            if (!workTimeByDay[dayKey]) {
                workTimeByDay[dayKey] = {
                    date: workDate,
                    totalHours: 0,
                    shifts: {}
                };
            }

            // Chỉ cộng thời gian nếu ca này của máy này chưa được tính trong ngày
            if (!workTimeByDay[dayKey].shifts[machineShiftKey]) {
                workTimeByDay[dayKey].shifts[machineShiftKey] = {
                    machine: may,
                    shift: maCa,
                    hours: caHours
                };
                workTimeByDay[dayKey].totalHours += caHours;
                console.log(`📅 ${workDate} - Máy ${may} - Ca ${maCa}: ${caHours} giờ`);
            }
        });

        // Cộng tổng thời gian từ tất cả các ngày
        Object.values(workTimeByDay).forEach(dayData => {
            totalWorkHoursByDay += dayData.totalHours;
        });

        console.log(`📊 TỔNG THỜI GIAN LÀM VIỆC THEO CA: ${totalWorkHoursByDay} giờ`);
    }

    // Cập nhật tổng thời gian làm việc theo ca
    if (totalWorkHoursEl) {
        totalWorkHoursEl.textContent = `${totalWorkHoursByDay} giờ`;
        console.log('✅ Đã cập nhật totalWorkHours:', `${totalWorkHoursByDay} giờ`);
    } else {
        console.log('❌ Không tìm thấy element totalWorkHours');
    }

    console.log('✅ updateTimeAnalysisInfo hoàn thành');
}


// Hiển thị phân tích thời gian
function displayTimeAnalysis(data, filters) {
    const stopReasonsEl = document.getElementById('stopReasonsAnalysis');
    if (!stopReasonsEl) return;



    // Tính tổng thời gian làm việc theo mã ca và ngày
    let totalWorkHoursByDay = 0;

    console.log('🎯 displayTimeAnalysis được gọi!');

    // Định nghĩa thời gian chuẩn cho từng mã ca (tính bằng giờ)
    const shiftHours = {
        'A': 8,     // 6H - 14H
        'B': 8,     // 14H - 22H  
        'C': 8,     // 22H - 6H
        'D': 12,    // 10H - 22H
        'A1': 12,   // 6H - 18H
        'B1': 12,   // 18H - 6H
        'AB': 9,    // 7H - 16H
        'AB-': 8,   // 7H - 15H
        'AB+': 10,  // 7H - 17H
        'HC': 9     // 8H - 17H
    };

    if (data && data.reports && data.reports.length > 0) {
        let workTimeByDay = {};

        console.log('🔍 Tính toán tổng thời gian làm việc theo định nghĩa mã ca:');
        console.log('🔍 Số báo cáo:', data.reports.length);

        data.reports.forEach((report, index) => {
            const workDate = report.ngay_phu ? new Date(report.ngay_phu).toISOString().split('T')[0] :
                new Date(report.thoi_gian_bat_dau).toISOString().split('T')[0];
            const maCa = report.ma_ca || 'Unknown';
            const may = report.may || 'Unknown';

            // Lấy số giờ chuẩn của ca này
            const caHours = shiftHours[maCa] || 8; // Mặc định 8 giờ nếu không tìm thấy

            console.log(`🔍 Báo cáo ${index}: ${workDate} | Máy ${may} | Ca ${maCa} | ${caHours} giờ (chuẩn)`);

            const dayKey = workDate;
            const machineShiftKey = `${may}_${maCa}`;

            if (!workTimeByDay[dayKey]) {
                workTimeByDay[dayKey] = {
                    date: workDate,
                    totalHours: 0,
                    shifts: {}
                };
                console.log(`📅 Tạo mới ngày: ${dayKey}`);
            }

            // Chỉ cộng thời gian nếu ca này của máy này chưa được tính trong ngày
            if (!workTimeByDay[dayKey].shifts[machineShiftKey]) {
                workTimeByDay[dayKey].shifts[machineShiftKey] = {
                    machine: may,
                    shift: maCa,
                    hours: caHours
                };
                workTimeByDay[dayKey].totalHours += caHours;

            }

            console.log(`    - Tổng ngày ${workDate}: ${workTimeByDay[dayKey].totalHours} giờ`);
            console.log('---');
        });

        console.log('📊 CHI TIẾT TỪNG NGÀY:');
        Object.values(workTimeByDay).forEach(dayData => {
            totalWorkHoursByDay += dayData.totalHours;
            console.log(`📅 ${dayData.date}:`);
            console.log(`   - Tổng: ${dayData.totalHours} giờ`);
            console.log('   - Chi tiết ca:');
            Object.entries(dayData.shifts).forEach(([key, shift]) => {
                console.log(`     + ${shift.machine}-${shift.shift}: ${shift.hours} giờ`);
            });
            console.log('---');
        });

        console.log(`📊 TỔNG THỜI GIAN LÀM VIỆC THEO CA: ${totalWorkHoursByDay} giờ`);
    }

    // Cập nhật hiển thị (chuyển giờ thành phút để dùng formatDuration)
    const totalWorkHoursEl = document.getElementById('totalWorkHours');
    if (totalWorkHoursEl) {
        totalWorkHoursEl.textContent = `${totalWorkHoursByDay} giờ`;
        console.log('✅ Đã cập nhật totalWorkHours:', `${totalWorkHoursByDay} giờ`);
    }




    // THÊM 3 NÚT NGAY SAU totalWorkHours
    const timeAnalysisEl = document.getElementById('timeAnalysis');
    if (timeAnalysisEl) {
        // Tìm container chứa totalWorkHours
        const totalWorkHoursContainer = timeAnalysisEl.querySelector('#totalWorkHours').closest('.d-flex');

        // Kiểm tra xem đã có 3 nút chưa để tránh tạo lại
        if (totalWorkHoursContainer && !timeAnalysisEl.querySelector('#btnSanXuat')) {
            const buttonsHtml = `
            <div class="mt-3 text-center">
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-success btn-sm active" id="btnSanXuat" onclick="switchTimeAnalysisMode('sanxuat')">
                        <i class="fas fa-industry me-1"></i>Tổng quan
                    </button>
                    <button type="button" class="btn btn-outline-success btn-sm" id="btnMaCa" onclick="switchTimeAnalysisMode('maca')">
                        <i class="fas fa-clock me-1"></i>Ca
                    </button>
                    <button type="button" class="btn btn-outline-success btn-sm" id="btnTruongMay" onclick="switchTimeAnalysisMode('truongmay')">
                        <i class="fas fa-user-tie me-1"></i>Trưởng máy
                    </button>
                    <button type="button" class="btn btn-outline-success btn-sm" id="btnMay" onclick="switchTimeAnalysisMode('may')">
                <i class="fas fa-cogs me-1"></i>Máy
            </button>
                </div>
            </div>
        `;
            totalWorkHoursContainer.insertAdjacentHTML('afterend', buttonsHtml);
        }
    }



    let html = '';

    // Chỉ hiển thị khi có lý do dừng máy (thời gian khác > 0)
    if (data.timeData && data.timeData.otherTime > 0 && data.stopReasons && data.stopReasons.length > 0) {
        html += `
            <div class="mt-3  card-custom-sub " style=" border-left: 6px solid rgb(199, 196, 145);">
            <div class="label-title-sub" style=" background-color:rgb(242, 244, 211);">
                <i class="fas fa-exclamation-triangle text-warning me-2"></i>Chi tiết thời gian dừng máy:
                </div>
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


        // Sắp xếp lý do dừng máy theo thứ tự F1, F2, F3...
        data.stopReasons.sort((a, b) => {
            const aReason = a.reason.toString();
            const bReason = b.reason.toString();

            const aMatch = aReason.match(/F(\d+)/);
            const bMatch = bReason.match(/F(\d+)/);

            if (aMatch && bMatch) {
                return parseInt(aMatch[1]) - parseInt(bMatch[1]);
            }

            return aReason.localeCompare(bReason);
        });

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
                <div class="my-2 text-center">
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



    // Wrap nội dung lý do dừng máy vào container
    const wrappedHtml = `
    <div id="timeAnalysisContent">
        ${html}
    </div>
`;

    stopReasonsEl.innerHTML = wrappedHtml;


}




// Tính toán thời gian sản xuất và chạy mẫu
function calculateProductionAndSampleTime(reports) {
    let totalRunTime = 0;
    let productionTime = 0;
    let sampleTime = 0;
    let productionSetupTime = 0;
    let sampleSetupTime = 0;
    let productionStopTime = 0;
    let sampleStopTime = 0;

    reports.forEach((report, index) => {
        const ws = report.ws || '';

        if (report.thoi_gian_bat_dau && report.thoi_gian_ket_thuc) {
            const start = new Date(report.thoi_gian_bat_dau);
            const end = new Date(report.thoi_gian_ket_thuc);

            let totalSeconds = (end - start) / 1000;
            if (totalSeconds < 0) totalSeconds += 24 * 60 * 60;
            let totalMinutes = totalSeconds / 60; // Không làm tròn, giữ chính xác

            const setupMinutes = Math.round(parseFloat(report.thoi_gian_canh_may) || 0); // THÊM Math.round
            const stopMinutes = Math.round(report.stopTime || 0); // THÊM Math.round
            const actualTime = Math.max(0, totalMinutes - setupMinutes - stopMinutes);

            // Tất cả báo cáo đều tính vào thời gian chạy máy
            totalRunTime += actualTime;

            if (ws.includes('M')) {
                // Báo cáo chạy mẫu
                sampleTime += actualTime;
                sampleSetupTime += setupMinutes;
                sampleStopTime += stopMinutes;
            } else {
                // Báo cáo sản xuất
                productionTime += actualTime;
                productionSetupTime += setupMinutes;
                productionStopTime += stopMinutes;
            }
        }
    });

    return { totalRunTime, productionTime, sampleTime, productionSetupTime, sampleSetupTime, productionStopTime, sampleStopTime };
}



// Tạo biểu đồ thời gian chi tiết
function createSampleProductTimeChart(productionTime, productionSetupTime, productionStopTime, sampleTime, sampleSetupTime, sampleStopTime) {
    if (sampleProductTimeChart) {
        sampleProductTimeChart.destroy();
        sampleProductTimeChart = null;
    }

    const detailTimeCtx = document.getElementById('sampleProductTimeChart');
    if (!detailTimeCtx) return;

    sampleProductTimeChart = new Chart(detailTimeCtx, {
        type: 'pie',
        data: {
            labels: ['TG sản xuất', 'TG canh máy SX', 'TG dừng máy SX', 'TG chạy mẫu', 'TG canh mẫu', 'TG dừng máy mẫu'],
            datasets: [{
                data: [productionTime, productionSetupTime, productionStopTime, sampleTime, sampleSetupTime, sampleStopTime],
                backgroundColor: [
                    'rgb(119, 191, 220)',  // Xanh da trời - TG sản xuất
                    'rgb(176, 162, 224)',  // Vàng kem - TG canh máy SX  
                    'rgb(242, 174, 174)',  // Hồng nhạt - TG dừng máy SX
                    'rgb(119, 195, 141)',  // Xanh lá - TG chạy mẫu
                    'rgb(255, 218, 185)',  // Cam nhạt - TG canh mẫu
                    'rgb(255, 182, 198)'   // Hồng đậm - TG dừng máy mẫu
                ],
                borderColor: [
                    'rgb(104, 168, 194)',  // Xanh da trời - TG sản xuất
                    'rgb(159, 147, 197)',  // Vàng kem - TG canh máy SX  
                    'rgb(209, 147, 147)',  // Hồng nhạt - TG dừng máy SX
                    'rgb(109, 172, 127)',  // Xanh lá - TG chạy mẫu
                    'rgb(219, 185, 155)',  // Cam nhạt - TG canh mẫu
                    'rgb(231, 162, 177)'   // Hồng đậm - TG dừng máy mẫu
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
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                            return `${context.label}: ${formatDuration(context.parsed)} (${percent}%)`;
                        }
                    }
                },
                datalabels: {
                    display: false,
                    color: 'white',
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    formatter: function (value, context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return percent + '%';
                    }
                }
            }
        }
    });
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


    // Reset phân trang
    resetPagination();


    showNotification('Đã reset bộ lọc', 'info');

}


// Biến lưu chart instance fullscreen
let fullscreenChart = null;

// Hàm mở fullscreen
function openFullscreen(canvasId, title) {
    const originalCanvas = document.getElementById(canvasId);
    const originalChart = Chart.getChart(originalCanvas);

    if (!originalCanvas || !originalChart) {
        console.error('Không tìm thấy chart:', canvasId);
        return;
    }

    // Hiển thị modal
    const modal = document.getElementById('fullscreenModal');
    modal.style.display = 'block';
    document.getElementById('fullscreenTitle').textContent = title;

    // Destroy chart cũ nếu có
    if (fullscreenChart) {
        fullscreenChart.destroy();
        fullscreenChart = null;
    }


    const originalChartContainer = originalCanvas.closest('.card');
    const controlsToMove = [];

    // Tìm các dropdown/select controls trong cùng card (BỎ QUA dropdown tốc độ)
    const cardHeader = originalChartContainer.querySelector('.card-header');
    if (cardHeader) {
        const selects = cardHeader.querySelectorAll('select');

        selects.forEach(select => {
            // BỎ QUA dropdown tốc độ vì sẽ xử lý riêng
            if (select.id.includes('speedMachineSelect')) {
                return;
            }

            const controlGroup = select.closest('.d-flex') || select.parentElement;
            if (controlGroup) {
                const clonedControl = controlGroup.cloneNode(true);
                const clonedSelect = clonedControl.querySelector('select');
                if (clonedSelect) {
                    clonedSelect.id = clonedSelect.id + '_fullscreen';
                }
                controlsToMove.push(clonedControl);
            }
        });
    }


    if (canvasId === 'leaderShiftStackedChart') {
        // Tìm dropdown trong cùng container
        const leaderDropdown = originalChartContainer.querySelector('#leaderSelect');
        if (leaderDropdown) {
            // CHỈ CLONE SELECT, KHÔNG CLONE CẢ CONTROL GROUP
            const clonedSelect = leaderDropdown.cloneNode(true);
            clonedSelect.id = 'leaderSelect_fullscreen';

            // TẠO CONTAINER MỚI CHỈ CHỨA SELECT
            const selectContainer = document.createElement('div');
            selectContainer.appendChild(clonedSelect);

            controlsToMove.push(selectContainer);
        }
    } else if (canvasId === 'topSpeedLeftChart' || canvasId === 'topSpeedRightChart') {
        // ĐÃ SỬA: Chỉ copy dropdown tương ứng với biểu đồ đang mở
        const side = canvasId === 'topSpeedLeftChart' ? 'Left' : 'Right';
        const speedDropdown = originalChartContainer.querySelector(`#speedMachineSelect${side}`);

        if (speedDropdown) {
            const controlGroup = speedDropdown.closest('.d-flex') || speedDropdown.parentElement;
            if (controlGroup) {
                const clonedControl = controlGroup.cloneNode(true);
                const clonedSelect = clonedControl.querySelector('select');
                if (clonedSelect) {
                    clonedSelect.id = `speedMachineSelect${side}_fullscreen`;
                    // XÓA LABEL TRÙNG LẶP
                    const label = clonedControl.querySelector('h6');
                    if (label) {
                        label.remove();
                    }
                }
                controlsToMove.push(clonedControl);
            }
        }
    }


    // Thêm controls vào modal title area
    const fullscreenTitle = document.getElementById('fullscreenTitle');
    if (controlsToMove.length > 0) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'd-flex justify-content-between align-items-center';
        controlsContainer.style.marginTop = '10px';

        const titleDiv = document.createElement('div');
        // ĐÃ SỬA: Xử lý title riêng cho biểu đồ tốc độ và trưởng máy
        if (canvasId === 'topSpeedLeftChart' || canvasId === 'topSpeedRightChart') {
            const side = canvasId === 'topSpeedLeftChart' ? 'trái' : 'phải';
            titleDiv.textContent = `Top 10 tốc độ - Máy ${side}`;
        } else if (canvasId === 'leaderShiftStackedChart') {
            titleDiv.textContent = 'Sản xuất theo ca - Trưởng máy';
        } else {
            titleDiv.textContent = title;
        }

        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.fontSize = '18px';

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'd-flex gap-2';

        controlsToMove.forEach(control => {
            controlsDiv.appendChild(control);
        });

        controlsContainer.appendChild(titleDiv);
        controlsContainer.appendChild(controlsDiv);

        fullscreenTitle.innerHTML = '';
        fullscreenTitle.appendChild(controlsContainer);
    } else {
        fullscreenTitle.textContent = title;
    }


    // Đợi modal hiển thị xong rồi mới tạo chart
    setTimeout(() => {
        const fullscreenCanvas = document.getElementById('fullscreenCanvas');

        // Copy toàn bộ config từ chart gốc
        const originalConfig = originalChart.config;

        let config;

        // Kiểm tra nếu là biểu đồ trưởng máy
        if (canvasId === 'yearlyLeaderChartLeft' || canvasId === 'yearlyLeaderChartRight') {
            config = {
                type: 'bar',
                data: {
                    labels: [...originalChart.data.labels],
                    datasets: originalChart.data.datasets.map(dataset => ({
                        ...dataset,
                        data: [...dataset.data]
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        x: {
                            stacked: true,
                            title: {
                                display: true,
                                // text: 'Tháng - Ca',
                                font: { weight: 'bold' }
                            },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 0
                            }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Số lượng',
                                font: { weight: 'bold' }
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: title,
                            font: { size: 18, weight: 'bold' }
                        },
                        legend: {
                            position: 'bottom',
                            labels: { usePointStyle: true, padding: 15 }
                        },
                        tooltip: {
                            callbacks: {
                                title: function (context) {
                                    const label = context[0].label;
                                    const [month, shift] = label.split('-');
                                    return shift ? `${month} - Ca ${shift}` : month;
                                },
                                label: function (context) {
                                    return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                                }
                            }
                        },
                        datalabels: {
                            display: true,
                            anchor: function (context) {
                                return context.datasetIndex === 0 ? 'center' : 'end';
                            },
                            align: function (context) {
                                return context.datasetIndex === 0 ? 'center' : 'top';
                            },
                            color: function (context) {
                                return context.datasetIndex === 0 ? 'black' : '#8b2635';
                            },
                            font: { size: 12, weight: 'bold' },
                            textAlign: 'center',
                            formatter: function (value, context) {
                                if (!value || value === 0) return '';

                                const dataIndex = context.dataIndex;
                                const datasets = context.chart.data.datasets;
                                const paperValue = datasets[0]?.data[dataIndex] || 0;
                                const wasteValue = datasets[1]?.data[dataIndex] || 0;
                                const total = paperValue + wasteValue;

                                if (total === 0) return '';

                                const percent = ((value / total) * 100).toFixed(1);
                                return `${formatNumber(value)}\n(${percent}%)`;
                            },
                            padding: 4,
                            textAlign: 'center'
                        }
                    }
                },
                plugins: [ChartDataLabels]
            };
        } else if (canvasId === 'leaderShiftStackedChart') {
            config = {
                type: 'bar',
                data: {
                    labels: [...originalChart.data.labels],
                    datasets: originalChart.data.datasets.map(dataset => ({
                        ...dataset,
                        data: [...dataset.data]
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 20
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            title: {
                                display: true,
                                // text: 'Khách hàng'
                            },
                            ticks: {
                                display: true,
                                maxRotation: 45,
                                minRotation: 30,
                                font: {
                                    size: 12  // Font lớn hơn khi fullscreen
                                },
                                callback: function (value, index, values) {
                                    const label = this.getLabelForValue(value);
                                    // Không wrap text trong fullscreen, để chéo để đọc rõ hơn
                                    return label;
                                }
                            }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Số lượng',
                                font: { weight: 'bold' }
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: title,
                            font: { size: 18, weight: 'bold' }
                        },
                        legend: {
                            position: 'bottom',
                            labels: { usePointStyle: true, padding: 15 }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                                },
                                footer: function (tooltipItems) {
                                    let total = 0;
                                    tooltipItems.forEach(item => {
                                        total += item.parsed.y;
                                    });
                                    return `Tổng: ${formatNumber(total)}`;
                                }
                            }
                        },
                        datalabels: {
                            display: true,
                            anchor: function (context) {
                                return context.datasetIndex === 1 ? 'end' : 'center';
                            },
                            align: function (context) {
                                return context.datasetIndex === 1 ? 'top' : 'center';
                            },
                            color: function (context) {
                                return context.datasetIndex === 1 ? '#8b2635' : 'black';
                            },
                            font: { size: 12, weight: 'bold' },
                            textAlign: 'center',
                            formatter: function (value, context) {
                                if (!value || value === 0) return '';

                                const dataIndex = context.dataIndex;
                                const datasets = context.chart.data.datasets;
                                const paperValue = datasets[0]?.data[dataIndex] || 0;
                                const wasteValue = datasets[1]?.data[dataIndex] || 0;
                                const total = paperValue + wasteValue;

                                if (total === 0) return '';

                                const percent = ((value / total) * 100).toFixed(1);
                                return `${formatNumber(value)}\n(${percent}%)`;
                            },
                            padding: 4,
                            textAlign: 'center'
                        }
                    }
                },
                plugins: [ChartDataLabels]
            };
        } else if (canvasId === 'machineLeaderStackedChart') {
            config = {
                type: 'bar',
                data: {
                    labels: [...originalChart.data.labels],
                    datasets: originalChart.data.datasets.map(dataset => ({
                        ...dataset,
                        data: [...dataset.data]
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { top: 40 } },
                    scales: {
                        x: {
                            stacked: true,
                            title: { display: true, font: { weight: 'bold' } }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            title: { display: true, text: 'Số lượng', font: { weight: 'bold' } }
                        }
                    },
                    plugins: {
                        title: { display: false, text: title, font: { size: 18, weight: 'bold' } },
                        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } },
                        tooltip: originalConfig.options.plugins?.tooltip || { enabled: true },
                        datalabels: {
                            display: true,
                            anchor: function (context) {
                                return context.datasetIndex === 1 ? 'end' : 'center';
                            },
                            align: function (context) {
                                return context.datasetIndex === 1 ? 'top' : 'center';
                            },
                            color: function (context) {
                                return context.datasetIndex === 1 ? '#8b2635' : 'black';
                            },
                            font: { size: 12, weight: 'bold' },
                            textAlign: 'center',
                            formatter: function (value, context) {
                                if (!value || value === 0) return '';
                                const dataIndex = context.dataIndex;
                                const datasets = context.chart.data.datasets;
                                const paperValue = datasets[0]?.data[dataIndex] || 0;
                                const wasteValue = datasets[1]?.data[dataIndex] || 0;
                                const total = paperValue + wasteValue;
                                if (total === 0) return '';
                                const percent = ((value / total) * 100).toFixed(1);
                                if (context.datasetIndex === 1) {
                                    return `${formatNumber(value)}\n(${percent}%)`;
                                }
                                if (value < 1000) {
                                    return `${percent}%`;
                                } else {
                                    return `${formatNumber(value)}\n(${percent}%)`;
                                }
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            };
        } else if (canvasId === 'shiftStackedChart') {
            config = {
                type: 'bar',
                data: {
                    labels: [...originalChart.data.labels],
                    datasets: originalChart.data.datasets.map(dataset => ({
                        ...dataset,
                        data: [...dataset.data]
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { top: 40 } },
                    scales: {
                        x: {
                            stacked: true,
                            title: { display: true, font: { weight: 'bold' } }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            title: { display: true, text: 'Số lượng', font: { weight: 'bold' } }
                        }
                    },
                    plugins: {
                        title: { display: false, text: title, font: { size: 18, weight: 'bold' } },
                        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } },
                        tooltip: originalConfig.options.plugins?.tooltip || { enabled: true },
                        datalabels: {
                            display: true,
                            anchor: function (context) {
                                return context.datasetIndex === 1 ? 'end' : 'center';
                            },
                            align: function (context) {
                                return context.datasetIndex === 1 ? 'top' : 'center';
                            },
                            color: function (context) {
                                return context.datasetIndex === 1 ? '#8b2635' : 'black';
                            },
                            font: { size: 12, weight: 'bold' },
                            textAlign: 'center',
                            formatter: function (value, context) {
                                if (!value || value === 0) return '';
                                const dataIndex = context.dataIndex;
                                const datasets = context.chart.data.datasets;
                                const paperValue = datasets[0]?.data[dataIndex] || 0;
                                const wasteValue = datasets[1]?.data[dataIndex] || 0;
                                const total = paperValue + wasteValue;
                                if (total === 0) return '';
                                const percent = ((value / total) * 100).toFixed(1);
                                if (context.datasetIndex === 1) {
                                    return `${formatNumber(value)}\n(${percent}%)`;
                                }
                                if (value < 1000) {
                                    return `${percent}%`;
                                } else {
                                    return `${formatNumber(value)}\n(${percent}%)`;
                                }
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            };
        } else if (canvasId === 'machineStackedChart') {
            config = {
                type: 'bar',
                data: {
                    labels: [...originalChart.data.labels],
                    datasets: originalChart.data.datasets.map(dataset => ({
                        ...dataset,
                        data: [...dataset.data]
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { top: 40 } },
                    scales: {
                        x: {
                            stacked: true,
                            title: { display: true, font: { weight: 'bold' } }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            title: { display: true, text: 'Số lượng', font: { weight: 'bold' } }
                        }
                    },
                    plugins: {
                        title: { display: false, text: title, font: { size: 18, weight: 'bold' } },
                        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15 } },
                        tooltip: originalConfig.options.plugins?.tooltip || { enabled: true },
                        datalabels: {
                            display: true,
                            anchor: function (context) {
                                return context.datasetIndex === 1 ? 'end' : 'center';
                            },
                            align: function (context) {
                                return context.datasetIndex === 1 ? 'top' : 'center';
                            },
                            color: function (context) {
                                return context.datasetIndex === 1 ? '#8b2635' : 'black';
                            },
                            font: { size: 12, weight: 'bold' },
                            textAlign: 'center',
                            formatter: function (value, context) {
                                if (!value || value === 0) return '';
                                const dataIndex = context.dataIndex;
                                const datasets = context.chart.data.datasets;
                                const paperValue = datasets[0]?.data[dataIndex] || 0;
                                const wasteValue = datasets[1]?.data[dataIndex] || 0;
                                const total = paperValue + wasteValue;
                                if (total === 0) return '';
                                const percent = ((value / total) * 100).toFixed(1);
                                if (context.datasetIndex === 1) {
                                    return `${formatNumber(value)}\n(${percent}%)`;
                                }
                                if (value < 1000) {
                                    return `${percent}%`;
                                } else {
                                    return `${formatNumber(value)}\n(${percent}%)`;
                                }
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            };
        } else if (canvasId === 'machineTimeChart') {
                config = {
                    type: 'bar',
                    data: {
                        labels: [...originalChart.data.labels],
                        datasets: originalChart.data.datasets.map(dataset => ({
                            ...dataset,
                            data: [...dataset.data]
                        }))
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: { padding: { top: 40 } },
                        scales: {
                            x: {
                                stacked: true,
                                title: { display: false, text: 'Máy', font: { weight: 'bold' } }
                            },
                            y: {
                                stacked: true,
                                beginAtZero: true,
                                title: { display: true, text: 'Thời gian (phút)', font: { weight: 'bold' } }
                            }
                        },
                        plugins: {
                            title: { display: false, text: title, font: { size: 18, weight: 'bold' } },
                            legend: { 
                                position: 'bottom', 
                                labels: { 
                                    usePointStyle: true, 
                                    padding: 15,
                                    generateLabels: function(chart) {
                                        const datasets = chart.data.datasets;
                                        
                                        return datasets.map((dataset, datasetIndex) => {
                                            // Tính tổng của dataset này
                                            const datasetTotal = dataset.data.reduce((sum, value) => sum + (value || 0), 0);
                                            
                                            // Tính tổng tất cả datasets
                                            const grandTotal = datasets.reduce((sum, ds) => {
                                                return sum + ds.data.reduce((dsSum, value) => dsSum + (value || 0), 0);
                                            }, 0);
                                            
                                            const percent = grandTotal > 0 ? ((datasetTotal / grandTotal) * 100).toFixed(1) : 0;
                                            
                                            // Format thành giờ phút
                                            const hours = Math.floor(datasetTotal / 60);
                                            const minutes = Math.floor(datasetTotal % 60);
                                            let timeStr = '';
                                            
                                            if (hours > 0) {
                                                timeStr = `${hours} giờ${minutes > 0 ? ' ' + minutes + ' phút' : ''}`;
                                            } else {
                                                timeStr = `${minutes} phút`;
                                            }
                                            
                                            return {
                                                text: `${dataset.label}: ${percent}% (${timeStr})`,
                                                fillStyle: dataset.backgroundColor,
                                                strokeStyle: dataset.borderColor,
                                                lineWidth: 1,
                                                hidden: false,
                                                index: datasetIndex,
                                                datasetIndex: datasetIndex
                                            };
                                        });
                                    }
                                }
                            },
                            tooltip: originalConfig.options.plugins?.tooltip || { enabled: true },
                            datalabels: {
                                display: function(context) {
                                    try {
                                        if (!context || !context.parsed) return false;
                                        const value = context.parsed.y;
                                        return value !== null && value !== undefined && value > 0;
                                    } catch (error) {
                                        return false;
                                    }
                                },
                                anchor: 'center',
                                align: 'center',
                                color: 'black',
                                font: { size: 12, weight: 'bold' },
                                formatter: function(value, context) {
                                    try {
                                        if (!value || value <= 0) return '';
                                        
                                        // Tính tổng cột
                                        const dataIndex = context.dataIndex;
                                        const total = context.chart.data.datasets.reduce((sum, dataset) => {
                                            return sum + (dataset.data[dataIndex] || 0);
                                        }, 0);
                                        
                                        if (total === 0) return '';
                                        
                                        const percent = ((value / total) * 100).toFixed(1);
                                        
                                        // Format thành giờ phút
                                        const hours = Math.floor(value / 60);
                                        const minutes = Math.floor(value % 60);
                                        let timeStr = '';
                                        
                                        if (hours > 0) {
                                            timeStr = `${hours} giờ${minutes > 0 ? ' ' + minutes + ' phút' : ''}`;
                                        } else {
                                            timeStr = `${minutes} phút`;
                                        }
                                        
                                        return `${percent}% (${timeStr})`;
                                    } catch (error) {
                                        return '';
                                    }
                                },
                                textStrokeColor: 'white',
                                textStrokeWidth: 1,
                                padding: 4
                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                };            
        } else if (canvasId === 'yearlyLeaderPaperLineChart' || canvasId === 'yearlyLeaderWasteLineChart') {
            // Kiểm tra xem biểu đồ có tồn tại không
            if (!originalChart) {
                console.error('Biểu đồ chưa được tạo:', canvasId);
                return;
            }

            config = {
                type: 'line',
                data: {
                    labels: [...originalChart.data.labels],
                    datasets: originalChart.data.datasets.map(dataset => ({
                        ...dataset,
                        data: [...dataset.data]
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { top: 40 } },
                    interaction: { intersect: false, mode: 'index' },
                    plugins: {
                        title: {
                            display: true,
                            text: title,
                            font: { size: 18, weight: 'bold' }
                        },
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'line',
                                pointStyleWidth: 20,
                                font: { weight: 'bold', size: 14 },
                                padding: 25
                            }
                        },
                        tooltip: originalConfig.options.plugins?.tooltip || { enabled: true },
                        datalabels: {
                            display: true,
                            anchor: 'end',
                            align: function (context) {
                                const datasetIndex = context.datasetIndex;
                                const positions = ['top', 'bottom', 'right', 'left', 'center'];
                                return positions[datasetIndex % positions.length];
                            },
                            color: function (context) {
                                const originalColor = context.dataset.borderColor;
                                if (originalColor && originalColor.includes('rgb(')) {
                                    return originalColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, function (match, r, g, b) {
                                        const newR = Math.max(0, Math.floor(r * 0.7));
                                        const newG = Math.max(0, Math.floor(g * 0.7));
                                        const newB = Math.max(0, Math.floor(b * 0.7));
                                        return `rgb(${newR}, ${newG}, ${newB})`;
                                    });
                                }
                                return originalColor;
                            },
                            font: { size: 12, weight: 'bold' },
                            textAlign: 'center',
                            formatter: function (value) {
                                return value > 0 ? formatNumber(value) : '';
                            },
                            padding: 6,
                            textAlign: 'center',
                            textStrokeColor: 'white',
                            textStrokeWidth: 1
                        }
                    },
                    scales: originalConfig.options.scales || {}
                },
                plugins: [ChartDataLabels]
            };
        } else {
            // Giữ nguyên code cũ cho các biểu đồ khác
            config = {
                type: originalConfig.type,
                data: {
                    labels: [...originalChart.data.labels],
                    datasets: originalChart.data.datasets.map(dataset => ({
                        ...dataset,
                        data: [...dataset.data]
                    }))
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: originalConfig.options.layout || {},
                    interaction: originalConfig.options.interaction || {},
                    plugins: {
                        legend: {
                            position: function () {
                                // Biểu đồ thời gian và lý do dừng máy -> bên trái, các biểu đồ khác -> bottom
                                if (originalConfig.type === 'pie' && (canvasId === 'timeChart' || canvasId === 'sampleProductTimeChart' || canvasId === 'stopReasonChart')) {
                                    return 'left';
                                }
                                return 'bottom';
                            },
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                generateLabels: function (chart) {
                                    // Áp dụng cho cả biểu đồ thời gian VÀ lý do dừng máy
                                    if (originalConfig.type === 'pie' && (canvasId === 'timeChart' || canvasId === 'sampleProductTimeChart' || canvasId === 'stopReasonChart')) {
                                        // Tính tổng để tính phần trăm
                                        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

                                        // Tạo mảng các items với index gốc
                                        const items = chart.data.labels.map((labelName, index) => {
                                            const value = chart.data.datasets[0].data[index] || 0;
                                            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                            const displayValue = formatDuration(value);
                                            const color = chart.data.datasets[0].backgroundColor[index];

                                            // Kiểm tra trạng thái hidden của segment
                                            const meta = chart.getDatasetMeta(0);
                                            const isHidden = meta.data[index] ? meta.data[index].hidden : false;

                                            return {
                                                text: `${labelName} : ${percent}% (${displayValue})`,
                                                fillStyle: color,
                                                strokeStyle: color,
                                                lineWidth: 1,
                                                hidden: isHidden,
                                                index: index,
                                                datasetIndex: 0,
                                                labelName: labelName  // Thêm để sắp xếp
                                            };
                                        });

                                        // Sắp xếp theo thứ tự F1-F13 cho biểu đồ lý do dừng máy
                                        if (canvasId === 'stopReasonChart') {
                                            items.sort((a, b) => {
                                                const aMatch = a.labelName.match(/F(\d+)/);
                                                const bMatch = b.labelName.match(/F(\d+)/);

                                                if (aMatch && bMatch) {
                                                    return parseInt(aMatch[1]) - parseInt(bMatch[1]);
                                                }

                                                // Nếu không match pattern F+số, sắp xếp theo alphabet
                                                return a.labelName.localeCompare(b.labelName);
                                            });
                                        }

                                        return items;
                                    }

                                    // Cho các biểu đồ khác, giữ nguyên
                                    const original = Chart.defaults.plugins.legend.labels.generateLabels;
                                    return original.call(this, chart);
                                }
                            },
                            onClick: function (event, legendItem, legend) {
                                // Áp dụng cho cả biểu đồ thời gian VÀ lý do dừng máy
                                if (originalConfig.type === 'pie' && (canvasId === 'timeChart' || canvasId === 'sampleProductTimeChart' || canvasId === 'stopReasonChart')) {
                                    const chart = legend.chart;
                                    const index = legendItem.index;
                                    const meta = chart.getDatasetMeta(0);

                                    // Toggle trạng thái hidden
                                    meta.data[index].hidden = !meta.data[index].hidden;

                                    // Update chart
                                    chart.update();
                                } else {
                                    // Cho các biểu đồ khác, dùng onClick mặc định
                                    Chart.defaults.plugins.legend.onClick.call(this, event, legendItem, legend);
                                }
                            }
                        },
                        tooltip: originalConfig.options.plugins?.tooltip || { enabled: true },
                        datalabels: {
                            display: function (context) {
                                // Ẩn datalabels cho biểu đồ thời gian VÀ lý do dừng máy, hiển thị cho các biểu đồ khác
                                if (originalConfig.type === 'pie' && (canvasId === 'timeChart' || canvasId === 'sampleProductTimeChart' || canvasId === 'stopReasonChart')) {
                                    return false;
                                }
                                return true;
                            },
                            font: {
                                size: originalConfig.type === 'line' ? 14 : (originalConfig.type === 'pie' ? 16 : 12),
                                weight: 'bold'
                            },
                            padding: originalConfig.type === 'line' ? 8 : (originalConfig.type === 'pie' ? 6 : 4),
                            align: function (context) {
                                // Cho biểu đồ thời gian: đặt label bên trái
                                if (originalConfig.type === 'pie' && (canvasId === 'timeChart' || canvasId === 'sampleProductTimeChart')) {
                                    return 'left';
                                }
                                if (originalConfig.type === 'line') {
                                    const datasetIndex = context.datasetIndex;
                                    const totalDatasets = context.chart.data.datasets.length;

                                    if (totalDatasets <= 3) {
                                        return datasetIndex === 0 ? 'top' : (datasetIndex === 1 ? 'bottom' : 'right');
                                    } else {
                                        const positions = ['top', 'bottom', 'right', 'left', 'center'];
                                        return positions[datasetIndex % positions.length];
                                    }
                                }
                                return 'center';
                            },
                            anchor: function (context) {
                                // Cho biểu đồ thời gian: anchor ở center để label hiện bên trái
                                if (originalConfig.type === 'pie' && (canvasId === 'timeChart' || canvasId === 'sampleProductTimeChart')) {
                                    return 'center';
                                }
                                return originalConfig.type === 'line' ? 'end' : 'center';
                            },
                            color: function (context) {
                                // Cho biểu đồ thời gian: dùng màu đen để dễ đọc
                                if (originalConfig.type === 'pie' && (canvasId === 'timeChart' || canvasId === 'sampleProductTimeChart')) {
                                    return 'black';
                                }
                                if (originalConfig.type === 'pie') return 'white';
                                const originalColor = context.dataset.borderColor || context.dataset.backgroundColor;
                                if (originalColor && originalColor.includes('rgb(')) {
                                    return originalColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, function (match, r, g, b) {
                                        const newR = Math.max(0, Math.floor(r * 0.7));
                                        const newG = Math.max(0, Math.floor(g * 0.7));
                                        const newB = Math.max(0, Math.floor(b * 0.7));
                                        return `rgb(${newR}, ${newG}, ${newB})`;
                                    });
                                }
                                return 'black';
                            },
                            textAlign: function (context) {
                                // Cho biểu đồ thời gian: align text left
                                if (originalConfig.type === 'pie' && (canvasId === 'timeChart' || canvasId === 'sampleProductTimeChart')) {
                                    return 'left';
                                }
                                return 'center';
                            },
                            formatter: function (value, context) {
                                if (originalConfig.type === 'pie') {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

                                    // Kiểm tra nếu là biểu đồ thời gian thì hiển thị theo format mới
                                    if (canvasId === 'timeChart' || canvasId === 'sampleProductTimeChart') {
                                        const label = context.chart.data.labels[context.dataIndex];
                                        const timeStr = formatDuration(value);
                                        return `${label} : ${percent}% (${timeStr})`;
                                    }

                                    return percent + '%';
                                }

                                if (originalConfig.type === 'line') {
                                    return value > 0 ? formatNumber(value) : '';
                                }

                                // ĐÃ SỬA: Thêm % cho bar charts
                                if (originalConfig.type === 'bar') {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${formatNumber(value)}\n(${percent}%)`;
                                }

                                return formatNumber(value);
                            },
                            textStrokeColor: originalConfig.type === 'line' ? 'white' : undefined,
                            textStrokeWidth: originalConfig.type === 'line' ? 1 : undefined
                        }
                    },
                    scales: originalConfig.options.scales || {},
                    elements: originalConfig.options.elements || {}
                },
                plugins: [ChartDataLabels]  // THÊM DÒNG NÀY
            };
        }

        // Tạo chart fullscreen
        fullscreenChart = new Chart(fullscreenCanvas, config);


        // Gắn lại sự kiện cho các controls đã copy
        if (controlsToMove.length > 0) {
            // Xử lý select cho năm
            const yearSelect = fullscreenTitle.querySelector('#yearSelectChart_fullscreen');
            if (yearSelect) {
                yearSelect.addEventListener('change', function () {
                    closeFullscreen();
                    loadYearlyCharts(this.value);
                });
            }

            // Xử lý select cho trưởng máy
            const leaderSelectLeft = fullscreenTitle.querySelector('#leaderSelectLeft_fullscreen');
            const leaderSelectRight = fullscreenTitle.querySelector('#leaderSelectRight_fullscreen');

            if (leaderSelectLeft) {
                leaderSelectLeft.addEventListener('change', function () {
                    currentLeaderSelections.left = this.value;
                    updateLeaderOptions();
                    // Cập nhật fullscreen chart
                    if (canvasId === 'yearlyLeaderChartLeft') {
                        updateFullscreenLeaderChart('left', this.value, fullscreenChart);
                    }
                });
            }

            if (leaderSelectRight) {
                leaderSelectRight.addEventListener('change', function () {
                    currentLeaderSelections.right = this.value;
                    updateLeaderOptions();
                    // Cập nhật fullscreen chart
                    if (canvasId === 'yearlyLeaderChartRight') {
                        updateFullscreenLeaderChart('right', this.value, fullscreenChart);
                    }
                });
            }




            // THÊM: Xử lý select cho leader shift chart
            const leaderSelect = fullscreenTitle.querySelector('#leaderSelect_fullscreen');
            if (leaderSelect) {
                // Đồng bộ giá trị với select gốc
                const originalSelect = document.getElementById('leaderSelect');
                if (originalSelect) {
                    leaderSelect.value = originalSelect.value;
                }

                // Gắn event listener
                leaderSelect.addEventListener('change', function () {
                    // Cập nhật select gốc
                    if (originalSelect) {
                        originalSelect.value = this.value;
                    }

                    // Cập nhật fullscreen chart
                    if (canvasId === 'leaderShiftStackedChart') {
                        updateFullscreenLeaderShiftChart(this.value, fullscreenChart);
                    }
                });
            }



            // ĐÃ SỬA: Xử lý select cho tốc độ - chỉ xử lý dropdown tương ứng
            const speedSelect = fullscreenTitle.querySelector(`select[id*="speedMachineSelect"]`);
            if (speedSelect) {
                const side = speedSelect.id.includes('Left') ? 'left' : 'right';
                const originalSelectId = speedSelect.id.replace('_fullscreen', '');
                const originalSelect = document.getElementById(originalSelectId);

                if (originalSelect) {
                    speedSelect.value = originalSelect.value;

                    speedSelect.addEventListener('change', function () {
                        // Cập nhật select gốc
                        originalSelect.value = this.value;

                        // Cập nhật fullscreen chart
                        if (canvasId === 'topSpeedLeftChart' || canvasId === 'topSpeedRightChart') {
                            updateFullscreenSpeedChart(side, this.value, fullscreenChart);
                        }
                    });
                }
            }


        }



    }, 100);
}

// Hàm đóng fullscreen
function closeFullscreen() {
    document.getElementById('fullscreenModal').style.display = 'none';
    if (fullscreenChart) {
        fullscreenChart.destroy();
        fullscreenChart = null;
    }
}

// Đóng khi click outside
document.getElementById('fullscreenModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeFullscreen();
    }
});

// Đóng khi nhấn ESC
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeFullscreen();
    }
});



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


    if (sampleProductTimeChart) {
        sampleProductTimeChart.destroy();
        sampleProductTimeChart = null;
    }


    if (topCustomersChart) {
        topCustomersChart.destroy();
        topCustomersChart = null;
    }
    if (topProductsChart) {
        topProductsChart.destroy();
        topProductsChart = null;
    }

    if (topSpeedLeftChart) {
        topSpeedLeftChart.destroy();
        topSpeedLeftChart = null;
    }
    if (topSpeedRightChart) {
        topSpeedRightChart.destroy();
        topSpeedRightChart = null;
    }

    if (window.machineStackedChart && typeof window.machineStackedChart.destroy === 'function') {
        window.machineStackedChart.destroy();
    }
    window.machineStackedChart = null;


    if (window.machineTimeChart && typeof window.machineTimeChart.destroy === 'function') {
        window.machineTimeChart.destroy();
    }
    window.machineTimeChart = null;



    if (window.leaderShiftStackedChartInstance) {
        window.leaderShiftStackedChartInstance.destroy();
        window.leaderShiftStackedChartInstance = null;
    }


    // Destroy biểu đồ stacked trưởng máy
    if (window.machineLeaderStackedChartInstance) {
        window.machineLeaderStackedChartInstance.destroy();
        window.machineLeaderStackedChartInstance = null;
    }

    // Xóa container
    const stackedContainer = document.getElementById('machineLeaderStackedContainer');
    if (stackedContainer) {
        stackedContainer.remove();
    }





    // Destroy fullscreen chart
    if (fullscreenChart) {
        fullscreenChart.destroy();
        fullscreenChart = null;
    }




    // Ẩn modal nếu đang mở
    document.getElementById('fullscreenModal').style.display = 'none';

    // Destroy tất cả chart con được tạo động
    Chart.helpers.each(Chart.instances, function (instance) {
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

    // Reset phân trang khi load dữ liệu mới
    resetPagination();

    // Gọi API lấy dữ liệu báo cáo In theo filters (điều kiện lọc 1)
    fetchInReportList(filters)
        .then(detailData => {
            console.log('📋 Dữ liệu từ API theo điều kiện lọc 1:', detailData.length, 'records');

            // Lọc dữ liệu theo mã ca nếu có (vẫn thuộc điều kiện lọc 1)
            let filteredByCondition1 = detailData;
            if (filters && filters.maca) {
                filteredByCondition1 = detailData.filter(record => record.ma_ca === filters.maca);
                console.log('📋 Sau khi lọc theo mã ca:', filteredByCondition1.length, 'records');
            }

            // QUAN TRỌNG: Lưu dữ liệu đã lọc theo điều kiện 1 làm dữ liệu gốc
            originalTableData = filteredByCondition1;
            filteredTableData = filteredByCondition1;

            renderDetailTable(container, filteredByCondition1, filters);
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
    // Tạo filter HTML NGAY ĐẦU HÀM
    const filterHtml = `
    <div class="row d-flex align-items-center">
        <div class="col-10">
            <div class="card-body">
                <div class="d-flex flex-wrap gap-2 align-items-center">
                    <div class="flex-shrink-0">
                        <div class="dropdown">
                            <button class="btn btn-outline-primary btn-sm dropdown-toggle" 
                                    type="button" id="filterSoMau" data-bs-toggle="dropdown" data-bs-auto-close="false"
                                    style="min-width: 100px;">
                                Số màu
                            </button>
                            <div class="dropdown-menu p-2" style="min-width: 250px;">
                                <div class="mb-2">
                                    <input type="text" class="form-control form-control-sm" 
                                           id="searchSoMau" placeholder="Tìm kiếm...">
                                </div>
                                <div class="mb-2">
                                    <button class="btn btn-sm btn-outline-secondary me-1" 
                                            onclick="selectAllFilter('soMau')" id="selectAllBtn_soMau">Tất cả</button>
                                </div>
                                <div class="filter-options" id="soMauOptions" 
                                     style="max-height: 200px; overflow-y: auto;">
                                    <!-- Sẽ được tạo động -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex-shrink-0">
                        <div class="dropdown">
                            <button class="btn btn-outline-primary btn-sm dropdown-toggle" 
                                    type="button" id="filterMaSp" data-bs-toggle="dropdown" data-bs-auto-close="false"
                                    style="min-width: 100px;">
                                Mã SP
                            </button>
                            <div class="dropdown-menu p-2" style="min-width: 250px;">
                                <div class="mb-2">
                                    <input type="text" class="form-control form-control-sm" 
                                           id="searchMaSp" placeholder="Tìm kiếm...">
                                </div>
                                <div class="mb-2">
                                    <button class="btn btn-sm btn-outline-secondary me-1" 
                                            onclick="selectAllFilter('maSp')" id="selectAllBtn_maSp">Tất cả</button>
                                </div>
                                <div class="filter-options" id="maSpOptions" 
                                     style="max-height: 200px; overflow-y: auto;">
                                    <!-- Sẽ được tạo động -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex-shrink-0">
                        <div class="dropdown">
                            <button class="btn btn-outline-primary btn-sm dropdown-toggle" 
                                    type="button" id="filterKhachHang" data-bs-toggle="dropdown" data-bs-auto-close="false"
                                    style="min-width: 120px;">
                                Khách hàng
                            </button>
                            <div class="dropdown-menu p-2" style="min-width: 250px;">
                                <div class="mb-2">
                                    <input type="text" class="form-control form-control-sm" 
                                           id="searchKhachHang" placeholder="Tìm kiếm...">
                                </div>
                                <div class="mb-2">
                                    <button class="btn btn-sm btn-outline-secondary me-1" 
                                            onclick="selectAllFilter('khachHang')" id="selectAllBtn_khachHang">Tất cả</button>
                                </div>
                                <div class="filter-options" id="khachHangOptions" 
                                     style="max-height: 200px; overflow-y: auto;">
                                    <!-- Sẽ được tạo động -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex-shrink-0">
                        <div class="dropdown">
                            <button class="btn btn-outline-primary btn-sm dropdown-toggle" 
                                    type="button" id="filterMay" data-bs-toggle="dropdown" data-bs-auto-close="false"
                                    style="min-width: 80px;">
                                Máy
                            </button>
                            <div class="dropdown-menu p-2" style="min-width: 200px;">
                                <div class="mb-2">
                                    <button class="btn btn-sm btn-outline-secondary me-1" 
                                            onclick="selectAllFilter('may')" id="selectAllBtn_may">Tất cả</button>
                                </div>
                                <div class="filter-options" id="mayOptions" 
                                     style="max-height: 200px; overflow-y: auto;">
                                    <!-- Sẽ được tạo động -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex-shrink-0">
                        <div class="dropdown">
                            <button class="btn btn-outline-primary btn-sm dropdown-toggle" 
                                    type="button" id="filterMaCa" data-bs-toggle="dropdown" data-bs-auto-close="false"
                                    style="min-width: 80px;">
                                Mã ca
                            </button>
                            <div class="dropdown-menu p-2" style="min-width: 150px;">
                                <div class="mb-2">
                                    <button class="btn btn-sm btn-outline-secondary me-1" 
                                            onclick="selectAllFilter('maCa')" id="selectAllBtn_maCa">Tất cả</button>
                                </div>
                                <div class="filter-options" id="maCaOptions" 
                                     style="max-height: 200px; overflow-y: auto;">
                                    <!-- Sẽ được tạo động -->
                                </div>
                            </div>
                        </div>
                    </div>



<div class="flex-shrink-0">
    <div class="dropdown">
        <button class="btn btn-outline-success btn-sm dropdown-toggle" 
                type="button" id="filterTocDo" 
                data-bs-toggle="dropdown" 
                data-bs-auto-close="outside"
                style="min-width: 80px;">
            Tốc độ
        </button>
        <div class="dropdown-menu p-3" style="min-width: 220px;" onclick="event.stopPropagation()">
            <div class="mb-2">
                <select class="form-select form-select-sm" id="speedFilterType">
                    <option value="range">≈</option>
                    <option value="greater">></option>
                    <option value="less"><</option>
                    <option value="greaterEqual">≥</option>
                    <option value="lessEqual">≤</option>
                    <option value="equal">=</option>
                    <option value="desc">↓ Giảm dần</option>
                    <option value="asc"><img width="48" height="48" src="https://img.icons8.com/fluency-systems-filled/48/sort-amount-up.png" alt="sort-amount-up"/></option>
                </select>
            </div>
            <div id="speedInputs">
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control" id="speedMin" placeholder="Từ">
                    <input type="text" class="form-control" id="speedMax" placeholder="Đến">
                </div>
            </div>
            <div class="mt-2 text-end">
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="clearSpeedFilter()">Xóa</button>
                <button class="btn btn-sm btn-primary" onclick="applySpeedFilter()">Áp dụng</button>
            </div>
        </div>
    </div>
</div>




                    <div class="flex-shrink-0">
    <div class="dropdown">
        <button class="btn btn-outline-warning btn-sm dropdown-toggle" 
                type="button" id="filterDonHang" 
                data-bs-toggle="dropdown" 
                data-bs-auto-close="outside"
                style="min-width: 100px;">
            SL đơn hàng
        </button>
        <div class="dropdown-menu p-3" style="min-width: 220px;" onclick="event.stopPropagation()">
            <div class="mb-2">
                <select class="form-select form-select-sm" id="orderFilterType">
                    <option value="range">≈</option>
                    <option value="greater">></option>
                    <option value="less"><</option>
                    <option value="greaterEqual">≥</option>
                    <option value="lessEqual">≤</option>
                    <option value="equal">=</option>
                    <option value="desc">↓ Giảm dần</option>
                    <option value="asc">↑ Tăng dần</option>
                </select>
            </div>
            <div id="orderInputs">
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control" id="orderMin" placeholder="Từ">
                    <input type="text" class="form-control" id="orderMax" placeholder="Đến">
                </div>
            </div>
            <div class="mt-2 text-end">
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="clearOrderFilter()">Xóa</button>
                <button class="btn btn-sm btn-primary" onclick="applyOrderFilter()">Áp dụng</button>
            </div>
        </div>
    </div>
</div>



                    <div class="flex-shrink-0">
                        <button class="btn btn-secondary btn-sm" onclick="resetDetailFilters()">
                            <i class="fas fa-undo"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-2 text-end">
            <button class="btn btn-outline-warning btn-sm" onclick="switchToIncompleteTable()">
                <i class="fas fa-exclamation-triangle me-1"></i>Xem WS chưa hoàn thành
            </button>
        </div>
    </div>
`;


    const switchButtonHtml = `
<div class="d-flex justify-content-between align-items-center mb-3">
    <h6><i class="fas fa-table me-2"></i>Bảng chi tiết báo cáo</h6>
    <div>
        <button class="btn btn-outline-success btn-sm me-2" onclick="exportToExcel()">
            <i class="fas fa-file-excel me-1"></i>Xuất Excel
        </button>
        <button class="btn btn-outline-warning btn-sm" id="switchToIncompleteBtn" onclick="switchToIncompleteTable()">
            <i class="fas fa-exclamation-triangle me-1"></i>Xem WS chưa hoàn thành
        </button>
    </div>
</div>
`;



    if (!data || data.length === 0) {
        const noDataMessage = filters && filters.maca ?
            `Không có dữ liệu chi tiết cho mã ca ${filters.maca}` :
            'Không có dữ liệu chi tiết';

        // Chỉ thay thế phần sau filter, giữ nguyên phần filter
        const existingFilter = container.querySelector('.card-body');
        let tableHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-table fa-2x mb-3"></i>
                <h6>${noDataMessage}</h6>
                <p>Vui lòng chọn lại điều kiện lọc.</p>
            </div>
            
            <div class="row mt-3">
                <div class="col-md-2">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6>Tổng WS</h6>
                            <h4 class="text-primary">0</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6>Tổng thành phẩm</h6>
                            <h4 class="text-success">0</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6>Tổng phế liệu</h6>
                            <h4 class="text-danger">0</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6>Tổng TG chạy máy</h6>
                            <h4 class="text-success">0 phút</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6>Tổng TG canh máy</h6>
                            <h4 class="text-warning">0 phút</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6>Tổng TG dừng máy</h6>
                            <h4 class="text-danger">0 phút</h4>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (existingFilter) {
            // Nếu đã có filter, xóa phần sau filter và thêm mới
            const afterFilter = existingFilter.nextElementSibling;
            while (afterFilter) {
                const nextSibling = afterFilter.nextElementSibling;
                container.removeChild(afterFilter);
                afterFilter = nextSibling;
            }
            container.insertAdjacentHTML('beforeend', tableHTML);
        } else {
            // Nếu chưa có filter, hiển thị filter + thông báo
            container.innerHTML = filterHtml + switchButtonHtml + html;
        }

        // Tạo filter options sau khi render HTML
        setTimeout(() => {
            const filterContainer = document.getElementById('soMauOptions');
            if (!filterContainer || filterContainer.children.length === 0) {
                createFilterOptions(originalTableData);
                restoreFilterState();
            }
        }, 100);

        return;
    }

    // Lưu dữ liệu gốc
    currentPageData = data;
    totalItems = data.length;

    // Đảm bảo filteredTableData luôn sync với data hiện tại
    if (filteredTableData.length === 0 || filteredTableData === originalTableData) {
        filteredTableData = data;
    }

    // Tính toán phân trang
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredTableData.slice(startIndex, endIndex);

    let html = `
        <div class="table-responsive" style="overflow-x: auto;">
            <table class="table table-striped table-hover text-center" style="white-space: nowrap; min-width: 1200px;">
                <thead class="table-dark sticky-top" id="detailTableHeader">
                    <tr>
                        <th>STT</th>
                        <th>WS</th>
                        <th>Mã Ca</th>
                        <th>Máy</th>
                        <th>Khách hàng</th>
                        <th>Mã sản phẩm</th>
                        <th>SL Đơn hàng</th>
                        <th>Số con</th>
                        <th style="width: 80px;">Số màu</th>
<th style="width: 100px;">Tuỳ chọn</th>
<th style="width: 120px;">Thành phẩm in</th>
                        <th>Phế liệu</th>
                        <th>Tổng SL</th>
        <th>Thành phẩm cuối</th>
                        <th>Tốc độ (s/h)</th>
                        <th>Thời gian</th>
                        <th>Thời gian chạy máy</th>
                        <th>Thời gian canh máy</th>
                        <th>Thời gian dừng máy</th>
                    </tr>
                </thead>
                <tbody>
    `;

    paginatedData.forEach((record, index) => {
        const ws = record.ws || '-';
        const maca = record.ma_ca || '-';
        const may = record.may || '-';
        const customer = record.khach_hang || '-';
        const product = record.ma_sp || '-';

        // Lấy dữ liệu từ các cột báo cáo in
        const tongSL = formatNumber(record.tong_so_luong || 0);
        const thanhPhamRaw = record.thanh_pham || '0';
        const thanhPham = formatNumber(parseUSFormat(thanhPhamRaw));

        // Format hiển thị các cột cũ
        const paper = formatNumber(record.thanh_pham_in || 0);
        const waste = formatNumber((parseFloat(record.phe_lieu) || 0) + (parseFloat(record.phe_lieu_trang) || 0));
        const timeRange = formatTimeRangeWithDuration(record.thoi_gian_bat_dau, record.thoi_gian_ket_thuc);
        const setupTime = formatDuration(record.thoi_gian_canh_may || 0);

        // Tính thời gian dừng máy cho record này từ dữ liệu stopReasons
        let stopTimeForRecord = record.stopTime || 0;
        if (currentChartData && currentChartData.reports) {
            const detailRecord = currentChartData.reports.find(r => r.id === record.id);
            if (detailRecord && detailRecord.stopReasons) {
                stopTimeForRecord = detailRecord.stopReasons.reduce((sum, reason) => sum + (reason.duration || 0), 0);
            }
        }
        const stopTimeDisplay = formatDuration(stopTimeForRecord);

        // Tính thời gian chạy máy = tổng thời gian - thời gian canh máy - thời gian dừng máy
        let runTimeForRecord = 0;
        if (record.thoi_gian_bat_dau && record.thoi_gian_ket_thuc) {
            const start = new Date(record.thoi_gian_bat_dau);
            const end = new Date(record.thoi_gian_ket_thuc);
            let totalSeconds = (end - start) / 1000;
            if (totalSeconds < 0) totalSeconds += 24 * 60 * 60;
            let totalMinutes = totalSeconds / 60;

            const setupMinutes = record.thoi_gian_canh_may || 0;
            const stopMinutes = stopTimeForRecord || 0;
            runTimeForRecord = Math.max(0, totalMinutes - setupMinutes - stopMinutes);
        }
        const runTimeDisplay = formatDuration(runTimeForRecord);

        html += `
    <tr>
        <td><strong>${startIndex + index + 1}</strong></td>
        <td><span class="badge bg-primary">${ws}</span></td>
        <td><span class="badge" style="background-color: rgb(128, 186, 151); color: white;">${maca}</span></td>
        <td><span class="badge" style="background-color: rgb(208, 160, 145); color: white;">${may}</span></td>
        <td>${customer}</td>
        <td>${product}</td>
        <td>${formatNumber(record.sl_don_hang || 0)}</td>
        <td>${formatNumber(record.so_con || 0)}</td>
        <td>${record.so_mau || 0}</td>
        <td class="text-center">${record.tuy_chon || '-'}</td>
        <td class="text-center text-success"><strong>${paper}</strong></td>
        <td class="text-center text-danger"><strong>${waste}</strong></td>
        <td class="text-center text-info"><strong>${tongSL}</strong></td>
        <td class="text-center text-primary"><strong>${thanhPham}</strong></td>
        <td class="text-center">
            <span>${calculateSpeed(record.thanh_pham_in, runTimeForRecord)}</span>
        </td>
        <td>${timeRange}</td>
        <td class="text-center">${runTimeDisplay}</td>
        <td class="text-center">${setupTime}</td>
        <td class="text-center">${stopTimeDisplay}</td>
    </tr>
`;
    });



    // Phân trang
    if (totalPages > 1) {
        html += `
        </tbody>
            </table>
        </div>

        <div class="row mt-4 d-flex justify-content-between">
<div class="col-md-4">
                <div class="d-flex align-items-center">
                    <label class="me-2">Hiển thị:</label>
                    <select class="form-select form-select-sm w-auto" id="itemsPerPageSelect">
                        <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10</option>
                        <option value="20" ${itemsPerPage === 20 ? 'selected' : ''}>20</option>
                        <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50</option>
                        <option value="100" ${itemsPerPage === 100 ? 'selected' : ''}>100</option>
                    </select>
                    <span class="ms-2 text-muted">mục</span>
                </div>
            </div>





        
            <div class="col-md-4">
                <nav aria-label="Phân trang bảng chi tiết">
                    <ul class="pagination justify-content-center">
                        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                            <a class="page-link" href="javascript:void(0)" onclick="changeTablePage(${currentPage - 1}); return false;">Trước</a>
                        </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0)" onclick="changeTablePage(${i}); return false;">${i}</a>
                </li>
            `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        html += `
                        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                            <a class="page-link" href="javascript:void(0)" onclick="changeTablePage(${currentPage + 1}); return false;">Sau</a>
                        </li>
                    </ul>
                </nav>
            </div>



        <div class="col-md-4">
                <div class="text-end">
                    <small class="text-muted">
                        Hiển thị ${startIndex + 1} - ${Math.min(endIndex, totalItems)} trong tổng số ${totalItems} mục
                    </small>
                </div>
            </div>



</div>

        <button class="btn btn-outline-success btn-sm" onclick="exportToExcel()">
            <i class="fas fa-file-excel me-1"></i>Xuất Excel
        </button>

        `;
    }

    // Tính thống kê tổng
    const totalPaper = data.reduce((sum, record) => sum + (parseFloat(record.thanh_pham_in) || 0), 0);
    const totalWaste = data.reduce((sum, record) =>
        sum + (parseFloat(record.phe_lieu) || 0) + (parseFloat(record.phe_lieu_trang) || 0), 0);
    const totalSetupTime = data.reduce((sum, record) => sum + (parseFloat(record.thoi_gian_canh_may) || 0), 0);

    const totalRunTime = data.reduce((sum, record) => {
        if (record.thoi_gian_bat_dau && record.thoi_gian_ket_thuc) {
            const start = new Date(record.thoi_gian_bat_dau);
            const end = new Date(record.thoi_gian_ket_thuc);
            let totalMinutes = (end - start) / (1000 * 60);
            if (totalMinutes < 0) totalMinutes += 24 * 60;

            const setupMinutes = record.thoi_gian_canh_may || 0;
            const stopMinutes = record.stopTime || 0;
            const runMinutes = Math.max(0, totalMinutes - setupMinutes - stopMinutes);
            return sum + runMinutes;
        }
        return sum;
    }, 0);

    const uniqueWS = new Set(data.map(record => record.ws).filter(ws => ws && ws !== '-')).size;
    const totalStopTime = currentChartData && currentChartData.stopReasons ?
        currentChartData.stopReasons.reduce((sum, reason) => sum + (reason.duration || 0), 0) : 0;



    html += `
        <div class="row mt-3">
            <div class="col-md-2">
                <div class="card  card-custom-sub border-left-sub" style="border-left: 6px solid #A9C8C0;">
                    <div class="card-body text-center">
                        <h6>Tổng WS</h6>
                        <h4 class="text-primary">${uniqueWS}</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card  card-custom-sub border-left-sub" style="border-left: 6px solid #A9C8C0;">
                    <div class="card-body text-center">
                        <h6>Tổng thành phẩm</h6>
                        <h4 class="text-success">${formatNumber(totalPaper)}</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card  card-custom-sub border-left-sub" style="border-left: 6px solid #A9C8C0;">
                    <div class="card-body text-center">
                        <h6>Tổng phế liệu</h6>
                        <h4 class="text-danger">${formatNumber(totalWaste)}</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card  card-custom-sub border-left-sub" style="border-left: 6px solid #A9C8C0;">
                    <div class="card-body text-center">
                        <h6>Tổng TG chạy máy</h6>
                        <h4 class="text-success">${formatDuration(totalRunTime)}</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card  card-custom-sub border-left-sub" style="border-left: 6px solid #A9C8C0;">
                    <div class="card-body text-center">
                        <h6>Tổng TG canh máy</h6>
                        <h4 class="text-warning">${formatDuration(totalSetupTime)}</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card  card-custom-sub border-left-sub" style="border-left: 6px solid #A9C8C0;">
                    <div class="card-body text-center">
                        <h6>Tổng TG dừng máy</h6>
                        <h4 class="text-danger">${formatDuration(totalStopTime)}</h4>
                    </div>
                </div>
            </div>
        </div>
    `;



    container.innerHTML = filterHtml + html;

    // Tạo filter options sau khi render HTML
    setTimeout(() => {
        const filterContainer = document.getElementById('soMauOptions');
        if (!filterContainer || filterContainer.children.length === 0) {
            createFilterOptions(originalTableData);
            restoreFilterState();
        }
    }, 100);

    // Thiết lập sticky header sau khi render
    setTimeout(() => {
        setupStickyTableHeader();
    }, 100);

    // Gắn sự kiện cho select
    const itemsSelect = document.getElementById('itemsPerPageSelect');
    if (itemsSelect) {
        itemsSelect.addEventListener('change', function () {
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            renderDetailTable(container, currentPageData, filters);
        });
    }
}




// Render bảng chi tiết nhưng không tạo lại filter (để tránh dropdown bị đóng)
function renderDetailTableWithoutFilters(container, data, filters) {
    // Lưu trạng thái filter hiện tại TRƯỚC KHI render
    const currentFilterState = {};
    ['soMau', 'maSp', 'khachHang', 'may', 'maCa'].forEach(filterType => {
        const filterContainer = document.getElementById(`${filterType}Options`);
        if (filterContainer) {
            const checkboxes = filterContainer.querySelectorAll('.filter-checkbox');
            currentFilterState[filterType] = {};
            checkboxes.forEach(checkbox => {
                currentFilterState[filterType][checkbox.value] = checkbox.checked;
            });
        }
    });

    // Lưu trạng thái numeric filter
    const speedFilterType = document.getElementById('speedFilterType')?.value || 'range';
    const speedMin = document.getElementById('speedMin')?.value || '';
    const speedMax = document.getElementById('speedMax')?.value || '';
    const orderFilterType = document.getElementById('orderFilterType')?.value || 'range';
    const orderMin = document.getElementById('orderMin')?.value || '';
    const orderMax = document.getElementById('orderMax')?.value || '';

    // Gọi renderDetailTable để tạo lại toàn bộ (bao gồm filter)
    renderDetailTable(container, data, filters);

    // Khôi phục trạng thái filter SAU KHI render
    setTimeout(() => {
        // Khôi phục checkbox
        Object.keys(currentFilterState).forEach(filterType => {
            const filterContainer = document.getElementById(`${filterType}Options`);
            if (filterContainer && currentFilterState[filterType]) {
                const checkboxes = filterContainer.querySelectorAll('.filter-checkbox');
                checkboxes.forEach(checkbox => {
                    if (currentFilterState[filterType][checkbox.value] !== undefined) {
                        checkbox.checked = currentFilterState[filterType][checkbox.value];
                    }
                });
            }
        });

        // Khôi phục numeric filter
        if (document.getElementById('speedFilterType')) {
            document.getElementById('speedFilterType').value = speedFilterType;
            if (document.getElementById('speedMin')) document.getElementById('speedMin').value = speedMin;
            if (document.getElementById('speedMax')) document.getElementById('speedMax').value = speedMax;
        }
        if (document.getElementById('orderFilterType')) {
            document.getElementById('orderFilterType').value = orderFilterType;
            if (document.getElementById('orderMin')) document.getElementById('orderMin').value = orderMin;
            if (document.getElementById('orderMax')) document.getElementById('orderMax').value = orderMax;
        }

        // Cập nhật button text
        updateFilterButtons();
        updateNumericFilterButtons();

        // Gắn lại sự kiện cho checkbox
        document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            // Xóa event listener cũ trước khi gắn mới
            checkbox.removeEventListener('change', handleCheckboxChange);
            checkbox.addEventListener('change', handleCheckboxChange);
        });

        // Gắn lại sự kiện cho numeric filter
        ['speedFilterType', 'speedMin', 'speedMax', 'orderFilterType', 'orderMin', 'orderMax'].forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                element.addEventListener('change', function () {
                    if (inputId.includes('FilterType')) {
                        toggleFilterInputs(inputId.replace('FilterType', ''), this.value);
                    }
                    updateNumericFilterButtons();
                    autoApplyFilters();
                });

                if (element.type === 'number') {
                    element.addEventListener('click', function (e) {
                        e.stopPropagation();
                    });

                    element.addEventListener('input', function (e) {
                        e.stopPropagation();
                        updateNumericFilterButtons();
                    });

                    element.addEventListener('blur', function (e) {
                        e.stopPropagation();
                        autoApplyFilters();
                    });

                    element.addEventListener('keydown', function (e) {
                        e.stopPropagation();
                    });
                }
            }
        });

        // Gắn lại sự kiện tìm kiếm
        ['soMau', 'maSp', 'khachHang'].forEach(filterType => {
            const searchInput = document.getElementById(`search${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`);
            if (searchInput) {
                searchInput.addEventListener('input', function () {
                    filterSearchOptions(filterType, this.value);
                });
            }
        });

        // Ngăn dropdown đóng khi click vào input
        document.querySelectorAll('.dropdown-menu input, .dropdown-menu select').forEach(input => {
            input.addEventListener('click', function (e) {
                e.stopPropagation();
            });

            input.addEventListener('keydown', function (e) {
                e.stopPropagation();
            });
        });

        // Gắn sự kiện cho itemsPerPage select
        const itemsSelect = document.getElementById('itemsPerPageSelect');
        if (itemsSelect) {
            itemsSelect.addEventListener('change', function () {
                itemsPerPage = parseInt(this.value);
                currentPage = 1;
                renderDetailTableWithoutFilters(container, filteredTableData, filters);
            });
        }

    }, 100);
}





// Quản lý sticky header cho bảng chi tiết
function setupStickyTableHeader() {
    const tableContainer = document.getElementById('detailTableContainer');
    const header = document.getElementById('detailTableHeader');

    if (!tableContainer || !header) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Bảng đang hiển thị, kích hoạt sticky header
                    header.style.position = 'sticky';
                    header.style.top = '0';
                } else {
                    // Bảng không hiển thị, tắt sticky header
                    header.style.position = 'static';
                }
            });
        },
        { threshold: 0.1 }
    );

    observer.observe(tableContainer);
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


// Format khoảng thời gian với chênh lệch
function formatTimeRangeWithDuration(startTime, endTime) {
    if (!startTime || !endTime) return '-';

    try {
        const start = new Date(startTime);
        const end = new Date(endTime);

        const startFormatted = formatDateTime(start);
        const endFormatted = formatDateTime(end);

        // Tính chênh lệch thời gian
        let diffMs = end - start;

        // Nếu chênh lệch âm, có thể là ca đêm - cộng thêm 24 giờ
        if (diffMs < 0) {
            diffMs += 24 * 60 * 60 * 1000; // cộng 24 giờ
        }

        // Chuyển đổi sang giờ:phút:giây
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        return `${startFormatted} - ${endFormatted} | <i>${duration}</i>`;
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




// Hàm thay đổi trang
function changeTablePage(page) {
    if (page < 1 || page > Math.ceil(filteredTableData.length / itemsPerPage)) return;

    currentPage = page;

    // THÊM ĐIỀU KIỆN KIỂM TRA CHẾ ĐỘ HIỆN TẠI:
    if (currentTableMode === 'incomplete') {
        changeIncompleteTablePage(page);
    } else {
        // Chỉ cập nhật nội dung bảng mà không tái tạo HTML
        updateTableContentOnly();
    }
}



// Hàm reset phân trang
function resetPagination() {
    currentPage = 1;
    itemsPerPage = 10;
    currentPageData = [];
    totalItems = 0;
}







// Tính toán top 10 khách hàng từ dữ liệu bảng chi tiết
function calculateTopCustomersFromTable(reports) {

    if (!reports || reports.length === 0) {
        console.log('❌ Không có báo cáo để tính toán');
        return [];
    }

    const customerStats = {};
    const customerWsSet = {}; // Theo dõi các WS đã tính cho mỗi khách hàng

    // Lặp qua từng báo cáo
    reports.forEach((report, index) => {
        const customer = report.khach_hang || 'Không xác định';
        const ws = report.ws || '';
        const orderQuantity = parseFloat(report.sl_don_hang) || 0;

        console.log(`📋 Báo cáo ${index}: KH=${customer}, WS=${ws}, SL=${orderQuantity}`);

        if (!customerStats[customer]) {
            customerStats[customer] = {
                customer: customer,
                totalQuantity: 0,
                orderCount: 0,
                wsCount: 0
            };
            customerWsSet[customer] = new Set();
        }

        // Chỉ cộng số lượng đơn hàng nếu WS chưa được tính cho khách hàng này
        if (ws && !customerWsSet[customer].has(ws)) {
            customerWsSet[customer].add(ws);
            customerStats[customer].totalQuantity += orderQuantity;
            customerStats[customer].wsCount++;
        }

        customerStats[customer].orderCount++; // Tổng số báo cáo
    });

    console.log('📊 Customer stats:', customerStats);

    // Chuyển đổi và sắp xếp theo số lượng đơn hàng
    const result = Object.values(customerStats)
        .filter(stat => stat.totalQuantity > 0)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10);

    console.log('📊 Top 10 customers result:', result);
    return result;
}

// Tính toán top 10 mã sản phẩm từ dữ liệu bảng chi tiết
function calculateTopProductsFromTable(reports) {
    // console.log('🔍 calculateTopProductsFromTable với', reports.length, 'báo cáo');

    if (!reports || reports.length === 0) {
        console.log('❌ Không có báo cáo để tính toán');
        return [];
    }

    const productStats = {};
    const productWsSet = {}; // Theo dõi các WS đã tính cho mỗi sản phẩm

    // Lặp qua từng báo cáo
    reports.forEach((report, index) => {
        const product = report.ma_sp || 'Không xác định';
        const ws = report.ws || '';
        const orderQuantity = parseFloat(report.sl_don_hang) || 0;

        // console.log(`📋 Báo cáo ${index}: MSP=${product}, WS=${ws}, SL=${orderQuantity}`);

        if (!productStats[product]) {
            productStats[product] = {
                product: product,
                customer: report.khach_hang,
                totalQuantity: 0,
                orderCount: 0,
                wsCount: 0
            };
            productWsSet[product] = new Set();
        }

        // Chỉ cộng số lượng đơn hàng nếu WS chưa được tính cho sản phẩm này
        if (ws && !productWsSet[product].has(ws)) {
            productWsSet[product].add(ws);
            productStats[product].totalQuantity += orderQuantity;
            productStats[product].wsCount++;
        }

        productStats[product].orderCount++; // Tổng số báo cáo
    });

    console.log('📊 Product stats:', productStats);

    // Chuyển đổi và sắp xếp theo số lượng đơn hàng
    const result = Object.values(productStats)
        .filter(stat => stat.totalQuantity > 0)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10);

    console.log('📊 Top 10 products result:', result);
    return result;
}




// Tính toán top 10 tốc độ theo mã sản phẩm từ dữ liệu bảng chi tiết
function calculateTopSpeedFromTable(reports) {
    if (!reports || reports.length === 0) {
        return {};
    }

    const machineProductStats = {};

    reports.forEach(report => {
        const machine = report.may || 'Không xác định';
        const product = report.ma_sp || 'Không xác định';
        const paper = parseFloat(report.thanh_pham_in) || 0;

        // Tính thời gian chạy máy
        let runTime = 0;
        if (report.thoi_gian_bat_dau && report.thoi_gian_ket_thuc) {
            const start = new Date(report.thoi_gian_bat_dau);
            const end = new Date(report.thoi_gian_ket_thuc);
            let totalMinutes = (end - start) / (1000 * 60);
            if (totalMinutes < 0) totalMinutes += 24 * 60;
            const setupMinutes = report.thoi_gian_canh_may || 0;
            const stopMinutes = report.stopTime || 0;
            runTime = Math.max(0, totalMinutes - setupMinutes - stopMinutes);
        }

        // Tính tốc độ (sheet/hour)
        const speed = (runTime > 0 && paper > 0) ? Math.round(paper / (runTime / 60)) : 0;

        if (!machineProductStats[machine]) {
            machineProductStats[machine] = {};
        }

        if (!machineProductStats[machine][product]) {
            machineProductStats[machine][product] = {
                machine: machine,
                product: product,
                customer: report.khach_hang || 'Không xác định',
                totalPaper: 0,
                totalRunTime: 0,
                recordCount: 0
            };
        }

        machineProductStats[machine][product].totalPaper += paper;
        machineProductStats[machine][product].totalRunTime += runTime;
        machineProductStats[machine][product].recordCount++;
    });

    // Tính tốc độ trung bình cho từng máy-sản phẩm
    const result = {};
    Object.keys(machineProductStats).forEach(machine => {
        result[machine] = Object.values(machineProductStats[machine])
            .map(stat => {
                const avgSpeed = stat.totalRunTime > 0 ?
                    Math.round(stat.totalPaper / (stat.totalRunTime / 60)) : 0;
                return {
                    product: stat.product,
                    customer: stat.customer,
                    speed: avgSpeed,
                    totalPaper: stat.totalPaper,
                    recordCount: stat.recordCount
                };
            })
            .filter(item => item.speed > 0)
            .sort((a, b) => b.speed - a.speed)
            .slice(0, 10);
    });

    return result;
}




// Hiển thị biểu đồ tốc độ
function displayTopSpeedCharts(topSpeedData, filters) {
    // Tạo dropdown options cho máy
    const machines = Object.keys(topSpeedData).sort();
    const leftSelect = document.getElementById('speedMachineSelectLeft');
    const rightSelect = document.getElementById('speedMachineSelectRight');

    if (leftSelect && rightSelect) {
        // Xóa options cũ
        leftSelect.innerHTML = '<option value="">Chọn máy</option>';
        rightSelect.innerHTML = '<option value="">Chọn máy</option>';

        // Thêm options mới
        machines.forEach(machine => {
            const optionLeft = document.createElement('option');
            optionLeft.value = machine;
            optionLeft.textContent = machine;
            leftSelect.appendChild(optionLeft);

            const optionRight = document.createElement('option');
            optionRight.value = machine;
            optionRight.textContent = machine;
            rightSelect.appendChild(optionRight);
        });

        // Gắn sự kiện thay đổi
        leftSelect.addEventListener('change', function () {
            currentSpeedSelections.left = this.value;
            updateSpeedMachineOptions();
            displaySpeedChart('left', this.value, topSpeedData);
        });

        rightSelect.addEventListener('change', function () {
            currentSpeedSelections.right = this.value;
            updateSpeedMachineOptions();
            displaySpeedChart('right', this.value, topSpeedData);
        });

        // Chọn sẵn 2 máy đầu tiên
        if (machines.length >= 2) {
            leftSelect.value = machines[0];
            rightSelect.value = machines[1];
            currentSpeedSelections.left = machines[0];
            currentSpeedSelections.right = machines[1];

            updateSpeedMachineOptions();
            displaySpeedChart('left', machines[0], topSpeedData);
            displaySpeedChart('right', machines[1], topSpeedData);
        } else if (machines.length === 1) {
            leftSelect.value = machines[0];
            currentSpeedSelections.left = machines[0];
            displaySpeedChart('left', machines[0], topSpeedData);
        }
    }
}

// Cập nhật options để tránh chọn trùng máy
function updateSpeedMachineOptions() {
    const leftSelect = document.getElementById('speedMachineSelectLeft');
    const rightSelect = document.getElementById('speedMachineSelectRight');

    if (!leftSelect || !rightSelect) return;

    const leftValue = leftSelect.value;
    const rightValue = rightSelect.value;

    // Disable options đã chọn ở bên kia
    Array.from(leftSelect.options).forEach(option => {
        if (option.value === rightValue && option.value !== '') {
            option.disabled = true;
        } else {
            option.disabled = false;
        }
    });

    Array.from(rightSelect.options).forEach(option => {
        if (option.value === leftValue && option.value !== '') {
            option.disabled = true;
        } else {
            option.disabled = false;
        }
    });
}

// Hiển thị biểu đồ tốc độ cho một máy
function displaySpeedChart(side, machine, topSpeedData) {
    const canvasId = side === 'left' ? 'topSpeedLeftChart' : 'topSpeedRightChart';
    const chartVar = side === 'left' ? 'topSpeedLeftChart' : 'topSpeedRightChart';

    let ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error('❌ Không tìm thấy canvas:', canvasId);
        return;
    }

    // Destroy chart cũ
    if (side === 'left' && topSpeedLeftChart) {
        topSpeedLeftChart.destroy();
        topSpeedLeftChart = null;
    }
    if (side === 'right' && topSpeedRightChart) {
        topSpeedRightChart.destroy();
        topSpeedRightChart = null;
    }

    // RECREATE CANVAS
    const container = ctx.parentElement;
    if (container) {
        ctx.remove();
        const newCanvas = document.createElement('canvas');
        newCanvas.id = canvasId;
        newCanvas.width = 400;
        newCanvas.height = 400;
        newCanvas.style.width = '100%';
        newCanvas.style.height = '400px';
        container.appendChild(newCanvas);
        ctx = newCanvas;
    }

    if (!machine || !topSpeedData[machine] || topSpeedData[machine].length === 0) {
        const emptyChart = createEmptyChart(ctx, `Không có dữ liệu tốc độ máy ${machine || 'này'}`);
        if (side === 'left') {
            topSpeedLeftChart = emptyChart;
        } else {
            topSpeedRightChart = emptyChart;
        }
        return;
    }

    const speedData = topSpeedData[machine];
    const labels = speedData.map(item => {
        // Format giống như top products: Mã SP + Khách hàng
        const shortCustomer = item.customer && item.customer.length > 15 ?
            item.customer.substring(0, 15) + '...' : (item.customer || 'Không xác định');
        return `${item.product}\n${shortCustomer}`;
    });
    const speeds = speedData.map(item => item.speed);

    try {
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tốc độ (sheet/hour)',
                    data: speeds,
                    backgroundColor: side === 'left' ? 'rgba(54, 162, 235, 0.8)' : 'rgba(54, 162, 235, 0.8)',
                    borderColor: side === 'left' ? 'rgba(54, 162, 235, 1)' : 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 30 }
                },
                plugins: {
                    title: {
                        display: true,
                        // text: `Top 10 tốc độ - Máy ${machine}`,
                        font: { size: 16, weight: 'bold' },
                        color: 'black',
                        padding: { bottom: 20 }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `Tốc độ: ${formatNumber(context.parsed.y)} sheet/hour`;
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        color: 'black',
                        font: { weight: 'bold', size: 12 },
                        textAlign: 'center',
                        formatter: function (value, context) {
                            // ĐÃ SỬA: Thêm % cho speed chart
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${formatNumber(value)}\n(${percent}%)`;
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tốc độ (sheet/hour)',
                            font: { size: 14, weight: 'bold' },
                            color: 'black'
                        }
                    },
                    x: {
                        ticks: {
                            display: true,
                            maxRotation: 45,
                            minRotation: 30,
                            font: {
                                size: function (context) {
                                    const itemCount = context.chart.data.labels.length;
                                    const screenWidth = window.innerWidth;

                                    if (screenWidth < 576) {
                                        return itemCount > 8 ? 8 : 9;
                                    } else if (screenWidth < 768) {
                                        return itemCount > 8 ? 9 : 10;
                                    } else {
                                        return itemCount > 8 ? 10 : 11;
                                    }
                                }
                            },
                            callback: function (value, index, values) {
                                const label = this.getLabelForValue(value);
                                const lines = label.split('\n');

                                if (lines.length > 1) {
                                    // Format giống top products: dòng 1 là mã SP, dòng 2 là customer với bullet
                                    return [lines[0], `● ${lines[1]}`];
                                }
                                return lines;
                            }
                        }
                    }
                }
            }
        });

        if (side === 'left') {
            topSpeedLeftChart = chart;
        } else {
            topSpeedRightChart = chart;
        }

        console.log(`✅ Biểu đồ tốc độ ${side} được tạo thành công`);

    } catch (error) {
        console.error(`❌ Lỗi khi tạo biểu đồ tốc độ ${side}:`, error);
    }
}




// Cập nhật biểu đồ tốc độ trong fullscreen
function updateFullscreenSpeedChart(side, selectedMachine, chartInstance) {
    if (!chartInstance || !selectedMachine) return;

    console.log('🔄 Updating fullscreen speed chart:', side, selectedMachine);

    // Lấy dữ liệu tốc độ từ biến toàn cục hoặc tính toán lại
    let topSpeedData = {};
    if (currentPageData && currentPageData.length > 0) {
        topSpeedData = calculateTopSpeedFromTable(currentPageData);
    }

    const speedData = topSpeedData[selectedMachine];
    if (!speedData || speedData.length === 0) {
        console.log('⚠️ Không có dữ liệu tốc độ cho máy:', selectedMachine);
        return;
    }

    const labels = speedData.map(item => {
        const shortCustomer = item.customer && item.customer.length > 15 ?
            item.customer.substring(0, 15) + '...' : (item.customer || 'Không xác định');
        return `${item.product}\n${shortCustomer}`;
    });
    const speeds = speedData.map(item => item.speed);

    // Cập nhật dữ liệu chart
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = speeds;

    // Cập nhật title
    chartInstance.options.plugins.title.text = `Top 10 tốc độ - Máy ${selectedMachine}`;

    // Render lại chart
    chartInstance.update();

    // Đồng bộ với biểu đồ gốc
    setTimeout(() => {
        displaySpeedChart(side, selectedMachine, topSpeedData);
    }, 100);

    console.log('✅ Đã cập nhật fullscreen speed chart');
}




// Hiển thị Top 10 Analytics
function displayTopAnalytics(data, filters) {
    // console.log('🎯 displayTopAnalytics được gọi với data:', data);
    // console.log('🎯 currentPageData:', currentPageData);

    // Lấy dữ liệu từ data.reports thay vì currentPageData
    let reportsData = [];
    if (data && data.reports && data.reports.length > 0) {
        reportsData = data.reports;
        // console.log('📊 Sử dụng dữ liệu từ data.reports:', reportsData.length, 'báo cáo');
    } else if (currentPageData && currentPageData.length > 0) {
        reportsData = currentPageData;
        // console.log('📊 Sử dụng dữ liệu từ currentPageData:', reportsData.length, 'báo cáo');
    } else {
        // console.log('⚠️ Không có dữ liệu để hiển thị top analytics');

        // Vẫn hiển thị biểu đồ trống
        displayTopCustomersChart({ topCustomers: [] }, filters);
        displayTopProductsChart({ topProducts: [] }, filters);
        return;
    }

    // Lọc dữ liệu theo điều kiện filter nếu có
    let filteredData = reportsData;
    if (filters && filters.maca) {
        filteredData = reportsData.filter(report => report.ma_ca === filters.maca);
        // console.log('📊 Sau khi lọc theo mã ca:', filteredData.length, 'báo cáo');
    }

    // Tính toán top 10 từ dữ liệu đã lọc
    const topCustomers = calculateTopCustomersFromTable(filteredData);
    const topProducts = calculateTopProductsFromTable(filteredData);

    // Hiển thị biểu đồ
    displayTopCustomersChart({ topCustomers }, filters);
    displayTopProductsChart({ topProducts }, filters);

    // Tính toán top 10 tốc độ
    const topSpeedData = calculateTopSpeedFromTable(filteredData);

    // Hiển thị biểu đồ tốc độ
    displayTopSpeedCharts(topSpeedData, filters);

}


// Hiển thị biểu đồ Top 10 khách hàng
function displayTopCustomersChart(data, filters) {
    console.log('📊 displayTopCustomersChart với data.topCustomers:', data.topCustomers);

    // Destroy chart cũ
    if (topCustomersChart) {
        topCustomersChart.destroy();
        topCustomersChart = null;
    }

    let ctx = document.getElementById('topCustomersChart');
    console.log('🔍 Canvas found:', ctx);

    if (!ctx) {
        console.error('❌ Không tìm thấy canvas topCustomersChart');
        return;
    }

    // RECREATE CANVAS
    const container = ctx.parentElement;
    if (container) {
        // Xóa canvas cũ
        ctx.remove();

        // Tạo canvas mới
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'topCustomersChart';
        newCanvas.width = 400;
        newCanvas.height = 400;
        newCanvas.style.width = '100%';
        newCanvas.style.height = '400px';

        container.appendChild(newCanvas);
        ctx = newCanvas;

        console.log('✅ Đã tạo lại canvas:', ctx);
    }

    // Kiểm tra dữ liệu
    if (!data.topCustomers || data.topCustomers.length === 0) {
        console.log('⚠️ Không có dữ liệu khách hàng, hiển thị biểu đồ trống');
        topCustomersChart = createEmptyChart(ctx, 'Không có dữ liệu khách hàng');
        return;
    }

    const labels = data.topCustomers.map(item => item.customer);
    const quantities = data.topCustomers.map(item => item.totalQuantity);

    // console.log('📊 Labels:', labels);
    // console.log('📊 Quantities:', quantities);

    try {
        topCustomersChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Số lượng đơn hàng',
                    data: quantities,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 30 // Để chỗ cho số liệu trên đầu
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 10 khách hàng theo số lượng đơn hàng',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: 'black',
                        padding: {
                            bottom: 20 // Tạo khoảng cách phía dưới title
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        color: 'black',
                        font: {
                            weight: 'bold',
                            size: 12
                        },
                        textAlign: 'center',
                        formatter: function (value, context) {
                            // ĐÃ SỬA: Thêm % cho top customers
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${formatNumber(value)}\n(${percent}%)`;
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng đơn hàng',
                            font: {
                                size: 14,
                                weight: 'bold',
                                family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            color: 'black'
                        },

                    },
                    x: {
                        title: {
                            display: true,
                            // text: 'Khách hàng'
                        },
                        ticks: {
                            display: true,
                            maxRotation: 45,
                            minRotation: 30,
                            font: {
                                size: 9  // Thu nhỏ font size để tránh xuống dòng
                            },
                            callback: function (value, index, values) {
                                const label = this.getLabelForValue(value);
                                // Không wrap text, giữ nguyên label để hiển thị chéo
                                return label;
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Biểu đồ khách hàng được tạo thành công');

    } catch (error) {
        console.error('❌ Lỗi khi tạo biểu đồ khách hàng:', error);
    }
}



// Hiển thị biểu đồ Top 10 mã sản phẩm
function displayTopProductsChart(data, filters) {
    console.log('📊 displayTopProductsChart với data.topProducts:', data.topProducts);

    // Destroy chart cũ
    if (topProductsChart) {
        topProductsChart.destroy();
        topProductsChart = null;
    }

    let ctx = document.getElementById('topProductsChart');
    console.log('🔍 Canvas found:', ctx);

    if (!ctx) {
        console.error('❌ Không tìm thấy canvas topProductsChart');
        return;
    }

    // RECREATE CANVAS
    const container = ctx.parentElement;
    if (container) {
        // Xóa canvas cũ
        ctx.remove();

        // Tạo canvas mới
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'topProductsChart';
        newCanvas.width = 400;
        newCanvas.height = 400;
        newCanvas.style.width = '100%';
        newCanvas.style.height = '400px';

        container.appendChild(newCanvas);
        ctx = newCanvas;

        console.log('✅ Đã tạo lại canvas:', ctx);
    }

    // Kiểm tra dữ liệu
    if (!data.topProducts || data.topProducts.length === 0) {
        console.log('⚠️ Không có dữ liệu sản phẩm, hiển thị biểu đồ trống');
        topProductsChart = createEmptyChart(ctx, 'Không có dữ liệu sản phẩm');
        return;
    }

    const labels = data.topProducts.map(item => {
        // ĐÃ SỬA: Cắt ngắn tên khách hàng nếu quá dài
        const shortCustomer = item.customer.length > 15 ?
            item.customer.substring(0, 15) + '...' : item.customer;
        return `${item.product}\n${shortCustomer}`;  // Bỏ dấu ngoặc để gọn hơn
    });
    const quantities = data.topProducts.map(item => item.totalQuantity);

    console.log('📊 Labels:', labels);
    console.log('📊 Quantities:', quantities);

    try {
        topProductsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Số lượng đơn hàng',
                    data: quantities,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 30 // Để chỗ cho số liệu trên đầu
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 10 mã sản phẩm theo số lượng đơn hàng',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: 'black',
                        padding: {
                            bottom: 20 // Tạo khoảng cách phía dưới title
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        color: 'black',
                        font: {
                            weight: 'bold',
                            size: 11
                        },
                        textAlign: 'center',
                        formatter: function (value, context) {
                            // ĐÃ SỬA: Thêm % cho top products
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${formatNumber(value)}\n(${percent}%)`;
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng đơn hàng',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            color: 'black'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            // text: 'Mã sản phẩm'
                        },
                        ticks: {
                            display: true,
                            maxRotation: 45,
                            minRotation: 0,
                            font: {
                                size: 10  // ĐÃ THÊM: giảm font size để vừa hơn
                            },
                            callback: function (value, index, values) {
                                const label = this.getLabelForValue(value);
                                const lines = label.split('\n');

                                // ĐÃ SỬA: Làm đậm dòng thứ 2 (customer) bằng cách thêm prefix
                                if (lines.length > 1) {
                                    return [lines[0], `● ${lines[1]}`];  // Thêm bullet point để làm nổi bật
                                }
                                return lines;
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Biểu đồ sản phẩm được tạo thành công');

    } catch (error) {
        console.error('❌ Lỗi khi tạo biểu đồ sản phẩm:', error);
    }
}



// Tạo biểu đồ cột sản xuất theo máy từ dữ liệu báo cáo thực tế
function createMachineProductionChart(reportData) {
    console.log('🎯 createMachineProductionChart được gọi với:', reportData.length, 'báo cáo');

    const stackedCanvas = document.getElementById('machineStackedChart');

    console.log('🔍 Canvas elements:', { stackedCanvas });

    if (!stackedCanvas) {
        console.error('❌ Không tìm thấy canvas elements');
        return;
    }



    // Destroy chart cũ nếu có
    if (window.machineStackedChart && typeof window.machineStackedChart.destroy === 'function') {
        window.machineStackedChart.destroy();
    }
    window.machineStackedChart = null;



    // Group dữ liệu theo máy từ báo cáo thực tế
    const machineGroups = {};
    reportData.forEach(report => {
        const machine = report.may || 'Không xác định';
        if (!machineGroups[machine]) {
            machineGroups[machine] = { paper: 0, waste: 0 };
        }
        machineGroups[machine].paper += parseFloat(report.thanh_pham_in) || 0;
        machineGroups[machine].waste += (parseFloat(report.phe_lieu) || 0) + (parseFloat(report.phe_lieu_trang) || 0);
    });

    console.log('📊 Machine groups:', machineGroups);

    const machines = Object.keys(machineGroups);
    const paperData = machines.map(machine => machineGroups[machine].paper);
    const wasteData = machines.map(machine => machineGroups[machine].waste);

    console.log('📊 Chart data:', { machines, paperData, wasteData });

    if (machines.length === 0) {
        console.log('⚠️ Không có dữ liệu máy để hiển thị');
        return;
    }

    // Tạo biểu đồ stacked
    try {
        window.machineStackedChart = new Chart(stackedCanvas, {
            type: 'bar',
            data: {
                labels: machines,
                datasets: [{
                    label: 'Thành phẩm in',
                    data: paperData,
                    backgroundColor: 'rgba(174, 207, 188, 0.8)',
                    borderColor: 'rgba(148, 199, 169, 1)',
                    borderWidth: 1
                }, {
                    label: 'Phế liệu',
                    data: wasteData,
                    backgroundColor: 'rgba(248, 179, 181, 0.8)',
                    borderColor: 'rgba(255, 141, 152, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 30 // THÊM PADDING ĐỂ CHỪA CHỖ CHO LABEL
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            // text: 'Máy'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng',
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: function (context) {
                            return context.datasetIndex === 1 ? 'end' : 'center';
                        },
                        align: function (context) {
                            return context.datasetIndex === 1 ? 'top' : 'center';
                        },
                        color: function (context) {
                            return context.datasetIndex === 1 ? '#8b2635' : 'black';
                        },
                        font: {
                            size: 10,
                            weight: 'bold'
                        },
                        formatter: function (value, context) {
                            if (!value || value === 0) return '';

                            const dataIndex = context.dataIndex;
                            const datasets = context.chart.data.datasets;
                            const paperValue = datasets[0]?.data[dataIndex] || 0;
                            const wasteValue = datasets[1]?.data[dataIndex] || 0;
                            const total = paperValue + wasteValue;

                            if (total === 0) return '';

                            const percent = ((value / total) * 100).toFixed(1);

                            // Với phế liệu (dataset 1), hiển thị cả số liệu + %
                            if (context.datasetIndex === 1) {
                                return `${formatNumber(value)}\n(${percent}%)`;
                            }

                            // Với thành phẩm (dataset 0)
                            if (value < 1000) {
                                return `${percent}%`;
                            } else {
                                return `${formatNumber(value)}\n(${percent}%)`;
                            }
                        },
                        padding: {
                            top: 4,
                            bottom: 4
                        },
                        textAlign: 'center'
                    }
                }
            }
        });

        console.log('✅ Biểu đồ stacked đã tạo thành công');
    } catch (error) {
        console.error('❌ Lỗi khi tạo biểu đồ stacked:', error);
    }
}



// Tính tốc độ s/h (sheet per hour)
function calculateSpeed(thanhPham, runTimeMinutes) {
    const paper = parseFloat(thanhPham) || 0;
    const runTimeInteger = Math.floor(runTimeMinutes); // Lấy phần nguyên

    if (runTimeInteger === 0 || paper === 0) return '0';

    const speed = Math.round((paper * 60) / runTimeInteger);
    return formatNumber(speed);
}


// ====================================================================================================================================
// HÀM XỬ LÝ FILTER CHO BẢNG CHI TIẾT
// ====================================================================================================================================

// Tạo filter options cho dropdown
function createFilterOptions(data) {
    // Luôn lấy từ dữ liệu gốc để hiển thị đầy đủ options
    const options = {
        soMau: [...new Set(originalTableData.map(item => item.so_mau).filter(v => v))].sort(),
        maSp: [...new Set(originalTableData.map(item => item.ma_sp).filter(v => v))].sort(),
        khachHang: [...new Set(originalTableData.map(item => item.khach_hang).filter(v => v))].sort(),
        may: [...new Set(originalTableData.map(item => item.may).filter(v => v))].sort(),
        maCa: [...new Set(originalTableData.map(item => item.ma_ca).filter(v => v))].sort()
    };

    // Tạo HTML cho từng filter
    Object.keys(options).forEach(key => {
        const container = document.getElementById(`${key}Options`);
        if (container) {
            container.innerHTML = options[key].map(value => `
                <div class="form-check">
                    <input class="form-check-input filter-checkbox" type="checkbox" 
                           value="${value}" id="${key}_${value}" data-filter="${key}" checked>
                    <label class="form-check-label" for="${key}_${value}">
                        ${value}
                    </label>
                </div>
            `).join('');
        }
    });

    // Đợi DOM render xong rồi mới gắn sự kiện
    // Thay thế phần setTimeout trong createFilterOptions()
    setTimeout(() => {
        // Gắn sự kiện tìm kiếm
        ['soMau', 'maSp', 'khachHang'].forEach(filterType => {
            const searchInput = document.getElementById(`search${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`);
            if (searchInput) {
                searchInput.addEventListener('input', function () {
                    filterSearchOptions(filterType, this.value);
                });
            }
        });

        // Gắn sự kiện cho checkbox
        document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            checkbox.removeEventListener('change', handleCheckboxChange);
            checkbox.addEventListener('change', handleCheckboxChange);
        });

        // Gắn sự kiện cho filter type select
        ['speedFilterType', 'orderFilterType'].forEach(selectId => {
            const element = document.getElementById(selectId);
            if (element) {
                element.addEventListener('change', function () {
                    const filterName = selectId.replace('FilterType', '');
                    const selectedValue = this.value;

                    // Nếu chọn sort, reset sort khác
                    if (selectedValue === 'desc' || selectedValue === 'asc') {
                        resetOtherSort(filterName);
                    }

                    toggleFilterInputs(filterName, selectedValue);
                    updateNumericFilterButtons();
                    autoApplyFilters();
                });
            }
        });

        // Khởi tạo input ban đầu
        toggleFilterInputs('speed', 'range');
        toggleFilterInputs('order', 'range');

        // Format input số
        ['speedMin', 'speedMax', 'orderMin', 'orderMax'].forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                formatNumberInput(input);
            }
        });

        // QUAN TRỌNG: Ngăn tất cả dropdown đóng khi click vào nội dung
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.addEventListener('click', function (e) {
                e.stopPropagation();
            });

            // Ngăn dropdown đóng khi click vào bất kỳ phần tử con nào
            menu.addEventListener('mousedown', function (e) {
                e.stopPropagation();
            });
        });

        // Gắn sự kiện cho dropdown buttons để đóng dropdown khác
        const dropdownButtons = document.querySelectorAll('[data-bs-toggle="dropdown"]');
        dropdownButtons.forEach(button => {
            button.addEventListener('show.bs.dropdown', function () {
                // Đóng tất cả dropdown khác khi dropdown này được mở
                closeOtherDropdowns(this.id);
            });
        });

        // Khởi tạo button text
        updateFilterButtons();
        updateNumericFilterButtons();

    }, 100);
}



function closeOtherDropdowns(currentDropdownId) {
    const allDropdownButtons = document.querySelectorAll('[data-bs-toggle="dropdown"]');

    allDropdownButtons.forEach(button => {
        if (button.id !== currentDropdownId) {
            const dropdown = bootstrap.Dropdown.getInstance(button);
            if (dropdown) {
                dropdown.hide();
            }
        }
    });
}




// Tự động áp dụng filter
function autoApplyFilters() {
    console.log('🔍 Auto applying filters...');

    // Chỉ cần reset currentDetailFilters
    currentDetailFilters = {
        soMau: [],
        maSp: [],
        khachHang: [],
        may: [],
        maCa: [],
        speedFilter: { type: 'range', min: '', max: '' },
        orderFilter: { type: 'range', min: '', max: '' }
    };

    // Thu thập speed và order filters (numeric)
    const speedFilterType = document.getElementById('speedFilterType')?.value || 'range';
    const speedMin = document.getElementById('speedMin')?.value || '';
    const speedMax = document.getElementById('speedMax')?.value || '';

    currentDetailFilters.speedFilter = {
        type: speedFilterType,
        min: speedMin,
        max: speedMax
    };

    const orderFilterType = document.getElementById('orderFilterType')?.value || 'range';
    const orderMin = document.getElementById('orderMin')?.value || '';
    const orderMax = document.getElementById('orderMax')?.value || '';

    currentDetailFilters.orderFilter = {
        type: orderFilterType,
        min: orderMin,
        max: orderMax
    };

    // Console log để debug
    console.log('🔍 Applying filters...');
    console.log('🔍 Original data length:', originalTableData.length);

    // Áp dụng filter
    filteredTableData = applyFiltersToData(originalTableData, currentDetailFilters);

    // Áp dụng sort - CHỈ 1 SORT DUY NHẤT
    // const speedFilterType = document.getElementById('speedFilterType')?.value;
    // const orderFilterType = document.getElementById('orderFilterType')?.value;

    if (speedFilterType === 'desc' || speedFilterType === 'asc') {
        // Nếu đang sort tốc độ, reset sort đơn hàng về range
        const orderSelect = document.getElementById('orderFilterType');
        if (orderSelect && (orderFilterType === 'desc' || orderFilterType === 'asc')) {
            orderSelect.value = 'range';
            toggleFilterInputs('order', 'range');
        }

        // Áp dụng sort tốc độ
        filteredTableData = sortTableData(filteredTableData, 'tocDo', speedFilterType);

    } else if (orderFilterType === 'desc' || orderFilterType === 'asc') {
        // Nếu đang sort đơn hàng, reset sort tốc độ về range
        const speedSelect = document.getElementById('speedFilterType');
        if (speedSelect && (speedFilterType === 'desc' || speedFilterType === 'asc')) {
            speedSelect.value = 'range';
            toggleFilterInputs('speed', 'range');
        }

        // Áp dụng sort đơn hàng
        filteredTableData = sortTableData(filteredTableData, 'slDonHang', orderFilterType);
    }

    console.log('🔍 Filtered data length:', filteredTableData.length);

    // Reset về trang đầu
    currentPage = 1;

    // CHỈ CẬP NHẬT NỘI DUNG BẢNG, KHÔNG TÁI TẠO HTML FILTER
    updateTableContentOnly();
}




function resetOtherSort(currentSortType) {
    if (currentSortType === 'speed') {
        // Reset sort đơn hàng
        const orderSelect = document.getElementById('orderFilterType');
        if (orderSelect) {
            const currentValue = orderSelect.value;
            if (currentValue === 'desc' || currentValue === 'asc') {
                orderSelect.value = 'range';
                toggleFilterInputs('order', 'range');

                // Reset filter object
                currentDetailFilters.orderFilter = {
                    type: 'range',
                    min: '',
                    max: ''
                };
            }
        }
    } else if (currentSortType === 'order') {
        // Reset sort tốc độ
        const speedSelect = document.getElementById('speedFilterType');
        if (speedSelect) {
            const currentValue = speedSelect.value;
            if (currentValue === 'desc' || currentValue === 'asc') {
                speedSelect.value = 'range';
                toggleFilterInputs('speed', 'range');

                // Reset filter object
                currentDetailFilters.speedFilter = {
                    type: 'range',
                    min: '',
                    max: ''
                };
            }
        }
    }
}




function updateTableContentOnly() {
    const filters = collectFilters();

    // Tính toán phân trang
    const totalItems = filteredTableData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredTableData.slice(startIndex, endIndex);

    // Tìm tbody hiện tại
    const tbody = document.querySelector('#detailTableContainer tbody');
    if (!tbody) return;

    // Xóa nội dung cũ
    tbody.innerHTML = '';

    // Thêm dữ liệu mới
    paginatedData.forEach((record, index) => {
        const ws = record.ws || '-';
        const maca = record.ma_ca || '-';
        const may = record.may || '-';
        const customer = record.khach_hang || '-';
        const product = record.ma_sp || '-';

        const tongSL = formatNumber(record.tong_so_luong || 0);
        const thanhPhamRaw = record.thanh_pham || '0';
        const thanhPham = formatNumber(parseUSFormat(thanhPhamRaw));
        const paper = formatNumber(record.thanh_pham_in || 0);
        const waste = formatNumber((parseFloat(record.phe_lieu) || 0) + (parseFloat(record.phe_lieu_trang) || 0));
        const timeRange = formatTimeRangeWithDuration(record.thoi_gian_bat_dau, record.thoi_gian_ket_thuc);
        const setupTime = formatDuration(record.thoi_gian_canh_may || 0);

        let stopTimeForRecord = record.stopTime || 0;
        if (currentChartData && currentChartData.reports) {
            const detailRecord = currentChartData.reports.find(r => r.id === record.id);
            if (detailRecord && detailRecord.stopReasons) {
                stopTimeForRecord = detailRecord.stopReasons.reduce((sum, reason) => sum + (reason.duration || 0), 0);
            }
        }
        const stopTimeDisplay = formatDuration(stopTimeForRecord);

        let runTimeForRecord = 0;
        if (record.thoi_gian_bat_dau && record.thoi_gian_ket_thuc) {
            const start = new Date(record.thoi_gian_bat_dau);
            const end = new Date(record.thoi_gian_ket_thuc);
            let totalMinutes = (end - start) / (1000 * 60);
            if (totalMinutes < 0) totalMinutes += 24 * 60;

            const setupMinutes = record.thoi_gian_canh_may || 0;
            const stopMinutes = stopTimeForRecord || 0;
            runTimeForRecord = Math.max(0, totalMinutes - setupMinutes - stopMinutes);
        }
        const runTimeDisplay = formatDuration(runTimeForRecord);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${startIndex + index + 1}</strong></td>
            <td><span class="badge bg-primary">${ws}</span></td>
            <td><span class="badge" style="background-color: rgb(128, 186, 151); color: white;">${maca}</span></td>
            <td><span class="badge" style="background-color: rgb(208, 160, 145); color: white;">${may}</span></td>
            <td>${customer}</td>
            <td>${product}</td>
            <td>${formatNumber(record.sl_don_hang || 0)}</td>
            <td>${formatNumber(record.so_con || 0)}</td>
            <td>${record.so_mau || 0}</td>
            <td class="text-center">${record.tuy_chon || '-'}</td>
            <td class="text-center text-success"><strong>${paper}</strong></td>
            <td class="text-center text-danger"><strong>${waste}</strong></td>
            <td class="text-center text-info"><strong>${tongSL}</strong></td>
            <td class="text-center text-primary"><strong>${thanhPham}</strong></td>
            <td class="text-center">
                <span>${calculateSpeed(record.thanh_pham_in, runTimeForRecord)}</span>
            </td>
            <td>${timeRange}</td>
            <td class="text-center">${runTimeDisplay}</td>
            <td class="text-center">${setupTime}</td>
            <td class="text-center">${stopTimeDisplay}</td>
        `;
        tbody.appendChild(row);
    });

    // Cập nhật thông tin phân trang
    updatePaginationDisplay(totalItems, startIndex, endIndex);

    // Cập nhật thống kê cuối trang
    updateTableStatistics();
}




// Thay thế hàm updatePaginationDisplay() hiện tại
function updatePaginationDisplay(totalItems, startIndex, endIndex) {
    // Cập nhật thông tin hiển thị
    const paginationInfo = document.querySelector('#detailTableContainer .text-muted small');
    if (paginationInfo) {
        paginationInfo.textContent = `Hiển thị ${startIndex + 1} - ${Math.min(endIndex, totalItems)} trong tổng số ${totalItems} mục`;
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Tìm pagination hiện tại
    const existingPagination = document.querySelector('#detailTableContainer nav[aria-label="Phân trang bảng chi tiết"]');

    if (totalPages > 1) {
        if (existingPagination) {
            // Hiển thị pagination nếu bị ẩn
            existingPagination.closest('.row').style.display = 'block';

            // Cập nhật pagination hiện có
            const paginationList = existingPagination.querySelector('ul.pagination');
            if (paginationList) {
                paginationList.innerHTML = createPaginationButtons(totalPages);
            }
        }
    } else {
        // Ẩn pagination nếu chỉ có 1 trang
        if (existingPagination) {
            existingPagination.closest('.row').style.display = 'none';
        }
    }
}

// Hàm helper tạo chỉ phần buttons của pagination
function createPaginationButtons(totalPages) {
    let html = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="changeTablePage(${currentPage - 1}); return false;">Trước</a>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0)" onclick="changeTablePage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="changeTablePage(${currentPage + 1}); return false;">Sau</a>
        </li>
    `;

    return html;
}



// Thêm hàm cập nhật thống kê cuối bảng
function updateTableStatistics() {
    const data = filteredTableData;

    // Tính thống kê tổng từ dữ liệu đã lọc
    const totalPaper = data.reduce((sum, record) => sum + (parseFloat(record.thanh_pham_in) || 0), 0);
    const totalWaste = data.reduce((sum, record) =>
        sum + (parseFloat(record.phe_lieu) || 0) + (parseFloat(record.phe_lieu_trang) || 0), 0);
    const totalSetupTime = data.reduce((sum, record) => sum + (parseFloat(record.thoi_gian_canh_may) || 0), 0);

    const totalRunTime = data.reduce((sum, record) => {
        if (record.thoi_gian_bat_dau && record.thoi_gian_ket_thuc) {
            const start = new Date(record.thoi_gian_bat_dau);
            const end = new Date(record.thoi_gian_ket_thuc);
            let totalMinutes = (end - start) / (1000 * 60);
            if (totalMinutes < 0) totalMinutes += 24 * 60;

            const setupMinutes = record.thoi_gian_canh_may || 0;
            const stopMinutes = record.stopTime || 0;
            const runMinutes = Math.max(0, totalMinutes - setupMinutes - stopMinutes);
            return sum + runMinutes;
        }
        return sum;
    }, 0);

    const uniqueWS = new Set(data.map(record => record.ws).filter(ws => ws && ws !== '-')).size;

    // Tính tổng thời gian dừng máy từ dữ liệu đã lọc
    const totalStopTime = data.reduce((sum, record) => sum + (record.stopTime || 0), 0);

    console.log('📊 Cập nhật thống kê:', {
        totalPaper,
        totalWaste,
        totalRunTime,
        totalSetupTime,
        totalStopTime,
        uniqueWS
    });

    // Tìm và cập nhật từng card thống kê cụ thể
    const detailContainer = document.getElementById('detailTableContainer');
    if (detailContainer) {
        // Tìm tất cả các card thống kê (có class bg-light)
        const statsCards = detailContainer.querySelectorAll('.card.bg-light .card-body');

        // Cập nhật từng card dựa trên text content của h6
        statsCards.forEach(cardBody => {
            const title = cardBody.querySelector('h6');
            const value = cardBody.querySelector('h4');

            if (title && value) {
                const titleText = title.textContent.trim();

                switch (titleText) {
                    case 'Tổng WS':
                        value.textContent = uniqueWS;
                        break;
                    case 'Tổng thành phẩm':
                        value.textContent = formatNumber(totalPaper);
                        break;
                    case 'Tổng phế liệu':
                        value.textContent = formatNumber(totalWaste);
                        break;
                    case 'Tổng TG chạy máy':
                        value.textContent = formatDuration(totalRunTime);
                        break;
                    case 'Tổng TG canh máy':
                        value.textContent = formatDuration(totalSetupTime);
                        break;
                    case 'Tổng TG dừng máy':
                        value.textContent = formatDuration(totalStopTime);
                        break;
                }
            }
        });
    }
}



// Cập nhật text button cho numeric filters
function updateNumericFilterButtons() {
    // Cập nhật hiển thị cho select tốc độ
    const speedType = document.getElementById('speedFilterType')?.value;
    const speedMin = document.getElementById('speedMin')?.value || '';
    const speedMax = document.getElementById('speedMax')?.value || '';
    const speedSelect = document.getElementById('speedFilterType');

    if (speedSelect) {
        if (speedType === 'desc' || speedType === 'asc' || speedMin || speedMax) {
            speedSelect.className = 'form-select form-select-sm border-success';
        } else {
            speedSelect.className = 'form-select form-select-sm';
        }
    }

    // Cập nhật hiển thị cho select đơn hàng
    const orderType = document.getElementById('orderFilterType')?.value;
    const orderMin = document.getElementById('orderMin')?.value || '';
    const orderMax = document.getElementById('orderMax')?.value || '';
    const orderSelect = document.getElementById('orderFilterType');

    if (orderSelect) {
        if (orderType === 'desc' || orderType === 'asc' || orderMin || orderMax) {
            orderSelect.className = 'form-select form-select-sm border-warning';
        } else {
            orderSelect.className = 'form-select form-select-sm';
        }
    }
}



// Format input số khi người dùng nhập
function formatNumberInput(inputElement) {
    inputElement.addEventListener('input', function () {
        let value = this.value.replace(/[^\d]/g, '');
        if (value && value.length > 3) {
            this.value = parseInt(value).toLocaleString('en-US');
        }
    });
}


// Tìm kiếm trong filter options
function filterSearchOptions(filterType, searchValue) {
    const container = document.getElementById(`${filterType}Options`);
    const checkboxes = container.querySelectorAll('.form-check');

    checkboxes.forEach(checkbox => {
        const label = checkbox.querySelector('label').textContent.toLowerCase();
        const matches = label.includes(searchValue.toLowerCase());
        checkbox.style.display = matches ? 'block' : 'none';
    });
}

// Chọn tất cả filter
function selectAllFilter(filterType) {
    const container = document.getElementById(`${filterType}Options`);
    if (!container) return;

    const checkboxes = container.querySelectorAll('.filter-checkbox');

    // Kiểm tra trạng thái hiện tại
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    if (allChecked) {
        // Nếu đang chọn tất cả -> bỏ chọn tất cả
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    } else {
        // Nếu chưa chọn tất cả -> chọn tất cả
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
    }

    updateFilterButtons();
    setTimeout(() => {
        autoApplyFilters();
    }, 50);
}

// Bỏ chọn tất cả filter
function clearAllFilter(filterType) {
    const container = document.getElementById(`${filterType}Options`);
    const checkboxes = container.querySelectorAll('.filter-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    updateFilterButtons();
    setTimeout(() => {
        autoApplyFilters();
    }, 50);
}

// Cập nhật text button filter
function updateFilterButtons() {
    ['soMau', 'maSp', 'khachHang', 'may', 'maCa'].forEach(filterType => {
        const container = document.getElementById(`${filterType}Options`);
        if (!container) return;

        const allBoxes = container.querySelectorAll('.filter-checkbox');
        const checkedBoxes = container.querySelectorAll('.filter-checkbox:checked');
        const button = document.getElementById(`filter${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`);

        // Cập nhật text button "Tất cả"
        const selectAllButton = document.getElementById(`selectAllBtn_${filterType}`);
        if (selectAllButton) {
            const allChecked = Array.from(allBoxes).every(cb => cb.checked);
            selectAllButton.textContent = allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả';
        }

        if (button) {
            const filterNames = {
                soMau: 'Số màu',
                maSp: 'Mã SP',
                khachHang: 'Khách hàng',
                may: 'Máy',
                maCa: 'Mã ca'
            };

            if (checkedBoxes.length === allBoxes.length) {
                button.textContent = filterNames[filterType];
                button.className = 'btn btn-outline-primary btn-sm dropdown-toggle';
                // Thêm lại style cho button
                if (button.style) {
                    button.style.minWidth = getButtonMinWidth(filterType);
                }
            } else if (checkedBoxes.length > 0) {
                button.textContent = `${filterNames[filterType]} (${checkedBoxes.length}/${allBoxes.length})`;
                button.className = 'btn btn-primary btn-sm dropdown-toggle';
                if (button.style) {
                    button.style.minWidth = getButtonMinWidth(filterType);
                }
            } else {
                button.textContent = filterNames[filterType];
                button.className = 'btn btn-outline-primary btn-sm dropdown-toggle';
                if (button.style) {
                    button.style.minWidth = getButtonMinWidth(filterType);
                }
            }
        }
    });
}

// Hàm helper để lấy min-width cho button
function getButtonMinWidth(filterType) {
    const widthMap = {
        soMau: '100px',
        maSp: '100px',
        khachHang: '120px',
        may: '80px',
        maCa: '80px'
    };
    return widthMap[filterType] || '100px';
}



// Toggle filter inputs dựa trên type
function toggleFilterInputs(filterName, type) {
    const inputsContainer = document.getElementById(`${filterName}Inputs`);
    if (!inputsContainer) return;

    const inputGroup = inputsContainer.querySelector('.input-group');
    if (!inputGroup) return;

    // Xóa nội dung cũ
    inputGroup.innerHTML = '';

    if (type === 'range') {
        inputGroup.innerHTML = `
            <input type="text" class="form-control" id="${filterName}Min" placeholder="Từ">
            <input type="text" class="form-control" id="${filterName}Max" placeholder="Đến">
        `;
    } else if (type === 'greater') {
        inputGroup.innerHTML = `
            <input type="text" class="form-control" id="${filterName}Min" placeholder="Lớn hơn">
        `;
    } else if (type === 'less') {
        inputGroup.innerHTML = `
            <input type="text" class="form-control" id="${filterName}Min" placeholder="Nhỏ hơn">
        `;
    } else if (type === 'greaterEqual') {
        inputGroup.innerHTML = `
            <input type="text" class="form-control" id="${filterName}Min" placeholder="Lớn hơn bằng">
        `;
    } else if (type === 'lessEqual') {
        inputGroup.innerHTML = `
            <input type="text" class="form-control" id="${filterName}Min" placeholder="Nhỏ hơn bằng">
        `;
    } else if (type === 'equal') {
        inputGroup.innerHTML = `
            <input type="text" class="form-control" id="${filterName}Min" placeholder="Bằng">
        `;
    } else if (type === 'desc' || type === 'asc') {
        // Với sort, không cần input
        inputGroup.innerHTML = `
            <div class="text-center text-muted p-2">
                <i class="fas fa-sort"></i> Sắp xếp ${type === 'desc' ? 'giảm dần' : 'tăng dần'}
            </div>
        `;
        return; // Không cần gắn event cho input
    }

    // Gắn event cho input mới (chỉ khi có input)
    const inputs = inputGroup.querySelectorAll('input');
    inputs.forEach(input => {
        formatNumberInput(input);

        input.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        input.addEventListener('keydown', function (e) {
            e.stopPropagation();
        });

        input.addEventListener('input', function (e) {
            e.stopPropagation();
            updateNumericFilterButtons();
        });

        input.addEventListener('blur', function (e) {
            e.stopPropagation();
            autoApplyFilters();
        });
    });
}



// Áp dụng filter
function applyDetailFilters() {
    // Thu thập filter values
    ['soMau', 'maSp', 'khachHang', 'may', 'maCa'].forEach(filterType => {
        const container = document.getElementById(`${filterType}Options`);
        const checkedBoxes = container.querySelectorAll('.filter-checkbox:checked');
        currentDetailFilters[filterType] = Array.from(checkedBoxes).map(cb => cb.value);
    });

    // Thu thập speed filter
    const speedFilterType = document.getElementById('speedFilterType').value;
    const speedMin = document.getElementById('speedMin').value;
    const speedMax = document.getElementById('speedMax').value;

    currentDetailFilters.speedFilter = {
        type: speedFilterType,
        min: speedMin,
        max: speedMax
    };

    // Thu thập order filter
    const orderFilterType = document.getElementById('orderFilterType').value;
    const orderMin = document.getElementById('orderMin').value;
    const orderMax = document.getElementById('orderMax').value;

    currentDetailFilters.orderFilter = {
        type: orderFilterType,
        min: orderMin,
        max: orderMax
    };

    // Áp dụng filter
    filteredTableData = applyFiltersToData(originalTableData, currentDetailFilters);

    // Reset về trang đầu
    currentPage = 1;

    // Render lại bảng
    const container = document.getElementById('detailTableContainer');
    const filters = collectFilters();
    renderDetailTable(container, filteredTableData, filters);
}

// Hàm thực hiện filter dữ liệu
function applyFiltersToData(data, filters) {
    console.log('🔍 Applying filters to', data.length, 'records');
    let filtered = data.filter(item => {

        // Filter checkbox - Logic: Lấy trạng thái checkbox TRỰC TIẾP từ UI
        for (let filterType of ['soMau', 'maSp', 'khachHang', 'may', 'maCa']) {
            const fieldMap = {
                soMau: 'so_mau',
                maSp: 'ma_sp',
                khachHang: 'khach_hang',
                may: 'may',
                maCa: 'ma_ca'
            };

            // Lấy trạng thái checkbox TRỰC TIẾP từ UI
            const container = document.getElementById(`${filterType}Options`);
            if (container) {
                const allBoxes = container.querySelectorAll('.filter-checkbox');
                const checkedBoxes = container.querySelectorAll('.filter-checkbox:checked');

                // Nếu không có checkbox nào thì bỏ qua filter này
                if (allBoxes.length === 0) {
                    continue;
                }

                // DEBUG: Log để kiểm tra
                console.log(`🔍 ${filterType}: ${checkedBoxes.length}/${allBoxes.length} checked`);

                // Nếu không chọn gì -> LOẠI BỎ TẤT CẢ (bảng trống)
                if (checkedBoxes.length === 0) {
                    console.log(`❌ ${filterType}: Không chọn gì -> loại bỏ tất cả`);
                    return false;
                }

                // Nếu chọn tất cả -> không filter
                if (checkedBoxes.length === allBoxes.length) {
                    console.log(`✅ ${filterType}: Chọn tất cả -> bỏ qua filter`);
                    continue;
                }

                // Nếu chọn một phần -> kiểm tra giá trị
                const checkedValues = Array.from(checkedBoxes).map(cb => cb.value);
                const itemValue = item[fieldMap[filterType]];

                console.log(`🔍 ${filterType}: Checking ${itemValue} against [${checkedValues.join(', ')}]`);

                if (!itemValue || !checkedValues.includes(itemValue.toString())) {
                    console.log(`❌ ${filterType}: ${itemValue} không trong danh sách được chọn`);
                    return false;
                }
            }
        }

        // Filter tốc độ
        if (filters.speedFilter.min || filters.speedFilter.max) {
            const runTime = calculateRunTimeForRecord(item);
            const paper = parseFloat(item.thanh_pham_in) || 0;
            const speed = (runTime > 0 && paper > 0) ? Math.round(paper / (runTime / 60)) : 0;

            console.log(`🔍 Speed filter: paper=${paper}, runTime=${runTime}, speed=${speed}, ws=${item.ws}`);

            if (!applyNumericFilter(speed, filters.speedFilter)) {
                console.log(`❌ Speed filter rejected: ${item.ws} (speed=${speed})`);
                return false;
            }
        }

        // Filter số lượng đơn hàng
        if (filters.orderFilter.min || filters.orderFilter.max) {
            const orderQty = parseFloat(item.sl_don_hang) || 0;

            if (!applyNumericFilter(orderQty, filters.orderFilter)) {
                return false;
            }
        }

        console.log(`✅ Item passed all filters: ${item.ws}`);
        return true;
    });

    console.log('🔍 Filtered result:', filtered.length, 'records');
    return filtered;
}



// Hàm áp dụng filter numeric
function applyNumericFilter(value, filter) {
    // Xử lý input - loại bỏ dấu phẩy và chuyển thành số
    const parseValue = (str) => {
        if (!str || str === '') return null;
        // Loại bỏ dấu phẩy và khoảng trắng
        const cleaned = str.toString().replace(/[,\s]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    };

    const min = parseValue(filter.min);
    const max = parseValue(filter.max);

    // Nếu không có giá trị nào được nhập thì không filter
    if (min === null && max === null) {
        return true;
    }

    switch (filter.type) {
        case 'range':
            if (min !== null && value < min) return false;
            if (max !== null && value > max) return false;
            break;
        case 'greater':
            if (min !== null && value <= min) return false;
            break;
        case 'less':
            if (min !== null && value >= min) return false;
            break;
        case 'equal':
            if (min !== null && value !== min) return false;
            break;
        case 'greaterEqual':
            if (min !== null && value < min) return false;
            break;
        case 'lessEqual':
            if (min !== null && value > min) return false;
            break;
    }

    return true;
}



// Tính run time cho record
function calculateRunTimeForRecord(record) {
    if (!record.thoi_gian_bat_dau || !record.thoi_gian_ket_thuc) return 0;

    const start = new Date(record.thoi_gian_bat_dau);
    const end = new Date(record.thoi_gian_ket_thuc);

    let totalSeconds = (end - start) / 1000;
    if (totalSeconds < 0) totalSeconds += 24 * 60 * 60;
    let totalMinutes = totalSeconds / 60; // Giữ nguyên số thập phân cho giây

    const setupMinutes = record.thoi_gian_canh_may || 0;
    const stopMinutes = record.stopTime || 0;

    return Math.max(0, totalMinutes - setupMinutes - stopMinutes);
}

// Sắp xếp dữ liệu bảng
function sortTableData(data, sortField, sortOrder) {
    return data.sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
            case 'tocDo':
                const aRunTime = calculateRunTimeForRecord(a);
                const bRunTime = calculateRunTimeForRecord(b);
                aValue = aRunTime > 0 ? (a.thanh_pham_in || 0) / (aRunTime / 60) : 0;
                bValue = bRunTime > 0 ? (b.thanh_pham_in || 0) / (bRunTime / 60) : 0;
                break;
            case 'slDonHang':
                aValue = parseFloat(a.sl_don_hang) || 0;
                bValue = parseFloat(b.sl_don_hang) || 0;
                break;
            case 'thanhPham':
                aValue = parseFloat(a.thanh_pham_in) || 0;
                bValue = parseFloat(b.thanh_pham_in) || 0;
                break;
            case 'pheLieu':
                aValue = (parseFloat(a.phe_lieu) || 0) + (parseFloat(a.phe_lieu_trang) || 0);
                bValue = (parseFloat(b.phe_lieu) || 0) + (parseFloat(b.phe_lieu_trang) || 0);
                break;
            default:
                return 0;
        }

        if (sortOrder === 'desc') {
            return bValue - aValue;
        } else {
            return aValue - bValue;
        }
    });
}

// Reset filters
function resetDetailFilters() {
    // Reset checkbox filters
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });

    // Reset search inputs
    document.querySelectorAll('[id^="search"]').forEach(input => {
        input.value = '';
    });

    // Reset numeric filters
    const speedFilterType = document.getElementById('speedFilterType');
    const speedMin = document.getElementById('speedMin');
    const speedMax = document.getElementById('speedMax');
    const orderFilterType = document.getElementById('orderFilterType');
    const orderMin = document.getElementById('orderMin');
    const orderMax = document.getElementById('orderMax');

    if (speedFilterType) speedFilterType.value = 'range';
    if (speedMin) speedMin.value = '';
    if (speedMax) speedMax.value = '';
    if (orderFilterType) orderFilterType.value = 'range';
    if (orderMin) orderMin.value = '';
    if (orderMax) orderMax.value = '';

    // Reset input layout về dạng range
    toggleFilterInputs('speed', 'range');
    toggleFilterInputs('order', 'range');

    // Reset filter object
    currentDetailFilters = {
        soMau: [],
        maSp: [],
        khachHang: [],
        may: [],
        maCa: [],
        speedFilter: { type: 'range', min: '', max: '' },
        orderFilter: { type: 'range', min: '', max: '' }
    };

    // Cập nhật currentDetailFilters với tất cả giá trị có sẵn
    ['soMau', 'maSp', 'khachHang', 'may', 'maCa'].forEach(filterType => {
        const container = document.getElementById(`${filterType}Options`);
        if (container) {
            const allBoxes = container.querySelectorAll('.filter-checkbox');
            currentDetailFilters[filterType] = Array.from(allBoxes).map(cb => cb.value);
        }
    });

    // Reset dữ liệu
    filteredTableData = originalTableData;
    currentPage = 1;

    // Update button text
    updateFilterButtons();
    updateNumericFilterButtons();

    // Render lại bảng
    updateTableContentOnly();
}



// Khôi phục trạng thái filter
function restoreFilterState() {
    // Khôi phục checkbox filters
    ['soMau', 'maSp', 'khachHang', 'may', 'maCa'].forEach(filterType => {
        const container = document.getElementById(`${filterType}Options`);
        if (container) {
            const checkboxes = container.querySelectorAll('.filter-checkbox');
            const checkedValues = currentDetailFilters[filterType] || [];

            checkboxes.forEach(checkbox => {
                // Mặc định chọn tất cả, chỉ bỏ chọn khi có filter cụ thể
                if (checkedValues.length === 0) {
                    checkbox.checked = true; // Chọn tất cả
                } else {
                    checkbox.checked = checkedValues.includes(checkbox.value);
                }
            });
        }
    });

    // Khôi phục numeric filters
    if (currentDetailFilters.speedFilter.min) {
        document.getElementById('speedMin').value = currentDetailFilters.speedFilter.min;
    }
    if (currentDetailFilters.speedFilter.max) {
        document.getElementById('speedMax').value = currentDetailFilters.speedFilter.max;
    }
    document.getElementById('speedFilterType').value = currentDetailFilters.speedFilter.type || 'range';

    if (currentDetailFilters.orderFilter.min) {
        document.getElementById('orderMin').value = currentDetailFilters.orderFilter.min;
    }
    if (currentDetailFilters.orderFilter.max) {
        document.getElementById('orderMax').value = currentDetailFilters.orderFilter.max;
    }
    document.getElementById('orderFilterType').value = currentDetailFilters.orderFilter.type || 'range';

    // Cập nhật button text
    updateFilterButtons();
    updateNumericFilterButtons();
}



// Khôi phục trạng thái filter cụ thể
function restoreSpecificFilterState(filterState) {
    ['soMau', 'maSp', 'khachHang', 'may', 'maCa'].forEach(filterType => {
        const container = document.getElementById(`${filterType}Options`);
        if (container && filterState[filterType]) {
            const checkboxes = container.querySelectorAll('.filter-checkbox');
            checkboxes.forEach(checkbox => {
                if (filterState[filterType][checkbox.value] !== undefined) {
                    checkbox.checked = filterState[filterType][checkbox.value];
                }
            });
        }
    });

    // Cập nhật button text
    updateFilterButtons();
}




// Hàm xử lý sự kiện thay đổi checkbox
function handleCheckboxChange() {
    const filterType = this.getAttribute('data-filter');
    console.log('🔍 Checkbox changed:', this.value, 'checked:', this.checked, 'filterType:', filterType);

    // Cập nhật button text ngay lập tức
    updateFilterButtons();

    // Gọi autoApplyFilters với delay nhỏ để đảm bảo UI đã cập nhật
    setTimeout(() => {
        console.log('🔍 Calling autoApplyFilters...');
        autoApplyFilters();
    }, 10);
}




// Sửa hàm applySpeedFilter()
function applySpeedFilter() {
    const speedFilterType = document.getElementById('speedFilterType').value;
    const speedMin = document.getElementById('speedMin')?.value || '';
    const speedMax = document.getElementById('speedMax')?.value || '';

    currentDetailFilters.speedFilter = {
        type: speedFilterType,
        min: speedMin,
        max: speedMax
    };

    updateNumericFilterButtons();
    autoApplyFilters();
}

function applyOrderFilter() {
    const orderFilterType = document.getElementById('orderFilterType').value;
    const orderMin = document.getElementById('orderMin')?.value || '';
    const orderMax = document.getElementById('orderMax')?.value || '';

    currentDetailFilters.orderFilter = {
        type: orderFilterType,
        min: orderMin,
        max: orderMax
    };

    updateNumericFilterButtons();
    autoApplyFilters();
}

function clearSpeedFilter() {
    // Reset select về range
    document.getElementById('speedFilterType').value = 'range';

    // Reset input về dạng range
    toggleFilterInputs('speed', 'range');

    // Clear giá trị trong filter object
    currentDetailFilters.speedFilter = {
        type: 'range',
        min: '',
        max: ''
    };

    updateNumericFilterButtons();
    autoApplyFilters();
}

function clearOrderFilter() {
    // Reset select về range
    document.getElementById('orderFilterType').value = 'range';

    // Reset input về dạng range
    toggleFilterInputs('order', 'range');

    // Clear giá trị trong filter object
    currentDetailFilters.orderFilter = {
        type: 'range',
        min: '',
        max: ''
    };

    updateNumericFilterButtons();
    autoApplyFilters();
}






// Biến theo dõi trạng thái bảng hiện tại
let currentTableMode = 'detail'; // 'detail' hoặc 'incomplete'

// Hàm chuyển sang bảng WS chưa hoàn thành
function switchToIncompleteTable() {
    currentTableMode = 'incomplete';
    const container = document.getElementById('detailTableContainer');
    const filters = collectFilters();

    // Lọc dữ liệu WS chưa hoàn thành
    const incompleteData = filteredTableData.filter(record => {
        const slDonHang = parseFloat(record.sl_don_hang) || 0;
        const soCon = parseFloat(record.so_con) || 1; // Tránh chia cho 0
        const tongSL = parseFloat(record.tong_so_luong) || 0;

        const targetQuantity = slDonHang / soCon;
        return targetQuantity > tongSL;
    });

    renderIncompleteTable(container, incompleteData, filters);
}

// Hàm chuyển về bảng chi tiết
function switchToDetailTable() {
    currentTableMode = 'detail';
    const container = document.getElementById('detailTableContainer');
    const filters = collectFilters();

    renderDetailTableWithoutFilters(container, filteredTableData, filters);
}

// Hàm render bảng WS chưa hoàn thành
function renderIncompleteTable(container, data, filters) {
    const switchButtonHtml = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6><i class="fas fa-exclamation-triangle me-2"></i>Bảng WS chưa hoàn thành</h6>
            <button class="btn btn-outline-primary btn-sm" id="switchToDetailBtn" onclick="switchToDetailTable()">
                <i class="fas fa-table me-1"></i>Xem chi tiết báo cáo
            </button>
        </div>
    `;

    if (!data || data.length === 0) {
        container.innerHTML = switchButtonHtml + `
            <div class="text-center text-muted p-4">
                <i class="fas fa-check-circle fa-2x mb-3 text-success"></i>
                <h6>Không có WS chưa hoàn thành</h6>
                <p>Tất cả WS đều đã hoàn thành theo yêu cầu.</p>
            </div>
        `;
        return;
    }

    // Tính toán phân trang
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    let html = `
        <div class="table-responsive" style="overflow-x: auto;">
            <table class="table table-striped table-hover text-center" style="white-space: nowrap; min-width: 1200px;">
                <thead class="table-dark sticky-top">
                    <tr>
                        <th>STT</th>
                        <th>WS</th>
                        <th>Mã Ca</th>
                        <th>Máy</th>
                        <th>Khách hàng</th>
                        <th>Mã sản phẩm</th>
                        <th>SL Đơn hàng</th>
                        <th>Số con</th>
                        <th style="width: 80px;">Số màu</th>
<th style="width: 100px;">Tuỳ chọn</th>
<th style="width: 120px;">Thành phẩm in</th>
                        <th>Phế liệu</th>
                        <th>Tổng SL</th>
        <th>Thành phẩm cuối</th>
                        <th>Tốc độ (s/h)</th>
                        <th>Thời gian</th>
                    </tr>
                </thead>
                <tbody>
    `;

    paginatedData.forEach((record, index) => {
        const ws = record.ws || '-';
        const maca = record.ma_ca || '-';
        const may = record.may || '-';
        const customer = record.khach_hang || '-';
        const product = record.ma_sp || '-';

        const slDonHang = parseFloat(record.sl_don_hang) || 0;
        const soCon = parseFloat(record.so_con) || 1;
        const soMau = record.so_mau || 0;

        // Lấy dữ liệu từ các cột báo cáo in
        const tongSL = formatNumber(record.tong_so_luong || 0);
        const thanhPhamRaw = record.thanh_pham || '0';
        const thanhPham = formatNumber(parseUSFormat(thanhPhamRaw));

        // Format hiển thị các cột cũ
        const paper = formatNumber(record.thanh_pham_in || 0);
        const waste = formatNumber((parseFloat(record.phe_lieu) || 0) + (parseFloat(record.phe_lieu_trang) || 0));
        const timeRange = formatTimeRangeWithDuration(record.thoi_gian_bat_dau, record.thoi_gian_ket_thuc);

        // Tính thời gian chạy máy
        let runTimeForRecord = 0;
        if (record.thoi_gian_bat_dau && record.thoi_gian_ket_thuc) {
            const start = new Date(record.thoi_gian_bat_dau);
            const end = new Date(record.thoi_gian_ket_thuc);
            let totalMinutes = (end - start) / (1000 * 60);
            if (totalMinutes < 0) totalMinutes += 24 * 60;
            const setupMinutes = record.thoi_gian_canh_may || 0;
            const stopMinutes = record.stopTime || 0;
            runTimeForRecord = Math.max(0, totalMinutes - setupMinutes - stopMinutes);
        }


        html += `
    <tr>
        <td><strong>${startIndex + index + 1}</strong></td>
        <td><span class="badge bg-primary">${ws}</span></td>
        <td><span class="badge" style="background-color: rgb(128, 186, 151); color: white;">${maca}</span></td>
        <td><span class="badge" style="background-color: rgb(208, 160, 145); color: white;">${may}</span></td>
        <td>${customer}</td>
        <td>${product}</td>
        <td>${formatNumber(slDonHang)}</td>
        <td>${formatNumber(soCon)}</td>
        <td>${soMau}</td>
        <td class="text-center">${record.tuy_chon || '-'}</td>
        <td class="text-center text-success"><strong>${paper}</strong></td>
        <td class="text-center text-danger"><strong>${waste}</strong></td>
        <td class="text-center text-info"><strong>${tongSL}</strong></td>
        <td class="text-center text-primary"><strong>${thanhPham}</strong></td>
        <td class="text-center">
            <span>${calculateSpeed(record.thanh_pham_in, runTimeForRecord)}</span>
        </td>
        <td>${timeRange}</td>
    </tr>
`;
    });

    html += `
                </tbody>
            </table>
        </div>
        
        <div class="row my-3">
            <div class="col-md-6">
                <div class="text-muted">
                    <small>Hiển thị ${startIndex + 1} - ${Math.min(endIndex, totalItems)} trong tổng số ${totalItems} WS chưa hoàn thành</small>
                </div>
            </div>
        </div>
    `;

    // Phân trang
    if (totalPages > 1) {
        html += `
            <div class="row mt-3">
                <div class="col-12">
                    <nav aria-label="Phân trang WS chưa hoàn thành">
                        <ul class="pagination justify-content-center">
                            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                                <a class="page-link" href="javascript:void(0)" onclick="changeIncompleteTablePage(${currentPage - 1}); return false;">Trước</a>
                            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `
                    <li class="page-item ${currentPage === i ? 'active' : ''}">
                        <a class="page-link" href="javascript:void(0)" onclick="changeIncompleteTablePage(${i}); return false;">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        html += `
                            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                                <a class="page-link" href="javascript:void(0)" onclick="changeIncompleteTablePage(${currentPage + 1}); return false;">Sau</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        `;
    }

    container.innerHTML = switchButtonHtml + html;

    // Thiết lập sticky header
    setTimeout(() => {
        setupStickyTableHeader();
    }, 100);
}

// Hàm thay đổi trang cho bảng WS chưa hoàn thành
function changeIncompleteTablePage(page) {
    const incompleteData = filteredTableData.filter(record => {
        const slDonHang = parseFloat(record.sl_don_hang) || 0;
        const soCon = parseFloat(record.so_con) || 1;
        const tongSL = parseFloat(record.tong_so_luong) || 0;

        const targetQuantity = slDonHang / soCon;
        return targetQuantity > tongSL;
    });

    const totalPages = Math.ceil(incompleteData.length / itemsPerPage);

    if (page < 1 || page > totalPages) return;

    currentPage = page;
    const container = document.getElementById('detailTableContainer');
    const filters = collectFilters();

    renderIncompleteTable(container, incompleteData, filters);
}



// Hàm chuyển sang bảng trưởng máy
function switchToShiftLeaderTable() {
    const filters = collectFilters();

    // Group dữ liệu theo trưởng máy từ dữ liệu ĐÃ LỌC
    const machineLeaderData = groupDataByMachineLeader(filteredTableData);

    // CHỈ cập nhật bảng phân tích sản xuất thành trưởng máy
    renderShiftLeaderAnalysis(machineLeaderData, filters);

    // CHỈ thay đổi biểu đồ số lượng sản xuất thành biểu đồ trưởng máy
    replaceQuantityChartsWithShiftLeader(machineLeaderData);

    // KHÔNG THAY ĐỔI bảng chi tiết ở dưới
}


// Hàm chuyển về bảng mã ca trong phân tích sản xuất
function switchBackToShiftAnalysis() {
    const filters = collectFilters();

    // Khôi phục biểu đồ số lượng sản xuất về trạng thái ban đầu
    if (currentChartData) {
        // Xóa container trưởng máy nếu có
        const shiftLeaderContainer = document.querySelector('.shift-leader-charts');
        if (shiftLeaderContainer) {
            shiftLeaderContainer.remove();
        }

        // XÓA biểu đồ stacked trưởng máy TRONG card
        const stackedContainer = document.getElementById('machineLeaderStackedContainer');
        if (stackedContainer) {
            stackedContainer.remove();
        }

        // Destroy chart instance
        if (window.machineLeaderStackedChartInstance) {
            window.machineLeaderStackedChartInstance.destroy();
            window.machineLeaderStackedChartInstance = null;
        }

        // Khôi phục title card
        const cardHeader = document.querySelector('#macaChart').closest('.card').querySelector('.card-header h6');
        if (cardHeader) {
            cardHeader.innerHTML = '<i class="fas fa-chart-pie me-2"></i>Số lượng sản xuất';
        }

        // Hiển thị lại canvas gốc
        const macaCanvas = document.getElementById('macaChart');
        if (macaCanvas) {
            macaCanvas.style.display = 'block';
        }

        // Tạo lại biểu đồ mã ca
        displayQuantityCharts(currentChartData, filters);
    }

    // CHỈ khôi phục bảng phân tích sản xuất về trạng thái mã ca
    displayQuantityAnalysis(currentChartData, filters);
}


// Group dữ liệu theo trưởng máy từ dữ liệu đã lọc
function groupDataByMachineLeader(data) {
    const machineLeaderGroups = {};

    data.forEach(record => {
        const maCa = record.ma_ca || 'Unknown';
        const may = record.may || 'Unknown';
        const truongMay = record.truong_may || `Trưởng máy ${may}`;

        const key = `${truongMay}_${maCa}_${may}`;

        if (!machineLeaderGroups[key]) {
            machineLeaderGroups[key] = {
                truongMay: truongMay,
                maCa: maCa,
                may: may,
                paper: 0,
                waste: 0,
                recordCount: 0
            };
        }

        machineLeaderGroups[key].paper += parseFloat(record.thanh_pham_in) || 0;
        machineLeaderGroups[key].waste += (parseFloat(record.phe_lieu) || 0) + (parseFloat(record.phe_lieu_trang) || 0);
        machineLeaderGroups[key].recordCount++;
    });

    return Object.values(machineLeaderGroups);
}







// Render bảng trưởng máy trong phần phân tích sản xuất
function renderShiftLeaderAnalysis(shiftLeaderData, filters) {
    const analysisContainer = document.getElementById('quantityAnalysis');
    if (!analysisContainer) return;

    let html = '';

    if (!shiftLeaderData || shiftLeaderData.length === 0) {
        html = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-user-tie fa-3x mb-3"></i>
                <h5>Không có dữ liệu trưởng máy</h5>
                <p>Không tìm thấy dữ liệu để hiển thị theo trưởng máy.</p>
            </div>
        `;
    } else {
        // Sắp xếp dữ liệu theo trưởng máy A-Z
        shiftLeaderData.sort((a, b) => {
            // Sắp xếp trưởng máy theo A-Z trước
            const leaderCompare = a.truongMay.localeCompare(b.truongMay, 'vi', { numeric: true });
            if (leaderCompare !== 0) return leaderCompare;

            // Sau đó sắp xếp theo mã ca
            if (a.maCa !== b.maCa) return a.maCa.localeCompare(b.maCa);
            return a.may.localeCompare(b.may);
        });

        html += `
        <button class="btn btn-outline-info btn-sm mb-2" onclick="switchBackToShiftAnalysis()">
                    <i class="fas fa-chart-pie me-1"></i>Quay lại bảng mã ca
                </button>
    <div class="table-responsive" style="max-height: 600px; overflow-y: auto; overflow-x: auto;">
        <table class="table table-striped table-hover" style="min-width: 800px;">
                    <thead class="table-dark sticky-top" style="position: sticky; top: 0; z-index: 10;">
                        <tr>
                            <th>Trưởng máy</th>
                            <th>Mã ca</th>
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

        const leaderGroups = {};
        shiftLeaderData.forEach(item => {
            if (!leaderGroups[item.truongMay]) {
                leaderGroups[item.truongMay] = {
                    truongMay: item.truongMay,
                    totalPaper: 0,
                    totalWaste: 0,
                    details: []
                };
            }
            leaderGroups[item.truongMay].totalPaper += item.paper;
            leaderGroups[item.truongMay].totalWaste += item.waste;
            leaderGroups[item.truongMay].details.push(item);
        });

        // Render từng nhóm trưởng máy theo thứ tự A-Z
        const sortedLeaderGroups = Object.values(leaderGroups).sort((a, b) => {
            return a.truongMay.localeCompare(b.truongMay, 'vi', { numeric: true });
        });

        sortedLeaderGroups.forEach(group => {
            // Sắp xếp chi tiết theo mã ca -> máy
            group.details.sort((a, b) => {
                if (a.maCa !== b.maCa) return a.maCa.localeCompare(b.maCa);
                return a.may.localeCompare(b.may);
            });

            // Render từng dòng chi tiết
            group.details.forEach((item, index) => {
                const total = item.paper + item.waste;
                const paperRate = total > 0 ? ((item.paper / total) * 100).toFixed(1) : 0;
                const wasteRate = total > 0 ? ((item.waste / total) * 100).toFixed(1) : 0;

                html += `
            <tr>
                <td>${index === 0 ? `<strong>${item.truongMay}</strong>` : ''}</td>
                <td><span class="badge" style="background-color: rgb(128, 186, 151); color: white;">${item.maCa}</span></td>
                <td><span class="badge" style="background-color: rgb(208, 160, 145); color: white;">${item.may}</span></td>
                <td class="text-end"><strong>${formatNumber(total)}</strong></td>
                <td class="text-end text-success"><strong>${formatNumber(item.paper)}</strong></td>
                <td class="text-end text-danger"><strong>${formatNumber(item.waste)}</strong></td>
                <td class="text-end">
                    <span class="badge" style="background-color: rgb(128, 186, 151); color: white;">
                        ${paperRate}%
                    </span>
                </td>
                <td class="text-end">
                    <span class="badge" style="background-color: rgb(201, 152, 152); color: white;">
                        ${wasteRate}%
                    </span>
                </td>
            </tr>
        `;
            });

            // Thêm hàng tổng cho trưởng máy này
            const groupTotal = group.totalPaper + group.totalWaste;
            const groupPaperRate = groupTotal > 0 ? ((group.totalPaper / groupTotal) * 100).toFixed(1) : 0;
            const groupWasteRate = groupTotal > 0 ? ((group.totalWaste / groupTotal) * 100).toFixed(1) : 0;

            html += `
        <tr style="background-color: #f8f9fa; border-top: 2px solid #dee2e6;">
            <td><strong style="color: #0066cc;">Tổng cộng</strong></td>
            <td></td>
            <td></td>
            <td class="text-end"><strong style="color: #0066cc; font-size: 1.1em;">${formatNumber(groupTotal)}</strong></td>
            <td class="text-end"><strong style="color: #28a745; font-size: 1.1em;">${formatNumber(group.totalPaper)}</strong></td>
            <td class="text-end"><strong style="color: #dc3545; font-size: 1.1em;">${formatNumber(group.totalWaste)}</strong></td>
            <td class="text-end">
                <span class="badge bg-success" style="font-size: 0.9em;">
                    ${groupPaperRate}%
                </span>
            </td>
            <td class="text-end">
                <span class="badge bg-danger" style="font-size: 0.9em;">
                    ${groupWasteRate}%
                </span>
            </td>
        </tr>
    `;

            // Thêm dòng trắng ngăn cách giữa các trưởng máy
            html += `<tr style="height: 10px;"><td colspan="8"></td></tr>`;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        // Thống kê
        const uniqueLeaders = Object.keys(leaderGroups).length;
        const totalPaper = shiftLeaderData.reduce((sum, item) => sum + item.paper, 0);
        const totalWaste = shiftLeaderData.reduce((sum, item) => sum + item.waste, 0);
        const totalPaperRate = (totalPaper + totalWaste) > 0 ? ((totalPaper / (totalPaper + totalWaste)) * 100).toFixed(1) : 0;
        const totalWasteRate = (totalPaper + totalWaste) > 0 ? ((totalWaste / (totalPaper + totalWaste)) * 100).toFixed(1) : 0;

        html += `
            <div class="row mt-3">
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h6>Số trưởng máy</h6>
                            <h4 class="text-primary">${uniqueLeaders}</h4>
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


    analysisContainer.innerHTML = html;
}





// Tạo biểu đồ stacked so sánh trưởng máy
function createMachineLeaderStackedChart(shiftLeaderData) {
    // Tìm card-body chứa biểu đồ mã ca
    const macaCanvas = document.getElementById('macaChart');
    const cardBody = macaCanvas.closest('.card-body');

    // Xóa biểu đồ stacked cũ nếu có
    const existingChart = cardBody.querySelector('#machineLeaderStackedContainer');
    if (existingChart) {
        existingChart.remove();
    }

    // Group dữ liệu theo trưởng máy
    const leaderGroups = {};
    shiftLeaderData.forEach(item => {
        if (!leaderGroups[item.truongMay]) {
            leaderGroups[item.truongMay] = {
                truongMay: item.truongMay,
                paper: 0,
                waste: 0
            };
        }
        leaderGroups[item.truongMay].paper += item.paper;
        leaderGroups[item.truongMay].waste += item.waste;
    });

    // Sắp xếp theo tổng số lượng giảm dần
    const sortedLeaders = Object.values(leaderGroups).sort((a, b) => {
        return (b.paper + b.waste) - (a.paper + a.waste);
    });

    // Tạo container cho biểu đồ stacked
    const stackedContainer = document.createElement('div');
    stackedContainer.id = 'machineLeaderStackedContainer';
    stackedContainer.className = 'mt-4';

    stackedContainer.innerHTML = `
    <hr>
    <div class="card-custom-sub border-left-sub">
    <div class="d-flex justify-content-between align-items-center mb-3 label-title-sub">
        <div><i class="fas fa-chart-line me-2"></i>Sản xuất theo ca - Trưởng máy</div>
        <div>
            
            <select class="form-select d-inline-block" id="leaderSelect" style="width: 200px;">
                <option value="">Tất cả trưởng máy</option>
            </select>
        </div>
    </div>
    <div style="height: 400px; position: relative;">
    <button class="chart-expand-btn" onclick="openFullscreen('leaderShiftStackedChart', '')">
                                            <i class="fas fa-expand"></i>
                                        </button>
        <canvas id="leaderShiftStackedChart"></canvas>
    </div>
    </div>

        <hr>
<div class="card-custom-sub border-left-sub">

        <div class="text-start mb-3 label-title-sub">
            <div><i class="fas fa-chart-bar me-2"></i>So sánh sản xuất theo trưởng máy</div>
        </div>
        <div style="height: 400px; position: relative;">
        <button class="chart-expand-btn" onclick="openFullscreen('machineLeaderStackedChart', 'So sánh sản xuất theo trưởng máy')">
                                            <i class="fas fa-expand"></i>
                                        </button>
            <canvas id="machineLeaderStackedChart"></canvas>
        </div>
        </div>
    `;

    // Thêm vào cuối card-body (dưới biểu đồ tròn)
    cardBody.appendChild(stackedContainer);

    // Tạo biểu đồ sau khi DOM đã được cập nhật
    setTimeout(() => {
        const canvas = document.getElementById('machineLeaderStackedChart');
        if (canvas) {
            createStackedChart(canvas, sortedLeaders);
        }

        // Tạo dropdown options cho trưởng máy
        const leaderSelect = document.getElementById('leaderSelect');
        if (leaderSelect) {
            const uniqueLeaders = [...new Set(shiftLeaderData.map(item => item.truongMay))].sort();
            uniqueLeaders.forEach(leader => {
                const option = document.createElement('option');
                option.value = leader;
                option.textContent = leader;
                leaderSelect.appendChild(option);
            });

            // Gắn sự kiện thay đổi
            leaderSelect.addEventListener('change', function () {
                updateLeaderShiftChart(shiftLeaderData, this.value);
            });

            // Hiển thị biểu đồ ban đầu (tất cả trưởng máy)
            updateLeaderShiftChart(shiftLeaderData, '');


            // Lưu dữ liệu để sử dụng trong fullscreen
            window.currentShiftLeaderData = shiftLeaderData;
        }
    }, 100);
}




// Tạo biểu đồ stacked
function createStackedChart(canvas, leaderData) {
    const labels = leaderData.map(item => item.truongMay);
    const paperData = leaderData.map(item => item.paper);
    const wasteData = leaderData.map(item => item.waste);

    // Destroy chart cũ nếu có
    if (window.machineLeaderStackedChartInstance) {
        window.machineLeaderStackedChartInstance.destroy();
    }

    window.machineLeaderStackedChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Thành phẩm in',
                data: paperData,
                backgroundColor: 'rgba(174, 207, 188, 0.8)',
                borderColor: 'rgba(148, 199, 169, 1)',
                borderWidth: 1
            }, {
                label: 'Phế liệu',
                data: wasteData,
                backgroundColor: 'rgba(248, 179, 181, 0.8)',
                borderColor: 'rgba(255, 141, 152, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 40 // Để chỗ cho số liệu trên đầu
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        // text: 'Trưởng máy',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0,
                        callback: function (value, index, values) {
                            const label = this.getLabelForValue(value);
                            // Cắt tên nếu quá dài
                            if (label.length > 18) {
                                return label.substring(0, 18) + '...';
                            }
                            return label;
                        }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Số lượng',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                        },
                        footer: function (tooltipItems) {
                            let total = 0;
                            tooltipItems.forEach(item => {
                                total += item.parsed.y;
                            });
                            return `Tổng: ${formatNumber(total)}`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    anchor: function (context) {
                        // Dataset 1 (phế liệu) - hiển thị ở end (trên)
                        // Dataset 0 (thành phẩm) - hiển thị ở center (giữa)
                        return context.datasetIndex === 1 ? 'end' : 'center';
                    },
                    align: function (context) {
                        // Dataset 1 (phế liệu) - align top
                        // Dataset 0 (thành phẩm) - align center
                        return context.datasetIndex === 1 ? 'top' : 'center';
                    },
                    color: function (context) {
                        // Dataset 1 (phế liệu) - màu đậm để nổi bật khi ở ngoài
                        // Dataset 0 (thành phẩm) - màu trắng
                        return context.datasetIndex === 1 ? '#8b2635' : 'black';
                    },
                    font: {
                        size: 10,
                        weight: 'bold'
                    },
                    formatter: function (value, context) {
                        if (!value || value === 0) return '';

                        // Tính tổng cho cột này
                        const dataIndex = context.dataIndex;
                        const datasets = context.chart.data.datasets;
                        const paperValue = datasets[0]?.data[dataIndex] || 0;
                        const wasteValue = datasets[1]?.data[dataIndex] || 0;
                        const total = paperValue + wasteValue;

                        if (total === 0) return '';

                        const percent = ((value / total) * 100).toFixed(1);

                        // Với phế liệu (dataset 1), hiển thị cả số liệu + %
                        if (context.datasetIndex === 1) {
                            return `${formatNumber(value)}\n(${percent}%)`;
                        }

                        // Với thành phẩm (dataset 0), hiển thị số + %
                        if (value < 1000) {
                            return `${percent}%`;
                        } else {
                            return `${formatNumber(value)}\n(${percent}%)`;
                        }
                    },
                    // Thêm padding để tránh overlap
                    padding: {
                        top: 4,
                        bottom: 4
                    },
                    textAlign: 'center'
                }
            }
        }
    });
}




function updateLeaderShiftChart(shiftLeaderData, selectedLeader) {
    const canvas = document.getElementById('leaderShiftStackedChart');
    if (!canvas) return;

    // Destroy chart cũ nếu có
    if (window.leaderShiftStackedChartInstance) {
        window.leaderShiftStackedChartInstance.destroy();
    }

    // Lọc dữ liệu theo trưởng máy được chọn
    let filteredData = shiftLeaderData;
    if (selectedLeader && selectedLeader !== '') {
        filteredData = shiftLeaderData.filter(item => item.truongMay === selectedLeader);
    }

    if (filteredData.length === 0) {
        const container = canvas.parentElement;
        container.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-exclamation-triangle"></i>
                <h6>${selectedLeader ? `Không có dữ liệu cho trưởng máy ${selectedLeader}` : 'Không có dữ liệu'}</h6>
            </div>
        `;
        return;
    }

    // Group dữ liệu theo ca và máy
    const shiftMachineGroups = {};
    filteredData.forEach(item => {
        let key, label;

        if (selectedLeader && selectedLeader !== '') {
            // Nếu chọn trưởng máy cụ thể, hiển thị theo ca + máy
            key = `${item.maCa}_${item.may}`;
            label = `Ca ${item.maCa} - Máy ${item.may}`;
        } else {
            // Nếu chọn tất cả trưởng máy, hiển thị theo trưởng máy + ca + máy
            key = `${item.truongMay}_${item.maCa}_${item.may}`;
            label = `${item.truongMay} - Ca ${item.maCa} - Máy ${item.may}`;
        }

        if (!shiftMachineGroups[key]) {
            shiftMachineGroups[key] = {
                label: label,
                maCa: item.maCa,
                may: item.may,
                truongMay: item.truongMay,
                paper: 0,
                waste: 0
            };
        }
        shiftMachineGroups[key].paper += item.paper;
        shiftMachineGroups[key].waste += item.waste;
    });

    // Chuyển thành array và sắp xếp
    const sortedShiftMachines = Object.values(shiftMachineGroups).sort((a, b) => {
        if (selectedLeader && selectedLeader !== '') {
            // Nếu chọn trưởng máy cụ thể, sắp xếp theo ca -> máy
            if (a.maCa !== b.maCa) return a.maCa.localeCompare(b.maCa);
            return a.may.localeCompare(b.may);
        } else {
            // Nếu chọn tất cả trưởng máy, sắp xếp theo tên trưởng máy A-Z trước
            const leaderCompare = a.truongMay.localeCompare(b.truongMay, 'vi', { numeric: true });
            if (leaderCompare !== 0) return leaderCompare;

            if (a.maCa !== b.maCa) return a.maCa.localeCompare(b.maCa);
            return a.may.localeCompare(b.may);
        }
    });

    const labels = sortedShiftMachines.map(item => item.label);
    const paperData = sortedShiftMachines.map(item => item.paper);
    const wasteData = sortedShiftMachines.map(item => item.waste);

    // Tạo title động
    const chartTitle = selectedLeader
        ? `Sản xuất theo ca - ${selectedLeader}`
        : 'Sản xuất theo ca - Tất cả trưởng máy';

    window.leaderShiftStackedChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Thành phẩm',
                data: paperData,
                backgroundColor: 'rgba(174, 207, 188, 0.8)',
                borderColor: 'rgba(148, 199, 169, 1)',
                borderWidth: 1
            }, {
                label: 'Phế liệu',
                data: wasteData,
                backgroundColor: 'rgba(248, 179, 181, 0.8)',
                borderColor: 'rgba(255, 141, 152, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 20
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: selectedLeader ? 'Ca' : 'Trưởng máy',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0,
                        callback: function (value, index, values) {
                            const label = this.getLabelForValue(value);
                            // Cắt tên nếu quá dài (chỉ khi hiển thị tất cả trưởng máy)
                            if (!selectedLeader && label.length > 25) {
                                return label.substring(0, 25) + '...';
                            }
                            return label;
                        }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Số lượng',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: chartTitle,
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 20
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                        },
                        footer: function (tooltipItems) {
                            let total = 0;
                            tooltipItems.forEach(item => {
                                total += item.parsed.y;
                            });
                            return `Tổng: ${formatNumber(total)}`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    anchor: function (context) {
                        return context.datasetIndex === 1 ? 'end' : 'center';
                    },
                    align: function (context) {
                        return context.datasetIndex === 1 ? 'top' : 'center';
                    },
                    color: function (context) {
                        return context.datasetIndex === 1 ? '#8b2635' : 'black';
                    },
                    font: {
                        size: 10,
                        weight: 'bold'
                    },
                    formatter: function (value, context) {
                        if (!value || value === 0) return '';

                        const dataIndex = context.dataIndex;
                        const datasets = context.chart.data.datasets;
                        const paperValue = datasets[0]?.data[dataIndex] || 0;
                        const wasteValue = datasets[1]?.data[dataIndex] || 0;
                        const total = paperValue + wasteValue;

                        if (total === 0) return '';

                        const percent = ((value / total) * 100).toFixed(1);

                        if (context.datasetIndex === 1) {
                            return `${formatNumber(value)}\n(${percent}%)`;
                        }

                        if (value < 1000) {
                            return `${percent}%`;
                        } else {
                            return `${formatNumber(value)}\n(${percent}%)`;
                        }
                    },
                    padding: {
                        top: 4,
                        bottom: 4
                    },
                    textAlign: 'center'
                }
            }
        }
    });
}



// Thay thế biểu đồ số lượng sản xuất bằng biểu đồ trưởng ca
function replaceQuantityChartsWithShiftLeader(shiftLeaderData) {
    // Tạo biểu đồ stacked so sánh trưởng máy
    createMachineLeaderStackedChart(shiftLeaderData);
}




// Tạo biểu đồ cho trưởng ca
function createShiftLeaderChart(canvas, leaderData) {
    const total = leaderData.paper + leaderData.waste;

    if (total === 0) {
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
                data: [leaderData.paper, leaderData.waste],
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
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
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
                    formatter: function (value, context) {
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return percent + '%';
                    }
                }
            }
        }
    });
}



// Biến lưu dữ liệu trưởng máy theo năm
let yearlyLeaderData = {};

// Lấy dữ liệu trưởng máy theo năm
async function loadYearlyLeaderData(currentYearlyData, year) {
    try {
        // Sử dụng year từ tham số được truyền vào
        const currentYear = year || new Date().getFullYear();

        const response = await fetch(`/api/bieu-do/in/yearly-leader-data?year=${currentYear}`);
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu trưởng máy theo năm');
        }

        yearlyLeaderData = await response.json();
        console.log('📊 yearlyLeaderData received:', yearlyLeaderData);

        // Tạo dropdown options cho trưởng máy
        const uniqueLeaders = Object.keys(yearlyLeaderData).sort();
        console.log('📊 uniqueLeaders:', uniqueLeaders);

        const leftSelect = document.getElementById('leaderSelectLeft');
        const rightSelect = document.getElementById('leaderSelectRight');

        if (leftSelect && rightSelect) {
            // Xóa options cũ
            leftSelect.innerHTML = '<option value="">Chọn trưởng máy</option>';
            rightSelect.innerHTML = '<option value="">Chọn trưởng máy</option>';

            // Thêm options mới
            uniqueLeaders.forEach(leader => {
                const optionLeft = document.createElement('option');
                optionLeft.value = leader;
                optionLeft.textContent = leader;
                leftSelect.appendChild(optionLeft);

                const optionRight = document.createElement('option');
                optionRight.value = leader;
                optionRight.textContent = leader;
                rightSelect.appendChild(optionRight);
            });

            // Gắn sự kiện thay đổi
            leftSelect.addEventListener('change', function () {
                console.log('🔄 Left select changed to:', this.value);
                currentLeaderSelections.left = this.value;
                updateLeaderOptions();
                setTimeout(() => {
                    updateYearlyLeaderChart('left', this.value);
                }, 100);
            });

            rightSelect.addEventListener('change', function () {
                console.log('🔄 Right select changed to:', this.value);
                currentLeaderSelections.right = this.value;
                updateLeaderOptions();
                setTimeout(() => {
                    updateYearlyLeaderChart('right', this.value);
                }, 100);
            });

            // Chọn sẵn 2 trưởng máy đầu tiên hoặc khôi phục lựa chọn trước đó
            if (uniqueLeaders.length >= 2) {
                const leftLeader = currentLeaderSelections.left || uniqueLeaders[0];
                const rightLeader = currentLeaderSelections.right || uniqueLeaders[1];

                leftSelect.value = leftLeader;
                rightSelect.value = rightLeader;

                // Lưu trạng thái
                currentLeaderSelections.left = leftLeader;
                currentLeaderSelections.right = rightLeader;

                // Cập nhật options và tạo biểu đồ
                updateLeaderOptions();
                setTimeout(() => {
                    updateYearlyLeaderChart('left', leftLeader);
                    updateYearlyLeaderChart('right', rightLeader);
                }, 200);

            }
            // Luôn tạo biểu đồ line bất kể có chọn trưởng máy hay không
            setTimeout(() => {
                createYearlyLeaderLineCharts();
            }, 400);

        }

        console.log('✅ Đã tải dữ liệu trưởng máy cho năm:', currentYear);

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu trưởng máy theo năm:', error);
    }
}





// Tạo biểu đồ line thành phẩm và phế liệu theo trưởng máy
function createYearlyLeaderLineCharts() {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const colors = [
        '#e8b0c9', '#accae3', '#e8c3a7', '#a9dbca', '#a3add9', '#dbd89e',
        '#ffb3ba', '#bae1ff', '#ffffba', '#ffdfba', '#c7ceea', '#ffd1dc'
    ];

    if (!yearlyLeaderData || Object.keys(yearlyLeaderData).length === 0) {
        console.log('⚠️ Không có dữ liệu trưởng máy để tạo biểu đồ line');

        // Tạo biểu đồ trống
        const paperCanvas = document.getElementById('yearlyLeaderPaperLineChart');
        const wasteCanvas = document.getElementById('yearlyLeaderWasteLineChart');

        if (paperCanvas) {
            const existingPaperChart = Chart.getChart(paperCanvas);
            if (existingPaperChart) existingPaperChart.destroy();

            new Chart(paperCanvas, {
                type: 'line',
                data: {
                    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                    datasets: [{
                        label: 'Không có dữ liệu',
                        data: [],
                        borderColor: '#cccccc',
                        backgroundColor: '#f0f0f0'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        datalabels: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Số lượng thành phẩm' } },
                        x: { title: { display: true, text: 'Tháng' } }
                    }
                }
            });
        }

        if (wasteCanvas) {
            const existingWasteChart = Chart.getChart(wasteCanvas);
            if (existingWasteChart) existingWasteChart.destroy();

            new Chart(wasteCanvas, {
                type: 'line',
                data: {
                    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                    datasets: [{
                        label: 'Không có dữ liệu',
                        data: [],
                        borderColor: '#cccccc',
                        backgroundColor: '#f0f0f0'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        datalabels: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Số lượng phế liệu' } },
                        x: { title: { display: true, text: 'Tháng' } }
                    }
                }
            });
        }

        return;
    }

    const leaders = Object.keys(yearlyLeaderData).sort();

    // Tạo datasets cho thành phẩm
    const paperDatasets = [];
    leaders.forEach((leader, index) => {
        const leaderData = yearlyLeaderData[leader] || {};
        const paperData = months.map(month => {
            const monthData = leaderData[month] || {};
            // Tổng thành phẩm của tất cả ca trong tháng
            const totalPaper = Object.values(monthData).reduce((sum, shiftData) => {
                return sum + (shiftData.paper || 0);
            }, 0);
            return totalPaper > 0 ? totalPaper : null;
        });

        paperDatasets.push({
            label: leader,
            data: paperData,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '20',
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 3,
            spanGaps: false
        });
    });

    // Tạo datasets cho phế liệu
    const wasteDatasets = [];
    leaders.forEach((leader, index) => {
        const leaderData = yearlyLeaderData[leader] || {};
        const wasteData = months.map(month => {
            const monthData = leaderData[month] || {};
            // Tổng phế liệu của tất cả ca trong tháng
            const totalWaste = Object.values(monthData).reduce((sum, shiftData) => {
                return sum + (shiftData.waste || 0);
            }, 0);
            return totalWaste > 0 ? totalWaste : null;
        });

        wasteDatasets.push({
            label: leader,
            data: wasteData,
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '20',
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 3,
            spanGaps: false
        });
    });

    // Tạo biểu đồ thành phẩm
    // Tạo biểu đồ thành phẩm
    const paperCanvas = document.getElementById('yearlyLeaderPaperLineChart');
    if (paperCanvas) {
        // Destroy chart cũ nếu có
        const existingPaperChart = Chart.getChart(paperCanvas);
        if (existingPaperChart) {
            existingPaperChart.destroy();
        }

        new Chart(paperCanvas, {
            type: 'line',
            data: {
                labels: months,
                datasets: paperDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 40 }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'line',
                            pointStyleWidth: 20,
                            font: { weight: 'bold', size: 12 },
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: function (context) {
                            const datasetIndex = context.datasetIndex;
                            const totalDatasets = context.chart.data.datasets.length;
                            const positions = ['top', 'bottom', 'right', 'left', 'center'];
                            return positions[datasetIndex % positions.length];
                        },
                        color: function (context) {
                            const originalColor = context.dataset.borderColor;
                            if (originalColor && originalColor.includes('rgb(')) {
                                return originalColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, function (match, r, g, b) {
                                    const newR = Math.max(0, Math.floor(r * 0.7));
                                    const newG = Math.max(0, Math.floor(g * 0.7));
                                    const newB = Math.max(0, Math.floor(b * 0.7));
                                    return `rgb(${newR}, ${newG}, ${newB})`;
                                });
                            }
                            return originalColor;
                        },
                        font: { size: 9, weight: 'bold' },
                        formatter: function (value) {
                            return value > 0 ? formatNumber(value) : '';
                        },
                        padding: 4,
                        textAlign: 'center',
                        textStrokeColor: 'white',
                        textStrokeWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng thành phẩm',
                            font: { color: 'black', weight: 'bold' }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tháng',
                            font: { color: 'black', weight: 'bold' }
                        }
                    }
                }
            }
        });
    }

    // Tạo biểu đồ phế liệu
    // Tạo biểu đồ phế liệu
    const wasteCanvas = document.getElementById('yearlyLeaderWasteLineChart');
    if (wasteCanvas) {
        // Destroy chart cũ nếu có
        const existingWasteChart = Chart.getChart(wasteCanvas);
        if (existingWasteChart) {
            existingWasteChart.destroy();
        }

        new Chart(wasteCanvas, {
            type: 'line',
            data: {
                labels: months,
                datasets: wasteDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 40 }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'line',
                            pointStyleWidth: 20,
                            font: { weight: 'bold', size: 12 },
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: function (context) {
                            const datasetIndex = context.datasetIndex;
                            const totalDatasets = context.chart.data.datasets.length;
                            const positions = ['top', 'bottom', 'right', 'left', 'center'];
                            return positions[datasetIndex % positions.length];
                        },
                        color: function (context) {
                            const originalColor = context.dataset.borderColor;
                            if (originalColor && originalColor.includes('rgb(')) {
                                return originalColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, function (match, r, g, b) {
                                    const newR = Math.max(0, Math.floor(r * 0.7));
                                    const newG = Math.max(0, Math.floor(g * 0.7));
                                    const newB = Math.max(0, Math.floor(b * 0.7));
                                    return `rgb(${newR}, ${newG}, ${newB})`;
                                });
                            }
                            return originalColor;
                        },
                        font: { size: 9, weight: 'bold' },
                        formatter: function (value) {
                            return value > 0 ? formatNumber(value) : '';
                        },
                        padding: 4,
                        textAlign: 'center',
                        textStrokeColor: 'white',
                        textStrokeWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng phế liệu',
                            font: { color: 'black', weight: 'bold' }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tháng',
                            font: { color: 'black', weight: 'bold' }
                        }
                    }
                }
            }
        });
    }
}





// Cập nhật options để tránh chọn trùng
function updateLeaderOptions() {
    const leftSelect = document.getElementById('leaderSelectLeft');
    const rightSelect = document.getElementById('leaderSelectRight');

    if (!leftSelect || !rightSelect) return;

    const leftValue = leftSelect.value;
    const rightValue = rightSelect.value;

    // Disable options đã chọn ở bên kia
    Array.from(leftSelect.options).forEach(option => {
        if (option.value === rightValue && option.value !== '') {
            option.disabled = true;
        } else {
            option.disabled = false;
        }
    });

    Array.from(rightSelect.options).forEach(option => {
        if (option.value === leftValue && option.value !== '') {
            option.disabled = true;
        } else {
            option.disabled = false;
        }
    });


    // Cập nhật options cho modal nếu đang mở
    const modalLeftSelect = document.getElementById('leaderSelectLeft_fullscreen');
    const modalRightSelect = document.getElementById('leaderSelectRight_fullscreen');

    if (modalLeftSelect && modalRightSelect) {
        const leftValue = modalLeftSelect.value;
        const rightValue = modalRightSelect.value;

        // Disable options đã chọn ở bên kia
        Array.from(modalLeftSelect.options).forEach(option => {
            if (option.value === rightValue && option.value !== '') {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });

        Array.from(modalRightSelect.options).forEach(option => {
            if (option.value === leftValue && option.value !== '') {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    }


}


// Cập nhật biểu đồ trưởng máy theo năm
function updateYearlyLeaderChart(side, selectedLeader) {
    const canvasId = side === 'left' ? 'yearlyLeaderChartLeft' : 'yearlyLeaderChartRight';

    console.log(`🔍 updateYearlyLeaderChart: side=${side}, leader=${selectedLeader}`);

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('❌ Không tìm thấy canvas:', canvasId);
        return;
    }

    // Destroy chart cũ
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    if (!selectedLeader || selectedLeader === '') {
        console.log('⚠️ Không có trưởng máy được chọn');
        return;
    }

    const leaderData = yearlyLeaderData[selectedLeader];
    if (!leaderData) {
        console.log('❌ Không có dữ liệu cho trưởng máy:', selectedLeader);
        return;
    }

    // Tạo dữ liệu cho biểu đồ - mỗi ca là 1 cột riêng
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const shifts = ['A', 'B', 'C', 'D', 'A1', 'B1', 'AB', 'AB-', 'AB+', 'HC'];

    // Tạo labels và data cho từng ca của từng tháng
    const labels = [];
    const paperData = [];
    const wasteData = [];

    months.forEach(month => {
        const monthData = leaderData[month] || {};

        // Tìm các ca có dữ liệu trong tháng này
        const activeShifts = shifts.filter(shift => {
            const shiftData = monthData[shift] || {};
            return (shiftData.paper || 0) > 0 || (shiftData.waste || 0) > 0;
        });

        if (activeShifts.length === 0) {
            // Nếu không có ca nào, tạo 1 cột trống
            labels.push(month);
            paperData.push(0);
            wasteData.push(0);
        } else {
            // Tạo cột cho từng ca
            activeShifts.forEach(shift => {
                const shiftData = monthData[shift] || {};
                labels.push(`${month}-${shift}`);
                paperData.push(shiftData.paper || 0);
                wasteData.push(shiftData.waste || 0);
            });
        }
    });

    console.log('📊 Labels:', labels);
    console.log('📊 Paper data:', paperData);
    console.log('📊 Waste data:', wasteData);

    if (paperData.every(val => val === 0) && wasteData.every(val => val === 0)) {
        console.log('⚠️ Không có dữ liệu để hiển thị');
        const container = canvas.parentElement;
        container.innerHTML = `
            <div class="text-center text-muted p-4">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <h6>Không có dữ liệu sản xuất</h6>
                <p>Trưởng máy "${selectedLeader}" chưa có dữ liệu cho năm này</p>
            </div>
        `;
        return;
    }

    // Tạo biểu đồ stacked với thành phẩm + phế liệu
    try {
        const newChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Thành phẩm',
                    data: paperData,
                    backgroundColor: 'rgba(174, 207, 188, 0.8)',
                    borderColor: 'rgba(148, 199, 169, 1)',
                    borderWidth: 1
                }, {
                    label: 'Phế liệu',
                    data: wasteData,
                    backgroundColor: 'rgba(248, 179, 181, 0.8)',
                    borderColor: 'rgba(255, 141, 152, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            // text: 'Tháng - Ca',
                            font: {
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0,
                            callback: function (value, index, values) {
                                const label = this.getLabelForValue(value);
                                // Hiển thị tháng-ca, ví dụ: T1-A, T1-B
                                return label;
                            }
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng',
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Sản xuất theo tháng - ${selectedLeader}`,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function (context) {
                                const label = context[0].label;
                                const [month, shift] = label.split('-');
                                return shift ? `${month} - Ca ${shift}` : month;
                            },
                            label: function (context) {
                                return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                            },
                            footer: function (tooltipItems) {
                                let sum = 0;
                                tooltipItems.forEach(item => {
                                    sum += item.parsed.y;
                                });
                                return `Tổng: ${formatNumber(sum)}`;
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        anchor: function (context) {
                            // Thành phẩm hiển thị ở center, phế liệu hiển thị ở end (top)
                            return context.datasetIndex === 0 ? 'center' : 'end';
                        },
                        align: function (context) {
                            return context.datasetIndex === 0 ? 'center' : 'top';
                        },
                        color: function (context) {
                            // Thành phẩm dùng màu đen, phế liệu dùng màu đỏ đậm
                            return context.datasetIndex === 0 ? 'black' : '#8b2635';
                        },
                        font: {
                            size: 9,
                            weight: 'bold'
                        },
                        formatter: function (value, context) {
                            if (!value || value === 0) return '';

                            const dataIndex = context.dataIndex;
                            const datasets = context.chart.data.datasets;
                            const paperValue = datasets[0]?.data[dataIndex] || 0;
                            const wasteValue = datasets[1]?.data[dataIndex] || 0;
                            const total = paperValue + wasteValue;

                            if (total === 0) return '';

                            const percent = ((value / total) * 100).toFixed(1);

                            // Hiển thị số liệu + phần trăm
                            if (context.datasetIndex === 0) {
                                // Thành phẩm: hiển thị số + % ở giữa
                                return `${formatNumber(value)}\n(${percent}%)`;
                            } else {
                                // Phế liệu: hiển thị số + % ở trên
                                return `${formatNumber(value)}\n(${percent}%)`;
                            }
                        },
                        padding: 4,
                        textAlign: 'center',
                        textStrokeColor: 'white',
                        textStrokeWidth: 0.5
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        console.log(`✅ Tạo biểu đồ thành công cho ${selectedLeader} - ${side}`);

    } catch (error) {
        console.error('❌ Lỗi tạo biểu đồ:', error);
    }
}


// Hàm cập nhật chart trưởng máy trong fullscreen
function updateFullscreenLeaderChart(side, selectedLeader, chartInstance) {
    if (!chartInstance || !selectedLeader) return;

    console.log('🔄 Updating fullscreen leader chart:', side, selectedLeader);

    const leaderData = yearlyLeaderData[selectedLeader];
    if (!leaderData) {
        console.error('❌ Không có dữ liệu cho trưởng máy:', selectedLeader);
        return;
    }

    // Tạo dữ liệu mới
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const shifts = ['A', 'B', 'C', 'D', 'A1', 'B1', 'AB', 'AB-', 'AB+', 'HC'];

    const labels = [];
    const paperData = [];
    const wasteData = [];

    months.forEach(month => {
        const monthData = leaderData[month] || {};
        const activeShifts = shifts.filter(shift => {
            const shiftData = monthData[shift] || {};
            return (shiftData.paper || 0) > 0 || (shiftData.waste || 0) > 0;
        });

        if (activeShifts.length === 0) {
            labels.push(month);
            paperData.push(0);
            wasteData.push(0);
        } else {
            activeShifts.forEach(shift => {
                const shiftData = monthData[shift] || {};
                labels.push(`${month}-${shift}`);
                paperData.push(shiftData.paper || 0);
                wasteData.push(shiftData.waste || 0);
            });
        }
    });

    // Cập nhật dữ liệu chart
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = paperData;
    chartInstance.data.datasets[1].data = wasteData;

    // Cập nhật title
    chartInstance.options.plugins.title.text = `Sản xuất theo tháng - ${selectedLeader}`;

    // Render lại chart
    chartInstance.update();

    console.log('✅ Đã cập nhật fullscreen chart');
}




// Hàm cập nhật chart trưởng máy shift trong fullscreen
function updateFullscreenLeaderShiftChart(selectedLeader, chartInstance) {
    if (!chartInstance || !window.currentShiftLeaderData) return;

    console.log('🔄 Updating fullscreen leader shift chart:', selectedLeader);

    // Lấy dữ liệu gốc
    const shiftLeaderData = window.currentShiftLeaderData;

    // Lọc dữ liệu theo trưởng máy được chọn
    let filteredData = shiftLeaderData;
    if (selectedLeader && selectedLeader !== '') {
        filteredData = shiftLeaderData.filter(item => item.truongMay === selectedLeader);
    }

    if (filteredData.length === 0) {
        console.log('⚠️ Không có dữ liệu cho trưởng máy:', selectedLeader);
        return;
    }

    // Group dữ liệu theo ca và máy (GIỐNG LOGIC TRONG updateLeaderShiftChart)
    const shiftMachineGroups = {};
    filteredData.forEach(item => {
        let key, label;

        if (selectedLeader && selectedLeader !== '') {
            // Nếu chọn trưởng máy cụ thể, hiển thị theo ca-máy
            key = `${item.maCa}_${item.may}`;
            label = `Ca ${item.maCa}`;
        } else {
            // Nếu chọn tất cả trưởng máy, hiển thị theo trưởng máy-ca-máy
            key = `${item.truongMay}_${item.maCa}_${item.may}`;
            label = `${item.truongMay}`;
        }

        if (!shiftMachineGroups[key]) {
            shiftMachineGroups[key] = {
                label: label,
                maCa: item.maCa,
                may: item.may,
                truongMay: item.truongMay,
                paper: 0,
                waste: 0
            };
        }
        shiftMachineGroups[key].paper += item.paper;
        shiftMachineGroups[key].waste += item.waste;
    });

    // Chuyển thành array và sắp xếp
    const sortedShiftMachines = Object.values(shiftMachineGroups).sort((a, b) => {
        if (selectedLeader && selectedLeader !== '') {
            // Sắp xếp theo ca -> máy
            if (a.maCa !== b.maCa) return a.maCa.localeCompare(b.maCa);
            return a.may.localeCompare(b.may);
        } else {
            // Sắp xếp theo trưởng máy -> ca -> máy
            if (a.truongMay !== b.truongMay) return a.truongMay.localeCompare(b.truongMay);
            if (a.maCa !== b.maCa) return a.maCa.localeCompare(b.maCa);
            return a.may.localeCompare(b.may);
        }
    });

    const labels = sortedShiftMachines.map(item => item.label);
    const paperData = sortedShiftMachines.map(item => item.paper);
    const wasteData = sortedShiftMachines.map(item => item.waste);

    // Cập nhật dữ liệu chart
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = paperData;
    chartInstance.data.datasets[1].data = wasteData;

    // Cập nhật title
    const chartTitle = selectedLeader
        ? `Sản xuất theo ca - ${selectedLeader}`
        : 'Sản xuất theo ca - Tất cả trưởng máy';
    chartInstance.options.plugins.title.text = chartTitle;

    // Cập nhật title trục x
    chartInstance.options.scales.x.title.text = selectedLeader ? 'Ca' : 'Trưởng máy';

    // Render lại chart
    chartInstance.update();

    // Đồng bộ với biểu đồ gốc
    setTimeout(() => {
        const originalCanvas = document.getElementById('leaderShiftStackedChart');
        if (originalCanvas) {
            updateLeaderShiftChart(shiftLeaderData, selectedLeader);
        }
    }, 100);
}




// Biến lưu trạng thái hiện tại
let currentTimeAnalysisMode = 'sanxuat';

// Hàm chuyển đổi chế độ phân tích thời gian
function switchTimeAnalysisMode(mode) {
    if (currentTimeAnalysisMode === mode) return;

    currentTimeAnalysisMode = mode;

    // Cập nhật trạng thái active của các nút
    document.querySelectorAll('#timeAnalysis .btn-group button').forEach(btn => {
        btn.classList.remove('active', 'btn-success');
        btn.classList.add('btn-outline-success');
    });

    // Xác định ID button dựa trên mode
    let buttonId = '';
    switch (mode) {
        case 'sanxuat':
            buttonId = 'btnSanXuat';
            break;
        case 'maca':
            buttonId = 'btnMaCa';
            break;
        case 'may':
            buttonId = 'btnMay';
            break;
        case 'truongmay':
            buttonId = 'btnTruongMay';
            break;
        default:
            buttonId = 'btnSanXuat';
    }

    const activeBtn = document.getElementById(buttonId);
    if (activeBtn) {
        activeBtn.classList.remove('btn-outline-success');
        activeBtn.classList.add('active', 'btn-success');
    }

    // Cập nhật nội dung phần dưới
    updateTimeAnalysisContent(mode);
}



// Hàm cập nhật nội dung phần dưới (cả 2 cột)
function updateTimeAnalysisContent(mode) {
    // Tìm toàn bộ phần row chứa 2 cột trong timeAnalysis
    const timeAnalysisEl = document.getElementById('timeAnalysis');
    if (!timeAnalysisEl) return;

    const twoColumnRow = timeAnalysisEl.querySelector('.row');
    if (!twoColumnRow) return;

    switch (mode) {
        case 'sanxuat':
            // Khôi phục lại nội dung 2 cột sản xuất/chạy mẫu
            displayTwoColumnProductionContent(twoColumnRow);
            break;
        case 'maca':
            // Thay thế bằng bảng mã ca (1 cột full width)
            displayTimeTableByShift(twoColumnRow);
            break;
        case 'truongmay':
            // Thay thế bằng bảng trưởng máy (1 cột full width)
            displayTimeTableByLeader(twoColumnRow);
            break;
        case 'may':
            // Thay thế bằng bảng máy (1 cột full width)
            displayTimeTableByMachine(twoColumnRow);
            break;
    }
}

// Hàm hiển thị lại nội dung lý do dừng máy
function displayStopReasonsContent(container) {
    let html = '';

    if (currentChartData && currentChartData.timeData && currentChartData.timeData.otherTime > 0 &&
        currentChartData.stopReasons && currentChartData.stopReasons.length > 0) {

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

        const sortedStopReasons = [...currentChartData.stopReasons].sort((a, b) => {
            const aReason = a.reason.toString();
            const bReason = b.reason.toString();
            const aMatch = aReason.match(/F(\d+)/);
            const bMatch = bReason.match(/F(\d+)/);
            if (aMatch && bMatch) {
                return parseInt(aMatch[1]) - parseInt(bMatch[1]);
            }
            return aReason.localeCompare(bReason);
        });

        const totalStopTime = currentChartData.stopReasons.reduce((sum, reason) => sum + (reason.duration || 0), 0);

        sortedStopReasons.forEach(reason => {
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

    container.innerHTML = html;
}




// Hàm hiển thị bảng thời gian theo mã ca
function displayTimeTableByShift(container) {
    if (!currentChartData || !currentChartData.reports) {
        container.innerHTML = '<div class="col-12 text-center text-muted p-4">Không có dữ liệu</div>';
        return;
    }

    const shiftGroups = {};
    const wsCountByShiftMachine = {};
    currentChartData.reports.forEach(report => {
        const shift = report.ma_ca || 'Unknown';
        const may = report.may || 'Unknown';
        const key = `${shift}_${may}`;
        const ws = report.ws || 'Unknown';


        // Đếm WS
    if (!wsCountByShiftMachine[key]) {
        wsCountByShiftMachine[key] = new Set();
    }
    wsCountByShiftMachine[key].add(ws);

        if (!shiftGroups[key]) {
            shiftGroups[key] = {
                shift: shift,
                may: may,
                runTime: 0,
                setupTime: 0,
                stopTime: 0,
                giaiLaoTime: 0,
                baoDuongTime: 0,
                mayHuTime: 0
            };
        }

        if (report.thoi_gian_bat_dau && report.thoi_gian_ket_thuc) {
            const start = new Date(report.thoi_gian_bat_dau);
            const end = new Date(report.thoi_gian_ket_thuc);
            let totalMinutes = (end - start) / (1000 * 60);
            if (totalMinutes < 0) totalMinutes += 24 * 60;

            const setupMinutes = parseFloat(report.thoi_gian_canh_may) || 0;
            const stopMinutes = report.stopTime || 0;
            const runMinutes = Math.max(0, totalMinutes - setupMinutes - stopMinutes);

            shiftGroups[key].runTime += runMinutes;
            shiftGroups[key].setupTime += setupMinutes;
            shiftGroups[key].stopTime += stopMinutes;
        }
    });

    // Tính thời gian dừng máy theo lý do F cụ thể cho từng ca-máy
    if (currentChartData && currentChartData.stopReasons) {
        // Group stopReasons theo lý do
        const reasonTimeMap = {};
        currentChartData.stopReasons.forEach(reason => {
            const reasonCode = reason.reason;
            const duration = reason.duration || 0;

            if (reasonCode === 'F12: Giải lao') {
                reasonTimeMap.giaiLao = (reasonTimeMap.giaiLao || 0) + duration;
            } else if (reasonCode === 'F7: Bảo dưỡng') {
                reasonTimeMap.baoDuong = (reasonTimeMap.baoDuong || 0) + duration;
            } else if (reasonCode === 'F1: Máy hư') {
                reasonTimeMap.mayHu = (reasonTimeMap.mayHu || 0) + duration;
            }
        });

        // Phân bổ thời gian theo tỷ lệ sản xuất của từng ca-máy
        const totalProduction = Object.values(shiftGroups).reduce((sum, group) =>
            sum + group.runTime + group.setupTime, 0);

        if (totalProduction > 0) {
            Object.values(shiftGroups).forEach(group => {
                const groupRatio = (group.runTime + group.setupTime) / totalProduction;
                group.giaiLaoTime = Math.round((reasonTimeMap.giaiLao || 0) * groupRatio);
                group.baoDuongTime = Math.round((reasonTimeMap.baoDuong || 0) * groupRatio);
                group.mayHuTime = Math.round((reasonTimeMap.mayHu || 0) * groupRatio);
            });
        }
    }

    const sortedShifts = Object.values(shiftGroups).sort((a, b) => {
        if (a.shift !== b.shift) return a.shift.localeCompare(b.shift);
        return a.may.localeCompare(b.may);
    });

    // Tính tổng theo mã ca
    const shiftTotals = {};
    sortedShifts.forEach(item => {
        if (!shiftTotals[item.shift]) {
            shiftTotals[item.shift] = {
                runTime: 0, setupTime: 0, stopTime: 0,
                giaiLaoTime: 0, baoDuongTime: 0, mayHuTime: 0
            };
        }
        shiftTotals[item.shift].runTime += item.runTime;
        shiftTotals[item.shift].setupTime += item.setupTime;
        shiftTotals[item.shift].stopTime += item.stopTime;
        shiftTotals[item.shift].giaiLaoTime += (item.giaiLaoTime || 0);
        shiftTotals[item.shift].baoDuongTime += (item.baoDuongTime || 0);
        shiftTotals[item.shift].mayHuTime += (item.mayHuTime || 0);
    });

    // Tạo HTML với tổng cộng
    let tableRows = '';
    const uniqueShifts = [...new Set(sortedShifts.map(item => item.shift))].sort();

    uniqueShifts.forEach(shift => {
        // Thêm các dòng chi tiết của ca
        const shiftItems = sortedShifts.filter(item => item.shift === shift);
        shiftItems.forEach(item => {
            tableRows += `
                <tr>
                    <td><span class="badge p-2" style="background-color: rgb(128, 186, 151); color: white;">Ca ${item.shift}</span></td>
                    <td><span class="badge p-2" style="background-color: rgb(208, 160, 145); color: white;">${item.may}</span></td>
                    <td class="text-center p-2"><strong>${wsCountByShiftMachine[`${item.shift}_${item.may}`]?.size || 0}</strong></td>
                    <td class="text-center p-2">${formatDuration(item.runTime)}</td>
                    <td class="text-center p-2">${formatDuration(item.setupTime)}</td>
                    <td class="text-center p-2">${formatDuration(item.stopTime)}</td>
                    <td class="text-center p-2">${formatDuration(item.giaiLaoTime || 0)}</td>
                    <td class="text-center p-2">${formatDuration(item.baoDuongTime || 0)}</td>
                    <td class="text-center p-2">${formatDuration(item.mayHuTime || 0)}</td>
                </tr>
            `;
        });

        // Thêm dòng tổng cộng cho ca này
        const total = shiftTotals[shift];
        tableRows += `
            <tr style="background-color: #f8f9fa; border-top: 2px solid #dee2e6;">
                <td class="p-2"><strong style="color: #0066cc;">Tổng cộng</strong></td>
                <td></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${shiftItems.reduce((sum, item) => sum + (wsCountByShiftMachine[`${item.shift}_${item.may}`]?.size || 0), 0)}</strong></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(total.runTime)}</strong></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(total.setupTime)}</strong></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(total.stopTime)}</strong></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(total.giaiLaoTime)}</strong></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(total.baoDuongTime)}</strong></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(total.mayHuTime)}</strong></td>
            </tr>
            <tr style="height: 10px;"><td colspan="9"></td></tr>
        `;
    });

    const html = `
        <div class="col-12">
            <h6><i class="fas fa-clock me-2"></i>Phân tích thời gian theo mã ca</h6>
            <div class="table-responsive" style="max-height: 400px; overflow-y: auto; overflow-x: auto;">
                <table class="table table-striped table-hover table-sm" style="white-space: nowrap; min-width: 800px;">
                    <thead class="table-dark sticky-top">
                        <tr>
                            <th class="text-center p-2">Mã ca</th>
                            <th class="text-center p-2">Máy</th>
                            <th class="text-center p-2">SL WS</th>
                            <th class="text-center p-2">TG chạy máy</th>
                            <th class="text-center p-2">TG canh máy</th>
                            <th class="text-center p-2">TG dừng máy</th>
                            <th class="text-center p-2">TG giải lao</th>
                            <th class="text-center p-2">TG bảo dưỡng</th>
                            <th class="text-center p-2">TG máy hư</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}



// Hàm hiển thị bảng thời gian theo trưởng máy
function displayTimeTableByLeader(container) {
    if (!currentChartData || !currentChartData.reports) {
        container.innerHTML = '<div class="col-12 text-center text-muted p-4">Không có dữ liệu</div>';
        return;
    }

    const leaderGroups = {};
    const wsCountByLeaderShiftMachine = {};
    currentChartData.reports.forEach(report => {
        const leader = report.truong_may || `Trưởng máy ${report.may || 'Unknown'}`;
        const shift = report.ma_ca || 'Unknown';
        const may = report.may || 'Unknown';
        const key = `${leader}_${shift}_${may}`;
        const ws = report.ws || 'Unknown';


        if (!wsCountByLeaderShiftMachine[key]) {
            wsCountByLeaderShiftMachine[key] = new Set();
        }
        wsCountByLeaderShiftMachine[key].add(ws);


        if (!leaderGroups[key]) {
            leaderGroups[key] = {
                leader: leader,
                shift: shift,
                may: may,
                runTime: 0,
                setupTime: 0,
                stopTime: 0,
                giaiLaoTime: 0,
                baoDuongTime: 0,
                mayHuTime: 0
            };
        }

        if (report.thoi_gian_bat_dau && report.thoi_gian_ket_thuc) {
            const start = new Date(report.thoi_gian_bat_dau);
            const end = new Date(report.thoi_gian_ket_thuc);
            let totalMinutes = (end - start) / (1000 * 60);
            if (totalMinutes < 0) totalMinutes += 24 * 60;

            const setupMinutes = parseFloat(report.thoi_gian_canh_may) || 0;
            const stopMinutes = report.stopTime || 0;
            const runMinutes = Math.max(0, totalMinutes - setupMinutes - stopMinutes);

            leaderGroups[key].runTime += runMinutes;
            leaderGroups[key].setupTime += setupMinutes;
            leaderGroups[key].stopTime += stopMinutes;
        }
    });

    // Tính thời gian dừng máy theo lý do F cụ thể cho từng trưởng máy
    if (currentChartData && currentChartData.stopReasons) {
        // Group stopReasons theo lý do
        const reasonTimeMap = {};
        currentChartData.stopReasons.forEach(reason => {
            const reasonCode = reason.reason;
            const duration = reason.duration || 0;

            if (reasonCode === 'F12: Giải lao') {
                reasonTimeMap.giaiLao = (reasonTimeMap.giaiLao || 0) + duration;
            } else if (reasonCode === 'F7: Bảo dưỡng') {
                reasonTimeMap.baoDuong = (reasonTimeMap.baoDuong || 0) + duration;
            } else if (reasonCode === 'F1: Máy hư') {
                reasonTimeMap.mayHu = (reasonTimeMap.mayHu || 0) + duration;
            }
        });

        // Phân bổ thời gian theo tỷ lệ sản xuất của từng trưởng máy-ca-máy
        const totalProduction = Object.values(leaderGroups).reduce((sum, group) =>
            sum + group.runTime + group.setupTime, 0);

        if (totalProduction > 0) {
            Object.values(leaderGroups).forEach(group => {
                const groupRatio = (group.runTime + group.setupTime) / totalProduction;
                group.giaiLaoTime = Math.round((reasonTimeMap.giaiLao || 0) * groupRatio);
                group.baoDuongTime = Math.round((reasonTimeMap.baoDuong || 0) * groupRatio);
                group.mayHuTime = Math.round((reasonTimeMap.mayHu || 0) * groupRatio);
            });
        }
    }

    const sortedLeaders = Object.values(leaderGroups).sort((a, b) => {
        if (a.leader !== b.leader) return a.leader.localeCompare(b.leader);
        if (a.shift !== b.shift) return a.shift.localeCompare(b.shift);
        return a.may.localeCompare(b.may);
    });

    // Tính tổng theo trưởng máy
    const leaderTotals = {};
    sortedLeaders.forEach(item => {
        if (!leaderTotals[item.leader]) {
            leaderTotals[item.leader] = {
                runTime: 0, setupTime: 0, stopTime: 0,
                giaiLaoTime: 0, baoDuongTime: 0, mayHuTime: 0
            };
        }
        leaderTotals[item.leader].runTime += item.runTime;
        leaderTotals[item.leader].setupTime += item.setupTime;
        leaderTotals[item.leader].stopTime += item.stopTime;
        leaderTotals[item.leader].giaiLaoTime += (item.giaiLaoTime || 0);
        leaderTotals[item.leader].baoDuongTime += (item.baoDuongTime || 0);
        leaderTotals[item.leader].mayHuTime += (item.mayHuTime || 0);
    });

    // Tạo HTML với tổng cộng
    let tableRows = '';
    const uniqueLeaders = [...new Set(sortedLeaders.map(item => item.leader))].sort();

    uniqueLeaders.forEach(leader => {
        // Thêm các dòng chi tiết của trưởng máy
        const leaderItems = sortedLeaders.filter(item => item.leader === leader);
        leaderItems.forEach(item => {
            tableRows += `
                <tr>
                    <td><strong>${item.leader}</strong></td>
                    <td><span class="badge p-2" style="background-color: rgb(128, 186, 151); color: white;">Ca ${item.shift}</span></td>
                    <td><span class="badge p-2" style="background-color: rgb(208, 160, 145); color: white;">${item.may}</span></td>
                    <td class="text-center p-2"><strong>${wsCountByLeaderShiftMachine[`${item.leader}_${item.shift}_${item.may}`]?.size || 0}</strong></td>
                    <td class="text-center p-2">${formatDuration(item.runTime)}</td>
                    <td class="text-center p-2">${formatDuration(item.setupTime)}</td>
                    <td class="text-center p-2">${formatDuration(item.stopTime)}</td>
                    <td class="text-center p-2">${formatDuration(item.giaiLaoTime || 0)}</td>
                    <td class="text-center p-2">${formatDuration(item.baoDuongTime || 0)}</td>
                    <td class="text-center p-2">${formatDuration(item.mayHuTime || 0)}</td>
                </tr>
            `;
        });

        // Thêm dòng tổng cộng cho trưởng máy này
        const total = leaderTotals[leader];
        tableRows += `
            <tr style="background-color: #f8f9fa; border-top: 2px solid #dee2e6;">
                <td class="text-center p-2"><strong style="color: #0066cc;">Tổng cộng</strong></td>
                <td></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${leaderItems.reduce((sum, item) => sum + (wsCountByLeaderShiftMachine[`${item.leader}_${item.shift}_${item.may}`]?.size || 0), 0)}</strong></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(total.runTime)}</strong></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(total.setupTime)}</strong></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(total.stopTime)}</strong></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(total.giaiLaoTime)}</strong></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(total.baoDuongTime)}</strong></td>
                <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(total.mayHuTime)}</strong></td>
            </tr>
            <tr style="height: 10px;"><td colspan="10"></td></tr>
        `;
    });

    const html = `
        <div class="col-12">
            <h6><i class="fas fa-user-tie me-2"></i>Phân tích thời gian theo trưởng máy</h6>
            <div class="table-responsive" style="max-height: 400px; overflow-y: auto; overflow-x: auto;">
                <table class="table table-striped table-hover table-sm" style="white-space: nowrap; min-width: 900px;">
                    <thead class="table-dark sticky-top">
                        <tr>
                            <th class="text-center p-2">Trưởng máy</th>
                            <th class="text-center p-2">Mã ca</th>
                            <th class="text-center p-2">Máy</th>
                            <th class="text-center p-2">SL WS</th>
                            <th class="text-center p-2">TG chạy máy</th>
                            <th class="text-center p-2">TG canh máy</th>
                            <th class="text-center p-2">TG dừng máy</th>
                            <th class="text-center p-2" style="white-space: nowrap;">TG giải lao</th>
                            <th class="text-center p-2" style="white-space: nowrap;">TG bảo dưỡng</th>
                            <th class="text-center p-2" style="white-space: nowrap;">TG máy hư</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}




// Hàm hiển thị bảng thời gian theo máy
function displayTimeTableByMachine(container) {
    if (!currentChartData || !currentChartData.reports) {
        container.innerHTML = '<div class="col-12 text-center text-muted p-4">Không có dữ liệu</div>';
        return;
    }

    const machineGroups = {};
    const wsCountByMachine = {};

    currentChartData.reports.forEach(report => {
        const may = report.may || 'Unknown';
        const ws = report.ws || 'Unknown';

if (!wsCountByMachine[may]) {
    wsCountByMachine[may] = new Set();
}
wsCountByMachine[may].add(ws);


        if (!machineGroups[may]) {
            machineGroups[may] = {
                may: may,
                runTime: 0,
                setupTime: 0,
                stopTime: 0,
                giaiLaoTime: 0,
                baoDuongTime: 0,
                mayHuTime: 0
            };
        }

        if (report.thoi_gian_bat_dau && report.thoi_gian_ket_thuc) {
            const start = new Date(report.thoi_gian_bat_dau);
            const end = new Date(report.thoi_gian_ket_thuc);
            let totalMinutes = (end - start) / (1000 * 60);
            if (totalMinutes < 0) totalMinutes += 24 * 60;

            const setupMinutes = parseFloat(report.thoi_gian_canh_may) || 0;
            const stopMinutes = report.stopTime || 0;
            const runMinutes = Math.max(0, totalMinutes - setupMinutes - stopMinutes);

            machineGroups[may].runTime += runMinutes;
            machineGroups[may].setupTime += setupMinutes;
            machineGroups[may].stopTime += stopMinutes;
        }
    });

    // Tính thời gian dừng máy theo lý do F cụ thể cho từng máy
    if (currentChartData && currentChartData.stopReasons) {
        // Group stopReasons theo lý do
        const reasonTimeMap = {};
        currentChartData.stopReasons.forEach(reason => {
            const reasonCode = reason.reason;
            const duration = reason.duration || 0;

            if (reasonCode === 'F12: Giải lao') {
                reasonTimeMap.giaiLao = (reasonTimeMap.giaiLao || 0) + duration;
            } else if (reasonCode === 'F7: Bảo dưỡng') {
                reasonTimeMap.baoDuong = (reasonTimeMap.baoDuong || 0) + duration;
            } else if (reasonCode === 'F1: Máy hư') {
                reasonTimeMap.mayHu = (reasonTimeMap.mayHu || 0) + duration;
            }
        });

        // Phân bổ thời gian theo tỷ lệ sản xuất của từng máy
        const totalProduction = Object.values(machineGroups).reduce((sum, group) =>
            sum + group.runTime + group.setupTime, 0);

        if (totalProduction > 0) {
            Object.values(machineGroups).forEach(group => {
                const groupRatio = (group.runTime + group.setupTime) / totalProduction;
                group.giaiLaoTime = Math.round((reasonTimeMap.giaiLao || 0) * groupRatio);
                group.baoDuongTime = Math.round((reasonTimeMap.baoDuong || 0) * groupRatio);
                group.mayHuTime = Math.round((reasonTimeMap.mayHu || 0) * groupRatio);
            });
        }
    }

    const sortedMachines = Object.values(machineGroups).sort((a, b) => {
        return a.may.localeCompare(b.may);
    });

    // Tính tổng tất cả máy
    const grandTotal = sortedMachines.reduce((total, item) => ({
        runTime: total.runTime + item.runTime,
        setupTime: total.setupTime + item.setupTime,
        stopTime: total.stopTime + item.stopTime,
        giaiLaoTime: total.giaiLaoTime + (item.giaiLaoTime || 0),
        baoDuongTime: total.baoDuongTime + (item.baoDuongTime || 0),
        mayHuTime: total.mayHuTime + (item.mayHuTime || 0)
    }), {runTime: 0, setupTime: 0, stopTime: 0, giaiLaoTime: 0, baoDuongTime: 0, mayHuTime: 0});

    const html = `
        <div class="col-12">
            <h6><i class="fas fa-cogs me-2"></i>Phân tích thời gian theo máy</h6>
            <div class="table-responsive" style="max-height: 400px; overflow-y: auto; overflow-x: auto;">
                <table class="table table-striped table-hover table-sm" style="white-space: nowrap; min-width: 700px;">
                    <thead class="table-dark sticky-top">
                        <tr>
                            <th style="white-space: nowrap;" class="text-center p-2">Máy</th>
                            <th class="text-center p-2">SL WS</th>
                            <th class="text-center p-2" style="white-space: nowrap;">TG chạy máy</th>
                            <th class="text-center p-2" style="white-space: nowrap;">TG canh máy</th>
                            <th class="text-center p-2" style="white-space: nowrap;">TG dừng máy</th>
                            <th class="text-center p-2" style="white-space: nowrap;">TG giải lao</th>
                            <th class="text-center p-2" style="white-space: nowrap;">TG bảo dưỡng</th>
                            <th class="text-center p-2" style="white-space: nowrap;">TG máy hư</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedMachines.map(item => `
                            <tr>
                                <td><span class="badge p-2" style="background-color: rgb(208, 160, 145); color: white;">${item.may}</span></td>
                                <td class="text-center p-2"><strong>${wsCountByMachine[item.may]?.size || 0}</strong></td>
                                <td class="text-center p-2">${formatDuration(item.runTime)}</td>
                                <td class="text-center p-2">${formatDuration(item.setupTime)}</td>
                                <td class="text-center p-2">${formatDuration(item.stopTime)}</td>
                                <td class="text-center p-2">${formatDuration(item.giaiLaoTime || 0)}</td>
                                <td class="text-center p-2">${formatDuration(item.baoDuongTime || 0)}</td>
                                <td class="text-center p-2">${formatDuration(item.mayHuTime || 0)}</td>
                            </tr>
                        `).join('')}
                        <tr style="background-color: #f8f9fa; border-top: 2px solid #dee2e6;">
                            <td class="text-center p-2"><strong style="color: #0066cc;">Tổng cộng</strong></td>
                            <td class="text-center p-2"><strong style="color: #0066cc;">${Object.values(wsCountByMachine).reduce((sum, wsSet) => sum + wsSet.size, 0)}</strong></td>
                            <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(grandTotal.runTime)}</strong></td>
                            <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(grandTotal.setupTime)}</strong></td>
                            <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(grandTotal.stopTime)}</strong></td>
                            <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(grandTotal.giaiLaoTime)}</strong></td>
                            <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(grandTotal.baoDuongTime)}</strong></td>
                            <td class="text-center p-2"><strong style="color: #0066cc;">${formatDuration(grandTotal.mayHuTime)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}


// Hàm hiển thị nội dung 2 cột sản xuất/chạy mẫu (khôi phục nội dung gốc)
function displayTwoColumnProductionContent(container) {
    // Lấy lại dữ liệu từ currentChartData để tính toán
    let runTime = 0, setupTime = 0, otherTime = 0, totalTime = 0;
    let productionTime = 0, sampleTime = 0, productionSetupTime = 0, sampleSetupTime = 0, productionStopTime = 0, sampleStopTime = 0;

    if (currentChartData && currentChartData.reports) {
        // Tính lại thời gian từ dữ liệu gốc
        const result = calculateProductionAndSampleTime(currentChartData.reports);
        runTime = result.totalRunTime;
        productionTime = result.productionTime;
        sampleTime = result.sampleTime;
        productionSetupTime = result.productionSetupTime;
        sampleSetupTime = result.sampleSetupTime;
        productionStopTime = result.productionStopTime;
        sampleStopTime = result.sampleStopTime;

        // Lấy thời gian từ timeData
        if (currentChartData.timeData) {
            setupTime = currentChartData.timeData.setupTime || 0;
            otherTime = currentChartData.timeData.otherTime || 0;
            totalTime = currentChartData.timeData.totalTime || 0;
        }
    }

    const totalProductionTime = productionTime + productionSetupTime + productionStopTime;
    const totalSampleTime = sampleTime + sampleSetupTime + sampleStopTime;

    const html = `
        <div class="col-6 border-end border-dark">
        <div  style="border-left: 4px solid #2495d2; padding-left: 10px;">
            <div class="mb-3">
                <div class="d-flex justify-content-between">
                    <span><i class="fa-solid fa-circle-play me-2" style="color: rgb(174, 195, 214);"></i>Thời gian chạy máy:</span>
                    <strong id="runTime">${formatDuration(runTime)}</strong>
                </div>
            </div>
            <div class="mb-3">
                <div class="d-flex justify-content-between">
                    <span><i class="fas fa-tools me-2" style="color: rgb(224, 202, 162);"></i>Thời gian canh máy:</span>
                    <strong id="setupTime">${formatDuration(setupTime)}</strong>
                </div>
            </div>
            <div class="mb-3">
                <div class="d-flex justify-content-between">
                    <span><i class="fas fa-pause-circle me-2" style="color: rgb(242, 174, 174);"></i>Thời gian khác:</span>
                    <strong id="otherTime">${formatDuration(otherTime)}</strong>
                </div>
            </div>
            <div class="mb-3">
                <div class="d-flex justify-content-between">
                    <span><i class="fas fa-clock text-primary me-2"></i>Tổng thời gian:</span>
                    <strong id="totalTime">${formatDuration(runTime + setupTime + otherTime)}</strong>
                </div>
            </div>
            </div>
        </div>

        <div class="col-6">
            <!-- Nhóm Sản xuất -->
            <div style="border-left: 4px solid #28a745; padding-left: 10px; margin-bottom: 15px;">
                <h6 style="color: #28a745; margin-bottom: 10px;"><i class="fas fa-industry me-2"></i>Sản xuất</h6>
                <div class="mb-2">
                    <div class="d-flex justify-content-between">
                        <span><i class="fa-solid fa-circle-play me-2" style="color: rgb(119, 191, 220);"></i>Thời gian sản xuất:</span>
                        <strong id="productionTime">${formatDuration(productionTime)}</strong>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="d-flex justify-content-between">
                        <span><i class="fas fa-tools me-2" style="color: rgb(224, 202, 162);"></i>TG canh máy sản xuất:</span>
                        <strong id="setupTimeRight">${formatDuration(productionSetupTime)}</strong>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="d-flex justify-content-between">
                        <span><i class="fas fa-pause-circle me-2" style="color: rgb(242, 174, 174);"></i>TG dừng máy sản xuất:</span>
                        <strong id="stopTimeRight">${formatDuration(productionStopTime)}</strong>
                    </div>
                </div>
                <div class="mb-2" style="border-top: 1px solid #dee2e6; padding-top: 5px;">
                    <div class="d-flex justify-content-between">
                        <span><i class="fas fa-clock text-success me-2"></i><strong>Tổng TG sản xuất:</strong></span>
                        <strong id="totalTimeRight" style="color: #28a745;">${formatDuration(totalProductionTime)}</strong>
                    </div>
                </div>
            </div>
            
            <!-- Nhóm Chạy mẫu -->
            <div style="border-left: 4px solid #ffc107; padding-left: 10px;">
                <h6 style="color: #ffc107; margin-bottom: 10px;"><i class="fas fa-flask me-2"></i>Chạy mẫu</h6>
                <div class="mb-2">
                    <div class="d-flex justify-content-between">
                        <span><i class="fa-solid fa-circle-play me-2" style="color: rgb(119, 191, 220);"></i>Thời gian chạy mẫu:</span>
                        <strong id="sampleTime">${formatDuration(sampleTime)}</strong>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="d-flex justify-content-between">
                        <span><i class="fas fa-tools me-2" style="color: rgb(224, 202, 162);"></i>TG canh mẫu:</span>
                        <strong id="sampleSetupTime">${formatDuration(sampleSetupTime)}</strong>
                    </div>
                </div>
                <div class="mb-2">
                    <div class="d-flex justify-content-between">
                        <span><i class="fas fa-pause-circle me-2" style="color: rgb(242, 174, 174);"></i>TG dừng máy:</span>
                        <strong id="sampleStopTime">${formatDuration(sampleStopTime)}</strong>
                    </div>
                </div>
                <div class="mb-2" style="border-top: 1px solid #dee2e6; padding-top: 5px;">
                    <div class="d-flex justify-content-between">
                        <span><i class="fas fa-clock text-warning me-2"></i><strong>Tổng TG chạy mẫu:</strong></span>
                        <strong id="totalSampleTime" style="color: #ffc107;">${formatDuration(totalSampleTime)}</strong>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}





// Hàm xuất Excel
function exportToExcel() {
    try {
        // Kiểm tra thư viện XLSX
        if (typeof XLSX === 'undefined') {
            showNotification('Chưa tải thư viện Excel. Vui lòng tải lại trang.', 'error');
            return;
        }

        // Lấy dữ liệu hiện tại đang hiển thị
        const dataToExport = currentTableMode === 'incomplete' ?
            getIncompleteDataForExport() :
            filteredTableData;

        if (!dataToExport || dataToExport.length === 0) {
            showNotification('Không có dữ liệu để xuất Excel', 'warning');
            return;
        }

        // Chuẩn bị dữ liệu Excel
        const excelData = dataToExport.map((record, index) => {
            // Tính thời gian chạy máy cho record
            let runTimeForRecord = 0;
            if (record.thoi_gian_bat_dau && record.thoi_gian_ket_thuc) {
                const start = new Date(record.thoi_gian_bat_dau);
                const end = new Date(record.thoi_gian_ket_thuc);
                let totalMinutes = (end - start) / (1000 * 60);
                if (totalMinutes < 0) totalMinutes += 24 * 60;
                const setupMinutes = record.thoi_gian_canh_may || 0;
                const stopMinutes = record.stopTime || 0;
                runTimeForRecord = Math.max(0, totalMinutes - setupMinutes - stopMinutes);
            }

            return {
                'STT': index + 1,
                'WS': record.ws || '-',
                'Mã Ca': record.ma_ca || '-',
                'Máy': record.may || '-',
                'Khách hàng': record.khach_hang || '-',
                'Mã sản phẩm': record.ma_sp || '-',
                'SL Đơn hàng': record.sl_don_hang || 0,
                'Số con': record.so_con || 0,
                'Số màu': record.so_mau || 0,
                'Tuỳ chọn': record.tuy_chon || '-',
                'Thành phẩm in': record.thanh_pham_in || 0,
                'Phế liệu': (parseFloat(record.phe_lieu) || 0) + (parseFloat(record.phe_lieu_trang) || 0),
                'Tổng SL': record.tong_so_luong || 0,
                'Thành phẩm cuối': record.thanh_pham || 0,
                'Tốc độ (s/h)': calculateSpeed(record.thanh_pham_in, runTimeForRecord),
                'Thời gian bắt đầu': record.thoi_gian_bat_dau || '-',
                'Thời gian kết thúc': record.thoi_gian_ket_thuc || '-',
                'Thời gian chạy máy (phút)': Math.round(runTimeForRecord),
                'Thời gian canh máy (phút)': record.thoi_gian_canh_may || 0,
                'Thời gian dừng máy (phút)': record.stopTime || 0
            };
        });

        // Tạo workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Tự động điều chỉnh độ rộng cột
        const colWidths = [];
        Object.keys(excelData[0]).forEach(key => {
            const maxLength = Math.max(
                key.length,
                ...excelData.map(row => String(row[key]).length)
            );
            colWidths.push({ width: Math.min(maxLength + 2, 30) });
        });
        ws['!cols'] = colWidths;

        // Thêm worksheet vào workbook
        const fileName = currentTableMode === 'incomplete' ?
            'WS_Chua_Hoan_Thanh' :
            'Bao_Cao_In_Chi_Tiet';
        XLSX.utils.book_append_sheet(wb, ws, fileName);

        // Tạo tên file với timestamp
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
        const fullFileName = `${fileName}_${timestamp}.xlsx`;

        // Xuất file
        XLSX.writeFile(wb, fullFileName);

        showNotification(`Đã xuất file ${fullFileName} thành công`, 'success');

    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error);
        showNotification('Có lỗi xảy ra khi xuất Excel: ' + error.message, 'error');
    }
}

// Hàm lấy dữ liệu WS chưa hoàn thành cho xuất Excel
function getIncompleteDataForExport() {
    if (!filteredTableData || filteredTableData.length === 0) {
        return [];
    }

    return filteredTableData.filter(record => {
        const slDonHang = parseFloat(record.sl_don_hang) || 0;
        const soCon = parseFloat(record.so_con) || 1;
        const tongSL = parseFloat(record.tong_so_luong) || 0;

        const targetQuantity = slDonHang / soCon;
        return targetQuantity > tongSL;
    });
}




// Tạo biểu đồ thời gian theo máy
function createMachineTimeChart(reports) {
    const canvas = document.getElementById('machineTimeChart');
    if (!canvas) return;

    // Destroy chart cũ nếu có
    if (window.machineTimeChart) {
        window.machineTimeChart.destroy();
        window.machineTimeChart = null;
    }

    // Group dữ liệu theo máy (sử dụng logic từ displayTimeTableByMachine)
    const machineGroups = {};
    reports.forEach(report => {
        const may = report.may || 'Unknown';

        if (!machineGroups[may]) {
            machineGroups[may] = {
                may: may,
                runTime: 0,
                setupTime: 0,
                stopTime: 0,
                giaiLaoTime: 0,
                baoDuongTime: 0,
                mayHuTime: 0
            };
        }

        if (report.thoi_gian_bat_dau && report.thoi_gian_ket_thuc) {
            const start = new Date(report.thoi_gian_bat_dau);
            const end = new Date(report.thoi_gian_ket_thuc);
            let totalMinutes = (end - start) / (1000 * 60);
            if (totalMinutes < 0) totalMinutes += 24 * 60;

            const setupMinutes = parseFloat(report.thoi_gian_canh_may) || 0;
            const stopMinutes = report.stopTime || 0;
            const runMinutes = Math.max(0, totalMinutes - setupMinutes - stopMinutes);

            machineGroups[may].runTime += runMinutes;
            machineGroups[may].setupTime += setupMinutes;
            machineGroups[may].stopTime += stopMinutes;
        }
    });

    // Tính thời gian dừng máy theo lý do F cụ thể (copy từ displayTimeTableByMachine)
    if (currentChartData && currentChartData.stopReasons) {
        const reasonTimeMap = {};
        currentChartData.stopReasons.forEach(reason => {
            const reasonCode = reason.reason;
            const duration = reason.duration || 0;

            if (reasonCode === 'F12: Giải lao') {
                reasonTimeMap.giaiLao = (reasonTimeMap.giaiLao || 0) + duration;
            } else if (reasonCode === 'F7: Bảo dưỡng') {
                reasonTimeMap.baoDuong = (reasonTimeMap.baoDuong || 0) + duration;
            } else if (reasonCode === 'F1: Máy hư') {
                reasonTimeMap.mayHu = (reasonTimeMap.mayHu || 0) + duration;
            }
        });

        const totalProduction = Object.values(machineGroups).reduce((sum, group) =>
            sum + group.runTime + group.setupTime, 0);

        if (totalProduction > 0) {
            Object.values(machineGroups).forEach(group => {
                const groupRatio = (group.runTime + group.setupTime) / totalProduction;
                group.giaiLaoTime = Math.round((reasonTimeMap.giaiLao || 0) * groupRatio);
                group.baoDuongTime = Math.round((reasonTimeMap.baoDuong || 0) * groupRatio);
                group.mayHuTime = Math.round((reasonTimeMap.mayHu || 0) * groupRatio);
            });
        }
    }

    const sortedMachines = Object.values(machineGroups).sort((a, b) => a.may.localeCompare(b.may));

    if (sortedMachines.length === 0) return;

    const labels = sortedMachines.map(item => `Máy ${item.may}`);
    const runTimeData = sortedMachines.map(item => item.runTime);
    const setupTimeData = sortedMachines.map(item => item.setupTime);
    const stopTimeData = sortedMachines.map(item => item.stopTime);
    const giaiLaoData = sortedMachines.map(item => item.giaiLaoTime || 0);
    const baoDuongData = sortedMachines.map(item => item.baoDuongTime || 0);
    const mayHuData = sortedMachines.map(item => item.mayHuTime || 0);

    window.machineTimeChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'TG chạy máy',
                data: runTimeData,
                backgroundColor: 'rgba(175, 196, 215, 0.8)',
                borderColor: 'rgba(165, 190, 214, 1)',
                borderWidth: 1
            }, {
                label: 'TG canh máy',
                data: setupTimeData,
                backgroundColor: 'rgba(225, 203, 161, 0.8)',
                borderColor: 'rgba(223, 201, 158, 1)',
                borderWidth: 1
            }, {
                label: 'TG dừng máy',
                data: stopTimeData,
                backgroundColor: 'rgba(243, 174, 174, 0.8)',
                borderColor: 'rgba(221, 152, 152, 1)',
                borderWidth: 1
            }, {
                label: 'TG giải lao',
                data: giaiLaoData,
                backgroundColor: 'rgba(255, 206, 84, 0.8)',
                borderColor: 'rgba(255, 206, 84, 1)',
                borderWidth: 1
            }, {
                label: 'TG bảo dưỡng',
                data: baoDuongData,
                backgroundColor: 'rgba(153, 102, 255, 0.8)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }, {
                label: 'TG máy hư',
                data: mayHuData,
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 40 }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: '',
                        font: { weight: 'bold' }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Thời gian (phút)',
                        font: { weight: 'bold' }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 10
                
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatDuration(context.parsed.y)}`;
                        }
                    }
                },
                datalabels: {
                    display: function(context) {
                        try {
                            if (!context || !context.parsed) return false;
                            const value = context.parsed.y;
                            return value !== null && value !== undefined && value > 0;
                        } catch (error) {
                            return false;
                        }
                    },
                    anchor: 'center',
                    align: 'center',
                    color: 'black',
                    font: { size: 10, weight: 'bold' },
                    formatter: function(value, context) {
                        try {
                            if (!value || value <= 0) return '';
                            
                            // Tính tổng cột
                            const dataIndex = context.dataIndex;
                            const total = context.chart.data.datasets.reduce((sum, dataset) => {
                                return sum + (dataset.data[dataIndex] || 0);
                            }, 0);
                            
                            if (total === 0) return '';
                            
                            const percent = ((value / total) * 100).toFixed(1);
                            
                            // Format thành giờ phút
                            const hours = Math.floor(value / 60);
                            const minutes = Math.floor(value % 60);
                            let timeStr = '';
                            
                            if (hours > 0) {
                                timeStr = `${hours} giờ${minutes > 0 ? ' ' + minutes + ' phút' : ''}`;
                            } else {
                                timeStr = `${minutes} phút`;
                            }
                            
                            return `${percent}% (${timeStr})`;
                        } catch (error) {
                            return '';
                        }
                    },
                    textStrokeColor: 'white',
                    textStrokeWidth: 1,
                    padding: 4
                }
            }
        }
    });
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
    return parseFloat(num).toLocaleString('en-US');
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

    // Chuyển đổi chính xác: minutes có thể có số thập phân (giây)
    const totalSeconds = Math.round(minutes * 60); // Chuyển về giây và làm tròn
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);

    if (hours === 0) {
        return `${mins} phút`;
    } else if (mins === 0) {
        return `${hours} giờ`;
    } else {
        return `${hours} giờ ${mins} phút`;
    }
}

console.log('✅ Hệ thống biểu đồ đã được khởi tạo hoàn tất');






// Hàm chuyển đổi format US (1,000) thành số
function parseUSFormat(value) {
    if (!value || value === '' || value === null || value === undefined) return 0;

    // Nếu đã là số thì return luôn
    if (typeof value === 'number') return value;

    // Chuyển thành string và xử lý
    const stringValue = value.toString().trim();
    if (stringValue === '') return 0;

    // Loại bỏ dấu phẩy và chuyển thành số
    const cleaned = stringValue.replace(/,/g, '');
    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? 0 : parsed;
}



