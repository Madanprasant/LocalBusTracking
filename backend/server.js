const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/buses');
const favoriteRoutes = require('./routes/favorites');

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

// Store active WebSocket connections
const activeConnections = new Map();

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const busId = req.url.split('/').pop();
  console.log(`New WebSocket connection for bus ${busId}`);
  
  if (!activeConnections.has(busId)) {
    activeConnections.set(busId, new Set());
  }
  activeConnections.get(busId).add(ws);

  ws.on('close', () => {
    if (activeConnections.has(busId)) {
      activeConnections.get(busId).delete(ws);
      if (activeConnections.get(busId).size === 0) {
        activeConnections.delete(busId);
      }
    }
  });
});

// Make WebSocket server available to routes
app.set('wss', wss);
app.set('activeConnections', activeConnections);

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000'  // Keep existing for compatibility
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'If-Modified-Since',
    'Expires',
    'Last-Modified'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Cache-Control',
    'Last-Modified'
  ],
  credentials: true,
  maxAge: 600,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/favorites', favoriteRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Erode Bus Tracker API is running!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erode-bus-tracker')
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;


