const asyncHandler = require('express-async-handler');
const Setting = require('../models/Setting');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.findOne({});
  if (settings) {
    res.json({
      ...settings._doc,
      id: settings._id,
    });
  } else {
    res.json({});
  }
});

// @desc    Update site settings
// @route   POST /api/admin/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const {
    site_name,
    email,
    phone,
    address,
    site_email,
    site_phone,
    site_address,
    footer_text,
    shipping_charge,
    tax,
    social_links: bodySocialLinks,
  } = req.body;

  // Handle files
  let logo = req.body.logo;
  let favicon = req.body.favicon;

  if (req.files) {
    if (req.files.logo && req.files.logo[0]) {
      logo = req.files.logo[0].path;
    }
    if (req.files.favicon && req.files.favicon[0]) {
      favicon = req.files.favicon[0].path;
    }
  }

  // Handle social links from FormData
  let social_links = bodySocialLinks;
  if (!social_links && (req.body['social_links[facebook]'] || req.body['social_links[twitter]'] || req.body['social_links[instagram]'])) {
    social_links = {
      facebook: req.body['social_links[facebook]'] || '',
      twitter: req.body['social_links[twitter]'] || '',
      instagram: req.body['social_links[instagram]'] || '',
    };
  }

  let settings = await Setting.findOne({});

  const updateData = {
    site_name: site_name || (settings ? settings.site_name : ''),
    site_email: email || site_email || (settings ? settings.site_email : ''),
    site_phone: phone || site_phone || (settings ? settings.site_phone : ''),
    site_address: address || site_address || (settings ? settings.site_address : ''),
    logo: logo || (settings ? settings.logo : ''),
    favicon: favicon || (settings ? settings.favicon : ''),
    footer_text: footer_text || (settings ? settings.footer_text : ''),
    shipping_charge: shipping_charge || (settings ? settings.shipping_charge : 0),
    tax: tax || (settings ? settings.tax : 0),
    social_links: social_links || (settings ? settings.social_links : {}),
  };

  if (settings) {
    Object.assign(settings, updateData);
    const updatedSettings = await settings.save();
    res.json({
      ...updatedSettings._doc,
      id: updatedSettings._id,
    });
  } else {
    settings = await Setting.create(updateData);
    res.status(201).json({
      ...settings._doc,
      id: settings._id,
    });
  }
});

module.exports = {
  getSettings,
  updateSettings,
};
