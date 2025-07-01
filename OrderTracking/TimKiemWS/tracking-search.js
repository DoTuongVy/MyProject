//! =================================================================
//! TÌM KIẾM WS VÀ HIỂN THỊ ORDER TRACKING
//! =================================================================

//! =================================================================
//! BIẾN TOÀN CỤC
//! =================================================================

let currentWS = null;
let stageData = {};
let isSearching = false;
let currentDetailStage = null;
let allDetailData = [];
let suggestionsDropdown, suggestionsList;
let suggestionTimeout = null;
let currentSuggestions = [];

// DOM Elements
let searchInput, searchBtn, loadingSpinner, errorMessage, errorText;
let orderInfo, orderNumber, orderDetails, totalStages, stageContainer, noResults;
let detailContainer, detailTitle, detailTableHead, detailTableBody, machineFilter;

//! =================================================================
//! KHỞI TẠO VÀ THIẾT LẬP SỰ KIỆN
//! =================================================================

//TODO Khởi tạo các DOM elements=====================================================
function initializeElements() {
    // Search elements
    searchInput = document.getElementById('wsSearchInput');
    searchBtn = document.getElementById('searchBtn');
    // Suggestion elements
suggestionsDropdown = document.getElementById('suggestionsDropdown');
suggestionsList = document.getElementById('suggestionsList');
    
    // Display elements
    loadingSpinner = document.getElementById('loadingSpinner');
    errorMessage = document.getElementById('errorMessage');
    errorText = document.getElementById('errorText');
    orderInfo = document.getElementById('orderInfo');
    orderNumber = document.getElementById('orderNumber');
    orderDetails = document.getElementById('orderDetails');
    totalStages = document.getElementById('totalStages');
    stageContainer = document.getElementById('stageContainer');
    noResults = document.getElementById('noResults');
    
    // Detail elements
    detailContainer = document.getElementById('detailContainer');
    detailTitle = document.getElementById('detailTitle');
    detailTableHead = document.getElementById('detailTableHead');
    detailTableBody = document.getElementById('detailTableBody');
    machineFilter = document.getElementById('machineFilter');
}

//TODO Thiết lập các sự kiện=====================================================
function setupTrackingEvents() {
    if (!searchInput || !searchBtn) {
        console.error('Không tìm thấy search elements');
        return;
    }
    
    // Search button click
    searchBtn.addEventListener('click', handleSearch);
    
    // Enter key press
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Input change for validation and suggestions
searchInput.addEventListener('input', handleInputChange);

// Click outside to hide suggestions
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container')) {
        hideSuggestions();
    }
});

// Keyboard navigation for suggestions
searchInput.addEventListener('keydown', handleKeyNavigation);
    
    // Machine filter event
    if (machineFilter) {
        machineFilter.addEventListener('change', filterDetailTable);
    }


    // Thiết lập lại connector khi resize window
window.addEventListener('resize', function() {
    if (stageContainer && stageContainer.children.length > 0) {
        setTimeout(setupStageConnectors, 100);
    }
});


}

//TODO Validate input WS=====================================================
//TODO Handle input change for validation and suggestions
function handleInputChange() {
    if (!searchInput || !searchBtn) return;
    
    const wsValue = searchInput.value.trim();
    const isValid = wsValue.length > 0;
    
    searchBtn.disabled = !isValid;
    
    // Show suggestions if input length >= 3
    if (wsValue.length >= 4) {
        // Debounce suggestions
        clearTimeout(suggestionTimeout);
        suggestionTimeout = setTimeout(() => {
            fetchSuggestions(wsValue);
        }, 300);
    } else {
        hideSuggestions();
    }
}


//TODO Fetch WS suggestions
async function fetchSuggestions(query) {
    try {
        const enabledStages = window.ProductionProcess.getEnabledStages();
        const allSuggestions = new Set();
        
        // Search across all enabled stages
        for (const stage of enabledStages) {
            try {
                const url = `${stage.apiEndpoint}?ws=${encodeURIComponent(query)}`;
                const response = await fetch(url);
                if (response.ok) {
                    const result = await response.json();
                    const data = result.data || result;
                    
                    if (Array.isArray(data)) {
                        data.forEach(record => {
                            const ws = record.so_ws || record.ws || record.work_sheet || record.worksheet;
                            if (ws && ws.toString().toLowerCase().includes(query.toLowerCase())) {
                                allSuggestions.add(ws.toString());
                            }
                        });
                    }
                }
            } catch (error) {
                console.error(`Error fetching suggestions from ${stage.name}:`, error);
            }
        }
        
        displaySuggestions(Array.from(allSuggestions).sort());
        
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

//TODO Display suggestions dropdown
function displaySuggestions(suggestions) {
    if (!suggestionsList || !suggestionsDropdown) return;
    
    currentSuggestions = suggestions;
    suggestionsList.innerHTML = '';
    
    if (suggestions.length === 0) {
        suggestionsList.innerHTML = '<div class="no-suggestions">Không tìm thấy WS phù hợp</div>';
    } else {
        suggestions.forEach(ws => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = ws;
            item.onclick = () => selectSuggestion(ws);
            suggestionsList.appendChild(item);
        });
    }
    
    suggestionsDropdown.style.display = 'block';
}

//TODO Select a suggestion
function selectSuggestion(ws) {
    if (searchInput) {
        searchInput.value = ws;
        hideSuggestions();
        searchInput.focus();
    }
}

//TODO Hide suggestions dropdown
function hideSuggestions() {
    if (suggestionsDropdown) {
        suggestionsDropdown.style.display = 'none';
    }
    currentSuggestions = [];
}

//TODO Handle keyboard navigation
function handleKeyNavigation(e) {
    if (!suggestionsDropdown || suggestionsDropdown.style.display === 'none') return;
    
    const items = suggestionsList.querySelectorAll('.suggestion-item');
    const activeItem = suggestionsList.querySelector('.suggestion-item.active');
    let activeIndex = Array.from(items).indexOf(activeItem);
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (activeItem) activeItem.classList.remove('active');
            activeIndex = (activeIndex + 1) % items.length;
            if (items[activeIndex]) items[activeIndex].classList.add('active');
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            if (activeItem) activeItem.classList.remove('active');
            activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
            if (items[activeIndex]) items[activeIndex].classList.add('active');
            break;
            
        case 'Enter':
            if (activeItem) {
                e.preventDefault();
                selectSuggestion(activeItem.textContent);
            }
            break;
            
        case 'Escape':
            hideSuggestions();
            break;
    }
}

//! =================================================================
//! XỬ LÝ TÌM KIẾM
//! =================================================================

//TODO Xử lý sự kiện tìm kiếm=====================================================
function handleSearch() {
    if (isSearching) return;
    
    const wsValue = searchInput.value.trim();
    if (!wsValue) {
        showTrackingError('Vui lòng nhập số WS');
        return;
    }
    
    currentWS = wsValue;
    searchOrderData();
}

//TODO Tìm kiếm dữ liệu đơn hàng=====================================================
async function searchOrderData() {
    isSearching = true;
    showTrackingLoading();
    hideAllTrackingSections();
    
    try {
        // Lấy danh sách các công đoạn đã kích hoạt từ ProductionProcess
        const enabledStages = window.ProductionProcess.getEnabledStages();
        const stageResults = [];
        
        // Tìm kiếm từng công đoạn
        for (const stage of enabledStages) {
            try {
                const data = await searchStageData(stage, currentWS);
                if (data && data.length > 0) {
                    stageResults.push({
                        stage: stage,
                        data: data
                    });
                }
            } catch (error) {
                console.error(`Lỗi khi tìm kiếm công đoạn ${stage.name}:`, error);
            }
        }
        
        hideTrackingLoading();
        
        // SỬA: Thay đổi điều kiện hiển thị "Không tìm thấy"
        if (stageResults.length === 0) {
            showTrackingNoResults();
        } else {
            await displayTrackingResults(stageResults);
        }
        
    } catch (error) {
        console.error('Lỗi tìm kiếm:', error);
        hideTrackingLoading();
        showTrackingError('Có lỗi xảy ra khi tìm kiếm dữ liệu');
    } finally {
        isSearching = false;
    }
}

//TODO Tìm kiếm dữ liệu theo công đoạn=====================================================
async function searchStageData(stage, wsNumber) {
    try {
        // Tạo URL API với tham số tìm kiếm WS
        const url = stage.id === 'in' ? 
    `${stage.apiEndpoint}?ws=${encodeURIComponent(wsNumber)}&exclude_stop_only=true` :
    `${stage.apiEndpoint}?ws=${encodeURIComponent(wsNumber)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const data = result.data || result;
        
        // Lọc dữ liệu theo WS number sử dụng ProductionProcess
        if (Array.isArray(data)) {
            return window.ProductionProcess.filterRecordsByWS(data, wsNumber);
        }
        
        return [];
        
    } catch (error) {
        console.error(`Lỗi API ${stage.name}:`, error);
        return [];
    }
}

//! =================================================================
//! HIỂN THỊ KẾT QUẢ
//! =================================================================

//TODO Hiển thị kết quả tìm kiếm=====================================================
async function displayTrackingResults(stageResults) {
    stageData = {};
    
    // Cập nhật thông tin đơn hàng
    if (orderNumber && orderDetails && totalStages) {
        orderNumber.textContent = `SỐ WS: ${currentWS}`;
        totalStages.textContent = stageResults.length;
        orderDetails.innerHTML = `Tìm thấy <strong>${stageResults.length}</strong> công đoạn`;
    }
    
    // Hiển thị các stage cards
    await renderStageCards(stageResults);
    
    // Hiển thị thông tin đơn hàng
    if (orderInfo) {
        orderInfo.style.display = 'block';
    }

    // Khởi tạo Bootstrap popover
    setTimeout(() => {
        // Dispose các popover cũ trước
        const existingPopovers = document.querySelectorAll('[data-bs-toggle="popover"]');
        existingPopovers.forEach(el => {
            const popover = bootstrap.Popover.getInstance(el);
            if (popover) popover.dispose();
        });

        // Tạo popover mới
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
        popoverTriggerList.forEach(popoverTriggerEl => {
            new bootstrap.Popover(popoverTriggerEl, {
                html: true,
                sanitize: false,
                container: 'body'
            });
        });
    }, 200);
}

//TODO Render các stage cards=====================================================
async function renderStageCards(stageResults) {
    if (!stageContainer) return;
    
    stageContainer.innerHTML = '';
    
    for (const result of stageResults) {
        const stage = result.stage;
        const data = result.data;
        
        // Tính toán thông tin cho stage sử dụng ProductionProcess
        const stageInfo = await calculateStageInfo(stage, data);
        stageData[stage.id] = { ...stageInfo, data: data, stage: stage };
        
        // Tạo stage card
        const stageCard = createStageCard(stage, stageInfo);
        stageContainer.appendChild(stageCard);
    };
    
    // Sau khi render xong, thiết lập connector
    setupStageConnectors();
}



//TODO Thiết lập connector giữa các stage=====================================================
function setupStageConnectors() {
    const cards = stageContainer.querySelectorAll('.stage-card');
    if (cards.length <= 1) return;
    
    // Xóa tất cả class connector cũ
    cards.forEach(card => {
        card.classList.remove('has-right-connector', 'has-down-connector');
    });
    
    // Tính toán vị trí và thiết lập connector
    for (let i = 0; i < cards.length - 1; i++) {
        const currentCard = cards[i];
        const nextCard = cards[i + 1];
        
        const currentRect = currentCard.getBoundingClientRect();
        const nextRect = nextCard.getBoundingClientRect();
        
        // Kiểm tra xem card tiếp theo có cùng hàng không
        const isSameRow = Math.abs(currentRect.top - nextRect.top) < 50;
        
        if (isSameRow && window.innerWidth > 768) {
            // Cùng hàng: thêm connector ngang
            currentCard.classList.add('has-right-connector');
        } else {
            // Khác hàng: thêm connector dọc
            currentCard.classList.add('has-down-connector');
        }
    }
}



//TODO Tính toán thông tin stage=====================================================
async function calculateStageInfo(stage, data) {
    const PP = window.ProductionProcess;
    
    // Khởi tạo totalQuantity trước
    let totalQuantity = PP.calculateTotalQuantity(data, stage.quantityFields);
    
    // Tính số lượng theo từng field riêng biệt
    let quantities, tooltipData = null;
    if (stage.id === 'in') {
        // Xử lý đặc biệt cho In - chia theo số pass
        const result = calculateInQuantitiesByPass(data);
        quantities = result.quantities;
        tooltipData = result.tooltipData;
        // Cập nhật totalQuantity theo pass cuối cùng cho stage In
        totalQuantity = quantities[0] ? quantities[0].value : 0;
    } else {
        quantities = PP.calculateQuantitiesByFields(data, stage.quantityFields, stage.quantityLabels);
    }
    
    // THÊM: Lấy danh sách xưởng từ dữ liệu
    const location = await getLocationInfo(data);
    
    return {
        quantities: quantities,
        totalQuantity: totalQuantity,
        status: PP.determineStageStatus(data),
        startTime: PP.getEarliestStartTime(data),
        endTime: PP.getLatestEndTime(data),
        recordCount: data.length,
        productionTime: PP.calculateTotalProductionTime(data),
        location: location,
        tooltipData: tooltipData
    };
}



//TODO Tính số lượng cho In theo số pass (chỉ tùy chọn 1,2,3)=====================================================
function calculateInQuantitiesByPass(data) {
    if (!data || data.length === 0) {
        return { 
            quantities: [{ field: 'tong_so_luong', label: 'SL', value: 0 }],
            tooltipData: { machines: [], hasPass1: false, hasPass2: false }
        };
    }
    
    // Chỉ lấy dữ liệu có tùy chọn 1, 2, 3 để tính tổng SL
    const allowedOptions = ['1. In', '2. In + Cán bóng', '3. Cán bóng'];
    const filteredData = data.filter(record => 
        allowedOptions.includes(record.tuy_chon)
    );
    
    // Tạo tooltip data - nhóm theo máy và pass
    const tooltipData = { machines: [], hasPass1: false, hasPass2: false };
    const machinePassData = {};
    
    filteredData.forEach(record => {
        const machine = record.may || 'Không xác định';
        const pass = record.so_pass_in || 'Không xác định';
        const quantity = parseFloat(record.thanh_pham) || 0;
        
        if (!machinePassData[machine]) {
            machinePassData[machine] = {};
        }
        if (!machinePassData[machine][pass]) {
            machinePassData[machine][pass] = 0;
        }
        machinePassData[machine][pass] += quantity;
        
        if (pass === 'IN 1 PASS') tooltipData.hasPass1 = true;
        if (pass === 'IN 2 PASS') tooltipData.hasPass2 = true;
    });
    
    // Tạo dữ liệu tooltip
    Object.keys(machinePassData).forEach(machine => {
        const machineData = { machine, passes: [] };
        Object.keys(machinePassData[machine]).forEach(pass => {
            machineData.passes.push({
                pass,
                quantity: machinePassData[machine][pass]
            });
        });
        tooltipData.machines.push(machineData);
    });
    
    // Tính tổng theo pass để hiển thị
    const pass1Total = filteredData
        .filter(record => record.so_pass_in === 'IN 1 PASS')
        .reduce((sum, record) => sum + (parseFloat(record.thanh_pham) || 0), 0);
    
    const pass2Total = filteredData
        .filter(record => record.so_pass_in === 'IN 2 PASS')
        .reduce((sum, record) => sum + (parseFloat(record.thanh_pham) || 0), 0);
    
    // Xác định pass cuối cùng và tổng SL hiển thị
    let displayQuantity = 0;
    let quantities = [];
    
    if (tooltipData.hasPass1 && tooltipData.hasPass2) {
        // Có cả 2 pass, hiển thị tổng pass 2 (pass cuối)
        displayQuantity = pass2Total;
        quantities = [{ field: 'final_pass', label: 'SL', value: pass2Total }];
    } else if (tooltipData.hasPass1) {
        // Chỉ có pass 1
        displayQuantity = pass1Total;
        quantities = [{ field: 'final_pass', label: 'SL', value: pass1Total }];
    } else if (tooltipData.hasPass2) {
        // Chỉ có pass 2
        displayQuantity = pass2Total;
        quantities = [{ field: 'final_pass', label: 'SL', value: pass2Total }];
    }
    
    console.log('🔍 IN Tooltip Data:', tooltipData);
console.log('🔍 IN Quantities:', quantities);
return { quantities, tooltipData };
}


//TODO Thêm hàm getLocationInfo()======================================================
async function getLocationInfo(data) {
    if (!data || data.length === 0) return [];
    
    // Lấy danh sách máy từ dữ liệu
    const machines = [...new Set(data
        .map(record => record.may || record.machine)
        .filter(Boolean)
    )];
    
    const locations = [];
    
    // Lấy thông tin vị trí từ database cho từng máy
    for (const machineName of machines) {
        try {
            const response = await fetch(`/api/machines/list?name=${encodeURIComponent(machineName)}`);
            if (response.ok) {
                const machinesData = await response.json();
                const machineInfo = machinesData.find(m => m.name === machineName);
                if (machineInfo && machineInfo.location) {
                    locations.push(machineInfo.location);
                }
            }
        } catch (error) {
            console.error(`Lỗi khi lấy thông tin máy ${machineName}:`, error);
        }
    }
    
    // Trả về danh sách vị trí không trùng lặp
    return [...new Set(locations)].filter(Boolean);
}

//TODO Tạo stage card=====================================================
function createStageCard(stage, stageInfo, showConnector) {
    const card = document.createElement('div');
    const PP = window.ProductionProcess; // Di chuyển lên đầu hàm
    
    card.className = 'stage-card';
    // Thêm class nếu đang sản xuất
    if (stageInfo.status === PP.STAGE_STATUS.IN_PROGRESS) {
        card.classList.add('in-progress');
    }
    
    const statusText = PP.getStatusText(stageInfo.status);
    const statusClass = PP.getStatusClass(stageInfo.status);
    
    // Tạo HTML cho phần số lượng
let quantityHtml = '';
    if (stage.id === 'in') {
        // Xử lý đặc biệt cho In - hiển thị SL pass cuối + popover
        const popoverHtml = createTooltipHtml(stageInfo.tooltipData);
        quantityHtml = `
        <div class="quantity-section">
            <div class="quantity-label" style="display: flex; align-items: center; justify-content: space-between;">
                <span>SL (${stage.quantityUnit}): <span class="quantity-value">${PP.formatQuantity(stageInfo.quantities[0].value)}</span></span>


                <button type="button" class="btn btn-sm p-1" style="border: none; background: none; color: #6c757d;"
                        data-bs-toggle="popover" data-bs-placement="bottom" data-bs-trigger="hover"
                        data-bs-html="true" data-bs-content="${popoverHtml.replace(/"/g, '&quot;')}"
                        >
                    <i class="fas fa-eye" style="font-size: 14px;"></i>
                </button>
            </div>
            <div class="single-quantity">
                
            </div>
        </div>
    `;
    } else if (stage.isMultipleQuantity) {
    // Hiển thị nhiều số lượng (như SCL: NK1, NK2, NK3)
    quantityHtml = `
        <div class="quantity-section">
            <div class="quantity-label">SL (${stage.quantityUnit}):</div>
            <div class="quantity-row">
                ${stageInfo.quantities.map(q => `
                    <div class="quantity-item">
                        <div class="quantity-item-label">${q.label}</div>
                        <div class="quantity-value">${PP.formatQuantity(q.value)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
} else {
    // Hiển thị một số lượng (như GMC: tổng số tấm)
    quantityHtml = `
        <div class="quantity-section" style= "display: flex; align-items: center; justify-content: space-between;">
            <span class="quantity-label">SL (${stage.quantityUnit}): <span class= "quantity-value">${PP.formatQuantity(stageInfo.totalQuantity)}</span></span>
            
                <div class=" text-center"></div>
            
        </div>
    `;
}
    
    // SỬA: Thêm logic hiển thị thời gian kết thúc dựa trên trạng thái
    let endTimeHtml = '';
    if (stageInfo.status === PP.STAGE_STATUS.IN_PROGRESS) {
        // Nếu đang sản xuất thì không hiển thị thời gian kết thúc
        endTimeHtml = `
            <div class="time-info">
                <span class="time-label">Thời gian kết thúc:</span>
                <span class="time-value" style="color:rgb(219, 164, 0); font-style: italic; font-weight: bold;">Đang sản xuất...</span>
            </div>
        `;
    } else {
        // Nếu đã hoàn thành hoặc chưa bắt đầu thì hiển thị thời gian kết thúc
        endTimeHtml = `
            <div class="time-info">
                <span class="time-label">Thời gian kết thúc:</span>
                <span class="time-value" style=" color: red;">${PP.formatDisplayTime(stageInfo.endTime)}</span>
            </div>
        `;
    }
    
    // THÊM: Tạo HTML hiển thị xưởng
    let workshopHtml = '';
    if (stageInfo.location && stageInfo.location.length > 0) {
        workshopHtml = `
    <div class="workshop-info">
        <span class="workshop-label">Vị trí:</span>
        <span class="workshop-value">${stageInfo.location.join(', ')}</span>
    </div>
`;
    }
    
    card.innerHTML = `
    <div class="stage-header" style="background-color: ${stage.color}">
        ${stage.displayName}
    </div>
    
    <div class="stage-status ${statusClass}">
    ${stageInfo.status === PP.STAGE_STATUS.IN_PROGRESS ? 
        `<i class="fas fa-spinner fa-spin me-1"></i>${statusText}` : 
        statusText}
</div>
    
    ${workshopHtml}
    
    ${quantityHtml}
    
    
    
    <div class="text-center mt-auto">
    <div class="time-info">
        <span class="time-label">Thời gian bắt đầu:</span>
        <span class="time-value" style=" color: green;">${PP.formatDisplayTime(stageInfo.startTime)}</span>
    </div>
    ${endTimeHtml}
        <button class="btn detail-btn" onclick="showStageDetail('${stage.id}')">
            Xem chi tiết (${stageInfo.recordCount} phiếu)
        </button>
    </div>
    
    ${showConnector ? '<div class="stage-connector"></div>' : ''}
`;
    
    return card;
}


//TODO Tạo HTML cho popover hiển thị chi tiết máy và pass
function createTooltipHtml(tooltipData) {
    if (!tooltipData || !tooltipData.machines || tooltipData.machines.length === 0) {
        return 'Không có dữ liệu';
    }

    let html = '<div class=\\\"popover-table\\\">';
    html += '<table style=\\\"width: 100%; border-collapse: collapse;\\\">';

    // Header row - cột đầu trống, các cột tiếp theo là pass
    html += '<tr>';
    html += '<td style=\\\"padding: 8px 12px; font-weight: bold;\\\"></td>'; // Cột trống
    if (tooltipData.hasPass1) html += '<td style=\\\"padding: 8px 12px; font-weight: bold; text-align: center;\\\">IN 1 PASS</td>';
    if (tooltipData.hasPass2) html += '<td style=\\\"padding: 8px 12px; font-weight: bold; text-align: center;\\\">IN 2 PASS</td>';
    html += '</tr>';

    // Data rows - mỗi hàng là một máy
    tooltipData.machines.forEach(machineData => {
        html += '<tr>';
        html += `<td style=\\\"padding: 8px 12px; font-weight: bold;\\\">${machineData.machine}</td>`;

        if (tooltipData.hasPass1) {
            const pass1Data = machineData.passes.find(p => p.pass === 'IN 1 PASS');
            const quantity1 = pass1Data ? pass1Data.quantity.toLocaleString() : '0';
            html += `<td style=\\\"padding: 8px 12px; text-align: center;\\\">${quantity1}</td>`;
        }                                                                
                                                                         
        if (tooltipData.hasPass2) {                                      
            const pass2Data = machineData.passes.find(p => p.pass === 'IN 2 PASS');
            const quantity2 = pass2Data ? pass2Data.quantity.toLocaleString() : '0';
            html += `<td style=\\\"padding: 8px 12px; text-align: center;\\\">${quantity2}</td>`;
        }

        html += '</tr>';
    });

    html += '</table></div>';
    return html;
}



//! =================================================================
//! HIỂN THỊ CHI TIẾT
//! =================================================================

//TODO Hiển thị chi tiết stage=====================================================
function showStageDetail(stageId) {
    // THÊM: Kiểm tra nếu đang hiển thị stage này thì đóng lại
    if (currentDetailStage === stageId && detailContainer.classList.contains('show')) {
        closeDetail();
        return;
    }
    
    
    const stageInfo = stageData[stageId];
    
    if (!stageInfo) {
        showTrackingError('Không tìm thấy thông tin chi tiết');
        return;
    }
    
    currentDetailStage = stageId;
    allDetailData = stageInfo.data;
    
    populateDetailTable(stageInfo.stage, stageInfo.data);
    
    // Hiển thị modal với animation
    detailContainer.style.display = 'block';
    setTimeout(() => {
        detailContainer.classList.add('show');
    }, 10);
}

//TODO Tạo bảng chi tiết=====================================================
function populateDetailTable(stage, data) {
    if (detailTitle) {
        detailTitle.textContent = `CHI TIẾT CÔNG ĐOẠN ${stage.displayName}`;
    }
    
    // Tạo headers theo từng công đoạn
    const headers = getTableHeaders(stage.id);
    
    // Tạo table header
    if (detailTableHead) {
        detailTableHead.innerHTML = `
            <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
        `;
    }
    
    // Populate machine filter
    populateMachineFilter(data);
    
    // Render table body
    renderDetailTableBody(stage, data);
}

//TODO Lấy headers cho bảng theo công đoạn=====================================================
function getTableHeaders(stageId) {
    switch (stageId) {
        case 'scl':
            return [
                'MÁY', 'SỐ PHIẾU','TLN', 'KHỔ 1', 'KHỔ 2', 'KHỔ 3', 
                'NHẬP KHO 1', 'NHẬP KHO 2', 'NHẬP KHO 3', 'PHẾ LIỆU ĐẦU CUỘN', 'PHẾ LIỆU SẢN XUẤT', 'TG BẮT ĐẦU', 'TG KẾT THÚC'
            ];
        case 'gmc':
            return [
                'MÁY', 'SỐ PHIẾU', 'KHÁCH HÀNG', 'MÃ GIẤY', 'ĐỊNH LƯỢNG','KHỔ CẮT', 'TLN','SỐ TẤM CẮT ĐƯỢC', 'KHỔ (MM)', 'DÀI (MM)', 'ĐẦU CUỘN', 'RÁCH MÓP', 'PHẾ LIỆU SẢN XUẤT',
                'TG BẮT ĐẦU', 'TG KẾT THÚC'
            ];
            case 'in':
    return [
        'MÁY', 'MÃ CA', 'QUẢN ĐỐC', 'TRƯỞNG MÁY', 'KHÁCH HÀNG', 
        'MÃ SẢN PHẨM', 'SL ĐƠN HÀNG', 'SỐ CON', 'SỐ MÀU', 'MÃ GIẤY 1', 
        'KHỔ', 'DÀI GIẤY', 'TÙY CHỌN', 'PHỦ KEO', 'THÀNH PHẨM IN', 
        'PHẾ LIỆU', 'PHẾ LIỆU TRẮNG', 'SỐ PASS IN', 'TG BẮT ĐẦU', 'TG KẾT THÚC'
    ];
        default:
            return [
                'MÁY', 'SỐ PHIẾU', 'WS', 'SỐ LƯỢNG', 'TG BẮT ĐẦU', 'TG KẾT THÚC'
            ];
    }
}

//TODO Populate machine filter=====================================================
function populateMachineFilter(data) {
    if (!machineFilter) return;
    
    const PP = window.ProductionProcess;
    const machines = PP.getUniqueMachines(data);
    
    machineFilter.innerHTML = '<option value="">LỌC THEO MÁY</option>';
    machines.forEach(machine => {
        const option = document.createElement('option');
        option.value = machine;
        option.textContent = machine;
        machineFilter.appendChild(option);
    });
}

//TODO Render detail table body=====================================================
function renderDetailTableBody(stage, data) {
    if (!detailTableBody) return;
    
    const PP = window.ProductionProcess;
    detailTableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        
        // Tạo HTML cho từng dòng dữ liệu theo công đoạn
        row.innerHTML = getTableRowHTML(stage.id, item, PP);
        detailTableBody.appendChild(row);
    });
}

//TODO Lấy HTML cho dòng dữ liệu theo công đoạn=====================================================
function getTableRowHTML(stageId, item, PP) {
    // THÊM: Hàm kiểm tra và format thời gian kết thúc
    const formatEndTime = (endTime) => {
        if (!endTime) {
            return '<span style="color: rgb(219, 164, 0); font-style: italic;">Đang sản xuất...</span>';
        }
        return PP.formatDisplayTime(endTime);
    };

    switch (stageId) {
        case 'scl':
            return `
                <td>${PP.safeValue(item.may)}</td>
                <td>${PP.safeValue(item.so_phieu)}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.trong_luong_nhan))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.kho_1))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.kho_2))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.kho_3))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.nhap_kho_1))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.nhap_kho_2))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.nhap_kho_3))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.phe_lieu_dau_cuon))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.phe_lieu_san_xuat))}</td>
                <td style="color: green; font-weight: bold;">${PP.formatDisplayTime(item.thoi_gian_bat_dau)}</td>
                <td style="color: red; font-weight: bold;">${formatEndTime(item.thoi_gian_ket_thuc)}</td>
            `;
        case 'gmc':
            return `
                <td>${PP.safeValue(item.may)}</td>
                <td>${PP.safeValue(item.so_phieu_cat_giay)}</td>
                <td>${PP.safeValue(item.khach_hang)}</td>
                <td>${PP.safeValue(item.ma_giay)}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.dinh_luong))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.kho_cat))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.trong_luong_nhan))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.so_tam_cat_duoc))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.kho_mm))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.dai_mm))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.dau_cuon_kg))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.rach_mop_kg))}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.phe_lieu_san_xuat_kg))}</td>
                <td style="color: green; font-weight: bold;">${PP.formatDisplayTime(item.thoi_gian_bat_dau)}</td>
                <td style="color: red; font-weight: bold;">${formatEndTime(item.thoi_gian_ket_thuc)}</td>
            `;
            case 'in':
    return `
        <td>${PP.safeValue(item.may)}</td>
        <td>${PP.safeValue(item.ma_ca)}</td>
        <td>${PP.safeValue(item.quan_doc)}</td>
        <td>${PP.safeValue(item.truong_may)}</td>
        <td>${PP.safeValue(item.khach_hang)}</td>
        <td>${PP.safeValue(item.ma_sp)}</td>
        <td>${PP.formatQuantity(PP.safeNumber(item.sl_don_hang))}</td>
        <td>${PP.safeValue(item.so_con)}</td>
        <td>${PP.safeValue(item.so_mau)}</td>
        <td>${PP.safeValue(item.ma_giay_1)}</td>
        <td>${PP.safeValue(item.kho)}</td>
        <td>${PP.safeValue(item.dai_giay)}</td>
        <td>${PP.safeValue(item.tuy_chon)}</td>
        <td>${PP.safeValue(item.phu_keo)}</td>
        <td>${PP.formatQuantity(PP.safeNumber(item.thanh_pham_in))}</td>
        <td>${PP.formatQuantity(PP.safeNumber(item.phe_lieu))}</td>
        <td>${PP.formatQuantity(PP.safeNumber(item.phe_lieu_trang))}</td>
        <td>${PP.safeValue(item.so_pass_in)}</td>
        <td style="color: green; font-weight: bold;">${PP.formatDisplayTime(item.thoi_gian_bat_dau)}</td>
        <td style="color: red; font-weight: bold;">${formatEndTime(item.thoi_gian_ket_thuc)}</td>
    `;
        default:
            return `
                <td>${PP.safeValue(item.may)}</td>
                <td>${PP.safeValue(item.so_phieu)}</td>
                <td>${PP.safeValue(item.so_ws)}</td>
                <td>${PP.formatQuantity(PP.safeNumber(item.so_luong))}</td>
                <td style="color: green; font-weight: bold;">${PP.formatDisplayTime(item.thoi_gian_bat_dau)}</td>
                <td style="color: red; font-weight: bold;">${formatEndTime(item.thoi_gian_ket_thuc)}</td>
            `;
    }
}

//TODO Lọc bảng chi tiết theo máy=====================================================
function filterDetailTable() {
    if (!currentDetailStage || !allDetailData) return;
    
    const selectedMachine = machineFilter.value;
    const stage = stageData[currentDetailStage].stage;
    const PP = window.ProductionProcess;
    
    let filteredData = allDetailData;
    if (selectedMachine) {
        filteredData = PP.filterRecordsByMachine(allDetailData, selectedMachine);
    }
    
    renderDetailTableBody(stage, filteredData);
}

//TODO Đóng modal chi tiết=====================================================
function closeDetail() {
    detailContainer.classList.remove('show');
    setTimeout(() => {
        detailContainer.style.display = 'none';
    }, 300);
}

//! =================================================================
//! CÁC HÀM HIỂN THỊ & UI
//! =================================================================

//TODO Hiển thị loading=====================================================
function showTrackingLoading() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'block';
    }
}

//TODO Ẩn loading=====================================================
function hideTrackingLoading() {
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

//TODO Hiển thị lỗi=====================================================
function showTrackingError(message) {
    if (errorText && errorMessage) {
        errorText.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(function() {
            errorMessage.style.display = 'none';
        }, 5000);
    }
}

//TODO Hiển thị không có kết quả=====================================================
function showTrackingNoResults() {
    if (noResults) {
        noResults.style.display = 'block';
    }
}

//TODO Ẩn tất cả sections=====================================================
function hideAllTrackingSections() {
    hideSuggestions();
    if (errorMessage) errorMessage.style.display = 'none';
    if (orderInfo) orderInfo.style.display = 'none';
    if (stageContainer) stageContainer.innerHTML = '';
    if (noResults) noResults.style.display = 'none';
    if (detailContainer) {
        detailContainer.classList.remove('show');
        detailContainer.style.display = 'none';
    }
}

//! =================================================================
//! KHỞI TẠO TRANG
//! =================================================================

//TODO Khởi tạo khi DOM ready=====================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Khởi tạo Order Tracking Search...');
    
    // Kiểm tra ProductionProcess có sẵn không
    if (typeof window.ProductionProcess === 'undefined') {
        console.error('ProductionProcess không được tải');
        showTrackingError('Lỗi: Không thể tải module ProductionProcess');
        return;
    }
    
    // Khởi tạo elements và events
    initializeElements();
    setupTrackingEvents();
    
    console.log('Order Tracking Search đã sẵn sàng');
});

//! =================================================================
//! EXPORT GLOBAL FUNCTIONS
//! =================================================================

// Export để sử dụng trong HTML
window.showStageDetail = showStageDetail;
window.closeDetail = closeDetail;