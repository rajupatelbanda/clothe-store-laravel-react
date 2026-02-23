const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static Folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/storage', express.static(path.join(__dirname, 'uploads'))); // Also serve from /storage for compatibility with frontend

// Root Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const pageRoutes = require('./routes/pageRoutes');
const settingRoutes = require('./routes/settingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const razorpayRoutes = require('./routes/razorpayRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const systemRoutes = require('./routes/systemRoutes');

// Use Routes
app.use('/api/upload', uploadRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', systemRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', subcategoryRoutes);
app.use('/api', brandRoutes);
app.use('/api', orderRoutes);
app.use('/api', wishlistRoutes);
app.use('/api', bannerRoutes);
app.use('/api', pageRoutes);
app.use('/api', settingRoutes);
app.use('/api', reviewRoutes);
app.use('/api', couponRoutes);
app.use('/api', razorpayRoutes);

const fs = require('fs');

// Error Handling
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${statusCode}: ${err.message}\n${err.stack}\n\n`;
  fs.appendFileSync(path.join(__dirname, 'logs/system.log'), logMessage);

  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
