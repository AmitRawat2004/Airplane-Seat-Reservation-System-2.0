const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Database connection
const db = require('./config/database');
db.connectMongo();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/flights', require('./routes/flights'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/seats', require('./routes/seats'));
app.use('/api/airports', require('./routes/airports'));
app.use('/api/real-time', require('./routes/realTime'));
app.use('/api/ai', require('./routes/ai'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join flight room for real-time updates
  socket.on('join-flight', (flightId) => {
    socket.join(`flight-${flightId}`);
    console.log(`Client ${socket.id} joined flight ${flightId}`);
  });

  // Handle seat selection updates
  socket.on('seat-selected', (data) => {
    socket.to(`flight-${data.flightId}`).emit('seat-updated', {
      seatId: data.seatId,
      status: 'selected',
      timestamp: new Date().toISOString()
    });
  });

  // Handle seat deselection
  socket.on('seat-deselected', (data) => {
    socket.to(`flight-${data.flightId}`).emit('seat-updated', {
      seatId: data.seatId,
      status: 'available',
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Real-time flight data updates
const updateFlightData = async () => {
  try {
    // Fetch real-time flight data from external APIs
    const flightData = await require('./services/flightDataService').getRealTimeFlights();
    
    // Emit updates to connected clients
    io.emit('flight-updates', {
      flights: flightData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating flight data:', error);
  }
};

// Update flight data every 5 minutes
setInterval(updateFlightData, 5 * 60 * 1000);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 Socket.IO server ready`);
});

module.exports = app;
