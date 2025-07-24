// ====================================================================================================================================
// FILE: in.js
// MÔ TẢ: JavaScript cho báo cáo In Offset - Tương tự GMC nhưng với các trường dữ liệu khác
// PHIÊN BẢN: 1.0
// NGÀY TẠO: 2025
// ====================================================================================================================================

console.log('🚀 Bắt đầu khởi tạo hệ thống báo cáo In Offset...');

// ====================================================================================================================================
// BIẾN TOÀN CỤC VÀ CẤU HÌNH
// ====================================================================================================================================

// Biến toàn cục để quản lý trạng thái
let isStarted = false;
let startTime = null;
let currentReportId = null;
let machineStopReports = [];

let previousStartProgress = 0; // Theo dõi tiến độ trước đó
let hasValidStartTime = false; // Đánh dấu có thời gian bắt đầu hợp lệ

// Biến toàn cục để quản lý danh sách báo cáo
let reportList = {
    data: [],
    filteredData: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1
};

// Biến toàn cục để quản lý danh sách báo cáo dừng máy
let stopReportList = {
    data: [],
    filteredData: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1
};

// ====================================================================================================================================
// KHỞI TẠO HỆ THỐNG
// ====================================================================================================================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM đã tải hoàn tất, bắt đầu khởi tạo báo cáo In...');

    initializeInSystem();
    setTimeout(() => {
    checkWaitingReports();
}, 1000);
    setupInEvents();
    loadUserOptions();
    restoreFormState();

    console.log('✅ Khởi tạo hệ thống báo cáo In hoàn tất');
});

// Hàm khởi tạo hệ thống chính
function initializeInSystem() {
    // Thiết lập máy từ URL
    setupMachineFromURL();

    // Thiết lập thời gian
    setupTimeDisplay();

    // Thiết lập form validation
    setupFormValidation();



    // Khôi phục trạng thái form
    restoreFormState();

    // Khôi phục dữ liệu form theo máy
    restoreFormDataByMachine();

    // Khởi tạo tiến độ form
    setTimeout(() => {
        updateInProgress();
    }, 500);


}




// Kiểm tra báo cáo chờ khi khởi tạo
async function checkWaitingReports() {
    const machineId = getCurrentMachineId();
    if (!machineId) return;
    
    try {
        const response = await fetch(`/api/bao-cao-in/cho/${machineId}`);
        if (response.ok) {
            const waitingReport = await response.json();
            if (waitingReport) {
                showWaitingReportModal(waitingReport);
            } else {
                loadWaitingListCard();
            }
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra báo cáo chờ:', error);
    }
}

// Hiển thị modal báo cáo chờ
function showWaitingReportModal(waitingReport) {
    document.getElementById('waitingMachineName').textContent = waitingReport.may;
    document.getElementById('waitingWS').textContent = waitingReport.ws || 'Không có';
    document.getElementById('waitingTuyChon').textContent = waitingReport.tuy_chon || '';
    document.getElementById('waitingQuanDoc').textContent = waitingReport.quan_doc || '';
    document.getElementById('waitingStartTime').textContent = formatDateTime(waitingReport.thoi_gian_bat_dau);
    document.getElementById('waitingCa').textContent = waitingReport.ca || '';
    
    // Lưu dữ liệu để sử dụng sau
    window.currentWaitingReport = waitingReport;
    
    const modal = new bootstrap.Modal(document.getElementById('waitingListModal'));
    modal.show();
}

// Tiếp tục báo cáo chờ
function continueWaitingReport() {
    const waitingReport = window.currentWaitingReport;
    if (!waitingReport) return;
    
    // Điền dữ liệu vào form
    restoreWaitingReportToForm(waitingReport);
    
    // Đóng modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('waitingListModal'));
    modal.hide();
}

// Bỏ qua báo cáo chờ
function skipWaitingReport() {
    // Đóng modal và hiển thị card danh sách chờ
    const modal = bootstrap.Modal.getInstance(document.getElementById('waitingListModal'));
    modal.hide();
    
    loadWaitingListCard();
}



// ====================================================================================================================================
// THIẾT LẬP EVENTS
// ====================================================================================================================================

function setupInEvents() {
    // Event cho nút bắt đầu
    const startButton = document.querySelector('.btn-success');
    if (startButton) {
        startButton.addEventListener('click', handleStartReport);
    }

    // Event cho nút xác nhận
    const confirmButton = document.getElementById('confirmButton');
    if (confirmButton) {
        confirmButton.addEventListener('click', handleConfirmReport);
    }


    // Event cho nút OK cuối cùng trong modal
const finalConfirmButton = document.getElementById('finalConfirmButton');
if (finalConfirmButton) {
    finalConfirmButton.addEventListener('click', handleFinalConfirm);
}


    // Event cho nút reset
    const resetButton = document.getElementById('btnResetForm');
    if (resetButton) {
        resetButton.addEventListener('click', handleResetForm);
    }

    // Event cho WS input
    const wsInput = document.getElementById('ws');
    if (wsInput) {
        wsInput.addEventListener('blur', handleWSChange);
        wsInput.addEventListener('input', debounce(handleWSChange, 500));
    }

    // Event cho các select
    setupSelectEvents();

    // Event cho tabs
    setupTabEvents();

    // Event cho tìm kiếm và lọc
    setupSearchAndFilterEvents();



    // Auto-save dữ liệu form khi người dùng thay đổi
    const autoSaveFields = [
        'quandoc', 'gioLamViec', 'phumay1', 'phumay2', 'ws', 'tuychon',
        'sokem', 'mau3tone', 'matsau', 'phukeo', 'phunbot', 'pass', 'canhmay',
        'thanhphamin', 'phelieu', 'phelieutrang', 'slgiayream',
        'slgiaynhan1', 'slgiaynhan2', 'slgiaynhan3', 'ghiChu',
        // Thêm các trường WS để lưu khi có dữ liệu
        'khachhang', 'masp', 'sldonhang', 'socon', 'somau',
        'magiay', 'magiay1', 'magiay2', 'magiay3', 'kho', 'chat', 'soluongdain'
    ];

    autoSaveFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' :
                element.tagName === 'SELECT' ? 'change' : 'input';

            element.addEventListener(eventType, debounce(() => {
                if (!isStarted || currentReportId) { // Lưu khi chưa bắt đầu hoặc đã có báo cáo bắt đầu
                    saveFormDataByMachine();
                }
                // THÊM DÒNG NÀY
                updateInProgress();
            }, 1000));
        }
    });



    // Auto-calculate SL giấy nhận 1
const autoCalcFields = ['thanhphamin', 'phelieu', 'phelieutrang', 'slgiayream'];
autoCalcFields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
        element.addEventListener('input', debounce(() => {
            calculateSlGiayNhan1();
        }, 300));
    }
});



    // Thiết lập auto-update tiến độ
    const progressFields = [
        'ca', 'gioLamViec', 'quandoc', 'ws', 'tuychon', 'thanhphamin', 'phukeo'
    ];

    progressFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            const eventType = element.tagName === 'SELECT' ? 'change' : 'input';
            element.addEventListener(eventType, debounce(() => {
                updateInProgress();
            }, 300));
        }
    });

    // Thiết lập sự kiện cho nút dừng máy
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');

    if (btnYes) {
        btnYes.addEventListener('click', () => {
            setTimeout(() => updateInProgress(), 100);
        });
    }

    if (btnNo) {
        btnNo.addEventListener('click', () => {
            setTimeout(() => updateInProgress(), 100);
        });
    }



    // Thêm event cho scroll để xử lý nút mini
window.addEventListener('scroll', handleMiniStopButtonScroll);

// Thêm event cho modal
const stopMachineModal = document.getElementById('stopMachineModal');
if (stopMachineModal) {
    stopMachineModal.addEventListener('hidden.bs.modal', function() {
        // Reset modal state khi đóng
    });
}


    setupMachineStopHandling();



}



// Thiết lập events cho các select
function setupSelectEvents() {

    // Event cho giờ làm việc
    const gioLamViecSelect = document.getElementById('gioLamViec');
    if (gioLamViecSelect) {
        gioLamViecSelect.addEventListener('change', handleGioLamViecChange);
    }

    // Event cho tùy chọn
    const tuychonSelect = document.getElementById('tuychon');
    if (tuychonSelect) {
        tuychonSelect.addEventListener('change', handleTuychonChange);
    }
}

// Thiết lập events cho tabs
function setupTabEvents() {
    // Tab danh sách báo cáo
    const reportListTab = document.getElementById('nav-danhsachinoffset-tab');
    if (reportListTab) {
        reportListTab.addEventListener('click', function () {
            loadReportList();
        });
    }

// Tab dừng máy
const stopReportTab = document.getElementById('nav-dungmayinoffset-tab');
if (stopReportTab) {
    stopReportTab.addEventListener('click', function () {
        console.log('🔍 Clicked stop report tab');
        console.log('🔍 Current stopReportList:', stopReportList);
        
        // Delay nhỏ để đảm bảo tab đã active
        setTimeout(() => {
            loadMachineStopReportList();
        }, 100);
    });
}
}

// ====================================================================================================================================
// XỬ LÝ SETUP MACHINE VÀ USER
// ====================================================================================================================================

// Thiết lập máy từ URL
function setupMachineFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const machineName = urlParams.get('machineName') || getCurrentMachineId();

    if (machineName) {
        const displayElement = document.getElementById('displayMachineName');
        if (displayElement) {
            displayElement.textContent = machineName;
        }

        // Lưu vào localStorage
        localStorage.setItem('currentMachine', machineName);

        console.log('Đã thiết lập máy:', machineName);
    }
}

// Lấy thông tin người dùng hiện tại
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        return null;
    }
}

// Lấy ID máy hiện tại
function getCurrentMachineId() {
    return localStorage.getItem('currentMachine') || '';
}

// ====================================================================================================================================
// TẢI DANH SÁCH NGƯỜI DÙNG
// ====================================================================================================================================

// Tải danh sách người dùng cho các dropdown
async function loadUserOptions() {
    try {
        const moduleId = 'innm1'; // Module ID cố định cho In Offset

        // Lấy danh sách người dùng sản xuất theo chức vụ
        const [quanDocResponse, phuMay1Response, phuMay2Response] = await Promise.all([
            fetch(`/api/production-users/by-position/${moduleId}/quan-doc`),
            fetch(`/api/production-users/by-position/${moduleId}/phu-may-1`),
            fetch(`/api/production-users/by-position/${moduleId}/phu-may-2`)
        ]);

        if (!quanDocResponse.ok || !phuMay1Response.ok || !phuMay2Response.ok) {
            throw new Error('Không thể tải danh sách người dùng sản xuất');
        }

        const quanDoc = await quanDocResponse.json();
        const phuMay1 = await phuMay1Response.json();
        const phuMay2 = await phuMay2Response.json();

        // Điền vào các dropdown
        populateProductionUserSelect('quandoc', quanDoc);
        populateProductionUserSelect('phumay1', phuMay1);
        populateProductionUserSelect('phumay2', phuMay2);

        // Tự động điền trưởng máy từ user đăng nhập
        setTruongMayFromCurrentUser();

        // Thực hiện khôi phục dữ liệu sau khi load xong options
        setTimeout(() => {
            executeFormRestore();
        }, 200);

    } catch (error) {
        console.error('Lỗi khi tải danh sách người dùng sản xuất:', error);
        showNotification('Không thể tải danh sách người dùng sản xuất', 'error');
    }
}


function populateProductionUserSelect(selectId, users) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Xóa các option cũ (trừ option đầu tiên)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    // Thêm các option mới từ production users
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `[${user.user_employee_id || 'N/A'}] ${user.user_fullname || 'N/A'}`;
        select.appendChild(option);
    });
}


// Điền danh sách người dùng vào select
// function populateUserSelect(selectId, users) {
//     const select = document.getElementById(selectId);
//     if (!select) return;

//     // Xóa các option cũ (trừ option đầu tiên)
//     while (select.children.length > 1) {
//         select.removeChild(select.lastChild);
//     }

//     // Thêm các option mới
//     users.forEach(user => {
//         const option = document.createElement('option');
//         option.value = user.id;
//         option.textContent = `[${user.employee_id}] ${user.fullname}`;
//         select.appendChild(option);
//     });
// }

// Tự động điền trưởng máy từ user đăng nhập
function setTruongMayFromCurrentUser() {
    const currentUser = getCurrentUser();
    const truongMayInput = document.getElementById('truongmay');

    if (currentUser && truongMayInput) {
        let displayName = '';
        if (currentUser.fullname && currentUser.employee_id) {
            displayName = `[${currentUser.employee_id}] ${currentUser.fullname}`;
        } else if (currentUser.fullname) {
            displayName = currentUser.fullname;
        } else {
            displayName = currentUser.username || 'Unknown User';
        }

        truongMayInput.value = displayName;

        const caInput = document.getElementById('ca');
        if (currentUser && caInput) {
            caInput.value = currentUser.ca || 'A';
        }
    }
}

// ====================================================================================================================================
// XỬ LÝ WS VÀ DỮ LIỆU
// ====================================================================================================================================

// Xử lý khi thay đổi WS
async function handleWSChange() {
    const wsInput = document.getElementById('ws');
    if (!wsInput) return;

    const wsValue = wsInput.value.trim();
    // Kiểm tra format WS (phải có dấu gạch ngang)
    if (wsValue && !wsValue.includes('-')) {
        clearWSData();
        // showNotification('Số WS phải có định dạng: xxxxxxxx-x', 'warning');
        return;
    }

    if (!wsValue) {
        clearWSData();
        return;
    }

    try {
        console.log('Đang tìm kiếm WS:', wsValue);

        // Gọi API để lấy dữ liệu WS
        const response = await fetch(`/api/ws-tong/search?so_ws=${encodeURIComponent(wsValue)}&exact=true`);

        if (!response.ok) {
            throw new Error('Không thể tìm kiếm WS');
        }

        const wsData = await response.json();

        if (wsData && wsData.length > 0) {
            // Tìm WS khớp chính xác
            const exactMatch = wsData.find(ws => ws.so_ws === wsValue);

            if (exactMatch) {
                populateWSData(exactMatch);
                updateInProgress();
                showNotification(`Đã tải thông tin WS: ${wsValue}`, 'success');
            } else {
                clearWSData();
                showNotification(`Không tìm thấy WS chính xác: ${wsValue}`, 'warning');
            }
        } else {
            clearWSData();
            showNotification(`Không tìm thấy WS: ${wsValue}`, 'warning');
        }

    } catch (error) {
        console.error('Lỗi khi tìm kiếm WS:', error);
        clearWSData();
        showNotification('Lỗi khi tìm kiếm WS', 'error');
    }
}

// Điền dữ liệu WS vào form
function populateWSData(wsData) {
    try {
        // Khách hàng
        setInputValue('khachhang', wsData.khach_hang);

        // Mã sản phẩm
        setInputValue('masp', wsData.ma_sp);

        // Số lượng đơn hàng
        setInputValue('sldonhang', wsData.sl_dh);

        // Số con
        setInputValue('socon', wsData.s_con);

        // Số màu
        setInputValue('somau', wsData.so_mau_in);

        // Mã giấy
        setInputValue('magiay', wsData.loai_giay_1);
        setInputValue('magiay1', wsData.loai_giay_1);
        setInputValue('magiay2', wsData.loai_giay_2);
        setInputValue('magiay3', wsData.loai_giay_3);

        // Khổ
        setInputValue('kho', wsData.kho_1);

        // Chặt (Dài giấy)
        setInputValue('chat', wsData.chat_1);

        // Số lượng đã in (từ WS)
        calculateAndDisplaySoLuongDaIn(wsData);

        // Xử lý số pass in dựa vào số màu
        handlePassInLogic(wsData.so_mau_in);

        console.log('Đã điền dữ liệu WS:', wsData);

        // Lưu dữ liệu WS ngay sau khi điền
        if (!isStarted || currentReportId) {
            saveFormDataByMachine();
        }

    } catch (error) {
        console.error('Lỗi khi điền dữ liệu WS:', error);
        showNotification('Lỗi khi xử lý dữ liệu WS', 'error');
    }
}

// Xóa dữ liệu WS
function clearWSData() {
    const fields = [
        'khachhang', 'masp', 'sldonhang', 'socon', 'somau',
        'magiay', 'magiay1', 'magiay2', 'magiay3',
        'kho', 'chat', 'soluongdain'
    ];

    fields.forEach(fieldId => {
        setInputValue(fieldId, '');
    });

    // Reset pass in
    const passSelect = document.getElementById('pass');
    if (passSelect) {
        passSelect.selectedIndex = 0;
        passSelect.disabled = false;
        passSelect.style.backgroundColor = '';
    }

    // Reset phủ keo về trạng thái mặc định
    const phuKeoSelect = document.getElementById('phukeo');
    if (phuKeoSelect) {
        phuKeoSelect.selectedIndex = 0;
        phuKeoSelect.disabled = false;
        phuKeoSelect.style.backgroundColor = '';
        phuKeoSelect.style.borderColor = '';
        phuKeoSelect.style.borderWidth = '';
        phuKeoSelect.required = false;
    }

    // Xóa chỉ báo bắt buộc
    removeRequiredIndicator('phukeo');

}

// Xử lý logic số pass in
function handlePassInLogic(soMau) {
    const passSelect = document.getElementById('pass');
    const machineId = getCurrentMachineId();

    if (!passSelect || !soMau) return;

    try {
        // Lấy số đầu từ chuỗi số màu (ví dụ: "4-0" -> 4)
        const soDau = parseInt(soMau.split('-')[0] || '0');

        if (soDau <= 6) {
            // Số màu <= 6 -> IN 1 PASS và disable
            passSelect.value = '1';
            passSelect.setAttribute('data-auto-set', 'true'); // THÊM DÒNG NÀY
            passSelect.disabled = true;
            passSelect.style.backgroundColor = '#f8f9fa';
        } else if (machineId === '2M') {
            // Máy 2M và số màu > 6 -> IN 1 PASS và disable
            passSelect.value = '1';
            passSelect.setAttribute('data-auto-set', 'true'); // THÊM DÒNG NÀY
            passSelect.disabled = true;
            passSelect.style.backgroundColor = '#f8f9fa';
        } else {
            // Số màu > 6 và không phải máy 2M -> Enable để người dùng chọn
            passSelect.disabled = false;
            passSelect.removeAttribute('data-auto-set'); // THÊM DÒNG NÀY
            passSelect.selectedIndex = 0; // Reset về "-- Chọn số pass in --"
            passSelect.style.backgroundColor = '';
        }

        console.log(`Xử lý pass in: Số màu ${soMau}, Máy ${machineId}, Pass: ${passSelect.value}, Disabled: ${passSelect.disabled}`);

    } catch (error) {
        console.error('Lỗi khi xử lý pass in:', error);
    }
}

// Hàm utility để set giá trị input
function setInputValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = value || '';
    }
}

// ====================================================================================================================================
// XỬ LÝ CÁC SELECT EVENTS
// ====================================================================================================================================


// Xử lý khi thay đổi giờ làm việc
function handleGioLamViecChange() {
    const gioLamViecSelect = document.getElementById('gioLamViec');
    if (!gioLamViecSelect) return;

    const gioValue = gioLamViecSelect.value;
    updateMaCa();

    console.log('Đã chọn giờ làm việc:', gioValue);
}

// Cập nhật mã ca dựa trên ca và giờ làm việc
function updateMaCa() {
    const gioLamViecSelect = document.getElementById('gioLamViec');
    const maCaInput = document.getElementById('maCa');

    if (!gioLamViecSelect || !maCaInput) return;

    const gioValue = gioLamViecSelect.value;
    const mapping = {
        '0': 'A',    // 6H - 14H
        '1': 'B',    // 14H - 22H  
        '2': 'C',    // 22H - 6H
        '3': 'D',    // 10H - 22H
        '4': 'A1',   // 6H - 18H
        '5': 'B1',   // 18H - 6H
        '6': 'AB',   // 7H - 16H
        '7': 'AB-',  // 7H - 15H
        '8': 'AB+',  // 7H - 17H
        '9': 'HC'    // 8H - 17H
    };

    maCaInput.value = mapping[gioValue] || '';
}

// Xử lý khi thay đổi tùy chọn
function handleTuychonChange() {
    const tuychonSelect = document.getElementById('tuychon');
    if (!tuychonSelect) return;

    const tuychonValue = tuychonSelect.value;

    // Logic xử lý theo tùy chọn
    handleTuychonLogic(tuychonValue);

    // Cập nhật tiến độ khi thay đổi tùy chọn
    updateInProgress();


    // Tính lại số lượng đã in khi thay đổi tùy chọn
const wsValue = getInputValue('ws');
if (wsValue) {
    setTimeout(() => {
        calculateAndDisplaySoLuongDaIn({});
    }, 100);
}


    console.log('Đã chọn tùy chọn:', tuychonValue);
}

// Logic xử lý theo tùy chọn
function handleTuychonLogic(tuychonValue) {
    const phuKeoSelect = document.getElementById('phukeo');

    if (!phuKeoSelect) return;

    // Logic xử lý theo tùy chọn
    switch (tuychonValue) {
        case '2': // In + Cán bóng
        case '3': // Cán bóng  
        case '5': // In dặm + Cán bóng
        case '6': // Cán bóng lại
            // Enable phủ keo và đánh dấu bắt buộc
            phuKeoSelect.disabled = false;
            phuKeoSelect.style.backgroundColor = '';
            // phuKeoSelect.style.borderColor = 'red';
            // phuKeoSelect.style.borderWidth = '2px';
            phuKeoSelect.required = true;

            // Thêm chú thích bắt buộc
            // addRequiredIndicator('phukeo', 'Bắt buộc chọn khi có cán bóng');
            break;

            case '7': // In dặm (Gia công)
    // Disable phủ keo và không bắt buộc
    phuKeoSelect.disabled = true;
    phuKeoSelect.selectedIndex = 0;
    phuKeoSelect.style.backgroundColor = '#f8f9fa';
    phuKeoSelect.style.borderColor = '';
    phuKeoSelect.style.borderWidth = '';
    phuKeoSelect.required = false;

    // Xóa chú thích bắt buộc
    removeRequiredIndicator('phukeo');
    break;

case '8': // In dặm + Cán bóng (Gia công)
case '9': // Cán bóng lại (Gia công)
    // Enable phủ keo và đánh dấu bắt buộc
    phuKeoSelect.disabled = false;
    phuKeoSelect.style.backgroundColor = '';
    phuKeoSelect.required = true;
    break;

        case '1': // In
        case '4': // In dặm
            // Disable phủ keo và không bắt buộc
            phuKeoSelect.disabled = true;
            phuKeoSelect.selectedIndex = 0;
            phuKeoSelect.style.backgroundColor = '#f8f9fa';
            phuKeoSelect.style.borderColor = '';
            phuKeoSelect.style.borderWidth = '';
            phuKeoSelect.required = false;

            // Xóa chú thích bắt buộc
            removeRequiredIndicator('phukeo');
            break;

        default:
            // Mặc định enable nhưng không bắt buộc
            phuKeoSelect.disabled = false;
            phuKeoSelect.style.backgroundColor = '';
            phuKeoSelect.style.borderColor = '';
            phuKeoSelect.style.borderWidth = '';
            phuKeoSelect.required = false;

            // Xóa chú thích bắt buộc
            removeRequiredIndicator('phukeo');
            break;
    }

    console.log('Xử lý logic tùy chọn:', tuychonValue);
}


// ====================================================================================================================================
// XỬ LÝ BẮT ĐẦU BÁO CÁO
// ====================================================================================================================================

// Xử lý khi bấm nút bắt đầu
async function handleStartReport() {

    try {
        console.log('=== BẮT ĐẦU XỬ LÝ BÁO CÁO IN ===');


        // Ẩn nút bắt đầu ngay khi bấm để tránh bấm nhiều lần
const startButton = document.querySelector('.btn-success');
if (startButton) {
    startButton.style.display = 'none';
    console.log('Đã ẩn nút bắt đầu ngay khi bấm');
}
        const dungMayValue = document.querySelector('input[name="dungmay"]:checked')?.value || null;



        // Kiểm tra nếu đã có báo cáo bắt đầu
        const isUpdate = currentReportId !== null;

        // Luôn cập nhật thời gian bắt đầu mới khi bấm nút
startTime = new Date();
hasValidStartTime = true; // Đánh dấu có thời gian hợp lệ

// Hiển thị thời gian bắt đầu
const startTimeElement = document.getElementById('startTime');
if (startTimeElement) {
    startTimeElement.textContent = startTime.toLocaleString('vi-VN');
}

console.log('⏰ Đã cập nhật thời gian bắt đầu:', startTime.toLocaleString('vi-VN'));


        // Hiển thị loading
        showInLoading('Đang chuẩn bị báo cáo...', 'Thu thập thông tin');

        // Kiểm tra dữ liệu đầu vào
if (!validateStartData()) {
    // Hiển thị lại nút nếu validation thất bại
    const startButton = document.querySelector('.btn-success');
    if (startButton) {
        startButton.style.display = 'inline-block';
        console.log('Hiển thị lại nút do validation thất bại');
    }
    hideInLoading();
    return;
}

        // Thu thập dữ liệu bắt đầu
const startData = await collectStartReportData();
if (!startData) {
    // Hiển thị lại nút nếu thu thập dữ liệu thất bại
    const startButton = document.querySelector('.btn-success');
    if (startButton) {
        startButton.style.display = 'inline-block';
        console.log('Hiển thị lại nút do thu thập dữ liệu thất bại');
    }
    hideInLoading();
    return;
}

        updateInLoadingText('Đang gửi báo cáo bắt đầu...', 'Kết nối server');

        // Xác định API endpoint
        const apiEndpoint = currentReportId ?
            `/api/bao-cao-in/update-start/${currentReportId}` :
            '/api/bao-cao-in/submit-start';
        const apiMethod = currentReportId ? 'PUT' : 'POST';

        // Gửi dữ liệu bắt đầu
        const response = await fetch(apiEndpoint, {
            method: apiMethod,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(startData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        // Lưu ID báo cáo
currentReportId = result.id;
document.body.setAttribute('data-report-id', currentReportId);

// Đảm bảo thời gian bắt đầu đã được set
startTime = new Date();

        // Cập nhật UI
        updateUIAfterStart();


        updateInLoadingText('Hoàn tất!', 'Báo cáo đã được bắt đầu');
        await new Promise(resolve => setTimeout(resolve, 1000));

        hideInLoading();
        showNotification('Đã bắt đầu báo cáo In thành công!', 'success');

        // Xóa attribute just-started sau khi hoàn thành bắt đầu
        // const startButton = document.querySelector('.btn-success');
        // if (startButton && startButton.hasAttribute('data-just-started')) {
        //     setTimeout(() => {
        //         startButton.removeAttribute('data-just-started');
        //     }, 2000); // Đợi 2 giây trước khi cho phép hiển thị nút bắt đầu lại
        // }

        console.log('✅ Đã bắt đầu báo cáo In thành công với ID:', currentReportId);

    } catch (error) {
        console.error('Lỗi khi bắt đầu báo cáo In:', error);
        
        // Hiển thị lại nút nếu có lỗi
        const startButton = document.querySelector('.btn-success');
        if (startButton) {
            startButton.style.display = 'inline-block';
            console.log('Hiển thị lại nút do có lỗi xử lý');
        }
        
        hideInLoading();
        showNotification('Lỗi khi bắt đầu báo cáo: ' + error.message, 'error');
    }
}

// Kiểm tra dữ liệu bắt đầu
function validateStartData() {
    const requiredFields = [
        { id: 'ca', name: 'Ca' },
        { id: 'gioLamViec', name: 'Giờ làm việc' },
        { id: 'quandoc', name: 'Quản đốc' }
    ];

    // Kiểm tra phủ keo nếu tùy chọn có cán bóng
    const tuychonElement = document.getElementById('tuychon');
    const phuKeoElement = document.getElementById('phukeo');

    if (tuychonElement && tuychonElement.value) {
        const canBongOptions = ['2', '3', '5', '6'];

        if (canBongOptions.includes(tuychonElement.value)) {
            if (!phuKeoElement || !phuKeoElement.value) {
                showNotification('Vui lòng chọn phủ keo khi có tùy chọn cán bóng', 'error');
                phuKeoElement?.focus();
                return false;
            }
        }
    }

    for (const field of requiredFields) {
        const element = document.getElementById(field.id);
        if (!element || !element.value) {
            showNotification(`Vui lòng chọn ${field.name}`, 'error');
            element?.focus();
            return false;
        }
    }

    return true;
}

// Thu thập dữ liệu báo cáo bắt đầu
async function collectStartReportData() {
    try {
        const currentUser = getCurrentUser();
        const machineId = getCurrentMachineId();

        const startData = {
            may: machineId,
            quanDoc: getSelectText('quandoc'),
            ca: getInputValue('ca'),
            gioLamViec: getSelectText('gioLamViec'),
            maCa: getInputValue('maCa'),
            truongMay: getInputValue('truongmay'),
            ws: getInputValue('ws'),
            tuychon: getSelectText('tuychon'),
            mau3tone: getCheckboxValue('mau3tone'),
            sokem: getInputValue('sokem'),
            matsau: getCheckboxValue('matsau'),
            phukeo: getSelectValue('phukeo'),
            phunbot: getInputValue('phunbot'),
            phumay1: getSelectText('phumay1'),
            phumay2: getSelectText('phumay2'),
            soPassIn: getSelectText('pass'),
            thoiGianBatDau: new Date().toISOString(),
            nguoiThucHien: getCurrentUserFullName()
        };

        console.log('Dữ liệu bắt đầu:', startData);
        return startData;

    } catch (error) {
        console.error('Lỗi khi thu thập dữ liệu bắt đầu:', error);
        showNotification('Lỗi khi thu thập dữ liệu', 'error');
        return null;
    }
}

// Cập nhật UI sau khi bắt đầu
function updateUIAfterStart() {
    isStarted = true;
    startTime = new Date();


// Đảm bảo có thời gian bắt đầu hợp lệ
if (!startTime) {
    startTime = new Date();
}
hasValidStartTime = true;

// Hiển thị thời gian bắt đầu
const startTimeElement = document.getElementById('startTime');
if (startTimeElement) {
    startTimeElement.textContent = startTime.toLocaleString('vi-VN');
    console.log('Đã cập nhật thời gian bắt đầu:', startTime.toLocaleString('vi-VN'));
}

    // Disable một số form bắt đầu (không disable nút bắt đầu)
    const disabledFields = ['ca', 'truongmay'];
    disabledFields.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.disabled = true;
        }
    });

    // Hiển thị nút xác nhận
    const confirmButton = document.getElementById('confirmButton');
    if (confirmButton) {
        confirmButton.style.display = 'inline-block';
        confirmButton.classList.add('show');
    }

// Ẩn nút bắt đầu sau khi bắt đầu thành công và đã có thời gian
const startButton = document.querySelector('.btn-success') || document.querySelector('.btn-warning');
if (startButton) {
    startButton.textContent = 'Bắt Đầu';
    startButton.classList.remove('btn-warning');
    startButton.classList.add('btn-success');
    startButton.style.display = 'none';
    startButton.removeAttribute('data-restart-mode');
    console.log('Đã ẩn nút bắt đầu sau khi bắt đầu thành công và có thời gian');
}

    // Cập nhật progress bar
    updateProgressBar(100);

    // Cập nhật tiến độ form
    updateInProgress();

    // Lưu trạng thái
    saveFormState();

    // Lưu dữ liệu form theo máy khi bắt đầu
    saveFormDataByMachine();

    // Khôi phục dữ liệu form khi đã bắt đầu báo cáo
    if (currentReportId) {
        // Lấy dữ liệu từ database hoặc localStorage
        restoreStartedReportData();
    }






}


// Khôi phục dữ liệu báo cáo đã bắt đầu
async function restoreStartedReportData() {

    if (!isStarted) {
        console.warn('Không thể khôi phục dữ liệu khi chưa bắt đầu báo cáo');
        return;
    }

    if (!currentReportId) return;

    try {
        // Gọi API để lấy dữ liệu báo cáo
        const response = await fetch(`/api/bao-cao-in/${currentReportId}`);
        if (!response.ok) {
            console.warn('Không thể lấy dữ liệu báo cáo đã bắt đầu');
            return;
        }

        const reportData = await response.json();

        // Điền lại dữ liệu phần bắt đầu
        if (reportData.quan_doc) setSelectValueByText('quandoc', reportData.quan_doc);
        if (reportData.gio_lam_viec) setSelectValueByText('gioLamViec', reportData.gio_lam_viec);
        if (reportData.ma_ca) setInputValue('maCa', reportData.ma_ca);
        if (reportData.phu_may_1) setSelectValueByText('phumay1', reportData.phu_may_1);
        if (reportData.phu_may_2) setSelectValueByText('phumay2', reportData.phu_may_2);

        if (reportData.ws) setInputValue('ws', reportData.ws);
        if (reportData.tuy_chon) setSelectValueByText('tuychon', reportData.tuy_chon);
        if (reportData.so_kem) setInputValue('sokem', reportData.so_kem);
        if (reportData.mau_3_tone !== undefined) setCheckboxValue('mau3tone', reportData.mau_3_tone);
        if (reportData.mat_sau !== undefined) setCheckboxValue('matsau', reportData.mat_sau);
        if (reportData.phu_keo) setSelectValue('phukeo', reportData.phu_keo);
        if (reportData.phun_bot) setInputValue('phunbot', reportData.phun_bot);
        if (reportData.so_pass_in) {
            const passSelect = document.getElementById('pass');
            if (passSelect) {
                if (reportData.so_pass_in === 'IN 1 PASS') {
                    passSelect.value = '1';
                } else if (reportData.so_pass_in === 'IN 2 PASS') {
                    passSelect.value = '2';
                }
            }
        }

        // Giữ nguyên trạng thái select pass
        const somau = parseInt((reportData.so_mau || '0').split('-')[0]);
        const machineId = getCurrentMachineId();
        if (somau > 6 && machineId !== '2M') {
            passSelect.disabled = false;
            passSelect.removeAttribute('data-auto-set');
            passSelect.style.backgroundColor = '';
        } else {
            passSelect.disabled = true;
            passSelect.setAttribute('data-auto-set', 'true');
            passSelect.style.backgroundColor = '#f8f9fa';
        }


        // Điền dữ liệu từ WS
        if (reportData.khach_hang) setInputValue('khachhang', reportData.khach_hang);
        if (reportData.ma_sp) setInputValue('masp', reportData.ma_sp);
        if (reportData.sl_don_hang) setInputValue('sldonhang', reportData.sl_don_hang);
        if (reportData.so_con) setInputValue('socon', reportData.so_con);
        if (reportData.so_mau) setInputValue('somau', reportData.so_mau);
        if (reportData.ma_giay_1) {
            setInputValue('magiay', reportData.ma_giay_1);
            setInputValue('magiay1', reportData.ma_giay_1);
        }
        if (reportData.ma_giay_2) setInputValue('magiay2', reportData.ma_giay_2);
        if (reportData.ma_giay_3) setInputValue('magiay3', reportData.ma_giay_3);
        if (reportData.kho) setInputValue('kho', reportData.kho);
        if (reportData.dai_giay) setInputValue('chat', reportData.dai_giay);
        if (reportData.sl_giay_theo_ws) setInputValue('soluongdain', reportData.sl_giay_theo_ws);

        // Điền dữ liệu kết thúc nếu có
        if (reportData.thoi_gian_canh_may) setInputValue('canhmay', reportData.thoi_gian_canh_may);
        if (reportData.thanh_pham_in) setInputValue('thanhphamin', reportData.thanh_pham_in);
        if (reportData.phe_lieu) setInputValue('phelieu', reportData.phe_lieu);
        if (reportData.phe_lieu_trang) setInputValue('phelieutrang', reportData.phe_lieu_trang);
        if (reportData.sl_giay_ream) setInputValue('slgiayream', reportData.sl_giay_ream);
        if (reportData.sl_giay_tt_1) setInputValue('slgiaynhan1', reportData.sl_giay_tt_1);
        if (reportData.sl_giay_tt_2) setInputValue('slgiaynhan2', reportData.sl_giay_tt_2);
        if (reportData.sl_giay_tt_3) setInputValue('slgiaynhan3', reportData.sl_giay_tt_3);
        if (reportData.ghi_chu) setInputValue('ghiChu', reportData.ghi_chu);

        // Khôi phục trạng thái dừng máy nếu có
        if (reportData.dung_may) {
            const btnYes = document.getElementById('btnYes');
            const btnNo = document.getElementById('btnNo');
            const machineReport = document.getElementById('machineReport');

            if (btnYes) {
                btnYes.style.backgroundColor = 'rgb(208, 0, 0)';
                btnYes.style.color = 'white';
            }
            if (btnNo) {
                btnNo.style.backgroundColor = '';
                btnNo.style.color = '';
            }
            if (machineReport) {
                machineReport.style.display = 'block';
            }
        } else {
            const btnYes = document.getElementById('btnYes');
            const btnNo = document.getElementById('btnNo');
            const machineReport = document.getElementById('machineReport');

            if (btnNo) {
                btnNo.style.backgroundColor = 'rgb(74, 144, 226)';
                btnNo.style.color = 'white';
            }
            if (btnYes) {
                btnYes.style.backgroundColor = '';
                btnYes.style.color = '';
            }
            if (machineReport) {
                machineReport.style.display = 'none';
            }
        }


        // Đảm bảo các trường được phép chỉnh sửa không bị disable
        const editableFields = [
            'quandoc', 'gioLamViec', 'phumay1', 'phumay2', 'ws', 'tuychon',
            'sokem', 'mau3tone', 'matsau', 'phukeo', 'phunbot'
        ];

        editableFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.disabled = false;
            }
        });

        // Xử lý riêng cho pass in
        const passSelect = document.getElementById('pass');
        if (passSelect && !passSelect.style.backgroundColor) {
            passSelect.disabled = false;
        }


        // Khôi phục thời gian bắt đầu từ database
        if (reportData.thoi_gian_bat_dau) {
            startTime = new Date(reportData.thoi_gian_bat_dau);
            const startTimeElement = document.getElementById('startTime');
            if (startTimeElement) {
                startTimeElement.textContent = startTime.toLocaleString('vi-VN');
            }
        }


        // Cập nhật tiến độ
        setTimeout(() => {
            updateInProgress();
        }, 200);

        console.log('Đã khôi phục dữ liệu báo cáo đã bắt đầu');

    } catch (error) {
        console.error('Lỗi khi khôi phục dữ liệu báo cáo đã bắt đầu:', error);
    }
}

// ====================================================================================================================================
// XỬ LÝ XÁC NHẬN BÁO CÁO
// ====================================================================================================================================


// Xử lý khi bấm nút xác nhận
async function handleConfirmReport() {
    try {
        console.log('=== KIỂM TRA THÔNG TIN BÁO CÁO IN ===');

        // Kiểm tra có báo cáo bắt đầu không
        if (!currentReportId) {
            showNotification('Chưa có báo cáo bắt đầu!', 'error');
            return;
        }

        // Kiểm tra dữ liệu kết thúc
        if (!validateEndData()) {
            return;
        }

        // Thu thập dữ liệu để kiểm tra
        const endData = await collectEndReportData();
        if (!endData) {
            return;
        }

        // Hiển thị modal kiểm tra thông tin
        showConfirmReportModal(endData);

    } catch (error) {
        console.error('Lỗi khi kiểm tra báo cáo In:', error);
        showNotification('Lỗi khi kiểm tra báo cáo: ' + error.message, 'error');
    }
}

// Kiểm tra dữ liệu kết thúc
function validateEndData() {
    const requiredFields = [
        { id: 'thanhphamin', name: 'Thành phẩm in' }
    ];

    for (const field of requiredFields) {
        const element = document.getElementById(field.id);
        if (!element || !element.value || element.value.trim() === '') {
            showNotification(`Vui lòng nhập ${field.name}`, 'error');
            element?.focus();
            return false;
        }
    }

    return true;
}

// Thu thập dữ liệu kết thúc
async function collectEndReportData() {
    function parseFormattedNumber(value) {
        if (!value) return '';
        return value.toString().replace(/,/g, '');
    }
    
    try {
        const ketThuc = {
            // ⚠️ THỜI GIAN KẾT THÚC GIỮ NGUYÊN (có giây đầy đủ)
            thoiGianKetThuc: new Date().toISOString(),
            canhmay: getInputValue('canhmay'),
            thanhphamin: getInputValue('thanhphamin'),
            phelieu: getInputValue('phelieu'),
            phelieutrang: getInputValue('phelieutrang'),
            slgiayream: getInputValue('slgiayream'),            
            slGiayTT1: parseFormattedNumber(getInputValue('slgiaynhan1')),
            slGiayTT2: parseFormattedNumber(getInputValue('slgiaynhan2')),
            slGiayTT3: parseFormattedNumber(getInputValue('slgiaynhan3')),
            ghiChu: getInputValue('ghiChu'),
            dungMay: getCheckboxValue('dungMayCheckbox'),
            
            tongSoLuong: await calculateTongSoLuongCorrect(),
            tongPheLieu: await calculateTongPheLieuCorrect(), 
            tongPhelieuTrang: await calculateTongPheLieuTrangCorrect(),
            thanhPham: await calculateThanhPhamCorrect()
        };

        // 🔧 CHỈ FORMAT THỜI GIAN DỪNG MÁY, THÊM :00
        const dungMay = [];
        const stopBoxes = document.querySelectorAll('.stop-reason-box');
        stopBoxes.forEach(box => {
            const reasonValue = box.querySelector('.reason-value')?.value || '';
            const otherReason = box.querySelector('.other-reason-input')?.value || '';
            const stopTime = box.querySelector('.stop-time-input')?.value || '';
            const resumeTime = box.querySelector('.resume-time-input')?.value || '';
            const duration = box.querySelector('.duration-display')?.value || '';
            
            if (reasonValue && stopTime && resumeTime) {
                dungMay.push({
                    lyDo: reasonValue === 'Khác' ? otherReason : reasonValue,
                    thoiGianDung: formatStopMachineTime(stopTime),      // 🔧 Thêm :00
                    thoiGianChayLai: formatStopMachineTime(resumeTime), // 🔧 Thêm :00
                    thoiGianDungMay: duration,
                    ghiChu: otherReason
                });
            }
        });

        console.log('✅ Dữ liệu kết thúc (dừng máy có :00):', {
            tongSoLuong: ketThuc.tongSoLuong,
            tongPheLieu: ketThuc.tongPheLieu,
            thanhPham: ketThuc.thanhPham,
            dungMayCount: dungMay.length
        });

        return { ketThuc, dungMay };

    } catch (error) {
        console.error('Lỗi khi thu thập dữ liệu kết thúc:', error);
        return null;
    }
}




// Hàm tính tổng với logic mới: cùng tùy chọn cộng dồn + trường hợp đặc biệt
async function calculateTongWithSumComplete(fieldName) {
    try {
        const wsValue = getInputValue('ws');
        const currentTuyChonText = getSelectText('tuychon');
        const currentMatSau = getCheckboxValue('matsau');
        const currentPhuKeo = getSelectValue('phukeo');
        const currentSoPass = getSelectText('pass');
        const currentMay = getCurrentMachineId();

        if (!wsValue || !currentTuyChonText) return 0;

        console.log(`🔍 Frontend tính tổng CỘNG DỒN ${fieldName}: WS=${wsValue}, Tùy chọn=${currentTuyChonText}`);

        // Gọi API lấy tất cả báo cáo
        const response = await fetch('/api/bao-cao-in/list?exclude_stop_only=true');
        if (!response.ok) return 0;

        const allReports = await response.json();

        // Tìm tất cả báo cáo cùng WS và cùng điều kiện
const sameWSReports = allReports.filter(report => {
    if (report.ws !== wsValue) return false;
    
    // Cùng điều kiện: mặt sau, số pass in
    const reportMatSau = report.mat_sau ? true : false;
    if (reportMatSau !== currentMatSau) return false;
    
    if (report.so_pass_in !== currentSoPass) return false;
    
    // 🔧 CHỈ xét phủ keo cho tùy chọn 1,2,3 (KHÔNG xét cho 4,5,6)
    const wasteOptions = ['4. IN DẶM', '5. IN DẶM + CÁN BÓNG', '6. CÁN BÓNG LẠI'];
    const currentIsWaste = wasteOptions.includes(currentTuyChonText);
    const reportIsWaste = wasteOptions.includes(report.tuy_chon);
    
    // Nếu cả 2 đều KHÔNG phải waste (tức là 1,2,3) thì mới xét phủ keo
    if (!currentIsWaste && !reportIsWaste) {
        const currentIs2M = currentMay === '2M';
        const reportIs2M = report.may === '2M';
        
        if (currentIs2M && reportIs2M) {
            if (report.phu_keo !== currentPhuKeo) return false;
        } else if (currentIs2M !== reportIs2M) {
            return false;
        }
    }
    // Nếu có ít nhất 1 bên là waste (4,5,6) thì KHÔNG xét phủ keo
    
    // Loại trừ báo cáo hiện tại nếu đang cập nhật
    if (currentReportId && report.id === currentReportId) return false;

    return report[fieldName] && parseFloat(report[fieldName]) > 0;
});

        // Sắp xếp theo thời gian tạo
        sameWSReports.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        // A. CÙNG TÙY CHỌN - Cộng dồn
        const sameOptionReports = sameWSReports.filter(report => report.tuy_chon === currentTuyChonText);
        let tongCungTuyChon = sameOptionReports.reduce((sum, report) => {
            return sum + (parseFloat(report[fieldName]) || 0);
        }, 0);

        // B. TRƯỜNG HỢP ĐẶC BIỆT - Kế thừa
        let tongKeThua = 0;
        
        // Xác định trường để kế thừa (tổng_so_luong cho SL, tong_phe_lieu cho PL)
        const inheritField = fieldName === 'thanh_pham_in' ? 'tong_so_luong' : 'tong_phe_lieu';
        
        // Kiểm tra các trường hợp đặc biệt
        if (currentTuyChonText === '3. CÁN BÓNG') {
            // CÁN BÓNG kế thừa từ IN cuối cùng
            const inReports = sameWSReports.filter(report => report.tuy_chon === '1. IN');
            if (inReports.length > 0) {
                const lastInReport = inReports[inReports.length - 1];
                tongKeThua = parseFloat(lastInReport[inheritField]) || 0;
                console.log(`🔄 CÁN BÓNG kế thừa từ IN (${inheritField}): ${tongKeThua}`);
                return tongKeThua; // CÁN BÓNG không cộng dồn, chỉ kế thừa
            }
        } else if (currentTuyChonText === '2. IN + CÁN BÓNG') {
            // IN+CÁN BÓNG kế thừa từ IN hoặc CÁN BÓNG cuối cùng
            const canBongReports = sameWSReports.filter(report => report.tuy_chon === '3. CÁN BÓNG');
            const inReports = sameWSReports.filter(report => report.tuy_chon === '1. IN');
            
            if (canBongReports.length > 0) {
                // Có CÁN BÓNG -> kế thừa từ CÁN BÓNG
                const lastCanBongReport = canBongReports[canBongReports.length - 1];
                tongKeThua = parseFloat(lastCanBongReport[inheritField]) || 0;
                console.log(`🔄 IN+CÁN BÓNG kế thừa từ CÁN BÓNG (${inheritField}): ${tongKeThua}`);
            } else if (inReports.length > 0) {
                // Không có CÁN BÓNG -> kế thừa từ IN
                const lastInReport = inReports[inReports.length - 1];
                tongKeThua = parseFloat(lastInReport[inheritField]) || 0;
                console.log(`🔄 IN+CÁN BÓNG kế thừa từ IN (${inheritField}): ${tongKeThua}`);
            }
        }

        const total = tongCungTuyChon + tongKeThua;
        console.log(`✅ Tổng ${fieldName}: Cùng tùy chọn=${tongCungTuyChon} + Kế thừa=${tongKeThua} = ${total}`);
        return total;

    } catch (error) {
        console.error(`Lỗi khi tính tổng ${fieldName}:`, error);
        return 0;
    }
}



// Tính tổng số lượng đúng logic
async function calculateTongSoLuongCorrect() {
    const currentValue = parseFloat(getInputValue('thanhphamin')) || 0;
    
    // Lấy tổng tất cả báo cáo matching (bao gồm cả hiện tại nếu đã lưu)
    const tongCu = await calculateTongWithSumComplete('thanh_pham_in');
    
    // LUÔN CỘNG THÊM GIÁ TRỊ HIỆN TẠI
    return tongCu + currentValue;
}

// Tính tổng phế liệu đúng logic  
async function calculateTongPheLieuCorrect() {
    const currentValue = parseFloat(getInputValue('phelieu')) || 0;
    
    const tongCu = await calculateTongWithSumComplete('phe_lieu');
    
    // LUÔN CỘNG THÊM GIÁ TRỊ HIỆN TẠI
    return tongCu + currentValue;
}

// Tính tổng phế liệu trắng đúng logic
async function calculateTongPheLieuTrangCorrect() {
    const currentValue = parseFloat(getInputValue('phelieutrang')) || 0;
    
    const tongCu = await calculateTongWithSumComplete('phe_lieu_trang');
    
    // LUÔN CỘNG THÊM GIÁ TRỊ HIỆN TẠI
    return tongCu + currentValue;
}






// Tính thành phẩm theo logic mới: Mặc định = Tổng SL, tùy chọn 1,2,3 trừ phế liệu của 4,5,6
async function calculateThanhPhamCorrect() {
    try {
        const wsValue = getInputValue('ws');
        const tuychonText = getSelectText('tuychon');
        const tuychonValue = getSelectValue('tuychon');

        if (!wsValue || !tuychonText) return 0;

        console.log(`🔍 Tính thành phẩm: WS=${wsValue}, Tùy chọn=${tuychonText}`);

        const tongSoLuong = await calculateTongSoLuongCorrect();

        // Tùy chọn 4,5,6 (waste) và 7,8,9 (gia công) = Tổng SL (không bị trừ)
        if (['4', '5', '6', '7', '8', '9'].includes(tuychonValue)) {
            console.log(`✅ Tùy chọn ${tuychonText} -> Thành phẩm = Tổng SL = ${tongSoLuong}`);
            return tongSoLuong;
        }

        // Tùy chọn 1,2,3 (production) - có thể bị trừ phế liệu của 4,5,6
        if (['1', '2', '3'].includes(tuychonValue)) {
            // Lấy tổng phế liệu từ waste processes 4,5,6 (KHÔNG bao gồm 7,8,9)
            const tongPheLieuWaste = await getTotalWastePheLieu(wsValue);
            
            const thanhPham = Math.max(0, tongSoLuong - tongPheLieuWaste);
            console.log(`✅ ${tuychonText}: Tổng SL=${tongSoLuong} - Phế liệu waste(4,5,6)=${tongPheLieuWaste} = ${thanhPham}`);
            return thanhPham;
        }

        // Fallback
        return tongSoLuong;

    } catch (error) {
        console.error('Lỗi khi tính thành phẩm:', error);
        return 0;
    }
}



// Lấy tổng phế liệu từ waste processes (CHỈ tùy chọn 4,5,6 - KHÔNG bao gồm 7,8,9)
async function getTotalWastePheLieu(wsValue) {
    try {
        const currentMatSau = getCheckboxValue('matsau');
        const currentPhuKeo = getSelectValue('phukeo');
        const currentSoPass = getSelectText('pass');
        const currentMay = getCurrentMachineId();

        // Gọi API lấy tất cả báo cáo
        const response = await fetch('/api/bao-cao-in/list?exclude_stop_only=true');
        if (!response.ok) return 0;

        const allReports = await response.json();

        // Lọc các báo cáo waste processes (CHỈ 4,5,6)
const wasteReports = allReports.filter(report => {
    // Cùng WS
    if (report.ws !== wsValue) return false;
    
    // CHỈ là waste processes 4,5,6 (KHÔNG bao gồm 7,8,9)
    const wasteOptions = ['4. IN DẶM', '5. IN DẶM + CÁN BÓNG', '6. CÁN BÓNG LẠI'];
    if (!wasteOptions.includes(report.tuy_chon)) return false;
    
    // Cùng điều kiện: mặt sau, số pass in (KHÔNG xét phủ keo cho waste)
    const reportMatSau = report.mat_sau ? true : false;
    if (reportMatSau !== currentMatSau) return false;
    
    if (report.so_pass_in !== currentSoPass) return false;
    
    // 🔧 BỎ ĐIỀU KIỆN PHỦ KEO CHO WASTE PROCESSES

    // Loại trừ báo cáo hiện tại
    if (currentReportId && report.id === currentReportId) return false;

    // Có dữ liệu phế liệu
    return report.phe_lieu && parseFloat(report.phe_lieu) > 0;
});

        // Tính tổng phế liệu (chỉ cột "PL", không phải "Tổng phế liệu")
        const tongPheLieu = wasteReports.reduce((total, report) => {
            return total + (parseFloat(report.phe_lieu) || 0);
        }, 0);

        console.log(`✅ Tổng phế liệu từ ${wasteReports.length} waste processes (4,5,6): ${tongPheLieu}`);
        return tongPheLieu;

    } catch (error) {
        console.error('Lỗi khi lấy tổng phế liệu waste:', error);
        return 0;
    }
}


// Kiểm tra xem có phải là lần cuối cùng của production process trong chu kỳ không
async function checkIfLastProductionInCycle(wsValue, tuychonText) {
    try {
        // Lấy tất cả báo cáo cùng WS, cùng tùy chọn production (1,2,3)
        const response = await fetch('/api/bao-cao-in/list?exclude_stop_only=true');
        if (!response.ok) return true; // Mặc định là lần cuối nếu không lấy được dữ liệu

        const allReports = await response.json();
        
        // Lọc các báo cáo cùng WS và cùng nhóm production (1,2,3)
        const productionReports = allReports.filter(report => {
            if (report.ws !== wsValue) return false;
            
            // Chỉ lấy tùy chọn production (1,2,3)
            const productionOptions = ['1. IN', '2. IN + CÁN BÓNG', '3. CÁN BÓNG'];
            return productionOptions.includes(report.tuy_chon);
        });

        // Lấy báo cáo waste tương ứng
        const wasteMapping = {
            '1. IN': '4. IN DẶM',
            '2. IN + CÁN BÓNG': '5. IN DẶM + CÁN BÓNG', 
            '3. CÁN BÓNG': '6. CÁN BÓNG LẠI'
        };
        
        const correspondingWaste = wasteMapping[tuychonText];
        if (!correspondingWaste) return true;

        // Kiểm tra xem đã có waste process tương ứng chưa
        const hasCorrespondingWaste = allReports.some(report => 
            report.ws === wsValue && report.tuy_chon === correspondingWaste
        );

        // Nếu đã có waste process tương ứng -> đây là lần cuối của production
        console.log(`🔍 Kiểm tra lần cuối: ${tuychonText}, có waste tương ứng: ${hasCorrespondingWaste}`);
        return hasCorrespondingWaste;

    } catch (error) {
        console.error('Lỗi khi kiểm tra lần cuối:', error);
        return true; // Mặc định là lần cuối nếu có lỗi
    }
}


// Lấy tổng phế liệu từ các waste processes tương ứng
async function getTotalWasteFromMatchingProcesses() {
    try {
        const wsValue = getInputValue('ws');
        const tuychonText = getSelectText('tuychon');
        const currentMatSau = getCheckboxValue('matsau');
        const currentPhuKeo = getSelectValue('phukeo');
        const currentSoPass = getSelectText('pass');
        const currentMay = getCurrentMachineId();

        // Map production -> waste processes
        const productionToWasteMap = {
            '1. IN': '4. IN DẶM',
            '2. IN + CÁN BÓNG': '5. IN DẶM + CÁN BÓNG', 
            '3. CÁN BÓNG': '6. CÁN BÓNG LẠI'
        };

        const wasteProcess = productionToWasteMap[tuychonText];
        if (!wasteProcess) return 0;

        // Lấy tất cả báo cáo
        const response = await fetch('/api/bao-cao-in/list?exclude_stop_only=true');
        if (!response.ok) return 0;

        const allReports = await response.json();

        // Lọc các báo cáo waste matching
        const wasteReports = allReports.filter(report => {
            // Cùng WS
            if (report.ws !== wsValue) return false;
            
            // Là waste process tương ứng
            if (report.tuy_chon !== wasteProcess) return false;
            
            // Cùng điều kiện khác
            const reportMatSau = report.mat_sau ? true : false;
            if (reportMatSau !== currentMatSau) return false;
            
            const currentIs2M = currentMay === '2M';
            const reportIs2M = report.may === '2M';
            
            if (currentIs2M && reportIs2M) {
                if (report.phu_keo !== currentPhuKeo) return false;
            } else if (currentIs2M !== reportIs2M) {
                return false;
            }
            
            if (report.so_pass_in !== currentSoPass) return false;

            // Có dữ liệu tổng phế liệu
            return report.tong_phe_lieu && parseFloat(report.tong_phe_lieu) > 0;
        });

        // Lấy giá trị mới nhất (lần cuối)
        if (wasteReports.length > 0) {
            // Sắp xếp theo thời gian tạo và lấy cái mới nhất
            wasteReports.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            const latestWaste = wasteReports[0];
            const totalWaste = parseFloat(latestWaste.tong_phe_lieu) || 0;
            
            console.log(`✅ Lấy phế liệu từ ${wasteProcess}: ${totalWaste}`);
            return totalWaste;
        }

        return 0;

    } catch (error) {
        console.error('Lỗi khi lấy tổng phế liệu từ waste processes:', error);
        return 0;
    }
}


 



// Helper function để chuyển value thành text
function getTextFromValue(value) {
    const map = {
        '1': '1. IN',
        '2': '2. IN + CÁN BÓNG', 
        '3': '3. CÁN BÓNG',
        '4': '4. IN DẶM',
        '5': '5. IN DẶM + CÁN BÓNG',
        '6': '6. CÁN BÓNG LẠI'
    };
    return map[value] || '';
}


// Cập nhật các báo cáo liên quan sau khi submit
async function updateRelatedReportsAfterSubmit() {
    try {
        const wsValue = getInputValue('ws');
        const tuychonValue = getSelectValue('tuychon');
        
        if (!wsValue || !tuychonValue) return;
        
        console.log('🔄 Frontend gọi cập nhật báo cáo liên quan cho WS:', wsValue, 'Tùy chọn:', tuychonValue);
        
        // Gọi API để cập nhật (backend sẽ xử lý logic)
        const response = await fetch('/api/bao-cao-in/update-related-reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ws: wsValue,
                tuychonValue: tuychonValue
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Đã gọi cập nhật báo cáo liên quan:', result.message);
        } else {
            console.warn('⚠️ Không thể cập nhật báo cáo liên quan');
        }
        
    } catch (error) {
        console.warn('Lỗi khi cập nhật báo cáo liên quan:', error);
        // Không throw error để không ảnh hưởng đến flow chính
    }
}






//! ====================================================================================================================================
//! XỬ LÝ DỪNG MÁY
//! ====================================================================================================================================

// Thiết lập xử lý dừng máy
function setupMachineStopHandling() {
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const machineReport = document.getElementById('machineReport');
    const submitStopOnlyButton = document.getElementById('submitStopOnlyButton');
    
    // Ẩn báo cáo dừng máy khi khởi tạo
    if (machineReport) {
        machineReport.style.display = 'none';
    }

    // Ẩn nút "Dừng máy không có WS" ban đầu
    if (submitStopOnlyButton) {
        submitStopOnlyButton.style.display = 'none';
    }

    // XÓA TẤT CẢ EVENT LISTENERS CŨ
    if (btnYes) {
        btnYes.replaceWith(btnYes.cloneNode(true));
    }
    if (btnNo) {
        btnNo.replaceWith(btnNo.cloneNode(true));
    }

    // LẤY LẠI REFERENCES SAU KHI CLONE
    const newBtnYes = document.getElementById('btnYes');
    const newBtnNo = document.getElementById('btnNo');

    // ĐẶT TRẠNG THÁI BAN ĐẦU
    if (newBtnYes) {
        newBtnYes.style.backgroundColor = '';
        newBtnYes.style.color = '';
    }
    if (newBtnNo) {
        newBtnNo.style.backgroundColor = '';
        newBtnNo.style.color = '';
    }
    if (newBtnNo) {  // <-- SỬA: Dùng newBtnNo
        newBtnNo.addEventListener('click', function () {
            machineReport.style.display = 'none';  // <-- SỬA: Ẩn machineReport
            
            // Thiết lập xử lý lý do dừng máy CHỈ MỘT LẦN
            if (!machineReport.hasAttribute('data-setup-done')) {
                setupStopReasonHandling();
                machineReport.setAttribute('data-setup-done', 'true');
            }
            
            // Xóa tất cả các khung lý do dừng máy
            const stopBoxes = document.querySelectorAll('.stop-reason-box');
            stopBoxes.forEach(box => box.remove());
            
            // Cập nhật style cho nút
            newBtnNo.style.backgroundColor = 'rgb(74, 144, 226)';
            newBtnNo.style.color = 'white';
            if (newBtnYes) {
                newBtnYes.style.backgroundColor = '';
                newBtnYes.style.color = '';
            }
            console.log('✅ Không có dừng máy');
    
            // Ẩn nút "Dừng máy không có WS"
            if (submitStopOnlyButton) {
                submitStopOnlyButton.style.display = 'none';
            }
    
            // THÊM: Cập nhật tiến độ sau khi chọn
            setTimeout(() => {
                updateInProgress();
            }, 100);
        });
    }
    

    if (newBtnYes) {
        newBtnYes.addEventListener('click', function () {
            machineReport.style.display = 'block';
            
            // Thiết lập xử lý lý do dừng máy CHỈ MỘT LẦN
            if (!machineReport.hasAttribute('data-setup-done')) {
                setupStopReasonHandling();
                machineReport.setAttribute('data-setup-done', 'true');
            }
            
            // Hiển thị nút "Dừng máy không có WS"
            if (submitStopOnlyButton) {
                submitStopOnlyButton.style.display = 'inline-block';
            }
            
            // Cập nhật style cho nút
            newBtnYes.style.backgroundColor = 'rgb(208, 0, 0)';
            newBtnYes.style.color = 'white';
            if (newBtnNo) {
                newBtnNo.style.backgroundColor = '';
                newBtnNo.style.color = '';
            }
            console.log('Có dừng máy');

            // THÊM: Cập nhật tiến độ sau khi chọn
            setTimeout(() => {
                updateInProgress();
            }, 100);

        });
    }


// Thay thế phần sync cũ trong setupMachineStopHandling()
if (newBtnYes) {
    newBtnYes.addEventListener('click', function() {
        const miniBtn = document.getElementById('miniStopButton');
        const miniText = document.getElementById('miniStopText');
        if (miniBtn && miniText) {
            miniBtn.classList.remove('has-no-stop-selection');
            miniBtn.classList.add('has-stop-selection');
            miniText.innerHTML = 'CÓ DỪNG';
        }
    });
}

if (newBtnNo) {
    newBtnNo.addEventListener('click', function() {
        const miniBtn = document.getElementById('miniStopButton');
        const miniText = document.getElementById('miniStopText');
        if (miniBtn && miniText) {
            miniBtn.classList.remove('has-stop-selection');
            miniBtn.classList.add('has-no-stop-selection');
            miniText.innerHTML = 'KHÔNG DỪNG';
        }
    });
}


}


// Thiết lập xử lý lý do dừng máy
function setupStopReasonHandling() {
    const stopReason = document.getElementById('stopReason');

    if (stopReason) {
        // XÓA EVENT LISTENER CŨ NẾU CÓ
        stopReason.onchange = null;
        
        stopReason.addEventListener('change', function () {
            const reason = this.value;

            if (reason) {
                // Tạo khung lý do dừng máy mới
                createNewStopReasonBox(reason);
                
                // Reset select về trạng thái chưa chọn
                this.selectedIndex = 0;
            }
        });
    }
}



// Tạo khung lý do dừng máy
function createNewStopReasonBox(selectedReason, customBoxId) {
    const container = document.getElementById('additionalReasonsContainer') ||
        document.querySelector('.machine-report');

    if (!container) return;

    // Tạo ID duy nhất cho khung mới
const boxId = customBoxId || 'stopReasonBox_' + Date.now();

    // Tạo HTML cho khung lý do dừng máy
    const boxHTML = `
        <div class="stop-reason-box border rounded p-3 mb-3" id="${boxId}" style="background-color: #f8f9fa;">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="text-danger mb-0">Lý do dừng máy: ${selectedReason}</h5>
                <button class="btn btn-sm btn-danger" onclick="removeStopReasonBox('${boxId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="fw-bold mb-1">Thời gian dừng máy</label>
                    <div class="position-relative">
                        <input type="datetime-local" class="form-control stop-time-input" id="${boxId}_stopTime">
                        <button class="btn btn-primary position-absolute top-0 end-0 h-100" 
                                onclick="setCurrentTime('${boxId}_stopTime', '${boxId}_stopDisplay')" 
                                style="z-index: 10;">
                            Dừng máy
                        </button>
                    </div>
                    <div class="form-text" id="${boxId}_stopDisplay"></div>
                </div>
                
                <div class="col-md-6">
                    <label class="fw-bold mb-1">Thời gian chạy lại</label>
                    <div class="position-relative">
                        <input type="datetime-local" class="form-control resume-time-input" id="${boxId}_resumeTime" >
                        <button class="btn btn-success position-absolute top-0 end-0 h-100" 
                                onclick="setCurrentTime('${boxId}_resumeTime', '${boxId}_resumeDisplay')" 
                                style="z-index: 10;">
                            Chạy lại
                        </button>
                    </div>
                    <div class="form-text" id="${boxId}_resumeDisplay"></div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <label class="fw-bold mb-1">Lý do khác</label>
                    <input type="text" class="form-control other-reason-input" 
                           placeholder="Nhập lý do khác (nếu có)..." id="${boxId}_otherReason">
                </div>
                <div class="col-md-4">
                    <label class="fw-bold mb-1 text-primary">Thời gian dừng máy</label>
                    <input type="text" class="form-control bg-light duration-display" 
                           id="${boxId}_duration" readonly>
                </div>
            </div>
            
            <input type="hidden" class="reason-value" value="${selectedReason}">
        </div>
    `;

    // Thêm vào container
    container.insertAdjacentHTML('beforeend', boxHTML);

    // Thiết lập sự kiện tính thời gian
    setupDurationCalculation(boxId);
}




// Xóa khung lý do dừng máy
function removeStopReasonBox(boxId) {
    const box = document.getElementById(boxId);
    if (box) {
        box.remove();
        updateInProgress();
    }
}

// Đặt thời gian hiện tại
function setCurrentTime(inputId, displayId) {
    const now = new Date();
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);

    if (input) {
        input.value = formatDateTimeLocal(now);
        input.dispatchEvent(new Event('change'));
    }

    if (display) {
        display.textContent = formatDisplayTime(now);
    }

    // Ẩn nút vừa bấm
    const button = document.querySelector(`button[onclick*="${inputId}"]`);
    if (button) {
        button.style.display = 'none';
        console.log(`Đã ẩn nút cho ${inputId}`);
    }

    // Tính thời gian dừng máy
    const boxId = inputId.split('_')[0];
    setTimeout(() => {
        calculateStopDuration(boxId);
    }, 100);
}

// Thiết lập tính thời gian
function setupDurationCalculation(boxId) {
    const stopTimeInput = document.getElementById(boxId + '_stopTime');
    const resumeTimeInput = document.getElementById(boxId + '_resumeTime');

    if (stopTimeInput) {
        stopTimeInput.onchange = function () {
            setTimeout(() => {
                calculateStopDuration(boxId);
            }, 100);
        };
    }

    if (resumeTimeInput) {
        resumeTimeInput.onchange = function () {
            setTimeout(() => {
                calculateStopDuration(boxId);
            }, 100);
        };
    }
}

// Tính thời gian dừng máy
function calculateStopDuration(boxId) {
    const stopTimeInput = document.getElementById(boxId + '_stopTime');
    const resumeTimeInput = document.getElementById(boxId + '_resumeTime');
    const durationDisplay = document.getElementById(boxId + '_duration');

    if (stopTimeInput && resumeTimeInput && durationDisplay) {
        const stopValue = stopTimeInput.value;
        const resumeValue = resumeTimeInput.value;

        if (stopValue && resumeValue) {
            const stopTime = new Date(stopValue);
            const resumeTime = new Date(resumeValue);

            if (resumeTime > stopTime) {
                const diff = resumeTime - stopTime;
                
                // GIỮ NGUYÊN việc tính chi tiết giờ, phút, giây để lưu vào DB
                const totalSeconds = Math.floor(diff / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                
                // SỬA PHẦN HIỂN THỊ: Chỉ hiển thị giờ và phút
                let durationText = '';
                if (hours > 0) {
                    durationText += `${hours} giờ`;
                    if (minutes > 0) {
                        durationText += ` ${minutes} phút`;
                    }
                } else if (minutes > 0) {
                    durationText += `${minutes} phút`;
                } else {
                    durationText = '0 phút'; // Thay vì '0 giây'
                }
                
                durationDisplay.value = durationText.trim();
                
                console.log(`Đã tính thời gian: ${durationText.trim()}`);
            } else {
                durationDisplay.value = '0 phút'; // Thay vì '0 giây'
                console.log('Thời gian chạy lại không lớn hơn thời gian dừng');
            }
        }
    }
}

// Format hiển thị thời gian
function formatDisplayTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    // const seconds = String(date.getSeconds()).padStart(2, '0');

    // THAY ĐỔI: Thêm giây vào hiển thị
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
}




// ====================================================================================================================================
// UTILITY FUNCTIONS
// ====================================================================================================================================

// Lấy giá trị input
function getInputValue(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.value.trim() : '';
}


// Tính tự động SL giấy nhận 1
function calculateSlGiayNhan1() {
    const thanhPhamIn = parseFloat(getInputValue('thanhphamin')) || 0;
    const pheLieu = parseFloat(getInputValue('phelieu')) || 0;
    const pheLieuTrang = parseFloat(getInputValue('phelieutrang')) || 0;
    const giayReam = parseFloat(getInputValue('slgiayream')) || 0;
    
    const total = thanhPhamIn + pheLieu + pheLieuTrang + giayReam;
    setInputValue('slgiaynhan1', total > 0 ? total.toString() : '');
}


// Lấy giá trị select
function getSelectValue(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.value : '';
}

// Lấy text của select
function getSelectText(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return '';
    
    // Kiểm tra element có phải là select không
    if (element.tagName !== 'SELECT') {
        // Nếu là input, trả về value
        return element.value || '';
    }
    
    // Kiểm tra có options không
    if (!element.options || element.selectedIndex < 0) return '';
    
    const selectedOption = element.options[element.selectedIndex];
    return selectedOption ? (selectedOption.text || selectedOption.value || '') : '';
}

// Lấy giá trị checkbox
function getCheckboxValue(elementId) {
    const element = document.getElementById(elementId);
    return element ? element.checked : false;
}

// Lấy tên đầy đủ của user hiện tại
function getCurrentUserFullName() {
    const currentUser = getCurrentUser();
    if (!currentUser) return '';

    if (currentUser.fullname && currentUser.employee_id) {
        return `[${currentUser.employee_id}] ${currentUser.fullname}`;
    } else if (currentUser.fullname) {
        return currentUser.fullname;
    } else {
        return currentUser.username || 'Unknown User';
    }
}

// Format datetime cho input datetime-local
function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}



// Format số theo dạng US (1,000)
function formatNumberUS(num) {
    if (!num || isNaN(num)) return '0';
    return parseFloat(num).toLocaleString('en-US');
}




// Set giá trị cho select với kiểm tra option tồn tại
function setSelectValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element || !value) return;

    // Kiểm tra option có tồn tại không
    const option = element.querySelector(`option[value="${value}"]`);
    if (option) {
        element.value = value;
        console.log(`Đã restore ${elementId}: ${value}`);
    } else {
        console.warn(`Không tìm thấy option với value="${value}" cho ${elementId}`);
        // Thử tìm theo text content
        const options = element.querySelectorAll('option');
        for (let opt of options) {
            if (opt.textContent.includes(value) || opt.value === value) {
                element.value = opt.value;
                console.log(`Đã restore ${elementId} theo text: ${opt.value}`);
                break;
            }
        }
    }
}

// Set giá trị cho checkbox
function setCheckboxValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.checked = value;
    }
}



// Set giá trị cho select theo text content
function setSelectValueByText(elementId, text) {
    const element = document.getElementById(elementId);
    if (!element || !text) return;

    // Tìm option có text khớp
    const options = element.querySelectorAll('option');
    for (let option of options) {
        if (option.textContent.trim() === text.trim()) {
            element.value = option.value;
            console.log(`Đã restore ${elementId} theo text: ${text} -> value: ${option.value}`);
            return;
        }
    }

    console.warn(`Không tìm thấy option với text="${text}" cho ${elementId}`);
}



// Cập nhật tiến độ form
function updateInProgress() {
    const startProgress = calculateInStartProgress();
    const endProgress = calculateInEndProgress();

    updateInStartProgressDisplay(startProgress);
    updateInEndProgressDisplay(endProgress);

    // Debug: Log trạng thái để kiểm tra
console.log('Update progress:', {
    startProgress,
    endProgress, 
    isStarted,
    currentReportId,
    shouldShowStartButton: startProgress === 100 && !isStarted
});

}

// Tính tiến độ phần bắt đầu báo cáo In
function calculateInStartProgress() {
    let filledFields = 0;
    let totalFields = 0;

    // Danh sách các trường bắt buộc ở phần bắt đầu
    const requiredFields = [
        'gioLamViec', 'quandoc', 'ws', 'tuychon', 'phumay1', 'pass', 'sokem', 'phunbot'
    ];

    // Kiểm tra các trường bắt buộc
    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            totalFields++;
            if (element.value && element.value.trim() !== '') {
                filledFields++;
            }
        }
    });

    // Kiểm tra phủ keo nếu tùy chọn có cán bóng
    const tuychonElement = document.getElementById('tuychon');
    const phuKeoElement = document.getElementById('phukeo');

    if (tuychonElement && tuychonElement.value) {
        const tuychonValue = tuychonElement.value;

        // Các tùy chọn có cán bóng: "2", "3", "5", "6"
        const canBongOptions = ['2', '3', '5', '6'];

        if (canBongOptions.includes(tuychonValue)) {
            // Nếu có cán bóng thì phủ keo là bắt buộc
            totalFields++;
            if (phuKeoElement && phuKeoElement.value && phuKeoElement.value !== '') {
                filledFields++;
            }
        }
    }

    return Math.round((filledFields / totalFields) * 100);
}

// Tính tiến độ phần kết thúc báo cáo In
function calculateInEndProgress() {
    let filledFields = 0;
    let totalFields = 0;

    // Danh sách các trường bắt buộc ở phần kết thúc
    const requiredFields = [
        'thanhphamin', 'slgiaynhan1'
    ];

    // Kiểm tra các trường bắt buộc
    requiredFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            totalFields++;
            if (element.value && element.value.trim()) {
                filledFields++;
            }
        }
    });

    // Kiểm tra trạng thái dừng máy
    totalFields++;
    const btnNo = document.getElementById('btnNo');
    const btnYes = document.getElementById('btnYes');

    if ((btnNo && btnNo.style.backgroundColor === 'rgb(74, 144, 226)') ||
        (btnYes && btnYes.style.backgroundColor === 'rgb(208, 0, 0)')) {
        filledFields++;
    }

    return Math.round((filledFields / totalFields) * 100);
}


// Cập nhật hiển thị tiến độ bắt đầu và nút bắt đầu
function updateInStartProgressDisplay(progress) {
    const progressBar = document.querySelector('.progress-bar');
    const startButton = document.querySelector('.btn-success');

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }

    if (!startButton) return;

    // Kiểm tra nếu tiến độ giảm từ 100% xuống dưới 100%
    if (previousStartProgress === 100 && progress < 100 && hasValidStartTime) {
        // Mất thời gian bắt đầu khi tiến độ giảm
        startTime = null;
        hasValidStartTime = false;
        
        // Xóa hiển thị thời gian bắt đầu
        const startTimeElement = document.getElementById('startTime');
        if (startTimeElement) {
            startTimeElement.textContent = '';
        }
        
        console.log('🔄 Tiến độ giảm từ 100% -> Mất thời gian bắt đầu');
    }

    // Cập nhật tiến độ trước đó
    previousStartProgress = progress;

    // Logic hiển thị nút bắt đầu
    if (!hasValidStartTime) {
        // Chưa có thời gian bắt đầu hợp lệ
        if (progress === 100) {
            startButton.textContent = 'Bắt Đầu';
            startButton.classList.remove('btn-warning');
            startButton.classList.add('btn-success');
            startButton.removeAttribute('data-restart-mode');
            startButton.style.display = 'inline-block';
            startButton.disabled = false;
            console.log('✅ Hiện nút Bắt Đầu - tiến độ 100%, chưa có thời gian');
        } else {
            startButton.style.display = 'none';
            console.log('❌ Ẩn nút Bắt Đầu - tiến độ chưa đủ');
        }
    } else {
        // Đã có thời gian bắt đầu hợp lệ -> ẩn nút
        startButton.style.display = 'none';
        console.log('🔒 Ẩn nút Bắt Đầu - đã có thời gian bắt đầu hợp lệ');
    }
}


// Cập nhật hiển thị tiến độ kết thúc và nút xác nhận
function updateInEndProgressDisplay(progress) {
    const confirmButton = document.getElementById('confirmButton');

    if (confirmButton) {
        const hasStarted = isStarted;
        // THÊM: Kiểm tra riêng trạng thái dừng máy
        const dungMaySelected = document.getElementById('btnYes')?.style.backgroundColor === 'rgb(208, 0, 0)' || 
                               document.getElementById('btnNo')?.style.backgroundColor === 'rgb(74, 144, 226)';
        
        // SỬA: Thêm điều kiện dừng máy vào shouldShowButton
        const shouldShowButton = hasStarted && (progress === 100) && dungMaySelected;

        if (shouldShowButton) {
            confirmButton.style.setProperty('display', 'inline-block', 'important');
            confirmButton.classList.add('show');
            confirmButton.disabled = false;
        } else {
            confirmButton.style.setProperty('display', 'none', 'important');
            confirmButton.classList.remove('show');
        }
    }
}



// Thêm chỉ báo trường bắt buộc
function addRequiredIndicator(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Xóa indicator cũ nếu có
    removeRequiredIndicator(elementId);

    // Tạo indicator mới
    const indicator = document.createElement('small');
    indicator.id = `${elementId}_required`;
    indicator.className = 'text-danger fw-bold';
    indicator.textContent = `* ${message}`;
    indicator.style.display = 'block';
    indicator.style.marginTop = '2px';

    // Chèn sau element
    element.parentNode.insertBefore(indicator, element.nextSibling);
}

// Xóa chỉ báo trường bắt buộc
function removeRequiredIndicator(elementId) {
    const indicator = document.getElementById(`${elementId}_required`);
    if (indicator) {
        indicator.remove();
    }
}



// ====================================================================================================================================
// LOADING VÀ UI FUNCTIONS
// ====================================================================================================================================

// Tạo loading overlay cho In
function createInLoadingOverlay() {
    // Kiểm tra nếu đã có overlay
    let overlay = document.getElementById('inLoadingOverlay');
    if (overlay) {
        return overlay;
    }

    overlay = document.createElement('div');
    overlay.id = 'inLoadingOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    overlay.innerHTML = `
        <div style="text-align: center; color: white;">
            <div id="inSpinner" style="
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: inSpin 1s linear infinite;
                margin: 0 auto 20px;
            "></div>
            <h3 id="inLoadingText" style="margin: 0 0 10px 0; color: #007bff;">Đang xử lý báo cáo In...</h3>
            <p id="inProgressText" style="margin: 0; opacity: 0.8;">Vui lòng đợi...</p>
        </div>
    `;

    // Thêm CSS animation
    if (!document.getElementById('inSpinnerStyle')) {
        const style = document.createElement('style');
        style.id = 'inSpinnerStyle';
        style.textContent = `
            @keyframes inSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(overlay);
    return overlay;
}

// Hiển thị loading cho In
function showInLoading(message = 'Đang xử lý báo cáo In...', progress = 'Vui lòng đợi...') {
    const overlay = createInLoadingOverlay();

    const loadingText = document.getElementById('inLoadingText');
    const progressText = document.getElementById('inProgressText');

    if (loadingText) loadingText.textContent = message;
    if (progressText) progressText.textContent = progress;

    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);

    console.log('Đã hiển thị In loading:', message);
}

// Ẩn loading cho In
function hideInLoading() {
    const overlay = document.getElementById('inLoadingOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            console.log('Đã ẩn In loading');
        }, 300);
    }
}

// Cập nhật text loading cho In
function updateInLoadingText(message, progress = '') {
    const loadingText = document.getElementById('inLoadingText');
    const progressText = document.getElementById('inProgressText');

    if (loadingText) loadingText.textContent = message;
    if (progressText && progress) progressText.textContent = progress;
}

// Cập nhật progress bar
function updateProgressBar(percentage) {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
    }
}

// Disable form bắt đầu
function disableStartForm() {
    const disabledFields = [
        'ca', 'truongmay'  // Chỉ disable ca và trưởng máy
    ];

    disabledFields.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.disabled = true;
        }
    });

    // Disable nút bắt đầu
    // const startButton = document.querySelector('.btn-success');
    // if (startButton) {
    //     startButton.disabled = true;
    //     startButton.style.opacity = '0.5';
    //     startButton.style.display = 'none'; // Ẩn nút bắt đầu
    // }
}

// Enable form bắt đầu
function enableStartForm() {
    const enabledFields = [
        'quandoc', 'gioLamViec', 'phumay1', 'phumay2', 'ws', 'tuychon',
        'sokem', 'mau3tone', 'matsau', 'phukeo', 'phunbot'
    ];

    enabledFields.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.disabled = false;
        }
    });

    // Xử lý riêng cho pass in
    const passSelect = document.getElementById('pass');
    if (passSelect && !passSelect.style.backgroundColor) {
        // Chỉ enable nếu không bị cố định (không có background color)
        passSelect.disabled = false;
    }

    // Enable nút bắt đầu
    const startButton = document.querySelector('.btn-success');
    if (startButton) {
        startButton.disabled = false;
        startButton.style.opacity = '1';
    }
}

// ====================================================================================================================================
// FORM STATE MANAGEMENT
// ====================================================================================================================================

// Lưu trạng thái form
function saveFormState() {
    const formState = {
        isStarted: isStarted,
        startTime: startTime ? startTime.toISOString() : null,
        currentReportId: currentReportId,
        machineStopReports: machineStopReports,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('inFormState', JSON.stringify(formState));
    console.log('Đã lưu trạng thái form In');
}

// Khôi phục trạng thái form
function restoreFormState() {
    try {
        const savedState = localStorage.getItem('inFormState');
        if (!savedState) return;

        const formState = JSON.parse(savedState);

        // Kiểm tra nếu state quá cũ (> 24h) thì không khôi phục
        const now = new Date();
        const savedTime = new Date(formState.timestamp);
        const timeDiff = now - savedTime;
        const hoursDiff = timeDiff / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            localStorage.removeItem('inFormState');
            return;
        }

        // Khôi phục trạng thái
        isStarted = formState.isStarted || false;
        startTime = formState.startTime ? new Date(formState.startTime) : null;
        currentReportId = formState.currentReportId || null;
        machineStopReports = formState.machineStopReports || [];

        // Cập nhật trạng thái thời gian bắt đầu
hasValidStartTime = startTime !== null;
console.log('🔄 Khôi phục trạng thái thời gian:', hasValidStartTime ? 'Có' : 'Không');


        if (isStarted && currentReportId) {
            // Kiểm tra báo cáo có thực sự tồn tại trong database không
            fetch(`/api/bao-cao-in/${currentReportId}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Báo cáo không tồn tại');
                    }
                })
                .then(reportData => {
                    // Chỉ khôi phục khi báo cáo thực sự tồn tại
                    document.body.setAttribute('data-report-id', currentReportId);
                    updateUIAfterStart();
                    setTimeout(() => {
                        restoreStartedReportData();
                    }, 500);
                    console.log('Đã khôi phục trạng thái form In đã bắt đầu');
                    // Đảm bảo nút bắt đầu được ẩn sau khi khôi phục
                    setTimeout(() => {
                        const startButton = document.querySelector('.btn-success') || document.querySelector('.btn-warning');
                        if (startButton) {
                            startButton.style.display = 'none';
                        }
                    }, 600);
                })
                .catch(error => {
                    console.warn('Không thể kiểm tra báo cáo, giữ nguyên trạng thái form:', error);
                    // Không reset trạng thái để tránh mất dữ liệu khi có lỗi mạng
                    // Chỉ reset reportId để tránh xung đột
                    currentReportId = null;
                    isStarted = false;
                    startTime = null;
                    
                    // Vẫn cập nhật UI để người dùng có thể tiếp tục làm việc
                    updateInProgress();
                });
        } else if (currentReportId && !isStarted) {
            // Trường hợp có reportId nhưng chưa đánh dấu started - có thể là lỗi
            console.warn('Có reportId nhưng chưa started, xóa trạng thái:', currentReportId);
            currentReportId = null;
            clearFormState();
        }

        updateInProgress();

    } catch (error) {
        console.error('Lỗi khi khôi phục trạng thái form:', error);
        localStorage.removeItem('inFormState');
    }
}

// Xóa trạng thái form
function clearFormState() {
    localStorage.removeItem('inFormState');
    console.log('Đã xóa trạng thái form In');
}


// Lưu dữ liệu form theo máy
function saveFormDataByMachine() {
    const machineId = getCurrentMachineId();
    if (!machineId) return;

    const formData = {
        // Dữ liệu bắt đầu
        quandoc: getSelectValue('quandoc'),
        quandocText: getSelectText('quandoc'), // Lưu thêm text để debug
        ca: getInputValue('ca'),
        gioLamViec: getSelectValue('gioLamViec'),
        truongmay: getInputValue('truongmay'),
        phumay1: getSelectValue('phumay1'),
        phumay1Text: getSelectText('phumay1'),
        phumay2: getSelectValue('phumay2'),
        phumay2Text: getSelectText('phumay2'),
        pass: getSelectValue('pass'),
        passText: getSelectText('pass'),
        passActualValue: document.getElementById('pass')?.value || '', // Lưu value thực tế
        passDisabled: document.getElementById('pass')?.disabled || false, // Lưu trạng thái disabled
        passBackgroundColor: document.getElementById('pass')?.style.backgroundColor || '', // Lưu màu nền
        passAutoSet: document.getElementById('pass')?.hasAttribute('data-auto-set') || false,
        soluongdain: getInputValue('soluongdain'),
        ws: getInputValue('ws'),
        tuychon: getSelectValue('tuychon'),
        sokem: getInputValue('sokem'),
        mau3tone: getCheckboxValue('mau3tone'),
        matsau: getCheckboxValue('matsau'),
        phukeo: getSelectValue('phukeo'),
        phunbot: getInputValue('phunbot'),
        khachhang: getInputValue('khachhang'),
        masp: getInputValue('masp'),
        sldonhang: getInputValue('sldonhang'),
        socon: getInputValue('socon'),
        somau: getInputValue('somau'),
        magiay: getInputValue('magiay'),
        magiay1: getInputValue('magiay1'),
        magiay2: getInputValue('magiay2'),
        magiay3: getInputValue('magiay3'),
        kho: getInputValue('kho'),
        chat: getInputValue('chat'),

        // Thêm trạng thái dừng máy
        dungMayState: {
            btnYes: document.getElementById('btnYes')?.style.backgroundColor || '',
            btnNo: document.getElementById('btnNo')?.style.backgroundColor || '',
            machineReportVisible: document.getElementById('machineReport')?.style.display || 'none'
        },

        // Lưu dữ liệu kết thúc nếu đã bắt đầu báo cáo
        endData: (isStarted || currentReportId) ? {
            canhmay: getInputValue('canhmay'),
            thanhphamin: getInputValue('thanhphamin'),
            phelieu: getInputValue('phelieu'),
            phelieutrang: getInputValue('phelieutrang'),
            slgiayream: getInputValue('slgiayream'),
            slgiaynhan1: getInputValue('slgiaynhan1'),
            slgiaynhan2: getInputValue('slgiaynhan2'),
            slgiaynhan3: getInputValue('slgiaynhan3'),
            ghiChu: getInputValue('ghiChu')
        } : null,

        // Lưu trạng thái báo cáo với thông tin bổ sung
reportState: {
    isStarted: isStarted,
    currentReportId: currentReportId,
    startTime: startTime ? startTime.toISOString() : null,
    lastSaved: new Date().toISOString(), // Thêm thời gian lưu cuối
    formCompleted: false // Đánh dấu form chưa hoàn thành
},

        timestamp: new Date().toISOString()
    };

    const storageKey = `inFormData_${machineId}`;
    localStorage.setItem(storageKey, JSON.stringify(formData));
    console.log(`Đã lưu dữ liệu form cho máy ${machineId}`);
}

// Khôi phục dữ liệu form theo máy
function restoreFormDataByMachine() {
    const machineId = getCurrentMachineId();
    if (!machineId) return;

    try {
        const storageKey = `inFormData_${machineId}`;
        const savedData = localStorage.getItem(storageKey);
        if (!savedData) return;

        const formData = JSON.parse(savedData);

        // Kiểm tra nếu data quá cũ (> 7 ngày) thì không khôi phục
        const now = new Date();
        const savedTime = new Date(formData.timestamp);
        const timeDiff = now - savedTime;
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

        if (daysDiff > 7) {
            localStorage.removeItem(storageKey);
            return;
        }

        // Lưu dữ liệu để khôi phục sau
        window.pendingFormRestore = formData;

        console.log(`Chuẩn bị khôi phục dữ liệu form cho máy ${machineId}`);

    } catch (error) {
        console.error('Lỗi khi khôi phục dữ liệu form theo máy:', error);
        const storageKey = `inFormData_${machineId}`;
        localStorage.removeItem(storageKey);
    }
}

// Thực hiện khôi phục sau khi load xong options
function executeFormRestore() {
    if (!window.pendingFormRestore) return;

    const formData = window.pendingFormRestore;

    try {
        // Khôi phục select fields (bao gồm cả các select có options từ API)
        if (formData.quandoc) setSelectValue('quandoc', formData.quandoc);
        if (formData.gioLamViec) setSelectValue('gioLamViec', formData.gioLamViec);
        if (formData.phumay1) setSelectValue('phumay1', formData.phumay1);
        if (formData.phumay2) setSelectValue('phumay2', formData.phumay2);
        if (formData.tuychon) setSelectValue('tuychon', formData.tuychon);
        if (formData.phukeo) setSelectValue('phukeo', formData.phukeo);

        // Khôi phục pass in với xử lý đặc biệt
        if (formData.passActualValue !== undefined) {
            const passSelect = document.getElementById('pass');
            if (passSelect) {
                // Tạm thời enable và xóa style để có thể set value
                passSelect.disabled = false;
                passSelect.style.backgroundColor = '';

                // Set value chính xác
                passSelect.value = formData.passActualValue;

                // Khôi phục trạng thái đã lưu
                if (formData.passDisabled !== undefined) {
                    passSelect.disabled = formData.passDisabled;
                }
                if (formData.passBackgroundColor) {
                    passSelect.style.backgroundColor = formData.passBackgroundColor;
                }
                if (formData.passAutoSet !== undefined) {
                    if (formData.passAutoSet) {
                        passSelect.setAttribute('data-auto-set', 'true');
                    } else {
                        passSelect.removeAttribute('data-auto-set');
                    }
                }

                console.log(`Restored pass: ${formData.passActualValue}, disabled: ${formData.passDisabled}, autoSet: ${formData.passAutoSet}`);
            }
        }

        // Khôi phục số lượng đã in
        if (formData.soluongdain) setInputValue('soluongdain', formData.soluongdain);

        // Khôi phục dữ liệu WS
        if (formData.khachhang) setInputValue('khachhang', formData.khachhang);
        if (formData.masp) setInputValue('masp', formData.masp);
        if (formData.sldonhang) setInputValue('sldonhang', formData.sldonhang);
        if (formData.socon) setInputValue('socon', formData.socon);
        if (formData.somau) setInputValue('somau', formData.somau);
        if (formData.magiay) setInputValue('magiay', formData.magiay);
        if (formData.magiay1) setInputValue('magiay1', formData.magiay1);
        if (formData.magiay2) setInputValue('magiay2', formData.magiay2);
        if (formData.magiay3) setInputValue('magiay3', formData.magiay3);
        if (formData.kho) setInputValue('kho', formData.kho);
        if (formData.chat) setInputValue('chat', formData.chat);

        // Khôi phục input fields
        if (formData.ws) setInputValue('ws', formData.ws);
        if (formData.sokem) setInputValue('sokem', formData.sokem);
        if (formData.phunbot) setInputValue('phunbot', formData.phunbot);

        // Khôi phục checkbox
        if (formData.mau3tone !== undefined) setCheckboxValue('mau3tone', formData.mau3tone);
        if (formData.matsau !== undefined) setCheckboxValue('matsau', formData.matsau);

        // Khôi phục trạng thái báo cáo nếu có
        if (formData.reportState) {
            if (formData.reportState.isStarted && formData.reportState.currentReportId) {
                isStarted = formData.reportState.isStarted;
                currentReportId = formData.reportState.currentReportId;
                if (formData.reportState.startTime) {
                    startTime = new Date(formData.reportState.startTime);
                }
            }
        }

        // Khôi phục dữ liệu kết thúc nếu đã bắt đầu báo cáo
        if ((isStarted || currentReportId) && formData.endData) {
            if (formData.endData.canhmay) setInputValue('canhmay', formData.endData.canhmay);
            if (formData.endData.thanhphamin) setInputValue('thanhphamin', formData.endData.thanhphamin);
            if (formData.endData.phelieu) setInputValue('phelieu', formData.endData.phelieu);
            if (formData.endData.phelieutrang) setInputValue('phelieutrang', formData.endData.phelieutrang);
            if (formData.endData.slgiayream) setInputValue('slgiayream', formData.endData.slgiayream);
            if (formData.endData.slgiaynhan1) setInputValue('slgiaynhan1', formData.endData.slgiaynhan1);
            if (formData.endData.slgiaynhan2) setInputValue('slgiaynhan2', formData.endData.slgiaynhan2);
            if (formData.endData.slgiaynhan3) setInputValue('slgiaynhan3', formData.endData.slgiaynhan3);
            if (formData.endData.ghiChu) setInputValue('ghiChu', formData.endData.ghiChu);
        }

        // Khôi phục trạng thái dừng máy
        if (formData.dungMayState) {
            const btnYes = document.getElementById('btnYes');
            const btnNo = document.getElementById('btnNo');
            const machineReport = document.getElementById('machineReport');

            if (btnYes && formData.dungMayState.btnYes) {
                btnYes.style.backgroundColor = formData.dungMayState.btnYes;
                btnYes.style.color = 'white';
            }
            if (btnNo && formData.dungMayState.btnNo) {
                btnNo.style.backgroundColor = formData.dungMayState.btnNo;
                btnNo.style.color = 'white';
            }
            if (machineReport && formData.dungMayState.machineReportVisible === 'block') {
                machineReport.style.display = 'block';
            }
        }

        // Trigger các sự kiện cần thiết
        if (formData.gioLamViec) {
            handleGioLamViecChange();
        }
        if (formData.tuychon) {
            handleTuychonChange();
        }


        if (formData.ws) {
            // Delay một chút và chỉ xử lý WS nếu chưa có pass được set
            setTimeout(() => {
                const passSelect = document.getElementById('pass');
                const shouldSkipPassLogic = passSelect && formData.passActualValue !== undefined;

                if (!shouldSkipPassLogic) {
                    handleWSChange();
                } else {
                    // Chỉ xử lý phần khác của WS, không làm ảnh hưởng đến pass
                    const wsInput = document.getElementById('ws');
                    if (wsInput && wsInput.value) {
                        // Chỉ trigger phần populate WS data mà không reset pass
                        console.log('Skipping pass logic during restore');
                    }
                }
            }, 100);
        }

        // Xóa dữ liệu pending
        delete window.pendingFormRestore;

        console.log(`Đã khôi phục dữ liệu form cho máy ${getCurrentMachineId()}`);

        // Cập nhật tiến độ sau khi restore
setTimeout(() => {
    updateInProgress();
    // Lưu lại dữ liệu sau khi restore để đảm bảo không mất
    saveFormDataByMachine();
}, 200);

    } catch (error) {
        console.error('Lỗi khi thực hiện khôi phục form:', error);
        delete window.pendingFormRestore;
    }
}




// Khôi phục báo cáo chờ về form
function restoreWaitingReportToForm(waitingReport) {
    try {
        // Set các giá trị cơ bản
        if (waitingReport.quan_doc) setSelectValueByText('quandoc', waitingReport.quan_doc);
        if (waitingReport.ca) setInputValue('ca', waitingReport.ca);
        if (waitingReport.gio_lam_viec) setSelectValueByText('gioLamViec', waitingReport.gio_lam_viec);
        if (waitingReport.ma_ca) setInputValue('maCa', waitingReport.ma_ca);
        if (waitingReport.truong_may) setInputValue('truongmay', waitingReport.truong_may);
        if (waitingReport.phu_may_1) setSelectValueByText('phumay1', waitingReport.phu_may_1);
        if (waitingReport.phu_may_2) setSelectValueByText('phumay2', waitingReport.phu_may_2);
        
        // Set dữ liệu WS và các trường liên quan
        if (waitingReport.ws) setInputValue('ws', waitingReport.ws);
        if (waitingReport.tuy_chon) setSelectValueByText('tuychon', waitingReport.tuy_chon);
        if (waitingReport.so_kem) setInputValue('sokem', waitingReport.so_kem.toString());
        if (waitingReport.mau_3_tone) setCheckboxValue('mau3tone', waitingReport.mau_3_tone === 'on');
        if (waitingReport.mat_sau) setCheckboxValue('matsau', waitingReport.mat_sau === 'on');
        if (waitingReport.phu_keo) setSelectValue('phukeo', waitingReport.phu_keo);
        if (waitingReport.phun_bot) setInputValue('phunbot', waitingReport.phun_bot.toString());
        if (waitingReport.so_pass_in) {
            const passSelect = document.getElementById('pass');
            if (passSelect) {
                if (waitingReport.so_pass_in.includes('1 PASS')) {
                    passSelect.value = '1';
                } else if (waitingReport.so_pass_in.includes('2 PASS')) {
                    passSelect.value = '2';
                }
            }
        }
        
        // Set thời gian bắt đầu
        if (waitingReport.thoi_gian_bat_dau) {
            startTime = new Date(waitingReport.thoi_gian_bat_dau);
            hasValidStartTime = true;
            const startTimeElement = document.getElementById('startTime');
            if (startTimeElement) {
                startTimeElement.textContent = startTime.toLocaleString('vi-VN');
            }
        }
        
        // Set trạng thái đã bắt đầu
        isStarted = true;
        currentReportId = waitingReport.bao_cao_chinh_id;
        
        // Cập nhật UI
        updateUIAfterStart();
        
        // Trigger WS change để load dữ liệu WS
        if (waitingReport.ws) {
            setTimeout(() => {
                handleWSChange();
            }, 500);
        }
        
        console.log('Đã khôi phục báo cáo chờ vào form');
        
    } catch (error) {
        console.error('Lỗi khi khôi phục báo cáo chờ:', error);
    }
}

// Load card danh sách chờ
async function loadWaitingListCard() {
    const machineId = getCurrentMachineId();
    if (!machineId) return;
    
    try {
        const response = await fetch(`/api/bao-cao-in/cho/list/${machineId}`);
        if (response.ok) {
            const waitingList = await response.json();
            if (waitingList && waitingList.length > 0) {
                showWaitingListCard(waitingList);
            }
        }
    } catch (error) {
        console.error('Lỗi khi load danh sách chờ:', error);
    }
}

// Hiển thị card danh sách chờ
function showWaitingListCard(waitingList) {
    const card = document.getElementById('waitingListCard');
    const content = document.getElementById('waitingListContent');
    
    let html = '';
    waitingList.forEach(item => {
        html += `
            <div class="border rounded p-2 mb-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>WS: ${item.ws || 'Không có'}</strong><br>
                        <small>${item.tuy_chon || ''} - ${formatDateTime(item.thoi_gian_bat_dau)}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-primary me-1" onclick="loadWaitingReport('${item.id}')">
                            Tiếp tục
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteWaitingReport('${item.id}')">
                            Xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    content.innerHTML = html;
    card.classList.remove('d-none');
}


// Xóa dữ liệu form theo máy
function clearFormDataByMachine() {
    const machineId = getCurrentMachineId();
    if (!machineId) return;

    const storageKey = `inFormData_${machineId}`;
    localStorage.removeItem(storageKey);
    console.log(`Đã xóa dữ liệu form cho máy ${machineId}`);
}

// ====================================================================================================================================
// RESET VÀ SCROLL FUNCTIONS
// ====================================================================================================================================

// Xử lý reset form
async function handleResetForm() {
    const confirmed = confirm('Bạn có chắc chắn muốn chạy lại phiếu? Tất cả dữ liệu hiện tại sẽ bị xóa.');

    if (confirmed) {
        resetFormAndScrollToTop();
    }
}

// Reset form và scroll về đầu
function resetFormAndScrollToTop() {
    console.log('Bắt đầu reset form và scroll về đầu...');

// Reset trạng thái
isStarted = false;
startTime = null;
hasValidStartTime = false;
previousStartProgress = 0;
currentReportId = null;
machineStopReports = [];

    // Xóa report ID
    document.body.removeAttribute('data-report-id');

    // Reset form elements
    resetAllFormElements();

    // Enable form
    enableStartForm();

    // Ẩn nút xác nhận
    const confirmButton = document.getElementById('confirmButton');
    if (confirmButton) {
        confirmButton.style.display = 'none';
        confirmButton.classList.remove('show');
    }

    // Reset progress bar
    updateProgressBar(0);

    // Cập nhật tiến độ form
    updateInProgress();

    // Xóa thời gian bắt đầu
    const startTimeElement = document.getElementById('startTime');
    if (startTimeElement) {
        startTimeElement.textContent = '';
    }

    // Xóa trạng thái lưu
    clearFormState();

    // Scroll về đầu trang
    scrollToTopSmooth();

    // Focus vào trường đầu tiên
    const firstInput = document.getElementById('quandoc');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 500);
    }

    showNotification('Đã reset form thành công', 'success');
    console.log('✅ Đã reset form và scroll về đầu trang');





}


// Reset form nhưng giữ lại các trường người dùng
function resetFormButKeepUserFields() {
    console.log('Bắt đầu reset form nhưng giữ lại trường người dùng...');

    // Lưu các giá trị cần giữ lại
    const preservedValues = {
        ca: getInputValue('ca'),
        quandoc: getSelectValue('quandoc'),
        gioLamViec: getSelectValue('gioLamViec'),
        maCa: getInputValue('maCa'),
        phumay1: getSelectValue('phumay1'),
        phumay2: getSelectValue('phumay2')
    };

// Reset trạng thái
isStarted = false;
startTime = null;
hasValidStartTime = false;
previousStartProgress = 0;
currentReportId = null;
machineStopReports = [];

    // Xóa report ID
    document.body.removeAttribute('data-report-id');

// Reset nút bắt đầu về trạng thái ban đầu (ẩn, chờ tiến độ 100%)
const startButton = document.querySelector('.btn-success') || document.querySelector('.btn-warning');
if (startButton) {
    startButton.textContent = 'Bắt Đầu';
    startButton.classList.remove('btn-warning');
    startButton.classList.add('btn-success');
    startButton.style.display = 'none'; // Ẩn đi, chờ tiến độ 100%
    startButton.removeAttribute('data-restart-mode');
    startButton.disabled = false;
    startButton.style.opacity = '1';
}

    // Reset form elements
    resetAllFormElements();


    // Khôi phục các giá trị đã lưu
    if (preservedValues.ca) setInputValue('ca', preservedValues.ca);
    if (preservedValues.quandoc) setSelectValue('quandoc', preservedValues.quandoc);
    if (preservedValues.gioLamViec) setSelectValue('gioLamViec', preservedValues.gioLamViec);
    if (preservedValues.maCa) setInputValue('maCa', preservedValues.maCa);
    if (preservedValues.phumay1) setSelectValue('phumay1', preservedValues.phumay1);
    if (preservedValues.phumay2) setSelectValue('phumay2', preservedValues.phumay2);

    // Enable form
    enableStartForm();

    // Ẩn nút xác nhận
    const confirmButton = document.getElementById('confirmButton');
    if (confirmButton) {
        confirmButton.style.display = 'none';
        confirmButton.classList.remove('show');
    }

    // Reset progress bar
    updateProgressBar(0);

    // Cập nhật tiến độ form
    updateInProgress();

    // Xóa thời gian bắt đầu
    const startTimeElement = document.getElementById('startTime');
    if (startTimeElement) {
        startTimeElement.textContent = '';
    }

    // Xóa trạng thái báo cáo nhưng giữ lại dữ liệu form
    clearFormState();
    // Lưu lại dữ liệu các trường được giữ lại
    setTimeout(() => {
        saveFormDataByMachine();
    }, 100);

    // Scroll về đầu trang
    scrollToTopSmooth();

    // Focus vào trường WS
    const wsInput = document.getElementById('ws');
    if (wsInput) {
        setTimeout(() => wsInput.focus(), 500);
    }



     // THÊM: Reset trạng thái dừng máy
     const btnYes = document.getElementById('btnYes');
     const btnNo = document.getElementById('btnNo');
     const machineReport = document.getElementById('machineReport');
     
     if (btnYes) {
         btnYes.style.backgroundColor = '';
         btnYes.style.color = '';
     }
     if (btnNo) {
         btnNo.style.backgroundColor = '';
         btnNo.style.color = '';
     }
     if (machineReport) {
         machineReport.style.display = 'none';
         // THÊM: Xóa attribute setup để có thể setup lại
         machineReport.removeAttribute('data-setup-done');
     }
     
     // THÊM: Xóa tất cả các khung lý do dừng máy
     const stopBoxes = document.querySelectorAll('.stop-reason-box');
     stopBoxes.forEach(box => box.remove());
     
     // THÊM: Reset select lý do về ban đầu
     const stopReasonSelect = document.getElementById('stopReason');
     if (stopReasonSelect) {
         stopReasonSelect.selectedIndex = 0;
     }

    showNotification('Đã reset form thành công', 'success');
    console.log('✅ Đã reset form và giữ lại trường người dùng');
    


}

// Reset tất cả elements trong form
function resetAllFormElements() {
    // Reset input fields
    const inputFields = [
        'ws', 'sokem', 'phunbot', 'canhmay', 'thanhphamin',
        'phelieu', 'phelieutrang', 'slgiayream', 'slgiaynhan1',
        'slgiaynhan2', 'slgiaynhan3', 'ghiChu', 'pass'
    ];

    inputFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = '';
        }
    });

    // Reset select fields  
    const selectFields = [
        'tuychon', 'phukeo', 'pass'
    ];

    selectFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.selectedIndex = 0;
        }
    });

    // Reset checkboxes
    const checkboxFields = ['mau3tone', 'matsau'];

    checkboxFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.checked = false;
        }
    });

    // Xóa dữ liệu form theo máy khi reset
    clearFormDataByMachine();

    // Clear WS data
    clearWSData();

    // Reset dừng máy
    const machineReport = document.getElementById('machineReport');
    if (machineReport) {
        machineReport.style.display = 'none';
    }


    // Reset nút Có/Không dừng máy
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    if (btnYes) {
        btnYes.style.backgroundColor = '';
        btnYes.style.color = '';
    }
    if (btnNo) {
        btnNo.style.backgroundColor = '';
        btnNo.style.color = '';
    }



// Thay thế phần reset cũ
const miniBtn = document.getElementById('miniStopButton');
const miniText = document.getElementById('miniStopText');
if (miniBtn && miniText) {
    miniBtn.classList.remove('has-stop-selection', 'has-no-stop-selection', 'moved-down', 'moved-up');
    miniText.innerHTML = 'DỪNG MÁY';
}



}

// Scroll mượt về đầu trang
function scrollToTopSmooth() {
    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        // Fallback cho browser cũ
        let currentScroll = window.pageYOffset;
        const scrollStep = Math.PI / (500 / 15);
        const cosParameter = currentScroll / 2;
        let scrollCount = 0;
        let scrollMargin;

        function step() {
            setTimeout(() => {
                if (window.pageYOffset !== 0) {
                    scrollCount += 1;
                    scrollMargin = cosParameter - cosParameter * Math.cos(scrollCount * scrollStep);
                    window.scrollTo(0, currentScroll - scrollMargin);
                    step();
                }
            }, 15);
        }
        step();
    }
}

// ====================================================================================================================================
// THỜI GIAN VÀ HIỂN THỊ
// ====================================================================================================================================

// Thiết lập hiển thị thời gian
function setupTimeDisplay() {
    // Có thể thêm logic hiển thị thời gian real-time nếu cần
}

// Thiết lập form validation
function setupFormValidation() {
    // Có thể thêm logic validation nâng cao nếu cần
}

// ====================================================================================================================================
// NOTIFICATION SYSTEM
// ====================================================================================================================================

// Hiển thị thông báo
function showNotification(message, type = 'info') {
    // Tạo element notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${getBootstrapAlertClass(type)} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
    `;

    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Tự động ẩn sau 5 giây
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);

    console.log(`Notification [${type}]: ${message}`);
}

// Chuyển đổi type thành class Bootstrap
function getBootstrapAlertClass(type) {
    switch (type) {
        case 'success': return 'success';
        case 'error': return 'danger';
        case 'warning': return 'warning';
        case 'info': return 'info';
        default: return 'info';
    }
}

// ====================================================================================================================================
// DANH SÁCH BÁO CÁO VÀ TÌM KIẾM
// ====================================================================================================================================

// Thiết lập events cho tìm kiếm và lọc
function setupSearchAndFilterEvents() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            filterReportList();
        }, 500));
    }

    // Filter buttons
    const btnSearch = document.getElementById('btnSearch');
    if (btnSearch) {
        btnSearch.addEventListener('click', filterReportList);
    }

    // Export Excel
    const btnExportExcel = document.getElementById('btnExportExcel');
    if (btnExportExcel) {
        btnExportExcel.addEventListener('click', exportToExcel);
    }


    // Items per page cho dừng máy
const itemsPerStopPageSelect = document.getElementById('itemsPerStopPage');
if (itemsPerStopPageSelect) {
    itemsPerStopPageSelect.addEventListener('change', function () {
        stopReportList.itemsPerPage = parseInt(this.value);
        stopReportList.currentPage = 1;
        renderStopReportTable();
        updateStopPagination();
    });
}


    // Pagination
    setupPaginationEvents();

}

// Tải danh sách báo cáo In
async function loadReportList() {
    try {
        console.log('Đang tải danh sách báo cáo In...');

        showLoadingInTable(true);

        const response = await fetch('/api/bao-cao-in/list?exclude_stop_only=true', {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error('Không thể tải danh sách báo cáo In');
        }

        const data = await response.json();

        reportList.data = data;
        reportList.filteredData = data;


        // Sắp xếp theo STT giảm dần (mới nhất lên đầu)
reportList.data.sort((a, b) => {
    return (b.stt || 0) - (a.stt || 0);
});

// Cập nhật lại filteredData sau khi sắp xếp
reportList.filteredData = [...reportList.data];

        renderReportTable();
        updatePagination();

        showLoadingInTable(false);

        console.log(`Đã tải ${data.length} báo cáo In`);

    } catch (error) {
        console.error('Lỗi khi tải danh sách báo cáo In:', error);
        showLoadingInTable(false);
        showNotification('Lỗi khi tải danh sách báo cáo', 'error');
    }


    // Khởi tạo chức năng ẩn cột sau khi load xong
    setTimeout(() => {
        initializeColumnHiding();
    }, 200);


}

// Hiển thị loading trong bảng
function showLoadingInTable(show) {
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;

    if (show) {
        tbody.innerHTML = `
            <tr>
                <td colspan="100%" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                    <div class="mt-2">Đang tải dữ liệu...</div>
                </td>
            </tr>
        `;
    }
}

// Render bảng báo cáo
function renderReportTable() {
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;

    const startIndex = (reportList.currentPage - 1) * reportList.itemsPerPage;
    const endIndex = startIndex + reportList.itemsPerPage;
    const pageData = reportList.filteredData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="100%" class="text-center py-4">
                    <div class="text-muted">Không có dữ liệu</div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pageData.map(report => `
        <tr class="${report.is_started_only ? 'table-warning' : ''}">
            <td class="text-nowrap">
                <button class="btn btn-sm btn-info me-1" onclick="viewReport('${report.id}')" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteReport('${report.id}')" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
            <td>${report.stt || ''}</td>
            <td>${formatDate(report.ngay) || ''}</td>
            <td><strong>${report.may || ''}</strong></td>
            <td>${report.quan_doc || ''}</td>
            <td>${report.ca || ''}</td>
            <td>${report.truong_may || ''}</td>
            <td><strong class="text-primary">${report.ws || ''}</strong></td>
            <td>${report.so_lan_chay || ''}</td>
            <td>${formatDate(report.ngay_phu) || ''}</td>
            <td>${report.khach_hang || ''}</td>
            <td>${report.ma_sp || ''}</td>
            <td>${report.sl_don_hang ? formatNumberUS(report.sl_don_hang) :  ''}</td>
            <td>${report.so_con || ''}</td>
            <td>${report.so_mau || ''}</td>
            <td>${report.ma_giay_1 || ''}</td>
            <td>${report.ma_giay_2 || ''}</td>
            <td>${report.ma_giay_3 || ''}</td>
            <td>${report.kho || ''}</td>
            <td>${report.dai_giay || ''}</td>
            <td>${report.tuy_chon || ''}</td>
            <td>${report.mau_3_tone ? 'On' : ''}</td>
            <td>${report.sl_giay_tt_1 ? formatNumberUS(report.sl_giay_tt_1) :  ''}</td>
            <td>${report.sl_giay_tt_2 ? formatNumberUS(report.sl_giay_tt_2) :  ''}</td>
            <td>${report.sl_giay_tt_3 ? formatNumberUS(report.sl_giay_tt_3) :  ''}</td>
            <td>${report.so_kem || ''}</td>
            <td>${report.mat_sau ? 'On' : ''}</td>
            <td>${report.phu_keo || ''}</td>
            <td>${report.phun_bot || '0'}%</td>
            <td>${report.thoi_gian_canh_may || ''}</td>
            <td class="${report.thoi_gian_bat_dau ? 'text-success fw-bold' : ''}">${formatDateTime(report.thoi_gian_bat_dau) || ''}</td>
            <td class="${report.thoi_gian_ket_thuc ? 'text-danger fw-bold' : ''}">${formatDateTime(report.thoi_gian_ket_thuc) || ''}</td>
            <td =>${report.thanh_pham_in ? formatNumberUS(report.thanh_pham_in) : ''}</td>
            <td =>${report.phe_lieu || ''}</td>
            <td>${report.phe_lieu_trang || ''}</td>
            <td style= "word-wrap: break-word; ">${report.ghi_chu || ''}</td>
            <td class="fw-bold">${report.tong_so_luong ? formatNumberUS(report.tong_so_luong) : ''}</td>
            <td =>${report.tong_phe_lieu || ''}</td>
            <td>${report.tong_phe_lieu_trang || ''}</td>
            <td>${report.sl_giay_ream || ''}</td>
            <td>${report.tuan || ''}</td>
            <td>${report.gio_lam_viec || ''}</td>
            <td>${report.ma_ca || ''}</td>
            <td>${report.sl_giay_theo_ws ? formatNumberUS(report.sl_giay_theo_ws) :  ''}</td>
            <td>${report.sl_cat ? formatNumberUS(report.sl_cat) :  ''}</td>
            <td>${report.chenh_lech_tt_ws || ''}</td>
            <td>${report.chenh_lech_tt_scc || ''}</td>
            <td>${report.phu_may_1 || ''}</td>
            <td>${report.phu_may_2 || ''}</td>
            <td>${report.so_pass_in || ''}</td>
            <td>${report.thanh_pham ? formatNumberUS(report.thanh_pham) :  ''}</td>
        </tr>
    `).join('');
    // Cập nhật thông tin trang
    updatePageInfo();


    // Đảm bảo table có thể scroll và sticky hoạt động
    const tableContainer = document.querySelector('.table-responsive');
    if (tableContainer) {
        tableContainer.style.position = 'relative';
        tableContainer.style.overflowX = 'auto';
    }


    // Áp dụng cố định cột và ẩn cột sau khi render
    setTimeout(() => {
        applyColumnVisibility();
        if (fixedColumns.length > 0) {
            applyFixedColumns();
        }
    }, 100);


}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';

    try {
        let date;
        
        // Xử lý nhiều định dạng ngày
        if (dateString.includes('-')) {
            // Format yyyy-mm-dd từ database
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // Month is 0-indexed
                const day = parseInt(parts[2]);
                date = new Date(year, month, day);
            } else {
                date = new Date(dateString);
            }
        } else {
            date = new Date(dateString);
        }
        
        // Kiểm tra ngày hợp lệ
        if (isNaN(date.getTime())) {
            return dateString; // Trả về giá trị gốc nếu không parse được
        }
        
        return date.toLocaleDateString('vi-VN'); // Hiển thị dạng dd/mm/yyyy
    } catch (error) {
        console.warn('Lỗi format ngày:', error, 'Input:', dateString);
        return dateString; // Trả về giá trị gốc nếu có lỗi
    }
}


// Format datetime với định dạng yyyy-mm-dd hh:mm:ss
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';

    try {
        let date;
        
        // Xử lý cả ISO string và format từ database
        if (dateTimeString.includes('T')) {
            // ISO format: 2024-01-15T10:30:00.000Z
            date = new Date(dateTimeString);
        } else if (dateTimeString.includes('-') && dateTimeString.includes(':')) {
            // Format từ database: 2024-01-15 10:30:00
            date = new Date(dateTimeString);
        } else {
            date = new Date(dateTimeString);
        }
        
        if (isNaN(date.getTime())) {
            return dateTimeString; // Trả về giá trị gốc nếu không parse được
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
        console.warn('Lỗi format datetime:', error, 'Input:', dateTimeString);
        return dateTimeString; // Trả về giá trị gốc nếu có lỗi
    }
}


// ====================================================================================================================================
// PAGINATION
// ====================================================================================================================================

// Thiết lập events cho pagination
function setupPaginationEvents() {
    // Items per page
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', function () {
            reportList.itemsPerPage = parseInt(this.value);
            reportList.currentPage = 1;
            renderReportTable();
            updatePagination();
        });
    }

    // Pagination buttons
    const firstPageBtn = document.getElementById('firstPage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const lastPageBtn = document.getElementById('lastPage');

    if (firstPageBtn) {
        firstPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage(1);
        });
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (reportList.currentPage > 1) {
                goToPage(reportList.currentPage - 1);
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (reportList.currentPage < reportList.totalPages) {
                goToPage(reportList.currentPage + 1);
            }
        });
    }

    if (lastPageBtn) {
        lastPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage(reportList.totalPages);
        });
    }


    // Pagination cho dừng máy
const firstStopPageBtn = document.getElementById('firstStopPage');
const prevStopPageBtn = document.getElementById('prevStopPage');
const nextStopPageBtn = document.getElementById('nextStopPage');
const lastStopPageBtn = document.getElementById('lastStopPage');

if (firstStopPageBtn) {
    firstStopPageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToStopPage(1);
    });
}

if (prevStopPageBtn) {
    prevStopPageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (stopReportList.currentPage > 1) {
            goToStopPage(stopReportList.currentPage - 1);
        }
    });
}

if (nextStopPageBtn) {
    nextStopPageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (stopReportList.currentPage < stopReportList.totalPages) {
            goToStopPage(stopReportList.currentPage + 1);
        }
    });
}

if (lastStopPageBtn) {
    lastStopPageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToStopPage(stopReportList.totalPages);
    });
}



}

// Chuyển đến trang
function goToPage(page) {
    if (page < 1 || page > reportList.totalPages) return;

    reportList.currentPage = page;
    renderReportTable();
    updatePagination();
}

// Cập nhật pagination
function updatePagination() {
    reportList.totalPages = Math.ceil(reportList.filteredData.length / reportList.itemsPerPage);

    // Cập nhật trạng thái buttons
    const firstPageBtn = document.getElementById('firstPage');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const lastPageBtn = document.getElementById('lastPage');

    const canGoPrev = reportList.currentPage > 1;
    const canGoNext = reportList.currentPage < reportList.totalPages;

    if (firstPageBtn) firstPageBtn.parentElement.classList.toggle('disabled', !canGoPrev);
    if (prevPageBtn) prevPageBtn.parentElement.classList.toggle('disabled', !canGoPrev);
    if (nextPageBtn) nextPageBtn.parentElement.classList.toggle('disabled', !canGoNext);
    if (lastPageBtn) lastPageBtn.parentElement.classList.toggle('disabled', !canGoNext);

    // Cập nhật page numbers (tạo động các nút số trang)
    updatePageNumbers();
}

// Cập nhật số trang
function updatePageNumbers() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    // Xóa các nút số trang cũ
    const pageNumbers = pagination.querySelectorAll('.page-number');
    pageNumbers.forEach(btn => btn.remove());

    // Thêm các nút số trang mới
    const nextPageBtn = document.getElementById('nextPage');
    if (!nextPageBtn) return;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, reportList.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(reportList.totalPages, startPage + maxVisiblePages - 1);

    // Điều chỉnh startPage nếu endPage đã đạt max
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item page-number ${i === reportList.currentPage ? 'active' : ''}`;

        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage(i);
        });

        pageItem.appendChild(pageLink);
        nextPageBtn.parentElement.before(pageItem);
    }
}

// Cập nhật thông tin trang
function updatePageInfo() {
    const pageInfo = document.getElementById('pageInfo');
    const totalItems = document.getElementById('totalItems');

    if (pageInfo) {
        const startIndex = (reportList.currentPage - 1) * reportList.itemsPerPage + 1;
        const endIndex = Math.min(startIndex + reportList.itemsPerPage - 1, reportList.filteredData.length);

        pageInfo.textContent = `Hiển thị ${startIndex}-${endIndex} của ${reportList.filteredData.length}`;
    }

    if (totalItems) {
        totalItems.textContent = `Tổng số: ${reportList.filteredData.length} bản ghi`;
    }
}

// ====================================================================================================================================
// SEARCH VÀ FILTER
// ====================================================================================================================================

// Lọc danh sách báo cáo
function filterReportList() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
    const machineFilter = document.getElementById('mayFilter')?.value || '';

    reportList.filteredData = reportList.data.filter(report => {
        // Tìm kiếm text
        const searchMatch = !searchTerm ||
            (report.ws && report.ws.toLowerCase().includes(searchTerm)) ||
            (report.khach_hang && report.khach_hang.toLowerCase().includes(searchTerm)) ||
            (report.ma_sp && report.ma_sp.toLowerCase().includes(searchTerm)) ||
            (report.truong_may && report.truong_may.toLowerCase().includes(searchTerm)) ||
            (report.ghi_chu && report.ghi_chu.toLowerCase().includes(searchTerm));

        // Lọc theo máy
        const machineMatch = !machineFilter || report.may === machineFilter;

        return searchMatch && machineMatch;
    });

    // Reset về trang đầu
    reportList.currentPage = 1;

    // Render lại
    renderReportTable();
    updatePagination();

    console.log(`Lọc báo cáo: ${reportList.filteredData.length}/${reportList.data.length} kết quả`);
}

// Setup date filter
function setupDateFilter() {
    const btnDateFilter = document.getElementById('btnDateFilter');
    const btnClearDateFilter = document.getElementById('btnClearDateFilter');

    if (btnDateFilter) {
        btnDateFilter.addEventListener('click', applyDateFilter);
    }

    if (btnClearDateFilter) {
        btnClearDateFilter.addEventListener('click', clearDateFilter);
    }
}

// Áp dụng lọc theo ngày
function applyDateFilter() {
    const startDateFilter = document.getElementById('startDateFilter')?.value;
    const endDateFilter = document.getElementById('endDateFilter')?.value;

    if (!startDateFilter && !endDateFilter) {
        showNotification('Vui lòng chọn ngày để lọc', 'warning');
        return;
    }

    reportList.filteredData = reportList.data.filter(report => {
        if (!report.ngay) return false;

        const reportDate = new Date(report.ngay);
        let match = true;

        if (startDateFilter) {
            const startDate = new Date(startDateFilter);
            match = match && reportDate >= startDate;
        }

        if (endDateFilter) {
            const endDate = new Date(endDateFilter);
            match = match && reportDate <= endDate;
        }

        return match;
    });

    reportList.currentPage = 1;
    renderReportTable();
    updatePagination();

    showNotification(`Đã lọc theo ngày: ${reportList.filteredData.length} kết quả`, 'success');
}

// Xóa lọc ngày
function clearDateFilter() {
    document.getElementById('startDateFilter').value = '';
    document.getElementById('endDateFilter').value = '';

    reportList.filteredData = [...reportList.data];
    reportList.currentPage = 1;
    renderReportTable();
    updatePagination();

    showNotification('Đã xóa bộ lọc ngày', 'info');
}

// ====================================================================================================================================
// EXPORT EXCEL
// ====================================================================================================================================

// Xuất Excel
function exportToExcel() {
    try {
        if (!window.XLSX) {
            showNotification('Thư viện XLSX chưa được tải', 'error');
            return;
        }

        if (reportList.filteredData.length === 0) {
            showNotification('Không có dữ liệu để xuất', 'warning');
            return;
        }

        console.log('Bắt đầu xuất Excel với', reportList.filteredData.length, 'bản ghi');

        // Chuẩn bị dữ liệu
        const excelData = reportList.filteredData.map(report => ({
            'STT': report.stt || '',
            'Ngày': formatDate(report.ngay) || '',
            'Máy': report.may || '',
            'Quản đốc': report.quan_doc || '',
            'Ca': report.ca || '',
            'Trưởng máy': report.truong_may || '',
            'Số WS': report.ws || '',
            'Số lần chạy': report.so_lan_chay || '',
            'Ngày phụ': formatDate(report.ngay_phu) || '',
            'Khách hàng': report.khach_hang || '',
            'Mã sản phẩm': report.ma_sp || '',
            'Số con': report.so_con || '',
            'SL đơn hàng': report.sl_don_hang || '',
            'Số màu': report.so_mau || '',
            'Mã giấy 1': report.ma_giay_1 || '',
            'Mã giấy 2': report.ma_giay_2 || '',
            'Mã giấy 3': report.ma_giay_3 || '',
            'Khổ': report.kho || '',
            'Dài giấy': report.dai_giay || '',
            'Tùy chọn': report.tuy_chon || '',
            'Mẫu 3 tone': report.mau_3_tone ? 'On' : '',
            'SL giấy TT 1': report.sl_giay_tt_1 || '',
            'SL giấy TT 2': report.sl_giay_tt_2 || '',
            'SL giấy TT 3': report.sl_giay_tt_3 || '',
            'Số kẽm': report.so_kem || '',
            'Mặt sau': report.mat_sau ? 'On' : '',
            'Phủ keo': report.phu_keo || '',
            'Phun bột (%)': report.phun_bot || '',
            'TG canh máy': report.thoi_gian_canh_may || '',
            'TG bắt đầu': formatDateTime(report.thoi_gian_bat_dau) || '',
            'TG kết thúc': formatDateTime(report.thoi_gian_ket_thuc) || '',
            'Thành phẩm in': report.thanh_pham_in || '',
            'Phế liệu': report.phe_lieu || '',
            'PL trắng': report.phe_lieu_trang || '',
            'Ghi chú': report.ghi_chu || '',
            'Tổng số lượng': report.tong_so_luong || '',
            'Tổng phế liệu': report.tong_phe_lieu || '',
            'Tổng PL trắng': report.tong_phe_lieu_trang || '',
            'SL giấy ream': report.sl_giay_ream || '',
            'Tuần': report.tuan || '',
            'Giờ làm việc': report.gio_lam_viec || '',
            'SL giấy theo WS': report.sl_giay_theo_ws || '',
            'SL cắt': report.sl_cat || '',
            'Chênh lệch TT-WS': report.chenh_lech_tt_ws || '',
            'Chênh lệch TT-SCC': report.chenh_lech_tt_scc || '',
            'Phụ máy 1': report.phu_may_1 || '',
            'Phụ máy 2': report.phu_may_2 || '',
            'Số pass in': report.so_pass_in || '',
            'Thành phẩm': report.thanh_pham || ''
        }));

        // Tạo workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Thiết lập độ rộng cột
        const colWidths = [
            { wch: 8 },   // STT
            { wch: 12 },  // Ngày
            { wch: 10 },  // Máy
            { wch: 20 },  // Quản đốc
            { wch: 8 },   // Ca
            { wch: 20 },  // Trưởng máy
            { wch: 15 },  // Số WS
            { wch: 12 },  // Số lần chạy
            { wch: 12 },  // Ngày phụ
            { wch: 25 },  // Khách hàng
            { wch: 25 },  // Mã sản phẩm
            { wch: 10 },  // Số con
            { wch: 15 },  // SL đơn hàng
            { wch: 12 },  // Số màu
            { wch: 15 },  // Mã giấy 1
            { wch: 15 },  // Mã giấy 2
            { wch: 15 },  // Mã giấy 3
            { wch: 12 },  // Khổ
            { wch: 12 },  // Dài giấy
            { wch: 20 },  // Tùy chọn
            { wch: 12 },  // Mẫu 3 tone
            { wch: 15 },  // SL giấy TT 1
            { wch: 15 },  // SL giấy TT 2
            { wch: 15 },  // SL giấy TT 3
            { wch: 10 },  // Số kẽm
            { wch: 10 },  // Mặt sau
            { wch: 15 },  // Phủ keo
            { wch: 12 },  // Phun bột
            { wch: 15 },  // TG canh máy
            { wch: 20 },  // TG bắt đầu
            { wch: 20 },  // TG kết thúc
            { wch: 15 },  // Thành phẩm in
            { wch: 12 },  // Phế liệu
            { wch: 12 },  // PL trắng
            { wch: 30 },  // Ghi chú
            { wch: 15 },  // Tổng số lượng
            { wch: 15 },  // Tổng phế liệu
            { wch: 15 },  // Tổng PL trắng
            { wch: 15 },  // SL giấy ream
            { wch: 8 },   // Tuần
            { wch: 15 },  // Giờ làm việc
            { wch: 15 },  // SL giấy theo WS
            { wch: 12 },  // SL cắt
            { wch: 18 },  // Chênh lệch TT-WS
            { wch: 18 },  // Chênh lệch TT-SCC
            { wch: 20 },  // Phụ máy 1
            { wch: 20 },   // Phụ máy 2
            { wch: 20 },   // số pass in
            { wch: 20 },   // Thành phẩm cuối
        ];

        ws['!cols'] = colWidths;

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo In');

        // Tạo tên file với timestamp
        const now = new Date();
        const timestamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') + '_' +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0');

        const fileName = `BaoCao_In_${timestamp}.xlsx`;

        // Xuất file
        XLSX.writeFile(wb, fileName);

        showNotification(`Đã xuất Excel thành công: ${fileName}`, 'success');
        console.log('Xuất Excel thành công:', fileName);

    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error);
        showNotification('Lỗi khi xuất Excel: ' + error.message, 'error');
    }
}

// ====================================================================================================================================
// ACTIONS - XEM, XÓA BÁO CÁO
// ====================================================================================================================================

// Xem chi tiết báo cáo
async function viewReport(reportId) {
    try {
        console.log('Xem chi tiết báo cáo ID:', reportId);

        const response = await fetch(`/api/bao-cao-in/${reportId}`);
        if (!response.ok) {
            throw new Error('Không thể tải chi tiết báo cáo');
        }

        const report = await response.json();

        // Hiển thị modal hoặc trang chi tiết
        showReportDetailModal(report);

    } catch (error) {
        console.error('Lỗi khi xem báo cáo:', error);
        showNotification('Lỗi khi tải chi tiết báo cáo', 'error');
    }
}

// Hiển thị modal chi tiết báo cáo
function showReportDetailModal(report) {
    // Tạo modal động
    const modalId = 'reportDetailModal';
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Chi tiết báo cáo In</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="reportDetailBody">
                        <!-- Nội dung sẽ được điền ở đây -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Điền nội dung
    const modalBody = document.getElementById('reportDetailBody');
    modalBody.innerHTML = generateReportDetailHTML(report);

    // Hiển thị modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Tạo HTML chi tiết báo cáo
function generateReportDetailHTML(report) {
    return `
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary">Thông tin cơ bản</h6>
                <table class="table table-sm">
                    <tr><td><strong>STT:</strong></td><td>${report.stt || ''}</td></tr>
                    <tr><td><strong>Ngày:</strong></td><td>${formatDate(report.ngay) || ''}</td></tr>
                    <tr><td><strong>Máy:</strong></td><td>${report.may || ''}</td></tr>
                    <tr><td><strong>Ca:</strong></td><td>${report.ca || ''}</td></tr>
                    <tr><td><strong>Trưởng máy:</strong></td><td>${report.truong_may || ''}</td></tr>
                    <tr><td><strong>Quản đốc:</strong></td><td>${report.quan_doc || ''}</td></tr>
                </table>
                
                <h6 class="text-primary">Thông tin WS</h6>
                <table class="table table-sm">
                    <tr><td><strong>Số WS:</strong></td><td>${report.ws || ''}</td></tr>
                    <tr><td><strong>Khách hàng:</strong></td><td>${report.khach_hang || ''}</td></tr>
                    <tr><td><strong>Mã sản phẩm:</strong></td><td>${report.ma_sp || ''}</td></tr>
                    <tr><td><strong>SL đơn hàng:</strong></td><td>${report.sl_don_hang || ''}</td></tr>
                    <tr><td><strong>Số màu:</strong></td><td>${report.so_mau || ''}</td></tr>
                </table>
            </div>
            
            <div class="col-md-6">
                <h6 class="text-success">Kết quả sản xuất</h6>
                <table class="table table-sm">
                    <tr><td><strong>Thành phẩm in:</strong></td><td class="">${report.thanh_pham_in || ''}</td></tr>
                    <tr><td><strong>Phế liệu:</strong></td><td class="">${report.phe_lieu || ''}</td></tr>
                    <tr><td><strong>PL trắng:</strong></td><td>${report.phe_lieu_trang || ''}</td></tr>
                    <tr><td><strong>Tổng số lượng:</strong></td><td class="fw-bold">${report.tong_so_luong || ''}</td></tr>
                    <tr><td><strong>SL giấy ream:</strong></td><td>${report.sl_giay_ream || ''}</td></tr>
                    <tr><td><strong>Thành phẩm:</strong></td><td class="fw-bold text-success">${report.thanh_pham || ''}</td></tr>
                </table>
                
                <h6 class="text-primary">Thời gian</h6>
                <table class="table table-sm">
                    <tr><td><strong>TG bắt đầu:</strong></td><td class="text-success fw-bold">${formatDateTime(report.thoi_gian_bat_dau) || ''}</td></tr>
                    <tr><td><strong>TG kết thúc:</strong></td><td class="text-danger fw-bold">${formatDateTime(report.thoi_gian_ket_thuc) || ''}</td></tr>
                    <tr><td><strong>Canh máy:</strong></td><td>${report.thoi_gian_canh_may || ''} phút</td></tr>
                </table>
            </div>
        </div>
        
        ${report.ghi_chu ? `
            <div class="row mt-3">
                <div class="col-12">
                    <h6 class="text-primary">Ghi chú</h6>
                    <div class="alert alert-info">${report.ghi_chu}</div>
                </div>
            </div>
        ` : ''}
        
        ${report.dungMay && report.dungMay.length > 0 ? `
            <div class="row mt-3">
                <div class="col-12">
                    <h6 class="text-danger">Lý do dừng máy</h6>
                    <div class="table-responsive">
                        <table class="table table-sm table-striped">
                            <thead>
                                <tr>
                                    <th>Lý do</th>
                                    <th>TG dừng</th>
                                    <th>TG chạy lại</th>
                                    <th>Thời gian dừng</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${report.dungMay.map(stop => `
                                    <tr>
                                        <td>${stop.ly_do}</td>
                                        <td>${formatDateTime(stop.thoi_gian_dung)}</td>
                                        <td>${formatDateTime(stop.thoi_gian_chay_lai)}</td>
                                        <td>${stop.thoi_gian_dung_may}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
}

// Xóa báo cáo
async function deleteReport(reportId) {
    const confirmed = confirm('Bạn có chắc chắn muốn xóa báo cáo này? Hành động này không thể hoàn tác.');

    if (!confirmed) return;

    try {
        console.log('Xóa báo cáo ID:', reportId);

        const response = await fetch(`/api/bao-cao-in/${reportId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Không thể xóa báo cáo');
        }

        const result = await response.json();

        showNotification('Đã xóa báo cáo thành công', 'success');

        // Reload danh sách
        loadReportList();

    } catch (error) {
        console.error('Lỗi khi xóa báo cáo:', error);
        showNotification('Lỗi khi xóa báo cáo: ' + error.message, 'error');
    }
}

// ====================================================================================================================================
// BÁO CÁO DỪNG MÁY
// ====================================================================================================================================

// Tải danh sách báo cáo dừng máy
async function loadMachineStopReportList() {
    try {
        console.log('🔍 Bắt đầu tải danh sách báo cáo dừng máy...');

        showLoadingInStopTable(true);

        const response = await fetch('/api/bao-cao-in/dung-may/list', {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error('Không thể tải danh sách báo cáo dừng máy');
        }

        const data = await response.json();
        console.log('🔍 Raw API response:', data);
        console.log('🔍 Data length:', data.length);
        console.log('🔍 Sample data:', data.slice(0, 2));

        // Khởi tạo lại stopReportList
        stopReportList = {
            data: data,
            filteredData: [...data], // Tạo copy
            currentPage: 1,
            itemsPerPage: 10,
            totalPages: Math.ceil(data.length / 10)
        };

        // Sắp xếp theo STT giảm dần (mới nhất lên đầu)
stopReportList.data.sort((a, b) => {
    return (b.stt || 0) - (a.stt || 0);
});

// Cập nhật lại filteredData sau khi sắp xếp
stopReportList.filteredData = [...stopReportList.data];

        console.log('🔍 After assignment:', {
            dataLength: stopReportList.data.length,
            filteredDataLength: stopReportList.filteredData.length,
            currentPage: stopReportList.currentPage,
            itemsPerPage: stopReportList.itemsPerPage,
            totalPages: stopReportList.totalPages
        });

        renderStopReportTable();
        updateStopPagination();

        showLoadingInStopTable(false);

        console.log(`✅ Đã tải ${data.length} báo cáo dừng máy In`);

    } catch (error) {
        console.error('❌ Lỗi khi tải danh sách báo cáo dừng máy:', error);
        showLoadingInStopTable(false);
        showNotification('Lỗi khi tải danh sách báo cáo dừng máy', 'error');
    }
}


// Hiển thị loading trong bảng dừng máy
function showLoadingInStopTable(show) {
    const tbody = document.getElementById('stopReportTableBody');
    if (!tbody) return;

    if (show) {
        tbody.innerHTML = `
            <tr>
                <td colspan="100%" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                    <div class="mt-2">Đang tải dữ liệu...</div>
                </td>
            </tr>
        `;
    }
}


function formatStopDuration(durationText) {
    if (!durationText) return '';
    
    // Nếu có "giây" thì xử lý để chỉ hiển thị giờ và phút
    if (durationText.includes('giây')) {
        // Tách ra các phần
        const parts = durationText.split(' ');
        let hours = 0, minutes = 0;
        
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].includes('giờ')) {
                hours = parseInt(parts[i-1]) || 0;
            } else if (parts[i].includes('phút')) {
                minutes = parseInt(parts[i-1]) || 0;
            }
        }
        
        // Format lại chỉ với giờ và phút
        if (hours > 0) {
            return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
        } else if (minutes > 0) {
            return `${minutes} phút`;
        } else {
            return '0 phút';
        }
    }
    
    return durationText; // Giữ nguyên nếu đã đúng format
}


// Render bảng báo cáo dừng máy
function renderStopReportTable() {
    const tbody = document.getElementById('stopReportTableBody');
    if (!tbody) {
        console.error('❌ Không tìm thấy stopReportTableBody');
        return;
    }

    console.log('🔍 renderStopReportTable called');
    console.log('🔍 stopReportList state:', {
        exists: !!stopReportList,
        dataLength: stopReportList?.data?.length || 0,
        filteredDataLength: stopReportList?.filteredData?.length || 0,
        currentPage: stopReportList?.currentPage || 0,
        itemsPerPage: stopReportList?.itemsPerPage || 0
    });

    // Kiểm tra stopReportList tồn tại
    if (!stopReportList || !stopReportList.filteredData) {
        console.error('❌ stopReportList không tồn tại hoặc không có filteredData');
        tbody.innerHTML = `
            <tr>
                <td colspan="16" class="text-center py-4">
                    <div class="text-muted">Lỗi: Dữ liệu chưa được khởi tạo</div>
                </td>
            </tr>
        `;
        return;
    }

    const startIndex = (stopReportList.currentPage - 1) * stopReportList.itemsPerPage;
    const endIndex = startIndex + stopReportList.itemsPerPage;
    const pageData = stopReportList.filteredData.slice(startIndex, endIndex);

    console.log('🔍 Pagination calculation:', {
        startIndex,
        endIndex,
        pageDataLength: pageData.length,
        totalFiltered: stopReportList.filteredData.length
    });

    if (pageData.length === 0) {
        console.log('⚠️ pageData rỗng - hiển thị "Không có dữ liệu"');
        tbody.innerHTML = `
            <tr>
                <td colspan="16" class="text-center py-4">
                    <div class="text-muted">Không có dữ liệu</div>
                </td>
            </tr>
        `;
        updateStopPageInfo();
        return;
    }

    tbody.innerHTML = pageData.map(report => `
        <tr>
            <td>${report.stt || ''}</td>
            <td>${report.ca || ''}</td>
            <td>${report.gio_lam_viec || ''}</td>
            <td>${report.ma_ca || ''}</td>
            <td>${report.truong_may || ''}</td>
            <td><strong class="text-primary">${report.ws || 'Không có WS'}</strong></td>
            <td><strong>${report.may || ''}</strong></td>
            <td>${formatStopDuration(report.thoi_gian_dung_may) || ''}</td>
            <td>${formatDateTime(report.thoi_gian_dung) || ''}</td>
            <td>${formatDateTime(report.thoi_gian_chay_lai) || ''}</td>
            <td><span class="badge bg-danger">${report.ly_do || ''}</span></td>
            <td style="max-width: 200px; word-wrap: break-word;">${report.ghi_chu || ''}</td>
            <td>${formatDateTime(report.ngay_thang_nam) || ''}</td>
            <td>${report.tuan || ''}</td>
            <td>${formatDate(report.ngay) || ''}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteStopReport('${report.id}')" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Kiểm tra xem tab có active không
const stopReportTab = document.getElementById('nav-dungmayinoffset');
if (stopReportTab && !stopReportTab.classList.contains('active')) {
    console.log('⚠️ Tab dừng máy chưa active');
}

    // Cập nhật thông tin trang
    updateStopPageInfo();
}



// Cập nhật pagination cho dừng máy
function updateStopPagination() {
    stopReportList.totalPages = Math.ceil(stopReportList.filteredData.length / stopReportList.itemsPerPage);

    // Tìm các nút phân trang cho dừng máy
    const firstStopPageBtn = document.getElementById('firstStopPage');
    const prevStopPageBtn = document.getElementById('prevStopPage');
    const nextStopPageBtn = document.getElementById('nextStopPage');
    const lastStopPageBtn = document.getElementById('lastStopPage');

    const canGoPrev = stopReportList.currentPage > 1;
    const canGoNext = stopReportList.currentPage < stopReportList.totalPages;

    if (firstStopPageBtn) firstStopPageBtn.parentElement.classList.toggle('disabled', !canGoPrev);
    if (prevStopPageBtn) prevStopPageBtn.parentElement.classList.toggle('disabled', !canGoPrev);
    if (nextStopPageBtn) nextStopPageBtn.parentElement.classList.toggle('disabled', !canGoNext);
    if (lastStopPageBtn) lastStopPageBtn.parentElement.classList.toggle('disabled', !canGoNext);

    // Cập nhật số trang
    updateStopPageNumbers();
}


// Cập nhật số trang cho dừng máy
function updateStopPageNumbers() {
    const stopPagination = document.getElementById('stopPagination');
    if (!stopPagination) return;

    // Xóa các nút số trang cũ
    const pageNumbers = stopPagination.querySelectorAll('.page-number');
    pageNumbers.forEach(btn => btn.remove());

    // Thêm các nút số trang mới
    const nextStopPageBtn = document.getElementById('nextStopPage');
    if (!nextStopPageBtn) return;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, stopReportList.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(stopReportList.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item page-number ${i === stopReportList.currentPage ? 'active' : ''}`;

        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            goToStopPage(i);
        });

        pageItem.appendChild(pageLink);
        nextStopPageBtn.parentElement.before(pageItem);
    }
}


// Chuyển đến trang cho dừng máy
function goToStopPage(page) {
    if (page < 1 || page > stopReportList.totalPages) return;

    stopReportList.currentPage = page;
    renderStopReportTable();
    updateStopPagination();
}


// Cập nhật thông tin trang dừng máy
function updateStopPageInfo() {
    const stopPageInfo = document.getElementById('stopPageInfo');
    const totalStopItems = document.getElementById('totalStopItems');

    if (stopPageInfo) {
        const startIndex = (stopReportList.currentPage - 1) * stopReportList.itemsPerPage + 1;
        const endIndex = Math.min(startIndex + stopReportList.itemsPerPage - 1, stopReportList.filteredData.length);
        
        if (stopReportList.filteredData.length > 0) {
            stopPageInfo.textContent = `Hiển thị ${startIndex}-${endIndex} của ${stopReportList.filteredData.length}`;
        } else {
            stopPageInfo.textContent = 'Hiển thị 0-0 của 0';
        }
    }

    if (totalStopItems) {
        totalStopItems.textContent = `Tổng số: ${stopReportList.filteredData.length} bản ghi`;
    }
}

// Xóa báo cáo dừng máy
async function deleteStopReport(reportId) {
    const confirmed = confirm('Bạn có chắc chắn muốn xóa báo cáo dừng máy này?');

    if (!confirmed) return;

    try {
        // Logic xóa báo cáo dừng máy
        // Sẽ cần API endpoint riêng cho việc này

        showNotification('Đã xóa báo cáo dừng máy thành công', 'success');
        loadMachineStopReportList();

    } catch (error) {
        console.error('Lỗi khi xóa báo cáo dừng máy:', error);
        showNotification('Lỗi khi xóa báo cáo dừng máy', 'error');
    }
}

// ====================================================================================================================================
// BÁO CÁO DỪNG MÁY ĐỘC LẬP
// ====================================================================================================================================


// 🔧 HÀM CHUYỂN ĐỔI THỜI GIAN CHỈ CHO DỪNG MÁY: HH:mm → HH:mm:ss
function formatStopMachineTime(datetimeLocalValue) {
    if (!datetimeLocalValue) return '';
    
    try {
        // Input từ datetime-local: "2024-12-10T14:30"
        // Output cần: "2024-12-10 14:30:00" (thêm :00 giây)
        
        const date = new Date(datetimeLocalValue);
        
        if (isNaN(date.getTime())) {
            console.warn('Invalid datetime value:', datetimeLocalValue);
            return '';
        }
        
        // Format: YYYY-MM-DD HH:mm:00 (cố định 00 giây)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const formatted = `${year}-${month}-${day} ${hours}:${minutes}:00`;
        console.log(`🕐 Format dừng máy: ${datetimeLocalValue} → ${formatted}`);
        
        return formatted;
        
    } catch (error) {
        console.error('Lỗi khi format thời gian dừng máy:', error);
        return '';
    }
}


// Gửi báo cáo dừng máy độc lập
async function submitStopReportOnly() {
    try {
        console.log('Gửi báo cáo dừng máy độc lập...');

        const stopBoxes = document.querySelectorAll('.stop-reason-box');
        if (stopBoxes.length === 0) {
            showNotification('Vui lòng chọn lý do dừng máy', 'error');
            return;
        }

        // Thu thập TẤT CẢ các lý do dừng máy hợp lệ
let validStopDataList = [];

stopBoxes.forEach(box => {
    const reasonValue = box.querySelector('.reason-value')?.value || '';
    const stopTime = box.querySelector('.stop-time-input')?.value || '';
    const resumeTime = box.querySelector('.resume-time-input')?.value || '';
    const otherReason = box.querySelector('.other-reason-input')?.value || '';
    const duration = box.querySelector('.duration-display')?.value || '';
    
    if (reasonValue && stopTime && resumeTime) {
        validStopDataList.push({
            ly_do: reasonValue === 'Khác' ? (otherReason || reasonValue) : reasonValue,
            thoi_gian_dung: formatStopMachineTime(stopTime),
            thoi_gian_chay_lai: formatStopMachineTime(resumeTime),
            thoi_gian_dung_may: duration || '0 phút',
            ghi_chu: otherReason || '' // Thêm ghi chú từ lý do khác
        });
    }
});

const hasValidStopData = validStopDataList.length > 0;

if (!hasValidStopData) {
    showNotification('Vui lòng nhập đầy đủ thời gian dừng và chạy lại', 'error');
    return;
}

// Kiểm tra thông tin bắt buộc
const truongMay = getInputValue('truongmay');
const gioLamViec = getSelectText('gioLamViec');

if (!truongMay || truongMay.trim() === '') {
    showNotification('Vui lòng nhập Trưởng máy để gửi báo cáo dừng máy', 'error');
    return;
}

if (!gioLamViec || gioLamViec.trim() === '') {
    showNotification('Vui lòng chọn Giờ làm việc để gửi báo cáo dừng máy', 'error');
    return;
}

showInLoading('Đang gửi báo cáo dừng máy...', 'Lưu thông tin');

// Gửi từng lý do dừng máy riêng biệt
const results = [];
// Đây là phần code đúng trong vòng lặp for
for (const stopData of validStopDataList) {
    const reportData = {
        ca: String(getInputValue('ca') || ''),
        gio_lam_viec: String(getSelectText('gioLamViec') || ''),
        ma_ca: String(getInputValue('maCa') || ''),
        truong_may: String(getInputValue('truongmay') || ''),
        may: String(getCurrentMachineId() || ''),
        ws: '',
        ly_do: String(stopData.ly_do || ''),
        thoi_gian_dung: stopData.thoi_gian_dung,
        thoi_gian_chay_lai: stopData.thoi_gian_chay_lai,
        thoi_gian_dung_may: String(stopData.thoi_gian_dung_may || '0 phút'),
        ghi_chu: String(stopData.ghi_chu || '')
    };

    const response = await fetch('/api/bao-cao-in/dung-may/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
    });

    if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        try {
            const parsedError = JSON.parse(errorData);
            errorMessage = parsedError.error || errorMessage;
        } catch (e) {
            errorMessage = errorData || errorMessage;
        }
        
        throw new Error(errorMessage);
    }

    // const result = await response.json();
    // results.push(result);
}


        hideInLoading();
        showNotification('Đã lưu báo cáo dừng máy thành công!', 'success');


        // Reset UI
        stopBoxes.forEach(box => box.remove());

        const stopReasonSelect = document.getElementById('stopReason');
        if (stopReasonSelect) {
            stopReasonSelect.selectedIndex = 0;
        }
        
        const machineReport = document.getElementById('machineReport');
        if (machineReport) {
            machineReport.style.display = 'none';
            machineReport.removeAttribute('data-setup-done');
        }
        
        const btnYes = document.getElementById('btnYes');
        const btnNo = document.getElementById('btnNo');
        if (btnYes) {
            btnYes.style.backgroundColor = '';
            btnYes.style.color = '';
        }
        if (btnNo) {
            btnNo.style.backgroundColor = '';
            btnNo.style.color = '';
        }
        
        const submitStopOnlyButton = document.getElementById('submitStopOnlyButton');
        if (submitStopOnlyButton) {
            submitStopOnlyButton.style.display = 'none';
        }
        
        updateInProgress(); 

        console.log('✅ Đã gửi báo cáo dừng máy độc lập thành công');

    } catch (error) {
        console.error('Lỗi khi gửi báo cáo dừng máy:', error);
        hideInLoading();
        showNotification('Lỗi khi gửi báo cáo dừng máy: ' + error.message, 'error');
    }
}


// Tính và hiển thị số lượng đã in
async function calculateAndDisplaySoLuongDaIn(wsData) {
    try {
        const currentWS = getInputValue('ws').trim();
        const currentTuyChonValue = getSelectValue('tuychon'); // 1,2,3,4,5,6
        const currentTuyChonText = getSelectText('tuychon');

        // Nếu không có đủ thông tin thì hiển thị 0
        if (!currentWS || !currentTuyChonValue) {
            setInputValue('soluongdain', '0');
            return;
        }

        // Tùy chọn 4,5,6 luôn hiển thị 0
        if (['4', '5', '6', '7', '8', '9'].includes(currentTuyChonValue)) {
            setInputValue('soluongdain', '0');
            return;
        }

        // Gọi API lấy tất cả báo cáo
        const response = await fetch('/api/bao-cao-in/list?exclude_stop_only=true');
        if (!response.ok) {
            console.warn('Không thể lấy danh sách báo cáo để tính số lượng đã in');
            setInputValue('soluongdain', '0');
            return;
        }

        const allReports = await response.json();

        // Lọc các báo cáo có cùng WS + tùy chọn
        const matchingReports = allReports.filter(report => {
            // Bỏ qua báo cáo hiện tại nếu đang cập nhật
            if (currentReportId && report.id === currentReportId) return false;

            // Điều kiện: cùng WS và cùng tùy chọn
            if (report.ws !== currentWS) return false;
            if (report.tuy_chon !== currentTuyChonText) return false;

            // Chỉ tính báo cáo đã hoàn thành (có thành phẩm in)
            return report.thanh_pham_in && parseFloat(report.thanh_pham_in) > 0;
        });

        // Nếu không có báo cáo matching (lần chạy đầu tiên) → hiển thị 0
if (matchingReports.length === 0) {
    setInputValue('soluongdain', '0');
    console.log(`Lần chạy đầu tiên: WS=${currentWS}, Tùy chọn=${currentTuyChonText} → Số lượng đã in = 0`);
    return;
}

// Tính tổng thành phẩm in từ các báo cáo matching
const soLuongDaIn = matchingReports.reduce((total, report) => {
    return total + (parseFloat(report.thanh_pham_in) || 0);
}, 0);

        // Hiển thị kết quả
        setInputValue('soluongdain', soLuongDaIn.toString());

        console.log(`Tính số lượng đã in: WS=${currentWS}, Tùy chọn=${currentTuyChonText}, ${matchingReports.length} báo cáo matching, tổng = ${soLuongDaIn}`);

    } catch (error) {
        console.error('Lỗi khi tính số lượng đã in:', error);
        setInputValue('soluongdain', '0');
    }
}






// ====================================================================================================================================
// CỐ ĐỊNH CỘT VÀ ẨN CỘT
// ====================================================================================================================================

// Biến toàn cục
let fixedColumns = [];
let hiddenColumns = [];
let selectedColumns = [];
let isFixedMode = false;



// Áp dụng cố định cột vào bảng
function applyFixedColumns() {
    const table = document.querySelector('#reportTableBody').closest('table');
    
    // Xóa class cũ
    removeFixedColumns();
    
    if (fixedColumns.length === 0) return;
    
    // Sắp xếp cột theo thứ tự từ trái sang phải
    const sortedColumns = [...fixedColumns].sort((a, b) => a - b);
    
    // Di chuyển các cột về đầu bảng
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    // Lưu tất cả headers và rows
    const allHeaders = Array.from(thead.children);
    const allRows = Array.from(tbody.children);
    
    // Tạo lại thứ tự cột: cố định trước, còn lại sau
    const newColumnOrder = [];
    
    // Thêm cột cố định trước
    sortedColumns.forEach(colIndex => {
        newColumnOrder.push(colIndex);
    });
    
    // Thêm cột không cố định sau
    for (let i = 0; i < allHeaders.length; i++) {
        if (!fixedColumns.includes(i)) {
            newColumnOrder.push(i);
        }
    }
    
    // Sắp xếp lại header
    thead.innerHTML = '';
    newColumnOrder.forEach((colIndex, newIndex) => {
        const header = allHeaders[colIndex].cloneNode(true);
        if (fixedColumns.includes(colIndex)) {
            header.classList.add('fixed-column-header');
            header.style.left = '0px';
        }
        thead.appendChild(header);
    });
    
    // Sắp xếp lại body rows
    allRows.forEach(row => {
        const cells = Array.from(row.children);
        row.innerHTML = '';
        
        newColumnOrder.forEach((colIndex, newIndex) => {
            const cell = cells[colIndex].cloneNode(true);
            if (fixedColumns.includes(colIndex)) {
                cell.classList.add('fixed-column-cell');
                cell.style.left = '0px';
            }
            row.appendChild(cell);
        });
    });
    
    // Khởi tạo lại event listeners cho headers
    setTimeout(() => {
        initializeColumnHiding();
    }, 100);
}



// Xóa cố định cột
function removeFixedColumns() {
    // Reload lại bảng để về thứ tự ban đầu
    renderReportTable();
}

// Khởi tạo chức năng ẩn cột
function initializeColumnHiding() {
    const table = document.querySelector('#reportTableBody').closest('table');
    const headers = table.querySelectorAll('thead th');
    
    headers.forEach((header, index) => {
        // Thêm dropdown toggle
        if (!header.querySelector('.column-dropdown-toggle')) {
            const dropdown = document.createElement('span');
            dropdown.className = 'column-dropdown-toggle';
            dropdown.innerHTML = '▼';
            header.style.position = 'relative';
            header.appendChild(dropdown);
            
            dropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                showColumnDropdown(e, index);
            });
        }
        
        // Click để chọn cột
        header.addEventListener('click', (e) => {
            if (e.target.classList.contains('column-dropdown-toggle')) return;
            toggleColumnSelection(index);
        });
    });
    
    // Context menu cho chuột phải
    document.addEventListener('contextmenu', handleRightClick);
    document.addEventListener('click', hideContextMenu);
}

// Toggle chọn cột
function toggleColumnSelection(colIndex) {
    const table = document.querySelector('#reportTableBody').closest('table');
    const headers = Array.from(table.querySelectorAll('thead th'));
    
    // Tìm index thực tế trong DOM hiện tại
    let actualIndex = colIndex;
    
    const headerCell = headers[actualIndex];
    const bodyCells = table.querySelectorAll(`tbody td:nth-child(${actualIndex + 1})`);
    
    if (selectedColumns.includes(colIndex)) {
        selectedColumns = selectedColumns.filter(i => i !== colIndex);
        headerCell?.classList.remove('column-selected');
        bodyCells.forEach(cell => cell.classList.remove('column-selected'));
    } else {
        selectedColumns.push(colIndex);
        headerCell?.classList.add('column-selected');
        bodyCells.forEach(cell => cell.classList.add('column-selected'));
    }
}

// Hiển thị dropdown cột
function showColumnDropdown(e, colIndex) {
    hideContextMenu();
    
    const menu = document.createElement('div');
    menu.className = 'column-context-menu';
    menu.id = 'columnDropdown';
    
    const hideItem = document.createElement('div');
    hideItem.className = 'context-menu-item';
    hideItem.textContent = 'Ẩn cột';
    hideItem.addEventListener('click', () => {
        hideColumn(colIndex);
        hideContextMenu();
    });
    
    menu.appendChild(hideItem);
    
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    
    document.body.appendChild(menu);
}
// Xử lý chuột phải
function handleRightClick(e) {
    if (selectedColumns.length === 0) return;
    
    e.preventDefault();
    hideContextMenu();
    
    const menu = document.createElement('div');
    menu.className = 'column-context-menu';
    menu.id = 'contextMenu';
    
    // Item ẩn cột
    const hideItem = document.createElement('div');
    hideItem.className = 'context-menu-item';
    hideItem.textContent = `Ẩn ${selectedColumns.length} cột`;
    hideItem.addEventListener('click', () => {
        hideSelectedColumns();
        hideContextMenu();
    });
    
    // Item cố định cột  
    const fixItem = document.createElement('div');
    fixItem.className = 'context-menu-item';
    fixItem.textContent = `Cố định ${selectedColumns.length} cột`;
    fixItem.addEventListener('click', () => {
        fixSelectedColumns();
        hideContextMenu();
    });
    
    // Item bỏ cố định (chỉ hiện khi có cột được cố định)
    if (fixedColumns.length > 0) {
        const unfixItem = document.createElement('div');
        unfixItem.className = 'context-menu-item';
        unfixItem.textContent = 'Bỏ cố định tất cả';
        unfixItem.addEventListener('click', () => {
            clearAllFixedColumns();
            hideContextMenu();
        });
        menu.appendChild(unfixItem);
    }
    
    menu.appendChild(hideItem);
    menu.appendChild(fixItem);
    
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    
    document.body.appendChild(menu);
}

// Ẩn context menu
function hideContextMenu() {
    const existingMenus = document.querySelectorAll('.column-context-menu');
    existingMenus.forEach(menu => menu.remove());
}

// Ẩn một cột
function hideColumn(colIndex) {
    if (!hiddenColumns.includes(colIndex)) {
        hiddenColumns.push(colIndex);
        
        // Nếu cột đang được cố định thì xóa khỏi danh sách cố định
        if (fixedColumns.includes(colIndex)) {
            fixedColumns = fixedColumns.filter(i => i !== colIndex);
        }
        
        applyColumnVisibility();
        showNotification('Đã ẩn cột', 'info');
    }
}

// Ẩn các cột đã chọn
function hideSelectedColumns() {
    const columnsToHide = [...selectedColumns]; // Copy array
    
    columnsToHide.forEach(colIndex => {
        if (!hiddenColumns.includes(colIndex)) {
            hiddenColumns.push(colIndex);
        }
        
        // Xóa khỏi cố định nếu có
        if (fixedColumns.includes(colIndex)) {
            fixedColumns = fixedColumns.filter(i => i !== colIndex);
        }
    });
    
    selectedColumns = [];
    applyColumnVisibility();
    showNotification(`Đã ẩn ${columnsToHide.length} cột`, 'info');
}


// Cố định các cột đã chọn - THÊM HÀM MỚI
function fixSelectedColumns() {
    // Thêm các cột chọn vào danh sách cố định
    selectedColumns.forEach(colIndex => {
        if (!fixedColumns.includes(colIndex)) {
            fixedColumns.push(colIndex);
        }
    });
    
    selectedColumns = [];
    applyFixedColumns();
    showNotification(`Đã cố định cột`, 'success');
}

// Bỏ cố định tất cả - THÊM HÀM MỚI  
function clearAllFixedColumns() {
    fixedColumns = [];
    selectedColumns = [];
    removeFixedColumns();
    showNotification('Đã bỏ cố định tất cả cột', 'info');
}




// Hiện cột
function showColumn(colIndex) {
    hiddenColumns = hiddenColumns.filter(i => i !== colIndex);
    applyColumnVisibility();
    showNotification('Đã hiện cột', 'success');
}

// Áp dụng ẩn/hiện cột
function applyColumnVisibility() {
    const table = document.querySelector('#reportTableBody').closest('table');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    // Xóa tất cả indicators cũ
    const oldIndicators = table.querySelectorAll('.hidden-column-indicator');
    oldIndicators.forEach(indicator => indicator.remove());
    
    // Reset tất cả cột
    const allHeaders = table.querySelectorAll('thead th');
    const allRows = table.querySelectorAll('tbody tr');
    
    allHeaders.forEach((header, index) => {
        header.style.display = '';
        header.classList.remove('column-selected');
    });
    
    allRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            cell.style.display = '';
            cell.classList.remove('column-selected');
        });
    });
    
    // Ẩn các cột và thêm indicators
    hiddenColumns.forEach((colIndex) => {
        // Tìm vị trí hiện tại của cột (có thể đã thay đổi do cố định)
        const headers = Array.from(table.querySelectorAll('thead th'));
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        
        // Tìm header chứa text gốc để xác định đúng cột cần ẩn
        let actualColumnIndex = -1;
        headers.forEach((header, index) => {
            // So sánh với header gốc để tìm đúng cột
            const originalHeaders = document.querySelectorAll('thead th');
            if (originalHeaders[colIndex] && 
                header.textContent.trim() === originalHeaders[colIndex].textContent.trim()) {
                actualColumnIndex = index;
            }
        });
        
        if (actualColumnIndex === -1) return;
        
        // Ẩn header
        const headerCell = headers[actualColumnIndex];
        if (headerCell) {
            headerCell.style.display = 'none';
            
            // Thêm indicator
            const indicator = document.createElement('th');
            indicator.className = 'hidden-column-indicator';
            indicator.title = `Click để hiện cột: ${headerCell.textContent.trim()}`;
            indicator.addEventListener('click', () => showColumn(colIndex));
            
            headerCell.parentNode.insertBefore(indicator, headerCell.nextSibling);
        }
        
        // Ẩn body cells
        rows.forEach(row => {
            const cell = row.children[actualColumnIndex];
            if (cell) {
                cell.style.display = 'none';
                
                const bodyIndicator = document.createElement('td');
                bodyIndicator.className = 'hidden-column-indicator';
                bodyIndicator.addEventListener('click', () => showColumn(colIndex));
                
                cell.parentNode.insertBefore(bodyIndicator, cell.nextSibling);
            }
        });
    });
    
    // Áp dụng lại cố định cột nếu có
    if (fixedColumns.length > 0) {
        setTimeout(() => applyFixedColumns(), 50);
    }
}








function toggleStopMachineModal() {
    const modal = new bootstrap.Modal(document.getElementById('stopMachineModal'));
    
    // Event listener khi HIỂN THỊ modal - sync mỗi lần mở
    const modalElement = document.getElementById('stopMachineModal');
    modalElement.addEventListener('shown.bs.modal', function() {
        console.log('📱 Modal đã hiển thị - sync dữ liệu');
        syncModalWithMainForm();
    }, { once: false }); // XÓA once: true để sync mỗi lần
    
    // Event listener khi đóng modal - sync cuối
    modalElement.addEventListener('hidden.bs.modal', function() {
        console.log('📱 Modal đã đóng - sync dữ liệu về form chính');
        syncModalDataToMainForm();
    }, { once: true });
    
    modal.show();
}



// Thay thế hàm handleModalStopChoice() cũ
function handleModalStopChoiceClick(isStop) {
    const modalBtnYes = document.getElementById('modalBtnYes');
    const modalBtnNo = document.getElementById('modalBtnNo');
    const modalChoice = document.getElementById('modalStopChoice');
    const modalReport = document.getElementById('modalMachineReport');
    const miniBtn = document.getElementById('miniStopButton');
    const miniText = document.getElementById('miniStopText');
    
    // LUÔN LUÔN hiển thị lại phần chọn để có thể đổi ý
    modalChoice.style.display = 'block';
    
    if (isStop) {
        // Chọn CÓ dừng máy
        modalBtnYes.style.backgroundColor = 'rgb(208, 0, 0)';
        modalBtnYes.style.color = 'white';
        modalBtnNo.style.backgroundColor = '';
        modalBtnNo.style.color = '';
        modalReport.style.display = 'block';  // Hiển thị phần báo cáo
        
        // Sync với form chính
        const mainBtnYes = document.getElementById('btnYes');
        const mainBtnNo = document.getElementById('btnNo');
        const mainMachineReport = document.getElementById('machineReport');
        
        if (mainBtnYes && mainBtnNo && mainMachineReport) {
            mainBtnYes.style.backgroundColor = 'rgb(208, 0, 0)';
            mainBtnYes.style.color = 'white';
            mainBtnNo.style.backgroundColor = '';
            mainBtnNo.style.color = '';
            mainMachineReport.style.display = 'block';
        }
        
        // Cập nhật nút mini
        if (miniBtn && miniText) {
            miniBtn.classList.remove('has-no-stop-selection');
            miniBtn.classList.add('has-stop-selection'); 
            miniText.innerHTML = 'CÓ DỪNG';
        }
        
        // Setup modal stop reason handling
        setupModalStopReasonHandling();
        
        // Hiển thị nút dừng máy không có WS trong modal
        const modalSubmitStopBtn = document.getElementById('modalSubmitStopOnlyButton');
        if (modalSubmitStopBtn) {
            modalSubmitStopBtn.style.display = 'inline-block';
        }
        
        // Sync dữ liệu từ form chính (nếu có)
        setTimeout(() => {
            syncStopReasons();
        }, 100);
        
    } else {
        // Chọn KHÔNG dừng máy
        modalBtnNo.style.backgroundColor = 'rgb(74, 144, 226)';
        modalBtnNo.style.color = 'white';
        modalBtnYes.style.backgroundColor = '';
        modalBtnYes.style.color = '';
        modalReport.style.display = 'none';  // Ẩn phần báo cáo
        
        // Xóa tất cả lý do dừng máy trong modal
        const modalStopBoxes = document.querySelectorAll('#modalAdditionalReasonsContainer .stop-reason-box');
        modalStopBoxes.forEach(box => box.remove());
        
        // Reset select lý do về ban đầu
        const modalStopReasonSelect = document.getElementById('modalStopReason');
        if (modalStopReasonSelect) {
            modalStopReasonSelect.selectedIndex = 0;
        }
        
        // Sync với form chính
        const mainBtnNo = document.getElementById('btnNo');
        const mainBtnYes = document.getElementById('btnYes');
        const mainMachineReport = document.getElementById('machineReport');
        
        if (mainBtnNo && mainBtnYes && mainMachineReport) {
            mainBtnNo.style.backgroundColor = 'rgb(74, 144, 226)';
            mainBtnNo.style.color = 'white';
            mainBtnYes.style.backgroundColor = '';
            mainBtnYes.style.color = '';
            mainMachineReport.style.display = 'none';
            
            // Xóa tất cả lý do dừng máy ở form chính
            const mainStopBoxes = document.querySelectorAll('#additionalReasonsContainer .stop-reason-box');
            mainStopBoxes.forEach(box => box.remove());
        }

        // Ẩn nút dừng máy không có WS trong modal
        const modalSubmitStopBtn = document.getElementById('modalSubmitStopOnlyButton');
        if (modalSubmitStopBtn) {
            modalSubmitStopBtn.style.display = 'none';
        }
        
        // Cập nhật nút mini
        if (miniBtn && miniText) {
            miniBtn.classList.remove('has-stop-selection');
            miniBtn.classList.add('has-no-stop-selection');
            miniText.innerHTML = 'KHÔNG DỪNG';
        }
    }
    
    // Cập nhật tiến độ
    setTimeout(() => {
        updateInProgress();
    }, 100);
    
    console.log(`✅ Modal chọn: ${isStop ? 'CÓ' : 'KHÔNG'} dừng máy`);
}
// Thay thế hàm handleMiniStopButtonScroll() cũ
function handleMiniStopButtonScroll() {
    const miniButton = document.getElementById('miniStopButton');
    const machineReportSection = document.getElementById('machineReport');
    
    if (!miniButton || !machineReportSection) return;
    
    const machineReportRect = machineReportSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Kiểm tra xem phần dừng máy có đang hiển thị không
    const isMachineReportVisible = machineReportRect.top < windowHeight && machineReportRect.bottom > 0;
    
    // Xóa các class cũ
    miniButton.classList.remove('moved-down', 'moved-up');
    
    if (isMachineReportVisible) {
        // Phần dừng máy đang hiển thị -> thu xuống dưới
        miniButton.classList.add('moved-down');
    } else if (machineReportRect.top > windowHeight) {
        // Phần dừng máy ở dưới tầm nhìn -> nút ở vị trí bình thường
        // Không cần thêm class gì
    } else {
        // Phần dừng máy ở trên tầm nhìn -> phóng to lên
        miniButton.classList.add('moved-up');
    }
}




function syncModalWithMainForm() {
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const modalBtnYes = document.getElementById('modalBtnYes');
    const modalBtnNo = document.getElementById('modalBtnNo');
    const modalChoice = document.getElementById('modalStopChoice');
    const modalReport = document.getElementById('modalMachineReport');
    
    console.log('🔄 Sync modal với form chính...');
    console.log('Form chính - btnYes:', btnYes?.style.backgroundColor);
    console.log('Form chính - btnNo:', btnNo?.style.backgroundColor);
    
    // Sync trạng thái nút
    if (btnYes?.style.backgroundColor === 'rgb(208, 0, 0)') {
        // Form chính đã chọn CÓ dừng máy
        console.log('✅ Sync: CÓ dừng máy');
        
        modalBtnYes.style.backgroundColor = 'rgb(208, 0, 0)';
        modalBtnYes.style.color = 'white';
        modalBtnNo.style.backgroundColor = '';
        modalBtnNo.style.color = '';
        modalChoice.style.display = 'block';
        modalReport.style.display = 'block';
        
        // LUÔN setup lại modal stop reason handling
        setupModalStopReasonHandling();
        
        // Hiển thị nút submit
        const modalSubmitStopBtn = document.getElementById('modalSubmitStopOnlyButton');
        if (modalSubmitStopBtn) {
            modalSubmitStopBtn.style.display = 'inline-block';
        }
        
        // Sync các lý do dừng máy sau delay nhỏ
        setTimeout(() => {
            syncStopReasons();
        }, 100);
        
    } else if (btnNo?.style.backgroundColor === 'rgb(74, 144, 226)') {
        // Form chính đã chọn KHÔNG dừng máy
        console.log('✅ Sync: KHÔNG dừng máy');
        
        modalBtnNo.style.backgroundColor = 'rgb(74, 144, 226)';
        modalBtnNo.style.color = 'white';
        modalBtnYes.style.backgroundColor = '';
        modalBtnYes.style.color = '';
        modalChoice.style.display = 'block';
        modalReport.style.display = 'none';
        
        // Ẩn nút submit
        const modalSubmitStopBtn = document.getElementById('modalSubmitStopOnlyButton');
        if (modalSubmitStopBtn) {
            modalSubmitStopBtn.style.display = 'none';
        }
        
    } else {
        // Chưa chọn gì - reset về trạng thái ban đầu
        console.log('⚪ Sync: Chưa chọn trạng thái');
        
        modalBtnYes.style.backgroundColor = '';
        modalBtnYes.style.color = '';
        modalBtnNo.style.backgroundColor = '';
        modalBtnNo.style.color = '';
        modalChoice.style.display = 'block';
        modalReport.style.display = 'none';
        
        const modalSubmitStopBtn = document.getElementById('modalSubmitStopOnlyButton');
        if (modalSubmitStopBtn) {
            modalSubmitStopBtn.style.display = 'none';
        }
    }
}




// Thêm hàm mới - xử lý submit stop report từ modal
async function submitModalStopReportOnly() {
    try {
        console.log('Submit báo cáo dừng máy từ modal...');
 
        // Thu thập dữ liệu từ modal
        const modalStopBoxes = document.querySelectorAll('#modalAdditionalReasonsContainer .stop-reason-box');
        if (modalStopBoxes.length === 0) {
            showNotification('Vui lòng chọn lý do dừng máy', 'error');
            return;
        }
 
        // Thu thập TẤT CẢ các lý do dừng máy hợp lệ từ modal
        let validModalStopDataList = [];
 
        modalStopBoxes.forEach(box => {
            const reasonValue = box.querySelector('.reason-value')?.value || '';
            const stopTime = box.querySelector('.stop-time-input')?.value || '';
            const resumeTime = box.querySelector('.resume-time-input')?.value || '';
            const otherReason = box.querySelector('.other-reason-input')?.value || '';
            const duration = box.querySelector('.duration-display')?.value || '';
            
            if (reasonValue && stopTime && resumeTime) {
                validModalStopDataList.push({
                    ly_do: reasonValue === 'Khác' ? (otherReason || reasonValue) : reasonValue,
                    thoi_gian_dung: formatStopMachineTime(stopTime),
                    thoi_gian_chay_lai: formatStopMachineTime(resumeTime),
                    thoi_gian_dung_may: duration || '0 phút',
                    ghi_chu: otherReason || ''
                });
            }
        });
 
        if (validModalStopDataList.length === 0) {
            showNotification('Vui lòng nhập đầy đủ thời gian dừng và chạy lại', 'error');
            return;
        }
 
        // Kiểm tra thông tin bắt buộc
        const truongMay = getInputValue('truongmay');
        const gioLamViec = getSelectText('gioLamViec');
 
        if (!truongMay || truongMay.trim() === '') {
            showNotification('Vui lòng nhập Trưởng máy để gửi báo cáo dừng máy', 'error');
            return;
        }
 
        if (!gioLamViec || gioLamViec.trim() === '') {
            showNotification('Vui lòng chọn Giờ làm việc để gửi báo cáo dừng máy', 'error');
            return;
        }

        const maCa = getInputValue('maCa');
if (!maCa || maCa.trim() === '') {
    showNotification('Vui lòng chọn giờ làm việc để tự động tạo mã ca', 'error');
    return;
}
 
        showInLoading('Đang gửi báo cáo dừng máy...', 'Lưu thông tin');
 
        // Gửi từng lý do dừng máy riêng biệt
        const results = [];
        for (const stopData of validModalStopDataList) {
            const reportData = {
                ca: String(getInputValue('ca') || ''),
                gio_lam_viec: String(getSelectText('gioLamViec') || ''),
                ma_ca: String(getInputValue('maCa') || ''),
                truong_may: String(getInputValue('truongmay') || ''),
                may: String(getCurrentMachineId() || ''),
                ws: '',
                ly_do: String(stopData.ly_do || ''),
                thoi_gian_dung: stopData.thoi_gian_dung,
                thoi_gian_chay_lai: stopData.thoi_gian_chay_lai,
                thoi_gian_dung_may: String(stopData.thoi_gian_dung_may || '0 phút'),
                ghi_chu: String(stopData.ghi_chu || '')
            };
 
            const response = await fetch('/api/bao-cao-in/dung-may/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportData),
            });
 
            if (!response.ok) {
                const errorData = await response.text();
                let errorMessage = `HTTP ${response.status}`;
                
                try {
                    const parsedError = JSON.parse(errorData);
                    errorMessage = parsedError.error || errorMessage;
                } catch (e) {
                    errorMessage = errorData || errorMessage;
                }
                
                throw new Error(errorMessage);
            }
 
            const result = await response.json();
            results.push(result);
        }
 
        hideInLoading();
        showNotification('Đã lưu báo cáo dừng máy thành công!', 'success');
 
        // Reset UI đầy đủ cho cả modal và form chính
        // 1. Reset modal
        const modalStopBoxesReset = document.querySelectorAll('#modalAdditionalReasonsContainer .stop-reason-box');
        modalStopBoxesReset.forEach(box => box.remove());
 
        const modalStopReasonSelect = document.getElementById('modalStopReason');
        if (modalStopReasonSelect) {
            modalStopReasonSelect.selectedIndex = 0;
        }
 
        const modalReport = document.getElementById('modalMachineReport');
        const modalChoice = document.getElementById('modalStopChoice');
        const modalSubmitBtn = document.getElementById('modalSubmitStopOnlyButton');
        const modalBtnYes = document.getElementById('modalBtnYes');
        const modalBtnNo = document.getElementById('modalBtnNo');
 
        if (modalReport) modalReport.style.display = 'none';
        if (modalChoice) modalChoice.style.display = 'block';
        if (modalSubmitBtn) modalSubmitBtn.style.display = 'none';
        if (modalBtnYes) {
            modalBtnYes.style.backgroundColor = '';
            modalBtnYes.style.color = '';
        }
        if (modalBtnNo) {
            modalBtnNo.style.backgroundColor = '';
            modalBtnNo.style.color = '';
        }
 
        // 2. Reset form chính  
        const stopBoxes = document.querySelectorAll('#additionalReasonsContainer .stop-reason-box');
        stopBoxes.forEach(box => box.remove());
 
        const stopReasonSelect = document.getElementById('stopReason');
        if (stopReasonSelect) {
            stopReasonSelect.selectedIndex = 0;
        }
 
        const machineReport = document.getElementById('machineReport');
        if (machineReport) {
            machineReport.style.display = 'none';
            machineReport.removeAttribute('data-setup-done');
        }
 
        const btnYes = document.getElementById('btnYes');
        const btnNo = document.getElementById('btnNo');
        const submitStopOnlyButton = document.getElementById('submitStopOnlyButton');
 
        if (btnYes) {
            btnYes.style.backgroundColor = '';
            btnYes.style.color = '';
        }
        if (btnNo) {
            btnNo.style.backgroundColor = '';
            btnNo.style.color = '';
        }
        if (submitStopOnlyButton) {
            submitStopOnlyButton.style.display = 'none';
        }
 
        // 3. Reset nút mini
        const miniBtn = document.getElementById('miniStopButton');
        const miniText = document.getElementById('miniStopText');
        if (miniBtn && miniText) {
            miniBtn.classList.remove('has-stop-selection', 'has-no-stop-selection');
            miniText.innerHTML = 'DỪNG MÁY';
        }
 
        // 4. Đóng modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('stopMachineModal'));
        if (modal) {
            modal.hide();
        }
 
        updateInProgress();
 
        console.log('✅ Đã gửi báo cáo dừng máy từ modal thành công');
 
    } catch (error) {
        console.error('Lỗi khi gửi báo cáo dừng máy từ modal:', error);
        hideInLoading();
        showNotification('Lỗi khi gửi báo cáo dừng máy: ' + error.message, 'error');
    }
 }




// Thêm hàm mới - reset modal sau khi submit
function resetModalAfterSubmit() {
    // Reset trong modal
    const modalStopBoxes = document.querySelectorAll('#modalAdditionalReasonsContainer .stop-reason-box');
    modalStopBoxes.forEach(box => box.remove());

    const modalStopReasonSelect = document.getElementById('modalStopReason');
    if (modalStopReasonSelect) {
        modalStopReasonSelect.selectedIndex = 0;
    }
    
    const modalReport = document.getElementById('modalMachineReport');
    const modalChoice = document.getElementById('modalStopChoice');
    const modalSubmitBtn = document.getElementById('modalSubmitStopOnlyButton');
    
    if (modalReport) modalReport.style.display = 'none';
    if (modalChoice) modalChoice.style.display = 'block';
    if (modalSubmitBtn) modalSubmitBtn.style.display = 'none';
    
    const modalBtnYes = document.getElementById('modalBtnYes');
    const modalBtnNo = document.getElementById('modalBtnNo');
    if (modalBtnYes) {
        modalBtnYes.style.backgroundColor = '';
        modalBtnYes.style.color = '';
    }
    if (modalBtnNo) {
        modalBtnNo.style.backgroundColor = '';
        modalBtnNo.style.color = '';
    }

    // Reset form chính (sử dụng logic có sẵn)
    const stopBoxes = document.querySelectorAll('#additionalReasonsContainer .stop-reason-box');
    stopBoxes.forEach(box => box.remove());

    const stopReasonSelect = document.getElementById('stopReason');
    if (stopReasonSelect) {
        stopReasonSelect.selectedIndex = 0;
    }
    
    const machineReport = document.getElementById('machineReport');
    if (machineReport) {
        machineReport.style.display = 'none';
        machineReport.removeAttribute('data-setup-done');
    }
    
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const submitStopOnlyButton = document.getElementById('submitStopOnlyButton');
    
    if (btnYes) {
        btnYes.style.backgroundColor = '';
        btnYes.style.color = '';
    }
    if (btnNo) {
        btnNo.style.backgroundColor = '';
        btnNo.style.color = '';
    }
    if (submitStopOnlyButton) {
        submitStopOnlyButton.style.display = 'none';
    }
    
    // Reset nút mini
const miniBtn = document.getElementById('miniStopButton');
const miniText = document.getElementById('miniStopText');
if (miniBtn && miniText) {
    miniBtn.classList.remove('has-stop-selection', 'has-no-stop-selection');
    miniText.innerHTML = 'DỪNG MÁY';
}
    
    updateInProgress();
}



function syncStopReasons() {
    const mainContainer = document.querySelector('#additionalReasonsContainer');
    const modalContainer = document.getElementById('modalAdditionalReasonsContainer');
    
    if (!mainContainer || !modalContainer) return;
    
    console.log('🔄 Sync stop reasons từ main sang modal...');
    
    // Xóa nội dung cũ trong modal
    modalContainer.innerHTML = '';
    
    // Copy tất cả stop-reason-box từ form chính sang modal
    const stopBoxes = mainContainer.querySelectorAll('.stop-reason-box');
    console.log(`📋 Tìm thấy ${stopBoxes.length} stop boxes trong form chính`);
    
    stopBoxes.forEach((box, index) => {
        const clonedBox = box.cloneNode(true);
        
        // Thay đổi ID để tránh trùng lặp
        const boxId = clonedBox.id;
        const modalBoxId = 'modal_' + boxId;
        clonedBox.id = modalBoxId;
        
        console.log(`📋 Clone box ${index + 1}: ${boxId} -> ${modalBoxId}`);
        
        // Cập nhật các ID con
        const childElements = clonedBox.querySelectorAll('[id]');
        childElements.forEach(el => {
            if (el.id.startsWith(boxId)) {
                const newId = el.id.replace(boxId, modalBoxId);
                el.id = newId;
            }
        });
        
        // QUAN TRỌNG: Copy giá trị input từ box gốc
        const originalInputs = box.querySelectorAll('input, textarea, select');
        const clonedInputs = clonedBox.querySelectorAll('input, textarea, select');
        
        originalInputs.forEach((input, inputIndex) => {
            if (clonedInputs[inputIndex]) {
                // Copy value
                clonedInputs[inputIndex].value = input.value;
                
                // Copy thuộc tính checked cho checkbox/radio
                if (input.type === 'checkbox' || input.type === 'radio') {
                    clonedInputs[inputIndex].checked = input.checked;
                }
                
                console.log(`📝 Copy input ${inputIndex}: ${input.value}`);
            }
        });
        
        // Cập nhật onclick của nút xóa
        const deleteBtn = clonedBox.querySelector('button[onclick*="removeStopReasonBox"]');
        if (deleteBtn) {
            deleteBtn.setAttribute('onclick', `removeModalStopReasonBox('${modalBoxId}')`);
        }
        
        // Cập nhật onclick của các nút thời gian
const timeButtons = clonedBox.querySelectorAll('button[onclick*="setCurrentTime"]');
timeButtons.forEach((btn, btnIndex) => {
    const onclick = btn.getAttribute('onclick');
    if (onclick) {
        // Thay thế setCurrentTime -> setModalCurrentTime
        let newOnclick = onclick.replace('setCurrentTime', 'setModalCurrentTime');
        
        // Cập nhật ID để khớp với modal box ID
        newOnclick = newOnclick.replace(boxId, modalBoxId);
        
        btn.setAttribute('onclick', newOnclick);
        
        console.log(`🔧 Update button ${btnIndex}: ${onclick} -> ${newOnclick}`);
    }
});
        
        modalContainer.appendChild(clonedBox);
        
        // Setup event listeners cho modal box
        setupModalDurationCalculation(modalBoxId);
    });
    
    console.log('✅ Đã sync xong stop reasons sang modal');
}



// Đồng bộ dữ liệu từ modal sang form chính
function syncModalDataToMainForm() {
    const modalContainer = document.getElementById('modalAdditionalReasonsContainer');
    const mainContainer = document.querySelector('#additionalReasonsContainer');
    
    if (!modalContainer || !mainContainer) return;
    
    // Xóa tất cả box cũ trong form chính
    const oldMainBoxes = mainContainer.querySelectorAll('.stop-reason-box');
    oldMainBoxes.forEach(box => box.remove());
    
    // Copy từ modal sang form chính
    const modalBoxes = modalContainer.querySelectorAll('.stop-reason-box');
    modalBoxes.forEach(modalBox => {
        const clonedBox = modalBox.cloneNode(true);
        
        // Chuyển ID từ modal_ về dạng bình thường
        const modalBoxId = clonedBox.id;
        const mainBoxId = modalBoxId.replace('modal_', '');
        clonedBox.id = mainBoxId;
        
        // Cập nhật tất cả ID con
        const childElements = clonedBox.querySelectorAll('[id]');
        childElements.forEach(el => {
            if (el.id.startsWith(modalBoxId)) {
                el.id = el.id.replace(modalBoxId, mainBoxId);
            }
        });
        
        // THÊM: Copy giá trị input từ modal
        const modalInputs = modalBox.querySelectorAll('input, textarea');
        const clonedInputs = clonedBox.querySelectorAll('input, textarea');
        modalInputs.forEach((input, index) => {
            if (clonedInputs[index]) {
                clonedInputs[index].value = input.value;
                
                // Copy thuộc tính checked cho checkbox/radio
                if (input.type === 'checkbox' || input.type === 'radio') {
                    clonedInputs[index].checked = input.checked;
                }
            }
        });
        
        // Cập nhật onclick của nút xóa
        const deleteBtn = clonedBox.querySelector('button[onclick*="removeModalStopReasonBox"]');
        if (deleteBtn) {
            deleteBtn.setAttribute('onclick', `removeStopReasonBox('${mainBoxId}')`);
        }
        
        // Cập nhật onclick của các nút thời gian
        const timeButtons = clonedBox.querySelectorAll('button[onclick*="setModalCurrentTime"]');
        timeButtons.forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            if (onclick) {
                const newOnclick = onclick.replace('setModalCurrentTime', 'setCurrentTime')
                                          .replace('modal_', '');
                btn.setAttribute('onclick', newOnclick);
            }
        });
        
        mainContainer.appendChild(clonedBox);
        
        // Setup event listeners cho main box
        setupDurationCalculation(mainBoxId);
    });
    
    // Cập nhật tiến độ
    updateInProgress();
}



// Thêm hàm mới - setup xử lý lý do dừng máy trong modal
function setupModalStopReasonHandling() {
    const modalStopReason = document.getElementById('modalStopReason');
    
    if (modalStopReason) {
        // XÓA event listener cũ
        modalStopReason.onchange = null;
        
        // THÊM event listener mới
        modalStopReason.onchange = function() {
            const reason = this.value;
            console.log('🔍 Modal chọn lý do:', reason);
            
            if (reason) {
                // Tạo box trong modal
                createModalStopReasonBox(reason);
                // Reset select
                this.selectedIndex = 0;
            }
        };
        
        console.log('✅ Đã setup modal stop reason handling');
    }
}

// Thêm hàm mới - tạo stop reason box trong modal
function createModalStopReasonBox(selectedReason) {
    const container = document.getElementById('modalAdditionalReasonsContainer');
    if (!container) return;
    
    const boxId = 'modal_stopReasonBox_' + Date.now();
    
    const boxHTML = `
        <div class="stop-reason-box border rounded p-3 mb-3" id="${boxId}" style="background-color: #f8f9fa;">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="text-danger mb-0">Lý do dừng máy: ${selectedReason}</h6>
                <button class="btn btn-sm btn-danger" onclick="removeModalStopReasonBox('${boxId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="fw-bold mb-1">Thời gian dừng máy</label>
                    <div class="position-relative">
                        <input type="datetime-local" class="form-control stop-time-input" id="${boxId}_stopTime">
                        <button class="btn btn-primary btn-sm position-absolute top-0 end-0 h-100" 
                                onclick="setModalCurrentTime('${boxId}_stopTime', '${boxId}_stopDisplay')" 
                                style="z-index: 10; font-size: 12px;">
                            Dừng máy
                        </button>
                    </div>
                    <div class="form-text" id="${boxId}_stopDisplay"></div>
                </div>
                
                <div class="col-md-6">
                    <label class="fw-bold mb-1">Thời gian chạy lại</label>
                    <div class="position-relative">
                        <input type="datetime-local" class="form-control resume-time-input" id="${boxId}_resumeTime">
                        <button class="btn btn-success btn-sm position-absolute top-0 end-0 h-100" 
                                onclick="setModalCurrentTime('${boxId}_resumeTime', '${boxId}_resumeDisplay')" 
                                style="z-index: 10; font-size: 12px;">
                            Chạy lại
                        </button>
                    </div>
                    <div class="form-text" id="${boxId}_resumeDisplay"></div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <label class="fw-bold mb-1">Lý do khác</label>
                    <input type="text" class="form-control other-reason-input" 
                           placeholder="Nhập lý do khác (nếu có)..." id="${boxId}_otherReason">
                </div>
                <div class="col-md-4">
                    <label class="fw-bold mb-1 text-primary">Thời gian dừng máy</label>
                    <input type="text" class="form-control bg-light duration-display" 
                           id="${boxId}_duration" readonly>
                </div>
            </div>
            
            <input type="hidden" class="reason-value" value="${selectedReason}">
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', boxHTML);
    setupModalDurationCalculation(boxId);


    // THÊM: Debug các nút được tạo
setTimeout(() => {
    const newBox = document.getElementById(boxId);
    const stopButton = newBox?.querySelector('button[onclick*="stopTime"]');
    const resumeButton = newBox?.querySelector('button[onclick*="resumeTime"]');
    
    console.log('🔍 Modal box created:', {
        boxId,
        stopButton: stopButton?.getAttribute('onclick'),
        resumeButton: resumeButton?.getAttribute('onclick')
    });
}, 50);


    // THAY THẾ phần event listeners cũ bằng:
    // Chỉ thêm event listener cho input "Lý do khác"
    setTimeout(() => {
        const newBox = document.getElementById(boxId);
        const otherReasonInput = newBox.querySelector('.other-reason-input');
        if (otherReasonInput) {
            otherReasonInput.addEventListener('input', function() {
                // Đồng bộ khi người dùng gõ xong (debounce)
                clearTimeout(window.modalSyncTimeout);
                window.modalSyncTimeout = setTimeout(() => {
                    syncModalDataToMainForm();
                }, 800);
            });
        }
    }, 100);



}

// Thêm các hàm helper cho modal
function removeModalStopReasonBox(boxId) {
    const box = document.getElementById(boxId);
    if (box) {
        box.remove();
        // Đồng bộ lại với form chính
        // syncModalDataToMainForm();
    }
}



function setModalCurrentTime(inputId, displayId) {
    console.log(`🕐 setModalCurrentTime called: ${inputId}, ${displayId}`);
    
    const now = new Date();
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);

    console.log('Input element:', input);
    console.log('Display element:', display);

    if (input) {
        const formattedTime = formatDateTimeLocal(now);
        input.value = formattedTime;
        
        console.log(`✅ Set value: ${formattedTime}`);
        
        // Trigger events để đảm bảo value được cập nhật
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
        console.error(`❌ Không tìm thấy input: ${inputId}`);
    }

    if (display) {
        display.textContent = formatDisplayTime(now);
        console.log(`✅ Set display: ${formatDisplayTime(now)}`);
    } else {
        console.error(`❌ Không tìm thấy display: ${displayId}`);
    }

    // Ẩn nút vừa bấm
    const button = document.querySelector(`button[onclick*="${inputId}"]`);
    if (button) {
        button.style.display = 'none';
        console.log(`✅ Ẩn nút cho ${inputId}`);
    } else {
        console.error(`❌ Không tìm thấy button cho ${inputId}`);
    }

    // Tính thời gian dừng máy
    const boxId = inputId.replace(/_(stopTime|resumeTime)$/, '');
    console.log(`🔍 BoxId extracted: ${boxId}`);
    
    setTimeout(() => {
        calculateModalStopDuration(boxId);
    }, 100);
}




function setupModalDurationCalculation(boxId) {
    const stopTimeInput = document.getElementById(boxId + '_stopTime');
    const resumeTimeInput = document.getElementById(boxId + '_resumeTime');

    if (stopTimeInput) {
        stopTimeInput.onchange = function() {
            setTimeout(() => calculateModalStopDuration(boxId), 100);
        };
    }

    if (resumeTimeInput) {
        resumeTimeInput.onchange = function() {
            setTimeout(() => calculateModalStopDuration(boxId), 100);
        };
    }
}

function calculateModalStopDuration(boxId) {
    const stopTimeInput = document.getElementById(boxId + '_stopTime');
    const resumeTimeInput = document.getElementById(boxId + '_resumeTime');
    const durationDisplay = document.getElementById(boxId + '_duration');

    if (stopTimeInput && resumeTimeInput && durationDisplay) {
        const stopValue = stopTimeInput.value;
        const resumeValue = resumeTimeInput.value;

        if (stopValue && resumeValue) {
            const stopTime = new Date(stopValue);
            const resumeTime = new Date(resumeValue);

            if (resumeTime > stopTime) {
                const diff = resumeTime - stopTime;
                const totalMinutes = Math.floor(diff / (1000 * 60));
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                
                let durationText = '';
                if (hours > 0) {
                    durationText += `${hours} giờ`;
                    if (minutes > 0) {
                        durationText += ` ${minutes} phút`;
                    }
                } else if (minutes > 0) {
                    durationText += `${minutes} phút`;
                } else {
                    durationText = '0 phút';
                }
                
                durationDisplay.value = durationText.trim();
            } else {
                durationDisplay.value = '0 phút';
            }
        }
    }



}







// ====================================================================================================================================
// MODAL KIỂM TRA THÔNG TIN BÁO CÁO
// ====================================================================================================================================

// Hiển thị modal kiểm tra thông tin
function showConfirmReportModal(endData) {
    // Tính toán thời gian
    const timeCalculation = calculateTimeDetails(endData);
    
    // THÊM: Kiểm tra nếu không tính được thời gian
    if (!timeCalculation) {
        showNotification('Lỗi: Không thể tính toán thời gian. Vui lòng kiểm tra thời gian bắt đầu.', 'error');
        return;
    }
    
    // Điền thông tin vào modal
    populateConfirmModal(endData, timeCalculation);
    
    // Kiểm tra tính hợp lệ của thời gian
    const isTimeValid = validateTimeCalculation(timeCalculation);
    
    // SỬA: Log để debug
    console.log('Time calculation:', timeCalculation);
    console.log('Is time valid:', isTimeValid);
    
    // Hiển thị hoặc ẩn thông báo lỗi
    toggleTimeError(isTimeValid, timeCalculation);
    
    // Hiển thị hoặc ẩn nút OK
    toggleFinalConfirmButton(isTimeValid);
    
    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('confirmReportModal'));
    modal.show();
}



// Tính toán chi tiết thời gian
function calculateTimeDetails(endData) {
    const now = new Date();
    
    // Lấy thời gian bắt đầu từ biến toàn cục startTime
    let startTimeValue = null;
    
    // Thử lấy từ biến toàn cục startTime
    if (window.startTime && window.startTime instanceof Date) {
        startTimeValue = window.startTime;
    } else if (startTime && startTime instanceof Date) {
        startTimeValue = startTime;
    } else {
        // Thử lấy từ element hiển thị
        const startTimeElement = document.getElementById('startTime');
        const startTimeText = startTimeElement ? startTimeElement.textContent.trim() : '';
        
        if (startTimeText && startTimeText !== '') {
            // Parse từ format hiển thị "dd/mm/yyyy, hh:mm:ss"
            startTimeValue = parseVietnameseDateTime(startTimeText);
        }
    }
    
    if (!startTimeValue || isNaN(startTimeValue.getTime())) {
        console.error('Không có thời gian bắt đầu hợp lệ');
        return null;
    }
    
    // Thời gian kết thúc = thời điểm hiện tại (khi bấm xác nhận)
    const endTime = now;
    
    // SỬA: Tổng thời gian từ bắt đầu đến kết thúc (tính cả giây)
    const totalMilliseconds = endTime - startTimeValue;
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const totalMinutesFromTime = Math.floor(totalSeconds / 60);
    
    // Canh máy (phút)
    const canhMayMinutes = parseInt(getInputValue('canhmay')) || 0;
    
    // SỬA: Tính tổng thời gian dừng máy (tính cả giây)
    const dungMayResult = calculateTotalStopTimeWithSeconds();
    const dungMayMinutes = dungMayResult.minutes;
    
    // Thời gian chạy máy = Tổng thời gian - Canh máy - Dừng máy
    const chayMayMinutes = totalMinutesFromTime - canhMayMinutes - dungMayMinutes;
    
    // Tổng thời gian tính toán = Chạy máy + Canh máy + Dừng máy
    const tongTinhToan = chayMayMinutes + canhMayMinutes + dungMayMinutes;
    
    return {
        startTime: startTimeValue,
        endTime,
        totalMilliseconds,
        totalSeconds,
        totalMinutesFromTime,
        canhMayMinutes,
        dungMayMinutes,
        dungMaySeconds: dungMayResult.seconds, // Lưu thêm giây
        chayMayMinutes,
        tongTinhToan
    };
}



// Parse thời gian từ format Việt Nam "dd/mm/yyyy, hh:mm:ss"
function parseVietnameseDateTime(timeString) {
    try {
        // SỬA: Xử lý nhiều format khác nhau
        let parts;
        
        // Format 1: "24/7/2025, 11:10:32"
        if (timeString.includes(', ')) {
            parts = timeString.split(', ');
        }
        // Format 2: "24/7/2025 11:10:32" 
        else if (timeString.includes(' ') && !timeString.includes(',')) {
            parts = timeString.split(' ');
        } else {
            return null;
        }
        
        if (parts.length !== 2) return null;
        
        const datePart = parts[0]; // "24/7/2025"
        const timePart = parts[1]; // "11:10:32"
        
        const dateComponents = datePart.split('/');
        const timeComponents = timePart.split(':');
        
        if (dateComponents.length !== 3) return null;
        if (timeComponents.length < 2 || timeComponents.length > 3) return null;
        
        const day = parseInt(dateComponents[0]);
        const month = parseInt(dateComponents[1]) - 1; // Month is 0-indexed
        const year = parseInt(dateComponents[2]);
        
        const hours = parseInt(timeComponents[0]);
        const minutes = parseInt(timeComponents[1]);
        const seconds = timeComponents.length === 3 ? parseInt(timeComponents[2]) : 0; // SỬA: Xử lý giây
        
        const date = new Date(year, month, day, hours, minutes, seconds);
        
        // Kiểm tra ngày tạo có hợp lệ
        if (isNaN(date.getTime())) return null;
        
        console.log('Parsed time:', timeString, '->', date);
        return date;
        
    } catch (error) {
        console.error('Lỗi parse thời gian:', error);
        return null;
    }
}


// SỬA: Tính tổng thời gian dừng máy (bao gồm cả giây)
function calculateTotalStopTimeWithSeconds() {
    let totalMilliseconds = 0;
    
    const stopBoxes = document.querySelectorAll('.stop-reason-box');
    stopBoxes.forEach(box => {
        const stopTime = box.querySelector('.stop-time-input')?.value;
        const resumeTime = box.querySelector('.resume-time-input')?.value;
        
        if (stopTime && resumeTime) {
            const start = new Date(stopTime);
            const end = new Date(resumeTime);
            if (end > start) {
                totalMilliseconds += (end - start);
            }
        }
    });
    
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    
    return {
        milliseconds: totalMilliseconds,
        seconds: totalSeconds,
        minutes: totalMinutes
    };
}

// Giữ lại hàm cũ để tương thích
function calculateTotalStopTime() {
    return calculateTotalStopTimeWithSeconds().minutes;
}

// Điền thông tin vào modal
function populateConfirmModal(endData, timeCalculation) {
    // Thông tin sản xuất
    document.getElementById('modalWS').textContent = getInputValue('ws') || 'Không có';
    document.getElementById('modalKhachHang').textContent = getInputValue('khachhang') || 'Không có';
    document.getElementById('modalMaSP').textContent = getInputValue('masp') || 'Không có';
    document.getElementById('modalMaGiay').textContent = getInputValue('magiay') || 'Không có';
    document.getElementById('modalThanhPhamIn').textContent = formatNumberUS(getInputValue('thanhphamin')) || '0';
    document.getElementById('modalPheLieu').textContent = getInputValue('phelieu') || '0';
    
    // SỬA: Thông tin thời gian với format đẹp hơn
    const startTimeText = timeCalculation.startTime ? timeCalculation.startTime.toLocaleString('vi-VN') : 'Không có';
    const endTimeText = timeCalculation.endTime ? timeCalculation.endTime.toLocaleString('vi-VN') : 'Không có';
    
    // SỬA: Format thời gian với giờ:phút (nếu có giây thì làm tròn)
    const formatMinutesToHourMinute = (totalMinutes) => {
        if (isNaN(totalMinutes)) return '0';
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}p`;
        } else {
            return `${minutes}p`;
        }
    };
    
    document.getElementById('modalTGBatDau').textContent = startTimeText;
    document.getElementById('modalTGKetThuc').textContent = endTimeText;
    document.getElementById('modalCanhMay').textContent = isNaN(timeCalculation.canhMayMinutes) ? '0' : timeCalculation.canhMayMinutes.toString();
    
    // SỬA: Hiển thị dừng máy với thông tin chi tiết
    const dungMayText = isNaN(timeCalculation.dungMayMinutes) ? '0' : 
        `${timeCalculation.dungMayMinutes}` + (timeCalculation.dungMaySeconds > timeCalculation.dungMayMinutes * 60 ? 
        ` (${timeCalculation.dungMaySeconds}s)` : '');
    
    document.getElementById('modalDungMay').textContent = dungMayText;
    document.getElementById('modalTGChayMay').textContent = isNaN(timeCalculation.chayMayMinutes) ? '0' : timeCalculation.chayMayMinutes.toString();
    document.getElementById('modalTongTG').textContent = isNaN(timeCalculation.tongTinhToan) ? '0' : timeCalculation.tongTinhToan.toString();
   
}



// Kiểm tra tính hợp lệ của thời gian 
function validateTimeCalculation(timeCalculation) {
    // Kiểm tra dữ liệu đầu vào
    if (!timeCalculation) {
        console.log('❌ Không có dữ liệu thời gian');
        return false;
    }
    
    // Kiểm tra các giá trị có phải số hợp lệ không
    const values = [
        timeCalculation.totalMinutesFromTime,
        timeCalculation.canhMayMinutes,
        timeCalculation.dungMayMinutes,
        timeCalculation.chayMayMinutes,
        timeCalculation.tongTinhToan
    ];
    
    for (let value of values) {
        if (isNaN(value) || value === null || value === undefined) {
            console.log('❌ Có giá trị thời gian không hợp lệ:', value);
            return false;
        }
    }
    
    // 1. Kiểm tra thời gian chạy máy không được âm
    if (timeCalculation.chayMayMinutes < 0) {
        console.log('❌ Thời gian chạy máy âm:', timeCalculation.chayMayMinutes);
        return false;
    }
    
    // SỬA: 2. Kiểm tra tổng thời gian với độ chính xác giây (cho phép sai lệch 1 phút)
    const difference = Math.abs(timeCalculation.tongTinhToan - timeCalculation.totalMinutesFromTime);
    if (difference > 1) { // Cho phép sai lệch tối đa 1 phút do làm tròn giây
        console.log('❌ Tổng thời gian không khớp (sai lệch >1 phút):', timeCalculation.tongTinhToan, '!=', timeCalculation.totalMinutesFromTime, 'Chênh:', difference);
        return false;
    }
    
    // 3. Kiểm tra các thời gian không được âm
    if (timeCalculation.canhMayMinutes < 0 || timeCalculation.dungMayMinutes < 0) {
        console.log('❌ Thời gian canh máy hoặc dừng máy âm');
        return false;
    }
    
    console.log('✅ Thời gian hợp lệ (sai lệch:', difference, 'phút)');
    return true;
}



// Hiển thị/ẩn thông báo lỗi thời gian
function toggleTimeError(isValid, timeCalculation) {
    const errorAlert = document.getElementById('timeErrorAlert');
    const errorDetails = document.getElementById('timeErrorDetails');
    
    if (!isValid) {
        let errorMessages = [];
        
        // SỬA: Kiểm tra NaN values
        if (!timeCalculation || isNaN(timeCalculation.totalMinutesFromTime)) {
            errorMessages.push('Lỗi tính toán thời gian cơ bản');
            errorMessages.push('Vui lòng kiểm tra thời gian bắt đầu');
        } else {
            // Kiểm tra thời gian chạy máy âm
            if (timeCalculation.chayMayMinutes < 0) {
                errorMessages.push(`Thời gian chạy máy lệch: <strong>${timeCalculation.chayMayMinutes} phút</strong>`);
                // errorMessages.push('Cần giảm thời gian canh máy hoặc thời gian dừng máy');
            }
            
            // Kiểm tra tổng thời gian không khớp
            if (timeCalculation.tongTinhToan !== timeCalculation.totalMinutesFromTime) {
                const difference = timeCalculation.tongTinhToan - timeCalculation.totalMinutesFromTime;
                const diffText = difference > 0 ? `nhiều hơn ${Math.abs(difference)} phút` : `ít hơn ${Math.abs(difference)} phút`;
                
                errorMessages.push(`Tổng thời gian tính toán ${diffText} so với thời gian thực tế`);
            }
        }
        
        const totalTime = isNaN(timeCalculation.totalMinutesFromTime) ? 'N/A' : timeCalculation.totalMinutesFromTime;
        const calculatedTime = isNaN(timeCalculation.tongTinhToan) ? 'N/A' : timeCalculation.tongTinhToan;
        
        errorDetails.innerHTML = `
            <div class="mt-2">
                <div>Thời gian thực tế: <strong>${totalTime} phút</strong></div>
                <div>Tổng thời gian tính toán: <strong>${calculatedTime} phút</strong></div>
                <div class="mt-2 text-danger">
                    ${errorMessages.map(msg => `<div>• ${msg}</div>`).join('')}
                </div>
                <div class="mt-2">
                    <small class="text-muted">Vui lòng đóng modal và kiểm tra lại thông tin.</small>
                </div>
            </div>
        `;
        
        errorAlert.classList.remove('d-none');
    } else {
        errorAlert.classList.add('d-none');
    }
}




// Hiển thị/ẩn nút OK cuối cùng
function toggleFinalConfirmButton(isValid) {
    const button = document.getElementById('finalConfirmButton');
    
    if (isValid) {
        button.style.display = 'inline-block';
        button.disabled = false;
        console.log('✅ Hiển thị nút OK - thời gian hợp lệ');
    } else {
        button.style.display = 'none';
        button.disabled = true;
        console.log('❌ Ẩn nút OK - thời gian không hợp lệ');
    }
}


// Xử lý khi bấm OK cuối cùng
async function handleFinalConfirm() {
    try {
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmReportModal'));
        modal.hide();
        
        // Thực hiện gửi báo cáo như code cũ
        await executeReportSubmission();
        
    } catch (error) {
        console.error('Lỗi khi gửi báo cáo cuối cùng:', error);
        showNotification('Lỗi khi gửi báo cáo: ' + error.message, 'error');
    }
}

// Thực hiện gửi báo cáo (code từ hàm handleConfirmReport cũ)
async function executeReportSubmission() {
    showInLoading('Đang xử lý báo cáo...', 'Cập nhật dữ liệu');

    // Thu thập dữ liệu kết thúc
    const endData = await collectEndReportData();
    if (!endData) {
        hideInLoading();
        return;
    }

    const startButton = document.querySelector('.btn-success');
    if (startButton) {
        startButton.textContent = 'Bắt Đầu';
        startButton.classList.remove('btn-warning');
        startButton.classList.add('btn-success');
        startButton.style.display = 'inline-block';
    }

    updateInLoadingText('Đang gửi báo cáo...', 'Cập nhật dữ liệu');

    // Gửi dữ liệu cập nhật
    const response = await fetch(`/api/bao-cao-in/update-end/${currentReportId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(endData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    // Cập nhật các báo cáo liên quan
    if (result.success) {
        await updateRelatedReportsAfterSubmit();
        
        const tuychonValue = getSelectValue('tuychon');
        if (['4', '5', '6'].includes(tuychonValue)) {
            console.log('🔄 Đã submit waste process, các báo cáo production sẽ được cập nhật thành phẩm');
        }
    }

    updateInLoadingText('Hoàn tất!', 'Báo cáo đã được lưu');
    await new Promise(resolve => setTimeout(resolve, 1000));

    hideInLoading();
    showNotification('Đã lưu báo cáo In thành công!', 'success');

    // Reset form
    await new Promise(resolve => setTimeout(resolve, 1000));
    resetFormButKeepUserFields();

    console.log('✅ Đã xác nhận báo cáo In thành công');
}







// ====================================================================================================================================
// GLOBAL FUNCTIONS - Expose ra window để có thể gọi từ HTML
// ====================================================================================================================================

// Expose các functions cần thiết ra global scope
window.viewReport = viewReport;
window.deleteReport = deleteReport;
window.deleteStopReport = deleteStopReport;
window.submitStopReportOnly = submitStopReportOnly;
window.setModalCurrentTime = setModalCurrentTime;  // <-- THÊM DÒNG NÀY
window.removeModalStopReasonBox = removeModalStopReasonBox;  // <-- VÀ DÒNG NÀY

console.log('✅ Đã khởi tạo hoàn tất hệ thống báo cáo In Offset');


// Load báo cáo chờ
async function loadWaitingReport(waitingId) {
    try {
        const machineId = getCurrentMachineId();
        const response = await fetch(`/api/bao-cao-in/cho/list/${machineId}`);
        if (response.ok) {
            const waitingList = await response.json();
            const waitingReport = waitingList.find(item => item.id === waitingId);
            if (waitingReport) {
                restoreWaitingReportToForm(waitingReport);
                document.getElementById('waitingListCard').classList.add('d-none');
            }
        }
    } catch (error) {
        console.error('Lỗi khi load báo cáo chờ:', error);
    }
}

// Xóa báo cáo chờ
async function deleteWaitingReport(waitingId) {  
    if (!confirm('Bạn có chắc muốn xóa báo cáo chờ này?')) return;
    
    try {
        const response = await fetch(`/api/bao-cao-in/cho/${waitingId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Đã xóa báo cáo chờ', 'success');
            loadWaitingListCard();
        }
    } catch (error) {
        console.error('Lỗi khi xóa báo cáo chờ:', error);
        showNotification('Lỗi khi xóa báo cáo chờ', 'error');
    }
}

// Expose global functions
window.loadWaitingReport = loadWaitingReport; 
window.deleteWaitingReport = deleteWaitingReport;
window.continueWaitingReport = continueWaitingReport;
window.skipWaitingReport = skipWaitingReport;



// ====================================================================================================================================
// KHỞI TẠO HỆ THỐNG KHI TRANG LOAD XONG
// ====================================================================================================================================

// Thêm vào cuối file để đảm bảo mọi thứ được khởi tạo
document.addEventListener('DOMContentLoaded', function () {
    console.log('🎯 Hệ thống báo cáo In đã sẵn sàng!');

    // Kiểm tra các dependencies
    if (typeof bootstrap === 'undefined') {
        console.warn('⚠️ Bootstrap chưa được tải');
    }

    if (typeof XLSX === 'undefined') {
        console.warn('⚠️ XLSX library chưa được tải - chức năng xuất Excel sẽ không hoạt động');
    }

    // Log trạng thái khởi tạo
    console.log('📊 Trạng thái khởi tạo:');
    console.log('- Máy hiện tại:', getCurrentMachineId());
    console.log('- User hiện tại:', getCurrentUser()?.username || 'Unknown');
    console.log('- Form state:', isStarted ? 'Đã bắt đầu' : 'Chưa bắt đầu');
    console.log('- Report ID:', currentReportId || 'Chưa có');
});

