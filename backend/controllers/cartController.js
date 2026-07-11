import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'cart.product',
    select: 'title price images stock brand category'
  });

  if (user) {
    res.json(user.cart);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Sync client cart with database
// @route   POST /api/cart/sync
// @access  Private
export const syncCart = asyncHandler(async (req, res) => {
  const { cartItems } = req.body; // Array of { product: productId, quantity: number }

  if (!Array.isArray(cartItems)) {
    res.status(400);
    throw new Error('Invalid cart data format');
  }

  const user = await User.findById(req.user._id);

  if (user) {
    // Map items to database format
    user.cart = cartItems.map(item => ({
      product: item.product,
      quantity: item.quantity
    }));

    await user.save();

    // Populate and return updated cart
    const populatedUser = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'title price images stock brand category'
    });

    res.json(populatedUser.cart);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Clear user's cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.cart = [];
    await user.save();
    res.json({ message: 'Cart cleared successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
