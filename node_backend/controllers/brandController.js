const asyncHandler = require('express-async-handler');
const Brand = require('../models/Brand');
const slugify = require('slugify');

// @desc    Fetch all brands
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({});
  const mappedBrands = brands.map(brand => ({
    ...brand._doc,
    id: brand._id,
  }));
  res.json(mappedBrands);
});

// @desc    Create a brand
// @route   POST /api/admin/brands
// @access  Private/Admin
const createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  let image = req.file ? req.file.path.replace(/\\/g, '/') : req.body.image;

  if (image && image.startsWith('/tmp/')) {
    image = image.substring(1);
  }

  const brand = await Brand.create({
    name,
    slug: slugify(name, { lower: true }),
    image,
  });

  res.status(201).json(brand);
});

// @desc    Update a brand
// @route   PUT /api/admin/brands/:id
// @access  Private/Admin
const updateBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  let image = req.file ? req.file.path.replace(/\\/g, '/') : req.body.image;

  if (image && image.startsWith('/tmp/')) {
    image = image.substring(1);
  }

  const brand = await Brand.findById(req.params.id);

  if (brand) {
    brand.name = name || brand.name;
    brand.image = image || brand.image;
    if (name) {
      brand.slug = slugify(name, { lower: true });
    }

    const updatedBrand = await brand.save();
    res.json(updatedBrand);
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});

// @desc    Delete a brand
// @route   DELETE /api/admin/brands/:id
// @access  Private/Admin
const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (brand) {
    await brand.deleteOne();
    res.json({ message: 'Brand removed' });
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});

module.exports = {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
};
