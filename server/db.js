const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');


// Support for pkg executable path resolution
function getAppPath() {
  // Khi chạy dưới dạng exe, __dirname có thể trỏ đến thư mục tạm
  // Chúng ta cần kiểm tra nếu đang chạy từ exe đã đóng gói hoặc môi trường phát triển
  const isPackaged = process.pkg !== undefined;
  
  if (isPackaged) {
    // Đối với ứng dụng đã đóng gói, sử dụng thư mục chứa file thực thi
    return path.dirname(process.execPath);
  } else {
    // Đối với môi trường phát triển, sử dụng thư mục hiện tại
    return path.join(__dirname, '..');
  }
}

// Lấy đường dẫn cơ sở của ứng dụng
const appPath = getAppPath();

// Đường dẫn thư mục database
const dbDir = path.join(appPath, 'database');
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log(`Đã tạo thư mục database tại: ${dbDir}`);
  } catch (err) {
    console.error(`Lỗi khi tạo thư mục database: ${err.message}`);
    console.log('Sẽ sử dụng thư mục hiện tại để lưu database');
    // Nếu không thể tạo thư mục, sử dụng thư mục hiện tại
    dbDir = appPath;
  }
}

// Đường dẫn file database
const dbPath = path.join(dbDir, 'phieu.db');
console.log(`Sử dụng database tại: ${dbPath}`);

// Kết nối đến database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Không thể kết nối đến SQLite database:', err.message);
  } else {
    console.log('Đã kết nối đến SQLite database tại:', dbPath);
    initDatabase();
  }
});

// Thêm các phương thức promise cho db
db.allAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, function(err, rows) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

db.runAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

db.getAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, function(err, row) {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};


// Thêm vào file db.js một hàm kiểm tra và sửa lỗi dữ liệu
function checkAndFixDuplicatePermissions() {
  console.log('Kiểm tra dữ liệu quyền phòng ban...');
  
  // Kiểm tra quyền module của phòng ban
  db.all(`SELECT department, module_id, COUNT(*) as count
         FROM department_module_permissions
         GROUP BY department, module_id
         HAVING COUNT(*) > 1`, [], (err, duplicates) => {
    if (err) {
      console.error('Lỗi khi kiểm tra dữ liệu trùng lặp:', err.message);
      return;
    }
    
    if (duplicates && duplicates.length > 0) {
      console.log(`Tìm thấy ${duplicates.length} cặp (department, module_id) trùng lặp.`);
      
      // Sửa dữ liệu trùng lặp
      duplicates.forEach(dup => {
        console.log(`Sửa dữ liệu trùng lặp: ${dup.department} - ${dup.module_id}`);
        
        // Lấy tất cả bản ghi trùng lặp
        db.all(`SELECT * FROM department_module_permissions
               WHERE department = ? AND module_id = ?
               ORDER BY created_at DESC`,
               [dup.department, dup.module_id], (err, rows) => {
          if (err) {
            console.error('Lỗi khi lấy dữ liệu trùng lặp:', err.message);
            return;
          }
          
          // Giữ lại bản ghi mới nhất, xóa các bản ghi cũ
          const latestRecord = rows[0];
          const idsToDelete = rows.slice(1).map(r => r.id);
          
          if (idsToDelete.length > 0) {
            const placeholders = idsToDelete.map(() => '?').join(',');
            
            db.run(`DELETE FROM department_module_permissions
                   WHERE id IN (${placeholders})`, idsToDelete, function(err) {
              if (err) {
                console.error('Lỗi khi xóa dữ liệu trùng lặp:', err.message);
              } else {
                console.log(`Đã xóa ${this.changes} bản ghi trùng lặp.`);
              }
            });
          }
        });
      });
    } else {
      console.log('Không tìm thấy dữ liệu trùng lặp.');
    }
  });
}


// Thêm hàm để kiểm tra và sửa các hệ thống trùng lặp
function checkAndFixDuplicateSystems() {
  console.log('Kiểm tra các hệ thống trùng lặp...');
  
  // Tìm các hệ thống có tên trùng lặp
  db.all(`SELECT name, COUNT(*) as count 
          FROM systems 
          GROUP BY name 
          HAVING COUNT(*) > 1`, [], (err, duplicates) => {
    if (err) {
      console.error('Lỗi khi kiểm tra hệ thống trùng lặp:', err.message);
      return;
    }
    
    if (duplicates && duplicates.length > 0) {
      console.log(`Tìm thấy ${duplicates.length} tên hệ thống trùng lặp.`);
      
      // Xử lý từng hệ thống trùng lặp
      duplicates.forEach(dup => {
        console.log(`Đang xử lý hệ thống trùng lặp: ${dup.name}`);
        
        // Lấy danh sách tất cả các phiên bản của hệ thống này
        db.all(`SELECT id, name, created_at FROM systems WHERE name = ? ORDER BY created_at DESC`, 
               [dup.name], (err, systems) => {
          if (err) {
            console.error(`Lỗi khi lấy chi tiết hệ thống trùng lặp ${dup.name}:`, err.message);
            return;
          }
          
          if (systems.length <= 1) return; // Không có gì để xử lý
          
          // Giữ lại phiên bản mới nhất
          const latestSystem = systems[0];
          // Các phiên bản cũ hơn cần xóa
          const oldSystems = systems.slice(1);
          const oldSystemIds = oldSystems.map(s => s.id);
          
          console.log(`Giữ lại hệ thống ID=${latestSystem.id}, xóa ${oldSystemIds.length} bản sao.`);
          
          // Trước khi xóa, cập nhật các module liên kết
          db.run('BEGIN TRANSACTION', (err) => {
            if (err) {
              console.error('Lỗi khi bắt đầu transaction:', err.message);
              return;
            }
            
            try {
              // Cập nhật các module thuộc về các hệ thống cũ -> chuyển sang hệ thống mới nhất
              oldSystemIds.forEach(oldId => {
                db.run(`UPDATE modules SET system_id = ? WHERE system_id = ?`, 
                       [latestSystem.id, oldId], (err) => {
                  if (err) {
                    console.error(`Lỗi khi cập nhật module từ hệ thống ${oldId}:`, err.message);
                    throw err;
                  }
                });
                
                // Cập nhật các quyền hệ thống của phòng ban
                db.run(`UPDATE department_system_permissions SET system_id = ? WHERE system_id = ?`, 
                       [latestSystem.id, oldId], (err) => {
                  if (err) {
                    console.error(`Lỗi khi cập nhật quyền hệ thống ${oldId}:`, err.message);
                    throw err;
                  }
                });
              });
              
              // Sau khi cập nhật xong, xóa các hệ thống cũ
              const placeholders = oldSystemIds.map(() => '?').join(',');
              db.run(`DELETE FROM systems WHERE id IN (${placeholders})`, oldSystemIds, function(err) {
                if (err) {
                  console.error('Lỗi khi xóa hệ thống trùng lặp:', err.message);
                  db.run('ROLLBACK');
                  return;
                }
                
                console.log(`Đã xóa ${this.changes} hệ thống trùng lặp thành công.`);
                db.run('COMMIT');
              });
            } catch (error) {
              console.error('Lỗi khi xử lý hệ thống trùng lặp:', error);
              db.run('ROLLBACK');
            }
          });
        });
      });
    } else {
      console.log('Không tìm thấy hệ thống trùng lặp.');
    }
  });
}


// Hàm kiểm tra và sửa trùng lặp trong bảng departments
function checkAndFixDuplicateDepartments() {
  console.log('Kiểm tra phòng ban trùng lặp...');
  
  // Tìm các phòng ban trùng lặp theo tên
  db.all(`SELECT name, COUNT(*) as count FROM departments GROUP BY name HAVING COUNT(*) > 1`, [], (err, duplicates) => {
    if (err) {
      console.error('Lỗi khi kiểm tra phòng ban trùng lặp:', err.message);
      return;
    }
    
    if (duplicates && duplicates.length > 0) {
      console.log(`Tìm thấy ${duplicates.length} tên phòng ban trùng lặp.`);
      
      // Xử lý từng phòng ban trùng lặp
      duplicates.forEach(dup => {
        console.log(`Xử lý phòng ban trùng lặp: ${dup.name}`);
        
        // Lấy tất cả bản ghi của phòng ban này
        db.all(`SELECT * FROM departments WHERE name = ? ORDER BY created_at DESC`, [dup.name], (err, depts) => {
          if (err) {
            console.error(`Lỗi khi lấy chi tiết phòng ban trùng lặp ${dup.name}:`, err.message);
            return;
          }
          
          // Giữ lại phòng ban mới nhất
          const keepDept = depts[0];
          // Phòng ban cần xóa
          const deleteDepts = depts.slice(1);
          
          console.log(`Giữ lại phòng ban ID=${keepDept.id}, xóa ${deleteDepts.length} bản sao.`);
          
          // Cập nhật quyền phòng ban
          db.run('BEGIN TRANSACTION', (err) => {
            if (err) {
              console.error('Lỗi khi bắt đầu transaction:', err.message);
              return;
            }
            
            try {
              // Cập nhật quyền trong bảng department_module_permissions
              deleteDepts.forEach(oldDept => {
                db.run(`
                  UPDATE department_module_permissions 
                  SET department = ? 
                  WHERE department = ?
                `, [keepDept.name, oldDept.name], (err) => {
                  if (err) {
                    console.error(`Lỗi khi cập nhật quyền module cho phòng ban ${oldDept.name}:`, err.message);
                    throw err;
                  }
                });
                
                // Cập nhật quyền trong bảng department_system_permissions
                db.run(`
                  UPDATE department_system_permissions 
                  SET department = ? 
                  WHERE department = ?
                `, [keepDept.name, oldDept.name], (err) => {
                  if (err) {
                    console.error(`Lỗi khi cập nhật quyền hệ thống cho phòng ban ${oldDept.name}:`, err.message);
                    throw err;
                  }
                });
                
                // Cập nhật phòng ban cho người dùng
                db.run(`
                  UPDATE users_VSP 
                  SET department = ? 
                  WHERE department = ?
                `, [keepDept.name, oldDept.name], (err) => {
                  if (err) {
                    console.error(`Lỗi khi cập nhật phòng ban cho users_VSP ${oldDept.name}:`, err.message);
                    throw err;
                  }
                });
                
                db.run(`
                  UPDATE users_PVN 
                  SET department = ? 
                  WHERE department = ?
                `, [keepDept.name, oldDept.name], (err) => {
                  if (err) {
                    console.error(`Lỗi khi cập nhật phòng ban cho users_PVN ${oldDept.name}:`, err.message);
                    throw err;
                  }
                });
              });
              
              // Xóa các phòng ban trùng lặp
              deleteDepts.forEach(oldDept => {
                db.run(`DELETE FROM departments WHERE id = ?`, [oldDept.id], (err) => {
                  if (err) {
                    console.error(`Lỗi khi xóa phòng ban ${oldDept.id}:`, err.message);
                    throw err;
                  }
                });
              });
              
              // Commit transaction
              db.run('COMMIT', (err) => {
                if (err) {
                  console.error('Lỗi khi commit transaction:', err.message);
                  db.run('ROLLBACK');
                } else {
                  console.log(`Đã xử lý xong phòng ban ${dup.name}`);
                }
              });
              
            } catch (error) {
              console.error('Lỗi khi xử lý phòng ban trùng lặp:', error);
              db.run('ROLLBACK');
            }
          });
        });
      });
    } else {
      console.log('Không tìm thấy phòng ban trùng lặp.');
    }
  });
}



// Khởi tạo database với các bảng cần thiết
function initDatabase() {

// Bảng hệ thống
db.run(`CREATE TABLE IF NOT EXISTS systems (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng systems:', err.message);
  } else {
    console.log('Bảng systems đã được tạo hoặc đã tồn tại');
    // Thêm dữ liệu mẫu
    initSystems();
  }
});

// Bảng module
db.run(`CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  system_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  path TEXT NOT NULL,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (system_id) REFERENCES systems (id)
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng modules:', err.message);
  } else {
    console.log('Bảng modules đã được tạo hoặc đã tồn tại');
  }
});

// Bảng phân quyền phòng ban theo hệ thống
db.run(`CREATE TABLE IF NOT EXISTS department_system_permissions (
  id TEXT PRIMARY KEY,
  department TEXT NOT NULL,
  system_id TEXT NOT NULL,
  can_access INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(department, system_id)
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng department_system_permissions:', err.message);
  } else {
    console.log('Bảng department_system_permissions đã được tạo hoặc đã tồn tại');
  }
});

// Bảng phân quyền người dùng theo module
db.run(`CREATE TABLE IF NOT EXISTS user_module_permissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  nhaMay TEXT NOT NULL,
  module_id TEXT NOT NULL,
  can_access INTEGER DEFAULT 0,
  can_edit INTEGER DEFAULT 0,
  can_delete INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, nhaMay, module_id)
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng user_module_permissions:', err.message);
  } else {
    console.log('Bảng user_module_permissions đã được tạo hoặc đã tồn tại');
  }
});

// Bảng phân quyền phòng ban theo module
db.run(`CREATE TABLE IF NOT EXISTS department_module_permissions (
  id TEXT PRIMARY KEY,
  department TEXT NOT NULL,
  module_id TEXT NOT NULL,
  can_access INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(department, module_id)
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng department_module_permissions:', err.message);
  } else {
    console.log('Bảng department_module_permissions đã được tạo hoặc đã tồn tại');
    
    // Kiểm tra bảng đã tạo thành công không
    db.get(`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='department_module_permissions'`, [], (err, result) => {
      if (err || !result || result.count === 0) {
        console.error('Bảng department_module_permissions chưa được tạo!');
      } else {
        console.log('Đã xác nhận bảng department_module_permissions tồn tại.');
      }
    });
  }
});

  // Bảng danh sách phiếu sang cuộn
  db.run(`CREATE TABLE IF NOT EXISTS Danhsach_PSC (
    id TEXT PRIMARY KEY,
    soPhieu TEXT NOT NULL,
    ngayCT TEXT,
    soLSX TEXT,
    dienGiai TEXT,
    khachHang TEXT,
    sanPham TEXT,
    maPhu TEXT,
    sttXuat TEXT,
    mhkx TEXT,
    dlx TEXT,
    slXuat TEXT,
    tlXuat TEXT,
    sttNhap TEXT,
    maHangNhap TEXT,
    slNhap TEXT,
    tlNhap TEXT,
    tonSL TEXT,
    tonTL TEXT,
    tonTT TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Lỗi khởi tạo bảng Danhsach_PSC:', err.message);
    } else {
      console.log('Bảng Danhsach_PSC đã được tạo (cấu trúc mới)');
    }
  });

  // Bảng formula phiếu sang cuộn
  db.run(`CREATE TABLE IF NOT EXISTS PSC_formula (
    id TEXT PRIMARY KEY,
    soLSX TEXT,
    soPhieu TEXT NOT NULL,
    phieuPhu TEXT,
    phieu TEXT,
    ws TEXT,
    ngayCT TEXT,
    maKH TEXT,
    khachHang TEXT,
    maSP TEXT,
    mhkx TEXT,
    slDon TEXT,
    dlXuat TEXT,
    tongSLGiay TEXT,
    soCon TEXT,
    kho TEXT,
    khoCanSang TEXT,
    trongLuong TEXT,
    slXuat TEXT,
    maCanSang TEXT,
    slNhap TEXT,
    tongKhoNhap TEXT,
    phieuId TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phieuId) REFERENCES Danhsach_PSC (id)
  )`, (err) => {
    if (err) {
      console.error('Lỗi khởi tạo bảng PSC_formula:', err.message);
    } else {
      console.log('Bảng PSC_formula đã được tạo hoặc đã tồn tại');
    }
  });

  // Bảng danh sách phiếu cắt
  db.run(`CREATE TABLE IF NOT EXISTS Danhsach_PC (
    id TEXT PRIMARY KEY,
    r TEXT,
    soPhieu TEXT NOT NULL,
    ngayCT TEXT,
    soLSX TEXT,
    dienGiai TEXT,
    khachHang TEXT,
    sanPham TEXT,
    maPhu TEXT,
    lo TEXT,
    viTri TEXT,
    stt TEXT,
    maNL TEXT,
    slDat TEXT,
    dinhLuong TEXT,
    soTam TEXT,
    soCon TEXT,
    khoCat TEXT,
    daiCat TEXT,
    khoXen TEXT,
    daiXen TEXT,
    soLanXen TEXT,
    tlDuKien TEXT,
    tonSL TEXT,
    tonTL TEXT,
    tonTT TEXT,
    ghiChu TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Lỗi khởi tạo bảng Danhsach_PC:', err.message);
    } else {
      console.log('Bảng Danhsach_PC đã được tạo hoặc đã tồn tại');
    }
  });

  // Bảng formula phiếu cắt
  db.run(`CREATE TABLE IF NOT EXISTS PC_formula (
    id TEXT PRIMARY KEY,
    ws TEXT,
    soPhieu TEXT NOT NULL,
    maPhieuPhu TEXT,
    phieu TEXT,
    wsF TEXT,
    ngayCT TEXT,
    maKH TEXT,
    khachHang TEXT,
    maSP TEXT,
    maNL TEXT,
    slDat TEXT,
    dinhLuong TEXT,
    soTam TEXT,
    soCon TEXT,
    khoCat TEXT,
    daiCat TEXT,
    xa TEXT,
    khoXa TEXT,
    tlDuTinh TEXT,
    khoXen TEXT,
    daiXen TEXT,
    khoDaiKhoXen TEXT,
    giayRam TEXT,
    dienGiai TEXT,
    phieuId TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phieuId) REFERENCES Danhsach_PC (id)
  )`, (err) => {
    if (err) {
      console.error('Lỗi khởi tạo bảng PC_formula:', err.message);
    } else {
      console.log('Bảng PC_formula đã được tạo hoặc đã tồn tại');
    }
  });

  // Bảng users_VSP - Nhà máy 1+2
  db.run(`CREATE TABLE IF NOT EXISTS users_VSP (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    fullname TEXT,
    role TEXT DEFAULT 'user',
    department TEXT,
    position TEXT,
    nhaMay TEXT DEFAULT 'Nhà máy 1+2',
    ca TEXT DEFAULT 'A',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Lỗi khởi tạo bảng users_VSP:', err.message);
    } else {
      console.log('Bảng users_VSP đã được tạo hoặc đã tồn tại');
    }
  });

  // Bảng users_PVN - Nhà máy 3
  db.run(`CREATE TABLE IF NOT EXISTS users_PVN (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    fullname TEXT,
    role TEXT DEFAULT 'user',
    department TEXT,
    position TEXT,
    nhaMay TEXT DEFAULT 'Nhà máy 3',
    ca TEXT DEFAULT 'A',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Lỗi khởi tạo bảng users_PVN:', err.message);
    } else {
      console.log('Bảng users_PVN đã được tạo hoặc đã tồn tại');
    }
  });

  // Bảng theo dõi sequence cho employee_id
  db.run(`CREATE TABLE IF NOT EXISTS id_sequences (
    factory TEXT PRIMARY KEY,
    last_id INTEGER DEFAULT 0
  )`, (err) => {
    if (err) {
      console.error('Lỗi khởi tạo bảng id_sequences:', err.message);
    } else {
      console.log('Bảng id_sequences đã được tạo hoặc đã tồn tại');
      // Khởi tạo sequence cho cả 2 nhà máy
      initIdSequences();
      // Tạo tài khoản admin mặc định
      createDefaultAdmin();
    }
  });

  // Bảng page_permissions - lưu quyền truy cập trang theo phòng ban
  db.run(`CREATE TABLE IF NOT EXISTS page_permissions (
    id TEXT PRIMARY KEY,
    department TEXT NOT NULL,
    page_name TEXT NOT NULL,
    can_access INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department, page_name)
  )`, (err) => {
    if (err) {
      console.error('Lỗi khởi tạo bảng page_permissions:', err.message);
    } else {
      console.log('Bảng page_permissions đã được tạo hoặc đã tồn tại');
      // Tạo quyền mặc định
      createDefaultPermissions();
    }
  });

  // Bảng user_permissions
  db.run(`CREATE TABLE IF NOT EXISTS user_permissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    nhaMay TEXT NOT NULL,
    page_name TEXT NOT NULL,
    can_access INTEGER DEFAULT 1,
    can_edit INTEGER DEFAULT 0,
    can_delete INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, nhaMay, page_name)
  )`, (err) => {
    if (err) {
      console.error('Lỗi khi tạo bảng user_permissions:', err.message);
    } else {
      console.log('Bảng user_permissions đã được tạo hoặc đã tồn tại');
    }
  });

  // Bảng danh mục khách hàng
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    alias TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Lỗi khởi tạo bảng customers:', err.message);
    } else {
      console.log('Bảng customers đã được tạo hoặc đã tồn tại');
    }
  });

// Bảng phòng ban
db.run(`CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng departments:', err.message);
  } else {
    console.log('Bảng departments đã được tạo hoặc đã tồn tại');
    // Thêm các phòng ban mặc định
    initDepartments();
  }
});

// Bảng báo cáo SCL
db.run(`CREATE TABLE IF NOT EXISTS bao_cao_scl (
  id TEXT PRIMARY KEY,
  stt INTEGER,  -- STT giảm dần, báo cáo mới nhất ở trên
  ca TEXT,  -- Ca làm việc
  ngay TEXT,  -- Ngày tạo báo cáo
  so_phieu TEXT,  -- Số phiếu SC
  so_lan INTEGER, -- Số lần của số phiếu
  worksheet TEXT,  -- Số Worksheet (WS)
  khach_hang TEXT, -- Mã KH từ formula
  ma_vat_tu TEXT,  -- Mã giấy (Mã hàng khổ xuất)
  dinh_luong TEXT, -- Định lượng từ formula
  kho TEXT,  -- Khổ từ khổ sản phẩm (mm)
  so_sanh_kho TEXT, -- So sánh khổ (Giống khổ)
  ma_so_cuon TEXT, -- Mã số cuộn
  trong_luong_nhan TEXT, -- TLN (trọng lượng nhận)
  thoi_gian_bat_dau TEXT, -- TG BẮT ĐẦU
  thoi_gian_ket_thuc TEXT, -- TG Kết Thúc
  kho_san_pham TEXT, -- Khổ sản phẩm (mm)
  kho_can_sang TEXT, -- Khổ cần sang (mm)
  kho_1 TEXT, -- Khổ 1
  kho_2 TEXT, -- Khổ 2
  kho_3 TEXT, -- Khổ 3
  so_met TEXT, -- Số mét
  hoan_thanh_cuon TEXT, -- Hoàn thành cuộn (0: chạy hết, 1: chạy lỡ)
  nhap_kho_1 TEXT, -- Trọng lượng nhập kho 1 (kg)
  nhap_kho_2 TEXT, -- Trọng lượng nhập kho 2 (kg)
  nhap_kho_3 TEXT, -- Trọng lượng nhập kho 3 (kg)
  tra_kho TEXT, -- Trọng lượng trả kho (kg)
  phe_lieu_dau_cuon TEXT, -- Phế liệu đầu cuộn (kg)
  phe_lieu_san_xuat TEXT, -- Phế liệu sản xuất (kg)
  so_cuon INTEGER, -- Số cuộn (tổng số cuộn của phiếu với 6 ký tự đầu giống nhau và cùng WS)
  ghi_chu TEXT, -- Ghi chú
  thu_tu_cuon TEXT, -- Thứ tự cuộn
  so_id TEXT, -- Số ID (nếu có)
  psc_tt TEXT, -- PSC+TT (Số phiếu + thứ tự cuộn)
  vi_tri_1 TEXT, -- Vị trí 1 (A,B,C)
  vi_tri_2 TEXT, -- Vị trí 2 (A,B,C)
  vi_tri_3 TEXT, -- Vị trí 3 (A,B,C)
  trong_luong_can_lai_1 TEXT, -- Trọng lượng cân lại 1
  trong_luong_can_lai_2 TEXT, -- Trọng lượng cân lại 2
  trong_luong_can_lai_3 TEXT, -- Trọng lượng cân lại 3
  so_met_chay_sai TEXT, -- Số mét chạy sai
  kho_sai_1 TEXT, -- Khổ sai 1 (mm)
  kho_sai_2 TEXT, -- Khổ sai 2 (mm)
  kho_sai_3 TEXT, -- Khổ sai 3 (mm)
  tl_chay_sai_1 TEXT, -- Trọng lượng chạy sai 1 (kg)
  tl_chay_sai_2 TEXT, -- Trọng lượng chạy sai 2 (kg)
  tl_chay_sai_3 TEXT, -- Trọng lượng chạy sai 3 (kg)
  dung_may INTEGER DEFAULT 0, -- Dừng máy (0: Không, 1: Có)
  nguoi_thuc_hien TEXT, -- Người thực hiện
  user_id TEXT, -- ID người dùng
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Lỗi khi tạo bảng bao_cao_scl:', err.message);
  } else {
    console.log('Bảng bao_cao_scl đã được tạo hoặc cập nhật thành công');
  }
});

// Bảng báo cáo dừng máy SCL
db.run(`CREATE TABLE IF NOT EXISTS bao_cao_scl_dung_may (
  id TEXT PRIMARY KEY,
  bao_cao_id TEXT ,
  stt INTEGER,
  ca TEXT,
  nguoi_thuc_hien TEXT,
  worksheet TEXT,
  so_phieu TEXT,
  ly_do TEXT,
  ly_do_khac TEXT,
  thoi_gian_dung TEXT,
  thoi_gian_chay_lai TEXT,
  thoi_gian_dung_may TEXT,
  ghi_chu TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bao_cao_id) REFERENCES bao_cao_scl (id)
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng bao_cao_scl_dung_may:', err.message);
  } else {
    console.log('Bảng bao_cao_scl_dung_may đã được tạo hoặc đã tồn tại');
  }
});


// Bảng định mức
db.run(`CREATE TABLE IF NOT EXISTS dinh_muc (
  id TEXT PRIMARY KEY,
  ma_giay TEXT NOT NULL,
  dinh_luong TEXT,
  so_to_pallet_gmc1 TEXT,
  do_day_giay_gmc1 TEXT,
  chieu_cao_pallet_gmc1 TEXT,
  ky_tu_11_gmc1 TEXT,
  ma_giay_gmc2 TEXT,
  dinh_luong_gmc2 TEXT,
  so_to_pallet_gmc2 TEXT,
  do_day_giay_gmc2 TEXT,
  chieu_cao_pallet_gmc2 TEXT,
  ky_tu_11_gmc2 TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng dinh_muc:', err.message);
  } else {
    console.log('Bảng dinh_muc đã được tạo hoặc đã tồn tại');
  }
});


// Bảng báo cáo GMC
db.run(`CREATE TABLE IF NOT EXISTS bao_cao_gmc (
  id TEXT PRIMARY KEY,
  stt INTEGER,  -- STT giảm dần, báo cáo mới nhất ở trên
  ngay TEXT,  -- Ngày tạo báo cáo
  ca TEXT,  -- Ca làm việc
  gio_lam_viec TEXT,  -- THÊM MỚI: Giờ làm việc
  ma_ca TEXT,  -- THÊM MỚI: Mã ca tự động
  ngay_phu TEXT,  -- Ngày phụ 
  may TEXT, -- Máy GMC 1 hoặc GMC 2
  so_phieu_cat_giay TEXT, -- Số phiếu cắt giấy
  so_lan_chay INTEGER, -- Số lần chạy
  so_ws TEXT, -- Số WS
  khach_hang TEXT, -- Khách hàng
  ma_giay TEXT, -- Mã giấy
  dinh_luong TEXT, -- Định lượng
  so_tam TEXT,
  kho_cat TEXT, -- Khổ cắt (mm)
  ma_so_cuon TEXT, -- Mã số cuộn
  trong_luong_nhan TEXT, -- Trọng lượng nhận (kg)
  thoi_gian_bat_dau TEXT, -- Thời gian bắt đầu
  thoi_gian_ket_thuc TEXT, -- Thời gian kết thúc
  kho_mm TEXT, -- Khổ (mm)
  dai_mm TEXT, -- Dài (mm)
  tong_so_pallet TEXT, -- Tổng số pallet
  so_tam_cat_duoc TEXT, -- Số tấm cắt được
  tl_tra_thuc_te TEXT, -- Trọng lượng trả thực tế (kg)
  tl_tra_du_tinh TEXT, -- Trọng lượng trả dự tính (kg)
  loi_kg TEXT, -- Lõi (kg)
  dau_cuon_kg TEXT, -- Đầu cuộn (kg)
  rach_mop_kg TEXT, -- Rách móp (kg)
  phe_lieu_san_xuat_kg TEXT, -- Phế liệu sản xuất (kg)
  so_cuon INTEGER, -- Số cuộn
  ghi_chu TEXT, -- Ghi chú
  thu_tu_cuon TEXT, -- Thứ tự cuộn
  xa_doi TEXT, -- Xả đôi (0 hoặc 1)
  so_id TEXT, -- Số ID (8 số)
  kho_xen TEXT, -- Khổ (xén)
  dai_xen TEXT, -- Dài (xén)
  so_tam_xen TEXT, -- Số tấm xén
  su_dung_giay_ton_tam TEXT, -- Sử dụng giấy tồn (tấm)
  so_to_pallet TEXT, -- Số tờ/pallet
  kho_cat_sai_mm TEXT, -- Khổ cắt sai (mm)
  dai_cat_sai_mm TEXT, -- Dài cắt sai (mm)
  so_tam_cat_sai TEXT, -- Số tấm cắt sai
  giay_quan_lot TEXT, -- Giấy quấn/giấy lót (Có/Không)
  chuyen_xen TEXT, -- Chuyển xén (Có/Không)
  chieu_cao_pallet TEXT, -- Chiều cao pallet
  so_tam_tham_chieu TEXT, -- Số tấm tham chiếu
  thoi_gian_chuyen_doi_pallet TEXT, -- Thời gian chuyển đổi pallet
  thoi_gian_khac TEXT, -- Thời gian khác
  dung_may INTEGER DEFAULT 0, -- Dừng máy (0: Không, 1: Có)
  nguoi_thuc_hien TEXT, -- Người thực hiện
  user_id TEXT, -- ID người dùng
  is_started_only INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Lỗi khi tạo bảng bao_cao_gmc:', err.message);
  } else {
    console.log('Bảng bao_cao_gmc đã được tạo hoặc cập nhật thành công');
  }
});

// Bảng báo cáo dừng máy GMC
db.run(`CREATE TABLE IF NOT EXISTS bao_cao_gmc_dung_may (
  id TEXT PRIMARY KEY,
  bao_cao_id TEXT,
  stt INTEGER,
  ca TEXT,
  gio_lam_viec TEXT,  -- THÊM MỚI
  ma_ca TEXT,         -- THÊM MỚI
  nguoi_thuc_hien TEXT,
  may TEXT,
  so_phieu_cat_giay TEXT,
  ly_do TEXT,
  ly_do_khac TEXT,
  thoi_gian_dung TEXT,
  thoi_gian_chay_lai TEXT,
  thoi_gian_dung_may TEXT,
  ghi_chu TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bao_cao_id) REFERENCES bao_cao_gmc (id)
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng bao_cao_gmc_dung_may:', err.message);
  } else {
    console.log('Bảng bao_cao_gmc_dung_may đã được tạo hoặc đã tồn tại');
  }
});



// Tạo bảng machines
db.run(`CREATE TABLE IF NOT EXISTS machines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  status TEXT DEFAULT 'active',
  description TEXT,
  department TEXT,
  system_id TEXT,
  module_id TEXT,  -- THÊM DÒNG NÀY
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng machines:', err.message);
  } else {
    console.log('Bảng machines đã được tạo hoặc đã tồn tại');
    console.log('ℹ️  Không thêm dữ liệu mẫu - Admin sẽ tự thêm máy');
  }
});



// Bảng WS Tổng
db.run(`CREATE TABLE IF NOT EXISTS ws_tong (
  id TEXT PRIMARY KEY,
  so_ws TEXT NOT NULL,
  so_po TEXT,
  khach_hang TEXT,
  ma_sp TEXT,
  sl_dh TEXT,
  s_con TEXT,
  so_mau_in TEXT,
  ma_khuon_be_dut TEXT,
  ma_khuon_be_noi TEXT,
  be_noi_be_dut TEXT,
  loai_can_phu TEXT,
  mang_acetat TEXT,
  qc_dan_lg TEXT,
  qc_dong_goi TEXT,
  thung_or_giay_goi TEXT,
  loai_giay_1 TEXT,
  kho_1 TEXT,
  chat_1 TEXT,
  kg_1 TEXT,
  loai_giay_2 TEXT,
  kho_giay_2 TEXT,
  kg_2 TEXT,
  loai_giay_3 TEXT,
  kho_giay_3 TEXT,
  kg_3 TEXT,
  chat_3 TEXT,
  kho_3 TEXT,
  chat_4 TEXT,
  kho_4 TEXT,
  loai_song TEXT,
  chat_5 TEXT,
  kho_5 TEXT,
  chat_6 TEXT,
  kho_6 TEXT,
  cong_doan_san_xuat_1 TEXT,
  ngay_nhan_ws TEXT,
  sl_giay_can_cat TEXT,
  cong_doan_san_xuat_2 TEXT,
  sl_bu_hao_in TEXT,
  sl_bu_hao_t_pham TEXT,
  sl_giay TEXT,
  sl_cat_giay TEXT,
  sl_giay_kh TEXT,
  gia_cong_in TEXT,
  gia_cong_ep_kim TEXT,
  gia_cong_can_phu TEXT,
  gia_cong_be TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng ws_tong:', err.message);
  } else {
    console.log('Bảng ws_tong đã được tạo hoặc đã tồn tại');
  }
});





// Bảng báo cáo in
db.run(`CREATE TABLE IF NOT EXISTS bao_cao_in (
  id TEXT PRIMARY KEY,
  stt INTEGER,  -- STT giảm dần, báo cáo mới nhất ở trên
  ngay TEXT,  -- Ngày tạo báo cáo
  may TEXT, -- Máy 6M1, 6M5, 5M2, 6K, 2M, KTS
  quan_doc TEXT, -- Quản đốc (từ production_users)
  ca TEXT,  -- Ca làm việc
  truong_may TEXT, -- Trưởng máy (người đăng nhập)
  ws TEXT, -- Số WS
  so_lan_chay INTEGER, -- Số lần chạy (logic đặc biệt)
  ngay_phu TEXT, -- Ngày phụ (tương tự GMC)
  khach_hang TEXT, -- Từ ws_tong [khach_hang]
  ma_sp TEXT, -- Từ ws_tong [ma_sp]
  sl_don_hang TEXT, -- Từ ws_tong [sl_dh]
  so_con INTEGER, -- Từ ws_tong [s_con]
  so_mau TEXT, -- Từ ws_tong [so_mau_in]
  ma_giay_1 TEXT, -- Từ ws_tong [loai_giay_1]
  ma_giay_2 TEXT, -- Từ ws_tong [loai_giay_2]
  ma_giay_3 TEXT, -- Từ ws_tong [loai_giay_3]
  kho TEXT, -- Từ ws_tong [kho_1]
  dai_giay TEXT, -- Từ ws_tong [chat_1]
  tuy_chon TEXT, -- Option: 1.In, 2.In+Cán bóng, 3.Cán bóng, 4.In dặm, 5.In dặm+Cán bóng, 6.Cán bóng lại
  mau_3_tone TEXT, -- Checkbox: "on" hoặc ""
  sl_giay_tt_1 TEXT, -- Số lượng giấy thực tế 1 (Input)
  sl_giay_tt_2 TEXT, -- Số lượng giấy thực tế 2 (Input)
  sl_giay_tt_3 TEXT, -- Số lượng giấy thực tế 3 (Input)
  so_kem INTEGER, -- Số kẽm (Input)
  mat_sau TEXT, -- Checkbox: "on" hoặc ""
  phu_keo TEXT, -- Phủ keo (option tùy thuộc tùy chọn)
  phun_bot INTEGER, -- Phun bột % (Input)
  thoi_gian_canh_may TEXT, -- Thời gian canh máy (Input)
  thoi_gian_bat_dau TEXT, -- Thời gian bắt đầu
  thoi_gian_ket_thuc TEXT, -- Thời gian kết thúc
  thanh_pham_in TEXT, -- Thành phẩm in (Input)
  phe_lieu TEXT, -- Phế liệu (Input)
  phe_lieu_trang TEXT, -- Phế liệu trắng (Input)
  ghi_chu TEXT, -- Ghi chú (Input)
  tong_so_luong TEXT, -- Tổng số lượng (tính cộng dồn theo điều kiện)
  tong_phe_lieu TEXT, -- Tổng phế liệu (tính cộng dồn theo điều kiện)
  tong_phe_lieu_trang TEXT, -- Tổng phế liệu trắng (tính cộng dồn theo điều kiện)
  sl_giay_ream INTEGER, -- Số lượng giấy ream (Input)
  tuan INTEGER, -- Tuần trong tháng (tính theo công thức đặc biệt)
  gio_lam_viec TEXT, -- Giờ làm việc
  ma_ca TEXT, -- Mã ca
  sl_giay_theo_ws TEXT, -- Từ ws_tong [sl_giay_can_cat]
  sl_cat TEXT, -- Để trống
  chenh_lech_tt_ws TEXT, -- (Tổng số lượng + Tổng phế liệu + Tổng phế liệu trắng) - SL giấy theo WS
  chenh_lech_tt_scc TEXT, -- Để trống
  phu_may_1 TEXT, -- Phụ máy 1 (từ production_users)
  phu_may_2 TEXT, -- Phụ máy 2 (từ production_users)
  so_pass_in TEXT, -- Số pass in (logic đặc biệt theo số màu),
  thanh_pham TEXT, --Thành phẩm cuối
  dung_may INTEGER DEFAULT 0, -- Dừng máy (0: Không, 1: Có)
  nguoi_thuc_hien TEXT, -- Người thực hiện
  user_id TEXT, -- ID người dùng
  is_started_only INTEGER DEFAULT 0, -- Chỉ bắt đầu hay đã hoàn thành
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
  if (err) {
    console.error('Lỗi khi tạo bảng bao_cao_in:', err.message);
  } else {
    console.log('Bảng bao_cao_in đã được tạo hoặc cập nhật thành công');
  }
});

// Bảng báo cáo dừng máy In
db.run(`CREATE TABLE IF NOT EXISTS bao_cao_in_dung_may (
  id TEXT PRIMARY KEY,
  bao_cao_id TEXT,
  stt INTEGER,
  ca TEXT,
  gio_lam_viec TEXT,
  ma_ca TEXT,
  truong_may TEXT,
  ws TEXT,
  may TEXT,
  thoi_gian_dung TEXT, -- Thời gian dừng máy
  thoi_gian_chay_lai TEXT, -- Thời gian chạy lại
  thoi_gian_dung_may TEXT, -- Khoảng thời gian dừng máy
  ly_do TEXT, -- Lý do dừng máy
  ghi_chu TEXT, -- Ghi chú
  ngay_thang_nam TEXT, -- Ngày/Tháng/Năm
  tuan INTEGER, -- Tuần
  ngay TEXT, -- Ngày
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bao_cao_id) REFERENCES bao_cao_in (id)
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng bao_cao_in_dung_may:', err.message);
  } else {
    console.log('Bảng bao_cao_in_dung_may đã được tạo hoặc đã tồn tại');
  }
});



// Bảng quản lý người dùng cho báo cáo sản xuất
db.run(`CREATE TABLE IF NOT EXISTS production_users (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  position TEXT NOT NULL,
  factory TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, module_id)
)`, (err) => {
  if (err) {
    console.error('Lỗi khởi tạo bảng production_users:', err.message);
  } else {
    console.log('Bảng production_users đã được tạo hoặc đã tồn tại');
  }
});








// Thêm gọi hàm kiểm tra
checkAndFixDuplicatePermissions();

setTimeout(() => {
  checkAndFixDuplicateSystems();
}, 1000); // Đợi 1 giây sau khi khởi tạo xong database

setTimeout(() => {
  checkAndFixDuplicateDepartments();
}, 1500); // Đợi sau khi xử lý hệ thống




}


// Khởi tạo dữ liệu phòng ban mặc định
function initDepartments() {
  // Kiểm tra đã có dữ liệu chưa
  db.get(`SELECT COUNT(*) as count FROM departments`, [], (err, result) => {
    if (err) {
      console.error('Lỗi khi kiểm tra dữ liệu departments:', err.message);
      return;
    }
    
    // Nếu chưa có dữ liệu, thêm dữ liệu mẫu
    if (result.count === 0) {
      const departments = [
        { id: 'qlvt', name: 'Quản lý vật tư', description: 'Phòng quản lý vật tư' },
        { id: 'rnd', name: 'R&D', description: 'Phòng nghiên cứu và phát triển' },
        { id: 'qc', name: 'QC', description: 'Phòng kiểm soát chất lượng' },
        { id: 'inoffset', name: 'In Offset', description: 'Phòng in offset' }
      ];
      
      // Thêm các phòng ban
      departments.forEach(dept => {
        db.run(`INSERT INTO departments (id, name, description) VALUES (?, ?, ?)`,
          [dept.id, dept.name, dept.description],
          (err) => {
            if (err) {
              console.error(`Lỗi khi thêm phòng ban ${dept.name}:`, err.message);
            } else {
              console.log(`Đã thêm phòng ban ${dept.name}`);
            }
          }
        );
      });
    }
  });
}


// Khởi tạo sequence cho cả 2 nhà máy
function initIdSequences() {
  db.get(`SELECT * FROM id_sequences WHERE factory = 'VSP'`, [], (err, row) => {
    if (err) {
      console.error('Lỗi khi kiểm tra sequence VSP:', err.message);
      return;
    }
    
    if (!row) {
      db.run(`INSERT INTO id_sequences (factory, last_id) VALUES ('VSP', 0)`, [], (err) => {
        if (err) {
          console.error('Lỗi khi khởi tạo sequence VSP:', err.message);
        } else {
          console.log('Đã khởi tạo sequence cho nhà máy 1+2 (VSP)');
        }
      });
    }
  });
  
  db.get(`SELECT * FROM id_sequences WHERE factory = 'PVN'`, [], (err, row) => {
    if (err) {
      console.error('Lỗi khi kiểm tra sequence PVN:', err.message);
      return;
    }
    
    if (!row) {
      db.run(`INSERT INTO id_sequences (factory, last_id) VALUES ('PVN', 0)`, [], (err) => {
        if (err) {
          console.error('Lỗi khi khởi tạo sequence PVN:', err.message);
        } else {
          console.log('Đã khởi tạo sequence cho nhà máy 3 (PVN)');
        }
      });
    }
  });
}

// Tạo tài khoản admin mặc định
function createDefaultAdmin() {
  // Kiểm tra xem admin đã tồn tại trong bảng users_VSP chưa
  db.get(`SELECT * FROM users_VSP WHERE username = ?`, ['admin'], (err, vspUser) => {
    if (err) {
      console.error('Lỗi khi kiểm tra tài khoản admin trong users_VSP:', err.message);
      return;
    }
    
    // Nếu chưa tồn tại, tạo admin trong bảng users_VSP
    if (!vspUser) {
      // Tạo mật khẩu mặc định là "admin123"
      const defaultPassword = 'admin123';
      
      db.run(`INSERT INTO users_VSP (id, employee_id, username, password, fullname, role, nhaMay) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [
          Date.now().toString(),
          'ADMIN',  // Không theo định dạng VSP-XXXX vì là admin
          'admin',
          defaultPassword,
          'Quản trị viên',
          'admin',
          'Tất cả'  // Admin có thể quản lý cả hai nhà máy
        ], 
        (err) => {
          if (err) {
            console.error('Lỗi khi tạo tài khoản admin:', err.message);
          } else {
            console.log('Đã tạo tài khoản admin mặc định');
          }
        }
      );
    }
  });
}

// Tạo quyền mặc định cho các phòng ban
function createDefaultPermissions() {
  // Danh sách các phòng ban
  const departments = [
    'Quản lý vật tư',
    'R&D',
    'QC',
    'In Offset'
  ];
  
  // Danh sách các trang trong hệ thống
  const pages = [
    'phieu-sang-cuon',
    'phieu-cat'
  ];
  
  // Mặc định Quản lý vật tư có quyền truy cập vào tất cả
  const defaultPermissions = [
    { department: 'Quản lý vật tư', page: 'phieu-sang-cuon', canAccess: 1 },
    { department: 'Quản lý vật tư', page: 'phieu-cat', canAccess: 1 },
    { department: 'R&D', page: 'phieu-sang-cuon', canAccess: 0 },
    { department: 'R&D', page: 'phieu-cat', canAccess: 0 },
    { department: 'QC', page: 'phieu-sang-cuon', canAccess: 0 },
    { department: 'QC', page: 'phieu-cat', canAccess: 0 },
    { department: 'In Offset', page: 'phieu-sang-cuon', canAccess: 0 },
    { department: 'In Offset', page: 'phieu-cat', canAccess: 0 }
  ];
  
  // Thêm quyền mặc định
  defaultPermissions.forEach(perm => {
    db.run(`INSERT OR IGNORE INTO page_permissions 
      (id, department, page_name, can_access) 
      VALUES (?, ?, ?, ?)`,
      [
        Date.now().toString() + Math.random().toString(36).substr(2, 9),
        perm.department,
        perm.page,
        perm.canAccess
      ],
      (err) => {
        if (err) {
          console.error(`Lỗi khi tạo quyền cho ${perm.department} - ${perm.page}:`, err.message);
        }
      }
    );
  });
}

// Hàm để lấy Employee ID mới
function getNextEmployeeId(factory, callback) {
  const factoryCode = factory === 'Nhà máy 3' ? 'PVN' : 'VSP';
  const tableName = factoryCode === 'PVN' ? 'users_PVN' : 'users_VSP';
  
  // Đếm số lượng nhân viên hiện có (không tính admin) và lấy ID lớn nhất
  db.all(`SELECT employee_id FROM ${tableName} WHERE role != 'admin' AND employee_id LIKE '${factoryCode}-%'`, [], (err, rows) => {
    if (err) {
      return callback(err, null);
    }
    
    let nextId = 1; // Mặc định bắt đầu từ 1 nếu chưa có nhân viên nào
    
    if (rows && rows.length > 0) {
      // Lọc ra các employee_id hợp lệ theo định dạng VSP-XXXX hoặc PVN-XXXX
      const validIds = rows
        .map(row => {
          const parts = row.employee_id.split('-');
          if (parts.length === 2 && parts[0] === factoryCode) {
            return parseInt(parts[1], 10);
          }
          return 0;
        })
        .filter(id => !isNaN(id) && id > 0);
      
      if (validIds.length > 0) {
        // Lấy ID lớn nhất và tăng lên 1
        nextId = Math.max(...validIds) + 1;
      }
    }
    
    // Format ID với 4 chữ số
    const formattedId = `${factoryCode}-${nextId.toString().padStart(4, '0')}`;
    
    // Cập nhật giá trị last_id trong bảng id_sequences (cho mục đích tham khảo)
    db.run(`UPDATE id_sequences SET last_id = ? WHERE factory = ?`, [nextId, factoryCode], (err) => {
      if (err) {
        console.error(`Lỗi khi cập nhật last_id cho ${factoryCode}:`, err.message);
        // Không return lỗi ở đây vì chỉ là cập nhật tham khảo
      }
      
      callback(null, formattedId);
    });
  });
}

// Khởi tạo dữ liệu hệ thống mặc định
function initSystems() {
  // Kiểm tra đã có dữ liệu chưa
  db.get(`SELECT COUNT(*) as count FROM systems`, [], (err, result) => {
    if (err) {
      console.error('Lỗi khi kiểm tra dữ liệu systems:', err.message);
      return;
    }
    
    // Nếu chưa có dữ liệu, thêm dữ liệu mẫu
    if (result.count === 0) {
      const systems = [
        { id: 'qlvt', name: 'QLVT', description: 'Quản lý vật tư', icon: 'fas fa-boxes' },
        { id: 'ketoan', name: 'Kế toán', description: 'Hệ thống kế toán', icon: 'fas fa-calculator' },
        { id: 'baotri', name: 'Bảo trì', description: 'Hệ thống bảo trì', icon: 'fas fa-tools' },
        { id: 'baove-nm12', name: 'Bảo vệ NM-NM2', description: 'Bảo vệ nhà máy 1 và 2', icon: 'fas fa-shield-alt' },
        { id: 'baove-nm3', name: 'Bảo vệ NM3', description: 'Bảo vệ nhà máy 3', icon: 'fas fa-shield-alt' },
        { id: 'qc', name: 'QC', description: 'Quản lý chất lượng', icon: 'fas fa-check-circle' },
        { id: 'sanxuat-nm1', name: 'Sản xuất NM1', description: 'Sản xuất nhà máy 1', icon: 'fas fa-industry' },
        { id: 'sanxuat-nm2', name: 'Sản xuất NM2', description: 'Sản xuất nhà máy 2', icon: 'fas fa-industry' },
        { id: 'sanxuat-nm3', name: 'Sản xuất NM3', description: 'Sản xuất nhà máy 3', icon: 'fas fa-industry' },
        { id: 'rnd', name: 'R&D', description: 'Nghiên cứu và phát triển', icon: 'fas fa-flask' }
      ];
      
      // Thêm các hệ thống
      systems.forEach(system => {
        db.run(`INSERT INTO systems (id, name, description, icon) VALUES (?, ?, ?, ?)`,
          [system.id, system.name, system.description, system.icon],
          (err) => {
            if (err) {
              console.error(`Lỗi khi thêm hệ thống ${system.name}:`, err.message);
            } else {
              console.log(`Đã thêm hệ thống ${system.name}`);
              
              // Nếu là QLVT, thêm module phiếu sang cuộn và phiếu cắt
              if (system.id === 'qlvt') {
                initQLVTModules(system.id);
              }
            }
          }
        );
      });
    }
  });
}

// Khởi tạo các module cho QLVT
function initQLVTModules(systemId) {
  const modules = [
    {
      id: 'phieusangcuon',
      name: 'Phiếu Sang Cuộn',
      description: 'Quản lý phiếu sang cuộn',
      path: '/QLVT/phieusangcuon.html',
      icon: 'fas fa-scroll'
    },
    {
      id: 'phieucat',
      name: 'Phiếu Cắt',
      description: 'Quản lý phiếu cắt',
      path: '/QLVT/phieucat.html',
      icon: 'fas fa-cut'
    }
  ];
  
  modules.forEach(module => {
    db.run(`INSERT INTO modules (id, system_id, name, description, path, icon)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [module.id, systemId, module.name, module.description, module.path, module.icon],
      (err) => {
        if (err) {
          console.error(`Lỗi khi thêm module ${module.name}:`, err.message);
        } else {
          console.log(`Đã thêm module ${module.name}`);
        }
      }
    );
  });
}


// Export db và các hàm tiện ích để sử dụng ở các module khác
module.exports = {
  db,
  getNextEmployeeId
};