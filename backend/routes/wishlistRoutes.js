import express from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all wishlist routes

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

export default router;
