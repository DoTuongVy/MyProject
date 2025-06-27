// ====================================================================
// PHẦN CHUNG CHO CẢ 2 LOẠI PHIẾU
// ====================================================================
// === Khởi tạo dữ liệu khi trang tải xong ===
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo dữ liệu ban đầu từ API
    initData();
    
    // Gắn sự kiện cho các tab chính
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Xử lý khi tab được click
        });
    });
    
    // Gắn sự kiện cho các form
    document.getElementById('form-sc-them').addEventListener('submit', function(e) {
        e.preventDefault();
        submitPhieuSangCuon();
    });
    
    document.getElementById('form-cat-them').addEventListener('submit', function(e) {
        e.preventDefault();
        submitPhieuCat();
    });
    
    // Sự kiện dán phiếu 
    document.getElementById('sc-paste-cell').addEventListener('paste', handleExcelPaste);
    document.getElementById('cat-paste-cell').addEventListener('paste', handleExcelPaste);
    
    // Gắn sự kiện cho các nút xóa dữ liệu dán
    document.getElementById('sc-btn-xoa').addEventListener('click', clearScPaste);
    document.getElementById('cat-btn-xoa').addEventListener('click', clearCatPaste);
    
    // Gắn sự kiện tìm kiếm
    document.getElementById('sc-search').addEventListener('input', function() {
        searchPhieu('sc-danhsach-table', this.value);
    });
    
    document.getElementById('cat-search').addEventListener('input', function() {
        searchPhieu('cat-danhsach-table', this.value);
    });
    
    document.getElementById('sc-formula-search').addEventListener('input', function() {
        searchPhieu('sc-formula-table', this.value);
    });
    
    document.getElementById('cat-formula-search').addEventListener('input', function() {
        searchPhieu('cat-formula-table', this.value);
    });

    // Gắn sự kiện cho nút chọn tất cả
    document.getElementById('sc-select-all')?.addEventListener('change', function() {
        toggleSelectAll('sc-danhsach-table', this.checked);
    });
    
    document.getElementById('cat-select-all')?.addEventListener('change', function() {
        toggleSelectAll('cat-danhsach-table', this.checked);
    });
    // Thêm sự kiện click trực tiếp cho checkbox
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('phieu-checkbox')) {
            const tableId = e.target.closest('table').id;
            const type = tableId === 'sc-danhsach-table' ? 'sc' : 'cat';
            
            // Highlight hàng khi chọn
            const row = e.target.closest('tr');
            if (e.target.checked) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
            
            // Cập nhật trạng thái nút chọn tất cả
            updateSelectAllState(tableId);
            
            // Cập nhật trạng thái nút xóa
            updateDeleteButtonState(type);
        }
    });

    // Thêm sự kiện click cho nút Chọn tất cả
    const scSelectAll = document.getElementById('sc-select-all');
    if (scSelectAll) {
        scSelectAll.addEventListener('click', function() {
            setTimeout(function() {
                updateDeleteButtonState('sc');
            }, 50);
        });
    }

    const catSelectAll = document.getElementById('cat-select-all');
    if (catSelectAll) {
        catSelectAll.addEventListener('click', function() {
            setTimeout(function() {
                updateDeleteButtonState('cat');
            }, 50);
        });
    }
    
    // Gắn sự kiện cho nút xóa đã chọn
    document.getElementById('sc-btn-delete-selected')?.addEventListener('click', function() {
        deleteSelectedPhieu('sc');
    });
    
    document.getElementById('cat-btn-delete-selected')?.addEventListener('click', function() {
        deleteSelectedPhieu('cat');
    });
    
    // Gắn sự kiện xuất Excel
    document.getElementById('sc-btn-export').addEventListener('click', function() {
        exportToExcel('sc-danhsach-table', 'PhieuSangCuon');
    });
    
    document.getElementById('cat-btn-export').addEventListener('click', function() {
        exportToExcel('cat-danhsach-table', 'PhieuCat');
    });
    
    document.getElementById('sc-formula-export').addEventListener('click', function() {
        exportToExcel('sc-formula-table', 'PhieuSangCuonFormula');
    });
    
    document.getElementById('cat-formula-export').addEventListener('click', function() {
        exportToExcel('cat-formula-table', 'PhieuCatFormula');
    });
    
    // Thêm mã hàng nhập
    document.getElementById('sc-them-mhn').addEventListener('click', function() {
        addMaHangNhapField();
    });
    
    // Xử lý đóng modal
    let closeButton = document.querySelector('.close');
    closeButton.addEventListener('click', function() {
        document.getElementById('modal-edit').style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        let modal = document.getElementById('modal-edit');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Thêm sự kiện cho nút import Excel nếu tồn tại
    document.getElementById('sc-btn-import')?.addEventListener('click', function() {
        document.getElementById('sc-file-import')?.click();
    });
    
    document.getElementById('cat-btn-import')?.addEventListener('click', function() {
        document.getElementById('cat-file-import')?.click();
    });
    
    // Thêm sự kiện cho input file import
    document.getElementById('sc-file-import')?.addEventListener('change', handleFileSelect);
    document.getElementById('cat-file-import')?.addEventListener('change', handleFileSelect);
    
    // Thêm style cho modal xử lý phiếu trùng
    addDuplicateModalStyle();

    initDeleteButtonState();
});



//! =================================================================
//? CHỨC NĂNG XỬ LÝ DÁN DỮ LIỆU CẢ 2 PHIẾU   =================================================================
//! =================================================================

/**
 * Xử lý sự kiện paste
 */
function handleExcelPaste(e) {
    e.preventDefault();
    
    // Lấy dữ liệu từ clipboard
    const pasteData = (e.clipboardData || window.clipboardData).getData('text');
    if (!pasteData.trim()) return;
    
    // Chuẩn hóa dữ liệu xuống dòng
    const normalizedData = pasteData.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Tách dữ liệu thành các hàng và cột
    const rows = normalizedData.split('\n')
        .filter(row => row.trim() !== '');  // Lọc bỏ hàng trống
    
    // Xác định loại phiếu đang được xử lý
    const tableId = e.target.closest('table').id;
    const isScTable = tableId === 'sc-dan-table';
    
    // Lấy tbody để thêm dữ liệu
    const tbody = e.target.closest('table').querySelector('tbody');
    if (!tbody) return;
    
    // Xóa nội dung cũ của bảng
    tbody.innerHTML = '';
    
    // Phân tích và hiển thị dữ liệu trong bảng
    let currentRow, currentCells;
    
    for (const rowData of rows) {
        // Tách dữ liệu hàng theo tab hoặc dấu cách
        let cells;
        if (rowData.includes('\t')) {
            // Nếu có tab, tách theo tab
            cells = rowData.split('\t');
        } else {
            // Nếu không có tab, thử phân tích chuỗi
            cells = parseNonTabData(rowData, isScTable);
        }
        
        // Tạo hàng mới
        currentRow = document.createElement('tr');
        currentCells = cells;
        
        // Thêm các ô vào hàng
        for (let i = 0; i < cells.length; i++) {
            const td = document.createElement('td');
            td.contentEditable = "true"; // Cho phép chỉnh sửa trực tiếp
            td.textContent = cells[i] || '';
            currentRow.appendChild(td);
        }
        
        // Đảm bảo đủ số cột
        const numCols = isScTable ? 19 : 26;
        while (currentRow.cells.length < numCols) {
            const td = document.createElement('td');
            currentRow.appendChild(td);
        }
        
        // Thêm hàng vào bảng
        tbody.appendChild(currentRow);
    }
    
    // Thêm nút xử lý dữ liệu
    const btnRow = document.createElement('tr');
    btnRow.className = 'action-row';
    btnRow.innerHTML = `
        <td colspan="${isScTable ? 19 : 26}" style="text-align: center;">
            <button id="${isScTable ? 'sc' : 'cat'}-btn-save-paste" class="btn-primary">Xử lý dữ liệu</button>
        </td>
    `;
    tbody.appendChild(btnRow);
    
    // Gắn sự kiện cho nút lưu
    document.getElementById(`${isScTable ? 'sc' : 'cat'}-btn-save-paste`).addEventListener('click', function() {
        if (isScTable) {
            parseAndSaveSangCuonData(tbody);
        } else {
            parseAndSaveCatData(tbody);
        }
    });
}

/**
 * Phân tích dữ liệu không có tab (sử dụng cách phân tích heuristic)
 */
function parseNonTabData(rowData, isScTable) {
    // Nếu là dữ liệu phiếu sang cuộn
    if (isScTable) {
        // Mẫu cho phiếu sang cuộn: PSCxxxx, Ngày, LSX, Diễn giải, Khách hàng, Sản phẩm, Mã phụ...
        const patterns = [
            /^(PSC\d+)/,  // Số phiếu
            /(\d{1,2}\/\d{1,2}\/\d{4})/,  // Ngày CT
            /(\d{8}-\d+)/,  // Số LSX
            /([A-Z0-9 ]+)/,  // Diễn giải
            /([A-Z0-9\s&\-]+)/,  // Khách hàng
            /([A-Z0-9]+)/,  // Sản phẩm
            /([\w\d-]+)/,  // Mã phụ
            /(\d+)/,  // STT Xuất
            /([\w\d-]+)/,  // MHKX
            /(\d+(?:\.\d+)?)/,  // ĐL xuất
            /(\d+(?:\.\d+)?)/,  // SL xuất
            /(\d+(?:\.\d+)?)/,  // TL xuất
            /(\d+)/,  // STT nhập
            /([\w\d-]+)/,  // MHN
            /(\d+(?:\.\d+)?)/,  // SL nhập
            /(\d+(?:\.\d+)?)/,  // TL nhập
            /(\d+(?:\.\d+)?)/,  // Tồn SL
            /(\d+(?:\.\d+)?)/,  // Tồn TL
            /(\d+(?:\.\d+)?)/   // Tồn TT
        ];
        
        return extractMatchedGroups(rowData, patterns);
    } else {
        // Mẫu cho phiếu cắt
        const patterns = [
            /^(\d+)/,  // R
            /(PC\d+)/,  // Số phiếu
            /(\d{1,2}\/\d{1,2}\/\d{4})/,  // Ngày
            /(\d{8}-\d+)/,  // LSX
            // ... thêm các mẫu khác cho phiếu cắt
        ];
        
        return extractMatchedGroups(rowData, patterns);
    }
}

/**
 * Trích xuất các nhóm khớp với mẫu từ chuỗi
 */
function extractMatchedGroups(text, patterns) {
    const result = [];
    let remainingText = text;
    
    for (const pattern of patterns) {
        const match = remainingText.match(pattern);
        if (match && match[1]) {
            result.push(match[1]);
            // Cắt phần đã khớp khỏi chuỗi còn lại
            remainingText = remainingText.substring(match.index + match[0].length).trim();
        } else {
            // Không tìm thấy mẫu, thêm giá trị trống
            result.push('');
        }
    }
    
    return result;
}





// Hàm chuyển tab chính
function switchTab(tabId) {
    // Ẩn tất cả các tab
    document.querySelectorAll('.content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Hiển thị tab được chọn
    document.getElementById(tabId).classList.add('active');
    
    // Cập nhật trạng thái active cho nút tab
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.classList.remove('active');
    });
    
    // Nút hiện tại được active
    event.target.classList.add('active');
    
    // Đảm bảo sub-tab đầu tiên luôn được chọn khi chuyển tab chính
    let activeContent = document.getElementById(tabId);
    let firstSubTab = activeContent.querySelector('.sub-tab-btn');
    if (firstSubTab) {
        firstSubTab.click();
    }
}

// Hàm chuyển sub-tab
function switchSubTab(tabId) {
    // Xác định tab chính nào đang active
    let activeMain = document.querySelector('.content.active');
    
    // Ẩn tất cả các sub-tab trong tab chính đang active
    activeMain.querySelectorAll('.sub-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Hiển thị sub-tab được chọn
    document.getElementById(tabId).classList.add('active');
    
    // Cập nhật trạng thái active cho nút sub-tab
    activeMain.querySelectorAll('.sub-tab-btn').forEach(button => {
        button.classList.remove('active');
    });
    
    // Nút hiện tại được active
    event.target.classList.add('active');
}

// Hàm khởi tạo dữ liệu ban đầu
async function initData() {
    // Load dữ liệu ban đầu
    await loadPhieuSangCuonList();
    await loadPhieuCatList();
    
    // Chuyển đổi formula
    await convertSangCuonToFormula();
    await convertCatToFormula();
}

/**
 * Cải thiện tìm kiếm phiếu để hiển thị tất cả các hàng liên quan
 */
function searchPhieu(tableId, keyword) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.getElementsByTagName('tr');
    if (!rows.length) return;
    
    keyword = keyword.toLowerCase();
    
    // Đầu tiên, đánh dấu tất cả là không hiển thị
    for (let i = 1; i < rows.length; i++) {
        rows[i].style.display = 'none';
    }
    
    // Khi không có từ khóa, hiển thị tất cả
    if (!keyword) {
        for (let i = 1; i < rows.length; i++) {
            rows[i].style.display = '';
        }
        return;
    }
    
    // Tìm các phiếu phù hợp và lưu số phiếu
    const matchedPhieuNumbers = new Set();
    
    // Bắt đầu từ 1 để bỏ qua hàng header
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.getElementsByTagName('td');
        
        // Kiểm tra xem đây có phải là hàng chính của phiếu không
        const soPhieuCell = cells[1]; // Cột số phiếu
        if (soPhieuCell && soPhieuCell.textContent.trim() !== '') {
            const soPhieu = soPhieuCell.textContent.trim();
            
            // Kiểm tra xem số phiếu có chứa từ khóa không
            if (soPhieu.toLowerCase().includes(keyword)) {
                matchedPhieuNumbers.add(soPhieu);
            }
        }
    }
    
    // Hiển thị tất cả các hàng của phiếu phù hợp
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.getElementsByTagName('td');
        
        // Kiểm tra là hàng chính hay hàng con
        const soPhieuCell = cells[1]; // Cột số phiếu
        if (soPhieuCell && soPhieuCell.textContent.trim() !== '') {
            const soPhieu = soPhieuCell.textContent.trim();
            
            // Nếu phiếu này nằm trong danh sách phù hợp
            if (matchedPhieuNumbers.has(soPhieu)) {
                row.style.display = '';
                
                // Hiển thị các hàng con tiếp theo cho đến khi gặp hàng chính mới
                let nextIndex = i + 1;
                while (nextIndex < rows.length) {
                    const nextRow = rows[nextIndex];
                    const nextCells = nextRow.getElementsByTagName('td');
                    const nextSoPhieuCell = nextCells[1];
                    
                    // Nếu hàng tiếp theo là hàng chính (có số phiếu), dừng lại
                    if (nextSoPhieuCell && 
                        nextSoPhieuCell.textContent.trim() !== '' && 
                        nextSoPhieuCell.textContent.trim() !== soPhieu) {
                        break;
                    }
                    
                    // Hiển thị hàng con
                    nextRow.style.display = '';
                    nextIndex++;
                }
            }
        }
    }
}

// Hàm xuất dữ liệu sang Excel định dạng xlsx với bảng được định dạng
// function exportToExcel(tableId, fileName) {
//     // Đảm bảo thư viện SheetJS đã được tải
//     if (!window.XLSX) {
//         alert('Đang tải thư viện Excel, vui lòng đợi trong giây lát...');
//         loadSheetJSLibrary().then(() => {
//             exportToExcel(tableId, fileName);
//         });
//         return;
//     }
    
//     const table = document.getElementById(tableId);
//     const rows = table.querySelectorAll('tr');
    
//     // Tạo workbook mới
//     const wb = XLSX.utils.book_new();
    
//     // Chuẩn bị dữ liệu cho worksheet
//     const data = [];
    
//     // Lấy tiêu đề từ thead
//     const headerRow = [];
//     const headers = rows[0].querySelectorAll('th');
//     for (let i = 0; i < headers.length; i++) {
//         // Bỏ qua cột checkbox nếu có
//         if (i === 0 && headers[i].querySelector('input[type="checkbox"]')) {
//             continue;
//         }
//         // Bỏ qua cột "Thao tác" nếu có
//         if (headers[i].textContent.trim() === 'Thao tác') {
//             continue;
//         }
//         headerRow.push(headers[i].textContent.trim());
//     }
//     data.push(headerRow);
    
//     // Lấy dữ liệu từ các hàng tbody
//     for (let i = 1; i < rows.length; i++) {
//         if (rows[i].style.display !== 'none') { // Chỉ xuất các hàng đang hiển thị
//             const cells = rows[i].querySelectorAll('td');
//             const rowData = [];
            
//             for (let j = 0; j < cells.length; j++) {
//                 // Bỏ qua cột checkbox nếu có
//                 if (j === 0 && cells[j].classList.contains('checkbox-cell')) {
//                     continue;
//                 }
//                 // Bỏ qua cột thao tác nếu có
//                 if (j === cells.length - 1 && cells[j].querySelector('button')) {
//                     continue;
//                 }
                
//                 // Chỉ lấy nội dung text, loại bỏ các nút
//                 rowData.push(cells[j].textContent.replace(/\s*Sửa\s*Xóa\s*/g, '').trim());
//             }
            
//             // Chỉ thêm hàng nếu có dữ liệu
//             if (rowData.some(cell => cell !== '')) {
//                 data.push(rowData);
//             }
//         }
//     }
    
//     // Tạo worksheet từ dữ liệu
//     const ws = XLSX.utils.aoa_to_sheet(data);
    
//     // Tạo các style cho worksheet
//     ws['!cols'] = headerRow.map(() => ({ wch: 15 })); // Độ rộng cột mặc định
    
//     // Một số cột thường cần rộng hơn
//     const widerColumns = ['Diễn giải', 'Khách hàng', 'Ghi chú'];
//     widerColumns.forEach(colName => {
//         const colIndex = headerRow.indexOf(colName);
//         if (colIndex !== -1) {
//             ws['!cols'][colIndex] = { wch: 25 };
//         }
//     });
    
//     // Thêm worksheet vào workbook
//     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
//     // Tạo tên file với ngày hiện tại
//     const dateStr = new Date().toISOString().slice(0, 10);
//     const fullFileName = `${fileName}_${dateStr}.xlsx`;
    
//     // Xuất file
//     XLSX.writeFile(wb, fullFileName);
    
//     // Thông báo xuất thành công
//     // alert(`Đã xuất file Excel "${fullFileName}" thành công!`);
// }
// Hàm xuất dữ liệu sang Excel định dạng xlsx với bảng được định dạng
function exportToExcel(tableId, fileName) {
    // Đảm bảo thư viện SheetJS đã được tải
    if (!window.XLSX) {
        alert('Đang tải thư viện Excel, vui lòng đợi trong giây lát...');
        loadSheetJSLibrary().then(() => {
            // Gọi lại hàm sau khi thư viện đã tải xong
            exportToExcel(tableId, fileName);
        }).catch(error => {
            console.error('Lỗi khi tải thư viện SheetJS:', error);
            alert('Không thể tải thư viện Excel. Vui lòng thử lại sau.');
        });
        return;
    }
    
    const table = document.getElementById(tableId);
    if (!table) {
        console.error('Không tìm thấy bảng:', tableId);
        return;
    }
    
    const rows = table.querySelectorAll('tr');
    if (!rows.length) {
        alert('Không có dữ liệu để xuất!');
        return;
    }
    
    // Tạo workbook mới
    const wb = XLSX.utils.book_new();
    
    // Chuẩn bị dữ liệu cho worksheet
    const data = [];
    
    // Lấy tiêu đề từ thead
    const headerRow = [];
    const headers = rows[0].querySelectorAll('th');
    for (let i = 0; i < headers.length; i++) {
        // Bỏ qua cột checkbox nếu có
        if (i === 0 && headers[i].querySelector('input[type="checkbox"]')) {
            continue;
        }
        // Bỏ qua cột "Thao tác" nếu có
        if (headers[i].textContent.trim() === 'Thao tác') {
            continue;
        }
        headerRow.push(headers[i].textContent.trim());
    }
    data.push(headerRow);
    
    // Lấy dữ liệu từ các hàng tbody
    for (let i = 1; i < rows.length; i++) {
        if (rows[i].style.display !== 'none') { // Chỉ xuất các hàng đang hiển thị
            const cells = rows[i].querySelectorAll('td');
            const rowData = [];
            
            for (let j = 0; j < cells.length; j++) {
                // Bỏ qua cột checkbox nếu có
                if (j === 0 && cells[j].classList.contains('checkbox-cell')) {
                    continue;
                }
                // Bỏ qua cột thao tác nếu có
                if (j === cells.length - 1 && cells[j].querySelector('button')) {
                    continue;
                }
                
                // Chỉ lấy nội dung text, loại bỏ các nút
                rowData.push(cells[j].textContent.replace(/\s*Sửa\s*Xóa\s*/g, '').trim());
            }
            
            // Chỉ thêm hàng nếu có dữ liệu
            if (rowData.some(cell => cell !== '')) {
                data.push(rowData);
            }
        }
    }
    
    try {
        // Tạo worksheet từ dữ liệu
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Tạo các style cho worksheet
        ws['!cols'] = headerRow.map(() => ({ wch: 15 })); // Độ rộng cột mặc định
        
        // Một số cột thường cần rộng hơn
        const widerColumns = ['Diễn giải', 'Khách hàng', 'Ghi chú'];
        widerColumns.forEach(colName => {
            const colIndex = headerRow.indexOf(colName);
            if (colIndex !== -1) {
                ws['!cols'][colIndex] = { wch: 25 };
            }
        });
        
        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        
        // Tạo tên file với ngày hiện tại
        const dateStr = new Date().toISOString().slice(0, 10);
        const fullFileName = `${fileName}_${dateStr}.xlsx`;
        
        // Xuất file
        XLSX.writeFile(wb, fullFileName);
        
        // Thông báo xuất thành công
        console.log(`Đã xuất thành công file: ${fullFileName}`);
        alert(`Đã xuất file Excel "${fullFileName}" thành công!`);
    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error);
        alert('Có lỗi khi xuất Excel: ' + error.message);
    }
}

// Hàm chuyển đổi định dạng số cho formula
function formatNumberForFormula(value) {
    // Kiểm tra nếu không phải là số
    if (value === null || value === undefined || value === '') {
        return '';
    }
    
    // Nếu là Boolean
    if (typeof value === 'boolean') {
        return value ? '1' : '0';
    }
    
    // Chuyển đổi sang chuỗi để xử lý
    let strValue = String(value);
    
    // Loại bỏ tất cả các dấu phẩy trong chuỗi
    strValue = strValue.replace(/,/g, '');
    
    // Thay thế dấu chấm để xử lý số thập phân
    strValue = strValue.replace(/\./g, '.');
    
    // Chuyển đổi sang số
    let numValue = parseFloat(strValue);
    
    // Kiểm tra NaN
    if (isNaN(numValue)) {
        return value; // Trả về giá trị ban đầu nếu không phải số
    }
    
    // Làm tròn đến 1 số thập phân
    numValue = Math.round(numValue * 10) / 10;
    
    // Nếu phần thập phân là .0 thì xóa đi
    if (numValue % 1 === 0) {
        return numValue.toString();
    }
    
    return numValue.toString();
}

// Hàm lấy giá trị từ form
function getFormValue(id, defaultValue = '') {
    const element = document.getElementById(id);
    if (element && element.value.trim() !== '') {
        return element.value.trim();
    }
    return defaultValue;
}

// Hàm tạo modal chỉnh sửa
function createEditModal(type, id, data) {
    const modal = document.getElementById('modal-edit');
    const container = document.getElementById('edit-form-container');
    
    // Thiết lập tiêu đề
    document.getElementById('modal-title').textContent = type === 'sc' ? 'Chỉnh sửa Phiếu Sang Cuộn' : 'Chỉnh sửa Phiếu Cắt';
    
    // Xóa nội dung cũ
    container.innerHTML = '';
    
    // Tạo form mới tùy theo loại phiếu
    if (type === 'sc') {
        createSangCuonEditForm(container, id, data);
    } else {
        createCatEditForm(container, id, data);
    }
    
    // Hiển thị modal
    modal.style.display = 'block';
}


/**
 * Gắn sự kiện cho các checkbox trong bảng
 */
function attachCheckboxEvents(tableId) {
    // Lấy các checkbox
    const checkboxes = document.querySelectorAll(`#${tableId} .phieu-checkbox`);
    
    // Đặt lại trạng thái ban đầu của nút xóa
    updateDeleteButtonState(tableId === 'sc-danhsach-table' ? 'sc' : 'cat');
    
    // Gắn sự kiện khi thay đổi trạng thái checkbox
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Highlight hàng khi chọn
            const row = this.closest('tr');
            if (this.checked) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
            
            // Cập nhật trạng thái nút chọn tất cả
            updateSelectAllState(tableId);
            
            // Cập nhật trạng thái nút xóa
            updateDeleteButtonState(tableId === 'sc-danhsach-table' ? 'sc' : 'cat');
        });
    });
}

/**
 * Chọn/bỏ chọn tất cả các phiếu
 */
function toggleSelectAll(tableId, checked) {
    const checkboxes = document.querySelectorAll(`#${tableId} .phieu-checkbox`);
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = checked;
        
        // Highlight hàng
        const row = checkbox.closest('tr');
        if (checked) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });
    
    // Cập nhật trạng thái nút xóa
    updateDeleteButtonState(tableId === 'sc-danhsach-table' ? 'sc' : 'cat');
}

/**
 * Cập nhật trạng thái nút chọn tất cả
 */
function updateSelectAllState(tableId) {
    const checkboxes = document.querySelectorAll(`#${tableId} .phieu-checkbox`);
    const selectAllCheckbox = document.getElementById(`${tableId === 'sc-danhsach-table' ? 'sc' : 'cat'}-select-all`);
    
    if (!checkboxes.length || !selectAllCheckbox) return;
    
    let allChecked = true;
    let allUnchecked = true;
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            allUnchecked = false;
        } else {
            allChecked = false;
        }
    });
    
    // Cập nhật trạng thái checkbox chọn tất cả
    if (allChecked) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else if (allUnchecked) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.indeterminate = true;
    }
}

/**
 * Cập nhật trạng thái nút xóa đã chọn
 */
function updateDeleteButtonState(type) {
    const deleteButton = document.getElementById(`${type}-btn-delete-selected`);
    if (!deleteButton) return; // Kiểm tra nút có tồn tại không
    
    const checkboxes = document.querySelectorAll(`#${type}-danhsach-table .phieu-checkbox:checked`);
    
    // Kiểm tra điều kiện và bật/tắt nút
    if (checkboxes.length > 0) {
        deleteButton.disabled = false;
        deleteButton.removeAttribute('disabled');
    } else {
        deleteButton.disabled = true;
        deleteButton.setAttribute('disabled', 'disabled');
    }
    
    // Cập nhật style cho nút
    if (checkboxes.length > 0) {
        deleteButton.classList.add('active');
    } else {
        deleteButton.classList.remove('active');
    }
}

// Thêm hàm khởi tạo trạng thái nút xóa khi trang được tải
function initDeleteButtonState() {
    updateDeleteButtonState('sc');
    updateDeleteButtonState('cat');
}


// Hàm xóa các phiếu đã chọn
async function deleteSelectedPhieu(type) {
    const checkboxes = document.querySelectorAll(`#${type}-danhsach-table .phieu-checkbox:checked`);
    
    if (checkboxes.length === 0) return;
    
    const count = checkboxes.length;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa ${count} phiếu đã chọn?`)) {
        return;
    }
    
    // Lấy danh sách ID phiếu cần xóa
    const ids = Array.from(checkboxes).map(checkbox => checkbox.dataset.id);
    
    try {
        if (type === 'sc') {
            // Xóa nhiều phiếu sang cuộn qua API
            await PhieuSangCuonAPI.deleteMultiple(ids);
            
            // Cập nhật giao diện
            await loadPhieuSangCuonList();
            await convertSangCuonToFormula();
        } else {
            // Xóa nhiều phiếu cắt qua API
            await PhieuCatAPI.deleteMultiple(ids);
            
            // Cập nhật giao diện
            await loadPhieuCatList();
            await convertCatToFormula();
        }
        
        // Reset trạng thái checkbox "chọn tất cả"
        const selectAllCheckbox = document.getElementById(`${type}-select-all`);
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        }
        
        // Reset trạng thái nút xóa
        updateDeleteButtonState(type);
        
        alert(`Đã xóa ${count} phiếu thành công!`);
    } catch (error) {
        console.error('Lỗi khi xóa nhiều phiếu:', error);
        alert('Có lỗi khi xóa phiếu: ' + error.message);
    }
}


//! =================================================================
//? CHỨC NĂNG XỬ LÝ PHIẾU TRÙNG CẢ 2 PHIẾU   =================================================================
//! =================================================================

/**
 * Xử lý phiếu trùng - Các hàm quản lý việc xử lý phiếu trùng khi dán và thêm phiếu
 */

// Cấu trúc đối tượng lưu trữ trạng thái xử lý phiếu trùng
const duplicateHandling = {
    // Danh sách phiếu trùng đang xử lý
    duplicates: [],
    // Vị trí hiện tại trong danh sách
    currentIndex: 0,
    // Phiếu mới đang chờ xử lý
    newTickets: [],
    // Tùy chọn sử dụng cho các phiếu còn lại
    skipOption: null, // 'replace' hoặc 'add'
    // Loại phiếu đang xử lý
    ticketType: '', // 'sc' hoặc 'cat'
    // Trạng thái đã skip hay chưa
    skipped: false
};



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






// Cập nhật hàm saveCatPasteData để sử dụng logic tích hợp mới
async function saveCatPasteData(data) {
    const existingPhieuList = await PhieuCatAPI.getList();
    const duplicates = [];
    
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
        
        showDuplicateDialog(duplicates[0], 'cat');
    } else {
        // Không có phiếu trùng, lưu trực tiếp và xử lý GMC
        await saveCatTicketsDirectly(data);
        await processGMCSupplementaryAfterSave(data);
    }
}


// Hàm lưu trực tiếp phiếu cắt không có trùng lặp
async function saveCatTicketsDirectly(data) {
  try {
      // Sử dụng Promise.all để chờ tất cả các Promise hoàn thành
      await Promise.all(data.map(phieu => PhieuCatAPI.add(phieu)));
      
      // MÃ MỚI: Cập nhật báo cáo GMC trùng khớp
      await updateMatchingGMCReports(data);
      
      // Cập nhật lại danh sách và formula
      await loadPhieuCatList();
      await convertCatToFormula();
      
      // Thông báo và chuyển đến tab danh sách
      alert('Đã lưu dữ liệu phiếu cắt thành công!');
      document.querySelector('#cat .sub-tab-btn[onclick="switchSubTab(\'cat-danhsach\')"]').click();
  } catch (error) {
      console.error('Lỗi khi lưu phiếu cắt:', error);
    //   alert('Có lỗi khi lưu phiếu cắt: ' + error.message);
  }
}


/**
 * Kiểm tra phiếu trùng
 * @param {string} type - Loại phiếu ('sc' hoặc 'cat')
 * @param {Array} newTickets - Danh sách phiếu mới
 * @returns {Array} - Danh sách các số phiếu trùng
 */
function checkDuplicateTickets(type, newTickets) {
    // Lấy dữ liệu hiện tại
    const storageKey = type === 'sc' ? 'phieuSangCuon' : 'phieuCat';
    const currentTickets = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Tìm các số phiếu trùng
    const existingTicketNumbers = new Set();
    currentTickets.forEach(ticket => {
        existingTicketNumbers.add(ticket.soPhieu);
    });
    
    // Tìm các số phiếu trùng trong danh sách mới
    const duplicateNumbers = new Set();
    newTickets.forEach(ticket => {
        if (existingTicketNumbers.has(ticket.soPhieu)) {
            duplicateNumbers.add(ticket.soPhieu);
        }
    });
    
    return [...duplicateNumbers];
}

/**
 * Hiển thị dialog xử lý phiếu trùng
 * @param {string} ticketNumber - Số phiếu trùng
 * @param {string} type - Loại phiếu ('sc' hoặc 'cat')
 */

function showDuplicateDialog(ticketNumber, type) {
    console.log(`=== HIỂN THỊ DIALOG PHIẾU TRÙNG ===`);
    console.log(`Số phiếu: ${ticketNumber}, Loại: ${type}`);
    
    // Xóa modal cũ nếu có
    const existingModal = document.getElementById('duplicate-handling-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Tạo modal mới
    const modal = document.createElement('div');
    modal.id = 'duplicate-handling-modal';
    modal.className = 'modal duplicate-modal';
    modal.style.cssText = `
        display: block;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.4);
    `;
    
    // Lấy thông tin phiếu trùng
    const ticketIndex = duplicateHandling.currentIndex + 1;
    const totalDuplicates = duplicateHandling.duplicates.length;
    
    // Tạo nội dung modal
    modal.innerHTML = `
        <div class="modal-content" style="
            background-color: #fefefe;
            margin: 10% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 500px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ">
            <h3 style="color: #333; margin-top: 0;">
                Phát hiện phiếu trùng (${ticketIndex}/${totalDuplicates})
            </h3>
            <p style="color: #666; margin-bottom: 20px;">
                Phiếu <strong style="color: #d32f2f;">${ticketNumber}</strong> đã tồn tại. Bạn muốn:
            </p>
            
            <div class="duplicate-options" style="margin-bottom: 20px;">
                <div class="option-group" style="
                    margin-bottom: 15px;
                    padding: 15px;
                    border: 2px solid #ddd;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='white'">
                    <label style="cursor: pointer; display: flex; align-items: center;">
                        <input type="radio" id="replace-option" name="duplicate-action" value="replace" style="margin-right: 10px;">
                        <div>
                            <h3 >Thay thế</h3>
                            <div style="font-size: 16px; color: #666; margin-top: 5px;">
                                Thay thế các mã của phiếu cũ bằng các mã mới
                            </div>
                        </div>
                    </label>
                </div>
                
                <div class="option-group" style="
                    margin-bottom: 15px;
                    padding: 15px;
                    border: 2px solid #ddd;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.backgroundColor='#f5f5f5'" onmouseout="this.style.backgroundColor='white'">
                    <label style="cursor: pointer; display: flex; align-items: center; justify-content:start;">
                        <input type="radio" id="add-option" name="duplicate-action" value="add" style="margin-right: 10px;">
                        <div>
                            <h3 >Bỏ qua thay thế (Thêm mới)</h3>
                            <div style="font-size: 16px; color: #666; margin-top: 5px;">
                                Giữ phiếu cũ và thêm các mã mới
                            </div>
                        </div>
                    </label>
                </div>
            </div>
            
            <div class="skip-option" style="
                margin-bottom: 20px; 
                padding: 10px;
                background-color: #f0f0f0;
                border-radius: 5px;
                display: block;
            ">
                <label style="cursor: pointer; display: flex; align-items: center;">
                    <input type="checkbox" id="skip-checkbox" ${duplicateHandling.skipped ? 'checked' : ''} style="margin-right: 10px;">
                    <div>
                        <h3>Áp dụng cho tất cả phiếu trùng còn lại</h3>
                        <div style="font-size: 14px; color: #666; margin-top: 2px;">
                            ${totalDuplicates > 1 ? 
                                `Còn ${totalDuplicates - ticketIndex} phiếu trùng nữa` : 
                                'Áp dụng cho các phiếu trùng trong tương lai'}
                        </div>
                    </div>
                </label>
            </div>
            
            <div class="modal-actions" style="text-align: right; border-top: 1px solid #ddd; padding-top: 15px;">
                <button id="cancel-duplicate-btn" style="
                    background-color: #6c757d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 10px;
                ">Hủy</button>
                <button id="confirm-duplicate-btn" style="
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                ">Xác nhận</button>
            </div>
        </div>
    `;
    
    // Thêm modal vào body
    document.body.appendChild(modal);
    
    console.log('Modal đã được thêm vào DOM');
    
    // Gắn sự kiện cho các option groups
    const optionGroups = modal.querySelectorAll('.option-group');
    optionGroups.forEach(group => {
        group.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                console.log('Đã chọn option:', radio.value);
            }
        });
    });
    
    // Gắn sự kiện cho nút xác nhận
    const confirmBtn = document.getElementById('confirm-duplicate-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            console.log('=== NÚT XÁC NHẬN ĐƯỢC BẤM ===');
            handleDuplicateConfirmation(ticketNumber, type, modal);
        });
        console.log('Đã gắn sự kiện cho nút xác nhận');
    } else {
        console.error('Không tìm thấy nút xác nhận!');
    }
    
    // Gắn sự kiện cho nút hủy
    const cancelBtn = document.getElementById('cancel-duplicate-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            console.log('=== NÚT HỦY ĐƯỢC BẤM ===');
            handleDuplicateCancel(modal);
        });
        console.log('Đã gắn sự kiện cho nút hủy');
    } else {
        console.error('Không tìm thấy nút hủy!');
    }
    
    // Gắn sự kiện click backdrop
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            console.log('Click vào backdrop');
            handleDuplicateCancel(modal);
        }
    });
    
    console.log('Đã hoàn tất hiển thị dialog');
}


/**
 * Xử lý hủy bỏ
 */
function handleDuplicateCancel(modal) {
    console.log('=== XỬ LÝ HỦY BỎ ===');
    
    if (confirm('Bạn có chắc chắn muốn hủy bỏ việc xử lý phiếu trùng?')) {
        modal.remove();
        resetDuplicateHandlingState();
        console.log('Đã hủy bỏ và reset trạng thái');
        alert('Đã hủy bỏ việc xử lý phiếu trùng.');
    }
}




// Hàm xử lý phiếu trùng
async function handleDuplicateTicket(ticketNumber, action, type) {
    // Xử lý phiếu hiện tại
    if (type === 'sc') {
        await handleDuplicateSCTicket(ticketNumber, action);
    } else {
        await handleDuplicateCatTicket(ticketNumber, action);
    }
    
    // Chuyển đến phiếu trùng tiếp theo
    duplicateHandling.currentIndex++;
    
    // Kiểm tra xem có phiếu trùng tiếp theo không
    if (duplicateHandling.currentIndex < duplicateHandling.duplicates.length) {
        const nextTicket = duplicateHandling.duplicates[duplicateHandling.currentIndex];
        
        // Nếu đã chọn skip, áp dụng cùng hành động
        if (duplicateHandling.skipped) {
            await handleDuplicateTicket(nextTicket, duplicateHandling.skipOption, type);
        } else {
            // Hiển thị dialog cho phiếu tiếp theo
            showDuplicateDialog(nextTicket, type);
        }
    } else {
        // Đã xử lý tất cả phiếu trùng, lưu các phiếu không trùng còn lại
        await saveRemainingTickets(type);
    }
}


/**
 * Xử lý xác nhận phiếu trùng
 */
async function handleDuplicateConfirmation(ticketNumber, type, modal) {
    console.log('=== XỬ LÝ XÁC NHẬN PHIẾU TRÙNG ===');
    console.log('Ticket:', ticketNumber, 'Type:', type);
    
    try {
        // Lấy lựa chọn
        const actionRadio = modal.querySelector('input[name="duplicate-action"]:checked');
        const skipCheckbox = modal.querySelector('#skip-checkbox');
        
        if (!actionRadio) {
            alert('Vui lòng chọn hành động xử lý!');
            return;
        }
        
        const action = actionRadio.value;
        const skipRest = skipCheckbox ? skipCheckbox.checked : false;
        
        console.log('Action:', action, 'Skip rest:', skipRest);
        
        // Cập nhật trạng thái skip
        if (skipRest) {
            duplicateHandling.skipped = true;
            duplicateHandling.skipOption = action;
            console.log('Đã chọn áp dụng cho tất cả phiếu còn lại');
        }
        
        // Đóng modal
        modal.remove();
        console.log('Đã đóng modal');
        
        // Hiển thị loading
        showLoadingMessage('Đang xử lý phiếu trùng...');
        
        // Xử lý phiếu hiện tại
        if (type === 'cat') {
            await handleDuplicateCatTicket(ticketNumber, action, type);
        } else if (type === 'sc') {
            await handleDuplicateSCTicket(ticketNumber, action);
        }
        
        // Tiếp tục xử lý phiếu trùng tiếp theo hoặc hoàn tất
        await processNextDuplicateOrFinish(type);
        
    } catch (error) {
        console.error('Lỗi khi xử lý phiếu trùng:', error);
        hideLoadingMessage();
        alert('Có lỗi khi xử lý phiếu trùng: ' + error.message);
    }
}


/**
 * Hiển thị thông báo loading
 */
function showLoadingMessage(message) {
    // Xóa loading cũ nếu có
    const existingLoading = document.getElementById('loading-message');
    if (existingLoading) {
        existingLoading.remove();
    }
    
    // Tạo loading mới
    const loading = document.createElement('div');
    loading.id = 'loading-message';
    loading.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0,0,0,0.8);
        color: white;
        padding: 20px;
        border-radius: 5px;
        z-index: 1001;
        text-align: center;
    `;
    loading.innerHTML = `
        <div style="margin-bottom: 10px;">
            <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
        <div>${message}</div>
    `;
    
    // Thêm animation CSS nếu chưa có
    if (!document.getElementById('loading-animation-style')) {
        const style = document.createElement('style');
        style.id = 'loading-animation-style';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loading);
}

/**
 * Ẩn thông báo loading
 */
function hideLoadingMessage() {
    const loading = document.getElementById('loading-message');
    if (loading) {
        loading.remove();
    }
}



/**
 * Xử lý phiếu trùng tiếp theo hoặc hoàn tất
 */
async function processNextDuplicateOrFinish(type) {
    console.log('=== XỬ LÝ PHIẾU TRÙNG TIẾP THEO ===');
    
    try {
        // Chuyển đến phiếu trùng tiếp theo
        duplicateHandling.currentIndex++;
        
        if (duplicateHandling.currentIndex < duplicateHandling.duplicates.length) {
            // Còn phiếu trùng khác
            const nextTicket = duplicateHandling.duplicates[duplicateHandling.currentIndex];
            console.log('Phiếu trùng tiếp theo:', nextTicket);
            
            if (duplicateHandling.skipped && duplicateHandling.skipOption) {
                // Áp dụng cùng hành động cho phiếu tiếp theo
                console.log('Áp dụng cùng hành động:', duplicateHandling.skipOption);
                
                if (type === 'cat') {
                    await handleDuplicateCatTicket(nextTicket, duplicateHandling.skipOption, type);
                } else if (type === 'sc') {
                    await handleDuplicateSCTicket(nextTicket, duplicateHandling.skipOption);
                }
                
                // Đệ quy để xử lý phiếu tiếp theo
                await processNextDuplicateOrFinish(type);
            } else {
                // Hiển thị dialog cho phiếu tiếp theo
                hideLoadingMessage();
                setTimeout(() => {
                    showDuplicateDialog(nextTicket, type);
                }, 500);
            }
        } else {
            // Đã xử lý hết phiếu trùng, hoàn tất
            console.log('Đã xử lý hết phiếu trùng, bắt đầu hoàn tất...');
            await finalizeDuplicateProcessing(type);
        }
    } catch (error) {
        console.error('Lỗi khi xử lý phiếu trùng tiếp theo:', error);
        hideLoadingMessage();
        throw error;
    }
}


/**
 * Hoàn tất xử lý phiếu trùng
 */
async function finalizeDuplicateProcessing(type) {
    console.log('=== HOÀN TẤT XỬ LÝ PHIẾU TRÙNG ===');
    
    try {
        showLoadingMessage('Đang hoàn tất xử lý...');
        
        // Lưu các phiếu không trùng còn lại
        await saveRemainingNonDuplicateTickets(type);
        
        // Cập nhật giao diện
        if (type === 'sc') {
            await loadPhieuSangCuonList();
            await convertSangCuonToFormula();
            clearScPaste();
            document.querySelector('#sang-cuon .sub-tab-btn[onclick="switchSubTab(\'sc-danhsach\')"]')?.click();
        } else {
            await loadPhieuCatList();
            await convertCatToFormula();
            clearCatPaste();
            document.querySelector('#cat .sub-tab-btn[onclick="switchSubTab(\'cat-danhsach\')"]')?.click();
        }
        
        hideLoadingMessage();
        
        // Thông báo thành công
        // alert('Đã xử lý hoàn tất tất cả phiếu trùng!');
        
        // Reset trạng thái
        resetDuplicateHandlingState();
        
        console.log('Hoàn tất xử lý phiếu trùng thành công');
        
    } catch (error) {
        console.error('Lỗi khi hoàn tất xử lý:', error);
        hideLoadingMessage();
        alert('Có lỗi khi hoàn tất xử lý: ' + error.message);
    }
}

/**
 * Lưu các phiếu không trùng còn lại
 */
async function saveRemainingNonDuplicateTickets(type) {
    console.log('=== LƯU PHIẾU KHÔNG TRÙNG CÒN LẠI ===');
    
    try {
        // Lọc các phiếu không trùng
        const allDuplicateNumbers = new Set(duplicateHandling.duplicates);
        const nonDuplicates = duplicateHandling.newTickets.filter(ticket => 
            !allDuplicateNumbers.has(ticket.soPhieu)
        );
        
        console.log(`Tìm thấy ${nonDuplicates.length} phiếu không trùng cần lưu`);
        
        if (nonDuplicates.length > 0) {
            if (type === 'sc') {
                await Promise.all(nonDuplicates.map(phieu => PhieuSangCuonAPI.add(phieu)));
                await updateMatchingSCLReports(nonDuplicates);
            } else {
                await Promise.all(nonDuplicates.map(phieu => PhieuCatAPI.add(phieu)));
                await updateMatchingGMCReports(nonDuplicates);
                
                // Xử lý GMC bổ sung sau cho phiếu cắt
                await processGMCSupplementaryAfterSave(nonDuplicates);
            }
            
            console.log('Đã lưu xong các phiếu không trùng');
        }
    } catch (error) {
        console.error('Lỗi khi lưu phiếu không trùng:', error);
        throw error;
    }
}

/**
 * Reset trạng thái xử lý phiếu trùng
 */
function resetDuplicateHandlingState() {
    console.log('=== RESET TRẠNG THÁI XỬ LÝ PHIẾU TRÙNG ===');
    
    duplicateHandling.duplicates = [];
    duplicateHandling.currentIndex = 0;
    duplicateHandling.newTickets = [];
    duplicateHandling.skipped = false;
    duplicateHandling.skipOption = null;
    duplicateHandling.ticketType = '';
    
    console.log('Đã reset trạng thái');
}

/**
 * Debug trạng thái xử lý phiếu trùng
 */
function debugDuplicateState() {
    console.log('=== TRẠNG THÁI XỬ LÝ PHIẾU TRÙNG ===');
    console.log('Duplicates:', duplicateHandling.duplicates);
    console.log('Current Index:', duplicateHandling.currentIndex);
    console.log('New Tickets Count:', duplicateHandling.newTickets.length);
    console.log('Skipped:', duplicateHandling.skipped);
    console.log('Skip Option:', duplicateHandling.skipOption);
    console.log('Ticket Type:', duplicateHandling.ticketType);
    console.log('===========================================');
}


// Hàm lưu các phiếu còn lại không trùng
async function saveRemainingTickets(type) {
    // Lọc phiếu không trùng
    const allDuplicateNumbers = new Set(duplicateHandling.duplicates);
    const nonDuplicates = duplicateHandling.newTickets.filter(ticket => 
        !allDuplicateNumbers.has(ticket.soPhieu)
    );
    
    // Lưu các phiếu không trùng
    if (nonDuplicates.length > 0) {
        try {
            if (type === 'sc') {
                // Lưu phiếu sang cuộn không trùng
                await Promise.all(nonDuplicates.map(phieu => PhieuSangCuonAPI.add(phieu)));
            } else {
                // Lưu phiếu cắt không trùng
                await Promise.all(nonDuplicates.map(phieu => PhieuCatAPI.add(phieu)));
            }
        } catch (error) {
            console.error('Lỗi khi lưu phiếu còn lại:', error);
            alert('Có lỗi khi lưu phiếu còn lại: ' + error.message);
        }
    }
    
    // Cập nhật giao diện
    try {
        if (type === 'sc') {
            await loadPhieuSangCuonList();
            await convertSangCuonToFormula();
            
            // Chuyển đến tab danh sách
            document.querySelector('#sang-cuon .sub-tab-btn[onclick="switchSubTab(\'sc-danhsach\')"]').click();
        } else {
            await loadPhieuCatList();
            await convertCatToFormula();
            
            // Chuyển đến tab danh sách
            document.querySelector('#cat .sub-tab-btn[onclick="switchSubTab(\'cat-danhsach\')"]').click();
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật giao diện:', error);
    }
    
    // Thông báo
    alert('Đã xử lý tất cả phiếu trùng!');
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


// Xử lý phiếu cắt trùng
async function handleDuplicateCatTicket(ticketNumber, action, type) {
    console.log(`=== XỬ LÝ PHIẾU CẮT TRÙNG: ${ticketNumber} ===`);
    console.log('Action:', action);
    
    try {
        // Lấy dữ liệu hiện tại
        const currentTickets = await PhieuCatAPI.getList();
        
        // Lấy phiếu mới có số phiếu trùng
        const newTickets = duplicateHandling.newTickets.filter(t => t.soPhieu === ticketNumber);
        
        // Lấy các phiếu cũ có cùng số phiếu
        const oldTickets = currentTickets.filter(t => t.soPhieu === ticketNumber);
        
        console.log(`Phiếu mới: ${newTickets.length}, Phiếu cũ: ${oldTickets.length}`);
        
        if (action === 'replace') {
            // Thay thế: Xóa phiếu cũ và thêm phiếu mới
            console.log('Thực hiện thay thế...');
            
            if (oldTickets.length > 0) {
                await Promise.all(oldTickets.map(ticket => PhieuCatAPI.delete(ticket.id)));
                console.log('Đã xóa phiếu cũ');
            }
            
            await Promise.all(newTickets.map(ticket => PhieuCatAPI.add(ticket)));
            console.log('Đã thêm phiếu mới');
            
            // Cập nhật GMC
            await updateMatchingGMCReports(newTickets);
            
        } else { // action === 'add'
            // Bỏ qua thay thế: Thêm phiếu mới với STT điều chỉnh
            console.log('Thực hiện bỏ qua thay thế...');
            
            // Tìm STT lớn nhất của phiếu cũ
            let maxStt = 0;
            oldTickets.forEach(ticket => {
                const stt = parseInt(ticket.stt);
                if (!isNaN(stt) && stt > maxStt) {
                    maxStt = stt;
                }
            });
            
            console.log('STT lớn nhất hiện tại:', maxStt);
            
            // Cập nhật STT cho phiếu mới
            newTickets.forEach((ticket, index) => {
                const newStt = maxStt + index + 1;
                ticket.stt = newStt.toString();
                console.log(`Cập nhật STT cho phiếu ${ticket.soPhieu}: ${newStt}`);
            });
            
            // Thêm phiếu mới
            await Promise.all(newTickets.map(ticket => PhieuCatAPI.add(ticket)));
            console.log('Đã thêm phiếu mới với STT điều chỉnh');
            
            // Cập nhật GMC
            await updateMatchingGMCReports(newTickets);
            
            // ===== XỬ LÝ GMC BỔ SUNG SAU =====
            console.log('Bắt đầu xử lý GMC bổ sung sau...');
            await processGMCSupplementaryAfterSave(newTickets);
        }
        
        console.log(`Hoàn tất xử lý phiếu cắt trùng: ${ticketNumber}`);
        
    } catch (error) {
        console.error('Lỗi khi xử lý phiếu cắt trùng:', error);
        throw error;
    }
}


async function finalizeCatProcessing() {
    try {
        console.log('Hoàn tất xử lý phiếu cắt');
        
        // Cập nhật giao diện
        await loadPhieuCatList();
        await convertCatToFormula();
        
        // Reset bảng dán
        clearCatPaste();
        
        // Thông báo
        // alert('Đã xử lý hoàn tất dữ liệu phiếu cắt!');
        
        // Chuyển tab
        document.querySelector('#cat .sub-tab-btn[onclick="switchSubTab(\'cat-danhsach\')"]')?.click();
        
    } catch (error) {
        console.error('Lỗi khi hoàn tất:', error);
    }
}


async function processGMCSupplementaryAfterSave(processedPhieuList) {
    console.log('=== BẮT ĐẦU XỬ LÝ GMC BỔ SUNG SAU ===');
    console.log('Số phiếu cần xử lý:', processedPhieuList.length);
    
    try {
        // Đợi để đảm bảo phiếu đã được lưu vào database
        console.log('Đợi database cập nhật...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Tạo lại formula từ dữ liệu vừa lưu
        console.log('Đang tạo lại formula...');
        await convertCatToFormula();
        
        // Đợi thêm để formula được tạo
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Lấy dữ liệu formula mới tạo
        console.log('Đang lấy dữ liệu formula...');
        const formulaData = await getLatestFormulaData(processedPhieuList);
        
        if (formulaData && formulaData.length > 0) {
            console.log(`Tìm thấy ${formulaData.length} formula để cập nhật GMC`);
            
            // Cập nhật báo cáo GMC bổ sung sau
            await updateGMCSupplementaryReports(formulaData);
            console.log('Đã hoàn tất cập nhật GMC bổ sung sau');
        } else {
            console.log('Không tìm thấy formula phù hợp để cập nhật GMC');
        }
        
    } catch (error) {
        console.error('Lỗi trong quá trình xử lý GMC bổ sung sau:', error);
        // Không throw error để không làm gián đoạn quá trình chính
    }
}


/**
 * Thêm style cho modal xử lý phiếu trùng
 */
function addDuplicateModalStyle() {
    const style = document.createElement('style');
    style.textContent = `
        .duplicate-modal .modal-content {
            padding: 20px;
        }
        
        .duplicate-options {
            margin-top: 15px;
        }
        
        .option-group {
            margin-bottom: 15px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        
        .option-group:hover {
            background-color: #f9f9f9;
        }
        
        .option-group label {
            font-weight: bold;
            display: inline-block;
            margin-left: 5px;
            cursor: pointer;
        }
        
        .option-desc {
            margin-top: 5px;
            margin-left: 25px;
            font-size: 14px;
            color: #666;
        }
        
        .skip-option {
            display: flex;
            align-items: center;
            margin-top: 10px;
        }
        
        .skip-option label {
            margin-left: 5px;
            cursor: pointer;
        }
    `;
    
    document.head.appendChild(style);
}


//! =================================================================
//? CHỨC NĂNG IMPORT EXCEL   =================================================================
//! =================================================================
// Hàm xử lý khi chọn file
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Xác định loại phiếu từ id của input
    const type = e.target.id.includes('sc') ? 'sc' : 'cat';
    
    // Thông báo đang xử lý
    alert('Đang đọc file Excel, vui lòng đợi...');
    
    // Đọc file Excel
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        processExcelFile(data, type);
    };
    reader.readAsArrayBuffer(file);
    
    // Reset input file để cho phép chọn lại cùng một file
    e.target.value = '';
}

// Hàm xử lý file Excel
function processExcelFile(data, type) {
    try {
        // Sử dụng thư viện SheetJS để đọc file Excel
        const workbook = XLSX.read(data, {type: 'array'});
        
        // Lấy sheet đầu tiên
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Chuyển đổi sheet thành JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1, defval: ''});
        
        // Bỏ qua hàng tiêu đề
        const rows = jsonData.slice(1);
        
        if (rows.length === 0) {
            alert('Không có dữ liệu trong file Excel!');
            return;
        }
        
        // Xử lý dữ liệu theo loại phiếu
        if (type === 'sc') {
            processExcelDataSangCuon(rows);
        } else {
            processExcelDataCat(rows);
        }
    } catch (error) {
        console.error('Lỗi khi đọc file Excel:', error);
        alert('Có lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
    }
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

// Hàm định dạng ngày từ Excel
function formatExcelDate(excelDate) {
    if (!excelDate) return '';
    
    // Xử lý các định dạng ngày phổ biến
    
    // Nếu là chuỗi ngày tháng, thử phân tích và chuyển đổi
    if (typeof excelDate === 'string') {
        // Định dạng d/m/yyyy hoặc dd/mm/yyyy
        const dmyMatch = excelDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (dmyMatch) {
            const day = dmyMatch[1].padStart(2, '0');
            const month = dmyMatch[2].padStart(2, '0');
            const year = dmyMatch[3];
            return `${day}/${month}/${year}`;
        }
        
        // Định dạng yyyy-mm-dd
        const ymdMatch = excelDate.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (ymdMatch) {
            const year = ymdMatch[1];
            const month = ymdMatch[2].padStart(2, '0');
            const day = ymdMatch[3].padStart(2, '0');
            return `${day}/${month}/${year}`;
        }
    }
    
    // Nếu là số (Excel serial date), chuyển đổi thành ngày
    if (typeof excelDate === 'number') {
        // Excel serial date bắt đầu từ 1/1/1900
        const baseDate = new Date(1900, 0, 1);
        
        // Trừ đi 2 ngày vì Excel tính sai ngày 29/2/1900 (năm 1900 không phải năm nhuận)
        const days = excelDate - 2;
        
        // Thêm số ngày vào ngày gốc
        const resultDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
        
        // Định dạng ngày tháng thành YYYY-MM-DD
        const year = resultDate.getFullYear();
        const month = (resultDate.getMonth() + 1).toString().padStart(2, '0');
        const day = resultDate.getDate().toString().padStart(2, '0');
        
        return `${day}/${month}/${year}`;
    }
    
    // Trả về chuỗi gốc nếu không thể chuyển đổi
    return excelDate.toString();
}

document.addEventListener('DOMContentLoaded', function() {
    // Hàm tải thư viện SheetJS
    function loadSheetJSLibrary() {
        return new Promise((resolve, reject) => {
            if (window.XLSX) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load SheetJS library'));
            document.head.appendChild(script);
        });
    }
    
   // Đảm bảo tải thư viện SheetJS khi trang được tải
   loadSheetJSLibrary()
   .then(() => console.log('SheetJS library loaded successfully'))
   .catch(error => console.error('Error loading SheetJS library:', error));

// Gắn sự kiện cho các nút xuất Excel
const scExportBtn = document.getElementById('sc-btn-export');
if (scExportBtn) {
   scExportBtn.addEventListener('click', function() {
       exportToExcel('sc-danhsach-table', 'PhieuSangCuon');
   });
}

const catExportBtn = document.getElementById('cat-btn-export');
if (catExportBtn) {
   catExportBtn.addEventListener('click', function() {
       exportToExcel('cat-danhsach-table', 'PhieuCat');
   });
}

const scFormulaExportBtn = document.getElementById('sc-formula-export');
if (scFormulaExportBtn) {
   scFormulaExportBtn.addEventListener('click', function() {
       exportToExcel('sc-formula-table', 'PhieuSangCuonFormula');
   });
}

const catFormulaExportBtn = document.getElementById('cat-formula-export');
if (catFormulaExportBtn) {
   catFormulaExportBtn.addEventListener('click', function() {
       exportToExcel('cat-formula-table', 'PhieuCatFormula');
   });
}
    
    // Thêm sự kiện cho các nút import nếu chúng đã được tạo
    const btnScImport = document.getElementById('sc-btn-import');
    if (btnScImport) {
        btnScImport.addEventListener('click', function() {
            loadSheetJSLibrary()
                .then(() => {
                    // document.getElementById('sc-file-import').click();
                })
                .catch(error => {
                    console.error('Error loading SheetJS library:', error);
                    alert('Không thể tải thư viện xử lý Excel. Vui lòng thử lại sau.');
                });
        });
    }
    
    const btnCatImport = document.getElementById('cat-btn-import');
    if (btnCatImport) {
        btnCatImport.addEventListener('click', function() {
            loadSheetJSLibrary()
                .then(() => {
                    // document.getElementById('cat-file-import').click();
                })
                .catch(error => {
                    console.error('Error loading SheetJS library:', error);
                    alert('Không thể tải thư viện xử lý Excel. Vui lòng thử lại sau.');
                });
        });
    }
});


//! ====================================================================================================================================

//! =================================================================
//! PHẦN PHIẾU SANG CUỘN
//! =================================================================

// Thêm mã hàng nhập
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sc-them-mhn').addEventListener('click', function() {
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

// Hàm xử lý dán phiếu sang cuộn
function processScPaste() {
    const pasteCell = document.getElementById('sc-paste-cell');
    const pasteData = pasteCell.textContent.trim();
    
    if (!pasteData) {
        alert('Vui lòng dán dữ liệu vào ô đầu tiên!');
        return;
    }
    
    // Lấy dữ liệu từ tất cả các ô đã được dán
    const pasteTable = document.getElementById('sc-dan-table');
    const rows = pasteTable.querySelectorAll('tbody tr:not(.instruction-row)');
    
    // Bỏ qua nếu chỉ có dòng paste-row và không có dữ liệu
    if (rows.length <= 1 && !pasteData) {
        alert('Dữ liệu không hợp lệ!');
        return;
    }
    
    // Tạo cấu trúc dữ liệu
    const phieuList = [];
    let currentPhieu = null;
    let currentMHKX = null;
    
    for (let i = 1; i < rows.length; i++) { // Bỏ qua dòng header
        const cols = rows[i].split('\t');
        
        if (cols.length < 5) continue; // Bỏ qua dòng không đủ cột
        
        // Kiểm tra xem có phải dòng phiếu mới không
        if (cols[0].trim() !== '') {
            // Tạo phiếu mới
            currentPhieu = {
                id: Date.now().toString() + i,
                soPhieu: cols[0].trim(),
                ngayCT: cols[1].trim(),
                soLSX: cols[2].trim(),
                dienGiai: cols[3].trim(),
                khachHang: cols[4].trim(),
                sanPham: cols[5].trim(),
                maPhu: cols[6].trim(),
                mhkxData: [] // Mảng chứa các MHKX
            };
            
            phieuList.push(currentPhieu);
        }
        
        // Kiểm tra xem có phải dòng MHKX mới không
        if (cols[7].trim() !== '') {
            currentMHKX = {
                sttXuat: cols[7].trim(),
                mhkx: cols[8].trim(),
                dlx: cols[9].trim(),
                slXuat: cols[10].trim(),
                tlXuat: cols[11].trim(),
                tonSL: cols[16].trim(),
                tonTL: cols[17].trim(),
                tonTT: cols[18].trim(),
                maNhaps: [] // Mảng chứa các mã hàng nhập
            };
            
            if (currentPhieu) {
                currentPhieu.mhkxData.push(currentMHKX);
            }
        }
        
        // Kiểm tra xem có phải dòng mã hàng nhập không
        if (cols[12].trim() !== '' && currentMHKX) {
            const maNhap = {
                sttNhap: cols[12].trim(),
                maHangNhap: cols[13].trim(),
                slNhap: cols[14].trim(),
                tlNhap: cols[15].trim()
            };
            
            currentMHKX.maNhaps.push(maNhap);
        }
    }
    
    // Tiền xử lý dữ liệu để phù hợp với cấu trúc của hệ thống
    const processedPhieuList = [];
    
    phieuList.forEach(phieu => {
        phieu.mhkxData.forEach(mhkx => {
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
                maNhaps: mhkx.maNhaps,
                tonSL: mhkx.tonSL,
                tonTL: mhkx.tonTL,
                tonTT: mhkx.tonTT
            };
            
            processedPhieuList.push(newPhieu);
        });
    });
    
    // Hiển thị dữ liệu đã xử lý trong bảng
    displayScPasteData(processedPhieuList);
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
                    <td>${phieu.dlx}
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
// Hàm xóa phiếu
async function deletePhieu(type, id) {
    if (!confirm('Bạn có chắc chắn muốn xóa phiếu này?')) {
        return;
    }
    
    try {
        if (type === 'sc') {
            // Xóa phiếu sang cuộn qua API
            await PhieuSangCuonAPI.delete(id);
            
            // Cập nhật giao diện
            await loadPhieuSangCuonList();
            await convertSangCuonToFormula();
        } else {
            // Xóa phiếu cắt qua API
            await PhieuCatAPI.delete(id);
            
            // Cập nhật giao diện
            await loadPhieuCatList();
            await convertCatToFormula();
        }
        
        alert('Đã xóa phiếu thành công!');
    } catch (error) {
        console.error('Lỗi khi xóa phiếu:', error);
        alert('Có lỗi khi xóa phiếu: ' + error.message);
    }
}

// Hàm chỉnh sửa phiếu
async function editPhieu(type, id) {
    try {
        if (type === 'sc') {
            // Lấy phiếu sang cuộn từ API
            const phieuList = await PhieuSangCuonAPI.getList();
            const phieu = phieuList.find(p => p.id === id);
            
            if (phieu) {
                createEditModal('sc', id, phieu);
            }
        } else {
            // Lấy phiếu cắt từ API
            const phieuList = await PhieuCatAPI.getList();
            const phieu = phieuList.find(p => p.id === id);
            
            if (phieu) {
                createEditModal('cat', id, phieu);
            }
        }
    } catch (error) {
        console.error('Lỗi khi lấy phiếu để chỉnh sửa:', error);
        alert('Có lỗi khi lấy phiếu để chỉnh sửa: ' + error.message);
    }
}



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

//GỌi xử lý tích hợp
saveCatPasteData(processedPhieuList);

}


// Hàm xử lý tích hợp: Lưu phiếu cắt + Cập nhật GMC bổ sung sau
async function processPhieuCatWithGMCUpdate(processedPhieuList) {
    try {
        console.log('=== BẮT ĐẦU XỬ LÝ TÍCH HỢP PHIẾU CẮT + GMC BỔ SUNG SAR ===');
        
        // Bước 1: Xử lý và lưu dữ liệu phiếu cắt (logic cũ)
        console.log('Bước 1: Xử lý dữ liệu phiếu cắt...');
        await saveCatPasteData(processedPhieuList);
        
        // Bước 2: Tạo formula từ phiếu cắt đã xử lý
        console.log('Bước 2: Tạo formula từ phiếu cắt...');
        await convertCatToFormula();
        
        // Bước 3: Lấy dữ liệu formula mới tạo để cập nhật GMC
        console.log('Bước 3: Lấy dữ liệu formula để cập nhật GMC...');
        const formulaData = await getLatestFormulaData(processedPhieuList);
        
        if (formulaData && formulaData.length > 0) {
            // Bước 4: Cập nhật báo cáo GMC bổ sung sau
            console.log('Bước 4: Cập nhật báo cáo GMC bổ sung sau...');
            await updateGMCSupplementaryReports(formulaData);
        } else {
            console.log('Không có dữ liệu formula để cập nhật GMC');
        }
        
        // Bước 5: Hoàn tất và thông báo
        console.log('=== HOÀN TẤT XỬ LÝ TÍCH HỢP ===');
        
        // Reset bảng dán
        clearCatPaste();
        
        // Thông báo thành công
       // alert('Đã xử lý thành công dữ liệu phiếu cắt và cập nhật báo cáo GMC bổ sung sau!');
        
        // Chuyển đến tab danh sách phiếu
        document.querySelector('#cat .sub-tab-btn[onclick="switchSubTab(\'cat-danhsach\')"]').click();
        
    } catch (error) {
        console.error('Lỗi trong quá trình xử lý tích hợp:', error);
        alert('Có lỗi khi xử lý dữ liệu: ' + error.message);
    }
}

// Hàm lấy dữ liệu formula mới tạo
async function getLatestFormulaData(processedPhieuList) {
    console.log('=== LẤY DỮ LIỆU FORMULA MỚI NHẤT ===');
    
    try {
        const response = await fetch('/api/cat/formula');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allFormula = await response.json();
        console.log(`Đã lấy ${allFormula.length} formula từ API`);
        
        const matchingFormula = [];
        
        for (const phieu of processedPhieuList) {
            console.log(`Tìm formula cho phiếu: ${phieu.soPhieu}-${phieu.stt}`);
            
            const formulaItem = allFormula.find(formula => {
                const sttMatch = (
                    formula.stt === phieu.stt || 
                    formula.thuTu === phieu.stt ||
                    formula.stt === parseInt(phieu.stt) ||
                    formula.thuTu === parseInt(phieu.stt) ||
                    String(formula.stt) === String(phieu.stt) ||
                    String(formula.thuTu) === String(phieu.stt)
                );
                
                const match = formula.soPhieu === phieu.soPhieu && sttMatch;
                
                if (match) {
                    console.log(`✅ Tìm thấy formula khớp:`, {
                        soPhieu: formula.soPhieu,
                        stt: formula.stt,
                        thuTu: formula.thuTu,
                        maNL: formula.maNL
                    });
                }
                
                return match;
            });
            
            if (formulaItem) {
                matchingFormula.push(formulaItem);
            } else {
                console.log(`❌ Không tìm thấy formula cho: ${phieu.soPhieu}-${phieu.stt}`);
            }
        }
        
        console.log(`Tổng cộng tìm thấy ${matchingFormula.length} formula khớp`);
        return matchingFormula;
        
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu formula:', error);
        return [];
    }
}



// ===== THÊM HÀM DEBUG =====

function debugDuplicateState() {
    console.log('=== TRẠNG THÁI XỬ LÝ PHIẾU TRÙNG ===');
    console.log('Duplicates:', duplicateHandling.duplicates);
    console.log('Current Index:', duplicateHandling.currentIndex);
    console.log('New Tickets:', duplicateHandling.newTickets.length);
    console.log('Skipped:', duplicateHandling.skipped);
    console.log('Skip Option:', duplicateHandling.skipOption);
    console.log('Ticket Type:', duplicateHandling.ticketType);
}
 


//! ====================================================================================================================================
//! PHẦN 2: HÀM CẬP NHẬT GMC BỔ SUNG SAU - DUYỆT TỪ TRÊN XUỐNG
//! ====================================================================================================================================

// Hàm cập nhật báo cáo GMC bổ sung sau
async function updateGMCSupplementaryReports(formulaData) {
    try {
        console.log('=== BẮT ĐẦU CẬP NHẬT GMC BỔ SUNG SAU ===');
        console.log('Dữ liệu formula để xử lý:', formulaData);
        
        // Bước 1: Lấy danh sách báo cáo GMC (sắp xếp giảm dần - mới nhất lên trên)
        const response = await fetch('/api/bao-cao-gmc/list');
        if (!response.ok) {
            throw new Error('Không thể tải danh sách báo cáo GMC');
        }
        
        const gmcReports = await response.json();
        console.log(`Đã tải ${gmcReports.length} báo cáo GMC`);
        
        // Bước 2: Sắp xếp báo cáo theo thời gian tạo giảm dần (mới nhất lên trên)
        gmcReports.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA; // Giảm dần
        });
        
        let updateCount = 0;
        let checkedCount = 0;
        const maxReportsToCheck = 100; // Giới hạn số báo cáo cần kiểm tra để tránh lag
        
        // Bước 3: Duyệt từ trên xuống (báo cáo mới nhất trước)
        for (let i = 0; i < Math.min(gmcReports.length, maxReportsToCheck); i++) {
            const report = gmcReports[i];
            checkedCount++;
            
            // Kiểm tra điều kiện phiếu bổ sung sau: cột mã vật tư (ma_giay) trống
            const isSupplementaryReport = !report.ma_giay || report.ma_giay.trim() === '';
            
            if (isSupplementaryReport) {
                console.log(`Phát hiện phiếu bổ sung sau: ID ${report.id}, Số phiếu: ${report.so_phieu_cat_giay}, STT: ${report.thu_tu_cuon}`);
                
                // Tìm dữ liệu formula khớp
                const matchingFormula = formulaData.find(formula => 
                    formula.soPhieu === report.so_phieu_cat_giay && 
                    (formula.stt === report.thu_tu_cuon || formula.thuTu === report.thu_tu_cuon)
                );
                
                if (matchingFormula) {
                    console.log(`Tìm thấy formula khớp cho báo cáo ID ${report.id}`);
                    
                    // Cập nhật báo cáo GMC với dữ liệu từ formula
                    const updateSuccess = await updateSingleGMCReport(report.id, matchingFormula, report);
                    
                    if (updateSuccess) {
                        updateCount++;
                        console.log(`✅ Đã cập nhật báo cáo GMC ID ${report.id}`);
                    } else {
                        console.log(`❌ Lỗi khi cập nhật báo cáo GMC ID ${report.id}`);
                    }
                } else {
                    console.log(`Không tìm thấy formula khớp cho báo cáo ID ${report.id} (${report.so_phieu_cat_giay}-${report.thu_tu_cuon})`);
                }
            }
        }
        
        console.log(`=== KẾT QUẢ CẬP NHẬT GMC BỔ SUNG SAU ===`);
        console.log(`- Đã kiểm tra: ${checkedCount}/${gmcReports.length} báo cáo`);
        console.log(`- Đã cập nhật: ${updateCount} báo cáo bổ sung sau`);
        
        // Hiển thị thông báo cho người dùng
        if (updateCount > 0) {
            console.log(`Đã cập nhật thành công ${updateCount} báo cáo GMC bổ sung sau!`);
        }
        
    } catch (error) {
        console.error('Lỗi khi cập nhật GMC bổ sung sau:', error);
        throw error;
    }
}

// Hàm cập nhật một báo cáo GMC cụ thể
async function updateSingleGMCReport(reportId, formulaData, currentReport) {
    try {
        console.log(`Đang cập nhật báo cáo GMC ID ${reportId} với dữ liệu:`, formulaData);
        
        // Chuẩn bị dữ liệu cập nhật
        const updateData = prepareGMCUpdateData(formulaData, currentReport);
        
        if (Object.keys(updateData).length === 0) {
            console.log('Không có dữ liệu cần cập nhật');
            return true;
        }
        
        console.log('Dữ liệu cập nhật:', updateData);
        
        // Gửi yêu cầu cập nhật tới API
        const response = await fetch(`/api/bao-cao-gmc/update-formula/${reportId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Lỗi API khi cập nhật báo cáo GMC ID ${reportId}:`, errorText);
            return false;
        }
        
        const result = await response.json();
        console.log(`Kết quả cập nhật báo cáo GMC ID ${reportId}:`, result);
        
        return true;
        
    } catch (error) {
        console.error(`Lỗi khi cập nhật báo cáo GMC ID ${reportId}:`, error);
        return false;
    }
}

// Hàm chuẩn bị dữ liệu cập nhật cho GMC
function prepareGMCUpdateData(formulaData, currentReport) {
    const updateData = {};
    
    // ===== CẬP NHẬT CÁC TRƯỜNG CƠ BẢN =====
    
    // WS (Worksheet)
    if ((!currentReport.so_ws || currentReport.so_ws === '') && 
        (formulaData.ws || formulaData.soLSX || formulaData.WS || formulaData.wsF)) {
        updateData.so_ws = formulaData.ws || formulaData.soLSX || formulaData.WS || formulaData.wsF;
    }
    
    // Mã giấy (quan trọng - điều kiện xác định phiếu bổ sung sau)
    if ((!currentReport.ma_giay || currentReport.ma_giay === '') && formulaData.maNL) {
        updateData.ma_giay = formulaData.maNL;
    }
    
    // Khách hàng
    if ((!currentReport.khach_hang || currentReport.khach_hang === '') && formulaData.khachHang) {
        updateData.khach_hang = formulaData.khachHang;
    }
    
    // Định lượng
    let dinhLuong = '';
    if (formulaData.maNL) {
        // Tính định lượng từ mã giấy AABBCD-EEEE-FFFF-GGGG
        const parts = formulaData.maNL.split('-');
        if (parts.length >= 2) {
            const eeee = parts[1]; // Vị trí EEEE
            const dinhLuongNumber = parseInt(eeee, 10);
            if (!isNaN(dinhLuongNumber)) {
                dinhLuong = dinhLuongNumber.toString();
            }
        }
    }
    if (!dinhLuong && formulaData.dinhLuong) {
        dinhLuong = formulaData.dinhLuong;
    }
    if (dinhLuong && (!currentReport.dinh_luong || currentReport.dinh_luong === '')) {
        updateData.dinh_luong = dinhLuong;
    }
    
    // ===== CẬP NHẬT KHỔ VÀ DÀI - QUAN TRỌNG =====
    
    // Khổ gốc (không xả đôi) vào kho_mm
    if ((!currentReport.kho_mm || currentReport.kho_mm === '') && formulaData.maNL) {
        let khoGoc = '';
        const parts = formulaData.maNL.split('-');
        if (parts.length >= 3) {
            const ffff = parts[2]; // Vị trí FFFF
            const khoNumber = parseInt(ffff, 10);
            if (!isNaN(khoNumber)) {
                khoGoc = khoNumber.toString(); // Khổ gốc = FFFF (không chia đôi)
            }
        }
        if (!khoGoc && formulaData.khoCat) {
            khoGoc = formulaData.khoCat; // Fallback
        }
        if (khoGoc) {
            updateData.kho_mm = khoGoc;
        }
    }
    
    // Dài vào dai_mm
    if ((!currentReport.dai_mm || currentReport.dai_mm === '') && formulaData.daiCat) {
        updateData.dai_mm = formulaData.daiCat;
    }
    
    // Khổ cắt (có xả đôi) vào kho_cat
    if ((!currentReport.kho_cat || currentReport.kho_cat === '') && formulaData.maNL) {
        let khoCat = '';
        const parts = formulaData.maNL.split('-');
        if (parts.length >= 3) {
            const ffff = parts[2];
            const khoNumber = parseInt(ffff, 10);
            if (!isNaN(khoNumber)) {
                // Lấy xả đôi từ báo cáo hiện tại
                const xaDoi = parseInt(currentReport.xa_doi) || 0;
                if (xaDoi === 1) {
                    khoCat = Math.floor(khoNumber / 2).toString(); // Xả đôi - chia đôi
                } else {
                    khoCat = khoNumber.toString(); // Không xả đôi - giữ nguyên
                }
            }
        }
        if (!khoCat && formulaData.khoCat) {
            khoCat = formulaData.khoCat; // Fallback
        }
        if (khoCat) {
            updateData.kho_cat = khoCat;
        }
    }
    
    // ===== CẬP NHẬT KHỔ XÉN VÀ DÀI XÉN =====
    if ((!currentReport.kho_xen || currentReport.kho_xen === '') && formulaData.khoXen) {
        updateData.kho_xen = formulaData.khoXen;
    }
    
    if ((!currentReport.dai_xen || currentReport.dai_xen === '') && formulaData.daiXen) {
        updateData.dai_xen = formulaData.daiXen;
    }
    
    // ===== CẬP NHẬT SỐ TỜ/PALLET TỪ ĐỊNH MỨC =====
    // Điều này sẽ được xử lý tự động trong API update-formula
    
    console.log('Dữ liệu đã chuẩn bị để cập nhật:', updateData);
    return updateData;
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



/**
 * Xử lý dán dữ liệu Excel cải tiến cho module QLVT
 * Sẽ khắc phục vấn đề dán dữ liệu và xóa dữ liệu
 */

document.addEventListener('DOMContentLoaded', function() {
    // Khắc phục chức năng dán cho cả phiếu sang cuộn và phiếu cắt
    const scPasteCell = document.getElementById('sc-paste-cell');
    const catPasteCell = document.getElementById('cat-paste-cell');
    
    // Gắn trình xử lý dán cải tiến
    if (scPasteCell) {
        scPasteCell.addEventListener('paste', enhancedPasteHandler);
    }
    
    if (catPasteCell) {
        catPasteCell.addEventListener('paste', enhancedPasteHandler);
    }
    
    // Khắc phục nút xóa dữ liệu
    const scClearBtn = document.getElementById('sc-btn-xoa');
    const catClearBtn = document.getElementById('cat-btn-xoa');
    
    if (scClearBtn) {
        scClearBtn.addEventListener('click', function() {
            enhancedClearPaste('sc');
        });
    }
    
    if (catClearBtn) {
        catClearBtn.addEventListener('click', function() {
            enhancedClearPaste('cat');
        });
    }
});

/**
 * Trình xử lý dán cải tiến để phân phối dữ liệu Excel đúng cách
 */
function enhancedPasteHandler(e) {
    e.preventDefault();
    
    // Xác định bảng nào đang xử lý
    const tableId = e.target.closest('table').id;
    const isScTable = tableId === 'sc-dan-table';
    const tableType = isScTable ? 'sc' : 'cat';
    
    // Lấy dữ liệu từ clipboard
    const clipboardData = e.clipboardData || window.clipboardData;
    const pasteData = clipboardData.getData('text');
    
    if (!pasteData.trim()) {
        console.warn('Không có dữ liệu để dán');
        return;
    }
    
    // Chuẩn hóa các ký tự xuống dòng
    const normalizedData = pasteData.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Tách thành các hàng và lọc bỏ hàng trống
    const rows = normalizedData.split('\n').filter(row => row.trim() !== '');
    
    if (rows.length === 0) {
        console.warn('Không tìm thấy hàng hợp lệ trong dữ liệu dán');
        return;
    }
    
    console.log(`Đang xử lý ${rows.length} hàng dữ liệu dán cho ${tableType}`);
    
    // Lấy phần thân bảng để thêm hàng
    const tbody = e.target.closest('table').querySelector('tbody');
    if (!tbody) {
        console.error('Không tìm thấy phần thân bảng');
        return;
    }
    
    // Xóa nội dung hiện có
    tbody.innerHTML = '';
    
    // Xử lý từng hàng
    rows.forEach((rowData, rowIndex) => {
        // Tạo hàng mới
        const newRow = document.createElement('tr');
        
        // Tách dữ liệu hàng theo tab hoặc xử lý dữ liệu không có tab
        let cells;
        if (rowData.includes('\t')) {
            cells = rowData.split('\t');
        } else {
            // Xử lý dữ liệu không có tab - thử tách theo khoảng trắng hoặc các dấu phân cách khác
            cells = rowData.split(/\s{2,}/).filter(item => item.trim() !== '');
        }
        
        // Tạo ô cho mỗi điểm dữ liệu
        cells.forEach((cellData, cellIndex) => {
            const cell = document.createElement('td');
            cell.textContent = cellData.trim();
            cell.contentEditable = 'true';
            newRow.appendChild(cell);
        });
        
        // Thêm ô trống để điền đầy hàng nếu cần
        const requiredCells = isScTable ? 19 : 26; // Số cột trong mỗi bảng
        
        while (newRow.cells.length < requiredCells) {
            const emptyCell = document.createElement('td');
            emptyCell.contentEditable = 'true';
            newRow.appendChild(emptyCell);
        }
        
        // Thêm hàng vào bảng
        tbody.appendChild(newRow);
    });
    
    // Thêm hàng nút xử lý
    const actionRow = document.createElement('tr');
    actionRow.className = 'action-row';
    
    const actionCell = document.createElement('td');
    actionCell.colSpan = isScTable ? 19 : 26;
    actionCell.style.textAlign = 'center';
    
    const processBtn = document.createElement('button');
    processBtn.id = `${tableType}-btn-save-paste`;
    processBtn.className = 'btn-primary';
    processBtn.textContent = 'Xử lý dữ liệu';
    
    actionCell.appendChild(processBtn);
    actionRow.appendChild(actionCell);
    tbody.appendChild(actionRow);
    
    // Thêm trình xử lý sự kiện cho nút xử lý
    processBtn.addEventListener('click', function() {
        if (isScTable) {
            parseAndSaveSangCuonData(tbody);
        } else {
            parseAndSaveCatData(tbody);
        }
    });
    
    console.log('Hoàn tất xử lý dán');
}

/**
 * Hàm cải tiến để xóa dữ liệu đã dán
 */
function enhancedClearPaste(type) {
    const tableId = `${type}-dan-table`;
    const tbody = document.querySelector(`#${tableId} tbody`);
    
    if (!tbody) {
        console.error(`Không tìm thấy phần thân bảng cho ${tableId}`);
        return;
    }
    
    // Xóa phần thân bảng
    tbody.innerHTML = '';
    
    // Tạo hàng dán ban đầu
    const pasteRow = document.createElement('tr');
    pasteRow.id = `${type}-paste-row`;
    
    // Tạo ô dán
    const pasteCell = document.createElement('td');
    pasteCell.id = `${type}-paste-cell`;
    pasteCell.className = 'paste-cell';
    pasteCell.contentEditable = 'true';
    pasteCell.tabIndex = '1';
    pasteCell.style.border = '1px solid green';
    pasteRow.appendChild(pasteCell);
    
    // Thêm ô trống cho phần còn lại của các cột
    const columnCount = type === 'sc' ? 18 : 25; // Giảm 1 vì đã thêm ô dán
    
    for (let i = 0; i < columnCount; i++) {
        const td = document.createElement('td');
        pasteRow.appendChild(td);
    }
    
    // Thêm hàng dán vào bảng
    tbody.appendChild(pasteRow);
    
    // Thêm hàng hướng dẫn
    const instructionRow = document.createElement('tr');
    instructionRow.className = 'instruction-row';
    
    const instructionCell = document.createElement('td');
    instructionCell.colSpan = type === 'sc' ? 19 : 26;
    
    const instructionText = type === 'sc' 
        ? 'Nhấn vào ô đầu tiên (Số phiếu) và dán dữ liệu từ Excel'
        : 'Nhấn vào ô đầu tiên (R) và dán dữ liệu từ Excel';
    
    instructionCell.innerHTML = `<em>${instructionText}</em>`;
    instructionRow.appendChild(instructionCell);
    tbody.appendChild(instructionRow);
    
    // Gắn lại trình xử lý sự kiện dán
    const newPasteCell = document.getElementById(`${type}-paste-cell`);
    if (newPasteCell) {
        newPasteCell.addEventListener('paste', enhancedPasteHandler);
        
        // Focus vào ô dán
        newPasteCell.focus();
    }
    
    console.log(`Đã xóa dữ liệu dán cho ${type}`);
}