import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  getAdminNotificationHistory,
  deleteNotification
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User notification routes
router.get('/', protect, getUserNotifications);
router.put('/read-all', protect, markAllNotificationsAsRead);
router.put('/:id/read', protect, markNotificationAsRead);

// Admin notification management routes
router.post('/', protect, admin, createNotification);
router.get('/admin/history', protect, admin, getAdminNotificationHistory);
router.delete('/:id', protect, admin, deleteNotification);

export default router;
