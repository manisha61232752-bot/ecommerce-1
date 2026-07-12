import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import upload from './middleware/uploadMiddleware.js';
import { protect, admin } from './middleware/authMiddleware.js';
import { mockDbMiddleware } from './middleware/mockDbMiddleware.js';

// Route files
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Load environmental variables
dotenv.config();

// Suppress console logs in production environment
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
}

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows images to be fetched from backend domain by frontend
}));

// CORS setup
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Rate Limiting (Applied globally, but higher limit. Auth limits can be more restrictive)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Serve uploads folder as static
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Intercept with mock DB memory fallback if Mongoose is disconnected
app.use(mockDbMiddleware);

// Routes Hookup
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Product Image Upload route
app.post('/api/upload', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }
  // Return the relative filepath
  res.status(201).json({
    message: 'Image uploaded successfully',
    image: `/uploads/${req.file.filename}`
  });
});

// Root Route
app.get('/', (req, res) => {
  res.send('MERN E-Commerce API is running...');
});

// Error handling Middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
