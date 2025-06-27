//! =================================================================
//! PHẦN PHIẾU SANG CUỘN
//! =================================================================

// Thêm mã hàng nhập
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('sc-them-mhn').addEventListener('click', function () {
        addMaHangNhapField();
    });
});

// Hàm thêm field mã hàng nhập
function addMaHangNhapField() {
    const container = document.getElementById('sc-nhap-container');
    const groups = container.querySelectorAll('.sc-nhap-group');
    const newIndex = groups.length + 1;

    const groupDiv = document.createElement('div');
    groupDiv.className = 'sc-nhap-group';

    groupDiv.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="sc-stt-nhap-${newIndex}">STT Nhập</label>
                <input type="text" id="sc-stt-nhap-${newIndex}" class="sc-stt-nhap">
            </div>
            <div class="form-group">
                <label for="sc-mhn-${newIndex}">Mã hàng nhập</label>
                <input type="text" id="sc-mhn-${newIndex}" class="sc-mhn">
            </div>
            <div class="form-group">
                <label for="sc-sl-nhap-${newIndex}">SL nhập</label>
                <input type="text" id="sc-sl-nhap-${newIndex}" class="sc-sl-nhap">
            </div>
            <div class="form-group">
                <label for="sc-tl-nhap-${newIndex}">Trọng lượng nhập</label>
                <input type="text" id="sc-tl-nhap-${newIndex}" class="sc-tl-nhap">
            </div>
        </div>
    `;

    container.appendChild(groupDiv);
}

// Hàm submit phiếu sang cuộn
async function submitPhieuSangCuon() {
    // Lấy dữ liệu cơ bản của phiếu
    const soPhieu = getFormValue('sc-so-phieu');
    if (!soPhieu) {
        alert('Vui lòng nhập số phiếu!');
        return;
    }

    const ngayCT = getFormValue('sc-ngay-ct', new Date().toISOString().split('T')[0]);
    const soLSX = getFormValue('sc-so-lsx');
    const dienGiai = getFormValue('sc-dien-giai');
    const khachHang = getFormValue('sc-khach-hang');
    const sanPham = getFormValue('sc-san-pham');
    const maPhu = getFormValue('sc-ma-phu');

    // Lấy thông tin xuất
    let sttXuat = getFormValue('sc-stt-xuat');
    const mhkx = getFormValue('sc-mhkx');
    const dlx = getFormValue('sc-dlx');
    const slXuat = getFormValue('sc-sl-xuat');
    const tlXuat = getFormValue('sc-tl-xuat');

    // Lấy thông tin nhập
    const maNhaps = [];
    const sttNhapElements = document.querySelectorAll('.sc-stt-nhap');
    const mhnElements = document.querySelectorAll('.sc-mhn');
    const slNhapElements = document.querySelectorAll('.sc-sl-nhap');
    const tlNhapElements = document.querySelectorAll('.sc-tl-nhap');

    for (let i = 0; i < mhnElements.length; i++) {
        if (mhnElements[i].value.trim() !== '') {
            maNhaps.push({
                sttNhap: sttNhapElements[i].value.trim() || (i + 1).toString(), // Tự động đánh số STT nhập nếu không có
                maHangNhap: mhnElements[i].value.trim(),
                slNhap: slNhapElements[i].value.trim(),
                tlNhap: tlNhapElements[i].value.trim()
            });
        }
    }

    // Kiểm tra phải có ít nhất 2 mã hàng nhập
    if (maNhaps.length < 2) {
        alert('Cần có ít nhất 2 mã hàng nhập!');
        return;
    }

    // Nếu không có STT xuất, đánh số 1
    if (!sttXuat) {
        sttXuat = "1";
    }

    // Lấy thông tin tồn kho
    const tonSL = getFormValue('sc-ton-sl');
    const tonTL = getFormValue('sc-ton-tl');
    const tonTT = getFormValue('sc-ton-tamtinh');

    // Tạo đối tượng phiếu
    const phieu = {
        id: Date.now().toString(), // ID duy nhất
        soPhieu,
        ngayCT,
        soLSX,
        dienGiai,
        khachHang,
        sanPham,
        maPhu,
        sttXuat,
        mhkx,
        dlx,
        slXuat,
        tlXuat,
        maNhaps,
        tonSL,
        tonTL,
        tonTT
    };

    try {
        // Kiểm tra phiếu trùng
        const existingPhieuList = await PhieuSangCuonAPI.getList();
        const isDuplicate = existingPhieuList.some(p => p.soPhieu === soPhieu);

        if (isDuplicate) {
            // Nếu phiếu trùng, khởi tạo xử lý phiếu trùng
            duplicateHandling.duplicates = [soPhieu];
            duplicateHandling.currentIndex = 0;
            duplicateHandling.newTickets = [phieu];
            duplicateHandling.ticketType = 'sc';
            duplicateHandling.skipped = false;

            // Reset form trước khi hiển thị dialog
            resetFormSangCuon();

            // Hiển thị dialog xác nhận
            showDuplicateDialog(soPhieu, 'sc');
        } else {
            // Nếu không trùng, lưu trực tiếp
            await PhieuSangCuonAPI.add(phieu);

            // Cập nhật danh sách và formula
            await loadPhieuSangCuonList();
            await convertSangCuonToFormula();

            // Reset form
            resetFormSangCuon();

            alert('Đã lưu phiếu sang cuộn thành công!');

            // Chuyển đến tab danh sách phiếu
            document.querySelector('#sang-cuon .sub-tab-btn[onclick="switchSubTab(\'sc-danhsach\')"]').click();
        }
    } catch (error) {
        console.error('Lỗi khi thêm phiếu sang cuộn:', error);
        alert('Có lỗi khi thêm phiếu sang cuộn: ' + error.message);
    }
}

// Hàm reset form phiếu sang cuộn
function resetFormSangCuon() {
    // Reset form
    document.getElementById('form-sc-them').reset();

    // Reset container mã hàng nhập về trạng thái ban đầu (chỉ 1 mã hàng nhập)
    document.getElementById('sc-nhap-container').innerHTML = `
        <div class="sc-nhap-group">
            <div class="form-row">
                <div class="form-group">
                    <label for="sc-stt-nhap-1">STT Nhập</label>
                    <input type="text" id="sc-stt-nhap-1" class="sc-stt-nhap">
                </div>
                <div class="form-group">
                    <label for="sc-mhn-1">Mã hàng nhập</label>
                    <input type="text" id="sc-mhn-1" class="sc-mhn">
                </div>
                <div class="form-group">
                    <label for="sc-sl-nhap-1">SL nhập</label>
                    <input type="text" id="sc-sl-nhap-1" class="sc-sl-nhap">
                </div>
                <div class="form-group">
                    <label for="sc-tl-nhap-1">Trọng lượng nhập</label>
                    <input type="text" id="sc-tl-nhap-1" class="sc-tl-nhap">
                </div>
            </div>
        </div>
    `;
}

/**
 * Phân tích và lưu dữ liệu phiếu sang cuộn
 * Sửa lỗi STT nhập - đảm bảo tăng dần liên tục qua các mã hàng khổ xuất
 */
function parseAndSaveSangCuonData(tbody) {
    // Lấy tất cả hàng (trừ hàng action)
    const rows = Array.from(tbody.querySelectorAll('tr:not(.action-row)'));
    if (rows.length === 0) {
        alert('Không có dữ liệu để xử lý!');
        return;
    }

    // Chuyển dữ liệu từ bảng thành cấu trúc dữ liệu phiếu
    const phieuData = [];
    let currentPhieu = null;
    let currentMHKX = null;

    // Bước 1: Phân tích dữ liệu từ bảng (logic hiện tại giữ nguyên)
    rows.forEach((row) => {
        const cells = Array.from(row.cells).map(cell => cell.textContent.trim());

        // Kiểm tra hàng có số phiếu (bắt đầu phiếu mới)
        if (cells[0] !== '') {
            // Tạo phiếu mới
            currentPhieu = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                soPhieu: cells[0],
                ngayCT: cells[1],
                soLSX: cells[2],
                dienGiai: cells[3],
                khachHang: cells[4],
                sanPham: cells[5],
                maPhu: cells[6],
                mhkxData: [],
                allMaNhaps: [] // Mảng phụ để theo dõi tất cả mã hàng nhập
            };

            phieuData.push(currentPhieu);
            currentMHKX = null; // Reset MHKX khi có phiếu mới
        }

        // Kiểm tra hàng có MHKX (STT xuất hoặc mã hàng khổ xuất có giá trị)
        if ((cells[7] !== '' || cells[8] !== '') && currentPhieu) {
            // Tạo MHKX mới
            currentMHKX = {
                sttXuat: cells[7],
                mhkx: cells[8],
                dlx: cells[9],
                slXuat: cells[10],
                tlXuat: cells[11],
                tonSL: cells[16],
                tonTL: cells[17],
                tonTT: cells[18],
                maNhaps: []
            };

            currentPhieu.mhkxData.push(currentMHKX);
        }

        // Kiểm tra hàng có mã hàng nhập
        if ((cells[12] !== '' || cells[13] !== '') && currentMHKX) {
            // Tạo mã hàng nhập mới
            const maNhap = {
                originalStt: cells[12], // Lưu STT gốc
                maHangNhap: cells[13],
                slNhap: cells[14],
                tlNhap: cells[15]
            };

            // Thêm vào MHKX hiện tại
            currentMHKX.maNhaps.push(maNhap);

            // Thêm vào danh sách tất cả mã hàng nhập của phiếu
            if (currentPhieu) {
                currentPhieu.allMaNhaps.push(maNhap);
            }
        }
    });

    // Bước 2: Chuẩn hóa STT (logic hiện tại giữ nguyên)
    phieuData.forEach(phieu => {
        // Đảm bảo STT xuất là liên tiếp (1, 2, 3, ...)
        phieu.mhkxData.forEach((mhkx, i) => {
            mhkx.sttXuat = (i + 1).toString();

            // Đảm bảo mỗi MHKX có ít nhất 2 mã hàng nhập
            while (mhkx.maNhaps.length < 2) {
                const dummyMaNhap = {
                    originalStt: '',
                    maHangNhap: '',
                    slNhap: '',
                    tlNhap: ''
                };

                mhkx.maNhaps.push(dummyMaNhap);
                phieu.allMaNhaps.push(dummyMaNhap);
            }
        });

        // Đánh số STT nhập liên tục cho toàn bộ phiếu
        phieu.allMaNhaps.forEach((maNhap, index) => {
            maNhap.sttNhap = (index + 1).toString();
        });
    });

    // Bước 3: Chuyển đổi cấu trúc dữ liệu để phù hợp với cấu trúc lưu trữ (logic hiện tại giữ nguyên)
    const processedPhieuList = [];

    phieuData.forEach(phieu => {
        // Kiểm tra nếu không có MHKX nào, tạo một cái mặc định
        if (phieu.mhkxData.length === 0) {
            const dummyMaNhap1 = {
                sttNhap: "1",
                maHangNhap: "",
                slNhap: "",
                tlNhap: ""
            };

            const dummyMaNhap2 = {
                sttNhap: "2",
                maHangNhap: "",
                slNhap: "",
                tlNhap: ""
            };

            phieu.mhkxData.push({
                sttXuat: "1",
                mhkx: "",
                dlx: "",
                slXuat: "",
                tlXuat: "",
                tonSL: "",
                tonTL: "",
                tonTT: "",
                maNhaps: [dummyMaNhap1, dummyMaNhap2]
            });
        }

        phieu.mhkxData.forEach(mhkx => {
            // Tạo phiếu cho lưu trữ
            const newPhieu = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                soPhieu: phieu.soPhieu,
                ngayCT: phieu.ngayCT,
                soLSX: phieu.soLSX,
                dienGiai: phieu.dienGiai,
                khachHang: phieu.khachHang,
                sanPham: phieu.sanPham,
                maPhu: phieu.maPhu,
                sttXuat: mhkx.sttXuat,
                mhkx: mhkx.mhkx,
                dlx: mhkx.dlx,
                slXuat: mhkx.slXuat,
                tlXuat: mhkx.tlXuat,
                maNhaps: mhkx.maNhaps.map(maNhap => ({
                    sttNhap: maNhap.sttNhap || "",
                    maHangNhap: maNhap.maHangNhap || "",
                    slNhap: maNhap.slNhap || "",
                    tlNhap: maNhap.tlNhap || ""
                })),
                tonSL: mhkx.tonSL,
                tonTL: mhkx.tonTL,
                tonTT: mhkx.tonTT
            };

            processedPhieuList.push(newPhieu);
        });
    });

    if (processedPhieuList.length === 0) {
        alert('Không tìm thấy phiếu hợp lệ trong dữ liệu!');
        return;
    }

    // Bước 4: Lưu dữ liệu với xử lý SCL bổ sung sau tích hợp
    saveScPasteDataWithSCLUpdate(processedPhieuList);

    // Sau khi lưu thành công, reset bảng dán
    clearScPaste();
}

/**
 * Hàm xử lý tích hợp: Lưu phiếu sang cuộn + Cập nhật SCL bổ sung sau
 */
async function saveScPasteDataWithSCLUpdate(processedPhieuList) {
    try {
        console.log('=== BẮT ĐẦU XỬ LÝ TÍCH HỢP PHIẾU SANG CUỘN + SCL BỔ SUNG SAU ===');

        // Bước 1: Xử lý và lưu dữ liệu phiếu sang cuộn (logic cũ)
        console.log('Bước 1: Xử lý dữ liệu phiếu sang cuộn...');
        await saveScPasteData(processedPhieuList);

        // Bước 2: Tạo formula từ phiếu sang cuộn đã xử lý
        console.log('Bước 2: Tạo formula từ phiếu sang cuộn...');
        await convertSangCuonToFormula();

        // Bước 3: Lấy dữ liệu formula mới tạo để cập nhật SCL
        console.log('Bước 3: Lấy dữ liệu formula để cập nhật SCL...');
        const formulaData = await getLatestSangCuonFormulaData(processedPhieuList);

        if (formulaData && formulaData.length > 0) {
            // Bước 4: Cập nhật báo cáo SCL bổ sung sau
            console.log('Bước 4: Cập nhật báo cáo SCL bổ sung sau...');
            await updateSCLSupplementaryReports(formulaData);
        } else {
            console.log('Không có dữ liệu formula để cập nhật SCL');
        }

        // Bước 5: Hoàn tất và thông báo
        console.log('=== HOÀN TẤT XỬ LÝ TÍCH HỢP ===');

        // Thông báo thành công
        // alert('Đã xử lý thành công dữ liệu phiếu sang cuộn và cập nhật báo cáo SCL bổ sung sau!');

        // Chuyển đến tab danh sách phiếu
        document.querySelector('#sang-cuon .sub-tab-btn[onclick="switchSubTab(\'sc-danhsach\')"]').click();

    } catch (error) {
        console.error('Lỗi trong quá trình xử lý tích hợp phiếu sang cuộn:', error);
        // alert('Có lỗi khi xử lý dữ liệu: ' + error.message);
    }
}

// Hàm lưu trực tiếp phiếu sang cuộn không có trùng lặp
async function saveSCTicketsDirectly(data) {
    try {
        // Lưu tất cả phiếu
        await Promise.all(data.map(phieu => PhieuSangCuonAPI.add(phieu)));

        // Cập nhật báo cáo SCL trùng khớp (logic hiện tại)
        await updateMatchingSCLReports(data);

        // Cập nhật danh sách và formula - mã hiện tại
        await loadPhieuSangCuonList();
        await convertSangCuonToFormula();

        // Thông báo - mã hiện tại
        alert('Đã lưu dữ liệu phiếu sang cuộn thành công!');
        document.querySelector('#sang-cuon .sub-tab-btn[onclick="switchSubTab(\'sc-danhsach\')"]').click();
    } catch (error) {
        console.error('Lỗi khi lưu phiếu sang cuộn:', error);
    }
}

/**
 * Xử lý SCL bổ sung sau khi lưu phiếu sang cuộn
 */
async function processSCLSupplementaryAfterSave(processedPhieuList) {
    console.log('=== BẮT ĐẦU XỬ LÝ SCL BỔ SUNG SAU ===');
    console.log('Số phiếu cần xử lý:', processedPhieuList.length);

    try {
        // Đợi để đảm bảo phiếu đã được lưu vào database
        console.log('Đợi database cập nhật...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Tạo lại formula từ dữ liệu vừa lưu
        console.log('Đang tạo lại formula...');
        await convertSangCuonToFormula();

        // Đợi thêm để formula được tạo
        await new Promise(resolve => setTimeout(resolve, 500));

        // Lấy dữ liệu formula mới tạo cho phiếu sang cuộn
        console.log('Đang lấy dữ liệu formula phiếu sang cuộn...');
        const formulaData = await getLatestSangCuonFormulaData(processedPhieuList);

        if (formulaData && formulaData.length > 0) {
            console.log(`Tìm thấy ${formulaData.length} formula để cập nhật SCL`);

            // Cập nhật báo cáo SCL bổ sung sau
            await updateSCLSupplementaryReports(formulaData);
            console.log('Đã hoàn tất cập nhật SCL bổ sung sau');
        } else {
            console.log('Không tìm thấy formula phù hợp để cập nhật SCL');
        }

    } catch (error) {
        console.error('Lỗi trong quá trình xử lý SCL bổ sung sau:', error);
        // Không throw error để không làm gián đoạn quá trình chính
    }
}

/**
 * Cập nhật báo cáo SCL bổ sung sau - duyệt từ trên xuống
 */
async function updateSCLSupplementaryReports(formulaData) {
    try {
        console.log('=== BẮT ĐẦU CẬP NHẬT SCL BỔ SUNG SAU ===');
        console.log('Dữ liệu formula để xử lý:', formulaData);

        // Bước 1: Lấy danh sách báo cáo SCL (sắp xếp giảm dần - mới nhất lên trên)
        const response = await fetch('/api/bao-cao-scl/list');
        if (!response.ok) {
            throw new Error('Không thể tải danh sách báo cáo SCL');
        }

        const sclReports = await response.json();
        console.log(`Đã tải ${sclReports.length} báo cáo SCL`);

        // Bước 2: Sắp xếp báo cáo theo thời gian tạo giảm dần (mới nhất lên trên)
        sclReports.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA; // Giảm dần
        });

        let updateCount = 0;
        let checkedCount = 0;
        const maxReportsToCheck = 100; // Giới hạn số báo cáo cần kiểm tra để tránh lag

        // Bước 3: Duyệt từ trên xuống (báo cáo mới nhất trước)
        for (let i = 0; i < Math.min(sclReports.length, maxReportsToCheck); i++) {
            const report = sclReports[i];
            checkedCount++;

            // Kiểm tra điều kiện phiếu bổ sung sau: các cột quan trọng trống
            const isSupplementaryReport = (
                (!report.ma_vat_tu || report.ma_vat_tu.trim() === '') ||
                (!report.worksheet || report.worksheet.trim() === '') ||
                (!report.khach_hang || report.khach_hang.trim() === '') ||
                (!report.dinh_luong || report.dinh_luong.trim() === '') ||
                (!report.kho_san_pham || report.kho_san_pham.trim() === '') ||
                (!report.kho_can_sang || report.kho_can_sang.trim() === '')
            );

            if (isSupplementaryReport) {
                console.log(`Phát hiện phiếu SCL bổ sung sau: ID ${report.id}, Số phiếu: ${report.so_phieu}, STT: ${report.thu_tu_cuon}`);

                // Tìm dữ liệu formula khớp
                const matchingFormula = formulaData.find(formula =>
                    formula.soPhieu === report.so_phieu &&
                    (formula.sttXuat === report.thu_tu_cuon ||
                        formula.thuTu === report.thu_tu_cuon ||
                        String(formula.sttXuat) === String(report.thu_tu_cuon) ||
                        String(formula.thuTu) === String(report.thu_tu_cuon))
                );

                if (matchingFormula) {
                    console.log(`Tìm thấy formula khớp cho báo cáo SCL ID ${report.id}`);

                    // Cập nhật báo cáo SCL với dữ liệu từ formula
                    const updateSuccess = await updateSingleSCLReport(report.id, matchingFormula, report);

                    if (updateSuccess) {
                        updateCount++;
                        console.log(`✅ Đã cập nhật báo cáo SCL ID ${report.id}`);
                    } else {
                        console.log(`❌ Lỗi khi cập nhật báo cáo SCL ID ${report.id}`);
                    }
                } else {
                    console.log(`Không tìm thấy formula khớp cho báo cáo SCL ID ${report.id} (${report.so_phieu}-${report.thu_tu_cuon})`);
                }
            }
        }

        console.log(`=== KẾT QUẢ CẬP NHẬT SCL BỔ SUNG SAU ===`);
        console.log(`- Đã kiểm tra: ${checkedCount}/${sclReports.length} báo cáo`);
        console.log(`- Đã cập nhật: ${updateCount} báo cáo bổ sung sau`);

        // Hiển thị thông báo cho người dùng
        if (updateCount > 0) {
            console.log(`Đã cập nhật thành công ${updateCount} báo cáo SCL bổ sung sau!`);
        }

    } catch (error) {
        console.error('Lỗi khi cập nhật SCL bổ sung sau:', error);
        throw error;
    }
}

/**
 * Cập nhật một báo cáo SCL cụ thể
 */
async function updateSingleSCLReport(reportId, formulaData, currentReport) {
    try {
        console.log(`Đang cập nhật báo cáo SCL ID ${reportId} với dữ liệu:`, formulaData);

        // Chuẩn bị dữ liệu cập nhật
        const updateData = prepareSCLUpdateData(formulaData, currentReport);

        if (Object.keys(updateData).length === 0) {
            console.log('Không có dữ liệu cần cập nhật');
            return true;
        }

        console.log('Dữ liệu cập nhật SCL:', updateData);

        // Gửi yêu cầu cập nhật tới API
        const response = await fetch(`/api/bao-cao-scl/update-formula/${reportId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Lỗi API khi cập nhật báo cáo SCL ID ${reportId}:`, errorText);
            return false;
        }

        const result = await response.json();
        console.log(`Kết quả cập nhật báo cáo SCL ID ${reportId}:`, result);

        return true;

    } catch (error) {
        console.error(`Lỗi khi cập nhật báo cáo SCL ID ${reportId}:`, error);
        return false;
    }
}

/**
 * Lấy dữ liệu formula mới tạo cho phiếu sang cuộn
 */
async function getLatestSangCuonFormulaData(processedPhieuList) {
    console.log('=== LẤY DỮ LIỆU FORMULA SANG CUỘN MỚI NHẤT ===');

    try {
        const response = await fetch('/api/sang-cuon/formula');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const allFormula = await response.json();
        console.log(`Đã lấy ${allFormula.length} formula từ API`);

        const matchingFormula = [];

        for (const phieu of processedPhieuList) {
            console.log(`Tìm formula cho phiếu: ${phieu.soPhieu}-${phieu.sttXuat}`);

            const formulaItem = allFormula.find(formula => {
                const sttMatch = (
                    formula.sttXuat === phieu.sttXuat ||
                    formula.thuTu === phieu.sttXuat ||
                    formula.sttXuat === parseInt(phieu.sttXuat) ||
                    formula.thuTu === parseInt(phieu.sttXuat) ||
                    String(formula.sttXuat) === String(phieu.sttXuat) ||
                    String(formula.thuTu) === String(phieu.sttXuat)
                );

                const match = formula.soPhieu === phieu.soPhieu && sttMatch;

                if (match) {
                    console.log(`✅ Tìm thấy formula khớp:`, {
                        soPhieu: formula.soPhieu,
                        sttXuat: formula.sttXuat,
                        thuTu: formula.thuTu,
                        mhkx: formula.mhkx
                    });
                }

                return match;
            });

            if (formulaItem) {
                matchingFormula.push(formulaItem);
            } else {
                console.log(`❌ Không tìm thấy formula cho: ${phieu.soPhieu}-${phieu.sttXuat}`);
            }
        }

        console.log(`Tổng cộng tìm thấy ${matchingFormula.length} formula khớp`);
        return matchingFormula;

    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu formula sang cuộn:', error);
        return [];
    }
}

/**
 * Chuẩn bị dữ liệu cập nhật cho SCL
 */
function prepareSCLUpdateData(formulaData, currentReport) {
    const updateData = {};

    // ===== CẬP NHẬT CÁC TRƯỜNG CƠ BẢN =====

    // Worksheet
    if ((!currentReport.worksheet || currentReport.worksheet === '') &&
        (formulaData.ws || formulaData.WS || formulaData.worksheet)) {
        updateData.worksheet = formulaData.ws || formulaData.WS || formulaData.worksheet;
    }

    // Mã vật tư (quan trọng - điều kiện xác định phiếu bổ sung sau)
    if ((!currentReport.ma_vat_tu || currentReport.ma_vat_tu === '') && formulaData.mhkx) {
        updateData.ma_vat_tu = formulaData.mhkx;
    }

    // Khách hàng
    if ((!currentReport.khach_hang || currentReport.khach_hang === '') &&
        (formulaData.khachHang || formulaData.maKH)) {
        updateData.khach_hang = formulaData.khachHang || formulaData.maKH;
    }

    // Định lượng
    if ((!currentReport.dinh_luong || currentReport.dinh_luong === '') &&
        (formulaData.dinhLuong || formulaData.dlXuat)) {
        updateData.dinh_luong = formulaData.dinhLuong || formulaData.dlXuat;
    }

    // ===== CẬP NHẬT THÔNG TIN KHỔ =====

    // Khổ sản phẩm từ mã vật tư (GCKGSG-0120-2200-0000 -> lấy 2200)
    if ((!currentReport.kho_san_pham || currentReport.kho_san_pham === '') && formulaData.mhkx) {
        let khoSanPham = '';
        const parts = formulaData.mhkx.split('-');
        if (parts.length >= 3) {
            const ffff = parts[2]; // Vị trí FFFF
            const khoNumber = parseInt(ffff, 10);
            if (!isNaN(khoNumber)) {
                khoSanPham = khoNumber.toString();
            }
        }
        if (khoSanPham) {
            updateData.kho_san_pham = khoSanPham;
        }
    }

    // Khổ cần sang
    if ((!currentReport.kho_can_sang || currentReport.kho_can_sang === '') &&
        (formulaData.khoCanSang || formulaData.tongKhoNhap || formulaData.kho)) {
        updateData.kho_can_sang = formulaData.khoCanSang || formulaData.tongKhoNhap || formulaData.kho;
    }

    // Khổ (mm) - từ định lượng xuất
    if ((!currentReport.kho || currentReport.kho === '') &&
        (formulaData.dlXuat || formulaData.dinhLuong)) {
        updateData.kho = formulaData.dlXuat || formulaData.dinhLuong;
    }

    console.log('Dữ liệu SCL đã chuẩn bị để cập nhật:', updateData);
    return updateData;
}

/**
 * Cập nhật báo cáo SCL với dữ liệu PSC phù hợp
 * @param {Array} processedPhieuList - Danh sách dữ liệu PSC đã xử lý
 */
async function updateMatchingSCLReports(processedPhieuList) {
    try {
        // Lấy tất cả báo cáo SCL
        const response = await fetch('/api/bao-cao-scl/list');
        if (!response.ok) {
            console.error('Không thể lấy danh sách báo cáo SCL để cập nhật:', await response.text());
            return;
        }

        const sclReports = await response.json();
        console.log(`Đang kiểm tra ${sclReports.length} báo cáo SCL để cập nhật`);

        // Theo dõi số lượng báo cáo sẽ được cập nhật
        let updateCount = 0;
        let pendingUpdates = [];

        // Duyệt qua từng mục PSC đã xử lý
        for (const phieu of processedPhieuList) {
            // Tìm báo cáo SCL trùng khớp dựa trên so_phieu và thu_tu_cuon
            const matchingReports = sclReports.filter(report =>
                report.so_phieu === phieu.soPhieu &&
                report.thu_tu_cuon === phieu.sttXuat
            );

            if (matchingReports.length > 0) {
                console.log(`Tìm thấy ${matchingReports.length} báo cáo SCL khớp với PSC ${phieu.soPhieu}-${phieu.sttXuat}`);
            }

            // Cập nhật từng báo cáo trùng khớp nếu cần
            for (const report of matchingReports) {
                // Kiểm tra xem báo cáo này có trường trống cần cập nhật không
                const needsUpdate = (
                    (!report.ma_vat_tu || report.ma_vat_tu === '') ||
                    (!report.worksheet || report.worksheet === '') ||
                    (!report.khach_hang || report.khach_hang === '') ||
                    (!report.dinh_luong || report.dinh_luong === '') ||
                    (!report.kho_san_pham || report.kho_san_pham === '') ||
                    (!report.kho_can_sang || report.kho_can_sang === '')
                );

                if (needsUpdate) {
                    console.log(`Báo cáo SCL ID ${report.id} cần cập nhật cho ${phieu.soPhieu}-${phieu.sttXuat}`);

                    // Trích xuất giá trị khổ từ mhkx nếu có thể (dựa trên định dạng tiêu chuẩn "GCKGSG-0120-2200-0000")
                    let khoFromMhkx = '';
                    if (phieu.mhkx) {
                        const parts = phieu.mhkx.split('-');
                        if (parts.length >= 3) {
                            khoFromMhkx = parts[2]; // Lấy phần thứ ba (vd: "2200")
                        }
                    }

                    // Chuẩn bị dữ liệu cập nhật
                    const updateData = {
                        id: report.id,
                        ma_vat_tu: phieu.mhkx || report.ma_vat_tu || '',
                        worksheet: phieu.soLSX || report.worksheet || '',
                        khach_hang: phieu.khachHang || report.khach_hang || '',
                        dinh_luong: phieu.dlx || report.dinh_luong || '',
                        kho_san_pham: khoFromMhkx || report.kho_san_pham || '',
                        kho_can_sang: phieu.khoCanSang || report.kho_can_sang || ''
                    };

                    // Thêm vào danh sách cần cập nhật
                    pendingUpdates.push({ reportId: report.id, data: updateData });
                    updateCount++;
                }
            }
        }

        // Xử lý tất cả cập nhật đang chờ
        if (pendingUpdates.length > 0) {
            console.log(`Đang xử lý ${pendingUpdates.length} cập nhật báo cáo SCL`);

            // Thực hiện cập nhật tuần tự để tránh quá tải máy chủ
            for (const update of pendingUpdates) {
                try {
                    const updateResponse = await fetch(`/api/bao-cao-scl/update-formula/${update.reportId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(update.data),
                    });

                    if (!updateResponse.ok) {
                        console.error(`Không thể cập nhật báo cáo SCL ID ${update.reportId}:`, await updateResponse.text());
                    }
                } catch (updateError) {
                    console.error(`Lỗi khi cập nhật báo cáo SCL ID ${update.reportId}:`, updateError);
                }
            }

            console.log(`Đã xử lý thành công ${updateCount} cập nhật báo cáo SCL`);
            // Hiển thị thông báo cho người dùng về các cập nhật
            if (typeof showNotification === 'function') {
                showNotification(`Đã cập nhật ${updateCount} báo cáo SCL với dữ liệu mới từ phiếu sang cuộn`, 'success');
            }
        } else {
            console.log('Không có báo cáo SCL nào cần cập nhật');
        }
    } catch (error) {
        console.error('Lỗi khi xử lý cập nhật SCL:', error);
    }
}

// Hàm lưu dữ liệu sau khi xử lý phiếu sang cuộn
async function saveScPasteData(data) {
    // Kiểm tra phiếu trùng
    const existingPhieuList = await PhieuSangCuonAPI.getList();
    const duplicates = [];

    // Tìm các phiếu trùng
    data.forEach(phieu => {
        const isDuplicate = existingPhieuList.some(p => p.soPhieu === phieu.soPhieu);
        if (isDuplicate && !duplicates.includes(phieu.soPhieu)) {
            duplicates.push(phieu.soPhieu);
        }
    });

    if (duplicates.length > 0) {
        // Có phiếu trùng, hiển thị dialog xử lý
        duplicateHandling.duplicates = duplicates;
        duplicateHandling.currentIndex = 0;
        duplicateHandling.newTickets = data;
        duplicateHandling.ticketType = 'sc';
        duplicateHandling.skipped = false;

        // Hiển thị dialog xác nhận đầu tiên
        showDuplicateDialog(duplicates[0], 'sc');
    } else {
        // Không có phiếu trùng, lưu trực tiếp
        await saveSCTicketsDirectly(data);
    }
}

// Xử lý phiếu sang cuộn trùng
async function handleDuplicateSCTicket(ticketNumber, action) {
    try {
        // Lấy dữ liệu hiện tại
        const currentTickets = await PhieuSangCuonAPI.getList();

        // Lấy phiếu mới có số phiếu trùng
        const ticketsToProcess = duplicateHandling.newTickets.filter(t => t.soPhieu === ticketNumber);

        if (action === 'replace') {
            // THAY THẾ: Chỉ thay thế những phiếu có STT trùng khớp hoặc theo vị trí tương ứng
            // (Logic hiện tại - KHÔNG CÓ xử lý bổ sung sau)

            const oldTickets = currentTickets.filter(t => t.soPhieu === ticketNumber);

            if (oldTickets.length === 0) {
                await Promise.all(ticketsToProcess.map(ticket => PhieuSangCuonAPI.add(ticket)));
                await updateMatchingSCLReports(ticketsToProcess);
                return;
            }

            // Xác định phiếu cần thay thế dựa trên STT xuất
            let ticketsToReplace = [];
            let ticketsToKeep = [...oldTickets];

            if (ticketsToProcess.length <= oldTickets.length) {
                const newSttXuats = ticketsToProcess.map(t => t.sttXuat);
                ticketsToReplace = oldTickets.filter(t => newSttXuats.includes(t.sttXuat));

                if (ticketsToReplace.length === 0) {
                    const sortedOldTickets = [...oldTickets].sort((a, b) => {
                        return parseInt(a.sttXuat) - parseInt(b.sttXuat);
                    });
                    ticketsToReplace = sortedOldTickets.slice(0, ticketsToProcess.length);
                }

                ticketsToKeep = oldTickets.filter(t => !ticketsToReplace.some(d => d.id === t.id));
            } else {
                ticketsToReplace = [...oldTickets];
                ticketsToKeep = [];
            }

            // Xóa các phiếu cần thay thế
            await Promise.all(ticketsToReplace.map(ticket => PhieuSangCuonAPI.delete(ticket.id)));

            // Thêm các phiếu mới
            await Promise.all(ticketsToProcess.map(ticket => PhieuSangCuonAPI.add(ticket)));

            // Cập nhật các báo cáo SCL liên quan
            await updateMatchingSCLReports(ticketsToProcess);

        } else { // action === 'add' - BỎ QUA THAY THẾ
            // BỎ QUA THAY THẾ: thêm phiếu mới vào cuối + XỬ LÝ SCL BỔ SUNG SAU
            console.log('Thực hiện bỏ qua thay thế với xử lý SCL bổ sung sau...');

            const oldTickets = currentTickets.filter(t => t.soPhieu === ticketNumber);

            // Lấy STT xuất lớn nhất của phiếu cũ
            let maxSttXuat = 0;
            oldTickets.forEach(ticket => {
                const sttXuat = parseInt(ticket.sttXuat);
                if (!isNaN(sttXuat) && sttXuat > maxSttXuat) {
                    maxSttXuat = sttXuat;
                }
            });

            // Lấy STT nhập lớn nhất qua tất cả các phiếu cũ
            let maxSttNhap = 0;
            oldTickets.forEach(ticket => {
                if (ticket.maNhaps && ticket.maNhaps.length > 0) {
                    ticket.maNhaps.forEach(maNhap => {
                        const sttNhap = parseInt(maNhap.sttNhap);
                        if (!isNaN(sttNhap) && sttNhap > maxSttNhap) {
                            maxSttNhap = sttNhap;
                        }
                    });
                }
            });

            // Cập nhật STT xuất cho phiếu mới
            ticketsToProcess.forEach((ticket, index) => {
                ticket.sttXuat = (maxSttXuat + index + 1).toString();

                // Cập nhật STT nhập tăng dần liên tục
                if (ticket.maNhaps && ticket.maNhaps.length > 0) {
                    ticket.maNhaps.forEach((maNhap, maNhapIndex) => {
                        maNhap.sttNhap = (maxSttNhap + maNhapIndex + 1).toString();
                    });

                    // Cập nhật maxSttNhap sau khi thêm mã hàng nhập cho phiếu này
                    maxSttNhap += ticket.maNhaps.length;
                }
            });

            // Thêm phiếu mới
            await Promise.all(ticketsToProcess.map(ticket => PhieuSangCuonAPI.add(ticket)));

            // Cập nhật các báo cáo SCL liên quan
            await updateMatchingSCLReports(ticketsToProcess);

            // ===== XỬ LÝ SCL BỔ SUNG SAU - CHỈ KHI BỎ QUA THAY THẾ =====
            console.log('Bắt đầu xử lý SCL bổ sung sau...');
            await processSCLSupplementaryAfterSave(ticketsToProcess);
        }
    } catch (error) {
        console.error('Lỗi khi xử lý phiếu sang cuộn trùng:', error);
        alert('Có lỗi khi xử lý phiếu sang cuộn trùng: ' + error.message);
    }
}

/**
 * Xóa dữ liệu đã dán cho phiếu sang cuộn
 */
function clearScPaste() {
    const tbody = document.querySelector('#sc-dan-table tbody');
    if (!tbody) return;

    // Xóa tất cả các hàng trong tbody
    tbody.innerHTML = '';

    // Tạo lại dòng paste đầu tiên và dòng hướng dẫn
    const pasteRow = document.createElement('tr');
    pasteRow.id = 'sc-paste-row';

    // Tạo ô dán đầu tiên
    const pasteCell = document.createElement('td');
    pasteCell.id = 'sc-paste-cell';
    pasteCell.className = 'paste-cell';
    pasteCell.contentEditable = 'true';
    pasteCell.tabIndex = '1';
    pasteRow.appendChild(pasteCell);

    // Tạo các ô còn lại
    for (let i = 0; i < 18; i++) {
        const td = document.createElement('td');
        pasteRow.appendChild(td);
    }

    tbody.appendChild(pasteRow);

    // Thêm dòng hướng dẫn
    const instructionRow = document.createElement('tr');
    instructionRow.className = 'instruction-row';

    const instructionCell = document.createElement('td');
    instructionCell.colSpan = '19';
    instructionCell.innerHTML = '<em>Nhấn vào ô đầu tiên (Số phiếu) và dán dữ liệu từ Excel</em>';

    instructionRow.appendChild(instructionCell);
    tbody.appendChild(instructionRow);

    // Quan trọng: Gắn lại sự kiện paste cho ô đầu tiên
    document.getElementById('sc-paste-cell').addEventListener('paste', handleExcelPaste);

    // Focus vào ô đầu tiên
    pasteCell.focus();
}

// Hàm load danh sách phiếu sang cuộn từ API
async function loadPhieuSangCuonList() {
    try {
        const phieuList = await PhieuSangCuonAPI.getList();
        const tableBody = document.querySelector('#sc-danhsach-table tbody');

        // Xóa dữ liệu cũ
        tableBody.innerHTML = '';

        // Nhóm phiếu theo số phiếu để hiển thị chỉ 1 lần số phiếu
        const groupedPhieu = {};

        phieuList.forEach(phieu => {
            if (!groupedPhieu[phieu.soPhieu]) {
                groupedPhieu[phieu.soPhieu] = [];
            }

            groupedPhieu[phieu.soPhieu].push(phieu);
        });

        // Hiển thị dữ liệu
        Object.keys(groupedPhieu).forEach(soPhieu => {
            const phieuGroup = groupedPhieu[soPhieu];

            // Hiển thị thông tin phiếu ở dòng đầu tiên
            const firstPhieu = phieuGroup[0];
            const firstRow = document.createElement('tr');
            firstRow.dataset.id = firstPhieu.id;
            firstRow.innerHTML = `
                <td class="checkbox-cell"><input type="checkbox" class="phieu-checkbox" data-id="${firstPhieu.id}"></td>
                <td>${firstPhieu.soPhieu}</td>
                <td>${firstPhieu.ngayCT}</td>
                <td>${firstPhieu.soLSX}</td>
                <td>${firstPhieu.dienGiai}</td>
                <td>${firstPhieu.khachHang}</td>
                <td>${firstPhieu.sanPham}</td>
                <td>${firstPhieu.maPhu}</td>
                <td>${firstPhieu.sttXuat}</td>
                <td>${firstPhieu.mhkx}</td>
                <td>${firstPhieu.dlx}</td>
                <td>${firstPhieu.slXuat}</td>
                <td>${firstPhieu.tlXuat}</td>
                <td>${firstPhieu.maNhaps[0]?.sttNhap || ''}</td>
                <td>${firstPhieu.maNhaps[0]?.maHangNhap || ''}</td>
                <td>${firstPhieu.maNhaps[0]?.slNhap || ''}</td>
                <td>${firstPhieu.maNhaps[0]?.tlNhap || ''}</td>
                <td>${firstPhieu.tonSL}</td>
                <td>${firstPhieu.tonTL}</td>
                <td>${firstPhieu.tonTT}</td>
                <td>
                    <button onclick="editPhieu('sc', '${firstPhieu.id}')" class="btn-secondary">Sửa</button>
                    <button onclick="deletePhieu('sc', '${firstPhieu.id}')" class="btn-danger">Xóa</button>
                </td>
            `;
            tableBody.appendChild(firstRow);

            // Hiển thị các mã hàng nhập còn lại của phiếu đầu tiên
            for (let i = 1; i < firstPhieu.maNhaps.length; i++) {
                const maNhap = firstPhieu.maNhaps[i];
                const maNhapRow = document.createElement('tr');
                maNhapRow.className = 'sub-row';
                maNhapRow.innerHTML = `
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>${maNhap.sttNhap}</td>
                    <td>${maNhap.maHangNhap}</td>
                    <td>${maNhap.slNhap}</td>
                    <td>${maNhap.tlNhap}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                `;
                tableBody.appendChild(maNhapRow);
            }

            // Hiển thị các MHKX tiếp theo nếu có
            for (let i = 1; i < phieuGroup.length; i++) {
                const phieu = phieuGroup[i];
                const phieuRow = document.createElement('tr');
                phieuRow.dataset.id = phieu.id;
                phieuRow.innerHTML = `
                    <td class="checkbox-cell"><input type="checkbox" class="phieu-checkbox" data-id="${phieu.id}"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>${phieu.sttXuat}</td>
                    <td>${phieu.mhkx}</td>
                    <td>${phieu.dlx}</td>
                    <td>${phieu.slXuat}</td>
                    <td>${phieu.tlXuat}</td>
                    <td>${phieu.maNhaps[0]?.sttNhap || ''}</td>
                    <td>${phieu.maNhaps[0]?.maHangNhap || ''}</td>
                    <td>${phieu.maNhaps[0]?.slNhap || ''}</td>
                    <td>${phieu.maNhaps[0]?.tlNhap || ''}</td>
                    <td>${phieu.tonSL}</td>
                    <td>${phieu.tonTL}</td>
                    <td>${phieu.tonTT}</td>
                    <td>
                        <button onclick="editPhieu('sc', '${phieu.id}')" class="btn-secondary">Sửa</button>
                        <button onclick="deletePhieu('sc', '${phieu.id}')" class="btn-danger">Xóa</button>
                    </td>
                `;
                tableBody.appendChild(phieuRow);

                // Hiển thị các mã hàng nhập của MHKX này
                for (let j = 1; j < phieu.maNhaps.length; j++) {
                    const maNhap = phieu.maNhaps[j];
                    const maNhapRow = document.createElement('tr');
                    maNhapRow.className = 'sub-row';
                    maNhapRow.innerHTML = `
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>${maNhap.sttNhap}</td>
                        <td>${maNhap.maHangNhap}</td>
                        <td>${maNhap.slNhap}</td>
                        <td>${maNhap.tlNhap}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    `;
                    tableBody.appendChild(maNhapRow);
                }
            }
        });

        // Gắn sự kiện cho các checkbox
        attachCheckboxEvents('sc-danhsach-table');
    } catch (error) {
        console.error('Lỗi khi tải danh sách phiếu sang cuộn:', error);
    }
}


// Hàm chuyển đổi dữ liệu sang cuộn sang formula từ API
async function convertSangCuonToFormula() {
    try {
      const formulaList = await PhieuSangCuonAPI.getFormula();
      const tableBody = document.querySelector('#sc-formula-table tbody');
      
      // Xóa dữ liệu cũ
      tableBody.innerHTML = '';
      
      // Kiểm tra xem có dữ liệu không
      if (!formulaList || formulaList.length === 0) {
        console.log('Không có dữ liệu formula sang cuộn');
        
        // Thêm một hàng thông báo
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
          <td colspan="21" style="text-align: center; padding: 10px;">
            Không có dữ liệu formula sang cuộn
          </td>
        `;
        tableBody.appendChild(emptyRow);
        return;
      }
      
      // Ghi log để debug
      console.log('Dữ liệu formula sang cuộn:', formulaList);
      
      // Hiển thị dữ liệu với kiểm tra giá trị undefined/null
      formulaList.forEach(formula => {
        const formulaRow = document.createElement('tr');
        
        // Hàm giúp hiển thị dữ liệu an toàn (tránh lỗi undefined/null)
        const safeDisplay = (value) => {
          return value !== undefined && value !== null ? value : '';
        };
        
        formulaRow.innerHTML = `
          <td>${safeDisplay(formula.ws)}</td>
          <td>${safeDisplay(formula.soPhieu)}</td>
          <td>${safeDisplay(formula.phieuPhu)}</td>
          <td>${safeDisplay(formula.phieu)}</td>
          <td>${safeDisplay(formula.ws)}</td>
          <td>${safeDisplay(formula.ngayCT)}</td>
          <td>${safeDisplay(formula.maKH)}</td>
          <td>${safeDisplay(formula.khachHang)}</td>
          <td>${safeDisplay(formula.maSP)}</td>
          <td>${safeDisplay(formula.mhkx)}</td>
          <td>${safeDisplay(formula.slDon)}</td>
          <td>${safeDisplay(formula.dlXuat)}</td>
          <td>${safeDisplay(formula.tongSLGiay)}</td>
          <td>${safeDisplay(formula.soCon)}</td>
          <td>${safeDisplay(formula.kho)}</td>
          <td>${safeDisplay(formula.khoCanSang)}</td>
          <td>${safeDisplay(formula.trongLuong)}</td>
          <td>${safeDisplay(formula.slXuat)}</td>
          <td>${safeDisplay(formula.maCanSang)}</td>
          <td>${safeDisplay(formula.slNhap)}</td>
          <td>${safeDisplay(formula.tongKhoNhap)}</td>
        `;
        tableBody.appendChild(formulaRow);
      });
      
      console.log('Đã hiển thị xong danh sách formula sang cuộn');
    } catch (error) {
      console.error('Lỗi khi tải formula sang cuộn:', error);
      // Hiển thị lỗi trong DOM để dễ debug
      const tableBody = document.querySelector('#sc-formula-table tbody');
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="21" style="text-align: center; color: red; padding: 10px;">
              Lỗi khi tải dữ liệu formula: ${error.message}
            </td>
          </tr>
        `;
      }
    }
  }

// Hàm tạo form chỉnh sửa phiếu sang cuộn
function createSangCuonEditForm(container, id, data) {
    // Tìm phiếu cần chỉnh sửa
    const phieuList = JSON.parse(localStorage.getItem('phieuSangCuon') || '[]');
    const phieu = phieuList.find(p => p.id === id) || data;
    
    if (!phieu) {
        container.innerHTML = '<p>Không tìm thấy phiếu cần chỉnh sửa!</p>';
        return;
    }
    
    // Tạo form chỉnh sửa
    const form = document.createElement('form');
    form.id = 'form-sc-edit';
    form.className = 'form-them-phieu';
    
    form.innerHTML = `
        <input type="hidden" id="edit-sc-id" value="${phieu.id}">
        
        <div class="form-row">
            <div class="form-group">
                <label for="edit-sc-so-phieu">Số phiếu</label>
                <input type="text" id="edit-sc-so-phieu" value="${phieu.soPhieu || ''}" required>
            </div>
            <div class="form-group">
                <label for="edit-sc-ngay-ct">Ngày chứng từ</label>
                <input type="date" id="edit-sc-ngay-ct" value="${phieu.ngayCT || ''}">
            </div>
            <div class="form-group">
                <label for="edit-sc-so-lsx">Số LSX</label>
                <input type="text" id="edit-sc-so-lsx" value="${phieu.soLSX || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-sc-dien-giai">Diễn giải</label>
                <input type="text" id="edit-sc-dien-giai" value="${phieu.dienGiai || ''}">
            </div>
            <div class="form-group">
                <label for="edit-sc-khach-hang">Khách hàng</label>
                <input type="text" id="edit-sc-khach-hang" value="${phieu.khachHang || ''}">
            </div>
            <div class="form-group">
                <label for="edit-sc-san-pham">Sản phẩm</label>
                <input type="text" id="edit-sc-san-pham" value="${phieu.sanPham || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-sc-ma-phu">Mã phụ</label>
                <input type="text" id="edit-sc-ma-phu" value="${phieu.maPhu || ''}">
            </div>
        </div>

        <h3>Thông tin xuất</h3>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-sc-stt-xuat">STT Xuất</label>
                <input type="text" id="edit-sc-stt-xuat" value="${phieu.sttXuat || ''}">
            </div>
            <div class="form-group">
                <label for="edit-sc-mhkx">Mã hàng khổ xuất</label>
                <input type="text" id="edit-sc-mhkx" value="${phieu.mhkx || ''}">
            </div>
            <div class="form-group">
                <label for="edit-sc-dlx">Định lượng xuất</label>
                <input type="text" id="edit-sc-dlx" value="${phieu.dlx || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-sc-sl-xuat">SL xuất</label>
                <input type="text" id="edit-sc-sl-xuat" value="${phieu.slXuat || ''}">
            </div>
            <div class="form-group">
                <label for="edit-sc-tl-xuat">Trọng lượng xuất</label>
                <input type="text" id="edit-sc-tl-xuat" value="${phieu.tlXuat || ''}">
            </div>
        </div>

        <h3>Thông tin nhập</h3>
        <div id="edit-sc-nhap-container">
            ${phieu.maNhaps.map((maNhap, index) => `
                <div class="sc-nhap-group">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-sc-stt-nhap-${index + 1}">STT Nhập</label>
                            <input type="text" id="edit-sc-stt-nhap-${index + 1}" class="edit-sc-stt-nhap" value="${maNhap.sttNhap || ''}">
                        </div>
                        <div class="form-group">
                            <label for="edit-sc-mhn-${index + 1}">Mã hàng nhập</label>
                            <input type="text" id="edit-sc-mhn-${index + 1}" class="edit-sc-mhn" value="${maNhap.maHangNhap || ''}">
                        </div>
                        <div class="form-group">
                            <label for="edit-sc-sl-nhap-${index + 1}">SL nhập</label>
                            <input type="text" id="edit-sc-sl-nhap-${index + 1}" class="edit-sc-sl-nhap" value="${maNhap.slNhap || ''}">
                        </div>
                        <div class="form-group">
                            <label for="edit-sc-tl-nhap-${index + 1}">Trọng lượng nhập</label>
                            <input type="text" id="edit-sc-tl-nhap-${index + 1}" class="edit-sc-tl-nhap" value="${maNhap.tlNhap || ''}">
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <button type="button" id="edit-sc-them-mhn" class="btn-add">+ Thêm mã hàng nhập</button>

        <h3>Thông tin tồn kho</h3>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-sc-ton-sl">Tồn kho số lượng</label>
                <input type="text" id="edit-sc-ton-sl" value="${phieu.tonSL || ''}">
            </div>
            <div class="form-group">
                <label for="edit-sc-ton-tl">Tồn kho trọng lượng</label>
                <input type="text" id="edit-sc-ton-tl" value="${phieu.tonTL || ''}">
            </div>
            <div class="form-group">
                <label for="edit-sc-ton-tamtinh">Tồn kho tạm tính</label>
                <input type="text" id="edit-sc-ton-tamtinh" value="${phieu.tonTT || ''}">
            </div>
        </div>

        <div class="form-actions">
            <button type="submit" class="btn-primary">Lưu Thay Đổi</button>
            <button type="button" class="btn-secondary close-modal">Hủy</button>
        </div>
    `;
    
    container.appendChild(form);
    
    // Gắn sự kiện cho nút thêm mã hàng nhập
    document.getElementById('edit-sc-them-mhn').addEventListener('click', function() {
        addEditMaHangNhapField();
    });
    
    // Gắn sự kiện cho nút hủy
    document.querySelector('#form-sc-edit .close-modal').addEventListener('click', function() {
        document.getElementById('modal-edit').style.display = 'none';
    });
    
    // Gắn sự kiện submit form
    document.getElementById('form-sc-edit').addEventListener('submit', function(e) {
        e.preventDefault();
        updatePhieuSangCuon();
    });
}

// Hàm thêm field mã hàng nhập trong form chỉnh sửa
function addEditMaHangNhapField() {
    const container = document.getElementById('edit-sc-nhap-container');
    const groups = container.querySelectorAll('.sc-nhap-group');
    const newIndex = groups.length + 1;
    
    const groupDiv = document.createElement('div');
    groupDiv.className = 'sc-nhap-group';
    
    groupDiv.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label for="edit-sc-stt-nhap-${newIndex}">STT Nhập</label>
                <input type="text" id="edit-sc-stt-nhap-${newIndex}" class="edit-sc-stt-nhap">
            </div>
            <div class="form-group">
                <label for="edit-sc-mhn-${newIndex}">Mã hàng nhập</label>
                <input type="text" id="edit-sc-mhn-${newIndex}" class="edit-sc-mhn">
            </div>
            <div class="form-group">
                <label for="edit-sc-sl-nhap-${newIndex}">SL nhập</label>
                <input type="text" id="edit-sc-sl-nhap-${newIndex}" class="edit-sc-sl-nhap">
            </div>
            <div class="form-group">
                <label for="edit-sc-tl-nhap-${newIndex}">Trọng lượng nhập</label>
                <input type="text" id="edit-sc-tl-nhap-${newIndex}" class="edit-sc-tl-nhap">
            </div>
        </div>
    `;
    
    container.appendChild(groupDiv);
}

// Hàm cập nhật phiếu sang cuộn
async function updatePhieuSangCuon() {
    const id = document.getElementById('edit-sc-id').value;
    
    // Lấy dữ liệu từ form
    const soPhieu = getFormValue('edit-sc-so-phieu');
    if (!soPhieu) {
        alert('Vui lòng nhập số phiếu!');
        return;
    }
    
    const ngayCT = getFormValue('edit-sc-ngay-ct');
    const soLSX = getFormValue('edit-sc-so-lsx');
    const dienGiai = getFormValue('edit-sc-dien-giai');
    const khachHang = getFormValue('edit-sc-khach-hang');
    const sanPham = getFormValue('edit-sc-san-pham');
    const maPhu = getFormValue('edit-sc-ma-phu');
    
    const sttXuat = getFormValue('edit-sc-stt-xuat');
    const mhkx = getFormValue('edit-sc-mhkx');
    const dlx = getFormValue('edit-sc-dlx');
    const slXuat = getFormValue('edit-sc-sl-xuat');
    const tlXuat = getFormValue('edit-sc-tl-xuat');
    
    // Lấy thông tin mã hàng nhập
    const maNhaps = [];
    const sttNhapElements = document.querySelectorAll('.edit-sc-stt-nhap');
    const mhnElements = document.querySelectorAll('.edit-sc-mhn');
    const slNhapElements = document.querySelectorAll('.edit-sc-sl-nhap');
    const tlNhapElements = document.querySelectorAll('.edit-sc-tl-nhap');
    
    for (let i = 0; i < mhnElements.length; i++) {
        if (mhnElements[i].value.trim() !== '') {
            maNhaps.push({
                sttNhap: sttNhapElements[i].value.trim(),
                maHangNhap: mhnElements[i].value.trim(),
                slNhap: slNhapElements[i].value.trim(),
                tlNhap: tlNhapElements[i].value.trim()
            });
        }
    }
    
    // Kiểm tra phải có ít nhất 2 mã hàng nhập
    if (maNhaps.length < 2) {
        alert('Cần có ít nhất 2 mã hàng nhập!');
        return;
    }
    
    const tonSL = getFormValue('edit-sc-ton-sl');
    const tonTL = getFormValue('edit-sc-ton-tl');
    const tonTT = getFormValue('edit-sc-ton-tamtinh');
    
    // Tạo đối tượng phiếu mới
    const updatedPhieu = {
        id,
        soPhieu,
        ngayCT,
        soLSX,
        dienGiai,
        khachHang,
        sanPham,
        maPhu,
        sttXuat,
        mhkx,
        dlx,
        slXuat,
        tlXuat,
        maNhaps,
        tonSL,
        tonTL,
        tonTT
    };
    
    try {
        // Cập nhật phiếu trong API
        await PhieuSangCuonAPI.update(id, updatedPhieu);
        
        // Cập nhật giao diện
        await loadPhieuSangCuonList();
        await convertSangCuonToFormula();
        
        // Đóng modal
        document.getElementById('modal-edit').style.display = 'none';
        
        alert('Đã cập nhật phiếu sang cuộn thành công!');
    } catch (error) {
        console.error('Lỗi khi cập nhật phiếu sang cuộn:', error);
        alert('Có lỗi khi cập nhật phiếu sang cuộn: ' + error.message);
    }
}

// Hàm hiển thị dữ liệu đã dán và xử lý trong bảng
function displayScPasteData(data) {
    const tableBody = document.querySelector('#sc-dan-table tbody');
    tableBody.innerHTML = '';
    
    data.forEach(phieu => {
        // Tạo dòng cho phiếu và MHKX
        const phieuRow = document.createElement('tr');
        phieuRow.innerHTML = `
            <td>${phieu.soPhieu}</td>
            <td>${phieu.ngayCT}</td>
            <td>${phieu.soLSX}</td>
            <td>${phieu.dienGiai}</td>
            <td>${phieu.khachHang}</td>
            <td>${phieu.sanPham}</td>
            <td>${phieu.maPhu}</td>
            <td>${phieu.sttXuat}</td>
            <td>${phieu.mhkx}</td>
            <td>${phieu.dlx}</td>
            <td>${phieu.slXuat}</td>
            <td>${phieu.tlXuat}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>${phieu.tonSL}</td>
            <td>${phieu.tonTL}</td>
            <td>${phieu.tonTT}</td>
        `;
        tableBody.appendChild(phieuRow);
        
        // Tạo dòng cho từng mã hàng nhập
        phieu.maNhaps.forEach(maNhap => {
            const maNhapRow = document.createElement('tr');
            maNhapRow.innerHTML = `
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>${maNhap.sttNhap}</td>
                <td>${maNhap.maHangNhap}</td>
                <td>${maNhap.slNhap}</td>
                <td>${maNhap.tlNhap}</td>
                <td></td>
                <td></td>
                <td></td>
            `;
            tableBody.appendChild(maNhapRow);
        });
    });
    
    // Thêm nút để xử lý tiếp dữ liệu
    const btnRow = document.createElement('tr');
    btnRow.innerHTML = `
        <td colspan="19" style="text-align: center;">
            <button id="sc-btn-save-paste" class="btn-primary">Xử lý dữ liệu</button>
        </td>
    `;
    tableBody.appendChild(btnRow);
    
    // Gắn sự kiện cho nút lưu
    document.getElementById('sc-btn-save-paste').addEventListener('click', function() {
        saveScPasteData(data);
    });
}

// Xử lý dữ liệu Excel cho phiếu Sang Cuộn
function processExcelDataSangCuon(rows) {
    // Chuyển đổi dữ liệu từ Excel thành cấu trúc phù hợp
    const phieuData = [];
    let currentPhieu = null;
    let currentMHKX = null;
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Kiểm tra hàng có số phiếu (bắt đầu phiếu mới)
        if (row[0] && row[0].toString().trim() !== '') {
            // Tạo phiếu mới
            currentPhieu = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                soPhieu: row[0].toString().trim(),
                ngayCT: formatExcelDate(row[1]),
                soLSX: row[2] ? row[2].toString().trim() : '',
                dienGiai: row[3] ? row[3].toString().trim() : '',
                khachHang: row[4] ? row[4].toString().trim() : '',
                sanPham: row[5] ? row[5].toString().trim() : '',
                maPhu: row[6] ? row[6].toString().trim() : '',
                mhkxData: [],
                allMaNhaps: [] // Mảng phụ để theo dõi tất cả mã hàng nhập
            };
            
            phieuData.push(currentPhieu);
            currentMHKX = null; // Reset MHKX khi có phiếu mới
        }
        
        // Kiểm tra hàng có MHKX (STT xuất hoặc mã hàng khổ xuất có giá trị)
        if (currentPhieu && (row[7] !== '' || row[8] !== '')) {
            // Tạo MHKX mới
            currentMHKX = {
                sttXuat: row[7] ? row[7].toString().trim() : '',
                mhkx: row[8] ? row[8].toString().trim() : '',
                dlx: row[9] ? row[9].toString().trim() : '',
                slXuat: row[10] ? row[10].toString().trim() : '',
                tlXuat: row[11] ? row[11].toString().trim() : '',
                tonSL: row[16] ? row[16].toString().trim() : '',
                tonTL: row[17] ? row[17].toString().trim() : '',
                tonTT: row[18] ? row[18].toString().trim() : '',
                maNhaps: []
            };
            
            currentPhieu.mhkxData.push(currentMHKX);
        }
        
        // Kiểm tra hàng có mã hàng nhập
        if (currentMHKX && (row[12] !== '' || row[13] !== '')) {
            // Tạo mã hàng nhập mới
            const maNhap = {
                originalStt: row[12] ? row[12].toString().trim() : '',
                maHangNhap: row[13] ? row[13].toString().trim() : '',
                slNhap: row[14] ? row[14].toString().trim() : '',
                tlNhap: row[15] ? row[15].toString().trim() : ''
            };
            
            // Thêm vào MHKX hiện tại
            currentMHKX.maNhaps.push(maNhap);
            
            // Thêm vào danh sách tất cả mã hàng nhập của phiếu
            currentPhieu.allMaNhaps.push(maNhap);
        }
    }
    
    // Chuẩn hóa STT
    phieuData.forEach(phieu => {
        // Đảm bảo STT xuất là liên tiếp (1, 2, 3, ...)
        phieu.mhkxData.forEach((mhkx, i) => {
            mhkx.sttXuat = (i + 1).toString();
            
            // Đảm bảo mỗi MHKX có ít nhất 2 mã hàng nhập
            while (mhkx.maNhaps.length < 2) {
                const dummyMaNhap = {
                    originalStt: '',
                    maHangNhap: '',
                    slNhap: '',
                    tlNhap: ''
                };
                
                mhkx.maNhaps.push(dummyMaNhap);
                phieu.allMaNhaps.push(dummyMaNhap);
            }
        });
        
        // Đánh số STT nhập liên tục cho toàn bộ phiếu
        phieu.allMaNhaps.forEach((maNhap, index) => {
            maNhap.sttNhap = (index + 1).toString();
        });
    });
    
    // Chuyển đổi cấu trúc dữ liệu để phù hợp với cấu trúc lưu trữ
    const processedPhieuList = [];
    
    phieuData.forEach(phieu => {
        // Kiểm tra nếu không có MHKX nào, tạo một cái mặc định
        if (phieu.mhkxData.length === 0) {
            const dummyMaNhap1 = {
                sttNhap: "1",
                maHangNhap: "",
                slNhap: "",
                tlNhap: ""
            };
            
            const dummyMaNhap2 = {
                sttNhap: "2",
                maHangNhap: "",
                slNhap: "",
                tlNhap: ""
            };
            
            phieu.mhkxData.push({
                sttXuat: "1",
                mhkx: "",
                dlx: "",
                slXuat: "",
                tlXuat: "",
                tonSL: "",
                tonTL: "",
                tonTT: "",
                maNhaps: [dummyMaNhap1, dummyMaNhap2]
            });
        }
        
        phieu.mhkxData.forEach(mhkx => {
            // Tạo phiếu cho lưu trữ
            const newPhieu = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                soPhieu: phieu.soPhieu,
                ngayCT: phieu.ngayCT,
                soLSX: phieu.soLSX,
                dienGiai: phieu.dienGiai,
                khachHang: phieu.khachHang,
                sanPham: phieu.sanPham,
                maPhu: phieu.maPhu,
                sttXuat: mhkx.sttXuat,
                mhkx: mhkx.mhkx,
                dlx: mhkx.dlx,
                slXuat: mhkx.slXuat,
                tlXuat: mhkx.tlXuat,
                maNhaps: mhkx.maNhaps.map(maNhap => ({
                    sttNhap: maNhap.sttNhap || "",
                    maHangNhap: maNhap.maHangNhap || "",
                    slNhap: maNhap.slNhap || "",
                    tlNhap: maNhap.tlNhap || ""
                })),
                tonSL: mhkx.tonSL,
                tonTL: mhkx.tonTL,
                tonTT: mhkx.tonTT
            };
            
            processedPhieuList.push(newPhieu);
        });
    });
    
    if (processedPhieuList.length === 0) {
        alert('Không tìm thấy phiếu hợp lệ trong file Excel!');
        return;
    }
    
    // Lưu dữ liệu
    saveScPasteData(processedPhieuList);
}