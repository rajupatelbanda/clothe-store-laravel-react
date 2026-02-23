const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getTrendingProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  getLowStockProducts,
  updateStock,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/products', getProducts);
router.get('/products/featured', getFeaturedProducts);
router.get('/products/trending', getTrendingProducts);
router.get('/products/:id', getProductById);

// Admin routes
router.get('/admin/products', protect, admin, getProducts);
router.get('/admin/stock/low', protect, admin, getLowStockProducts);
router.patch('/admin/products/:id/stock', protect, admin, updateStock);
router.post('/admin/products', protect, admin, createProduct);
router.put('/admin/products/:id', protect, admin, updateProduct);
router.post('/admin/products/:id', protect, admin, updateProduct);
router.delete('/admin/products/:id', protect, admin, deleteProduct);

module.exports = router;
