const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Lấy danh sách phiếu sang cuộn
router.get('/list', (req, res) => {
  db.all(`SELECT * FROM Danhsach_PSC ORDER BY soPhieu, sttXuat, sttNhap`, [], (err, rows) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách phiếu sang cuộn:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lấy dữ liệu phiếu sang cuộn' });
    }
    
    // Đảm bảo response luôn là JSON với UTF-8
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
      // Nếu không có dữ liệu, trả về mảng rỗng
      if (!rows || rows.length === 0) {
        return res.json([]);
      }
      
      // Chuyển đổi định dạng dữ liệu về cấu trúc cũ để tương thích với frontend
      const groupedData = {};
      
      rows.forEach(row => {
        const key = `${row.soPhieu}_${row.sttXuat}`;
        
        if (!groupedData[key]) {
          // Tạo phiếu mới
          groupedData[key] = {
            id: row.id,
            soPhieu: row.soPhieu,
            ngayCT: row.ngayCT,
            soLSX: row.soLSX,
            dienGiai: row.dienGiai,
            khachHang: row.khachHang,
            sanPham: row.sanPham,
            maPhu: row.maPhu,
            sttXuat: row.sttXuat,
            mhkx: row.mhkx,
            dlx: row.dlx,
            slXuat: row.slXuat,
            tlXuat: row.tlXuat,
            tonSL: row.tonSL,
            tonTL: row.tonTL,
            tonTT: row.tonTT,
            maNhaps: []
          };
        }
        
        // Nếu có mã nhập, thêm vào mảng mã nhập
        if (row.maHangNhap) {
          groupedData[key].maNhaps.push({
            sttNhap: row.sttNhap,
            maHangNhap: row.maHangNhap,
            slNhap: row.slNhap,
            tlNhap: row.tlNhap
          });
        }
      });
      
      // Chuyển object thành mảng để trả về
      const result = Object.values(groupedData);
      
      res.json(result);
    } catch (error) {
      console.error('Lỗi khi xử lý dữ liệu phiếu sang cuộn:', error);
      res.status(500).json({ error: 'Lỗi khi xử lý dữ liệu phiếu sang cuộn' });
    }
  });
});

// Lấy danh sách phiếu formula sang cuộn
router.get('/formula', (req, res) => {
  db.all(`SELECT * FROM PSC_formula ORDER BY soPhieu, maCanSang`, [], (err, rows) => {
    if (err) {
      console.error('Lỗi khi lấy formula sang cuộn:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lấy dữ liệu formula sang cuộn' });
    }
    
    // Đảm bảo response luôn là JSON với UTF-8
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(rows || []);
  });
});

// Thêm một phiếu sang cuộn mới
router.post('/', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const phieu = req.body;
  
  // Kiểm tra dữ liệu đầu vào
  if (!phieu || !phieu.soPhieu) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc của phiếu' });
  }
  
  // Nếu phiếu không có ID, tạo ID mới
  if (!phieu.id) {
    phieu.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
  
  // Lưu phiếu với từng mã nhập như các bản ghi riêng biệt
  const maNhaps = phieu.maNhaps || [];
  let mainPhieuId = phieu.id;
  
  // Nếu không có mã nhập nào, tạo một bản ghi với mã nhập trống
  if (maNhaps.length === 0) {
    db.run(`INSERT INTO Danhsach_PSC (
      id, soPhieu, ngayCT, soLSX, dienGiai, khachHang, sanPham, maPhu,
      sttXuat, mhkx, dlx, slXuat, tlXuat, sttNhap, maHangNhap, slNhap, tlNhap,
      tonSL, tonTL, tonTT
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      mainPhieuId,
      phieu.soPhieu,
      phieu.ngayCT,
      phieu.soLSX,
      phieu.dienGiai,
      phieu.khachHang,
      phieu.sanPham,
      phieu.maPhu,
      phieu.sttXuat,
      phieu.mhkx,
      phieu.dlx,
      phieu.slXuat,
      phieu.tlXuat,
      '', // sttNhap
      '', // maHangNhap
      '', // slNhap
      '', // tlNhap
      phieu.tonSL,
      phieu.tonTL,
      phieu.tonTT
    ], function(err) {
      if (err) {
        console.error('Lỗi khi thêm phiếu sang cuộn:', err.message);
        return res.status(500).json({ error: 'Lỗi khi thêm phiếu sang cuộn: ' + err.message });
      }
      
      // Tạo formula
      createFormulaFromPhieu({...phieu, id: mainPhieuId}, (err) => {
        if (err) {
          console.error('Lỗi khi tạo formula:', err);
        }
        
        res.json({ success: true, id: mainPhieuId });
      });
    });
  } else {
    // Đảm bảo mỗi mã nhập có một sttNhap
    maNhaps.forEach((maNhap, index) => {
      if (!maNhap.sttNhap) {
        maNhap.sttNhap = (index + 1).toString();
      }
    });
    
    // Nếu có mã nhập, thêm từng mã nhập
    const insertPromises = maNhaps.map((maNhap, index) => {
      return new Promise((resolve, reject) => {
        // Sử dụng ID của phiếu cho mã nhập đầu tiên để đại diện cho phiếu
        const rowId = index === 0 ? mainPhieuId : 
                               Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        db.run(`INSERT INTO Danhsach_PSC (
          id, soPhieu, ngayCT, soLSX, dienGiai, khachHang, sanPham, maPhu,
          sttXuat, mhkx, dlx, slXuat, tlXuat, sttNhap, maHangNhap, slNhap, tlNhap,
          tonSL, tonTL, tonTT
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
          rowId,
          phieu.soPhieu,
          phieu.ngayCT,
          phieu.soLSX,
          phieu.dienGiai,
          phieu.khachHang,
          phieu.sanPham,
          phieu.maPhu,
          phieu.sttXuat,
          phieu.mhkx,
          phieu.dlx,
          phieu.slXuat,
          phieu.tlXuat,
          maNhap.sttNhap,
          maNhap.maHangNhap,
          maNhap.slNhap,
          maNhap.tlNhap,
          phieu.tonSL,
          phieu.tonTL,
          phieu.tonTT
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
    
    // Xử lý tất cả các promise
    Promise.all(insertPromises)
      .then(() => {
        // Tạo formula
        createFormulaFromPhieu({...phieu, id: mainPhieuId}, (err) => {
          if (err) {
            console.error('Lỗi khi tạo formula:', err);
          }
          
          res.json({ success: true, id: mainPhieuId });
        });
      })
      .catch(err => {
        console.error('Lỗi khi thêm phiếu sang cuộn với mã nhập:', err.message);
        res.status(500).json({ error: 'Lỗi khi thêm phiếu sang cuộn với mã nhập: ' + err.message });
      });
  }
});

// Cập nhật phiếu sang cuộn
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const phieu = req.body;
  
  // Kiểm tra dữ liệu đầu vào
  if (!phieu || !phieu.soPhieu) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc của phiếu' });
  }
  
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Tìm tất cả các bản ghi liên quan đến phiếu này
  db.all(`SELECT * FROM Danhsach_PSC WHERE soPhieu = ? AND sttXuat = ?`, 
    [phieu.soPhieu, phieu.sttXuat], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Lỗi khi tìm phiếu sang cuộn để cập nhật: ' + err.message });
    }
    
    // Xóa tất cả các bản ghi cũ
    const idsToDelete = rows.map(row => row.id);
    if (idsToDelete.length > 0) {
      const placeholders = idsToDelete.map(() => '?').join(',');
      
      db.run(`DELETE FROM Danhsach_PSC WHERE id IN (${placeholders})`, idsToDelete, (err) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Lỗi khi xóa phiếu sang cuộn cũ: ' + err.message });
        }
        
        // Thêm các bản ghi mới
        const maNhaps = phieu.maNhaps || [];
        let mainPhieuId = id; // Giữ nguyên ID chính
        
        // Nếu không có mã nhập nào, tạo một bản ghi với mã nhập trống
        if (maNhaps.length === 0) {
          db.run(`INSERT INTO Danhsach_PSC (
            id, soPhieu, ngayCT, soLSX, dienGiai, khachHang, sanPham, maPhu,
            sttXuat, mhkx, dlx, slXuat, tlXuat, sttNhap, maHangNhap, slNhap, tlNhap,
            tonSL, tonTL, tonTT
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            mainPhieuId,
            phieu.soPhieu,
            phieu.ngayCT,
            phieu.soLSX,
            phieu.dienGiai,
            phieu.khachHang,
            phieu.sanPham,
            phieu.maPhu,
            phieu.sttXuat,
            phieu.mhkx,
            phieu.dlx,
            phieu.slXuat,
            phieu.tlXuat,
            '', // sttNhap
            '', // maHangNhap
            '', // slNhap
            '', // tlNhap
            phieu.tonSL,
            phieu.tonTL,
            phieu.tonTT
          ], function(err) {
            if (err) {
              console.error(err.message);
              return res.status(500).json({ error: 'Lỗi khi cập nhật phiếu sang cuộn: ' + err.message });
            }
            
            // Cập nhật formula
            updateFormulaFromPhieu(phieu, (err) => {
              if (err) {
                console.error('Lỗi khi cập nhật formula:', err);
              }
              
              res.json({ success: true });
            });
          });
        } else {
          // Đảm bảo mỗi mã nhập có một sttNhap
          maNhaps.forEach((maNhap, index) => {
            if (!maNhap.sttNhap) {
              maNhap.sttNhap = (index + 1).toString();
            }
          });
          
          // Nếu có mã nhập, thêm từng mã nhập
          const insertPromises = maNhaps.map((maNhap, index) => {
            return new Promise((resolve, reject) => {
              // Sử dụng ID chính cho mã nhập đầu tiên
              const rowId = index === 0 ? mainPhieuId : 
                                     Date.now().toString() + Math.random().toString(36).substr(2, 9);
              
              db.run(`INSERT INTO Danhsach_PSC (
                id, soPhieu, ngayCT, soLSX, dienGiai, khachHang, sanPham, maPhu,
                sttXuat, mhkx, dlx, slXuat, tlXuat, sttNhap, maHangNhap, slNhap, tlNhap,
                tonSL, tonTL, tonTT
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                rowId,
                phieu.soPhieu,
                phieu.ngayCT,
                phieu.soLSX,
                phieu.dienGiai,
                phieu.khachHang,
                phieu.sanPham,
                phieu.maPhu,
                phieu.sttXuat,
                phieu.mhkx,
                phieu.dlx,
                phieu.slXuat,
                phieu.tlXuat,
                maNhap.sttNhap,
                maNhap.maHangNhap,
                maNhap.slNhap,
                maNhap.tlNhap,
                phieu.tonSL,
                phieu.tonTL,
                phieu.tonTT
              ], function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          });
          
          // Xử lý tất cả các promise
          Promise.all(insertPromises)
            .then(() => {
              // Cập nhật formula
              updateFormulaFromPhieu(phieu, (err) => {
                if (err) {
                  console.error('Lỗi khi cập nhật formula:', err);
                }
                
                res.json({ success: true });
              });
            })
            .catch(err => {
              console.error(err.message);
              res.status(500).json({ error: 'Lỗi khi cập nhật phiếu sang cuộn với mã nhập: ' + err.message });
            });
        }
      });
    } else {
      res.status(404).json({ error: 'Không tìm thấy phiếu sang cuộn để cập nhật' });
    }
  });
});

// Xóa phiếu sang cuộn
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // Tìm thông tin phiếu
  db.get(`SELECT soPhieu, sttXuat FROM Danhsach_PSC WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Lỗi khi tìm thông tin phiếu: ' + err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Không tìm thấy phiếu sang cuộn' });
    }
    
    // Xóa formula
    db.run(`DELETE FROM PSC_formula WHERE phieuId = ?`, [id], (err) => {
      if (err) {
        console.error('Lỗi khi xóa formula:', err.message);
      }
      
      // Xóa tất cả các bản ghi có cùng số phiếu và STT xuất
      db.run(`DELETE FROM Danhsach_PSC WHERE soPhieu = ? AND sttXuat = ?`, 
        [row.soPhieu, row.sttXuat], function(err) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: 'Lỗi khi xóa phiếu sang cuộn: ' + err.message });
        }
        
        res.json({ success: true, changes: this.changes });
      });
    });
  });
});

// Xóa nhiều phiếu sang cuộn
router.post('/delete-multiple', (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Danh sách ID không hợp lệ' });
  }
  
  // Tìm thông tin các phiếu cần xóa
  const placeholders = ids.map(() => '?').join(',');
  
  db.all(`SELECT id, soPhieu, sttXuat FROM Danhsach_PSC WHERE id IN (${placeholders})`, 
    ids, (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Lỗi khi tìm thông tin phiếu: ' + err.message });
    }
    
    // Nhóm phiếu cần xóa theo cặp (soPhieu, sttXuat)
    const phieuToDelete = {};
    rows.forEach(row => {
      const key = `${row.soPhieu}_${row.sttXuat}`;
      phieuToDelete[key] = { soPhieu: row.soPhieu, sttXuat: row.sttXuat };
    });
    
    // Xóa formula trước
    db.run(`DELETE FROM PSC_formula WHERE phieuId IN (${placeholders})`, ids, (err) => {
      if (err) {
        console.error('Lỗi khi xóa nhiều formula:', err.message);
      }
      
      // Xóa tất cả phiếu đã chọn
      const deletePromises = Object.values(phieuToDelete).map(p => {
        return new Promise((resolve, reject) => {
          db.run(`DELETE FROM Danhsach_PSC WHERE soPhieu = ? AND sttXuat = ?`, 
            [p.soPhieu, p.sttXuat], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve(this.changes);
            }
          });
        });
      });
      
      // Xử lý tất cả các promise
      Promise.all(deletePromises)
        .then(changes => {
          const totalChanges = changes.reduce((sum, c) => sum + c, 0);
          res.json({ success: true, changes: totalChanges });
        })
        .catch(err => {
          console.error(err.message);
          res.status(500).json({ error: 'Lỗi khi xóa nhiều phiếu sang cuộn: ' + err.message });
        });
    });
  });
});

// Tìm kiếm phiếu sang cuộn
router.get('/search', (req, res) => {
  const { keyword } = req.query;
  
  if (!keyword) {
    return res.redirect('/api/sang-cuon/list');
  }
  
  const searchTerm = `%${keyword}%`;
  
  db.all(`SELECT * FROM Danhsach_PSC 
    WHERE soPhieu LIKE ? OR khachHang LIKE ? OR mhkx LIKE ? OR sanPham LIKE ?
    ORDER BY soPhieu, sttXuat`, 
    [searchTerm, searchTerm, searchTerm, searchTerm], 
    (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Lỗi khi tìm kiếm phiếu sang cuộn: ' + err.message });
      }
      
      // Đảm bảo response luôn là JSON với UTF-8
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      
      try {
        // Nếu không có dữ liệu, trả về mảng rỗng
        if (!rows || rows.length === 0) {
          return res.json([]);
        }
        
        // Chuyển đổi định dạng dữ liệu về cấu trúc cũ để tương thích với frontend
        const groupedData = {};
        
        rows.forEach(row => {
          const key = `${row.soPhieu}_${row.sttXuat}`;
          
          if (!groupedData[key]) {
            // Tạo phiếu mới
            groupedData[key] = {
              id: row.id,
              soPhieu: row.soPhieu,
              ngayCT: row.ngayCT,
              soLSX: row.soLSX,
              dienGiai: row.dienGiai,
              khachHang: row.khachHang,
              sanPham: row.sanPham,
              maPhu: row.maPhu,
              sttXuat: row.sttXuat,
              mhkx: row.mhkx,
              dlx: row.dlx,
              slXuat: row.slXuat,
              tlXuat: row.tlXuat,
              tonSL: row.tonSL,
              tonTL: row.tonTL,
              tonTT: row.tonTT,
              maNhaps: []
            };
          }
          
          // Nếu có mã nhập, thêm vào mảng mã nhập
          if (row.maHangNhap) {
            groupedData[key].maNhaps.push({
              sttNhap: row.sttNhap,
              maHangNhap: row.maHangNhap,
              slNhap: row.slNhap,
              tlNhap: row.tlNhap
            });
          }
        });
        
        // Chuyển object thành mảng để trả về
        const result = Object.values(groupedData);
        
        res.json(result);
      } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu tìm kiếm phiếu sang cuộn:', error);
        res.status(500).json({ error: 'Lỗi khi xử lý dữ liệu tìm kiếm phiếu sang cuộn: ' + error.message });
      }
    }
  );
});

// Hàm tiện ích để tạo formula từ phiếu
function createFormulaFromPhieu(phieu, callback) {
  // Kiểm tra phiếu
  if (!phieu || !phieu.soPhieu) {
    return callback(new Error('Phiếu không hợp lệ hoặc thiếu số phiếu'));
  }
  
  // Xử lý ngày chứng từ (dd/mm/yyyy)
  let ngayChungTu = phieu.ngayCT;
  if (!ngayChungTu) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    ngayChungTu = dd + '/' + mm + '/' + yyyy;
  } else {
    // Chuyển đổi từ định dạng yyyy-mm-dd sang dd/mm/yyyy nếu cần
    const parts = ngayChungTu.split('-');
    if (parts.length === 3) {
      ngayChungTu = parts[2] + '/' + parts[1] + '/' + parts[0];
    }
  }
  
  // Xử lý khổ cần sang - loại bỏ số 0 ở đầu
  let khoCanSang = '';
  if (phieu.maNhaps && phieu.maNhaps.length > 1) {
    khoCanSang = phieu.maNhaps.map(maNhap => {
      // Giả sử mã hàng nhập có dạng GCKKAP-0120-1850-0000
      const parts = maNhap.maHangNhap ? maNhap.maHangNhap.split('-') : [];
      if (parts.length >= 3) {
        // Lấy phần FFFF và loại bỏ số 0 ở đầu
        const kho = parts[2];
        return kho ? parseInt(kho, 10).toString() : '';
      }
      return '';
    }).filter(k => k).join('+');
  }
  
  // Xử lý khổ - loại bỏ số 0 ở đầu
  let kho = '';
  if (phieu.maNhaps && phieu.maNhaps.length > 0) {
    const parts = phieu.maNhaps[0].maHangNhap ? phieu.maNhaps[0].maHangNhap.split('-') : [];
    if (parts.length >= 3) {
      // Lấy phần FFFF và loại bỏ số 0 ở đầu
      const rawKho = parts[2];
      kho = rawKho ? parseInt(rawKho, 10).toString() : '';
    }
  }
  
  // Chuẩn bị tên khách hàng để tìm kiếm (loại bỏ dấu cách thừa, chuyển về chữ thường)
  const tenKhachHangTimKiem = (phieu.khachHang || '').trim().replace(/\s+/g, '%');
  const searchPattern = `%${tenKhachHangTimKiem}%`;
  
  console.log(`Tìm kiếm khách hàng với pattern: ${searchPattern}`);
  
  // Tìm kiếm mềm dẻo hơn với LIKE
  db.all(`SELECT * FROM customers 
          WHERE name LIKE ? 
          OR alias LIKE ? 
          OR code LIKE ?
          LIMIT 5`, 
    [searchPattern, searchPattern, searchPattern], 
    (err, customers) => {
      let maKH = '';
      let tenKhachHang = phieu.khachHang || '';
      
      if (err) {
        console.error('Lỗi khi tìm khách hàng:', err.message);
      } else if (customers && customers.length > 0) {
        // Tìm kiếm khớp tốt nhất - ưu tiên exact match trước
        let bestMatch = null;
        
        // Tìm exact match cho name
        bestMatch = customers.find(c => 
          c.name.toLowerCase() === (phieu.khachHang || '').toLowerCase()
        );
        
        // Nếu không có exact match cho name, tìm match gần nhất
        if (!bestMatch) {
          bestMatch = customers[0]; // Lấy kết quả đầu tiên làm mặc định
          
          console.log(`Không tìm thấy khớp chính xác, sử dụng kết quả gần nhất: ${bestMatch.name}`);
        } else {
          console.log(`Tìm thấy khớp chính xác: ${bestMatch.name}`);
        }
        
        // Sử dụng thông tin từ kết quả tốt nhất
        maKH = bestMatch.alias || '';
        tenKhachHang = bestMatch.name;
        
        // Log thông tin chi tiết
        console.log('Thông tin khách hàng:', {
          id: bestMatch.id,
          code: bestMatch.code,
          name: bestMatch.name,
          alias: bestMatch.alias
        });
        console.log('Đã set maKH =', maKH);
        
        // Hiển thị tất cả các kết quả tìm thấy để debug
        if (customers.length > 1) {
          console.log(`Tìm thấy ${customers.length} kết quả phù hợp:`);
          customers.forEach((c, index) => {
            console.log(`[${index+1}] ${c.name} (code: ${c.code}, alias: ${c.alias})`);
          });
        }
      } else {
        console.log(`Không tìm thấy khách hàng với tên: ${phieu.khachHang}`);
        
        // Tìm bằng LIKE với các từ riêng lẻ
        if (phieu.khachHang && phieu.khachHang.length > 0) {
          const words = phieu.khachHang.split(/\s+/).filter(w => w.length >= 3);
          if (words.length > 0) {
            // Tạo truy vấn với từng từ có độ dài >= 3 ký tự
            const likeConditions = words.map(w => `name LIKE '%${w}%'`).join(' OR ');
            
            console.log(`Thử tìm kiếm mở rộng với điều kiện: ${likeConditions}`);
            
            db.all(`SELECT * FROM customers WHERE ${likeConditions} LIMIT 5`, [], (err, broadResults) => {
              if (!err && broadResults && broadResults.length > 0) {
                console.log(`Tìm thấy ${broadResults.length} kết quả với tìm kiếm mở rộng:`);
                broadResults.forEach((c, index) => {
                  console.log(`[${index+1}] ${c.name} (code: ${c.code}, alias: ${c.alias})`);
                });
                
                // Không tự động chọn kết quả để tránh kết quả sai
                console.log('Không tự động chọn kết quả để tránh gán sai thông tin.');
              }
              
              // Tiếp tục xử lý với giá trị mặc định
              completeFormula();
            });
            return; // Chờ truy vấn thứ hai hoàn thành
          }
        }
        
        // Nếu không có từ nào để tìm kiếm mở rộng
        completeFormula();
      }
      
      // Hoàn thành quy trình tạo formula nếu không có tìm kiếm bổ sung
      if (!err || !phieu.khachHang || phieu.khachHang.split(/\s+/).filter(w => w.length >= 3).length === 0) {
        completeFormula();
      }
      
      // Hàm nội bộ để hoàn thành việc tạo formula
      function completeFormula() {
        // Tạo dữ liệu cho bảng formula
        const formulaData = {
          id: phieu.id + '_formula',
          soLSX: phieu.soLSX || '',
          soPhieu: phieu.soPhieu || '',
          phieuPhu: phieu.soPhieu + phieu.sttXuat,
          phieu: '',
          ws: phieu.soLSX || '',
          ngayCT: ngayChungTu,
          maKH: maKH,
          khachHang: tenKhachHang,
          maSP: phieu.sanPham || '',
          mhkx: phieu.mhkx || '',
          slDon: '',
          dlXuat: phieu.dlx || '',
          tongSLGiay: '',
          soCon: '',
          kho: kho,
          khoCanSang: khoCanSang,
          trongLuong: phieu.tlXuat || '',
          slXuat: phieu.slXuat || '',
          maCanSang: phieu.maNhaps && phieu.maNhaps.length > 0 ? phieu.maNhaps[0].maHangNhap || '' : '',
          slNhap: phieu.maNhaps && phieu.maNhaps.length > 0 ? phieu.maNhaps[0].slNhap || '' : '',
          tongKhoNhap: phieu.maNhaps && phieu.maNhaps.length > 0 ? phieu.maNhaps[0].slNhap || '' : '',
          phieuId: phieu.id
        };
        
        // Thêm dữ liệu vào bảng formula
        const sql = `INSERT INTO PSC_formula (
          id, soLSX, soPhieu, phieuPhu, phieu, ws, ngayCT, maKH, khachHang, maSP, mhkx, slDon, dlXuat,
          tongSLGiay, soCon, kho, khoCanSang, trongLuong, slXuat, maCanSang, slNhap, tongKhoNhap, phieuId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [
          formulaData.id,
          formulaData.soLSX,
          formulaData.soPhieu,
          formulaData.phieuPhu,
          formulaData.phieu,
          formulaData.ws,
          formulaData.ngayCT,
          formulaData.maKH,
          formulaData.khachHang,
          formulaData.maSP,
          formulaData.mhkx,
          formulaData.slDon,
          formulaData.dlXuat,
          formulaData.tongSLGiay,
          formulaData.soCon,
          formulaData.kho,
          formulaData.khoCanSang,
          formulaData.trongLuong,
          formulaData.slXuat,
          formulaData.maCanSang,
          formulaData.slNhap,
          formulaData.tongKhoNhap,
          formulaData.phieuId
        ], function(err) {
          if (err) {
            console.error('Lỗi khi lưu formula:', err.message);
          } else {
            console.log('Đã lưu formula thành công:', formulaData.id);
          }
          callback(err);
        });
      }
    }
  );
}

// Hàm tiện ích để cập nhật formula từ phiếu
function updateFormulaFromPhieu(phieu, callback) {
  // Xóa formula cũ
  db.run(`DELETE FROM PSC_formula WHERE phieuId = ?`, [phieu.id], (err) => {
    if (err) {
      return callback(err);
    }
    
    // Tạo formula mới
    createFormulaFromPhieu(phieu, callback);
  });
}


module.exports = router;