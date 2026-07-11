import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'title price images stock brand category rating'
  });

  if (user) {
    res.json(user.wishlist);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Toggle item in wishlist (Add/Remove)
// @route   POST /api/wishlist/toggle
// @access  Private
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  const user = await User.findById(req.user._id);

  if (user) {
    const isWishlisted = user.wishlist.includes(productId);

    if (isWishlisted) {
      // Remove from wishlist
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
      await user.save();
      res.json({ message: 'Product removed from wishlist', isWishlisted: false });
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
      await user.save();
      res.json({ message: 'Product added to wishlist', isWishlisted: true });
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
