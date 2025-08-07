const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Cấu hình kết nối MySQL tối ưu cho ER_MALFORMED_PACKET
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Vsp@123456',
  database: process.env.DB_NAME || 'phieu_db',
  charset: 'utf8mb4',
  timezone: '+07:00',
  
  // Pool configuration tối ưu
  connectionLimit: 2, // Giảm xuống 2 để tránh connection conflicts
  queueLimit: 0,
  
  // Connection configuration an toàn
  supportBigNumbers: true,
  bigNumberStrings: false,
  dateStrings: ['DATE', 'DATETIME', 'TIMESTAMP'],
  ssl: false,
  multipleStatements: false,
  connectTimeout: 60000,
  
  // Các options bổ sung để tránh malformed packet
  typeCast: function (field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      return (field.string() === '1'); // Convert TINYINT(1) to boolean
    }
    return next();
  }
};

// Tạo connection pool
let pool;
try {
  pool = mysql.createPool(dbConfig);
  console.log(`✅ MySQL pool created for database: ${dbConfig.database} at ${dbConfig.host}`);
} catch (error) {
  console.error('❌ Failed to create MySQL pool:', error.message);
  process.exit(1);
}

// Pool event handlers
pool.on('connection', function (connection) {
  console.log('✅ MySQL connection established as id ' + connection.threadId);
  
  // Set timeout variables safely
  setTimeout(async () => {
    const safeSetVariable = async (variable, value) => {
      try {
        await connection.execute(`SET SESSION ${variable} = ${value}`);
        console.log(`✅ Set ${variable} = ${value}`);
      } catch (err) {
        console.warn(`⚠️ Cannot set ${variable}:`, err.message);
      }
    };
    
    await safeSetVariable('net_read_timeout', 600);
    await safeSetVariable('net_write_timeout', 600);
    await safeSetVariable('wait_timeout', 28800);
    await safeSetVariable('interactive_timeout', 28800);
  }, 500);
});

pool.on('error', function(err) {
  console.error('❌ MySQL pool error:', err.code);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Connection lost, will retry...');
  } else if (err.code === 'ER_MALFORMED_PACKET') {
    console.error('💥 MALFORMED PACKET ERROR detected in pool');
  }
});

// Enhanced DatabaseWrapper class
class DatabaseWrapper {
  constructor(pool) {
    this.pool = pool;
    this.maxParamLength = 500; // Giới hạn độ dài parameter
    this.maxTotalParams = 20;  // Giới hạn số parameter
  }

  // Clean và validate parameters mạnh mẽ
  _cleanParams(params, sqlQuery = '') {
    if (!Array.isArray(params)) {
      console.warn('⚠️ Parameters không phải array, converting...');
      params = [params];
    }
    
    // Giới hạn số lượng parameters
    if (params.length > this.maxTotalParams) {
      console.warn(`⚠️ Quá nhiều parameters (${params.length}), query có thể gây malformed packet`);
      console.log('SQL causing issue:', sqlQuery.substring(0, 200) + '...');
    }
    
    return params.map((param, index) => {
      try {
        // Handle null/undefined
        if (param === undefined || param === null) return null;
        if (param === '') return null;
        
        // Handle string parameters
        if (typeof param === 'string') {
          // Remove dangerous characters
          let cleaned = param.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
          
          // Remove emojis and special unicode
          cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/gu, '');
          
          // Normalize unicode
          try {
            cleaned = cleaned.normalize('NFC');
          } catch (e) {
            console.warn(`⚠️ Unicode normalization failed for param ${index}`);
          }
          
          // Strict length limit
          if (cleaned.length > this.maxParamLength) {
            console.warn(`⚠️ Param ${index}: Truncating string ${cleaned.length} -> ${this.maxParamLength}`);
            cleaned = cleaned.substring(0, this.maxParamLength);
          }
          
          // Simple escaping
          cleaned = cleaned.replace(/\\/g, '\\\\')
                          .replace(/'/g, "\\'")
                          .replace(/"/g, '\\"')
                          .replace(/\n/g, ' ')
                          .replace(/\r/g, ' ')
                          .replace(/\t/g, ' ');
          
          return cleaned;
        }
        
        // Handle boolean
        if (typeof param === 'boolean') {
          return param ? 1 : 0;
        }
        
        // Handle numbers
        if (typeof param === 'number') {
          if (!Number.isFinite(param) || isNaN(param)) {
            console.warn(`⚠️ Invalid number param ${index}: ${param}, converting to 0`);
            return 0;
          }
          
          // Prevent extremely large numbers
          if (Math.abs(param) > Number.MAX_SAFE_INTEGER) {
            console.warn(`⚠️ Number too large param ${index}: ${param}, clamping`);
            return param > 0 ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
          }
          
          return param;
        }
        
        // Handle objects/arrays
        if (typeof param === 'object' && param !== null) {
          try {
            const jsonStr = JSON.stringify(param);
            if (jsonStr.length > this.maxParamLength) {
              console.warn(`⚠️ JSON param ${index} too large: ${jsonStr.length} chars`);
              return jsonStr.substring(0, this.maxParamLength);
            }
            return jsonStr;
          } catch (e) {
            console.warn(`⚠️ Cannot stringify object param ${index}:`, e.message);
            return null;
          }
        }
        
        return param;
        
      } catch (error) {
        console.warn(`⚠️ Error cleaning param ${index}:`, error.message);
        return null;
      }
    });
  }

  // Improved retry mechanism
  async _executeWithRetry(operation, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        const retryableCodes = [
          'PROTOCOL_CONNECTION_LOST',
          'PROTOCOL_PACKETS_OUT_OF_ORDER', 
          'ECONNRESET',
          'ETIMEDOUT',
          'ER_LOCK_WAIT_TIMEOUT',
          'ENOTFOUND',
          'ECONNREFUSED',
          'ER_MALFORMED_PACKET',
          'PROTOCOL_ENQUEUE_AFTER_QUIT',
          'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR'
        ];
        
        const retryableMessages = [
          'Malformed communication packet',
          'Connection lost',
          'Connection timeout',
          'Lost connection to MySQL server',
          'MySQL server has gone away'
        ];
        
        const isRetryable = retryableCodes.includes(error.code) || 
                           retryableMessages.some(msg => error.message && error.message.includes(msg));
        
        if (isRetryable && attempt < maxRetries) {
          let delay = 2000 * attempt; // Base delay 2 seconds
          
          if (error.code === 'ER_MALFORMED_PACKET') {
            delay = Math.min(3000 * attempt, 15000); // Max 15 seconds for malformed packet
            console.log(`💥 ER_MALFORMED_PACKET retry ${attempt}/${maxRetries}, waiting ${delay}ms`);
            
            // Try to recreate connection on malformed packet
            if (attempt === 2) {
              console.log('🔄 Attempting to refresh pool connection...');
              try {
                const testConn = await this.pool.getConnection();
                await testConn.ping();
                testConn.release();
                console.log('✅ Pool connection refresh successful');
              } catch (refreshError) {
                console.warn('⚠️ Pool refresh failed:', refreshError.code);
              }
            }
          } else {
            console.log(`🔄 Database retry ${attempt}/${maxRetries} for: ${error.code}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Log final error with more details
        console.error(`❌ Database operation failed after ${attempt} attempts:`, {
          code: error.code,
          errno: error.errno,
          sqlState: error.sqlState,
          message: error.message ? error.message.substring(0, 300) : 'No message',
          sqlPreview: error.sql ? error.sql.substring(0, 300) + '...' : 'No SQL',
          attempt: attempt
        });
        
        break;
      }
    }
    
    throw lastError;
  }

  // Enhanced allAsync method
  async allAsync(sql, params = []) {
    // Pre-validate inputs
    if (!sql || typeof sql !== 'string') {
      throw new Error('Invalid SQL query: must be non-empty string');
    }
    
    if (sql.length > 10000) {
      console.warn(`⚠️ Very long SQL query (${sql.length} chars), may cause malformed packet`);
    }
    
    return await this._executeWithRetry(async () => {
      let connection;
      try {
        connection = await this.pool.getConnection();
        const cleanParams = this._cleanParams(params, sql);
        const [rows] = await connection.execute(sql, cleanParams);
        return rows || [];
      } finally {
        if (connection) {
          try {
            connection.release();
          } catch (releaseError) {
            console.warn('⚠️ Connection release error:', releaseError.message);
          }
        }
      }
    });
  }

  // Enhanced runAsync method
  async runAsync(sql, params = []) {
    // Pre-validate inputs
    if (!sql || typeof sql !== 'string') {
      throw new Error('Invalid SQL query: must be non-empty string');
    }
    
    if (sql.length > 10000) {
      console.warn(`⚠️ Very long SQL query (${sql.length} chars), may cause malformed packet`);
    }
    
    return await this._executeWithRetry(async () => {
      let connection;
      try {
        connection = await this.pool.getConnection();
        const cleanParams = this._cleanParams(params, sql);
        
        // Log only for debugging malformed packet issues
        if (process.env.DB_DEBUG === 'true') {
          console.log('🔍 SQL Preview:', sql.substring(0, 200) + '...');
          console.log('🔍 Param count:', cleanParams.length);
          console.log('🔍 Param sizes:', cleanParams.map(p => 
            typeof p === 'string' ? p.length : typeof p
          ));
        }
        
        const [result] = await connection.execute(sql, cleanParams);
        return {
          changes: result.affectedRows || 0,
          lastID: result.insertId || 0
        };
      } finally {
        if (connection) {
          try {
            connection.release();
          } catch (releaseError) {
            console.warn('⚠️ Connection release error:', releaseError.message);
          }
        }
      }
    });
  }

  // Enhanced getAsync method
  async getAsync(sql, params = []) {
    // Pre-validate inputs
    if (!sql || typeof sql !== 'string') {
      throw new Error('Invalid SQL query: must be non-empty string');
    }
    
    return await this._executeWithRetry(async () => {
      let connection;
      try {
        connection = await this.pool.getConnection();
        const cleanParams = this._cleanParams(params, sql);
        const [rows] = await connection.execute(sql, cleanParams);
        return rows[0] || null;
      } finally {
        if (connection) {
          try {
            connection.release();
          } catch (releaseError) {
            console.warn('⚠️ Connection release error:', releaseError.message);
          }
        }
      }
    });
  }

  // SQLite-compatible callback methods
  all(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    this.allAsync(sql, params)
      .then(rows => callback(null, rows))
      .catch(err => callback(err, null));
  }

  run(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    this.runAsync(sql, params)
      .then(result => {
        const context = {
          changes: result.changes,
          lastID: result.lastID
        };
        callback.call(context, null);
      })
      .catch(err => callback(err));
  }

  get(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    this.getAsync(sql, params)
      .then(row => callback(null, row))
      .catch(err => callback(err, null));
  }
}

// Create database wrapper instance
const db = new DatabaseWrapper(pool);

// Bind async methods
db.allAsync = db.allAsync.bind(db);
db.runAsync = db.runAsync.bind(db);
db.getAsync = db.getAsync.bind(db);

// Connection test function
db.testConnection = async function() {
  let connection;
  try {
    connection = await this.pool.getConnection();
    const [result] = await connection.execute('SELECT 1 as test');
    return result && result[0] && result[0].test === 1;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.warn('⚠️ Test connection release error:', releaseError.message);
      }
    }
  }
};

// Graceful shutdown
db.close = async function() {
  try {
    console.log('🔄 Closing database connections...');
    await pool.end();
    console.log('✅ Database connections closed gracefully');
  } catch (error) {
    console.error('❌ Error closing database:', error.message);
  }
};

// Process signal handlers
const gracefulShutdown = async (signal) => {
  console.log(`📡 Received ${signal}, shutting down gracefully...`);
  await db.close();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Main connection and initialization function
async function connectAndInitDatabase() {
  try {
    console.log('🔄 Connecting to MySQL database...');
    
    // Test basic connection first
    let testConnection;
    try {
      testConnection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        charset: 'utf8mb4',
        connectTimeout: 30000
      });

      await testConnection.execute('SELECT 1');
      console.log('✅ Basic MySQL connection test passed');

      // Create database if not exists
      await testConnection.execute(`
        CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` 
        CHARACTER SET utf8mb4 
        COLLATE utf8mb4_unicode_ci
      `);
      console.log(`✅ Database ${dbConfig.database} ready`);
      
    } catch (testError) {
      console.error('❌ Basic connection test failed:', testError.message);
      throw testError;
    } finally {
      if (testConnection) {
        try {
          await testConnection.end();
        } catch (endError) {
          console.warn('⚠️ Test connection end error:', endError.message);
        }
      }
    }

    // Test pool connection
    const poolTestResult = await db.testConnection();
    if (!poolTestResult) {
      throw new Error('Pool connection test failed');
    }

    console.log(`✅ Successfully connected to MySQL: ${dbConfig.host}/${dbConfig.database}`);
    
    // Initialize default data
    setTimeout(() => {
      initDefaultData();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ER_MALFORMED_PACKET') {
      console.error(`
💡 ER_MALFORMED_PACKET Solutions:
1. Configure MySQL server (/etc/mysql/my.cnf or my.ini):
   [mysqld]
   max_allowed_packet = 64M
   net_read_timeout = 600  
   net_write_timeout = 600
   wait_timeout = 28800
   interactive_timeout = 28800
   
2. Restart MySQL server:
   sudo systemctl restart mysql
   
3. Or run these SQL commands:
   SET GLOBAL max_allowed_packet = 67108864;
   SET GLOBAL net_read_timeout = 600;
   SET GLOBAL net_write_timeout = 600;
      `);
    }
    
    process.exit(1);
  }
}

// Initialize default data
function initDefaultData() {
  console.log('🔄 Initializing default data...');
  
  setTimeout(() => {
    initIdSequences();
    createDefaultAdmin();
    initDepartments();
    initSystems();
    createDefaultPermissions();
  }, 500);
  
  setTimeout(() => {
    checkAndFixDuplicatePermissions();
    checkAndFixDuplicateSystems(); 
    checkAndFixDuplicateDepartments();
  }, 3000);
}

// Initialize ID sequences
function initIdSequences() {
  const sequences = [
    { factory: 'VSP', description: 'Nhà máy 1+2' },
    { factory: 'PVN', description: 'Nhà máy 3' }
  ];
  
  sequences.forEach(seq => {
    db.get(`SELECT * FROM id_sequences WHERE factory = ?`, [seq.factory], (err, row) => {
      if (err) {
        console.error(`❌ Error checking ${seq.factory} sequence:`, err.message);
        return;
      }
      
      if (!row) {
        db.run(`INSERT INTO id_sequences (factory, last_id) VALUES (?, 0)`, [seq.factory], (err) => {
          if (err) {
            console.error(`❌ Error creating ${seq.factory} sequence:`, err.message);
          } else {
            console.log(`✅ Created sequence for ${seq.description}`);
          }
        });
      }
    });
  });
}

// Create default admin account
function createDefaultAdmin() {
  db.get(`SELECT * FROM users_VSP WHERE username = ?`, ['admin'], (err, vspUser) => {
    if (err) {
      console.error('❌ Error checking admin account:', err.message);
      return;
    }
    
    if (!vspUser) {
      const adminData = {
        id: Date.now().toString(),
        employee_id: 'ADMIN',
        username: 'admin',
        password: 'admin123',
        fullname: 'Administrator',
        role: 'admin',
        nhaMay: 'All'
      };
      
      db.run(`INSERT INTO users_VSP (id, employee_id, username, password, fullname, role, nhaMay) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        Object.values(adminData), 
        (err) => {
          if (err) {
            console.error('❌ Error creating admin account:', err.message);
          } else {
            console.log('✅ Default admin account created');
          }
        }
      );
    }
  });
}

// Initialize departments
function initDepartments() {
  db.get(`SELECT COUNT(*) as count FROM departments`, [], (err, result) => {
    if (err) {
      console.error('❌ Error checking departments:', err.message);
      return;
    }
    
    if (result.count === 0) {
      const departments = [
        { id: 'qlvt', name: 'Quản lý vật tư', description: 'Materials Management' },
        { id: 'rnd', name: 'R&D', description: 'Research & Development' },
        { id: 'qc', name: 'QC', description: 'Quality Control' },
        { id: 'inoffset', name: 'In Offset', description: 'Offset Printing' }
      ];
      
      departments.forEach(dept => {
        db.run(`INSERT INTO departments (id, name, description) VALUES (?, ?, ?)`,
          [dept.id, dept.name, dept.description],
          (err) => {
            if (err) {
              console.error(`❌ Error creating department ${dept.name}:`, err.message);
            } else {
              console.log(`✅ Created department: ${dept.name}`);
            }
          }
        );
      });
    }
  });
}

// Initialize systems
function initSystems() {
  db.get(`SELECT COUNT(*) as count FROM systems`, [], (err, result) => {
    if (err) {
      console.error('❌ Error checking systems:', err.message);
      return;
    }
    
    if (result.count === 0) {
      const systems = [
        { id: 'qlvt', name: 'QLVT', description: 'Materials Management', icon: 'fas fa-boxes' },
        { id: 'ketoan', name: 'Accounting', description: 'Accounting System', icon: 'fas fa-calculator' },
        { id: 'baotri', name: 'Maintenance', description: 'Maintenance System', icon: 'fas fa-tools' },
        { id: 'sanxuat-nm1', name: 'Production Plant 1', description: 'Plant 1 Production', icon: 'fas fa-industry' },
        { id: 'sanxuat-nm2', name: 'Production Plant 2', description: 'Plant 2 Production', icon: 'fas fa-industry' },
        { id: 'sanxuat-nm3', name: 'Production Plant 3', description: 'Plant 3 Production', icon: 'fas fa-industry' }
      ];
      
      systems.forEach(system => {
        db.run(`INSERT INTO systems (id, name, description, icon) VALUES (?, ?, ?, ?)`,
          [system.id, system.name, system.description, system.icon],
          (err) => {
            if (err) {
              console.error(`❌ Error creating system ${system.name}:`, err.message);
            } else {
              console.log(`✅ Created system: ${system.name}`);
              
              // Initialize modules for specific systems
              if (system.id === 'qlvt') {
                setTimeout(() => initQLVTModules(system.id), 500);
              }
              if (system.id === 'sanxuat-nm1') {
                setTimeout(() => initSanXuatNM1Modules(), 500);
              }
            }
          }
        );
      });
    }
  });
}

// Initialize QLVT modules
function initQLVTModules(systemId) {
  const modules = [
    {
      id: 'phieusangcuon',
      name: 'Roll Transfer Form',
      description: 'Manage roll transfer forms',
      path: '/QLVT/phieusangcuon.html',
      icon: 'fas fa-scroll'
    },
    {
      id: 'phieucat',
      name: 'Cutting Form', 
      description: 'Manage cutting forms',
      path: '/QLVT/phieucat.html',
      icon: 'fas fa-cut'
    }
  ];
  
  modules.forEach(module => {
    db.run(`INSERT IGNORE INTO modules (id, system_id, name, description, path, icon)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [module.id, systemId, module.name, module.description, module.path, module.icon],
      (err) => {
        if (err) {
          console.error(`❌ Error creating module ${module.name}:`, err.message);
        } else {
          console.log(`✅ Created module: ${module.name}`);
        }
      }
    );
  });
}

// Initialize Plant 1 production modules
function initSanXuatNM1Modules() {
  const modules = [
    {
      id: 'innm1',
      name: 'Printing Report',
      description: 'Offset printing production tracking',
      path: '/BieuDo/Nhamay1/Baocaoin.html', 
      icon: 'fas fa-print'
    },
    {
      id: 'gmcnm1',
      name: 'GMC Report',
      description: 'GMC paper cutting tracking',
      path: '/BieuDo/Nhamay1/Baocaogmc.html',
      icon: 'fas fa-cut'
    }
  ];
  
  modules.forEach(module => {
    db.run(`INSERT IGNORE INTO modules (id, system_id, name, description, path, icon)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [module.id, 'sanxuat-nm1', module.name, module.description, module.path, module.icon],
      (err) => {
        if (err) {
          console.error(`❌ Error creating module ${module.name}:`, err.message);
        } else {
          console.log(`✅ Created Plant 1 module: ${module.name}`);
        }
      }
    );
  });
}

// Create default permissions
function createDefaultPermissions() {
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
  
  defaultPermissions.forEach(perm => {
    const permId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    db.run(`INSERT IGNORE INTO page_permissions (id, department, page_name, can_access) 
            VALUES (?, ?, ?, ?)`,
      [permId, perm.department, perm.page, perm.canAccess],
      (err) => {
        if (err && !err.message.includes('DUPLICATE')) {
          console.error(`❌ Error creating permission for ${perm.department}:`, err.message);
        }
      }
    );
  });
}

// Check and fix duplicate permissions
function checkAndFixDuplicatePermissions() {
  console.log('🔍 Checking for duplicate permissions...');
  
  db.all(`SELECT department, module_id, COUNT(*) as count
          FROM department_module_permissions
          GROUP BY department, module_id
          HAVING COUNT(*) > 1`, [], (err, duplicates) => {
    if (err) {
      console.error('❌ Error checking duplicate permissions:', err.message);
      return;
    }
    
    if (duplicates && duplicates.length > 0) {
      console.log(`🔧 Found ${duplicates.length} duplicate permissions, cleaning up...`);
      
      duplicates.forEach(dup => {
        db.all(`SELECT * FROM department_module_permissions
               WHERE department = ? AND module_id = ?
               ORDER BY created_at DESC`,
               [dup.department, dup.module_id], (err, rows) => {
          if (err || !rows || rows.length <= 1) return;
          
          const idsToDelete = rows.slice(1).map(r => r.id);
          const placeholders = idsToDelete.map(() => '?').join(',');
          
          db.run(`DELETE FROM department_module_permissions WHERE id IN (${placeholders})`, 
                idsToDelete, function(err) {
            if (err) {
              console.error('❌ Error deleting duplicate permissions:', err.message);
            } else {
              console.log(`✅ Deleted ${this.changes} duplicate permission records`);
            }
          });
        });
      });
    } else {
      console.log('✅ No duplicate permissions found');
    }
  });
}

// Check and fix duplicate systems
function checkAndFixDuplicateSystems() {
  console.log('🔍 Checking for duplicate systems...');
  
  db.all(`SELECT name, COUNT(*) as count FROM systems GROUP BY name HAVING COUNT(*) > 1`, [], (err, duplicates) => {
    if (err) {
      console.error('❌ Error checking duplicate systems:', err.message);
      return;
    }
    
    if (duplicates && duplicates.length > 0) {
      console.log(`🔧 Found ${duplicates.length} duplicate systems, cleaning up...`);
    } else {
      console.log('✅ No duplicate systems found');
    }
  });
}

// Check and fix duplicate departments
function checkAndFixDuplicateDepartments() {
  console.log('🔍 Checking for duplicate departments...');
  
  db.all(`SELECT name, COUNT(*) as count FROM departments GROUP BY name HAVING COUNT(*) > 1`, [], (err, duplicates) => {
    if (err) {
      console.error('❌ Error checking duplicate departments:', err.message);
      return;
    }
    
    if (duplicates && duplicates.length > 0) {
      console.log(`🔧 Found ${duplicates.length} duplicate departments, cleaning up...`);
    } else {
      console.log('✅ No duplicate departments found');
    }
  });
}

// Get next employee ID
function getNextEmployeeId(factory, callback) {
  const factoryCode = factory === 'Nhà máy 3' ? 'PVN' : 'VSP';
  const tableName = factoryCode === 'PVN' ? 'users_PVN' : 'users_VSP';
  
  db.all(`SELECT employee_id FROM ${tableName} WHERE role != 'admin' AND employee_id LIKE '${factoryCode}-%'`, [], (err, rows) => {
    if (err) {
      return callback(err, null);
    }
    
    let nextId = 1;
    
    if (rows && rows.length > 0) {
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
        nextId = Math.max(...validIds) + 1;
      }
    }
    
    const formattedId = `${factoryCode}-${nextId.toString().padStart(4, '0')}`;
    
    db.run(`UPDATE id_sequences SET last_id = ? WHERE factory = ?`, [nextId, factoryCode], (err) => {
      if (err) {
        console.error(`❌ Error updating sequence for ${factoryCode}:`, err.message);
      }
      
      callback(null, formattedId);
    });
  });
}

// Start database connection and initialization
connectAndInitDatabase().catch(error => {
  console.error('❌ Fatal database initialization error:', error);
  process.exit(1);
});

// Export database and utility functions
module.exports = {
  db,
  getNextEmployeeId
};