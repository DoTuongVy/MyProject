const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');


require('dotenv').config();
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');

// Khởi tạo Express app
const app = express();
const PORT = process.env.PORT || 8686;

// Middleware
app.use(cors({
  origin: true, // Cho phép tất cả origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(bodyParser.json({ limit: '10mb' })); // Tăng limit để xử lý dữ liệu lớn

// Sử dụng các thư mục static
app.use('/QLVT', express.static(path.join(__dirname, '..', 'QLVT')));
app.use('/login', express.static(path.join(__dirname, '..', 'login')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
app.use(express.static(path.join(__dirname, '..'))); // Thư mục gốc cho auth.js và auth.css
app.use('/BieuDo', express.static(path.join(__dirname, '..', 'BieuDo')));

// Import routes
const sangCuonRoutes = require('./routes/sang-cuon');
const catRoutes = require('./routes/cat');
const userRoutes = require('./routes/users'); // Thêm route users
const customersRoutes = require('./routes/customers');
const systemRoutes = require('./routes/systems');
const moduleRoutes = require('./routes/modules');
const departmentRoutes = require('./routes/departments');
const dinhMucRoutes = require('./routes/dinh-muc');
// Import routes cho báo cáo SCL
const baoCaoSCLRoutes = require('./routes/bao-cao-scl');
const baoCaoGMCRoutes = require('./routes/bao-cao-gmc');
const baoCaoInRoutes = require('./routes/bao-cao-in');
const machinesRoutes = require('./routes/machines');
const wsTongRoutes = require('./routes/ws-tong');
const quanLynguoiDungsanXuat = require('./routes/quan-ly-nguoi-dung-sanxuat');
const bieuDoRoutes = require('./routes/bieu-do');
const dinhMucChungRoutes = require('./routes/dinh-muc-chung');
const dinhMucInRoutes = require('./routes/dinh-muc-in');

// Sử dụng routes
app.use('/api/sang-cuon', sangCuonRoutes);
app.use('/api/cat', catRoutes);
app.use('/api/users', userRoutes); // Sử dụng route users
app.use('/api/customers', customersRoutes); // Sử dụng route customers
app.use('/api/systems', systemRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/dinh-muc', dinhMucRoutes);
// Sử dụng routes
app.use('/api/bao-cao-scl', baoCaoSCLRoutes);
app.use('/api/bao-cao-gmc', baoCaoGMCRoutes);
app.use('/api/bao-cao-in', baoCaoInRoutes);
app.use('/api/machines', machinesRoutes);
app.use('/api/ws-tong', wsTongRoutes);
app.use('/api/production-users',quanLynguoiDungsanXuat);
app.use('/api/bieu-do', bieuDoRoutes);
app.use('/api/dinh-muc-chung', dinhMucChungRoutes);
app.use('/api/dinh-muc-in', dinhMucInRoutes);


app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'assets', 'favicon.ico'));
});

// Route mặc định - chuyển hướng tới trang đăng nhập
app.get('/', (req, res) => {
  res.redirect('/login/login.html');
});

// Thêm vào server.js
app.get('/index.html', (req, res) => {
  res.redirect('/QLVT/index.html');
});

// Route cho trang QLVT
app.get('/QLVT', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'QLVT', 'index.html'));
});

// Route cho trang đăng nhập
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login', 'login.html'));
});

// Route cho trang admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'admin.html'));
});

// Thêm route cho user
app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'user', 'index.html'));
});

// Thêm các route cho các module của QLVT
app.get('/QLVT/phieusangcuon.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'QLVT', 'phieusangcuon.html'));
});
app.get('phieusangcuon', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'QLVT', 'phieusangcuon.html'));
});

app.get('/QLVT/phieucat.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'QLVT', 'phieucat.html'));
});

// Khởi động server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`Server cũng có thể truy cập qua IP nội bộ:${PORT}`);
});