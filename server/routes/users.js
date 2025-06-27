const express = require('express');
const router = express.Router();
const { db, getNextEmployeeId } = require('../db');

// Lấy danh sách người dùng (chỉ dành cho admin)
router.get('/list', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Lấy tham số nhà máy và phòng ban từ query
  const nhaMay = req.query.nhaMay;
  const department = req.query.department;
  
  try {
    // Nếu có cả nhà máy và phòng ban
    if (nhaMay && department) {
      const tableName = nhaMay === 'Nhà máy 3' ? 'users_PVN' : 'users_VSP';
      
      db.all(`SELECT id, employee_id, username, fullname, role, department, position, nhaMay, ca, created_at 
              FROM ${tableName} WHERE department = ? ORDER BY employee_id`, [department], (err, rows) => {
        if (err) {
          console.error(`Lỗi khi lấy danh sách người dùng ${nhaMay}, phòng ban ${department}:`, err.message);
          return res.status(500).json({ error: `Lỗi khi lấy danh sách người dùng ${nhaMay}, phòng ban ${department}` });
        }
        res.json(rows || []);
      });
      return;
    }
    
    // Nếu chỉ có phòng ban
    if (department) {
      db.all(`SELECT id, employee_id, username, fullname, role, department, position, nhaMay, ca, created_at 
              FROM users_VSP WHERE department = ?
              UNION ALL 
              SELECT id, employee_id, username, fullname, role, department, position, nhaMay, ca, created_at 
              FROM users_PVN WHERE department = ?
              ORDER BY nhaMay, employee_id`, [department, department], (err, rows) => {
        if (err) {
          console.error(`Lỗi khi lấy danh sách người dùng phòng ban ${department}:`, err.message);
          return res.status(500).json({ error: `Lỗi khi lấy danh sách người dùng phòng ban ${department}` });
        }
        res.json(rows || []);
      });
      return;
    }
    
    // Nếu chỉ có nhà máy
    if (nhaMay === 'Nhà máy 1+2') {
      // Chỉ lấy danh sách người dùng nhà máy 1+2
      db.all(`SELECT id, employee_id, username, fullname, role, department, position, nhaMay, ca, created_at 
              FROM users_VSP ORDER BY employee_id`, [], (err, rows) => {
        if (err) {
          console.error('Lỗi khi lấy danh sách người dùng nhà máy 1+2:', err.message);
          return res.status(500).json({ error: 'Lỗi khi lấy danh sách người dùng nhà máy 1+2' });
        }
        res.json(rows || []);
      });
    } else if (nhaMay === 'Nhà máy 3') {
      // Chỉ lấy danh sách người dùng nhà máy 3
      db.all(`SELECT id, employee_id, username, fullname, role, department, position, nhaMay, ca, created_at 
              FROM users_PVN ORDER BY employee_id`, [], (err, rows) => {
        if (err) {
          console.error('Lỗi khi lấy danh sách người dùng nhà máy 3:', err.message);
          return res.status(500).json({ error: 'Lỗi khi lấy danh sách người dùng nhà máy 3' });
        }
        res.json(rows || []);
      });
    } else {
      // Lấy tất cả người dùng từ cả hai bảng và kết hợp lại
      db.all(`SELECT id, employee_id, username, fullname, role, department, position, nhaMay, ca, created_at 
              FROM users_VSP 
              UNION ALL 
              SELECT id, employee_id, username, fullname, role, department, position, nhaMay, ca, created_at 
              FROM users_PVN
              ORDER BY nhaMay, employee_id`, [], (err, rows) => {
        if (err) {
          console.error('Lỗi khi lấy danh sách người dùng:', err.message);
          return res.status(500).json({ error: 'Lỗi khi lấy danh sách người dùng' });
        }
        res.json(rows || []);
      });
    }
  } catch (error) {
    console.error('Lỗi không mong đợi khi lấy danh sách người dùng:', error);
    return res.status(500).json({ error: 'Lỗi không mong đợi khi lấy danh sách người dùng' });
  }
});

// Lấy mã nhân viên tiếp theo (để hiển thị trước khi lưu)
router.post('/next-employee-id', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { nhaMay } = req.body;
  
  if (!nhaMay) {
    return res.status(400).json({ error: 'Vui lòng chọn nhà máy' });
  }
  
  // Sử dụng hàm getNextEmployeeId từ module db
  getNextEmployeeId(nhaMay, (err, employeeId) => {
    if (err) {
      console.error('Lỗi khi lấy mã nhân viên tiếp theo:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lấy mã nhân viên tiếp theo' });
    }
    
    res.json({ 
      success: true,
      employeeId: employeeId
    });
  });
});

// Kiểm tra đăng nhập
router.post('/login', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu' });
  }
  
  // Kiểm tra trong bảng users_VSP (nhà máy 1+2)
  db.get(`SELECT id, employee_id, username, fullname, role, department, position, nhaMay, ca  
          FROM users_VSP 
          WHERE username = ? AND password = ?`, [username, password], async (err, user) => {
    if (err) {
      console.error('Lỗi khi đăng nhập:', err.message);
      return res.status(500).json({ error: 'Lỗi khi đăng nhập' });
    }
    
    if (user) {
      // Đã tìm thấy user trong users_VSP
      handleSuccessfulLogin(user, res);
      return;
    }
    
    // Không tìm thấy trong users_VSP, kiểm tra trong users_PVN (nhà máy 3)
    db.get(`SELECT id, employee_id, username, fullname, role, department, position, nhaMay, ca 
            FROM users_PVN 
            WHERE username = ? AND password = ?`, [username, password], async (err, user) => {
      if (err) {
        console.error('Lỗi khi đăng nhập:', err.message);
        return res.status(500).json({ error: 'Lỗi khi đăng nhập' });
      }
      
      if (user) {
        // Đã tìm thấy user trong users_PVN
        handleSuccessfulLogin(user, res);
        return;
      }
      
      // Không tìm thấy trong cả hai bảng
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    });
  });
});

// Hàm xử lý đăng nhập thành công
async function handleSuccessfulLogin(user, res) {
  // Nếu là admin, trả về thông tin người dùng
  if (user.role === 'admin') {
    return res.json({
      success: true,
      user: user,
      permissions: { isAdmin: true }
    });
  }
  
  // Lấy quyền truy cập trang theo phòng ban
  try {
    const departmentPermissions = await getDepartmentPermissions(user.department);
    
    // Lấy quyền đặc biệt của user (nếu có)
    const userPermissions = await getUserPermissions(user.id, user.nhaMay);
    
    // Kết hợp quyền từ phòng ban và quyền đặc biệt của user
    const permissions = {
      isAdmin: false,
      pages: {}
    };
    
    // Thêm quyền phòng ban
    departmentPermissions.forEach(perm => {
      permissions.pages[perm.page_name] = {
        canAccess: perm.can_access === 1,
        canEdit: false,
        canDelete: false
      };
    });
    
    // Ghi đè bằng quyền đặc biệt của user (nếu có)
    userPermissions.forEach(perm => {
      permissions.pages[perm.page_name] = {
        canAccess: perm.can_access === 1,
        canEdit: perm.can_edit === 1,
        canDelete: perm.can_delete === 1
      };
    });
    
    return res.json({
      success: true,
      user: user,
      permissions: permissions
    });
  } catch (error) {
    console.error('Lỗi khi lấy quyền truy cập:', error);
    return res.status(500).json({ error: 'Lỗi khi lấy quyền truy cập' });
  }
}

// Thêm người dùng mới (chỉ dành cho admin)
router.post('/', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { fullname, password, role, department, position, nhaMay, ca } = req.body;
  
  if (!fullname || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin bắt buộc' });
  }
  
  // Xác định nhà máy, mặc định là "Nhà máy 1+2"
  const userFactory = nhaMay || 'Nhà máy 1+2';
  const factoryCode = userFactory === 'Nhà máy 3' ? 'PVN' : 'VSP';
  
  // Xác định ca, mặc định là "A"
  const userCa = ca || 'A';
  
  // Lấy mã nhân viên mới
  getNextEmployeeId(userFactory, (err, employeeId) => {
    if (err) {
      console.error('Lỗi khi lấy mã nhân viên mới:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lấy mã nhân viên mới' });
    }
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const tableName = factoryCode === 'PVN' ? 'users_PVN' : 'users_VSP';
    
    // Thêm người dùng mới vào bảng tương ứng
    db.run(`INSERT INTO ${tableName} (id, employee_id, username, password, fullname, role, department, position, nhaMay, ca)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, employeeId, employeeId, password, fullname, role || 'user', department || '', position || '', userFactory, userCa],
      function(err) {
        if (err) {
          console.error('Lỗi khi thêm người dùng:', err.message);
          return res.status(500).json({ error: 'Lỗi khi thêm người dùng' });
        }
        
        res.json({ 
          success: true, 
          id: userId,
          employeeId: employeeId,
          message: `Đã thêm người dùng ${employeeId} thành công` 
        });
      }
    );
  });
});

// Cập nhật người dùng (chỉ dành cho admin)
router.put('/:id', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  const { password, fullname, role, department, position, nhaMay, ca } = req.body;
  
  // Tìm người dùng trong cả hai bảng để xác định bảng cần cập nhật
  db.get(`SELECT * FROM users_VSP WHERE id = ?`, [id], (err, vspUser) => {
    if (err) {
      console.error('Lỗi khi tìm người dùng VSP:', err.message);
      return res.status(500).json({ error: 'Lỗi khi tìm người dùng' });
    }
    
    if (vspUser) {
      // Người dùng thuộc nhà máy 1+2
      updateUser('users_VSP', id, { password, fullname, role, department, position, ca }, res);
      return;
    }
    
    // Kiểm tra trong bảng users_PVN
    db.get(`SELECT * FROM users_PVN WHERE id = ?`, [id], (err, pvnUser) => {
      if (err) {
        console.error('Lỗi khi tìm người dùng PVN:', err.message);
        return res.status(500).json({ error: 'Lỗi khi tìm người dùng' });
      }
      
      if (pvnUser) {
        // Người dùng thuộc nhà máy 3
        updateUser('users_PVN', id, { password, fullname, role, department, position, ca }, res);
        return;
      }
      
      // Không tìm thấy người dùng trong cả hai bảng
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    });
  });
});

// Hàm cập nhật người dùng
function updateUser(tableName, userId, userData, res) {
  const { password, fullname, role, department, position, ca } = userData;
  
  // Tạo câu lệnh SQL động dựa trên các trường được cung cấp
  let fields = [];
  let params = [];
  
  if (password) {
    fields.push('password = ?');
    params.push(password);
  }
  
  if (fullname) {
    fields.push('fullname = ?');
    params.push(fullname);
  }
  
  if (role) {
    fields.push('role = ?');
    params.push(role);
  }
  
  if (department !== undefined) {
    fields.push('department = ?');
    params.push(department);
  }
  
  if (position !== undefined) {
    fields.push('position = ?');
    params.push(position);
  }
  
  // THÊM: Xử lý trường ca
  if (ca !== undefined) {
    fields.push('ca = ?');
    params.push(ca);
  }
  
  if (fields.length === 0) {
    return res.status(400).json({ error: 'Không có thông tin cập nhật' });
  }
  
  // Thêm id vào params
  params.push(userId);
  
  const sql = `UPDATE ${tableName} SET ${fields.join(', ')} WHERE id = ?`;
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('Lỗi khi cập nhật người dùng:', err.message);
      return res.status(500).json({ error: 'Lỗi khi cập nhật người dùng' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    
    res.json({ 
      success: true,
      message: 'Đã cập nhật người dùng thành công' 
    });
  });
}

// Xóa người dùng (chỉ dành cho admin)
router.delete('/:id', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { id } = req.params;
  
  // Kiểm tra người dùng trong bảng users_VSP
  db.get(`SELECT * FROM users_VSP WHERE id = ?`, [id], (err, vspUser) => {
    if (err) {
      console.error('Lỗi khi kiểm tra người dùng VSP:', err.message);
      return res.status(500).json({ error: 'Lỗi khi kiểm tra người dùng' });
    }
    
    if (vspUser) {
      // Nếu là admin mặc định, không cho phép xóa
      if (vspUser.role === 'admin' && vspUser.username === 'admin') {
        return res.status(403).json({ error: 'Không thể xóa tài khoản admin mặc định' });
      }
      
      // Bắt đầu transaction
      db.run('BEGIN TRANSACTION', function(err) {
        if (err) {
          console.error('Lỗi khi bắt đầu transaction:', err.message);
          return res.status(500).json({ error: 'Lỗi khi xóa người dùng' });
        }
        
        // Xóa quyền đặc biệt của user
        db.run(`DELETE FROM user_permissions WHERE user_id = ?`, [id], function(err) {
          if (err) {
            console.error('Lỗi khi xóa quyền người dùng:', err.message);
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Lỗi khi xóa quyền người dùng' });
          }
          
          // Xóa quyền module của user
          db.run(`DELETE FROM user_module_permissions WHERE user_id = ?`, [id], function(err) {
            if (err) {
              console.error('Lỗi khi xóa quyền module người dùng:', err.message);
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Lỗi khi xóa quyền module người dùng' });
            }
            
            // Xóa người dùng
            db.run(`DELETE FROM users_VSP WHERE id = ?`, [id], function(err) {
              if (err) {
                console.error('Lỗi khi xóa người dùng VSP:', err.message);
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Lỗi khi xóa người dùng' });
              }
              
              // Commit transaction
              db.run('COMMIT', function(err) {
                if (err) {
                  console.error('Lỗi khi commit transaction:', err.message);
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Lỗi khi hoàn tất xóa người dùng' });
                }
                
                res.json({ 
                  success: true,
                  message: 'Đã xóa người dùng thành công' 
                });
              });
            });
          });
        });
      });
      
      return;
    }
    
    // Kiểm tra trong bảng users_PVN
    db.get(`SELECT * FROM users_PVN WHERE id = ?`, [id], (err, pvnUser) => {
      if (err) {
        console.error('Lỗi khi kiểm tra người dùng PVN:', err.message);
        return res.status(500).json({ error: 'Lỗi khi kiểm tra người dùng' });
      }
      
      if (pvnUser) {
        // Bắt đầu transaction
        db.run('BEGIN TRANSACTION', function(err) {
          if (err) {
            console.error('Lỗi khi bắt đầu transaction:', err.message);
            return res.status(500).json({ error: 'Lỗi khi xóa người dùng' });
          }
          
          // Xóa quyền đặc biệt của user
          db.run(`DELETE FROM user_permissions WHERE user_id = ?`, [id], function(err) {
            if (err) {
              console.error('Lỗi khi xóa quyền người dùng:', err.message);
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Lỗi khi xóa quyền người dùng' });
            }
            
            // Xóa quyền module của user
            db.run(`DELETE FROM user_module_permissions WHERE user_id = ?`, [id], function(err) {
              if (err) {
                console.error('Lỗi khi xóa quyền module người dùng:', err.message);
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Lỗi khi xóa quyền module người dùng' });
              }
              
              // Xóa người dùng
              db.run(`DELETE FROM users_PVN WHERE id = ?`, [id], function(err) {
                if (err) {
                  console.error('Lỗi khi xóa người dùng PVN:', err.message);
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Lỗi khi xóa người dùng' });
                }
                
                // Commit transaction
                db.run('COMMIT', function(err) {
                  if (err) {
                    console.error('Lỗi khi commit transaction:', err.message);
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Lỗi khi hoàn tất xóa người dùng' });
                  }
                  
                  res.json({ 
                    success: true,
                    message: 'Đã xóa người dùng thành công' 
                  });
                });
              });
            });
          });
        });
        
        return;
      }
      
      // Không tìm thấy người dùng trong cả hai bảng
      res.status(404).json({ error: 'Không tìm thấy người dùng' });
    });
  });
});

// Đổi mật khẩu (người dùng có thể tự đổi)
router.post('/change-password', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { userId, oldPassword, newPassword, nhaMay } = req.body;
  
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
  }
  
  // Xác định bảng người dùng dựa vào nhà máy
  const tableName = nhaMay === 'Nhà máy 3' ? 'users_PVN' : 'users_VSP';
  
  // Kiểm tra mật khẩu cũ
  db.get(`SELECT * FROM ${tableName} WHERE id = ? AND password = ?`, [userId, oldPassword], (err, user) => {
    if (err) {
      console.error('Lỗi khi kiểm tra mật khẩu:', err.message);
      return res.status(500).json({ error: 'Lỗi khi kiểm tra mật khẩu' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Mật khẩu cũ không đúng' });
    }
    
    // Cập nhật mật khẩu mới
    db.run(`UPDATE ${tableName} SET password = ? WHERE id = ?`, [newPassword, userId], function(err) {
      if (err) {
        console.error('Lỗi khi đổi mật khẩu:', err.message);
        return res.status(500).json({ error: 'Lỗi khi đổi mật khẩu' });
      }
      
      res.json({ 
        success: true,
        message: 'Đã đổi mật khẩu thành công' 
      });
    });
  });
});

// Lấy danh sách quyền truy cập trang theo phòng ban
router.get('/permissions/department', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  db.all(`SELECT * FROM page_permissions ORDER BY department, page_name`, [], (err, rows) => {
    if (err) {
      console.error('Lỗi khi lấy quyền phòng ban:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lấy quyền truy cập phòng ban' });
    }
    res.json(rows || []);
  });
});

// Cập nhật quyền truy cập trang theo phòng ban
router.put('/permissions/department', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { department, pageName, canAccess } = req.body;
  
  if (!department || !pageName || canAccess === undefined) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
  }
  
  // Kiểm tra quyền đã tồn tại chưa
  db.get(`SELECT * FROM page_permissions WHERE department = ? AND page_name = ?`,
    [department, pageName], (err, permission) => {
    if (err) {
      console.error('Lỗi khi kiểm tra quyền:', err.message);
      return res.status(500).json({ error: 'Lỗi khi kiểm tra quyền truy cập' });
    }
    
    if (permission) {
      // Cập nhật quyền
      db.run(`UPDATE page_permissions SET can_access = ? WHERE department = ? AND page_name = ?`,
        [canAccess ? 1 : 0, department, pageName], function(err) {
        if (err) {
          console.error('Lỗi khi cập nhật quyền:', err.message);
          return res.status(500).json({ error: 'Lỗi khi cập nhật quyền truy cập' });
        }
        
        res.json({ 
          success: true,
          message: 'Đã cập nhật quyền truy cập thành công' 
        });
      });
    } else {
      // Thêm quyền mới
      const id = `perm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      db.run(`INSERT INTO page_permissions (id, department, page_name, can_access)
        VALUES (?, ?, ?, ?)`,
        [id, department, pageName, canAccess ? 1 : 0], function(err) {
        if (err) {
          console.error('Lỗi khi thêm quyền:', err.message);
          return res.status(500).json({ error: 'Lỗi khi thêm quyền truy cập' });
        }
        
        res.json({ 
          success: true,
          id: id,
          message: 'Đã thêm quyền truy cập thành công' 
        });
      });
    }
  });
});


// Lấy tất cả quyền module của phòng ban
router.get('/permissions/department/modules/all', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    const permissions = await db.allAsync(
      `SELECT * FROM department_module_permissions ORDER BY department, module_id`
    );
    
    res.json(permissions || []);
  } catch (error) {
    console.error('Lỗi khi lấy tất cả quyền phòng ban:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lỗi khi lấy quyền: ' + error.message 
    });
  }
});

// Lấy quyền đặc biệt của người dùng
router.get('/permissions/:userId', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { userId } = req.params;
  const { nhaMay } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'Thiếu thông tin người dùng' });
  }
  
  const query = nhaMay ? 
    `SELECT * FROM user_permissions WHERE user_id = ? AND nhaMay = ?` :
    `SELECT * FROM user_permissions WHERE user_id = ?`;
  
  const params = nhaMay ? [userId, nhaMay] : [userId];
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Lỗi khi lấy quyền người dùng:', err.message);
      return res.status(500).json({ error: 'Lỗi khi lấy quyền người dùng' });
    }
    res.json(rows || []);
  });
});

// Cập nhật quyền đặc biệt của người dùng
router.put('/permissions/:userId', (req, res) => {
  // Đảm bảo response luôn là JSON với UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const { userId } = req.params;
  const { pageName, canAccess, canEdit, canDelete, nhaMay } = req.body;
  
  if (!pageName || canAccess === undefined || !nhaMay) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
  }
  
  // Kiểm tra quyền đã tồn tại chưa
  db.get(`SELECT * FROM user_permissions WHERE user_id = ? AND page_name = ? AND nhaMay = ?`,
    [userId, pageName, nhaMay], (err, permission) => {
    if (err) {
      console.error('Lỗi khi kiểm tra quyền:', err.message);
      return res.status(500).json({ error: 'Lỗi khi kiểm tra quyền người dùng' });
    }
    
    if (permission) {
      // Cập nhật quyền
      db.run(`UPDATE user_permissions SET can_access = ?, can_edit = ?, can_delete = ? 
        WHERE user_id = ? AND page_name = ? AND nhaMay = ?`,
        [
          canAccess ? 1 : 0,
          canEdit ? 1 : 0,
          canDelete ? 1 : 0,
          userId,
          pageName,
          nhaMay
        ], function(err) {
        if (err) {
          console.error('Lỗi khi cập nhật quyền:', err.message);
          return res.status(500).json({ error: 'Lỗi khi cập nhật quyền người dùng' });
        }
        
        res.json({ 
          success: true,
          message: 'Đã cập nhật quyền người dùng thành công' 
        });
      });
    } else {
      // Thêm quyền mới
      const id = `perm_user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      db.run(`INSERT INTO user_permissions (id, user_id, nhaMay, page_name, can_access, can_edit, can_delete)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userId,
          nhaMay,
          pageName,
          canAccess ? 1 : 0,
          canEdit ? 1 : 0,
          canDelete ? 1 : 0
        ], function(err) {
        if (err) {
          console.error('Lỗi khi thêm quyền:', err.message);
          return res.status(500).json({ error: 'Lỗi khi thêm quyền người dùng' });
        }
        
        res.json({ 
          success: true,
          id: id,
          message: 'Đã thêm quyền người dùng thành công' 
        });
      });
    }
  });
});

// API lấy phân quyền theo phòng ban và hệ thống
router.get('/permissions/department/systems', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    const { department, system_id } = req.query;
    
    // Nếu có cả department và system_id, trả về quyền cụ thể
    if (department && system_id) {
      const permission = await db.getAsync(
        `SELECT * FROM department_system_permissions WHERE department = ? AND system_id = ?`,
        [department, system_id]
      );
      
      return res.json({
        success: true,
        permissions: permission ? [permission] : []
      });
    }
    
    // Lấy tất cả các phòng ban
    const departments = await db.allAsync(`SELECT DISTINCT name as department FROM departments ORDER BY name`);
    
    // Lấy tất cả các hệ thống
    const systems = await db.allAsync(`SELECT * FROM systems ORDER BY name`);
    
    // Lấy tất cả quyền hiện có
    const permissions = await db.allAsync(`SELECT * FROM department_system_permissions`);
    
    res.json({
      success: true,
      departments: departments,
      systems: systems,
      permissions: permissions
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin phân quyền:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lỗi khi lấy thông tin phân quyền: ' + error.message 
    });
  }
});

// Cập nhật quyền phòng ban theo hệ thống
router.put('/permissions/department/systems', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    const { department, systemId, canAccess } = req.body;
    
    if (!department || !systemId || canAccess === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'Vui lòng nhập đầy đủ thông tin' 
      });
    }
    
    // Trước tiên, kiểm tra xem phòng ban và hệ thống có tồn tại không
    const deptExists = await db.getAsync(
      `SELECT * FROM departments WHERE name = ?`,
      [department]
    );
    
    if (!deptExists) {
      return res.status(404).json({
        success: false,
        error: 'Phòng ban không tồn tại'
      });
    }
    
    const systemExists = await db.getAsync(
      `SELECT * FROM systems WHERE id = ?`,
      [systemId]
    );
    
    if (!systemExists) {
      return res.status(404).json({
        success: false,
        error: 'Hệ thống không tồn tại'
      });
    }
    
    // Kiểm tra quyền đã tồn tại chưa
    const permission = await db.getAsync(
      `SELECT * FROM department_system_permissions WHERE department = ? AND system_id = ?`,
      [department, systemId]
    );
    
    if (permission) {
      // Cập nhật quyền
      await db.runAsync(
        `UPDATE department_system_permissions SET can_access = ? WHERE department = ? AND system_id = ?`,
        [canAccess ? 1 : 0, department, systemId]
      );
      
      console.log(`Đã cập nhật quyền cho phòng ban ${department}, hệ thống ${systemId}, quyền truy cập: ${canAccess}`);
    } else {
      // Thêm quyền mới
      const id = `dsysperm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      await db.runAsync(
        `INSERT INTO department_system_permissions (id, department, system_id, can_access)
        VALUES (?, ?, ?, ?)`,
        [id, department, systemId, canAccess ? 1 : 0]
      );
      
      console.log(`Đã thêm quyền mới cho phòng ban ${department}, hệ thống ${systemId}, quyền truy cập: ${canAccess}`);
    }
    
    // Sau khi cập nhật quyền hệ thống, cập nhật luôn quyền cho tất cả module của hệ thống
    const modules = await db.allAsync(
      `SELECT id FROM modules WHERE system_id = ?`,
      [systemId]
    );
    
    if (modules && modules.length > 0) {
      for (const module of modules) {
        // Kiểm tra quyền module đã tồn tại chưa
        const modulePermission = await db.getAsync(
          `SELECT * FROM department_module_permissions WHERE department = ? AND module_id = ?`,
          [department, module.id]
        );
        
        if (modulePermission) {
          // Cập nhật quyền module
          await db.runAsync(
            `UPDATE department_module_permissions SET can_access = ? WHERE department = ? AND module_id = ?`,
            [canAccess ? 1 : 0, department, module.id]
          );
        } else {
          // Thêm quyền module mới
          const permId = `dmodperm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${module.id}`;
          
          await db.runAsync(
            `INSERT INTO department_module_permissions (id, department, module_id, can_access)
            VALUES (?, ?, ?, ?)`,
            [permId, department, module.id, canAccess ? 1 : 0]
          );
        }
      }
    }
    
    res.json({ 
      success: true,
      message: 'Đã cập nhật quyền thành công' 
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật quyền:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lỗi khi cập nhật quyền: ' + error.message 
    });
  }
});

// Lấy quyền theo người dùng và module
router.get('/permissions/user/modules', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    const { userId, moduleId, nhaMay } = req.query;
    
    // Kiểm tra tham số
    if (!userId) {
      return res.status(400).json({ error: 'Thiếu thông tin người dùng' });
    }
    
    // Nếu có đủ cả 3 tham số
    if (userId && moduleId && nhaMay) {
      const permissions = await db.allAsync(
        `SELECT * FROM user_module_permissions WHERE user_id = ? AND module_id = ? AND nhaMay = ?`,
        [userId, moduleId, nhaMay]
      );
      
      return res.json(permissions || []);
    }
    
    // Nếu chỉ có userId và nhaMay
    if (userId && nhaMay && !moduleId) {
      const permissions = await db.allAsync(
        `SELECT * FROM user_module_permissions WHERE user_id = ? AND nhaMay = ?`,
        [userId, nhaMay]
      );
      
      return res.json(permissions || []);
    }
    
    // Nếu chỉ có userId và moduleId
    if (userId && moduleId && !nhaMay) {
      const permissions = await db.allAsync(
        `SELECT * FROM user_module_permissions WHERE user_id = ? AND module_id = ?`,
        [userId, moduleId]
      );
      
      return res.json(permissions || []);
    }
    
    // Nếu chỉ có userId
    const permissions = await db.allAsync(
      `SELECT * FROM user_module_permissions WHERE user_id = ?`,
      [userId]
    );
    
    return res.json(permissions || []);
    
  } catch (error) {
    console.error('Lỗi khi lấy quyền module người dùng:', error);
    return res.status(500).json({ error: 'Lỗi khi lấy quyền module người dùng: ' + error.message });
  }
});

// Cập nhật quyền người dùng theo module
router.put('/permissions/user/modules', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    const { userId, moduleId, nhaMay, canAccess, canEdit, canDelete } = req.body;
    
    if (!userId || !moduleId || !nhaMay || canAccess === undefined) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // Kiểm tra quyền đã tồn tại chưa
    const permission = await db.getAsync(
      `SELECT * FROM user_module_permissions WHERE user_id = ? AND module_id = ? AND nhaMay = ?`,
      [userId, moduleId, nhaMay]
    );
    
    if (permission) {
      // Cập nhật quyền
      await db.runAsync(
        `UPDATE user_module_permissions SET can_access = ?, can_edit = ?, can_delete = ? 
        WHERE user_id = ? AND module_id = ? AND nhaMay = ?`,
        [
          canAccess ? 1 : 0,
          canEdit ? 1 : 0,
          canDelete ? 1 : 0,
          userId,
          moduleId,
          nhaMay
        ]
      );
      
      res.json({ 
        success: true,
        message: 'Đã cập nhật quyền thành công' 
      });
    } else {
      // Thêm quyền mới
      const id = `umodperm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      await db.runAsync(
        `INSERT INTO user_module_permissions (id, user_id, nhaMay, module_id, can_access, can_edit, can_delete)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userId,
          nhaMay,
          moduleId,
          canAccess ? 1 : 0,
          canEdit ? 1 : 0,
          canDelete ? 1 : 0
        ]
      );
      
      res.json({ 
        success: true,
        id: id,
        message: 'Đã thêm quyền thành công' 
      });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật quyền module người dùng:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật quyền: ' + error.message });
  }
});

// API lấy quyền phòng ban đối với module
router.get('/permissions/department/modules', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    const { department, moduleId } = req.query;
    
    // Log request để debug
    console.log(`GET PERMISSIONS REQUEST: department=${department}, moduleId=${moduleId}`);
    
    // Trường hợp không có tham số, lấy tất cả quyền
    if (!department && !moduleId) {
      // Sử dụng left join để đảm bảo lấy đủ tất cả quyền
      const allPermissions = await db.allAsync(`
        SELECT dmp.*, m.name as module_name, m.system_id
        FROM department_module_permissions dmp
        LEFT JOIN modules m ON dmp.module_id = m.id
        ORDER BY dmp.department, dmp.module_id
      `);
      
      console.log(`Tìm thấy ${allPermissions.length} quyền phòng ban`);
      
      return res.json({
        success: true,
        permissions: allPermissions || []
      });
    }
    
    // Trường hợp chỉ có department
    if (department && !moduleId) {
      const departmentPermissions = await db.allAsync(`
        SELECT dmp.*, m.name as module_name, m.system_id 
        FROM department_module_permissions dmp
        LEFT JOIN modules m ON dmp.module_id = m.id
        WHERE dmp.department = ?
        ORDER BY dmp.module_id
      `, [department]);
      
      console.log(`Tìm thấy ${departmentPermissions.length} quyền cho phòng ban ${department}`);
      // In ra từng quyền để debug
      departmentPermissions.forEach((p, i) => {
        console.log(`  ${i+1}. Module ${p.module_id}: can_access=${p.can_access}`);
      });
      
      return res.json({
        success: true,
        permissions: departmentPermissions || []
      });
    }
    
    // Trường hợp chỉ có moduleId
    if (!department && moduleId) {
      const modulePermissions = await db.allAsync(`
        SELECT dmp.*, m.name as module_name, m.system_id
        FROM department_module_permissions dmp
        LEFT JOIN modules m ON dmp.module_id = m.id
        WHERE dmp.module_id = ?
        ORDER BY dmp.department
      `, [moduleId]);
      
      return res.json({
        success: true,
        permissions: modulePermissions || []
      });
    }
    
    // Trường hợp có cả department và moduleId
    const permission = await db.getAsync(`
      SELECT dmp.*, m.name as module_name, m.system_id
      FROM department_module_permissions dmp
      LEFT JOIN modules m ON dmp.module_id = m.id  
      WHERE dmp.department = ? AND dmp.module_id = ?
    `, [department, moduleId]);
    
    console.log(`Quyền cụ thể cho ${department} - ${moduleId}:`, permission);
    
    // Nếu không tìm thấy, trả về giá trị mặc định
    if (!permission) {
      return res.json({
        success: true,
        department,
        module_id: moduleId,
        can_access: 0
      });
    }
    
    res.json({
      success: true,
      ...permission
    });
  } catch (error) {
    console.error('Lỗi khi lấy quyền phòng ban với module:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lỗi khi lấy quyền: ' + error.message 
    });
  }
});

// API cập nhật quyền phòng ban đối với module
router.put('/permissions/department/modules', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    const { department, moduleId, canAccess } = req.body;
    
    // Ghi log chi tiết để debug
    console.log('REQUEST UPDATE PERMISSION:', JSON.stringify({
      department,
      moduleId,
      canAccess
    }, null, 2));
    
    if (!department || !moduleId || canAccess === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'Vui lòng cung cấp đầy đủ thông tin!' 
      });
    }
    
    // Lấy giá trị canAccess dưới dạng số nguyên rõ ràng (0 hoặc 1)
    const accessValue = canAccess ? 1 : 0;
    
    // Bắt đầu transaction để đảm bảo tính nhất quán
    await db.runAsync('BEGIN TRANSACTION');
    
    try {
      // Kiểm tra quyền đã tồn tại chưa
      const existingPerm = await db.getAsync(
        `SELECT * FROM department_module_permissions WHERE department = ? AND module_id = ?`,
        [department, moduleId]
      );
      
      // Ghi log thông tin quyền hiện tại
      console.log('EXISTING PERMISSION:', existingPerm);
      
      if (existingPerm) {
        // Cập nhật quyền hiện có
        await db.runAsync(
          `UPDATE department_module_permissions SET can_access = ? WHERE id = ?`,
          [accessValue, existingPerm.id]
        );
        console.log(`Đã cập nhật quyền ID=${existingPerm.id} từ ${existingPerm.can_access} thành ${accessValue}`);
      } else {
        // Thêm quyền mới với ID rõ ràng
        const id = `dmodperm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        await db.runAsync(
          `INSERT INTO department_module_permissions (id, department, module_id, can_access) 
           VALUES (?, ?, ?, ?)`,
          [id, department, moduleId, accessValue]
        );
        console.log(`Đã thêm quyền mới ID=${id}, canAccess=${accessValue}`);
      }
      
      // Commit transaction
      await db.runAsync('COMMIT');
      
      // Kiểm tra lại để xác nhận đã lưu đúng
      const updatedPerm = await db.getAsync(
        `SELECT * FROM department_module_permissions WHERE department = ? AND module_id = ?`,
        [department, moduleId]
      );
      
      console.log('AFTER UPDATE PERMISSION:', updatedPerm);
      
      res.json({ 
        success: true, 
        message: 'Đã cập nhật quyền thành công!',
        data: updatedPerm
      });
    } catch (error) {
      // Nếu có lỗi, rollback transaction
      await db.runAsync('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật quyền phòng ban với module:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi khi cập nhật quyền: ' + error.message 
    });
  }
});


// API mới: Lấy tất cả các module và trạng thái quyền của một phòng ban
router.get('/permissions/department/all-modules', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    const { department } = req.query;
    
    if (!department) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp tên phòng ban'
      });
    }
    
    // Lấy tất cả các module từ database
    const allModules = await db.allAsync(`
      SELECT m.*, s.name as system_name
      FROM modules m
      LEFT JOIN systems s ON m.system_id = s.id
      ORDER BY s.name, m.name
    `);
    
    // Lấy tất cả quyền của phòng ban
    const deptPermissions = await db.allAsync(`
      SELECT * FROM department_module_permissions
      WHERE department = ?
    `, [department]);
    
    // Map quyền vào modules
    const modulesWithPermissions = allModules.map(module => {
      // Tìm quyền tương ứng
      const permission = deptPermissions.find(p => p.module_id === module.id);
      
      return {
        ...module,
        can_access: permission ? permission.can_access : 0,
        permission_id: permission ? permission.id : null
      };
    });
    
    // Nhóm modules theo hệ thống
    const groupedBySystem = {};
    
    modulesWithPermissions.forEach(module => {
      const systemId = module.system_id;
      
      if (!groupedBySystem[systemId]) {
        groupedBySystem[systemId] = {
          system_id: systemId,
          system_name: module.system_name,
          modules: []
        };
      }
      
      groupedBySystem[systemId].modules.push({
        id: module.id,
        name: module.name,
        description: module.description,
        can_access: module.can_access,
        permission_id: module.permission_id
      });
    });
    
    res.json({
      success: true,
      department,
      systems: Object.values(groupedBySystem)
    });
    
  } catch (error) {
    console.error('Lỗi khi lấy danh sách module và quyền:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy danh sách module và quyền: ' + error.message
    });
  }
});


// Lấy tất cả quyền module của phòng ban
router.get('/permissions/department/modules/all', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    const permissions = await db.allAsync(
      `SELECT * FROM department_module_permissions ORDER BY department, module_id`
    );
    
    res.json(permissions || []);
  } catch (error) {
    console.error('Lỗi khi lấy tất cả quyền phòng ban:', error);
    res.status(500).json({ 
      success: false,
      error: 'Lỗi khi lấy quyền: ' + error.message 
    });
  }
});

// Hàm lấy quyền truy cập trang theo phòng ban
function getDepartmentPermissions(department) {
  return new Promise((resolve, reject) => {
    if (!department) {
      resolve([]);
      return;
    }
    
    db.all(`SELECT * FROM page_permissions WHERE department = ?`, [department], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

// Hàm lấy quyền đặc biệt của người dùng
function getUserPermissions(userId, nhaMay) {
  return new Promise((resolve, reject) => {
    if (!userId || !nhaMay) {
      resolve([]);
      return;
    }
    
    db.all(`SELECT * FROM user_permissions WHERE user_id = ? AND nhaMay = ?`, 
      [userId, nhaMay], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

module.exports = router;