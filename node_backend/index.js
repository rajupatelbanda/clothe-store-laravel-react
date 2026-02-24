const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection Middleware
app.use(async (req, res, next) => {
  // Only connect if we're hitting an API route
  // Or if it's the health check after it's passed the initial stage
  if (req.path.startsWith('/api') || req.path === '/') {
    await connectDB();
  }
  next();
});

// Health check (Fastest possible response)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    uptime: process.uptime(),
    node_env: process.env.NODE_ENV,
    is_vercel: !!process.env.VERCEL,
    static_path_served_from: process.env.VERCEL ? '/tmp/uploads' : 'uploads'
  });
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
app.use('/api/razorpay', razorpayRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', systemRoutes);

// Error Handling
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 8000;
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}

module.exports = app;
