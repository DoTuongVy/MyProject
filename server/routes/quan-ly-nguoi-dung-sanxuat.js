//! =================================================================
//! PRODUCTION USERS MANAGEMENT API ROUTES
//  File: server/routes/quan-ly-nguoi-dung-sanxuat.js
//  Quản lý người dùng cho các báo cáo sản xuất
//! =================================================================

const express = require('express');
const router = express.Router();
const { db } = require('../db');

console.log('🚀 Production Users Management routes loaded');

//TODO Lấy danh sách người dùng theo module và chức vụ========================================================================
router.get('/list/:moduleId', async (req, res) => {
    try {
        const { moduleId } = req.params;
        console.log(`📡 GET /production-users/list/${moduleId} được gọi`);
        
        const productionUsers = await db.allAsync(`
            SELECT pu.*, u.fullname as user_fullname, u.employee_id as user_employee_id
            FROM production_users pu
            LEFT JOIN users_VSP u ON pu.user_id = u.id
            WHERE pu.module_id = ?
            ORDER BY pu.position, pu.created_at DESC
        `, [moduleId]);
        
        console.log(`✅ Trả về ${productionUsers.length} người dùng sản xuất cho module ${moduleId}`);
        res.json(productionUsers);
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách người dùng sản xuất:', error.message);
        res.status(500).json({ error: 'Không thể lấy danh sách người dùng sản xuất' });
    }
});

//TODO Tìm kiếm người dùng để thêm vào chức vụ========================================================================
router.get('/search-users', async (req, res) => {
    try {
        const { q, module_id } = req.query;
        console.log(`📡 GET /production-users/search-users được gọi với query: ${q}`);
        
        if (!q || q.trim().length < 2) {
            return res.json([]);
        }
        
        const searchTerm = `%${q.trim()}%`;
        
        // Tìm trong cả 2 bảng users
        const vspUsers = await db.allAsync(`
            SELECT id, employee_id, fullname, 'VSP' as factory
            FROM users_VSP 
            WHERE role != 'admin' 
            AND (fullname LIKE ? OR employee_id LIKE ?)
            AND id NOT IN (
                SELECT user_id FROM production_users WHERE module_id = ?
            )
            LIMIT 10
        `, [searchTerm, searchTerm, module_id || '']);
        
        const pvnUsers = await db.allAsync(`
            SELECT id, employee_id, fullname, 'PVN' as factory
            FROM users_PVN 
            WHERE role != 'admin' 
            AND (fullname LIKE ? OR employee_id LIKE ?)
            AND id NOT IN (
                SELECT user_id FROM production_users WHERE module_id = ?
            )
            LIMIT 10
        `, [searchTerm, searchTerm, module_id || '']);
        
        const allUsers = [...vspUsers, ...pvnUsers];
        
        console.log(`✅ Tìm thấy ${allUsers.length} người dùng phù hợp`);
        res.json(allUsers);
    } catch (error) {
        console.error('❌ Lỗi khi tìm kiếm người dùng:', error.message);
        res.status(500).json({ error: 'Không thể tìm kiếm người dùng' });
    }
});

//TODO Thêm người dùng vào chức vụ========================================================================
router.post('/add', async (req, res) => {
    try {
        const { user_id, module_id, position, factory } = req.body;
        console.log('📡 POST /production-users/add được gọi với data:', req.body);
        
        // Validate dữ liệu
        if (!user_id || !module_id || !position) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }
        
        // Kiểm tra người dùng đã tồn tại trong module chưa
        const existing = await db.getAsync(`
            SELECT id FROM production_users 
            WHERE user_id = ? AND module_id = ?
        `, [user_id, module_id]);
        
        if (existing) {
            return res.status(400).json({ error: 'Người dùng đã được thêm vào module này' });
        }
        
        // Lấy thông tin người dùng từ bảng phù hợp
        const tableName = factory === 'PVN' ? 'users_PVN' : 'users_VSP';
        const userInfo = await db.getAsync(`
            SELECT id, employee_id, fullname 
            FROM ${tableName} 
            WHERE id = ?
        `, [user_id]);
        
        if (!userInfo) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
        
        // Thêm người dùng vào chức vụ
        const productionUserId = Date.now().toString();
        await db.runAsync(`
            INSERT INTO production_users (id, user_id, module_id, position, factory, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            productionUserId,
            user_id,
            module_id,
            position,
            factory,
            new Date().toISOString()
        ]);
        
        // Trả về thông tin đã thêm
        const newRecord = await db.getAsync(`
            SELECT pu.*, u.fullname as user_fullname, u.employee_id as user_employee_id
            FROM production_users pu
            LEFT JOIN ${tableName} u ON pu.user_id = u.id
            WHERE pu.id = ?
        `, [productionUserId]);
        
        console.log('✅ Thêm người dùng sản xuất thành công:', newRecord);
        res.status(201).json({
            message: 'Thêm người dùng thành công',
            productionUser: newRecord
        });
    } catch (error) {
        console.error('❌ Lỗi khi thêm người dùng sản xuất:', error.message);
        res.status(500).json({ error: 'Không thể thêm người dùng' });
    }
});

//TODO Xóa người dùng khỏi chức vụ========================================================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📡 DELETE /production-users/${id} được gọi`);
        
        // Kiểm tra bản ghi có tồn tại không
        const existing = await db.getAsync(`
            SELECT pu.*, u.fullname as user_fullname, u.employee_id as user_employee_id
            FROM production_users pu
            LEFT JOIN users_VSP u ON pu.user_id = u.id AND pu.factory = 'VSP'
            LEFT JOIN users_PVN p ON pu.user_id = p.id AND pu.factory = 'PVN'
            WHERE pu.id = ?
        `, [id]);
        
        if (!existing) {
            return res.status(404).json({ error: 'Không tìm thấy bản ghi' });
        }
        
        // Xóa bản ghi
        const result = await db.runAsync(`
            DELETE FROM production_users WHERE id = ?
        `, [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Không thể xóa bản ghi' });
        }
        
        console.log(`✅ Xóa người dùng sản xuất thành công: ${existing.user_fullname}`);
        res.json({
            message: 'Xóa người dùng thành công',
            productionUser: existing
        });
    } catch (error) {
        console.error(`❌ Lỗi khi xóa người dùng sản xuất ID ${req.params.id}:`, error.message);
        res.status(500).json({ error: 'Không thể xóa người dùng' });
    }
});

//TODO Lấy danh sách người dùng theo chức vụ cụ thể========================================================================
router.get('/by-position/:moduleId/:position', async (req, res) => {
    try {
        const { moduleId, position } = req.params;
        console.log(`📡 GET /production-users/by-position/${moduleId}/${position} được gọi`);
        
        const users = await db.allAsync(`
            SELECT pu.*, 
                   CASE 
                       WHEN pu.factory = 'VSP' THEN v.fullname 
                       ELSE p.fullname 
                   END as user_fullname,
                   CASE 
                       WHEN pu.factory = 'VSP' THEN v.employee_id 
                       ELSE p.employee_id 
                   END as user_employee_id
            FROM production_users pu
            LEFT JOIN users_VSP v ON pu.user_id = v.id AND pu.factory = 'VSP'
            LEFT JOIN users_PVN p ON pu.user_id = p.id AND pu.factory = 'PVN'
            WHERE pu.module_id = ? AND pu.position = ?
            ORDER BY pu.created_at DESC
        `, [moduleId, position]);
        
        console.log(`✅ Trả về ${users.length} người dùng cho chức vụ ${position}`);
        res.json(users);
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách người dùng theo chức vụ:', error.message);
        res.status(500).json({ error: 'Không thể lấy danh sách người dùng theo chức vụ' });
    }
});

//TODO Test endpoint========================================================================
router.get('/test', (req, res) => {
    console.log('📡 /production-users/test được gọi');
    res.json({ 
        message: 'Production Users Management API hoạt động!',
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
    });
});

module.exports = router;