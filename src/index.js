console.log("🔥 THIS IS THE ACTIVE INDEX.JS");

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const dsaRoutes = require('./routes/dsaRoutes');
const projectRoutes = require('./routes/projectRoutes');
const careerRoutes = require('./routes/careerRoutes');

const app = express();

// 🔴 THESE TWO MUST COME BEFORE ROUTES
app.use(cors());
app.use(express.json());   // 👈 THIS WAS THE SILENT KILLER

// Connect DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/career', careerRoutes);

// Health check (IMPORTANT)
app.get('/ping', (req, res) => {
  res.send('SERVER ALIVE');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Blaezi Server running on ${PORT}`);
});
