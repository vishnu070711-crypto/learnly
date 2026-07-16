const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { seedDemoData } = require('./utils/seed');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const materialRoutes = require('./routes/materialRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const userRoutes = require('./routes/userRoutes');

// Ensure upload directories exist
['videos', 'pdfs', 'ppts', 'avatars'].forEach((dir) => {
  fs.mkdirSync(path.join(__dirname, 'uploads', dir), { recursive: true });
});

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow media/pdf embedding from a different origin (frontend dev server)
  })
);
// Allow CORS from configured client origin(s).
// `CLIENT_URL` can be a single origin or comma-separated origins (useful for Vercel).
// If not provided, reflect the request origin (useful in staging or quick deployments).
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : true;
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static file serving for uploaded materials
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Learnly API is running',
    endpoints: ['/api/health'],
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    if (process.env.VERCEL !== '1') {
      await seedDemoData();
    }

    if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
