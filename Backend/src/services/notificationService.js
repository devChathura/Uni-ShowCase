const Notification = require('../models/Notification');
const getPaginationOptions = require('../utils/pagination');

class NotificationService {
  async getUserNotifications(user, queryParams = {}) {
    const userId = user._id || user.id;
    const { page, limit } = queryParams;
    const { pageNum, limitNum, skip } = getPaginationOptions(page, limit, 20);

    const total = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    return { notifications, total, unreadCount, page: pageNum, pages: Math.ceil(total / limitNum) };
  }

  async markAsRead(notificationId, user) {
    const userId = user._id || user.id;
    const notification = await Notification.findOne({ _id: notificationId, userId });
    if (!notification) {
      throw new Error('Notification not found');
    }
    notification.isRead = true;
    await notification.save();
    return notification;
  }

  async markAllRead(user) {
    const userId = user._id || user.id;
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    return { success: true };
  }
}

module.exports = new NotificationService();
