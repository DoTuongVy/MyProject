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
        ca: document.getElementById('ca')?.value || '',
        may: document.getElementById('may')?.value || '',
        gioLamViec: document.getElementById('gioLamViec')?.value || '',
        maCa: document.getElementById('maCa')?.value || '',
        soPhieu: document.getElementById('soPhieu')?.value || '',
        thuTu: document.getElementById('thuTu')?.value || '',
        ws: document.getElementById('ws')?.value || '',
        maVatTu: document.getElementById('maVatTu')?.value || '',
        khachhang: document.getElementById('khachhang')?.value || '',
        kho: document.getElementById('kho')?.value || '',
        dai: document.getElementById('dai')?.value || '',
        soto: document.getElementById('soto')?.value || '',
        tln: document.getElementById('tln')?.value || '',
        xadoiSelect: document.getElementById('xadoiSelect')?.value || '',
        maSoCuonSelect: document.getElementById('maSoCuonSelect')?.value || '',
        maSoCuon: document.getElementById('maSoCuon')?.value || '',
        nhapSoID: document.getElementById('nhapSoID')?.checked || false,
        inputSoID: document.getElementById('inputSoID')?.value || '',
        // Checkbox phần bắt đầu
        chuyenXen: document.getElementById('chuyenXen')?.checked || false,
        giayQuanLot: document.getElementById('giayQuanLot')?.checked || false,
        startTime: document.body.getAttribute('data-start-time') || '',




        // Form kết thúc báo cáo
        tongSoPallet: document.getElementById('tongSoPallet')?.value || '',
        soTamCatDuoc: document.getElementById('soTamCatDuoc')?.value || '',
        loi: document.getElementById('loi')?.value || '',
        dauCuon: document.getElementById('dauCuon')?.value || '',
        rachMop: document.getElementById('rachMop')?.value || '',
        pheLieuSanXuat: document.getElementById('pheLieuSanXuat')?.value || '',
        tlTra: document.getElementById('tlTra')?.value || '',
        suDungGiayTon: document.getElementById('suDungGiayTon')?.value || '',
        chieuCaoPallet: document.getElementById('chieuCaoPallet')?.value || '',
        thoiGianChuyenDoiPallet: document.getElementById('thoiGianChuyenDoiPallet')?.value || '',
        thoiGianKhac: document.getElementById('thoiGianKhac')?.value || '',
        khoXen: document.getElementById('khoXen')?.value || '',
        daiXen: document.getElementById('daiXen')?.value || '',
        soTamXen: document.getElementById('soTamXen')?.value || '',
        khoCatSai: document.getElementById('khoCatSai')?.value || '',
        daiCatSai: document.getElementById('daiCatSai')?.value || '',
        soTamCatSai: document.getElementById('soTamCatSai')?.value || '',
        ghiChu: document.getElementById('ghiChu')?.value || '',

        // Trạng thái dừng máy
        machineStopStatus: machineStopStatusSelected,
        btnYesActive: document.getElementById('btnYes')?.classList.contains('active') || false,
        btnNoActive: document.getElementById('btnNo')?.classList.contains('active') || false,



        // Thêm timestamp để biết lần cuối lưu
        lastSaved: new Date().toISOString()
    };

    const storageKey = `gmcFormData_machine_${machineId}`;
    localStorage.setItem(storageKey, JSON.stringify(formData));

    console.log(`Đã lưu dữ liệu form cho máy ${machineId}`);
}

// Khôi phục dữ liệu form theo máy
function restoreFormDataByMachine() {
    const machineId = getCurrentMachineId();
    if (!machineId) return;

    const storageKey = `gmcFormData_machine_${machineId}`;
    const savedData = localStorage.getItem(storageKey);

    if (!savedData) {
        console.log(`Không có dữ liệu đã lưu cho máy ${machineId}`);
        return;
    }

    try {
        const formData = JSON.parse(savedData);
        console.log(`Đang khôi phục dữ liệu cho máy ${machineId}:`, formData);

        // Khôi phục các trường form
        if (formData.ca) document.getElementById('ca').value = formData.ca;
        if (formData.gioLamViec) document.getElementById('gioLamViec').value = formData.gioLamViec;
        if (formData.maCa) document.getElementById('maCa').value = formData.maCa;
        if (formData.soPhieu) document.getElementById('soPhieu').value = formData.soPhieu;
        if (formData.thuTu && formData.thuTu !== '-- Thứ tự --') {
            const thuTuElement = document.getElementById('thuTu');
            if (thuTuElement) {
                // Tạo option nếu chưa có
                const option = Array.from(thuTuElement.options).find(opt => opt.value === formData.thuTu);
                if (!option) {
                    const newOption = document.createElement('option');
                    newOption.value = formData.thuTu;
                    newOption.textContent = formData.thuTu;
                    thuTuElement.appendChild(newOption);
                }
                thuTuElement.value = formData.thuTu;
                console.log('Đã khôi phục thứ tự:', formData.thuTu);
            }
        }
        if (formData.ws) document.getElementById('ws').value = formData.ws;
        if (formData.maVatTu) document.getElementById('maVatTu').value = formData.maVatTu;
        if (formData.khachhang) document.getElementById('khachhang').value = formData.khachhang;
        if (formData.kho) document.getElementById('kho').value = formData.kho;
        if (formData.dai) document.getElementById('dai').value = formData.dai;
        if (formData.soto) document.getElementById('soto').value = formData.soto;
        if (formData.tln) document.getElementById('tln').value = formData.tln;
        if (formData.xadoiSelect) document.getElementById('xadoiSelect').value = formData.xadoiSelect;
        if (formData.maSoCuonSelect) document.getElementById('maSoCuonSelect').value = formData.maSoCuonSelect;
        if (formData.maSoCuon) document.getElementById('maSoCuon').value = formData.maSoCuon;

        // Khôi phục radio button và input liên quan
        if (formData.nhapSoID) {
            document.getElementById('nhapSoID').checked = true;
            document.getElementById('inputSoID').disabled = false;
            if (formData.inputSoID) document.getElementById('inputSoID').value = formData.inputSoID;
        }

        // THÊM: Khôi phục thời gian bắt đầu
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


        // THÊM: Khôi phục checkbox phần bắt đầu
        if (formData.chuyenXen) document.getElementById('chuyenXen').checked = true;
        if (formData.giayQuanLot) document.getElementById('giayQuanLot').checked = true;

        // THÊM: Khôi phục form kết thúc
        if (formData.tongSoPallet) document.getElementById('tongSoPallet').value = formData.tongSoPallet;
        if (formData.soTamCatDuoc) document.getElementById('soTamCatDuoc').value = formData.soTamCatDuoc;
        if (formData.loi) document.getElementById('loi').value = formData.loi;
        if (formData.dauCuon) document.getElementById('dauCuon').value = formData.dauCuon;
        if (formData.rachMop) document.getElementById('rachMop').value = formData.rachMop;
        if (formData.pheLieuSanXuat) document.getElementById('pheLieuSanXuat').value = formData.pheLieuSanXuat;
        if (formData.tlTra) document.getElementById('tlTra').value = formData.tlTra;
        if (formData.suDungGiayTon) document.getElementById('suDungGiayTon').value = formData.suDungGiayTon;
        if (formData.chieuCaoPallet) document.getElementById('chieuCaoPallet').value = formData.chieuCaoPallet;
        if (formData.thoiGianChuyenDoiPallet) document.getElementById('thoiGianChuyenDoiPallet').value = formData.thoiGianChuyenDoiPallet;
        if (formData.thoiGianKhac) document.getElementById('thoiGianKhac').value = formData.thoiGianKhac;
        if (formData.khoXen) document.getElementById('khoXen').value = formData.khoXen;
        if (formData.daiXen) document.getElementById('daiXen').value = formData.daiXen;
        if (formData.khoCatSai) document.getElementById('khoCatSai').value = formData.khoCatSai;
        if (formData.daiCatSai) document.getElementById('daiCatSai').value = formData.daiCatSai;
        if (formData.soTamCatSai) document.getElementById('soTamCatSai').value = formData.soTamCatSai;
        if (formData.ghiChu) document.getElementById('ghiChu').value = formData.ghiChu;

        // THÊM: Khôi phục trạng thái dừng máy
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
                document.getElementById('machineReport').style.display = 'block';
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

        // Hiển thị thông báo khôi phục
        showNotification(`Đã khôi phục dữ liệu đã lưu cho máy này (${formData.lastSaved ? new Date(formData.lastSaved).toLocaleString() : 'không rõ thời gian'})`, 'info');

        // Cập nhật tiến độ sau khi khôi phục
        setTimeout(() => {
            updateProgress();
            calculateDerivedValues();

            // THÊM: Nếu có số phiếu và thứ tự, tự động tìm kiếm dữ liệu
            const soPhieuElement = document.getElementById('soPhieu');
            const thuTuElement = document.getElementById('thuTu');

            if (soPhieuElement && thuTuElement &&
                soPhieuElement.value && soPhieuElement.value !== 'PCG' &&
                thuTuElement.value && thuTuElement.value !== '-- Thứ tự --') {

                console.log('Khôi phục dữ liệu - Tự động tìm kiếm phiếu:', soPhieuElement.value, thuTuElement.value);
                setTimeout(() => {
                    searchPhieuCatGiay();
                }, 1000);
            }
        }, 500);

    } catch (error) {
        console.error('Lỗi khi khôi phục dữ liệu form:', error);
        localStorage.removeItem(storageKey);
    }

    // THÊM: Cập nhật hiển thị tên máy khi khôi phục dữ liệu
    const urlParams = new URLSearchParams(window.location.search);
    const machineName = urlParams.get('machineName');
    const displayMachineNameElement = document.getElementById('displayMachineName');
    if (displayMachineNameElement && machineName) {
        displayMachineNameElement.textContent = machineName;
        displayMachineNameElement.style.color = '#007bff';
        displayMachineNameElement.style.fontWeight = 'bold';
    }



    // THÊM: Khôi phục report ID nếu có
const savedReportId = localStorage.getItem('currentReportId');
const savedReportMachine = localStorage.getItem('currentReportMachine');
const currentMachine = getCurrentMachineId();

if (savedReportId && savedReportMachine === currentMachine) {
    document.body.setAttribute('data-report-id', savedReportId);
    console.log('Đã khôi phục report ID:', savedReportId);
}


}

// Xóa dữ liệu đã lưu của máy hiện tại
function clearSavedFormDataByMachine() {
    const machineId = getCurrentMachineId();
    if (!machineId) return;

    const storageKey = `gmcFormData_machine_${machineId}`;
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
    setupGMCEvents();

    setupGMCAdditionalEvents();
    setupGMCAutomaticDataUpdate();

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
    setInterval(checkForGMCUpdates, checkInterval);

    // Kiểm tra ngay khi trang tải xong
    setTimeout(checkForGMCUpdates, 5000);


});



// Cài đặt các hàm mới vào trang
document.addEventListener('DOMContentLoaded', function () {
    // Ghi đè các hàm cũ bằng phiên bản mới
    window.getSoToPallet = getSoToPallet;
    window.getMaGiayDoDay = getMaGiayDoDay;
    window.autoFillSoToPallet = autoFillSoToPallet;
    window.calculateDerivedValues = calculateDerivedValues;
    window.updateGMCReportWithNewData = updateGMCReportWithNewData;
    window.setupSoToPalletAutoFill = setupSoToPalletAutoFill;

    // Thiết lập lại sự kiện tự động cập nhật
    setupSoToPalletAutoFill();

    // Chạy một lần tính toán để cập nhật giá trị ban đầu
    setTimeout(() => {
        calculateDerivedValues();

        // Nếu đã có mã giấy và máy, tự động cập nhật số tờ/pallet
        const mayElement = document.getElementById('may');
        const maVatTuElement = document.getElementById('maVatTu');

        if (mayElement && mayElement.value && maVatTuElement && maVatTuElement.value) {
            console.log("Đã có sẵn mã giấy và máy, cập nhật số tờ/pallet");
            autoFillSoToPallet();
        }
    }, 1000);

    console.log("✅ Đã nâng cấp thành công hệ thống xử lý số tờ/pallet và độ dày giấy từ định mức");
});



//todo Hàm xử lý sự kiện cho trường số phiếu để tránh trùng lặp "PCG" khi dán===========================================
document.addEventListener('DOMContentLoaded', function () {
    const soPhieuElement = document.getElementById('soPhieu');
    if (soPhieuElement) {
        // Thiết lập giá trị mặc định cho số phiếu
        if (!soPhieuElement.value) soPhieuElement.value = "PCG";

        // ===== MỚI: XỬ LÝ SỰ KIỆN PASTE =====
        soPhieuElement.addEventListener('paste', function (e) {
            // Ngăn chặn hành vi paste mặc định
            e.preventDefault();

            // Lấy văn bản được dán
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');

            // Lấy vị trí selection hiện tại
            const startPos = this.selectionStart;
            const endPos = this.selectionEnd;

            // Xử lý văn bản được dán - chỉ lấy phần số
            let processedText = pastedText;

            // Nếu text được dán bắt đầu bằng PCG, bỏ 3 ký tự đầu
            if (processedText.toUpperCase().startsWith('PCG')) {
                processedText = processedText.substring(3);
            }

            // Chỉ lấy phần số (loại bỏ tất cả ký tự không phải số)
            processedText = processedText.replace(/[^0-9]/g, '');

            // Giới hạn 8 số
            if (processedText.length > 8) {
                processedText = processedText.substring(0, 8);
            }

            // Lấy giá trị hiện tại của input
            let currentValue = this.value;

            // Nếu không có selection, chỉ thêm vào vị trí hiện tại
            if (startPos === endPos) {
                // Chèn vào vị trí con trỏ
                const newValue = currentValue.substring(0, startPos) + processedText + currentValue.substring(endPos);
                this.value = newValue.startsWith('PCG') ? newValue : 'PCG' + newValue;
            } else {
                // Thay thế phần text đã chọn
                const newValue = currentValue.substring(0, startPos) + processedText + currentValue.substring(endPos);
                this.value = newValue.startsWith('PCG') ? newValue : 'PCG' + newValue;
            }

            // Đặt lại vị trí con trỏ sau khi paste
            const newCursorPos = Math.min(startPos + processedText.length, this.value.length);
            this.setSelectionRange(newCursorPos, newCursorPos);

            // Kích hoạt sự kiện input để xử lý các trường hợp khác
            this.dispatchEvent(new Event('input'));
        });

        // ===== MỚI: XỬ LÝ SỰ KIỆN INPUT - CHỈ CHO PHÉP SỐ =====
        soPhieuElement.addEventListener('input', function () {
            let value = this.value;
            let cursorPosition = this.selectionStart;

            // Nếu giá trị rỗng, đặt lại thành PCG
            if (!value) {
                this.value = "PCG";
                this.setSelectionRange(3, 3);
                return;
            }

            // Nếu không bắt đầu bằng PCG, thêm PCG vào đầu
            if (!value.toUpperCase().startsWith('PCG')) {
                this.value = "PCG" + value;
                this.setSelectionRange(cursorPosition + 3, cursorPosition + 3);
                return;
            }

            // Tách phần PCG và phần số
            const prefix = value.substring(0, 3); // "PCG"
            let numberPart = value.substring(3); // Phần sau PCG

            // Chỉ giữ lại số trong phần sau PCG
            const cleanNumberPart = numberPart.replace(/[^0-9]/g, '');

            // Giới hạn 8 số
            const limitedNumberPart = cleanNumberPart.substring(0, 8);

            // Gộp lại
            const finalValue = prefix + limitedNumberPart;

            // Nếu giá trị thay đổi, cập nhật
            if (this.value !== finalValue) {
                this.value = finalValue;

                // Điều chỉnh vị trí con trỏ
                const newCursorPosition = Math.min(cursorPosition, finalValue.length);
                this.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        });

        // ===== MỚI: XỬ LÝ SỰ KIỆN KEYDOWN - CHẶN XÓA PCG VÀ CHỈ CHO PHÉP SỐ =====
        soPhieuElement.addEventListener('keydown', function (e) {
            const cursorPos = this.selectionStart;
            const cursorEnd = this.selectionEnd;

            // ===== XỬ LÝ TRƯỜNG HỢP CHỌN HẾT VÀ XÓA (ƯU TIÊN) =====
            if ((e.key === 'Backspace' || e.key === 'Delete') &&
                cursorPos === 0 && cursorEnd === this.value.length) {
                e.preventDefault();
                this.value = "PCG";
                this.setSelectionRange(3, 3);
                return;
            }

            // ===== XỬ LÝ TRƯỜNG HỢP CHỌN TOÀN BỘ PCG VÀ XÓA =====
            if ((e.key === 'Backspace' || e.key === 'Delete') &&
                cursorPos <= 3 && cursorEnd >= 3) {
                e.preventDefault();
                this.value = "PCG";
                this.setSelectionRange(3, 3);
                return;
            }

            // Ngăn xóa khi con trỏ ở vị trí 0-3 (phần PCG) - chỉ áp dụng khi không select
            if (cursorPos === cursorEnd) {
                if ((e.key === 'Backspace' && cursorPos <= 3) ||
                    (e.key === 'Delete' && cursorPos < 3)) {
                    e.preventDefault();
                    return;
                }
            }

            // ===== MỚI: CHỈ CHO PHÉP NHẬP SỐ (trừ các phím điều khiển) =====
            const allowedKeys = [
                'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'Home', 'End', 'PageUp', 'PageDown'
            ];

            // Cho phép Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
                return;
            }

            // Nếu không phải phím điều khiển và không phải số, ngăn chặn
            if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                e.preventDefault();
                return;
            }

            // Nếu là số, kiểm tra giới hạn 8 số (sau PCG)
            if (/^[0-9]$/.test(e.key)) {
                const numberPart = this.value.substring(3);
                if (numberPart.length >= 8 && cursorPos >= 3 && cursorPos === cursorEnd) {
                    e.preventDefault();
                    return;
                }
            }
        });

        // Thêm sự kiện focus để đặt con trỏ sau PCG
        soPhieuElement.addEventListener('focus', function () {
            if (this.value === 'PCG') {
                setTimeout(() => {
                    this.setSelectionRange(3, 3);
                }, 0);
            }
        });

        // Thêm sự kiện click để đảm bảo không click vào phần PCG
        soPhieuElement.addEventListener('click', function () {
            if (this.selectionStart < 3) {
                setTimeout(() => {
                    this.setSelectionRange(3, 3);
                }, 0);
            }
        });
    }
});



//todo Thiết lập sự kiện cho select xả đôi==================================================
function setupXaDoiSelect() {
    const xaDoiSelect = document.getElementById('xadoiSelect');

    if (!xaDoiSelect) return;

    xaDoiSelect.addEventListener('change', function () {
        // Cập nhật tiến độ khi thay đổi giá trị
        updateProgress();
    });
}

//todo Thiết lập sự kiện cho checkbox chuyển xén và giấy quấn/lót=========================
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

    // Thiết lập giá trị mặc định cho số phiếu
    const soPhieuElement = document.getElementById('soPhieu');
    if (soPhieuElement && !soPhieuElement.value) soPhieuElement.value = "PCG";

    // THÊM: Tự động điền thông tin người dùng
    loadUserInfo();

    // Thiết lập sự kiện cho select xả đôi
    setupXaDoiSelect();

    // Thiết lập sự kiện cho checkbox
    setupCheckboxEvents();

    // THÊM: Kiểm tra máy đã chọn và kích hoạt tính toán
    // const machineId = getCurrentMachineId();
    if (machineId) {
        console.log('Đã có máy được chọn từ localStorage:', machineId);
        // Kích hoạt tính toán với máy đã chọn
        setTimeout(() => {
            const maVatTuElement = document.getElementById('maVatTu');
            if (maVatTuElement && maVatTuElement.value) {
                autoFillSoToPallet();
            }
            calculateDerivedValues();
        }, 1000);
    }


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
        'ca', 'gioLamViec', 'soPhieu', 'thuTu', 'ws', 'maVatTu',
        'khachhang', 'kho', 'dai', 'soto', 'tln', 'xadoiSelect',
        'maSoCuonSelect', 'maSoCuon', 'inputSoID',
        // Form kết thúc
        'tongSoPallet', 'soTamCatDuoc', 'loi', 'dauCuon', 'rachMop',
        'pheLieuSanXuat', 'tlTra', 'suDungGiayTon', 'chieuCaoPallet',
        'thoiGianChuyenDoiPallet', 'thoiGianKhac', 'khoXen', 'daiXen',
        'khoCatSai', 'daiCatSai', 'soTamCatSai', 'ghiChu'
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

    // Theo dõi radio button nhập số ID
    const nhapSoIDRadio = document.getElementById('nhapSoID');
    const khongCoIDRadio = document.getElementById('khongCoID');

    if (nhapSoIDRadio) nhapSoIDRadio.addEventListener('change', saveFormDataByMachine);
    if (khongCoIDRadio) khongCoIDRadio.addEventListener('change', saveFormDataByMachine);


    // THÊM: Theo dõi checkbox
    const checkboxesToWatch = ['chuyenXen', 'giayQuanLot'];
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
    const soPhieuElement = document.getElementById('soPhieu');
    const thuTuElement = document.getElementById('thuTu');
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

// Ghi đè hàm setupEvents
window.setupEvents = setupEvents;

// Hàm debounce để tránh gọi nhiều lần khi người dùng đang nhập
function debounce(func, delay) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

//todo Lấy thông tin người dùng từ session storage========================================================
function getCurrentUser() {
    const userString = sessionStorage.getItem('currentUser');
    return userString ? JSON.parse(userString) : null;
}

//todo Định dạng ngày tháng========================================================
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}


document.addEventListener('DOMContentLoaded', function () {
    // Reset trạng thái gửi khi trang được tải
    isSubmitting = false;

    console.log('Đã reset trạng thái gửi báo cáo');
});


//todo Hàm reset form=======================================================================================
function resetForm() {
    // Reset trạng thái gửi
    isSubmitting = false;

    // Phần reset form các trường khác giữ nguyên...
    const startFields = [
        'soPhieu', 'thuTu', 'ws',
        'maVatTu', 'khachhang', 'kho', 'dai', 'soto',
        'tln', 'inputSoID'
    ];

    // GIỮ LẠI GIÁ TRỊ CÁC TRƯỜNG KHÔNG RESET (theo máy)
    const preservedValues = {
        ca: document.getElementById('ca')?.value || '',
        may: document.getElementById('may')?.value || '',
        gioLamViec: document.getElementById('gioLamViec')?.value || '',
        maCa: document.getElementById('maCa')?.value || ''
    };

    // THÊM: Lưu các giá trị này vào localStorage sau khi reset
    setTimeout(() => {
        if (preservedValues.ca) document.getElementById('ca').value = preservedValues.ca;
        if (preservedValues.gioLamViec) document.getElementById('gioLamViec').value = preservedValues.gioLamViec;
        if (preservedValues.maCa) document.getElementById('maCa').value = preservedValues.maCa;
        saveFormDataByMachine(); // Lưu lại sau khi reset
    }, 200);

    startFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            if (fieldId === 'soPhieu') {
                element.value = 'PCG';
            } else if (fieldId === 'thuTu') {
                element.value = '-- Thứ tự --'; // Sửa lại giá trị mặc định
            } else {
                element.value = '';
            }
        }
    });

    // THÊM MỚI: Reset mã ca
    const maCaElement = document.getElementById('maCa');
    if (maCaElement) {
        maCaElement.value = '';
    }

    // Reset select xả đôi
    const xadoiSelect = document.getElementById('xadoiSelect');
    if (xadoiSelect) xadoiSelect.selectedIndex = 0;

    // Reset dropdown mã số cuộn
    const maSoCuonSelect = document.getElementById('maSoCuonSelect');
    const maSoCuonInput = document.getElementById('maSoCuon');
    const maSoCuonInputContainer = document.getElementById('maSoCuonInputContainer');

    if (maSoCuonSelect) maSoCuonSelect.selectedIndex = 0;
    if (maSoCuonInput) maSoCuonInput.value = '';
    if (maSoCuonInputContainer) maSoCuonInputContainer.style.display = 'none';

    // Reset radio button số ID
    const khongCoID = document.getElementById('khongCoID');
    if (khongCoID) khongCoID.checked = true;

    const inputSoID = document.getElementById('inputSoID');
    if (inputSoID) {
        inputSoID.disabled = true;
        inputSoID.classList.remove('is-invalid');
        const invalidFeedback = inputSoID.nextElementSibling;
        if (invalidFeedback && invalidFeedback.classList.contains('invalid-feedback')) {
            invalidFeedback.remove();
        }
    }

    // Reset các checkbox
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // THÊM: KHÔI PHỤC CÁC GIÁ TRỊ ĐÃ GIỮ LẠI
    Object.keys(preservedValues).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element && preservedValues[fieldId]) {
            element.value = preservedValues[fieldId];
        }
    });

    // RESET PHẦN KẾT THÚC BÁO CÁO
    const endFields = [
        'tongSoPallet', 'soTamCatDuoc', 'loi', 'dauCuon', 'rachMop', 'pheLieuSanXuat',
        'tlTra', 'suDungGiayTon', 'chieuCaoPallet', 'thoiGianChuyenDoiPallet', 'thoiGianKhac',
        'khoXen', 'daiXen', 'khoCatSai', 'daiCatSai', 'soTamCatSai',
        'tlTraDuKien', 'soTamThamChieu', 'ghiChu'
    ];

    endFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = '';
        }
    });

    // Reset phần dừng máy với màu chính xác
    const btnNo = document.getElementById('btnNo');
    const btnYes = document.getElementById('btnYes');
    const machineReport = document.getElementById('machineReport');

    if (btnNo && btnYes && machineReport) {
        // QUAN TRỌNG: Reset đúng màu và trạng thái
        btnNo.style.backgroundColor = 'white';
        btnNo.style.color = 'black';
        btnNo.style.border = '2px solid #ccc';
        btnNo.classList.remove('active'); // Xóa class active

        btnYes.style.backgroundColor = 'white';
        btnYes.style.color = 'black';
        btnYes.style.border = '2px solid #ccc';
        btnYes.classList.remove('active'); // Xóa class active

        machineReport.style.display = 'none';

        // QUAN TRỌNG: Reset biến trạng thái toàn cục
        window.machineStopStatusSelected = false; // Reset về false
        machineStopStatusSelected = false; // Reset biến local nếu có

        // Reset các trường trong báo cáo dừng máy
        const stopReason = document.getElementById('stopReason');
        const stopTimeInput = document.getElementById('stopTimeInput');
        const resumeTimeInput = document.getElementById('resumeTimeInput');
        const stopTimeButton = document.getElementById('stopTimeButton');
        const resumeTimeButton = document.getElementById('resumeTimeButton');
        const stopTimeDisplay = document.getElementById('stopTimeDisplay');
        const resumeTimeDisplay = document.getElementById('resumeTimeDisplay');
        const stopDuration = document.getElementById('stopDuration');
        const otherReason = document.getElementById('otherReason');

        if (stopReason) stopReason.selectedIndex = 0;
        if (stopTimeInput) stopTimeInput.value = '';
        if (resumeTimeInput) resumeTimeInput.value = '';
        if (stopTimeButton) stopTimeButton.style.display = 'block';
        if (resumeTimeButton) resumeTimeButton.style.display = 'block';
        if (stopTimeDisplay) stopTimeDisplay.textContent = '';
        if (resumeTimeDisplay) resumeTimeDisplay.textContent = '';
        if (stopDuration) stopDuration.value = '';
        if (otherReason) otherReason.value = '';

        const timeInputs = document.querySelectorAll('.time-inputs');
        const additionalFields = document.querySelector('.additional-fields');

        if (timeInputs) {
            timeInputs.forEach(input => {
                input.style.display = 'none';
            });
        }

        if (additionalFields) additionalFields.style.display = 'none';

        const additionalReasonsContainer = document.getElementById('additionalReasonsContainer');
        if (additionalReasonsContainer) {
            additionalReasonsContainer.innerHTML = '';
        }

        const submitStopOnlyButton = document.getElementById('submitStopOnlyButton');
        if (submitStopOnlyButton) {
            submitStopOnlyButton.style.display = 'none';
            const helpText = document.getElementById('stopOnlyHelpText');
            if (helpText) helpText.style.display = 'none';
        }

        console.log('✓ Đã reset trạng thái dừng máy - machineStopStatusSelected:', machineStopStatusSelected);
    }

    // THÊM: RESET HOÀN TOÀN THỜI GIAN BẮT ĐẦU VÀ NÚT BẮT ĐẦU
    const startTimeElement = document.getElementById('startTime');
    if (startTimeElement) {
        startTimeElement.textContent = '';
    }

    // THÊM: Ẩn thời gian bắt đầu trên thanh tiến độ
    hideStartTimeDisplay();

    // Xóa dữ liệu thời gian đã lưu
    document.body.removeAttribute('data-start-time');
    document.body.removeAttribute('data-end-time');

    // RESET NÚT BẮT ĐẦU VỀ TRẠNG THÁI BAN ĐẦU
    const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');
    if (startButton) {
        startButton.style.display = 'none'; // Ẩn ban đầu, sẽ hiện khi đủ 100%
        startButton.innerHTML = 'Bắt Đầu';
        startButton.disabled = false;
        startButton.classList.remove('btn-secondary');
        startButton.classList.add('btn-success');
        startButton.removeAttribute('data-started');
        console.log('✓ Đã reset nút Bắt Đầu và ẩn thời gian hiển thị');
    }

    // RESET NÚT XÁC NHẬN VỀ TRẠNG THÁI BAN ĐẦU
    const confirmButton = document.getElementById('confirmButton'); // SỬA: Dùng ID
    if (confirmButton) {
        confirmButton.style.setProperty('display', 'none', 'important'); // SỬA: Force ẩn
        confirmButton.style.setProperty('visibility', 'hidden', 'important');
        confirmButton.disabled = false;
        confirmButton.innerHTML = '<i class="fas fa-check-circle me-2"></i>Xác nhận';
        confirmButton.removeAttribute('data-submitting');
        confirmButton.classList.remove('show');
        console.log('✓ Đã reset nút Xác Nhận về trạng thái ban đầu');
    }

    // Cập nhật tiến độ
    if (typeof updateProgress === 'function') {
        updateProgress();
    }

    // THÊM: Force update lại nút xác nhận sau reset
    setTimeout(() => {
        console.log('=== FORCE UPDATE SAU RESET ===');
        updateProgress(); // Gọi lại lần nữa để đảm bảo

        // Kiểm tra và ẩn nút xác nhận nếu cần
        const confirmButton = document.getElementById('confirmButton');
        if (confirmButton) {
            const shouldShow = checkConfirmButtonConditions();
            if (!shouldShow) {
                confirmButton.style.setProperty('display', 'none', 'important');
                confirmButton.classList.remove('show');
                console.log('✓ Đã ẩn nút xác nhận sau reset do không đủ điều kiện');
            }
        }
    }, 100); // Delay nhỏ để đảm bảo tất cả trạng thái đã được cập nhật

    // Hiển thị thông báo
    if (typeof showNotification === 'function') {
        document.body.removeAttribute('data-report-id');

        console.log('✓ Đã xóa ID báo cáo đã lưu trong reset');
        showNotification('Form đã được reset thành công!', 'success');
    } else {
        alert('Form đã được reset thành công!');
    }

    console.log('✓ Đã reset form hoàn toàn bao gồm reset nút xác nhận và nút bắt đầu');


    // THÊM: Xóa dữ liệu đã lưu cho máy này sau khi reset thành công
    // clearSavedFormDataByMachine();



    // THÊM: Xóa report ID khi reset
document.body.removeAttribute('data-report-id');
localStorage.removeItem('currentReportId');
localStorage.removeItem('currentReportMachine');
console.log('✓ Đã xóa report ID khi reset form');




}

// Thiết lập sự kiện khi trang web đã tải xong
document.addEventListener('DOMContentLoaded', function () {
    // Tìm nút reset và gán sự kiện
    const resetButton = document.getElementById('btnResetForm');
    if (resetButton) {
        resetButton.addEventListener('click', resetForm);
    }
});



// Sửa lỗi nút bắt đầu bị disable
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        // Đảm bảo nút bắt đầu không bị disable
        const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');
        if (startButton) {
            startButton.disabled = false;

            // Thay thế sự kiện onclick
            startButton.onclick = function () {
                if (document.body.hasAttribute('data-start-time')) {
                    return; // Tránh ghi đè thời gian đã có
                }

                const now = new Date();
                document.getElementById('startTime').textContent = formatTime(now);
                document.body.setAttribute('data-start-time', now.toISOString());

                // Thông báo cho người dùng
                showNotification("Đã bắt đầu lúc " + formatTime(now), "success");
            };
        }

        // Fix để giữ giá trị làm tròn khi gửi báo cáo
        const oldCollectReportData = collectReportData;
        collectReportData = function () {
            // Tính toán lại giá trị
            calculateDerivedValues();

            // Lưu giá trị làm tròn vào data attribute
            const tlTraDuKienElement = document.getElementById('tlTraDuKien');
            const soTamThamChieuElement = document.getElementById('soTamThamChieu');

            if (tlTraDuKienElement && tlTraDuKienElement.value) {
                tlTraDuKienElement.setAttribute('data-rounded-value', tlTraDuKienElement.value);
            }

            if (soTamThamChieuElement && soTamThamChieuElement.value) {
                soTamThamChieuElement.setAttribute('data-rounded-value', soTamThamChieuElement.value);
            }

            // Gọi hàm gốc
            const reportData = oldCollectReportData();

            // Sửa giá trị trong báo cáo
            if (reportData && reportData.ketThuc) {
                reportData.ketThuc.tlTraDuTinh = tlTraDuKienElement?.getAttribute('data-rounded-value') ||
                    tlTraDuKienElement?.value || '';

                reportData.ketThuc.soTamThamChieu = soTamThamChieuElement?.getAttribute('data-rounded-value') ||
                    soTamThamChieuElement?.value || '';
            }

            return reportData;
        };
    }, 1000);
});







//! ===================================================================
// !THIẾT LẬP CƠ CHẾ TỰ ĐỘNG CẬP NHẬT DỮ LIỆU GMC TỪ PHIẾU CẮT
//! ===================================================================

//todo Hàm này sẽ tạo ra một danh sách các báo cáo cần cập nhật và kiểm tra định kỳ=============================================

function setupGMCAutomaticDataUpdate() {
    // Danh sách các báo cáo GMC đang chờ cập nhật
    const pendingGMCUpdates = [];

    // Thêm báo cáo GMC vào danh sách chờ cập nhật
    window.addPendingGMCUpdate = function (reportId, soPhieu, thuTu) {
        // Validate input parameters
        if (!reportId || !soPhieu || !thuTu) {
            console.warn('Invalid parameters for addPendingGMCUpdate:', { reportId, soPhieu, thuTu });
            return false;
        }

        // Validate reportId format (should be a number or valid string)
        if (typeof reportId !== 'number' && typeof reportId !== 'string') {
            console.warn('Invalid reportId format:', reportId);
            return false;
        }

        // Convert to string and validate
        const reportIdStr = String(reportId);
        if (reportIdStr.length === 0) {
            console.warn('Empty reportId');
            return false;
        }

        // Check if already exists
        const existingIndex = pendingGMCUpdates.findIndex(item =>
            item.reportId === reportIdStr &&
            item.soPhieu === soPhieu &&
            item.thuTu === thuTu
        );

        if (existingIndex !== -1) {
            console.log(`Báo cáo GMC ID ${reportIdStr} đã có trong danh sách chờ cập nhật`);
            return true;
        }

        const today = new Date().toISOString().split('T')[0];
        pendingGMCUpdates.push({
            reportId: reportIdStr,
            soPhieu: String(soPhieu).trim(),
            thuTu: String(thuTu).trim(),
            lastChecked: Date.now(),
            createdDate: today
        });

        // Lưu danh sách vào localStorage để giữ lại qua các phiên
        try {
            localStorage.setItem('pendingGMCUpdates', JSON.stringify(pendingGMCUpdates));
            console.log(`✓ Đã thêm báo cáo GMC ID ${reportIdStr} với số phiếu ${soPhieu}, thứ tự ${thuTu} vào danh sách chờ cập nhật`);
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu danh sách chờ cập nhật:', error);
            return false;
        }
    };

    // Xóa báo cáo khỏi danh sách chờ cập nhật
    window.removePendingGMCUpdate = function (reportId) {
        const reportIdStr = String(reportId);
        const index = pendingGMCUpdates.findIndex(item => item.reportId === reportIdStr);

        if (index !== -1) {
            const removed = pendingGMCUpdates.splice(index, 1)[0];
            try {
                localStorage.setItem('pendingGMCUpdates', JSON.stringify(pendingGMCUpdates));
                console.log(`✓ Đã xóa báo cáo GMC ID ${reportIdStr} khỏi danh sách chờ cập nhật`);
                return true;
            } catch (error) {
                console.error('Lỗi khi cập nhật localStorage:', error);
                return false;
            }
        }
        return false;
    };

    // Tải danh sách chờ cập nhật từ localStorage (nếu có)
    const savedUpdates = localStorage.getItem('pendingGMCUpdates');
    if (savedUpdates) {
        try {
            const parsed = JSON.parse(savedUpdates);
            if (Array.isArray(parsed)) {
                // Validate và clean up dữ liệu
                const validUpdates = parsed.filter(item =>
                    item &&
                    item.reportId &&
                    item.soPhieu &&
                    item.thuTu &&
                    typeof item.reportId === 'string' &&
                    item.reportId.length > 0
                );

                validUpdates.forEach(item => {
                    // Ensure all properties are strings
                    item.reportId = String(item.reportId);
                    item.soPhieu = String(item.soPhieu).trim();
                    item.thuTu = String(item.thuTu).trim();
                    item.lastChecked = item.lastChecked || Date.now();

                    pendingGMCUpdates.push(item);
                });

                // Update localStorage with cleaned data
                if (validUpdates.length !== parsed.length) {
                    localStorage.setItem('pendingGMCUpdates', JSON.stringify(pendingGMCUpdates));
                    console.log(`Đã dọn dẹp danh sách: ${parsed.length} -> ${validUpdates.length} báo cáo hợp lệ`);
                }

                console.log(`Đã tải ${pendingGMCUpdates.length} báo cáo GMC đang chờ cập nhật từ localStorage`);
            }
        } catch (e) {
            console.error('Lỗi khi tải danh sách chờ cập nhật GMC:', e);
            // Clear corrupted data
            localStorage.removeItem('pendingGMCUpdates');
        }
    }

    // Hàm lấy dữ liệu formula phiếu cắt
    async function getCatFormulaData() {
        try {
            const response = await fetch('/api/cat/formula');
            if (!response.ok) {
                throw new Error('Không thể tải thông tin formula phiếu cắt');
            }
            return await response.json();
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu formula phiếu cắt:', error);
            return [];
        }
    }

    // Hàm kiểm tra và cập nhật dữ liệu GMC (FIXED)
    async function checkForGMCUpdates() {
        if (pendingGMCUpdates.length === 0) return;

        // Lọc chỉ kiểm tra báo cáo GMC được tạo hôm nay
        const today = new Date().toISOString().split('T')[0];
        const todayPendingUpdates = pendingGMCUpdates.filter(item => {
            // Nếu có thông tin thời gian tạo, chỉ lấy những cái của hôm nay
            if (item.createdDate) {
                return item.createdDate === today;
            }
            // Nếu không có thì vẫn kiểm tra (để đảm bảo không bỏ sót)
            return true;
        });

        if (todayPendingUpdates.length === 0) {
            console.log('Không có báo cáo GMC nào của ngày hôm nay cần kiểm tra');
            return;
        }

        console.log(`Kiểm tra ${todayPendingUpdates.length}/${pendingGMCUpdates.length} báo cáo GMC của ngày ${today}`);

        try {
            // Phần còn lại giữ nguyên, chỉ thay pendingGMCUpdates thành todayPendingUpdates
            const formulaList = await getCatFormulaData();
            if (!formulaList || formulaList.length === 0) {
                console.log('Không có dữ liệu formula phiếu cắt để cập nhật GMC');
                return;
            }

            // Duyệt qua từng báo cáo GMC đang chờ
            const updatedReports = [];
            const remainingUpdates = [];
            const failedUpdates = [];

            for (const pendingReport of todayPendingUpdates) {
                const { reportId, soPhieu, thuTu } = pendingReport;

                try {
                    // Validate reportId before making API call
                    if (!reportId || reportId.length === 0) {
                        console.warn(`Invalid reportId for pending update: ${reportId}`);
                        continue;
                    }

                    // Lọc dữ liệu theo số phiếu
                    const filteredList = formulaList.filter(item => {
                        const itemSoPhieu = item.soPhieu ? item.soPhieu.trim() : '';
                        return itemSoPhieu === soPhieu;
                    });

                    // Tìm phiếu có thứ tự phù hợp
                    let foundData = null;

                    if (filteredList.length > 0) {
                        // Thử tìm theo thuTu chính xác
                        foundData = filteredList.find(item => {
                            return (item.stt === thuTu || item.thuTu === thuTu);
                        });

                        // Nếu không tìm thấy theo stt/thuTu, thử dùng index
                        if (!foundData) {
                            const thuTuNum = parseInt(thuTu);
                            if (!isNaN(thuTuNum) && thuTuNum > 0 && thuTuNum <= filteredList.length) {
                                foundData = filteredList[thuTuNum - 1];
                            }
                        }
                    }

                    if (foundData) {
                        // Đã tìm thấy dữ liệu mới, cập nhật báo cáo GMC
                        await updateGMCReportWithNewData(reportId, foundData);
                        updatedReports.push(reportId);
                        console.log(`✓ Đã cập nhật báo cáo GMC ID ${reportId} với dữ liệu mới từ phiếu cắt`);

                        // Hiển thị thông báo cho người dùng
                        if (typeof showNotification === 'function') {
                            showNotification(`Báo cáo GMC với số phiếu ${soPhieu}, thứ tự ${thuTu} đã được tự động cập nhật với dữ liệu mới`, 'success');
                        }
                    } else {
                        // Chưa tìm thấy dữ liệu mới, giữ lại để kiểm tra sau
                        remainingUpdates.push(pendingReport);
                    }
                } catch (error) {
                    console.error(`Lỗi khi xử lý báo cáo GMC ID ${reportId}:`, error);

                    // Kiểm tra nếu là lỗi 404 (báo cáo không tồn tại)
                    if (error.message.includes('404') || error.message.includes('Không thể lấy thông tin báo cáo GMC')) {
                        console.warn(`Báo cáo GMC ID ${reportId} có thể đã bị xóa, loại bỏ khỏi danh sách chờ`);
                        failedUpdates.push(reportId);
                    } else {
                        // Lỗi khác, giữ lại để thử lại sau
                        remainingUpdates.push(pendingReport);
                    }
                }
            }

            // Cập nhật danh sách chờ - loại bỏ các báo cáo đã cập nhật thành công và báo cáo lỗi 404
            pendingGMCUpdates.length = 0;
            remainingUpdates.forEach(item => pendingGMCUpdates.push(item));

            // Lưu danh sách mới vào localStorage
            try {
                localStorage.setItem('pendingGMCUpdates', JSON.stringify(pendingGMCUpdates));
            } catch (error) {
                console.error('Lỗi khi lưu danh sách chờ cập nhật:', error);
            }

            console.log(`✓ Đã cập nhật ${updatedReports.length} báo cáo GMC, còn ${pendingGMCUpdates.length} báo cáo đang chờ`);
            if (failedUpdates.length > 0) {
                console.log(`⚠ Đã loại bỏ ${failedUpdates.length} báo cáo không tồn tại: ${failedUpdates.join(', ')}`);
            }

        } catch (error) {
            console.error('Lỗi khi kiểm tra cập nhật GMC:', error);
        }
    }



    // Hàm lấy dữ liệu formula phiếu cắt chỉ của ngày hôm nay
    async function getCatFormulaDataToday() {
        try {
            const response = await fetch('/api/cat/formula');
            if (!response.ok) {
                throw new Error('Không thể tải thông tin formula phiếu cắt');
            }

            const allFormula = await response.json();

            // Lọc chỉ lấy dữ liệu của ngày hôm nay
            const today = new Date().toISOString().split('T')[0];
            const todayFormula = allFormula.filter(item => {
                if (item.ngayTao || item.created_at || item.ngay) {
                    const itemDate = new Date(item.ngayTao || item.created_at || item.ngay).toISOString().split('T')[0];
                    return itemDate === today;
                }
                return false;
            });

            console.log(`Đã lọc ${todayFormula.length}/${allFormula.length} formula phiếu cắt của ngày hôm nay`);
            return todayFormula;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu formula phiếu cắt ngày hôm nay:', error);
            return [];
        }
    }



    // Hàm cập nhật báo cáo GMC với dữ liệu mới từ phiếu cắt (FIXED)
    async function updateGMCReportWithNewData(reportId, newData) {
        try {
            // Validate reportId
            if (!reportId || String(reportId).length === 0) {
                throw new Error('Invalid reportId');
            }

            const reportIdStr = String(reportId);
            console.log(`Đang cập nhật báo cáo GMC ID: ${reportIdStr}`);

            // Lấy thông tin báo cáo GMC hiện tại
            const response = await fetch(`/api/bao-cao-gmc/${reportIdStr}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Báo cáo GMC không tồn tại (404)');
                }
                throw new Error(`HTTP ${response.status}: Không thể lấy thông tin báo cáo GMC`);
            }

            const currentReport = await response.json();
            console.log('Báo cáo GMC hiện tại:', currentReport);
            console.log('Dữ liệu mới từ phiếu cắt:', newData);

            // Chuẩn bị dữ liệu cập nhật
            const updateData = {};

            // ===== CẬP NHẬT WS =====
            if ((!currentReport.so_ws || currentReport.so_ws === '') && (newData.ws || newData.soLSX || newData.WS || newData.wsF)) {
                const wsValue = newData.ws || newData.soLSX || newData.WS || newData.wsF;
                updateData.so_ws = wsValue;
                console.log(`Cập nhật WS: ${wsValue}`);
            }

            // Cập nhật mã giấy
            if ((!currentReport.ma_giay || currentReport.ma_giay === '') && newData.maNL) {
                updateData.ma_giay = newData.maNL;
                console.log(`Cập nhật mã giấy: ${newData.maNL}`);
            }

            // Cập nhật khách hàng - ưu tiên lấy từ maKH của formula
            if ((!currentReport.khach_hang || currentReport.khach_hang === '')) {
                if (newData.maKH) {
                    updateData.khach_hang = newData.maKH;
                    console.log(`Cập nhật khách hàng từ MÃ KH formula: ${newData.maKH}`);
                } else if (newData.khachHang) {
                    updateData.khach_hang = newData.khachHang;
                    console.log(`Cập nhật khách hàng từ phiếu cắt: ${newData.khachHang}`);
                }
            }

            // Cập nhật định lượng
            let dinhLuong = '';
            if (newData.maNL) {
                // Tính định lượng từ mã giấy AABBCD-EEEE-FFFF-GGGG
                const parts = newData.maNL.split('-');
                if (parts.length >= 2) {
                    const eeee = parts[1]; // Vị trí EEEE
                    const dinhLuongNumber = parseInt(eeee, 10);
                    if (!isNaN(dinhLuongNumber)) {
                        dinhLuong = dinhLuongNumber.toString();
                    }
                }
            }
            if (!dinhLuong && newData.dinhLuong) {
                dinhLuong = newData.dinhLuong;
            }
            if (dinhLuong && (!currentReport.dinh_luong || currentReport.dinh_luong === '')) {
                updateData.dinh_luong = dinhLuong;
                console.log(`Cập nhật định lượng: ${dinhLuong}`);
            }


            // Cập nhật số tấm
            if ((!currentReport.so_tam || currentReport.so_tam === '') && newData.soTam) {
                updateData.so_tam = newData.soTam;
                console.log(`Cập nhật số tấm: ${newData.soTam}`);
            }


            // ===== CẬP NHẬT ĐÚNG CỘT KHỔ GỐC VÀ DÀI =====
            // Khổ gốc vào kho_mm
            if ((!currentReport.kho_mm || currentReport.kho_mm === '') && newData.khoCat) {
                // Tính khổ gốc từ mã giấy (không chia đôi)
                let khoGoc = '';
                if (newData.maNL) {
                    const parts = newData.maNL.split('-');
                    if (parts.length >= 3) {
                        const ffff = parts[2];
                        const khoNumber = parseInt(ffff, 10);
                        if (!isNaN(khoNumber)) {
                            khoGoc = khoNumber.toString(); // Khổ gốc = FFFF (không chia đôi)
                        }
                    }
                }
                if (!khoGoc) {
                    khoGoc = newData.khoCat; // Fallback
                }

                updateData.kho_mm = khoGoc;
                console.log(`Cập nhật khổ gốc vào kho_mm: ${khoGoc}`);
            }

            // Dài vào dai_mm
            if ((!currentReport.dai_mm || currentReport.dai_mm === '') && newData.daiCat) {
                updateData.dai_mm = newData.daiCat;
                console.log(`Cập nhật dài vào dai_mm: ${newData.daiCat}`);
            }

            // THÊM: Cập nhật cột dai trong form nếu chưa có
            if ((!currentReport.dai || currentReport.dai === '') && newData.daiCat) {
                updateData.dai = newData.daiCat;
                console.log(`Cập nhật dài vào cột dai: ${newData.daiCat}`);
            }

            // ===== SỬA LỖI: FORCE CẬP NHẬT KHỔ XÉN VÀ DÀI XÉN =====
            if ((!currentReport.kho_xen || currentReport.kho_xen === '' || currentReport.kho_xen === '0') &&
                (newData.khoXen || newData.khoXa || newData.xa)) {
                const khoXenValue = newData.khoXen || newData.khoXa || newData.xa;
                if (khoXenValue && khoXenValue.toString().trim() !== '0') {
                    updateData.kho_xen = khoXenValue;
                    console.log(`Force cập nhật khổ xén: ${khoXenValue}`);
                }
            }

            if ((!currentReport.dai_xen || currentReport.dai_xen === '' || currentReport.dai_xen === '0') &&
                (newData.daiXen || newData.xa)) {
                const daiXenValue = newData.daiXen || newData.xa;
                if (daiXenValue && daiXenValue.toString().trim() !== '0') {
                    updateData.dai_xen = daiXenValue;
                    console.log(`Force cập nhật dài xén: ${daiXenValue}`);
                }
            }

            // ===== THÊM: TÍNH SỐ TẤM XÉN =====
            if (updateData.kho_mm && updateData.kho_xen && updateData.dai_mm && updateData.dai_xen && currentReport.so_tam_cat_duoc) {
                // Lấy giá trị xả đôi
                const xaDoi = parseInt(currentReport.xa_doi || '0');

                // Tính số tấm xén bằng hàm có sẵn trong GMC
                const kho = parseFloat(updateData.kho_mm);
                const khoXen = parseFloat(updateData.kho_xen);
                const dai = parseFloat(updateData.dai_mm || updateData.dai);
                const daiXen = parseFloat(updateData.dai_xen);
                const soTamCatDuoc = parseFloat(currentReport.so_tam_cat_duoc);

                if (kho && khoXen && dai && daiXen && soTamCatDuoc) {
                    // Sử dụng hàm tinhSoTamXen có sẵn
                    const soTamXen = tinhSoTamXen(kho, khoXen, dai, daiXen, soTamCatDuoc, xaDoi);
                    updateData.so_tam_xen = Math.round(soTamXen);
                    console.log(`Tính số tấm xén: ${soTamXen} -> ${updateData.so_tam_xen}`);
                }
            }



            // ===== SỬA LỖI: CẬP NHẬT ĐẦY ĐỦ CHO PHIẾU BỔ SUNG SAU =====
            // Force cập nhật dài vào cột dai nếu chưa có
            if ((!currentReport.dai || currentReport.dai === '') && updateData.dai_mm) {
                updateData.dai = updateData.dai_mm;
                console.log(`Force cập nhật dài cho phiếu bổ sung sau: ${updateData.dai_mm}`);
            }

            // Tính lại TL trả dự tính nếu có đủ dữ liệu sau cập nhật
            const finalKho = updateData.kho_mm || currentReport.kho_mm;
            const finalDai = updateData.dai_mm || updateData.dai || currentReport.dai_mm || currentReport.dai;
            const finalDinhLuong = updateData.dinh_luong || currentReport.dinh_luong;

            if (finalKho && finalDai && finalDinhLuong && currentReport.trong_luong_nhan && currentReport.so_tam_cat_duoc) {
                const tln = parseFloat(currentReport.trong_luong_nhan);
                const soTam = parseFloat(currentReport.so_tam_cat_duoc);
                const dai = parseFloat(finalDai);
                const dinhLuong = parseFloat(finalDinhLuong);
                const dauCuon = parseFloat(currentReport.dau_cuon_kg || '0');
                const rachMop = parseFloat(currentReport.rach_mop_kg || '0');

                // Tính khổ cắt theo xả đôi
                let khoCat = parseFloat(finalKho);
                if (parseInt(currentReport.xa_doi || '0') === 1) {
                    khoCat = Math.floor(khoCat / 2);
                }

                const tamLuong = (soTam * dai * khoCat * dinhLuong) / 1000000000;
                const tlTraRaw = tln - tamLuong - dauCuon - rachMop;
                const tlTraRounded = Math.round(tlTraRaw * 10) / 10;

                updateData.tl_tra_du_tinh = tlTraRounded.toFixed(1);
                console.log(`Force tính lại TL trả dự tính cho phiếu bổ sung sau: ${updateData.tl_tra_du_tinh}`);
            }

            // Tính lại số tấm xén với dữ liệu đã cập nhật
            if (finalKho && updateData.kho_xen && finalDai && updateData.dai_xen && currentReport.so_tam_cat_duoc) {
                const xaDoi = parseInt(currentReport.xa_doi || '0');
                const soTamXenMoi = tinhSoTamXen(
                    finalKho,
                    updateData.kho_xen,
                    finalDai,
                    updateData.dai_xen,
                    currentReport.so_tam_cat_duoc,
                    xaDoi
                );
                updateData.so_tam_xen = Math.round(soTamXenMoi);
                console.log(`Force tính lại số tấm xén cho phiếu bổ sung sau: ${updateData.so_tam_xen}`);
            }



            // ===== TÍNH LẠI TL TRẢ DỰ TÍNH SAU KHI CÓ ĐỦ DỮ LIỆU =====
            let needRecalculateTlTra = false;
            let calculatedTlTra = null;

            // Kiểm tra nếu báo cáo đã có đủ dữ liệu để tính TL trả dự tính
            const hasNecessaryData = (
                (currentReport.trong_luong_nhan || currentReport.trong_luong_nhan === 0) &&
                (currentReport.so_tam_cat_duoc || currentReport.so_tam_cat_duoc === 0) &&
                (updateData.dai_mm || currentReport.dai_mm) &&
                (updateData.kho_mm || currentReport.kho_mm) &&
                (updateData.dinh_luong || currentReport.dinh_luong) &&
                (currentReport.dau_cuon_kg || currentReport.dau_cuon_kg === 0) &&
                (currentReport.rach_mop_kg || currentReport.rach_mop_kg === 0)
            );

            // Nếu có đủ dữ liệu và TL trả dự tính đang trống hoặc bằng 0
            if (hasNecessaryData && (!currentReport.tl_tra_du_tinh || currentReport.tl_tra_du_tinh === '' || currentReport.tl_tra_du_tinh === '0')) {
                needRecalculateTlTra = true;

                // Lấy các giá trị cần thiết
                const trongLuongNhan = parseFloat(currentReport.trong_luong_nhan || '0');
                const soTamCatDuoc = parseFloat(currentReport.so_tam_cat_duoc || '0');
                const dai = parseFloat(updateData.dai_mm || currentReport.dai_mm || '0');
                const kho = parseFloat(updateData.kho_mm || currentReport.kho_mm || '0');
                const dinhLuongValue = parseFloat(updateData.dinh_luong || currentReport.dinh_luong || '0');
                const dauCuon = parseFloat(currentReport.dau_cuon_kg || '0');
                const rachMop = parseFloat(currentReport.rach_mop_kg || '0');

                console.log('=== TÍNH TOÁN TL TRẢ DỰ TÍNH SAU CẬP NHẬT ===');
                console.log('Các giá trị:', {
                    trongLuongNhan,
                    soTamCatDuoc,
                    dai,
                    kho,
                    dinhLuongValue,
                    dauCuon,
                    rachMop
                });

                // Tính khổ cắt theo xả đôi
                let khoCat = kho;
                if (currentReport.xa_doi === '1') {
                    khoCat = Math.floor(kho / 2); // Xả đôi - chia đôi
                }

                // Tính theo công thức: (TLN - (STC × Dài × Khổ cắt × Định lượng ÷ 1000000000) - Đầu cuộn - Rách móp)
                const tamLuong = (soTamCatDuoc * dai * khoCat * dinhLuongValue) / 1000000000;
                const tlTraDuKienRaw = trongLuongNhan - tamLuong - dauCuon - rachMop;

                // Làm tròn theo quy tắc tùy chỉnh
                const tlTraDuKienRounded = Math.round(tlTraDuKienRaw * 10) / 10;
                calculatedTlTra = tlTraDuKienRounded.toFixed(1);

                updateData.tl_tra_du_tinh = calculatedTlTra;

                console.log(`Công thức: (${trongLuongNhan} - (${soTamCatDuoc} × ${dai} × ${khoCat} × ${dinhLuongValue} ÷ 1000000000) - ${dauCuon} - ${rachMop})`);
                console.log(`= (${trongLuongNhan} - ${tamLuong} - ${dauCuon} - ${rachMop})`);
                console.log(`= ${tlTraDuKienRaw}`);
                console.log(`TL trả dự tính sau cập nhật: ${calculatedTlTra}`);
            }

            // Chỉ cập nhật nếu có dữ liệu
            if (Object.keys(updateData).length > 0) {
                console.log(`Dữ liệu cập nhật cho báo cáo GMC ID ${reportIdStr}:`, updateData);

                // Gửi yêu cầu cập nhật
                const updateResponse = await fetch(`/api/bao-cao-gmc/update-formula/${reportIdStr}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
                });

                if (updateResponse.ok) {
                    const result = await updateResponse.json();
                    console.log(`✓ Đã cập nhật báo cáo GMC ID ${reportIdStr} với dữ liệu mới`);

                    // Hiển thị thông báo đặc biệt nếu đã tính được TL trả dự tính
                    if (needRecalculateTlTra && calculatedTlTra) {
                        console.log(`🎯 Đã tự động tính TL trả dự tính: ${calculatedTlTra} kg cho báo cáo GMC ID ${reportIdStr}`);
                    }

                    // Reload trang để thấy kết quả cập nhật
                    setTimeout(() => {
                        if (typeof loadReportList === 'function') {
                            loadReportList();
                        }
                    }, 1000);

                    return result;
                } else {
                    const errorText = await updateResponse.text();
                    console.error('Lỗi khi cập nhật:', errorText);
                    throw new Error(`HTTP ${updateResponse.status}: Không thể cập nhật báo cáo GMC`);
                }
            } else {
                console.log(`Không có dữ liệu mới để cập nhật cho báo cáo GMC ID ${reportIdStr}`);
                return { success: true, message: 'Không có dữ liệu mới để cập nhật' };
            }

        } catch (error) {
            console.error(`Lỗi khi cập nhật báo cáo GMC ID ${reportId}:`, error);
            throw error;
        }
    }

    // Expose the main functions to global scope
    window.checkForGMCUpdates = checkForGMCUpdates;
    window.updateGMCReportWithNewData = updateGMCReportWithNewData;

    // Thiết lập kiểm tra định kỳ (30 giây/lần)
    const checkInterval = 30 * 1000;
    setInterval(checkForGMCUpdates, checkInterval);

    // Kiểm tra ngay khi trang tải xong
    setTimeout(checkForGMCUpdates, 5000);

    console.log('✓ Đã thiết lập cơ chế tự động cập nhật dữ liệu cho GMC (Fixed)');
}





//! ===================================================================
//! 3. CHỨC NĂNG CẬP NHẬT THỦ CÔNG GMC TỪ PHIẾU CẮT
//! ===================================================================



//! ===================================================================
//! 4. KHỞI TẠO HỆ THỐNG CẬP NHẬT GMC TỪ PHIẾU BỔ SUNG SAU
//! ===================================================================


/**
 * Thêm code để kích hoạt chức năng cập nhật GMC từ phiếu bổ sung
 */
function addGMCDeferredUpdateTracking() {
    // Function để thêm theo dõi báo cáo GMC cần cập nhật
    window.trackGMCDeferredUpdate = function (reportId, soPhieu, thuTu) {
        // Kiểm tra nếu hàm đã được thiết lập
        if (typeof window.addPendingGMCUpdate === 'function') {
            window.addPendingGMCUpdate(reportId, soPhieu, thuTu);
            console.log(`Đã thêm báo cáo GMC ID ${reportId} vào danh sách theo dõi cập nhật`);

            // Hiển thị thông báo cho người dùng
            if (typeof showNotification === 'function') {
                showNotification(`Báo cáo GMC với số phiếu ${soPhieu} sẽ được tự động cập nhật khi có dữ liệu mới`, 'info');
            }

            return true;
        } else {
            console.warn('Chức năng theo dõi cập nhật GMC chưa được khởi tạo');
            return false;
        }
    };
}
























//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG TÌM KIẾM PHIẾU CẮT GIẤY
//  Mô tả: Tìm kiếm thông tin phiếu, hiển thị dữ liệu, xử lý kết quả
//! =================================================================

//todo Tìm kiếm thông tin phiếu cắt giấy=================================================================
async function searchPhieuCatGiay() {
    try {
        const soPhieu = document.getElementById('soPhieu').value.trim();
        const thuTu = document.getElementById('thuTu').value;

        console.log("Tìm kiếm phiếu cắt giấy:", soPhieu, "với thứ tự:", thuTu);

        if (!soPhieu || soPhieu === 'PC') {
            console.log("Số phiếu trống hoặc chỉ có 'PC', bỏ qua tìm kiếm");
            return;
        }

        // Hiển thị trạng thái đang tìm kiếm
        showLoadingState(true);


        // THÊM: Kiểm tra offline trước khi fetch
        if (!navigator.onLine) {
            console.log("🌐 Offline mode - Không thể tìm kiếm formula, chuyển sang chế độ thủ công");
            showLoadingState(false);

            // Luôn tạo danh sách thứ tự từ 1-10 khi offline
            updateThresholdThuTuOptions([]);

            showNotification('Không có mạng - Vui lòng nhập thông tin thủ công', 'warning');
            return;
        }


        // Bước 1: Tìm formula trước vì chứa các thông tin chi tiết như khổ xén, dài xén
        const formulaResponse = await fetch(`/api/cat/formula`);

        if (!formulaResponse.ok) {
            throw new Error('Không thể tải thông tin formula phiếu cắt giấy');
        }

        const formulaList = await formulaResponse.json();
        console.log("Dữ liệu formula phiếu cắt:", formulaList.length, "bản ghi");

        // Lọc dữ liệu theo số phiếu
        const filteredFormulaList = formulaList.filter(item => {
            const itemSoPhieu = item.soPhieu ? item.soPhieu.trim() : '';
            return itemSoPhieu === soPhieu;
        });

        console.log("Tìm thấy", filteredFormulaList.length, "formula phiếu khớp với số phiếu", soPhieu);

        // Bước 2: Tìm phiếu cắt giấy
        const pcResponse = await fetch(`/api/cat/list`);

        if (!pcResponse.ok) {
            throw new Error('Không thể tải danh sách phiếu cắt');
        }

        const pcList = await pcResponse.json();
        console.log("Dữ liệu phiếu cắt:", pcList.length, "bản ghi");

        // Lọc dữ liệu theo số phiếu
        const filteredPCList = pcList.filter(item => {
            const itemSoPhieu = item.soPhieu ? item.soPhieu.trim() : '';
            return itemSoPhieu === soPhieu;
        });

        console.log("Tìm thấy", filteredPCList.length, "phiếu cắt khớp với số phiếu", soPhieu);

        // Bước 3: Kết hợp dữ liệu từ cả 2 nguồn
        let mergedData = [];

        // Nếu có dữ liệu từ formula, ưu tiên sử dụng
        if (filteredFormulaList.length > 0) {
            mergedData = filteredFormulaList.map(formula => {
                // Tìm phiếu cắt tương ứng nếu có
                const matchingPC = filteredPCList.find(pc =>
                    pc.soPhieu === formula.soPhieu &&
                    (pc.maPhu === formula.maPhieuPhu || pc.stt === formula.stt || pc.stt === formula.thuTu)
                );

                // Kết hợp dữ liệu
                if (matchingPC) {
                    return {
                        ...formula,
                        ...matchingPC,
                        // Đảm bảo ưu tiên các trường quan trọng từ formula
                        khoXen: formula.khoXen || matchingPC.khoXen,
                        daiXen: formula.daiXen || matchingPC.daiXen,
                        khoDaiKhoXen: formula.khoDaiKhoXen || ''
                    };
                }

                return formula;
            });
        } else if (filteredPCList.length > 0) {
            // Nếu không có formula, sử dụng phiếu cắt
            mergedData = filteredPCList;
        }

        console.log("Dữ liệu kết hợp:", mergedData.length, "bản ghi");

        // Luôn tạo danh sách thứ tự từ 1-10, bất kể có dữ liệu hay không
        updateThresholdThuTuOptions(mergedData);

        // Nếu không có dữ liệu, hiển thị thông báo và dừng lại
        if (mergedData.length === 0) {
            // showNotification(`Không tìm thấy thông tin phiếu ${soPhieu}. Bạn có thể nhập thủ công các thông tin cần thiết.`, 'info');
            showLoadingState(false);
            return;
        }

        // Bước 4: Xử lý dữ liệu đã kết hợp
        if (thuTu && thuTu !== '-- Thứ tự --') {
            handleFilteredPhieuList(mergedData, thuTu);
        }

    } catch (error) {
        console.error('Lỗi khi tìm kiếm phiếu cắt giấy:', error);
        showNotification(error.message, 'error');
        showLoadingState(false);
    } finally {
        updateProgress();
    }
}



// Hàm mới để cập nhật danh sách thứ tự từ 1-10, với các thứ tự có dữ liệu được tô màu xanh
function updateThresholdThuTuOptions(phieuList) {
    const thuTuSelect = document.getElementById('thuTu');
    if (!thuTuSelect) return;

    console.log("Đang cập nhật danh sách thứ tự từ phiếu:", phieuList);

    // Lưu lại giá trị đã chọn để khôi phục sau khi cập nhật
    const selectedValue = thuTuSelect.value;

    // Xóa tất cả các option cũ
    while (thuTuSelect.options.length > 0) {
        thuTuSelect.remove(0);
    }

    // Thêm option mặc định
    const defaultOption = document.createElement('option');
    defaultOption.value = '-- Thứ tự --';
    defaultOption.textContent = '-- Thứ tự --';
    thuTuSelect.appendChild(defaultOption);

    // KIỂM TRA OFFLINE HOẶC KHÔNG CÓ DỮ LIỆU
    if (!navigator.onLine || !phieuList || phieuList.length === 0) {
        console.log("Offline mode hoặc không có dữ liệu - Hiển thị thứ tự 1-10 mặc định");

        // Thêm các option từ 1-10 (tất cả màu đen vì offline hoặc không có dữ liệu)
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = String(i);
            option.textContent = String(i);
            // Không tô màu xanh vì offline hoặc không có dữ liệu
            thuTuSelect.appendChild(option);
        }

        // Khôi phục giá trị đã chọn nếu vẫn hợp lệ
        if (selectedValue && selectedValue !== '-- Thứ tự --') {
            thuTuSelect.value = selectedValue;
        }

        return;
    }

    // XỬ LÝ KHI CÓ MẠNG VÀ CÓ DỮ LIỆU
    // Lấy tập hợp các thứ tự có dữ liệu
    const existingThuTu = new Set();

    phieuList.forEach(phieu => {
        // Thu thập STT từ nhiều nguồn có thể
        if (phieu.thuTu && phieu.thuTu !== '') {
            existingThuTu.add(String(phieu.thuTu).trim());
        } else if (phieu.stt && phieu.stt !== '') {
            existingThuTu.add(String(phieu.stt).trim());
        } else if (phieu.maPhieuPhu) {
            // Nếu có mã phiếu phụ dạng [soPhieu + STT]
            const sttFromMaPhu = phieu.maPhieuPhu.substring(phieu.soPhieu.length);
            if (sttFromMaPhu) {
                existingThuTu.add(sttFromMaPhu);
            }
        }
    });

    console.log("Các thứ tự có sẵn dữ liệu:", [...existingThuTu]);

    // Thêm các option từ 1-10
    for (let i = 1; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = String(i);
        option.textContent = String(i);

        // Nếu thứ tự này có dữ liệu, tô màu xanh
        if (existingThuTu.has(String(i))) {
            option.style.color = 'blue';
            option.style.fontWeight = 'bold';
        }

        thuTuSelect.appendChild(option);
    }

    // Khôi phục giá trị đã chọn nếu vẫn hợp lệ
    if (selectedValue && selectedValue !== '-- Thứ tự --') {
        thuTuSelect.value = selectedValue;
    }

    // Thêm event listener cho việc thay đổi thứ tự
    thuTuSelect.onchange = function () {
        const soPhieuElement = document.getElementById('soPhieu');
        if (soPhieuElement && soPhieuElement.value && soPhieuElement.value !== 'PCG') {
            // Chỉ tìm kiếm khi chọn thứ tự và có mạng
            if (this.value && this.value !== '-- Thứ tự --' && navigator.onLine) {
                searchPhieuCatGiay();
            } else if (!navigator.onLine) {
                console.log("Offline - Không tìm kiếm dữ liệu");
                resetFormFields();
            } else {
                resetFormFields();
            }
        }
    };
}




// Tách hàm xử lý danh sách phiếu đã lọc để tái sử dụng
function handleFilteredPhieuList(filteredList, thuTu) {
    // Tìm phiếu theo thứ tự
    let selectedData;

    if (thuTu && thuTu !== '-- Thứ tự --') {
        // Tìm phiếu có thứ tự khớp
        selectedData = filteredList.find(item =>
            item.thuTu === thuTu ||
            item.maPhieuPhu === (item.soPhieu + thuTu) ||
            parseInt(item.stt) === parseInt(thuTu)
        );

        // Nếu không tìm thấy nhưng đã chọn thứ tự (bổ sung sau)
        if (!selectedData) {
            // Reset form khi chọn STT không có dữ liệu (bổ sung sau)
            resetFormFields();
            // showNotification(`Không tìm thấy thông tin phiếu với thứ tự ${thuTu}. Tiếp tục nhập thủ công cho bổ sung sau.`, 'info');

            // THÊM DÒNG NÀY - Tính toán sau khi reset
            setTimeout(calculateDerivedValues, 500);

            return;
        }
    } else if (filteredList.length === 1) {
        // Nếu chỉ có một phiếu thì lấy phiếu đầu tiên
        selectedData = filteredList[0];
    } else {
        // Chúng ta không cần gọi updateThuTuOptions nữa vì đã gọi updateThresholdThuTuOptions trước đó
        showNotification('Vui lòng chọn thứ tự phiếu', 'info');
        return;
    }

    // Hiển thị dữ liệu lên form nếu có
    if (selectedData) {
        displayPhieuData(selectedData);

        // Thêm vào đây: Tính toán sau khi hiển thị dữ liệu
        setTimeout(calculateDerivedValues, 500);

        // Tự động điền số tờ/pallet từ định mức sau khi hiển thị dữ liệu
        setTimeout(autoFillSoToPallet, 700);
    }
}

// Hàm reset các trường form khi chọn STT bổ sung sau
function resetFormFields() {
    // Danh sách các trường cần reset
    const fieldsToReset = [
        'ws', 'khachhang', 'maVatTu', 'dinhLuong',
        'kho', 'dai', 'soto', 'khoXen', 'daiXen'
    ];

    // Reset giá trị các trường
    fieldsToReset.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = '';

            // Xóa các data attributes nếu có
            if (element.hasAttribute('data-dinh-luong')) {
                element.setAttribute('data-dinh-luong', '');
            }
            if (element.hasAttribute('data-do-day')) {
                element.setAttribute('data-do-day', '');
            }
            if (element.hasAttribute('data-so-cuon')) {
                element.setAttribute('data-so-cuon', '');
            }
        }
    });

    // Reset các trường tính toán
    const tlTraDuKienElement = document.getElementById('tlTraDuKien');
    const soTamThamChieuElement = document.getElementById('soTamThamChieu');

    if (tlTraDuKienElement) tlTraDuKienElement.value = '';
    if (soTamThamChieuElement) soTamThamChieuElement.value = '';

    console.log('Đã reset form do chọn STT bổ sung sau');
}



//todo Cập nhật danh sách thứ tự trong dropdown=============================================================
function updateThuTuOptions(phieuList) {
    const thuTuSelect = document.getElementById('thuTu');
    if (!thuTuSelect) return;

    console.log("Đang cập nhật danh sách thứ tự từ phiếu:", phieuList);

    // Xóa tất cả các option cũ (ngoại trừ option đầu tiên)
    while (thuTuSelect.options.length > 1) {
        thuTuSelect.remove(1);
    }

    // Tạo một Set để lưu trữ các thứ tự không trùng lặp
    const uniqueThuTu = new Set();

    // Luôn thêm các thứ tự từ 1 đến 5 cho dù phiếu có hay không
    for (let i = 1; i <= 5; i++) {
        uniqueThuTu.add(String(i));
    }

    // Thu thập thêm các thứ tự từ phiếu (nếu có thứ tự đặc biệt)
    phieuList.forEach(phieu => {
        if (phieu.thuTu && phieu.thuTu !== '') {
            uniqueThuTu.add(String(phieu.thuTu).trim());
        } else if (phieu.stt && phieu.stt !== '') {
            uniqueThuTu.add(String(phieu.stt).trim());
        }
    });

    console.log("Các thứ tự sẽ hiển thị:", [...uniqueThuTu]);

    // Chuyển Set thành mảng và sắp xếp
    const thuTuArray = [...uniqueThuTu].sort((a, b) => {
        // Đảm bảo so sánh số
        const numA = parseInt(a);
        const numB = parseInt(b);

        // Nếu cả hai đều là số hợp lệ, so sánh số
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }

        // Nếu không, so sánh chuỗi
        return a.localeCompare(b);
    });

    // Thêm các option mới
    thuTuArray.forEach(thuTu => {
        const option = document.createElement('option');
        option.value = thuTu;
        option.textContent = thuTu;
        thuTuSelect.appendChild(option);
    });

    // Nếu chỉ có một option, tự động chọn
    if (thuTuArray.length === 1) {
        thuTuSelect.value = thuTuArray[0];
        // Kích hoạt sự kiện change để tìm kiếm
        const event = new Event('change');
        thuTuSelect.dispatchEvent(event);
    } else if (thuTuArray.length > 1) {
        // Focus vào dropdown để người dùng chọn thứ tự
        thuTuSelect.focus();
    }
}



// Hàm tính khổ cắt dựa vào mã giấy và xả đôi
function calculateKhoCat(maGiay, xaDoi) {
    if (!maGiay) {
        console.log("Không có mã giấy để tính khổ cắt");
        return "";
    }

    // Format của mã giây: AABBCD-EEEE-FFFF-GGGG
    const parts = maGiay.split('-');
    if (parts.length < 3) {
        console.log("Mã giấy không đúng định dạng để lấy phần FFFF");
        return "";
    }

    // Lấy phần FFFF (phần thứ 3 trong mã giấy)
    const ffff = parts[2];
    console.log(`Phần FFFF từ mã giấy: ${ffff}`);

    // Chuyển đổi từ chuỗi sang số (bỏ các số 0 ở đầu)
    const khoNumber = parseInt(ffff, 10);

    // Kiểm tra giá trị hợp lệ
    if (isNaN(khoNumber)) {
        console.log("Không thể chuyển đổi FFFF thành số");
        return ffff; // Trả về giá trị gốc nếu không chuyển đổi được
    }

    // Xử lý theo xả đôi
    if (xaDoi === "0" || xaDoi === 0) {
        // Không xả đôi - giữ nguyên giá trị
        console.log(`Khổ cắt (không xả đôi): ${khoNumber}`);
        return khoNumber.toString();
    } else if (xaDoi === "1" || xaDoi === 1) {
        // Xả đôi - chia đôi giá trị
        const khoCat = Math.floor(khoNumber / 2);
        console.log(`Khổ cắt (xả đôi): ${khoNumber} / 2 = ${khoCat}`);
        return khoCat.toString();
    }

    // Trả về giá trị mặc định nếu xả đôi không hợp lệ
    return khoNumber.toString();
}

//todo Hiển thị dữ liệu phiếu lên form========================================================
function displayPhieuData(data) {
    try {
        console.log('Hiển thị dữ liệu phiếu:', data);

        // Xóa dữ liệu cũ trước khi hiển thị dữ liệu mới
        const fieldsToReset = ['ws', 'khachhang', 'maVatTu', 'dinhLuong', 'kho', 'dai', 'soto', 'khoXen', 'daiXen'];
        fieldsToReset.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.value = '';
                if (element.hasAttribute('data-dinh-luong')) {
                    element.setAttribute('data-dinh-luong', '');
                }
            }
        });

        // Hiển thị thông tin WS
        const wsElement = document.getElementById('ws');
        if (wsElement) {
            wsElement.value = data.ws || data.WS || data.wsF || data.soLSX || '';
            wsElement.setAttribute('data-ws', wsElement.value);
        }

        // Hiển thị thông tin khách hàng
        const khachHangElement = document.getElementById('khachhang');
        if (khachHangElement) {
            khachHangElement.value = data.maKH || data.khachHang || '';
        }

        // Hiển thị thông tin mã giấy và xử lý định lượng
        const maGiayElement = document.getElementById('maVatTu');
        if (maGiayElement) {
            const maGiay = data.maNL || data.maGiay || '';
            maGiayElement.value = maGiay;

            // QUAN TRỌNG: Lấy định lượng từ mã giấy (vị trí EEEE)
            let dinhLuong = '';
            if (maGiay) {
                const parts = maGiay.split('-');
                if (parts.length >= 4) {
                    // Format: AABBCD-EEEE-FFFF-GGGG
                    const eeee = parts[1]; // Vị trí EEEE
                    const dinhLuongNumber = parseInt(eeee, 10);
                    if (!isNaN(dinhLuongNumber)) {
                        dinhLuong = dinhLuongNumber.toString();
                        console.log(`Lấy định lượng từ mã giấy EEEE: ${eeee} -> ${dinhLuong}`);
                    }
                }
            }

            // Nếu không lấy được từ mã giấy, dùng từ phiếu cắt
            if (!dinhLuong && data.dinhLuong) {
                dinhLuong = data.dinhLuong;
                console.log(`Lấy định lượng từ phiếu cắt: ${dinhLuong}`);
            }

            // Lưu định lượng vào data attribute
            if (dinhLuong) {
                maGiayElement.setAttribute('data-dinh-luong', dinhLuong);
                const dinhLuongElement = document.getElementById('dinhLuong');
                if (dinhLuongElement) {
                    dinhLuongElement.value = dinhLuong;
                }
            }

            // Hiển thị số tấm
            const soTamElement = document.getElementById('soTam');
            if (soTamElement) {
                soTamElement.value = data.soTam || '';
                console.log(`Đã thiết lập số tấm: ${data.soTam}`);
            }
        }

        // QUAN TRỌNG: Hiển thị thông tin khổ và dài từ phiếu cắt formula (khoCat và daiCat)
        const khoElement = document.getElementById('kho');
        if (khoElement) {
            if (data.khoCat) {
                khoElement.value = data.khoCat;
                console.log(`Đã thiết lập khổ: ${data.khoCat} từ khoCat của phiếu cắt formula`);
            } else {
                console.log("Không có khoCat từ phiếu cắt formula");
            }
        }

        const daiElement = document.getElementById('dai');
        if (daiElement) {
            if (data.daiCat) {
                daiElement.value = data.daiCat;
                console.log(`Đã thiết lập dài: ${data.daiCat} từ daiCat của phiếu cắt formula`);
            } else {
                console.log("Không có daiCat từ phiếu cắt formula");
            }
        }

        // ===== HIỂN THỊ KHỔ XÉN VÀ DÀI XÉN CHO PHIẾU CÓ DỮ LIỆU =====
        const khoXenElement = document.getElementById('khoXen');
        if (khoXenElement) {
            // Tìm giá trị khổ xén từ nhiều nguồn
            const khoXenSources = [
                data.khoXen,
                data.khoXa,
                data.xa, // THÊM: từ trường xa
                data.khoDaiKhoXen?.split('/')[0]
            ];

            for (const source of khoXenSources) {
                if (source && source.toString().trim() !== '' && source.toString().trim() !== '0') {
                    khoXenElement.value = source;
                    console.log("Đã thiết lập khổ xén:", source);
                    break;
                }
            }
        }

        const daiXenElement = document.getElementById('daiXen');
        if (daiXenElement) {
            // Tìm giá trị dài xén từ nhiều nguồn
            const daiXenSources = [
                data.daiXen,
                data.xa,
                data.khoDaiKhoXen?.split('/')[1]
            ];

            for (const source of daiXenSources) {
                if (source && source.toString().trim() !== '' && source.toString().trim() !== '0') {
                    daiXenElement.value = source;
                    console.log("Đã thiết lập dài xén:", source);
                    break;
                }
            }
        }

        // Tự động điền số tờ/pallet từ định mức sau khi hiển thị các dữ liệu khác
        setTimeout(autoFillSoToPallet, 500);

        // Tìm số cuộn từ WS
        setTimeout(findSoCuonByWS, 1000);

        // Cập nhật các giá trị tính toán sau khi hiển thị dữ liệu
        calculateDerivedValues();

        // Cập nhật tiến độ sau khi hiển thị dữ liệu
        updateProgress();

        // Hiển thị thông báo thành công
        showNotification('Đã tìm thấy và hiển thị thông tin phiếu', 'success');

    } catch (error) {
        console.error('Lỗi khi hiển thị dữ liệu phiếu:', error);
        showNotification('Lỗi khi hiển thị dữ liệu phiếu: ' + error.message, 'error');
    }
}


// 5. Thêm hàm tìm số cuộn theo WS
async function findSoCuonByWS() {
    try {
        const wsElement = document.getElementById('ws');
        const soPhieuElement = document.getElementById('soPhieu');

        if (!wsElement || !soPhieuElement) {
            console.log("Không tìm thấy trường WS hoặc số phiếu");
            return;
        }

        const ws = wsElement.value.trim();
        if (!ws) {
            console.log("Không có giá trị WS để tìm số cuộn");
            return;
        }

        console.log("Đang tìm số cuộn cho WS:", ws);

        // Lấy danh sách báo cáo để tìm các cuộn có cùng WS
        const response = await fetch('/api/bao-cao-gmc/list');
        if (!response.ok) {
            throw new Error('Không thể tải danh sách báo cáo GMC');
        }

        const reportList = await response.json();

        // ===== SỬA LỖI: TÍNH SỐ CUỘN CHUNG CHÍNH XÁC CHO WS =====
        // Lọc tất cả báo cáo có cùng WS (loại trừ báo cáo dừng máy không có WS)
        const sameWSReports = reportList.filter(report =>
            report.so_ws === ws &&
            report.so_phieu_cat_giay &&
            report.so_phieu_cat_giay !== '' &&
            report.so_phieu_cat_giay !== 'PCG'
        );

        console.log(`Tìm thấy ${sameWSReports.length} báo cáo hợp lệ có cùng WS ${ws}`);

        // Tổng số cuộn = số báo cáo hiện có + 1 (phiếu đang tạo)
        const tongSoCuon = sameWSReports.length + 1;

        console.log(`✅ WS ${ws} sẽ có tổng ${tongSoCuon} cuộn (bao gồm phiếu đang tạo)`);

        // Lưu số cuộn chung vào data attribute
        wsElement.setAttribute('data-so-cuon', tongSoCuon);

        // ===== TÍNH SỐ LẦN CHÍNH XÁC CHO CÙNG SỐ PHIẾU =====
        const soPhieu = soPhieuElement.value.trim();
        const sameSPReports = reportList.filter(report => {
            const reportSoPhieu = report.so_phieu_cat_giay || '';
            return reportSoPhieu === soPhieu && reportSoPhieu !== '' && reportSoPhieu !== 'PCG';
        });

        let maxSoLan = 0;
        if (sameSPReports.length > 0) {
            const allSoLan = sameSPReports.map(r => parseInt(r.so_lan_chay) || 0);
            maxSoLan = Math.max(...allSoLan);
        }

        const soLan = maxSoLan + 1;
        soPhieuElement.setAttribute('data-so-lan', soLan);

        console.log(`🎯 KẾT QUẢ: WS ${ws} có ${tongSoCuon} cuộn chung, phiếu ${soPhieu} lần ${soLan}`);

    } catch (error) {
        console.error("Lỗi khi tìm số cuộn:", error);
    }
}

// Hàm riêng để tính số lần cho số phiếu (bất kể có WS hay không)
async function calculateSoLanForPhieu() {
    try {
        const soPhieuElement = document.getElementById('soPhieu');

        if (!soPhieuElement) {
            console.log("Không tìm thấy trường số phiếu");
            return 1; // Mặc định số lần = 1
        }

        const soPhieu = soPhieuElement.value.trim();

        // Nếu chỉ có "PC" hoặc rỗng thì số lần = 1
        if (!soPhieu || soPhieu === 'PC' || soPhieu === 'PCG') {
            console.log("Số phiếu trống hoặc chỉ có PC/PCG, số lần = 1");
            return 1;
        }

        console.log("Đang tính số lần cho số phiếu:", soPhieu);

        // Lấy danh sách báo cáo để đếm số lần
        const response = await fetch('/api/bao-cao-gmc/list');
        if (!response.ok) {
            throw new Error('Không thể tải danh sách báo cáo GMC');
        }

        const reportList = await response.json();

        // Lọc tất cả báo cáo có CÙNG SỐ PHIẾU (bao gồm cả phiếu có dữ liệu và bổ sung sau)
        const sameSPReports = reportList.filter(report => {
            const reportSoPhieu = report.so_phieu_cat_giay || '';
            return reportSoPhieu === soPhieu;
        });

        console.log(`Tìm thấy ${sameSPReports.length} báo cáo có cùng số phiếu ${soPhieu}`);

        // Tìm số lần lớn nhất trong cùng số phiếu
        let maxSoLan = 0;
        if (sameSPReports.length > 0) {
            // Lấy tất cả số lần và tìm max
            const allSoLan = sameSPReports.map(r => parseInt(r.so_lan_chay) || 0);
            maxSoLan = Math.max(...allSoLan);

            console.log(`Các số lần hiện có cho phiếu ${soPhieu}:`, allSoLan);
            console.log(`Số lần lớn nhất hiện tại: ${maxSoLan}`);
        }

        // Số lần mới = số lần lớn nhất + 1
        const soLan = maxSoLan + 1;
        console.log(`✅ Số lần cho số phiếu ${soPhieu} sẽ là: ${soLan}`);

        // Lưu số lần vào data attribute của số phiếu
        soPhieuElement.setAttribute('data-so-lan', soLan);

        return soLan;

    } catch (error) {
        console.error("Lỗi khi tính số lần cho phiếu:", error);
        return 1; // Trả về 1 nếu có lỗi
    }
}


// Hàm làm tròn theo yêu cầu (x.2 -> x.0, x.6 -> x+1.0, x.5 giữ nguyên)
function customRound(num, digits = 0) {
    if (isNaN(num)) return 0;

    num = parseFloat(num);
    if (isNaN(num)) return 0;

    const multiplier = Math.pow(10, digits);
    const shifted = num * multiplier;

    // Luôn làm tròn lên khi .5 (giống Excel)
    let result;
    if (shifted >= 0) {
        result = Math.floor(shifted + 0.5) / multiplier;
    } else {
        result = Math.ceil(shifted - 0.5) / multiplier;
    }

    return result;
}


// Hàm format số theo kiểu US (1,000)
function formatNumberUS(num) {
    if (num === undefined || num === null || num === '') return '';
    
    // Chuyển thành số
    const number = parseFloat(num);
    if (isNaN(number)) return num;
    
    // Format với dấu phay phân cách hàng nghìn
    return number.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}


// ===== THÊM MỚI: HÀM LÀM TRÒN LÊN CHO SỐ TẤM THAM CHIẾU =====
function roundUp(num) {
    if (isNaN(num)) return 0;

    num = parseFloat(num);
    if (isNaN(num)) return 0;

    return Math.ceil(num); // Làm tròn lên: 2.2 -> 3, 2.8 -> 3
}


// 1. Thêm hàm tính số tấm xén theo công thức yêu cầu
function tinhSoTamXen(kho, khoXen, dai, daiXen, soTamCatDuoc, xaDoi) {
    if (!kho || !khoXen || !dai || !daiXen || !soTamCatDuoc) {
        return soTamCatDuoc; // Nếu thiếu thông tin, trả về số tấm cắt được
    }

    // Convert inputs to numbers - dùng đúng tên biến theo logic ban đầu
    const Q = parseFloat(kho);        // Q = KHỔ(MM) - tương ứng với cột khổ trong báo cáo 
    const AH = parseFloat(khoXen);    // AH = KHỔ XÉN
    const R = parseFloat(dai);        // R = DÀI(MM) - tương ứng với cột dài trong báo cáo
    const AI = parseFloat(daiXen);    // AI = DÀI XÉN  
    const T = parseFloat(soTamCatDuoc); // T = SỐ TẤM CẮT ĐƯỢC
    const AD = parseInt(xaDoi) || 0;  // AD = XẢ ĐÔI

    console.log("=== DEBUG TÍNH SỐ TẤM XÉN ===");
    console.log("Q (KHỔ):", Q);
    console.log("AH (KHỔ XÉN):", AH);
    console.log("R (DÀI):", R);
    console.log("AI (DÀI XÉN):", AI);
    console.log("T (SỐ TẤM CẮT ĐƯỢC):", T);
    console.log("AD (XẢ ĐÔI):", AD);

    // Tính tỷ lệ
    const tyLeKho = Q / AH;
    const tyLeDai = R / AI;

    console.log("Tỷ lệ khổ (Q/AH):", tyLeKho);
    console.log("Tỷ lệ dài (R/AI):", tyLeDai);

    // Điều kiện 1: AD=0 và cả khổ và dài đều trong khoảng 1.95-2.08
    if (AD === 0 &&
        (tyLeKho >= 1.95 && tyLeKho <= 2.08) &&
        (tyLeDai >= 1.95 && tyLeDai <= 2.08)) {
        console.log("Điều kiện 1: AD=0, cả khổ và dài 1.95-2.08 -> T*4");
        return T * 4;
    }

    // Điều kiện 2: AD=0 và (khổ HOẶC dài) trong khoảng 1.95-2.08
    if (AD === 0 &&
        ((tyLeKho >= 1.95 && tyLeKho <= 2.08) || (tyLeDai >= 1.95 && tyLeDai <= 2.08))) {
        console.log("Điều kiện 2: AD=0, khổ HOẶC dài 1.95-2.08 -> T*2");
        return T * 2;
    }

    // Điều kiện 3: AD=1 và (khổ HOẶC dài) trong khoảng 1.95-2.08
    if (AD === 1 &&
        ((tyLeKho >= 1.95 && tyLeKho <= 2.08) || (tyLeDai >= 1.95 && tyLeDai <= 2.08))) {
        console.log("Điều kiện 3: AD=1, khổ HOẶC dài 1.95-2.08 -> T");
        return T;
    }

    // Điều kiện 4: AD=1 và (khổ HOẶC dài) trong khoảng 2.98-3.08
    if (AD === 1 &&
        ((tyLeKho >= 2.98 && tyLeKho <= 3.08) || (tyLeDai >= 2.98 && tyLeDai <= 3.08))) {
        console.log("Điều kiện 4: AD=1, khổ HOẶC dài 2.98-3.08 -> T + T/2");
        return T + T / 2;
    }

    // Điều kiện 5: AD=0 và (khổ HOẶC dài) trong khoảng 2.98-3.08
    if (AD === 0 &&
        ((tyLeKho >= 2.98 && tyLeKho <= 3.08) || (tyLeDai >= 2.98 && tyLeDai <= 3.08))) {
        console.log("Điều kiện 5: AD=0, khổ HOẶC dài 2.98-3.08 -> T*3");
        return T * 3;
    }

    // Điều kiện 6: AD=1 và (khổ HOẶC dài) trong khoảng 3.98-4.08
    if (AD === 1 &&
        ((tyLeKho >= 3.98 && tyLeKho <= 4.08) || (tyLeDai >= 3.98 && tyLeDai <= 4.08))) {
        console.log("Điều kiện 6: AD=1, khổ HOẶC dài 3.98-4.08 -> T*2");
        return T * 2;
    }

    // Điều kiện 7: AD=0 và cả khổ và dài đều trong khoảng 3.98-4.08
    if (AD === 0 &&
        (tyLeKho >= 3.98 && tyLeKho <= 4.08) &&
        (tyLeDai >= 3.98 && tyLeDai <= 4.08)) {
        console.log("Điều kiện 7: AD=0, cả khổ và dài 3.98-4.08 -> T*4");
        return T * 4;
    }

    // Mặc định: trả về T
    console.log("Mặc định: không thỏa mãn điều kiện nào -> T");
    return T;
}



// THÊM HÀM MỚI: getTlTraDuTinhValue - Lấy giá trị TL trả dự tính chính xác
function getTlTraDuTinhValue() {
    const tlTraElement = document.getElementById('tlTraDuKien');
    if (!tlTraElement) return '';

    // Ưu tiên lấy từ data attribute (giá trị đã làm tròn)
    const dataValue = tlTraElement.getAttribute('data-rounded-value');
    if (dataValue) {
        console.log(`Lấy TL trả dự tính từ data-rounded-value: ${dataValue}`);
        return dataValue;
    }

    // Nếu không có data attribute, lấy từ value
    const inputValue = tlTraElement.value;
    if (inputValue) {
        console.log(`Lấy TL trả dự tính từ input value: ${inputValue}`);
        return inputValue;
    }

    // Nếu không có gì, tính toán lại
    console.log("Không có TL trả dự tính, thử tính toán lại...");

    // Lấy các giá trị cần thiết
    const trongLuongNhan = parseFloat(document.getElementById('tln')?.value || '0');
    const soTamCatDuoc = parseFloat(document.getElementById('soTamCatDuoc')?.value || '0');
    const dauCuon = parseFloat(document.getElementById('dauCuon')?.value || '0');
    const rachMop = parseFloat(document.getElementById('rachMop')?.value || '0');
    const dai = parseFloat(document.getElementById('dai')?.value || '0');

    // Lấy mã giấy để tính định lượng và khổ cắt
    const maVatTuElement = document.getElementById('maVatTu');
    const maGiay = maVatTuElement?.value || '';
    const xaDoi = parseInt(document.getElementById('xadoiSelect')?.value || '0');

    let dinhLuong = 0;
    let khoCat = 0;

    // Tính từ mã giấy
    if (maGiay) {
        const parts = maGiay.split('-');
        if (parts.length >= 4) {
            // Định lượng từ EEEE
            const eeee = parts[1];
            const dinhLuongNumber = parseInt(eeee, 10);
            if (!isNaN(dinhLuongNumber)) {
                dinhLuong = dinhLuongNumber;
            }

            // Khổ cắt từ FFFF và xả đôi
            const ffff = parts[2];
            const khoNumber = parseInt(ffff, 10);
            if (!isNaN(khoNumber)) {
                if (xaDoi === 1) {
                    khoCat = Math.floor(khoNumber / 2);
                } else {
                    khoCat = khoNumber;
                }
            }
        }
    }

    // Kiểm tra nếu đủ dữ liệu để tính
    if (trongLuongNhan && soTamCatDuoc && dai && khoCat && dinhLuong) {
        const tamLuong = (soTamCatDuoc * dai * khoCat * dinhLuong) / 1000000000;
        const tlTraDuKienRaw = trongLuongNhan - tamLuong - dauCuon - rachMop;
        const tlTraDuKienRounded = customRound(tlTraDuKienRaw);
        const tlTraDuKien = Number.isInteger(tlTraDuKienRounded) ?
            tlTraDuKienRounded.toFixed(1) :
            tlTraDuKienRounded.toFixed(1);

        console.log(`Tính toán lại TL trả dự tính: ${tlTraDuKien}`);
        console.log(`Công thức: (${trongLuongNhan} - (${soTamCatDuoc} × ${dai} × ${khoCat} × ${dinhLuong} ÷ 1000000000) - ${dauCuon} - ${rachMop})`);

        return tlTraDuKien;
    }

    console.log("Không đủ dữ liệu để tính TL trả dự tính");
    return '';
}


// Hàm tính các giá trị dẫn xuất (TL trả dự kiến và số tấm tham chiếu)
function calculateDerivedValues() {
    console.log("Đang tính toán các giá trị dẫn xuất...");

    // Lấy các giá trị cần thiết để tính TL trả dự kiến
    const trongLuongNhan = parseFloat(document.getElementById('tln')?.value || '0');
    const soTamCatDuoc = parseFloat(document.getElementById('soTamCatDuoc')?.value || '0');
    const dauCuon = parseFloat(document.getElementById('dauCuon')?.value || '0');
    const rachMop = parseFloat(document.getElementById('rachMop')?.value || '0');

    // Lấy mã giấy để tính định lượng và khổ cắt
    const maVatTuElement = document.getElementById('maVatTu');
    const maGiay = maVatTuElement?.value || '';

    // Lấy xả đôi
    const xaDoi = parseInt(document.getElementById('xadoiSelect')?.value || '0');

    // Lấy dài từ form
    const dai = parseFloat(document.getElementById('dai')?.value || '0');

    let dinhLuong = 0;
    let khoCat = 0;

    // Tính định lượng từ mã giấy (vị trí EEEE)
    if (maGiay) {
        const parts = maGiay.split('-');
        if (parts.length >= 4) {
            // Định lượng từ EEEE
            const eeee = parts[1];
            const dinhLuongNumber = parseInt(eeee, 10);
            if (!isNaN(dinhLuongNumber)) {
                dinhLuong = dinhLuongNumber;
            }

            // Khổ cắt từ FFFF và xả đôi
            const ffff = parts[2];
            const khoNumber = parseInt(ffff, 10);
            if (!isNaN(khoNumber)) {
                if (xaDoi === 1) {
                    khoCat = Math.floor(khoNumber / 2); // Xả đôi - chia đôi
                } else {
                    khoCat = khoNumber; // Không xả đôi - giữ nguyên
                }
            }
        }
    }

    // Nếu không tính được từ mã giấy, lấy từ data attribute hoặc form
    if (!dinhLuong) {
        if (maVatTuElement && maVatTuElement.hasAttribute('data-dinh-luong')) {
            dinhLuong = parseFloat(maVatTuElement.getAttribute('data-dinh-luong') || '0');
        }
        if (!dinhLuong) {
            const dinhLuongElement = document.getElementById('dinhLuong');
            if (dinhLuongElement) {
                dinhLuong = parseFloat(dinhLuongElement.value || '0');
            }
        }
    }

    // Nếu không tính được khổ cắt từ mã giấy, lấy từ form
    if (!khoCat) {
        khoCat = parseFloat(document.getElementById('kho')?.value || '0');
    }

    console.log("Giá trị để tính TL trả:", {
        trongLuongNhan,
        soTamCatDuoc,
        dai,
        khoCat,
        dinhLuong,
        dauCuon,
        rachMop,
        xaDoi,
        maGiay
    });

    const tlTraElement = document.getElementById('tlTraDuKien');
    const tlTraFormulaElement = document.getElementById('tlTraFormula');

    // ===== SỬA ĐỔI CHÍNH: BỎ ĐIỀU KIỆN !isPhieuBoSungSau() =====
    // Tính TL trả dự tính khi có đủ dữ liệu (bất kể phiếu thường hay bổ sung sau)
    if (tlTraElement && trongLuongNhan && soTamCatDuoc && dai && khoCat && dinhLuong) {
        // Công thức: (Trọng lượng nhận - (Số tấm cắt được * Dài * Khổ cắt * Định lượng / 1000000000) - Đầu cuộn - Rách móp)
        const tamLuong = (soTamCatDuoc * dai * khoCat * dinhLuong) / 1000000000;
        const tlTraDuKienRaw = trongLuongNhan - tamLuong - dauCuon - rachMop;

        // Làm tròn theo yêu cầu
        const tlTraDuKienRounded = customRound(tlTraDuKienRaw);

        // Format để hiển thị với đúng số thập phân
        const tlTraDuKien = Number.isInteger(tlTraDuKienRounded) ?
            tlTraDuKienRounded.toFixed(1) :
            tlTraDuKienRounded.toFixed(1);

        // QUAN TRỌNG: Lưu giá trị vào cả input value và data attribute
        tlTraElement.value = tlTraDuKien;
        tlTraElement.setAttribute('data-rounded-value', tlTraDuKien);

        console.log("Đã tính TL trả dự kiến:", tlTraDuKienRaw, "-> làm tròn thành:", tlTraDuKien);
        console.log("Đã lưu vào input value:", tlTraElement.value);
        console.log("Đã lưu vào data-rounded-value:", tlTraElement.getAttribute('data-rounded-value'));

        // ===== THÊM THÔNG BÁO CHO PHIẾU BỔ SUNG SAU =====
        if (isPhieuBoSungSau()) {
            console.log("✅ Phiếu bổ sung sau - Đã tự động tính TL trả dự tính khi có đủ dữ liệu");
        }
    } else {
        console.log("Không đủ dữ liệu để tính TL trả dự kiến:", {
            trongLuongNhan: !!trongLuongNhan,
            soTamCatDuoc: !!soTamCatDuoc,
            dai: !!dai,
            khoCat: !!khoCat,
            dinhLuong: !!dinhLuong,
            hasElement: !!tlTraElement
        });
        if (tlTraFormulaElement) {
            tlTraFormulaElement.remove();
        }
    }

    // Tính số tấm tham chiếu (giữ nguyên như cũ)
    const chieuCaoPallet = parseFloat(document.getElementById('chieuCaoPallet')?.value || '0');

    // Sử dụng hàm nâng cấp để lấy độ dày
    getMaGiayDoDay().then(doDay => {
        console.log("=== TÍNH SỐ TẤM THAM CHIẾU ===");
        console.log("Độ dày giấy từ định mức:", doDay);
        console.log("Chiều cao pallet:", chieuCaoPallet);

        if (maVatTuElement && doDay > 0) {
            // Lưu độ dày vào data attribute
            maVatTuElement.setAttribute('data-do-day', doDay);
        }

        const soTamThamChieuElement = document.getElementById('soTamThamChieu');

        if (soTamThamChieuElement && chieuCaoPallet && doDay && doDay > 0) {
            // Tính số tấm tham chiếu: (Chiều cao pallet × 10) / Độ dày giấy
            const soTamThamChieuRaw = (chieuCaoPallet * 10) / doDay;

            // ===== SỬA ĐỔI: SỬ DỤNG roundUp THAY VÌ customRound =====
            const soTamThamChieuRounded = roundUp(soTamThamChieuRaw); // Làm tròn lên
            const soTamThamChieu = soTamThamChieuRounded.toFixed(1);

            soTamThamChieuElement.value = soTamThamChieu;
            soTamThamChieuElement.setAttribute('data-rounded-value', soTamThamChieu);

            console.log(`✓ Đã tính số tấm tham chiếu: (${chieuCaoPallet} × 10) / ${doDay} = ${soTamThamChieuRaw} -> làm tròn lên: ${soTamThamChieuRounded}`);
        } else {
            console.log("✗ Không thể tính số tấm tham chiếu:", {
                chieuCaoPallet,
                doDay,
                hasElement: !!soTamThamChieuElement
            });
        }
    }).catch(error => {
        console.error("Lỗi khi lấy độ dày giấy:", error);
    });

    // TÍNH SỐ TẤM XÉN - lấy đúng dữ liệu từ form
    const kho = parseFloat(document.getElementById('kho')?.value || '0');      // Khổ từ form
    const khoXen = parseFloat(document.getElementById('khoXen')?.value || '0'); // Khổ xén
    // const dai = parseFloat(document.getElementById('dai')?.value || '0');      // Dài từ form  
    const daiXen = parseFloat(document.getElementById('daiXen')?.value || '0'); // Dài xén
    // const soTamCatDuoc = parseFloat(document.getElementById('soTamCatDuoc')?.value || '0');
    // const xaDoi = parseInt(document.getElementById('xadoiSelect')?.value || '0');

    console.log("=== TÍNH SỐ TẤM XÉN ===");
    console.log("Khổ:", kho);
    console.log("Khổ xén:", khoXen);
    console.log("Dài:", dai);
    console.log("Dài xén:", daiXen);
    console.log("Số tấm cắt được:", soTamCatDuoc);
    console.log("Xả đôi:", xaDoi);

    if (kho && khoXen && dai && daiXen && soTamCatDuoc) {
        const soTamXen = tinhSoTamXen(kho, khoXen, dai, daiXen, soTamCatDuoc, xaDoi);
        console.log("✓ Số tấm xén tính được:", soTamXen);

        const soTamXenElement = document.getElementById('soTamXen');
        if (soTamXenElement) {
            soTamXenElement.value = Math.round(soTamXen); // Làm tròn thành số nguyên
        }
    } else {
        console.log("✗ Thiếu dữ liệu để tính số tấm xén");
    }
}



// 6. Gắn thêm sự kiện cho việc tính toán tự động
function attachAutoCalculationEvents() {
    const triggerFields = [
        'tln', 'soTamCatDuoc', 'dauCuon', 'rachMop',
        'chieuCaoPallet', 'kho', 'dai', 'dinhLuong'
    ];

    triggerFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            // Sự kiện khi thay đổi giá trị
            element.addEventListener('change', function () {
                calculateDerivedValues();
            });

            // Sự kiện khi đang nhập
            element.addEventListener('input', debounce(function () {
                calculateDerivedValues();
            }, 300));
        }
    });

    // Thêm sự kiện cho nút xác nhận
    const confirmButton = document.getElementById('confirmButton');
    if (confirmButton) {
        confirmButton.addEventListener('click', function () {
            // Tính toán lại một lần nữa trước khi gửi
            calculateDerivedValues();
            setTimeout(submitReport, 300); // Đảm bảo tính toán hoàn tất trước khi gửi
        });
    }

    console.log("Đã gắn sự kiện tính toán tự động cho các trường");
}

// 7. Thêm hàm khởi tạo để gắn các sự kiện bổ sung
function setupGMCAdditionalEvents() {
    // Thiết lập sự kiện tính toán tự động
    attachAutoCalculationEvents();

    // Gọi một lần tính toán ngay khi trang đã tải
    setTimeout(calculateDerivedValues, 1000);

    console.log("Đã thiết lập các sự kiện bổ sung cho GMC");
}


// Hàm lấy độ dày giấy từ định mức
async function getMaGiayDoDay() {
    try {
        const maGiay = document.getElementById('maVatTu')?.value || '';

        // Lấy máy từ localStorage thay vì element
        let may = '';
        const urlParams = new URLSearchParams(window.location.search);
        const machineName = urlParams.get('machineName');

        if (machineName) {
            may = machineName;
        } else {
            const selectedMachine = localStorage.getItem('selectedMachine');
            if (selectedMachine) {
                try {
                    const machine = JSON.parse(selectedMachine);
                    may = machine.name || machine.id || '';
                } catch (e) {
                    console.error('Lỗi parse selectedMachine:', e);
                }
            }
        }

        if (!maGiay || !may) {
            console.log("Không có mã giấy hoặc máy để lấy độ dày");
            return 0;
        }

        console.log(`Đang lấy độ dày cho mã giấy: ${maGiay}, máy: ${may}`);

        // Lấy phần AABBCD-EEEE từ mã giấy để so sánh với định mức
        const maGiayParts = maGiay.split('-');
        if (maGiayParts.length < 2) {
            console.log("Mã giấy không đúng định dạng AABBCD-EEEE");
            return 0;
        }

        const maGiayPrefix = `${maGiayParts[0]}-${maGiayParts[1]}`;
        console.log("Mã giấy để tìm độ dày:", maGiayPrefix);

        // Gọi API để lấy dữ liệu định mức
        const response = await fetch('/api/dinh-muc/list');
        if (!response.ok) {
            console.error('Không thể lấy dữ liệu định mức');
            return 0;
        }

        const dinhMucList = await response.json();

        // Lọc định mức theo mã giấy - tìm định mức có mã giấy khớp với AABBCD-EEEE
        const matchedDinhMuc = dinhMucList.filter(dinhMuc => {
            const dinhMucMaGiay = dinhMuc.ma_giay || '';
            return dinhMucMaGiay === maGiayPrefix;
        });

        console.log(`Tìm thấy ${matchedDinhMuc.length} định mức khớp với độ dày cho ${maGiayPrefix}`);

        if (matchedDinhMuc.length > 0) {
            // Lấy định mức đầu tiên khớp
            const dinhMuc = matchedDinhMuc[0];

            // Lấy độ dày theo loại máy
            let doDay = 0;
            if (may === 'GMC 1') {
                doDay = parseFloat(dinhMuc.do_day_giay_gmc1);
                console.log(`Độ dày GMC 1 từ định mức: ${doDay}`);
            } else if (may === 'GMC 2') {
                doDay = parseFloat(dinhMuc.do_day_giay_gmc2);
                console.log(`Độ dày GMC 2 từ định mức: ${doDay}`);
            }

            // Kiểm tra giá trị hợp lệ
            if (!isNaN(doDay) && doDay > 0) {
                console.log(`✓ Lấy được độ dày từ định mức: ${doDay}`);
                return doDay;
            } else {
                console.log(`✗ Độ dày cho ${may} không hợp lệ trong định mức`);
                return 0;
            }
        } else {
            console.log(`✗ Không tìm thấy định mức khớp với mã giấy ${maGiayPrefix}`);
            return 0;
        }

    } catch (error) {
        console.error('Lỗi khi lấy độ dày giấy:', error);
        return 0;
    }
}



// Hàm lấy số tờ/pallet từ định mức
async function getSoToPallet() {
    try {
        const maGiay = document.getElementById('maVatTu')?.value || '';

        // Lấy máy từ localStorage thay vì element
        let may = '';
        const urlParams = new URLSearchParams(window.location.search);
        const machineName = urlParams.get('machineName');

        if (machineName) {
            may = machineName;
        } else {
            const selectedMachine = localStorage.getItem('selectedMachine');
            if (selectedMachine) {
                try {
                    const machine = JSON.parse(selectedMachine);
                    may = machine.name || machine.id || '';
                } catch (e) {
                    console.error('Lỗi parse selectedMachine:', e);
                }
            }
        }

        if (!maGiay || !may) {
            console.log("Không có mã giấy hoặc máy để lấy số tờ/pallet");
            return null;
        }

        console.log(`Đang lấy số tờ/pallet cho mã giấy: ${maGiay}, máy: ${may}`);

        // Lấy phần đầu của mã giấy (AABBCD) để so sánh với định mức
        // Format của mã giấy: AABBCD-EEEE-FFFF-GGGG
        const maGiayParts = maGiay.split('-');
        if (maGiayParts.length < 2) {
            console.log("Mã giấy không đúng định dạng AABBCD-EEEE");
            return null;
        }

        // Lấy phần AABBCD-EEEE để so sánh với định mức
        const maGiayPrefix = `${maGiayParts[0]}-${maGiayParts[1]}`;
        console.log("Mã giấy để tìm định mức:", maGiayPrefix);

        // Gọi API để lấy dữ liệu định mức
        const response = await fetch('/api/dinh-muc/list');
        if (!response.ok) {
            console.error('Không thể lấy dữ liệu định mức');
            return null;
        }

        const dinhMucList = await response.json();
        console.log(`Đã tải ${dinhMucList.length} bản ghi định mức`);

        // Lọc định mức theo mã giấy - tìm định mức có mã giấy khớp với AABBCD-EEEE
        const matchedDinhMuc = dinhMucList.filter(dinhMuc => {
            const dinhMucMaGiay = dinhMuc.ma_giay || '';
            // So sánh chính xác với format AABBCD-EEEE
            return dinhMucMaGiay === maGiayPrefix;
        });

        console.log(`Tìm thấy ${matchedDinhMuc.length} định mức khớp với '${maGiayPrefix}'`);

        if (matchedDinhMuc.length > 0) {
            // Lấy định mức đầu tiên khớp
            const dinhMuc = matchedDinhMuc[0];

            // Lấy số tờ/pallet theo loại máy
            let soToText = '';
            if (may === 'GMC 1') {
                soToText = dinhMuc.so_to_pallet_gmc1;
                console.log(`Số tờ GMC 1 từ định mức: ${soToText}`);
            } else if (may === 'GMC 2') {
                soToText = dinhMuc.so_to_pallet_gmc2;
                console.log(`Số tờ GMC 2 từ định mức: ${soToText}`);
            }

            // Kiểm tra giá trị hợp lệ - chỉ trả về khi có giá trị
            if (soToText && soToText.trim() !== '') {
                const soTo = parseInt(soToText, 10);
                if (!isNaN(soTo) && soTo > 0) {
                    console.log(`✓ Lấy được số tờ/pallet từ định mức: ${soTo}`);
                    return soTo;
                }
            }

            console.log(`✗ Số tờ/pallet cho ${may} không có hoặc không hợp lệ trong định mức`);
            return null;
        } else {
            console.log(`✗ Không tìm thấy định mức khớp với mã giấy ${maGiayPrefix}`);
            return null;
        }

    } catch (error) {
        console.error('Lỗi khi lấy số tờ/pallet:', error);
        return null;
    }
}


// Hàm tự động lấy và hiển thị số tờ/pallet
async function autoFillSoToPallet() {
    const soToInput = document.getElementById('soto');
    if (!soToInput) return;

    try {
        console.log("=== BẮT ĐẦU TỰ ĐỘNG ĐIỀN SỐ TỜ/PALLET ===");

        // Kiểm tra điều kiện
        const maGiay = document.getElementById('maVatTu')?.value || '';
        const may = document.getElementById('may')?.value || '';

        if (!maGiay || !may) {
            console.log("Thiếu mã giấy hoặc máy, không thể lấy số tờ/pallet");
            return;
        }

        // Lưu lại giá trị hiện tại
        const currentValue = soToInput.value;

        // Gọi hàm lấy giá trị từ định mức
        const soTo = await getSoToPallet();

        if (soTo !== null && soTo > 0) {
            // Có giá trị từ định mức, điền vào input
            soToInput.value = soTo;
            console.log(`✓ Đã tự động điền số tờ/pallet từ định mức: ${soTo}`);

            // Hiển thị thông báo nếu giá trị thay đổi
            if (currentValue !== soTo.toString()) {
                showNotification(`Đã cập nhật số tờ/pallet từ định mức: ${soTo}`, 'info');
            }
        } else {
            // Không tìm thấy trong định mức
            console.log("✗ Không tìm thấy số tờ/pallet trong định mức");

            // Xử lý theo từng trường hợp
            if (isPhieuBoSungSau()) {
                // Phiếu bổ sung sau - để trống, sẽ được cập nhật sau
                console.log("Phiếu bổ sung sau - để trống số tờ/pallet");
                soToInput.value = '';
            } else {
                // Phiếu có dữ liệu - giữ nguyên giá trị hiện tại nếu có
                if (currentValue && currentValue.trim() !== '') {
                    console.log("Giữ nguyên giá trị số tờ/pallet hiện tại:", currentValue);
                } else {
                    soToInput.value = '';
                    console.log("Để trống số tờ/pallet do không tìm thấy trong định mức");
                }
            }
        }

    } catch (error) {
        console.error("Lỗi khi tự động điền số tờ/pallet:", error);
    }
}


// 3. Thêm hàm debug để kiểm tra dữ liệu định mức
async function debugDinhMucData() {
    try {
        const response = await fetch('/api/dinh-muc/list');
        if (!response.ok) {
            console.error('Không thể lấy dữ liệu định mức');
            return;
        }

        const dinhMucList = await response.json();
        console.log("=== Dữ liệu Định Mức ===");
        console.log(`Tổng số bản ghi: ${dinhMucList.length}`);

        if (dinhMucList.length > 0) {
            console.log("Mẫu dữ liệu định mức đầu tiên:", dinhMucList[0]);

            // Hiển thị các trường liên quan đến số tờ/pallet
            console.log("Các giá trị số tờ/pallet GMC:");
            dinhMucList.forEach((dm, index) => {
                if (index < 10) { // Chỉ hiển thị 10 bản ghi đầu để không quá rối
                    console.log(`${dm.ma_giay || 'N/A'}: GMC1=${dm.so_to_pallet_gmc1 || 'N/A'}, GMC2=${dm.so_to_pallet_gmc2 || 'N/A'}`);
                }
            });
        }
    } catch (error) {
        console.error("Lỗi khi debug dữ liệu định mức:", error);
    }
}


// 4. Thêm sự kiện cho trường máy và mã giấy để cập nhật số tờ/pallet
function setupSoToPalletAutoFill() {
    const mayElement = document.getElementById('may');
    const maVatTuElement = document.getElementById('maVatTu');

    if (mayElement) {
        // Xóa sự kiện cũ nếu có
        mayElement.removeEventListener('change', handleMayChange);

        // Thêm sự kiện mới
        mayElement.addEventListener('change', handleMayChange);
    }

    if (maVatTuElement) {
        // Xóa sự kiện cũ nếu có
        maVatTuElement.removeEventListener('change', handleMaVatTuChange);
        maVatTuElement.removeEventListener('input', handleMaVatTuInput);

        // Thêm sự kiện mới
        maVatTuElement.addEventListener('change', handleMaVatTuChange);
        maVatTuElement.addEventListener('input', debounce(handleMaVatTuInput, 500));
    }
}

// Các hàm xử lý sự kiện
function handleMayChange() {
    const maVatTuElement = document.getElementById('maVatTu');
    if (maVatTuElement && maVatTuElement.value) {
        console.log("Máy thay đổi thành:", this.value, "- cập nhật số tờ/pallet");
        autoFillSoToPallet();
    }
}

function handleMaVatTuChange() {
    const mayElement = document.getElementById('may');
    if (mayElement && mayElement.value) {
        console.log("Mã vật tư thay đổi thành:", this.value, "- cập nhật số tờ/pallet");
        autoFillSoToPallet();
    }
}

function handleMaVatTuInput() {
    const mayElement = document.getElementById('may');
    if (mayElement && mayElement.value) {
        console.log("Mã vật tư đang nhập:", this.value, "- cập nhật số tờ/pallet");
        autoFillSoToPallet();
    }
}





// Thêm gọi hàm calculateDerivedValues vào các sự kiện thay đổi dữ liệu liên quan
function setupFormChangeEvents() {
    // Lấy tất cả các input, select trong form
    const formInputs = document.querySelectorAll('input, select, textarea');

    formInputs.forEach(input => {
        input.addEventListener('change', function () {
            // Cập nhật tiến độ khi có thay đổi
            updateProgress();

            // Nếu là các trường liên quan đến công thức tính toán, tính lại giá trị dẫn xuất
            const triggerFields = ['tln', 'soTamCatDuoc', 'kho', 'dai', 'dinhLuong', 'dauCuon', 'rachMop', 'chieuCaoPallet', 'maVatTu'];
            if (triggerFields.includes(this.id)) {
                calculateDerivedValues();
            }
        });

        // Thêm sự kiện input để cập nhật ngay khi nhập
        if (['tln', 'soTamCatDuoc', 'dauCuon', 'rachMop', 'chieuCaoPallet'].includes(input.id)) {
            input.addEventListener('input', debounce(function () {
                calculateDerivedValues();
            }, 300));
        }
    });

    // Thiết lập sự kiện khi chọn có số ID
    setupIDRadioEvents();

    // Thêm sự kiện cho nút bắt đầu để tính toán giá trị dẫn xuất
    const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');
    if (startButton) {
        startButton.addEventListener('click', function () {
            // Tính toán sau khi bấm bắt đầu
            setTimeout(calculateDerivedValues, 500);
        });
    }

    // Thêm sự kiện cho trường chiều cao pallet
    const chieuCaoPalletElement = document.getElementById('chieuCaoPallet');
    if (chieuCaoPalletElement) {
        chieuCaoPalletElement.addEventListener('input', debounce(function () {
            calculateDerivedValues();
        }, 300));
    }

    // THÊM PHẦN NÀY - Sự kiện cho phiếu bổ sung sau
    const supplementaryFields = ['tln', 'soTamCatDuoc', 'dauCuon', 'rachMop', 'chieuCaoPallet', 'maVatTu'];
    supplementaryFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', debounce(function () {
                // Kiểm tra nếu là phiếu bổ sung sau
                if (isPhieuBoSungSau()) {
                    calculateDerivedValues();
                }
            }, 300));
        }
    });

}


//todo Hiển thị trạng thái đang tải========================================================
function showLoadingState(isLoading) {
    // Triển khai nếu cần
    // Ví dụ: hiển thị spinner, disable các nút, v.v.

    // Nếu đang tải, disable các nút
    const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');
    const confirmButton = document.querySelector('.btn.btn-primary');

    if (startButton) startButton.disabled = isLoading;
    if (confirmButton) confirmButton.disabled = isLoading;
}

//todo Hiển thị thông báo========================================================
function showNotification(message, type = 'info') {
    // Định nghĩa màu theo loại thông báo
    const colors = {
        'info': '#2196F3',
        'success': '#4CAF50',
        'warning': '#FF9800',
        'error': '#F44336'
    };

    // Tạo phần tử thông báo
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.marginRight = '0 auto';
    notification.style.top = '20px';
    notification.style.left = '20px';
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    notification.style.zIndex = '9999';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    notification.textContent = message;

    // Thêm vào body
    document.body.appendChild(notification);

    // Hiển thị với animation
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 1000);
}

//todo Thiết lập sự kiện cho select mã số cuộn=============================================================================
function setupMaSoCuonSelect() {
    const maSoCuonSelect = document.getElementById('maSoCuonSelect');
    const maSoCuonInputContainer = document.getElementById('maSoCuonInputContainer');
    const maSoCuonInput = document.getElementById('maSoCuon');

    if (!maSoCuonSelect || !maSoCuonInputContainer || !maSoCuonInput) {
        console.error('Không tìm thấy các phần tử cần thiết cho mã số cuộn');
        return;
    }

    // Sự kiện khi thay đổi lựa chọn
    maSoCuonSelect.addEventListener('change', function () {
        const selectedValue = this.value;

        if (selectedValue === 'nhap') {
            // Nếu chọn "Nhập mã số cuộn...", hiển thị ô input
            maSoCuonInputContainer.style.display = 'block';
            maSoCuonInput.value = '';
            maSoCuonInput.focus();
        } else if (selectedValue === 'TƯƠNG TỰ CUỘN TRÊN') {
            // Nếu chọn "TƯƠNG TỰ CUỘN TRÊN", tìm mã số cuộn từ phiếu trước
            maSoCuonInputContainer.style.display = 'none';
            handleSimilarRollOption();
        } else {
            // Nếu chọn các lựa chọn khác, ẩn ô input và sử dụng giá trị đã chọn
            maSoCuonInputContainer.style.display = 'none';
            maSoCuonInput.value = selectedValue;

            // Cập nhật tiến độ
            updateProgress();
        }
    });

    // Sự kiện khi nhập liệu vào ô input
    maSoCuonInput.addEventListener('input', function () {
        // Cập nhật tiến độ khi có thay đổi
        updateProgress();
    });

    // Sự kiện khi nhập xong (blur)
    maSoCuonInput.addEventListener('blur', function () {
        // Kiểm tra nếu đã nhập giá trị thì cập nhật tiến độ
        if (this.value.trim()) {
            updateProgress();
        }
    });

    console.log('Đã thiết lập sự kiện cho mã số cuộn');
}

//todo Lấy giá trị mã số cuộn chính xác=============================================================================
function getMaSoCuonValue() {
    const maSoCuonSelect = document.getElementById('maSoCuonSelect');
    const maSoCuonInput = document.getElementById('maSoCuon');

    if (!maSoCuonSelect || !maSoCuonInput) {
        return '';
    }

    // Luôn lấy giá trị từ ô input, vì chúng ta đã xử lý tất cả các trường hợp
    // và đặt giá trị thích hợp vào ô input
    return maSoCuonInput.value.trim();
}

//todo Hàm lấy mã số cuộn từ phiếu báo cáo trước đó=============================================================================
async function getPreviousRollCode() {
    try {
        // Lấy số phiếu hiện tại và máy
        const currentPhieu = document.getElementById('soPhieu').value.trim();
        const currentThuTu = document.getElementById('thuTu').value;
        // THÊM: Lấy máy từ localStorage thay vì element
        let currentMay = '';
        const urlParams = new URLSearchParams(window.location.search);
        const machineName = urlParams.get('machineName');

        if (machineName) {
            currentMay = machineName;
        } else {
            const selectedMachine = localStorage.getItem('selectedMachine');
            if (selectedMachine) {
                try {
                    const machine = JSON.parse(selectedMachine);
                    currentMay = machine.name || machine.id || '';
                } catch (e) {
                    console.error('Lỗi parse selectedMachine:', e);
                }
            }
        }

        if (!currentPhieu || currentPhieu === 'PC') {
            showNotification('Vui lòng nhập số phiếu trước', 'warning');
            return null;
        }

        if (!currentMay) {
            showNotification('Vui lòng chọn máy trước', 'warning');
            return null;
        }

        console.log('Đang tìm mã số cuộn từ phiếu trước của:', currentPhieu, 'với thứ tự:', currentThuTu, 'và máy:', currentMay);

        // Gọi API để lấy danh sách báo cáo
        const response = await fetch('/api/bao-cao-gmc/list');
        if (!response.ok) {
            throw new Error('Không thể tải danh sách báo cáo để tìm phiếu trước');
        }

        const reportList = await response.json();

        // SỬA: Lọc theo máy trước khi sắp xếp
        const sameTypeReports = reportList.filter(report => report.may === currentMay);
        console.log(`Đã lọc ${sameTypeReports.length} báo cáo cùng máy ${currentMay} từ tổng ${reportList.length} báo cáo`);

        // Sắp xếp theo created_at giảm dần (báo cáo mới nhất lên trước)
        sameTypeReports.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
        });

        console.log(`Đã tải ${sameTypeReports.length} báo cáo cùng máy ${currentMay} để tìm phiếu trước`);

        let previousReport = null;

        // Trường hợp 1: Nếu có thứ tự, tìm phiếu có cùng số phiếu nhưng thứ tự liền trước
        if (currentThuTu && currentThuTu !== '-- Thứ tự --') {
            const currentThuTuNum = parseInt(currentThuTu);
            if (!isNaN(currentThuTuNum) && currentThuTuNum > 1) {
                // Tìm phiếu có cùng số phiếu, cùng máy và thứ tự = currentThuTu - 1
                const targetThuTu = (currentThuTuNum - 1).toString();

                previousReport = sameTypeReports.find(report =>
                    report.so_phieu_cat_giay === currentPhieu &&
                    report.thu_tu_cuon === targetThuTu
                );

                console.log(`Tìm theo thứ tự liền trước (${targetThuTu}) cùng máy ${currentMay}:`, previousReport);
            }
        }

        // Trường hợp 2: Nếu không tìm thấy theo thứ tự, tìm báo cáo mới nhất có cùng số phiếu và cùng máy
        if (!previousReport) {
            previousReport = sameTypeReports.find(report =>
                report.so_phieu_cat_giay === currentPhieu
            );
            console.log(`Tìm theo số phiếu mới nhất cùng máy ${currentMay}:`, previousReport);
        }

        // Trường hợp 3: Nếu vẫn không tìm thấy, lấy báo cáo mới nhất cùng máy (bất kỳ số phiếu nào)
        if (!previousReport && sameTypeReports.length > 0) {
            // Duyệt qua tất cả báo cáo cùng máy để tìm mã số cuộn gần nhất
            for (const report of sameTypeReports) {
                if (report.ma_so_cuon && report.ma_so_cuon.trim() !== '') {
                    previousReport = report;
                    break;
                }
            }
            console.log(`Tìm theo báo cáo mới nhất cùng máy ${currentMay}:`, previousReport);
        }

        if (previousReport) {
            console.log('Đã tìm thấy phiếu trước cùng máy', {
                id: previousReport.id,
                soPhieu: previousReport.so_phieu_cat_giay,
                thuTu: previousReport.thu_tu_cuon,
                may: previousReport.may,
                maSoCuon: previousReport.ma_so_cuon,
                createdAt: previousReport.created_at
            });

            // Trả về mã số cuộn (bao gồm cả giá trị trống hoặc đặc biệt)
            const maSoCuon = previousReport.ma_so_cuon || '';
            return maSoCuon;
        } else {
            console.log(`Không tìm thấy phiếu trước cùng máy ${currentMay}`);
            return null;
        }

    } catch (error) {
        console.error('Lỗi khi lấy mã số cuộn từ phiếu trước:', error);
        showNotification('Lỗi khi lấy mã số cuộn từ phiếu trước: ' + error.message, 'error');
        return null;
    }
}


//todo Hàm xử lý khi chọn "TƯƠNG TỰ CUỘN TRÊN"=============================================================================
async function handleSimilarRollOption() {
    // Hiển thị trạng thái đang tải
    // showNotification('Đang tìm mã số cuộn từ phiếu trước...', 'info');

    // Lấy mã số cuộn từ phiếu trước
    const previousCode = await getPreviousRollCode();

    // Lấy các element cần thiết
    const maSoCuonInput = document.getElementById('maSoCuon');
    const maSoCuonSelect = document.getElementById('maSoCuonSelect');

    if (previousCode !== null) {
        // Luôn đặt giá trị vào input và giữ nguyên dropdown hiển thị "TƯƠNG TỰ CUỘN TRÊN"
        if (maSoCuonInput) {
            maSoCuonInput.value = previousCode;
        }

        // Đảm bảo dropdown luôn hiển thị "TƯƠNG TỰ CUỘN TRÊN"
        if (maSoCuonSelect) {
            maSoCuonSelect.value = 'TƯƠNG TỰ CUỘN TRÊN';
        }

        const currentMay = getCurrentMachineId() ? machineName || 'máy hiện tại' : 'máy không xác định';
        showNotification(`Đã lấy mã số cuộn từ phiếu trước của máy ${currentMay}: ${previousCode}`, 'success');

        // Cập nhật tiến độ
        updateProgress();
    } else {
        showNotification(`Không tìm thấy mã số cuộn từ phiếu trước của máy ${currentMay}`, 'warning');

        // Nếu không tìm thấy, có thể đặt lại dropdown về giá trị mặc định
        if (maSoCuonSelect) {
            maSoCuonSelect.selectedIndex = 0;
        }
    }
}

//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG QUẢN LÝ DỪNG MÁY
//  Mô tả: Xử lý các sự kiện liên quan đến báo cáo dừng máy
//! =================================================================

// Biến lưu trữ trạng thái
let reasonCount = 1; // Đếm số lý do
let machineStopStatusSelected = false;
let offlineReportQueue = [];
let isOnline = navigator.onLine;


// Thiết lập các sự kiện cho dừng máy
function setupDungMayEvents() {
    console.log('Bắt đầu thiết lập sự kiện dừng máy...');

    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const machineReport = document.getElementById('machineReport');
    const stopReason = document.getElementById('stopReason');
    const submitStopOnlyButton = document.getElementById('submitStopOnlyButton');

    // Kiểm tra các phần tử có tồn tại không
    if (!btnYes || !btnNo || !machineReport) {
        console.error('Không tìm thấy các phần tử cần thiết cho dừng máy');
        return;
    }

    console.log('Đã tìm thấy tất cả phần tử cần thiết');

    // XÓA TẤT CẢ SỰ KIỆN CŨ (nếu có)
    btnYes.onclick = null;
    btnNo.onclick = null;

    // SỬA: Đặt trạng thái ban đầu chính xác - nền trắng chữ đen
    btnNo.style.backgroundColor = 'white';
    btnNo.style.color = 'black';
    btnNo.style.border = '2px solid #ccc';
    btnNo.classList.remove('active'); // Đảm bảo không có class active

    btnYes.style.backgroundColor = 'white';
    btnYes.style.color = 'black';
    btnYes.style.border = '2px solid #ccc';
    btnYes.classList.remove('active'); // Đảm bảo không có class active

    if (machineReport) {
        machineReport.style.display = 'none';
    }

    // ẨN NÚT DỪNG MÁY KHÔNG CÓ WS BAN ĐẦU
    if (submitStopOnlyButton) {
        const helpText = document.getElementById('stopOnlyHelpText');
        submitStopOnlyButton.style.display = 'none';
        if (helpText) helpText.style.display = 'none';
    }

    // Đặt trạng thái ban đầu là chưa chọn
    machineStopStatusSelected = false;

    // SỰ KIỆN NÚT "CÓ"
    btnYes.onclick = function (e) {
        console.log('Đã click nút CÓ dừng máy');
        e.preventDefault();
        e.stopPropagation();

        // Cập nhật trạng thái và giao diện
        machineReport.style.display = 'block';

        // ÁP DỤNG MÀU XANH BIỂN CHO NÚT CÓ
        btnYes.style.backgroundColor = '#007bff';
        btnYes.style.color = 'white';
        btnYes.style.border = '2px solid #007bff';
        btnYes.classList.add('active');

        // ÁP DỤNG MÀU TRẮNG CHO NÚT KHÔNG
        btnNo.style.backgroundColor = 'white';
        btnNo.style.color = 'black';
        btnNo.style.border = '2px solid #ccc';
        btnNo.classList.remove('active');

        // Hiển thị nút "Dừng máy không có WS"
        if (submitStopOnlyButton) {
            const helpText = document.getElementById('stopOnlyHelpText');
            submitStopOnlyButton.style.display = 'inline-block';
            if (helpText) helpText.style.display = 'block';
            console.log('Đã hiển thị nút "Dừng máy không có WS"');
        }

        // Đánh dấu đã chọn
        machineStopStatusSelected = true;
        console.log('Đã chọn CÓ dừng máy');

        // THÊM: Cập nhật progress để kiểm tra nút xác nhận
        updateProgress();
        return false;
    };

    // SỰ KIỆN NÚT "KHÔNG"
    btnNo.onclick = function (e) {
        console.log('Đã click nút KHÔNG dừng máy');
        e.preventDefault();
        e.stopPropagation();

        // Cập nhật trạng thái và giao diện
        machineReport.style.display = 'none';

        // ÁP DỤNG MÀU XANH BIỂN CHO NÚT KHÔNG
        btnNo.style.backgroundColor = '#007bff';
        btnNo.style.color = 'white';
        btnNo.style.border = '2px solid #007bff';
        btnNo.classList.add('active');

        // ÁP DỤNG MÀU TRẮNG CHO NÚT CÓ
        btnYes.style.backgroundColor = 'white';
        btnYes.style.color = 'black';
        btnYes.style.border = '2px solid #ccc';
        btnYes.classList.remove('active');

        // Ẩn nút "Dừng máy không có WS"
        if (submitStopOnlyButton) {
            const helpText = document.getElementById('stopOnlyHelpText');
            submitStopOnlyButton.style.display = 'none';
            if (helpText) helpText.style.display = 'none';
            console.log('Đã ẩn nút "Dừng máy không có WS"');
        }

        // Xóa tất cả các khung lý do dừng máy khi chọn KHÔNG
        const stopBoxes = document.querySelectorAll('.stop-reason-box');
        stopBoxes.forEach(box => box.remove());

        // Đánh dấu đã chọn
        machineStopStatusSelected = true;
        console.log('Đã chọn KHÔNG dừng máy');

        // THÊM: Cập nhật progress để kiểm tra nút xác nhận
        updateProgress();
        return false;
    };

    // Sự kiện khi chọn lý do dừng máy - TẠO KHUNG MỚI
    if (stopReason) {
        // Xóa sự kiện cũ
        stopReason.onchange = null;

        stopReason.onchange = function () {
            console.log('Đã chọn lý do dừng máy:', this.value);

            if (this.value && this.value !== '') {
                // Tạo khung lý do dừng máy mới
                createNewStopReasonBox(this.value);

                // Reset select về trạng thái chưa chọn
                this.selectedIndex = 0;

                updateProgress();
            }
        };
    }

    console.log('Đã thiết lập xong sự kiện dừng máy với màu chính xác');
}



// HÀM MỚI: Tạo khung lý do dừng máy
function createNewStopReasonBox(selectedReason) {
    const container = document.getElementById('additionalReasonsContainer') ||
        document.querySelector('.machine-report');

    if (!container) return;

    // Tạo ID duy nhất cho khung mới
    const boxId = 'stopReasonBox_' + Date.now();

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
                        <input type="datetime-local" class="form-control resume-time-input" id="${boxId}_resumeTime">
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

// HÀM MỚI: Xóa khung lý do dừng máy
function removeStopReasonBox(boxId) {
    const box = document.getElementById(boxId);
    if (box) {
        box.remove();
        updateProgress();
    }
}

// HÀM MỚI: Đặt thời gian hiện tại
function setCurrentTime(inputId, displayId) {
    const now = new Date();
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);

    if (input) {
        input.value = formatDateTimeForInput(now);

        // Kích hoạt sự kiện change để tính thời gian
        input.dispatchEvent(new Event('change'));
    }

    if (display) {
        display.textContent = formatDisplayTime(now);
    }

    // TÌM VÀ ẨN NÚT VỪA BẤM
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

// HÀM MỚI: Thiết lập tính thời gian
function setupDurationCalculation(boxId) {
    const stopTimeInput = document.getElementById(boxId + '_stopTime');
    const resumeTimeInput = document.getElementById(boxId + '_resumeTime');

    console.log(`Thiết lập tính thời gian cho box: ${boxId}`);

    if (stopTimeInput) {
        // Xóa sự kiện cũ nếu có
        stopTimeInput.onchange = null;

        stopTimeInput.onchange = function () {
            console.log(`Thời gian dừng thay đổi: ${this.value}`);
            setTimeout(() => {
                calculateStopDuration(boxId);
            }, 100);
        };

        // Thêm sự kiện input để tính ngay khi nhập
        stopTimeInput.oninput = function () {
            setTimeout(() => {
                calculateStopDuration(boxId);
            }, 300);
        };
    }

    if (resumeTimeInput) {
        // Xóa sự kiện cũ nếu có
        resumeTimeInput.onchange = null;

        resumeTimeInput.onchange = function () {
            console.log(`Thời gian chạy lại thay đổi: ${this.value}`);
            setTimeout(() => {
                calculateStopDuration(boxId);
            }, 100);
        };

        // Thêm sự kiện input để tính ngay khi nhập
        resumeTimeInput.oninput = function () {
            setTimeout(() => {
                calculateStopDuration(boxId);
            }, 300);
        };
    }
}


// HÀM MỚI: Tính thời gian dừng máy
function calculateStopDuration(boxId) {
    console.log(`Bắt đầu tính thời gian cho box: ${boxId}`);

    const stopTimeInput = document.getElementById(boxId + '_stopTime');
    const resumeTimeInput = document.getElementById(boxId + '_resumeTime');
    const durationDisplay = document.getElementById(boxId + '_duration');

    console.log('Elements found:', {
        stopTimeInput: !!stopTimeInput,
        resumeTimeInput: !!resumeTimeInput,
        durationDisplay: !!durationDisplay
    });

    if (stopTimeInput && resumeTimeInput && durationDisplay) {
        const stopValue = stopTimeInput.value;
        const resumeValue = resumeTimeInput.value;

        console.log('Values:', {
            stopValue,
            resumeValue
        });

        if (stopValue && resumeValue) {
            const stopTime = new Date(stopValue);
            const resumeTime = new Date(resumeValue);

            console.log('Dates:', {
                stopTime: stopTime.toString(),
                resumeTime: resumeTime.toString(),
                isResumeAfterStop: resumeTime > stopTime
            });

            if (resumeTime > stopTime) {
                const diff = resumeTime - stopTime;
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                const durationText = `${hours} giờ ${minutes} phút ${seconds} giây`;
                durationDisplay.value = durationText;

                console.log(`Đã tính thời gian: ${durationText}`);
            } else {
                durationDisplay.value = '0 giờ 0 phút 0 giây';
                console.log('Thời gian chạy lại không lớn hơn thời gian dừng');
            }
        } else {
            console.log('Thiếu giá trị thời gian');
        }
    } else {
        console.error('Không tìm thấy elements cần thiết cho box:', boxId);
    }
}

// Hàm tính thời gian dừng máy
function calculateDuration() {
    const stopTimeInput = document.getElementById('stopTimeInput');
    const resumeTimeInput = document.getElementById('resumeTimeInput');
    const stopDuration = document.getElementById('stopDuration');

    if (stopTimeInput && resumeTimeInput && stopDuration &&
        stopTimeInput.value && resumeTimeInput.value) {
        const stopTime = new Date(stopTimeInput.value);
        const resumeTime = new Date(resumeTimeInput.value);

        // Kiểm tra nếu thời gian chạy lại lớn hơn thời gian dừng
        if (resumeTime > stopTime) {
            const diff = resumeTime - stopTime;

            // Tính giờ, phút, giây
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            stopDuration.value = `${hours} giờ ${minutes} phút ${seconds} giây`;
        } else {
            stopDuration.value = '0 giờ 0 phút 0 giây';
        }

        // Tự động thêm lý do mới khi đã có đủ thời gian dừng và thời gian chạy lại
        setTimeout(function () {
            // Tăng biến đếm lý do
            reasonCount = reasonCount + 1;
            const newReasonId = `reason-${reasonCount}`;

            // Kiểm tra xem đã có phần tử này chưa
            if (document.getElementById(newReasonId)) return;

            // Tạo HTML cho lý do mới
            const newReasonHtml = `
              <div class="stop-reason-container" id="${newReasonId}">
                <hr>
                <div class="row mb-3">
                  <div class="col-4">
                    <label class="fw-bold mb-1">Lý do dừng máy</label>
                    <select class="form-select" id="stopReason">
                      <option value>-- Lý do --</option>
                      <option value="Máy hư">F1 : Máy hư</option>
                      <option value="Chờ giấy">F2 : Chờ giấy</option>
                      <option value="Chờ kế hoạch">F3 : Chờ kế hoạch</option>
                      <option value="Giải lao">F4 : Giải lao</option>
                      <option value="Vệ sinh">F5 : Vệ sinh</option>
                      <option value="Chờ hàng làm việc khác">F6 : Chờ hàng làm việc khác</option>
                      <option value="Bảo dưỡng">F7 : Bảo dưỡng</option>
                      <option value="Cúp điện , mất hơi">F8 : Cúp điện, mất hơi</option>
                      <option value="Lựa giấy">F9 : Lựa giấy</option>
                      <option value="Khác">F10 : Khác</option>
                    </select>
                  </div>
                  
                  <div class="col-4 time-inputs-${reasonCount}" style="display: none;">
                    <label class="fw-bold mb-1">Thời gian dừng máy</label>
                    <div class="position-relative">
                      <input type="datetime-local" class="form-control stop-time-input">
                      <button class="btn btn-primary position-absolute top-0 end-0 h-100 stop-time-button" style="z-index: 10;">
                        Dừng máy
                      </button>
                    </div>
                    <div class="form-text stop-time-display"></div>
                  </div>
                  
                  <div class="col-4 time-inputs-${reasonCount}" style="display: none;">
                    <label class="fw-bold mb-1">Thời gian chạy lại</label>
                    <div class="position-relative">
                      <input type="datetime-local" class="form-control resume-time-input">
                      <button class="btn btn-success position-absolute top-0 end-0 h-100 resume-time-button" style="z-index: 10;">
                        Chạy lại
                      </button>
                    </div>
                    <div class="form-text resume-time-display"></div>
                  </div>
                </div>
                
                <div class="row mb-3 additional-fields-${reasonCount}" style="display: none;">
                  <div class="col-8">
                    <label class="fw-bold mb-1">Lý do khác</label>
                    <input type="text" class="form-control" placeholder="Nhập lý do...">
                  </div>
                  <div class="col-4">
                    <label class="fw-bold mb-1 text-primary">Thời gian dừng máy</label>
                    <input type="text" class="form-control bg-light stop-duration" readonly>
                  </div>
                </div>
                
                <div class="d-flex justify-content-end mb-3">
                  <button class="btn btn-danger delete-reason-btn" data-reason-id="${newReasonId}">
                    <i class="bi bi-trash">🗑️</i>
                  </button>
                </div>
              </div>
            `;

            // Tìm container để thêm vào
            const additionalReasonsContainer = document.getElementById('additionalReasonsContainer');
            if (additionalReasonsContainer) {
                additionalReasonsContainer.insertAdjacentHTML('beforeend', newReasonHtml);

                // Thiết lập sự kiện cho lý do mới
                setupNewReasonEvents(newReasonId);
            }
        }, 500);
    }
}

// Thiết lập các event listener cho lý do mới được thêm vào
function setupNewReasonEvents(reasonId) {
    const container = document.getElementById(reasonId);
    if (!container) return;

    // Tìm các phần tử cần thiết
    const reasonSelect = container.querySelector('.stop-reason-select') ||
        container.querySelector('select');
    const timeInputs = container.querySelectorAll(`[class*="time-inputs"]`);
    const additionalFields = container.querySelector(`[class*="additional-fields"]`);
    const stopTimeInput = container.querySelector('.stop-time-input');
    const resumeTimeInput = container.querySelector('.resume-time-input');
    const stopTimeButton = container.querySelector('.stop-time-button');
    const resumeTimeButton = container.querySelector('.resume-time-button');
    const stopTimeDisplay = container.querySelector('.stop-time-display');
    const resumeTimeDisplay = container.querySelector('.resume-time-display');
    const stopDuration = container.querySelector('.stop-duration');
    const deleteButton = container.querySelector('.delete-reason-btn');

    // Sự kiện chọn lý do
    if (reasonSelect) {
        reasonSelect.addEventListener('change', function () {
            if (this.value) {
                timeInputs.forEach(input => {
                    input.style.display = 'block';
                });
                if (additionalFields) additionalFields.style.display = 'flex';
            } else {
                timeInputs.forEach(input => {
                    input.style.display = 'none';
                });
                if (additionalFields) additionalFields.style.display = 'none';
            }

            // Cập nhật tiến độ
            updateProgress();
        });
    }

    // Nút dừng máy
    if (stopTimeButton) {
        stopTimeButton.onclick = function (e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            const now = new Date();
            const formattedDateTime = formatDateTimeForInput(now);
            if (stopTimeInput) {
                stopTimeInput.value = formattedDateTime;
            }

            // Ẩn nút
            this.style.display = 'none';

            if (stopTimeDisplay) {
                stopTimeDisplay.textContent = formatDisplayTime(now);
            }

            // Tính thời gian
            if (stopTimeInput && resumeTimeInput && stopDuration) {
                if (resumeTimeInput.value) {
                    calculateDurationForReason(stopTimeInput, resumeTimeInput, stopDuration);
                }
            }

            // Cập nhật tiến độ
            updateProgress();

            return false;
        };
    }

    // Nút chạy lại
    if (resumeTimeButton) {
        resumeTimeButton.onclick = function (e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            const now = new Date();
            const formattedDateTime = formatDateTimeForInput(now);
            if (resumeTimeInput) {
                resumeTimeInput.value = formattedDateTime;
            }

            // Ẩn nút
            this.style.display = 'none';

            if (resumeTimeDisplay) {
                resumeTimeDisplay.textContent = formatDisplayTime(now);
            }

            // Tính thời gian
            if (stopTimeInput && resumeTimeInput && stopDuration) {
                if (stopTimeInput.value) {
                    calculateDurationForReason(stopTimeInput, resumeTimeInput, stopDuration);
                }
            }

            // Cập nhật tiến độ
            updateProgress();

            return false;
        };
    }

    // Nút xóa
    if (deleteButton) {
        deleteButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const reasonId = this.getAttribute('data-reason-id');
            const reasonEl = document.getElementById(reasonId);
            if (reasonEl) {
                reasonEl.remove();

                // Cập nhật tiến độ
                updateProgress();
            }

            return false;
        });
    }
}

// Hàm tính thời gian dừng máy cho các lý do bổ sung
function calculateDurationForReason(stopInput, resumeInput, durationOutput) {
    if (stopInput && resumeInput && durationOutput &&
        stopInput.value && resumeInput.value) {
        const stopTime = new Date(stopInput.value);
        const resumeTime = new Date(resumeInput.value);

        if (resumeTime > stopTime) {
            const diff = resumeTime - stopTime;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            durationOutput.value = `${hours} giờ ${minutes} phút ${seconds} giây`;
        } else {
            durationOutput.value = '0 giờ 0 phút 0 giây';
        }
    }
}

// Hàm định dạng datetime cho input
function formatDateTimeForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Thêm giây vào định dạng datetime-local
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// Hàm định dạng thời gian hiển thị
function formatDisplayTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
}






//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG QUẢN LÝ TIẾN ĐỘ VÀ NÚT ĐIỀU KHIỂN
//  Mô tả: Quản lý tiến độ, hiển thị các nút bắt đầu và xác nhận khi đủ thông tin
//! =================================================================

//todo Cập nhật tiến độ của form========================================================
function updateProgress() {
    // Tính toán tiến độ phần bắt đầu báo cáo
    const startProgress = calculateStartProgress();

    // Tính toán tiến độ phần kết thúc báo cáo
    const endProgress = calculateEndProgress();

    // Hiển thị tiến độ và nút bắt đầu
    updateStartProgressDisplay(startProgress);

    // Hiển thị tiến độ và nút xác nhận
    updateEndProgressDisplay(endProgress);
}

//todo Tính tiến độ phần bắt đầu báo cáo========================================================
function calculateStartProgress() {
    let filledFields = 0;
    let totalFields = 0;

    // Kiểm tra nếu đây là báo cáo dừng máy độc lập
    const isDungMayOnly = document.getElementById('btnYes')?.style.backgroundColor === 'rgb(208, 0, 0)' &&
        (!document.getElementById('soPhieu')?.value || document.getElementById('soPhieu')?.value === 'PCG') &&
        (!document.getElementById('ws')?.value);

    if (isDungMayOnly) {
        // Nếu là báo cáo dừng máy độc lập, chỉ kiểm tra Ca, Người thực hiện và Máy
        const requiredFields = ['ca', 'may', 'gioLamViec'];

        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                totalFields++;
                if (element.value.trim()) {
                    filledFields++;
                }
            }
        });

        // Báo cáo dừng máy độc lập nên cho phép trống số phiếu và ws
        return 100; // Đơn giản hóa thành 100% để có thể bắt đầu
    } else {
        // Kiểm tra xem có phải là phiếu bổ sung sau không
        const isSupplementaryReport = isPhieuBoSungSau();

        if (isSupplementaryReport) {
            console.log("Đây là phiếu bổ sung sau, chỉ yêu cầu các trường cơ bản");

            // THÊM: Kiểm tra offline mode
            if (!navigator.onLine) {
                console.log("Offline mode - Chỉ yêu cầu trường cơ bản nhất");
                const offlineBasicFields = ['ca', 'gioLamViec', 'soPhieu', 'thuTu'];
                totalFields = offlineBasicFields.length;

                offlineBasicFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        if (field === 'soPhieu') {
                            if (element.value.trim() && element.value.trim() !== 'PC') {
                                filledFields++;
                            }
                        } else if (element.value.trim() && element.value.trim() !== '-- Thứ tự --') {
                            filledFields++;
                        }
                    }
                });

                // THÊM: Kiểm tra xả đôi và mã số cuộn cho offline
                const xaDoi = document.getElementById('xadoiSelect');
                if (xaDoi) {
                    totalFields++;
                    if (xaDoi.value) {
                        filledFields++;
                    }
                }

                // Kiểm tra số ID cho offline
                const nhapSoID = document.getElementById('nhapSoID');
                const inputSoID = document.getElementById('inputSoID');
                if (nhapSoID && inputSoID) {
                    totalFields++;
                    if (!nhapSoID.checked || (nhapSoID.checked && inputSoID.value.trim())) {
                        filledFields++;
                    }
                }

                // Kiểm tra mã số cuộn cho offline
                totalFields++;
                if (getMaSoCuonValue()) {
                    filledFields++;
                }

                return Math.round((filledFields / totalFields) * 100);
            } else {
                // Online mode - Với phiếu bổ sung sau, chỉ yêu cầu các trường cơ bản
                const basicFields = ['ca', 'gioLamViec', 'soPhieu', 'thuTu', 'tln'];

                totalFields = basicFields.length;

                // Đếm số trường đã điền
                basicFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        if (field === 'soPhieu') {
                            if (element.value.trim() && element.value.trim() !== 'PC') {
                                filledFields++;
                            }
                        } else if (element.value.trim() && element.value.trim() !== '-- Thứ tự --') {
                            filledFields++;
                        }
                    }
                });

                // THÊM: Kiểm tra xả đôi và mã số cuộn (bắt buộc)
                const xaDoi = document.getElementById('xadoiSelect');
                if (xaDoi) {
                    totalFields++;
                    if (xaDoi.value) {
                        filledFields++;
                    }
                }

                // Kiểm tra số ID
                const nhapSoID = document.getElementById('nhapSoID');
                const inputSoID = document.getElementById('inputSoID');
                if (nhapSoID && inputSoID) {
                    totalFields++;
                    if (!nhapSoID.checked || (nhapSoID.checked && inputSoID.value.trim())) {
                        filledFields++;
                    }
                }

                // Kiểm tra mã số cuộn
                totalFields++;
                if (getMaSoCuonValue()) {
                    filledFields++;
                }

                // Tính phần trăm hoàn thành cho phiếu bổ sung sau
                return Math.round((filledFields / totalFields) * 100);
            }
        } else {
            // Xử lý như bình thường cho báo cáo GMC đầy đủ
            // THÊM: Kiểm tra offline mode cho báo cáo đầy đủ
            if (!navigator.onLine) {
                console.log("Offline mode - Báo cáo GMC đầy đủ với trường cơ bản");
                const offlineFullFields = [
                    'ca', 'gioLamViec', 'soPhieu', 'thuTu', 'tln'
                ];

                // Kiểm tra các trường cơ bản offline
                offlineFullFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        totalFields++;
                        if (field === 'soPhieu') {
                            if (element.value.trim() && element.value.trim() !== 'PC') {
                                filledFields++;
                            }
                        } else if (element.value.trim() && element.value.trim() !== '-- Thứ tự --') {
                            filledFields++;
                        }
                    }
                });

                // Các trường bắt buộc khác cho offline
                const xaDoi = document.getElementById('xadoiSelect');
                const nhapSoID = document.getElementById('nhapSoID');
                const inputSoID = document.getElementById('inputSoID');

                if (xaDoi) {
                    totalFields++;
                    if (xaDoi.value) {
                        filledFields++;
                    }
                }

                if (nhapSoID && inputSoID) {
                    totalFields++;
                    if (!nhapSoID.checked || (nhapSoID.checked && inputSoID.value.trim())) {
                        filledFields++;
                    }
                }

                totalFields++;
                if (getMaSoCuonValue()) {
                    filledFields++;
                }

                return Math.round((filledFields / totalFields) * 100);
            } else {
                // Online mode - Danh sách các trường bắt buộc ở phần bắt đầu
                const requiredFields = [
                    'ca', 'gioLamViec', 'soPhieu', 'thuTu', 'ws',
                    'maVatTu', 'khachhang', 'kho', 'dai'
                ];

                // Trường trọng lượng
                const trongLuong = document.getElementById('tln');

                // Kiểm tra trạng thái ID
                const nhapSoID = document.getElementById('nhapSoID');
                const inputSoID = document.getElementById('inputSoID');

                // Kiểm tra xả đôi
                const xaDoi = document.getElementById('xadoiSelect');

                // Mã số cuộn
                const maSoCuon = document.getElementById('maSoCuon');

                // Kiểm tra các trường bắt buộc
                requiredFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element) {
                        totalFields++;

                        // Đối với trường soPhieu, giá trị 'PC' mặc định không được tính là đã điền
                        if (field === 'soPhieu') {
                            if (element.value.trim() && element.value.trim() !== 'PC') {
                                filledFields++;
                            }
                        } else if (element.value.trim()) {
                            filledFields++;
                        }
                    }
                });

                // Kiểm tra trọng lượng
                if (trongLuong) {
                    totalFields++;
                    if (trongLuong.value.trim()) {
                        filledFields++;
                    }
                }

                // Kiểm tra mã số cuộn - Bắt buộc phải nhập
                if (maSoCuon) {
                    totalFields++;
                    if (getMaSoCuonValue()) {
                        filledFields++;
                    }
                }

                // Kiểm tra trường ID
                if (nhapSoID && inputSoID) {
                    totalFields++;
                    if (!nhapSoID.checked || (nhapSoID.checked && inputSoID.value.trim())) {
                        filledFields++;
                    }
                }

                // Kiểm tra xả đôi
                if (xaDoi) {
                    totalFields++;
                    if (xaDoi.value) {
                        filledFields++;
                    }
                }

                // Tính phần trăm hoàn thành
                return Math.round((filledFields / totalFields) * 100);
            }
        }
    }
}

// Hàm kiểm tra xem có phải là phiếu bổ sung sau không
function isPhieuBoSungSau() {
    // Điều kiện để xác định phiếu bổ sung sau:
    // 1. Có số phiếu và thứ tự
    // 2. Thiếu một số thông tin như số WS, mã giấy, khổ xén, dài xén

    const soPhieuElement = document.getElementById('soPhieu');
    const thuTuElement = document.getElementById('thuTu');
    const wsElement = document.getElementById('ws');
    const maVatTuElement = document.getElementById('maVatTu');

    // Kiểm tra có số phiếu và thứ tự không
    const hasSoPhieu = soPhieuElement && soPhieuElement.value && soPhieuElement.value !== 'PC';
    const hasThuTu = thuTuElement && thuTuElement.value && thuTuElement.value !== '-- Thứ tự --';

    // Kiểm tra thiếu các thông tin khác
    const missingWS = !wsElement || !wsElement.value;
    const missingMaVatTu = !maVatTuElement || !maVatTuElement.value;

    // Đây là phiếu bổ sung sau nếu có số phiếu + thứ tự nhưng thiếu ít nhất một thông tin quan trọng
    return (hasSoPhieu && hasThuTu) && (missingWS || missingMaVatTu);
}

//todo Tính tiến độ phần kết thúc báo cáo========================================================
function calculateEndProgress() {
    let filledFields = 0;
    let totalFields = 0;

    // Kiểm tra nếu đây là báo cáo dừng máy độc lập
    const isDungMayOnly = document.getElementById('btnYes')?.style.backgroundColor === 'rgb(208, 0, 0)' &&
        (!document.getElementById('soPhieu')?.value || document.getElementById('soPhieu')?.value === 'PC') &&
        (!document.getElementById('ws')?.value);

    if (isDungMayOnly) {
        // Nếu là báo cáo dừng máy độc lập, chỉ kiểm tra thông tin dừng máy
        const stopReason = document.getElementById('stopReason');
        const stopTimeInput = document.getElementById('stopTimeInput');
        const resumeTimeInput = document.getElementById('resumeTimeInput');

        totalFields = 3; // Lý do dừng máy, thời gian dừng, thời gian chạy lại

        if (stopReason && stopReason.value) filledFields++;
        if (stopTimeInput && stopTimeInput.value) filledFields++;
        if (resumeTimeInput && resumeTimeInput.value) filledFields++;

        // Tính phần trăm hoàn thành - trường hợp báo cáo dừng máy
        return Math.round((filledFields / totalFields) * 100);
    } else {
        // Danh sách các trường bắt buộc ở phần kết thúc (báo cáo GMC đầy đủ)
        const requiredFields = [
            'tongSoPallet', 'soTamCatDuoc', 'loi', 'dauCuon',
            'rachMop', 'pheLieuSanXuat', 'tlTra', 'suDungGiayTon',
            'chieuCaoPallet'
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
        const machineReport = document.getElementById('machineReport');
        const btnNo = document.getElementById('btnNo');
        const btnYes = document.getElementById('btnYes');

        // Nếu chọn "Không" dừng máy
        if (btnNo && btnNo.style.backgroundColor === 'rgb(74, 144, 226)') {
            filledFields++;
        }
        // Nếu chọn "Có" dừng máy và đã điền đầy đủ thông tin
        else if (btnYes && btnYes.style.backgroundColor === 'rgb(208, 0, 0)' &&
            machineReport && machineReport.style.display === 'block') {

            // Kiểm tra thông tin trong báo cáo dừng máy
            const isStopReportComplete = checkStopReportComplete();

            if (isStopReportComplete) {
                filledFields++;
            }
        }

        // Tính phần trăm hoàn thành
        return Math.round((filledFields / totalFields) * 100);
    }
}

//todo Kiểm tra tính đầy đủ của báo cáo dừng máy========================================================
function checkStopReportComplete() {
    const stopReason = document.getElementById('stopReason');
    const stopTimeInput = document.getElementById('stopTimeInput');
    const resumeTimeInput = document.getElementById('resumeTimeInput');

    // Kiểm tra nếu đã chọn lý do và điền thời gian
    if (stopReason && stopReason.value &&
        stopTimeInput && stopTimeInput.value &&
        resumeTimeInput && resumeTimeInput.value) {

        // Kiểm tra các lý do phụ (nếu có)
        const additionalReasons = document.querySelectorAll('.stop-reason-container');

        for (const reason of additionalReasons) {
            const reasonSelect = reason.querySelector('.stop-reason-select');
            const reasonStopTime = reason.querySelector('.stop-time-input');
            const reasonResumeTime = reason.querySelector('.resume-time-input');

            // Nếu có lý do nhưng không có thời gian
            if (reasonSelect && reasonSelect.value &&
                (!reasonStopTime.value || !reasonResumeTime.value)) {
                return false;
            }
        }

        return true;
    }

    return false;
}

//todo Cập nhật hiển thị tiến độ bắt đầu và nút bắt đầu========================================================
function updateStartProgressDisplay(progress) {
    const progressBar = document.querySelector('.progress-bar.bg-success');
    const progressText = document.querySelector('.progress + span');
    const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }

    if (progressText) {
        progressText.textContent = `${progress}%`;
    }

    // THÊM: Hiển thị thời gian bắt đầu nếu đã có
    const savedStartTime = document.body.getAttribute('data-start-time');
    if (savedStartTime) {
        const startTime = new Date(savedStartTime);
        updateStartTimeDisplay(startTime);
    }


    startButton.disabled = false;

    // Hiển thị nút bắt đầu khi tiến độ đạt 100% VÀ chưa bắt đầu
    if (startButton) {
        const hasStarted = document.body.hasAttribute('data-start-time');
        const shouldShowButton = (progress === 100) && !hasStarted;

        // Logic hiển thị nút
        if (shouldShowButton) {
            startButton.style.display = 'inline-block';
            startButton.innerHTML = 'Bắt Đầu';
        } else if (hasStarted) {
            startButton.style.display = 'none'; // Ẩn hoàn toàn khi đã bắt đầu
        } else {
            startButton.style.display = 'none';
        }
    }
}



//todo Cập nhật hiển thị tiến độ kết thúc và nút xác nhận========================================================
function updateEndProgressDisplay(progress) {
    const progressBar = document.querySelector('.progress-bar.bg-danger');
    const progressText = document.querySelector('.col-12 .progress + span');

    // SỬA: Dùng ID thay vì class để tránh xung đột
    const confirmButton = document.getElementById('confirmButton');

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
        console.log(`Đã cập nhật tiến độ: ${progress}%`);
    }

    if (progressText) {
        progressText.textContent = `${progress}%`;
    }

    // THAY ĐỔI: Sử dụng ID selector và force override CSS
    if (confirmButton) {
        console.log('Đã tìm thấy nút xác nhận bằng ID, đang kiểm tra điều kiện...');
        const shouldShowButton = checkConfirmButtonConditions();

        if (shouldShowButton) {
            // SỬA: Force override tất cả CSS có thể gây xung đột
            confirmButton.style.setProperty('display', 'inline-block', 'important');
            confirmButton.style.setProperty('visibility', 'visible', 'important');
            confirmButton.style.setProperty('opacity', '1', 'important');
            confirmButton.classList.add('show');
            confirmButton.disabled = false;
            confirmButton.style.cursor = 'pointer';

            console.log('✅ Nút xác nhận đã được HIỂN THỊ (force)');
            console.log('Style display sau khi set:', confirmButton.style.display);
            console.log('Computed style sau khi set:', window.getComputedStyle(confirmButton).display);

            // Debug thêm để kiểm tra
            setTimeout(() => {
                console.log('Kiểm tra lại sau 100ms:', {
                    style_display: confirmButton.style.display,
                    computed_display: window.getComputedStyle(confirmButton).display,
                    visible: confirmButton.offsetParent !== null
                });
            }, 100);

        } else {
            confirmButton.style.setProperty('display', 'none', 'important');
            confirmButton.style.setProperty('visibility', 'hidden', 'important');
            confirmButton.classList.remove('show');

            console.log('❌ Nút xác nhận đã được ẨN');
        }
    } else {
        console.error('❌ KHÔNG TÌM THẤY NÚT XÁC NHẬN BẰNG ID');
    }
}


// THÊM HÀM MỚI: Kiểm tra điều kiện hiển thị nút xác nhận
function checkConfirmButtonConditions() {
    const caElement = document.getElementById('ca');
    const gioLamViecElement = document.getElementById('gioLamViec');

    // Kiểm tra trạng thái dừng máy
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');

    const btnYesActive = btnYes && btnYes.classList.contains('active');
    const btnNoActive = btnNo && btnNo.classList.contains('active');
    const isDungMaySelected = btnYesActive || btnNoActive || (window.machineStopStatusSelected === true);

    // Danh sách các trường bắt buộc trong form kết thúc
    const requiredEndFields = [
        'tongSoPallet', 'soTamCatDuoc', 'loi', 'dauCuon',
        'tlTra', 'suDungGiayTon', 'rachMop', 'pheLieuSanXuat',
        'chieuCaoPallet'
    ];

    // Kiểm tra tất cả các trường bắt buộc trong form kết thúc
    let allEndFieldsFilled = true;
    for (const fieldId of requiredEndFields) {
        const element = document.getElementById(fieldId);
        if (!element || !element.value || element.value.trim() === '') {
            allEndFieldsFilled = false;
            break;
        }
    }

    // DEBUG: In ra trạng thái từng điều kiện
    console.log('=== KIỂM TRA ĐIỀU KIỆN NÚT XÁC NHẬN ===');
    console.log('Ca:', caElement?.value || 'CHƯA CHỌN');
    console.log('Giờ làm việc:', gioLamViecElement?.value || 'CHƯA CHỌN');
    console.log('btnYes active:', btnYesActive);
    console.log('btnNo active:', btnNoActive);
    console.log('Trạng thái dừng máy tổng hợp:', isDungMaySelected ? 'ĐÃ CHỌN' : 'CHƯA CHỌN');
    console.log('Tất cả trường form kết thúc đã điền:', allEndFieldsFilled ? 'ĐẦY ĐỦ' : 'THIẾU');

    // Kiểm tra tất cả điều kiện
    const hasRequiredFields = caElement && caElement.value &&
        gioLamViecElement && gioLamViecElement.value &&
        isDungMaySelected &&
        allEndFieldsFilled;

    console.log('Kết quả cuối cùng:', hasRequiredFields ? 'HIỆN NÚT' : 'ẨN NÚT');
    console.log('=====================================');

    return hasRequiredFields;
}

//todo Thiết lập sự kiện cho nút bắt đầu========================================================
function setupStartButtonEvent() {
    const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');

    if (startButton) {
        // Đảm bảo nút không bị disable ban đầu
        // startButton.disabled = false;

        // Force enable nút để tránh bị disable
        startButton.removeAttribute('disabled');
        startButton.style.pointerEvents = 'auto';
        startButton.style.opacity = '1';

        startButton.addEventListener('click', async function () {
            try {
                // Hiển thị loading
                this.disabled = true;
                this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang gửi...';

                // Ghi lại thời gian bắt đầu
                const now = new Date();
                document.body.setAttribute('data-start-time', now.toISOString());

                // Hiển thị thời gian trên UI
                const startTimeElement = document.getElementById('startTime');
                if (startTimeElement) {
                    startTimeElement.textContent = formatTime(now);
                }
                updateStartTimeDisplay(now);

                // Thu thập dữ liệu phần bắt đầu
                const startReportData = await collectStartReportData();

                if (!startReportData) {
                    throw new Error('Không thể thu thập dữ liệu báo cáo bắt đầu');
                }

                // Gửi dữ liệu phần bắt đầu lên server
                const result = await submitStartReport(startReportData);

                if (result && result.success) {
                    // Lưu ID báo cáo để dùng cho phần cập nhật sau
                    document.body.setAttribute('data-report-id', result.id);

                    // Lưu vào localStorage của máy
                    saveFormDataByMachine();

                    // ẨN NÚT SAU KHI BẤM
                    this.style.display = 'none';

                    console.log("Đã gửi báo cáo bắt đầu thành công với ID:", result.id);
                    showNotification("Đã bắt đầu lúc " + formatTime(now) + " - Báo cáo đã được tạo", "success");
                }


                // Lưu ID báo cáo để dùng cho phần cập nhật sau
document.body.setAttribute('data-report-id', result.id);

// THÊM: Lưu vào localStorage để đảm bảo không mất
localStorage.setItem('currentReportId', result.id);
localStorage.setItem('currentReportMachine', getCurrentMachineId() || 'unknown');

// Lưu vào localStorage của máy
saveFormDataByMachine();

            } catch (error) {
                console.error('Lỗi khi gửi báo cáo bắt đầu:', error);
                showNotification('Lỗi khi gửi báo cáo bắt đầu: ' + error.message, 'error');

                // Reset nút về trạng thái ban đầu
                this.disabled = false;
                this.innerHTML = 'Bắt Đầu';
            }
        });
    }
}


// THÊM HÀM MỚI: Cập nhật hiển thị thời gian bắt đầu trên thanh tiến độ
function updateStartTimeDisplay(startTime) {
    // Tìm phần tử hiển thị thời gian trên thanh tiến độ
    let timeDisplayElement = document.getElementById('progressStartTime');

    if (!timeDisplayElement) {
        // Tạo phần tử mới nếu chưa có
        timeDisplayElement = document.createElement('div');
        timeDisplayElement.id = 'progressStartTime';
        timeDisplayElement.className = 'text-success fw-bold mb-2';

        // Tìm vị trí để chèn (trước thanh tiến độ)
        const progressContainer = document.querySelector('.text-center.mt-5');
        const progressDiv = progressContainer?.querySelector('.d-flex.justify-content-between');

        if (progressDiv) {
            progressContainer.insertBefore(timeDisplayElement, progressDiv);
        }
    }

    // Cập nhật nội dung
    if (startTime) {
        timeDisplayElement.textContent = `Thời gian bắt đầu: ${formatTime(startTime)}`;
        timeDisplayElement.style.display = 'block';
    } else {
        // Ẩn nếu không có thời gian
        timeDisplayElement.style.display = 'none';
        timeDisplayElement.textContent = '';
    }
}

// THÊM HÀM MỚI: Ẩn thời gian bắt đầu
function hideStartTimeDisplay() {
    const timeDisplayElement = document.getElementById('progressStartTime');
    if (timeDisplayElement) {
        timeDisplayElement.style.display = 'none';
        timeDisplayElement.textContent = '';
    }
}




// THÊM HÀM MỚI: Hiển thị lại nút bắt đầu khi chỉnh sửa form
function showStartButtonOnFormChange() {
    const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');
    if (startButton && document.body.hasAttribute('data-start-time')) {
        // Chỉ hiển thị nút "Bắt đầu lại" khi có thay đổi form
        if (startButton.style.display === 'none') {
            startButton.style.display = 'inline-block';
            startButton.innerHTML = 'Bắt đầu lại';

            // Hiển thị lại thời gian bắt đầu hiện tại
            const savedStartTime = document.body.getAttribute('data-start-time');
            if (savedStartTime) {
                const startTime = new Date(savedStartTime);
                updateStartTimeDisplay(startTime);
            }

            console.log('Đã hiển thị nút bắt đầu lại do chỉnh sửa form');
        }
    }

    // THÊM: Đảm bảo nút không bị disable khi hiển thị lại
    startButton.disabled = false;
    startButton.removeAttribute('disabled');
    startButton.style.pointerEvents = 'auto';

}



// Biến toàn cục để ngăn gửi trùng lặp
let isSubmitting = false;

//todo Thiết lập sự kiện cho nút xác nhận (SỬA LẠI)========================================================
function setupConfirmButtonEvent() {
    // SỬA: Dùng ID thay vì class
    const confirmButton = document.getElementById('confirmButton');

    if (confirmButton) {
        console.log('Đã tìm thấy nút xác nhận bằng ID:', confirmButton);

        // KIỂM TRA NẾU ĐÃ THIẾT LẬP SỰ KIỆN THÌ DỪNG LẠI
        if (confirmButton.hasAttribute('data-event-setup')) {
            console.log('Nút xác nhận đã được thiết lập sự kiện trước đó - bỏ qua');
            return;
        }

        // ĐÁNH DẤU ĐÃ THIẾT LẬP SỰ KIỆN
        confirmButton.setAttribute('data-event-setup', 'true');
        confirmButton.onclick = null; // XÓA onclick cũ

        // XÓA TẤT CẢ SỰ KIỆN CŨ (NẾU CÓ)
        const newButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newButton, confirmButton);

        // ĐÁNH DẤU LẠI CHO NÚT MỚI
        newButton.id = 'confirmButton'; // Đảm bảo ID không mất
        newButton.setAttribute('data-event-setup', 'true');
        newButton.disabled = false;

        // THIẾT LẬP SỰ KIỆN DUY NHẤT
        newButton.addEventListener('click', handleConfirmClick);

        console.log('Đã thiết lập sự kiện click cho nút xác nhận bằng ID');
    } else {
        console.error('Không tìm thấy nút xác nhận với ID="confirmButton"');
    }
}


// 2. HÀM XỬ LÝ CLICK NÚT XÁC NHẬN - TÁCH RIÊNG ĐỂ QUẢN LÝ DỄ HÀN
async function handleConfirmClick(event) {
    console.log('=== CLICK NÚT XÁC NHẬN ===');
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const button = event.currentTarget;

    // KIỂM TRA TRẠNG THÁI ĐANG GỬI
    if (button.hasAttribute('data-submitting')) {
        console.log('Đang trong quá trình gửi, bỏ qua click này');
        return false;
    }

    // KIỂM TRA CÁC ĐIỀU KIỆN BẮT BUỘC
    const caElement = document.getElementById('ca');
    const mayElement = document.getElementById('may');
    const gioLamViecElement = document.getElementById('gioLamViec');

    if (!caElement || !caElement.value) {
        showNotification('Vui lòng chọn ca làm việc', 'error');
        caElement?.focus();
        return false;
    }



    if (!gioLamViecElement || !gioLamViecElement.value) {
        showNotification('Vui lòng chọn giờ làm việc', 'error');
        gioLamViecElement?.focus();
        return false;
    }

    // Kiểm tra trạng thái dừng máy
    if (!machineStopStatusSelected) {
        showNotification('Vui lòng chọn CÓ hoặc KHÔNG dừng máy trước khi xác nhận', 'warning');
        const dungMaySection = document.querySelector('.p-3.rounded.d-flex.align-items-center.justify-content-between');
        if (dungMaySection) {
            dungMaySection.style.boxShadow = '0 0 10px 5px red';
            dungMaySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                dungMaySection.style.boxShadow = '';
            }, 2000);
        }
        return false;
    }

    // ĐÁNH DẤU ĐANG GỬI (KHÔNG LOADING Ở NÚT)
    button.setAttribute('data-submitting', 'true');

    try {
        // Lưu thời gian kết thúc
        document.body.setAttribute('data-end-time', new Date().toISOString());

        // Gửi báo cáo
        const result = await submitReportWithLoading();

        if (result) {
            console.log('✓ Gửi báo cáo thành công');
        }
    } catch (error) {
        console.error('Lỗi khi gửi báo cáo:', error);
        showNotification('Lỗi khi gửi báo cáo: ' + error.message, 'error');

        // Reset trạng thái khi có lỗi
        button.removeAttribute('data-submitting');
    }

    return false;
}


//todo Định dạng thời gian hiển thị (HH:MM:SS)========================================================
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG GỬI DỮ LIỆU VÀ KẾT NỐI API
//  Mô tả: Xử lý việc gửi dữ liệu báo cáo lên server
//! =================================================================

//todo Thiết lập sự kiện khi thay đổi dữ liệu form========================================================
function setupFormChangeEvents() {
    // Lấy tất cả các input, select trong form PHẦN BẮT ĐẦU
    const startFormInputs = document.querySelectorAll('#nav-baocaogmc .border-success input, #nav-baocaogmc .border-success select');

    startFormInputs.forEach(input => {
        input.addEventListener('change', function () {
            // Cập nhật tiến độ khi có thay đổi
            updateProgress();

            // THÊM: Hiển thị lại nút bắt đầu nếu đã bắt đầu trước đó
            showStartButtonOnFormChange();

            // THÊM: Cập nhật hiển thị nút xác nhận
            updateProgress(); // Gọi lại để kiểm tra điều kiện nút xác nhận
        });

        // Sự kiện input cho một số trường đặc biệt
        if (['tln', 'soTamCatDuoc', 'dauCuon', 'rachMop', 'chieuCaoPallet'].includes(input.id)) {
            input.addEventListener('input', debounce(function () {
                calculateDerivedValues();
                showStartButtonOnFormChange();
            }, 300));
        }
    });

    // Thiết lập sự kiện khi chọn có số ID
    setupIDRadioEvents();

    // THÊM: Theo dõi thay đổi trạng thái dừng máy
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');

    if (btnYes) {
        btnYes.addEventListener('click', function () {
            setTimeout(updateProgress, 100); // Delay nhỏ để đảm bảo trạng thái đã cập nhật
        });
    }

    if (btnNo) {
        btnNo.addEventListener('click', function () {
            setTimeout(updateProgress, 100);
        });
    }

    // THÊM: Tự động ẩn nút bắt đầu sau khi bấm bắt đầu lại
    const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');
    if (startButton) {
        startButton.addEventListener('click', function () {
            setTimeout(() => {
                this.style.display = 'none';
            }, 100);
        });
    }



    // THÊM: Theo dõi thay đổi các trường form kết thúc
    const endFormFields = [
        'tongSoPallet', 'soTamCatDuoc', 'loi', 'dauCuon',
        'tlTra', 'suDungGiayTon', 'rachMop', 'pheLieuSanXuat',
        'chieuCaoPallet'
    ];

    endFormFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', function () {
                setTimeout(updateProgress, 100); // Delay nhỏ để đảm bảo giá trị đã cập nhật
            });
            element.addEventListener('change', function () {
                updateProgress();
            });
        }
    });


}


//todo Thiết lập sự kiện khi chọn có số ID========================================================
function setupIDRadioEvents() {
    document.querySelectorAll('input[name="chonSoID"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const input = document.getElementById('inputSoID');
            if (input) {
                input.disabled = this.value !== 'input';
                updateProgress(); // Cập nhật tiến độ khi thay đổi
            }
        });
    });
}

//todo Gửi dữ liệu báo cáo lên server========================================================

// Hàm submitReport mới với loading hoàn chỉnh
async function submitReportWithLoading() {
    let loadingShown = false;

    try {
        console.log('=== BẮT ĐẦU QUÁ TRÌNH GỬI BÁO CÁO GMC VỚI LOADING ===');

        // Hiển thị loading ngay lập tức
        showGMCLoading('Đang chuẩn bị dữ liệu...', 'Thu thập thông tin báo cáo');
        loadingShown = true;

        // Delay nhỏ để loading hiển thị mượt
        await new Promise(resolve => setTimeout(resolve, 500));

        // Cập nhật loading text
        updateGMCLoadingText('Đang kiểm tra dữ liệu...', 'Xác thực thông tin báo cáo');

        // Thu thập dữ liệu từ form
        const reportData = await collectReportData();

        if (!reportData) {
            hideGMCLoading();
            loadingShown = false;
            return null;
        }

        console.log("Dữ liệu báo cáo chuẩn bị gửi:", reportData);

        // Cập nhật loading text
        updateGMCLoadingText('Đang gửi báo cáo lên server...', 'Kết nối với hệ thống');

        // Delay nhỏ để người dùng thấy progress
        await new Promise(resolve => setTimeout(resolve, 300));

        // Xử lý gửi dữ liệu dựa trên loại báo cáo
        let endpoint, result;

        if (reportData.isOnlyStopReport) {
            // Báo cáo dừng máy độc lập - GIỮ NGUYÊN
            updateGMCLoadingText('Đang xử lý báo cáo dừng máy...', 'Lưu thông tin dừng máy');
            endpoint = '/api/bao-cao-gmc/dung-may/submit';

            if (!reportData.dungMay || reportData.dungMay.length === 0) {
                hideGMCLoading();
                loadingShown = false;
                showNotification('Không có dữ liệu dừng máy để gửi', 'error');
                return null;
            }

            const stopReportData = {
                ca: reportData.batDau?.ca || '',
                nguoi_thuc_hien: reportData.batDau?.nguoiThucHien || '',
                may: reportData.batDau?.may || '',
                so_phieu_cat_giay: reportData.batDau?.soPhieu || '',
                ly_do: reportData.dungMay[0]?.lyDo || '',
                ly_do_khac: reportData.dungMay[0]?.lyDoKhac || '',
                thoi_gian_dung: reportData.dungMay[0]?.thoiGianDung || '',
                thoi_gian_chay_lai: reportData.dungMay[0]?.thoiGianChayLai || '',
                thoi_gian_dung_may: reportData.dungMay[0]?.thoiGianDungMay || '',
                ghi_chu: reportData.dungMay[0]?.ghiChu || reportData.ketThuc?.ghiChu || ''
            };

            console.log("Dữ liệu báo cáo dừng máy đã chuẩn bị:", stopReportData);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportData),
            });

            if (!response.ok) {
                const responseText = await response.text();
                console.error('Server response:', responseText);
                throw new Error('Lỗi khi gửi báo cáo dừng máy');
            }

            result = await response.json();

            // Cập nhật loading text thành công
            updateGMCLoadingText('Hoàn tất báo cáo dừng máy!', 'Đang chuẩn bị reset form...');

            // Delay để người dùng thấy thông báo thành công
            await new Promise(resolve => setTimeout(resolve, 1000));

        } else {    
            // Báo cáo GMC đầy đủ
            updateGMCLoadingText('Đang xử lý báo cáo GMC...', 'Lưu thông tin sản xuất');
        
            // Kiểm tra xem đã có báo cáo bắt đầu chưa
            const existingReportId = document.body.getAttribute('data-report-id');
        
            if (existingReportId) {
                // Đã có báo cáo bắt đầu, chỉ cập nhật phần kết thúc
                console.log('Đang cập nhật phần kết thúc cho báo cáo ID:', existingReportId);
                
                endpoint = `/api/bao-cao-gmc/update-end/${existingReportId}`;
                
                // Chỉ gửi dữ liệu phần kết thúc
                const endOnlyData = {
                    ketThuc: reportData.ketThuc,
                    dungMay: reportData.dungMay
                };
                
                console.log('Dữ liệu kết thúc:', endOnlyData);
        
                // Kiểm tra kết nối mạng
                if (!navigator.onLine) {
                    console.log('🌐 Không có mạng - Chuẩn bị lưu cập nhật offline');
                    
                    const offlineReport = {
                        id: existingReportId,
                        type: 'update_end',
                        data: endOnlyData,
                        endpoint: endpoint,
                        timestamp: new Date().toISOString(),
                        machineId: getCurrentMachineId()
                    };
        
                    await saveToOfflineQueue(offlineReport);
        
                    updateGMCLoadingText('Không có mạng - Đã lưu vào bộ nhớ chờ!', 'Sẽ cập nhật khi có mạng');
                    await new Promise(resolve => setTimeout(resolve, 1500));
        
                    hideGMCLoading();
                    resetFormAndScrollToTop();
                    return { success: true, offline: true };
                }
        
                // GỬI REQUEST VỚI METHOD PUT
                const response = await fetch(endpoint, {
                    method: 'PUT',  // QUAN TRỌNG: Đây phải là PUT
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(endOnlyData),
                });
        
                if (!response.ok) {
                    const responseText = await response.text();
                    console.error('Server response:', responseText);
                    throw new Error(`HTTP ${response.status}: Không thể cập nhật báo cáo GMC`);
                }
        
                result = await response.json();
                console.log('✅ Cập nhật phần kết thúc thành công:', result);
        
            } else {
                // KHÔNG CÓ BÁO CÁO BẮT ĐẦU - HIỂN THỊ LỖI
    console.error('❌ Không tìm thấy báo cáo bắt đầu để cập nhật kết thúc');
    
    updateGMCLoadingText('Lỗi: Chưa có báo cáo bắt đầu!', 'Vui lòng bấm nút Bắt Đầu trước');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    hideGMCLoading();
    showNotification('Lỗi: Chưa có báo cáo bắt đầu! Vui lòng bấm nút Bắt Đầu trước khi Xác nhận', 'error');
    
    // Scroll đến nút Bắt Đầu
    const startButton = document.querySelector('.btn.btn-success.px-5.mt-3');
    if (startButton) {
        startButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        startButton.style.boxShadow = '0 0 10px 5px red';
        setTimeout(() => {
            startButton.style.boxShadow = '';
        }, 3000);
    }
    
    return null;
            }
        
            // Phần xử lý tracking sau khi gửi thành công...
            const soPhieu = reportData.batDau?.soPhieu;
            const thuTu = reportData.batDau?.thuTu;
        
            if (soPhieu && thuTu) {
                const needsTracking = (
                    (!reportData.batDau?.soWS || reportData.batDau.soWS === '') ||
                    (!reportData.batDau?.maGiay || reportData.batDau.maGiay === '') ||
                    (!reportData.ketThuc?.khoXen || reportData.ketThuc.khoXen === '') ||
                    (!reportData.ketThuc?.daiXen || reportData.ketThuc.daiXen === '') ||
                    (!reportData.ketThuc?.tlTraDuTinh || reportData.ketThuc.tlTraDuTinh === '' || reportData.ketThuc.tlTraDuTinh === '0')
                );
        
                if (needsTracking && result && result.id) {
                    if (typeof window.addPendingGMCUpdate === 'function') {
                        window.addPendingGMCUpdate(result.id, soPhieu, thuTu);
                        console.log(`Đã đánh dấu báo cáo GMC ID ${result.id} để theo dõi cập nhật sau`);
                    }
                }
            }
        
            // Cập nhật loading text thành công
            updateGMCLoadingText('Hoàn tất báo cáo GMC!', 'Đang chuẩn bị reset form...');
        
            // Delay để người dùng thấy thông báo thành công
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Ẩn loading
        hideGMCLoading();
        loadingShown = false;

        // Hiển thị thông báo thành công
        const successMessage = reportData.isOnlyStopReport ?
            'Đã gửi báo cáo dừng máy thành công!' :
            'Đã gửi báo cáo GMC thành công!';

        showNotification(successMessage, 'success');

        // Reset form và scroll về đầu trang
        setTimeout(() => {
            resetFormAndScrollToTop();
        }, 1000);

        return result;

    } catch (error) {
        console.error('Lỗi khi gửi báo cáo:', error);

        // Ẩn loading nếu đang hiển thị
        if (loadingShown) {
            hideGMCLoading();
        }

        showNotification('Lỗi khi gửi báo cáo: ' + error.message, 'error');
        throw error; // SỬA: Throw error để handleConfirmClick có thể catch và reset nút
    }


    // THÊM: Force reload danh sách báo cáo
    setTimeout(() => {
        forceReloadAllReportLists();
    }, 1000);


}


//todo Thu thập dữ liệu từ form========================================================
async function collectReportData() {
    // Kiểm tra button dừng máy
    if (!machineStopStatusSelected) {
        showNotification('Vui lòng chọn CÓ hoặc KHÔNG dừng máy trước khi xác nhận', 'warning');

        // Làm nổi bật phần dừng máy cho người dùng thấy
        const dungMaySection = document.querySelector('.p-3.rounded.d-flex.align-items-center.justify-content-between');
        if (dungMaySection) {
            dungMaySection.style.boxShadow = '0 0 10px 5px red';
            dungMaySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                dungMaySection.style.boxShadow = '';
            }, 2000);
        }
        return null;
    }

    // Kiểm tra ca làm việc và máy
    // Kiểm tra ca làm việc và máy
    const caElement = document.getElementById('ca');
    const gioLamViecElement = document.getElementById('gioLamViec');

    // THÊM: Lấy máy từ localStorage
    const machineId = getCurrentMachineId();
    if (!machineId) {
        showNotification('Vui lòng chọn máy', 'error');
        return null;
    }

    // Lấy tên máy từ URL params hoặc selectedMachine
    const urlParams = new URLSearchParams(window.location.search);
    const machineName = urlParams.get('machineName');
    let mayName = '';

    if (machineName) {
        mayName = machineName;
    } else {
        // Lấy từ selectedMachine trong localStorage
        const selectedMachine = localStorage.getItem('selectedMachine');
        if (selectedMachine) {
            try {
                const machine = JSON.parse(selectedMachine);
                mayName = machine.name || machine.id || '';
            } catch (e) {
                console.error('Lỗi parse selectedMachine:', e);
            }
        }
    }

    if (!mayName) {
        showNotification('Không thể xác định tên máy', 'error');
        return null;
    }



    if (!caElement || !caElement.value) {
        showNotification('Vui lòng chọn ca làm việc', 'error');
        if (caElement) caElement.focus();
        return null;
    }

    if (!gioLamViecElement || !gioLamViecElement.value) {
        showNotification('Vui lòng chọn giờ làm việc', 'error');
        if (gioLamViecElement) gioLamViecElement.focus();
        return null;
    }


    // THÊM: Kiểm tra các trường bắt buộc trong form kết thúc
    const requiredEndFields = [
        { id: 'tongSoPallet', name: 'Tổng số pallet' },
        { id: 'soTamCatDuoc', name: 'Số tấm cắt được' },
        { id: 'loi', name: 'Lõi (kg)' },
        { id: 'dauCuon', name: 'Đầu cuộn (kg)' },
        { id: 'tlTra', name: 'TL trả (kg)' },
        { id: 'suDungGiayTon', name: 'Sử dụng giấy tồn' },
        { id: 'rachMop', name: 'Rách móp (kg)' },
        { id: 'pheLieuSanXuat', name: 'Phế liệu sản xuất (kg)' },
        { id: 'chieuCaoPallet', name: 'Chiều cao pallet (cm)' }
    ];

    // Kiểm tra từng trường bắt buộc
    for (const field of requiredEndFields) {
        const element = document.getElementById(field.id);
        if (!element || !element.value || element.value.trim() === '') {
            showNotification(`Vui lòng nhập ${field.name}`, 'error');
            if (element) element.focus();
            return null;
        }

        // Kiểm tra giá trị số hợp lệ
        const numValue = parseFloat(element.value);
        if (isNaN(numValue) || numValue < 0) {
            showNotification(`${field.name} phải là số hợp lệ và không âm`, 'error');
            if (element) element.focus();
            return null;
        }
    }

    // Xử lý số phiếu - nếu chỉ có "PC" hoặc "PCG" mặc định thì coi như trống
    const soPhieuElement = document.getElementById('soPhieu');
    const soPhieuValue = soPhieuElement?.value || '';
    const finalSoPhieu = (soPhieuValue === 'PC' || soPhieuValue === 'PCG') ? '' : soPhieuValue;

    // ===== TÍNH SỐ LẦN CHÍNH XÁC CHO TẤT CẢ PHIẾU =====
    let soLan = 1;

    const existingSoLan = parseInt(soPhieuElement?.getAttribute('data-so-lan') || '0');

    if (existingSoLan > 0) {
        soLan = existingSoLan;
        console.log(`Sử dụng số lần đã tính: ${soLan}`);
    } else if (finalSoPhieu && finalSoPhieu !== '') {
        console.log(`Chưa có số lần cho phiếu ${finalSoPhieu}, tính ngay...`);
        soLan = await calculateSoLanForPhieu();
    } else {
        soLan = 1;
        console.log(`Không có số phiếu hợp lệ, sử dụng số lần mặc định: ${soLan}`);
    }

    // Lấy số cuộn từ data attribute của WS
    const wsElement = document.getElementById('ws');
    const soCuon = parseInt(wsElement?.getAttribute('data-so-cuon') || '1');

    // Kiểm tra xem có phải là báo cáo dừng máy độc lập không
    const isDungMayOnly = document.getElementById('btnYes')?.classList.contains('active') &&
        (!finalSoPhieu || finalSoPhieu === '') &&
        (!wsElement?.value || wsElement?.value === '');

    console.log("Phát hiện báo cáo dừng máy độc lập:", isDungMayOnly);

    // Tính toán lại giá trị dẫn xuất trước khi thu thập
    calculateDerivedValues();

    // ===== LẤY MÃ GIẤY VÀ XẢ ĐÔI =====
    const maVatTuElement = document.getElementById('maVatTu');
    const maGiay = maVatTuElement?.value || '';
    const xaDoi = parseInt(document.getElementById('xadoiSelect')?.value || '0');

    console.log('=== DEBUG COLLECT REPORT DATA ===');
    console.log('Mã giấy:', maGiay);
    console.log('Xả đôi:', xaDoi);

    // ===== LẤY ĐỊNH LƯỢNG CHÍNH XÁC =====
    let dinhLuong = '';

    if (maVatTuElement && maVatTuElement.hasAttribute('data-dinh-luong')) {
        dinhLuong = maVatTuElement.getAttribute('data-dinh-luong');
        console.log("Lấy định lượng từ data attribute:", dinhLuong);
    }

    if (!dinhLuong && maGiay) {
        const parts = maGiay.split('-');
        if (parts.length >= 4) {
            const eeee = parts[1];
            const dinhLuongNumber = parseInt(eeee, 10);
            if (!isNaN(dinhLuongNumber)) {
                dinhLuong = dinhLuongNumber.toString();
                console.log(`Tính định lượng từ mã giấy EEEE: ${eeee} -> ${dinhLuong}`);
            }
        }
    }

    if (!dinhLuong) {
        const dinhLuongElement = document.getElementById('dinhLuong');
        if (dinhLuongElement) {
            dinhLuong = dinhLuongElement.value || '';
            console.log("Lấy định lượng từ trường ẩn:", dinhLuong);
        }
    }

    // ===== TÍNH KHỔ GỐC (KHÔNG XẢ ĐÔI) =====
    let khoGoc = document.getElementById('kho')?.value || '';

    if (!khoGoc && maGiay) {
        const parts = maGiay.split('-');
        if (parts.length >= 4) {
            const ffff = parts[2];
            const khoNumber = parseInt(ffff, 10);
            if (!isNaN(khoNumber)) {
                khoGoc = khoNumber.toString();
                console.log(`Tính khổ gốc từ mã giấy FFFF: ${khoGoc}`);
            }
        }
    }

    // ===== TÍNH KHỔ CẮT THEO XẢ ĐÔI =====
    let khoCat = '';

    if (maGiay) {
        const parts = maGiay.split('-');
        if (parts.length >= 4) {
            const ffff = parts[2];
            const khoNumber = parseInt(ffff, 10);

            if (!isNaN(khoNumber)) {
                if (xaDoi === 0) {
                    khoCat = khoNumber.toString();
                } else if (xaDoi === 1) {
                    khoCat = Math.floor(khoNumber / 2).toString();
                } else {
                    khoCat = khoNumber.toString();
                }
                console.log(`Tính khổ cắt từ mã giấy: FFFF=${ffff}, xả đôi=${xaDoi}, khổ cắt=${khoCat}`);
            }
        }
    }

    if (!khoCat && khoGoc) {
        const khoNumber = parseFloat(khoGoc);
        if (!isNaN(khoNumber)) {
            if (xaDoi === 1) {
                khoCat = Math.floor(khoNumber / 2).toString();
            } else {
                khoCat = khoNumber.toString();
            }
            console.log(`Tính khổ cắt từ form: khổ gốc=${khoGoc}, xả đôi=${xaDoi}, khổ cắt=${khoCat}`);
        }
    }

    // ===== LẤY DÀI =====
    const dai = document.getElementById('dai')?.value || '';

    // ===== TÍNH TOÁN TL TRẢ DỰ TÍNH =====
    const trongLuongNhan = parseFloat(document.getElementById('tln')?.value || '0');
    const soTamCatDuoc = parseFloat(document.getElementById('soTamCatDuoc')?.value || '0');
    const dauCuon = parseFloat(document.getElementById('dauCuon')?.value || '0');
    const rachMop = parseFloat(document.getElementById('rachMop')?.value || '0');

    let tlTraDuTinhFinal = '';

    if (trongLuongNhan && soTamCatDuoc && dai && khoCat && dinhLuong && dauCuon !== undefined && rachMop !== undefined) {
        const daiNum = parseFloat(dai);
        const khoCatNum = parseFloat(khoCat);
        const dinhLuongNum = parseFloat(dinhLuong);

        const tamLuong = (soTamCatDuoc * daiNum * khoCatNum * dinhLuongNum) / 1000000000;
        const tlTraDuKienRaw = trongLuongNhan - tamLuong - dauCuon - rachMop;
        const tlTraDuKienRounded = customRound(tlTraDuKienRaw);

        tlTraDuTinhFinal = Number.isInteger(tlTraDuKienRounded) ?
            tlTraDuKienRounded.toFixed(1) :
            tlTraDuKienRounded.toFixed(1);

        console.log("=== TÍNH TOÁN CUỐI CÙNG TRONG COLLECT DATA ===");
        console.log(`Công thức: (${trongLuongNhan} - (${soTamCatDuoc} × ${daiNum} × ${khoCatNum} × ${dinhLuongNum} ÷ 1000000000) - ${dauCuon} - ${rachMop})`);
        console.log(`Kết quả cuối: ${tlTraDuTinhFinal}`);
    }

    // ===== TÍNH SỐ TẤM XÉN =====
    const khoXen = document.getElementById('khoXen')?.value || '';
    const daiXen = document.getElementById('daiXen')?.value || '';

    let soTamXen = '';
    if (khoGoc && khoXen && dai && daiXen && soTamCatDuoc) {
        const soTamXenCalculated = tinhSoTamXen(khoGoc, khoXen, dai, daiXen, soTamCatDuoc, xaDoi);
        soTamXen = soTamXenCalculated.toString();
        console.log("Tính số tấm xén:", soTamXenCalculated);
    }

    // ===== TÍNH SỐ TẤM THAM CHIẾU =====
    const chieuCaoPallet = parseFloat(document.getElementById('chieuCaoPallet')?.value || '0');
    let soTamThamChieuFinal = '';

    const doDay = parseFloat(maVatTuElement?.getAttribute('data-do-day') || '0');

    if (chieuCaoPallet && doDay && doDay > 0) {
        const soTamThamChieuRaw = (chieuCaoPallet * 10) / doDay;
        const soTamThamChieuRounded = customRound(soTamThamChieuRaw);
        soTamThamChieuFinal = Number.isInteger(soTamThamChieuRounded) ?
            soTamThamChieuRounded.toFixed(1) :
            soTamThamChieuRounded.toFixed(1);
        console.log("Tính số tấm tham chiếu:", soTamThamChieuRaw, "-> làm tròn thành:", soTamThamChieuFinal);
    } else {
        soTamThamChieuFinal = document.getElementById('soTamThamChieu')?.getAttribute('data-rounded-value') ||
            document.getElementById('soTamThamChieu')?.value || '';
    }

    // ===== TỰ ĐỘNG LẤY THÔNG TIN NGƯỜI DÙNG =====
    const currentUser = getCurrentUser();
    let nguoiThucHien = '';

    if (currentUser) {
        if (currentUser.fullname && currentUser.employee_id) {
            nguoiThucHien = `${currentUser.fullname} - ${currentUser.employee_id}`;
        } else if (currentUser.fullname) {
            nguoiThucHien = currentUser.fullname;
        } else if (currentUser.employee_id) {
            nguoiThucHien = currentUser.employee_id;
        } else {
            nguoiThucHien = currentUser.username || 'Unknown User';
        }
        console.log('✓ Tự động lấy người thực hiện:', nguoiThucHien);
    }

    // Thu thập dữ liệu phần bắt đầu báo cáo
    const startData = {
        ca: caElement?.value || '',
        gioLamViec: gioLamViecElement?.value || '',
        maCa: document.getElementById('maCa')?.value || '',
        nguoiThucHien: nguoiThucHien,
        may: mayName,
        soPhieu: finalSoPhieu,
        soLan: soLan,
        thuTu: document.getElementById('thuTu')?.value || '',
        soWS: wsElement?.value || '',
        khachHang: document.getElementById('khachhang')?.value || '',
        maGiay: maGiay,
        dinhLuong: dinhLuong,
        khoCat: khoCat,
        kho: khoGoc,
        dai: dai,
        soTo: document.getElementById('soto')?.value || '',
        maSoCuon: getMaSoCuonValue(),
        xaDoi: xaDoi.toString(),
        soID: document.getElementById('nhapSoID')?.checked ? document.getElementById('inputSoID')?.value : null,
        trongLuongNhan: document.getElementById('tln')?.value || '',
        thoiGianBatDau: document.body.getAttribute('data-start-time') || '',
        doDay: doDay.toString() || ''
    };

    // Thu thập dữ liệu phần kết thúc báo cáo
    const endData = {
        tongSoPallet: document.getElementById('tongSoPallet')?.value || '',
        soTamCatDuoc: document.getElementById('soTamCatDuoc')?.value || '',
        tlTraThucTe: document.getElementById('tlTra')?.value || '',
        loi: document.getElementById('loi')?.value || '',
        dauCuon: document.getElementById('dauCuon')?.value || '',
        rachMop: document.getElementById('rachMop')?.value || '',
        pheLieuSanXuat: document.getElementById('pheLieuSanXuat')?.value || '',
        ghiChu: document.getElementById('ghiChu')?.value || '',
        suDungGiayTon: document.getElementById('suDungGiayTon')?.value || '',
        chieuCaoPallet: document.getElementById('chieuCaoPallet')?.value || '',
        thoiGianChuyenDoiPallet: document.getElementById('thoiGianChuyenDoiPallet')?.value || '',
        thoiGianKhac: document.getElementById('thoiGianKhac')?.value || '',
        khoXen: document.getElementById('khoXen')?.value || '',
        daiXen: document.getElementById('daiXen')?.value || '',
        soTamXen: Math.round(soTamXen) || '',
        khoCatSai: document.getElementById('khoCatSai')?.value || '',
        daiCatSai: document.getElementById('daiCatSai')?.value || '',
        soTamCatSai: document.getElementById('soTamCatSai')?.value || '',
        giayQuanLot: document.getElementById('giayQuanLot')?.checked ? 'Có' : '',
        chuyenXen: document.getElementById('chuyenXen')?.checked ? 'Có' : '',
        thoiGianKetThuc: document.body.getAttribute('data-end-time') || new Date().toISOString(),
        dungMay: document.getElementById('btnYes')?.classList.contains('active') || false,
        tlTraDuTinh: tlTraDuTinhFinal,
        soTamThamChieu: soTamThamChieuFinal,
        soCuon: soCuon
    };

    // Thu thập dữ liệu báo cáo dừng máy
    const stopReports = [];
    const btnYes = document.getElementById('btnYes');
    const isDungMaySelected = btnYes && btnYes.classList.contains('active');

    if (isDungMaySelected || isDungMayOnly) {
        const stopBoxes = document.querySelectorAll('.stop-reason-box');

        stopBoxes.forEach(box => {
            const reasonValue = box.querySelector('.reason-value')?.value;
            const otherReason = box.querySelector('.other-reason-input')?.value || '';
            const stopTime = box.querySelector('.stop-time-input')?.value;
            const resumeTime = box.querySelector('.resume-time-input')?.value;
            const duration = box.querySelector('.duration-display')?.value || '';

            if (reasonValue && stopTime && resumeTime) {
                stopReports.push({
                    lyDo: reasonValue,
                    lyDoKhac: otherReason,
                    thoiGianDung: stopTime,
                    thoiGianChayLai: resumeTime,
                    thoiGianDungMay: duration,
                    ghiChu: endData.ghiChu
                });
            }
        });

        if (stopReports.length === 0 && endData.dungMay) {
            showNotification('Vui lòng thêm ít nhất một lý do dừng máy', 'warning');
            return null;
        }
    }

    // Kết hợp tất cả dữ liệu
    const reportData = {
        batDau: startData,
        ketThuc: endData,
        dungMay: (isDungMaySelected || isDungMayOnly) ? stopReports : null,
        nguoiDung: getCurrentUser(),
        isOnlyStopReport: isDungMayOnly
    };

    console.log("=== DỮ LIỆU CUỐI CÙNG GỬI LÊN SERVER ===");
    console.log("Dữ liệu báo cáo hoàn chỉnh:", reportData);
    console.log(`Đã thu thập ${stopReports.length} lý do dừng máy`);

    return reportData;
}

//todo Thu thập dữ liệu từ form bắt đầu========================================================
async function collectStartReportData() {
    try {
        console.log("Thu thập dữ liệu báo cáo bắt đầu...");

        // Kiểm tra các trường bắt buộc cho phần bắt đầu
        const caElement = document.getElementById('ca');
        const gioLamViecElement = document.getElementById('gioLamViec');

        if (!caElement || !caElement.value) {
            showNotification('Vui lòng chọn ca làm việc', 'error');
            return null;
        }

        if (!gioLamViecElement || !gioLamViecElement.value) {
            showNotification('Vui lòng chọn giờ làm việc', 'error');
            return null;
        }

        // Lấy máy từ localStorage
        const machineId = getCurrentMachineId();
        const urlParams = new URLSearchParams(window.location.search);
        const machineName = urlParams.get('machineName');
        let mayName = '';

        if (machineName) {
            mayName = machineName;
        } else {
            const selectedMachine = localStorage.getItem('selectedMachine');
            if (selectedMachine) {
                try {
                    const machine = JSON.parse(selectedMachine);
                    mayName = machine.name || machine.id || '';
                } catch (e) {
                    console.error('Lỗi parse selectedMachine:', e);
                }
            }
        }

        if (!mayName) {
            showNotification('Vui lòng chọn máy', 'error');
            return null;
        }

        // Thu thập thông tin người dùng
        const currentUser = getCurrentUser();
        let nguoiThucHien = '';

        if (currentUser) {
            if (currentUser.fullname && currentUser.employee_id) {
                nguoiThucHien = `${currentUser.fullname} - ${currentUser.employee_id}`;
            } else if (currentUser.fullname) {
                nguoiThucHien = currentUser.fullname;
            } else if (currentUser.employee_id) {
                nguoiThucHien = currentUser.employee_id;
            } else {
                nguoiThucHien = currentUser.username || 'Unknown User';
            }
        }

        // Xử lý số phiếu
        const soPhieuElement = document.getElementById('soPhieu');
        const soPhieuValue = soPhieuElement?.value || '';
        const finalSoPhieu = (soPhieuValue === 'PC' || soPhieuValue === 'PCG') ? '' : soPhieuValue;

        // Tính số lần
        let soLan = 1;
        if (finalSoPhieu && finalSoPhieu !== '') {
            soLan = await calculateSoLanForPhieu();
        }

        // Lấy số cuộn từ WS
        const wsElement = document.getElementById('ws');
        const soCuon = parseInt(wsElement?.getAttribute('data-so-cuon') || '1');

        // Thu thập dữ liệu phần bắt đầu
        const startData = {
            ca: caElement?.value || '',
            gioLamViec: gioLamViecElement?.value || '',
            maCa: document.getElementById('maCa')?.value || '',
            nguoiThucHien: nguoiThucHien,
            may: mayName,
            soPhieu: finalSoPhieu,
            soLan: soLan,
            thuTu: document.getElementById('thuTu')?.value || '',
            soWS: wsElement?.value || '',
            khachHang: document.getElementById('khachhang')?.value || '',
            maGiay: document.getElementById('maVatTu')?.value || '',
            dinhLuong: document.getElementById('maVatTu')?.getAttribute('data-dinh-luong') ||
                document.getElementById('dinhLuong')?.value || '',
            kho: document.getElementById('kho')?.value || '',
            dai: document.getElementById('dai')?.value || '',
            soTo: document.getElementById('soto')?.value || '',
            soTam: document.getElementById('soTam')?.value || '',
            maSoCuon: getMaSoCuonValue(),
            xaDoi: parseInt(document.getElementById('xadoiSelect')?.value || '0'),
            soID: document.getElementById('nhapSoID')?.checked ? document.getElementById('inputSoID')?.value : null,
            trongLuongNhan: document.getElementById('tln')?.value || '',
            thoiGianBatDau: document.body.getAttribute('data-start-time') || new Date().toISOString(),
            khoXen: document.getElementById('khoXen')?.value || '',
            daiXen: document.getElementById('daiXen')?.value || '',
            giayQuanLot: document.getElementById('giayQuanLot')?.checked || false,
            chuyenXen: document.getElementById('chuyenXen')?.checked || false,
            doDay: document.getElementById('maVatTu')?.getAttribute('data-do-day') || '',
            soCuon: soCuon
        };

        console.log("Dữ liệu báo cáo bắt đầu:", startData);
        return startData;

    } catch (error) {
        console.error('Lỗi khi thu thập dữ liệu báo cáo bắt đầu:', error);
        throw error;
    }
}



async function submitStartReport(startData) {
    try {
        console.log('Gửi báo cáo bắt đầu lên server...');

        // Kiểm tra kết nối mạng
        if (!navigator.onLine) {
            console.log('🌐 Offline mode - Lưu báo cáo bắt đầu vào bộ nhớ chờ');

            const offlineReport = {
                id: Date.now() + Math.random(),
                type: 'start_report',
                data: startData,
                endpoint: '/api/bao-cao-gmc/submit-start',
                timestamp: new Date().toISOString(),
                machineId: getCurrentMachineId()
            };

            await saveToOfflineQueue(offlineReport);

            showNotification('Không có mạng - Đã lưu báo cáo bắt đầu vào bộ nhớ chờ', 'warning');
            return { success: true, offline: true, id: offlineReport.id };
        }

        // Gửi yêu cầu lên server
        const response = await fetch('/api/bao-cao-gmc/submit-start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(startData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error('Lỗi khi gửi báo cáo bắt đầu: ' + errorText);
        }

        const result = await response.json();
        console.log('Kết quả gửi báo cáo bắt đầu:', result);

        return result;

    } catch (error) {
        console.error('Lỗi khi gửi báo cáo bắt đầu:', error);
        throw error;
    }
}







//todo Hàm thiết lập sự kiện trực tiếp cho nút xác nhận (SỬA LẠI)=================================
function setupManualConfirmButton() {
    // TÌM NÚT XÁC NHẬN
    const confirmButton = document.querySelector('.btn.btn-primary') ||
        document.querySelector('.row .col-12 .btn-primary') ||
        document.querySelector('.row:last-child .btn-primary');

    if (confirmButton) {
        console.log('Thiết lập thủ công cho nút xác nhận:', confirmButton);

        // KIỂM TRA NẾU ĐÃ THIẾT LẬP
        if (confirmButton.hasAttribute('data-manual-setup')) {
            console.log('Nút xác nhận đã được thiết lập thủ công trước đó');
            return;
        }

        // ĐÁNH DẤU ĐÃ THIẾT LẬP
        confirmButton.setAttribute('data-manual-setup', 'true');
        confirmButton.disabled = false;

        // GỮI SỰ KIỆN ONCLICK CŨ (NẾU CÓ)
        confirmButton.onclick = null;

        // THIẾT LẬP SỰ KIỆN MỚI
        confirmButton.addEventListener('click', handleConfirmClick);

        console.log('Đã thiết lập sự kiện onclick thủ công');
    } else {
        console.error('Không tìm thấy nút xác nhận - thiết lập thủ công');
    }
}



//todo Hàm kiểm tra trạng thái các nút trong trang=================================
function checkButtonsStatus() {
    console.log('Kiểm tra trạng thái các nút...');

    // Tìm tất cả các nút trong phần kết thúc báo cáo
    const endReportSection = document.querySelector('.border.border-danger.rounded-top');

    if (endReportSection) {
        const buttons = endReportSection.querySelectorAll('button');
        console.log(`Tìm thấy ${buttons.length} nút trong phần kết thúc báo cáo`);

        // Kiểm tra từng nút
        buttons.forEach((btn, index) => {
            console.log(`Nút ${index}:`, {
                text: btn.textContent.trim(),
                disabled: btn.disabled,
                visible: btn.offsetParent !== null,
                classes: btn.className,
                id: btn.id,
                hasEventSetup: btn.hasAttribute('data-event-setup') || btn.hasAttribute('data-manual-setup')
            });

            // Nếu là nút Xác nhận và chưa có sự kiện
            if ((btn.textContent.trim() === 'Xác nhận' || btn.className.includes('btn-primary')) &&
                !btn.hasAttribute('data-event-setup') && !btn.hasAttribute('data-manual-setup')) {

                console.log('Tìm thấy nút Xác nhận chưa có sự kiện - thêm sự kiện');

                // Đảm bảo nút không bị vô hiệu hóa
                btn.disabled = false;

                // ĐÁNH DẤU VÀ THÊM SỰ KIỆN
                btn.setAttribute('data-event-setup', 'true');
                btn.addEventListener('click', handleConfirmClick);
            }
        });
    } else {
        console.error('Không tìm thấy phần kết thúc báo cáo');
    }
}


//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG QUẢN LÝ DANH SÁCH BÁO CÁO GMC
//  Mô tả: Hiển thị, phân trang, lọc danh sách báo cáo GMC
//! =================================================================

// Biến toàn cục để quản lý trạng thái của danh sách
let reportList = {
    data: [], // Dữ liệu gốc của toàn bộ danh sách
    filteredData: [], // Dữ liệu sau khi lọc
    currentPage: 1, // Trang hiện tại
    itemsPerPage: 10, // Số mục trên mỗi trang
    totalPages: 1 // Tổng số trang
};

//todo Thiết lập sự kiện cho tab danh sách báo cáo==================================================
function setupGMCEvents() {
    // Thêm event listener cho tab danh sách báo cáo
    document.getElementById('nav-danhsachgmc-tab').addEventListener('click', function () {
        // Tải danh sách báo cáo khi chuyển tab
        loadReportList();
    });

    // Thiết lập sự kiện cho tab dừng máy
    document.getElementById('nav-dungmaygmc-tab').addEventListener('click', function () {
        // Tải danh sách báo cáo dừng máy khi chuyển tab
        loadMachineStopReportList();
    });

    // Thiết lập bộ lọc ngày
    setupDateFilter();

    // Thêm event listener cho nút tìm kiếm
    const searchButton = document.getElementById('btnSearch');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            filterReportList();
        });
    }

    // Thêm event listener cho input tìm kiếm (tìm kiếm realtime)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function () {
            filterReportList();
        }, 500)); // Debounce 500ms để tránh tìm kiếm quá nhiều lần
    }

    // Thêm event listener cho dropdown số mục trên trang
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', function () {
            reportList.itemsPerPage = parseInt(this.value);
            reportList.currentPage = 1; // Reset về trang đầu tiên
            renderReportList();
        });
    }

    // Thêm event listener cho bộ lọc máy
    const mayFilter = document.getElementById('mayFilter');
    if (mayFilter) {
        mayFilter.addEventListener('change', function () {
            console.log('Bộ lọc máy thay đổi:', this.value);
            filterReportList();
        });
    }
    // Thêm event listener cho các nút phân trang
    setupPagination();

    // ===== THÊM LẠI: Event listener cho nút cố định cột =====
    const fixColumnsButton = document.getElementById('btnFixColumns');
    if (fixColumnsButton) {
        fixColumnsButton.addEventListener('click', function () {
            toggleFixedColumns();
        });
    }

    // ===== THÊM: Event listener cho nút xuất Excel =====
    const exportExcelButton = document.getElementById('btnExportExcel');
    if (exportExcelButton) {
        exportExcelButton.addEventListener('click', function () {
            exportToExcel();
        });
    }
}



// Biến theo dõi trạng thái cố định cột
let isColumnsFixed = false;
let selectedFixedColumns = [];

// Hàm toggle cố định cột
async function toggleFixedColumns() {
    const table = document.querySelector('#nav-danhsachgmc .table-responsive table');
    const tableContainer = document.querySelector('#nav-danhsachgmc .table-responsive');
    const fixButton = document.getElementById('btnFixColumns');

    if (!table || !tableContainer || !fixButton) {
        console.error('Không tìm thấy bảng hoặc nút cố định cột');
        return;
    }

    if (!isColumnsFixed) {
        // === CỐ ĐỊNH CỘT ===
        const headers = table.querySelectorAll('thead th');
const rows = table.querySelectorAll('tbody tr');

// Hiển thị modal chọn cột cần cố định
const selectedColumns = await showColumnSelectionModal(headers);
if (!selectedColumns || selectedColumns.length === 0) {
    return; // Người dùng hủy chọn
}

        // Tính toán vị trí left cho từng cột
        let leftPositions = {};
let currentLeft = 0;

selectedColumns.forEach(colIndex => {
    leftPositions[colIndex] = currentLeft;
    currentLeft += headers[colIndex].offsetWidth;
});

        // Cố định header cho các cột được chọn
selectedColumns.forEach(colIndex => {
    const header = headers[colIndex];
    if (!header) return;

    const originalBgColor = header.style.backgroundColor ||
        window.getComputedStyle(header).backgroundColor;

    header.style.position = 'sticky';
    header.style.left = leftPositions[colIndex] + 'px';
    header.style.backgroundColor = 'rgb(0, 138, 176)';
    header.style.color = 'rgb(255, 255, 255)';
    header.style.zIndex = '10';
    header.style.boxShadow = '2px 0 5px rgba(0,0,0,0.1)';
    header.setAttribute('data-original-bg', originalBgColor);
    header.setAttribute('data-fixed-column', 'true');
});

        // Cố định các ô trong body cho các cột được chọn
// Cố định các ô trong body cho các cột được chọn
rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('td');
    
    selectedColumns.forEach(colIndex => {
        const cell = cells[colIndex];
        if (!cell) return;

        cell.style.position = 'sticky';
        cell.style.left = leftPositions[colIndex] + 'px';
        cell.style.zIndex = '9';
        cell.style.boxShadow = '2px 0 5px rgba(0,0,0,0.1)';
        
        // Tự tạo lại màu xen kẻ cho sticky column
        // cell.style.backgroundColor = rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa';
        
        cell.setAttribute('data-fixed-column', 'true');
    });
});

        // Cập nhật giao diện nút
        fixButton.innerHTML = '<i class="fas fa-unlock me-1"></i> Bỏ cố định cột';
        fixButton.classList.remove('btn-success');
        fixButton.classList.add('btn-warning');

        isColumnsFixed = true;

            // Lưu trạng thái các cột đã chọn
selectedFixedColumns = selectedColumns;

    } else {
        // === BỎ CỐ ĐỊNH CỘT ===
        const headers = table.querySelectorAll('thead th');
        const rows = table.querySelectorAll('tbody tr');

        // Khôi phục header - CHỈ XÓA STYLE CỐ ĐỊNH
        headers.forEach(header => {
            // Lấy màu nền gốc từ data attribute
            const originalBgColor = header.getAttribute('data-original-bg');

            // Xóa các style cố định
            header.style.position = '';
            header.style.left = '';
            header.style.zIndex = '';
            header.style.boxShadow = '';

            // Khôi phục màu nền gốc hoặc xóa nếu không có
            if (originalBgColor && originalBgColor !== 'rgba(0, 0, 0, 0)' && originalBgColor !== 'transparent') {
                header.style.backgroundColor = originalBgColor;
            } else {
                header.style.backgroundColor = '';
            }

            // Xóa màu chữ cố định - để về màu mặc định
            header.style.color = '';

            // Xóa data attribute
            header.removeAttribute('data-original-bg');
        });

        // Khôi phục các ô trong body - CHỈ XÓA STYLE CỐ ĐỊNH ĐÃ THÊM
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach(cell => {
                // CHỈ XÓA CÁC STYLE CỐ ĐỊNH ĐÃ THÊM
                cell.style.position = '';
                cell.style.left = '';
                cell.style.zIndex = '';
                cell.style.boxShadow = '';
                cell.style.backgroundColor = '';

                // KHÔNG CẦN KHÔI PHỤC GÌ KHÁC VÌ KHÔNG THAY ĐỔI GÌ KHÁC
                // Chỉ xóa data attributes để dọn dẹp
                cell.removeAttribute('data-original-bg');
                cell.removeAttribute('data-original-color');
                cell.removeAttribute('data-original-border');
                cell.removeAttribute('data-original-border-top');
                cell.removeAttribute('data-original-border-bottom');
                cell.removeAttribute('data-original-border-left');
                cell.removeAttribute('data-original-border-right');
            });
        });

        // Cập nhật giao diện nút
        fixButton.innerHTML = '<i class="fas fa-thumbtack me-1"></i> Cố định cột';
        fixButton.classList.remove('btn-warning');
        fixButton.classList.add('btn-success');

        isColumnsFixed = false;
    }




}



// Hiển thị modal chọn cột cần cố định
async function showColumnSelectionModal(headers) {
    return new Promise((resolve) => {
        // Tạo modal
        const modalHTML = `
        <div class="modal fade" id="columnSelectionModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Chọn cột cần cố định</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
    <div class="mb-3">
    <div class="form-check">
        <input class="form-check-input" type="checkbox" id="selectAllColumns">
        <label class="form-check-label fw-bold" for="selectAllColumns">
            <i class="fas fa-check-double me-1"></i> Chọn tất cả
        </label>
    </div>
    <div class="mt-2">
        <button type="button" class="btn btn-sm btn-outline-primary" id="selectImportantColumns">
            <i class="fas fa-star me-1"></i> Chọn cột quan trọng
        </button>
    <hr>
</div>
    <div class="row">
                            ${Array.from(headers).map((header, index) => `
                                <div class="col-md-6 mb-2">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" 
                                               id="col_${index}" value="${index}">
                                        <label class="form-check-label" for="col_${index}">
                                            ${header.textContent.trim()}
                                        </label>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                        <button type="button" class="btn btn-primary" id="confirmSelection">Xác nhận</button>
                    </div>
                </div>
            </div>
        </div>`;

        // Xóa modal cũ nếu có
        const existingModal = document.getElementById('columnSelectionModal');
        if (existingModal) existingModal.remove();

        // Thêm modal mới
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = new bootstrap.Modal(document.getElementById('columnSelectionModal'));
modal.show();

// Xử lý sự kiện "Chọn tất cả"
const selectAllCheckbox = document.getElementById('selectAllColumns');
const columnCheckboxes = document.querySelectorAll('#columnSelectionModal input[type="checkbox"]:not(#selectAllColumns)');

selectAllCheckbox.addEventListener('change', function() {
    columnCheckboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
    });
});

// Xử lý sự kiện khi click vào từng checkbox cột
columnCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        // Kiểm tra nếu tất cả các cột đã được chọn
        const allChecked = Array.from(columnCheckboxes).every(cb => cb.checked);
        const noneChecked = Array.from(columnCheckboxes).every(cb => !cb.checked);
        
        if (allChecked) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else if (noneChecked) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true; // Hiển thị trạng thái một phần
        }
    });
});


// Xử lý nút "Chọn cột quan trọng"
document.getElementById('selectImportantColumns').addEventListener('click', function() {
    // Bỏ chọn tất cả trước
    columnCheckboxes.forEach(checkbox => checkbox.checked = false);
    
    // Chọn các cột quan trọng (STT, Ngày, Ca, Máy, Số Phiếu CG, Số WS)
    const importantColumns = [3,6,7,8,9,11]; // Index của các cột quan trọng
    importantColumns.forEach(index => {
        const checkbox = document.getElementById(`col_${index}`);
        if (checkbox) checkbox.checked = true;
    });
    
    // Cập nhật trạng thái checkbox "Chọn tất cả"
    const checkedCount = Array.from(columnCheckboxes).filter(cb => cb.checked).length;
    if (checkedCount === columnCheckboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
});

// Xử lý sự kiện xác nhận
document.getElementById('confirmSelection').onclick = function() {
            const selectedColumns = [];
            const checkboxes = document.querySelectorAll('#columnSelectionModal input[type="checkbox"]:checked:not(#selectAllColumns)');
            
            checkboxes.forEach(checkbox => {
                selectedColumns.push(parseInt(checkbox.value));
            });

            modal.hide();
            setTimeout(() => {
                document.getElementById('columnSelectionModal').remove();
                resolve(selectedColumns);
            }, 300);
        };

        // Xử lý sự kiện hủy
        document.getElementById('columnSelectionModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
            resolve(null);
        });
    });
}




// THÊM HÀM HỖ TRỢ: Khôi phục màu chữ đặc biệt sau khi render lại bảng
function restoreSpecialTextColors() {
    // Khôi phục màu xanh cho thời gian bắt đầu (cột 18 - TG BẮT ĐẦU)
    const startTimeCells = document.querySelectorAll('#nav-danhsachgmc tbody tr td:nth-child(20)');
    startTimeCells.forEach(cell => {
        if (cell.textContent.trim()) {
            cell.style.color = 'green';
            cell.style.fontWeight = 'bold';
        }
    });

    // Khôi phục màu đỏ cho thời gian kết thúc (cột 19 - TG Kết Thúc)
    const endTimeCells = document.querySelectorAll('#nav-danhsachgmc tbody tr td:nth-child(21)');
    endTimeCells.forEach(cell => {
        if (cell.textContent.trim()) {
            cell.style.color = 'red';
            cell.style.fontWeight = 'bold';
        }
    });
}



//todo Tải danh sách báo cáo GMC từ server=============================================================
async function loadReportList() {
    console.log('🔄 loadReportList() được gọi - đang tải danh sách báo cáo GMC...');
    try {
        // Hiển thị trạng thái đang tải
        showLoadingInTable(true);

        // Gọi API để lấy danh sách báo cáo với cache bust
        const cacheBustUrl = '/api/bao-cao-gmc/list?exclude_stop_only=true&_=' + Date.now();
        const response = await fetch(cacheBustUrl, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (!response.ok) {
            throw new Error('Không thể tải danh sách báo cáo GMC');
        }

        const data = await response.json();
        console.log('Đã tải danh sách báo cáo GMC:', data.length, 'bản ghi');

        // Debug log chi tiết
        console.log('📊 Chi tiết danh sách báo cáo GMC:');
        console.log('- Tổng số bản ghi:', data.length);
        if (data.length > 0) {
            console.log('- 3 bản ghi mới nhất:', data.slice(0, 3).map(r => ({
                id: r.id,
                stt: r.stt,
                may: r.may,
                created_at: r.created_at
            })));
        }

        // Kiểm tra xem có báo cáo nào từ offline queue không
        try {
            const offlineTrackingIds = JSON.parse(localStorage.getItem('processedOfflineIds') || '[]');
            if (offlineTrackingIds.length > 0) {
                console.log('🔍 Kiểm tra báo cáo offline đã được thêm:');
                offlineTrackingIds.forEach(trackingId => {
                    const found = data.find(r => r.id === trackingId);
                    console.log(`- Tracking ID ${trackingId}: ${found ? 'TÌM THẤY ✅' : 'KHÔNG TÌM THẤY ❌'}`);
                });
            }
        } catch (trackingError) {
            console.warn('Lỗi khi kiểm tra tracking IDs:', trackingError);
        }



        // Debug một số bản ghi đầu tiên
        if (data.length > 0) {
            console.log('Mẫu dữ liệu:', data.slice(0, 3));
        }

        // Lưu dữ liệu vào biến toàn cục
        reportList.data = data;
        reportList.filteredData = [...data]; // Sao chép dữ liệu để sử dụng cho lọc

        // Render danh sách báo cáo
        renderReportList();

        // Hiển thị thông báo thành công
        showNotification(`Đã tải ${data.length} bản ghi báo cáo GMC`, 'success');

    } catch (error) {
        console.error('Lỗi khi tải danh sách báo cáo GMC:', error);
        showNotification('Lỗi khi tải danh sách báo cáo GMC: ' + error.message, 'error');
    } finally {
        // Ẩn trạng thái đang tải
        showLoadingInTable(false);
    }
}

//todo Hiển thị danh sách báo cáo với phân trang=======================================================
function renderReportList() {
    const tableBody = document.getElementById('reportTableBody');
    const pageInfo = document.getElementById('pageInfo');
    const totalItems = document.getElementById('totalItems');

    if (!tableBody || !pageInfo || !totalItems) {
        console.error('Không tìm thấy các phần tử cần thiết để hiển thị danh sách');
        return;
    }

    // Xóa nội dung bảng hiện tại
    tableBody.innerHTML = '';

    // Tính toán phân trang
    const totalRecords = reportList.filteredData.length;
    reportList.totalPages = Math.ceil(totalRecords / reportList.itemsPerPage);

    // Đảm bảo trang hiện tại không vượt quá tổng số trang
    if (reportList.currentPage > reportList.totalPages) {
        reportList.currentPage = Math.max(1, reportList.totalPages);
    }

    // Tính toán vị trí bắt đầu và kết thúc
    const startIndex = (reportList.currentPage - 1) * reportList.itemsPerPage;
    const endIndex = Math.min(startIndex + reportList.itemsPerPage, totalRecords);

    // Lấy dữ liệu cho trang hiện tại
    const currentPageData = reportList.filteredData.slice(startIndex, endIndex);

    // Hiển thị thông tin phân trang
    pageInfo.textContent = `Hiển thị ${startIndex + 1}-${endIndex} của ${totalRecords}`;
    totalItems.textContent = `Tổng số: ${totalRecords} bản ghi`;

    // Kiểm tra nếu không có dữ liệu
    if (currentPageData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="47" class="text-center">Không có dữ liệu báo cáo GMC</td>
            </tr>
        `;
        // Cập nhật UI phân trang
        updatePaginationUI();
        return;
    }

    // Tạo các hàng dữ liệu
    currentPageData.forEach((report, index) => {
        const row = document.createElement('tr');
        row.classList.add('table-row');
        row.setAttribute('data-id', report.id);

        // Hàm để hiển thị giá trị an toàn (tránh undefined/null)
        const safeValue = (value) => {
            return value !== undefined && value !== null ? value : '';
        };

        // Hàm định dạng thời gian từ ISO string sang format HH:MM:SS DD/MM/YYYY
        const formatDateTime = (isoString) => {
            if (!isoString) return '';

            try {
                const date = new Date(isoString);
                if (isNaN(date.getTime())) return isoString;

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
            } catch (e) {
                return isoString;
            }
        };

        // SỬA: Hàm định dạng ngày thành DD/MM/YYYY
        const formatDateOnly = (dateStr) => {
            if (!dateStr) return '';

            // Nếu đã ở dạng DD/MM/YYYY thì giữ nguyên
            if (dateStr.includes('/')) {
                return dateStr;
            }

            // Nếu là ISO string, chuyển đổi
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return dateStr;

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();

                return `${day}/${month}/${year}`;
            } catch (e) {
                return dateStr;
            }
        };

        // Định dạng giá trị ca
        const formatCa = (caValue) => {
            if (caValue === '0') return 'Ca A';
            if (caValue === '1') return 'Ca B';
            if (caValue === '2') return 'Ca HC';
            return caValue;
        };

        // THÊM HÀM MỚI: Định dạng giờ làm việc
        const formatGioLamViec = (gioValue) => {
            const mapping = {
                '0': '6H - 14H',
                '1': '14H - 22H',
                '2': '22H - 6H',
                '3': '10H - 22H',
                '4': '6H - 18H',
                '5': '18H - 6H',
                '6': '7H - 16H',
                '7': '7H - 15H',
                '8': '7H - 17H',
                '9': '8H - 17H'
            };
            return mapping[gioValue] || gioValue;
        };

        // Nội dung HTML cho hàng - SỬA: sử dụng formatDateOnly cho cột ngày
        row.innerHTML = `
        <td>
            <button class="btn btn-sm btn-primary view-report" data-id="${report.id}">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-report" data-id="${report.id}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
        <td>${safeValue(report.stt)}</td>
        <td>${formatDateOnly(safeValue(report.ngay))}</td>
        <td>${formatCa(safeValue(report.ca))}</td>
        <td>${safeValue(report.nguoi_thuc_hien)}</td>
        <td>${formatDateOnly(safeValue(report.ngay_phu))}</td>
        <td>${safeValue(report.may)}</td>
        <td>${formatGioLamViec(safeValue(report.gio_lam_viec))}</td>
        <td>${safeValue(report.ma_ca)}</td>
        <td>${safeValue(report.so_phieu_cat_giay)}</td>
            <td>${safeValue(report.so_lan_chay)}</td>
            <td>${safeValue(report.so_ws)}</td>
            <td>${safeValue(report.khach_hang)}</td>
            <td>${safeValue(report.ma_giay)}</td>
            <td>${safeValue(report.dinh_luong)}</td>
            <td>${formatNumberUS(safeValue(report.so_tam))}</td>
            <td>${safeValue(report.kho_cat)}</td>
            <td style="font-size: 14px;">${safeValue(report.ma_so_cuon)}</td>
            <td>${formatNumberUS(safeValue(report.trong_luong_nhan))}</td>
            <td style="color: green; font-weight: bold;">${formatDateTime(safeValue(report.thoi_gian_bat_dau))}</td>
            <td style="color: red; font-weight: bold;">${formatDateTime(safeValue(report.thoi_gian_ket_thuc))}</td>
            <td>${safeValue(report.kho_mm)}</td>
            <td>${safeValue(report.dai_mm)}</td>
            <td>${formatNumberUS(safeValue(report.tong_so_pallet))}</td>
            <td>${formatNumberUS(safeValue(report.so_tam_cat_duoc))}</td>
            <td>${formatNumberUS(safeValue(report.tl_tra_thuc_te))}</td>
            <td>${formatNumberUS(safeValue(report.tl_tra_du_tinh))}</td>
            <td>${safeValue(report.loi_kg)}</td>
            <td>${safeValue(report.dau_cuon_kg)}</td>
            <td>${safeValue(report.rach_mop_kg)}</td>
            <td>${safeValue(report.phe_lieu_san_xuat_kg)}</td>
            <td>${safeValue(report.so_cuon)}</td>
            <td>${safeValue(report.ghi_chu)}</td>
            <td>${safeValue(report.thu_tu_cuon)}</td>
            <td>${safeValue(report.xa_doi)}</td>
            <td>${safeValue(report.so_id)}</td>
            <td>${safeValue(report.kho_xen)}</td>
            <td>${safeValue(report.dai_xen)}</td>
            <td>${formatNumberUS(safeValue(report.so_tam_xen))}</td>
            <td>${safeValue(report.su_dung_giay_ton_tam)}</td>
            <td>${formatNumberUS(safeValue(report.so_to_pallet))}</td>
            <td>${safeValue(report.kho_cat_sai_mm)}</td>
            <td>${safeValue(report.dai_cat_sai_mm)}</td>
            <td>${safeValue(report.so_tam_cat_sai)}</td>
            <td>${safeValue(report.giay_quan_lot)}</td>
            <td>${safeValue(report.chuyen_xen)}</td>
            <td>${formatNumberUS(safeValue(report.chieu_cao_pallet))}</td>
            <td>${formatNumberUS(safeValue(report.so_tam_tham_chieu))}</td>
            <td>${safeValue(report.thoi_gian_chuyen_doi_pallet)}</td>
            <td>${safeValue(report.thoi_gian_khac)}</td>
        `;

        tableBody.appendChild(row);
    });

    // Thêm sự kiện cho các nút thao tác
    addActionButtonsEvents();

    // Cập nhật UI phân trang
    updatePaginationUI();

    // Khôi phục màu chữ đặc biệt sau khi render
    setTimeout(() => {
        restoreSpecialTextColors();

        // Nếu đang ở trạng thái cố định cột, áp dụng lại
        if (isColumnsFixed) {
            // Tạm thời đặt thành false để hàm toggle hoạt động
            isColumnsFixed = false;
            toggleFixedColumns();
        }
    }, 100);
}


//todo Thiết lập sự kiện cho các nút phân trang=========================================================
function setupPagination() {
    // Nút trang đầu
    const firstPageBtn = document.getElementById('firstPage');
    if (firstPageBtn) {
        firstPageBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (reportList.currentPage > 1) {
                reportList.currentPage = 1;
                renderReportList();
            }
        });
    }

    // Nút trang trước
    const prevPageBtn = document.getElementById('prevPage');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (reportList.currentPage > 1) {
                reportList.currentPage--;
                renderReportList();
            }
        });
    }

    // Nút trang sau
    const nextPageBtn = document.getElementById('nextPage');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (reportList.currentPage < reportList.totalPages) {
                reportList.currentPage++;
                renderReportList();
            }
        });
    }

    // Nút trang cuối
    const lastPageBtn = document.getElementById('lastPage');
    if (lastPageBtn) {
        lastPageBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (reportList.currentPage < reportList.totalPages) {
                reportList.currentPage = reportList.totalPages;
                renderReportList();
            }
        });
    }
}

//todo Cập nhật giao diện phân trang===================================================================
function updatePaginationUI() {
    // Cập nhật trạng thái các nút trang đầu/trước
    const firstPageBtn = document.getElementById('firstPage');
    const prevPageBtn = document.getElementById('prevPage');
    if (firstPageBtn && prevPageBtn) {
        if (reportList.currentPage <= 1) {
            firstPageBtn.classList.add('disabled');
            prevPageBtn.classList.add('disabled');
        } else {
            firstPageBtn.classList.remove('disabled');
            prevPageBtn.classList.remove('disabled');
        }
    }

    // Cập nhật trạng thái các nút trang sau/cuối
    const nextPageBtn = document.getElementById('nextPage');
    const lastPageBtn = document.getElementById('lastPage');
    if (nextPageBtn && lastPageBtn) {
        if (reportList.currentPage >= reportList.totalPages) {
            nextPageBtn.classList.add('disabled');
            lastPageBtn.classList.add('disabled');
        } else {
            nextPageBtn.classList.remove('disabled');
            lastPageBtn.classList.remove('disabled');
        }
    }

    // Cập nhật các nút số trang
    updatePageNumbers();
}

//todo Cập nhật các nút số trang=======================================================================
function updatePageNumbers() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    // Xóa các nút số trang hiện tại
    const pageButtons = pagination.querySelectorAll('.page-number');
    pageButtons.forEach(btn => btn.remove());

    // Tính số trang cần hiển thị (tối đa 5 trang)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, reportList.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(reportList.totalPages, startPage + maxVisiblePages - 1);

    // Điều chỉnh lại startPage nếu cần
    if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Tìm vị trí để chèn các nút số trang (trước nút "Trang sau")
    const nextPageBtn = document.getElementById('nextPage');
    if (!nextPageBtn) return;

    const nextPageItem = nextPageBtn.parentNode;

    // Tạo và chèn các nút số trang
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item', 'page-number');
        if (i === reportList.currentPage) {
            pageItem.classList.add('active');
        }

        const pageLink = document.createElement('a');
        pageLink.classList.add('page-link');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', function (e) {
            e.preventDefault();
            reportList.currentPage = i;
            renderReportList();
        });

        pageItem.appendChild(pageLink);
        pagination.insertBefore(pageItem, nextPageItem);
    }
}

//todo Hiển thị trạng thái đang tải trong bảng=========================================================
function showLoadingInTable(isLoading, tableBodyId = 'reportTableBody') {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;

    if (isLoading) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="46" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                    <p class="mt-2">Đang tải dữ liệu...</p>
                </td>
            </tr>
        `;
    }
}

//todo Lọc danh sách báo cáo theo các điều kiện tìm kiếm=================================================
function filterReportList() {
    const searchInput = document.getElementById('searchInput');
    const mayFilter = document.getElementById('mayFilter');
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');

    // Lấy giá trị tìm kiếm
    const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const mayValue = mayFilter ? mayFilter.value : '';
    const startDateValue = startDateFilter ? startDateFilter.value : '';
    const endDateValue = endDateFilter ? endDateFilter.value : '';

    console.log('Bắt đầu lọc với:', {
        searchText,
        may: mayValue,
        từNgày: startDateValue,
        đếnNgày: endDateValue
    });

    // SỬA: Đơn giản hóa xử lý ngày - chỉ so sánh ngày, không thời gian
    let startDate = null;
    let endDate = null;

    if (startDateValue) {
        startDate = startDateValue; // Giữ dạng YYYY-MM-DD để so sánh
        console.log('Từ ngày:', startDate);
    }

    if (endDateValue) {
        endDate = endDateValue; // Giữ dạng YYYY-MM-DD để so sánh
        console.log('Đến ngày:', endDate);
    }

    // Lọc dữ liệu
    reportList.filteredData = reportList.data.filter(report => {
        // Lọc theo máy
        if (mayValue && report.may !== mayValue) {
            return false;
        }

        // SỬA: Lọc theo ngày đơn giản - chỉ dựa vào cột ngày
        if (startDate || endDate) {
            // Lấy ngày từ cột ngày của báo cáo
            let reportDateStr = report.ngay || '';

            // Chuyển đổi từ DD/MM/YYYY sang YYYY-MM-DD để so sánh
            if (reportDateStr && reportDateStr.includes('/')) {
                const parts = reportDateStr.split('/');
                if (parts.length === 3) {
                    // Chuyển từ DD/MM/YYYY sang YYYY-MM-DD
                    reportDateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }

            // Nếu không có ngày hợp lệ và đang có điều kiện lọc ngày
            if (!reportDateStr) {
                if (startDate || endDate) {
                    console.log(`Bỏ qua báo cáo ${report.id || report.stt || 'unknown'} do không có ngày hợp lệ`);
                    return false;
                }
            } else {
                // Kiểm tra từ ngày
                if (startDate && reportDateStr < startDate) {
                    return false;
                }

                // Kiểm tra đến ngày
                if (endDate && reportDateStr > endDate) {
                    return false;
                }
            }
        }

        // Lọc theo từ khóa tìm kiếm (tìm trong nhiều trường)
        if (searchText) {
            // Tạo một chuỗi kết hợp từ nhiều trường để tìm kiếm
            const searchableText = [
                report.so_phieu_cat_giay || '',
                report.so_ws || '',
                report.khach_hang || '',
                report.ma_giay || '',
                report.ma_so_cuon || '',
                report.nguoi_thuc_hien || '',
                report.ghi_chu || '',
                report.may || ''
            ].join(' ').toLowerCase();

            return searchableText.includes(searchText);
        }

        return true;
    });

    // Reset về trang đầu tiên sau khi lọc
    reportList.currentPage = 1;

    // In số lượng kết quả lọc
    console.log(`Kết quả lọc: ${reportList.filteredData.length}/${reportList.data.length} bản ghi`);

    // Hiển thị kết quả lọc
    renderReportList();

    // Nếu không có kết quả, hiển thị thông báo
    if (reportList.filteredData.length === 0) {
        showNotification('Không tìm thấy báo cáo nào phù hợp với điều kiện lọc', 'warning');
    }
}


//todo Thêm hàm xử lý hiển thị dữ liệu thời gian điều kiện lọc============================================================
function setupDateFilter() {
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');
    const dateFilterButton = document.getElementById('btnDateFilter');
    const clearFilterButton = document.getElementById('btnClearDateFilter');

    // Không đặt giá trị mặc định, để trống
    if (startDateFilter) {
        startDateFilter.type = 'date';
        startDateFilter.value = ''; // Để trống - không hiển thị ngày mặc định
    }

    if (endDateFilter) {
        endDateFilter.type = 'date';
        endDateFilter.value = ''; // Để trống - không hiển thị ngày mặc định
    }

    // Thêm sự kiện khi nhấn nút lọc
    if (dateFilterButton) {
        dateFilterButton.addEventListener('click', function () {
            console.log('Nút lọc ngày được click');

            if (startDateFilter && endDateFilter) {
                const startDate = new Date(startDateFilter.value);
                const endDate = new Date(endDateFilter.value);

                if (startDateFilter.value && endDateFilter.value && startDate > endDate) {
                    showNotification('Thời gian bắt đầu không được lớn hơn thời gian kết thúc', 'error');
                    return;
                }
            }
            filterReportList();
        });
    }

    // Thêm sự kiện cho nút xóa lọc
    if (clearFilterButton) {
        clearFilterButton.addEventListener('click', function () {
            console.log('Nút xóa lọc được click');

            // Không đặt giá trị mặc định, để trống
            if (startDateFilter) {
                startDateFilter.value = ''; // Để trống - không hiển thị ngày mặc định
            }

            if (endDateFilter) {
                endDateFilter.value = ''; // Để trống - không hiển thị ngày mặc định
            }

            // SỬA: Nếu đang có lọc theo máy, đặt lại thành tất cả
            const mayFilter = document.getElementById('mayFilter');
            if (mayFilter) {
                mayFilter.value = '';
            }

            // Nếu đang có tìm kiếm, xóa nội dung
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
            }

            // Lọc lại danh sách với điều kiện mặc định
            reportList.filteredData = [...reportList.data];
            reportList.currentPage = 1;
            renderReportList();

            showNotification('Đã xóa tất cả điều kiện lọc', 'success');
        });
    }
}

//todo Hàm chuyển đổi định dạng ngày================================================================================
function convertDateFormat(dateString) {
    if (!dateString) return null;

    // Xử lý trường hợp định dạng ISO
    if (dateString.includes('T') || dateString.includes('-')) {
        try {
            return new Date(dateString);
        } catch (e) {
            console.error('Lỗi chuyển đổi ngày ISO:', e);
        }
    }

    // Xử lý định dạng DD/MM/YYYY
    if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            try {
                // Chuyển đổi từ DD/MM/YYYY sang Date
                return new Date(
                    parseInt(parts[2]), // Năm
                    parseInt(parts[1]) - 1, // Tháng (0-11)
                    parseInt(parts[0]) // Ngày
                );
            } catch (e) {
                console.error('Lỗi chuyển đổi ngày DD/MM/YYYY:', e);
            }
        }
    }

    // Thử parse trực tiếp
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date;
        }
    } catch (e) {
        console.error('Lỗi chuyển đổi ngày trực tiếp:', e);
    }

    return null;
}

//todo Thêm sự kiện cho các nút thao tác trong bảng=====================================================
function addActionButtonsEvents() {
    // Sự kiện cho nút xem chi tiết
    document.querySelectorAll('.view-report').forEach(button => {
        button.addEventListener('click', function () {
            const reportId = this.getAttribute('data-id');
            viewReportDetail(reportId);
        });
    });

    // Sự kiện cho nút xóa
    document.querySelectorAll('.delete-report').forEach(button => {
        button.addEventListener('click', function () {
            const reportId = this.getAttribute('data-id');
            deleteReport(reportId);
        });
    });

    // Sự kiện khi click vào hàng trong bảng
    // document.querySelectorAll('.table-row').forEach(row => {
    //     row.addEventListener('click', function (e) {
    //         // Chỉ thực hiện khi không click vào nút
    //         if (!e.target.closest('button')) {
    //             const reportId = this.getAttribute('data-id');
    //             viewReportDetail(reportId);
    //         }
    //     });
    // });
}

//todo Xem chi tiết báo cáo============================================================================
async function viewReportDetail(reportId) {
    try {
        // Gọi API để lấy chi tiết báo cáo
        const response = await fetch(`/api/bao-cao-gmc/${reportId}`);

        if (!response.ok) {
            throw new Error('Không thể tải chi tiết báo cáo GMC');
        }

        const reportDetail = await response.json();
        console.log('Chi tiết báo cáo GMC:', reportDetail);

        // Hiển thị chi tiết báo cáo trong modal
        showReportDetailModal(reportDetail);

    } catch (error) {
        console.error('Lỗi khi tải chi tiết báo cáo GMC:', error);
        showNotification('Lỗi khi tải chi tiết báo cáo GMC: ' + error.message, 'error');
    }
}

//todo Hiển thị modal chi tiết báo cáo=================================================================
function showReportDetailModal(report) {
    // Kiểm tra nếu modal đã tồn tại thì xóa đi
    let existingModal = document.getElementById('reportDetailModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Hàm để hiển thị giá trị an toàn (tránh undefined/null)
    const safeValue = (value) => {
        return value !== undefined && value !== null ? value : '';
    };

    // Định dạng giá trị ca
    const formatCa = (caValue) => {
        if (caValue === '0') return 'Ca A';
        if (caValue === '1') return 'Ca B';
        if (caValue === '2') return 'Ca HC';
        return caValue;
    };

    // THÊM HÀM FORMAT CHO GIỜ LÀM VIỆC
    const formatGioLamViec = (gioValue) => {
        const mapping = {
            '0': '6H - 14H',
            '1': '14H - 22H',
            '2': '22H - 6H',
            '3': '10H - 22H',
            '4': '6H - 18H',
            '5': '18H - 6H',
            '6': '7H - 16H',
            '7': '7H - 15H',
            '8': '7H - 17H',
            '9': '8H - 17H'
        };
        return mapping[gioValue] || gioValue;
    };

    // Tạo modal - SỬA phần thông tin chung
    const modalHTML = `
    <div class="modal fade" id="reportDetailModal">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Chi tiết báo cáo GMC - ${safeValue(report.so_phieu_cat_giay)}</h5>
                </div>
                <div class="modal-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6 class="text-primary">Thông tin chung</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="40%">STT</th>
                                    <td>${safeValue(report.stt)}</td>
                                </tr>
                                <tr>
                                    <th>Ngày</th>
                                    <td>${safeValue(report.ngay)}</td>
                                </tr>
                                <tr>
                                    <th>Ca</th>
                                    <td>${formatCa(safeValue(report.ca))}</td>
                                </tr>
                                <tr>
                                    <th>Người thực hiện</th>
                                    <td>${safeValue(report.nguoi_thuc_hien)}</td>
                                </tr>
                                <tr>
                                    <th>Giờ làm việc</th>
                                    <td>${formatGioLamViec(safeValue(report.gio_lam_viec))}</td>
                                </tr>
                                <tr>
                                    <th>Mã Ca</th>
                                    <td>${safeValue(report.ma_ca)}</td>
                                </tr>
                                <tr>
                                    <th>Ngày phụ</th>
                                    <td>${safeValue(report.ngay_phu)}</td>
                                </tr>
                                <tr>
                                    <th>Máy</th>
                                    <td>${safeValue(report.may)}</td>
                                </tr>
                                <tr>
                                    <th>Worksheet</th>
                                    <td>${safeValue(report.so_ws)}</td>
                                </tr>
                                <tr>
                                    <th>Khách hàng</th>
                                    <td>${safeValue(report.khach_hang)}</td>
                                </tr>
                                <tr>
                                    <th>Mã giấy</th>
                                    <td>${safeValue(report.ma_giay)}</td>
                                </tr>
                                <tr>
                                    <th>Định lượng</th>
                                    <td>${safeValue(report.dinh_luong)}</td>
                                </tr>
                                <tr>
    <th>Số tấm</th>
    <td>${formatNumberUS(safeValue(report.so_tam))}</td>
</tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-primary">Thông tin phiếu</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="40%">Số phiếu cắt giấy</th>
                                    <td>${safeValue(report.so_phieu_cat_giay)}</td>
                                </tr>
                                <tr>
                                    <th>Số lần chạy</th>
                                    <td>${safeValue(report.so_lan_chay)}</td>
                                </tr>
                                <tr>
                                    <th>Thứ tự cuộn</th>
                                    <td>${safeValue(report.thu_tu_cuon)}</td>
                                </tr>
                                <tr>
                                    <th>Số cuộn</th>
                                    <td>${safeValue(report.so_cuon)}</td>
                                </tr>
                                <tr>
                                    <th>Mã số cuộn</th>
                                    <td>${safeValue(report.ma_so_cuon)}</td>
                                </tr>
                                <tr>
                                    <th>Trọng lượng nhận</th>
                                    <td>${formatNumberUS(safeValue(report.trong_luong_nhan))}</td>
                                </tr>
                                <tr>
                                    <th>Số ID</th>
                                    <td>${safeValue(report.so_id)}</td>
                                </tr>
                                <tr>
                                    <th>Xả đôi</th>
                                    <td>${safeValue(report.xa_doi) === '0' ? 'Không xả đôi' : 'Xả đôi'}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-md-12">
                            <h6 class="text-primary">Thông tin sản xuất</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="20%">Thời gian bắt đầu</th>
                                    <td>${safeValue(report.thoi_gian_bat_dau)}</td>
                                    <th width="20%">Thời gian kết thúc</th>
                                    <td>${safeValue(report.thoi_gian_ket_thuc)}</td>
                                </tr>
                                <tr>
                                    <th>Khổ (mm)</th>
                                    <td>${safeValue(report.kho_mm)}</td>
                                    <th>Dài (mm)</th>
                                    <td>${safeValue(report.dai_mm)}</td>
                                </tr>
                                <tr>
                                    <th>Khổ cắt (mm)</th>
                                    <td>${safeValue(report.kho_cat)}</td>
                                    <th>Khổ xén</th>
                                    <td>${safeValue(report.kho_xen)}</td>
                                </tr>
                                <tr>
                                    <th>Dài xén</th>
                                    <td>${safeValue(report.dai_xen)}</td>
                                    <th>Số tấm xén</th>
                                    <td>${safeValue(report.so_tam_xen)}</td>
                                </tr>
                                <tr>
                                    <th>Tổng số pallet</th>
                                    <td>${safeValue(report.tong_so_pallet)}</td>
                                    <th>Chiều cao pallet</th>
                                    <td>${safeValue(report.chieu_cao_pallet)}</td>
                                </tr>
                                <tr>
                                    <th>Số tấm cắt được</th>
                                    <td>${formatNumberUS(safeValue(report.so_tam_cat_duoc))}</td>
                                    <th>Số tấm tham chiếu</th>
                                    <td>${formatNumberUS(safeValue(report.so_tam_tham_chieu))}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6 class="text-primary">Thông tin trọng lượng</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="40%">TL trả thực tế (kg)</th>
                                    <td>${formatNumberUS(safeValue(report.tl_tra_thuc_te))}</td>
                                </tr>
                                <tr>
                                    <th>TL trả dự tính (kg)</th>
                                    <td>${formatNumberUS(safeValue(report.tl_tra_du_tinh))}</td>
                                </tr>
                                <tr>
                                    <th>Lõi (kg)</th>
                                    <td>${safeValue(report.loi_kg)}</td>
                                </tr>
                                <tr>
                                    <th>Đầu cuộn (kg)</th>
                                    <td>${safeValue(report.dau_cuon_kg)}</td>
                                </tr>
                                <tr>
                                    <th>Rách móp (kg)</th>
                                    <td>${safeValue(report.rach_mop_kg)}</td>
                                </tr>
                                <tr>
                                    <th>Phế liệu sản xuất (kg)</th>
                                    <td>${safeValue(report.phe_lieu_san_xuat_kg)}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-primary">Thông tin thêm</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="40%">Sử dụng giấy tồn (tấm)</th>
                                    <td>${safeValue(report.su_dung_giay_ton_tam)}</td>
                                </tr>
                                <tr>
                                    <th>Số tờ/pallet</th>
                                    <td>${formatNumberUS(safeValue(report.so_to_pallet))}</td>
                                </tr>
                                <tr>
                                    <th>Khổ cắt sai (mm)</th>
                                    <td>${safeValue(report.kho_cat_sai_mm)}</td>
                                </tr>
                                <tr>
                                    <th>Dài cắt sai (mm)</th>
                                    <td>${safeValue(report.dai_cat_sai_mm)}</td>
                                </tr>
                                <tr>
                                    <th>Số tấm cắt sai</th>
                                    <td>${safeValue(report.so_tam_cat_sai)}</td>
                                </tr>
                                <tr>
                                    <th>Thời gian chuyển đổi pallet</th>
                                    <td>${safeValue(report.thoi_gian_chuyen_doi_pallet)}</td>
                                </tr>
                                <tr>
                                    <th>Thời gian khác</th>
                                    <td>${safeValue(report.thoi_gian_khac)}</td>
                                </tr>
                                <tr>
                                    <th>Giấy quấn/lót</th>
                                    <td>${safeValue(report.giay_quan_lot) === 'Có' ? 'Có' : 'Không'}</td>
                                </tr>
                                <tr>
                                    <th>Chuyển xén</th>
                                    <td>${safeValue(report.chuyen_xen) === 'Có' ? 'Có' : 'Không'}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    ${report.dungMay && report.dungMay.length > 0 ? `
                    <div class="row">
                        <div class="col-md-12">
                            <h6 class="text-primary">Thông tin dừng máy</h6>
                            <table class="table table-bordered">
                                <thead>
                                    <tr class="table-secondary">
                                        <th>STT</th>
                                        <th>Lý do</th>
                                        <th>Lý do khác</th>
                                        <th>Thời gian dừng</th>
                                        <th>Thời gian chạy lại</th>
                                        <th>Thời gian dừng máy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${report.dungMay.map((item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${safeValue(item.ly_do)}</td>
                                        <td>${safeValue(item.ly_do_khac)}</td>
                                        <td>${safeValue(item.thoi_gian_dung)}</td>
                                        <td>${safeValue(item.thoi_gian_chay_lai)}</td>
                                        <td>${safeValue(item.thoi_gian_dung_may)}</td>
                                    </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="row">
                        <div class="col-12">
                            <h6 class="text-primary">Ghi chú</h6>
                            <div class="p-3 border rounded">
                                ${safeValue(report.ghi_chu) || 'Không có ghi chú'}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    <button type="button" class="btn btn-primary" id="printReport" data-id="${report.id}">In báo cáo</button>
                </div>
            </div>
        </div>
    </div>
    `;

    // Thêm modal vào body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Hiển thị modal
    const modalElement = document.getElementById('reportDetailModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Thêm sự kiện cho nút in báo cáo
    const printButton = document.getElementById('printReport');
    if (printButton) {
        printButton.addEventListener('click', function () {
            const reportId = this.getAttribute('data-id');
            printReport(reportId);
        });
    }
}

//todo Xóa báo cáo================================================================================
async function deleteReport(reportId) {
    // Xác nhận trước khi xóa
    if (!confirm('Bạn có chắc chắn muốn xóa báo cáo GMC này?')) {
        return;
    }

    try {
        // Gọi API để xóa báo cáo
        const response = await fetch(`/api/bao-cao-gmc/${reportId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Không thể xóa báo cáo GMC');
        }

        showNotification('Đã xóa báo cáo GMC thành công', 'success');

        // Tải lại danh sách báo cáo
        loadReportList();

    } catch (error) {
        console.error('Lỗi khi xóa báo cáo GMC:', error);
        showNotification('Lỗi khi xóa báo cáo GMC: ' + error.message, 'error');
    }
}

//todo In báo cáo==================================================================================
function printReport(reportId) {
    // Tìm modal chi tiết báo cáo
    const modalElement = document.getElementById('reportDetailModal');
    if (!modalElement) return;

    // Lấy nội dung cần in
    const printContent = modalElement.querySelector('.modal-body').cloneNode(true);

    // Tạo trang in
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>In báo cáo GMC</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { padding: 8px; border: 1px solid #ddd; }
                th { background-color: #f4f4f4; }
                h6 { margin-top: 15px; color: #0d6efd; }
                @media print {
                    .no-print { display: none; }
                    body { padding: 0; }
                }
                .header { text-align: center; margin-bottom: 20px; }
                .footer { text-align: center; margin-top: 30px; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>BÁO CÁO GMC</h2>
                <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
            </div>
            ${printContent.innerHTML}
            <div class="footer">
                <p>© ${new Date().getFullYear()} - Phần mềm quản lý báo cáo GMC</p>
            </div>
            <div class="no-print mt-4">
                <button class="btn btn-primary" onclick="window.print()">In báo cáo</button>
                <button class="btn btn-secondary" onclick="window.close()">Đóng</button>
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();
}

//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG QUẢN LÝ DANH SÁCH BÁO CÁO DỪNG MÁY GMC
//  Mô tả: Hiển thị, phân trang, lọc danh sách báo cáo dừng máy GMC
//! =================================================================

// Biến toàn cục để quản lý danh sách báo cáo dừng máy
let stopReportList = {
    data: [],
    filteredData: [],
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1
};

// Hàm tải danh sách báo cáo dừng máy
async function loadMachineStopReportList() {
    try {
        // Hiển thị trạng thái đang tải
        showLoadingInTable(true, 'stopReportTableBody');

        // Gọi API để lấy danh sách báo cáo dừng máy
        const response = await fetch('/api/bao-cao-gmc/dung-may/list');

        if (!response.ok) {
            throw new Error('Không thể tải danh sách báo cáo dừng máy GMC');
        }

        const data = await response.json();
        console.log('Đã tải danh sách báo cáo dừng máy GMC:', data.length, 'bản ghi');

        // Lưu dữ liệu vào biến toàn cục
        stopReportList.data = data;
        stopReportList.filteredData = [...data];

        // Render danh sách báo cáo dừng máy
        renderStopReportList();

        // Hiển thị thông báo thành công
        showNotification(`Đã tải ${data.length} bản ghi báo cáo dừng máy GMC`, 'success');

    } catch (error) {
        console.error('Lỗi khi tải danh sách báo cáo dừng máy GMC:', error);
        showNotification('Lỗi khi tải danh sách báo cáo dừng máy GMC: ' + error.message, 'error');
    } finally {
        // Ẩn trạng thái đang tải
        showLoadingInTable(false, 'stopReportTableBody');
    }
}

// Hàm hiển thị danh sách báo cáo dừng máy
function renderStopReportList() {
    const tableBody = document.getElementById('stopReportTableBody');
    const pageInfo = document.getElementById('stopPageInfo');
    const totalItems = document.getElementById('totalStopItems');

    if (!tableBody || !pageInfo || !totalItems) {
        console.error('Không tìm thấy các phần tử cần thiết để hiển thị danh sách dừng máy');
        return;
    }

    // Xóa nội dung bảng hiện tại
    tableBody.innerHTML = '';

    // Tính toán phân trang
    const totalRecords = stopReportList.filteredData.length;
    stopReportList.totalPages = Math.ceil(totalRecords / stopReportList.itemsPerPage);

    // Đảm bảo trang hiện tại không vượt quá tổng số trang
    if (stopReportList.currentPage > stopReportList.totalPages) {
        stopReportList.currentPage = Math.max(1, stopReportList.totalPages);
    }

    // Tính toán vị trí bắt đầu và kết thúc
    const startIndex = (stopReportList.currentPage - 1) * stopReportList.itemsPerPage;
    const endIndex = Math.min(startIndex + stopReportList.itemsPerPage, totalRecords);

    // Lấy dữ liệu cho trang hiện tại
    const currentPageData = stopReportList.filteredData.slice(startIndex, endIndex);

    // Hiển thị thông tin phân trang
    pageInfo.textContent = `Hiển thị ${startIndex + 1}-${endIndex} của ${totalRecords}`;
    totalItems.textContent = `Tổng số: ${totalRecords} bản ghi`;

    // Kiểm tra nếu không có dữ liệu
    if (currentPageData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center">Không có dữ liệu báo cáo dừng máy GMC</td>
            </tr>
        `;
        // Cập nhật UI phân trang
        updateStopPaginationUI();
        return;
    }

    // Tạo các hàng dữ liệu
    currentPageData.forEach((report, index) => {
        const row = document.createElement('tr');
        row.classList.add('table-row');
        row.setAttribute('data-id', report.id);

        // Hàm để hiển thị giá trị an toàn (tránh undefined/null)
        const safeValue = (value) => {
            return value !== undefined && value !== null ? value : '';
        };

        // Hàm định dạng thời gian từ ISO string
        const formatDateTime = (isoString) => {
            if (!isoString) return '';

            try {
                const date = new Date(isoString);
                if (isNaN(date.getTime())) return isoString;

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
            } catch (e) {
                return isoString;
            }
        };

        // Định dạng giá trị ca
        const formatCa = (caValue) => {
            if (caValue === '0') return 'Ca A';
            if (caValue === '1') return 'Ca B';
            if (caValue === '2') return 'Ca HC';
            return caValue;
        };

        // THÊM HÀM FORMAT GIỜ LÀM VIỆC
        const formatGioLamViec = (gioValue) => {
            const mapping = {
                '0': '6H - 14H',
                '1': '14H - 22H',
                '2': '22H - 6H',
                '3': '10H - 22H',
                '4': '6H - 18H',
                '5': '18H - 6H',
                '6': '7H - 16H',
                '7': '7H - 15H',
                '8': '7H - 17H',
                '9': '8H - 17H'
            };
            return mapping[gioValue] || gioValue;
        };


        // Nội dung HTML cho hàng
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${safeValue(report.may)}</td>
            <td>${formatCa(safeValue(report.ca))}</td>
            <td>${safeValue(report.nguoi_thuc_hien)}</td>
            <td>${formatGioLamViec(safeValue(report.gio_lam_viec))}</td>
            <td>${safeValue(report.ma_ca)}</td>
            <td>${safeValue(report.so_ws || report.worksheet)}</td>
            <td>${safeValue(report.so_phieu_cat_giay)}</td>
            <td>${safeValue(report.thu_tu_cuon)}</td>
            <td style="color:green ; font-weight: bold;">${formatDateTime(safeValue(report.thoi_gian_dung))}</td>
            <td style="color:red ; font-weight: bold;">${formatDateTime(safeValue(report.thoi_gian_chay_lai))}</td>
            <td>${safeValue(report.thoi_gian_dung_may)}</td>
            <td>${safeValue(report.ly_do)}</td>
            <td>${safeValue(report.ly_do_khac || report.ghi_chu)}</td>
            <td>
                <button class="btn btn-sm btn-primary view-stop-report" data-id="${report.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-stop-report" data-id="${report.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Thêm sự kiện cho các nút thao tác
    addStopReportActionButtonsEvents();

    // Cập nhật UI phân trang
    updateStopPaginationUI();
}

// Cập nhật hiển thị phân trang cho danh sách báo cáo dừng máy
function updateStopPaginationUI() {
    // Cập nhật trạng thái các nút trang đầu/trước
    const firstPageBtn = document.getElementById('firstStopPage');
    const prevPageBtn = document.getElementById('prevStopPage');
    if (firstPageBtn && prevPageBtn) {
        if (stopReportList.currentPage <= 1) {
            firstPageBtn.classList.add('disabled');
            prevPageBtn.classList.add('disabled');
        } else {
            firstPageBtn.classList.remove('disabled');
            prevPageBtn.classList.remove('disabled');
        }
    }

    // Cập nhật trạng thái các nút trang sau/cuối
    const nextPageBtn = document.getElementById('nextStopPage');
    const lastPageBtn = document.getElementById('lastStopPage');
    if (nextPageBtn && lastPageBtn) {
        if (stopReportList.currentPage >= stopReportList.totalPages) {
            nextPageBtn.classList.add('disabled');
            lastPageBtn.classList.add('disabled');
        } else {
            nextPageBtn.classList.remove('disabled');
            lastPageBtn.classList.remove('disabled');
        }
    }

    // Cập nhật các nút số trang
    updateStopPageNumbers();
}

// Cập nhật các nút số trang cho báo cáo dừng máy
function updateStopPageNumbers() {
    const pagination = document.getElementById('stopPagination');
    if (!pagination) return;

    // Xóa các nút số trang hiện tại
    const pageButtons = pagination.querySelectorAll('.page-number');
    pageButtons.forEach(btn => btn.remove());

    // Tính số trang cần hiển thị (tối đa 5 trang)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, stopReportList.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(stopReportList.totalPages, startPage + maxVisiblePages - 1);

    // Điều chỉnh lại startPage nếu cần
    if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Tìm vị trí để chèn các nút số trang (trước nút "Trang sau")
    const nextPageBtn = document.getElementById('nextStopPage');
    if (!nextPageBtn) return;

    const nextPageItem = nextPageBtn.parentNode;

    // Tạo và chèn các nút số trang
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item', 'page-number');
        if (i === stopReportList.currentPage) {
            pageItem.classList.add('active');
        }

        const pageLink = document.createElement('a');
        pageLink.classList.add('page-link');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', function (e) {
            e.preventDefault();
            stopReportList.currentPage = i;
            renderStopReportList();
        });

        pageItem.appendChild(pageLink);
        pagination.insertBefore(pageItem, nextPageItem);
    }
}

// Thêm sự kiện cho các nút trong danh sách báo cáo dừng máy
function addStopReportActionButtonsEvents() {
    // Sự kiện cho nút xem chi tiết
    document.querySelectorAll('.view-stop-report').forEach(button => {
        button.addEventListener('click', function () {
            const reportId = this.getAttribute('data-id');
            viewStopReportDetail(reportId);
        });
    });

    // Sự kiện cho nút xóa
    document.querySelectorAll('.delete-stop-report').forEach(button => {
        button.addEventListener('click', function () {
            const reportId = this.getAttribute('data-id');
            deleteStopReport(reportId);
        });
    });
}

// Hàm xem chi tiết báo cáo dừng máy
async function viewStopReportDetail(reportId) {
    try {
        // Gọi API để lấy chi tiết báo cáo
        const response = await fetch(`/api/bao-cao-gmc/dung-may/${reportId}`);

        if (!response.ok) {
            throw new Error('Không thể tải chi tiết báo cáo dừng máy GMC');
        }

        const reportDetail = await response.json();
        console.log('Chi tiết báo cáo dừng máy GMC:', reportDetail);

        // Hiển thị chi tiết báo cáo trong modal
        showStopReportDetailModal(reportDetail);

    } catch (error) {
        console.error('Lỗi khi tải chi tiết báo cáo dừng máy GMC:', error);
        showNotification('Lỗi khi tải chi tiết báo cáo dừng máy GMC: ' + error.message, 'error');
    }
}

// Hiển thị modal chi tiết báo cáo dừng máy
function showStopReportDetailModal(report) {
    // Tạo modal tương tự như modal chi tiết báo cáo SCL
    let existingModal = document.getElementById('stopReportDetailModal');
    if (existingModal) {
        existingModal.remove();
    }

    const safeValue = (value) => {
        return value !== undefined && value !== null ? value : '';
    };

    // Format time function
    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return isoString;

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
        } catch (e) {
            return isoString;
        }
    };


    // Format ca
    const formatCa = (caValue) => {
        if (caValue === '0') return 'Ca A';
        if (caValue === '1') return 'Ca B';
        if (caValue === '2') return 'Ca HC';
        return caValue;
    };

    // Format giờ làm việc
    const formatGioLamViec = (gioValue) => {
        const mapping = {
            '0': '6H - 14H',
            '1': '14H - 22H',
            '2': '22H - 6H',
            '3': '10H - 22H',
            '4': '6H - 18H',
            '5': '18H - 6H',
            '6': '7H - 16H',
            '7': '7H - 15H',
            '8': '7H - 17H',
            '9': '8H - 17H'
        };
        return mapping[gioValue] || gioValue;
    };


    // Tạo modal - THÊM GIỜ LÀM VIỆC VÀ MÃ CA
    const modalHTML = `
    <div class="modal fade" id="stopReportDetailModal" tabindex="-1" aria-labelledby="stopReportDetailModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="stopReportDetailModalLabel">Chi tiết báo cáo dừng máy GMC</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6 class="text-danger">Thông tin chung</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="40%">Ca</th>
                                    <td>${formatCa(safeValue(report.ca))}</td>
                                </tr>
                                <tr>
                                    <th>Người thực hiện</th>
                                    <td>${safeValue(report.nguoi_thuc_hien)}</td>
                                </tr>
                                <tr>
                                    <th>Giờ làm việc</th>
                                    <td>${formatGioLamViec(safeValue(report.gio_lam_viec))}</td>
                                </tr>
                                <tr>
                                    <th>Mã Ca</th>
                                    <td>${safeValue(report.ma_ca)}</td>
                                </tr>
                                <tr>
                                    <th>Máy</th>
                                    <td>${safeValue(report.may)}</td>
                                </tr>
                                <tr>
                                    <th>Worksheet</th>
                                    <td>${safeValue(report.worksheet || report.so_ws)}</td>
                                </tr>
                                <tr>
                                    <th>Số phiếu cắt giấy</th>
                                    <td>${safeValue(report.so_phieu_cat_giay)}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-danger">Thông tin dừng máy</h6>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="40%">Lý do dừng máy</th>
                                    <td>${safeValue(report.ly_do)}</td>
                                </tr>
                                <tr>
                                    <th>Lý do khác</th>
                                    <td>${safeValue(report.ly_do_khac)}</td>
                                </tr>
                                <tr>
                                    <th>Thời gian dừng</th>
                                    <td>${formatDateTime(safeValue(report.thoi_gian_dung))}</td>
                                </tr>
                                <tr>
                                    <th>Thời gian chạy lại</th>
                                    <td>${formatDateTime(safeValue(report.thoi_gian_chay_lai))}</td>
                                </tr>
                                <tr>
                                    <th>Thời gian dừng máy</th>
                                    <td>${safeValue(report.thoi_gian_dung_may)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-12">
                            <h6 class="text-danger">Ghi chú</h6>
                            <div class="p-3 border rounded">
                                ${safeValue(report.ghi_chu) || 'Không có ghi chú'}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                </div>
            </div>
        </div>
    </div>
    `;

    // Thêm modal vào body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Hiển thị modal
    const modalElement = document.getElementById('stopReportDetailModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// Hàm xóa báo cáo dừng máy
async function deleteStopReport(reportId) {
    // Xác nhận trước khi xóa
    if (!confirm('Bạn có chắc chắn muốn xóa báo cáo dừng máy GMC này?')) {
        return;
    }

    try {
        // Gọi API để xóa báo cáo
        const response = await fetch(`/api/bao-cao-gmc/dung-may/${reportId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Không thể xóa báo cáo dừng máy GMC');
        }

        showNotification('Đã xóa báo cáo dừng máy GMC thành công', 'success');

        // Tải lại danh sách báo cáo dừng máy
        loadMachineStopReportList();

    } catch (error) {
        console.error('Lỗi khi xóa báo cáo dừng máy GMC:', error);
        showNotification('Lỗi khi xóa báo cáo dừng máy GMC: ' + error.message, 'error');
    }
}



// Hàm tính khổ cắt cho báo cáo (áp dụng cho cả phiếu thường và bổ sung sau)
function calculateKhoCatForReport() {
    const maGiay = document.getElementById('maVatTu')?.value || '';
    const xaDoi = parseInt(document.getElementById('xadoiSelect')?.value || '0');

    if (!maGiay) {
        console.log("Không có mã giấy để tính khổ cắt");
        return "";
    }

    // Format của mã giấy: AABBCD-EEEE-FFFF-GGGG
    const parts = maGiay.split('-');
    if (parts.length < 3) {
        console.log("Mã giấy không đúng định dạng để lấy phần FFFF");
        return "";
    }

    // Lấy phần FFFF (phần thứ 3 trong mã giấy)
    const ffff = parts[2];
    console.log(`Phần FFFF từ mã giấy: ${ffff}`);

    // Chuyển đổi từ chuỗi sang số (bỏ các số 0 ở đầu)
    const khoNumber = parseInt(ffff, 10);

    // Kiểm tra giá trị hợp lệ
    if (isNaN(khoNumber)) {
        console.log("Không thể chuyển đổi FFFF thành số");
        return ffff; // Trả về giá trị gốc nếu không chuyển đổi được
    }

    // Xử lý theo xả đôi
    if (xaDoi === 0) {
        // Không xả đôi - giữ nguyên giá trị
        console.log(`Khổ cắt (không xả đôi): ${khoNumber}`);
        return khoNumber.toString();
    } else if (xaDoi === 1) {
        // Xả đôi - chia đôi giá trị
        const khoCat = Math.floor(khoNumber / 2);
        console.log(`Khổ cắt (xả đôi): ${khoNumber} / 2 = ${khoCat}`);
        return khoCat.toString();
    }

    // Trả về giá trị mặc định nếu xả đôi không hợp lệ
    return khoNumber.toString();
}

// Hàm lấy giá trị khổ cho báo cáo 
function getKhoValueForReport() {
    const khoElement = document.getElementById('kho');
    let khoValue = khoElement?.value || '';

    // Nếu có giá trị khổ từ form, sử dụng luôn
    if (khoValue) {
        return khoValue;
    }

    // Nếu không có, lấy từ mã giấy (phần FFFF không chia đôi)
    const maGiay = document.getElementById('maVatTu')?.value || '';
    if (maGiay) {
        const parts = maGiay.split('-');
        if (parts.length >= 4) {
            // Lấy phần FFFF từ mã giấy AABBCD-EEEE-FFFF-GGGG
            const ffff = parts[2];
            const khoNumber = parseInt(ffff, 10);
            if (!isNaN(khoNumber)) {
                khoValue = khoNumber.toString(); // Khổ = FFFF (không chia đôi)
                console.log(`Khổ lấy từ mã giấy FFFF: ${khoValue}`);
            }
        }
    }

    return khoValue;
}

// Hàm lấy giá trị dài cho báo cáo
function getDaiValueForReport() {
    const daiElement = document.getElementById('dai');
    let daiValue = daiElement?.value || '';

    // Nếu là phiếu bổ sung sau và không có giá trị dài
    if (isPhieuBoSungSau() && !daiValue) {
        // Với phiếu bổ sung sau, cần phải có dài để tính toán
        // Nếu không có thì để trống, sẽ được cập nhật sau từ phiếu cắt
        console.log("Phiếu bổ sung sau - Chưa có dữ liệu dài, sẽ cập nhật sau");
        daiValue = ''; // Để trống, sẽ được cập nhật tự động sau
    }

    return daiValue;
}


// Hàm xuất dữ liệu ra Excel
function exportToExcel() {
    try {
        console.log('Bắt đầu xuất Excel...');

        // Kiểm tra dữ liệu
        if (!reportList.filteredData || reportList.filteredData.length === 0) {
            showNotification('Không có dữ liệu để xuất Excel', 'warning');
            return;
        }

        // Tạo workbook mới
        const wb = XLSX.utils.book_new();

        // Chuẩn bị dữ liệu cho Excel
        const excelData = reportList.filteredData.map((report, index) => {
            // Hàm format ca
            const formatCa = (caValue) => {
                if (caValue === '0') return 'Ca A';
                if (caValue === '1') return 'Ca B';
                if (caValue === '2') return 'Ca HC';
                return caValue || '';
            };

            // Hàm format thời gian
            const formatDateTime = (isoString) => {
                if (!isoString) return '';
                try {
                    const date = new Date(isoString);
                    if (isNaN(date.getTime())) return isoString;

                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');

                    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
                } catch (e) {
                    return isoString;
                }
            };

            // Hàm xử lý giá trị an toàn
            const safeValue = (value) => {
                return value !== undefined && value !== null ? value : '';
            };

            return {
                'STT': safeValue(report.stt),
                'Ngày': safeValue(report.ngay),
                'Ca': formatCa(safeValue(report.ca)),
                'Người thực hiện': safeValue(report.nguoi_thuc_hien),
                'Ngày phụ': safeValue(report.ngay_phu),
                'Máy': safeValue(report.may),
                'Số Phiếu CG': safeValue(report.so_phieu_cat_giay),
                'Số lần': safeValue(report.so_lan_chay),
                'Số WS': safeValue(report.so_ws),
                'Khách hàng': safeValue(report.khach_hang),
                'Mã giấy': safeValue(report.ma_giay),
                'Định Lượng': safeValue(report.dinh_luong),
                'Khổ cắt (mm)': safeValue(report.kho_cat),
                'Mã số cuộn': safeValue(report.ma_so_cuon),
                'TLN': formatNumberUS(safeValue(report.trong_luong_nhan)),
                'TG BẮT ĐẦU': formatDateTime(safeValue(report.thoi_gian_bat_dau)),
                'TG Kết Thúc': formatDateTime(safeValue(report.thoi_gian_ket_thuc)),
                'Khổ (mm)': safeValue(report.kho_mm),
                'Dài (mm)': safeValue(report.dai_mm),
                'Tổng số pallet': safeValue(report.tong_so_pallet),
                'Số tấm cắt được': formatNumberUS(safeValue(report.so_tam_cat_duoc)),
                'TL trả thực tế (kg)': formatNumberUS(safeValue(report.tl_tra_thuc_te)),
                'TL trả dự tính (kg)': formatNumberUS(safeValue(report.tl_tra_du_tinh)),
                'Lõi (kg)': safeValue(report.loi_kg),
                'Đầu cuộn (kg)': safeValue(report.dau_cuon_kg),
                'Rách móp (kg)': safeValue(report.rach_mop_kg),
                'Phế liệu sản xuất (Kg)': safeValue(report.phe_lieu_san_xuat_kg),
                'Số cuộn': safeValue(report.so_cuon),
                'Ghi chú': safeValue(report.ghi_chu),
                'Thứ tự cuộn': safeValue(report.thu_tu_cuon),
                'Xả đôi': safeValue(report.xa_doi) === '0' ? 'Không xả đôi' : 'Xả đôi',
                'Số ID': safeValue(report.so_id),
                'Khổ (xén)': safeValue(report.kho_xen),
                'Dài (xén)': safeValue(report.dai_xen),
                'Số tấm xén': formatNumberUS(safeValue(report.so_tam_xen)),
                'Sử dụng giấy tồn (tấm)': safeValue(report.su_dung_giay_ton_tam),
                'Số tờ/pallet': safeValue(report.so_to_pallet),
                'Khổ cắt sai (mm)': safeValue(report.kho_cat_sai_mm),
                'Dài cắt sai (mm)': safeValue(report.dai_cat_sai_mm),
                'Số tấm cắt sai': safeValue(report.so_tam_cat_sai),
                'Giấy quấn/giấy lót': safeValue(report.giay_quan_lot) === 'Có' ? 'Có' : 'Không',
                'Chuyển xén': safeValue(report.chuyen_xen) === 'Có' ? 'Có' : 'Không',
                'Chiều cao pallet': safeValue(report.chieu_cao_pallet),
                'Số tấm tham chiếu': formatNumberUS(safeValue(report.so_tam_tham_chieu)),
                'Thời gian chuyển đổi pallet': safeValue(report.thoi_gian_chuyen_doi_pallet),
                'Thời gian khác': safeValue(report.thoi_gian_khac)
            };
        });

        // Tạo worksheet từ dữ liệu
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Thiết lập độ rộng cột
        const colWidths = [
            { wch: 8 },   // STT
            { wch: 10 },  // Ca
            { wch: 25 },  // Người thực hiện
            { wch: 12 },  // Ngày
            { wch: 10 },  // Máy
            { wch: 15 },  // Số Phiếu CG
            { wch: 8 },   // Số lần
            { wch: 15 },  // Số WS
            { wch: 20 },  // Khách hàng
            { wch: 35 },  // Mã giấy
            { wch: 12 },  // Định Lượng
            { wch: 15 },  // Khổ cắt
            { wch: 25 },  // Mã số cuộn
            { wch: 10 },  // TLN
            { wch: 20 },  // TG BẮT ĐẦU
            { wch: 20 },  // TG Kết Thúc
            { wch: 12 },  // Khổ
            { wch: 12 },  // Dài
            { wch: 15 },  // Tổng số pallet
            { wch: 18 },  // Số tấm cắt được
            { wch: 18 },  // TL trả thực tế
            { wch: 18 },  // TL trả dự tính
            { wch: 12 },  // Lõi
            { wch: 15 },  // Đầu cuộn
            { wch: 12 },  // Rách móp
            { wch: 20 },  // Phế liệu sản xuất
            { wch: 10 },  // Số cuộn
            { wch: 30 },  // Ghi chú
            { wch: 12 },  // Thứ tự cuộn
            { wch: 12 },  // Xả đôi
            { wch: 15 },  // Số ID
            { wch: 12 },  // Khổ (xén)
            { wch: 12 },  // Dài (xén)
            { wch: 15 },  // Số tấm xén
            { wch: 20 },  // Sử dụng giấy tồn
            { wch: 15 },  // Số tờ/pallet
            { wch: 18 },  // Khổ cắt sai
            { wch: 18 },  // Dài cắt sai
            { wch: 18 },  // Số tấm cắt sai
            { wch: 18 },  // Giấy quấn/lót
            { wch: 15 },  // Chuyển xén
            { wch: 18 },  // Chiều cao pallet
            { wch: 18 },  // Số tấm tham chiếu
            { wch: 25 },  // Thời gian chuyển đổi pallet
            { wch: 15 }   // Thời gian khác
        ];

        ws['!cols'] = colWidths;

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo GMC');

        // Tạo tên file với timestamp
        const now = new Date();
        const timestamp = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') + '_' +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0');

        const fileName = `BaoCao_GMC_${timestamp}.xlsx`;

        // Xuất file
        XLSX.writeFile(wb, fileName);

        showNotification(`Đã xuất Excel thành công: ${fileName}`, 'success');
        console.log('Xuất Excel thành công:', fileName);

    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error);
        showNotification('Lỗi khi xuất Excel: ' + error.message, 'error');
    }
}



//! ====================================================================================================================================
//! =================================================================
//! CHỨC NĂNG LOADING VÀ XỬ LÝ SAU KHI GỬI BÁO CÁO GMC
//  Mô tả: Hiển thị loading khi gửi báo cáo và xử lý scroll về đầu trang
//! =================================================================

// Hàm tạo overlay loading cho báo cáo GMC
function createGMCLoadingOverlay() {
    // Kiểm tra xem đã có overlay chưa
    let existingOverlay = document.getElementById('gmcLoadingOverlay');
    if (existingOverlay) {
        return existingOverlay;
    }

    // Tạo overlay loading
    const overlay = document.createElement('div');
    overlay.id = 'gmcLoadingOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Tạo spinner
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 60px;
        height: 60px;
        border: 6px solid #f3f3f3;
        border-top: 6px solid #007bff;
        border-radius: 50%;
        animation: gmcSpin 1s linear infinite;
        margin-bottom: 20px;
    `;

    // Tạo text loading
    const loadingText = document.createElement('div');
    loadingText.id = 'gmcLoadingText';
    loadingText.style.cssText = `
        color: white;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 10px;
    `;
    loadingText.textContent = 'Đang gửi báo cáo GMC...';

    // Tạo progress text
    const progressText = document.createElement('div');
    progressText.id = 'gmcProgressText';
    progressText.style.cssText = `
        color: #ccc;
        font-size: 14px;
        text-align: center;
    `;
    progressText.textContent = 'Vui lòng đợi...';

    // Thêm các phần tử vào overlay
    overlay.appendChild(spinner);
    overlay.appendChild(loadingText);
    overlay.appendChild(progressText);

    // Thêm CSS animation cho spinner
    if (!document.getElementById('gmcSpinnerStyle')) {
        const style = document.createElement('style');
        style.id = 'gmcSpinnerStyle';
        style.textContent = `
            @keyframes gmcSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Thêm overlay vào body
    document.body.appendChild(overlay);

    return overlay;
}

// Hàm hiển thị loading
function showGMCLoading(message = 'Đang gửi báo cáo GMC...', progress = 'Vui lòng đợi...') {
    const overlay = createGMCLoadingOverlay();

    // Cập nhật text
    const loadingText = document.getElementById('gmcLoadingText');
    const progressText = document.getElementById('gmcProgressText');

    if (loadingText) loadingText.textContent = message;
    if (progressText) progressText.textContent = progress;

    // Hiển thị overlay với animation
    overlay.style.display = 'flex';
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);

    console.log('Đã hiển thị GMC loading:', message);
}

// Hàm ẩn loading
function hideGMCLoading() {
    const overlay = document.getElementById('gmcLoadingOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            console.log('Đã ẩn GMC loading');
        }, 300);
    }
}

// Hàm cập nhật text loading
function updateGMCLoadingText(message, progress = '') {
    const loadingText = document.getElementById('gmcLoadingText');
    const progressText = document.getElementById('gmcProgressText');

    if (loadingText) loadingText.textContent = message;
    if (progressText && progress) progressText.textContent = progress;
}

// Hàm scroll mượt về đầu trang
function scrollToTopSmooth() {
    // Sử dụng smooth scroll nếu browser hỗ trợ
    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    } else {
        // Fallback cho browser cũ - scroll animation thủ công
        const scrollToTop = () => {
            const c = document.documentElement.scrollTop || document.body.scrollTop;
            if (c > 0) {
                window.requestAnimationFrame(scrollToTop);
                window.scrollTo(0, c - c / 8);
            }
        };
        scrollToTop();
    }
    console.log('Đã scroll về đầu trang');
}

// Hàm xử lý reset form và scroll về đầu trang
function resetFormAndScrollToTop() {
    // Reset form như bình thường
    resetForm();

    // SỬA: Đảm bảo reset nút xác nhận sau khi reset form
    setTimeout(() => {
        const confirmButton = document.querySelector('.btn.btn-primary');
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.innerHTML = 'Xác nhận';
            confirmButton.removeAttribute('data-submitting');
            confirmButton.style.opacity = '1';
            confirmButton.style.cursor = 'pointer';

            console.log('✓ Đã đảm bảo reset nút xác nhận trong resetFormAndScrollToTop');
        }

        // Scroll về đầu trang sau khi reset
        scrollToTopSmooth();
    }, 100);

    console.log('Đã reset form và scroll về đầu trang với nút xác nhận được reset');
}


// Hàm reset form báo cáo dừng máy
function resetStopReportForm() {
    // Reset trạng thái nút CÓ/KHÔNG
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');

    if (btnYes) {
        btnYes.style.backgroundColor = 'white';
        btnYes.style.color = 'black';
        btnYes.style.border = '2px solid #ccc';
        btnYes.classList.remove('active');
    }

    if (btnNo) {
        btnNo.style.backgroundColor = 'white';
        btnNo.style.color = 'black';
        btnNo.style.border = '2px solid #ccc';
        btnNo.classList.remove('active');
    }

    // Ẩn form báo cáo dừng máy
    const machineReport = document.getElementById('machineReport');
    if (machineReport) {
        machineReport.style.display = 'none';
    }

    // Reset các biến trạng thái
    reasonCount = 1;
    machineStopStatusSelected = false;

    console.log('✓ Đã reset form báo cáo dừng máy');
}


// Cập nhật hàm xử lý click nút xác nhận để sử dụng loading
async function handleConfirmClickWithLoading(event) {
    console.log('=== CLICK NÚT XÁC NHẬN VỚI LOADING ===');
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const button = event.currentTarget;

    // Kiểm tra trạng thái đang gửi
    if (button.hasAttribute('data-submitting')) {
        console.log('Đang trong quá trình gửi, bỏ qua click này');
        return false;
    }

    // Đặt trạng thái đang gửi
    button.setAttribute('data-submitting', 'true');
    button.disabled = true;

    // Lưu nội dung gốc của nút
    const originalContent = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang gửi...';

    try {
        // Lưu thời gian kết thúc
        document.body.setAttribute('data-end-time', new Date().toISOString());

        // Gửi báo cáo với loading
        const result = await submitReportWithLoading();

        if (result) {
            console.log('Gửi báo cáo thành công với loading');
        }
    } catch (error) {
        console.error('Lỗi khi gửi báo cáo:', error);

        // Reset trạng thái khi có lỗi
        button.removeAttribute('data-submitting');
        button.disabled = false;
        button.innerHTML = originalContent;
    }

    return false;
}

// Thay thế hàm handleConfirmClick
window.handleConfirmClick = handleConfirmClickWithLoading;

//! ====================================================================================================================================
//! KHỞI TẠO LOADING CHO GMC
//! ====================================================================================================================================

// Khởi tạo loading khi trang đã tải xong
document.addEventListener('DOMContentLoaded', function () {
    console.log('Đã khởi tạo hệ thống loading cho báo cáo GMC');

    // Kiểm tra và cập nhật sự kiện cho nút xác nhận nếu cần
    setTimeout(() => {
        const confirmButton = document.querySelector('.btn.btn-primary');
        if (confirmButton && !confirmButton.hasAttribute('data-loading-setup')) {
            confirmButton.setAttribute('data-loading-setup', 'true');

            // Xóa sự kiện cũ và thêm sự kiện mới
            const newButton = confirmButton.cloneNode(true);
            confirmButton.parentNode.replaceChild(newButton, confirmButton);

            newButton.addEventListener('click', handleConfirmClickWithLoading);
            console.log('Đã cập nhật nút xác nhận với loading');
        }
    }, 2000);
});

console.log('✅ Đã tải module Loading cho báo cáo GMC');




//! ====================================================================================================================================
//! THÊM CHỨC NĂNG LỌC CHO BÁO CÁO DỪNG MÁY GMC
//! ====================================================================================================================================

// Cập nhật hàm setupGMCEvents để thêm bộ lọc cho báo cáo dừng máy
function setupStopReportFilter() {
    // Thêm event listener cho nút tìm kiếm báo cáo dừng máy
    const stopSearchButton = document.getElementById('btnStopSearch');
    if (stopSearchButton) {
        stopSearchButton.addEventListener('click', function () {
            filterStopReportList();
        });
    }

    // Thêm event listener cho input tìm kiếm (tìm kiếm realtime)
    const stopSearchInput = document.getElementById('stopSearchInput');
    if (stopSearchInput) {
        stopSearchInput.addEventListener('input', debounce(function () {
            filterStopReportList();
        }, 500));
    }

    // Thêm event listener cho bộ lọc máy của báo cáo dừng máy
    const stopMayFilter = document.getElementById('stopMayFilter');
    if (stopMayFilter) {
        stopMayFilter.addEventListener('change', function () {
            console.log('Bộ lọc máy báo cáo dừng máy thay đổi:', this.value);
            filterStopReportList();
        });
    }

    // Thiết lập bộ lọc ngày cho báo cáo dừng máy
    setupStopDateFilter();

    // Thiết lập phân trang cho báo cáo dừng máy
    setupStopPagination();
}

// Thiết lập bộ lọc ngày cho báo cáo dừng máy
function setupStopDateFilter() {
    const startStopDateFilter = document.getElementById('startStopDateFilter');
    const endStopDateFilter = document.getElementById('endStopDateFilter');
    const stopDateFilterButton = document.getElementById('btnStopDateFilter');
    const clearStopFilterButton = document.getElementById('btnClearStopDateFilter');

    // SỬA: Thay đổi type thành date thay vì datetime-local
    if (startStopDateFilter) {
        startStopDateFilter.type = 'date';
        startStopDateFilter.value = '';
    }

    if (endStopDateFilter) {
        endStopDateFilter.type = 'date';
        endStopDateFilter.value = '';
    }

    // Thêm sự kiện khi nhấn nút lọc
    if (stopDateFilterButton) {
        stopDateFilterButton.addEventListener('click', function () {
            console.log('Nút lọc ngày báo cáo dừng máy được click');

            if (startStopDateFilter && endStopDateFilter) {
                const startDate = new Date(startStopDateFilter.value);
                const endDate = new Date(endStopDateFilter.value);

                if (startStopDateFilter.value && endStopDateFilter.value && startDate > endDate) {
                    showNotification('Ngày bắt đầu không được lớn hơn ngày kết thúc', 'error');
                    return;
                }
            }
            filterStopReportList();
        });
    }

    // Thêm sự kiện cho nút xóa lọc
    if (clearStopFilterButton) {
        clearStopFilterButton.addEventListener('click', function () {
            console.log('Nút xóa lọc báo cáo dừng máy được click');

            if (startStopDateFilter) {
                startStopDateFilter.value = '';
            }

            if (endStopDateFilter) {
                endStopDateFilter.value = '';
            }

            // Reset bộ lọc máy
            const stopMayFilter = document.getElementById('stopMayFilter');
            if (stopMayFilter) {
                stopMayFilter.value = '';
            }

            // Reset tìm kiếm
            const stopSearchInput = document.getElementById('stopSearchInput');
            if (stopSearchInput) {
                stopSearchInput.value = '';
            }

            // Lọc lại danh sách với điều kiện mặc định
            stopReportList.filteredData = [...stopReportList.data];
            stopReportList.currentPage = 1;
            renderStopReportList();

            showNotification('Đã xóa tất cả điều kiện lọc báo cáo dừng máy', 'success');
        });
    }
}

// Hàm lọc danh sách báo cáo dừng máy
function filterStopReportList() {
    const stopSearchInput = document.getElementById('stopSearchInput');
    const stopMayFilter = document.getElementById('stopMayFilter');
    const startStopDateFilter = document.getElementById('startStopDateFilter');
    const endStopDateFilter = document.getElementById('endStopDateFilter');

    // Lấy giá trị tìm kiếm
    const searchText = stopSearchInput ? stopSearchInput.value.trim().toLowerCase() : '';
    const mayValue = stopMayFilter ? stopMayFilter.value : '';
    const startDateValue = startStopDateFilter ? startStopDateFilter.value : '';
    const endDateValue = endStopDateFilter ? endStopDateFilter.value : '';

    console.log('Bắt đầu lọc báo cáo dừng máy với:', {
        searchText,
        may: mayValue,
        từNgày: startDateValue,
        đếnNgày: endDateValue
    });

    // SỬA: Đơn giản hóa xử lý ngày - chỉ so sánh ngày, không thời gian
    let startDate = null;
    let endDate = null;

    if (startDateValue) {
        startDate = startDateValue; // Giữ dạng YYYY-MM-DD để so sánh
        console.log('Từ ngày:', startDate);
    }

    if (endDateValue) {
        endDate = endDateValue; // Giữ dạng YYYY-MM-DD để so sánh
        console.log('Đến ngày:', endDate);
    }

    // Lọc dữ liệu
    stopReportList.filteredData = stopReportList.data.filter(report => {
        // Lọc theo máy
        if (mayValue && report.may !== mayValue) {
            return false;
        }

        // SỬA: Lọc theo ngày đơn giản - dựa vào ngày từ thời gian dừng máy
        if (startDate || endDate) {
            let reportDateStr = '';

            // Lấy ngày từ thời gian dừng máy
            if (report.thoi_gian_dung) {
                try {
                    const date = new Date(report.thoi_gian_dung);
                    if (!isNaN(date.getTime())) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        reportDateStr = `${year}-${month}-${day}`;
                    }
                } catch (e) {
                    console.error('Lỗi parse ngày:', e);
                }
            }

            // Nếu không có ngày hợp lệ và đang có điều kiện lọc ngày
            if (!reportDateStr) {
                if (startDate || endDate) {
                    console.log(`Bỏ qua báo cáo dừng máy ${report.id || 'unknown'} do không có ngày hợp lệ`);
                    return false;
                }
            } else {
                // Kiểm tra từ ngày
                if (startDate && reportDateStr < startDate) {
                    return false;
                }

                // Kiểm tra đến ngày
                if (endDate && reportDateStr > endDate) {
                    return false;
                }
            }
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchText) {
            const searchableText = [
                report.so_phieu_cat_giay || '',
                report.so_ws || report.worksheet || '',
                report.ly_do || '',
                report.ly_do_khac || '',
                report.nguoi_thuc_hien || '',
                report.ghi_chu || '',
                report.may || ''
            ].join(' ').toLowerCase();

            return searchableText.includes(searchText);
        }

        return true;
    });

    // Reset về trang đầu tiên sau khi lọc
    stopReportList.currentPage = 1;

    console.log(`Kết quả lọc báo cáo dừng máy: ${stopReportList.filteredData.length}/${stopReportList.data.length} bản ghi`);

    // Hiển thị kết quả lọc
    renderStopReportList();

    // Nếu không có kết quả, hiển thị thông báo
    if (stopReportList.filteredData.length === 0) {
        showNotification('Không tìm thấy báo cáo dừng máy nào phù hợp với điều kiện lọc', 'warning');
    }
}

// Thiết lập phân trang cho báo cáo dừng máy
function setupStopPagination() {
    // Nút trang đầu
    const firstStopPageBtn = document.getElementById('firstStopPage');
    if (firstStopPageBtn) {
        firstStopPageBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (stopReportList.currentPage > 1) {
                stopReportList.currentPage = 1;
                renderStopReportList();
            }
        });
    }

    // Nút trang trước
    const prevStopPageBtn = document.getElementById('prevStopPage');
    if (prevStopPageBtn) {
        prevStopPageBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (stopReportList.currentPage > 1) {
                stopReportList.currentPage--;
                renderStopReportList();
            }
        });
    }

    // Nút trang sau
    const nextStopPageBtn = document.getElementById('nextStopPage');
    if (nextStopPageBtn) {
        nextStopPageBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (stopReportList.currentPage < stopReportList.totalPages) {
                stopReportList.currentPage++;
                renderStopReportList();
            }
        });
    }

    // Nút trang cuối
    const lastStopPageBtn = document.getElementById('lastStopPage');
    if (lastStopPageBtn) {
        lastStopPageBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (stopReportList.currentPage < stopReportList.totalPages) {
                stopReportList.currentPage = stopReportList.totalPages;
                renderStopReportList();
            }
        });
    }

    // Event listener cho dropdown số mục trên trang
    const itemsPerStopPageSelect = document.getElementById('itemsPerStopPage');
    if (itemsPerStopPageSelect) {
        itemsPerStopPageSelect.addEventListener('change', function () {
            stopReportList.itemsPerPage = parseInt(this.value);
            stopReportList.currentPage = 1;
            renderStopReportList();
        });
    }
}

const originalSetupGMCEvents = window.setupGMCEvents;
window.setupGMCEvents = function () {
    // Gọi hàm gốc
    if (originalSetupGMCEvents) {
        originalSetupGMCEvents.call(this);
    }

    // Thêm thiết lập filter cho báo cáo dừng máy
    setupStopReportFilter();

    console.log('Đã thiết lập bộ lọc cho báo cáo dừng máy GMC');
};



// HÀM MỚI: Gửi chỉ báó cáo dừng máy (không có WS)
async function submitStopReportOnly() {
    try {
        console.log('=== GỬI CHỈ BÁO CÁO DỪNG MÁY ===');

        // Kiểm tra ca, máy, và giờ làm việc
        const caElement = document.getElementById('ca');
        // const mayElement = document.getElementById('may');
        const gioLamViecElement = document.getElementById('gioLamViec'); // THÊM MỚI
        const maCaElement = document.getElementById('maCa'); // THÊM MỚI

        if (!caElement || !caElement.value) {
            showNotification('Vui lòng chọn ca làm việc', 'error');
            return;
        }

        // Lấy máy từ localStorage
        const machineId = getCurrentMachineId();
        const urlParams = new URLSearchParams(window.location.search);
        const machineName = urlParams.get('machineName');
        let mayName = '';

        if (machineName) {
            mayName = machineName;
        } else {
            const selectedMachine = localStorage.getItem('selectedMachine');
            if (selectedMachine) {
                try {
                    const machine = JSON.parse(selectedMachine);
                    mayName = machine.name || machine.id || '';
                } catch (e) {
                    console.error('Lỗi parse selectedMachine:', e);
                }
            }
        }

        if (!mayName) {
            showNotification('Vui lòng chọn máy', 'error');
            return;
        }

        if (!gioLamViecElement || !gioLamViecElement.value) {
            showNotification('Vui lòng chọn giờ làm việc', 'error');
            return;
        }


        // ===== TỰ ĐỘNG LẤY THÔNG TIN NGƯỜI DÙNG =====
        const currentUser = getCurrentUser();
        let nguoiThucHien = '';

        if (currentUser) {
            if (currentUser.fullname && currentUser.employee_id) {
                nguoiThucHien = `${currentUser.fullname} - ${currentUser.employee_id}`;
            } else if (currentUser.fullname) {
                nguoiThucHien = currentUser.fullname;
            } else if (currentUser.employee_id) {
                nguoiThucHien = currentUser.employee_id;
            } else {
                nguoiThucHien = currentUser.username || 'Unknown User';
            }
            console.log('✓ Người thực hiện dừng máy:', nguoiThucHien);
        }


        // Thu thập dữ liệu các lý do dừng máy
        const stopReasons = collectStopReasons();

        if (stopReasons.length === 0) {
            showNotification('Vui lòng thêm ít nhất một lý do dừng máy', 'warning');
            return;
        }

        console.log('Đã thu thập', stopReasons.length, 'lý do dừng máy');

        // Hiển thị loading
        showGMCLoading('Đang gửi báo cáo dừng máy...', 'Xử lý dữ liệu dừng máy');


        // Kiểm tra kết nối mạng
        if (!navigator.onLine) {
            // Lưu tất cả lý do dừng máy vào bộ nhớ chờ
            for (let i = 0; i < stopReasons.length; i++) {
                const reason = stopReasons[i];

                const stopReportData = {
                    ca: caElement.value,
                    gio_lam_viec: gioLamViecElement.value,
                    ma_ca: maCaElement.value,
                    nguoi_thuc_hien: nguoiThucHien,
                    may: mayName,
                    so_phieu_cat_giay: '',
                    so_ws: '',
                    thu_tu_cuon: '',
                    ly_do: reason.lyDo,
                    ly_do_khac: reason.lyDoKhac,
                    thoi_gian_dung: reason.thoiGianDung,
                    thoi_gian_chay_lai: reason.thoiGianChayLai,
                    thoi_gian_dung_may: reason.thoiGianDungMay,
                    ghi_chu: reason.lyDoKhac || ''
                };

                const offlineReport = {
                    id: Date.now() + Math.random() + i,
                    type: 'stop_report',
                    data: stopReportData,
                    endpoint: '/api/bao-cao-gmc/dung-may/submit',
                    timestamp: new Date().toISOString(),
                    machineId: getCurrentMachineId()
                };

                await saveToOfflineQueue(offlineReport);
            }

            updateGMCLoadingText('Không có mạng - Đã lưu vào bộ nhớ chờ!', 'Sẽ gửi khi có mạng');
            await new Promise(resolve => setTimeout(resolve, 1500));

            hideGMCLoading();
            showNotification(`Không có mạng - Đã lưu ${stopReasons.length} báo cáo dừng máy vào bộ nhớ chờ!`, 'warning');

            // Reset form như bình thường
            resetFormAndScrollToTop();
            return { success: true, offline: true };
        }


        // Gửi từng lý do dừng máy
        const results = [];
        for (let i = 0; i < stopReasons.length; i++) {
            const reason = stopReasons[i];

            const stopReportData = {
                ca: caElement.value,
                gio_lam_viec: gioLamViecElement.value, // THÊM MỚI
                ma_ca: maCaElement.value, // THÊM MỚI
                nguoi_thuc_hien: nguoiThucHien,
                may: mayName,
                so_phieu_cat_giay: '',
                so_ws: '',
                thu_tu_cuon: '',
                ly_do: reason.lyDo,
                ly_do_khac: reason.lyDoKhac,
                thoi_gian_dung: reason.thoiGianDung,
                thoi_gian_chay_lai: reason.thoiGianChayLai,
                thoi_gian_dung_may: reason.thoiGianDungMay,
                ghi_chu: reason.lyDoKhac || ''
            };


            const response = await fetch('/api/bao-cao-gmc/dung-may/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stopReportData),
            });

            if (!response.ok) {
                throw new Error(`Lỗi khi gửi lý do dừng máy ${i + 1}`);
            }

            const result = await response.json();
            results.push(result);
        }

        // Hoàn thành
        updateGMCLoadingText('Hoàn tất gửi báo cáo dừng máy!', 'Đang reset form...');

        setTimeout(() => {
            hideGMCLoading();
            showNotification(`Đã gửi thành công ${results.length} báo cáo dừng máy!`, 'success');

            // Chỉ reset phần dừng máy, không reset form GMC
            resetOnlyStopMachineForm();
        }, 1000);

    } catch (error) {
        console.error('Lỗi khi gửi báo cáo dừng máy:', error);
        hideGMCLoading();
        showNotification('Lỗi khi gửi báo cáo dừng máy: ' + error.message, 'error');
    }
}

// HÀM MỚI: Thu thập dữ liệu các lý do dừng máy
function collectStopReasons() {
    const stopReasons = [];
    const stopBoxes = document.querySelectorAll('.stop-reason-box');

    stopBoxes.forEach(box => {
        const reasonValue = box.querySelector('.reason-value')?.value;
        const otherReason = box.querySelector('.other-reason-input')?.value || '';
        const stopTime = box.querySelector('.stop-time-input')?.value;
        const resumeTime = box.querySelector('.resume-time-input')?.value;
        const duration = box.querySelector('.duration-display')?.value || '';

        if (reasonValue && stopTime && resumeTime) {
            stopReasons.push({
                lyDo: reasonValue,
                lyDoKhac: otherReason,
                thoiGianDung: stopTime,
                thoiGianChayLai: resumeTime,
                thoiGianDungMay: duration
            });
        }
    });

    return stopReasons;
}

// HÀM MỚI: Reset chỉ phần dừng máy
function resetOnlyStopMachineForm() {
    // Reset các nút CÓ/KHÔNG
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const machineReport = document.getElementById('machineReport');
    const submitStopOnlyButton = document.getElementById('submitStopOnlyButton');

    if (btnYes) {
        btnYes.className = btnYes.className.replace(/\b(default|active)\b/g, '') + ' default';
    }

    if (btnNo) {
        btnNo.className = btnNo.className.replace(/\b(default|active)\b/g, '') + ' default';
    }

    if (machineReport) {
        machineReport.style.display = 'none';
    }

    if (submitStopOnlyButton) {
        submitStopOnlyButton.style.display = 'none';
    }

    // Reset select lý do dừng máy
    const stopReason = document.getElementById('stopReason');
    if (stopReason) {
        stopReason.selectedIndex = 0;
    }

    // Xóa tất cả các khung lý do dừng máy
    const stopBoxes = document.querySelectorAll('.stop-reason-box');
    stopBoxes.forEach(box => box.remove());

    // Reset trạng thái
    machineStopStatusSelected = false;

    console.log('Đã reset form dừng máy');
}









//! ====================================================================================================================================
//! GIỜ LÀM VIỆC VÀ MÃ CA
//! ====================================================================================================================================
// THÊM HÀM MỚI: Chuyển đổi giờ làm việc thành mã ca
function convertGioLamViecToMaCa(gioLamViecValue) {
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

    return mapping[gioLamViecValue] || '';
}

// THÊM HÀM MỚI: Chuyển đổi mã ca thành text giờ làm việc
function convertMaCaToGioText(maCa) {
    const mapping = {
        'A': '6H - 14H',
        'B': '14H - 22H',
        'C': '22H - 6H',
        'D': '10H - 22H',
        'A1': '6H - 18H',
        'B1': '18H - 6H',
        'AB': '7H - 16H',
        'AB-': '7H - 15H',
        'AB+': '7H - 17H',
        'HC': '8H - 17H'
    };

    return mapping[maCa] || maCa;
}


// HÀM DEBUG CHI TIẾT
function debugConfirmButtonDetailed() {
    console.log('=== DEBUG CHI TIẾT NÚT XÁC NHẬN ===');

    // Tìm nút bằng nhiều cách
    const confirmButton = document.getElementById('confirmButton');
    const primaryButton = document.querySelector('.btn.btn-primary');

    console.log('getElementById("confirmButton"):', confirmButton);
    console.log('querySelector(".btn.btn-primary"):', primaryButton);

    if (confirmButton) {
        const rect = confirmButton.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(confirmButton);

        console.log('Thông tin nút xác nhận:', {
            id: confirmButton.id,
            classes: confirmButton.className,
            innerHTML: confirmButton.innerHTML,
            style_display: confirmButton.style.display,
            computed_display: computedStyle.display,
            computed_visibility: computedStyle.visibility,
            computed_opacity: computedStyle.opacity,
            rect: {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left
            },
            parentElement: confirmButton.parentElement?.tagName,
            offsetParent: confirmButton.offsetParent
        });

        // Kiểm tra có bị che bởi element khác không
        const elementAtPoint = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        console.log('Element tại vị trí nút:', elementAtPoint);

    } else {
        console.log('❌ Không tìm thấy nút xác nhận');
    }

    // Kiểm tra điều kiện
    const shouldShow = checkConfirmButtonConditions();
    console.log('Điều kiện hiển thị nút:', shouldShow);

    console.log('=====================================');
}

// Gọi debug khi cần
window.debugConfirmButton = debugConfirmButtonDetailed;



// Hàm để xóa tất cả dữ liệu đã lưu của tất cả máy (tùy chọn)
function clearAllSavedFormData() {
    if (confirm('Bạn có chắc muốn xóa tất cả dữ liệu form đã lưu của tất cả máy?')) {
        // Lấy tất cả keys trong localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('gmcFormData_machine_')) {
                keysToRemove.push(key);
            }
        }

        // Xóa tất cả
        keysToRemove.forEach(key => localStorage.removeItem(key));

        showNotification(`Đã xóa dữ liệu đã lưu của ${keysToRemove.length} máy`, 'success');
        console.log(`Đã xóa ${keysToRemove.length} bộ dữ liệu form đã lưu`);
    }
}

// Expose function ra global để có thể gọi từ console nếu cần
window.clearAllSavedFormData = clearAllSavedFormData;











//! ====================================================================================================================================
//! HỆ THỐNG BỘ NHỚ CHỜ OFFLINE
//! ====================================================================================================================================

// Lưu báo cáo vào bộ nhớ chờ
async function saveToOfflineQueue(reportData) {
    try {
        console.log('🔄 Đang lưu báo cáo vào bộ nhớ chờ offline...');
        console.log('Dữ liệu báo cáo:', reportData);

        // Lấy queue hiện tại
        let currentQueue = [];
        try {
            const queueData = localStorage.getItem('gmcOfflineQueue');
            if (queueData) {
                currentQueue = JSON.parse(queueData);
                if (!Array.isArray(currentQueue)) {
                    currentQueue = [];
                }
            }
        } catch (parseError) {
            console.warn('Lỗi parse queue cũ, tạo queue mới:', parseError);
            currentQueue = [];
        }

        // Validate dữ liệu trước khi lưu
        if (!reportData || !reportData.data) {
            throw new Error('Dữ liệu báo cáo không hợp lệ');
        }

        // Tạo unique ID mới
        const uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // Chuẩn bị dữ liệu offline
        const offlineReport = {
            id: uniqueId,
            type: reportData.type || 'full_report',
            data: reportData.data,
            endpoint: reportData.endpoint || '/api/bao-cao-gmc/submit',
            timestamp: new Date().toISOString(),
            machineId: getCurrentMachineId() || 'unknown',
            status: 'pending' // Trạng thái chờ gửi
        };

        if (!offlineReport.data || Object.keys(offlineReport.data).length === 0) {
            throw new Error('Dữ liệu báo cáo không hợp lệ');
        }

        console.log('Báo cáo offline đã chuẩn bị:', offlineReport);

        // Thêm báo cáo mới vào queue
        currentQueue.push(offlineReport);

        // Lưu lại vào localStorage
        localStorage.setItem('gmcOfflineQueue', JSON.stringify(currentQueue));

        console.log('✅ Đã lưu báo cáo vào bộ nhớ chờ với ID:', uniqueId);
        console.log('Tổng số báo cáo chờ:', currentQueue.length);

        // Cập nhật hiển thị số lượng báo cáo chờ
        updateOfflineQueueDisplay();

        return true;

    } catch (error) {
        console.error('❌ Lỗi khi lưu vào bộ nhớ chờ:', error);
        throw error;
    }
}

// Lấy danh sách báo cáo chờ
function getOfflineQueue() {
    try {
        const queueData = localStorage.getItem('gmcOfflineQueue');
        if (!queueData) {
            console.log('📭 Không có dữ liệu queue trong localStorage');
            return [];
        }

        const parsedQueue = JSON.parse(queueData);
        if (!Array.isArray(parsedQueue)) {
            console.warn('⚠️ Dữ liệu queue không phải array, reset queue');
            localStorage.removeItem('gmcOfflineQueue');
            return [];
        }

        console.log(`📋 Đọc được ${parsedQueue.length} báo cáo từ offline queue`);
        return parsedQueue;
    } catch (error) {
        console.error('❌ Lỗi khi đọc bộ nhớ chờ:', error);
        // Xóa dữ liệu lỗi
        localStorage.removeItem('gmcOfflineQueue');
        return [];
    }
}

// Xóa báo cáo khỏi bộ nhớ chờ
function removeFromOfflineQueue(reportId) {
    try {
        const currentQueue = getOfflineQueue();
        const updatedQueue = currentQueue.filter(report => report.id !== reportId);

        localStorage.setItem('gmcOfflineQueue', JSON.stringify(updatedQueue));

        console.log('✓ Đã xóa báo cáo khỏi bộ nhớ chờ:', reportId);

        // Cập nhật hiển thị
        updateOfflineQueueDisplay();

    } catch (error) {
        console.error('Lỗi khi xóa khỏi bộ nhớ chờ:', error);
    }
}

// Gửi tất cả báo cáo chờ
async function processOfflineQueue() {
    const queue = getOfflineQueue();

    if (queue.length === 0) {
        console.log('Không có báo cáo nào trong bộ nhớ chờ');
        return;
    }

    console.log(`🚀 Bắt đầu gửi ${queue.length} báo cáo từ bộ nhớ chờ`);

    let successCount = 0;
    let failCount = 0;
    const successIds = [];

    for (const report of queue) {
        try {
            console.log(`📤 Đang gửi báo cáo offline: ${report.id}`);
            console.log('Endpoint:', report.endpoint);
            console.log('Data preview:', {
                batDau: report.data.batDau ? Object.keys(report.data.batDau) : 'N/A',
                ketThuc: report.data.ketThuc ? Object.keys(report.data.ketThuc) : 'N/A'
            });

            const response = await fetch(report.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify(report.data),
            });

            console.log(`Response status: ${response.status}`);

            if (response.ok) {
                const result = await response.json();
                console.log(`✅ Gửi thành công báo cáo offline: ${report.id}`, result);

                // Đánh dấu để xóa khỏi queue
                successIds.push(report.id);
                successCount++;
            } else {
                const errorText = await response.text();
                console.error(`❌ Gửi thất bại báo cáo offline: ${report.id}, Status: ${response.status}, Error: ${errorText}`);
                failCount++;
            }

        } catch (error) {
            failCount++;
            console.error(`❌ Lỗi khi gửi báo cáo offline ${report.id}:`, error);
        }
    }

    // Xóa các báo cáo đã gửi thành công khỏi queue
    if (successIds.length > 0) {
        try {
            const updatedQueue = queue.filter(report => !successIds.includes(report.id));
            localStorage.setItem('gmcOfflineQueue', JSON.stringify(updatedQueue));
            console.log(`🧹 Đã xóa ${successIds.length} báo cáo thành công khỏi queue`);
        } catch (cleanupError) {
            console.error('Lỗi khi dọn dẹp queue:', cleanupError);
        }
    }


    if (response.ok) {
        const result = await response.json();
        console.log(`✅ Gửi thành công báo cáo offline: ${report.id}`, result);

        // LƯU ID để tracking báo cáo đã được tạo
        if (result && result.id) {
            try {
                let processedIds = JSON.parse(localStorage.getItem('processedOfflineIds') || '[]');
                processedIds.push(result.id);
                localStorage.setItem('processedOfflineIds', JSON.stringify(processedIds));
                console.log(`💾 Đã lưu ID báo cáo để tracking: ${result.id}`);
            } catch (trackingError) {
                console.warn('Lỗi khi lưu tracking ID:', trackingError);
            }
        }

        // Đánh dấu để xóa khỏi queue
        successIds.push(report.id);
        successCount++;
    } else {
        const errorText = await response.text();
        console.error(`❌ Gửi thất bại báo cáo offline: ${report.id}, Status: ${response.status}, Error: ${errorText}`);
        failCount++;
    }


    // Cập nhật hiển thị
    updateOfflineQueueDisplay();

    // Hiển thị kết quả
    if (successCount > 0) {
        showNotification(`✅ Đã gửi thành công ${successCount} báo cáo từ bộ nhớ chờ!`, 'success');

        // FORCE RELOAD danh sách báo cáo với cache bust
        setTimeout(() => {
            console.log('🔄 Bắt đầu force reload danh sách báo cáo với cache bust...');

            // Reload danh sách báo cáo GMC chính với cache bust
            if (typeof loadReportList === 'function') {
                // Thêm timestamp để force reload
                const originalUrl = '/api/bao-cao-gmc/list?exclude_stop_only=true';
                const cacheBustUrl = originalUrl + '&_=' + Date.now();

                fetch(cacheBustUrl)
                    .then(response => response.json())
                    .then(() => {
                        loadReportList();
                        console.log('✅ Đã force reload danh sách báo cáo GMC');
                    })
                    .catch(error => {
                        console.error('Lỗi khi force reload:', error);
                        loadReportList(); // Fallback
                    });
            }

            // Reload danh sách báo cáo dừng máy nếu có
            if (typeof loadMachineStopReportList === 'function') {
                loadMachineStopReportList();
            }

            console.log('🔄 Đã force reload tất cả danh sách báo cáo sau khi xử lý offline queue');
        }, 2000);
    }

    if (failCount > 0) {
        showNotification(`⚠️ ${failCount} báo cáo vẫn chưa gửi được, sẽ thử lại sau`, 'warning');
    }

    console.log(`🏁 Hoàn thành xử lý queue: ${successCount} thành công, ${failCount} thất bại`);
}




// Hàm reload tất cả danh sách báo cáo
function forceReloadAllReportLists() {
    console.log('🔄 Đang force reload tất cả danh sách báo cáo...');

    // Reload danh sách báo cáo GMC chính
    if (typeof loadReportList === 'function') {
        loadReportList();
    }

    // Reload danh sách báo cáo dừng máy
    if (typeof loadMachineStopReportList === 'function') {
        loadMachineStopReportList();
    }
}




// Cập nhật hiển thị số lượng báo cáo chờ
function updateOfflineQueueDisplay() {
    const queue = getOfflineQueue();
    const count = queue.length;

    // Tìm hoặc tạo element hiển thị
    let displayElement = document.getElementById('offlineQueueDisplay');

    if (!displayElement) {
        displayElement = document.createElement('div');
        displayElement.id = 'offlineQueueDisplay';
        displayElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 9999;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            cursor: pointer;
        `;

        displayElement.onclick = function () {
            if (navigator.onLine) {
                if (confirm(`Có ${count} báo cáo đang chờ gửi. Gửi ngay bây giờ?`)) {
                    processOfflineQueue();
                }
            } else {
                showNotification('Chưa có kết nối mạng để gửi báo cáo', 'warning');
            }
        };

        document.body.appendChild(displayElement);
    }

    if (count > 0) {
        displayElement.textContent = `📋 ${count} báo cáo chờ gửi`;
        displayElement.style.display = 'block';
    } else {
        displayElement.style.display = 'none';
    }
}

// Theo dõi trạng thái kết nối mạng
function setupNetworkMonitoring() {
    // Kiểm tra trạng thái mạng khi trang tải
    isOnline = navigator.onLine;
    console.log('🌐 Trạng thái mạng ban đầu:', isOnline ? 'Online' : 'Offline');

    // Lắng nghe sự kiện online/offline
    window.addEventListener('online', function () {
        console.log('✅ Đã có kết nối mạng');
        isOnline = true;

        showNotification('Đã có kết nối mạng!', 'success');

        // Kiểm tra và gửi báo cáo chờ sau 3 giây
        setTimeout(() => {
            console.log('🔄 Kiểm tra và xử lý báo cáo chờ...');
            const queue = getOfflineQueue();
            if (queue.length > 0) {
                console.log(`📤 Có ${queue.length} báo cáo chờ, bắt đầu gửi...`);
                processOfflineQueue();
            } else {
                console.log('📭 Không có báo cáo chờ nào');
            }
        }, 3000);
    });

    window.addEventListener('offline', function () {
        console.log('❌ Mất kết nối mạng');
        isOnline = false;
        showNotification('Mất kết nối mạng - Báo cáo sẽ lưu vào bộ nhớ chờ', 'warning');
    });

    // Hiển thị trạng thái ban đầu
    updateOfflineQueueDisplay();

    // THÊM: Kiểm tra định kỳ trạng thái mạng và queue (mỗi 30 giây)
    setInterval(async () => {
        // Kiểm tra network bằng cách ping đến server
        let actualOnlineStatus = navigator.onLine;

        if (actualOnlineStatus) {
            try {
                // Test kết nối thực tế đến server
                const testResponse = await fetch('/api/bao-cao-gmc/list?limit=1', {
                    method: 'GET',
                    headers: { 'Cache-Control': 'no-cache' },
                    timeout: 5000
                });
                actualOnlineStatus = testResponse.ok;
            } catch (error) {
                console.log('Network test failed:', error);
                actualOnlineStatus = false;
            }
        }

        if (actualOnlineStatus !== isOnline) {
            console.log(`🔄 Trạng thái mạng thay đổi: ${isOnline ? 'Online' : 'Offline'} -> ${actualOnlineStatus ? 'Online' : 'Offline'}`);
            isOnline = actualOnlineStatus;

            if (isOnline) {
                // Vừa có mạng trở lại
                const queue = getOfflineQueue();
                if (queue.length > 0) {
                    console.log(`📤 Phát hiện có mạng trở lại, xử lý ${queue.length} báo cáo chờ...`);
                    setTimeout(() => processOfflineQueue(), 2000);
                }
            }
        }

        // Cập nhật hiển thị queue
        updateOfflineQueueDisplay();
    }, 30000);

    console.log('✅ Đã thiết lập theo dõi kết nối mạng');
}




// Kiểm tra và xử lý tìm kiếm khi offline
async function handleOfflineDataSearch(soPhieu, thuTu) {
    if (navigator.onLine) {
        // Có mạng - tìm kiếm bình thường
        return await searchPhieuCatData(soPhieu, thuTu);
    } else {
        // Không có mạng - hiển thị thông báo và cho phép nhập thủ công
        showNotification('Không có mạng - Vui lòng nhập thông tin thủ công', 'warning');

        // Clear các trường sẽ được tự động điền
        const fieldsToDisable = ['ws', 'maVatTu', 'khachhang', 'kho', 'dai', 'soto'];
        fieldsToDisable.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = '';
                // Không disable để user có thể nhập thủ công
                element.placeholder = 'Nhập thủ công (không có mạng)';
            }
        });

        return null;
    }
}




// Hàm tính ngày phụ
function calculateNgayPhu(thoiGianKetThuc) {
    if (!thoiGianKetThuc) return '';

    try {
        const endTime = new Date(thoiGianKetThuc);
        const hours = endTime.getHours();
        const minutes = endTime.getMinutes();

        // Nếu thời gian kết thúc từ 0h đến 6h10 sáng
        if (hours < 6 || (hours === 6 && minutes <= 10)) {
            // Ngày phụ = Ngày - 1
            const ngayPhu = new Date(endTime);
            ngayPhu.setDate(ngayPhu.getDate() - 1);

            const day = String(ngayPhu.getDate()).padStart(2, '0');
            const month = String(ngayPhu.getMonth() + 1).padStart(2, '0');
            const year = ngayPhu.getFullYear();

            return `${day}/${month}/${year}`;
        } else {
            // Giữ nguyên ngày
            const day = String(endTime.getDate()).padStart(2, '0');
            const month = String(endTime.getMonth() + 1).padStart(2, '0');
            const year = endTime.getFullYear();

            return `${day}/${month}/${year}`;
        }
    } catch (error) {
        console.error('Lỗi khi tính ngày phụ:', error);
        return '';
    }
}