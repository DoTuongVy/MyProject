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


let topCustomersChart = null;
let topProductsChart = null;

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
    }
}


async function loadYearlyCharts(year) {
    try {
        showLoading(true);

        // Lấy dữ liệu theo năm
        const yearlyData = await fetchYearlyData(year);

        // Hiển thị biểu đồ
        displayYearlyMachineCharts(yearlyData);

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


function displayYearlyMachineCharts(yearlyData) {
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
                            <canvas id="yearlyWasteLineChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Sau khi set container.innerHTML = html;
    container.innerHTML = html;

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
                                align: function(context) {
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
                                color: function(context) {
                                    // Sử dụng màu đậm hơn của đường line
                                    const originalColor = context.dataset.borderColor || context.dataset.backgroundColor;
                                    
                                    // Chuyển màu thành đậm hơn
                                    if (originalColor.includes('rgb(')) {
                                        // Giảm độ sáng xuống 30%
                                        return originalColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, function(match, r, g, b) {
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
                                formatter: function(value) {
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
                                align: function(context) {
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
                                color: function(context) {
                                    // Sử dụng màu đậm hơn của đường line
                                    const originalColor = context.dataset.borderColor || context.dataset.backgroundColor;
                                    
                                    // Chuyển màu thành đậm hơn
                                    if (originalColor.includes('rgb(')) {
                                        // Giảm độ sáng xuống 30%
                                        return originalColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, function(match, r, g, b) {
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
                                formatter: function(value) {
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
    const setupTime = data.timeData?.setupTime || 0;

    // Thời gian chạy máy = tổng thời gian - thời gian canh máy - thời gian dừng máy
    const runTime = Math.max(0, totalTime - setupTime - stopTime);

    // Thời gian làm việc = tổng thời gian - thời gian dừng máy
    const workTime = Math.max(0, totalTime - stopTime);

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

    let html = '<div class="row justify-content-center">';

    html += `
    <div class="col-12">
        <div class="text-start mb-3">
            <h4>Sản xuất theo mã ca</h4>
        </div>
        <div style="height: 400px; position: relative;">
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
                        label: function(context) {
                            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                        }
                    }
                },
                datalabels: {
                    display: true,
                    anchor: function(context) {
                        return context.datasetIndex === 1 ? 'end' : 'center';
                    },
                    align: function(context) {
                        return context.datasetIndex === 1 ? 'top' : 'center';
                    },
                    color: function(context) {
                        return context.datasetIndex === 1 ? '#8b2635' : 'black';
                    },
                    font: {
                        size: 11,
                        weight: 'bold'
                    },
                    formatter: function(value, context) {
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

    // Cập nhật thông tin thời gian ở bên phân tích
    updateTimeAnalysisInfo({
        totalTime: totalTime,
        setupTime: setupTime,
        otherTime: otherTime, // Truyền otherTime đã tính toán
        runTime: runTime
    });


    // Tính toán và hiển thị thời gian sản xuất/chạy mẫu
    if (data && data.reports) {
        const { totalRunTime, productionTime, sampleTime } = calculateProductionAndSampleTime(data.reports);

        // Lấy thời gian canh máy và dừng máy giống bên trái
        const setupTimeRight = setupTime;
        const stopTimeRight = otherTime;

        // Tính tổng thời gian bên phải = sản xuất + mẫu + canh máy + dừng máy
        const totalTimeRight = productionTime + sampleTime + setupTimeRight + stopTimeRight;

        // Debug tổng thời gian
        console.log('🔍 DEBUG tổng thời gian bên phải:');
        console.log('- productionTime:', productionTime, 'phút');
        console.log('- sampleTime:', sampleTime, 'phút');
        console.log('- setupTimeRight:', setupTimeRight, 'phút');
        console.log('- stopTimeRight:', stopTimeRight, 'phút');
        console.log('- totalTimeRight (tính toán):', totalTimeRight, 'phút');
        console.log('- totalTimeRight (format):', formatDuration(totalTimeRight));

        // Cập nhật display bên phải
        const productionTimeEl = document.getElementById('productionTime');
        const sampleTimeEl = document.getElementById('sampleTime');
        const setupTimeRightEl = document.getElementById('setupTimeRight');
        const stopTimeRightEl = document.getElementById('stopTimeRight');
        const totalTimeRightEl = document.getElementById('totalTimeRight');

        if (productionTimeEl) productionTimeEl.textContent = formatDuration(productionTime);
        if (sampleTimeEl) sampleTimeEl.textContent = formatDuration(sampleTime);
        if (setupTimeRightEl) setupTimeRightEl.textContent = formatDuration(setupTimeRight);
        if (stopTimeRightEl) stopTimeRightEl.textContent = formatDuration(stopTimeRight);
        if (totalTimeRightEl) totalTimeRightEl.textContent = formatDuration(totalTimeRight);

        // Tạo biểu đồ chi tiết với thời gian đúng
        createSampleProductTimeChart(productionTime, sampleTime, setupTimeRight, stopTimeRight);

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




// Tính toán thời gian sản xuất và chạy mẫu
function calculateProductionAndSampleTime(reports) {
    let totalRunTime = 0;      // Thêm dòng này
    let productionTime = 0;
    let sampleTime = 0;

    reports.forEach((report, index) => {
        const ws = report.ws || '';

        if (report.thoi_gian_bat_dau && report.thoi_gian_ket_thuc) {
            const start = new Date(report.thoi_gian_bat_dau);
            const end = new Date(report.thoi_gian_ket_thuc);

            let totalMinutes = (end - start) / (1000 * 60);
            if (totalMinutes < 0) totalMinutes += 24 * 60;

            const setupMinutes = parseFloat(report.thoi_gian_canh_may) || 0;
            const stopMinutes = report.stopTime || 0;
            const actualTime = Math.max(0, totalMinutes - setupMinutes - stopMinutes);

            // Tất cả báo cáo đều tính vào thời gian chạy máy
            totalRunTime += actualTime;  // Thêm dòng này

            if (ws.includes('M')) {
                sampleTime += actualTime;
            } else {
                productionTime += actualTime;
            }
        }
    });

    return { totalRunTime, productionTime, sampleTime }; // Thêm totalRunTime
}



// Tạo biểu đồ thời gian chi tiết
function createSampleProductTimeChart(productionTime, sampleTime, setupTime, stopTime) {
    if (sampleProductTimeChart) {
        sampleProductTimeChart.destroy();
        sampleProductTimeChart = null;
    }

    const detailTimeCtx = document.getElementById('sampleProductTimeChart');
    if (!detailTimeCtx) return;

    sampleProductTimeChart = new Chart(detailTimeCtx, {
        type: 'pie',
        data: {
            labels: ['Thời gian sản xuất', 'Thời gian chạy mẫu', 'Thời gian canh máy', 'Thời gian dừng máy'],
            datasets: [{
                data: [productionTime, sampleTime, setupTime, stopTime],
                backgroundColor: [
                    'rgb(119, 191, 220)',  // Xanh da trời nhạt cho sản xuất
                    'rgb(119, 195, 141)',  // Vàng kem cho canh máy
                    'rgb(247, 208, 173)',  // Cam nhạt cho chạy mẫu
                    'rgb(241, 171, 171)'   // Hồng nhạt cho dừng máy
                ],
                borderColor: [
                    'rgb(113, 176, 201)',  // Xanh da trời nhạt cho sản xuất
                    'rgb(107, 174, 126)',  // Vàng kem cho canh máy
                    'rgb(196, 164, 135)',  // Cam nhạt cho chạy mẫu
                    'rgb(218, 156, 156)'   // Hồng nhạt cho dừng máy
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




// Biến lưu chart instance fullscreen
let fullscreenChart = null;

// Hàm mở fullscreen
function openFullscreen(canvasId, title) {
    const originalCanvas = document.getElementById(canvasId);
    const originalChart = Chart.getChart(originalCanvas);
    
    if (!originalChart) return;
    
    // Hiển thị modal
    document.getElementById('fullscreenModal').style.display = 'block';
    document.getElementById('fullscreenTitle').textContent = title;
    
    // Destroy chart cũ nếu có
    if (fullscreenChart) {
        fullscreenChart.destroy();
    }
    
    // Copy config từ chart gốc
    const config = {
        type: originalChart.config.type,
        data: JSON.parse(JSON.stringify(originalChart.data)),
        options: JSON.parse(JSON.stringify(originalChart.options))
    };
    
    // Điều chỉnh cho fullscreen
    config.options.responsive = true;
    config.options.maintainAspectRatio = false;
    
    // Tạo chart mới
    const fullscreenCanvas = document.getElementById('fullscreenCanvas');
    fullscreenChart = new Chart(fullscreenCanvas, config);
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
document.getElementById('fullscreenModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeFullscreen();
    }
});

// Đóng khi nhấn ESC
document.addEventListener('keydown', function(e) {
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

    if (window.machineStackedChart && typeof window.machineStackedChart.destroy === 'function') {
        window.machineStackedChart.destroy();
    }
    window.machineStackedChart = null;

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
            <div class="row g-2 d-flex align-items-center">
                <div class="col-md-1">
                    <div class="dropdown">
                        <button
                            class="btn btn-outline-primary btn-sm dropdown-toggle w-100"
                            type="button" id="filterSoMau"
                            data-bs-toggle="dropdown">
                            Số màu
                        </button>
                        <div class="dropdown-menu p-2"
                            style="min-width: 250px;">
                            <div class="mb-2">
                                <input type="text"
                                    class="form-control form-control-sm"
                                    id="searchSoMau"
                                    placeholder="Tìm kiếm...">
                            </div>
                            <div class="mb-2">
                                <button
                                    class="btn btn-sm btn-outline-secondary me-1"
                                    onclick="selectAllFilter('soMau')">Tất
                                    cả</button>
                            </div>
                            <div class="filter-options"
                                id="soMauOptions"
                                style="max-height: 200px; overflow-y: auto;">
                                <!-- Sẽ được tạo động -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-1">
                    <div class="dropdown">
                        <button
                            class="btn btn-outline-primary btn-sm dropdown-toggle w-100"
                            type="button" id="filterMaSp"
                            data-bs-toggle="dropdown">
                            Mã SP
                        </button>
                        <div class="dropdown-menu p-2"
                            style="min-width: 250px;">
                            <div class="mb-2">
                                <input type="text"
                                    class="form-control form-control-sm"
                                    id="searchMaSp"
                                    placeholder="Tìm kiếm...">
                            </div>
                            <div class="mb-2">
                                <button
                                    class="btn btn-sm btn-outline-secondary me-1"
                                    onclick="selectAllFilter('maSp')">Tất
                                    cả</button>
                            </div>
                            <div class="filter-options"
                                id="maSpOptions"
                                style="max-height: 200px; overflow-y: auto;">
                                <!-- Sẽ được tạo động -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-1">
                    <div class="dropdown">
                        <button
                            class="btn btn-outline-primary btn-sm dropdown-toggle w-100"
                            type="button" id="filterKhachHang"
                            data-bs-toggle="dropdown">
                            Khách hàng
                        </button>
                        <div class="dropdown-menu p-2"
                            style="min-width: 250px;">
                            <div class="mb-2">
                                <input type="text"
                                    class="form-control form-control-sm"
                                    id="searchKhachHang"
                                    placeholder="Tìm kiếm...">
                            </div>
                            <div class="mb-2">
                                <button
                                    class="btn btn-sm btn-outline-secondary me-1"
                                    onclick="selectAllFilter('khachHang')">Tất
                                    cả</button>
                            </div>
                            <div class="filter-options"
                                id="khachHangOptions"
                                style="max-height: 200px; overflow-y: auto;">
                                <!-- Sẽ được tạo động -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-1">
                    <div class="dropdown">
                        <button
                            class="btn btn-outline-primary btn-sm dropdown-toggle w-100"
                            type="button" id="filterMay"
                            data-bs-toggle="dropdown">
                            Máy
                        </button>
                        <div class="dropdown-menu p-2"
                            style="min-width: 200px;">
                            <div class="mb-2">
                                <button
                                    class="btn btn-sm btn-outline-secondary me-1"
                                    onclick="selectAllFilter('may')">Tất
                                    cả</button>
                            </div>
                            <div class="filter-options"
                                id="mayOptions"
                                style="max-height: 200px; overflow-y: auto;">
                                <!-- Sẽ được tạo động -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-1">
                    <div class="dropdown">
                        <button
                            class="btn btn-outline-primary btn-sm dropdown-toggle w-100"
                            type="button" id="filterMaCa"
                            data-bs-toggle="dropdown">
                            Mã ca
                        </button>
                        <div class="dropdown-menu p-2"
                            style="min-width: 150px;">
                            <div class="mb-2">
                                <button
                                    class="btn btn-sm btn-outline-secondary me-1"
                                    onclick="selectAllFilter('maCa')">Tất
                                    cả</button>
                            </div>
                            <div class="filter-options"
                                id="maCaOptions"
                                style="max-height: 200px; overflow-y: auto;">
                                <!-- Sẽ được tạo động -->
                            </div>
                        </div>
                    </div>
                </div>
<div class="col-md-1">
    <div class="dropdown">
        <button class="btn btn-outline-success btn-sm dropdown-toggle w-100" type="button" id="filterTocDo" data-bs-toggle="dropdown">
            Tốc độ
        </button>
        <div class="dropdown-menu p-3" style="min-width: 220px;" onclick="event.stopPropagation()">
            <div class="mb-2">
                <select class="form-select form-select-sm" id="speedFilterType">
                    <option value="range">Khoảng</option>
                    <option value="greater">Lớn hơn</option>
                    <option value="less">Nhỏ hơn</option>
                    <option value="greaterEqual">Lớn hơn bằng</option>
                    <option value="lessEqual">Nhỏ hơn bằng</option>
                    <option value="equal">Bằng</option>
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
<div class="col-md-1">
    <div class="dropdown">
        <button class="btn btn-outline-warning btn-sm dropdown-toggle w-100" type="button" id="filterDonHang" data-bs-toggle="dropdown">
            SL đơn hàng
        </button>
        <div class="dropdown-menu p-3" style="min-width: 220px;" onclick="event.stopPropagation()">
            <div class="mb-2">
                <select class="form-select form-select-sm" id="orderFilterType">
                    <option value="range">Khoảng</option>
                    <option value="greater">Lớn hơn</option>
                    <option value="less">Nhỏ hơn</option>
                    <option value="greaterEqual">Lớn hơn bằng</option>
                    <option value="lessEqual">Nhỏ hơn bằng</option>
                    <option value="equal">Bằng</option>
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
                <div class="col-md-1">
                    <button class="btn btn-secondary btn-sm w-100"
                        onclick="resetDetailFilters()">
                        <i class="fas fa-undo"></i>
                    </button>
                </div>
            </div>
        </div>
</div>

<div class="col-2 text-end">
<button class="btn btn-outline-warning btn-sm" id="switchToIncompleteBtn" onclick="switchToIncompleteTable()">
            <i class="fas fa-exclamation-triangle me-1"></i>Xem WS chưa hoàn thành
        </button>
</div>
        </div>
        `;


        const switchButtonHtml = `
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h6><i class="fas fa-table me-2"></i>Bảng chi tiết báo cáo</h6>
        <button class="btn btn-outline-warning btn-sm" id="switchToIncompleteBtn" onclick="switchToIncompleteTable()">
            <i class="fas fa-exclamation-triangle me-1"></i>Xem WS chưa hoàn thành
        </button>
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
                        <th>Số màu</th>    
                        <th>Thành phẩm in</th>
                        <th>Phế liệu</th>
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
            let totalMinutes = (end - start) / (1000 * 60);
            if (totalMinutes < 0) totalMinutes += 24 * 60;

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
                <td>${record.sl_don_hang || 0}</td>
                <td>${record.so_con || 0}</td>
                <td>${record.so_mau || 0}</td>
                <td class="text-center text-success"><strong>${paper}</strong></td>
                <td class="text-center text-danger"><strong>${waste}</strong></td>
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

    html += `
                </tbody>
            </table>
        </div>

        <div class="row my-3">
            <div class="col-md-6">
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
            <div class="col-md-6">
                <div class="text-end">
                    <small class="text-muted">
                        Hiển thị ${startIndex + 1} - ${Math.min(endIndex, totalItems)} trong tổng số ${totalItems} mục
                    </small>
                </div>
            </div>
        </div>
    `;

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
            const stopMinutes = 0;
            const runMinutes = Math.max(0, totalMinutes - setupMinutes - stopMinutes);
            return sum + runMinutes;
        }
        return sum;
    }, 0);

    const uniqueWS = new Set(data.map(record => record.ws).filter(ws => ws && ws !== '-')).size;
    const totalStopTime = currentChartData && currentChartData.stopReasons ?
        currentChartData.stopReasons.reduce((sum, reason) => sum + (reason.duration || 0), 0) : 0;

    // Phân trang
    if (totalPages > 1) {
        html += `
        <div class="row mt-3">
            <div class="col-12">
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
        </div>
        `;
    }

    html += `
        <div class="row mt-3">
            <div class="col-md-2">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h6>Tổng WS</h6>
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
            <div class="col-md-2">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h6>Tổng TG chạy máy</h6>
                        <h4 class="text-success">${formatDuration(totalRunTime)}</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card bg-light">
                    <div class="card-body text-center">
                        <h6>Tổng TG canh máy</h6>
                        <h4 class="text-warning">${formatDuration(totalSetupTime)}</h4>
                    </div>
                </div>
            </div>
            <div class="col-md-2">
                <div class="card bg-light">
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
    if (page < 1 || page > Math.ceil(totalItems / itemsPerPage)) return;

    currentPage = page;
    const container = document.getElementById('detailTableContainer');
    const filters = collectFilters();

    if (container && filteredTableData.length > 0) {
        // THÊM ĐIỀU KIỆN KIỂM TRA CHẾ ĐỘ HIỆN TẠI:
        if (currentTableMode === 'incomplete') {
            changeIncompleteTablePage(page);
        } else {
            renderDetailTableWithoutFilters(container, filteredTableData, filters);
        }
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
                        formatter: function (value, context) {
                            return formatNumber(value);
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
                            maxRotation: 0,
                            minRotation: 0,
                            callback: function (value, index, values) {
                                const label = this.getLabelForValue(value);
                                const maxLength = 12; // Độ dài tối đa mỗi dòng

                                // Wrap text nếu quá dài
                                if (label.length > maxLength) {
                                    const words = label.split(' ');
                                    const lines = [];
                                    let currentLine = '';

                                    words.forEach(word => {
                                        if ((currentLine + ' ' + word).length > maxLength && currentLine !== '') {
                                            lines.push(currentLine);
                                            currentLine = word;
                                        } else {
                                            currentLine += (currentLine ? ' ' : '') + word;
                                        }
                                    });
                                    if (currentLine) lines.push(currentLine);

                                    return lines;
                                }
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

    const labels = data.topProducts.map(item => item.product);
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
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
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
                        formatter: function (value, context) {
                            return formatNumber(value); // Hiển thị số lượng trên đầu cột
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
                            maxRotation: 0,
                            minRotation: 0,
                            callback: function (value, index, values) {
                                const label = this.getLabelForValue(value);
                                const maxLength = 10; // Mã sản phẩm ngắn hơn
                                if (label.length > maxLength) {
                                    // Chia theo ký tự cho mã sản phẩm
                                    const result = [];
                                    for (let i = 0; i < label.length; i += maxLength) {
                                        result.push(label.substring(i, i + maxLength));
                                    }
                                    return result;
                                }
                                return label;
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
                        anchor: function(context) {
                            return context.datasetIndex === 1 ? 'end' : 'center';
                        },
                        align: function(context) {
                            return context.datasetIndex === 1 ? 'top' : 'center';
                        },
                        color: function(context) {
                            return context.datasetIndex === 1 ? '#8b2635' : 'black';
                        },
                        font: {
                            size: 10,
                            weight: 'bold'
                        },
                        formatter: function(value, context) {
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
    const timeHours = runTimeMinutes / 60;

    if (timeHours === 0 || paper === 0) return '0';

    const speed = Math.round(paper / timeHours);
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
       value="${value}" id="${key}_${value}" data-filter="${key}">
                <label class="form-check-label" for="${key}_${value}">
                    ${value}
                </label>
            </div>
        `).join('');
        }
    });

    // Gắn sự kiện tìm kiếm
    ['soMau', 'maSp', 'khachHang'].forEach(filterType => {
        const searchInput = document.getElementById(`search${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`);
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                filterSearchOptions(filterType, this.value);
            });
        }
    });


    // Gắn sự kiện cho checkbox - tự động apply filter
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
        // Xóa event listener cũ nếu có
        checkbox.removeEventListener('change', handleCheckboxChange);

        // Gắn event listener mới
        checkbox.addEventListener('change', handleCheckboxChange);
    });


    // Gắn sự kiện cho filter type
    ['speedFilterType', 'orderFilterType'].forEach(selectId => {
        const element = document.getElementById(selectId);
        if (element) {
            element.addEventListener('change', function () {
                const filterName = selectId.replace('FilterType', '');
                toggleFilterInputs(filterName, this.value);
            });
        }
    });

    // Khởi tạo input ban đầu
    setTimeout(() => {
        toggleFilterInputs('speed', 'range');
        toggleFilterInputs('order', 'range');
    }, 50);


    // Format input số
    ['speedMin', 'speedMax', 'orderMin', 'orderMax'].forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            formatNumberInput(input);
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


    // Thêm event listener cho dropdown để apply filter khi đóng
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('hidden.bs.dropdown', function () {
            // Chỉ apply filter cho dropdown tốc độ và đơn hàng
            if (this.querySelector('#filterTocDo') || this.querySelector('#filterDonHang')) {
                autoApplyFilters();
            }
        });
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

    // Áp dụng filter - hàm applyFiltersToData sẽ tự lấy checkbox từ UI
    filteredTableData = applyFiltersToData(originalTableData, currentDetailFilters);

    console.log('🔍 Filtered data length:', filteredTableData.length);

    // Reset về trang đầu
    currentPage = 1;


    // Render lại bảng với dữ liệu đã lọc (điều kiện lọc 2)
    const container = document.getElementById('detailTableContainer');
    if (container) {
        const filters = collectFilters();

        // Sử dụng renderDetailTableWithoutFilters để tránh tạo lại filter UI
        renderDetailTableWithoutFilters(container, filteredTableData, filters);
    }


    // Lưu trạng thái filter hiện tại trước khi render
    const currentFilterState = {};
    ['soMau', 'maSp', 'khachHang', 'may', 'maCa'].forEach(filterType => {
        const container = document.getElementById(`${filterType}Options`);
        if (container) {
            const checkboxes = container.querySelectorAll('.filter-checkbox');
            currentFilterState[filterType] = {};
            checkboxes.forEach(checkbox => {
                currentFilterState[filterType][checkbox.value] = checkbox.checked;
            });
        }
    });


    // Khôi phục trạng thái filter sau khi render
    setTimeout(() => {
        restoreSpecificFilterState(currentFilterState);
    }, 150);
}



// Cập nhật text button cho numeric filters
function updateNumericFilterButtons() {
    // Cập nhật button tốc độ
    const speedType = document.getElementById('speedFilterType')?.value;
    const speedMin = document.getElementById('speedMin')?.value;
    const speedMax = document.getElementById('speedMax')?.value;
    const speedButton = document.getElementById('filterTocDo');

    if (speedButton) {
        if (speedMin || speedMax) {
            speedButton.textContent = 'Tốc độ (*)';
            speedButton.className = 'btn btn-success btn-sm dropdown-toggle w-100';
        } else {
            speedButton.textContent = 'Tốc độ';
            speedButton.className = 'btn btn-outline-success btn-sm dropdown-toggle w-100';
        }
    }

    // Cập nhật button đơn hàng
    const orderType = document.getElementById('orderFilterType')?.value;
    const orderMin = document.getElementById('orderMin')?.value;
    const orderMax = document.getElementById('orderMax')?.value;
    const orderButton = document.getElementById('filterDonHang');

    if (orderButton) {
        if (orderMin || orderMax) {
            orderButton.textContent = 'SL đơn hàng (*)';
            orderButton.className = 'btn btn-warning btn-sm dropdown-toggle w-100';
        } else {
            orderButton.textContent = 'SL đơn hàng';
            orderButton.className = 'btn btn-outline-warning btn-sm dropdown-toggle w-100';
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
    const checkboxes = container.querySelectorAll('.filter-checkbox');

    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });

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

        if (button) {
            const filterNames = {
                soMau: 'Số màu',
                maSp: 'Mã SP',
                khachHang: 'Khách hàng',
                may: 'Máy',
                maCa: 'Mã ca'
            };

            if (checkedBoxes.length === allBoxes.length) {
                // Chọn tất cả - TRẠNG THÁI BÌNH THƯỜNG
                button.textContent = filterNames[filterType];
                button.className = 'btn btn-outline-primary btn-sm dropdown-toggle w-100';
            } else if (checkedBoxes.length > 0) {
                // Chọn một phần - ĐANG LỌC
                button.textContent = `${filterNames[filterType]} (${checkedBoxes.length}/${allBoxes.length})`;
                button.className = 'btn btn-primary btn-sm dropdown-toggle w-100';
            } else {
                // Không có gì được chọn - VẪN HIỂN THỊ BÌNH THƯỜNG
                button.textContent = filterNames[filterType];
                button.className = 'btn btn-outline-primary btn-sm dropdown-toggle w-100';
            }
        }
    });
}



// Toggle filter inputs dựa trên type
function toggleFilterInputs(filterName, type) {
    const inputsContainer = document.getElementById(`${filterName}Inputs`);
    const inputGroup = inputsContainer.querySelector('.input-group');

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
    }

    // Gắn event cho input mới
    const inputs = inputGroup.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            formatNumberInput(this);
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

                // Nếu chọn tất cả -> không filter
                if (checkedBoxes.length === allBoxes.length) {
                    continue;
                }

                // Nếu không chọn gì -> LOẠI BỎ TẤT CẢ (bảng trống)
                if (checkedBoxes.length === 0) {
                    return false;
                }

                // Nếu chọn một phần -> kiểm tra giá trị
                const checkedValues = Array.from(checkedBoxes).map(cb => cb.value);
                const itemValue = item[fieldMap[filterType]];
                if (!itemValue || !checkedValues.includes(itemValue.toString())) {
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

    let totalMinutes = (end - start) / (1000 * 60);
    if (totalMinutes < 0) totalMinutes += 24 * 60;

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
    document.getElementById('speedFilterType').value = 'range';
    document.getElementById('speedMin').value = '';
    document.getElementById('speedMax').value = '';
    document.getElementById('orderFilterType').value = 'range';
    document.getElementById('orderMin').value = '';
    document.getElementById('orderMax').value = '';

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
    const container = document.getElementById('detailTableContainer');
    const filters = collectFilters();
    renderDetailTable(container, originalTableData, filters);
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
    console.log('🔍 Checkbox changed:', this.value, 'checked:', this.checked);
    updateFilterButtons();

    // Gọi autoApplyFilters với delay nhỏ để đảm bảo UI đã cập nhật
    setTimeout(() => {
        autoApplyFilters();
    }, 10);
}




// Hàm áp dụng filter tốc độ
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

    // Đóng dropdown
    const dropdown = document.querySelector('#filterTocDo').closest('.dropdown');
    const bsDropdown = bootstrap.Dropdown.getInstance(dropdown.querySelector('[data-bs-toggle="dropdown"]'));
    if (bsDropdown) bsDropdown.hide();
}

// Hàm áp dụng filter đơn hàng
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

    // Đóng dropdown
    const dropdown = document.querySelector('#filterDonHang').closest('.dropdown');
    const bsDropdown = bootstrap.Dropdown.getInstance(dropdown.querySelector('[data-bs-toggle="dropdown"]'));
    if (bsDropdown) bsDropdown.hide();
}

// Hàm xóa filter tốc độ
function clearSpeedFilter() {
    document.getElementById('speedFilterType').value = 'range';
    const speedMin = document.getElementById('speedMin');
    const speedMax = document.getElementById('speedMax');
    if (speedMin) speedMin.value = '';
    if (speedMax) speedMax.value = '';

    currentDetailFilters.speedFilter = {
        type: 'range',
        min: '',
        max: ''
    };

    updateNumericFilterButtons();
    autoApplyFilters();
}

// Hàm xóa filter đơn hàng
function clearOrderFilter() {
    document.getElementById('orderFilterType').value = 'range';
    const orderMin = document.getElementById('orderMin');
    const orderMax = document.getElementById('orderMax');
    if (orderMin) orderMin.value = '';
    if (orderMax) orderMax.value = '';

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
        const thanhPham = parseFloat(record.thanh_pham_in) || 0;
        
        const targetQuantity = slDonHang / soCon;
        return targetQuantity > thanhPham;
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
                        <th>Số màu</th>
                        <th>Thành phẩm in</th>
                        <th>Phế liệu</th>
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
                <td class="text-center text-success"><strong>${paper}</strong></td>
                <td class="text-center text-danger"><strong>${waste}</strong></td>
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
        const thanhPham = parseFloat(record.thanh_pham_in) || 0;
        
        const targetQuantity = slDonHang / soCon;
        return targetQuantity > thanhPham;
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
        // Sắp xếp dữ liệu theo trưởng máy
        shiftLeaderData.sort((a, b) => {
            if (a.truongMay !== b.truongMay) return a.truongMay.localeCompare(b.truongMay);
            if (a.maCa !== b.maCa) return a.maCa.localeCompare(b.maCa);
            return a.may.localeCompare(b.may);
        });

        html += `
        <button class="btn btn-outline-info btn-sm mb-2" onclick="switchBackToShiftAnalysis()">
                    <i class="fas fa-chart-pie me-1"></i>Quay lại bảng mã ca
                </button>
    <div class="table-responsive" style="max-height: 700px; overflow-y: auto; overflow-x: auto;">
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

// Render từng nhóm trưởng máy
Object.values(leaderGroups).forEach(group => {
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
                    <span class="badge" style="background-color: rgb(128, 186, 151); color: white;">
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
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h4><i class="fas fa-chart-line me-2"></i>Sản xuất theo ca - Trưởng máy</h4>
        <div>
            
            <select class="form-select d-inline-block" id="leaderSelect" style="width: 200px;">
                <option value="">Tất cả trưởng máy</option>
            </select>
        </div>
    </div>
    <div style="height: 400px; position: relative;">
        <canvas id="leaderShiftStackedChart"></canvas>
    </div>

        <hr>
        <div class="text-start mb-3">
            <h4><i class="fas fa-chart-bar me-2"></i>So sánh sản xuất theo trưởng máy</h4>
        </div>
        <div style="height: 400px; position: relative;">
            <canvas id="machineLeaderStackedChart"></canvas>
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
        leaderSelect.addEventListener('change', function() {
            updateLeaderShiftChart(shiftLeaderData, this.value);
        });
        
        // Hiển thị biểu đồ ban đầu (tất cả trưởng máy)
        updateLeaderShiftChart(shiftLeaderData, '');
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
                        callback: function(value, index, values) {
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
                        label: function(context) {
                            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                        },
                        footer: function(tooltipItems) {
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
                    anchor: function(context) {
                        // Dataset 1 (phế liệu) - hiển thị ở end (trên)
                        // Dataset 0 (thành phẩm) - hiển thị ở center (giữa)
                        return context.datasetIndex === 1 ? 'end' : 'center';
                    },
                    align: function(context) {
                        // Dataset 1 (phế liệu) - align top
                        // Dataset 0 (thành phẩm) - align center
                        return context.datasetIndex === 1 ? 'top' : 'center';
                    },
                    color: function(context) {
                        // Dataset 1 (phế liệu) - màu đậm để nổi bật khi ở ngoài
                        // Dataset 0 (thành phẩm) - màu trắng
                        return context.datasetIndex === 1 ? '#8b2635' : 'black';
                    },
                    font: {
                        size: 10,
                        weight: 'bold'
                    },
                    formatter: function(value, context) {
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
                <h6>Không có dữ liệu cho trưởng máy này</h6>
            </div>
        `;
        return;
    }
    
    // Group dữ liệu theo ca và máy
    const shiftMachineGroups = {};
    filteredData.forEach(item => {
        const key = `${item.maCa}_${item.may}`;
        if (!shiftMachineGroups[key]) {
            shiftMachineGroups[key] = {
                label: `Ca ${item.maCa} - Máy ${item.may}`,
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
        if (a.maCa !== b.maCa) return a.maCa.localeCompare(b.maCa);
        return a.may.localeCompare(b.may);
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
                        // text: 'Ca - Máy',
                        font: {
                            weight: 'bold'
                        }
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
                        label: function(context) {
                            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
                        },
                        footer: function(tooltipItems) {
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
                    anchor: function(context) {
                        return context.datasetIndex === 1 ? 'end' : 'center';
                    },
                    align: function(context) {
                        return context.datasetIndex === 1 ? 'top' : 'center';
                    },
                    color: function(context) {
                        return context.datasetIndex === 1 ? '#8b2635' : 'black';
                    },
                    font: {
                        size: 10,
                        weight: 'bold'
                    },
                    formatter: function(value, context) {
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
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return percent + '%';
                    }
                }
            }
        }
    });
}