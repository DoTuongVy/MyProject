    const express = require('express');
const router = express.Router();
const { db } = require('../db');


function parseFormattedNumber(value) {
    if (!value) return '';
    return value.toString().replace(/,/g, '');
}

// Hàm làm tròn theo yêu cầu
function customRound(num, digits = 0) {
    if (isNaN(num)) return 0;
    
    console.log(`🔍 customRound input: ${num}, digits: ${digits}`);
    
    // Chuyển sang số nguyên để tránh lỗi floating point
    const multiplier = Math.pow(10, digits);
    console.log(`🔍 multiplier: ${multiplier}`);
    
    const shifted = num * multiplier;
    console.log(`🔍 shifted: ${shifted}`);
    
    let result;
    // Dùng Math.round thay vì Math.floor/Math.ceil phức tạp
    result = Math.round(shifted) / multiplier;
    
    console.log(`🔍 customRound result: ${result}`);
    return result;
}


// ===== THÊM MỚI: HÀM LÀM TRÒN LÊN CHO SỐ TẤM THAM CHIẾU =====
function roundUp(num) {
    if (isNaN(num)) return 0;
    
    const numValue = parseFloat(num);
    if (isNaN(numValue)) return 0;
    
    console.log(`🔍 roundUp input: ${numValue} -> result: ${Math.ceil(numValue)}`);
    return Math.ceil(numValue); // Làm tròn lên: 2.2 -> 3, 2.8 -> 3
}

// Hàm tính số tuần trong tháng
function calculateWeekInMonth(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    
    // Lấy ngày đầu tháng
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Lấy ngày của tháng hiện tại
    const dayOfMonth = date.getDate();
    
    // Tính tuần thứ mấy trong tháng (1-6)
    const weekOfMonth = Math.ceil(dayOfMonth / 7);
    
    console.log(`Tính tuần: Ngày ${dateString} -> Tuần ${weekOfMonth} trong tháng ${month + 1}/${year}`);
    
    return weekOfMonth;
}


// Hàm tính số lần chạy
async function calculateSoLanChay(ws, tuychonText, existingReports) {
    if (!ws || ws.trim() === '') return '';
    
    console.log(`🔍 Tính số lần chạy: WS=${ws}, Tùy chọn=${tuychonText}`);
    
    // **BƯỚC 1: THÊM ĐẦY ĐỦ MAP TÙY CHỌN**
    const tuychonValueMap = {
        '1. IN': '1',
        '2. IN + CÁN BÓNG': '2', 
        '3. CÁN BÓNG': '3',
        '4. IN DẶM': '4',
        '5. IN DẶM + CÁN BÓNG': '5',
        '6. CÁN BÓNG LẠI': '6',
        '7. IN DẶM (GIA CÔNG)': '7',
        '8. IN DẶM + CÁN BÓNG (GIA CÔNG)': '8',
        '9. CÁN BÓNG LẠI (GIA CÔNG)': '9'
    };
    
    const tuychonValue = tuychonValueMap[tuychonText];
    
    // **BƯỚC 2: TÙY CHỌN 4,5,6 → SỐ LẦN CHẠY = 0**
    if (['4', '5', '6'].includes(tuychonValue)) {
        console.log(`✅ Tùy chọn ${tuychonText} -> Số lần chạy = 0`);
        return 0;
    }
    
    // **BƯỚC 3: TÙY CHỌN 1,2,3,7,8,9 → ĐẾM SỐ LẦN CHẠY**
const samePairs = existingReports.filter(report => 
    report.ws === ws && report.tuy_chon === tuychonText
);
    
    const soLanChay = samePairs.length + 1;
    console.log(`✅ Tùy chọn ${tuychonText} -> Số lần chạy = ${soLanChay} (${samePairs.length} báo cáo trước + 1)`);
    
    return soLanChay;
}


// Hàm tính thành phẩm dựa trên ghép cặp tùy chọn
async function calculateThanhPham(currentReportId, wsValue, tuychonText, tongSoLuong) {
    try {
        console.log(`🔍 Backend calculateThanhPham: WS=${wsValue}, Tùy chọn=${tuychonText}, Tổng SL=${tongSoLuong}`);
        
        // ĐƠN GIẢN: Chỉ trả về tổng số lượng, để frontend tính toán chi tiết
        return parseFloat(tongSoLuong) || 0;
        
    } catch (error) {
        console.error('Lỗi khi tính thành phẩm:', error);
        return parseFloat(tongSoLuong) || 0;
    }
}



// Hàm cập nhật lại thành phẩm của các báo cáo liên quan khi có báo cáo mới
async function updateRelatedReportsThanhPham(wsValue, tuychonText, currentReportId) {
    try {
        console.log(`🔄 Backend update related reports: WS=${wsValue}, Tùy chọn=${tuychonText}`);
        
        // Chỉ cập nhật khi là waste processes
        const wasteProcesses = ['4. IN DẶM', '5. IN DẶM + CÁN BÓNG', '6. CÁN BÓNG LẠI', 
                               '7. IN DẶM (GIA CÔNG)', '8. IN DẶM + CÁN BÓNG (GIA CÔNG)', '9. CÁN BÓNG LẠI (GIA CÔNG)'];
        
        if (!wasteProcesses.includes(tuychonText)) {
            console.log('Không phải waste process, bỏ qua cập nhật');
            return;
        }
        
        // Map waste -> production để tìm báo cáo cần cập nhật
        const wasteToProductionMap = {
            '4. IN DẶM': '1. IN',
            '5. IN DẶM + CÁN BÓNG': '2. In + CÁN BÓNG',
            '6. CÁN BÓNG LẠI': '3. CÁN BÓNG',
            '7. IN DẶM (GIA CÔNG)': '1. IN',
            '8. IN DẶM + CÁN BÓNG (GIA CÔNG)': '2. IN + CÁN BÓNG', 
            '9. CÁN BÓNG LẠI (GIA CÔNG)': '3. CÁN BÓNG'
        };
        
        const targetProductionProcess = wasteToProductionMap[tuychonText];
        if (!targetProductionProcess) {
            console.log('Không tìm thấy production process tương ứng');
            return;
        }
        
        console.log(`Tìm kiếm báo cáo production: ${targetProductionProcess} để cập nhật`);
        
        // Tìm các báo cáo production cần cập nhật (cùng WS, cùng điều kiện)
        const productionReports = await new Promise((resolve, reject) => {
            db.all(`SELECT id, thanh_pham_in, tong_so_luong, mat_sau, phu_keo, so_pass_in, may FROM bao_cao_in 
                    WHERE ws = ? AND tuy_chon = ? 
                    AND thanh_pham_in IS NOT NULL 
                    AND thanh_pham_in != ''
                    AND thanh_pham_in != '0'
                    ORDER BY created_at ASC`, 
                [wsValue, targetProductionProcess], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        console.log(`Tìm thấy ${productionReports.length} báo cáo production cần cập nhật`);
        
        if (productionReports.length === 0) return;
        
        // Lấy tổng phế liệu mới nhất từ waste process
        const latestWasteTotal = await new Promise((resolve, reject) => {
            db.get(`SELECT tong_phe_lieu, tong_phe_lieu_trang FROM bao_cao_in 
                    WHERE ws = ? AND tuy_chon = ? 
                    AND tong_phe_lieu IS NOT NULL 
                    ORDER BY created_at DESC LIMIT 1`,
                [wsValue, tuychonText], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        const tongPheLieuMoiNhat = latestWasteTotal ? 
            (parseFloat(latestWasteTotal.tong_phe_lieu) || 0) + (parseFloat(latestWasteTotal.tong_phe_lieu_trang) || 0) : 0;
        
        console.log(`Tổng phế liệu mới nhất từ ${tuychonText}: ${tongPheLieuMoiNhat}`);
        
        // Cập nhật thành phẩm cho báo cáo production cuối cùng (lần chạy cuối)
        if (productionReports.length > 0) {
            const lastReport = productionReports[productionReports.length - 1];
            const tongSoLuong = parseFloat(lastReport.tong_so_luong) || 0;
            const newThanhPham = Math.max(0, tongSoLuong - tongPheLieuMoiNhat);
            
            await new Promise((resolve, reject) => {
                db.run(`UPDATE bao_cao_in SET thanh_pham = ? WHERE id = ?`,
                    [newThanhPham.toString(), lastReport.id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            console.log(`✅ Đã cập nhật thành phẩm cho báo cáo ID ${lastReport.id}: ${newThanhPham}`);
        }
        
    } catch (error) {
        console.error('Lỗi khi cập nhật báo cáo liên quan:', error);
    }
}



// // Tính thành phẩm cho một báo cáo cụ thể
// async function calculateThanhPhamForReport(reportId, wsValue, tuychonText) {
//     try {
//         // Lấy thông tin báo cáo
//         const report = await new Promise((resolve, reject) => {
//             db.get(`SELECT * FROM bao_cao_in WHERE id = ?`, [reportId], (err, row) => {
//                 if (err) reject(err);
//                 else resolve(row);
//             });
//         });
        
//         if (!report) return 0;
        
//         const tongSoLuong = parseFloat(report.tong_so_luong) || 0;
        
//         // Lấy tổng phế liệu mới nhất từ waste process tương ứng
//         const wasteMapping = {
//             '1. In': '4. IN DẶM',
//             '2. In + CÁN BÓNG': '5. IN DẶM + CÁN BÓNG',
//             '3. CÁN BÓNG': '6. CÁN BÓNG LẠI'
//         };
        
//         const correspondingWaste = wasteMapping[tuychonText];
//         if (!correspondingWaste) return tongSoLuong;
        
//         // Tìm báo cáo waste mới nhất
//         const latestWaste = await new Promise((resolve, reject) => {
//             db.get(`SELECT tong_phe_lieu FROM bao_cao_in 
//                     WHERE ws = ? AND tuy_chon = ? 
//                     AND mat_sau = ? AND phu_keo = ? AND so_pass_in = ? AND may = ?
//                     AND tong_phe_lieu IS NOT NULL 
//                     ORDER BY created_at DESC LIMIT 1`,
//                 [wsValue, correspondingWaste, report.mat_sau || 0, report.phu_keo || '', 
//                  report.so_pass_in || '', report.may || ''], (err, row) => {
//                 if (err) reject(err);
//                 else resolve(row);
//             });
//         });
        
//         if (latestWaste && latestWaste.tong_phe_lieu) {
//             const tongPheLieu = parseFloat(latestWaste.tong_phe_lieu) || 0;
//             return Math.max(0, tongSoLuong - tongPheLieu);
//         }
        
//         return tongSoLuong;
        
//     } catch (error) {
//         console.error('Lỗi khi tính thành phẩm cho báo cáo:', error);
//         return 0;
//     }
// }




// API cập nhật các báo cáo liên quan
router.post('/update-related-reports', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        const { ws, tuychonValue } = req.body;
        
        if (!ws || !tuychonValue) {
            return res.status(400).json({ error: 'Thiếu thông tin WS hoặc tùy chọn' });
        }
        
        // Map value -> text
        const valueToTextMap = {
            '4': '4. IN DẶM',
            '5': '5. IN DẶM + CÁN BÓNG',
            '6': '6. CÁN BÓNG LẠI',
            '7': '7. IN DẶM (GIA CÔNG)',
            '8': '8. IN DẶM + CÁN BÓNG (GIA CÔNG)',
            '9': '9. CÁN BÓNG LẠI (GIA CÔNG)'
        };
        
        const tuychonText = valueToTextMap[tuychonValue];
        if (!tuychonText) {
            return res.json({ success: true, message: 'Không cần cập nhật' });
        }
        
        // Gọi hàm cập nhật
        await updateRelatedReportsThanhPham(ws, tuychonText, null);
        
        res.json({ success: true, message: 'Đã cập nhật báo cáo liên quan' });
        
    } catch (error) {
        console.error('Lỗi API cập nhật báo cáo liên quan:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật báo cáo liên quan' });
    }
});




// Hàm tính tổng với cộng dồn theo điều kiện chung
async function calculateTongWithSum(fieldName, currentReportId, wsValue, tuychonText, currentReport) {
    try {
        console.log(`🔍 Backend tính tổng ${fieldName}: WS=${wsValue}, Tùy chọn=${tuychonText}`);
        
        if (!wsValue || !tuychonText || !currentReport) {
            return 0;
        }

        // Tìm tất cả báo cáo có cùng điều kiện (trừ báo cáo hiện tại)
        const matchingReports = await new Promise((resolve, reject) => {
            db.all(`SELECT ${fieldName}, thanh_pham_in, phe_lieu, phe_lieu_trang FROM bao_cao_in 
                    WHERE ws = ? AND tuy_chon = ? 
                    AND COALESCE(mat_sau, 0) = ? 
                    AND COALESCE(so_pass_in, '') = ? 
                    AND COALESCE(phu_keo, '') = ? 
                    AND id != ? 
                    AND ${fieldName} IS NOT NULL 
                    AND ${fieldName} != ''
                    ORDER BY created_at ASC`, 
                [
                    wsValue, 
                    tuychonText,
                    currentReport.mat_sau || 0,
                    currentReport.so_pass_in || '',
                    currentReport.phu_keo || '',
                    currentReportId
                ], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        // Tính tổng từ các báo cáo matching
        let tongCu = 0;
        if (matchingReports.length > 0) {
            tongCu = matchingReports.reduce((total, report) => {
                let value = 0;
                if (fieldName === 'thanh_pham_in') {
                    value = parseFloat(report.thanh_pham_in) || 0;
                } else if (fieldName === 'phe_lieu') {
                    value = parseFloat(report.phe_lieu) || 0;
                } else if (fieldName === 'phe_lieu_trang') {
                    value = parseFloat(report.phe_lieu_trang) || 0;
                }
                return total + value;
            }, 0);
        }

        console.log(`✅ Backend tổng ${fieldName} từ ${matchingReports.length} báo cáo: ${tongCu}`);
        return tongCu;

    } catch (error) {
        console.error(`Lỗi khi tính tổng ${fieldName}:`, error);
        return 0;
    }
}






// API lấy danh sách báo cáo In
router.get('/list', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const dateFilter = req.query.date;
    const excludeStopOnly = req.query.exclude_stop_only;
    let query = `SELECT * FROM bao_cao_in`;
    let params = [];
    let conditions = [];
    
    if (dateFilter) {
        conditions.push(`DATE(created_at) = ?`);
        params.push(dateFilter);
    }
    
    if (excludeStopOnly === 'true') {
        conditions.push(`(ws IS NOT NULL AND ws != '')`);
    }
    
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC, stt DESC`;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách báo cáo In:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách báo cáo In' });
        }
        res.json(rows || []);
    });
});

// API gửi báo cáo In hoàn chỉnh
router.post('/submit', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const reportData = req.body;
    if (!reportData) {
        return res.status(400).json({ error: 'Dữ liệu báo cáo không hợp lệ' });
    }

    try {
        const reportId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const batDau = reportData.batDau || {};
        const ketThuc = reportData.ketThuc || {};
        const nguoiDung = reportData.nguoiDung || {};
        const date = new Date().toISOString().slice(0, 10);

        // Tính ngày phụ dựa trên thời gian kết thúc
        let ngayPhu = date;
        if (ketThuc.thoiGianKetThuc) {
            try {
                const endTime = new Date(ketThuc.thoiGianKetThuc);
                const hours = endTime.getHours();
                const minutes = endTime.getMinutes();
                
                if (hours < 6 || (hours === 6 && minutes <= 10)) {
                    const ngayPhuDate = new Date(date);
                    ngayPhuDate.setDate(ngayPhuDate.getDate() - 1);
                    ngayPhu = ngayPhuDate.toISOString().slice(0, 10);
                } else {
                    ngayPhu = date;
                }
            } catch (error) {
                console.error('Lỗi khi tính ngày phụ:', error);
            }
        }

        // Lấy STT mới nhất
        const sttRow = await new Promise((resolve, reject) => {
            db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_in`, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        const stt = (sttRow?.max_stt || 0) + 1;

        // Lấy danh sách báo cáo hiện có để tính số lần chạy
        const existingReports = await new Promise((resolve, reject) => {
            db.all(`SELECT ws, tuy_chon, tong_phe_lieu FROM bao_cao_in WHERE ws IS NOT NULL AND ws != ''`, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        // Tính số lần chạy
        const soLanChay = await calculateSoLanChay(batDau.ws, batDau.tuychon, existingReports);

        // ✅ NHẬN DỮ LIỆU ĐÃ TÍNH TỪ FRONTEND
        const tongSoLuong = ketThuc.tongSoLuong || 0;
        const tongPheLieu = ketThuc.tongPheLieu || 0;
        const tongPheLieuTrang = ketThuc.tongPhelieuTrang || 0;
        const thanhPham = ketThuc.thanhPham || 0;

        console.log(`✅ Nhận dữ liệu từ frontend:`, {
            tongSoLuong,
            tongPheLieu,
            tongPheLieuTrang,
            thanhPham
        });

        // Lấy dữ liệu từ WS-Tổng
        let wsData = {};
        if (batDau.ws && batDau.ws.trim() !== '') {
            try {
                const wsRow = await new Promise((resolve, reject) => {
                    db.get(`SELECT * FROM ws_tong WHERE so_ws = ?`, [batDau.ws], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                
                if (wsRow) {
                    wsData = {
                        khachHang: wsRow.khach_hang || '',
                        maSP: wsRow.ma_sp || '',
                        slDonHang: wsRow.sl_dh || '',
                        soCon: wsRow.s_con || '',
                        soMau: wsRow.so_mau_in || '',
                        maGiay1: wsRow.loai_giay_1 || '',
                        maGiay2: wsRow.loai_giay_2 || '',
                        maGiay3: wsRow.loai_giay_3 || '',
                        kho: wsRow.kho_1 || '',
                        daiGiay: wsRow.chat_1 || '',
                        slGiayTheoWS: wsRow.sl_giay_can_cat || ''
                    };
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu WS-Tổng:', error);
            }
        }

        // Tính tuần trong tháng
        const tuan = calculateWeekInMonth(date);

        // Tính các chênh lệch
        const slGiayTheoWS = parseFloat(wsData.slGiayTheoWS || '0');
        const chenhLechTTWS = (tongSoLuong + tongPheLieu + tongPheLieuTrang) - slGiayTheoWS;

        // Xử lý số pass in
        let soPassIn = batDau.soPassIn || '';
        if (wsData.soMau) {
            const soDau = parseInt(wsData.soMau.split('-')[0] || '0');
            if (soDau <= 6) {
                soPassIn = 'IN 1 PASS';
            } else if (batDau.may === '2M') {
                soPassIn = 'IN 1 PASS';
            }
        }

        // Lưu vào database
        const insertSQL = `INSERT INTO bao_cao_in (
            id, stt, ngay, may, quan_doc, ca, truong_may, ws, so_lan_chay, ngay_phu,
            khach_hang, ma_sp, sl_don_hang, so_con, so_mau, ma_giay_1, ma_giay_2, ma_giay_3,
            kho, dai_giay, tuy_chon, mau_3_tone, sl_giay_tt_1, sl_giay_tt_2, sl_giay_tt_3,
            so_kem, mat_sau, phu_keo, phun_bot, thoi_gian_canh_may, thoi_gian_bat_dau,
            thoi_gian_ket_thuc, thanh_pham_in, phe_lieu, phe_lieu_trang, ghi_chu,
            tong_so_luong, tong_phe_lieu, tong_phe_lieu_trang, sl_giay_ream, tuan,
            gio_lam_viec, ma_ca, sl_giay_theo_ws, sl_cat, chenh_lech_tt_ws, chenh_lech_tt_scc,
            phu_may_1, phu_may_2, so_pass_in, thanh_pham, dung_may, nguoi_thuc_hien, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await new Promise((resolve, reject) => {
            db.run(insertSQL, [
                reportId, stt, date,
                batDau.may || '',
                batDau.quanDoc || '',
                batDau.ca || '',
                batDau.truongMay || '',
                batDau.ws || '',
                soLanChay,
                ngayPhu,
                wsData.khachHang,
                wsData.maSP,
                wsData.slDonHang,
                wsData.soCon,
                wsData.soMau,
                wsData.maGiay1,
                wsData.maGiay2,
                wsData.maGiay3,
                wsData.kho,
                wsData.daiGiay,
                batDau.tuychon || '',
                batDau.mau3tone || '',
                ketThuc.slGiayTT1 || '',
                ketThuc.slGiayTT2 || '',
                ketThuc.slGiayTT3 || '',
                parseInt(batDau.sokem || '0'),
                batDau.matsau || '',
                batDau.phukeo || '',
                parseInt(batDau.phunbot || '0'),
                ketThuc.canhmay || '',
                batDau.thoiGianBatDau || '',
                ketThuc.thoiGianKetThuc || '',
                ketThuc.thanhphamin || '',
                ketThuc.phelieu || '',
                ketThuc.phelieutrang || '',
                ketThuc.ghiChu || '',
                tongSoLuong.toString(), // ✅ Từ frontend
                tongPheLieu.toString(), // ✅ Từ frontend
                tongPheLieuTrang.toString(), // ✅ Từ frontend
                ketThuc.slGiayReam || '',
                tuan,
                batDau.gioLamViec || '',
                batDau.maCa || '',
                wsData.slGiayTheoWS,
                '', // sl_cat để trống
                chenhLechTTWS.toString(),
                '', // chenh_lech_tt_scc để trống
                batDau.phumay1 || '',
                batDau.phumay2 || '',
                soPassIn,
                thanhPham.toString(), // ✅ Từ frontend
                ketThuc.dungMay ? 1 : 0,
                batDau.nguoiThucHien || '',
                nguoiDung.id || ''
            ], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });

        // Xử lý báo cáo dừng máy nếu có
        if (reportData.dungMay && Array.isArray(reportData.dungMay)) {
            const stopReports = reportData.dungMay;
            const stopSttRow = await new Promise((resolve, reject) => {
                db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_in_dung_may`, [], (err, row) => {
                    if (err) {
                        console.warn('Lỗi khi lấy STT mới nhất cho dừng máy:', err.message);
                        resolve({ max_stt: 0 });
                    } else {
                        resolve(row);
                    }
                });
            });

            const baseStopStt = (stopSttRow?.max_stt || 0);

            const insertPromises = stopReports.map((stopReport, index) => {
                return new Promise((resolve, reject) => {
                    const stopId = Date.now().toString() + index;
                    const stopStt = baseStopStt + index + 1;

                    db.run(`INSERT INTO bao_cao_in_dung_may (
                        id, bao_cao_id, stt, ca, gio_lam_viec, ma_ca, truong_may, ws, may,
                        thoi_gian_dung, thoi_gian_chay_lai, thoi_gian_dung_may, ly_do,
                        ghi_chu, ngay_thang_nam, tuan, ngay
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            stopId, reportId, stopStt,
                            batDau.ca || '',
                            batDau.gioLamViec || '',
                            batDau.maCa || '',
                            batDau.truongMay || '',
                            batDau.ws || '',
                            batDau.may || '',
                            stopReport.thoiGianDung || '',
                            stopReport.thoiGianChayLai || '',
                            stopReport.thoiGianDungMay || '',
                            stopReport.lyDo || '',
                            stopReport.ghiChu || ketThuc.ghiChu || '',
                            date,
                            tuan,
                            date
                        ], function (err) {
                            if (err) {
                                console.error('Lỗi khi lưu lý do dừng máy:', err.message);
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                });
            });

            await Promise.all(insertPromises);
        }

        res.json({
            success: true,
            id: reportId,
            message: 'Đã lưu báo cáo In thành công',
            data: {
                so_lan_chay: soLanChay,
                ws_data: wsData,
                tuan: tuan,
                // ✅ Trả về dữ liệu đã tính
                calculations: {
                    tongSoLuong,
                    tongPheLieu,
                    tongPheLieuTrang,
                    thanhPham
                }
            }
        });

    } catch (error) {
        console.error('Lỗi khi gửi báo cáo In:', error);
        res.status(500).json({ 
            error: 'Lỗi khi gửi báo cáo In: ' + error.message
        });
    }
});

// API gửi báo cáo In phần bắt đầu
router.post('/submit-start', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const startData = req.body;
    if (!startData) {
        return res.status(400).json({ error: 'Dữ liệu báo cáo bắt đầu không hợp lệ' });
    }

    try {
        const reportId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const date = new Date().toISOString().slice(0, 10);

        // Lấy STT mới nhất
        const sttRow = await new Promise((resolve, reject) => {
            db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_in`, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        const stt = (sttRow?.max_stt || 0) + 1;

// Lấy danh sách báo cáo hiện có để tính số lần chạy
const existingReports = await new Promise((resolve, reject) => {
    db.all(`SELECT ws, tuy_chon, tong_phe_lieu FROM bao_cao_in WHERE ws IS NOT NULL AND ws != ''`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
    });
});

// Tính số lần chạy
const soLanChay = await calculateSoLanChay(startData.ws, startData.tuychon, existingReports);
// Tính thành phẩm (mặc định = 0 cho phần bắt đầu)
const thanhPham = 0;

        // Lấy dữ liệu từ WS-Tổng
        let wsData = {};
        if (startData.ws && startData.ws.trim() !== '') {
            try {
                const wsRow = await new Promise((resolve, reject) => {
                    db.get(`SELECT * FROM ws_tong WHERE so_ws = ?`, [startData.ws], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                
                if (wsRow) {
                    wsData = {
                        khachHang: wsRow.khach_hang || '',
                        maSP: wsRow.ma_sp || '',
                        slDonHang: wsRow.sl_dh || '',
                        soCon: wsRow.s_con || '',
                        soMau: wsRow.so_mau_in || '',
                        maGiay1: wsRow.loai_giay_1 || '',
                        maGiay2: wsRow.loai_giay_2 || '',
                        maGiay3: wsRow.loai_giay_3 || '',
                        kho: wsRow.kho_1 || '',
                        daiGiay: wsRow.chat_1 || '',
                        slGiayTheoWS: wsRow.sl_giay_can_cat || ''
                    };
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu WS-Tổng:', error);
            }
        }

        // Lưu vào database (chỉ phần bắt đầu)
        const insertSQL = `INSERT INTO bao_cao_in (
            id, stt, ngay, may, quan_doc, ca, truong_may, ws, so_lan_chay, khach_hang, ma_sp,
            sl_don_hang, so_con, so_mau, ma_giay_1, ma_giay_2, ma_giay_3, kho, dai_giay,
            tuy_chon, mau_3_tone, so_kem, mat_sau, phu_keo, phun_bot, gio_lam_viec,
            ma_ca, phu_may_1, phu_may_2, so_pass_in, thanh_pham, thoi_gian_bat_dau, nguoi_thuc_hien, is_started_only, sl_giay_theo_ws, thanh_pham
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await new Promise((resolve, reject) => {
            db.run(insertSQL, [
                reportId, stt, date,
                startData.may || '',
                startData.quanDoc || '',
                startData.ca || '',
                startData.truongMay || '',
                startData.ws || '',
                soLanChay || 0,
                wsData.khachHang,
                wsData.maSP,
                wsData.slDonHang,
                wsData.soCon,
                wsData.soMau,
                wsData.maGiay1,
                wsData.maGiay2,
                wsData.maGiay3,
                wsData.kho,
                wsData.daiGiay,
                startData.tuychon || '',
                startData.mau3tone || '',
                parseInt(startData.sokem || '0'),
                startData.matsau || '',
                startData.phukeo || '',
                parseInt(startData.phunbot || '0'),
                startData.gioLamViec || '',
                startData.maCa || '',
                startData.phumay1 || '',
                startData.phumay2 || '',
                startData.soPassIn || '',
                thanhPham,
                startData.thoiGianBatDau || '',
                startData.nguoiThucHien || '',
                1,  // Đánh dấu là chỉ mới bắt đầu
                wsData.slGiayTheoWS || '',
                thanhPham
            ], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });

        res.json({
            success: true,
            id: reportId,
            message: 'Đã lưu báo cáo In bắt đầu thành công'
        });

    } catch (error) {
        console.error('Lỗi khi gửi báo cáo In bắt đầu:', error);
        res.status(500).json({ 
            error: 'Lỗi khi gửi báo cáo In bắt đầu: ' + error.message
        });
    }
});



// API cập nhật báo cáo In phần bắt đầu
router.put('/update-start/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const { id } = req.params;
    const startData = req.body;
    
    if (!id || !startData) {
        return res.status(400).json({ error: 'Dữ liệu cập nhật không hợp lệ' });
    }
    
    try {
        // Lấy dữ liệu từ WS-Tổng nếu có thay đổi WS
        let wsData = {};
        if (startData.ws && startData.ws.trim() !== '') {
            try {
                const wsRow = await new Promise((resolve, reject) => {
                    db.get(`SELECT * FROM ws_tong WHERE so_ws = ?`, [startData.ws], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                
                if (wsRow) {
                    wsData = {
                        khachHang: wsRow.khach_hang || '',
                        maSP: wsRow.ma_sp || '',
                        slDonHang: wsRow.sl_dh || '',
                        soCon: wsRow.s_con || '',
                        soMau: wsRow.so_mau_in || '',
                        maGiay1: wsRow.loai_giay_1 || '',
                        maGiay2: wsRow.loai_giay_2 || '',
                        maGiay3: wsRow.loai_giay_3 || '',
                        kho: wsRow.kho_1 || '',
                        daiGiay: wsRow.chat_1 || ''
                    };
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu WS-Tổng:', error);
            }
        }

        // Cập nhật database
        const updateSQL = `UPDATE bao_cao_in SET 
    quan_doc = ?, ca = ?, truong_may = ?, ws = ?, khach_hang = ?, ma_sp = ?,
    sl_don_hang = ?, so_con = ?, so_mau = ?, ma_giay_1 = ?, ma_giay_2 = ?, ma_giay_3 = ?, 
    kho = ?, dai_giay = ?, tuy_chon = ?, mau_3_tone = ?, so_kem = ?, mat_sau = ?, 
    phu_keo = ?, phun_bot = ?, gio_lam_viec = ?, ma_ca = ?, phu_may_1 = ?, phu_may_2 = ?, so_pass_in = ?, thanh_pham = ?,
    thoi_gian_bat_dau = ?, nguoi_thuc_hien = ?, sl_giay_theo_ws = ?
    WHERE id = ?`;
        
        await new Promise((resolve, reject) => {
            db.run(updateSQL, [
                startData.quanDoc || '',
                startData.ca || '',
                startData.truongMay || '',
                startData.ws || '',
                wsData.khachHang || '',
                wsData.maSP || '',
                wsData.slDonHang || '',
                wsData.soCon || '',
                wsData.soMau || '',
                wsData.maGiay1 || '',
                wsData.maGiay2 || '',
                wsData.maGiay3 || '',
                wsData.kho || '',
                wsData.daiGiay || '',
                startData.tuychon || '',
                startData.mau3tone || '',
                parseInt(startData.sokem || '0'),
                startData.matsau || '',
                startData.phukeo || '',
                parseInt(startData.phunbot || '0'),
                startData.gioLamViec || '',
                startData.maCa || '',
                startData.phumay1 || '',
                startData.phumay2 || '',
                startData.soPassIn || '',
                startData.thoiGianBatDau || '',
                startData.nguoiThucHien || '',
                wsData.slGiayTheoWS || '', 
                id
            ], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        res.json({
            success: true,
            id: id,
            message: 'Đã cập nhật phần bắt đầu báo cáo In thành công'
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật phần bắt đầu báo cáo In:', error);
        res.status(500).json({ 
            error: 'Lỗi khi cập nhật phần bắt đầu báo cáo In: ' + error.message
        });
    }
});

// API cập nhật báo cáo In phần kết thúc
router.put('/update-end/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const { id } = req.params;
    const { ketThuc, dungMay } = req.body;
    
    if (!id || !ketThuc) {
        return res.status(400).json({ error: 'Dữ liệu cập nhật không hợp lệ' });
    }
    
    try {
        // Lấy báo cáo hiện tại
        const currentReport = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM bao_cao_in WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!currentReport) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo In' });
        }

        // Lấy danh sách báo cáo hiện có để tính số lần chạy
        const existingReports = await new Promise((resolve, reject) => {
            db.all(`SELECT ws, tuy_chon, tong_phe_lieu FROM bao_cao_in WHERE ws IS NOT NULL AND ws != '' AND id != ?`, [id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        // Tính số lần chạy
        const soLanChay = await calculateSoLanChay(currentReport.ws, currentReport.tuy_chon, existingReports);

        
        // Tính ngày phụ dựa trên thời gian kết thúc
        let ngayPhu = currentReport.ngay;
        if (ketThuc.thoiGianKetThuc) {
            try {
                const endTime = new Date(ketThuc.thoiGianKetThuc);
                const hours = endTime.getHours();
                const minutes = endTime.getMinutes();
                
                if (hours < 6 || (hours === 6 && minutes <= 10)) {
                    const ngayPhuDate = new Date(currentReport.ngay);
                    ngayPhuDate.setDate(ngayPhuDate.getDate() - 1);
                    ngayPhu = ngayPhuDate.toISOString().slice(0, 10);
                } else {
                    ngayPhu = currentReport.ngay;
                }
            } catch (error) {
                console.error('Lỗi khi tính ngày phụ:', error);
            }
        }


        // Tính tuần trong tháng
        const tuan = calculateWeekInMonth(ngayPhu);

        // ✅ NHẬN DỮ LIỆU ĐÃ TÍNH TỪ FRONTEND
        const thanhPhamIn = parseFloat(ketThuc.thanhphamin || '0');
        const tongSoLuong = ketThuc.tongSoLuong || 0;
        const tongPheLieu = ketThuc.tongPheLieu || 0;
        const tongPheLieuTrang = ketThuc.tongPhelieuTrang || 0;
        const thanhPham = ketThuc.thanhPham || 0;

        console.log(`✅ Backend update-end nhận dữ liệu từ frontend:`, {
            thanhPhamIn,
            tongSoLuong,
            tongPheLieu,
            tongPheLieuTrang,
            thanhPham
        });

        const slGiayTheoWS = parseFloat(currentReport.sl_giay_theo_ws || '0');
        const chenhLechTTWS = (tongSoLuong + tongPheLieu + tongPheLieuTrang) - slGiayTheoWS;

        // Cập nhật database
        const updateSQL = `UPDATE bao_cao_in SET 
            thoi_gian_ket_thuc = ?, thoi_gian_canh_may = ?, thanh_pham_in = ?, phe_lieu = ?, 
            phe_lieu_trang = ?, ghi_chu = ?, tong_so_luong = ?, tong_phe_lieu = ?, 
            tong_phe_lieu_trang = ?, sl_giay_ream = ?, tuan = ?, chenh_lech_tt_ws = ?,
            sl_giay_tt_1 = ?, sl_giay_tt_2 = ?, sl_giay_tt_3 = ?, dung_may = ?, is_started_only = ?, ngay_phu = ?, so_lan_chay = ?, thanh_pham = ? 
            WHERE id = ?`;
        
        await new Promise((resolve, reject) => {
            db.run(updateSQL, [
                ketThuc.thoiGianKetThuc || new Date().toISOString(),
                ketThuc.canhmay || '',
                thanhPhamIn.toString(),
                ketThuc.phelieu || '',
                ketThuc.phelieutrang || '',
                ketThuc.ghiChu || '',
                tongSoLuong.toString(), // ✅ Từ frontend
                tongPheLieu.toString(), // ✅ Từ frontend  
                tongPheLieuTrang.toString(), // ✅ Từ frontend
                ketThuc.slGiayReam || '',
                tuan,
                chenhLechTTWS.toString(),
                parseFormattedNumber(ketThuc.slGiayTT1) || '',
parseFormattedNumber(ketThuc.slGiayTT2) || '',
parseFormattedNumber(ketThuc.slGiayTT3) || '',
                ketThuc.dungMay ? 1 : 0,
                0,  // Đánh dấu đã hoàn thành
                ngayPhu,
                soLanChay || 0,
                thanhPham.toString(), // ✅ Từ frontend
                id
            ], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        // Xử lý báo cáo dừng máy nếu có
        if (dungMay && Array.isArray(dungMay)) {
            const stopSttRow = await new Promise((resolve, reject) => {
                db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_in_dung_may`, [], (err, row) => {
                    if (err) {
                        console.warn('Lỗi khi lấy STT mới nhất cho dừng máy:', err.message);
                        resolve({ max_stt: 0 });
                    } else {
                        resolve(row);
                    }
                });
            });

            const baseStopStt = (stopSttRow?.max_stt || 0);

            const insertPromises = dungMay.map((stopReport, index) => {
                return new Promise((resolve, reject) => {
                    const stopId = Date.now().toString() + index;
                    const stopStt = baseStopStt + index + 1;

                    db.run(`INSERT INTO bao_cao_in_dung_may (
                        id, bao_cao_id, stt, ca, gio_lam_viec, ma_ca, truong_may, ws, may,
                        thoi_gian_dung, thoi_gian_chay_lai, thoi_gian_dung_may, ly_do,
                        ghi_chu, ngay_thang_nam, tuan, ngay
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            stopId, id, stopStt,
                            currentReport.ca || '',
                            currentReport.gio_lam_viec || '',
                            currentReport.ma_ca || '',
                            currentReport.truong_may || '',
                            currentReport.ws || '',
                            currentReport.may || '',
                            stopReport.thoiGianDung || '',
                            stopReport.thoiGianChayLai || '',
                            stopReport.thoiGianDungMay || '',
                            stopReport.lyDo || '',
                            stopReport.ghiChu || ketThuc.ghiChu || '',
                            currentReport.ngay,
                            tuan,
                            currentReport.ngay
                        ], function (err) {
                            if (err) {
                                console.error('Lỗi khi lưu lý do dừng máy:', err.message);
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                });
            });

            await Promise.all(insertPromises);
        }

        // cập nhật báo cáo liên quan tự động
        await updateRelatedReportsThanhPham(currentReport.ws, currentReport.tuy_chon, id);

        res.json({
            success: true,
            id: id,
            message: 'Đã cập nhật phần kết thúc báo cáo In thành công',
            data: {
                calculations: {
                    thanhPhamIn,
                    tongSoLuong,
                    tongPheLieu,
                    tongPheLieuTrang,
                    thanhPham
                }
            }
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật phần kết thúc báo cáo In:', error);
        res.status(500).json({ 
            error: 'Lỗi khi cập nhật phần kết thúc báo cáo In: ' + error.message
        });
    }
});

// API lấy chi tiết báo cáo In
router.get('/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const { id } = req.params;

    db.get(`SELECT * FROM bao_cao_in WHERE id = ?`, [id], (err, report) => {
        if (err) {
            console.error('Lỗi khi lấy chi tiết báo cáo In:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy chi tiết báo cáo In' });
        }

        if (!report) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo In' });
        }

        // Lấy thông tin dừng máy nếu có
        db.all(`SELECT * FROM bao_cao_in_dung_may WHERE bao_cao_id = ?`, [id], (err, stopReports) => {
            if (err) {
                console.error('Lỗi khi lấy thông tin dừng máy:', err.message);
                return res.status(500).json({ error: 'Lỗi khi lấy thông tin dừng máy' });
            }

            report.dungMay = stopReports || [];
            res.json(report);
        });
    });
});

// API xóa báo cáo In
router.delete('/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const { id } = req.params;

    // Bắt đầu transaction
    db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
            console.error('Lỗi khi bắt đầu transaction:', err.message);
            return res.status(500).json({ error: 'Lỗi khi bắt đầu transaction' });
        }

        // Xóa các báo cáo dừng máy liên quan
        db.run(`DELETE FROM bao_cao_in_dung_may WHERE bao_cao_id = ?`, [id], (err) => {
            if (err) {
                console.error('Lỗi khi xóa báo cáo dừng máy:', err.message);
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Lỗi khi xóa báo cáo dừng máy' });
            }

            // Xóa báo cáo chính
            db.run(`DELETE FROM bao_cao_in WHERE id = ?`, [id], function (err) {
                if (err) {
                    console.error('Lỗi khi xóa báo cáo In:', err.message);
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Lỗi khi xóa báo cáo In' });
                }

                if (this.changes === 0) {
                    db.run('ROLLBACK');
                    return res.status(404).json({ error: 'Không tìm thấy báo cáo In để xóa' });
                }

                // Commit transaction
                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error('Lỗi khi commit transaction:', err.message);
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Lỗi khi commit transaction' });
                    }

                    res.json({
                        success: true,
                        message: 'Đã xóa báo cáo In thành công'
                    });
                });
            });
        });
    });
});


router.delete('/dung-may/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID báo cáo dừng máy không hợp lệ' });
    }

    db.run(`DELETE FROM bao_cao_in_dung_may WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Lỗi khi xóa báo cáo dừng máy:', err.message);
            return res.status(500).json({ error: 'Lỗi khi xóa báo cáo dừng máy' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo dừng máy để xóa' });
        }

        res.json({
            success: true,
            message: 'Đã xóa báo cáo dừng máy thành công'
        });
    });
});



// API lấy danh sách báo cáo dừng máy In
router.get('/dung-may/list', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const dateFilter = req.query.date;
    const machineFilter = req.query.machine;
    
    let query = `
        SELECT 
            dm.*,
            COALESCE(dm.ca, bci.ca) as ca,
            COALESCE(dm.gio_lam_viec, bci.gio_lam_viec) as gio_lam_viec,
            COALESCE(dm.ma_ca, bci.ma_ca) as ma_ca,
            COALESCE(dm.truong_may, bci.truong_may) as truong_may,
            COALESCE(dm.may, bci.may) as may,
            COALESCE(dm.ws, bci.ws) as ws,
            bci.so_lan_chay
        FROM bao_cao_in_dung_may dm
        LEFT JOIN bao_cao_in bci ON dm.bao_cao_id = bci.id
    `;
    
    let params = [];
    let conditions = [];
    
    if (dateFilter) {
        conditions.push(`DATE(dm.ngay) = ?`);
        params.push(dateFilter);
    }
    
    if (machineFilter) {
        conditions.push(`COALESCE(dm.may, bci.may) = ?`);
        params.push(machineFilter);
    }
    
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }
    
    query += ` ORDER BY dm.created_at DESC, dm.stt DESC`;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách báo cáo dừng máy:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách báo cáo dừng máy' });
        }
        
        // Xử lý dữ liệu trước khi trả về
        const processedRows = (rows || []).map(row => ({
            ...row,
            // Đảm bảo các trường quan trọng không null
            ca: row.ca || '',
            gio_lam_viec: row.gio_lam_viec || '',
            ma_ca: row.ma_ca || '',
            truong_may: row.truong_may || '',
            may: row.may || '',
            ws: row.ws || '',
            ly_do: row.ly_do || '',
            thoi_gian_dung_may: row.thoi_gian_dung_may || '0 phút',
            ghi_chu: row.ghi_chu || ''
        }));
        
        res.json(processedRows);
    });
});

// API lưu báo cáo dừng máy In độc lập
router.post('/dung-may/submit', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const reportData = req.body;
    if (!reportData) {
        return res.status(400).json({ error: 'Dữ liệu báo cáo không hợp lệ' });
    }

    console.log('📥 Nhận dữ liệu báo cáo dừng máy:', reportData);

    // Validate dữ liệu bắt buộc
    if (!reportData.ly_do || !reportData.thoi_gian_dung || !reportData.thoi_gian_chay_lai) {
        return res.status(400).json({ 
            error: 'Thiếu thông tin bắt buộc: lý do, thời gian dừng, thời gian chạy lại' 
        });
    }

    // Lấy STT mới nhất cho báo cáo dừng máy
    db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_in_dung_may`, [], (err, sttRow) => {
        if (err) {
            console.error('Lỗi khi lấy STT mới nhất cho dừng máy:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy STT mới nhất cho dừng máy' });
        }

        const reportId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const stt = (sttRow?.max_stt || 0) + 1;
        const date = new Date().toISOString().slice(0, 10);
        
        // Tính tuần trong tháng
        const tuan = calculateWeekInMonth(date);

        console.log('💾 Chuẩn bị lưu với STT:', stt, 'Tuần:', tuan);

        // Lưu vào database
        db.run(`INSERT INTO bao_cao_in_dung_may (
            id, bao_cao_id, stt, ca, gio_lam_viec, ma_ca, truong_may, may, ws,
            ly_do, thoi_gian_dung, thoi_gian_chay_lai, thoi_gian_dung_may, ghi_chu,
            ngay_thang_nam, tuan, ngay, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            reportId,
            null, // Không có báo cáo cha
            stt,
            reportData.ca || '',
            reportData.gio_lam_viec || '',
            reportData.ma_ca || '',
            reportData.truong_may || '',
            reportData.may || '',
            reportData.ws || '', // Có thể rỗng
            reportData.ly_do || '',
            reportData.thoi_gian_dung || '',
            reportData.thoi_gian_chay_lai || '',
            reportData.thoi_gian_dung_may || '0 phút',
            reportData.ghi_chu || '',
            date,
            tuan,
            date,
            new Date().toISOString()
        ], function (err) {
            if (err) {
                console.error('Lỗi khi lưu báo cáo dừng máy:', err.message);
                return res.status(500).json({ 
                    error: 'Lỗi khi lưu báo cáo dừng máy: ' + err.message 
                });
            }

            console.log('✅ Đã lưu báo cáo dừng máy thành công với ID:', reportId);

            res.json({
                success: true,
                id: reportId,
                stt: stt,
                message: 'Đã lưu báo cáo dừng máy thành công'
            });
        });
    });
});






module.exports = router;