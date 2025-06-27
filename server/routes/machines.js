//! =================================================================
//! MACHINES API ROUTES - REAL DATABASE OPERATIONS
//  File: server/routes/machines.js
//  Phiên bản thực tế với database operations
//! =================================================================

const express = require('express');
const router = express.Router();
const { db } = require('../db');
// const { v4: uuidv4 } = require('uuid');

console.log('🚀 Machines routes loaded with real database operations');

//TODO Lấy danh sách tất cả máy========================================================================
router.get('/list', async (req, res) => {
    try {
        console.log('📡 GET /machines/list được gọi');
        
        let query = `
            SELECT id, name, location, status, description, department, system_id, module_id,
                   created_at, updated_at 
            FROM machines 
        `;
        
        const params = [];
        const conditions = [];
        
        // Lọc theo module_id nếu có
        if (req.query.module_id) {
            conditions.push('module_id = ?');
            params.push(req.query.module_id);
        }
        
        // Lọc theo system_id nếu có
        if (req.query.system_id) {
            conditions.push('system_id = ?');
            params.push(req.query.system_id);
        }
        
        // Thêm điều kiện WHERE nếu có
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY created_at DESC';
        
        const machines = await db.allAsync(query, params);
        
        console.log(`✅ Trả về ${machines.length} máy từ database`);
        res.json(machines);
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách máy:', error.message);
        res.status(500).json({ error: 'Không thể lấy danh sách máy' });
    }
});

//TODO Lấy danh sách máy đang hoạt động========================================================================
router.get('/active/list', async (req, res) => {
    try {
        console.log('📡 GET /machines/active/list được gọi');
        
        let query = `
        SELECT id, name, location, status, description, department, system_id, module_id,
               created_at, updated_at 
        FROM machines 
        WHERE status = 'active'
    `;
    
    const params = [];
    if (req.query.module_id) {
        query += ` AND module_id = ?`;
        params.push(req.query.module_id);
    } else if (req.query.system_id) {
        query += ` AND system_id = ?`;
        params.push(req.query.system_id);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const activeMachines = await db.allAsync(query, params);
        
        console.log(`✅ Trả về ${activeMachines.length} máy đang hoạt động`);
        res.json(activeMachines);
    } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách máy hoạt động:', error.message);
        res.status(500).json({ error: 'Không thể lấy danh sách máy hoạt động' });
    }
});

//TODO Lấy máy theo ID========================================================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📡 GET /machines/${id} được gọi`);
        
        const machine = await db.getAsync(`
            SELECT id, name, location, status, description, department, system_id, module_id,
                   created_at, updated_at 
            FROM machines 
            WHERE id = ?
        `, [id]);
        
        if (!machine) {
            return res.status(404).json({ error: 'Không tìm thấy máy' });
        }
        
        console.log(`✅ Trả về thông tin máy ID: ${id}`);
        res.json(machine);
    } catch (error) {
        console.error(`❌ Lỗi khi lấy máy ID ${req.params.id}:`, error.message);
        res.status(500).json({ error: 'Không thể lấy thông tin máy' });
    }
});



//TODO Lấy máy theo tên========================================================================
router.get('/by-name/:name', async (req, res) => {
    try {
        const { name } = req.params;
        console.log(`📡 GET /machines/by-name/${name} được gọi`);
        
        const machine = await db.getAsync(`
            SELECT id, name, location, status, description, department, system_id, module_id,
                   created_at, updated_at 
            FROM machines 
            WHERE name = ?
        `, [name]);
        
        if (!machine) {
            return res.status(404).json({ error: 'Không tìm thấy máy' });
        }
        
        console.log(`✅ Trả về thông tin máy: ${name}`);
        res.json(machine);
    } catch (error) {
        console.error(`❌ Lỗi khi lấy máy tên ${req.params.name}:`, error.message);
        res.status(500).json({ error: 'Không thể lấy thông tin máy' });
    }
});



//TODO Tạo máy mới========================================================================
router.post('/', async (req, res) => {
    try {
        console.log('📡 POST /machines được gọi với data:', req.body);
        
        const { name, location, status = 'active', description, department, system_id = 'sanxuat-nm1', module_id } = req.body;

        
        // Validate dữ liệu
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Tên máy là bắt buộc' });
        }
        
        // Kiểm tra trùng lặp tên máy
        const existingMachine = await db.getAsync(`
            SELECT id FROM machines WHERE name = ?
        `, [name.trim()]);
        
        if (existingMachine) {
            return res.status(400).json({ error: 'Tên máy đã tồn tại' });
        }
        
        
        
        // Tạo máy mới
        const machineId = Date.now().toString();
        const machineData = {
            id: machineId,
            name: name.trim(),
            location: location ? location.trim() : null,
            status: status,
            description: description ? description.trim() : null,
            department: department ? department.trim() : null,
            system_id: system_id, // Thêm dòng này
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        await db.runAsync(`
            INSERT INTO machines (id, name, location, status, description, department, system_id, module_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            machineData.id,
            machineData.name,
            machineData.location,
            machineData.status,
            machineData.description,
            machineData.department,
            machineData.system_id,
            module_id,  // THÊM DÒNG NÀY
            machineData.created_at,
            machineData.updated_at
        ]);
        
        console.log('✅ Tạo máy thành công:', machineData);
        
        res.status(201).json({
            message: 'Tạo máy thành công',
            machine: machineData
        });
    } catch (error) {
        console.error('❌ Lỗi khi tạo máy:', error.message);
        res.status(500).json({ error: 'Không thể tạo máy mới' });
    }
});

//TODO Cập nhật máy========================================================================
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, status, description, department } = req.body;
        
        console.log(`📡 PUT /machines/${id} được gọi với data:`, req.body);
        
        // Validate dữ liệu
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Tên máy là bắt buộc' });
        }
        
        // Kiểm tra máy có tồn tại không
        const existingMachine = await db.getAsync(`
            SELECT id FROM machines WHERE id = ?
        `, [id]);
        
        if (!existingMachine) {
            return res.status(404).json({ error: 'Không tìm thấy máy' });
        }
        
        // Kiểm tra trùng lặp tên máy (trừ chính nó)
        const duplicateName = await db.getAsync(`
            SELECT id FROM machines WHERE name = ? AND id != ?
        `, [name.trim(), id]);
        
        if (duplicateName) {
            return res.status(400).json({ error: 'Tên máy đã tồn tại' });
        }
        
        
        
        // Cập nhật máy
        await db.runAsync(`
            UPDATE machines 
            SET name = ?, location = ?, status = ?, description = ?, department = ?, updated_at = ?
            WHERE id = ?
        `, [
            name.trim(),
            location ? location.trim() : null,
            status || 'active',
            description ? description.trim() : null,
            department ? department.trim() : null,
            new Date().toISOString(),
            id
        ]);
        
        // Lấy thông tin máy sau khi cập nhật
        const updatedMachine = await db.getAsync(`
            SELECT id, name, location, status, description, department, 
                   created_at, updated_at 
            FROM machines 
            WHERE id = ?
        `, [id]);
        
        console.log('✅ Cập nhật máy thành công:', updatedMachine);
        
        res.json({
            message: 'Cập nhật máy thành công',
            machine: updatedMachine
        });
    } catch (error) {
        console.error(`❌ Lỗi khi cập nhật máy ID ${req.params.id}:`, error.message);
        res.status(500).json({ error: 'Không thể cập nhật máy' });
    }
});

//TODO Xóa máy========================================================================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📡 DELETE /machines/${id} được gọi`);
        
        // Kiểm tra máy có tồn tại không
        const existingMachine = await db.getAsync(`
            SELECT id, name FROM machines WHERE id = ?
        `, [id]);
        
        if (!existingMachine) {
            return res.status(404).json({ error: 'Không tìm thấy máy' });
        }
        
        // Xóa máy
        const result = await db.runAsync(`
            DELETE FROM machines WHERE id = ?
        `, [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Không thể xóa máy' });
        }
        
        console.log(`✅ Xóa máy thành công: ${existingMachine.name}`);
        
        res.json({
            message: 'Xóa máy thành công',
            machine: existingMachine
        });
    } catch (error) {
        console.error(`❌ Lỗi khi xóa máy ID ${req.params.id}:`, error.message);
        res.status(500).json({ error: 'Không thể xóa máy' });
    }
});

//TODO Test endpoint========================================================================
router.get('/test', (req, res) => {
    console.log('📡 /machines/test được gọi');
    res.json({ 
        message: 'Machines API hoạt động!',
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
    });
});

module.exports = router;