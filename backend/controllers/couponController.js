import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.status(400);
    throw new Error('Coupon code is required');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  if (!coupon.active) {
    res.status(400);
    throw new Error('This coupon is no longer active');
  }

  if (coupon.isExpired()) {
    res.status(400);
    throw new Error('This coupon has expired');
  }

  res.json({
    code: coupon.code,
    discountPercentage: coupon.discountPercentage
  });
});

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
});

// @desc    Create a coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercentage, expirationDate, active } = req.body;

  const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

  if (couponExists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = new Coupon({
    code: code.toUpperCase(),
    discountPercentage,
    expirationDate,
    active: active !== undefined ? active : true
  });

  const createdCoupon = await coupon.save();
  res.status(201).json(createdCoupon);

  // Broadcast Promo notification to all users
  try {
    const allUsers = await User.find({});
    const notificationDocs = allUsers.map(u => ({
      user: u._id,
      title: 'New Discount Offer!',
      message: `Use code ${createdCoupon.code} to get ${createdCoupon.discountPercentage}% discount on your next order!`,
      type: 'Promo'
    }));
    await Notification.insertMany(notificationDocs);
  } catch (err) {
    console.error('Failed to trigger coupon promo notification:', err);
  }
});

// @desc    Update a coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercentage, expirationDate, active } = req.body;

  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    coupon.code = code ? code.toUpperCase() : coupon.code;
    coupon.discountPercentage = discountPercentage !== undefined ? discountPercentage : coupon.discountPercentage;
    coupon.expirationDate = expirationDate || coupon.expirationDate;
    coupon.active = active !== undefined ? active : coupon.active;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Delete a coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await Coupon.deleteOne({ _id: coupon._id });
    res.json({ message: 'Coupon deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});
