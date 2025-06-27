const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Lấy danh sách module
router.get('/list', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const systemId = req.query.system_id;
  
  let sql = `SELECT m.*, s.name as system_name 
             FROM modules m
             LEFT JOIN systems s ON m.system_id = s.id`;
  
  if (systemId) {
    sql += ` WHERE m.system_id = ?`;
    
    db.all(sql, [systemId], (err, rows) => {
      if (err) {
        console.error('Lỗi khi lấy danh sách module:', err.message);
        return res.status(500).json({ error: 'Lỗi khi lấy danh sách module' });
      }
      res.json(rows || []);
    });
  } else {
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Lỗi khi lấy danh sách module:', err.message);
        return res.status(500).json({ error: 'Lỗi khi lấy danh sách module' });
      }
      res.json(rows || []);
    });
  }
});

// Thêm module mới
router.post('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { system_id, name, description, path, icon } = req.body;
  
  if (!system_id || !name || !path) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
  }
  
  // Kiểm tra hệ thống tồn tại
  db.get(`SELECT * FROM systems WHERE id = ?`, [system_id], (err, system) => {
    if (err) {
      console.error('Lỗi khi kiểm tra hệ thống:', err.message);
      return res.status(500).json({ error: 'Lỗi khi kiểm tra hệ thống' });
    }
    
    if (!system) {
      return res.status(404).json({ error: 'Không tìm thấy hệ thống' });
    }
    
    const id = Date.now().toString();
    
    db.run(`INSERT INTO modules (id, system_id, name, description, path, icon)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [id, system_id, name, description || '', path, icon || ''],
      function(err) {
        if (err) {
          console.error('Lỗi khi thêm module:', err.message);
          return res.status(500).json({ error: 'Lỗi khi thêm module' });
        }
        
        res.json({ 
          success: true, 
          id: id,
          message: 'Đã thêm module thành công' 
        });
      }
    );
  });
});

// Cập nhật module
router.put('/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  const { system_id, name, description, path, icon } = req.body;
  
  if (!system_id || !name || !path) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
  }
  
  // Kiểm tra hệ thống tồn tại
  db.get(`SELECT * FROM systems WHERE id = ?`, [system_id], (err, system) => {
    if (err) {
      console.error('Lỗi khi kiểm tra hệ thống:', err.message);
      return res.status(500).json({ error: 'Lỗi khi kiểm tra hệ thống' });
    }
    
    if (!system) {
      return res.status(404).json({ error: 'Không tìm thấy hệ thống' });
    }
    
    db.run(`UPDATE modules SET system_id = ?, name = ?, description = ?, path = ?, icon = ? WHERE id = ?`,
      [system_id, name, description || '', path, icon || '', id],
      function(err) {
        if (err) {
          console.error('Lỗi khi cập nhật module:', err.message);
          return res.status(500).json({ error: 'Lỗi khi cập nhật module' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Không tìm thấy module' });
        }
        
        res.json({ 
          success: true,
          message: 'Đã cập nhật module thành công' 
        });
      }
    );
  });
});

// Xóa module
router.delete('/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  
  // Xóa quyền module
  db.run(`DELETE FROM user_module_permissions WHERE module_id = ?`, [id], (err) => {
    if (err) {
      console.error('Lỗi khi xóa quyền module:', err.message);
      // Vẫn tiếp tục xóa module
    }
    
    // Xóa module
    db.run(`DELETE FROM modules WHERE id = ?`, [id], function(err) {
      if (err) {
        console.error('Lỗi khi xóa module:', err.message);
        return res.status(500).json({ error: 'Lỗi khi xóa module' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Không tìm thấy module' });
      }
      
      res.json({ 
        success: true,
        message: 'Đã xóa module thành công' 
      });
    });
  });
});

module.exports = router;