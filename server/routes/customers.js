// Cập nhật file routes/customers.js

const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Lấy danh sách khách hàng
router.get('/list', (req, res) => {
  db.all(`SELECT * FROM customers ORDER BY code`, [], (err, rows) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách khách hàng:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lấy danh mục khách hàng' });
    }
    
    // Đảm bảo response luôn là JSON với UTF-8
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(rows || []);
  });
});

// Thêm nhiều khách hàng (import)
router.post('/import', (req, res) => {
  // Đảm bảo response luôn là JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    const customers = req.body.customers;
    
    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu khách hàng không hợp lệ' });
    }
    
    // Log để debug
    console.log('Importing customers:', customers.length);
    console.log('First customer example:', customers[0]);
    
    // Xóa tất cả khách hàng hiện có
    db.run(`DELETE FROM customers`, [], (err) => {
      if (err) {
        console.error('Lỗi khi xóa dữ liệu khách hàng cũ:', err.message);
        return res.status(500).json({ error: 'Lỗi khi xóa dữ liệu khách hàng cũ' });
      }
      
      // Bắt đầu transaction để đảm bảo tính nhất quán
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          console.error('Lỗi khi bắt đầu transaction:', err.message);
          return res.status(500).json({ error: 'Lỗi khi bắt đầu quá trình import' });
        }
        
        // Số lượng thêm thành công và lỗi
        let successCount = 0;
        let errorCount = 0;
        let lastError = null;
        
        // Số queries đã hoàn thành
        let completedQueries = 0;
        
        // Thêm từng khách hàng vào database
        customers.forEach(customer => {
          const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
          
          // Đảm bảo dữ liệu hợp lệ
          const code = (customer.code || '').toString();
          const name = (customer.name || '').toString();
          const alias = (customer.alias || '').toString();
          
          db.run(`INSERT INTO customers (id, code, name, alias)
            VALUES (?, ?, ?, ?)`,
            [id, code, name, alias],
            function(err) {
              completedQueries++;
              
              if (err) {
                errorCount++;
                lastError = err;
                console.error('Lỗi khi thêm khách hàng:', code, name, err.message);
              } else {
                successCount++;
              }
              
              // Kiểm tra đã xử lý tất cả queries chưa
              if (completedQueries === customers.length) {
                if (errorCount > 0) {
                  // Có lỗi, rollback transaction
                  db.run('ROLLBACK', () => {
                    console.error('Đã rollback transaction do lỗi');
                    res.status(500).json({ 
                      error: `Lỗi khi import dữ liệu: ${lastError ? lastError.message : 'Unknown error'}` 
                    });
                  });
                } else {
                  // Không có lỗi, commit transaction
                  db.run('COMMIT', (err) => {
                    if (err) {
                      console.error('Lỗi khi commit transaction:', err.message);
                      db.run('ROLLBACK', () => {
                        res.status(500).json({ error: 'Lỗi khi hoàn tất quá trình import' });
                      });
                    } else {
                      console.log(`Đã import thành công ${successCount}/${customers.length} khách hàng`);
                      res.json({ 
                        success: true,
                        message: `Đã nhập ${successCount} khách hàng thành công`
                      });
                    }
                  });
                }
              }
            }
          );
        });
      });
    });
  } catch (error) {
    console.error('Lỗi không mong đợi trong import:', error);
    res.status(500).json({ error: 'Lỗi không mong muốn khi xử lý dữ liệu: ' + error.message });
  }
});

// Cập nhật khách hàng
router.put('/:id', (req, res) => {
  // Đảm bảo response luôn là JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  const { code, name, alias } = req.body;
  
  if (!code || !name) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin bắt buộc' });
  }
  
  db.run(`UPDATE customers SET code = ?, name = ?, alias = ? WHERE id = ?`,
    [code, name, alias || '', id],
    function(err) {
      if (err) {
        console.error('Lỗi khi cập nhật khách hàng:', err.message);
        return res.status(500).json({ error: 'Lỗi khi cập nhật khách hàng' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
      }
      
      res.json({ 
        success: true,
        message: 'Đã cập nhật khách hàng thành công' 
      });
    }
  );
});

// Xóa khách hàng
router.delete('/:id', (req, res) => {
  // Đảm bảo response luôn là JSON
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  
  db.run(`DELETE FROM customers WHERE id = ?`,
    [id],
    function(err) {
      if (err) {
        console.error('Lỗi khi xóa khách hàng:', err.message);
        return res.status(500).json({ error: 'Lỗi khi xóa khách hàng' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Không tìm thấy khách hàng' });
      }
      
      res.json({ 
        success: true,
        message: 'Đã xóa khách hàng thành công' 
      });
    }
  );
});

// Tìm khách hàng theo mã
router.get('/find-by-code', (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Mã khách hàng không được để trống' });
  }
  
  db.get(`SELECT * FROM customers WHERE code = ?`, 
    [code], 
    (err, customer) => {
      if (err) {
        console.error('Lỗi khi tìm khách hàng theo mã:', err.message);
        return res.status(500).json({ error: 'Lỗi khi tìm khách hàng' });
      }
      
      res.json(customer || null);
    }
  );
});

// Tìm khách hàng theo tên
router.get('/find-by-name', (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    return res.status(400).json({ error: 'Tên khách hàng không được để trống' });
  }
  
  db.get(`SELECT * FROM customers WHERE name = ? OR alias = ?`, 
    [name, name], 
    (err, customer) => {
      if (err) {
        console.error('Lỗi khi tìm khách hàng theo tên:', err.message);
        return res.status(500).json({ error: 'Lỗi khi tìm khách hàng' });
      }
      
      res.json(customer || null);
    }
  );
});

module.exports = router;