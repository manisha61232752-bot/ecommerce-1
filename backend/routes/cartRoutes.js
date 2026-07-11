import express from 'express';
import { getCart, syncCart, clearCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all cart routes

router.route('/')
  .get(getCart)
  .delete(clearCart);

router.post('/sync', syncCart);

export default router;
