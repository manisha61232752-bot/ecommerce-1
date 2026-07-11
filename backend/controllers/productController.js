import Product from '../models/Product.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper to generate custom slug from title
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

// @desc    Fetch all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 8;
  const page = Number(req.query.page) || 1;

  // Search keyword (matches title or brand or description)
  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } }
        ]
      }
    : {};

  // Category filter
  let categoryFilter = {};
  if (req.query.category) {
    // Check if category is slug or objectId
    const foundCategory = await Category.findOne({
      $or: [
        { slug: req.query.category },
        { name: req.query.category }
      ]
    });
    if (foundCategory) {
      categoryFilter = { category: foundCategory._id };
    }
  }

  // Price range filters
  let priceFilter = {};
  if (req.query.minPrice || req.query.maxPrice) {
    priceFilter.price = {};
    if (req.query.minPrice) priceFilter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) priceFilter.price.$lte = Number(req.query.maxPrice);
  }

  // Rating filter
  let ratingFilter = {};
  if (req.query.rating) {
    ratingFilter.rating = { $gte: Number(req.query.rating) };
  }

  // Combine query conditions
  const query = {
    ...keyword,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter
  };

  // Sorting definitions
  let sortOption = {};
  if (req.query.sortBy) {
    if (req.query.sortBy === 'price-low') {
      sortOption = { price: 1 };
    } else if (req.query.sortBy === 'price-high') {
      sortOption = { price: -1 };
    } else if (req.query.sortBy === 'rating') {
      sortOption = { rating: -1 };
    } else if (req.query.sortBy === 'newest') {
      sortOption = { createdAt: -1 };
    }
  } else {
    sortOption = { createdAt: -1 }; // default sorting
  }

  // Count total matches
  const count = await Product.countDocuments(query);
  
  // Find products page list
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');

  if (product) {
    // Also fetch related products (same category, excluding current product)
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id }
    })
      .limit(4)
      .populate('category', 'name slug');

    res.json({ product, relatedProducts });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    price,
    description,
    images,
    category,
    brand,
    stock,
    isFeatured,
    isTrending,
    isNewArrival
  } = req.body;

  const product = new Product({
    title,
    slug: slugify(title) + '-' + Date.now().toString().slice(-4),
    price,
    description,
    images: images || ['/uploads/sample-placeholder.jpg'],
    category,
    brand,
    stock,
    isFeatured: !!isFeatured,
    isTrending: !!isTrending,
    isNewArrival: !!isNewArrival
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);

  // Broadcast a NewProduct notification to all users
  try {
    const allUsers = await User.find({});
    const notificationDocs = allUsers.map(u => ({
      user: u._id,
      title: 'New Product Arrival!',
      message: `New addition: ${createdProduct.title} by ${createdProduct.brand} is now available in catalog!`,
      type: 'NewProduct'
    }));
    await Notification.insertMany(notificationDocs);
  } catch (err) {
    console.error('Failed to trigger new product notification:', err);
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const {
    title,
    price,
    description,
    images,
    category,
    brand,
    stock,
    isFeatured,
    isTrending,
    isNewArrival
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.title = title || product.title;
    if (title) {
      product.slug = slugify(title) + '-' + product._id.toString().slice(-4);
    }
    product.price = price !== undefined ? price : product.price;
    product.description = description || product.description;
    product.images = images || product.images;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.stock = stock !== undefined ? stock : product.stock;
    product.isFeatured = isFeatured !== undefined ? !!isFeatured : product.isFeatured;
    product.isTrending = isTrending !== undefined ? !!isTrending : product.isTrending;
    product.isNewArrival = isNewArrival !== undefined ? !!isNewArrival : product.isNewArrival;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id
    };

    product.reviews.push(review);
    product.calculateRating();

    await product.save();
    res.status(201).json({ message: 'Review added successfully' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get search suggestions for auto-complete
// @route   GET /api/products/suggestions
// @access  Public
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        title: {
          $regex: req.query.keyword,
          $options: 'i'
        }
      }
    : {};

  const products = await Product.find({ ...keyword })
    .select('title _id')
    .limit(10);

  res.json(products);
});
