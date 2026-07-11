import Notification from '../models/Notification.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get user notifications (user-specific + global system messages)
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ user: req.user._id }, { user: null }]
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (notification) {
    notification.isRead = true;
    const updated = await notification.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error('Notification not found');
  }
});

// @desc    Mark all notifications as read for current user
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({ message: 'All notifications marked as read' });
});

// @desc    Create and send a notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
export const createNotification = asyncHandler(async (req, res) => {
  const { targetUser, title, message, type } = req.body;

  if (targetUser === 'all') {
    // Broadcast to all registered users
    const allUsers = await User.find({});
    const notificationDocs = allUsers.map(u => ({
      user: u._id,
      title,
      message,
      type: type || 'System'
    }));

    // Create a global marker too
    await Notification.create({
      user: null,
      title,
      message: `${message} (Global Broadcast)`,
      type: type || 'System',
      isRead: true // System marker is read by default
    });

    const created = await Notification.insertMany(notificationDocs);
    res.status(201).json(created);
  } else {
    const created = await Notification.create({
      user: targetUser,
      title,
      message,
      type: type || 'System'
    });
    res.status(201).json(created);
  }
});

// @desc    Get admin notification history
// @route   GET /api/notifications/admin/history
// @access  Private/Admin
export const getAdminNotificationHistory = asyncHandler(async (req, res) => {
  const history = await Notification.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.json(history);
});

// @desc    Delete a notification (Admin only)
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (notification) {
    await notification.deleteOne();
    res.json({ message: 'Notification deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Notification not found');
  }
});
