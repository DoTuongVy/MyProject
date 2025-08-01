const express = require('express');
const router = express.Router();
const { db } = require('../db');

// ====================================================================================================================================
// API BIỂU ĐỒ CHO BÁO CÁO IN
// ====================================================================================================================================

// API lấy dữ liệu biểu đồ báo cáo In
router.get('/in/chart-data', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        const { fromDate, toDate, ws, maca, may, tuan } = req.query;
        
        // Xây dựng điều kiện WHERE
        let whereConditions = [];
        let params = [];
        
        if (fromDate && toDate) {
            whereConditions.push(`DATE(ngay_phu) BETWEEN ? AND ?`);
            params.push(fromDate, toDate);
        }
        
        if (ws) {
            whereConditions.push(`ws = ?`);
            params.push(ws);
        }
        
        if (maca) {
            whereConditions.push(`ma_ca = ?`);
            params.push(maca);
        }
        
        if (may) {
            whereConditions.push(`may = ?`);
            params.push(may);
        }
        
        if (tuan) {
            whereConditions.push(`tuan = ?`);
            params.push(parseInt(tuan));
        }
        
        // Chỉ lấy báo cáo có dữ liệu thực tế (không phải chỉ bắt đầu)
        whereConditions.push(`is_started_only = 0`);
        whereConditions.push(`thanh_pham_in IS NOT NULL AND thanh_pham_in != ''`);
        
        const whereClause = whereConditions.length > 0 ? 
            'WHERE ' + whereConditions.join(' AND ') : '';
        
        // Lấy dữ liệu báo cáo In
        const reports = await new Promise((resolve, reject) => {
            db.all(`SELECT 
    thanh_pham_in, phe_lieu, phe_lieu_trang, thoi_gian_canh_may,
    thoi_gian_bat_dau, thoi_gian_ket_thuc, khach_hang, ma_sp, id, ws, ma_ca, may, stt,
    sl_don_hang, so_mau, so_con, ngay_phu, truong_may, tong_so_luong, thanh_pham, tuy_chon
FROM bao_cao_in ${whereClause}
ORDER BY stt DESC`,
                params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        if (reports.length === 0) {
            return res.json({
                totalPaper: 0,
                totalWaste: 0,
                runTime: 0,
                setupTime: 0,
                stopTime: 0,
                customer: '',
                product: '',
                reportCount: 0,
                message: 'Không có dữ liệu phù hợp với điều kiện lọc'
            });
        }
        

        


        // Lấy thông tin dừng máy cho từng báo cáo
for (let report of reports) {
    const stopData = await new Promise((resolve, reject) => {
        db.all(`SELECT ly_do, thoi_gian_dung_may 
                FROM bao_cao_in_dung_may 
                WHERE bao_cao_id = ?`, [report.id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
    
    // Tính tổng thời gian dừng máy cho báo cáo này
    let totalStopTime = 0;
    stopData.forEach(stop => {
        const duration = stop.thoi_gian_dung_may || '';
        if (duration.includes('giờ') || duration.includes('phút')) {
            const hours = (duration.match(/(\d+)\s*giờ/) || [0, 0])[1];
            const minutes = (duration.match(/(\d+)\s*phút/) || [0, 0])[1];
            totalStopTime += parseInt(hours) * 60 + parseInt(minutes);
        }
    });
    
    report.stopTime = totalStopTime;
}


        
// Lấy dữ liệu dừng máy với lý do cụ thể
const stopReports = await new Promise((resolve, reject) => {
    if (reports.length === 0) {
        resolve([]);
        return;
    }
    
    // Xây dựng điều kiện WHERE tương tự như query chính NHƯNG dùng ngày phụ
    let stopWhereConditions = [];
    let stopParams = [];
    
    if (fromDate && toDate) {
        stopWhereConditions.push(`DATE(b.ngay_phu) BETWEEN ? AND ?`);
        stopParams.push(fromDate, toDate);
    }
    
    if (ws) {
        stopWhereConditions.push(`b.ws = ?`);
        stopParams.push(ws);
    }
    
    if (maca) {
        stopWhereConditions.push(`b.ma_ca = ?`);
        stopParams.push(maca);
    }
    
    if (may) {
        stopWhereConditions.push(`b.may = ?`);
        stopParams.push(may);
    }
    
    if (tuan) {
        stopWhereConditions.push(`b.tuan = ?`);
        stopParams.push(parseInt(tuan));
    }
    
    stopWhereConditions.push(`b.is_started_only = 0`);
    stopWhereConditions.push(`b.thanh_pham_in IS NOT NULL AND b.thanh_pham_in != ''`);
    
    const stopWhereClause = stopWhereConditions.length > 0 ? 
        'WHERE ' + stopWhereConditions.join(' AND ') : '';
    
    db.all(`SELECT s.ly_do, s.thoi_gian_dung_may, s.thoi_gian_dung, s.thoi_gian_chay_lai, b.ws
            FROM bao_cao_in_dung_may s
            JOIN bao_cao_in b ON s.bao_cao_id = b.id
            ${stopWhereClause}`, 
            stopParams, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
    });
});

// Thêm debug này
console.log('📊 Report IDs:', reports.map(r => r.id));
console.log('📊 Stop reports từ database:', stopReports);
        
        // Tính toán dữ liệu
        const totalPaper = reports.reduce((sum, r) => sum + (parseFloat(r.thanh_pham_in) || 0), 0);
        const totalWaste = reports.reduce((sum, r) => 
            sum + (parseFloat(r.phe_lieu) || 0) + (parseFloat(r.phe_lieu_trang) || 0), 0);
        
        // Tính thời gian setup (canh máy)
        let setupTime = reports.reduce((sum, r) => sum + (parseFloat(r.thoi_gian_canh_may) || 0), 0);
        
// Tính tổng thời gian dừng máy - chỉ lấy của các WS được hiển thị
let stopTime = 0;
const validWS = new Set(reports.map(r => r.ws)); // Lấy danh sách WS được hiển thị

console.log('📊 Valid WS for stop time:', Array.from(validWS));
console.log('📊 Stop reports raw:', stopReports.length);

// Cách 1: Lấy từ cột thoi_gian_dung_may (text)
stopReports.forEach(stop => {
    // Chỉ tính nếu WS này có trong danh sách báo cáo được hiển thị
    if (validWS.has(stop.ws)) {
        const duration = stop.thoi_gian_dung_may || '';
        if (duration.includes('giờ') || duration.includes('phút')) {
            const hours = (duration.match(/(\d+)\s*giờ/) || [0, 0])[1];
            const minutes = (duration.match(/(\d+)\s*phút/) || [0, 0])[1];
            stopTime += parseInt(hours) * 60 + parseInt(minutes);
            console.log(`📊 Cộng thời gian dừng máy WS ${stop.ws}: ${duration}`);
        }
    } else {
        console.log(`📊 Bỏ qua WS ${stop.ws} (không trong danh sách hiển thị)`);
    }
});

// Cách 2: Nếu không có dữ liệu text thì tính theo công thức
if (stopTime === 0 && stopReports.length > 0) {
    stopReports.forEach(stop => {
        if (stop.thoi_gian_chay_lai && stop.thoi_gian_dung) {
            const chayLai = new Date(stop.thoi_gian_chay_lai);
            const dung = new Date(stop.thoi_gian_dung);
            const diffMinutes = (chayLai - dung) / (1000 * 60);
            if (diffMinutes > 0) {
                stopTime += diffMinutes;
            }
        }
    });
}



// Tạo mảng stopReasons - chỉ lấy của các WS được hiển thị
const stopReasonsRaw = [];
stopReports.forEach(stop => {
    // Chỉ tính nếu WS này có trong danh sách báo cáo được hiển thị
    if (validWS.has(stop.ws)) {
        const duration = stop.thoi_gian_dung_may || '';
        const reason = stop.ly_do || 'Không rõ lý do';
        
        if (duration.includes('giờ') || duration.includes('phút')) {
            const hours = (duration.match(/(\d+)\s*giờ/) || [0, 0])[1];
            const minutes = (duration.match(/(\d+)\s*phút/) || [0, 0])[1];
            const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
            if (totalMinutes > 0) {
                stopReasonsRaw.push({
                    reason: reason,
                    duration: totalMinutes
                });
            }
        }
    }
});


// Hợp nhất các lý do giống nhau
const stopReasonsMap = {};
stopReasonsRaw.forEach(item => {
    if (stopReasonsMap[item.reason]) {
        stopReasonsMap[item.reason] += item.duration;
    } else {
        stopReasonsMap[item.reason] = item.duration;
    }
});

// Chuyển đổi thành mảng
const stopReasons = Object.keys(stopReasonsMap).map(reason => ({
    reason: reason,
    duration: stopReasonsMap[reason]
}));

console.log('📊 Final stopReasons:', stopReasons);

        
        // Tính tổng thời gian làm việc (kết thúc - bắt đầu)
let totalWorkTime = 0;
reports.forEach(r => {
    if (r.thoi_gian_bat_dau && r.thoi_gian_ket_thuc) {
        const start = new Date(r.thoi_gian_bat_dau);
        const end = new Date(r.thoi_gian_ket_thuc);
        
        let diffSeconds = (end - start) / 1000; // giây
// Nếu diff âm, có thể là ca đêm - cộng thêm 24 giờ
if (diffSeconds < 0) {
    diffSeconds += 24 * 60 * 60; // cộng 24 giờ = 86400 giây
}
let diff = diffSeconds / 60; // chuyển sang phút nhưng giữ số thập phân
        
        totalWorkTime += diff;
    }
});

// Tính thời gian chạy máy = (Tg kết thúc - thời gian bắt đầu - tg canh máy - thời gian dừng máy)
const runTime = Math.max(0, totalWorkTime - setupTime - stopTime);
        
        // Lấy thông tin khách hàng và sản phẩm (ưu tiên từ WS được tìm kiếm)
        let customer = '';
        let product = '';
        
        if (ws) {
            // Nếu tìm theo WS cụ thể, lấy thông tin từ báo cáo đó
            const wsReport = reports.find(r => r.ws === ws) || reports[0];
            customer = wsReport.khach_hang || '';
            product = wsReport.ma_sp || '';
        } else {
            // Nếu không tìm theo WS, lấy từ báo cáo mới nhất
            const firstReport = reports[0] || {};
            customer = firstReport.khach_hang || '';
            product = firstReport.ma_sp || '';
        }
        
        // Group dữ liệu theo mã ca
const shiftGroups = {};
reports.forEach(r => {
    const shift = r.ma_ca || 'Unknown';
    if (!shiftGroups[shift]) {
        shiftGroups[shift] = { shift, paper: 0, waste: 0 };
    }
    shiftGroups[shift].paper += parseFloat(r.thanh_pham_in) || 0;
    shiftGroups[shift].waste += (parseFloat(r.phe_lieu) || 0) + (parseFloat(r.phe_lieu_trang) || 0);
});

const shiftData = Object.values(shiftGroups);

const chartData = {
    totalPaper: totalPaper,
    totalWaste: totalWaste,
    shiftData: shiftData,
    timeData: {
        totalTime: totalWorkTime,
        setupTime: setupTime,
        otherTime: stopTime
    },
    stopReasons: stopReasons,
    customer: customer,
    product: product,
    reportCount: reports.length
};


// Trong phần xử lý detail=true, wrap code trong try-catch:
if (req.query.detail === 'true') {
    try {
        // Lấy thông tin dừng máy cho từng báo cáo
        for (let report of reports) {
            try {
                const stopData = await new Promise((resolve, reject) => {
                    db.all(`SELECT thoi_gian_dung_may 
                            FROM bao_cao_in_dung_may 
                            WHERE bao_cao_id = ?`, [report.id], (err, rows) => {
                        if (err) {
                            console.error('Lỗi query dừng máy:', err);
                            reject(err);
                        } else {
                            resolve(rows || []);
                        }
                    });
                });
                
                // Cộng tất cả thời gian dừng máy của báo cáo này
                let totalStopTime = 0;
                stopData.forEach(stop => {
                    const duration = stop.thoi_gian_dung_may || '';
                    if (duration.includes('giờ') || duration.includes('phút')) {
                        const hours = (duration.match(/(\d+)\s*giờ/) || [0, 0])[1];
                        const minutes = (duration.match(/(\d+)\s*phút/) || [0, 0])[1];
                        totalStopTime += parseInt(hours) * 60 + parseInt(minutes);
                    }
                });
                
                // Gán thời gian dừng máy vào báo cáo
                report.stopTime = totalStopTime;
                
            } catch (stopError) {
                console.error('Lỗi khi lấy dữ liệu dừng máy cho báo cáo', report.id, ':', stopError);
                // Nếu lỗi, gán stopTime = 0
                report.stopTime = 0;
            }
        }
        
        chartData.reports = reports;
        
    } catch (detailError) {
        console.error('Lỗi khi xử lý detail data:', detailError);
        // Nếu lỗi, vẫn trả về dữ liệu cơ bản
        chartData.reports = reports.map(r => ({...r, stopTime: 0}));
    }
}
        
        console.log('Dữ liệu biểu đồ In:', chartData);
        res.json(chartData);
        
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu biểu đồ In:', error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu biểu đồ In: ' + error.message });
    }
});







router.get('/in/yearly-data', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        const { year } = req.query;
        
        if (!year) {
            return res.status(400).json({ error: 'Thiếu tham số năm' });
        }
        
        // Lấy dữ liệu theo năm, group theo máy và tháng
        const yearlyData = await new Promise((resolve, reject) => {
            db.all(`SELECT 
                strftime('%m', created_at) as month,
                may,
                SUM(CAST(thanh_pham_in as REAL)) as total_paper,
                SUM(CAST(phe_lieu as REAL) + CAST(phe_lieu_trang as REAL)) as total_waste
                FROM bao_cao_in 
                WHERE strftime('%Y', created_at) = ? 
                AND is_started_only = 0
                AND thanh_pham_in IS NOT NULL AND thanh_pham_in != ''
                AND may IS NOT NULL AND may != ''
                GROUP BY strftime('%m', created_at), may
                ORDER BY may, month`, 
                [year], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Xử lý dữ liệu thành format mong muốn
const result = {};

// Lấy danh sách máy từ dữ liệu thực tế
const machines = [...new Set(yearlyData.map(row => row.may))].filter(m => m).sort();

// Khởi tạo dữ liệu cho tất cả máy
machines.forEach(machine => {
    result[machine] = {};
    for (let month = 1; month <= 12; month++) {
        const monthKey = `T${month}`;
        result[machine][monthKey] = {
            paper: 0,
            waste: 0
        };
    }
});

// Điền dữ liệu thực tế
yearlyData.forEach(row => {
    const month = parseInt(row.month);
    const machine = row.may;
    const monthKey = `T${month}`;
    
    if (result[machine] && result[machine][monthKey]) {
        result[machine][monthKey].paper += row.total_paper || 0;
        result[machine][monthKey].waste += row.total_waste || 0;
    }
});
        
        console.log('Dữ liệu biểu đồ năm:', result);
        res.json(result);
        
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu theo năm:', error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu theo năm: ' + error.message });
    }
});

// ====================================================================================================================================
// API BIỂU ĐỒ CHO BÁO CÁO GMC
// ====================================================================================================================================

// API lấy dữ liệu biểu đồ báo cáo GMC
router.get('/gmc/chart-data', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        const { fromDate, toDate, ws, ca, may, tuan } = req.query;
        
        // Xây dựng điều kiện WHERE
        let whereConditions = [];
        let params = [];
        
        if (fromDate && toDate) {
            whereConditions.push(`DATE(created_at) BETWEEN ? AND ?`);
            params.push(fromDate, toDate);
        }
        
        if (ws) {
            whereConditions.push(`so_ws = ?`);
            params.push(ws);
        }
        
        if (ca) {
            whereConditions.push(`ca = ?`);
            params.push(ca);
        }
        
        if (may) {
            whereConditions.push(`may = ?`);
            params.push(may);
        }
        
        if (tuan) {
            whereConditions.push(`tuan = ?`);
            params.push(parseInt(tuan));
        }
        
        // Chỉ lấy báo cáo có dữ liệu thực tế
        whereConditions.push(`is_started_only = 0`);
        whereConditions.push(`so_tam_cat_duoc IS NOT NULL AND so_tam_cat_duoc != ''`);
        
        const whereClause = whereConditions.length > 0 ? 
            'WHERE ' + whereConditions.join(' AND ') : '';
        
        // Lấy dữ liệu báo cáo GMC
        const reports = await new Promise((resolve, reject) => {
            db.all(`SELECT 
                so_tam_cat_duoc, loi_kg, dau_cuon_kg, rach_mop_kg, phe_lieu_san_xuat_kg,
                thoi_gian_bat_dau, thoi_gian_ket_thuc, thoi_gian_chuyen_doi_pallet, thoi_gian_khac,
                khach_hang, ma_giay, id, so_ws
                FROM bao_cao_gmc ${whereClause}
                ORDER BY created_at DESC`, 
                params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        if (reports.length === 0) {
            return res.json({
                totalProduct: 0,
                totalWaste: 0,
                runTime: 0,
                setupTime: 0,
                stopTime: 0,
                customer: '',
                product: '',
                reportCount: 0,
                message: 'Không có dữ liệu phù hợp với điều kiện lọc'
            });
        }
        
        // Lấy dữ liệu dừng máy GMC
        const stopReports = await new Promise((resolve, reject) => {
            const reportIds = reports.map(r => r.id);
            if (reportIds.length === 0) {
                resolve([]);
                return;
            }
            
            const placeholders = reportIds.map(() => '?').join(',');
            db.all(`SELECT thoi_gian_dung_may FROM bao_cao_gmc_dung_may 
                    WHERE bao_cao_id IN (${placeholders})`, 
                    reportIds, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Tính toán dữ liệu GMC
        const totalProduct = reports.reduce((sum, r) => sum + (parseFloat(r.so_tam_cat_duoc) || 0), 0);
        const totalWaste = reports.reduce((sum, r) => 
            sum + (parseFloat(r.loi_kg) || 0) + (parseFloat(r.dau_cuon_kg) || 0) + 
            (parseFloat(r.rach_mop_kg) || 0) + (parseFloat(r.phe_lieu_san_xuat_kg) || 0), 0);
        
        // Tính thời gian setup (chuyển đổi pallet + thời gian khác)
        let setupTime = reports.reduce((sum, r) => 
            sum + (parseFloat(r.thoi_gian_chuyen_doi_pallet) || 0) + (parseFloat(r.thoi_gian_khac) || 0), 0);
        
        // Tính tổng thời gian dừng máy
        let stopTime = 0;
        stopReports.forEach(stop => {
            const duration = stop.thoi_gian_dung_may || '';
            if (duration.includes('giờ') || duration.includes('phút')) {
                const hours = (duration.match(/(\d+)\s*giờ/) || [0, 0])[1];
                const minutes = (duration.match(/(\d+)\s*phút/) || [0, 0])[1];
                stopTime += parseInt(hours) * 60 + parseInt(minutes);
            }
        });
        
        // Tính thời gian chạy máy
        let totalWorkTime = 0;
        reports.forEach(r => {
            if (r.thoi_gian_bat_dau && r.thoi_gian_ket_thuc) {
                const start = new Date(r.thoi_gian_bat_dau);
                const end = new Date(r.thoi_gian_ket_thuc);
                const diff = (end - start) / (1000 * 60); // phút
                totalWorkTime += diff;
            }
        });
        
        const runTime = Math.max(0, totalWorkTime - setupTime - stopTime);
        
        // Lấy thông tin khách hàng và sản phẩm
        let customer = '';
        let product = '';
        
        if (ws) {
            const wsReport = reports.find(r => r.so_ws === ws) || reports[0];
            customer = wsReport.khach_hang || '';
            product = wsReport.ma_giay || '';
        } else {
            const firstReport = reports[0] || {};
            customer = firstReport.khach_hang || '';
            product = firstReport.ma_giay || '';
        }
        
        const chartData = {
            totalProduct: totalProduct,
            totalWaste: totalWaste,
            runTime: runTime,
            setupTime: setupTime,
            stopTime: stopTime,
            customer: customer,
            product: product,
            reportCount: reports.length
        };
        
        console.log('Dữ liệu biểu đồ GMC:', chartData);
        res.json(chartData);
        
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu biểu đồ GMC:', error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu biểu đồ GMC: ' + error.message });
    }
});

// ====================================================================================================================================
// API BIỂU ĐỒ CHO BÁO CÁO SCL
// ====================================================================================================================================

// API lấy dữ liệu biểu đồ báo cáo SCL
router.get('/scl/chart-data', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        const { fromDate, toDate, ws, ca, may, tuan } = req.query;
        
        // Xây dựng điều kiện WHERE
        let whereConditions = [];
        let params = [];
        
        if (fromDate && toDate) {
            whereConditions.push(`DATE(created_at) BETWEEN ? AND ?`);
            params.push(fromDate, toDate);
        }
        
        if (ws) {
            whereConditions.push(`worksheet = ?`);
            params.push(ws);
        }
        
        if (ca) {
            whereConditions.push(`ca = ?`);
            params.push(ca);
        }
        
        if (tuan) {
            whereConditions.push(`tuan = ?`);
            params.push(parseInt(tuan));
        }
        
        // Chỉ lấy báo cáo có dữ liệu thực tế
        whereConditions.push(`nhap_kho_1 IS NOT NULL OR nhap_kho_2 IS NOT NULL OR nhap_kho_3 IS NOT NULL`);
        
        const whereClause = whereConditions.length > 0 ? 
            'WHERE ' + whereConditions.join(' AND ') : '';
        
        // Lấy dữ liệu báo cáo SCL
        const reports = await new Promise((resolve, reject) => {
            db.all(`SELECT 
                nhap_kho_1, nhap_kho_2, nhap_kho_3, phe_lieu_dau_cuon, phe_lieu_san_xuat,
                thoi_gian_bat_dau, thoi_gian_ket_thuc,
                khach_hang, ma_vat_tu, id, worksheet
                FROM bao_cao_scl ${whereClause}
                ORDER BY created_at DESC`, 
                params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        if (reports.length === 0) {
            return res.json({
                totalProduct: 0,
                totalWaste: 0,
                runTime: 0,
                setupTime: 0,
                stopTime: 0,
                customer: '',
                product: '',
                reportCount: 0,
                message: 'Không có dữ liệu phù hợp với điều kiện lọc'
            });
        }
        
        // Lấy dữ liệu dừng máy SCL
        const stopReports = await new Promise((resolve, reject) => {
            const reportIds = reports.map(r => r.id);
            if (reportIds.length === 0) {
                resolve([]);
                return;
            }
            
            const placeholders = reportIds.map(() => '?').join(',');
            db.all(`SELECT thoi_gian_dung_may FROM bao_cao_scl_dung_may 
                    WHERE bao_cao_id IN (${placeholders})`, 
                    reportIds, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Tính toán dữ liệu SCL
        const totalProduct = reports.reduce((sum, r) => 
            sum + (parseFloat(r.nhap_kho_1) || 0) + (parseFloat(r.nhap_kho_2) || 0) + (parseFloat(r.nhap_kho_3) || 0), 0);
        const totalWaste = reports.reduce((sum, r) => 
            sum + (parseFloat(r.phe_lieu_dau_cuon) || 0) + (parseFloat(r.phe_lieu_san_xuat) || 0), 0);
        
        // Tính tổng thời gian dừng máy
        let stopTime = 0;
        stopReports.forEach(stop => {
            const duration = stop.thoi_gian_dung_may || '';
            if (duration.includes('giờ') || duration.includes('phút')) {
                const hours = (duration.match(/(\d+)\s*giờ/) || [0, 0])[1];
                const minutes = (duration.match(/(\d+)\s*phút/) || [0, 0])[1];
                stopTime += parseInt(hours) * 60 + parseInt(minutes);
            }
        });
        
        // Tính thời gian chạy máy
        let totalWorkTime = 0;
        reports.forEach(r => {
            if (r.thoi_gian_bat_dau && r.thoi_gian_ket_thuc) {
                const start = new Date(r.thoi_gian_bat_dau);
                const end = new Date(r.thoi_gian_ket_thuc);
                
                let diff = (end - start) / (1000 * 60); // phút
                
                // Nếu diff âm, có thể là ca đêm - cộng thêm 24 giờ
                if (diff < 0) {
                    diff += 24 * 60; // cộng 24 giờ = 1440 phút
                }
                
                totalWorkTime += diff;
            }
        });
        
        const runTime = Math.max(0, totalWorkTime - stopTime);
        
        // Lấy thông tin khách hàng và sản phẩm
        let customer = '';
        let product = '';
        
        if (ws) {
            const wsReport = reports.find(r => r.worksheet === ws) || reports[0];
            customer = wsReport.khach_hang || '';
            product = wsReport.ma_vat_tu || '';
        } else {
            const firstReport = reports[0] || {};
            customer = firstReport.khach_hang || '';
            product = firstReport.ma_vat_tu || '';
        }
        
        const chartData = {
            totalProduct: totalProduct,
            totalWaste: totalWaste,
            runTime: runTime,
            setupTime: 0, // SCL không có thời gian setup riêng
            stopTime: stopTime,
            customer: customer,
            product: product,
            reportCount: reports.length
        };
        
        console.log('Dữ liệu biểu đồ SCL:', chartData);
        res.json(chartData);
        
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu biểu đồ SCL:', error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu biểu đồ SCL: ' + error.message });
    }
});

// ====================================================================================================================================
// API CHUNG
// ====================================================================================================================================

// API lấy danh sách modules cho dashboard
router.get('/modules/:factory', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        const { factory } = req.params; // 'nhamay1', 'nhamay2', 'nhamay3'
        
        let systemId = '';
switch (factory) {
    case 'nhamay1':
        systemId = 'sanxuat-nm1';
        break;
    case 'nhamay2':
        systemId = 'sanxuat-nm2';
        break;
    case 'nhamay3':
        systemId = 'sanxuat-nm3';
        break;
    default:
        return res.status(400).json({ error: 'Nhà máy không hợp lệ' });
}

// Lấy modules từ database
const modules = await new Promise((resolve, reject) => {
    db.all(`SELECT * FROM modules WHERE system_id = ?`, [systemId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
    });
});

// Thêm thuộc tính color cho modules
const modulesWithColor = modules.map(module => ({
    ...module,
    color: getModuleColor(module.id),
    url: getModuleUrl(module.id)
}));

res.json(modulesWithColor);
        
        // res.json(modules);
        
    } catch (error) {
        console.error('Lỗi khi lấy danh sách modules:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách modules: ' + error.message });
    }
});




// Hàm lấy màu cho module
function getModuleColor(moduleId) {
    switch (moduleId) {
        case 'innm1':
        case 'phieuin':
            return 'module-in';
        case 'gmcnm1':
        case 'phieugmc':
            return 'module-gmc';
        case 'sclnm1':
        case 'phieuscl':
            return 'module-scl';
        default:
            return 'module-default';
    }
}

// Hàm lấy URL cho module
function getModuleUrl(moduleId) {
    switch (moduleId) {
        case 'innm1':
        case 'phieuin':
            return 'Baocaoin.html';
        case 'gmcnm1':
        case 'phieugmc':
            return 'Baocaogmc.html';
        case 'sclnm1':
        case 'phieuscl':
            return 'Baocaoscl.html';
        default:
            return '#';
    }
}



// API lấy dữ liệu trưởng máy theo năm
router.get('/in/yearly-leader-data', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        const { year } = req.query;
        
        if (!year) {
            return res.status(400).json({ error: 'Thiếu tham số năm' });
        }
        
        console.log('📊 Lấy dữ liệu trưởng máy cho năm:', year);
        
        // Lấy dữ liệu theo năm, group theo trưởng máy, tháng và mã ca
        const yearlyLeaderData = await new Promise((resolve, reject) => {
            db.all(`SELECT 
                strftime('%m', ngay_phu) as month,
                truong_may,
                ma_ca,
                SUM(CAST(thanh_pham_in as REAL)) as total_paper,
                SUM(CAST(phe_lieu as REAL) + CAST(phe_lieu_trang as REAL)) as total_waste
                FROM bao_cao_in 
                WHERE strftime('%Y', ngay_phu) = ? 
                AND is_started_only = 0
                AND thanh_pham_in IS NOT NULL AND thanh_pham_in != ''
                AND truong_may IS NOT NULL AND truong_may != ''
                AND ma_ca IS NOT NULL AND ma_ca != ''
                GROUP BY strftime('%m', ngay_phu), truong_may, ma_ca
                ORDER BY truong_may, month, ma_ca`, 
                [year], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        console.log('📊 Raw data from DB:', yearlyLeaderData.length, 'rows');
        console.log('📊 Sample data:', yearlyLeaderData.slice(0, 3));
        
        // Nếu không có dữ liệu với ngay_phu, thử với created_at
        if (yearlyLeaderData.length === 0) {
            console.log('📊 Thử lấy dữ liệu với created_at...');
            
            const fallbackData = await new Promise((resolve, reject) => {
                db.all(`SELECT 
                    strftime('%m', created_at) as month,
                    truong_may,
                    ma_ca,
                    SUM(CAST(thanh_pham_in as REAL)) as total_paper,
                    SUM(CAST(phe_lieu as REAL) + CAST(phe_lieu_trang as REAL)) as total_waste
                    FROM bao_cao_in 
                    WHERE strftime('%Y', created_at) = ? 
                    AND is_started_only = 0
                    AND thanh_pham_in IS NOT NULL AND thanh_pham_in != ''
                    GROUP BY strftime('%m', created_at), truong_may, ma_ca
                    ORDER BY truong_may, month, ma_ca`, 
                    [year], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });
            
            console.log('📊 Fallback data:', fallbackData.length, 'rows');
            
            if (fallbackData.length > 0) {
                // Sử dụng dữ liệu fallback
                const result = processFallbackData(fallbackData);
                console.log('📊 Processed fallback result:', result);
                return res.json(result);
            }
        }
        
        if (yearlyLeaderData.length === 0) {
            console.log('📊 Không có dữ liệu, trả về object rỗng');
            return res.json({});
        }
        
        // Xử lý dữ liệu thành format mong muốn
        const result = {};
        
        // Lấy danh sách trưởng máy từ dữ liệu thực tế
        const leaders = [...new Set(yearlyLeaderData.map(row => row.truong_may))].filter(l => l).sort();
        console.log('📊 Leaders found:', leaders);
        
        // Khởi tạo dữ liệu cho tất cả trưởng máy
        leaders.forEach(leader => {
            result[leader] = {};
            for (let month = 1; month <= 12; month++) {
                const monthKey = `T${month}`;
                result[leader][monthKey] = {};
                // Khởi tạo tất cả ca có thể
                ['A', 'B', 'C', 'D', 'A1', 'B1', 'AB', 'AB-', 'AB+', 'HC'].forEach(shift => {
                    result[leader][monthKey][shift] = {
                        paper: 0,
                        waste: 0
                    };
                });
            }
        });
        
        // Điền dữ liệu thực tế
        yearlyLeaderData.forEach(row => {
            const month = parseInt(row.month);
            const leader = row.truong_may;
            const shift = row.ma_ca;
            const monthKey = `T${month}`;
            
            if (result[leader] && result[leader][monthKey] && result[leader][monthKey][shift]) {
                result[leader][monthKey][shift].paper += row.total_paper || 0;
                result[leader][monthKey][shift].waste += row.total_waste || 0;
            }
        });
        
        console.log('📊 Final result:', result);
        res.json(result);
        
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu trưởng máy theo năm:', error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu trưởng máy theo năm: ' + error.message });
    }
});





// API lấy dữ liệu thời gian theo máy theo ngày trong năm
router.get('/in/yearly-time-data', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        const { year } = req.query;
        
        if (!year) {
            return res.status(400).json({ error: 'Thiếu tham số năm' });
        }
        
        console.log('📊 Lấy dữ liệu thời gian theo máy theo ngày cho năm:', year);
        
        // Lấy dữ liệu cơ bản từ bảng bao_cao_in
        const reports = await new Promise((resolve, reject) => {
            db.all(`SELECT 
                DATE(COALESCE(ngay_phu, created_at)) as date,
                may,
                ma_ca,
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,
                thoi_gian_canh_may,
                id
                FROM bao_cao_in 
                WHERE strftime('%Y', COALESCE(ngay_phu, created_at)) = ? 
                AND is_started_only = 0
                AND thanh_pham_in IS NOT NULL 
                AND thanh_pham_in != ''
                AND may IS NOT NULL 
                AND may != ''
                ORDER BY date, may`, 
                [year], (err, rows) => {
                if (err) {
                    console.error('Lỗi query báo cáo:', err);
                    reject(err);
                } else {
                    console.log('📊 Lấy được', rows.length, 'báo cáo');
                    resolve(rows || []);
                }
            });
        });



// Lấy thông tin dừng máy cho từng báo cáo
for (let report of reports) {
    try {
        const stopData = await new Promise((resolve, reject) => {
            db.all(`SELECT thoi_gian_dung_may 
                    FROM bao_cao_in_dung_may 
                    WHERE bao_cao_id = ?`, [report.id], (err, rows) => {
                if (err) {
                    console.error('Lỗi query dừng máy:', err);
                    resolve([]); // Thay reject thành resolve([])
                } else {
                    resolve(rows || []);
                }
            });
        });
        
        let totalStopTime = 0;
        stopData.forEach(stop => {
            const duration = stop.thoi_gian_dung_may || '';
            if (duration.includes('giờ') || duration.includes('phút')) {
                const hours = (duration.match(/(\d+)\s*giờ/) || [0, 0])[1];
                const minutes = (duration.match(/(\d+)\s*phút/) || [0, 0])[1];
                totalStopTime += parseInt(hours) * 60 + parseInt(minutes);
            }
        });
        
        report.stopTime = totalStopTime;
        
    } catch (error) {
        console.error('Lỗi xử lý dừng máy cho report', report.id, ':', error);
        report.stopTime = 0;
    }
}


        
        if (reports.length === 0) {
            console.log('📊 Không có dữ liệu cho năm', year);
            return res.json({});
        }
        
        let stopReportsForTime = [];
try {
    stopReportsForTime = await new Promise((resolve, reject) => {
        db.all(`SELECT s.ly_do, s.thoi_gian_dung_may, DATE(COALESCE(b.ngay_phu, b.created_at)) as date, b.may
                FROM bao_cao_in_dung_may s
                JOIN bao_cao_in b ON s.bao_cao_id = b.id
                WHERE strftime('%Y', COALESCE(b.ngay_phu, b.created_at)) = ?
                AND b.is_started_only = 0
                AND b.thanh_pham_in IS NOT NULL 
                AND b.thanh_pham_in != ''
                AND s.ly_do LIKE '%F12%'`, 
                [year], (err, rows) => {
            if (err) {
                console.error('Lỗi query dừng máy giải lao:', err);
                resolve([]); // Thay reject thành resolve
            } else {
                console.log('📊 Lấy được', rows?.length || 0, 'record dừng máy giải lao');
                resolve(rows || []);
            }
        });
    });
} catch (error) {
    console.error('Lỗi tổng thể khi lấy dữ liệu dừng máy giải lao:', error);
    stopReportsForTime = [];
}


        
        // Tính tổng thời gian giải lao theo ngày-máy-ca
const giaiLaoPerDateMachineShift = {};
stopReportsForTime.forEach(stop => {
    // Cần lấy thêm thông tin ca từ báo cáo gốc
    const matchingReport = reports.find(r => 
        r.may === stop.may && 
        r.thoi_gian_bat_dau && 
        r.thoi_gian_bat_dau.includes(stop.date)
    );
    
    const shift = matchingReport ? matchingReport.ma_ca : 'Unknown';
    const key = `${stop.date}_${stop.may}_${shift}`;
    
    if (!giaiLaoPerDateMachineShift[key]) {
        giaiLaoPerDateMachineShift[key] = 0;
    }
    
    const duration = stop.thoi_gian_dung_may || '';
    if (duration.includes('giờ') || duration.includes('phút')) {
        const hours = (duration.match(/(\d+)\s*giờ/) || [0, 0])[1];
        const minutes = (duration.match(/(\d+)\s*phút/) || [0, 0])[1];
        giaiLaoPerDateMachineShift[key] += parseInt(hours) * 60 + parseInt(minutes);
    }
});
        
        // Định nghĩa thời gian ca (phút)
const shiftMinutes = {
    'A': 8 * 60, 'B': 8 * 60, 'C': 8 * 60, 'D': 12 * 60, 
    'A1': 12 * 60, 'B1': 12 * 60, 'AB': 9 * 60, 'AB-': 8 * 60, 
    'AB+': 10 * 60, 'HC': 9 * 60
};
        
        // Xử lý dữ liệu theo máy-ca và ngày
const machineShiftData = {};

reports.forEach(report => {
    const machine = report.may;
    const date = report.date;
    const shift = report.ma_ca;
    const key = `${machine}_${shift}`;
    
    if (!machineShiftData[key]) {
        machineShiftData[key] = {};
    }
    
    if (!machineShiftData[key][date]) {
        machineShiftData[key][date] = {
            machine: machine,
            shift: shift,
            totalRunTime: 0,
            shiftTime: shiftMinutes[shift] || (8 * 60), // Thời gian ca cố định (phút)
            breakTime: 0
        };
    }
    

    
    // Tính thời gian chạy máy - SỬA ĐỂ SỬ DỤNG TRỰC TIẾP runTime TỪ DATABASE
let runTimeMinutes = 0;

// Ưu tiên sử dụng trường runTime đã tính sẵn từ database
if (report.runTime !== undefined && report.runTime !== null) {
    runTimeMinutes = parseFloat(report.runTime) || 0;
} else if (report.thoi_gian_chay_may !== undefined && report.thoi_gian_chay_may !== null) {
    runTimeMinutes = parseFloat(report.thoi_gian_chay_may) || 0;
} else {
    // Chỉ tính toán từ thời gian khi không có sẵn runTime
    if (report.thoi_gian_bat_dau && report.thoi_gian_ket_thuc) {
        try {
            const start = new Date(report.thoi_gian_bat_dau);
            const end = new Date(report.thoi_gian_ket_thuc);
            
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                let totalSeconds = (end - start) / 1000;
                if (totalSeconds < 0) totalSeconds += 24 * 60 * 60;
                let totalMinutes = totalSeconds / 60;
                
                const setupMinutes = parseFloat(report.thoi_gian_canh_may) || 0;
                const stopMinutes = report.stopTime || 0;
                runTimeMinutes = Math.max(0, totalMinutes - setupMinutes - stopMinutes);
            }
        } catch (timeError) {
            console.error('Lỗi xử lý thời gian:', timeError);
            runTimeMinutes = 0;
        }
    }
}




// // DEBUG: Log chi tiết cho ngày 21/7
// if (date === '2025-07-21' && (report.may === 'KTS' || report.may === '6M1')) {
//     console.log(`🔍 DEBUG ${report.may} ${date}:`, {
//         id: report.id,
//         start: report.thoi_gian_bat_dau,
//         end: report.thoi_gian_ket_thuc,
//         totalMinutes: totalMinutes,
//         setupMinutes: setupMinutes,
//         stopMinutes: report.stopTime || 0,
//         runTimeCalculated: runTimeMinutes
//     });
// }


    
    machineShiftData[key][date].totalRunTime += runTimeMinutes;
});
        



        // Tính tỷ lệ theo ngày cho từng máy (tổng hợp từ các máy-ca)
const machinesByDate = {};

// Group theo máy và ngày
Object.keys(machineShiftData).forEach(key => {
    const [machine, shift] = key.split('_');
    
    Object.keys(machineShiftData[key]).forEach(date => {
        const data = machineShiftData[key][date];
        
        if (!machinesByDate[machine]) {
            machinesByDate[machine] = {};
        }
        
        if (!machinesByDate[machine][date]) {
            machinesByDate[machine][date] = {
                totalRunTime: 0,
                totalShiftTime: 0,
                totalBreakTime: 0
            };
        }
        
// Cộng dồn cho từng máy theo ngày  
machinesByDate[machine][date].totalRunTime += data.totalRunTime;
machinesByDate[machine][date].totalShiftTime += data.shiftTime;

// Tính thời gian giải lao cho máy-ca này
const breakKey = `${date}_${machine}_${shift}`;
const currentBreakTime = giaiLaoPerDateMachineShift[breakKey] || 0;
machineShiftData[key][date].breakTime = currentBreakTime;
machinesByDate[machine][date].totalBreakTime += currentBreakTime;
    });
});

// Chuyển đổi thành format cuối cùng
const finalResult = {};
Object.keys(machinesByDate).forEach(machine => {
    finalResult[machine] = [];
    
    Object.keys(machinesByDate[machine]).forEach(date => {
        const data = machinesByDate[machine][date];
        
        // Công thức: Tổng thời gian chạy máy / (Tổng thời gian ca - Tổng thời gian giải lao)
const effectiveWorkTime = data.totalShiftTime - data.totalBreakTime;
const timeRatio = effectiveWorkTime > 0 ? (data.totalRunTime / effectiveWorkTime) * 100 : 0;
        
        finalResult[machine].push({
            date: date,
            timeRatio: Math.round(timeRatio * 100) / 100,
            runTime: data.totalRunTime,
            workTime: effectiveWorkTime,
            breakTime: data.totalBreakTime
        });
    });
    
    // Sắp xếp theo ngày
    finalResult[machine].sort((a, b) => new Date(a.date) - new Date(b.date));
});


        
        console.log('📊 Trả về dữ liệu cho', Object.keys(finalResult).length, 'máy');
        res.json(finalResult);
        
    } catch (error) {
        console.error('Lỗi API yearly-time-data:', error);
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
 });



// API lấy dữ liệu thành phẩm theo ngày
router.get('/in/daily-product-data', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        const { year } = req.query;
        
        if (!year) {
            return res.status(400).json({ error: 'Thiếu tham số năm' });
        }
        
        console.log('📊 Lấy dữ liệu thành phẩm theo ngày cho năm:', year);
        
        // Lấy dữ liệu từ database
        const reports = await new Promise((resolve, reject) => {
            db.all(`SELECT 
                DATE(COALESCE(ngay_phu, created_at)) as date,
                may,
                SUM(CAST(thanh_pham_in as REAL)) as total_paper
                FROM bao_cao_in 
                WHERE strftime('%Y', COALESCE(ngay_phu, created_at)) = ? 
                AND is_started_only = 0
                AND thanh_pham_in IS NOT NULL 
                AND thanh_pham_in != ''
                AND may IS NOT NULL 
                AND may != ''
                GROUP BY DATE(COALESCE(ngay_phu, created_at)), may
                ORDER BY date, may`, 
                [year], (err, rows) => {
                if (err) {
                    console.error('Lỗi query thành phẩm theo ngày:', err);
                    reject(err);
                } else {
                    console.log('📊 Lấy được', rows.length, 'records thành phẩm theo ngày');
                    resolve(rows || []);
                }
            });
        });
        
        if (reports.length === 0) {
            console.log('📊 Không có dữ liệu thành phẩm cho năm', year);
            return res.json({});
        }
        
        // Xử lý dữ liệu theo máy
        const machineData = {};
        
        reports.forEach(report => {
            const machine = report.may;
            const date = report.date;
            const totalPaper = report.total_paper || 0;
            
            if (!machineData[machine]) {
                machineData[machine] = [];
            }
            
            machineData[machine].push({
                date: date,
                totalPaper: totalPaper
            });
        });
        
        console.log('📊 Trả về dữ liệu thành phẩm cho', Object.keys(machineData).length, 'máy');
        res.json(machineData);
        
    } catch (error) {
        console.error('Lỗi API daily-product-data:', error);
        res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
});








// Hàm xử lý dữ liệu fallback
function processFallbackData(fallbackData) {
    const result = {};
    
    // Tạo dữ liệu giả cho demo nếu không có truong_may
    const sampleLeaders = ['Trưởng máy A', 'Trưởng máy B', 'Trưởng máy C'];
    
    // Lấy danh sách trưởng máy từ dữ liệu thực tế hoặc dùng mẫu
    const leaders = [...new Set(fallbackData.map(row => row.truong_may))].filter(l => l && l.trim() !== '');
    const finalLeaders = leaders.length > 0 ? leaders : sampleLeaders;
    
    console.log('📊 Using leaders:', finalLeaders);
    
    // Khởi tạo dữ liệu cho tất cả trưởng máy
    finalLeaders.forEach(leader => {
        result[leader] = {};
        for (let month = 1; month <= 12; month++) {
            const monthKey = `T${month}`;
            result[leader][monthKey] = {};
            ['A', 'B', 'C', 'D', 'A1', 'B1', 'AB', 'AB-', 'AB+', 'HC'].forEach(shift => {
                result[leader][monthKey][shift] = {
                    paper: 0,
                    waste: 0
                };
            });
        }
    });
    
    // Điền dữ liệu thực tế nếu có
    if (leaders.length > 0) {
        fallbackData.forEach(row => {
            const month = parseInt(row.month);
            const leader = row.truong_may;
            const shift = row.ma_ca;
            const monthKey = `T${month}`;
            
            if (result[leader] && result[leader][monthKey] && result[leader][monthKey][shift]) {
                result[leader][monthKey][shift].paper += row.total_paper || 0;
                result[leader][monthKey][shift].waste += row.total_waste || 0;
            }
        });
    } else {
        // Tạo dữ liệu từ fallbackData nếu không có truong_may
        if (fallbackData.length > 0) {
            // Phân phối dữ liệu cho các trưởng máy mẫu
            const dataPerLeader = Math.floor(fallbackData.length / finalLeaders.length);
            
            finalLeaders.forEach((leader, leaderIndex) => {
                const startIndex = leaderIndex * dataPerLeader;
                const endIndex = (leaderIndex + 1) * dataPerLeader;
                const leaderFallbackData = fallbackData.slice(startIndex, endIndex);
                
                leaderFallbackData.forEach(row => {
                    const month = parseInt(row.month);
                    const shift = row.ma_ca || 'A';
                    const monthKey = `T${month}`;
                    
                    if (result[leader][monthKey][shift]) {
                        result[leader][monthKey][shift].paper += row.total_paper || 0;
                        result[leader][monthKey][shift].waste += row.total_waste || 0;
                    }
                });
            });
        }
    }
    
    return result;
}










module.exports = router;