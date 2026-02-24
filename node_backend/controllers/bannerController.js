const asyncHandler = require('express-async-handler');
const Banner = require('../models/Banner');

// @desc    Fetch all banners
// @route   GET /api/banners
// @access  Public
const getBanners = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page_num) || Number(req.query.page) || 1;

  const query = { is_active: true };
  
  // If admin, show all
  if (req.query.admin) {
    delete query.is_active;
  }

  // Handle page-specific filtering correctly
  if (req.query.page && req.query.page !== 'undefined' && !req.query.admin) {
    query.page = req.query.page;
  }

  const count = await Banner.countDocuments(query);
  const banners = await Banner.find(query)
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  const mappedBanners = banners.map(b => {
    const obj = b.toObject();
    return {
      ...obj,
      id: b._id,
      status: obj.is_active,
    };
  });

  if (req.query.admin) {
      res.json({
        data: mappedBanners,
        current_page: page,
        last_page: Math.ceil(count / pageSize),
        total: count
      });
  } else {
      res.json(mappedBanners);
  }
});

// @desc    Create a banner
// @route   POST /api/admin/banners
// @access  Private/Admin
const createBanner = asyncHandler(async (req, res) => {
  const { title, url, page, status } = req.body;
  let image = req.file ? req.file.path.replace(/\\/g, '/') : req.body.image;

  if (image && image.startsWith('/tmp/')) {
    image = image.substring(1);
  }

  const banner = await Banner.create({
    title,
    image,
    url,
    page,
    is_active: status === '1' || status === true || status === 'true',
  });

  res.status(201).json(banner);
});

// @desc    Update a banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
const updateBanner = asyncHandler(async (req, res) => {
  const { title, url, page, is_active, status } = req.body;
  let image = req.file ? req.file.path.replace(/\\/g, '/') : req.body.image;

  if (image && image.startsWith('/tmp/')) {
    image = image.substring(1);
  }

  const banner = await Banner.findById(req.params.id);

  if (banner) {
    banner.title = title || banner.title;
    banner.image = image || banner.image;
    banner.url = url || banner.url;
    banner.page = page || banner.page;
    
    if (status !== undefined) {
      banner.is_active = status === '1' || status === true || status === 'true';
    } else if (is_active !== undefined) {
      banner.is_active = is_active === '1' || is_active === true || is_active === 'true';
    }

    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } else {
    res.status(404);
    throw new Error('Banner not found');
  }
});

// @desc    Delete a banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (banner) {
    await banner.deleteOne();
    res.json({ message: 'Banner removed' });
  } else {
    res.status(404);
    throw new Error('Banner not found');
  }
});

module.exports = {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
