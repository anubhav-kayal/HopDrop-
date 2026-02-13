const express = require('express');
const cors = require('cors');
const fileRoutes = require('./routes/fileRoutes');
const analyticsRoutes = require('./routes/analytics');
const { authenticateAPIKey } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'HopDrop Retail Data Platform'
  });
});

// API Routes (with authentication)
app.use('/api/files', authenticateAPIKey, fileRoutes);
app.use('/api/analytics', authenticateAPIKey, analyticsRoutes);

// Data quality endpoint
app.get('/api/data-quality', authenticateAPIKey, async (req, res) => {
  try {
    const { getDataQualityMetrics } = require('./monitoring/data_quality');
    const days = parseInt(req.query.days) || 7;
    const metrics = await getDataQualityMetrics(days);
    res.json({ metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 HopDrop Retail Data Platform running on port ${PORT}`);
    console.log(`📊 Analytics API: http://localhost:${PORT}/api/analytics`);
    console.log(`📁 File Upload API: http://localhost:${PORT}/api/files`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
});