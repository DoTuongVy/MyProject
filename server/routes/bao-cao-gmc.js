const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Hàm làm tròn theo yêu cầu (x.2 -> x.0, x.6 -> x+1.0, x.5 giữ nguyên)
function customRound(num, digits = 0) {
    if (isNaN(num)) return 0;
    
    console.log(`🔍 customRound input: ${num}, digits: ${digits}`);
    
    // Chuyển sang số nguyên để tránh lỗi floating point
    const multiplier = Math.pow(10, digits);
    console.log(`🔍 multiplier: ${multiplier}`);
    
    const shifted = num * multiplier;
    console.log(`🔍 shifted: ${shifted}`);
    
    let result;
    // Dùng Math.round thay vì Math.floor/Math.ceil phức tạp
    result = Math.round(shifted) / multiplier;
    
    console.log(`🔍 customRound result: ${result}`);
    return result;
}

// ===== THÊM MỚI: HÀM LÀM TRÒN LÊN CHO SỐ TẤM THAM CHIẾU =====
function roundUp(num) {
    if (isNaN(num)) return 0;
    
    const numValue = parseFloat(num);
    if (isNaN(numValue)) return 0;
    
    console.log(`🔍 roundUp input: ${numValue} -> result: ${Math.ceil(numValue)}`);
    return Math.ceil(numValue); // Làm tròn lên: 2.2 -> 3, 2.8 -> 3
}

// Hàm tính số tấm xén theo công thức yêu cầu
function tinhSoTamXen(kho, khoXen, dai, daiXen, soTamCatDuoc, xaDoi) {
    if (!kho || !khoXen || !dai || !daiXen || !soTamCatDuoc) {
        return soTamCatDuoc;
    }

    // Chuyển đổi sang số - dùng đúng tên biến
    const Q = parseFloat(kho);        // Q = KHỔ - tương ứng với cột khổ trong báo cáo
    const AH = parseFloat(khoXen);    // AH = KHỔ XÉN
    const R = parseFloat(dai);        // R = DÀI - tương ứng với cột dài trong báo cáo
    const AI = parseFloat(daiXen);    // AI = DÀI XÉN
    const T = parseFloat(soTamCatDuoc); // T = SỐ TẤM CẮT ĐƯỢC
    const AD = parseInt(xaDoi) || 0;  // AD = XẢ ĐÔI

    console.log("=== DEBUG BACKEND TÍNH SỐ TẤM XÉN ===");
    console.log("Q (KHỔ):", Q);
    console.log("AH (KHỔ XÉN):", AH);
    console.log("R (DÀI):", R);
    console.log("AI (DÀI XÉN):", AI);
    console.log("T (SỐ TẤM CẮT ĐƯỢC):", T);
    console.log("AD (XẢ ĐÔI):", AD);

    // Tính tỷ lệ
    const tyLeKho = Q / AH;
    const tyLeDai = R / AI;
    
    console.log("Tỷ lệ khổ (Q/AH):", tyLeKho);
    console.log("Tỷ lệ dài (R/AI):", tyLeDai);

    // Áp dụng công thức Excel chính xác
    // Điều kiện 1: AD=0 và cả khổ và dài đều trong khoảng 1.95-2.08
    if (AD === 0 && 
        (tyLeKho >= 1.95 && tyLeKho <= 2.08) && 
        (tyLeDai >= 1.95 && tyLeDai <= 2.08)) {
        console.log("✓ Điều kiện 1: AD=0, cả khổ và dài 1.95-2.08 -> T*4 =", T * 4);
        return T * 4;
    }

    // Điều kiện 2: AD=0 và (khổ HOẶC dài) trong khoảng 1.95-2.08
    if (AD === 0 && 
        ((tyLeKho >= 1.95 && tyLeKho <= 2.08) || (tyLeDai >= 1.95 && tyLeDai <= 2.08))) {
        console.log("✓ Điều kiện 2: AD=0, khổ HOẶC dài 1.95-2.08 -> T*2 =", T * 2);
        return T * 2;
    }

    // Điều kiện 3: AD=1 và (khổ HOẶC dài) trong khoảng 1.95-2.08
    if (AD === 1 && 
        ((tyLeKho >= 1.95 && tyLeKho <= 2.08) || (tyLeDai >= 1.95 && tyLeDai <= 2.08))) {
        console.log("✓ Điều kiện 3: AD=1, khổ HOẶC dài 1.95-2.08 -> T =", T);
        return T;
    }

    // Điều kiện 4: AD=1 và (khổ HOẶC dài) trong khoảng 2.98-3.08
    if (AD === 1 && 
        ((tyLeKho >= 2.98 && tyLeKho <= 3.08) || (tyLeDai >= 2.98 && tyLeDai <= 3.08))) {
        console.log("✓ Điều kiện 4: AD=1, khổ HOẶC dài 2.98-3.08 -> T + T/2 =", T + T / 2);
        return T + T / 2;
    }

    // Điều kiện 5: AD=0 và (khổ HOẶC dài) trong khoảng 2.98-3.08
    if (AD === 0 && 
        ((tyLeKho >= 2.98 && tyLeKho <= 3.08) || (tyLeDai >= 2.98 && tyLeDai <= 3.08))) {
        console.log("✓ Điều kiện 5: AD=0, khổ HOẶC dài 2.98-3.08 -> T*3 =", T * 3);
        return T * 3;
    }

    // Điều kiện 6: AD=1 và (khổ HOẶC dài) trong khoảng 3.98-4.08
    if (AD === 1 && 
        ((tyLeKho >= 3.98 && tyLeKho <= 4.08) || (tyLeDai >= 3.98 && tyLeDai <= 4.08))) {
        console.log("✓ Điều kiện 6: AD=1, khổ HOẶC dài 3.98-4.08 -> T*2 =", T * 2);
        return T * 2;
    }

    // Điều kiện 7: AD=0 và cả khổ và dài đều trong khoảng 3.98-4.08
    if (AD === 0 && 
        (tyLeKho >= 3.98 && tyLeKho <= 4.08) && 
        (tyLeDai >= 3.98 && tyLeDai <= 4.08)) {
        console.log("✓ Điều kiện 7: AD=0, cả khổ và dài 3.98-4.08 -> T*4 =", T * 4);
        return T * 4;
    }

    // Mặc định: trả về T
    console.log("✓ Mặc định: không thỏa mãn điều kiện nào -> T =", T);
    return T;
}


// API cập nhật báo cáo GMC từ formula phiếu cắt
router.put('/update-formula/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id || !updateData) {
        return res.status(400).json({ error: 'Dữ liệu cập nhật không hợp lệ' });
    }
    
    try {
        // Lấy báo cáo hiện tại
        const currentReport = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM bao_cao_gmc WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!currentReport) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo GMC' });
        }
        
        console.log('=== DEBUG UPDATE FORMULA ===');
        console.log('Current report:', currentReport);
        console.log('Update data:', updateData);
        
        // Chuẩn bị câu lệnh SQL cập nhật
        let updateSQL = 'UPDATE bao_cao_gmc SET ';
        const updateValues = [];
        const updateFields = [];
        
        // ===== SỬA LỖI: CẬP NHẬT WS =====
        if (updateData.so_ws && (!currentReport.so_ws || currentReport.so_ws === '')) {
            updateFields.push('so_ws = ?');
            updateValues.push(updateData.so_ws);
            console.log('Cập nhật WS:', updateData.so_ws);
        }
        
        // Cập nhật mã giấy
        if (updateData.ma_giay && (!currentReport.ma_giay || currentReport.ma_giay === '')) {
            updateFields.push('ma_giay = ?');
            updateValues.push(updateData.ma_giay);
            console.log('Cập nhật mã giấy:', updateData.ma_giay);
        }
        
        // Cập nhật khách hàng
        if (updateData.khach_hang && (!currentReport.khach_hang || currentReport.khach_hang === '')) {
            updateFields.push('khach_hang = ?');
            updateValues.push(updateData.khach_hang);
        }
        
        // Cập nhật định lượng
        if (updateData.dinh_luong && (!currentReport.dinh_luong || currentReport.dinh_luong === '')) {
            updateFields.push('dinh_luong = ?');
            updateValues.push(updateData.dinh_luong);
            console.log('Cập nhật định lượng:', updateData.dinh_luong);
        }


        // Cập nhật số tấm
if (updateData.so_tam && (!currentReport.so_tam || currentReport.so_tam === '')) {
    updateFields.push('so_tam = ?');
    updateValues.push(updateData.so_tam);
    console.log('Cập nhật số tấm:', updateData.so_tam);
}

        
        // ===== SỬA LỖI 2B: CẬP NHẬT ĐÚNG CỘT KHỔ GỐC VÀ DÀI =====
        if (updateData.kho_mm && (!currentReport.kho_mm || currentReport.kho_mm === '')) {
            updateFields.push('kho_mm = ?');
            updateValues.push(updateData.kho_mm);
            console.log('Cập nhật khổ gốc vào kho_mm:', updateData.kho_mm);
        }
        
        if (updateData.dai_mm && (!currentReport.dai_mm || currentReport.dai_mm === '')) {
            updateFields.push('dai_mm = ?');
            updateValues.push(updateData.dai_mm);
            console.log('Cập nhật dài vào dai_mm:', updateData.dai_mm);
        }
        
        // ===== SỬA LỖI 2A: TÍNH KHỔ CẮT THEO XẢ ĐÔI =====
        // Lấy mã giấy mới hoặc hiện tại
        const maGiayToUse = updateData.ma_giay || currentReport.ma_giay;
        const xaDoi = parseInt(currentReport.xa_doi) || 0; // Lấy xả đôi từ báo cáo hiện tại
        
        console.log('Mã giấy để tính khổ cắt:', maGiayToUse);
        console.log('Xả đôi từ báo cáo:', xaDoi);
        
        if (maGiayToUse && (!currentReport.kho_cat || currentReport.kho_cat === '')) {
            const parts = maGiayToUse.split('-');
            if (parts.length >= 3) {
                const ffff = parts[2]; // Lấy phần FFFF
                const khoNumber = parseInt(ffff, 10);
                
                if (!isNaN(khoNumber)) {
                    let khoCat;
                    if (xaDoi === 1) {
                        // Xả đôi - chia đôi
                        khoCat = Math.floor(khoNumber / 2);
                        console.log(`Tính khổ cắt (xả đôi): ${khoNumber} / 2 = ${khoCat}`);
                    } else {
                        // Không xả đôi - giữ nguyên
                        khoCat = khoNumber;
                        console.log(`Tính khổ cắt (không xả đôi): ${khoCat}`);
                    }
                    
                    updateFields.push('kho_cat = ?');
                    updateValues.push(khoCat.toString());
                    console.log('Cập nhật khổ cắt:', khoCat);
                    
                    // Nếu chưa có khổ gốc, cập nhật luôn
                    if (!updateData.kho_mm && (!currentReport.kho_mm || currentReport.kho_mm === '')) {
                        updateFields.push('kho_mm = ?');
                        updateValues.push(khoNumber.toString());
                        console.log('Cập nhật khổ gốc từ mã giấy:', khoNumber);
                    }
                }
            }
        }
        
        // ===== CẬP NHẬT KHỔ XÉN VÀ DÀI XÉN =====
        if (updateData.kho_xen && (!currentReport.kho_xen || currentReport.kho_xen === '')) {
            updateFields.push('kho_xen = ?');
            updateValues.push(updateData.kho_xen);
            console.log('Cập nhật khổ xén:', updateData.kho_xen);
        }
        
        if (updateData.dai_xen && (!currentReport.dai_xen || currentReport.dai_xen === '')) {
            updateFields.push('dai_xen = ?');
            updateValues.push(updateData.dai_xen);
            console.log('Cập nhật dài xén:', updateData.dai_xen);
        }
        
        // ===== NÂNG CẤP: TỰ ĐỘNG LẤY SỐ TỜ/PALLET TỪ ĐỊNH MỨC =====
        const newMaGiay = updateData.ma_giay || currentReport.ma_giay;
        const may = currentReport.may;
        
        if (newMaGiay && may && (!currentReport.so_to_pallet || currentReport.so_to_pallet === '')) {
            try {
                console.log(`🔄 Tự động lấy số tờ/pallet từ định mức cho mã giấy: ${newMaGiay}, máy: ${may}`);
                
                // Lấy dữ liệu định mức
                const dinhMucList = await new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM dinh_muc`, [], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    });
                });
                
                // Lấy phần AABBCD-EEEE từ mã giấy
                const maGiayParts = newMaGiay.split('-');
                if (maGiayParts.length >= 2) {
                    const maGiayPrefix = `${maGiayParts[0]}-${maGiayParts[1]}`;
                    console.log(`🔍 Tìm định mức cho mã giấy: ${maGiayPrefix}`);
                    
                    // Tìm định mức khớp
                    const matchedDinhMuc = dinhMucList.find(dinhMuc => {
                        const dinhMucMaGiay = dinhMuc.ma_giay || '';
                        return dinhMucMaGiay === maGiayPrefix;
                    });

                    if (matchedDinhMuc) {
                        // Lấy số tờ/pallet theo máy
                        let soToPallet = '';
                        if (may === 'GMC 1' && matchedDinhMuc.so_to_pallet_gmc1) {
                            soToPallet = matchedDinhMuc.so_to_pallet_gmc1;
                        } else if (may === 'GMC 2' && matchedDinhMuc.so_to_pallet_gmc2) {
                            soToPallet = matchedDinhMuc.so_to_pallet_gmc2;
                        }

                        if (soToPallet && soToPallet.trim() !== '') {
                            updateFields.push('so_to_pallet = ?');
                            updateValues.push(soToPallet);
                            console.log(`✅ Tự động cập nhật số tờ/pallet từ định mức: ${soToPallet}`);
                        }
                        
                        // ===== SỬA LỖI 2C: TÍNH TL TRẢ DỰ KIẾN CHO PHIẾU BỔ SUNG SAU =====
                        // Lấy độ dày để tính TL trả dự kiến
                        let doDay = 0;
                        if (may === 'GMC 1' && matchedDinhMuc.do_day_giay_gmc1) {
                            doDay = parseFloat(matchedDinhMuc.do_day_giay_gmc1);
                        } else if (may === 'GMC 2' && matchedDinhMuc.do_day_giay_gmc2) {
                            doDay = parseFloat(matchedDinhMuc.do_day_giay_gmc2);
                        }

                        // Tính TL trả dự kiến nếu có đủ dữ liệu
                        const tln = parseFloat(currentReport.trong_luong_nhan || '0');
                        const soTam = parseFloat(currentReport.so_tam_cat_duoc || '0');
                        const dai = parseFloat(updateData.dai_mm || currentReport.dai_mm || '0');
                        const dinhLuong = parseFloat(updateData.dinh_luong || currentReport.dinh_luong || '0');
                        const dauCuon = parseFloat(currentReport.dau_cuon_kg || '0');
                        const rachMop = parseFloat(currentReport.rach_mop_kg || '0');
                        
                        // Tính khổ cắt để dùng cho công thức TL trả dự kiến
                        let khoForTinhToan = 0;
                        if (newMaGiay) {
                            const parts = newMaGiay.split('-');
                            if (parts.length >= 3) {
                                const ffff = parts[2];
                                const khoNumber = parseInt(ffff, 10);
                                if (!isNaN(khoNumber)) {
                                    if (xaDoi === 1) {
                                        khoForTinhToan = Math.floor(khoNumber / 2); // Xả đôi
                                    } else {
                                        khoForTinhToan = khoNumber; // Không xả đôi
                                    }
                                }
                            }
                        }
                        
                        console.log('Dữ liệu để tính TL trả dự kiến:', {
                            tln, soTam, dai, khoForTinhToan, dinhLuong, dauCuon, rachMop, xaDoi
                        });

                        if (tln && soTam && dai && khoForTinhToan && dinhLuong && 
                            (!currentReport.tl_tra_du_tinh || currentReport.tl_tra_du_tinh === '')) {
                            
                            const tamLuong = (soTam * dai * khoForTinhToan * dinhLuong) / 1000000000;
                            const tlTraRaw = tln - tamLuong - dauCuon - rachMop;
                            
                            // Làm tròn tùy chỉnh
                            const tlTraRounded = customRound(tlTraRaw);
                            const tlTraDuKien = Number.isInteger(tlTraRounded) ? 
                                tlTraRounded.toFixed(1) : tlTraRounded.toFixed(1);
                            
                            updateFields.push('tl_tra_du_tinh = ?');
                            updateValues.push(tlTraDuKien);
                            
                            console.log(`✓ Tính TL trả dự kiến: (${tln} - (${soTam} × ${dai} × ${khoForTinhToan} × ${dinhLuong} ÷ 1000000000) - ${dauCuon} - ${rachMop}) = ${tlTraDuKien}`);
                        }

                        // Tính số tấm tham chiếu nếu có chiều cao pallet
        if (currentReport.chieu_cao_pallet && doDay > 0 && 
            (!currentReport.so_tam_tham_chieu || currentReport.so_tam_tham_chieu === '')) {
            const chieuCao = parseFloat(currentReport.chieu_cao_pallet);
            const soTamThamChieuRaw = (chieuCao * 10) / doDay;
            
            // ===== SỬA ĐỔI: SỬ DỤNG roundUp THAY VÌ customRound =====
            const soTamThamChieuRounded = roundUp(soTamThamChieuRaw); // Làm tròn lên
            const soTamThamChieu = soTamThamChieuRounded.toFixed(1);
            
            updateFields.push('so_tam_tham_chieu = ?');
            updateValues.push(soTamThamChieu);
            console.log(`✓ Tính số tấm tham chiếu: (${chieuCao} × 10) / ${doDay} = ${soTamThamChieuRaw} -> làm tròn lên: ${soTamThamChieu}`);
        }
                    }
                }
            } catch (dinhMucError) {
                console.error('Lỗi khi lấy số tờ/pallet từ định mức:', dinhMucError);
            }
        }
        
        // Nếu không có trường nào cần cập nhật
        if (updateFields.length === 0) {
            console.log('Không có dữ liệu nào cần cập nhật');
            return res.json({
                success: true,
                message: 'Không có dữ liệu nào cần cập nhật',
                id: id
            });
        }
        
        // Hoàn thiện câu lệnh SQL
        updateSQL += updateFields.join(', ') + ' WHERE id = ?';
        updateValues.push(id);
        
        console.log('SQL cập nhật:', updateSQL);
        console.log('Giá trị:', updateValues);
        
        // Thực hiện cập nhật
        await new Promise((resolve, reject) => {
            db.run(updateSQL, updateValues, function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
        
        // ===== SỬA LỖI 2D: CẬP NHẬT SỐ CUỘN CHUNG CHO CÙNG WS =====
        const wsToUpdate = updateData.so_ws || currentReport.so_ws;
        if (wsToUpdate && wsToUpdate.trim() !== '') {
            try {
                console.log(`🔄 Cập nhật số cuộn chung cho WS: ${wsToUpdate}`);
                
                // Đếm tổng số báo cáo có cùng WS
                const cuonRow = await new Promise((resolve, reject) => {
                    db.get(`SELECT COUNT(*) as count FROM bao_cao_gmc 
                            WHERE so_ws = ? AND so_phieu_cat_giay IS NOT NULL 
                            AND so_phieu_cat_giay != '' AND so_phieu_cat_giay != 'PCG'`, 
                        [wsToUpdate], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                
                const tongSoCuonChung = cuonRow.count || 1;
                console.log(`Tổng số cuộn chung cho WS ${wsToUpdate}: ${tongSoCuonChung}`);
                
                // Cập nhật tất cả báo cáo có cùng WS với số cuộn chung
                await new Promise((resolve, reject) => {
                    db.run(`UPDATE bao_cao_gmc SET so_cuon = ? WHERE so_ws = ?`, 
                        [tongSoCuonChung, wsToUpdate], function(err) {
                        if (err) reject(err);
                        else resolve(this.changes);
                    });
                });
                
                console.log(`✅ Đã cập nhật số cuộn chung ${tongSoCuonChung} cho tất cả báo cáo có WS ${wsToUpdate}`);
                
            } catch (cuonError) {
                console.error('Lỗi khi cập nhật số cuộn chung:', cuonError);
            }
        }



        // ===== TỰ ĐỘNG TÍNH SỐ TẤM XÉN KHI CẬP NHẬT =====
        // Lấy lại báo cáo đã cập nhật để tính số tấm xén
        const updatedReport = await new Promise((resolve, reject) => {
            db.get(`SELECT kho_mm, kho_xen, dai_mm, dai_xen, so_tam_cat_duoc, xa_doi 
                    FROM bao_cao_gmc WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (updatedReport && updatedReport.kho_mm && updatedReport.kho_xen && 
            updatedReport.dai_mm && updatedReport.dai_xen && updatedReport.so_tam_cat_duoc) {
            
            const soTamXenMoi = tinhSoTamXen(
                updatedReport.kho_mm,           // Khổ gốc
                updatedReport.kho_xen,          // Khổ xén
                updatedReport.dai_mm,           // Dài
                updatedReport.dai_xen,          // Dài xén
                updatedReport.so_tam_cat_duoc,  // Số tấm cắt được
                parseInt(updatedReport.xa_doi) || 0 // Xả đôi
            );
            
            const soTamXenMoiRounded = Math.round(soTamXenMoi);
            
            await new Promise((resolve, reject) => {
                db.run(`UPDATE bao_cao_gmc SET so_tam_xen = ? WHERE id = ?`, 
                    [soTamXenMoiRounded.toString(), id], function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                });
            });
            
            console.log(`✅ Đã tự động tính và cập nhật số tấm xén: ${soTamXenMoiRounded} cho báo cáo ID ${id}`);
        }

        
        
        console.log(`✅ Đã cập nhật báo cáo GMC ID ${id} với ${updateFields.length} trường`);
        
        res.json({
            success: true,
            message: 'Đã cập nhật báo cáo GMC thành công',
            id: id,
            updatedFields: updateFields.length
        });

        // Cập nhật ngày phụ nếu có thời gian kết thúc mới
if (currentReport.thoi_gian_ket_thuc) {
    try {
        const endTime = new Date(currentReport.thoi_gian_ket_thuc);
        const hours = endTime.getHours();
        const minutes = endTime.getMinutes();
        
        let ngayPhu = currentReport.ngay; // Mặc định giữ nguyên
        if (hours < 6 || (hours === 6 && minutes <= 10)) {
            const ngayPhuDate = new Date(endTime);
            ngayPhuDate.setDate(ngayPhuDate.getDate() - 1);
            ngayPhu = ngayPhuDate.toISOString().slice(0, 10);
        }
        
        // Cập nhật ngày phụ nếu khác với giá trị hiện tại
        if (ngayPhu !== currentReport.ngay_phu) {
            await new Promise((resolve, reject) => {
                db.run(`UPDATE bao_cao_gmc SET ngay_phu = ? WHERE id = ?`, 
                    [ngayPhu, id], function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                });
            });
            console.log(`✅ Đã cập nhật ngày phụ: ${ngayPhu} cho báo cáo ID ${id}`);
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật ngày phụ:', error);
    }
}
        
    } catch (error) {
        console.error('Lỗi khi cập nhật báo cáo GMC:', error.message);
        res.status(500).json({ error: 'Lỗi khi cập nhật báo cáo GMC: ' + error.message });
    }
});





// API lấy danh sách báo cáo GMC
router.get('/list', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    console.log('📤 API /list được gọi - đang truy vấn database...');

    // Lấy tham số date từ query
    const dateFilter = req.query.date;
    const excludeStopOnly = req.query.exclude_stop_only;
    let query = `SELECT * FROM bao_cao_gmc`;
    let params = [];
    let conditions = [];
    
    if (dateFilter) {
        conditions.push(`DATE(created_at) = ?`);
        params.push(dateFilter);
    }
    
    if (excludeStopOnly === 'true') {
        conditions.push(`(so_ws IS NOT NULL AND so_ws != '' AND so_phieu_cat_giay IS NOT NULL AND so_phieu_cat_giay != '' AND so_phieu_cat_giay != 'PCG')`);
    }
    
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC, stt DESC`;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách báo cáo GMC:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách báo cáo GMC' });
        }
    
        console.log(`📊 Database trả về ${rows ? rows.length : 0} bản ghi`);
        if (rows && rows.length > 0) {
            console.log('📝 3 bản ghi mới nhất:', rows.slice(0, 3).map(r => ({
                id: r.id,
                stt: r.stt,
                may: r.may
            })));
        }
    
        res.json(rows || []);
    });
});

// API lấy số lần mới nhất cho một số phiếu
router.get('/so-lan/:soPhieu', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const { soPhieu } = req.params;

    db.get(`SELECT MAX(so_lan_chay) as max_so_lan FROM bao_cao_gmc 
        WHERE so_phieu_cat_giay = ?`, [soPhieu], (err, row) => {
            if (err) {
                console.error('Lỗi khi lấy số lần của phiếu:', err.message);
                return res.status(500).json({ error: 'Lỗi khi lấy số lần của phiếu' });
            }

            const maxSoLan = row?.max_so_lan || 0;

            res.json({
                so_lan: maxSoLan + 1,
            });
        });
});

// API gửi báo cáo GMC
router.post('/submit', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const reportData = req.body;
    if (!reportData) {
        return res.status(400).json({ error: 'Dữ liệu báo cáo không hợp lệ' });
    }

    console.log('Nhận dữ liệu báo cáo từ client:', reportData);

    try {
        // Tạo ID duy nhất cho báo cáo
        const reportId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

        // Chuẩn bị dữ liệu để lưu vào database
        const batDau = reportData.batDau || {};
        const ketThuc = reportData.ketThuc || {};
        const nguoiDung = reportData.nguoiDung || {};
        const date = new Date().toISOString().slice(0, 10);
        // Tính ngày phụ
let ngayPhu = date; // Mặc định giữ nguyên ngày
if (ketThuc.thoiGianKetThuc) {
    try {
        const endTime = new Date(ketThuc.thoiGianKetThuc);
        const hours = endTime.getHours();
        const minutes = endTime.getMinutes();
        
        // Nếu thời gian kết thúc từ 0h đến 6h10 sáng
        if (hours < 6 || (hours === 6 && minutes <= 10)) {
            const ngayPhuDate = new Date(endTime);
            ngayPhuDate.setDate(ngayPhuDate.getDate() - 1);
            ngayPhu = ngayPhuDate.toISOString().slice(0, 10);
        }
    } catch (error) {
        console.error('Lỗi khi tính ngày phụ:', error);
    }
}

        // ===== BƯỚC 1: LẤY STT MỚI NHẤT =====
        const sttRow = await new Promise((resolve, reject) => {
            db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_gmc`, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        const stt = (sttRow?.max_stt || 0) + 1;
        
        // ===== SỬA LỖI 1: TÍNH SỐ CUỘN CHUNG THEO WS =====
        const ws = batDau.soWS || '';
        let soCuon = 1; // Mặc định
        
        if (ws && ws.trim() !== '') {
            const cuonRow = await new Promise((resolve, reject) => {
                db.get(`SELECT COUNT(*) as count FROM bao_cao_gmc 
                    WHERE so_ws = ?`, [ws], (err, row) => {
                    if (err) {
                        console.warn('Lỗi khi đếm số cuộn theo WS:', err.message);
                        resolve({ count: 0 });
                    } else {
                        resolve(row);
                    }
                });
            });

            // Số cuộn = tổng số báo cáo có cùng WS + 1 (báo cáo hiện tại)
            soCuon = (cuonRow && cuonRow.count ? cuonRow.count : 0) + 1;
            console.log(`✅ WS ${ws}: Số cuộn chung = ${soCuon}`);
        }

        // ===== BƯỚC 3: TÍNH TOÁN KHỔ CẮT VÀ KHỔ GỐC =====
        let khoCat = '';
        let khoGoc = '';
        
        // Lấy xả đôi
        const xaDoi = parseInt(batDau.xaDoi) || 0;
        
        console.log('=== DEBUG BACKEND CALCULATION ===');
        console.log('Mã giấy:', batDau.maGiay);
        console.log('Xả đôi từ client:', batDau.xaDoi, 'parsed:', xaDoi);
        
        if (batDau.maGiay) {
            const parts = batDau.maGiay.split('-');
            if (parts.length >= 4) {
                // Lấy phần FFFF từ mã giấy AABBCD-EEEE-FFFF-GGGG
                const ffff = parts[2];
                const khoNumber = parseInt(ffff, 10);
                
                if (!isNaN(khoNumber)) {
                    // Khổ gốc luôn là giá trị ban đầu
                    khoGoc = khoNumber.toString();
                    
                    // Khổ cắt tùy thuộc vào xả đôi
                    if (xaDoi === 0) {
                        // Không xả đôi - khổ cắt = khổ gốc
                        khoCat = khoNumber.toString();
                    } else if (xaDoi === 1) {
                        // Xả đôi - khổ cắt = khổ gốc / 2
                        khoCat = Math.floor(khoNumber / 2).toString();
                    } else {
                        // Trường hợp khác - mặc định không xả đôi
                        khoCat = khoNumber.toString();
                    }
                    
                    console.log('Tính từ mã giấy - FFFF:', ffff, 'Khổ gốc:', khoGoc, 'Khổ cắt:', khoCat);
                } else {
                    // Nếu không parse được số, giữ nguyên
                    khoCat = ffff;
                    khoGoc = ffff;
                    console.log('Không parse được số từ FFFF, giữ nguyên:', ffff);
                }
            }
        }

        // Nếu không có mã giấy, lấy từ dữ liệu client
        if (!khoCat && batDau.khoCat) {
            khoCat = batDau.khoCat;
            console.log('Lấy khổ cắt từ client:', khoCat);
        }

        if (!khoGoc && batDau.kho) {
            khoGoc = batDau.kho;
            console.log('Lấy khổ gốc từ client:', khoGoc);
        }

        console.log('Kết quả cuối - Khổ gốc:', khoGoc, 'Khổ cắt:', khoCat);

        // ===== BƯỚC 4: LẤY SỐ TỜ/PALLET TỪ ĐỊNH MỨC =====
        let finalSoTo = batDau.soTo || '';
        
        if (batDau.maGiay && batDau.may) {
            try {
                console.log('🔄 Lấy số tờ/pallet từ định mức cho:', batDau.maGiay, batDau.may);
                
                // Lấy dữ liệu định mức
                const dinhMucList = await new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM dinh_muc`, [], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    });
                });
                
                // Lấy phần AABBCD-EEEE từ mã giấy
                const maGiayParts = batDau.maGiay.split('-');
                if (maGiayParts.length >= 2) {
                    const maGiayPrefix = `${maGiayParts[0]}-${maGiayParts[1]}`;
                    console.log(`🔍 Tìm định mức cho mã giấy: ${maGiayPrefix}`);
                    
                    const matchedDinhMuc = dinhMucList.find(dinhMuc => {
                        const dinhMucMaGiay = dinhMuc.ma_giay || '';
                        return dinhMucMaGiay === maGiayPrefix;
                    });

                    if (matchedDinhMuc) {
                        let soToFromDinhMuc = '';
                        if (batDau.may === 'GMC 1' && matchedDinhMuc.so_to_pallet_gmc1) {
                            soToFromDinhMuc = matchedDinhMuc.so_to_pallet_gmc1;
                        } else if (batDau.may === 'GMC 2' && matchedDinhMuc.so_to_pallet_gmc2) {
                            soToFromDinhMuc = matchedDinhMuc.so_to_pallet_gmc2;
                        }
                        
                        if (soToFromDinhMuc && soToFromDinhMuc.trim() !== '') {
                            finalSoTo = soToFromDinhMuc;
                            console.log(`✅ Lấy được số tờ/pallet từ định mức: ${finalSoTo}`);
                        } else {
                            console.log(`❌ Không có số tờ/pallet cho ${batDau.may} trong định mức`);
                        }
                    } else {
                        console.log(`❌ Không tìm thấy định mức khớp với mã giấy ${maGiayPrefix}`);
                    }
                }
            } catch (error) {
                console.error('Lỗi khi lấy số tờ/pallet từ định mức:', error);
            }
        }
        
         // ===== BƯỚC 5: LẤY ĐỘ DÀY VÀ TÍNH SỐ TẤM THAM CHIẾU =====
    let soTamThamChieuFinal = '';
    
    if (ketThuc.chieuCaoPallet && batDau.maGiay && batDau.may) {
        try {
            console.log('🔄 Tính số tấm tham chiếu từ định mức');
            
            // Lấy dữ liệu định mức
            const dinhMucList = await new Promise((resolve, reject) => {
                db.all(`SELECT * FROM dinh_muc`, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });
            
            const maGiayParts = batDau.maGiay.split('-');
            if (maGiayParts.length >= 2) {
                const maGiayPrefix = `${maGiayParts[0]}-${maGiayParts[1]}`;
                
                const matchedDinhMuc = dinhMucList.find(dinhMuc => {
                    const dinhMucMaGiay = dinhMuc.ma_giay || '';
                    return dinhMucMaGiay === maGiayPrefix;
                });

                if (matchedDinhMuc) {
                    let doDay = 0;
                    if (batDau.may === 'GMC 1' && matchedDinhMuc.do_day_giay_gmc1) {
                        doDay = parseFloat(matchedDinhMuc.do_day_giay_gmc1);
                    } else if (batDau.may === 'GMC 2' && matchedDinhMuc.do_day_giay_gmc2) {
                        doDay = parseFloat(matchedDinhMuc.do_day_giay_gmc2);
                    }

                    if (doDay > 0) {
                        const chieuCao = parseFloat(ketThuc.chieuCaoPallet);
                        if (chieuCao > 0) {
                            // Tính số tấm tham chiếu: (Chiều cao × 10) / Độ dày
                            const soTamThamChieuRaw = (chieuCao * 10) / doDay;
                            
                            // ===== SỬA ĐỔI: SỬ DỤNG roundUp THAY VÌ customRound =====
                            const soTamThamChieuRounded = roundUp(soTamThamChieuRaw); // Làm tròn lên
                            soTamThamChieuFinal = soTamThamChieuRounded.toFixed(1);
                            
                            console.log(`✅ Tính được số tấm tham chiếu: (${chieuCao} × 10) / ${doDay} = ${soTamThamChieuRaw} -> làm tròn lên: ${soTamThamChieuFinal}`);
                        }
                    } else {
                        console.log(`❌ Không có độ dày cho ${batDau.may} trong định mức`);
                    }
                } else {
                    console.log(`❌ Không tìm thấy định mức để lấy độ dày`);
                }
            }
        } catch (error) {
            console.error('Lỗi khi tính số tấm tham chiếu:', error);
        }
    }
    
    // Nếu không tính được từ định mức, sử dụng giá trị từ client
    if (!soTamThamChieuFinal && ketThuc.soTamThamChieu) {
        // ===== SỬA ĐỔI: CŨNG APPLY roundUp CHO GIÁ TRỊ TỪ CLIENT =====
        const clientValue = parseFloat(ketThuc.soTamThamChieu);
        if (!isNaN(clientValue)) {
            const roundedValue = roundUp(clientValue);
            soTamThamChieuFinal = roundedValue.toFixed(1);
            console.log(`Sử dụng số tấm tham chiếu từ client: ${ketThuc.soTamThamChieu} -> làm tròn lên: ${soTamThamChieuFinal}`);
        } else {
            soTamThamChieuFinal = ketThuc.soTamThamChieu;
            console.log('Sử dụng số tấm tham chiếu từ client (không làm tròn):', soTamThamChieuFinal);
        }
    }

        // ===== BƯỚC 6: TÍNH TRỌNG LƯỢNG TRẢ DỰ TÍNH =====
        let tlTraDuTinh = '';
        
        if (batDau.trongLuongNhan && ketThuc.soTamCatDuoc && batDau.dai && batDau.dinhLuong && khoCat) {
            const tln = parseFloat(batDau.trongLuongNhan) || 0;
            const soTam = parseFloat(ketThuc.soTamCatDuoc) || 0;
            const dai = parseFloat(batDau.dai) || 0;
            const dinhLuong = parseFloat(batDau.dinhLuong) || 0;
            const dauCuon = parseFloat(ketThuc.dauCuon) || 0;
            const rachMop = parseFloat(ketThuc.rachMop) || 0;
            
            // QUAN TRỌNG: Sử dụng khổ cắt (đã tính theo xả đôi)
            const khoForCalculation = parseFloat(khoCat) || 0;
            
            if (khoForCalculation > 0) {
                // Công thức: (TLN - (STC × Dài × Khổ cắt × Định lượng ÷ 1000000000) - Đầu cuộn - Rách móp)
                const tamLuong = (soTam * dai * khoForCalculation * dinhLuong) / 1000000000;
                const tlTraRaw = tln - tamLuong - dauCuon - rachMop;
                
                // Làm tròn theo quy tắc tùy chỉnh
                const tlTraRounded = customRound(tlTraRaw);
                tlTraDuTinh = Number.isInteger(tlTraRounded) ? 
                    tlTraRounded.toFixed(1) : 
                    tlTraRounded.toFixed(1);
                
                console.log('=== TÍNH TL TRẢ DỰ TÍNH ===');
                console.log('TLN:', tln);
                console.log('Số tấm:', soTam);
                console.log('Dài:', dai);
                console.log('Khổ cắt (dùng tính toán):', khoForCalculation);
                console.log('Định lượng:', dinhLuong);
                console.log('Đầu cuộn:', dauCuon);
                console.log('Rách móp:', rachMop);
                console.log('Tấm lượng:', tamLuong);
                console.log('TL trả raw:', tlTraRaw);
                console.log('TL trả dự tính (đã làm tròn):', tlTraDuTinh);
                console.log('========================');
            }
        } else {
            console.log('Thiếu dữ liệu để tính TL trả dự tính:', {
                trongLuongNhan: batDau.trongLuongNhan,
                soTamCatDuoc: ketThuc.soTamCatDuoc,
                dai: batDau.dai,
                dinhLuong: batDau.dinhLuong,
                khoCat: khoCat
            });
        }
        
        // Nếu client đã tính sẵn, ưu tiên dùng giá trị từ client
        if (!tlTraDuTinh && ketThuc.tlTraDuTinh) {
            tlTraDuTinh = ketThuc.tlTraDuTinh;
            console.log('Sử dụng TL trả dự tính từ client:', tlTraDuTinh);
        }
        
        // ===== BƯỚC 7: TÍNH SỐ TẤM XÉN THEO CÔNG THỨC MỚI =====
        let soTamXen = '';
        if (ketThuc.soTamCatDuoc && khoGoc && ketThuc.khoXen && batDau.dai && ketThuc.daiXen) {
            const soTamXenCalculated = tinhSoTamXen(
                khoGoc, // Dùng khổ gốc (không chia đôi) để tính số tấm xén
                ketThuc.khoXen,
                batDau.dai,
                ketThuc.daiXen,
                ketThuc.soTamCatDuoc,
                xaDoi
            );
            soTamXen = Math.round(soTamXenCalculated).toString(); // Làm tròn thành số nguyên
            console.log('✅ Tính số tấm xén theo công thức mới:', soTamXenCalculated, '-> làm tròn:', soTamXen);
        } else {
            console.log('✗ Thiếu dữ liệu để tính số tấm xén:', {
                soTamCatDuoc: ketThuc.soTamCatDuoc,
                khoGoc: khoGoc,
                khoXen: ketThuc.khoXen,
                dai: batDau.dai,
                daiXen: ketThuc.daiXen
            });
        }

        // ===== BƯỚC 8: LƯU VÀO DATABASE =====
        const insertSQL = `INSERT INTO bao_cao_gmc (
            id, stt, ngay, ca, gio_lam_viec, ma_ca, ngay_phu, may, so_phieu_cat_giay, so_lan_chay, so_ws, khach_hang, ma_giay, 
            dinh_luong, so_tam, kho_cat, ma_so_cuon, trong_luong_nhan, thoi_gian_bat_dau, thoi_gian_ket_thuc, 
            kho_mm, dai_mm, tong_so_pallet, so_tam_cat_duoc, tl_tra_thuc_te, tl_tra_du_tinh, 
            loi_kg, dau_cuon_kg, rach_mop_kg, phe_lieu_san_xuat_kg, so_cuon, ghi_chu, thu_tu_cuon, 
            xa_doi, so_id, kho_xen, dai_xen, so_tam_xen, su_dung_giay_ton_tam, so_to_pallet, 
            kho_cat_sai_mm, dai_cat_sai_mm, so_tam_cat_sai, giay_quan_lot, chuyen_xen, 
            chieu_cao_pallet, so_tam_tham_chieu, thoi_gian_chuyen_doi_pallet, thoi_gian_khac, 
            dung_may, nguoi_thuc_hien, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await new Promise((resolve, reject) => {
            db.run(insertSQL, [
                reportId,                                    // 1. id
                stt,                                        // 2. stt
                date,                                      // 6. ngay
                batDau.ca || '',                           // 3. ca
                batDau.gioLamViec || '',                   // 4. gio_lam_viec - THÊM MỚI
                batDau.maCa || '',                         // 5. ma_ca - THÊM MỚI
                ngayPhu,                                      // 7. ngày phụ
                batDau.may || '',                          // 7. may
                batDau.soPhieu || '',                      // 8. so_phieu_cat_giay
                parseInt(batDau.soLan || '1'),             // 9. so_lan_chay
                batDau.soWS || '',                         // 10. so_ws
                batDau.khachHang || '',                    // 11. khach_hang
                batDau.maGiay || '',                       // 12. ma_giay
                batDau.dinhLuong || '',                    // 13. dinh_luong
                batDau.soTam || '',
                khoCat || '',                              // 14. kho_cat
                batDau.maSoCuon || '',                     // 15. ma_so_cuon
                batDau.trongLuongNhan || '',               // 16. trong_luong_nhan
                batDau.thoiGianBatDau || '',               // 17. thoi_gian_bat_dau
                ketThuc.thoiGianKetThuc || '',             // 18. thoi_gian_ket_thuc
                khoGoc || batDau.kho || '',                // 19. kho_mm
                batDau.dai || '',                          // 20. dai_mm
                ketThuc.tongSoPallet || '',                // 21. tong_so_pallet
                ketThuc.soTamCatDuoc || '',                // 22. so_tam_cat_duoc
                ketThuc.tlTraThucTe || '',                 // 23. tl_tra_thuc_te
                tlTraDuTinh || '',                         // 24. tl_tra_du_tinh
                ketThuc.loi || '',                         // 25. loi_kg
                ketThuc.dauCuon || '',                     // 26. dau_cuon_kg
                ketThuc.rachMop || '',                     // 27. rach_mop_kg
                ketThuc.pheLieuSanXuat || '',              // 28. phe_lieu_san_xuat_kg
                soCuon,                                    // 29. so_cuon
                ketThuc.ghiChu || '',                      // 30. ghi_chu
                batDau.thuTu || '',                        // 31. thu_tu_cuon
                batDau.xaDoi || '0',                       // 32. xa_doi
                batDau.soID || '',                         // 33. so_id
                ketThuc.khoXen || '',                      // 34. kho_xen
                ketThuc.daiXen || '',                      // 35. dai_xen
                soTamXen || '',                            // 36. so_tam_xen
                ketThuc.suDungGiayTon || '',               // 37. su_dung_giay_ton_tam
                finalSoTo || '',                           // 38. so_to_pallet
                ketThuc.khoCatSai || '',                   // 39. kho_cat_sai_mm
                ketThuc.daiCatSai || '',                   // 40. dai_cat_sai_mm
                ketThuc.soTamCatSai || '',                 // 41. so_tam_cat_sai
                ketThuc.giayQuanLot ? 'Có' : '',           // 42. giay_quan_lot
                ketThuc.chuyenXen ? 'Có' : '',             // 43. chuyen_xen
                ketThuc.chieuCaoPallet || '',              // 44. chieu_cao_pallet
                soTamThamChieuFinal || '',                 // 45. so_tam_tham_chieu
                ketThuc.thoiGianChuyenDoiPallet || '',     // 46. thoi_gian_chuyen_doi_pallet
                ketThuc.thoiGianKhac || '',                // 47. thoi_gian_khac
                ketThuc.dungMay ? 1 : 0,                   // 48. dung_may
                batDau.nguoiThucHien || '',                // 49. nguoi_thuc_hien
                nguoiDung.id || ''                         // 50. user_id
            ], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });

        console.log('✅ Đã lưu báo cáo GMC thành công với ID:', reportId);
        console.log('✅ Số tờ/pallet cuối cùng:', finalSoTo);
        console.log('✅ Số tấm tham chiếu cuối cùng:', soTamThamChieuFinal);
        console.log('✅ Số cuộn chung:', soCuon);

        // ===== BƯỚC 9: XỬ LÝ BÁO CÁO DỪNG MÁY (NẾU CÓ) =====
        if (reportData.dungMay && Array.isArray(reportData.dungMay)) {
            const stopReports = reportData.dungMay;

            // Lấy STT mới nhất cho báo cáo dừng máy
            const stopSttRow = await new Promise((resolve, reject) => {
                db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_gmc_dung_may`, [], (err, row) => {
                    if (err) {
                        console.warn('Lỗi khi lấy STT mới nhất cho dừng máy:', err.message);
                        resolve({ max_stt: 0 });
                    } else {
                        resolve(row);
                    }
                });
            });

            const baseStopStt = (stopSttRow?.max_stt || 0);

            const insertPromises = stopReports.map((stopReport, index) => {
                return new Promise((resolve, reject) => {
                    const stopId = Date.now().toString() + index;
                    const stopStt = baseStopStt + index + 1;

                    db.run(`INSERT INTO bao_cao_gmc_dung_may (
                        id, bao_cao_id, stt, ca, nguoi_thuc_hien, may, so_phieu_cat_giay,
                        ly_do, ly_do_khac, thoi_gian_dung, thoi_gian_chay_lai,
                        thoi_gian_dung_may, ghi_chu
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            stopId,
                            reportId,
                            stopStt,
                            batDau.ca || '',
                            batDau.nguoiThucHien || '',
                            batDau.may || '',
                            batDau.soPhieu || '',
                            stopReport.lyDo || '',
                            stopReport.lyDoKhac || '',
                            stopReport.thoiGianDung || '',
                            stopReport.thoiGianChayLai || '',
                            stopReport.thoiGianDungMay || '',
                            stopReport.ghiChu || ketThuc.ghiChu || ''
                        ], function (err) {
                            if (err) {
                                console.error('Lỗi khi lưu lý do dừng máy:', err.message);
                                reject(err);
                            } else {
                                console.log(`✅ Đã lưu lý do dừng máy #${index + 1} với ID: ${stopId}`);
                                resolve();
                            }
                        });
                });
            });

            await Promise.all(insertPromises);
        }

        // ===== BƯỚC 10: TRẢ VỀ KẾT QUẢ =====
        res.json({
            success: true,
            id: reportId,
            message: 'Đã lưu báo cáo GMC thành công',
            data: {
                so_to_pallet: finalSoTo,
                so_tam_tham_chieu: soTamThamChieuFinal,
                tl_tra_du_tinh: tlTraDuTinh,
                kho_cat: khoCat,
                kho_goc: khoGoc,
                so_cuon: soCuon
            }
        });

    } catch (error) {
        console.error('Lỗi khi gửi báo cáo GMC:', error);
        res.status(500).json({ 
            error: 'Lỗi khi gửi báo cáo GMC: ' + error.message,
            details: error.stack 
        });
    }
});





// API gửi báo cáo GMC phần bắt đầu
router.post('/submit-start', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const startData = req.body;
    if (!startData) {
        return res.status(400).json({ error: 'Dữ liệu báo cáo bắt đầu không hợp lệ' });
    }

    console.log('Nhận dữ liệu báo cáo bắt đầu từ client:', startData);

    try {
        // Tạo ID duy nhất cho báo cáo
        const reportId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const date = new Date().toISOString().slice(0, 10);

        // Lấy STT mới nhất
        const sttRow = await new Promise((resolve, reject) => {
            db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_gmc`, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        const stt = (sttRow?.max_stt || 0) + 1;
        
        // Tính số cuộn chung theo WS
        const ws = startData.soWS || '';
        let soCuon = 1;
        
        if (ws && ws.trim() !== '') {
            const cuonRow = await new Promise((resolve, reject) => {
                db.get(`SELECT COUNT(*) as count FROM bao_cao_gmc 
                    WHERE so_ws = ?`, [ws], (err, row) => {
                    if (err) {
                        console.warn('Lỗi khi đếm số cuộn theo WS:', err.message);
                        resolve({ count: 0 });
                    } else {
                        resolve(row);
                    }
                });
            });

            soCuon = (cuonRow && cuonRow.count ? cuonRow.count : 0) + 1;
        }

        // Tính toán khổ cắt và khổ gốc
        let khoCat = '';
        let khoGoc = '';
        const xaDoi = parseInt(startData.xaDoi) || 0;
        
        if (startData.maGiay) {
            const parts = startData.maGiay.split('-');
            if (parts.length >= 4) {
                const ffff = parts[2];
                const khoNumber = parseInt(ffff, 10);
                
                if (!isNaN(khoNumber)) {
                    khoGoc = khoNumber.toString();
                    
                    if (xaDoi === 0) {
                        khoCat = khoNumber.toString();
                    } else if (xaDoi === 1) {
                        khoCat = Math.floor(khoNumber / 2).toString();
                    } else {
                        khoCat = khoNumber.toString();
                    }
                }
            }
        }

        if (!khoCat && startData.kho) {
            khoCat = startData.kho;
        }
        if (!khoGoc && startData.kho) {
            khoGoc = startData.kho;
        }

        // Lấy số tờ/pallet từ định mức
        let finalSoTo = startData.soTo || '';
        
        if (startData.maGiay && startData.may) {
            try {
                const dinhMucList = await new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM dinh_muc`, [], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    });
                });
                
                const maGiayParts = startData.maGiay.split('-');
                if (maGiayParts.length >= 2) {
                    const maGiayPrefix = `${maGiayParts[0]}-${maGiayParts[1]}`;
                    
                    const matchedDinhMuc = dinhMucList.find(dinhMuc => {
                        const dinhMucMaGiay = dinhMuc.ma_giay || '';
                        return dinhMucMaGiay === maGiayPrefix;
                    });

                    if (matchedDinhMuc) {
                        let soToFromDinhMuc = '';
                        if (startData.may === 'GMC 1' && matchedDinhMuc.so_to_pallet_gmc1) {
                            soToFromDinhMuc = matchedDinhMuc.so_to_pallet_gmc1;
                        } else if (startData.may === 'GMC 2' && matchedDinhMuc.so_to_pallet_gmc2) {
                            soToFromDinhMuc = matchedDinhMuc.so_to_pallet_gmc2;
                        }
                        
                        if (soToFromDinhMuc && soToFromDinhMuc.trim() !== '') {
                            finalSoTo = soToFromDinhMuc;
                        }
                    }
                }
            } catch (error) {
                console.error('Lỗi khi lấy số tờ/pallet từ định mức:', error);
            }
        }

        // Lưu vào database (chỉ phần bắt đầu)
        const insertSQL = `INSERT INTO bao_cao_gmc (
            id, stt, ngay, ca, gio_lam_viec, ma_ca, may, so_phieu_cat_giay, so_lan_chay, so_ws, khach_hang, ma_giay, 
            dinh_luong, so_tam, kho_cat, ma_so_cuon, trong_luong_nhan, thoi_gian_bat_dau, 
            kho_mm, dai_mm, so_cuon, thu_tu_cuon, xa_doi, so_id, kho_xen, dai_xen, 
            giay_quan_lot, chuyen_xen, so_to_pallet, nguoi_thuc_hien, is_started_only
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await new Promise((resolve, reject) => {
            db.run(insertSQL, [
                reportId,
                stt,
                date,
                startData.ca || '',
                startData.gioLamViec || '',
                startData.maCa || '',
                startData.may || '',
                startData.soPhieu || '',
                parseInt(startData.soLan || '1'),
                startData.soWS || '',
                startData.khachHang || '',
                startData.maGiay || '',
                startData.dinhLuong || '',
                startData.soTam || '',
                khoCat || '',
                startData.maSoCuon || '',
                startData.trongLuongNhan || '',
                startData.thoiGianBatDau || '',
                khoGoc || startData.kho || '',
                startData.dai || '',
                soCuon,
                startData.thuTu || '',
                startData.xaDoi || '0',
                startData.soID || '',
                startData.khoXen || '',
                startData.daiXen || '',
                startData.giayQuanLot ? 'Có' : '',
                startData.chuyenXen ? 'Có' : '',
                finalSoTo || '',
                startData.nguoiThucHien || '',
                1  // Đánh dấu là chỉ mới bắt đầu
            ], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });

        console.log('✅ Đã lưu báo cáo GMC bắt đầu thành công với ID:', reportId);

        res.json({
            success: true,
            id: reportId,
            message: 'Đã lưu báo cáo GMC bắt đầu thành công'
        });

    } catch (error) {
        console.error('Lỗi khi gửi báo cáo GMC bắt đầu:', error);
        res.status(500).json({ 
            error: 'Lỗi khi gửi báo cáo GMC bắt đầu: ' + error.message
        });
    }
});






// API cập nhật báo cáo GMC phần kết thúc
router.put('/update-end/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const { id } = req.params;
    const { ketThuc, dungMay } = req.body;
    
    if (!id || !ketThuc) {
        return res.status(400).json({ error: 'Dữ liệu cập nhật không hợp lệ' });
    }
    
    try {
        console.log('Cập nhật phần kết thúc cho báo cáo ID:', id);
        
        // Lấy báo cáo hiện tại
        const currentReport = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM bao_cao_gmc WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!currentReport) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo GMC' });
        }
        
        // Tính toán TL trả dự tính
        let tlTraDuTinh = '';
        if (currentReport.trong_luong_nhan && ketThuc.soTamCatDuoc && currentReport.dai_mm && 
            currentReport.kho_cat && currentReport.dinh_luong) {
            
            const tln = parseFloat(currentReport.trong_luong_nhan) || 0;
            const soTam = parseFloat(ketThuc.soTamCatDuoc) || 0;
            const dai = parseFloat(currentReport.dai_mm) || 0;
            const dinhLuong = parseFloat(currentReport.dinh_luong) || 0;
            const dauCuon = parseFloat(ketThuc.dauCuon) || 0;
            const rachMop = parseFloat(ketThuc.rachMop) || 0;
            const khoForCalculation = parseFloat(currentReport.kho_cat) || 0;
            
            if (khoForCalculation > 0) {
                const tamLuong = (soTam * dai * khoForCalculation * dinhLuong) / 1000000000;
                const tlTraRaw = tln - tamLuong - dauCuon - rachMop;
                const tlTraRounded = customRound(tlTraRaw);
                tlTraDuTinh = Number.isInteger(tlTraRounded) ? 
                    tlTraRounded.toFixed(1) : tlTraRounded.toFixed(1);
            }
        }
        
        // Tính số tấm tham chiếu
        let soTamThamChieuFinal = '';
        if (ketThuc.chieuCaoPallet && currentReport.may && currentReport.ma_giay) {
            try {
                const dinhMucList = await new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM dinh_muc`, [], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    });
                });
                
                const maGiayParts = currentReport.ma_giay.split('-');
                if (maGiayParts.length >= 2) {
                    const maGiayPrefix = `${maGiayParts[0]}-${maGiayParts[1]}`;
                    
                    const matchedDinhMuc = dinhMucList.find(dinhMuc => {
                        const dinhMucMaGiay = dinhMuc.ma_giay || '';
                        return dinhMucMaGiay === maGiayPrefix;
                    });

                    if (matchedDinhMuc) {
                        let doDay = 0;
                        if (currentReport.may === 'GMC 1' && matchedDinhMuc.do_day_giay_gmc1) {
                            doDay = parseFloat(matchedDinhMuc.do_day_giay_gmc1);
                        } else if (currentReport.may === 'GMC 2' && matchedDinhMuc.do_day_giay_gmc2) {
                            doDay = parseFloat(matchedDinhMuc.do_day_giay_gmc2);
                        }

                        if (doDay > 0) {
                            const chieuCao = parseFloat(ketThuc.chieuCaoPallet);
                            if (chieuCao > 0) {
                                const soTamThamChieuRaw = (chieuCao * 10) / doDay;
                                const soTamThamChieuRounded = roundUp(soTamThamChieuRaw);
                                soTamThamChieuFinal = soTamThamChieuRounded.toFixed(1);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Lỗi khi tính số tấm tham chiếu:', error);
            }
        }
        
        // Tính số tấm xén
        let soTamXen = '';
        if (ketThuc.soTamCatDuoc && currentReport.kho_mm && ketThuc.khoXen && 
            currentReport.dai_mm && ketThuc.daiXen) {
            const soTamXenCalculated = tinhSoTamXen(
                currentReport.kho_mm,
                ketThuc.khoXen,
                currentReport.dai_mm,
                ketThuc.daiXen,
                ketThuc.soTamCatDuoc,
                parseInt(currentReport.xa_doi) || 0
            );
            soTamXen = Math.round(soTamXenCalculated).toString();
        }
        
        // Cập nhật database
        const updateSQL = `UPDATE bao_cao_gmc SET 
            thoi_gian_ket_thuc = ?, tong_so_pallet = ?, so_tam_cat_duoc = ?, tl_tra_thuc_te = ?, 
            tl_tra_du_tinh = ?, loi_kg = ?, dau_cuon_kg = ?, rach_mop_kg = ?, phe_lieu_san_xuat_kg = ?, 
            ghi_chu = ?, su_dung_giay_ton_tam = ?, chieu_cao_pallet = ?, so_tam_tham_chieu = ?, 
            thoi_gian_chuyen_doi_pallet = ?, thoi_gian_khac = ?, so_tam_xen = ?, kho_cat_sai_mm = ?, 
            dai_cat_sai_mm = ?, so_tam_cat_sai = ?, dung_may = ?, is_started_only = ?
            WHERE id = ?`;
        
        await new Promise((resolve, reject) => {
            db.run(updateSQL, [
                ketThuc.thoiGianKetThuc || new Date().toISOString(),
                ketThuc.tongSoPallet || '',
                ketThuc.soTamCatDuoc || '',
                ketThuc.tlTraThucTe || '',
                tlTraDuTinh || '',
                ketThuc.loi || '',
                ketThuc.dauCuon || '',
                ketThuc.rachMop || '',
                ketThuc.pheLieuSanXuat || '',
                ketThuc.ghiChu || '',
                ketThuc.suDungGiayTon || '',
                ketThuc.chieuCaoPallet || '',
                soTamThamChieuFinal || '',
                ketThuc.thoiGianChuyenDoiPallet || '',
                ketThuc.thoiGianKhac || '',
                soTamXen || '',
                ketThuc.khoCatSai || '',
                ketThuc.daiCatSai || '',
                ketThuc.soTamCatSai || '',
                ketThuc.dungMay ? 1 : 0,
                0,  // Đánh dấu đã hoàn thành
                id
            ], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        // Xử lý báo cáo dừng máy nếu có
        if (dungMay && Array.isArray(dungMay)) {
            const stopSttRow = await new Promise((resolve, reject) => {
                db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_gmc_dung_may`, [], (err, row) => {
                    if (err) {
                        console.warn('Lỗi khi lấy STT mới nhất cho dừng máy:', err.message);
                        resolve({ max_stt: 0 });
                    } else {
                        resolve(row);
                    }
                });
            });

            const baseStopStt = (stopSttRow?.max_stt || 0);

            const insertPromises = dungMay.map((stopReport, index) => {
                return new Promise((resolve, reject) => {
                    const stopId = Date.now().toString() + index;
                    const stopStt = baseStopStt + index + 1;

                    db.run(`INSERT INTO bao_cao_gmc_dung_may (
                        id, bao_cao_id, stt, ca, nguoi_thuc_hien, may, so_phieu_cat_giay,
                        ly_do, ly_do_khac, thoi_gian_dung, thoi_gian_chay_lai,
                        thoi_gian_dung_may, ghi_chu
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            stopId, id, stopStt,
                            currentReport.ca || '',
                            currentReport.nguoi_thuc_hien || '',
                            currentReport.may || '',
                            currentReport.so_phieu_cat_giay || '',
                            stopReport.lyDo || '',
                            stopReport.lyDoKhac || '',
                            stopReport.thoiGianDung || '',
                            stopReport.thoiGianChayLai || '',
                            stopReport.thoiGianDungMay || '',
                            stopReport.ghiChu || ketThuc.ghiChu || ''
                        ], function (err) {
                            if (err) {
                                console.error('Lỗi khi lưu lý do dừng máy:', err.message);
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                });
            });

            await Promise.all(insertPromises);
        }

        console.log('✅ Đã cập nhật phần kết thúc cho báo cáo GMC ID:', id);

        res.json({
            success: true,
            id: id,
            message: 'Đã cập nhật phần kết thúc báo cáo GMC thành công'
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật phần kết thúc báo cáo GMC:', error);
        res.status(500).json({ 
            error: 'Lỗi khi cập nhật phần kết thúc báo cáo GMC: ' + error.message
        });
    }
});







// API cập nhật số cuộn cho toàn bộ database
router.put('/cap-nhat-so-cuon', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        console.log('🚀 Bắt đầu cập nhật số cuộn cho toàn bộ database...');
        
        // Bước 1: Lấy tất cả báo cáo GMC
        const allReports = await new Promise((resolve, reject) => {
            db.all(`SELECT id, so_ws, so_phieu_cat_giay, created_at FROM bao_cao_gmc 
                    ORDER BY created_at ASC`, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        console.log(`📊 Tìm thấy ${allReports.length} báo cáo GMC cần cập nhật`);
        
        // Bước 2: Nhóm theo WS và tính số cuộn chung
        const wsGroups = {};
        
        // Nhóm các báo cáo theo WS
        allReports.forEach(report => {
            const ws = report.so_ws;
            if (ws && ws.trim() !== '') {
                if (!wsGroups[ws]) {
                    wsGroups[ws] = [];
                }
                wsGroups[ws].push(report);
            }
        });
        
        console.log(`📋 Tìm thấy ${Object.keys(wsGroups).length} WS khác nhau`);
        
        // Bước 3: Cập nhật số cuộn chung cho từng WS
        let updatedCount = 0;
        let errorCount = 0;
        
        for (const [ws, reports] of Object.entries(wsGroups)) {
            try {
                const tongSoCuonChung = reports.length; // Tổng số cuộn chung trong WS này
                
                console.log(`🔄 Đang cập nhật WS ${ws}: ${tongSoCuonChung} cuộn chung`);
                
                // ===== SỬA LỖI: Cập nhật TẤT CẢ báo cáo trong WS với CÙNG số cuộn chung =====
                for (const report of reports) {
                    await new Promise((resolve, reject) => {
                        db.run(`UPDATE bao_cao_gmc SET so_cuon = ? WHERE id = ?`, 
                            [tongSoCuonChung, report.id], function(err) {
                            if (err) reject(err);
                            else resolve(this.changes);
                        });
                    });
                    
                    updatedCount++;
                }
                
                console.log(`✅ Đã cập nhật ${tongSoCuonChung} báo cáo cho WS ${ws} với số cuộn chung: ${tongSoCuonChung}`);
                
            } catch (error) {
                console.error(`❌ Lỗi khi cập nhật WS ${ws}:`, error);
                errorCount++;
            }
        }
        
        console.log(`🎉 Hoàn thành cập nhật số cuộn chung!`);
        console.log(`✅ Đã cập nhật: ${updatedCount} báo cáo`);
        console.log(`❌ Lỗi: ${errorCount} WS`);
        
        res.json({
            success: true,
            message: 'Đã cập nhật số cuộn chung cho toàn bộ database thành công',
            summary: {
                totalReports: allReports.length,
                totalWS: Object.keys(wsGroups).length,
                updatedReports: updatedCount,
                errors: errorCount
            }
        });
        
    } catch (error) {
        console.error('❌ Lỗi khi cập nhật số cuộn:', error);
        res.status(500).json({ 
            error: 'Lỗi khi cập nhật số cuộn: ' + error.message 
        });
    }
});


// API lấy chi tiết báo cáo GMC
router.get('/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const { id } = req.params;

    db.get(`SELECT * FROM bao_cao_gmc WHERE id = ?`, [id], (err, report) => {
        if (err) {
            console.error('Lỗi khi lấy chi tiết báo cáo GMC:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy chi tiết báo cáo GMC' });
        }

        if (!report) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo GMC' });
        }

        // Lấy thông tin dừng máy nếu có
        db.all(`SELECT * FROM bao_cao_gmc_dung_may WHERE bao_cao_id = ?`, [id], (err, stopReports) => {
            if (err) {
                console.error('Lỗi khi lấy thông tin dừng máy:', err.message);
                return res.status(500).json({ error: 'Lỗi khi lấy thông tin dừng máy' });
            }

            // Thêm thông tin dừng máy vào báo cáo
            report.dungMay = stopReports || [];

            res.json(report);
        });
    });
});

// API xóa báo cáo GMC
router.delete('/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const { id } = req.params;

    // Bắt đầu transaction
    db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
            console.error('Lỗi khi bắt đầu transaction:', err.message);
            return res.status(500).json({ error: 'Lỗi khi bắt đầu transaction' });
        }

        // Xóa các báo cáo dừng máy liên quan
        db.run(`DELETE FROM bao_cao_gmc_dung_may WHERE bao_cao_id = ?`, [id], (err) => {
            if (err) {
                console.error('Lỗi khi xóa báo cáo dừng máy:', err.message);
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Lỗi khi xóa báo cáo dừng máy' });
            }

            // Xóa báo cáo chính
            db.run(`DELETE FROM bao_cao_gmc WHERE id = ?`, [id], function (err) {
                if (err) {
                    console.error('Lỗi khi xóa báo cáo GMC:', err.message);
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Lỗi khi xóa báo cáo GMC' });
                }

                // Kiểm tra xem có bản ghi nào được xóa không
                if (this.changes === 0) {
                    db.run('ROLLBACK');
                    return res.status(404).json({ error: 'Không tìm thấy báo cáo GMC để xóa' });
                }

                // Commit transaction
                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error('Lỗi khi commit transaction:', err.message);
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Lỗi khi commit transaction' });
                    }

                    res.json({
                        success: true,
                        message: 'Đã xóa báo cáo GMC thành công'
                    });
                });
            });
        });
    });
});

// API lấy danh sách báo cáo dừng máy GMC
router.get('/dung-may/list', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // SỬA LẠI QUERY ĐỂ LẤY ĐỦ THÔNG TIN GIỜ LÀM VIỆC VÀ MÃ CA
    db.all(`
    SELECT 
        dm.*,
        -- Ưu tiên lấy từ bảng dừng máy trước, nếu không có thì lấy từ bảng chính
        COALESCE(dm.ca, bcg.ca) as ca,
        COALESCE(dm.gio_lam_viec, bcg.gio_lam_viec) as gio_lam_viec,
        COALESCE(dm.ma_ca, bcg.ma_ca) as ma_ca,
        COALESCE(dm.nguoi_thuc_hien, bcg.nguoi_thuc_hien) as nguoi_thuc_hien,
        COALESCE(dm.may, bcg.may) as may,
        COALESCE(dm.so_phieu_cat_giay, bcg.so_phieu_cat_giay) as so_phieu_cat_giay,
        -- Thêm các trường khác từ bảng chính nếu cần
        bcg.so_ws,
        bcg.thu_tu_cuon
    FROM bao_cao_gmc_dung_may dm
    LEFT JOIN bao_cao_gmc bcg ON dm.bao_cao_id = bcg.id
    ORDER BY dm.created_at DESC
  `, [], (err, rows) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách báo cáo dừng máy GMC:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách báo cáo dừng máy GMC' });
        }

        // Debug log để kiểm tra dữ liệu
        if (rows && rows.length > 0) {
            console.log('Sample stop report data:', {
                id: rows[0].id,
                ca: rows[0].ca,
                gio_lam_viec: rows[0].gio_lam_viec,
                ma_ca: rows[0].ma_ca,
                nguoi_thuc_hien: rows[0].nguoi_thuc_hien,
                may: rows[0].may
            });
        }

        res.json(rows || []);
    });
});

// API lấy chi tiết báo cáo dừng máy GMC
router.get('/dung-may/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const { id } = req.params;

    // SỬA LẠI QUERY ĐỂ LẤY ĐỦ THÔNG TIN
    db.get(`
    SELECT 
        dm.*,
        -- Ưu tiên lấy từ bảng dừng máy trước, nếu không có thì lấy từ bảng chính
        COALESCE(dm.ca, bcg.ca) as ca,
        COALESCE(dm.gio_lam_viec, bcg.gio_lam_viec) as gio_lam_viec,
        COALESCE(dm.ma_ca, bcg.ma_ca) as ma_ca,
        COALESCE(dm.nguoi_thuc_hien, bcg.nguoi_thuc_hien) as nguoi_thuc_hien,
        COALESCE(dm.may, bcg.may) as may,
        COALESCE(dm.so_phieu_cat_giay, bcg.so_phieu_cat_giay) as so_phieu_cat_giay,
        bcg.so_ws,
        bcg.thu_tu_cuon
    FROM bao_cao_gmc_dung_may dm
    LEFT JOIN bao_cao_gmc bcg ON dm.bao_cao_id = bcg.id
    WHERE dm.id = ?
  `, [id], (err, row) => {
        if (err) {
            console.error('Lỗi khi lấy chi tiết báo cáo dừng máy GMC:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy chi tiết báo cáo dừng máy GMC' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo dừng máy GMC' });
        }

        // Debug log
        console.log('Stop report detail:', {
            id: row.id,
            ca: row.ca,
            gio_lam_viec: row.gio_lam_viec,
            ma_ca: row.ma_ca,
            nguoi_thuc_hien: row.nguoi_thuc_hien
        });

        res.json(row);
    });
});

// API xóa báo cáo dừng máy GMC
router.delete('/dung-may/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const { id } = req.params;

    db.run(`DELETE FROM bao_cao_gmc_dung_may WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Lỗi khi xóa báo cáo dừng máy GMC:', err.message);
            return res.status(500).json({ error: 'Lỗi khi xóa báo cáo dừng máy GMC' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo dừng máy GMC để xóa' });
        }

        res.json({ success: true, message: 'Đã xóa báo cáo dừng máy GMC thành công' });
    });
});

// API lưu báo cáo dừng máy độc lập
router.post('/dung-may/submit', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const reportData = req.body;
    if (!reportData) {
        return res.status(400).json({ error: 'Dữ liệu báo cáo không hợp lệ' });
    }

    console.log('Nhận dữ liệu báo cáo dừng máy GMC từ client:', reportData);

    // Lấy STT mới nhất cho báo cáo dừng máy
    db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_gmc_dung_may`, [], (err, sttRow) => {
        if (err) {
            console.error('Lỗi khi lấy STT mới nhất cho dừng máy:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy STT mới nhất cho dừng máy' });
        }

        // Tạo ID duy nhất cho báo cáo
        const reportId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const stt = (sttRow?.max_stt || 0) + 1;

        // Tạo báo cáo GMC trống để làm báo cáo cha cho báo cáo dừng máy
        const gmcId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

        db.run(`INSERT INTO bao_cao_gmc (
            id, stt, ca, gio_lam_viec, ma_ca, ngay, may, nguoi_thuc_hien, dung_may
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                gmcId,
                stt,
                reportData.ca || '',
                reportData.gio_lam_viec || '', // THÊM MỚI
                reportData.ma_ca || '',        // THÊM MỚI
                new Date().toISOString().slice(0, 10),
                reportData.may || '',
                reportData.nguoi_thuc_hien || '',
                1
            ], function (err) {
                if (err) {
                    console.error('Lỗi khi tạo báo cáo GMC trống:', err.message);
                    return res.status(500).json({ error: 'Lỗi khi tạo báo cáo GMC trống' });
                }
        
                // Thực hiện lưu dữ liệu báo cáo dừng máy
                db.run(`INSERT INTO bao_cao_gmc_dung_may (
                id, bao_cao_id, stt, ca, gio_lam_viec, ma_ca, nguoi_thuc_hien, may, so_phieu_cat_giay,
                ly_do, ly_do_khac, thoi_gian_dung, thoi_gian_chay_lai, thoi_gian_dung_may, ghi_chu
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        reportId,
                        gmcId,
                        stt,
                        reportData.ca || '',
                        reportData.gio_lam_viec || '', // THÊM MỚI
                        reportData.ma_ca || '',        // THÊM MỚI
                        reportData.nguoi_thuc_hien || '',
                        reportData.may || '',
                        reportData.so_phieu_cat_giay || '',
                        reportData.ly_do || '',
                        reportData.ly_do_khac || '',
                        reportData.thoi_gian_dung || '',
                        reportData.thoi_gian_chay_lai || '',
                        reportData.thoi_gian_dung_may || '',
                        reportData.ghi_chu || ''
                    ], function (err) {
                        if (err) {
                            console.error('Lỗi khi lưu báo cáo dừng máy GMC:', err.message);
                            // Xóa báo cáo GMC trống nếu không thể tạo báo cáo dừng máy
                            db.run(`DELETE FROM bao_cao_gmc WHERE id = ?`, [gmcId]);
                            return res.status(500).json({ error: 'Lỗi khi lưu báo cáo dừng máy GMC: ' + err.message });
                        }

                        console.log('Đã lưu báo cáo dừng máy GMC thành công với ID:', reportId);
                        res.json({
                            success: true,
                            id: reportId,
                            message: 'Đã lưu báo cáo dừng máy GMC thành công'
                        });
                    });
            });
    });
});


// Thêm vào file bao-cao-gmc.js - API để tính lại số tấm xén cho tất cả báo cáo
router.put('/tinh-lai-so-tam-xen', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        console.log('🚀 Bắt đầu tính lại số tấm xén cho toàn bộ báo cáo GMC...');
        
        // Lấy tất cả báo cáo GMC có đủ dữ liệu
        const allReports = await new Promise((resolve, reject) => {
            db.all(`SELECT id, kho_mm, kho_xen, dai_mm, dai_xen, so_tam_cat_duoc, xa_doi, so_tam_xen
                    FROM bao_cao_gmc 
                    WHERE kho_mm IS NOT NULL AND kho_xen IS NOT NULL 
                    AND dai_mm IS NOT NULL AND dai_xen IS NOT NULL 
                    AND so_tam_cat_duoc IS NOT NULL`, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        console.log(`📊 Tìm thấy ${allReports.length} báo cáo GMC có đủ dữ liệu để tính số tấm xén`);
        
        let updatedCount = 0;
        let errorCount = 0;
        let unchangedCount = 0;
        
        for (const report of allReports) {
            try {
                // Tính số tấm xén mới
                const soTamXenMoi = tinhSoTamXen(
                    report.kho_mm,           // Khổ gốc 
                    report.kho_xen,          // Khổ xén
                    report.dai_mm,           // Dài
                    report.dai_xen,          // Dài xén
                    report.so_tam_cat_duoc,  // Số tấm cắt được
                    parseInt(report.xa_doi) || 0 // Xả đôi
                );
                
                const soTamXenMoiRounded = Math.round(soTamXenMoi);
                const soTamXenCu = parseInt(report.so_tam_xen) || 0;
                
                // Chỉ cập nhật nếu giá trị thay đổi
                if (soTamXenMoiRounded !== soTamXenCu) {
                    await new Promise((resolve, reject) => {
                        db.run(`UPDATE bao_cao_gmc SET so_tam_xen = ? WHERE id = ?`, 
                            [soTamXenMoiRounded.toString(), report.id], function(err) {
                            if (err) reject(err);
                            else resolve(this.changes);
                        });
                    });
                    
                    console.log(`✅ Cập nhật báo cáo ID ${report.id}: ${soTamXenCu} -> ${soTamXenMoiRounded}`);
                    updatedCount++;
                } else {
                    unchangedCount++;
                }
                
            } catch (error) {
                console.error(`❌ Lỗi khi tính số tấm xén cho báo cáo ID ${report.id}:`, error);
                errorCount++;
            }
        }
        
        console.log(`🎉 Hoàn thành tính lại số tấm xén!`);
        console.log(`✅ Đã cập nhật: ${updatedCount} báo cáo`);
        console.log(`➖ Không thay đổi: ${unchangedCount} báo cáo`);
        console.log(`❌ Lỗi: ${errorCount} báo cáo`);
        
        res.json({
            success: true,
            message: 'Đã tính lại số tấm xén cho toàn bộ báo cáo GMC thành công',
            summary: {
                totalReports: allReports.length,
                updated: updatedCount,
                unchanged: unchangedCount,
                errors: errorCount
            }
        });
        
    } catch (error) {
        console.error('❌ Lỗi khi tính lại số tấm xén:', error);
        res.status(500).json({ 
            error: 'Lỗi khi tính lại số tấm xén: ' + error.message 
        });
    }
});



module.exports = router;