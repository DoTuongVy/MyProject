const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Lấy danh sách hệ thống
router.get('/list', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Sửa thành DISTINCT để đảm bảo không lấy trùng lặp
  db.all(`SELECT DISTINCT id, name, description, icon, created_at 
          FROM systems ORDER BY name`, [], (err, rows) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách hệ thống:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lấy danh sách hệ thống' });
    }
    
    // Thêm bước xử lý để loại bỏ các trùng lặp (nếu có)
    const uniqueSystems = [];
    const systemNames = new Set();
    
    for (const system of rows) {
      if (!systemNames.has(system.name)) {
        systemNames.add(system.name);
        uniqueSystems.push(system);
      } else {
        console.log(`Phát hiện hệ thống trùng lặp trong API: ${system.name}, ID=${system.id}`);
      }
    }
    
    res.json(uniqueSystems || []);
  });
});

// Thêm hệ thống mới
router.post('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { name, description, icon } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Vui lòng nhập tên hệ thống' });
  }
  
  const id = Date.now().toString();
  
  db.run(`INSERT INTO systems (id, name, description, icon)
    VALUES (?, ?, ?, ?)`,
    [id, name, description || '', icon || ''],
    function(err) {
      if (err) {
        console.error('Lỗi khi thêm hệ thống:', err.message);
        return res.status(500).json({ error: 'Lỗi khi thêm hệ thống' });
      }
      
      res.json({ 
        success: true, 
        id: id,
        message: 'Đã thêm hệ thống thành công' 
      });
    }
  );
});

// Cập nhật hệ thống
router.put('/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  const { name, description, icon } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Vui lòng nhập tên hệ thống' });
  }
  
  db.run(`UPDATE systems SET name = ?, description = ?, icon = ? WHERE id = ?`,
    [name, description || '', icon || '', id],
    function(err) {
      if (err) {
        console.error('Lỗi khi cập nhật hệ thống:', err.message);
        return res.status(500).json({ error: 'Lỗi khi cập nhật hệ thống' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Không tìm thấy hệ thống' });
      }
      
      res.json({ 
        success: true,
        message: 'Đã cập nhật hệ thống thành công' 
      });
    }
  );
});

// Xóa hệ thống
router.delete('/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  
  // Kiểm tra xem có module nào thuộc hệ thống không
  db.get(`SELECT COUNT(*) as count FROM modules WHERE system_id = ?`, [id], (err, result) => {
    if (err) {
      console.error('Lỗi khi kiểm tra module:', err.message);
      return res.status(500).json({ error: 'Lỗi khi kiểm tra module' });
    }
    
    if (result.count > 0) {
      return res.status(400).json({ error: 'Không thể xóa hệ thống vì có module thuộc hệ thống này' });
    }
    
    // Xóa quyền phòng ban
    db.run(`DELETE FROM department_system_permissions WHERE system_id = ?`, [id], (err) => {
      if (err) {
        console.error('Lỗi khi xóa quyền phòng ban:', err.message);
        // Vẫn tiếp tục xóa hệ thống
      }
      
      // Xóa hệ thống
      db.run(`DELETE FROM systems WHERE id = ?`, [id], function(err) {
        if (err) {
          console.error('Lỗi khi xóa hệ thống:', err.message);
          return res.status(500).json({ error: 'Lỗi khi xóa hệ thống' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Không tìm thấy hệ thống' });
        }
        
        res.json({ 
          success: true,
          message: 'Đã xóa hệ thống thành công' 
        });
      });
    });
  });
});

module.exports = router;