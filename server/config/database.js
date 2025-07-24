const path = require('path');

const environments = {
  production: {
    database: path.join(__dirname, '..', '..', 'database', 'phieu.db'), // Giữ nguyên database chính
    port: 8686,
    logLevel: 'error'
  },
  development: {
    database: path.join(__dirname, '..', '..', 'database', 'dev.db'), // Database riêng cho dev
    port: 8687,
    logLevel: 'debug'
  }
};

const currentEnv = process.env.NODE_ENV || 'development';
const config = environments[currentEnv];

console.log(`🌍 Environment: ${currentEnv}`);
console.log(`📊 Database: ${config.database}`);
console.log(`🚀 Port: ${config.port}`);

module.exports = config;