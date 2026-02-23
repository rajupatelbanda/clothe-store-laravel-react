const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const slugify = require('slugify');

const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Brand = require('./models/Brand');
const Banner = require('./models/Banner');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Banner.deleteMany();

    console.log('Database Cleared!');

    // 2. Create One Admin and One User
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password',
      role: 'admin',
      phone: faker.phone.number(),
    });

    await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password',
      role: 'user',
      phone: faker.phone.number(),
    });

    console.log('Users Created!');

    // 3. Create 10 Categories
    const categories = [];
    for (let i = 0; i < 10; i++) {
      const name = faker.commerce.department();
      const category = await Category.create({
        name: `${name} ${i}`,
        slug: slugify(`${name} ${i}`, { lower: true }),
        image: `https://picsum.photos/seed/${faker.string.uuid()}/300/300`,
      });
      categories.push(category);
    }
    console.log('10 Categories Created!');

    // 4. Create 10 Brands
    const brands = [];
    for (let i = 0; i < 10; i++) {
      const name = faker.company.name();
      const brand = await Brand.create({
        name: `${name} ${i}`,
        slug: slugify(`${name} ${i}`, { lower: true }),
        image: `https://picsum.photos/seed/${faker.string.uuid()}/300/300`,
      });
      brands.push(brand);
    }
    console.log('10 Brands Created!');

    // 5. Create 5 Banners
    const banners = [
      {
        title: 'Huge Summer Sale - Up to 50% Off!',
        image: 'https://picsum.photos/seed/banner1/1920/600',
        url: '/shop',
        page: 'home',
        is_active: true,
      },
      {
        title: 'New Collection Arrivals',
        image: 'https://picsum.photos/seed/banner2/1920/600',
        url: '/shop',
        page: 'home',
        is_active: true,
      },
      {
        title: 'Premium Gadgets & Electronics',
        image: 'https://picsum.photos/seed/banner3/1920/600',
        url: '/shop',
        page: 'home',
        is_active: true,
      },
      {
        title: 'Fashion Forward Styles',
        image: 'https://picsum.photos/seed/banner4/1920/600',
        url: '/shop',
        page: 'home',
        is_active: true,
      },
      {
        title: 'Exclusive Weekend Deals',
        image: 'https://picsum.photos/seed/banner5/1920/600',
        url: '/shop',
        page: 'home',
        is_active: true,
      }
    ];
    await Banner.insertMany(banners);
    console.log('5 Banners Created!');

    // 6. Create 200 Products with Variations & Video
    const products = [];
    const sizes = ['S', 'M', 'L', 'XL'];
    const commonColors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Navy'];
    // Sample Video URL
    const sampleVideo = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    for (let i = 0; i < 200; i++) {
      const name = faker.commerce.productName();
      const basePrice = parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
      const discountPercentage = faker.number.int({ min: 0, max: 50 });
      const discountPrice = discountPercentage > 0 ? (basePrice - (basePrice * discountPercentage) / 100).toFixed(2) : null;

      const productVariations = [];
      const productColors = faker.helpers.arrayElements(commonColors, 2);
      const productSizes = faker.helpers.arrayElements(sizes, 2);

      productColors.forEach(color => {
        productSizes.forEach(size => {
          productVariations.push({
            color: color,
            size: size,
            price: (basePrice + faker.number.int({ min: -5, max: 20 })).toFixed(2),
            stock: faker.number.int({ min: 5, max: 50 })
          });
        });
      });

      const product = {
        name: `${name} ${i}`,
        slug: slugify(`${name} ${i}`, { lower: true }),
        description: faker.commerce.productDescription(),
        price: basePrice,
        discount_price: discountPrice,
        discount_percentage: discountPercentage > 0 ? discountPercentage : null,
        stock: faker.number.int({ min: 10, max: 100 }),
        category: categories[Math.floor(Math.random() * categories.length)]._id,
        brand: brands[Math.floor(Math.random() * brands.length)]._id,
        colors: productColors,
        sizes: productSizes,
        images: [
          `https://picsum.photos/seed/${faker.string.uuid()}/600/800`,
          `https://picsum.photos/seed/${faker.string.uuid()}/600/800`,
        ],
        video: sampleVideo, // Added Video URL
        is_featured: faker.datatype.boolean(),
        is_trending: faker.datatype.boolean(),
        status: 'active',
        variations: productVariations
      };
      products.push(product);
    }

    await Product.insertMany(products);
    console.log('200 Products with Variations & Videos Created!');

    console.log('Data Successfully Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Banner.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error with data destruction: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
