const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Get reference data từ SQL Server
router.get('/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const cacheMinutes = req.query.cache || 30;
    
    const data = await db.getReferenceData(tableName, parseInt(cacheMinutes));
    
    res.json({
      success: true,
      data: data,
      source: 'SQL Server',
      cached: true
    });
  } catch (error) {
    console.error('Error fetching reference data:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Custom query cho SQL Server
router.post('/query', async (req, res) => {
  try {
    const { query, params = [] } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }
    
    const data = await db.querySqlServer(query, params);
    
    res.json({
      success: true,
      data: data,
      source: 'SQL Server'
    });
  } catch (error) {
    console.error('Error executing SQL Server query:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;