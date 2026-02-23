const asyncHandler = require('express-async-handler');
const Setting = require('../models/Setting');

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.findOne({});
  res.json(settings);
});

// @desc    Update site settings
// @route   POST /api/admin/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const {
    site_name,
    site_email,
    site_phone,
    site_address,
    logo,
    favicon,
    footer_text,
    shipping_charge,
    tax,
    social_links,
  } = req.body;

  let settings = await Setting.findOne({});

  if (settings) {
    settings.site_name = site_name || settings.site_name;
    settings.site_email = site_email || settings.site_email;
    settings.site_phone = site_phone || settings.site_phone;
    settings.site_address = site_address || settings.site_address;
    settings.logo = logo || settings.logo;
    settings.favicon = favicon || settings.favicon;
    settings.footer_text = footer_text || settings.footer_text;
    settings.shipping_charge = shipping_charge || settings.shipping_charge;
    settings.tax = tax || settings.tax;
    settings.social_links = social_links || settings.social_links;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } else {
    settings = await Setting.create({
      site_name,
      site_email,
      site_phone,
      site_address,
      logo,
      favicon,
      footer_text,
      shipping_charge,
      tax,
      social_links,
    });
    res.status(201).json(settings);
  }
});

module.exports = {
  getSettings,
  updateSettings,
};
