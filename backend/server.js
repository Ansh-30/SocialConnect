require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();


// ─────────────────────────────────────────────────────────────
// CORS Configuration
// ─────────────────────────────────────────────────────────────

const allowedOrigins = [
  'http://localhost:5173',
  'https://social-connect-woad.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {

      // Allow requests with no origin
      // (mobile apps, postman, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },

    credentials: true,
  })
);


// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);


// ─────────────────────────────────────────────────────────────
// Static Uploads
// ─────────────────────────────────────────────────────────────

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);


// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────

app.use('/api/auth', require('./routes/auth'));

app.use('/api/users', require('./routes/users'));

app.use('/api/posts', require('./routes/posts'));

app.use('/api/search', require('./routes/search'));

app.use('/api/admin', require('./routes/admin'));


// ─────────────────────────────────────────────────────────────
// Health Check Route
// ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'Server is running 🚀',
    time: new Date(),
  });
});


// ─────────────────────────────────────────────────────────────
// Root Route
// ─────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.send('SocioConnect Backend API Running 🚀');
});


// ─────────────────────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {

  console.error('❌ ERROR:', err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});


// ─────────────────────────────────────────────────────────────
// Database Connection & Server Start
// ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log('✅ MongoDB Connected');

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT}`
      );
    });
  })
  .catch((err) => {

    console.error(
      '❌ MongoDB Connection Error:',
      err.message
    );

    process.exit(1);
  });