
//! ====================================================================================================================================

//! =================================================================
//! PHẦN PHIẾU CẮT
//! =================================================================


// Hàm submit phiếu cắt
async function submitPhieuCat() {
    // Lấy dữ liệu cơ bản của phiếu
    const soPhieu = getFormValue('cat-so-phieu');
    if (!soPhieu) {
        alert('Vui lòng nhập số phiếu!');
        return;
    }
    
    const r = getFormValue('cat-r');
    const ngayCT = getFormValue('cat-ngay-ct', new Date().toISOString().split('T')[0]);
    const soLSX = getFormValue('cat-so-lsx');
    const dienGiai = getFormValue('cat-dien-giai');
    const khachHang = getFormValue('cat-khach-hang');
    const sanPham = getFormValue('cat-san-pham');
    const maPhu = getFormValue('cat-ma-phu');
    const lo = getFormValue('cat-lo');
    const viTri = getFormValue('cat-vi-tri');
    
    // Tự động đánh số STT
    let stt = getFormValue('cat-stt');
    if (!stt) {
        try {
            // Tìm STT phù hợp dựa trên danh sách phiếu hiện có
            const currentData = await PhieuCatAPI.getList();
            const sameTickets = currentData.filter(p => p.soPhieu === soPhieu);
            
            if (sameTickets.length > 0) {
                // Kiểm tra xem có phải phiếu STT ngược không
                let isDescending = false;
                if (sameTickets.length > 1) {
                    const stts = sameTickets.map(t => parseInt(t.stt)).filter(s => !isNaN(s));
                    if (stts.length >= 2 && stts[0] > stts[1]) {
                        isDescending = true;
                    }
                }
                
                // Tìm STT lớn nhất hoặc nhỏ nhất đã dùng
                let maxOrMinStt = 0;
                sameTickets.forEach(ticket => {
                    const ticketStt = parseInt(ticket.stt);
                    if (!isNaN(ticketStt)) {
                        if (isDescending) {
                            // Nếu là STT ngược, tìm STT lớn nhất
                            if (ticketStt > maxOrMinStt) {
                                maxOrMinStt = ticketStt;
                            }
                        } else {
                            // Nếu là STT thường, tìm STT lớn nhất
                            if (ticketStt > maxOrMinStt) {
                                maxOrMinStt = ticketStt;
                            }
                        }
                    }
                });
                
                // Đánh số STT mới
                if (isDescending) {
                    // Nếu là STT ngược, STT mới = max + 1
                    stt = (maxOrMinStt + 1).toString();
                } else {
                    // Nếu là STT thường, STT mới = max + 1
                    stt = (maxOrMinStt + 1).toString();
                }
            } else {
                // Nếu là phiếu đầu tiên, STT = 1
                stt = "1";
            }
        } catch (error) {
            console.error('Lỗi khi tìm STT tự động:', error);
            stt = "1"; // Mặc định nếu có lỗi
        }
    }
    
    const maNL = getFormValue('cat-ma-nl');
    const slDat = getFormValue('cat-sl-dat');
    const dinhLuong = getFormValue('cat-dinh-luong');
    const soTam = getFormValue('cat-so-tam');
    const soCon = getFormValue('cat-so-con');
    const khoCat = getFormValue('cat-kho-cat');
    const daiCat = getFormValue('cat-dai-cat');
    const khoXen = getFormValue('cat-kho-xen');
    const daiXen = getFormValue('cat-dai-xen');
    const soLanXen = getFormValue('cat-so-lan-xen');
    const tlDuKien = getFormValue('cat-tl-du-kien');
    const tonSL = getFormValue('cat-ton-sl');
    const tonTL = getFormValue('cat-ton-tl');
    const tonTT = getFormValue('cat-ton-tamtinh');
    const ghiChu = getFormValue('cat-ghi-chu');
    
    // Tạo đối tượng phiếu
    const phieu = {
        id: Date.now().toString(), // ID duy nhất
        r,
        soPhieu,
        ngayCT,
        soLSX,
        dienGiai,
        khachHang,
        sanPham,
        maPhu,
        lo,
        viTri,
        stt,
        maNL,
        slDat,
        dinhLuong,
        soTam,
        soCon,
        khoCat,
        daiCat,
        khoXen,
        daiXen,
        soLanXen,
        tlDuKien,
        tonSL,
        tonTL,
        tonTT,
        ghiChu
    };
    
    try {
        // Kiểm tra phiếu trùng
        const existingPhieuList = await PhieuCatAPI.getList();
        const isDuplicate = existingPhieuList.some(p => p.soPhieu === soPhieu);
        
        if (isDuplicate) {
            // Nếu phiếu trùng, khởi tạo xử lý phiếu trùng
            duplicateHandling.duplicates = [soPhieu];
            duplicateHandling.currentIndex = 0;
            duplicateHandling.newTickets = [phieu];
            duplicateHandling.ticketType = 'cat';
            duplicateHandling.skipped = false;
            
            // Hiển thị dialog xác nhận
            showDuplicateDialog(soPhieu, 'cat');
        } else {
            // Nếu không trùng, lưu trực tiếp
            await PhieuCatAPI.add(phieu);
            
            // Cập nhật danh sách và formula
            await loadPhieuCatList();
            await convertCatToFormula();
            
            // Reset form
            document.getElementById('form-cat-them').reset();
            
            alert('Đã lưu phiếu cắt thành công!');
            
            // Chuyển đến tab danh sách phiếu
            document.querySelector('#cat .sub-tab-btn[onclick="switchSubTab(\'cat-danhsach\')"]').click();
        }
    } catch (error) {
        console.error('Lỗi khi thêm phiếu cắt:', error);
        alert('Có lỗi khi thêm phiếu cắt: ' + error.message);
    }
}

// Hàm xử lý dán phiếu cắt
function processCatPaste() {
    const pasteArea = document.getElementById('cat-paste-area');
    const pasteData = pasteArea.value.trim();
    
    if (!pasteData) {
        alert('Vui lòng dán dữ liệu!');
        return;
    }
    
    // Tách dữ liệu thành các dòng
    const rows = pasteData.split('\n');
    if (rows.length < 2) {
        alert('Dữ liệu không hợp lệ!');
        return;
    }
    
    // Tạo cấu trúc dữ liệu
    const phieuList = [];
    
    for (let i = 1; i < rows.length; i++) { // Bỏ qua dòng header
        const cols = rows[i].split('\t');
        
        if (cols.length < 10) continue; // Bỏ qua dòng không đủ cột
        
        // Tạo phiếu mới
        const phieu = {
            id: Date.now().toString() + i,
            r: cols[0].trim(),
            soPhieu: cols[1].trim(),
            ngayCT: cols[2].trim(),
            soLSX: cols[3].trim(),
            dienGiai: cols[4].trim(),
            khachHang: cols[5].trim(),
            sanPham: cols[6].trim(),
            maPhu: cols[7].trim(),
            lo: cols[8].trim(),
            viTri: cols[9].trim(),
            stt: cols[10].trim(),
            maNL: cols[11].trim(),
            slDat: cols[12].trim(),
            dinhLuong: cols[13].trim(),
            soTam: cols[14].trim(),
            soCon: cols[15].trim(),
            khoCat: cols[16].trim(),
            daiCat: cols[17].trim(),
            khoXen: cols[18].trim(),
            daiXen: cols[19].trim(),
            soLanXen: cols[20].trim(),
            tlDuKien: cols[21].trim(),
            tonSL: cols[22].trim(),
            tonTL: cols[23].trim(),
            tonTT: cols[24].trim(),
            ghiChu: cols[25]?.trim() || ''
        };
        
        phieuList.push(phieu);
    }
    
    // Hiển thị dữ liệu đã xử lý trong bảng
    displayCatPasteData(phieuList);
}


/**
 * Phân tích và lưu dữ liệu phiếu cắt
 * Bổ sung xử lý STT đặc biệt cho phiếu cắt
 */
function parseAndSaveCatData(tbody) {
    // Lấy tất cả hàng (trừ hàng action)
    const rows = Array.from(tbody.querySelectorAll('tr:not(.action-row)'));
    if (rows.length === 0) {
        alert('Không có dữ liệu để xử lý!');
        return;
    }
    
    // Chuyển dữ liệu từ bảng thành cấu trúc dữ liệu phiếu
    const phieuData = {};  // Dùng object để nhóm theo số phiếu
    
    // Bước 1: Nhóm dữ liệu theo số phiếu
    rows.forEach((row) => {
        const cells = Array.from(row.cells).map(cell => cell.textContent.trim());
        
        // Bỏ qua hàng không có giá trị
        if (cells.every(cell => cell === '')) return;
        
        // Lấy số phiếu
        const soPhieu = cells[1];
        if (!soPhieu) return;
        
        // Tạo object phiếu nếu chưa có
        if (!phieuData[soPhieu]) {
            phieuData[soPhieu] = [];
        }
        
        // Thêm dữ liệu vào nhóm phiếu
        phieuData[soPhieu].push({
            r: cells[0],
            soPhieu: cells[1],
            ngayCT: cells[2],
            soLSX: cells[3],
            dienGiai: cells[4],
            khachHang: cells[5],
            sanPham: cells[6],
            maPhu: cells[7],
            lo: cells[8],
            viTri: cells[9],
            stt: cells[10],
            maNL: cells[11],
            slDat: cells[12],
            dinhLuong: cells[13],
            soTam: cells[14],
            soCon: cells[15],
            khoCat: cells[16],
            daiCat: cells[17],
            khoXen: cells[18],
            daiXen: cells[19],
            soLanXen: cells[20],
            tlDuKien: cells[21],
            tonSL: cells[22],
            tonTL: cells[23],
            tonTT: cells[24],
            ghiChu: cells[25] || ''
        });
    });
    
    // Mảng kết quả cuối cùng
    const processedPhieuList = [];
    
    // Bước 2: Xử lý từng nhóm phiếu
    Object.keys(phieuData).forEach(soPhieu => {
        const phieuGroup = phieuData[soPhieu];
        
        // Kiểm tra xem là phiếu tăng dần hay giảm dần
        let isDescending = false;
        
        if (phieuGroup.length > 1) {
            // Lấy các STT có giá trị số để so sánh
            const validSTTs = phieuGroup
                .map(p => p.stt)
                .filter(stt => stt && !isNaN(parseInt(stt)))
                .map(stt => parseInt(stt));
            
            if (validSTTs.length >= 2) {
                // Kiểm tra xem dãy số có giảm dần không
                isDescending = validSTTs[0] > validSTTs[1];
            }
        }
        
        if (isDescending) {
            // Trường hợp STT giảm dần (3,2,1,...)
            
            // Lưu liên kết giữa mã nguyên liệu và STT
            const maNLToSTT = {};
            const origSTTToMANL = {};
            
            phieuGroup.forEach(phieu => {
                if (phieu.stt && phieu.maNL) {
                    maNLToSTT[phieu.maNL] = phieu.stt;
                    origSTTToMANL[phieu.stt] = phieu.maNL;
                }
            });
            
            // Tạo mảng các STT và sắp xếp tăng dần
            const sortedSTTs = Object.values(maNLToSTT)
                .filter(stt => !isNaN(parseInt(stt)))
                .map(stt => parseInt(stt))
                .sort((a, b) => a - b);
            
            // Tạo map ánh xạ STT cũ -> STT mới
            const oldToNewSTT = {};
            sortedSTTs.forEach((oldSTT, index) => {
                oldToNewSTT[oldSTT] = index + 1;
            });
            
            // Tạo phiếu mới với STT chuẩn hóa tăng dần nhưng giữ liên kết mã nguyên liệu
            const newPhieuGroup = [];
            
            // Duyệt từng STT từ lớn đến nhỏ
            sortedSTTs.reverse().forEach(oldSTT => {
                const maNL = origSTTToMANL[oldSTT];
                
                // Tìm phiếu tương ứng với mã nguyên liệu
                const phieu = phieuGroup.find(p => p.maNL === maNL);
                
                if (phieu) {
                    // Tạo phiếu mới với STT đã chuẩn hóa
                    const newPhieu = {...phieu};
                    newPhieu.stt = oldToNewSTT[oldSTT].toString();
                    newPhieu.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                    
                    newPhieuGroup.push(newPhieu);
                    processedPhieuList.push(newPhieu);
                }
            });
        } else {
            // Trường hợp STT tăng dần hoặc không có STT rõ ràng
            phieuGroup.forEach((phieu, index) => {
                // Tạo phiếu mới với STT đã chuẩn hóa
                const newPhieu = {...phieu};
                newPhieu.stt = (index + 1).toString();
                newPhieu.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                
                processedPhieuList.push(newPhieu);
            });
        }
    });
    
    if (processedPhieuList.length === 0) {
        alert('Không tìm thấy phiếu hợp lệ trong dữ liệu!');
        return;
    }
    
    // Lưu dữ liệu
    saveCatPasteData(processedPhieuList);

    // Sau khi lưu thành công, reset bảng dán
clearCatPaste();
}

// Hàm hiển thị dữ liệu đã dán và xử lý trong bảng phiếu cắt
function displayCatPasteData(data) {
    const tableBody = document.querySelector('#cat-dan-table tbody');
    tableBody.innerHTML = '';
    
    data.forEach(phieu => {
        const phieuRow = document.createElement('tr');
        phieuRow.innerHTML = `
            <td>${phieu.r}</td>
            <td>${phieu.soPhieu}</td>
            <td>${phieu.ngayCT}</td>
            <td>${phieu.soLSX}</td>
            <td>${phieu.dienGiai}</td>
            <td>${phieu.khachHang}</td>
            <td>${phieu.sanPham}</td>
            <td>${phieu.maPhu}</td>
            <td>${phieu.lo}</td>
            <td>${phieu.viTri}</td>
            <td>${phieu.stt}</td>
            <td>${phieu.maNL}</td>
            <td>${phieu.slDat}</td>
            <td>${phieu.dinhLuong}</td>
            <td>${phieu.soTam}</td>
            <td>${phieu.soCon}</td>
            <td>${phieu.khoCat}</td>
            <td>${phieu.daiCat}</td>
            <td>${phieu.khoXen}</td>
            <td>${phieu.daiXen}</td>
            <td>${phieu.soLanXen}</td>
            <td>${phieu.tlDuKien}</td>
            <td>${phieu.tonSL}</td>
            <td>${phieu.tonTL}</td>
            <td>${phieu.tonTT}</td>
            <td>${phieu.ghiChu}</td>
        `;
        tableBody.appendChild(phieuRow);
    });
    
    // Thêm nút để xử lý tiếp dữ liệu
    const btnRow = document.createElement('tr');
    btnRow.innerHTML = `
        <td colspan="26" style="text-align: center;">
            <button id="cat-btn-save-paste" class="btn-primary">Lưu vào danh sách phiếu</button>
        </td>
    `;
    tableBody.appendChild(btnRow);
    
    // Gắn sự kiện cho nút lưu
    document.getElementById('cat-btn-save-paste').addEventListener('click', function() {
        saveCatPasteData(data);
    });
}

// Hàm lưu dữ liệu đã dán phiếu cắt
async function saveCatPasteData(data) {
    // Kiểm tra phiếu trùng
    const existingPhieuList = await PhieuCatAPI.getList();
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
        duplicateHandling.ticketType = 'cat';
        duplicateHandling.skipped = false;
        
        // Hiển thị dialog xác nhận đầu tiên
        showDuplicateDialog(duplicates[0], 'cat');
    } else {
        // Không có phiếu trùng, lưu trực tiếp
        await saveCatTicketsDirectly(data);
    }
}



/**
 * Xóa dữ liệu đã dán cho phiếu cắt
 */
function clearCatPaste() {
    const tbody = document.querySelector('#cat-dan-table tbody');
    if (!tbody) return;
    
    // Xóa tất cả các hàng trong tbody
    tbody.innerHTML = '';
    
    // Tạo lại dòng paste đầu tiên và dòng hướng dẫn
    const pasteRow = document.createElement('tr');
    pasteRow.id = 'cat-paste-row';
    
    // Tạo ô dán đầu tiên
    const pasteCell = document.createElement('td');
    pasteCell.id = 'cat-paste-cell';
    pasteCell.className = 'paste-cell';
    pasteCell.contentEditable = 'true';
    pasteCell.tabIndex = '1';
    pasteRow.appendChild(pasteCell);
    
    // Tạo các ô còn lại
    for (let i = 0; i < 25; i++) {
        const td = document.createElement('td');
        pasteRow.appendChild(td);
    }
    
    tbody.appendChild(pasteRow);
    
    // Thêm dòng hướng dẫn
    const instructionRow = document.createElement('tr');
    instructionRow.className = 'instruction-row';
    
    const instructionCell = document.createElement('td');
    instructionCell.colSpan = '26';
    instructionCell.innerHTML = '<em>Nhấn vào ô đầu tiên (R) và dán dữ liệu từ Excel</em>';
    
    instructionRow.appendChild(instructionCell);
    tbody.appendChild(instructionRow);

    // Quan trọng: Gắn lại sự kiện paste cho ô đầu tiên
    document.getElementById('cat-paste-cell').addEventListener('paste', handleExcelPaste);
    
    // Focus vào ô đầu tiên
    pasteCell.focus();
}

// Hàm load danh sách phiếu cắt từ API
async function loadPhieuCatList() {
    try {
        const phieuList = await PhieuCatAPI.getList();
        const tableBody = document.querySelector('#cat-danhsach-table tbody');
        
        // Xóa dữ liệu cũ
        tableBody.innerHTML = '';
        
        // Hiển thị dữ liệu
        phieuList.forEach(phieu => {
            const phieuRow = document.createElement('tr');
            phieuRow.dataset.id = phieu.id;
            phieuRow.innerHTML = `
                <td class="checkbox-cell"><input type="checkbox" class="phieu-checkbox" data-id="${phieu.id}"></td>
                <td>${phieu.r}</td>
                <td>${phieu.soPhieu}</td>
                <td>${phieu.ngayCT}</td>
                <td>${phieu.soLSX}</td>
                <td>${phieu.dienGiai}</td>
                <td>${phieu.khachHang}</td>
                <td>${phieu.sanPham}</td>
                <td>${phieu.maPhu}</td>
                <td>${phieu.lo}</td>
                <td>${phieu.viTri}</td>
                <td>${phieu.stt}</td>
                <td>${phieu.maNL}</td>
                <td>${phieu.slDat}</td>
                <td>${phieu.dinhLuong}</td>
                <td>${phieu.soTam}</td>
                <td>${phieu.soCon}</td>
                <td>${phieu.khoCat}</td>
                <td>${phieu.daiCat}</td>
                <td>${phieu.khoXen}</td>
                <td>${phieu.daiXen}</td>
                <td>${phieu.soLanXen}</td>
                <td>${phieu.tlDuKien}</td>
                <td>${phieu.tonSL}</td>
                <td>${phieu.tonTL}</td>
                <td>${phieu.tonTT}</td>
                <td>${phieu.ghiChu}</td>
                <td>
                    <button onclick="editPhieu('cat', '${phieu.id}')" class="btn-secondary">Sửa</button>
                    <button onclick="deletePhieu('cat', '${phieu.id}')" class="btn-danger">Xóa</button>
                </td>
            `;
            tableBody.appendChild(phieuRow);
        });
        
        // Gắn sự kiện cho các checkbox
        attachCheckboxEvents('cat-danhsach-table');
    } catch (error) {
        console.error('Lỗi khi tải danh sách phiếu cắt:', error);
    }
}


// Hàm chuyển đổi dữ liệu phiếu cắt sang formula từ API
async function convertCatToFormula() {
    try {
        const formulaList = await PhieuCatAPI.getFormula();
        const tableBody = document.querySelector('#cat-formula-table tbody');
        
        // Xóa dữ liệu cũ
        tableBody.innerHTML = '';
        
        // Hiển thị dữ liệu
        formulaList.forEach(formula => {
            const formulaRow = document.createElement('tr');
            formulaRow.innerHTML = `
                <td>${formula.ws}</td>
                <td>${formula.soPhieu}</td>
                <td>${formula.maPhieuPhu}</td>
                <td>${formula.phieu}</td>
                <td>${formula.wsF}</td>
                <td>${formula.ngayCT}</td>
                <td>${formula.maKH}</td>
                <td>${formula.khachHang}</td>
                <td>${formula.maSP}</td>
                <td>${formula.maNL}</td>
                <td>${formula.slDat}</td>
                <td>${formula.dinhLuong}</td>
                <td>${formula.soTam}</td>
                <td>${formula.soCon}</td>
                <td>${formula.khoCat}</td>
                <td>${formula.daiCat}</td>
                <td>${formula.xa}</td>
                <td>${formula.khoXa}</td>
                <td>${formula.tlDuTinh}</td>
                <td>${formula.khoXen}</td>
                <td>${formula.daiXen}</td>
                <td>${formula.khoDaiKhoXen}</td>
                <td>${formula.giayRam}</td>
                <td>${formula.dienGiai}</td>
            `;
            tableBody.appendChild(formulaRow);
        });
    } catch (error) {
        console.error('Lỗi khi tải formula cắt:', error);
    }
}


/**
 * Tạo hàng formula cho phiếu cắt
 */
function createCatFormulaRow(phieu, newSTT) {
    // Ngày chứng từ (dd/mm/yyyy)
    let ngayChungTu = phieu.ngayCT;
    if (!ngayChungTu) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        ngayChungTu = dd + '/' + mm + '/' + yyyy;
    } else {
        // Chuyển đổi từ định dạng yyyy-mm-dd sang dd/mm/yyyy nếu cần
        const parts = ngayChungTu.split('-');
        if (parts.length === 3) {
            ngayChungTu = parts[2] + '/' + parts[1] + '/' + parts[0];
        }
    }
    
    // Tỷ lệ Khổ cắt/khổ xén
    let tyLeKho = '';
    if (phieu.khoCat && phieu.khoXen && phieu.khoXen !== '0') {
        // Chuyển đổi sang số và làm tròn đến 2 chữ số thập phân
        const khoCat = parseFloat(formatNumberForFormula(phieu.khoCat));
        const khoXen = parseFloat(formatNumberForFormula(phieu.khoXen));
        
        if (!isNaN(khoCat) && !isNaN(khoXen) && khoXen !== 0) {
            tyLeKho = (khoCat / khoXen).toFixed(2);
        }
    }
    
    // Tạo hàng mới
    const phieuRow = document.createElement('tr');
    phieuRow.innerHTML = `
        <td>${phieu.soLSX}</td>
        <td>${phieu.soPhieu}</td>
        <td>${phieu.soPhieu}${newSTT}</td>
        <td></td>
        <td>${phieu.soLSX}</td>
        <td>${ngayChungTu}</td>
        <td></td>
        <td>${phieu.khachHang}</td>
        <td>${phieu.sanPham}</td>
        <td>${phieu.maNL}</td>
        <td>${formatNumberForFormula(phieu.slDat)}</td>
        <td>${formatNumberForFormula(phieu.dinhLuong)}</td>
        <td>${formatNumberForFormula(phieu.soTam)}</td>
        <td>${formatNumberForFormula(phieu.soCon)}</td>
        <td>${formatNumberForFormula(phieu.khoCat)}</td>
        <td>${formatNumberForFormula(phieu.daiCat)}</td>
        <td></td>
        <td>${formatNumberForFormula(phieu.khoCat)}</td>
        <td>${formatNumberForFormula(phieu.tlDuKien)}</td>
        <td>${formatNumberForFormula(phieu.khoXen)}</td>
        <td>${formatNumberForFormula(phieu.daiXen)}</td>
        <td>${tyLeKho}</td>
        <td>${phieu.ghiChu}</td>
        <td>${phieu.dienGiai}</td>
    `;
    
    return phieuRow;
}

// Hàm tạo form chỉnh sửa phiếu cắt
function createCatEditForm(container, id, data) {
    // Tìm phiếu cần chỉnh sửa
    const phieuList = JSON.parse(localStorage.getItem('phieuCat') || '[]');
    const phieu = phieuList.find(p => p.id === id) || data;
    
    if (!phieu) {
        container.innerHTML = '<p>Không tìm thấy phiếu cần chỉnh sửa!</p>';
        return;
    }
    
    // Tạo form chỉnh sửa
    const form = document.createElement('form');
    form.id = 'form-cat-edit';
    form.className = 'form-them-phieu';
    
    form.innerHTML = `
        <input type="hidden" id="edit-cat-id" value="${phieu.id}">
        
        <div class="form-row">
            <div class="form-group">
                <label for="edit-cat-r">R</label>
                <input type="text" id="edit-cat-r" value="${phieu.r || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-so-phieu">Số phiếu</label>
                <input type="text" id="edit-cat-so-phieu" value="${phieu.soPhieu || ''}" required>
            </div>
            <div class="form-group">
                <label for="edit-cat-ngay-ct">Ngày chứng từ</label>
                <input type="date" id="edit-cat-ngay-ct" value="${phieu.ngayCT || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-cat-so-lsx">Số LSX</label>
                <input type="text" id="edit-cat-so-lsx" value="${phieu.soLSX || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-dien-giai">Diễn giải</label>
                <input type="text" id="edit-cat-dien-giai" value="${phieu.dienGiai || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-khach-hang">Khách hàng</label>
                <input type="text" id="edit-cat-khach-hang" value="${phieu.khachHang || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-cat-san-pham">Sản phẩm</label>
                <input type="text" id="edit-cat-san-pham" value="${phieu.sanPham || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-ma-phu">Mã phụ</label>
                <input type="text" id="edit-cat-ma-phu" value="${phieu.maPhu || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-lo">Lô</label>
                <input type="text" id="edit-cat-lo" value="${phieu.lo || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-cat-vi-tri">Vị trí</label>
                <input type="text" id="edit-cat-vi-tri" value="${phieu.viTri || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-stt">STT</label>
                <input type="text" id="edit-cat-stt" value="${phieu.stt || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-ma-nl">Mã nguyên liệu</label>
                <input type="text" id="edit-cat-ma-nl" value="${phieu.maNL || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-cat-sl-dat">SL đặt</label>
                <input type="text" id="edit-cat-sl-dat" value="${phieu.slDat || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-dinh-luong">Định lượng</label>
                <input type="text" id="edit-cat-dinh-luong" value="${phieu.dinhLuong || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-so-tam">Số tấm</label>
                <input type="text" id="edit-cat-so-tam" value="${phieu.soTam || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-cat-so-con">Số con</label>
                <input type="text" id="edit-cat-so-con" value="${phieu.soCon || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-kho-cat">Khổ (cắt)</label>
                <input type="text" id="edit-cat-kho-cat" value="${phieu.khoCat || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-dai-cat">Dài (cắt)</label>
                <input type="text" id="edit-cat-dai-cat" value="${phieu.daiCat || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-cat-kho-xen">Khổ (xén)</label>
                <input type="text" id="edit-cat-kho-xen" value="${phieu.khoXen || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-dai-xen">Dài (xén)</label>
                <input type="text" id="edit-cat-dai-xen" value="${phieu.daiXen || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-so-lan-xen">Số lần (xén)</label>
                <input type="text" id="edit-cat-so-lan-xen" value="${phieu.soLanXen || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-cat-tl-du-kien">TL dự kiến</label>
                <input type="text" id="edit-cat-tl-du-kien" value="${phieu.tlDuKien || ''}">
            </div>
        </div>

        <h3>Thông tin tồn kho</h3>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-cat-ton-sl">Tồn kho số lượng</label>
                <input type="text" id="edit-cat-ton-sl" value="${phieu.tonSL || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-ton-tl">Tồn kho trọng lượng</label>
                <input type="text" id="edit-cat-ton-tl" value="${phieu.tonTL || ''}">
            </div>
            <div class="form-group">
                <label for="edit-cat-ton-tamtinh">Tồn kho tạm tính</label>
                <input type="text" id="edit-cat-ton-tamtinh" value="${phieu.tonTT || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="edit-cat-ghi-chu">Ghi chú</label>
                <input type="text" id="edit-cat-ghi-chu" value="${phieu.ghiChu || ''}">
            </div>
        </div>

        <div class="form-actions">
            <button type="submit" class="btn-primary">Lưu Thay Đổi</button>
            <button type="button" class="btn-secondary close-modal">Hủy</button>
        </div>
    `;
    
    container.appendChild(form);
    
    // Gắn sự kiện cho nút hủy
    document.querySelector('#form-cat-edit .close-modal').addEventListener('click', function() {
        document.getElementById('modal-edit').style.display = 'none';
    });
    
    // Gắn sự kiện submit form
    document.getElementById('form-cat-edit').addEventListener('submit', function(e) {
        e.preventDefault();
        updatePhieuCat();
    });
}

// Hàm cập nhật phiếu cắt
async function updatePhieuCat() {
    const id = document.getElementById('edit-cat-id').value;
    
    // Lấy dữ liệu từ form
    const soPhieu = getFormValue('edit-cat-so-phieu');
    if (!soPhieu) {
        alert('Vui lòng nhập số phiếu!');
        return;
    }
    
    const r = getFormValue('edit-cat-r');
    const ngayCT = getFormValue('edit-cat-ngay-ct');
    const soLSX = getFormValue('edit-cat-so-lsx');
    const dienGiai = getFormValue('edit-cat-dien-giai');
    const khachHang = getFormValue('edit-cat-khach-hang');
    const sanPham = getFormValue('edit-cat-san-pham');
    const maPhu = getFormValue('edit-cat-ma-phu');
    const lo = getFormValue('edit-cat-lo');
    const viTri = getFormValue('edit-cat-vi-tri');
    const stt = getFormValue('edit-cat-stt');
    const maNL = getFormValue('edit-cat-ma-nl');
    const slDat = getFormValue('edit-cat-sl-dat');
    const dinhLuong = getFormValue('edit-cat-dinh-luong');
    const soTam = getFormValue('edit-cat-so-tam');
    const soCon = getFormValue('edit-cat-so-con');
    const khoCat = getFormValue('edit-cat-kho-cat');
    const daiCat = getFormValue('edit-cat-dai-cat');
    const khoXen = getFormValue('edit-cat-kho-xen');
    const daiXen = getFormValue('edit-cat-dai-xen');
    const soLanXen = getFormValue('edit-cat-so-lan-xen');
    const tlDuKien = getFormValue('edit-cat-tl-du-kien');
    const tonSL = getFormValue('edit-cat-ton-sl');
    const tonTL = getFormValue('edit-cat-ton-tl');
    const tonTT = getFormValue('edit-cat-ton-tamtinh');
    const ghiChu = getFormValue('edit-cat-ghi-chu');
    
    // Tạo đối tượng phiếu mới
    const updatedPhieu = {
        id,
        r,
        soPhieu,
        ngayCT,
        soLSX,
        dienGiai,
        khachHang,
        sanPham,
        maPhu,
        lo,
        viTri,
        stt,
        maNL,
        slDat,
        dinhLuong,
        soTam,
        soCon,
        khoCat,
        daiCat,
        khoXen,
        daiXen,
        soLanXen,
        tlDuKien,
        tonSL,
        tonTL,
        tonTT,
        ghiChu
    };
    
    try {
        // Cập nhật phiếu trong API
        await PhieuCatAPI.update(id, updatedPhieu);
        
        // Cập nhật giao diện
        await loadPhieuCatList();
        await convertCatToFormula();
        
        // Đóng modal
        document.getElementById('modal-edit').style.display = 'none';
        
        alert('Đã cập nhật phiếu cắt thành công!');
    } catch (error) {
        console.error('Lỗi khi cập nhật phiếu cắt:', error);
        alert('Có lỗi khi cập nhật phiếu cắt: ' + error.message);
    }
}




// Xử lý phiếu cắt trùng
async function handleDuplicateCatTicket(ticketNumber, action, type) {
    try {
      // Lấy dữ liệu hiện tại
      const currentTickets = await PhieuCatAPI.getList();
      
      // Lấy phiếu mới có số phiếu trùng
      const newTickets = duplicateHandling.newTickets.filter(t => t.soPhieu === ticketNumber);
      
      // Lấy các phiếu cũ có cùng số phiếu
      const oldTickets = currentTickets.filter(t => t.soPhieu === ticketNumber);
        
        // Kiểm tra xem phiếu cũ có STT ngược không
        let isOldDescending = false;
        if (oldTickets.length > 1) {
          const oldStts = oldTickets.map(t => parseInt(t.stt)).filter(stt => !isNaN(stt));
          if (oldStts.length >= 2 && oldStts[0] > oldStts[1]) {
            isOldDescending = true;
          }
        }
        
        // Kiểm tra xem phiếu mới có STT ngược không
        let isNewDescending = false;
        if (newTickets.length > 1) {
          const newStts = newTickets.map(t => parseInt(t.stt)).filter(stt => !isNaN(stt));
          if (newStts.length >= 2 && newStts[0] > newStts[1]) {
            isNewDescending = true;
          }
        }
        
        if (action === 'replace') {
          // THAY ĐỔI: Chỉ thay thế những phiếu có STT trùng khớp hoặc theo vị trí tương ứng
          
          // Nếu không có phiếu cũ, thêm phiếu mới
          if (oldTickets.length === 0) {
            await Promise.all(newTickets.map(ticket => PhieuCatAPI.add(ticket)));
            return;
          }
          
          // Xác định phiếu cần thay thế dựa trên STT
          let ticketsToDelete = [];
          let ticketsToKeep = [...oldTickets];
          
          // Nếu số lượng phiếu mới <= số lượng phiếu cũ, thay thế theo STT hoặc vị trí
          if (newTickets.length <= oldTickets.length) {
            // Lấy các STT của phiếu mới
            const newStts = newTickets.map(t => t.stt);
            
            // Phiếu cần xóa là những phiếu có STT trùng với phiếu mới
            ticketsToDelete = oldTickets.filter(t => newStts.includes(t.stt));
            
            // Nếu không tìm thấy phiếu trùng STT, thay thế theo vị trí (từ đầu)
            if (ticketsToDelete.length === 0) {
              // Sắp xếp phiếu cũ theo STT
              const sortedOldTickets = [...oldTickets].sort((a, b) => {
                const aSTT = parseInt(a.stt) || 0;
                const bSTT = parseInt(b.stt) || 0;
                return isOldDescending ? bSTT - aSTT : aSTT - bSTT;
              });
              
              // Lấy các phiếu cần thay thế từ đầu danh sách
              ticketsToDelete = sortedOldTickets.slice(0, newTickets.length);
            }
            
            // Cập nhật danh sách phiếu cần giữ lại
            ticketsToKeep = oldTickets.filter(t => !ticketsToDelete.some(d => d.id === t.id));
          } else {
            // Nếu có nhiều phiếu mới hơn phiếu cũ, thay thế tất cả phiếu cũ và thêm phiếu mới còn lại
            ticketsToDelete = [...oldTickets];
            ticketsToKeep = [];
          }
          
          // Xóa các phiếu cần thay thế
          await Promise.all(ticketsToDelete.map(ticket => PhieuCatAPI.delete(ticket.id)));
          
          // Nếu phiếu cũ có STT ngược và phiếu mới không ngược, cần đảo STT phiếu mới
          if (isOldDescending && !isNewDescending && newTickets.length > 1) {
            // Sắp xếp phiếu mới theo STT giảm dần
            newTickets.sort((a, b) => parseInt(b.stt) - parseInt(a.stt));
          } 
          // Nếu phiếu cũ không ngược và phiếu mới ngược, cần đảo lại
          else if (!isOldDescending && isNewDescending && newTickets.length > 1) {
            // Sắp xếp phiếu mới theo STT tăng dần
            newTickets.sort((a, b) => parseInt(a.stt) - parseInt(b.stt));
          }
          
          // Thêm phiếu mới
          await Promise.all(newTickets.map(ticket => PhieuCatAPI.add(ticket)));
          
        } else { // action === 'add'
              // Bỏ qua thay thế: Thêm phiếu mới vào cuối
              
              // Lấy STT lớn nhất/nhỏ nhất trong phiếu cũ
              let maxOrMinStt = 0;
              oldTickets.forEach(ticket => {
                  const stt = parseInt(ticket.stt);
                  if (!isNaN(stt)) {
                      if (isOldDescending) {
                          // Nếu STT ngược, lấy số lớn nhất
                          if (stt > maxOrMinStt) {
                              maxOrMinStt = stt;
                          }
                      } else {
                          // Nếu STT bình thường, lấy số lớn nhất
                          if (stt > maxOrMinStt) {
                              maxOrMinStt = stt;
                          }
                      }
                  }
              });
              
              // Cập nhật STT cho phiếu mới
              newTickets.forEach((ticket, index) => {
                  if (isOldDescending) {
                      // Nếu STT ngược, tăng từ số lớn nhất
                      ticket.stt = (maxOrMinStt + index + 1).toString();
                  } else {
                      // Nếu STT bình thường, tăng từ số lớn nhất
                      ticket.stt = (maxOrMinStt + index + 1).toString();
                  }
              });
              
              // Sắp xếp lại nếu cần
              if (isOldDescending) {
                  // Nếu STT ngược, sắp xếp theo STT giảm dần
                  newTickets.sort((a, b) => parseInt(b.stt) - parseInt(a.stt));
              }
              
              // Thêm phiếu mới
              await Promise.all(newTickets.map(ticket => PhieuCatAPI.add(ticket)));
          }
  
           // Thêm dòng này sau khi thêm phiếu mới trong các trường hợp
        await updateMatchingGMCReports(newTickets);
  
      } catch (error) {
          console.error('Lỗi khi xử lý phiếu cắt trùng:', error);
          alert('Có lỗi khi xử lý phiếu cắt trùng: ' + error.message);
      }
  }

  
  // Xử lý dữ liệu Excel cho phiếu Cắt
function processExcelDataCat(rows) {
    // Chuyển đổi dữ liệu từ Excel thành cấu trúc phù hợp
    const phieuData = {};  // Dùng object để nhóm theo số phiếu
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Bỏ qua hàng không có giá trị
        if (row.every(cell => cell === '')) continue;
        
        // Lấy số phiếu (cột thứ 2)
        const soPhieu = row[1] ? row[1].toString().trim() : '';
        if (!soPhieu) continue;
        
        // Tạo object phiếu nếu chưa có
        if (!phieuData[soPhieu]) {
            phieuData[soPhieu] = [];
        }
        
        // Thêm dữ liệu vào nhóm phiếu
        phieuData[soPhieu].push({
            r: row[0] ? row[0].toString().trim() : '',
            soPhieu: soPhieu,
            ngayCT: formatExcelDate(row[2]),
            soLSX: row[3] ? row[3].toString().trim() : '',
            dienGiai: row[4] ? row[4].toString().trim() : '',
            khachHang: row[5] ? row[5].toString().trim() : '',
            sanPham: row[6] ? row[6].toString().trim() : '',
            maPhu: row[7] ? row[7].toString().trim() : '',
            lo: row[8] ? row[8].toString().trim() : '',
            viTri: row[9] ? row[9].toString().trim() : '',
            stt: row[10] ? row[10].toString().trim() : '',
            maNL: row[11] ? row[11].toString().trim() : '',
            slDat: row[12] ? row[12].toString().trim() : '',
            dinhLuong: row[13] ? row[13].toString().trim() : '',
            soTam: row[14] ? row[14].toString().trim() : '',
            soCon: row[15] ? row[15].toString().trim() : '',
            khoCat: row[16] ? row[16].toString().trim() : '',
            daiCat: row[17] ? row[17].toString().trim() : '',
            khoXen: row[18] ? row[18].toString().trim() : '',
            daiXen: row[19] ? row[19].toString().trim() : '',
            soLanXen: row[20] ? row[20].toString().trim() : '',
            tlDuKien: row[21] ? row[21].toString().trim() : '',
            tonSL: row[22] ? row[22].toString().trim() : '',
            tonTL: row[23] ? row[23].toString().trim() : '',
            tonTT: row[24] ? row[24].toString().trim() : '',
            ghiChu: row[25] ? row[25].toString().trim() : ''
        });
    }
    
    // Mảng kết quả cuối cùng
    const processedPhieuList = [];
    
    // Xử lý từng nhóm phiếu
    Object.keys(phieuData).forEach(soPhieu => {
        const phieuGroup = phieuData[soPhieu];
        
        // Kiểm tra xem là phiếu tăng dần hay giảm dần
        let isDescending = false;
        
        if (phieuGroup.length > 1) {
            // Lấy các STT có giá trị số để so sánh
            const validSTTs = phieuGroup
                .map(p => p.stt)
                .filter(stt => stt && !isNaN(parseInt(stt)))
                .map(stt => parseInt(stt));
            
            if (validSTTs.length >= 2) {
                // Kiểm tra xem dãy số có giảm dần không
                isDescending = validSTTs[0] > validSTTs[1];
            }
        }
        
        if (isDescending) {
            // Trường hợp STT giảm dần (3,2,1,...)
            
            // Lưu liên kết giữa mã nguyên liệu và STT
            const maNLToSTT = {};
            const origSTTToMANL = {};
            
            phieuGroup.forEach(phieu => {
                if (phieu.stt && phieu.maNL) {
                    maNLToSTT[phieu.maNL] = phieu.stt;
                    origSTTToMANL[phieu.stt] = phieu.maNL;
                }
            });
            
            // Tạo mảng các STT và sắp xếp tăng dần
            const sortedSTTs = Object.values(maNLToSTT)
                .filter(stt => !isNaN(parseInt(stt)))
                .map(stt => parseInt(stt))
                .sort((a, b) => a - b);
            
            // Tạo map ánh xạ STT cũ -> STT mới
            const oldToNewSTT = {};
            sortedSTTs.forEach((oldSTT, index) => {
                oldToNewSTT[oldSTT] = index + 1;
            });
            
            // Duyệt từng STT từ lớn đến nhỏ
            sortedSTTs.reverse().forEach(oldSTT => {
                const maNL = origSTTToMANL[oldSTT];
                
                // Tìm phiếu tương ứng với mã nguyên liệu
                const phieu = phieuGroup.find(p => p.maNL === maNL);
                
                if (phieu) {
                    // Tạo phiếu mới với STT đã chuẩn hóa
                    const newPhieu = {...phieu};
                    newPhieu.stt = oldToNewSTT[oldSTT].toString();
                    newPhieu.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                    
                    processedPhieuList.push(newPhieu);
                }
            });
        } else {
            // Trường hợp STT tăng dần hoặc không có STT rõ ràng
            phieuGroup.forEach((phieu, index) => {
                // Tạo phiếu mới với STT đã chuẩn hóa
                const newPhieu = {...phieu};
                newPhieu.stt = (index + 1).toString();
                newPhieu.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                
                processedPhieuList.push(newPhieu);
            });
        }
    });
    
    if (processedPhieuList.length === 0) {
        alert('Không tìm thấy phiếu hợp lệ trong file Excel!');
        return;
    }
    
    // Lưu dữ liệu
    saveCatPasteData(processedPhieuList);
}


// Hàm này sẽ được gọi sau khi xử lý dữ liệu phiếu cắt
// Thêm đoạn code này vào hàm updateMatchingGMCReports trong file main.js
async function updateMatchingGMCReports(processedPhieuList) {
    try {
      // Lấy tất cả báo cáo GMC
      const response = await fetch('/api/bao-cao-gmc/list');
      if (!response.ok) {
        console.error('Không thể lấy danh sách báo cáo GMC để cập nhật:', await response.text());
        return;
      }
      
      const gmcReports = await response.json();
      console.log(`Đang kiểm tra ${gmcReports.length} báo cáo GMC để cập nhật`);
      
      // Theo dõi số lượng báo cáo sẽ được cập nhật
      let updateCount = 0;
      let pendingUpdates = [];
      
      // Duyệt qua từng mục phiếu cắt đã xử lý
      for (const phieu of processedPhieuList) {
        // Tìm báo cáo GMC trùng khớp dựa trên số phiếu và STT
        const matchingReports = gmcReports.filter(report => 
          report.so_phieu_cat_giay === phieu.soPhieu && 
          report.thu_tu_cuon === phieu.stt
        );
        
        if (matchingReports.length > 0) {
          console.log(`Tìm thấy ${matchingReports.length} báo cáo GMC khớp với phiếu cắt ${phieu.soPhieu}-${phieu.stt}`);
        }
        
        // Cập nhật từng báo cáo trùng khớp nếu cần
        for (const report of matchingReports) {
          // Kiểm tra xem báo cáo này có trường trống cần cập nhật không
          const needsUpdate = (
            (!report.so_ws || report.so_ws === '') ||
            (!report.khach_hang || report.khach_hang === '') ||
            (!report.ma_giay || report.ma_giay === '') ||
            (!report.so_to_pallet || report.so_to_pallet === '') ||
            (!report.kho_cat || report.kho_cat === '') ||
            (!report.dai_cat || report.dai_cat === '')
          );
          
          if (needsUpdate) {
            console.log(`Báo cáo GMC ID ${report.id} cần cập nhật cho ${phieu.soPhieu}-${phieu.stt}`);
            
            // Chuẩn bị dữ liệu cập nhật
            const updateData = {
              id: report.id,
              so_ws: phieu.soLSX || report.so_ws || '',
              khach_hang: phieu.khachHang || report.khach_hang || '',
              ma_giay: phieu.maNL || report.ma_giay || '',
              so_to_pallet: phieu.soTam || phieu.soCon || report.so_to_pallet || '',
              kho_cat: phieu.khoCat || report.kho_cat || '',
              dai_cat: phieu.daiCat || report.dai_cat || '',
              kho_xen: phieu.khoXen || report.kho_xen || '',
              dai_xen: phieu.daiXen || report.dai_xen || '',
              dinh_luong: phieu.dinhLuong || report.dinh_luong || ''
            };
            
            // Thêm vào danh sách cần cập nhật
            pendingUpdates.push({ reportId: report.id, data: updateData });
            updateCount++;
          }
        }
      }
      
      // Xử lý tất cả cập nhật đang chờ
      if (pendingUpdates.length > 0) {
        console.log(`Đang xử lý ${pendingUpdates.length} cập nhật báo cáo GMC`);
        
        // Thực hiện cập nhật tuần tự để tránh quá tải máy chủ
        for (const update of pendingUpdates) {
          try {
            const updateResponse = await fetch(`/api/bao-cao-gmc/update-formula/${update.reportId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(update.data),
            });
            
            if (!updateResponse.ok) {
              console.error(`Không thể cập nhật báo cáo GMC ID ${update.reportId}:`, await updateResponse.text());
            }
          } catch (updateError) {
            console.error(`Lỗi khi cập nhật báo cáo GMC ID ${update.reportId}:`, updateError);
          }
        }
        
        console.log(`Đã xử lý thành công ${updateCount} cập nhật báo cáo GMC`);
        // Hiển thị thông báo cho người dùng về các cập nhật
        if (typeof showNotification === 'function') {
          showNotification(`Đã cập nhật ${updateCount} báo cáo GMC với dữ liệu mới từ phiếu cắt`, 'success');
        }
      } else {
        console.log('Không có báo cáo GMC nào cần cập nhật');
      }
    } catch (error) {
      console.error('Lỗi khi xử lý cập nhật GMC:', error);
    }
  }
  