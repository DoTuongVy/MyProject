const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Lưu định mức chung
router.post('/save', async (req, res) => {
    try {
        const { type, gioDoimMa, may6M1, may6M5, may6K1, may6K2 } = req.body;
        
        if (!type) {
            return res.status(400).json({ error: 'Thiếu thông tin loại định mức' });
        }
        
        const now = new Date().toISOString();
        
        // Thử update trước
        const updateResult = await db.runAsync(`
            UPDATE dinh_muc_chung_planning 
            SET gio_doi_ma = ?, may_6m1 = ?, may_6m5 = ?, may_6k1 = ?, may_6k2 = ?, updated_at = ?
            WHERE type = ?
        `, [gioDoimMa, may6M1, may6M5, may6K1, may6K2, now, type]);
        
        // Nếu không có row nào được update (changes = 0), thực hiện insert
        if (updateResult.changes === 0) {
            const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            await db.runAsync(`
                INSERT INTO dinh_muc_chung_planning 
                (id, type, gio_doi_ma, may_6m1, may_6m5, may_6k1, may_6k2, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [id, type, gioDoimMa, may6M1, may6M5, may6K1, may6K2, now, now]);
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