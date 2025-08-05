const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Lưu định mức chung
router.post('/save', async (req, res) => {
    try {
        const { 
            type, 
            may6M1GioDoiMa, may6M1GioDoiMaTrung, may6M1TocDo,
            may6M5GioDoiMa, may6M5GioDoiMaTrung, may6M5TocDo,
            may6K1GioDoiMa, may6K1GioDoiMaTrung, may6K1TocDo,
            may6K2GioDoiMa, may6K2GioDoiMaTrung, may6K2TocDo
        } = req.body;
        
        if (!type) {
            return res.status(400).json({ error: 'Thiếu thông tin loại định mức' });
        }
        
        const now = new Date().toISOString();
        
        // Thử update trước
        const updateResult = await db.runAsync(`
            UPDATE dinh_muc_chung_planning 
            SET may_6m1_gio_doi_ma = ?, may_6m1_gio_doi_ma_trung = ?, may_6m1_toc_do = ?,
                may_6m5_gio_doi_ma = ?, may_6m5_gio_doi_ma_trung = ?, may_6m5_toc_do = ?,
                may_6k1_gio_doi_ma = ?, may_6k1_gio_doi_ma_trung = ?, may_6k1_toc_do = ?,
                may_6k2_gio_doi_ma = ?, may_6k2_gio_doi_ma_trung = ?, may_6k2_toc_do = ?,
                updated_at = ?
            WHERE type = ?
        `, [
            may6M1GioDoiMa, may6M1GioDoiMaTrung, may6M1TocDo,
            may6M5GioDoiMa, may6M5GioDoiMaTrung, may6M5TocDo,
            may6K1GioDoiMa, may6K1GioDoiMaTrung, may6K1TocDo,
            may6K2GioDoiMa, may6K2GioDoiMaTrung, may6K2TocDo,
            now, type
        ]);
        
        // Nếu không có row nào được update (changes = 0), thực hiện insert
if (updateResult.changes === 0) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    try {
        await db.runAsync(`
            INSERT INTO dinh_muc_chung_planning 
            (id, type, may_6m1_gio_doi_ma, may_6m1_gio_doi_ma_trung, may_6m1_toc_do,
             may_6m5_gio_doi_ma, may_6m5_gio_doi_ma_trung, may_6m5_toc_do,
             may_6k1_gio_doi_ma, may_6k1_gio_doi_ma_trung, may_6k1_toc_do,
             may_6k2_gio_doi_ma, may_6k2_gio_doi_ma_trung, may_6k2_toc_do,
             created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, type, 
            may6M1GioDoiMa, may6M1GioDoiMaTrung, may6M1TocDo,
            may6M5GioDoiMa, may6M5GioDoiMaTrung, may6M5TocDo,
            may6K1GioDoiMa, may6K1GioDoiMaTrung, may6K1TocDo,
            may6K2GioDoiMa, may6K2GioDoiMaTrung, may6K2TocDo,
            now, now
        ]);
    } catch (insertError) {
        // Nếu INSERT cũng thất bại do UNIQUE constraint, có nghĩa record đã tồn tại
        // Thực hiện UPDATE một lần nữa
        if (insertError.message.includes('UNIQUE constraint failed')) {
            await db.runAsync(`
                UPDATE dinh_muc_chung_planning 
                SET may_6m1_gio_doi_ma = ?, may_6m1_gio_doi_ma_trung = ?, may_6m1_toc_do = ?,
                    may_6m5_gio_doi_ma = ?, may_6m5_gio_doi_ma_trung = ?, may_6m5_toc_do = ?,
                    may_6k1_gio_doi_ma = ?, may_6k1_gio_doi_ma_trung = ?, may_6k1_toc_do = ?,
                    may_6k2_gio_doi_ma = ?, may_6k2_gio_doi_ma_trung = ?, may_6k2_toc_do = ?,
                    updated_at = ?
                WHERE type = ?
            `, [
                may6M1GioDoiMa, may6M1GioDoiMaTrung, may6M1TocDo,
                may6M5GioDoiMa, may6M5GioDoiMaTrung, may6M5TocDo,
                may6K1GioDoiMa, may6K1GioDoiMaTrung, may6K1TocDo,
                may6K2GioDoiMa, may6K2GioDoiMaTrung, may6K2TocDo,
                now, type
            ]);
        } else {
            throw insertError;
        }
    }
}
        
        res.json({ success: true, message: 'Đã lưu định mức thành công' });
    } catch (error) {
        console.error('Lỗi khi lưu định mức chung:', error);
        res.status(500).json({ error: 'Lỗi server khi lưu định mức: ' + error.message });
    }
});

// Lấy danh sách định mức chung
router.get('/list', async (req, res) => {
    try {
        const rows = await db.allAsync('SELECT * FROM dinh_muc_chung_planning ORDER BY type');
        res.json(rows);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách định mức chung:', error);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách định mức' });
    }
});

// Lấy định mức theo loại
router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const row = await db.getAsync('SELECT * FROM dinh_muc_chung_planning WHERE type = ?', [type]);
        
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Không tìm thấy định mức' });
        }
    } catch (error) {
        console.error('Lỗi khi lấy định mức theo loại:', error);
        res.status(500).json({ error: 'Lỗi server khi lấy định mức' });
    }
});

module.exports = router;