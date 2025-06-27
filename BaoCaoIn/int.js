//! =================================================================
//! QUẢN LÝ LOCALSTORAGE THEO MÁY
//  Mô tả: Lưu và khôi phục dữ liệu form theo từng máy
//! =================================================================

// Lấy ID máy hiện tại từ URL hoặc selectedMachine
function getCurrentMachineId() {
    // Thử lấy từ URL params trước
    const urlParams = new URLSearchParams(window.location.search);
    const machineFromUrl = urlParams.get('machine');
    if (machineFromUrl) {
        return machineFromUrl;
    }

    // Nếu không có trong URL, lấy từ localStorage selectedMachine
    const selectedMachine = localStorage.getItem('selectedMachine');
    if (selectedMachine) {
        try {
            const machine = JSON.parse(selectedMachine);
            return machine.id;
        } catch (e) {
            console.error('Lỗi parse selectedMachine:', e);
        }
    }

    return null;
}



// Lưu dữ liệu form theo máy
function saveFormDataByMachine() {
    const machineId = getCurrentMachineId();
    if (!machineId) return;

    const formData = {
        // Thông tin cơ bản
        quandoc: document.getElementById('quandoc')?.value || '',
        ca: document.getElementById('ca')?.value || '',
        gioLamViec: document.getElementById('gioLamViec')?.value || '',
        maCa: document.getElementById('maCa')?.value || '',
        
        // Thông tin nhân sự
        truongmay: document.getElementById('truongmay')?.value || '',
        phumay1: document.getElementById('phumay1')?.value || '',
        phumay2: document.getElementById('phumay2')?.value || '',
        
        // Thông tin WS và sản phẩm
        ws: document.getElementById('ws')?.value || '',
        tuychon: document.getElementById('tuychon')?.value || '',
        
        // Thông tin từ WS (disabled fields - được điền tự động)
        khachhang: document.getElementById('khachhang')?.value || '',
        magiay: document.getElementById('magiay')?.value || '',
        masp: document.getElementById('masp')?.value || '',
        sldonhang: document.getElementById('sldonhang')?.value || '',
        somau: document.getElementById('somau')?.value || '',
        socon: document.getElementById('socon')?.value || '',
        kho: document.getElementById('kho')?.value || '',
        chat: document.getElementById('chat')?.value || '',
        soluongdain: document.getElementById('soluongdain')?.value || '',
        
        // Thông tin kỹ thuật
        sokem: document.getElementById('sokem')?.value || '',
        mau3tone: document.getElementById('mau3tone')?.checked || false,
        matsau: document.getElementById('matsau')?.checked || false,
        phukeo: document.getElementById('phukeo')?.value || '',
        phunbot: document.getElementById('phunbot')?.value || '',
        pass: document.getElementById('pass')?.value || '',
        
        // Thời gian
        startTime: document.body.getAttribute('data-start-time') || '',
        
        // Form kết thúc báo cáo
        canhmay: document.getElementById('canhmay')?.value || '',
        thanhphamin: document.getElementById('thanhphamin')?.value || '',
        phelieu: document.getElementById('phelieu')?.value || '',
        phelieutrang: document.getElementById('phelieutrang')?.value || '',
        slgiayream: document.getElementById('slgiayream')?.value || '',
        
        // Thông tin giấy
        magiay1: document.getElementById('magiay1')?.value || '',
        slgiaynhan1: document.getElementById('slgiaynhan1')?.value || '',
        magiay2: document.getElementById('magiay2')?.value || '',
        slgiaynhan2: document.getElementById('slgiaynhan2')?.value || '',
        magiay3: document.getElementById('magiay3')?.value || '',
        slgiaynhan3: document.getElementById('slgiaynhan3')?.value || '',
        
        // Ghi chú
        ghiChu: document.getElementById('ghiChu')?.value || '',
        
        // Trạng thái dừng máy
        machineStopStatus: machineStopStatusSelected || '',
        btnYesActive: document.getElementById('btnYes')?.classList.contains('active') || false,
        btnNoActive: document.getElementById('btnNo')?.classList.contains('active') || false,
        
        // Thông tin báo cáo dừng máy (nếu có)
        stopReason: document.getElementById('stopReason')?.value || '',
        stopTimeInput: document.getElementById('stopTimeInput')?.value || '',
        resumeTimeInput: document.getElementById('resumeTimeInput')?.value || '',
        otherReason: document.getElementById('otherReason')?.value || '',
        stopDuration: document.getElementById('stopDuration')?.value || '',
        
        // Thêm timestamp để biết lần cuối lưu
        lastSaved: new Date().toISOString()
    };

    const storageKey = `inOffsetFormData_machine_${machineId}`;
    localStorage.setItem(storageKey, JSON.stringify(formData));

    console.log(`Đã lưu dữ liệu form In Offset cho máy ${machineId}`);
}



// Khôi phục dữ liệu form theo máy
function restoreFormDataByMachine() {
    const machineId = getCurrentMachineId();
    if (!machineId) return;

    const storageKey = `inOffsetFormData_machine_${machineId}`;
    const savedData = localStorage.getItem(storageKey);

    if (!savedData) {
        console.log(`Không có dữ liệu đã lưu cho máy ${machineId}`);
        return;
    }

    try {
        const formData = JSON.parse(savedData);
        console.log(`Đang khôi phục dữ liệu cho máy ${machineId}:`, formData);

        // Khôi phục thông tin cơ bản
        if (formData.quandoc) document.getElementById('quandoc').value = formData.quandoc;
        if (formData.ca) document.getElementById('ca').value = formData.ca;
        if (formData.gioLamViec) document.getElementById('gioLamViec').value = formData.gioLamViec;
        if (formData.maCa) document.getElementById('maCa').value = formData.maCa;
        
        // Khôi phục thông tin nhân sự
        if (formData.truongmay) document.getElementById('truongmay').value = formData.truongmay;
        if (formData.phumay1) document.getElementById('phumay1').value = formData.phumay1;
        if (formData.phumay2) document.getElementById('phumay2').value = formData.phumay2;
        
        // Khôi phục thông tin WS và sản phẩm
        if (formData.ws) document.getElementById('ws').value = formData.ws;
        if (formData.tuychon) document.getElementById('tuychon').value = formData.tuychon;
        
        // Khôi phục thông tin từ WS (disabled fields)
        if (formData.khachhang) document.getElementById('khachhang').value = formData.khachhang;
        if (formData.magiay) document.getElementById('magiay').value = formData.magiay;
        if (formData.masp) document.getElementById('masp').value = formData.masp;
        if (formData.sldonhang) document.getElementById('sldonhang').value = formData.sldonhang;
        if (formData.somau) document.getElementById('somau').value = formData.somau;
        if (formData.socon) document.getElementById('socon').value = formData.socon;
        if (formData.kho) document.getElementById('kho').value = formData.kho;
        if (formData.chat) document.getElementById('chat').value = formData.chat;
        if (formData.soluongdain) document.getElementById('soluongdain').value = formData.soluongdain;
        
        // Khôi phục thông tin kỹ thuật
        if (formData.sokem) document.getElementById('sokem').value = formData.sokem;
        if (formData.mau3tone) document.getElementById('mau3tone').checked = formData.mau3tone;
        if (formData.matsau) document.getElementById('matsau').checked = formData.matsau;
        if (formData.phukeo) document.getElementById('phukeo').value = formData.phukeo;
        if (formData.phunbot) document.getElementById('phunbot').value = formData.phunbot;
        if (formData.pass) document.getElementById('pass').value = formData.pass;

        // Khôi phục thời gian bắt đầu
        if (formData.startTime) {
            document.body.setAttribute('data-start-time', formData.startTime);
            const startTime = new Date(formData.startTime);
            const startTimeElement = document.getElementById('startTime');
            if (startTimeElement) {
                startTimeElement.textContent = formatTime(startTime);
            }
            updateStartTimeDisplay(startTime);
            console.log('Đã khôi phục thời gian bắt đầu:', formatTime(startTime));
        }

        // Khôi phục form kết thúc báo cáo
        if (formData.canhmay) document.getElementById('canhmay').value = formData.canhmay;
        if (formData.thanhphamin) document.getElementById('thanhphamin').value = formData.thanhphamin;
        if (formData.phelieu) document.getElementById('phelieu').value = formData.phelieu;
        if (formData.phelieutrang) document.getElementById('phelieutrang').value = formData.phelieutrang;
        if (formData.slgiayream) document.getElementById('slgiayream').value = formData.slgiayream;
        
        // Khôi phục thông tin giấy
        if (formData.magiay1) document.getElementById('magiay1').value = formData.magiay1;
        if (formData.slgiaynhan1) document.getElementById('slgiaynhan1').value = formData.slgiaynhan1;
        if (formData.magiay2) document.getElementById('magiay2').value = formData.magiay2;
        if (formData.slgiaynhan2) document.getElementById('slgiaynhan2').value = formData.slgiaynhan2;
        if (formData.magiay3) document.getElementById('magiay3').value = formData.magiay3;
        if (formData.slgiaynhan3) document.getElementById('slgiaynhan3').value = formData.slgiaynhan3;
        
        // Khôi phục ghi chú
        if (formData.ghiChu) document.getElementById('ghiChu').value = formData.ghiChu;

        // Khôi phục trạng thái dừng máy
        if (formData.machineStopStatus) {
            machineStopStatusSelected = true;
            window.machineStopStatusSelected = true;
        }
        if (formData.btnYesActive) {
            const btnYes = document.getElementById('btnYes');
            if (btnYes) {
                btnYes.classList.add('active');
                btnYes.style.backgroundColor = '#007bff';
                btnYes.style.color = 'white';
                btnYes.style.border = '2px solid #007bff';
                const machineReport = document.getElementById('machineReport');
                if (machineReport) {
                    machineReport.style.display = 'block';
                }
            }
        }
        if (formData.btnNoActive) {
            const btnNo = document.getElementById('btnNo');
            if (btnNo) {
                btnNo.classList.add('active');
                btnNo.style.backgroundColor = '#007bff';
                btnNo.style.color = 'white';
                btnNo.style.border = '2px solid #007bff';
            }
        }

        // Khôi phục thông tin báo cáo dừng máy
        if (formData.stopReason) document.getElementById('stopReason').value = formData.stopReason;
        if (formData.stopTimeInput) document.getElementById('stopTimeInput').value = formData.stopTimeInput;
        if (formData.resumeTimeInput) document.getElementById('resumeTimeInput').value = formData.resumeTimeInput;
        if (formData.otherReason) document.getElementById('otherReason').value = formData.otherReason;
        if (formData.stopDuration) document.getElementById('stopDuration').value = formData.stopDuration;

        // Hiển thị thông báo khôi phục
        showNotification(`Đã khôi phục dữ liệu đã lưu cho máy này (${formData.lastSaved ? new Date(formData.lastSaved).toLocaleString() : 'không rõ thời gian'})`, 'info');

        // Cập nhật tiến độ sau khi khôi phục
        setTimeout(() => {
            updateProgress();
            calculateDerivedValues();

            // Nếu có WS, tự động tìm kiếm thông tin WS
            const wsElement = document.getElementById('ws');
            if (wsElement && wsElement.value && wsElement.value.trim() !== '') {
                console.log('Khôi phục dữ liệu - Tự động tìm kiếm WS:', wsElement.value);
                setTimeout(() => {
                    searchWSData(); // Giả sử có hàm tìm kiếm WS
                }, 1000);
            }

            // Cập nhật các trường phụ thuộc dựa trên tùy chọn
            const tuychonElement = document.getElementById('tuychon');
            if (tuychonElement && tuychonElement.value) {
                updateOptionsBasedOnTuychon(tuychonElement.value);
            }

            // Cập nhật số pass in dựa trên số màu
            const somauElement = document.getElementById('somau');
            if (somauElement && somauElement.value) {
                updatePassInOptions(somauElement.value);
            }
        }, 500);

    } catch (error) {
        console.error('Lỗi khi khôi phục dữ liệu form:', error);
        localStorage.removeItem(storageKey);
    }

    // Cập nhật hiển thị tên máy khi khôi phục dữ liệu
    const urlParams = new URLSearchParams(window.location.search);
    const machineName = urlParams.get('machineName');
    const displayMachineNameElement = document.getElementById('displayMachineName');
    if (displayMachineNameElement && machineName) {
        displayMachineNameElement.textContent = machineName;
        displayMachineNameElement.style.color = '#007bff';
        displayMachineNameElement.style.fontWeight = 'bold';
    }

    // Khôi phục report ID nếu có
    const savedReportId = localStorage.getItem('currentInOffsetReportId');
    const savedReportMachine = localStorage.getItem('currentInOffsetReportMachine');
    const currentMachine = getCurrentMachineId();

    if (savedReportId && savedReportMachine === currentMachine) {
        document.body.setAttribute('data-report-id', savedReportId);
        console.log('Đã khôi phục In Offset report ID:', savedReportId);
    }

    // Trigger sự kiện thay đổi cho các select để cập nhật UI
    ['ca', 'gioLamViec', 'tuychon', 'quandoc', 'phumay1', 'phumay2'].forEach(id => {
        const element = document.getElementById(id);
        if (element && element.value) {
            element.dispatchEvent(new Event('change'));
        }
    });
}



// Xóa dữ liệu đã lưu của máy hiện tại
function clearSavedFormDataByMachine() {
    const machineId = getCurrentMachineId();
    if (!machineId) return;

    const storageKey = `inOffsetFormData_machine_${machineId}`;
    localStorage.removeItem(storageKey);
    console.log(`Đã xóa dữ liệu đã lưu cho máy ${machineId}`);
}






//! ====================================================================================================================================
//! =================================================================
//! KHỞI TẠO VÀ QUẢN LÝ FORM
//  Mô tả: Xử lý ban đầu, load dữ liệu, và quản lý sự kiện chung
//! =================================================================

document.addEventListener('DOMContentLoaded', function () {
    // Kiểm tra đăng nhập
    checkAuthentication();

    // Khởi tạo form
    initializeForm();

    // Tải dữ liệu người dùng
    loadUserInfo();

    // Thiết lập các sự kiện
    setupEvents();

    // Gọi select của mã số cuộn
    setupMaSoCuonSelect();

    // Ẩn báo cáo dừng máy ban đầu
    const machineReport = document.getElementById('machineReport');
    if (machineReport) {
        machineReport.style.display = 'none';
    }

    // Đặt tiến độ ban đầu
    updateProgress();

    // Gọi trực tiếp hàm thiết lập sự kiện cho nút xác nhận
    // setupManualConfirmButton();

    // Debug - kiểm tra trạng thái các nút
    setTimeout(checkButtonsStatus, 1000);

    // Khởi tạo cơ chế cập nhật khi trang đã tải xong
    setupinOffsetEvents();

    setupinOffsetAdditionalEvents();
    setupinOffsetAutomaticDataUpdate();

    // THÊM: Thiết lập hệ thống bộ nhớ chờ offline
    setupNetworkMonitoring();

    // Đợi một chút để đảm bảo các phần tử đã được tạo
    setTimeout(() => {
        setupConfirmButtonEvent();
        setupManualConfirmButton();
    }, 1000);


    // Thiết lập sự kiện dừng máy với delay
    setTimeout(() => {
        setupDungMayEvents();
    }, 500);




    // Thiết lập kiểm tra định kỳ (5 phút/lần)
    const checkInterval = 30 * 1000;
    setInterval(checkForinOffsetUpdates, checkInterval);

    // Kiểm tra ngay khi trang tải xong
    setTimeout(checkForinOffsetUpdates, 5000);


});





//todo Thiết lập sự kiện cho checkbox mẫu 3 tone và mặt sau=========================
function setupCheckboxEvents() {
    // Lấy tất cả các checkbox trong form
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            // Cập nhật tiến độ khi thay đổi giá trị
            updateProgress();
        });
    });
}



//todo Khởi tạo form và thiết lập giá trị mặc định======================================================
function initializeForm() {
    // Đặt ngày hiện tại
    const today = new Date();
    const formattedDate = formatDate(today);

    // THÊM: Tự động điền máy từ URL hoặc selectedMachine
    const machineId = getCurrentMachineId();
    const urlParams = new URLSearchParams(window.location.search);
    const machineName = urlParams.get('machineName');

    if (machineName) {
        const mayElement = document.getElementById('may');
        if (mayElement) {
            mayElement.value = machineName;
            mayElement.disabled = true; // Không cho thay đổi
            console.log('Đã tự động điền máy:', machineName);
        }
    }


    // THÊM: Hiển thị tên máy trên header
    const displayMachineNameElement = document.getElementById('displayMachineName');
    if (displayMachineNameElement && machineName) {
        displayMachineNameElement.textContent = machineName;
        displayMachineNameElement.style.color = '#007bff';
        displayMachineNameElement.style.fontWeight = 'bold';
    }

    // Thiết lập giá trị mặc định cho các trường
    const caElement = document.getElementById('ca');
    if (caElement) {
        caElement.value = ""; // Để trống thay vì set giá trị tự động
    }

    // THÊM: Tự động điền thông tin người dùng
    loadUserInfo();

    // Thiết lập sự kiện cho checkbox
    setupCheckboxEvents();

    // THÊM: Khôi phục dữ liệu đã lưu cho máy này
    setTimeout(() => {
        restoreFormDataByMachine();
    }, 1000);

    // THÊM: Thiết lập auto-save
    setupAutoSaveFormData();

}




// Thiết lập tự động lưu dữ liệu form
function setupAutoSaveFormData() {
    // Danh sách các trường cần theo dõi để auto-save
    const fieldsToWatch = [
        'ca', 'gioLamViec', 'phumay1', 'phumay2', 'ws', 'magiay', 'tuychon', 'masp', 'sldonhang',
        'khachhang', 'sokem', 'somau', 'socon', 'phukeo', 'phunbot',
        'kho', 'chat', 'sopassin','soluongdain',
        // Form kết thúc
        'canhmay', 'thanhphamin', 'phelieu', 'phelieutrang', 'slgiayream',
        'magiay1', 'magiay2', 'magiay3', 'slgiaynhan1',
        'slgiaynhan2', 'slgiaynhan3', 'ghiChu'
    ];

    fieldsToWatch.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            // Lưu khi thay đổi giá trị
            element.addEventListener('change', saveFormDataByMachine);

            // Lưu khi nhập (với debounce để tránh lưu quá nhiều)
            if (element.type === 'text' || element.tagName === 'TEXTAREA') {
                element.addEventListener('input', debounce(saveFormDataByMachine, 1000));
            }
        }
    });


    // THÊM: Theo dõi checkbox
    const checkboxesToWatch = ['mau3tone', 'matsau'];
    checkboxesToWatch.forEach(checkboxId => {
        const element = document.getElementById(checkboxId);
        if (element) {
            element.addEventListener('change', saveFormDataByMachine);
        }
    });

    // THÊM: Theo dõi nút dừng máy
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    if (btnYes) btnYes.addEventListener('click', () => setTimeout(saveFormDataByMachine, 100));
    if (btnNo) btnNo.addEventListener('click', () => setTimeout(saveFormDataByMachine, 100));

    console.log('Đã thiết lập auto-save dữ liệu form theo máy');
}




//todo Kiểm tra đăng nhập và quyền truy cập========================================================
function checkAuthentication() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '/login/login.html';
        return false;
    }

    // Kiểm tra quyền truy cập vào module này
    // (Nếu cần triển khai thêm)

    return true;
}

//todo Tải thông tin người dùng hiện tại========================================================
function loadUserInfo() {
    const currentUser = getCurrentUser();
    const nguoiElement = document.getElementById('nguoi');

    if (currentUser && nguoiElement) {
        // Tạo chuỗi hiển thị
        let displayName = '';

        if (currentUser.fullname && currentUser.employee_id) {
            displayName = `${currentUser.fullname} - ${currentUser.employee_id}`;
        } else if (currentUser.fullname) {
            displayName = currentUser.fullname;
        } else if (currentUser.employee_id) {
            displayName = currentUser.employee_id;
        } else {
            displayName = currentUser.username || 'Unknown User';
        }

        nguoiElement.value = displayName;

        // Thêm data attribute để lưu thông tin user
        nguoiElement.setAttribute('data-user-id', currentUser.id);
        nguoiElement.setAttribute('data-username', currentUser.username);

        console.log('Đã tự động điền thông tin người dùng:', displayName);
    }



    // THÊM: Hiển thị thông tin máy đã chọn
    const machineId = getCurrentMachineId();
    if (machineId) {
        // Lấy thông tin máy từ localStorage hoặc URL
        const urlParams = new URLSearchParams(window.location.search);
        const machineName = urlParams.get('machineName');

        if (machineName) {
            // Hiển thị thông tin máy ở đâu đó trên form (có thể thêm element mới)
            console.log(`Đang làm việc với máy: ${machineName} (ID: ${machineId})`);

            // Có thể thêm vào title hoặc header
            const titleElement = document.querySelector('h1, .header-title');
            if (titleElement) {
                const originalTitle = titleElement.textContent;
                if (!originalTitle.includes('Máy:')) {
                    titleElement.textContent = `${originalTitle} - Máy: ${machineName}`;
                }
            }

            // THÊM: Cập nhật hiển thị tên máy trên header
            const displayMachineNameElement = document.getElementById('displayMachineName');
            if (displayMachineNameElement && machineName) {
                displayMachineNameElement.textContent = machineName;
                displayMachineNameElement.style.color = '#007bff';
                displayMachineNameElement.style.fontWeight = 'bold';
            }


        }
    }


}




//todo Thiết lập các sự kiện========================================================
function setupEvents() {
    // Sự kiện khi thay đổi số phiếu và thứ tự
    const ws = document.getElementById('ws');
    const mayElement = document.getElementById('may');

    // THÊM MỚI: Sự kiện cho giờ làm việc
    const gioLamViecElement = document.getElementById('gioLamViec');
    const maCaElement = document.getElementById('maCa');

    if (gioLamViecElement && maCaElement) {
        gioLamViecElement.addEventListener('change', function () {
            const maCa = convertGioLamViecToMaCa(this.value);
            maCaElement.value = maCa;

            // Cập nhật tiến độ
            updateProgress();
        });
    }


    if (soPhieuElement && thuTuElement) {
        // Xử lý sự kiện khi số phiếu thay đổi
        soPhieuElement.addEventListener('input', function () {
            // Reset dropdown thứ tự về giá trị mặc định
            thuTuElement.value = '-- Thứ tự --';

            // Xóa tất cả các option cũ (ngoại trừ option đầu tiên)
            while (thuTuElement.options.length > 1) {
                thuTuElement.remove(1);
            }
        });

        // Bỏ sự kiện change và sử dụng sự kiện blur (khi rời khỏi trường)
        soPhieuElement.addEventListener('blur', function () {
            searchPhieuCatGiay();

            // THÊM MỚI: Tự động cập nhật số tờ/pallet nếu đã có mã giấy và máy
            setTimeout(function () {
                const maVatTuElement = document.getElementById('maVatTu');
                if (maVatTuElement && maVatTuElement.value && mayElement && mayElement.value) {
                    autoFillSoToPallet();
                }
            }, 1000);
        });

        // Xử lý sự kiện cho trường thứ tự
        if (thuTuElement) {
            // Xóa sự kiện cũ nếu có
            thuTuElement.removeEventListener('change', searchPhieuCatGiay);

            // Thêm sự kiện change mới
            thuTuElement.addEventListener('change', function () {
                // Nếu đã chọn thứ tự và số phiếu không trống
                if (this.value !== '-- Thứ tự --' && soPhieuElement.value.trim() !== '' && soPhieuElement.value.trim() !== 'PC') {
                    console.log("Thay đổi thứ tự, gọi lại searchPhieuCatGiay");
                    searchPhieuCatGiay();

                    // THÊM MỚI: Tự động cập nhật số tờ/pallet sau khi tìm phiếu
                    setTimeout(autoFillSoToPallet, 1000);
                }
            });
        }
    }

    // Thêm sự kiện change cho trường máy
    if (mayElement) {
        mayElement.addEventListener('change', function () {
            updateProgress();

            // THÊM MỚI: Tự động cập nhật số tờ/pallet nếu đã có mã giấy
            const maVatTuElement = document.getElementById('maVatTu');
            if (maVatTuElement && maVatTuElement.value) {
                setTimeout(autoFillSoToPallet, 300);
            }
        });
    }

    // Thiết lập sự kiện cho select mã số cuộn
    setupMaSoCuonSelect();

    // Sự kiện khi thay đổi dữ liệu của form
    setupFormChangeEvents();

    // Sự kiện cho nút bắt đầu
    setupStartButtonEvent();

    // Sự kiện cho nút xác nhận
    setupConfirmButtonEvent();
}
