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
            whereConditions.push(`DATE(created_at) BETWEEN ? AND ?`);
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
                thoi_gian_bat_dau, thoi_gian_ket_thuc, khach_hang, ma_sp, id, ws, ma_ca, may
                FROM bao_cao_in ${whereClause}
                ORDER BY created_at DESC`,
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
        
        // Lấy dữ liệu dừng máy
        const stopReports = await new Promise((resolve, reject) => {
            const reportIds = reports.map(r => r.id);
            if (reportIds.length === 0) {
                resolve([]);
                return;
            }
            
            const placeholders = reportIds.map(() => '?').join(',');
            db.all(`SELECT thoi_gian_dung_may FROM bao_cao_in_dung_may 
                    WHERE bao_cao_id IN (${placeholders})`, 
                    reportIds, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Tính toán dữ liệu
        const totalPaper = reports.reduce((sum, r) => sum + (parseFloat(r.thanh_pham_in) || 0), 0);
        const totalWaste = reports.reduce((sum, r) => 
            sum + (parseFloat(r.phe_lieu) || 0) + (parseFloat(r.phe_lieu_trang) || 0), 0);
        
        // Tính thời gian setup (canh máy)
        let setupTime = reports.reduce((sum, r) => sum + (parseFloat(r.thoi_gian_canh_may) || 0), 0);
        
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



        // Tạo mảng stopReasons từ dữ liệu dừng máy
const stopReasons = [];
stopReports.forEach(stop => {
    const duration = stop.thoi_gian_dung_may || '';
    if (duration.includes('giờ') || duration.includes('phút')) {
        const hours = (duration.match(/(\d+)\s*giờ/) || [0, 0])[1];
        const minutes = (duration.match(/(\d+)\s*phút/) || [0, 0])[1];
        const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
        if (totalMinutes > 0) {
            stopReasons.push({
                reason: 'Dừng máy',
                duration: totalMinutes
            });
        }
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
    stopReasons: stopReasons, // Sẽ xử lý sau
    customer: customer,
    product: product,
    reportCount: reports.length
};


// Nếu yêu cầu chi tiết, trả về cả dữ liệu reports
if (req.query.detail === 'true') {
    chartData.reports = reports;
}
        
        console.log('Dữ liệu biểu đồ In:', chartData);
        res.json(chartData);
        
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu biểu đồ In:', error);
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu biểu đồ In: ' + error.message });
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
                const diff = (end - start) / (1000 * 60); // phút
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



module.exports = router;