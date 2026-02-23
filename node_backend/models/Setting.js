const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  site_name: {
    type: String,
    required: true,
  },
  site_email: {
    type: String,
  },
  site_phone: {
    type: String,
  },
  site_address: {
    type: String,
  },
  logo: {
    type: String,
  },
  favicon: {
    type: String,
  },
  footer_text: {
    type: String,
  },
  shipping_charge: {
    type: Number,
    default: 0.0,
  },
  tax: {
    type: Number,
    default: 0.0,
  },
  social_links: {
    facebook: String,
    twitter: String,
    instagram: String,
    youtube: String,
  },
}, {
  timestamps: true,
});

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
