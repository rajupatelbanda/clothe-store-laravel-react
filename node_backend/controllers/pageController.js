const asyncHandler = require('express-async-handler');
const Page = require('../models/Page');
const slugify = require('slugify');

// @desc    Fetch all pages
// @route   GET /api/pages
// @access  Public
const getPages = asyncHandler(async (req, res) => {
  const pages = await Page.find({ is_active: true });
  res.json(pages);
});

// @desc    Fetch single page
// @route   GET /api/pages/:slug
// @access  Public
const getPageBySlug = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug, is_active: true });

  if (page) {
    res.json(page);
  } else {
    res.status(404);
    throw new Error('Page not found');
  }
});

// @desc    Create a page
// @route   POST /api/admin/pages
// @access  Private/Admin
const createPage = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const page = await Page.create({
    title,
    slug: slugify(title, { lower: true }),
    content,
  });

  res.status(201).json(page);
});

// @desc    Update a page
// @route   PUT /api/admin/pages/:id
// @access  Private/Admin
const updatePage = asyncHandler(async (req, res) => {
  const { title, content, is_active } = req.body;

  const page = await Page.findById(req.params.id);

  if (page) {
    page.title = title || page.title;
    page.content = content || page.content;
    page.is_active = is_active !== undefined ? is_active : page.is_active;
    if (title) {
      page.slug = slugify(title, { lower: true });
    }

    const updatedPage = await page.save();
    res.json(updatedPage);
  } else {
    res.status(404);
    throw new Error('Page not found');
  }
});

// @desc    Delete a page
// @route   DELETE /api/admin/pages/:id
// @access  Private/Admin
const deletePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);

  if (page) {
    await page.deleteOne();
    res.json({ message: 'Page removed' });
  } else {
    res.status(404);
    throw new Error('Page not found');
  }
});

module.exports = {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
};
