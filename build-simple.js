// build-simple.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Bắt đầu quá trình đóng gói ứng dụng...');

// Kiểm tra tồn tại của cơ sở dữ liệu
const dbPath = path.resolve(__dirname, 'database', 'phieu.db');
if (fs.existsSync(dbPath)) {
  console.log('Đã xác nhận cơ sở dữ liệu tồn tại tại:', dbPath);
} else {
  console.log('CẢNH BÁO: Không tìm thấy cơ sở dữ liệu tại:', dbPath);
  console.log('Ứng dụng sẽ cố gắng tạo cơ sở dữ liệu mới khi chạy.');
}

// Đóng gói ứng dụng để tạo file .exe ngay trong thư mục gốc
try {
  console.log('Đang đóng gói ứng dụng...');
  execSync('pkg . --public --output VSP.exe', { stdio: 'inherit' });
  console.log('Đóng gói ứng dụng thành công!');
  
  // Tạo batch file để chạy ứng dụng dễ dàng
  const batchContent = `@echo off
echo Dang khoi dong ung dung Quan ly Bao cao SCL...
echo.
echo ====================================================================
echo  QUAN TRONG: KHONG DONG CUA SO NAY KHI DANG SU DUNG UNG DUNG!
echo ====================================================================
echo.
start "" "http://localhost:3000"
echo Server dang chay tai http://localhost:3000
echo.
VSP.exe
`;

  fs.writeFileSync('start_app.bat', batchContent);
  console.log('Đã tạo file start_app.bat');
  
  console.log('\nQuá trình đóng gói hoàn tất!');
  console.log('File thực thi đã được tạo: VSP.exe');
  console.log('File batch đã được tạo: start_app.bat');
  console.log('\nỨng dụng sẽ sử dụng cơ sở dữ liệu tại:', dbPath);
  
} catch (error) {
  console.error('Lỗi khi đóng gói ứng dụng:', error);
  process.exit(1);
}