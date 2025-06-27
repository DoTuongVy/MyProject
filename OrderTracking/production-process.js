//! =================================================================
//! QUY TRÌNH SẢN XUẤT CỐ ĐỊNH - PRODUCTION PROCESS
//! =================================================================

//! =================================================================
//! DANH SÁCH CÁC CÔNG ĐOẠN SẢN XUẤT
//! =================================================================

// Danh sách các công đoạn theo thứ tự sản xuất
const PRODUCTION_STAGES = [
    {
        id: 'scn',
        name: 'SCN',
        displayName: 'SCN',
        color: '#28a745',
        quantityFields: ['nhap_kho_1', 'nhap_kho_2', 'nhap_kho_3'],
        quantityLabels: ['NK1', 'NK2', 'NK3'],
        quantityUnit: 'Kg',
        apiEndpoint: '/api/bao-cao-scl/list', // Tạm thời, chưa có
        enabled: false, // Chưa implement
        isMultipleQuantity: true
    },
    {
        id: 'scl',
        name: 'SCL',
        displayName: 'SCL',
        color: '#28a745',
        quantityFields: ['nhap_kho_1', 'nhap_kho_2', 'nhap_kho_3'], // Tổng nhập kho 1,2,3
        quantityLabels: ['NK1', 'NK2', 'NK3'],
        quantityUnit: 'Kg',
        apiEndpoint: '/api/bao-cao-scl/list',
        enabled: true,
        isMultipleQuantity: true
    },
    {
        id: 'gmc',
        name: 'GMC',
        displayName: 'GMC',
        color: '#28a745',
        quantityFields: ['so_tam_cat_duoc'], // Tổng số tấm cắt được
        quantityLabels: ['Tấm'],
        quantityUnit: 'Tấm',
        apiEndpoint: '/api/bao-cao-gmc/list',
        enabled: true,
        isMultipleQuantity: false
    },
    {
        id: 'xen_giay_tam',
        name: 'XEN_GIAY_TAM',
        displayName: 'Xén giấy tấm',
        color: '#17a2b8',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Tấm',
        apiEndpoint: '/api/xen-giay-tam/list',
        enabled: false,
        isMultipleQuantity: false
    },
    {
        id: 'in',
        name: 'IN',
        displayName: 'In Offset',
        color: '#28a745',
        quantityFields: ['tong_so_luong'], //Tổng số lượng
        quantityLabels: ['SL'],
        quantityUnit: 'Tấm',
        apiEndpoint: '/api/bao-cao-in/list',
        enabled: true,
        isMultipleQuantity: false
    },

    {
        id: 'don_song',
        name: 'DON_SONG',
        displayName: 'Dợn sóng',
        color: '#6f42c1',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Tấm',
        apiEndpoint: '/api/don-song/list',
        enabled: false,
        isMultipleQuantity: false
    },
    {
        id: 'opp',
        name: 'OPP',
        displayName: 'OPP',
        color: '#e83e8c',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Tấm',
        apiEndpoint: '/api/opp/list',
        enabled: false,
        isMultipleQuantity: false
    },
    {
        id: 'can_lang',
        name: 'CAN_LANG',
        displayName: 'Cán láng',
        color: '#20c997',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Tấm',
        apiEndpoint: '/api/can-lang/list',
        enabled: false,
        isMultipleQuantity: false
    },
    {
        id: 'boi',
        name: 'BOI',
        displayName: 'Bồi',
        color: '#6c757d',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Chiếc',
        apiEndpoint: '/api/boi/list',
        enabled: false,
        isMultipleQuantity: false
    },
    {
        id: 'be',
        name: 'BE',
        displayName: 'Bế',
        color: '#dc3545',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Chiếc',
        apiEndpoint: '/api/be/list',
        enabled: false,
        isMultipleQuantity: false
    },
    {
        id: 'go',
        name: 'GO',
        displayName: 'Gỡ',
        color: '#007bff',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Chiếc',
        apiEndpoint: '/api/go/list',
        enabled: false,
        isMultipleQuantity: false
    },
    {
        id: 'dan_acetad',
        name: 'DAN_ACETAD',
        displayName: 'Dán Acetad',
        color: '#28a745',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Chiếc',
        apiEndpoint: '/api/dan-acetad/list',
        enabled: false,
        isMultipleQuantity: false
    },
    {
        id: 'dan_luoi_ga_day',
        name: 'DAN_LUOI_GA_DAY',
        displayName: 'Dán lưỡi gà+đáy',
        color: '#17a2b8',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Chiếc',
        apiEndpoint: '/api/dan-luoi-ga-day/list',
        enabled: false,
        isMultipleQuantity: false
    },
    {
        id: 'thu_cong',
        name: 'THU_CONG',
        displayName: 'Thủ công',
        color: '#ffc107',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Chiếc',
        apiEndpoint: '/api/thu-cong/list',
        enabled: false,
        isMultipleQuantity: false
    },
    {
        id: 'kiem_pham',
        name: 'KIEM_PHAM',
        displayName: 'Kiểm phẩm',
        color: '#fd7e14',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Chiếc',
        apiEndpoint: '/api/kiem-pham/list',
        enabled: false,
        isMultipleQuantity: false
    },
    {
        id: 'may_kiem',
        name: 'MAY_KIEM',
        displayName: 'Máy kiểm',
        color: '#6f42c1',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Chiếc',
        apiEndpoint: '/api/may-kiem/list',
        enabled: false,
        isMultipleQuantity: false
    },
    {
        id: 'xen_thanh_pham',
        name: 'XEN_THANH_PHAM',
        displayName: 'Xén Thành phẩm',
        color: '#e83e8c',
        quantityFields: ['so_luong'],
        quantityLabels: ['SL'],
        quantityUnit: 'Chiếc',
        apiEndpoint: '/api/xen-thanh-pham/list',
        enabled: false,
        isMultipleQuantity: false
    }
];

//! =================================================================
//! TRẠNG THÁI CÔNG ĐOẠN
//! =================================================================

// Trạng thái công đoạn
const STAGE_STATUS = {
    NOT_STARTED: 'not_started',    // Chưa bắt đầu
    IN_PROGRESS: 'in_progress',    // Đang sản xuất  
    COMPLETED: 'completed'         // Đã hoàn thành
};

//! =================================================================
//! CÁC HÀM CHÍNH - STAGE MANAGEMENT
//! =================================================================

//TODO Lấy danh sách công đoạn đã kích hoạt=====================================================
function getEnabledStages() {
    return PRODUCTION_STAGES.filter(stage => stage.enabled);
}

//TODO Lấy công đoạn theo ID=====================================================
function getStageById(stageId) {
    return PRODUCTION_STAGES.find(stage => stage.id === stageId);
}

//TODO Lấy tất cả công đoạn=====================================================
function getAllStages() {
    return PRODUCTION_STAGES;
}

//TODO Kiểm tra công đoạn có được kích hoạt không=====================================================
function isStageEnabled(stageId) {
    const stage = getStageById(stageId);
    return stage ? stage.enabled : false;
}

//! =================================================================
//! CÁC HÀM TÍNH TOÁN - QUANTITY & STATUS
//! =================================================================

//TODO Tính tổng số lượng theo các trường=====================================================
function calculateTotalQuantity(records, quantityFields) {
    if (!records || records.length === 0) return 0;
    
    return records.reduce((total, record) => {
        const recordTotal = quantityFields.reduce((sum, field) => {
            const value = parseFloat(record[field]) || 0;
            return sum + value;
        }, 0);
        return total + recordTotal;
    }, 0);
}

//TODO Tính số lượng theo từng field riêng biệt=====================================================
function calculateQuantitiesByFields(records, quantityFields, quantityLabels) {
    if (!records || records.length === 0) {
        return quantityFields.map((field, index) => ({
            field: field,
            label: quantityLabels[index] || field,
            value: 0
        }));
    }
    
    return quantityFields.map((field, index) => {
        const fieldTotal = records.reduce((sum, record) => {
            return sum + (parseFloat(record[field]) || 0);
        }, 0);
        
        return {
            field: field,
            label: quantityLabels[index] || field,
            value: fieldTotal
        };
    });
}

//! =================================================================
//! CÁC HÀM TRẠNG THÁI - STATUS DETERMINATION
//! =================================================================

//TODO Xác định trạng thái công đoạn=====================================================
function determineStageStatus(records) {
    if (!records || records.length === 0) {
        return STAGE_STATUS.NOT_STARTED;
    }
    
    // Kiểm tra xem có phiếu nào chỉ có thời gian bắt đầu không có kết thúc
    const hasIncompleteRecord = records.some(record => 
        record.thoi_gian_bat_dau && !record.thoi_gian_ket_thuc
    );
    
    if (hasIncompleteRecord) {
        return STAGE_STATUS.IN_PROGRESS;
    }
    
    // Tất cả phiếu đều có thời gian bắt đầu và kết thúc
    const allCompleted = records.every(record => 
        record.thoi_gian_bat_dau && record.thoi_gian_ket_thuc
    );
    
    return allCompleted ? STAGE_STATUS.COMPLETED : STAGE_STATUS.IN_PROGRESS;
}

//TODO Lấy text trạng thái hiển thị=====================================================
function getStatusText(status) {
    switch (status) {
        case STAGE_STATUS.COMPLETED:
            return 'Đã sản xuất';
        case STAGE_STATUS.IN_PROGRESS:
            return 'Đang sản xuất';
        case STAGE_STATUS.NOT_STARTED:
            return 'Chưa bắt đầu';
        default:
            return 'Không xác định';
    }
}

//TODO Lấy CSS class cho trạng thái=====================================================
function getStatusClass(status) {
    switch (status) {
        case STAGE_STATUS.COMPLETED:
            return 'status-completed';
        case STAGE_STATUS.IN_PROGRESS:
            return 'status-in-progress';
        case STAGE_STATUS.NOT_STARTED:
            return 'status-not-started';
        default:
            return '';
    }
}

//! =================================================================
//! CÁC HÀM THỜI GIAN - TIME FUNCTIONS
//! =================================================================

//TODO Lấy thời gian bắt đầu sớm nhất=====================================================
function getEarliestStartTime(records) {
    if (!records || records.length === 0) return null;
    
    const startTimes = records
        .filter(record => record.thoi_gian_bat_dau)
        .map(record => new Date(record.thoi_gian_bat_dau))
        .sort((a, b) => a - b);
    
    return startTimes.length > 0 ? startTimes[0] : null;
}

//TODO Lấy thời gian kết thúc muộn nhất=====================================================
function getLatestEndTime(records) {
    if (!records || records.length === 0) return null;
    
    const endTimes = records
        .filter(record => record.thoi_gian_ket_thuc)
        .map(record => new Date(record.thoi_gian_ket_thuc))
        .sort((a, b) => b - a);
    
    return endTimes.length > 0 ? endTimes[0] : null;
}

//TODO Tính tổng thời gian sản xuất (phút)=====================================================
function calculateTotalProductionTime(records) {
    if (!records || records.length === 0) return 0;
    
    return records.reduce((total, record) => {
        if (record.thoi_gian_bat_dau && record.thoi_gian_ket_thuc) {
            const start = new Date(record.thoi_gian_bat_dau);
            const end = new Date(record.thoi_gian_ket_thuc);
            const duration = (end - start) / (1000 * 60); // Convert to minutes
            return total + duration;
        }
        return total;
    }, 0);
}

//! =================================================================
//! CÁC HÀM FORMAT & DISPLAY - FORMATTING FUNCTIONS
//! =================================================================

//TODO Format thời gian hiển thị=====================================================
function formatDisplayTime(dateTime) {
    if (!dateTime) return '';
    
    const date = new Date(dateTime);
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

//TODO Format ngày hiển thị=====================================================
function formatDisplayDate(dateTime) {
    if (!dateTime) return '';
    
    const date = new Date(dateTime);
    return date.toLocaleDateString('vi-VN');
}

//TODO Format ngày giờ đầy đủ=====================================================
function formatDisplayDateTime(dateTime) {
    if (!dateTime) return '';
    
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

//TODO Format số lượng với định dạng VN=====================================================
function formatQuantity(quantity) {
    if (quantity === 0 || quantity === null || quantity === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(quantity);
}

//TODO Format thời gian sản xuất (phút -> giờ:phút)=====================================================
function formatProductionTime(minutes) {
    if (!minutes || minutes <= 0) return '0 phút';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    
    if (hours > 0) {
        return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}p` : ''}`;
    } else {
        return `${remainingMinutes} phút`;
    }
}

//! =================================================================
//! CÁC HÀM TÌM KIẾM & LỌC - SEARCH & FILTER
//! =================================================================

//TODO Lọc records theo WS=====================================================
function filterRecordsByWS(records, wsNumber) {
    if (!records || !wsNumber) return [];
    
    return records.filter(record => {
        const recordWS = record.so_ws || record.ws || record.work_sheet || record.worksheet;
        if (!recordWS) return false;
        
        return recordWS.toString().toLowerCase().includes(wsNumber.toString().toLowerCase());
    });
}

//TODO Lọc records theo máy=====================================================
function filterRecordsByMachine(records, machineId) {
    if (!records || !machineId) return records;
    
    return records.filter(record => {
        const recordMachine = record.may || record.machine;
        return recordMachine && recordMachine.toString() === machineId.toString();
    });
}

//TODO Lọc records theo ngày=====================================================
function filterRecordsByDate(records, targetDate) {
    if (!records || !targetDate) return records;
    
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    return records.filter(record => {
        const recordDate = new Date(record.ngay || record.thoi_gian_bat_dau);
        recordDate.setHours(0, 0, 0, 0);
        
        return recordDate.getTime() === target.getTime();
    });
}

//! =================================================================
//! CÁC HÀM TIỆN ÍCH - UTILITY FUNCTIONS
//! =================================================================

//TODO Kiểm tra giá trị an toàn=====================================================
function safeValue(value, defaultValue = '') {
    return value || defaultValue;
}

//TODO Kiểm tra số hợp lệ=====================================================
function safeNumber(value, defaultValue = 0) {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
}

//TODO Lấy danh sách máy duy nhất từ records=====================================================
function getUniqueMachines(records) {
    if (!records) return [];
    
    return [...new Set(records
        .map(record => record.may || record.machine)
        .filter(Boolean)
    )];
}

//TODO Lấy danh sách WS duy nhất từ records=====================================================
function getUniqueWorksheets(records) {
    if (!records) return [];
    
    return [...new Set(records
        .map(record => record.so_ws || record.ws || record.work_sheet || record.worksheet)
        .filter(Boolean)
    )];
}

//! =================================================================
//! EXPORT FUNCTIONS
//! =================================================================

// Export để sử dụng trong Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Constants
        PRODUCTION_STAGES,
        STAGE_STATUS,
        
        // Stage functions
        getEnabledStages,
        getStageById,
        getAllStages,
        isStageEnabled,
        
        // Calculation functions
        calculateTotalQuantity,
        calculateQuantitiesByFields,
        
        // Status functions
        determineStageStatus,
        getStatusText,
        getStatusClass,
        
        // Time functions
        getEarliestStartTime,
        getLatestEndTime,
        calculateTotalProductionTime,
        
        // Format functions
        formatDisplayTime,
        formatDisplayDate,
        formatDisplayDateTime,
        formatQuantity,
        formatProductionTime,
        
        // Search & Filter functions
        filterRecordsByWS,
        filterRecordsByMachine,
        filterRecordsByDate,
        
        // Utility functions
        safeValue,
        safeNumber,
        getUniqueMachines,
        getUniqueWorksheets
    };
}

// Export để sử dụng trong browser
if (typeof window !== 'undefined') {
    window.ProductionProcess = {
        // Constants
        PRODUCTION_STAGES,
        STAGE_STATUS,
        
        // Stage functions
        getEnabledStages,
        getStageById,
        getAllStages,
        isStageEnabled,
        
        // Calculation functions
        calculateTotalQuantity,
        calculateQuantitiesByFields,
        
        // Status functions
        determineStageStatus,
        getStatusText,
        getStatusClass,
        
        // Time functions
        getEarliestStartTime,
        getLatestEndTime,
        calculateTotalProductionTime,
        
        // Format functions
        formatDisplayTime,
        formatDisplayDate,
        formatDisplayDateTime,
        formatQuantity,
        formatProductionTime,
        
        // Search & Filter functions
        filterRecordsByWS,
        filterRecordsByMachine,
        filterRecordsByDate,
        
        // Utility functions
        safeValue,
        safeNumber,
        getUniqueMachines,
        getUniqueWorksheets
    };
}