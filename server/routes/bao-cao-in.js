    const express = require('express');
const router = express.Router();
const { db } = require('../db');
const nodemailer = require('nodemailer');

// Cấu hình email transporter
const emailTransporter = nodemailer.createTransport({
    service: 'gmail', // hoặc 'outlook', 'yahoo'
    auth: {
        user: process.env.EMAIL_USER || 'rd04@visingpack.com', // Thay bằng email của bạn
        pass: process.env.EMAIL_PASS || 'aeme fdfg byvv tqns'     // Thay bằng app password
    }
});

// Danh sách email nhận cảnh báo
const ALERT_EMAIL_LIST = [
    'tuogvy2604@gmail.com',
    'thien.lam@visingpack.com',
    // 'supervisor@company.com'
    // Thêm các email cần nhận cảnh báo
];


function parseFormattedNumber(value) {
    if (!value) return '';
    return value.toString().replace(/,/g, '');
}

// Hàm làm tròn theo yêu cầu
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

// Hàm tính số tuần trong tháng
function calculateWeekInMonth(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    
    // Lấy ngày đầu tháng
    const firstDayOfMonth = new Date(year, month, 1);
    
    // Lấy ngày của tháng hiện tại
    const dayOfMonth = date.getDate();
    
    // Tính tuần thứ mấy trong tháng (1-6)
    const weekOfMonth = Math.ceil(dayOfMonth / 7);
    
    console.log(`Tính tuần: Ngày ${dateString} -> Tuần ${weekOfMonth} trong tháng ${month + 1}/${year}`);
    
    return weekOfMonth;
}








// Hàm tính tốc độ in (s/h)
function calculatePrintingSpeed(thanhPhamIn, tgChayMayPhut) {
    if (!thanhPhamIn || parseFloat(thanhPhamIn) === 0) return 0;
    if (!tgChayMayPhut || tgChayMayPhut === 0) return 0;
    
    const speed = (parseFloat(thanhPhamIn) * 60) / tgChayMayPhut;
    return Math.round(speed);
}

// Hàm tính tổng thời gian dừng máy (phút)
function calculateTotalStopTimeMinutes(dungMayArray) {
    if (!Array.isArray(dungMayArray) || dungMayArray.length === 0) return 0;
    
    let totalMinutes = 0;
    dungMayArray.forEach(stopReport => {
        if (stopReport.thoiGianDung && stopReport.thoiGianChayLai) {
            try {
                const start = new Date(stopReport.thoiGianDung);
                const end = new Date(stopReport.thoiGianChayLai);
                const diffMinutes = Math.floor((end - start) / (1000 * 60));
                if (diffMinutes > 0) totalMinutes += diffMinutes;
            } catch (error) {
                console.warn('Lỗi tính thời gian dừng máy:', error);
            }
        }
    });
    return totalMinutes;
}

// Hàm gửi email cảnh báo tốc độ
async function sendSpeedAlertEmail(reportData, speed, thanhPhamIn, tgChayMayPhut) {
    try {
        let speedText = '';
        let alertType = '';
        
        if (speed === 0) {
            speedText = 'Tốc độ = 0 s/h';
            alertType = 'CẢNH BÁO: Có thành phẩm nhưng tốc độ = 0';
        } else {
            speedText = `Tốc độ ${speed.toLocaleString()} s/h`;
            alertType = 'CẢNH BÁO: Vượt quá 12,000 s/h';
        }

        const subject = `${alertType} - WS: ${reportData.ws}`;
        
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
            <h2 style="color: #d32f2f; text-align: center;">${alertType}</h2>
            
            <p><strong>Dear Manager,</strong></p>
            <p>Hãy kiểm tra thông tin WS dưới đây:</p>
            
            <!-- Thông tin chính - Layout ngang -->
            <div style="display: table; width: 100%; margin: 20px 0;">
                <div style="display: table-row;">
                    <div style="display: table-cell; width: 50%; vertical-align: top; padding-right: 10px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="background-color: #e3f2fd;">
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; width: 40%;">WS:</td>
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #1976d2;">${reportData.ws || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">Máy:</td>
                                <td style="border: 1px solid #ddd; padding: 12px;">${reportData.may || 'N/A'}</td>
                            </tr>
                            <tr style="background-color: #f5f5f5;">
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">KH:</td>
                                <td style="border: 1px solid #ddd; padding: 12px;">${reportData.khach_hang || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">MSP:</td>
                                <td style="border: 1px solid #ddd; padding: 12px;">${reportData.ma_sp || 'N/A'}</td>
                            </tr>
                            <tr style="background-color: #f5f5f5;">
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">SL:</td>
                                <td style="border: 1px solid #ddd; padding: 12px;">${reportData.sl_don_hang || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">Số màu:</td>
                                <td style="border: 1px solid #ddd; padding: 12px;">${reportData.so_mau || 'N/A'}</td>
                            </tr>
                            <tr style="background-color: #e8f5e8;">
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">Thành phẩm in:</td>
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #388e3c;">${thanhPhamIn.toLocaleString()}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="display: table-cell; width: 50%; vertical-align: top; padding-left: 10px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="background-color: #fff3e0;">
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; width: 40%;">TG Bắt đầu:</td>
                                <td style="border: 1px solid #ddd; padding: 12px;">${formatDateTime(reportData.thoi_gian_bat_dau)}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">TG Kết thúc:</td>
                                <td style="border: 1px solid #ddd; padding: 12px;">${formatDateTime(reportData.thoi_gian_ket_thuc)}</td>
                            </tr>
                            <tr style="background-color: #f5f5f5;">
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">TG Chạy máy:</td>
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #388e3c;">${tgChayMayPhut} phút</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">TG Canh máy:</td>
                                <td style="border: 1px solid #ddd; padding: 12px;">${reportData.thoi_gian_canh_may || '0'} phút</td>
                            </tr>
                            <tr style="background-color: #f5f5f5;">
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">TG Dừng máy:</td>
                                <td style="border: 1px solid #ddd; padding: 12px;">${reportData.tg_dung_may || '0'} phút</td>
                            </tr>
                            <tr style="background-color: ${speed === 0 ? '#ffebee' : speed > 12000 ? '#fff3e0' : '#f5f5f5'};">
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #d32f2f;">Tốc độ:</td>
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #d32f2f;">${speedText}</td>
                            </tr>
                            <tr style="background-color: ${speed === 0 ? '#ffcdd2' : speed > 12000 ? '#ffcc02' : '#f5f5f5'};">
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #d32f2f;">Vượt quá:</td>
                                <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold; color: #d32f2f;">
                                    ${speed === 0 ? 'N/A (Tốc độ = 0)' : speed > 12000 ? `${(speed - 12000).toLocaleString()} s/h` : 'Trong tiêu chuẩn'}
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            
            <div style="background-color: #ffebee; padding: 20px; border-left: 6px solid #d32f2f; margin: 30px 0; border-radius: 4px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 32px;">⚠️</div>
                    <div>
                        <h3 style="margin: 0; color: #d32f2f; font-size: 18px;">CẢNH BÁO TỐC ĐỘ</h3>
                        <p style="margin: 5px 0 0; color: #d32f2f; font-weight: bold; font-size: 16px;">
                            ${speed === 0 ? 'Có thành phẩm in nhưng tốc độ = 0' : `Vượt quá tiêu chuẩn ${(speed - 12000).toLocaleString()} s/h`}
                        </p>
                    </div>
                </div>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; color: #495057; line-height: 1.6;">
                    <strong>🎯 Vui lòng kiểm tra và xử lý ngay lập tức</strong><br>
                    để đảm bảo chất lượng và hiệu suất sản xuất.
                </p>
            </div>
            
            <hr style="border: none; border-top: 2px solid #dee2e6; margin: 40px 0;">
            <div style="text-align: center; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <p style="font-size: 14px; color: #6c757d; margin: 0;">
                    <strong>Best regards,</strong><br>
                    🤖 Hệ thống báo cáo tự động<br>
                    📅 ${new Date().toLocaleString('vi-VN')}
                </p>
            </div>
            
            <!-- Responsive cho mobile -->
            <style>
                @media only screen and (max-width: 600px) {
                    div[style*="display: table"] {
                        display: block !important;
                    }
                    div[style*="display: table-row"] {
                        display: block !important;
                    }
                    div[style*="display: table-cell"] {
                        display: block !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin-bottom: 20px !important;
                    }
                }
            </style>
        </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'rd04@visingpack.com',
            to: ALERT_EMAIL_LIST.join(','),
            subject: subject,
            html: htmlContent
        };

        const result = await emailTransporter.sendMail(mailOptions);
        
        console.log('✅ Đã gửi email cảnh báo tốc độ thành công:', {
            ws: reportData.ws,
            speed: speed,
            messageId: result.messageId,
            recipients: ALERT_EMAIL_LIST.length
        });
        
        return true;

    } catch (error) {
        console.error('❌ Lỗi khi gửi email cảnh báo tốc độ:', error);
        return false;
    }
}

// Hàm format datetime cho email
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('vi-VN');
    } catch (error) {
        return dateString;
    }
}

// Hàm kiểm tra và gửi email cảnh báo tốc độ
async function checkAndSendSpeedAlert(reportData, thanhPhamIn, tgChayMayPhut) {
    try {
        const speed = calculatePrintingSpeed(thanhPhamIn, tgChayMayPhut);
        
        // Điều kiện gửi email: tốc độ > 12000 hoặc (tốc độ = 0 và có thành phẩm in > 0)
        const shouldAlert = (speed > 12000) || (speed === 0 && parseFloat(thanhPhamIn) > 0);
        
        if (shouldAlert) {
            console.log('🚨 Phát hiện tốc độ bất thường:', {
                ws: reportData.ws,
                speed: speed,
                thanhPhamIn: thanhPhamIn,
                tgChayMayPhut: tgChayMayPhut
            });
            
            // Gửi email cảnh báo
            await sendSpeedAlertEmail(reportData, speed, thanhPhamIn, tgChayMayPhut);
        }
        
        return { speed, shouldAlert };
    } catch (error) {
        console.error('Lỗi khi kiểm tra và gửi cảnh báo tốc độ:', error);
        return { speed: 0, shouldAlert: false };
    }
}





















// Hàm tính số lần chạy
async function calculateSoLanChay(ws, tuychonText, existingReports) {
    if (!ws || ws.trim() === '') return '';
    
    console.log(`🔍 Tính số lần chạy: WS=${ws}, Tùy chọn=${tuychonText}`);
    
    // **BƯỚC 1: THÊM ĐẦY ĐỦ MAP TÙY CHỌN**
    const tuychonValueMap = {
        '1. IN': '1',
        '2. IN + CÁN BÓNG': '2', 
        '3. CÁN BÓNG': '3',
        '4. IN DẶM': '4',
        '5. IN DẶM + CÁN BÓNG': '5',
        '6. CÁN BÓNG LẠI': '6',
        '7. IN DẶM (GIA CÔNG)': '7',
        '8. IN DẶM + CÁN BÓNG (GIA CÔNG)': '8',
        '9. CÁN BÓNG LẠI (GIA CÔNG)': '9'
    };
    
    const tuychonValue = tuychonValueMap[tuychonText];
    
    // **BƯỚC 2: TÙY CHỌN 4,5,6 → SỐ LẦN CHẠY = 0**
    if (['4', '5', '6'].includes(tuychonValue)) {
        console.log(`✅ Tùy chọn ${tuychonText} -> Số lần chạy = 0`);
        return 0;
    }
    
    // **BƯỚC 3: TÙY CHỌN 1,2,3,7,8,9 → ĐẾM SỐ LẦN CHẠY**
const samePairs = existingReports.filter(report => 
    report.ws === ws && report.tuy_chon === tuychonText
);
    
    const soLanChay = samePairs.length + 1;
    console.log(`✅ Tùy chọn ${tuychonText} -> Số lần chạy = ${soLanChay} (${samePairs.length} báo cáo trước + 1)`);
    
    return soLanChay;
}


// Hàm tính thành phẩm dựa trên ghép cặp tùy chọn
async function calculateThanhPham(currentReportId, wsValue, tuychonText, tongSoLuong) {
    try {
        console.log(`🔍 Backend calculateThanhPham: WS=${wsValue}, Tùy chọn=${tuychonText}, Tổng SL=${tongSoLuong}`);
        
        // ĐƠN GIẢN: Chỉ trả về tổng số lượng, để frontend tính toán chi tiết
        return parseFloat(tongSoLuong) || 0;
        
    } catch (error) {
        console.error('Lỗi khi tính thành phẩm:', error);
        return parseFloat(tongSoLuong) || 0;
    }
}



// Hàm cập nhật lại thành phẩm của TẤT CẢ báo cáo production khi có thay đổi
async function updateRelatedReportsThanhPham(wsValue, tuychonText, currentReportId) {
    try {
        // console.log(`🔍 [DEBUG] updateRelatedReportsThanhPham được gọi: WS=${wsValue}, Tùy chọn=${tuychonText}`);
        
        if (!wsValue) {
            // console.log(`[DEBUG] Không có WS, bỏ qua`);
            return;
        }
        
        // LUÔN LUÔN cập nhật các báo cáo production (1,2,3) bất kể tùy chọn hiện tại là gì
        // console.log(`[DEBUG] Tìm kiếm TẤT CẢ báo cáo production (1,2,3) cùng WS để cập nhật...`);
        
        // Tìm TẤT CẢ báo cáo production (1,2,3) cùng WS
        const productionReports = await new Promise((resolve, reject) => {
            db.all(`SELECT id, tong_so_luong, mat_sau, phu_keo, so_pass_in, may, tuy_chon, created_at 
                    FROM bao_cao_in 
                    WHERE ws = ? 
                    AND tuy_chon IN ('1. IN', '2. IN + CÁN BÓNG', '3. CÁN BÓNG')
                    AND tong_so_luong IS NOT NULL 
                    AND tong_so_luong != ''
                    AND tong_so_luong != '0'
                    ORDER BY created_at ASC`, 
                [wsValue], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // console.log(`[DEBUG] Tìm thấy ${productionReports.length} báo cáo production:`, 
        //            productionReports.map(r => `ID:${r.id}-${r.tuy_chon}`));
        
        if (productionReports.length === 0) {
            // console.log(`[DEBUG] Không có báo cáo production nào để cập nhật`);
            return;
        }
        
        // Cập nhật từng báo cáo production
        for (const prodReport of productionReports) {
            // console.log(`[DEBUG] Xử lý báo cáo ID:${prodReport.id} - ${prodReport.tuy_chon}`);
            
            // 🔍 DEBUG: Trước tiên tìm TẤT CẢ waste reports cùng WS để xem có gì
// console.log(`[DEBUG] Tìm TẤT CẢ waste reports cùng WS ${wsValue}...`);
// const allWasteQuery = `SELECT id, phe_lieu, tuy_chon, mat_sau, phu_keo, so_pass_in FROM bao_cao_in 
//                        WHERE ws = ? 
//                        AND tuy_chon IN ('4. IN DẶM', '5. IN DẶM + CÁN BÓNG', '6. CÁN BÓNG LẠI')`;

const allWasteReports = await new Promise((resolve, reject) => {
    db.all(allWasteQuery, [wsValue], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
    });
});

// console.log(`[DEBUG] TẤT CẢ waste reports cùng WS:`, allWasteReports.map(w => 
//     `ID:${w.id}-${w.tuy_chon}-PL:${w.phe_lieu}-MatSau:${w.mat_sau}-PhuKeo:${w.phu_keo}-Pass:${w.so_pass_in}`
// ));

// console.log(`[DEBUG] Production report điều kiện:`, {
//     mat_sau: prodReport.mat_sau || 0,
//     phu_keo: prodReport.phu_keo || '',
//     so_pass_in: prodReport.so_pass_in || ''
// });

const wasteReports = allWasteReports.filter(w => {
    const matSauMatch = (w.mat_sau || 0) === (prodReport.mat_sau || 0);
    const passInMatch = (w.so_pass_in || '') === (prodReport.so_pass_in || '');
    const hasPheLieu = w.phe_lieu && w.phe_lieu !== '' && w.phe_lieu !== '0';
    
    // 🔧 LOẠI BỎ điều kiện phủ keo - waste processes có thể không có phủ keo
    // const phuKeoMatch = (w.phu_keo || '') === (prodReport.phu_keo || '');
    
    // console.log(`[DEBUG] Waste ID:${w.id} - MatSau:${matSauMatch} Pass:${passInMatch} HasPL:${hasPheLieu} (Bỏ qua PhuKeo)`);
    
    return matSauMatch && passInMatch && hasPheLieu;
});
            
            // console.log(`[DEBUG] Tìm thấy ${wasteReports.length} waste reports:`, 
            //            wasteReports.map(w => `ID:${w.id}-${w.tuy_chon}-PL:${w.phe_lieu}`));
            
            const totalWastePL = wasteReports.reduce((sum, w) => sum + (parseFloat(w.phe_lieu) || 0), 0);
            // console.log(`[DEBUG] Tổng phế liệu waste: ${totalWastePL}`);
            
            const tongSoLuong = parseFloat(prodReport.tong_so_luong) || 0;
            const newThanhPham = Math.max(0, tongSoLuong - totalWastePL);
            
            // console.log(`[DEBUG] Tính toán: ${tongSoLuong} - ${totalWastePL} = ${newThanhPham}`);
            
            // Cập nhật thành phẩm
            const updateResult = await new Promise((resolve, reject) => {
                db.run(`UPDATE bao_cao_in SET thanh_pham = ? WHERE id = ?`,
                    [newThanhPham.toString(), prodReport.id], function(err) {
                    if (err) {
                        // console.error(`[DEBUG] Lỗi update ID ${prodReport.id}:`, err);
                        reject(err);
                    } else {
                        // console.log(`[DEBUG] Update thành công ID ${prodReport.id}: ${this.changes} rows affected`);
                        resolve(this.changes);
                    }
                });
            });
        }
        
        // console.log(`✅ [DEBUG] Hoàn thành cập nhật ${productionReports.length} báo cáo production`);
        
    } catch (error) {
        console.error('❌ [DEBUG] Lỗi updateRelatedReportsThanhPham:', error);
    }
}


// // Tính thành phẩm cho một báo cáo cụ thể
// async function calculateThanhPhamForReport(reportId, wsValue, tuychonText) {
//     try {
//         // Lấy thông tin báo cáo
//         const report = await new Promise((resolve, reject) => {
//             db.get(`SELECT * FROM bao_cao_in WHERE id = ?`, [reportId], (err, row) => {
//                 if (err) reject(err);
//                 else resolve(row);
//             });
//         });
        
//         if (!report) return 0;
        
//         const tongSoLuong = parseFloat(report.tong_so_luong) || 0;
        
//         // Lấy tổng phế liệu mới nhất từ waste process tương ứng
//         const wasteMapping = {
//             '1. In': '4. IN DẶM',
//             '2. In + CÁN BÓNG': '5. IN DẶM + CÁN BÓNG',
//             '3. CÁN BÓNG': '6. CÁN BÓNG LẠI'
//         };
        
//         const correspondingWaste = wasteMapping[tuychonText];
//         if (!correspondingWaste) return tongSoLuong;
        
//         // Tìm báo cáo waste mới nhất
//         const latestWaste = await new Promise((resolve, reject) => {
//             db.get(`SELECT tong_phe_lieu FROM bao_cao_in 
//                     WHERE ws = ? AND tuy_chon = ? 
//                     AND mat_sau = ? AND phu_keo = ? AND so_pass_in = ? AND may = ?
//                     AND tong_phe_lieu IS NOT NULL 
//                     ORDER BY created_at DESC LIMIT 1`,
//                 [wsValue, correspondingWaste, report.mat_sau || 0, report.phu_keo || '', 
//                  report.so_pass_in || '', report.may || ''], (err, row) => {
//                 if (err) reject(err);
//                 else resolve(row);
//             });
//         });
        
//         if (latestWaste && latestWaste.tong_phe_lieu) {
//             const tongPheLieu = parseFloat(latestWaste.tong_phe_lieu) || 0;
//             return Math.max(0, tongSoLuong - tongPheLieu);
//         }
        
//         return tongSoLuong;
        
//     } catch (error) {
//         console.error('Lỗi khi tính thành phẩm cho báo cáo:', error);
//         return 0;
//     }
// }




// API cập nhật các báo cáo liên quan
router.post('/update-related-reports', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    try {
        const { ws, tuychonValue } = req.body;
        
        if (!ws || !tuychonValue) {
            return res.status(400).json({ error: 'Thiếu thông tin WS hoặc tùy chọn' });
        }
        
        // Map value -> text
        const valueToTextMap = {
            '4': '4. IN DẶM',
            '5': '5. IN DẶM + CÁN BÓNG',
            '6': '6. CÁN BÓNG LẠI',
            '7': '7. IN DẶM (GIA CÔNG)',
            '8': '8. IN DẶM + CÁN BÓNG (GIA CÔNG)',
            '9': '9. CÁN BÓNG LẠI (GIA CÔNG)'
        };
        
        const tuychonText = valueToTextMap[tuychonValue];
        if (!tuychonText) {
            return res.json({ success: true, message: 'Không cần cập nhật' });
        }
        
        // Gọi hàm cập nhật
        await updateRelatedReportsThanhPham(ws, tuychonText, null);
        
        res.json({ success: true, message: 'Đã cập nhật báo cáo liên quan' });
        
    } catch (error) {
        console.error('Lỗi API cập nhật báo cáo liên quan:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật báo cáo liên quan' });
    }
});




// Hàm tính tổng với cộng dồn theo điều kiện chung
async function calculateTongWithSum(fieldName, currentReportId, wsValue, tuychonText, currentReport) {
    try {
        console.log(`🔍 Backend tính tổng ${fieldName}: WS=${wsValue}, Tùy chọn=${tuychonText}`);
        
        if (!wsValue || !tuychonText || !currentReport) {
            return 0;
        }

        // Tìm tất cả báo cáo có cùng điều kiện (trừ báo cáo hiện tại)
        const matchingReports = await new Promise((resolve, reject) => {
            db.all(`SELECT ${fieldName}, thanh_pham_in, phe_lieu, phe_lieu_trang FROM bao_cao_in 
                    WHERE ws = ? AND tuy_chon = ? 
                    AND COALESCE(mat_sau, 0) = ? 
                    AND COALESCE(so_pass_in, '') = ? 
                    AND COALESCE(phu_keo, '') = ? 
                    AND id != ? 
                    AND ${fieldName} IS NOT NULL 
                    AND ${fieldName} != ''
                    ORDER BY created_at ASC`, 
                [
                    wsValue, 
                    tuychonText,
                    currentReport.mat_sau || 0,
                    currentReport.so_pass_in || '',
                    currentReport.phu_keo || '',
                    currentReportId
                ], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        // Tính tổng từ các báo cáo matching
        let tongCu = 0;
        if (matchingReports.length > 0) {
            tongCu = matchingReports.reduce((total, report) => {
                let value = 0;
                if (fieldName === 'thanh_pham_in') {
                    value = parseFloat(report.thanh_pham_in) || 0;
                } else if (fieldName === 'phe_lieu') {
                    value = parseFloat(report.phe_lieu) || 0;
                } else if (fieldName === 'phe_lieu_trang') {
                    value = parseFloat(report.phe_lieu_trang) || 0;
                }
                return total + value;
            }, 0);
        }

        console.log(`✅ Backend tổng ${fieldName} từ ${matchingReports.length} báo cáo: ${tongCu}`);
        return tongCu;

    } catch (error) {
        console.error(`Lỗi khi tính tổng ${fieldName}:`, error);
        return 0;
    }
}






// API lấy danh sách báo cáo In
router.get('/list', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const dateFilter = req.query.date;
    const excludeStopOnly = req.query.exclude_stop_only;
    let query = `SELECT * FROM bao_cao_in`;
    let params = [];
    let conditions = [];
    
    if (dateFilter) {
        conditions.push(`DATE(created_at) = ?`);
        params.push(dateFilter);
    }
    
    if (excludeStopOnly === 'true') {
        conditions.push(`(ws IS NOT NULL AND ws != '')`);
    }
    
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC, stt DESC`;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách báo cáo In:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách báo cáo In' });
        }
        res.json(rows || []);
    });
});

// API gửi báo cáo In hoàn chỉnh
router.post('/submit', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const reportData = req.body;
    if (!reportData) {
        return res.status(400).json({ error: 'Dữ liệu báo cáo không hợp lệ' });
    }

    try {
        const reportId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const batDau = reportData.batDau || {};
        const ketThuc = reportData.ketThuc || {};
        const nguoiDung = reportData.nguoiDung || {};
        const date = new Date().toISOString().slice(0, 10);

        // Tính ngày phụ dựa trên thời gian kết thúc
        let ngayPhu = date;
        if (ketThuc.thoiGianKetThuc) {
            try {
                const endTime = new Date(ketThuc.thoiGianKetThuc);
                const hours = endTime.getHours();
                const minutes = endTime.getMinutes();
                
                if (hours < 6 || (hours === 6 && minutes <= 10)) {
                    const ngayPhuDate = new Date(date);
                    ngayPhuDate.setDate(ngayPhuDate.getDate() - 1);
                    ngayPhu = ngayPhuDate.toISOString().slice(0, 10);
                } else {
                    ngayPhu = date;
                }
            } catch (error) {
                console.error('Lỗi khi tính ngày phụ:', error);
            }
        }

        // Lấy STT mới nhất
        const sttRow = await new Promise((resolve, reject) => {
            db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_in`, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        const stt = (sttRow?.max_stt || 0) + 1;

        // Lấy danh sách báo cáo hiện có để tính số lần chạy
        const existingReports = await new Promise((resolve, reject) => {
            db.all(`SELECT ws, tuy_chon, tong_phe_lieu FROM bao_cao_in WHERE ws IS NOT NULL AND ws != ''`, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        // Tính số lần chạy
        const soLanChay = await calculateSoLanChay(batDau.ws, batDau.tuychon, existingReports);

        // ✅ NHẬN DỮ LIỆU ĐÃ TÍNH TỪ FRONTEND
        const tongSoLuong = ketThuc.tongSoLuong || 0;
        const tongPheLieu = ketThuc.tongPheLieu || 0;
        const tongPheLieuTrang = ketThuc.tongPhelieuTrang || 0;
        const thanhPham = ketThuc.thanhPham || 0;

        console.log(`✅ Nhận dữ liệu từ frontend:`, {
            tongSoLuong,
            tongPheLieu,
            tongPheLieuTrang,
            thanhPham
        });

        // Lấy dữ liệu từ WS-Tổng
        let wsData = {};
        if (batDau.ws && batDau.ws.trim() !== '') {
            try {
                const wsRow = await new Promise((resolve, reject) => {
                    db.get(`SELECT * FROM ws_tong WHERE so_ws = ?`, [batDau.ws], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                
                if (wsRow) {
                    wsData = {
                        khachHang: wsRow.khach_hang || '',
                        maSP: wsRow.ma_sp || '',
                        slDonHang: wsRow.sl_dh || '',
                        soCon: wsRow.s_con || '',
                        soMau: wsRow.so_mau_in || '',
                        maGiay1: wsRow.loai_giay_1 || '',
                        maGiay2: wsRow.loai_giay_2 || '',
                        maGiay3: wsRow.loai_giay_3 || '',
                        kho: wsRow.kho_1 || '',
                        daiGiay: wsRow.chat_1 || '',
                        slGiayTheoWS: wsRow.sl_giay_can_cat || ''
                    };
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu WS-Tổng:', error);
            }
        }

        // Tính tuần trong tháng
        const tuan = calculateWeekInMonth(date);

        // Tính các chênh lệch
        const slGiayTheoWS = parseFloat(wsData.slGiayTheoWS || '0');
        const chenhLechTTWS = (tongSoLuong + tongPheLieu + tongPheLieuTrang) - slGiayTheoWS;

        // Xử lý số pass in
        let soPassIn = batDau.soPassIn || '';
        if (wsData.soMau) {
            const soDau = parseInt(wsData.soMau.split('-')[0] || '0');
            if (soDau <= 6) {
                soPassIn = 'IN 1 PASS';
            } else if (batDau.may === '2M') {
                soPassIn = 'IN 1 PASS';
            }
        }

        // Lưu vào database
        const insertSQL = `INSERT INTO bao_cao_in (
            id, stt, ngay, may, quan_doc, ca, truong_may, ws, so_lan_chay, ngay_phu,
            khach_hang, ma_sp, sl_don_hang, so_con, so_mau, ma_giay_1, ma_giay_2, ma_giay_3,
            kho, dai_giay, tuy_chon, mau_3_tone, sl_giay_tt_1, sl_giay_tt_2, sl_giay_tt_3,
            so_kem, mat_sau, phu_keo, phun_bot, thoi_gian_canh_may, thoi_gian_bat_dau,
            thoi_gian_ket_thuc, thanh_pham_in, phe_lieu, phe_lieu_trang, ghi_chu,
            tong_so_luong, tong_phe_lieu, tong_phe_lieu_trang, sl_giay_ream, tuan,
            gio_lam_viec, ma_ca, sl_giay_theo_ws, sl_cat, chenh_lech_tt_ws, chenh_lech_tt_scc,
            phu_may_1, phu_may_2, so_pass_in, thanh_pham, dung_may, nguoi_thuc_hien, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await new Promise((resolve, reject) => {
            db.run(insertSQL, [
                reportId, stt, date,
                batDau.may || '',
                batDau.quanDoc || '',
                batDau.ca || '',
                batDau.truongMay || '',
                batDau.ws || '',
                soLanChay,
                ngayPhu,
                wsData.khachHang,
                wsData.maSP,
                wsData.slDonHang,
                wsData.soCon,
                wsData.soMau,
                wsData.maGiay1,
                wsData.maGiay2,
                wsData.maGiay3,
                wsData.kho,
                wsData.daiGiay,
                batDau.tuychon || '',
                batDau.mau3tone || '',
                ketThuc.slGiayTT1 || '',
                ketThuc.slGiayTT2 || '',
                ketThuc.slGiayTT3 || '',
                parseInt(batDau.sokem || '0'),
                batDau.matsau || '',
                batDau.phukeo || '',
                parseInt(batDau.phunbot || '0'),
                ketThuc.canhmay || '',
                batDau.thoiGianBatDau || '',
                ketThuc.thoiGianKetThuc || '',
                ketThuc.thanhphamin || '',
                ketThuc.phelieu || '',
                ketThuc.phelieutrang || '',
                ketThuc.ghiChu || '',
                tongSoLuong.toString(), // ✅ Từ frontend
                tongPheLieu.toString(), // ✅ Từ frontend
                tongPheLieuTrang.toString(), // ✅ Từ frontend
                ketThuc.slGiayReam || '',
                tuan,
                batDau.gioLamViec || '',
                batDau.maCa || '',
                wsData.slGiayTheoWS,
                '', // sl_cat để trống
                chenhLechTTWS.toString(),
                '', // chenh_lech_tt_scc để trống
                batDau.phumay1 || '',
                batDau.phumay2 || '',
                soPassIn,
                thanhPham.toString(), // ✅ Từ frontend
                ketThuc.dungMay ? 1 : 0,
                batDau.nguoiThucHien || '',
                nguoiDung.id || ''
            ], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });

        // Xử lý báo cáo dừng máy nếu có
        if (reportData.dungMay && Array.isArray(reportData.dungMay)) {
            const stopReports = reportData.dungMay;
            const stopSttRow = await new Promise((resolve, reject) => {
                db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_in_dung_may`, [], (err, row) => {
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

                    db.run(`INSERT INTO bao_cao_in_dung_may (
                        id, bao_cao_id, stt, ca, gio_lam_viec, ma_ca, truong_may, ws, may,
                        thoi_gian_dung, thoi_gian_chay_lai, thoi_gian_dung_may, ly_do,
                        ghi_chu, ngay_thang_nam, tuan, ngay
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            stopId, reportId, stopStt,
                            batDau.ca || '',
                            batDau.gioLamViec || '',
                            batDau.maCa || '',
                            batDau.truongMay || '',
                            batDau.ws || '',
                            batDau.may || '',
                            stopReport.thoiGianDung || '',
                            stopReport.thoiGianChayLai || '',
                            stopReport.thoiGianDungMay || '',
                            stopReport.lyDo || '',
                            stopReport.ghiChu || ketThuc.ghiChu || '',
                            date,
                            tuan,
                            date
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



            // Kiểm tra tốc độ và gửi email cảnh báo
try {
    const thanhPhamInValue = parseFloat(ketThuc.thanhphamin || '0');
    
    if (thanhPhamInValue > 0) {
        const tgCanhMay = parseInt(ketThuc.canhmay || '0');
        const tgDungMay = calculateTotalStopTimeMinutes(reportData.dungMay || []);
        
        let tgTongPhut = 0;
        if (batDau.thoiGianBatDau && ketThuc.thoiGianKetThuc) {
            const startTime = new Date(batDau.thoiGianBatDau);
            const endTime = new Date(ketThuc.thoiGianKetThuc);
            tgTongPhut = Math.floor((endTime - startTime) / (1000 * 60));
        }
        
        const tgChayMayPhut = Math.max(0, tgTongPhut - tgCanhMay - tgDungMay);
        
        const alertData = {
            ws: batDau.ws,
            may: batDau.may,
            khach_hang: wsData.khachHang,
            ma_sp: wsData.maSP,
            sl_don_hang: wsData.slDonHang,
            so_mau: wsData.soMau,
            thoi_gian_bat_dau: batDau.thoiGianBatDau,
            thoi_gian_ket_thuc: ketThuc.thoiGianKetThuc,
            thoi_gian_canh_may: tgCanhMay,
            tg_dung_may: tgDungMay
        };
        
        checkAndSendSpeedAlert(alertData, thanhPhamInValue, tgChayMayPhut).catch(error => {
            console.error('Lỗi gửi email cảnh báo tốc độ:', error);
        });
    }
} catch (error) {
    console.error('Lỗi khi kiểm tra tốc độ:', error);
}



        }

        res.json({
            success: true,
            id: reportId,
            message: 'Đã lưu báo cáo In thành công',
            data: {
                so_lan_chay: soLanChay,
                ws_data: wsData,
                tuan: tuan,
                // ✅ Trả về dữ liệu đã tính
                calculations: {
                    tongSoLuong,
                    tongPheLieu,
                    tongPheLieuTrang,
                    thanhPham
                }
            }
        });

    } catch (error) {
        console.error('Lỗi khi gửi báo cáo In:', error);
        res.status(500).json({ 
            error: 'Lỗi khi gửi báo cáo In: ' + error.message
        });
    }
});

// API gửi báo cáo In phần bắt đầu
router.post('/submit-start', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const startData = req.body;
    if (!startData) {
        return res.status(400).json({ error: 'Dữ liệu báo cáo bắt đầu không hợp lệ' });
    }

    try {
        const reportId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const date = new Date().toISOString().slice(0, 10);

        // Lấy STT mới nhất
        const sttRow = await new Promise((resolve, reject) => {
            db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_in`, [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        const stt = (sttRow?.max_stt || 0) + 1;

// Lấy danh sách báo cáo hiện có để tính số lần chạy
const existingReports = await new Promise((resolve, reject) => {
    db.all(`SELECT ws, tuy_chon, tong_phe_lieu FROM bao_cao_in WHERE ws IS NOT NULL AND ws != ''`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
    });
});

// Tính số lần chạy
const soLanChay = await calculateSoLanChay(startData.ws, startData.tuychon, existingReports);
// Tính thành phẩm (mặc định = 0 cho phần bắt đầu)
const thanhPham = 0;

        // Lấy dữ liệu từ WS-Tổng
        let wsData = {};
        if (startData.ws && startData.ws.trim() !== '') {
            try {
                const wsRow = await new Promise((resolve, reject) => {
                    db.get(`SELECT * FROM ws_tong WHERE so_ws = ?`, [startData.ws], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                
                if (wsRow) {
                    wsData = {
                        khachHang: wsRow.khach_hang || '',
                        maSP: wsRow.ma_sp || '',
                        slDonHang: wsRow.sl_dh || '',
                        soCon: wsRow.s_con || '',
                        soMau: wsRow.so_mau_in || '',
                        maGiay1: wsRow.loai_giay_1 || '',
                        maGiay2: wsRow.loai_giay_2 || '',
                        maGiay3: wsRow.loai_giay_3 || '',
                        kho: wsRow.kho_1 || '',
                        daiGiay: wsRow.chat_1 || '',
                        slGiayTheoWS: wsRow.sl_giay_can_cat || ''
                    };
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu WS-Tổng:', error);
            }
        }

        // Lưu vào database (chỉ phần bắt đầu)
        const insertSQL = `INSERT INTO bao_cao_in (
            id, stt, ngay, may, quan_doc, ca, truong_may, ws, so_lan_chay, khach_hang, ma_sp,
            sl_don_hang, so_con, so_mau, ma_giay_1, ma_giay_2, ma_giay_3, kho, dai_giay,
            tuy_chon, mau_3_tone, so_kem, mat_sau, phu_keo, phun_bot, gio_lam_viec,
            ma_ca, phu_may_1, phu_may_2, so_pass_in, thanh_pham, thoi_gian_bat_dau, nguoi_thuc_hien, is_started_only, sl_giay_theo_ws, thanh_pham
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await new Promise((resolve, reject) => {
            db.run(insertSQL, [
                reportId, stt, date,
                startData.may || '',
                startData.quanDoc || '',
                startData.ca || '',
                startData.truongMay || '',
                startData.ws || '',
                soLanChay || 0,
                wsData.khachHang,
                wsData.maSP,
                wsData.slDonHang,
                wsData.soCon,
                wsData.soMau,
                wsData.maGiay1,
                wsData.maGiay2,
                wsData.maGiay3,
                wsData.kho,
                wsData.daiGiay,
                startData.tuychon || '',
                startData.mau3tone || '',
                parseInt(startData.sokem || '0'),
                startData.matsau || '',
                startData.phukeo || '',
                parseInt(startData.phunbot || '0'),
                startData.gioLamViec || '',
                startData.maCa || '',
                startData.phumay1 || '',
                startData.phumay2 || '',
                startData.soPassIn || '',
                thanhPham,
                startData.thoiGianBatDau || '',
                startData.nguoiThucHien || '',
                1,  // Đánh dấu là chỉ mới bắt đầu
                wsData.slGiayTheoWS || '',
                thanhPham
            ], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });



        // Thêm vào danh sách chờ
await new Promise((resolve, reject) => {
    db.run(`INSERT INTO bao_cao_in_cho (
        id, may, ws, quan_doc, ca, gio_lam_viec, ma_ca, truong_may,
        phu_may_1, phu_may_2, tuy_chon, mau_3_tone, so_kem, mat_sau,
        phu_keo, phun_bot, so_pass_in, thoi_gian_bat_dau, nguoi_thuc_hien,
        user_id, bao_cao_chinh_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
        reportId + '_cho',
        startData.may || '',
        startData.ws || '',
        startData.quanDoc || '',
        startData.ca || '',
        startData.gioLamViec || '',
        startData.maCa || '',
        startData.truongMay || '',
        startData.phumay1 || '',
        startData.phumay2 || '',
        startData.tuychon || '',
        startData.mau3tone || '',
        parseInt(startData.sokem || '0'),
        startData.matsau || '',
        startData.phukeo || '',
        parseInt(startData.phunbot || '0'),
        startData.soPassIn || '',
        startData.thoiGianBatDau || '',
        startData.nguoiThucHien || '',
        'user_id_placeholder',
        reportId
    ], (err) => {
        if (err) reject(err);
        else resolve();
    });
});



        res.json({
            success: true,
            id: reportId,
            message: 'Đã lưu báo cáo In bắt đầu thành công'
        });

    } catch (error) {
        console.error('Lỗi khi gửi báo cáo In bắt đầu:', error);
        res.status(500).json({ 
            error: 'Lỗi khi gửi báo cáo In bắt đầu: ' + error.message
        });
    }
});



// API cập nhật báo cáo In phần bắt đầu
router.put('/update-start/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const { id } = req.params;
    const startData = req.body;
    
    if (!id || !startData) {
        return res.status(400).json({ error: 'Dữ liệu cập nhật không hợp lệ' });
    }
    
    try {
        // Lấy dữ liệu từ WS-Tổng nếu có thay đổi WS
        let wsData = {};
        if (startData.ws && startData.ws.trim() !== '') {
            try {
                const wsRow = await new Promise((resolve, reject) => {
                    db.get(`SELECT * FROM ws_tong WHERE so_ws = ?`, [startData.ws], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                
                if (wsRow) {
                    wsData = {
                        khachHang: wsRow.khach_hang || '',
                        maSP: wsRow.ma_sp || '',
                        slDonHang: wsRow.sl_dh || '',
                        soCon: wsRow.s_con || '',
                        soMau: wsRow.so_mau_in || '',
                        maGiay1: wsRow.loai_giay_1 || '',
                        maGiay2: wsRow.loai_giay_2 || '',
                        maGiay3: wsRow.loai_giay_3 || '',
                        kho: wsRow.kho_1 || '',
                        daiGiay: wsRow.chat_1 || ''
                    };
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu WS-Tổng:', error);
            }
        }

        // Cập nhật database
        const updateSQL = `UPDATE bao_cao_in SET 
    quan_doc = ?, ca = ?, truong_may = ?, ws = ?, khach_hang = ?, ma_sp = ?,
    sl_don_hang = ?, so_con = ?, so_mau = ?, ma_giay_1 = ?, ma_giay_2 = ?, ma_giay_3 = ?, 
    kho = ?, dai_giay = ?, tuy_chon = ?, mau_3_tone = ?, so_kem = ?, mat_sau = ?, 
    phu_keo = ?, phun_bot = ?, gio_lam_viec = ?, ma_ca = ?, phu_may_1 = ?, phu_may_2 = ?, so_pass_in = ?, thanh_pham = ?,
    thoi_gian_bat_dau = ?, nguoi_thuc_hien = ?, sl_giay_theo_ws = ?
    WHERE id = ?`;
        
        await new Promise((resolve, reject) => {
            db.run(updateSQL, [
                startData.quanDoc || '',
                startData.ca || '',
                startData.truongMay || '',
                startData.ws || '',
                wsData.khachHang || '',
                wsData.maSP || '',
                wsData.slDonHang || '',
                wsData.soCon || '',
                wsData.soMau || '',
                wsData.maGiay1 || '',
                wsData.maGiay2 || '',
                wsData.maGiay3 || '',
                wsData.kho || '',
                wsData.daiGiay || '',
                startData.tuychon || '',
                startData.mau3tone || '',
                parseInt(startData.sokem || '0'),
                startData.matsau || '',
                startData.phukeo || '',
                parseInt(startData.phunbot || '0'),
                startData.gioLamViec || '',
                startData.maCa || '',
                startData.phumay1 || '',
                startData.phumay2 || '',
                startData.soPassIn || '',
                startData.thoiGianBatDau || '',
                startData.nguoiThucHien || '',
                wsData.slGiayTheoWS || '', 
                id
            ], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        res.json({
            success: true,
            id: id,
            message: 'Đã cập nhật phần bắt đầu báo cáo In thành công'
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật phần bắt đầu báo cáo In:', error);
        res.status(500).json({ 
            error: 'Lỗi khi cập nhật phần bắt đầu báo cáo In: ' + error.message
        });
    }
});

// API cập nhật báo cáo In phần kết thúc
router.put('/update-end/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const { id } = req.params;
    const { ketThuc, dungMay } = req.body;
    
    if (!id || !ketThuc) {
        return res.status(400).json({ error: 'Dữ liệu cập nhật không hợp lệ' });
    }
    
    try {
        // Lấy báo cáo hiện tại
        const currentReport = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM bao_cao_in WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!currentReport) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo In' });
        }

        // Lấy danh sách báo cáo hiện có để tính số lần chạy
        const existingReports = await new Promise((resolve, reject) => {
            db.all(`SELECT ws, tuy_chon, tong_phe_lieu FROM bao_cao_in WHERE ws IS NOT NULL AND ws != '' AND id != ?`, [id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        // Tính số lần chạy
        const soLanChay = await calculateSoLanChay(currentReport.ws, currentReport.tuy_chon, existingReports);

        
        // Tính ngày phụ dựa trên thời gian kết thúc
        let ngayPhu = currentReport.ngay;
        if (ketThuc.thoiGianKetThuc) {
            try {
                const endTime = new Date(ketThuc.thoiGianKetThuc);
                const hours = endTime.getHours();
                const minutes = endTime.getMinutes();
                
                if (hours < 6 || (hours === 6 && minutes <= 10)) {
                    const ngayPhuDate = new Date(currentReport.ngay);
                    ngayPhuDate.setDate(ngayPhuDate.getDate() - 1);
                    ngayPhu = ngayPhuDate.toISOString().slice(0, 10);
                } else {
                    ngayPhu = currentReport.ngay;
                }
            } catch (error) {
                console.error('Lỗi khi tính ngày phụ:', error);
            }
        }


        // Tính tuần trong tháng
        const tuan = calculateWeekInMonth(ngayPhu);

        // ✅ NHẬN DỮ LIỆU ĐÃ TÍNH TỪ FRONTEND
        const thanhPhamIn = parseFloat(ketThuc.thanhphamin || '0');
        const tongSoLuong = ketThuc.tongSoLuong || 0;
        const tongPheLieu = ketThuc.tongPheLieu || 0;
        const tongPheLieuTrang = ketThuc.tongPhelieuTrang || 0;
        const thanhPham = ketThuc.thanhPham || 0;

        console.log(`✅ Backend update-end nhận dữ liệu từ frontend:`, {
            thanhPhamIn,
            tongSoLuong,
            tongPheLieu,
            tongPheLieuTrang,
            thanhPham
        });

        const slGiayTheoWS = parseFloat(currentReport.sl_giay_theo_ws || '0');
        const chenhLechTTWS = (tongSoLuong + tongPheLieu + tongPheLieuTrang) - slGiayTheoWS;

        // Cập nhật database
        const updateSQL = `UPDATE bao_cao_in SET 
            thoi_gian_ket_thuc = ?, thoi_gian_canh_may = ?, thanh_pham_in = ?, phe_lieu = ?, 
            phe_lieu_trang = ?, ghi_chu = ?, tong_so_luong = ?, tong_phe_lieu = ?, 
            tong_phe_lieu_trang = ?, sl_giay_ream = ?, tuan = ?, chenh_lech_tt_ws = ?,
            sl_giay_tt_1 = ?, sl_giay_tt_2 = ?, sl_giay_tt_3 = ?, dung_may = ?, is_started_only = ?, ngay_phu = ?, so_lan_chay = ?, thanh_pham = ? 
            WHERE id = ?`;
        
        await new Promise((resolve, reject) => {
            db.run(updateSQL, [
                ketThuc.thoiGianKetThuc || new Date().toISOString(),
                ketThuc.canhmay || '',
                thanhPhamIn.toString(),
                ketThuc.phelieu || '',
                ketThuc.phelieutrang || '',
                ketThuc.ghiChu || '',
                tongSoLuong.toString(), // ✅ Từ frontend
                tongPheLieu.toString(), // ✅ Từ frontend  
                tongPheLieuTrang.toString(), // ✅ Từ frontend
                ketThuc.slGiayReam || '',
                tuan,
                chenhLechTTWS.toString(),
                parseFormattedNumber(ketThuc.slGiayTT1) || '',
parseFormattedNumber(ketThuc.slGiayTT2) || '',
parseFormattedNumber(ketThuc.slGiayTT3) || '',
                ketThuc.dungMay ? 1 : 0,
                0,  // Đánh dấu đã hoàn thành
                ngayPhu,
                soLanChay || 0,
                thanhPham.toString(), // ✅ Từ frontend
                id
            ], function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });

        // Xử lý báo cáo dừng máy nếu có
        if (dungMay && Array.isArray(dungMay)) {
            const stopSttRow = await new Promise((resolve, reject) => {
                db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_in_dung_may`, [], (err, row) => {
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

                    db.run(`INSERT INTO bao_cao_in_dung_may (
                        id, bao_cao_id, stt, ca, gio_lam_viec, ma_ca, truong_may, ws, may,
                        thoi_gian_dung, thoi_gian_chay_lai, thoi_gian_dung_may, ly_do,
                        ghi_chu, ngay_thang_nam, tuan, ngay
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            stopId, id, stopStt,
                            currentReport.ca || '',
                            currentReport.gio_lam_viec || '',
                            currentReport.ma_ca || '',
                            currentReport.truong_may || '',
                            currentReport.ws || '',
                            currentReport.may || '',
                            stopReport.thoiGianDung || '',
                            stopReport.thoiGianChayLai || '',
                            stopReport.thoiGianDungMay || '',
                            stopReport.lyDo || '',
                            stopReport.ghiChu || ketThuc.ghiChu || '',
                            currentReport.ngay,
                            tuan,
                            currentReport.ngay
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

        // 🔍 DEBUG: Luôn gọi cập nhật cho TẤT CẢ báo cáo (không chỉ waste)
console.log(`🔍 [DEBUG] update-end gọi updateRelatedReportsThanhPham: WS=${currentReport.ws}, Tùy chọn=${currentReport.tuy_chon}`);
await updateRelatedReportsThanhPham(currentReport.ws, currentReport.tuy_chon, id);
console.log(`🔍 [DEBUG] Đã hoàn thành gọi updateRelatedReportsThanhPham`);



// Xóa khỏi danh sách chờ khi hoàn thành
await new Promise((resolve, reject) => {
    db.run(`DELETE FROM bao_cao_in_cho WHERE bao_cao_chinh_id = ?`, [id], (err) => {
        if (err) {
            console.warn('Không thể xóa khỏi danh sách chờ:', err.message);
        }
        resolve(); // Không reject để không ảnh hưởng luồng chính
    });
});








// Kiểm tra tốc độ và gửi email cảnh báo
try {
    const thanhPhamInValue = parseFloat(ketThuc.thanhphamin || '0');
    
    if (thanhPhamInValue > 0) {
        const tgCanhMay = parseInt(ketThuc.canhmay || '0');
        const tgDungMay = calculateTotalStopTimeMinutes(dungMay || []);
        
        let tgTongPhut = 0;
        if (currentReport.thoi_gian_bat_dau && ketThuc.thoiGianKetThuc) {
            const startTime = new Date(currentReport.thoi_gian_bat_dau);
            const endTime = new Date(ketThuc.thoiGianKetThuc);
            tgTongPhut = Math.floor((endTime - startTime) / (1000 * 60));
        }
        
        const tgChayMayPhut = Math.max(0, tgTongPhut - tgCanhMay - tgDungMay);
        
        const alertData = {
            ws: currentReport.ws,
            may: currentReport.may,
            khach_hang: currentReport.khach_hang,
            ma_sp: currentReport.ma_sp,
            sl_don_hang: currentReport.sl_don_hang,
            so_mau: currentReport.so_mau,
            thoi_gian_bat_dau: currentReport.thoi_gian_bat_dau,
            thoi_gian_ket_thuc: ketThuc.thoiGianKetThuc,
            thoi_gian_canh_may: tgCanhMay,
            tg_dung_may: tgDungMay
        };
        
        // Gửi email cảnh báo (không chờ kết quả để không ảnh hưởng response)
        checkAndSendSpeedAlert(alertData, thanhPhamInValue, tgChayMayPhut).catch(error => {
            console.error('Lỗi gửi email cảnh báo tốc độ:', error);
        });
    }
} catch (error) {
    console.error('Lỗi khi kiểm tra tốc độ:', error);
}





        res.json({
            success: true,
            id: id,
            message: 'Đã cập nhật phần kết thúc báo cáo In thành công',
            data: {
                calculations: {
                    thanhPhamIn,
                    tongSoLuong,
                    tongPheLieu,
                    tongPheLieuTrang,
                    thanhPham
                }
            }
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật phần kết thúc báo cáo In:', error);
        res.status(500).json({ 
            error: 'Lỗi khi cập nhật phần kết thúc báo cáo In: ' + error.message
        });
    }
});

// API lấy chi tiết báo cáo In
router.get('/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const { id } = req.params;

    db.get(`SELECT * FROM bao_cao_in WHERE id = ?`, [id], (err, report) => {
        if (err) {
            console.error('Lỗi khi lấy chi tiết báo cáo In:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy chi tiết báo cáo In' });
        }

        if (!report) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo In' });
        }

        // Lấy thông tin dừng máy nếu có
        db.all(`SELECT * FROM bao_cao_in_dung_may WHERE bao_cao_id = ?`, [id], (err, stopReports) => {
            if (err) {
                console.error('Lỗi khi lấy thông tin dừng máy:', err.message);
                return res.status(500).json({ error: 'Lỗi khi lấy thông tin dừng máy' });
            }

            report.dungMay = stopReports || [];
            res.json(report);
        });
    });
});

// API xóa báo cáo In
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
        db.run(`DELETE FROM bao_cao_in_dung_may WHERE bao_cao_id = ?`, [id], (err) => {
            if (err) {
                console.error('Lỗi khi xóa báo cáo dừng máy:', err.message);
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Lỗi khi xóa báo cáo dừng máy' });
            }

            // Xóa báo cáo chính
            db.run(`DELETE FROM bao_cao_in WHERE id = ?`, [id], function (err) {
                if (err) {
                    console.error('Lỗi khi xóa báo cáo In:', err.message);
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Lỗi khi xóa báo cáo In' });
                }

                if (this.changes === 0) {
                    db.run('ROLLBACK');
                    return res.status(404).json({ error: 'Không tìm thấy báo cáo In để xóa' });
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
                        message: 'Đã xóa báo cáo In thành công'
                    });
                });
            });
        });
    });
});


router.delete('/dung-may/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID báo cáo dừng máy không hợp lệ' });
    }

    db.run(`DELETE FROM bao_cao_in_dung_may WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error('Lỗi khi xóa báo cáo dừng máy:', err.message);
            return res.status(500).json({ error: 'Lỗi khi xóa báo cáo dừng máy' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Không tìm thấy báo cáo dừng máy để xóa' });
        }

        res.json({
            success: true,
            message: 'Đã xóa báo cáo dừng máy thành công'
        });
    });
});



// API lấy danh sách báo cáo dừng máy In
router.get('/dung-may/list', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const dateFilter = req.query.date;
    const machineFilter = req.query.machine;
    
    let query = `
        SELECT 
            dm.*,
            COALESCE(dm.ca, bci.ca) as ca,
            COALESCE(dm.gio_lam_viec, bci.gio_lam_viec) as gio_lam_viec,
            COALESCE(dm.ma_ca, bci.ma_ca) as ma_ca,
            COALESCE(dm.truong_may, bci.truong_may) as truong_may,
            COALESCE(dm.may, bci.may) as may,
            COALESCE(dm.ws, bci.ws) as ws,
            bci.so_lan_chay
        FROM bao_cao_in_dung_may dm
        LEFT JOIN bao_cao_in bci ON dm.bao_cao_id = bci.id
    `;
    
    let params = [];
    let conditions = [];
    
    if (dateFilter) {
        conditions.push(`DATE(dm.ngay) = ?`);
        params.push(dateFilter);
    }
    
    if (machineFilter) {
        conditions.push(`COALESCE(dm.may, bci.may) = ?`);
        params.push(machineFilter);
    }
    
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }
    
    query += ` ORDER BY dm.created_at DESC, dm.stt DESC`;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách báo cáo dừng máy:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách báo cáo dừng máy' });
        }
        
        // Xử lý dữ liệu trước khi trả về
        const processedRows = (rows || []).map(row => ({
            ...row,
            // Đảm bảo các trường quan trọng không null
            ca: row.ca || '',
            gio_lam_viec: row.gio_lam_viec || '',
            ma_ca: row.ma_ca || '',
            truong_may: row.truong_may || '',
            may: row.may || '',
            ws: row.ws || '',
            ly_do: row.ly_do || '',
            thoi_gian_dung_may: row.thoi_gian_dung_may || '0 phút',
            ghi_chu: row.ghi_chu || ''
        }));
        
        res.json(processedRows);
    });
});

// API lưu báo cáo dừng máy In độc lập
router.post('/dung-may/submit', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const reportData = req.body;
    if (!reportData) {
        return res.status(400).json({ error: 'Dữ liệu báo cáo không hợp lệ' });
    }

    console.log('📥 Nhận dữ liệu báo cáo dừng máy:', reportData);

    // Validate dữ liệu bắt buộc
    if (!reportData.ly_do || !reportData.thoi_gian_dung || !reportData.thoi_gian_chay_lai) {
        return res.status(400).json({ 
            error: 'Thiếu thông tin bắt buộc: lý do, thời gian dừng, thời gian chạy lại' 
        });
    }

    // Lấy STT mới nhất cho báo cáo dừng máy
    db.get(`SELECT MAX(stt) as max_stt FROM bao_cao_in_dung_may`, [], (err, sttRow) => {
        if (err) {
            console.error('Lỗi khi lấy STT mới nhất cho dừng máy:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy STT mới nhất cho dừng máy' });
        }

        const reportId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const stt = (sttRow?.max_stt || 0) + 1;
        const date = new Date().toISOString().slice(0, 10);
        
        // Tính tuần trong tháng
        const tuan = calculateWeekInMonth(date);

        console.log('💾 Chuẩn bị lưu với STT:', stt, 'Tuần:', tuan);

        // Lưu vào database
        db.run(`INSERT INTO bao_cao_in_dung_may (
            id, bao_cao_id, stt, ca, gio_lam_viec, ma_ca, truong_may, may, ws,
            ly_do, thoi_gian_dung, thoi_gian_chay_lai, thoi_gian_dung_may, ghi_chu,
            ngay_thang_nam, tuan, ngay, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            reportId,
            null, // Không có báo cáo cha
            stt,
            reportData.ca || '',
            reportData.gio_lam_viec || '',
            reportData.ma_ca || '',
            reportData.truong_may || '',
            reportData.may || '',
            reportData.ws || '', // Có thể rỗng
            reportData.ly_do || '',
            reportData.thoi_gian_dung || '',
            reportData.thoi_gian_chay_lai || '',
            reportData.thoi_gian_dung_may || '0 phút',
            reportData.ghi_chu || '',
            date,
            tuan,
            date,
            new Date().toISOString()
        ], function (err) {
            if (err) {
                console.error('Lỗi khi lưu báo cáo dừng máy:', err.message);
                return res.status(500).json({ 
                    error: 'Lỗi khi lưu báo cáo dừng máy: ' + err.message 
                });
            }

            console.log('✅ Đã lưu báo cáo dừng máy thành công với ID:', reportId);

            res.json({
                success: true,
                id: reportId,
                stt: stt,
                message: 'Đã lưu báo cáo dừng máy thành công'
            });
        });
    });
});





// API kiểm tra báo cáo chờ theo máy
router.get('/cho/:machineId', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const { machineId } = req.params;
    
    db.get(`SELECT * FROM bao_cao_in_cho WHERE may = ? ORDER BY created_at DESC LIMIT 1`, 
        [machineId], (err, row) => {
        if (err) {
            console.error('Lỗi khi kiểm tra báo cáo chờ:', err.message);
            return res.status(500).json({ error: 'Lỗi khi kiểm tra báo cáo chờ' });
        }
        
        res.json(row || null);
    });
});

// API lấy danh sách chờ theo máy
router.get('/cho/list/:machineId', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const { machineId } = req.params;
    
    db.all(`SELECT * FROM bao_cao_in_cho WHERE may = ? ORDER BY created_at DESC`, 
        [machineId], (err, rows) => {
        if (err) {
            console.error('Lỗi khi lấy danh sách chờ:', err.message);
            return res.status(500).json({ error: 'Lỗi khi lấy danh sách chờ' });
        }
        
        res.json(rows || []);
    });
});

// API xóa báo cáo khỏi danh sách chờ
router.delete('/cho/:id', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    const { id } = req.params;
    
    db.run(`DELETE FROM bao_cao_in_cho WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error('Lỗi khi xóa báo cáo chờ:', err.message);
            return res.status(500).json({ error: 'Lỗi khi xóa báo cáo chờ' });
        }
        
        res.json({ success: true, message: 'Đã xóa báo cáo chờ' });
    });
});




module.exports = router;