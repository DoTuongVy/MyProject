const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Lấy danh sách phòng ban
router.get('/list', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Thêm DISTINCT để đảm bảo không trùng lặp
  db.all(`SELECT DISTINCT id, name, description, created_at FROM departments ORDER BY name`, [], (err, rows) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách phòng ban:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lấy danh sách phòng ban' });
    }
    
    // Thêm bước lọc để đảm bảo không có tên phòng ban trùng lặp
    const uniqueDepartments = [];
    const deptNames = new Set();
    
    rows.forEach(dept => {
      if (!deptNames.has(dept.name)) {
        deptNames.add(dept.name);
        uniqueDepartments.push(dept);
      } else {
        console.log(`Loại bỏ phòng ban trùng lặp: ${dept.name}`);
      }
    });
    
    res.json(uniqueDepartments || []);
  });
});

// Thêm phòng ban mới
router.post('/', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ 
          success: false,
          error: 'Vui lòng nhập tên phòng ban' 
        });
      }
      
      // Kiểm tra trùng tên
      const existingDept = await db.getAsync(
        `SELECT * FROM departments WHERE name = ?`, 
        [name]
      );
      
      if (existingDept) {
        return res.status(400).json({ 
          success: false,
          error: 'Tên phòng ban đã tồn tại' 
        });
      }
      
      // Generate a good unique ID
      const id = `dept_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      
      // Thêm phòng ban mới
      await db.runAsync(
        `INSERT INTO departments (id, name, description) VALUES (?, ?, ?)`,
        [id, name, description || '']
      );
      
      console.log(`Đã thêm phòng ban mới: ${name} (ID: ${id})`);
      
      res.json({ 
        success: true,
        id: id,
        message: 'Đã thêm phòng ban thành công' 
      });
    } catch (error) {
      console.error('Lỗi khi thêm phòng ban:', error);
      res.status(500).json({ 
        success: false,
        error: 'Lỗi khi thêm phòng ban: ' + error.message 
      });
    }
  });

// Cập nhật phòng ban
router.put('/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ 
          success: false,
          error: 'Vui lòng nhập tên phòng ban' 
        });
      }
      
      // Kiểm tra trùng tên với phòng ban khác
      const existingDept = await db.getAsync(
        `SELECT * FROM departments WHERE name = ? AND id != ?`, 
        [name, id]
      );
      
      if (existingDept) {
        return res.status(400).json({ 
          success: false,
          error: 'Tên phòng ban đã tồn tại' 
        });
      }
      
      // Kiểm tra phòng ban tồn tại
      const currentDept = await db.getAsync(
        `SELECT * FROM departments WHERE id = ?`, 
        [id]
      );
      
      if (!currentDept) {
        return res.status(404).json({ 
          success: false,
          error: 'Không tìm thấy phòng ban' 
        });
      }
      
      // Cập nhật phòng ban
      await db.runAsync(
        `UPDATE departments SET name = ?, description = ? WHERE id = ?`,
        [name, description || '', id]
      );
      
      console.log(`Đã cập nhật phòng ban ID ${id}: ${name}`);
      
      res.json({ 
        success: true,
        message: 'Đã cập nhật phòng ban thành công' 
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật phòng ban:', error);
      res.status(500).json({ 
        success: false,
        error: 'Lỗi khi cập nhật phòng ban: ' + error.message 
      });
    }
  });

// Xóa phòng ban
router.delete('/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  
  // Kiểm tra xem có người dùng thuộc phòng ban này không
  db.get(`SELECT name FROM departments WHERE id = ?`, [id], (err, dept) => {
    if (err) {
      console.error('Lỗi khi kiểm tra phòng ban:', err.message);
      return res.status(500).json({ error: 'Lỗi khi kiểm tra phòng ban' });
    }
    
    if (!dept) {
      return res.status(404).json({ error: 'Không tìm thấy phòng ban' });
    }
    
    // Kiểm tra có người dùng thuộc phòng ban này không
    db.get(`SELECT COUNT(*) as count FROM users_VSP WHERE department = ? 
            UNION ALL
            SELECT COUNT(*) as count FROM users_PVN WHERE department = ?`, 
      [dept.name, dept.name], (err, result) => {
      if (err) {
        console.error('Lỗi khi kiểm tra người dùng:', err.message);
        return res.status(500).json({ error: 'Lỗi khi kiểm tra người dùng' });
      }
      
      if (result && result.count > 0) {
        return res.status(400).json({ error: 'Không thể xóa phòng ban vì có người dùng thuộc phòng ban này' });
      }
      
      // Xóa phòng ban
      db.run(`DELETE FROM departments WHERE id = ?`, [id], function(err) {
        if (err) {
          console.error('Lỗi khi xóa phòng ban:', err.message);
          return res.status(500).json({ error: 'Lỗi khi xóa phòng ban' });
        }
        
        res.json({ 
          success: true,
          message: 'Đã xóa phòng ban thành công' 
        });
      });
    });
  });
});

module.exports = router;