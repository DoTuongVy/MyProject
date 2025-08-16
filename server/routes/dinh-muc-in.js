const express = require('express');
const router = express.Router();
const { db } = require('../db');


// Helper function tính toán định mức cho một sản phẩm
async function calculateDinhMucForProduct(maSanPham) {
    try {
        console.log('=== TÍNH TOÁN ĐỊNH MỨC CHO:', maSanPham, '===');
        
        // Lấy định mức chung từ bảng dinh_muc_chung_planning
        const dinhMucChung = await db.allAsync(
            `SELECT * FROM dinh_muc_chung_planning WHERE type = 'in'`
        );
        const dinhMucChungData = dinhMucChung[0] || {};
        console.log('Định mức chung có sẵn:', Object.keys(dinhMucChungData).length > 0);
        
        // Lấy tất cả báo cáo in của sản phẩm này
        const baoCaoIn = await db.allAsync(
            `SELECT id, may, thoi_gian_canh_may, thoi_gian_bat_dau, thoi_gian_ket_thuc, 
                    thanh_pham_in, toc_do, created_at
             FROM bao_cao_in 
             WHERE ma_sp = ? AND may IS NOT NULL
             ORDER BY created_at`, 
            [maSanPham]
        );
        console.log(`Tìm thấy ${baoCaoIn.length} báo cáo cho sản phẩm ${maSanPham}`);
        
        // Hàm chuyển đổi thời gian từ string sang phút
        function timeToMinutes(timeString) {
            if (!timeString || timeString === '' || timeString === '0') return 0;
            
            const timeStr = timeString.toString().trim();
            
            // Format HH:MM
            if (timeStr.includes(':')) {
                const parts = timeStr.split(':');
                const hours = parseInt(parts[0]) || 0;
                const minutes = parseInt(parts[1]) || 0;
                return hours * 60 + minutes;
            }
            
            // Nếu chỉ là số (phút)
            return parseInt(timeStr) || 0;
        }
        
        // Hàm tính khoảng cách thời gian giữa 2 thời điểm (HH:MM)
        function calculateTimeDifference(startTime, endTime) {
            if (!startTime || !endTime) return 0;
            
            const start = timeToMinutes(startTime);
            const end = timeToMinutes(endTime);
            
            if (end >= start) {
                return end - start;
            } else {
                // Trường hợp qua ngày (ví dụ: 23:00 -> 01:00)
                return (24 * 60) - start + end;
            }
        }
        
        // Nhóm dữ liệu theo máy và tính toán cho từng báo cáo
        const dataByMachine = {};
        
        for (const bc of baoCaoIn) {
            if (!bc.may) continue;
            
            const machine = bc.may.toLowerCase().trim();
            
            console.log(`\n--- Báo cáo ID: ${bc.id} ---`);
            console.log('Thành phẩm in:', bc.thanh_pham_in);
            console.log('Thời gian bắt đầu:', bc.thoi_gian_bat_dau);
            console.log('Thời gian kết thúc:', bc.thoi_gian_ket_thuc);
            console.log('Thời gian canh máy:', bc.thoi_gian_canh_may);
            
            // Tính thời gian chạy máy thực tế
            let thoiGianChayMayPhut = 0;
            
            if (bc.thoi_gian_bat_dau && bc.thoi_gian_ket_thuc) {
                // Tổng thời gian = kết thúc - bắt đầu
                const tongThoiGian = calculateTimeDifference(bc.thoi_gian_bat_dau, bc.thoi_gian_ket_thuc);
                console.log('Tổng thời gian (phút):', tongThoiGian);
                
                // Trừ thời gian canh máy
                const thoiGianCanhMay = timeToMinutes(bc.thoi_gian_canh_may);
                console.log('Thời gian canh máy (phút):', thoiGianCanhMay);
                
                // Lấy tổng thời gian dừng máy
                const dungMayRecords = await db.allAsync(
                    `SELECT thoi_gian_dung_may FROM bao_cao_in_dung_may WHERE bao_cao_id = ?`,
                    [bc.id]
                );
                
                let tongThoiGianDungMay = 0;
                dungMayRecords.forEach(dm => {
                    tongThoiGianDungMay += timeToMinutes(dm.thoi_gian_dung_may);
                });
                console.log('Tổng thời gian dừng máy (phút):', tongThoiGianDungMay);
                
                // Thời gian chạy máy = Tổng - Canh máy - Dừng máy
                thoiGianChayMayPhut = tongThoiGian - thoiGianCanhMay - tongThoiGianDungMay;
                console.log('Thời gian chạy máy tính được (phút):', thoiGianChayMayPhut);
            }
            
            // Lấy tốc độ từ bảng bao_cao_in_toc_do
            let tocDoTinh = null;
            if (bc.toc_do && parseInt(bc.toc_do) > 0) {
                // Ưu tiên lấy tốc độ đã có sẵn từ báo cáo
                tocDoTinh = parseInt(bc.toc_do);
                console.log(`Tốc độ lấy trực tiếp từ báo cáo ${bc.id}: ${tocDoTinh}`);
            } else if (bc.thanh_pham_in && thoiGianChayMayPhut > 0) {
                // Fallback: Tự tính toán nếu không có tốc độ sẵn
                const thanhPham = parseInt(bc.thanh_pham_in) || 0;
                if (thanhPham > 0) {
                    tocDoTinh = Math.round((thanhPham * 60) / thoiGianChayMayPhut);
                    console.log(`Tốc độ tính fallback cho báo cáo ${bc.id}: ${tocDoTinh}`);
                }
            }
            
            // Khởi tạo mảng cho máy nếu chưa có
            if (!dataByMachine[machine]) {
                dataByMachine[machine] = {
                    canhMayValues: [],
                    tocDoValues: []
                };
            }
            
            // Thêm vào mảng
            dataByMachine[machine].canhMayValues.push(bc.thoi_gian_canh_may);
            dataByMachine[machine].tocDoValues.push(tocDoTinh);
        }
        
        console.log('Dữ liệu nhóm theo máy:', Object.keys(dataByMachine));
        
        // Hàm tính trung bình (bỏ qua giá trị null và 0)
        function calculateAverage(values) {
            // Lọc bỏ các giá trị null/undefined, nhưng giữ lại số 0
            const validValues = values.filter(v => v !== null && v !== undefined);
        
            if (validValues.length === 0) {
                return null; // Trả về null nếu không có giá trị nào hợp lệ
            }
        
            // Nếu chỉ có một giá trị, trả về chính nó
            if (validValues.length === 1) {
                return parseFloat(validValues[0]);
            }
        
            // Tính tổng và trung bình
            const sum = validValues.reduce((acc, val) => acc + parseFloat(val), 0);
            return Math.round(sum / validValues.length);
        }
        
        // Các máy cần xử lý
        const machines = ['6m1', '6m5', '6k1', '6k2', '2m', 'kts'];
        const result = {};
        
        // Xử lý từng máy
        machines.forEach(machine => {
            const machineData = dataByMachine[machine];
            let gioDoiMa = '';
            let tocDo = '';
            
            if (!machineData || machineData.canhMayValues.length === 0) {
                // Chưa có báo cáo nào cho máy này
                console.log(`Máy ${machine}: Chưa có báo cáo - sử dụng định mức chung`);
                
                if (machine === '2m' || machine === 'kts') {
                    // Máy 2M và KTS: để trống nếu chưa chạy
                    gioDoiMa = '';
                    tocDo = '';
                } else {
                    // Các máy khác: lấy từ định mức chung
                    gioDoiMa = dinhMucChungData[`may_${machine}_gio_doi_ma`] || '';
                    tocDo = dinhMucChungData[`may_${machine}_toc_do`] || '';
                }
            } else {
                // Có báo cáo - tính trung bình
                const avgCanhMay = calculateAverage(machineData.canhMayValues);
                const avgTocDo = calculateAverage(machineData.tocDoValues);
                
                console.log(`Máy ${machine}: ${machineData.canhMayValues.length} báo cáo, trung bình canh máy: ${avgCanhMay}, tốc độ: ${avgTocDo}`);
                
                // Nếu tính được trung bình thì dùng, không thì fallback
                if (avgCanhMay !== null) {
                    gioDoiMa = avgCanhMay;
                } else if (machine !== '2m' && machine !== 'kts') {
                    gioDoiMa = dinhMucChungData[`may_${machine}_gio_doi_ma`] || '';
                }
                
                if (avgTocDo !== null) {
                    tocDo = avgTocDo;
                } else if (machine !== '2m' && machine !== 'kts') {
                    tocDo = dinhMucChungData[`may_${machine}_toc_do`] || '';
                }
            }
            
            // Lưu kết quả
            result[`may_${machine}_gio_doi_ma`] = gioDoiMa;
            result[`may_${machine}_toc_do`] = tocDo;
        });
        
        console.log('Kết quả tính toán:', result);
        return result;
        
    } catch (error) {
        console.error('LỖI trong calculateDinhMucForProduct:', error);
        
        // Trả về giá trị trống nếu có lỗi
        return {
            may_6m1_gio_doi_ma: '', may_6m1_toc_do: '',
            may_6m5_gio_doi_ma: '', may_6m5_toc_do: '',
            may_6k1_gio_doi_ma: '', may_6k1_toc_do: '',
            may_6k2_gio_doi_ma: '', may_6k2_toc_do: '',
            may_2m_gio_doi_ma: '', may_2m_toc_do: '',
            may_kts_gio_doi_ma: '', may_kts_toc_do: ''
        };
    }
}



// Lấy định mức chi tiết của công đoạn in với pagination
router.get('/list', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        // Tạo bảng định mức chi tiết nếu chưa có
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS dinh_muc_chi_tiet_in (
                id VARCHAR(255) PRIMARY KEY,
                ma_san_pham VARCHAR(255) UNIQUE NOT NULL,
                may_6m1_gio_doi_ma VARCHAR(50),
                may_6m1_toc_do VARCHAR(50),
                may_6m5_gio_doi_ma VARCHAR(50),
                may_6m5_toc_do VARCHAR(50),
                may_6k1_gio_doi_ma VARCHAR(50),
                may_6k1_toc_do VARCHAR(50),
                may_6k2_gio_doi_ma VARCHAR(50),
                may_6k2_toc_do VARCHAR(50),
                may_2m_gio_doi_ma VARCHAR(50),
                may_2m_toc_do VARCHAR(50),
                may_kts_gio_doi_ma VARCHAR(50),
                may_kts_toc_do VARCHAR(50),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Debug parameters trước khi query
        console.log('Debug params:', { page, limit, offset });
        
        // Query đếm với kiểu parameters chính xác
        const countQuery = `SELECT COUNT(*) as total FROM bao_cao_in WHERE ma_sp IS NOT NULL`;
        const countResult = await db.getAsync(countQuery, []);
        const total = countResult.total || 0;
        const totalPages = Math.ceil(total / limit);

        // Đảm bảo parameters là number và > 0
        const safeLimit = Math.max(1, Math.min(1000, parseInt(limit) || 50));
        const safeOffset = Math.max(0, parseInt(offset) || 0);
        
        console.log('Safe params:', { safeLimit, safeOffset });

        // Query lấy dữ liệu mới nhất cho mỗi mã sản phẩm
const query = `
SELECT DISTINCT ma_sp, 
       khach_hang, 
       so_con, 
       so_mau, 
       kho, 
       dai_giay, 
       phu_keo, 
       ngay_phu, 
       ma_giay_1
FROM bao_cao_in b1
WHERE ma_sp IS NOT NULL 
AND created_at = (
    SELECT MAX(created_at) 
    FROM bao_cao_in b2 
    WHERE b2.ma_sp = b1.ma_sp
)
ORDER BY ma_sp
`;
        
        // Thử query không có LIMIT trước
        let allRows = await db.allAsync(query, []);
        
        // Áp dụng pagination bằng JavaScript
        const rows = allRows.slice(safeOffset, safeOffset + safeLimit);
        
        console.log(`Query result: ${allRows.length} total, ${rows.length} in page`);

        // Xử lý từng record để tính toán định mức theo logic mới
const processedRows = [];
for (const row of rows) {
    try {
        const calculatedDinhMuc = await calculateDinhMucForProduct(row.ma_sp);
        
        processedRows.push({
            ma_sp: row.ma_sp || '',
            khach_hang: row.khach_hang || '',
            so_con: row.so_con || '',
            so_mau: row.so_mau || '',
            kho: row.kho || '',
            dai_giay: row.dai_giay || '',
            phu_keo: row.phu_keo || '',
            ngay_phu: row.ngay_phu || '2025-05-08',
            loai_giay: row.ma_giay_1 || '',
            ...calculatedDinhMuc
        });
    } catch (error) {
        console.error(`Lỗi khi xử lý sản phẩm ${row.ma_sp}:`, error);
        // Thêm với giá trị mặc định nếu có lỗi
        processedRows.push({
            ma_sp: row.ma_sp || '',
            khach_hang: row.khach_hang || '',
            so_con: row.so_con || '',
            so_mau: row.so_mau || '',
            kho: row.kho || '',
            dai_giay: row.dai_giay || '',
            phu_keo: row.phu_keo || '',
            ngay_phu: row.ngay_phu || '2025-05-08',
            loai_giay: row.ma_giay_1 || '',
            may_6m1_gio_doi_ma: '', may_6m1_toc_do: '',
            may_6m5_gio_doi_ma: '', may_6m5_toc_do: '',
            may_6k1_gio_doi_ma: '', may_6k1_toc_do: '',
            may_6k2_gio_doi_ma: '', may_6k2_toc_do: '',
            may_2m_gio_doi_ma: '', may_2m_toc_do: '',
            may_kts_gio_doi_ma: '', may_kts_toc_do: ''
        });
    }
}

        res.json({
            data: processedRows,
            page: page,
            limit: limit,
            total: total,
            totalPages: totalPages
        });
    } catch (error) {
        console.error('Lỗi khi lấy định mức chi tiết in:', error);
        res.status(500).json({ error: 'Lỗi server khi lấy định mức chi tiết in: ' + error.message });
    }
});

// Cập nhật định mức cho một sản phẩm cụ thể
router.put('/:maSanPham', async (req, res) => {
    try {
        const { maSanPham } = req.params;
        const {
            may_6m1_gio_doi_ma, may_6m1_toc_do,
            may_6m5_gio_doi_ma, may_6m5_toc_do,
            may_6k1_gio_doi_ma, may_6k1_toc_do,
            may_6k2_gio_doi_ma, may_6k2_toc_do,
            may_2m_gio_doi_ma, may_2m_toc_do,
            may_kts_gio_doi_ma, may_kts_toc_do
        } = req.body;
        
        // Tạo bảng định mức chi tiết in nếu chưa có
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS dinh_muc_chi_tiet_in (
                id VARCHAR(255) PRIMARY KEY,
                ma_san_pham VARCHAR(255) UNIQUE NOT NULL,
                may_6m1_gio_doi_ma VARCHAR(50),
                may_6m1_toc_do VARCHAR(50),
                may_6m5_gio_doi_ma VARCHAR(50),
                may_6m5_toc_do VARCHAR(50),
                may_6k1_gio_doi_ma VARCHAR(50),
                may_6k1_toc_do VARCHAR(50),
                may_6k2_gio_doi_ma VARCHAR(50),
                may_6k2_toc_do VARCHAR(50),
                may_2m_gio_doi_ma VARCHAR(50),
                may_2m_toc_do VARCHAR(50),
                may_kts_gio_doi_ma VARCHAR(50),
                may_kts_toc_do VARCHAR(50),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        const now = new Date().toISOString();
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        // Thử update trước
        const updateResult = await db.runAsync(`
            UPDATE dinh_muc_chi_tiet_in 
            SET may_6m1_gio_doi_ma = ?, may_6m1_toc_do = ?,
                may_6m5_gio_doi_ma = ?, may_6m5_toc_do = ?,
                may_6k1_gio_doi_ma = ?, may_6k1_toc_do = ?,
                may_6k2_gio_doi_ma = ?, may_6k2_toc_do = ?,
                may_2m_gio_doi_ma = ?, may_2m_toc_do = ?,
                may_kts_gio_doi_ma = ?, may_kts_toc_do = ?,
                updated_at = ?
            WHERE ma_san_pham = ?
        `, [
            may_6m1_gio_doi_ma, may_6m1_toc_do,
            may_6m5_gio_doi_ma, may_6m5_toc_do,
            may_6k1_gio_doi_ma, may_6k1_toc_do,
            may_6k2_gio_doi_ma, may_6k2_toc_do,
            may_2m_gio_doi_ma, may_2m_toc_do,
            may_kts_gio_doi_ma, may_kts_toc_do,
            now, maSanPham
        ]);
        
        // Nếu không có row nào được update, thực hiện insert
        if (updateResult.changes === 0) {
            await db.runAsync(`
                INSERT INTO dinh_muc_chi_tiet_in 
                (id, ma_san_pham, may_6m1_gio_doi_ma, may_6m1_toc_do,
                 may_6m5_gio_doi_ma, may_6m5_toc_do, may_6k1_gio_doi_ma, may_6k1_toc_do,
                 may_6k2_gio_doi_ma, may_6k2_toc_do, may_2m_gio_doi_ma, may_2m_toc_do,
                 may_kts_gio_doi_ma, may_kts_toc_do, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id, maSanPham,
                may_6m1_gio_doi_ma, may_6m1_toc_do,
                may_6m5_gio_doi_ma, may_6m5_toc_do,
                may_6k1_gio_doi_ma, may_6k1_toc_do,
                may_6k2_gio_doi_ma, may_6k2_toc_do,
                may_2m_gio_doi_ma, may_2m_toc_do,
                may_kts_gio_doi_ma, may_kts_toc_do,
                now, now
            ]);
        }
        
        res.json({ success: true, message: 'Đã cập nhật định mức thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật định mức chi tiết in:', error);
        res.status(500).json({ error: 'Lỗi server khi cập nhật định mức: ' + error.message });
    }
});




// Lấy danh sách báo cáo chi tiết cho một sản phẩm cụ thể
router.get('/details/:maSanPham', async (req, res) => {
    try {
        const { maSanPham } = req.params;

        if (!maSanPham) {
            return res.status(400).json({ error: 'Thiếu mã sản phẩm' });
        }

        // Lấy tất cả báo cáo của sản phẩm này, sắp xếp theo ngày tạo
        const baoCaoChiTiet = await db.allAsync(
            `SELECT 
                id,
                may,
                thoi_gian_canh_may,
                toc_do,
                created_at,
                thoi_gian_bat_dau,
                thanh_pham_in
             FROM bao_cao_in 
             WHERE ma_sp = ? AND may IS NOT NULL
             ORDER BY created_at DESC`,
            [maSanPham]
        );
        
        // Trả về dữ liệu dưới dạng JSON
        res.json({
            success: true,
            data: baoCaoChiTiet
        });

    } catch (error) {
        console.error('Lỗi khi lấy báo cáo chi tiết:', error);
        res.status(500).json({ error: 'Lỗi server khi lấy báo cáo chi tiết: ' + error.message });
    }
});








module.exports = router;