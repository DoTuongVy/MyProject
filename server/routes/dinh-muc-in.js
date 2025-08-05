const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Lấy định mức chi tiết của công đoạn in với pagination
router.get('/list', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        // Query đếm tổng số bản ghi
        const countQuery = `
            SELECT COUNT(DISTINCT bi.ma_sp) as total
            FROM bao_cao_in bi
            WHERE bi.ma_sp IS NOT NULL AND TRIM(bi.ma_sp) != ''
        `;
        
        const countResult = await db.getAsync(countQuery);
        const total = countResult.total || 0;
        const totalPages = Math.ceil(total / limit);

        // Query lấy dữ liệu với pagination
        const query = `
            WITH ProductData AS (
                SELECT 
                    bi.ma_sp,
                    bi.khach_hang,
                    bi.so_con,
                    bi.so_mau,
                    bi.ma_giay_1,
                    bi.ma_giay_2,
                    bi.ma_giay_3,
                    bi.kho,
                    bi.dai_giay,
                    bi.phu_keo,
                    MAX(bi.ngay_phu) as ngay_phu_moi_nhat,
                    COUNT(DISTINCT bi.id) as so_lan_chay,
                    -- Gộp các loại giấy khác nhau
                    GROUP_CONCAT(
                        DISTINCT CASE 
                            WHEN TRIM(bi.ma_giay_1) != '' THEN TRIM(bi.ma_giay_1)
                            ELSE NULL 
                        END
                    ) as loai_giay_1_list,
                    GROUP_CONCAT(
                        DISTINCT CASE 
                            WHEN TRIM(bi.ma_giay_2) != '' THEN TRIM(bi.ma_giay_2)
                            ELSE NULL 
                        END
                    ) as loai_giay_2_list,
                    GROUP_CONCAT(
                        DISTINCT CASE 
                            WHEN TRIM(bi.ma_giay_3) != '' THEN TRIM(bi.ma_giay_3)
                            ELSE NULL 
                        END
                    ) as loai_giay_3_list
                FROM bao_cao_in bi
                WHERE bi.ma_sp IS NOT NULL AND TRIM(bi.ma_sp) != ''
                GROUP BY bi.ma_sp
                ORDER BY bi.ma_sp
                LIMIT ? OFFSET ?
            )
            SELECT 
                pd.ma_sp,
                pd.khach_hang,
                pd.so_con,
                pd.so_mau,
                pd.kho,
                pd.dai_giay,
                pd.phu_keo,
                pd.ngay_phu_moi_nhat as ngay_phu,
                -- Gộp tất cả loại giấy
                CASE 
                    WHEN pd.loai_giay_1_list IS NOT NULL AND pd.loai_giay_2_list IS NOT NULL AND pd.loai_giay_3_list IS NOT NULL 
                    THEN pd.loai_giay_1_list || ', ' || pd.loai_giay_2_list || ', ' || pd.loai_giay_3_list
                    WHEN pd.loai_giay_1_list IS NOT NULL AND pd.loai_giay_2_list IS NOT NULL 
                    THEN pd.loai_giay_1_list || ', ' || pd.loai_giay_2_list
                    WHEN pd.loai_giay_1_list IS NOT NULL AND pd.loai_giay_3_list IS NOT NULL 
                    THEN pd.loai_giay_1_list || ', ' || pd.loai_giay_3_list
                    WHEN pd.loai_giay_2_list IS NOT NULL AND pd.loai_giay_3_list IS NOT NULL 
                    THEN pd.loai_giay_2_list || ', ' || pd.loai_giay_3_list
                    WHEN pd.loai_giay_1_list IS NOT NULL 
                    THEN pd.loai_giay_1_list
                    WHEN pd.loai_giay_2_list IS NOT NULL 
                    THEN pd.loai_giay_2_list
                    WHEN pd.loai_giay_3_list IS NOT NULL 
                    THEN pd.loai_giay_3_list
                    ELSE ''
                END as loai_giay,
                -- Giá trị mặc định cho các máy
                '60' as may_6m1_gio_doi_ma,
                '7000' as may_6m1_toc_do,
                '60' as may_6m5_gio_doi_ma, 
                '7000' as may_6m5_toc_do,
                '60' as may_6k1_gio_doi_ma,
                '7000' as may_6k1_toc_do,
                '60' as may_6k2_gio_doi_ma,
                '7000' as may_6k2_toc_do,
                '60' as may_2m_gio_doi_ma,
                '7000' as may_2m_toc_do,
                '60' as may_kts_gio_doi_ma,
                '7000' as may_kts_toc_do
            FROM ProductData pd
        `;
        
        const rows = await db.allAsync(query, [limit, offset]);

        res.json({
            data: rows,
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
                id TEXT PRIMARY KEY,
                ma_san_pham TEXT UNIQUE NOT NULL,
                may_6m1_gio_doi_ma TEXT,
                may_6m1_toc_do TEXT,
                may_6m5_gio_doi_ma TEXT,
                may_6m5_toc_do TEXT,
                may_6k1_gio_doi_ma TEXT,
                may_6k1_toc_do TEXT,
                may_6k2_gio_doi_ma TEXT,
                may_6k2_toc_do TEXT,
                may_2m_gio_doi_ma TEXT,
                may_2m_toc_do TEXT,
                may_kts_gio_doi_ma TEXT,
                may_kts_toc_do TEXT,
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