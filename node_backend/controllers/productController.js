const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const slugify = require('slugify');

const mongoose = require('mongoose');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  let query = {};

  // Search
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
  }

  // Categories Filter (multi-select or single)
  const categoriesParam = req.query.categories || req.query.category;
  if (categoriesParam) {
    const categoryIds = categoriesParam.split(',');
    query.category = { $in: categoryIds };
  }

  // Brands Filter (multi-select)
  if (req.query.brands) {
    const brandIds = req.query.brands.split(',');
    query.brand = { $in: brandIds };
  }

  // Price Max
  if (req.query.price_max) {
    query.price = { $lte: Number(req.query.price_max) };
  }

  // Sorting
  let sort = { createdAt: -1 };
  if (req.query.sort === 'price-low') sort = { price: 1 };
  if (req.query.sort === 'price-high') sort = { price: -1 };
  if (req.query.sort === 'a-z') sort = { name: 1 };

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category brand subcategory')
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  const mappedProducts = products.map(p => ({
    ...p._doc,
    id: p._id,
    category_id: p.category ? p.category._id : null,
    brand_id: p.brand ? p.brand._id : null,
    category: p.category ? { ...p.category._doc, id: p.category._id } : null,
    brand: p.brand ? { ...p.brand._doc, id: p.brand._id } : null,
  }));

  // Match Laravel Pagination Structure
  res.json({
    data: mappedProducts,
    current_page: page,
    last_page: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  let product;
  
  // If it's a valid ObjectId, try finding by ID
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    product = await Product.findById(req.params.id)
      .populate('category brand subcategory')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name' }
      });
  }

  // If not found by ID or not a valid ID, try finding by slug
  if (!product) {
    product = await Product.findOne({ slug: req.params.id })
      .populate('category brand subcategory')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name' }
      });
  }

  if (product) {
    const mappedProduct = {
        ...product._doc,
        id: product._id,
        category_id: product.category ? product.category._id : null,
        brand_id: product.brand ? product.brand._id : null,
        category: product.category ? { ...product.category._doc, id: product.category._id } : null,
        brand: product.brand ? { ...product.brand._doc, id: product.brand._id } : null,
        reviews: product.reviews || []
    };
    res.json(mappedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    brand_id,
    category_id,
    subcategory_id,
    stock,
    is_featured,
    is_trending,
    status,
    discount_price,
    variations
  } = req.body;

  // Handle Files
  let images = [];
  if (req.files && req.files['images[]']) {
    images = req.files['images[]'].map(file => file.path);
  }

  let video = '';
  if (req.files && req.files['video']) {
    video = req.files['video'][0].path;
  }

  const parsedVariations = variations ? JSON.parse(variations).map(v => ({
    ...v,
    price: Number(v.price),
    stock: Number(v.stock)
  })) : [];

  const product = new Product({
    name,
    slug: slugify(name, { lower: true }),
    description,
    price: Number(price),
    discount_price: discount_price ? Number(discount_price) : null,
    stock: Number(stock),
    category: category_id,
    subcategory: subcategory_id || null,
    brand: brand_id,
    images,
    video,
    is_featured: is_featured === '1' || is_featured === true,
    is_trending: is_trending === '1' || is_trending === true,
    status: status === '1' || status === true ? 'active' : 'draft',
    variations: parsedVariations,
    user: req.user._id,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    brand_id,
    category_id,
    subcategory_id,
    stock,
    is_featured,
    is_trending,
    status,
    discount_price,
    variations
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Handle Files
    if (req.files && req.files['images[]']) {
      const newImages = req.files['images[]'].map(file => file.path);
      product.images = newImages; 
    }

    if (req.files && req.files['video']) {
      let v = req.files['video'][0].path;
      product.video = v;
    }

    if (variations) {
      product.variations = JSON.parse(variations).map(v => ({
        ...v,
        price: Number(v.price),
        stock: Number(v.stock)
      }));
    }

    product.name = name || product.name;
    product.price = price !== undefined ? Number(price) : product.price;
    product.description = description || product.description;
    product.brand = brand_id || product.brand;
    product.category = category_id || product.category;
    product.subcategory = subcategory_id || product.subcategory;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.discount_price = discount_price !== undefined ? (discount_price ? Number(discount_price) : null) : product.discount_price;
    product.is_featured = is_featured !== undefined ? (is_featured === '1' || is_featured === true) : product.is_featured;
    product.is_trending = is_trending !== undefined ? (is_trending === '1' || is_trending === true) : product.is_trending;
    
    if (status !== undefined) {
        product.status = (status === '1' || status === true) ? 'active' : 'draft';
    }
    
    if (name) {
        product.slug = slugify(name, { lower: true });
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ is_featured: true }).limit(8).populate('category brand');
  const mappedProducts = products.map(p => ({
    ...p._doc,
    id: p._id,
    category: p.category ? { ...p.category._doc, id: p.category._id } : null,
    brand: p.brand ? { ...p.brand._doc, id: p.brand._id } : null,
  }));
  res.json(mappedProducts);
});

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
const getTrendingProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ is_trending: true }).limit(8).populate('category brand');
  const mappedProducts = products.map(p => ({
    ...p._doc,
    id: p._id,
    category: p.category ? { ...p.category._doc, id: p.category._id } : null,
    brand: p.brand ? { ...p.brand._doc, id: p.brand._id } : null,
  }));
  res.json(mappedProducts);
});

// @desc    Get low stock products
// @route   GET /api/admin/stock/low
// @access  Private/Admin
const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ stock: { $lt: 10 } }).populate('category brand');
  const mappedProducts = products.map(p => {
    const obj = p.toObject();
    return {
      ...obj,
      id: p._id,
      category: obj.category ? { ...obj.category, id: obj.category._id } : null,
      brand: obj.brand ? { ...obj.brand, id: obj.brand._id } : null,
    };
  });
  res.json(mappedProducts);
});

// @desc    Update product stock
// @route   PATCH /api/admin/products/:id/stock
// @access  Private/Admin
const updateStock = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  getFeaturedProducts,
  getTrendingProducts,
  getLowStockProducts,
  updateStock,
};
