console.log("🔥 THIS IS THE ACTIVE INDEX.JS");

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const dsaRoutes = require('./routes/dsaRoutes');
const projectRoutes = require('./routes/projectRoutes');
const careerRoutes = require('./routes/careerRoutes');
const plannerRoutes = require('./routes/plannerRoutes');

const app = express();

// 🔴 THESE TWO MUST COME BEFORE ROUTES
app.use(cors({
  origin: '*', // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());   // 👈 THIS WAS THE SILENT KILLER

// Request logger - Log all incoming requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  if (req.headers.authorization) {
    console.log('   Auth: Bearer token present');
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Connect DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/planner', plannerRoutes);

// Health check (IMPORTANT)
app.get('/ping', (req, res) => {
  res.send('SERVER ALIVE');
});

// Serve static files from frontend build (if exists)
// Uncomment these lines if you have a frontend build folder
/*
const frontendPath = path.join(__dirname, '../frontend/build'); // adjust path as needed
app.use(express.static(frontendPath));

// Catch-all route to serve frontend's index.html for any non-API routes
app.get('*', (req, res) => {
  // Only serve index.html if it's not an API route
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({
      success: false,
      message: `API route not found: ${req.method} ${req.url}`,
      code: 'NOT_FOUND'
    });
  }
});
*/

// 404 handler - catch all undefined routes
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
    code: 'NOT_FOUND'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Blaezi Server running on ${PORT}`);
});
