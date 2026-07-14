require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();

// Middleware
const allowedOrigins = [
  'https://credit-frontend-khaki.vercel.app',
  'https://credit-frontend-jhtf.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

const seedAdminUser = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@eventhub.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

    let adminUser = await User.findOne({ email: adminEmail });
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (!adminUser) {
      adminUser = new User({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        secondaryRoles: [],
      });
      await adminUser.save();
    } else {
      adminUser.role = 'admin';
      adminUser.status = 'active';
      adminUser.password = hashedPassword;
      await adminUser.save();
    }

    console.log(`Admin account ready: ${adminEmail}`);
  } catch (error) {
    console.error('Admin seed error:', error.message || error);
  }
};

// Database Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventhub';
console.log('Connecting to MongoDB:', mongoURI);

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
  .then(async () => {
    console.log('MongoDB connected');
    await seedAdminUser();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB error:', err.message || err);
    console.error('Make sure MongoDB is installed and running on port 27017, or set MONGODB_URI in backend/.env');
    process.exit(1);
  });


  // Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EventHub Backend API is running 🚀"
  });
});
// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/businesses', require('./routes/businessRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});
