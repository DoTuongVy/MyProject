const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Lấy danh sách định mức
router.get('/list', (req, res) => {
  db.all(`SELECT * FROM dinh_muc ORDER BY ma_giay`, [], (err, rows) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách định mức:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lấy danh sách định mức' });
    }
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(rows || []);
  });
});

// Thêm nhiều định mức (import)
router.post('/import', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    const dinhMucList = req.body.dinhMucList;
    
    if (!dinhMucList || !Array.isArray(dinhMucList) || dinhMucList.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu định mức không hợp lệ' });
    }
    
    // Xóa tất cả định mức hiện có
    db.run(`DELETE FROM dinh_muc`, [], (err) => {
      if (err) {
        console.error('Lỗi khi xóa dữ liệu định mức cũ:', err.message);
        return res.status(500).json({ error: 'Lỗi khi xóa dữ liệu định mức cũ' });
      }
      
      // Bắt đầu transaction
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          console.error('Lỗi khi bắt đầu transaction:', err.message);
          return res.status(500).json({ error: 'Lỗi khi bắt đầu quá trình import' });
        }
        
        let successCount = 0;
        let errorCount = 0;
        let lastError = null;
        let completedQueries = 0;
        
        dinhMucList.forEach(item => {
          const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
          
          db.run(`INSERT INTO dinh_muc (id, ma_giay, dinh_luong, so_to_pallet_gmc1, do_day_giay_gmc1, chieu_cao_pallet_gmc1, ky_tu_11_gmc1,
            ma_giay_gmc2, dinh_luong_gmc2, so_to_pallet_gmc2, do_day_giay_gmc2, chieu_cao_pallet_gmc2, ky_tu_11_gmc2)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, 
            item.ma_giay || '', 
            item.dinh_luong || '', 
            item.so_to_pallet_gmc1 || '', 
            item.do_day_giay_gmc1 || '', 
            item.chieu_cao_pallet_gmc1 || '', 
            item.ky_tu_11_gmc1 || '',
            item.ma_giay_gmc2 || '', 
            item.dinh_luong_gmc2 || '', 
            item.so_to_pallet_gmc2 || '', 
            item.do_day_giay_gmc2 || '', 
            item.chieu_cao_pallet_gmc2 || '', 
            item.ky_tu_11_gmc2 || ''
          ],
          function(err) {
              completedQueries++;
              
              if (err) {
                errorCount++;
                lastError = err;
                console.error('Lỗi khi thêm định mức:', item.ma_giay, err.message);
              } else {
                successCount++;
              }
              
              if (completedQueries === dinhMucList.length) {
                if (errorCount > 0) {
                  db.run('ROLLBACK', () => {
                    console.error('Đã rollback transaction do lỗi');
                    res.status(500).json({ 
                      error: `Lỗi khi import dữ liệu: ${lastError ? lastError.message : 'Unknown error'}` 
                    });
                  });
                } else {
                  db.run('COMMIT', (err) => {
                    if (err) {
                      console.error('Lỗi khi commit transaction:', err.message);
                      db.run('ROLLBACK', () => {
                        res.status(500).json({ error: 'Lỗi khi hoàn tất quá trình import' });
                      });
                    } else {
                      console.log(`Đã import thành công ${successCount}/${dinhMucList.length} định mức`);
                      res.json({ 
                        success: true,
                        message: `Đã nhập ${successCount} định mức thành công`
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

// Cập nhật định mức
router.put('/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  const { ma_giay, dinh_luong, so_to_pallet_gmc1, do_day_giay, chieu_cao_pallet, ky_tu_11 } = req.body;
  
  if (!ma_giay) {
    return res.status(400).json({ error: 'Vui lòng nhập mã giấy' });
  }
  
  db.run(`UPDATE dinh_muc SET ma_giay = ?, dinh_luong = ?, so_to_pallet_gmc1 = ?, do_day_giay = ?, chieu_cao_pallet = ?, ky_tu_11 = ? WHERE id = ?`,
    [ma_giay, dinh_luong || '', so_to_pallet_gmc1 || '', do_day_giay || '', chieu_cao_pallet || '', ky_tu_11 || '', id],
    function(err) {
      if (err) {
        console.error('Lỗi khi cập nhật định mức:', err.message);
        return res.status(500).json({ error: 'Lỗi khi cập nhật định mức' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Không tìm thấy định mức' });
      }
      
      res.json({ 
        success: true,
        message: 'Đã cập nhật định mức thành công' 
      });
    }
  );
});

// Xóa định mức
router.delete('/:id', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  
  db.run(`DELETE FROM dinh_muc WHERE id = ?`,
    [id],
    function(err) {
      if (err) {
        console.error('Lỗi khi xóa định mức:', err.message);
        return res.status(500).json({ error: 'Lỗi khi xóa định mức' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Không tìm thấy định mức' });
      }
      
      res.json({ 
        success: true,
        message: 'Đã xóa định mức thành công' 
      });
    }
  );
});

module.exports = router;