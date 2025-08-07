const express = require('express');
const router = express.Router();
const { db } = require('../db');

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

        // Xử lý từng record để lấy định mức tùy chỉnh
        const processedRows = [];
        for (const row of rows) {
            // Lấy định mức tùy chỉnh nếu có
            const customDinhMuc = await db.getAsync(
                `SELECT * FROM dinh_muc_chi_tiet_in WHERE ma_san_pham = ?`, 
                [row.ma_sp]
            );

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
                // Dùng giá trị tùy chỉnh nếu có, không thì dùng default
                may_6m1_gio_doi_ma: customDinhMuc?.may_6m1_gio_doi_ma || '60',
                may_6m1_toc_do: customDinhMuc?.may_6m1_toc_do || '7000',
                may_6m5_gio_doi_ma: customDinhMuc?.may_6m5_gio_doi_ma || '60',
                may_6m5_toc_do: customDinhMuc?.may_6m5_toc_do || '7000',
                may_6k1_gio_doi_ma: customDinhMuc?.may_6k1_gio_doi_ma || '60',
                may_6k1_toc_do: customDinhMuc?.may_6k1_toc_do || '7000',
                may_6k2_gio_doi_ma: customDinhMuc?.may_6k2_gio_doi_ma || '60',
                may_6k2_toc_do: customDinhMuc?.may_6k2_toc_do || '7000',
                may_2m_gio_doi_ma: customDinhMuc?.may_2m_gio_doi_ma || '60',
                may_2m_toc_do: customDinhMuc?.may_2m_toc_do || '7000',
                may_kts_gio_doi_ma: customDinhMuc?.may_kts_gio_doi_ma || '60',
                may_kts_toc_do: customDinhMuc?.may_kts_toc_do || '7000'
            });
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

module.exports = router;