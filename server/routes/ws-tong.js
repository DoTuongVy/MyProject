const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Lấy danh sách WS Tổng
router.get('/list', async (req, res) => {
  try {
    const wsTongList = await db.allAsync(`
      SELECT * FROM ws_tong 
      ORDER BY created_at DESC
    `);
    
    res.json(wsTongList);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách WS Tổng:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Không thể lấy danh sách WS Tổng: ' + error.message 
    });
  }
});

// Import danh sách WS Tổng từ Excel
router.post('/import', async (req, res) => {
  try {
    const { wsTongList } = req.body;
    
    if (!wsTongList || !Array.isArray(wsTongList)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dữ liệu không hợp lệ' 
      });
    }
    
    // Xóa dữ liệu cũ (nếu cần thay thế hoàn toàn)
    await db.runAsync('DELETE FROM ws_tong');
    
    // Thêm dữ liệu mới
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const item of wsTongList) {
      try {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        
        await db.runAsync(`
          INSERT INTO ws_tong (
            id, so_ws, so_po, khach_hang, ma_sp, sl_dh, s_con, so_mau_in,
            ma_khuon_be_dut, ma_khuon_be_noi, be_noi_be_dut, loai_can_phu,
            mang_acetat, qc_dan_lg, qc_dong_goi, thung_or_giay_goi,
            loai_giay_1, kho_1, chat_1, kg_1, loai_giay_2, kho_giay_2, kg_2,
            loai_giay_3, kho_giay_3, kg_3, chat_3, kho_3, chat_4, kho_4,
            loai_song, chat_5, kho_5, chat_6, kho_6, cong_doan_san_xuat_1,
            ngay_nhan_ws, sl_giay_can_cat, cong_doan_san_xuat_2, sl_bu_hao_in,
            sl_bu_hao_t_pham, sl_giay, sl_cat_giay, sl_giay_kh, gia_cong_in,
            gia_cong_ep_kim, gia_cong_can_phu, gia_cong_be) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
        `, [
          id, item.so_ws || '', item.so_po || '', item.khach_hang || '', 
          item.ma_sp || '', item.sl_dh || '', item.s_con || '', item.so_mau_in || '',
          item.ma_khuon_be_dut || '', item.ma_khuon_be_noi || '', item.be_noi_be_dut || '',
          item.loai_can_phu || '', item.mang_acetat || '', item.qc_dan_lg || '',
          item.qc_dong_goi || '', item.thung_or_giay_goi || '', item.loai_giay_1 || '',
          item.kho_1 || '', item.chat_1 || '', item.kg_1 || '', item.loai_giay_2 || '',
          item.kho_giay_2 || '', item.kg_2 || '', item.loai_giay_3 || '', 
          item.kho_giay_3 || '', item.kg_3 || '', item.chat_3 || '', item.kho_3 || '',
          item.chat_4 || '', item.kho_4 || '', item.loai_song || '', item.chat_5 || '',
          item.kho_5 || '', item.chat_6 || '', item.kho_6 || '', item.cong_doan_san_xuat_1 || '',
          item.ngay_nhan_ws || '', item.sl_giay_can_cat || '', item.cong_doan_san_xuat_2 || '',
          item.sl_bu_hao_in || '', item.sl_bu_hao_t_pham || '', item.sl_giay || '',
          item.sl_cat_giay || '', item.sl_giay_kh || '', item.gia_cong_in || '',
          item.gia_cong_ep_kim || '', item.gia_cong_can_phu || '', item.gia_cong_be || ''
        ]);
        
        successCount++;
      } catch (error) {
        console.error('Lỗi khi thêm WS Tổng:', error);
        errorCount++;
        errors.push(`Lỗi với WS ${item.so_ws || 'không xác định'}: ${error.message}`);
      }
    }
    
    console.log(`Import WS Tổng hoàn tất: ${successCount} thành công, ${errorCount} lỗi`);
    
    if (errors.length > 0) {
      console.error('Chi tiết lỗi:', errors);
    }
    
    res.json({
      success: true,
      message: `Đã import ${successCount} bản ghi WS Tổng thành công${errorCount > 0 ? `, ${errorCount} lỗi` : ''}`,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Lỗi khi import WS Tổng:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Không thể import WS Tổng: ' + error.message 
    });
  }
});



// API tìm kiếm WS theo số WS
router.get('/search', async (req, res) => {
  try {
    const { so_ws } = req.query;
    
    if (!so_ws) {
      return res.status(400).json({ error: 'Thiếu tham số số WS' });
    }
    
    const wsData = await db.allAsync(`
      SELECT * FROM ws_tong 
      WHERE so_ws LIKE ? 
      ORDER BY created_at DESC
      LIMIT 10
    `, [`%${so_ws}%`]);
    
    res.json(wsData);
  } catch (error) {
    console.error('Lỗi khi tìm kiếm WS:', error);
    res.status(500).json({ 
      error: 'Không thể tìm kiếm WS: ' + error.message 
    });
  }
});


// Lấy thông tin WS Tổng theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const wsTong = await db.getAsync(`
      SELECT * FROM ws_tong WHERE id = ?
    `, [id]);
    
    if (!wsTong) {
      return res.status(404).json({ 
        success: false, 
        error: 'Không tìm thấy WS Tổng' 
      });
    }
    
    res.json({
      success: true,
      data: wsTong
    });
    
  } catch (error) {
    console.error('Lỗi khi lấy thông tin WS Tổng:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Không thể lấy thông tin WS Tổng: ' + error.message 
    });
  }
});







// Cập nhật WS Tổng theo ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Kiểm tra WS Tổng có tồn tại không
    const existingWsTong = await db.getAsync(`
      SELECT id FROM ws_tong WHERE id = ?
    `, [id]);
    
    if (!existingWsTong) {
      return res.status(404).json({ 
        success: false, 
        error: 'Không tìm thấy WS Tổng để cập nhật' 
      });
    }
    
    // Cập nhật thông tin
    await db.runAsync(`
      UPDATE ws_tong SET
        so_ws = ?, so_po = ?, khach_hang = ?, ma_sp = ?, sl_dh = ?, s_con = ?, so_mau_in = ?,
        ma_khuon_be_dut = ?, ma_khuon_be_noi = ?, be_noi_be_dut = ?, loai_can_phu = ?,
        mang_acetat = ?, qc_dan_lg = ?, qc_dong_goi = ?, thung_or_giay_goi = ?,
        loai_giay_1 = ?, kho_1 = ?, chat_1 = ?, kg_1 = ?, loai_giay_2 = ?, kho_giay_2 = ?, kg_2 = ?,
        loai_giay_3 = ?, kho_giay_3 = ?, kg_3 = ?, chat_3 = ?, kho_3 = ?, chat_4 = ?, kho_4 = ?,
        loai_song = ?, chat_5 = ?, kho_5 = ?, chat_6 = ?, kho_6 = ?, cong_doan_san_xuat_1 = ?,
        ngay_nhan_ws = ?, sl_giay_can_cat = ?, cong_doan_san_xuat_2 = ?, sl_bu_hao_in = ?,
        sl_bu_hao_t_pham = ?, sl_giay = ?, sl_cat_giay = ?, sl_giay_kh = ?, gia_cong_in = ?,
        gia_cong_ep_kim = ?, gia_cong_can_phu = ?, gia_cong_be = ?
      WHERE id = ?
    `, [
      updateData.so_ws || '', updateData.so_po || '', updateData.khach_hang || '', 
      updateData.ma_sp || '', updateData.sl_dh || '', updateData.s_con || '', updateData.so_mau_in || '',
      updateData.ma_khuon_be_dut || '', updateData.ma_khuon_be_noi || '', updateData.be_noi_be_dut || '',
      updateData.loai_can_phu || '', updateData.mang_acetat || '', updateData.qc_dan_lg || '',
      updateData.qc_dong_goi || '', updateData.thung_or_giay_goi || '', updateData.loai_giay_1 || '',
      updateData.kho_1 || '', updateData.chat_1 || '', updateData.kg_1 || '', updateData.loai_giay_2 || '',
      updateData.kho_giay_2 || '', updateData.kg_2 || '', updateData.loai_giay_3 || '', 
      updateData.kho_giay_3 || '', updateData.kg_3 || '', updateData.chat_3 || '', updateData.kho_3 || '',
      updateData.chat_4 || '', updateData.kho_4 || '', updateData.loai_song || '', updateData.chat_5 || '',
      updateData.kho_5 || '', updateData.chat_6 || '', updateData.kho_6 || '', updateData.cong_doan_san_xuat_1 || '',
      updateData.ngay_nhan_ws || '', updateData.sl_giay_can_cat || '', updateData.cong_doan_san_xuat_2 || '',
      updateData.sl_bu_hao_in || '', updateData.sl_bu_hao_t_pham || '', updateData.sl_giay || '',
      updateData.sl_cat_giay || '', updateData.sl_giay_kh || '', updateData.gia_cong_in || '',
      updateData.gia_cong_ep_kim || '', updateData.gia_cong_can_phu || '', updateData.gia_cong_be || '',
      id
    ]);
    
    res.json({
      success: true,
      message: 'Đã cập nhật WS Tổng thành công'
    });
    
  } catch (error) {
    console.error('Lỗi khi cập nhật WS Tổng:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Không thể cập nhật WS Tổng: ' + error.message 
    });
  }
});

// Xóa WS Tổng theo ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra WS Tổng có tồn tại không
    const existingWsTong = await db.getAsync(`
      SELECT id FROM ws_tong WHERE id = ?
    `, [id]);
    
    if (!existingWsTong) {
      return res.status(404).json({ 
        success: false, 
        error: 'Không tìm thấy WS Tổng để xóa' 
      });
    }
    
    // Xóa WS Tổng
    await db.runAsync(`DELETE FROM ws_tong WHERE id = ?`, [id]);
    
    res.json({
      success: true,
      message: 'Đã xóa WS Tổng thành công'
    });
    
  } catch (error) {
    console.error('Lỗi khi xóa WS Tổng:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Không thể xóa WS Tổng: ' + error.message 
    });
  }
});

// Xóa tất cả WS Tổng (để làm mới dữ liệu)
router.delete('/', async (req, res) => {
  try {
    await db.runAsync(`DELETE FROM ws_tong`);
    
    res.json({
      success: true,
      message: 'Đã xóa tất cả dữ liệu WS Tổng thành công'
    });
    
  } catch (error) {
    console.error('Lỗi khi xóa tất cả WS Tổng:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Không thể xóa dữ liệu WS Tổng: ' + error.message 
    });
  }
});




module.exports = router;