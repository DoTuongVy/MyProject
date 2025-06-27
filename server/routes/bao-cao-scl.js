const express = require('express');
const router = express.Router();
const { db } = require('../db');


// Hàm làm tròn giống Excel
function excelRound(num, digits = 0) {
    if (isNaN(num)) return 0;
    
    console.log(`🔍 excelRound input: ${num}, digits: ${digits}`);
    
    // Chuyển sang số nguyên để tránh lỗi floating point
    const multiplier = Math.pow(10, digits);
    console.log(`🔍 multiplier: ${multiplier}`);
    
    const shifted = num * multiplier;
    console.log(`🔍 shifted: ${shifted}`);
    
    let result;
    // SỬA: Dùng Math.round thay vì Math.floor/Math.ceil phức tạp
    result = Math.round(shifted) / multiplier;
    
    console.log(`🔍 excelRound result: ${result}`);
    return result;
}



// API lấy danh sách báo cáo SCL
router.get('/list', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    db.all(`SELECT * FROM bao_cao_scl ORDER BY stt DESC, created_at DESC`, [], (err, rows) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách báo cáo SCL:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách báo cáo SCL' });
        }

        res.json(rows || []);
    });
});

// API lấy số lần mới nhất cho một số phiếu
router.get('/so-lan/:soPhieu', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const { soPhieu } = req.params;

    db.get(`SELECT MAX(so_cuon) as max_so_cuon FROM bao_cao_scl 
        WHERE worksheet = ? AND ma_vat_tu LIKE ?`,
        [batDau.ws, batDau.maVatTu?.substring(0, 6) + '%'], (err, cuonRow) => {
            if (err) {
                console.error('Lỗi khi đếm số cuộn:', err.message);
                return res.status(500).json({ error: 'Lỗi khi lấy số lần của phiếu' });
            }

            const maxSoLan = row?.max_so_lan || 0;
            const soCuon = cuonRow && cuonRow.max_so_cuon ? cuonRow.max_so_cuon : 0;

            res.json({
                so_lan: maxSoLan + 1, // Số lần mới = max + 1
                so_cuon: soCuon
            });
        });
});

// API gửi báo cáo SCL
router.post('/submit', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const reportData = req.body;
    if (!reportData) {
        return res.status(400).json({ error: 'Dữ liệu báo cáo không hợp lệ' });
    }

    // Kiểm tra nếu cần cập nhật formula sau
    if (reportData.needFormulaUpdate) {
        console.log(`Xử lý báo cáo cần cập nhật formula sau: ${reportData.batDau.soPhieu} - ${reportData.batDau.thuTu}`);
        
        // Đánh dấu để cập nhật sau
        reportData.pendingFormulaUpdate = true;
    }
    console.log('Nhận dữ liệu báo cáo từ client:', reportData);

    // Tạo ID duy nhất cho báo cáo
    const reportId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Chuẩn bị dữ liệu để lưu vào database
    const batDau = reportData.batDau || {};
    const ketThuc = reportData.ketThuc || {};
    const nguoiDung = reportData.nguoiDung || {};
    const date = new Date().toISOString().slice(0, 10); // Định dạng YYYY-MM-DD

    // Lấy số lần và số cuộn
    db.get(`SELECT MAX(so_lan) as max_so_lan FROM bao_cao_scl WHERE so_phieu = ?`,
        [batDau.soPhieu], (err, row) => {
            if (err) {
                console.error('Lỗi khi lấy số lần của phiếu:', err.message);
                return res.status(500).json({ error: 'Lỗi khi lấy số lần của phiếu' });
            }

            const soLan = (row?.max_so_lan || 0) + 1;

            // Lấy STT mới nhất
            db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_scl`, [], (err, sttRow) => {
                if (err) {
                    console.error('Lỗi khi lấy STT mới nhất:', err.message);
                    return res.status(500).json({ error: 'Lỗi khi lấy STT mới nhất' });
                }

                const stt = (sttRow?.max_stt || 0) + 1;

                // Lấy định lượng của mã hàng
                db.get(`SELECT * FROM PSC_formula WHERE soPhieu = ? AND mhkx = ?`,
                    [batDau.soPhieu, batDau.maVatTu], (err, formulaRow) => {
                        if (err) {
                            console.error('Lỗi khi lấy thông tin formula:', err.message);
                            // Tiếp tục thực hiện ngay cả khi không có dữ liệu formula
                        }

                        const dinhLuong = formulaRow?.dlXuat || '';
                        const maKH = formulaRow?.maKH || '';

                        // Tính số cuộn dựa trên WS
                        const wsKey = batDau.ws || '';

                        if (wsKey) {
                            // CHỈ ĐẾM SỐ LƯỢNG để tính số cuộn cho phiếu mới, KHÔNG cập nhật lại các phiếu cũ
                            db.get(`SELECT COUNT(*) as count FROM bao_cao_scl WHERE worksheet = ?`, 
                                [wsKey], (err, cuonRow) => {
                                    if (err) {
                                        console.error('Lỗi khi đếm số cuộn theo WS:', err.message);
                                        continueProcessing(1);
                                    } else {
                                        const soCuon = (cuonRow && cuonRow.count ? cuonRow.count : 0) + 1;
                                        console.log(`WS ${wsKey} hiện có ${cuonRow ? cuonRow.count : 0} báo cáo, số cuộn mới sẽ là ${soCuon}`);
                                        continueProcessing(soCuon);
                                    }
                                });
                        } else {
                            // Nếu không có WS, mặc định số cuộn là 1
                            console.log('Không có WS, sử dụng số cuộn mặc định là 1');
                            continueProcessing(1);
                        }

                        // Hàm để tiếp tục quy trình xử lý sau khi đã có số cuộn
                        function continueProcessing(soCuon) {
                            console.log('Tiếp tục xử lý với soCuon =', soCuon);

                            // Xác định thứ tự cuộn
                            let thuTuCuon = batDau.thuTu;
                            if (!thuTuCuon || thuTuCuon === '-- Thứ tự --') {
                                thuTuCuon = "1";
                            } else {
                                // Nếu thuTuCuon có dạng số phiếu + số (ví dụ A012)
                                // Lấy phần số cuối cùng
                                const match = thuTuCuon.match(/(\d+)$/);
                                if (match) {
                                    thuTuCuon = match[1]; // Lấy phần số từ kết quả match
                                }
                            }
                        
                            // Tạo PSC+TT
                            const pscTT = batDau.soPhieu + thuTuCuon;
                        
                            // SỬA 1: Xử lý khổ từ mã hàng - loại bỏ số 0 đầu
                            let khoFromMaVatTu = '';
                            if (batDau.maVatTu) {
                                // Mẫu mã hàng: GCKGSG-0120-2200-0000
                                const parts = batDau.maVatTu.split('-');
                                if (parts.length >= 3) {
                                    const rawKho = parts[2]; // Lấy phần thứ 3 (ví dụ: "0950")
                                    khoFromMaVatTu = parseInt(rawKho, 10).toString(); // Chuyển "0950" thành "950"
                                }
                            } else if (reportData.isPendingFormula && batDau.khoSanPham) {
                                // Phiếu bổ sung sau: sử dụng khổ sản phẩm đã nhập
                                khoFromMaVatTu = batDau.khoSanPham;
                            }
                        
                            // SỬA 2: Xử lý khổ 1, 2, 3 từ khổ cần sang
                            let kho1Value = '', kho2Value = '', kho3Value = '';
                            if (batDau.khoCanSang) {
                                const khoArray = batDau.khoCanSang.split('+').map(k => k.trim());
                                kho1Value = khoArray.length >= 1 ? khoArray[0] : '';
                                kho2Value = khoArray.length >= 2 ? khoArray[1] : '';
                                kho3Value = khoArray.length >= 3 ? khoArray[2] : '';
                            } else {
                                // Nếu không có khổ cần sang, lấy từ các vị trí
                                kho1Value = batDau.viTri1 || '';
                                kho2Value = batDau.viTri2 || '';
                                kho3Value = batDau.viTri3 || '';
                            }
                        
                            const khoSang1 = parseFloat(kho1Value) || 0;
                            const khoSang2 = parseFloat(kho2Value) || 0;
                            const khoSang3 = parseFloat(kho3Value) || 0;
                            const tongKhoSang = khoSang1 + khoSang2 + khoSang3;
                        
                            // SỬA 3: Kiểm tra so sánh khổ - so sánh tổng khổ với khổ từ mã hàng
                            let soSanhKho = tongKhoSang.toString();
                            let khoBangNhau = false;
                            
                            if (khoFromMaVatTu && tongKhoSang > 0) {
                                const khoFromMaVatTuNum = parseFloat(khoFromMaVatTu);
                                khoBangNhau = (khoFromMaVatTuNum === tongKhoSang);
                                
                                // Nếu không bằng nhau, đánh dấu để hiển thị màu vàng
                                if (!khoBangNhau) {
                                    soSanhKho = soSanhKho + '!'; // Thêm dấu ! để đánh dấu cần tô vàng
                                }
                            }

                            // Tính toán trọng lượng nhập kho - SỬA: Áp dụng công thức mới
                            const trongLuongNhan = parseFloat(batDau.trongLuong) || 0;
                            const pheLieuDauCuon = parseFloat(ketThuc.pheLieuDauCuon) || 0;
                            const pheLieuSanXuat = parseFloat(ketThuc.pheLieuSanXuat) || 0;
                            const khoFromMaVatTuNum = parseFloat(khoFromMaVatTu) || 0;
                            
                            const soMet = parseFloat(ketThuc.soMet) || 0;
                            const dinhLuongValue = parseFloat(dinhLuong) || 0;
                            
                            // Xác định hoàn thành cuộn: 1 = Chạy hết cuộn, 0 = Chạy lỡ
                            const hoanThanhCuon = ketThuc.suDung === "0" ? 0 : 1;
                            
                            // Tính trọng lượng cân lại (nếu có nhập tay)
                            const trongLuongCanLai1 = ketThuc.soKg1 ? parseFloat(ketThuc.soKg1) : null;
                            const trongLuongCanLai2 = ketThuc.soKg2 ? parseFloat(ketThuc.soKg2) : null;
                            const trongLuongCanLai3 = ketThuc.soKg3 ? parseFloat(ketThuc.soKg3) : null;

                            // Tính trọng lượng nhập kho 1
let tlNhapKho1 = 0;
if (trongLuongCanLai1 !== null) {
    // Nếu có cân lại thủ công, sử dụng giá trị đó
    tlNhapKho1 = trongLuongCanLai1;
    console.log('\nNhập kho 1: Sử dụng cân lại thủ công =', tlNhapKho1);
} else if (khoSang1 > 0 && khoFromMaVatTuNum > 0) {
    if (hoanThanhCuon === 1) {
        // Hoàn thành cuộn = 1: ((Khổ 1 x Định lượng x Số mét) / 1000000) - (Khổ 1 x (Phế liệu đầu cuộn + Phế liệu sản xuất) / Khổ(mm))
        const phan1 = (khoSang1 * dinhLuongValue * soMet) / 1000000;
        const phan2 = (khoSang1 * (pheLieuDauCuon + pheLieuSanXuat)) / khoFromMaVatTuNum;
        tlNhapKho1 = excelRound(phan1 - phan2, 2);
        
        console.log('\nNhập kho 1 - CHẠY HẾT CUỘN:');
        console.log('Công thức: ((Khổ 1 × Định lượng × Số mét) ÷ 1000000) - (Khổ 1 × (Phế liệu đầu cuộn + Phế liệu sản xuất) ÷ Khổ(mm))');
        console.log(`Phần 1: (${khoSang1} × ${dinhLuongValue} × ${soMet}) ÷ 1000000 = ${phan1}`);
        console.log(`Phần 2: (${khoSang1} × (${pheLieuDauCuon} + ${pheLieuSanXuat})) ÷ ${khoFromMaVatTuNum} = ${phan2}`);
        console.log(`Kết quả: ${phan1} - ${phan2} = ${tlNhapKho1}`);
    } else {
        // Hoàn thành cuộn = 0: (Khổ 1 x (Trọng lượng nhận - (Phế liệu đầu cuộn + Phế liệu sản xuất))) / Khổ(mm)
        tlNhapKho1 = excelRound((khoSang1 * (trongLuongNhan - (pheLieuDauCuon + pheLieuSanXuat))) / khoFromMaVatTuNum, 2);
        
        console.log('\nNhập kho 1 - CHẠY LỠ:');
        console.log('Công thức: (Khổ 1 × (Trọng lượng nhận - (Phế liệu đầu cuộn + Phế liệu sản xuất))) ÷ Khổ(mm)');
        console.log(`Tính: (${khoSang1} × (${trongLuongNhan} - (${pheLieuDauCuon} + ${pheLieuSanXuat}))) ÷ ${khoFromMaVatTuNum}`);
        console.log(`= (${khoSang1} × ${trongLuongNhan - (pheLieuDauCuon + pheLieuSanXuat)}) ÷ ${khoFromMaVatTuNum} = ${tlNhapKho1}`);
    }
}

// Tính trọng lượng nhập kho 2
let tlNhapKho2 = 0;
if (trongLuongCanLai2 !== null) {
    // Nếu có cân lại thủ công, sử dụng giá trị đó
    tlNhapKho2 = trongLuongCanLai2;
    console.log('\nNhập kho 2: Sử dụng cân lại thủ công =', tlNhapKho2);
} else if (khoSang2 > 0 && khoFromMaVatTuNum > 0) {
    if (hoanThanhCuon === 1) {
        // Hoàn thành cuộn = 1: ((Khổ 2 x Định lượng x Số mét) / 1000000) - (Khổ 2 x (Phế liệu đầu cuộn + Phế liệu sản xuất) / Khổ(mm))
        const phan1 = (khoSang2 * dinhLuongValue * soMet) / 1000000;
        const phan2 = (khoSang2 * (pheLieuDauCuon + pheLieuSanXuat)) / khoFromMaVatTuNum;
        tlNhapKho2 = excelRound(phan1 - phan2, 2);
        
        console.log('\nNhập kho 2 - CHẠY HẾT CUỘN:');
        console.log(`Phần 1: (${khoSang2} × ${dinhLuongValue} × ${soMet}) ÷ 1000000 = ${phan1}`);
        console.log(`Phần 2: (${khoSang2} × (${pheLieuDauCuon} + ${pheLieuSanXuat})) ÷ ${khoFromMaVatTuNum} = ${phan2}`);
        console.log(`Kết quả: ${phan1} - ${phan2} = ${tlNhapKho2}`);
    } else {
        // Hoàn thành cuộn = 0: (Khổ 2 x (Trọng lượng nhận - (Phế liệu đầu cuộn + Phế liệu sản xuất))) / Khổ(mm)
        tlNhapKho2 = excelRound((khoSang2 * (trongLuongNhan - (pheLieuDauCuon + pheLieuSanXuat))) / khoFromMaVatTuNum, 2);
        
        console.log('\nNhập kho 2 - CHẠY LỠ:');
        console.log(`Tính: (${khoSang2} × ${trongLuongNhan - (pheLieuDauCuon + pheLieuSanXuat)}) ÷ ${khoFromMaVatTuNum} = ${tlNhapKho2}`);
    }
}

// Tính trọng lượng nhập kho 3
let tlNhapKho3 = 0;
if (trongLuongCanLai3 !== null) {
    // Nếu có cân lại thủ công, sử dụng giá trị đó
    tlNhapKho3 = trongLuongCanLai3;
    console.log('\nNhập kho 3: Sử dụng cân lại thủ công =', tlNhapKho3);
} else if (khoSang3 > 0 && khoFromMaVatTuNum > 0) {
    if (hoanThanhCuon === 1) {
        // Hoàn thành cuộn = 1: ((Khổ 3 x Định lượng x Số mét) / 1000000) - (Khổ 3 x (Phế liệu đầu cuộn + Phế liệu sản xuất) / Khổ(mm))
        const phan1 = (khoSang3 * dinhLuongValue * soMet) / 1000000;
        const phan2 = (khoSang3 * (pheLieuDauCuon + pheLieuSanXuat)) / khoFromMaVatTuNum;
        tlNhapKho3 = excelRound(phan1 - phan2, 2);
        
        console.log('\nNhập kho 3 - CHẠY HẾT CUỘN:');
        console.log(`Phần 1: (${khoSang3} × ${dinhLuongValue} × ${soMet}) ÷ 1000000 = ${phan1}`);
        console.log(`Phần 2: (${khoSang3} × (${pheLieuDauCuon} + ${pheLieuSanXuat})) ÷ ${khoFromMaVatTuNum} = ${phan2}`);
        console.log(`Kết quả: ${phan1} - ${phan2} = ${tlNhapKho3}`);
    } else {
        // Hoàn thành cuộn = 0: (Khổ 3 x (Trọng lượng nhận - (Phế liệu đầu cuộn + Phế liệu sản xuất))) / Khổ(mm)
        tlNhapKho3 = excelRound((khoSang3 * (trongLuongNhan - (pheLieuDauCuon + pheLieuSanXuat))) / khoFromMaVatTuNum, 2);
        
        console.log('\nNhập kho 3 - CHẠY LỠ:');
        console.log(`Tính: (${khoSang3} × ${trongLuongNhan - (pheLieuDauCuon + pheLieuSanXuat)}) ÷ ${khoFromMaVatTuNum} = ${tlNhapKho3}`);
    }
}

// Tính trọng lượng trả kho - SỬA: Áp dụng logic mới
let tlTraKho = '';
if (hoanThanhCuon === 0) {
    // Hoàn thành cuộn = 0: để trống
    tlTraKho = '';
    console.log('\nTrả kho: CHẠY LỠ - để trống');
} else {
    // Hoàn thành cuộn = 1: Trọng lượng nhận - Nhập kho 1 - Nhập kho 2 - Nhập kho 3 - Phế liệu đầu cuộn - Phế liệu sản xuất
    const traKhoValue = trongLuongNhan - tlNhapKho1 - tlNhapKho2 - tlNhapKho3 - pheLieuDauCuon - pheLieuSanXuat;
    tlTraKho = excelRound(traKhoValue, 2);
    
    console.log('\nTrả kho - CHẠY HẾT CUỘN:');
    console.log('Công thức: Trọng lượng nhận - Nhập kho 1 - Nhập kho 2 - Nhập kho 3 - Phế liệu đầu cuộn - Phế liệu sản xuất');
    console.log(`Tính: ${trongLuongNhan} - ${tlNhapKho1} - ${tlNhapKho2} - ${tlNhapKho3} - ${pheLieuDauCuon} - ${pheLieuSanXuat}`);
    console.log(`= ${traKhoValue} => làm tròn = ${tlTraKho}`);
    
    // Nếu kết quả gần bằng 0 (< 0.01), để trống
    if (Math.abs(tlTraKho) < 0.01) {
        tlTraKho = '';
        console.log('Kết quả gần 0, đặt trả kho = trống');
    }
}


// Tính Trọng lượng chạy sai 1, 2, 3
let tlChaySai1 = '', tlChaySai2 = '', tlChaySai3 = '';

// Lấy dữ liệu số mét sai và khổ sai
const soMetSai = parseFloat(ketThuc.soMetSai) || 0;
const khoSai1 = parseFloat(ketThuc.khoSai1) || 0;
const khoSai2 = parseFloat(ketThuc.khoSai2) || 0;
const khoSai3 = parseFloat(ketThuc.khoSai3) || 0;

console.log('Dữ liệu chạy sai:', {
    soMetSai, khoSai1, khoSai2, khoSai3,
    dinhLuongValue, pheLieuDauCuon, pheLieuSanXuat, khoFromMaVatTuNum
});

// Tính TL chạy sai 1
if (khoSai1 > 0 && soMetSai > 0 && dinhLuongValue > 0 && khoFromMaVatTuNum > 0) {
    // Công thức: ((Khổ sai 1 x Định lượng x Số met sai)/1000000) - (Khổ sai 1 x (PLDC + PLSX) / Khổ(mm))
    const phan1 = (khoSai1 * dinhLuongValue * soMetSai) / 1000000;
    const phan2 = (khoSai1 * (pheLieuDauCuon + pheLieuSanXuat)) / khoFromMaVatTuNum;
    tlChaySai1 = excelRound(phan1 - phan2, 2);
    
    console.log('\nTL chạy sai 1:');
    console.log(`Phần 1: (${khoSai1} × ${dinhLuongValue} × ${soMetSai}) ÷ 1000000 = ${phan1}`);
    console.log(`Phần 2: (${khoSai1} × (${pheLieuDauCuon} + ${pheLieuSanXuat})) ÷ ${khoFromMaVatTuNum} = ${phan2}`);
    console.log(`Kết quả: ${phan1} - ${phan2} = ${tlChaySai1}`);
}

// Tính TL chạy sai 2
if (khoSai2 > 0 && soMetSai > 0 && dinhLuongValue > 0 && khoFromMaVatTuNum > 0) {
    const phan1 = (khoSai2 * dinhLuongValue * soMetSai) / 1000000;
    const phan2 = (khoSai2 * (pheLieuDauCuon + pheLieuSanXuat)) / khoFromMaVatTuNum;
    tlChaySai2 = excelRound(phan1 - phan2, 2);
    
    console.log('\nTL chạy sai 2:');
    console.log(`Phần 1: (${khoSai2} × ${dinhLuongValue} × ${soMetSai}) ÷ 1000000 = ${phan1}`);
    console.log(`Phần 2: (${khoSai2} × (${pheLieuDauCuon} + ${pheLieuSanXuat})) ÷ ${khoFromMaVatTuNum} = ${phan2}`);
    console.log(`Kết quả: ${phan1} - ${phan2} = ${tlChaySai2}`);
}

// Tính TL chạy sai 3
if (khoSai3 > 0 && soMetSai > 0 && dinhLuongValue > 0 && khoFromMaVatTuNum > 0) {
    const phan1 = (khoSai3 * dinhLuongValue * soMetSai) / 1000000;
    const phan2 = (khoSai3 * (pheLieuDauCuon + pheLieuSanXuat)) / khoFromMaVatTuNum;
    tlChaySai3 = excelRound(phan1 - phan2, 2);
    
    console.log('\nTL chạy sai 3:');
    console.log(`Phần 1: (${khoSai3} × ${dinhLuongValue} × ${soMetSai}) ÷ 1000000 = ${phan1}`);
    console.log(`Phần 2: (${khoSai3} × (${pheLieuDauCuon} + ${pheLieuSanXuat})) ÷ ${khoFromMaVatTuNum} = ${phan2}`);
    console.log(`Kết quả: ${phan1} - ${phan2} = ${tlChaySai3}`);
}



                            console.log('Thông tin tính toán:', {
                                hoanThanhCuon,
                                trongLuongNhan,
                                pheLieuDauCuon,
                                pheLieuSanXuat,
                                khoFromMaVatTuNum,
                                soMet,
                                dinhLuongValue,
                                khoSang1, khoSang2, khoSang3,
                                tlNhapKho1, tlNhapKho2, tlNhapKho3,
                                tlTraKho
                            });
                        
                            console.log('Thông tin lưu vào DB:', {
                                reportId,
                                stt,
                                ca: batDau.ca,
                                soPhieu: batDau.soPhieu,
                                soLan,
                                thuTuCuon,
                                isPendingFormula: reportData.isPendingFormula,
                                khoFromMaVatTu,
                                kho1Value,
                                kho2Value, 
                                kho3Value,
                                soSanhKho,
                                soCuon
                            });
                        
                            // Lưu báo cáo chính với số cuộn đã tính được
                            const insertSQL = `INSERT INTO bao_cao_scl (
                                id, stt, ca, ngay, so_phieu, so_lan, worksheet, khach_hang, 
                                ma_vat_tu, dinh_luong, kho, so_sanh_kho, ma_so_cuon, trong_luong_nhan,
                                thoi_gian_bat_dau, thoi_gian_ket_thuc, kho_san_pham, kho_can_sang,
                                kho_1, kho_2, kho_3, so_met, hoan_thanh_cuon, nhap_kho_1, nhap_kho_2, nhap_kho_3,
                                tra_kho, phe_lieu_dau_cuon, phe_lieu_san_xuat, so_cuon, ghi_chu, thu_tu_cuon,
                                so_id, psc_tt, vi_tri_1, vi_tri_2, vi_tri_3, trong_luong_can_lai_1, trong_luong_can_lai_2,
                                trong_luong_can_lai_3, so_met_chay_sai, kho_sai_1, kho_sai_2, kho_sai_3,
                                tl_chay_sai_1, tl_chay_sai_2, tl_chay_sai_3, dung_may, nguoi_thuc_hien, user_id
                              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                        
                            db.run(insertSQL, [
                                reportId,
                                stt,
                                batDau.ca || '',
                                date,
                                batDau.soPhieu || '',
                                soLan,
                                batDau.ws || '',
                                maKH || batDau.khachHang || '',
                                batDau.maVatTu || '',
                                dinhLuong || '',
                                khoFromMaVatTu || '', // SỬA: Sử dụng khổ đã xử lý
                                soSanhKho || '', // SỬA: Sử dụng giá trị so sánh khổ
                                batDau.maSoCuon || '',
                                batDau.trongLuong || '',
                                batDau.thoiGianBatDau || '',
                                ketThuc.thoiGianKetThuc || '',
                                batDau.khoSanPham || batDau.viTri1 || '',
                                batDau.khoCanSang || '',
                                kho1Value || '', // SỬA: Sử dụng khổ 1 đã tách
                                kho2Value || '', // SỬA: Sử dụng khổ 2 đã tách  
                                kho3Value || '', // SỬA: Sử dụng khổ 3 đã tách
                                ketThuc.soMet || '',
                                ketThuc.suDung || '',
                                tlNhapKho1.toString(), // SỬA: Sử dụng giá trị đã tính toán mới
                                tlNhapKho2.toString(), // SỬA: Sử dụng giá trị đã tính toán mới
                                tlNhapKho3.toString(), // SỬA: Sử dụng giá trị đã tính toán mới
                                tlTraKho.toString(),   // SỬA: Sử dụng giá trị đã tính toán mới
                                ketThuc.pheLieuDauCuon || '', // SỬA: Đảm bảo trường này được lưu
                                ketThuc.pheLieuSanXuat || '', // SỬA: Đảm bảo trường này được lưu
                                soCuon, // SỬA: Đảm bảo số cuộn được lưu đúng
                                ketThuc.ghiChu || '',
                                thuTuCuon || '', // SỬA: Đảm bảo thứ tự cuộn được lưu
                                batDau.soID || '',
                                pscTT || '',
                                batDau.viTriSelect1 || '', // SỬA: Lưu đúng vị trí đã chọn
                                batDau.viTriSelect2 || '', // SỬA: Lưu đúng vị trí đã chọn
                                batDau.viTriSelect3 || '', // SỬA: Lưu đúng vị trí đã chọn
                                ketThuc.soKg1 || '',
                                ketThuc.soKg2 || '',
                                ketThuc.soKg3 || '',
                                ketThuc.soMetSai || '',
                                ketThuc.khoSai1 || '',
                                ketThuc.khoSai2 || '',
                                ketThuc.khoSai3 || '',
                                tlChaySai1.toString(), // tl_chay_sai_1
tlChaySai2.toString(), // tl_chay_sai_2  
tlChaySai3.toString(), // tl_chay_sai_3
                                ketThuc.dungMay ? 1 : 0,
                                batDau.nguoiThucHien || '',
                                nguoiDung.id || ''
                            ], function (err) {
                                if (err) {
                                    console.error('Lỗi khi lưu báo cáo SCL:', err.message);
                                    return res.status(500).json({ error: 'Lỗi khi lưu báo cáo SCL: ' + err.message });
                                }
                        
                                console.log('Đã lưu báo cáo SCL thành công với ID:', reportId);
                        
                                // Cập nhật số cuộn cho tất cả báo cáo có cùng WS
                                if (batDau.ws) {
                                    updateAllSoCuonForSameWS(batDau.ws, () => {
                                        handleStopReports();
                                    });
                                } else {
                                    handleStopReports();
                                }

                                // HÀM MỚI: Cập nhật số cuộn cho tất cả báo cáo có cùng WS
                                function updateAllSoCuonForSameWS(wsValue, callback) {
                                    if (!wsValue) {
                                        if (callback) callback();
                                        return;
                                    }
                                    
                                    // Đếm tổng số báo cáo có cùng WS
                                    db.get(`SELECT COUNT(*) as total FROM bao_cao_scl WHERE worksheet = ?`, 
                                        [wsValue], (err, countResult) => {
                                            if (err) {
                                                console.error('Lỗi khi đếm tổng báo cáo cùng WS:', err.message);
                                                if (callback) callback();
                                                return;
                                            }
                                            
                                            const totalReports = countResult.total || 1;
                                            console.log(`WS ${wsValue} có tổng ${totalReports} báo cáo, cập nhật tất cả thành số cuộn ${totalReports}`);
                                            
                                            // Cập nhật TẤT CẢ báo cáo có cùng WS thành cùng một số cuộn
                                            db.run(`UPDATE bao_cao_scl SET so_cuon = ? WHERE worksheet = ?`,
                                                [totalReports, wsValue], (updateErr) => {
                                                    if (updateErr) {
                                                        console.error('Lỗi khi cập nhật số cuộn cho tất cả báo cáo cùng WS:', updateErr.message);
                                                    } else {
                                                        console.log(`✅ Đã cập nhật TẤT CẢ báo cáo WS ${wsValue} thành số cuộn ${totalReports}`);
                                                    }
                                                    
                                                    if (callback) callback();
                                                });
                                        });
                                }

                                // Hàm xử lý báo cáo dừng máy
                                function handleStopReports() {
                                    // Nếu có báo cáo dừng máy, lưu các lý do dừng máy
                                    if (reportData.dungMay && Array.isArray(reportData.dungMay)) {
                                        const stopReports = reportData.dungMay;

                                        // Lấy STT mới nhất cho báo cáo dừng máy
                                        db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_scl_dung_may`, [], (stopSttErr, stopSttRow) => {
                                            if (stopSttErr) {
                                                console.error('Lỗi khi lấy STT mới nhất cho dừng máy:', stopSttErr.message);
                                                // Tiếp tục với STT mặc định
                                            }

                                            const baseStopStt = (stopSttRow?.max_stt || 0);

                                            const insertPromises = stopReports.map((stopReport, index) => {
                                                return new Promise((resolve, reject) => {
                                                    const stopId = Date.now().toString() + index;
                                                    const stopStt = baseStopStt + index + 1; // STT tăng dần cho mỗi báo cáo dừng máy

                                                    db.run(`INSERT INTO bao_cao_scl_dung_may (
                                                        id, bao_cao_id, stt, ca, nguoi_thuc_hien, worksheet, so_phieu,
                                                        ly_do, ly_do_khac, thoi_gian_dung, thoi_gian_chay_lai,
                                                        thoi_gian_dung_may, ghi_chu
                                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                                        [
                                                            stopId,
                                                            reportId,
                                                            stopStt,
                                                            batDau.ca || '',                 // Ca làm việc từ báo cáo chính
                                                            batDau.nguoiThucHien || '',     // Người thực hiện từ báo cáo chính
                                                            batDau.ws || '',                // Worksheet từ báo cáo chính
                                                            batDau.soPhieu || '',           // Số phiếu từ báo cáo chính
                                                            stopReport.lyDo || '',          // Lý do dừng máy
                                                            stopReport.lyDoKhac || '',      // Lý do khác
                                                            stopReport.thoiGianDung || '',  // Thời gian dừng
                                                            stopReport.thoiGianChayLai || '', // Thời gian chạy lại
                                                            stopReport.thoiGianDungMay || '', // Thời gian dừng máy (đã tính)
                                                            stopReport.ghiChu || ketThuc.ghiChu || '' // Ghi chú, ưu tiên từ báo cáo dừng máy
                                                        ], function (err) {
                                                            if (err) {
                                                                console.error('Lỗi khi lưu lý do dừng máy:', err.message);
                                                                reject(err);
                                                            } else {
                                                                console.log(`Đã lưu lý do dừng máy #${index + 1} với ID: ${stopId}`);
                                                                resolve();
                                                            }
                                                        });
                                                });
                                            });

                                            Promise.all(insertPromises)
                                                .then(() => {
                                                    res.json({
                                                        success: true,
                                                        id: reportId,
                                                        message: 'Đã lưu báo cáo SCL thành công'
                                                    });
                                                })
                                                .catch(err => {
                                                    console.error('Lỗi khi lưu lý do dừng máy:', err);
                                                    res.status(500).json({ error: 'Lỗi khi lưu lý do dừng máy' });
                                                });
                                        });
                                    } else {
                                        res.json({
                                            success: true,
                                            id: reportId,
                                            message: 'Đã lưu báo cáo SCL thành công'
                                        });
                                    }
                                }
                            });
                        }
                    });
            });
        });

    // Nếu báo cáo cần cập nhật formula sau
    if (req.body.needFormulaUpdate) {
        console.log(`Báo cáo ID ${reportId} đã được đánh dấu cần cập nhật formula sau.`);
        
        // Thêm trường đánh dấu vào database nếu cần
        db.run(`UPDATE bao_cao_scl SET need_formula_update = 1 WHERE id = ?`, [reportId], function(err) {
            if (err) {
                console.error('Lỗi khi đánh dấu báo cáo cần cập nhật formula:', err.message);
            }
        });
    }
});

// Hàm cập nhật số cuộn cho tất cả báo cáo có cùng WS
function updateSoCuonForSameWS(wsValue, callback) {
    if (!wsValue) {
        if (callback) callback();
        return;
    }
    
    // Lấy tất cả báo cáo có cùng WS và sắp xếp theo thời gian tạo
    db.all(`SELECT id, so_cuon, created_at FROM bao_cao_scl 
           WHERE worksheet = ? 
           ORDER BY created_at ASC`, [wsValue], (err, rows) => {
        if (err || !rows) {
            console.error('Lỗi khi lấy danh sách báo cáo cùng WS:', err?.message);
            if (callback) callback();
            return;
        }
        
        console.log(`Cập nhật số cuộn cho ${rows.length} báo cáo có WS: ${wsValue}`);
        
        // Cập nhật số cuộn cho từng báo cáo theo thứ tự thời gian
        let updateCount = 0;
        const totalRows = rows.length;
        
        rows.forEach((row, index) => {
            const expectedSoCuon = index + 1;
            
            if (row.so_cuon !== expectedSoCuon) {
                db.run(`UPDATE bao_cao_scl SET so_cuon = ? WHERE id = ?`, 
                    [expectedSoCuon, row.id], (updateErr) => {
                        updateCount++;
                        
                        if (updateErr) {
                            console.error(`Lỗi cập nhật số cuộn cho báo cáo ${row.id}:`, updateErr.message);
                        } else {
                            console.log(`Đã cập nhật số cuộn ${expectedSoCuon} cho báo cáo ${row.id}`);
                        }
                        
                        // Gọi callback khi đã xử lý xong tất cả
                        if (updateCount === totalRows && callback) {
                            callback();
                        }
                    });
            } else {
                updateCount++;
                // Gọi callback khi đã xử lý xong tất cả
                if (updateCount === totalRows && callback) {
                    callback();
                }
            }
        });
        
        // Nếu không có gì cần cập nhật
        if (totalRows === 0 && callback) {
            callback();
        }
    });
}


// API lấy chi tiết báo cáo SCL
router.get('/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const { id } = req.params;

    db.get(`SELECT * FROM bao_cao_scl WHERE id = ?`, [id], (err, report) => {
        if (err) {
            console.error('Lỗi khi lấy chi tiết báo cáo SCL:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy chi tiết báo cáo SCL' });
        }

        if (!report) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo SCL' });
        }

        // Lấy thông tin dừng máy nếu có
        db.all(`SELECT * FROM bao_cao_scl_dung_may WHERE bao_cao_id = ?`, [id], (err, stopReports) => {
            if (err) {
                console.error('Lỗi khi lấy thông tin dừng máy:', err.message);
                return res.status(500).json({ error: 'Lỗi khi lấy thông tin dừng máy' });
            }

            // Thêm thông tin dừng máy vào báo cáo
            report.dungMay = stopReports || [];

            res.json(report);
        });
    });
});


// Tìm phiếu trong formula dựa trên số phiếu và thứ tự
function findFormulaByPhieuAndOrder(soPhieu, thuTu) {
    return new Promise((resolve, reject) => {
        // Tạo phiếu phụ từ số phiếu và thứ tự
        const phieuPhu = soPhieu + thuTu;
        
        // Tìm trong bảng formula
        db.get(`SELECT * FROM PSC_formula WHERE soPhieu = ? AND (phieuPhu = ? OR sttXuat = ?)`, 
            [soPhieu, phieuPhu, thuTu], (err, row) => {
                if (err) {
                    console.error('Lỗi khi tìm formula:', err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
    });
}


// API cập nhật dữ liệu formula cho báo cáo
router.put('/update-formula/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const { id } = req.params;
    const updateData = req.body;

    if (!id || !updateData) {
        return res.status(400).json({ error: 'Dữ liệu cập nhật không hợp lệ' });
    }

    console.log('Cập nhật formula cho báo cáo ID:', id);
    console.log('Dữ liệu cập nhật:', updateData);

    // Lấy thông tin báo cáo hiện tại trước khi cập nhật
    db.get(`SELECT * FROM bao_cao_scl WHERE id = ?`, [id], (err, currentReport) => {
        if (err) {
            console.error('Lỗi khi lấy thông tin báo cáo hiện tại:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy thông tin báo cáo hiện tại' });
        }

        if (!currentReport) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo để cập nhật' });
        }

        console.log('Báo cáo hiện tại:', currentReport);

        // Xây dựng dữ liệu cập nhật
        let updateFields = [];
        let updateValues = [];

        // Biến để lưu thông tin khổ
        let khoFromMaVatTu = currentReport.kho || '';
        let khoCanSangValue = currentReport.kho_can_sang || '';

        // Cập nhật mã vật tư và khổ
        if (updateData.ma_vat_tu) {
            updateFields.push('ma_vat_tu = ?');
            updateValues.push(updateData.ma_vat_tu);

            // Xử lý khổ từ mã vật tư mới - loại bỏ số 0 đầu
            const parts = updateData.ma_vat_tu.split('-');
            if (parts.length >= 3) {
                const rawKho = parts[2]; // Ví dụ: "0950" 
                khoFromMaVatTu = parseInt(rawKho, 10).toString(); // Chuyển "0950" thành "950"
                
                updateFields.push('kho = ?');
                updateValues.push(khoFromMaVatTu);
                
                // Cập nhật khổ sản phẩm
                updateFields.push('kho_san_pham = ?');
                updateValues.push(khoFromMaVatTu);

                console.log('Khổ từ mã vật tư:', khoFromMaVatTu);
            }
        }

        // Cập nhật worksheet
        if (updateData.worksheet) {
            updateFields.push('worksheet = ?');
            updateValues.push(updateData.worksheet);
        }

        // Cập nhật khách hàng
        if (updateData.khach_hang) {
            updateFields.push('khach_hang = ?');
            updateValues.push(updateData.khach_hang);
        }

        // Cập nhật định lượng
        if (updateData.dinh_luong) {
            updateFields.push('dinh_luong = ?');
            updateValues.push(updateData.dinh_luong);
        }

        // Cập nhật khổ cần sang và tách thành khổ 1,2,3
        if (updateData.kho_can_sang) {
            khoCanSangValue = updateData.kho_can_sang;
            updateFields.push('kho_can_sang = ?');
            updateValues.push(khoCanSangValue);

            console.log('Khổ cần sang mới:', khoCanSangValue);
        }

        // QUAN TRỌNG: Xử lý khổ 1,2,3 từ dữ liệu hiện có hoặc mới
        // Ưu tiên: kho_can_sang -> từ vi_tri của báo cáo hiện tại
        let khoArray = [];
        
        if (khoCanSangValue) {
            // Tách từ khổ cần sang
            khoArray = khoCanSangValue.split('+').map(k => {
                const trimmed = k.trim();
                return trimmed ? parseInt(trimmed, 10).toString() : '';
            }).filter(k => k); // Loại bỏ chuỗi rỗng
        } else {
            // Nếu không có khổ cần sang, lấy từ vị trí hiện có
            const viTri1 = currentReport.vi_tri_1 || '';
            const viTri2 = currentReport.vi_tri_2 || '';
            const viTri3 = currentReport.vi_tri_3 || '';
            
            if (viTri1) khoArray.push(viTri1);
            if (viTri2) khoArray.push(viTri2);
            if (viTri3) khoArray.push(viTri3);
        }

        console.log('Mảng khổ đã tách:', khoArray);

        // Cập nhật khổ 1, 2, 3
        const kho1 = khoArray.length >= 1 ? khoArray[0] : '';
        const kho2 = khoArray.length >= 2 ? khoArray[1] : '';
        const kho3 = khoArray.length >= 3 ? khoArray[2] : '';

        updateFields.push('kho_1 = ?', 'kho_2 = ?', 'kho_3 = ?');
        updateValues.push(kho1, kho2, kho3);

        console.log('Khổ 1,2,3:', { kho1, kho2, kho3 });

        // Tính toán so sánh khổ
        const tongKhoSang = (parseFloat(kho1) || 0) + (parseFloat(kho2) || 0) + (parseFloat(kho3) || 0);
        let soSanhKho = tongKhoSang.toString();
        
        // So sánh với khổ từ mã hàng
        if (khoFromMaVatTu && tongKhoSang > 0) {
            const khoFromMaVatTuNum = parseFloat(khoFromMaVatTu);
            const khoBangNhau = (khoFromMaVatTuNum === tongKhoSang);
            
            console.log('So sánh khổ:', {
                khoFromMaVatTu: khoFromMaVatTuNum,
                tongKhoSang,
                khoBangNhau
            });
            
            if (!khoBangNhau) {
                soSanhKho = soSanhKho + '!'; // Đánh dấu cần tô vàng
            }
        }

        updateFields.push('so_sanh_kho = ?');
        updateValues.push(soSanhKho);

        console.log('So sánh khổ kết quả:', soSanhKho);

        // Nếu không có trường nào cần cập nhật
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
        }

        // Thêm ID vào cuối mảng giá trị
        updateValues.push(id);

        // Xây dựng và thực thi truy vấn SQL
        const updateSQL = `UPDATE bao_cao_scl SET ${updateFields.join(', ')} WHERE id = ?`;

        console.log('SQL cập nhật:', updateSQL);
        console.log('Giá trị cập nhật:', updateValues);

        db.run(updateSQL, updateValues, function (err) {
            if (err) {
                console.error('Lỗi khi cập nhật dữ liệu formula cho báo cáo:', err.message);
                return res.status(500).json({ error: 'Lỗi khi cập nhật dữ liệu formula cho báo cáo' });
            }

            // Kiểm tra xem có bản ghi nào được cập nhật không
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Không tìm thấy báo cáo để cập nhật' });
            }

            console.log(`Đã cập nhật ${this.changes} bản ghi`);

            // Cập nhật số cuộn cho tất cả báo cáo có cùng WS sau khi cập nhật
            const newWorksheet = updateData.worksheet || currentReport.worksheet;
            if (newWorksheet) {
                // Đếm tổng số báo cáo có cùng WS
                db.get(`SELECT COUNT(*) as total FROM bao_cao_scl WHERE worksheet = ?`, 
                    [newWorksheet], (countErr, countResult) => {
                        if (countErr) {
                            console.error('Lỗi khi đếm số cuộn theo WS sau cập nhật:', countErr.message);
                        } else {
                            const totalReports = countResult.total || 1;
                            console.log(`Sau cập nhật: WS ${newWorksheet} có ${totalReports} báo cáo, cập nhật số cuộn`);
                            
                            // Cập nhật số cuộn cho tất cả báo cáo có cùng WS
                            db.run(`UPDATE bao_cao_scl SET so_cuon = ? WHERE worksheet = ?`,
                                [totalReports, newWorksheet], (updateErr) => {
                                    if (updateErr) {
                                        console.error('Lỗi khi cập nhật số cuộn theo WS sau cập nhật formula:', updateErr.message);
                                    } else {
                                        console.log(`Đã cập nhật số cuộn ${totalReports} cho tất cả báo cáo có WS ${newWorksheet} sau cập nhật formula`);
                                    }
                                });
                        }
                    });
            }

            res.json({
                success: true,
                id: id,
                changes: this.changes,
                message: 'Đã cập nhật dữ liệu formula cho báo cáo thành công',
                updated_data: {
                    kho: khoFromMaVatTu,
                    kho_1: kho1,
                    kho_2: kho2,
                    kho_3: kho3,
                    so_sanh_kho: soSanhKho
                }
            });
        });
    });
});


router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    // Tìm thông tin phiếu trước khi xóa
    db.get(`SELECT soPhieu, sttXuat, worksheet FROM Danhsach_PSC WHERE id = ?`, [id], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Lỗi khi tìm thông tin phiếu: ' + err.message });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Không tìm thấy phiếu sang cuộn' });
        }
        
        const wsValue = row.worksheet; // Lưu WS để cập nhật sau
        
        // Xóa các bản ghi
        db.run(`DELETE FROM Danhsach_PSC WHERE soPhieu = ? AND sttXuat = ?`, 
            [row.soPhieu, row.sttXuat], function(err) {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: 'Lỗi khi xóa phiếu sang cuộn: ' + err.message });
                }
                
                // SỬA: Cập nhật lại số cuộn cho các báo cáo còn lại có cùng WS
                if (wsValue) {
                    updateAllSoCuonForSameWS(wsValue, () => {
                        res.json({ success: true, changes: this.changes });
                    });
                } else {
                    res.json({ success: true, changes: this.changes });
                }
            });
    });
});


// ! DỪng máy
// API lấy danh sách báo cáo dừng máy
router.get('/dung-may/list', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    db.all(`
    SELECT dm.*, bcl.ca, bcl.worksheet, bcl.so_phieu, bcl.nguoi_thuc_hien
    FROM bao_cao_scl_dung_may dm
    LEFT JOIN bao_cao_scl bcl ON dm.bao_cao_id = bcl.id
    ORDER BY dm.created_at DESC
  `, [], (err, rows) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách báo cáo dừng máy:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách báo cáo dừng máy' });
        }

        res.json(rows || []);
    });
});

// API lấy chi tiết báo cáo dừng máy
router.get('/dung-may/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const { id } = req.params;

    db.get(`
    SELECT dm.*, bcl.ca, bcl.worksheet, bcl.so_phieu, bcl.nguoi_thuc_hien
    FROM bao_cao_scl_dung_may dm
    LEFT JOIN bao_cao_scl bcl ON dm.bao_cao_id = bcl.id
    WHERE dm.id = ?
  `, [id], (err, row) => {
        if (err) {
            console.error('Lỗi khi lấy chi tiết báo cáo dừng máy:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy chi tiết báo cáo dừng máy' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo dừng máy' });
        }

        res.json(row);
    });
});

// API xóa báo cáo dừng máy
router.delete('/dung-may/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const { id } = req.params;

    db.run(`DELETE FROM bao_cao_scl_dung_may WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Lỗi khi xóa báo cáo dừng máy:', err.message);
            return res.status(500).json({ error: 'Lỗi khi xóa báo cáo dừng máy' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo dừng máy để xóa' });
        }

        res.json({ success: true, message: 'Đã xóa báo cáo dừng máy thành công' });
    });
});

// API lưu báo cáo dừng máy độc lập
router.post('/dung-may/submit', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const reportData = req.body;
    if (!reportData) {
        return res.status(400).json({ error: 'Dữ liệu báo cáo không hợp lệ' });
    }

    console.log('Nhận dữ liệu báo cáo dừng máy từ client:', reportData);

    // Kiểm tra và sửa schema trước khi thêm mới
    checkAndFixSchema()
        .then(() => {
            // Lấy STT mới nhất cho báo cáo dừng máy
            db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_scl_dung_may`, [], (err, sttRow) => {
                if (err) {
                    console.error('Lỗi khi lấy STT mới nhất cho dừng máy:', err.message);
                    return res.status(500).json({ error: 'Lỗi khi lấy STT mới nhất cho dừng máy' });
                }

                // Tạo ID duy nhất cho báo cáo
                const reportId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                const stt = (sttRow?.max_stt || 0) + 1;

                // Tạo báo cáo SCL trống để làm báo cáo cha cho báo cáo dừng máy
                const sclId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

                db.run(`INSERT INTO bao_cao_scl (
                    id, stt, ca, ngay, nguoi_thuc_hien, dung_may
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        sclId,
                        stt,
                        reportData.ca || '',
                        new Date().toISOString().slice(0, 10),
                        reportData.nguoi_thuc_hien || '',
                        1
                    ], function (err) {
                        if (err) {
                            console.error('Lỗi khi tạo báo cáo SCL trống:', err.message);
                            return res.status(500).json({ error: 'Lỗi khi tạo báo cáo SCL trống' });
                        }

                        // Thực hiện lưu dữ liệu báo cáo dừng máy
                        db.run(`INSERT INTO bao_cao_scl_dung_may (
                        id, bao_cao_id, stt, ca, nguoi_thuc_hien, worksheet, so_phieu,
                        ly_do, ly_do_khac, thoi_gian_dung, thoi_gian_chay_lai, thoi_gian_dung_may, ghi_chu
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                reportId,
                                sclId, // Sử dụng ID của báo cáo SCL trống vừa tạo
                                stt,
                                reportData.ca || '',
                                reportData.nguoi_thuc_hien || '',
                                reportData.worksheet || '',
                                reportData.so_phieu || '',
                                reportData.ly_do || '',
                                reportData.ly_do_khac || '',
                                reportData.thoi_gian_dung || '',
                                reportData.thoi_gian_chay_lai || '',
                                reportData.thoi_gian_dung_may || '',
                                reportData.ghi_chu || ''
                            ], function (err) {
                                if (err) {
                                    console.error('Lỗi khi lưu báo cáo dừng máy:', err.message);
                                    // Xóa báo cáo SCL trống nếu không thể tạo báo cáo dừng máy
                                    db.run(`DELETE FROM bao_cao_scl WHERE id = ?`, [sclId]);
                                    return res.status(500).json({ error: 'Lỗi khi lưu báo cáo dừng máy: ' + err.message });
                                }

                                console.log('Đã lưu báo cáo dừng máy thành công với ID:', reportId);
                                res.json({
                                    success: true,
                                    id: reportId,
                                    message: 'Đã lưu báo cáo dừng máy thành công'
                                });
                            });
                    });
            });
        })
        .catch(err => {
            console.error('Lỗi khi kiểm tra và sửa schema:', err);
            return res.status(500).json({ error: 'Lỗi khi kiểm tra và sửa schema của cơ sở dữ liệu' });
        });
});



// Hàm kiểm tra và sửa schema của bảng bao_cao_scl_dung_may
function checkAndFixSchema() {
    return new Promise((resolve, reject) => {
        // Kiểm tra xem cột bao_cao_id có ràng buộc NOT NULL không
        db.get(`PRAGMA table_info(bao_cao_scl_dung_may)`, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            // Chuẩn bị tạo bảng tạm thời với schema mới nếu cần
            db.run('BEGIN TRANSACTION', err => {
                if (err) {
                    reject(err);
                    return;
                }

                // Tạo bảng tạm với bao_cao_id cho phép NULL
                db.run(`CREATE TABLE IF NOT EXISTS bao_cao_scl_dung_may_temp (
                    id TEXT PRIMARY KEY,
                    bao_cao_id TEXT,
                    stt INTEGER,
                    ca TEXT,
                    nguoi_thuc_hien TEXT,
                    worksheet TEXT,
                    so_phieu TEXT,
                    ly_do TEXT,
                    ly_do_khac TEXT,
                    thoi_gian_dung TEXT,
                    thoi_gian_chay_lai TEXT,
                    thoi_gian_dung_may TEXT,
                    ghi_chu TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (bao_cao_id) REFERENCES bao_cao_scl (id)
                )`, err => {
                    if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                    }

                    // Sao chép dữ liệu từ bảng cũ sang bảng tạm
                    db.run(`INSERT INTO bao_cao_scl_dung_may_temp
                            SELECT * FROM bao_cao_scl_dung_may`, err => {
                        if (err) {
                            db.run('ROLLBACK');
                            reject(err);
                            return;
                        }

                        // Xóa bảng cũ
                        db.run(`DROP TABLE bao_cao_scl_dung_may`, err => {
                            if (err) {
                                db.run('ROLLBACK');
                                reject(err);
                                return;
                            }

                            // Đổi tên bảng tạm thành bảng chính
                            db.run(`ALTER TABLE bao_cao_scl_dung_may_temp
                                    RENAME TO bao_cao_scl_dung_may`, err => {
                                if (err) {
                                    db.run('ROLLBACK');
                                    reject(err);
                                    return;
                                }

                                // Commit transaction
                                db.run('COMMIT', err => {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        reject(err);
                                    } else {
                                        console.log('Đã cập nhật schema của bảng bao_cao_scl_dung_may');
                                        resolve();
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}



// API tính lại nhập kho cho báo cáo đã có đủ dữ liệu
router.put('/recalculate-nhap-kho/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const { id } = req.params;

    console.log('🔍 API recalculate-nhap-kho được gọi với ID:', id);

    // Lấy thông tin báo cáo hiện tại
    db.get(`SELECT * FROM bao_cao_scl WHERE id = ?`, [id], (err, report) => {
        if (err) {
            console.error('Lỗi khi lấy thông tin báo cáo:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy thông tin báo cáo' });
        }

        if (!report) {
            console.log('❌ Không tìm thấy báo cáo với ID:', id);
            return res.status(404).json({ error: 'Không tìm thấy báo cáo' });
        }

        console.log('📋 Thông tin báo cáo hiện tại:', {
            id: report.id,
            ma_vat_tu: report.ma_vat_tu,
            dinh_luong: report.dinh_luong,
            kho: report.kho,
            trong_luong_nhan: report.trong_luong_nhan,
            so_met: report.so_met,
            kho_1: report.kho_1,
            kho_2: report.kho_2,
            kho_3: report.kho_3
        });

        // Kiểm tra xem báo cáo đã có đủ dữ liệu để tính nhập kho chưa
        const hasRequiredData = report.ma_vat_tu && report.dinh_luong && report.kho && 
                               report.trong_luong_nhan && report.so_met && 
                               (report.kho_1 || report.kho_2 || report.kho_3);

        if (!hasRequiredData) {
            console.log('⚠️ Chưa đủ dữ liệu để tính nhập kho');
            return res.json({ 
                success: false, 
                message: 'Báo cáo chưa có đủ dữ liệu để tính nhập kho',
                missing_fields: {
                    ma_vat_tu: !report.ma_vat_tu,
                    dinh_luong: !report.dinh_luong,
                    kho: !report.kho,
                    trong_luong_nhan: !report.trong_luong_nhan,
                    so_met: !report.so_met,
                    kho_123: !(report.kho_1 || report.kho_2 || report.kho_3)
                }
            });
        }

        console.log('✅ Đủ dữ liệu, bắt đầu tính toán nhập kho...');

        // Tính toán nhập kho và trả kho
        const trongLuongNhan = parseFloat(report.trong_luong_nhan) || 0;
        const pheLieuDauCuon = parseFloat(report.phe_lieu_dau_cuon) || 0;
        const pheLieuSanXuat = parseFloat(report.phe_lieu_san_xuat) || 0;
        const soMet = parseFloat(report.so_met) || 0;
        const dinhLuongValue = parseFloat(report.dinh_luong) || 0;
        const khoFromMaVatTuNum = parseFloat(report.kho) || 0;
        const suDung = report.hoan_thanh_cuon || '';

        // Xác định hoàn thành cuộn: 0 = Chạy hết cuộn, 1 = Chạy lỡ
        const hoanThanhCuon = suDung === "0" ? 0 : 1;

        let tlNhapKho1 = '', tlNhapKho2 = '', tlNhapKho3 = '', tlTraKho = '';
        

        // Tính nhập kho 1
const khoSang1 = parseFloat(report.kho_1) || 0;
if (khoSang1 > 0) {
    const trongLuongCanLai1 = parseFloat(report.trong_luong_can_lai_1) || null;
    if (trongLuongCanLai1 !== null) {
        tlNhapKho1 = excelRound(trongLuongCanLai1, 0);
    } else if (hoanThanhCuon === 1) { // HOÀN THÀNH CUỘN = 1 (CHẠY HẾT CUỘN)
        const phan1 = (khoSang1 * dinhLuongValue * soMet) / 1000000;
        const phan2 = (khoSang1 * (pheLieuDauCuon + pheLieuSanXuat)) / khoFromMaVatTuNum;
        tlNhapKho1 = excelRound(phan1 - phan2, 0);
    } else { // HOÀN THÀNH CUỘN = 0 (CHẠY LỠ)
        tlNhapKho1 = excelRound((khoSang1 * (trongLuongNhan - (pheLieuDauCuon + pheLieuSanXuat))) / khoFromMaVatTuNum, 0);
    }
}

// Tính nhập kho 2
const khoSang2 = parseFloat(report.kho_2) || 0;
if (khoSang2 > 0) {
    const trongLuongCanLai2 = parseFloat(report.trong_luong_can_lai_2) || null;
    if (trongLuongCanLai2 !== null) {
        tlNhapKho2 = excelRound(trongLuongCanLai2, 0);
    } else if (hoanThanhCuon === 1) { // HOÀN THÀNH CUỘN = 1 (CHẠY HẾT CUỘN)
        const phan1 = (khoSang2 * dinhLuongValue * soMet) / 1000000;
        const phan2 = (khoSang2 * (pheLieuDauCuon + pheLieuSanXuat)) / khoFromMaVatTuNum;
        tlNhapKho2 = excelRound(phan1 - phan2, 0);
    } else { // HOÀN THÀNH CUỘN = 0 (CHẠY LỠ)
        tlNhapKho2 = excelRound((khoSang2 * (trongLuongNhan - (pheLieuDauCuon + pheLieuSanXuat))) / khoFromMaVatTuNum, 0);
    }
}

// Tính nhập kho 3
const khoSang3 = parseFloat(report.kho_3) || 0;
if (khoSang3 > 0) {
    const trongLuongCanLai3 = parseFloat(report.trong_luong_can_lai_3) || null;
    if (trongLuongCanLai3 !== null) {
        tlNhapKho3 = excelRound(trongLuongCanLai3, 0);
    } else if (hoanThanhCuon === 1) { // HOÀN THÀNH CUỘN = 1 (CHẠY HẾT CUỘN)
        const phan1 = (khoSang3 * dinhLuongValue * soMet) / 1000000;
        const phan2 = (khoSang3 * (pheLieuDauCuon + pheLieuSanXuat)) / khoFromMaVatTuNum;
        tlNhapKho3 = excelRound(phan1 - phan2, 0);
    } else { // HOÀN THÀNH CUỘN = 0 (CHẠY LỢ)
        tlNhapKho3 = excelRound((khoSang3 * (trongLuongNhan - (pheLieuDauCuon + pheLieuSanXuat))) / khoFromMaVatTuNum, 0);
    }
}

// Tính trả kho
if (hoanThanhCuon === 1) { // CHẠY HẾT CUỘN = 1: tính trả kho
    const traKhoValue = trongLuongNhan - (parseFloat(tlNhapKho1) || 0) - (parseFloat(tlNhapKho2) || 0) - (parseFloat(tlNhapKho3) || 0) - pheLieuDauCuon - pheLieuSanXuat;
    tlTraKho = Math.abs(traKhoValue) < 0.01 ? '' : excelRound(traKhoValue, 0);
} else { // CHẠY LỢ = 0: để trống trả kho
    tlTraKho = '';
}


        console.log('🧮 Kết quả tính toán:', {
            tlNhapKho1, tlNhapKho2, tlNhapKho3, tlTraKho, hoanThanhCuon
        });

        // Cập nhật vào database
        const updateSQL = `UPDATE bao_cao_scl SET nhap_kho_1 = ?, nhap_kho_2 = ?, nhap_kho_3 = ?, tra_kho = ? WHERE id = ?`;

        db.run(updateSQL, [
            tlNhapKho1.toString(),
            tlNhapKho2.toString(), 
            tlNhapKho3.toString(),
            tlTraKho.toString(),
            id
        ], function (err) {
            if (err) {
                console.error('Lỗi khi cập nhật nhập kho:', err.message);
                return res.status(500).json({ error: 'Lỗi khi cập nhật nhập kho' });
            }

            console.log(`✅ Đã cập nhật nhập kho cho báo cáo ID ${id} thành công`);

            res.json({
                success: true,
                id: id,
                changes: this.changes,
                message: 'Đã tính lại nhập kho thành công',
                calculated_values: {
                    nhap_kho_1: tlNhapKho1.toString(),
                    nhap_kho_2: tlNhapKho2.toString(),
                    nhap_kho_3: tlNhapKho3.toString(),
                    tra_kho: tlTraKho.toString()
                }
            });
        });
    });
});





// API test format thời gian
router.get('/test-datetime', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // Lấy 1 bản ghi để test
    db.get(`SELECT id, thoi_gian_bat_dau, thoi_gian_ket_thuc FROM bao_cao_scl LIMIT 1`, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Lỗi database: ' + err.message });
        }
        
        if (!row) {
            return res.json({ message: 'Không có dữ liệu để test' });
        }
        
        // Hàm format thời gian giống như frontend
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
        
        res.json({
            id: row.id,
            original_bat_dau: row.thoi_gian_bat_dau,
            original_ket_thuc: row.thoi_gian_ket_thuc,
            formatted_bat_dau: formatDateTime(row.thoi_gian_bat_dau),
            formatted_ket_thuc: formatDateTime(row.thoi_gian_ket_thuc),
            test_iso: '2025-05-29T01:32:01.331Z',
            test_formatted: formatDateTime('2025-05-29T01:32:01.331Z')
        });
    });
});

// API cập nhật thời gian cho 1 báo cáo cụ thể (để test)
router.put('/update-datetime/:id', (req, res) => {
    const { id } = req.params;
    const { thoi_gian_bat_dau, thoi_gian_ket_thuc } = req.body;
    
    db.run(`UPDATE bao_cao_scl SET thoi_gian_bat_dau = ?, thoi_gian_ket_thuc = ? WHERE id = ?`,
        [thoi_gian_bat_dau, thoi_gian_ket_thuc, id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Lỗi cập nhật: ' + err.message });
            }
            
            res.json({
                success: true,
                changes: this.changes,
                message: 'Đã cập nhật thời gian thành công'
            });
        });
});



module.exports = router;