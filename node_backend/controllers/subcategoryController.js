const asyncHandler = require('express-async-handler');
const Subcategory = require('../models/Subcategory');
const slugify = require('slugify');

// @desc    Fetch all subcategories
// @route   GET /api/subcategories
// @access  Public
const getSubcategories = asyncHandler(async (req, res) => {
  const subcategories = await Subcategory.find({}).populate('category');
  res.json(subcategories);
});

// @desc    Create a subcategory
// @route   POST /api/admin/subcategories
// @access  Private/Admin
const createSubcategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const categoryId = req.body.category || req.body.category_id;

  if (!categoryId) {
    res.status(400);
    throw new Error('Category ID is required');
  }

  const subcategory = await Subcategory.create({
    name,
    slug: slugify(name, { lower: true }),
    category: categoryId,
  });

  res.status(201).json(subcategory);
});

// @desc    Delete a subcategory
// @route   DELETE /api/admin/subcategories/:id
// @access  Private/Admin
const deleteSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findById(req.params.id);

  if (subcategory) {
    await subcategory.deleteOne();
    res.json({ message: 'Subcategory removed' });
  } else {
    res.status(404);
    throw new Error('Subcategory not found');
  }
});

module.exports = {
  getSubcategories,
  createSubcategory,
  deleteSubcategory,
};
