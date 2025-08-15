const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Get all BTD1_PO_Event records
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Fetching BTD1_PO_Event data from SQL Server...');
    
    const query = `
      SELECT 
        UID,
        WS,
        Datetime,
        Event
      FROM BTD1_PO_Event 
      ORDER BY Datetime DESC
    `;
    
    const events = await db.querySqlServer(query);
    
    res.json({
      success: true,
      data: events,
      count: events.length,
      source: 'SQL Server - BTD1_PO_Event'
    });
    
  } catch (error) {
    console.error('❌ Error fetching BTD1_PO_Event:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Get BTD1_PO_Event by WS number
router.get('/ws/:wsNumber', async (req, res) => {
  try {
    const { wsNumber } = req.params;
    console.log(`🔍 Fetching BTD1_PO_Event for WS: ${wsNumber}`);
    
    const query = `
      SELECT 
        UID,
        WS,
        Datetime,
        Event
      FROM BTD1_PO_Event 
      WHERE WS = @param0
      ORDER BY Datetime DESC
    `;
    
    const events = await db.querySqlServer(query, [wsNumber]);
    
    res.json({
      success: true,
      data: events,
      count: events.length,
      wsNumber: wsNumber,
      source: 'SQL Server - BTD1_PO_Event'
    });
    
  } catch (error) {
    console.error(`❌ Error fetching BTD1_PO_Event for WS ${req.params.wsNumber}:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Get BTD1_PO_Event by date range
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate are required'
      });
    }
    
    console.log(`🔍 Fetching BTD1_PO_Event from ${startDate} to ${endDate}`);
    
    const query = `
      SELECT 
        UID,
        WS,
        Datetime,
        Event
      FROM BTD1_PO_Event 
      WHERE Datetime >= @param0 AND Datetime <= @param1
      ORDER BY Datetime DESC
    `;
    
    const events = await db.querySqlServer(query, [startDate, endDate]);
    
    res.json({
      success: true,
      data: events,
      count: events.length,
      dateRange: { startDate, endDate },
      source: 'SQL Server - BTD1_PO_Event'
    });
    
  } catch (error) {
    console.error('❌ Error fetching BTD1_PO_Event by date range:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Get BTD1_PO_Event statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Fetching BTD1_PO_Event statistics...');
    
    const query = `
      SELECT 
        Event,
        COUNT(*) as Count,
        MIN(Datetime) as FirstEvent,
        MAX(Datetime) as LastEvent
      FROM BTD1_PO_Event 
      GROUP BY Event
      ORDER BY Count DESC
    `;
    
    const stats = await db.querySqlServer(query);
    
    res.json({
      success: true,
      data: stats,
      source: 'SQL Server - BTD1_PO_Event Stats'
    });
    
  } catch (error) {
    console.error('❌ Error fetching BTD1_PO_Event stats:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

module.exports = router;