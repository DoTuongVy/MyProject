// Cập nhật file routes/cat.js

const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Lấy danh sách phiếu cắt
router.get('/list', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  db.all(`SELECT * FROM Danhsach_PC ORDER BY soPhieu, stt`, [], (err, rows) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách phiếu cắt:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lấy dữ liệu phiếu cắt' });
    }
    res.json(rows || []);
  });
});

// Lấy danh sách phiếu formula cắt
router.get('/formula', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  db.all(`SELECT * FROM PC_formula ORDER BY soPhieu, maNL`, [], (err, rows) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách formula cắt:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lấy dữ liệu formula cắt' });
    }
    res.json(rows || []);
  });
});

// Thêm một phiếu cắt mới
router.post('/', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const phieu = req.body;
  
  const sql = `INSERT INTO Danhsach_PC (
    id, r, soPhieu, ngayCT, soLSX, dienGiai, khachHang, sanPham, maPhu, lo, viTri,
    stt, maNL, slDat, dinhLuong, soTam, soCon, khoCat, daiCat, khoXen, daiXen,
    soLanXen, tlDuKien, tonSL, tonTL, tonTT, ghiChu
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [
    phieu.id,
    phieu.r,
    phieu.soPhieu,
    phieu.ngayCT,
    phieu.soLSX,
    phieu.dienGiai,
    phieu.khachHang,
    phieu.sanPham,
    phieu.maPhu,
    phieu.lo,
    phieu.viTri,
    phieu.stt,
    phieu.maNL,
    phieu.slDat,
    phieu.dinhLuong,
    phieu.soTam,
    phieu.soCon,
    phieu.khoCat,
    phieu.daiCat,
    phieu.khoXen,
    phieu.daiXen,
    phieu.soLanXen,
    phieu.tlDuKien,
    phieu.tonSL,
    phieu.tonTL,
    phieu.tonTT,
    phieu.ghiChu
  ], function(err) {
    if (err) {
      console.error('Lỗi khi thêm phiếu cắt:', err.message);
      return res.status(500).json({ error: 'Lỗi khi thêm phiếu cắt' });
    }
    
    // Tự động tạo formula từ phiếu mới thêm
    createFormulaFromPhieu(phieu, (err) => {
      if (err) {
        console.error('Lỗi khi tạo formula:', err);
        // Vẫn trả về thành công dù có lỗi khi tạo formula
      }
      
      res.json({ success: true, id: phieu.id });
    });
  });
});

// Cập nhật phiếu cắt
router.put('/:id', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  const phieu = req.body;
  
  const sql = `UPDATE Danhsach_PC SET
    r = ?, soPhieu = ?, ngayCT = ?, soLSX = ?, dienGiai = ?, khachHang = ?, sanPham = ?, maPhu = ?, lo = ?, viTri = ?,
    stt = ?, maNL = ?, slDat = ?, dinhLuong = ?, soTam = ?, soCon = ?, khoCat = ?, daiCat = ?, khoXen = ?, daiXen = ?,
    soLanXen = ?, tlDuKien = ?, tonSL = ?, tonTL = ?, tonTT = ?, ghiChu = ?
    WHERE id = ?`;
  
  db.run(sql, [
    phieu.r,
    phieu.soPhieu,
    phieu.ngayCT,
    phieu.soLSX,
    phieu.dienGiai,
    phieu.khachHang,
    phieu.sanPham,
    phieu.maPhu,
    phieu.lo,
    phieu.viTri,
    phieu.stt,
    phieu.maNL,
    phieu.slDat,
    phieu.dinhLuong,
    phieu.soTam,
    phieu.soCon,
    phieu.khoCat,
    phieu.daiCat,
    phieu.khoXen,
    phieu.daiXen,
    phieu.soLanXen,
    phieu.tlDuKien,
    phieu.tonSL,
    phieu.tonTL,
    phieu.tonTT,
    phieu.ghiChu,
    id
  ], function(err) {
    if (err) {
      console.error('Lỗi khi cập nhật phiếu cắt:', err.message);
      return res.status(500).json({ error: 'Lỗi khi cập nhật phiếu cắt' });
    }
    
    // Cập nhật formula tương ứng
    updateFormulaFromPhieu(phieu, (err) => {
      if (err) {
        console.error('Lỗi khi cập nhật formula:', err);
      }
      
      res.json({ success: true });
    });
  });
});

// Xóa phiếu cắt
router.delete('/:id', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  
  // Đầu tiên xóa formula (nếu có)
  db.run(`DELETE FROM PC_formula WHERE phieuId = ?`, [id], (err) => {
    if (err) {
      console.error('Lỗi khi xóa formula:', err.message);
      // Vẫn tiếp tục xóa phiếu chính
    }
    
    // Sau đó xóa phiếu
    db.run(`DELETE FROM Danhsach_PC WHERE id = ?`, [id], function(err) {
      if (err) {
        console.error('Lỗi khi xóa phiếu cắt:', err.message);
        return res.status(500).json({ error: 'Lỗi khi xóa phiếu cắt' });
      }
      
      res.json({ success: true, changes: this.changes });
    });
  });
});

// Xóa nhiều phiếu cắt
router.post('/delete-multiple', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Danh sách ID không hợp lệ' });
  }
  
  // Tạo tham số dấu ? cho câu truy vấn
  const placeholders = ids.map(() => '?').join(',');
  
  // Xóa formula trước
  db.run(`DELETE FROM PC_formula WHERE phieuId IN (${placeholders})`, ids, (err) => {
    if (err) {
      console.error('Lỗi khi xóa nhiều formula:', err.message);
    }
    
    // Sau đó xóa phiếu
    db.run(`DELETE FROM Danhsach_PC WHERE id IN (${placeholders})`, ids, function(err) {
      if (err) {
        console.error('Lỗi khi xóa nhiều phiếu cắt:', err.message);
        return res.status(500).json({ error: 'Lỗi khi xóa nhiều phiếu cắt' });
      }
      
      res.json({ success: true, changes: this.changes });
    });
  });
});

// Tìm kiếm phiếu cắt
router.get('/search', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { keyword } = req.query;
  
  if (!keyword) {
    return res.redirect('/api/cat/list');
  }
  
  const searchTerm = `%${keyword}%`;
  
  db.all(`SELECT * FROM Danhsach_PC 
    WHERE soPhieu LIKE ? OR khachHang LIKE ? OR maNL LIKE ? OR sanPham LIKE ?
    ORDER BY soPhieu, stt`, 
    [searchTerm, searchTerm, searchTerm, searchTerm], 
    (err, rows) => {
      if (err) {
        console.error('Lỗi khi tìm kiếm phiếu cắt:', err.message);
        return res.status(500).json({ error: 'Lỗi khi tìm kiếm phiếu cắt' });
      }
      
      res.json(rows || []);
    }
  );
});

// Hàm tiện ích để tạo formula từ phiếu
// Hàm tiện ích để tạo formula từ phiếu
function createFormulaFromPhieu(phieu, callback) {
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
  
  // Xử lý tỷ lệ Khổ cắt/khổ xén
  let tyLeKho = '';
  if (phieu.khoCat && phieu.khoXen && phieu.khoXen !== '0') {
    // Chuyển đổi sang số và làm tròn đến 2 chữ số thập phân
    const khoCat = parseFloat(formatNumberForFormula(phieu.khoCat));
    const khoXen = parseFloat(formatNumberForFormula(phieu.khoXen));
    
    if (!isNaN(khoCat) && !isNaN(khoXen) && khoXen !== 0) {
      tyLeKho = (khoCat / khoXen).toFixed(2);
    }
  }
  
  // Chuẩn bị mã khách hàng để tìm kiếm (loại bỏ dấu cách thừa)
  const maKhachHangTimKiem = (phieu.khachHang || '').trim();
  console.log(`Tìm kiếm khách hàng với mã: ${maKhachHangTimKiem}`);
  
  // Tìm thông tin khách hàng từ mã khách hàng
  // Phiếu cắt sử dụng mã khách thay vì tên - cải thiện tìm kiếm
  db.all(`SELECT * FROM customers 
          WHERE code LIKE ? 
          OR alias LIKE ? 
          OR name LIKE ?
          LIMIT 5`, 
    [`%${maKhachHangTimKiem}%`, `%${maKhachHangTimKiem}%`, `%${maKhachHangTimKiem}%`], 
    (err, customers) => {
      let maKH = '';
      let tenKhachHang = '';
      
      if (err) {
        console.error('Lỗi khi tìm khách hàng:', err.message);
      } else if (customers && customers.length > 0) {
        // Tìm kiếm khớp tốt nhất - ưu tiên exact match trước
        let bestMatch = null;
        
        // Tìm exact match cho code
        bestMatch = customers.find(c => 
          c.code.toLowerCase() === maKhachHangTimKiem.toLowerCase()
        );
        
        // Nếu không có exact match cho code, tìm exact match cho alias
        if (!bestMatch) {
          bestMatch = customers.find(c => 
            c.alias && c.alias.toLowerCase() === maKhachHangTimKiem.toLowerCase()
          );
        }
        
        // Nếu vẫn không tìm thấy, lấy kết quả đầu tiên
        if (!bestMatch) {
          bestMatch = customers[0];
          console.log(`Không tìm thấy khớp chính xác, sử dụng kết quả gần nhất: ${bestMatch.code}`);
        } else {
          console.log(`Tìm thấy khớp chính xác: ${bestMatch.code}`);
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
        console.log(`Không tìm thấy khách hàng với mã: ${maKhachHangTimKiem}`);
        
        // Tìm bằng LIKE với các từ riêng lẻ nếu mã khách hàng có độ dài đủ lớn
        if (maKhachHangTimKiem && maKhachHangTimKiem.length >= 3) {
          // Tìm kiếm mở rộng với các từ con trong mã khách hàng
          console.log(`Thử tìm kiếm mở rộng với: %${maKhachHangTimKiem}%`);
          
          db.all(`SELECT * FROM customers 
                  WHERE code LIKE ? OR alias LIKE ? 
                  LIMIT 5`, 
            [`%${maKhachHangTimKiem}%`, `%${maKhachHangTimKiem}%`], 
            (err, broadResults) => {
              if (!err && broadResults && broadResults.length > 0) {
                console.log(`Tìm thấy ${broadResults.length} kết quả với tìm kiếm mở rộng:`);
                broadResults.forEach((c, index) => {
                  console.log(`[${index+1}] ${c.name} (code: ${c.code}, alias: ${c.alias})`);
                });
                
                // Chọn kết quả đầu tiên
                const bestMatch = broadResults[0];
                maKH = bestMatch.alias || '';
                tenKhachHang = bestMatch.name;
                
                console.log(`Sử dụng kết quả tìm kiếm mở rộng: ${bestMatch.name} (${bestMatch.code})`);
              }
              
              // Tiếp tục xử lý với giá trị đã tìm được (hoặc giá trị mặc định)
              completeFormula();
            });
            return; // Chờ truy vấn thứ hai hoàn thành
        }
        
        // Nếu không có mã khách hàng đủ dài để tìm kiếm mở rộng
        completeFormula();
      }
      
      // Hoàn thành quy trình tạo formula nếu không có tìm kiếm bổ sung
      if (!err || !maKhachHangTimKiem || maKhachHangTimKiem.length < 3) {
        completeFormula();
      }
      
      // Hàm nội bộ để hoàn thành việc tạo formula
      function completeFormula() {
        // Tạo dữ liệu cho bảng formula
        const formulaData = {
          id: phieu.id + '_formula',
          ws: phieu.soLSX || '',
          soPhieu: phieu.soPhieu || '',
          maPhieuPhu: phieu.soPhieu + phieu.stt,
          phieu: '',
          wsF: phieu.soLSX || '',
          ngayCT: ngayChungTu,
          maKH: maKH,
          khachHang: tenKhachHang,
          maSP: phieu.sanPham || '',
          maNL: phieu.maNL || '',
          slDat: formatNumberForFormula(phieu.slDat),
          dinhLuong: formatNumberForFormula(phieu.dinhLuong),
          soTam: formatNumberForFormula(phieu.soTam),
          soCon: formatNumberForFormula(phieu.soCon),
          khoCat: formatNumberForFormula(phieu.khoCat),
          daiCat: formatNumberForFormula(phieu.daiCat),
          xa: '',
          khoXa: formatNumberForFormula(phieu.khoCat),
          tlDuTinh: formatNumberForFormula(phieu.tlDuKien),
          khoXen: formatNumberForFormula(phieu.khoXen),
          daiXen: formatNumberForFormula(phieu.daiXen),
          khoDaiKhoXen: tyLeKho,
          giayRam: phieu.ghiChu || '',
          dienGiai: phieu.dienGiai || '',
          phieuId: phieu.id
        };
        
        // Log dữ liệu formula trước khi lưu
        console.log('Formula data trước khi lưu:', formulaData);
        
        // Thêm dữ liệu vào bảng formula
        const sql = `INSERT INTO PC_formula (
          id, ws, soPhieu, maPhieuPhu, phieu, wsF, ngayCT, maKH, khachHang, maSP, maNL,
          slDat, dinhLuong, soTam, soCon, khoCat, daiCat, xa, khoXa, tlDuTinh, khoXen,
          daiXen, khoDaiKhoXen, giayRam, dienGiai, phieuId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [
          formulaData.id,
          formulaData.ws,
          formulaData.soPhieu,
          formulaData.maPhieuPhu,
          formulaData.phieu,
          formulaData.wsF,
          formulaData.ngayCT,
          formulaData.maKH,
          formulaData.khachHang,
          formulaData.maSP,
          formulaData.maNL,
          formulaData.slDat,
          formulaData.dinhLuong,
          formulaData.soTam,
          formulaData.soCon,
          formulaData.khoCat,
          formulaData.daiCat,
          formulaData.xa,
          formulaData.khoXa,
          formulaData.tlDuTinh,
          formulaData.khoXen,
          formulaData.daiXen,
          formulaData.khoDaiKhoXen,
          formulaData.giayRam,
          formulaData.dienGiai,
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
  db.run(`DELETE FROM PC_formula WHERE phieuId = ?`, [phieu.id], (err) => {
    if (err) {
      return callback(err);
    }
    
    // Tạo formula mới
    createFormulaFromPhieu(phieu, callback);
  });
}

// Hàm chuyển đổi định dạng số cho formula
function formatNumberForFormula(value) {
  // Kiểm tra nếu không phải là số
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  // Nếu là Boolean
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  
  // Chuyển đổi sang chuỗi để xử lý
  let strValue = String(value);
  
  // Loại bỏ tất cả các dấu phẩy trong chuỗi
  strValue = strValue.replace(/,/g, '');
  
  // Thay thế dấu chấm để xử lý số thập phân
  strValue = strValue.replace(/\./g, '.');
  
  // Chuyển đổi sang số
  let numValue = parseFloat(strValue);
  
  // Kiểm tra NaN
  if (isNaN(numValue)) {
    return value; // Trả về giá trị ban đầu nếu không phải số
  }
  
  // Làm tròn đến 1 số thập phân
  numValue = Math.round(numValue * 10) / 10;
  
  // Nếu phần thập phân là .0 thì xóa đi
  if (numValue % 1 === 0) {
    return numValue.toString();
  }
  
  return numValue.toString();
}

module.exports = router;