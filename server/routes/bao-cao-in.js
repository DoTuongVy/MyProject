    const express = require('express');
const router = express.Router();
const { db } = require('../db');

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
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    
    // Lấy số tuần trong năm
    const getWeekNumber = (d) => {
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };
    
    const weekOfDate = getWeekNumber(date);
    const weekOfFirstDay = getWeekNumber(firstDayOfMonth);
    
    return weekOfDate - weekOfFirstDay + 1;
}


// Hàm tính số lần chạy
async function calculateSoLanChay(ws, tuychon, existingReports) {
    if (!ws || ws.trim() === '') return '';
    
    // Nếu chọn "In dặm" (4) hoặc "In dặm + Cán bóng" (5) thì số lần chạy là 0
    if (tuychon === '4' || tuychon === '5') {
        return 0;
    }
    
    // Đếm các báo cáo có cùng WS và tùy chọn (chuyển sang text để so sánh)
    const samePairs = existingReports.filter(report => 
        report.ws === ws && report.tuy_chon === tuychon
    );
    
    return samePairs.length + 1;
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
        let ngayPhu = currentReport.ngay;
        if (ketThuc.thoiGianKetThuc) {
            try {
                const endTime = new Date(ketThuc.thoiGianKetThuc);
                const hours = endTime.getHours();
                const minutes = endTime.getMinutes();
                
                // Nếu kết thúc từ 0h đến 6h10 thì ngày phụ = ngày - 1
                if (hours < 6 || (hours === 6 && minutes <= 10)) {
                    const ngayPhuDate = new Date(currentReport.ngay);
                    ngayPhuDate.setDate(ngayPhuDate.getDate() - 1);
                    ngayPhu = ngayPhuDate.toISOString().slice(0, 10);
                } else {
                    // Còn lại ngày phụ = ngày
                    ngayPhu = currentReport.ngay;
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
        // const existingReports = await new Promise((resolve, reject) => {
        //     db.all(`SELECT ws, tuy_chon FROM bao_cao_in WHERE ws IS NOT NULL`, [], (err, rows) => {
        //         if (err) reject(err);
        //         else resolve(rows || []);
        //     });
        // });


        // Tính số lần chạy
const soLanChay = await calculateSoLanChay(batDau.ws, batDau.tuychon, existingReports);

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
        const tongSoLuong = parseFloat(ketThuc.tongSoLuong || '0');
        const tongPheLieu = parseFloat(ketThuc.tongPheLieu || '0');
        const tongPhelieuTrang = parseFloat(ketThuc.tongPhelieuTrang || '0');
        const slGiayTheoWS = parseFloat(wsData.slGiayTheoWS || '0');
        
        const chenhLechTTWS = (tongSoLuong + tongPheLieu + tongPhelieuTrang) - slGiayTheoWS;

        // Xử lý số pass in
        let soPassIn = batDau.soPassIn || '';
        if (wsData.soMau) {
            const soDau = parseInt(wsData.soMau.split('-')[0] || '0');
            if (soDau <= 6) {
                soPassIn = 'IN 1 PASS';
            } else if (batDau.may === '2M') {
                soPassIn = 'IN 1 PASS';
            }
            // Nếu > 6 và không phải máy 2M thì để người dùng chọn
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
            phu_may_1, phu_may_2, so_pass_in, dung_may, nguoi_thuc_hien, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
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
                ketThuc.tongSoLuong || '',
                ketThuc.tongPheLieu || '',
                ketThuc.tongPhelieuTrang || '',
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
                tuan: tuan
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
    db.all(`SELECT ws, tuy_chon FROM bao_cao_in WHERE ws IS NOT NULL AND ws != ''`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
    });
});

// Tính số lần chạy
const soLanChay = await calculateSoLanChay(startData.ws, startData.tuychon, existingReports);

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
            ma_ca, phu_may_1, phu_may_2, so_pass_in, thoi_gian_bat_dau, nguoi_thuc_hien, is_started_only, sl_giay_theo_ws
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await new Promise((resolve, reject) => {
            db.run(insertSQL, [
                reportId, stt, date,
                startData.may || '',
                startData.quanDoc || '',
                startData.ca || '',
                startData.truongMay || '',
                startData.ws || '',
                soLanChay,
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
                startData.thoiGianBatDau || '',
                startData.nguoiThucHien || '',
                1,  // Đánh dấu là chỉ mới bắt đầu
                wsData.slGiayTheoWS || ''
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
    phu_keo = ?, phun_bot = ?, gio_lam_viec = ?, ma_ca = ?, phu_may_1 = ?, phu_may_2 = ?, so_pass_in = ?,
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
    db.all(`SELECT ws, tuy_chon FROM bao_cao_in WHERE ws IS NOT NULL AND ws != '' AND id != ?`, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
    });
});

// Tính số lần chạy
const soLanChay = await calculateSoLanChay(currentReport.ws, currentReport.tuy_chon, existingReports);

        // Tính tuần trong tháng
        const tuan = calculateWeekInMonth(currentReport.ngay);

        // Tính ngày phụ dựa trên thời gian kết thúc
let ngayPhu = currentReport.ngay;
if (ketThuc.thoiGianKetThuc) {
    try {
        const endTime = new Date(ketThuc.thoiGianKetThuc);
        const hours = endTime.getHours();
        const minutes = endTime.getMinutes();
        
        // Nếu kết thúc từ 0h đến 6h10 thì ngày phụ = ngày - 1
        if (hours < 6 || (hours === 6 && minutes <= 10)) {
            const ngayPhuDate = new Date(currentReport.ngay);
            ngayPhuDate.setDate(ngayPhuDate.getDate() - 1);
            ngayPhu = ngayPhuDate.toISOString().slice(0, 10);
        } else {
            // Còn lại ngày phụ = ngày
            ngayPhu = currentReport.ngay;
        }
    } catch (error) {
        console.error('Lỗi khi tính ngày phụ:', error);
    }
}

        // Tính các chênh lệch
        const tongSoLuong = parseFloat(ketThuc.tongSoLuong || '0');
        const tongPheLieu = parseFloat(ketThuc.tongPheLieu || '0');
        const tongPhelieuTrang = parseFloat(ketThuc.tongPhelieuTrang || '0');
        const slGiayTheoWS = parseFloat(currentReport.sl_giay_theo_ws || '0');
        
        const chenhLechTTWS = (tongSoLuong + tongPheLieu + tongPhelieuTrang) - slGiayTheoWS;

        // Cập nhật database
        const updateSQL = `UPDATE bao_cao_in SET 
            thoi_gian_ket_thuc = ?, thoi_gian_canh_may = ?, thanh_pham_in = ?, phe_lieu = ?, 
            phe_lieu_trang = ?, ghi_chu = ?, tong_so_luong = ?, tong_phe_lieu = ?, 
            tong_phe_lieu_trang = ?, sl_giay_ream = ?, tuan = ?, chenh_lech_tt_ws = ?,
            sl_giay_tt_1 = ?, sl_giay_tt_2 = ?, sl_giay_tt_3 = ?, dung_may = ?, is_started_only = ?, ngay_phu = ?, so_lan_chay = ?
            WHERE id = ?`;
        
        await new Promise((resolve, reject) => {
            db.run(updateSQL, [
                ketThuc.thoiGianKetThuc || new Date().toISOString(),
                ketThuc.canhmay || '',
                ketThuc.thanhphamin || '',
                ketThuc.phelieu || '',
                ketThuc.phelieutrang || '',
                ketThuc.ghiChu || '',
                ketThuc.tongSoLuong || '',
                ketThuc.tongPheLieu || '',
                ketThuc.tongPhelieuTrang || '',
                ketThuc.slGiayReam || '',
                tuan,
                chenhLechTTWS.toString(),
                ketThuc.slGiayTT1 || '',
                ketThuc.slGiayTT2 || '',
                ketThuc.slGiayTT3 || '',
                ketThuc.dungMay ? 1 : 0,
                0,  // Đánh dấu đã hoàn thành
                ngayPhu,
                soLanChay,
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

        res.json({
            success: true,
            id: id,
            message: 'Đã cập nhật phần kết thúc báo cáo In thành công'
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

// API lấy danh sách báo cáo dừng máy In
router.get('/dung-may/list', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    db.all(`
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
        ORDER BY dm.created_at DESC
    `, [], (err, rows) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách báo cáo dừng máy In:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách báo cáo dừng máy In' });
        }

        res.json(rows || []);
    });
});

// API lưu báo cáo dừng máy In độc lập
router.post('/dung-may/submit', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const reportData = req.body;
    if (!reportData) {
        return res.status(400).json({ error: 'Dữ liệu báo cáo không hợp lệ' });
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
        const tuan = calculateWeekInMonth(date);

        // Tạo báo cáo In trống để làm báo cáo cha
        const inId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

        db.run(`INSERT INTO bao_cao_in (
            id, stt, ca, gio_lam_viec, ma_ca, ngay, may, truong_may, dung_may
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                inId, stt,
                reportData.ca || '',
                reportData.gio_lam_viec || '',
                reportData.ma_ca || '',
                date,
                reportData.may || '',
                reportData.truong_may || '',
                1
            ], function (err) {
                if (err) {
                    console.error('Lỗi khi tạo báo cáo In trống:', err.message);
                    return res.status(500).json({ error: 'Lỗi khi tạo báo cáo In trống' });
                }
        
                // Lưu báo cáo dừng máy
                db.run(`INSERT INTO bao_cao_in_dung_may (
                    id, bao_cao_id, stt, ca, gio_lam_viec, ma_ca, truong_may, may, ws,
                    ly_do, thoi_gian_dung, thoi_gian_chay_lai, thoi_gian_dung_may, ghi_chu,
                    ngay_thang_nam, tuan, ngay
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        reportId, inId, stt,
                        reportData.ca || '',
                        reportData.gio_lam_viec || '',
                        reportData.ma_ca || '',
                        reportData.truong_may || '',
                        reportData.may || '',
                        reportData.ws || '',
                        reportData.ly_do || '',
                        reportData.thoi_gian_dung || '',
                        reportData.thoi_gian_chay_lai || '',
                        reportData.thoi_gian_dung_may || '',
                        reportData.ghi_chu || '',
                        date,
                        tuan,
                        date
                    ], function (err) {
                        if (err) {
                            console.error('Lỗi khi lưu báo cáo dừng máy In:', err.message);
                            db.run(`DELETE FROM bao_cao_in WHERE id = ?`, [inId]);
                            return res.status(500).json({ error: 'Lỗi khi lưu báo cáo dừng máy In: ' + err.message });
                        }

                        res.json({
                            success: true,
                            id: reportId,
                            message: 'Đã lưu báo cáo dừng máy In thành công'
                        });
                    });
            });
    });
});

module.exports = router;